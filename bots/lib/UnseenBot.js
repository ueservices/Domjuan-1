/**
 * Unseen Domain Bot
 * Focuses on discovering domains that are typically overlooked or invisible
 */

const BaseDomainBot = require('./BaseDomainBot');

class UnseenBot extends BaseDomainBot {
    constructor(config = {}) {
        super('unseen', config);
        
        this.invisibleTerms = [
            'invisible', 'unseen', 'transparent', 'clear', 'void',
            'blank', 'empty', 'null', 'zero', 'none', 'missing'
        ];
        
        this.subtleWords = [
            'subtle', 'soft', 'quiet', 'calm', 'still', 'peace',
            'gentle', 'light', 'thin', 'fine', 'delicate'
        ];
        
        this.backgroundTerms = [
            'background', 'behind', 'under', 'below', 'beneath',
            'inside', 'within', 'inner', 'back', 'rear'
        ];
        
        this.minimalistWords = [
            'minimal', 'simple', 'basic', 'plain', 'bare',
            'clean', 'pure', 'raw', 'naked', 'stripped'
        ];
    }

    async generateDomainCandidates() {
        const candidates = [];
        
        // Invisible/unseen combinations
        for (const invisible of this.invisibleTerms) {
            candidates.push(`${invisible}.com`);
            candidates.push(`${invisible}.net`);
            candidates.push(`${invisible}web.com`);
            candidates.push(`${invisible}app.io`);
            candidates.push(`the${invisible}.com`);
        }
        
        // Subtle domain combinations
        for (const subtle of this.subtleWords) {
            for (const background of this.backgroundTerms.slice(0, 6)) {
                candidates.push(`${subtle}${background}.com`);
                candidates.push(`${background}${subtle}.net`);
                candidates.push(`${subtle}-${background}.org`);
            }
        }
        
        // Minimalist approach domains
        for (const minimal of this.minimalistWords) {
            candidates.push(`${minimal}site.com`);
            candidates.push(`${minimal}app.io`);
            candidates.push(`${minimal}web.net`);
            candidates.push(`go${minimal}.com`);
        }
        
        // Nearly invisible short domains
        const almostEmpty = ['__', '--', '..', '00', '11', 'xx', 'zz'];
        for (const empty of almostEmpty) {
            candidates.push(`${empty}site.com`);
            candidates.push(`${empty}app.io`);
            candidates.push(`site${empty}.net`);
        }
        
        // Overlooked patterns (common but ignored)
        const overlooked = [
            'temp', 'test', 'demo', 'trial', 'preview', 'draft',
            'backup', 'copy', 'clone', 'mirror', 'echo'
        ];
        
        for (const word of overlooked) {
            candidates.push(`${word}site.com`);
            candidates.push(`${word}app.net`);
            candidates.push(`my${word}.io`);
            candidates.push(`${word}hub.org`);
        }
        
        // Ultra-minimal single letter + word combinations
        const singleLetters = ['a', 'e', 'i', 'o', 'u', 'x', 'z'];
        const shortWords = ['go', 'my', 'in', 'on', 'up', 'to'];
        
        for (const letter of singleLetters) {
            for (const word of shortWords) {
                candidates.push(`${letter}${word}.io`);
                candidates.push(`${word}${letter}.co`);
            }
        }
        
        // Transparent/ghost domains
        const ghostTerms = ['ghost', 'phantom', 'shadow', 'shade', 'fog'];
        for (const ghost of ghostTerms) {
            candidates.push(`${ghost}.app`);
            candidates.push(`${ghost}.dev`);
            candidates.push(`${ghost}ly.com`);
        }
        
        return this.shuffleArray(candidates).slice(0, 140);
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

module.exports = UnseenBot;