chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get("firstOpen", function (data) {
    if (!data.firstOpen) {
      chrome.storage.local.set({ theme: "light" });
      chrome.storage.local.set({ firstOpen: true });
    }
  });

  chrome.contextMenus.create({
    id: "myContextMenu",
    title: "Take a screenshot",
    contexts: ["all"]
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    console.log("Tab is updated");
    chrome.action.setBadgeText({ text: "" });
    chrome.storage.local.set({ count: 0 });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "requestScreenshot") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, function (dataUrl) {
      saveScreenshot(dataUrl);
    });
  }
});

function saveScreenshot(dataUrl) {
  // Сохранение в Downloads
  chrome.storage.local.get("saveAs", function (data) {
    const saveAs = data.saveAs || false;  
    const filename = "screenshot.png";

    chrome.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: saveAs,
    });
  });
}

chrome.contextMenus.onClicked.addListener(function (info, event) {
  if (info.menuItemId === "myContextMenu") {
    const target = event.target;
    //if (target.classList.contains("highlighted")) {
      //captureScreenshot(target);
      restoreHighlight();
    //}
  }
});

function captureScreenshot(element) {
  document.querySelectorAll(".highlighted").forEach((el) => {
    if (el !== element) {
      el.style.border = "transparent";
    }
  });

  const listId = element.getAttribute("data-list-id");

  chrome.runtime.sendMessage({ action: "captureScreenshot" }, () => {
    setTimeout(() => {
      restoreHighlight();
      if (listId) {
        removeFromList(element);
      }
    }, 500);
  });
}

function removeFromList(element) {
  const listId = element.getAttribute("data-list-id");

  chrome.storage.local.get("wordLists", (result) => {
    const wordLists = result.wordLists || [];

    const textContentToRemove = element.textContent.trim();

    const updatedWordLists = wordLists.map((wordList) => {
      if (wordList.words && wordList.id === listId) {
        wordList.words = wordList.words.filter((wordObj) => {
          return wordObj.word.trim() !== textContentToRemove;
        });
      }
      return wordList;
    });

    chrome.storage.local.set({ wordLists: updatedWordLists });
  });
}

function restoreHighlight() {
  document.querySelectorAll(".highlighted").forEach((el) => {
    if (el.style.border === "transparent") {
      el.style.border = `2px solid black`; // ${highlightColorRestore}
    }
  });
}