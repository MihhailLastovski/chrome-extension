document.addEventListener("DOMContentLoaded", function () {
  const btn = document.querySelector(".btn");
  const heading = document.querySelector(".heading");
  const searchTextInput = document.getElementById("searchText");
  const highlightBtn = document.getElementById("highlightBtn");
  let active;

  highlightBtn.addEventListener("click", function () {
    let searchText = searchTextInput.value.trim();

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
  });
  

  btn.addEventListener("click", clickHandler);
  function clickHandler() {
    active = !active;
    chrome.storage.local.set({ isActive: active }).then(() => {
      console.log("Value is set");
    });
    btn.classList.add("animating");
    btn.addEventListener("animationend", toggleAnimation);
  }


  async function checkBtnIsActive() {
    const result = await new Promise((resolve, reject) => {
      chrome.storage.local.get("isActive", (result) => {
        resolve(result);
      });
    });
  
    const boolActive = result.isActive;
    if (boolActive) {
      turnOn();
      active = true;
    } else {
      turnOff();
      active = false;
    }
  }
  checkBtnIsActive();


  function toggleAnimation() {
    btn.classList.remove("animating");
    active ? turnOn() : turnOff();
  }

  function turnOn() {
    btn.classList.add("active");
    heading.classList.add("active");
    searchTextInput.disabled = false;
    highlightBtn.disabled = false;
  }

  function turnOff() {
    btn.classList.remove("active");
    heading.classList.remove("active");
    searchTextInput.disabled = true;
    highlightBtn.disabled = true;
  }
});
