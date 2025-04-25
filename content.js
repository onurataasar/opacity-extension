// Listen for messages from the extension popup
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SET_OPACITY') {
        document.body.style.opacity = event.data.opacity;
    }
});