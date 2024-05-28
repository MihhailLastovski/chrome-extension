document.addEventListener('DOMContentLoaded', function () {
    const addListForm = document.getElementById('addListForm');
    const listNameInput = document.getElementById('listNameInput');
    const wordsContainer = document.getElementById('wordsContainer');
    const newWordInput = document.getElementById('newWordInput');
    const cancelBtn = document.getElementById('cancelBtn');
    const cancelDownBtn = document.getElementById('cancelDownBtn');
    const lastListItem = document.getElementById('lastListItem');
    const addWordBtn = document.getElementById('saveListBtn');
    const addWordDownBtn = document.getElementById('saveListDownBtn');
    const colorPicker = document.getElementById('colorPicker');

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const listId = urlParams.get('listId');
    var dataURL;
    const tooltipButtonsRightVersion = [];
    const tooltipsTextRightVersion = [];

    const saveChangesBtn = document.createElement('button');
    const saveChangesDownBtn = document.createElement('button');
    var wordsArray = [];
    var highlightingColor;

    colorPicker.addEventListener('input', function () {
        highlightingColor = colorPicker.value;
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
                    addWord(wordObj.word, wordObj.enabled);
                }
            });

            saveChangesBtn.id = 'saveChangesBtn';
            saveChangesBtn.type = 'submit';
            saveChangesBtn.className = 'listFormBtn';
            saveChangesBtn.textContent = 'Save Changes';
            saveChangesBtn.setAttribute('tooltipText', 'Save List');
            saveChangesBtn.addEventListener('click', function () {
                saveEditedList(listIndex, lists);
            });

            saveChangesDownBtn.id = 'saveChangesDownBtn';
            saveChangesDownBtn.type = 'submit';
            saveChangesDownBtn.className = 'listFormBtn';
            saveChangesDownBtn.textContent = 'Save Changes';
            saveChangesDownBtn.setAttribute('tooltipText', 'Save List');
            saveChangesDownBtn.addEventListener('click', function () {
                saveEditedList(listIndex, lists);
            });

            if (addWordBtn) {
                addWordBtn.style.display = 'none';
            }
            if (addWordDownBtn) {
                addWordDownBtn.style.display = 'none';
            }
            cancelBtn.insertAdjacentElement('afterend', saveChangesBtn);
            cancelDownBtn.insertAdjacentElement('afterend', saveChangesDownBtn);
            newWordInput.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    const word = newWordInput.value.trim();
                    if (word !== '') {
                        addWord(word);
                        newWordInput.value = '';
                    }
                }
            });
            createTooltips();
        }
    });

    function saveEditedList(index, lists) {
        const listName = listNameInput.value.trim();
        wordsArray = [];
        const wordDivs = document.querySelectorAll('#wordsContainer > div');
        wordDivs.forEach((wordDiv) => {
            const checkbox = wordDiv.querySelector('.word-checkbox');
            const wordLabel = wordDiv.querySelector('.word-label');
            const statusLabel = wordDiv.querySelector('.status-label');
            if (wordLabel) {
                const word = wordLabel.textContent;
                const enabled = checkbox.checked;
                const status = statusLabel.textContent;
                const lecID = wordLabel.dataset.lecID;
                const stringID = wordLabel.dataset.stringID;

                if (word !== '') {
                    wordsArray.push({
                        lecID: lecID,
                        word: word,
                        status: status,
                        stringID: stringID,
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

    function addWord(word, enabled = true) {
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
        wordLabel.setAttribute('tooltipText', word);

        tooltipButtonsRightVersion.push(wordLabel);
        tooltipsTextRightVersion.push(wordLabel.textContent);

        const wordInput = document.createElement('textarea');
        wordInput.type = 'text';
        wordInput.value = word;
        wordInput.className = 'word-input';

        const statusLbl = document.createElement('label');
        statusLbl.className = 'status-label';
        chrome.storage.local.get('wordLists', (result) => {
            const wordLists = result.wordLists || [];
            const foundWord = wordLists
                .find((list) => list.id === listId)
                ?.words.find((w) => w.word === word);

            wordLabel.style.textDecoration = foundWord?.status
                ? 'line-through'
                : 'none';
            statusLbl.textContent = foundWord?.status || '';
            wordLabel.dataset.status = foundWord?.status || '';
            wordLabel.dataset.stringID = foundWord?.stringID || '';
            wordLabel.dataset.lecID = foundWord?.lecID || '';
        });

        const updateBtn = document.createElement('button');
        updateBtn.type = 'button';
        updateBtn.innerHTML =
            '<i class="fa-2x fa fa-pencil" aria-hidden="true"></i>';
        updateBtn.className = 'trash-btn';
        updateBtn.addEventListener('click', function () {
            if (wordDiv.contains(wordInput)) {
                const tooltips = document.querySelectorAll('.tooltip');
                const desiredDiv = Array.from(tooltips).find((div) =>
                    div.textContent.includes(wordLabel.textContent)
                );
                wordLabel.setAttribute('tooltipsText', wordInput.value.trim());
                desiredDiv.textContent = wordInput.value.trim();
                wordLabel.textContent = wordInput.value.trim();
                wordDiv.replaceChild(wordLabel, wordInput);
            } else {
                wordDiv.replaceChild(wordInput, wordLabel);
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
        wordDiv.appendChild(statusLbl);
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

                highlightWordsFromList(listId);
                function highlightWordsFromList(listId) {
                    chrome.storage.local.get('wordLists', function (data) {
                        const lists = data.wordLists || [];
                        const listToHighlight = lists.find(
                            (list) => list.id === listId
                        );

                        if (listToHighlight) {
                            const sortedWords = listToHighlight.words.sort(
                                (a, b) => {
                                    return b.word.length - a.word.length;
                                }
                            );

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
                                            searchText: sortedWords,
                                            highlightColor:
                                                listToHighlight.color,
                                            listId: listId,
                                        });
                                    }
                                }
                            );
                        }
                    });
                }
            }
        });

        if (listName && wordsArray.length > 0) {
            if (!listId) {
                const newList = {
                    id: Date.now().toString(),
                    name: listName,
                    color: highlightingColor || '#FC0365',
                    words: wordsArray,
                    dataURL: dataURL,
                };

                saveWordList(newList);
            }
            window.location.href = 'popup.html';
        } else {
            alert('Enter list name or words');
        }
    });
    chrome.windows.onFocusChanged.addListener(function (window) {
        const listName = listNameInput.value.trim() || 'unnamed';

        if (!listId) {
            const newList = {
                id: Date.now().toString(),
                name: listName,
                color: highlightingColor || '#FC0365',
                words: wordsArray,
                dataURL: dataURL,
            };
            if (listName && wordsArray.length > 0) {
                saveWordList(newList);
            }
        }
    });

    newWordInput.addEventListener('paste', function (event) {
        event.preventDefault();
        const pastedText = (
            event.clipboardData || window.clipboardData
        ).getData('text');
        const wordsArrayPasted = pastedText
            .split('\n')
            .map((word) => word.trim());

        wordsArrayPasted.forEach((word) => {
            if (word !== '') {
                addWord(word);
                wordsArray.push({
                    word: word,
                    enabled: true,
                });
            }
        });
        createTooltips();
    });

    newWordInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const word = newWordInput.value.trim();
            if (word !== '') {
                addWord(word);
                createTooltips();
                wordsArray.push({
                    word: word,
                    enabled: true,
                });
                newWordInput.value = '';
            }
        }
    });

    /*************************************Google Sheets********************************************/

    const csvListBtn = document.getElementById('csvListBtn');
    const fileListBtn = document.getElementById('fileListBtn');
    const attributeListBtn = document.getElementById('attributeListBtn');

    const csvButton = document.createElement('button');
    csvButton.setAttribute('tooltipText', 'Import');
    csvButton.innerHTML = '<i class="fa fa-search" aria-hidden="true"></i>';
    csvButton.type = 'button';

    var divWithListImportSettigs = document.createElement('div');
    addListForm.lastElementChild.insertBefore(
        divWithListImportSettigs,
        wordsContainer
    );

    // Чтение слов из CSV файла
    csvListBtn.addEventListener('click', function () {
        divWithListImportSettigs.innerHTML = '';

        var csvInput = document.createElement('input');
        csvInput.type = 'text';
        csvInput.id = 'textInput';
        csvInput.placeholder = 'Paste the link';
        csvButton.addEventListener('click', async function () {
            if (csvInput.value.trim() !== '') {
                dataURL = csvInput.value.trim();
                // Извлекаем идентификатор таблицы из введенной ссылки
                var spreadsheetId = extractSpreadsheetId(csvInput.value);

                // Строим URL для выполнения запроса к функции getDataBySheetName
                const data = {
                    action: 'getDataBySheetName',
                    sheetId: spreadsheetId,
                };

                console.log('Sending data:', data);

                fetch(
                    'https://script.google.com/macros/s/AKfycbz21ktmeytfBRMn1i5cedGRwjWiq-e_xH6ssntP5XYY4VzvLbuUBeV0R5Aytt0-Z3aD/exec',
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
                        // Здесь result содержит данные, которые возвращены из AppScript
                        console.log('Received data:', result);

                        // Проходимся по результатам и заполняем массив wordsArray
                        result.forEach((row) => {
                            if (row['Core Strings'] !== '') {
                                addWord(row['Core Strings']);
                                wordsArray.push({
                                    lecID: row['Lec ID'],
                                    stringID: row['String ID'],
                                    word: row['Core Strings'],
                                    status: row['Status'],
                                    enabled: true,
                                });
                            }
                        });
                        createTooltips();
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            } else {
                alert('Please enter link');
            }
        });

        var csvh2 = document.createElement('h2');
        csvh2.textContent = 'Google Sheets assistant';
        csvh2.style.textAlign = 'left';
        csvh2.style.marginLeft = '13%';

        var csvp = document.createElement('p');
        csvp.innerHTML = `<p>          
            1. File > Share > Share with others.<br>
            2. In "General access" choose "Anyone with the link".<br>
            3. Change role on "Editor".<br>
            4. Copy link.          
        </p>`;
        csvp.style.textAlign = 'left';
        csvp.style.marginLeft = '9%';

        divWithListImportSettigs.appendChild(csvh2);
        divWithListImportSettigs.appendChild(csvp);
        divWithListImportSettigs.appendChild(csvInput);
        divWithListImportSettigs.appendChild(csvButton);
    });
    function extractSpreadsheetId(link) {
        var regex = /\/d\/([a-zA-Z0-9-_]+)/;
        var match = link.match(regex);
        return match ? match[1] : null;
    }

    // Выбор файла и перенос значений в список
    fileListBtn.addEventListener('click', function () {
        divWithListImportSettigs.innerHTML = '';

        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt';

        fileInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const content = event.target.result;
                    const lines = content.split(/\r?\n/);
                    lines.forEach((line) => {
                        addWord(line.trim());
                        wordsArray.push({
                            word: line.trim(),
                            status: '',
                            enabled: true,
                        });
                    });
                };
                reader.readAsText(file);
            }
        });

        divWithListImportSettigs.appendChild(fileInput);
    });

    cancelBtn.addEventListener('click', function () {
        window.location.href = 'popup.html';
    });

    cancelDownBtn.addEventListener('click', function () {
        window.location.href = 'popup.html';
    });

    /*****************************************Tooltips**********************************************/
    function createTooltips() {
        function addTooltip(element) {
            const attributeValue = element.getAttribute('tooltipText');
            const tooltipId = `tooltip-${attributeValue.replace(/\s/g, '-')}`; // Create a unique ID based on the text

            // Check if the tooltip already exists
            let tooltip = document.getElementById(tooltipId);

            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.id = tooltipId; // Set the unique ID
                tooltip.className = 'tooltip';
                tooltip.innerText = attributeValue;
                document.body.appendChild(tooltip);
            }

            // Set event listeners for hover effects
            element.addEventListener('mouseover', function () {
                const rect = element.getBoundingClientRect();
                const tooltipX = rect.left + window.pageXOffset;
                const tooltipY = rect.bottom + window.pageYOffset + 5;

                tooltip.style.left = `${tooltipX}px`;
                tooltip.style.top = `${tooltipY}px`;

                tooltip.style.display = 'inline-block';
                tooltip.style.opacity = 1;
            });

            element.addEventListener('mouseout', function () {
                tooltip.style.display = 'none';
                tooltip.style.opacity = 0;
            });
        }

        // Select all elements that have the 'tooltipText' attribute
        const elementsWithTooltip = document.querySelectorAll('[tooltipText]');
        elementsWithTooltip.forEach(addTooltip);

        // Create a MutationObserver to watch for new buttons
        const mutationCallback = (mutationsList, observer) => {
            mutationsList.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const tooltipText =
                                node.getAttribute('tooltipText');
                            if (tooltipText) {
                                addTooltip(node); // Apply tooltip logic to the new element
                            }
                        }
                    });
                }
            });
        };

        const observer = new MutationObserver(mutationCallback);
        const observerOptions = {
            childList: true, // Watch for added/removed children
            subtree: true, // Observe the entire subtree
        };

        // Start observing the document body for changes
        observer.observe(document.body, observerOptions);
    }
});
