function getOrigin(url) {
    try {
        const u = new URL(url);
        return u.origin;
    } catch {
        return null;
    }
}

let currentTab = null;
let currentOrigin = null;

function setSliderAndToggle(tab, origin) {
    const range = document.getElementById('opacityRange');
    const valueLabel = document.getElementById('value');
    const persistToggle = document.getElementById('persistToggle');
    const saveBtn = document.getElementById('saveBtn');
    
    chrome.storage.local.get([`persist_${origin}`, `opacity_${origin}`], function(data) {
        console.log('[DEBUG] Storage get:', data);
        const persist = data[`persist_${origin}`];
        const savedOpacity = data[`opacity_${origin}`];
        persistToggle.checked = !!persist;
        saveBtn.disabled = !persist;
        if (persist && savedOpacity !== undefined) {
            console.log('[DEBUG] Using saved opacity:', savedOpacity);
            range.value = Math.round(savedOpacity * 100);
            valueLabel.textContent = Math.round(savedOpacity * 100);
            chrome.tabs.sendMessage(tab.id, { type: 'SET_OPACITY', opacity: savedOpacity });
        } else {
            chrome.tabs.sendMessage(tab.id, { type: 'GET_OPACITY' }, function(response) {
                let opacity = 1;
                if (response && typeof response.opacity === 'number' && !isNaN(response.opacity)) {
                    opacity = response.opacity;
                }
                console.log('[DEBUG] Using content script opacity:', opacity);
                range.value = Math.round(opacity * 100);
                valueLabel.textContent = Math.round(opacity * 100);
            });
        }
    });
}

function showFeedback(msg) {
    const feedback = document.getElementById('feedback');
    if (!feedback) {
        console.error('[DEBUG] Feedback div not found!');
        return;
    }
    feedback.textContent = msg;
    feedback.classList.add('visible');
    setTimeout(() => {
        feedback.classList.remove('visible');
    }, 1200);
    console.log('[DEBUG] Feedback shown:', msg);
}

document.addEventListener('DOMContentLoaded', function() {
    const heading = document.querySelector('h1');
    heading.textContent = 'Opacity Controller';

    const paragraph = document.querySelector('p');
    if (paragraph) paragraph.textContent = 'Adjust the opacity of the current website.';

    const range = document.getElementById('opacityRange');
    const valueLabel = document.getElementById('value');
    const persistToggle = document.getElementById('persistToggle');
    const saveBtn = document.getElementById('saveBtn');
    const feedback = document.getElementById('feedback');

    if (!range || !valueLabel || !persistToggle || !saveBtn) {
        console.error('[DEBUG] Missing popup elements:', { range, valueLabel, persistToggle, saveBtn });
    }
    if (!feedback) {
        console.error('[DEBUG] Feedback div missing in DOM');
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        currentTab = tabs[0];
        currentOrigin = getOrigin(currentTab.url);
        console.log('[DEBUG] Current tab:', currentTab);
        console.log('[DEBUG] Current origin:', currentOrigin);
        setSliderAndToggle(currentTab, currentOrigin);
    });

    range.addEventListener('input', function() {
        valueLabel.textContent = range.value;
    });

    range.addEventListener('change', function() {
        if (!currentTab || !currentOrigin) return;
        const opacity = parseInt(range.value, 10) / 100;
        chrome.tabs.sendMessage(currentTab.id, { type: 'SET_OPACITY', opacity });
    });

    saveBtn.addEventListener('click', function() {
        if (!currentTab || !currentOrigin) return;
        if (!persistToggle.checked) return;
        const opacity = parseInt(range.value, 10) / 100;
        const save = {};
        save[`opacity_${currentOrigin}`] = opacity;
        chrome.storage.local.set(save, function() {
            console.log('[DEBUG] Saved opacity:', opacity, 'for', currentOrigin);
            showFeedback('Saved!');
            setSliderAndToggle(currentTab, currentOrigin);
        });
    });

    persistToggle.addEventListener('change', function() {
        if (!currentTab || !currentOrigin) return;
        const persist = persistToggle.checked;
        saveBtn.disabled = !persist;
        const save = {};
        save[`persist_${currentOrigin}`] = persist;
        chrome.storage.local.set(save);
        if (!persist) {
            chrome.storage.local.remove(`opacity_${currentOrigin}`);
            console.log('[DEBUG] Persistence OFF, removed saved opacity');
        } else {
            const opacity = parseInt(range.value, 10) / 100;
            const saveOpacity = {};
            saveOpacity[`opacity_${currentOrigin}`] = opacity;
            chrome.storage.local.set(saveOpacity, function() {
                console.log('[DEBUG] Persistence ON, saved opacity:', opacity);
            });
        }
    });
});