import { 
    getAllBusinessClearances, 
    deleteBusinessClearance
} from '../../../../api/admin/dashboard/clearance.js';
import { 
    openAddBusinessModal as openAddBusinessModalImpl, 
    openEditBusinessModal, 
    openViewBusinessModal, 
    setOfficials as setModalOfficials 
} from '../../../../components/modal/BusinessModal.js';
import { CrudMenu } from '../../../../components/CrudMenu.js';
import { openConfirmDialog } from '../../../../components/ConfirmDialog.js';
import { showToast, updateToast } from '../../../../components/ToastMessage.js';
import { skeletonTableRows } from '../../../../components/SkeletonLoading.js';
import { animateTableRows } from '../../../../provider/animations/ClearanceAnimation.js';

let businessClearances = [];
let filteredClearances = [];
let searchQuery = '';

export function setBusinessClearances(data) {
    businessClearances = data;
}

export function getBusinessClearances() {
    return businessClearances;
}

export function setOfficials(data) {
    setModalOfficials(data);
}

export async function loadBusinessClearances() {
    const tbody = document.getElementById('clearanceTableBody');
    if (tbody) {
        tbody.innerHTML = skeletonTableRows(7, 7);
    }

    try {
        businessClearances = await getAllBusinessClearances();
        setupSearchListener();
        applyFilters();
    } catch (error) {
        console.error('Error loading business clearances:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-5 py-12 text-center text-gray-500">
                        <i data-lucide="wifi-off" class="w-8 h-8 text-gray-300 mx-auto mb-2"></i>
                        <p class="font-medium text-gray-700">Unable to load business clearances</p>
                        <p class="text-xs mt-1">Please check your connection and try again.</p>
                    </td>
                </tr>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        updateCountLabel(0, 0);
    }
}

function setupSearchListener() {
    const searchInput = document.getElementById('clearanceSearch');
    if (searchInput) {
        searchInput.oninput = (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            applyFilters();
        };
    }
}

function applyFilters() {
    filteredClearances = businessClearances.filter(b => {
        const bName = (b.businessName || '').toLowerCase();
        const oName = (b.ownerName || '').toLowerCase();
        const bType = (b.businessType || '').toLowerCase();
        const orNo = (b.orNo || '').toLowerCase();

        return !searchQuery ||
            bName.includes(searchQuery) ||
            oName.includes(searchQuery) ||
            bType.includes(searchQuery) ||
            orNo.includes(searchQuery);
    });

    renderBusinessTable();
    updateCountLabel(filteredClearances.length, businessClearances.length);
}

function updateCountLabel(shown, total) {
    const el = document.getElementById('clearanceCount');
    if (!el) return;

    if (shown === total) {
        el.textContent = `${total} business clearance record${total !== 1 ? 's' : ''} total`;
    } else {
        el.textContent = `Showing ${shown} of ${total} business clearance record${total !== 1 ? 's' : ''}`;
    }
}

function renderBusinessTable() {
    const tbody = document.getElementById('clearanceTableBody');
    if (!tbody) return;

    if (filteredClearances.length === 0) {
        const message = businessClearances.length === 0
            ? 'No business clearances issued yet.'
            : 'No business clearances match your search filter.';

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-5 py-12 text-center">
                    <i data-lucide="building-2" class="w-10 h-10 text-gray-200 mx-auto mb-2"></i>
                    <p class="text-sm text-gray-500 font-medium">${message}</p>
                    ${businessClearances.length === 0 ? '<p class="text-xs text-gray-400 mt-1">Click "Add Business Clearance" to register the first permit.</p>' : ''}
                </td>
            </tr>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    tbody.innerHTML = filteredClearances.map((clearance, index) => {
        const dateIssued = new Date(clearance.createdAt).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

        return `
        <tr class="hover:bg-gray-50 transition-colors cursor-pointer" onclick="viewBusinessClearance('${clearance.id}')">
            <td class="px-5 py-3.5 text-xs text-gray-400 text-center font-mono">
                ${index + 1}
            </td>

            <td class="px-5 py-3.5">
                <p class="text-sm font-semibold text-gray-900">${clearance.businessName}</p>
            </td>

            <td class="px-5 py-3.5 text-sm text-gray-700 hidden sm:table-cell">
                ${clearance.ownerName}
            </td>

            <td class="px-5 py-3.5 hidden sm:table-cell">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-900 border border-blue-200">
                    ${clearance.businessType || 'General Business'}
                </span>
            </td>

            <td class="px-5 py-3.5 text-sm text-gray-600 font-mono text-xs hidden sm:table-cell">
                ${clearance.orNo ? `#${clearance.orNo}` : '—'}
            </td>

            <td class="px-5 py-3.5 text-xs text-gray-500 hidden sm:table-cell">
                ${dateIssued}
            </td>

            <td class="px-5 py-3.5 text-center" onclick="event.stopPropagation()">
                ${CrudMenu({
                    id: clearance.id,
                    onView: 'viewBusinessClearance',
                    onEdit: 'editBusinessClearance',
                    onDelete: 'confirmDeleteBusinessClearance',
                    deleteLabel: clearance.businessName
                })}
            </td>
        </tr>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    animateTableRows('#clearanceTableBody tr');
}

window.viewBusinessClearance = (id) => {
    openViewBusinessModal(id);
};

window.editBusinessClearance = (id) => {
    openEditBusinessModal(id, loadBusinessClearances);
};

window.confirmDeleteBusinessClearance = (id, name) => {
    openConfirmDialog({
        title: 'Delete Business Clearance',
        message: `Are you sure you want to delete the clearance record for ${name}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: async () => {
            await deleteBusinessClearanceById(id);
        }
    });
};

async function deleteBusinessClearanceById(id) {
    showToast('Deleting clearance...', 'loading');
    try {
        await deleteBusinessClearance(id);
        await loadBusinessClearances();
        updateToast('Business clearance deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting business clearance:', error);
        updateToast('Failed to delete clearance. Please try again.', 'error');
    }
}

export function openAddBusinessModal() {
    openAddBusinessModalImpl(loadBusinessClearances);
}
