import { systemTokens, typography } from './sharedStyles.js';
import { translateRank, formatNumber, LABELS, getHunterSystemSentence } from '../../shared/terminology.js';
import { STAT_ICONS, HUNTER_TYPE_BY_SKILL, getMonsterName, getHunterRecommendation, getCombatantFraming } from '../../shared/constants.js';

import { SystemHeader } from './SystemHeader.js';

export class HunterAnalysis {
    constructor() {
        this.element = document.createElement('div');
        this.element.style.width = '100%';
        this.element.style.height = '100%';
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
        const peakMonsterName = highestRating > 0 ? `${getMonsterName(highestRating)} (${highestRating})` : "None";
        
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
            <div class="anim-seq delay-2" style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px;">
                <img class="avatar" src="${avatarUrl}" alt="${profile.handle}" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 72 72%22><rect width=%2272%22 height=%2272%22 fill=%22%230f172a%22/><path d=%22M36 20C29.373 20 24 25.373 24 32C24 38.627 29.373 44 36 44C42.627 44 48 38.627 48 32C48 25.373 42.627 20 36 20ZM36 48C24.954 48 16 56.954 16 68H56C56 56.954 47.046 48 36 48Z%22 fill=%22%23334155%22/></svg>';">
                <div style="display: flex; flex-direction: column;">
                    <div class="hunter-name" style="color: var(--sys-frame-primary); font-size: 20px; text-shadow: none;">${(profile.displayName || profile.handle).toUpperCase()}</div>
                    <div class="hunter-sub" style="color:${rankTier.color}; margin-top: 2px;">[${rankTier.label.toUpperCase()}]</div>
                    <div class="hunter-sub" style="color:var(--sys-frame-primary); margin-top: 2px;">${hunterClassLabel.toUpperCase()}</div>
                </div>
            </div>
        `;

        // --- Column Left: Combat Metrics ---
        let leftColHtml = `
            <div class="sys-label" style="font-size: 11px;">COMBAT METRICS</div>
            <div class="stat-row">
                <div class="sys-label" style="font-size: 10px;">${LABELS.HUNTER_LEVEL}</div>
                <div class="sys-value" style="color: var(--sys-color-level); font-size: 13px;">Lv. <span class="anim-num" data-target-num="${profile.hunterLevel}">0</span></div>
            </div>
            <div class="stat-row">
                <div class="sys-label" style="font-size: 10px;">${LABELS.MANA_POWER}</div>
                <div class="sys-value" style="color: var(--sys-color-mana); font-size: 13px;"><span class="anim-num" data-target-num="${targetMana}">0</span> MP</div>
            </div>
        `;

        if (isComparison) {
            const manaDiff = targetMana - viewerMana;
            const targetWidth = Math.min(100, Math.max(0, 50 + (manaDiff / (viewerMana || 1)) * 50));
            leftColHtml += `
                <div class="sys-instrument-bar-container" style="margin-top: 2px;">
                    <div class="sys-instrument-bar-fill" style="width: 0%; background: var(--sys-frame-primary); box-shadow: 0 0 8px var(--sys-frame-primary);" data-target-width="${targetWidth}"></div>
                    <div class="sys-instrument-bar-ticks"></div>
                </div>
            `;
        } else {
            leftColHtml += `
                <div class="sys-instrument-bar-container" style="margin-top: 2px;">
                    <div class="sys-instrument-bar-fill" style="width: 0%; background: var(--sys-color-mana); box-shadow: 0 0 8px var(--sys-color-mana);" data-target-width="${manaPercent}"></div>
                    <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 2px; background: var(--sys-color-mana); box-shadow: 0 0 8px var(--sys-color-mana);"></div>
                </div>
            `;
        }
        
        let leftColWrapper = `<div style="display: flex; flex-direction: column; gap: 6px;">${leftColHtml}</div>`;

        // --- Column Right: Combat Record ---
        let rightColWrapper = `
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <div class="sys-label" style="font-size: 11px;">COMBAT RECORD</div>
                <div class="stat-row">
                    <div class="sys-label" style="font-size: 9px;">${LABELS.MONSTERS_DEFEATED}</div>
                    <div class="sys-value" style="font-size: 13px;"><span class="anim-num" data-target-num="${profile.problemsDefeated}">0</span></div>
                </div>
                <div class="stat-row">
                    <div class="sys-label" style="font-size: 9px;">${LABELS.DUNGEONS_CLEARED}</div>
                    <div class="sys-value" style="font-size: 13px;"><span class="anim-num" data-target-num="${profile.contestsParticipated}">0</span></div>
                </div>
                <div class="stat-row">
                    <div class="sys-label" style="font-size: 9px;">${LABELS.PEAK_MONSTER}</div>
                    <div class="sys-value" style="color: var(--sys-color-danger); font-size: 11px; font-family: var(--sys-font-secondary);">${peakMonsterName}</div>
                </div>
            </div>
        `;

        // --- Third Row: Threat Assessment & Rank Progress ---
        let thirdRowHtml = '';
        if (isComparison) {
            const framing = getCombatantFraming(viewerMana, targetMana);
            thirdRowHtml = `
                <div class="anim-seq delay-5" style="display: grid; grid-template-columns: 1fr 1px 1fr; gap: 10px; margin-bottom: 8px;">
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div class="sys-label" style="font-size: 10px;">THREAT ASSESSMENT</div>
                        <div class="sys-value" style="color: ${framing.color}; font-size: 14px; font-family: var(--sys-font-secondary);">${framing.label}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1);"></div>
                    <div style="display: flex; flex-direction: column; gap: 4px; justify-content: center;">
                        <div class="sys-label" style="font-size: 9px;">RANK PROGRESS</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div class="sys-instrument-bar-container" style="margin: 0; flex: 1;">
                                <div class="sys-instrument-bar-fill" style="width: 0%; background: ${rankTier.color}; box-shadow: 0 0 8px ${rankTier.glow};" data-target-width="${progressPercent}"></div>
                                <div class="sys-instrument-bar-ticks"></div>
                            </div>
                            <div class="sys-label" style="font-size: 9px; color: ${rankTier.color};">${progressPercent.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
                <div class="anim-seq delay-6" style="height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 8px;"></div>
            `;
        } else {
            thirdRowHtml = `
                <div class="anim-seq delay-5" style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px;">
                    <div class="sys-label" style="font-size: 10px;">RANK PROGRESS</div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="sys-instrument-bar-container" style="margin: 0; flex: 1;">
                            <div class="sys-instrument-bar-fill" style="width: 0%; background: ${rankTier.color}; box-shadow: 0 0 8px ${rankTier.glow};" data-target-width="${progressPercent}"></div>
                            <div class="sys-instrument-bar-ticks"></div>
                        </div>
                        <div class="sys-label" style="font-size: 10px; color: ${rankTier.color};">${progressPercent.toFixed(1)}%</div>
                    </div>
                </div>
                <div class="anim-seq delay-6" style="height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 8px;"></div>
            `;
        }

        // --- Bottom Row: Primary Affinity / System Recommendation ---
        let bottomRowHtml = `
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <div class="sys-label" style="font-size: 11px;">PRIMARY AFFINITY</div>
                <div class="sys-value" style="color: var(--sys-frame-primary); font-size: 13px;">${dominantSkill.toUpperCase()}</div>
            </div>
        `;
        let bottomDivider = '';
        let bottomRightCol = '';

        if (isComparison) {
            const recLabel = getHunterRecommendation(viewerMana, targetMana);
            let recColor = "var(--sys-frame-primary)";
            if (recLabel.includes('Retreat') || recLabel.includes('Extreme')) recColor = "var(--sys-color-danger)";
            else if (recLabel.includes('High Risk') || recLabel.includes('Dangerous')) recColor = "rgba(255, 207, 107, 1)";
            else if (recLabel.includes('Comparable')) recColor = "var(--sys-color-mana)";
            else if (recLabel.includes('Below')) recColor = "var(--sys-color-level)";

            bottomDivider = `<div style="background: rgba(255,255,255,0.1);"></div>`;
            bottomRightCol = `
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div class="sys-label" style="font-size: 11px;">SYSTEM RECOMMENDATION</div>
                    <div class="sys-value" style="color: ${recColor}; font-size: 14px;">${recLabel.toUpperCase()}</div>
                </div>
            `;
        }

        const bodyHtml = `
            ${headerHtml}
            
            <div class="anim-seq delay-3" style="display: grid; grid-template-columns: 1fr 1px 1fr; gap: 10px; margin-bottom: 8px;">
                ${leftColWrapper}
                <div style="background: rgba(255,255,255,0.1);"></div>
                ${rightColWrapper}
            </div>

            <div class="anim-seq delay-4" style="height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 8px;"></div>

            ${thirdRowHtml}

            <div class="anim-seq delay-6" style="display: grid; grid-template-columns: 1fr 1px 1fr; gap: 10px;">
                ${bottomRowHtml}
                ${bottomDivider}
                ${bottomRightCol}
            </div>
        `;

        this.shadowRoot.innerHTML = `
            <style>
                ${systemTokens}
                ${typography}
                :host {
                    flex: 1;
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
