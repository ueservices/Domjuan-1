const request = require('supertest');
const app = require('../server');

describe('Server Health and Basic Routes', () => {
  test('GET /health should return status OK', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
  });

  test('GET / should return HTML', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);
    
    expect(response.headers['content-type']).toMatch(/html/);
  });

  test('GET /config.js should return JavaScript configuration', async () => {
    const response = await request(app)
      .get('/config.js')
      .expect(200);
    
    expect(response.headers['content-type']).toBe('application/javascript; charset=utf-8');
    expect(response.text).toContain('STRIPE_PUBLISHABLE_KEY');
  });

  test('GET /api/services should return services configuration', async () => {
    const response = await request(app)
      .get('/api/services')
      .expect(200);
    
    expect(response.body).toHaveProperty('website');
    expect(response.body).toHaveProperty('ecommerce');
    expect(response.body).toHaveProperty('consultation');
    
    // Validate service structure
    expect(response.body.website).toHaveProperty('name');
    expect(response.body.website).toHaveProperty('price');
    expect(response.body.website).toHaveProperty('description');
  });

  test('GET /api/services/:serviceId should return specific service', async () => {
    const response = await request(app)
      .get('/api/services/website')
      .expect(200);
    
    expect(response.body.name).toBe('Website Development');
    expect(response.body.price).toBe(50000);
    expect(response.body.description).toBe('Custom website development');
  });

  test('GET /api/services/:serviceId should return 404 for invalid service', async () => {
    const response = await request(app)
      .get('/api/services/invalid')
      .expect(404);
    
    expect(response.body.error).toBe('Service not found');
  });

  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);
    
    expect(response.body.error).toBe('Not found');
  });
});