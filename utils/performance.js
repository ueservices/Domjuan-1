/**
 * Performance Monitoring Module
 * Tracks system performance metrics and provides alerts
 */

const EventEmitter = require('events');

class PerformanceMonitor extends EventEmitter {
    constructor() {
        super();
        this.metrics = {
            requests: {
                total: 0,
                errors: 0,
                responseTimes: [],
                maxResponseTime: 0,
                avgResponseTime: 0
            },
            system: {
                startTime: Date.now(),
                lastHealthCheck: Date.now(),
                consecutiveHealthFailures: 0
            },
            alerts: {
                highMemory: false,
                highResponseTime: false,
                highErrorRate: false
            }
        };
        
        this.thresholds = {
            maxResponseTime: parseInt(process.env.MAX_RESPONSE_TIME_MS) || 5000,
            maxMemoryMB: parseInt(process.env.MAX_MEMORY_MB) || 500,
            maxErrorRate: parseFloat(process.env.MAX_ERROR_RATE) || 0.05, // 5%
            healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL_MS) || 60000
        };
        
        this.startMonitoring();
    }

    startMonitoring() {
        // Monitor health checks
        setInterval(() => {
            this.performHealthCheck();
        }, this.thresholds.healthCheckInterval);

        // Clear metrics every hour to prevent memory buildup
        setInterval(() => {
            this.clearOldMetrics();
        }, 3600000); // 1 hour
    }

    recordRequest(responseTime, isError = false) {
        this.metrics.requests.total++;
        
        if (isError) {
            this.metrics.requests.errors++;
        }
        
        this.metrics.requests.responseTimes.push(responseTime);
        
        // Keep only last 1000 response times to prevent memory issues
        if (this.metrics.requests.responseTimes.length > 1000) {
            this.metrics.requests.responseTimes = this.metrics.requests.responseTimes.slice(-1000);
        }
        
        this.metrics.requests.maxResponseTime = Math.max(this.metrics.requests.maxResponseTime, responseTime);
        this.metrics.requests.avgResponseTime = this.calculateAverageResponseTime();
        
        // Check for performance alerts
        this.checkPerformanceAlerts();
    }

    calculateAverageResponseTime() {
        if (this.metrics.requests.responseTimes.length === 0) return 0;
        
        const sum = this.metrics.requests.responseTimes.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.metrics.requests.responseTimes.length);
    }

    async performHealthCheck() {
        const memUsage = process.memoryUsage();
        const memoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        
        this.metrics.system.lastHealthCheck = Date.now();
        
        // Check memory usage
        if (memoryMB > this.thresholds.maxMemoryMB) {
            this.handleAlert('highMemory', {
                currentMemory: memoryMB,
                threshold: this.thresholds.maxMemoryMB,
                message: `High memory usage: ${memoryMB}MB (threshold: ${this.thresholds.maxMemoryMB}MB)`
            });
        } else {
            this.clearAlert('highMemory');
        }
        
        // Check response times
        if (this.metrics.requests.avgResponseTime > this.thresholds.maxResponseTime) {
            this.handleAlert('highResponseTime', {
                currentAvgResponseTime: this.metrics.requests.avgResponseTime,
                threshold: this.thresholds.maxResponseTime,
                message: `High response time: ${this.metrics.requests.avgResponseTime}ms (threshold: ${this.thresholds.maxResponseTime}ms)`
            });
        } else {
            this.clearAlert('highResponseTime');
        }
        
        // Check error rate
        const errorRate = this.metrics.requests.total > 0 ? 
            this.metrics.requests.errors / this.metrics.requests.total : 0;
            
        if (errorRate > this.thresholds.maxErrorRate) {
            this.handleAlert('highErrorRate', {
                currentErrorRate: Math.round(errorRate * 100),
                threshold: Math.round(this.thresholds.maxErrorRate * 100),
                message: `High error rate: ${Math.round(errorRate * 100)}% (threshold: ${Math.round(this.thresholds.maxErrorRate * 100)}%)`
            });
        } else {
            this.clearAlert('highErrorRate');
        }
    }

    handleAlert(alertType, data) {
        if (!this.metrics.alerts[alertType]) {
            this.metrics.alerts[alertType] = true;
            console.warn(`⚠️  Performance Alert: ${data.message}`);
            this.emit('alert', { type: alertType, data });
        }
    }

    clearAlert(alertType) {
        if (this.metrics.alerts[alertType]) {
            this.metrics.alerts[alertType] = false;
            console.log(`✅ Performance Alert Cleared: ${alertType}`);
            this.emit('alertCleared', { type: alertType });
        }
    }

    checkPerformanceAlerts() {
        // This method is called after each request to check for immediate issues
        const lastResponseTime = this.metrics.requests.responseTimes[this.metrics.requests.responseTimes.length - 1];
        
        if (lastResponseTime > this.thresholds.maxResponseTime * 2) {
            console.warn(`🐌 Slow request detected: ${lastResponseTime}ms`);
            this.emit('slowRequest', { responseTime: lastResponseTime });
        }
    }

    clearOldMetrics() {
        // Reset hourly counters but keep some historical data
        console.log('Clearing old performance metrics...');
        
        this.metrics.requests.responseTimes = this.metrics.requests.responseTimes.slice(-100); // Keep last 100
        this.metrics.requests.maxResponseTime = Math.max(...this.metrics.requests.responseTimes, 0);
        this.metrics.requests.avgResponseTime = this.calculateAverageResponseTime();
        
        // Don't reset total counts - those are useful for overall statistics
    }

    getMetrics() {
        const uptime = Date.now() - this.metrics.system.startTime;
        const memUsage = process.memoryUsage();
        
        return {
            timestamp: new Date().toISOString(),
            uptime: Math.floor(uptime / 1000), // in seconds
            requests: {
                ...this.metrics.requests,
                errorRate: this.metrics.requests.total > 0 ? 
                    Math.round((this.metrics.requests.errors / this.metrics.requests.total) * 100) : 0,
                requestsPerMinute: this.calculateRequestsPerMinute()
            },
            memory: {
                used: Math.round(memUsage.heapUsed / 1024 / 1024),
                total: Math.round(memUsage.heapTotal / 1024 / 1024),
                external: Math.round(memUsage.external / 1024 / 1024),
                threshold: this.thresholds.maxMemoryMB
            },
            alerts: { ...this.metrics.alerts },
            thresholds: { ...this.thresholds }
        };
    }

    calculateRequestsPerMinute() {
        // Simple approximation based on total requests and uptime
        const uptimeMinutes = (Date.now() - this.metrics.system.startTime) / 60000;
        return uptimeMinutes > 0 ? Math.round(this.metrics.requests.total / uptimeMinutes) : 0;
    }

    // Middleware function for Express
    middleware() {
        return (req, res, next) => {
            const startTime = Date.now();
            
            res.on('finish', () => {
                const responseTime = Date.now() - startTime;
                const isError = res.statusCode >= 400;
                this.recordRequest(responseTime, isError);
            });
            
            next();
        };
    }

    // Get performance summary for health checks
    getHealthSummary() {
        const metrics = this.getMetrics();
        const hasAlerts = Object.values(metrics.alerts).some(alert => alert);
        
        return {
            status: hasAlerts ? 'degraded' : 'healthy',
            alerts: hasAlerts ? Object.keys(metrics.alerts).filter(key => metrics.alerts[key]) : [],
            metrics: {
                avgResponseTime: metrics.requests.avgResponseTime,
                errorRate: metrics.requests.errorRate,
                memoryUsage: metrics.memory.used,
                uptime: metrics.uptime,
                requestsPerMinute: metrics.requests.requestsPerMinute
            }
        };
    }
}

module.exports = PerformanceMonitor;