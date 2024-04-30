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


async function getWordListsFromStorage() {
    const wordListsCache = new Set(); // Local declaration

    try {
        if (wordListsCache.size === 0) {
            const { wordLists } = await getFromLocalStorage('wordLists');
            wordLists.forEach(list => {
                list.words.forEach(wordObj => {
                    wordListsCache.add(wordObj.word.trim().toLowerCase());
                });
            });
        }
    } catch (error) {
        console.error('Error getting word lists from storage:', error);
    }

    return wordListsCache; // Return the set
}


async function highlightText(searchText, highlightColor, listId = null) {
    try { 
        if(searchText === '') { return; }       
        // Iterate over each searchText element
        if (Array.isArray(searchText)) {
            searchText.forEach((wordObj) => {
                if (wordObj.enabled) {
                    const searchText = wordObj.word;
                    
                    document.querySelectorAll('p, a, li, tr, th, td, b, i, span, div, h1, h2, h3, h4, h5, h6').forEach((element) => {
                        // Пропускаем элементы, которые уже выделены
                        if (element.classList.contains('exa-radience-highlighted')) {
                            return;
                        }
                        if (element.id === 'submenu') {
                            return;
                        }
            
                        Array.from(element.childNodes).forEach((node) => {
                            if (node.nodeType === Node.TEXT_NODE) {
                                const textContent = node.textContent.trim();
                                if (searchText === textContent) {
                                    const parentElement = node.parentElement;
                                    parentElement.classList.add('exa-radience-highlighted');
                                    parentElement.style.borderColor = highlightColor;
                                    parentElement.dataset.listId = listId;
                                }
                            }
                        });
                    });
                }
            });
        }
        else{                    
            document.querySelectorAll('p, a, li, tr, th, td, b, i, span, div, h1, h2, h3, h4, h5, h6').forEach((element) => {
                // Пропускаем элементы, которые уже выделены
                if (element.classList.contains('exa-radience-highlighted')) {
                    return;
                }
                if (element.id === 'submenu') {
                    return;
                }
    
                Array.from(element.childNodes).forEach((node) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const textContent = node.textContent.trim();
                        if (searchText === textContent) {
                            const parentElement = node.parentElement;
                            parentElement.classList.add('exa-radience-highlighted');
                            parentElement.style.borderColor = highlightColor;
                            if(listId){
                                parentElement.dataset.listId = listId;
                            }
                        }
                    }
                });
            });
        }
        
        // Update badge
        chrome.runtime.sendMessage({
            action: 'updateBadge',
            count: document.querySelectorAll('.exa-radience-highlighted').length,
            color: '#FC0365' // Color for text mode
        });
    } catch (error) {
        console.error('Error highlighting text:', error);
    }
}


async function highlightAttributes(searchText, highlightColor, listId = null) {
    try {
        const wordListsCache = await getWordListsFromStorage(); // Call the function here
        if(Array.isArray(searchText)){
            searchText.forEach((wordObj) => {
                if (wordObj.enabled) {
                    const searchText = wordObj.word
                    function highlightAttributesInElement(element) {
                        const attributes = element.attributes;
                        for (const attribute of attributes) {
                            const attributeValue = attribute.value.trim().toLowerCase();
                            if (attributeValue === searchText.toLowerCase() && wordListsCache.has(attributeValue)) {
                                element.classList.add('exa-radience-highlighted');
                                element.style.borderColor = highlightColor;
                                if (listId) {
                                    element.dataset.listId = listId;
                                }
                                return;
                            }
                        }
                    }
                    //document.querySelectorAll('p, a, li, tr, th, td, input, label, b, i, span, div, h1, h2, h3, h4, h5, h6')
                    document.querySelectorAll('p, a, li, tr, th, td, b, i, span, div, h1, h2, h3, h4, h5, h6').forEach((element) => {
                        highlightAttributesInElement(element);
                    });
            
                }});
        }
        else{
            function highlightAttributesInElement(element) {
                const attributes = element.attributes;
                for (const attribute of attributes) {
                    const attributeValue = attribute.value.trim().toLowerCase();
                    if (attributeValue === searchText.toLowerCase() && wordListsCache.has(attributeValue)) {
                        element.classList.add('exa-radience-highlighted');
                        element.style.borderColor = highlightColor;
                        if (listId) {
                            element.dataset.listId = listId;
                        }
                        return;
                    }
                }
            }
            //document.querySelectorAll('p, a, li, tr, th, td, input, label, b, i, span, div, h1, h2, h3, h4, h5, h6')
            document.querySelectorAll('p, a, li, tr, th, td, b, i, span, div, h1, h2, h3, h4, h5, h6').forEach((element) => {
                highlightAttributesInElement(element);
            });
        }
        
        // Update badge
        chrome.runtime.sendMessage({
            action: 'updateBadge',
            count: document.querySelectorAll('.exa-radience-highlighted').length,
            color: '#3B1269' // Color for attribute mode
        });
    } catch (error) {
        console.error('Error highlighting attributes:', error);
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
