chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get('firstOpen', function (data) {
    if (!data.firstOpen) {
      chrome.storage.local.set({ "theme": "light" });
      chrome.storage.local.set({ firstOpen: true });
    }
  });
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
      console.log('Tab is updated');
      chrome.action.setBadgeText({ text: '' });
      chrome.storage.local.set({count: 0});
    }
  });
});

chrome.runtime.onMessage.addListener(function (request,sender,sendResponse) {
  if (request.action === "toggleSwitched") {
    console.log('toggleSwitched');

    let active;
    const toggleSwitch = request.toggleSwitch;
    const heading = request.heading;
    const searchTextInput = request.searchTextInput;
    const highlightBtn = request.highlightBtn;

    async function toggleSwitchIsActive() {
      const result = await new Promise((resolve, reject) => {
        chrome.storage.local.get("isActive", (result) => {
          resolve(result);
        });
      });
      active = result.isActive;
      console.log(active);
      updateUIState();
      toggleSwitch.checked = active;
    }
    toggleSwitchIsActive();
  
    // toggleSwitch.addEventListener("change", function () {
    //   active = !active;
    //   chrome.storage.local.set({ isActive: active });
    //   updateUIState();
    // });
  
    function updateUIState() {
      heading.innerText = active ? "Highlight On" : "Highlight Off";
      searchTextInput.disabled = !active;
      highlightBtn.disabled = !active;
    }

    // async function toggleSwitchIsActive(toggleSwitch, heading, searchTextInput, highlightBtn) {
    //   console.log('Nice');
    //   const result = await new Promise((resolve, reject) => {
    //       chrome.storage.local.get("isActive", (result) => {
    //           resolve(result);
    //       });
    //   });

    //   active = result.isActive;
    //   toggleSwitch.checked = active;
    //   updateUIState(active, heading, searchTextInput, highlightBtn);    
    // }

    // function handleToggleSwitchChange(active, heading, searchTextInput, highlightBtn) {
    //   active = !active;
    //   chrome.storage.local.set({ isActive: active });
    //   updateUIState(active, heading, searchTextInput, highlightBtn);
    // }

    // function updateUIState(active, heading, searchTextInput, highlightBtn) {
    //   heading.innerText = active ? "Highlight On" : "Highlight Off";
    //   searchTextInput.disabled = !active;
    //   highlightBtn.disabled = !active;
    // }

    // toggleSwitchIsActive(toggleSwitch, heading, searchTextInput, highlightBtn);
    // toggleSwitch.addEventListener('change', handleToggleSwitchChange(active, heading, searchTextInput, highlightBtn));
  }
});