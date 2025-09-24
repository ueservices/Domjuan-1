const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const whois = require('whois');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"]
        }
    }
}));
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Bot configuration
const BOTS = {
    nested: {
        name: 'Nested Bot',
        role: 'nested',
        description: 'Finds nested and hierarchical domain opportunities',
        status: 'active',
        domainsFound: 0
    },
    hidden: {
        name: 'Hidden Bot',
        role: 'hidden',
        description: 'Discovers hidden gem domains with potential',
        status: 'active',
        domainsFound: 0
    },
    unexplored: {
        name: 'Unexplored Bot',
        role: 'unexplored',
        description: 'Searches for unexplored domain territories',
        status: 'active',
        domainsFound: 0
    },
    unseen: {
        name: 'Unseen Bot',
        role: 'unseen',
        description: 'Locates unseen domain assets and opportunities',
        status: 'active',
        domainsFound: 0
    },
    unfound: {
        name: 'Unfound Bot',
        role: 'unfound',
        description: 'Tracks down unfound and rare domain assets',
        status: 'active',
        domainsFound: 0
    }
};

// Domain portfolio storage (in production, use a proper database)
let domainPortfolio = [];

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API endpoints for bots
app.get('/api/bots', (req, res) => {
    res.json(BOTS);
});

app.get('/api/bots/:botId', (req, res) => {
    const bot = BOTS[req.params.botId];
    if (!bot) {
        return res.status(404).json({ error: 'Bot not found' });
    }
    res.json(bot);
});

// Domain search endpoint
app.post('/api/domain/search', async (req, res) => {
    try {
        const { query, botId } = req.body;
        
        if (!query || !botId) {
            return res.status(400).json({ error: 'Query and botId are required' });
        }
        
        if (!BOTS[botId]) {
            return res.status(400).json({ error: 'Invalid bot ID' });
        }
        
        // Simulate domain search with random results
        const searchResults = await performDomainSearch(query, botId);
        
        res.json({
            query,
            botId,
            results: searchResults,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Domain search error:', error);
        res.status(500).json({ error: 'Domain search failed' });
    }
});

// Domain validation endpoint using WHOIS
app.post('/api/domain/validate', async (req, res) => {
    try {
        const { domain } = req.body;
        
        if (!domain) {
            return res.status(400).json({ error: 'Domain is required' });
        }
        
        const validation = await validateDomain(domain);
        res.json(validation);
        
    } catch (error) {
        console.error('Domain validation error:', error);
        res.status(500).json({ error: 'Domain validation failed' });
    }
});

// Add domain to portfolio
app.post('/api/domain/acquire', async (req, res) => {
    try {
        const { domain, botId, authCode, notes } = req.body;
        
        if (!domain || !botId) {
            return res.status(400).json({ error: 'Domain and botId are required' });
        }
        
        const domainEntry = {
            domain,
            bot: botId,
            status: 'acquired',
            authCode: authCode || 'PENDING',
            acquisitionDate: new Date().toISOString(),
            notes: notes || '',
            legit: true
        };
        
        domainPortfolio.push(domainEntry);
        
        // Update bot stats
        if (BOTS[botId]) {
            BOTS[botId].domainsFound++;
        }
        
        res.json({
            message: 'Domain acquired successfully',
            domain: domainEntry
        });
        
    } catch (error) {
        console.error('Domain acquisition error:', error);
        res.status(500).json({ error: 'Domain acquisition failed' });
    }
});

// Get domain portfolio
app.get('/api/portfolio', (req, res) => {
    res.json({
        domains: domainPortfolio,
        totalDomains: domainPortfolio.length,
        timestamp: new Date().toISOString()
    });
});

// Export portfolio as CSV
app.get('/api/portfolio/export', (req, res) => {
    try {
        const csvWriter = createCsvWriter({
            path: '/tmp/domain_portfolio.csv',
            header: [
                {id: 'domain', title: 'Domain'},
                {id: 'bot', title: 'Bot'},
                {id: 'status', title: 'Status'},
                {id: 'authCode', title: 'AuthCode/TransferKey'},
                {id: 'legit', title: 'Legit'},
                {id: 'acquisitionDate', title: 'AcquisitionDate'},
                {id: 'notes', title: 'Notes'}
            ]
        });
        
        csvWriter.writeRecords(domainPortfolio)
            .then(() => {
                res.download('/tmp/domain_portfolio.csv', 'domain_portfolio.csv', (err) => {
                    if (err) {
                        console.error('CSV download error:', err);
                        res.status(500).json({ error: 'CSV export failed' });
                    }
                });
            })
            .catch(error => {
                console.error('CSV write error:', error);
                res.status(500).json({ error: 'CSV generation failed' });
            });
            
    } catch (error) {
        console.error('Portfolio export error:', error);
        res.status(500).json({ error: 'Portfolio export failed' });
    }
});

// Helper functions
async function performDomainSearch(query, botId) {
    // Simulate domain search results based on bot role
    const extensions = ['.com', '.net', '.org', '.io', '.ai', '.co'];
    const results = [];
    
    for (let i = 0; i < 5; i++) {
        const extension = extensions[Math.floor(Math.random() * extensions.length)];
        const domain = `${query}${i || ''}${extension}`;
        
        results.push({
            domain,
            available: Math.random() > 0.3, // 70% chance of being available
            price: Math.floor(Math.random() * 5000) + 100, // $1-$50 in cents
            registrar: ['GoDaddy', 'Namecheap', 'Google Domains'][Math.floor(Math.random() * 3)],
            botRecommendation: getBotRecommendation(botId)
        });
    }
    
    return results;
}

function getBotRecommendation(botId) {
    const recommendations = {
        nested: 'High potential for sub-domain development',
        hidden: 'Hidden gem with strong SEO potential',
        unexplored: 'Untapped market opportunity',
        unseen: 'Rare asset with growth potential',
        unfound: 'Unique find with premium value'
    };
    
    return recommendations[botId] || 'Good acquisition candidate';
}

async function validateDomain(domain) {
    return new Promise((resolve) => {
        whois.lookup(domain, (err, data) => {
            if (err) {
                resolve({
                    domain,
                    valid: false,
                    available: false,
                    error: 'WHOIS lookup failed',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            
            const available = data.includes('No match') || data.includes('not found');
            const registrar = extractRegistrar(data);
            const expiryDate = extractExpiryDate(data);
            
            resolve({
                domain,
                valid: true,
                available,
                registrar,
                expiryDate,
                whoisData: data.substring(0, 500) + '...', // Truncated for response
                timestamp: new Date().toISOString()
            });
        });
    });
}

function extractRegistrar(whoisData) {
    const registrarMatch = whoisData.match(/Registrar:\s*(.+)/i);
    return registrarMatch ? registrarMatch[1].trim() : 'Unknown';
}

function extractExpiryDate(whoisData) {
    const expiryMatch = whoisData.match(/Expiry Date:\s*(.+)/i) || 
                       whoisData.match(/Expires:\s*(.+)/i);
    return expiryMatch ? expiryMatch[1].trim() : 'Unknown';
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Domjuan Domain Acquisition Platform available at http://localhost:${PORT}`);
});

module.exports = app;