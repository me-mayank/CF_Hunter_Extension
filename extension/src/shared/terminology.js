import { HUNTER_RANKS } from './constants.js';

export const LABELS = {
    YOUR_MANA: "YOUR MANA POWER",
    EXP_REWARD: "EXP REWARD",
    REQUIRED_AFFINITIES: "REQUIRED AFFINITIES",
    PROMOTION_PROGRESS: "PROMOTION PROGRESS",
    THREAT_LEVEL: "THREAT LEVEL",
    MONSTER_RATING: "MONSTER RATING",
    MONSTER_CLASS: "MONSTER CLASS",
    RECOMMENDED_STRATEGY: "RECOMMENDED STRATEGY",
    CURRENT_MP: "CURRENT MP",
    PEAK_MP: "PEAK MP",
    MONSTERS_DEFEATED: "MONSTERS DEFEATED",
    DUNGEONS_CLEARED: "DUNGEONS CLEARED",
    PEAK_MONSTER: "PEAK MONSTER",
    HUNTER_LEVEL: "HUNTER LEVEL",
    MANA_POWER: "MANA POWER",
    SKILLS_REQUIRED: "SKILLS REQUIRED"
};

export function getMonsterSystemSentence(threatLabel, monsterClass) {
    if (threatLabel.includes("Safe") || threatLabel.includes("Low")) {
        return "This target poses no threat.";
    } else if (threatLabel.includes("Dangerous") || threatLabel.includes("Catastrophic")) {
        return "This entity's power exceeds your own.";
    } else {
        return "This target is within your current combat range.";
    }
}

export function getHunterSystemSentence() {
    return "This Hunter's combat power has been assessed.";
}

export function translateRank(rating) {
    if (rating === undefined || rating === null) return { label: "Unranked", color: "#8a8f98", glow: "rgba(138, 143, 152, 0.4)" };
    
    const numRating = Number(rating);
    for (const rank of HUNTER_RANKS) {
        if (numRating >= rank.minRating && numRating <= rank.maxRating) {
            return rank;
        }
    }
    
    // Fallback if somehow out of bounds (which shouldn't happen with Infinity)
    return HUNTER_RANKS[0];
}

export function translateTag(cfTagStr) {
    const tag = cfTagStr.toLowerCase().trim();
    
    // Core Skill Affinities defined in PRD
    if (tag.includes('math') || tag.includes('number theory') || tag.includes('combinatorics') || tag.includes('geometry') || tag.includes('probabilities')) {
        return "Magic";
    }
    if (tag.includes('dp') || tag.includes('dynamic programming')) {
        return "Intelligence";
    }
    if (tag.includes('graph') || tag.includes('trees') || tag.includes('dfs') || tag.includes('shortest paths')) {
        return "Perception";
    }
    if (tag.includes('implementation') || tag.includes('brute force') || tag.includes('constructive')) {
        return "Strength";
    }
    if (tag.includes('greedy') || tag.includes('sortings') || tag.includes('two pointers')) {
        return "Agility";
    }
    if (tag.includes('binary search') || tag.includes('data structures') || tag.includes('divide and conquer')) {
        return "Strategy";
    }

    // Default mapping for anything else
    return null;
}

export function formatNumber(num) {
    if (num === null || num === undefined) return "0";
    return num.toLocaleString('en-US');
}
