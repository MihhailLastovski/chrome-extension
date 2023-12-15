document.addEventListener("DOMContentLoaded", function () {
  const addListForm = document.getElementById("addListForm");
  const listNameInput = document.getElementById("listNameInput");
  const wordInput = document.getElementById("wordInput");
  const wordLists = document.getElementById("wordLists");
  let enabledLists = [];

  // Функция для отображения списков слов
  function renderWordLists(lists) {
    wordLists.innerHTML = "";
    lists.forEach((list) => {
      const listItem = document.createElement("li");
      listItem.textContent = list.name;

      const enableButton = document.createElement("button");
      enableButton.textContent = enabledLists.includes(list.id) ? "Off" : "On";
      enableButton.addEventListener("click", function () {
        const enable = !enabledLists.includes(list.id);
        toggleWordList(list.id, enable);
        renderWordLists(lists);
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        deleteWordList(list.id);
        renderWordLists(lists);
      });

      listItem.appendChild(enableButton);
      listItem.appendChild(deleteButton);
      wordLists.appendChild(listItem);
    });
  }

  function saveWordList(wordList) {
    chrome.storage.local.get("wordLists", function (data) {
      let lists = data.wordLists || [];
      lists.push(wordList);

      chrome.storage.local.set({ wordLists: lists }, function () {
        getAllWordLists(renderWordLists);
      });
    });
  }

  function getAllWordLists(callback) {
    chrome.storage.local.get("wordLists", function (data) {
      let lists = data.wordLists || [];
      callback(lists);
    });
  }

  addListForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const listName = listNameInput.value.trim();
    const words = wordInput.value.split(",").map((word) => word.trim());

    if (listName && words.length > 0) {
      const newList = {
        id: Date.now().toString(),
        name: listName,
        words: words,
      };

      saveWordList(newList);

      listNameInput.value = "";
      wordInput.value = "";

      getAllWordLists(renderWordLists);
    } else {
      alert("Enter list name");
    }
  });

  function deleteWordList(listId) {
    chrome.storage.local.get("wordLists", function (data) {
      let lists = data.wordLists || [];
      let updatedLists = lists.filter((list) => list.id !== listId);

      chrome.storage.local.set({ wordLists: updatedLists }, function () {
        getAllWordLists(renderWordLists);
      });
    });
  }

  function highlightWordsFromList(listId) {
    chrome.storage.local.get("wordLists", function (data) {
      const lists = data.wordLists || [];
      const listToHighlight = lists.find((list) => list.id === listId);

      if (listToHighlight) {
        listToHighlight.words.forEach((word) => {
          const searchText = word.trim();
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: highlightText,
                args: [searchText],
              });
              highlightText(searchText); // Вызов здесь
            }
          );
        });
      }
    });
  }

  function removeHighlight() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "removeHighlight" });
    });
  }

  function toggleWordList(listId, enable) {
    if (enable) {
      if (!enabledLists.includes(listId)) {
        enabledLists.push(listId);
        highlightWordsFromList(listId);
      }
    } else {
      enabledLists = enabledLists.filter((id) => id !== listId);
      removeHighlight();
    }

    chrome.storage.local.set({ enabledLists: enabledLists }, function () {});
  }

  getAllWordLists(function (lists) {
    chrome.storage.local.get("enabledLists", function (data) {
      enabledLists = data.enabledLists || [];
      renderWordLists(lists);
      console.log(lists);
    });
  });
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.action === "removeHighlight") {
      removeHighlight();
    }
  });
});
