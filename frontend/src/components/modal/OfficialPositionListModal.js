import { createPosition, updatePosition, getPositionAuditLogs, getPositionById } from '../../api/admin/dashboard/settings/OfficialPositionList.js';
import { openModal, closeModal, setModalButtonLoading } from '../../utils/modal.js';
import { openConfirmDialog } from '../ConfirmDialog.js';
import { showToast, updateToast } from '../ToastMessage.js';
import { animateModalOpen, animateModalClose, clearModalAnimations, animateFormElements, clearFormAnimations, animateViewModalElements, clearViewModalAnimations } from './ModalAnimation.js';

function getFormHTML(position = null) {
    const isEdit = position !== null;
    const buttonText = isEdit ? 'Save Changes' : 'Add Position';

    return `
        <form id="positionForm" class="space-y-5">
            ${isEdit ? `<input type="hidden" id="positionId" value="${position.id}">` : ''}

            <div class="border-b border-gray-200 pb-4">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Position Information</h4>
                <div class="space-y-3">
                    <div>
                        <label for="positionName" class="block text-sm font-medium text-gray-700 mb-1">Position Name <span class="text-red-500">*</span></label>
                        <input type="text" id="positionName" name="positionName" value="${isEdit ? (position.positionName || '') : ''}" required
                            placeholder="e.g. Barangay Captain"
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    </div>

                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="description" name="description" rows="3"
                            placeholder="Brief description of the position role and responsibilities…"
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none">${isEdit ? (position.description || '') : ''}</textarea>
                    </div>
                </div>
            </div>

            <div class="border-b border-gray-200 pb-4">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Settings</h4>
                <div class="space-y-3">
                    <div>
                        <div class="flex items-center justify-between">
                            <div>
                                <label for="isApprover" class="text-sm font-medium text-gray-700">As Signatory</label>
                                <p class="text-xs text-gray-500 mt-0.5">Check if this position can sign documents</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="isApprover" name="isApprover" ${isEdit && position.isApprover ? 'checked' : ''} class="sr-only peer">
                                <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                    <div>
                        <div class="flex items-center justify-between">
                            <div>
                                <label for="isActive" class="text-sm font-medium text-gray-700">Active</label>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="isActive" name="isActive" ${!isEdit || position.isActive ? 'checked' : ''} class="sr-only peer">
                                <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div id="formError" class="hidden text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"></div>

            <div class="flex justify-end pt-3 border-t border-gray-100 flex-row gap-2">
                <button 
                    type="button" 
                    onclick="closePositionModal()" 
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

export function openAddModal(onSuccess) {
    const formContent = getFormHTML(null);
    openModal('Add New Position', formContent, 'medium');

    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (modalOverlay && modalContent) {
        animateModalOpen(modalOverlay, modalContent, 'scale');
    }

    setTimeout(() => {
        const form = document.getElementById('positionForm');
        if (form) {
            animateFormElements(form);
        }
    }, 100);

    const form = document.getElementById('positionForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handlePositionSubmit(null, onSuccess);
        });
    }
}

export async function openViewModal(id) {
    try {
        const position = await getPositionById(id);
        
        let auditLogsContent = '<p class="text-sm text-gray-500">No audit history available.</p>';
        try {
            const auditLogs = await getPositionAuditLogs(id);
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
                        <h3 class="text-base font-bold text-gray-900">${position.positionName}</h3>
                        <p class="text-xs text-gray-500 mt-0.5">${position.description || 'No description'}</p>
                    </div>
                    <div>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${position.isApprover ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}">
                            ${position.isApprover ? 'Signatory' : 'Non-Signatory'}
                        </span>
                    </div>
                </div>

                <hr class="border-gray-200">

                <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Position Information</h4>
                    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Position Name:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${position.positionName}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Description:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${position.description || '—'}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Can Sign Documents:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${position.isApprover ? 'Yes' : 'No'}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Status:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${position.isActive ? 'Active' : 'Inactive'}</dd>
                        </div>
                    </dl>
                </div>

                <hr class="border-gray-200">

                <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Audit History</h4>
                    <div class="space-y-2 max-h-48 overflow-y-auto">
                        ${auditLogsContent}
                    </div>
                </div>

                <div class="flex justify-end pt-3 border-t border-gray-100">
                    <button 
                        type="button" 
                        onclick="closePositionModal()" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition">
                        Close
                    </button>
                </div>
            </div>
        `;

        openModal('Position Details', content, 'mid-large');

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
        console.error('Error loading position:', error);
        showToast('Failed to load position details', 'error');
    }
}

export function editPosition(position, onSuccess) {
    const formContent = getFormHTML(position);
    openModal('Edit Position Details', formContent, 'medium');

    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (modalOverlay && modalContent) {
        animateModalOpen(modalOverlay, modalContent, 'scale');
    }

    setTimeout(() => {
        const form = document.getElementById('positionForm');
        if (form) {
            animateFormElements(form);
        }
    }, 100);

    const form = document.getElementById('positionForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handlePositionSubmit(position.id, onSuccess);
        });
    }

    loadAuditLogs(position.id);
}

async function loadAuditLogs(id) {
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent) return;

    try {
        const auditLogs = await getPositionAuditLogs(id);
        
        if (!auditLogs || auditLogs.length === 0) {
            return;
        }

        const auditLogsHtml = auditLogs.map(log => {
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

        const auditSection = `
            <hr class="border-gray-200 mt-4">
            <div>
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Audit History</h4>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                    ${auditLogsHtml}
                </div>
            </div>
        `;

        const formElement = document.getElementById('positionForm');
        if (formElement) {
            formElement.insertAdjacentHTML('beforeend', auditSection);
        }
    } catch (error) {
        console.error('Error loading audit logs:', error);
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

async function handlePositionSubmit(id = null, onSuccess) {
    hideFormError();

    const positionName = document.getElementById('positionName').value.trim();
    const description = document.getElementById('description').value.trim();
    const isApprover = document.getElementById('isApprover').checked;
    const isActive = document.getElementById('isActive').checked;

    if (!positionName) {
        showFormError('Position name is required');
        return;
    }

    const positionData = {
        positionName,
        description,
        isApprover,
        isActive
    };

    const buttonText = id ? 'Save Changes' : 'Add Position';
    const isEdit = id !== null;

    if (isEdit) {
        openConfirmDialog({
            title: 'Confirm Update',
            message: 'Are you sure you want to update this position?',
            confirmText: 'Update',
            cancelText: 'Cancel',
            type: 'blue',
            onConfirm: async () => {
                showToast('Updating position...', 'loading');
                setModalButtonLoading('submitBtn', true, buttonText);
                try {
                    await updatePosition(id, positionData);
                    closePositionModal();
                    if (onSuccess) {
                        await onSuccess();
                    }
                    updateToast('Position updated successfully', 'success');
                } catch (error) {
                    console.error('Error saving position:', error);
                    showFormError('Failed to save position. Please try again.');
                    setModalButtonLoading('submitBtn', false, buttonText);
                }
            }
        });
    } else {
        setModalButtonLoading('submitBtn', true, buttonText);
        try {
            await createPosition(positionData);
            closePositionModal();
            if (onSuccess) {
                await onSuccess();
            }
            updateToast('Position created successfully', 'success');
        } catch (error) {
            console.error('Error saving position:', error);
            showFormError('Failed to save position. Please try again.');
            setModalButtonLoading('submitBtn', false, buttonText);
        }
    }
}

async function closePositionModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    
    if (modalOverlay && modalContent) {
        await animateModalClose(modalOverlay, modalContent, 'scale');
        clearModalAnimations(modalOverlay, modalContent);
        modalOverlay.remove();
        document.removeEventListener('keydown', (e) => {
            if (e.key === 'Escape') closePositionModal();
        });
    } else {
        closeModal();
    }
}

window.closePositionModal = closePositionModal;

