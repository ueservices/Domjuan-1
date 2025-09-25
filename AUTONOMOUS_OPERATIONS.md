# Autonomous Domain Discovery Bot System Operations Guide

## Overview

The Domjuan Bot System is now fully autonomous - it requires **zero manual intervention** to operate, self-heal, monitor, backup, and deploy. This guide covers the autonomous features and how to set them up.

![Autonomous Bots in Action](https://github.com/user-attachments/assets/d5f7f218-9f87-4c9f-9243-05f27b6e00fc)

## 🤖 Autonomous Features

### ✅ Self-Healing & Recovery

- **Auto-restart failed bots** - Individual bots restart automatically after failures
- **Exponential backoff** - Smart retry logic prevents cascading failures
- **Process monitoring** - PM2/Docker healthchecks ensure system stays running
- **Resource management** - Automatic memory and CPU monitoring with alerts

### ✅ Zero-Touch Operations

- **Automated exports** - JSON/CSV data exports every 5 minutes (configurable)
- **Scheduled backups** - Daily automated backups with configurable retention
- **Log rotation** - Automatic log management and cleanup
- **Health monitoring** - Continuous system health checks with alerting

### ✅ Production Deployment

- **Docker containerization** - Ready-to-deploy container with healthchecks
- **CI/CD integration** - Zero-touch deployments via GitHub Actions
- **Multiple deployment targets** - Heroku, Vercel, Docker, systemd service
- **Environment configuration** - All settings via environment variables

### ✅ Monitoring & Alerting

- **Webhook notifications** - Discord/Slack alerts for discoveries and failures
- **Health endpoints** - RESTful health checks for monitoring systems
- **Performance metrics** - Real-time bot performance and resource usage
- **Automated alerts** - Cooldown-based alerting to prevent spam

## 🚀 Quick Start - Autonomous Setup

### Option 1: Docker (Recommended)

```bash
# Clone and start autonomous system
git clone https://github.com/ueservices/Domjuan-1.git
cd Domjuan-1

# Configure environment (copy and edit)
cp .env.example .env
# Edit .env with your webhook URLs and settings

# Start autonomous system
docker-compose up -d

# Verify system is healthy
curl http://localhost:3000/health
```

### Option 2: PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Install dependencies
npm install

# Start with PM2 (autonomous restarts, monitoring)
npm run pm2:start

# Check status
pm2 status
pm2 logs domjuan-bot-system
```

### Option 3: Systemd Service (Linux)

```bash
# Copy service file
sudo cp systemd/domjuan-bot-system.service /etc/systemd/system/

# Configure service user and paths in the service file
sudo systemctl daemon-reload
sudo systemctl enable domjuan-bot-system
sudo systemctl start domjuan-bot-system

# Check status
sudo systemctl status domjuan-bot-system
```

## 🔧 Configuration

### Environment Variables

All autonomous features are configured via environment variables:

```bash
# Core Autonomous Settings
AUTO_RESTART_BOTS=true              # Enable bot auto-restart
EXPORT_INTERVAL_MS=300000           # Export data every 5 minutes
MAX_CONSECUTIVE_ERRORS=5            # Max failures before bot stops
DATA_DIR=./data                     # Data storage directory

# Monitoring & Alerting
WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook
HEALTH_CHECK_INTERVAL_MS=60000      # Health check frequency

# Resource Limits
MAX_MEMORY_MB=400                   # Memory usage alert threshold
MAX_CPU_PERCENT=80                  # CPU usage alert threshold
MIN_FREE_DISK_MB=100               # Minimum free disk space

# Backup Configuration
BACKUP_DIR=./backups               # Backup storage directory
RETENTION_DAYS=30                  # How long to keep backups
COMPRESS_BACKUPS=true              # Compress backup files
```

### Webhook Notifications

Configure Discord or Slack webhooks to receive autonomous system notifications:

**Discord Setup:**

1. Go to your Discord server settings → Integrations → Webhooks
2. Create a new webhook and copy the URL
3. Set `WEBHOOK_URL` environment variable

**Slack Setup:**

1. Go to your Slack workspace → Apps → Incoming Webhooks
2. Create webhook and copy URL
3. Set `WEBHOOK_URL` environment variable

### Automated Scheduling

Add to your crontab for additional automation:

```bash
# Copy example crontab
cp crontab.example /tmp/domjuan-cron
crontab /tmp/domjuan-cron

# Key scheduled tasks:
# - Health monitoring every 5 minutes
# - Daily backups at 2:00 AM
# - Weekly restarts for maintenance
# - Monthly cleanup of old data
```

## 📊 Monitoring Endpoints

### Health Check

```bash
# Basic health status
curl http://localhost:3000/health

# Detailed system status
curl http://localhost:3000/api/status | jq '.'
```

### Bot Control (API)

```bash
# Start all bots
curl -X POST http://localhost:3000/api/start-bots

# Stop all bots
curl -X POST http://localhost:3000/api/stop-bots

# Restart all bots
curl -X POST http://localhost:3000/api/restart-bots
```

### Data Export

```bash
# Export current data as JSON
curl http://localhost:3000/api/export/json -o domains.json

# Export current data as CSV
curl http://localhost:3000/api/export/csv -o domains.csv
```

## 🔄 Self-Healing Mechanisms

### Bot-Level Recovery

- Individual bots detect failures and restart with exponential backoff
- Maximum consecutive error limits prevent infinite restart loops
- Health status tracking identifies unhealthy bots

### System-Level Recovery

- PM2/Docker automatically restart the entire application if it crashes
- Healthcheck endpoints enable external monitoring systems to detect issues
- Webhook notifications alert administrators to critical failures

### Data Protection

- Automated daily backups with configurable retention
- Periodic data exports ensure no data loss
- Backup verification checks ensure backup integrity

## 📈 Performance Monitoring

### Resource Usage

The system automatically monitors:

- Memory usage with configurable thresholds
- CPU usage tracking and alerts
- Disk space monitoring for data directory
- Network connectivity for webhook notifications

### Bot Performance

- Discovery success rates per bot
- Domain acquisition rates
- Error rates and consecutive failure tracking
- Individual bot uptime and activity

## 🔧 Troubleshooting Autonomous Issues

### System Not Starting

1. Check environment variables are set correctly
2. Verify data/logs directories exist and are writable
3. Check port 3000 is available
4. Review startup logs for errors

### Bots Not Running

1. Check health endpoint: `curl http://localhost:3000/health`
2. Manually start bots: `curl -X POST http://localhost:3000/api/start-bots`
3. Review bot error logs in the dashboard
4. Verify auto-restart is enabled: `AUTO_RESTART_BOTS=true`

### Missing Notifications

1. Verify webhook URL is correct and accessible
2. Check webhook service (Discord/Slack) is accepting requests
3. Review webhook logs in system output
4. Test webhook manually with curl

### Data Export Issues

1. Check data directory exists and is writable
2. Verify disk space is sufficient
3. Test manual export via API endpoints
4. Review export logs for specific errors

## 🚀 Zero-Touch Deployment

### GitHub Actions (Automatic)

The system deploys automatically on every push to main:

1. Code is tested across multiple Node.js versions
2. Docker image is built and pushed
3. Application is deployed to Heroku/Vercel
4. Health checks verify successful deployment
5. Slack notifications confirm deployment status

### Manual Deployment Commands

```bash
# Deploy to Heroku
npm run deploy:heroku

# Build and run Docker
npm run docker:build
npm run docker:run

# Deploy with PM2
npm run pm2:start
```

## 📋 Maintenance Tasks (Automated)

All maintenance is automated via cron jobs:

- **Every 5 minutes**: Health monitoring and alerting
- **Every hour**: Data export and backup verification
- **Daily**: Full system backup and log rotation
- **Weekly**: Bot restart for maintenance and cleanup
- **Monthly**: Old data cleanup and system health report

## ✅ Success Verification

Your autonomous system is working correctly when:

1. **Health endpoint returns "healthy"** - `curl http://localhost:3000/health`
2. **Bots are actively discovering domains** - Check dashboard at `http://localhost:3000/dashboard`
3. **Automated exports are created** - Check `./data/` directory for recent files
4. **Webhook notifications are received** - Domain discoveries trigger alerts
5. **System self-heals from failures** - Bots restart automatically after errors

## 🎯 Achievement: "Never Touch the Button Again"

Once configured, this system:

- ✅ Runs indefinitely without manual intervention
- ✅ Recovers automatically from all types of failures
- ✅ Backs up data and exports discoveries continuously
- ✅ Deploys updates automatically via CI/CD
- ✅ Monitors itself and sends alerts when needed
- ✅ Maintains optimal performance through automated restarts

**The button has been eliminated. The system is truly autonomous.**
