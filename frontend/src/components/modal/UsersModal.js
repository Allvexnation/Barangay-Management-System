import { createUser, updateUser, getUserById, uploadUserImage, getUserAuditLogs } from '../../api/admin/dashboard/users.js';
import { openModal, closeModal, setModalButtonLoading } from '../../utils/modal.js';
import { openConfirmDialog } from '../ConfirmDialog.js';
import { showToast, updateToast } from '../ToastMessage.js';
import { animateModalOpen, animateModalClose, clearModalAnimations, animateFormElements, clearFormAnimations, animateViewModalElements, clearViewModalAnimations } from './ModalAnimation.js';

export function openAddUserModal(onSuccess) {
    const formContent = `
        <form id="userForm" class="space-y-5">
            <fieldset>
                <legend class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Profile Photo</legend>
                <div class="space-y-3">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div id="imagePreviewContainer" class="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                            <i data-lucide="user" class="w-8 h-8 text-gray-400" id="imagePreviewIcon"></i>
                        </div>
                        <div class="flex-1 w-full">
                            <label for="photoFile" class="block text-sm font-medium text-gray-700 mb-1">Upload Photo</label>
                            <input type="file" id="photoFile" name="photoFile" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                class="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 transition">
                            <p class="text-xs text-gray-400 mt-1">JPG, PNG, GIF, or WebP (max 5MB)</p>
                        </div>
                    </div>
                    <input type="hidden" id="photoUrl" name="photoUrl">
                </div>
            </fieldset>

            <div class="border-b border-gray-200 pb-4">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                <div class="space-y-3">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">First Name <span class="text-red-500">*</span></label>
                            <input type="text" id="firstName" name="firstName" required
                                placeholder="e.g. Juan"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        </div>
                        <div>
                            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Last Name <span class="text-red-500">*</span></label>
                            <input type="text" id="lastName" name="lastName" required
                                placeholder="e.g. Dela Cruz"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        </div>
                    </div>
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address <span class="text-red-500">*</span></label>
                        <input type="email" id="email" name="email" required
                            placeholder="e.g. juan@example.com"
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    </div>
                </div>
            </div>

            <div class="border-b border-gray-200 pb-4">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Account Details</h4>
                <div class="space-y-3">
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password <span class="text-red-500">*</span></label>
                        <input type="password" id="password" name="password" required
                            placeholder="Enter password"
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    </div>
                    <div>
                        <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role <span class="text-red-500">*</span></label>
                        <select id="role" name="role" required
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition">
                            <option value="Staff">Staff</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            <div id="formError" class="hidden text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"></div>

            <div class="flex justify-end pt-3 border-t border-gray-100 flex-row gap-2">
                <button 
                    type="button" 
                    onclick="closeUserModal()" 
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition">
                    Cancel
                </button>
                <button 
                    type="submit" 
                    id="submitBtn" 
                    class="px-5 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition">
                    Add User
                </button>
            </div>
        </form>
    `;

    openModal('New User', formContent, 'mid-large');

    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (modalOverlay && modalContent) {
        animateModalOpen(modalOverlay, modalContent, 'scale');
    }

    setTimeout(() => {
        const form = document.getElementById('userForm');
        if (form) {
            animateFormElements(form);
        }
    }, 100);

    const form = document.getElementById('userForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleUserSubmit(null, onSuccess);
    });

    const photoFile = document.getElementById('photoFile');
    if (photoFile) {
        photoFile.addEventListener('change', handleImagePreview);
    }
}

export async function openEditUserModal(id, onSuccess) {
    try {
        const user = await getUserById(id);
        
        const formContent = `
            <form id="userForm" class="space-y-5">
                <input type="hidden" id="userId" value="${user.id}">

                <fieldset>
                    <legend class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Profile Photo</legend>
                    <div class="space-y-3">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div id="imagePreviewContainer" class="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                ${user.photoUrl 
                                    ? `<img src="${user.photoUrl}" alt="Preview" class="w-full h-full object-cover" id="imagePreview">` 
                                    : `<i data-lucide="user" class="w-8 h-8 text-gray-400" id="imagePreviewIcon"></i>`
                                }
                            </div>
                            <div class="flex-1">
                                <label for="photoFile" class="block text-sm font-medium text-gray-700 mb-1">Upload Photo</label>
                                <input type="file" id="photoFile" name="photoFile" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    class="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 transition">
                                <p class="text-xs text-gray-400 mt-1">JPG, PNG, GIF, or WebP (max 5MB)</p>
                            </div>
                        </div>
                        <input type="hidden" id="photoUrl" name="photoUrl" value="${user.photoUrl || ''}">
                        ${user.photoUrl ? `<input type="hidden" id="existingPhotoUrl" value="${user.photoUrl}">` : ''}
                    </div>
                </fieldset>

                <div class="border-b border-gray-200 pb-4">
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                    <div class="space-y-3">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">First Name <span class="text-red-500">*</span></label>
                                <input type="text" id="firstName" name="firstName" value="${user.firstName}" required
                                    placeholder="e.g. Juan"
                                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                            </div>
                            <div>
                                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Last Name <span class="text-red-500">*</span></label>
                                <input type="text" id="lastName" name="lastName" value="${user.lastName}" required
                                    placeholder="e.g. Dela Cruz"
                                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                            </div>
                        </div>
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address <span class="text-red-500">*</span></label>
                            <input type="email" id="email" name="email" value="${user.email}" required
                                placeholder="e.g. juan@example.com"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        </div>
                    </div>
                </div>

                <div class="border-b border-gray-200 pb-4">
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Account Details</h4>
                    <div class="space-y-3">
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep current)</label>
                            <input type="password" id="password" name="password"
                                placeholder="Enter new password"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        </div>
                        <div>
                            <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role <span class="text-red-500">*</span></label>
                            <select id="role" name="role" required
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition">
                            <option value="Staff" ${user.role === 'Staff' ? 'selected' : ''}>Staff</option>
                            <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                        </select>
                        </div>
                    </div>
                </div>

                <div id="formError" class="hidden text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"></div>

                <div class="flex justify-end pt-3 border-t border-gray-100 flex-row gap-2">
                    <button 
                        type="button" 
                        onclick="closeUserModal()" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition">
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        id="submitBtn" 
                        class="px-5 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition">
                        Save Changes
                    </button>
                </div>
            </form>
        `;

        openModal('Edit User', formContent, 'mid-large');

        const modalOverlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');
        if (modalOverlay && modalContent) {
            animateModalOpen(modalOverlay, modalContent, 'scale');
        }

        setTimeout(() => {
            const form = document.getElementById('userForm');
            if (form) {
                animateFormElements(form);
            }
        }, 100);

        const form = document.getElementById('userForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleUserSubmit(id, onSuccess);
        });

        const photoFile = document.getElementById('photoFile');
        if (photoFile) {
            photoFile.addEventListener('change', handleImagePreview);
        }
    } catch (error) {
        console.error('Error loading user:', error);
        showToast('Failed to load user details', 'error');
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

function handleImagePreview(e) {
    const file = e.target.files[0];
    const previewContainer = document.getElementById('imagePreviewContainer');
    const photoUrlInput = document.getElementById('photoUrl');
    
    if (!file) {
        const existingPhotoUrl = document.getElementById('existingPhotoUrl')?.value || '';
        if (existingPhotoUrl) {
            previewContainer.innerHTML = `<img src="${existingPhotoUrl}" alt="Preview" class="w-full h-full object-cover" id="imagePreview">`;
            photoUrlInput.value = existingPhotoUrl;
        } else {
            previewContainer.innerHTML = `<i data-lucide="user" class="w-8 h-8 text-gray-400" id="imagePreviewIcon"></i>`;
            photoUrlInput.value = '';
        }
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
    reader.onload = (event) => {
        previewContainer.innerHTML = `<img src="${event.target.result}" alt="Preview" class="w-full h-full object-cover" id="imagePreview">`;
    };
    reader.readAsDataURL(file);
    hideFormError();
}

async function handleUserSubmit(id = null, onSuccess) {
    hideFormError();

    const photoFileInput = document.getElementById('photoFile');
    let photoUrl = document.getElementById('photoUrl').value || null;

    const buttonText = id ? 'Save Changes' : 'Add User';
    const isEdit = id !== null;

    const loadingMessage = id ? 'Updating user...' : 'Creating user...';
    const successMessage = id ? 'User updated successfully' : 'User created successfully';

    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        role: document.getElementById('role').value,
        photoUrl: photoUrl
    };
    const password = document.getElementById('password').value;

    if (password) {
        formData.password = password;
    }

    if (isEdit) {
        if (password) {
            const confirmContent = `
                <div class="space-y-4">
                    <p class="text-sm text-gray-700">Are you sure you want to update this user's password?</p>
                    <div>
                        <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Your Current Password <span class="text-red-500">*</span></label>
                        <input type="password" id="currentPassword" name="currentPassword"
                            placeholder="Enter your current password to confirm"
                            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        <p class="text-xs text-gray-500 mt-1">Required to change password</p>
                    </div>
                    <div class="flex justify-end pt-3 border-t border-gray-100 flex-col sm:flex-row gap-2">
                        <button 
                            type="button" 
                            id="cancelPasswordChange"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition">
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            id="confirmPasswordChange"
                            class="px-5 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition">
                            Confirm
                        </button>
                    </div>
                </div>
            `;
            
            openModal('Confirm Password Change', confirmContent, 'mid');
            
            document.getElementById('cancelPasswordChange')?.addEventListener('click', () => {
                closeUserModal();
            });
            
            document.getElementById('confirmPasswordChange')?.addEventListener('click', async () => {
                const currentPassword = document.getElementById('currentPassword')?.value || '';
                if (!currentPassword) {
                    alert('Please enter your current password to confirm the password change.');
                    return;
                }
                formData.currentPassword = currentPassword;
                closeUserModal();
                setModalButtonLoading('submitBtn', true, buttonText);
                try {
                    await performUserSubmit(id, onSuccess, photoFileInput, formData, buttonText, loadingMessage, successMessage);
                } catch (error) {
                    console.error('Error saving user:', error);
                    showFormError('Failed to update user. Please try again.');
                    setModalButtonLoading('submitBtn', false, buttonText);
                }
            });
        } else {
            openConfirmDialog({
                title: 'Confirm Update',
                message: 'Are you sure you want to update this user details?',
                confirmText: 'Update',
                cancelText: 'Cancel',
                type: 'blue',
                onConfirm: async () => {
                    setModalButtonLoading('submitBtn', true, buttonText);
                    try {
                        await performUserSubmit(id, onSuccess, photoFileInput, formData, buttonText, loadingMessage, successMessage);
                    } catch (error) {
                        console.error('Error saving user:', error);
                        showFormError('Failed to update user. Please try again.');
                        setModalButtonLoading('submitBtn', false, buttonText);
                    }
                }
            });
        }
    } else {
        setModalButtonLoading('submitBtn', true, buttonText);
        try {
            await performUserSubmit(id, onSuccess, photoFileInput, formData, buttonText, loadingMessage, successMessage);
        } catch (error) {
            console.error('Error saving user:', error);
            showFormError('Failed to create user. Please try again.');
            setModalButtonLoading('submitBtn', false, buttonText);
        }
    }
}

async function performUserSubmit(id, onSuccess, photoFileInput, formData, buttonText, loadingMessage, successMessage) {
    showToast(loadingMessage, 'loading');

    try {
        if (photoFileInput && photoFileInput.files.length > 0) {
            try {
                const uploadResult = await uploadUserImage(photoFileInput.files[0]);
                formData.photoUrl = uploadResult.url;
            } catch (uploadError) {
                console.warn('Image upload failed, continuing without photo:', uploadError);
                showToast('Image upload failed. User will be saved without a photo.', 'warning');
            }
        }

        if (id) {
            await updateUser(id, formData);
        } else {
            await createUser(formData);
        }
        closeUserModal();
        if (onSuccess) {
            await onSuccess();
        }
        updateToast(successMessage, 'success');
    } catch (error) {
        console.error('Error saving user:', error);
        updateToast('Failed to save user. Please try again.', 'error');
        throw error;
    }
}

export async function openViewUserModal(id) {
    try {
        const user = await getUserById(id);
        const dateAdded = new Date(user.createdAt).toLocaleDateString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const fullName = `${user.firstName} ${user.lastName}`;

        let auditLogsContent = '<p class="text-sm text-gray-500">No audit history available.</p>';
        try {
            const auditLogs = await getUserAuditLogs(user.id);
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
                    <div class="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-blue-900 text-blue-100 flex items-center justify-center text-sm font-semibold shadow-sm overflow-hidden mx-auto sm:mx-0">
                        ${user.photoUrl
                            ? `<img src="${user.photoUrl}" alt="${fullName}" class="w-full h-full object-cover">`
                            : fullName.split(' ').map(n => n[0]).join('').toUpperCase()
                        }
                    </div>
                    <div class="text-center sm:text-left flex-1">
                        <h3 class="text-base font-bold text-gray-900">${fullName}</h3>
                        <p class="text-xs text-gray-500 mt-0.5">${user.email}</p>
                        <div class="flex justify-center sm:justify-start mt-0.5">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-purple-50 text-purple-900 border border-purple-200' : 'bg-blue-50 text-blue-900 border border-blue-200'}">
                                ${user.role}
                            </span>
                        </div>
                    </div>
                </div>

                <hr class="border-gray-200">

                <div class="pt-4 pb-4">
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">User Information</h4>
                    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">First Name:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${user.firstName}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Last Name:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${user.lastName}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Email:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${user.email}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Role:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${user.role}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Date Added:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${dateAdded}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-gray-400 font-medium">Status:</dt>
                            <dd class="text-sm font-semibold text-gray-900 mt-0.5">${user.isActive ? 'Active' : 'Inactive'}</dd>
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

                <div class="flex justify-end pt-3 border-t border-gray-100 flex-col sm:flex-row gap-2">
                    <button 
                        type="button" 
                        onclick="closeUserModal()" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition">
                        Close
                    </button>
                </div>
            </div>
        `;

        openModal('User Details', content, 'mid-large');

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
        console.error('Error loading user:', error);
        showToast('Failed to load user details', 'error');
    }
}

async function closeUserModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    
    if (modalOverlay && modalContent) {
        await animateModalClose(modalOverlay, modalContent, 'scale');
        clearModalAnimations(modalOverlay, modalContent);
        modalOverlay.remove();
        document.removeEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeUserModal();
        });
    } else {
        closeModal();
    }
}

window.closeUserModal = closeUserModal;
