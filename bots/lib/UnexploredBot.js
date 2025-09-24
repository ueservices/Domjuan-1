/**
 * Unexplored Domain Bot
 * Focuses on discovering domains in emerging trends and unexplored niches
 */

const BaseDomainBot = require('./BaseDomainBot');

class UnexploredBot extends BaseDomainBot {
    constructor(config = {}) {
        super('unexplored', config);
        
        this.emergingTech = [
            'ai', 'ml', 'blockchain', 'crypto', 'nft', 'web3',
            'metaverse', 'vr', 'ar', 'iot', 'quantum', 'edge',
            'serverless', 'microservice', 'defi', 'dao'
        ];
        
        this.newTlds = [
            'app', 'dev', 'tech', 'ai', 'io', 'co', 'xyz',
            'online', 'site', 'store', 'space', 'cloud'
        ];
        
        this.trendingWords = [
            'future', 'next', 'smart', 'auto', 'instant',
            'rapid', 'swift', 'agile', 'lean', 'fluid',
            'dynamic', 'adaptive', 'scalable', 'flexible'
        ];
        
        this.nicheCombos = [
            'micro', 'nano', 'mini', 'ultra', 'super', 'hyper',
            'multi', 'omni', 'uni', 'meta', 'proto', 'alpha'
        ];
    }

    async generateDomainCandidates() {
        const candidates = [];
        
        // Emerging tech domains
        for (const tech of this.emergingTech) {
            for (const tld of this.newTlds) {
                candidates.push(`${tech}hub.${tld}`);
                candidates.push(`${tech}lab.${tld}`);
                candidates.push(`${tech}space.${tld}`);
                candidates.push(`get${tech}.${tld}`);
                candidates.push(`my${tech}.${tld}`);
            }
        }
        
        // Trending + niche combinations
        for (const trend of this.trendingWords) {
            for (const niche of this.nicheCombos) {
                candidates.push(`${niche}${trend}.com`);
                candidates.push(`${trend}${niche}.io`);
                candidates.push(`${niche}-${trend}.app`);
            }
        }
        
        // Future-oriented domains
        const futureTerms = ['2025', '2030', 'next', 'future', 'tomorrow'];
        for (const future of futureTerms) {
            for (const tech of this.emergingTech.slice(0, 8)) {
                candidates.push(`${tech}${future}.com`);
                candidates.push(`${future}${tech}.io`);
            }
        }
        
        // Unexplored combinations
        for (let i = 0; i < 30; i++) {
            const combo1 = this.getRandomElement(this.emergingTech);
            const combo2 = this.getRandomElement(this.trendingWords);
            const tld = this.getRandomElement(this.newTlds);
            
            candidates.push(`${combo1}${combo2}.${tld}`);
            candidates.push(`${combo2}${combo1}.${tld}`);
        }
        
        // Industry-specific unexplored domains
        const industries = ['health', 'edu', 'finance', 'retail', 'media'];
        for (const industry of industries) {
            for (const tech of this.emergingTech.slice(0, 6)) {
                candidates.push(`${tech}${industry}.com`);
                candidates.push(`${industry}${tech}.net`);
            }
        }
        
        return this.shuffleArray(candidates).slice(0, 150);
    }
    
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
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

module.exports = UnexploredBot;