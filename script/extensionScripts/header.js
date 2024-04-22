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
            <span class="slider" tooltipText="Off/On"></span>
        </label>`;

    var body = document.querySelector('body');
    body.insertBefore(div, body.firstChild);

    const toggleSwitch = document.getElementById('highlightCheckbox');
    const image = document.getElementById('alphaLogo');
    const searchTextInput = document.getElementById('searchText');
    const highlightBtn = document.getElementById('highlightBtn');
    let active;

    image.addEventListener("click", function() {
        window.location.href = "popup.html";
      });

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
});
