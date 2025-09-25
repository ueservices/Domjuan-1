/**
 * Basic test suite for Domjuan Bot System
 * Tests core functionality without external dependencies
 */

const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = [];
        this.serverProcess = null;
        this.baseUrl = 'http://localhost:3001'; // Use different port for testing
    }

    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async runAll() {
        console.log('🧪 Starting Domjuan Bot System Test Suite\n');

        try {
            await this.startTestServer();
            
            for (const test of this.tests) {
                try {
                    console.log(`Running: ${test.name}`);
                    await test.testFn();
                    this.results.push({ name: test.name, status: 'PASS' });
                    console.log(`✅ PASS: ${test.name}\n`);
                } catch (error) {
                    this.results.push({ name: test.name, status: 'FAIL', error: error.message });
                    console.log(`❌ FAIL: ${test.name} - ${error.message}\n`);
                }
            }
        } finally {
            await this.stopTestServer();
        }

        this.printSummary();
        
        const failedTests = this.results.filter(r => r.status === 'FAIL');
        if (failedTests.length > 0) {
            process.exit(1);
        }
    }

    async startTestServer() {
        console.log('Starting test server...');
        
        // Create test environment
        const testDirs = ['./data', './logs', './backups'];
        testDirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        return new Promise((resolve, reject) => {
            this.serverProcess = spawn('node', ['server.js'], {
                env: { ...process.env, PORT: '3001', NODE_ENV: 'test' },
                stdio: 'pipe'
            });

            this.serverProcess.on('error', reject);

            // Wait for server to start
            setTimeout(() => {
                this.makeRequest('/health', 'GET')
                    .then(() => resolve())
                    .catch(reject);
            }, 3000);
        });
    }

    async stopTestServer() {
        if (this.serverProcess) {
            console.log('Stopping test server...');
            this.serverProcess.kill('SIGTERM');
            
            // Give it time to shut down gracefully
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (!this.serverProcess.killed) {
                this.serverProcess.kill('SIGKILL');
            }
        }
    }

    async makeRequest(path, method = 'GET', data = null) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.baseUrl);
            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const req = http.request(options, (res) => {
                let responseData = '';
                
                res.on('data', chunk => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const parsedData = responseData ? JSON.parse(responseData) : {};
                        resolve({ status: res.statusCode, data: parsedData, raw: responseData });
                    } catch (e) {
                        resolve({ status: res.statusCode, data: null, raw: responseData });
                    }
                });
            });

            req.on('error', reject);
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (data) {
                req.write(JSON.stringify(data));
            }
            
            req.end();
        });
    }

    printSummary() {
        console.log('\n📊 Test Summary:');
        console.log('================');
        
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        
        console.log(`Total Tests: ${this.results.length}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        
        if (failed > 0) {
            console.log('\nFailed Tests:');
            this.results.filter(r => r.status === 'FAIL').forEach(result => {
                console.log(`- ${result.name}: ${result.error}`);
            });
        }
        
        console.log(`\nSuccess Rate: ${Math.round((passed / this.results.length) * 100)}%`);
    }
}

// Create test runner
const runner = new TestRunner();

// Health Check Tests
runner.addTest('Health endpoint returns 200', async () => {
    const response = await runner.makeRequest('/health');
    if (response.status !== 200 && response.status !== 503) {
        throw new Error(`Expected 200 or 503, got ${response.status}`);
    }
    if (!response.data.status) {
        throw new Error('Health response missing status field');
    }
});

runner.addTest('Health endpoint includes required fields', async () => {
    const response = await runner.makeRequest('/health');
    const required = ['status', 'timestamp', 'uptime', 'bots', 'memory'];
    
    for (const field of required) {
        if (!(field in response.data)) {
            throw new Error(`Health response missing required field: ${field}`);
        }
    }
});

// Bot Control Tests
runner.addTest('Start bots endpoint works', async () => {
    const response = await runner.makeRequest('/api/start-bots', 'POST');
    if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
    }
    if (!response.data.success) {
        throw new Error('Start bots failed');
    }
});

runner.addTest('Stop bots endpoint works', async () => {
    const response = await runner.makeRequest('/api/stop-bots', 'POST');
    if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
    }
    if (!response.data.success) {
        throw new Error('Stop bots failed');
    }
});

runner.addTest('Domain validation accepts valid domains', async () => {
    const response = await runner.makeRequest('/api/validate-domain', 'POST', { domain: 'example.com' });
    if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
    }
    if (!response.data.valid) {
        throw new Error('Valid domain was rejected');
    }
});

runner.addTest('Domain validation rejects invalid domains', async () => {
    const response = await runner.makeRequest('/api/validate-domain', 'POST', { domain: 'invalid_domain' });
    if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
    }
    if (response.data.valid) {
        throw new Error('Invalid domain was accepted');
    }
});

// Run all tests
if (require.main === module) {
    runner.runAll().catch(error => {
        console.error('Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = TestRunner;