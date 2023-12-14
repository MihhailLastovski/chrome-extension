const counterElem = document.getElementById('highlightedCount'); //////////////ERROR HERE/////////////
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('highlightBtn').addEventListener('click', function() {
    let searchText = document.getElementById('searchText').value.trim();

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: highlightText,
        args: [searchText]
      });
    });
  });
});

function highlightText(searchText) {
  const searchRegex = new RegExp(searchText, "gi");

  function highlightTextNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.nodeValue;
      if (searchRegex.test(text)) {
        const replacedText = text.replace(
          searchRegex,
          `<span class="highlighted" style="background-color: yellow;">$&</span>`
        );
        const newNode = document.createElement("span");
        newNode.innerHTML = replacedText;
        node.parentNode.insertBefore(newNode, node);
        node.parentNode.removeChild(node);
      }
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.childNodes &&
      node.childNodes.length > 0
    ) {
      node.childNodes.forEach((childNode) => {
        highlightTextNode(childNode);
      });
    }
  }
  document.querySelectorAll('span.highlighted').forEach(element => {
    const parent = element.parentNode;
    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
  });

  const body = document.body;
  highlightTextNode(body);
  let highlightedCount = document.querySelectorAll('span.highlighted').length;
  console.log('Highlighted count:', highlightedCount);
  counterElem.innerHTML = `Word counter: ${highlightedCount}`; //////////////ERROR HERE/////////////
}