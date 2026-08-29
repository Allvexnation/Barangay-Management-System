export const ANIMATION_CONFIG = {
    duration: 500,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    stagger: 75,
};

export function fadeIn(element, delay = 0, duration = ANIMATION_CONFIG.duration) {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = `opacity ${duration}ms ${ANIMATION_CONFIG.easing}, transform ${duration}ms ${ANIMATION_CONFIG.easing}`;
    
    requestAnimationFrame(() => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay);
    });
}

export function slideInLeft(element, delay = 0, duration = ANIMATION_CONFIG.duration) {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.transform = 'translateX(-30px)';
    element.style.transition = `opacity ${duration}ms ${ANIMATION_CONFIG.easing}, transform ${duration}ms ${ANIMATION_CONFIG.easing}`;
    
    requestAnimationFrame(() => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        }, delay);
    });
}

export function slideInRight(element, delay = 0, duration = ANIMATION_CONFIG.duration) {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.transform = 'translateX(30px)';
    element.style.transition = `opacity ${duration}ms ${ANIMATION_CONFIG.easing}, transform ${duration}ms ${ANIMATION_CONFIG.easing}`;
    
    requestAnimationFrame(() => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        }, delay);
    });
}

export function scaleIn(element, delay = 0, duration = ANIMATION_CONFIG.duration) {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.transform = 'scale(0.9)';
    element.style.transition = `opacity ${duration}ms ${ANIMATION_CONFIG.easing}, transform ${duration}ms ${ANIMATION_CONFIG.easing}`;
    
    requestAnimationFrame(() => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        }, delay);
    });
}

export function staggerAnimate(elements, animationFn = fadeIn, staggerDelay = ANIMATION_CONFIG.stagger) {
    if (!elements || elements.length === 0) return;
    
    Array.from(elements).forEach((element, index) => {
        animationFn(element, index * staggerDelay);
    });
}

export function animateStatCards(selector = '.rounded-lg') {
    const cards = document.querySelectorAll(selector);
    staggerAnimate(cards, fadeIn, 100);
}

export function animateTableRows(selector = 'tbody tr') {
    const rows = document.querySelectorAll(selector);
    staggerAnimate(rows, slideInLeft, 50);
}

export function animateHeader(selector = 'h1, h2') {
    const headers = document.querySelectorAll(selector);
    staggerAnimate(headers, slideInRight, 0);
}

export function initDashboardAnimations() {
    animateHeader('h1, p.text-sm.text-gray-500');
    
    const primaryStats = document.getElementById('primary-stats');
    if (primaryStats) {
        const cards = primaryStats.querySelectorAll('.rounded-lg');
        staggerAnimate(cards, fadeIn, 100);
    }
    
    const secondaryStats = document.getElementById('secondary-stats');
    if (secondaryStats) {
        const cards = secondaryStats.querySelectorAll('.rounded-lg');
        staggerAnimate(cards, fadeIn, 150);
    }
    
    const tableContainer = document.querySelector('.bg-white.border');
    if (tableContainer) {
        fadeIn(tableContainer, 300);
    }
    
    setTimeout(() => {
        animateTableRows('#recent-activity-table-body tr');
    }, 400);
}

export function addHoverAnimations(selector = '.rounded-lg') {
    const cards = document.querySelectorAll(selector);
    
    cards.forEach(card => {
        card.style.transition = 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-6px)';
            card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });
}

export function animateNumber(element, target, duration = 1000) {
    if (!element) return;
    
    const start = 0;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

export function animateStatNumbers() {
    const statElements = document.querySelectorAll('[id^="total-"], [id^="pending-"]');
    
    statElements.forEach(element => {
        const target = parseInt(element.textContent) || 0;
        if (target > 0) {
            animateNumber(element, target, 800);
        }
    });
}
