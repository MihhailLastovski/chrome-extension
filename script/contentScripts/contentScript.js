if (!window.hasRun) {
    var highlightColorRestore,
        submenuContainer,
        submenuIsActive,
        boolActive,
        wordLists,
        statusesList,
        attributesIsActive,
        attributesList,
        selectedValue;
    window.hasRun = true;

    // Внедрение CSS файла
    const iconsLink = document.createElement('link');
    iconsLink.rel = 'stylesheet';
    iconsLink.href =
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
    document.head.appendChild(iconsLink);

    getValuesFromLocalStorage();
}

async function getValuesFromLocalStorage() {
    try {
        const [
            submenuResult,
            boolActiveResult,
            wordListsResult,
            statusesResult,
            attributesResult,
            attributesListResult,
        ] = await Promise.all([
            getFromLocalStorage('submenuIsActive'),
            getFromLocalStorage('isActive'),
            getFromLocalStorage('wordLists'),
            getFromLocalStorage('customStatuses'),
            getFromLocalStorage('attributesIsActive'),
            getFromLocalStorage('customAttributes'),
        ]);

        submenuIsActive = submenuResult.submenuIsActive || false;
        boolActive = boolActiveResult.isActive;
        wordLists = wordListsResult.wordLists || [];
        statusesList = statusesResult.customStatuses || [];
        attributesIsActive = attributesResult.attributesIsActive || false;
        attributesList = attributesListResult.customAttributes || [];
    } catch (error) {
        console.error(
            'Ошибка при получении данных из локального хранилища:',
            error
        );
    }
}

async function getFromLocalStorage(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {
            resolve(result);
        });
    });
}

async function highlightText(searchText, highlightColor, listId = null) {
    highlightColorRestore = highlightColor;
    const searchRegex = new RegExp(searchText, 'gi');

    function findWordInWordLists(word) {
        for (const wordList of wordLists) {
            if (wordList.words && wordList.id === listId) {
                const foundWord = wordList.words.find(
                    (wordObj) =>
                        wordObj.word.trim().toLowerCase() === word.toLowerCase()
                );
                if (foundWord) {
                    return foundWord;
                }
            }
        }
        return null;
    }

    function highlightTextInNode(node) {
        if (
            node.nodeType === Node.TEXT_NODE &&
            !(
                node.parentNode &&
                (node.parentNode.tagName.toLowerCase() === 'style' ||
                    node.parentNode.tagName.toLowerCase() === 'script')
            )
        ) {
            const text = node.nodeValue;
            if (searchRegex.test(text)) {
                const foundWord = findWordInWordLists(searchText);
                const isValid =
                    foundWord && statusesList.includes(foundWord.status);
                const colorStyle = isValid
                    ? `background-color: ${highlightColor}; border: 4px solid ${highlightColor};`
                    : `border: 4px solid ${highlightColor};`;

                if (node.parentNode.className !== 'exa-radience-highlighted') {
                    const wrapper = document.createElement('span');
                    wrapper.className = 'exa-radience-highlightedP';
                    wrapper.setAttribute('data-list-id', listId);

                    let lastIndex = 0;
                    let match;

                    searchRegex.lastIndex = 0;
                    while ((match = searchRegex.exec(text)) !== null) {
                        const beforeMatch = text.substring(
                            lastIndex,
                            match.index
                        );

                        wrapper.appendChild(
                            document.createTextNode(beforeMatch)
                        );

                        const matchedText = document.createElement('span');
                        matchedText.className = 'exa-radience-highlighted';
                        matchedText.style.cssText = colorStyle;
                        matchedText.textContent = match[0];
                        if (listId) {
                            matchedText.dataset.listId = listId;
                        }
                        wrapper.appendChild(matchedText);
                        lastIndex = match.index + match[0].length;
                    }

                    wrapper.appendChild(
                        document.createTextNode(text.substring(lastIndex))
                    );

                    node.parentNode.replaceChild(wrapper, node);
                }
            }
        } else if (
            node.nodeType === Node.ELEMENT_NODE &&
            !['style', 'script'].includes(node.tagName.toLowerCase())
        ) {
            for (const childNode of node.childNodes) {
                highlightTextInNode(childNode);
            }
        }
    }
    function findElementsByText() {
        // Array to store matching elements
        var matchingElements = [];
        // Function to traverse through each element
        function traverseElement(element) {
            // Check if the element has children
            if (element.childNodes.length > 0) {
                // Iterate through child nodes
                for (var i = 0; i < element.childNodes.length; i++) {
                    // Recursively call traverseElement for each child node
                    traverseElement(element.childNodes[i]);
                }
            }

            // Check if the element is a text node and its content matches the target text
            if (
                element.nodeType === Node.TEXT_NODE &&
                searchRegex.test(element.nodeValue.trim())
            ) {
                // Add the parent element to the matching elements array
                matchingElements.push(element.parentNode);
            }
        }

        // Start traversing from document.body
        traverseElement(document.body);

        return matchingElements;
    }

    const allElements = findElementsByText();
    for (let i = 0; i < allElements.length; i++) {
        highlightTextInNode(allElements[i]);
    }
}

async function highlightAttributes(searchText, highlightColor, listId = null) {
    highlightColorRestore = highlightColor;

    function highlightElement(element) {
        var matchedElement = null;

        const attributes = element.attributes;
        for (const attribute of attributes) {
            if (
                attributesList.includes(attribute.name) &&
                attribute.value.toLowerCase() === searchText.toLowerCase()
            ) {
                matchedElement = element;
            }
        }

        if (
            matchedElement &&
            matchedElement.parentNode.className !== 'exa-radience-highlighted'
        ) {
            element.classList.add('exa-radience-highlighted');
            // const foundWord = findWordInWordLists(searchText);
            // const isValid =
            //     foundWord && statusesList.includes(foundWord.status);

            element.style.borderColor = highlightColor;

            if (listId) {
                element.setAttribute('data-list-id', listId);
            }
        }
    }

    const elements = document.querySelectorAll('body *');
    elements.forEach((element) => highlightElement(element));
}

chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
) {
    if (request.action === 'highlight' && boolActive) {
        console.log(request.listId);
        try {
            var searchModeColor;
            if (attributesIsActive) {
                await highlightAttributes(
                    request.searchText,
                    request.highlightColor,
                    request.listId
                );
                searchModeColor = '#3B1269';
            } else {
                await highlightText(
                    request.searchText,
                    request.highlightColor,
                    request.listId
                );
                searchModeColor = '#FC0365';
            }

            // Отображение счётчика
            chrome.runtime.sendMessage({
                action: 'updateBadge',
                count: document.querySelectorAll('.exa-radience-highlighted')
                    .length,
                color: searchModeColor,
            });
        } catch (error) {
            console.error('Ошибка при выделении слова', error);
        }
    } else if (request.action === 'removeHighlight') {
        const listId = request.listId;

        if (attributesIsActive) {
            const elements = listId
                ? document.querySelectorAll(`body [data-list-id="${listId}"]`)
                : document.querySelectorAll('body *');

            elements.forEach((element) => {
                element.classList.remove('exa-radience-highlighted');
                element.removeAttribute('data-list-id');
            });
        } else {
            const selector = listId
                ? `span[data-list-id="${listId}"].exa-radience-highlighted, span[data-list-id="${listId}"].exa-radience-highlightedP`
                : 'span.exa-radience-highlighted, span.exa-radience-highlightedP';

            document.querySelectorAll(selector).forEach((element) => {
                const { textContent } = element;
                element.outerHTML = textContent;
            });
        }
    } else if (request.action === 'valuesStatusUpdating') {
        try {
            await getValuesFromLocalStorage();
        } catch (error) {
            console.error('Ошибка при обновлении данных', error);
        }
    }
});
