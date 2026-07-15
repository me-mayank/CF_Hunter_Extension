export const BASE_URL = "https://cf-hunter-system.onrender.com";

// Constants for profile caching (chrome.storage.local)
export const PROFILE_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Monster Threat Classification (Rating vs Rating)
// Note: This must compare the Problem Rating against the Hunter's CF Rating (apples to apples).
// Do NOT compare against Mana Power, as Mana Power is on a heavily inflated, config-driven scale.
export const THREAT_TIERS = [
    { label: "Safe Zone", maxDiff: -400, color: "#38e1ff", glow: "rgba(56, 225, 255, 0.4)" },
    { label: "Low Threat", maxDiff: -150, color: "#3ea6ff", glow: "rgba(62, 166, 255, 0.4)" },
    { label: "Equal Threat", maxDiff: 150, color: "#eaf6ff", glow: "rgba(234, 246, 255, 0.4)" },
    { label: "Dangerous", maxDiff: 350, color: "#ff9d3e", glow: "rgba(255, 157, 62, 0.4)" },
    { label: "Very Dangerous", maxDiff: 600, color: "#ff5e5e", glow: "rgba(255, 94, 94, 0.4)" },
    { label: "Catastrophic", maxDiff: Infinity, color: "#ff2f6e", glow: "rgba(255, 47, 110, 0.7)" }
];

export const UNCLASSIFIED_THREAT = { label: "Unclassified", color: "#6b7f99", glow: "rgba(107, 127, 153, 0.4)" };

export function getRecommendedStrategy(threatLabel) {
    switch(threatLabel) {
        case "Safe Zone": return "This Monster poses no threat. Engage without hesitation.";
        case "Low Threat": return "Victory is highly probable. Proceed.";
        case "Equal Threat": return "An even match has been detected. Your skills will be tested.";
        case "Dangerous": return "This Monster exceeds your current strength. Caution advised.";
        case "Very Dangerous": return "Extreme risk detected. Retreat or prepare thoroughly before engaging.";
        case "Catastrophic": return "This encounter is not survivable at your current rank. Retreat immediately.";
        case "UNKNOWN": return "Threat unquantifiable. Exercise with caution.";
        default: return "Threat unquantifiable. Proceed at your own risk.";
    }
}

// Hunter vs Hunter Recommendation (Mana Power Relative %)
// Note: This uses Mana Power, not Rating, because Mana captures the true holistic strength of a Hunter.
// We use a relative percentage diff (not fixed points) because Mana Power's absolute scale is config-driven.
export function getHunterRecommendation(yourMana, otherMana) {
    if (!yourMana || yourMana < 1) {
        // Fallback for new Hunters with zero/near-zero MP to avoid Division by Zero
        if (otherMana > 1000) return "Retreat Recommended";
        if (otherMana > 100) return "Dangerous Hunter";
        return "Comparable Hunter";
    }

    const pctDiff = ((otherMana - yourMana) / yourMana) * 100;

    if (pctDiff > 60) return "Retreat Recommended";
    if (pctDiff > 30) return "High Risk Hunter";
    if (pctDiff > 10) return "Dangerous Hunter";
    if (pctDiff >= -10) return "Comparable Hunter";
    if (pctDiff >= -30) return "Below Your Rank";
    return "Far Below Your Rank";
}

// Small framing label for Threat Assessment quadrant (Image 3)
export function getCombatantFraming(yourMana, otherMana) {
    if (!yourMana || yourMana < 1) return { label: "◆ UNKNOWN THREAT", color: "var(--sys-text-muted)" };
    const pctDiff = ((otherMana - yourMana) / yourMana) * 100;
    
    if (pctDiff > 30) return { label: "◆ SUPERIOR COMBATANT", color: "var(--sys-color-danger)" };
    if (pctDiff > 10) return { label: "◆ DANGEROUS COMBATANT", color: "rgba(255, 207, 107, 1)" };
    if (pctDiff >= -10) return { label: "◆ EQUAL COMBATANT", color: "var(--sys-text)" };
    return { label: "◆ INFERIOR COMBATANT", color: "var(--sys-color-level)" };
}

// Hunter Archetype Mapping
export const HUNTER_TYPE_BY_SKILL = {
    "Strength": "Warrior-Type Hunter",
    "Agility": "Assassin-Type Hunter",
    "Intelligence": "Mage-Type Hunter",
    "Perception": "Ranger-Type Hunter",
    "Magic": "Sorcerer-Type Hunter",
    "Strategy": "Tactician-Type Hunter",
    "Insight": "Oracle-Type Hunter"
};

// Hunter Progress Recommendation (Short label based on rank progress)
export function getSelfRecommendation(progressPercent) {
    if (progressPercent >= 90) return { label: "Promotion Imminent", color: "var(--sys-purple)" };
    if (progressPercent >= 75) return { label: "Rapid Ascension", color: "var(--sys-accent)" };
    if (progressPercent >= 25) return { label: "Steady Growth", color: "var(--sys-green)" };
    if (progressPercent > 5) return { label: "Needs More Battles", color: "var(--sys-text-muted)" };
    return { label: "Plateau Detected", color: "var(--sys-orange, #ff9d3e)" };
}

// Pure Gamification System Mechanics (NOT real statistics)
export const THREAT_XP_REWARDS = {
    VERY_EASY: { xp: 10, penalty: -1 },
    EASY: { xp: 25, penalty: -2 },
    EQUAL: { xp: 50, penalty: -5 },
    DANGEROUS: { xp: 100, penalty: -10 },
    EXTREME: { xp: 250, penalty: -25 },
    CATASTROPHIC: { xp: 500, penalty: -50 }
};


// Hunter Rank Tier Mapping & Colors (Rating driven)
export const HUNTER_RANKS = [
    { label: "E-Rank Hunter", color: "#6b7f99", glow: "rgba(107, 127, 153, 0.4)", minRating: 0, maxRating: 1199, nextRankRating: 1200 },
    { label: "D-Rank Hunter", color: "#4be38a", glow: "rgba(75, 227, 138, 0.4)", minRating: 1200, maxRating: 1399, nextRankRating: 1400 },
    { label: "C-Rank Hunter", color: "#38e1ff", glow: "rgba(56, 225, 255, 0.4)", minRating: 1400, maxRating: 1599, nextRankRating: 1600 },
    { label: "B-Rank Hunter", color: "#3ea6ff", glow: "rgba(62, 166, 255, 0.4)", minRating: 1600, maxRating: 1899, nextRankRating: 1900 },
    { label: "A-Rank Hunter", color: "#8a6bff", glow: "rgba(138, 107, 255, 0.4)", minRating: 1900, maxRating: 2099, nextRankRating: 2100 },
    { label: "S-Rank Hunter", color: "#ff9d3e", glow: "rgba(255, 157, 62, 0.4)", minRating: 2100, maxRating: 2299, nextRankRating: 2300 },
    { label: "National Hunter", color: "#ffcf6b", glow: "rgba(255, 207, 107, 0.4)", minRating: 2300, maxRating: 2399, nextRankRating: 2400 },
    { label: "Monarch Candidate", color: "#ff5e5e", glow: "rgba(255, 94, 94, 0.4)", minRating: 2400, maxRating: 2599, nextRankRating: 2600 },
    { label: "Monarch", color: "#ff2f6e", glow: "rgba(255, 47, 110, 0.4)", minRating: 2600, maxRating: 2999, nextRankRating: 3000 },
    { label: "Shadow Monarch", color: "#ffcf6b", glow: "rgba(255, 207, 107, 0.8)", minRating: 3000, maxRating: Infinity, nextRankRating: null }
];

// Gate Classification Mapping
export const GATE_CLASSIFICATIONS = [
    { pattern: "educational", label: "Training Gate", color: "#3ea6ff", glow: "rgba(62, 166, 255, 0.4)" },
    { pattern: "global round", label: "National Gate", color: "#ffcf6b", glow: "rgba(255, 207, 107, 0.4)" },
    { pattern: "gym", label: "Simulation Gate", color: "#4be38a", glow: "rgba(75, 227, 138, 0.4)" },
    { pattern: "testing round", label: "Simulation Gate", color: "#4be38a", glow: "rgba(75, 227, 138, 0.4)" },
    { pattern: "icpc", label: "S-Rank Gate (World-Class Gate)", color: HUNTER_RANKS[5].color, glow: HUNTER_RANKS[5].glow },
    { pattern: "regional", label: "S-Rank Gate (World-Class Gate)", color: HUNTER_RANKS[5].color, glow: HUNTER_RANKS[5].glow },
    { pattern: "finals", label: "S-Rank Gate (World-Class Gate)", color: HUNTER_RANKS[5].color, glow: HUNTER_RANKS[5].glow },
    { pattern: "kotlin heroes", label: "Special Gate", color: "#ffcf6b", glow: "rgba(255, 207, 107, 0.4)" },
    { pattern: "div. 1 + div. 2", label: "A-Rank Gate", color: HUNTER_RANKS[4].color, glow: HUNTER_RANKS[4].glow },
    { pattern: "div. 1 + 2", label: "A-Rank Gate", color: HUNTER_RANKS[4].color, glow: HUNTER_RANKS[4].glow },
    { pattern: "div. 1", label: "S-Rank Gate", color: HUNTER_RANKS[5].color, glow: HUNTER_RANKS[5].glow },
    { pattern: "div. 2", label: "B-Rank Gate", color: HUNTER_RANKS[3].color, glow: HUNTER_RANKS[3].glow },
    { pattern: "div. 3", label: "C-Rank Gate", color: HUNTER_RANKS[2].color, glow: HUNTER_RANKS[2].glow },
    { pattern: "div. 4", label: "E-Rank Gate", color: HUNTER_RANKS[0].color, glow: HUNTER_RANKS[0].glow }
];


export const SKILL_COLORS = {
    "strength": "#ff5e5e",
    "agility": "#4be38a",
    "intelligence": "#3ea6ff",
    "perception": "#38e1ff",
    "magic": "#8a6bff",
    "strategy": "#ffcf6b",
    "insight": "#ff2f6e"
};

// Monster Naming Table
export const MONSTER_CLASSES = [
    { minRating: 0, name: "Goblin" },
    { minRating: 900, name: "Orc" },
    { minRating: 1000, name: "Hobgoblin" },
    { minRating: 1100, name: "High Orc" },
    { minRating: 1200, name: "Ogre" },
    { minRating: 1300, name: "Wyvern" },
    { minRating: 1400, name: "Demon Knight" },
    { minRating: 1500, name: "Demon General" },
    { minRating: 1600, name: "Dragon" },
    { minRating: 1700, name: "Ancient Dragon" },
    { minRating: 1800, name: "Arch Demon" },
    { minRating: 1900, name: "Demon Lord" },
    { minRating: 2000, name: "Monarch Class" }
];

export function getMonsterName(rating) {
    if (!rating) return "Unknown Entity";
    let monsterName = "Goblin";
    for (const mc of MONSTER_CLASSES) {
        if (rating >= mc.minRating) monsterName = mc.name;
    }
    return monsterName;
}

// Hunter Class Mapping (Dominant Skill -> Class Name)
export const HUNTER_CLASSES = {
    "Strength": "Fighter-Type Hunter",
    "Magic": "Mage-Type Hunter",
    "Agility": "Assassin-Type Hunter",
    "Strategy": "Tactician-Type Hunter",
    "Perception": "Ranger-Type Hunter",
    "Intelligence": "Scholar-Type Hunter"
};

// Shared UI Icons
export const STAT_ICONS = {
    RANK: "◇",
    LEVEL: "▲",
    MANA: "♦",
    COMBAT: "⚔",
    STREAK: "●",
    EXP: "▣",
    MONSTER: "❖",
    PROBLEM: "▪"
};

export const CF_VERDICT_MAPPING = {
    "OK": { text: "◆ MONSTER DEFEATED", color: "var(--sys-color-level)" },
    "WRONG_ANSWER": { text: "✕ ATTACK MISSED", color: "var(--sys-color-danger)" },
    "COMPILATION_ERROR": { text: "⚠ WEAPON MALFORMED", color: "var(--sys-color-warning)" },
    "TIME_LIMIT_EXCEEDED": { text: "⏱ MONSTER OUTRAN YOUR STRIKE", color: "var(--sys-color-warning)" },
    "RUNTIME_ERROR": { text: "⚡ WEAPON BACKFIRED", color: "var(--sys-color-danger)" },
    "MEMORY_LIMIT_EXCEEDED": { text: "◈ MANA OVERFLOW", color: "var(--sys-color-warning)" },
    "IDLENESS_LIMIT_EXCEEDED": { text: "⏳ HESITATION COST YOU THE ENGAGEMENT", color: "var(--sys-color-warning)" },
    "CHALLENGED": { text: "✕ ENCOUNTER INVALIDATED", color: "var(--sys-color-danger)" },
    "SKIPPED": { text: "◇ COMBAT ABORTED", color: "var(--sys-text-muted)" },
    "TESTING": { text: "↻ ANALYZING ATTACK...", color: "var(--sys-text)" },
    "UNKNOWN": { text: "◇ VERDICT UNCLEAR — Re-scan recommended", color: "var(--sys-text-muted)" }
};
