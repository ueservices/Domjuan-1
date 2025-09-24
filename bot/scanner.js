const dns = require('dns').promises;
const axios = require('axios');
const crypto = require('crypto');

class DomainScanner {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.scanPatterns = [
            // Common subdomain patterns
            'www', 'mail', 'ftp', 'admin', 'api', 'app', 'blog', 'shop', 'store',
            'dev', 'test', 'staging', 'cdn', 'assets', 'media', 'images', 'static',
            // Hidden/forgotten patterns
            'old', 'backup', 'archive', 'legacy', 'temp', 'tmp', 'private', 'internal',
            'hidden', 'secret', 'confidential', 'admin-old', 'admin-backup',
            // Nested patterns
            'sub', 'portal', 'client', 'partner', 'vendor', 'support', 'help',
            // Cryptocurrency/blockchain related
            'wallet', 'crypto', 'blockchain', 'nft', 'token', 'coin', 'defi',
            'exchange', 'trading', 'mining', 'staking'
        ];
        
        this.tlds = [
            '.com', '.net', '.org', '.io', '.ai', '.co', '.app', '.dev', '.tech',
            '.crypto', '.blockchain', '.nft', '.wallet', '.coin', '.token'
        ];
        
        this.discoveredDomains = new Set();
        this.scanQueue = [];
    }

    async initialize() {
        this.logger.info('Initializing domain scanner');
        // Pre-populate scan queue with seed domains
        await this.generateSeedDomains();
    }

    async generateSeedDomains() {
        const seedWords = [
            // Tech/business terms
            'app', 'api', 'tech', 'dev', 'cloud', 'data', 'web', 'digital',
            // Crypto terms
            'crypto', 'bitcoin', 'ethereum', 'nft', 'defi', 'token', 'coin',
            'wallet', 'exchange', 'trading', 'mining', 'blockchain',
            // Hidden/valuable terms
            'rare', 'unique', 'premium', 'elite', 'exclusive', 'limited',
            'secret', 'hidden', 'private', 'vault', 'treasury'
        ];

        for (const word of seedWords) {
            for (const tld of this.tlds) {
                this.scanQueue.push({
                    domain: word + tld,
                    depth: 0,
                    category: 'seed',
                    source: 'generated'
                });
            }
        }

        this.logger.info(`Generated ${this.scanQueue.length} seed domains`);
    }

    async runDeepScan() {
        this.logger.info('Starting deep domain scan', { 
            queueSize: this.scanQueue.length,
            maxDepth: this.config.maxDepth 
        });

        const results = [];
        const processedDomains = new Set();

        while (this.scanQueue.length > 0 && results.length < 1000) {
            const batch = this.scanQueue.splice(0, 50); // Process in batches
            
            const batchPromises = batch.map(async (domainInfo) => {
                if (processedDomains.has(domainInfo.domain)) {
                    return null;
                }
                
                processedDomains.add(domainInfo.domain);
                return await this.scanDomain(domainInfo);
            });

            const batchResults = await Promise.allSettled(batchPromises);
            
            for (const result of batchResults) {
                if (result.status === 'fulfilled' && result.value) {
                    results.push(result.value);
                    
                    // Generate nested domains if depth allows
                    if (result.value.depth < this.config.maxDepth) {
                        await this.generateNestedDomains(result.value);
                    }
                }
            }
        }

        this.logger.info(`Deep scan completed`, { 
            discovered: results.length,
            processed: processedDomains.size 
        });

        return results;
    }

    async scanDomain(domainInfo) {
        try {
            const domain = domainInfo.domain.toLowerCase();
            
            // Basic validation
            if (!this.isValidDomain(domain)) {
                return null;
            }

            const domainData = {
                name: domain,
                category: domainInfo.category,
                depth: domainInfo.depth,
                source: domainInfo.source,
                scanTimestamp: new Date(),
                isActive: false,
                isAvailable: false,
                isLegitimate: true,
                isBlacklisted: false,
                isUnderDispute: false,
                hasAssets: false,
                hasCrypto: false,
                estimatedValue: 0,
                estimatedCost: 0,
                metadata: {}
            };

            // DNS resolution check
            try {
                const addresses = await dns.resolve4(domain);
                domainData.isActive = addresses && addresses.length > 0;
                domainData.ipAddresses = addresses;
            } catch (error) {
                domainData.isActive = false;
                // Domain might be available for registration
                domainData.isAvailable = await this.checkAvailability(domain);
            }

            // WHOIS simulation (simplified)
            domainData.whoisData = await this.simulateWhoisCheck(domain);
            
            // Security and legitimacy checks
            domainData.isLegitimate = await this.validateLegitimacy(domain);
            domainData.isBlacklisted = await this.checkBlacklist(domain);
            
            // Asset detection
            if (domainData.isActive) {
                const assetInfo = await this.detectAssets(domain);
                domainData.hasAssets = assetInfo.hasAssets;
                domainData.hasCrypto = assetInfo.hasCrypto;
                domainData.metadata.assets = assetInfo.details;
            }

            // Value estimation
            domainData.estimatedValue = this.estimateValue(domainData);
            domainData.estimatedCost = this.estimateCost(domainData);

            return domainData;

        } catch (error) {
            this.logger.error('Domain scan failed', {
                domain: domainInfo.domain,
                error: error.message
            });
            return null;
        }
    }

    async generateNestedDomains(parentDomain) {
        const nestedPatterns = [];
        
        // Generate subdomain variations
        for (const pattern of this.scanPatterns) {
            nestedPatterns.push({
                domain: `${pattern}.${parentDomain.name}`,
                depth: parentDomain.depth + 1,
                category: 'nested',
                source: `nested-from-${parentDomain.name}`
            });
        }

        // Generate domain variations (typos, extensions)
        const baseName = parentDomain.name.split('.')[0];
        for (const tld of this.tlds) {
            if (!parentDomain.name.endsWith(tld)) {
                nestedPatterns.push({
                    domain: `${baseName}${tld}`,
                    depth: parentDomain.depth + 1,
                    category: 'variation',
                    source: `variation-of-${parentDomain.name}`
                });
            }
        }

        // Add promising patterns to queue
        const promisingPatterns = nestedPatterns.filter(p => 
            this.calculateDomainPromise(p) > 50
        );

        this.scanQueue.push(...promisingPatterns);
        
        this.logger.debug(`Generated ${promisingPatterns.length} nested domains for ${parentDomain.name}`);
    }

    calculateDomainPromise(domainInfo) {
        let score = 50; // Base score

        // Category bonuses
        if (domainInfo.category === 'hidden') score += 30;
        if (domainInfo.category === 'nested') score += 20;
        if (domainInfo.category === 'crypto') score += 40;

        // Length preference (shorter is better)
        const domainName = domainInfo.domain.split('.')[0];
        if (domainName.length <= 5) score += 25;
        else if (domainName.length <= 8) score += 15;
        else if (domainName.length > 15) score -= 20;

        // Keyword bonuses
        const cryptoKeywords = ['crypto', 'nft', 'defi', 'token', 'coin', 'wallet'];
        const techKeywords = ['app', 'api', 'dev', 'tech', 'cloud'];
        const hiddenKeywords = ['hidden', 'secret', 'private', 'vault', 'rare'];

        for (const keyword of cryptoKeywords) {
            if (domainInfo.domain.includes(keyword)) score += 20;
        }
        for (const keyword of techKeywords) {
            if (domainInfo.domain.includes(keyword)) score += 15;
        }
        for (const keyword of hiddenKeywords) {
            if (domainInfo.domain.includes(keyword)) score += 25;
        }

        return score;
    }

    async checkAvailability(domain) {
        // Simulate domain availability check
        // In real implementation, this would query registrar APIs
        try {
            // Simple heuristic: if DNS fails, domain might be available
            await dns.resolve4(domain);
            return false; // Domain is active, not available
        } catch (error) {
            // Domain might be available, but we need more sophisticated checking
            return Math.random() > 0.7; // 30% chance of being available
        }
    }

    async simulateWhoisCheck(domain) {
        // Simulate WHOIS data retrieval
        return {
            registrar: this.getRandomRegistrar(),
            creationDate: this.getRandomDate(),
            expirationDate: this.getRandomFutureDate(),
            status: ['clientTransferProhibited'],
            nameservers: [`ns1.${domain}`, `ns2.${domain}`],
            contacts: {
                registrant: 'REDACTED FOR PRIVACY',
                admin: 'REDACTED FOR PRIVACY',
                tech: 'REDACTED FOR PRIVACY'
            }
        };
    }

    async validateLegitimacy(domain) {
        // Simulate legitimacy validation
        const suspiciousPatterns = ['phishing', 'scam', 'fake', 'malware', 'spam'];
        const domainLower = domain.toLowerCase();
        
        for (const pattern of suspiciousPatterns) {
            if (domainLower.includes(pattern)) {
                return false;
            }
        }
        
        return true; // Most domains are legitimate
    }

    async checkBlacklist(domain) {
        // Simulate blacklist checking
        // In real implementation, this would check against security databases
        return Math.random() < 0.05; // 5% chance of being blacklisted
    }

    async detectAssets(domain) {
        try {
            // Simulate asset detection by checking for common paths
            const assetPaths = [
                '/wallet', '/crypto', '/nft', '/tokens', '/assets',
                '/exchange', '/trading', '/mining', '/staking',
                '/.well-known/crypto', '/api/assets', '/blockchain'
            ];

            const assetInfo = {
                hasAssets: false,
                hasCrypto: false,
                details: []
            };

            // Simulate HTTP requests to detect assets
            for (const path of assetPaths.slice(0, 3)) { // Limit to avoid too many requests
                try {
                    const response = await axios.get(`https://${domain}${path}`, {
                        timeout: 5000,
                        validateStatus: () => true // Don't throw on 4xx/5xx
                    });

                    if (response.status === 200) {
                        assetInfo.hasAssets = true;
                        if (path.includes('crypto') || path.includes('wallet') || path.includes('nft')) {
                            assetInfo.hasCrypto = true;
                        }
                        
                        assetInfo.details.push({
                            path: path,
                            status: response.status,
                            type: this.categorizeAssetPath(path)
                        });
                    }
                } catch (error) {
                    // Ignore individual request failures
                }
            }

            return assetInfo;
        } catch (error) {
            return { hasAssets: false, hasCrypto: false, details: [] };
        }
    }

    categorizeAssetPath(path) {
        if (path.includes('wallet')) return 'cryptocurrency-wallet';
        if (path.includes('nft')) return 'nft-collection';
        if (path.includes('token')) return 'token-contract';
        if (path.includes('exchange')) return 'crypto-exchange';
        if (path.includes('mining')) return 'mining-pool';
        return 'digital-asset';
    }

    estimateValue(domainData) {
        let value = 10; // Base value in USD

        // Length-based valuation
        const domainName = domainData.name.split('.')[0];
        if (domainName.length <= 3) value += 1000;
        else if (domainName.length <= 5) value += 500;
        else if (domainName.length <= 8) value += 100;

        // TLD bonuses
        if (domainData.name.endsWith('.com')) value *= 3;
        else if (domainData.name.endsWith('.io')) value *= 2;
        else if (domainData.name.endsWith('.crypto')) value *= 5;

        // Category bonuses
        if (domainData.category === 'hidden') value *= 2;
        if (domainData.category === 'crypto') value *= 4;
        if (domainData.hasAssets) value *= 3;
        if (domainData.hasCrypto) value *= 5;

        // Activity bonus
        if (domainData.isActive) value *= 1.5;
        else if (domainData.isAvailable) value *= 0.8;

        return Math.round(value);
    }

    estimateCost(domainData) {
        if (domainData.isAvailable) {
            // Registration cost
            const tld = '.' + domainData.name.split('.').pop();
            const registrationCosts = {
                '.com': 12,
                '.net': 15,
                '.org': 14,
                '.io': 35,
                '.crypto': 40,
                '.nft': 45
            };
            return registrationCosts[tld] || 20;
        } else {
            // Acquisition cost (market value estimation)
            return domainData.estimatedValue * (2 + Math.random() * 3); // 2x-5x estimated value
        }
    }

    isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
        return domainRegex.test(domain) && domain.length <= 253;
    }

    getRandomRegistrar() {
        const registrars = ['GoDaddy', 'Namecheap', 'Spaceship', 'Afternic', 'Network Solutions'];
        return registrars[Math.floor(Math.random() * registrars.length)];
    }

    getRandomDate() {
        const start = new Date(2000, 0, 1);
        const end = new Date();
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    getRandomFutureDate() {
        const start = new Date();
        const end = new Date();
        end.setFullYear(end.getFullYear() + 2);
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }
}

module.exports = DomainScanner;