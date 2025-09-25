# API Integration Guide

## Overview
This document details how the Domjuan-1 bot system integrates with real domain registrar APIs, replacing all previous mock/simulated functionality.

## ⚠️ Important Changes

### What Was Removed
- ❌ All `Math.random()` based domain generation
- ❌ Simulated domain availability checks
- ❌ Fake pricing and registrar assignment
- ❌ Mock domain acquisition logic
- ❌ Any fallback to simulation when APIs fail

### What Was Added
- ✅ Real GoDaddy API integration for domain search and availability
- ✅ Real Namecheap API integration for domain discovery
- ✅ Proper error handling for API failures
- ✅ Rate limiting to respect API quotas
- ✅ Comprehensive logging for all API interactions
- ✅ Demo mode for development without API credentials

## API Client Architecture

### GoDaddy Client (`bots/godaddyClient.js`)
- **Primary Use**: Premium domain discovery via Domain Hunter bot
- **Features**:
  - Domain availability checking
  - Domain search with multiple TLDs
  - Pricing information retrieval
  - Domain categorization
  - Rate limiting (1 second between requests)

### Namecheap Client (`bots/namecheapClient.js`)
- **Primary Use**: Digital asset domain discovery via Asset Seeker bot
- **Features**:
  - Batch domain availability checking
  - Premium domain identification
  - Domain variations generation
  - XML response parsing
  - Sandbox support for development

## Bot Behavior Changes

### Domain Hunter Bot
- **Before**: Generated random domain names with fake availability
- **After**: Uses GoDaddy API to search for actual available premium domains
- **Search Strategy**: Focuses on trending keywords (crypto, AI, NFT, tech)
- **Rate Limit**: 8 seconds between searches to respect API limits

### Asset Seeker Bot  
- **Before**: Randomly assigned asset categories to fake domains
- **After**: Uses Namecheap API to find domains related to digital assets
- **Search Strategy**: Targets asset-related keywords (NFT, DeFi, blockchain, fintech)
- **Rate Limit**: 10 seconds between searches
- **Filter**: Only processes domains that match asset-related criteria

### Recursive Explorer Bot
- **Before**: Simulated "depth" exploration with random domains
- **After**: Uses both APIs alternately to explore domain variations
- **Search Strategy**: Builds on discovered domains to find related variations
- **Depth Logic**: Real exploration of domain relationships and variations
- **Rate Limit**: 12 seconds between searches for deeper analysis

## Error Handling Strategy

### Production Mode (`NODE_ENV=production`)
- API credentials are **required**
- Any API initialization failure stops the application
- API request failures are logged and propagated as errors
- No fallback to mock data

### Development Mode (`NODE_ENV=development`)
- API credentials are optional
- Missing credentials trigger "demo mode" with simulated responses
- Real API calls still made if credentials are provided
- Sandbox APIs used where available (Namecheap)

## Rate Limiting & Best Practices

### GoDaddy API
- **Rate Limit**: 1000 requests per minute
- **Our Limit**: 1 request per second (3600/hour)
- **Endpoints Used**:
  - `/domains/available` - Domain availability
  - `/domains/suggest` - Domain suggestions

### Namecheap API
- **Rate Limit**: No official limit, but throttling recommended
- **Our Limit**: 1 request per second
- **Commands Used**:
  - `namecheap.domains.check` - Domain availability
  - `namecheap.users.getPricing` - TLD pricing

## Security Considerations

### API Key Management
- All API keys must be stored in environment variables
- Never commit API keys to version control
- Use different keys for development/production
- Regularly rotate API keys

### IP Whitelisting
- Namecheap requires IP whitelisting
- Ensure production server IP is whitelisted
- Update whitelist when deploying to new servers

### Domain Acquisition Safety
- All domain purchase/registration functions are disabled by default
- Requires manual enablement via `shouldAcquire = true` in bot code
- Actual purchases require additional contact information setup
- Logs all acquisition attempts for audit purposes

## Monitoring & Logging

### API Request Logging
- All API requests logged with endpoint and parameters
- Response status and error details captured
- Rate limiting delays logged for debugging

### Bot Activity Logging  
- Domain discovery events with full API response data
- Search query tracking for optimization
- Error rates and API failure patterns

### Health Monitoring
- API client initialization status
- Request success/failure rates
- Bot discovery rates and efficiency metrics

## Configuration Examples

### Production Environment
```bash
NODE_ENV=production

# GoDaddy Production API
GODADDY_API_KEY=your_production_api_key
GODADDY_API_SECRET=your_production_api_secret

# Namecheap Production API  
NAMECHEAP_API_USER=your_namecheap_username
NAMECHEAP_API_KEY=your_production_api_key
NAMECHEAP_USERNAME=your_namecheap_username
NAMECHEAP_CLIENT_IP=your_production_server_ip

# Stripe Production
STRIPE_SECRET_KEY=sk_live_your_live_key
```

### Development Environment
```bash
NODE_ENV=development

# Optional - will use demo mode if not provided
GODADDY_API_KEY=your_dev_api_key
GODADDY_API_SECRET=your_dev_api_secret

# Optional - will use demo mode if not provided
NAMECHEAP_API_USER=your_dev_username
NAMECHEAP_API_KEY=your_dev_api_key
NAMECHEAP_CLIENT_IP=127.0.0.1

# Test keys allowed only in development
STRIPE_SECRET_KEY=sk_test_your_test_key
```

## Troubleshooting

### Common Issues

1. **Bot initialization fails**
   - Check API credentials are correctly set
   - Verify environment variables are loaded
   - Ensure IP is whitelisted for Namecheap

2. **API rate limit errors**
   - Check if bot search intervals are too aggressive
   - Monitor API usage against quotas
   - Implement exponential backoff if needed

3. **Domain search returns no results**
   - Verify API credentials have correct permissions
   - Check if search queries are too specific
   - Ensure API endpoints are accessible

4. **Demo mode in production**
   - Set `NODE_ENV=production`
   - Verify all required API credentials are set
   - Check for typos in environment variable names

### Debug Commands
```bash
# Test API connectivity
curl -H "Authorization: sso-key YOUR_KEY:YOUR_SECRET" \
  "https://api.godaddy.com/v1/domains/available?domain=example.com"

# Check bot health
curl http://localhost:3000/health

# View logs
docker-compose logs -f
```

## Support & Resources

- [GoDaddy API Documentation](https://developer.godaddy.com/doc)
- [Namecheap API Documentation](https://www.namecheap.com/support/api/)
- [Stripe API Documentation](https://stripe.com/docs/api)