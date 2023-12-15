document.addEventListener('DOMContentLoaded', function() {
    const counterElem = document.getElementById('highlightedCount');

    async function countWords() {
        const result = await new Promise((resolve, reject) => {
            chrome.storage.local.get("countW", (result) => {
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
    countWords();
});