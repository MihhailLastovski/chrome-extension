document.addEventListener('DOMContentLoaded', function () {
    const version = document.getElementById('version');
    async function getProjectVersion() {
        try {
            // Загрузка manifest.json
            const response = await fetch(
                chrome.runtime.getURL('/manifest.json')
            );
            const data = await response.json();
            version.textContent = data.version;
        } catch (error) {
            console.error('Ошибка при загрузке manifest.json:', error);
        }
    }

    getProjectVersion();
});
