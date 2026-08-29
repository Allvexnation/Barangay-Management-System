import { getAllOfficials } from '../../../api/admin/dashboard/officials.js';
import { checkAuthAndRedirect } from '../../../api/token.js';
import { AdminNavbar, initAdminNavbar } from '../../../components/admin/navbar.js';
import { printClearanceList } from '../../../components/print/ClearancePrint.js';
import * as BusinessClearance from './clearance/business.js';
import * as IndividualClearance from './clearance/Individual.js';
import { openExportExcelModal } from '../../../components/modal/ExportExcelModal.js';
import { skeletonTableRows } from '../../../components/SkeletonLoading.js';
import { initClearanceAnimations, addTableRowHoverAnimations, addButtonHoverAnimations, animateSearchInput } from '../../../provider/animations/ClearanceAnimation.js';

let officials = [];
let currentType = 'individual';

export function renderClearancePage() {
    if (!checkAuthAndRedirect()) {
        return '';
    }

    const hash = window.location.hash;
    currentType = hash === '#clearance-business' ? 'business' : 'individual';
    const isIndividual = currentType === 'individual';
    
    const pageTitle = isIndividual ? 'Individual Clearance' : 'Business Clearance';
    const pageSubtitle = isIndividual 
        ? 'Directory of issued individual clearances, certificates of residency, and good moral.' 
        : 'Directory of registered business clearances and permits.';
    const addBtnLabel = isIndividual ? 'Issue Clearance' : 'Add Business Clearance';

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
                        <h1 class="text-2xl font-semibold text-gray-900">${pageTitle}</h1>
                        <p class="text-sm text-gray-500 mt-1">${pageSubtitle}</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button 
                            type="button" 
                            id="exportBtn" 
                            class="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition flex items-center justify-center gap-2 shadow-sm">
                            <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
                            <span class="sm:hidden">Export</span>
                            <span class="hidden sm:inline">Export</span>
                        </button>
                        <button 
                            type="button" 
                            id="printBtn" 
                            class="flex-1 sm:flex-none px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition flex items-center justify-center gap-2 shadow-sm">
                            <i data-lucide="printer" class="w-4 h-4 text-gray-500"></i>
                            <span class="sm:hidden">Print</span>
                            <span class="hidden sm:inline">Print Roster</span>
                        </button>
                        <button 
                            type="button" 
                            id="addClearanceBtn" 
                            class="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center justify-center gap-2 shadow-sm">
                            <i data-lucide="plus" class="w-4 h-4"></i>
                            <span class="sm:hidden">Add</span>
                            <span class="hidden sm:inline">${addBtnLabel}</span>
                        </button>
                    </div>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                    <div class="flex flex-col sm:flex-row gap-3">
                        <div class="relative flex-1">
                            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
                            <input
                                type="text"
                                id="clearanceSearch"
                                placeholder="${isIndividual ? 'Search by applicant name, purpose, contact, or OR #…' : 'Search by business name, owner, or OR #…'}"
                                class="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                    </div>
                    <div class="mt-3 flex items-center justify-between">
                        <p class="text-xs text-gray-500" id="clearanceCount">Loading clearances…</p>
                    </div>
                </div>
                <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div id="outprint" class="overflow-x-auto">
                        <table class="w-full text-sm text-left" id="clearanceTable">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ${isIndividual ? `
                                        <th class="px-5 py-3.5 w-12 text-center">#</th>
                                        <th class="px-5 py-3.5">Applicant Name</th>
                                        <th class="px-5 py-3.5 hidden sm:table-cell">Purpose / Certificate</th>
                                        <th class="px-5 py-3.5 hidden sm:table-cell">OR Number</th>
                                        <th class="px-5 py-3.5 hidden sm:table-cell">Contact Number</th>
                                        <th class="px-5 py-3.5 hidden sm:table-cell">Date Issued</th>
                                    ` : `
                                        <th class="px-5 py-3.5 w-12 text-center">#</th>
                                        <th class="px-5 py-3.5">Business Name</th>
                                        <th class="px-5 py-3.5 hidden sm:table-cell">Owner Name</th>
                                        <th class="px-5 py-3.5 hidden sm:table-cell">Business Type</th>
                                        <th class="px-5 py-3.5 hidden sm:table-cell">OR Number</th>
                                        <th class="px-5 py-3.5 hidden sm:table-cell">Date Issued</th>
                                    `}
                                    <th class="px-5 py-3.5 text-center w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="clearanceTableBody" class="divide-y divide-gray-100">
                                ${skeletonTableRows(7, 7)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export function initClearancePage() {
    initAdminNavbar();
    loadOfficials();
    
    initClearanceAnimations();
    addButtonHoverAnimations('button');
    addTableRowHoverAnimations('tbody tr');
    animateSearchInput('#clearanceSearch');
    
    if (currentType === 'individual') {
        IndividualClearance.loadIndividualClearances();
    } else {
        BusinessClearance.loadBusinessClearances();
    }

    document.getElementById('exportBtn')?.addEventListener('click', () => {
        openExportExcelModal('clearance');
    });

    document.getElementById('addClearanceBtn')?.addEventListener('click', () => {
        if (currentType === 'individual') {
            IndividualClearance.openAddIndividualModal();
        } else {
            BusinessClearance.openAddBusinessModal();
        }
    });

    document.getElementById('printBtn')?.addEventListener('click', () => {
        printClearanceList(currentType);
    });
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

async function loadOfficials() {
    try {
        officials = await getAllOfficials();
        BusinessClearance.setOfficials(officials);
        IndividualClearance.setOfficials(officials);
    } catch (error) {
        console.error('Error loading officials:', error);
    }
}
