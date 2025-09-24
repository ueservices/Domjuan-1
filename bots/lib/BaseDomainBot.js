/**
 * Base Domain Discovery Bot
 * Provides core functionality for domain discovery, validation, and logging
 */

const whois = require('whois');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');

class BaseDomainBot {
    constructor(profile, config = {}) {
        this.profile = profile;
        this.config = {
            scanInterval: config.scanInterval || 60000, // 1 minute default
            maxDomainsPerScan: config.maxDomainsPerScan || 10,
            dataDir: config.dataDir || path.join(__dirname, '..', 'data'),
            logDir: config.logDir || path.join(__dirname, '..', 'logs'),
            outputFormat: config.outputFormat || 'csv',
            ...config
        };
        
        this.isRunning = false;
        this.discoveredDomains = new Map();
        this.whoisLookup = promisify(whois.lookup);
        
        this.ensureDirectories();
    }

    async ensureDirectories() {
        try {
            await fs.mkdir(this.config.dataDir, { recursive: true });
            await fs.mkdir(this.config.logDir, { recursive: true });
        } catch (error) {
            console.error('Error creating directories:', error);
        }
    }

    /**
     * Generate domain candidates based on profile
     * Override this method in profile-specific bots
     */
    generateDomainCandidates() {
        throw new Error('generateDomainCandidates must be implemented by subclass');
    }

    /**
     * Check domain availability using WHOIS
     */
    async checkDomainAvailability(domain) {
        try {
            const whoisData = await this.whoisLookup(domain);
            
            // Basic availability check - look for common "not found" indicators
            const notFoundIndicators = [
                'no match',
                'not found',
                'no data found',
                'no entries found',
                'available for registration',
                'not found in database'
            ];
            
            const isAvailable = notFoundIndicators.some(indicator => 
                whoisData.toLowerCase().includes(indicator)
            );
            
            return {
                domain,
                available: isAvailable,
                whoisData: whoisData.substring(0, 500), // Truncate for storage
                checkedAt: new Date().toISOString()
            };
        } catch (error) {
            await this.log('error', `WHOIS lookup failed for ${domain}: ${error.message}`);
            return {
                domain,
                available: null,
                error: error.message,
                checkedAt: new Date().toISOString()
            };
        }
    }

    /**
     * Validate domain legitimacy
     */
    async validateDomainLegitimacy(domainInfo) {
        // Basic validation checks
        const domain = domainInfo.domain;
        
        // Check for suspicious patterns
        const suspiciousPatterns = [
            /\d{4,}/, // Long number sequences
            /(.)\1{3,}/, // Repeated characters
            /-{2,}/, // Multiple hyphens
        ];
        
        const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(domain));
        
        return {
            ...domainInfo,
            legitimate: !isSuspicious && domainInfo.available !== null,
            validatedAt: new Date().toISOString()
        };
    }

    /**
     * Log messages with timestamp and profile
     */
    async log(level, message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${this.profile.toUpperCase()}] [${level.toUpperCase()}] ${message}\n`;
        
        console.log(logEntry.trim());
        
        try {
            const logFile = path.join(this.config.logDir, `${this.profile}-bot.log`);
            await fs.appendFile(logFile, logEntry);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    /**
     * Save discovered domain data
     */
    async saveDomainData(domainInfo) {
        const dataKey = `${domainInfo.domain}-${Date.now()}`;
        this.discoveredDomains.set(dataKey, domainInfo);
        
        // Save to file
        try {
            const dataFile = path.join(this.config.dataDir, `${this.profile}-domains.json`);
            const existingData = await this.loadExistingData(dataFile);
            existingData.push({
                ...domainInfo,
                bot: this.profile,
                discoveredAt: new Date().toISOString()
            });
            
            await fs.writeFile(dataFile, JSON.stringify(existingData, null, 2));
            await this.log('info', `Saved domain data for ${domainInfo.domain}`);
        } catch (error) {
            await this.log('error', `Failed to save domain data: ${error.message}`);
        }
    }

    async loadExistingData(dataFile) {
        try {
            const data = await fs.readFile(dataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return []; // Return empty array if file doesn't exist
        }
    }

    /**
     * Export discovered domains to CSV
     */
    async exportToCSV() {
        const csvWriter = require('csv-writer').createObjectCsvWriter;
        const csvFile = path.join(this.config.dataDir, `${this.profile}-domains-export.csv`);
        
        const writer = csvWriter({
            path: csvFile,
            header: [
                { id: 'domain', title: 'Domain' },
                { id: 'bot', title: 'Bot' },
                { id: 'task', title: 'Task' },
                { id: 'status', title: 'Status' },
                { id: 'authCode', title: 'AuthCode/TransferKey' },
                { id: 'legitimate', title: 'Legit' },
                { id: 'discoveredAt', title: 'AcquisitionDate' },
                { id: 'notes', title: 'Notes' }
            ]
        });

        const dataFile = path.join(this.config.dataDir, `${this.profile}-domains.json`);
        const domains = await this.loadExistingData(dataFile);
        
        const csvData = domains.map(domain => ({
            domain: domain.domain,
            bot: domain.bot,
            task: this.profile,
            status: domain.available ? 'Available' : 'Unavailable',
            authCode: domain.authCode || 'N/A',
            legitimate: domain.legitimate ? 'Yes' : 'No',
            discoveredAt: domain.discoveredAt,
            notes: domain.notes || `${this.profile} profile domain`
        }));

        await writer.writeRecords(csvData);
        await this.log('info', `Exported ${csvData.length} domains to CSV: ${csvFile}`);
        
        return csvFile;
    }

    /**
     * Main scanning loop
     */
    async scan() {
        if (this.isRunning) {
            await this.log('warn', 'Scan already in progress, skipping...');
            return;
        }

        this.isRunning = true;
        await this.log('info', `Starting ${this.profile} domain scan...`);

        try {
            const candidates = await this.generateDomainCandidates();
            await this.log('info', `Generated ${candidates.length} domain candidates`);

            const limitedCandidates = candidates.slice(0, this.config.maxDomainsPerScan);
            
            for (const domain of limitedCandidates) {
                try {
                    await this.log('info', `Checking domain: ${domain}`);
                    
                    const domainInfo = await this.checkDomainAvailability(domain);
                    const validatedInfo = await this.validateDomainLegitimacy(domainInfo);
                    
                    if (validatedInfo.available && validatedInfo.legitimate) {
                        await this.saveDomainData(validatedInfo);
                        await this.log('info', `Found available domain: ${domain}`);
                    }
                    
                    // Rate limiting to avoid overwhelming WHOIS servers
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (error) {
                    await this.log('error', `Error processing domain ${domain}: ${error.message}`);
                }
            }
            
        } catch (error) {
            await this.log('error', `Scan error: ${error.message}`);
        } finally {
            this.isRunning = false;
            await this.log('info', `${this.profile} domain scan completed`);
        }
    }

    /**
     * Start continuous scanning
     */
    startContinuousScanning() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
        }
        
        this.log('info', `Starting continuous scanning every ${this.config.scanInterval}ms`);
        
        this.scanInterval = setInterval(async () => {
            await this.scan();
        }, this.config.scanInterval);
        
        // Run initial scan
        this.scan();
    }

    /**
     * Stop continuous scanning
     */
    stopContinuousScanning() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
            this.log('info', 'Stopped continuous scanning');
        }
    }

    /**
     * Get discovered domains count
     */
    getDiscoveredDomainsCount() {
        return this.discoveredDomains.size;
    }
}

module.exports = BaseDomainBot;