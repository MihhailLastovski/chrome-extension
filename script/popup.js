document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("highlightBtn")
    .addEventListener("click", function () {
      let searchText = document.getElementById("searchText").value.trim();

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
  const btn = document.querySelector(".btn");
  const heading = document.querySelector(".heading");
  let active = false;

  btn.addEventListener("click", clickHandler);

  function clickHandler() {
    active = !active;
    chrome.storage.session.set({ isActive: active }).then(() => {
      console.log("Value is set");
    });
    btn.classList.add("animating");
    btn.addEventListener("animationend", toggleAnimation);
  }

  function toggleAnimation() {
    btn.classList.remove("animating");
    active ? turnOn() : turnOff();
  }

  function turnOn() {
    btn.classList.add("active");
    heading.classList.add("active");
  }

  function turnOff() {
    btn.classList.remove("active");
    heading.classList.remove("active");
  }
});
