import { getAllUsers, deleteUser } from '../../../api/admin/dashboard/users.js';
import { checkAuthAndRedirect, isAdmin } from '../../../api/token.js';
import { AdminNavbar, initAdminNavbar } from '../../../components/admin/navbar.js';
import { openAddUserModal, openEditUserModal, openViewUserModal } from '../../../components/modal/UsersModal.js';
import { CrudMenu } from '../../../components/CrudMenu.js';
import { openConfirmDialog } from '../../../components/ConfirmDialog.js';
import { showToast, updateToast } from '../../../components/ToastMessage.js';
import { skeletonTableRows } from '../../../components/SkeletonLoading.js';
import { initUsersAnimations, animateTableRows } from '../../../provider/animations/UsersAnimation.js';

let users = [];
let filteredUsers = [];
let searchQuery = '';
let selectedRole = '';

export function renderUsersPage() {
    if (!checkAuthAndRedirect()) {
        return '';
    }
    
    if (!isAdmin()) {
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
    
    return `
        <style>
            ::-webkit-scrollbar {
                width: 0px !important;
                height: 0px !important;
                display: none !important;
            }
            ::-webkit-scrollbar-track {
                background: transparent !important;
            }
            ::-webkit-scrollbar-thumb {
                background: transparent !important;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: transparent !important;
            }
            * {
                scrollbar-width: none !important;
                scrollbar-color: transparent transparent !important;
            }
        </style>
        <div class="min-h-screen bg-gray-50" style="overflow: hidden;">
            ${AdminNavbar()}

            <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 class="text-2xl font-semibold text-gray-900">User Management</h1>
                        <p class="text-sm text-gray-500 mt-1">Directory of staff and administrators with system access.</p>
                    </div>
                    <div class="flex items-center gap-2.5">
                        <button 
                            type="button" 
                            id="addUserBtn" 
                            class="px-4 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center gap-2 shadow-sm">
                            <i data-lucide="user-plus" class="w-4 h-4"></i>
                            <span>Add User</span>
                        </button>
                    </div>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                    <div class="flex flex-col sm:flex-row gap-3">
                        <div class="relative flex-1">
                            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
                            <input
                                type="text"
                                id="userSearch"
                                placeholder="Search by name, email, or role…"
                                class="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                        <div class="relative w-full sm:w-48">
                            <select
                                id="roleFilter"
                                class="w-full appearance-none px-3 py-2 pr-8 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 transition cursor-pointer"
                            >
                                <option value="">All Roles</option>
                                <option value="Admin">Admin</option>
                                <option value="Staff">Staff</option>
                            </select>
                            <i data-lucide="chevron-down" class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"></i>
                        </div>
                    </div>
                    <div class="mt-3 flex items-center justify-between">
                        <p class="text-xs text-gray-500" id="usersCount">Loading users…</p>
                    </div>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <th class="px-5 py-3.5 w-12 text-center">#</th>
                                    <th class="px-5 py-3.5">User Name</th>
                                    <th class="px-5 py-3.5 hidden sm:table-cell">Email Address</th>
                                    <th class="px-5 py-3.5 hidden sm:table-cell">Role</th>
                                    <th class="px-5 py-3.5 hidden sm:table-cell">Date Added</th>
                                    <th class="px-5 py-3.5 text-center w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="usersTableBody" class="divide-y divide-gray-100">
                                ${skeletonTableRows(6, 6)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export function initUsersPage() {
    initAdminNavbar();
    loadUsers();
    initUsersAnimations();

    document.getElementById('addUserBtn')?.addEventListener('click', () => {
        openAddUserModal(loadUsers);
    });
    document.getElementById('userSearch')?.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        applyFilters();
    });
    document.getElementById('roleFilter')?.addEventListener('change', (e) => {
        selectedRole = e.target.value;
        applyFilters();
    });
}

async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (tbody) {
        tbody.innerHTML = skeletonTableRows(6, 6);
    }

    try {
        users = await getAllUsers();
        applyFilters();
    } catch (error) {
        console.error('Error loading users:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-5 py-12 text-center text-gray-500">
                        <i data-lucide="wifi-off" class="w-8 h-8 text-gray-300 mx-auto mb-2"></i>
                        <p class="font-medium text-gray-700">Unable to load users</p>
                        <p class="text-xs mt-1">Please check your connection and try again.</p>
                    </td>
                </tr>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        updateCountLabel(0, 0);
    }
}

function applyFilters() {
    filteredUsers = users.filter(user => {
        const name = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const role = (user.role || '').toLowerCase();

        const matchesSearch = !searchQuery ||
            name.includes(searchQuery) ||
            email.includes(searchQuery) ||
            role.includes(searchQuery);

        const matchesRole = !selectedRole || user.role === selectedRole;

        return matchesSearch && matchesRole;
    });

    renderUsersTable();
    updateCountLabel(filteredUsers.length, users.length);
}

function updateCountLabel(shown, total) {
    const el = document.getElementById('usersCount');
    if (!el) return;

    if (shown === total) {
        el.textContent = `${total} user${total !== 1 ? 's' : ''} total`;
    } else {
        el.textContent = `Showing ${shown} of ${total} user${total !== 1 ? 's' : ''}`;
    }
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name) {
    const colors = [
        'bg-blue-900 text-blue-100',
        'bg-slate-700 text-slate-100',
        'bg-emerald-800 text-emerald-100',
        'bg-indigo-800 text-indigo-100',
        'bg-stone-700 text-stone-100',
        'bg-teal-800 text-teal-100',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (filteredUsers.length === 0) {
        const message = users.length === 0
            ? 'No users registered yet.'
            : 'No users match your search filter.';

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-5 py-12 text-center">
                    <i data-lucide="users" class="w-10 h-10 text-gray-200 mx-auto mb-2"></i>
                    <p class="text-sm text-gray-500 font-medium">${message}</p>
                    ${users.length === 0 ? '<p class="text-xs text-gray-400 mt-1">Click "Add User" to add the first record.</p>' : ''}
                </td>
            </tr>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    tbody.innerHTML = filteredUsers.map((user, index) => {
        const dateAdded = new Date(user.createdAt).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
        const fullName = `${user.firstName} ${user.lastName}`;
        const initials = getInitials(fullName);
        const avatarColor = getAvatarColor(fullName);

        return `
        <tr class="hover:bg-gray-50 transition-colors cursor-pointer" onclick="editUser('${user.id}')">
            <td class="px-5 py-3.5 text-xs text-gray-400 text-center font-mono">
                ${index + 1}
            </td>

            <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                    ${user.photoUrl 
                        ? `<img src="${user.photoUrl}" alt="${fullName}" class="flex-shrink-0 w-8 h-8 rounded-full object-cover border border-gray-200">`
                        : `<div class="flex-shrink-0 w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-xs font-semibold">
                            ${initials}
                        </div>`
                    }
                    <div>
                        <p class="text-sm font-semibold text-gray-900">${fullName}</p>
                    </div>
                </div>
            </td>

            <td class="px-5 py-3.5 text-sm text-gray-600 hidden sm:table-cell">
                ${user.email}
            </td>

            <td class="px-5 py-3.5 hidden sm:table-cell">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-purple-50 text-purple-900 border border-purple-200' : 'bg-blue-50 text-blue-900 border border-blue-200'}">
                    ${user.role}
                </span>
            </td>

            <td class="px-5 py-3.5 text-xs text-gray-500 hidden sm:table-cell">
                ${dateAdded}
            </td>

            <td class="px-5 py-3.5 text-center" onclick="event.stopPropagation()">
                ${CrudMenu({ 
                    id: user.id, 
                    onEdit: 'editUser', 
                    onView: 'viewUser',
                    onDelete: 'confirmDeleteUser',
                    deleteLabel: fullName 
                })}
            </td>
        </tr>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    animateTableRows('#usersTableBody tr');
}

window.editUser = (id) => {
    openEditUserModal(id, loadUsers);
};

window.viewUser = (id) => {
    openViewUserModal(id);
};

window.confirmDeleteUser = (id, name) => {
    openConfirmDialog({
        title: 'Delete User',
        message: `Are you sure you want to delete ${name} from the user list?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: async () => {
            await deleteUserById(id);
        }
    });
};

async function deleteUserById(id) {
    showToast('Deleting user...', 'loading');
    try {
        await deleteUser(id);
        await loadUsers();
        updateToast('User deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting user:', error);
        updateToast('Failed to delete user. Please try again.', 'error');
    }
}

