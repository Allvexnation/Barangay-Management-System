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

export async function getAllOfficials() {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.OFFICIALS.GET_ALL, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch officials');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getOfficialById(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.OFFICIALS.GET_BY_ID(id), {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch official');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getPositions() {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.OFFICIALS.GET_POSITIONS, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch positions');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function createOfficial(officialData) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.OFFICIALS.CREATE, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(officialData)
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create official');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function updateOfficial(id, officialData) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.OFFICIALS.UPDATE(id), {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(officialData)
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update official');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function deleteOfficial(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.OFFICIALS.DELETE(id), {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete official');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function uploadOfficialImage(file) {
    try {
        const token = getToken();
        if (!token) {
            window.location.hash = '#adminlogin';
            throw new Error('No valid token');
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(API_CONFIG.ENDPOINTS.OFFICIALS.UPLOAD, {
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

export async function getOfficialAuditLogs(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.OFFICIALS.AUDIT_LOGS(id), {
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
