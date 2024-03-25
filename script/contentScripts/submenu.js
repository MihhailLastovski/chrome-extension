document.addEventListener('mouseover', showSubmenus);

function showSubmenus(event) {
    const target = event.target;
    if (target.classList.contains('exa-radience-highlighted')) {
        createSubmenu(target);
        if (submenuIsActive === false) {
            submenuContainer.style.display = 'none';
        } else {
            submenuContainer.style.display = 'block';
        }
    }
}

function createSubmenu(element) {
    if (!submenuContainer) {
        submenuContainer = document.createElement('div');
        submenuContainer.id = 'submenu';
        submenuContainer.className = 'exa-radience-submenu';
        document.body.appendChild(submenuContainer);
    }

    submenuContainer.innerHTML = '';

    // Скриншот
    const captureScreenshotBtn = document.createElement('button');
    captureScreenshotBtn.id = 'captureScreenshotBtn';
    captureScreenshotBtn.innerHTML =
        '<i class="fa-2x fa fa-camera-retro" aria-hidden="true"></i>';
    captureScreenshotBtn.onclick = function () {
        document.removeEventListener('mouseover', showSubmenus);
        captureScreenshot(element);
    };

    // Заметка
    const addNoteBtn = document.createElement('button');
    addNoteBtn.id = 'addNoteBtn';
    addNoteBtn.innerHTML =
        '<i class="fa-2x fa fa-file-text-o" aria-hidden="true"></i>';
    addNoteBtn.onclick = function () {
        addNoteToElement(element);
    };

    // Убрать статус
    const removeStatusBtn = document.createElement('button');
    removeStatusBtn.id = 'removeStatusBtn';
    removeStatusBtn.innerHTML =
        '<i class="fa-2x fa fa-trash-o" aria-hidden="true"></i>';
    removeStatusBtn.onclick = function () {
        removeWordsStatus(element);
    };

    // Отображение статусов
    var lineDiv = document.createElement('div');
    lineDiv.style.display = 'flex';
    lineDiv.style.flexDirection = 'row';

    var statusesContainer = document.createElement('div');
    statusesContainer.className = 'exa-radience-statuses-container';

    statusesList.forEach((status) => {
        const div = document.createElement('div');
        div.id = 'statusDiv';
        div.className = 'exa-radience-statuses-container-item';
        div.textContent = status;

        const foundWord = wordLists.find((wordList) => {
            return (
                wordList.words &&
                wordList.words.find((wordObj) => {
                    return (
                        wordObj.word.trim().toLowerCase() ===
                            element.innerHTML.trim().toLowerCase() &&
                        wordObj.status === status
                    );
                })
            );
        });
        if (foundWord) {
            div.style.backgroundColor = '#3B1269';
        }

        div.onclick = function () {
            // Получаем все элементы с классом '.exa-radience-statuses-container-item'
            var allItems = document.querySelectorAll(
                '.exa-radience-statuses-container-item'
            );
            // Применяем изменения ко всем элементам
            allItems.forEach(function (elem) {
                elem.style.backgroundColor = '#FD68A4';
            });
            selectedValue = status;
            changeWordStatus(element);
            div.style.backgroundColor = '#3B1269';
        };
        statusesContainer.appendChild(div);
    });

    submenuContainer.appendChild(addNoteBtn);
    submenuContainer.appendChild(captureScreenshotBtn);
    submenuContainer.appendChild(lineDiv);

    lineDiv.appendChild(statusesContainer);
    lineDiv.appendChild(removeStatusBtn);

    submenuContainer.style.left = `${element.getBoundingClientRect().left}px`;
    submenuContainer.style.top = `${
        element.getBoundingClientRect().top + window.scrollY + 30
    }px`;

    submenuContainer.onmouseleave = function () {
        submenuContainer.style.display = 'none';
    };
}
