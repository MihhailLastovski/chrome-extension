document.addEventListener('DOMContentLoaded', function () {
    const addListForm = document.getElementById('addListForm');
    const listNameInput = document.getElementById('listNameInput');
    const wordsContainer = document.getElementById('wordsContainer');
    const newWordInput = document.getElementById('newWordInput');
    const cancelBtn = document.getElementById('cancelBtn');
    const lastListItem = document.getElementById('lastListItem');
    const addWordBtn = document.getElementById('saveListBtn');
    const colorPicker = document.getElementById('colorPicker');

    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');

    const saveChangesBtn = document.createElement('button');
    var wordsArray = [];

    var highlightingColor, customAttributes;

    colorPicker.addEventListener('input', function () {
        highlightingColor = colorPicker.value;
    });

    chrome.storage.local.get('customAttributes', (result) => {
        customAttributes = result.customAttributes || [];
    });

    chrome.storage.local.get('wordLists', function (data) {
        let lists = data.wordLists || [];
        const listIndex = lists.findIndex((list) => list.id === listId);

        if (listIndex !== -1) {
            const listToEdit = lists[listIndex];

            listNameInput.value = listToEdit.name;
            colorPicker.value = listToEdit.color;
            highlightingColor = listToEdit.color;

            listToEdit.words.forEach((wordObj) => {
                if (wordObj.word) {
                    addWord(wordObj.word, wordObj.attribute, wordObj.enabled);
                }
            });

            saveChangesBtn.id = 'saveChangesBtn';
            saveChangesBtn.type = 'submit';
            saveChangesBtn.textContent = 'Save Changes';
            saveChangesBtn.addEventListener('click', function () {
                saveEditedList(listIndex, lists);
            });

            if (addWordBtn) {
                addWordBtn.style.display = 'none';
            }
            addListForm.lastElementChild.appendChild(saveChangesBtn);
            newWordInput.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    const word = newWordInput.value.trim();
                    const attribute = 'id';
                    if (word !== '') {
                        addWord(word, attribute);
                        newWordInput.value = '';
                    }
                }
            });

            //createTooltips();
        }
    });

    function saveEditedList(index, lists) {
        const listName = listNameInput.value.trim();
        wordsArray = [];
        const wordDivs = document.querySelectorAll('#wordsContainer > div');
        wordDivs.forEach((wordDiv) => {
            const checkbox = wordDiv.querySelector('.word-checkbox');
            const wordLabel = wordDiv.querySelector('.word-label');
            const attributeLabel = wordDiv.querySelector('.attribute-label');
            if (wordLabel) {
                const enabled = checkbox.checked;
                const word = wordLabel.textContent;
                const attribute = attributeLabel.textContent;

                if (word !== '') {
                    wordsArray.push({
                        word: word,
                        attribute: attribute,
                        enabled: enabled,
                    });
                }
            }
        });

        if (listName && wordsArray.length > 0) {
            lists[index].name = listName;
            lists[index].color = highlightingColor;
            lists[index].words = wordsArray;

            chrome.storage.local.set({ wordLists: lists }, function () {});
        }
    }

    function saveWordList(wordList) {
        chrome.storage.local.get('wordLists', function (data) {
            let lists = data.wordLists || [];
            lists.push(wordList);
            chrome.storage.local.set({ wordLists: lists });
        });
    }

    function addWord(word, attribute, enabled = true) {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'list-wordsItem';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = enabled;
        checkbox.id = 'cbox' + wordsContainer.childElementCount;
        checkbox.className = 'word-checkbox';

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;

        const wordLabel = document.createElement('label');
        wordLabel.textContent = word;
        wordLabel.className = 'word-label';

        const wordInput = document.createElement('textarea');
        wordInput.type = 'text';
        wordInput.value = word;
        wordInput.className = 'word-input';

        const attributeLabel = document.createElement('label');
        attributeLabel.textContent = attribute;
        attributeLabel.className = 'attribute-label';

        const attributeSelect = document.createElement('select');
        customAttributes.forEach((attribute) => {
            const option = document.createElement('option');
            option.value = attribute;
            option.textContent = attribute;
            attributeSelect.appendChild(option);
        });

        const updateBtn = document.createElement('button');
        updateBtn.type = 'button';
        updateBtn.innerHTML =
            '<i class="fa-2x fa fa-pencil" aria-hidden="true"></i>';
        updateBtn.className = 'trash-btn';
        updateBtn.addEventListener('click', function () {
            if (wordDiv.contains(wordInput)) {
                wordLabel.textContent = wordInput.value.trim();
                attributeLabel.textContent = attributeSelect.value;
                wordDiv.replaceChild(wordLabel, wordInput);
                wordDiv.replaceChild(attributeLabel, attributeSelect);
            } else {
                Array.from(attributeSelect.options).find((option) => {
                    if (option.value === attributeLabel.textContent) {
                        option.selected = true;
                        return true;
                    }
                });
                wordDiv.replaceChild(wordInput, wordLabel);
                wordDiv.replaceChild(attributeSelect, attributeLabel);
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.innerHTML =
            '<i class="fa-2x fa fa-trash-o" aria-hidden="true"></i>';
        deleteBtn.className = 'trash-btn';
        deleteBtn.addEventListener('click', function () {
            wordDiv.remove();
        });

        wordDiv.appendChild(checkbox);
        wordDiv.appendChild(label);
        wordDiv.appendChild(wordLabel);
        wordDiv.appendChild(attributeLabel);
        wordDiv.appendChild(updateBtn);
        wordDiv.appendChild(deleteBtn);

        wordsContainer.insertBefore(wordDiv, lastListItem);
    }

    addListForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const listName = listNameInput.value.trim();

        chrome.storage.local.get('enabledLists', function (data) {
            var enabledLists = data.enabledLists || [];
            if (enabledLists.includes(listId)) {
                chrome.tabs.query(
                    { active: true, currentWindow: true },
                    function (tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'removeHighlight',
                            listId: listId,
                        });
                    }
                );

                chrome.runtime.sendMessage({
                    action: 'updateLists',
                    listId: listId,
                });
            }
        });

        chrome.storage.local.get('dataURL', function (result) {
            const urlFromInput = result.dataURL;

            if (listName && wordsArray.length > 0) {
                if (!listId) {
                    const newList = {
                        id: Date.now().toString(),
                        name: listName,
                        color: highlightingColor || '#FC0365',
                        words: wordsArray,
                        isAttributeList: true,
                        dataURL: urlFromInput,
                    };

                    saveWordList(newList);
                }
                window.location.href = 'popup.html';
            } else {
                alert('Enter list name or words');
            }
        });
    });

    chrome.windows.onFocusChanged.addListener(function (window) {
        const listName = listNameInput.value.trim() || 'unnamed';

        chrome.storage.local.get('dataURL', function (result) {
            const urlFromInput = result.dataURL;

            if (!listId) {
                const newList = {
                    id: Date.now().toString(),
                    name: listName,
                    color: highlightingColor || '#FC0365',
                    words: wordsArray,
                    isAttributeList: true,
                    dataURL: urlFromInput,
                };
                if (listName && wordsArray.length > 0) {
                    saveWordList(newList);
                }
            }
        });
    });

    newWordInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const word = newWordInput.value.trim();
            const attribute = 'id';
            if (word !== '') {
                addWord(word, attribute);
                wordsArray.push({
                    word: word,
                    attribute: attribute,
                    enabled: true,
                });
                newWordInput.value = '';
            }
        }
    });

    cancelBtn.addEventListener('click', function () {
        window.location.href = 'popup.html';
    });
});
