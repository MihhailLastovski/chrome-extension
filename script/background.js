chrome.runtime.onInstalled.addListener(function () {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
      if (changeInfo.status === 'complete') {
        chrome.action.setBadgeText({ text: '' });
        chrome.storage.local.set({count: 0});
      }
    });
});