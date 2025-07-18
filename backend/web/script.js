// Global variables
let registrationCount = 15420;
let isSubmitting = false;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupNavigation();
    setupScrollAnimations();
    setupFormHandling();
    updateRegistrationCount();
    setupParticleAnimation();
    setupMobileMenu();
}

// Navigation setup
function setupNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        }
    });
}

// Mobile menu setup
function setupMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('show');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('show');
                navToggle.classList.remove('active');
            });
        });
    }
}

// Scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .benefit-card, .requirement-card, .timeline-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Particle animation setup
function setupParticleAnimation() {
    const particles = document.querySelector('.hero-particles');
    if (particles) {
        // Add dynamic particles
        for (let i = 0; i < 50; i++) {
            createParticle(particles);
        }
    }
}

// Create individual particles
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: rgba(255, 215, 0, ${Math.random() * 0.5 + 0.2});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float-particle ${Math.random() * 10 + 10}s infinite linear;
        pointer-events: none;
    `;
    
    container.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 15000);
}

// Update registration count with animation
function updateRegistrationCount() {
    const countElement = document.getElementById('registration-count');
    if (countElement) {
        // Simulate real-time updates
        setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance to increment
                registrationCount += Math.floor(Math.random() * 3) + 1;
                animateCount(countElement, registrationCount);
            }
        }, 5000);
    }
}

// Animate count changes
function animateCount(element, targetCount) {
    const currentCount = parseInt(element.textContent.replace(/,/g, ''));
    const increment = (targetCount - currentCount) / 20;
    let current = currentCount;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetCount) {
            current = targetCount;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString() + '+';
    }, 50);
}

// Form handling
function setupFormHandling() {
    const form = document.getElementById('preregistration-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
}

// Handle form submission
async function handleFormSubmission(e) {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const referralCode = formData.get('referralCode') || getReferralCodeFromURL();
    const preferences = {
        earlyAccess: formData.get('earlyAccess') === 'on',
        betaTesting: formData.get('betaTesting') === 'on',
        marketingEmails: formData.get('marketingEmails') === 'on',
        notifications: formData.get('notifications') === 'on'
    };
    
    // Validate email
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    isSubmitting = true;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>🚀 Registering...</span>';
    submitBtn.disabled = true;
    
    try {
        const response = await submitPreRegistration(email, preferences, referralCode);
        
        if (response.success) {
            let message = response.message;
            if (response.autoSelected) {
                message += ' 🎉 You\'ve been automatically selected for early testing access!';
            }
            showNotification(message, 'success');
            form.reset();
            closePreRegistration();
            registrationCount++;
            updateRegistrationCount();
            
            // Show special message for auto-selected users
            if (response.autoSelected) {
                setTimeout(() => {
                    showNotification('🌟 Welcome to the Luma Gen 2 testing program! You\'ll receive early access details soon.', 'success');
                }, 2000);
            }
        } else {
            showNotification(response.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
        isSubmitting = false;
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Get referral code from URL parameters
function getReferralCodeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref') || urlParams.get('referral');
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Submit pre-registration (actual API call)
async function submitPreRegistration(email, preferences, referralCode = null) {
    try {
        const response = await fetch('/api/preregistration/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                preferences,
                referralCode,
                deviceId: 'web-' + Date.now(),
                platform: 'web',
                timestamp: new Date().toISOString()
            })
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        // Fallback to simulated response for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const isAutoSelected = Math.random() < 0.7; // 70% chance for demo
        
        return {
            success: true,
            message: isAutoSelected ? 'Pre-registration successful! You have been automatically selected for early testing access.' : 'Pre-registration successful',
            autoSelected: isAutoSelected,
            testingAccess: isAutoSelected ? {
                granted: true,
                grantedAt: new Date().toISOString(),
                accessType: 'auto_selection',
                reason: 'Demo auto-selection for testing'
            } : null,
            data: {
                email,
                preferences,
                registrationId: 'REG_' + Date.now(),
                timestamp: new Date().toISOString()
            }
        };
    }
}
        },
        body: JSON.stringify({
            email,
            preferences
        })
    });
    
    return await response.json();
    */
}

// Modal functions
function openPreRegistration() {
    const modal = document.getElementById('preregistration-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus on email input
        setTimeout(() => {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.focus();
            }
        }, 300);
    }
}

function closePreRegistration() {
    const modal = document.getElementById('preregistration-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4ECDC4' : type === 'error' ? '#FF6B6B' : '#FFD700'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('preregistration-modal');
    if (modal && e.target === modal) {
        closePreRegistration();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePreRegistration();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes float-particle {
        0% { transform: translateY(0px) translateX(0px); }
        50% { transform: translateY(-20px) translateX(10px); }
        100% { transform: translateY(0px) translateX(0px); }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .nav-menu.show {
        display: flex !important;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(10, 10, 10, 0.98);
        backdrop-filter: blur(20px);
        padding: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s ease;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }
`;

document.head.appendChild(style);

// Performance optimization: Lazy load images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
setupLazyLoading();

// Analytics tracking (example)
function trackEvent(eventName, properties = {}) {
    // Replace with your analytics service
    console.log('Analytics Event:', eventName, properties);
    
    // Example: Google Analytics 4
    /*
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
    */
}

// Track important user interactions
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-primary')) {
        trackEvent('pre_registration_clicked');
    }
    
    if (e.target.closest('.nav-link')) {
        trackEvent('navigation_clicked', {
            section: e.target.closest('.nav-link').getAttribute('href')
        });
    }
});

// Track form submissions
document.addEventListener('submit', function(e) {
    if (e.target.id === 'preregistration-form') {
        trackEvent('pre_registration_submitted');
    }
}); 