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

export async function getAllComplaints() {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.COMPLAINTS.GET_ALL, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch complaints');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getComplaintById(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.COMPLAINTS.GET_BY_ID(id), {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch complaint');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function createComplaint(complaintData) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.COMPLAINTS.CREATE, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(complaintData)
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create complaint');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function updateComplaint(id, complaintData) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.COMPLAINTS.UPDATE(id), {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(complaintData)
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update complaint');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function deleteComplaint(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.COMPLAINTS.DELETE(id), {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete complaint');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getComplaintAuditLogs(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.COMPLAINTS.AUDIT_LOGS(id), {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch complaint audit logs');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}
