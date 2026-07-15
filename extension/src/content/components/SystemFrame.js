import { systemTokens } from './sharedStyles.js';
import { SystemGlass } from './SystemGlass.js';

export class SystemFrame {
    constructor() {
        this.element = document.createElement('div');
        this.shadowRoot = this.element.attachShadow({ mode: 'open' });
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                ${systemTokens}
                :host {
                    display: block;
                    position: relative;
                    width: 100%;
                    max-width: 600px;
                    max-height: 90vh;
                    font-family: var(--sys-font-primary);
                    color: var(--sys-text);
                    z-index: 9999;
                    animation: frame-materialize 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes frame-materialize {
                    from {
                        transform: scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes travel-glow {
                    0% { stroke-dashoffset: 115; }
                    100% { stroke-dashoffset: -15; }
                }

                .frame-wrapper {
                    position: relative;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }
                #glass-container {
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }

                /* Construct Layers */
                .top-construct, .bottom-construct {
                    position: absolute;
                    left: 0;
                    width: 100%;
                    height: 24px;
                    z-index: 10;
                    pointer-events: none;
                }
                .top-construct { top: -6px; }
                .bottom-construct { bottom: -6px; transform: scaleY(-1); }

                .side-module-left, .side-module-right {
                    position: absolute;
                    top: 10px;
                    bottom: 10px;
                    width: 12px;
                    z-index: 9;
                    pointer-events: none;
                }
                .side-module-left { left: -4px; }
                .side-module-right { right: -4px; transform: scaleX(-1); }

                .corner-tl, .corner-tr, .corner-bl, .corner-br {
                    position: absolute;
                    width: 32px;
                    height: 32px;
                    z-index: 11;
                    pointer-events: none;
                }
                .corner-tl { top: -8px; left: -8px; }
                .corner-tr { top: -8px; right: -8px; transform: scaleX(-1); }
                .corner-bl { bottom: -8px; left: -8px; transform: scaleY(-1); }
                .corner-br { bottom: -8px; right: -8px; transform: scale(-1, -1); }

                /* SVG Styles */
                svg {
                    width: 100%;
                    height: 100%;
                    overflow: visible;
                }
                .p-line {
                    stroke: var(--sys-frame-primary);
                    stroke-width: var(--sys-border-primary);
                    fill: none;
                }
                .s-line {
                    stroke: var(--sys-frame-secondary);
                    stroke-width: var(--sys-border-secondary);
                    fill: none;
                }
                .fill-primary {
                    fill: var(--sys-frame-primary);
                }
                .travel-line {
                    stroke: #7DFFFF;
                    stroke-width: 2.5px;
                    fill: none;
                    filter: drop-shadow(0 0 8px #7DFFFF) drop-shadow(0 0 16px var(--sys-glow));
                    stroke-dasharray: 15 100;
                    stroke-dashoffset: 115;
                    animation-name: travel-glow;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                    animation-direction: alternate;
                }

                .content-slot {
                    opacity: 0;
                    animation: content-glitch-appear 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s forwards;
                }

                @keyframes content-glitch-appear {
                    0% {
                        opacity: 0;
                        transform: scale(0.98) translateY(10px);
                        filter: drop-shadow(4px 0 rgba(255,0,0,0.8)) drop-shadow(-4px 0 rgba(0,255,255,0.8));
                    }
                    20% {
                        opacity: 0.8;
                        transform: scale(1.02) translate(-2px, 2px) skewX(2deg);
                        filter: drop-shadow(-4px 0 rgba(255,0,0,0.8)) drop-shadow(4px 0 rgba(0,255,255,0.8));
                    }
                    40% {
                        opacity: 0.5;
                        transform: scale(0.99) translate(2px, -2px) skewX(-2deg);
                        filter: drop-shadow(2px 0 rgba(255,0,0,0.8)) drop-shadow(-2px 0 rgba(0,255,255,0.8));
                    }
                    60% {
                        opacity: 1;
                        transform: scale(1.01) translate(-1px, 1px) skewX(1deg);
                        filter: drop-shadow(-2px 0 rgba(255,0,0,0.8)) drop-shadow(2px 0 rgba(0,255,255,0.8));
                    }
                    80% {
                        opacity: 0.8;
                        transform: scale(1) translate(1px, -1px) skewX(-1deg);
                        filter: drop-shadow(1px 0 rgba(255,0,0,0.8)) drop-shadow(-1px 0 rgba(0,255,255,0.8));
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translate(0) skewX(0);
                        filter: none;
                    }
                }
            </style>

            <div class="frame-wrapper">
                <!-- Frame Constructs -->
                <div class="top-construct">
                    <svg preserveAspectRatio="none" viewBox="0 0 600 24">
                        <path class="s-line" d="M 40 16 L 560 16" />
                        <path class="p-line" d="M 20 12 L 80 12 L 90 6 L 510 6 L 520 12 L 580 12" />
                        <path class="travel-line" pathLength="100" d="M 20 12 L 80 12 L 90 6 L 510 6 L 520 12 L 580 12" style="animation-duration: 4.2s; animation-delay: 0s;" />
                        <rect class="fill-primary" x="250" y="4" width="100" height="2" />
                    </svg>
                </div>
                
                <div class="bottom-construct">
                    <svg preserveAspectRatio="none" viewBox="0 0 600 24">
                        <path class="s-line" d="M 40 16 L 560 16" />
                        <path class="p-line" d="M 20 12 L 80 12 L 90 6 L 510 6 L 520 12 L 580 12" />
                        <path class="travel-line" pathLength="100" d="M 20 12 L 80 12 L 90 6 L 510 6 L 520 12 L 580 12" style="animation-duration: 3.8s; animation-delay: 0.5s;" />
                    </svg>
                </div>

                <div class="side-module-left">
                    <svg preserveAspectRatio="none" viewBox="0 0 12 400">
                        <path class="s-line" d="M 10 60 L 10 340" />
                        <path class="p-line" d="M 6 40 L 6 360" />
                        <path class="travel-line" pathLength="100" d="M 6 40 L 6 360" style="animation-duration: 2.7s; animation-delay: 1.1s;" />
                        <rect class="fill-primary" x="4" y="180" width="4" height="40" />
                    </svg>
                </div>
                
                <div class="side-module-right">
                    <svg preserveAspectRatio="none" viewBox="0 0 12 400">
                        <path class="s-line" d="M 10 60 L 10 340" />
                        <path class="p-line" d="M 6 40 L 6 360" />
                        <path class="travel-line" pathLength="100" d="M 6 40 L 6 360" style="animation-duration: 3.1s; animation-delay: 0.2s;" />
                        <rect class="fill-primary" x="4" y="180" width="4" height="40" />
                    </svg>
                </div>

                <!-- Corners -->
                <div class="corner-tl">
                    <svg viewBox="0 0 32 32">
                        <path class="s-line" d="M 4 32 L 4 10 L 10 4 L 32 4" />
                        <path class="p-line" d="M 0 32 L 0 8 L 8 0 L 32 0" />
                        <path class="travel-line" pathLength="100" d="M 0 32 L 0 8 L 8 0 L 32 0" style="animation-duration: 1.8s; animation-delay: 0.8s;" />
                        <polygon class="fill-primary" points="0,8 8,0 12,0 0,12" />
                    </svg>
                </div>
                <div class="corner-tr">
                    <svg viewBox="0 0 32 32">
                        <path class="s-line" d="M 4 32 L 4 10 L 10 4 L 32 4" />
                        <path class="p-line" d="M 0 32 L 0 8 L 8 0 L 32 0" />
                        <path class="travel-line" pathLength="100" d="M 0 32 L 0 8 L 8 0 L 32 0" style="animation-duration: 2.1s; animation-delay: 0.3s;" />
                        <polygon class="fill-primary" points="0,8 8,0 12,0 0,12" />
                    </svg>
                </div>
                <div class="corner-bl">
                    <svg viewBox="0 0 32 32">
                        <path class="s-line" d="M 4 32 L 4 10 L 10 4 L 32 4" />
                        <path class="p-line" d="M 0 32 L 0 8 L 8 0 L 32 0" />
                        <path class="travel-line" pathLength="100" d="M 0 32 L 0 8 L 8 0 L 32 0" style="animation-duration: 1.9s; animation-delay: 1.5s;" />
                        <polygon class="fill-primary" points="0,8 8,0 12,0 0,12" />
                    </svg>
                </div>
                <div class="corner-br">
                    <svg viewBox="0 0 32 32">
                        <path class="s-line" d="M 4 32 L 4 10 L 10 4 L 32 4" />
                        <path class="p-line" d="M 0 32 L 0 8 L 8 0 L 32 0" />
                        <path class="travel-line" pathLength="100" d="M 0 32 L 0 8 L 8 0 L 32 0" style="animation-duration: 2.3s; animation-delay: 0.6s;" />
                        <polygon class="fill-primary" points="0,8 8,0 12,0 0,12" />
                    </svg>
                </div>

                <div id="glass-container"></div>
            </div>
        `;
        
        const glass = new SystemGlass();
        this.shadowRoot.getElementById('glass-container').appendChild(glass.element);
        
        // Expose a slot-like container for light DOM components
        this.contentContainer = document.createElement('div');
        this.contentContainer.style.position = 'relative';
        this.contentContainer.style.zIndex = '3';
        this.contentContainer.style.display = 'flex';
        this.contentContainer.style.flexDirection = 'column';
        this.contentContainer.style.minHeight = '0';
        this.contentContainer.style.width = '100%';
        this.contentContainer.style.overflowY = 'auto';
        this.contentContainer.style.overflowX = 'hidden';
        this.contentContainer.style.paddingBottom = '32px';
        this.contentContainer.className = 'content-slot';
        glass.element.appendChild(this.contentContainer);
    }

    appendChild(child) {
        this.contentContainer.appendChild(child);
    }
}
