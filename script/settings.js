document.addEventListener('DOMContentLoaded', function () {
    const saveAsCheckbox = document.getElementById('saveAsCheckbox');
    const submenuCheckbox = document.getElementById('submenuCheckbox');

    chrome.storage.local.get('saveAs', function (data) {
        saveAsCheckbox.checked = data.saveAs || false;
    });

    chrome.storage.local.get('submenuIsActive', function (data) {
        const submenuIsActive = data.submenuIsActive;
        submenuCheckbox.checked = submenuIsActive || false;
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

    // const injectBtn = document.getElementById('injectBtn');

    // injectBtn.addEventListener('click', function () {
    //     chrome.tabs.query(
    //         { active: true, currentWindow: true },
    //         function (tabs) {
    //             chrome.tabs.sendMessage(tabs[0].id, {
    //                 action: 'cssInjection',
    //             });
    //         }
    //     );
    // });
});
