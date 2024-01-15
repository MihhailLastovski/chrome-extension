document.addEventListener("DOMContentLoaded", function () {
  const cancelBtn = document.getElementById("cancelBtn");
  cancelBtn.addEventListener("click", function () {
    window.location.href = "popup.html";
  });
  const apiKey = "AIzaSyBizfdeE-hxfeh-quvNXqEwAQSJa7WQuJk"; 

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
      addListForm.lastElementChild.appendChild(saveChangesBtn);
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

  /*************************************changeSheets.js********************************************/

  //const divWithButtonsInList = document.getElementById("buttonsInLists");
  const googleListBtn = document.getElementById("googleListBtn");
  const csvListBtn = document.getElementById("csvListBtn");
  const fileListBtn = document.getElementById("fileListBtn");
  const linkToListBtn = document.getElementById("linkToList");

  var divWithListImportSettigs = document.createElement("div");
  addListForm.lastElementChild.insertBefore(
    divWithListImportSettigs,
    wordsContainer
  );

  googleListBtn.addEventListener("click", function () {
    window.location.href = "changeSheets.html";
  });
  linkToListBtn.addEventListener("click", function () {
    divWithListImportSettigs.innerHTML = "";
  
    var linkInput = document.createElement("input");
    linkInput.type = "text";
    linkInput.id = "linkInput";
    linkInput.placeholder = "Paste the link";
    var listBox = document.createElement("select");
    listBox.id = "listbox";
    var okButton = document.createElement("button");
    okButton.textContent = "OK";
  
    okButton.addEventListener("click", function () {
      fetchListsAndAddToListbox(linkInput.value);
      linkInput.value = "";
    });
  
    divWithListImportSettigs.appendChild(linkInput);
    divWithListImportSettigs.appendChild(okButton);
    divWithListImportSettigs.appendChild(listBox);
  });

  async function fetchListsAndAddToListbox(url) {
    try {
      const spreadsheetId = getSpreadsheetIdFromUrl(url); 
  
      const sheetsResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`
      );
  
      if (!sheetsResponse.ok) {
        console.error("Error fetching sheets. HTTP Status:", sheetsResponse.status);
        const errorText = await sheetsResponse.text();
        console.error("Error details:", errorText);
        return;
      }
  
      const sheetsData = await sheetsResponse.json();
      const sheetsList = sheetsData.sheets;
  
      if (sheetsList && sheetsList.length > 0) {
        sheetsList.forEach((sheet) => {
          addSheetToListbox(sheet.properties.title);
        });
      } else {
        console.error("No sheets found.");
      }
    } catch (error) {
      console.error("Error fetching sheets:", error);
    }
  }
  

  function addSheetToListbox(sheetName) {
    const listBox = document.getElementById("listbox");

    const option = document.createElement("option");
    option.value = sheetName;
    option.text = sheetName;

    listBox.add(option);
  }
  csvListBtn.addEventListener("click", function () {
    divWithListImportSettigs.innerHTML = "";

    var csvInput = document.createElement("input");
    csvInput.type = "text";
    csvInput.id = "textInput";
    csvInput.placeholder = "Paste the link";

    var csvButton = document.createElement("button");
    csvButton.textContent = "OK";

    csvButton.addEventListener("click", function () {
      async function fetchDataAndProcessWords(url) {
        try {
          const response = await fetch(url);
          const csvData = await response.text();

          const rows = csvData.split("\n");
          const wordsArray = rows.reduce((words, row) => {
            const columns = row.split(",");
            const wordsInRow = columns.map((cell) => cell.trim());
            return words.concat(wordsInRow.filter((word) => word !== ""));
          }, []);

          wordsArray.forEach((word) => {
            addWord(word.trim());
          });
        } catch (error) {
          console.error("Ошибка при получении данных:", error);
        }
      }

      const csvLink = csvInput.value.replace("/edit", "/export?format=csv");

      fetchDataAndProcessWords(csvLink);
      
      csvInput.value = "";
    });
    
  
    
    var csvh2 = document.createElement("h2");
    csvh2.textContent = "Google Sheets assistant";
    csvh2.style.textAlign = "left";
    csvh2.style.marginLeft = "17%";

    var csvp = document.createElement("p");
    csvp.innerHTML = `<p>          
      1. File > Share > Publish to web.<br>
      2. Click Publish.<br>
      3. Choose format csv.<br>
      4. Copy the URL.          
    </p>`;
    csvp.style.textAlign = "left";
    csvp.style.marginLeft = "13%";

    divWithListImportSettigs.appendChild(csvh2);
    divWithListImportSettigs.appendChild(csvp);
    divWithListImportSettigs.appendChild(csvInput);
    divWithListImportSettigs.appendChild(csvButton);
  });
  function getSpreadsheetIdFromUrl(url) {
    const regex = /\/spreadsheets\/d\/(.+?)\//;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
  }
  fileListBtn.addEventListener("click", function () {
    // Выбор файла и перенос значений в список
    divWithListImportSettigs.innerHTML = "";

    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".txt";

    fileInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          const content = event.target.result;
          const words = content
            .split(/\s+/)
            .filter((word) => word.trim() !== "");
          words.forEach((word) => {
            addWord(word.trim());
          });
        };
        reader.readAsText(file);
      }
    });

    divWithListImportSettigs.appendChild(fileInput);
  });
});
