chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get('firstOpen', function (data) {
    if (!data.firstOpen) {
      chrome.storage.local.set({ "theme": "light" });
      chrome.storage.local.set({ firstOpen: true });
    }
  });
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log('nice!!!');
    if (changeInfo.status === 'complete') {
      chrome.action.setBadgeText({ text: '' });
      chrome.storage.local.set({count: 0});
    }
  });
});