document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.querySelector(".toggleSwitch");
  const heading = document.querySelector(".heading");
  let active;

  const cancelBtn = document.getElementById("cancelBtn");
  cancelBtn.addEventListener("click", function () {
    window.location.href = "popup.html";
  });

  const addListForm = document.getElementById("addListForm");
  const listNameInput = document.getElementById("listNameInput");
  const wordsContainer = document.getElementById("wordsContainer");
  const newWordInput = document.getElementById("newWordInput");
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const listId = urlParams.get('listId');

  chrome.storage.local.get("wordLists", function (data) {
    let lists = data.wordLists || [];
    const listIndex = lists.findIndex((list) => list.id === listId);
  
    if (listIndex !== -1) {
      const listToEdit = lists[listIndex];
  
      listNameInput.value = listToEdit.name;
      wordsContainer.innerHTML = "";
  
      // Создаем новый элемент перед существующими словами
      const newWordItem = document.createElement("div");
      newWordItem.className = "list-wordsItem";
      
      const newCheckbox = document.createElement("input");
      newCheckbox.className = "word-checkbox";
      newCheckbox.type = "checkbox";
      
      const newWordInput = document.createElement("input");
      newWordInput.className = "word-input";
      newWordInput.type = "text";
      
      newWordItem.appendChild(newCheckbox);
      newWordItem.appendChild(newWordInput);
      wordsContainer.appendChild(newWordItem);
  
       listToEdit.words.forEach((wordObj) => {
      if (wordObj.word.trim() !== "") { // Проверяем, что слово не пустое
        addWord(wordObj.word, wordObj.enabled);
      }
    });
  
      const saveChangesBtn = document.createElement("button");
      saveChangesBtn.textContent = "Save Changes";
      saveChangesBtn.addEventListener("click", function () {
        saveEditedList(listIndex, lists);
      });
  
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
      
      addWordBtn.addEventListener("click", function () {
        const word = newWordInput.value.trim();
        if (word !== "") {
          addWord(word);
          newWordInput.value = "";
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

      editedWords.push({
        word: word,
        enabled: enabled,
      });
    });

    if (listName && editedWords.length > 0) {
      lists[index].name = listName;
      lists[index].words = editedWords;

      chrome.storage.local.set({ wordLists: lists }, function () {
      });
    } else {
      alert("Enter list name or words");
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
  
  addWordBtn.addEventListener("click", function () {
    const word = newWordInput.value.trim();
    if (word !== "") {
      addWord(word);
      newWordInput.value = "";
    }
  });
  

  function addWord(word, enabled = true) {
    const wordDiv = document.createElement("div");
    wordDiv.className = "list-wordsItem";
  
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = enabled;
    checkbox.className = "word-checkbox";
  
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
    wordDiv.appendChild(wordInput);
    wordDiv.appendChild(deleteBtn);
  
    wordsContainer.appendChild(wordDiv);
  }
  


  const saveChangesBtn = document.getElementById("saveChangesBtn");
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener("click", function () {
      saveEditedList(listIndex, lists);
    });
  }

  // Добавляем обработчик события для добавления нового слова
  const addWordForm = document.getElementById("addWordForm");
  if (addWordForm) {
    addWordForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const newWord = newWordInput.value.trim();
      if (newWord !== "") {
        addWord(newWord);
        newWordInput.value = "";
      }
    });
  }

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
