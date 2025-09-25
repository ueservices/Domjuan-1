const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { rateLimiters } = require('../middleware/security');

// Apply rate limiting to analytics endpoints
router.use(rateLimiters.api);

/**
 * @swagger
 * /api/analytics/track:
 *   post:
 *     summary: Track user analytics events
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: Event name
 *               data:
 *                 type: object
 *                 description: Event data
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               url:
 *                 type: string
 *               userAgent:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event tracked successfully
 *       400:
 *         description: Invalid event data
 */
router.post('/track', (req, res) => {
    try {
        const { event, data, timestamp, url, userAgent } = req.body;
        
        if (!event) {
            return res.status(400).json({ error: 'Event name is required' });
        }
        
        // Log analytics event
        logger.info('Analytics event tracked', {
            event,
            data,
            timestamp,
            url,
            userAgent,
            ip: req.ip,
            component: 'analytics'
        });
        
        res.json({ success: true, message: 'Event tracked successfully' });
        
    } catch (error) {
        logger.error('Analytics tracking failed', {
            error: error.message,
            body: req.body,
            ip: req.ip
        });
        res.status(500).json({ error: 'Failed to track event' });
    }
});

/**
 * @swagger
 * /api/analytics/stats:
 *   get:
 *     summary: Get analytics statistics
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Analytics statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                 events:
 *                   type: object
 *                 pageViews:
 *                   type: integer
 *                 uniqueVisitors:
 *                   type: integer
 */
router.get('/stats', (req, res) => {
    try {
        const period = req.query.period || 'day';
        
        // In a real implementation, you would query your analytics database
        // For now, return mock data
        const stats = {
            period,
            timestamp: new Date().toISOString(),
            events: {
                page_view: 150,
                payment_success: 5,
                payment_error: 1,
                modal_opened: 25,
                contact_form_submitted: 3
            },
            pageViews: 150,
            uniqueVisitors: 75,
            conversionRate: 0.033,
            revenue: 25000 // in cents
        };
        
        logger.info('Analytics stats requested', {
            period,
            ip: req.ip,
            component: 'analytics'
        });
        
        res.json(stats);
        
    } catch (error) {
        logger.error('Analytics stats failed', {
            error: error.message,
            ip: req.ip
        });
        res.status(500).json({ error: 'Failed to get analytics stats' });
    }
});

module.exports = router;