(function () {
  const api = window.SiteConfig;
  if (!api) return;

  const settings = api.loadSettings();
  const loginForm = document.getElementById("login-form");
  const authFeedback = document.getElementById("auth-feedback");
  const sessionKey = "ma-admin-authenticated";
  const attemptsKey = "ma-admin-login-attempts";
  const lockKey = "ma-admin-login-locked-until";
  const maxAttempts = 5;
  const lockDurationMs = 15 * 60 * 1000;
  const sessionTtlMs = 8 * 60 * 60 * 1000;

  function getLockedUntil() {
    try {
      return Number(localStorage.getItem(lockKey) || "0");
    } catch (error) {
      return 0;
    }
  }

  function getAttempts() {
    try {
      return Number(localStorage.getItem(attemptsKey) || "0");
    } catch (error) {
      return 0;
    }
  }

  function resetAttempts() {
    try {
      localStorage.removeItem(attemptsKey);
      localStorage.removeItem(lockKey);
    } catch (error) {}
  }

  function registerFailedAttempt() {
    const attempts = getAttempts() + 1;
    try {
      localStorage.setItem(attemptsKey, String(attempts));
      if (attempts >= maxAttempts) {
        localStorage.setItem(lockKey, String(Date.now() + lockDurationMs));
      }
    } catch (error) {}
    return attempts;
  }

  function setSession() {
    try {
      sessionStorage.setItem(
        sessionKey,
        JSON.stringify({
          authenticated: true,
          createdAt: Date.now(),
          expiresAt: Date.now() + sessionTtlMs
        })
      );
    } catch (error) {}
  }

  function completeLogin() {
    setSession();
    window.location.href = "index.html";
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(loginForm);
    const login = String(data.get("login") || "").trim();
    const password = String(data.get("password") || "").trim();

    if (login === settings.admin.login && password === settings.admin.password) {
      authFeedback.textContent = "";
      resetAttempts();
      completeLogin();
      return;
    }

    const lockedUntil = getLockedUntil();
    if (lockedUntil > Date.now()) {
      authFeedback.textContent =
        "Слишком много неверных попыток входа. Повторите позже: " +
        new Date(lockedUntil).toLocaleTimeString("ru-RU");
      return;
    }

    const attempts = registerFailedAttempt();
    if (attempts >= maxAttempts) {
      authFeedback.textContent =
        "Доступ временно заблокирован после нескольких неудачных попыток. Попробуйте позже.";
      return;
    }

    authFeedback.textContent = "Неверный логин или пароль.";
  });
})();
