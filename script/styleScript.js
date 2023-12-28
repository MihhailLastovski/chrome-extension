//Находит тему из storage
function calculateSettingAsThemeString({ localStorageTheme, systemSettingDark }) {
  if (localStorageTheme !== null) {
    return localStorageTheme;
  }

  if (systemSettingDark.matches) {
    return "dark";
  }
  return "light";
}
//обновляет хтмл тэг
function updateThemeOnHtmlEl({ theme }) {
  document.querySelector("html").setAttribute("data-theme", theme);
}

document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.set({ "theme": "light" });
  const darkModeToggle = document.getElementById("darkModeToggle");
  const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");

  //находит примененные настройки
  chrome.storage.local.get("theme", function (result) {
    const localStorageTheme = result.theme;
    let currentThemeSetting = calculateSettingAsThemeString({ localStorageTheme, systemSettingDark });

    updateThemeOnHtmlEl({ theme: currentThemeSetting });

    //меняет тему
    darkModeToggle.addEventListener("change", function () {
      const newTheme = darkModeToggle.checked ? "dark" : "light";

      chrome.storage.local.set({ "theme": newTheme });
      updateThemeOnHtmlEl({ theme: newTheme });

      currentThemeSetting = newTheme;
    });

    darkModeToggle.checked = currentThemeSetting === "dark";
  });
});
