# Domjuan Domain Acquisition Platform - Production Setup Guide

[![CI/CD Status](https://github.com/ueservices/Domjuan-1/workflows/Deploy%20Autonomous%20Bot%20System/badge.svg)](https://github.com/ueservices/Domjuan-1/actions)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-ready domain acquisition platform with automated bots, secure payment processing, and comprehensive monitoring.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Stripe account (for payment processing)
- Environment variables configured

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ueservices/Domjuan-1.git
cd Domjuan-1

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure environment variables (see Configuration section)
nano .env

# Start development server
npm run dev
```

### Production Deployment

```bash
# Install production dependencies
npm ci --production

# Setup required directories
npm run setup:production

# Start with PM2 (recommended)
npm run pm2:start

# Or start with Docker
npm run docker:run
```

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Configuration](#-configuration)  
- [Security](#-security)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Monitoring](#-monitoring)
- [Backup & Recovery](#-backup--recovery)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)

## 🏗️ Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Express API   │    │   Bot Manager   │
│   - React UI    │◄──►│   - Routes      │◄──►│   - Domain Bots │
│   - Payments    │    │   - Middleware  │    │   - Acquisition │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Stripe API    │    │   File System   │    │   WebSocket     │
│   - Payments    │    │   - Data/Logs   │    │   - Real-time   │
│   - Webhooks    │    │   - Backups     │    │   - Updates     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Features

- **🤖 Autonomous Domain Bots**: Automated domain discovery and acquisition
- **💳 Secure Payments**: Stripe integration with PCI compliance
- **🔒 Enterprise Security**: Rate limiting, input validation, CORS protection
- **📊 Comprehensive Logging**: Winston-based structured logging
- **🧪 Full Test Coverage**: Jest-based testing with 33+ test cases
- **📚 API Documentation**: OpenAPI/Swagger documentation
- **🚀 Production Ready**: Docker, PM2, CI/CD pipelines

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
API_BASE_URL=https://your-domain.com

# Stripe Configuration (REQUIRED)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CORS Security
FRONTEND_URL=https://your-frontend-domain.com
DOMAIN_URL=https://your-domain.com

# Optional: Analytics & Monitoring
ANALYTICS_ENABLED=true
WEBHOOK_URL=https://discord.com/api/webhooks/...

# Optional: Database (if using external DB)
DATABASE_URL=postgres://user:pass@host:port/dbname
```

### Stripe Configuration

1. **Create Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **Get API Keys**: Dashboard → Developers → API keys
3. **Setup Webhooks**: 
   - Endpoint: `https://your-domain.com/api/payments/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. **Configure Products**: Match service prices in code with Stripe products

### Security Configuration

The platform includes multiple security layers:

- **Rate Limiting**: Different limits per endpoint type
- **Input Validation**: express-validator with sanitization
- **CORS**: Environment-based origin configuration  
- **CSP Headers**: Helmet.js security headers
- **Error Handling**: Production-safe error responses

## 🔒 Security

### Security Features

- ✅ **Input Validation & Sanitization**: XSS protection
- ✅ **Rate Limiting**: API abuse prevention
- ✅ **CORS Protection**: Cross-origin request security
- ✅ **Security Headers**: Helmet.js implementation
- ✅ **Environment Variables**: Secret management
- ✅ **Error Handling**: Information disclosure prevention

### Security Checklist

- [ ] Configure HTTPS in production (required for Stripe)
- [ ] Set strong environment-based CORS origins
- [ ] Rotate API keys regularly
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Configure firewall rules
- [ ] Setup backup encryption

### HTTPS Requirements

**HTTPS is mandatory for production deployment** because:
- Stripe requires HTTPS for payment processing
- Security headers require secure context
- Modern browsers block insecure payment forms

## 📚 API Documentation

### Interactive Documentation

Access the Swagger UI documentation at: `http://localhost:3000/api-docs`

### API Endpoints

#### Services
- `GET /api/services` - List all services
- `GET /api/services/{id}` - Get service details

#### Payments
- `POST /api/payments/create-payment-intent` - Create payment
- `POST /api/payments/webhook` - Stripe webhook

#### Bots
- `GET /api/bots` - List all bots
- `GET /api/bots/{id}` - Get bot details
- `POST /api/bots/{id}/start` - Start bot
- `POST /api/bots/{id}/stop` - Stop bot

#### Health & Monitoring
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system status
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe

#### Data Export
- `GET /api/export/json` - Export data as JSON
- `GET /api/export/csv` - Export data as CSV
- `GET /api/stats?format=json|csv` - Get statistics

### Rate Limits

| Endpoint Type | Requests | Window | Description |
|---------------|----------|---------|-------------|
| General API | 100 | 15 min | Standard API endpoints |
| Payments | 10 | 15 min | Payment processing |
| Auth | 5 | 15 min | Authentication attempts |
| Export | 3 | 60 min | Data export operations |

## 🧪 Testing

### Test Suite

The platform includes comprehensive testing:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Run integration tests
npm run test:integration
```

### Test Categories

- **API Tests** (15 tests): Endpoint functionality
- **Security Tests** (12 tests): Input validation, sanitization
- **Health Tests** (6 tests): Monitoring endpoints
- **Coverage**: Routes, middleware, configuration

### Test Results

```
Test Suites: 3 passed, 3 total
Tests:       33 passed, 33 total
Snapshots:   0 total
Time:        1.124s
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t domjuan-platform .

# Run container
docker run -d \
  --name domjuan-platform \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e STRIPE_SECRET_KEY=sk_live_... \
  domjuan-platform

# Using Docker Compose
docker-compose up -d
```

### PM2 Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Monitor processes
pm2 monit

# View logs
pm2 logs domjuan-bot-system
```

### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_...

# Deploy
git push heroku main
```

### Vercel Deployment

1. Connect repository to Vercel
2. Configure environment variables in dashboard
3. Deploy automatically on push to main

### Environment-Specific Deployments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Development | `develop` | localhost:3000 | Local development |
| Staging | `staging` | staging.domain.com | Pre-production testing |
| Production | `main` | domain.com | Live platform |

## 📊 Monitoring

### Health Checks

The platform provides comprehensive health monitoring:

```bash
# Basic health check
curl https://your-domain.com/health

# Detailed system information
curl https://your-domain.com/health/detailed

# Kubernetes probes
curl https://your-domain.com/health/ready
curl https://your-domain.com/health/live
```

### Logging

Structured logging with Winston:

- **Levels**: error, warn, info, debug
- **Formats**: JSON (production), colorized (development)
- **Rotation**: 5MB files, 5 file retention
- **Locations**: `./logs/error.log`, `./logs/combined.log`

### Metrics & Analytics

- **Server Metrics**: Request rates, response times, errors
- **Business Metrics**: Payment success rates, bot performance
- **User Analytics**: Page views, conversion rates
- **System Metrics**: Memory usage, CPU load, disk space

### Alerting

Configure webhook notifications for:
- Payment failures
- Bot system errors  
- High error rates
- System resource exhaustion

## 💾 Backup & Recovery

### Automated Backups

```bash
# Run backup manually
npm run backup

# Schedule with cron (daily at 2 AM)
0 2 * * * cd /path/to/domjuan && npm run backup
```

### Backup Strategy

- **Frequency**: Daily automated backups
- **Retention**: 30 days (configurable)
- **Storage**: Local filesystem + cloud storage
- **Formats**: JSON (structured data) + CSV (portable)
- **Encryption**: AES-256 for sensitive data

### Recovery Procedures

1. **Data Recovery**:
   ```bash
   # List available backups
   ls -la backups/
   
   # Restore from backup
   ./scripts/restore.sh backups/backup_20231225_020001.tar.gz
   ```

2. **Service Recovery**:
   ```bash
   # Stop services
   pm2 stop all
   
   # Restore data
   npm run restore
   
   # Restart services  
   pm2 restart all
   ```

## 🛠️ Development

### Development Workflow

```bash
# Setup development environment
npm install
cp .env.example .env

# Start development server (auto-reload)
npm run dev

# Run tests continuously
npm run test:watch

# Check code quality
npm audit
npm run lint (if configured)
```

### Code Structure

```
├── config/           # Configuration modules
│   ├── logger.js     # Winston logging setup
│   ├── cors.js       # CORS configuration  
│   └── swagger.js    # API documentation
├── middleware/       # Express middleware
│   └── security.js   # Security middleware
├── routes/           # API route handlers
│   ├── api.js        # General API routes
│   ├── payments.js   # Payment processing
│   └── health.js     # Health checks
├── utils/            # Utility functions
├── tests/            # Test suites
├── bots/             # Bot management
└── scripts/          # Utility scripts
```

### Development Best Practices

- **Modular Architecture**: Separate concerns into modules
- **Error Handling**: Comprehensive error handling at all levels
- **Input Validation**: Validate and sanitize all inputs
- **Logging**: Log all significant events and errors
- **Testing**: Write tests for all new functionality
- **Documentation**: Document APIs and complex logic

## 🔧 Troubleshooting

### Common Issues

#### Server Won't Start
```bash
# Check port availability
sudo lsof -i :3000

# Check environment variables
printenv | grep STRIPE

# Check logs
tail -f logs/error.log
```

#### Payment Processing Errors
```bash
# Verify Stripe configuration
curl -X POST http://localhost:3000/api/payments/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"service":"website","amount":50000}'

# Check webhook configuration
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Bot System Issues
```bash
# Check bot status
curl http://localhost:3000/api/bots

# Check detailed health
curl http://localhost:3000/health/detailed
```

### Log Analysis

```bash
# View recent errors
tail -100 logs/error.log | jq '.'

# Monitor real-time logs
tail -f logs/combined.log | jq '.'

# Search for specific errors
grep "payment_error" logs/combined.log | jq '.'
```

### Performance Issues

1. **Memory Leaks**: Monitor with `pm2 monit`
2. **High CPU**: Check bot processes and rate limiting
3. **Slow Responses**: Analyze request logs and database queries
4. **Disk Space**: Monitor log rotation and backup cleanup

## 📞 Support

### Getting Help

- **Documentation**: Check this README and API docs
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Security**: Report security issues privately

### Maintenance

- **Dependencies**: Update monthly with `npm update`
- **Security**: Run `npm audit` weekly
- **Backups**: Verify backup integrity monthly  
- **Logs**: Monitor disk usage and rotation
- **Performance**: Review metrics and optimize bottlenecks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎯 Production Checklist**

Before deploying to production:

- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Stripe webhooks configured
- [ ] Health checks responding
- [ ] Tests passing
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Error handling validated

---

*For detailed technical documentation, see the [DOMAIN_BEST_PRACTICES.md](DOMAIN_BEST_PRACTICES.md) and [SECURITY.md](SECURITY.md) files.*