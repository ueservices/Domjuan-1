# Autonomous Domain Discovery Bot System

**🤖 Fully Autonomous • Zero-Touch Operation • Self-Healing • Production-Ready**

An advanced autonomous domain discovery system featuring three specialized bots with comprehensive real-time monitoring, automatic failover, and zero-touch deployment. **Never touch the button again.**

![Autonomous System Dashboard](https://github.com/user-attachments/assets/d5f7f218-9f87-4c9f-9243-05f27b6e00fc)

## 🌟 Autonomous Features

- **🔄 Self-Healing**: Bots automatically restart after failures with exponential backoff
- **📊 Zero-Touch Monitoring**: Continuous health checks with Discord/Slack alerts  
- **💾 Automated Backups**: Daily backups with configurable retention and cleanup
- **📈 Real-time Analytics**: Live dashboard with performance metrics and export capabilities
- **🚀 CI/CD Integration**: Automatic deployments via GitHub Actions
- **🐳 Container Ready**: Production Docker setup with healthchecks
- **⚡ Multi-Platform**: Deploy to Heroku, Vercel, Docker, or systemd service

## 🤖 Bot System Features

### Three Specialized Autonomous Bots:

- **Domain Hunter** - Uses real GoDaddy API for premium domain discovery
- **Asset Seeker** - Uses real Namecheap API for digital asset domains (NFT, DeFi, Gaming, SaaS)
- **Recursive Explorer** - Uses both APIs for deep hidden gem domain discovery
- **Real-time Dashboard** - Live monitoring, filtering, and export capabilities
- **WebSocket Integration** - Instant updates without page refresh

### ⚠️ Important: Real API Integration Only

This system now uses **REAL** domain registrar APIs exclusively:
- ✅ **GoDaddy API** - For domain availability and premium domain discovery
- ✅ **Namecheap API** - For domain search and digital asset domain discovery  
- ✅ **Stripe API** - Real payment processing only (no test keys in production)
- ❌ **NO MOCK DATA** - All simulated/fake domain generation has been removed
- ❌ **NO FALLBACKS** - API failures surface as errors, no fake data returned

### API Credentials Required

For production use, you **must** configure real API credentials:

```bash
# GoDaddy API Credentials (required for Domain Hunter bot)
GODADDY_API_KEY=your_actual_godaddy_api_key
GODADDY_API_SECRET=your_actual_godaddy_api_secret

# Namecheap API Credentials (required for Asset Seeker bot)
NAMECHEAP_API_USER=your_actual_namecheap_api_user
NAMECHEAP_API_KEY=your_actual_namecheap_api_key
NAMECHEAP_USERNAME=your_namecheap_username
NAMECHEAP_CLIENT_IP=your_whitelisted_ip_address

# Stripe (production requires real keys)
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_secret_key
```

**Development Mode**: The system runs in demo mode without API credentials but requires them for production.

## 📊 Dashboard Capabilities

- 🔴 **Live Bot Monitoring** - Real-time status and progress tracking
- 📈 **Interactive Visualizations** - Discovery timelines and performance metrics
- 🔍 **Advanced Filtering** - Filter by bot, event type, and asset type
- 📁 **Data Export** - JSON and CSV export functionality
- ⏱️ **Real-time Activity Log** - Timestamped activity tracking
- 🎨 **Modern UI** - Glassmorphism design with responsive layout

## 🔧 API Configuration Setup

### Required API Accounts & Keys

#### 1. GoDaddy API Setup
1. Visit [GoDaddy Developer Portal](https://developer.godaddy.com/)
2. Create a developer account and generate API keys
3. Add to your `.env` file:
   ```bash
   GODADDY_API_KEY=your_api_key_here
   GODADDY_API_SECRET=your_api_secret_here
   ```

#### 2. Namecheap API Setup  
1. Visit [Namecheap API Documentation](https://www.namecheap.com/support/api/)
2. Enable API access in your Namecheap account
3. Whitelist your server IP address
4. Add to your `.env` file:
   ```bash
   NAMECHEAP_API_USER=your_username
   NAMECHEAP_API_KEY=your_api_key
   NAMECHEAP_USERNAME=your_username
   NAMECHEAP_CLIENT_IP=your_server_ip
   ```

#### 3. Stripe API Setup
1. Visit [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your live API keys (for production)
3. Add to your `.env` file:
   ```bash
   STRIPE_SECRET_KEY=sk_live_your_live_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
   ```

### Environment Configuration

Copy the example environment file and configure your API credentials:

```bash
cp .env.example .env
# Edit .env with your actual API credentials
```

⚠️ **Security Note**: Never commit API credentials to version control. Use environment variables or secure secret management.

## 🚀 Quick Start - Autonomous Setup

### Option 1: Docker (Recommended for Production)
```bash
git clone https://github.com/ueservices/Domjuan-1.git
cd Domjuan-1

# Configure autonomous settings
cp .env.example .env
# Edit .env with your webhook URLs and monitoring settings

# Start the autonomous system
docker-compose up -d

# Verify system health
curl http://localhost:3000/health
```

### Option 2: Traditional Setup
```bash
git clone https://github.com/ueservices/Domjuan-1.git
cd Domjuan-1
npm install

# Start autonomous system
AUTO_RESTART_BOTS=true EXPORT_INTERVAL_MS=300000 npm start

# Or use PM2 for production
npm run pm2:start
```

**System URLs:**
- **Bot Dashboard**: http://localhost:3000/dashboard (Real-time monitoring)
- **Health Check**: http://localhost:3000/health (System status)
- **Portfolio Site**: http://localhost:3000 (Main site)

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

## 📊 Autonomous Operations

### Self-Healing & Recovery
The system automatically handles failures without manual intervention:
- Individual bot restart with exponential backoff
- System-wide health monitoring and alerting
- Automatic resource management and cleanup
- Data backup verification and rotation

### Zero-Touch Monitoring
```bash
# System health (JSON response)
curl http://localhost:3000/health

# Detailed status with bot metrics
curl http://localhost:3000/api/status | jq '.'

# Control bots programmatically
curl -X POST http://localhost:3000/api/start-bots
curl -X POST http://localhost:3000/api/restart-bots
```

### Automated Data Management
- **Continuous Export**: JSON/CSV exports every 5 minutes
- **Daily Backups**: Compressed backups with 30-day retention
- **Log Rotation**: Automatic cleanup of application logs
- **Health Reports**: Weekly system health summaries

See [AUTONOMOUS_OPERATIONS.md](./AUTONOMOUS_OPERATIONS.md) for complete autonomous setup guide.

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

## 📁 Project Structure

```
├── bots/
│   └── botManager.js      # Bot management system
├── dashboard.html         # Dashboard interface
├── dashboard.css          # Dashboard styling
├── dashboard.js          # Dashboard JavaScript
├── server.js             # Express server with WebSocket
├── index.html            # Portfolio homepage
├── DASHBOARD_DOCUMENTATION.md  # Comprehensive dashboard docs
└── DOMAIN_BEST_PRACTICES.md   # Domain acquisition guidelines
```

## 📁 Project Structure

```
├── bots/
│   └── botManager.js         # Enhanced autonomous bot management
├── scripts/
│   ├── monitor.sh           # Automated health monitoring  
│   └── backup.sh            # Automated backup system
├── systemd/
│   └── domjuan-bot-system.service  # Linux systemd service
├── dashboard.html           # Real-time dashboard interface
├── dashboard.css            # Dashboard styling
├── dashboard.js             # Dashboard JavaScript with filters
├── server.js                # Express server with health endpoints
├── Dockerfile               # Production container configuration
├── docker-compose.yml       # Multi-service deployment
├── ecosystem.config.js      # PM2 process management
├── crontab.example          # Automated scheduling template
├── .env.example             # Environment configuration template
├── AUTONOMOUS_OPERATIONS.md # Complete autonomous setup guide
└── DASHBOARD_DOCUMENTATION.md # Dashboard feature documentation
```

## 🚀 Production Deployment

### Automated Deployment (Zero-Touch)
The system deploys automatically via GitHub Actions on every push to main:

1. **Multi-platform testing** across Node.js 18.x, 20.x, 22.x
2. **Docker image build** and push to registry
3. **Deployment to Heroku/Vercel** with health verification
4. **Slack notifications** confirming deployment status

### Manual Deployment Options

#### Docker Production Deployment
```bash
# Build and deploy with health monitoring
docker-compose up -d

# View system logs
docker-compose logs -f

# Scale if needed (multiple instances)
docker-compose up -d --scale domjuan-bot-system=2
```

#### Heroku Deployment
```bash
# Automatic via GitHub integration or manual:
git push heroku main

# Verify deployment
curl https://your-app.herokuapp.com/health
```

#### PM2 Production Setup
```bash
# Install PM2 globally
npm install -g pm2

# Start with production configuration
npm run pm2:start

# Setup PM2 startup script (Linux)
pm2 startup
pm2 save
```

### Environment Variables

Set the following environment variables for autonomous operation:

```bash
# Core Autonomous Settings
AUTO_RESTART_BOTS=true              # Enable automatic bot restart
EXPORT_INTERVAL_MS=300000           # Data export frequency (5 minutes)
MAX_CONSECUTIVE_ERRORS=5            # Bot failure tolerance
DATA_DIR=./data                     # Data storage location

# Monitoring & Alerting  
WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url
HEALTH_CHECK_INTERVAL_MS=60000      # Health monitoring frequency

# System Limits
MAX_MEMORY_MB=400                   # Memory usage threshold
MAX_CPU_PERCENT=80                  # CPU usage threshold
MIN_FREE_DISK_MB=100               # Disk space threshold

# Legacy Payment Processing (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key  
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Deployment Platforms

The autonomous system is compatible with:

- **Docker/Docker Compose** (Recommended - includes healthchecks)
- **Heroku** (Automatic GitHub integration)
- **Vercel** (Serverless deployment)
- **Railway** (Container deployment)
- **Render** (Fully managed)
- **DigitalOcean App Platform**
- **AWS Elastic Beanstalk** 
- **Google Cloud Run**
- **Linux servers** (systemd service included)

## 🔧 Autonomous Monitoring

### Health Endpoints
```bash
# Basic health check (for load balancers)
curl http://localhost:3000/health

# Detailed system status
curl http://localhost:3000/api/status

# Export current data
curl http://localhost:3000/api/export/json
curl http://localhost:3000/api/export/csv
```

### Automated Monitoring
The system includes monitoring scripts that can be scheduled via cron:

```bash
# Copy monitoring configuration
cp crontab.example /tmp/domjuan-cron
crontab /tmp/domjuan-cron

# Manual monitoring test
./scripts/monitor.sh
./scripts/backup.sh
```

### Webhook Notifications
Configure Discord or Slack webhooks to receive autonomous system alerts:
- Domain discovery notifications
- System health alerts  
- Backup completion confirmations
- Critical failure warnings

## 🧪 Testing Autonomous Features

### Health Check Testing
```bash
# Start system and test health
npm start &
sleep 10
curl http://localhost:3000/health

# Test bot control endpoints
curl -X POST http://localhost:3000/api/start-bots
curl -X POST http://localhost:3000/api/restart-bots
```

### Docker Testing
```bash
# Build and test container
npm run docker:build
npm run docker:run

# Verify container health
docker-compose ps
curl http://localhost:3000/health
```

### Failure Recovery Testing
```bash
# Test bot auto-restart (simulate failure)
curl -X POST http://localhost:3000/api/stop-bots
# Wait 10 seconds - bots should auto-restart if AUTO_RESTART_BOTS=true
curl http://localhost:3000/health
```

## 📚 Documentation

- **[AUTONOMOUS_OPERATIONS.md](./AUTONOMOUS_OPERATIONS.md)** - Complete autonomous setup guide
- **[DASHBOARD_DOCUMENTATION.md](./DASHBOARD_DOCUMENTATION.md)** - Dashboard features and usage
- **[DOMAIN_BEST_PRACTICES.md](./DOMAIN_BEST_PRACTICES.md)** - Domain acquisition guidelines  
- **[SECURITY.md](./SECURITY.md)** - Security configuration and best practices
- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Development and deployment practices

## 🎯 Achievement: Zero-Touch Operation

This system achieves true autonomous operation:

✅ **Self-Healing**: Automatic recovery from all failure types  
✅ **Zero-Touch Deployment**: CI/CD pipeline handles all deployments  
✅ **Autonomous Monitoring**: Continuous health checks with smart alerting  
✅ **Data Management**: Automated backups, exports, and cleanup  
✅ **Resource Management**: Memory, CPU, and disk monitoring with limits  
✅ **Multi-Platform**: Deploy anywhere with consistent behavior  

**The button has been eliminated. Manual intervention is no longer required.**

## 📊 Performance & Scaling

### Resource Usage
- **Memory**: ~50-100MB base + 10MB per active bot
- **CPU**: Minimal when idle, bursts during discovery/acquisition  
- **Disk**: Grows with discovered domains (~1MB per 1000 domains)
- **Network**: Webhook notifications and health checks only

### Horizontal Scaling
```bash
# Scale with Docker Compose
docker-compose up -d --scale domjuan-bot-system=3

# Scale with PM2
pm2 scale domjuan-bot-system 3
```

## 🤝 Support & Maintenance

### Automated Maintenance
All maintenance is automated:
- Daily backups and log rotation
- Weekly system restarts and cleanup  
- Monthly old data purging
- Continuous health monitoring

### Manual Support (Rarely Needed)
```bash
# Check system status
npm run health

# View system logs  
npm run pm2:logs        # PM2
npm run docker:logs     # Docker

# Emergency stop/start
npm run pm2:stop
npm run pm2:start
```

### Troubleshooting
If the autonomous system needs attention:
1. Check health endpoint: `curl http://localhost:3000/health`
2. Review recent webhook notifications
3. Examine application logs for errors
4. Verify environment variables are set correctly
5. Ensure adequate disk space and memory

The system is designed to self-diagnose and self-heal from most issues automatically.

## 📈 Success Metrics

Monitor these metrics to verify autonomous operation:
- **System Uptime**: 99.9%+ expected with auto-restart
- **Bot Discovery Rate**: Consistent domain discoveries per hour
- **Auto-Recovery Rate**: Failed bots restart within 30 seconds
- **Data Export Success**: Automated exports every 5 minutes
- **Backup Success**: Daily backups with integrity verification

## License

MIT License - see LICENSE file for details