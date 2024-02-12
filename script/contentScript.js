if (!window.hasRun) {
    var highlightColorRestore;
    window.hasRun = true;

    let submenuContainer;
    var submenuIsActive;

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

    let selectedValue = '';

    function createSubmenu(element) {
        // if (!submenuContainer) {
        //     submenuContainer = document.createElement('div');
        //     submenuContainer.className = 'submenu-container';
        //     document.body.appendChild(submenuContainer);
        // }

        if (!submenuContainer) {
            submenuContainer = document.createElement('div');
            submenuContainer.id = 'submenu';
            submenuContainer.className = 'submenu-container';
            submenuContainer.style.height = '150px';
            submenuContainer.style.width = '275px';
            submenuContainer.style.backgroundColor = '#3c931f';
            submenuContainer.style.textAlign = 'center';
            submenuContainer.style.border = '1px solid black';
            document.body.appendChild(submenuContainer);
        }

        submenuContainer.innerHTML = '';

        // Внедрение CSS файла
        const iconsLink = document.createElement('link');
        iconsLink.rel = 'stylesheet';
        iconsLink.href =
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
        document.head.appendChild(iconsLink);

        const captureScreenshotBtn = document.createElement('button');
        captureScreenshotBtn.id = 'captureScreenshotBtn';
        captureScreenshotBtn.innerHTML = 'Capture Screenshot';
        captureScreenshotBtn.onclick = function () {
            document.removeEventListener('mouseover', showSubmenus);
            captureScreenshot(element);
        };

        const addNoteBtn = document.createElement('button');
        addNoteBtn.id = 'addNoteBtn';
        addNoteBtn.innerHTML = 'Add Note';
        addNoteBtn.onclick = function () {
            addNoteToElement(element);
        };

        const foundBtn = document.createElement('button');
        foundBtn.id = 'foundBtn';
        foundBtn.innerHTML = 'Attach Status';
        foundBtn.onclick = function () {
            changeWordStatus(element);
        };

        const unfoundBtn = document.createElement('button');
        unfoundBtn.id = 'unfoundBtn';
        unfoundBtn.innerHTML = 'Remove Status';
        unfoundBtn.onclick = function () {
            removeWordsStatus(element);
        };

        const selectContainer = document.createElement('div');
        selectContainer.classList.add('custom-select');
        selectContainer.id = 'statusDropdown';
        selectContainer.style.textAlign = 'center';

        // Create the selected item container
        const selectedContainer = document.createElement('div');
        selectedContainer.classList.add('select-selected');
        selectedContainer.textContent = 'Select Status';
        const selectIcon = document.createElement('i');
        selectIcon.classList.add('fa', 'fa-angle-down');
        selectIcon.setAttribute('aria-hidden', 'true');
        selectIcon.style.float = 'right';
        selectedContainer.appendChild(selectIcon);

        //css
        selectedContainer.style.backgroundColor = '#ccc';
        selectedContainer.style.padding = '10px';
        selectedContainer.addEventListener('mouseenter', function () {
            selectedContainer.style.backgroundColor = '#e6e6e6';
            selectedContainer.style.cursor = 'pointer';
        });

        selectedContainer.addEventListener('mouseleave', function () {
            selectedContainer.style.backgroundColor = '#ccc';
        });

        // Create the dropdown items container
        const itemsContainer = document.createElement('div');
        itemsContainer.classList.add('select-items');
        itemsContainer.classList.add('select-hide');

        //css
        itemsContainer.style.position = 'absolute';
        itemsContainer.style.backgroundColor = '#f1f1f1';
        itemsContainer.style.width = '100%';
        itemsContainer.style.maxHeight = '120px';
        itemsContainer.style.overflowY = 'auto';
        itemsContainer.style.border = '1px solid #ccc';
        itemsContainer.style.display = 'none';

        //populates droplist
        chrome.storage.local.get('customStatuses', function (result) {
            const customStatuses = result.customStatuses || [];
            customStatuses.forEach((status) => {
                const option = document.createElement('div');
                option.textContent = status;
                // css
                option.style.padding = '10px';

                option.addEventListener('mouseenter', function () {
                    option.style.backgroundColor = '#e6e6e6';
                    option.style.cursor = 'pointer';
                });

                option.addEventListener('mouseleave', function () {
                    option.style.backgroundColor = 'inherit';
                });
                //css

                option.addEventListener('click', function () {
                    console.log('Selected:', status);
                    selectedContainer.textContent = status; // Update selected item
                    selectedContainer.appendChild(selectIcon);
                    selectedValue = status;
                    itemsContainer.classList.add('select-hide'); // Hide dropdown
                });
                itemsContainer.appendChild(option);
            });
        });

        // submenuContainer.appendChild(addNoteBtn);
        // submenuContainer.appendChild(foundBtn);
        // submenuContainer.appendChild(captureScreenshotBtn);
        selectContainer.appendChild(foundBtn);
        selectContainer.appendChild(unfoundBtn);
        selectContainer.appendChild(selectedContainer);
        selectContainer.appendChild(itemsContainer);
        selectedContainer.addEventListener('click', function () {
            if (itemsContainer.style.display === 'none') {
                itemsContainer.style.display = 'block'; // Show dropdown
            } else {
                itemsContainer.style.display = 'none'; // Hide dropdown
            }
        });

        submenuContainer.appendChild(addNoteBtn);
        submenuContainer.appendChild(captureScreenshotBtn);
        submenuContainer.appendChild(selectContainer);

        // Дизайн кнопок на внешней странице
        const buttonStyles = {
            cursor: 'pointer',
            padding: '8px 12px',
            backgroundColor: '#b3ff99',
            borderRadius: '5px',
            margin: '3px',
        };
        for (const childElement of submenuContainer.children) {
            Object.assign(childElement.style, buttonStyles);
        }
        for (const childElement of selectContainer.children) {
            if (childElement.tagName.toLowerCase() === 'button') {
                Object.assign(childElement.style, buttonStyles);
            }
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
            // captureScreenshotBtn.style.display = 'none';
            // addNoteBtn.style.display = 'none';
            // foundBtn.style.display = 'none';
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
        //const selectedContainer = document.getElementById('statusDropdown').innerHTML;

        document.querySelectorAll('.highlighted').forEach((el) => {
            if (
                el.innerHTML.toLowerCase() === element.innerHTML.toLowerCase()
            ) {
                //if (el.hasAttribute('status')) {
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
