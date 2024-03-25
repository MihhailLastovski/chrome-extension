function addNoteToElement(element) {
    const note = prompt('Enter your note:');

    if (!note) {
        return;
    }

    const listId = element.getAttribute('data-list-id');
    const targetList = wordLists.find((list) => list.id === listId);

    if (targetList && targetList.dataURL) {
        const sheetId = extractSheetIdFromURL(targetList.dataURL);

        const data = {
            action: 'addNoteToElement',
            note: note,
            textContent: element.textContent,
            sheetId: sheetId,
            isSteps: true,
        };

        console.log('Sending data:', data);

        fetch(
            'https://script.google.com/macros/s/AKfycbypdoPeV_hb2SREfmw6F4ULW7HxxRUdXfuxKmlU7mnE4K_fHAwBL67R5nUa96aIfD5X/exec',
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
