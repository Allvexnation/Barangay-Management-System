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

export function animateHeader(selector = 'h1, p.text-sm.text-gray-500') {
    const headers = document.querySelectorAll(selector);
    staggerAnimate(headers, slideInRight, 0);
}

export function animateFormSections(selector = '.bg-white.border.rounded-lg') {
    const sections = document.querySelectorAll(selector);
    staggerAnimate(sections, fadeIn, 100);
}

export function animateButtons(selector = 'button') {
    const buttons = document.querySelectorAll(selector);
    staggerAnimate(buttons, scaleIn, 75);
}

export function animateProfilePhoto(selector = '#profilePhotoPreview') {
    const photo = document.querySelector(selector);
    if (photo) {
        scaleIn(photo, 150);
    }
}

export function initEditProfileAnimations() {
    animateHeader('h1, p.text-sm.text-gray-500');
    
    const formSections = document.querySelectorAll('.bg-white.border.rounded-lg.shadow-sm');
    staggerAnimate(formSections, fadeIn, 100);
    
    animateButtons('#saveSettings, #resetProfileBtn');
    
    animateProfilePhoto('#profilePhotoPreview');
}

export function addButtonHoverAnimations(selector = 'button') {
    const buttons = document.querySelectorAll(selector);
    
    buttons.forEach(button => {
        button.style.transition = 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '';
        });
    });
}

export function addCardHoverAnimations(selector = '.bg-white.border.rounded-lg') {
    const cards = document.querySelectorAll(selector);
    
    cards.forEach(card => {
        card.style.transition = 'box-shadow 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });
}

export function addProfilePhotoHoverAnimation(selector = '#profilePhotoPreview') {
    const photo = document.querySelector(selector);
    if (!photo) return;
    
    photo.style.transition = 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    photo.addEventListener('mouseenter', () => {
        photo.style.transform = 'scale(1.05)';
        photo.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
    });
    
    photo.addEventListener('mouseleave', () => {
        photo.style.transform = 'scale(1)';
        photo.style.boxShadow = '';
    });
}
