import { getBusinessClearanceById, getBusinessClearanceAuditLogs } from '../../api/admin/dashboard/clearance.js';
import { getSystemInfo } from '../../api/admin/dashboard/settings/Systeminfo.js';
import { openModal, closeModal, setModalButtonLoading } from '../../utils/modal.js';
import { printBusinessClearance, getOrdinalSuffix } from '../print/BusinessPrint.js';
import { openConfirmDialog } from '../ConfirmDialog.js';
import { showToast, updateToast } from '../ToastMessage.js';
import { animateModalOpen, animateModalClose, clearModalAnimations, animateFormElements, clearFormAnimations, animateViewModalElements, clearViewModalAnimations } from './ModalAnimation.js';

let officials = [];

export function setOfficials(data) {
    officials = data;
}

export function getOfficials() {
    return officials;
}

function getFormHTML(clearance = null) {
    const isEdit = clearance !== null;
    const buttonText = isEdit ? 'Save Changes' : 'Issue Clearance';

    return `
        <form id="businessForm" class="space-y-5">
            ${isEdit ? `<input type="hidden" id="clearanceId" value="${clearance.id}">` : ''}

            <fieldset>
                <legend class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Business & Owner Information</legend>
                <div class="space-y-3">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label for="businessName" class="block text-sm font-medium text-gray-700 mb-1">Business Name <span class="text-red-500">*</span></label>
                            <input type="text" id="businessName" name="businessName" value="${isEdit ? (clearance.businessName || '') : ''}" required
                                placeholder="e.g. Juan's Sari-Sari Store"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        </div>
                        <div>
                            <label for="ownerName" class="block text-sm font-medium text-gray-700 mb-1">Owner / Proprietor <span class="text-red-500">*</span></label>
                            <input type="text" id="ownerName" name="ownerName" value="${isEdit ? (clearance.ownerName || '') : ''}" required
                                placeholder="e.g. Juan Dela Cruz"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label for="businessType" class="block text-sm font-medium text-gray-700 mb-1">Business Type / Nature <span class="text-red-500">*</span></label>
                            <input type="text" id="businessType" name="businessType" value="${isEdit ? (clearance.businessType || '') : ''}" required
                                placeholder="e.g. Retail / Grocery Store"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        </div>
                        <div>
                            <label for="tin" class="block text-sm font-medium text-gray-700 mb-1">TIN Number <span class="text-red-500">*</span></label>
                            <input type="text" id="tin" name="tin" value="${isEdit ? (clearance.tin || '') : ''}" required pattern="[0-9\\s-]+"
                                placeholder="e.g. 123-456-789-000"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono">
                        </div>
                    </div>
                </div>
            </fieldset>

            <hr class="border-gray-100">

            <fieldset>
                <legend class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Clearance Details</legend>
                <div>
                    <label for="orNo" class="block text-sm font-medium text-gray-700 mb-1">Official Receipt (OR) # <span class="text-red-500">*</span></label>
                    <input type="text" id="orNo" name="orNo" value="${isEdit ? (clearance.orNo || '') : ''}" required pattern="[0-9]+"
                        placeholder="e.g. 9876543"
                        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono">
                </div>
            </fieldset>

            <div id="formError" class="hidden text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"></div>

            <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button 
                    type="button" 
                    onclick="closeBusinessModal()" 
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition">
                    Cancel
                </button>
                <button 
                    type="submit" 
                    id="submitBtn" 
                    class="px-5 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition">
                    ${buttonText}
                </button>
            </div>
        </form>
    `;
}

export function openAddBusinessModal(loadBusinessClearances) {
    const formContent = getFormHTML(null);
    openModal('New Business Clearance', formContent, 'mid-large');

    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (modalOverlay && modalContent) {
        animateModalOpen(modalOverlay, modalContent, 'scale');
    }

    setTimeout(() => {
        const form = document.getElementById('businessForm');
        if (form) {
            animateFormElements(form);
        }
    }, 100);

    const form = document.getElementById('businessForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleBusinessSubmit(null, loadBusinessClearances);
        });
    }
}

export async function openEditBusinessModal(id, loadBusinessClearances) {
    try {
        const clearance = await getBusinessClearanceById(id);
        const formContent = getFormHTML(clearance);
        
        openModal('Edit Business Clearance', formContent, 'mid-large');

            const modalOverlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');
        if (modalOverlay && modalContent) {
            animateModalOpen(modalOverlay, modalContent, 'scale');
        }

            setTimeout(() => {
            const form = document.getElementById('businessForm');
            if (form) {
                animateFormElements(form);
            }
        }, 100);

        const form = document.getElementById('businessForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await handleBusinessSubmit(id, loadBusinessClearances);
            });
        }
    } catch (error) {
        console.error('Error loading business clearance:', error);
        showToast('Failed to load business clearance details', 'error');
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

async function handleBusinessSubmit(id = null, loadBusinessClearances) {
    hideFormError();

    const formData = {
        ownerName: document.getElementById('ownerName').value.trim(),
        businessName: document.getElementById('businessName').value.trim(),
        businessType: document.getElementById('businessType').value.trim(),
        tin: document.getElementById('tin').value.trim(),
        orNo: document.getElementById('orNo').value.trim()
    };

    const buttonText = id ? 'Save Changes' : 'Issue Clearance';
    const isEdit = id !== null;

    if (isEdit) {
        openConfirmDialog({
            title: 'Confirm Update',
            message: 'Are you sure you want to update this business clearance record?',
            confirmText: 'Update',
            cancelText: 'Cancel',
            type: 'blue',
            onConfirm: async () => {
                showToast('Updating business clearance...', 'loading');
                setModalButtonLoading('submitBtn', true, buttonText);
                try {
                    const { updateBusinessClearance } = await import('../../api/admin/dashboard/clearance.js');
                    await updateBusinessClearance(id, formData);
                    closeBusinessModal();
                    await loadBusinessClearances();
                    updateToast('Business clearance updated successfully', 'success');
                } catch (error) {
                    console.error('Error saving business clearance:', error);
                    showFormError('Failed to save clearance. Please try again.');
                    setModalButtonLoading('submitBtn', false, buttonText);
                }
            }
        });
    } else {
        setModalButtonLoading('submitBtn', true, buttonText);
        try {
            const { createBusinessClearance } = await import('../../api/admin/dashboard/clearance.js');
            await createBusinessClearance(formData);
            closeBusinessModal();
            await loadBusinessClearances();
            updateToast('Business clearance issued successfully', 'success');
        } catch (error) {
            console.error('Error saving business clearance:', error);
            showFormError('Failed to save clearance. Please try again.');
            setModalButtonLoading('submitBtn', false, buttonText);
        }
    }
}

export async function openViewBusinessModal(id) {
    try {
        const clearance = await getBusinessClearanceById(id);
        const date = new Date(clearance.createdAt);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();

        let systemInfo = null;
        try {
            systemInfo = await getSystemInfo();
        } catch (error) {
            console.log('Could not load system info, using defaults');
        }

        const barangayName = systemInfo?.barangayName || 'Pio del Pilar';
        const city = systemInfo?.city || 'Makati';
        const province = systemInfo?.province || 'Metro Manila';
        const logoUrl = systemInfo?.logoUrl || null;

        const fullLocation = `Barangay ${barangayName}, ${city}, ${province}`;

        const officialsOptions = officials.map(official =>
            `<option value="${official.id}" ${official.position === 'Punong Barangay' ? 'selected' : ''}>${official.fullName} - ${official.position}</option>`
        ).join('');

        const selectedOfficial = officials.find(o => o.position === 'Punong Barangay') || officials[0] || { fullName: 'Barangay Captain', position: 'Punong Barangay' };

        let auditLogsContent = '<p class="text-sm text-gray-500">No audit history available.</p>';
        try {
            const auditLogs = await getBusinessClearanceAuditLogs(clearance.id);
            if (auditLogs && auditLogs.length > 0) {
                auditLogsContent = auditLogs.map(log => {
                    const timestamp = new Date(log.timestamp).toLocaleString('en-PH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    let detailsHtml = '';
                    
                    if (log.action === 'Create' && log.newValues) {
                        detailsHtml = Object.entries(log.newValues).map(([field, value]) => `
                            <div class="text-xs text-gray-600 mt-1">
                                <span class="font-medium text-gray-700">${field}:</span>
                                <span class="text-green-600">${value || '—'}</span>
                            </div>
                        `).join('');
                    } else if (log.action === 'Delete' && log.previousValues) {
                        detailsHtml = Object.entries(log.previousValues).map(([field, value]) => `
                            <div class="text-xs text-gray-600 mt-1">
                                <span class="font-medium text-gray-700">${field}:</span>
                                <span class="text-red-600">${value || '—'}</span>
                            </div>
                        `).join('');
                    } else if (log.changes) {
                        detailsHtml = Object.entries(log.changes).map(([field, change]) => `
                            <div class="text-xs text-gray-600 mt-1">
                                <span class="font-medium text-gray-700">${field}:</span>
                                <span class="text-red-600">${change.oldValue || '—'}</span>
                                →
                                <span class="text-green-600">${change.newValue || '—'}</span>
                            </div>
                        `).join('');
                    }

                    let badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                    if (log.action === 'Create') {
                        badgeClass = 'bg-green-50 text-green-700 border-green-200';
                    } else if (log.action === 'Delete') {
                        badgeClass = 'bg-red-50 text-red-700 border-red-200';
                    }

                    return `
                        <div class="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div class="flex items-center justify-between mb-2">
                                <div>
                                    <span class="text-sm font-medium text-gray-900">${log.adminName || log.adminEmail || 'Unknown Admin'}</span>
                                    <span class="text-xs text-gray-400 ml-2">${timestamp}</span>
                                </div>
                                <span class="text-xs px-2 py-0.5 rounded-full ${badgeClass}">
                                    ${log.action}
                                </span>
                            </div>
                            ${detailsHtml}
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            auditLogsContent = '<p class="text-sm text-red-500">Failed to load audit logs.</p>';
        }

        const content = `
            <div class="space-y-4">
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h3 class="text-base font-bold text-gray-900">${clearance.businessName}</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Owner: <span class="font-medium text-gray-800">${clearance.ownerName}</span> &bull; TIN: <span class="font-mono text-gray-700">${clearance.tin || '—'}</span></p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                            ${clearance.businessType || 'Business Clearance'}
                        </span>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono bg-gray-100 text-gray-700 border border-gray-200">
                            OR #${clearance.orNo}
                        </span>
                    </div>
                </div>

                <div class="bg-white border border-gray-200 rounded-lg p-3.5 shadow-2xs">
                    <label for="signatorySelect" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Select Official Signatory
                    </label>
                    <select id="signatorySelect" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition">
                        ${officialsOptions}
                    </select>
                </div>

                <div id="outprint_modal" class="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
                    <div class="text-center mb-6 pb-4 border-b border-gray-100">
                        <p class="text-xs text-gray-400 uppercase tracking-wider">Republic of the Philippines</p>
                        <p class="text-xs text-gray-500">${city}, ${province}</p>
                        <h2 class="text-base font-bold text-gray-900 mt-1">BARANGAY ${barangayName.toUpperCase()}</h2>
                        <h3 class="text-sm font-semibold text-blue-900 mt-0.5 tracking-wide">BARANGAY BUSINESS CLEARANCE</h3>
                    </div>

                    <div class="space-y-4 text-justify text-sm text-gray-800 leading-relaxed">
                        <div class="bg-gray-50/70 rounded-md p-4 border border-gray-200/70 text-xs">
                            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                                <div>
                                    <dt class="text-gray-400 font-medium">Owner / Applicant:</dt>
                                    <dd class="font-semibold text-gray-900 mt-0.5">${clearance.ownerName}</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-400 font-medium">Business Name:</dt>
                                    <dd class="font-semibold text-gray-900 mt-0.5">${clearance.businessName}</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-400 font-medium">Kind of Business:</dt>
                                    <dd class="font-semibold text-gray-900 mt-0.5">${clearance.businessType}</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-400 font-medium">Tax Identification (TIN):</dt>
                                    <dd class="font-mono font-semibold text-gray-900 mt-0.5">${clearance.tin}</dd>
                                </div>
                            </dl>
                        </div>

                        <p class="indent-6">
                            This <span class="font-semibold">CERTIFICATION</span> is issued upon the request of the above-named proprietor in connection with their application for a <span class="font-semibold underline underline-offset-2">Barangay Business Permit</span>.
                        </p>
                        <p class="indent-6">
                            ISSUED this <span class="font-semibold underline decoration-gray-400 underline-offset-2">${day}${getOrdinalSuffix(day)}</span> day of <span class="font-semibold underline decoration-gray-400 underline-offset-2">${month} ${year}</span> at ${fullLocation}.
                        </p>

                        <div class="pt-8 flex justify-end">
                            <div class="w-64 text-center">
                                <div class="border-b border-gray-900 pb-1 font-bold text-gray-900 signatory-name text-sm">${selectedOfficial.fullName}</div>
                                <div class="text-xs text-gray-500 mt-1 signatory-position font-medium">${selectedOfficial.position}</div>
                            </div>
                        </div>

                        <div class="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <div><span class="font-medium text-gray-700">OR #:</span> <span class="font-mono">${clearance.orNo}</span></div>
                            <div><span class="font-medium text-gray-700">Date Issued:</span> ${date.toLocaleDateString('en-PH', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    <button 
                        type="button" 
                        onclick="closeBusinessModal()" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition">
                        Close
                    </button>
                    <button 
                        type="button" 
                        id="printDataBtn" 
                        class="px-5 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition flex items-center gap-2 shadow-sm">
                        <i data-lucide="printer" class="w-4 h-4"></i>
                        <span>Print Clearance</span>
                    </button>
                </div>

                <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Audit History</h4>
                    <div class="space-y-2 max-h-48 overflow-y-auto">
                        ${auditLogsContent}
                    </div>
                </div>
            </div>
        `;

        openModal('Business Clearance Certificate', content, 'mid-large');

            const modalOverlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');
        if (modalOverlay && modalContent) {
            animateModalOpen(modalOverlay, modalContent, 'scale');
        }

        setTimeout(() => {
            const modalContentEl = document.getElementById('modal-content');
            if (modalContentEl) {
                animateViewModalElements(modalContentEl);
            }
        }, 100);

        const signatorySelect = document.getElementById('signatorySelect');
        signatorySelect?.addEventListener('change', (e) => {
            const chosenOfficial = officials.find(o => o.id === e.target.value);
            if (chosenOfficial) {
                const nameEl = document.querySelector('.signatory-name');
                const posEl = document.querySelector('.signatory-position');
                if (nameEl) nameEl.textContent = chosenOfficial.fullName;
                if (posEl) posEl.textContent = chosenOfficial.position;
            }
        });

        document.getElementById('printDataBtn')?.addEventListener('click', () => {
            const selectedOfficialId = signatorySelect ? signatorySelect.value : null;
            const chosenOfficial = officials.find(o => o.id === selectedOfficialId) || selectedOfficial;
            printBusinessClearance(clearance, chosenOfficial, { barangayName, city, province, logoUrl }, officials);
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (error) {
        console.error('Error loading business clearance:', error);
        showToast('Failed to load business clearance details', 'error');
    }
}

export { openViewBusinessModal as default };

async function closeBusinessModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    
    if (modalOverlay && modalContent) {
        await animateModalClose(modalOverlay, modalContent, 'scale');
        clearModalAnimations(modalOverlay, modalContent);
        modalOverlay.remove();
        document.removeEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeBusinessModal();
        });
    } else {
        closeModal();
    }
}

window.closeBusinessModal = closeBusinessModal;
