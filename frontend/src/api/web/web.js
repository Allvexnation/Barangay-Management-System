import { getSystemInfo } from '../admin/dashboard/settings/Systeminfo.js';

let systemInfoCache = null;

export async function loadFavicon() {
    try {
        systemInfoCache = await getSystemInfo();

        if (systemInfoCache && systemInfoCache.logoUrl) {
            const favicon = document.getElementById('favicon');
            if (favicon) {
                favicon.href = systemInfoCache.logoUrl;
            }
        }

        updatePageTitle();
    } catch (error) {
        console.log('Could not load favicon and title from system info');
    }
}

export function updatePageTitle(tabName = null, route = null) {
    const barangayName = systemInfoCache?.barangayName || 'Barangay';

    if (route === '' || route === null) {
        if (tabName) {
            document.title = `${barangayName} - ${tabName} - Management System`;
        } else {
            document.title = `${barangayName} - Management System`;
        }
    } else {
        if (tabName) {
            document.title = `${barangayName} - ${tabName}`;
        } else {
            document.title = barangayName;
        }
    }
}
