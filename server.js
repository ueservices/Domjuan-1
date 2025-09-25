const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs').promises;
require('dotenv').config();

// Import custom modules
const logger = require('./config/logger');
const corsOptions = require('./config/cors');
const { sanitizeInput, errorHandler } = require('./middleware/security');
const { specs, swaggerUi, swaggerOptions } = require('./config/swagger');
const BotManager = require('./bots/botManager');

// Import routes
const { router: apiRouter, createBotRoutes } = require('./routes/api');
const paymentsRouter = require('./routes/payments');
const analyticsRouter = require('./routes/analytics');
const backupRouter = require('./routes/backup');
const { router: healthRouter, createDetailedHealthCheck } = require('./routes/health');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// Ensure required directories exist
async function ensureDirectories() {
    const dirs = ['./data', './logs', './backups'];
    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            logger.warn(`Could not create directory ${dir}:`, error.message);
        }
    }
}

// Initialize directories
ensureDirectories().catch(logger.error);

// Initialize bot manager
const botManager = new BotManager();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "https://js.stripe.com"],
            frameSrc: ["https://js.stripe.com"],
            connectSrc: ["'self'", "https://api.stripe.com"]
        }
    }
}));

// CORS with proper configuration
app.use(cors(corsOptions));

// Request logging
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim(), { component: 'http' })
    }
}));

// Body parsing
app.use('/api/payments/webhook', express.raw({ type: 'application/json' })); // Stripe webhook needs raw body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Static files
app.use(express.static('.'));

// API Routes
createBotRoutes(botManager); // Initialize bot routes with manager
app.use('/api', apiRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/backup', backupRouter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// Health checks
createDetailedHealthCheck(botManager); // Initialize detailed health check
app.use('/health', healthRouter);

// Legacy health endpoint (for backward compatibility)
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Configuration endpoint
app.get('/config.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
        window.STRIPE_PUBLISHABLE_KEY = '${process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'}';
    `);
});

// Frontend routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// 404 handler
app.use((req, res) => {
    logger.warn('404 Not Found', { path: req.path, method: req.method, ip: req.ip });
    res.status(404).json({ 
        error: 'Not Found',
        message: 'The requested resource was not found on this server.'
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.IO for real-time bot updates
io.on('connection', (socket) => {
    logger.info('Client connected to WebSocket', { socketId: socket.id });
    
    socket.on('disconnect', () => {
        logger.info('Client disconnected from WebSocket', { socketId: socket.id });
    });
});

// Bot event forwarding to connected clients
botManager.on('botStatusUpdate', (data) => {
    io.emit('botStatusUpdate', data);
});

botManager.on('domainFound', (data) => {
    io.emit('domainFound', data);
});

botManager.on('allBotsStopped', (data) => {
    io.emit('allBotsStopped', data);
});

// Graceful shutdown handling
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
    process.exit(1);
});

async function gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    // Close server
    server.close(() => {
        logger.info('HTTP server closed.');
    });
    
    // Stop all bots
    try {
        await botManager.stopAllBots();
        logger.info('All bots stopped.');
    } catch (error) {
        logger.error('Error stopping bots:', error);
    }
    
    // Close database connections if any
    // Add any cleanup code here
    
    logger.info('Graceful shutdown completed.');
    process.exit(0);
}

// Start server
server.listen(PORT, () => {
    logger.info(`Server started`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        portfolioUrl: `http://localhost:${PORT}`,
        dashboardUrl: `http://localhost:${PORT}/dashboard`
    });
    
    console.log(`Server running on port ${PORT}`);
    console.log(`Portfolio available at http://localhost:${PORT}`);
    console.log(`Bot Dashboard available at http://localhost:${PORT}/dashboard`);
});

module.exports = app;