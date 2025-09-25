const express = require('express');
const stripe = require('stripe')(
    process.env.STRIPE_SECRET_KEY || 'sk_test_...'
);
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs').promises;
const BotManager = require('./bots/botManager');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

/**
 * Ensure required directories exist for the application
 * Creates data, logs, and backups directories if they don't exist
 */
async function ensureDirectories() {
    const dirs = ['./data', './logs', './backups'];
    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            console.warn(`Could not create directory ${dir}:`, error.message);
        }
    }
}

// Initialize directories
ensureDirectories().catch(console.error);

// Initialize bot manager
const botManager = new BotManager();

// Middleware
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    'https://fonts.googleapis.com'
                ],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                scriptSrc: ["'self'", 'https://js.stripe.com'],
                frameSrc: ['https://js.stripe.com'],
                connectSrc: ["'self'", 'https://api.stripe.com']
            }
        }
    })
);
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Service pricing configuration
const SERVICES = {
    website: {
        name: 'Website Development',
        price: 50000, // $500.00 in cents
        description: 'Custom website development'
    },
    ecommerce: {
        name: 'E-commerce Solutions',
        price: 120000, // $1,200.00 in cents
        description: 'Complete e-commerce platform'
    },
    consultation: {
        name: 'Consultation',
        price: 10000, // $100.00 in cents
        description: 'One-on-one consultation session'
    }
};

// Health check endpoint for monitoring and Docker
app.get('/health', async (req, res) => {
    try {
        const healthStatus = await botManager.getHealthStatus();
        res.status(healthStatus.status === 'healthy' ? 200 : 503).json({
            status: healthStatus.status,
            timestamp: new Date().toISOString(),
            uptime: healthStatus.uptime,
            bots: healthStatus.botsActive + '/' + healthStatus.totalBots,
            memory: healthStatus.memory,
            stats: healthStatus.stats
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Detailed system status endpoint
app.get('/api/status', async (req, res) => {
    try {
        const healthStatus = await botManager.getHealthStatus();
        res.json(healthStatus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bot control endpoints
app.post('/api/restart-bots', (req, res) => {
    try {
        botManager.stopAllBots();
        setTimeout(() => {
            botManager.startAllBots();
            res.json({
                success: true,
                message: 'Bots restarted successfully',
                timestamp: new Date().toISOString()
            });
        }, 2000);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/start-bots', (req, res) => {
    try {
        botManager.startAllBots();
        res.json({
            success: true,
            message: 'Bots started successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/stop-bots', (req, res) => {
    try {
        botManager.stopAllBots();
        res.json({
            success: true,
            message: 'Bots stopped successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Export endpoints for automated data export
app.get('/api/export/json', async (req, res) => {
    try {
        const { jsonPath } = await botManager.exportAllData();
        res.download(
            jsonPath,
            `domjuan-export-${new Date().toISOString().split('T')[0]}.json`
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/export/csv', async (req, res) => {
    try {
        const { csvPath } = await botManager.exportAllData();
        res.download(
            csvPath,
            `domjuan-domains-${new Date().toISOString().split('T')[0]}.csv`
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Serve configuration
app.get('/config.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
        window.STRIPE_PUBLISHABLE_KEY = '${process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'}';
    `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create payment intent
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { service, amount } = req.body;

        // Validate service and amount
        if (!SERVICES[service] || SERVICES[service].price !== amount) {
            return res.status(400).json({ error: 'Invalid service or amount' });
        }

        const serviceInfo = SERVICES[service];

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: serviceInfo.price,
            currency: 'usd',
            metadata: {
                service: service,
                service_name: serviceInfo.name
            },
            description: serviceInfo.description
        });

        res.json({
            client_secret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Payment intent creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Stripe webhook endpoint (for production)
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!', paymentIntent.id);
            // Handle successful payment (e.g., send confirmation email, update database)
            break;
        case 'payment_method.attached':
            const paymentMethod = event.data.object;
            console.log(
                'PaymentMethod was attached to a Customer!',
                paymentMethod.id
            );
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// API endpoints for services
app.get('/api/services', (req, res) => {
    res.json(SERVICES);
});

app.get('/api/services/:serviceId', (req, res) => {
    const service = SERVICES[req.params.serviceId];
    if (!service) {
        return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
});

// API endpoints for bot data
app.get('/api/bots/stats', (req, res) => {
    res.json(botManager.getAllStats());
});

app.get('/api/bots/:botName/status', (req, res) => {
    const status = botManager.getBotStatus(req.params.botName);
    if (!status) {
        return res.status(404).json({ error: 'Bot not found' });
    }
    res.json(status);
});

app.post('/api/bots/start', (req, res) => {
    botManager.startAllBots();
    res.json({ message: 'All bots started', timestamp: new Date() });
});

app.post('/api/bots/stop', (req, res) => {
    botManager.stopAllBots();
    res.json({ message: 'All bots stopped', timestamp: new Date() });
});

// Export data endpoint
app.get('/api/export/:format', (req, res) => {
    const { format } = req.params;
    const stats = botManager.getAllStats();

    if (format === 'json') {
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=bot-data.json'
        );
        res.setHeader('Content-Type', 'application/json');
        res.json(stats);
    } else if (format === 'csv') {
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=bot-data.csv'
        );
        res.setHeader('Content-Type', 'text/csv');

        // Generate CSV data
        let csv =
            'Bot,Status,Domains Scanned,Domains Discovered,Domains Acquired,Errors\n';
        stats.bots.forEach((bot) => {
            csv += `${bot.name},${bot.status.isActive ? 'Active' : 'Inactive'},${bot.status.stats.domainsScanned},${bot.status.stats.domainsDiscovered},${bot.status.stats.domainsAcquired},${bot.status.stats.errors}\n`;
        });
        res.send(csv);
    } else {
        res.status(400).json({ error: 'Invalid format. Use json or csv' });
    }
});

// Error handling middleware
app.use((err, req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected to dashboard');

    // Send current stats on connection
    socket.emit('stats', botManager.getAllStats());

    socket.on('startBots', () => {
        botManager.startAllBots();
    });

    socket.on('stopBots', () => {
        botManager.stopAllBots();
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected from dashboard');
    });
});

// Bot event handlers for real-time updates
botManager.on('discovery', (data) => {
    io.emit('discovery', data);
});

botManager.on('acquisition', (data) => {
    io.emit('acquisition', data);
});

botManager.on('status', (data) => {
    io.emit('status', data);
});

botManager.on('allBotsStarted', (data) => {
    io.emit('allBotsStarted', data);
});

botManager.on('allBotsStopped', (data) => {
    io.emit('allBotsStopped', data);
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Portfolio available at http://localhost:${PORT}`);
    console.log(
        `Bot Dashboard available at http://localhost:${PORT}/dashboard`
    );
});

module.exports = app;
