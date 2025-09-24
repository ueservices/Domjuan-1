/**
 * Basic server integration tests
 * Part of the autonomous workflow validation
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function runServerTests() {
  console.log('🧪 Running server integration tests...');
  
  let testsPassed = 0;
  let testsTotal = 0;
  let serverProcess = null;

  try {
    // Start server
    console.log('🚀 Starting server for testing...');
    serverProcess = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PORT: '3001' }
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const baseUrl = 'http://localhost:3001';

    // Test 1: Server responds to health check
    testsTotal++;
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/',
        method: 'GET'
      });
      assert(response.statusCode === 200, 'Server should respond with 200');
      console.log('✅ Test 1 passed: Server health check');
      testsPassed++;
    } catch (error) {
      console.log('❌ Test 1 failed:', error.message);
    }

    // Test 2: API endpoints respond
    testsTotal++;
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/bots/stats',
        method: 'GET'
      });
      assert(response.statusCode === 200, 'API should respond with 200');
      const stats = JSON.parse(response.data);
      assert(typeof stats === 'object', 'Stats should be an object');
      console.log('✅ Test 2 passed: API endpoints');
      testsPassed++;
    } catch (error) {
      console.log('❌ Test 2 failed:', error.message);
    }

    // Test 3: Bot control endpoints
    testsTotal++;
    try {
      const startResponse = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/bots/start',
        method: 'POST'
      });
      assert(startResponse.statusCode === 200, 'Start endpoint should work');
      
      const stopResponse = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/bots/stop',
        method: 'POST'
      });
      assert(stopResponse.statusCode === 200, 'Stop endpoint should work');
      console.log('✅ Test 3 passed: Bot control endpoints');
      testsPassed++;
    } catch (error) {
      console.log('❌ Test 3 failed:', error.message);
    }

    // Test 4: Dashboard accessibility
    testsTotal++;
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/dashboard',
        method: 'GET'
      });
      assert(response.statusCode === 200, 'Dashboard should be accessible');
      console.log('✅ Test 4 passed: Dashboard accessibility');
      testsPassed++;
    } catch (error) {
      console.log('❌ Test 4 failed:', error.message);
    }

  } catch (error) {
    console.error('Test setup error:', error);
  } finally {
    // Cleanup: Kill server process
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n📊 Server Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All server tests passed!');
    process.exit(0);
  } else {
    console.log('💥 Some server tests failed!');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runServerTests().catch(console.error);
}

module.exports = { runServerTests };