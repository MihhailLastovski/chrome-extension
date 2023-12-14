document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('highlightBtn').addEventListener('click', function() {
    let searchText = document.getElementById('searchText').value.trim();

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        //function: highlightText,
        //args: [searchText],
        files: ['buttonAnimation.js']
      });
    });
  }); 

  // const btn = document.querySelector('.btn');
  // const heading = document.querySelector('.heading');
  // let active = false;

  // btn.addEventListener('click', clickHandler);

  // function clickHandler() {
  //   active = !active;
  //   btn.classList.add('animating');
  //   btn.addEventListener('animationend', toggleAnimation);
  // }

  // function toggleAnimation() {
  //   btn.classList.remove('animating');
  //   active ? turnOn() : turnOff();
  // }

  // function turnOn() {
  //   btn.classList.add('active');
  //   heading.classList.add('active'); 
  // }

  // function turnOff() {
  //   btn.classList.remove('active');
  //   heading.classList.remove('active');
  // }

  // function highlightText(searchText) {
  //     console.log('nice');

  //   const searchRegex = new RegExp(searchText, "gi");

  //   // Удаление существующих выделений
  //   document.querySelectorAll('span.highlighted').forEach(element => {
  //     const parent = element.parentNode;
  //     while (element.firstChild) {
  //       parent.insertBefore(element.firstChild, element);
  //     }
  //     parent.removeChild(element);
  //   });

  //   function highlightTextNode(node) {
  //     if (node.nodeType === Node.TEXT_NODE) {
  //       let text = node.nodeValue;
  //       if (searchRegex.test(text)) {
  //         const replacedText = text.replace(
  //           searchRegex,
  //           `<span class="highlighted" style="background-color: yellow;">$&</span>`
  //         );
  //         const newNode = document.createElement("span");
  //         newNode.innerHTML = replacedText;
  //         node.parentNode.replaceChild(newNode, node);
  //       }
  //     } else if (
  //       node.nodeType === Node.ELEMENT_NODE &&
  //       node.childNodes &&
  //       node.childNodes.length > 0
  //     ) {
  //       node.childNodes.forEach((childNode) => {
  //         highlightTextNode(childNode);
  //       });
  //     }
  //   }
  //   highlightTextNode(document.body);
  // }
  // chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  //   if (request.action === "highlight") {
  //     highlightText(request.searchText);
  //   }
  // });
});
