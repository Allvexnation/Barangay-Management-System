import { getSystemInfo, createSystemInfo, updateSystemInfo, getSystemInfoAuditLogs } from '../../../../api/admin/dashboard/settings/Systeminfo.js';
import { AdminNavbar, initAdminNavbar } from '../../../../components/admin/navbar.js';
import { openConfirmDialog } from '../../../../components/ConfirmDialog.js';
import { showToast, updateToast } from '../../../../components/ToastMessage.js';
import { getUser } from '../../../../api/admin/auth/login.js';
import { skeletonText, skeletonAvatar, skeletonButton } from '../../../../components/SkeletonLoading.js';
import { initSystemInfoAnimations, animateAuditLogs } from '../../../../provider/animations/SystemInfoAniamtion.js';
import { openCropModal } from '../../../../components/modal/CropModal.js';

let croppedLogoImage = null;

export async function SystemInfo() {
    const user = await getUser() || {};
    const userRole = user.role || 'Admin';
    
    if (userRole !== 'Admin') {
        return `
        <div class="min-h-screen bg-gray-50 flex items-center justify-center">
            <div class="text-center">
                <i data-lucide="lock" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
                <h1 class="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h1>
                <p class="text-gray-500">You do not have permission to access this page.</p>
            </div>
        </div>
        `;
    }

    const navbar = await AdminNavbar();

    return `
        <div class="min-h-screen bg-gray-50" style="overflow-y: auto;">
            ${navbar}

            <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div class="mb-6">
                    <h1 class="text-2xl font-semibold text-gray-900">Barangay & System Information</h1>
                    <p class="text-sm text-gray-500 mt-1">Configure your barangay's official details, jurisdiction, and official seal.</p>
                </div>

                <form id="system-info-form">
                    <div id="form-content" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div class="lg:col-span-2 space-y-6">
                            <div class="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-sm">
                                <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                    <i data-lucide="landmark" class="w-4 h-4 text-blue-900"></i>
                                    <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Jurisdiction Details</h2>
                                </div>

                                <div class="space-y-4">
                                    <div>
                                        <label for="barangayName" class="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                            Barangay Name <span class="text-red-500">*</span>
                                        </label>
                                        <div class="relative">
                                            <input 
                                                type="text" 
                                                id="barangayName" 
                                                name="barangayName" 
                                                placeholder="e.g. Pio del Pilar"
                                                class="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                required>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label for="city" class="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                                City / Municipality <span class="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                id="city" 
                                                name="city" 
                                                placeholder="e.g. Makati City"
                                                class="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                required>
                                        </div>

                                        <div>
                                            <label for="province" class="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                                Province <span class="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                id="province" 
                                                name="province" 
                                                placeholder="e.g. Metro Manila"
                                                class="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                required>
                                        </div>
                                    </div>

                                    <div>
                                        <label for="zipCode" class="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                            ZIP Code <span class="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            id="zipCode" 
                                            name="zipCode" 
                                            placeholder="e.g. 1230"
                                            class="w-full sm:w-1/2 px-3.5 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            required>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="lg:col-span-1">
                            <div class="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-sm flex flex-col items-center text-center">
                                <div class="w-full flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 text-left">
                                    <i data-lucide="shield" class="w-4 h-4 text-blue-900"></i>
                                    <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Official Seal</h2>
                                </div>

                                <div class="relative group my-2">
                                    <div class="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 p-1 flex items-center justify-center overflow-hidden bg-gray-50">
                                        <img id="logo-preview" 
                                            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='11' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Seal%3C/text%3E%3C/svg%3E"
                                            alt="Barangay Official Seal" 
                                            class="w-full h-full object-cover rounded-full">
                                    </div>
                                </div>

                                <p class="text-xs text-gray-500 mt-2 mb-4 leading-relaxed">
                                    Displayed on clearances, certifications, and system headers.
                                </p>

                                <label for="logo" class="w-full cursor-pointer px-4 py-2 text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition flex items-center justify-center gap-2">
                                    <i data-lucide="upload" class="w-3.5 h-3.5"></i>
                                    <span>Choose Seal File</span>
                                </label>
                                <input 
                                    type="file" 
                                    id="logo" 
                                    name="logo" 
                                    class="hidden"
                                    accept="image/png,image/jpeg,image/webp">

                                <p class="text-[11px] text-gray-400 mt-2">PNG, JPG, or WEBP up to 2MB</p>
                            </div>
                        </div>
                    </div>

                    <div id="form-skeleton" class="hidden grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div class="lg:col-span-2 space-y-6">
                            <div class="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-sm">
                                <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                    <i data-lucide="landmark" class="w-4 h-4 text-blue-900"></i>
                                    <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Jurisdiction Details</h2>
                                </div>

                                <div class="space-y-4">
                                    <div>
                                        <label for="barangayName" class="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                            Barangay Name <span class="text-red-500">*</span>
                                        </label>
                                        ${skeletonText('w-full', 'h-10')}
                                    </div>

                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label for="city" class="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                                City / Municipality <span class="text-red-500">*</span>
                                            </label>
                                            ${skeletonText('w-full', 'h-10')}
                                        </div>

                                        <div>
                                            <label for="province" class="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                                Province <span class="text-red-500">*</span>
                                            </label>
                                            ${skeletonText('w-full', 'h-10')}
                                        </div>
                                    </div>

                                    <div>
                                        <label for="zipCode" class="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">
                                            ZIP Code <span class="text-red-500">*</span>
                                        </label>
                                        ${skeletonText('w-1/2', 'h-10')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="lg:col-span-1">
                            <div class="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-sm flex flex-col items-center text-center">
                                <div class="w-full flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 text-left">
                                    <i data-lucide="shield" class="w-4 h-4 text-blue-900"></i>
                                    <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Official Seal</h2>
                                </div>

                                <div class="relative group my-2">
                                    ${skeletonAvatar('w-28 h-28')}
                                </div>

                                <p class="text-xs text-gray-500 mt-2 mb-4 leading-relaxed">
                                    Displayed on clearances, certifications, and system headers.
                                </p>

                                <label class="w-full cursor-pointer px-4 py-2 text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition flex items-center justify-center gap-2">
                                    <i data-lucide="upload" class="w-3.5 h-3.5"></i>
                                    <span>Choose Seal File</span>
                                </label>

                                <p class="text-[11px] text-gray-400 mt-2">PNG, JPG, or WEBP up to 2MB</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                        <button 
                            type="button" 
                            id="reset-btn"
                            class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition">
                            Reset Changes
                        </button>
                        <button 
                            type="submit" 
                            id="save-btn"
                            class="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center justify-center gap-2">
                            <i data-lucide="save" class="w-4 h-4"></i>
                            <span>Save Changes</span>
                        </button>
                    </div>
                </form>

                <div class="mt-6 bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-sm">
                    <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                        <i data-lucide="history" class="w-4 h-4 text-blue-900"></i>
                        <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Audit History</h2>
                    </div>
                    <div id="auditLogsContainer" class="space-y-2 max-h-96 overflow-y-auto">
                        ${Array.from({ length: 3 }, () => `
                            <div class="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div class="flex items-center justify-between mb-2">
                                    ${skeletonText('w-32', 'h-4')}
                                    ${skeletonText('w-16', 'h-4')}
                                </div>
                                <div class="space-y-1">
                                    ${skeletonText('w-full', 'h-3')}
                                    ${skeletonText('w-2/3', 'h-3')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </main>
        </div>
    `;
}

export function initSystemInfo() {
    initAdminNavbar();
    initSystemInfoAnimations();

    const form = document.getElementById('system-info-form');
    const logoInput = document.getElementById('logo');
    const logoPreview = document.getElementById('logo-preview');
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');
    const formContent = document.getElementById('form-content');
    const formSkeleton = document.getElementById('form-skeleton');

    let existingSystemInfo = null;
    let selectedLogo = null;

    const defaultSealPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='11' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Seal%3C/text%3E%3C/svg%3E";

    async function loadSystemInfo() {
        if (formContent && formSkeleton) {
            formContent.classList.add('hidden');
            formSkeleton.classList.remove('hidden');
        }

        try {
            const data = await getSystemInfo();
            existingSystemInfo = data;

            const barangayNameEl = document.getElementById('barangayName');
            const cityEl = document.getElementById('city');
            const provinceEl = document.getElementById('province');
            const zipCodeEl = document.getElementById('zipCode');

            if (barangayNameEl) barangayNameEl.value = data.barangayName || '';
            if (cityEl) cityEl.value = data.city || '';
            if (provinceEl) provinceEl.value = data.province || '';
            if (zipCodeEl) zipCodeEl.value = data.zipCode || '';

            if (data.logoUrl && logoPreview) {
                logoPreview.src = data.logoUrl;
            }
        } catch (error) {
            console.log('No existing system info found');
        } finally {
            if (formContent && formSkeleton) {
                formContent.classList.remove('hidden');
                formSkeleton.classList.add('hidden');
            }
        }
    }

    if (logoInput) {
        logoInput.addEventListener('change', async function (e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    showToast('File size exceeds 2MB limit.', 'error');
                    e.target.value = '';
                    return;
                }

                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    showToast('Invalid file type. Only JPG, PNG, or WEBP are allowed.', 'error');
                    e.target.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = async (event) => {
                    const imageSrc = event.target.result;
                    
                    const croppedFile = await openCropModal(imageSrc);
                    
                    if (croppedFile) {
                        croppedLogoImage = croppedFile;
                        e.target.value = '';
                        const croppedReader = new FileReader();
                        croppedReader.onload = (croppedEvent) => {
                            if (logoPreview) logoPreview.src = croppedEvent.target.result;
                        };
                        croppedReader.readAsDataURL(croppedFile);
                    } else {
                        croppedLogoImage = null;
                        e.target.value = '';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const isUpdate = existingSystemInfo !== null;
            const actionText = isUpdate ? 'update' : 'save';

            openConfirmDialog({
                title: isUpdate ? 'Confirm Update' : 'Confirm Save',
                message: `Are you sure you want to ${actionText} the barangay system information?`,
                confirmText: isUpdate ? 'Update' : 'Save',
                cancelText: 'Cancel',
                type: 'blue',
                onConfirm: async () => {
                    await performSave();
                }
            });
        });
    }

    async function performSave() {
        const loadingMessage = existingSystemInfo ? 'Updating system info...' : 'Saving system info...';
        const successMessage = existingSystemInfo ? 'System info updated successfully!' : 'System info saved successfully!';

        showToast(loadingMessage, 'loading');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Saving...</span>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        const systemInfoData = {
            barangayName: document.getElementById('barangayName').value.trim(),
            city: document.getElementById('city').value.trim(),
            province: document.getElementById('province').value.trim(),
            zipCode: document.getElementById('zipCode').value.trim(),
            logo: croppedLogoImage
        };

        try {
            let result;
            if (existingSystemInfo) {
                result = await updateSystemInfo(systemInfoData);
            } else {
                result = await createSystemInfo(systemInfoData);
            }

            updateToast(successMessage, 'success');
            existingSystemInfo = result;
            croppedLogoImage = null;
            if (logoInput) logoInput.value = '';
            loadAuditLogs();
        } catch (error) {
            updateToast(error.message || 'Failed to save system info', 'error');
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i><span>Save Changes</span>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            openConfirmDialog({
                title: 'Confirm Reset',
                message: 'Are you sure you want to reset the form? All unsaved changes will be lost.',
                confirmText: 'Reset',
                cancelText: 'Cancel',
                type: 'danger',
                onConfirm: () => {
                    performReset();
                }
            });
        });
    }

    function performReset() {
        if (existingSystemInfo) {
            const barangayNameEl = document.getElementById('barangayName');
            const cityEl = document.getElementById('city');
            const provinceEl = document.getElementById('province');
            const zipCodeEl = document.getElementById('zipCode');

            if (barangayNameEl) barangayNameEl.value = existingSystemInfo.barangayName || '';
            if (cityEl) cityEl.value = existingSystemInfo.city || '';
            if (provinceEl) provinceEl.value = existingSystemInfo.province || '';
            if (zipCodeEl) zipCodeEl.value = existingSystemInfo.zipCode || '';

            if (logoPreview) {
                logoPreview.src = existingSystemInfo.logoUrl || defaultSealPlaceholder;
            }
        } else if (form) {
            form.reset();
            if (logoPreview) {
                logoPreview.src = defaultSealPlaceholder;
            }
        }
        croppedLogoImage = null;
        if (logoInput) logoInput.value = '';
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    loadSystemInfo();
    loadAuditLogs();
}

async function loadAuditLogs() {
    const container = document.getElementById('auditLogsContainer');
    if (!container) return;

    container.innerHTML = Array.from({ length: 3 }, () => `
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div class="flex items-center justify-between mb-2">
                ${skeletonText('w-32', 'h-4')}
                ${skeletonText('w-16', 'h-4')}
            </div>
            <div class="space-y-1">
                ${skeletonText('w-full', 'h-3')}
                ${skeletonText('w-2/3', 'h-3')}
            </div>
        </div>
    `).join('');

    try {
        const auditLogs = await getSystemInfoAuditLogs();

        if (!auditLogs || auditLogs.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500">No audit history available.</p>';
            return;
        }

        container.innerHTML = auditLogs.map(log => {
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

        animateAuditLogs('#auditLogsContainer > div');
    } catch (error) {
        console.error('Error loading audit logs:', error);
        container.innerHTML = '<p class="text-sm text-red-500">Failed to load audit logs.</p>';
    }
}

