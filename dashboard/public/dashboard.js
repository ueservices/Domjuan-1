/**
 * Autonomous Discovery System Dashboard JavaScript
 * Real-time dashboard for monitoring bot activity and discoveries
 */

let socket;
let systemStatus = 'initializing';
let discoveries = [];
let currentFilter = 'all';

// Initialize dashboard
function initializeDashboard() {
    console.log('🚀 Initializing Autonomous Discovery Dashboard...');
    
    // Connect to WebSocket
    connectWebSocket();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize UI
    initializeUI();
    
    console.log('✅ Dashboard initialized');
}

// WebSocket connection
function connectWebSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('🔌 Connected to autonomous system');
        updateConnectionStatus('connected');
        addLogEntry('system', 'Connected to autonomous discovery system');
        
        // Request initial status
        socket.emit('request-status-update');
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Disconnected from autonomous system');
        updateConnectionStatus('disconnected');
        addLogEntry('error', 'Disconnected from system');
    });
    
    // System status updates
    socket.on('system-status-update', (data) => {
        updateSystemStatus(data);
    });
    
    // Bot registration
    socket.on('bot-registered', (data) => {
        addLogEntry('success', `Bot registered: ${data.botId}`);
        updateBotStatus(data.botId, 'registered');
    });
    
    // New discoveries
    socket.on('new-discovery', (data) => {
        handleNewDiscovery(data);
    });
    
    // Deep Whisper results
    socket.on('deep-whisper-result', (data) => {
        handleDeepWhisperResult(data);
    });
    
    // Bot status changes
    socket.on('bot-status-change', (data) => {
        updateBotStatus(data.botId, data.status);
        addLogEntry('system', `Bot ${data.botId} status: ${data.status}`);
    });
    
    // Bot collaborations
    socket.on('bot-collaboration', (data) => {
        addLogEntry('system', `Collaboration: ${data.requester} → ${data.target}`);
        incrementMetric('collaborations');
    });
    
    // Operations events
    socket.on('operations-started', (data) => {
        addLogEntry('success', data.message);
        enableStopButton();
        disableStartButton();
    });
    
    socket.on('operations-stopped', (data) => {
        addLogEntry('warning', data.message);
        enableStartButton();
        disableStopButton();
    });
    
    // Error events
    socket.on('bot-error', (data) => {
        addLogEntry('error', `Bot ${data.botId} error: ${data.error.message}`);
    });
    
    socket.on('bot-healing-failed', (data) => {
        addLogEntry('error', `Bot ${data.botId} healing failed after ${data.attempts} attempts`);
    });
}

// Setup UI event listeners
function setupEventListeners() {
    // Control buttons
    document.getElementById('start-system').addEventListener('click', startSystem);
    document.getElementById('stop-system').addEventListener('click', stopSystem);
    document.getElementById('deep-whisper-btn').addEventListener('click', openDeepWhisperModal);
    
    // Deep Whisper modal
    document.getElementById('execute-whisper').addEventListener('click', executeDeepWhisper);
    document.getElementById('cancel-whisper').addEventListener('click', closeDeepWhisperModal);
    document.querySelector('.close').addEventListener('click', closeDeepWhisperModal);
    
    // Modal outside click
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('deep-whisper-modal');
        if (event.target === modal) {
            closeDeepWhisperModal();
        }
    });
    
    // Discovery filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setDiscoveryFilter(e.target.dataset.filter);
        });
    });
}

// Initialize UI elements
function initializeUI() {
    updateConnectionStatus('connecting');
    
    // Disable control buttons initially
    disableStartButton();
    disableStopButton();
}

// System control functions
async function startSystem() {
    try {
        addLogEntry('system', 'Starting autonomous operations...');
        
        const response = await fetch('/api/bots/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            addLogEntry('success', result.message);
        } else {
            addLogEntry('error', `Failed to start: ${result.error}`);
        }
    } catch (error) {
        addLogEntry('error', `Start error: ${error.message}`);
    }
}

async function stopSystem() {
    try {
        addLogEntry('system', 'Stopping autonomous operations...');
        
        const response = await fetch('/api/bots/stop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            addLogEntry('warning', result.message);
        } else {
            addLogEntry('error', `Failed to stop: ${result.error}`);
        }
    } catch (error) {
        addLogEntry('error', `Stop error: ${error.message}`);
    }
}

// Deep Whisper functionality
function openDeepWhisperModal() {
    document.getElementById('deep-whisper-modal').style.display = 'block';
}

function closeDeepWhisperModal() {
    document.getElementById('deep-whisper-modal').style.display = 'none';
}

async function executeDeepWhisper() {
    const options = {
        assetMovementPattern: document.getElementById('asset-movement').checked,
        obscureDomainOwnership: document.getElementById('ownership-patterns').checked,
        blockchainCrossLinks: document.getElementById('blockchain-links').checked,
        hiddenAssetClusters: document.getElementById('hidden-clusters').checked
    };
    
    // Create mock discovery for Deep Whisper scan
    const mockDiscovery = {
        type: 'manual-deep-whisper-trigger',
        timestamp: Date.now(),
        options: options,
        confidence: 0.8
    };
    
    try {
        addLogEntry('whisper', '🕵️ Initiating Deep Whisper scan...');
        
        const response = await fetch('/api/deep-whisper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discovery: mockDiscovery })
        });
        
        const result = await response.json();
        
        if (result.success) {
            addLogEntry('whisper', `✨ ${result.message}`);
            addLogEntry('whisper', result.disclaimer);
            incrementMetric('deep-whisper-scans');
        } else {
            addLogEntry('error', `Deep Whisper failed: ${result.error}`);
        }
        
        closeDeepWhisperModal();
    } catch (error) {
        addLogEntry('error', `Deep Whisper error: ${error.message}`);
        closeDeepWhisperModal();
    }
}

// Discovery handling
function handleNewDiscovery(data) {
    console.log('🔍 New discovery:', data);
    
    const discovery = {
        id: Date.now() + Math.random(),
        ...data,
        timestamp: new Date(data.timestamp)
    };
    
    discoveries.unshift(discovery);
    
    // Limit discoveries to last 100
    if (discoveries.length > 100) {
        discoveries = discoveries.slice(0, 100);
    }
    
    updateDiscoveryFeed();
    incrementMetric('total-discoveries');
    
    // Bot-specific metrics
    const botType = data.botId.split('-')[0];
    updateBotMetric(data.botId, 'discoveries');
    
    addLogEntry('success', `💎 Discovery: ${data.discovery.type} from ${data.botId}`);
}

function handleDeepWhisperResult(data) {
    console.log('🌟 Deep Whisper result:', data);
    
    const discovery = {
        id: Date.now() + Math.random(),
        ...data,
        timestamp: new Date(data.timestamp),
        isDeepWhisper: true
    };
    
    discoveries.unshift(discovery);
    updateDiscoveryFeed();
    
    addLogEntry('whisper', `🌟 ${data.message}`);
    addLogEntry('whisper', `💎 Hidden correlations revealed: ${data.discovery?.hiddenCorrelations?.length || 0}`);
    
    // Show special notification for Deep Whisper results
    showDeepWhisperNotification(data);
}

function showDeepWhisperNotification(data) {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.className = 'deep-whisper-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-magic"></i>
            <div>
                <strong>Deep Whisper Scan Complete!</strong>
                <p>Advanced AI detected ${data.discovery?.hiddenCorrelations?.length || 0} hidden correlations</p>
            </div>
        </div>
    `;
    
    // Add to page temporarily
    document.body.appendChild(notification);
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #9f7aea, #805ad5)',
        color: 'white',
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(159, 122, 234, 0.4)',
        zIndex: '9999',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '300px'
    });
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// UI update functions
function updateSystemStatus(data) {
    systemStatus = data.status;
    
    const statusIndicator = document.getElementById('system-status-indicator');
    const statusText = document.getElementById('system-status-text');
    
    statusText.textContent = systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1);
    statusIndicator.className = `status-indicator ${systemStatus}`;
    
    // Update metrics if available
    if (data.orchestratorStatus?.metrics) {
        updateSystemMetrics(data.orchestratorStatus.metrics);
    }
    
    // Update bot statuses
    if (data.orchestratorStatus?.bots) {
        for (const [botId, botStatus] of Object.entries(data.orchestratorStatus.bots)) {
            updateBotCard(botId, botStatus);
        }
    }
    
    // Enable/disable buttons based on status
    if (systemStatus === 'ready' || systemStatus === 'stopped') {
        enableStartButton();
        disableStopButton();
    } else if (systemStatus === 'running') {
        disableStartButton();
        enableStopButton();
    }
}

function updateSystemMetrics(metrics) {
    document.getElementById('total-discoveries').textContent = metrics.totalDiscoveries || 0;
    document.getElementById('active-scans').textContent = metrics.activeScans || 0;
    document.getElementById('collaborations').textContent = metrics.collaborations || 0;
    document.getElementById('deep-whisper-scans').textContent = metrics.deepWhisperScans || 0;
}

function updateBotCard(botId, botStatus) {
    const cardId = botId.replace('-001', '').replace('-', '-');
    const card = document.getElementById(`${cardId}-card`);
    
    if (card) {
        // Update status
        const statusElement = document.getElementById(`${cardId}-status`);
        if (statusElement) {
            statusElement.textContent = botStatus.status;
            statusElement.className = `bot-status ${botStatus.status}`;
        }
        
        // Update metrics
        if (botStatus.metrics) {
            const metricsMap = {
                'tasks': 'tasksCompleted',
                'discoveries': 'discoveries', 
                'success': 'successRate'
            };
            
            for (const [key, metric] of Object.entries(metricsMap)) {
                const element = document.getElementById(`${cardId}-${key}`);
                if (element && botStatus.metrics[metric] !== undefined) {
                    let value = botStatus.metrics[metric];
                    if (key === 'success') {
                        value = Math.round(value * 100) + '%';
                    }
                    element.textContent = value;
                }
            }
        }
        
        // Update activity
        const activityElement = document.getElementById(`${cardId}-activity`);
        if (activityElement) {
            const logElement = activityElement.querySelector('.activity-log');
            if (logElement) {
                logElement.textContent = botStatus.status === 'running' ? 
                    'Autonomous operations active...' : 
                    'Awaiting instructions...';
            }
        }
        
        // Add active class for running bots
        if (botStatus.status === 'running') {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    }
}

function updateBotStatus(botId, status) {
    // This will be called by the WebSocket event
    // Implementation depends on how botId maps to UI elements
}

function updateBotMetric(botId, metric) {
    // Implementation for updating specific bot metrics
}

function updateDiscoveryFeed() {
    const discoveryList = document.getElementById('discovery-list');
    const filteredDiscoveries = currentFilter === 'all' ? 
        discoveries : 
        discoveries.filter(d => d.discovery?.type?.includes(currentFilter) || 
                             (currentFilter === 'deep-whisper' && d.isDeepWhisper));
    
    if (filteredDiscoveries.length === 0) {
        discoveryList.innerHTML = `
            <div class="discovery-placeholder">
                <i class="fas fa-satellite-dish"></i>
                <p>No discoveries yet for filter: ${currentFilter}</p>
            </div>
        `;
        return;
    }
    
    discoveryList.innerHTML = '';
    
    filteredDiscoveries.slice(0, 20).forEach(discovery => {
        const discoveryElement = createDiscoveryElement(discovery);
        discoveryList.appendChild(discoveryElement);
    });
}

function createDiscoveryElement(discovery) {
    const div = document.createElement('div');
    div.className = `discovery-item ${discovery.isDeepWhisper ? 'deep-whisper-item' : ''}`;
    
    const discoveryType = discovery.discovery?.type || 'Unknown';
    const botId = discovery.botId || 'Unknown';
    const timestamp = discovery.timestamp.toLocaleTimeString();
    
    let content = 'Discovery details not available';
    
    if (discovery.discovery) {
        const d = discovery.discovery;
        
        if (d.domains) {
            content = `Found ${d.domains.length} domains - Total value: ${d.estimatedTotalValue || 'N/A'}`;
        } else if (d.assets) {
            content = `Discovered ${d.assets.length} assets - Value: ${d.estimatedTotalValue || 'N/A'}`;
        } else if (d.correlations) {
            content = `${d.correlations.length} correlations detected - ${d.strongCorrelations || 0} high-confidence`;
        } else if (d.hiddenCorrelations) {
            content = `🌟 ${d.hiddenCorrelations.length} hidden correlations - ${d.assetClusters?.length || 0} asset clusters revealed`;
        } else if (d.totalFound) {
            content = `${d.totalFound} items discovered`;
        } else {
            content = `${discoveryType} completed successfully`;
        }
    }
    
    div.innerHTML = `
        <div class="discovery-header">
            <div>
                <span class="discovery-type">${discoveryType}</span>
                <span class="discovery-bot">by ${botId}</span>
            </div>
            <span class="discovery-timestamp">${timestamp}</span>
        </div>
        <div class="discovery-content">${content}</div>
    `;
    
    return div;
}

function setDiscoveryFilter(filter) {
    currentFilter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    updateDiscoveryFeed();
}

function updateConnectionStatus(status) {
    const connectionElement = document.getElementById('connection-status');
    
    if (status === 'connected') {
        connectionElement.innerHTML = '<i class="fas fa-wifi"></i> Connected';
        connectionElement.className = 'connection-status connected';
    } else if (status === 'disconnected') {
        connectionElement.innerHTML = '<i class="fas fa-wifi"></i> Disconnected';
        connectionElement.className = 'connection-status disconnected';
    } else {
        connectionElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        connectionElement.className = 'connection-status';
    }
}

function addLogEntry(type, message) {
    const logContainer = document.getElementById('log-container');
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    
    logEntry.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="message">${message}</span>
    `;
    
    logContainer.insertBefore(logEntry, logContainer.firstChild);
    
    // Limit to last 50 log entries
    const entries = logContainer.querySelectorAll('.log-entry');
    if (entries.length > 50) {
        entries[entries.length - 1].remove();
    }
}

function incrementMetric(metricName) {
    const element = document.getElementById(metricName.replace('-', '-'));
    if (element) {
        const current = parseInt(element.textContent) || 0;
        element.textContent = current + 1;
    }
}

function enableStartButton() {
    const btn = document.getElementById('start-system');
    btn.disabled = false;
}

function disableStartButton() {
    const btn = document.getElementById('start-system');
    btn.disabled = true;
}

function enableStopButton() {
    const btn = document.getElementById('stop-system');
    btn.disabled = false;
}

function disableStopButton() {
    const btn = document.getElementById('stop-system');
    btn.disabled = true;
}

// Add CSS animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .deep-whisper-notification .notification-content {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .deep-whisper-notification i {
        font-size: 1.5rem;
    }
    
    .deep-whisper-notification strong {
        display: block;
        margin-bottom: 0.25rem;
    }
    
    .deep-whisper-notification p {
        margin: 0;
        font-size: 0.9rem;
        opacity: 0.9;
    }
`;
document.head.appendChild(style);

// Export for global access
window.initializeDashboard = initializeDashboard;