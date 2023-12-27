const API_KEY = 'AIzaSyBizfdeE-hxfeh-quvNXqEwAQSJa7WQuJk';
const SPREADSHEET_ID = '1Rqf6joJtaZncIXbrejAhl73dPQouBsiVRD7w1qciupc';
const RANGE = 'sheet1!A1:B5';

function getData() {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        return response.json();
      })
      .then(data => {
        if (data && data.values && data.values.length > 0) {
          const tableBody = document.getElementById('tableBody');
          data.values.forEach(row => {
            const newRow = document.createElement('tr');
            row.forEach(cell => {
              const newCell = document.createElement('td');
              newCell.textContent = cell;
              newRow.appendChild(newCell);
            });
            tableBody.appendChild(newRow);
          });
        } else {
          console.log('No data found in the response.');
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }
  
  document.addEventListener('DOMContentLoaded', getData);
