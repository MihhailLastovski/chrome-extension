document.addEventListener("DOMContentLoaded", function () {
    const toggleSwitch = document.querySelector(".toggleSwitch");
    const heading = document.querySelector(".heading");
    let active;

    const createListBtn = document.getElementById('createListBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const userData = document.getElementById('userData');
    const radioButtons = document.querySelectorAll("label.radioLabel input");
    var selectedButton = null;
    var linkInput, sheetInput, rangeInput;

    radioButtons.forEach(btn => {
        btn.addEventListener('change', function() {
            if (btn.checked) {
                selectedButton = btn;               
            }
            if (btn.value === "external") {
                var form = document.createElement("form");

                linkInput = document.createElement("input");
                linkInput.type = "text";
                linkInput.required = true;
                linkInput.placeholder = "Public URL";

                sheetInput = document.createElement("input");
                sheetInput.type = "text";
                sheetInput.required = true;
                sheetInput.placeholder = "Sheet name";

                rangeInput = document.createElement("input");
                rangeInput.type = "text";
                rangeInput.required = true;
                rangeInput.placeholder = "A1:B5";

                form.appendChild(linkInput);
                form.appendChild(sheetInput);
                form.appendChild(rangeInput);
                userData.appendChild(form);
            } else {
                userData.innerHTML = "";
            }
        });
    });

    createListBtn.addEventListener("click", function () {
        if (selectedButton!== null && selectedButton.value === "external") {
            getDataFromSheets(linkInput.value, sheetInput.value, rangeInput.value);   
            window.location.href = "list.html";     
        } else {
            window.location.href = "list.html";
        }
    });

    cancelBtn.addEventListener("click", function () {
        window.location.href = "popup.html";
    });

    function getDataFromSheets(url, sheetName, range) {
        const API_KEY = 'AIzaSyBizfdeE-hxfeh-quvNXqEwAQSJa7WQuJk';
        const dataList = []; // List to accumulate data
    
        // Extract Spreadsheet ID from the URL
        const regex = /\/spreadsheets\/d\/([\w-]+)\//;
        const match = url.match(regex);
        const SPREADSHEET_ID = match ? match[1] : null;
    
        if (!SPREADSHEET_ID) {
            console.error('Invalid Google Sheets URL');
            return;
        }
    
        const RANGE = `${sheetName}!${range}`;
    
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.values && data.values.length > 0) {
                data.values.forEach(row => {
                    dataList.push(...row); // Add each row to the list
                });
    
                // Display accumulated list in the console
                console.log('Data List:', dataList);
            } else {
                console.log('No data found in the response.');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }


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