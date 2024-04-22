document.addEventListener('DOMContentLoaded', function () {
    function addTooltip(element) {
        const attributeValue = element.getAttribute('tooltipText');
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerText = attributeValue;
        document.body.appendChild(tooltip);

        element.addEventListener('mouseover', function () {
            tooltipTimer = setTimeout(function () {
                const rect = element.getBoundingClientRect();
                const tooltipX = rect.left + window.pageXOffset;
                const tooltipY = rect.bottom + window.pageYOffset + 5;

                tooltip.style.left = `${tooltipX}px`;
                tooltip.style.top = `${tooltipY}px`;

                tooltip.style.display = 'inline-block';
                tooltip.style.opacity = 1;
            }, 500);
        });

        element.addEventListener('mouseout', function () {
            clearTimeout(tooltipTimer);
            tooltip.style.display = 'none';
            tooltip.style.opacity = 0;
        });
    }

    // Select all elements that have the 'tooltipText' attribute
    const elementsWithTooltip = document.querySelectorAll('[tooltipText]');
    elementsWithTooltip.forEach(addTooltip);

    // Create a MutationObserver to watch for new buttons
    const mutationCallback = (mutationsList, observer) => {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const tooltipText = node.getAttribute('tooltipText');
                        if (tooltipText) {
                            addTooltip(node); // Apply tooltip logic to the new element
                        }
                    }
                });
            }
        });
    };

    const observer = new MutationObserver(mutationCallback);
    const observerOptions = {
        childList: true, // Watch for added/removed children
        subtree: true, // Observe the entire subtree
    };

    // Start observing the document body for changes
    observer.observe(document.body, observerOptions);
    
})