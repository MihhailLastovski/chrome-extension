document.addEventListener('DOMContentLoaded', function () {
    const addListForm = document.getElementById('addListForm');
    const listNameInput = document.getElementById('listNameInput');
    const wordsContainer = document.getElementById('wordsContainer');
    const newWordInput = document.getElementById('newWordInput');
    const cancelBtn = document.getElementById('cancelBtn');
    const lastListItem = document.getElementById('lastListItem');
    const addWordBtn = document.getElementById('saveListBtn');
    const colorPicker = document.getElementById('colorPicker');

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const listId = urlParams.get('listId');

    const tooltipButtonsRightVersion = [];
    const tooltipsTextRightVersion = [];

    const saveChangesBtn = document.createElement('button');
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
                    if (word !== '') {
                        addWord(word);
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
            const statusLabel = wordDiv.querySelector('.status-label');
            if (wordLabel) {
                const word = wordLabel.textContent;
                const enabled = checkbox.checked;
                const status = statusLabel.textContent;

                if (word !== '') {
                    wordsArray.push({
                        word: word,
                        status: status,
                        stringID: 'stringID',
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
        });

        const updateBtn = document.createElement('button');
        updateBtn.type = 'button';
        updateBtn.innerHTML =
            '<i class="fa-2x fa fa-pencil" aria-hidden="true"></i>';
        updateBtn.className = 'trash-btn';
        updateBtn.addEventListener('click', function () {
            if (wordDiv.contains(wordInput)) {
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
                    dataURL: urlFromInput,
                };
                if (listName && wordsArray.length > 0) {
                    saveWordList(newList);
                }
            }
        });
    });

    newWordInput.addEventListener('paste', function (event) {
        event.preventDefault();
        const pastedText = (
            event.clipboardData || window.clipboardData
        ).getData('text');
        const wordsArray = pastedText.split('\n').map((word) => word.trim());

        wordsArray.forEach((word) => {
            if (word !== '') {
                addWord(word);
                wordsArray.push({
                    word: word,
                    enabled: true,
                });
            }
        });
    });

    newWordInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const word = newWordInput.value.trim();
            if (word !== '') {
                addWord(word);
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
                chrome.storage.local.set({ dataURL: csvInput.value.trim() });
                // Извлекаем идентификатор таблицы из введенной ссылки
                var spreadsheetId = extractSpreadsheetId(csvInput.value);

                // Строим URL для выполнения запроса к функции getDataBySheetName
                const data = {
                    action: 'getDataBySheetName',
                    sheetId: spreadsheetId,
                };

                console.log('Sending data:', data);

                fetch(
                    'https://script.google.com/macros/s/AKfycbypdoPeV_hb2SREfmw6F4ULW7HxxRUdXfuxKmlU7mnE4K_fHAwBL67R5nUa96aIfD5X/exec',
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
                        addWord(row['Core Strings']);
                        wordsArray.push({
                            stringID: row['String ID'],
                            word: row['Core Strings'],
                            status: row['Status'],
                            enabled: true,
                        });
                    });
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            } 
            else 
            {
                alert('Please enter link');
            }
        });

        var csvh2 = document.createElement('h2');
        csvh2.textContent = 'Google Sheets assistant';
        csvh2.style.textAlign = 'left';
        csvh2.style.marginLeft = '13%';

        var csvp = document.createElement('p');
        csvp.innerHTML = `<p>          
            1. File > Share > Publish to web.<br>
            2. Click Publish.<br>
            3. Choose format csv.<br>
            4. Copy the URL.          
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

    /*****************************************Tooltips**********************************************/
    /* Необходимо оптимизировать */
    // function createTooltips() {
    //     const tooltipButtons = [
    //         csvButton,
    //         saveChangesBtn,
    //         cancelBtn,
    //         addWordBtn,
    //     ];
    //     const tooltipsText = [
    //         'Search Google sheets',
    //         'Synchronize list',
    //         'Save changes in list',
    //         'Go back',
    //         'Add new list',
    //     ];

    //     while (tooltipsText.length > 0) {
    //         tooltipButtonsRightVersion.push(tooltipButtons.shift());
    //         tooltipsTextRightVersion.push(tooltipsText.shift());
    //     }

    //     // console.log(tooltipButtonsRightVersion);
    //     console.log(tooltipsTextRightVersion);
    //     let tooltipTimer;

    //     // tooltipButtons.forEach((button, index) => {
    //     //     const tooltip = document.createElement('div');
    //     //     tooltip.className = 'tooltip';
    //     //     tooltip.innerText = tooltipsText[index];
    //     //     document.body.appendChild(tooltip);

    //     //     button.addEventListener('mouseover', function () {
    //     //         tooltipTimer = setTimeout(function () {
    //     //             const rect = button.getBoundingClientRect();
    //     //             const tooltipX = rect.left + window.pageXOffset;
    //     //             var tooltipY;
    //     //             if (
    //     //                 button === cancelBtn ||
    //     //                 button === addWordBtn ||
    //     //                 button === saveChangesBtn
    //     //             ) {
    //     //                 tooltipY = rect.bottom + window.pageYOffset - 70;
    //     //             } else {
    //     //                 tooltipY = rect.bottom + window.pageYOffset + 5;
    //     //             }

    //     //             tooltip.style.left = `${tooltipX}px`;
    //     //             tooltip.style.top = `${tooltipY}px`;

    //     //             tooltip.style.display = 'inline-block';
    //     //             tooltip.style.opacity = 1;
    //     //         }, 500);
    //     //     });

    //     //     button.addEventListener('mouseout', function () {
    //     //         clearTimeout(tooltipTimer);
    //     //         tooltip.style.display = 'none';
    //     //         tooltip.style.opacity = 0;
    //     //     });
    //     // });

    //     tooltipButtonsRightVersion.forEach((button, index) => {
    //         const tooltip = document.createElement('div');
    //         tooltip.className = 'tooltip';
    //         tooltip.innerText = tooltipsTextRightVersion[index];
    //         document.body.appendChild(tooltip);

    //         button.addEventListener('mouseover', function () {
    //             tooltipTimer = setTimeout(function () {
    //                 const rect = button.getBoundingClientRect();
    //                 const tooltipX = rect.left + window.pageXOffset;
    //                 var tooltipY;
    //                 if (
    //                     button === cancelBtn ||
    //                     button === addWordBtn ||
    //                     button === saveChangesBtn
    //                 ) {
    //                     tooltipY = rect.bottom + window.pageYOffset - 70;
    //                 } else {
    //                     tooltipY = rect.bottom + window.pageYOffset + 5;
    //                 }

    //                 tooltip.style.left = `${tooltipX}px`;
    //                 tooltip.style.top = `${tooltipY}px`;

    //                 tooltip.style.display = 'inline-block';
    //                 tooltip.style.opacity = 1;
    //             }, 500);
    //         });

    //         button.addEventListener('mouseout', function () {
    //             clearTimeout(tooltipTimer);
    //             tooltip.style.display = 'none';
    //             tooltip.style.opacity = 0;
    //         });
    //     });
    // }
});
