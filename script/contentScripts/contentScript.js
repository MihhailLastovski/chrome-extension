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
    try {
        const { wordLists } = await getFromLocalStorage('wordLists');
        const wordsList = wordLists.flatMap(list => list.words.map(wordObj => wordObj.word.trim().toLowerCase()));

        const searchRegex = new RegExp(searchText, 'gi');

        function highlightTextInElement(element) {
            if (element.nodeType === Node.TEXT_NODE) {
                const textContent = element.textContent.trim().toLowerCase();
                if (searchRegex.test(textContent) && wordsList.includes(textContent)) {
                    const parentElement = element.parentElement;
                    parentElement.classList.add('exa-radience-highlighted');
                    parentElement.style.borderColor = highlightColor;
                    if (listId) {
                        parentElement.dataset.listId = listId;
                    }
                }
            }
        }

        document.querySelectorAll('*').forEach((element) => {
            for (const childNode of element.childNodes) {
                highlightTextInElement(childNode);
            }
        });

        // Отображение счётчика
        chrome.runtime.sendMessage({
            action: 'updateBadge',
            count: document.querySelectorAll('.exa-radience-highlighted').length,
            color: '#FC0365', // Цвет для режима текста
        });
    } catch (error) {
        console.error('Ошибка при подсветке текста:', error);
    }
}

async function highlightAttributes(searchText, highlightColor, listId = null) {
    try {
        const { wordLists } = await getFromLocalStorage('wordLists');
        const wordsList = wordLists.flatMap(list => list.words.map(wordObj => wordObj.word.trim().toLowerCase()));

        const searchRegex = new RegExp(searchText, 'gi');

        function highlightAttributesInElement(element) {
            const attributes = element.attributes;
            for (const attribute of attributes) {
                const attributeValue = attribute.value.trim().toLowerCase();
                if (attributeValue === searchText.toLowerCase() && wordsList.includes(attributeValue)) {
                    element.classList.add('exa-radience-highlighted');
                    element.style.borderColor = highlightColor;
                    if (listId) {
                        element.dataset.listId = listId;
                    }
                    return;
                }
            }
        }

        document.querySelectorAll('*').forEach((element) => {
            highlightAttributesInElement(element);
        });

        // Отображение счётчика
        chrome.runtime.sendMessage({
            action: 'updateBadge',
            count: document.querySelectorAll('.exa-radience-highlighted').length,
            color: '#3B1269', // Цвет для режима атрибутов
        });
    } catch (error) {
        console.error('Ошибка при подсветке атрибутов:', error);
    }
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
            element.classList.remove('exa-radience-highlighted');
            element.removeAttribute('data-list-id');
            element.style.borderColor = 'transparent';
            element.style.backgroundColor = 'transparent';
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
