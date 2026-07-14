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

        const getShortVerdict = (verdict) => {
            if (!verdict) return 'Scanning Status...';
            if (verdict.includes('closed')) return 'Gate Closed. No Entry.';
            if (verdict.includes('vastly exceeds')) return 'Proceed. Survival Probability: High.';
            if (verdict.includes('meets recommended')) return 'Proceed. Survival Probability: Moderate.';
            return 'High Risk. Survival Probability: Low.';
        };
        const shortRec = getShortVerdict(analysis.systemVerdict || "");

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
                    font-size: 42px;
                    font-weight: 700;
                    color: var(--sys-text);
                    margin-bottom: 8px;
                    letter-spacing: 1px;
                    font-family: var(--sys-font-primary);
                }
                .system-rec {
                    font-size: 28px;
                    font-weight: bold;
                    color: var(--sys-frame-primary);
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

            <div class="gate-title anim-seq delay-2">${analysis.gateName}</div>
            
            <div class="divider anim-seq delay-2"></div>

            <div class="status-container">
                <div class="stat-row anim-seq delay-3">
                    <div class="sys-label">Gate Rank</div>
                    <div class="sys-value" style="color: ${analysis.classificationObj.color}; text-shadow: 0 0 5px ${analysis.classificationObj.glow};">${analysis.classification.toUpperCase()}</div>
                </div>
                <div class="stat-row anim-seq delay-3">
                    <div class="sys-label">Contest Status</div>
                    <div class="sys-value" style="color: #8a6bff;">${analysis.status}</div>
                </div>

                <div class="divider anim-seq delay-3"></div>

                <div class="stat-row anim-seq delay-4">
                    <div class="sys-label">Recommended Hunter Rank</div>
                    <div class="sys-value" style="color: var(--sys-color-level); font-size: 20px;">RATING ${analysis.recommendedMana}</div>
                </div>
                <div class="stat-row anim-seq delay-4">
                    <div class="sys-label">Recommended Hunter Level</div>
                    <div class="sys-value" style="color: var(--sys-color-level); font-size: 20px;">Lv. <span class="anim-num" data-target-num="${Math.floor(analysis.recommendedMana / 50)}">0</span></div>
                </div>

                <div class="divider anim-seq delay-4"></div>

                <div class="stat-row anim-seq delay-5">
                    <div class="sys-label">Threat Level</div>
                    <div class="sys-value" style="color: var(--sys-color-danger);">${analysis.threatLevel || "UNKNOWN"}</div>
                </div>
                <div class="stat-row anim-seq delay-5">
                    <div class="sys-label">Expected Reward</div>
                    <div class="sys-value" style="color: rgba(255, 207, 107, 1);">${analysis.expectedReward || "UNKNOWN"}</div>
                </div>
                <div class="stat-row anim-seq delay-5">
                    <div class="sys-label">Estimated Completion Difficulty</div>
                    <div class="sys-value" style="color: var(--sys-frame-primary);">${analysis.estimatedDifficulty || "UNKNOWN"}</div>
                </div>

                <div class="divider anim-seq delay-5"></div>

                <div class="system-rec anim-seq delay-6">${shortRec}</div>
            </div>
        `;
        
        const header = new SystemHeader('GATE ANALYSIS');
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
