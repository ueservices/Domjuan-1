const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const os = require('os');
const fs = require('fs').promises;

// Basic health check
router.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'domjuan-platform'
    });
});

// Detailed health check for monitoring
const createDetailedHealthCheck = (botManager) => {
    router.get('/detailed', async (req, res) => {
        try {
            const startTime = Date.now();
            
            // Check bot manager health
            let botStatus = { status: 'unknown', bots: [] };
            try {
                botStatus = await botManager.getHealthStatus();
            } catch (error) {
                logger.error('Bot manager health check failed', { error: error.message });
                botStatus = { status: 'error', error: error.message };
            }
            
            // Check disk space
            let diskSpace = {};
            try {
                const stats = await fs.stat(process.cwd());
                diskSpace = {
                    available: true,
                    path: process.cwd()
                };
            } catch (error) {
                diskSpace = { available: false, error: error.message };
            }
            
            // System information
            const systemInfo = {
                uptime: process.uptime(),
                memory: {
                    used: process.memoryUsage(),
                    system: {
                        total: os.totalmem(),
                        free: os.freemem()
                    }
                },
                cpu: {
                    arch: process.arch,
                    platform: process.platform,
                    loadavg: os.loadavg()
                }
            };
            
            const responseTime = Date.now() - startTime;
            
            const healthData = {
                status: 'OK',
                timestamp: new Date().toISOString(),
                responseTime: `${responseTime}ms`,
                service: 'domjuan-platform',
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                bots: botStatus,
                system: systemInfo,
                disk: diskSpace
            };
            
            // Determine overall health status
            if (botStatus.status === 'error' || !diskSpace.available) {
                healthData.status = 'DEGRADED';
                res.status(503);
            }
            
            logger.info('Detailed health check performed', { 
                status: healthData.status, 
                responseTime,
                ip: req.ip 
            });
            
            res.json(healthData);
            
        } catch (error) {
            logger.error('Health check failed', { error: error.message, ip: req.ip });
            res.status(503).json({
                status: 'ERROR',
                timestamp: new Date().toISOString(),
                error: 'Health check failed',
                message: process.env.NODE_ENV === 'production' ? 
                    'Service temporarily unavailable' : error.message
            });
        }
    });
    
    return router;
};

// Readiness probe (for Kubernetes/Docker)
router.get('/ready', (req, res) => {
    // Check if service is ready to accept traffic
    res.json({ 
        status: 'READY', 
        timestamp: new Date().toISOString() 
    });
});

// Liveness probe (for Kubernetes/Docker)
router.get('/live', (req, res) => {
    // Check if service is alive
    res.json({ 
        status: 'ALIVE', 
        timestamp: new Date().toISOString() 
    });
});

module.exports = { router, createDetailedHealthCheck };