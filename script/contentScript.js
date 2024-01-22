if (!window.hasRun) {
  var highlightColorRestore;
  window.hasRun = true;

  // let submenuContainer;

  // function createSubmenu(element) {
    // if (!submenuContainer) {
    //   submenuContainer = document.createElement("div");
    //   submenuContainer.className = "submenu-container";
    //   document.body.appendChild(submenuContainer);
    // }

    // submenuContainer.innerHTML = "";

    // const captureScreenshotBtn = document.createElement("button");
    // captureScreenshotBtn.id = "captureScreenshotBtn";
    // captureScreenshotBtn.innerHTML = "screenshot";
    // captureScreenshotBtn.onclick = function () {
    //   captureScreenshot(element);
    // };

    // submenuContainer.appendChild(captureScreenshotBtn);
    // submenuContainer.style.position = "absolute";
    // submenuContainer.style.left = `${element.getBoundingClientRect().left}px`;
    // submenuContainer.style.top = `${
    //   element.getBoundingClientRect().top + window.scrollY
    // }px`;

    // submenuContainer.onmouseleave = function () {
    //   submenuContainer.style.display = "none";
    //   restoreHighlight();
    // };
  // }





  // document.addEventListener("mouseover", function (event) {
  //   const target = event.target;
  //   if (target.classList.contains("highlighted")) {
  //     createSubmenu(target);
  //     submenuContainer.style.display = "block";
  //   }
  // });

  async function highlightText(searchText, highlightColor, listId = null) {
    highlightColorRestore = highlightColor;
    const resultOld = await new Promise((resolve, reject) => {
      chrome.storage.local.get("isActive", (result) => {
        resolve(result);
      });
    });
    const boolActive = resultOld.isActive;

    if (boolActive && searchText !== "") {
      const searchRegex = new RegExp(searchText, "gi");
      const colorStyle = `border: 2px solid ${highlightColor};`;

      function highlightTextNode(node) {
        if (
          node.nodeType === Node.TEXT_NODE &&
          !isDescendantOfStyleOrScript(node)
        ) {
          let text = node.nodeValue;
          if (searchRegex.test(text)) {
            if (node.parentNode.className !== "highlighted") {
              let replacementText = `<span class="highlighted" style="${colorStyle}">$&</span>`;
              let newNode = document.createElement("span");
              newNode.className = "highlightedP";
              if (listId) {
                replacementText = `<span class="highlighted" data-list-id="${listId}" style="${colorStyle}">$&</span>`;
                newNode.setAttribute("data-list-id", listId);
              }
              const replacedText = text.replace(searchRegex, replacementText);
              newNode.innerHTML = replacedText;
              node.parentNode.replaceChild(newNode, node);
            }
          }
        } else if (
          node.nodeType === Node.ELEMENT_NODE &&
          node.tagName.toLowerCase() !== "style" &&
          node.tagName.toLowerCase() !== "script" &&
          node.childNodes &&
          node.childNodes.length > 0
        ) {
          node.childNodes.forEach((childNode) => {
            highlightTextNode(childNode);
          });
        }
      }

      // Проверка, является ли узел потомком элемента style или script
      function isDescendantOfStyleOrScript(node) {
        while (node.parentNode) {
          node = node.parentNode;
          if (
            node.tagName &&
            (node.tagName.toLowerCase() === "style" ||
              node.tagName.toLowerCase() === "script")
          ) {
            return true;
          }
        }
        return false;
      }

      highlightTextNode(document.body);
    }
    let highlightedCount = document.querySelectorAll("span.highlighted").length;
    chrome.storage.local.set({ count: highlightedCount });
    chrome.runtime.sendMessage({
      action: "updateBadge",
      count: highlightedCount,
    });
  }

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.action === "highlight") {
      highlightText(
        request.searchText,
        request.highlightColor,
        request.listId,
        request.isActive
      );
    } else if (request.action === "removeHighlight") {
      const listId = request.listId;
      if (listId) {
        document
          .querySelectorAll(
            `span[data-list-id="${listId}"].highlighted, span[data-list-id="${listId}"].highlighted`
          )
          .forEach((element) => {
            const { textContent } = element;
            element.outerHTML = textContent;
          });
        document
          .querySelectorAll(
            `span[data-list-id="${listId}"].highlighted, span[data-list-id="${listId}"].highlightedP`
          )
          .forEach((element) => {
            const { textContent } = element;
            element.outerHTML = textContent;
          });
      } else {
        document.querySelectorAll("span.highlighted").forEach((element) => {
          const { textContent } = element;
          element.outerHTML = textContent;
        });
        document.querySelectorAll("span.highlightedP").forEach((element) => {
          const { textContent } = element;
          element.outerHTML = textContent;
        });
      }
    }
    if (request.action === "captureScreenshot") {
      chrome.runtime.sendMessage({ action: "requestScreenshot" });
    }
  });
}
