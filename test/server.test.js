const request = require('supertest');
const { expect } = require('chai');

// Import the app after setting test environment
process.env.NODE_ENV = 'test';
const app = require('../server.js');

describe('Portfolio Website API', function () {
  describe('GET /', function () {
    it('should serve the homepage', function (done) {
      request(app)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });
  });

  describe('GET /health', function () {
    it('should return health status', function (done) {
      request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('status', 'OK');
          expect(res.body).to.have.property('timestamp');
          done();
        });
    });
  });

  describe('GET /api/services', function () {
    it('should return services list', function (done) {
      request(app)
        .get('/api/services')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('website');
          expect(res.body).to.have.property('ecommerce');
          expect(res.body).to.have.property('consultation');
          done();
        });
    });
  });

  describe('GET /api/services/:serviceId', function () {
    it('should return a specific service', function (done) {
      request(app)
        .get('/api/services/website')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('name');
          expect(res.body).to.have.property('price');
          expect(res.body).to.have.property('description');
          done();
        });
    });

    it('should return 404 for non-existent service', function (done) {
      request(app)
        .get('/api/services/nonexistent')
        .expect('Content-Type', /json/)
        .expect(404)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('error', 'Service not found');
          done();
        });
    });
  });

  describe('POST /create-payment-intent', function () {
    it('should validate service and amount', function (done) {
      request(app)
        .post('/create-payment-intent')
        .send({
          service: 'nonexistent',
          amount: 1000
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('error', 'Invalid input parameters');
          done();
        });
    });

    it('should validate amount for valid service', function (done) {
      request(app)
        .post('/create-payment-intent')
        .send({
          service: 'website',
          amount: 1000 // Wrong amount, should be 50000
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('error', 'Invalid service or amount');
          done();
        });
    });
  });
});