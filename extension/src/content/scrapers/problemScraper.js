export function scrapeProblem() {
    const tags = Array.from(document.querySelectorAll('.tag-box')).map(el => el.textContent.trim());
    
    // Look for difficulty (rating) tag which often has an asterisk like *1500
    let rating = null;
    const ratingEl = document.querySelector('span[title="Difficulty"]');
    if (ratingEl) {
        const ratingMatch = ratingEl.textContent.match(/\*(\d+)/);
        if (ratingMatch && ratingMatch[1]) {
            rating = parseInt(ratingMatch[1], 10);
        } else {
            rating = parseInt(ratingEl.textContent.trim(), 10);
        }
    }

    let id = "Unknown";
    let name = "Unknown Entity";

    const titleEl = document.querySelector('.problem-statement .header .title');
    if (titleEl) {
        // usually format is "F. Problem Title"
        const fullTitle = titleEl.textContent.trim();
        const match = fullTitle.match(/^([A-Z0-9]+)\.\s*(.*)$/i);
        if (match) {
            id = match[1];
            name = match[2];
        } else {
            name = fullTitle;
        }
    }
    
    // Attempt to extract full ID from URL e.g. /contest/1829/problem/F -> 1829F
    const urlMatches = window.location.href.match(/contest\/(\d+)\/problem\/([A-Z0-9]+)/i);
    if (urlMatches) {
        id = urlMatches[1] + urlMatches[2];
    } else {
        const pMatches = window.location.href.match(/problemset\/problem\/(\d+)\/([A-Z0-9]+)/i);
        if (pMatches) {
            id = pMatches[1] + pMatches[2];
        }
    }

    return { rating, tags, id, name };
}
