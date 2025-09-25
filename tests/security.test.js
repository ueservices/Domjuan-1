const request = require('supertest');
const express = require('express');
const { rateLimiters, sanitizeInput, createValidation, validationRules, errorHandler } = require('../middleware/security');

describe('Security Middleware', () => {
    let app;
    
    beforeEach(() => {
        app = express();
        app.use(express.json());
    });
    
    describe('Input Sanitization', () => {
        beforeEach(() => {
            app.use(sanitizeInput);
            app.post('/test', (req, res) => {
                res.json({ body: req.body, query: req.query });
            });
        });
        
        it('should sanitize script tags from request body', async () => {
            const maliciousInput = {
                name: '<script>alert("xss")</script>John',
                description: 'Hello <script src="evil.js"></script> World'
            };
            
            const response = await request(app)
                .post('/test')
                .send(maliciousInput)
                .expect(200);
                
            expect(response.body.body.name).toBe('John');
            expect(response.body.body.description).toBe('Hello  World');
        });
        
        it('should sanitize HTML tags from request body', async () => {
            const htmlInput = {
                content: '<div>Hello <strong>World</strong></div>',
                title: '<h1>Title</h1>'
            };
            
            const response = await request(app)
                .post('/test')
                .send(htmlInput)
                .expect(200);
                
            expect(response.body.body.content).toBe('Hello World');
            expect(response.body.body.title).toBe('Title');
        });
        
        it('should sanitize query parameters', async () => {
            const response = await request(app)
                .post('/test?search=<script>alert(1)</script>&category=<h1>test</h1>')
                .send({})
                .expect(200);
                
            expect(response.body.query.search).toBe('');
            expect(response.body.query.category).toBe('test');
        });
        
        it('should handle nested objects', async () => {
            const nestedInput = {
                user: {
                    name: '<script>evil()</script>John',
                    profile: {
                        bio: 'Hello <iframe>malicious</iframe> World'
                    }
                },
                tags: ['<script>tag1</script>', 'normal tag']
            };
            
            const response = await request(app)
                .post('/test')
                .send(nestedInput)
                .expect(200);
                
            expect(response.body.body.user.name).toBe('John');
            expect(response.body.body.user.profile.bio).toBe('Hello malicious World');
            expect(response.body.body.tags[0]).toBe('');
            expect(response.body.body.tags[1]).toBe('normal tag');
        });
    });
    
    describe('Input Validation', () => {
        it('should validate payment intent data', async () => {
            app.use('/payment', createValidation(validationRules.paymentIntent));
            app.post('/payment', (req, res) => {
                res.json({ success: true });
            });
            
            // Valid input
            const validInput = {
                service: 'website',
                amount: 50000
            };
            
            await request(app)
                .post('/payment')
                .send(validInput)
                .expect(200);
        });
        
        it('should reject invalid service type', async () => {
            app.use('/payment', createValidation(validationRules.paymentIntent));
            app.post('/payment', (req, res) => {
                res.json({ success: true });
            });
            
            const invalidInput = {
                service: 'invalid_service',
                amount: 50000
            };
            
            const response = await request(app)
                .post('/payment')
                .send(invalidInput)
                .expect(400);
                
            expect(response.body).toHaveProperty('error', 'Validation failed');
            expect(response.body).toHaveProperty('details');
            expect(response.body.details).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Invalid service type'
                    })
                ])
            );
        });
        
        it('should reject invalid amount', async () => {
            app.use('/payment', createValidation(validationRules.paymentIntent));
            app.post('/payment', (req, res) => {
                res.json({ success: true });
            });
            
            const invalidInput = {
                service: 'website',
                amount: -100
            };
            
            const response = await request(app)
                .post('/payment')
                .send(invalidInput)
                .expect(400);
                
            expect(response.body.details).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: 'Amount must be a positive integer'
                    })
                ])
            );
        });
        
        it('should reject missing required fields', async () => {
            app.use('/payment', createValidation(validationRules.paymentIntent));
            app.post('/payment', (req, res) => {
                res.json({ success: true });
            });
            
            const response = await request(app)
                .post('/payment')
                .send({})
                .expect(400);
                
            expect(response.body).toHaveProperty('error', 'Validation failed');
            expect(response.body.details.length).toBe(2); // service and amount validation errors
        });
    });
    
    describe('Error Handler', () => {
        beforeEach(() => {
            app.get('/error', (req, res, next) => {
                const error = new Error('Test error');
                error.status = 400;
                next(error);
            });
            
            app.get('/server-error', (req, res, next) => {
                next(new Error('Internal server error'));
            });
            
            app.use(errorHandler);
        });
        
        it('should handle errors with custom status codes', async () => {
            const response = await request(app)
                .get('/error')
                .expect(400);
                
            expect(response.body).toHaveProperty('error', 'Internal server error');
        });
        
        it('should default to 500 status for unspecified errors', async () => {
            const response = await request(app)
                .get('/server-error')
                .expect(500);
                
            expect(response.body).toHaveProperty('error', 'Internal server error');
        });
        
        it('should not leak error details in production', async () => {
            // Mock production environment
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';
            
            const response = await request(app)
                .get('/server-error')
                .expect(500);
                
            expect(response.body).not.toHaveProperty('details');
            expect(response.body).not.toHaveProperty('stack');
            
            // Restore environment
            process.env.NODE_ENV = originalEnv;
        });
    });
    
    describe('Rate Limiting', () => {
        // Note: Rate limiting tests are tricky to implement without timing dependencies
        // These are basic structural tests
        
        it('should have rate limiters defined', () => {
            expect(rateLimiters).toHaveProperty('api');
            expect(rateLimiters).toHaveProperty('payment');
            expect(rateLimiters).toHaveProperty('auth');
            expect(rateLimiters).toHaveProperty('export');
        });
        
        it('should apply rate limiting middleware', async () => {
            app.use(rateLimiters.api);
            app.get('/test', (req, res) => {
                res.json({ success: true });
            });
            
            // First request should succeed
            await request(app)
                .get('/test')
                .expect(200);
        });
    });
});