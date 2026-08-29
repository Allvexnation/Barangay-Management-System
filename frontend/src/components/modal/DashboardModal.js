import { openModal } from '../../utils/modal.js';
import { animateModalOpen, animateViewModalElements } from './ModalAnimation.js';

export function showAuditLogDetails(index) {
    const log = window.auditLogsData?.[index];
    if (!log) return;

    const entityType = log.entityType || 'System';
    const displayEntityType = entityType
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/^./, str => str.toUpperCase());

    const timestamp = new Date(log.timestamp).toLocaleString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    function formatValue(value) {
        if (value === null || value === undefined) return 'N/A';

        if (typeof value === 'boolean') {
            if (value === true) {
                return `
                    <span class="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                        <i data-lucide="check" class="w-3 h-3"></i>
                        Yes
                    </span>
                `;
            } else {
                return `
                    <span class="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
                        <i data-lucide="x" class="w-3 h-3"></i>
                        No
                    </span>
                `;
            }
        }

        if (typeof value === 'object') {
            if (value.oldValue !== undefined || value.newValue !== undefined) {
                const oldVal = value.oldValue !== undefined ? formatValue(value.oldValue) : 'N/A';
                const newVal = value.newValue !== undefined ? formatValue(value.newValue) : 'N/A';
                return `
                    <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span class="text-red-600 line-through">${oldVal}</span>
                        <i data-lucide="arrow-right" class="w-3 h-3 text-gray-400 hidden sm:block"></i>
                        <span class="text-green-600 font-medium">${newVal}</span>
                    </div>
                `;
            }
            return `<pre class="text-xs bg-gray-100 text-gray-900 p-2 rounded overflow-x-auto">${JSON.stringify(value, null, 2)}</pre>`;
        }

        const strValue = String(value);
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        const isImageUrl = imageExtensions.some(ext => strValue.toLowerCase().includes(ext)) ||
                          strValue.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i);

        if (isImageUrl) {
            return `
                <div class="flex flex-col gap-2">
                    <img src="${strValue}" alt="Image" class="max-w-[200px] w-full h-20 object-contain rounded border border-gray-200" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <span class="text-xs text-gray-500 break-all hidden">Failed to load image</span>
                    <a href="${strValue}" target="_blank" class="text-blue-600 hover:text-blue-800 text-xs underline">Open image in new tab</a>
                </div>
            `;
        }

        return `<span class="text-gray-900">${strValue}</span>`;
    }

    let detailsContent = '';

    if (log.changes && Object.keys(log.changes).length > 0) {
        detailsContent += `
            <div class="mb-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Changes</h4>
                <div class="bg-blue-50 rounded p-3">
                    ${Object.entries(log.changes).map(([key, value]) => {
                        return `
                            <div class="mb-2 last:mb-0">
                                <span class="font-medium text-blue-800 block">${key}:</span>
                                <div class="ml-0 sm:ml-2 mt-1">${formatValue(value)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    if (log.newValues && Object.keys(log.newValues).length > 0) {
        detailsContent += `
            <div class="mb-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">New Values</h4>
                <div class="bg-green-50 rounded p-3">
                    ${Object.entries(log.newValues).map(([key, value]) => {
                        if (typeof value === 'object' && (value.oldValue !== undefined || value.newValue !== undefined)) {
                            const oldVal = value.oldValue !== undefined ? formatValue(value.oldValue) : 'N/A';
                            const newVal = value.newValue !== undefined ? formatValue(value.newValue) : 'N/A';
                            return `
                                <div class="mb-2 last:mb-0">
                                    <span class="font-medium text-green-800 block">${key}:</span>
                                    <div class="ml-0 sm:ml-2 mt-1">
                                        <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <span class="text-red-600 line-through">${oldVal}</span>
                                            <i data-lucide="arrow-right" class="w-3 h-3 text-gray-400 hidden sm:block"></i>
                                            <span class="text-green-600 font-medium">${newVal}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                        return `
                            <div class="mb-2 last:mb-0">
                                <span class="font-medium text-green-800 block">${key}:</span>
                                <div class="ml-0 sm:ml-2 mt-1">${formatValue(value)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    if (log.previousValues && Object.keys(log.previousValues).length > 0) {
        detailsContent += `
            <div class="mb-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Previous Values</h4>
                <div class="bg-yellow-50 rounded p-3">
                    ${Object.entries(log.previousValues).map(([key, value]) => {
                        if (typeof value === 'object' && (value.oldValue !== undefined || value.newValue !== undefined)) {
                            const oldVal = value.oldValue !== undefined ? formatValue(value.oldValue) : 'N/A';
                            const newVal = value.newValue !== undefined ? formatValue(value.newValue) : 'N/A';
                            return `
                                <div class="mb-2 last:mb-0">
                                    <span class="font-medium text-yellow-800 block">${key}:</span>
                                    <div class="ml-0 sm:ml-2 mt-1">
                                        <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <span class="text-red-600 line-through">${oldVal}</span>
                                            <i data-lucide="arrow-right" class="w-3 h-3 text-gray-400 hidden sm:block"></i>
                                            <span class="text-green-600 font-medium">${newVal}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                        return `
                            <div class="mb-2 last:mb-0">
                                <span class="font-medium text-yellow-800 block">${key}:</span>
                                <div class="ml-0 sm:ml-2 mt-1">${formatValue(value)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    if (!detailsContent) {
        detailsContent = '<p class="text-gray-500 text-sm">No detailed changes recorded.</p>';
    }

    const modalContent = `
        <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="text-gray-500 block">Entity Type:</span>
                    <span class="font-medium text-gray-900">${displayEntityType}</span>
                </div>
                <div>
                    <span class="text-gray-500 block">Entity ID:</span>
                    <span class="font-medium text-gray-900">${log.entityId || 'N/A'}</span>
                </div>
                <div>
                    <span class="text-gray-500 block">Action:</span>
                    <span class="font-medium text-gray-900">${log.action || 'Unknown'}</span>
                </div>
                <div>
                    <span class="text-gray-500 block">Timestamp:</span>
                    <span class="font-medium text-gray-900">${timestamp}</span>
                </div>
            </div>

            <hr class="border-gray-200">

            <div class="text-sm">
                <span class="text-gray-500">Performed by:</span>
                <div class="mt-1">
                    <span class="font-medium text-gray-900">${log.adminName || 'Unknown'}</span>
                    <span class="text-gray-400 ml-2">${log.adminRole || 'N/A'}</span>
                </div>
            </div>

            ${log.ipAddress ? `
                <div class="text-sm">
                    <span class="text-gray-500">IP Address:</span>
                    <span class="ml-2 font-medium text-gray-900">${log.ipAddress}</span>
                </div>
            ` : ''}

            <hr class="border-gray-200">

            ${detailsContent}
        </div>
    `;

    openModal('Audit Log Details', modalContent, 'large');

    const modalOverlay = document.getElementById('modal-overlay');
    const modalContentEl = document.getElementById('modal-content');
    if (modalOverlay && modalContentEl) {
        animateModalOpen(modalOverlay, modalContentEl, 'scale');
    }

    setTimeout(() => {
        const modalContentEl2 = document.getElementById('modal-content');
        if (modalContentEl2) {
            animateViewModalElements(modalContentEl2);
        }
    }, 100);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}
