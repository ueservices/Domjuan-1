/**
 * Bot Manager - Handles the three domain discovery bots
 * Domain Hunter, Asset Seeker, Recursive Explorer
 * Now uses real GoDaddy and Namecheap APIs for domain discovery and acquisition
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const GoDaddyClient = require('./godaddyClient');
const NamecheapClient = require('./namecheapClient');

class BotManager extends EventEmitter {
    constructor() {
        super();
        this.bots = {
            domainHunter: new DomainHunterBot(),
            assetSeeker: new AssetSeekerBot(),
            recursiveExplorer: new RecursiveExplorerBot()
        };
        this.isRunning = false;
        this.startTime = null;
        this.stats = {
            totalDomains: 0,
            totalAssets: 0,
            successfulAcquisitions: 0,
            failedAttempts: 0
        };
        this.config = {
            autoRestart: process.env.AUTO_RESTART_BOTS !== 'false',
            exportInterval: parseInt(process.env.EXPORT_INTERVAL_MS) || 300000, // 5 minutes
            dataDir: process.env.DATA_DIR || './data',
            maxLogAge: parseInt(process.env.MAX_LOG_AGE_MS) || 86400000, // 24 hours
            webhookUrl: process.env.WEBHOOK_URL || null
        };
        this.exportTimer = null;
        this.healthCheckTimer = null;
        this.initialize();
    }

    async initialize() {
        try {
            await fs.mkdir(this.config.dataDir, { recursive: true });
            await this.loadPreviousData();
            this.startPeriodicExports();
            this.startHealthMonitoring();
        } catch (error) {
            console.error('Failed to initialize BotManager:', error);
        }
    }

    startAllBots() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = new Date();
        
        Object.values(this.bots).forEach(bot => {
            bot.start();
            bot.on('discovery', (data) => this.handleBotDiscovery(data));
            bot.on('acquisition', (data) => this.handleBotAcquisition(data));
            bot.on('status', (data) => this.handleBotStatus(data));
            bot.on('error', (data) => this.handleBotError(data));
        });

        this.emit('allBotsStarted', { timestamp: this.startTime });
        this.sendWebhookNotification('🤖 All domain discovery bots started successfully', 'success');
    }

    stopAllBots() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        Object.values(this.bots).forEach(bot => bot.stop());
        
        if (this.exportTimer) {
            clearInterval(this.exportTimer);
            this.exportTimer = null;
        }
        
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }
        
        this.emit('allBotsStopped', { timestamp: new Date() });
        this.sendWebhookNotification('🛑 All domain discovery bots stopped', 'warning');
    }

    async handleBotError(data) {
        this.stats.failedAttempts++;
        console.error(`Bot Error [${data.bot}]:`, data.error);
        
        this.emit('error', {
            ...data,
            timestamp: new Date(),
            stats: { ...this.stats }
        });

        // Auto-restart failed bot if configured
        if (this.config.autoRestart) {
            console.log(`Auto-restarting bot: ${data.bot}`);
            setTimeout(() => {
                const bot = Object.values(this.bots).find(b => b.name === data.bot);
                if (bot && !bot.isActive) {
                    bot.start();
                    this.sendWebhookNotification(`🔄 Auto-restarted bot: ${data.bot}`, 'info');
                }
            }, 5000); // Wait 5 seconds before restart
        }

        // Send critical alert for repeated failures
        if (this.stats.failedAttempts % 10 === 0) {
            this.sendWebhookNotification(`⚠️ Critical: ${this.stats.failedAttempts} total bot failures detected`, 'error');
        }
    }

    handleBotDiscovery(data) {
        this.stats.totalDomains++;
        this.emit('discovery', {
            ...data,
            timestamp: new Date(),
            totalDomains: this.stats.totalDomains
        });

        // Send notification for significant discoveries
        if (this.stats.totalDomains % 50 === 0) {
            this.sendWebhookNotification(`🎯 Milestone: ${this.stats.totalDomains} domains discovered!`, 'success');
        }
    }

    handleBotAcquisition(data) {
        if (data.success) {
            this.stats.successfulAcquisitions++;
            this.sendWebhookNotification(`✅ Domain acquired: ${data.domain} by ${data.bot}`, 'success');
        } else {
            this.stats.failedAttempts++;
        }
        
        this.emit('acquisition', {
            ...data,
            timestamp: new Date(),
            stats: { ...this.stats }
        });
    }

    handleBotStatus(data) {
        this.emit('status', {
            ...data,
            timestamp: new Date(),
            uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0
        });
    }

    async sendWebhookNotification(message, type = 'info') {
        if (!this.config.webhookUrl) return;

        try {
            const colors = {
                success: 0x00ff00,
                warning: 0xffaa00,
                error: 0xff0000,
                info: 0x0099ff
            };

            const payload = {
                embeds: [{
                    title: 'Domain Discovery Bot System',
                    description: message,
                    color: colors[type] || colors.info,
                    timestamp: new Date().toISOString(),
                    footer: { text: 'Autonomous Domain Discovery' }
                }]
            };

            // Use node's built-in https module for webhook requests
            const https = require('https');
            const url = require('url');
            
            const webhookUrl = new URL(this.config.webhookUrl);
            const data = JSON.stringify(payload);
            
            const options = {
                hostname: webhookUrl.hostname,
                port: webhookUrl.port || 443,
                path: webhookUrl.pathname + webhookUrl.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };

            const req = https.request(options, (res) => {
                console.log(`Webhook response: ${res.statusCode}`);
            });

            req.on('error', (error) => {
                console.error('Webhook notification failed:', error.message);
            });

            req.write(data);
            req.end();
        } catch (error) {
            console.error('Failed to send webhook notification:', error);
        }
    }

    startPeriodicExports() {
        if (this.exportTimer) return;
        
        this.exportTimer = setInterval(async () => {
            try {
                await this.exportAllData();
                console.log('Automated data export completed');
            } catch (error) {
                console.error('Automated export failed:', error);
            }
        }, this.config.exportInterval);
    }

    startHealthMonitoring() {
        if (this.healthCheckTimer) return;
        
        this.healthCheckTimer = setInterval(() => {
            const healthReport = this.getHealthReport();
            
            // Check for unhealthy bots
            const unhealthyBots = healthReport.bots.filter(bot => !bot.isHealthy);
            if (unhealthyBots.length > 0) {
                this.sendWebhookNotification(`⚠️ Unhealthy bots detected: ${unhealthyBots.map(b => b.name).join(', ')}`, 'warning');
            }
            
            this.emit('healthCheck', healthReport);
        }, 60000); // Check every minute
    }

    getHealthReport() {
        const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
        
        return {
            timestamp: new Date(),
            uptime,
            isRunning: this.isRunning,
            stats: { ...this.stats },
            bots: Object.values(this.bots).map(bot => ({
                name: bot.name,
                isActive: bot.isActive,
                isHealthy: bot.isActive && bot.stats.errors < 10,
                stats: { ...bot.stats },
                lastActivity: bot.lastActivity || null
            }))
        };
    }

    async exportAllData() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportData = {
            timestamp: new Date(),
            uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
            stats: { ...this.stats },
            bots: Object.values(this.bots).map(bot => ({
                name: bot.name,
                status: bot.getStatus(),
                discovered: bot.discovered,
                acquired: bot.acquired
            }))
        };

        // Export as JSON
        const jsonPath = path.join(this.config.dataDir, `bot-data-${timestamp}.json`);
        await fs.writeFile(jsonPath, JSON.stringify(exportData, null, 2));

        // Export as CSV
        const csvPath = path.join(this.config.dataDir, `domains-${timestamp}.csv`);
        const csvData = this.generateCSV(exportData);
        await fs.writeFile(csvPath, csvData);

        return { jsonPath, csvPath };
    }

    generateCSV(exportData) {
        const headers = 'Domain,Bot,Type,Status,AcquisitionDate,Value,Registrar\n';
        let rows = '';

        exportData.bots.forEach(bot => {
            bot.discovered.forEach(domain => {
                const acquired = bot.acquired.find(a => a.domain === domain.domain);
                rows += `${domain.domain},${bot.name},${domain.type},${acquired ? 'Acquired' : 'Discovered'},${acquired ? acquired.acquiredAt : ''},${domain.value || acquired?.price || ''},${domain.registrar || ''}\n`;
            });
        });

        return headers + rows;
    }

    async loadPreviousData() {
        try {
            const files = await fs.readdir(this.config.dataDir);
            const latestFile = files.filter(f => f.startsWith('bot-data-')).sort().pop();
            
            if (latestFile) {
                const data = JSON.parse(await fs.readFile(path.join(this.config.dataDir, latestFile), 'utf8'));
                // Restore some stats but start fresh with bot state
                this.stats.totalDomains = data.stats.totalDomains || 0;
                this.stats.successfulAcquisitions = data.stats.successfulAcquisitions || 0;
                console.log(`Loaded previous data from ${latestFile}`);
            }
        } catch (error) {
            console.log('No previous data found or failed to load:', error.message);
        }
    }

    getBotStatus(botName) {
        return this.bots[botName] ? this.bots[botName].getStatus() : null;
    }

    getAllStats() {
        return {
            ...this.stats,
            isRunning: this.isRunning,
            uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
            bots: Object.keys(this.bots).map(name => ({
                name,
                status: this.bots[name].getStatus()
            }))
        };
    }

    // Health check endpoint for monitoring
    async getHealthStatus() {
        const health = this.getHealthReport();
        const memUsage = process.memoryUsage();
        
        return {
            status: health.bots.every(bot => bot.isHealthy) ? 'healthy' : 'unhealthy',
            uptime: health.uptime,
            botsActive: health.bots.filter(bot => bot.isActive).length,
            totalBots: health.bots.length,
            stats: health.stats,
            memory: {
                used: Math.round(memUsage.heapUsed / 1024 / 1024),
                total: Math.round(memUsage.heapTotal / 1024 / 1024)
            },
            lastExport: await this.getLastExportTime()
        };
    }

    async getLastExportTime() {
        try {
            const files = await fs.readdir(this.config.dataDir);
            const exportFiles = files.filter(f => f.startsWith('bot-data-')).sort();
            if (exportFiles.length > 0) {
                const stats = await fs.stat(path.join(this.config.dataDir, exportFiles[exportFiles.length - 1]));
                return stats.mtime;
            }
        } catch (error) {
            console.error('Error getting last export time:', error);
        }
        return null;
    }
}

class BaseDomainBot extends EventEmitter {
    constructor(name, config = {}) {
        super();
        this.name = name;
        this.isActive = false;
        this.searchDepth = config.searchDepth || 1;
        this.searchInterval = config.searchInterval || 5000;
        this.discovered = [];
        this.acquired = [];
        this.searchTimer = null;
        this.lastActivity = null;
        this.consecutiveErrors = 0;
        this.maxConsecutiveErrors = parseInt(process.env.MAX_CONSECUTIVE_ERRORS) || 5;
        this.backoffMultiplier = 2;
        this.stats = {
            domainsScanned: 0,
            domainsDiscovered: 0,
            domainsAcquired: 0,
            currentDepth: 0,
            errors: 0,
            lastError: null,
            startTime: null
        };
        
        // Initialize API clients
        try {
            this.godaddyClient = new GoDaddyClient();
            this.namecheapClient = new NamecheapClient();
            console.log(`[${this.name}] API clients initialized successfully`);
        } catch (error) {
            console.error(`[${this.name}] Failed to initialize API clients:`, error.message);
            throw new Error(`Bot initialization failed: ${error.message}`);
        }
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.stats.currentDepth = 0;
        this.stats.startTime = new Date();
        this.consecutiveErrors = 0;
        this.lastActivity = new Date();
        
        this.emit('status', { 
            bot: this.name, 
            status: 'active', 
            message: `${this.name} started searching...`
        });
        
        this.runSearchCycle();
    }

    stop() {
        this.isActive = false;
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
            this.searchTimer = null;
        }
        this.emit('status', { 
            bot: this.name, 
            status: 'stopped', 
            message: `${this.name} stopped`
        });
    }

    runSearchCycle() {
        if (!this.isActive) return;

        this.performSearch()
            .then(() => {
                this.consecutiveErrors = 0; // Reset error count on success
                this.lastActivity = new Date();
                this.searchTimer = setTimeout(() => this.runSearchCycle(), this.searchInterval);
            })
            .catch(error => {
                this.consecutiveErrors++;
                this.stats.errors++;
                this.stats.lastError = {
                    timestamp: new Date(),
                    message: error.message,
                    stack: error.stack
                };

                console.error(`[${this.name}] Search cycle error:`, error);
                
                this.emit('error', { 
                    bot: this.name, 
                    status: 'error', 
                    message: `Error in ${this.name}: ${error.message}`,
                    error: error,
                    consecutiveErrors: this.consecutiveErrors
                });

                // Implement exponential backoff for repeated errors
                const backoffDelay = this.searchInterval * Math.pow(this.backoffMultiplier, Math.min(this.consecutiveErrors - 1, 5));
                
                // Stop bot if too many consecutive errors
                if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
                    this.emit('error', {
                        bot: this.name,
                        status: 'critical',
                        message: `${this.name} stopped due to ${this.consecutiveErrors} consecutive errors`,
                        error: error
                    });
                    this.stop();
                    return;
                }

                this.searchTimer = setTimeout(() => this.runSearchCycle(), backoffDelay);
            });
    }

    async performSearch() {
        // Override in subclasses
        throw new Error('performSearch must be implemented by subclass');
    }

    /**
     * Generate domain search queries based on current trends and registrar APIs
     * @param {string} registrar - 'godaddy' or 'namecheap'
     * @returns {Array<string>}
     */
    generateSearchQueries(registrar = 'godaddy') {
        if (registrar === 'godaddy') {
            return this.godaddyClient.generateSearchQueries();
        } else if (registrar === 'namecheap') {
            return this.namecheapClient.generateTrendingQueries();
        } else {
            throw new Error(`Unknown registrar: ${registrar}`);
        }
    }

    /**
     * Search for available domains using real API
     * @param {string} query - Search query
     * @param {string} registrar - 'godaddy' or 'namecheap'
     * @returns {Promise<Array>}
     */
    async searchDomains(query, registrar = 'godaddy') {
        try {
            if (registrar === 'godaddy') {
                return await this.godaddyClient.searchDomains(query);
            } else if (registrar === 'namecheap') {
                return await this.namecheapClient.searchDomains(query);
            } else {
                throw new Error(`Unknown registrar: ${registrar}`);
            }
        } catch (error) {
            console.error(`[${this.name}] Domain search failed for ${query} on ${registrar}:`, error.message);
            throw error;
        }
    }

    /**
     * Check domain availability using real API
     * @param {string} domain - Domain to check
     * @param {string} registrar - 'godaddy' or 'namecheap'
     * @returns {Promise<Object>}
     */
    async checkDomainAvailability(domain, registrar = 'godaddy') {
        try {
            if (registrar === 'godaddy') {
                return await this.godaddyClient.checkDomainAvailability(domain);
            } else if (registrar === 'namecheap') {
                return await this.namecheapClient.checkDomainAvailability(domain);
            } else {
                throw new Error(`Unknown registrar: ${registrar}`);
            }
        } catch (error) {
            console.error(`[${this.name}] Domain availability check failed for ${domain} on ${registrar}:`, error.message);
            throw error;
        }
    }

    getStatus() {
        return {
            name: this.name,
            isActive: this.isActive,
            stats: { ...this.stats },
            discovered: this.discovered.length,
            acquired: this.acquired.length,
            lastActivity: this.lastActivity,
            consecutiveErrors: this.consecutiveErrors,
            uptime: this.stats.startTime ? Date.now() - this.stats.startTime.getTime() : 0
        };
    }
}

class DomainHunterBot extends BaseDomainBot {
    constructor() {
        super('Domain Hunter', { searchInterval: 8000, searchDepth: 3 }); // Increased interval for API rate limits
        this.specialty = 'premium domains';
        this.currentQueryIndex = 0;
        this.searchQueries = [];
    }

    async performSearch() {
        try {
            // Generate or refresh search queries if needed
            if (this.searchQueries.length === 0 || this.currentQueryIndex >= this.searchQueries.length) {
                this.searchQueries = this.generateSearchQueries('godaddy');
                this.currentQueryIndex = 0;
                console.log(`[${this.name}] Generated ${this.searchQueries.length} search queries`);
            }

            const query = this.searchQueries[this.currentQueryIndex];
            this.currentQueryIndex++;
            this.stats.domainsScanned++;

            console.log(`[${this.name}] Searching for domains with query: ${query}`);

            // Search for domains using GoDaddy API
            const searchResults = await this.searchDomains(query, 'godaddy');
            
            if (searchResults.length > 0) {
                console.log(`[${this.name}] Found ${searchResults.length} available domains for query: ${query}`);
                
                for (const domainInfo of searchResults) {
                    this.stats.domainsDiscovered++;
                    
                    const discoveredDomain = {
                        domain: domainInfo.domain,
                        type: 'premium',
                        value: domainInfo.price || 0,
                        currency: domainInfo.currency || 'USD',
                        registrar: 'GoDaddy',
                        category: domainInfo.type,
                        discoveredAt: new Date()
                    };
                    
                    this.discovered.push(discoveredDomain);

                    this.emit('discovery', {
                        bot: this.name,
                        domain: domainInfo.domain,
                        type: 'premium',
                        specialty: this.specialty,
                        price: domainInfo.price,
                        registrar: 'GoDaddy'
                    });

                    // Attempt acquisition for high-value domains
                    if (domainInfo.price && domainInfo.price > 0 && domainInfo.price < 100) {
                        await this.attemptAcquisition(domainInfo.domain, domainInfo.price, 'GoDaddy');
                    }
                }
            } else {
                console.log(`[${this.name}] No available domains found for query: ${query}`);
            }

            this.emit('status', {
                bot: this.name,
                status: 'searching',
                message: `Scanned: ${this.stats.domainsScanned}, Found: ${this.stats.domainsDiscovered}`,
                query: query,
                registrar: 'GoDaddy'
            });

        } catch (error) {
            console.error(`[${this.name}] Search cycle error:`, error.message);
            this.stats.errors++;
            throw error;
        }
    }

    async attemptAcquisition(domain, price, registrar) {
        try {
            console.log(`[${this.name}] Attempting to acquire domain: ${domain} for $${price} via ${registrar}`);
            
            // Note: Actual domain purchase would require payment setup and contact information
            // This is a placeholder that logs the attempt
            console.log(`[${this.name}] Domain acquisition attempted: ${domain}`);
            console.log(`[${this.name}] Price: $${price}`);
            console.log(`[${this.name}] Registrar: ${registrar}`);
            console.log(`[${this.name}] Note: Actual purchase requires payment method and contact information setup`);
            
            // For now, we'll simulate a decision not to purchase to avoid actual costs
            const shouldAcquire = false; // Set to true when ready for actual purchases
            
            if (shouldAcquire) {
                // This would call the actual purchase API
                // const result = await this.godaddyClient.purchaseDomain(domain, contactInfo);
                
                this.stats.domainsAcquired++;
                this.acquired.push({
                    domain,
                    acquiredAt: new Date(),
                    price,
                    registrar,
                    status: 'acquired'
                });

                this.emit('acquisition', {
                    bot: this.name,
                    domain,
                    success: true,
                    type: 'premium',
                    price,
                    registrar
                });
            } else {
                this.emit('acquisition', {
                    bot: this.name,
                    domain,
                    success: false,
                    type: 'premium',
                    reason: 'Acquisition disabled - set shouldAcquire to true and configure payment methods',
                    price,
                    registrar
                });
            }
        } catch (error) {
            console.error(`[${this.name}] Acquisition attempt failed for ${domain}:`, error.message);
            this.emit('acquisition', {
                bot: this.name,
                domain,
                success: false,
                type: 'premium',
                error: error.message,
                registrar
            });
        }
    }
}

class AssetSeekerBot extends BaseDomainBot {
    constructor() {
        super('Asset Seeker', { searchInterval: 10000, searchDepth: 2 }); // Increased interval for API rate limits
        this.specialty = 'digital assets';
        this.currentQueryIndex = 0;
        this.searchQueries = [];
        this.focusCategories = ['crypto', 'nft', 'defi', 'web3', 'ai', 'fintech'];
    }

    async performSearch() {
        try {
            // Generate or refresh search queries if needed
            if (this.searchQueries.length === 0 || this.currentQueryIndex >= this.searchQueries.length) {
                this.searchQueries = this.generateSearchQueries('namecheap');
                this.currentQueryIndex = 0;
                console.log(`[${this.name}] Generated ${this.searchQueries.length} search queries`);
            }

            const query = this.searchQueries[this.currentQueryIndex];
            this.currentQueryIndex++;
            this.stats.domainsScanned++;

            console.log(`[${this.name}] Searching for asset domains with query: ${query}`);

            // Search for domains using Namecheap API
            const searchResults = await this.searchDomains(query, 'namecheap');
            
            if (searchResults.length > 0) {
                console.log(`[${this.name}] Found ${searchResults.length} available asset domains for query: ${query}`);
                
                for (const domainInfo of searchResults) {
                    // Focus on asset-related domains
                    if (this.isAssetRelated(domainInfo.domain)) {
                        this.stats.domainsDiscovered++;
                        
                        const discoveredDomain = {
                            domain: domainInfo.domain,
                            type: 'asset',
                            category: domainInfo.type,
                            registrar: 'Namecheap',
                            isPremium: domainInfo.isPremium,
                            premiumPrice: domainInfo.premiumRegistrationPrice,
                            discoveredAt: new Date()
                        };
                        
                        this.discovered.push(discoveredDomain);

                        this.emit('discovery', {
                            bot: this.name,
                            domain: domainInfo.domain,
                            type: 'asset',
                            specialty: this.specialty,
                            category: domainInfo.type,
                            registrar: 'Namecheap',
                            isPremium: domainInfo.isPremium
                        });

                        // Attempt acquisition for non-premium or low-cost premium domains
                        if (!domainInfo.isPremium || 
                            (domainInfo.premiumRegistrationPrice && domainInfo.premiumRegistrationPrice < 50)) {
                            await this.attemptAcquisition(
                                domainInfo.domain, 
                                domainInfo.premiumRegistrationPrice || 10, 
                                'Namecheap'
                            );
                        }
                    }
                }
            } else {
                console.log(`[${this.name}] No available asset domains found for query: ${query}`);
            }

            this.emit('status', {
                bot: this.name,
                status: 'seeking',
                message: `Assets scanned: ${this.stats.domainsScanned}, Assets found: ${this.stats.domainsDiscovered}`,
                query: query,
                registrar: 'Namecheap'
            });

        } catch (error) {
            console.error(`[${this.name}] Search cycle error:`, error.message);
            this.stats.errors++;
            throw error;
        }
    }

    /**
     * Check if a domain is related to digital assets
     * @param {string} domain - Domain to check
     * @returns {boolean}
     */
    isAssetRelated(domain) {
        const domainLower = domain.toLowerCase();
        const assetKeywords = [
            'crypto', 'coin', 'token', 'nft', 'defi', 'web3', 'blockchain',
            'digital', 'asset', 'finance', 'fintech', 'pay', 'wallet',
            'trade', 'exchange', 'market', 'invest', 'fund', 'dao'
        ];
        
        return assetKeywords.some(keyword => domainLower.includes(keyword));
    }

    async attemptAcquisition(domain, price, registrar) {
        try {
            console.log(`[${this.name}] Attempting to acquire asset domain: ${domain} for $${price} via ${registrar}`);
            
            // Note: Actual domain registration would require contact information and payment setup
            console.log(`[${this.name}] Asset domain acquisition attempted: ${domain}`);
            console.log(`[${this.name}] Price: $${price}`);
            console.log(`[${this.name}] Registrar: ${registrar}`);
            console.log(`[${this.name}] Note: Actual registration requires contact information and payment method setup`);
            
            // For now, we'll simulate a decision not to purchase to avoid actual costs
            const shouldAcquire = false; // Set to true when ready for actual registrations
            
            if (shouldAcquire) {
                // This would call the actual registration API
                // const result = await this.namecheapClient.registerDomain(domain, contactInfo);
                
                this.stats.domainsAcquired++;
                this.acquired.push({
                    domain,
                    acquiredAt: new Date(),
                    price,
                    registrar,
                    status: 'acquired'
                });

                this.emit('acquisition', {
                    bot: this.name,
                    domain,
                    success: true,
                    type: 'asset',
                    price,
                    registrar
                });
            } else {
                this.emit('acquisition', {
                    bot: this.name,
                    domain,
                    success: false,
                    type: 'asset',
                    reason: 'Acquisition disabled - set shouldAcquire to true and configure contact/payment info',
                    price,
                    registrar
                });
            }
        } catch (error) {
            console.error(`[${this.name}] Acquisition attempt failed for ${domain}:`, error.message);
            this.emit('acquisition', {
                bot: this.name,
                domain,
                success: false,
                type: 'asset',
                error: error.message,
                registrar
            });
        }
    }
}

class RecursiveExplorerBot extends BaseDomainBot {
    constructor() {
        super('Recursive Explorer', { searchInterval: 12000, searchDepth: 5 }); // Increased interval for API rate limits
        this.specialty = 'hidden gems';
        this.currentDepth = 0;
        this.exploredDomains = new Set();
        this.baseDomains = [];
        this.currentRegistrar = 'godaddy';
    }

    async performSearch() {
        try {
            this.stats.currentDepth = Math.min(this.currentDepth + 1, this.searchDepth);
            
            // Alternate between registrars for deeper exploration
            this.currentRegistrar = this.currentDepth % 2 === 0 ? 'godaddy' : 'namecheap';
            
            console.log(`[${this.name}] Exploring at depth ${this.stats.currentDepth}/${this.searchDepth} using ${this.currentRegistrar}`);

            let explorationResults = [];

            if (this.stats.currentDepth === 1) {
                // Initial exploration - use trending queries
                const queries = this.generateSearchQueries(this.currentRegistrar);
                const randomQuery = queries[Math.floor(Math.random() * queries.length)];
                explorationResults = await this.exploreBaseDomain(randomQuery);
            } else {
                // Deeper exploration - use variations of discovered domains
                if (this.baseDomains.length > 0) {
                    const baseDomain = this.baseDomains[Math.floor(Math.random() * this.baseDomains.length)];
                    explorationResults = await this.exploreVariations(baseDomain);
                } else {
                    // Fallback to new base exploration
                    const queries = this.generateSearchQueries(this.currentRegistrar);
                    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
                    explorationResults = await this.exploreBaseDomain(randomQuery);
                }
            }

            this.stats.domainsScanned += explorationResults.length;

            for (const domainInfo of explorationResults) {
                if (!this.exploredDomains.has(domainInfo.domain)) {
                    this.exploredDomains.add(domainInfo.domain);
                    
                    if (this.isHiddenGem(domainInfo.domain)) {
                        this.stats.domainsDiscovered++;
                        
                        const discoveredDomain = {
                            domain: domainInfo.domain,
                            type: 'hidden',
                            depth: this.stats.currentDepth,
                            potential: this.calculatePotential(domainInfo.domain),
                            registrar: domainInfo.registrar,
                            price: domainInfo.price || domainInfo.premiumRegistrationPrice,
                            discoveredAt: new Date()
                        };
                        
                        this.discovered.push(discoveredDomain);
                        
                        // Add to base domains for future exploration
                        if (this.stats.currentDepth <= 2) {
                            const baseName = domainInfo.domain.split('.')[0];
                            if (!this.baseDomains.includes(baseName)) {
                                this.baseDomains.push(baseName);
                            }
                        }

                        this.emit('discovery', {
                            bot: this.name,
                            domain: domainInfo.domain,
                            type: 'hidden',
                            specialty: this.specialty,
                            depth: this.stats.currentDepth,
                            potential: discoveredDomain.potential,
                            registrar: domainInfo.registrar
                        });

                        // Attempt acquisition for high-potential hidden gems
                        if (discoveredDomain.potential > 70) {
                            await this.attemptAcquisition(
                                domainInfo.domain, 
                                domainInfo.price || domainInfo.premiumRegistrationPrice || 15, 
                                domainInfo.registrar
                            );
                        }
                    }
                }
            }

            this.emit('status', {
                bot: this.name,
                status: 'exploring',
                message: `Depth: ${this.stats.currentDepth}/${this.searchDepth}, Found: ${this.stats.domainsDiscovered} gems`,
                registrar: this.currentRegistrar,
                baseDomains: this.baseDomains.length
            });

        } catch (error) {
            console.error(`[${this.name}] Exploration cycle error:`, error.message);
            this.stats.errors++;
            throw error;
        }
    }

    /**
     * Explore a base domain for available variations
     * @param {string} baseDomain - Base domain to explore
     * @returns {Promise<Array>}
     */
    async exploreBaseDomain(baseDomain) {
        try {
            console.log(`[${this.name}] Exploring base domain: ${baseDomain}`);
            return await this.searchDomains(baseDomain, this.currentRegistrar);
        } catch (error) {
            console.error(`[${this.name}] Failed to explore base domain ${baseDomain}:`, error.message);
            return [];
        }
    }

    /**
     * Explore variations of a known domain
     * @param {string} baseName - Base name without TLD
     * @returns {Promise<Array>}
     */
    async exploreVariations(baseName) {
        try {
            console.log(`[${this.name}] Exploring variations of: ${baseName}`);
            
            if (this.currentRegistrar === 'namecheap') {
                return await this.namecheapClient.generateDomainVariations(baseName);
            } else {
                // For GoDaddy, we'll create our own variations
                const variations = this.generateVariations(baseName);
                const results = [];
                
                for (const variation of variations.slice(0, 5)) { // Limit to avoid rate limits
                    try {
                        const availability = await this.checkDomainAvailability(variation, 'godaddy');
                        if (availability.available) {
                            results.push({
                                domain: variation,
                                available: true,
                                price: availability.price,
                                registrar: 'GoDaddy'
                            });
                        }
                    } catch (error) {
                        console.warn(`[${this.name}] Failed to check variation ${variation}:`, error.message);
                    }
                }
                
                return results;
            }
        } catch (error) {
            console.error(`[${this.name}] Failed to explore variations of ${baseName}:`, error.message);
            return [];
        }
    }

    /**
     * Generate domain variations manually
     * @param {string} baseName - Base name
     * @returns {Array<string>}
     */
    generateVariations(baseName) {
        const prefixes = ['get', 'my', 'the', 'new', 'best', 'top'];
        const suffixes = ['app', 'pro', 'hub', 'lab', 'tech', 'ai'];
        const tlds = ['.com', '.net', '.org', '.io', '.ai', '.tech'];
        const variations = [];
        
        // Add prefixes
        prefixes.forEach(prefix => {
            tlds.forEach(tld => {
                variations.push(`${prefix}${baseName}${tld}`);
            });
        });
        
        // Add suffixes
        suffixes.forEach(suffix => {
            tlds.forEach(tld => {
                variations.push(`${baseName}${suffix}${tld}`);
            });
        });
        
        return variations;
    }

    /**
     * Determine if a domain is a potential hidden gem
     * @param {string} domain - Domain to evaluate
     * @returns {boolean}
     */
    isHiddenGem(domain) {
        const domainLower = domain.toLowerCase();
        
        // Check for valuable keywords
        const valuableKeywords = [
            'ai', 'crypto', 'nft', 'defi', 'web3', 'meta', 'smart', 'digital',
            'blockchain', 'fintech', 'saas', 'cloud', 'data', 'tech', 'app'
        ];
        
        const hasValuableKeyword = valuableKeywords.some(keyword => domainLower.includes(keyword));
        const isShort = domain.split('.')[0].length <= 8;
        const hasGoodTLD = ['.com', '.ai', '.io', '.tech'].some(tld => domain.includes(tld));
        
        return hasValuableKeyword || (isShort && hasGoodTLD);
    }

    /**
     * Calculate potential value of a domain
     * @param {string} domain - Domain to evaluate
     * @returns {number} Potential score 0-100
     */
    calculatePotential(domain) {
        const domainLower = domain.toLowerCase();
        let score = 30; // Base score
        
        // Length bonus (shorter is better)
        const nameLength = domain.split('.')[0].length;
        if (nameLength <= 4) score += 30;
        else if (nameLength <= 6) score += 20;
        else if (nameLength <= 8) score += 10;
        
        // Keyword bonuses
        const highValueKeywords = ['ai', 'crypto', 'nft', 'web3'];
        const mediumValueKeywords = ['tech', 'digital', 'smart', 'meta'];
        
        highValueKeywords.forEach(keyword => {
            if (domainLower.includes(keyword)) score += 25;
        });
        
        mediumValueKeywords.forEach(keyword => {
            if (domainLower.includes(keyword)) score += 15;
        });
        
        // TLD bonus
        if (domain.endsWith('.com')) score += 20;
        else if (domain.endsWith('.ai')) score += 15;
        else if (domain.endsWith('.io')) score += 10;
        
        return Math.min(score, 100);
    }

    async attemptAcquisition(domain, price, registrar) {
        try {
            console.log(`[${this.name}] Attempting to acquire hidden gem: ${domain} for $${price} via ${registrar}`);
            
            // Note: Actual domain acquisition would require proper setup
            console.log(`[${this.name}] Hidden gem acquisition attempted: ${domain}`);
            console.log(`[${this.name}] Price: $${price}`);
            console.log(`[${this.name}] Registrar: ${registrar}`);
            console.log(`[${this.name}] Depth: ${this.stats.currentDepth}`);
            console.log(`[${this.name}] Note: Actual acquisition requires payment and contact setup`);
            
            // For now, we'll simulate a decision not to purchase to avoid actual costs
            const shouldAcquire = false; // Set to true when ready for actual acquisitions
            
            if (shouldAcquire) {
                // This would call the actual acquisition API
                this.stats.domainsAcquired++;
                this.acquired.push({
                    domain,
                    acquiredAt: new Date(),
                    price,
                    registrar,
                    depth: this.stats.currentDepth,
                    status: 'acquired'
                });

                this.emit('acquisition', {
                    bot: this.name,
                    domain,
                    success: true,
                    type: 'hidden',
                    price,
                    registrar,
                    depth: this.stats.currentDepth
                });
            } else {
                this.emit('acquisition', {
                    bot: this.name,
                    domain,
                    success: false,
                    type: 'hidden',
                    reason: 'Acquisition disabled - set shouldAcquire to true and configure payment methods',
                    price,
                    registrar,
                    depth: this.stats.currentDepth
                });
            }
        } catch (error) {
            console.error(`[${this.name}] Acquisition attempt failed for ${domain}:`, error.message);
            this.emit('acquisition', {
                bot: this.name,
                domain,
                success: false,
                type: 'hidden',
                error: error.message,
                registrar,
                depth: this.stats.currentDepth
            });
        }
    }
}

module.exports = BotManager;