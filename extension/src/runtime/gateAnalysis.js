import { classifyGate } from './gateClassification.js';

export function analyzeGate(contestInfo, hunterProfile) {
    const { name, status, startTimeSeconds } = contestInfo;
    const classification = classifyGate(name);

    let gateStatus = status; // e.g. "BEFORE", "CODING", "FINISHED"
    let timeUntilOpen = null;

    if (status === "BEFORE" && startTimeSeconds) {
        const nowSeconds = Math.floor(Date.now() / 1000);
        timeUntilOpen = Math.max(0, startTimeSeconds - nowSeconds);
    }

    // Recommended mana and duration based on Gate Class
    let recommendedMana = 0;
    let estimatedDuration = "2 Hours";

    if (classification === "A-Rank Gate") {
        recommendedMana = 15000;
        estimatedDuration = "3 Hours";
    } else if (classification === "B-Rank Gate (National Gate)") {
        recommendedMana = 8000;
        estimatedDuration = "2.5 Hours";
    } else if (classification === "C-Rank Gate") {
        recommendedMana = 3000;
        estimatedDuration = "2 Hours";
    } else if (classification === "D-Rank Gate") {
        recommendedMana = 1000;
        estimatedDuration = "2 Hours";
    } else if (classification === "E-Rank Gate") {
        recommendedMana = 200;
        estimatedDuration = "2 Hours";
    } else if (classification === "S-Rank Gate (World-Class Gate)") {
        recommendedMana = 30000;
        estimatedDuration = "5 Hours";
    }

    let threatLevel = "UNKNOWN";
    let expectedReward = "UNKNOWN";
    let estimatedDifficulty = "UNKNOWN";

    if (recommendedMana >= 30000) {
        threatLevel = "CATASTROPHIC";
        expectedReward = "LEGENDARY";
        estimatedDifficulty = "EXTREME";
    } else if (recommendedMana >= 15000) {
        threatLevel = "SEVERE";
        expectedReward = "HIGH";
        estimatedDifficulty = "HARD";
    } else if (recommendedMana >= 8000) {
        threatLevel = "HIGH";
        expectedReward = "MODERATE-HIGH";
        estimatedDifficulty = "CHALLENGING";
    } else if (recommendedMana >= 3000) {
        threatLevel = "MODERATE";
        expectedReward = "MODERATE";
        estimatedDifficulty = "MEDIUM";
    } else if (recommendedMana >= 1000) {
        threatLevel = "LOW";
        expectedReward = "LOW-MODERATE";
        estimatedDifficulty = "EASY";
    } else {
        threatLevel = "MINIMAL";
        expectedReward = "LOW";
        estimatedDifficulty = "VERY EASY";
    }

    // SYSTEM VERDICT logic
    const hunterMana = hunterProfile?.manaPower || 0;
    let systemVerdict = "";

    if (gateStatus === "FINISHED") {
        systemVerdict = "This Gate has already been closed.\n\nNo further combat permitted.";
    } else if (hunterMana >= recommendedMana * 1.5) {
        systemVerdict = "Current Hunter vastly exceeds recommended combat capability.\n\nEntering is permitted. Survival probability: High.";
    } else if (hunterMana >= recommendedMana) {
        systemVerdict = "Current Hunter meets recommended combat capability.\n\nEntering is permitted. Survival probability: Moderate.";
    } else {
        systemVerdict = "Current Hunter is below recommended combat capability.\n\nEntering is permitted. Survival probability: Low.";
    }

    return {
        classification,
        status: gateStatus,
        timeUntilOpenSeconds: timeUntilOpen,
        recommendedMana,
        estimatedDuration,
        systemVerdict,
        gateName: name || "Unknown Gate",
        threatLevel,
        expectedReward,
        estimatedDifficulty
    };
}
