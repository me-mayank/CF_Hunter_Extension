import { BASE_URL } from '../shared/constants.js';

/**
 * Normalizes responses to { ok: true, data } or { ok: false, reason, ... }
 */
async function fetchWithColdStartDetection(url, options = {}) {
    const startTime = Date.now();
    try {
        const response = await fetch(url, options);
        const duration = Date.now() - startTime;
        const isColdStart = duration > 3500 && response.ok; // >3.5s is likely cold start

        if (response.status === 200) {
            const data = await response.json();
            return { ok: true, data, isColdStart };
        } else if (response.status === 202) {
            const data = await response.json();
            return { ok: false, reason: 'PROCESSING', jobId: data.jobId, isColdStart, stage: data.stage };
        } else if (response.status === 404) {
            return { ok: false, reason: 'NOT_FOUND' };
        } else if (response.status === 429) {
            return { ok: false, reason: 'RATE_LIMITED' };
        } else {
            return { ok: false, reason: 'SERVER_ERROR', status: response.status };
        }
    } catch (error) {
        return { ok: false, reason: 'UNREACHABLE', error: error.message };
    }
}

export async function getHunter(handle) {
    return fetchWithColdStartDetection(`${BASE_URL}/hunter/${handle}`);
}

export async function getStatus(handle) {
    return fetchWithColdStartDetection(`${BASE_URL}/hunter/${handle}/status`);
}

export async function refreshHunter(handle) {
    return fetchWithColdStartDetection(`${BASE_URL}/hunter/${handle}/refresh`, { method: 'POST' });
}

export async function compareHunters(handleA, handleB) {
    return fetchWithColdStartDetection(`${BASE_URL}/hunter/${handleA}/compare/${handleB}`);
}

export async function healthz() {
    return fetchWithColdStartDetection(`${BASE_URL}/healthz`);
}
