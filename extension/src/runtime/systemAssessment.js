/**
 * Generates dynamic, atmospheric RPG assessments based on Hunter Profile statistics.
 */

// Categorize tags for "Primary Combat Specialty"
const TAG_CATEGORIES = {
    "Strength": ["implementation", "brute force", "constructive algorithms", "math"],
    "Magic": ["dp", "graphs", "trees", "math"],
    "Agility": ["greedy", "sortings", "two pointers", "binary search"],
    "Strategy": ["data structures", "divide and conquer", "geometry", "strings"],
    "Perception": ["dfs and similar", "shortest paths", "dsu"],
    "Intelligence": ["number theory", "combinatorics", "probabilities", "bitmasks"]
};

export function evaluateHunterProfile(profile) {
    const combat = profile.combatProficiency || 0;
    const streak = profile.currentStreak || 0;
    const problems = profile.problemsDefeated || 0;
    const skills = profile.skillAffinities || {};

    // 1. Current Combat State (based on streak & combat rating)
    let currentCombatState = "Stagnant";
    if (streak > 20) currentCombatState = "Accelerating";
    else if (streak > 5) currentCombatState = "Active";
    else if (streak > 0) currentCombatState = "Stable";
    
    // 2. Growth Potential
    let growthPotential = "Low";
    if (streak > 30) growthPotential = "Limitless";
    else if (streak > 10) growthPotential = "High";
    else if (streak > 2) growthPotential = "Moderate";
    else if (problems < 50) growthPotential = "Unknown";
    
    // 3. Combat Adaptability (based on number of unique skills/tags mastered)
    const uniqueSkills = Object.keys(skills).length;
    let combatAdaptability = "Poor";
    if (uniqueSkills > 20) combatAdaptability = "Excellent";
    else if (uniqueSkills > 10) combatAdaptability = "Good";
    else if (uniqueSkills > 5) combatAdaptability = "Standard";
    
    // 4. Dungeon Experience (based on total problems defeated as a proxy for contest/problem experience)
    let dungeonExperience = "Novice";
    if (problems > 1500) dungeonExperience = "Master";
    else if (problems > 800) dungeonExperience = "Veteran";
    else if (problems > 200) dungeonExperience = "Adept";
    
    // 5. Primary Combat Specialty
    let primaryCombatSpecialty = "Unknown";
    let maxCategoryScore = 0;
    
    const categoryScores = { "Strength": 0, "Magic": 0, "Agility": 0, "Strategy": 0, "Perception": 0, "Intelligence": 0 };
    
    for (const [tag, weight] of Object.entries(skills)) {
        for (const [category, tags] of Object.entries(TAG_CATEGORIES)) {
            if (tags.includes(tag.toLowerCase())) {
                categoryScores[category] += weight;
            }
        }
    }
    
    for (const [category, score] of Object.entries(categoryScores)) {
        if (score > maxCategoryScore) {
            maxCategoryScore = score;
            primaryCombatSpecialty = category;
        }
    }
    
    // 6. SYSTEM VERDICT
    let verdictLine1 = "Current combat capability is sufficient for standard D-Rank Gates.";
    let verdictLine2 = "Continue challenging stronger Monsters to accelerate growth.";
    
    if (combat > 500000) {
        verdictLine1 = "Current Hunter has surpassed all measurable human limits.";
        verdictLine2 = "National Level threat detected.";
    } else if (combat > 50000) {
        verdictLine1 = "Current combat capability is sufficient for high-tier A-Rank Gates.";
        verdictLine2 = "Promotion conditions are approaching.";
    } else if (combat > 20000) {
        verdictLine1 = "Current combat capability is sufficient for B-Rank Gates.";
        verdictLine2 = "Seek stronger Monsters to break through current plateau.";
    } else if (combat > 5000) {
        verdictLine1 = "Current combat capability is sufficient for C-Rank Gates.";
        verdictLine2 = "Focus on diverse dungeon environments to improve adaptability.";
    }
    
    if (streak > 30) {
        verdictLine2 = "Current Hunter has entered an accelerated growth phase.";
    } else if (streak === 0 && combat > 5000) {
        verdictLine2 = "Current growth has stagnated. Return to the dungeons.";
    }

    return {
        currentCombatState,
        growthPotential,
        combatAdaptability,
        dungeonExperience,
        primaryCombatSpecialty,
        systemVerdict: `${verdictLine1}<br><br>${verdictLine2}`
    };
}

export function evaluateMonsterThreat(threatLevelId) {
    switch (threatLevelId) {
        case 'VERY_EASY':
            return "Current Mana is overwhelming. Engagement recommended for warmup.";
        case 'EASY':
            return "Current Mana is highly sufficient. Proceed with standard tactics.";
        case 'EQUAL':
            return "Current Mana is sufficient. Balanced encounter detected.";
        case 'DANGEROUS':
            return "Current Mana is barely sufficient. Proceed with extreme caution.";
        case 'EXTREME':
            return "Current Mana is insufficient. Survival probability: Low.";
        case 'CATASTROPHIC':
            return "Current Mana is critically insufficient. Retreat recommended.";
        default:
            return "Threat unknown. Exercise extreme caution.";
    }
}
