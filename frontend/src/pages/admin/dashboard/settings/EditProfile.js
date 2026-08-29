import { getUser } from '../../../../api/admin/auth/login.js';
import { updateProfile, uploadProfilePhoto } from '../../../../api/admin/dashboard/settings/EditProfile.js';
import { AdminNavbar, initAdminNavbar } from '../../../../components/admin/navbar.js';
import { openConfirmDialog } from '../../../../components/ConfirmDialog.js';
import { showToast, updateToast } from '../../../../components/ToastMessage.js';
import { checkAuthAndRedirect } from '../../../../api/token.js';
import { initEditProfileAnimations } from '../../../../provider/animations/EditProfileAnimation.js';

export function EditProfilePage() {
    if (!checkAuthAndRedirect()) {
        return '';
    }

    const user = getUser() || {};
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const username = user.username || '';
    const role = user.role || 'Administrator';
    const profilePhoto = user.profilePhoto || '';

    const initials = (firstName || lastName) 
        ? `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
        : 'AD';

    const photoPreview = profilePhoto
        ? `<img id="profile-photo-img" src="${profilePhoto}" alt="Profile" class="w-full h-full object-cover rounded-full">`
        : `<div id="profile-initials-fallback" class="w-full h-full rounded-full bg-blue-900 text-blue-100 flex items-center justify-center text-2xl font-bold">${initials}</div>`;

    return `
        <div class="min-h-screen bg-gray-50">
            ${AdminNavbar()}

            <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div class="mb-6">
                    <h1 class="text-2xl font-semibold text-gray-900">Manage Account & Profile</h1>
                    <p class="text-sm text-gray-500 mt-1">Update your administrator credentials, personal details, and account security.</p>
                </div>

                <form id="edit-profile-form">
                    <input type="hidden" name="id" id="settingsId" value="${user.id || ''}">

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div class="lg:col-span-1">
                            <div class="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-sm flex flex-col items-center text-center">
                                <div class="w-full flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 text-left">
                                    <i data-lucide="user-circle" class="w-4 h-4 text-blue-900"></i>
                                    <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Profile Photo</h2>
                                </div>

                                <div class="relative group my-3">
                                    <div id="profilePhotoPreview" class="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 p-1 flex items-center justify-center overflow-hidden bg-gray-50 shadow-inner">
                                        ${photoPreview}
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <h3 class="text-base font-semibold text-gray-900" id="profileFullNameDisplay">${firstName} ${lastName}</h3>
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium bg-blue-50 text-blue-900 border border-blue-200">
                                        <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                        ${role}
                                    </span>
                                </div>

                                <label for="profilePhoto" class="w-full cursor-pointer px-4 py-2 text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition flex items-center justify-center gap-2">
                                    <i data-lucide="camera" class="w-3.5 h-3.5"></i>
                                    <span>Upload New Photo</span>
                                </label>
                                <input 
                                    type="file" 
                                    id="profilePhoto" 
                                    name="profilePhoto" 
                                    accept="image/png,image/jpeg,image/webp" 
                                    class="hidden">

                                <p class="text-[11px] text-gray-400 mt-2">JPG, PNG, or WEBP up to 2MB</p>
                            </div>
                        </div>

                        <div class="lg:col-span-2 space-y-6">
                            <div class="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-sm">
                                <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                    <i data-lucide="user" class="w-4 h-4 text-blue-900"></i>
                                    <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Personal Information</h2>
                                </div>

                                <div class="space-y-4">
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label for="settingsFirstName" class="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                                First Name <span class="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                name="firstName" 
                                                id="settingsFirstName" 
                                                value="${firstName}" 
                                                required 
                                                class="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                        </div>

                                        <div>
                                            <label for="settingsLastName" class="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                                Last Name <span class="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                name="lastName" 
                                                id="settingsLastName" 
                                                value="${lastName}" 
                                                required 
                                                class="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                        </div>
                                    </div>

                                    <div>
                                        <label for="settingsUsername" class="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                            Username / Login ID <span class="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            name="username" 
                                            id="settingsUsername" 
                                            value="${username}" 
                                            required 
                                            class="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-sm">
                                <div class="flex items-center gap-2 mb-2 pb-3 border-b border-gray-100">
                                    <i data-lucide="key-round" class="w-4 h-4 text-blue-900"></i>
                                    <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Change Password</h2>
                                </div>
                                <p class="text-xs text-gray-500 mb-4">Leave password fields blank if you do not wish to change your current password.</p>

                                <div class="space-y-4">
                                    <div>
                                        <label for="settingsOldPassword" class="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                            Current (Old) Password
                                        </label>
                                        <input 
                                            type="password" 
                                            name="old_password" 
                                            id="settingsOldPassword" 
                                            placeholder="Enter current password to verify"
                                            class="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                    </div>

                                    <div>
                                        <label for="settingsPassword" class="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                            New Password
                                        </label>
                                        <input 
                                            type="password" 
                                            name="password" 
                                            id="settingsPassword" 
                                            placeholder="Minimum 6 characters"
                                            class="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                        <button 
                            type="button" 
                            id="resetProfileBtn" 
                            class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition">
                            Reset Changes
                        </button>
                        <button 
                            type="submit" 
                            id="saveSettings" 
                            class="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center justify-center gap-2">
                            <i data-lucide="save" class="w-4 h-4"></i>
                            <span>Save Profile</span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    `;
}

export function initEditProfilePage() {
    initAdminNavbar();
    initEditProfileAnimations();

    const form = document.getElementById('edit-profile-form');
    const profilePhotoInput = document.getElementById('profilePhoto');
    const profilePhotoPreview = document.getElementById('profilePhotoPreview');
    const saveBtn = document.getElementById('saveSettings');
    const resetBtn = document.getElementById('resetProfileBtn');

    let selectedPhoto = null;

    if (profilePhotoInput && profilePhotoPreview) {
        profilePhotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedPhoto = file;
                const reader = new FileReader();
                reader.onload = (event) => {
                    profilePhotoPreview.innerHTML = `<img src="${event.target.result}" alt="Profile Preview" class="w-full h-full object-cover rounded-full">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            openConfirmDialog({
                title: 'Confirm Profile Update',
                message: 'Are you sure you want to save changes to your account profile?',
                confirmText: 'Save',
                cancelText: 'Cancel',
                type: 'blue',
                onConfirm: async () => {
                    await performProfileUpdate();
                }
            });
        });
    }

    async function performProfileUpdate() {
        showToast('Updating profile...', 'loading');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Saving...</span>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        try {
            const formData = {
                id: document.getElementById('settingsId').value,
                firstName: document.getElementById('settingsFirstName').value.trim(),
                lastName: document.getElementById('settingsLastName').value.trim(),
                username: document.getElementById('settingsUsername').value.trim(),
                password: document.getElementById('settingsPassword').value,
                old_password: document.getElementById('settingsOldPassword').value
            };

            if (selectedPhoto) {
                await uploadProfilePhoto(selectedPhoto);
            }

            const result = await updateProfile(formData);

            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            currentUser.id = result.id || result.Id || currentUser.id;
            currentUser.email = result.email || result.Email || currentUser.email;
            currentUser.username = result.username || result.Username || currentUser.username;
            currentUser.firstName = result.firstName || result.FirstName || currentUser.firstName;
            currentUser.lastName = result.lastName || result.LastName || currentUser.lastName;
            currentUser.role = result.role || result.Role || currentUser.role;
            currentUser.profilePhoto = result.profilePhoto || result.ProfilePhoto || currentUser.profilePhoto;
            localStorage.setItem('user', JSON.stringify(currentUser));

            const navUsername = document.getElementById('navUsername');
            if (navUsername) {
                const fName = currentUser.firstName;
                const lName = currentUser.lastName;
                const uName = currentUser.username;
                const fullName = fName && lName ? `${fName} ${lName}` : uName || 'User';
                navUsername.textContent = `Welcome, ${fullName}`;
            }

            const profileFullNameDisplay = document.getElementById('profileFullNameDisplay');
            if (profileFullNameDisplay) {
                profileFullNameDisplay.textContent = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`;
            }

            const newPasswordEl = document.getElementById('settingsPassword');
            const oldPasswordEl = document.getElementById('settingsOldPassword');
            if (newPasswordEl) newPasswordEl.value = '';
            if (oldPasswordEl) oldPasswordEl.value = '';

            selectedPhoto = null;
            if (profilePhotoInput) profilePhotoInput.value = '';

            updateToast('Profile updated successfully!', 'success');
        } catch (error) {
            updateToast(error.message || 'Failed to update profile', 'error');
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i><span>Save Profile</span>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const user = getUser() || {};
            const firstNameEl = document.getElementById('settingsFirstName');
            const lastNameEl = document.getElementById('settingsLastName');
            const usernameEl = document.getElementById('settingsUsername');
            const passwordEl = document.getElementById('settingsPassword');
            const oldPasswordEl = document.getElementById('settingsOldPassword');

            if (firstNameEl) firstNameEl.value = user.firstName || '';
            if (lastNameEl) lastNameEl.value = user.lastName || '';
            if (usernameEl) usernameEl.value = user.username || '';
            if (passwordEl) passwordEl.value = '';
            if (oldPasswordEl) oldPasswordEl.value = '';

            if (profilePhotoPreview) {
                const initials = (user.firstName || user.lastName) 
                    ? `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase()
                    : 'AD';
                if (user.profilePhoto) {
                    profilePhotoPreview.innerHTML = `<img src="${user.profilePhoto}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
                } else {
                    profilePhotoPreview.innerHTML = `<div class="w-full h-full rounded-full bg-blue-900 text-blue-100 flex items-center justify-center text-2xl font-bold">${initials}</div>`;
                }
            }

            selectedPhoto = null;
            if (profilePhotoInput) profilePhotoInput.value = '';
        });
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

export { EditProfilePage as renderEditProfilePage, EditProfilePage as EditProfile };

export function getSettingsModalHTML() {
    return '';
}

export function initSettingsModal() {
}
