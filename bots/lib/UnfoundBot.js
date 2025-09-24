/**
 * Unfound Domain Bot
 * Focuses on discovering domains that haven't been found by traditional search methods
 */

const BaseDomainBot = require('./BaseDomainBot');

class UnfoundBot extends BaseDomainBot {
    constructor(config = {}) {
        super('unfound', config);
        
        this.lostTerms = [
            'lost', 'missing', 'forgotten', 'abandoned', 'orphan',
            'stray', 'wandering', 'roaming', 'drifting', 'floating'
        ];
        
        this.searchTerms = [
            'find', 'seek', 'hunt', 'search', 'discover', 'explore',
            'locate', 'track', 'trace', 'detect', 'uncover'
        ];
        
        this.rarityTerms = [
            'rare', 'unique', 'special', 'exclusive', 'limited',
            'scarce', 'uncommon', 'unusual', 'distinct', 'singular'
        ];
        
        this.treasureTerms = [
            'treasure', 'gem', 'jewel', 'diamond', 'gold',
            'pearl', 'crystal', 'stone', 'medal', 'prize'
        ];
    }

    async generateDomainCandidates() {
        const candidates = [];
        
        // Lost/unfound domains
        for (const lost of this.lostTerms) {
            candidates.push(`${lost}.com`);
            candidates.push(`${lost}.net`);
            candidates.push(`${lost}treasure.com`);
            candidates.push(`${lost}gem.io`);
            candidates.push(`find${lost}.com`);
        }
        
        // Search-oriented domains
        for (const search of this.searchTerms) {
            for (const treasure of this.treasureTerms.slice(0, 6)) {
                candidates.push(`${search}${treasure}.com`);
                candidates.push(`${treasure}${search}.net`);
                candidates.push(`${search}-${treasure}.org`);
            }
        }
        
        // Rarity combinations
        for (const rare of this.rarityTerms) {
            candidates.push(`${rare}find.com`);
            candidates.push(`${rare}discovery.net`);
            candidates.push(`${rare}hunt.io`);
            candidates.push(`the${rare}.com`);
        }
        
        // Hidden treasure patterns
        for (const treasure of this.treasureTerms) {
            candidates.push(`hidden${treasure}.com`);
            candidates.push(`secret${treasure}.net`);
            candidates.push(`lost${treasure}.org`);
            candidates.push(`${treasure}vault.io`);
        }
        
        // Cryptic unfound patterns
        const crypticPrefixes = ['x', 'z', 'q', 'k', 'j'];
        const crypticSuffixes = ['yx', 'zx', 'qx', 'kx', 'jx'];
        
        for (const prefix of crypticPrefixes) {
            for (const suffix of crypticSuffixes) {
                candidates.push(`${prefix}${suffix}.com`);
                candidates.push(`${prefix}${suffix}.io`);
                candidates.push(`${prefix}${suffix}.co`);
            }
        }
        
        // Numeric unfound patterns (sequences often missed)
        const numericPatterns = [
            '123', '321', '456', '654', '789', '987',
            '101', '202', '303', '404', '505', '606'
        ];
        
        for (const num of numericPatterns) {
            candidates.push(`x${num}.com`);
            candidates.push(`${num}x.io`);
            candidates.push(`find${num}.net`);
        }
        
        // Undiscovered combinations
        const prefixes = ['un', 'non', 'anti', 'counter', 'over', 'under'];
        const bases = ['found', 'seen', 'known', 'discovered', 'explored'];
        
        for (const prefix of prefixes) {
            for (const base of bases) {
                candidates.push(`${prefix}${base}.com`);
                candidates.push(`${prefix}${base}.net`);
            }
        }
        
        // Mystery domains
        const mysteryWords = ['mystery', 'enigma', 'puzzle', 'riddle', 'cipher'];
        for (const mystery of mysteryWords) {
            candidates.push(`${mystery}box.com`);
            candidates.push(`${mystery}vault.io`);
            candidates.push(`solve${mystery}.net`);
        }
        
        return this.shuffleArray(candidates).slice(0, 160);
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

module.exports = UnfoundBot;