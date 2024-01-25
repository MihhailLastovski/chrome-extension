document.addEventListener('DOMContentLoaded', function () {
    var div = document.createElement('div');
    div.className = 'header';
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
        </label>`;

    var body = document.querySelector('body');
    body.insertBefore(div, body.firstChild);

    const toggleSwitch = document.querySelector('.toggleSwitch');
    const heading = document.querySelector('.heading');
    const searchTextInput = document.getElementById('searchText');
    const highlightBtn = document.getElementById('highlightBtn');
    let active;

    async function toggleSwitchIsActive() {
        const result = await new Promise((resolve, reject) => {
            chrome.storage.local.get('isActive', (result) => {
                resolve(result);
            });
        });
        console.log(result.isActive);
        active = result.isActive;
        updateUIState();
        toggleSwitch.checked = active;
    }
    toggleSwitchIsActive();

    toggleSwitch.addEventListener('change', function () {
        active = !active;
        chrome.storage.local.set({ isActive: active });
        updateUIState();
    });

    function updateUIState() {
        heading.innerText = active ? 'Highlight On' : 'Highlight Off';
        searchTextInput &&
            highlightBtn &&
            (searchTextInput.disabled = highlightBtn.disabled = !active);
    }

    // Tooltips
    const slider = document.querySelector('.slider');
    const sun = document.querySelector('.fa.fa-sun-o');
    const moon = document.querySelector('.fa.fa-moon-o');

    const tooltipButtons = [slider, sun, moon];
    const tooltipsText = ['Off/On', 'Dark theme', 'Light theme'];
    let tooltipTimer;

    tooltipButtons.forEach((button, index) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerText = tooltipsText[index];
        document.body.appendChild(tooltip);

        button.addEventListener('mouseover', function () {
            tooltipTimer = setTimeout(function () {
                const rect = button.getBoundingClientRect();
                const tooltipX = rect.left + window.pageXOffset;
                const tooltipY = rect.bottom + window.pageYOffset + 5;

                tooltip.style.left = `${tooltipX}px`;
                tooltip.style.top = `${tooltipY}px`;

                tooltip.style.display = 'inline-block';
                tooltip.style.opacity = 1;
            }, 500);
        });

        button.addEventListener('mouseout', function () {
            clearTimeout(tooltipTimer);
            tooltip.style.display = 'none';
            tooltip.style.opacity = 0;
        });
    });
});
