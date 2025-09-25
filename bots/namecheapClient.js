/**
 * Namecheap API Client
 * Handles domain search, availability checks, and acquisition through Namecheap API
 */

const axios = require('axios');
const xml2js = require('xml2js');

class NamecheapClient {
    constructor() {
        this.apiUser = process.env.NAMECHEAP_API_USER;
        this.apiKey = process.env.NAMECHEAP_API_KEY;
        this.username = process.env.NAMECHEAP_USERNAME || this.apiUser;
        this.clientIp = process.env.NAMECHEAP_CLIENT_IP || '127.0.0.1';
        
        if (!this.apiUser || !this.apiKey) {
            const message = 'Namecheap API credentials not found. Please set NAMECHEAP_API_USER and NAMECHEAP_API_KEY environment variables.';
            if (process.env.NODE_ENV === 'production') {
                throw new Error(message);
            } else {
                console.warn(`Namecheap Client: ${message} Running in demo mode.`);
                this.demoMode = true;
                return;
            }
        }
        
        this.baseURL = 'https://api.namecheap.com/xml.response';
        this.sandboxURL = 'https://api.sandbox.namecheap.com/xml.response';
        
        // Use sandbox for development
        this.apiURL = process.env.NODE_ENV === 'development' ? this.sandboxURL : this.baseURL;
        
        // Rate limiting
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 second between requests
        this.demoMode = false;
        
        this.parser = new xml2js.Parser({ explicitArray: false });
    }

    async makeRequest(command, extraParams = {}) {
        // Implement rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
        }
        this.lastRequestTime = Date.now();

        const params = {
            ApiUser: this.apiUser,
            ApiKey: this.apiKey,
            UserName: this.username,
            Command: command,
            ClientIp: this.clientIp,
            ...extraParams
        };

        try {
            const response = await axios.get(this.apiURL, { params });
            const result = await this.parser.parseStringPromise(response.data);
            
            if (result.ApiResponse.$.Status === 'ERROR') {
                const errors = Array.isArray(result.ApiResponse.Errors.Error) 
                    ? result.ApiResponse.Errors.Error 
                    : [result.ApiResponse.Errors.Error];
                const errorMessages = errors.map(err => err._).join(', ');
                throw new Error(`Namecheap API Error: ${errorMessages}`);
            }
            
            return result.ApiResponse;
        } catch (error) {
            if (error.response) {
                console.error(`Namecheap API Error [${command}]:`, {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                });
            } else {
                console.error(`Namecheap API Error [${command}]:`, error.message);
            }
            
            const apiError = new Error(`Namecheap API request failed: ${error.message}`);
            apiError.statusCode = error.response?.status;
            apiError.originalError = error;
            throw apiError;
        }
    }

    /**
     * Check domain availability
     * @param {string} domain - Domain name to check
     * @returns {Promise<{available: boolean, domain: string}>}
     */
    async checkDomainAvailability(domain) {
        if (this.demoMode) {
            console.log(`[Namecheap Demo] Simulating availability check for: ${domain}`);
            // Return demo data
            return {
                domain,
                available: Math.random() > 0.7,
                isPremium: Math.random() > 0.8,
                premiumRegistrationPrice: Math.random() > 0.8 ? Math.floor(Math.random() * 100) + 20 : null,
                registrar: 'Namecheap'
            };
        }
        
        try {
            const result = await this.makeRequest('namecheap.domains.check', {
                DomainList: domain
            });
            
            const domainResult = result.CommandResponse.DomainCheckResult;
            
            return {
                domain,
                available: domainResult.$.Available === 'true',
                isPremium: domainResult.$.IsPremiumName === 'true',
                premiumRegistrationPrice: domainResult.$.PremiumRegistrationPrice || null,
                registrar: 'Namecheap'
            };
        } catch (error) {
            console.error(`Failed to check domain availability for ${domain}:`, error.message);
            throw error;
        }
    }

    /**
     * Check multiple domains at once
     * @param {Array<string>} domains - Array of domain names to check
     * @returns {Promise<Array>}
     */
    async checkMultipleDomains(domains) {
        try {
            const domainList = domains.join(',');
            const result = await this.makeRequest('namecheap.domains.check', {
                DomainList: domainList
            });
            
            const domainResults = Array.isArray(result.CommandResponse.DomainCheckResult)
                ? result.CommandResponse.DomainCheckResult
                : [result.CommandResponse.DomainCheckResult];
            
            return domainResults.map(domainResult => ({
                domain: domainResult.$.Domain,
                available: domainResult.$.Available === 'true',
                isPremium: domainResult.$.IsPremiumName === 'true',
                premiumRegistrationPrice: domainResult.$.PremiumRegistrationPrice || null,
                registrar: 'Namecheap',
                type: this.categorizeDomain(domainResult.$.Domain)
            }));
        } catch (error) {
            console.error(`Failed to check multiple domains:`, error.message);
            throw error;
        }
    }

    /**
     * Search for available domains with various TLDs
     * @param {string} query - Search query
     * @param {Array<string>} tlds - Array of TLDs to search
     * @returns {Promise<Array>}
     */
    async searchDomains(query, tlds = ['.com', '.net', '.org', '.info', '.biz']) {
        if (this.demoMode) {
            console.log(`[Namecheap Demo] Simulating domain search for: ${query}`);
            // Return demo available domains
            const demoResults = [];
            for (const tld of tlds.slice(0, 3)) { // Limit for demo
                if (Math.random() > 0.6) {
                    demoResults.push({
                        domain: `${query}${tld}`,
                        available: true,
                        isPremium: Math.random() > 0.8,
                        premiumRegistrationPrice: Math.random() > 0.8 ? Math.floor(Math.random() * 100) + 20 : null,
                        registrar: 'Namecheap',
                        type: this.categorizeDomain(`${query}${tld}`)
                    });
                }
            }
            return demoResults;
        }
        
        try {
            const domains = tlds.map(tld => `${query}${tld}`);
            const results = await this.checkMultipleDomains(domains);
            
            return results.filter(result => result.available);
        } catch (error) {
            console.error(`Domain search failed for query ${query}:`, error.message);
            throw error;
        }
    }

    /**
     * Get TLD pricing information
     * @param {string} type - Type of pricing (REGISTER, RENEW, REACTIVATE, TRANSFER)
     * @returns {Promise<Array>}
     */
    async getTldPricing(type = 'REGISTER') {
        try {
            const result = await this.makeRequest('namecheap.users.getPricing', {
                ProductType: 'DOMAINS',
                ActionName: type
            });
            
            const pricing = result.CommandResponse.UserGetPricingResult.ProductType.ProductCategory;
            return Array.isArray(pricing) ? pricing : [pricing];
        } catch (error) {
            console.error(`Failed to get TLD pricing:`, error.message);
            throw error;
        }
    }

    /**
     * Register a domain (requires additional setup)
     * Note: This is a placeholder - actual domain registration requires contact info and payment
     * @param {string} domain - Domain to register
     * @param {Object} contactInfo - Contact information
     * @returns {Promise<Object>}
     */
    async registerDomain(domain, contactInfo = null) {
        throw new Error('Domain registration functionality requires additional setup with contact information and payment methods. This is a placeholder for the actual implementation.');
    }

    /**
     * Generate domain variations and check availability
     * @param {string} baseDomain - Base domain name (without TLD)
     * @param {Array<string>} tlds - TLDs to check
     * @returns {Promise<Array>}
     */
    async generateDomainVariations(baseDomain, tlds = ['.com', '.net', '.org', '.io', '.ai']) {
        if (this.demoMode) {
            console.log(`[Namecheap Demo] Generating variations for: ${baseDomain}`);
            const demoVariations = [];
            const suffixes = ['app', 'pro', 'hub'];
            
            suffixes.forEach(suffix => {
                tlds.slice(0, 2).forEach(tld => {
                    if (Math.random() > 0.7) {
                        demoVariations.push({
                            domain: `${baseDomain}${suffix}${tld}`,
                            available: true,
                            isPremium: false,
                            premiumRegistrationPrice: null,
                            registrar: 'Namecheap',
                            type: this.categorizeDomain(`${baseDomain}${suffix}${tld}`)
                        });
                    }
                });
            });
            
            return demoVariations;
        }
        
        const variations = [];
        const suffixes = ['app', 'pro', 'hub', 'lab', 'zone', 'tech', 'digital'];
        const prefixes = ['get', 'my', 'the', 'new', 'smart'];
        
        // Base domain with different TLDs
        tlds.forEach(tld => {
            variations.push(`${baseDomain}${tld}`);
        });
        
        // Add suffixes
        suffixes.forEach(suffix => {
            tlds.forEach(tld => {
                variations.push(`${baseDomain}${suffix}${tld}`);
            });
        });
        
        // Add prefixes
        prefixes.forEach(prefix => {
            tlds.forEach(tld => {
                variations.push(`${prefix}${baseDomain}${tld}`);
            });
        });
        
        // Check availability in batches to respect API limits
        const batchSize = 20;
        const results = [];
        
        for (let i = 0; i < variations.length; i += batchSize) {
            const batch = variations.slice(i, i + batchSize);
            try {
                const batchResults = await this.checkMultipleDomains(batch);
                results.push(...batchResults.filter(result => result.available));
            } catch (error) {
                console.warn(`Failed to check batch ${i}-${i + batchSize}:`, error.message);
                // Continue with next batch
            }
        }
        
        return results;
    }

    /**
     * Categorize domain based on its characteristics
     * @param {string} domain - Domain name
     * @returns {string}
     */
    categorizeDomain(domain) {
        const domainLower = domain.toLowerCase();
        
        if (domainLower.includes('crypto') || domainLower.includes('coin') || domainLower.includes('chain')) {
            return 'crypto';
        }
        if (domainLower.includes('ai') || domainLower.includes('ml') || domainLower.includes('bot')) {
            return 'ai';
        }
        if (domainLower.includes('nft') || domainLower.includes('defi') || domainLower.includes('web3')) {
            return 'web3';
        }
        if (domainLower.includes('game') || domainLower.includes('play') || domainLower.includes('esports')) {
            return 'gaming';
        }
        if (domainLower.includes('finance') || domainLower.includes('fintech') || domainLower.includes('pay')) {
            return 'fintech';
        }
        if (domainLower.length <= 6 && !domainLower.includes('.')) {
            return 'premium-short';
        }
        
        return 'standard';
    }

    /**
     * Generate trending search queries
     * @returns {Array<string>}
     */
    generateTrendingQueries() {
        const trends = [
            'ai', 'crypto', 'nft', 'defi', 'web3', 'metaverse', 'blockchain',
            'fintech', 'healthtech', 'edtech', 'proptech', 'agtech',
            'saas', 'paas', 'iaas', 'cloud', 'edge', 'iot',
            'sustainable', 'green', 'eco', 'climate', 'carbon',
            'remote', 'hybrid', 'digital', 'virtual', 'augmented'
        ];
        
        const suffixes = ['hub', 'lab', 'pro', 'app', 'tool', 'platform', 'solution'];
        const queries = [];
        
        // Add base trends
        queries.push(...trends);
        
        // Combine trends with suffixes
        trends.forEach(trend => {
            suffixes.forEach(suffix => {
                queries.push(`${trend}${suffix}`);
            });
        });
        
        // Add numbered variations
        const popularTrends = ['ai', 'crypto', 'nft', 'web3'];
        popularTrends.forEach(trend => {
            for (let i = 1; i <= 100; i += Math.floor(Math.random() * 10) + 1) {
                queries.push(`${trend}${i}`);
            }
        });
        
        return queries;
    }
}

module.exports = NamecheapClient;