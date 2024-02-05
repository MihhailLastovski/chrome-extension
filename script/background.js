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
    if (request.action === 'sendNoteToGoogleSheets') {
        sendNoteToGoogleSheets(request.note);
    } 
    if (request.action === "auth"){
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            // Use the token.
            console.log(token); 
                });
    }
    if (request.action === 'requestScreenshot') {
        chrome.tabs.captureVisibleTab(
            null,
            { format: 'png' },
            function (dataUrl) {
                saveScreenshot(dataUrl);
            }
        );
    } else if (request.action === 'captureScreenshot') {
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

        chrome.downloads.download(
            {
                url: dataUrl,
                filename: 'screenshot.png',
                saveAs: true, // false
            },
            function (downloadId) {
                console.log('Download initiated with ID:', downloadId);
            }
        );

        return true;
    }
});

function saveScreenshot(dataUrl) {
    // Сохранение в Downloads
    chrome.storage.local.get('saveAs', function (data) {
        const saveAs = true; //data.saveAs || false;
        const filename = 'screenshot.png';

        chrome.downloads.download({
            url: dataUrl,
            filename: filename,
            saveAs: saveAs,
        });
    });
}

function sendNoteToGoogleSheets(note) {
    fetch('https://script.google.com/macros/s/AKfycbyb9Lo2orVJ9UrILwN0BKgHhOQ1pBI1WDWWAZYCXSETR7hpR8OByQGN9Wh6GyuX5LS4/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'addNoteToElement', note: note }),
    })
    .then((response) => response.text())
    .then((result) => {
        console.log(result);
        // Добавить вызов функции doAddNoteToElement
        chrome.runtime.sendMessage({ action: 'doAddNoteToElement', note: note });
    })
    .catch((error) => console.error('Ошибка при отправке заметки в Google Sheets:', error));
}

//Добавление высплывающего окна
// chrome.contextMenus.onClicked.addListener(function (info, event) {
//   if (info.menuItemId === "myContextMenu") {
//     console.log("Context menu in clicked")
//   }
// });
