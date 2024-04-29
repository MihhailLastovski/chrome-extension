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

    try {
        const dataUrl = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: 'captureScreenshot' }, (dataUrl) => {
                if (dataUrl) {
                    resolve(dataUrl);
                } else {
                    reject(new Error('Failed to capture screenshot'));
                }
            });
        });

        const result = await getFromLocalStorage('wordLists');
        const wordLists = result.wordLists || [];

        let savedScreenshot = false;

        for (const wordList of wordLists) {
            if (wordList.dataURL && wordList.id === listId) {
                for (const wordObj of wordList.words) {
                    if (element.innerHTML.toLowerCase() === wordObj.word.toLowerCase()) {
                        saveScreenshot(dataUrl, wordObj.lecID);
                        savedScreenshot = true;
                    }
                }
            }
        }

        if (!savedScreenshot) {
            saveScreenshot(dataUrl, false);
        }

        copyToClipboard(dataUrl);
    } catch (error) {
        console.error('Error capturing screenshot:', error);
    } finally {
        removeFromList(element)
        restoreHighlight(element);
        document.addEventListener('mouseover', showSubmenus);
    }
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
        const updatedWordLists = wordLists.map((wordList) => {
            if (wordList.words && wordList.id === listId) {
                wordList.words = wordList.words.filter((wordObj) => {
                    if(wordObj.word.toLowerCase() === element.innerHTML.toLowerCase()){
                        sendScreenshotToGoogleSheet(wordList.dataURL, wordObj.lecID)
                    }
                    return (
                        wordObj.word.trim().toLowerCase() !==
                        textContentToRemove.toLowerCase()
                    );
                });
            }
            return wordList;
        });

        chrome.storage.local.set({ wordLists: updatedWordLists });
    });
}

function sendScreenshotToGoogleSheet(dataURL, lecID) {
    const sheetId = extractSheetIdFromURL(dataURL);
    var data = {
            action: 'addNoteToElement',
            note: '',
            textContent: `${lecID}`,
            sheetId: sheetId,
            columnName: 'Screenshot',
        };

    console.log('Sending data:', data);

    fetch(
        'https://script.google.com/macros/s/AKfycbyC9pSdWFHNpugKW6ckVpBa0VGdyC4Y_wXw3t94guk04ICPBNRJyN4ADHxgWh6Qw9In/exec',
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

async function restoreHighlight(element) {
    const storageData = await getFromLocalStorage('wordLists');
    document.querySelectorAll('.exa-radience-highlighted').forEach((el) => {
        const listId = el.getAttribute('data-list-id');
        const wordLists = storageData.wordLists || [];

        const targetList = wordLists.find(list => list.id === listId);
        if (el.style.borderColor === 'transparent') {
            el.style.borderColor = targetList.color;
        }

        if (el === element) {
            const { textContent } = element;
            element.outerHTML = textContent;
        }
    });
}
