/**
 * Dashboard JavaScript - Real-time Bot Management Interface
 */

class DashboardManager {
    constructor() {
        this.socket = io();
        this.logEntries = [];
        this.filters = {
            bot: 'all',
            event: 'all',
            asset: 'all'
        };
        this.stats = {
            totalDomains: 0,
            successfulAcquisitions: 0,
            failedAttempts: 0,
            uptime: 0
        };
        this.botStats = {
            'Domain Hunter': { discovered: 0, acquired: 0 },
            'Asset Seeker': { discovered: 0, acquired: 0 },
            'Recursive Explorer': { discovered: 0, acquired: 0 }
        };
        
        this.initializeSocket();
        this.initializeUI();
        this.startUptimeTimer();
    }

    initializeSocket() {
        // Socket event listeners
        this.socket.on('connect', () => {
            this.addLogEntry('system', 'Connected to bot server');
        });

        this.socket.on('stats', (data) => {
            this.updateStats(data);
        });

        this.socket.on('discovery', (data) => {
            this.handleDiscovery(data);
        });

        this.socket.on('acquisition', (data) => {
            this.handleAcquisition(data);
        });

        this.socket.on('status', (data) => {
            this.handleStatus(data);
        });

        this.socket.on('allBotsStarted', (data) => {
            this.handleAllBotsStarted(data);
        });

        this.socket.on('allBotsStopped', (data) => {
            this.handleAllBotsStopped(data);
        });

        this.socket.on('disconnect', () => {
            this.addLogEntry('system', 'Disconnected from bot server', 'error');
        });
    }

    initializeUI() {
        // Button event listeners
        document.getElementById('startBots').addEventListener('click', () => {
            this.socket.emit('startBots');
        });

        document.getElementById('stopBots').addEventListener('click', () => {
            this.socket.emit('stopBots');
        });

        document.getElementById('exportJson').addEventListener('click', () => {
            this.exportData('json');
        });

        document.getElementById('exportCsv').addEventListener('click', () => {
            this.exportData('csv');
        });

        document.getElementById('clearLog').addEventListener('click', () => {
            this.clearLog();
        });

        // Filter event listeners
        document.getElementById('botFilter').addEventListener('change', (e) => {
            this.filters.bot = e.target.value;
            this.applyFilters();
        });

        document.getElementById('eventFilter').addEventListener('change', (e) => {
            this.filters.event = e.target.value;
            this.applyFilters();
        });

        document.getElementById('assetFilter').addEventListener('change', (e) => {
            this.filters.asset = e.target.value;
            this.applyFilters();
        });
    }

    updateCustomCharts() {
        // Update discovery timeline bars
        const totalDiscovered = Object.values(this.botStats).reduce((sum, bot) => sum + bot.discovered, 0);
        
        if (totalDiscovered > 0) {
            const hunterPercent = (this.botStats['Domain Hunter'].discovered / totalDiscovered) * 100;
            const seekerPercent = (this.botStats['Asset Seeker'].discovered / totalDiscovered) * 100;
            const explorerPercent = (this.botStats['Recursive Explorer'].discovered / totalDiscovered) * 100;
            
            document.getElementById('hunterBar').style.width = `${hunterPercent}%`;
            document.getElementById('seekerBar').style.width = `${seekerPercent}%`;
            document.getElementById('explorerBar').style.width = `${explorerPercent}%`;
        }
        
        // Update discovery counts
        document.getElementById('hunterCount').textContent = this.botStats['Domain Hunter'].discovered;
        document.getElementById('seekerCount').textContent = this.botStats['Asset Seeker'].discovered;
        document.getElementById('explorerCount').textContent = this.botStats['Recursive Explorer'].discovered;
        
        // Update success rates
        Object.keys(this.botStats).forEach(botName => {
            const bot = this.botStats[botName];
            const successRate = bot.discovered > 0 ? Math.round((bot.acquired / bot.discovered) * 100) : 0;
            
            if (botName === 'Domain Hunter') {
                document.getElementById('hunterSuccess').textContent = `${successRate}%`;
            } else if (botName === 'Asset Seeker') {
                document.getElementById('seekerSuccess').textContent = `${successRate}%`;
            } else if (botName === 'Recursive Explorer') {
                document.getElementById('explorerSuccess').textContent = `${successRate}%`;
            }
        });
    }

    handleDiscovery(data) {
        this.addLogEntry('discovery', `${data.bot} discovered ${data.domain} (${data.type})`, 'success');
        this.updateBotCard(data.bot, data);
        
        // Update bot stats for charts
        if (this.botStats[data.bot]) {
            this.botStats[data.bot].discovered++;
        }
        
        this.updateCustomCharts();
        this.stats.totalDomains = data.totalDomains || this.stats.totalDomains + 1;
        this.updateStatsDisplay();
    }

    handleAcquisition(data) {
        const status = data.success ? 'successfully acquired' : 'failed to acquire';
        const logClass = data.success ? 'success' : 'error';
        this.addLogEntry('acquisition', `${data.bot} ${status} ${data.domain}`, logClass);
        
        // Update bot stats for charts
        if (data.success && this.botStats[data.bot]) {
            this.botStats[data.bot].acquired++;
        }
        
        if (data.stats) {
            this.stats.successfulAcquisitions = data.stats.successfulAcquisitions;
            this.stats.failedAttempts = data.stats.failedAttempts;
            this.updateStatsDisplay();
        }
        
        this.updateCustomCharts();
    }

    handleStatus(data) {
        this.addLogEntry('status', `${data.bot}: ${data.message}`);
        this.updateBotStatus(data.bot, data.status, data.message);
        
        if (data.uptime) {
            this.stats.uptime = data.uptime;
        }
    }

    handleAllBotsStarted(data) {
        this.addLogEntry('system', 'All bots started successfully', 'success');
        this.updateAllBotStatus('active');
    }

    handleAllBotsStopped(data) {
        this.addLogEntry('system', 'All bots stopped', 'error');
        this.updateAllBotStatus('inactive');
    }

    updateStats(data) {
        this.stats = {
            totalDomains: data.totalDomains || 0,
            successfulAcquisitions: data.successfulAcquisitions || 0,
            failedAttempts: data.failedAttempts || 0,
            uptime: data.uptime || 0
        };
        
        if (data.bots) {
            data.bots.forEach(bot => {
                this.updateBotCardFromStats(bot);
            });
        }
        
        this.updateStatsDisplay();
        this.updateCustomCharts();
    }

    updateStatsDisplay() {
        document.getElementById('totalDomains').textContent = this.stats.totalDomains;
        document.getElementById('successfulAcquisitions').textContent = this.stats.successfulAcquisitions;
        document.getElementById('failedAttempts').textContent = this.stats.failedAttempts;
        document.getElementById('uptime').textContent = this.formatUptime(this.stats.uptime);
    }

    updateBotCard(botName, data) {
        const botKey = this.getBotKey(botName);
        const card = document.querySelector(`[data-bot="${botKey}"]`);
        if (!card) return;

        // Update progress bar based on activity
        const progressFill = card.querySelector('.progress-fill');
        const currentWidth = parseInt(progressFill.style.width) || 0;
        const newWidth = Math.min(currentWidth + 10, 100);
        progressFill.style.width = `${newWidth}%`;

        // Update message
        const messageElement = card.querySelector('.bot-message');
        if (data.specialty) {
            messageElement.textContent = `Searching for ${data.specialty}...`;
        }
    }

    updateBotCardFromStats(bot) {
        const botKey = this.getBotKey(bot.name);
        const card = document.querySelector(`[data-bot="${botKey}"]`);
        if (!card) return;

        // Update stats
        const stats = bot.status.stats;
        card.querySelector('[data-stat="domainsScanned"]').textContent = stats.domainsScanned || 0;
        card.querySelector('[data-stat="domainsDiscovered"]').textContent = stats.domainsDiscovered || 0;
        card.querySelector('[data-stat="domainsAcquired"]').textContent = stats.domainsAcquired || 0;

        // Update status indicator
        const statusIndicator = card.querySelector('.status-indicator');
        if (bot.status.isActive) {
            statusIndicator.textContent = 'Active';
            statusIndicator.className = 'status-indicator active';
            card.classList.add('pulsing');
        } else {
            statusIndicator.textContent = 'Inactive';
            statusIndicator.className = 'status-indicator inactive';
            card.classList.remove('pulsing');
        }

        // Update progress bar
        const progressFill = card.querySelector('.progress-fill');
        const progress = stats.domainsDiscovered > 0 ? 
            Math.min((stats.domainsAcquired / stats.domainsDiscovered) * 100, 100) : 0;
        progressFill.style.width = `${progress}%`;
    }

    updateBotStatus(botName, status, message) {
        const botKey = this.getBotKey(botName);
        const card = document.querySelector(`[data-bot="${botKey}"]`);
        if (!card) return;

        const statusIndicator = card.querySelector('.status-indicator');
        const messageElement = card.querySelector('.bot-message');

        if (status === 'active' || status === 'searching' || status === 'seeking' || status === 'exploring') {
            statusIndicator.textContent = 'Active';
            statusIndicator.className = 'status-indicator active';
            card.classList.add('pulsing');
        } else {
            statusIndicator.textContent = 'Inactive';
            statusIndicator.className = 'status-indicator inactive';
            card.classList.remove('pulsing');
        }

        if (message) {
            messageElement.textContent = message;
        }
    }

    updateAllBotStatus(status) {
        const cards = document.querySelectorAll('.bot-card');
        cards.forEach(card => {
            const statusIndicator = card.querySelector('.status-indicator');
            if (status === 'active') {
                statusIndicator.textContent = 'Active';
                statusIndicator.className = 'status-indicator active';
                card.classList.add('pulsing');
            } else {
                statusIndicator.textContent = 'Inactive';
                statusIndicator.className = 'status-indicator inactive';
                card.classList.remove('pulsing');
            }
        });
    }

    updateCharts() {
        // Update discovery timeline
        const now = new Date().toLocaleTimeString();
        this.charts.discovery.data.labels.push(now);
        
        // Keep only last 10 data points
        if (this.charts.discovery.data.labels.length > 10) {
            this.charts.discovery.data.labels.shift();
            this.charts.discovery.data.datasets.forEach(dataset => {
                dataset.data.shift();
            });
        }

        // Add current discovery data (simulated)
        this.charts.discovery.data.datasets.forEach(dataset => {
            dataset.data.push(Math.floor(Math.random() * 5));
        });

        this.charts.discovery.update('none');

        // Update performance chart
        const performanceData = [
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100)
        ];
        this.charts.performance.data.datasets[0].data = performanceData;
        this.charts.performance.update('none');
    }

    addLogEntry(type, message, className = '') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = {
            type,
            message,
            timestamp,
            className,
            id: Date.now() + Math.random()
        };

        this.logEntries.unshift(entry);
        
        // Keep only last 100 entries
        if (this.logEntries.length > 100) {
            this.logEntries = this.logEntries.slice(0, 100);
        }

        this.renderLog();
    }

    renderLog() {
        const container = document.getElementById('logContainer');
        const filteredEntries = this.getFilteredLogEntries();

        container.innerHTML = filteredEntries.map(entry => `
            <div class="log-entry ${entry.type} ${entry.className}">
                <span class="timestamp">${entry.timestamp}</span>
                <span class="message">${entry.message}</span>
            </div>
        `).join('');

        // Auto-scroll to top
        container.scrollTop = 0;
    }

    getFilteredLogEntries() {
        return this.logEntries.filter(entry => {
            if (this.filters.bot !== 'all' && !entry.message.includes(this.filters.bot)) {
                return false;
            }
            if (this.filters.event !== 'all' && entry.type !== this.filters.event) {
                return false;
            }
            if (this.filters.asset !== 'all' && !entry.message.includes(this.filters.asset)) {
                return false;
            }
            return true;
        });
    }

    applyFilters() {
        this.renderLog();
    }

    clearLog() {
        this.logEntries = [];
        this.renderLog();
        this.addLogEntry('system', 'Activity log cleared');
    }

    exportData(format) {
        window.open(`/api/export/${format}`, '_blank');
        this.addLogEntry('system', `Data exported as ${format.toUpperCase()}`);
    }

    getBotKey(botName) {
        const keyMap = {
            'Domain Hunter': 'domainHunter',
            'Asset Seeker': 'assetSeeker',
            'Recursive Explorer': 'recursiveExplorer'
        };
        return keyMap[botName] || botName.toLowerCase().replace(/\s+/g, '');
    }

    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    startUptimeTimer() {
        setInterval(() => {
            this.updateStatsDisplay();
        }, 1000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});