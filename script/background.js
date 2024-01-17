chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get('firstOpen', function (data) {
    if (!data.firstOpen) {
      chrome.storage.local.set({ "theme": "light" });
      chrome.storage.local.set({ firstOpen: true });
    }
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    console.log('Tab is updated');
    chrome.action.setBadgeText({ text: '' });
    chrome.storage.local.set({count: 0});
  }
});