function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureScreenshot(element) {
    document.querySelectorAll('.exa-radience-highlighted').forEach((el) => {
        if (el !== element) {
            el.style.borderColor = 'transparent';
            el.style.backgroundColor = 'transparent';
        }
    });

    const listId = element.getAttribute('data-list-id');
    submenuContainer.style.display = 'none';
    await sleep(1000);

    new Promise((resolve) => {
        chrome.runtime.sendMessage(
            { action: 'captureScreenshot' },
            (dataUrl) => {
                if (dataUrl) {
                    chrome.storage.local.get('wordLists', (result) => {
                        const wordLists = result.wordLists || [];
                        var wordLecID;
                        wordLists.map((wordList) => {
                            if(wordList.dataURL){
                                if (wordList.words && wordList.id === listId) {
                                    wordList.words = wordList.words.filter((wordObj) => {
                                        wordLecID = wordObj.lecID
                                        return (
                                            wordObj.word.trim().toLowerCase() !==
                                            element.textContent.trim()
                                        );
                                    });
                                }
                                saveScreenshot(dataUrl, wordLecID);
                            }
                            else{
                                saveScreenshot(dataUrl, false);
                            }
                        });
                    });
                    copyToClipboard(dataUrl);
                    resolve();
                }
            }
        );
    }).then(() => {
        if (listId) {
            removeFromList(element);
        }
        restoreHighlight(element);
        document.addEventListener('mouseover', showSubmenus);
    });
}

function saveScreenshot(dataUrl, lecID) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(
            { action: 'downloadScreenshot', dataUrl: dataUrl, lecID: lecID },
            function (response) {
                resolve();
            }
        );
    });
}

function copyToClipboard(dataUrl) {
    const img = new Image();
    img.src = dataUrl;
    img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);

        canvas.toBlob((blob) => {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(
                () => console.log('Screenshot copied to clipboard!'),
                (err) => console.error('Unable to copy to clipboard.', err)
            );
        });
    };
}

function removeFromList(element) {
    const listId = element.getAttribute('data-list-id');
    chrome.storage.local.get('wordLists', (result) => {
        const wordLists = result.wordLists || [];

        const textContentToRemove = element.textContent.trim();
        var wordStringID;
        const updatedWordLists = wordLists.map((wordList) => {
            if (wordList.words && wordList.id === listId) {
                wordList.words = wordList.words.filter((wordObj) => {
                    wordStringID = wordObj.stringID
                    return (
                        wordObj.word.trim().toLowerCase() !==
                        textContentToRemove.toLowerCase()
                    );
                });
                sendScreenshotToGoogleSheet(wordList.dataURL, wordStringID)
            }
            return wordList;
        });

        chrome.storage.local.set({ wordLists: updatedWordLists });
    });
}

function sendScreenshotToGoogleSheet(dataURL, stringID) {
    const sheetId = extractSheetIdFromURL(dataURL);
    var data = {
            action: 'addNoteToElement',
            note: '',
            textContent: stringID,
            sheetId: sheetId,
            choice: 'screenshot',
        };

    console.log('Sending data:', data);

    fetch(
        'https://script.google.com/macros/s/AKfycbwYb2OHQIdKXMIrd8OjyI4YqOjmQPKTinAHNgaFav_ZyLWIEpMGv35tywv6afYrpC49/exec',
        {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }
    )
        .then((response) => response.text())
        .then((result) => {
            console.log('Response from server:', result);
        })
        .catch((error) => console.error('Error sending note:', error));
}

function restoreHighlight(element) {
    document.querySelectorAll('.exa-radience-highlighted').forEach((el) => {
        if (el.style.borderColor === 'transparent') {
            el.style.borderColor = `${highlightColorRestore}`;
        }

        if (el === element) {
            const { textContent } = element;
            element.outerHTML = textContent;
        }
    });
}
