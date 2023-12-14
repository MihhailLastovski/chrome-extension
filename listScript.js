document.addEventListener("DOMContentLoaded", function () {
  const addListForm = document.getElementById("addListForm");
  const listNameInput = document.getElementById("listNameInput");
  const wordInput = document.getElementById("wordInput");
  const wordLists = document.getElementById("wordLists");
  let enabledLists = []; // Добавим переменную для хранения включенных списков

  // Функция для отображения списков слов
  function renderWordLists(lists) {
    wordLists.innerHTML = "";
    lists.forEach((list) => {
      const listItem = document.createElement("li");
      listItem.textContent = list.name;

      const enableButton = document.createElement("button");
      enableButton.textContent = enabledLists.includes(list.id)
        ? "Отключить"
        : "Включить";
      enableButton.addEventListener("click", function () {
        const enable = !enabledLists.includes(list.id);
        toggleWordList(list.id, enable);
        renderWordLists(lists);
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Удалить";
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
        console.log("Список слов сохранен:", wordList);
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
      alert("Введите название списка и слова");
    }
  });

  function deleteWordList(listId) {
    chrome.storage.local.get("wordLists", function (data) {
      let lists = data.wordLists || [];
      let updatedLists = lists.filter((list) => list.id !== listId);

      chrome.storage.local.set({ wordLists: updatedLists }, function () {
        console.log("Список слов удален:", listId);
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
            }
          );
          highlightText(searchText);
        });
      }
    });
  }

  function removeHighlight() {
    document.querySelectorAll('span.highlighted').forEach(element => {
      const parent = element.parentNode;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    });
  }
  
  function toggleWordList(listId, enable) {
    if (enable) {
      if (!enabledLists.includes(listId)) {
        enabledLists.push(listId);
        highlightWordsFromList(listId);
      }
    } else {
      enabledLists = enabledLists.filter(id => id !== listId);
      removeHighlight(); // Убираем выделение при отключении списка слов
    }
  
    chrome.storage.local.set({ enabledLists: enabledLists }, function () {
      console.log("Список слов", listId, enable ? "включен" : "отключен");
    });
  }

  getAllWordLists(function (lists) {
    chrome.storage.local.get("enabledLists", function (data) {
      enabledLists = data.enabledLists || [];
      renderWordLists(lists);
      console.log(lists);
    });
  });
});
