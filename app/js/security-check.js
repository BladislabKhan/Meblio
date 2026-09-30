(function () {
  const host = document.querySelector("[data-security-host]");
  const form = document.querySelector("[data-security-form]");
  const checkbox = document.querySelector("[data-security-checkbox]");
  const message = document.querySelector("[data-security-message]");
  const verifiedKey = "ma-security-check-passed";

  if (host) {
    host.textContent = window.location.host || "localhost";
  }

  if (!form || !checkbox || !message) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  checkbox.addEventListener("change", () => {
    if (!checkbox.checked) return;

    checkbox.disabled = true;
    form.classList.add("is-loading");
    message.textContent = "Проверяем браузер...";

    window.setTimeout(() => {
      try {
        sessionStorage.setItem(verifiedKey, "1");
      } catch (error) {}

      form.classList.remove("is-loading");
      form.classList.add("is-passed");
      message.textContent = "Проверка пройдена. Открываем сайт...";

      window.setTimeout(() => {
        window.location.href = "index.html";
      }, 700);
    }, 900);
  });
})();
