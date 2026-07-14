import { getHunter, getStatus, refreshHunter, compareHunters, healthz } from '../api/hunterApiClient.js';

console.log("Hunter System: Service Worker loaded.");

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "scan_hunter",
        title: "Scan Target (Hunter System)",
        contexts: ["selection", "link"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "scan_hunter") {
        const target = info.selectionText || info.linkUrl;
        if (target) {
            chrome.tabs.sendMessage(tab.id, { type: 'UNIVERSAL_SCAN', target });
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_HUNTER') {
        getHunter(request.handle).then(sendResponse);
        return true; // Indicates async response
    }
    
    if (request.type === 'GET_STATUS') {
        getStatus(request.handle).then(sendResponse);
        return true;
    }

    if (request.type === 'REFRESH_HUNTER') {
        refreshHunter(request.handle).then(sendResponse);
        return true;
    }

    if (request.type === 'COMPARE_HUNTERS') {
        compareHunters(request.handleA, request.handleB).then(sendResponse);
        return true;
    }

    if (request.type === 'HEALTHZ') {
        healthz().then(sendResponse);
        return true;
    }
});

chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle_system') {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if(tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_HUD' });
            }
        });
    }
});
