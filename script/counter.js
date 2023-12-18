document.addEventListener('DOMContentLoaded', function () {
    const counterElem = document.getElementById('highlightedCount');

    async function countWords() {
        const result = await new Promise((resolve, reject) => {
            chrome.storage.session.get("count", (result) => {
                resolve(result);
            });
        });

        console.log('Highlighted count:', result.count);

        if (result) {
            counterElem.innerHTML = `Word counter: ${result.count}`;
        } else {
            counterElem.innerHTML = `Word counter: 0`;
        }
    }

    // Вызываем функцию при загрузке страницы
    countWords();

    // Добавляем обработчик события для изменений в chrome.storage.session
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        if ('count' in changes) {
            const newCount = changes['count'].newValue;
            console.log('Updated count:', newCount);

            counterElem.innerHTML = `Word counter: ${newCount}`;
        }
    });

    // Добавляем обработчик события перед выгрузкой страницы
    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
        chrome.storage.session.set({count: 0});
    });
});
