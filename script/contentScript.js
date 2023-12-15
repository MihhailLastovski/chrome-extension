async function highlightText(searchText) {
  const result = await new Promise((resolve, reject) => {
    chrome.storage.local.get("isActive", (result) => {
      resolve(result);
    });
  });

  const boolActive = result.isActive;

  if (boolActive && searchText !== "") {
    const searchRegex = new RegExp(searchText, "gi");

    // Удаление существующих выделений

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
          node.parentNode.replaceChild(newNode, node);
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
    highlightTextNode(document.body);
  }
  let highlightedCount = document.querySelectorAll('span.highlighted').length;
  console.log('Highlighted count:', highlightedCount);
  chrome.storage.local.set({count: highlightedCount});
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "highlight") {
    highlightText(request.searchText, request.isActive);
  } else if (request.action === "removeHighlight") {
    document.querySelectorAll("span.highlighted").forEach((element) => {
      const parent = element.parentNode;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    });
  }
});
