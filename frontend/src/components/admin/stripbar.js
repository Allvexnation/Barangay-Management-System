import { isAdmin } from '../../api/token.js';

export function AdminStripBar() {
    const currentHash = window.location.hash || '#admindashboard';
    const stripBarState = localStorage.getItem('adminStripBarState') || 'collapsed';
    const initialMaxHeight = stripBarState === 'expanded' ? '500px' : '0';
    const userIsAdmin = isAdmin();

    const isClearanceActive = currentHash === '#clearance-individual' || currentHash === '#clearance-business';
    const isSettingsActive = currentHash === '#settings-barangay' || currentHash === '#settings-positions' || currentHash === '#settings-purok' || currentHash === '#settings-profile' || currentHash === '#edit-profile' || currentHash === '#settings';

    const activeTabClass = 'bg-blue-50 text-blue-900 font-semibold border-b-2 border-blue-900';
    const inactiveTabClass = 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b-2 border-transparent';
    const inactiveTabNoHoverClass = 'text-gray-600 border-b-2 border-transparent';

    return `
    <div id="admin-tab-strip" class="relative bg-white border-b border-gray-200 w-full left-0 overflow-hidden transition-all duration-300 ease-in-out shadow-sm" style="max-height: ${initialMaxHeight};">
        <div class="container mx-auto px-2 sm:px-4 flex items-center">
            <button id="admin-scroll-left" class="flex-shrink-0 p-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition md:hidden" aria-label="Scroll left">
                <i data-lucide="chevron-left" class="w-4 h-4"></i>
            </button>

            <div id="admin-tabs-container" class="flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide py-0.5" style="-ms-overflow-style: none; scrollbar-width: none;">
                <div class="inline-flex items-center gap-1">
                    <a href="#admindashboard" class="px-3.5 py-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 rounded-t-md ${currentHash === '#admindashboard' ? activeTabClass : inactiveTabClass}">
                        <i data-lucide="layout-dashboard" class="w-4 h-4 ${currentHash === '#admindashboard' ? 'text-blue-900' : 'text-gray-400'}"></i>
                        <span>Dashboard</span>
                    </a>

                    <a href="#household" class="px-3.5 py-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 rounded-t-md ${currentHash === '#household' ? activeTabClass : inactiveTabClass}">
                        <i data-lucide="home" class="w-4 h-4 ${currentHash === '#household' ? 'text-blue-900' : 'text-gray-400'}"></i>
                        <span>Household</span>
                    </a>

                    <a href="#officials" class="px-3.5 py-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 rounded-t-md ${currentHash === '#officials' ? activeTabClass : inactiveTabClass}">
                        <i data-lucide="badge-check" class="w-4 h-4 ${currentHash === '#officials' ? 'text-blue-900' : 'text-gray-400'}"></i>
                        <span>Officials</span>
                    </a>

                    <div class="relative inline-block">
                        <button id="clearance-dropdown-btn" type="button" class="px-3.5 py-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 rounded-t-md ${isClearanceActive ? activeTabClass : inactiveTabClass}">
                            <i data-lucide="file-check" class="w-4 h-4 ${isClearanceActive ? 'text-blue-900' : 'text-gray-400'}"></i>
                            <span>Clearance</span>
                            <i data-lucide="chevron-down" class="w-3.5 h-3.5 transition-transform duration-200 ${isClearanceActive ? 'text-blue-900' : 'text-gray-400'}"></i>
                        </button>
                    </div>

                    <a href="#complaints" class="px-3.5 py-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 rounded-t-md ${currentHash === '#complaints' ? activeTabClass : inactiveTabClass}">
                        <i data-lucide="message-square-warning" class="w-4 h-4 ${currentHash === '#complaints' ? 'text-blue-900' : 'text-gray-400'}"></i>
                        <span>Complaints</span>
                    </a>

                    ${userIsAdmin ? `
                    <a href="#users" class="px-3.5 py-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 rounded-t-md ${currentHash === '#users' ? activeTabClass : inactiveTabClass}">
                        <i data-lucide="users" class="w-4 h-4 ${currentHash === '#users' ? 'text-blue-900' : 'text-gray-400'}"></i>
                        <span>Users</span>
                    </a>
                    ` : ''}

                    <div class="relative inline-block">
                        <button id="settings-dropdown-btn" type="button" class="px-3.5 py-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 rounded-t-md ${isSettingsActive ? activeTabClass : inactiveTabClass}">
                            <i data-lucide="settings" class="w-4 h-4 ${isSettingsActive ? 'text-blue-900' : 'text-gray-400'}"></i>
                            <span>Settings</span>
                            <i data-lucide="chevron-down" class="w-3.5 h-3.5 transition-transform duration-200 ${isSettingsActive ? 'text-blue-900' : 'text-gray-400'}"></i>
                        </button>
                    </div>
                </div>
            </div>

            <button id="admin-scroll-right" class="flex-shrink-0 p-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition md:hidden" aria-label="Scroll right">
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
        </div>
    </div>

    <div id="clearance-dropdown-menu" class="hidden fixed bg-white shadow-xl rounded-lg border border-gray-200/90 py-1.5 z-[99999] min-w-[200px]" style="top: 0; left: 0;">
        <div class="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Clearance Types</div>
        <a href="#clearance-individual" class="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-blue-50/70 hover:text-blue-900 dark:hover:bg-white dark:hover:text-black transition-colors ${currentHash === '#clearance-individual' ? 'bg-blue-50 text-blue-900 font-semibold' : ''}">
            <i data-lucide="user-check" class="w-4 h-4 ${currentHash === '#clearance-individual' ? 'text-blue-900' : 'text-gray-400'}"></i>
            <span>Individual Clearance</span>
        </a>
        <a href="#clearance-business" class="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-blue-50/70 hover:text-blue-900 dark:hover:bg-white dark:hover:text-black transition-colors ${currentHash === '#clearance-business' ? 'bg-blue-50 text-blue-900 font-semibold' : ''}">
            <i data-lucide="building" class="w-4 h-4 ${currentHash === '#clearance-business' ? 'text-blue-900' : 'text-gray-400'}"></i>
            <span>Business Clearance</span>
        </a>
    </div>

    <div id="settings-dropdown-menu" class="hidden fixed bg-white shadow-xl rounded-lg border border-gray-200/90 py-1.5 z-[99999] min-w-[220px]" style="top: 0; left: 0;">
        <div class="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">System Settings</div>
        ${userIsAdmin ? `
        <a href="#settings-barangay" class="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-blue-50/70 hover:text-blue-900 dark:hover:bg-white dark:hover:text-black transition-colors ${currentHash === '#settings-barangay' ? 'bg-blue-50 text-blue-900 font-semibold' : ''}">
            <i data-lucide="info" class="w-4 h-4 ${currentHash === '#settings-barangay' ? 'text-blue-900' : 'text-gray-400'}"></i>
            <span>Barangay / System Info</span>
        </a>
        ` : ''}
        <a href="#settings-positions" class="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-blue-50/70 hover:text-blue-900 dark:hover:bg-white dark:hover:text-black transition-colors ${currentHash === '#settings-positions' ? 'bg-blue-50 text-blue-900 font-semibold' : ''}">
            <i data-lucide="shield" class="w-4 h-4 ${currentHash === '#settings-positions' ? 'text-blue-900' : 'text-gray-400'}"></i>
            <span>Official Position List</span>
        </a>
        <a href="#settings-purok" class="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-blue-50/70 hover:text-blue-900 dark:hover:bg-white dark:hover:text-black transition-colors ${currentHash === '#settings-purok' ? 'bg-blue-50 text-blue-900 font-semibold' : ''}">
            <i data-lucide="map-pin" class="w-4 h-4 ${currentHash === '#settings-purok' ? 'text-blue-900' : 'text-gray-400'}"></i>
            <span>Purok List</span>
        </a>
        <a href="#settings-profile" class="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-blue-50/70 hover:text-blue-900 dark:hover:bg-white dark:hover:text-black transition-colors ${currentHash === '#settings-profile' || currentHash === '#edit-profile' ? 'bg-blue-50 text-blue-900 font-semibold' : ''}">
            <i data-lucide="user-cog" class="w-4 h-4 ${currentHash === '#settings-profile' || currentHash === '#edit-profile' ? 'text-blue-900' : 'text-gray-400'}"></i>
            <span>Manage Profile</span>
        </a>
    </div>
    `;
}

let activeDocHandler = null;
let clearanceBtnHandler = null;
let settingsBtnHandler = null;
let hashChangeHandler = null;

function setupDropdown(buttonId, menuId, otherMenuId) {
    const btn = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);
    const otherMenu = document.getElementById(otherMenuId);

    if (!btn || !menu) return;

    if (buttonId === 'clearance-dropdown-btn' && clearanceBtnHandler) {
        btn.removeEventListener('click', clearanceBtnHandler);
    }
    if (buttonId === 'settings-dropdown-btn' && settingsBtnHandler) {
        btn.removeEventListener('click', settingsBtnHandler);
    }

    const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (otherMenu) {
            otherMenu.classList.add('hidden');
        }

        const isCurrentlyHidden = menu.classList.contains('hidden');

        if (isCurrentlyHidden) {
            const rect = btn.getBoundingClientRect();
            menu.style.top = `${rect.bottom + 4}px`;
            
            menu.style.maxWidth = '280px';
            
            if (window.innerWidth < 768) {
                if (buttonId === 'settings-dropdown-btn') {
                    menu.style.left = 'auto';
                    menu.style.right = '10px';
                    menu.style.width = 'auto';
                } else {
                    menu.style.left = `${Math.max(10, rect.left)}px`;
                    menu.style.right = 'auto';
                    menu.style.width = 'auto';
                }
            } else {
                menu.style.right = 'auto';
                const expectedRight = rect.left + menu.offsetWidth;
                if (expectedRight > window.innerWidth - 10) {
                    menu.style.left = `${Math.max(10, window.innerWidth - menu.offsetWidth - 10)}px`;
                } else {
                    menu.style.left = `${rect.left}px`;
                }
            }
            
            menu.classList.remove('hidden');
        } else {
            menu.classList.add('hidden');
        }
    };

    btn.addEventListener('click', handler);

    if (buttonId === 'clearance-dropdown-btn') {
        clearanceBtnHandler = handler;
    } else if (buttonId === 'settings-dropdown-btn') {
        settingsBtnHandler = handler;
    }
}

function scrollToActiveTab() {
    const container = document.getElementById('admin-tabs-container');
    if (!container) return;

    const currentHash = window.location.hash || '#admindashboard';
    
    let activeTab = null;
    const tabs = container.querySelectorAll('a, button');
    
    tabs.forEach(tab => {
        if (tab.tagName === 'A' && tab.getAttribute('href') === currentHash) {
            activeTab = tab;
        } else if (tab.tagName === 'BUTTON') {
            const isClearanceActive = currentHash === '#clearance-individual' || currentHash === '#clearance-business';
            const isSettingsActive = currentHash === '#settings-barangay' || currentHash === '#settings-positions' || currentHash === '#settings-purok' || currentHash === '#settings-profile' || currentHash === '#edit-profile' || currentHash === '#settings';
            
            if (tab.id === 'clearance-dropdown-btn' && isClearanceActive) {
                activeTab = tab;
            } else if (tab.id === 'settings-dropdown-btn' && isSettingsActive) {
                activeTab = tab;
            }
        }
    });

    if (activeTab) {
        activeTab.scrollIntoView({
            behavior: 'auto',
            block: 'nearest',
            inline: 'center'
        });
    }
}

export function initStripBarDropdowns() {
    const clearanceBtn = document.getElementById('clearance-dropdown-btn');
    const clearanceMenu = document.getElementById('clearance-dropdown-menu');
    const settingsBtn = document.getElementById('settings-dropdown-btn');
    const settingsMenu = document.getElementById('settings-dropdown-menu');

    if (activeDocHandler) {
        document.removeEventListener('click', activeDocHandler);
    }

    if (hashChangeHandler) {
        window.removeEventListener('hashchange', hashChangeHandler);
    }

    setupDropdown('clearance-dropdown-btn', 'clearance-dropdown-menu', 'settings-dropdown-menu');
    setupDropdown('settings-dropdown-btn', 'settings-dropdown-menu', 'clearance-dropdown-menu');

    activeDocHandler = (e) => {
        if (clearanceBtn && clearanceMenu && !clearanceBtn.contains(e.target) && !clearanceMenu.contains(e.target)) {
            clearanceMenu.classList.add('hidden');
        }
        if (settingsBtn && settingsMenu && !settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
            settingsMenu.classList.add('hidden');
        }
    };

    document.addEventListener('click', activeDocHandler);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    scrollToActiveTab();

    hashChangeHandler = () => {
        scrollToActiveTab();
        setTimeout(() => {
            initStripBarDropdowns();
        }, 100);
    };
    window.addEventListener('hashchange', hashChangeHandler);
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initStripBarDropdowns();
    }, 300);
});
