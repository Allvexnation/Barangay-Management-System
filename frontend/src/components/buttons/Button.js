export function Button({
    text = 'Button',
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    dataAction = null,
    id = null,
    onClick = null
} = {}) {
    const variants = {
        primary: 'bg-green-700 hover:bg-green-800 text-white',
        secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white',
        outline: 'border-2 border-green-700 text-green-700 hover:bg-green-50',
        white: 'text-gray-700 bg-white hover:bg-gray-50 shadow-none hover:shadow-none',
        blue: 'bg-blue-900 hover:bg-blue-800 text-white'
    };

    const sizes = {
        sm: 'py-2 px-3 text-sm',
        md: 'py-3 px-4',
        lg: 'py-4 px-6 text-lg'
    };

    const baseClasses = 'font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg';
    const variantClasses = variants[variant] || variants.primary;
    const sizeClasses = sizes[size] || sizes.md;
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    const classes = [baseClasses, variantClasses, sizeClasses, disabledClasses, className]
        .filter(Boolean)
        .join(' ');

    const dataActionAttr = dataAction ? `data-action="${dataAction}"` : '';
    const idAttr = id ? `id="${id}"` : '';
    const disabledAttr = disabled ? 'disabled' : '';
    const onClickAttr = onClick ? `onclick="${onClick}"` : '';

    return `<button type="${type}" ${dataActionAttr} ${idAttr} ${disabledAttr} ${onClickAttr} class="${classes}">${text}</button>`;
}
