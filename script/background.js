chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get('firstOpen', function (data) {
        if (!data.firstOpen) {
            chrome.storage.local.set({ theme: 'light' });
            chrome.storage.local.set({ firstOpen: true });
        }
    });
});

//Обновление иконки
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        updateBadgeCount(0);
        // function highlight() {
        //     chrome.tabs.query(
        //         { active: true, currentWindow: true },
        //         function (tabs) {
        //             chrome.scripting.executeScript({
        //                 target: { tabId: tabs[0].id },
        //                 files: ['./script/contentScript.js'],
        //             });
        //             chrome.tabs.sendMessage(tabs[0].id, {
        //                 action: 'highlight',
        //                 searchText: 'рыба',
        //                 highlightColor: '#FC0365',
        //             });
        //         }
        //     );
        // }
        highlight();
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'captureScreenshot') {
        chrome.tabs.captureVisibleTab(
            null,
            { format: 'png' },
            function (dataUrl) {
                sendResponse(dataUrl);
            }
        );
        return true;
    } else if (request.action === 'downloadScreenshot') {
        const dataUrl = request.dataUrl;
        chrome.storage.local.get('saveAs', function (data) {
            const saveAs = data.saveAs || false;
            chrome.downloads.download({
                url: dataUrl,
                filename: 'screenshots/screenshot.png',
                saveAs: !saveAs,
            });
        });
        return true;
    } else if (request.action === 'updateBadge') {
        const count = request.count || 0;
        updateBadgeCount(count);
    }
});

chrome.storage.local.get('submenuIsActive', function (data) {
    chrome.storage.local.set({ submenuIsActive: data.submenuIsActive });
});

function updateBadgeCount(count) {
    chrome.action.setBadgeText({
        text: count > 0 ? count.toString() : '',
    });
    chrome.action.setBadgeBackgroundColor({ color: '#FC0365' });
}
function highlight() {
    // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //     chrome.runtime.sendMessage(tabs[0].id, {
    //         action: 'highlight',
    //         searchText: 'рыба',
    //         highlightColor: '#FC0365',
    //     });
    // });
    chrome.runtime.sendMessage({
        action: 'highlight',
        searchText: 'рыба',
        highlightColor: '#FC0365',
    });
}
