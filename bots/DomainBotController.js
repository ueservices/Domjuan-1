/**
 * Domain Bot Controller
 * Manages all domain discovery bots and provides centralized control
 */

const NestedBot = require('./lib/NestedBot');
const HiddenBot = require('./lib/HiddenBot');
const UnexploredBot = require('./lib/UnexploredBot');
const UnseenBot = require('./lib/UnseenBot');
const UnfoundBot = require('./lib/UnfoundBot');

const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');

class DomainBotController {
    constructor(config = {}) {
        this.config = {
            dataDir: config.dataDir || path.join(__dirname, 'data'),
            logDir: config.logDir || path.join(__dirname, 'logs'),
            scanInterval: config.scanInterval || 300000, // 5 minutes default
            enableScheduling: config.enableScheduling !== false,
            schedulePattern: config.schedulePattern || '*/30 * * * *', // Every 30 minutes
            maxConcurrentBots: config.maxConcurrentBots || 2,
            ...config
        };
        
        this.bots = new Map();
        this.isRunning = false;
        this.scheduledJob = null;
        
        this.initializeBots();
    }

    initializeBots() {
        console.log('Initializing domain discovery bots...');
        
        const botConfig = {
            dataDir: this.config.dataDir,
            logDir: this.config.logDir,
            scanInterval: this.config.scanInterval,
            maxDomainsPerScan: 5 // Limit to avoid overwhelming WHOIS servers
        };

        this.bots.set('nested', new NestedBot(botConfig));
        this.bots.set('hidden', new HiddenBot(botConfig));
        this.bots.set('unexplored', new UnexploredBot(botConfig));
        this.bots.set('unseen', new UnseenBot(botConfig));
        this.bots.set('unfound', new UnfoundBot(botConfig));
        
        console.log(`Initialized ${this.bots.size} domain discovery bots`);
    }

    async startAllBots() {
        if (this.isRunning) {
            console.log('Bots are already running');
            return;
        }

        this.isRunning = true;
        console.log('Starting all domain discovery bots...');
        
        // Start bots with staggered timing to avoid overwhelming servers
        let delay = 0;
        for (const [profile, bot] of this.bots) {
            setTimeout(async () => {
                try {
                    await bot.log('info', 'Bot started by controller');
                    bot.startContinuousScanning();
                } catch (error) {
                    console.error(`Error starting ${profile} bot:`, error);
                }
            }, delay);
            delay += 10000; // 10 second stagger
        }
        
        // Set up scheduled tasks if enabled
        if (this.config.enableScheduling) {
            this.setupScheduledTasks();
        }
        
        console.log('All bots started successfully');
    }

    async stopAllBots() {
        console.log('Stopping all domain discovery bots...');
        
        for (const [profile, bot] of this.bots) {
            try {
                bot.stopContinuousScanning();
                await bot.log('info', 'Bot stopped by controller');
            } catch (error) {
                console.error(`Error stopping ${profile} bot:`, error);
            }
        }
        
        if (this.scheduledJob) {
            this.scheduledJob.stop();
            this.scheduledJob = null;
        }
        
        this.isRunning = false;
        console.log('All bots stopped');
    }

    setupScheduledTasks() {
        console.log(`Setting up scheduled tasks with pattern: ${this.config.schedulePattern}`);
        
        this.scheduledJob = cron.schedule(this.config.schedulePattern, async () => {
            console.log('Running scheduled domain discovery scan...');
            await this.runSingleScanCycle();
        });
        
        // Also schedule daily exports
        cron.schedule('0 2 * * *', async () => { // 2 AM daily
            console.log('Running scheduled daily export...');
            await this.exportAllData();
        });
    }

    async runSingleScanCycle() {
        console.log('Running single scan cycle for all bots...');
        
        const botEntries = Array.from(this.bots.entries());
        const chunkedBots = this.chunkArray(botEntries, this.config.maxConcurrentBots);
        
        for (const chunk of chunkedBots) {
            const scanPromises = chunk.map(([profile, bot]) => {
                return bot.scan().catch(error => {
                    console.error(`Error in ${profile} bot scan:`, error);
                });
            });
            
            await Promise.all(scanPromises);
            
            // Wait between chunks to avoid overwhelming servers
            if (chunk !== chunkedBots[chunkedBots.length - 1]) {
                await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay
            }
        }
        
        console.log('Single scan cycle completed');
    }

    async exportAllData() {
        console.log('Exporting data from all bots...');
        const exportedFiles = [];
        
        for (const [profile, bot] of this.bots) {
            try {
                const csvFile = await bot.exportToCSV();
                exportedFiles.push(csvFile);
                console.log(`Exported data for ${profile} bot to ${csvFile}`);
            } catch (error) {
                console.error(`Error exporting data for ${profile} bot:`, error);
            }
        }
        
        // Create consolidated export
        await this.createConsolidatedExport(exportedFiles);
        
        return exportedFiles;
    }

    async createConsolidatedExport(csvFiles) {
        try {
            const csvWriter = require('csv-writer').createObjectCsvWriter;
            const consolidatedFile = path.join(this.config.dataDir, 'all-domains-consolidated.csv');
            
            const writer = csvWriter({
                path: consolidatedFile,
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

            const allData = [];
            
            for (const [profile, bot] of this.bots) {
                const dataFile = path.join(this.config.dataDir, `${profile}-domains.json`);
                try {
                    const data = await fs.readFile(dataFile, 'utf8');
                    const domains = JSON.parse(data);
                    
                    const csvData = domains.map(domain => ({
                        domain: domain.domain,
                        bot: domain.bot,
                        task: profile,
                        status: domain.available ? 'Available' : 'Unavailable',
                        authCode: domain.authCode || 'N/A',
                        legitimate: domain.legitimate ? 'Yes' : 'No',
                        discoveredAt: domain.discoveredAt,
                        notes: domain.notes || `${profile} profile domain`
                    }));
                    
                    allData.push(...csvData);
                } catch (error) {
                    console.warn(`Could not read data for ${profile} bot:`, error.message);
                }
            }
            
            await writer.writeRecords(allData);
            console.log(`Created consolidated export with ${allData.length} domains: ${consolidatedFile}`);
            
            return consolidatedFile;
        } catch (error) {
            console.error('Error creating consolidated export:', error);
            throw error;
        }
    }

    async getStatus() {
        const status = {
            isRunning: this.isRunning,
            botCount: this.bots.size,
            bots: {}
        };
        
        for (const [profile, bot] of this.bots) {
            status.bots[profile] = {
                discoveredDomains: bot.getDiscoveredDomainsCount(),
                isScanning: bot.isRunning
            };
        }
        
        return status;
    }

    getBotByProfile(profile) {
        return this.bots.get(profile);
    }

    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    async gracefulShutdown() {
        console.log('Initiating graceful shutdown...');
        
        await this.stopAllBots();
        await this.exportAllData();
        
        console.log('Graceful shutdown completed');
    }
}

module.exports = DomainBotController;