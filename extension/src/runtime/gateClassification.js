import { GATE_CLASSIFICATIONS } from '../shared/constants.js';

export function classifyGate(contestName) {
    if (!contestName || typeof contestName !== 'string') {
        return "Unknown Gate";
    }

    const lowerName = contestName.toLowerCase();
    
    // Find matching classification by checking substrings
    for (const [key, gateName] of Object.entries(GATE_CLASSIFICATIONS)) {
        if (lowerName.includes(key)) {
            return gateName;
        }
    }
    
    return "Unknown Gate";
}
