/**
 * Basic tests for BotManager functionality
 * Part of the autonomous workflow validation
 */

const BotManager = require('../bots/botManager');

// Simple test framework since no testing library is installed
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runTests() {
  console.log('🧪 Running BotManager tests...');
  
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: BotManager instantiation
  testsTotal++;
  try {
    const botManager = new BotManager();
    assert(botManager !== null, 'BotManager should instantiate');
    assert(typeof botManager.bots === 'object', 'BotManager should have bots object');
    assert(Object.keys(botManager.bots).length === 3, 'Should have 3 bots');
    console.log('✅ Test 1 passed: BotManager instantiation');
    testsPassed++;
  } catch (error) {
    console.log('❌ Test 1 failed:', error.message);
  }

  // Test 2: Bot names and types
  testsTotal++;
  try {
    const botManager = new BotManager();
    const botNames = Object.keys(botManager.bots);
    assert(botNames.includes('domainHunter'), 'Should have domainHunter bot');
    assert(botNames.includes('assetSeeker'), 'Should have assetSeeker bot');
    assert(botNames.includes('recursiveExplorer'), 'Should have recursiveExplorer bot');
    console.log('✅ Test 2 passed: Bot names verification');
    testsPassed++;
  } catch (error) {
    console.log('❌ Test 2 failed:', error.message);
  }

  // Test 3: Bot stats
  testsTotal++;
  try {
    const botManager = new BotManager();
    const stats = botManager.getAllStats();
    assert(typeof stats === 'object', 'Stats should be an object');
    assert(typeof stats.totalDomains === 'number', 'Should have totalDomains');
    assert(typeof stats.successfulAcquisitions === 'number', 'Should have successfulAcquisitions');
    assert(Array.isArray(stats.bots), 'Should have bots array');
    console.log('✅ Test 3 passed: Bot stats structure');
    testsPassed++;
  } catch (error) {
    console.log('❌ Test 3 failed:', error.message);
  }

  // Test 4: Bot start/stop functionality
  testsTotal++;
  try {
    const botManager = new BotManager();
    
    // Initially not running
    assert(botManager.isRunning === false, 'Should not be running initially');
    
    // Start bots
    botManager.startAllBots();
    assert(botManager.isRunning === true, 'Should be running after start');
    
    // Stop bots
    botManager.stopAllBots();
    assert(botManager.isRunning === false, 'Should not be running after stop');
    
    console.log('✅ Test 4 passed: Start/stop functionality');
    testsPassed++;
  } catch (error) {
    console.log('❌ Test 4 failed:', error.message);
  }

  // Test 5: Individual bot status
  testsTotal++;
  try {
    const botManager = new BotManager();
    const status = botManager.getBotStatus('domainHunter');
    assert(status !== null, 'Should get bot status');
    assert(typeof status.name === 'string', 'Status should have name');
    assert(typeof status.isActive === 'boolean', 'Status should have isActive');
    
    const invalidStatus = botManager.getBotStatus('nonexistent');
    assert(invalidStatus === null, 'Should return null for nonexistent bot');
    
    console.log('✅ Test 5 passed: Individual bot status');
    testsPassed++;
  } catch (error) {
    console.log('❌ Test 5 failed:', error.message);
  }

  console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('💥 Some tests failed!');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };