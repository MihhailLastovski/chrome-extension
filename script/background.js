chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get('firstOpen', function (data) {
        if (!data.firstOpen) {
            chrome.storage.local.set({ theme: 'light' });
            chrome.storage.local.set({ firstOpen: true });
            const existingAttributes = ['id', 'class', 'type'];
            chrome.storage.local.set({
                customAttributes: existingAttributes,
            });
        }
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        // Подсвечивание списков при обновлении страницы
        chrome.storage.local.get('enabledLists', function (data) {
            let enabledLists = data.enabledLists || [];
            enabledLists.forEach((listId) => {
                highlightWordsFromList(listId);
            });
        });
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

            chrome.storage.local.get('screenshotName', function (data) {
                const screenshotName = data.screenshotName || 'screenshot';
                chrome.downloads.download({
                    url: dataUrl,
                    filename: `screenshots/${screenshotName}.png`,
                    saveAs: !saveAs,
                });
            });
        });
        return true;
    } else if (request.action === 'updateBadge') {
        const count = request.count || 0;
        const searchModeColor = request.color || '#FC0365';
        chrome.action.setBadgeText({
            text: count > 0 ? count.toString() : '',
        });
        chrome.action.setBadgeBackgroundColor({ color: searchModeColor });
    } else if (request.action === 'updateLists') {
        const listId = request.listId || 0;
        highlightWordsFromList(listId);
    }
});

chrome.storage.local.get('submenuIsActive', function (data) {
    chrome.storage.local.set({ submenuIsActive: data.submenuIsActive });
});

function highlightWordsFromList(listId) {
    chrome.storage.local.get('wordLists', function (data) {
        const lists = data.wordLists || [];
        const listToHighlight = lists.find((list) => list.id === listId);

        if (listToHighlight) {
            const sortedWords = listToHighlight.words.sort((a, b) => {
                return b.word.length - a.word.length;
            });

            sortedWords.forEach((wordObj) => {
                if (wordObj.enabled) {
                    const searchText = wordObj.word;
                    chrome.tabs.query(
                        { active: true, currentWindow: true },
                        function (tabs) {
                            if (tabs && tabs[0]) {
                                chrome.scripting.executeScript({
                                    target: { tabId: tabs[0].id },
                                    files: [
                                        './script/contentScripts/contentScript.js',
                                    ],
                                });
                                chrome.tabs.sendMessage(tabs[0].id, {
                                    action: 'highlight',
                                    searchText: searchText,
                                    highlightColor: listToHighlight.color,
                                    listId: listId,
                                });
                            }
                        }
                    );
                }
            });
        }
    });
}
