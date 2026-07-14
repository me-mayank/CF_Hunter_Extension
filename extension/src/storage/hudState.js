const STATE_KEY = 'hunter_system_hud_state';

export function saveHUDState(state) {
    try {
        sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch(e) {}
}

export function loadHUDState() {
    try {
        const stored = sessionStorage.getItem(STATE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch(e) {
        return null;
    }
}
