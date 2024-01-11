document.addEventListener("DOMContentLoaded", function () {
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
          iframe.src = input.value + "?widget=true&amp;headers=false";
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

  const guide = document.getElementById("guide");
  const showGuide = document.getElementById("showGuide");

  showGuide.addEventListener("click", function () {
    const guideDisplay = window
      .getComputedStyle(guide)
      .getPropertyValue("display");
    guide.style.display = guideDisplay === "none" ? "block" : "none";
  });
});
