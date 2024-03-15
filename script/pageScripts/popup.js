let selectedColor;
document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get('enabledLists', function (data) {
        let enabledLists = data.enabledLists || [];

        enabledLists.forEach((listId) => {
            toggleWordList(listId, true);
        });

        enabledLists = [];
        renderWordLists([]);
    });

    const searchTextInput = document.getElementById('searchText');
    const highlightBtn = document.getElementById('highlightBtn');
    const newListBtn = document.getElementById('newListBtn');

    const colorOptions = document.querySelectorAll('.color-option');
    selectedColor = localStorage.getItem('selectedColor') || 'defaultColor';

    colorOptions.forEach((option) => {
        if (option.value === selectedColor) {
            option.checked = true;
        }
    });

    colorOptions.forEach((option) => {
        option.addEventListener('change', function () {
            selectedColor = this.value;

            localStorage.setItem('selectedColor', selectedColor);
        });
    });

    highlightBtn.addEventListener('click', function () {
        let searchText = searchTextInput.value.trim();

        function highlight() {
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
        }
        highlight();
    });

    const wordLists = document.getElementById('wordLists');
    let enabledLists = [];

    function renderWordLists(lists) {
        wordLists.innerHTML = '';
        lists.forEach((list) => {
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
                // Обновление счётчика
                chrome.runtime.sendMessage({
                    action: 'updateBadge',
                    count: 0,
                });
                const enable = !enabledLists.includes(list.id);
                toggleWordList(list.id, enable);
                renderWordLists(lists);
            });
            buttons.appendChild(enableButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML =
                '<i class="fa fa-trash" aria-hidden="true"></i>';
            deleteButton.addEventListener('click', function () {
                deleteWordList(list.id);
                renderWordLists(lists);
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
            wordLists.appendChild(listItem);
        });
    }

    function getAllWordLists(callback) {
        chrome.storage.local.get('wordLists', function (data) {
            let lists = data.wordLists || [];
            callback(lists);
        });
    }

    getAllWordLists(function (lists) {
        chrome.storage.local.get('enabledLists', function (data) {
            enabledLists = data.enabledLists || [];
            renderWordLists(lists);
            console.log(lists);
        });
    });

    function toggleWordList(listId, enable) {
        function removeHighlight() {
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

    function deleteWordList(listId) {
        chrome.storage.local.get('wordLists', function (data) {
            let lists = data.wordLists || [];
            let updatedLists = lists.filter((list) => list.id !== listId);
            chrome.tabs.query(
                { active: true, currentWindow: true },
                function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'removeHighlight',
                        listId: listId,
                    });
                }
            );
            chrome.storage.local.set({ wordLists: updatedLists }, function () {
                getAllWordLists(renderWordLists);
            });
        });
    }

    newListBtn.addEventListener('click', function () {
        window.location.href = 'newList.html';
    });

    // Отображение версии проекта с manifest
    const version = document.getElementById('version');
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
