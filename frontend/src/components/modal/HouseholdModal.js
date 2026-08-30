import { openModal, closeModal, setModalButtonLoading } from '../../utils/modal.js';
import { openConfirmDialog } from '../ConfirmDialog.js';
import { uploadHouseholdImage, getHouseholdAuditLogs } from '../../api/admin/dashboard/household.js';
import { animateModalOpen, animateModalClose, clearModalAnimations, animateFormElements, clearFormAnimations, animateViewModalElements, clearViewModalAnimations } from './ModalAnimation.js';
import { openCropModal } from './CropModal.js';

let croppedHouseholdImage = null;

export function openHouseholdModal({ mode = 'add', household = null, puroks = [], onSubmit }) {
    croppedHouseholdImage = null;
    const isEdit = mode === 'edit';
    const title = isEdit ? 'Edit Household' : 'New Household';
    const buttonText = isEdit ? 'Save Changes' : 'Add Household';
    const existingImageUrl = isEdit && household?.imageUrl ? household.imageUrl : '';

    const purokOptions = puroks.map(p =>
        `<option value="${p.purokId}" ${isEdit && household?.purokId === p.purokId ? 'selected' : ''}>${p.purokName}</option>`
    ).join('');

    const formContent = `
        <form id="householdForm" class="space-y-5">
            ${isEdit ? `<input type="hidden" id="householdId" value="${household.id}">` : ''}
            ${isEdit && existingImageUrl ? `<input type="hidden" id="existingImageUrl" value="${existingImageUrl}">` : ''}

            <fieldset>
                <legend class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Photo</legend>
                <div class="space-y-3">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div id="imagePreviewContainer" class="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                            ${existingImageUrl 
                                ? `<img src="${existingImageUrl}" alt="Preview" class="w-full h-full object-cover" id="imagePreview">` 
                                : `<i data-lucide="user" class="w-8 h-8 text-gray-400" id="imagePreviewIcon"></i>`
                            }
                        </div>
                        <div class="flex-1 w-full">
                            <label for="imageUpload" class="block text-sm font-medium text-gray-700 mb-1">Upload Photo</label>
                            <input type="file" id="imageUpload" name="imageUpload" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                class="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 transition">
                            <p class="text-xs text-gray-400 mt-1">JPG, PNG, GIF, or WebP (max 5MB)</p>
                        </div>
                    </div>
                    <input type="hidden" id="imageUrl" name="imageUrl" value="${existingImageUrl}">
                </div>
            </fieldset>

            <hr class="border-gray-100">

            <fieldset>
                <legend class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</legend>
                <div class="space-y-3">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">First Name <span class="text-red-500">*</span></label>
                            <input type="text" id="firstName" name="firstName" value="${isEdit ? household.firstName : ''}" required
                                placeholder="e.g. Juan"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        </div>
                        <div>
                            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Last Name <span class="text-red-500">*</span></label>
                            <input type="text" id="lastName" name="lastName" value="${isEdit ? household.lastName : ''}" required
                                placeholder="e.g. Dela Cruz"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        </div>
                    </div>
                    <div>
                        <label for="middleName" class="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                        <input type="text" id="middleName" name="middleName" value="${isEdit ? (household.middleName || '') : ''}"
                            placeholder="Optional"
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    </div>
                    <div>
                        <label for="contact" class="block text-sm font-medium text-gray-700 mb-1">Contact Number <span class="text-red-500">*</span></label>
                        <input type="text" id="contact" name="contact" value="${isEdit ? household.contact : ''}" required
                            placeholder="e.g. 09171234567"
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    </div>
                </div>
            </fieldset>

            <hr class="border-gray-100">

            <fieldset>
                <legend class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Address & Location</legend>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label for="houseNo" class="block text-sm font-medium text-gray-700 mb-1">House Number <span class="text-red-500">*</span></label>
                        <input type="text" id="houseNo" name="houseNo" value="${isEdit ? household.houseNo : ''}" required
                            placeholder="e.g. 123"
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    </div>
                    <div>
                        <label for="purokId" class="block text-sm font-medium text-gray-700 mb-1">Purok <span class="text-red-500">*</span></label>
                        <select id="purokId" name="purokId" required
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition">
                            <option value="">Select Purok</option>
                            ${purokOptions}
                        </select>
                    </div>
                </div>
            </fieldset>

            <div id="formError" class="hidden text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"></div>

            <div class="flex justify-end pt-3 border-t border-gray-100 flex-row gap-2">
                <button 
                    type="button" 
                    onclick="closeHouseholdModal()" 
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

    openModal(title, formContent, 'mid-large');

    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (modalOverlay && modalContent) {
        animateModalOpen(modalOverlay, modalContent, 'scale');
    }

    setTimeout(() => {
        const form = document.getElementById('householdForm');
        if (form) {
            animateFormElements(form);
        }
    }, 100);

    const form = document.getElementById('householdForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await processHouseholdSubmit(isEdit ? household.id : null, buttonText, onSubmit);
        });
    }

    const imageUpload = document.getElementById('imageUpload');
    if (imageUpload) {
        imageUpload.addEventListener('change', handleImagePreview);
    }
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    const previewContainer = document.getElementById('imagePreviewContainer');
    const imageUrlInput = document.getElementById('imageUrl');
    
    if (!file) {
        const existingImageUrl = document.getElementById('existingImageUrl')?.value || '';
        if (existingImageUrl) {
            previewContainer.innerHTML = `<img src="${existingImageUrl}" alt="Preview" class="w-full h-full object-cover" id="imagePreview">`;
            imageUrlInput.value = existingImageUrl;
        } else {
            previewContainer.innerHTML = `<i data-lucide="user" class="w-8 h-8 text-gray-400" id="imagePreviewIcon"></i>`;
            imageUrlInput.value = '';
        }
        croppedHouseholdImage = null;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        e.target.value = '';
        showFormError('File size exceeds 5MB limit.');
        return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        e.target.value = '';
        showFormError('Invalid file type. Only images are allowed.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const imageSrc = event.target.result;
        
        const croppedFile = await openCropModal(imageSrc);
        
        if (croppedFile) {
            croppedHouseholdImage = croppedFile;
            e.target.value = '';
            const croppedReader = new FileReader();
            croppedReader.onload = (croppedEvent) => {
                previewContainer.innerHTML = `<img src="${croppedEvent.target.result}" alt="Preview" class="w-full h-full object-cover" id="imagePreview">`;
                imageUrlInput.value = croppedEvent.target.result;
            };
            croppedReader.readAsDataURL(croppedFile);
        } else {
            croppedHouseholdImage = null;
            const existingImageUrl = document.getElementById('existingImageUrl')?.value || '';
            if (existingImageUrl) {
                previewContainer.innerHTML = `<img src="${existingImageUrl}" alt="Preview" class="w-full h-full object-cover" id="imagePreview">`;
                imageUrlInput.value = existingImageUrl;
            } else {
                previewContainer.innerHTML = `<i data-lucide="user" class="w-8 h-8 text-gray-400" id="imagePreviewIcon"></i>`;
                imageUrlInput.value = '';
            }
            e.target.value = '';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    };
    reader.readAsDataURL(file);
    hideFormError();
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

async function processHouseholdSubmit(id, buttonText, onSubmit) {
    hideFormError();

    let imageUrl = document.getElementById('imageUrl').value;

    if (croppedHouseholdImage) {
        setModalButtonLoading('submitBtn', true, 'Uploading image...');
        try {
            const uploadResult = await uploadHouseholdImage(croppedHouseholdImage);
            imageUrl = uploadResult.imageUrl;
            document.getElementById('imageUrl').value = imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            showFormError(error.message || 'Failed to upload image. Please try again.');
            setModalButtonLoading('submitBtn', false, buttonText);
            return;
        }
    }

    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        middleName: document.getElementById('middleName').value.trim(),
        contact: document.getElementById('contact').value.trim(),
        houseNo: document.getElementById('houseNo').value.trim(),
        purokId: document.getElementById('purokId').value,
        imageUrl: imageUrl
    };

    const isEdit = id !== null;

    if (isEdit) {
        openConfirmDialog({
            title: 'Confirm Update',
            message: 'Are you sure you want to update this household details?',
            confirmText: 'Update',
            cancelText: 'Cancel',
            type: 'blue',
            onConfirm: async () => {
                setModalButtonLoading('submitBtn', true, buttonText);
                try {
                    await onSubmit(id, formData);
                    closeHouseholdModal();
                } catch (error) {
                    console.error('Error saving household:', error);
                    showFormError('Failed to save household. Please try again.');
                    setModalButtonLoading('submitBtn', false, buttonText);
                }
            }
        });
    } else {
        setModalButtonLoading('submitBtn', true, buttonText);
        try {
            await onSubmit(id, formData);
            closeHouseholdModal();
        } catch (error) {
            console.error('Error saving household:', error);
            showFormError('Failed to save household. Please try again.');
            setModalButtonLoading('submitBtn', false, buttonText);
        }
    }
}

export async function openViewHouseholdModal(household, puroks = []) {
    const dateRegistered = new Date(household.createdAt).toLocaleDateString('en-PH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const initials = getInitials(household.fullName);
    const hasImage = household.imageUrl && household.imageUrl.trim() !== '';

    const purok = Array.isArray(puroks) ? puroks.find(p => p.purokId === household.purokId) : null;
    const purokName = purok ? purok.purokName : household.purok || '—';

    let auditLogsContent = '<p class="text-sm text-gray-500">No audit history available.</p>';
    try {
        const auditLogs = await getHouseholdAuditLogs(household.id);
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
            <div class="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div class="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-blue-900 text-blue-100 flex items-center justify-center text-sm font-bold shadow-sm overflow-hidden mx-auto sm:mx-0">
                    ${hasImage 
                        ? `<img src="${household.imageUrl}" alt="${household.fullName}" class="w-full h-full object-cover">` 
                        : initials
                    }
                </div>
                <div class="text-center sm:text-left">
                    <h3 class="text-lg font-semibold text-gray-900">${household.fullName}</h3>
                    <span class="inline-flex items-center px-2.5 py-0.5 mt-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-900 border border-blue-200">
                        ${purokName}
                    </span>
                </div>
            </div>

            <div class="border-b border-gray-200 pb-4">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    ${detailItem('First Name', household.firstName)}
                    ${detailItem('Last Name', household.lastName)}
                    ${detailItem('Middle Name', household.middleName || '—')}
                    ${detailItem('Contact Number', household.contact)}
                </dl>
            </div>

            <div class="border-b border-gray-200 pb-4">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Address & Record</h4>
                <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    ${detailItem('House Number', household.houseNo)}
                    ${detailItem('Purok / Location', purokName)}
                    ${detailItem('Date Registered', dateRegistered)}
                </dl>
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
                    onclick="closeHouseholdModal()" 
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition">
                    Close
                </button>
            </div>
        </div>
    `;

    openModal('Household Details', content, 'mid-large');

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
}

function detailItem(label, value) {
    return `
        <div>
            <dt class="text-xs text-gray-400 font-medium">${label}</dt>
            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${value}</dd>
        </div>
    `;
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

async function closeHouseholdModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    
    if (modalOverlay && modalContent) {
        await animateModalClose(modalOverlay, modalContent, 'scale');
        clearModalAnimations(modalOverlay, modalContent);
        modalOverlay.remove();
        document.removeEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeHouseholdModal();
        });
    } else {
        closeModal();
    }
}

window.closeHouseholdModal = closeHouseholdModal;
