document.addEventListener('DOMContentLoaded', function () {
    const attributeInput = document.getElementById('attribute');
    const customAttributesList = document.getElementById(
        'customAttributesList'
    );
    var customAttributes;

    // Get existing attributes from Chrome storage.local
    chrome.storage.local.get('customAttributes', function (result) {
        customAttributes = result.customAttributes || [];

        // Render the existing attributes in the list
        customAttributes.forEach((attribute) => {
            addCustomAttribute(attribute);
        });
    });

    function updateAttributes() {
        chrome.storage.local.set({ customAttributes: customAttributes });
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'valuesStatusUpdating',
                });
            }
        );
    }

    function addCustomAttribute(attribute) {
        if (attribute !== '') {
            const listItem = document.createElement('div');
            listItem.className = 'list-wordsItem';

            const wordLabel = document.createElement('label');
            wordLabel.textContent = attribute;
            wordLabel.className = 'word-label';

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML =
                '<i class="fa-2x fa fa-trash-o" aria-hidden="true"></i>';
            deleteButton.className = 'trash-btn';
            deleteButton.addEventListener('click', function () {
                deleteCustomAttribute(attribute, listItem);
            });

            listItem.appendChild(wordLabel);
            listItem.appendChild(deleteButton);

            customAttributesList.appendChild(listItem);
        }
    }

    function deleteCustomAttribute(attribute, listItem) {
        customAttributes = customAttributes.filter((s) => s !== attribute);
        updateAttributes();
        listItem.remove();
    }

    attributeInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();

            const attribute = attributeInput.value.trim();
            addCustomAttribute(attribute);

            customAttributes.push(attribute);
            updateAttributes();

            attributeInput.value = '';
        }
    });
});
