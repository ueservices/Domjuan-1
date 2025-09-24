/**
 * Domain Bot Configuration
 * Central configuration for all domain discovery bots
 */

module.exports = {
    // General bot settings
    scanInterval: process.env.BOT_SCAN_INTERVAL || 300000, // 5 minutes
    maxDomainsPerScan: process.env.MAX_DOMAINS_PER_SCAN || 2, // Reduced for testing
    maxConcurrentBots: process.env.MAX_CONCURRENT_BOTS || 2,
    
    // Directory settings
    dataDir: process.env.BOT_DATA_DIR || '/home/runner/work/Domjuan-1/Domjuan-1/bots/data',
    logDir: process.env.BOT_LOG_DIR || '/home/runner/work/Domjuan-1/Domjuan-1/bots/logs',
    
    // Scheduling
    enableScheduling: process.env.ENABLE_SCHEDULING !== 'false',
    schedulePattern: process.env.SCHEDULE_PATTERN || '*/30 * * * *', // Every 30 minutes
    
    // Output settings
    outputFormat: process.env.OUTPUT_FORMAT || 'csv',
    encryptOutput: process.env.ENCRYPT_OUTPUT === 'true',
    
    // Rate limiting to avoid overwhelming WHOIS servers
    whoisRateLimit: process.env.WHOIS_RATE_LIMIT || 1000, // 1 second between requests
    
    // Security settings
    rotateCredentials: process.env.ROTATE_CREDENTIALS === 'true',
    credentialRotationInterval: process.env.CREDENTIAL_ROTATION_INTERVAL || 86400000, // 24 hours
    
    // Bot-specific configurations
    bots: {
        nested: {
            enabled: process.env.NESTED_BOT_ENABLED !== 'false',
            priority: 1,
            maxDomains: 10
        },
        hidden: {
            enabled: process.env.HIDDEN_BOT_ENABLED !== 'false',
            priority: 2,
            maxDomains: 8
        },
        unexplored: {
            enabled: process.env.UNEXPLORED_BOT_ENABLED !== 'false',
            priority: 3,
            maxDomains: 12
        },
        unseen: {
            enabled: process.env.UNSEEN_BOT_ENABLED !== 'false',
            priority: 4,
            maxDomains: 7
        },
        unfound: {
            enabled: process.env.UNFOUND_BOT_ENABLED !== 'false',
            priority: 5,
            maxDomains: 9
        }
    }
};