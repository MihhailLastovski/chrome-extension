async function highlightText(searchText, highlightColor, listId = null) {
  const resultOld = await new Promise((resolve, reject) => {
    chrome.storage.local.get("isActive", (result) => {
      resolve(result);
    });
  });
  const boolActive = resultOld.isActive;

  if (boolActive && searchText !== "") {
    const searchRegex = new RegExp(searchText, "gi");
    
    const colorStyle = `background-color: ${highlightColor};`;

    function highlightTextNode(node) {
      
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.nodeValue;
        if (searchRegex.test(text)) {

          if (node.parentNode.className !== "highlighted") {
            let replacementText = `<span class="highlighted" style="${colorStyle}">$&</span>`;
            if (listId) {
              replacementText = `<span class="highlighted" data-list-id="${listId}" style="${colorStyle}">$&</span>`;
            }         
            const replacedText = text.replace(searchRegex, replacementText);      
            const newNode = document.createElement("span");
            newNode.className = "highlighted";
            newNode.innerHTML = replacedText;
            node.parentNode.replaceChild(newNode, node);
          }

        }
      } else if ( node.nodeType === Node.ELEMENT_NODE && node.childNodes && node.childNodes.length > 0) {
        node.childNodes.forEach((childNode) => {  
          highlightTextNode(childNode);
        });
      }
    }
    highlightTextNode(document.body);
  }
  let highlightedCount = document.querySelectorAll('span.highlighted').length / 2;
  //super difficult secret code 
  if (highlightedCount % 1 !==0) {
    highlightedCount += 0.5;
  }
  //super difficult secret code 
  chrome.storage.local.set({count: highlightedCount});
  chrome.runtime.sendMessage({ action: 'updateBadge', count: highlightedCount });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "highlight") {
    highlightText(request.searchText, request.highlightColor, request.isActive);
  } else if (request.action === "removeHighlight") {
    const listId = request.listId;
    if (listId) { 
      document.querySelectorAll(`span[data-list-id="${listId}"].highlighted`).forEach((element) => {
        const { textContent } = element;
        element.outerHTML = textContent;
      });
    }
    else {
      document.querySelectorAll("span.highlighted").forEach((element) => {
        const { textContent } = element;
        element.outerHTML = textContent;
      });
    }
  }
});