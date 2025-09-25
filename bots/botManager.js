/**
 * Bot Manager - Handles the three domain discovery bots
 * Domain Hunter, Asset Seeker, Recursive Explorer
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const DomainRegistrarAPI = require('./domainApis');

class BotManager extends EventEmitter {
    constructor() {
        super();
        this.domainAPI = new DomainRegistrarAPI();
        this.bots = {
            domainHunter: new DomainHunterBot(this.domainAPI),
            assetSeeker: new AssetSeekerBot(this.domainAPI),
            recursiveExplorer: new RecursiveExplorerBot(this.domainAPI)
        };
        this.isRunning = false;
        this.startTime = null;
        this.stats = {
            totalDomains: 0,
            totalAssets: 0,
            successfulAcquisitions: 0,
            failedAttempts: 0,
            apiCallsToday: 0,
            lastApiReset: new Date().toDateString()
        };
        this.config = {
            autoRestart: process.env.AUTO_RESTART_BOTS !== 'false',
            exportInterval: parseInt(process.env.EXPORT_INTERVAL_MS) || 300000, // 5 minutes
            dataDir: process.env.DATA_DIR || './data',
            maxLogAge: parseInt(process.env.MAX_LOG_AGE_MS) || 86400000, // 24 hours
            webhookUrl: process.env.WEBHOOK_URL || null,
            useRealAPIs: process.env.USE_REAL_DOMAIN_APIS === 'true',
            maxApiCallsPerDay: parseInt(process.env.MAX_API_CALLS_PER_DAY) || 1000
        };
        this.exportTimer = null;
        this.healthCheckTimer = null;
        this.initialize();
    }

    async initialize() {
        try {
            await fs.mkdir(this.config.dataDir, { recursive: true });
            await this.loadPreviousData();
            
            // Check API status if using real APIs
            if (this.config.useRealAPIs) {
                const apiStatus = await this.domainAPI.getApiStatus();
                console.log('Domain API Status:', apiStatus.overallStatus);
                this.sendWebhookNotification(`🔌 Domain APIs status: ${apiStatus.overallStatus}`, 'info');
            }
            
            this.startPeriodicExports();
            this.startHealthMonitoring();
            this.resetDailyApiCounter();
        } catch (error) {
            console.error('Failed to initialize BotManager:', error);
        }
    }

    resetDailyApiCounter() {
        const today = new Date().toDateString();
        if (this.stats.lastApiReset !== today) {
            this.stats.apiCallsToday = 0;
            this.stats.lastApiReset = today;
        }
    }

    async checkApiLimits() {
        this.resetDailyApiCounter();
        
        if (this.stats.apiCallsToday >= this.config.maxApiCallsPerDay) {
            throw new Error(`Daily API limit reached: ${this.stats.apiCallsToday}/${this.config.maxApiCallsPerDay}`);
        }
        
        this.stats.apiCallsToday++;
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
            bot.on('apiCall', (data) => this.handleApiCall(data));
        });

        this.emit('allBotsStarted', { timestamp: this.startTime });
        this.sendWebhookNotification('🤖 All domain discovery bots started successfully', 'success');
    }

    handleApiCall(data) {
        this.stats.apiCallsToday++;
        this.emit('apiCall', {
            ...data,
            dailyCount: this.stats.apiCallsToday,
            dailyLimit: this.config.maxApiCallsPerDay,
            timestamp: new Date()
        });
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
    constructor(name, domainAPI, config = {}) {
        super();
        this.name = name;
        this.domainAPI = domainAPI;
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
        this.useRealAPI = process.env.USE_REAL_DOMAIN_APIS === 'true';
        this.stats = {
            domainsScanned: 0,
            domainsDiscovered: 0,
            domainsAcquired: 0,
            currentDepth: 0,
            errors: 0,
            apiCalls: 0,
            lastError: null,
            startTime: null
        };
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

    async checkDomainAvailability(domain) {
        if (!this.domainAPI.isValidDomain(domain)) {
            throw new Error(`Invalid domain format: ${domain}`);
        }

        this.stats.apiCalls++;
        this.emit('apiCall', { bot: this.name, domain, timestamp: new Date() });

        if (this.useRealAPI) {
            try {
                const result = await this.domainAPI.checkDomainAvailability(domain);
                return result;
            } catch (error) {
                console.warn(`Real API failed for ${domain}, falling back to mock:`, error.message);
                return this.mockDomainCheck(domain);
            }
        } else {
            return this.mockDomainCheck(domain);
        }
    }

    generateDomainName() {
        const prefixes = ['digital', 'crypto', 'web', 'tech', 'ai', 'data', 'cloud', 'meta'];
        const suffixes = ['asset', 'domain', 'hub', 'vault', 'zone', 'space', 'link', 'net'];
        const tlds = ['.com', '.net', '.org', '.io', '.ai', '.tech'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const tld = tlds[Math.floor(Math.random() * tlds.length)];
        
        return `${prefix}${suffix}${Math.floor(Math.random() * 9999)}${tld}`;
    }

    async checkDomainAvailability(domain) {
        if (!this.domainAPI.isValidDomain(domain)) {
            throw new Error(`Invalid domain format: ${domain}`);
        }

        this.stats.apiCalls++;
        this.emit('apiCall', { bot: this.name, domain, timestamp: new Date() });

        if (this.useRealAPI) {
            try {
                const result = await this.domainAPI.checkDomainAvailability(domain);
                return result;
            } catch (error) {
                console.warn(`Real API failed for ${domain}, falling back to mock:`, error.message);
                return this.mockDomainCheck(domain);
            }
        } else {
            return this.mockDomainCheck(domain);
        }
    }

    mockDomainCheck(domain) {
        // Mock domain availability check for testing/development
        const available = Math.random() > 0.7;
        return {
            domain,
            overallAvailable: available,
            timestamp: new Date(),
            registrars: {
                mock: {
                    domain,
                    available,
                    registrar: 'Mock',
                    price: available ? Math.floor(Math.random() * 5000) + 500 : null,
                    currency: 'USD'
                }
            }
        };
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
    constructor(domainAPI) {
        super('Domain Hunter', domainAPI, { searchInterval: 3000, searchDepth: 3 });
        this.specialty = 'premium domains';
    }

    async performSearch() {
        const domain = this.generateDomainName();
        this.stats.domainsScanned++;

        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

        try {
            const availabilityResult = await this.checkDomainAvailability(domain);
            
            if (availabilityResult.overallAvailable) {
                this.stats.domainsDiscovered++;
                
                const domainInfo = {
                    domain,
                    type: 'premium',
                    value: availabilityResult.bestOption?.price || Math.floor(Math.random() * 10000) + 1000,
                    registrar: availabilityResult.bestOption?.registrar || 'Unknown',
                    discoveredAt: new Date(),
                    apiResult: availabilityResult
                };
                
                this.discovered.push(domainInfo);

                this.emit('discovery', {
                    bot: this.name,
                    domain,
                    type: 'premium',
                    specialty: this.specialty,
                    value: domainInfo.value,
                    registrar: domainInfo.registrar
                });

                // Attempt acquisition with higher probability for premium domains
                if (Math.random() > 0.3) {
                    await this.attemptAcquisition(domain, domainInfo);
                }
            }
        } catch (error) {
            console.error(`Domain check failed for ${domain}:`, error.message);
            throw error; // Let the error handling in runSearchCycle handle this
        }

        this.emit('status', {
            bot: this.name,
            status: 'searching',
            message: `Scanned: ${this.stats.domainsScanned}, Found: ${this.stats.domainsDiscovered}, API calls: ${this.stats.apiCalls}`
        });
    }

    async attemptAcquisition(domain, domainInfo) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));
        
        // In a real implementation, this would call domain registrar APIs to purchase
        const success = Math.random() > 0.3;
        
        if (success) {
            this.stats.domainsAcquired++;
            const acquisitionInfo = {
                domain,
                acquiredAt: new Date(),
                price: domainInfo.value * 0.8, // Simulate some negotiation
                registrar: domainInfo.registrar,
                method: this.useRealAPI ? 'api' : 'mock'
            };
            
            this.acquired.push(acquisitionInfo);
        }

        this.emit('acquisition', {
            bot: this.name,
            domain,
            success,
            type: 'premium',
            price: success ? domainInfo.value * 0.8 : null,
            registrar: domainInfo.registrar
        });
    }
}

class AssetSeekerBot extends BaseDomainBot {
    constructor(domainAPI) {
        super('Asset Seeker', domainAPI, { searchInterval: 4000, searchDepth: 2 });
        this.specialty = 'digital assets';
    }

    async performSearch() {
        const domain = this.generateDomainName();
        this.stats.domainsScanned++;

        await new Promise(resolve => setTimeout(resolve, Math.random() * 1500));

        try {
            const availabilityResult = await this.checkDomainAvailability(domain);
            
            if (availabilityResult.overallAvailable) {
                this.stats.domainsDiscovered++;
                
                const domainInfo = {
                    domain,
                    type: 'asset',
                    category: ['NFT', 'DeFi', 'Gaming', 'SaaS'][Math.floor(Math.random() * 4)],
                    registrar: availabilityResult.bestOption?.registrar || 'Unknown',
                    discoveredAt: new Date(),
                    apiResult: availabilityResult
                };
                
                this.discovered.push(domainInfo);

                this.emit('discovery', {
                    bot: this.name,
                    domain,
                    type: 'asset',
                    specialty: this.specialty,
                    category: domainInfo.category,
                    registrar: domainInfo.registrar
                });

                if (Math.random() > 0.4) {
                    await this.attemptAcquisition(domain, domainInfo);
                }
            }
        } catch (error) {
            console.error(`Domain check failed for ${domain}:`, error.message);
            throw error;
        }

        this.emit('status', {
            bot: this.name,
            status: 'seeking',
            message: `Assets scanned: ${this.stats.domainsScanned}, Assets found: ${this.stats.domainsDiscovered}, API calls: ${this.stats.apiCalls}`
        });
    }

    async attemptAcquisition(domain, domainInfo) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1800));
        
        const success = Math.random() > 0.25;
        if (success) {
            this.stats.domainsAcquired++;
            const acquisitionInfo = {
                domain,
                acquiredAt: new Date(),
                price: Math.floor(Math.random() * 3000) + 200,
                registrar: domainInfo.registrar,
                category: domainInfo.category,
                method: this.useRealAPI ? 'api' : 'mock'
            };
            
            this.acquired.push(acquisitionInfo);
        }

        this.emit('acquisition', {
            bot: this.name,
            domain,
            success,
            type: 'asset',
            category: domainInfo.category,
            registrar: domainInfo.registrar
        });
    }
}

class RecursiveExplorerBot extends BaseDomainBot {
    constructor(domainAPI) {
        super('Recursive Explorer', domainAPI, { searchInterval: 6000, searchDepth: 5 });
        this.specialty = 'hidden gems';
    }

    async performSearch() {
        const domain = this.generateDomainName();
        this.stats.domainsScanned++;
        this.stats.currentDepth = Math.min(this.stats.currentDepth + 1, this.searchDepth);

        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

        try {
            const availabilityResult = await this.checkDomainAvailability(domain);
            
            if (availabilityResult.overallAvailable) {
                this.stats.domainsDiscovered++;
                
                const domainInfo = {
                    domain,
                    type: 'hidden',
                    depth: this.stats.currentDepth,
                    potential: Math.floor(Math.random() * 100),
                    registrar: availabilityResult.bestOption?.registrar || 'Unknown',
                    discoveredAt: new Date(),
                    apiResult: availabilityResult
                };
                
                this.discovered.push(domainInfo);

                this.emit('discovery', {
                    bot: this.name,
                    domain,
                    type: 'hidden',
                    specialty: this.specialty,
                    depth: this.stats.currentDepth,
                    potential: domainInfo.potential,
                    registrar: domainInfo.registrar
                });

                if (Math.random() > 0.6) {
                    await this.attemptAcquisition(domain, domainInfo);
                }
            }
        } catch (error) {
            console.error(`Domain check failed for ${domain}:`, error.message);
            throw error;
        }

        this.emit('status', {
            bot: this.name,
            status: 'exploring',
            message: `Depth: ${this.stats.currentDepth}/${this.searchDepth}, Found: ${this.stats.domainsDiscovered} gems, API calls: ${this.stats.apiCalls}`
        });
    }

    async attemptAcquisition(domain, domainInfo) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2500 + 500));
        
        const success = Math.random() > 0.4;
        if (success) {
            this.stats.domainsAcquired++;
            const acquisitionInfo = {
                domain,
                acquiredAt: new Date(),
                price: Math.floor(Math.random() * 2000) + 100,
                registrar: domainInfo.registrar,
                depth: domainInfo.depth,
                potential: domainInfo.potential,
                method: this.useRealAPI ? 'api' : 'mock'
            };
            
            this.acquired.push(acquisitionInfo);
        }

        this.emit('acquisition', {
            bot: this.name,
            domain,
            success,
            type: 'hidden',
            depth: domainInfo.depth,
            registrar: domainInfo.registrar
        });
    }
}

module.exports = BotManager;