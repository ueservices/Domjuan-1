/**
 * Domain Registrar API Integration Module
 * Provides real API connections to GoDaddy, Namecheap, and other registrars
 */

const https = require('https');
const crypto = require('crypto');

class DomainRegistrarAPI {
    constructor() {
        this.config = {
            godaddy: {
                apiKey: process.env.GODADDY_API_KEY || '',
                secret: process.env.GODADDY_API_SECRET || '',
                baseUrl: process.env.GODADDY_API_URL || 'https://api.godaddy.com',
                timeout: 10000
            },
            namecheap: {
                apiKey: process.env.NAMECHEAP_API_KEY || '',
                username: process.env.NAMECHEAP_USERNAME || '',
                baseUrl: process.env.NAMECHEAP_API_URL || 'https://api.namecheap.com/xml.response',
                timeout: 10000
            },
            rateLimit: {
                maxRequestsPerMinute: 60,
                requestQueue: [],
                lastReset: Date.now()
            }
        };
    }

    /**
     * Rate limiting to prevent API abuse
     */
    async rateLimit() {
        const now = Date.now();
        const oneMinute = 60 * 1000;
        
        // Reset counter every minute
        if (now - this.config.rateLimit.lastReset > oneMinute) {
            this.config.rateLimit.requestQueue = [];
            this.config.rateLimit.lastReset = now;
        }

        // Check if we've exceeded the rate limit
        if (this.config.rateLimit.requestQueue.length >= this.config.rateLimit.maxRequestsPerMinute) {
            const waitTime = oneMinute - (now - this.config.rateLimit.lastReset);
            console.log(`Rate limit reached, waiting ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.rateLimit(); // Recursively try again
        }

        this.config.rateLimit.requestQueue.push(now);
    }

    /**
     * Make HTTP request with error handling and retry logic
     */
    async makeRequest(options, data = null, retries = 3) {
        await this.rateLimit();

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let responseData = '';
                
                res.on('data', chunk => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    try {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            // Try to parse JSON response
                            try {
                                const jsonData = JSON.parse(responseData);
                                resolve(jsonData);
                            } catch (e) {
                                // If not JSON, return raw data
                                resolve(responseData);
                            }
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                if (retries > 0) {
                    console.log(`Request failed, retrying... (${retries} attempts left)`);
                    setTimeout(() => {
                        this.makeRequest(options, data, retries - 1)
                            .then(resolve)
                            .catch(reject);
                    }, 1000 * (4 - retries)); // Exponential backoff
                } else {
                    reject(error);
                }
            });

            req.setTimeout(options.timeout || 10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (data) {
                req.write(data);
            }
            
            req.end();
        });
    }

    /**
     * Check domain availability via GoDaddy API
     */
    async checkDomainAvailabilityGoDaddy(domain) {
        if (!this.config.godaddy.apiKey || !this.config.godaddy.secret) {
            throw new Error('GoDaddy API credentials not configured');
        }

        const options = {
            hostname: 'api.godaddy.com',
            port: 443,
            path: `/v1/domains/available?domain=${encodeURIComponent(domain)}`,
            method: 'GET',
            headers: {
                'Authorization': `sso-key ${this.config.godaddy.apiKey}:${this.config.godaddy.secret}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: this.config.godaddy.timeout
        };

        try {
            const response = await this.makeRequest(options);
            return {
                domain,
                available: response.available || false,
                price: response.price || null,
                currency: response.currency || 'USD',
                registrar: 'GoDaddy',
                timestamp: new Date()
            };
        } catch (error) {
            console.error(`GoDaddy API error for ${domain}:`, error.message);
            return {
                domain,
                available: null,
                error: error.message,
                registrar: 'GoDaddy',
                timestamp: new Date()
            };
        }
    }

    /**
     * Check domain availability via Namecheap API
     */
    async checkDomainAvailabilityNamecheap(domain) {
        if (!this.config.namecheap.apiKey || !this.config.namecheap.username) {
            throw new Error('Namecheap API credentials not configured');
        }

        const params = new URLSearchParams({
            ApiUser: this.config.namecheap.username,
            ApiKey: this.config.namecheap.apiKey,
            UserName: this.config.namecheap.username,
            Command: 'namecheap.domains.check',
            ClientIp: '127.0.0.1', // Should be your server IP in production
            DomainList: domain
        });

        const options = {
            hostname: 'api.namecheap.com',
            port: 443,
            path: `/xml.response?${params.toString()}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/xml'
            },
            timeout: this.config.namecheap.timeout
        };

        try {
            const response = await this.makeRequest(options);
            // Parse XML response (simplified - in production, use proper XML parser)
            const available = response.includes('Available="true"');
            
            return {
                domain,
                available,
                registrar: 'Namecheap',
                timestamp: new Date()
            };
        } catch (error) {
            console.error(`Namecheap API error for ${domain}:`, error.message);
            return {
                domain,
                available: null,
                error: error.message,
                registrar: 'Namecheap',
                timestamp: new Date()
            };
        }
    }

    /**
     * Check domain availability across multiple registrars
     */
    async checkDomainAvailability(domain) {
        const results = await Promise.allSettled([
            this.checkDomainAvailabilityGoDaddy(domain),
            this.checkDomainAvailabilityNamecheap(domain)
        ]);

        const availability = {
            domain,
            timestamp: new Date(),
            registrars: {}
        };

        results.forEach((result, index) => {
            const registrar = index === 0 ? 'godaddy' : 'namecheap';
            
            if (result.status === 'fulfilled') {
                availability.registrars[registrar] = result.value;
            } else {
                availability.registrars[registrar] = {
                    domain,
                    available: null,
                    error: result.reason.message,
                    registrar: registrar,
                    timestamp: new Date()
                };
            }
        });

        // Determine overall availability
        const availableResults = Object.values(availability.registrars)
            .filter(r => r.available === true);
        
        availability.overallAvailable = availableResults.length > 0;
        availability.bestOption = availableResults.length > 0 ? availableResults[0] : null;

        return availability;
    }

    /**
     * Get domain suggestions (mock implementation for now)
     */
    async getDomainSuggestions(keyword, tlds = ['.com', '.net', '.org']) {
        const suggestions = [];
        const prefixes = ['get', 'my', 'the', 'pro', 'top', 'best'];
        const suffixes = ['hub', 'zone', 'spot', 'world', 'app', 'tech'];

        // Generate suggestions
        for (const tld of tlds) {
            suggestions.push(`${keyword}${tld}`);
            
            for (const prefix of prefixes.slice(0, 2)) {
                suggestions.push(`${prefix}${keyword}${tld}`);
            }
            
            for (const suffix of suffixes.slice(0, 2)) {
                suggestions.push(`${keyword}${suffix}${tld}`);
            }
        }

        return suggestions.slice(0, 20); // Limit to 20 suggestions
    }

    /**
     * Validate domain name format
     */
    isValidDomain(domain) {
        const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
        return domainRegex.test(domain) && domain.length <= 253;
    }

    /**
     * Get API status and health
     */
    async getApiStatus() {
        const status = {
            timestamp: new Date(),
            apis: {}
        };

        // Check GoDaddy API
        try {
            if (this.config.godaddy.apiKey && this.config.godaddy.secret) {
                const testResult = await this.checkDomainAvailabilityGoDaddy('test123456789.com');
                status.apis.godaddy = {
                    available: true,
                    lastCheck: new Date(),
                    error: testResult.error || null
                };
            } else {
                status.apis.godaddy = {
                    available: false,
                    error: 'API credentials not configured'
                };
            }
        } catch (error) {
            status.apis.godaddy = {
                available: false,
                error: error.message
            };
        }

        // Check Namecheap API
        try {
            if (this.config.namecheap.apiKey && this.config.namecheap.username) {
                const testResult = await this.checkDomainAvailabilityNamecheap('test123456789.com');
                status.apis.namecheap = {
                    available: true,
                    lastCheck: new Date(),
                    error: testResult.error || null
                };
            } else {
                status.apis.namecheap = {
                    available: false,
                    error: 'API credentials not configured'
                };
            }
        } catch (error) {
            status.apis.namecheap = {
                available: false,
                error: error.message
            };
        }

        status.overallStatus = Object.values(status.apis).some(api => api.available) ? 'healthy' : 'unhealthy';
        return status;
    }
}

module.exports = DomainRegistrarAPI;