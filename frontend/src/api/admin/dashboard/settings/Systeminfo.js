import API_CONFIG from '../../../config.js';
import { getToken, clearToken } from '../../../token.js';

const getAuthHeaders = () => {
    const token = getToken();
    if (!token) {
        window.location.hash = '#adminlogin';
        throw new Error('No valid token');
    }
    return {
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

export async function getSystemInfo() {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.SYSTEM_INFO.GET, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch system info');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function createSystemInfo(systemInfoData) {
    try {
        const formData = new FormData();
        formData.append('barangayName', systemInfoData.barangayName);
        formData.append('city', systemInfoData.city);
        formData.append('province', systemInfoData.province);
        formData.append('zipCode', systemInfoData.zipCode);
        
        if (systemInfoData.logo) {
            formData.append('logo', systemInfoData.logo);
        }

        const response = await fetch(API_CONFIG.ENDPOINTS.SYSTEM_INFO.CREATE, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create system info');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function updateSystemInfo(systemInfoData) {
    try {
        const formData = new FormData();
        formData.append('barangayName', systemInfoData.barangayName);
        formData.append('city', systemInfoData.city);
        formData.append('province', systemInfoData.province);
        formData.append('zipCode', systemInfoData.zipCode);
        
        if (systemInfoData.logo) {
            formData.append('logo', systemInfoData.logo);
        }

        const response = await fetch(API_CONFIG.ENDPOINTS.SYSTEM_INFO.UPDATE, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: formData
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update system info');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function deleteSystemInfo() {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.SYSTEM_INFO.DELETE, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete system info');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getSystemInfoAuditLogs() {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.SYSTEM_INFO.AUDIT_LOGS, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch system info audit logs');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}
