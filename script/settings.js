document.addEventListener('DOMContentLoaded', function () {
    const saveAsCheckbox = document.getElementById('saveAsCheckbox');
    const submenuCheckbox = document.getElementById('submenuCheckbox');

    const wordDiv = document.getElementById('content');
    const wordLabel = document.getElementById('wordLabel');
    const saveNameBtn = document.getElementById('saveNameBtn');

    chrome.storage.local.get('saveAs', function (data) {
        saveAsCheckbox.checked = data.saveAs || false;
    });

    chrome.storage.local.get('submenuIsActive', function (data) {
        const submenuIsActive = data.submenuIsActive;
        submenuCheckbox.checked = submenuIsActive || false;
    });

    chrome.storage.local.get('screenshotName', function (data) {
        const name = data.screenshotName || 'screenshot';
        wordLabel.textContent = name;
    });

    saveAsCheckbox.addEventListener('change', function () {
        const saveAs = saveAsCheckbox.checked;
        chrome.storage.local.set({ saveAs: saveAs });
    });

    submenuCheckbox.addEventListener('change', function () {
        const submenuIsActive = submenuCheckbox.checked;
        chrome.storage.local.set({ submenuIsActive: submenuIsActive });
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'submenuStatusUpdating',
                    submenuIsActive: submenuIsActive,
                });
            }
        );
    });

    saveNameBtn.addEventListener('click', function () {
        const wordInput = document.createElement('textarea');
        wordInput.type = 'text';
        wordInput.value = wordLabel.textContent;
        wordInput.className = 'word-input';

        if (wordDiv.contains(wordInput)) {
            wordLabel.textContent = wordInput.value.trim();
            wordDiv.replaceChild(wordLabel, wordInput);
            chrome.storage.local.set({ screenshotName: wordLabel.textContent });
        } else {
            wordDiv.replaceChild(wordInput, wordLabel);
        }
    });
});
