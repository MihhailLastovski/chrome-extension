async function changeWordStatus(element) {
    if (selectedValue) {
        const listId = element.getAttribute('data-list-id');

        document.querySelectorAll('.exa-radience-highlighted').forEach((el) => {
            if (
                el.innerHTML.toLowerCase() === element.innerHTML.toLowerCase()
            ) {
                el.style.backgroundColor = el.style.borderColor;
                el.setAttribute('status', selectedValue);

                const updatedWordLists = wordLists.map((wordList) => {
                    if (wordList.words && wordList.id === listId) {
                        wordList.words.forEach((wordObj) => {
                            if (
                                wordObj.word.trim().toLowerCase() ===
                                el.innerHTML.toLowerCase()
                            ) {
                                // updateStatus(
                                //     wordList.dataURL,
                                //     selectedValue,
                                //     wordObj.word
                                // );
                                wordObj['status'] = selectedValue;
                            }
                        });
                    }
                    return wordList;
                });
                chrome.storage.local.set({
                    wordLists: updatedWordLists,
                });
            }
        });
    } else {
        console.log('No status selected');
    }
}

async function removeWordsStatus(element) {
    const styleAttribute = element.getAttribute('style');
    if (!styleAttribute || !styleAttribute.includes('background-color')) {
        console.log('No status selected');
    } else {
        const listId = element.getAttribute('data-list-id');

        document.querySelectorAll('.exa-radience-highlighted').forEach((el) => {
            if (
                el.innerHTML.toLowerCase() === element.innerHTML.toLowerCase()
            ) {
                el.style.backgroundColor = 'transparent';
                el.removeAttribute('status');
                const updatedWordLists = wordLists.map((wordList) => {
                    if (wordList.words && wordList.id === listId) {
                        wordList.words.forEach((wordObj) => {
                            if (
                                wordObj.word.trim().toLowerCase() ===
                                el.innerHTML.toLowerCase()
                            ) {
                                // updateStatus(
                                //     wordList.dataURL,
                                //     '',
                                //     wordObj.word
                                // );
                                delete wordObj['status'];
                            }
                        });
                    }
                    return wordList;
                });
                chrome.storage.local.set({
                    wordLists: updatedWordLists,
                });
                const statusItems = document.querySelectorAll(
                    '.exa-radience-statuses-container-item'
                );
                statusItems.forEach((item) => {
                    item.style.backgroundColor = '#FD68A4';
                });
                console.log('Word status added');
            }
        });
    }
}

function updateStatus(listId, selectedValue, word) {
    const sheetId = extractSheetIdFromURL(listId);

    const data = {
        action: 'addNoteToElement',
        note: selectedValue,
        textContent: word,
        sheetId: sheetId,
        isSteps: false,
    };

    console.log('Sending data:', data);

    fetch(
        'https://script.google.com/macros/s/AKfycbypdoPeV_hb2SREfmw6F4ULW7HxxRUdXfuxKmlU7mnE4K_fHAwBL67R5nUa96aIfD5X/exec',
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

function extractSheetIdFromURL(url) {
    const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}
