// Domjuan Domain Acquisition Platform
// Bot management and domain search functionality

// Global state
let bots = {};
let selectedDomain = null;
let portfolio = [];

// DOM elements
const botsGrid = document.getElementById('bots-grid');
const botSelector = document.getElementById('bot-selector');
const domainQuery = document.getElementById('domain-query');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
const portfolioStats = document.getElementById('portfolio-stats');
const portfolioTbody = document.getElementById('portfolio-tbody');
const totalDomainsEl = document.getElementById('total-domains');
const refreshPortfolioBtn = document.getElementById('refresh-portfolio');
const exportPortfolioBtn = document.getElementById('export-portfolio');

// Modals
const domainModal = document.getElementById('domain-modal');
const acquisitionModal = document.getElementById('acquisition-modal');
const domainDetails = document.getElementById('domain-details');
const validateDomainBtn = document.getElementById('validate-domain');
const acquireDomainBtn = document.getElementById('acquire-domain');
const confirmAcquisitionBtn = document.getElementById('confirm-acquisition');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadBots();
    loadPortfolio();
    setupEventListeners();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Setup event listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', performDomainSearch);
    domainQuery.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performDomainSearch();
    });
    
    refreshPortfolioBtn.addEventListener('click', loadPortfolio);
    exportPortfolioBtn.addEventListener('click', exportPortfolio);
    
    validateDomainBtn.addEventListener('click', validateSelectedDomain);
    acquireDomainBtn.addEventListener('click', openAcquisitionModal);
    confirmAcquisitionBtn.addEventListener('click', confirmDomainAcquisition);
    
    // Modal close handlers
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModals);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    // Dynamic event listeners for search results
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('select-domain-btn') && !e.target.disabled) {
            const domainData = e.target.getAttribute('data-domain');
            if (domainData) {
                selectDomain(domainData);
            }
        }
        
        if (e.target.classList.contains('bot-action-btn')) {
            const botId = e.target.getAttribute('data-bot-id');
            if (botId) {
                activateBot(botId);
            }
        }
        
        if (e.target.classList.contains('action-btn')) {
            const domain = e.target.getAttribute('data-domain');
            if (domain) {
                viewDomainDetails(domain);
            }
        }
    });
}

// Load and display bots
async function loadBots() {
    try {
        const response = await fetch('/api/bots');
        if (!response.ok) throw new Error('Failed to load bots');
        
        bots = await response.json();
        displayBots();
        populateBotSelector();
    } catch (error) {
        console.error('Error loading bots:', error);
        showError('Failed to load bot fleet');
    }
}

function displayBots() {
    botsGrid.innerHTML = '';
    
    Object.entries(bots).forEach(([botId, bot]) => {
        const botCard = document.createElement('div');
        botCard.className = 'bot-card';
        botCard.innerHTML = `
            <div class="bot-header">
                <h3>🤖 ${bot.name}</h3>
                <span class="bot-status ${bot.status}">${bot.status}</span>
            </div>
            <p class="bot-description">${bot.description}</p>
            <div class="bot-stats">
                <div class="stat">
                    <span class="stat-label">Role:</span>
                    <span class="stat-value">${bot.role}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Domains Found:</span>
                    <span class="stat-value">${bot.domainsFound}</span>
                </div>
            </div>
            <button class="bot-action-btn" data-bot-id="${botId}">
                ${bot.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
        `;
        botsGrid.appendChild(botCard);
    });
}

function populateBotSelector() {
    botSelector.innerHTML = '<option value="">Select Bot</option>';
    
    Object.entries(bots).forEach(([botId, bot]) => {
        if (bot.status === 'active') {
            const option = document.createElement('option');
            option.value = botId;
            option.textContent = bot.name;
            botSelector.appendChild(option);
        }
    });
}

// Domain search functionality
async function performDomainSearch() {
    const query = domainQuery.value.trim();
    const botId = botSelector.value;
    
    if (!query) {
        showError('Please enter a domain query');
        return;
    }
    
    if (!botId) {
        showError('Please select a bot');
        return;
    }
    
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    searchResults.innerHTML = '<div class="loading">🔍 Bot searching for domains...</div>';
    
    try {
        const response = await fetch('/api/domain/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, botId })
        });
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        displaySearchResults(data.results);
        
    } catch (error) {
        console.error('Search error:', error);
        showError('Domain search failed');
        searchResults.innerHTML = '';
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search Domains';
    }
}

function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No domains found</div>';
        return;
    }
    
    const resultsList = document.createElement('div');
    resultsList.className = 'results-list';
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result.available ? 'available' : 'unavailable'}`;
        resultItem.innerHTML = `
            <div class="result-domain">
                <strong>${result.domain}</strong>
                <span class="availability ${result.available ? 'available' : 'unavailable'}">
                    ${result.available ? 'Available' : 'Unavailable'}
                </span>
            </div>
            <div class="result-details">
                <span class="price">$${(result.price / 100).toFixed(2)}</span>
                <span class="registrar">${result.registrar}</span>
            </div>
            <div class="result-recommendation">${result.botRecommendation}</div>
            <button class="select-domain-btn" data-domain='${JSON.stringify(result).replace(/'/g, '\\\'').replace(/"/g, '&quot;')}' 
                    ${!result.available ? 'disabled' : ''}>
                ${result.available ? 'Select Domain' : 'Unavailable'}
            </button>
        `;
        resultsList.appendChild(resultItem);
    });
    
    searchResults.appendChild(resultsList);
}

// Domain selection and validation
function selectDomain(resultJson) {
    selectedDomain = JSON.parse(resultJson.replace(/&quot;/g, '"'));
    
    domainDetails.innerHTML = `
        <div class="domain-info">
            <h3>${selectedDomain.domain}</h3>
            <div class="domain-meta">
                <p><strong>Price:</strong> $${(selectedDomain.price / 100).toFixed(2)}</p>
                <p><strong>Registrar:</strong> ${selectedDomain.registrar}</p>
                <p><strong>Availability:</strong> <span class="available">Available</span></p>
                <p><strong>Bot Recommendation:</strong> ${selectedDomain.botRecommendation}</p>
            </div>
        </div>
        <div id="validation-results"></div>
    `;
    
    domainModal.style.display = 'block';
}

async function validateSelectedDomain() {
    if (!selectedDomain) return;
    
    validateDomainBtn.disabled = true;
    validateDomainBtn.textContent = 'Validating...';
    
    const validationResults = document.getElementById('validation-results');
    validationResults.innerHTML = '<div class="loading">🔍 Validating domain...</div>';
    
    try {
        const response = await fetch('/api/domain/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: selectedDomain.domain })
        });
        
        if (!response.ok) throw new Error('Validation failed');
        
        const validation = await response.json();
        displayValidationResults(validation);
        
    } catch (error) {
        console.error('Validation error:', error);
        validationResults.innerHTML = '<div class="error">Validation failed</div>';
    } finally {
        validateDomainBtn.disabled = false;
        validateDomainBtn.textContent = 'Validate Domain';
    }
}

function displayValidationResults(validation) {
    const validationResults = document.getElementById('validation-results');
    
    validationResults.innerHTML = `
        <div class="validation-info">
            <h4>WHOIS Validation Results</h4>
            <div class="validation-details">
                <p><strong>Status:</strong> ${validation.available ? 'Available ✅' : 'Registered ❌'}</p>
                <p><strong>Registrar:</strong> ${validation.registrar}</p>
                <p><strong>Expiry:</strong> ${validation.expiryDate}</p>
                <p><strong>Validated:</strong> ${new Date(validation.timestamp).toLocaleString()}</p>
            </div>
            ${validation.whoisData ? `
                <details>
                    <summary>WHOIS Data</summary>
                    <pre class="whois-data">${validation.whoisData}</pre>
                </details>
            ` : ''}
        </div>
    `;
}

// Domain acquisition
function openAcquisitionModal() {
    if (!selectedDomain) return;
    
    const paymentAmount = document.getElementById('payment-amount');
    paymentAmount.innerHTML = `
        <div class="amount-display">
            <span class="fiat-amount">$${(selectedDomain.price / 100).toFixed(2)} USD</span>
            <span class="crypto-rate">≈ 0.00001234 BTC</span>
        </div>
    `;
    
    domainModal.style.display = 'none';
    acquisitionModal.style.display = 'block';
}

async function confirmDomainAcquisition() {
    if (!selectedDomain) return;
    
    const authCode = document.getElementById('auth-code').value;
    const notes = document.getElementById('acquisition-notes').value;
    const botId = botSelector.value;
    
    confirmAcquisitionBtn.disabled = true;
    confirmAcquisitionBtn.textContent = 'Acquiring...';
    
    try {
        const response = await fetch('/api/domain/acquire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                domain: selectedDomain.domain,
                botId,
                authCode,
                notes
            })
        });
        
        if (!response.ok) throw new Error('Acquisition failed');
        
        const result = await response.json();
        showSuccess('Domain acquired successfully!');
        
        closeModals();
        loadPortfolio();
        loadBots(); // Refresh bot stats
        
    } catch (error) {
        console.error('Acquisition error:', error);
        showError('Domain acquisition failed');
    } finally {
        confirmAcquisitionBtn.disabled = false;
        confirmAcquisitionBtn.textContent = 'Confirm Acquisition';
    }
}

// Portfolio management
async function loadPortfolio() {
    try {
        const response = await fetch('/api/portfolio');
        if (!response.ok) throw new Error('Failed to load portfolio');
        
        const data = await response.json();
        portfolio = data.domains;
        displayPortfolio();
        updatePortfolioStats();
        
    } catch (error) {
        console.error('Portfolio loading error:', error);
        showError('Failed to load portfolio');
    }
}

function displayPortfolio() {
    portfolioTbody.innerHTML = '';
    
    if (portfolio.length === 0) {
        portfolioTbody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">No domains in portfolio</td>
            </tr>
        `;
        return;
    }
    
    portfolio.forEach(domain => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="domain-cell">
                <strong>${domain.domain}</strong>
            </td>
            <td>${domain.bot}</td>
            <td>
                <span class="status ${domain.status}">${domain.status}</span>
            </td>
            <td class="auth-code">${domain.authCode}</td>
            <td>${new Date(domain.acquisitionDate).toLocaleDateString()}</td>
            <td>
                <button class="action-btn" data-domain="${domain.domain}">
                    View
                </button>
            </td>
        `;
        portfolioTbody.appendChild(row);
    });
}

function updatePortfolioStats() {
    totalDomainsEl.textContent = portfolio.length;
}

async function exportPortfolio() {
    try {
        const response = await fetch('/api/portfolio/export');
        if (!response.ok) throw new Error('Export failed');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'domain_portfolio.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showSuccess('Portfolio exported successfully');
        
    } catch (error) {
        console.error('Export error:', error);
        showError('Portfolio export failed');
    }
}

// Utility functions
function activateBot(botId) {
    // Toggle bot status (placeholder - in real implementation would call API)
    bots[botId].status = bots[botId].status === 'active' ? 'inactive' : 'active';
    displayBots();
    populateBotSelector();
}

function viewDomainDetails(domain) {
    const domainData = portfolio.find(d => d.domain === domain);
    if (!domainData) return;
    
    alert(`Domain: ${domainData.domain}\nBot: ${domainData.bot}\nStatus: ${domainData.status}\nAcquired: ${new Date(domainData.acquisitionDate).toLocaleString()}\nNotes: ${domainData.notes || 'None'}`);
}

function closeModals() {
    domainModal.style.display = 'none';
    acquisitionModal.style.display = 'none';
    selectedDomain = null;
}

function showError(message) {
    // Simple error display - in production use proper toast/notification system
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ff4444; color: white; padding: 15px; border-radius: 5px; z-index: 10000;';
    document.body.appendChild(errorDiv);
    setTimeout(() => document.body.removeChild(errorDiv), 3000);
}

function showSuccess(message) {
    // Simple success display - in production use proper toast/notification system
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #44aa44; color: white; padding: 15px; border-radius: 5px; z-index: 10000;';
    document.body.appendChild(successDiv);
    setTimeout(() => document.body.removeChild(successDiv), 3000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Initialize animations
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});