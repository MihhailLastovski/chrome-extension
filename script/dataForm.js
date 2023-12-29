document.addEventListener("DOMContentLoaded", function () {
    const createListBtn = document.getElementById('createListBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    createListBtn.addEventListener("click", function () {
        window.location.href = "list.html";
    });

    cancelBtn.addEventListener("click", function () {
        window.location.href = "popup.html";
    });
});