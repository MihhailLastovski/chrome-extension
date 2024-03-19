function addNoteToElement(element) {
    const note = prompt('Enter your note:');

    if (!note) {
        return;
    }

    const listId = element.getAttribute('data-list-id');

    chrome.storage.local.get('wordLists', function (data) {
        const wordLists = data.wordLists || [];

        const targetList = wordLists.find((list) => list.id === listId);

        if (targetList) {
            const sheetId = extractSheetIdFromURL(targetList.dataURL);

            const data = {
                action: 'addNoteToElement',
                note: note,
                textContent: element.textContent,
                sheetId: sheetId,
            };

            console.log('Sending data:', data);

            fetch(
                'https://script.google.com/macros/s/AKfycbya6kRaa-zbZisTLG6RADGq9RDlBzh-0-9xYbYxQwBgoMOTKuVMrPUi3SCh_OLCTqxM/exec',
                {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            )
                .then((response) => response.text())
                .then((result) => {
                    console.log('Response from server:', result);
                })
                .catch((error) =>
                    console.error('Error sending note:', error)
                );
        } else {
            console.error('List not found in localStorage');
        }
    });
}

function extractSheetIdFromURL(url) {
    const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}