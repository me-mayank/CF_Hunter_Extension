// options.js
const toggle = document.getElementById('soundToggle');
const status = document.getElementById('status');

// Load setting
chrome.storage.local.get(['soundEnabled'], (result) => {
    toggle.checked = !!result.soundEnabled;
});

// Save setting
toggle.addEventListener('change', () => {
    chrome.storage.local.set({ soundEnabled: toggle.checked }, () => {
        status.textContent = 'Settings saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
});
