document.addEventListener('DOMContentLoaded', function () {
    const addListForm = document.getElementById('addListForm');
    const listNameInput = document.getElementById('listNameInput');
    const wordsContainer = document.getElementById('wordsContainer');
    const newWordInput = document.getElementById('newWordInput');
    const cancelBtn = document.getElementById('cancelBtn');
    const lastListItem = document.getElementById('lastListItem');
    const addWordBtn = document.getElementById('saveListBtn');

    const apiKey = 'AIzaSyBizfdeE-hxfeh-quvNXqEwAQSJa7WQuJk';
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const listId = urlParams.get('listId');
    const encodedDataString = urlParams.get('data');
    const encodedDataStringList = urlParams.get('dataList');
    const fileData = urlParams.get('dataFile');

    const saveChangesBtn = document.createElement('button');

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

    chrome.storage.local.get('wordLists', function (data) {
        let lists = data.wordLists || [];
        const listIndex = lists.findIndex((list) => list.id === listId);

        if (listIndex !== -1) {
            const listToEdit = lists[listIndex];

            listNameInput.value = listToEdit.name;

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
        }
    });

    function saveEditedList(index, lists) {
        const listName = listNameInput.value.trim();
        const editedWords = [];

        const wordDivs = document.querySelectorAll('#wordsContainer > div');
        wordDivs.forEach((wordDiv) => {
            const checkbox = wordDiv.querySelector('.word-checkbox');
            const wordInput = wordDiv.querySelector('.word-input');

            const word = wordInput.value.trim();
            const enabled = checkbox.checked;

            if (word !== '') {
                editedWords.push({
                    word: word,
                    enabled: enabled,
                });
            }
        });

        if (listName && editedWords.length > 0) {
            lists[index].name = listName;
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

        const wordInput = document.createElement('textarea');
        wordInput.type = 'text';
        wordInput.value = word;
        wordInput.className = 'word-input';

        chrome.storage.local.get('wordLists', (result) => {
            const wordLists = result.wordLists || [];
            const foundWord = wordLists
                .find((list) => list.id === listId)
                ?.words.find((w) => w.word === word);

            wordInput.style.textDecoration = foundWord?.status
                ? 'line-through'
                : 'none';
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML =
            '<i class="fa-2x fa fa-trash-o" aria-hidden="true"></i>';
        deleteBtn.className = 'trash-btn';
        deleteBtn.addEventListener('click', function () {
            wordDiv.remove();
        });

        wordDiv.appendChild(checkbox);
        wordDiv.appendChild(label);
        wordDiv.appendChild(wordInput);
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
            const wordInput = wordDiv.querySelector('.word-input');

            const word = wordInput.value.trim();
            const enabled = checkbox.checked;

            if (word !== '') {
                words.push({
                    word: word,
                    enabled: enabled,
                });
            }
        });

        if (listName && words.length > 0) {
            if (!listId) {
                const newList = {
                    id: Date.now().toString(),
                    name: listName,
                    words: words,
                    ...(encodedDataString && { icon: 'fa-sheet-plastic' }),
                };

                saveWordList(newList);
            } else {
            }

            listNameInput.value = '';
            wordsContainer.innerHTML = '';
            window.location.href = 'popup.html';
        } else {
            alert('Enter list name or words');
        }
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

    csvListBtn.addEventListener('click', function () {
        divWithListImportSettigs.innerHTML = '';

        var csvInput = document.createElement('input');
        csvInput.type = 'text';
        csvInput.id = 'textInput';
        csvInput.placeholder = 'Paste the link';

        csvButton.addEventListener('click', function () {
            if (csvInput.value.trim() !== '') {
                // csvLink = csvInput.value.replace('/edit', '/export?format=csv');
                csvLink = csvInput.value;

                chrome.storage.local.set({ dataURL: csvLink });
                fetchDataAndProcessWords(csvLink);

                csvInput.value = '';
            } else {
                alert('Please enter link');
            }
        });

        refreshBtn.addEventListener('click', function () {
            while (wordsContainer.firstChild) {
                wordsContainer.removeChild(wordsContainer.firstChild);
            }
            wordsContainer.appendChild(lastListItem);

            chrome.storage.local.get('dataURL', (result) => {
                if (result.dataURL) {
                    fetchDataAndProcessWords(result.dataURL);
                }
            });
        });

        var csvh2 = document.createElement('h2');
        csvh2.textContent = 'Google Sheets assistant';
        csvh2.style.textAlign = 'left';
        csvh2.style.marginLeft = '13%'; //'18%'

        csvh2.addEventListener('click', function () {
            window.location.href = `guide.html?listId=${listId}`;
        });

        // var csvp = document.createElement('p');
        // csvp.innerHTML = `<p>
        //     1. File > Share > Publish to web.<br>
        //     2. Click Publish.<br>
        //     3. Choose format csv.<br>
        //     4. Copy the URL.
        // </p>`;
        // csvp.style.textAlign = 'left';
        // csvp.style.marginLeft = '14%';

        divWithListImportSettigs.appendChild(csvh2);
        // divWithListImportSettigs.appendChild(csvp);
        divWithListImportSettigs.appendChild(csvInput);
        divWithListImportSettigs.appendChild(csvButton);
        divWithListImportSettigs.appendChild(refreshBtn);

        const postBtn = document.createElement('button');
        postBtn.innerHTML = 'Update Google Sheet';
        postBtn.type = 'button';
        divWithListImportSettigs.appendChild(postBtn);

        postBtn.addEventListener('click', function () {
            var updatedData = [
                { col1: 'updated words' },
                { col1: 'to' },
                { col1: 'find' },
            ];

            // Временно для удобства
            chrome.storage.local.get('dataURL', (result) => {
                if (result.dataURL) {
                    sendDataToGoogleAppsScript(result.dataURL, updatedData);
                }
            });
        });
    });

    async function fetchDataAndProcessWords(url) {
        // try {
        //     const response = await fetch(url);
        //     const csvData = await response.text();

        //     const rows = csvData.split('\n');
        //     const wordsArray = rows.reduce((words, row) => {
        //         const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        //         const wordsInRow = columns.map((cell) =>
        //             cell.trim().replace(/"/g, '')
        //         );
        //         return words.concat(wordsInRow.filter((word) => word !== ''));
        //     }, []);

        //     wordsArray.forEach((word) => {
        //         addWord(word.trim());
        //     });
        // } catch (error) {
        //     console.error('Error while retrieving data:', error);
        //     alert('Error while retrieving data, please try again.');
        // }

        try {
            const response = await fetch(url);
            const csvData = await response.json();

            const wordsArray = csvData.map((rowData) => rowData.col1);

            wordsArray.forEach((word) => {
                addWord(word.trim());
            });
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
            alert('Ошибка при получении данных');
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
    let tooltipTimer;

    tooltipButtons.forEach((button, index) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerText = tooltipsText[index];
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
});
