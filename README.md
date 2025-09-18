# Portfolio Website with Payment Processing

A professional portfolio website with integrated payment processing for services.

## Features

- 🎨 Modern, responsive design
- 💳 Stripe payment integration
- 🔒 Secure payment processing
- 📱 Mobile-friendly interface
- ⚡ Fast loading times
- 🚀 Production-ready deployment

## Services Offered

1. **Website Development** - $500
   - Custom websites built with modern technologies
   
2. **E-commerce Solutions** - $1,200
   - Complete online store setup with payment processing
   
3. **Consultation** - $100
   - One-on-one consultation for your project

## Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Stripe account for payment processing

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ueservices/Domjuan-1.git
cd Domjuan-1
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Stripe keys
```

4. Start the development server:
```bash
npm run dev
```

5. Visit `http://localhost:3000` to view the portfolio

## Production Deployment

### Environment Variables

Set the following environment variables in your production environment:

- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key  
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Set to "production"

### Deployment Options

#### Heroku

1. Create a new Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using GitHub integration or Heroku CLI

#### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the deployment prompts

#### Other Platforms

The application is compatible with:
- Railway
- Render
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run

## Payment Processing

The website uses Stripe for secure payment processing:

1. Customers select a service
2. Payment modal opens with Stripe Elements
3. Secure payment processing
4. Confirmation and receipt

### Stripe Configuration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Set up webhooks for payment confirmation
4. Update the publishable key in `script.js`

## Security Features

- Content Security Policy (CSP)
- CORS protection
- Input validation
- Secure payment handling
- Environment variable protection

### Security Best Practices for Contributors

1. **Never commit secrets**: Use `.env` files locally, environment variables in production
2. **Validate inputs**: All user inputs, especially payment amounts, must be validated
3. **Use HTTPS**: Required for payment processing and webhook endpoints
4. **Follow PCI compliance**: Use Stripe Elements, never store card data
5. **Audit dependencies**: Run `npm run security-check` regularly
6. **Code review**: Security-sensitive files require code owner approval

### Automated Security

- **Dependabot**: Automatically updates dependencies and security patches
- **ESLint Security Plugin**: Detects common security vulnerabilities
- **GitHub Security Advisories**: Monitors for known vulnerabilities
- **Branch Protection**: Requires reviews and status checks before merging

## Development

### GitHub Copilot Agent Integration

This repository is optimized for GitHub Copilot Coding Agent. The agent has been configured with:

#### Agent Configuration
- **Instructions**: Located in `.github/copilot-instructions.md`
- **Security Guidelines**: Payment processing and PCI compliance focused
- **Code Patterns**: Follows existing Express.js and Stripe integration patterns
- **Context Files**: Prioritizes key files (server.js, script.js, security configs)

#### Working with the Agent
1. **Code Reviews**: CODEOWNERS file ensures security-sensitive changes are reviewed
2. **Issue Templates**: Use structured templates for bugs, features, and security issues
3. **Pull Requests**: Follow the PR template for consistent documentation
4. **Automated Updates**: Dependabot manages dependency updates safely

#### Agent Guidelines
- Always use environment variables for sensitive configuration
- Follow existing payment processing patterns
- Maintain security headers and validation
- Test with Stripe test cards in development
- Validate webhook signatures for production

### File Structure

```
├── index.html          # Main portfolio page
├── styles.css          # CSS styling
├── script.js           # Frontend JavaScript
├── server.js           # Node.js server
├── package.json        # Dependencies
├── .env.example        # Environment template
├── .github/
│   └── workflows/
│       └── deploy.yml  # CI/CD pipeline
└── README.md           # This file
```

### Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with auto-reload
- `npm test`: Run linting and security checks
- `npm run lint`: Run ESLint with auto-fix
- `npm run lint:check`: Run ESLint without auto-fix
- `npm run security-check`: Run npm audit for vulnerabilities
- `npm run validate-env`: Validate required environment variables
- `npm run build`: Build for production (static site)

### Customization

1. **Services**: Update service information in `server.js` and `index.html`
2. **Styling**: Modify `styles.css` for custom branding
3. **Content**: Update portfolio items and contact information
4. **Payment**: Configure Stripe settings and pricing

## Testing

### Manual Testing

1. Start the server: `npm start`
2. Navigate to the payment forms
3. Use Stripe test cards:
   - Success: `4242424242424242`
   - Decline: `4000000000000002`

### Automated Testing

```bash
npm test
```

## Support

For support and questions:
- Email: contact@portfolio.com
- Phone: (555) 123-4567

## License

MIT License - see LICENSE file for details