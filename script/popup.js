document.addEventListener("DOMContentLoaded", function () {
  const btn = document.querySelector(".btn");
  const heading = document.querySelector(".heading");
  const searchTextInput = document.getElementById("searchText");
  const highlightBtn = document.getElementById("highlightBtn");
  let active;
  const wordLists = document.getElementById("wordLists");
  let enabledLists = [];

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

  function removeHighlight(listId) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "removeHighlight",
        listId,
      });
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
      removeHighlight(listId);
    }

    chrome.storage.local.set({ enabledLists: enabledLists }, function () {});
  }

  function highlightWordsFromList(listId) {
    chrome.storage.local.get("wordLists", function (data) {
      const lists = data.wordLists || [];
      const listToHighlight = lists.find((list) => list.id === listId);

      if (listToHighlight) {
        listToHighlight.words.forEach((wordObj) => {
          const searchText = wordObj.word.trim();
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: highlightText,
                args: [searchText, listId],
              });
              highlightText(searchText);
            }
          );
        });
      }
    });
  }

  function deleteWordList(listId) {
    chrome.storage.local.get("wordLists", function (data) {
      let lists = data.wordLists || [];
      let updatedLists = lists.filter((list) => list.id !== listId);

      chrome.storage.local.set({ wordLists: updatedLists }, function () {
        getAllWordLists(renderWordLists);
      });
    });
  }

  btn.addEventListener("click", clickHandler);
  function clickHandler() {
    active = !active;
    chrome.storage.local.set({ isActive: active }).then(() => {
      console.log("Value is set");
    });
    btn.classList.add("animating");
    btn.addEventListener("animationend", toggleAnimation);
  }

  async function checkBtnIsActive() {
    const result = await new Promise((resolve, reject) => {
      chrome.storage.local.get("isActive", (result) => {
        resolve(result);
      });
    });

    const boolActive = result.isActive;
    if (boolActive) {
      turnOn();
      active = true;
    } else {
      turnOff();
      active = false;
    }
  }
  checkBtnIsActive();

  function toggleAnimation() {
    btn.classList.remove("animating");
    active ? turnOn() : turnOff();
  }

  function turnOn() {
    btn.classList.add("active");
    heading.classList.add("active");
    searchTextInput.disabled = false;
    highlightBtn.disabled = false;
  }

  function turnOff() {
    btn.classList.remove("active");
    heading.classList.remove("active");
    searchTextInput.disabled = true;
    highlightBtn.disabled = true;
  }
});
