const request = require('supertest');
const app = require('../server');

// Mock Stripe to avoid network calls in tests
jest.mock('stripe', () => {
  return jest.fn(() => ({
    paymentIntents: {
      create: jest.fn(async (params) => {
        // Mock successful payment intent creation
        if (params.amount && params.currency && params.metadata) {
          return {
            id: 'pi_test123',
            client_secret: 'pi_test123_secret_test'
          };
        }
        throw new Error('Invalid parameters');
      })
    },
    webhooks: {
      constructEvent: jest.fn(() => {
        throw new Error('No stripe-signature header value was provided');
      })
    }
  }));
});

describe('Payment Processing', () => {
  describe('POST /create-payment-intent', () => {
    test('should create payment intent for valid service', async () => {
      const paymentData = {
        service: 'website',
        amount: 50000
      };

      const response = await request(app)
        .post('/create-payment-intent')
        .send(paymentData)
        .expect(200);

      expect(response.body).toHaveProperty('client_secret');
      expect(response.body.client_secret).toMatch(/^pi_/);
    });

    test('should reject invalid service', async () => {
      const paymentData = {
        service: 'invalid_service',
        amount: 50000
      };

      const response = await request(app)
        .post('/create-payment-intent')
        .send(paymentData)
        .expect(400);

      expect(response.body.error).toBe('Invalid service or amount');
    });

    test('should reject incorrect amount for service', async () => {
      const paymentData = {
        service: 'website',
        amount: 99999 // Wrong amount for website service
      };

      const response = await request(app)
        .post('/create-payment-intent')
        .send(paymentData)
        .expect(400);

      expect(response.body.error).toBe('Invalid service or amount');
    });

    test('should reject missing service', async () => {
      const paymentData = {
        amount: 50000
      };

      const response = await request(app)
        .post('/create-payment-intent')
        .send(paymentData)
        .expect(400);

      expect(response.body.error).toBe('Invalid service or amount');
    });

    test('should reject missing amount', async () => {
      const paymentData = {
        service: 'website'
      };

      const response = await request(app)
        .post('/create-payment-intent')
        .send(paymentData)
        .expect(400);

      expect(response.body.error).toBe('Invalid service or amount');
    });

    test('should handle all service types correctly', async () => {
      const services = [
        { service: 'website', amount: 50000 },
        { service: 'ecommerce', amount: 120000 },
        { service: 'consultation', amount: 10000 }
      ];

      for (const serviceData of services) {
        const response = await request(app)
          .post('/create-payment-intent')
          .send(serviceData)
          .expect(200);

        expect(response.body).toHaveProperty('client_secret');
        expect(response.body.client_secret).toMatch(/^pi_/);
      }
    });
  });

  describe('POST /webhook', () => {
    test('should handle webhook without signature (basic test)', async () => {
      const webhookData = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123'
          }
        }
      };

      // This will fail signature verification as expected
      const response = await request(app)
        .post('/webhook')
        .send(webhookData)
        .expect(400);

      // The endpoint should handle the error gracefully with text response
      expect(response.text).toContain('Webhook Error');
      expect(response.text).toContain('No stripe-signature header value was provided');
    });
  });
});