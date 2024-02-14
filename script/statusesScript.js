document.addEventListener('DOMContentLoaded', function () {
    const statusInput = document.getElementById('status');

    function addCustomStatus() {
        const customStatusList = document.getElementById('customStatusList');

        const status = statusInput.value.trim();

        if (status !== '') {
            const listItem = document.createElement('li');
            listItem.textContent = `Status: ${status}`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function () {
                deleteCustomStatus(status, listItem);
            });
            listItem.appendChild(deleteButton);

            customStatusList.appendChild(listItem);

            // Save the custom status in Chrome storage.local
            chrome.storage.local.get('customStatuses', function (result) {
                const existingStatuses = result.customStatuses || [];
                existingStatuses.push(status);
                chrome.storage.local.set({ customStatuses: existingStatuses });
            });
        }
        // Clear the input field
        statusInput.value = '';
    }

    // Get existing statuses from Chrome storage.local
    chrome.storage.local.get('customStatuses', function (result) {
        const existingStatuses = result.customStatuses || [];
        console.log(existingStatuses);
        // Render the existing statuses in the list
        existingStatuses.forEach(function (status) {
            const listItem = document.createElement('li');
            listItem.textContent = `Status: ${status}`;
            customStatusList.appendChild(listItem);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function () {
                deleteCustomStatus(status, listItem);
            });

            listItem.appendChild(deleteButton);
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

    const addButton = document.getElementById('addButton');
    addButton.addEventListener('click', addCustomStatus);
    statusInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addCustomStatus();
        }
    });

    // const cancelBtn = document.getElementById('cancelBtn');
    // cancelBtn.addEventListener('click', function () {
    //     window.location.href = 'popup.html';
    // });
});
