if (!window.hasRun) {
    var highlightColorRestore;
    window.hasRun = true;

    let submenuContainer;

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
        };

        submenuContainer.style.display = 'block';
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function captureScreenshot(element) {
        document.querySelectorAll('.highlighted').forEach((el) => {
            if (el !== element) {
                el.style.borderColor = 'transparent';
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
            }
        });
    }

    function addNoteToElement(element) {
        const note = prompt('Enter your note:');

        fetch(
            'https://script.google.com/macros/s/AKfycbyb9Lo2orVJ9UrILwN0BKgHhOQ1pBI1WDWWAZYCXSETR7hpR8OByQGN9Wh6GyuX5LS4/exec',
            {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'addNoteToElement',
                    note: note,
                }),
            }
        )
            .then((response) => response.text())
            .then((result) => {
                console.log(result);
                // Добавить вызов функции отправки заметки в Google Sheets
                sendNoteToGoogleSheets(note);
            })
            .catch((error) =>
                console.error('Ошибка при отправке заметки:', error)
            );
    }
    function sendNoteToGoogleSheets(note) {
        chrome.runtime.sendMessage(
            { action: 'sendNoteToGoogleSheets', note: note },
            (response) => {
                console.log(response);
            }
        );
    }

    /* appscript
    


    var SPREADSHEET_ID = '16FHitkvTh76ykBZpjPEGhLhMH2yIzq2X3CuII490MMk';

function addNoteToElement(note) {
  try {
    // Идентификатор вашей таблицы (замените на свой)
    
    // Имя вашего листа (замените на свое)
    var sheetName = 'zxc';

    // Открываем таблицу
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheetByName(sheetName);

    // Получаем активную ячейку в выделенном элементе
    var activeCell = sheet.getActiveCell();

    // Присваиваем значение заметки

    // Добавляем заметку в ячейку
    activeCell.setNote(note);

    // Дополнительно логируем значение заметки
    Logger.log('Note added successfully:', note);

  } catch (error) {
    Logger.log('Error adding note:', error);
  }
}



// Добавьте эту функцию для принятия данных из fetch
function doAddNoteToElement(requestData) {
  try {
    var note = requestData.note;
    addNoteToElement(note);
  } catch (error) {
    Logger.log('Error in doAddNoteToElement:', error);
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

    // Проверяем, какое действие нужно выполнить
    if (requestData.action === 'addNoteToElement') {
      // Вызываем функцию добавления заметки
      addNoteToElement(requestData.note);

      Logger.log('Note added via doPost:', requestData.note);

      // Возвращаем успешный ответ
      return ContentService.createTextOutput(
        'Заметка успешно добавлена в таблицу.'
      ).setMimeType(ContentService.MimeType.TEXT);
    }

    // Если неизвестное действие, возвращаем ошибку
    Logger.log('Unknown action in doPost:', requestData.action);
    return ContentService.createTextOutput('Неизвестное действие.').setStatusCode(400);
  } catch (error) {
    Logger.log('Error in doPost:', error);
    return ContentService.createTextOutput('Error in doPost.').setStatusCode(500);
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

        if (boolActive && searchText !== '') {
            const searchRegex = new RegExp(searchText, 'gi');
            const colorStyle = `border: 4px solid ${highlightColor};`;

            function highlightTextNode(node) {
                if (
                    node.nodeType === Node.TEXT_NODE &&
                    !isDescendantOfStyleOrScript(node)
                ) {
                    let text = node.nodeValue;
                    if (searchRegex.test(text)) {
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
        } else if (request.action === 'captureScreenshot') {
            chrome.runtime.sendMessage({ action: 'captureScreenshot' });
        }
    });
}
