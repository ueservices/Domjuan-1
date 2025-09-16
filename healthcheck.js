#!/usr/bin/env node

/**
 * Health check script for the portfolio website
 * Follows best practices for monitoring and alerting
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const TIMEOUT = 5000; // 5 seconds timeout

function checkHealth() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: PORT,
            path: '/health',
            method: 'GET',
            timeout: TIMEOUT
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (res.statusCode === 200 && response.status === 'OK') {
                        resolve({
                            status: 'healthy',
                            statusCode: res.statusCode,
                            response: response,
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        reject(new Error(`Unhealthy response: ${res.statusCode} - ${data}`));
                    }
                } catch (error) {
                    reject(new Error(`Invalid JSON response: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Health check failed: ${error.message}`));
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error(`Health check timed out after ${TIMEOUT}ms`));
        });

        req.end();
    });
}

// Main execution
async function main() {
    try {
        console.log(`Checking health of service at ${HOST}:${PORT}`);
        const result = await checkHealth();
        console.log('✅ Service is healthy');
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('❌ Service is unhealthy');
        console.error(error.message);
        process.exit(1);
    }
}

// Only run if this script is called directly
if (require.main === module) {
    main();
}

module.exports = { checkHealth };