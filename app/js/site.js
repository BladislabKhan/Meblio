(function () {
  const siteApi = window.SiteConfig;
  const settings = siteApi ? siteApi.loadSettings() : null;
  if (settings && settings.brand && settings.brand.logoImage) {
    settings.brand.logoImage = "";
    if (typeof siteApi.saveSettings === "function") {
      siteApi.saveSettings(settings);
    }
  }
  const header = document.querySelector("header");
  const reloadHomeTriggers = document.querySelectorAll("[data-reload-home]");
  const visionToggleTriggers = document.querySelectorAll("[data-vision-toggle]");
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopMedia = window.matchMedia("(min-width: 1024px)");
  const backToTop = document.querySelector(".back-to-top");
  const year = document.getElementById("year");
  const reloadToTopKey = "site-reload-to-top";
  const visionModeKey = "site-vision-mode";
  const homeSecurityKey = "ma-home-security-gate-passed-v1";
  const qrCachePrefix = "ma-qr-cache-v1:";
  const ratingCachePrefix = "ma-rating-cache-v2:";
  const preloadedAssets = new Set();
  const leadCooldownKey = "ma-lead-cooldown-until";
  const remoteMetricsEndpoint = "/api/metrics";
  const heroMedia = document.querySelector(".hero-media");
  const siteFooter = document.querySelector("footer");
  const sectionDefinitions = [
    { id: "hero", title: "Hero", anchor: "#hero" },
    { id: "why-us", title: "Преимущества", anchor: "#why-us" },
    { id: "portfolio", title: "Портфолио", anchor: "#portfolio" },
    { id: "materials", title: "Материалы", anchor: "#materials" },
    { id: "how-we-work", title: "Этапы", anchor: "#how-we-work" },
    { id: "reviews", title: "Отзывы", anchor: "#reviews" },
    { id: "faq", title: "Вопросы", anchor: "#faq" },
    { id: "contacts", title: "Контакты", anchor: "#contacts" }
  ];
  let scrollTicking = false;
  let turnstileScriptPromise = null;

  if (year) year.textContent = String(new Date().getFullYear());

  function closeMobileMenu() {
    if (!mobileToggle || !mobileMenu) return;
    mobileToggle.classList.remove("is-open");
    mobileToggle.setAttribute("aria-expanded", "false");
    mobileToggle.setAttribute("aria-label", "Открыть меню");
    mobileMenu.hidden = true;
    document.body.classList.remove("mobile-menu-open");
  }

  function toggleMobileMenu() {
    if (!mobileToggle || !mobileMenu) return;
    const open = mobileToggle.classList.contains("is-open");
    if (open) return closeMobileMenu();
    mobileToggle.classList.add("is-open");
    mobileToggle.setAttribute("aria-expanded", "true");
    mobileToggle.setAttribute("aria-label", "Закрыть меню");
    mobileMenu.hidden = false;
    document.body.classList.add("mobile-menu-open");
  }

  function updateHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  function updateBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle("is-visible", window.scrollY > 500);
  }

  function updateHeroParallax() {
    if (!heroMedia || reducedMotion.matches) return;
    const offset = Math.min(window.scrollY * 0.12, 42);
    heroMedia.style.transform = "translateY(" + offset + "px) scale(1.03)";
  }

  function waitForFonts() {
    if (!("fonts" in document) || !document.fonts || typeof document.fonts.ready?.then !== "function") {
      return Promise.resolve();
    }
    return Promise.race([
      document.fonts.ready.catch(() => undefined),
      new Promise((resolve) => window.setTimeout(resolve, 1200))
    ]);
  }

  function waitForNextFrame() {
    return new Promise((resolve) => {
      window.requestAnimationFrame(resolve);
    });
  }

  function hasPassedHomeSecurityGate() {
    try {
      return sessionStorage.getItem(homeSecurityKey) === "1";
    } catch (error) {
      return false;
    }
  }

  function initHomeSecurityGate() {
    const gate = document.querySelector("[data-home-security-gate]");
    if (!gate) return;

    const form = gate.querySelector("[data-home-security-form]");
    const checkbox = gate.querySelector("[data-home-security-checkbox]");
    const message = gate.querySelector("[data-home-security-message]");
    const host = gate.querySelector("[data-home-security-host]");

    if (host) host.textContent = window.location.host || "localhost";

    if (hasPassedHomeSecurityGate()) {
      gate.hidden = true;
      document.body.classList.remove("security-gate-open");
      return;
    }

    gate.hidden = false;
    document.body.classList.add("security-gate-open");

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
          sessionStorage.setItem(homeSecurityKey, "1");
        } catch (error) {}

        form.classList.remove("is-loading");
        form.classList.add("is-passed");
        message.textContent = "Проверка пройдена. Открываем сайт...";

        window.setTimeout(() => {
          gate.hidden = true;
          document.body.classList.remove("security-gate-open");
        }, 650);
      }, 900);
    });
  }

  async function finalizeInitialRender() {
    await waitForNextFrame();
    document.documentElement.classList.remove("site-loading");
    document.documentElement.classList.add("site-ready");
    waitForFonts();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getSectionConfig(siteSettings) {
    const saved = (siteSettings.structure && Array.isArray(siteSettings.structure.sections) ? siteSettings.structure.sections : []);
    return sectionDefinitions.map((section) => {
      const match = saved.find((item) => item.id === section.id) || {};
      return {
        ...section,
        ...match,
        visible: match.visible !== false
      };
    });
  }

  function renderNavigation(siteSettings) {
    const items = (siteSettings.navigation && Array.isArray(siteSettings.navigation.menu) ? siteSettings.navigation.menu : [])
      .filter((item) => item.visible !== false && item.label && item.href);
    const desktopNav = document.querySelector("[data-nav='desktop']");
    const mobileNav = document.querySelector("[data-nav='mobile']");

    const desktopMarkup = items
      .map((item) => '<a href="' + escapeHtml(item.href) + '" class="site-nav-link">' + escapeHtml(item.label) + "</a>")
      .join("");

    const mobileMarkup = items
      .map((item) => '<a href="' + escapeHtml(item.href) + '" class="mobile-nav-link">' + escapeHtml(item.label) + "</a>")
      .join("");

    if (desktopNav) desktopNav.innerHTML = desktopMarkup;
    if (mobileNav) mobileNav.innerHTML = mobileMarkup;
  }

  function applySectionStructure(siteSettings) {
    const main = document.querySelector("main");
    if (!main) return;

    const sections = getSectionConfig(siteSettings);
    const sectionMap = new Map(sections.map((item) => [item.id, item]));
    const order = (siteSettings.structure && Array.isArray(siteSettings.structure.sectionOrder) ? siteSettings.structure.sectionOrder : sectionDefinitions.map((item) => item.id))
      .filter((id) => sectionMap.has(id));

    sections.forEach((section) => {
      const node = document.getElementById(section.id);
      if (!node) return;
      node.hidden = section.visible === false;
      node.dataset.section = section.id;
    });

    order.forEach((sectionId) => {
      const node = document.getElementById(sectionId);
      if (node) {
        main.appendChild(node);
      }
    });
  }

  function createQrImage(card) {
    if (card.qrMode === "uploaded" && card.qrImage) {
      return card.qrImage;
    }
    return getCachedQrData(card.linkUrl) || getRemoteQrUrl(card.linkUrl);
  }

  function getRemoteQrUrl(linkUrl) {
    return "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" + encodeURIComponent(linkUrl || "https://yandex.ru/maps/");
  }

  function preloadAsset(url, asType, crossOrigin) {
    if (!url || preloadedAssets.has(url)) return;
    preloadedAssets.add(url);
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = asType;
    link.href = url;
    if (crossOrigin) link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }

  function preloadQrImage(card) {
    if (!card || !card.linkUrl || card.qrMode === "uploaded") return;
    const cached = getCachedQrData(card.linkUrl);
    if (cached) return;
    preloadAsset(getRemoteQrUrl(card.linkUrl), "image", true);
  }

  function runWhenIdle(callback) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: 1200 });
      return;
    }
    window.setTimeout(callback, 160);
  }

  function getQrCacheKey(linkUrl) {
    return qrCachePrefix + (linkUrl || "https://yandex.ru/maps/");
  }

  function getCachedQrData(linkUrl) {
    try {
      return localStorage.getItem(getQrCacheKey(linkUrl)) || "";
    } catch (error) {
      return "";
    }
  }

  function setCachedQrData(linkUrl, value) {
    try {
      localStorage.setItem(getQrCacheKey(linkUrl), value);
    } catch (error) {}
  }

  function getRatingCacheKey(platform, linkUrl) {
    return ratingCachePrefix + platform + ":" + (linkUrl || "");
  }

  function getCachedRating(platform, linkUrl) {
    try {
      const raw = localStorage.getItem(getRatingCacheKey(platform, linkUrl));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.cachedAt) return null;
      const age = Date.now() - Number(parsed.cachedAt);
      if (age > 12 * 60 * 60 * 1000) return null;
      const hasRating = typeof parsed.value === "number";
      const hasReviewCount = typeof parsed.reviewCount === "number";
      const hasRatingsCount = typeof parsed.ratingsCount === "number";
      if (!hasRating && !hasReviewCount && !hasRatingsCount) return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function setCachedRating(platform, linkUrl, payload) {
    try {
      localStorage.setItem(
        getRatingCacheKey(platform, linkUrl),
        JSON.stringify({
          ...payload,
          cachedAt: Date.now()
        })
      );
    } catch (error) {}
  }

  function inferRatingPlatform(card) {
    const badge = String(card.badge || "").toLowerCase();
    const linkUrl = String(card.linkUrl || "").toLowerCase();
    if (badge.includes("2гис") || badge.includes("2gis") || linkUrl.includes("2gis")) return "2gis";
    if (badge.includes("яндекс") || linkUrl.includes("yandex")) return "yandex";
    return "";
  }

  function renderRatingBadgeMarkup(card) {
    const platform = inferRatingPlatform(card);
    if (!platform) return "";
    const ratingValue = Number.isFinite(Number(card.ratingValue)) ? Number(card.ratingValue).toFixed(1) : "--";
    const reviewCount = Number.isFinite(Number(card.reviewCount)) ? Math.max(0, Math.round(Number(card.reviewCount))) : null;
    const countText = reviewCount === null ? "— отзывов" : formatReviewCount(reviewCount);
    const linkUrl = String(card.linkUrl || "").trim();
    const tagName = linkUrl ? "a" : "div";
    const href = linkUrl ? ' href="' + escapeHtml(linkUrl) + '" target="_blank" rel="noopener noreferrer"' : "";
    return (
      "<" +
      tagName +
      href +
      ' class="review-rating-badge is-ready" data-rating-badge data-rating-platform="' +
      escapeHtml(platform) +
      '" data-rating-url="' +
      escapeHtml(linkUrl) +
      '">' +
      '<span class="review-rating-icon" aria-hidden="true">&#9733;</span>' +
      '<span class="review-rating-content">' +
      '<span class="review-rating-value">' + escapeHtml(ratingValue) + "</span>" +
      '<span class="review-rating-stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>' +
      '<span class="review-rating-count" data-review-count>' + escapeHtml(countText) + "</span>" +
      '</span>' +
      "</" +
      tagName +
      ">"
    );
  }

  function getRussianPlural(value, one, few, many) {
    const absValue = Math.abs(Number(value)) % 100;
    const unit = absValue % 10;
    if (absValue > 10 && absValue < 20) return many;
    if (unit > 1 && unit < 5) return few;
    if (unit === 1) return one;
    return many;
  }

  function formatReviewCount(reviewCount, ratingsCount) {
    if (typeof reviewCount === "number") {
      return String(reviewCount) + " " + getRussianPlural(reviewCount, "отзыв", "отзыва", "отзывов");
    }
    if (typeof ratingsCount === "number") {
      return String(ratingsCount) + " " + getRussianPlural(ratingsCount, "оценка", "оценки", "оценок");
    }
    return "— отзывов";
  }

  async function fetchLiveRatings(siteSettings) {
    const protocol = window.location.protocol;
    if (protocol !== "https:" && protocol !== "http:") return;

    const cards = (siteSettings.reviews && siteSettings.reviews.qrCards) || [];
    const tasks = cards
      .filter((card) => !Number.isFinite(Number(card.ratingValue)) && !Number.isFinite(Number(card.reviewCount)))
      .map((card) => ({
        platform: inferRatingPlatform(card),
        linkUrl: String(card.linkUrl || "").trim()
      }))
      .filter((item) => item.platform && item.linkUrl);

    await Promise.allSettled(
      tasks.map(async ({ platform, linkUrl }) => {
        const cached = getCachedRating(platform, linkUrl);
        if (cached) {
          updateRatingBadge(platform, linkUrl, cached);
          return;
        }

        const response = await fetch(
          "/api/rating?platform=" + encodeURIComponent(platform) + "&url=" + encodeURIComponent(linkUrl),
          {
            headers: {
              Accept: "application/json"
            },
            cache: "no-store"
          }
        );
        if (!response.ok) return;
        const payload = await response.json();
        if (!payload) return;
        const normalizedRating = typeof payload.rating === "number" ? Math.max(0, Math.min(5, Number(payload.rating))) : null;
        const normalizedReviewCount = typeof payload.reviewCount === "number" ? Math.max(0, Math.round(Number(payload.reviewCount))) : null;
        const normalizedRatingsCount = typeof payload.ratingsCount === "number" ? Math.max(0, Math.round(Number(payload.ratingsCount))) : null;
        if (normalizedRating === null && normalizedReviewCount === null && normalizedRatingsCount === null) return;
        const cachedPayload = {};
        if (normalizedRating !== null) cachedPayload.value = normalizedRating;
        if (normalizedReviewCount !== null) cachedPayload.reviewCount = normalizedReviewCount;
        if (normalizedRatingsCount !== null) cachedPayload.ratingsCount = normalizedRatingsCount;
        setCachedRating(platform, linkUrl, cachedPayload);
        updateRatingBadge(platform, linkUrl, cachedPayload);
      })
    );
  }

  function updateRatingBadge(platform, linkUrl, payload) {
    const safeUrl = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(linkUrl) : linkUrl.replace(/"/g, '\"');
    document
      .querySelectorAll(
        '[data-rating-badge][data-rating-platform="' +
          platform +
          '"][data-rating-url="' +
          safeUrl +
          '"]'
      )
      .forEach((badge) => {
        const valueNode = badge.querySelector(".review-rating-value");
        const countNode = badge.querySelector("[data-review-count]");
        if (valueNode && typeof payload.value === "number") {
          valueNode.textContent = Number(payload.value).toFixed(1);
        }
        if (countNode) {
          countNode.textContent = formatReviewCount(payload.reviewCount, payload.ratingsCount);
        }
        badge.classList.add("is-ready");
      });
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function prefetchQrCodes(siteSettings) {
    const cards = (siteSettings.reviews && siteSettings.reviews.qrCards) || [];
    const generatedCards = cards.filter((card) => card.qrMode !== "uploaded" && card.linkUrl);
    if (!generatedCards.length) return;

    await Promise.allSettled(
      generatedCards.map(async (card) => {
        preloadQrImage(card);
        if (getCachedQrData(card.linkUrl)) return;
        const response = await fetch(getRemoteQrUrl(card.linkUrl), { cache: "force-cache" });
        if (!response.ok) return;
        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        if (!dataUrl) return;
        setCachedQrData(card.linkUrl, dataUrl);
      })
    );

    document.querySelectorAll(".review-qr-image[data-qr-link]").forEach((image) => {
      const link = image.getAttribute("data-qr-link");
      const cached = getCachedQrData(link);
      if (cached) {
        image.src = cached;
        image.classList.remove("is-loading");
      }
    });
  }

  function getStoredVisionMode() {
    try {
      return localStorage.getItem(visionModeKey) === "1";
    } catch (error) {
      return false;
    }
  }

  function getLeadCooldownUntil() {
    try {
      return Number(localStorage.getItem(leadCooldownKey) || "0");
    } catch (error) {
      return 0;
    }
  }

  function setLeadCooldownUntil(value) {
    try {
      localStorage.setItem(leadCooldownKey, String(value));
    } catch (error) {}
  }

  function getVisitorId() {
    try {
      let visitorId = localStorage.getItem("ma-site-visitor-id-v1");
      if (!visitorId) {
        visitorId = "visitor-" + Math.random().toString(16).slice(2, 10);
        localStorage.setItem("ma-site-visitor-id-v1", visitorId);
      }
      return visitorId;
    } catch (error) {
      return "";
    }
  }

  function getSessionId() {
    try {
      let sessionId = sessionStorage.getItem("ma-site-session-id-v1");
      if (!sessionId) {
        sessionId = "session-" + Date.now() + "-" + Math.random().toString(16).slice(2, 6);
        sessionStorage.setItem("ma-site-session-id-v1", sessionId);
      }
      return sessionId;
    } catch (error) {
      return "";
    }
  }

  function sendMetricsEvent(eventType) {
    const protocol = window.location.protocol;
    if (protocol !== "https:" && protocol !== "http:") return;

    const payload = JSON.stringify({
      eventType,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      pageUrl: window.location.href,
      referrer: document.referrer || "",
      userAgent: navigator.userAgent || ""
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json; charset=UTF-8" });
      navigator.sendBeacon(remoteMetricsEndpoint, blob);
      return;
    }

    fetch(remoteMetricsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: payload,
      keepalive: true
    }).catch(() => undefined);
  }

  function loadTurnstileScript() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (turnstileScriptPromise) return turnstileScriptPromise;

    turnstileScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-turnstile-script]");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.turnstile), { once: true });
        existing.addEventListener("error", () => reject(new Error("Не удалось загрузить Cloudflare Turnstile.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.turnstileScript = "true";
      script.addEventListener("load", () => resolve(window.turnstile), { once: true });
      script.addEventListener("error", () => reject(new Error("Не удалось загрузить Cloudflare Turnstile.")), { once: true });
      document.head.appendChild(script);
    });

    return turnstileScriptPromise;
  }

  async function setupTurnstileWidget(slot, siteSettings) {
    const siteKey = String(siteSettings.security?.turnstileSiteKey || "").trim();
    if (!slot || !siteKey) return null;

    slot.hidden = false;
    const turnstile = await loadTurnstileScript();
    if (!turnstile || typeof turnstile.render !== "function") {
      throw new Error("Cloudflare Turnstile недоступен.");
    }

    const widgetId = turnstile.render(slot, {
      sitekey: siteKey,
      theme: "light",
      size: "normal"
    });

    return {
      getToken() {
        return typeof turnstile.getResponse === "function" ? String(turnstile.getResponse(widgetId) || "") : "";
      },
      reset() {
        if (typeof turnstile.reset === "function") {
          turnstile.reset(widgetId);
        }
      }
    };
  }

  async function submitLeadToEndpoint(payload, siteSettings) {
    const endpoint = String(siteSettings.security?.leadEndpoint || "/api/lead").trim();
    const protocol = window.location.protocol;
    if (!endpoint || (protocol !== "https:" && protocol !== "http:")) {
      return { mode: "local" };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Сервер отклонил отправку формы.");
    }

    return { mode: "remote", data };
  }

  function applyVisionModeState(enabled) {
    document.body.classList.toggle("vision-mode", enabled);
    document.querySelectorAll(".site-brand-wordmark").forEach((node) => {
      if (enabled) {
        node.style.setProperty("color", "#111", "important");
        node.style.setProperty("-webkit-text-fill-color", "#111", "important");
        node.style.setProperty("text-shadow", "none", "important");
        return;
      }

      node.style.removeProperty("color");
      node.style.removeProperty("-webkit-text-fill-color");
      node.style.removeProperty("text-shadow");
    });
    visionToggleTriggers.forEach((trigger) => {
      trigger.classList.toggle("is-active", enabled);
      trigger.setAttribute("aria-pressed", enabled ? "true" : "false");
      trigger.setAttribute("data-tooltip", enabled ? "Обычная версия сайта" : "Версия для слабовидящих");
    });
  }

  function toggleVisionMode() {
    const scrollY = window.scrollY;
    const nextState = !document.body.classList.contains("vision-mode");
    document.documentElement.classList.add("vision-mode-switching");
    applyVisionModeState(nextState);
    try {
      localStorage.setItem(visionModeKey, nextState ? "1" : "0");
    } catch (error) {}
    window.requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
      window.requestAnimationFrame(() => {
        document.documentElement.classList.remove("vision-mode-switching");
      });
    });
  }

  function applySeo(siteSettings) {
    function ensureMeta(selector, attributes) {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        Object.entries(attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
        document.head.appendChild(element);
      }
      return element;
    }

    document.title = siteSettings.seo.title;
    [
      ["meta[name='description']", siteSettings.seo.description],
      ["meta[name='keywords']", siteSettings.seo.keywords],
      ["meta[property='og:title']", siteSettings.seo.ogTitle],
      ["meta[property='og:description']", siteSettings.seo.ogDescription],
      ["meta[property='og:image']", siteSettings.seo.ogImage || siteSettings.brand.heroImage || ""]
    ].forEach(([selector, value]) => {
      const element =
        document.querySelector(selector) ||
        ensureMeta(
          selector,
          selector.includes("property=")
            ? { property: selector.match(/property='([^']+)'/)[1] }
            : { name: selector.match(/name='([^']+)'/)[1] }
        );
      if (element) element.setAttribute("content", value);
    });
  }

  function applyBrand(siteSettings) {
    const brand = siteSettings.brand || {};
    const brandLink = document.querySelector(".site-brand");
    const mark = document.querySelector("[data-brand-mark]");
    const name = document.querySelector("[data-brand-name]");
    const brandName = brand.name || "Мебельное ателье";
    const brandMark = brand.mark || "МА";

    if (brandLink) brandLink.setAttribute("aria-label", brandName);
    if (name) name.textContent = brandName;
    document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']").forEach((link) => {
      link.setAttribute("href", brand.favicon || "assets/brand/favicon.svg");
    });
    if (!mark) return;

    mark.classList.remove("has-image");
    mark.style.backgroundImage = "";
    mark.style.backgroundSize = "";
    mark.style.backgroundPosition = "";
    mark.style.backgroundRepeat = "";
    mark.textContent = brandMark;
    if (brand.logoImage) {
      mark.classList.add("has-image");
      mark.textContent = "";
      mark.style.backgroundImage = "url('" + brand.logoImage.replace(/'/g, "%27") + "')";
      mark.style.backgroundSize = "cover";
      mark.style.backgroundPosition = "center";
      mark.style.backgroundRepeat = "no-repeat";
    }
  }

  function applyHero(siteSettings) {
    const kicker = document.querySelector(".hero-kicker");
    const title = document.querySelector(".hero-title");
    const text = document.querySelector(".hero-text");
    const formKicker = document.querySelector(".hero-form-kicker");
    const formTitle = document.querySelector(".hero-form-title");
    const formText = document.querySelector(".hero-form-text");
    const formNameInput = document.querySelector('.hero-form input[name="name"]');
    const formPhoneInput = document.querySelector('.hero-form input[name="phone"]');
    const formButton = document.querySelector(".hero-submit-button");
    const heroImage = document.querySelector(".hero-media img");
    const notesRoot = document.querySelector("[data-consultation-notes]");
    const consultation = siteSettings.consultation || {};
    if (kicker) kicker.textContent = siteSettings.hero.kicker;
    if (title) title.textContent = siteSettings.hero.title;
    if (text) text.textContent = siteSettings.hero.text;
    if (formKicker) formKicker.textContent = consultation.eyebrow || siteSettings.hero.formKicker || "Рассчитать стоимость";
    if (formTitle) formTitle.textContent = consultation.title || siteSettings.hero.formTitle || "Оставьте заявку";
    if (formText) formText.textContent = consultation.subtitle || siteSettings.hero.formText || "";
    if (formNameInput) formNameInput.placeholder = siteSettings.hero.formNamePlaceholder || "Ваше имя";
    if (formPhoneInput) formPhoneInput.placeholder = siteSettings.hero.formPhonePlaceholder || "+7 (___) ___-__-__";
    if (formButton) formButton.textContent = consultation.buttonText || siteSettings.hero.formButtonText || "Отправить заявку";
    if (heroImage && (siteSettings.brand.heroImage || siteSettings.seo.ogImage)) {
      heroImage.src = siteSettings.brand.heroImage || siteSettings.seo.ogImage;
      heroImage.alt = siteSettings.brand.heroImageAlt || siteSettings.brand.tagline || siteSettings.brand.name || "Мебельное ателье";
      heroImage.title = siteSettings.brand.heroImageCaption || "";
    }
    if (notesRoot) {
      const notes = [consultation.ctaText, consultation.consultationNote, consultation.estimateNote, consultation.measurementNote]
        .filter(Boolean)
        .map((item) => '<li>' + escapeHtml(item) + "</li>")
        .join("");
      notesRoot.innerHTML = notes ? '<ul class="hero-form-notes-list">' + notes + "</ul>" : "";
    }
  }

  function applyWhyUs(siteSettings) {
    const title = document.querySelector(".why-us-title");
    const text = document.querySelector(".why-us-description");
    const featureNodes = document.querySelectorAll(".why-us-feature p");
    const categoryRoot = document.querySelector(".why-us-categories-grid");
    if (title) title.textContent = siteSettings.whyUs.title;
    if (text) text.textContent = siteSettings.whyUs.text;
    (siteSettings.advantages && siteSettings.advantages.items ? siteSettings.advantages.items : []).forEach((item, index) => {
      if (featureNodes[index]) {
        featureNodes[index].textContent = item;
      }
    });
    if (categoryRoot && siteSettings.catalog && Array.isArray(siteSettings.catalog.categories)) {
      categoryRoot.innerHTML = siteSettings.catalog.categories
        .map((item) => '<span class="why-us-category">' + escapeHtml(item) + "</span>")
        .join("");
    }
  }
  function renderPortfolio(siteSettings) {
    const section = document.getElementById("portfolio");
    const container = section ? section.querySelector(".container") : null;
    if (!container || !siteSettings.portfolio) return;

    const items = (siteSettings.portfolio.items || []).filter((item) => item && item.visible !== false);
    const cards = items
      .map((item) => {
        const chips = [item.metaPrimary, item.metaSecondary]
          .filter(Boolean)
          .map(
            (value) =>
              '<span class="text-xs bg-sand/50 text-graphite/70 px-3 py-1 rounded-full font-sans">' +
              escapeHtml(value) +
              "</span>"
          )
          .join("");

        return (
          '<article class="bg-linen border border-bronze/10 rounded-lg overflow-hidden group shadow-lg portfolio-card">' +
          '<div class="aspect-[3/2] overflow-hidden">' +
          '<img src="' +
          escapeHtml(item.image || "assets/images/portfolio/portfolio-1.jpg") +
          '" alt="' +
          escapeHtml(item.imageAlt || item.title || "Furniture project") +
          '" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" data-portfolio-image>' +
          "</div>" +
          '<div class="p-6 lg:p-8">' +
          '<h3 class="font-serif text-xl font-semibold text-graphite mb-3">' +
          escapeHtml(item.title || "") +
          "</h3>" +
          '<div class="flex flex-wrap gap-2 mb-4">' +
          chips +
          "</div>" +
          '<p class="text-graphite/60 text-sm font-sans leading-relaxed mb-3">' +
          escapeHtml(item.description || "") +
          "</p>" +
          '<p class="text-camel text-xs font-sans">' +
          escapeHtml((siteSettings.portfolio.cardCaption ? siteSettings.portfolio.cardCaption + ": " : "") + (item.materialNote || "")) +
          "</p>" +
          (item.imageCaption ? '<p class="text-graphite/45 text-xs font-sans mt-2">' + escapeHtml(item.imageCaption) + "</p>" : "") +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    container.innerHTML =
      '<div class="text-center mb-16">' +
      '<p class="text-bronze text-sm tracking-[0.2em] uppercase mb-4 font-sans">' +
      escapeHtml(siteSettings.portfolio.eyebrow || "Портфолио") +
      "</p>" +
      '<h2 class="font-serif text-3xl lg:text-5xl font-semibold text-graphite">' +
      escapeHtml(siteSettings.portfolio.title || "Наши проекты") +
      "</h2>" +
      '<p class="text-graphite/60 text-lg font-sans leading-relaxed max-w-3xl mx-auto mt-6">' +
      escapeHtml(siteSettings.portfolio.text || "") +
      "</p>" +
      (siteSettings.portfolio.buttonText
        ? '<a href="' +
          escapeHtml(siteSettings.portfolio.buttonHref || "#contacts") +
          '" class="inline-flex items-center justify-center min-h-[3rem] px-6 mt-8 rounded-2xl bg-[#6f442c] text-[#fff7ef] font-semibold font-sans">' +
          escapeHtml(siteSettings.portfolio.buttonText) +
          "</a>"
        : "") +
      "</div>" +
      '<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">' +
      cards +
      "</div>";
  }
  function renderMaterials(siteSettings) {
    const section = document.getElementById("materials");
    const container = section ? section.querySelector(".container") : null;
    if (!container || !siteSettings.materials) return;

    const items = (siteSettings.materials.items || [])
      .filter((item) => item && item.visible !== false)
      .map(
        (item) =>
          '<article class="bg-sand/40 border border-bronze/10 rounded-lg p-6">' +
          '<h3 class="font-serif text-base font-semibold text-graphite mb-2">' +
          escapeHtml(item.title || "") +
          "</h3>" +
          '<p class="text-sm text-graphite/55 font-sans leading-relaxed">' +
          escapeHtml(item.text || "") +
          "</p>" +
          "</article>"
      )
      .join("");

    container.innerHTML =
      '<div class="grid lg:grid-cols-2 gap-16 items-center mb-16">' +
      "<div>" +
      '<p class="text-bronze text-sm tracking-[0.2em] uppercase mb-4 font-sans">' +
      escapeHtml(siteSettings.materials.eyebrow || "Материалы") +
      "</p>" +
      '<h2 class="font-serif text-3xl lg:text-4xl font-semibold text-graphite mb-6">' +
      escapeHtml(siteSettings.materials.title || "") +
      "</h2>" +
      '<p class="text-graphite/60 text-lg font-sans leading-relaxed">' +
      escapeHtml(siteSettings.materials.text || "") +
      "</p>" +
      "</div>" +
      '<div class="rounded-lg overflow-hidden">' +
      '<img src="' +
        escapeHtml(siteSettings.materials.image || "assets/images/hero/materials-hero.jpg") +
      '" alt="' +
      escapeHtml(siteSettings.materials.imageAlt || siteSettings.materials.title || "Furniture materials") +
      '" loading="lazy" class="w-full h-auto object-cover">' +
      (siteSettings.materials.imageCaption ? '<p class="text-xs text-graphite/45 font-sans mt-3">' + escapeHtml(siteSettings.materials.imageCaption) + "</p>" : "") +
      "</div>" +
      "</div>" +
      '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">' +
      items +
      "</div>";
  }

  function renderProcess(siteSettings) {
    const section = document.getElementById("how-we-work");
    const container = section ? section.querySelector(".container") : null;
    if (!container || !siteSettings.process) return;

    const items = (siteSettings.process.items || [])
      .filter((item) => item && item.visible !== false)
      .map(
        (item) =>
          '<article class="flex gap-6 items-start">' +
          '<div class="w-12 h-12 rounded-full bg-linen border-2 border-camel flex items-center justify-center flex-shrink-0">' +
          '<span class="font-serif text-sm font-bold text-camel">' +
          escapeHtml(item.number || "") +
          "</span>" +
          "</div>" +
          "<div>" +
          '<h3 class="font-serif text-lg font-semibold text-graphite mb-1">' +
          escapeHtml(item.title || "") +
          "</h3>" +
          '<p class="text-graphite/60 text-sm font-sans">' +
          escapeHtml(item.text || "") +
          "</p>" +
          "</div>" +
          "</article>"
      )
      .join("");

    container.innerHTML =
      '<div class="text-center mb-16">' +
      '<p class="text-bronze text-sm tracking-[0.2em] uppercase mb-4 font-sans">' +
      escapeHtml(siteSettings.process.eyebrow || "Процесс") +
      "</p>" +
      '<h2 class="font-serif text-3xl lg:text-5xl font-semibold text-graphite">' +
      escapeHtml(siteSettings.process.title || "") +
      "</h2>" +
      "</div>" +
      '<div class="max-w-4xl mx-auto space-y-8">' +
      items +
      "</div>";
  }

  function renderFaq(siteSettings) {
    const section = document.getElementById("faq");
    const container = section ? section.querySelector(".container") : null;
    if (!container || !siteSettings.faq) return;

    const hasOpen = (siteSettings.faq.items || []).some((entry) => entry && entry.open === true && entry.visible !== false);
    const items = (siteSettings.faq.items || [])
      .filter((item) => item && item.visible !== false)
      .map((item, index) => {
        const isOpen = item.open === true || (!hasOpen && index === 0);
        return (
          '<article class="bg-sand/30 border border-bronze/10 rounded-lg px-6 faq-item" data-open="' +
          (isOpen ? "true" : "false") +
          '">' +
          '<button type="button" class="font-serif text-base font-semibold text-graphite py-5 faq-trigger" aria-expanded="' +
          (isOpen ? "true" : "false") +
          '">' +
          "<span>" +
          escapeHtml(item.question || "") +
          "</span>" +
          '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9l6 6 6-6"/></svg>' +
          "</button>" +
          '<div class="text-graphite/60 text-sm font-sans leading-relaxed pb-5 faq-content"' +
          (isOpen ? "" : " hidden") +
          ">" +
          escapeHtml(item.answer || "") +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    container.innerHTML =
      '<div class="text-center mb-16">' +
      '<p class="text-bronze text-sm tracking-[0.2em] uppercase mb-4 font-sans">' +
      escapeHtml(siteSettings.faq.eyebrow || "Вопросы") +
      "</p>" +
      '<h2 class="font-serif text-3xl lg:text-4xl font-semibold text-graphite">' +
      escapeHtml(siteSettings.faq.title || "") +
      "</h2>" +
      "</div>" +
      '<div class="space-y-3 faq-list" data-accordion="single">' +
      items +
      "</div>";
  }

  function getOrderedBlocks(siteSettings) {
    return (siteSettings.blocks || [])
      .filter((block) => block && block.visible !== false && block.published !== false)
      .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
  }

  function createDynamicBlockMarkup(block) {
    const colorScheme = block.colorScheme || "light";
    const spacing = block.spacing === "compact" ? "compact" : block.spacing === "airy" ? "airy" : "normal";
    const layout = block.layout || (block.image ? "split" : "text");
    const type = block.type || "text";
    const backgroundStyle = block.background ? ' style="background:' + escapeHtml(block.background) + ';"' : "";
    const imagePart = block.image
      ? '<div class="dynamic-block-image-wrap"><img src="' + escapeHtml(block.image) + '" alt="' + escapeHtml(block.imageAlt || block.title || "Furniture block") + '" class="dynamic-block-image">' + (block.imageCaption ? '<p class="dynamic-block-caption">' + escapeHtml(block.imageCaption) + "</p>" : "") + "</div>"
      : "";
    const iconPart = block.icon ? '<p class="dynamic-block-eyebrow">' + escapeHtml(block.icon) + "</p>" : "";
    const subtitlePart = block.subtitle ? '<p class="dynamic-block-subtitle">' + escapeHtml(block.subtitle) + "</p>" : "";
    const buttonPart =
      block.buttonLabel && block.buttonUrl
        ? '<a class="dynamic-block-button" href="' + escapeHtml(block.buttonUrl) + '">' + escapeHtml(block.buttonLabel) + "</a>"
        : "";

    return (
      '<section class="relative z-10 py-24 lg:py-32 dynamic-blocks dynamic-blocks-' + escapeHtml(colorScheme) + ' dynamic-blocks-' + escapeHtml(spacing) + ' dynamic-block-type-' + escapeHtml(type) + '" id="dynamic-block-' + escapeHtml(block.id) + '" data-dynamic-block="' + escapeHtml(block.id) + '" data-block-type="' + escapeHtml(type) + '">' +
      '<div class="container mx-auto px-4 lg:px-8">' +
      '<article class="dynamic-block-card dynamic-block-layout-' + escapeHtml(layout) + '"' + backgroundStyle + ">" +
      imagePart +
      '<div class="dynamic-block-copy">' +
      iconPart +
      '<h3 class="dynamic-block-title">' + escapeHtml(block.title) + "</h3>" +
      subtitlePart +
      '<p class="dynamic-block-text">' + escapeHtml(block.text) + "</p>" +
      buttonPart +
      "</div>" +
      "</article>" +
      "</div>" +
      "</section>"
    );
  }

  function renderReviews(siteSettings) {
    const reviewsSection = document.getElementById("reviews");
    const container = reviewsSection ? reviewsSection.querySelector(".container") : null;
    if (!container) return;

    const formatReviewDate = (value) => {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }) + " г.";
    };

    const reviewCards = siteSettings.reviews.items
      .map((item) => {
        const dateText = formatReviewDate(item.date);
        const sourceUrl = String(item.sourceUrl || "").trim();
        const sourceLabel = item.sourceLabel || "Источник";
        return (
          '<article class="review-card">' +
          '<div class="review-card-body">' +
          '<p class="review-card-author">' + escapeHtml(item.author) + "</p>" +
          '<p class="review-card-quote">«' + escapeHtml(item.quote) + "»</p>" +
          "</div>" +
          '<div class="review-card-footer">' +
          '<p class="review-card-label">' + escapeHtml(item.label) + "</p>" +
          (dateText ? '<div class="review-card-date"><span>Дата публикации</span><strong>' + escapeHtml(dateText) + "</strong></div>" : "") +
          (sourceUrl ? '<a class="review-card-source" href="' + escapeHtml(sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(sourceLabel) + "</a>" : "") +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    const qrCards = siteSettings.reviews.qrCards
      .map(
        (card) =>
          '<article class="review-qr-card">' +
          '<div class="review-qr-copy">' +
          '<div class="review-qr-meta">' +
          renderRatingBadgeMarkup(card) +
          "</div>" +
          '<h3 class="review-qr-title">' + escapeHtml(card.title) + "</h3>" +
          '<p class="review-qr-text">' + escapeHtml(card.text) + "</p>" +
          "</div>" +
          '<div class="review-qr-visual">' +
          '<img src="' + createQrImage(card) + '" alt="QR-код для отзыва" class="review-qr-image' + (card.qrMode === "uploaded" || getCachedQrData(card.linkUrl) ? "" : " is-loading") + '" data-qr-link="' + escapeHtml(card.linkUrl || "") + '" width="180" height="180" loading="lazy" decoding="async" fetchpriority="low">' +
          "</div>" +
          "</article>"
      )
      .join("");

    container.innerHTML =
      '<div class="reviews-shell">' +
      '<div class="reviews-heading text-center mb-16">' +
      '<p class="reviews-eyebrow">' + escapeHtml(siteSettings.reviews.eyebrow) + "</p>" +
      '<h2 class="reviews-title">' + escapeHtml(siteSettings.reviews.title) + "</h2>" +
      '<p class="reviews-text">' + escapeHtml(siteSettings.reviews.text) + "</p>" +
      "</div>" +
      '<div class="reviews-carousel">' +
      '<button type="button" class="reviews-arrow reviews-arrow-prev" aria-label="Предыдущие отзывы">' +
      '<span aria-hidden="true">‹</span>' +
      "</button>" +
      '<div class="reviews-grid" data-reviews-track>' + reviewCards + "</div>" +
      '<button type="button" class="reviews-arrow reviews-arrow-next" aria-label="Следующие отзывы">' +
      '<span aria-hidden="true">›</span>' +
      "</button>" +
      "</div>" +
      '<div class="reviews-qr-grid">' + qrCards + "</div>" +
      "</div>";

    siteSettings.reviews.qrCards.forEach(preloadQrImage);
    runWhenIdle(() => prefetchQrCodes(siteSettings));
    fetchLiveRatings(siteSettings);
  }

  function renderCustomBlocks(siteSettings) {
    document.querySelectorAll("[data-dynamic-block]").forEach((node) => node.remove());
    const blocks = getOrderedBlocks(siteSettings);
    if (!blocks.length) return;
    const insertionPoints = new Map();

    blocks.forEach((block) => {
      const anchorId = block.position || "contacts";
      const anchor = insertionPoints.get(anchorId) || document.getElementById(anchorId);
      const template = document.createElement("div");
      template.innerHTML = createDynamicBlockMarkup(block);
      const rendered = template.firstElementChild;

      if (!rendered) return;
      if (anchor && anchor.parentNode) {
        anchor.insertAdjacentElement("afterend", rendered);
        insertionPoints.set(anchorId, rendered);
      } else if (siteFooter && siteFooter.parentNode) {
        siteFooter.insertAdjacentElement("beforebegin", rendered);
      }
    });
  }

  function applyContacts(siteSettings) {
    const section = document.getElementById("contacts");
    const heading = document.querySelector("#contacts .text-center");
    if (heading) {
      heading.innerHTML =
        '<p class="text-bronze text-sm tracking-[0.2em] uppercase mb-4 font-sans">' +
        escapeHtml(siteSettings.contacts.eyebrow || "Контакты") +
        "</p>" +
        '<h2 class="font-serif text-3xl lg:text-4xl font-semibold text-graphite">' +
        escapeHtml(siteSettings.contacts.title || "Свяжитесь с нами") +
        "</h2>";
    }

    const columns = document.querySelectorAll("#contacts .space-y-8 > div");
    if (columns.length >= 5) {
      const address = columns[0].querySelectorAll("p");
      const hours = columns[1].querySelectorAll("p");
      const phone = columns[2].querySelector("a");
      const email = columns[3].querySelector("a");
      const socials = columns[4].querySelector("[data-social-links]");
      const phoneTitle = columns[2].querySelector("p");
      const emailTitle = columns[3].querySelector("p");
      const socialsTitle = columns[4].querySelector("p");
      if (address[0]) address[0].textContent = siteSettings.contacts.addressTitle || "Шоурум и студия";
      if (address[1]) address[1].textContent = siteSettings.contacts.address;
      if (address[2]) address[2].textContent = [siteSettings.contacts.city, siteSettings.contacts.addressLabel].filter(Boolean).join(" • ");
      if (hours[0]) hours[0].textContent = siteSettings.contacts.hoursTitle || "Часы работы";
      if (hours[1]) hours[1].textContent = siteSettings.contacts.hoursDisplay || siteSettings.contacts.hoursWeekdays;
      if (hours[2]) hours[2].textContent = siteSettings.contacts.mapRouteLabel || siteSettings.contacts.hoursWeekend;
      if (phoneTitle) phoneTitle.textContent = siteSettings.contacts.phoneTitle || "Телефон";
      if (phone) {
        phone.textContent = siteSettings.contacts.phoneDisplay;
        phone.href = "tel:" + siteSettings.contacts.phoneHref;
      }
      if (emailTitle) emailTitle.textContent = siteSettings.contacts.emailTitle || "Email";
      if (email) {
        email.textContent = siteSettings.contacts.email;
        email.href = "mailto:" + siteSettings.contacts.email;
      }
      if (socialsTitle) socialsTitle.textContent = siteSettings.contacts.socialsTitle || "Мессенджеры и соцсети";
      if (socials) {
        socials.innerHTML = (siteSettings.contacts.socialLinks || [])
          .map((item) => {
            return (
              '<a href="' +
              escapeHtml(item.url) +
              '" target="_blank" rel="noreferrer" class="contacts-social-link">' +
              escapeHtml(item.label) +
              "</a>"
            );
          })
          .join("");
      }
    }

    const mapBox = document.querySelector("#contacts .bg-sand\\/50");
    if (!mapBox) return;
    if (siteSettings.contacts.mapWidgetUrl) {
      mapBox.innerHTML = '<iframe src="' + siteSettings.contacts.mapWidgetUrl + '" class="contacts-map-frame" loading="lazy"></iframe>';
      return;
    }
    mapBox.innerHTML =
      '<div class="text-center contacts-map-placeholder">' +
      '<p class="text-sm text-graphite/40 font-sans">' + escapeHtml(siteSettings.contacts.mapTitle || "Шоурум мебельной студии") + "</p>" +
      '<p class="text-xs text-graphite/30 font-sans mt-1">' + escapeHtml(siteSettings.contacts.mapRouteLabel || "Откройте карту и постройте маршрут") + "</p>" +
      '<p class="text-xs text-graphite/30 font-sans mt-2">' + escapeHtml(siteSettings.contacts.mapNote || "") + "</p>" +
      (
        siteSettings.contacts.mapPublicUrl
          ? '<a class="contacts-map-link" href="' + escapeHtml(siteSettings.contacts.mapPublicUrl) + '" target="_blank" rel="noreferrer">Открыть карту</a>'
          : ""
      ) +
      "</div>";
  }

  function renderFooter(siteSettings) {
    if (!siteFooter) return;
    const footer = siteSettings.footer || {};
    const catalogItems = ((siteSettings.catalog && siteSettings.catalog.categories) || [])
      .slice(0, 6)
      .map((item) => '<li><a href="#why-us" class="text-sm text-sand/50 hover:text-sand transition-colors font-sans footer-link">' + escapeHtml(item) + "</a></li>")
      .join("");
    const companyLinks = [
      { href: "#portfolio", label: "Проекты" },
      { href: "#materials", label: "Материалы" },
      { href: "#how-we-work", label: "Этапы работы" },
      { href: "#contacts", label: "Контакты" }
    ]
      .map((item) => '<li><a href="' + item.href + '" class="text-sm text-sand/50 hover:text-sand transition-colors font-sans footer-link">' + escapeHtml(item.label) + "</a></li>")
      .join("");

    siteFooter.innerHTML =
      '<div class="container mx-auto px-4 lg:px-8">' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">' +
      '<div><div class="site-brand footer-brand"><span class="site-brand-badge" aria-hidden="true">' + escapeHtml((siteSettings.brand && siteSettings.brand.mark) || "МА") + '</span></div><p class="text-sand/50 text-sm font-sans leading-relaxed">' + escapeHtml(footer.brandDescription || "") + "</p></div>" +
      '<div><h4 class="font-serif text-base font-semibold text-linen mb-4">' + escapeHtml((siteSettings.catalog && siteSettings.catalog.subtitle) || "Каталог") + '</h4><ul class="space-y-2">' + catalogItems + "</ul></div>" +
      '<div><h4 class="font-serif text-base font-semibold text-linen mb-4">Проекты и разделы</h4><ul class="space-y-2">' + companyLinks + "</ul></div>" +
      '<div><h4 class="font-serif text-base font-semibold text-linen mb-4">' + escapeHtml(footer.contactTitle || "Консультация и расчёт") + '</h4><p class="text-sand/50 text-sm font-sans leading-relaxed">' + escapeHtml(footer.contactText || "") + "</p></div>" +
      "</div>" +
      '<div class="bronze-line mb-8"></div>' +
      '<div class="flex flex-col sm:flex-row justify-between items-center gap-4"><p class="text-sand/30 text-xs font-sans">' +
      escapeHtml(String(footer.copyrightText || "").replace("{{year}}", String(new Date().getFullYear()))) +
      '</p><div class="flex gap-6 footer-policy"><a href="' +
      escapeHtml(footer.privacyUrl || "#") +
      '" class="text-sand/30 text-xs font-sans hover:text-sand/60 transition-colors footer-link">' +
      escapeHtml(footer.privacyLabel || "Политика конфиденциальности") +
      '</a><a href="' +
      escapeHtml(footer.agreementUrl || "#") +
      '" class="text-sand/30 text-xs font-sans hover:text-sand/60 transition-colors footer-link">' +
      escapeHtml(footer.agreementLabel || "Пользовательское соглашение") +
      "</a></div></div></div>";
  }
  function setupLeadForm(siteSettings) {
    const form = document.querySelector(".hero-form");
    if (!form || !siteApi) return;
    const submitButton = form.querySelector(".hero-submit-button");
    const startedAtInput = form.querySelector('input[name="startedAt"]');
    const turnstileSlot = form.querySelector("[data-turnstile-slot]");
    const feedback = document.createElement("p");
    feedback.className = "hero-form-feedback";
    form.appendChild(feedback);

    if (startedAtInput) {
      startedAtInput.value = String(Date.now());
    }

    let turnstileWidget = null;
    setupTurnstileWidget(turnstileSlot, siteSettings)
      .then((widget) => {
        turnstileWidget = widget;
      })
      .catch((error) => {
        feedback.textContent = error.message;
        feedback.dataset.state = "error";
      });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const company = String(formData.get("company") || "").trim();
      const startedAt = Number(formData.get("startedAt") || 0);
      const consent = Boolean(formData.get("consent"));
      const turnstileToken = turnstileWidget ? turnstileWidget.getToken() : "";
      const minSubmissionTimeMs = Math.max(1000, Number(siteSettings.security?.minSubmissionTimeMs) || 3000);
      const clientCooldownMs = Math.max(10000, Number(siteSettings.security?.clientCooldownMs) || 45000);
      const now = Date.now();

      if (company) {
        feedback.textContent = "Проверка формы не пройдена.";
        feedback.dataset.state = "error";
        return;
      }

      if (!startedAt || now - startedAt < minSubmissionTimeMs) {
        feedback.textContent = "Форма отправлена слишком быстро. Попробуйте ещё раз через пару секунд.";
        feedback.dataset.state = "error";
        return;
      }

      if (!name || !phone || !consent) {
        feedback.textContent = "Заполните имя и телефон. Если не поставить галочку согласия с политикой, заявка не отправится.";
        feedback.dataset.state = "error";
        return;
      }

      if (getLeadCooldownUntil() > now) {
        feedback.textContent = "Форма уже была отправлена недавно. Повторите попытку чуть позже.";
        feedback.dataset.state = "error";
        return;
      }

      if (String(siteSettings.security?.turnstileSiteKey || "").trim() && !turnstileToken) {
        feedback.textContent = "Подтвердите, что вы не робот.";
        feedback.dataset.state = "error";
        return;
      }

      const lead = {
        id: "lead-" + Date.now(),
        name,
        phone,
        createdAt: new Date().toISOString(),
        targetEmail: siteSettings.contacts.leadsEmail
      };

      const payload = {
        ...lead,
        trapField: company,
        startedAt,
        turnstileToken,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent
      };

      if (submitButton) submitButton.disabled = true;

      try {
        const result = await submitLeadToEndpoint(payload, siteSettings);
        siteApi.pushLead(lead);
        if (typeof siteApi.recordLead === "function") {
          siteApi.recordLead();
        }
        sendMetricsEvent("lead");
        setLeadCooldownUntil(now + clientCooldownMs);
        feedback.textContent =
          result.mode === "remote"
            ? "Заявка отправлена и защищена Cloudflare Turnstile."
            : "Заявка сохранена локально. Для продакшена подключите Cloudflare Pages Function.";
        feedback.dataset.state = "success";
        form.reset();
        if (startedAtInput) {
          startedAtInput.value = String(Date.now());
        }
        if (turnstileWidget) {
          turnstileWidget.reset();
        }
        if (submitButton) submitButton.blur();
      } catch (error) {
        feedback.textContent = error instanceof Error ? error.message : "Не удалось отправить форму.";
        feedback.dataset.state = "error";
        if (turnstileWidget) {
          turnstileWidget.reset();
        }
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  function setupFaq() {
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach((item) => {
      const trigger = item.querySelector(".faq-trigger");
      const content = item.querySelector(".faq-content");
      if (!trigger || !content) return;
      trigger.addEventListener("click", () => {
        const isOpen = item.getAttribute("data-open") === "true";
        faqItems.forEach((other) => {
          const otherTrigger = other.querySelector(".faq-trigger");
          const otherContent = other.querySelector(".faq-content");
          if (!otherTrigger || !otherContent) return;
          other.setAttribute("data-open", "false");
          otherTrigger.setAttribute("aria-expanded", "false");
          otherContent.hidden = true;
        });
        if (!isOpen) {
          item.setAttribute("data-open", "true");
          trigger.setAttribute("aria-expanded", "true");
          content.hidden = false;
        }
      });
    });
  }

  function setupVisionToggle() {
    const initialState = getStoredVisionMode();
    applyVisionModeState(initialState);
    visionToggleTriggers.forEach((trigger) => {
      trigger.addEventListener("click", toggleVisionMode);
    });
  }

  function setupRevealOnScroll() {
    const targets = document.querySelectorAll("main > section:not(.hero-section), .review-card, .review-qr-card, .dynamic-block-card, #portfolio .group");
    if (!targets.length) return;

    targets.forEach((item) => item.classList.add("reveal-on-scroll"));

    if (!("IntersectionObserver" in window) || reducedMotion.matches) {
      targets.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach((item) => observer.observe(item));
  }

  function setupReviewsCarousel() {
    const track = document.querySelector("[data-reviews-track]");
    const prev = document.querySelector(".reviews-arrow-prev");
    const next = document.querySelector(".reviews-arrow-next");
    if (!track || !prev || !next) return;

    let heightFrame = 0;

    const updateTrackHeight = () => {
      const cards = Array.from(track.querySelectorAll(".review-card"));
      if (!cards.length) {
        track.style.removeProperty("--reviews-track-height");
        return;
      }

      track.style.removeProperty("--reviews-track-height");
      cards.forEach((card) => {
        card.style.removeProperty("min-height");
      });

      const maxHeight = Math.ceil(
        cards.reduce((height, card) => Math.max(height, card.scrollHeight), 0)
      );
      if (!maxHeight) return;

      track.style.setProperty("--reviews-track-height", maxHeight + "px");
      cards.forEach((card) => {
        card.style.minHeight = maxHeight + "px";
      });
    };

    const scheduleTrackHeightUpdate = () => {
      if (heightFrame) window.cancelAnimationFrame(heightFrame);
      heightFrame = window.requestAnimationFrame(() => {
        heightFrame = 0;
        updateTrackHeight();
        updateArrows();
      });
    };

    const getStep = () => {
      const firstCard = track.querySelector(".review-card");
      if (!firstCard) return 320;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap || "0");
      return firstCard.getBoundingClientRect().width + gap;
    };

    const updateArrows = () => {
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth - 4);
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= maxScroll;
    };

    prev.addEventListener("click", () => {
      track.scrollBy({ left: -getStep(), behavior: reducedMotion.matches ? "auto" : "smooth" });
    });

    next.addEventListener("click", () => {
      track.scrollBy({ left: getStep(), behavior: reducedMotion.matches ? "auto" : "smooth" });
    });

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    track.addEventListener("pointerdown", (event) => {
      isDragging = true;
      startX = event.clientX;
      startScrollLeft = track.scrollLeft;
      track.classList.add("is-dragging");
      track.setPointerCapture(event.pointerId);
    });

    track.addEventListener("pointermove", (event) => {
      if (!isDragging) return;
      const delta = event.clientX - startX;
      track.scrollLeft = startScrollLeft - delta;
    });

    const stopDragging = () => {
      isDragging = false;
      track.classList.remove("is-dragging");
    };

    track.addEventListener("pointerup", stopDragging);
    track.addEventListener("pointercancel", stopDragging);
    track.addEventListener("lostpointercapture", stopDragging);
    track.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", scheduleTrackHeightUpdate);

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(scheduleTrackHeightUpdate);
      track.querySelectorAll(".review-card").forEach((card) => resizeObserver.observe(card));
    }

    scheduleTrackHeightUpdate();
    updateArrows();
  }

  function setupPortfolioLightbox() {
    const cards = document.querySelectorAll("#portfolio [data-portfolio-image]");
    if (!cards.length) return;

    const lightbox = document.createElement("div");
    lightbox.className = "portfolio-lightbox";
    lightbox.innerHTML =
      '<div class="portfolio-lightbox-dialog">' +
      '<button type="button" class="portfolio-lightbox-close" aria-label="Закрыть">×</button>' +
      '<img src="" alt="" class="portfolio-lightbox-image">' +
      "</div>";

    document.body.appendChild(lightbox);

    const image = lightbox.querySelector(".portfolio-lightbox-image");
    const close = () => lightbox.classList.remove("is-open");

    cards.forEach((card) => {
      card.style.cursor = "zoom-in";
      card.addEventListener("click", () => {
        image.src = card.currentSrc || card.src;
        image.alt = card.alt || "Изображение проекта";
        lightbox.classList.add("is-open");
      });
    });

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox || event.target.closest(".portfolio-lightbox-close")) {
        close();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  if (mobileToggle) mobileToggle.addEventListener("click", toggleMobileMenu);
  reloadHomeTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      closeMobileMenu();
      sessionStorage.setItem(reloadToTopKey, "1");
      window.scrollTo(0, 0);
      window.location.href = "index.html";
    });
  });
  if (mobileMenu) {
    mobileMenu.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) {
        closeMobileMenu();
      }
    });
  }
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
    });
  }

  desktopMedia.addEventListener("change", (event) => {
    if (event.matches) closeMobileMenu();
    updateHeaderState();
    updateHeroParallax();
  });
  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateHeaderState();
      updateBackToTop();
      updateHeroParallax();
      scrollTicking = false;
    });
  }, { passive: true });

  if (header) document.documentElement.style.setProperty("--header-height", header.offsetHeight + "px");

  if (settings) {
    if (typeof siteApi.recordVisit === "function") {
      siteApi.recordVisit();
    }
    sendMetricsEvent("visit");
    applySeo(settings);
    applyBrand(settings);
    renderNavigation(settings);
    applyHero(settings);
    applyWhyUs(settings);
    renderPortfolio(settings);
    renderMaterials(settings);
    renderProcess(settings);
    renderFaq(settings);
    applySectionStructure(settings);
    renderReviews(settings);
    renderCustomBlocks(settings);
    applyContacts(settings);
    renderFooter(settings);
    setupLeadForm(settings);
  }

  setupFaq();
  setupVisionToggle();
  setupReviewsCarousel();
  setupRevealOnScroll();
  setupPortfolioLightbox();
  initHomeSecurityGate();
  updateHeaderState();
  updateBackToTop();
  updateHeroParallax();
  finalizeInitialRender();
})();
