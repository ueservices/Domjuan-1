const request = require('supertest');
const app = require('./server');

describe('Portfolio Website API', () => {
    describe('Health Check', () => {
        test('GET /health should return OK status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body.status).toBe('OK');
            expect(response.body.timestamp).toBeDefined();
        });
    });

    describe('Static Routes', () => {
        test('GET / should serve index.html', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.headers['content-type']).toMatch(/html/);
        });

        test('GET /config.js should serve configuration', async () => {
            const response = await request(app)
                .get('/config.js')
                .expect(200);

            expect(response.headers['content-type']).toMatch(/javascript/);
            expect(response.text).toContain('STRIPE_PUBLISHABLE_KEY');
        });
    });

    describe('API Routes', () => {
        test('GET /api/services should return all services', async () => {
            const response = await request(app)
                .get('/api/services')
                .expect(200);

            expect(response.body).toHaveProperty('website');
            expect(response.body).toHaveProperty('ecommerce');
            expect(response.body).toHaveProperty('consultation');

            expect(response.body.website.price).toBe(50000);
            expect(response.body.ecommerce.price).toBe(120000);
            expect(response.body.consultation.price).toBe(10000);
        });

        test('GET /api/services/:serviceId should return specific service', async () => {
            const response = await request(app)
                .get('/api/services/website')
                .expect(200);

            expect(response.body.name).toBe('Website Development');
            expect(response.body.price).toBe(50000);
        });

        test('GET /api/services/:serviceId should return 404 for invalid service', async () => {
            const response = await request(app)
                .get('/api/services/invalid')
                .expect(404);

            expect(response.body.error).toBe('Service not found');
        });
    });

    describe('Payment Intent Creation', () => {
        test('POST /create-payment-intent should validate service and amount', async () => {
            const response = await request(app)
                .post('/create-payment-intent')
                .send({
                    service: 'invalid',
                    amount: 50000
                })
                .expect(400);

            expect(response.body.error).toBe('Invalid service or amount');
        });

        test('POST /create-payment-intent should validate amount for valid service', async () => {
            const response = await request(app)
                .post('/create-payment-intent')
                .send({
                    service: 'website',
                    amount: 99999 // Wrong amount
                })
                .expect(400);

            expect(response.body.error).toBe('Invalid service or amount');
        });
    });

    describe('Error Handling', () => {
        test('GET /nonexistent should return 404', async () => {
            const response = await request(app)
                .get('/nonexistent')
                .expect(404);

            expect(response.body.error).toBe('Not found');
        });
    });
});
