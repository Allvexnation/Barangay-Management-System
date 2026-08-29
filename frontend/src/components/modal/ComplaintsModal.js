import { createComplaint, updateComplaint, getComplaintById, getComplaintAuditLogs } from '../../api/admin/dashboard/complaints.js';
import { openModal, closeModal, setModalButtonLoading } from '../../utils/modal.js';
import { openConfirmDialog } from '../ConfirmDialog.js';
import { showToast, updateToast } from '../ToastMessage.js';
import { animateModalOpen, animateModalClose, clearModalAnimations, animateFormElements, clearFormAnimations, animateViewModalElements, clearViewModalAnimations } from './ModalAnimation.js';

function getFormHTML(complaint = null) {
    const isEdit = complaint !== null;
    const buttonText = isEdit ? 'Save Changes' : 'File Complaint';

    return `
        <form id="complaintForm" class="space-y-5">
            ${isEdit ? `<input type="hidden" id="complaintId" value="${complaint.complaintId}">` : ''}

            <fieldset>
                <legend class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Parties Involved</legend>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label for="complainantName" class="block text-sm font-medium text-gray-700 mb-1">Complainant Name <span class="text-red-500">*</span></label>
                        <input type="text" id="complainantName" name="complainantName" value="${isEdit ? (complaint.complainantName || '') : ''}" required
                            placeholder="e.g. Juan Dela Cruz"
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    </div>
                    <div>
                        <label for="appellant" class="block text-sm font-medium text-gray-700 mb-1">Respondent / Appellant <span class="text-red-500">*</span></label>
                        <input type="text" id="appellant" name="appellant" value="${isEdit ? (complaint.appellant || '') : ''}" required
                            placeholder="e.g. Pedro Santos"
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    </div>
                </div>
            </fieldset>

            <div class="border-b border-gray-200 pb-4">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Case Information</h4>
                <div class="space-y-3">
                    <div>
                        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Case Status <span class="text-red-500">*</span></label>
                        <select id="status" name="status" required
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition">
                            <option value="Pending" ${isEdit && complaint.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="In Progress" ${isEdit && complaint.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Resolved" ${isEdit && complaint.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                            <option value="Rejected" ${isEdit && complaint.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                    </div>

                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Incident Narrative / Description <span class="text-red-500">*</span></label>
                        <textarea id="description" name="description" rows="4" required
                            placeholder="Detailed narrative of the blotter report, incident, or dispute…"
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none">${isEdit ? (complaint.description || '') : ''}</textarea>
                    </div>
                </div>
            </div>

            <div class="flex justify-end pt-3 border-t border-gray-100 flex-row gap-2">
                <button 
                    type="button" 
                    onclick="closeComplaintModal()" 
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

export function openAddComplaintModal() {
    const formContent = getFormHTML(null);
    openModal('File New Complaint', formContent, 'mid-large');

    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (modalOverlay && modalContent) {
        animateModalOpen(modalOverlay, modalContent, 'scale');
    }

    setTimeout(() => {
        const form = document.getElementById('complaintForm');
        if (form) {
            animateFormElements(form);
        }
    }, 100);

    const form = document.getElementById('complaintForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleComplaintSubmit(null);
        });
    }
}

export async function openEditComplaintModal(id) {
    try {
        const complaint = await getComplaintById(id);
        const formContent = getFormHTML(complaint);

        openModal('Edit Complaint Details', formContent, 'mid-large');

            const modalOverlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');
        if (modalOverlay && modalContent) {
            animateModalOpen(modalOverlay, modalContent, 'scale');
        }

            setTimeout(() => {
            const form = document.getElementById('complaintForm');
            if (form) {
                animateFormElements(form);
            }
        }, 100);

        const form = document.getElementById('complaintForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await handleComplaintSubmit(id);
            });
        }
    } catch (error) {
        console.error('Error loading complaint:', error);
        showToast('Failed to load complaint details', 'error');
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

export async function openViewComplaintModal(id) {
    try {
        const complaint = await getComplaintById(id);
        const dateFiled = new Date(complaint.dateCreated).toLocaleDateString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const badges = {
            'Pending': 'bg-amber-50 text-amber-800 border-amber-200',
            'In Progress': 'bg-blue-50 text-blue-900 border-blue-200',
            'Resolved': 'bg-emerald-50 text-emerald-800 border-emerald-200',
            'Rejected': 'bg-rose-50 text-rose-800 border-rose-200'
        };
        const badgeClass = badges[complaint.status] || 'bg-gray-50 text-gray-700 border-gray-200';

        let auditLogsContent = '<p class="text-sm text-gray-500">No audit history available.</p>';
        try {
            const auditLogs = await getComplaintAuditLogs(complaint.complaintId);
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
                                <span class="font-medium text-gray-700 block">${field}:</span>
                                <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                    <span class="text-red-600">${change.oldValue || '—'}</span>
                                    <span class="hidden sm:inline">→</span>
                                    <span class="text-green-600">${change.newValue || '—'}</span>
                                </div>
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
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                <div>
                                    <span class="text-sm font-medium text-gray-900">${log.adminName || log.adminEmail || 'Unknown Admin'}</span>
                                    <span class="text-xs text-gray-400 ml-2">${timestamp}</span>
                                </div>
                                <span class="text-xs px-2 py-0.5 rounded-full ${badgeClass} self-start">
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
            <div class="space-y-5">
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h3 class="text-base font-bold text-gray-900">${complaint.complainantName} <span class="text-gray-400 font-normal text-sm">vs</span> ${complaint.appellant}</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Blotter / Dispute Incident Case</p>
                    </div>
                    <div>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass}">
                            ${complaint.status || 'Pending'}
                        </span>
                    </div>
                </div>

                <hr class="border-gray-200">

                <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Case Information</h4>
                    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Complainant:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${complaint.complainantName}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Respondent / Appellant:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${complaint.appellant}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Date Filed:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${dateFiled}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Current Status:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${complaint.status}</dd>
                        </div>
                    </dl>
                </div>

                <div class="border-b border-gray-200 pb-4">
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Statement & Narrative</h4>
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-100 text-sm text-gray-800 leading-relaxed">
                        ${complaint.description}
                    </div>
                </div>

                <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Audit History</h4>
                    <div class="space-y-2 max-h-48 overflow-y-auto">
                        ${auditLogsContent}
                    </div>
                </div>

                <div class="flex justify-end pt-3 border-t border-gray-100 flex-col sm:flex-row gap-2">
                    <button 
                        type="button" 
                        onclick="closeComplaintModal()" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition">
                        Close
                    </button>
                </div>
            </div>
        `;

        openModal('Blotter & Complaint Details', content, 'mid-large');

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
    } catch (error) {
        console.error('Error loading complaint:', error);
        showToast('Failed to load complaint details', 'error');
    }
}

async function handleComplaintSubmit(id = null) {
    hideFormError();

    const formData = {
        complainantName: document.getElementById('complainantName').value.trim(),
        appellant: document.getElementById('appellant').value.trim(),
        description: document.getElementById('description').value.trim(),
        status: document.getElementById('status').value
    };

    const buttonText = id ? 'Save Changes' : 'File Complaint';
    const isEdit = id !== null;

    if (isEdit) {
        openConfirmDialog({
            title: 'Confirm Update',
            message: 'Are you sure you want to update this complaint record?',
            confirmText: 'Update',
            cancelText: 'Cancel',
            type: 'blue',
            onConfirm: async () => {
                showToast('Updating complaint...', 'loading');
                setModalButtonLoading('submitBtn', true, buttonText);
                try {
                    await updateComplaint(id, formData);
                    closeComplaintModal();
                    if (window.loadComplaints) {
                        window.loadComplaints();
                    }
                    updateToast('Complaint updated successfully', 'success');
                } catch (error) {
                    console.error('Error saving complaint:', error);
                    showFormError('Failed to save complaint. Please try again.');
                    setModalButtonLoading('submitBtn', false, buttonText);
                }
            }
        });
    } else {
        setModalButtonLoading('submitBtn', true, buttonText);
        try {
            await createComplaint(formData);
            closeComplaintModal();
            if (window.loadComplaints) {
                window.loadComplaints();
            }
            updateToast('Complaint recorded successfully', 'success');
        } catch (error) {
            console.error('Error saving complaint:', error);
            showFormError('Failed to save complaint. Please try again.');
            setModalButtonLoading('submitBtn', false, buttonText);
        }
    }
}

async function closeComplaintModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    
    if (modalOverlay && modalContent) {
        await animateModalClose(modalOverlay, modalContent, 'scale');
        clearModalAnimations(modalOverlay, modalContent);
        modalOverlay.remove();
        document.removeEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeComplaintModal();
        });
    } else {
        closeModal();
    }
}

window.closeComplaintModal = closeComplaintModal;
