# Domjuan-1: Portfolio Website & Domain Discovery System

A professional portfolio website with integrated payment processing and a fully autonomous domain discovery bot system.

## 🌟 Features

### Portfolio Website
- 🎨 Modern, responsive design
- 💳 Stripe payment integration
- 🔒 Secure payment processing
- 📱 Mobile-friendly interface
- ⚡ Fast loading times
- 🚀 Production-ready deployment

### Domain Discovery Bot System
- 🤖 **5 Specialized Bots**: Each with unique domain discovery strategies
- 🔄 **Autonomous Operation**: Continuous scanning without manual intervention
- 📊 **Comprehensive Logging**: Detailed activity logs and metadata tracking
- 💾 **Structured Data Export**: CSV and JSON output formats
- 🔍 **WHOIS Integration**: Domain availability and legitimacy checking
- ⏰ **Scheduled Scanning**: Configurable automated scanning intervals
- 🛡️ **Security Features**: Rate limiting, validation, and error handling

## 🤖 Domain Discovery Bots

### Bot Profiles

1. **Nested Bot** - Focuses on nested structures and subdomain-like patterns
2. **Hidden Bot** - Discovers hidden gem domains that might be overlooked  
3. **Unexplored Bot** - Targets domains in emerging trends and unexplored niches
4. **Unseen Bot** - Finds domains that are typically overlooked or invisible
5. **Unfound Bot** - Discovers domains missed by traditional search methods

### Quick Start - Domain Bots

```bash
# Start all domain discovery bots
npm run bots:start

# Check bot status
npm run bots:status

# Run a single scan cycle
npm run bots:scan

# Export discovered domains
npm run bots:export

# View demonstration
node bots/demo.js
```

**📖 For detailed bot documentation, see [DOMAIN_BOT_README.md](DOMAIN_BOT_README.md)**

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

## Development

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
- `npm test`: Run tests
- `npm run build`: Build for production

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