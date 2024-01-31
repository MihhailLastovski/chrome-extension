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

        const foundBtn = document.createElement('button');
        foundBtn.id = 'foundBtn';
        foundBtn.innerHTML = 'Word founded';
        foundBtn.onclick = function () {
            changeWordStatus(element);
        };

        submenuContainer.appendChild(foundBtn);
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
            captureScreenshotBtn.style.display = 'none';
            foundBtn.style.display = 'none';
        };
        submenuContainer.style.display = 'block';
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
                el.style.backgroundColor = 'red';
                //el.setAttribute('Status', 'found');
                chrome.storage.local.get('wordLists', (result) => {
                    const wordLists = result.wordLists || [];

                    const updatedWordLists = wordLists.map((wordList) => {
                        if (wordList.words && wordList.id === listId) {
                            wordList.words.forEach((wordObj) => {
                                if (
                                    wordObj.word.trim().toLowerCase() ===
                                    el.innerHTML.toLowerCase()
                                ) {
                                    wordObj['status'] = 'Located';
                                }
                            });
                        }
                        return wordList;
                    });
                    chrome.storage.local.set({ wordLists: updatedWordLists });
                });
            }
        });
    }

    async function captureScreenshot(element) {
        document.querySelectorAll('.highlighted').forEach((el) => {
            if (el !== element) {
                el.style.borderColor = 'transparent';
            }
        });

        const listId = element.getAttribute('data-list-id');

        captureScreenshotBtn.style.display = 'none';

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
        }
    });
}
