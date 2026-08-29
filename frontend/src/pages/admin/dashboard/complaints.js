import { getAllComplaints, deleteComplaint } from '../../../api/admin/dashboard/complaints.js';
import { getUser } from '../../../api/admin/auth/login.js';
import { checkAuthAndRedirect } from '../../../api/token.js';
import { AdminNavbar, initAdminNavbar } from '../../../components/admin/navbar.js';
import { getSystemInfo } from '../../../api/admin/dashboard/settings/Systeminfo.js';
import { openAddComplaintModal, openEditComplaintModal, openViewComplaintModal } from '../../../components/modal/ComplaintsModal.js';
import { CrudMenu } from '../../../components/CrudMenu.js';
import { openConfirmDialog } from '../../../components/ConfirmDialog.js';
import { showToast, updateToast } from '../../../components/ToastMessage.js';
import { openExportExcelModal } from '../../../components/modal/ExportExcelModal.js';
import { skeletonTableRows } from '../../../components/SkeletonLoading.js';
import { initComplaintsAnimations, addTableRowHoverAnimations, addButtonHoverAnimations, animateTableRows, animateSearchInput } from '../../../provider/animations/ComplaintsAnimation.js';

let complaints = [];
let filteredComplaints = [];
let searchQuery = '';
let selectedStatus = '';

export function renderComplaintsPage() {
    if (!checkAuthAndRedirect()) {
        return '';
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
                        <h1 class="text-2xl font-semibold text-gray-900">Barangay Blotter & Complaints</h1>
                        <p class="text-sm text-gray-500 mt-1">Record, monitor, and resolve resident blotter reports, disputes, and incident complaints.</p>
                    </div>
                    <div class="flex items-center gap-2.5">
                        <button 
                            type="button" 
                            id="exportBtn" 
                            class="px-4 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition flex items-center gap-2 shadow-sm">
                            <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
                            <span>Export</span>
                        </button>
                        <button 
                            type="button" 
                            id="printBtn" 
                            class="px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition flex items-center gap-2 shadow-sm">
                            <i data-lucide="printer" class="w-4 h-4 text-gray-500"></i>
                            <span>Print Roster</span>
                        </button>
                        <button 
                            type="button" 
                            id="addComplaintBtn" 
                            class="px-4 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center gap-2 shadow-sm">
                            <i data-lucide="plus" class="w-4 h-4"></i>
                            <span>File Complaint</span>
                        </button>
                    </div>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                    <div class="flex flex-col sm:flex-row gap-3">
                        <div class="relative flex-1">
                            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
                            <input
                                type="text"
                                id="complaintSearch"
                                placeholder="Search by complainant, respondent, or case details…"
                                class="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                        <div class="relative w-full sm:w-48">
                            <select
                                id="statusFilter"
                                class="w-full appearance-none px-3 py-2 pr-8 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 transition cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <i data-lucide="chevron-down" class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"></i>
                        </div>
                    </div>
                    <div class="mt-3 flex items-center justify-between">
                        <p class="text-xs text-gray-500" id="complaintsCount">Loading complaints…</p>
                    </div>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div id="printArea" class="overflow-x-auto">
                        <table class="w-full text-sm text-left" id="complaintsTable">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <th class="px-5 py-3.5 w-12 text-center">#</th>
                                    <th class="px-5 py-3.5">Complainant</th>
                                    <th class="px-5 py-3.5 hidden sm:table-cell">Respondent / Appellant</th>
                                    <th class="px-5 py-3.5 hidden sm:table-cell">Incident Details</th>
                                    <th class="px-5 py-3.5 hidden sm:table-cell">Status</th>
                                    <th class="px-5 py-3.5 hidden sm:table-cell">Date Filed</th>
                                    <th class="px-5 py-3.5 text-center w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="complaintsTableBody" class="divide-y divide-gray-100">
                                ${skeletonTableRows(7, 7)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export function initComplaintsPage() {
    initAdminNavbar();
    loadComplaints();

    initComplaintsAnimations();
    addButtonHoverAnimations('button');
    addTableRowHoverAnimations('tbody tr');
    animateSearchInput('#complaintSearch');

    document.getElementById('exportBtn')?.addEventListener('click', () => {
        openExportExcelModal('complaints');
    });

    document.getElementById('addComplaintBtn')?.addEventListener('click', () => {
        openAddComplaintModal();
    });

    document.getElementById('printBtn')?.addEventListener('click', () => {
        printComplaints();
    });
    document.getElementById('complaintSearch')?.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        applyFilters();
    });
    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
        selectedStatus = e.target.value;
        applyFilters();
    });
}

async function loadComplaints() {
    const tbody = document.getElementById('complaintsTableBody');
    if (tbody) {
        tbody.innerHTML = skeletonTableRows(7, 7);
    }

    try {
        complaints = await getAllComplaints();
        applyFilters();
    } catch (error) {
        console.error('Error loading complaints:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-5 py-12 text-center text-gray-500">
                        <i data-lucide="wifi-off" class="w-8 h-8 text-gray-300 mx-auto mb-2"></i>
                        <p class="font-medium text-gray-700">Unable to load complaints</p>
                        <p class="text-xs mt-1">Please check your connection and try again.</p>
                    </td>
                </tr>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        updateCountLabel(0, 0);
    }
}
window.loadComplaints = loadComplaints;

function applyFilters() {
    filteredComplaints = complaints.filter(c => {
        const complainant = (c.complainantName || '').toLowerCase();
        const appellant = (c.appellant || '').toLowerCase();
        const desc = (c.description || '').toLowerCase();
        const status = c.status || '';

        const matchesSearch = !searchQuery ||
            complainant.includes(searchQuery) ||
            appellant.includes(searchQuery) ||
            desc.includes(searchQuery);

        const matchesStatus = !selectedStatus || status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    renderComplaintsTable();
    updateCountLabel(filteredComplaints.length, complaints.length);
}

function updateCountLabel(shown, total) {
    const el = document.getElementById('complaintsCount');
    if (!el) return;

    if (shown === total) {
        el.textContent = `${total} complaint record${total !== 1 ? 's' : ''} total`;
    } else {
        el.textContent = `Showing ${shown} of ${total} complaint record${total !== 1 ? 's' : ''}`;
    }
}

function getStatusBadge(status) {
    const badges = {
        'Pending': 'bg-amber-50 text-amber-800 border-amber-200',
        'In Progress': 'bg-blue-50 text-blue-900 border-blue-200',
        'Resolved': 'bg-emerald-50 text-emerald-800 border-emerald-200',
        'Rejected': 'bg-rose-50 text-rose-800 border-rose-200'
    };
    const badgeClass = badges[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}">${status || 'Pending'}</span>`;
}

function renderComplaintsTable() {
    const tbody = document.getElementById('complaintsTableBody');
    if (!tbody) return;

    if (filteredComplaints.length === 0) {
        const message = complaints.length === 0
            ? 'No incident complaints or blotters registered yet.'
            : 'No complaints match your search filter.';

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-5 py-12 text-center">
                    <i data-lucide="message-square-warning" class="w-10 h-10 text-gray-200 mx-auto mb-2"></i>
                    <p class="text-sm text-gray-500 font-medium">${message}</p>
                    ${complaints.length === 0 ? '<p class="text-xs text-gray-400 mt-1">Click "File Complaint" to record the first incident.</p>' : ''}
                </td>
            </tr>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    tbody.innerHTML = filteredComplaints.map((complaint, index) => {
        const dateFiled = new Date(complaint.dateCreated).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

        return `
        <tr class="hover:bg-gray-50 transition-colors cursor-pointer" onclick="viewComplaint('${complaint.complaintId}')">
            <td class="px-5 py-3.5 text-xs text-gray-400 text-center font-mono">
                ${index + 1}
            </td>

            <td class="px-5 py-3.5">
                <p class="text-sm font-semibold text-gray-900">${complaint.complainantName}</p>
            </td>

            <td class="px-5 py-3.5 text-sm text-gray-700 hidden sm:table-cell">
                ${complaint.appellant || '—'}
            </td>

            <td class="px-5 py-3.5 text-sm text-gray-600 max-w-xs truncate hidden sm:table-cell" title="${complaint.description}">
                ${complaint.description}
            </td>

            <td class="px-5 py-3.5 hidden sm:table-cell">
                ${getStatusBadge(complaint.status)}
            </td>

            <td class="px-5 py-3.5 text-xs text-gray-500 hidden sm:table-cell">
                ${dateFiled}
            </td>

            <td class="px-5 py-3.5 text-center" onclick="event.stopPropagation()">
                ${CrudMenu({ 
                    id: complaint.complaintId, 
                    onView: 'viewComplaint', 
                    onEdit: 'editComplaint', 
                    onDelete: 'confirmDeleteComplaint',
                    deleteLabel: complaint.complainantName 
                })}
            </td>
        </tr>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    animateTableRows('#complaintsTableBody tr');
}

window.viewComplaint = (id) => {
    openViewComplaintModal(id);
};

window.editComplaint = (id) => {
    openEditComplaintModal(id);
};

window.openAddComplaintModal = openAddComplaintModal;

window.confirmDeleteComplaint = (id, name) => {
    openConfirmDialog({
        title: 'Delete Complaint Record',
        message: `Are you sure you want to delete the complaint filed by ${name}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: async () => {
            await deleteComplaintById(id);
        }
    });
};

async function deleteComplaintById(id) {
    showToast('Deleting complaint...', 'loading');
    try {
        await deleteComplaint(id);
        await loadComplaints();
        updateToast('Complaint record deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting complaint:', error);
        updateToast('Failed to delete complaint. Please try again.', 'error');
    }
}

async function printComplaints() {
    const printArea = document.getElementById('printArea');
    if (!printArea) return;

    const tableClone = printArea.cloneNode(true);
    
    const rows = tableClone.querySelectorAll('tr');
    rows.forEach(row => {
        if (row.lastElementChild) {
            row.removeChild(row.lastElementChild);
        }
    });

    let systemInfo = null;
    try {
        systemInfo = await getSystemInfo();
    } catch (error) {
        console.log('Could not load system info, using defaults');
    }

    const barangayName = systemInfo?.barangayName || 'Pio del Pilar';
    const city = systemInfo?.city || 'Makati';
    const logoUrl = systemInfo?.logoUrl || null;

    const createPrintWindow = (logoSrc) => {
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Barangay Blotter & Complaints List</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    .header-container {
                        display: flex;
                        width: 100%;
                        align-items: center;
                        margin-bottom: 20px;
                    }
                    .col-left {
                        width: 16.66%;
                        padding: 0 12px;
                    }
                    .col-center {
                        width: 66.66%;
                        flex-grow: 1;
                        line-height: 1;
                    }
                    .col-right {
                        width: 16.66%;
                    }
                    .logo-container {
                        text-align: center;
                    }
                    .logo-container img {
                        width: 100px;
                        height: 100px;
                        object-fit: contain;
                    }
                    .header-text p {
                        margin: 5px 0;
                        text-align: center;
                    }
                    .header-text .large {
                        font-weight: bold;
                        font-size: 18px;
                    }
                    .header-text .title {
                        font-weight: bold;
                    }
                    hr {
                        margin: 10px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                </style>
            </head>
            <body>
                <div class="header-container">
                    <div class="col-left">
                        <div class="logo-container">
                            <img src="${logoSrc}" alt="Barangay Logo">
                        </div>
                    </div>
                    <div class="col-center header-text">
                        <p>Republic of the Philippines</p>
                        <p>${city}</p>
                        <div style="clear: both;"></div>
                        <p class="large">Barangay ${barangayName}</p>
                        <p class="title">Blotter & Incident Complaints List</p>
                    </div>
                    <div class="col-right">
                    </div>
                </div>
                <hr>
                ${tableClone.outerHTML}
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=1000,height=900');
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
            setTimeout(() => {
                printWindow.close();
            }, 200);
        }, 500);
    };

    if (logoUrl) {
        fetch(logoUrl)
            .then(response => {
                if (!response.ok) throw new Error('Logo not found');
                return response.blob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = function() {
                    createPrintWindow(reader.result);
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                console.error('Failed to load logo from system info:', error);
                createPrintWindow('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIExvZ288L3RleHQ+PC9zdmc+');
            });
    } else {
        createPrintWindow('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIExvZ288L3RleHQ+PC9zdmc+');
    }
}
