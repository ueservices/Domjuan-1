/**
 * Nested Domain Bot
 * Focuses on discovering domains with nested structures and subdomains
 */

const BaseDomainBot = require('./BaseDomainBot');

class NestedBot extends BaseDomainBot {
    constructor(config = {}) {
        super('nested', config);
        
        this.nestedPatterns = [
            'api', 'app', 'admin', 'portal', 'dashboard', 'panel',
            'client', 'user', 'member', 'secure', 'private',
            'internal', 'dev', 'test', 'staging', 'beta',
            'v1', 'v2', 'v3', 'new', 'old', 'legacy'
        ];
        
        this.baseDomains = [
            'tech', 'app', 'digital', 'online', 'web', 'net',
            'cloud', 'data', 'system', 'platform', 'service'
        ];
    }

    async generateDomainCandidates() {
        const candidates = [];
        
        // Generate nested-style domains
        for (const base of this.baseDomains) {
            for (const pattern of this.nestedPatterns) {
                // Pattern-base combinations
                candidates.push(`${pattern}${base}.com`);
                candidates.push(`${pattern}-${base}.com`);
                candidates.push(`${base}-${pattern}.com`);
                
                // Try other TLDs
                candidates.push(`${pattern}${base}.net`);
                candidates.push(`${pattern}${base}.org`);
                
                // Multi-level nested patterns
                candidates.push(`${pattern}.${base}.app`);
                candidates.push(`${pattern}.${base}.dev`);
            }
        }
        
        // Generate tech stack related nested domains
        const techStacks = ['react', 'vue', 'angular', 'node', 'python', 'java'];
        for (const tech of techStacks) {
            for (const pattern of this.nestedPatterns.slice(0, 5)) {
                candidates.push(`${tech}-${pattern}.com`);
                candidates.push(`${pattern}-${tech}.dev`);
            }
        }
        
        // Shuffle and return limited set
        return this.shuffleArray(candidates).slice(0, 100);
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

module.exports = NestedBot;