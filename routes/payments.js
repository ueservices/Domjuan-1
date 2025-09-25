const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_...');
const router = express.Router();
const logger = require('../config/logger');
const { rateLimiters, createValidation, validationRules } = require('../middleware/security');
const { SERVICES } = require('./api');

// Apply payment-specific rate limiting
router.use(rateLimiters.payment);

// Create payment intent with validation
router.post('/create-payment-intent', 
    createValidation(validationRules.paymentIntent),
    async (req, res) => {
        try {
            const { service, amount } = req.body;
            
            // Validate service and amount match
            if (!SERVICES[service] || SERVICES[service].price !== amount) {
                logger.warn('Invalid payment attempt', { 
                    service, 
                    amount, 
                    expectedAmount: SERVICES[service]?.price,
                    ip: req.ip 
                });
                return res.status(400).json({ error: 'Invalid service or amount' });
            }
            
            const serviceInfo = SERVICES[service];
            
            // Create PaymentIntent with Stripe
            const paymentIntent = await stripe.paymentIntents.create({
                amount: serviceInfo.price,
                currency: 'usd',
                description: serviceInfo.description,
                metadata: {
                    service: service,
                    service_name: serviceInfo.name
                }
            });
            
            logger.info('Payment intent created', {
                paymentIntentId: paymentIntent.id,
                service,
                amount: serviceInfo.price,
                ip: req.ip
            });
            
            res.json({
                clientSecret: paymentIntent.client_secret,
                amount: serviceInfo.price,
                service: serviceInfo.name
            });
            
        } catch (error) {
            logger.error('Payment intent creation failed', {
                error: error.message,
                service: req.body.service,
                amount: req.body.amount,
                ip: req.ip
            });
            
            res.status(500).json({ 
                error: 'Payment processing error',
                message: process.env.NODE_ENV === 'production' ? 'Unable to process payment' : error.message
            });
        }
    }
);

// Stripe webhook endpoint
router.post('/webhook', 
    express.raw({ type: 'application/json' }),
    (req, res) => {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        let event;
        
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            logger.error('Webhook signature verification failed', {
                error: err.message,
                ip: req.ip
            });
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                logger.info('Payment succeeded', {
                    paymentIntentId: paymentIntent.id,
                    amount: paymentIntent.amount,
                    service: paymentIntent.metadata.service
                });
                
                // Handle successful payment (e.g., send confirmation email, update database)
                // Add your business logic here
                break;
                
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                logger.warn('Payment failed', {
                    paymentIntentId: failedPayment.id,
                    amount: failedPayment.amount,
                    service: failedPayment.metadata.service,
                    error: failedPayment.last_payment_error?.message
                });
                break;
                
            case 'payment_method.attached':
                const paymentMethod = event.data.object;
                logger.info('Payment method attached', {
                    paymentMethodId: paymentMethod.id
                });
                break;
                
            default:
                logger.info('Unhandled webhook event', { eventType: event.type });
        }
        
        res.json({ received: true });
    }
);

module.exports = router;