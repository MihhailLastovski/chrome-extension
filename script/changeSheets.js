document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("getSheets");
    var input = document.getElementById("textInput");
    var iframe = document.getElementById("googleSheets");

    button.addEventListener("click", function () {
        iframe.src = input.value + '?widget=true';
    })
});