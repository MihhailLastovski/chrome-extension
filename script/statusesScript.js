document.addEventListener('DOMContentLoaded', function () {
    const statusInput = document.getElementById('status');
    const customStatusList = document.getElementById('customStatusList');

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

    // Get existing statuses from Chrome storage.local
    chrome.storage.local.get('customStatuses', function (result) {
        const existingStatuses = result.customStatuses || [];

        // Render the existing statuses in the list
        existingStatuses.forEach((status) => {
            addCustomStatus(status);
        });
    });

    function deleteCustomStatus(status, listItem) {
        chrome.storage.local.get('customStatuses', function (result) {
            const existingStatuses = result.customStatuses || [];
            const updatedStatuses = existingStatuses.filter(
                (s) => s !== status
            );
            chrome.storage.local.set(
                { customStatuses: updatedStatuses },
                function () {
                    listItem.remove();
                }
            );
        });
    }

    statusInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();

            const status = statusInput.value.trim();
            addCustomStatus(status);

            // Save the custom status in Chrome storage.local
            chrome.storage.local.get('customStatuses', function (result) {
                const existingStatuses = result.customStatuses || [];
                existingStatuses.push(status);
                chrome.storage.local.set({ customStatuses: existingStatuses });
            });

            statusInput.value = '';
        }
    });
});
