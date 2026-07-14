import { systemTokens, typography } from './sharedStyles.js';
import { formatNumber } from '../../shared/terminology.js';

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

        const hunterMana = window.hunterProfileCache ? window.hunterProfileCache.manaPower || 0 : 0;
        const recMana = analysis.recommendedMana || 0;
        
        let titleColor = analysis.classificationObj.color;
        let titleGlow = analysis.classificationObj.glow;

        // Base Relative Threat Color
        if (hunterMana < recMana) {
            titleColor = "var(--sys-color-danger)"; // Red
            titleGlow = "rgba(255, 94, 94, 0.6)";
        } else if (hunterMana >= recMana * 1.5) {
            titleColor = "var(--sys-color-level)"; // Greenish
            titleGlow = "rgba(75, 227, 138, 0.6)";
        } else {
            titleColor = "var(--sys-text)"; // White
            titleGlow = "rgba(255, 255, 255, 0.4)";
        }

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

        if (hunterMana < recMana * 0.5) {
            relativeThreat = "CATASTROPHIC RISK";
            growthLabel = "EXTREME LEVEL-UP POTENTIAL";
        } else if (hunterMana < recMana) {
            relativeThreat = "HIGH RISK";
            growthLabel = "SUBSTANTIAL GROWTH YIELD";
        } else if (hunterMana >= recMana * 1.5) {
            relativeThreat = "NO THREAT";
            growthLabel = "NEGLIGIBLE GROWTH YIELD";
        } else if (hunterMana >= recMana) {
            relativeThreat = "LOW RISK";
            growthLabel = "MODERATE GROWTH YIELD";
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
                    font-size: 16px;
                    font-weight: bold;
                    color: ${titleColor};
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    text-align: center;
                    margin-top: 16px;
                    font-family: var(--sys-font-primary);
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

                <div class="system-rec anim-seq delay-5">${shortRec}</div>
                <div class="growth-rec anim-seq delay-5" style="font-size: 13px; color: var(--sys-text-muted); text-align: center; margin-top: 6px; letter-spacing: 1px; font-family: var(--sys-font-primary);">
                    SYSTEM PREDICTION: <span style="color: var(--sys-frame-primary);">${growthLabel}</span>
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
