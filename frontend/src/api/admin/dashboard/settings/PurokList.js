import { API_CONFIG } from '../../../config.js';
import { getToken, clearToken } from '../../../token.js';

const handleAuthError = (response) => {
    if (response.status === 401) {
        clearToken();
        window.location.hash = '#adminlogin';
        throw new Error('Session expired. Please login again.');
    }
    return response;
};

export async function getPuroks() {
    const token = getToken();
    if (!token) {
        window.location.hash = '#adminlogin';
        throw new Error('No valid token');
    }
    const response = await fetch(API_CONFIG.ENDPOINTS.PUROK.GET_ALL, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to fetch puroks');
    return response.json();
}

export async function getPurokById(id) {
    const token = getToken();
    if (!token) {
        window.location.hash = '#adminlogin';
        throw new Error('No valid token');
    }
    const response = await fetch(API_CONFIG.ENDPOINTS.PUROK.GET_BY_ID(id), {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to fetch purok');
    return response.json();
}

export async function createPurok(purokData) {
    const token = getToken();
    if (!token) {
        window.location.hash = '#adminlogin';
        throw new Error('No valid token');
    }
    const response = await fetch(API_CONFIG.ENDPOINTS.PUROK.CREATE, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(purokData)
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to create purok');
    return response.json();
}

export async function updatePurok(id, purokData) {
    const token = getToken();
    if (!token) {
        window.location.hash = '#adminlogin';
        throw new Error('No valid token');
    }
    const response = await fetch(API_CONFIG.ENDPOINTS.PUROK.UPDATE(id), {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(purokData)
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to update purok');
    return response.json();
}

export async function deletePurok(id) {
    const token = getToken();
    if (!token) {
        window.location.hash = '#adminlogin';
        throw new Error('No valid token');
    }
    const response = await fetch(API_CONFIG.ENDPOINTS.PUROK.DELETE(id), {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to delete purok');
    return response.json();
}

export async function getPurokAuditLogs(id) {
    const token = getToken();
    if (!token) {
        window.location.hash = '#adminlogin';
        throw new Error('No valid token');
    }
    const response = await fetch(API_CONFIG.ENDPOINTS.PUROK.AUDIT_LOGS(id), {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to fetch purok audit logs');
    return response.json();
}
