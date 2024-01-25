document.addEventListener('DOMContentLoaded', function () {
    const saveAsCheckbox = document.getElementById('saveAsCheckbox');

    chrome.storage.local.get('saveAs', function (data) {
        saveAsCheckbox.checked = data.saveAs || false;
    });

    saveAsCheckbox.addEventListener('change', function () {
        const saveAs = saveAsCheckbox.checked;
        chrome.storage.local.set({ saveAs: saveAs });
    });
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', function () {
        window.location.href = 'popup.html';
    });
});
