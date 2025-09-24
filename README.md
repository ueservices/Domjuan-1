# Domjuan-1 - Autonomous Domain Discovery Bot

An advanced AI-powered system for discovering and acquiring hidden digital domains, cryptocurrencies, NFTs, and rare digital assets with unmatched depth and precision.

## 🚀 Features

- **🔍 Deep Domain Scanning**: Multi-layered recursive scanning with DNS/WHOIS analysis and zone file brute-forcing
- **💎 Digital Asset Discovery**: Autonomous discovery of cryptocurrencies, NFTs, and rare digital collectibles  
- **🤖 AI-Powered Analysis**: Advanced algorithms for pattern recognition and value prediction
- **🏢 Multi-Registrar Support**: Integration with GoDaddy, Namecheap, Spaceship, Afternic, and other major platforms
- **🔒 Secure Export**: Encrypted data packaging with full metadata for bulk transfer and acquisition
- **⚡ Real-time Monitoring**: Live bot status and discovery tracking via web interface
- **🎯 Autonomous Acquisition**: Automated domain purchasing with intelligent strategy selection

## 🎯 Discovery Capabilities

### Domain Discovery
- Nested, hidden, and forgotten domains across all major registrars
- AI-powered domain valuation and market analysis
- Recursive subdomain enumeration and zone file analysis
- Historical domain data mining and archival research

### Digital Asset Discovery  
- Cryptocurrency wallet detection and balance analysis  
- NFT collection discovery and valuation
- DeFi protocol identification and TVL assessment
- Blockchain domain (.crypto, .eth, .nft) scanning
- Rare digital collectible identification

### Autonomous Acquisition
- Intelligent registrar selection based on cost and availability
- Multi-strategy acquisition (direct, auction, backorder, negotiation)
- Budget management and spending optimization
- Secure credential storage and transaction logging

## 🛠 Services Offered

1. **Full Autonomous Bot** - $500
   - Complete autonomous operation with 24/7 scanning
   - Multi-registrar integration and acquisition
   - Cryptocurrency & NFT discovery
   - Secure encrypted export package

2. **Custom Domain Scanning** - $1,200  
   - Targeted deep scanning with custom parameters
   - Priority acquisition assistance
   - Historical domain analysis and portfolio mining

3. **Digital Asset Analysis** - $100
   - In-depth cryptocurrency and NFT analysis
   - DeFi protocol assessment and valuation
   - Detailed asset reports and market insights

## 🚀 Quick Start

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- API keys for registrars (optional for basic scanning)

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
# Edit .env with your configuration
```

4. Create bot directories:
```bash
mkdir -p bot/output bot/data
```

5. Start the development server:
```bash
npm run dev
```

6. Visit `http://localhost:3000` to access the bot interface

## ⚙️ Configuration

### Environment Variables

```env
# Core Configuration
NODE_ENV=development
AUTO_START_BOT=false
BOT_LOG_LEVEL=info
BOT_MAX_DEPTH=5
BOT_MAX_ACQUISITION_COST=1000

# Registrar API Keys
GODADDY_API_KEY=your_godaddy_api_key
GODADDY_API_SECRET=your_godaddy_api_secret
NAMECHEAP_API_KEY=your_namecheap_api_key
SPACESHIP_API_KEY=your_spaceship_api_key
AFTERNIC_API_KEY=your_afternic_api_key

# Security
ENCRYPTION_KEY=your_32_character_encryption_key
```

### Bot Configuration

Edit `bot/config.js` to customize:
- Scanning depth and intervals
- Asset discovery parameters  
- Registrar priorities and budgets
- Security and export settings

## 🎮 Usage

### Web Interface

1. **Monitor Bot Status**: Check running status and discovery statistics
2. **Control Operations**: Start/stop bot and initiate manual scans
3. **Purchase Services**: Use integrated payment processing for premium features

### API Endpoints

```bash
# Get bot status
GET /api/bot/status

# Start/stop bot
POST /api/bot/start
POST /api/bot/stop

# Manual scan
POST /api/bot/scan

# Get discoveries
GET /api/bot/discoveries
```

### Command Line

```bash
# Start bot programmatically
node -e "
const Bot = require('./bot/core');
const config = require('./bot/config');
const bot = new Bot(config.bot);
bot.start();
"
```

## 🏗 Architecture

### Core Components

- **`bot/core.js`**: Main bot orchestration and session management
- **`bot/scanner.js`**: Domain scanning and DNS analysis engine  
- **`bot/assets.js`**: Digital asset discovery and valuation
- **`bot/registrars.js`**: Multi-registrar integration and acquisition
- **`bot/exporter.js`**: Secure data export and packaging
- **`bot/config.js`**: Configuration management

### Data Flow

1. **Discovery Session**: Bot initiates recursive domain scanning
2. **Asset Analysis**: Discovered domains analyzed for digital assets
3. **Acquisition**: Promising domains automatically acquired via registrars
4. **Export**: Results packaged with encryption for secure transfer

## 🔐 Security Features

- **AES-256-GCM Encryption**: All exported data encrypted with rotating keys
- **Secure Credential Storage**: API keys and auth codes encrypted at rest
- **Audit Logging**: Comprehensive logs for all bot operations
- **Rate Limiting**: API protection against abuse
- **Input Validation**: All domain and asset data validated
- **HTTPS-Only**: Secure communication for all registrar APIs

## 📊 Export Formats

### CSV Export
- Domains with metadata, acquisition details, and valuation
- Digital assets with blockchain information and estimated values
- Cryptocurrencies with wallet data and holdings

### JSON Export  
- Complete structured data with full metadata
- Nested relationships between domains and assets
- Session information and discovery analytics

### Secure Package
- AES-encrypted bundle with all discoveries
- Separate key file for maximum security  
- Integrity verification with SHA-256 hashes
- Comprehensive README for decryption

## 🚨 Production Deployment

### Environment Setup

```bash
# Set production environment
export NODE_ENV=production
export AUTO_START_BOT=true

# Configure registrar credentials
export GODADDY_API_KEY="your_production_key"
export GODADDY_API_SECRET="your_production_secret"
# ... additional registrar keys

# Security settings
export ENCRYPTION_KEY="your_32_character_production_key"
export BOT_MAX_ACQUISITION_COST=5000
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Process Management

```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name domjuan-bot
pm2 startup
pm2 save
```

## 📈 Monitoring & Analytics

### Bot Metrics
- Domains discovered per session
- Asset discovery success rates
- Acquisition costs and ROI
- Registrar performance comparison

### Export Analytics
- Data export frequency and volume
- Encryption key rotation tracking
- Package integrity verification

## 🛡 Best Practices

### Security
1. **Rotate encryption keys** every 30 days
2. **Store registrar API keys** in secure vaults
3. **Use HTTPS-only** for all communications
4. **Monitor bot logs** for suspicious activity
5. **Backup encrypted packages** to multiple locations

### Operations
1. **Test in sandbox mode** before production
2. **Set reasonable acquisition budgets** per domain
3. **Monitor registrar API limits** and costs
4. **Regular bot health checks** and status monitoring
5. **Audit discovered assets** before bulk transfers

## 🤝 Support

For technical support and questions:
- **Email**: contact@domjuan.com
- **Documentation**: See `DOMAIN_BEST_PRACTICES.md` for detailed workflows
- **Security**: See `SECURITY.md` for security guidelines

## 📄 License

MIT License - see LICENSE file for details

---

**⚠️ Important**: This bot operates with real registrar APIs and can make actual domain purchases. Always test in sandbox/development mode first and set appropriate budget limits.

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