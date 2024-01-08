document.addEventListener("DOMContentLoaded", function () {
    const toggleSwitch = document.querySelector(".toggleSwitch");
    const heading = document.querySelector(".heading");
    let active;

    const createListBtn = document.getElementById('createListBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const userData = document.getElementById('userData');
    const buttonsDiv = document.getElementById('buttonsDiv');
    const radioButtons = document.querySelectorAll("label.radioLabel input");
    var selectedButton = null;
    var linkInput, sheetInput, rangeInput;

    var div = document.createElement("div");
    div.className = "inputBoxes";
    userData.insertBefore(div, buttonsDiv);

    radioButtons.forEach(btn => {
        btn.addEventListener('change', function() {
            if (btn.checked) {
                selectedButton = btn;               
            }
            if (btn.value === "external") {
                div.innerHTML = "";               
                
                //createListBtn.type = "submit";

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

                div.appendChild(linkInput);
                div.appendChild(sheetInput);
                div.appendChild(rangeInput);               
            } 
            else if(btn.value === "externalLocal"){
                //createListBtn.type = "button";
                div.innerHTML = "";                

                var fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = ".txt"; 

                fileInput.addEventListener('change', function(event) {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            const content = event.target.result;
                            const words = content.split(/\s+/).filter(word => word.trim() !== '');
                            window.location.href = `list.html?dataFile=${words}`
                        };
                        reader.readAsText(file);
                    }
                });

                div.appendChild(fileInput);
            }
            else {
                //createListBtn.type = "button";
                div.innerHTML = "";
            }
        });
    });

    createListBtn.addEventListener("click", function (event) {
        event.preventDefault(); 
        
        if (selectedButton !== null && selectedButton.value === "external") {
            getDataFromSheets(linkInput.value, sheetInput.value, rangeInput.value, function(dataList) {
                const dataString = encodeURIComponent(JSON.stringify(dataList));
                window.location.href = `list.html?data=${dataString}`;
            });
        } else {
            window.location.href = "list.html";
        }
    });
    

    cancelBtn.addEventListener("click", function () {
        window.location.href = "popup.html";
    });

    function getDataFromSheets(url, sheetName, range, callback) {
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
                const dataList = [];
                data.values.forEach(row => {
                    dataList.push(...row); // Add each row to the list
                });
                console.log(dataList)
                // Вместо отображения в консоли, вызываем колбэк, передавая полученный dataList
                if (callback && typeof callback === 'function') {
                    callback(dataList);
                }
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