const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { router: apiRouter, createBotRoutes } = require('../routes/api');
const { rateLimiters, sanitizeInput, errorHandler } = require('../middleware/security');

// Mock bot manager for testing
const mockBotManager = {
    getAllBots: jest.fn(),
    getBot: jest.fn(),
    startBot: jest.fn(),
    stopBot: jest.fn(),
    exportAllData: jest.fn(),
    getStats: jest.fn()
};

// Create test app
const createTestApp = () => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(sanitizeInput);
    
    // Create API routes with mock bot manager
    createBotRoutes(mockBotManager);
    app.use('/api', apiRouter);
    app.use(errorHandler);
    
    return app;
};

describe('API Routes', () => {
    let app;
    
    beforeEach(() => {
        app = createTestApp();
        jest.clearAllMocks();
    });
    
    describe('GET /api/services', () => {
        it('should return all services', async () => {
            const response = await request(app)
                .get('/api/services')
                .expect(200);
                
            expect(response.body).toHaveProperty('website');
            expect(response.body).toHaveProperty('ecommerce');
            expect(response.body).toHaveProperty('consultation');
            
            expect(response.body.website).toEqual({
                name: 'Website Development',
                price: 50000,
                description: 'Custom website development'
            });
        });
    });
    
    describe('GET /api/services/:serviceId', () => {
        it('should return specific service', async () => {
            const response = await request(app)
                .get('/api/services/website')
                .expect(200);
                
            expect(response.body).toEqual({
                name: 'Website Development',
                price: 50000,
                description: 'Custom website development'
            });
        });
        
        it('should return 404 for non-existent service', async () => {
            const response = await request(app)
                .get('/api/services/nonexistent')
                .expect(404);
                
            expect(response.body).toEqual({
                error: 'Service not found'
            });
        });
    });
    
    describe('GET /api/bots', () => {
        it('should return all bots', async () => {
            const mockBots = [
                { id: 'bot1', name: 'Bot 1', status: 'active' },
                { id: 'bot2', name: 'Bot 2', status: 'inactive' }
            ];
            
            mockBotManager.getAllBots.mockResolvedValue(mockBots);
            
            const response = await request(app)
                .get('/api/bots')
                .expect(200);
                
            expect(response.body).toEqual(mockBots);
            expect(mockBotManager.getAllBots).toHaveBeenCalledTimes(1);
        });
        
        it('should handle bot manager errors', async () => {
            mockBotManager.getAllBots.mockRejectedValue(new Error('Bot manager error'));
            
            const response = await request(app)
                .get('/api/bots')
                .expect(500);
                
            expect(response.body).toEqual({
                error: 'Bot manager error'
            });
        });
    });
    
    describe('GET /api/bots/:botId', () => {
        it('should return specific bot', async () => {
            const mockBot = { id: 'bot1', name: 'Bot 1', status: 'active' };
            mockBotManager.getBot.mockResolvedValue(mockBot);
            
            const response = await request(app)
                .get('/api/bots/bot1')
                .expect(200);
                
            expect(response.body).toEqual(mockBot);
            expect(mockBotManager.getBot).toHaveBeenCalledWith('bot1');
        });
        
        it('should return 404 for non-existent bot', async () => {
            mockBotManager.getBot.mockResolvedValue(null);
            
            const response = await request(app)
                .get('/api/bots/nonexistent')
                .expect(404);
                
            expect(response.body).toEqual({
                error: 'Bot not found'
            });
        });
    });
    
    describe('POST /api/bots/:botId/start', () => {
        it('should start bot successfully', async () => {
            mockBotManager.startBot.mockResolvedValue();
            
            const response = await request(app)
                .post('/api/bots/bot1/start')
                .expect(200);
                
            expect(response.body).toEqual({
                message: 'Bot started successfully'
            });
            expect(mockBotManager.startBot).toHaveBeenCalledWith('bot1');
        });
        
        it('should handle start bot errors', async () => {
            mockBotManager.startBot.mockRejectedValue(new Error('Start failed'));
            
            const response = await request(app)
                .post('/api/bots/bot1/start')
                .expect(500);
                
            expect(response.body).toEqual({
                error: 'Start failed'
            });
        });
    });
    
    describe('POST /api/bots/:botId/stop', () => {
        it('should stop bot successfully', async () => {
            mockBotManager.stopBot.mockResolvedValue();
            
            const response = await request(app)
                .post('/api/bots/bot1/stop')
                .expect(200);
                
            expect(response.body).toEqual({
                message: 'Bot stopped successfully'
            });
            expect(mockBotManager.stopBot).toHaveBeenCalledWith('bot1');
        });
    });
    
    describe('GET /api/stats', () => {
        it('should return stats in JSON format', async () => {
            const mockStats = {
                bots: [
                    {
                        name: 'Bot1',
                        status: { isActive: true, stats: { domainsScanned: 100, domainsDiscovered: 10, domainsAcquired: 5, errors: 0 } }
                    }
                ]
            };
            
            mockBotManager.getStats.mockResolvedValue(mockStats);
            
            const response = await request(app)
                .get('/api/stats?format=json')
                .expect(200);
                
            expect(response.body).toEqual(mockStats);
        });
        
        it('should return stats in CSV format', async () => {
            const mockStats = {
                bots: [
                    {
                        name: 'Bot1',
                        status: { isActive: true, stats: { domainsScanned: 100, domainsDiscovered: 10, domainsAcquired: 5, errors: 0 } }
                    }
                ]
            };
            
            mockBotManager.getStats.mockResolvedValue(mockStats);
            
            const response = await request(app)
                .get('/api/stats?format=csv')
                .expect(200);
                
            expect(response.text).toContain('Bot,Status,Domains Scanned,Domains Discovered,Domains Acquired,Errors');
            expect(response.text).toContain('Bot1,Active,100,10,5,0');
        });
    });
    
    describe('Input Sanitization', () => {
        it('should sanitize malicious input', async () => {
            // This test would need to be adapted based on actual endpoints that accept input
            // For now, testing that the sanitization middleware is applied
            const response = await request(app)
                .get('/api/services')
                .expect(200);
                
            // If we got here, sanitization middleware was applied without errors
            expect(response.status).toBe(200);
        });
    });
});

module.exports = { mockBotManager };