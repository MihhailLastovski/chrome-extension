document.addEventListener("DOMContentLoaded", function () {
    const toggleSwitch = document.querySelector(".toggleSwitch");
    const heading = document.querySelector(".heading");
    let active;

    var button = document.getElementById("getSheets");
    var input = document.getElementById("textInput");
    var iframe = document.getElementById("googleSheets");

    button.addEventListener("click", function () {
        iframe.src = input.value + '?widget=true';
    })


    /*Костыль. Пора бы уже починить...*/
    async function toggleSwitchIsActive() {
        const result = await new Promise((resolve, reject) => {
        chrome.storage.local.get("isActive", (result) => {
            resolve(result);
        });
        });
        console.log(result.isActive);
        active = result.isActive;
        updateUIState();
        toggleSwitch.checked = active;  
    }
    toggleSwitchIsActive();

    toggleSwitch.addEventListener('change', function() {
        active = !active;
        chrome.storage.local.set({ isActive: active });
        updateUIState();
    });

    function updateUIState() {
        heading.innerText = active ? "Highlight On" : "Highlight Off";
    }
});