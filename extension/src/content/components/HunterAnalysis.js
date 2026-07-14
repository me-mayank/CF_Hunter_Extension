import { systemTokens, typography } from './sharedStyles.js';
import { SKILL_COLORS, STAT_ICONS, HUNTER_TYPE_BY_SKILL, getMonsterName, getHunterRecommendation, getCombatantFraming } from '../../shared/constants.js';
import { translateRank, formatNumber, LABELS, getHunterSystemSentence } from '../../shared/terminology.js';

import { SystemHeader } from './SystemHeader.js';
import { renderManaGauge } from './ManaGauge.js';

export class HunterAnalysis {
    constructor() {
        this.element = document.createElement('div');
        this.element.style.width = '100%';
        this.element.style.display = 'flex';
        this.element.style.flexDirection = 'column';
        this.shadowRoot = this.element.attachShadow({ mode: 'open' });
        this._profile = null;
        this._profile = null;
        this._viewerProfile = null;
    }

    setProfiles(profile, viewerProfile) {
        this._profile = profile;
        this._viewerProfile = viewerProfile;
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
            <div class="loading">SCANNING HUNTER IDENTITY...</div>
        `;
    }

    render() {
        if (!this._profile) return;
        const profile = this._profile;
        const rankTier = translateRank(profile.hunterRank?.rating);
        
        let avatarUrl = profile.titlePhoto || profile.avatar || "https://cdn.codeforces.com/no-avatar.jpg";
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
        
        // Fix peak monster name to include rating
        const highestRating = profile.highestMonsterDefeated || 0;
        const peakMonsterTier = translateRank(highestRating);
        const peakMonsterName = highestRating > 0 ? `${getMonsterName(highestRating)} (${highestRating})` : "None";
        const peakMonsterColor = highestRating > 0 ? peakMonsterTier.color : "var(--sys-text)";
        
        const peakMana = Math.max(profile.manaPower || 0, profile.peakManaPower || 0) || 1;
        const manaPercent = Math.min(100, ((profile.manaPower || 0) / peakMana) * 100);

        const isComparison = this._viewerProfile && this._viewerProfile.handle !== profile.handle;
        const viewerMana = isComparison ? (this._viewerProfile.manaPower || 0) : 0;
        const targetMana = profile.manaPower || 0;
        
        if (profile.avatarUrl && profile.avatarUrl.startsWith('//')) {
            avatarUrl = 'https:' + profile.avatarUrl;
        } else if (profile.avatarUrl) {
            avatarUrl = profile.avatarUrl;
        }
        
        // --- Shared Header ---
        const headerHtml = `
            <div class="anim-seq delay-2" style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px; justify-content: center;">
                <img class="avatar" src="${avatarUrl}" alt="${profile.handle}" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 72 72%22><rect width=%2272%22 height=%2272%22 fill=%22%230f172a%22/><path d=%22M36 20C29.373 20 24 25.373 24 32C24 38.627 29.373 44 36 44C42.627 44 48 38.627 48 32C48 25.373 42.627 20 36 20ZM36 48C24.954 48 16 56.954 16 68H56C56 56.954 47.046 48 36 48Z%22 fill=%22%23334155%22/></svg>';">
                <div style="display: flex; flex-direction: column;">
                    <div class="hunter-name" style="color: var(--sys-frame-primary); font-size: 24px; text-shadow: none; font-weight: bold;">${(profile.displayName || profile.handle).toUpperCase()}</div>
                    <div class="hunter-sub" style="color:${rankTier.color}; margin-top: 4px; font-size: 16px; font-family: var(--sys-font-secondary); letter-spacing: 1px;">[${rankTier.label.toUpperCase()}]</div>
                    <div class="hunter-sub" style="color:var(--sys-frame-primary); margin-top: 4px; font-size: 16px; font-family: var(--sys-font-secondary); letter-spacing: 1px;">${hunterClassLabel.toUpperCase()}</div>
                </div>
            </div>
        `;


        // --- Stats Row ---
        // Right-aligned values for tension and width utilization
        let statsHtml = `
            <div class="anim-seq delay-3" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; width: 100%;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                        <div class="sys-label" style="font-size: 14px;">HUNTER LEVEL</div>
                        <div class="sys-value" style="color: var(--sys-color-level); font-size: 18px;">Lv. ${profile.hunterLevel || 0}</div>
                    </div>
                    <div class="sys-label" style="font-size: 11px; margin-top: 4px; color: var(--sys-text-muted);">RANK PROGRESS</div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                        <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.1); position: relative;">
                            <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${progressPercent}%; background: ${rankTier.color}; box-shadow: 0 0 6px ${rankTier.color};"></div>
                        </div>
                        <div class="sys-label" style="font-size: 14px; color: ${rankTier.color}; margin: 0; font-weight: bold;">${progressPercent.toFixed(1)}%</div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 8px;">
                    <div class="sys-label" style="font-size: 14px;">MONSTERS DEFEATED</div>
                    <div class="sys-value" style="color: var(--sys-text); font-size: 18px;">${formatNumber(profile.problemsDefeated || 0)}</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <div class="sys-label" style="font-size: 14px;">DUNGEONS CLEARED</div>
                    <div class="sys-value" style="color: var(--sys-text); font-size: 18px;">${formatNumber(profile.contestsParticipated || 0)}</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <div class="sys-label" style="font-size: 14px;">HIGHEST NEUTRALIZED MONSTER</div>
                    <div class="sys-value" style="color: ${peakMonsterColor}; font-size: 16px;">${peakMonsterName}</div>
                </div>
            </div>
        `;

        const dominantLower = dominantSkill.toLowerCase();
        const primaryColor = SKILL_COLORS[dominantLower] || 'var(--sys-frame-primary)';

        let bottomRowHtml = `
            <div class="anim-seq delay-5" style="display: flex; justify-content: space-between; align-items: baseline; width: 100%; margin-bottom: 4px;">
                <div class="sys-label" style="font-size: 14px;">PRIMARY AFFINITY</div>
                <div class="sys-value" style="color: ${primaryColor}; font-size: 16px;">${dominantSkill.toUpperCase()}</div>
            </div>
        `;
        let comparisonHtml = '';

        if (isComparison) {
            const recLabel = getHunterRecommendation(viewerMana, targetMana);
            let recColor = "var(--sys-frame-primary)";
            if (recLabel.includes('Retreat') || recLabel.includes('Extreme')) recColor = "var(--sys-color-danger)";
            else if (recLabel.includes('High Risk') || recLabel.includes('Dangerous')) recColor = "rgba(255, 207, 107, 1)";
            else if (recLabel.includes('Comparable')) recColor = "var(--sys-color-mana)";
            else if (recLabel.includes('Below')) recColor = "var(--sys-color-level)";

            const threatData = getCombatantFraming(viewerMana, targetMana);
            const threatColor = threatData.color;
            const threatLabel = threatData.label;

            comparisonHtml = `
                <div class="anim-seq delay-6" style="display: flex; flex-direction: column; align-items: center; margin-top: 2px; margin-bottom: 2px;">
                    <div style="text-align: center;">
                        <div class="sys-label" style="font-size: 11px;">SYSTEM VERDICT</div>
                        <div class="sys-value" style="color: ${recColor}; font-size: 19px; font-weight: bold; margin-top: 4px; text-shadow: 0 0 12px ${recColor}; letter-spacing: 1px;">${recLabel.toUpperCase()}</div>
                    </div>
                </div>
            `;
        }

        const bodyHtml = `
            ${headerHtml}
            
            ${renderManaGauge(targetMana, profile.peakManaPower || profile.manaPower || 0, 'var(--sys-color-mana)', true)}
            
            ${statsHtml}
            
            ${bottomRowHtml}

            ${isComparison ? `<div class="anim-seq delay-6" style="height: 1px; background: rgba(255,255,255,0.15); margin: 4px 0 6px 0; width: 100%;"></div>${comparisonHtml}` : ''}
        `;

        this.shadowRoot.innerHTML = `
            <style>
                ${systemTokens}
                ${typography}
                :host {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    box-sizing: border-box;
                }

                .divider {
                    height: 1px;
                    background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%);
                    width: 100%;
                    margin: 16px 0;
                }

                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                /* Identity Layout */
                .avatar {
                    width: 72px;
                    height: 72px;
                    border-radius: 4px;
                    border: 2px solid var(--sys-frame-primary);
                    box-shadow: 0 0 15px var(--sys-glow-subtle);
                    transition: box-shadow 0.3s ease, border-color 0.3s ease;
                }
                .avatar:hover {
                    box-shadow: 0 0 25px var(--sys-glow);
                    border-color: #fff;
                }
                .hunter-name {
                    font-size: 36px;
                    line-height: 1;
                    font-weight: bold;
                    color: #F8FAFC;
                    text-shadow: 0 0 12px var(--sys-glow-subtle);
                    font-family: var(--sys-font-secondary);
                    letter-spacing: 2px;
                }
                .hunter-sub {
                    font-size: 12px;
                    font-family: var(--sys-font-secondary);
                    color: var(--sys-text-muted);
                }

                /* Removed old mana and promotion bar CSS */

                @keyframes sys-fade-in {
                    from { opacity: 0; transform: translateY(10px); filter: blur(4px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                .anim-seq {
                    opacity: 0;
                    animation: sys-fade-in 0.4s ease-out forwards;
                }
                .delay-1 { animation-delay: 0.6s; }
                .delay-2 { animation-delay: 0.7s; }
                .delay-3 { animation-delay: 0.8s; }
                .delay-4 { animation-delay: 0.9s; }
                .delay-5 { animation-delay: 1.0s; }
            </style>

            <div id="header-container" class="anim-seq delay-1"></div>
            
            <div style="flex: 1; display: flex; flex-direction: column;">
                ${bodyHtml}
            </div>
        `;
        
        const header = new SystemHeader('HUNTER ANALYSIS');
        this.shadowRoot.getElementById('header-container').appendChild(header.element);

        // Animate Bars
        setTimeout(() => {
            const fills = this.shadowRoot.querySelectorAll('.sys-instrument-bar-fill');
            fills.forEach(fill => {
                fill.style.width = fill.getAttribute('data-target-width') + '%';
            });
        }, 1200);

        // Animate Numbers
        setTimeout(() => {
            const numberEls = this.shadowRoot.querySelectorAll('.anim-num');
            numberEls.forEach(el => {
                const target = parseFloat(el.getAttribute('data-target-num'));
                if (isNaN(target) || target === 0) return;
                const duration = 600 + Math.random() * 300;
                const startTime = performance.now();
                const animate = (time) => {
                    const elapsed = time - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(easeOut * target);
                    el.textContent = formatNumber(current);
                    if (progress < 1) requestAnimationFrame(animate);
                    else el.textContent = formatNumber(target);
                };
                requestAnimationFrame(animate);
            });
        }, 800);
    }
}
