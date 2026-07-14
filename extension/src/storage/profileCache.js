import { PROFILE_CACHE_TTL_MS } from '../shared/constants.js';

export async function getCachedProfile(handle) {
    return new Promise(resolve => {
        chrome.storage.local.get(`hunter_${handle}`, (result) => {
            const cached = result[`hunter_${handle}`];
            if (!cached) return resolve(null);
            
            const now = Date.now();
            if (now - cached.timestamp > PROFILE_CACHE_TTL_MS) {
                // Return it but mark it as outdated
                return resolve({ ...cached.data, _isOutdated: true });
            }
            return resolve(cached.data);
        });
    });
}

export async function setCachedProfile(handle, profileData) {
    return new Promise(resolve => {
        const payload = {
            [`hunter_${handle}`]: {
                data: profileData,
                timestamp: Date.now()
            }
        };
        chrome.storage.local.set(payload, resolve);
    });
}
