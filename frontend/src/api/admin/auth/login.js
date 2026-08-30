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

        return data;
    } catch (error) {
        throw error;
    }
}

export function logout() {
    clearToken();
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

export async function getUser() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return null;
        }

        const response = await fetch(API_CONFIG.ENDPOINTS.ADMIN_AUTH.GET_CURRENT_USER, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        
        return {
            id: data.Id || data.id,
            email: data.Email || data.email,
            username: data.Username || data.username,
            firstName: data.FirstName || data.firstName,
            lastName: data.LastName || data.lastName,
            role: data.Role || data.role,
            profilePhoto: data.ProfilePhoto || data.profilePhoto
        };
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

