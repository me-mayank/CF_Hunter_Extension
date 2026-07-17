import { translateRank, formatNumber } from '../../shared/terminology.js';
import { playChime } from './audio.js';

let toastQueue = [];
let activeToasts = [];
const MAX_VISIBLE_TOASTS = 3;

export function showSystemWindow(title, message) {
    const toast = { id: Date.now(), title, message };
    toastQueue.push(toast);
    processToastQueue();
}

function processToastQueue() {
    if (activeToasts.length >= MAX_VISIBLE_TOASTS || toastQueue.length === 0) return;
    
    const toast = toastQueue.shift();
    renderToast(toast);
}

function renderToast(toast) {
    const windowEl = document.createElement('div');
    windowEl.className = 'hunter-system-window system-panel animate-materialize';
    
    // Position it based on active toasts (stacking downwards from top right)
    const offset = 20 + (activeToasts.length * 90);
    windowEl.style.top = `${offset}px`;
    windowEl.style.right = '20px';
    windowEl.style.width = '300px';

    windowEl.innerHTML = `
        <div class="system-panel-inner-brackets"></div>
        <div class="scanline-sweep"></div>
        <div class="hunter-window-title" style="font-size:14px; margin-bottom:4px; color: #1EDBFF;">[ ${toast.title} ]</div>
        <div class="hunter-window-message" style="color:#F8FAFC; font-size: 14px;">${toast.message}</div>
    `;
    
    const root = document.getElementById('hunter-system-hud-root');
    const container = root && root.shadowRoot ? root.shadowRoot : document.body;
    container.appendChild(windowEl);
    
    activeToasts.push({ id: toast.id, el: windowEl });
    playChime();

    // Auto-dismiss
    setTimeout(() => {
        dismissToast(toast.id);
    }, 4000);
}

function dismissToast(id) {
    const index = activeToasts.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const { el } = activeToasts[index];
    el.classList.add('fade-out');
    
    activeToasts.splice(index, 1);
    
    // Reposition remaining
    activeToasts.forEach((t, i) => {
        const offset = 20 + (i * 90);
        t.el.style.top = `${offset}px`;
    });

    setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
        processToastQueue();
    }, 500);
}

export function checkMilestones(oldProfile, newProfile) {
    if (!oldProfile || !newProfile) return;

    // Rule 1: Hunter Level crossed a multiple-of-5 boundary
    const oldLevel = oldProfile.hunterLevel || 0;
    const newLevel = newProfile.hunterLevel || 0;
    if (newLevel > oldLevel && Math.floor(newLevel / 5) > Math.floor(oldLevel / 5)) {
        showSystemWindow("LEVEL UP", `Hunter Level increased to ${newLevel}!`);
    }

    // Rule 2: Rank string changed
    const oldRank = oldProfile.hunterRank?.rank || "";
    const newRank = newProfile.hunterRank?.rank || "";
    if (oldRank && newRank && oldRank !== newRank) {
        const translatedRank = translateRank(newRank);
        showSystemWindow("HUNTER PROMOTION", `Rank upgraded to ${translatedRank.label.toUpperCase()}!`);
    }
}

export function showSystemInfo(title, message) {
    const windowEl = document.createElement('div');
    windowEl.className = 'hunter-system-window system-panel animate-materialize';
    
    windowEl.style.position = 'fixed';
    windowEl.style.top = '50%';
    windowEl.style.left = '50%';
    windowEl.style.transform = 'translate(-50%, -50%)';
    windowEl.style.width = '300px';
    windowEl.style.zIndex = '9999999';

    windowEl.innerHTML = `
        <div class="system-panel-inner-brackets"></div>
        <div class="scanline-sweep"></div>
        <div class="hunter-window-title" style="font-size:14px; margin-bottom:12px; color: #1EDBFF;">[ ${title} ]</div>
        <div class="hunter-window-message" style="color:#F8FAFC; font-size: 13px; line-height: 1.5; text-align: left;">${message}</div>
        <div style="margin-top: 16px; text-align: right;">
            <button class="sys-close-btn" style="background: rgba(0,0,0,0.5); border: 1px solid #1EDBFF; color: #1EDBFF; padding: 4px 12px; font-family: 'Share Tech Mono', monospace; font-size: 11px; cursor: pointer; text-transform: uppercase;">Acknowledge</button>
        </div>
    `;

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.6)';
    overlay.style.zIndex = '9999998';
    overlay.style.backdropFilter = 'blur(2px)';
    
    const root = document.getElementById('hunter-system-hud-root');
    const container = root && root.shadowRoot ? root.shadowRoot : document.body;
    
    container.appendChild(overlay);
    container.appendChild(windowEl);
    
    playChime();

    const close = () => {
        windowEl.classList.add('fade-out');
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (windowEl.parentNode) windowEl.parentNode.removeChild(windowEl);
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 500);
    };

    windowEl.querySelector('.sys-close-btn').addEventListener('click', close);
    overlay.addEventListener('click', close);
}
