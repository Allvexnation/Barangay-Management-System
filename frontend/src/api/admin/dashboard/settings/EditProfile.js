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

export async function updateProfile(formData) {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = getToken();
        if (!token) {
            window.location.hash = '#adminlogin';
            throw new Error('No valid token');
        }

        const response = await fetch(API_CONFIG.ENDPOINTS.ADMIN_AUTH.UPDATE_PROFILE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-User-Id': user.id || ''
            },
            body: JSON.stringify(formData)
        });

        handleAuthError(response);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update profile');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function uploadProfilePhoto(file) {
    try {
        const formData = new FormData();
        formData.append('photo', file);

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = getToken();
        if (!token) {
            window.location.hash = '#adminlogin';
            throw new Error('No valid token');
        }

        const response = await fetch(API_CONFIG.ENDPOINTS.ADMIN_AUTH.UPLOAD_PHOTO, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-User-Id': user.id || ''
            },
            body: formData
        });

        handleAuthError(response);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to upload photo');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}
