chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get('firstOpen', function (data) {
        if (!data.firstOpen) {
            chrome.storage.local.set({ theme: 'light' });
            chrome.storage.local.set({ firstOpen: true });
            const existingAttributes = ['id', 'class', 'type'];
            chrome.storage.local.set({
                customAttributes: existingAttributes,
            });
            chrome.storage.local.set({
                submenuIsActive: true,
            });
        }
    });
    // chrome.alarms.create('updateDataAlarm', { periodInMinutes: 15 });
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
    } else if (request.action === 'syncData') {
        // updateWordListsFromGoogleSheets();
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

function updateWordListsFromGoogleSheets() {
    chrome.storage.local.get('wordLists', function (data) {
        if (chrome.runtime.lastError) {
            console.error(
                'Error fetching wordLists from storage:',
                chrome.runtime.lastError
            );
            return;
        }

        if (!data.wordLists || !Array.isArray(data.wordLists)) {
            console.error('Invalid wordLists data:', data.wordLists);
            return;
        }
        // Обходим каждый список
        data.wordLists.forEach(function (list) {
            var spreadsheetId = extractSpreadsheetId(list.dataURL);
            if (!spreadsheetId) {
                console.error(
                    'Failed to extract spreadsheetId from dataURL:',
                    list.dataURL
                );
                return;
            }

            // Формируем запрос к Google Apps Script для получения данных по текущему списку
            var data = {
                action: 'getDataBySheetName',
                sheetId: spreadsheetId,
            };

            fetch(
                'https://script.google.com/macros/s/AKfycbya6kRaa-zbZisTLG6RADGq9RDlBzh-0-9xYbYxQwBgoMOTKuVMrPUi3SCh_OLCTqxM/exec',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            )
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! Status: ${response.status}`
                        );
                    }
                    return response.json();
                })
                .then((result) => {
                    // Проверяем, является ли результат массивом объектов
                    // Очищаем текущий список слов
                    list.words = [];
                    // Обходим полученные данные и добавляем слова в список
                    result.forEach((row) => {
                        list.words.push({
                            stringID: row['String ID'],
                            word: row['Core Strings'],
                            status: row['Status'],
                            enabled: true,
                        });
                    });
                    // Сохраняем список
                    chrome.storage.local.get('wordLists', function (data) {
                        if (chrome.runtime.lastError) {
                            console.error(
                                'Error fetching wordLists from storage:',
                                chrome.runtime.lastError
                            );
                            return;
                        }

                        data.wordLists.forEach((storedList, index) => {
                            if (storedList.id === list.id) {
                                data.wordLists[index] = list;
                            }
                        });

                        chrome.storage.local.set(
                            { wordLists: data.wordLists },
                            function () {
                                if (chrome.runtime.lastError) {
                                    console.error(
                                        'Error saving wordLists to storage:',
                                        chrome.runtime.lastError
                                    );
                                }
                            }
                        );
                    });
                })
                .catch((error) => {
                    console.error(
                        'Error fetching data from Google Sheets:',
                        error
                    );
                });
        });
    });
}

function extractSpreadsheetId(link) {
    var regex = /\/d\/([a-zA-Z0-9-_]+)/;
    var match = link.match(regex);
    return match ? match[1] : null;
}

// Запускаем обновление списков слов из Google таблицы каждые 15 минут
chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === 'updateDataAlarm') {
        updateWordListsFromGoogleSheets();
    }
});
