import { AdminStripBar } from './stripbar.js';
import { getUser, logout } from '../../api/admin/auth/login.js';
import { getSystemInfo } from '../../api/admin/dashboard/settings/Systeminfo.js';
import { clearToken } from '../../api/token.js';
import { getSettingsModalHTML, initSettingsModal } from '../../pages/admin/dashboard/settings/EditProfile.js';
import { showToast, updateToast } from '../ToastMessage.js';
import { skeletonText } from '../SkeletonLoading.js';
import { openConfirmDialog } from '../ConfirmDialog.js';
import { animateTabsOnOpen } from '../../provider/animations/StripbarAnimation.js';
import { getTheme, setTheme, getThemeIcon, initTheme } from '../../provider/theme/ThemeProvider.js';

let cachedSystemInfo = null;
let isFetchingSystemInfo = false;

let hamburgerListenerAttached = false;

export function AdminNavbar() {
    const user = getUser() || {};
    const username = user.firstName ? `${user.firstName} ${user.lastName}` : 'Admin';
    const userRole = user.role || 'Admin';
    const roleLabel = userRole === 'Admin' ? 'Admin' : 'Staff';
    const stripBarState = localStorage.getItem('adminStripBarState') || 'collapsed';
    const hamburgerIconClass = stripBarState === 'expanded' ? 'hidden' : '';
    const closeIconClass = stripBarState === 'expanded' ? '' : 'hidden';
    const currentTheme = getTheme();
    const themeIcon = getThemeIcon(currentTheme);
    const profilePhoto = user.profilePhoto || '';

    return `
    <nav class="bg-blue-900 text-white shadow-lg z-50">
        <div class="container mx-auto px-4">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center" id="barangayDisplay">
                    <span class="font-bold text-base sm:text-lg">Barangay Pio del Pilar - ${roleLabel}</span>
                </div>
                <div class="flex items-center space-x-1">
                    <div class="hidden md:flex items-center mr-1">
                        <span class="text-sm mr-2" id="navUsername">Welcome, ${username}</span>
                        <img src="${profilePhoto || 'https://via.placeholder.com/40'}" alt="Profile" class="h-8 w-8 rounded-full object-cover" id="navProfilePhoto">
                    </div>
                    <div class="hidden md:flex items-center space-x-1">
                        <div class="relative">
                            <button id="themeDropdownBtn" class="text-white hover:bg-blue-600 dark:hover:bg-gray-700 p-2 rounded-lg" title="Theme">
                                <i data-lucide="${themeIcon}" class="h-5 w-5"></i>
                            </button>
                            <div id="themeDropdown" class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 hidden z-50">
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
                        <div class="relative">
                            <button id="settingsDropdownBtn" class="text-white hover:bg-blue-600 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors" title="Settings">
                                <i data-lucide="settings" class="h-5 w-5"></i>
                            </button>
                            <div id="settingsDropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden z-50">
                                <button id="settingsBtn" class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                    <i data-lucide="settings" class="h-4 w-4"></i>
                                    Settings
                                </button>
                                <button id="logoutBtn" class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                    <i data-lucide="log-out" class="h-4 w-4"></i>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="md:hidden relative">
                        <button id="mobileMenuBtn" class="text-white hover:bg-blue-600 dark:hover:bg-gray-700 p-2 rounded-lg" title="Menu">
                            <i data-lucide="more-vertical" class="h-5 w-5"></i>
                        </button>
                        <div id="mobileMenuDropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden z-50">
                            <div class="border-b border-gray-200 pb-2 mb-2">
                                <div class="flex items-center px-4 py-2">
                                    <img src="${profilePhoto || 'https://via.placeholder.com/40'}" alt="Profile" class="h-8 w-8 rounded-full object-cover mr-2" id="mobileNavProfilePhoto">
                                    <span class="text-sm text-gray-700" id="mobileNavUsername">Welcome, ${username}</span>
                                </div>
                            </div>
                            <div class="border-b border-gray-200 pb-2 mb-2">
                                <span class="block px-4 py-2 text-xs text-gray-500 uppercase font-semibold">Theme</span>
                                <button data-theme-mobile="light" class="mobile-theme-btn w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                    <i data-lucide="sun" class="h-4 w-4"></i>
                                    Light
                                </button>
                                <button data-theme-mobile="dark" class="mobile-theme-btn w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                    <i data-lucide="moon" class="h-4 w-4"></i>
                                    Dark
                                </button>
                                <button data-theme-mobile="system" class="mobile-theme-btn w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                    <i data-lucide="monitor" class="h-4 w-4"></i>
                                    System
                                </button>
                            </div>
                            <button id="mobileSettingsBtn" class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                <i data-lucide="settings" class="h-4 w-4"></i>
                                Settings
                            </button>
                            <button id="mobileLogoutBtn" class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                <i data-lucide="log-out" class="h-4 w-4"></i>
                                Logout
                            </button>
                        </div>
                    </div>
                    <button id="admin-hamburger-menu" class="text-white hover:bg-blue-600 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                        <span id="admin-hamburger-icon" class="transition-all duration-300 ${hamburgerIconClass}">
                            <i data-lucide="menu" class="h-5 w-5"></i>
                        </span>
                        <span id="admin-close-icon" class="transition-all duration-300 ${closeIconClass}">
                            <i data-lucide="x" class="h-5 w-5"></i>
                        </span>
                    </button>
                </div>
            </div>
        </div>
        ${AdminStripBar()}
    </nav>

    <div id="settingsModalContainer"></div>
    `;
}

export function initAdminNavbar() {
    initTheme();
    
    hamburgerListenerAttached = false;
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    const barangayDisplay = document.getElementById('barangayDisplay');
    const settingsModalContainer = document.getElementById('settingsModalContainer');
    const settingsDropdownBtn = document.getElementById('settingsDropdownBtn');
    const settingsDropdown = document.getElementById('settingsDropdown');
    const themeDropdownBtn = document.getElementById('themeDropdownBtn');
    const themeDropdown = document.getElementById('themeDropdown');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuDropdown = document.getElementById('mobileMenuDropdown');
    const mobileSettingsBtn = document.getElementById('mobileSettingsBtn');

    if (settingsModalContainer) {
        settingsModalContainer.innerHTML = getSettingsModalHTML();
        initSettingsModal();
    }

    if (themeDropdownBtn && themeDropdown) {
        themeDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeDropdown.classList.toggle('hidden');
            if (settingsDropdown) settingsDropdown.classList.add('hidden');
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

    if (settingsDropdownBtn && settingsDropdown) {
        settingsDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsDropdown.classList.toggle('hidden');
            if (themeDropdown) themeDropdown.classList.add('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!settingsDropdownBtn.contains(e.target) && !settingsDropdown.contains(e.target)) {
                settingsDropdown.classList.add('hidden');
            }
        });

        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                settingsDropdown.classList.add('hidden');
                window.location.hash = '#settings-profile';
            });
        }
    }

    async function loadBarangayInfo() {
        if (cachedSystemInfo) {
            const user = getUser() || {};
            const userRole = user.role || 'Admin';
            const roleLabel = userRole === 'Admin' ? 'Admin' : 'Staff';
            const logoHtml = cachedSystemInfo.logoUrl 
                ? `<img src="${cachedSystemInfo.logoUrl}" alt="Logo" class="h-8 w-8 rounded-full mr-2 object-cover">`
                : '';
            barangayDisplay.innerHTML = `${logoHtml}<span class="font-bold text-base sm:text-lg">Barangay ${cachedSystemInfo.barangayName} - ${roleLabel}</span>`;
            return;
        }

        if (isFetchingSystemInfo) {
            return;
        }

        isFetchingSystemInfo = true;
        barangayDisplay.innerHTML = `<div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-full skeleton-shimmer"></div>
            ${skeletonText('w-48', 'h-6')}
        </div>`;
        
        try {
            const systemInfo = await getSystemInfo();
            if (systemInfo && systemInfo.barangayName) {
                cachedSystemInfo = systemInfo;
                const user = getUser() || {};
                const userRole = user.role || 'Admin';
                const roleLabel = userRole === 'Admin' ? 'Admin' : 'Staff';
                const logoHtml = systemInfo.logoUrl 
                    ? `<img src="${systemInfo.logoUrl}" alt="Logo" class="h-8 w-8 rounded-full mr-2 object-cover">`
                    : '';
                barangayDisplay.innerHTML = `${logoHtml}<span class="font-bold text-base sm:text-lg">Barangay ${systemInfo.barangayName} - ${roleLabel}</span>`;
            }
        } catch (error) {
            const user = getUser() || {};
            const userRole = user.role || 'Admin';
            const roleLabel = userRole === 'Admin' ? 'Admin' : 'Staff';
            barangayDisplay.innerHTML = `<span class="font-bold text-base sm:text-lg">Barangay Pio del Pilar - ${roleLabel}</span>`;
        } finally {
            isFetchingSystemInfo = false;
        }
    }

    loadBarangayInfo();

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (settingsDropdown) {
                settingsDropdown.classList.add('hidden');
            }
            openConfirmDialog({
                title: 'Confirm Logout',
                message: 'Are you sure you want to logout?',
                confirmText: 'Yes',
                cancelText: 'No',
                type: 'danger',
                onConfirm: async () => {
                    showToast('Logging out...', 'loading');
                    logout();
                    clearToken();
                    updateToast('Logged out successfully!', 'success');
                    setTimeout(() => {
                        window.location.hash = '#adminlogin';
                    }, 1500);
                }
            });
        });
    }

    if (mobileMenuBtn && mobileMenuDropdown) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenuDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenuDropdown.contains(e.target)) {
                mobileMenuDropdown.classList.add('hidden');
            }
        });

        const mobileThemeButtons = mobileMenuDropdown.querySelectorAll('.mobile-theme-btn');
        mobileThemeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedTheme = btn.getAttribute('data-theme-mobile');
                setTheme(selectedTheme);
                mobileMenuDropdown.classList.add('hidden');
                
                const currentTheme = getTheme();
                const newIcon = getThemeIcon(currentTheme);
                if (themeDropdownBtn) {
                    themeDropdownBtn.innerHTML = `<i data-lucide="${newIcon}" class="h-5 w-5"></i>`;
                }
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        });

        if (mobileSettingsBtn) {
            mobileSettingsBtn.addEventListener('click', () => {
                mobileMenuDropdown.classList.add('hidden');
                window.location.hash = '#settings-profile';
            });
        }

        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', () => {
                mobileMenuDropdown.classList.add('hidden');
                openConfirmDialog({
                    title: 'Confirm Logout',
                    message: 'Are you sure you want to logout?',
                    confirmText: 'Yes',
                    cancelText: 'No',
                    type: 'danger',
                    onConfirm: async () => {
                        showToast('Logging out...', 'loading');
                        logout();
                        clearToken();
                        updateToast('Logged out successfully!', 'success');
                        setTimeout(() => {
                            window.location.hash = '#adminlogin';
                        }, 1500);
                    }
                });
            });
        }
    }

    const initHamburgerMenu = () => {
        const hamburgerMenu = document.getElementById('admin-hamburger-menu');
        const tabStrip = document.getElementById('admin-tab-strip');

        if (hamburgerMenu && tabStrip) {
            const hamburgerIcon = document.getElementById('admin-hamburger-icon');
            const closeIcon = document.getElementById('admin-close-icon');
            
            const stripBarState = localStorage.getItem('adminStripBarState') || 'collapsed';
            if (stripBarState === 'expanded') {
                if (hamburgerIcon) hamburgerIcon.classList.add('hidden');
                if (closeIcon) closeIcon.classList.remove('hidden');
            } else {
                if (hamburgerIcon) hamburgerIcon.classList.remove('hidden');
                if (closeIcon) closeIcon.classList.add('hidden');
            }

            if (!hamburgerListenerAttached) {
                hamburgerMenu.addEventListener('click', () => {
                    const currentMaxHeight = window.getComputedStyle(tabStrip).maxHeight;
                    const isExpanded = currentMaxHeight !== '0px' && currentMaxHeight !== 'none';
                    
                    if (isExpanded) {
                        tabStrip.style.maxHeight = '0px';
                        if (hamburgerIcon) hamburgerIcon.classList.remove('hidden');
                        if (closeIcon) closeIcon.classList.add('hidden');
                        localStorage.setItem('adminStripBarState', 'collapsed');
                    } else {
                        tabStrip.style.maxHeight = tabStrip.scrollHeight + 'px';
                        if (hamburgerIcon) hamburgerIcon.classList.add('hidden');
                        if (closeIcon) closeIcon.classList.remove('hidden');
                        localStorage.setItem('adminStripBarState', 'expanded');
                        
                        animateTabsOnOpen();
                    }
                });
                hamburgerListenerAttached = true;
            }
        }
    };

    setTimeout(initHamburgerMenu, 100);
    setTimeout(initHamburgerMenu, 200);
    setTimeout(initHamburgerMenu, 300);

    const scrollLeft = document.getElementById('admin-scroll-left');
    const scrollRight = document.getElementById('admin-scroll-right');
    const tabsContainer = document.getElementById('admin-tabs-container');

    if (scrollLeft && scrollRight && tabsContainer) {
        scrollLeft.addEventListener('click', () => {
            tabsContainer.scrollBy({ left: -200, behavior: 'smooth' });
        });

        scrollRight.addEventListener('click', () => {
            tabsContainer.scrollBy({ left: 200, behavior: 'smooth' });
        });
    }
}
