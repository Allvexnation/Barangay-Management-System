const API_BASE_URL = 'https://piodelpilarmakatibackend.onrender.com/api';

export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    ENDPOINTS: {
        ADMIN_AUTH: {
            LOGIN: `${API_BASE_URL}/adminauth/login`,
            UPDATE_PROFILE: `${API_BASE_URL}/adminauth/update-profile`,
            UPLOAD_PHOTO: `${API_BASE_URL}/adminauth/upload-photo`,
            GET_CURRENT_USER: `${API_BASE_URL}/adminauth/me`
        },
        HOUSEHOLD: {
            GET_ALL: `${API_BASE_URL}/household`,
            GET_BY_ID: (id) => `${API_BASE_URL}/household/${id}`,
            CREATE: `${API_BASE_URL}/household`,
            UPDATE: (id) => `${API_BASE_URL}/household/${id}`,
            DELETE: (id) => `${API_BASE_URL}/household/${id}`,
            UPLOAD: `${API_BASE_URL}/household/upload`,
            AUDIT_LOGS: (id) => `${API_BASE_URL}/household/${id}/audit-logs`
        },
        PUROK: {
            GET_ALL: `${API_BASE_URL}/purok`,
            GET_BY_ID: (id) => `${API_BASE_URL}/purok/${id}`,
            CREATE: `${API_BASE_URL}/purok`,
            UPDATE: (id) => `${API_BASE_URL}/purok/${id}`,
            DELETE: (id) => `${API_BASE_URL}/purok/${id}`,
            AUDIT_LOGS: (id) => `${API_BASE_URL}/purok/${id}/audit-logs`
        },
        OFFICIALS: {
            GET_ALL: `${API_BASE_URL}/officials`,
            GET_BY_ID: (id) => `${API_BASE_URL}/officials/${id}`,
            GET_POSITIONS: `${API_BASE_URL}/officials/positions`,
            CREATE: `${API_BASE_URL}/officials`,
            UPDATE: (id) => `${API_BASE_URL}/officials/${id}`,
            DELETE: (id) => `${API_BASE_URL}/officials/${id}`,
            UPLOAD: `${API_BASE_URL}/officials/upload`,
            AUDIT_LOGS: (id) => `${API_BASE_URL}/officials/${id}/audit-logs`
        },
        CLEARANCE: {
            INDIVIDUAL: {
                GET_ALL: `${API_BASE_URL}/clearance/individual`,
                GET_BY_ID: (id) => `${API_BASE_URL}/clearance/individual/${id}`,
                CREATE: `${API_BASE_URL}/clearance/individual`,
                UPDATE: (id) => `${API_BASE_URL}/clearance/individual/${id}`,
                DELETE: (id) => `${API_BASE_URL}/clearance/individual/${id}`,
                AUDIT_LOGS: (id) => `${API_BASE_URL}/clearance/individual/${id}/audit-logs`
            },
            BUSINESS: {
                GET_ALL: `${API_BASE_URL}/clearance/business`,
                GET_BY_ID: (id) => `${API_BASE_URL}/clearance/business/${id}`,
                CREATE: `${API_BASE_URL}/clearance/business`,
                UPDATE: (id) => `${API_BASE_URL}/clearance/business/${id}`,
                DELETE: (id) => `${API_BASE_URL}/clearance/business/${id}`,
                AUDIT_LOGS: (id) => `${API_BASE_URL}/clearance/business/${id}/audit-logs`
            }
        },
        COMPLAINTS: {
            GET_ALL: `${API_BASE_URL}/complaints`,
            GET_BY_ID: (id) => `${API_BASE_URL}/complaints/${id}`,
            CREATE: `${API_BASE_URL}/complaints`,
            UPDATE: (id) => `${API_BASE_URL}/complaints/${id}`,
            DELETE: (id) => `${API_BASE_URL}/complaints/${id}`,
            AUDIT_LOGS: (id) => `${API_BASE_URL}/complaints/${id}/audit-logs`
        },
        USERS: {
            GET_ALL: `${API_BASE_URL}/users`,
            GET_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
            CREATE: `${API_BASE_URL}/users`,
            UPDATE: (id) => `${API_BASE_URL}/users/${id}`,
            DELETE: (id) => `${API_BASE_URL}/users/${id}`,
            UPLOAD_IMAGE: `${API_BASE_URL}/users/upload-image`,
            AUDIT_LOGS: (id) => `${API_BASE_URL}/users/${id}/audit-logs`
        },
        SYSTEM_INFO: {
            GET: `${API_BASE_URL}/systeminfo`,
            CREATE: `${API_BASE_URL}/systeminfo`,
            UPDATE: `${API_BASE_URL}/systeminfo`,
            DELETE: `${API_BASE_URL}/systeminfo`,
            AUDIT_LOGS: `${API_BASE_URL}/systeminfo/audit-logs`
        },
        POSITION: {
            GET_ALL: `${API_BASE_URL}/position`,
            GET_BY_ID: (id) => `${API_BASE_URL}/position/${id}`,
            CREATE: `${API_BASE_URL}/position`,
            UPDATE: (id) => `${API_BASE_URL}/position/${id}`,
            DELETE: (id) => `${API_BASE_URL}/position/${id}`,
            AUDIT_LOGS: (id) => `${API_BASE_URL}/position/${id}/audit-logs`
        },
        AUDIT: {
            GET_RECENT: `${API_BASE_URL}/audit/recent`,
            GET_BY_ENTITY_TYPE: (entityType) => `${API_BASE_URL}/audit/entity/${entityType}`
        }
    }
};

export default API_CONFIG;
