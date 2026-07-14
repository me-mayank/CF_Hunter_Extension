import { saveHUDState, loadHUDState } from '../../storage/hudState.js';
import { SystemFrame } from '../components/SystemFrame.js';

export function initHUD(pageType) {
    if (document.getElementById('hunter-system-hud-root')) {
        return; // Already initialized
    }

    const host = document.createElement('div');
    host.id = 'hunter-system-hud-root';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    
    // Inject global styles inside shadow root if needed, but components handle their own styles
    const styleTag = document.createElement('style');
    const fontUrl = chrome.runtime.getURL('assets/fonts/ShareTechMono.ttf');
    styleTag.textContent = `
        @font-face {
            font-family: 'Share Tech Mono';
            src: url('${fontUrl}') format('truetype');
            font-weight: normal;
            font-style: normal;
        }
        .system-online-badge {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(10, 20, 30, 0.8);
            color: #38aaff;
            border: 1px solid #38aaff;
            padding: 8px 16px;
            font-family: 'Orbitron', sans-serif;
            font-size: 12px;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 0 10px rgba(56, 170, 255, 0.4);
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { box-shadow: 0 0 5px rgba(56, 170, 255, 0.4); }
            50% { box-shadow: 0 0 15px rgba(56, 170, 255, 0.8); }
            100% { box-shadow: 0 0 5px rgba(56, 170, 255, 0.4); }
        }
        .drag-handle {
            position: absolute;
            top: 0; left: 0; right: 0; height: 30px;
            cursor: grab;
            z-index: 100;
        }
    `;
    shadow.appendChild(styleTag);

    // Create the separate Online Badge
    const onlineBadge = document.createElement('div');
    onlineBadge.className = 'system-online-badge';
    onlineBadge.textContent = 'SYSTEM ONLINE';
    shadow.appendChild(onlineBadge);

    // Create System Frame container
    const frameComponent = new SystemFrame();
    const container = frameComponent.element;
    container.style.position = 'fixed';
    
    // Create drag handle overlay on the shadow root directly so it sits on top of everything
    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.style.position = 'absolute';
    dragHandle.style.top = '0';
    dragHandle.style.left = '0';
    dragHandle.style.right = '0';
    dragHandle.style.height = '40px';
    dragHandle.style.cursor = 'grab';
    dragHandle.style.zIndex = '999';
    frameComponent.shadowRoot.appendChild(dragHandle);

    // Create content area
    const content = document.createElement('div');
    content.id = 'hunter-hud-content';
    content.style.position = 'relative';
    content.style.zIndex = '10';
    content.style.flex = '1';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.width = '100%';
    frameComponent.appendChild(content);

    onlineBadge.onclick = () => {
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
    };

    document.addEventListener('hunter-system-minimize', () => {
        container.style.display = 'none';
    });
    
    const savedState = loadHUDState() || { collapsed: false, left: null, top: null };

    // Apply saved position or place it relative to badge
    if (savedState.left && savedState.top) {
        container.style.left = savedState.left;
        container.style.top = savedState.top;
        container.style.bottom = 'auto';
        container.style.right = 'auto';
    } else {
        // Default positioning floating above the badge
        container.style.bottom = '60px';
        container.style.right = '20px';
    }

    shadow.appendChild(container);

    // Make draggable via the overlay handle
    makeDraggable(container, dragHandle, savedState);

    return { shadow, container, content };
}

function makeDraggable(element, handle, stateObj) {
    let isDragging = false;
    let startX = 0, startY = 0, initialX = 0, initialY = 0;

    handle.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('hunter-hud-toggle')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = element.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        element.style.left = `${initialX + dx}px`;
        element.style.top = `${initialY + dy}px`;
        element.style.bottom = 'auto'; // Override default bottom positioning
        element.style.right = 'auto';
    }

    function onMouseUp() {
        if (isDragging) {
            stateObj.left = element.style.left;
            stateObj.top = element.style.top;
            saveHUDState(stateObj);
        }
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}
