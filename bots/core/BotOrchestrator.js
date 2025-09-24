/**
 * Autonomous Bot Orchestrator
 * Manages the lifecycle, coordination, and autonomous behavior of discovery bots
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class BotOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.bots = new Map();
        this.status = 'idle';
        this.startTime = null;
        this.metrics = {
            totalDiscoveries: 0,
            activeScans: 0,
            collaborations: 0,
            deepWhisperScans: 0
        };
        this.persistentState = {};
        this.healingRoutines = new Map();
        
        // Self-healing configuration
        this.healingConfig = {
            maxRetries: 3,
            backoffMultiplier: 2,
            baseDelay: 1000,
            healthCheckInterval: 30000
        };
        
        this.setupSelfHealing();
    }

    /**
     * Register a bot with the orchestrator
     */
    async registerBot(bot) {
        const botId = bot.getId();
        this.bots.set(botId, bot);
        
        // Set up bot event listeners for coordination
        bot.on('discovery', (data) => this.handleBotDiscovery(botId, data));
        bot.on('collaboration-request', (data) => this.handleCollaborationRequest(botId, data));
        bot.on('status-change', (status) => this.handleBotStatusChange(botId, status));
        bot.on('error', (error) => this.handleBotError(botId, error));
        
        // Initialize bot with persistent state
        if (this.persistentState[botId]) {
            await bot.restoreState(this.persistentState[botId]);
        }
        
        console.log(`Bot ${botId} registered successfully`);
        this.emit('bot-registered', { botId, bot });
    }

    /**
     * Start autonomous operations for all bots
     */
    async startAutonomousOperations() {
        if (this.status === 'running') {
            throw new Error('Operations already running');
        }

        this.status = 'running';
        this.startTime = new Date();
        
        console.log('Starting autonomous bot operations...');
        
        // Start each bot autonomously
        for (const [botId, bot] of this.bots) {
            try {
                await bot.startAutonomous();
                console.log(`Bot ${botId} started autonomously`);
            } catch (error) {
                console.error(`Failed to start bot ${botId}:`, error);
                this.scheduleHealing(botId, error);
            }
        }
        
        // Start coordination routines
        this.startCoordinationRoutines();
        
        this.emit('operations-started');
    }

    /**
     * Stop autonomous operations
     */
    async stopAutonomousOperations() {
        this.status = 'stopping';
        
        console.log('Stopping autonomous operations...');
        
        // Stop all bots gracefully
        const stopPromises = Array.from(this.bots.values()).map(bot => 
            bot.stopGracefully().catch(err => console.error('Bot stop error:', err))
        );
        
        await Promise.all(stopPromises);
        
        // Clear coordination timers
        this.clearCoordinationRoutines();
        
        // Save persistent state
        await this.savePersistentState();
        
        this.status = 'idle';
        this.emit('operations-stopped');
    }

    /**
     * Handle discovery from a bot and coordinate with others
     */
    handleBotDiscovery(botId, discovery) {
        this.metrics.totalDiscoveries++;
        
        // Broadcast discovery to other bots for collaborative analysis
        for (const [otherId, otherBot] of this.bots) {
            if (otherId !== botId) {
                otherBot.processCollaborativeDiscovery(discovery, botId);
            }
        }
        
        // Check if this discovery triggers deep analysis
        if (this.shouldTriggerDeepWhisper(discovery)) {
            this.triggerDeepWhisperScan(discovery);
        }
        
        this.emit('discovery', { botId, discovery });
    }

    /**
     * Handle collaboration requests between bots
     */
    handleCollaborationRequest(requestingBotId, request) {
        const targetBot = this.bots.get(request.targetBotId);
        
        if (targetBot) {
            targetBot.handleCollaborationRequest(requestingBotId, request);
            this.metrics.collaborations++;
            
            this.emit('collaboration', {
                requester: requestingBotId,
                target: request.targetBotId,
                request
            });
        }
    }

    /**
     * Handle bot status changes and coordinate responses
     */
    handleBotStatusChange(botId, status) {
        console.log(`Bot ${botId} status changed to: ${status}`);
        
        // If a bot becomes idle, assign it new tasks based on other bots' discoveries
        if (status === 'idle') {
            this.assignAdaptiveTasks(botId);
        }
        
        this.emit('bot-status-change', { botId, status });
    }

    /**
     * Handle bot errors and trigger healing
     */
    handleBotError(botId, error) {
        console.error(`Bot ${botId} error:`, error);
        this.scheduleHealing(botId, error);
        this.emit('bot-error', { botId, error });
    }

    /**
     * Start coordination routines for competitive and collaborative behavior
     */
    startCoordinationRoutines() {
        // Periodic task redistribution to prevent overlap and maximize coverage
        this.coordinationTimer = setInterval(() => {
            this.redistributeTasks();
        }, 60000); // Every minute

        // Performance monitoring and adaptive adjustments
        this.adaptationTimer = setInterval(() => {
            this.adaptBotStrategies();
        }, 300000); // Every 5 minutes

        // Health monitoring
        this.healthTimer = setInterval(() => {
            this.performHealthChecks();
        }, this.healingConfig.healthCheckInterval);
    }

    /**
     * Clear coordination routines
     */
    clearCoordinationRoutines() {
        if (this.coordinationTimer) clearInterval(this.coordinationTimer);
        if (this.adaptationTimer) clearInterval(this.adaptationTimer);
        if (this.healthTimer) clearInterval(this.healthTimer);
    }

    /**
     * Redistribute tasks to minimize overlap and maximize coverage
     */
    redistributeTasks() {
        const activeBots = Array.from(this.bots.values()).filter(bot => bot.isActive());
        
        if (activeBots.length < 2) return;
        
        // Analyze current task distribution
        const taskAnalysis = this.analyzeTaskDistribution(activeBots);
        
        // Reassign tasks to reduce overlap
        for (const bot of activeBots) {
            const newStrategy = this.calculateOptimalStrategy(bot, taskAnalysis);
            bot.adaptStrategy(newStrategy);
        }
        
        console.log('Task redistribution completed');
    }

    /**
     * Adapt bot strategies based on performance metrics
     */
    adaptBotStrategies() {
        for (const [botId, bot] of this.bots) {
            const performance = bot.getPerformanceMetrics();
            const adaptations = this.calculateAdaptations(performance);
            
            if (adaptations.length > 0) {
                bot.adaptStrategy(adaptations);
                console.log(`Adapted strategy for bot ${botId}:`, adaptations);
            }
        }
    }

    /**
     * Perform health checks on all bots
     */
    async performHealthChecks() {
        for (const [botId, bot] of this.bots) {
            try {
                const health = await bot.performHealthCheck();
                if (!health.healthy) {
                    console.warn(`Bot ${botId} health check failed:`, health.issues);
                    this.scheduleHealing(botId, new Error('Health check failed'));
                }
            } catch (error) {
                console.error(`Health check error for bot ${botId}:`, error);
                this.scheduleHealing(botId, error);
            }
        }
    }

    /**
     * Set up self-healing mechanisms
     */
    setupSelfHealing() {
        this.on('bot-error', async ({ botId, error }) => {
            await this.attemptBotRecovery(botId, error);
        });
    }

    /**
     * Schedule healing for a bot
     */
    scheduleHealing(botId, error) {
        if (this.healingRoutines.has(botId)) {
            return; // Already healing
        }

        const healingProcess = {
            attempts: 0,
            lastError: error,
            nextAttempt: Date.now() + this.healingConfig.baseDelay
        };

        this.healingRoutines.set(botId, healingProcess);
        this.performHealing(botId);
    }

    /**
     * Perform actual healing for a bot
     */
    async performHealing(botId) {
        const healingProcess = this.healingRoutines.get(botId);
        if (!healingProcess) return;

        healingProcess.attempts++;
        
        try {
            const bot = this.bots.get(botId);
            if (bot) {
                await bot.heal();
                console.log(`Bot ${botId} healed successfully after ${healingProcess.attempts} attempts`);
                this.healingRoutines.delete(botId);
                return;
            }
        } catch (error) {
            console.error(`Healing attempt ${healingProcess.attempts} failed for bot ${botId}:`, error);
        }

        // Schedule next healing attempt if within retry limit
        if (healingProcess.attempts < this.healingConfig.maxRetries) {
            const delay = this.healingConfig.baseDelay * 
                         Math.pow(this.healingConfig.backoffMultiplier, healingProcess.attempts);
            
            setTimeout(() => this.performHealing(botId), delay);
        } else {
            console.error(`Bot ${botId} healing failed after ${healingProcess.attempts} attempts`);
            this.healingRoutines.delete(botId);
            this.emit('bot-healing-failed', { botId, attempts: healingProcess.attempts });
        }
    }

    /**
     * Determine if a discovery should trigger a deep whisper scan
     */
    shouldTriggerDeepWhisper(discovery) {
        // Analyze discovery for non-obvious correlations
        const indicators = [
            discovery.assetMovementPattern,
            discovery.obscureDomainOwnership,
            discovery.blockchainCrossLinks,
            discovery.hiddenAssetClusters
        ];
        
        return indicators.some(indicator => indicator && indicator.confidence > 0.7);
    }

    /**
     * Trigger deep whisper scan for hidden asset discovery
     */
    async triggerDeepWhisperScan(discovery) {
        this.metrics.deepWhisperScans++;
        
        console.log('🔍 Triggering Deep Whisper scan for advanced correlation detection...');
        
        // Get the most suitable bot for deep analysis
        const deepAnalysisBot = this.selectBotForDeepAnalysis();
        
        if (deepAnalysisBot) {
            await deepAnalysisBot.performDeepWhisperScan(discovery);
            this.emit('deep-whisper-scan', { discovery, botId: deepAnalysisBot.getId() });
        }
    }

    /**
     * Select the most suitable bot for deep analysis
     */
    selectBotForDeepAnalysis() {
        // Prefer Asset Seeker for deep analysis, fallback to others
        for (const bot of this.bots.values()) {
            if (bot.getType() === 'AssetSeeker' && bot.isAvailable()) {
                return bot;
            }
        }
        
        // Fallback to any available bot
        for (const bot of this.bots.values()) {
            if (bot.isAvailable()) {
                return bot;
            }
        }
        
        return null;
    }

    /**
     * Save persistent state for recovery
     */
    async savePersistentState() {
        const state = {};
        
        for (const [botId, bot] of this.bots) {
            state[botId] = await bot.getState();
        }
        
        this.persistentState = state;
        
        try {
            await fs.writeFile(
                path.join(__dirname, '../../data/orchestrator-state.json'),
                JSON.stringify(state, null, 2)
            );
        } catch (error) {
            console.error('Failed to save persistent state:', error);
        }
    }

    /**
     * Load persistent state for recovery
     */
    async loadPersistentState() {
        try {
            const stateFile = path.join(__dirname, '../../data/orchestrator-state.json');
            const data = await fs.readFile(stateFile, 'utf8');
            this.persistentState = JSON.parse(data);
            console.log('Persistent state loaded successfully');
        } catch (error) {
            console.log('No persistent state found, starting fresh');
            this.persistentState = {};
        }
    }

    /**
     * Get system status and metrics
     */
    getStatus() {
        const botStatuses = {};
        for (const [botId, bot] of this.bots) {
            botStatuses[botId] = bot.getStatus();
        }

        return {
            orchestratorStatus: this.status,
            startTime: this.startTime,
            uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
            metrics: this.metrics,
            bots: botStatuses,
            healing: Array.from(this.healingRoutines.keys())
        };
    }

    // Helper methods for task analysis and optimization
    analyzeTaskDistribution(bots) {
        // Implementation for analyzing current task distribution
        return {
            overlap: 0.2, // 20% overlap detected
            coverage: 0.85, // 85% coverage achieved
            efficiency: 0.75 // 75% efficiency
        };
    }

    calculateOptimalStrategy(bot, analysis) {
        // Implementation for calculating optimal strategy
        return {
            searchDepth: analysis.coverage < 0.8 ? 'deep' : 'normal',
            collaborationLevel: analysis.overlap > 0.3 ? 'high' : 'medium'
        };
    }

    calculateAdaptations(performance) {
        const adaptations = [];
        
        if (performance.successRate < 0.5) {
            adaptations.push({ type: 'strategy', value: 'conservative' });
        }
        
        if (performance.discoveryRate < 0.1) {
            adaptations.push({ type: 'searchScope', value: 'expanded' });
        }
        
        return adaptations;
    }

    assignAdaptiveTasks(botId) {
        const bot = this.bots.get(botId);
        if (!bot) return;

        // Assign tasks based on current system needs and bot capabilities
        const optimalTasks = this.calculateOptimalTasks(bot);
        bot.assignTasks(optimalTasks);
    }

    calculateOptimalTasks(bot) {
        // Implement task calculation based on bot type and system state
        return [];
    }
}

module.exports = BotOrchestrator;