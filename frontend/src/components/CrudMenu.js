export function CrudMenu({ 
    id, 
    onView, 
    onEdit, 
    onDelete, 
    deleteLabel, 
    showView = true, 
    showEdit = true, 
    showDelete = true 
}) {
    const escapedLabel = deleteLabel ? deleteLabel.replace(/'/g, "\\'") : '';
    
    const viewHandler = onView ? `${onView}('${id}')` : `window.viewItem('${id}')`;
    const editHandler = onEdit ? `${onEdit}('${id}')` : `window.editItem('${id}')`;
    const deleteHandler = onDelete 
        ? `${onDelete}('${id}'${escapedLabel ? `, '${escapedLabel}'` : ''})` 
        : `window.deleteItem('${id}'${escapedLabel ? `, '${escapedLabel}'` : ''})`;

    let buttons = '';

    if (showView) {
        buttons += `
            <button 
                type="button"
                onclick="${viewHandler}" 
                class="group p-1.5 text-gray-500 hover:bg-blue-100/70 hover:text-blue-900 dark:hover:bg-white dark:hover:text-black rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-blue-400" 
                title="View Details"
                aria-label="View Details">
                <svg class="group-hover:stroke-current dark:group-hover:stroke-black" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            </button>
        `;
    }

    if (showEdit) {
        buttons += `
            <button 
                type="button"
                onclick="${editHandler}" 
                class="group p-1.5 text-gray-500 hover:bg-amber-100/70 hover:text-amber-800 dark:hover:bg-white dark:hover:text-black rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400" 
                title="Edit Record"
                aria-label="Edit Record">
                <svg class="group-hover:stroke-current dark:group-hover:stroke-black" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                </svg>
            </button>
        `;
    }

    if (showDelete) {
        buttons += `
            <button 
                type="button"
                onclick="${deleteHandler}" 
                class="group p-1.5 text-gray-500 hover:bg-red-100/70 hover:text-red-700 dark:hover:bg-white dark:hover:text-black rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-red-400" 
                title="Delete Record"
                aria-label="Delete Record">
                <svg class="group-hover:stroke-current dark:group-hover:stroke-black" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    <line x1="10" x2="10" y1="11" y2="17"/>
                    <line x1="14" x2="14" y1="11" y2="17"/>
                </svg>
            </button>
        `;
    }

    return `<div class="inline-flex items-center gap-0.5 bg-gray-50/80 p-0.5 rounded-lg border border-gray-200/70 shadow-xs" onclick="event.stopPropagation()">${buttons}</div>`;
}
