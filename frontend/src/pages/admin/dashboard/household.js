import { getAllHouseholds, deleteHousehold, createHousehold, updateHousehold, getHouseholdById } from '../../../api/admin/dashboard/household.js';
import { getUser } from '../../../api/admin/auth/login.js';
import { checkAuthAndRedirect } from '../../../api/token.js';
import { openHouseholdModal, openViewHouseholdModal } from '../../../components/modal/HouseholdModal.js';
import { getAllPuroks } from '../../../api/admin/dashboard/purok.js';
import { AdminNavbar, initAdminNavbar } from '../../../components/admin/navbar.js';
import { printHousehold } from '../../../components/print/HouseholdPrint.js';
import { CrudMenu } from '../../../components/CrudMenu.js';
import { openConfirmDialog } from '../../../components/ConfirmDialog.js';
import { showToast, updateToast } from '../../../components/ToastMessage.js';
import { openExportExcelModal } from '../../../components/modal/ExportExcelModal.js';
import { skeletonTableRows } from '../../../components/SkeletonLoading.js';
import { initHouseholdAnimations, addTableRowHoverAnimations, addButtonHoverAnimations, animateTableRows, animateAvatars, animateSearchInput } from '../../../provider/animations/HouseholdAnimation.js';

let households = [];
let filteredHouseholds = [];
let puroks = [];
let searchQuery = '';
let selectedPurok = '';

export async function renderHouseholdPage() {
    if (!checkAuthAndRedirect()) {
        return '';
    }

    const navbar = await AdminNavbar();

    return `
        <style>
            ::-webkit-scrollbar {
                width: 0px !important;
                height: 0px !important;
                display: none !important;
            }
            ::-webkit-scrollbar-track {
                background: transparent !important;
            }
            ::-webkit-scrollbar-thumb {
                background: transparent !important;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: transparent !important;
            }
            * {
                scrollbar-width: none !important;
                scrollbar-color: transparent transparent !important;
            }
        </style>
        <div class="min-h-screen bg-gray-50" style="overflow: hidden;">
            ${navbar}

            <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 class="text-2xl font-semibold text-gray-900">Households</h1>
                        <p class="text-sm text-gray-500 mt-1">Directory of registered households, residents, and purok assignments.</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button 
                            type="button" 
                            id="exportHouseholdBtn" 
                            class="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition flex items-center justify-center gap-2 shadow-sm">
                            <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
                            <span class="sm:hidden">Export</span>
                            <span class="hidden sm:inline">Export</span>
                        </button>
                        <button 
                            type="button" 
                            id="printBtn" 
                            class="flex-1 sm:flex-none px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition flex items-center justify-center gap-2 shadow-sm">
                            <i data-lucide="printer" class="w-4 h-4 text-gray-500"></i>
                            <span class="sm:hidden">Print</span>
                            <span class="hidden sm:inline">Print Roster</span>
                        </button>
                        <button 
                            type="button" 
                            id="addHouseholdBtn" 
                            class="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center justify-center gap-2 shadow-sm">
                            <i data-lucide="plus" class="w-4 h-4"></i>
                            <span class="sm:hidden">Add</span>
                            <span class="hidden sm:inline">Add Household</span>
                        </button>
                    </div>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                    <div class="flex flex-col sm:flex-row gap-3">
                        <div class="relative flex-1">
                            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
                            <input
                                type="text"
                                id="householdSearch"
                                placeholder="Search by name, house no., or contact…"
                                class="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                        <div class="relative w-full sm:w-48">
                            <select
                                id="purokFilter"
                                class="w-full appearance-none px-3 py-2 pr-8 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 transition cursor-pointer"
                            >
                                <option value="">All Puroks</option>
                            </select>
                            <i data-lucide="chevron-down" class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"></i>
                        </div>
                    </div>
                    <div class="mt-3 flex items-center justify-between">
                        <p class="text-xs text-gray-500" id="householdCount">Loading households…</p>
                    </div>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div id="printArea" class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <th class="px-5 py-3.5 w-12 text-center">#</th>
                                    <th class="px-5 py-3.5">Household Head</th>
                                    <th class="px-5 py-3.5 hidden sm:table-cell">Purok / Location</th>
                                    <th class="px-5 py-3.5 hidden sm:table-cell">House No.</th>
                                    <th class="px-5 py-3.5 hidden sm:table-cell">Contact Number</th>
                                    <th class="px-5 py-3.5 hidden sm:table-cell">Date Registered</th>
                                    <th class="px-5 py-3.5 text-center w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="householdTableBody" class="divide-y divide-gray-100">
                                ${(function() {
                                    const rows = window.innerWidth < 640 ? 3 : 7;
                                    const cols = window.innerWidth < 640 ? 3 : 7;
                                    let skeletonHTML = '';
                                    for (let i = 0; i < rows; i++) {
                                        let cells = '';
                                        for (let j = 0; j < cols; j++) {
                                            const width = j === 0 ? 'w-16' : j === cols - 1 ? 'w-16' : 'w-full';
                                            cells += `
                                                <td class="px-3 sm:px-5 py-2 sm:py-3.5">
                                                    <div class="h-3 ${width} bg-gray-200 rounded animate-pulse"></div>
                                                </td>
                                            `;
                                        }
                                        skeletonHTML += `<tr>${cells}</tr>`;
                                    }
                                    return skeletonHTML;
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export async function initHouseholdPage() {
    await initAdminNavbar();
    await loadPuroks();
    loadHouseholds();

    initHouseholdAnimations();
    addButtonHoverAnimations('button');
    addTableRowHoverAnimations('tbody tr');
    animateSearchInput('#householdSearch');

    document.getElementById('exportHouseholdBtn')?.addEventListener('click', () => {
        openExportExcelModal();
    });

    document.getElementById('printBtn')?.addEventListener('click', () => {
        printHousehold();
    });

    document.getElementById('addHouseholdBtn')?.addEventListener('click', () => {
        openHouseholdModal({
            mode: 'add',
            puroks,
            onSubmit: handleHouseholdSubmit
        });
    });
    document.getElementById('householdSearch')?.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        applyFilters();
    });
    document.getElementById('purokFilter')?.addEventListener('change', (e) => {
        selectedPurok = e.target.value;
        applyFilters();
    });
}

async function loadPuroks() {
    try {
        puroks = await getAllPuroks();
        populatePurokFilter();
    } catch (error) {
        console.error('Error loading puroks:', error);
    }
}

function populatePurokFilter() {
    const select = document.getElementById('purokFilter');
    if (!select || !puroks.length) return;

    const options = puroks.map(p =>
        `<option value="${p.purokId}">${p.purokName}</option>`
    ).join('');

    select.innerHTML = `<option value="">All Puroks</option>${options}`;
}

async function loadHouseholds() {
    const tbody = document.getElementById('householdTableBody');
    if (tbody) {
        const rows = window.innerWidth < 640 ? 3 : 7;
        const cols = window.innerWidth < 640 ? 3 : 7;
        let skeletonHTML = '';
        for (let i = 0; i < rows; i++) {
            let cells = '';
            for (let j = 0; j < cols; j++) {
                const width = j === 0 ? 'w-16' : j === cols - 1 ? 'w-16' : 'w-full';
                cells += `
                    <td class="px-3 sm:px-5 py-2 sm:py-3.5">
                        <div class="h-3 ${width} bg-gray-200 rounded animate-pulse"></div>
                    </td>
                `;
            }
            skeletonHTML += `<tr>${cells}</tr>`;
        }
        tbody.innerHTML = skeletonHTML;
    }

    try {
        households = await getAllHouseholds();
        applyFilters();
    } catch (error) {
        console.error('Error loading households:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-5 py-12 text-center text-gray-500">
                        <i data-lucide="wifi-off" class="w-8 h-8 text-gray-300 mx-auto mb-2"></i>
                        <p class="font-medium text-gray-700">Unable to load households</p>
                        <p class="text-xs mt-1">Please check your connection and try again.</p>
                    </td>
                </tr>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        updateCountLabel(0, 0);
    }
}

function applyFilters() {
    filteredHouseholds = households.filter(h => {
        const matchesSearch = !searchQuery ||
            (h.fullName && h.fullName.toLowerCase().includes(searchQuery)) ||
            (h.houseNo && h.houseNo.toLowerCase().includes(searchQuery)) ||
            (h.contact && h.contact.toLowerCase().includes(searchQuery));

        const matchesPurok = !selectedPurok || h.purokId === selectedPurok;

        return matchesSearch && matchesPurok;
    });

    renderHouseholdTable();
    updateCountLabel(filteredHouseholds.length, households.length);
}

function updateCountLabel(shown, total) {
    const el = document.getElementById('householdCount');
    if (!el) return;

    if (shown === total) {
        el.textContent = `${total} household${total !== 1 ? 's' : ''} total`;
    } else {
        el.textContent = `Showing ${shown} of ${total} household${total !== 1 ? 's' : ''}`;
    }
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name) {
    const colors = [
        'bg-blue-900 text-blue-100',
        'bg-slate-700 text-slate-100',
        'bg-emerald-800 text-emerald-100',
        'bg-indigo-800 text-indigo-100',
        'bg-stone-700 text-stone-100',
        'bg-teal-800 text-teal-100',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function renderHouseholdTable() {
    const tbody = document.getElementById('householdTableBody');
    if (!tbody) return;

    if (filteredHouseholds.length === 0) {
        const message = households.length === 0
            ? 'No households registered yet.'
            : 'No households match your search filter.';

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-5 py-12 text-center">
                    <i data-lucide="home" class="w-10 h-10 text-gray-200 mx-auto mb-2"></i>
                    <p class="text-sm text-gray-500 font-medium">${message}</p>
                    ${households.length === 0 ? '<p class="text-xs text-gray-400 mt-1">Click "Add Household" to add the first record.</p>' : ''}
                </td>
            </tr>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    tbody.innerHTML = filteredHouseholds.map((household, index) => {
        const purok = Array.isArray(puroks) ? puroks.find(p => p.purokId === household.purokId) : null;
        const purokName = purok ? purok.purokName : '—';
        const dateAdded = new Date(household.createdAt).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
        const initials = getInitials(household.fullName);
        const avatarColor = getAvatarColor(household.fullName);
        const hasImage = household.imageUrl && household.imageUrl.trim() !== '';

        return `
        <tr class="cursor-pointer" onclick="viewHousehold('${household.id}')" style="transition: background-color 0.2s;" onmouseover="this.style.backgroundColor = document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.1)'" onmouseout="this.style.backgroundColor = ''">
            <td class="px-3 sm:px-5 py-2 sm:py-3.5 text-xs text-gray-400 text-center font-mono">
                ${index + 1}
            </td>

            <td class="px-3 sm:px-5 py-2 sm:py-3.5">
                <div class="flex items-center gap-2 sm:gap-3">
                    <div class="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full ${avatarColor} flex items-center justify-center text-xs font-semibold overflow-hidden">
                        ${hasImage 
                            ? `<img src="${household.imageUrl}" alt="${household.fullName}" class="w-full h-full object-cover">` 
                            : initials
                        }
                    </div>
                    <div>
                        <p class="text-xs sm:text-sm font-semibold text-gray-900">${household.fullName}</p>
                    </div>
                </div>
            </td>

            <td class="px-5 py-3.5 hidden sm:table-cell">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-900 border border-blue-200">
                    ${purokName}
                </span>
            </td>

            <td class="px-5 py-3.5 text-sm text-gray-600 font-mono text-xs hidden sm:table-cell">
                ${household.houseNo || '—'}
            </td>

            <td class="px-5 py-3.5 text-sm text-gray-600 font-mono text-xs hidden sm:table-cell">
                ${household.contact || '—'}
            </td>

            <td class="px-5 py-3.5 text-xs text-gray-500 hidden sm:table-cell">
                ${dateAdded}
            </td>

            <td class="px-3 sm:px-5 py-2 sm:py-3.5 text-center" onclick="event.stopPropagation()">
                ${CrudMenu({
                    id: household.id,
                    onView: 'viewHousehold',
                    onEdit: 'editHousehold',
                    onDelete: 'confirmDeleteHousehold',
                    deleteLabel: household.fullName
                })}
            </td>
        </tr>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    animateTableRows('#householdTableBody tr');
    animateAvatars('.rounded-full');
}

window.viewHousehold = async (id) => {
    const household = await getHouseholdById(id);
    await openViewHouseholdModal(household, puroks);
};

window.editHousehold = async (id) => {
    const household = await getHouseholdById(id);
    openHouseholdModal({
        mode: 'edit',
        household,
        puroks,
        onSubmit: handleHouseholdSubmit
    });
};

window.confirmDeleteHousehold = (id, name) => {
    openConfirmDialog({
        title: 'Delete Household',
        message: `Are you sure you want to remove ${name} from the household list?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: async () => {
            await deleteHouseholdById(id);
        }
    });
};

async function deleteHouseholdById(id) {
    showToast('Deleting household...', 'loading');
    try {
        await deleteHousehold(id);
        await loadHouseholds();
        updateToast('Household deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting household:', error);
        updateToast('Failed to delete household. Please try again.', 'error');
    }
}

async function handleHouseholdSubmit(id, formData) {
    const loadingMessage = id ? 'Updating household...' : 'Creating household...';
    const successMessage = id ? 'Household updated successfully' : 'Household created successfully';

    showToast(loadingMessage, 'loading');
    try {
        if (id) {
            await updateHousehold(id, formData);
        } else {
            await createHousehold(formData);
        }
        await loadHouseholds();
        updateToast(successMessage, 'success');
    } catch (error) {
        console.error('Error saving household:', error);
        updateToast('Failed to save household. Please try again.', 'error');
        throw error;
    }
}