document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('highlightBtn').addEventListener('click', function() {
    let searchText = document.getElementById('searchText').value.trim();

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['contentScript.js']
      });
      chrome.tabs.sendMessage(tabs[0].id, { action: 'highlight', searchText: searchText });
    });
  });
});
