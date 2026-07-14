(async () => {
    try {
        const src = chrome.runtime.getURL("src/content/main.js");
        const src2 = chrome.runtime.getURL("src/content/test.js"); await import(src2); const module = await import(src);
        module.main();
    } catch (e) {
        console.error("Hunter System failed to load:", e);
    }
})();
