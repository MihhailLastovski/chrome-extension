async function changeWordStatus(element) {
    if (selectedValue) {
        const listId = element.getAttribute('data-list-id');

        document.querySelectorAll('.highlighted').forEach((el) => {
            if (
                el.innerHTML.toLowerCase() ===
                element.innerHTML.toLowerCase()
            ) {
                //el.style.borderColor = highlightColorRestore; //highlightColorRestore
                el.style.backgroundColor = el.style.borderColor;

                el.setAttribute('status', selectedValue);
                chrome.storage.local.get('wordLists', (result) => {
                    const wordLists = result.wordLists || [];

                    const updatedWordLists = wordLists.map((wordList) => {
                        if (wordList.words && wordList.id === listId) {
                            wordList.words.forEach((wordObj) => {
                                if (
                                    wordObj.word.trim().toLowerCase() ===
                                    el.innerHTML.toLowerCase()
                                ) {
                                    wordObj['status'] = selectedValue;
                                }
                            });
                        }
                        return wordList;
                    });
                    chrome.storage.local.set({
                        wordLists: updatedWordLists,
                    });
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

        document.querySelectorAll('.highlighted').forEach((el) => {
            if (
                el.innerHTML.toLowerCase() ===
                element.innerHTML.toLowerCase()
            ) {
                el.style.backgroundColor = 'transparent';
                el.removeAttribute('status');
                chrome.storage.local.get('wordLists', (result) => {
                    const wordLists = result.wordLists || [];

                    const updatedWordLists = wordLists.map((wordList) => {
                        if (wordList.words && wordList.id === listId) {
                            wordList.words.forEach((wordObj) => {
                                if (
                                    wordObj.word.trim().toLowerCase() ===
                                    el.innerHTML.toLowerCase()
                                ) {
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
                });
            }
        });
    }
}