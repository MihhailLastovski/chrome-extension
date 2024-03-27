async function changeWordStatus(element) {
    if (selectedValue) {
        const listId = element.getAttribute('data-list-id');

        document.querySelectorAll('.exa-radience-highlighted').forEach((el) => {
            console.log("1",el.innerHTML.toLowerCase()," === ",element.innerHTML.toLowerCase());
            if (
                el.getAttribute('exa-radience-word') === element.getAttribute('exa-radience-word')
            ) {
                el.style.backgroundColor = el.style.borderColor;
                el.setAttribute('status', selectedValue);

                const updatedWordLists = wordLists.map((wordList) => {
                    if (wordList.words && wordList.id === listId) {
                        wordList.words.forEach((wordObj) => {
                            const word = wordObj.word.trim().toLowerCase();

                            if (
                                word === el.innerHTML.toLowerCase() ||
                                (attributesIsActive &&
                                    Array.from(element.attributes).some(
                                        (attr) => attr.value.includes(word)
                                    ))
                            ) {
                                if (wordList.dataURL) {
                                    updateStatus(
                                        wordList.dataURL,
                                        selectedValue,
                                        wordObj.stringID
                                    );
                                }
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
                el.getAttribute('exa-radience-word') === element.getAttribute('exa-radience-word')
            ) {
                el.style.backgroundColor = 'transparent';
                el.removeAttribute('status');
                const updatedWordLists = wordLists.map((wordList) => {
                    if (wordList.words && wordList.id === listId) {
                        wordList.words.forEach((wordObj) => {
                            const word = wordObj.word.trim().toLowerCase();
                            if (
                                word === el.innerHTML.toLowerCase() ||
                                (attributesIsActive &&
                                    Array.from(element.attributes).some(
                                        (attr) => attr.value.includes(word)
                                    ))
                            ) {
                                if (wordList.dataURL) {
                                    updateStatus(
                                        wordList.dataURL,
                                        '',
                                        wordObj.stringID
                                    );
                                }
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
        choice: 'status',
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

function extractSheetIdFromURL(url) {
    const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}
