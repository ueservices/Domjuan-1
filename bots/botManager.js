/**
 * Bot Manager - Handles the three domain discovery bots
 * Domain Hunter, Asset Seeker, Recursive Explorer
 */

const EventEmitter = require('events');

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
        });

        this.emit('allBotsStarted', { timestamp: this.startTime });
    }

    stopAllBots() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        Object.values(this.bots).forEach(bot => bot.stop());
        this.emit('allBotsStopped', { timestamp: new Date() });
    }

    handleBotDiscovery(data) {
        this.stats.totalDomains++;
        this.emit('discovery', {
            ...data,
            timestamp: new Date(),
            totalDomains: this.stats.totalDomains
        });
    }

    handleBotAcquisition(data) {
        if (data.success) {
            this.stats.successfulAcquisitions++;
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
        this.stats = {
            domainsScanned: 0,
            domainsDiscovered: 0,
            domainsAcquired: 0,
            currentDepth: 0,
            errors: 0
        };
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.stats.currentDepth = 0;
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
                this.searchTimer = setTimeout(() => this.runSearchCycle(), this.searchInterval);
            })
            .catch(error => {
                this.stats.errors++;
                this.emit('status', { 
                    bot: this.name, 
                    status: 'error', 
                    message: `Error in ${this.name}: ${error.message}`,
                    error: error
                });
                this.searchTimer = setTimeout(() => this.runSearchCycle(), this.searchInterval * 2);
            });
    }

    async performSearch() {
        // Override in subclasses
        throw new Error('performSearch must be implemented by subclass');
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

    getStatus() {
        return {
            name: this.name,
            isActive: this.isActive,
            stats: { ...this.stats },
            discovered: this.discovered.length,
            acquired: this.acquired.length
        };
    }
}

class DomainHunterBot extends BaseDomainBot {
    constructor() {
        super('Domain Hunter', { searchInterval: 3000, searchDepth: 3 });
        this.specialty = 'premium domains';
    }

    async performSearch() {
        const domain = this.generateDomainName();
        this.stats.domainsScanned++;

        // Simulate domain discovery
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

        if (Math.random() > 0.7) {
            this.stats.domainsDiscovered++;
            this.discovered.push({
                domain,
                type: 'premium',
                value: Math.floor(Math.random() * 10000) + 1000,
                registrar: ['GoDaddy', 'Namecheap', 'Network Solutions'][Math.floor(Math.random() * 3)]
            });

            this.emit('discovery', {
                bot: this.name,
                domain,
                type: 'premium',
                specialty: this.specialty
            });

            // Attempt acquisition
            if (Math.random() > 0.5) {
                await this.attemptAcquisition(domain);
            }
        }

        this.emit('status', {
            bot: this.name,
            status: 'searching',
            message: `Scanned: ${this.stats.domainsScanned}, Found: ${this.stats.domainsDiscovered}`
        });
    }

    async attemptAcquisition(domain) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));
        
        const success = Math.random() > 0.3;
        if (success) {
            this.stats.domainsAcquired++;
            this.acquired.push({
                domain,
                acquiredAt: new Date(),
                price: Math.floor(Math.random() * 5000) + 500
            });
        }

        this.emit('acquisition', {
            bot: this.name,
            domain,
            success,
            type: 'premium'
        });
    }
}

class AssetSeekerBot extends BaseDomainBot {
    constructor() {
        super('Asset Seeker', { searchInterval: 4000, searchDepth: 2 });
        this.specialty = 'digital assets';
    }

    async performSearch() {
        const domain = this.generateDomainName();
        this.stats.domainsScanned++;

        await new Promise(resolve => setTimeout(resolve, Math.random() * 1500));

        if (Math.random() > 0.6) {
            this.stats.domainsDiscovered++;
            this.discovered.push({
                domain,
                type: 'asset',
                category: ['NFT', 'DeFi', 'Gaming', 'SaaS'][Math.floor(Math.random() * 4)],
                registrar: ['GoDaddy', 'Namecheap', 'Network Solutions'][Math.floor(Math.random() * 3)]
            });

            this.emit('discovery', {
                bot: this.name,
                domain,
                type: 'asset',
                specialty: this.specialty
            });

            if (Math.random() > 0.4) {
                await this.attemptAcquisition(domain);
            }
        }

        this.emit('status', {
            bot: this.name,
            status: 'seeking',
            message: `Assets scanned: ${this.stats.domainsScanned}, Assets found: ${this.stats.domainsDiscovered}`
        });
    }

    async attemptAcquisition(domain) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1800));
        
        const success = Math.random() > 0.25;
        if (success) {
            this.stats.domainsAcquired++;
            this.acquired.push({
                domain,
                acquiredAt: new Date(),
                price: Math.floor(Math.random() * 3000) + 200
            });
        }

        this.emit('acquisition', {
            bot: this.name,
            domain,
            success,
            type: 'asset'
        });
    }
}

class RecursiveExplorerBot extends BaseDomainBot {
    constructor() {
        super('Recursive Explorer', { searchInterval: 6000, searchDepth: 5 });
        this.specialty = 'hidden gems';
    }

    async performSearch() {
        const domain = this.generateDomainName();
        this.stats.domainsScanned++;
        this.stats.currentDepth = Math.min(this.stats.currentDepth + 1, this.searchDepth);

        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

        if (Math.random() > 0.8) {
            this.stats.domainsDiscovered++;
            this.discovered.push({
                domain,
                type: 'hidden',
                depth: this.stats.currentDepth,
                potential: Math.floor(Math.random() * 100),
                registrar: ['GoDaddy', 'Namecheap', 'Network Solutions'][Math.floor(Math.random() * 3)]
            });

            this.emit('discovery', {
                bot: this.name,
                domain,
                type: 'hidden',
                specialty: this.specialty,
                depth: this.stats.currentDepth
            });

            if (Math.random() > 0.6) {
                await this.attemptAcquisition(domain);
            }
        }

        this.emit('status', {
            bot: this.name,
            status: 'exploring',
            message: `Depth: ${this.stats.currentDepth}/${this.searchDepth}, Found: ${this.stats.domainsDiscovered} gems`
        });
    }

    async attemptAcquisition(domain) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2500 + 500));
        
        const success = Math.random() > 0.4;
        if (success) {
            this.stats.domainsAcquired++;
            this.acquired.push({
                domain,
                acquiredAt: new Date(),
                price: Math.floor(Math.random() * 2000) + 100
            });
        }

        this.emit('acquisition', {
            bot: this.name,
            domain,
            success,
            type: 'hidden'
        });
    }
}

module.exports = BotManager;