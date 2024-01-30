const apiKey = 'AIzaSyBizfdeE-hxfeh-quvNXqEwAQSJa7WQuJk';
const spreadsheetId = '1Rqf6joJtaZncIXbrejAhl73dPQouBsiVRD7w1qciupc';
const sheetName = 'sheet1';
async function updateCellValue(row, col, newValue) {
    // Get OAuth token using Chrome Identity API
    const token = await new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
            } else {
                resolve(token);
            }
        });
    });

    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
            sheetName
        )}!${String.fromCharCode(64 + 1)}${1}?key=${apiKey}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
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
