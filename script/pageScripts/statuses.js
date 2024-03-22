document.addEventListener('DOMContentLoaded', function () {
    const statusInput = document.getElementById('status');
    const customStatusList = document.getElementById('customStatusList');
    var customStatuses;

    // Get existing statuses from Chrome storage.local
    chrome.storage.local.get('customStatuses', function (result) {
        customStatuses = result.customStatuses || [];

        // Render the existing statuses in the list
        customStatuses.forEach((status) => {
            addCustomStatus(status);
        });
    });

    function updateStatuses() {
        chrome.storage.local.set({ customStatuses: customStatuses });
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'valuesStatusUpdating',
                });
            }
        );
    }

    function addCustomStatus(status) {
        if (status !== '') {
            const listItem = document.createElement('div');
            listItem.className = 'list-wordsItem';

            const wordLabel = document.createElement('label');
            wordLabel.textContent = status;
            wordLabel.className = 'word-label';

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML =
                '<i class="fa-2x fa fa-trash-o" aria-hidden="true"></i>';
            deleteButton.className = 'trash-btn';
            deleteButton.addEventListener('click', function () {
                deleteCustomStatus(status, listItem);
            });

            listItem.appendChild(wordLabel);
            listItem.appendChild(deleteButton);

            customStatusList.appendChild(listItem);
        }
    }

    function deleteCustomStatus(status, listItem) {
        customStatuses = customStatuses.filter((s) => s !== status);
        updateStatuses();
        listItem.remove();
    }

    statusInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();

            const status = statusInput.value.trim();
            addCustomStatus(status);

            customStatuses.push(status);
            updateStatuses();

            statusInput.value = '';
        }
    });
});
