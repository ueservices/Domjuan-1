# Copilot Instructions for Domjuan-1

## Repository Overview

This is an **Autonomous Domain Discovery Bot System** - a Node.js/Express application featuring three specialized autonomous bots with real-time monitoring, automatic failover, and zero-touch deployment capabilities.

### Core Architecture
- **Backend**: Node.js/Express server with WebSocket integration
- **Frontend**: Vanilla HTML/CSS/JavaScript with real-time dashboard
- **Bot System**: Three specialized autonomous domain discovery bots
- **Database**: File-based data storage with automated backups
- **Deployment**: Multi-platform support (Docker, Heroku, Vercel, PM2, systemd)

## Project Structure

```
├── server.js                  # Main Express server with WebSocket support
├── bots/botManager.js         # Bot management system and core logic
├── dashboard.html             # Real-time dashboard interface
├── dashboard.js               # Dashboard JavaScript with WebSocket client
├── dashboard.css              # Dashboard styling (glassmorphism design)
├── index.html                 # Portfolio homepage
├── scripts/                   # Automation scripts
│   ├── monitor.sh            # Health monitoring script
│   └── backup.sh             # Automated backup system
├── .github/workflows/         # CI/CD pipeline configurations
├── docker-compose.yml         # Multi-service deployment
├── ecosystem.config.js        # PM2 process management
└── docs/                      # Comprehensive documentation
    ├── AUTONOMOUS_OPERATIONS.md
    ├── DASHBOARD_DOCUMENTATION.md
    ├── DOMAIN_BEST_PRACTICES.md
    ├── SECURITY.md
    └── BEST_PRACTICES.md
```

## Development Guidelines

### Code Style and Standards
- **JavaScript**: Use ES6+ features, async/await for asynchronous operations
- **Error Handling**: Always implement proper error handling with try-catch blocks
- **Logging**: Use structured logging with timestamps for debugging
- **Security**: Follow helmet.js security headers and input validation practices
- **WebSocket**: Use socket.io for real-time communication between client and server

### Bot System Specific Rules
- **Bot Classes**: Each bot should extend base bot functionality from botManager.js
- **State Management**: Bots maintain state through event emitters and status tracking
- **Interval Management**: Use proper cleanup for setInterval/setTimeout to prevent memory leaks
- **Health Monitoring**: Implement health checks and error recovery mechanisms
- **Data Persistence**: Store bot data in JSON format with atomic write operations

### Testing and Quality Assurance
- **Health Endpoints**: Always test `/health` endpoint functionality
- **WebSocket Testing**: Verify real-time updates and connection stability
- **Bot Simulation**: Test bot operations without actual domain purchases
- **Load Testing**: Verify dashboard performance with multiple concurrent connections
- **Security Testing**: Run `npm audit` and address vulnerabilities

### Dependencies and Versions
- **Node.js**: Minimum version 18.0.0
- **Key Dependencies**: Express, Socket.io, Helmet, Stripe, CORS
- **Development Tools**: Nodemon for development, PM2 for production
- **Version Pinning**: Pin action versions in workflows, use exact versions for critical dependencies

## Deployment and Operations

### Environment Configuration
- **Environment Variables**: Use `.env` files, never commit secrets
- **Required Variables**: PORT, NODE_ENV, STRIPE_SECRET_KEY, WEBHOOK_URL
- **Optional Variables**: AUTO_RESTART_BOTS, EXPORT_INTERVAL_MS, BACKUP_DIR

### Production Deployment
- **Docker**: Preferred deployment method with health checks
- **PM2**: Alternative for traditional server deployments
- **Monitoring**: Implement webhook notifications for Discord/Slack
- **Backups**: Daily automated backups with configurable retention

### CI/CD Pipeline
- **Testing**: Multi-Node.js version matrix testing (18.x, 20.x, 22.x)
- **Security**: Automated vulnerability scanning with npm audit
- **Docker**: Automated container builds and pushes
- **Multi-Platform**: Automatic deployment to Heroku, Vercel, and Docker registry

## Bot System Architecture

### Three Specialized Bots
1. **Domain Hunter**: Premium domain discovery (3s intervals, depth 3)
2. **Asset Seeker**: Digital asset domains (4s intervals, depth 2)
3. **Recursive Explorer**: Hidden gem domains (6s intervals, depth 5)

### Bot Development Patterns
- **Event-Driven**: Use EventEmitter pattern for bot communication
- **Autonomous Operation**: Implement self-healing and auto-restart capabilities
- **Rate Limiting**: Respect search intervals and implement backoff strategies
- **Data Export**: Support JSON and CSV export formats
- **Real-time Updates**: Emit events for dashboard consumption via WebSocket

## Security Considerations

### Application Security
- **Helmet.js**: Security headers with CSP configuration
- **Input Validation**: Sanitize all user inputs and API parameters
- **CORS**: Proper cross-origin configuration
- **Rate Limiting**: Implement for API endpoints and WebSocket connections
- **Secrets Management**: Use environment variables and encrypted storage

### Bot Operations Security
- **Payment Security**: Stripe integration with proper error handling
- **Domain Validation**: Verify domain legitimacy before acquisition
- **Auth Code Storage**: Encrypted storage of transfer authentication codes
- **Audit Logging**: Comprehensive logging of all bot activities

## Dashboard Development

### Frontend Architecture
- **Vanilla JavaScript**: No framework dependencies for simplicity
- **WebSocket Client**: Real-time updates using socket.io-client
- **Responsive Design**: Mobile-first approach with glassmorphism styling
- **Data Visualization**: Custom charts and progress indicators
- **Export Functionality**: Client-side JSON/CSV generation

### Dashboard Features to Maintain
- **Real-time Monitoring**: Live bot status and activity updates
- **Filtering System**: Bot, event type, and asset type filters
- **Export Capabilities**: Full data export in multiple formats
- **Performance Metrics**: Success rates, discovery timelines, statistics
- **Activity Logging**: Timestamped event history with persistence

## Common Patterns and Anti-Patterns

### ✅ Do This
- Use async/await for asynchronous operations
- Implement proper error boundaries and recovery
- Emit events for real-time dashboard updates
- Use atomic file operations for data persistence
- Implement exponential backoff for retries
- Test health endpoints in all deployments
- Use structured logging with timestamps

### ❌ Avoid This
- Blocking synchronous operations in the main thread
- Hardcoding configuration values
- Ignoring WebSocket connection errors
- Memory leaks from uncleaned intervals
- Exposing sensitive data in client-side code
- Skip error handling in bot operations
- Commit secrets or API keys

## Integration Guidelines

### Adding New Bot Types
1. Extend the base bot pattern in botManager.js
2. Implement required methods: start(), stop(), getStatus()
3. Add WebSocket event emissions for dashboard updates
4. Include configuration options and health monitoring
5. Update dashboard UI to display new bot type

### API Extensions
- Follow REST conventions for new endpoints
- Implement proper error responses and status codes
- Add health check validations for new features
- Document new endpoints in appropriate documentation files
- Include authentication/authorization as needed

### Dashboard Extensions
- Maintain responsive design principles
- Use existing WebSocket event patterns
- Implement proper error handling for new features
- Follow existing filter and export patterns
- Update documentation for new UI components

## Testing Strategy

### Unit Testing
- Bot functionality and state management
- WebSocket event handling
- Data persistence and retrieval
- Health check endpoints

### Integration Testing
- End-to-end bot workflows
- Dashboard real-time updates
- Export functionality
- Multi-platform deployment validation

### Performance Testing
- WebSocket connection handling under load
- Bot operation efficiency and resource usage
- Dashboard rendering with large datasets
- Memory leak detection and prevention

Remember: This system is designed for autonomous operation with minimal human intervention. Maintain this principle when making changes and always implement proper monitoring and alerting mechanisms.