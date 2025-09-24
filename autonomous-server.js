/**
 * Autonomous Digital Asset and Domain Discovery System
 * Main server orchestrating the three autonomous bots with real-time dashboard
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io')
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Import bot system
const BotOrchestrator = require('./bots/core/BotOrchestrator');
const DomainHunterBot = require('./bots/implementations/DomainHunterBot');
const AssetSeekerBot = require('./bots/implementations/AssetSeekerBot');
const RecursiveExplorerBot = require('./bots/implementations/RecursiveExplorerBot');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Setup CORS for dashboard
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'", "ws:", "wss:"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));

app.use(cors());
app.use(express.json());
app.use(express.static('dashboard/public'));

// Initialize bot orchestrator and bots
const orchestrator = new BotOrchestrator();
let domainHunter, assetSeeker, recursiveExplorer;
let systemStatus = 'initializing';

// Real-time dashboard setup
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Dashboard route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard/public/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        systemStatus: systemStatus,
        botsRegistered: orchestrator.bots.size
    });
});

// System status API
app.get('/api/status', (req, res) => {
    const status = orchestrator.getStatus();
    res.json({
        ...status,
        systemStatus: systemStatus,
        timestamp: new Date().toISOString()
    });
});

// Bot control endpoints
app.post('/api/bots/start', async (req, res) => {
    try {
        await orchestrator.startAutonomousOperations();
        systemStatus = 'running';
        
        // Broadcast status update
        io.emit('system-status-update', { status: systemStatus, timestamp: new Date().toISOString() });
        
        res.json({ success: true, message: 'Autonomous operations started' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/bots/stop', async (req, res) => {
    try {
        await orchestrator.stopAutonomousOperations();
        systemStatus = 'stopped';
        
        // Broadcast status update
        io.emit('system-status-update', { status: systemStatus, timestamp: new Date().toISOString() });
        
        res.json({ success: true, message: 'Autonomous operations stopped' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Deep Whisper scan endpoint (the secret advanced feature)
app.post('/api/deep-whisper', async (req, res) => {
    try {
        const { discovery } = req.body;
        
        if (!discovery) {
            return res.status(400).json({ error: 'Discovery data required for Deep Whisper scan' });
        }
        
        console.log('🕵️ Manual Deep Whisper scan triggered...');
        
        // Trigger deep whisper scan through orchestrator
        await orchestrator.triggerDeepWhisperScan(discovery);
        
        res.json({ 
            success: true, 
            message: 'Deep Whisper scan initiated',
            scanId: `dw-${Date.now()}`,
            disclaimer: 'Advanced AI correlation detection activated. Results will appear in real-time dashboard.'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Discovery feed endpoint
app.get('/api/discoveries', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const type = req.query.type;
    
    // Get recent discoveries from orchestrator
    // This would be implemented to return actual discovery history
    res.json({
        discoveries: [],
        total: 0,
        limit: limit,
        type: type
    });
});

// Bot metrics endpoint
app.get('/api/metrics', (req, res) => {
    const status = orchestrator.getStatus();
    const botMetrics = {};
    
    for (const [botId, botStatus] of Object.entries(status.bots)) {
        botMetrics[botId] = {
            id: botId,
            type: botStatus.type,
            status: botStatus.status,
            uptime: botStatus.uptime,
            metrics: botStatus.metrics,
            health: botStatus.health
        };
    }
    
    res.json({
        systemMetrics: status.metrics,
        botMetrics: botMetrics,
        timestamp: new Date().toISOString()
    });
});

// Real-time event handling
io.on('connection', (socket) => {
    console.log('Dashboard client connected:', socket.id);
    
    // Send current system status
    socket.emit('system-status-update', {
        status: systemStatus,
        orchestratorStatus: orchestrator.getStatus(),
        timestamp: new Date().toISOString()
    });
    
    socket.on('disconnect', () => {
        console.log('Dashboard client disconnected:', socket.id);
    });
    
    socket.on('request-status-update', () => {
        socket.emit('system-status-update', {
            status: systemStatus,
            orchestratorStatus: orchestrator.getStatus(),
            timestamp: new Date().toISOString()
        });
    });
});

// Set up orchestrator event listeners for real-time updates
function setupRealTimeUpdates() {
    // Bot registration events
    orchestrator.on('bot-registered', (data) => {
        io.emit('bot-registered', {
            ...data,
            timestamp: new Date().toISOString()
        });
    });
    
    // Discovery events
    orchestrator.on('discovery', (data) => {
        console.log(`📡 Broadcasting discovery: ${data.discovery.type} from ${data.botId}`);
        io.emit('new-discovery', {
            ...data,
            timestamp: new Date().toISOString()
        });
    });
    
    // Deep Whisper scan events
    orchestrator.on('deep-whisper-scan', (data) => {
        console.log('🌟 Broadcasting Deep Whisper scan results');
        io.emit('deep-whisper-result', {
            ...data,
            timestamp: new Date().toISOString(),
            message: 'Advanced AI correlation detection complete - hidden treasures revealed!'
        });
    });
    
    // Bot status changes
    orchestrator.on('bot-status-change', (data) => {
        io.emit('bot-status-change', {
            ...data,
            timestamp: new Date().toISOString()
        });
    });
    
    // Collaboration events
    orchestrator.on('collaboration', (data) => {
        io.emit('bot-collaboration', {
            ...data,
            timestamp: new Date().toISOString()
        });
    });
    
    // System operation events
    orchestrator.on('operations-started', () => {
        io.emit('operations-started', {
            message: 'Autonomous bot operations are now running',
            timestamp: new Date().toISOString()
        });
    });
    
    orchestrator.on('operations-stopped', () => {
        io.emit('operations-stopped', {
            message: 'Autonomous bot operations have been stopped',
            timestamp: new Date().toISOString()
        });
    });
    
    // Bot error events
    orchestrator.on('bot-error', (data) => {
        io.emit('bot-error', {
            ...data,
            timestamp: new Date().toISOString()
        });
    });
    
    // Healing events
    orchestrator.on('bot-healing-failed', (data) => {
        io.emit('bot-healing-failed', {
            ...data,
            timestamp: new Date().toISOString()
        });
    });
}

// Initialize the autonomous bot system
async function initializeSystem() {
    try {
        console.log('🚀 Initializing Autonomous Digital Asset and Domain Discovery System...');
        
        // Create bot instances
        domainHunter = new DomainHunterBot('domain-hunter-001');
        assetSeeker = new AssetSeekerBot('asset-seeker-001');  
        recursiveExplorer = new RecursiveExplorerBot('recursive-explorer-001');
        
        console.log('✅ Bot instances created');
        
        // Register bots with orchestrator
        await orchestrator.registerBot(domainHunter);
        await orchestrator.registerBot(assetSeeker);
        await orchestrator.registerBot(recursiveExplorer);
        
        console.log('✅ Bots registered with orchestrator');
        
        // Load persistent state
        await orchestrator.loadPersistentState();
        
        console.log('✅ Persistent state loaded');
        
        // Setup real-time updates
        setupRealTimeUpdates();
        
        console.log('✅ Real-time updates configured');
        
        systemStatus = 'ready';
        
        console.log('🎯 System initialized successfully. Ready for autonomous operations.');
        console.log('💡 Available bots:');
        console.log('   🎯 Domain Hunter - Scans registries and marketplaces for domain opportunities');
        console.log('   🔍 Asset Seeker - Discovers digital assets and analyzes correlations with ML');
        console.log('   🌊 Recursive Explorer - Performs deep boundary-pushing exploration');
        console.log('   🕵️ Deep Whisper - Advanced AI correlation detection (activate via API or dashboard)');
        
    } catch (error) {
        console.error('❌ System initialization failed:', error);
        systemStatus = 'error';
        throw error;
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    
    try {
        if (systemStatus === 'running') {
            await orchestrator.stopAutonomousOperations();
        }
        
        server.close(() => {
            console.log('✅ Server shut down gracefully');
            process.exit(0);
        });
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    
    try {
        if (systemStatus === 'running') {
            await orchestrator.stopAutonomousOperations();
        }
        
        server.close(() => {
            console.log('✅ Server shut down gracefully');
            process.exit(0);
        });
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start the server and initialize the system
server.listen(PORT, async () => {
    console.log(`🌐 Autonomous Discovery System running on port ${PORT}`);
    console.log(`📊 Dashboard available at http://localhost:${PORT}`);
    console.log(`🔌 WebSocket connection ready for real-time updates`);
    
    try {
        await initializeSystem();
    } catch (error) {
        console.error('💥 Failed to initialize system:', error);
        process.exit(1);
    }
});

module.exports = { app, server, orchestrator };