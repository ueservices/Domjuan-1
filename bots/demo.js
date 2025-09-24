#!/usr/bin/env node

/**
 * Domain Bot Demo
 * Demonstrates the bot system functionality without requiring external WHOIS access
 */

const NestedBot = require('./lib/NestedBot');
const HiddenBot = require('./lib/HiddenBot');
const UnexploredBot = require('./lib/UnexploredBot');
const UnseenBot = require('./lib/UnseenBot');
const UnfoundBot = require('./lib/UnfoundBot');
const path = require('path');

async function demonstrateBot(BotClass, profileName) {
    console.log(`\n🤖 ${profileName.toUpperCase()} BOT DEMONSTRATION`);
    console.log('='.repeat(50));
    
    const config = {
        dataDir: path.join(__dirname, 'demo-data'),
        logDir: path.join(__dirname, 'demo-logs'),
        maxDomainsPerScan: 10
    };
    
    const bot = new BotClass(config);
    
    console.log(`📊 Bot Profile: ${bot.profile}`);
    console.log(`⚙️  Max Domains Per Scan: ${config.maxDomainsPerScan}`);
    
    // Generate and display domain candidates
    const candidates = await bot.generateDomainCandidates();
    
    console.log(`🎯 Generated ${candidates.length} total domain candidates`);
    console.log('📋 Sample domain candidates:');
    
    const sampleCandidates = candidates.slice(0, 15);
    sampleCandidates.forEach((domain, index) => {
        console.log(`   ${(index + 1).toString().padStart(2)}: ${domain}`);
    });
    
    if (candidates.length > 15) {
        console.log(`   ... and ${candidates.length - 15} more domains`);
    }
    
    // Demonstrate domain validation logic (without WHOIS)
    console.log('\n🔍 Domain Validation Demo:');
    for (let i = 0; i < Math.min(3, sampleCandidates.length); i++) {
        const domain = sampleCandidates[i];
        
        // Mock domain info for demonstration
        const mockDomainInfo = {
            domain: domain,
            available: Math.random() > 0.7, // Random availability for demo
            whoisData: 'Demo data - WHOIS not accessible in sandbox',
            checkedAt: new Date().toISOString()
        };
        
        const validatedInfo = await bot.validateDomainLegitimacy(mockDomainInfo);
        
        console.log(`   ${domain}`);
        console.log(`     ✅ Available: ${validatedInfo.available ? 'Yes' : 'No'}`);
        console.log(`     🔒 Legitimate: ${validatedInfo.legitimate ? 'Yes' : 'No'}`);
        console.log(`     📅 Checked: ${validatedInfo.checkedAt}`);
    }
    
    return {
        profile: bot.profile,
        totalCandidates: candidates.length,
        sampleDomains: sampleCandidates
    };
}

async function main() {
    console.log('🚀 DOMAIN DISCOVERY BOT SYSTEM DEMONSTRATION');
    console.log('='.repeat(60));
    console.log('This demo shows the bot system functionality without requiring');
    console.log('external WHOIS server access (which may be blocked in sandbox).');
    console.log('');
    
    const results = [];
    
    // Demonstrate each bot
    const bots = [
        [NestedBot, 'Nested'],
        [HiddenBot, 'Hidden'],
        [UnexploredBot, 'Unexplored'],
        [UnseenBot, 'Unseen'],
        [UnfoundBot, 'Unfound']
    ];
    
    for (const [BotClass, name] of bots) {
        const result = await demonstrateBot(BotClass, name);
        results.push(result);
        
        // Add delay between demonstrations
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Summary
    console.log('\n📊 DEMONSTRATION SUMMARY');
    console.log('='.repeat(50));
    
    let totalDomains = 0;
    results.forEach(result => {
        console.log(`${result.profile.padEnd(12)}: ${result.totalCandidates.toString().padStart(3)} domains generated`);
        totalDomains += result.totalCandidates;
    });
    
    console.log('─'.repeat(25));
    console.log(`${'Total'.padEnd(12)}: ${totalDomains.toString().padStart(3)} domains across all bots`);
    
    console.log('\n🎯 KEY FEATURES DEMONSTRATED:');
    console.log('   ✅ 5 specialized bot profiles with unique strategies');
    console.log('   ✅ Automated domain candidate generation');
    console.log('   ✅ Domain validation and legitimacy checking');
    console.log('   ✅ Structured logging and error handling');
    console.log('   ✅ Configurable scan parameters');
    console.log('   ✅ Extensible architecture for new bot profiles');
    
    console.log('\n🚀 TO RUN THE FULL SYSTEM:');
    console.log('   npm run bots:start    # Start all bots');
    console.log('   npm run bots:status   # Check status');
    console.log('   npm run bots:scan     # Run single scan');
    console.log('   npm run bots:export   # Export discovered domains');
    
    console.log('\n📖 For detailed documentation, see: DOMAIN_BOT_README.md');
    
    console.log('\n✅ Demonstration completed successfully!');
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Demo error:', error);
        process.exit(1);
    });
}

module.exports = { demonstrateBot };