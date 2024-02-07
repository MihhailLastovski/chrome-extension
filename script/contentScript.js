    if (!window.hasRun) {
        var highlightColorRestore;
        window.hasRun = true;

        let submenuContainer;

        const colorMappings = {
            '#b3ff99': '#ecffe6',
            cyan: '#b3ffff',
            yellow: '#ffffb3',
            pink: '#ffe6ea',
            blueviolet: '#cda5f3',
        };

        function createSubmenu(element) {
            if (!submenuContainer) {
                submenuContainer = document.createElement('div');
                submenuContainer.className = 'submenu-container';
                document.body.appendChild(submenuContainer);
            }

            submenuContainer.innerHTML = '';

            const captureScreenshotBtn = document.createElement('button');
            captureScreenshotBtn.id = 'captureScreenshotBtn';
            captureScreenshotBtn.innerHTML = 'Capture Screenshot';
            captureScreenshotBtn.onclick = function () {
                captureScreenshot(element);
            };

            const addNoteBtn = document.createElement('button');
            addNoteBtn.id = 'addNoteBtn';
            addNoteBtn.innerHTML = 'Add Note';
            addNoteBtn.onclick = function () {
                addNoteToElement(element);
            };

            submenuContainer.appendChild(captureScreenshotBtn);
            submenuContainer.appendChild(addNoteBtn);
            const foundBtn = document.createElement('button');
            foundBtn.id = 'foundBtn';
            foundBtn.innerHTML = 'Word founded';
            foundBtn.onclick = function () {
                changeWordStatus(element);
            };

            const dropdown = document.createElement('select');
            dropdown.id = 'statusDropdown';

            // Retrieve statuses from local storage and populate the dropdown
            chrome.storage.local.get('customStatuses', function (result) {
                const customStatuses = result.customStatuses || [];
                customStatuses.forEach(status => {
                    const option = document.createElement('option');
                    option.value = status;
                    option.text = status;
                    dropdown.appendChild(option);
                });
            });

            submenuContainer.appendChild(foundBtn);
            submenuContainer.appendChild(dropdown);
            submenuContainer.appendChild(captureScreenshotBtn);

            // Дизайн кнопок на внешней странице
            const buttonStyles = {
                cursor: 'pointer',
                padding: '8px 12px',
                backgroundColor: '#b3ff99',
                borderRadius: '5px',
            };
            for (const childElement of submenuContainer.children) {
                Object.assign(childElement.style, buttonStyles);
            }

            submenuContainer.style.position = 'absolute';
            submenuContainer.style.left = `${
                element.getBoundingClientRect().left
            }px`;
            submenuContainer.style.top = `${
                element.getBoundingClientRect().top + window.scrollY + 30
            }px`;

            submenuContainer.onmouseleave = function () {
                submenuContainer.style.display = 'none';
                captureScreenshotBtn.style.display = 'none';
                addNoteBtn.style.display = 'none';
                foundBtn.style.display = 'none';
            };
            submenuContainer.style.display = 'block';
        }

        function sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }


        //var selectedStatus;
        async function changeWordStatus(element) {
            const listId = element.getAttribute('data-list-id');
            const selectedStatus = document.getElementById('statusDropdown').value

            document.querySelectorAll('.highlighted').forEach((el) => {
                if (
                    el.innerHTML.toLowerCase() === element.innerHTML.toLowerCase()
                ) {
                    if (el.hasAttribute('status')) {
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
                                            //wordObj['status'] = 'Found';
                                            delete wordObj['status'];
                                        }
                                    });
                                }
                                return wordList;
                            });
                            chrome.storage.local.set({
                                wordLists: updatedWordLists,
                            });
                        });
                    } else {
                        // const colorMappings = {
                        //     '#b3ff99': '#ecffe6',
                        //     cyan: '#b3ffff',
                        //     yellow: '#ffffb3',
                        //     pink: '#ffe6ea',
                        //     blueviolet: '#cda5f3',
                        // };

                        el.style.backgroundColor =
                            colorMappings[highlightColorRestore] ||
                            highlightColorRestore;

                        el.setAttribute('status', selectedStatus);
                        chrome.storage.local.get('wordLists', (result) => {
                            const wordLists = result.wordLists || [];

                            const updatedWordLists = wordLists.map((wordList) => {
                                if (wordList.words && wordList.id === listId) {
                                    wordList.words.forEach((wordObj) => {
                                        if (
                                            wordObj.word.trim().toLowerCase() ===
                                            el.innerHTML.toLowerCase()
                                        ) {
                                            wordObj['status'] = selectedStatus;
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
                }
            });
        }

        async function captureScreenshot(element) {
            document.querySelectorAll('.highlighted').forEach((el) => {
                if (el !== element) {
                    el.style.borderColor = 'transparent';
                    el.style.backgroundColor = 'transparent';
                }
            });

            const listId = element.getAttribute('data-list-id');
            captureScreenshotBtn.style.display = 'none';
            addNoteBtn.style.display = 'none';
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
                captureScreenshotBtn.style.display = 'block';
                addNoteBtn.style.display = 'block';
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
                            return wordObj.word.trim() !== textContentToRemove;
                        });
                    }
                    return wordList;
                });

                chrome.storage.local.set({ wordLists: updatedWordLists });
            });
        }

        function restoreHighlight(element) {
            document.querySelectorAll('.highlighted').forEach((el) => {
                if (el.style.borderColor === 'transparent') {
                    el.style.borderColor = `${highlightColorRestore}`;
                }
                if (el === element) {
                    el.style.borderColor = 'transparent';
                    el.style.backgroundColor = 'transparent';
                }
            });
        }

        function addNoteToElement(element) {
            const note = prompt('Enter your note:');
        
            const data = {
                action: 'addNoteToElement',
                note: note,
                textContent: element.textContent,
            };
        
            console.log('Sending data:', data);
        
            fetch(
                'https://script.google.com/macros/s/AKfycbxB72J3slVLg1JU8UOIstzN1qgzL09YG1rHDSABJMJHR3B634PPrezYIZtWUz-DlNC1/exec',
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
            console.log(JSON.stringify(data))

        }
        

        /* appscript
            var SPREADSHEET_ID = '16FHitkvTh76ykBZpjPEGhLhMH2yIzq2X3CuII490MMk';
var sheetName = 'zxc'
function addNoteToElement(note, textContent) {
  try {
    // Открываем таблицу
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheetByName(sheetName);

    // Приводим textContent к нижнему регистру и удаляем пробелы
    var cleanedTextContent = textContent.toLowerCase().trim();

    // Получаем все данные в виде 2D массива
    var data = sheet.getDataRange().getValues();

    // Ищем ячейку с полным совпадением значения
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].length; j++) {
        var cellValue = String(data[i][j]).toLowerCase().trim();
        Logger.log('Comparing:', cellValue, 'with', cleanedTextContent);

        // Используем регулярное выражение для точного совпадения по слову
        var regex = new RegExp("(^|\\s)" + cleanedTextContent + "($|\\s)", "g");

        if (cellValue.match(regex)) {
          // Нашли значение, добавляем заметку
          var cell = sheet.getRange(i + 1, j + 1);
          cell.setNote(note);
          Logger.log('Note added successfully.');
          return;
        }
      }
    }

    // Если значение не найдено
    Logger.log('Value not found in the table:', cleanedTextContent);

  } catch (error) {
    Logger.log('Error adding note:', error);
  }
}



function doGet(req) {
  try {
    // Получаем активную таблицу
    var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Получаем все данные в виде 2D массива
    var data = activeSheet.getDataRange().getValues();

    // Преобразуем данные в JSON
    var jsonData = [];

    for (var i = 0; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < data[i].length; j++) {
        row['col' + (j + 1)] = data[i][j];
      }
      jsonData.push(row);
    }

    Logger.log('JSON data retrieved successfully:', jsonData);

    // Возвращаем JSON
    return ContentService.createTextOutput(
      JSON.stringify(jsonData)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error in doGet:', error);
    return ContentService.createTextOutput('Error in doGet.').setStatusCode(500);
  }
}

function doPost(e) {
    try {
        // Получаем данные из запроса
        var requestData = JSON.parse(e.postData.contents);
         console.log('Received request data:', e.postData.contents);

        // Проверяем, какое действие нужно выполнить
        if (requestData.action === 'addNoteToElement') {
            // Вызываем функцию добавления заметки
            addNoteToElement(requestData.note, requestData.textContent);

            Logger.log('Note added via doPost:', requestData.note);

            // Возвращаем успешный ответ
            return ContentService.createTextOutput(
                'Заметка успешно добавлена в таблицу.'
            ).setMimeType(ContentService.MimeType.TEXT);
        } else {
          var spreadsheet = 
          SpreadsheetApp.openById(SPREADSHEET_ID);
            var sheet = spreadsheet.getSheetByName(sheetName);

            // Define from which line to start data insertion
            var startRow = sheet.getLastRow() + 1;

            // Inserting data into the table
            for (var i = 0; i < requestData.length; i++) {
              var rowData = Object.values(requestData[i]);
              sheet.getRange(startRow + i, 1, 1, rowData.length)
                .setValues([rowData]);
            }
        }

        
    } catch (error) {
        console.error('Error in doPost:', error);
        return ContentService.createTextOutput('Error in doPost: ' + error.message).setStatusCode(500);
    }
}


        */

        document.addEventListener('mouseover', function (event) {
            const target = event.target;
            if (target.classList.contains('highlighted')) {
                createSubmenu(target);
                submenuContainer.style.display = 'block';
            }
        });

        async function highlightText(searchText, highlightColor, listId = null) {
            highlightColorRestore = highlightColor;
            const resultOld = await new Promise((resolve, reject) => {
                chrome.storage.local.get('isActive', (result) => {
                    resolve(result);
                });
            });
            const boolActive = resultOld.isActive;

            const result = await new Promise((resolve) => {
                chrome.storage.local.get('wordLists', (data) => {
                    resolve(data);
                });
            });
            const wordLists = result.wordLists || [];

            const statusesResult = await new Promise((resolve) => {
                chrome.storage.local.get('customStatuses', (data) => {
                    resolve(data);
                });
            });
            const statusesLists = statusesResult.customStatuses || [];

            function findWordInWordLists(word) {
                for (const wordList of wordLists) {
                    if (wordList.words && wordList.id === listId) {
                        const foundWord = wordList.words.find(
                            (wordObj) =>
                                wordObj.word.trim().toLowerCase() ===
                                word.toLowerCase()
                        );
                        if (foundWord) {
                            return foundWord;
                        }
                    }
                }
                return null;
            }

            if (boolActive && searchText !== '') {
                const searchRegex = new RegExp(searchText, 'gi');
                function highlightTextNode(node) {
                    let text = node.nodeValue;
                    if (
                        node.nodeType === Node.TEXT_NODE &&
                        !isDescendantOfStyleOrScript(node)
                    ) {
                        if (searchRegex.test(text)) {
                            const foundWord = findWordInWordLists(searchText);
                            const status = foundWord.status;
                            /*
                            console.log(foundWord, status);
                            console.log(statusesLists);
                            */
                            const isValid = statusesLists.includes(status);
                            /*const isWordFound =
                                console.log(status)
                                foundWord && foundWord['status'] === status;*/
                            const colorStyle = isValid
                                ? `background-color: ${
                                    colorMappings[highlightColorRestore] ||
                                    highlightColorRestore
                                }; border: 4px solid ${highlightColor};`
                                : `border: 4px solid ${highlightColor};`;
                            if (node.parentNode.className !== 'highlighted') {
                                let replacementText = `<span class="highlighted" style="${colorStyle}" onmouseover="window.showSubmenu(this)">$&</span>`;
                                let newNode = document.createElement('span');
                                newNode.className = 'highlightedP';
                                if (listId) {
                                    replacementText = `<span class="highlighted" data-list-id="${listId}" style="${colorStyle}" onmouseover="window.showSubmenu(this)">$&</span>`;
                                    newNode.setAttribute('data-list-id', listId);
                                }
                                const replacedText = text.replace(
                                    searchRegex,
                                    replacementText
                                );
                                newNode.innerHTML = replacedText;
                                node.parentNode.replaceChild(newNode, node);
                            }
                        }
                    } else if (
                        node.nodeType === Node.ELEMENT_NODE &&
                        node.tagName.toLowerCase() !== 'style' &&
                        node.tagName.toLowerCase() !== 'script' &&
                        node.childNodes &&
                        node.childNodes.length > 0
                    ) {
                        node.childNodes.forEach((childNode) => {
                            highlightTextNode(childNode);
                        });
                    }
                }

                async function isValidStatus(status) {
                    return new Promise((resolve) => {
                        chrome.storage.local.get('customStatuses', (result) => {
                            const customStatuses = result.customStatuses || [];
                            // Check if the status exists in the list of custom statuses
                            const isValid = customStatuses.includes(status);
                            resolve(isValid);
                        });
                    });
                }

                // Проверка, является ли узел потомком элемента style или script
                function isDescendantOfStyleOrScript(node) {
                    while (node.parentNode) {
                        node = node.parentNode;
                        if (
                            node.tagName &&
                            (node.tagName.toLowerCase() === 'style' ||
                                node.tagName.toLowerCase() === 'script')
                        ) {
                            return true;
                        }
                    }
                    return false;
                }

                highlightTextNode(document.body);
            }
            let highlightedCount =
                document.querySelectorAll('span.highlighted').length;
            chrome.storage.local.set({ count: highlightedCount });
            chrome.runtime.sendMessage({
                action: 'updateBadge',
                count: highlightedCount,
            });
        }

        chrome.runtime.onMessage.addListener(function (
            request,
            sender,
            sendResponse
        ) {
            if (request.action === 'highlight') {
                highlightText(
                    request.searchText,
                    request.highlightColor,
                    request.listId,
                    request.isActive
                );
            } else if (request.action === 'removeHighlight') {
                const listId = request.listId;
                if (listId) {
                    document
                        .querySelectorAll(
                            `span[data-list-id="${listId}"].highlighted, span[data-list-id="${listId}"].highlighted`
                        )
                        .forEach((element) => {
                            const { textContent } = element;
                            element.outerHTML = textContent;
                        });
                    document
                        .querySelectorAll(
                            `span[data-list-id="${listId}"].highlighted, span[data-list-id="${listId}"].highlightedP`
                        )
                        .forEach((element) => {
                            const { textContent } = element;
                            element.outerHTML = textContent;
                        });
                } else {
                    document
                        .querySelectorAll('span.highlighted')
                        .forEach((element) => {
                            const { textContent } = element;
                            element.outerHTML = textContent;
                        });
                    document
                        .querySelectorAll('span.highlightedP')
                        .forEach((element) => {
                            const { textContent } = element;
                            element.outerHTML = textContent;
                        });
                }
            }
        });
    }
