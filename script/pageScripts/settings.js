document.addEventListener('DOMContentLoaded', function () {
    const saveAsCheckbox = document.getElementById('saveAsCheckbox');
    const submenuCheckbox = document.getElementById('submenuCheckbox');
    const attributesCheckbox = document.getElementById('attributesCheckbox');

    const wordDiv = document.getElementById('content');
    const wordLabel = document.getElementById('wordLabel');
    const saveNameBtn = document.getElementById('saveNameBtn');
    const wordInput = document.createElement('textarea');
    wordInput.type = 'text';
    wordInput.className = 'word-input';
    wordInput.style.width = '100px';

    chrome.storage.local.get('saveAs', function (data) {
        saveAsCheckbox.checked = data.saveAs || false;
    });

    chrome.storage.local.get('submenuIsActive', function (data) {
        submenuCheckbox.checked = data.submenuIsActive || false;
    });

    chrome.storage.local.get('screenshotName', function (data) {
        wordLabel.textContent = data.screenshotName || 'screenshot';
    });

    chrome.storage.local.get('attributesIsActive', function (data) {
        attributesCheckbox.checked = data.attributesIsActive || false;
    });

    saveAsCheckbox.addEventListener('change', function () {
        chrome.storage.local.set({ saveAs: saveAsCheckbox.checked });
    });

    submenuCheckbox.addEventListener('change', function () {
        const submenuIsActive = submenuCheckbox.checked;
        chrome.storage.local.set({ submenuIsActive: submenuIsActive });
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'valuesStatusUpdating',
                });
            }
        );
    });

    saveNameBtn.addEventListener('click', function () {
        if (wordDiv.contains(wordLabel)) {
            wordInput.value = wordLabel.textContent;
            wordDiv.replaceChild(wordInput, wordLabel);
        } else {
            wordLabel.textContent = wordInput.value.trim();
            chrome.storage.local.set({ screenshotName: wordLabel.textContent });
            wordDiv.replaceChild(wordLabel, wordInput);
        }
    });

    attributesCheckbox.addEventListener('change', function () {
        chrome.storage.local.set({
            attributesIsActive: attributesCheckbox.checked,
        });
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'valuesStatusUpdating',
                });
            }
        );
    });
});
