document.addEventListener('DOMContentLoaded', function () {
    var div = document.createElement('div');
    div.className = 'header';
    div.innerHTML = `
        <div class="dropdown">
            <i class="fa-2x fa fa-bars" aria-hidden="true" style="color: #FFFFFF;"></i>
            <div class="dropdown-content">
                <a href="popup.html"><i class="fa fa-home" aria-hidden="true"></i> Home</a>
                <a href="guide.html"><i class="fa fa-file-text" aria-hidden="true"></i> Apps Script guide</a>
                <a href="statuses.html"><i class="fa fa-book" aria-hidden="true"></i> Statuses</a>
                <a href="attributes.html"><i class="fa fa-cube" aria-hidden="true"></i> Attributes</a>
                <a href="settings.html"><i class="fa fa-cog" aria-hidden="true"></i> Settings</a>
                <a href="about.html"><i class="fa fa-info-circle" aria-hidden="true"></i> About</a>
            </div>
        </div>   
        <img src="../images/RS2883_Alpha_Logo.png" id="alphaLogo" alt="logo" width="50">       
        <!--h1 class="heading">Highlight Off</h1-->
        <label class="switch">
            <input id="highlightCheckbox" class="toggleSwitch" type="checkbox">
            <span class="slider"></span>
        </label>`;

    var body = document.querySelector('body');
    body.insertBefore(div, body.firstChild);

    const toggleSwitch = document.getElementById('highlightCheckbox');
    //const heading = document.querySelector('.heading');
    const searchTextInput = document.getElementById('searchText');
    const highlightBtn = document.getElementById('highlightBtn');
    let active;

    async function toggleSwitchIsActive() {
        const result = await new Promise((resolve, reject) => {
            chrome.storage.local.get('isActive', (result) => {
                resolve(result);
            });
        });
        active = result.isActive;
        updateUIState();
        toggleSwitch.checked = active;
    }
    toggleSwitchIsActive();

    toggleSwitch.addEventListener('change', function () {
        active = !active;
        chrome.storage.local.set({ isActive: active });
        updateUIState();

        if (active === false) {
            chrome.tabs.query(
                { active: true, currentWindow: true },
                function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'removeHighlight',
                    });
                }
            );
            chrome.action.setBadgeText({ text: '' });
            chrome.storage.local.set({ count: 0 });
        }
    });

    function updateUIState() {
        //heading.innerText = active ? 'Highlight On' : 'Highlight Off';
        searchTextInput &&
            highlightBtn &&
            (searchTextInput.disabled = highlightBtn.disabled = !active);
    }

    const footerDate = document.getElementById('currentYear');
    if (footerDate) {
        var currentYear = new Date().getFullYear();
        footerDate.textContent = currentYear;
    }

    /*******************************************Menu************************************************/

    document
        .querySelector('.fa-2x.fa.fa-bars')
        .addEventListener('click', function () {
            const menu = document.querySelector('.dropdown-content');
            if (menu.style.display === 'block') {
                menu.style.display = 'none';
            } else {
                menu.style.display = 'block';
            }
        });

    /*****************************************Tooltips**********************************************/

    const slider = document.querySelector('.slider');
    const csvListBtn = document.getElementById('csvListBtn');

    let tooltipButtons = [slider];
    let tooltipsText = ['Off/On'];
    let tooltipTimer;

    if (highlightBtn) {
        // popup.html
        const newListBtn = document.getElementById('newListBtn');
        tooltipButtons.push(highlightBtn);
        tooltipButtons.push(newListBtn);

        tooltipsText.push('Search');
        tooltipsText.push('Add new list');
    } else if (csvListBtn) {
        // list.html
        const fileListBtn = document.getElementById('fileListBtn');

        tooltipButtons.push(csvListBtn);
        tooltipButtons.push(fileListBtn);

        tooltipsText.push('Import Google Sheets');
        tooltipsText.push('Import file');
    }

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