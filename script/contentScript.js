if (!window.hasRun) {
    var highlightColorRestore, submenuContainer, submenuIsActive;
    let selectedValue = '';
    window.hasRun = true;

    // Внедрение CSS файла
    const iconsLink = document.createElement('link');
    iconsLink.rel = 'stylesheet';
    iconsLink.href =
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';

    const webPageCss = document.createElement('style');
    webPageCss.textContent = `
    .exa-radience-submenu {
        height: 120px;
        width: 240px;
        background-color: #FC0365;
        color: white;
        border: 1px solid white;
        border-radius: 5px;
        font-family: 'Roboto', sans-serif !important;
        font-size: 15px !important;
        text-align: center;
        position: absolute;
    }

    .exa-radience-submenu button {
        cursor: pointer;
        padding: 8px 12px;
        margin: 3px;
        color: white;
        background-color: #FC0365;
        border-color: white;
        border-radius: 5px;
    }

    .exa-radience-submenu #removeStatusBtn {
        border: none;
        padding: 2px;
    }

    .exa-radience-statuses-container {
        background-color: white;
        width: 200px;
        overflow-y: auto;
        height: 50px;
        margin-left: 20px;
        margin-top: 10px;
    }

    .exa-radience-statuses-container-item {
        cursor: pointer;
        background-color: #FD68A4;
        border: 1px solid white;
        border-radius: 5px;
        /*margin: 10px;*/
        padding: 8px 12px;
    }

    .exa-radience-submenu button:hover {
        background-color: #FD68A4;
    }

    .exa-radience-statuses-container-item:hover {
        background-color: #FC0365;
    }
    `;

    document.head.appendChild(iconsLink);
    document.head.appendChild(webPageCss);
    document.addEventListener('mouseover', showSubmenus);

    function showSubmenus(event) {
        const target = event.target;
        if (target.classList.contains('highlighted')) {
            createSubmenu(target);
            if (submenuIsActive === false) {
                submenuContainer.style.display = 'none';
            } else {
                submenuContainer.style.display = 'block';
            }
        }
    }

    async function getBooleanFromLocalStorage() {
        const result = await new Promise((resolve, reject) => {
            chrome.storage.local.get('submenuIsActive', (result) => {
                resolve(result);
            });
        });
        submenuIsActive = result.submenuIsActive || false;
    }
    getBooleanFromLocalStorage();

    function createSubmenu(element) {
        if (!submenuContainer) {
            submenuContainer = document.createElement('div');
            submenuContainer.id = 'submenu';
            submenuContainer.className = 'exa-radience-submenu';
            document.body.appendChild(submenuContainer);
        }

        submenuContainer.innerHTML = '';

        // Скриншот
        const captureScreenshotBtn = document.createElement('button');
        captureScreenshotBtn.id = 'captureScreenshotBtn';
        captureScreenshotBtn.innerHTML =
            '<i class="fa-2x fa fa-camera-retro" aria-hidden="true"></i>';
        captureScreenshotBtn.onclick = function () {
            document.removeEventListener('mouseover', showSubmenus);
            captureScreenshot(element);
        };

        // Заметка
        const addNoteBtn = document.createElement('button');
        addNoteBtn.id = 'addNoteBtn';
        addNoteBtn.innerHTML =
            '<i class="fa-2x fa fa-file-text-o" aria-hidden="true"></i>';
        addNoteBtn.onclick = function () {
            addNoteToElement(element);
        };

        // // Добавить статус
        // const addStatusBtn = document.createElement('button');
        // addStatusBtn.id = 'addStatusBtn';
        // addStatusBtn.innerHTML = 'Attach Status';
        // addStatusBtn.onclick = function () {
        //     changeWordStatus(element);
        // };

        // Убрать статус
        const removeStatusBtn = document.createElement('button');
        removeStatusBtn.id = 'removeStatusBtn';
        removeStatusBtn.innerHTML =
            '<i class="fa-2x fa fa-trash-o" aria-hidden="true"></i>';
        removeStatusBtn.onclick = function () {
            removeWordsStatus(element);
        };

        // Отображение статусов
        var lineDiv = document.createElement('div');
        lineDiv.style.display = 'flex';
        lineDiv.style.flexDirection = 'row';

        var statusesContainer = document.createElement('div');
        statusesContainer.className = 'exa-radience-statuses-container';

        chrome.storage.local.get('customStatuses', function (result) {
            const customStatuses = result.customStatuses || [];
            customStatuses.forEach((status) => {
                const div = document.createElement('div');
                div.className = 'exa-radience-statuses-container-item';
                div.textContent = status;
                div.onclick = function () {
                    selectedValue = status;
                    changeWordStatus(element);
                    div.style.backgroundColor = '#3B1269';
                };
                statusesContainer.appendChild(div);
            });
        });

        submenuContainer.appendChild(addNoteBtn);
        submenuContainer.appendChild(captureScreenshotBtn);
        // submenuContainer.appendChild(addStatusBtn);
        submenuContainer.appendChild(lineDiv);

        lineDiv.appendChild(statusesContainer);
        lineDiv.appendChild(removeStatusBtn);

        submenuContainer.style.left = `${
            element.getBoundingClientRect().left
        }px`;
        submenuContainer.style.top = `${
            element.getBoundingClientRect().top + window.scrollY + 30
        }px`;

        submenuContainer.onmouseleave = function () {
            submenuContainer.style.display = 'none';
        };
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function changeWordStatus(element) {
        const listId = element.getAttribute('data-list-id');

        document.querySelectorAll('.highlighted').forEach((el) => {
            if (
                el.innerHTML.toLowerCase() === element.innerHTML.toLowerCase()
            ) {
                el.style.backgroundColor = highlightColorRestore;

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
    }

    async function removeWordsStatus(element) {
        const listId = element.getAttribute('data-list-id');

        document.querySelectorAll('.highlighted').forEach((el) => {
            if (
                el.innerHTML.toLowerCase() === element.innerHTML.toLowerCase()
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
                });
                //}
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
        submenuContainer.style.display = 'none';
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
            document.addEventListener('mouseover', showSubmenus);
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
        console.log(JSON.stringify(data));
    }

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
                        const isValid = statusesLists.includes(status);

                        // const isWordFound = foundWord && foundWord['status'] === 'Found';
                        const colorStyle = isValid
                            ? `background-color: ${highlightColorRestore}; border: 4px solid ${highlightColor};`
                            : `border: 4px solid ${highlightColor};`;
                        if (node.parentNode.className !== 'highlighted') {
                            let replacementText = `<span class="highlighted" style="${colorStyle}">$&</span>`;
                            let newNode = document.createElement('span');
                            newNode.className = 'highlightedP';
                            if (listId) {
                                replacementText = `<span class="highlighted" data-list-id="${listId}" style="${colorStyle}">$&</span>`;
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
        } else if (request.action === 'submenuStatusUpdating') {
            getBooleanFromLocalStorage();
        } else if (request.action === 'cssInjection') {
            const style = document.createElement('style');
            style.textContent =
                'div { background-image: url("https://i.pinimg.com/originals/c4/2f/05/c42f0562ba5868acab46f6a1b6aaa303.gif");}';

            // Добавляем стиль в <head> элемент страницы
            document.head.appendChild(style);
        }
    });
}
