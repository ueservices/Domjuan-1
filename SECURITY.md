# Security Configuration and Production Guidelines

## Environment Variables Security

### Required Environment Variables

- `STRIPE_SECRET_KEY`: Keep this secret! Never commit to version control
- `STRIPE_PUBLISHABLE_KEY`: Safe to use in frontend
- `STRIPE_WEBHOOK_SECRET`: Required for webhook verification
- `NODE_ENV`: Set to "production" in production

### Environment Variable Management

1. Use your hosting platform's environment variable settings
2. Never store secrets in code or configuration files
3. Use `.env` files only for local development (never commit them)
4. Rotate keys regularly

## Stripe Security Best Practices

### API Keys

- Use test keys during development
- Switch to live keys only in production
- Restrict API key permissions in Stripe dashboard
- Monitor API key usage

### Payment Security

- Always validate payments on the server side
- Use webhooks to confirm payment status
- Implement idempotency for payment requests
- Log all payment attempts for auditing

### Webhook Security

- Verify webhook signatures
- Implement webhook endpoint authentication
- Use HTTPS for all webhook endpoints
- Process webhooks asynchronously

## Server Security

### Content Security Policy

- Restricts resource loading to trusted sources
- Prevents XSS attacks
- Configured in server.js

### CORS Protection

- Configured to allow necessary origins
- Prevents unauthorized cross-origin requests

### Input Validation

- All payment amounts are validated server-side
- Service types are validated against allowed values
- Error messages don't expose sensitive information

## Deployment Security

### HTTPS

- Always use HTTPS in production
- Most hosting platforms provide this automatically
- Required for Stripe payment processing

### Server Hardening

- Keep dependencies updated
- Run `npm audit` regularly
- Use security headers (implemented via helmet.js)
- Implement rate limiting for production

### Monitoring

- Monitor server logs for suspicious activity
- Set up alerts for failed payments
- Track API usage patterns

## Development vs Production

### Development

- Use Stripe test mode
- Test with Stripe test cards
- Use localhost for testing

### Production

- Use Stripe live mode
- Real payment processing
- Secure HTTPS domain
- Environment variables properly configured

## Incident Response

### Payment Issues

1. Check Stripe dashboard for payment status
2. Review server logs for errors
3. Verify webhook delivery
4. Contact customer if payment succeeded but order failed

### Security Incidents

1. Immediately rotate compromised API keys
2. Review recent transactions
3. Check for unauthorized access
4. Update security measures

## Compliance

### PCI Compliance

- Using Stripe Elements for secure card data handling
- Never store card numbers or sensitive payment data
- Stripe handles PCI compliance for payment processing

### Data Protection

- Collect minimal customer data
- Secure transmission of all data
- Regular security audits
- Comply with applicable privacy laws
