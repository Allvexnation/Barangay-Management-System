import API_CONFIG from '../../config.js';
import { setToken, clearToken } from '../../token.js';

export async function login(email, password) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.ADMIN_AUTH.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify({
            id: data.Id || data.id,
            email: data.Email || data.email,
            username: data.Username || data.username,
            firstName: data.FirstName || data.firstName,
            lastName: data.LastName || data.lastName,
            role: data.Role || data.role,
            profilePhoto: data.ProfilePhoto || data.profilePhoto
        }));

        return data;
    } catch (error) {
        throw error;
    }
}

export function logout() {
    clearToken();
    localStorage.removeItem('user');
}

export function isAuthenticated() {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !tokenExpiry) {
        return false;
    }
    
    if (Date.now() > parseInt(tokenExpiry)) {
        logout();
        return false;
    }
    
    return true;
}

export function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}
