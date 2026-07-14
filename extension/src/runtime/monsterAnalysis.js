import { classifyThreat } from './threatClassification.js';

export function analyzeMonster(problemRating, hunterProfile) {
    const hunterRating = hunterProfile?.hunterRank?.rating || 0;
    const threat = classifyThreat(problemRating, hunterRating);
    
    // Recommended Rank is just passing the problemRating down to the renderer,
    // which can use translateRank to get the real Tier object.
    const recommendedRankRating = problemRating;

    // Calculate Relative Strength
    const threatDifference = threat.difference || 0;
    let relativeStrength = "Equal to Current Hunter";
    if (threatDifference > 0) relativeStrength = "Above Current Hunter";
    else if (threatDifference < 0) relativeStrength = "Below Current Hunter";
    
    // Estimated Success (base 50%, scales with threatDifference)
    let estimatedSuccess = 50;
    if (threatDifference > 0) {
        estimatedSuccess = Math.max(1, Math.round(50 - (threatDifference / 10)));
    } else if (threatDifference < 0) {
        estimatedSuccess = Math.min(99, Math.round(50 + (Math.abs(threatDifference) / 10)));
    }

    return {
        threatLabel: threat.label,
        threatColor: threat.color,
        threatGlow: threat.glow,
        threatDifference,
        relativeStrength,
        estimatedSuccess,
        recommendedRankRating,
        estimatedDifficulty: problemRating
    };
}
