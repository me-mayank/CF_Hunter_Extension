import { systemTokens, typography } from './sharedStyles.js';
import { formatNumber, translateRank } from '../../shared/terminology.js';

import { SystemHeader } from './SystemHeader.js';

export class GateAnalysis {
    constructor() {
        this.element = document.createElement('div');
        this.element.style.width = '100%';
        this.element.style.height = '100%';
        this.shadowRoot = this.element.attachShadow({ mode: 'open' });
        this._contest = null;
        this._analysis = null;
    }

    setData(contest, analysis) {
        this._contest = contest;
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
            <div class="loading">SCANNING GATE SIGNATURE...</div>
        `;
    }

    render() {
        if (!this._contest || !this._analysis) return;

        const analysis = this._analysis;

        if (analysis.classification === "Unknown Gate") {
            this.shadowRoot.innerHTML = `
                <style>
                    ${systemTokens}
                    ${typography}
                    .unknown-container {
                        padding: 24px;
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        font-family: var(--sys-font-primary);
                        color: var(--sys-text-muted);
                        font-size: 14px;
                    }
                    .typewriter {
                        overflow: hidden;
                        white-space: nowrap;
                        letter-spacing: 1px;
                        border-right: 2px solid transparent;
                    }
                    .line1 { width: 0; animation: typing 1s steps(30, end) forwards; color: var(--sys-color-danger); font-weight: bold; }
                    .line2 { width: 0; animation: typing 1s steps(30, end) 1s forwards; }
                    .line3 { width: 0; animation: typing 1s steps(30, end) 2s forwards; }
                    .line4 { width: 0; animation: typing 1.5s steps(40, end) 3s forwards; border-right: 2px solid var(--sys-frame-primary); animation: typing 1.5s steps(40, end) 3s forwards, blink-caret .75s step-end infinite 4.5s; }
                    
                    @keyframes typing {
                        from { width: 0 }
                        to { width: 100% }
                    }
                    @keyframes blink-caret {
                        from, to { border-color: transparent }
                        50% { border-color: var(--sys-frame-primary); }
                    }
                </style>
                <div id="header-container"></div>
                <div class="unknown-container">
                    <div class="typewriter line1">[SYSTEM ALERT] Unknown Gate</div>
                    <div class="typewriter line2">Scanning environment...</div>
                    <div class="typewriter line3">Difficulty fluctuating...</div>
                    <div class="typewriter line4">Awaiting monster signatures...</div>
                </div>
            `;
            const header = new SystemHeader('GATE ANALYSIS');
            this.shadowRoot.getElementById('header-container').appendChild(header.element);
            return;
        }

        const hunterRating = window.hunterProfileCache ? window.hunterProfileCache.rating || 0 : 0;
        const hunterRankObj = translateRank(hunterRating);
        const hunterTier = hunterRankObj.tier || 1;
        const gateTier = analysis.classificationObj.tier || -1;

        let shortRec = "";
        if (analysis.status === "FINISHED") {
            shortRec = "GATE CLOSED. VIRTUAL SIMULATION PERMITTED.";
        } else if (analysis.status === "BEFORE") {
            shortRec = "GATE OPENING IMPENDING.";
        } else {
            shortRec = "GATE IS OPEN. ENTER AT YOUR OWN RISK.";
        }
        
        let relativeThreat = "EQUAL MATCH";
        let growthLabel = "STEADY GROWTH EXPECTED";
        
        // titleColor is based on Threat
        let titleColor = "#1EDBFF"; // Cyan default for EQUAL MATCH
        let titleGlow = "rgba(30, 219, 255, 0.5)";

        if (gateTier === -1) {
            // Training / Simulation Gate
            relativeThreat = "SIMULATION ACTIVE";
            growthLabel = "PRACTICE YIELD";
            titleColor = "#4be38a"; // Green
            titleGlow = "rgba(75, 227, 138, 0.6)";
        } else {
            const tierDiff = gateTier - hunterTier;
            const isVirtual = analysis.status === "FINISHED";
            
            if (tierDiff >= 2) {
                relativeThreat = "CATASTROPHIC RISK";
                growthLabel = isVirtual ? "EXTREME LEVEL-UP POTENTIAL" : "EXTREME RANK ASCENSION POTENTIAL";
                titleColor = "var(--sys-color-danger)"; // Red
                titleGlow = "rgba(255, 94, 94, 0.6)";
            } else if (tierDiff === 1) {
                relativeThreat = "HIGH RISK";
                growthLabel = isVirtual ? "SUBSTANTIAL EXP YIELD" : "SUBSTANTIAL RANK YIELD";
                titleColor = "#f97316"; // Orange
                titleGlow = "rgba(249, 115, 22, 0.6)";
            } else if (tierDiff === 0) {
                relativeThreat = "EQUAL MATCH";
                growthLabel = isVirtual ? "STEADY EXP GAIN EXPECTED" : "STEADY RANK PROGRESS EXPECTED";
                titleColor = "#1EDBFF"; // Cyan
                titleGlow = "rgba(30, 219, 255, 0.5)";
            } else if (tierDiff === -1) {
                relativeThreat = "LOW RISK";
                growthLabel = isVirtual ? "MODERATE EXP YIELD" : "MODERATE RANK YIELD";
                titleColor = "#a3e635"; // Lime green
                titleGlow = "rgba(163, 230, 53, 0.6)";
            } else {
                relativeThreat = "NO THREAT";
                growthLabel = isVirtual ? "NEGLIGIBLE EXP YIELD" : "NEGLIGIBLE RANK YIELD";
                titleColor = "var(--sys-color-level)"; // Green
                titleGlow = "rgba(75, 227, 138, 0.6)";
            }
        }

        if (analysis.status === "FINISHED") {
            relativeThreat += " [VIRTUAL]";
            growthLabel += " [VIRTUAL]";
        }

        
        // Format duration
        let durationText = "UNKNOWN";
        if (this._contest && this._contest.durationSeconds) {
            const hrs = Math.floor(this._contest.durationSeconds / 3600);
            const mins = Math.floor((this._contest.durationSeconds % 3600) / 60);
            durationText = hrs > 0 ? `${hrs}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;
        }

        this.shadowRoot.innerHTML = `
            <style>
                ${systemTokens}
                ${typography}
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                }
                .status-container {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    flex: 1;
                    justify-content: center;
                }
                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .gate-title {
                    font-size: 36px;
                    font-weight: 700;
                    color: ${titleColor};
                    text-shadow: 0 0 10px ${titleGlow};
                    margin-bottom: 12px;
                    letter-spacing: 1px;
                    font-family: var(--sys-font-primary);
                    text-align: center;
                    line-height: 1.2;
                }
                .system-rec {
                    text-transform: uppercase;
                    font-size: 14px;
                    letter-spacing: 1px;
                    font-weight: bold;
                    margin-top: 16px;
                    text-align: center;
                }
                @keyframes sys-fade-in {
                    from { opacity: 0; transform: translateY(10px); filter: blur(4px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                .anim-seq {
                    opacity: 0;
                    animation: sys-fade-in 0.4s ease-out forwards;
                }
                .delay-2 { animation-delay: 0.2s; }
                .delay-3 { animation-delay: 0.3s; }
                .delay-5 { animation-delay: 0.5s; }
            </style>

            <div class="status-container">
                <div class="gate-title anim-seq delay-2">${analysis.gateName}</div>
                
                <div class="stat-row anim-seq delay-3" style="justify-content: center; gap: 12px; margin-top: 12px; flex-wrap: wrap;">
                    <div style="border: 1px solid ${analysis.classificationObj.color}; color: ${analysis.classificationObj.color}; padding: 6px 14px; font-size: 13px; font-family: var(--sys-font-secondary); text-transform: uppercase; font-weight: bold; background: rgba(0,0,0,0.5); border-radius: 4px; letter-spacing: 1px;">
                        ▲ ${analysis.classification}
                    </div>
                    <div style="border: 1px solid ${titleColor}; color: ${titleColor}; text-shadow: 0 0 5px ${titleGlow}; box-shadow: inset 0 0 10px ${titleGlow}; padding: 6px 14px; font-size: 13px; font-family: var(--sys-font-secondary); text-transform: uppercase; font-weight: bold; background: rgba(0,0,0,0.5); border-radius: 4px; letter-spacing: 1px;">
                        ◆ THREAT: ${relativeThreat}
                    </div>
                    <div style="border: 1px solid rgba(255,255,255,0.2); color: var(--sys-text); padding: 6px 14px; font-size: 13px; font-family: var(--sys-font-secondary); text-transform: uppercase; font-weight: bold; background: rgba(0,0,0,0.5); border-radius: 4px; letter-spacing: 1px;">
                        ⏱ DURATION: ${durationText}
                    </div>
                </div>

                <div class="system-rec anim-seq delay-5" style="color: ${titleColor}; text-shadow: 0 0 8px ${titleGlow};">${shortRec}</div>
                <div class="growth-rec anim-seq delay-5" style="font-size: 13px; color: var(--sys-text-muted); text-align: center; margin-top: 6px; letter-spacing: 1px; font-family: var(--sys-font-primary);">
                    SYSTEM PROJECTION: <span style="color: ${titleColor}; text-shadow: 0 0 8px ${titleGlow};">${growthLabel}</span>
                </div>
            </div>
        `;

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
