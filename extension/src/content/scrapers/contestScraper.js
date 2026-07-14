export function scrapeContest() {
    let name = "";
    let status = "UNKNOWN";
    let startTimeSeconds = null;

    // Look specifically for the contest sidebar widget
    // Usually it's in the #sidebar area, inside a table.rt where the th contains an <a> with the contest name
    const sidebarTables = document.querySelectorAll('#sidebar .rt');
    let nameEl = null;
    let tableEl = null;

    for (const table of sidebarTables) {
        const thA = table.querySelector('th a');
        if (thA && thA.href.includes('/contest/')) {
            nameEl = thA;
            tableEl = table;
            break;
        }
    }

    // Fallback if not found in #sidebar .rt
    if (!nameEl) {
        nameEl = document.querySelector('#sidebar th a') || document.querySelector('.rt tbody tr th a') || document.querySelector('.contest-name a');
        if (nameEl) {
            tableEl = nameEl.closest('table');
        }
    }

    if (nameEl) {
        name = nameEl.textContent.trim();
        console.log("[Hunter Extension] Scraped contest name:", name);
    } else {
        console.log("[Hunter Extension] Scraped contest name: NOT FOUND");
    }

    // Try to determine status from the same widget if possible
    if (tableEl) {
        const textContent = tableEl.textContent.toLowerCase();
        if (tableEl.querySelector('.countdown') || textContent.includes('before contest')) {
            status = "BEFORE";
        } else if (textContent.includes('finished') || textContent.includes('final standings')) {
            status = "FINISHED";
        } else if (textContent.includes('running') || document.querySelector('.standings')) {
            status = "RUNNING";
        }
    }

    // Global fallbacks
    if (status === "UNKNOWN") {
        if (document.querySelector('.countdown')) {
            status = "BEFORE";
        } else if (document.body.textContent.includes('Final standings')) {
            status = "FINISHED";
        } else if (document.querySelector('.standings')) {
            status = "RUNNING";
        }
    }

    console.log("[Hunter Extension] Scraped contest status:", status);

    return { name, status, startTimeSeconds };
}

