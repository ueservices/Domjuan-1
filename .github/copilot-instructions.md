# Copilot Instructions for Portfolio Website

## Project Overview
This is a professional portfolio website with integrated Stripe payment processing. The project is built with Node.js/Express backend and vanilla JavaScript frontend, focusing on simplicity and security.

## Architecture
- **Backend**: Node.js with Express, Stripe integration
- **Frontend**: Vanilla HTML/CSS/JavaScript with Stripe Elements
- **Security**: Helmet.js, CORS, CSP, input validation
- **Deployment**: Heroku/Vercel compatible with GitHub Actions CI/CD

## Coding Guidelines

### General Principles
- Keep code simple and readable
- Follow existing code patterns and style
- Prioritize security, especially for payment handling
- Maintain backward compatibility
- Write self-documenting code with clear variable/function names

### JavaScript Style
- Use modern ES6+ syntax where appropriate
- Prefer `const` and `let` over `var`
- Use template literals for string interpolation
- Follow existing error handling patterns
- Maintain consistent indentation (2 spaces)

### Node.js/Express Patterns
- Use middleware pattern consistently
- Validate all inputs, especially payment-related data
- Use proper HTTP status codes
- Log errors appropriately without exposing sensitive data
- Follow existing route structure and naming

### Security First
- Never expose API keys in client-side code
- Always validate server-side, even if validated client-side
- Use environment variables for all secrets
- Implement proper CORS policies
- Validate payment amounts against server-side configurations

### Payment Processing
- Follow Stripe best practices
- Use server-side validation for all payment intents
- Implement proper webhook signature verification
- Handle payment failures gracefully
- Log payment events for auditing

## File Structure Context
```
├── server.js           # Main Express server with payment endpoints
├── index.html          # Portfolio page with service selection
├── script.js           # Client-side payment handling with Stripe
├── styles.css          # Responsive CSS styling
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variable template
└── .github/
    └── workflows/
        └── deploy.yml  # CI/CD pipeline
```

## Development Workflow

### Making Changes
1. Test changes locally with `npm run dev`
2. Verify payment flow with Stripe test cards
3. Check console for any errors
4. Ensure responsive design works
5. Test security headers and CSP

### Testing Payment Integration
- Use Stripe test publishable key in development
- Test with cards: `4242424242424242` (success), `4000000000000002` (decline)
- Verify webhook handling if implementing webhook endpoints
- Test all service types (website, ecommerce, consultation)

### Environment Configuration
- Copy `.env.example` to `.env` for local development
- Use test Stripe keys in development
- Switch to live keys only in production
- Never commit `.env` files

## Common Tasks

### Adding New Services
1. Update `SERVICES` object in `server.js`
2. Add corresponding UI elements in `index.html`
3. Update service selection in `script.js`
4. Test payment flow for new service

### Modifying Payment Flow
1. Consider security implications first
2. Update both client and server validation
3. Test with various Stripe test scenarios
4. Verify error handling and user feedback

### UI/UX Changes
1. Maintain mobile-first responsive design
2. Follow existing color scheme and typography
3. Ensure accessibility standards
4. Test across different browsers
5. Maintain loading states and error feedback

## Debugging Tips
- Check browser console for client-side errors
- Monitor server logs for backend issues
- Use Stripe dashboard for payment debugging
- Verify CSP policies aren't blocking resources
- Test with network throttling for slow connections

## Deployment Considerations
- Environment variables must be set in production
- Use live Stripe keys in production only
- Ensure HTTPS is enabled (required for Stripe)
- Monitor application logs
- Set up proper error alerting

## Best Practices Reminders
- Keep dependencies updated
- Run security audits regularly
- Backup important configuration
- Document any breaking changes
- Follow semantic versioning for releases

When implementing changes, always consider the security implications and maintain the existing simplicity of the codebase.