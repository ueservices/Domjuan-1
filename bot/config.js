module.exports = {
    // Bot Core Configuration
    bot: {
        maxDepth: 5,
        scanInterval: '0 */6 * * *', // Every 6 hours
        enableAI: true,
        secureMode: true,
        outputDir: './bot/output',
        logLevel: 'info',
        maxAcquisitionCost: 1000, // USD
        botRoles: ['nested', 'hidden', 'unexplored', 'unseen', 'unfound'],
        maxConcurrentScans: 10,
        scanTimeout: 30000, // 30 seconds per domain
        retryAttempts: 3
    },

    // Domain Scanning Configuration
    scanner: {
        userAgent: 'DomjuanBot/1.0 (Autonomous Domain Discovery)',
        requestTimeout: 5000,
        maxRedirects: 3,
        enableDNSBruteForce: true,
        enableZoneFileAnalysis: true,
        enableSubdomainEnumeration: true,
        customWordlists: [
            'common-subdomains.txt',
            'crypto-keywords.txt',
            'hidden-directories.txt'
        ]
    },

    // Asset Discovery Configuration
    assets: {
        enableCryptoScanning: true,
        enableNFTDiscovery: true,
        enableDefiProtocolScanning: true,
        enableWalletDiscovery: true,
        enableBlockchainDomainScanning: true,
        cryptoSources: [
            'coingecko',
            'coinmarketcap',
            'dexscreener',
            'etherscan',
            'bscscan'
        ],
        nftMarketplaces: [
            'opensea',
            'rarible',
            'foundation',
            'superrare',
            'async'
        ]
    },

    // Registrar Integration Configuration
    registrars: {
        godaddy: {
            enabled: true,
            apiKey: process.env.GODADDY_API_KEY,
            apiSecret: process.env.GODADDY_API_SECRET,
            sandbox: process.env.NODE_ENV !== 'production',
            priority: 1,
            maxDailySpend: 500
        },
        namecheap: {
            enabled: true,
            apiKey: process.env.NAMECHEAP_API_KEY,
            username: process.env.NAMECHEAP_USERNAME,
            sandbox: process.env.NODE_ENV !== 'production',
            priority: 2,
            maxDailySpend: 300
        },
        spaceship: {
            enabled: true,
            apiKey: process.env.SPACESHIP_API_KEY,
            sandbox: process.env.NODE_ENV !== 'production',
            priority: 3,
            maxDailySpend: 400
        },
        afternic: {
            enabled: true,
            apiKey: process.env.AFTERNIC_API_KEY,
            sandbox: process.env.NODE_ENV !== 'production',
            priority: 4,
            maxDailySpend: 200,
            type: 'marketplace'
        }
    },

    // Security Configuration
    security: {
        encryptionAlgorithm: 'AES-256-GCM',
        hashAlgorithm: 'SHA-256',
        keyRotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 days
        enableTwoFactorAuth: true,
        maxFailedAttempts: 3,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
        apiRateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // requests per window
        }
    },

    // Export Configuration
    export: {
        formats: ['csv', 'json', 'encrypted'],
        autoBackup: true,
        backupRetention: 90, // days
        compressionLevel: 6,
        encryptExports: true,
        validateIntegrity: true
    },

    // AI Configuration (for future implementation)
    ai: {
        enabled: false, // Disabled for now
        provider: 'openai',
        model: 'gpt-4',
        maxTokens: 1000,
        temperature: 0.3,
        features: {
            domainValuePrediction: true,
            marketTrendAnalysis: true,
            AssetClassification: true,
            fraudDetection: true
        }
    },

    // Monitoring Configuration
    monitoring: {
        enableMetrics: true,
        enableHealthChecks: true,
        enableAlerts: true,
        metricsInterval: 60000, // 1 minute
        healthCheckInterval: 300000, // 5 minutes
        alertThresholds: {
            errorRate: 0.05, // 5%
            responseTime: 5000, // 5 seconds
            diskUsage: 0.9 // 90%
        }
    },

    // Database Configuration (for future implementation)
    database: {
        type: 'sqlite', // Start with SQLite for simplicity
        filename: './bot/data/discoveries.db',
        enableWAL: true,
        busyTimeout: 30000,
        backupInterval: 24 * 60 * 60 * 1000 // 24 hours
    },

    // Webhook Configuration
    webhooks: {
        enabled: false,
        endpoints: {
            discovery: process.env.WEBHOOK_DISCOVERY_URL,
            acquisition: process.env.WEBHOOK_ACQUISITION_URL,
            error: process.env.WEBHOOK_ERROR_URL
        },
        retryAttempts: 3,
        timeout: 10000
    }
};