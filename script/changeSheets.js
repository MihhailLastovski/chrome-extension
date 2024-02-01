document.addEventListener('DOMContentLoaded', function () {
    const buttonGet = document.getElementById('getBtn');
    const buttonPost = document.getElementById('postBtn');
    const link =
        'https://script.google.com/macros/s/AKfycbz0TmU4rxu16UNNgbprlkECYqyidcBrBMQH3KiyHhl0KMXwLgow3IcJW5hKuZi5zCMS/exec';
    const secondLink =
        'https://script.googleusercontent.com/macros/echo?user_content_key=OzWGOLPTAJcE05w0014KyLw-VR4lgmRd5Z6iylKlWo4uEF35xxaz82hww8fzGNDJy4Bko3xyOgZmHpyAfIRsoY8yRvwQZ03dm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnDrdJ5uDykFEKYqWcR28rLiF_kEjQsQypGqtK6kaiXA298HaEKO051t9xx3mbECFqQwcUbPzoAwhOSQvK9hNjstwserHrJdTyg&lib=MuZlqU9EQJ-4lYu6F7Q7mio4pNs2vI3IF';

    buttonGet.addEventListener('click', function () {
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
        fetch(`${link}`)
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
            .catch((error) =>
                console.error('Ошибка при получении данных:', error)
            );
    });

    buttonPost.addEventListener('click', function () {
        // Ваш код на стороне клиента
        function sendDataToGoogleAppsScript(data) {
            fetch(`${link}`, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then((response) => response.text())
                .then((result) => {
                    console.log(result); // Результат выполнения запроса
                })
                .catch((error) =>
                    console.error('Ошибка при отправке данных:', error)
                );
        }

        var updatedData = [
            { col1: 'updated words' },
            { col1: 'to' },
            { col1: 'find' },
        ];

        sendDataToGoogleAppsScript(updatedData);
    });
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
