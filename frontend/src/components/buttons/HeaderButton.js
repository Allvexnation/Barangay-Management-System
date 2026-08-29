export function HeaderButton({ id, label, colorClass, hoverClass, onClick, iconName }) {
    return `
        <button id="${id}" class="${colorClass} ${hoverClass} text-white px-4 py-2 rounded-lg font-medium transition ${iconName ? 'flex items-center gap-2' : ''}">
            ${iconName ? `<i data-lucide="${iconName}" class="w-4 h-4"></i>` : ''}${label}
        </button>
    `;
}

export function HeaderButtonGroup({ buttons }) {
    return `
        <div class="flex gap-2">
            ${buttons.map(button => HeaderButton(button)).join('')}
        </div>
    `;
}
