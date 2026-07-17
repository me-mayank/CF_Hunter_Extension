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
            position: relative;
            background: rgba(0, 153, 255, 0.1);
            border: 1px solid rgba(0, 153, 255, 0.5);
            border-left: 4px solid #0099ff;
            color: #0099ff;
            font-family: 'Share Tech Mono', monospace;
            font-size: 13px;
            cursor: pointer;
            border-radius: 0;
            font-weight: bold;
            height: 26px;
            padding: 0 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 10px rgba(0, 153, 255, 0.15), inset 0 0 8px rgba(0, 153, 255, 0.1);
            transition: all 0.2s ease;
            margin: 0 0 0 6px;
            line-height: normal;
            box-sizing: border-box;
            top: -3px;
            text-decoration: none;
            animation: periodic-badge-glitch 3s infinite;
        }
        
        .system-online-badge:hover {
            background: rgba(0, 153, 255, 0.15);
            border-color: #0099ff;
            box-shadow: 0 0 15px rgba(0, 153, 255, 0.25), inset 0 0 12px rgba(0, 153, 255, 0.2);
            transform: translateY(-1px);
            animation: none; /* stop glitch on hover */
        }
        
        .system-online-badge > span {
            position: relative;
            z-index: 2;
            letter-spacing: 2px;
            text-shadow: 0 0 4px rgba(0, 153, 255, 0.4);
            margin-bottom: -1px; /* Visual centering for this font */
            animation: periodic-text-glitch 3s infinite;
        }

        .system-online-badge:hover > span {
            animation: none;
        }

        @keyframes periodic-badge-glitch {
            0%, 93%, 100% { transform: translate(0); }
            94% { transform: translate(-2px, 1px) skewX(2deg); }
            96% { transform: translate(2px, -1px) skewX(-2deg); }
            98% { transform: translate(-1px, 0) skewX(1deg); }
        }

        @keyframes periodic-text-glitch {
            0%, 93%, 100% { filter: none; }
            94% { filter: drop-shadow(3px 0 rgba(255, 0, 60, 0.8)) drop-shadow(-3px 0 rgba(0, 255, 255, 0.8)); }
            96% { filter: drop-shadow(-3px 0 rgba(255, 0, 60, 0.8)) drop-shadow(3px 0 rgba(0, 255, 255, 0.8)); }
            98% { filter: drop-shadow(2px 0 rgba(255, 0, 60, 0.6)) drop-shadow(-2px 0 rgba(0, 255, 255, 0.6)); }
        }

        .drag-handle {
            position: absolute;
            top: 0; left: 0; right: 0; height: 30px;
            cursor: grab;
            z-index: 100;
        }
        .glitch-active {
            animation: chromatic-glitch 0.2s linear infinite;
        }
        @keyframes chromatic-glitch {
            0% {
                transform: translate(0);
                filter: drop-shadow(2.5px 0 #ff6666) drop-shadow(-2.5px 0 #00ffff);
            }
            20% {
                transform: translate(-2.5px, 1.25px) skewX(2.5deg);
                filter: drop-shadow(-3.75px 0 #ff6666) drop-shadow(3.75px 0 #00ffff);
            }
            40% {
                transform: translate(2.5px, -1.25px) skewX(-2.5deg);
                filter: drop-shadow(3.75px 0 #ff6666) drop-shadow(-3.75px 0 #00ffff);
            }
            60% {
                transform: translate(-1.25px, 2.5px) skewX(1.25deg);
                filter: drop-shadow(-2.5px 0 #ff6666) drop-shadow(2.5px 0 #00ffff);
            }
            80% {
                transform: translate(1.25px, -2.5px) skewX(-1.25deg);
                filter: drop-shadow(2.5px 0 #ff6666) drop-shadow(-2.5px 0 #00ffff);
            }
            100% {
                transform: translate(0);
                filter: none;
            }
        }
    `;
    // We need to inject styles into document head so the nav bar badge gets them
    const globalStyleTag = document.createElement('style');
    globalStyleTag.textContent = styleTag.textContent;
    document.head.appendChild(globalStyleTag);

    shadow.appendChild(styleTag);

    // Create the separate Online Badge
    const onlineBadge = document.createElement('a');
    onlineBadge.className = 'system-online-badge';
    const badgeText = document.createElement('span');
    badgeText.textContent = 'SYSTEM';
    onlineBadge.appendChild(badgeText);

    // Inject into CF Nav Bar
    const navBar = document.querySelector('.menu-list.main-menu-list');
    if (navBar) {
        const li = document.createElement('li');
        // Let Codeforces style this as a normal nav item so it flows naturally
        // Center the badge vertically (CF nav is ~40px tall, badge is 26px)
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
        // Default positioning centered
        const defaultWidth = 380;
        const defaultHeight = 600;
        container.style.top = Math.max(0, (window.innerHeight - defaultHeight) / 2) + 'px';
        container.style.left = Math.max(0, (window.innerWidth - defaultWidth) / 2) + 'px';
        container.style.bottom = 'auto';
        container.style.right = 'auto';
    }

    // Apply collapsed state
    if (savedState.collapsed) {
        container.style.display = 'none';
    }

    shadow.appendChild(container);

    // Make draggable via the overlay handle
    makeDraggable(container, dragHandle, savedState, content);

    return { shadow, container, content };
}

function triggerTempGlitch(contentElement) {
    if (!contentElement) return;
    contentElement.classList.add('glitch-active');
    setTimeout(() => {
        contentElement.classList.remove('glitch-active');
    }, 200);
}

function makeDraggable(element, handle, stateObj, contentElement) {
    let isDragging = false;
    let hasGlitchedOnMove = false;
    let startX = 0, startY = 0, initialX = 0, initialY = 0;

    handle.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('hunter-hud-toggle')) return;
        isDragging = true;
        hasGlitchedOnMove = false;
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
        if (!hasGlitchedOnMove) {
            hasGlitchedOnMove = true;
            triggerTempGlitch(contentElement);
        }
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
            if (hasGlitchedOnMove) {
                triggerTempGlitch(contentElement);
            }
        }
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}
