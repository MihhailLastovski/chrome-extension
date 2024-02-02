document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');
    const cancelBtn = document.getElementById('cancelBtn');

    cancelBtn.addEventListener('click', function () {
        window.location.href = listId
            ? `list.html?listId=${listId}`
            : 'list.html';
    });
});
