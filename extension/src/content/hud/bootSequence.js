import { playChime } from './audio.js';

let hasBooted = false;

export function runBootSequence(container, contentEl, onComplete) {
    if (hasBooted) {
        onComplete();
        return;
    }
    hasBooted = true;

    // We no longer do the text terminal boot.
    // The Solo Leveling SYSTEM constructs the frame, fades the glass, and staggers the UI elements via CSS.
    playChime();
    onComplete();
}
