# Domain Discovery Bot System

A fully autonomous domain discovery system that continuously scans for available domains across multiple specialized profiles.

## 🤖 Bot Profiles

The system includes 5 specialized bots, each targeting different domain discovery strategies:

### 1. **Nested Bot** (`nested`)
- **Focus**: Domains with nested structures and subdomain-like patterns
- **Examples**: `apitech.com`, `admin-portal.net`, `dev-platform.io`
- **Strategy**: Combines technical prefixes with base domains

### 2. **Hidden Bot** (`hidden`)
- **Focus**: Hidden gem domains that might be overlooked
- **Examples**: `vaultasset.com`, `secrethub.net`, `ghostly.app`
- **Strategy**: Searches for domains with subtle, valuable terms

### 3. **Unexplored Bot** (`unexplored`)
- **Focus**: Domains in emerging trends and unexplored niches
- **Examples**: `aifuture.io`, `web3space.dev`, `metaverse-hub.app`
- **Strategy**: Targets cutting-edge technology and trend combinations

### 4. **Unseen Bot** (`unseen`)
- **Focus**: Domains that are typically overlooked or invisible
- **Examples**: `invisible.com`, `transparent.net`, `minimal.app`
- **Strategy**: Finds subtle, minimalist, and easily missed domains

### 5. **Unfound Bot** (`unfound`)
- **Focus**: Domains that haven't been discovered by traditional methods
- **Examples**: `losttreasure.com`, `hiddenjem.io`, `mysteryvault.net`
- **Strategy**: Searches for rare, unique, and cryptic domain patterns

## 🚀 Quick Start

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. **Dependencies are already installed** (if you've run `npm install`)
2. **Configure the bots** (optional):
   ```bash
   cp bots/config/bot-config.example.env .env
   # Edit .env with your preferred settings
   ```

### Running the Bots

#### Start all bots (continuous operation):
```bash
npm run bots:start
```

#### Run a single scan cycle:
```bash
npm run bots:scan
```

#### Check bot status:
```bash
npm run bots:status
```

#### Export discovered domains:
```bash
npm run bots:export
```

#### Stop all bots:
```bash
npm run bots:stop
```

## 📊 Data Output

### File Locations

- **Data**: `./bots/data/`
- **Logs**: `./bots/logs/`
- **Exports**: CSV files in the data directory

### Output Formats

#### Individual Bot Data (JSON)
Each bot saves discovered domains to: `./bots/data/{profile}-domains.json`

#### CSV Exports
- Individual bot exports: `./bots/data/{profile}-domains-export.csv`
- Consolidated export: `./bots/data/all-domains-consolidated.csv`

#### CSV Format
```csv
Domain,Bot,Task,Status,AuthCode/TransferKey,Legit,AcquisitionDate,Notes
example.com,nested,nested,Available,N/A,Yes,2025-01-08T10:30:00Z,nested profile domain
```

## ⚙️ Configuration

### Environment Variables

```bash
# Bot scan settings
BOT_SCAN_INTERVAL=300000          # 5 minutes between scans
MAX_DOMAINS_PER_SCAN=5            # Domains to check per scan
MAX_CONCURRENT_BOTS=2             # Maximum bots running simultaneously

# Scheduling
ENABLE_SCHEDULING=true            # Enable automatic scheduling
SCHEDULE_PATTERN=*/30 * * * *     # Cron pattern (every 30 minutes)

# Rate limiting
WHOIS_RATE_LIMIT=1000            # Milliseconds between WHOIS requests

# Individual bot control
NESTED_BOT_ENABLED=true
HIDDEN_BOT_ENABLED=true
UNEXPLORED_BOT_ENABLED=true
UNSEEN_BOT_ENABLED=true
UNFOUND_BOT_ENABLED=true
```

### Advanced Configuration

Edit `./bots/config/bot-config.js` for detailed configuration options.

## 🔄 Automation Features

### Continuous Scanning
- Bots run continuously with configurable intervals
- Automatic staggering to avoid overwhelming WHOIS servers
- Built-in rate limiting and error handling

### Scheduled Tasks
- **Scan Schedule**: Every 30 minutes (configurable)
- **Daily Export**: Automatic CSV export at 2 AM
- **Data Consolidation**: Automatic merging of all bot data

### Error Handling
- Graceful error recovery
- Comprehensive logging
- Automatic retry logic for failed WHOIS lookups

## 📋 Monitoring and Logging

### Log Files
Each bot maintains its own log file in `./bots/logs/`:
- `nested-bot.log`
- `hidden-bot.log`
- `unexplored-bot.log`
- `unseen-bot.log`
- `unfound-bot.log`

### Log Format
```
[2025-01-08T10:30:00.000Z] [NESTED] [INFO] Starting nested domain scan...
[2025-01-08T10:30:01.000Z] [NESTED] [INFO] Generated 100 domain candidates
[2025-01-08T10:30:02.000Z] [NESTED] [INFO] Checking domain: apitech.com
[2025-01-08T10:30:03.000Z] [NESTED] [INFO] Found available domain: apitech.com
```

### Status Monitoring
```bash
npm run bots:status
```

Output:
```
📊 Bot Status:
   - Controller Running: true
   - Total Bots: 5
   - Individual Bot Status:
     • nested: 🟢 Running (3 domains discovered)
     • hidden: 🟢 Running (1 domains discovered)
     • unexplored: 🟢 Running (2 domains discovered)
     • unseen: 🟢 Running (0 domains discovered)
     • unfound: 🟢 Running (1 domains discovered)
```

## 🔒 Security Features

### Rate Limiting
- Built-in delays between WHOIS requests (1 second default)
- Staggered bot startup to avoid server overload
- Configurable maximum domains per scan

### Data Protection
- Structured data storage in JSON format
- CSV export with encryption support (configurable)
- No sensitive credentials stored in code

### Domain Validation
- Automatic legitimacy checking
- Suspicious pattern detection
- WHOIS data validation

## 🛠️ Development

### Architecture

```
bots/
├── lib/
│   ├── BaseDomainBot.js      # Base bot class
│   ├── NestedBot.js          # Nested domain bot
│   ├── HiddenBot.js          # Hidden domain bot
│   ├── UnexploredBot.js      # Unexplored domain bot
│   ├── UnseenBot.js          # Unseen domain bot
│   └── UnfoundBot.js         # Unfound domain bot
├── config/
│   ├── bot-config.js         # Main configuration
│   └── bot-config.example.env # Environment template
├── data/                     # Domain data storage
├── logs/                     # Bot logs
├── DomainBotController.js    # Main controller
└── run-bots.js              # CLI runner
```

### Adding New Bot Profiles

1. Create a new bot class extending `BaseDomainBot`
2. Implement the `generateDomainCandidates()` method
3. Add the bot to `DomainBotController.js`
4. Update configuration files

Example:
```javascript
const BaseDomainBot = require('./BaseDomainBot');

class CustomBot extends BaseDomainBot {
    constructor(config = {}) {
        super('custom', config);
    }

    async generateDomainCandidates() {
        // Your custom domain generation logic
        return ['example1.com', 'example2.net'];
    }
}

module.exports = CustomBot;
```

## 🚨 Important Notes

### WHOIS Rate Limiting
- The system includes built-in rate limiting to respect WHOIS server policies
- Default: 1 second between requests
- Adjust `WHOIS_RATE_LIMIT` if needed

### Legal Compliance
- Ensure compliance with domain registrar policies
- Respect WHOIS service terms of use
- Follow ICANN guidelines for domain research

### Resource Usage
- Monitor system resources when running multiple bots
- Adjust `MAX_CONCURRENT_BOTS` based on your system capacity
- Consider network bandwidth for WHOIS requests

## 📞 Support

For questions or issues:
1. Check the log files in `./bots/logs/`
2. Review the configuration in `./bots/config/`
3. Run `npm run bots:status` to check system status

## 🔄 Maintenance

### Regular Tasks
- Monitor log files for errors
- Export data regularly: `npm run bots:export`
- Check bot status: `npm run bots:status`
- Review discovered domains in `./bots/data/`

### Troubleshooting

#### Bots not starting
```bash
# Check configuration
npm run bots:status

# Review logs
tail -f bots/logs/*.log

# Test single scan
npm run bots:scan
```

#### No domains discovered
- Check network connectivity
- Verify WHOIS services are accessible
- Review domain generation logic in bot files
- Check rate limiting settings

This domain discovery bot system is designed to run autonomously and discover valuable domains across multiple specialized profiles. Monitor the logs and exports to track discovered domains and system performance.