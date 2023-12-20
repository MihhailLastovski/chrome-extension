var locale_HTML = document.body.innerHTML;

async function highlightText(searchText, listId = null) {
  const resultOld = await new Promise((resolve, reject) => {
    chrome.storage.local.get("isActive", (result) => {
      resolve(result);
    });
  });
  const boolActive = resultOld.isActive;

  if (boolActive && searchText !== "") {
    const searchRegex = new RegExp(searchText, "gi");

    function highlightTextNode(node) {

      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.nodeValue;
        if (searchRegex.test(text)) {
          let replacementText = `<span class="highlighted" style="background-color: yellow;">$&</span>`;
          if (listId) {
            replacementText = `<span class="highlighted" data-list-id="${listId}" style="background-color: yellow;">$&</span>`;
          }
          const replacedText = text.replace(searchRegex, replacementText);
          const newNode = document.createElement("span");
          newNode.innerHTML = replacedText;
          node.parentNode.replaceChild(newNode, node);
        }
      } else if ( node.nodeType === Node.ELEMENT_NODE && node.childNodes && node.childNodes.length > 0) {
        node.childNodes.forEach((childNode) => {
          highlightTextNode(childNode);
        });
      }
    }
    if (listId === null) {
      document.body.innerHTML = locale_HTML;
    }
    highlightTextNode(document.body);
  }
  let highlightedCount = document.querySelectorAll('span.highlighted').length;
  chrome.storage.local.set({count: highlightedCount});
  chrome.runtime.sendMessage({ action: 'updateBadge', count: highlightedCount });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "highlight") {
    highlightText(request.searchText, request.isActive);
  } else if (request.action === "removeHighlight") {
    const listId = request.listId;
    if (listId) {
      document.querySelectorAll(`span[data-list-id="${listId}"].highlighted`).forEach((element) => {
        const parent = element.parentNode;
        while (element.firstChild) {
          parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
      });
    }
    else {
      // document.querySelectorAll("span.highlighted").forEach((element) => {
      //   const parent = element.parentNode;
      //   while (element.firstChild) {
      //     parent.insertBefore(element.firstChild, element);
      //   }
      //   parent.removeChild(element);
      // });
      document.body.innerHTML = locale_HTML;
    }
    
  }
});
