function getDataFromSheets(url, sheetName, range) {
  const API_KEY = 'AIzaSyBizfdeE-hxfeh-quvNXqEwAQSJa7WQuJk';
  const dataList = []; // List to accumulate data

  // Extract Spreadsheet ID from the URL
  const regex = /\/spreadsheets\/d\/([\w-]+)\//;
  const match = url.match(regex);
  const SPREADSHEET_ID = match ? match[1] : null;

  if (!SPREADSHEET_ID) {
    console.error('Invalid Google Sheets URL');
    return;
  }

  const RANGE = `${sheetName}!${range}`;

  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return response.json();
    })
    .then(data => {
      if (data && data.values && data.values.length > 0) {
        data.values.forEach(row => {
          dataList.push(...row); // Add each row to the list
        });

        // Display accumulated list in the console
        console.log('Data List:', dataList);
      } else {
        console.log('No data found in the response.');
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

// Function to handle button click and show popup
document.addEventListener('DOMContentLoaded', function() {
  const getDataBtn = document.getElementById('getDataBtn');
  getDataBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const tab = tabs[0];
      const url = tab.url;

      // Prompt to get the URL, sheet name, and range (this can be replaced with a proper UI in your extension)
      const userInputURL = prompt('Enter Google Sheets URL:', url);
      const userInputSheet = prompt('Enter Sheet Name:');
      const userInputRange = prompt('Enter Range (e.g., A1:B5):');
      
      // Call the function to get data from Sheets with the provided inputs
      if (userInputURL && userInputSheet && userInputRange) {
        getDataFromSheets(userInputURL, userInputSheet, userInputRange);
      }
    });
  });
});
