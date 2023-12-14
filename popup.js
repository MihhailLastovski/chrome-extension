document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('highlightBtn').addEventListener('click', function() {
    let searchText = document.getElementById('searchText').value.trim();

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: highlightText,
        args: [searchText]
      });
    });
  });
});

function highlightText(searchText) {
  let searchRegex = new RegExp(searchText, 'gi');
  let matches = document.documentElement.innerHTML.match(searchRegex);
  if (matches) {
    matches.forEach(match => {
      document.documentElement.innerHTML = document.documentElement.innerHTML.replace(new RegExp(match, 'g'), '<span style="background-color: yellow;">' + match + '</span>');
    });
  }
}
