/**
 * GoDaddy API Client
 * Handles domain search, availability checks, and acquisition through GoDaddy API
 */

const axios = require('axios');

class GoDaddyClient {
    constructor() {
        this.apiKey = process.env.GODADDY_API_KEY;
        this.apiSecret = process.env.GODADDY_API_SECRET;
        
        if (!this.apiKey || !this.apiSecret) {
            const message = 'GoDaddy API credentials not found. Please set GODADDY_API_KEY and GODADDY_API_SECRET environment variables.';
            if (process.env.NODE_ENV === 'production') {
                throw new Error(message);
            } else {
                console.warn(`GoDaddy Client: ${message} Running in demo mode.`);
                this.demoMode = true;
                return;
            }
        }
        
        this.baseURL = 'https://api.godaddy.com/v1';
        this.headers = {
            'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // Rate limiting
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 second between requests to respect rate limits
        this.demoMode = false;
    }

    async makeRequest(endpoint, method = 'GET', data = null) {
        // Implement rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
        }
        this.lastRequestTime = Date.now();

        try {
            const config = {
                method,
                url: `${this.baseURL}${endpoint}`,
                headers: this.headers
            };

            if (data) {
                config.data = data;
            }

            const response = await axios(config);
            return response.data;
        } catch (error) {
            console.error(`GoDaddy API Error [${endpoint}]:`, {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            
            // Re-throw with more context
            const apiError = new Error(`GoDaddy API request failed: ${error.message}`);
            apiError.statusCode = error.response?.status;
            apiError.originalError = error;
            throw apiError;
        }
    }

    /**
     * Check domain availability
     * @param {string} domain - Domain name to check
     * @returns {Promise<{available: boolean, domain: string, price?: number}>}
     */
    async checkDomainAvailability(domain) {
        if (this.demoMode) {
            console.log(`[GoDaddy Demo] Simulating availability check for: ${domain}`);
            // Return demo data
            return {
                domain,
                available: Math.random() > 0.7,
                price: Math.floor(Math.random() * 50) + 10,
                currency: 'USD',
                period: 1
            };
        }
        
        try {
            const endpoint = `/domains/available?domain=${encodeURIComponent(domain)}`;
            const result = await this.makeRequest(endpoint);
            
            return {
                domain,
                available: result.available,
                price: result.price ? result.price / 1000000 : null, // GoDaddy returns price in micro-units
                currency: result.currency || 'USD',
                period: result.period || 1
            };
        } catch (error) {
            console.error(`Failed to check domain availability for ${domain}:`, error.message);
            throw error;
        }
    }

    /**
     * Search for domains with suggestions
     * @param {string} query - Search query
     * @param {Array<string>} tlds - Array of TLDs to search
     * @returns {Promise<Array>}
     */
    async searchDomains(query, tlds = ['.com', '.net', '.org', '.io']) {
        if (this.demoMode) {
            console.log(`[GoDaddy Demo] Simulating domain search for: ${query}`);
            // Return demo available domains
            const demoResults = [];
            for (const tld of tlds.slice(0, 2)) { // Limit for demo
                if (Math.random() > 0.6) {
                    demoResults.push({
                        domain: `${query}${tld}`,
                        available: true,
                        price: Math.floor(Math.random() * 50) + 10,
                        currency: 'USD',
                        registrar: 'GoDaddy',
                        type: this.categorizeDomain(`${query}${tld}`)
                    });
                }
            }
            return demoResults;
        }
        
        try {
            const suggestions = [];
            
            // Check each TLD combination
            for (const tld of tlds) {
                const domain = `${query}${tld}`;
                try {
                    const availability = await this.checkDomainAvailability(domain);
                    if (availability.available) {
                        suggestions.push({
                            domain,
                            available: true,
                            price: availability.price,
                            currency: availability.currency,
                            registrar: 'GoDaddy',
                            type: this.categorizeDomain(domain)
                        });
                    }
                } catch (error) {
                    console.warn(`Failed to check ${domain}:`, error.message);
                    // Continue with other domains instead of failing completely
                }
            }
            
            return suggestions;
        } catch (error) {
            console.error(`Domain search failed for query ${query}:`, error.message);
            throw error;
        }
    }

    /**
     * Get domain suggestions based on keywords
     * @param {string} query - Search query
     * @returns {Promise<Array>}
     */
    async getDomainSuggestions(query) {
        try {
            const endpoint = `/domains/suggest?query=${encodeURIComponent(query)}`;
            const suggestions = await this.makeRequest(endpoint);
            
            return suggestions.map(suggestion => ({
                domain: suggestion.domain,
                available: suggestion.isAvailable,
                price: suggestion.price ? suggestion.price / 1000000 : null,
                currency: suggestion.currency || 'USD',
                registrar: 'GoDaddy',
                type: this.categorizeDomain(suggestion.domain)
            }));
        } catch (error) {
            console.error(`Failed to get domain suggestions for ${query}:`, error.message);
            throw error;
        }
    }

    /**
     * Purchase a domain (requires additional setup and payment method)
     * Note: This is a placeholder - actual domain purchase requires more complex setup
     * @param {string} domain - Domain to purchase
     * @param {Object} contactInfo - Contact information
     * @returns {Promise<Object>}
     */
    async purchaseDomain(domain, contactInfo = null) {
        throw new Error('Domain purchase functionality requires additional setup with payment methods and contact information. This is a placeholder for the actual implementation.');
    }

    /**
     * Categorize domain based on its characteristics
     * @param {string} domain - Domain name
     * @returns {string}
     */
    categorizeDomain(domain) {
        const domainLower = domain.toLowerCase();
        
        if (domainLower.includes('crypto') || domainLower.includes('btc') || domainLower.includes('eth')) {
            return 'crypto';
        }
        if (domainLower.includes('ai') || domainLower.includes('ml') || domainLower.includes('tech')) {
            return 'tech';
        }
        if (domainLower.includes('nft') || domainLower.includes('defi') || domainLower.includes('web3')) {
            return 'web3';
        }
        if (domainLower.includes('game') || domainLower.includes('play') || domainLower.includes('meta')) {
            return 'gaming';
        }
        if (domainLower.length <= 5) {
            return 'premium-short';
        }
        
        return 'standard';
    }

    /**
     * Generate domain search queries based on current trends
     * @returns {Array<string>}
     */
    generateSearchQueries() {
        const prefixes = ['ai', 'crypto', 'web3', 'defi', 'nft', 'meta', 'smart', 'digital'];
        const suffixes = ['hub', 'pro', 'zone', 'lab', 'space', 'world', 'tech', 'app'];
        const trends = ['blockchain', 'fintech', 'saas', 'cloud', 'data'];
        
        const queries = [];
        
        // Combine prefixes and suffixes
        prefixes.forEach(prefix => {
            suffixes.forEach(suffix => {
                queries.push(`${prefix}${suffix}`);
            });
        });
        
        // Add trending terms
        queries.push(...trends);
        
        // Add numbered variations
        prefixes.forEach(prefix => {
            for (let i = 1; i <= 999; i += Math.floor(Math.random() * 100) + 1) {
                queries.push(`${prefix}${i}`);
            }
        });
        
        return queries;
    }
}

module.exports = GoDaddyClient;