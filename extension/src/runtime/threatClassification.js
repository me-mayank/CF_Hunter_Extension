import { THREAT_TIERS, UNCLASSIFIED_THREAT } from '../shared/constants.js';

/**
 * Classifies the threat of a problem compared to a hunter's CF Rating.
 * @param {number} problemRating 
 * @param {number} hunterRating 
 * @returns {object} { label, color, glow, difference }
 */
export function classifyThreat(problemRating, hunterRating) {
    if (typeof problemRating !== 'number' || typeof hunterRating !== 'number' || isNaN(problemRating) || isNaN(hunterRating)) {
        return { label: UNCLASSIFIED_THREAT.label, color: UNCLASSIFIED_THREAT.color, glow: UNCLASSIFIED_THREAT.glow, difference: 0 };
    }

    const difference = problemRating - hunterRating;

    for (const tier of THREAT_TIERS) {
        if (difference <= tier.maxDiff) {
            return { label: tier.label, color: tier.color, glow: tier.glow, difference };
        }
    }
    
    // Fallback to catastrophic
    const catastrophic = THREAT_TIERS[THREAT_TIERS.length - 1];
    return { label: catastrophic.label, color: catastrophic.color, glow: catastrophic.glow, difference };
}
