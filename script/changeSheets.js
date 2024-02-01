document.addEventListener('DOMContentLoaded', function () {
    // Создаем таблицу
    var table = document.createElement('table');
    table.border = '1';

    // Добавляем заголовок
    var thead = table.createTHead();
    var headerRow = thead.insertRow();
    headerRow.insertCell(0).textContent = 'Column 1';
    headerRow.insertCell(1).textContent = 'Column 2';
    // Добавьте заголовки столбцов по мере необходимости

    // Добавляем тело таблицы
    var tbody = table.createTBody();

    // Выполняем AJAX-запрос к API Google Apps Script
    fetch(
        'https://script.googleusercontent.com/macros/echo?user_content_key=IVOD4_OFUPTRr1ltcN1a4Ic79BDRIUsC9uwwEjV8ftRTrVVU6nFOnHKOnJr1X5Ez3qYUkJ8YoW3r3PcJ9XPBAZxZbgpLUVK8m5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnAbujWUr6FOaopzYQlb7PaAeijhVkNuVqNeaVXZpHQQQWkz4MDJV83KPw05TPOQ7SQnNtWxHIc3ZYGgjGDGfMr3JfGqm2FsIPA&lib=MuZlqU9EQJ-4lYu6F7Q7mio4pNs2vI3IF'
    )
        .then((response) => response.json())
        .then((data) => {
            // Заполняем таблицу данными
            data.forEach((rowData) => {
                var row = tbody.insertRow();
                Object.values(rowData).forEach((value) => {
                    var cell = row.insertCell();
                    cell.textContent = value;
                });
            });

            // Добавляем таблицу на страницу
            document.body.appendChild(table);
        })
        .catch((error) => console.error('Ошибка при получении данных:', error));
});
/*
    Гайд откуда брать ссылку:
    1. Google таблицы >>> Расширения >>> Apps Script
    2. Вставить следующий код:

    function doGet(req) {
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

        // Возвращаем JSON
        // return JSON.stringify(jsonData);
        return ContentService.createTextOutput(
            JSON.stringify(jsonData)
        ).setMimeType(ContentService.MimeType.JSON);
    }

    3. Сохранить >>> Выполнить >>> Проверить разрешения
    4. В окне "Эксперты Google не проверяли это приложение" выбрать:
        "Дополнительные настройки" >>>
        "Перейти на страницу "Проект без названия" (небезопасно)"
    5. Разрешить доступ
    6. Начать развертывание >>> Новое развертывание
    7. Выберите тип - Веб-приложение
    8. Конфигурация >>> "У кого есть доступ" поставить "все"
    9. Начать развертывание
    10. Опять предоставить разрешения
    11. Скопировать ссылку
*/
