document.addEventListener('DOMContentLoaded', function () {
    const addListForm = document.getElementById('addListForm');
    const listNameInput = document.getElementById('listNameInput');
    const wordsContainer = document.getElementById('wordsContainer');
    const newWordInput = document.getElementById('newWordInput');
    const cancelBtn = document.getElementById('cancelBtn');
    const lastListItem = document.getElementById('lastListItem');
    const addWordBtn = document.getElementById('saveListBtn');
    const colorPicker = document.getElementById('colorPicker');

    // const apiKey = 'AIzaSyBizfdeE-hxfeh-quvNXqEwAQSJa7WQuJk';
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const listId = urlParams.get('listId');
    const encodedDataString = urlParams.get('data');
    const encodedDataStringList = urlParams.get('dataList');
    const fileData = urlParams.get('dataFile');

    const tooltipButtonsRightVersion = [];
    const tooltipsTextRightVersion = [];

    const saveChangesBtn = document.createElement('button');
    var highlightingColor;

    if (encodedDataString) {
        const dataList = JSON.parse(decodeURIComponent(encodedDataString));
        if (dataList && dataList.length > 0) {
            dataList.forEach((word) => {
                addWord(word, true);
            });
        }
    }
    if (encodedDataStringList) {
        const data = decodeURIComponent(encodedDataStringList);
        const rows = data.split('\n');
        rows.forEach((row) => {
            const columns = row.split('\t');
            const word = columns[0].trim();
            addWord(word, true);
        });
    }
    if (fileData) {
        const decodedData = decodeURIComponent(fileData);
        const wordsArray = decodedData.split(',');
        wordsArray.forEach((word) => {
            addWord(word.trim(), true);
        });
    }

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
                if (wordObj.word.trim() !== '') {
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

            createTooltips();
        }
    });

    function saveEditedList(index, lists) {
        const listName = listNameInput.value.trim();
        const editedWords = [];

        const wordDivs = document.querySelectorAll('#wordsContainer > div');
        wordDivs.forEach((wordDiv) => {
            const checkbox = wordDiv.querySelector('.word-checkbox');
            const wordLabel = wordDiv.querySelector('.word-label');

            if (wordLabel) {
                const word = wordLabel.textContent;
                const enabled = checkbox.checked;
                const status = wordLabel.dataset.status || '';

                if (word !== '') {
                    editedWords.push({
                        word: word,
                        enabled: enabled,
                        status: status,
                    });
                }
            }
        });

        if (listName && editedWords.length > 0) {
            lists[index].name = listName;
            lists[index].color = highlightingColor;
            lists[index].words = editedWords;

            chrome.storage.local.set({ wordLists: lists }, function () {});
        } else {
            alert('Enter list name or non-empty words');
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

        chrome.storage.local.get('wordLists', (result) => {
            const wordLists = result.wordLists || [];
            const foundWord = wordLists
                .find((list) => list.id === listId)
                ?.words.find((w) => w.word === word);

            wordLabel.style.textDecoration = foundWord?.status
                ? 'line-through'
                : 'none';
            statusLbl.textContent = foundWord?.status || '';
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
        const words = [];

        const wordDivs = document.querySelectorAll('#wordsContainer > div');
        wordDivs.forEach((wordDiv) => {
            const checkbox = wordDiv.querySelector('.word-checkbox');
            const wordLabel = wordDiv.querySelector('.word-label');

            if (wordLabel) {
                const word = wordLabel.textContent;
                const enabled = checkbox.checked;

                if (word !== '') {
                    words.push({
                        word: word,
                        enabled: enabled,
                        stringID: stringID,
                        status: wordStatus,
                    });
                }
            }
        });

        chrome.storage.local.get('dataURL', function (result) {
            const urlFromInput = result.dataURL;

            if (listName && words.length > 0) {
                if (!listId) {
                    const newList = {
                        id: Date.now().toString(),
                        name: listName,
                        color: highlightingColor || '#FC0365',
                        words: words,
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
        const words = [];

        const wordDivs = document.querySelectorAll('#wordsContainer > div');
        wordDivs.forEach((wordDiv) => {
            const checkbox = wordDiv.querySelector('.word-checkbox');
            const wordLabel = wordDiv.querySelector('.word-label');

            if (wordLabel) {
                const word = wordLabel.textContent;
                const enabled = checkbox.checked;

                if (word !== '') {
                    words.push({
                        word: word,
                        enabled: enabled,
                        stringID: "stringID",
                        status: "wordStatus",
                    });
                }
            }
        });

        chrome.storage.local.get('dataURL', function (result) {
            const urlFromInput = result.dataURL;

            if (!listId) {
                const newList = {
                    id: Date.now().toString(),
                    name: listName,
                    color: highlightingColor || '#FC0365',
                    words: words,
                    dataURL: urlFromInput,
                };
                if (listName && words.length > 0) {
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
            }
        });
    });

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

    /*************************************Google Sheets********************************************/

    const csvListBtn = document.getElementById('csvListBtn');
    const exportListBtn = document.getElementById('exportListBtn');
    const fileListBtn = document.getElementById('fileListBtn');

    var csvLink;

    const csvButton = document.createElement('button');
    csvButton.innerHTML = '<i class="fa fa-search" aria-hidden="true"></i>';
    csvButton.type = 'button';

    const refreshBtn = document.createElement('button');
    refreshBtn.type = 'button';
    refreshBtn.innerHTML = '<i class="fa fa-refresh" aria-hidden="true"></i>';

    var divWithListImportSettigs = document.createElement('div');
    addListForm.lastElementChild.insertBefore(
        divWithListImportSettigs,
        wordsContainer
    );

    // Чтение слов из CSV файла
    csvListBtn.addEventListener('click', function () {
        // divWithListImportSettigs.innerHTML = '';

        // var csvInput = document.createElement('input');
        // csvInput.type = 'text';
        // csvInput.id = 'textInput';
        // csvInput.placeholder = 'Paste the link';

        // csvButton.addEventListener('click', function () {
        //     if (csvInput.value.trim() !== '') {
        //         csvLink = csvInput.value.replace('/edit', '/export?format=csv');
        //         chrome.storage.local.set({ dataURL: csvLink });
        //         fetchDataAndProcessWords(csvLink, true);

        //         csvInput.value = '';
        //     } else {
        //         alert('Please enter link');
        //     }
        // });
        divWithListImportSettigs.innerHTML = '';

        var csvInput = document.createElement('input');
        csvInput.type = 'text';
        csvInput.id = 'textInput';
        csvInput.placeholder = 'Paste the link';
    
        csvButton.addEventListener('click', function () {
            if (csvInput.value.trim() !== '') {
                const htmlLink = csvInput.value;
                chrome.storage.local.set({ dataURL: htmlLink });
                fetchDataAndProcessWords(htmlLink, true);
    
                csvInput.value = '';
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

        refreshBtn.addEventListener('click', function () {
            while (wordsContainer.firstChild) {
                wordsContainer.removeChild(wordsContainer.firstChild);
            }
            wordsContainer.appendChild(lastListItem);

            chrome.storage.local.get('dataURL', (result) => {
                if (result.dataURL) {
                    fetchDataAndProcessWords(result.dataURL, true);
                }
            });
        });

        divWithListImportSettigs.appendChild(refreshBtn);
    });

    // Изменение Google Sheets через Apps Script
    exportListBtn.addEventListener('click', function () {
        divWithListImportSettigs.innerHTML = '';

        var csvInput = document.createElement('input');
        csvInput.type = 'text';
        csvInput.id = 'textInput';
        csvInput.placeholder = 'Paste the link';

        csvButton.addEventListener('click', function () {
            if (csvInput.value.trim() !== '') {
                csvLink = csvInput.value;

                chrome.storage.local.set({ dataURL: csvLink });
                fetchDataAndProcessWords(csvLink);

                csvInput.value = '';
            } else {
                alert('Please enter link');
            }
        });

        // refreshBtn.addEventListener('click', function () {
        //     while (wordsContainer.firstChild) {
        //         wordsContainer.removeChild(wordsContainer.firstChild);
        //     }
        //     wordsContainer.appendChild(lastListItem);

        //     chrome.storage.local.get('dataURL', (result) => {
        //         if (result.dataURL) {
        //             fetchDataAndProcessWords(result.dataURL);
        //         }
        //     });
        // });

        var csvh2 = document.createElement('h2');
        csvh2.textContent = 'Google Sheets assistant';
        csvh2.style.textAlign = 'left';
        csvh2.style.marginLeft = '13%'; //'18%'

        csvh2.addEventListener('click', function () {
            window.location.href = `guide.html?listId=${listId}`;
        });

        divWithListImportSettigs.appendChild(csvh2);
        divWithListImportSettigs.appendChild(csvInput);
        divWithListImportSettigs.appendChild(csvButton);
        // divWithListImportSettigs.appendChild(refreshBtn);

        const postBtn = document.createElement('button');
        postBtn.innerHTML = 'Update Google Sheet';
        postBtn.type = 'button';
        divWithListImportSettigs.appendChild(postBtn);

        postBtn.addEventListener('click', function () {
            const wordsArray = [];

            const wordDivs = document.querySelectorAll('#wordsContainer > div');
            wordDivs.forEach((wordDiv) => {
                const wordLabel = wordDiv.querySelector('.word-label');

                if (wordLabel) {
                    const word = wordLabel.textContent;
                    if (word !== '') {
                        wordsArray.push(word);
                    }
                }
            });

            const updatedData = wordsArray.map((word) => ({ col1: word }));
            console.log(updatedData);

            if (csvInput.value.trim() !== '') {
                sendDataToGoogleAppsScript(csvInput.value, updatedData);
                csvInput.value = '';
            }
        });
    });

    // async function fetchDataAndProcessWords(url, readOnly) {
    //     if (readOnly) {
    //         try {
    //             const response = await fetch(url);
    //             const csvData = await response.text();

    //             const rows = csvData.split('\n');
    //             const wordsArray = rows.reduce((words, row) => {
    //                 const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    //                 const wordsInRow = columns.map((cell) =>
    //                     cell.trim().replace(/"/g, '')
    //                 );
    //                 return words.concat(
    //                     wordsInRow.filter((word) => word !== '')
    //                 );
    //             }, []);

    //             wordsArray.forEach((word) => {
    //                 addWord(word.trim());
    //             });
    //         } catch (error) {
    //             console.error('Error while retrieving data:', error);
    //             alert('Error while retrieving data, please try again.');
    //         }
    //     } else {
    //         try {
    //             const response = await fetch(url);
    //             const csvData = await response.json();

    //             const wordsArray = csvData.map((rowData) => rowData.col1);

    //             wordsArray.forEach((word) => {
    //                 addWord(word.trim());
    //             });
    //         } catch (error) {
    //             console.error('Ошибка при получении данных:', error);
    //             alert('Ошибка при получении данных');
    //         }
    //     }
    // }
    async function fetchDataAndProcessWords(url, readOnly) {
        try {
            const response = await fetch(url);
            const htmlData = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlData, 'text/html');
            const tableRows = doc.querySelectorAll('.waffle tbody tr');

            const wordsArray = Array.from(tableRows).map(row => {
                const columns = row.querySelectorAll('td');
                return Array.from(columns).map(column => column.textContent.trim());
            });

            wordsArray.forEach((word) => {
                addWord(word.join(','));
            });
        } catch (error) {
            console.error('Error while retrieving data:', error);
            alert('Error while retrieving data, please try again.');
        }
    }
    function sendDataToGoogleAppsScript(url, data) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.text())
            .then((result) => {
                console.log(result); // Результат выполнения запроса
                alert('Данные обновлены.');
            })
            .catch((error) =>
                console.error('Ошибка при отправке данных:', error)
            );
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
                    const words = content
                        .split(/\s+/)
                        .filter((word) => word.trim() !== '');
                    words.forEach((word) => {
                        addWord(word.trim());
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
    function createTooltips() {
        const tooltipButtons = [
            csvButton,
            refreshBtn,
            saveChangesBtn,
            cancelBtn,
            addWordBtn,
        ];
        const tooltipsText = [
            'Search Google sheets',
            'Synchronize list',
            'Save changes in list',
            'Go back',
            'Add new list',
        ];

        while (tooltipsText.length > 0) {
            tooltipButtonsRightVersion.push(tooltipButtons.shift());
            tooltipsTextRightVersion.push(tooltipsText.shift());
        }

        // console.log(tooltipButtonsRightVersion);
        console.log(tooltipsTextRightVersion);
        let tooltipTimer;

        // tooltipButtons.forEach((button, index) => {
        //     const tooltip = document.createElement('div');
        //     tooltip.className = 'tooltip';
        //     tooltip.innerText = tooltipsText[index];
        //     document.body.appendChild(tooltip);

        //     button.addEventListener('mouseover', function () {
        //         tooltipTimer = setTimeout(function () {
        //             const rect = button.getBoundingClientRect();
        //             const tooltipX = rect.left + window.pageXOffset;
        //             var tooltipY;
        //             if (
        //                 button === cancelBtn ||
        //                 button === addWordBtn ||
        //                 button === saveChangesBtn
        //             ) {
        //                 tooltipY = rect.bottom + window.pageYOffset - 70;
        //             } else {
        //                 tooltipY = rect.bottom + window.pageYOffset + 5;
        //             }

        //             tooltip.style.left = `${tooltipX}px`;
        //             tooltip.style.top = `${tooltipY}px`;

        //             tooltip.style.display = 'inline-block';
        //             tooltip.style.opacity = 1;
        //         }, 500);
        //     });

        //     button.addEventListener('mouseout', function () {
        //         clearTimeout(tooltipTimer);
        //         tooltip.style.display = 'none';
        //         tooltip.style.opacity = 0;
        //     });
        // });

        tooltipButtonsRightVersion.forEach((button, index) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.innerText = tooltipsTextRightVersion[index];
            document.body.appendChild(tooltip);

            button.addEventListener('mouseover', function () {
                tooltipTimer = setTimeout(function () {
                    const rect = button.getBoundingClientRect();
                    const tooltipX = rect.left + window.pageXOffset;
                    var tooltipY;
                    if (
                        button === cancelBtn ||
                        button === addWordBtn ||
                        button === saveChangesBtn
                    ) {
                        tooltipY = rect.bottom + window.pageYOffset - 70;
                    } else {
                        tooltipY = rect.bottom + window.pageYOffset + 5;
                    }

                    tooltip.style.left = `${tooltipX}px`;
                    tooltip.style.top = `${tooltipY}px`;

                    tooltip.style.display = 'inline-block';
                    tooltip.style.opacity = 1;
                }, 500);
            });

            button.addEventListener('mouseout', function () {
                clearTimeout(tooltipTimer);
                tooltip.style.display = 'none';
                tooltip.style.opacity = 0;
            });
        });
    }
});
