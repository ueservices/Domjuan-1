# GitHub Copilot Instructions

## Project Overview

This is a professional portfolio website with integrated Stripe payment processing, built with:
- **Backend**: Node.js with Express.js
- **Frontend**: Vanilla HTML/CSS/JavaScript 
- **Payment Processing**: Stripe API
- **Security**: Helmet.js, CORS, CSP
- **Deployment**: Heroku, Vercel compatible

## Code Style & Standards

### JavaScript/Node.js
- Use modern ES6+ syntax
- Follow consistent naming conventions (camelCase)
- Always use `const` or `let`, never `var`
- Add JSDoc comments for complex functions
- Handle errors gracefully with try-catch blocks
- Use async/await instead of .then() for promises

### Security First
- **Never commit secrets** - use environment variables
- Validate all inputs on server-side
- Use Helmet.js for security headers
- Implement proper CORS configuration
- Follow OWASP security guidelines

### API Development
- RESTful endpoint design
- Consistent error response format
- Input validation middleware
- Rate limiting for production endpoints
- Proper HTTP status codes

## Development Workflow

### Testing
- Add unit tests for new API endpoints
- Test payment flows with Stripe test data
- Manual testing checklist in DEVELOPMENT.md
- Security audit with `npm audit`

### Environment Setup  
- Copy `.env.example` to `.env` for local development
- Use Stripe test keys during development
- Never use production keys in development

### Git Workflow
- Create feature branches from `main`
- Use descriptive commit messages
- Run tests before committing
- Follow conventional commit format when possible

## Common Tasks

### Adding New Services
1. Update `SERVICES` object in `server.js`
2. Add corresponding HTML in `index.html`
3. Update service cards styling in `styles.css`
4. Test payment flow end-to-end

### Security Updates
1. Run `npm audit fix` regularly
2. Update dependencies monthly
3. Review security headers configuration
4. Test CSP policies after changes

### Deployment
1. Ensure environment variables are configured
2. Run security audit: `npm audit --audit-level moderate`
3. Test on staging environment first
4. Use deployment script: `./deploy.sh`

## File Structure Context

```
├── server.js           # Main Express server & API endpoints
├── index.html          # Portfolio homepage with payment forms  
├── script.js           # Client-side JavaScript & Stripe integration
├── styles.css          # All styling and responsive design
├── package.json        # Dependencies & npm scripts
├── .env.example        # Environment variables template
├── deploy.sh           # Production deployment script
├── SECURITY.md         # Security configuration guide
├── BEST_PRACTICES.md   # Development best practices
└── README.md           # Setup and usage documentation
```

## Coding Assistance Guidelines

### When suggesting code changes:
- Prioritize security and input validation
- Maintain existing code style and patterns
- Consider mobile responsiveness for frontend changes
- Test suggestions with actual Stripe test data
- Provide complete, working code snippets
- Include error handling in all suggestions

### For payment-related code:
- Always validate amounts server-side
- Use Stripe's secure payment methods
- Never store sensitive payment data
- Test with Stripe's test card numbers
- Handle payment failures gracefully

### For API endpoints:
- Follow existing patterns in `server.js`
- Add appropriate middleware
- Return consistent JSON responses
- Include proper error handling
- Add input validation

## Best Practices Reminders

- **Security**: Every change should maintain or improve security
- **Testing**: Provide test cases for new functionality
- **Documentation**: Update relevant documentation files
- **Performance**: Consider loading times and user experience
- **Accessibility**: Ensure forms and UI elements are accessible
- **Mobile**: Test responsive design on various screen sizes

## Quick Reference

### Stripe Test Cards
- Success: `4242424242424242`
- Declined: `4000000000000002`
- Insufficient funds: `4000000000009995`

### Environment Variables
- `STRIPE_SECRET_KEY`: Backend Stripe key
- `STRIPE_PUBLISHABLE_KEY`: Frontend Stripe key  
- `STRIPE_WEBHOOK_SECRET`: Webhook verification
- `NODE_ENV`: Environment setting
- `PORT`: Server port (default 3000)

### Common Commands
```bash
npm run dev          # Start development server
npm start           # Start production server
npm audit           # Check for vulnerabilities
./deploy.sh         # Deploy to production
```