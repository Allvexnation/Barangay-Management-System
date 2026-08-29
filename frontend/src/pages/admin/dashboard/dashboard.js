import { getUser, logout } from '../../../api/admin/auth/login.js';
import { checkAuthAndRedirect } from '../../../api/token.js';
import { AdminNavbar, initAdminNavbar } from '../../../components/admin/navbar.js';
import { getDashboardStats, getRecentAuditLogs } from '../../../api/admin/dashboard/dashboard.js';
import { skeletonTableRows, skeletonStatCard } from '../../../components/SkeletonLoading.js';
import { initDashboardAnimations, addHoverAnimations, animateStatNumbers, animateTableRows } from '../../../provider/animations/DashboardAnimation.js';
import { initTheme } from '../../../provider/theme/ThemeProvider.js';
import { showAuditLogDetails } from '../../../components/modal/DashboardModal.js';

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Magandang Umaga';
    if (hour < 18) return 'Magandang Hapon';
    return 'Magandang Gabi';
}

function formatDate() {
    return new Date().toLocaleDateString('en-PH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function renderDashboardPage() {
    if (!checkAuthAndRedirect()) {
        return '';
    }

    const user = getUser();
    const displayName = user?.firstName || 'Admin';

    return `
        <div class="min-h-screen bg-gray-50" style="overflow: auto;">
            ${AdminNavbar()}

            <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div class="mb-6">
                    <h1 class="text-2xl font-semibold text-gray-900">${getGreeting()}, ${displayName}</h1>
                    <p class="text-sm text-gray-500 mt-1">${formatDate()}</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4" id="primary-stats">
                    ${skeletonStatCard('primary')}
                    ${skeletonStatCard('primary')}
                    ${skeletonStatCard('primary')}
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" id="secondary-stats">
                    ${skeletonStatCard('secondary')}
                    ${skeletonStatCard('secondary')}
                    ${skeletonStatCard('secondary')}
                </div>

                <div class="bg-white border border-gray-200 rounded-lg">
                    <div class="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="text-base font-semibold text-gray-900">Recent Activity</h2>
                        <div class="flex items-center gap-3">
                            <div class="flex items-center gap-1">
                                <button onclick="changePage(-1)" class="px-2 py-1 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" id="prev-page-btn">
                                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                                </button>
                                <span class="text-sm text-gray-900 dark:text-gray-300" id="page-info">Page 1</span>
                                <button onclick="changePage(1)" class="px-2 py-1 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" id="next-page-btn">
                                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                                </button>
                            </div>
                            <button onclick="refreshRecentActivity()" class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                                <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                                Refresh
                            </button>
                        </div>
                    </div>
                    <div class="overflow-x-auto max-h-96 overflow-y-auto">
                        <table class="w-full text-sm">
                            <thead class="sticky top-0 bg-gray-50 z-10">
                                <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <th class="px-5 py-3">Entity</th>
                                    <th class="px-5 py-3">Action</th>
                                    <th class="px-5 py-3">Details</th>
                                    <th class="px-5 py-3">User</th>
                                    <th class="px-5 py-3 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100" id="recent-activity-table-body">
                                ${skeletonTableRows(5, 5)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    `;
}

function buildRecentActivityRows(auditLogs) {
    if (!auditLogs || auditLogs.length === 0) {
        return `
            <tr>
                <td class="px-5 py-3 text-gray-500 text-center" colspan="5">
                    No recent activity found.
                </td>
            </tr>
        `;
    }

    function formatPreviewValue(value) {
        if (value === null || value === undefined) return 'N/A';
        
        if (typeof value === 'boolean') {
            if (value === true) {
                return `<span class="text-green-600">✓</span>`;
            } else {
                return `<span class="text-red-600">✗</span>`;
            }
        }
        
        if (typeof value === 'object') {
            if (value.oldValue !== undefined || value.newValue !== undefined) {
                const oldVal = value.oldValue !== undefined ? formatPreviewValue(value.oldValue) : 'N/A';
                const newVal = value.newValue !== undefined ? formatPreviewValue(value.newValue) : 'N/A';
                return `${oldVal} → ${newVal}`;
            }
            return '[Object]';
        }
        
        const strValue = String(value);
        return strValue.length > 12 ? strValue.substring(0, 12) + '...' : strValue;
    }

    return auditLogs.map((log, index) => {
        const timestamp = new Date(log.timestamp).toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const entityType = log.entityType || 'System';
        const displayEntityType = entityType
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .replace(/^./, str => str.toUpperCase());

        const action = (log.action || 'Unknown').toLowerCase();
        let actionColorClass = 'text-gray-700 dark:text-gray-300';
        let actionBgStyle = 'background-color: #f3f4f6;';
        let actionBgClass = '';

        if (action.includes('create') || action.includes('add') || action.includes('insert')) {
            actionColorClass = 'text-green-700 dark:text-green-400';
            actionBgStyle = 'background-color: rgba(34, 197, 94, 0.15);';
        } else if (action.includes('update') || action.includes('edit') || action.includes('modify')) {
            actionColorClass = 'text-blue-700 dark:text-blue-400';
            actionBgStyle = 'background-color: rgba(59, 130, 246, 0.15);';
        } else if (action.includes('delete') || action.includes('remove')) {
            actionColorClass = 'text-red-700 dark:text-red-400';
            actionBgStyle = 'background-color: rgba(239, 68, 68, 0.15);';
        } else if (action.includes('view') || action.includes('read') || action.includes('get')) {
            actionColorClass = 'text-purple-700 dark:text-purple-400';
            actionBgStyle = 'background-color: rgba(168, 85, 247, 0.15);';
        }

        let detailsPreview = '';
        let hasDetails = false;
        
        if (log.changes && Object.keys(log.changes).length > 0) {
            hasDetails = true;
            const changeKeys = Object.keys(log.changes).slice(0, 2);
            detailsPreview = changeKeys.map(key => {
                const value = log.changes[key];
                const displayValue = formatPreviewValue(value);
                return `<span class="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded mr-1">${key}: ${displayValue}</span>`;
            }).join('');
        } else if (log.newValues && Object.keys(log.newValues).length > 0) {
            hasDetails = true;
            const newKeys = Object.keys(log.newValues).slice(0, 2);
            detailsPreview = newKeys.map(key => {
                const value = log.newValues[key];
                const displayValue = formatPreviewValue(value);
                return `<span class="inline-block bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded mr-1">${key}: ${displayValue}</span>`;
            }).join('');
        } else if (log.previousValues && Object.keys(log.previousValues).length > 0) {
            hasDetails = true;
            const prevKeys = Object.keys(log.previousValues).slice(0, 2);
            detailsPreview = prevKeys.map(key => {
                const value = log.previousValues[key];
                const displayValue = formatPreviewValue(value);
                return `<span class="inline-block bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded mr-1">${key}: ${displayValue}</span>`;
            }).join('');
        } else {
            detailsPreview = '<span class="text-gray-400 text-xs">No details</span>';
        }

        window.auditLogsData = window.auditLogsData || {};
        window.auditLogsData[index] = log;

        return `
            <tr class="hover:bg-gray-50 cursor-pointer" onclick="showAuditLogDetails(${index})">
                <td class="px-5 py-3 text-gray-700">
                    <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">${displayEntityType}</span>
                </td>
                <td class="px-5 py-3">
                    <span class="inline-block px-2 py-1 rounded text-xs font-medium ${actionColorClass}" style="${actionBgStyle}">${log.action || 'Unknown action'}</span>
                </td>
                <td class="px-5 py-3 text-gray-600">
                    ${hasDetails ? '<span class="text-blue-600 text-xs hover:underline">View details</span>' : '<span class="text-gray-400 text-xs">No details</span>'}
                </td>
                <td class="px-5 py-3 text-gray-600 text-xs">
                    <div class="flex flex-col">
                        <span class="font-medium text-gray-900">${log.adminName || 'Unknown'}</span>
                        <span class="text-gray-400">${log.role || log.adminRole || 'N/A'}</span>
                    </div>
                </td>
                <td class="px-5 py-3 text-right text-gray-500 text-xs">${timestamp}</td>
            </tr>
        `;
    }).join('');
}

window.showAuditLogDetails = showAuditLogDetails;
let currentPage = 1;
let pageSize = 10;
let totalCount = 0;

async function refreshRecentActivity() {
    await loadRecentActivity(currentPage);
}

async function changePage(delta) {
    const newPage = currentPage + delta;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    if (newPage < 1 || newPage > totalPages) return;
    
    currentPage = newPage;
    await loadRecentActivity(currentPage);
}

async function loadRecentActivity(page) {
    const tableBody = document.getElementById('recent-activity-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = skeletonTableRows(5, 5);

    try {
        const response = await getRecentAuditLogs(page, pageSize);
        const auditLogs = response.logs || [];
        totalCount = response.totalCount || 0;
        currentPage = response.page || 1;
        
        tableBody.innerHTML = buildRecentActivityRows(auditLogs);
        
        updatePaginationUI();
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        animateTableRows('#recent-activity-table-body tr');
    } catch (error) {
        console.error('Error loading recent activity:', error);
        tableBody.innerHTML = `
            <tr>
                <td class="px-5 py-3 text-gray-500 text-center" colspan="5">
                    Unable to load data. Please try again later.
                </td>
            </tr>
        `;
    }
}

function updatePaginationUI() {
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    if (pageInfo) {
        const totalPages = Math.ceil(totalCount / pageSize);
        pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        const totalPages = Math.ceil(totalCount / pageSize);
        nextBtn.disabled = currentPage >= totalPages || totalPages === 0;
    }
}

window.refreshRecentActivity = refreshRecentActivity;
window.changePage = changePage;

export async function initAdminDashboardPage() {
    initTheme();
    initAdminNavbar();

    try {
        const stats = await getDashboardStats();

        const primaryStats = document.getElementById('primary-stats');
        if (primaryStats) {
            const householdImageUrl = 'public/Barangay_Pio_del_Pilar,_Makati_City_63.jpg';
            const residentsImageUrl = 'public/Arnaiz_Avenue_Barangays_Pio_Pilar_School_Makati_City.jpg';
            const officialsImageUrl = 'public/Barangay_Pio_del_Pilar,_Makati_City_2.jpg';
            
            primaryStats.innerHTML = `
                <a href="#household" class="block rounded-lg p-5 text-white hover:bg-blue-800 transition-colors relative overflow-hidden" style="background-image: url('${householdImageUrl}'); background-size: cover; background-position: center;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(30, 58, 138, 0.7); z-index: 0;"></div>
                    <div class="flex items-center justify-between relative z-10">
                        <div>
                            <p class="text-blue-200 text-xs font-medium uppercase tracking-wide">Households</p>
                            <p class="text-3xl font-bold mt-1" id="total-households">${stats.totalHouseholds}</p>
                        </div>
                        <i data-lucide="home" class="w-8 h-8 text-blue-300 opacity-60"></i>
                    </div>
                </a>
                <div class="rounded-lg p-5 text-white relative overflow-hidden" style="background-image: url('${residentsImageUrl}'); background-size: cover; background-position: center;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(30, 58, 138, 0.7); z-index: 0;"></div>
                    <div class="flex items-center justify-between relative z-10">
                        <div>
                            <p class="text-blue-200 text-xs font-medium uppercase tracking-wide">Total Residents</p>
                            <p class="text-3xl font-bold mt-1" id="total-residents">${stats.totalResidents}</p>
                        </div>
                        <i data-lucide="users" class="w-8 h-8 text-blue-300 opacity-60"></i>
                    </div>
                </div>
                <a href="#officials" class="block rounded-lg p-5 text-white hover:bg-blue-800 transition-colors relative overflow-hidden" style="background-image: url('${officialsImageUrl}'); background-size: cover; background-position: center;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(30, 58, 138, 0.7); z-index: 0;"></div>
                    <div class="flex items-center justify-between relative z-10">
                        <div>
                            <p class="text-blue-200 text-xs font-medium uppercase tracking-wide">Officials</p>
                            <p class="text-3xl font-bold mt-1" id="total-officials">${stats.totalOfficials}</p>
                        </div>
                        <i data-lucide="badge-check" class="w-8 h-8 text-blue-300 opacity-60"></i>
                    </div>
                </a>
            `;
        }

        const secondaryStats = document.getElementById('secondary-stats');
        if (secondaryStats) {
            secondaryStats.innerHTML = `
                <a href="#users" class="block bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-xs font-medium uppercase tracking-wide">System Users</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1" id="total-users">${stats.totalUsers || 0}</p>
                        </div>
                        <i data-lucide="user-cog" class="w-6 h-6 text-gray-400"></i>
                    </div>
                </a>
                <a href="#complaints" class="block bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-xs font-medium uppercase tracking-wide">Complaints</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1" id="total-complaints">${stats.totalComplaints || 0}</p>
                        </div>
                        <i data-lucide="message-square-warning" class="w-6 h-6 text-gray-400"></i>
                    </div>
                </a>
                <a href="#clearance-individual" class="block bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-xs font-medium uppercase tracking-wide">Pending Requests</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1" id="pending-requests">${stats.pendingRequests || 0}</p>
                        </div>
                        <i data-lucide="clock" class="w-6 h-6 text-gray-400"></i>
                    </div>
                </a>
            `;
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        initDashboardAnimations();
        addHoverAnimations('.rounded-lg');
        animateStatNumbers();

        await loadRecentActivity(1);
    } catch (error) {
        console.error('Error loading dashboard data:', error);

        const tableBody = document.getElementById('recent-activity-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td class="px-5 py-3 text-gray-500 text-center" colspan="5">
                        Unable to load data. Please try again later.
                    </td>
                </tr>
            `;
        }
    }
}