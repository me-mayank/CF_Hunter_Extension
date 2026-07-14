/**
 * Generates dynamic SYSTEM assessments comparing two Hunters.
 */

export function evaluateRelativeHunter(loggedInProfile, viewedProfile) {
    if (!loggedInProfile || !viewedProfile) return null;

    const loggedInCombat = loggedInProfile.combatProficiency || 0;
    const viewedCombat = viewedProfile.combatProficiency || 0;

    const loggedInMana = loggedInProfile.manaPower || 0;
    const viewedMana = viewedProfile.manaPower || 0;

    const loggedInExp = loggedInProfile.problemsDefeated || 0;
    const viewedExp = viewedProfile.problemsDefeated || 0;

    // 1. Threat Assessment
    let threatAssessment = "Comparable";
    let threatColor = "var(--sys-yellow)";
    
    if (viewedCombat > loggedInCombat * 3) {
        threatAssessment = "Overwhelming";
        threatColor = "var(--sys-red)";
    } else if (viewedCombat > loggedInCombat * 1.5) {
        threatAssessment = "Dangerous";
        threatColor = "var(--sys-red)";
    } else if (loggedInCombat > viewedCombat * 3) {
        threatAssessment = "Minimal";
        threatColor = "var(--sys-text-muted)";
    } else if (loggedInCombat > viewedCombat * 1.5) {
        threatAssessment = "Low";
        threatColor = "var(--sys-green)";
    }

    // 2. Relative Mana
    let relativeMana = "Similar";
    if (viewedMana > loggedInMana * 2) relativeMana = "Extremely High";
    else if (viewedMana > loggedInMana * 1.2) relativeMana = "Higher";
    else if (loggedInMana > viewedMana * 2) relativeMana = "Severely Inferior";
    else if (loggedInMana > viewedMana * 1.2) relativeMana = "Inferior";

    // 3. Combat Experience
    let combatExperience = "Comparable";
    if (viewedExp > loggedInExp * 2) combatExperience = "Far Greater";
    else if (viewedExp > loggedInExp * 1.2) combatExperience = "Greater";
    else if (loggedInExp > viewedExp * 2) combatExperience = "Far Lesser";
    else if (loggedInExp > viewedExp * 1.2) combatExperience = "Lesser";

    // 4. SYSTEM VERDICT
    let verdictLine1 = "Current Hunter possesses comparable combat capability.";
    let verdictLine2 = "Victory would depend on strategy.";

    if (threatAssessment === "Overwhelming" || threatAssessment === "Dangerous") {
        verdictLine1 = "Current Hunter greatly exceeds your combat capability.";
        verdictLine2 = "Direct comparison is not recommended.";
    } else if (threatAssessment === "Minimal" || threatAssessment === "Low") {
        verdictLine1 = "Current Hunter possesses inferior combat capability.";
        verdictLine2 = "Threat Level: Low.";
    }

    return {
        threatAssessment,
        threatColor,
        relativeMana,
        combatExperience,
        systemVerdict: `${verdictLine1}<br><br>${verdictLine2}`
    };
}
