const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');

// Rate limiting configuration
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
    return rateLimit({
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn('Rate limit exceeded', {
                ip: req.ip,
                path: req.path,
                userAgent: req.get('User-Agent')
            });
            res.status(429).json({ error: message });
        }
    });
};

// Different rate limits for different endpoints
const rateLimiters = {
    // General API rate limit
    api: createRateLimiter(15 * 60 * 1000, 100, 'Too many API requests'),
    
    // Stricter limit for payment endpoints
    payment: createRateLimiter(15 * 60 * 1000, 10, 'Too many payment requests'),
    
    // Auth/sensitive endpoints
    auth: createRateLimiter(15 * 60 * 1000, 5, 'Too many authentication attempts'),
    
    // Export endpoints (resource intensive)
    export: createRateLimiter(60 * 60 * 1000, 3, 'Too many export requests')
};

// Validation middleware factory
const createValidation = (validations) => {
    return [
        ...validations,
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.warn('Validation failed', {
                    path: req.path,
                    errors: errors.array(),
                    body: req.body
                });
                return res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
            }
            next();
        }
    ];
};

// Common validation rules
const validationRules = {
    paymentIntent: [
        body('service')
            .isIn(['website', 'ecommerce', 'consultation'])
            .withMessage('Invalid service type'),
        body('amount')
            .isInt({ min: 1 })
            .withMessage('Amount must be a positive integer')
    ],
    
    serviceId: [
        body('serviceId')
            .isAlphanumeric()
            .isLength({ min: 1, max: 50 })
            .withMessage('Invalid service ID')
    ]
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Basic HTML/script tag removal for string inputs
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                 .replace(/<[^>]*>/g, '')
                 .trim();
    };

    // Recursively sanitize object
    const sanitizeObject = (obj) => {
        if (obj === null || typeof obj !== 'object') {
            return typeof obj === 'string' ? sanitizeString(obj) : obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }

        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
    };

    // Sanitize request body
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }

    next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(err.status || 500).json({
        error: 'Internal server error',
        ...(isDevelopment && { details: err.message, stack: err.stack })
    });
};

module.exports = {
    rateLimiters,
    createValidation,
    validationRules,
    sanitizeInput,
    errorHandler
};