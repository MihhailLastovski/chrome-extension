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

            const saveChangesBtn = document.createElement('button');
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

    const googleListBtn = document.getElementById('googleListBtn');
    const csvListBtn = document.getElementById('csvListBtn');
    const fileListBtn = document.getElementById('fileListBtn');
    const linkToListBtn = document.getElementById('linkToList');

    var sheets = [];
    var spreadsheetId, okButton, h2, hr, csvLink;
    const csvButton = document.createElement('button');
    const refreshBtn = document.createElement('button');

    var divWithListImportSettigs = document.createElement('div');
    addListForm.lastElementChild.insertBefore(
        divWithListImportSettigs,
        wordsContainer
    );
    /* Не нужно
    googleListBtn.addEventListener("click", function () {  
        window.location.href = `changeSheets.html?listId=${listId}`;
    });
    */
    var toList = document.createElement('button');
    toList.type = 'button';

    var wordsToList = document.createElement('button');
    wordsToList.type = 'button';

    var listBox, rangeEndInput, rangeStartInput;

    /* Не нужно
  linkToListBtn.addEventListener("click", function () {
    divWithListImportSettigs.innerHTML = "";

    var csvh2 = document.createElement("h2");
    csvh2.textContent = "Google Sheets assistant";
    csvh2.style.textAlign = "left";
    csvh2.style.marginLeft = "18%";

    var csvp = document.createElement("p");
    csvp.innerHTML = `<p>          
      1. Access settings.<br>
      2. Under “General access” click the Down arrow.<br>
      3. Choose Anyone with the link.<br>
      4. Copy the URL.         
    </p>`;
    csvp.style.textAlign = "left";
    csvp.style.marginLeft = "14%";

    divWithListImportSettigs.appendChild(csvh2);
    divWithListImportSettigs.appendChild(csvp);

    var linkInput = document.createElement("input");
    linkInput.type = "text";
    linkInput.id = "linkInput";
    linkInput.placeholder = "Paste the link";

    okButton = document.createElement("button");
    okButton.type = "button";
    okButton.innerHTML = '<i class="fa fa-search" aria-hidden="true"></i>';

    okButton.addEventListener("click", function () {
      if (linkInput.value.trim()!== "") {
        fetchListsAndAddToListbox(linkInput.value);
        linkInput.value = "";
  
        hr = document.createElement("hr");
  
        h2 = document.createElement("h2");
        h2.textContent = "Add words from:"
  
        listBox = document.createElement("select");
        listBox.id = "listbox";
  
        toList.id = "toList";
        toList.innerHTML = '<i class="fa fa-search"></i>';
  
        wordsToList.id = "wordsToList";
        wordsToList.textContent = "All document";
  
        const divRange = document.createElement("div");
        divRange.id = "divRange";
  
        rangeStartInput = document.createElement("input");
        rangeStartInput.type = "text";
        rangeStartInput.id = "rangeStart";
        rangeStartInput.placeholder = "A1";
  
        rangeEndInput = document.createElement("input");
        rangeEndInput.type = "text";
        rangeEndInput.id = "rangeEnd";
        rangeEndInput.placeholder = "B2";
  
        divWithListImportSettigs.appendChild(hr);
        divWithListImportSettigs.appendChild(h2);
  
        divRange.appendChild(listBox);
        divRange.appendChild(rangeStartInput);
        divRange.appendChild(rangeEndInput);
        divRange.appendChild(toList);
        divWithListImportSettigs.appendChild(divRange);
        
        divWithListImportSettigs.appendChild(wordsToList);

        okButton.disabled = true;
      } else {
        alert("Please enter link");
      }
      
    });

    divWithListImportSettigs.appendChild(linkInput);
    divWithListImportSettigs.appendChild(okButton);
  });
*/
    toList.addEventListener('click', function () {
        okButton.disabled = false;

        var selectedSheetName = listBox.options[listBox.selectedIndex].value;

        if (selectedSheetName) {
            const rangeStart = document.getElementById('rangeStart').value;
            const rangeEnd = document.getElementById('rangeEnd').value;

            let range = selectedSheetName;

            if (rangeStart && rangeEnd) {
                range += `!${rangeStart}:${rangeEnd}`;
            }

            fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
                    range
                )}?key=${apiKey}`
            )
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(
                            `Network response was not ok: ${response.statusText}`
                        );
                    }
                    return response.json();
                })
                .then((data) => {
                    const sheetWords = data.values.flat();

                    sheetWords.forEach((word) => {
                        addWord(word.trim());
                    });
                    divWithListImportSettigs.removeChild(divRange);
                    divWithListImportSettigs.removeChild(h2);
                    divWithListImportSettigs.removeChild(hr);
                    divWithListImportSettigs.removeChild(wordsToList);
                })
                .catch((error) =>
                    console.error(`Error fetching words from ${range}:`, error)
                );
        } else {
            console.error('No sheet selected.');
        }
    });

    wordsToList.addEventListener('click', function () {
        okButton.disabled = false;
        const allWordsArray = [];

        if (sheets.length > 0) {
            const fetchPromises = sheets.map((sheet) => {
                return fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
                        sheet.properties.title
                    )}?key=${apiKey}`
                )
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(
                                `Network response was not ok: ${response.statusText}`
                            );
                        }
                        return response.json();
                    })
                    .then((data) => {
                        const sheetWords = data.values.flat();
                        allWordsArray.push(...sheetWords);
                        divWithListImportSettigs.removeChild(divRange);
                        divWithListImportSettigs.removeChild(h2);
                        divWithListImportSettigs.removeChild(hr);
                        divWithListImportSettigs.removeChild(wordsToList);
                    })
                    .catch((error) =>
                        console.error(
                            `Error fetching words from ${sheet.properties.title}:`,
                            error
                        )
                    );
            });

            Promise.all(fetchPromises)
                .then(() => {
                    allWordsArray.forEach((word) => {
                        addWord(word.trim());
                    });
                })
                .catch((error) =>
                    console.error('Error during fetching:', error)
                );
        } else {
            console.error('No sheets available.');
        }
    });

    // async function fetchListsAndAddToListbox(url) {
    //   try {
    //     spreadsheetId = getSpreadsheetIdFromUrl(url);

    //     const sheetsResponse = await fetch(
    //       `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`
    //     );

    //     if (!sheetsResponse.ok) {
    //       console.error(
    //         "Error fetching sheets. HTTP Status:",
    //         sheetsResponse.status,
    //         alert("Error while fetching data, please try again."),
    //         divWithListImportSettigs.removeChild(divRange),
    //         divWithListImportSettigs.removeChild(h2),
    //         divWithListImportSettigs.removeChild(hr),
    //         divWithListImportSettigs.removeChild(wordsToList),
    //         okButton.disabled = false,
    //       );
    //       const errorText = await sheetsResponse.text();
    //       console.error("Error details:", errorText);
    //       return;
    //     }

    //     const sheetsData = await sheetsResponse.json();
    //     const sheetsList = sheetsData.sheets;

    //     if (sheetsList && sheetsList.length > 0) {
    //       sheetsList.forEach((sheet) => {
    //         sheets = sheetsData.sheets;

    //         const listBox = document.getElementById("listbox");
    //         const option = document.createElement("option");
    //         option.value = sheet.properties.title;
    //         option.text = sheet.properties.title;
    //         listBox.add(option);
    //       });
    //     } else {
    //       console.error("No sheets found.");
    //     }
    //   } catch (error) {
    //     console.error("Error fetching sheets:", error);
    //   }
    // }

    csvListBtn.addEventListener('click', function () {
        divWithListImportSettigs.innerHTML = '';

        var csvInput = document.createElement('input');
        csvInput.type = 'text';
        csvInput.id = 'textInput';
        csvInput.placeholder = 'Paste the link';

        // csvButton = document.createElement('button');
        csvButton.innerHTML = '<i class="fa fa-search" aria-hidden="true"></i>';
        csvButton.type = 'button';

        csvButton.addEventListener('click', function () {
            if (csvInput.value.trim() !== '') {
                csvLink = csvInput.value.replace('/edit', '/export?format=csv');
                chrome.storage.local.set({ dataURL: csvLink });
                fetchDataAndProcessWords(csvLink);

                csvInput.value = '';
            } else {
                alert('Please enter link');
            }
        });

        var csvh2 = document.createElement('h2');
        csvh2.textContent = 'Google Sheets assistant';
        csvh2.style.textAlign = 'left';
        csvh2.style.marginLeft = '18%';

        var csvp = document.createElement('p');
        csvp.innerHTML = `<p>          
            1. File > Share > Publish to web.<br>
            2. Click Publish.<br>
            3. Choose format csv.<br>
            4. Copy the URL.          
        </p>`;
        csvp.style.textAlign = 'left';
        csvp.style.marginLeft = '14%';

        divWithListImportSettigs.appendChild(csvh2);
        divWithListImportSettigs.appendChild(csvp);
        divWithListImportSettigs.appendChild(csvInput);
        divWithListImportSettigs.appendChild(csvButton);

        refreshBtn.type = 'button';
        refreshBtn.className = 'listFormBtn';
        refreshBtn.innerHTML =
            '<i class="fa fa-refresh" aria-hidden="true"></i>';
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

        divWithListImportSettigs.appendChild(refreshBtn);
    });

    async function fetchDataAndProcessWords(url) {
        try {
            const response = await fetch(url);
            const csvData = await response.text();

            const rows = csvData.split('\n');
            const wordsArray = rows.reduce((words, row) => {
                const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                const wordsInRow = columns.map((cell) =>
                    cell.trim().replace(/"/g, '')
                );
                return words.concat(wordsInRow.filter((word) => word !== ''));
            }, []);

            wordsArray.forEach((word) => {
                addWord(word.trim());
            });
        } catch (error) {
            console.error('Error while retrieving data:', error);
            alert('Error while retrieving data, please try again.');
        }
    }

    // function getSpreadsheetIdFromUrl(url) {
    //   const regex = /\/spreadsheets\/d\/(.+?)\//;
    //   const match = url.match(regex);
    //   return match && match[1] ? match[1] : null;
    // }

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

    // Tooltips

    const tooltipButtons = [
        csvListBtn,
        fileListBtn,
        cancelBtn,
        addWordBtn,
        csvButton,
        refreshBtn,
    ];
    const tooltipsText = [
        'Import Google Sheets',
        'Import file',
        'Go back',
        'Add new list',
        'Search',
        'Synchronize list',
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
                const tooltipY = rect.bottom + window.pageYOffset + 5;

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
