const TOKEN_KEY = 'token';

export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
        return null;
    }
    
    return token;
}

export function isTokenValid() {
    return getToken() !== null;
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export function checkAuthAndRedirect() {
    if (!isTokenValid()) {
        window.location.hash = '#adminlogin';
        return false;
    }
    return true;
}

export function isAdmin() {
    const user = localStorage.getItem('user');
    if (!user) return false;
    const userData = JSON.parse(user);
    return userData.role === 'Admin';
}
