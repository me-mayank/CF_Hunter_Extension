export function scrapeProfile() {
    // The handle is usually in the URL for the profile page or in the main title
    const urlMatches = location.pathname.match(/\/profile\/([^/?]+)/);
    let handle = null;
    
    if (urlMatches && urlMatches[1]) {
        handle = urlMatches[1];
    } else {
        const handleEl = document.querySelector('.info .main-info h1 a');
        if (handleEl) {
            handle = handleEl.textContent.trim();
        }
    }
    return { handle };
}

export function scrapeLoggedInHandle() {
    // Try multiple possible header link containers that CF might use
    const headerLinks = document.querySelectorAll('.lang-chooser a, #header a, .header-bell + a');
    for (const link of headerLinks) {
        if (link.href && link.href.includes('/profile/') && !link.href.includes('settings')) {
            const text = link.textContent.trim();
            if (text && text.toLowerCase() !== 'logout' && text.toLowerCase() !== 'login' && text.toLowerCase() !== 'register' && text.toLowerCase() !== 'profile') {
                return text;
            }
        }
    }
    return null;
}
