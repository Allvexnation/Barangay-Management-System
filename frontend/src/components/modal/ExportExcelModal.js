import { openModal, closeModal, setModalButtonLoading } from '../../utils/modal.js';
import { getAllOfficials } from '../../api/admin/dashboard/officials.js';
import { exportHouseholdsToExcel } from '../excel/HouseholdExcel.js';
import { exportOfficialsToExcel } from '../excel/OfficialsExcel.js';
import { exportClearancesToExcel } from '../excel/ClearanceExcel.js';
import { exportComplaintsToExcel } from '../excel/ComplaintsExcel.js';
import { showToast, updateToast } from '../ToastMessage.js';
import { animateModalOpen, animateModalClose, clearModalAnimations, animateFormElements } from './ModalAnimation.js';

export function openExportExcelModal(type = 'households') {
    const isOfficials = type === 'officials';
    const isClearance = type === 'clearance';
    const isComplaints = type === 'complaints';
    const modalTitle = isOfficials ? 'Export Officials to Excel' : isClearance ? 'Export Clearances to Excel' : isComplaints ? 'Export Complaints to Excel' : 'Export Households to Excel';
    
    const formContent = `
        <form id="exportSignatoryForm" class="space-y-5">
            <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p class="text-sm text-blue-800">
                    <i data-lucide="info" class="w-4 h-4 inline mr-1"></i>
                    Select the signatories for this export document.
                </p>
            </div>

            <div>
                <label for="preparedBy" class="block text-sm font-medium text-gray-700 mb-1">Prepared By <span class="text-red-500">*</span></label>
                <select id="preparedBy" name="preparedBy" required
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition">
                    <option value="">Loading positions...</option>
                </select>
                <p class="text-xs text-gray-400 mt-1">Select the official who prepared this document</p>
            </div>

            <div>
                <label for="approvedBy" class="block text-sm font-medium text-gray-700 mb-1">Approved By <span class="text-red-500">*</span></label>
                <select id="approvedBy" name="approvedBy" required
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition">
                    <option value="">Loading positions...</option>
                </select>
                <p class="text-xs text-gray-400 mt-1">Select the official who approved this document</p>
            </div>

            <div id="formError" class="hidden text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"></div>

            <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button 
                    type="button" 
                    onclick="closeExportModal()" 
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition">
                    Cancel
                </button>
                <button 
                    type="submit" 
                    id="exportBtn" 
                    class="px-5 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition">
                    Export Excel
                </button>
            </div>
        </form>
    `;

    openModal(modalTitle, formContent, 'medium');

    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (modalOverlay && modalContent) {
        animateModalOpen(modalOverlay, modalContent, 'scale');
    }

    setTimeout(() => {
        const form = document.getElementById('exportSignatoryForm');
        if (form) {
            animateFormElements(form);
        }
    }, 100);

    loadPositionsAndPopulateSelects();

    const form = document.getElementById('exportSignatoryForm');
    if (form) {
        form.addEventListener('submit', (e) => handleExportSubmit(e, type));
    }
}

async function loadPositionsAndPopulateSelects() {
    try {
        const officials = await getAllOfficials();
        
        const preparedBySelect = document.getElementById('preparedBy');
        const approvedBySelect = document.getElementById('approvedBy');

        if (preparedBySelect && approvedBySelect) {
            const options = officials.map(official => {
                const displayName = official.position 
                    ? `${official.fullName} - ${official.position}`
                    : official.fullName;
                return `<option value="${official.id}">${displayName}</option>`;
            }).join('');

            const defaultOption = '<option value="">Select a signatory...</option>';
            
            preparedBySelect.innerHTML = defaultOption + options;
            approvedBySelect.innerHTML = defaultOption + options;
        }
    } catch (error) {
        console.error('Error loading officials:', error);
        showFormError('Failed to load signatory officials. Please try again.');
        
        const preparedBySelect = document.getElementById('preparedBy');
        const approvedBySelect = document.getElementById('approvedBy');
        
        if (preparedBySelect) preparedBySelect.innerHTML = '<option value="">Failed to load</option>';
        if (approvedBySelect) approvedBySelect.innerHTML = '<option value="">Failed to load</option>';
    }
}

async function handleExportSubmit(e, type) {
    e.preventDefault();
    hideFormError();

    const preparedById = document.getElementById('preparedBy').value;
    const approvedById = document.getElementById('approvedBy').value;

    if (!preparedById || !approvedById) {
        showFormError('Please select both Prepared By and Approved By signatories.');
        return;
    }

    if (preparedById === approvedById) {
        showToast('Prepared By and Approved By cannot be the same person.', 'error');
        return;
    }

    const isOfficials = type === 'officials';
    const isClearance = type === 'clearance';
    const isComplaints = type === 'complaints';
    const loadingMessage = isOfficials ? 'Exporting officials...' : isClearance ? 'Exporting clearances...' : isComplaints ? 'Exporting complaints...' : 'Exporting households...';
    const successMessage = isOfficials ? 'Officials exported successfully' : isClearance ? 'Clearances exported successfully' : isComplaints ? 'Complaints exported successfully' : 'Households exported successfully';
    const errorMessage = isOfficials ? 'Failed to export officials. Please try again.' : isClearance ? 'Failed to export clearances. Please try again.' : isComplaints ? 'Failed to export complaints. Please try again.' : 'Failed to export households. Please try again.';

    setModalButtonLoading('exportBtn', true, 'Exporting...');
    showToast(loadingMessage, 'loading');

    try {
        if (isOfficials) {
            await exportOfficialsToExcel(preparedById, approvedById);
        } else if (isClearance) {
            await exportClearancesToExcel(preparedById, approvedById);
        } else if (isComplaints) {
            await exportComplaintsToExcel(preparedById, approvedById);
        } else {
            await exportHouseholdsToExcel(preparedById, approvedById);
        }
        updateToast(successMessage, 'success');
        closeExportModal();
    } catch (error) {
        console.error(`Error exporting ${type}:`, error);
        updateToast(errorMessage, 'error');
        showFormError('Failed to export. Please try again.');
        setModalButtonLoading('exportBtn', false, 'Export Excel');
    }
}

function showFormError(message) {
    const el = document.getElementById('formError');
    if (el) {
        el.textContent = message;
        el.classList.remove('hidden');
    }
}

function hideFormError() {
    const el = document.getElementById('formError');
    if (el) el.classList.add('hidden');
}

async function closeExportModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    
    if (modalOverlay && modalContent) {
        await animateModalClose(modalOverlay, modalContent, 'scale');
        clearModalAnimations(modalOverlay, modalContent);
        modalOverlay.remove();
        document.removeEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeExportModal();
        });
    } else {
        closeModal();
    }
}

window.closeExportModal = closeExportModal;
