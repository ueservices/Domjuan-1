// Frontend validation utilities
class ValidationUtils {
    // Email validation
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone number validation (basic)
    static isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // Card number validation using Luhn algorithm
    static isValidCardNumber(cardNumber) {
        const number = cardNumber.replace(/\s/g, '');
        if (!/^\d+$/.test(number)) return false;
        
        let sum = 0;
        let shouldDouble = false;
        
        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number.charAt(i), 10);
            
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        
        return sum % 10 === 0;
    }

    // Expiry date validation
    static isValidExpiryDate(month, year) {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear() % 100;
        
        const expMonth = parseInt(month, 10);
        const expYear = parseInt(year, 10);
        
        if (expMonth < 1 || expMonth > 12) return false;
        if (expYear < currentYear) return false;
        if (expYear === currentYear && expMonth < currentMonth) return false;
        
        return true;
    }

    // CVV validation
    static isValidCVV(cvv, cardType = 'visa') {
        const cvvStr = cvv.toString();
        if (cardType === 'amex') {
            return /^\d{4}$/.test(cvvStr);
        }
        return /^\d{3}$/.test(cvvStr);
    }

    // Form validation helper
    static validateForm(formData, rules) {
        const errors = {};
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];
            
            if (rule.required && (!value || value.trim() === '')) {
                errors[field] = `${field} is required`;
                continue;
            }
            
            if (value && rule.type) {
                switch (rule.type) {
                    case 'email':
                        if (!this.isValidEmail(value)) {
                            errors[field] = 'Please enter a valid email address';
                        }
                        break;
                    case 'phone':
                        if (!this.isValidPhone(value)) {
                            errors[field] = 'Please enter a valid phone number';
                        }
                        break;
                    case 'minlength':
                        if (value.length < rule.minlength) {
                            errors[field] = `${field} must be at least ${rule.minlength} characters`;
                        }
                        break;
                }
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Display validation errors in the UI
    static displayErrors(errors, formElement) {
        // Clear previous errors
        const existingErrors = formElement.querySelectorAll('.validation-error');
        existingErrors.forEach(error => error.remove());
        
        // Display new errors
        for (const [field, message] of Object.entries(errors)) {
            const fieldElement = formElement.querySelector(`[name="${field}"], [data-field="${field}"]`);
            if (fieldElement) {
                const errorElement = document.createElement('div');
                errorElement.className = 'validation-error text-red-500 text-sm mt-1';
                errorElement.textContent = message;
                
                fieldElement.parentNode.appendChild(errorElement);
                fieldElement.classList.add('border-red-500');
            }
        }
    }

    // Clear validation errors
    static clearErrors(formElement) {
        const errorElements = formElement.querySelectorAll('.validation-error');
        errorElements.forEach(error => error.remove());
        
        const fieldElements = formElement.querySelectorAll('.border-red-500');
        fieldElements.forEach(field => field.classList.remove('border-red-500'));
    }
}

// Loading state management
class LoadingManager {
    static show(element, text = 'Loading...') {
        element.disabled = true;
        const originalText = element.textContent;
        element.setAttribute('data-original-text', originalText);
        element.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ${text}
        `;
    }

    static hide(element) {
        element.disabled = false;
        const originalText = element.getAttribute('data-original-text');
        if (originalText) {
            element.textContent = originalText;
            element.removeAttribute('data-original-text');
        }
    }
}

// Toast notification system
class ToastManager {
    static show(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm transform transition-all duration-300 translate-x-full opacity-0`;
        
        const typeClasses = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-black',
            info: 'bg-blue-500 text-white'
        };
        
        toast.classList.add(...typeClasses[type].split(' '));
        
        const icon = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        
        toast.innerHTML = `
            <div class="flex items-center">
                <span class="text-lg mr-2">${icon[type]}</span>
                <span>${message}</span>
                <button class="ml-4 text-lg opacity-70 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.ValidationUtils = ValidationUtils;
    window.LoadingManager = LoadingManager;
    window.ToastManager = ToastManager;
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ValidationUtils, LoadingManager, ToastManager };
}