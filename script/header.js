document.addEventListener("DOMContentLoaded", function () {
    var div = document.createElement("div");
    div.className = "header";
    div.innerHTML = `
        <input class="toggleViewSwitch" type="checkbox" id="darkModeToggle">
        <label for="darkModeToggle">
            <i class="fa fa-sun-o fa-3x" aria-hidden="true"></i>
            <i class="fa fa-moon-o fa-3x" aria-hidden="true"></i>
        </label>
        <h1 class="heading">Highlight Off</h1>
        <label class="switch">
            <input class="toggleSwitch" type="checkbox">
            <span class="slider"></span>
        </label>
        <div id="toggleSwittchTooltip" class="tooltip">Tooltip</div>`;

    var body = document.querySelector("body");
    body.insertBefore(div, body.firstChild);

    const toggleSwitch = document.querySelector(".toggleSwitch");
    const heading = document.querySelector(".heading");
    const searchTextInput = document.getElementById("searchText");
    const highlightBtn = document.getElementById("highlightBtn");
    let active;
  
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
        searchTextInput && highlightBtn && (searchTextInput.disabled = highlightBtn.disabled = !active);
    }

    const tooltip = document.getElementById('toggleSwittchTooltip');

    heading.addEventListener('mouseover', function() {
        const rect = heading.getBoundingClientRect();
        const tooltipX = rect.left + window.pageXOffset;
        const tooltipY = rect.bottom + window.pageYOffset + 5;
    
        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${tooltipY}px`;
    
        tooltip.style.display = "inline-block";
        tooltip.style.opacity = 1;
    });
    
    heading.addEventListener('mouseout', function() {
        tooltip.style.display = "none";
        tooltip.style.opacity = 0;
    });

});