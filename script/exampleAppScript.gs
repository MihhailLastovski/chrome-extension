function addValueToSteps(spreadsheetId, note, textContent) {
    try {

        // Open the spreadsheet
        var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        var sheets = spreadsheet.getSheets();
        var targetTextContent = textContent;

        // Iterate through all sheets
        for (var s = 0; s < sheets.length; s++) {
            var sheet = sheets[s];

            // Get all data as a 2D array
            var data = sheet.getDataRange().getValues();

            // Search for the cell with an exact match
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].length; j++) {
                    var cellValue = String(data[i][j]).toLowerCase().trim();

                    if (cellValue === targetTextContent.toLowerCase().trim()) {
                        // Found the value, add it to the next column ("Steps")
                        var cell = sheet.getRange(i + 1, j + 2);
                        cell.setValue(note);
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

function getDataBySheetName(spreadsheetId) {
    try {
        // Открываем таблицу по идентификатору
        var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        var sheet = spreadsheet.getSheetByName("Strings");

        if (!sheet) {
            Logger.log('Sheet not found');
            return null;
        }

        // Получаем все данные в виде 2D массива
        var data = sheet.getDataRange().getValues();

        // Формируем объект с нужными данными, начиная со второй строки
        var result = data.slice(1).map(function(row) {
            // Добавляем проверку на пустые строки перед добавлением данных
            if (row[4] !== "") {
                return {
                    "String ID": row[4], // Предположим, что String ID находится в пятом столбце
                    "Core Strings": row[5], // Предположим, что Core Strings находится в шестом столбце
                    "Status": row[8] // Предположим, что Status находится в девятом столбце
                };
            }
            return null; // Пропускаем пустые строки
        }).filter(Boolean); // Фильтруем и удаляем null значения

        Logger.log('Data retrieved successfully:', result);
        return result;

    } catch (error) {
        Logger.log('Error retrieving data:', error);
        return null;
    }
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
        }else if (requestData.action === 'getDataBySheetName') {
            // Вызываем функцию получения данных по имени листа
            var spreadsheetId = requestData.sheetId;
            var result = getDataBySheetName(spreadsheetId);

            // Возвращаем полученные данные
            return ContentService.createTextOutput(
                JSON.stringify(result)
            ).setMimeType(ContentService.MimeType.JSON);
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
