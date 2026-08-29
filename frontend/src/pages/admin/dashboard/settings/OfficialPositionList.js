import { getPositions, deletePosition, getPositionById } from '../../../../api/admin/dashboard/settings/OfficialPositionList.js';
import { AdminNavbar, initAdminNavbar } from '../../../../components/admin/navbar.js';
import { openAddModal, editPosition, openViewModal } from '../../../../components/modal/OfficialPositionListModal.js';
import { CrudMenu } from '../../../../components/CrudMenu.js';
import { openConfirmDialog } from '../../../../components/ConfirmDialog.js';
import { showToast, updateToast } from '../../../../components/ToastMessage.js';
import { skeletonTableRows } from '../../../../components/SkeletonLoading.js';
import { initOfficialsPositionAnimations, animateTableRows } from '../../../../provider/animations/OfficialsPositionAnimation.js';

let positions = [];

export function OfficialPositionList() {
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
                        <h1 class="text-2xl font-semibold text-gray-900">Official Positions</h1>
                        <p class="text-sm text-gray-500 mt-1">Manage official positions and signatory authorities for document approvals.</p>
                    </div>
                    <div class="flex items-center gap-2.5">
                        <button 
                            type="button" 
                            id="addPositionBtn" 
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
                                    <th class="px-5 py-3.5">Position Name</th>
                                    <th class="px-5 py-3.5">Signatory</th>
                                    <th class="px-5 py-3.5 text-center w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="positionTableBody" class="divide-y divide-gray-100">
                                ${skeletonTableRows(4, 5)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export function initOfficialPositionList() {
    initAdminNavbar();
    loadPositions();
    setupEventListeners();
    initOfficialsPositionAnimations();
}

async function loadPositions() {
    const tbody = document.getElementById('positionTableBody');
    if (tbody) {
        tbody.innerHTML = skeletonTableRows(4, 5);
    }

    try {
        positions = await getPositions();
        renderPositionList();
    } catch (error) {
        console.error('Error loading positions:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-5 py-12 text-center text-gray-500">
                        <i data-lucide="wifi-off" class="w-8 h-8 text-gray-300 mx-auto mb-2"></i>
                        <p class="font-medium text-gray-700">Unable to load positions</p>
                        <p class="text-xs mt-1">Please check your connection and try again.</p>
                    </td>
                </tr>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        showToast('Failed to load positions', 'error');
    }
}

function renderPositionList() {
    const tbody = document.getElementById('positionTableBody');
    if (!tbody) return;

    if (positions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="px-5 py-12 text-center">
                    <i data-lucide="message-square-warning" class="w-10 h-10 text-gray-200 mx-auto mb-2"></i>
                    <p class="text-sm text-gray-500 font-medium">No official positions found.</p>
                    <p class="text-xs text-gray-400 mt-1">Click "Add New" to create the first position.</p>
                </td>
            </tr>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    tbody.innerHTML = positions.map((position, index) => {
        return `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-5 py-3.5 text-xs text-gray-400 text-center font-mono">
                ${index + 1}
            </td>
            <td class="px-5 py-3.5">
                <p class="text-sm font-semibold text-gray-900">${position.positionName}</p>
            </td>
            <td class="px-5 py-3.5">
                ${position.isApprover ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-800 border-emerald-200">Yes</span>' : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200">No</span>'}
            </td>
            <td class="px-5 py-3.5 text-center">
                ${CrudMenu({ 
                    id: position.id, 
                    onView: 'viewPosition',
                    onEdit: 'editPosition', 
                    onDelete: 'confirmDeletePosition',
                    deleteLabel: position.positionName
                })}
            </td>
        </tr>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    animateTableRows('#positionTableBody tr');
}

function setupEventListeners() {
    document.getElementById('addPositionBtn')?.addEventListener('click', () => {
        openAddModal(loadPositions);
    });
}


window.editPosition = (id) => {
    const position = positions.find(p => p.id === id);
    if (!position) return;
    editPosition(position, loadPositions);
};

window.viewPosition = (id) => {
    openViewModal(id);
};

window.confirmDeletePosition = (id, name) => {
    openConfirmDialog({
        title: 'Delete Position',
        message: `Are you sure you want to delete ${name} from Position List?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: async () => {
            await deletePositionById(id);
        }
    });
};

async function deletePositionById(id) {
    showToast('Deleting position...', 'loading');
    try {
        await deletePosition(id);
        await loadPositions();
        updateToast('Position deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting position:', error);
        updateToast('Failed to delete position', 'error');
    }
}

