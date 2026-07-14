export function scrapeContest() {
    let name = "";
    let status = "UNKNOWN";
    let startTimeSeconds = null;

    // A common selector for the contest name on a contest page is inside a table or heading
    const nameEl = document.querySelector('.rt tbody tr th a') || document.querySelector('.contest-name a');
    if (nameEl) {
        name = nameEl.textContent.trim();
    }

    // Try to determine status
    const countdownEl = document.querySelector('.countdown');
    if (countdownEl) {
        status = "BEFORE";
        // To get actual start time, we'd need to parse DOM attributes or time strings.
        // As a fallback, we assume it starts soon.
    } else if (document.body.textContent.includes('Final standings')) {
        status = "FINISHED";
    } else if (document.querySelector('.standings')) {
        status = "RUNNING";
    }

    return { name, status, startTimeSeconds };
}
