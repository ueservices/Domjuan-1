/**
 * Hidden Domain Bot
 * Focuses on discovering hidden gem domains that might be overlooked
 */

const BaseDomainBot = require('./BaseDomainBot');

class HiddenBot extends BaseDomainBot {
    constructor(config = {}) {
        super('hidden', config);
        
        this.hiddenPrefixes = [
            'vault', 'secret', 'private', 'hidden', 'shadow',
            'ghost', 'phantom', 'stealth', 'covert', 'silent',
            'inner', 'deep', 'core', 'zen', 'pure'
        ];
        
        this.hiddenSuffixes = [
            'hub', 'lab', 'space', 'zone', 'realm', 'base',
            'spot', 'nest', 'den', 'cave', 'vault', 'box'
        ];
        
        this.businessTerms = [
            'asset', 'capital', 'fund', 'invest', 'trade',
            'wealth', 'profit', 'growth', 'value', 'prime'
        ];
    }

    async generateDomainCandidates() {
        const candidates = [];
        
        // Generate hidden-style domains
        for (const prefix of this.hiddenPrefixes) {
            for (const suffix of this.hiddenSuffixes) {
                candidates.push(`${prefix}${suffix}.com`);
                candidates.push(`${prefix}-${suffix}.com`);
                candidates.push(`${prefix}${suffix}.net`);
                candidates.push(`${prefix}${suffix}.org`);
            }
        }
        
        // Business + hidden combinations
        for (const business of this.businessTerms) {
            for (const prefix of this.hiddenPrefixes.slice(0, 8)) {
                candidates.push(`${prefix}${business}.com`);
                candidates.push(`${business}${prefix}.com`);
                candidates.push(`${prefix}-${business}.net`);
            }
        }
        
        // Cryptic short domains
        for (let i = 0; i < 20; i++) {
            const shortCode = this.generateShortCode();
            candidates.push(`${shortCode}.com`);
            candidates.push(`${shortCode}.io`);
            candidates.push(`${shortCode}.co`);
        }
        
        // Hidden gem patterns (less obvious valuable domains)
        const hiddenGems = [
            'myspace', 'ourplace', 'thezone', 'insider', 'member',
            'private', 'exclusive', 'select', 'elite', 'premium'
        ];
        
        for (const gem of hiddenGems) {
            candidates.push(`${gem}hub.com`);
            candidates.push(`${gem}zone.net`);
            candidates.push(`the${gem}.com`);
        }
        
        return this.shuffleArray(candidates).slice(0, 120);
    }
    
    generateShortCode() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < Math.floor(Math.random() * 3) + 3; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
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

module.exports = HiddenBot;