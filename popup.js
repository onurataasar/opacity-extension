document.addEventListener('DOMContentLoaded', function() {
    const heading = document.querySelector('h1');
    heading.textContent = 'Opacity Controller';

    const paragraph = document.querySelector('p');
    if (paragraph) paragraph.textContent = 'Adjust the opacity of the current website.';

    const range = document.getElementById('opacityRange');
    const valueLabel = document.getElementById('value');

    // Request current opacity from content script via chrome.tabs.sendMessage
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { type: 'GET_OPACITY' },
            function(response) {
                const opacity = Math.round((response?.opacity ?? 1) * 100);
                range.value = opacity;
                valueLabel.textContent = opacity;
            }
        );
    });

    // Update label on slider change
    range.addEventListener('input', function() {
        valueLabel.textContent = range.value;
    });

    // Send opacity value to content script via chrome.tabs.sendMessage
    range.addEventListener('change', function() {
        const opacity = parseInt(range.value, 10) / 100;
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_OPACITY', opacity });
        });
    });
});