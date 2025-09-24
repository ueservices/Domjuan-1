# Domain Discovery Bot System with Real-time Dashboard

An advanced autonomous domain discovery system featuring three specialized bots with a comprehensive real-time monitoring dashboard.

## 🤖 Bot System Features

- **Domain Hunter** - Specializes in premium domain discovery
- **Asset Seeker** - Focuses on digital asset domains (NFT, DeFi, Gaming, SaaS)
- **Recursive Explorer** - Discovers hidden gem domains with deep search capabilities
- **Real-time Dashboard** - Live monitoring, filtering, and export capabilities
- **WebSocket Integration** - Instant updates without page refresh
- **🚀 Autonomous Workflow** - Complete automated PR management, testing, and deployment

## 📊 Dashboard Capabilities

- 🔴 **Live Bot Monitoring** - Real-time status and progress tracking
- 📈 **Interactive Visualizations** - Discovery timelines and performance metrics
- 🔍 **Advanced Filtering** - Filter by bot, event type, and asset type
- 📁 **Data Export** - JSON and CSV export functionality
- ⏱️ **Real-time Activity Log** - Timestamped activity tracking
- 🎨 **Modern UI** - Glassmorphism design with responsive layout
- 🤖 **Autonomous Operations** - Automated PR review, testing, and deployment

## 🚀 Quick Start

### Prerequisites

- Node.js (version 18 or higher)
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

3. Start the server:
```bash
npm start
```

4. Access the applications:
   - **Bot Dashboard**: http://localhost:3000/dashboard
   - Portfolio Site: http://localhost:3000

## 🎯 Using the Bot Dashboard

### Starting Bot Operations
1. Navigate to http://localhost:3000/dashboard
2. Click **"Start All Bots"** to begin domain discovery
3. Monitor real-time updates in the activity log
4. Watch live statistics and visualizations

### Dashboard Features
- **Real-time Statistics**: Total domains discovered, successful acquisitions, system uptime
- **Bot Status Cards**: Individual bot monitoring with progress indicators
- **Discovery Timeline**: Visual progress bars showing bot performance
- **Activity Filtering**: Filter by bot, event type, or asset type
- **Data Export**: Download complete bot data in JSON or CSV format

### Bot Specializations
- **🏹 Domain Hunter**: Premium domains (3s intervals, depth 3)
- **💎 Asset Seeker**: Digital assets (4s intervals, depth 2)  
- **🔍 Recursive Explorer**: Hidden gems (6s intervals, depth 5)

## 🤖 Autonomous Workflow

This repository includes a complete autonomous PR management system that handles:

- **Automated Testing**: Comprehensive validation of all changes
- **Security Scanning**: Automatic vulnerability detection
- **Auto-Review & Merge**: Intelligent PR processing without manual intervention
- **Production Deployment**: Seamless deployment after successful merges
- **Quality Assurance**: Multi-layer validation ensuring code quality

### Quick Setup
```bash
# Setup autonomous workflow
./scripts/setup-autonomous-workflow.sh

# Validate setup
node scripts/validate-setup.js
```

### Creating Auto-Merge PRs
Simply include `[auto]` in your PR title:
```
[auto] Update dependencies
[auto] Fix minor bug in dashboard
chore: update documentation
```

For complete details, see [AUTONOMOUS_WORKFLOW.md](AUTONOMOUS_WORKFLOW.md).

## 📁 Project Structure

```
├── .github/
│   ├── workflows/
│   │   ├── autonomous-pr-management.yml  # Autonomous workflow
│   │   └── deploy.yml                    # Original deployment
│   └── branch-protection-config.json    # Auto-merge configuration
├── bots/
│   └── botManager.js      # Bot management system
├── tests/
│   ├── bot-manager.test.js    # Bot functionality tests
│   └── server.test.js         # Server integration tests
├── scripts/
│   ├── setup-autonomous-workflow.sh  # Setup automation
│   └── validate-setup.js             # Validate configuration
├── dashboard.html         # Dashboard interface
├── dashboard.css          # Dashboard styling
├── dashboard.js          # Dashboard JavaScript
├── server.js             # Express server with WebSocket
├── index.html            # Portfolio homepage
├── AUTONOMOUS_WORKFLOW.md    # Autonomous system documentation
├── DASHBOARD_DOCUMENTATION.md  # Comprehensive dashboard docs
└── DOMAIN_BEST_PRACTICES.md   # Domain acquisition guidelines
```

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
- `npm test`: Run comprehensive test suite
- `npm run test:bot`: Run bot functionality tests
- `npm run test:server`: Run server integration tests
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