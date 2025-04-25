document.addEventListener('DOMContentLoaded', function() {
    const heading = document.querySelector('h1');
    heading.textContent = 'Opacity Controller';

    const paragraph = document.querySelector('p');
    paragraph.textContent = 'Adjust the opacity of the current website.';

    const range = document.getElementById('opacityRange');
    const valueLabel = document.getElementById('value');

    // Update label on slider change
    range.addEventListener('input', function() {
        valueLabel.textContent = range.value;
    });

    // Send opacity value to content script
    range.addEventListener('change', function() {
        const opacity = parseInt(range.value, 10) / 100;
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: (opacity) => {
                    window.postMessage({ type: 'SET_OPACITY', opacity }, '*');
                },
                args: [opacity]
            });
        });
    });
}) 