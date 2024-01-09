document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.querySelector(".toggleSwitch");
  const heading = document.querySelector(".heading");
  let active;

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
  const listId = urlParams.get('listId');
  const encodedDataString = urlParams.get('data');
  const fileData = urlParams.get('dataFile');

  if (encodedDataString) {
    const dataList = JSON.parse(decodeURIComponent(encodedDataString));
    if (dataList && dataList.length > 0) {
        dataList.forEach(word => {
            addWord(word, true); 
        });
    }
  }

  if (fileData) {
    const decodedData = decodeURIComponent(fileData);
    const wordsArray = decodedData.split(',');
    wordsArray.forEach(word => {
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
          ...(encodedDataString && { icon: 'fa-sheet-plastic' })
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

  /*Костыль. Пора бы уже починить...*/
  async function toggleSwitchIsActive() {
    const result = await new Promise((resolve, reject) => {
      chrome.storage.local.get("isActive", (result) => {
        resolve(result);
      });
    });
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
