import { systemTokens } from './sharedStyles.js';

export class SystemHeader {
    constructor(title = 'SYSTEM') {
        this.element = document.createElement('div');
        this.element.style.width = '100%';
        this.shadowRoot = this.element.attachShadow({ mode: 'open' });
        this.title = title;
        this.render();
    }

    render() {
        const title = this.title;

        this.shadowRoot.innerHTML = `
            <style>
                ${systemTokens}
                :host {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    padding-bottom: 8px;
                    border-bottom: var(--sys-border-inner) solid var(--sys-frame-secondary);
                    margin-bottom: 16px;
                    position: relative;
                }

                .title-container {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .system-icon {
                    width: 12px;
                    height: 12px;
                    background: var(--sys-frame-primary);
                    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
                    box-shadow: 0 0 10px var(--sys-glow);
                }

                .title {
                    font-family: var(--sys-font-primary);
                    font-weight: 700;
                    font-size: 1.2rem;
                    color: var(--sys-text);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    text-shadow: 0 0 8px var(--sys-glow-subtle);
                }

                .controls {
                    display: flex;
                    gap: 6px;
                }

                .control-node {
                    width: 16px;
                    height: 4px;
                    background: var(--sys-frame-secondary);
                    transform: skew(-45deg);
                }

                .control-node.active {
                    background: var(--sys-glow);
                    box-shadow: 0 0 8px var(--sys-glow);
                }

                .minimize-btn {
                    position: absolute;
                    right: 0;
                    top: -12px;
                    color: var(--sys-frame-secondary);
                    background: none;
                    border: none;
                    font-family: monospace;
                    font-size: 24px;
                    cursor: pointer;
                    line-height: 1;
                    padding: 4px 8px;
                    transition: color 0.2s, text-shadow 0.2s;
                    z-index: 1000;
                }

                .minimize-btn:hover {
                    color: var(--sys-frame-primary);
                    text-shadow: 0 0 10px var(--sys-glow);
                }

                .support-btn {
                    position: absolute;
                    right: 32px;
                    top: -6px;
                    color: var(--sys-frame-primary);
                    background: rgba(0, 255, 255, 0.1);
                    border: 1px solid var(--sys-frame-primary);
                    font-family: var(--sys-font-secondary);
                    font-size: 10px;
                    cursor: pointer;
                    line-height: 1;
                    padding: 4px 8px;
                    transition: all 0.2s;
                    z-index: 1000;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .support-btn:hover {
                    background: var(--sys-frame-primary);
                    color: #000;
                    box-shadow: 0 0 10px var(--sys-glow);
                }
            </style>

            <div class="title-container">
                <div class="system-icon"></div>
                <div class="title">${title}</div>
            </div>
            <div class="controls">
                <div class="control-node active"></div>
                <div class="control-node"></div>
                <div class="control-node"></div>
            </div>
            <button class="support-btn" title="Support System Architect" id="btn-support">[ SYSTEM SHOP ]</button>
            <button class="minimize-btn" title="Minimize" id="btn-minimize">-</button>
        `;

        this.shadowRoot.getElementById('btn-minimize').onclick = () => {
            document.dispatchEvent(new CustomEvent('hunter-system-minimize'));
        };

        this.shadowRoot.getElementById('btn-support').onclick = () => {
            chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
        };
    }
}


