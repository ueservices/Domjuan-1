#!/usr/bin/env node

/**
 * Domain Bot Runner
 * Main entry point for running domain discovery bots
 */

const DomainBotController = require('./DomainBotController');
const config = require('./config/bot-config');
const path = require('path');

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'start';

class BotRunner {
    constructor() {
        this.controller = new DomainBotController(config);
        this.setupSignalHandlers();
    }

    setupSignalHandlers() {
        // Graceful shutdown on SIGINT (Ctrl+C)
        process.on('SIGINT', async () => {
            console.log('\n🛑 Received SIGINT, shutting down gracefully...');
            await this.controller.gracefulShutdown();
            process.exit(0);
        });

        // Graceful shutdown on SIGTERM
        process.on('SIGTERM', async () => {
            console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
            await this.controller.gracefulShutdown();
            process.exit(0);
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            process.exit(1);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });
    }

    async start() {
        try {
            console.log('🚀 Starting Domain Discovery Bots...');
            console.log(`📊 Configuration:`);
            console.log(`   - Scan Interval: ${config.scanInterval}ms`);
            console.log(`   - Max Domains per Scan: ${config.maxDomainsPerScan}`);
            console.log(`   - Max Concurrent Bots: ${config.maxConcurrentBots}`);
            console.log(`   - Data Directory: ${config.dataDir}`);
            console.log(`   - Log Directory: ${config.logDir}`);
            console.log(`   - Scheduling Enabled: ${config.enableScheduling}`);
            
            await this.controller.startAllBots();
            
            console.log('✅ All bots started successfully!');
            console.log('📝 Check the logs directory for detailed bot activity');
            console.log('📊 Data will be saved to the data directory');
            console.log('🔄 Bots will run continuously. Press Ctrl+C to stop.');
            
            // Keep the process running
            this.keepAlive();
            
        } catch (error) {
            console.error('❌ Error starting bots:', error);
            process.exit(1);
        }
    }

    async stop() {
        try {
            console.log('🛑 Stopping all bots...');
            await this.controller.stopAllBots();
            console.log('✅ All bots stopped successfully');
        } catch (error) {
            console.error('❌ Error stopping bots:', error);
            process.exit(1);
        }
    }

    async status() {
        try {
            console.log('📊 Bot Status:');
            const status = await this.controller.getStatus();
            
            console.log(`   - Controller Running: ${status.isRunning}`);
            console.log(`   - Total Bots: ${status.botCount}`);
            console.log('   - Individual Bot Status:');
            
            for (const [profile, botStatus] of Object.entries(status.bots)) {
                console.log(`     • ${profile}: ${botStatus.isScanning ? '🟢 Running' : '🔴 Stopped'} (${botStatus.discoveredDomains} domains discovered)`);
            }
            
        } catch (error) {
            console.error('❌ Error getting status:', error);
            process.exit(1);
        }
    }

    async scan() {
        try {
            console.log('🔍 Running single scan cycle...');
            await this.controller.runSingleScanCycle();
            console.log('✅ Single scan cycle completed');
        } catch (error) {
            console.error('❌ Error running scan:', error);
            process.exit(1);
        }
    }

    async export() {
        try {
            console.log('📋 Exporting all bot data...');
            const files = await this.controller.exportAllData();
            console.log('✅ Data exported successfully:');
            files.forEach(file => console.log(`   - ${file}`));
        } catch (error) {
            console.error('❌ Error exporting data:', error);
            process.exit(1);
        }
    }

    keepAlive() {
        // Keep the process running
        setInterval(() => {
            // Do nothing, just keep alive
        }, 10000);
    }

    showHelp() {
        console.log(`
🤖 Domain Discovery Bot Runner

Usage: node run-bots.js [command]

Commands:
  start     Start all domain discovery bots (default)
  stop      Stop all running bots
  status    Show current bot status
  scan      Run a single scan cycle
  export    Export all discovered domain data
  help      Show this help message

Examples:
  node run-bots.js start
  node run-bots.js status
  node run-bots.js export

Environment Variables:
  See bot-config.example.env for configuration options

Files:
  - Data saved to: ${config.dataDir}/
  - Logs saved to: ${config.logDir}/
  - Configuration: ./config/bot-config.js
        `);
    }
}

// Main execution
async function main() {
    const runner = new BotRunner();
    
    switch (command) {
        case 'start':
            await runner.start();
            break;
        case 'stop':
            await runner.stop();
            break;
        case 'status':
            await runner.status();
            break;
        case 'scan':
            await runner.scan();
            break;
        case 'export':
            await runner.export();
            break;
        case 'help':
        case '--help':
        case '-h':
            runner.showHelp();
            break;
        default:
            console.log(`❌ Unknown command: ${command}`);
            runner.showHelp();
            process.exit(1);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = BotRunner;