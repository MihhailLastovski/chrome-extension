document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const listId = urlParams.get("listId");
  const cancelBtn = document.getElementById("cancelBtn");
  cancelBtn.addEventListener("click", function () {
    if(listId) {
      window.location.href = `list.html?listId=${listId}`;
    }
    else {
      window.location.href = "list.html";
    }
  });

  const input = document.getElementById("textInput");
  const button = document.getElementById("getSheets");
  const iframe = document.getElementById("googleSheets");
  const buttonToList = document.getElementById("toList");
  const allWordsToList = document.getElementById("wordsToList");
  const apiKey = 'AIzaSyBizfdeE-hxfeh-quvNXqEwAQSJa7WQuJk';
  let spreadsheetId;
  let sheets = [];
  let wordsArray = [];

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

  buttonToList.addEventListener("click", function () {
    if (wordsArray.length > 0) {
      const dataString = encodeURIComponent(wordsArray.join("\n"));
      window.location.href = `list.html?dataList=${dataString}`;
    } else {
      console.error("No data to transfer to the list.");
    }
  });

  allWordsToList.addEventListener("click", function () {
    const allWordsArray = [];
  
    if (sheets.length > 0) {
      const fetchPromises = sheets.map((sheet) => {
        return fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheet.properties.title)}?key=${apiKey}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
          })
          .then((data) => {
            const sheetWords = data.values.flat();
            allWordsArray.push(...sheetWords);
          })
          .catch((error) => console.error(`Error fetching words from ${sheet.properties.title}:`, error));
      });
  
      Promise.all(fetchPromises)
        .then(() => {
          const allWordsDataString = encodeURIComponent(allWordsArray.join("\n"));
          window.location.href = `list.html?dataList=${allWordsDataString}`;
        })
        .catch((error) => console.error('Error during fetching:', error));
    } else {
      console.error("No sheets available.");
    }
  });
  

  const guide = document.getElementById("guide");
  const showGuide = document.getElementById("showGuide");

  showGuide.addEventListener("click", function () {
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
});
