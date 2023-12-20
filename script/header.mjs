async function toggleSwitchIsActive(toggleSwitch, heading, searchTextInput, highlightBtn) {
    console.log('Nice');
    const result = await new Promise((resolve, reject) => {
        chrome.storage.local.get("isActive", (result) => {
            resolve(result);
        });
    });

    active = result.isActive;
    toggleSwitch.checked = active;
    updateUIState(active, heading, searchTextInput, highlightBtn);    
}

function handleToggleSwitchChange(active, heading, searchTextInput, highlightBtn) {
    active = !active;
    chrome.storage.local.set({ isActive: active });
    updateUIState(active, heading, searchTextInput, highlightBtn);
}

function updateUIState(active, heading, searchTextInput, highlightBtn) {
    heading.innerText = active ? "Highlight On" : "Highlight Off";
    searchTextInput.disabled = !active;
    highlightBtn.disabled = !active;
}

export { toggleSwitchIsActive, handleToggleSwitchChange };