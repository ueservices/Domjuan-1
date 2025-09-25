/**
 * Basic server tests demonstrating testing best practices
 */
const request = require('supertest');

// Mock the bot manager to avoid starting actual bots in tests
jest.mock('../bots/botManager', () => {
    const EventEmitter = require('events');
    return jest.fn().mockImplementation(() => {
        const mockBot = new EventEmitter();
        mockBot.initialize = jest.fn();
        mockBot.startAllBots = jest.fn();
        mockBot.stopAllBots = jest.fn();
        mockBot.getHealthStatus = jest.fn().mockResolvedValue({
            status: 'healthy',
            uptime: 1000,
            botsActive: 3,
            totalBots: 3,
            stats: { totalDomains: 0 },
            memory: { used: 50, total: 100 }
        });
        return mockBot;
    });
});

// Import server after mocking
const app = require('../server');

describe('Server Health Endpoints', () => {
    beforeAll(() => {
        // Set up server but don't start listening
        process.env.NODE_ENV = 'test';
    });

    afterAll((done) => {
        // Clean up any timers or intervals
        setTimeout(done, 100);
    });

    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('timestamp');
        });

        it('should return JSON content type', async () => {
            const response = await request(app).get('/health');

            expect(response.headers['content-type']).toMatch(/json/);
        });
    });

    describe('GET /config.js', () => {
        it('should return JavaScript configuration', async () => {
            const response = await request(app).get('/config.js');

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/javascript/);
            expect(response.text).toContain('STRIPE_PUBLISHABLE_KEY');
        });
    });

    describe('GET /api/services', () => {
        it('should return available services', async () => {
            const response = await request(app).get('/api/services');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('website');
            expect(response.body).toHaveProperty('ecommerce');
            expect(response.body).toHaveProperty('consultation');
        });

        it('should return services with correct structure', async () => {
            const response = await request(app).get('/api/services');

            const service = response.body.website;
            expect(service).toHaveProperty('name');
            expect(service).toHaveProperty('price');
            expect(service).toHaveProperty('description');
            expect(typeof service.price).toBe('number');
        });
    });

    describe('Static File Serving', () => {
        it('should serve the main index page', async () => {
            const response = await request(app).get('/');

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/html/);
        });

        it('should serve the dashboard page', async () => {
            const response = await request(app).get('/dashboard.html');

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/html/);
        });
    });

    describe('Security Headers', () => {
        it('should include security headers', async () => {
            const response = await request(app).get('/health');

            expect(response.headers).toHaveProperty('x-content-type-options');
            expect(response.headers).toHaveProperty('x-frame-options');
        });
    });
});

describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
        const response = await request(app).get('/non-existent-route');

        expect(response.status).toBe(404);
    });

    it('should handle invalid service requests', async () => {
        const response = await request(app).get(
            '/api/services/invalid-service'
        );

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error');
    });
});
