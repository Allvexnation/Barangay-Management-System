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

export async function getPositions() {
    const token = getToken();
    if (!token) {
        window.location.hash = '#adminlogin';
        throw new Error('No valid token');
    }
    const response = await fetch(API_CONFIG.ENDPOINTS.POSITION.GET_ALL, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to fetch positions');
    return response.json();
}

export async function getPositionById(id) {
    const token = getToken();
    if (!token) {
        window.location.hash = '#adminlogin';
        throw new Error('No valid token');
    }
    const response = await fetch(API_CONFIG.ENDPOINTS.POSITION.GET_BY_ID(id), {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to fetch position');
    return response.json();
}

export async function createPosition(positionData) {
    const token = getToken();
    if (!token) {
        window.location.hash = '#adminlogin';
        throw new Error('No valid token');
    }
    const response = await fetch(API_CONFIG.ENDPOINTS.POSITION.CREATE, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(positionData)
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to create position');
    return response.json();
}

export async function updatePosition(id, positionData) {
    const token = getToken();
    if (!token) {
        window.location.hash = '#adminlogin';
        throw new Error('No valid token');
    }
    const response = await fetch(API_CONFIG.ENDPOINTS.POSITION.UPDATE(id), {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(positionData)
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to update position');
    return response.json();
}

export async function deletePosition(id) {
    const token = getToken();
    if (!token) {
        window.location.hash = '#adminlogin';
        throw new Error('No valid token');
    }
    const response = await fetch(API_CONFIG.ENDPOINTS.POSITION.DELETE(id), {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to delete position');
    return response.json();
}

export async function getPositionAuditLogs(id) {
    const token = getToken();
    if (!token) {
        window.location.hash = '#adminlogin';
        throw new Error('No valid token');
    }
    const response = await fetch(API_CONFIG.ENDPOINTS.POSITION.AUDIT_LOGS(id), {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to fetch position audit logs');
    return response.json();
}
