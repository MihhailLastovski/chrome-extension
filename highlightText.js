function highlightText(searchText) {
    let searchRegex = new RegExp(searchText, 'gi');
  
    // Удаление существующих выделений
    document.querySelectorAll('span.highlighted').forEach(element => {
      const parent = element.parentNode;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    });
  
    function highlightTextNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.nodeValue;
        if (searchRegex.test(text)) {
          let replacedText = text.replace(searchRegex, '<span class="highlighted" style="background-color: yellow;">$&</span>');
          let span = document.createElement('span');
          span.innerHTML = replacedText;
          node.parentNode.replaceChild(span, node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes && node.childNodes.length > 0) {
        node.childNodes.forEach(childNode => { highlightTextNode(childNode); });
      }
    }
  
    let elementsToHighlight = document.querySelectorAll('body *');
    elementsToHighlight.forEach(element => { highlightTextNode(element); });
  }

  