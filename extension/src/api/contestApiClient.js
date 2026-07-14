const API_BASE = "https://codeforces.com/api";

/**
 * Extracts the contest ID and type from the current URL.
 * Supports /contest/{id}, /gym/{id}, and their problem sub-pages.
 * 
 * @param {string} url - The current page URL
 * @returns {{ id: number, type: 'contest' | 'gym' } | null}
 */
export function extractContestIdFromUrl(url) {
    const contestMatch = url.match(/\/contest\/(\d+)/i);
    if (contestMatch) {
        return { id: parseInt(contestMatch[1], 10), type: 'contest' };
    }

    const gymMatch = url.match(/\/gym\/(\d+)/i);
    if (gymMatch) {
        return { id: parseInt(gymMatch[1], 10), type: 'gym' };
    }

    return null;
}

/**
 * Caches the contest list API response to prevent repeated heavy requests.
 * Codeforces contest.list payload is large, so caching is crucial for performance.
 */
let contestListCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Fetches contest information using the official Codeforces API.
 * 
 * @param {number} contestId 
 * @param {'contest' | 'gym'} type 
 * @returns {Promise<{id: number, type: 'contest'|'gym', name: string, phase: string, startTimeSeconds: number, durationSeconds: number, frozen: boolean} | null>}
 */
export async function fetchContestInfo(contestId, type) {
    const isGym = type === 'gym';
    
    // We only cache the standard contest list. Gym contests are fetched independently.
    let url = `${API_BASE}/contest.list?gym=${isGym}`;

    try {
        let data;
        
        // Use cache for standard contests to avoid massive repeated payloads
        if (!isGym && contestListCache && (Date.now() - lastCacheTime < CACHE_TTL_MS)) {
            data = contestListCache;
        } else {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`[Hunter Extension] Contest API Error: ${response.status}`);
                return null;
            }
            data = await response.json();
            
            if (data.status !== 'OK') {
                console.error("[Hunter Extension] Contest API Error:", data.comment);
                return null;
            }

            if (!isGym) {
                contestListCache = data;
                lastCacheTime = Date.now();
            }
        }

        const contest = data.result.find(c => c.id === contestId);
        if (!contest) {
            console.warn(`[Hunter Extension] Contest ID ${contestId} not found in API list.`);
            return null;
        }

        return {
            id: contest.id,
            type: type,
            name: contest.name,
            phase: contest.phase,
            startTimeSeconds: contest.startTimeSeconds,
            durationSeconds: contest.durationSeconds,
            frozen: !!contest.frozen // ensures boolean
        };

    } catch (e) {
        console.error("[Hunter Extension] Error fetching contest info:", e);
        return null;
    }
}
