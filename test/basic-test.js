#!/usr/bin/env node

/**
 * Basic Tests for Portfolio Website
 * 
 * Simple test suite to validate core functionality
 * without requiring external test frameworks.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Test configuration
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Test results
let tests = [];
let passed = 0;
let failed = 0;

/**
 * Simple test runner
 */
function test(name, fn) {
    tests.push({ name, fn });
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

function assertExists(value, message) {
    if (value == null || value === undefined) {
        throw new Error(message || 'Value should exist');
    }
}

/**
 * Run all tests
 */
async function runTests() {
    console.log('🧪 Running Basic Tests for Portfolio Website\n');
    
    for (const { name, fn } of tests) {
        try {
            console.log(`⏳ ${name}...`);
            await fn();
            console.log(`✅ ${name} - PASSED\n`);
            passed++;
        } catch (error) {
            console.log(`❌ ${name} - FAILED`);
            console.log(`   Error: ${error.message}\n`);
            failed++;
        }
    }
    
    // Summary
    const total = passed + failed;
    console.log('📊 Test Results:');
    console.log(`   Total: ${total}`);
    console.log(`   Passed: ${passed} (${Math.round(passed/total*100)}%)`);
    console.log(`   Failed: ${failed} (${Math.round(failed/total*100)}%)`);
    
    if (failed > 0) {
        console.log('\n❌ Some tests failed!');
        process.exit(1);
    } else {
        console.log('\n✅ All tests passed!');
        process.exit(0);
    }
}

/**
 * Test Cases
 */

// File existence tests
test('Required files exist', async () => {
    const requiredFiles = [
        'server.js',
        'index.html', 
        'script.js',
        'styles.css',
        'package.json',
        '.env.example',
        'README.md',
        'SECURITY.md',
        'BEST_PRACTICES.md',
        'DEVELOPMENT.md'
    ];
    
    for (const file of requiredFiles) {
        const filePath = path.join(__dirname, '..', file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Required file missing: ${file}`);
        }
    }
});

// Package.json validation
test('package.json is valid', async () => {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    assertExists(packageJson.name, 'Package name should exist');
    assertExists(packageJson.version, 'Package version should exist');
    assertExists(packageJson.main, 'Package main file should be specified');
    assertExists(packageJson.scripts, 'Package scripts should exist');
    assertExists(packageJson.scripts.start, 'Start script should exist');
    assertExists(packageJson.dependencies, 'Dependencies should exist');
    
    // Check required dependencies
    const requiredDeps = ['express', 'stripe', 'cors', 'helmet', 'dotenv'];
    for (const dep of requiredDeps) {
        assertExists(packageJson.dependencies[dep], `Required dependency missing: ${dep}`);
    }
});

// Environment template validation
test('.env.example is properly configured', async () => {
    const envPath = path.join(__dirname, '..', '.env.example');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check for required environment variables
    const requiredVars = [
        'STRIPE_SECRET_KEY',
        'STRIPE_PUBLISHABLE_KEY', 
        'PORT',
        'NODE_ENV'
    ];
    
    for (const varName of requiredVars) {
        if (!envContent.includes(varName)) {
            throw new Error(`Required environment variable missing from .env.example: ${varName}`);
        }
    }
});

// JavaScript syntax validation
test('JavaScript files have valid syntax', async () => {
    const jsFiles = ['server.js', 'script.js'];
    
    for (const file of jsFiles) {
        const filePath = path.join(__dirname, '..', file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        try {
            // Basic syntax check - try to parse as module
            new Function(content);
        } catch (error) {
            throw new Error(`Syntax error in ${file}: ${error.message}`);
        }
    }
});

// Server configuration validation
test('Server configuration is valid', async () => {
    const serverPath = path.join(__dirname, '..', 'server.js');
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Check for required configurations
    const requiredConfigs = [
        'express',
        'stripe',
        'helmet',
        'cors',
        'SERVICES',
        'app.listen'
    ];
    
    for (const config of requiredConfigs) {
        if (!serverContent.includes(config)) {
            throw new Error(`Required server configuration missing: ${config}`);
        }
    }
    
    // Security checks
    if (serverContent.includes('sk_live_')) {
        throw new Error('Live Stripe keys should not be hardcoded in server.js');
    }
    
    if (serverContent.includes('pk_live_')) {
        throw new Error('Live Stripe publishable keys should not be hardcoded in server.js');
    }
});

// HTML structure validation
test('HTML structure is valid', async () => {
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Check for required elements
    const requiredElements = [
        '<html',
        '<head>',
        '<body>',
        '<header>',
        '<main>',
        '<footer>',
        'script.js',
        'styles.css'
    ];
    
    for (const element of requiredElements) {
        if (!htmlContent.includes(element)) {
            throw new Error(`Required HTML element missing: ${element}`);
        }
    }
    
    // Check for Stripe integration
    if (!htmlContent.includes('stripe.com')) {
        throw new Error('Stripe integration script should be included');
    }
});

// Security headers validation  
test('Security configuration exists', async () => {
    const serverPath = path.join(__dirname, '..', 'server.js');
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Check for security middleware
    const securityFeatures = [
        'helmet',
        'cors',
        'contentSecurityPolicy',
        'express.json'
    ];
    
    for (const feature of securityFeatures) {
        if (!serverContent.includes(feature)) {
            throw new Error(`Security feature missing: ${feature}`);
        }
    }
});

// Documentation validation
test('Documentation files are comprehensive', async () => {
    const docs = [
        { file: 'README.md', required: ['Installation', 'Copilot', 'Stripe'] },
        { file: 'SECURITY.md', required: ['Environment', 'Stripe', 'Production'] },
        { file: 'BEST_PRACTICES.md', required: ['Python', 'Security', 'GitHub'] },
        { file: 'DEVELOPMENT.md', required: ['Prerequisites', 'Setup', 'Testing'] }
    ];
    
    for (const { file, required } of docs) {
        const docPath = path.join(__dirname, '..', file);
        const content = fs.readFileSync(docPath, 'utf8');
        
        for (const term of required) {
            if (!content.includes(term)) {
                throw new Error(`Required documentation section missing in ${file}: ${term}`);
            }
        }
    }
});

// Run the tests
runTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
});