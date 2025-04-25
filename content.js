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