export function ModalButton({ 
    id, 
    text, 
    type = 'button', 
    variant = 'primary', 
    onClick = null, 
    isLoading = false,
    originalText = null,
    disabled = false 
}) {
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-300 text-gray-700 hover:bg-gray-400',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-green-600 text-white hover:bg-green-700'
    };

    const baseClasses = 'px-4 py-2 rounded-lg transition';
    const variantClasses = variants[variant] || variants.primary;
    const loadingClasses = isLoading ? 'opacity-70 cursor-not-allowed' : '';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    const displayText = isLoading && originalText ? 'Loading...' : text;

    const buttonHtml = `<button 
        type="${type}" 
        id="${id || ''}"
        ${onClick ? `onclick="${onClick}"` : ''}
        ${disabled || isLoading ? 'disabled' : ''}
        class="${baseClasses} ${variantClasses} ${loadingClasses} ${disabledClasses}"
    >
        ${displayText}
    </button>`;

    return buttonHtml;
}
