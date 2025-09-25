const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Domjuan Domain Acquisition Platform API',
            version: '1.0.0',
            description: 'A comprehensive API for managing domain acquisition bots and payment processing',
            contact: {
                name: 'Domjuan Platform Support',
                url: 'https://github.com/ueservices/Domjuan-1'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: process.env.API_BASE_URL || 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'https://domjuan.herokuapp.com',
                description: 'Production server (Heroku)'
            }
        ],
        components: {
            schemas: {
                Service: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Service name'
                        },
                        price: {
                            type: 'integer',
                            description: 'Price in cents'
                        },
                        description: {
                            type: 'string',
                            description: 'Service description'
                        }
                    }
                },
                Bot: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Bot identifier'
                        },
                        name: {
                            type: 'string',
                            description: 'Bot name'
                        },
                        status: {
                            type: 'object',
                            properties: {
                                isActive: {
                                    type: 'boolean',
                                    description: 'Whether bot is currently active'
                                },
                                stats: {
                                    type: 'object',
                                    properties: {
                                        domainsScanned: {
                                            type: 'integer'
                                        },
                                        domainsDiscovered: {
                                            type: 'integer'
                                        },
                                        domainsAcquired: {
                                            type: 'integer'
                                        },
                                        errors: {
                                            type: 'integer'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                PaymentIntent: {
                    type: 'object',
                    required: ['service', 'amount'],
                    properties: {
                        service: {
                            type: 'string',
                            enum: ['website', 'ecommerce', 'consultation'],
                            description: 'Service type to purchase'
                        },
                        amount: {
                            type: 'integer',
                            minimum: 1,
                            description: 'Amount in cents'
                        }
                    }
                },
                HealthStatus: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['OK', 'DEGRADED', 'ERROR'],
                            description: 'Overall system health status'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Timestamp of health check'
                        },
                        service: {
                            type: 'string',
                            description: 'Service name'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message'
                        },
                        details: {
                            type: 'array',
                            items: {
                                type: 'object'
                            },
                            description: 'Detailed error information (development only)'
                        }
                    }
                }
            },
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key'
                }
            }
        },
        tags: [
            {
                name: 'Services',
                description: 'Service information and pricing'
            },
            {
                name: 'Bots',
                description: 'Domain acquisition bot management'
            },
            {
                name: 'Payments',
                description: 'Payment processing with Stripe'
            },
            {
                name: 'Health',
                description: 'System health and monitoring'
            },
            {
                name: 'Export',
                description: 'Data export and backup functionality'
            }
        ]
    },
    apis: ['./routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
    explorer: true,
    customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #2c3e50; }
    `,
    customSiteTitle: "Domjuan API Documentation"
};

module.exports = {
    specs,
    swaggerUi,
    swaggerOptions
};