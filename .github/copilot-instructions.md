# GitHub Copilot Agent Instructions

## Repository Overview
This is a professional portfolio website with integrated Stripe payment processing built with Node.js, Express, and vanilla JavaScript.

## Code Quality Standards
- Follow existing code style and patterns
- Maintain security best practices for payment processing
- Use environment variables for sensitive configuration
- Implement proper error handling and input validation
- Write clear, self-documenting code

## Security Guidelines
- Never hardcode API keys or secrets
- Always validate payment amounts server-side
- Use HTTPS for all payment-related operations
- Implement proper CORS and CSP headers
- Follow PCI compliance best practices

## Testing Requirements
- Test payment flows with Stripe test cards
- Validate environment variable handling
- Test error scenarios and edge cases
- Ensure proper webhook signature verification

## File Structure and Conventions
- `server.js`: Main Express server with payment processing
- `script.js`: Frontend JavaScript with Stripe Elements
- `index.html`: Main portfolio page
- `styles.css`: All styling (no CSS frameworks)
- `.env.example`: Template for environment variables

## Environment Variables Required
- `STRIPE_SECRET_KEY`: Stripe secret key for server-side operations
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for client-side
- `STRIPE_WEBHOOK_SECRET`: For webhook signature verification
- `NODE_ENV`: Environment setting (development/production)
- `PORT`: Server port (defaults to 3000)

## Payment Processing Flow
1. Client selects service and opens payment modal
2. Stripe Elements handles secure card input
3. Server creates PaymentIntent with validated amount
4. Client confirms payment using Stripe client-side
5. Webhook confirms successful payment server-side

## Common Patterns
- Use `formatCurrency()` for displaying prices
- Validate service types against `SERVICES` configuration
- Use async/await for payment operations
- Implement proper error messages without exposing sensitive data

## Deployment Considerations
- Repository supports Heroku, Vercel, and other platforms
- Uses GitHub Actions for CI/CD
- Security audit runs on each deployment
- Environment-specific configuration handled via platform settings

## Code Review Focus Areas
- Payment security and validation
- Environment variable usage
- Error handling and user experience
- Performance and security headers
- Accessibility and responsive design