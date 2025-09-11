// Stripe configuration
// Replace 'pk_test_...' with your actual Stripe publishable key
const stripe = Stripe(window.STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890');
const elements = stripe.elements();

// Create card element
const style = {
    base: {
        color: '#32325d',
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
            color: '#aab7c4'
        }
    },
    invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
    }
};

const card = elements.create('card', {style: style});

// DOM elements
const modal = document.getElementById('payment-modal');
const closeBtn = document.querySelector('.close');
const buyButtons = document.querySelectorAll('.buy-button');
const paymentForm = document.getElementById('payment-form');
const serviceDetails = document.getElementById('service-details');
const cardErrors = document.getElementById('card-errors');

let currentService = null;
let currentPrice = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mount the card element
    card.mount('#card-element');

    // Handle real-time validation errors from the card Element
    card.on('change', ({error}) => {
        if (error) {
            cardErrors.textContent = error.message;
        } else {
            cardErrors.textContent = '';
        }
    });

    // Add event listeners for buy buttons
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const service = this.getAttribute('data-service');
            const price = this.getAttribute('data-price');
            openPaymentModal(service, price);
        });
    });

    // Close modal when clicking X
    closeBtn.addEventListener('click', closePaymentModal);

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closePaymentModal();
        }
    });

    // Handle payment form submission
    paymentForm.addEventListener('submit', handlePayment);

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

function openPaymentModal(service, price) {
    currentService = service;
    currentPrice = parseInt(price);
    
    const serviceNames = {
        'website': 'Website Development',
        'ecommerce': 'E-commerce Solutions',
        'consultation': 'Consultation'
    };
    
    const serviceName = serviceNames[service] || service;
    const displayPrice = (currentPrice / 100).toFixed(2);
    
    serviceDetails.innerHTML = `
        <h3>${serviceName}</h3>
        <p>Price: $${displayPrice}</p>
    `;
    
    modal.style.display = 'block';
}

function closePaymentModal() {
    modal.style.display = 'none';
    currentService = null;
    currentPrice = null;
    paymentForm.reset();
    cardErrors.textContent = '';
}

async function handlePayment(event) {
    event.preventDefault();
    
    const submitButton = document.getElementById('submit-payment');
    const buttonText = document.getElementById('button-text');
    
    // Disable the submit button and show loading state
    submitButton.disabled = true;
    buttonText.textContent = 'Processing...';
    
    try {
        // Create payment intent on the server
        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service: currentService,
                amount: currentPrice
            })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const {client_secret} = await response.json();
        
        // Confirm the payment
        const result = await stripe.confirmCardPayment(client_secret, {
            payment_method: {
                card: card,
                billing_details: {
                    name: 'Customer' // You can collect this from a form field
                }
            }
        });
        
        if (result.error) {
            // Show error to customer
            cardErrors.textContent = result.error.message;
        } else {
            // Payment succeeded
            alert('Payment successful! Thank you for your purchase.');
            closePaymentModal();
        }
    } catch (error) {
        console.error('Payment error:', error);
        
        // For demo purposes, simulate a successful payment
        // In production, remove this and handle the actual server response
        if (error.message === 'Network response was not ok' || error.message.includes('fetch')) {
            alert('Demo Mode: Payment simulation successful! Thank you for your purchase.');
            closePaymentModal();
        } else {
            cardErrors.textContent = 'An error occurred. Please try again.';
        }
    } finally {
        // Re-enable the submit button
        submitButton.disabled = false;
        buttonText.textContent = 'Pay Now';
    }
}

// Contact form handling (if you add one later)
function handleContactForm(event) {
    event.preventDefault();
    // Handle contact form submission
    alert('Thank you for your message! We will get back to you soon.');
    event.target.reset();
}

// Intersection Observer for animations (optional enhancement)
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

// Observe sections for scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

// Utility function to format currency
function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(cents / 100);
}

// Simple analytics tracking (placeholder)
function trackEvent(eventName, eventData) {
    console.log('Event:', eventName, eventData);
    // Integrate with your analytics service (Google Analytics, etc.)
}