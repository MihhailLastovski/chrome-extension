if (!window.hasRun) {
    var highlightColorRestore,
        submenuContainer,
        submenuIsActive,
        boolActive,
        wordLists,
        statusesList;
    let selectedValue = '';
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
        ] = await Promise.all([
            getFromLocalStorage('submenuIsActive'),
            getFromLocalStorage('isActive'),
            getFromLocalStorage('wordLists'),
            getFromLocalStorage('customStatuses'),
        ]);

        submenuIsActive = submenuResult.submenuIsActive || false;
        boolActive = boolActiveResult.isActive;
        wordLists = wordListsResult.wordLists || [];
        statusesList = statusesResult.customStatuses || [];
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

// async function highlightText(searchText, highlightColor, listId = null) {
//     highlightColorRestore = highlightColor;

//     function findWordInWordLists(word) {
//         for (const wordList of wordLists) {
//             if (wordList.words && wordList.id === listId) {
//                 const foundWord = wordList.words.find(
//                     (wordObj) =>
//                         wordObj.word.trim().toLowerCase() === word.toLowerCase()
//                 );
//                 if (foundWord) {
//                     return foundWord;
//                 }
//             }
//         }
//         return null;
//     }

//     if (boolActive && searchText !== '') {
//         const searchRegex = new RegExp(searchText, 'gi');

//         function highlightTextNode(node) {
//             if (
//                 node.nodeType === Node.TEXT_NODE &&
//                 !isDescendantOfStyleOrScript(node)
//             ) {
//                 const text = node.nodeValue;
//                 if (searchRegex.test(text)) {
//                     const foundWord = findWordInWordLists(searchText);
//                     const isValid =
//                         foundWord && statusesList.includes(foundWord.status);
//                     const colorStyle = isValid
//                         ? `background-color: ${highlightColor}; border: 4px solid ${highlightColor};`
//                         : `border: 4px solid ${highlightColor};`;

//                     if (node.parentNode.className !== 'highlighted') {
//                         const wrapper = document.createElement('span');
//                         wrapper.className = 'highlightedP';
//                         wrapper.setAttribute('data-list-id', listId);

//                         let lastIndex = 0;
//                         let match;

//                         searchRegex.lastIndex = 0;
//                         while ((match = searchRegex.exec(text)) !== null) {
//                             const beforeMatch = text.substring(
//                                 lastIndex,
//                                 match.index
//                             );

//                             wrapper.appendChild(
//                                 document.createTextNode(beforeMatch)
//                             );

//                             const matchedText = document.createElement('span');
//                             matchedText.className = 'highlighted';
//                             matchedText.style.cssText = colorStyle;
//                             matchedText.textContent = match[0];
//                             if (listId) {
//                                 matchedText.dataset.listId = listId;
//                             }
//                             wrapper.appendChild(matchedText);
//                             lastIndex = match.index + match[0].length;
//                         }

//                         wrapper.appendChild(
//                             document.createTextNode(text.substring(lastIndex))
//                         );

//                         node.parentNode.replaceChild(wrapper, node);
//                     }
//                 }
//             } else if (
//                 node.nodeType === Node.ELEMENT_NODE &&
//                 !['style', 'script'].includes(node.tagName.toLowerCase()) &&
//                 node.childNodes &&
//                 node.childNodes.length > 0
//             ) {
//                 node.childNodes.forEach((childNode) =>
//                     highlightTextNode(childNode)
//                 );
//             }
//         }

//         // Проверка, является ли узел потомком элемента style или script
//         function isDescendantOfStyleOrScript(node) {
//             while (node.parentNode) {
//                 node = node.parentNode;
//                 if (
//                     node.tagName &&
//                     (node.tagName.toLowerCase() === 'style' ||
//                         node.tagName.toLowerCase() === 'script')
//                 ) {
//                     return true;
//                 }
//             }
//             return false;
//         }

//         highlightTextNode(document.body);
//     }
//     // Отображение счётчика
//     chrome.runtime.sendMessage({
//         action: 'updateBadge',
//         count: document.querySelectorAll('span.highlighted').length,
//     });
// }

async function highlightAttributes(searchText, highlightColor, listId = null) {
    highlightColorRestore = highlightColor;

    function findAttributeMatch(element, attributeName) {
        const attribute = element.getAttribute(attributeName);
        if (
            attribute &&
            attribute.toLowerCase().includes(searchText.toLowerCase())
        ) {
            return element;
        }
        return null;
        // const attributes = element.attributes;
        // for (const attr of attributes) {
        //     if (attr.value.toLowerCase().includes(searchText.toLowerCase())) {
        //         return element;
        //     }
        // }
        // return null;
    }

    if (boolActive && searchText !== '') {
        function highlightElement(element) {
            const matchedElement = findAttributeMatch(element, 'class');
            if (matchedElement) {
                if (matchedElement.parentNode.className !== 'highlighted') {
                    const colorStyle = `border: 4px solid ${highlightColor};`;

                    const wrapper = document.createElement('span');
                    wrapper.className = 'highlighted';
                    wrapper.style.cssText = colorStyle;
                    wrapper.setAttribute('data-list-id', listId);

                    const textNode = document.createTextNode(
                        element.textContent
                    );
                    wrapper.appendChild(textNode);

                    element.innerHTML = '';
                    element.appendChild(wrapper);
                    // element.parentNode.replaceChild(wrapper, element);
                }
            }
        }

        const elements = document.querySelectorAll('*');
        elements.forEach((element) => highlightElement(element));

        // Update badge only if using listId [data-list-id="${listId}"]
        // if (listId) {
        const count = document.querySelectorAll(`span.highlighted`).length;
        chrome.runtime.sendMessage({
            action: 'updateBadge',
            count: count,
        });
        // }
    }
}

chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
) {
    if (request.action === 'highlight') {
        try {
            // await highlightText(
            //     request.searchText,
            //     request.highlightColor,
            //     request.listId
            // );
            await highlightAttributes(
                request.searchText,
                request.highlightColor,
                request.listId
            );
        } catch (error) {
            console.error('Ошибка при выделении слова', error);
        }
    } else if (request.action === 'removeHighlight') {
        const listId = request.listId;
        const selector = listId
            ? `span[data-list-id="${listId}"].highlighted, span[data-list-id="${listId}"].highlightedP`
            : 'span.highlighted, span.highlightedP';

        document.querySelectorAll(selector).forEach((element) => {
            const { textContent } = element;
            element.outerHTML = textContent;
        });
    } else if (request.action === 'submenuStatusUpdating') {
        try {
            await getValuesFromLocalStorage();
        } catch (error) {
            console.error('Ошибка при обновлении данных', error);
        }
    }
});
