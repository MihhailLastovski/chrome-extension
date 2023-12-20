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

  async function toggleSwitchIsActive() {
    const result = await new Promise((resolve, reject) => {
      chrome.storage.local.get("isActive", (result) => {
        resolve(result);
      });
    });

    active = result.isActive;

    heading.innerText = active ? "Highlight On" : "Highlight Off";
    searchTextInput.disabled = !active;
    highlightBtn.disabled = !active;

    toggleSwitch.checked = active;
    
  }
  toggleSwitchIsActive();
  
  toggleSwitch.addEventListener('change', function() {
    active = !active;
    chrome.storage.local.set({ isActive: active });

    heading.innerText = active ? "Highlight On" : "Highlight Off";
    searchTextInput.disabled = !active;
    highlightBtn.disabled = !active;

    
  });
});