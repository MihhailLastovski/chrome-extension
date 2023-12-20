//import { toggleSwitchIsActive, handleToggleSwitchChange } from './script/header.mjs';

document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.querySelector(".toggleSwitch");
  const heading = document.querySelector(".heading");
  const searchTextInput = document.getElementById("searchText");
  const highlightBtn = document.getElementById("highlightBtn");
  let active;

  highlightBtn.addEventListener("click", function () {
    let searchText = searchTextInput.value.trim();
    let selectedColor = document.querySelector('input[name="highlightColor"]:checked').value;

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

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.action === 'updateBadge') {
        const count = request.count || 0;
        chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
        chrome.action.setBadgeBackgroundColor({ color: '#9eff00' });
      }
    });
  });

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

  function toggleWordList(listId, enable) {
    function removeHighlight(listId) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "removeHighlight",
          listId,
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
    searchTextInput.disabled = !active;
    highlightBtn.disabled = !active;
  }

  // toggleSwitchIsActive(toggleSwitch, heading, searchTextInput, highlightBtn);
  // toggleSwitch.addEventListener('change', handleToggleSwitchChange(active, heading, searchTextInput, highlightBtn));
});