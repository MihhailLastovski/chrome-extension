chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get("firstOpen", function (data) {
    if (!data.firstOpen) {
      chrome.storage.local.set({ theme: "light" });
      chrome.storage.local.set({ firstOpen: true });
    }
  });

  // chrome.contextMenus.create({
  //   id: "myContextMenu",
  //   title: "Take a screenshot",
  //   contexts: ["all"]
  // });
});

//Обновление иконки
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
    const saveAs = true; //data.saveAs || false;
    const filename = "screenshot.png";

    chrome.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: saveAs,
    });
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "captureScreenshot") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, function (dataUrl) {
      sendResponse(dataUrl);
    });
    return true;
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "downloadScreenshot") {
    const dataUrl = request.dataUrl;

    chrome.downloads.download({
      url: dataUrl,
      filename: "screenshot.png",
      saveAs: true, // false
    }, function(downloadId) {
      console.log("Download initiated with ID:", downloadId);
    });

    return true;
  }
});

//Добавление высплывающего окна
// chrome.contextMenus.onClicked.addListener(function (info, event) {
//   if (info.menuItemId === "myContextMenu") {
//     console.log("Context menu in clicked")
//   }
// });