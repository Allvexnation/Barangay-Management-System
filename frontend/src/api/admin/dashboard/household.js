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

export async function getAllHouseholds() {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.HOUSEHOLD.GET_ALL, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch households');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getHouseholdById(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.HOUSEHOLD.GET_BY_ID(id), {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch household');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function createHousehold(householdData) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.HOUSEHOLD.CREATE, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(householdData)
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create household');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function updateHousehold(id, householdData) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.HOUSEHOLD.UPDATE(id), {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(householdData)
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update household');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function deleteHousehold(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.HOUSEHOLD.DELETE(id), {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete household');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function uploadHouseholdImage(file) {
    try {
        const token = getToken();
        if (!token) {
            window.location.hash = '#adminlogin';
            throw new Error('No valid token');
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(API_CONFIG.ENDPOINTS.HOUSEHOLD.UPLOAD, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        handleAuthError(response);

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorMessage = 'Failed to upload image';
            
            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
                }
            } else {
                errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
            }
            
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getHouseholdAuditLogs(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.HOUSEHOLD.AUDIT_LOGS(id), {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch audit logs');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}