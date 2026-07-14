import { systemTokens } from './sharedStyles.js';

export class SystemGlass {
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
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    background: var(--sys-glass-bg);
                    z-index: 1;
                    border: var(--sys-border-inner) solid var(--sys-glass-border);
                    box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.9);
                    opacity: 0;
                    animation: glass-appear 0.5s ease-out 0.2s forwards;
                    overflow: hidden;
                }

                .gradient-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(180deg, rgba(6,15,28,0.2) 0%, rgba(6,15,28,0.95) 100%);
                    pointer-events: none;
                    z-index: 1;
                }

                /* Subtle noise overlay */
                .noise {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    opacity: 0.03;
                    pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                }

                @keyframes glass-appear {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .content-container {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    height: 100%;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                    overflow-x: hidden;
                    transition: filter 0.2s;
                }

                /* Custom Scrollbar for holographic feel */
                .content-container::-webkit-scrollbar {
                    width: 4px;
                }
                .content-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .content-container::-webkit-scrollbar-thumb {
                    background: var(--sys-frame-primary);
                    border-radius: 2px;
                    box-shadow: 0 0 5px var(--sys-glow);
                }

                /* Glitch Effects */
                .glitch-scanline::after {
                    content: '';
                    position: absolute;
                    top: -10%; left: 0; right: 0; height: 10px;
                    background: rgba(0, 240, 255, 0.4);
                    box-shadow: 0 0 20px rgba(0, 240, 255, 0.8);
                    animation: scanline 0.8s linear;
                    pointer-events: none;
                    z-index: 100;
                }
                @keyframes scanline {
                    0% { top: -10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 110%; opacity: 0; }
                }

                .glitch-rgb {
                    animation: rgb-split 0.15s cubic-bezier(.25, .46, .45, .94) 2 alternate both;
                }
                @keyframes rgb-split {
                    0% { text-shadow: none; transform: none; }
                    100% { 
                        text-shadow: -2px 0 red, 2px 0 cyan; 
                        transform: translate(-1px, 1px);
                    }
                }

                .glitch-flicker {
                    animation: flicker 0.2s steps(2, start) 3;
                }
                @keyframes flicker {
                    0% { opacity: 1; }
                    50% { opacity: 0.8; }
                    100% { opacity: 1; }
                }

                .glitch-distortion {
                    filter: hue-rotate(90deg) contrast(150%) blur(1px);
                }
            </style>
            <div class="noise"></div>
            <div class="gradient-overlay"></div>
            <div class="content-container">
                <slot></slot>
            </div>
        `;

        this.startIdleGlitch();
    }

    startIdleGlitch() {
        const container = this.shadowRoot.querySelector('.content-container');
        const effects = ['glitch-scanline', 'glitch-rgb', 'glitch-flicker', 'glitch-distortion'];
        
        const triggerGlitch = () => {
            const effect = effects[Math.floor(Math.random() * effects.length)];
            container.classList.add(effect);
            
            // Remove effect quickly
            setTimeout(() => {
                container.classList.remove(effect);
            }, effect === 'glitch-scanline' ? 800 : 150);

            // Schedule next glitch between 10-15s
            const nextTime = 10000 + Math.random() * 5000;
            setTimeout(triggerGlitch, nextTime);
        };

        // Start first glitch
        setTimeout(triggerGlitch, 10000 + Math.random() * 5000);
    }
}


