export function initLoginAnimations() {
    const loginCard = document.querySelector('.glass-effect');
    if (loginCard) {
        loginCard.classList.add('login-animate-scale-in');
    }

    const logoSection = document.querySelector('.text-center');
    if (logoSection) {
        logoSection.classList.add('login-animate-fade-in-up', 'login-stagger-1');
    }

    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput) {
        emailInput.parentElement.classList.add('login-animate-fade-in-up', 'login-stagger-2');
    }

    const passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) {
        passwordInput.parentElement.classList.add('login-animate-fade-in-up', 'login-stagger-3');
    }

    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.classList.add('login-animate-fade-in-up', 'login-stagger-4');
    }

    const signupLink = document.querySelector('.text-center.mt-6');
    if (signupLink) {
        signupLink.classList.add('login-animate-fade-in', 'login-stagger-5');
    }
}