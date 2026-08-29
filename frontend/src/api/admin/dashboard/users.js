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

export async function getAllUsers() {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.USERS.GET_ALL, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getUserById(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.USERS.GET_BY_ID(id), {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function createUser(userData) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.USERS.CREATE, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create user');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function updateUser(id, userData) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.USERS.UPDATE(id), {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function deleteUser(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.USERS.DELETE(id), {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete user');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function uploadUserImage(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const token = getToken();
        if (!token) {
            window.location.hash = '#adminlogin';
            throw new Error('No valid token');
        }
        const response = await fetch(API_CONFIG.ENDPOINTS.USERS.UPLOAD_IMAGE, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload image');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getUserAuditLogs(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.USERS.AUDIT_LOGS(id), {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch user audit logs');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}
