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

  const body = document.body;
  highlightTextNode(body);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "highlight") {
    highlightText(request.searchText);
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
