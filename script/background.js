chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get('firstOpen', function (data) {
        if (!data.firstOpen) {
            chrome.storage.local.set({ theme: 'light' });
            chrome.storage.local.set({ firstOpen: true });
        }
    });

    // chrome.contextMenus.create({
    //   id: "myContextMenu",
    //   title: "Take a screenshot",
    //   contexts: ["all"]
    // });
});

//Обновление иконки
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        console.log('Tab is updated');
        chrome.action.setBadgeText({ text: '' });
        chrome.storage.local.set({ count: 0 });
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
                filename: 'screenshot.png',
                saveAs: saveAs,
            });
        });
        return true;
    }
});

chrome.storage.local.get('submenuIsActive', function (data) {
    chrome.storage.local.set({ submenuIsActive: data.submenuIsActive });
});

//Добавление высплывающего окна
// chrome.contextMenus.onClicked.addListener(function (info, event) {
//   if (info.menuItemId === "myContextMenu") {
//     console.log("Context menu in clicked")
//   }
// });
