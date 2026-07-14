/**
 * Idle Glitch Effect
 * Triggers a short chromatic aberration effect on the SYSTEM HUD content
 * after 6 seconds of continuous inactivity.
 */

let idleTimer = null;
const IDLE_TIMEOUT_MS = 5000;
let isGlitching = false;
let hudContentElement = null;

function triggerGlitch() {
    if (!hudContentElement || isGlitching) return;
    
    isGlitching = true;
    hudContentElement.classList.add('glitch-active');
    
    // Remove the glitch effect after 200ms
    setTimeout(() => {
        if (hudContentElement) {
            hudContentElement.classList.remove('glitch-active');
        }
        isGlitching = false;
    }, 200);
}

function resetIdleTimer() {
    if (idleTimer) {
        clearInterval(idleTimer);
    }
    // We use setInterval so that the glitch fires repeatedly every 6s of inactivity
    idleTimer = setInterval(triggerGlitch, IDLE_TIMEOUT_MS);
}

export function initIdleGlitch(contentElement) {
    hudContentElement = contentElement;
    
    // Listen for activity events to reset the timer
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
        resetIdleTimer();
    };
    
    activityEvents.forEach(evt => {
        window.addEventListener(evt, handleActivity, { passive: true });
    });
    
    // Start the timer
    resetIdleTimer();
    
    // Return a cleanup function
    return () => {
        if (idleTimer) clearInterval(idleTimer);
        activityEvents.forEach(evt => {
            window.removeEventListener(evt, handleActivity);
        });
        if (hudContentElement) {
            hudContentElement.classList.remove('glitch-active');
        }
        hudContentElement = null;
    };
}
