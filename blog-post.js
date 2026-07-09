(function () {
  const LOCALE_KEY = "pro-algorithm-locale";
  const i18nRoot = window.PRO_ALGORITHM;

  if (!i18nRoot?.locales) {
    throw new Error("Missing PRO_ALGORITHM.locales. Load content.js before blog-post.js.");
  }

  function isEnglishDomain(hostname) {
    const host = hostname.toLowerCase();
    return (i18nRoot.englishDomains || []).some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    );
  }

  function getLocale() {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved === "en" || saved === "he") return saved;
    return isEnglishDomain(window.location.hostname) ? "en" : "he";
  }

  function buildContent(locale) {
    const localeContent = i18nRoot.locales[locale] || i18nRoot.locales.he;
    return { ...localeContent, assets: i18nRoot.assets };
  }

  function assetUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//.test(path)) return path;
    const clean = path.replace(/^\//, "");
    return `/${clean}`;
  }

  function getBlogSlug() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const blogIndex = parts.indexOf("blog");
    if (blogIndex !== -1) {
      const candidate = parts[blogIndex + 1];
      if (candidate && candidate !== "post.html") {
        return decodeURIComponent(candidate);
      }
    }
    return new URLSearchParams(window.location.search).get("slug");
  }

  function resolveSiteUrl() {
    return (i18nRoot.seo?.siteUrl || window.location.origin).replace(/\/$/, "");
  }

  const locale = getLocale();
  const content = buildContent(locale);
  const ui = content.ui || {};
  const slug = getBlogSlug();
  const post = content.blogs?.items?.find((item) => item.slug === slug);
  const siteUrl = resolveSiteUrl();

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function setText(selector, value) {
    $$(selector).forEach((node) => {
      node.textContent = value || "";
    });
  }

  function setMeta(selector, value) {
    const node = $(selector);
    if (node && value) node.setAttribute("content", value);
  }

  function applyDocumentLocale() {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
  }

  function hydrateUiStrings() {
    setText('[data-i18n="skipLink"]', ui.skipLink);
    setText('[data-i18n="brandTagline"]', ui.brandTagline);
    setText('[data-i18n="openMenu"]', ui.openMenu);
    setText('[data-content="back-to-blog"]', ui.backToBlog);
    setText('[data-content="copyright"]', content.footer?.copyright);
    setText('[data-content="footer-body"]', content.footer?.body);

    const mainNav = $("nav.header-shell");
    if (mainNav) mainNav.setAttribute("aria-label", ui.mainNav);
  }

  function renderNav() {
    const desktopNav = $("[data-nav-links]");
    const mobileNav = $("[data-mobile-nav]");
    if (!desktopNav || !mobileNav) return;

    const links = content.nav
      .map((item) => `<a href="/#${item.target}">${item.label}</a>`)
      .join("");

    desktopNav.innerHTML = links;
    mobileNav.innerHTML = links;
  }

  function renderSocials() {
    const list = $("[data-social-links]");
    if (!list || !content.footer?.socials?.length) return;

    list.innerHTML = content.footer.socials
      .map(
        (item) => `
          <a href="${item.url}" target="_blank" rel="noreferrer" aria-label="${item.label}">
            <i class="${item.icon}" aria-hidden="true"></i>
          </a>
        `,
      )
      .join("");
  }

  function setupLanguageSwitcher() {
    const switcher = $("[data-lang-switcher]");
    if (!switcher) return;

    switcher.querySelectorAll("[data-lang]").forEach((button) => {
      const buttonLocale = button.dataset.lang;
      button.classList.toggle("is-active", buttonLocale === locale);
      button.setAttribute("aria-pressed", String(buttonLocale === locale));
      button.addEventListener("click", () => {
        if (buttonLocale === locale) return;
        localStorage.setItem(LOCALE_KEY, buttonLocale);
        window.location.reload();
      });
    });
  }

  function setupMobileMenu() {
    const toggle = $(".menu-toggle");
    const menu = $("[data-mobile-nav]");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      menu.hidden = isOpen;
      document.body.classList.toggle("menu-open", !isOpen);
    });
  }

  function closeMobileMenu() {
    const toggle = $(".menu-toggle");
    const menu = $("[data-mobile-nav]");
    if (!toggle || !menu) return;

    toggle.setAttribute("aria-expanded", "false");
    menu.hidden = true;
    document.body.classList.remove("menu-open");
  }

  function setupRevealAnimations() {
    const animated = $$("[data-animate]");
    if (!("IntersectionObserver" in window)) {
      animated.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.15 },
    );

    animated.forEach((node) => observer.observe(node));
  }

  function hydrateAssets() {
    $$("[data-logo]").forEach((image) => {
      image.src = assetUrl(content.assets.logo);
    });
    $$("[data-logo-white]").forEach((image) => {
      image.src = assetUrl(content.assets.logoWhite);
    });
  }

  function renderNotFound() {
    const article = $("[data-blog-content]");
    if (!article) return;

    const title = locale === "he" ? "המאמר לא נמצא" : "Article not found";
    document.title = `${title} | Pro Algorithm`;
    article.innerHTML = `
      <div class="blog-article-copy">
        <h1>${title}</h1>
        <p>${locale === "he" ? "המאמר שחיפשתם לא קיים." : "The article you are looking for does not exist."}</p>
        <a class="btn btn-primary" href="/#blog">${ui.backToBlog || ui.backToHome || "Back"}</a>
      </div>
    `;
  }

  function renderPost() {
    if (!post) {
      renderNotFound();
      return;
    }

    const pageUrl = `${siteUrl}/blog/${post.slug}`;
    const imageUrl = post.image ? `${siteUrl}/${post.image.replace(/^\//, "")}` : "";
    const description = post.excerpt || post.body?.[0] || "";

    document.title = `${post.title} | Pro Algorithm`;
    setMeta('meta[name="description"]', description);
    setMeta("[data-meta-description]", description);
    setMeta("[data-og-title]", post.title);
    setMeta("[data-og-description]", description);
    setMeta("[data-og-url]", pageUrl);
    if (imageUrl) setMeta("[data-og-image]", imageUrl);

    const canonical = $("[data-canonical]");
    if (canonical) canonical.href = pageUrl;

    const hero = $("[data-blog-hero]");
    const heroImage = $("[data-blog-image]");
    if (hero && heroImage && post.image) {
      hero.hidden = false;
      heroImage.src = assetUrl(post.image);
      heroImage.alt = post.title;
    }

    const article = $("[data-blog-content]");
    if (!article) return;

    const paragraphs = (post.body || [])
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("");

    let linksBlock = "";
    if (post.type === "internal" && post.links?.length) {
      linksBlock = `
        <div class="blog-article-links">
          <h2>${ui.blogInternalLinks || "On this site"}</h2>
          <ul>
            ${post.links
              .map((link) => `<li><a href="${link.href}">${link.label}</a></li>`)
              .join("")}
          </ul>
        </div>
      `;
    }

    let externalBlock = "";
    if (post.type === "external" && post.externalUrl) {
      externalBlock = `
        <div class="blog-article-cta">
          <a class="btn btn-primary" href="${post.externalUrl}" target="_blank" rel="noreferrer">
            ${post.cta || ui.blogExternalCta || ui.visitSite || "Visit site →"}
          </a>
        </div>
      `;
    }

    article.innerHTML = `
      <div class="blog-article-copy">
        <p class="section-kicker">${content.blogs.eyebrow}</p>
        <h1>${post.title}</h1>
        <p class="blog-article-excerpt">${post.excerpt || ""}</p>
        ${paragraphs}
        ${linksBlock}
        ${externalBlock}
      </div>
    `;
  }

  function init() {
    applyDocumentLocale();
    hydrateUiStrings();
    hydrateAssets();
    renderNav();
    renderSocials();
    setupLanguageSwitcher();
    setupMobileMenu();
    setupRevealAnimations();
    renderPost();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
