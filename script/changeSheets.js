document.addEventListener("DOMContentLoaded", function () {
    const guide = document.getElementById("guide");
    const showGuide = document.getElementById("showGuide");

    const button = document.getElementById("getSheets");
    const input = document.getElementById("textInput");
    const iframe = document.getElementById("googleSheets");
    
    button.addEventListener("click", function () {
        iframe.src = input.value + '?widget=true';
    });

    showGuide.addEventListener("click", function () {
        const guideDisplay = window.getComputedStyle(guide).getPropertyValue("display");
        guide.style.display = (guideDisplay === "none") ? "block" : "none";
    });
    
});