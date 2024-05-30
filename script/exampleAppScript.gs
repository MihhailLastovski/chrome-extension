function addValueToStepsStatus(spreadsheetId, note, textContent, columnName) {
    try {
        // Open the spreadsheet
        var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        var sheet = spreadsheet.getSheetByName('Strings') || spreadsheet.getSheetByName('strings');
        
        if (!sheet) {
            Logger.log('Sheet "Strings" or "strings" not found.');
            return;
        }

        var data = sheet.getDataRange().getValues();
        var targetTextContent = textContent.toLowerCase().trim();
        var found = false;

        // Convert column headers to lowercase for case-insensitive comparison
        var headers = data[0].map(function(header) {
            return header.toLowerCase();
        });
        
        // Find the index of the column "lec id"
        var stringIdIndex = headers.indexOf('lec id');

        // If the column is found
        if (stringIdIndex !== -1) {
            // Search for the cell with an exact match in the specified column
            for (var i = 1; i < data.length; i++) {
                var cellValue = String(data[i][stringIdIndex]).toLowerCase().trim();
                if (cellValue === targetTextContent) {
                    // Found the value, get the index of the specified column (case-insensitive)
                    var columnIndex = headers.indexOf(columnName.toLowerCase());
                    if (columnIndex !== -1) {
                        // i + 1 is the row index, columnIndex + 1 because column index starts from 0
                        var cell = sheet.getRange(i + 1, columnIndex + 1);
                        if (columnName.toLowerCase() === 'screenshot') {
                            var lecData = data[i][stringIdIndex];
                            cell.setValue(lecData + '.png');
                        } else {
                            cell.setValue(note);
                        }
                        found = true;
                    } else {
                        Logger.log('Column "' + columnName + '" not found.');
                    }
                }
            }
        } else {
            Logger.log('Column "Lec ID" not found.');
        }

        if (!found) {
            Logger.log('Value not found in the sheet:', targetTextContent);
        }
    } catch (error) {
        Logger.log('Error adding value:', error);
    }
}

function getDataBySheetName(spreadsheetId) {
    try {
        // Open the spreadsheet by ID
        var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        var sheet = spreadsheet.getSheetByName('Strings') || spreadsheet.getSheetByName('strings');

        if (!sheet) {
            Logger.log('Sheet not found');
            return null;
        }

        // Get all data as a 2D array
        var data = sheet.getDataRange().getValues();

        // Create an object to map column names to their indices
        var headers = data[0].map(function(header) {
            return header.toLowerCase();
        });

        var columnIndexMap = {};
        headers.forEach(function(header, index) {
            columnIndexMap[header] = index;
        });

        // Form an object with the required data, starting from the second row
        var result = data
            .slice(1)
            .map(function (row) {
                // Add a check for empty rows before adding data
                if (row[columnIndexMap['string id']] !== '') {
                    return {
                        'Lec ID': row[columnIndexMap['lec id']],
                        'String ID': row[columnIndexMap['string id']],
                        'Core Strings': row[columnIndexMap['core strings']],
                        Status: row[columnIndexMap['status']],
                    };
                }
                return null; // Skip empty rows
            })
            .filter(Boolean); // Filter out null values

        Logger.log('Data retrieved successfully:', result);
        return result;
    } catch (error) {
        Logger.log('Error retrieving data:', error);
        return null;
    }
}

function doGet(req) {
    try {
        // Get the active sheet
        var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // Get all data as a 2D array
        var data = activeSheet.getDataRange().getValues();

        // Convert data to JSON
        var jsonData = [];

        for (var i = 0; i < data.length; i++) {
            var row = {};
            for (var j = 0; j < data[i].length; j++) {
                row['col' + (j + 1)] = data[i][j];
            }
            jsonData.push(row);
        }

        Logger.log('JSON data retrieved successfully:', jsonData);

        // Return JSON
        return ContentService.createTextOutput(
            JSON.stringify(jsonData)
        ).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        Logger.log('Error in doGet:', error);
        return ContentService.createTextOutput('Error in doGet.').setStatusCode(500);
    }
}

function doPost(e) {
    try {
        // Get data from the request
        var requestData = JSON.parse(e.postData.contents);
        console.log('Received request data:', e.postData.contents);

        // Check what action needs to be performed
        if (requestData.action === 'addNoteToElement') {
            // Call the function to add a note
            addValueToStepsStatus(
                requestData.sheetId,
                requestData.note,
                requestData.textContent,
                requestData.columnName
            );

            Logger.log('Note added via doPost:', requestData.note);

            // Return a successful response
            return ContentService.createTextOutput(
                'Note successfully added to the spreadsheet.'
            ).setMimeType(ContentService.MimeType.TEXT);
        } else if (requestData.action === 'getDataBySheetName') {
            // Call the function to get data by sheet name
            var spreadsheetId = requestData.sheetId;
            var result = getDataBySheetName(spreadsheetId);

            // Return the retrieved data
            return ContentService.createTextOutput(
                JSON.stringify(result)
            ).setMimeType(ContentService.MimeType.JSON);
        } else {
            var spreadsheet = SpreadsheetApp.openById(requestData.sheetId);
            var sheet = spreadsheet.getSheetByName(requestData.sheetName);

            // Define from which row to start data insertion
            var startRow = sheet.getLastRow() + 1;

            // Insert data into the sheet
            for (var i = 0; i < requestData.length; i++) {
                var rowData = Object.values(requestData[i]);
                sheet
                    .getRange(startRow + i, 1, 1, rowData.length)
                    .setValues([rowData]);
            }
        }
    } catch (error) {
        console.error('Error in doPost:', error);
        return ContentService.createTextOutput(
            'Error in doPost: ' + error.message
        ).setStatusCode(500);
    }
}
