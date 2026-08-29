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

export async function getAllIndividualClearances() {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.CLEARANCE.INDIVIDUAL.GET_ALL, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch individual clearances');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getIndividualClearanceById(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.CLEARANCE.INDIVIDUAL.GET_BY_ID(id), {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch individual clearance');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function createIndividualClearance(clearanceData) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.CLEARANCE.INDIVIDUAL.CREATE, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(clearanceData)
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create individual clearance');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function updateIndividualClearance(id, clearanceData) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.CLEARANCE.INDIVIDUAL.UPDATE(id), {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(clearanceData)
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update individual clearance');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function deleteIndividualClearance(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.CLEARANCE.INDIVIDUAL.DELETE(id), {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete individual clearance');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getIndividualClearanceAuditLogs(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.CLEARANCE.INDIVIDUAL.AUDIT_LOGS(id), {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch individual clearance audit logs');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getAllBusinessClearances() {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.CLEARANCE.BUSINESS.GET_ALL, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch business clearances');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getBusinessClearanceById(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.CLEARANCE.BUSINESS.GET_BY_ID(id), {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch business clearance');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function createBusinessClearance(clearanceData) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.CLEARANCE.BUSINESS.CREATE, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(clearanceData)
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create business clearance');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function updateBusinessClearance(id, clearanceData) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.CLEARANCE.BUSINESS.UPDATE(id), {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(clearanceData)
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update business clearance');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function deleteBusinessClearance(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.CLEARANCE.BUSINESS.DELETE(id), {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete business clearance');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function getBusinessClearanceAuditLogs(id) {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.CLEARANCE.BUSINESS.AUDIT_LOGS(id), {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch business clearance audit logs');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}
