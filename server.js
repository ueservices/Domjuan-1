const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_...');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Import autonomous domain bot
const AutonomousDomainBot = require('./bot/core');
const botConfig = require('./bot/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the autonomous domain bot
const bot = new AutonomousDomainBot(botConfig.bot);

// Middleware
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
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Service pricing configuration - Now focused on domain bot services
const SERVICES = {
    'domain-bot': {
        name: 'Autonomous Domain Discovery Bot',
        price: 50000, // $500.00 in cents
        description: 'Full autonomous domain and digital asset discovery service'
    },
    'custom-scan': {
        name: 'Custom Domain Scanning',
        price: 120000, // $1,200.00 in cents
        description: 'Targeted domain scanning with custom parameters'
    },
    'asset-analysis': {
        name: 'Digital Asset Analysis',
        price: 10000, // $100.00 in cents
        description: 'In-depth analysis of discovered digital assets'
    }
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve configuration
app.get('/config.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
        window.STRIPE_PUBLISHABLE_KEY = '${process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'}';
    `);
});

// Bot API endpoints
app.get('/api/bot/status', (req, res) => {
    res.json(bot.getStatus());
});

app.post('/api/bot/start', async (req, res) => {
    try {
        await bot.start();
        res.json({ success: true, message: 'Bot started successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/bot/stop', async (req, res) => {
    try {
        await bot.stop();
        res.json({ success: true, message: 'Bot stopped successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/bot/scan', async (req, res) => {
    try {
        await bot.runDiscoverySession();
        res.json({ success: true, message: 'Discovery session initiated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/bot/discoveries', (req, res) => {
    const status = bot.getStatus();
    res.json({
        domains: Array.from(bot.discoveries?.domains?.values() || []),
        assets: Array.from(bot.discoveries?.assets?.values() || []),
        currencies: Array.from(bot.discoveries?.currencies?.values() || []),
        summary: status.discoveries
    });
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
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
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
            console.log('PaymentMethod was attached to a Customer!', paymentMethod.id);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({received: true});
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Autonomous Domain Discovery Bot available at http://localhost:${PORT}`);
    
    // Start the bot automatically in production
    if (process.env.NODE_ENV === 'production' && process.env.AUTO_START_BOT === 'true') {
        try {
            await bot.start();
            console.log('Bot started automatically');
        } catch (error) {
            console.error('Failed to auto-start bot:', error.message);
        }
    }
});

module.exports = app;