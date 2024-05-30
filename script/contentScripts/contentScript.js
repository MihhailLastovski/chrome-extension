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

    const head = document.head || document.getElementsByTagName('head')[0];
    if (head) {
        // Внедрение CSS файла
        const iconsLink = document.createElement('link');
        iconsLink.rel = 'stylesheet';
        iconsLink.href =
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
        document.head.appendChild(iconsLink);
    }

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

// async function getWordListsFromStorage() {
//     const wordListsCache = new Set(); // Local declaration

//     try {
//         if (wordListsCache.size === 0) {
//             const { wordLists } = await getFromLocalStorage('wordLists');
//             wordLists.forEach((list) => {
//                 list.words.forEach((wordObj) => {
//                     wordListsCache.add(wordObj.word.trim().toLowerCase());
//                 });
//             });
//         }
//     } catch (error) {
//         console.error('Error getting word lists from storage:', error);
//     }

//     return wordListsCache; // Return the set
// }

function findWordInWordLists(word, listId) {
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

async function highlightText(searchText, highlightColor, listId = null) {
    try {
        // Iterate over each searchText element
        if (Array.isArray(searchText)) {
            searchText.forEach((wordObj) => {
                if (wordObj.enabled) {
                    const searchText = wordObj.word;
                    iterateArray(searchText, highlightColor, listId);
                }
            });
        } else {
            iterateArray(searchText, highlightColor, listId);
        }
    } catch (error) {
        console.error('Error highlighting text:', error);
    }
}

function iterateArray(searchText, highlightColor, listId) {
    // Функция для обработки shadow DOM
    function processShadowDom(element) {
        // Обрабатываем элементы shadow root
        if (element.shadowRoot) {
            element.shadowRoot.querySelectorAll('*').forEach((shadowElement) => {
                processElement(shadowElement);
            });

            // Добавляем стиль для выделения в shadow root
            const style = document.createElement('style');
            style.textContent = `
                .exa-radience-highlighted {
                    border-color: ${highlightColor} !important;
                    background-color: ${highlightColor} !important;
                }
            `;
            element.shadowRoot.appendChild(style);
        }

        // Обрабатываем обычные childNodes
        Array.from(element.childNodes).forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const textContent = node.textContent.trim().toLowerCase();
                if (searchText.toLowerCase() === textContent) {
                    const foundWord = findWordInWordLists(textContent, listId);
                    const isValid =
                        foundWord && statusesList.includes(foundWord.status);

                    const parentElement = node.parentElement;
                    parentElement.classList.add('exa-radience-highlighted');
                    if (listId) {
                        parentElement.dataset.listId = listId;
                    }
                    if (isValid) {
                        parentElement.style.backgroundColor = highlightColor;
                    }
                }
            }
        });
    }

    // Основная функция для обработки элементов
    function processElement(element) {
        if (
            element.classList.contains('exa-radience-highlighted') ||
            element.id === 'submenu' ||
            ['style', 'script', 'link', 'br', 'img', 'meta'].includes(
                element.tagName.toLowerCase()
            )
        ) {
            return;
        }

        processShadowDom(element); // Обрабатываем shadow DOM

        // Обрабатываем обычные childNodes
        Array.from(element.childNodes).forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const textContent = node.textContent.trim().toLowerCase();
                if (searchText.toLowerCase() === textContent) {
                    const foundWord = findWordInWordLists(textContent, listId);
                    const isValid =
                        foundWord && statusesList.includes(foundWord.status);

                    const parentElement = node.parentElement;
                    parentElement.classList.add('exa-radience-highlighted');
                    if (listId) {
                        parentElement.dataset.listId = listId;
                    }
                    if (isValid) {
                        parentElement.style.backgroundColor = highlightColor;
                    }
                }
            }
        });
    }

    // Запуск обработки для всех элементов body
    document.querySelectorAll('body *').forEach((element) => {
        processElement(element);
    });
}

async function highlightAttributes(searchText, highlightColor, listId = null) {
    try {
        //const wordListsCache = await getWordListsFromStorage();
        if (Array.isArray(searchText)) {
            searchText.forEach((wordObj) => {
                if (wordObj.enabled) {
                    const searchText = wordObj.word;
                    iterateAttributes(searchText, highlightColor, listId);
                }
            });
        } else {
            iterateAttributes(searchText, highlightColor, listId);
            // iterateAttributes(
            //     searchText,
            //     wordListsCache,
            //     highlightColor,
            //     listId
            // );
        }
    } catch (error) {
        console.error('Error highlighting attributes:', error);
    }
}

function iterateAttributes(searchText, highlightColor, listId) {
    document.querySelectorAll('body *').forEach((element) => {
        // Пропускаем элементы, которые уже выделены
        if (
            element.classList.contains('exa-radience-highlighted') ||
            element.id === 'submenu' ||
            ['style', 'script', 'link', 'br', 'img', 'meta'].includes(
                element.tagName.toLowerCase()
            )
        ) {
            return;
        }
        const attributes = element.attributes;
        for (const attribute of attributes) {
            const attributeValue = attribute.value.trim().toLowerCase();
            if (attributeValue === searchText.toLowerCase()) {
                const foundWord = findWordInWordLists(attributeValue, listId);
                const isValid =
                    foundWord && statusesList.includes(foundWord.status);

                element.classList.add('exa-radience-highlighted');
                element.style.borderColor = highlightColor;
                if (listId) {
                    element.dataset.listId = listId;
                }
                if (isValid) {
                    element.style.backgroundColor = highlightColor;
                }
                // if (wordListsCache.has(attributeValue)) {
                //     element.style.backgroundColor = highlightColor;
                // }
                return;
            }
        }
    });
}

chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
) {
    if (request.action === 'highlight' && boolActive) {
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

        const elements = listId
            ? document.querySelectorAll(`body [data-list-id="${listId}"]`)
            : document.querySelectorAll('body *');

        elements.forEach((element) => {
            if (element.classList.contains('exa-radience-highlighted')) {
                element.classList.remove('exa-radience-highlighted');
                element.removeAttribute('data-list-id');
                element.style.borderColor = 'transparent';
                element.style.backgroundColor = 'transparent';
            }
        });
        chrome.runtime.sendMessage({
            action: 'updateBadge',
            count: document.querySelectorAll('.exa-radience-highlighted')
                .length,
            color: searchModeColor,
        });
    } else if (request.action === 'valuesStatusUpdating') {
        try {
            await getValuesFromLocalStorage();
        } catch (error) {
            console.error('Ошибка при обновлении данных', error);
        }
    }
});
