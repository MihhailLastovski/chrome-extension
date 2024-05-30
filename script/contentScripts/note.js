function addNoteToElement(element) {
    const note = prompt('Enter your note:');

    if (!note) {
        return;
    }

    const listId = element.getAttribute('data-list-id');
    const targetList = wordLists.find((list) => list.id === listId);

    if (targetList && targetList.dataURL) {
        const sheetId = extractSheetIdFromURL(targetList.dataURL);
        var data;
        targetList.words.forEach((wordObj) => {
            if (element.innerHTML.toLowerCase() === wordObj.word.toLowerCase()) {
                data = {
                    action: 'addNoteToElement',
                    note: note,
                    textContent: `${wordObj.lecID}`,
                    sheetId: sheetId,
                    columnName: 'Steps',
                };
            }
        });

        console.log('Sending data:', data);

        fetch(
            'https://script.google.com/macros/s/AKfycbz21ktmeytfBRMn1i5cedGRwjWiq-e_xH6ssntP5XYY4VzvLbuUBeV0R5Aytt0-Z3aD/exec',
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
            .catch((error) => console.error('Error sending note:', error));
    } else {
        console.error('List not found in localStorage');
    }
}

function extractSheetIdFromURL(url) {
    const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}
