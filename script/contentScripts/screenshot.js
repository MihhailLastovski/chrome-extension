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
                    saveScreenshot(dataUrl);
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

function saveScreenshot(dataUrl) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(
            { action: 'downloadScreenshot', dataUrl: dataUrl },
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
