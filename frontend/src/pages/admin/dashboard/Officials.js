import { getAllOfficials, deleteOfficial, createOfficial, updateOfficial, getOfficialById, getPositions } from '../../../api/admin/dashboard/officials.js';
import { getUser } from '../../../api/admin/auth/login.js';
import { checkAuthAndRedirect } from '../../../api/token.js';
import { openOfficialsModal, openViewOfficialsModal } from '../../../components/modal/OfficialsModal.js';
import { AdminNavbar, initAdminNavbar } from '../../../components/admin/navbar.js';
import { printOfficials } from '../../../components/print/OfficialsPrint.js';
import { CrudMenu } from '../../../components/CrudMenu.js';
import { openConfirmDialog } from '../../../components/ConfirmDialog.js';
import { showToast, updateToast } from '../../../components/ToastMessage.js';
import { openExportExcelModal } from '../../../components/modal/ExportExcelModal.js';
import { skeletonTableRows } from '../../../components/SkeletonLoading.js';
import { initOfficialsAnimations, addTableRowHoverAnimations, addButtonHoverAnimations, animateTableRows, animateAvatars, animateSearchInput } from '../../../provider/animations/OfficialsAnimation.js';

let officials = [];
let filteredOfficials = [];
let positions = [];
let searchQuery = '';
let selectedPosition = '';

export function renderOfficialsPage() {
    if (!checkAuthAndRedirect()) {
        return '';
    }

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
            ${AdminNavbar()}

            <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 class="text-2xl font-semibold text-gray-900">Barangay Officials</h1>
                        <p class="text-sm text-gray-500 mt-1">Directory of elected and appointed barangay officials and staff.</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button 
                            type="button" 
                            id="exportBtn" 
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
                            id="addOfficialBtn" 
                            class="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center justify-center gap-2 shadow-sm">
                            <i data-lucide="user-plus" class="w-4 h-4"></i>
                            <span class="sm:hidden">Add</span>
                            <span class="hidden sm:inline">Add Official</span>
                        </button>
                    </div>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                    <div class="flex flex-col sm:flex-row gap-3">
                        <div class="relative flex-1">
                            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
                            <input
                                type="text"
                                id="officialSearch"
                                placeholder="Search by name, position, or contact…"
                                class="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                        <div class="relative w-full sm:w-48">
                            <select
                                id="positionFilter"
                                class="w-full appearance-none px-3 py-2 pr-8 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 transition cursor-pointer"
                            >
                                <option value="">All Positions</option>
                            </select>
                            <i data-lucide="chevron-down" class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"></i>
                        </div>
                    </div>
                    <div class="mt-3 flex items-center justify-between">
                        <p class="text-xs text-gray-500" id="officialsCount">Loading officials…</p>
                    </div>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div id="printArea" class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <th class="px-5 py-3.5 w-12 text-center">#</th>
                                    <th class="px-5 py-3.5">Official Name</th>
                                    <th class="px-5 py-3.5 hidden sm:table-cell">Position / Role</th>
                                    <th class="px-5 py-3.5 hidden sm:table-cell">Contact Number</th>
                                    <th class="px-5 py-3.5 hidden sm:table-cell">Date Appointed</th>
                                    <th class="px-5 py-3.5 text-center w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="officialsTableBody" class="divide-y divide-gray-100">
                                ${(function() {
                                    const rows = window.innerWidth < 640 ? 3 : 6;
                                    const cols = window.innerWidth < 640 ? 3 : 6;
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

export function initOfficialsPage() {
    initAdminNavbar();
    loadPositions();
    loadOfficials();

    initOfficialsAnimations();
    addButtonHoverAnimations('button');
    addTableRowHoverAnimations('tbody tr');
    animateSearchInput('#officialSearch');

    document.getElementById('exportBtn')?.addEventListener('click', () => {
        openExportExcelModal('officials');
    });

    document.getElementById('addOfficialBtn')?.addEventListener('click', () => {
        openOfficialsModal({
            mode: 'add',
            positions,
            onSubmit: handleOfficialSubmit
        });
    });

    document.getElementById('printBtn')?.addEventListener('click', () => {
        printOfficials();
    });
    document.getElementById('officialSearch')?.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        applyFilters();
    });
    document.getElementById('positionFilter')?.addEventListener('change', (e) => {
        selectedPosition = e.target.value;
        applyFilters();
    });
}

async function loadPositions() {
    try {
        positions = await getPositions();
        populatePositionFilter();
    } catch (error) {
        console.error('Error loading positions:', error);
    }
}

function populatePositionFilter() {
    const select = document.getElementById('positionFilter');
    if (!select || !positions.length) return;

    const options = positions.map(pos => {
        const name = pos.positionName || pos.name || pos;
        return `<option value="${name}">${name}</option>`;
    }).join('');

    select.innerHTML = `<option value="">All Positions</option>${options}`;
}

async function loadOfficials() {
    const tbody = document.getElementById('officialsTableBody');
    if (tbody) {
        const rows = window.innerWidth < 640 ? 3 : 6;
        const cols = window.innerWidth < 640 ? 3 : 6;
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
        officials = await getAllOfficials();
        applyFilters();
    } catch (error) {
        console.error('Error loading officials:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-5 py-12 text-center text-gray-500">
                        <i data-lucide="wifi-off" class="w-8 h-8 text-gray-300 mx-auto mb-2"></i>
                        <p class="font-medium text-gray-700">Unable to load officials</p>
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
    filteredOfficials = officials.filter(off => {
        const pos = (off.position || '').toLowerCase();
        const name = (off.fullName || '').toLowerCase();
        const contact = (off.contact || '').toLowerCase();

        const matchesSearch = !searchQuery ||
            name.includes(searchQuery) ||
            pos.includes(searchQuery) ||
            contact.includes(searchQuery);

        const matchesPosition = !selectedPosition || off.position === selectedPosition;

        return matchesSearch && matchesPosition;
    });

    renderOfficialsTable();
    updateCountLabel(filteredOfficials.length, officials.length);
}

function updateCountLabel(shown, total) {
    const el = document.getElementById('officialsCount');
    if (!el) return;

    if (shown === total) {
        el.textContent = `${total} official${total !== 1 ? 's' : ''} total`;
    } else {
        el.textContent = `Showing ${shown} of ${total} official${total !== 1 ? 's' : ''}`;
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

function renderOfficialsTable() {
    const tbody = document.getElementById('officialsTableBody');
    if (!tbody) return;

    if (filteredOfficials.length === 0) {
        const message = officials.length === 0
            ? 'No appointed officials registered yet.'
            : 'No officials match your search filter.';

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-5 py-12 text-center">
                    <i data-lucide="users" class="w-10 h-10 text-gray-200 mx-auto mb-2"></i>
                    <p class="text-sm text-gray-500 font-medium">${message}</p>
                    ${officials.length === 0 ? '<p class="text-xs text-gray-400 mt-1">Click "Add Official" to add the first record.</p>' : ''}
                </td>
            </tr>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    tbody.innerHTML = filteredOfficials.map((official, index) => {
        const dateAdded = new Date(official.createdAt).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
        const initials = getInitials(official.fullName);
        const avatarColor = getAvatarColor(official.fullName);
        const hasImage = official.imageUrl && official.imageUrl.trim() !== '';

        return `
        <tr class="cursor-pointer" onclick="viewOfficial('${official.id}')" style="transition: background-color 0.2s;" onmouseover="this.style.backgroundColor = document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.1)'" onmouseout="this.style.backgroundColor = ''">
            <td class="px-3 sm:px-5 py-2 sm:py-3.5 text-xs text-gray-400 text-center font-mono">
                ${index + 1}
            </td>

            <td class="px-3 sm:px-5 py-2 sm:py-3.5">
                <div class="flex items-center gap-2 sm:gap-3">
                    <div class="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full ${avatarColor} flex items-center justify-center text-xs font-semibold overflow-hidden">
                        ${hasImage 
                            ? `<img src="${official.imageUrl}" alt="${official.fullName}" class="w-full h-full object-cover">` 
                            : initials
                        }
                    </div>
                    <div>
                        <p class="text-xs sm:text-sm font-semibold text-gray-900">${official.fullName}</p>
                    </div>
                </div>
            </td>

            <td class="px-5 py-3.5 hidden sm:table-cell">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-900 border border-blue-200">
                    ${official.position || 'Appointed Official'}
                </span>
            </td>

            <td class="px-5 py-3.5 text-sm text-gray-600 font-mono text-xs hidden sm:table-cell">
                ${official.contact || '—'}
            </td>

            <td class="px-5 py-3.5 text-xs text-gray-500 hidden sm:table-cell">
                ${dateAdded}
            </td>

            <td class="px-3 sm:px-5 py-2 sm:py-3.5 text-center" onclick="event.stopPropagation()">
                ${CrudMenu({ 
                    id: official.id, 
                    onView: 'viewOfficial', 
                    onEdit: 'editOfficial', 
                    onDelete: 'confirmDeleteOfficial',
                    deleteLabel: official.fullName 
                })}
            </td>
        </tr>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    animateTableRows('#officialsTableBody tr');
    animateAvatars('.rounded-full');
}

window.viewOfficial = async (id) => {
    const official = await getOfficialById(id);
    await openViewOfficialsModal(official);
};

window.editOfficial = async (id) => {
    openOfficialsModal({
        mode: 'edit',
        official: null,
        positions,
        onSubmit: handleOfficialSubmit,
        isLoading: true
    });

    try {
        const official = await getOfficialById(id);
        populateEditForm(official);
    } catch (error) {
        console.error('Error loading official:', error);
        closeModal();
        showToast('Failed to load official details', 'error');
    }
};

window.confirmDeleteOfficial = (id, name) => {
    openConfirmDialog({
        title: 'Delete Official',
        message: `Are you sure you want to remove ${name} from the Officials list?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: async () => {
            await deleteOfficialById(id);
        }
    });
};

async function deleteOfficialById(id) {
    showToast('Deleting official...', 'loading');
    try {
        await deleteOfficial(id);
        await loadOfficials();
        updateToast('Official deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting official:', error);
        updateToast('Failed to delete official. Please try again.', 'error');
    }
}

function populateEditForm(official) {
    document.getElementById('officialId').value = official.id;
    document.getElementById('firstName').value = official.firstName;
    document.getElementById('lastName').value = official.lastName;
    document.getElementById('middleName').value = official.middleName || '';
    document.getElementById('contact').value = official.contact;
    document.getElementById('positionId').value = official.positionId || '';

    if (official.imageUrl) {
        document.getElementById('imageUrl').value = official.imageUrl;
        const previewContainer = document.getElementById('imagePreviewContainer');
        previewContainer.innerHTML = `<img src="${official.imageUrl}" alt="Preview" class="w-full h-full object-cover" id="imagePreview">`;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        if (!document.getElementById('existingImageUrl')) {
            const form = document.getElementById('officialForm');
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = 'existingImageUrl';
            hiddenInput.value = official.imageUrl;
            form.insertBefore(hiddenInput, form.firstChild);
        }
    }

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.remove();
}

async function handleOfficialSubmit(id, formData) {
    const loadingMessage = id ? 'Updating official...' : 'Creating official...';
    const successMessage = id ? 'Official updated successfully' : 'Official created successfully';
    
    showToast(loadingMessage, 'loading');
    try {
        if (id) {
            await updateOfficial(id, formData);
        } else {
            await createOfficial(formData);
        }
        await loadOfficials();
        updateToast(successMessage, 'success');
    } catch (error) {
        console.error('Error saving official:', error);
        updateToast('Failed to save official. Please try again.', 'error');
        throw error;
    }
}
