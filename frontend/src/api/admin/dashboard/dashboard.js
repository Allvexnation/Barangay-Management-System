import { getAllHouseholds } from './household.js';
import { getAllOfficials } from './officials.js';
import { getAllIndividualClearances, getAllBusinessClearances } from './clearance.js';
import { getAllUsers } from './users.js';
import { getAllComplaints } from './complaints.js';
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

export async function getDashboardStats() {
    try {
        const [households, officials, individualClearances, businessClearances, users, complaints] = await Promise.all([
            getAllHouseholds(),
            getAllOfficials(),
            getAllIndividualClearances(),
            getAllBusinessClearances(),
            getAllUsers(),
            getAllComplaints()
        ]);

        let totalResidents = 0;
        if (households && Array.isArray(households)) {
            households.forEach(household => {
                if (household.members && Array.isArray(household.members)) {
                    totalResidents += household.members.length;
                }
            });
        }

        let pendingRequests = 0;
        if (individualClearances && Array.isArray(individualClearances)) {
            pendingRequests += individualClearances.filter(c => c.status === 'Pending').length;
        }
        if (businessClearances && Array.isArray(businessClearances)) {
            pendingRequests += businessClearances.filter(c => c.status === 'Pending').length;
        }

        return {
            totalResidents,
            totalHouseholds: households?.length || 0,
            totalOfficials: officials?.length || 0,
            totalUsers: users?.length || 0,
            totalComplaints: complaints?.length || 0,
            pendingRequests
        };
    } catch (error) {
        return {
            totalResidents: 0,
            totalHouseholds: 0,
            totalOfficials: 0,
            totalUsers: 0,
            totalComplaints: 0,
            pendingRequests: 0
        };
    }
}

export async function getRecentAuditLogs(page = 1, pageSize = 10) {
    try {
        const response = await fetch(`${API_CONFIG.ENDPOINTS.AUDIT.GET_RECENT}?page=${page}&pageSize=${pageSize}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        handleAuthError(response);

        if (!response.ok) {
            throw new Error('Failed to fetch recent audit logs');
        }

        return await response.json();
    } catch (error) {
        return { logs: [], totalCount: 0, page: 1, pageSize: 10 };
    }
}
