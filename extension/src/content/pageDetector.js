export const PAGE_TYPES = {
    PROFILE: 'PROFILE',
    PROBLEM: 'PROBLEM',
    CONTEST: 'CONTEST',
    STANDINGS: 'STANDINGS',
    OTHER: 'OTHER'
};

export function detectPage(url) {
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        
        if (path.startsWith('/profile/')) return PAGE_TYPES.PROFILE;
        if (path.includes('/problem/')) return PAGE_TYPES.PROBLEM;
        if (path.includes('/standings')) return PAGE_TYPES.STANDINGS;
        if (path.match(/^\/contest\/\d+$/) || path.includes('/contests')) return PAGE_TYPES.CONTEST;
        
        return PAGE_TYPES.OTHER;
    } catch (e) {
        return PAGE_TYPES.OTHER;
    }
}
