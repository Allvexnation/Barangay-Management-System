const THEME_STORAGE_KEY = 'admin-theme';

export function getTheme() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme) {
        return storedTheme;
    }
    return 'system';
}

export function setTheme(theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
}

export function applyTheme(theme) {
    let effectiveTheme = theme;
    
    if (theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    const html = document.documentElement;
    
    if (effectiveTheme === 'dark') {
        html.classList.add('dark');
        html.classList.remove('light');
    } else {
        html.classList.add('light');
        html.classList.remove('dark');
    }
}

export function initTheme() {
    const theme = getTheme();
    applyTheme(theme);

    if (theme === 'system') {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            applyTheme('system');
        });
    }
}

export function getThemeIcon(theme) {
    switch (theme) {
        case 'light':
            return 'sun';
        case 'dark':
            return 'moon';
        case 'system':
            return 'monitor';
        default:
            return 'monitor';
    }
}
