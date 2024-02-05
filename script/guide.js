document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');
    const cancelBtn = document.getElementById('cancelBtn');

    cancelBtn.addEventListener('click', function () {
        window.location.href = listId
            ? `list.html?listId=${listId}`
            : 'list.html';
    });

    /*****************************************Tooltips**********************************************/
    /* Необходимо оптимизировать */

    const tooltipButtons = [cancelBtn];
    const tooltipsText = ['Go back'];
    let tooltipTimer;

    tooltipButtons.forEach((button, index) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerText = tooltipsText[index];
        document.body.appendChild(tooltip);

        button.addEventListener('mouseover', function () {
            tooltipTimer = setTimeout(function () {
                const rect = button.getBoundingClientRect();
                const tooltipX = rect.left + window.pageXOffset;
                var tooltipY;
                if (button === cancelBtn) {
                    tooltipY = rect.bottom + window.pageYOffset - 70;
                } else {
                    tooltipY = rect.bottom + window.pageYOffset + 5;
                }

                tooltip.style.left = `${tooltipX}px`;
                tooltip.style.top = `${tooltipY}px`;

                tooltip.style.display = 'inline-block';
                tooltip.style.opacity = 1;
            }, 500);
        });

        button.addEventListener('mouseout', function () {
            clearTimeout(tooltipTimer);
            tooltip.style.display = 'none';
            tooltip.style.opacity = 0;
        });
    });
});
