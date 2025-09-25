// Enhanced Stripe configuration with error handling
let stripe = null;
let elements = null;

// Initialize Stripe with comprehensive error handling
if (typeof Stripe !== 'undefined') {
    try {
        stripe = Stripe(window.STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890');
        elements = stripe.elements();
        console.log('Stripe initialized successfully');
    } catch (error) {
        console.error('Stripe initialization failed:', error);
        ToastManager.show('Payment system unavailable. Please try again later.', 'error');
    }
}

// Enhanced card element styling
const cardStyle = {
    base: {
        color: '#32325d',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
            color: '#aab7c4'
        }
    },
    invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
    },
    complete: {
        color: '#4caf50',
        iconColor: '#4caf50'
    }
};

// Create card element with enhanced error handling
let card = null;
if (elements) {
    try {
        card = elements.create('card', { 
            style: cardStyle,
            hidePostalCode: true // Hide postal code for international users
        });
    } catch (error) {
        console.error('Card element creation failed:', error);
        ToastManager.show('Payment form unavailable. Please refresh the page.', 'error');
    }
}

// Enhanced DOM elements and state management
const modal = document.getElementById('payment-modal');
const closeBtn = document.querySelector('.close');
const buyButtons = document.querySelectorAll('.buy-button');
const paymentForm = document.getElementById('payment-form');
const serviceDetails = document.getElementById('service-details');
const cardErrors = document.getElementById('card-errors');
const submitButton = document.getElementById('submit-payment');

let currentService = null;
let currentPrice = null;
let isProcessingPayment = false;

// Enhanced form validation
function validatePaymentForm() {
    const email = document.getElementById('email')?.value;
    const name = document.getElementById('name')?.value;
    
    const errors = {};
    
    if (!email || !ValidationUtils.isValidEmail(email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    if (!name || name.trim().length < 2) {
        errors.name = 'Please enter your full name';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// Enhanced payment processing with better error handling
async function processPayment(event) {
    event.preventDefault();
    
    if (isProcessingPayment) return;
    if (!stripe || !card) {
        ToastManager.show('Payment system not ready. Please refresh the page.', 'error');
        return;
    }
    
    // Validate form
    const validation = validatePaymentForm();
    if (!validation.isValid) {
        ValidationUtils.displayErrors(validation.errors, paymentForm);
        return;
    }
    
    ValidationUtils.clearErrors(paymentForm);
    isProcessingPayment = true;
    LoadingManager.show(submitButton, 'Processing Payment...');
    
    try {
        // Create payment intent
        const response = await fetch('/api/payments/create-payment-intent', {
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
            const errorData = await response.json();
            throw new Error(errorData.error || 'Payment creation failed');
        }
        
        const { clientSecret } = await response.json();
        
        // Confirm payment
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
                billing_details: {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                }
            }
        });
        
        if (stripeError) {
            throw new Error(stripeError.message);
        }
        
        if (paymentIntent.status === 'succeeded') {
            // Payment successful
            ToastManager.show('Payment successful! Thank you for your purchase.', 'success');
            trackEvent('payment_success', {
                service: currentService,
                amount: currentPrice,
                paymentIntentId: paymentIntent.id
            });
            
            // Reset form and close modal
            paymentForm.reset();
            card.clear();
            closeModal();
            
            // Optionally redirect or show success page
            setTimeout(() => {
                window.location.href = '/thank-you';
            }, 2000);
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        ToastManager.show(error.message || 'Payment failed. Please try again.', 'error');
        trackEvent('payment_error', {
            service: currentService,
            error: error.message
        });
    } finally {
        isProcessingPayment = false;
        LoadingManager.hide(submitButton);
    }
}

// Enhanced modal management
function openModal(service, price) {
    currentService = service;
    currentPrice = price;
    
    // Update modal content
    const serviceInfo = getServiceInfo(service);
    if (serviceDetails && serviceInfo) {
        serviceDetails.innerHTML = `
            <h3 class="text-xl font-semibold mb-2">${serviceInfo.name}</h3>
            <p class="text-gray-600 mb-4">${serviceInfo.description}</p>
            <p class="text-2xl font-bold text-blue-600">${formatCurrency(price)}</p>
        `;
    }
    
    // Show modal with animation
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('fade-in');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 100);
    
    trackEvent('modal_opened', { service, price });
}

function closeModal() {
    if (modal) {
        modal.classList.add('fade-out');
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('fade-in', 'fade-out');
            document.body.style.overflow = ''; // Restore scrolling
        }, 300);
    }
    
    // Clear form errors
    if (paymentForm) {
        ValidationUtils.clearErrors(paymentForm);
    }
    
    currentService = null;
    currentPrice = null;
    isProcessingPayment = false;
}

// Enhanced service information retrieval
function getServiceInfo(serviceId) {
    const services = {
        website: {
            name: 'Website Development',
            description: 'Custom website development tailored to your needs',
            price: 50000
        },
        ecommerce: {
            name: 'E-commerce Solutions',
            description: 'Complete e-commerce platform with payment processing',
            price: 120000
        },
        consultation: {
            name: 'Consultation',
            description: 'One-on-one consultation session with our experts',
            price: 10000
        }
    };
    
    return services[serviceId];
}

// Enhanced initialization
document.addEventListener('DOMContentLoaded', function() {
    // Mount card element with error handling
    if (card) {
        const cardElement = document.getElementById('card-element');
        if (cardElement) {
            card.mount('#card-element');
            
            // Enhanced card validation
            card.on('change', ({error, complete}) => {
                const displayError = document.getElementById('card-errors');
                if (error) {
                    displayError.textContent = error.message;
                    displayError.style.display = 'block';
                } else {
                    displayError.textContent = '';
                    displayError.style.display = 'none';
                }
                
                // Update submit button state
                if (submitButton) {
                    submitButton.disabled = !complete || isProcessingPayment;
                }
            });
            
            card.on('ready', () => {
                console.log('Card element ready');
            });
        }
    }
    
    // Attach event listeners with error handling
    try {
        // Buy button event listeners
        buyButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const service = this.dataset.service;
                const price = parseInt(this.dataset.price);
                
                if (service && price) {
                    openModal(service, price);
                } else {
                    ToastManager.show('Service information unavailable', 'error');
                }
            });
        });
        
        // Modal close events
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }
        
        // Payment form submission
        if (paymentForm) {
            paymentForm.addEventListener('submit', processPayment);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal && modal.style.display === 'block') {
                closeModal();
            }
        });
        
    } catch (error) {
        console.error('Event listener setup failed:', error);
    }
    
    // Initialize accessibility features
    initializeAccessibility();
    
    // Initialize intersection observer for animations
    initializeAnimations();
    
    console.log('Enhanced payment system initialized');
});

// Accessibility enhancements
function initializeAccessibility() {
    // Add ARIA labels and roles
    const buyButtons = document.querySelectorAll('.buy-button');
    buyButtons.forEach((button, index) => {
        button.setAttribute('aria-label', `Purchase ${button.dataset.service} service`);
        button.setAttribute('role', 'button');
    });
    
    // Focus management for modal
    if (modal) {
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modal-title');
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab' && modal && modal.style.display === 'block') {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        }
    });
}

// Enhanced animations
function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    const animatedElements = document.querySelectorAll('section, .card, .feature-item');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Enhanced analytics tracking
function trackEvent(eventName, eventData = {}) {
    try {
        // Console logging for development
        console.log('Analytics Event:', eventName, eventData);
        
        // Google Analytics 4 (gtag)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                ...eventData,
                event_category: 'payment',
                event_label: eventData.service || 'unknown'
            });
        }
        
        // Custom analytics endpoint
        if (window.ANALYTICS_ENABLED) {
            fetch('/api/analytics/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: eventName,
                    data: eventData,
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    userAgent: navigator.userAgent
                })
            }).catch(err => console.warn('Analytics tracking failed:', err));
        }
        
    } catch (error) {
        console.warn('Analytics tracking error:', error);
    }
}

// Enhanced utility functions
function formatCurrency(cents) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(cents / 100);
}

// Form field enhancements
function setupFormEnhancements() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"]');
    
    inputs.forEach(input => {
        // Add floating labels
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentNode.classList.remove('focused');
            }
        });
        
        // Real-time validation
        input.addEventListener('input', function() {
            const field = this.name;
            const value = this.value;
            
            // Clear previous errors
            const errorElement = this.parentNode.querySelector('.validation-error');
            if (errorElement) {
                errorElement.remove();
                this.classList.remove('border-red-500');
            }
            
            // Validate based on field type
            if (field === 'email' && value && !ValidationUtils.isValidEmail(value)) {
                this.classList.add('border-red-500');
            } else if (field === 'name' && value && value.trim().length < 2) {
                this.classList.add('border-red-500');
            } else {
                this.classList.remove('border-red-500');
                this.classList.add('border-green-500');
            }
        });
    });
}

// Contact form handling (enhanced)
function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    const validation = ValidationUtils.validateForm(data, {
        name: { required: true, minlength: 2 },
        email: { required: true, type: 'email' },
        message: { required: true, minlength: 10 }
    });
    
    if (!validation.isValid) {
        ValidationUtils.displayErrors(validation.errors, event.target);
        return;
    }
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    LoadingManager.show(submitButton, 'Sending...');
    
    // Simulate form submission
    setTimeout(() => {
        ToastManager.show('Thank you for your message! We will get back to you soon.', 'success');
        event.target.reset();
        LoadingManager.hide(submitButton);
        trackEvent('contact_form_submitted', { email: data.email });
    }, 1500);
}

// Initialize enhanced features when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFormEnhancements);
} else {
    setupFormEnhancements();
}