document.addEventListener("DOMContentLoaded", function () {
  const cancelBtn = document.getElementById("cancelBtn");
  cancelBtn.addEventListener("click", function () {
    window.location.href = "popup.html";
  });

  const lastListItem = document.getElementById("lastListItem");

  const addListForm = document.getElementById("addListForm");
  const listNameInput = document.getElementById("listNameInput");
  const wordsContainer = document.getElementById("wordsContainer");
  const newWordInput = document.getElementById("newWordInput");
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const listId = urlParams.get("listId");
  const encodedDataString = urlParams.get("data");
  const encodedDataStringList = urlParams.get("dataList");
  const fileData = urlParams.get("dataFile");

  if (encodedDataString) {
    const dataList = JSON.parse(decodeURIComponent(encodedDataString));
    if (dataList && dataList.length > 0) {
      dataList.forEach((word) => {
        addWord(word, true);
      });
    }
  }
  if (encodedDataStringList) {
    const data = decodeURIComponent(encodedDataStringList);
    const rows = data.split("\n");
    rows.forEach((row) => {
      const columns = row.split("\t");
      const word = columns[0].trim();
      addWord(word, true);
    });
  }
  if (fileData) {
    const decodedData = decodeURIComponent(fileData);
    const wordsArray = decodedData.split(",");
    wordsArray.forEach((word) => {
      addWord(word.trim(), true);
    });
  }

  chrome.storage.local.get("wordLists", function (data) {
    let lists = data.wordLists || [];
    const listIndex = lists.findIndex((list) => list.id === listId);

    if (listIndex !== -1) {
      const listToEdit = lists[listIndex];

      listNameInput.value = listToEdit.name;

      listToEdit.words.forEach((wordObj) => {
        if (wordObj.word.trim() !== "") {
          addWord(wordObj.word, wordObj.enabled);
        }
      });

      const saveChangesBtn = document.createElement("button");
      saveChangesBtn.textContent = "Save Changes";
      saveChangesBtn.addEventListener("click", function () {
        saveEditedList(listIndex, lists);
      });
      const addWordBtn = document.getElementById("saveListBtn");
      if (addWordBtn) {
        addWordBtn.style.display = "none";
      }
      addListForm.appendChild(saveChangesBtn);
      newWordInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          const word = newWordInput.value.trim();
          if (word !== "") {
            addWord(word);
            newWordInput.value = "";
          }
        }
      });
    }
  });

  function saveEditedList(index, lists) {
    const listName = listNameInput.value.trim();
    const editedWords = [];

    const wordDivs = document.querySelectorAll("#wordsContainer > div");
    wordDivs.forEach((wordDiv) => {
      const checkbox = wordDiv.querySelector(".word-checkbox");
      const wordInput = wordDiv.querySelector(".word-input");

      const word = wordInput.value.trim();
      const enabled = checkbox.checked;

      if (word !== "") {
        editedWords.push({
          word: word,
          enabled: enabled,
        });
      }
    });

    if (listName && editedWords.length > 0) {
      lists[index].name = listName;
      lists[index].words = editedWords;

      chrome.storage.local.set({ wordLists: lists }, function () {});
    } else {
      alert("Enter list name or non-empty words");
    }
  }

  addListForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const listName = listNameInput.value.trim();
    const words = [];

    const wordDivs = document.querySelectorAll("#wordsContainer > div");
    wordDivs.forEach((wordDiv) => {
      const checkbox = wordDiv.querySelector(".word-checkbox");
      const wordInput = wordDiv.querySelector(".word-input");

      const word = wordInput.value.trim();
      const enabled = checkbox.checked;

      if (word !== "") {
        words.push({
          word: word,
          enabled: enabled,
        });
      }
    });

    if (listName && words.length > 0) {
      if (!listId) {
        const newList = {
          id: Date.now().toString(),
          name: listName,
          words: words,
          ...(encodedDataString && { icon: "fa-sheet-plastic" }),
        };

        saveWordList(newList);
      } else {
      }

      listNameInput.value = "";
      wordsContainer.innerHTML = "";
      window.location.href = "popup.html";
    } else {
      alert("Enter list name or words");
    }
  });

  function saveWordList(wordList) {
    chrome.storage.local.get("wordLists", function (data) {
      let lists = data.wordLists || [];
      lists.push(wordList);

      chrome.storage.local.set({ wordLists: lists });
    });
  }

  newWordInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      const word = newWordInput.value.trim();
      if (word !== "") {
        addWord(word);
        newWordInput.value = "";
      }
    }
  });

  function addWord(word, enabled = true) {
    const wordDiv = document.createElement("div");
    wordDiv.className = "list-wordsItem";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = enabled;
    checkbox.id = "cbox" + wordsContainer.childElementCount;
    checkbox.className = "word-checkbox";

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;

    const wordInput = document.createElement("input");
    wordInput.type = "text";
    wordInput.value = word;
    wordInput.className = "word-input";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function () {
      wordDiv.remove();
    });

    wordDiv.appendChild(checkbox);
    wordDiv.appendChild(label);
    wordDiv.appendChild(wordInput);
    wordDiv.appendChild(deleteBtn);

    wordsContainer.insertBefore(wordDiv, lastListItem);
  }

  const saveChangesBtn = document.getElementById("saveChangesBtn");
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener("click", function () {
      saveEditedList(listIndex, lists);
    });
  }

  const guide = document.getElementById("guide");
  const showGuide = document.getElementById("showGuide");

  showGuide.addEventListener("click", function () {
    const guideDisplay = window
      .getComputedStyle(guide)
      .getPropertyValue("display");
    guide.style.display = guideDisplay === "none" ? "block" : "none";
  });

  /***********************************************************/

    const createListBtn = document.getElementById('createListBtn');
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
                
                // createListBtn.type = "submit";

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
                // createListBtn.type = "button";
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
            // else {
            //     //createListBtn.type = "button";
            //     div.innerHTML = "";
            // }
        });
    });

    createListBtn.addEventListener("click", function (event) {
        // event.preventDefault(); 
        
        // if (selectedButton !== null && selectedButton.value === "external") {
            getDataFromSheets(linkInput.value, sheetInput.value, rangeInput.value, function(dataList) {
                const dataString = encodeURIComponent(JSON.stringify(dataList));
                window.location.href = `list.html?data=${dataString}`;
            });
            /*Вариант где не нужны значения ячеек*/
            // getDataFromSheets(linkInput.value, sheetInput.value, function(dataList) {
            //     const dataString = encodeURIComponent(JSON.stringify(dataList));
            //     window.location.href = `list.html?data=${dataString}`;
            // });

        // } else {
        //     window.location.href = "list.html";
        // }
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
    /*Вариант где не нужны значения ячеек*/
    // function getDataFromSheets(url, sheetName, callback) {
    //     const API_KEY = 'AIzaSyBizfdeE-hxfeh-quvNXqEwAQSJa7WQuJk';
    //     const dataList = []; // List to accumulate data
    
    //     // Extract Spreadsheet ID from the URL
    //     const regex = /\/spreadsheets\/d\/([\w-]+)\//;
    //     const match = url.match(regex);
    //     const SPREADSHEET_ID = match ? match[1] : null;
    
    //     if (!SPREADSHEET_ID) {
    //         console.error('Invalid Google Sheets URL');
    //         return;
    //     }
    
    //     fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/?key=${API_KEY}&includeGridData=true`)
    //         .then(response => {
    //             if (!response.ok) {
    //                 throw new Error('Network response was not ok.');
    //             }
    //             return response.json();
    //         })
    //         .then(data => {
    //             if (data && data.sheets && data.sheets.length > 0) {
    //                 const sheetData = data.sheets.find(sheet => sheet.properties.title === sheetName);
    //                 if (sheetData && sheetData.data && sheetData.data[0] && sheetData.data[0].rowData) {
    //                     const rowData = sheetData.data[0].rowData;
    //                     rowData.forEach(row => {
    //                         if (row.values) {
    //                             row.values.forEach(cell => {
    //                                 dataList.push(cell.formattedValue); // Add each cell value to the list
    //                             });
    //                         }
    //                     });
    //                     console.log(dataList);
    //                     // Вместо отображения в консоли, вызываем колбэк, передавая полученный dataList
    //                     if (callback && typeof callback === 'function') {
    //                         callback(dataList);
    //                     }
    //                 } else {
    //                     console.log('No data found in the response.');
    //                 }
    //             } else {
    //                 console.log('No sheets found in the response.');
    //             }
    //         })
    //         .catch(error => {
    //             console.error('Error fetching data:', error);
    //         });
    // }
});
