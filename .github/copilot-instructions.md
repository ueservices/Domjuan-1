# Portfolio Website with Payment Processing

A professional portfolio website built with Node.js, Express, and Stripe payment integration. This is a static frontend with a Node.js server that handles payment processing for services.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Setup
- Verify Node.js version: `node --version` (requires v18.0.0+)
- Install dependencies: `npm install` -- takes ~6 seconds (measured). Set timeout to 60+ seconds for safety.
- Set up environment: `cp .env.example .env` then edit `.env` with your Stripe keys
- NEVER CANCEL: All commands complete quickly, but always allow adequate timeouts for CI/CD environments

### Build and Test
- Build: `npm run build` -- No actual build step required (static site). Completes instantly.
- Test: `npm test` -- Currently placeholder only. Completes instantly.
- Security audit: `npm audit --audit-level moderate` -- takes ~2 seconds. Set timeout to 30+ seconds.
- NEVER CANCEL: Even though commands are fast, CI may run slower. Always use adequate timeouts.

### Run the Application
- Development mode: `npm run dev` -- starts with nodemon for auto-reload
- Production mode: `npm start` -- starts production server
- Server runs on port 3000 by default (configurable via PORT environment variable)
- Application available at `http://localhost:3000`

### Production Deployment
- Use deployment script: `./deploy.sh`
- Required environment variables: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
- Script validates environment, installs production dependencies, runs security audit
- Compatible with Heroku, Vercel, Railway, Render, and other platforms

## Validation

### CRITICAL Manual Validation Steps
After making any changes, ALWAYS perform these validation steps:

1. **Server Functionality**:
   - Start the server: `npm start` 
   - Verify server starts without errors and shows "Server running on port 3000"
   - Visit `http://localhost:3000` and verify the portfolio loads

2. **Payment Modal Testing**:
   - Click any "Buy Now" button on the services section
   - Verify payment modal opens with service details
   - Verify modal shows "Demo Mode: Payment processing temporarily unavailable" message
   - Test modal close functionality

3. **Navigation Testing**:
   - Test all navigation links (Home, About, Services, Portfolio, Contact)
   - Verify smooth scrolling to each section works correctly

4. **Environment Configuration**:
   - Verify `.env` file is properly copied from `.env.example`
   - Test deployment script validation: `./deploy.sh` (should fail with environment error if no Stripe keys)

### Development vs Production Testing
- **Development**: Use `npm run dev` for auto-reload during development
- **Production**: Use `npm start` for production testing
- **Payment Testing**: Currently in demo mode - no actual Stripe processing without valid keys

## Common Commands and Expected Times

### Repository Commands (with timeout recommendations)
```bash
npm install                    # ~6 seconds (measured), set timeout: 60 seconds
npm start                     # Starts in ~1 second, runs continuously  
npm run dev                   # Starts in ~2 seconds, runs continuously
npm test                      # Instant (~0.1 seconds), set timeout: 30 seconds
npm run build                 # Instant (~0.1 seconds), set timeout: 30 seconds
npm audit --audit-level moderate  # ~0.5 seconds (measured), set timeout: 30 seconds
chmod +x deploy.sh && ./deploy.sh # Fails quickly if env missing, set timeout: 120 seconds
```

### CI/CD Pipeline Commands
The GitHub Actions workflow (`.github/workflows/deploy.yml`) runs:
- `npm ci` -- for clean installs in CI
- `npm test` -- currently placeholder
- `npm audit --audit-level moderate` -- security check
- Matrix testing across Node.js 18.x, 20.x, 22.x

## Key Files and Structure

```
├── index.html              # Main portfolio page (frontend)
├── styles.css              # CSS styling
├── script.js               # Frontend JavaScript (Stripe integration)
├── server.js               # Node.js/Express server (backend)
├── package.json            # Dependencies and scripts
├── .env.example            # Environment template
├── .env                    # Local environment (create from example)
├── deploy.sh               # Production deployment script
├── Procfile                # Heroku deployment configuration
├── SECURITY.md             # Security best practices
├── BEST_PRACTICES.md       # Development best practices
├── .github/workflows/deploy.yml  # CI/CD pipeline
└── README.md               # Project documentation
```

### Key Configuration Points
- **Services configuration**: Edit `SERVICES` object in `server.js` to modify pricing/offerings
- **Stripe integration**: Update `STRIPE_PUBLISHABLE_KEY` in environment variables
- **Server configuration**: Security headers and CORS configured via helmet.js
- **Payment processing**: Webhook handling implemented in `server.js`

## Development Workflow

### Making Changes
1. **Frontend changes**: Edit `index.html`, `styles.css`, or `script.js`
2. **Backend changes**: Edit `server.js` for API endpoints and payment logic
3. **Always test manually** after making changes using the validation steps above
4. **No linting configured**: Project does not have ESLint/Prettier configured

### Payment Integration
- Uses Stripe Elements for secure card input
- Test cards available in demo mode:
  - Success: `4242424242424242`
  - Decline: `4000000000000002`
- Webhook endpoint configured at `/webhook` for production use

### Security Considerations
- Content Security Policy (CSP) configured via helmet
- CORS protection enabled
- Environment variables must be properly configured
- Review `SECURITY.md` for production security guidelines

## Troubleshooting

### Common Issues
- **Port 3000 in use**: Use `PORT=3001 npm start` to use different port
- **Stripe not loading**: Verify internet connection and STRIPE_PUBLISHABLE_KEY
- **Payment modal not working**: Check browser console for JavaScript errors
- **Deployment fails**: Verify all required environment variables are set

### Environment Problems
- Missing `.env` file: Copy from `.env.example`
- Wrong Node version: Requires Node.js 18.0.0+
- Missing dependencies: Run `npm install`

## Quick Reference Commands

```bash
# First time setup
cp .env.example .env
npm install

# Development
npm run dev

# Production testing
npm start

# Deployment preparation
chmod +x deploy.sh
./deploy.sh

# Security audit
npm audit --audit-level moderate
```

Remember: This is a portfolio website with payment processing capabilities. Always test the user journey from viewing services to attempting payment checkout when making changes.