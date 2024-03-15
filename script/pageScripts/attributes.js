document.addEventListener('DOMContentLoaded', function () {
    const attributeInput = document.getElementById('attribute');
    const customAttributesList = document.getElementById(
        'customAttributesList'
    );

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

    // Get existing attributes from Chrome storage.local
    chrome.storage.local.get('customAttributes', function (result) {
        const existingAttributes = result.customAttributes || [];

        // Render the existing attributes in the list
        existingAttributes.forEach((attribute) => {
            addCustomAttribute(attribute);
        });
    });

    function deleteCustomAttribute(attribute, listItem) {
        chrome.storage.local.get('customAttributes', function (result) {
            const existingAttributes = result.customAttributes || [];
            const updatedAttributes = existingAttributes.filter(
                (s) => s !== attribute
            );
            chrome.storage.local.set(
                { customAttributes: updatedAttributes },
                function () {
                    listItem.remove();
                }
            );
        });
    }

    attributeInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();

            const attribute = attributeInput.value.trim();
            addCustomAttribute(attribute);

            // Save the custom attribute in Chrome storage.local
            chrome.storage.local.get('customAttributes', function (result) {
                const existingAttributes = result.customAttributes || [];
                existingAttributes.push(attribute);
                chrome.storage.local.set({
                    customAttributes: existingAttributes,
                });
            });

            attributeInput.value = '';
        }
    });
});
