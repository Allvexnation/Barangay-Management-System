import { renderLoginPage, initAdminLoginPage } from './src/pages/admin/auth/login.js';
import { renderDashboardPage, initAdminDashboardPage } from './src/pages/admin/dashboard/dashboard.js';
import { renderHouseholdPage, initHouseholdPage } from './src/pages/admin/dashboard/household.js';
import { renderOfficialsPage, initOfficialsPage } from './src/pages/admin/dashboard/Officials.js';
import { renderClearancePage, initClearancePage } from './src/pages/admin/dashboard/clearance.js';
import { renderComplaintsPage, initComplaintsPage } from './src/pages/admin/dashboard/complaints.js';
import { renderUsersPage, initUsersPage } from './src/pages/admin/dashboard/users.js';
import { Settings, initSettingsPage } from './src/pages/admin/dashboard/settings/Settings.js';
import { initStripBarDropdowns } from './src/components/admin/stripbar.js';
import { loadFavicon, updatePageTitle } from './src/api/web/web.js';

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'index.css';
document.head.appendChild(link);

export class App {
    constructor(root) {
        this.root = root;

        loadFavicon();

        this.routes = {
            '': renderLoginPage,
            '#login': renderLoginPage,
            '#home': renderLoginPage,
            '#adminlogin': renderLoginPage,
            '#admindashboard': renderDashboardPage,
            '#household': renderHouseholdPage,
            '#officials': renderOfficialsPage,
            '#clearance-individual': renderClearancePage,
            '#clearance-business': renderClearancePage,
            '#complaints': renderComplaintsPage,
            '#users': renderUsersPage,
            '#settings-barangay': Settings,
            '#settings-positions': Settings,
            '#settings-purok': Settings,
            '#settings-profile': Settings,
            '#edit-profile': Settings,
            '#settings': Settings
        };
        this.initFunctions = {
            '': initAdminLoginPage,
            '#login': initAdminLoginPage,
            '#home': initAdminLoginPage,
            '#adminlogin': initAdminLoginPage,
            '#admindashboard': initAdminDashboardPage,
            '#household': initHouseholdPage,
            '#officials': initOfficialsPage,
            '#clearance-individual': initClearancePage,
            '#clearance-business': initClearancePage,
            '#complaints': initComplaintsPage,
            '#users': initUsersPage,
            '#settings-barangay': initSettingsPage,
            '#settings-positions': initSettingsPage,
            '#settings-purok': initSettingsPage,
            '#settings-profile': initSettingsPage,
            '#edit-profile': initSettingsPage,
            '#settings': initSettingsPage
        };

        this.tabNames = {
            '': 'Login',
            '#login': 'Login',
            '#home': 'Login',
            '#adminlogin': 'Login',
            '#admindashboard': 'Dashboard',
            '#household': 'Household',
            '#officials': 'Officials',
            '#clearance-individual': 'Individual Clearance',
            '#clearance-business': 'Business Clearance',
            '#complaints': 'Complaints',
            '#users': 'Users',
            '#settings-barangay': 'Barangay Info',
            '#settings-positions': 'Official Positions',
            '#settings-purok': 'Purok List',
            '#settings-profile': 'Account Settings',
            '#edit-profile': 'Account Settings',
            '#settings': 'Account Settings'
        };

        window.addEventListener('hashchange', () => this.render());
    }

    getCurrentRoute() {
        return window.location.hash || '';
    }

    render() {
        const route = this.getCurrentRoute();
        const pageComponent = this.routes[route] || this.routes[''];

        this.root.innerHTML = pageComponent();

        const tabName = this.tabNames[route] || null;
        updatePageTitle(tabName, route);

        if (route !== '' && route !== '#login' && route !== '#home' && route !== '#adminlogin') {
            requestAnimationFrame(() => {
                initStripBarDropdowns();
            });
        }

        const initFunction = this.initFunctions[route] || this.initFunctions[''];
        if (initFunction) {
            initFunction();
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
}
