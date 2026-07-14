document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a.sys-btn');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.getAttribute('href');
            if (url) {
                chrome.tabs.create({ url: url });
            }
        });
    });
});
