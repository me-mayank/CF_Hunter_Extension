import { GATE_CLASSIFICATIONS } from '../shared/constants.js';

export function classifyGate(contestName) {
    if (!contestName || typeof contestName !== 'string') {
        return { label: "Unknown Gate", color: "#8a8f98", glow: "rgba(138, 143, 152, 0.4)" };
    }

    const lowerName = contestName.toLowerCase();
    
    // Find matching classification by checking substrings
    for (const cls of GATE_CLASSIFICATIONS) {
        if (lowerName.includes(cls.pattern)) {
            return { label: cls.label, color: cls.color, glow: cls.glow };
        }
    }
    
    return { label: "Unknown Gate", color: "#8a8f98", glow: "rgba(138, 143, 152, 0.4)" };
}
