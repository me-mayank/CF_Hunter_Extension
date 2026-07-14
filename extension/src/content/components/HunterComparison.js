import { systemTokens, typography } from './sharedStyles.js';
import { translateRank, formatNumber } from '../../shared/terminology.js';
import { STAT_ICONS, HUNTER_TYPE_BY_SKILL, getMonsterName, getHunterRecommendation } from '../../shared/constants.js';
import { evaluateRelativeHunter } from '../../runtime/hunterComparison.js';

import { SystemHeader } from './SystemHeader.js';

export class HunterComparison {
    constructor() {
        this.element = document.createElement('div');
        this.element.style.width = '100%';
        this.element.style.height = '100%';
        this.shadowRoot = this.element.attachShadow({ mode: 'open' });
        this._viewedProfile = null;
        this._loggedInProfile = null;
    }

    setProfiles(viewedProfile, loggedInProfile) {
        this._viewedProfile = viewedProfile;
        this._loggedInProfile = loggedInProfile;
        this.render();
    }

    renderLoading() {
        this.shadowRoot.innerHTML = `
            <style>
                ${systemTokens}
                ${typography}
                .loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: var(--sys-text-muted);
                    font-family: var(--sys-font-secondary);
                    font-size: 14px;
                    letter-spacing: 2px;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            </style>
            <div class="loading">SCANNING EXTERNAL HUNTER...</div>
        `;
    }

    render() {
        if (!this._viewedProfile) return;
        const profile = this._viewedProfile;
        const loggedIn = this._loggedInProfile;
        
        const rankTier = translateRank(profile.hunterRank?.rating);
        let avatarUrl = profile.titlePhoto || profile.avatar || profile.avatarUrl || "https://cdn.codeforces.com/no-avatar.jpg";
        if (avatarUrl.startsWith('//')) {
            avatarUrl = 'https:' + avatarUrl;
        }
        let displayName = profile.displayName || profile.handle;

        let dominantSkill = "Strength";
        let maxSkill = 0;
        if (profile.skillAffinities) {
            for (const [skill, val] of Object.entries(profile.skillAffinities)) {
                if (val > maxSkill) {
                    maxSkill = val;
                    dominantSkill = skill;
                }
            }
        }
        const hunterClassLabel = HUNTER_TYPE_BY_SKILL[dominantSkill] || "Unclassified Hunter";
        
        let progressPercent = 100;
        const currentRating = profile.hunterRank?.rating || 0;
        if (rankTier.nextRankRating) {
            progressPercent = Math.max(0, Math.min(100, ((currentRating - rankTier.minRating) / (rankTier.nextRankRating - rankTier.minRating)) * 100));
        }
        const peakMonsterName = getMonsterName(profile.highestMonsterDefeated);
        
        const manaPercent = Math.min(100, ((profile.manaPower || 0) / 5000) * 100);
        const peakManaPercent = Math.min(100, ((profile.peakManaPower || profile.manaPower || 0) / 5000) * 100);

        let manaDiff = 0;
        let diffSign = "";
        let diffColor = "var(--sys-text-muted)";
        let threatLabel = "▲ UNKNOWN THREAT";

        if (loggedIn) {
            manaDiff = (profile.manaPower || 0) - (loggedIn.manaPower || 0);
            diffSign = manaDiff > 0 ? "+" : "";
            diffColor = manaDiff > 0 ? "var(--sys-text-alert)" : "#4be38a";
            
            if (manaDiff > 1000) threatLabel = "▲ DISASTER LEVEL THREAT";
            else if (manaDiff > 300) threatLabel = "▲ HIGH THREAT";
            else if (manaDiff > -300) threatLabel = "◆ EQUAL COMBATANT";
            else if (manaDiff > -1000) threatLabel = "▼ LOW THREAT";
            else threatLabel = "▼ NEGLIGIBLE";
        }

        let recommendationHtml = `<div style="color:var(--sys-text-muted); font-size: 12px; font-style: italic;">Log in to Codeforces for combat comparison</div>`;
        if (loggedIn) {
            const rec = getHunterRecommendation(loggedIn.manaPower || 0, profile.manaPower || 0);
            let recColor = "var(--sys-text-muted)";
            if (rec.includes("Retreat")) recColor = "var(--sys-text-alert)";
            else if (rec.includes("High Risk") || rec.includes("Dangerous")) recColor = "rgba(255, 207, 107, 1)"; // yellow
            else if (rec.includes("Comparable")) recColor = "var(--sys-frame-primary)";
            else recColor = "#4be38a"; // green
            
            recommendationHtml = `<div style="color:${recColor}; font-weight: bold; font-size: 1.2rem; font-family: var(--sys-font-primary); letter-spacing: 1px;">${rec.toUpperCase()}</div>`;
        }
        
        let combatDifference = "Unknown";
        if (loggedIn) {
            const rel = evaluateRelativeHunter(loggedIn, profile);
            if (rel) {
                combatDifference = rel.combatExperience;
            }
        }

        this.shadowRoot.innerHTML = `
            <style>
                ${systemTokens}
                ${typography}
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
                .grid-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }
                .section-label {
                    font-family: var(--sys-font-secondary);
                    font-size: 14px;
                    color: var(--sys-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 8px;
                    border-bottom: 1px solid var(--sys-frame-secondary);
                    padding-bottom: 4px;
                }
                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .sys-label {
                    font-size: 12px;
                }
                .sys-value-large {
                    font-size: 1.5rem;
                    font-weight: bold;
                    font-family: var(--sys-font-primary);
                }
                .identity-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .avatar {
                    width: 64px;
                    height: 64px;
                    border-radius: 4px;
                    border: 1px solid var(--sys-frame-primary);
                    box-shadow: 0 0 10px var(--sys-glow-subtle);
                }
                .mana-bar-container {
                    width: 100%;
                    height: 12px;
                    background: rgba(0, 240, 255, 0.1);
                    border: 1px solid var(--sys-frame-secondary);
                    position: relative;
                    margin-top: 8px;
                    margin-bottom: 16px;
                }
                .mana-bar-fill {
                    height: 100%;
                    background: var(--sys-glow);
                    box-shadow: 0 0 10px var(--sys-glow);
                    transition: width 1s ease-out;
                }
                .mana-bar-peak {
                    position: absolute;
                    top: -2px; bottom: -2px; width: 2px;
                    background: #fff; box-shadow: 0 0 5px #fff;
                }
                .promotion-bar-container {
                    flex: 1; height: 4px; background: rgba(255,255,255,0.1); margin-right: 12px; position: relative;
                }
                .promotion-bar-fill { height: 100%; transition: width 1s ease-out; }
            </style>

            <div id="header-container"></div>

            <div class="identity-header">
                <img class="avatar" src="${avatarUrl}" alt="${profile.handle}">
                <div>
                    <div class="sys-title" style="font-size: 2.5rem; line-height: 1.1; font-weight: bold; text-shadow: 0 0 10px var(--sys-glow-subtle);">${displayName}</div>
                    <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 1.2rem; align-items: center;">
                        <div class="sys-label" style="color:${rankTier.color};">[${rankTier.label.toUpperCase()}]</div>
                        <div class="sys-label" style="color:var(--sys-frame-primary);">${hunterClassLabel}</div>
                    </div>
                </div>
            </div>

            <div class="grid-layout">
                <div>
                    <div class="section-label">HUNTER INFORMATION</div>
                    <div class="stat-row">
                        <div class="sys-label">Hunter Rank</div>
                        <div class="sys-value-large" style="color: ${rankTier.color};">${rankTier.label}</div>
                    </div>
                    <div class="stat-row">
                        <div class="sys-label">Hunter Level</div>
                        <div class="sys-value-large" style="color: #4be38a;">${formatNumber(profile.hunterLevel)}</div>
                    </div>
                    <div class="stat-row">
                        <div class="sys-label">Mana Power</div>
                        <div class="sys-value-large" style="color: #8a6bff;">${formatNumber(profile.manaPower)}</div>
                    </div>
                    <div class="stat-row">
                        <div class="sys-label">Monsters Defeated</div>
                        <div class="sys-value-large">${formatNumber(profile.problemsDefeated)}</div>
                    </div>
                    <div class="stat-row">
                        <div class="sys-label">Dungeons Cleared</div>
                        <div class="sys-value-large">${formatNumber(profile.contestsParticipated)}</div>
                    </div>
                    <div class="stat-row">
                        <div class="sys-label">Highest Threat Neutralized</div>
                        <div class="sys-value-large" style="color: #ff5e5e; font-size: 1.2rem;">${peakMonsterName}</div>
                    </div>
                    <div class="stat-row">
                        <div class="sys-label">Primary Combat Affinity</div>
                        <div class="sys-value-large" style="color: var(--sys-frame-primary);">${dominantSkill.toUpperCase()}</div>
                    </div>
                </div>

                <div>
                    <div class="section-label">RELATIVE COMPARISON</div>
                    <div class="stat-row">
                        <div class="sys-label">Threat Assessment</div>
                        <div class="sys-value-large" style="color: ${threatLabel.includes('NEGLIGIBLE') ? 'var(--sys-text-muted)' : (threatLabel.includes('DISASTER') ? 'var(--sys-red)' : 'var(--sys-yellow)')};">${threatLabel}</div>
                    </div>
                    <div class="stat-row">
                        <div class="sys-label">Mana Difference</div>
                        <div class="sys-value-large" style="color: ${diffColor};">${diffSign}${Math.abs(manaDiff)}</div>
                    </div>
                    <div class="stat-row">
                        <div class="sys-label">Combat Difference</div>
                        <div class="sys-value-large" style="color: var(--sys-frame-primary);">${combatDifference.toUpperCase()}</div>
                    </div>
                    <div class="stat-row" style="flex-direction: column; align-items: flex-start; margin-top: 16px;">
                        <div class="sys-label" style="margin-bottom: 8px;">Relative Combat Capability</div>
                        <div class="sys-value-large">${recommendationHtml}</div>
                    </div>

                    <div class="section-label" style="margin-top:24px;">RANK PROGRESS</div>
                    <div style="display: flex; align-items: center; margin-top: 8px; margin-bottom: 24px;">
                        <div class="promotion-bar-container">
                            <div class="promotion-bar-fill" style="width: ${progressPercent}%; background: ${rankTier.color}; box-shadow: 0 0 8px ${rankTier.glow};"></div>
                        </div>
                        <div class="sys-value-large" style="font-size: 1.2rem; color: ${rankTier.color};">
                            ${rankTier.nextRankRating ? progressPercent.toFixed(1) + '%' : 'MAX'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const header = new SystemHeader('HUNTER ANALYSIS');
        this.shadowRoot.getElementById('header-container').appendChild(header.element);
    }
}

