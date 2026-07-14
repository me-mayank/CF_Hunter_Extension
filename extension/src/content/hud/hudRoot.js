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
        .system-badge-container {
            float: left;
            margin-left: 15px;
            height: 3em;
            display: flex;
            align-items: center;
        }
        .system-online-badge {
            position: relative;
            background: rgba(10, 20, 30, 0.8);
            color: #38aaff;
            font-family: 'Orbitron', sans-serif;
            font-size: 11px;
            cursor: pointer;
            border-radius: 4px;
            font-weight: bold;
            height: 2.4em;
            padding: 0 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(56, 170, 255, 0.2);
        }
        
        .system-online-badge::before {
            content: '';
            position: absolute;
            width: 250%;
            height: 250%;
            background: conic-gradient(from 0deg, transparent 70%, #38aaff 100%);
            animation: badge-rotate 2.5s linear infinite;
            z-index: 0;
        }

        .system-online-badge::after {
            content: '';
            position: absolute;
            inset: 1.5px;
            background: rgba(10, 20, 30, 0.95);
            border-radius: 2.5px;
            z-index: 1;
        }

        .system-online-badge > span {
            position: relative;
            z-index: 2;
            letter-spacing: 0.5px;
            text-shadow: 0 0 8px rgba(56, 170, 255, 0.6);
        }

        @keyframes badge-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .drag-handle {
            position: absolute;
            top: 0; left: 0; right: 0; height: 30px;
            cursor: grab;
            z-index: 100;
        }
    `;
    // We need to inject styles into document head so the nav bar badge gets them
    const globalStyleTag = document.createElement('style');
    globalStyleTag.textContent = styleTag.textContent;
    document.head.appendChild(globalStyleTag);

    shadow.appendChild(styleTag);

    // Create the separate Online Badge
    const onlineBadge = document.createElement('div');
    onlineBadge.className = 'system-online-badge';
    const badgeText = document.createElement('span');
    badgeText.textContent = 'SYSTEM';
    onlineBadge.appendChild(badgeText);

    // Inject into CF Nav Bar
    const navBar = document.querySelector('.menu-list.main-menu-list');
    if (navBar) {
        const li = document.createElement('li');
        li.className = 'system-badge-container';
        li.appendChild(onlineBadge);
        navBar.appendChild(li);
    } else {
        // Fallback if nav bar not found
        onlineBadge.style.position = 'fixed';
        onlineBadge.style.bottom = '20px';
        onlineBadge.style.right = '20px';
        onlineBadge.style.zIndex = '10000';
        document.body.appendChild(onlineBadge);
    }

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
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.width = '100%';
    frameComponent.appendChild(content);

    onlineBadge.onclick = () => {
        const isHidden = container.style.display === 'none';
        container.style.display = isHidden ? 'block' : 'none';
        savedState.collapsed = !isHidden;
        saveHUDState(savedState);
    };

    document.addEventListener('hunter-system-minimize', () => {
        container.style.display = 'none';
        savedState.collapsed = true;
        saveHUDState(savedState);
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'TOGGLE_HUD') {
            const isHidden = container.style.display === 'none';
            container.style.display = isHidden ? 'block' : 'none';
            savedState.collapsed = !isHidden;
            saveHUDState(savedState);
        }
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

    // Apply collapsed state
    if (savedState.collapsed) {
        container.style.display = 'none';
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
