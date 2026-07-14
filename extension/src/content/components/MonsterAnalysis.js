import { systemTokens, typography } from './sharedStyles.js';
import { getMonsterName, THREAT_XP_REWARDS, SKILL_COLORS, getRecommendedStrategy } from '../../shared/constants.js';
import { translateTag, LABELS, getMonsterSystemSentence } from '../../shared/terminology.js';

import { SystemHeader } from './SystemHeader.js';
import { renderManaGauge } from './ManaGauge.js';

export class MonsterAnalysis {
    constructor() {
        this.element = document.createElement('div');
        this.element.style.width = '100%';
        this.element.style.display = 'flex';
        this.element.style.flexDirection = 'column';
        this.shadowRoot = this.element.attachShadow({ mode: 'open' });
        this._problem = null;
        this._profile = null;
        this._analysis = null;
    }

    setData(problem, profile, analysis) {
        this._problem = problem;
        this._profile = profile;
        this._analysis = analysis;
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
            <div class="loading">SCANNING MONSTER...</div>
        `;
    }

    render() {
        if (!this._problem || !this._analysis) {
            this.shadowRoot.innerHTML = `
                <style>
                    ${systemTokens}
                    ${typography}
                    :host { display: block; width: 100%; height: 100%; }
                    .error-container {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100%;
                        text-align: center;
                        gap: 16px;
                    }
                    .sys-title {
                        color: var(--sys-color-danger);
                        font-size: 24px;
                    }
                </style>
                <div id="header-container"></div>
                <div class="error-container">
                    <div class="sys-title">Unable to analyze target.</div>
                    <div class="sys-label">SYSTEM could not determine sufficient battle information.</div>
                </div>
            `;
            const header = new SystemHeader('MONSTER ANALYSIS');
            this.shadowRoot.getElementById('header-container').appendChild(header.element);
            return;
        }

        const problem = this._problem;
        const profile = this._profile;
        const analysis = this._analysis;

        // If the problem object exists but we couldn't extract basic info, show error
        if (!problem.rating && problem.name === "Unknown Entity") {
            this.shadowRoot.innerHTML = `
                <style>
                    ${systemTokens}
                    ${typography}
                    :host { display: block; width: 100%; height: 100%; }
                    .error-container {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100%;
                        text-align: center;
                        gap: 16px;
                    }
                    .sys-title {
                        color: var(--sys-color-danger);
                        font-size: 24px;
                    }
                </style>
                <div id="header-container"></div>
                <div class="error-container">
                    <div class="sys-title">Unable to analyze target.</div>
                    <div class="sys-label">SYSTEM could not determine sufficient battle information.</div>
                </div>
            `;
            const header = new SystemHeader('MONSTER ANALYSIS');
            this.shadowRoot.getElementById('header-container').appendChild(header.element);
            return;
        }

        let primaryAffinity = "UNKNOWN";
        if (profile && profile.skillAffinities) {
            let maxVal = 0;
            const problemSkills = new Set((problem.tags || []).map(t => translateTag(t)));
            for (const skill of Object.keys(profile.skillAffinities)) {
                if (problemSkills.has(skill) && profile.skillAffinities[skill] > maxVal) {
                    maxVal = profile.skillAffinities[skill];
                    primaryAffinity = skill.toUpperCase();
                }
            }
            if (primaryAffinity === "UNKNOWN" && Object.keys(profile.skillAffinities).length > 0) {
                primaryAffinity = Object.keys(profile.skillAffinities)[0].toUpperCase();
            }
        }

        const getShortRecommendation = (label) => {
            if (label.includes('Fodder') || label.includes('Low')) return 'Suitable for Farming.';
            if (label.includes('Moderate')) return 'Proceed.';
            if (label.includes('High') || label.includes('Significant')) return 'Challenge Recommended.';
            if (label.includes('Severe') || label.includes('Extreme')) return 'High Risk.';
            if (label.includes('Disaster') || label.includes('Catastrophe')) return 'Retreat Recommended.';
            if (label.includes('Monarch') || label.includes('God')) return 'Beyond Current Capability.';
            return 'Proceed with Caution.';
        };
        const shortRec = getShortRecommendation(analysis.threatLabel);

        let threatKey = "EQUAL";
        if (analysis.threatLabel === "Safe Zone") threatKey = "VERY_EASY";
        else if (analysis.threatLabel === "Low Threat") threatKey = "EASY";
        else if (analysis.threatLabel === "Dangerous") threatKey = "DANGEROUS";
        else if (analysis.threatLabel === "Very Dangerous") threatKey = "EXTREME";
        else if (analysis.threatLabel === "Catastrophic") threatKey = "CATASTROPHIC";
        
        const expReward = THREAT_XP_REWARDS[threatKey] ? THREAT_XP_REWARDS[threatKey].xp : 50;

        const validTags = (problem.tags || [])
            .map(t => translateTag(t))
            .filter(t => t !== null);
        const uniqueTags = [...new Set(validTags)].slice(0, 3);

        this.shadowRoot.innerHTML = `
            <style>
                ${systemTokens}
                ${typography}
                :host {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                }
                .status-container {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    justify-content: center;
                }
                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .monster-title {
                    font-size: 42px;
                    font-weight: 700;
                    color: ${analysis.threatColor};
                    text-shadow: 0 0 10px ${analysis.threatGlow};
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                    font-family: var(--sys-font-primary);
                }
                .system-rec {
                    font-size: 28px;
                    font-weight: bold;
                    color: ${analysis.threatColor};
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    text-align: center;
                    margin-top: 16px;
                    font-family: var(--sys-font-primary);
                }
                .divider {
                    height: 1px;
                    background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%);
                    width: 100%;
                    margin: 8px 0;
                }

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
                .delay-6 { animation-delay: 1.1s; }
            </style>

            <div id="header-container" class="anim-seq delay-1"></div>

            <div class="status-container" style="justify-content: flex-start; padding: 0 10px 4px 10px;">
                <!-- MONSTER DETECTED -->
                <div style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 12px;">
                    <div class="sys-label anim-seq delay-2" style="font-size: 11px; margin-bottom: 4px;">MONSTER DETECTED</div>
                    <div class="anim-seq delay-2" style="color: ${analysis.threatColor}; text-shadow: 0 0 10px ${analysis.threatGlow}; font-family: var(--sys-font-primary); font-size: 24px; font-weight: 700; margin-bottom: 4px; line-height: 1.1;">
                        ${problem.name || problem.id || "Unknown Entity"}
                    </div>
                    <div class="sys-label anim-seq delay-2" style="text-transform: none; margin-bottom: 8px; font-size: 12px;">
                        Rating: <span class="anim-num" data-target-num="${problem.rating || 0}">0</span>
                    </div>
                    <div class="anim-seq delay-3" style="border: 1px solid ${analysis.threatColor}; color: ${analysis.threatColor}; padding: 3px 10px; font-size: 11px; font-family: var(--sys-font-secondary); text-transform: uppercase; font-weight: bold; background: rgba(0,0,0,0.5); border-radius: 2px;">
                        ▲ ${analysis.threatLabel}
                    </div>
                </div>

                <!-- THREAT VS MANA POWER -->
                ${renderManaGauge(
                    profile ? profile.manaPower || 0 : 0, 
                    profile ? profile.peakManaPower || profile.manaPower || 0 : 0, 
                    'var(--sys-color-mana)', 
                    true, 
                    `<div class="sys-value" style="color: rgba(255, 207, 107, 1); font-size: 12px; font-family: var(--sys-font-secondary);">+<span class="anim-num" data-target-num="${expReward}">0</span> XP</div>`
                )}

                <!-- SYSTEM VERDICT -->
                <div class="anim-seq delay-5" style="margin: 16px 0 12px 0; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 10px 0;">
                    <div class="sys-label" style="font-size: 10px; margin-bottom: 6px; letter-spacing: 2px;">SYSTEM VERDICT</div>
                    <div style="color: ${analysis.threatColor}; text-shadow: 0 0 8px ${analysis.threatGlow}; font-family: var(--sys-font-primary); font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                        ${getRecommendedStrategy(analysis.threatLabel)}
                    </div>
                </div>

                <!-- SKILL AFFINITIES -->
                <div style="display: flex; flex-direction: column; align-items: center; margin-top: 4px;">
                    <div class="sys-section-header anim-seq delay-6" style="font-size: 11px; margin-bottom: 6px;">${LABELS.SKILLS_REQUIRED}</div>
                    <div class="anim-seq delay-6" style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; margin-bottom: auto; padding-bottom: 2px;">
                        ${uniqueTags.map(translated => {
                            const upper = translated.toUpperCase();
                            const lower = translated.toLowerCase();
                            const matchesViewer = profile && profile.skillAffinities && profile.skillAffinities[lower];
                            const pillColor = SKILL_COLORS[lower] || 'var(--sys-frame-primary)';
                            const borderStyle = matchesViewer ? `1px solid ${pillColor}` : `1px dashed ${pillColor}`;
                            return "<div style=\"border: " + borderStyle + "; color: " + pillColor + "; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-family: var(--sys-font-secondary); text-transform: uppercase;\">◆ " + upper + "</div>";
                        }).join('')}
                    </div>
                </div>

                <!-- FOOTER -->
                <div class="anim-seq delay-6" style="margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px; display: flex; flex-direction: column; align-items: flex-end;">
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <div class="sys-label" style="font-size: 9px;">MONSTER ID</div>
                        <div style="color: var(--sys-text); font-family: var(--sys-font-secondary); font-size: 11px;">${problem.id || "N/A"}</div>
                    </div>
                </div>
            </div>
        `;
        
        const header = new SystemHeader('THREAT ANALYSIS');
        this.shadowRoot.getElementById('header-container').appendChild(header.element);

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
                    el.textContent = current;
                    if (progress < 1) requestAnimationFrame(animate);
                    else el.textContent = target;
                };
                requestAnimationFrame(animate);
            });
        }, 800);
    }
}
