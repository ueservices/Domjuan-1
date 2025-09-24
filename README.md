# Domjuan - Domain Acquisition Platform

An automated domain acquisition platform with intelligent bot fleet management and digital currency payments.

## Features

- **5 Specialized Bots**: Nested, Hidden, Unexplored, Unseen, and Unfound domain discovery bots
- **Domain Search & Validation**: Real-time WHOIS lookup and domain availability checking
- **Digital Currency Payments**: Bitcoin, Ethereum, and Litecoin payment support
- **Portfolio Management**: Secure storage and management of acquired domains
- **CSV Export**: Bulk export of domain portfolios with auth codes
- **Bot Fleet Management**: Monitor and control automated domain acquisition bots

## Bot Roles

### Nested Bot
- **Role**: nested
- **Mission**: Finds nested and hierarchical domain opportunities
- **Focus**: Sub-domain potential and organizational structures

### Hidden Bot  
- **Role**: hidden
- **Mission**: Discovers hidden gem domains with untapped potential
- **Focus**: Undervalued assets with strong SEO potential

### Unexplored Bot
- **Role**: unexplored  
- **Mission**: Searches for unexplored domain territories
- **Focus**: New market segments and emerging trends

### Unseen Bot
- **Role**: unseen
- **Mission**: Locates unseen domain assets and opportunities
- **Focus**: Overlooked premium domains

### Unfound Bot
- **Role**: unfound
- **Mission**: Tracks down unfound and rare domain assets
- **Focus**: Rare and premium domain discoveries

## Quick Start

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

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

4. Start the platform:
```bash
npm start
```

5. Visit `http://localhost:3000` to access the domain acquisition platform

## API Endpoints

### Bot Management
- `GET /api/bots` - List all bots
- `GET /api/bots/:botId` - Get specific bot details

### Domain Operations
- `POST /api/domain/search` - Search for domains with a specific bot
- `POST /api/domain/validate` - Validate domain with WHOIS lookup
- `POST /api/domain/acquire` - Acquire a domain and add to portfolio

### Portfolio Management
- `GET /api/portfolio` - Get domain portfolio
- `GET /api/portfolio/export` - Export portfolio as CSV

## Domain Search

The platform uses specialized bots to search for domains based on different strategies:

1. **Enter Search Query**: Input keywords or domain patterns
2. **Select Bot**: Choose which bot strategy to use
3. **Review Results**: Analyze bot recommendations and pricing
4. **Validate Domains**: Run WHOIS checks for detailed information
5. **Acquire Domains**: Purchase with digital currency payments

## Digital Currency Payments

Supported cryptocurrencies:
- **Bitcoin (BTC)**: Primary payment method
- **Ethereum (ETH)**: Smart contract integration
- **Litecoin (LTC)**: Fast transaction processing

## Portfolio Export

Export your domain portfolio in CSV format containing:
- Domain name
- Acquisition bot
- Status
- Auth/Transfer codes
- Acquisition date
- Notes and recommendations

## Security Features

- **Content Security Policy (CSP)** protection
- **CORS** protection for API endpoints
- **Input validation** for all user inputs
- **Secure auth code storage** (encrypted in production)
- **Environment variable protection**

## Development

### File Structure

```
├── index.html          # Main platform interface
├── styles.css          # Domain acquisition UI styling
├── script.js           # Bot management and domain search logic
├── server.js           # Node.js API server
├── package.json        # Dependencies and scripts
├── .env.example        # Environment template
├── DOMAIN_BEST_PRACTICES.md  # Domain acquisition guidelines
└── README.md           # This file
```

### Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with auto-reload
- `npm test`: Run tests
- `npm run build`: Build for production

### Bot Configuration

Bots can be activated/deactivated and monitored through the web interface. Each bot maintains:
- Domain discovery count
- Active/inactive status
- Role-specific search algorithms
- Success rate metrics

## Production Deployment

1. Set production environment variables
2. Configure digital currency payment gateways
3. Set up domain registrar API integrations
4. Configure WHOIS service providers
5. Deploy to your preferred hosting platform

## Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Domain Services
WHOIS_API_KEY=your_whois_api_key
REGISTRAR_API_KEY=your_registrar_api_key

# Cryptocurrency Configuration
BTC_WALLET_ADDRESS=your_btc_address
ETH_WALLET_ADDRESS=your_eth_address
LTC_WALLET_ADDRESS=your_ltc_address
```

## Testing

### Manual Testing

1. Start the server: `npm start`
2. Navigate to bot management interface
3. Activate bots and perform domain searches
4. Test domain validation with WHOIS
5. Verify portfolio management and CSV export

### API Testing

```bash
# Test bot endpoints
curl http://localhost:3000/api/bots

# Test domain search
curl -X POST http://localhost:3000/api/domain/search \
  -H "Content-Type: application/json" \
  -d '{"query":"crypto","botId":"hidden"}'
```

## Support

For platform support and inquiries:
- Email: support@domjuan.com
- Bot Status: Monitor at /health endpoint
- Documentation: See DOMAIN_BEST_PRACTICES.md

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add domain acquisition features
4. Test with bot simulation
5. Submit a pull request

## Roadmap

- [ ] AI-powered domain valuation
- [ ] Integration with more registrars
- [ ] Advanced bot intelligence
- [ ] Domain portfolio analytics
- [ ] Automated renewal management
- [ ] Market trend analysis