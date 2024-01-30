const apiKey = 'AIzaSyBizfdeE-hxfeh-quvNXqEwAQSJa7WQuJk';
const spreadsheetId = '1Lmb7UlEsSvbu-xVm6rKrrKcAzt31NtFhwUYhmWrqhmY';
const sheetName = 'sheet';
async function updateCellValue(row, col, newValue) {
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
            sheetName
        )}!${String.fromCharCode(64 + 1)}${1}?key=${apiKey}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: [['words']],
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to update cell. Status: ${response.status}`);
    }
}
updateCellValue();
