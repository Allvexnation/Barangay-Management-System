import { 
    getAllIndividualClearances, 
    deleteIndividualClearance
} from '../../../../api/admin/dashboard/clearance.js';
import { 
    openAddIndividualModal as openAddIndividualModalImpl, 
    openEditIndividualModal, 
    openViewIndividualModal, 
    setOfficials as setModalOfficials 
} from '../../../../components/modal/IndividualModal.js';
import { CrudMenu } from '../../../../components/CrudMenu.js';
import { openConfirmDialog } from '../../../../components/ConfirmDialog.js';
import { showToast, updateToast } from '../../../../components/ToastMessage.js';
import { skeletonTableRows } from '../../../../components/SkeletonLoading.js';
import { animateTableRows } from '../../../../provider/animations/ClearanceAnimation.js';

let individualClearances = [];

export function setIndividualClearances(data) {
    individualClearances = data;
}

export function getIndividualClearances() {
    return individualClearances;
}

export function setOfficials(data) {
    setModalOfficials(data);
}

export async function loadIndividualClearances() {
    const tbody = document.getElementById('clearanceTableBody');
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
        individualClearances = await getAllIndividualClearances();
        renderIndividualTable();
    } catch (error) {
        console.error('Error loading individual clearances:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-red-500">
                        Failed to load clearances. Please try again.
                    </td>
                </tr>
            `;
        }
    }
}

function renderIndividualTable() {
    const tbody = document.getElementById('clearanceTableBody');
    if (!tbody) return;

    if (individualClearances.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                    No individual clearances found. Click "Add New" to create one.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = individualClearances.map((clearance, index) => {
        const dateIssued = new Date(clearance.createdAt).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

        return `
        <tr class="cursor-pointer" onclick="viewIndividualClearance('${clearance.id}')" style="transition: background-color 0.2s;" onmouseover="this.style.backgroundColor = document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.1)'" onmouseout="this.style.backgroundColor = ''">
            <td class="px-3 sm:px-5 py-2 sm:py-3.5 text-xs text-gray-400 text-center font-mono">
                ${index + 1}
            </td>

            <td class="px-3 sm:px-5 py-2 sm:py-3.5">
                <p class="text-xs sm:text-sm font-semibold text-gray-900">${clearance.fullName}</p>
            </td>

            <td class="px-5 py-3.5 hidden sm:table-cell">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-900 border border-blue-200">
                    ${clearance.purpose || 'Certificate'}
                </span>
            </td>

            <td class="px-5 py-3.5 text-sm text-gray-600 font-mono text-xs hidden sm:table-cell">
                ${clearance.orNo ? `#${clearance.orNo}` : '—'}
            </td>

            <td class="px-5 py-3.5 text-sm text-gray-600 font-mono text-xs hidden sm:table-cell">
                ${clearance.contact || '—'}
            </td>

            <td class="px-5 py-3.5 text-xs text-gray-500 hidden sm:table-cell">
                ${dateIssued}
            </td>

            <td class="px-3 sm:px-5 py-2 sm:py-3.5 text-center" onclick="event.stopPropagation()">
                ${CrudMenu({
                    id: clearance.id,
                    onView: 'viewIndividualClearance',
                    onEdit: 'editIndividualClearance',
                    onDelete: 'confirmDeleteIndividualClearance',
                    deleteLabel: clearance.fullName
                })}
            </td>
        </tr>
        `;
    }).join('');

    animateTableRows('#clearanceTableBody tr');
}

window.viewIndividualClearance = (id) => {
    openViewIndividualModal(id);
};

window.editIndividualClearance = (id) => {
    openEditIndividualModal(id, loadIndividualClearances);
};

window.confirmDeleteIndividualClearance = (id, name) => {
    openConfirmDialog({
        title: 'Delete Clearance',
        message: `Are you sure you want to delete ${name} from the clearance list?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: async () => {
            await deleteIndividualClearanceById(id);
        }
    });
};

async function deleteIndividualClearanceById(id) {
    showToast('Deleting clearance...', 'loading');
    try {
        await deleteIndividualClearance(id);
        await loadIndividualClearances();
        updateToast('Clearance deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting individual clearance:', error);
        updateToast('Failed to delete clearance. Please try again.', 'error');
    }
}

export function openAddIndividualModal() {
    openAddIndividualModalImpl(loadIndividualClearances);
}





