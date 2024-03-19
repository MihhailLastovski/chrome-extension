document.addEventListener('DOMContentLoaded', function () {
    const searchTextInput = document.getElementById('searchText');
    const highlightBtn = document.getElementById('highlightBtn');
    const newListBtn = document.getElementById('newListBtn');
    const attributesCheckbox = document.getElementById('attributesCheckbox');
    const searchLabel = document.getElementById('searchLabel');
    const searchSlider = document.getElementById('searchSlider');
    const wordListsContainer = document.getElementById('wordListsContainer');
    const version = document.getElementById('version');
    const colorOptions = document.querySelectorAll('.color-option');

    var attributesIsActive, wordLists, selectedColor;
    let enabledLists = [];
    selectedColor = localStorage.getItem('selectedColor') || 'defaultColor';

    chrome.storage.local.get('attributesIsActive', function (data) {
        attributesCheckbox.checked = data.attributesIsActive || false;
        updateLabels();
    });

    chrome.storage.local.get('wordLists', function (data) {
        wordLists = data.wordLists || [];
        renderWordLists(wordLists);
        console.log(wordLists);
    });

    chrome.storage.local.get('enabledLists', function (data) {
        enabledLists = data.enabledLists || [];
        // enabledLists.forEach((listId) => {
        //     toggleWordList(listId, true);
        // });
    });

    attributesCheckbox.addEventListener('change', function () {
        updateLabels();
        chrome.storage.local.set({
            attributesIsActive: attributesCheckbox.checked,
        });
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'valuesStatusUpdating',
                });
            }
        );
        renderWordLists(wordLists);
    });

    function updateLabels() {
        attributesIsActive = attributesCheckbox.checked;
        searchLabel.textContent = attributesIsActive ? 'Attribute' : 'Default';
        searchSlider.style.backgroundColor = attributesIsActive
            ? '#3B1269'
            : '#FC0365';
    }

    colorOptions.forEach((option) => {
        option.addEventListener('change', function () {
            selectedColor = this.value;
            localStorage.setItem('selectedColor', selectedColor);
        });

        if (option.value === selectedColor) {
            option.checked = true;
        }
    });

    highlightBtn.addEventListener('click', function () {
        let searchText = searchTextInput.value.trim();
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['./script/contentScripts/contentScript.js'],
                });
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'highlight',
                    searchText: searchText,
                    highlightColor: selectedColor,
                });
            }
        );
    });

    function renderWordLists(lists) {
        wordListsContainer.innerHTML = '';
        lists.forEach((list) => {
            if (
                (attributesIsActive && list.isAttributeList) ||
                (!attributesIsActive && !list.isAttributeList)
            ) {
                const listItem = document.createElement('div');
                listItem.className = 'wordListsItem';

                const iconList = document.createElement('i');
                iconList.innerHTML = list.isAttributeList
                    ? '<i class="fa-2x fa fa-cubes" aria-hidden="true"></i>'
                    : '<i class="fa-2x fa fa-list" aria-hidden="true"></i>';
                listItem.appendChild(iconList);

                const textContainer = document.createElement('div');
                textContainer.className = 'textContainer';
                textContainer.textContent = list.name;

                const buttons = document.createElement('div');
                buttons.className = 'buttonsContainer';
                const enableButton = document.createElement('button');
                enableButton.innerHTML = enabledLists.includes(list.id)
                    ? '<i class="fa fa-pause" aria-hidden="true"></i>'
                    : '<i class="fa fa-play" aria-hidden="true"></i>';
                enableButton.addEventListener('click', function () {
                    const enable = !enabledLists.includes(list.id);
                    toggleWordList(list.id, enable);
                    renderWordLists(lists);
                });
                buttons.appendChild(enableButton);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML =
                    '<i class="fa fa-trash" aria-hidden="true"></i>';
                deleteButton.addEventListener('click', function () {
                    let updatedLists = wordLists.filter(
                        (wordList) => wordList.id !== list.id
                    );
                    chrome.storage.local.set({ wordLists: updatedLists });
                    removeHighlight(list.id);
                    renderWordLists(updatedLists);
                });
                buttons.appendChild(deleteButton);

                const updateButton = document.createElement('button');
                updateButton.innerHTML =
                    '<i class="fa fa-pencil" aria-hidden="true"></i>';
                updateButton.addEventListener('click', function () {
                    window.location.href = list.isAttributeList
                        ? `attributesList.html?listId=${list.id}`
                        : `list.html?listId=${list.id}`;
                });
                buttons.appendChild(updateButton);
                listItem.appendChild(textContainer);
                listItem.appendChild(buttons);
                wordListsContainer.appendChild(listItem);
            }
        });
    }

    function toggleWordList(listId, enable) {
        if (enable) {
            if (!enabledLists.includes(listId)) {
                enabledLists.push(listId);
                chrome.runtime.sendMessage({
                    action: 'updateLists',
                    listId: listId,
                });
            }
        } else {
            enabledLists = enabledLists.filter((id) => id !== listId);
            removeHighlight(listId);
        }

        chrome.storage.local.set(
            { enabledLists: enabledLists },
            function () {}
        );
    }

    function removeHighlight(listId) {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'removeHighlight',
                    listId: listId,
                });
            }
        );
    }

    newListBtn.addEventListener('click', function () {
        window.location.href = 'newList.html';
    });

    // Отображение версии проекта с manifest
    async function getProjectVersion() {
        try {
            // Загрузка manifest.json
            const response = await fetch(
                chrome.runtime.getURL('/manifest.json')
            );
            const data = await response.json();
            version.textContent = 'v ' + data.version;
        } catch (error) {
            console.error('Ошибка при загрузке manifest.json:', error);
        }
    }

    getProjectVersion();
});
