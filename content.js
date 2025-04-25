// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'SET_OPACITY') {
        document.body.style.opacity = request.opacity;
        sendResponse();
    }
    if (request.type === 'GET_OPACITY') {
        let opacity = 1;
        if (document.body.style.opacity) {
            opacity = parseFloat(document.body.style.opacity);
        }
        sendResponse({ opacity });
    }
    // Return true to indicate async response if needed
    return true;
});

function getOrigin(url) {
    try {
        const u = new URL(url);
        return u.origin;
    } catch {
        return null;
    }
}

// On content script load, check for persisted opacity preference
(function() {
    const origin = getOrigin(window.location.href);
    if (!origin) return;
    chrome.storage.local.get([`persist_${origin}`, `opacity_${origin}`], function(data) {
        if (data[`persist_${origin}`] && data[`opacity_${origin}`] !== undefined) {
            document.body.style.opacity = data[`opacity_${origin}`];
        }
    });
})();