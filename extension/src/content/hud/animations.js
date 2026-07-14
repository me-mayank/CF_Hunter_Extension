/**
 * Animates a number counting up from `from` to `to` over `duration` milliseconds.
 * Returns a cancel function.
 */
export function countUp(el, from, to, duration = 800) {
    let startTimestamp = null;
    let frameId;
    let cancelled = false;
    
    // Parse values to ensure they are numbers
    const startVal = parseInt(from) || 0;
    const endVal = parseInt(to) || 0;

    const step = (timestamp) => {
        if (cancelled) return;
        if (!startTimestamp) startTimestamp = timestamp;
        
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const currentVal = Math.floor(startVal + (endVal - startVal) * easeProgress);
        
        el.textContent = currentVal.toLocaleString('en-US');
        
        if (progress < 1) {
            frameId = window.requestAnimationFrame(step);
        } else {
            el.textContent = endVal.toLocaleString('en-US');
        }
    };
    
    frameId = window.requestAnimationFrame(step);
    
    return () => {
        cancelled = true;
        window.cancelAnimationFrame(frameId);
    };
}

import { playTick } from './audio.js';

/**
 * Types text out character by character at `speed` ms per char.
 * Returns a cancel function.
 */
export function typeText(el, text, speed = 20) {
    let index = 0;
    let timeoutId;
    let cancelled = false;
    
    el.textContent = '';
    
    const typeChar = () => {
        if (cancelled) return;
        
        if (index < text.length) {
            el.textContent += text.charAt(index);
            // Throttle tick to every 2nd character to avoid overwhelming audio
            if (index % 2 === 0) playTick();
            
            index++;
            timeoutId = setTimeout(typeChar, speed);
        }
    };
    
    typeChar();
    
    return () => {
        cancelled = true;
        clearTimeout(timeoutId);
    };
}
