# GitHub Copilot Instructions for Portfolio Website

This repository contains a professional portfolio website with integrated payment processing capabilities. Follow these guidelines when contributing code or providing assistance.

## Project Overview

**Architecture**: Full-stack web application
- **Frontend**: Vanilla HTML, CSS, JavaScript with Stripe Elements
- **Backend**: Node.js with Express.js framework
- **Payment Processing**: Stripe API integration
- **Deployment**: Heroku with GitHub Actions CI/CD

## Key Technologies & Dependencies

- **Runtime**: Node.js 18+ (specified in package.json engines)
- **Framework**: Express.js 4.x
- **Payment**: Stripe 12.x
- **Security**: Helmet.js (CSP), CORS, dotenv
- **Development**: Nodemon for hot reloading

## File Structure & Responsibilities

```
├── server.js           # Main Express server with Stripe integration
├── index.html          # Frontend portfolio page with payment modals
├── script.js           # Client-side JavaScript with Stripe Elements
├── styles.css          # CSS styling and responsive design
├── package.json        # Dependencies and npm scripts
├── .env.example        # Environment variable template
├── Procfile           # Heroku deployment configuration
├── SECURITY.md        # Security guidelines and best practices
├── BEST_PRACTICES.md  # Development guidelines
└── .github/workflows/ # CI/CD pipeline configuration
```

## Coding Standards & Patterns

### JavaScript
- Use modern ES6+ syntax where appropriate
- Implement async/await for asynchronous operations
- Follow error-first callback patterns for Stripe API calls
- Use descriptive variable names (e.g., `paymentIntent`, `clientSecret`)
- Include proper error handling with try/catch blocks

### Security Requirements
- **Never commit API keys**: Use environment variables for all secrets
- **Validate all inputs**: Server-side validation for payment amounts and service types
- **CSP compliance**: Script sources must be whitelisted in helmet configuration
- **HTTPS only**: All Stripe operations require secure connections in production

### Payment Processing Patterns
- Always validate payment amounts against predefined service prices
- Use Stripe's `PaymentIntent` API for secure payment processing
- Implement webhook verification for payment confirmations
- Include metadata in payment intents for order tracking

## Environment Variables

Required environment variables (see `.env.example`):
```bash
STRIPE_SECRET_KEY=sk_test_...     # Stripe secret key (test/live)
STRIPE_PUBLISHABLE_KEY=pk_test_... # Stripe publishable key (test/live)
STRIPE_WEBHOOK_SECRET=whsec_...    # Webhook endpoint verification
PORT=3000                          # Server port
NODE_ENV=production               # Environment setting
```

## Common Development Tasks

### Adding New Services
1. Update `SERVICES` object in `server.js` with pricing
2. Add corresponding HTML elements in `index.html`
3. Update service mapping in `script.js`
4. Test payment flow with Stripe test cards

### Modifying Payment Flow
- Always validate on both client and server sides
- Use Stripe test cards for development (4242424242424242 for success)
- Check webhook delivery in Stripe dashboard
- Maintain PCI compliance by never storing card data

### Styling Changes
- Follow mobile-first responsive design patterns
- Use CSS Grid and Flexbox for layouts
- Maintain accessibility standards (ARIA labels, semantic HTML)
- Test across different viewport sizes

## Testing Guidelines

### Manual Testing
- Use Stripe test mode and test cards
- Verify payment success/failure scenarios
- Test responsive design on multiple devices
- Validate form submissions and error handling

### Security Testing
- Run `npm audit` for vulnerability checks
- Verify CSP headers are properly configured
- Test CORS settings with different origins
- Validate input sanitization

## Stripe Integration Specifics

### Client-Side (script.js)
- Initialize Stripe with publishable key from `/config.js` endpoint
- Use Stripe Elements for secure card input
- Handle payment confirmation with `confirmCardPayment`
- Display appropriate success/error messages

### Server-Side (server.js)
- Create PaymentIntents with proper metadata
- Validate service types against `SERVICES` configuration
- Process webhooks for payment status updates
- Log payment attempts for audit purposes

## Common Issues & Solutions

1. **Stripe initialization failures**: Check publishable key configuration
2. **CSP violations**: Ensure all script sources are whitelisted
3. **Payment validation errors**: Verify service pricing matches client/server
4. **Environment variable issues**: Check `.env` file exists and variables are set

## Deployment Considerations

- Set `NODE_ENV=production` in production environment
- Use live Stripe keys for production deployments
- Ensure HTTPS is enabled (required for Stripe)
- Configure proper error logging and monitoring

## Contributing Guidelines

- Follow existing code patterns and naming conventions
- Test all payment flows before submitting changes
- Update relevant documentation when adding features
- Ensure security best practices are maintained
- Use meaningful commit messages describing changes

## References

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- Repository documentation: `README.md`, `SECURITY.md`, `BEST_PRACTICES.md`