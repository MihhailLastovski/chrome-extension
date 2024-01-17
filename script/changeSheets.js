document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const listId = urlParams.get("listId");
  const cancelBtn = document.getElementById("cancelBtn");
  const input = document.getElementById("textInput");
  const button = document.getElementById("getSheets");
  const iframe = document.getElementById("googleSheets");
  const apiKey = 'AIzaSyBizfdeE-hxfeh-quvNXqEwAQSJa7WQuJk';
  const guide = document.getElementById("guide");
  const showGuide = document.getElementById("showGuide");
  let spreadsheetId;
  let sheets = [];

  function getListOfSheets(spreadsheetId) {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`)
      .then((response) => response.json())
      .then((data) => {
        sheets = data.sheets;

        if (sheets) {
          console.log("List of Sheets:");
          sheets.forEach(sheet => console.log(sheet.properties.title));
        } else {
          console.error("No sheets found.");
        }
      })
      .catch((error) => console.error("Error fetching sheets:", error));
  }

  function getSpreadsheetIdFromUrl(url) {
    const regex = /\/spreadsheets\/d\/(.+?)\//;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
  }

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
          iframe.src = input.value + "?widget=true&amp;headers=false";

          spreadsheetId = getSpreadsheetIdFromUrl(input.value);
          spreadsheetId ? getListOfSheets(spreadsheetId) : console.error("Invalid Google Sheets URL.");
        }
      })
      .catch((error) => console.error("Error:", error));
  });

  cancelBtn.addEventListener("click", function () {
    window.location.href = listId ? `list.html?listId=${listId}` : "list.html";
  });

  showGuide.addEventListener("click", function () {
    const guideDisplay = window
      .getComputedStyle(guide)
      .getPropertyValue("display");
    guide.style.display = guideDisplay === "none" ? "block" : "none";
  });
});
