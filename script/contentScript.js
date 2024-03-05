if (!window.hasRun) {
    var highlightColorRestore, submenuContainer, submenuIsActive;
    let selectedValue = '';
    window.hasRun = true;

    // Внедрение CSS файла
    const iconsLink = document.createElement('link');
    iconsLink.rel = 'stylesheet';
    iconsLink.href =
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
    document.head.appendChild(iconsLink);

    async function getBooleanFromLocalStorage() {
        const result = await new Promise((resolve, reject) => {
            chrome.storage.local.get('submenuIsActive', (result) => {
                resolve(result);
            });
        });
        submenuIsActive = result.submenuIsActive || false;
    }
    getBooleanFromLocalStorage();
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'highlight') {
        highlightText(
            request.searchText,
            request.highlightColor,
            request.listId
        );

        async function highlightText(
            searchText,
            highlightColor,
            listId = null
        ) {
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
                    if (
                        node.nodeType === Node.TEXT_NODE &&
                        !isDescendantOfStyleOrScript(node)
                    ) {
                        const text = node.nodeValue;
                        if (searchRegex.test(text)) {
                            const foundWord = findWordInWordLists(searchText);
                            const isValid = foundWord && statusesLists.includes(
                                foundWord.status
                            );
                            const colorStyle = isValid
                                ? `background-color: ${highlightColor}; border: 4px solid ${highlightColor};`
                                : `border: 4px solid ${highlightColor};`;

                            if (node.parentNode.className !== 'highlighted') {
                                const wrapper = document.createElement('span');
                                wrapper.className = 'highlightedP';
                                wrapper.setAttribute('data-list-id', listId);

                                let lastIndex = 0;
                                let match;

                                searchRegex.lastIndex = 0;
                                while (
                                    (match = searchRegex.exec(text)) !== null
                                ) {
                                    const beforeMatch = text.substring(
                                        lastIndex,
                                        match.index
                                    );

                                    wrapper.appendChild(
                                        document.createTextNode(beforeMatch)
                                    );

                                    const matchedText =
                                        document.createElement('span');
                                    matchedText.className = 'highlighted';
                                    matchedText.style.cssText = colorStyle;
                                    matchedText.textContent = match[0];
                                    if (listId) {
                                        matchedText.dataset.listId = listId;
                                    }
                                    wrapper.appendChild(matchedText);
                                    lastIndex = match.index + match[0].length;
                                }

                                wrapper.appendChild(
                                    document.createTextNode(
                                        text.substring(lastIndex)
                                    )
                                );

                                node.parentNode.replaceChild(wrapper, node);
                            }
                        }
                    } else if (
                        node.nodeType === Node.ELEMENT_NODE &&
                        !['style', 'script'].includes(
                            node.tagName.toLowerCase()
                        ) &&
                        node.childNodes &&
                        node.childNodes.length > 0
                    ) {
                        node.childNodes.forEach((childNode) =>
                            highlightTextNode(childNode)
                        );
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
            // Отображение счётчика
            chrome.runtime.sendMessage({
                action: 'updateBadge',
                count: document.querySelectorAll('span.highlighted').length,
            });
        }
    } else if (request.action === 'removeHighlight') {
        const listId = request.listId;
        if (listId) {
            document
                .querySelectorAll(`span[data-list-id="${listId}"].highlighted`)
                .forEach((element) => {
                    const { textContent } = element;
                    element.outerHTML = textContent;
                });
            document
                .querySelectorAll(`span[data-list-id="${listId}"].highlightedP`)
                .forEach((element) => {
                    const { textContent } = element;
                    element.outerHTML = textContent;
                });
        } else {
            document.querySelectorAll('span.highlighted').forEach((element) => {
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
    }
});
