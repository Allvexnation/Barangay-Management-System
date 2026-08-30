import { SystemInfo, initSystemInfo } from './SystemInfo.js';
import { OfficialPositionList, initOfficialPositionList } from './OfficialPositionList.js';
import { PurokList, initPurokList } from './PurokList.js';
import { EditProfilePage, initEditProfilePage } from './EditProfile.js';

export async function Settings() {
    const currentHash = window.location.hash;
    
    if (currentHash === '#settings-barangay') {
        return await SystemInfo();
    }
    
    if (currentHash === '#settings-positions') {
        return await OfficialPositionList();
    }
    
    if (currentHash === '#settings-purok') {
        return await PurokList();
    }

    if (currentHash === '#settings-profile' || currentHash === '#edit-profile' || currentHash === '#profile' || currentHash === '#settings') {
        return await EditProfilePage();
    }
    
    return await EditProfilePage();
}

export async function initSettingsPage() {
    const currentHash = window.location.hash;

    if (currentHash === '#settings-barangay') {
        setTimeout(() => {
            initSystemInfo();
        }, 100);
    }

    if (currentHash === '#settings-positions') {
        setTimeout(() => {
            initOfficialPositionList();
        }, 100);
    }

    if (currentHash === '#settings-purok') {
        setTimeout(() => {
            initPurokList();
        }, 100);
    }

    if (currentHash === '#settings-profile' || currentHash === '#edit-profile' || currentHash === '#profile' || currentHash === '#settings') {
        setTimeout(() => {
            initEditProfilePage();
        }, 100);
    }
}
