import { getPuroks, deletePurok, getPurokById } from '../../../../api/admin/dashboard/settings/PurokList.js';
import { AdminNavbar, initAdminNavbar } from '../../../../components/admin/navbar.js';
import { openAddModal, editPurok, openViewModal } from '../../../../components/modal/PurokListModal.js';
import { CrudMenu } from '../../../../components/CrudMenu.js';
import { openConfirmDialog } from '../../../../components/ConfirmDialog.js';
import { showToast, updateToast } from '../../../../components/ToastMessage.js';
import { skeletonTableRows } from '../../../../components/SkeletonLoading.js';
import { initPurokListAnimations, animateTableRows } from '../../../../provider/animations/PurokListAnimation.js';

let puroks = [];

export function PurokList() {
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
                        <h1 class="text-2xl font-semibold text-gray-900">Purok List</h1>
                        <p class="text-sm text-gray-500 mt-1">Manage purok divisions and zones within the barangay.</p>
                    </div>
                    <div class="flex items-center gap-2.5">
                        <button 
                            type="button" 
                            id="addPurokBtn" 
                            class="px-4 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center gap-2 shadow-sm">
                            <i data-lucide="plus" class="w-4 h-4"></i>
                            <span>Add New</span>
                        </button>
                    </div>
                </div>

                <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <th class="px-5 py-3.5 w-12 text-center">#</th>
                                    <th class="px-5 py-3.5">Purok Name</th>
                                    <th class="px-5 py-3.5 text-center w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="purokTableBody" class="divide-y divide-gray-100">
                                ${(function() {
                                    const rows = 3;
                                    const cols = 3;
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

export function initPurokList() {
    initAdminNavbar();
    loadPuroks();
    initPurokListAnimations();
    setupEventListeners();
}

async function loadPuroks() {
    const tbody = document.getElementById('purokTableBody');
    if (tbody) {
        const rows = 3;
        const cols = 3;
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
        puroks = await getPuroks();
        renderPurokList();
    } catch (error) {
        console.error('Error loading puroks:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="px-5 py-12 text-center text-gray-500">
                        <i data-lucide="wifi-off" class="w-8 h-8 text-gray-300 mx-auto mb-2"></i>
                        <p class="font-medium text-gray-700">Unable to load puroks</p>
                        <p class="text-xs mt-1">Please check your connection and try again.</p>
                    </td>
                </tr>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        showToast('Failed to load puroks', 'error');
    }
}

function renderPurokList() {
    const tbody = document.getElementById('purokTableBody');
    if (!tbody) return;

    if (puroks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="px-5 py-12 text-center">
                    <i data-lucide="message-square-warning" class="w-10 h-10 text-gray-200 mx-auto mb-2"></i>
                    <p class="text-sm text-gray-500 font-medium">No puroks found.</p>
                    <p class="text-xs text-gray-400 mt-1">Click "Add New" to create the first purok.</p>
                </td>
            </tr>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    tbody.innerHTML = puroks.map((purok, index) => {
        return `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-3 sm:px-5 py-2 sm:py-3.5 text-xs text-gray-400 text-center font-mono">
                ${index + 1}
            </td>
            <td class="px-3 sm:px-5 py-2 sm:py-3.5">
                <p class="text-xs sm:text-sm font-semibold text-gray-900">${purok.purokName || purok.name}</p>
            </td>
            <td class="px-3 sm:px-5 py-2 sm:py-3.5 text-center">
                ${CrudMenu({ 
                    id: purok.id, 
                    onView: 'viewPurok',
                    onEdit: 'editPurok', 
                    onDelete: 'confirmDeletePurok',
                    deleteLabel: purok.purokName || purok.name
                })}
            </td>
        </tr>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    animateTableRows('#purokTableBody tr');
}

function setupEventListeners() {
    document.getElementById('addPurokBtn')?.addEventListener('click', () => {
        openAddModal(loadPuroks);
    });
}


window.editPurok = (id) => {
    const purok = puroks.find(p => p.id === id);
    if (!purok) return;
    editPurok(purok, loadPuroks);
};

window.viewPurok = (id) => {
    openViewModal(id);
};

window.confirmDeletePurok = (id, name) => {
    openConfirmDialog({
        title: 'Delete Purok',
        message: `Are you sure you want to delete ${name} from Purok List?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: async () => {
            await deletePurokById(id);
        }
    });
};

async function deletePurokById(id) {
    showToast('Deleting purok...', 'loading');
    try {
        await deletePurok(id);
        await loadPuroks();
        updateToast('Purok deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting purok:', error);
        updateToast('Failed to delete purok', 'error');
    }
}

