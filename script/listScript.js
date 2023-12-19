document.addEventListener("DOMContentLoaded", function () {
  const addListForm = document.getElementById("addListForm");
  const listNameInput = document.getElementById("listNameInput");
  const wordsContainer = document.getElementById("wordsContainer");
  const newWordInput = document.getElementById("newWordInput");

  addListForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const listName = listNameInput.value.trim();
    const words = [];

    const wordDivs = document.querySelectorAll("#wordsContainer > div");
    wordDivs.forEach((wordDiv) => {
      const checkbox = wordDiv.querySelector(".word-input");
      const wordInput = wordDiv.querySelector("input[type='text']");

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
      const newList = {
        id: Date.now().toString(),
        name: listName,
        words: words,
      };

      saveWordList(newList);

      listNameInput.value = "";
      wordsContainer.innerHTML = "";
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

  const addWordBtn = document.getElementById("addWordBtn");
  addWordBtn.addEventListener("click", function () {
    const word = newWordInput.value.trim();
    if (word !== "") {
      addWord(word);
      newWordInput.value = "";
    }
  });

  function addWord(word) {
    const wordDiv = document.createElement("div");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.className = "word-input";

    const wordInput = document.createElement("input");
    wordInput.type = "text";
    wordInput.value = word;
    wordInput.readOnly = true; 

    wordDiv.appendChild(checkbox);
    wordDiv.appendChild(wordInput);

    wordsContainer.appendChild(wordDiv);
  }
});
