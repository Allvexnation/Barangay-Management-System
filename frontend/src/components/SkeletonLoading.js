export function skeletonStatCard(variant = 'primary') {
    const bgColor = variant === 'primary' ? 'bg-gray-200' : 'bg-white border border-gray-200';
    const textColor = 'skeleton-shimmer';
    const iconColor = 'skeleton-shimmer';

    return `
        <div class="${bgColor} rounded-lg p-5">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="h-3 w-24 ${textColor} rounded mb-2"></div>
                    <div class="h-8 w-16 ${textColor} rounded"></div>
                </div>
                <div class="w-8 h-8 ${iconColor} rounded opacity-60"></div>
            </div>
        </div>
    `;
}

export function skeletonTableRow(columns = 5) {
    let cells = '';
    for (let i = 0; i < columns; i++) {
        const width = i === 0 ? 'w-20' : i === columns - 1 ? 'w-16' : 'w-full';
        cells += `
            <td class="px-5 py-3">
                <div class="h-4 ${width} skeleton-shimmer rounded"></div>
            </td>
        `;
    }

    return `
        <tr>
            ${cells}
        </tr>
    `;
}

export function skeletonTableRows(rows = 5, columns = 5) {
    return Array.from({ length: rows }, () => skeletonTableRow(columns)).join('');
}

export function skeletonTable(columns = 5, rows = 5) {
    return `
        <tbody>
            ${skeletonTableRows(rows, columns)}
        </tbody>
    `;
}

export function skeletonText(width = 'w-full', height = 'h-4') {
    return `
        <div class="${width} ${height} skeleton-shimmer rounded"></div>
    `;
}

export function skeletonAvatar(size = 'w-8 h-8') {
    return `
        <div class="${size} rounded-full skeleton-shimmer"></div>
    `;
}

export function skeletonButton(width = 'w-24', height = 'h-9') {
    return `
        <div class="${width} ${height} skeleton-shimmer rounded"></div>
    `;
}
