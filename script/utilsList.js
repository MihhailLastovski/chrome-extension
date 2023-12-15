document.addEventListener("DOMContentLoaded", function () {
    function removeHighlight() {
      document.querySelectorAll('span.highlighted').forEach(element => {
        const parent = element.parentNode;
        while (element.firstChild) {
          parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
      });
    }
  
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.action === 'removeHighlight') {
        removeHighlight();
      }
    });
  });
  