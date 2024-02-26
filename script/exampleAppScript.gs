var sheetName = 'zxc'
function addValueToSteps() {
    try {
        // Extract spreadsheet ID from URL
        var spreadsheetId = extractSheetIdFromURL("https://docs.google.com/spreadsheets/d/e/2PACX-1vQD05f_2B8FgCwE4krJhe_GAXGlPOt4SZrhH4UgHNKp7KM1SD35fXGWKLL6kMAUmHV7Ec-xLcCxGrH5/pubhtml?gid=54246032&single=true");

        if (!spreadsheetId) {
            Logger.log('Invalid spreadsheet ID.');
            return;
        }

        // Open the spreadsheet
        var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        var sheets = spreadsheet.getSheets();
        var targetTextContent = "R2";

        // Iterate through all sheets
        for (var s = 0; s < sheets.length; s++) {
            var sheet = sheets[s];

            // Get all data as a 2D array
            var data = sheet.getDataRange().getValues();

            // Search for the cell with an exact match
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].length; j++) {
                    var cellValue = String(data[i][j]).toLowerCase().trim();
                    Logger.log('Comparing:', cellValue, 'with', targetTextContent.toLowerCase().trim());

                    if (cellValue === targetTextContent.toLowerCase().trim()) {
                        // Found the value, add it to the next column ("Steps")
                        var cell = sheet.getRange(i + 1, j + 2);
                        cell.setValue("kek");
                        Logger.log('Value added to Steps successfully.');
                        return;
                    }
                }
            }
        }

        // If the value is not found
        Logger.log('Value not found in any sheet:', targetTextContent);

    } catch (error) {
        Logger.log('Error adding value to Steps:', error);
    }
}

function extractSheetIdFromURL(url) {
    const regex = /\/d\/([a-zA-Z0-9-_]+)|\/e\/[a-zA-Z0-9-_]+\/pubhtml\?gid=([0-9]+)/;
    const match = url.match(regex);
    return match ? (match[1] || match[2]) : null;
}




function doGet(req) {
  try {
    // Получаем активную таблицу
    var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Получаем все данные в виде 2D массива
    var data = activeSheet.getDataRange().getValues();

    // Преобразуем данные в JSON
    var jsonData = [];

    for (var i = 0; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < data[i].length; j++) {
        row['col' + (j + 1)] = data[i][j];
      }
      jsonData.push(row);
    }

    Logger.log('JSON data retrieved successfully:', jsonData);

    // Возвращаем JSON
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
        // Получаем данные из запроса
        var requestData = JSON.parse(e.postData.contents);
        console.log('Received request data:', e.postData.contents);

        // Проверяем, какое действие нужно выполнить
        if (requestData.action === 'addNoteToElement') {
            // Вызываем функцию добавления заметки
            addValueToSteps(requestData.sheetId, requestData.note, requestData.textContent);

            Logger.log('Note added via doPost:', requestData.note);

            // Возвращаем успешный ответ
            return ContentService.createTextOutput(
                'Заметка успешно добавлена в таблицу.'
            ).setMimeType(ContentService.MimeType.TEXT);
        } else {
            var spreadsheet =
                SpreadsheetApp.openById(requestData.sheetId);
            var sheet = spreadsheet.getSheetByName(sheetName);

            // Define from which line to start data insertion
            var startRow = sheet.getLastRow() + 1;

            // Inserting data into the table
            for (var i = 0; i < requestData.length; i++) {
                var rowData = Object.values(requestData[i]);
                sheet.getRange(startRow + i, 1, 1, rowData.length)
                    .setValues([rowData]);
            }
        }

    } catch (error) {
        console.error('Error in doPost:', error);
        return ContentService.createTextOutput('Error in doPost: ' + error.message).setStatusCode(500);
    }
}
