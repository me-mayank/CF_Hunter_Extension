import { systemTokens, typography } from './sharedStyles.js';

import { SystemHeader } from './SystemHeader.js';

export class SystemNotification {
    constructor() {
        this.element = document.createElement('div');
        this.element.style.width = '100%';
        this.element.style.height = '100%';
        this.shadowRoot = this.element.attachShadow({ mode: 'open' });
        this._content = "STANDBY";
        this.render();
    }

    set content(htmlString) {
        this._content = htmlString;
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                ${systemTokens}
                ${typography}
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .notification-container {
                    padding: 24px;
                    border: 1px solid var(--sys-frame-secondary);
                    background: rgba(0,0,0,0.3);
                    box-shadow: inset 0 0 20px rgba(0, 240, 255, 0.05);
                    max-width: 80%;
                }
                .message {
                    color: var(--sys-text);
                    font-size: 14px;
                    line-height: 1.6;
                    font-family: var(--sys-font-secondary);
                    letter-spacing: 1px;
                }
                button {
                    margin-top: 16px;
                    background: transparent;
                    border: 1px solid var(--sys-frame-primary);
                    color: var(--sys-frame-primary);
                    padding: 8px 16px;
                    font-family: var(--sys-font-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                button:hover {
                    background: var(--sys-frame-primary);
                    color: #000;
                    box-shadow: 0 0 10px var(--sys-glow);
                }
            </style>

            <div id="header-container"></div>
            
            <div class="notification-container">
                <div class="message">${this._content}</div>
                <slot></slot>
            </div>
        `;
        
        const header = new SystemHeader('SYSTEM ALERT');
        this.shadowRoot.getElementById('header-container').appendChild(header.element);

        const buttons = this.shadowRoot.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.element.dispatchEvent(new CustomEvent('system-action', { detail: { action: btn.id }, bubbles: true }));
            });
        });
    }
}
