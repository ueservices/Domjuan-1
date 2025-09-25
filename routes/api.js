const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { rateLimiters, createValidation, validationRules } = require('../middleware/security');

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Service name
 *         price:
 *           type: integer
 *           description: Price in cents
 *         description:
 *           type: string
 *           description: Service description
 */

// Service configuration (moved from server.js)
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

// Apply rate limiting to all API routes
router.use(rateLimiters.api);

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all available services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of all services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 $ref: '#/components/schemas/Service'
 */
// Services endpoints
router.get('/services', (req, res) => {
    logger.info('Services list requested', { ip: req.ip });
    res.json(SERVICES);
});

/**
 * @swagger
 * /api/services/{serviceId}:
 *   get:
 *     summary: Get specific service details
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *           enum: [website, ecommerce, consultation]
 *         description: Service identifier
 *     responses:
 *       200:
 *         description: Service details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/services/:serviceId', (req, res) => {
    const service = SERVICES[req.params.serviceId];
    if (!service) {
        logger.warn('Service not found', { serviceId: req.params.serviceId, ip: req.ip });
        return res.status(404).json({ error: 'Service not found' });
    }
    
    logger.info('Service details requested', { serviceId: req.params.serviceId, ip: req.ip });
    res.json(service);
});

// Bot data endpoints (require bot manager to be passed in)
const createBotRoutes = (botManager) => {
    router.get('/bots', async (req, res) => {
        try {
            const bots = await botManager.getAllBots();
            logger.info('Bot list requested', { ip: req.ip, botCount: bots.length });
            res.json(bots);
        } catch (error) {
            logger.error('Failed to get bots', { error: error.message, ip: req.ip });
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/bots/:botId', async (req, res) => {
        try {
            const bot = await botManager.getBot(req.params.botId);
            if (!bot) {
                return res.status(404).json({ error: 'Bot not found' });
            }
            logger.info('Bot details requested', { botId: req.params.botId, ip: req.ip });
            res.json(bot);
        } catch (error) {
            logger.error('Failed to get bot', { error: error.message, botId: req.params.botId, ip: req.ip });
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/bots/:botId/start', async (req, res) => {
        try {
            await botManager.startBot(req.params.botId);
            logger.info('Bot started', { botId: req.params.botId, ip: req.ip });
            res.json({ message: 'Bot started successfully' });
        } catch (error) {
            logger.error('Failed to start bot', { error: error.message, botId: req.params.botId, ip: req.ip });
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/bots/:botId/stop', async (req, res) => {
        try {
            await botManager.stopBot(req.params.botId);
            logger.info('Bot stopped', { botId: req.params.botId, ip: req.ip });
            res.json({ message: 'Bot stopped successfully' });
        } catch (error) {
            logger.error('Failed to stop bot', { error: error.message, botId: req.params.botId, ip: req.ip });
            res.status(500).json({ error: error.message });
        }
    });

    // Export endpoints with stricter rate limiting
    router.get('/export/json', rateLimiters.export, async (req, res) => {
        try {
            const { jsonPath } = await botManager.exportAllData();
            logger.info('JSON export requested', { ip: req.ip });
            res.download(jsonPath, `domjuan-export-${new Date().toISOString().split('T')[0]}.json`);
        } catch (error) {
            logger.error('JSON export failed', { error: error.message, ip: req.ip });
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/export/csv', rateLimiters.export, async (req, res) => {
        try {
            const { csvPath } = await botManager.exportAllData();
            logger.info('CSV export requested', { ip: req.ip });
            res.download(csvPath, `domjuan-domains-${new Date().toISOString().split('T')[0]}.csv`);
        } catch (error) {
            logger.error('CSV export failed', { error: error.message, ip: req.ip });
            res.status(500).json({ error: error.message });
        }
    });

    // Statistics endpoint
    router.get('/stats', async (req, res) => {
        try {
            const format = req.query.format || 'json';
            const stats = await botManager.getStats();
            
            logger.info('Stats requested', { format, ip: req.ip });

            if (format === 'json') {
                res.setHeader('Content-Type', 'application/json');
                res.json(stats);
            } else if (format === 'csv') {
                res.setHeader('Content-Disposition', 'attachment; filename=bot-data.csv');
                res.setHeader('Content-Type', 'text/csv');
                
                // Generate CSV data
                let csv = 'Bot,Status,Domains Scanned,Domains Discovered,Domains Acquired,Errors\\n';
                stats.bots.forEach(bot => {
                    csv += `${bot.name},${bot.status.isActive ? 'Active' : 'Inactive'},${bot.status.stats.domainsScanned},${bot.status.stats.domainsDiscovered},${bot.status.stats.domainsAcquired},${bot.status.stats.errors}\\n`;
                });
                res.send(csv);
            } else {
                res.status(400).json({ error: 'Invalid format. Use json or csv' });
            }
        } catch (error) {
            logger.error('Failed to get stats', { error: error.message, ip: req.ip });
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};

module.exports = { router, createBotRoutes, SERVICES };