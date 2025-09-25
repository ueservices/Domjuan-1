const request = require('supertest');
const express = require('express');
const { router: healthRouter, createDetailedHealthCheck } = require('../routes/health');

// Mock bot manager for testing
const mockBotManager = {
    getHealthStatus: jest.fn()
};

describe('Health Endpoints', () => {
    let app;
    
    beforeEach(() => {
        app = express();
        app.use(express.json());
        
        // Create detailed health check with mock bot manager
        createDetailedHealthCheck(mockBotManager);
        app.use('/health', healthRouter);
        
        jest.clearAllMocks();
    });
    
    describe('GET /health', () => {
        it('should return basic health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);
                
            expect(response.body).toMatchObject({
                status: 'OK',
                service: 'domjuan-platform'
            });
            expect(response.body).toHaveProperty('timestamp');
        });
    });
    
    describe('GET /health/ready', () => {
        it('should return readiness status', async () => {
            const response = await request(app)
                .get('/health/ready')
                .expect(200);
                
            expect(response.body).toMatchObject({
                status: 'READY'
            });
            expect(response.body).toHaveProperty('timestamp');
        });
    });
    
    describe('GET /health/live', () => {
        it('should return liveness status', async () => {
            const response = await request(app)
                .get('/health/live')
                .expect(200);
                
            expect(response.body).toMatchObject({
                status: 'ALIVE'
            });
            expect(response.body).toHaveProperty('timestamp');
        });
    });
    
    describe('GET /health/detailed', () => {
        it('should return detailed health information when all systems are healthy', async () => {
            mockBotManager.getHealthStatus.mockResolvedValue({
                status: 'healthy',
                bots: []
            });
            
            const response = await request(app)
                .get('/health/detailed')
                .expect(200);
                
            expect(response.body).toMatchObject({
                status: 'OK',
                service: 'domjuan-platform',
                environment: 'test'
            });
            
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('responseTime');
            expect(response.body).toHaveProperty('bots');
            expect(response.body).toHaveProperty('system');
            expect(response.body).toHaveProperty('disk');
        });
        
        it('should return degraded status when bot manager has errors', async () => {
            mockBotManager.getHealthStatus.mockRejectedValue(new Error('Bot manager connection failed'));
            
            const response = await request(app)
                .get('/health/detailed')
                .expect(503);
                
            expect(response.body).toMatchObject({
                status: 'DEGRADED'
            });
            
            expect(response.body.bots).toMatchObject({
                status: 'error',
                error: 'Bot manager connection failed'
            });
        });
        
        it('should handle complete health check failure', async () => {
            // Mock a critical system failure
            mockBotManager.getHealthStatus.mockImplementation(() => {
                throw new Error('Critical system failure');
            });
            
            const response = await request(app)
                .get('/health/detailed')
                .expect(503);
                
            // The health check should return DEGRADED when bot manager fails
            expect(response.body).toMatchObject({
                status: 'DEGRADED'
            });
        });
        
        it('should include system information in response', async () => {
            mockBotManager.getHealthStatus.mockResolvedValue({
                status: 'healthy',
                bots: []
            });
            
            const response = await request(app)
                .get('/health/detailed')
                .expect(200);
                
            expect(response.body.system).toHaveProperty('uptime');
            expect(response.body.system).toHaveProperty('memory');
            expect(response.body.system).toHaveProperty('cpu');
            expect(response.body.system.memory).toHaveProperty('used');
            expect(response.body.system.memory).toHaveProperty('system');
        });
    });
});