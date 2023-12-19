document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.querySelector(".toggleSwitch");
  const heading = document.querySelector(".heading");
  const searchTextInput = document.getElementById("searchText");
  const highlightBtn = document.getElementById("highlightBtn");
  let active;

  highlightBtn.addEventListener("click", function () {
    let searchText = searchTextInput.value.trim();

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
        });
      });
    }
    removeHighlight();
    highlight(); 

    const canvas = new OffscreenCanvas(16, 16);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, 16, 16);
    context.fillStyle = '#00FF00';  // Green
    context.fillRect(0, 0, 16, 16);
    const imageData = context.getImageData(0, 0, 16, 16);
    chrome.action.setIcon({imageData: imageData});
    
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