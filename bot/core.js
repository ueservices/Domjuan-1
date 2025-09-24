const winston = require('winston');
const cron = require('node-cron');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const DomainScanner = require('./scanner');
const AssetDiscovery = require('./assets');
const RegistrarIntegration = require('./registrars');
const DataExporter = require('./exporter');

class AutonomousDomainBot {
    constructor(config = {}) {
        this.config = {
            maxDepth: config.maxDepth || 5,
            scanInterval: config.scanInterval || '0 */6 * * *', // Every 6 hours
            enableAI: config.enableAI !== false,
            secureMode: config.secureMode !== false,
            outputDir: config.outputDir || './bot/output',
            logLevel: config.logLevel || 'info',
            botRoles: config.botRoles || ['nested', 'hidden', 'unexplored', 'unseen', 'unfound'],
            ...config
        };

        this.setupLogger();
        this.scanner = new DomainScanner(this.config, this.logger);
        this.assetDiscovery = new AssetDiscovery(this.config, this.logger);
        this.registrars = new RegistrarIntegration(this.config, this.logger);
        this.exporter = new DataExporter(this.config, this.logger);
        
        this.discoveries = {
            domains: new Map(),
            assets: new Map(),
            currencies: new Map()
        };

        this.isRunning = false;
        this.sessionId = crypto.randomUUID();
    }

    setupLogger() {
        this.logger = winston.createLogger({
            level: this.config.logLevel,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: { service: 'autonomous-domain-bot', session: this.sessionId },
            transports: [
                new winston.transports.File({ 
                    filename: path.join(this.config.outputDir, 'error.log'), 
                    level: 'error' 
                }),
                new winston.transports.File({ 
                    filename: path.join(this.config.outputDir, 'combined.log') 
                }),
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                })
            ]
        });
    }

    async initialize() {
        this.logger.info('Initializing Autonomous Domain Discovery Bot...', {
            sessionId: this.sessionId,
            config: this.config
        });

        // Create output directory
        await fs.mkdir(this.config.outputDir, { recursive: true });
        
        // Initialize components
        await this.scanner.initialize();
        await this.assetDiscovery.initialize();
        await this.registrars.initialize();
        await this.exporter.initialize();

        this.logger.info('Bot initialization complete');
    }

    async start() {
        if (this.isRunning) {
            this.logger.warn('Bot is already running');
            return;
        }

        await this.initialize();
        this.isRunning = true;

        this.logger.info('Starting autonomous domain discovery bot');

        // Schedule periodic scans
        this.scheduledTask = cron.schedule(this.config.scanInterval, async () => {
            await this.runDiscoverySession();
        }, {
            scheduled: false
        });

        this.scheduledTask.start();

        // Run initial discovery session
        await this.runDiscoverySession();
    }

    async stop() {
        if (!this.isRunning) {
            return;
        }

        this.logger.info('Stopping autonomous domain discovery bot');
        
        if (this.scheduledTask) {
            this.scheduledTask.stop();
            this.scheduledTask.destroy();
        }

        this.isRunning = false;
        this.logger.info('Bot stopped successfully');
    }

    async runDiscoverySession() {
        const sessionStart = Date.now();
        const sessionData = {
            sessionId: crypto.randomUUID(),
            timestamp: new Date(),
            discoveries: {
                domains: 0,
                assets: 0,
                currencies: 0
            }
        };

        this.logger.info('Starting discovery session', { sessionId: sessionData.sessionId });

        try {
            // Phase 1: Deep Domain Scanning
            this.logger.info('Phase 1: Deep domain scanning');
            const domainResults = await this.scanner.runDeepScan();
            sessionData.discoveries.domains = domainResults.length;
            
            for (const domain of domainResults) {
                this.discoveries.domains.set(domain.name, {
                    ...domain,
                    discoveredAt: new Date(),
                    sessionId: sessionData.sessionId
                });
            }

            // Phase 2: Digital Asset Discovery
            this.logger.info('Phase 2: Digital asset discovery');
            const assetResults = await this.assetDiscovery.scanForAssets(domainResults);
            sessionData.discoveries.assets = assetResults.assets.length;
            sessionData.discoveries.currencies = assetResults.currencies.length;

            for (const asset of assetResults.assets) {
                this.discoveries.assets.set(asset.id, {
                    ...asset,
                    discoveredAt: new Date(),
                    sessionId: sessionData.sessionId
                });
            }

            for (const currency of assetResults.currencies) {
                this.discoveries.currencies.set(currency.id, {
                    ...currency,
                    discoveredAt: new Date(),
                    sessionId: sessionData.sessionId
                });
            }

            // Phase 3: Autonomous Acquisition
            this.logger.info('Phase 3: Autonomous acquisition');
            await this.attemptAutonomousAcquisition();

            // Phase 4: Data Export and Packaging
            this.logger.info('Phase 4: Data export and packaging');
            await this.exportDiscoveries(sessionData);

            const sessionDuration = Date.now() - sessionStart;
            this.logger.info('Discovery session completed', {
                sessionId: sessionData.sessionId,
                duration: sessionDuration,
                discoveries: sessionData.discoveries
            });

        } catch (error) {
            this.logger.error('Discovery session failed', {
                sessionId: sessionData.sessionId,
                error: error.message,
                stack: error.stack
            });
        }
    }

    async attemptAutonomousAcquisition() {
        const prioritizedDomains = this.prioritizeDiscoveries();
        
        for (const domain of prioritizedDomains) {
            try {
                if (await this.validateDomainForAcquisition(domain)) {
                    const result = await this.registrars.attemptAcquisition(domain);
                    if (result.success) {
                        this.logger.info('Successfully acquired domain', {
                            domain: domain.name,
                            registrar: result.registrar,
                            cost: result.cost
                        });
                        
                        domain.acquired = true;
                        domain.acquisitionDetails = result;
                    }
                }
            } catch (error) {
                this.logger.error('Failed to acquire domain', {
                    domain: domain.name,
                    error: error.message
                });
            }
        }
    }

    prioritizeDiscoveries() {
        const domains = Array.from(this.discoveries.domains.values());
        
        return domains.sort((a, b) => {
            // Prioritization algorithm
            let scoreA = this.calculateDomainScore(a);
            let scoreB = this.calculateDomainScore(b);
            
            return scoreB - scoreA; // Higher score first
        });
    }

    calculateDomainScore(domain) {
        let score = 0;
        
        // Base score factors
        if (domain.category === 'hidden') score += 100;
        if (domain.category === 'nested') score += 80;
        if (domain.category === 'unexplored') score += 60;
        if (domain.category === 'forgotten') score += 90;
        
        // Length preference (shorter = better)
        score += Math.max(0, 20 - domain.name.length);
        
        // TLD preference
        const premiumTlds = ['.com', '.net', '.org', '.io', '.ai'];
        if (premiumTlds.some(tld => domain.name.endsWith(tld))) {
            score += 50;
        }
        
        // Asset potential
        if (domain.hasAssets) score += 75;
        if (domain.hasCrypto) score += 100;
        
        return score;
    }

    async validateDomainForAcquisition(domain) {
        // Comprehensive validation logic
        if (!domain.isLegitimate) return false;
        if (domain.isBlacklisted) return false;
        if (domain.isUnderDispute) return false;
        if (domain.estimatedCost > this.config.maxAcquisitionCost) return false;
        
        return true;
    }

    async exportDiscoveries(sessionData) {
        const exportData = {
            session: sessionData,
            domains: Array.from(this.discoveries.domains.values()),
            assets: Array.from(this.discoveries.assets.values()),
            currencies: Array.from(this.discoveries.currencies.values()),
            summary: {
                totalDomains: this.discoveries.domains.size,
                totalAssets: this.discoveries.assets.size,
                totalCurrencies: this.discoveries.currencies.size,
                acquiredDomains: Array.from(this.discoveries.domains.values()).filter(d => d.acquired).length
            }
        };

        await this.exporter.exportToCSV(exportData);
        await this.exporter.exportToJSON(exportData);
        await this.exporter.createSecurePackage(exportData);
        
        this.logger.info('Export completed', {
            sessionId: sessionData.sessionId,
            summary: exportData.summary
        });
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            sessionId: this.sessionId,
            discoveries: {
                domains: this.discoveries.domains.size,
                assets: this.discoveries.assets.size,
                currencies: this.discoveries.currencies.size
            },
            lastRun: this.lastRun,
            config: this.config
        };
    }
}

module.exports = AutonomousDomainBot;