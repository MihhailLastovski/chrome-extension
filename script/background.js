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

  console.log(dataUrl);

  // Копирование в буфер обмена
  // const blob = dataURItoBlob(dataUrl);
  // if (!navigator.clipboard) {
  //   console.log("nice");
  // }
  //navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

// function dataURItoBlob(dataURI) {
//   const byteString = atob(dataURI.split(",")[1]);
//   const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
//   const ab = new ArrayBuffer(byteString.length);
//   const ia = new Uint8Array(ab);
//   for (let i = 0; i < byteString.length; i++) {
//     ia[i] = byteString.charCodeAt(i);
//   }
//   return new Blob([ia], { type: mimeString });
// }
