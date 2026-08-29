import { getIndividualClearanceById, getIndividualClearanceAuditLogs } from '../../api/admin/dashboard/clearance.js';
import { getSystemInfo } from '../../api/admin/dashboard/settings/Systeminfo.js';
import { openModal, closeModal, setModalButtonLoading } from '../../utils/modal.js';
import { printIndividualClearance, getOrdinalSuffix } from '../print/IndividualPrint.js';
import { openConfirmDialog } from '../ConfirmDialog.js';
import { showToast, updateToast } from '../ToastMessage.js';
import { ModalButton } from '../buttons/ModalButton.js';
import { animateModalOpen, animateModalClose, clearModalAnimations, animateFormElements, clearFormAnimations, animateViewModalElements, clearViewModalAnimations } from './ModalAnimation.js';

let officials = [];

export function setOfficials(data) {
    officials = data;
}

export function getOfficials() {
    return officials;
}

export function openAddIndividualModal(loadIndividualClearances) {
    const formContent = `
        <form id="individualForm" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Last Name <span class="text-red-500">*</span></label>
                    <input type="text" id="lastName" name="lastName" required
                        placeholder="e.g. Dela Cruz"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">First Name <span class="text-red-500">*</span></label>
                    <input type="text" id="firstName" name="firstName" required
                        placeholder="e.g. Juan"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                    <input type="text" id="middleName" name="middleName"
                        placeholder="e.g. Santos"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Age <span class="text-red-500">*</span></label>
                <input type="text" id="age" name="age" required pattern="[0-9]+"
                    placeholder="e.g. 25"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contact # <span class="text-red-500">*</span></label>
                <input type="text" id="contact" name="contact" required pattern="[0-9]+"
                    placeholder="e.g. 09123456789"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">OR # <span class="text-red-500">*</span></label>
                <input type="text" id="orNo" name="orNo" required pattern="[0-9]+"
                    placeholder="e.g. 123456"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Purpose <span class="text-red-500">*</span></label>
                <textarea id="purpose" name="purpose" required rows="3"
                    placeholder="e.g. Employment requirement, school enrollment, etc."
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-4">
                ${ModalButton({
                    type: 'button',
                    variant: 'secondary',
                    text: 'Cancel',
                    onClick: 'closeIndividualModal()'
                })}
                ${ModalButton({
                    id: 'submitBtn',
                    type: 'submit',
                    variant: 'primary',
                    text: 'Save'
                })}
            </div>
        </form>
    `;

    openModal('Add Individual Clearance', formContent, 'mid-large');

    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (modalOverlay && modalContent) {
        animateModalOpen(modalOverlay, modalContent, 'scale');
    }

    setTimeout(() => {
        const form = document.getElementById('individualForm');
        if (form) {
            animateFormElements(form);
        }
    }, 100);

    const form = document.getElementById('individualForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleIndividualSubmit(null, loadIndividualClearances);
    });
}

export async function openEditIndividualModal(id, loadIndividualClearances) {
    try {
        const clearance = await getIndividualClearanceById(id);
        
        const formContent = `
            <form id="individualForm" class="space-y-4">
                <input type="hidden" id="clearanceId" value="${clearance.id}">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Last Name <span class="text-red-500">*</span></label>
                        <input type="text" id="lastName" name="lastName" value="${clearance.lastName}" required
                            placeholder="e.g. Dela Cruz"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">First Name <span class="text-red-500">*</span></label>
                        <input type="text" id="firstName" name="firstName" value="${clearance.firstName}" required
                            placeholder="e.g. Juan"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                        <input type="text" id="middleName" name="middleName" value="${clearance.middleName || ''}"
                            placeholder="e.g. Santos"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Age <span class="text-red-500">*</span></label>
                    <input type="text" id="age" name="age" value="${clearance.age}" required pattern="[0-9]+"
                        placeholder="e.g. 25"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Contact # <span class="text-red-500">*</span></label>
                    <input type="text" id="contact" name="contact" value="${clearance.contact}" required pattern="[0-9]+"
                        placeholder="e.g. 09123456789"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">OR # <span class="text-red-500">*</span></label>
                    <input type="text" id="orNo" name="orNo" value="${clearance.orNo}" required pattern="[0-9]+"
                        placeholder="e.g. 123456"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Purpose <span class="text-red-500">*</span></label>
                    <textarea id="purpose" name="purpose" required rows="3"
                        placeholder="e.g. Employment requirement, school enrollment, etc."
                        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition">${clearance.purpose}</textarea>
                </div>
                <div class="flex justify-end gap-3 pt-4">
                    ${ModalButton({
                        type: 'button',
                        variant: 'secondary',
                        text: 'Cancel',
                        onClick: 'closeIndividualModal()'
                    })}
                    ${ModalButton({
                        id: 'submitBtn',
                        type: 'submit',
                        variant: 'primary',
                        text: 'Update'
                    })}
                </div>
            </form>
        `;

        openModal('Edit Individual Clearance Details', formContent, 'mid-large');

            const modalOverlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');
        if (modalOverlay && modalContent) {
            animateModalOpen(modalOverlay, modalContent, 'scale');
        }

            setTimeout(() => {
            const form = document.getElementById('individualForm');
            if (form) {
                animateFormElements(form);
            }
        }, 100);

        const form = document.getElementById('individualForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleIndividualSubmit(id, loadIndividualClearances);
        });
    } catch (error) {
        console.error('Error loading individual clearance:', error);
        showToast('Failed to load clearance details', 'error');
    }
}

async function openViewIndividualModal(id) {
    try {
        const clearance = await getIndividualClearanceById(id);
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

        const selectedOfficial = officials.find(o => o.position === 'Punong Barangay') || officials[0];

        let auditLogsContent = '<p class="text-sm text-gray-500">No audit history available.</p>';
        try {
            const auditLogs = await getIndividualClearanceAuditLogs(clearance.id);
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
                        <h3 class="text-base font-bold text-gray-900">${clearance.fullName}</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Age: <span class="font-medium text-gray-800">${clearance.age}</span> &bull; Contact: <span class="font-mono text-gray-700">${clearance.contact || '—'}</span></p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                            Individual Clearance
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
                        <h3 class="text-sm font-semibold text-blue-900 mt-0.5 tracking-wide">BARANGAY INDIVIDUAL CLEARANCE</h3>
                    </div>

                    <div class="space-y-4 text-justify text-sm text-gray-800 leading-relaxed">
                        <div class="bg-gray-50/70 rounded-md p-4 border border-gray-200/70 text-xs">
                            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                                <div>
                                    <dt class="text-gray-400 font-medium">Applicant Name:</dt>
                                    <dd class="font-semibold text-gray-900 mt-0.5">${clearance.fullName}</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-400 font-medium">Age:</dt>
                                    <dd class="font-semibold text-gray-900 mt-0.5">${clearance.age}</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-400 font-medium">Contact Number:</dt>
                                    <dd class="font-mono font-semibold text-gray-900 mt-0.5">${clearance.contact}</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-400 font-medium">Purpose:</dt>
                                    <dd class="font-semibold text-gray-900 mt-0.5">${clearance.purpose}</dd>
                                </div>
                            </dl>
                        </div>

                        <p class="indent-6">
                            This is to certify that <b><u class="px-1">${clearance.fullName}, ${clearance.age}</u></b> years old, and a resident of ${fullLocation} is known to be of good moral character and law-abiding citizen in the community.
                        </p>
                        <p class="indent-6">To certify further, that he/she has no derogatory and/or criminal records filed in this barangay.</p>
                        <p class="indent-6">
                            ISSUED this <b><u class="px-1 decoration-gray-400 underline-offset-2">${day}${getOrdinalSuffix(day)}</u></b> day of <b><u class="px-1 decoration-gray-400 underline-offset-2">${month} ${year}</u></b> at ${fullLocation} upon request of the interested party for whatever legal purposes it may serve.
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
                        onclick="closeIndividualModal()" 
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

        openModal('Individual Clearance Details', content, 'mid-large');

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
            const selectedOfficial = officials.find(o => o.id === e.target.value);
            if (selectedOfficial) {
                document.querySelector('.signatory-name').textContent = selectedOfficial.fullName;
                document.querySelector('.signatory-position').textContent = selectedOfficial.position;
            }
        });

        document.getElementById('printDataBtn')?.addEventListener('click', () => {
            const selectedOfficialId = signatorySelect.value;
            const selectedOfficial = officials.find(o => o.id === selectedOfficialId);
            printIndividualClearance(clearance, selectedOfficial, { barangayName, city, province, logoUrl }, officials);
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (error) {
        console.error('Error loading individual clearance:', error);
        showToast('Failed to load clearance details', 'error');
    }
}


async function handleIndividualSubmit(id = null, loadIndividualClearances) {
    const formData = {
        lastName: document.getElementById('lastName').value,
        firstName: document.getElementById('firstName').value,
        middleName: document.getElementById('middleName').value,
        age: document.getElementById('age').value,
        contact: document.getElementById('contact').value,
        orNo: document.getElementById('orNo').value,
        purpose: document.getElementById('purpose').value
    };

    const buttonText = id ? 'Update' : 'Save';
    const isEdit = id !== null;

    if (isEdit) {
        openConfirmDialog({
            title: 'Confirm Update',
            message: 'Are you sure you want to update this individual clearance?',
            confirmText: 'Update',
            cancelText: 'Cancel',
            type: 'blue',
            onConfirm: async () => {
                showToast('Updating clearance...', 'loading');
                setModalButtonLoading('submitBtn', true, buttonText);
                try {
                    const { createIndividualClearance, updateIndividualClearance } = await import('../../api/admin/dashboard/clearance.js');
                    await updateIndividualClearance(id, formData);
                    closeIndividualModal();
                    await loadIndividualClearances();
                    updateToast('Clearance updated successfully', 'success');
                } catch (error) {
                    console.error('Error saving individual clearance:', error);
                    updateToast('Failed to save clearance. Please try again.', 'error');
                    setModalButtonLoading('submitBtn', false, buttonText);
                }
            }
        });
    } else {
        showToast('Creating clearance...', 'loading');
        setModalButtonLoading('submitBtn', true, buttonText);
        try {
            const { createIndividualClearance, updateIndividualClearance } = await import('../../api/admin/dashboard/clearance.js');
            await createIndividualClearance(formData);
            closeIndividualModal();
            await loadIndividualClearances();
            updateToast('Clearance created successfully', 'success');
        } catch (error) {
            console.error('Error saving individual clearance:', error);
            updateToast('Failed to save clearance. Please try again.', 'error');
            setModalButtonLoading('submitBtn', false, buttonText);
        }
    }
}

export { openViewIndividualModal };

async function closeIndividualModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    
    if (modalOverlay && modalContent) {
        await animateModalClose(modalOverlay, modalContent, 'scale');
        clearModalAnimations(modalOverlay, modalContent);
        modalOverlay.remove();
        document.removeEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeIndividualModal();
        });
    } else {
        closeModal();
    }
}

window.closeIndividualModal = closeIndividualModal;
