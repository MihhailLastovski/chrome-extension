chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get("firstOpen", function (data) {
    if (!data.firstOpen) {
      chrome.storage.local.set({ theme: "light" });
      chrome.storage.local.set({ firstOpen: true });
    }
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
      saveAs: false, 
    }, function(downloadId) {
      console.log("Download initiated with ID:", downloadId);
    });

    return true;
  }
});


function saveScreenshot(dataUrl) {
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