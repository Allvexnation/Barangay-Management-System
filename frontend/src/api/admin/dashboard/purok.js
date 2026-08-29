import API_CONFIG from '../../config.js';
import { getToken, clearToken } from '../../token.js';

const getAuthHeaders = () => {
    const token = getToken();
    if (!token) {
        window.location.hash = '#adminlogin';
        throw new Error('No valid token');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const handleAuthError = (response) => {
    if (response.status === 401) {
        clearToken();
        window.location.hash = '#adminlogin';
        throw new Error('Session expired. Please login again.');
    }
    return response;
};

export async function getAllPuroks() {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.PUROK.GET_ALL, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch puroks');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getPurokById(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.PUROK.GET_BY_ID(id), {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch purok');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}
