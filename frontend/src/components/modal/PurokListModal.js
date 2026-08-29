import { createPurok, updatePurok, getPurokAuditLogs, getPurokById } from '../../api/admin/dashboard/settings/PurokList.js';
import { openModal, closeModal, setModalButtonLoading } from '../../utils/modal.js';
import { openConfirmDialog } from '../ConfirmDialog.js';
import { showToast, updateToast } from '../ToastMessage.js';
import { animateModalOpen, animateModalClose, clearModalAnimations, animateFormElements, clearFormAnimations, animateViewModalElements, clearViewModalAnimations } from './ModalAnimation.js';

function getFormHTML(purok = null) {
    const isEdit = purok !== null;
    const buttonText = isEdit ? 'Save Changes' : 'Add Purok';

    return `
        <form id="purokForm" class="space-y-5">
            ${isEdit ? `<input type="hidden" id="purokId" value="${purok.id}">` : ''}

            <fieldset>
                <legend class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Purok Information</legend>
                <div class="space-y-3">
                    <div>
                        <label for="purokName" class="block text-sm font-medium text-gray-700 mb-1">Purok Name <span class="text-red-500">*</span></label>
                        <input type="text" id="purokName" name="purokName" value="${isEdit ? (purok.purokName || purok.name || '') : ''}" required
                            placeholder="e.g. Purok 1"
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    </div>

                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="description" name="description" rows="3"
                            placeholder="Brief description of the purok area or zone…"
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none">${isEdit ? (purok.description || '') : ''}</textarea>
                    </div>
                </div>
            </fieldset>

            <hr class="border-gray-100">

            <fieldset>
                <legend class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Settings</legend>
                <div class="space-y-3">
                    <div>
                        <div class="flex items-center justify-between">
                            <div>
                                <label for="isActive" class="text-sm font-medium text-gray-700">Active</label>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="isActive" name="isActive" ${!isEdit || purok.isActive ? 'checked' : ''} class="sr-only peer">
                                <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </fieldset>

            <div id="formError" class="hidden text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"></div>

            <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button 
                    type="button" 
                    onclick="closePurokModal()" 
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
    openModal('Add New Purok', formContent, 'medium');

    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (modalOverlay && modalContent) {
        animateModalOpen(modalOverlay, modalContent, 'scale');
    }

    setTimeout(() => {
        const form = document.getElementById('purokForm');
        if (form) {
            animateFormElements(form);
        }
    }, 100);

    const form = document.getElementById('purokForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handlePurokSubmit(null, onSuccess);
        });
    }
}

export async function openViewModal(id) {
    try {
        const purok = await getPurokById(id);
        
        let auditLogsContent = '<p class="text-sm text-gray-500">No audit history available.</p>';
        try {
            const auditLogs = await getPurokAuditLogs(id);
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
            <div class="space-y-5">
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h3 class="text-base font-bold text-gray-900">${purok.purokName || purok.name}</h3>
                        <p class="text-xs text-gray-500 mt-0.5">${purok.description || 'No description'}</p>
                    </div>
                    <div>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${purok.isActive ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}">
                            ${purok.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Purok Information</h4>
                    <dl class="grid grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Purok Name:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${purok.purokName || purok.name}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Description:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${purok.description || '—'}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Status:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${purok.isActive ? 'Active' : 'Inactive'}</dd>
                        </div>
                    </dl>
                </div>

                <hr class="border-gray-100">

                <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Audit History</h4>
                    <div class="space-y-2 max-h-48 overflow-y-auto">
                        ${auditLogsContent}
                    </div>
                </div>

                <div class="flex justify-end pt-3 border-t border-gray-100">
                    <button 
                        type="button" 
                        onclick="closePurokModal()" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition">
                        Close
                    </button>
                </div>
            </div>
        `;

        openModal('Purok Details', content, 'mid-large');

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
        console.error('Error loading purok:', error);
        showToast('Failed to load purok details', 'error');
    }
}

export function editPurok(purok, onSuccess) {
    const formContent = getFormHTML(purok);
    openModal('Edit Purok Details', formContent, 'medium');

    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (modalOverlay && modalContent) {
        animateModalOpen(modalOverlay, modalContent, 'scale');
    }

    setTimeout(() => {
        const form = document.getElementById('purokForm');
        if (form) {
            animateFormElements(form);
        }
    }, 100);

    const form = document.getElementById('purokForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handlePurokSubmit(purok.id, onSuccess);
        });
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

async function handlePurokSubmit(id = null, onSuccess) {
    hideFormError();

    const purokName = document.getElementById('purokName').value.trim();
    const description = document.getElementById('description').value.trim();
    const isActive = document.getElementById('isActive').checked;

    if (!purokName) {
        showFormError('Purok name is required');
        return;
    }

    const purokData = {
        purokName,
        description,
        isActive
    };

    const buttonText = id ? 'Save Changes' : 'Add Purok';
    const isEdit = id !== null;

    if (isEdit) {
        openConfirmDialog({
            title: 'Confirm Update',
            message: 'Are you sure you want to update this purok?',
            confirmText: 'Update',
            cancelText: 'Cancel',
            type: 'blue',
            onConfirm: async () => {
                showToast('Updating purok...', 'loading');
                setModalButtonLoading('submitBtn', true, buttonText);
                try {
                    await updatePurok(id, purokData);
                    closePurokModal();
                    if (onSuccess) {
                        await onSuccess();
                    }
                    updateToast('Purok updated successfully', 'success');
                } catch (error) {
                    console.error('Error saving purok:', error);
                    showFormError('Failed to save purok. Please try again.');
                    setModalButtonLoading('submitBtn', false, buttonText);
                }
            }
        });
    } else {
        setModalButtonLoading('submitBtn', true, buttonText);
        try {
            await createPurok(purokData);
            closePurokModal();
            if (onSuccess) {
                await onSuccess();
            }
            updateToast('Purok created successfully', 'success');
        } catch (error) {
            console.error('Error saving purok:', error);
            showFormError('Failed to save purok. Please try again.');
            setModalButtonLoading('submitBtn', false, buttonText);
        }
    }
}

async function closePurokModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    
    if (modalOverlay && modalContent) {
        await animateModalClose(modalOverlay, modalContent, 'scale');
        clearModalAnimations(modalOverlay, modalContent);
        modalOverlay.remove();
        document.removeEventListener('keydown', (e) => {
            if (e.key === 'Escape') closePurokModal();
        });
    } else {
        closeModal();
    }
}

window.closePurokModal = closePurokModal;

