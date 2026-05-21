(function () {
  var SUPPORTED_LANGS = ["en-US", "zh-CN", "zh_TW", "ko", "jp", "vi_VN", "ar_SA"];
  var DEFAULT_LANG = "en-US";

  function updateLanguageState(lng) {
    var langForHtml = lng.replace("_", "-");
    if (lng === "jp") langForHtml = "ja";
    document.documentElement.lang = langForHtml;
    document.documentElement.dir = lng === "ar_SA" ? "rtl" : "ltr";

    document.querySelectorAll("[data-locale]").forEach(function (node) {
      var current = node.getAttribute("data-locale") === lng;
      if (current) node.setAttribute("aria-current", "true");
      else node.removeAttribute("aria-current");
    });
  }

  function translateText() {
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      if (!key) return;
      node.textContent = i18next.t(key);
    });
  }

  function translateHtml() {
    document.querySelectorAll("[data-i18n-html]").forEach(function (node) {
      var key = node.getAttribute("data-i18n-html");
      if (!key) return;
      node.innerHTML = i18next.t(key);
    });
  }

  function translateAttributes() {
    document.querySelectorAll("[data-i18n-attr]").forEach(function (node) {
      var spec = node.getAttribute("data-i18n-attr");
      if (!spec) return;

      spec.split(",").forEach(function (pair) {
        var trimmed = pair.trim();
        if (!trimmed) return;
        var idx = trimmed.indexOf(":");
        if (idx < 1) return;

        var attr = trimmed.slice(0, idx).trim();
        var key = trimmed.slice(idx + 1).trim();
        if (!attr || !key) return;
        node.setAttribute(attr, i18next.t(key));
      });
    });
  }

  function renderLanguage(lng) {
    updateLanguageState(lng);
    translateText();
    translateHtml();
    translateAttributes();
  }

  function bindLanguageSwitch() {
    document.querySelectorAll("[data-locale]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var next = link.getAttribute("data-locale");
        if (SUPPORTED_LANGS.indexOf(next) === -1) return;

        i18next.changeLanguage(next, function () {
          renderLanguage(next);
        });

        var details = link.closest("details");
        if (details) details.removeAttribute("open");
      });
    });
  }

  function resolveLoadPath(lngs) {
    var lng = Array.isArray(lngs) ? lngs[0] : lngs;
    if (lng === "zh-CN") return "./lang/zh_CN.json";
    if (lng === "zh_TW") return "./lang/zh_TW.json";
    if (lng === "ko") return "./lang/ko.json";
    if (lng === "jp") return "./lang/jp.json";
    if (lng === "vi_VN") return "./lang/vi_VN.json";
    if (lng === "ar_SA") return "./lang/ar_SA.json";
    return "./lang/en_US.json";
  }

  function initI18n() {
    if (!window.i18next || !window.i18nextHttpBackend || !window.i18nextBrowserLanguageDetector) {
      return;
    }

    i18next
      .use(i18nextHttpBackend)
      .use(i18nextBrowserLanguageDetector)
      .init({
        supportedLngs: SUPPORTED_LANGS,
        fallbackLng: DEFAULT_LANG,
        nonExplicitSupportedLngs: false,
        load: "currentOnly",
        backend: {
          loadPath: resolveLoadPath
        },
        detection: {
          order: ["localStorage", "navigator", "htmlTag"],
          lookupLocalStorage: "i18nextLng",
          caches: ["localStorage"]
        }
      })
      .then(function () {
        var lng = i18next.resolvedLanguage || i18next.language || DEFAULT_LANG;
        if (SUPPORTED_LANGS.indexOf(lng) === -1) lng = DEFAULT_LANG;
        if (lng !== i18next.language) {
          i18next.changeLanguage(lng, function () {
            renderLanguage(lng);
          });
          return;
        }
        renderLanguage(lng);
      })
      .catch(function (err) {
        console.error("[i18n] init failed:", err);
      });

    i18next.on("languageChanged", function (lng) {
      renderLanguage(SUPPORTED_LANGS.indexOf(lng) > -1 ? lng : DEFAULT_LANG);
    });

    i18next.on("loaded", function () {
      var lng = i18next.resolvedLanguage || i18next.language || DEFAULT_LANG;
      renderLanguage(SUPPORTED_LANGS.indexOf(lng) > -1 ? lng : DEFAULT_LANG);
    });

    i18next.on("failedLoading", function (lng, ns, msg) {
      console.error("[i18n] failedLoading:", lng, ns, msg);
    });

    bindLanguageSwitch();
  }

  document.addEventListener("DOMContentLoaded", initI18n);
})();
