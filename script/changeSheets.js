document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.querySelector(".toggleSwitch");
  const heading = document.querySelector(".heading");
  let active;

  const input = document.getElementById("textInput");
  const button = document.getElementById("getSheets");
  const iframe = document.getElementById("googleSheets");
  const buttonToList = document.getElementById("toList");

  let wordsArray = [];

  button.addEventListener("click", function () {
    fetch(input.value)
      .then((response) => response.text())
      .then((data) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");
        const table = doc.querySelector(".waffle");
        if (table) {
          const rows = Array.from(table.querySelectorAll("tr"));
          wordsArray = rows.reduce((words, row) => {
            const cells = Array.from(row.querySelectorAll("td"));
            const wordsInRow = cells.map((cell) => cell.textContent.trim());
            return words.concat(wordsInRow.filter((word) => word !== ""));
          }, []);
          iframe.src = input.value;
          console.log(wordsArray);
        }
      })
      .catch((error) => console.error("Error:", error));
  });
  buttonToList.addEventListener("click", function () {
    if (wordsArray.length > 0) {
      const dataString = encodeURIComponent(wordsArray.join("\n"));
      window.location.href = `list.html?dataList=${dataString}`;
    } else {
      console.error("No data to transfer to the list.");
    }
  });

  /*Костыль. Пора бы уже починить...*/
  async function toggleSwitchIsActive() {
    const result = await new Promise((resolve, reject) => {
      chrome.storage.local.get("isActive", (result) => {
        resolve(result);
      });
    });
    console.log(result.isActive);
    active = result.isActive;
    updateUIState();
    toggleSwitch.checked = active;
  }
  toggleSwitchIsActive();

  toggleSwitch.addEventListener("change", function () {
    active = !active;
    chrome.storage.local.set({ isActive: active });
    updateUIState();
  });

  function updateUIState() {
    heading.innerText = active ? "Highlight On" : "Highlight Off";
  }
});
