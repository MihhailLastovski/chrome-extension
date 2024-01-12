let selectedColor;
document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get("enabledLists", function (data) {
    let enabledLists = data.enabledLists || [];

    enabledLists.forEach((listId) => {
      toggleWordList(listId, false);
    });

    enabledLists = [];
    renderWordLists([]);
  });
  const searchTextInput = document.getElementById("searchText");
  const highlightBtn = document.getElementById("highlightBtn");
  const newListBtn = document.getElementById("newListBtn");

  const counterElem = document.getElementById("highlightedCount");
  const colorOptions = document.querySelectorAll(".color-option");
  colorOptions.forEach((option) => {
    if (option.checked) {
      selectedColor = option.value;
    }
  });

  colorOptions.forEach((option) => {
    option.addEventListener("change", function () {
      selectedColor = this.value;
    });
  });

  highlightBtn.addEventListener("click", function () {
    let searchText = searchTextInput.value.trim();

    function removeHighlight() {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "removeHighlight" });
      });
    }

    function highlight() {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["./script/contentScript.js"],
        });
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "highlight",
          searchText: searchText,
          highlightColor: selectedColor,
        });
      });
    }
    removeHighlight();
    highlight();
  });

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.action === "updateBadge") {
      const count = request.count || 0;
      chrome.action.setBadgeText({ text: count > 0 ? count.toString() : "" });
      chrome.action.setBadgeBackgroundColor({ color: "#b3ff99" });
      counterElem.innerHTML = `Word counter: ${count}`;
      chrome.storage.local.set({ count: count });
    }
  });

  const wordLists = document.getElementById("wordLists");
  let enabledLists = [];

  function renderWordLists(lists) {
    wordLists.innerHTML = "";
    lists.forEach((list) => {
      const listItem = document.createElement("div");
      listItem.className = "wordListsItem";
      if (list.icon) {
        const iconList = document.createElement("i");
        iconList.innerHTML = "<i>Icon</i>";
        listItem.appendChild(iconList);
      }

      const textContainer = document.createElement("div");
      textContainer.className = "textContainer";
      textContainer.textContent = list.name;

      const buttons = document.createElement("div");
      buttons.className = "buttonsContainer";
      const enableButton = document.createElement("button");
      enableButton.innerHTML = enabledLists.includes(list.id)
        ? '<i class="fa fa-pause" aria-hidden="true"></i>'
        : '<i class="fa fa-play" aria-hidden="true"></i>';
      enableButton.addEventListener("click", function () {
        chrome.action.setBadgeText({ text: '' });
        chrome.storage.local.set({count: 0});
        counterUpdating();
        const enable = !enabledLists.includes(list.id);
        toggleWordList(list.id, enable);
        renderWordLists(lists);
      });
      buttons.appendChild(enableButton);

      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';
      deleteButton.addEventListener("click", function () {
        deleteWordList(list.id);
        renderWordLists(lists);
      });
      buttons.appendChild(deleteButton);

      const updateButton = document.createElement("button");
      updateButton.innerHTML =
        '<i class="fa fa-pencil" aria-hidden="true"></i>';
      updateButton.addEventListener("click", function () {
        window.location.href = `list.html?listId=${list.id}`;
      });
      buttons.appendChild(updateButton);
      listItem.appendChild(textContainer);
      listItem.appendChild(buttons);
      wordLists.appendChild(listItem);
    });
  }

  function getAllWordLists(callback) {
    chrome.storage.local.get("wordLists", function (data) {
      let lists = data.wordLists || [];
      callback(lists);
    });
  }

  getAllWordLists(function (lists) {
    chrome.storage.local.get("enabledLists", function (data) {
      enabledLists = data.enabledLists || [];
      renderWordLists(lists);
      console.log(lists);
    });
  });

  function toggleWordList(listId, enable) {
    function removeHighlight() {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "removeHighlight",
          listId: listId,
        });
      });
    }

    if (enable) {
      if (!enabledLists.includes(listId)) {
        enabledLists.push(listId);
        highlightWordsFromList(listId);
      }
    } else {
      enabledLists = enabledLists.filter((id) => id !== listId);
      removeHighlight(listId);
    }

    chrome.storage.local.set({ enabledLists: enabledLists }, function () {});
  }

  function highlightWordsFromList(listId) {
    chrome.storage.local.get("wordLists", function (data) {
      const lists = data.wordLists || [];
      const listToHighlight = lists.find((list) => list.id === listId);

      if (listToHighlight) {
        const sortedWords = listToHighlight.words.sort((a, b) => {
          return b.word.length - a.word.length;
        });

        sortedWords.forEach((wordObj) => {
          if (wordObj.enabled) {
            const searchText = wordObj.word.trim();
            chrome.tabs.query(
              { active: true, currentWindow: true },
              function (tabs) {
                chrome.scripting.executeScript({
                  target: { tabId: tabs[0].id },
                  files: ["./script/contentScript.js"],
                });
                chrome.tabs.sendMessage(tabs[0].id, {
                  action: "highlight",
                  searchText: searchText,
                  highlightColor: selectedColor,
                  listId: listId,
                });
              }
            );
          }
        });
      }
    });
  }

  function deleteWordList(listId) {
    chrome.storage.local.get("wordLists", function (data) {
      let lists = data.wordLists || [];
      let updatedLists = lists.filter((list) => list.id !== listId);
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "removeHighlight",
          listId: listId,
        });
      });
      chrome.storage.local.set({ wordLists: updatedLists }, function () {
        getAllWordLists(renderWordLists);
      });
    });
  }

  newListBtn.addEventListener("click", function () {
    window.location.href = "list.html";
  });

  async function counterUpdating() {
    const result = await new Promise((resolve, reject) => {
      chrome.storage.local.get("count", (result) => {
        resolve(result);
      });
    });
    if (result.count) {
      counterElem.innerHTML = `Word counter: ${result.count}`;
    } else {
      counterElem.innerHTML = `Word counter: 0`;
    }
  }
  counterUpdating();
});
