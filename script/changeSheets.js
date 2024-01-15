document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("textInput");
  const button = document.getElementById("getSheets");
  const iframe = document.getElementById("googleSheets");
  const apiKey = 'AIzaSyBizfdeE-hxfeh-quvNXqEwAQSJa7WQuJk';
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
          if (spreadsheetId) {
            getListOfSheets(spreadsheetId);
          } else {
            console.error("Invalid Google Sheets URL.");
          }
        }
      })
      .catch((error) => console.error("Error:", error));
  });

  const guide = document.getElementById("guide");
  const showGuide = document.getElementById("showGuide");

  showGuide.addEventListener("click", function () {
    console.log("Click")
    const guideDisplay = window
      .getComputedStyle(guide)
      .getPropertyValue("display");
    guide.style.display = guideDisplay === "none" ? "block" : "none";
  });

  function getSpreadsheetIdFromUrl(url) {
    const regex = /\/spreadsheets\/d\/(.+?)\//;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
  }

  const cancelBtn = document.getElementById("cancelBtn");
  cancelBtn.addEventListener("click", function () {
    ///window.location.href = "popup.html";
    window.history.back();
  });
});
