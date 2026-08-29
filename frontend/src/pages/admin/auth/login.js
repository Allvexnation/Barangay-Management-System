import { login } from '../../../api/admin/auth/login.js';
import API_CONFIG from '../../../api/config.js';
import { initStepForm } from '../../../utils/steps.js';
import { showToast, updateToast } from '../../../components/ToastMessage.js';
import { Button } from '../../../components/buttons/Button.js';
import { skeletonText, skeletonAvatar } from '../../../components/SkeletonLoading.js';
import { initLoginAnimations } from '../../../provider/animations/LoginAnimation.js';
import { getTheme, setTheme, getThemeIcon, initTheme } from '../../../provider/theme/ThemeProvider.js';
import { isTokenValid } from '../../../api/token.js';

const bgImage = new Image();
bgImage.src = 'public/Barangay_Pio_del_Pilar,_Makati_City_63.jpg';

export function renderLoginPage() {
    return `
    <div class="min-h-screen flex items-center justify-center p-4" style="background-image: url('public/Barangay_Pio_del_Pilar,_Makati_City_63.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat;">
        <div class="glass-effect rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
            <div class="absolute top-0 left-0">
                <button id="themeDropdownBtn" class="text-gray-600 hover:text-gray-800 p-2 rounded-lg bg-white/50 backdrop-blur-sm" title="Theme">
                    <i data-lucide="${getThemeIcon(getTheme())}" class="h-5 w-5"></i>
                </button>
                <div id="themeDropdown" class="absolute left-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 hidden z-50">
                    <button data-theme="light" class="theme-btn w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                        <i data-lucide="sun" class="h-4 w-4"></i>
                        Light
                    </button>
                    <button data-theme="dark" class="theme-btn w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                        <i data-lucide="moon" class="h-4 w-4"></i>
                        Dark
                    </button>
                    <button data-theme="system" class="theme-btn w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                        <i data-lucide="monitor" class="h-4 w-4"></i>
                        System
                    </button>
                </div>
            </div>
            <div class="text-center mb-8">
                <div id="barangay-logo-container" class="h-24 w-auto mx-auto mb-4 flex items-center justify-center">
                    ${skeletonAvatar('h-20 w-20')}
                </div>
                <div id="barangay-name-container" class="mb-2 flex justify-center">
                    ${skeletonText('w-64', 'h-8')}
                </div>
                <div id="barangay-location-container" class="flex justify-center">
                    ${skeletonText('w-48', 'h-5')}
                </div>
            </div>

            <form id="loginForm">
                <div data-step="1">
                    <div class="mb-4">
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input type="email" id="email" name="email" required
                            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 transition"
                            placeholder="Enter your email">
                    </div>
                    <div class="flex gap-3">
                        ${Button({
                            text: 'Next',
                            type: 'button',
                            variant: 'blue',
                            dataAction: 'next',
                            className: 'flex-1'
                        })}
                    </div>
                </div>

                <div data-step="2" class="hidden">
                    <div class="mb-4">
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div class="relative">
                            <input type="password" id="password" name="password"
                                class="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 transition"
                                placeholder="Enter your password">
                            <button type="button" id="togglePassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                <svg id="eyeIcon" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                <svg id="eyeOffIcon" class="w-5 h-5 hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.9 0 1.78-.08 2.6-.24"/>
                                    <line x1="2" x2="22" y1="2" y2="22"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        ${Button({
                            text: 'Back',
                            type: 'button',
                            variant: 'secondary',
                            dataAction: 'prev',
                            className: 'flex-1'
                        })}
                        ${Button({
                            text: 'Login',
                            type: 'submit',
                            variant: 'blue',
                            dataAction: 'submit',
                            id: 'loginButton',
                            className: 'flex-1'
                        })}
                    </div>
                </div>
            </form>

            <div class="mt-8 pt-6 border-t border-gray-200 text-center">
                <p class="text-xs text-gray-500">Default credentials:</p>
                <p class="text-xs text-gray-500">Email: admin@barangaypiodelpilar.gov</p>
                <p class="text-xs text-gray-500">Password: Admin123!</p>
            </div>
        </div>
    </div>
    `;
}

export function initAdminLoginPage() {
    if (isTokenValid()) {
        window.location.hash = '#admindashboard';
        return;
    }

    initTheme();
    
    initLoginAnimations();
    
    loadSystemInfo();
    
    initThemeDropdown();
    
    const stepForm = initStepForm(
        'loginForm',
        2,
        (proceed) => {
            const email = document.getElementById('email').value;
            if (!email || !email.includes('@')) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            proceed();
        },
        () => {
        }
    );

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const currentStep = stepForm.getCurrentStep();
            if (currentStep === 1) {
                const nextBtn = document.querySelector('[data-action="next"]');
                if (nextBtn && !nextBtn.classList.contains('hidden')) {
                    e.preventDefault();
                    nextBtn.click();
                }
            } else if (currentStep === 2) {
                const loginButton = document.getElementById('loginButton');
                if (loginButton && !loginButton.classList.contains('hidden')) {
                    e.preventDefault();
                    loginButton.click();
                }
            }
        } else if (e.key === 'ArrowLeft') {
            const prevBtn = document.querySelector('[data-action="prev"]');
            if (prevBtn && !prevBtn.classList.contains('hidden')) {
                e.preventDefault();
                prevBtn.click();
            }
        } else if (e.key === 'ArrowRight') {
            const nextBtn = document.querySelector('[data-action="next"]');
            if (nextBtn && !nextBtn.classList.contains('hidden')) {
                e.preventDefault();
                nextBtn.click();
            }
        }
    });
    
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginButton = document.getElementById('loginButton');
        
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';
        
        showToast('Logging in...', 'loading');
        
        try {
            await login(email, password);
            updateToast('Login successful! Redirecting to dashboard...', 'success');
            setTimeout(() => {
                window.location.hash = '#admindashboard';
            }, 2000);
        } catch (error) {
            updateToast(error.message || 'Login failed. Please try again.', 'error');
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
        }
    });
    
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    const eyeOffIcon = document.getElementById('eyeOffIcon');
    
    togglePassword.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.classList.add('hidden');
            eyeOffIcon.classList.remove('hidden');
        } else {
            passwordInput.type = 'password';
            eyeIcon.classList.remove('hidden');
            eyeOffIcon.classList.add('hidden');
        }
    });

    async function loadSystemInfo() {
        try {
            const response = await fetch(API_CONFIG.ENDPOINTS.SYSTEM_INFO.GET, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.barangayName) {
                    const nameContainer = document.getElementById('barangay-name-container');
                    if (nameContainer) {
                        nameContainer.innerHTML = `<h1 class="text-2xl font-bold text-blue-800 dark:text-white">${data.barangayName}</h1>`;
                    }
                }
                
                if (data.city && data.province) {
                    const locationContainer = document.getElementById('barangay-location-container');
                    if (locationContainer) {
                        locationContainer.innerHTML = `<p class="text-gray-600 mt-2">${data.city}, ${data.province} - Admin Portal</p>`;
                    }
                }
                
                if (data.logoUrl) {
                    const logoContainer = document.getElementById('barangay-logo-container');
                    if (logoContainer) {
                        logoContainer.innerHTML = `<img src="${data.logoUrl}" alt="Barangay Logo" class="h-24 w-auto mx-auto">`;
                    }
                }
            }
        } catch (error) {
            console.log('Could not load system info, using defaults');
            const nameContainer = document.getElementById('barangay-name-container');
            const locationContainer = document.getElementById('barangay-location-container');
            const logoContainer = document.getElementById('barangay-logo-container');
            
            if (nameContainer) {
                nameContainer.innerHTML = `<h1 class="text-2xl font-bold text-blue-800 dark:text-white">Barangay Pio del Pilar</h1>`;
            }
            if (locationContainer) {
                locationContainer.innerHTML = `<p class="text-gray-600 mt-2">Makati City, Metro Manila - Admin Portal</p>`;
            }
            if (logoContainer) {
                logoContainer.innerHTML = '';
            }
        }
    }
    
    function initThemeDropdown() {
        const themeDropdownBtn = document.getElementById('themeDropdownBtn');
        const themeDropdown = document.getElementById('themeDropdown');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        if (themeDropdownBtn && themeDropdown) {
            themeDropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                themeDropdown.classList.toggle('hidden');
            });

            document.addEventListener('click', (e) => {
                if (!themeDropdownBtn.contains(e.target) && !themeDropdown.contains(e.target)) {
                    themeDropdown.classList.add('hidden');
                }
            });

            const themeButtons = themeDropdown.querySelectorAll('.theme-btn');
            themeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const selectedTheme = btn.getAttribute('data-theme');
                    setTheme(selectedTheme);
                    themeDropdown.classList.add('hidden');
                    
                    const currentTheme = getTheme();
                    const newIcon = getThemeIcon(currentTheme);
                    themeDropdownBtn.innerHTML = `<i data-lucide="${newIcon}" class="h-5 w-5"></i>`;
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                });
            });
        }
    }
}
