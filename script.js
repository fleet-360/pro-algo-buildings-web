(function () {
  const LOCALE_KEY = "pro-algorithm-locale";
  const i18nRoot = window.PRO_ALGORITHM;

  if (!i18nRoot?.locales) {
    throw new Error("Missing PRO_ALGORITHM.locales. Load content.js before script.js.");
  }

  function isEnglishDomain(hostname) {
    const host = hostname.toLowerCase();
    return (i18nRoot.englishDomains || []).some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    );
  }

  function getDefaultLocale() {
    return isEnglishDomain(window.location.hostname) ? "en" : "he";
  }

  function getStoredLocale() {
    const saved = localStorage.getItem(LOCALE_KEY);
    return saved === "en" || saved === "he" ? saved : null;
  }

  function getLocale() {
    return getStoredLocale() || getDefaultLocale();
  }

  function buildContent(locale) {
    const localeContent = i18nRoot.locales[locale] || i18nRoot.locales.he;
    return {
      ...localeContent,
      assets: i18nRoot.assets,
    };
  }

  let locale = getLocale();
  let content = buildContent(locale);

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const pad = (number) => String(number).padStart(2, "0");
  const ui = () => content.ui || {};

  function isLocalDevHost() {
    const host = window.location.hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  }

  function blogPostUrl(slug) {
    const encoded = encodeURIComponent(slug);
    return isLocalDevHost()
      ? `/blog/post.html?slug=${encoded}`
      : `/blog/${encoded}`;
  }

  const CONTACT_API = {
    url: "https://api.fleet360.co.il/contact/buildings",
  };

  function applyDocumentLocale() {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
  }

  function setText(selector, value) {
    $$(selector).forEach((node) => {
      node.textContent = value || "";
    });
  }

  function setLink(selector, href) {
    $$(selector).forEach((node) => {
      node.href = href || "#";
    });
  }

  function hydrateUiStrings() {
    const strings = ui();
    setText('[data-i18n="skipLink"]', strings.skipLink);
    setText('[data-i18n="brandTagline"]', strings.brandTagline);
    setText('[data-i18n="openMenu"]', strings.openMenu);
    setText('[data-i18n="formFullName"]', strings.formFullName);
    setText('[data-i18n="formPhone"]', strings.formPhone);
    setText('[data-i18n="formEmail"]', strings.formEmail);
    setText('[data-i18n="formSubmit"]', strings.formSubmit);

    const contactCta = $('[data-content="contact-phone"]');
    if (contactCta) {
      contactCta.setAttribute("aria-label", strings.contactUsAria || strings.contactUs);
    }

    const mainNav = $("nav.header-shell");
    if (mainNav) mainNav.setAttribute("aria-label", strings.mainNav);

    const solutionsSection = $("#solutions");
    if (solutionsSection) solutionsSection.setAttribute("aria-label", strings.solutionsSection);

    const solutionsTrack = $("[data-solutions-track]");
    if (solutionsTrack) solutionsTrack.setAttribute("aria-label", strings.solutionsGallery);

    $$(".solution-controls").forEach((node) => {
      node.setAttribute("aria-label", strings.solutionsNav);
    });

    const statsSection = $(".stats");
    if (statsSection) statsSection.setAttribute("aria-label", strings.statsSection);

    const podcastList = $("[data-podcast-list]");
    if (podcastList) podcastList.setAttribute("aria-label", strings.youtubeVideos);

    const mediaList = $("[data-media-list]");
    if (mediaList) mediaList.setAttribute("aria-label", strings.mediaSection);

    const blogSection = $("#blog");
    if (blogSection) blogSection.setAttribute("aria-label", strings.blogSection);

    const blogList = $("[data-blog-list]");
    if (blogList) blogList.setAttribute("aria-label", strings.blogSection);

    $$('[data-scroll-prev="media"]').forEach((button) => {
      button.setAttribute("aria-label", strings.scrollPrev);
    });
    $$('[data-scroll-next="media"]').forEach((button) => {
      button.setAttribute("aria-label", strings.scrollNext);
    });
    $$('[data-scroll-prev="blog"]').forEach((button) => {
      button.setAttribute("aria-label", strings.scrollPrev);
    });
    $$('[data-scroll-next="blog"]').forEach((button) => {
      button.setAttribute("aria-label", strings.scrollNext);
    });
  }

  function resolveSiteUrl() {
    return (i18nRoot.seo?.siteUrl || window.location.origin).replace(/\/$/, "");
  }

  function hydrateSeoMeta() {
    const siteUrl = resolveSiteUrl();
    const canonical = $("[data-canonical]");
    if (canonical) canonical.href = `${siteUrl}/`;

    setMeta('[data-og-title]', content.meta.title);
    setMeta('[data-og-description]', content.meta.description);
    setMeta('[data-og-url]', `${siteUrl}/`);

    const ogImage = `${siteUrl}/${content.assets.logo.replace(/^\//, "")}`;
    setMeta('meta[property="og:image"]', ogImage);
  }

  function setMeta(selector, value) {
    const node = $(selector);
    if (node && value) node.setAttribute("content", value);
  }

  function hydrateStaticContent() {
    document.title = content.meta.title;
    const description = $('meta[name="description"]');
    if (description) description.content = content.meta.description;

    hydrateSeoMeta();

    $$("[data-logo]").forEach((image) => {
      image.src = content.assets.logo;
    });
    $$("[data-logo-white]").forEach((image) => {
      image.src = content.assets.logoWhite;
    });
    setText('[data-content="hero-title"]', content.hero.title);
    setText('[data-content="hero-body"]', content.hero.body);
    setText('[data-content="hero-scroll-hint"]', content.hero.scrollHint);
    setText('[data-content="story-expertise-label"]', content.hero.acts?.expertiseLabel);
    setText('[data-content="story-stats-label"]', content.hero.acts?.statsLabel);
    setText('[data-content="story-bridge"]', content.hero.acts?.bridge);
    setText('[data-content="story-solutions-label"]', content.hero.acts?.solutionsLabel);
    setText('[data-content="customers-eyebrow"]', content.customers.eyebrow);
    setText('[data-content="customers-title"]', content.customers.title);
    setText('[data-content="blog-eyebrow"]', content.blogs?.eyebrow);
    setText('[data-content="blog-title"]', content.blogs?.title);
    setText('[data-content="blog-body"]', content.blogs?.body);
    setText('[data-content="related-sites-eyebrow"]', content.footer.relatedSites?.eyebrow);
    setText('[data-content="related-sites-title"]', content.footer.relatedSites?.title);
    setText('[data-content="podcast-eyebrow"]', content.podcast.eyebrow);
    setText('[data-content="podcast-title"]', content.podcast.title);
    setText('[data-content="podcast-body"]', content.podcast.body);
    setText(
      '[data-content="podcast-all"]',
      `${ui().podcastAllPrefix || ""}${content.podcast.allEpisodes}`,
    );
    setText('[data-content="media-eyebrow"]', content.media.eyebrow);
    setText('[data-content="media-title"]', content.media.title);
    setText('[data-content="media-body"]', content.media.body);
    setText('[data-content="footer-body"]', content.footer.body);
    setText('[data-content="footer-title"]', content.footer.title);
    setText('[data-content="copyright"]', content.footer.copyright);
    setText('[data-content="contact-success"]', content.contact?.successMessage);
    setText('[data-content="contact-phone"] .desktop-only', content.cta.contact);

    setLink('[data-content="contact-phone"]', "#contact");
    setLink('[data-content="podcast-all"]', content.podcast.allEpisodesUrl);

    hydrateUiStrings();
  }

  function renderNav() {
    const desktopNav = $("[data-nav-links]");
    const mobileNav = $("[data-mobile-nav]");
    const links = content.nav
      .map((item) => `<a href="#${item.target}" data-nav-item>${item.label}</a>`)
      .join("");

    desktopNav.innerHTML = links;
    mobileNav.innerHTML = links;
  }

  // Scroll-driven storytelling hero: scrubs a WebP frame sequence on a canvas
  // inside a pinned (sticky) section, Apple-style. The site's own content
  // (expertise, stats, solutions) materializes as HUD overlays anchored to the
  // video's narrative beats, and the fixed header gives way to a labeled
  // progress rail for the duration of the story.
  const STORY_BEATS = {
    title: { in: [0, 0], out: [0.055, 0.09] },
    expertise: { in: [0.1, 0.13], out: [0.285, 0.315] },
    stats: { in: [0.33, 0.36], out: [0.47, 0.5] },
    bridge: { in: [0.505, 0.53], out: [0.55, 0.575] },
    solutions: { in: [0.585, 0.615], out: [0.835, 0.865] },
    closing: { in: [0.885, 0.92], out: [2, 3] },
  };
  const STORY_ANCHORS = [
    { key: "title", progress: 0 },
    { key: "expertise", progress: 0.115 },
    { key: "stats", progress: 0.345 },
    { key: "solutions", progress: 0.61 },
    { key: "closing", progress: 0.93 },
  ];
  const STORY_CHIP_START = 0.135;
  const STORY_CHIP_STEP = 0.036;

  let scrollToStoryAnchor = null;

  function initStoryHero() {
    const section = $(".story-hero");
    const sticky = $("[data-story-sticky]");
    const canvas = $("[data-story-canvas]");
    const poster = $("[data-story-poster]");
    const stage = $("[data-story-stage]");
    const progressRail = $("[data-story-progress]");
    const fadeOverlay = $("[data-story-fade]");
    const hint = $("[data-story-hint]");
    const siteHeader = $(".site-header");
    const config = content.assets.storyFrames;
    if (!section || !sticky || !canvas || !stage || !config) return;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const formatNumber = (value) =>
      value.toLocaleString(locale === "he" ? "he-IL" : "en-US");

    const actNodes = {};
    $$("[data-story-act]", stage).forEach((node) => {
      actNodes[node.dataset.storyAct] = node;
    });

    // --- Build the HUD overlays from the site's existing content ---
    const chipsRoot = $("[data-story-expertise]");
    if (chipsRoot) {
      const checkIcon = content.assets.icons.expertise;
      chipsRoot.innerHTML = (content.expertise || [])
        .map(
          (item) => `
            <article class="story-chip">
              <img src="${checkIcon}" alt="" aria-hidden="true" loading="lazy" />
              <div class="story-chip-copy">
                <h3>${item.title}</h3>
                <p>${item.body}</p>
              </div>
            </article>
          `,
        )
        .join("");
    }
    const chipNodes = $$(".story-chip", stage);

    const statsRoot = $("[data-story-stats]");
    if (statsRoot) {
      statsRoot.innerHTML = (content.stats || [])
        .map(
          (item) => `
            <article class="story-stat">
              <strong class="story-stat-value">
                <span data-story-number data-target="${item.value}">0</span>
                <span class="story-stat-suffix">${item.suffix || ""}</span>
              </strong>
              <h3>${item.title}</h3>
              <p>${item.body}</p>
            </article>
          `,
        )
        .join("");
    }
    const statNumbers = $$("[data-story-number]", stage);

    const solutionsRoot = $("[data-story-solutions]");
    if (solutionsRoot) {
      const solutions = content.solutions || [];
      const total = pad(solutions.length);
      solutionsRoot.innerHTML = solutions
        .map(
          (item, index) => `
            <article class="story-solution" data-story-solution>
              <p class="story-solution-index">${pad(index + 1)}<span> / ${total}</span></p>
              <h3>${item.title}</h3>
              <div class="story-solution-tags">
                ${item.bullets.map((bullet) => `<span>${bullet}</span>`).join("")}
              </div>
              <p class="story-solution-body">${item.body}</p>
            </article>
          `,
        )
        .join("");
    }
    const solutionNodes = $$("[data-story-solution]", stage);

    const closing = content.hero.acts?.closing || {};
    setText('[data-content="story-closing-eyebrow"]', closing.eyebrow);
    setText('[data-content="story-closing-title"]', closing.title);
    setText('[data-content="story-closing-body"]', closing.body);
    setText('[data-content="story-closing-cta"]', closing.cta);

    const reducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      new URLSearchParams(window.location.search).has("reduced");

    const mqMobile = window.matchMedia("(max-width: 900px)");
    const posterFor = () => (mqMobile.matches ? config.posterMobile : config.posterDesktop);
    if (poster && posterFor()) poster.style.backgroundImage = `url("${posterFor()}")`;

    if (reducedMotion || !canvas.getContext) {
      section.classList.add("story-hero--static");
      chipNodes.forEach((chip) => chip.classList.add("is-on"));
      statNumbers.forEach((node) => {
        node.textContent = formatNumber(parseInt(node.dataset.target, 10) || 0);
      });
      scrollToStoryAnchor = (key) => {
        const node = actNodes[key];
        if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
      };
      return;
    }

    const ctx = canvas.getContext("2d");
    const frameCount = config.count;
    const frames = new Array(frameCount).fill(null);
    const requested = new Set();
    let frameTemplate = mqMobile.matches ? config.mobilePath : config.desktopPath;
    let loadGeneration = 0;
    let firstFrameDrawn = false;

    const frameSrc = (index) =>
      frameTemplate.replace("{index}", String(index).padStart(3, "0"));

    function loadFrame(index, generation) {
      if (frames[index] || requested.has(index)) return Promise.resolve();
      requested.add(index);
      return new Promise((resolve) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          if (generation === loadGeneration) {
            frames[index] = image;
            if (!firstFrameDrawn) scheduleTick();
          }
          resolve();
        };
        image.onerror = () => resolve();
        image.src = frameSrc(index);
      });
    }

    async function loadFramesProgressively() {
      const generation = loadGeneration;
      for (const stride of [8, 4, 2, 1]) {
        const batch = [];
        for (let i = 0; i < frameCount; i += stride) {
          batch.push(loadFrame(i, generation));
        }
        await Promise.all(batch);
        if (generation !== loadGeneration) return;
        scheduleTick();
      }
    }

    function nearestLoadedFrame(index) {
      const bounded = clamp(Math.round(index), 0, frameCount - 1);
      if (frames[bounded]) return frames[bounded];
      for (let distance = 1; distance < frameCount; distance += 1) {
        const before = frames[bounded - distance];
        if (before) return before;
        const after = frames[bounded + distance];
        if (after) return after;
      }
      return null;
    }

    let canvasWidth = 0;
    let canvasHeight = 0;

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(sticky.clientWidth * dpr);
      const height = Math.round(sticky.clientHeight * dpr);
      if (width === canvasWidth && height === canvasHeight) return false;
      canvasWidth = canvas.width = width;
      canvasHeight = canvas.height = height;
      return true;
    }

    function drawFrame(frameIndex) {
      const image = nearestLoadedFrame(frameIndex);
      if (!image || !canvasWidth || !canvasHeight) return;
      const iw = image.naturalWidth;
      const ih = image.naturalHeight;
      const scale = Math.max(canvasWidth / iw, canvasHeight / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(image, (canvasWidth - dw) / 2, (canvasHeight - dh) / 2, dw, dh);
      if (!firstFrameDrawn) {
        firstFrameDrawn = true;
        section.classList.add("story-hero--ready");
      }
    }

    function sectionProgress() {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return 0;
      return clamp(-rect.top / total, 0, 1);
    }

    function scrollToProgress(progress) {
      const total = section.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: Math.round(section.offsetTop + progress * total),
        behavior: "smooth",
      });
    }

    const railLabels = content.hero.rail || [];
    const railStops = [];
    let railFill = null;
    if (progressRail) {
      const track = document.createElement("span");
      track.className = "story-rail-track";
      track.setAttribute("aria-hidden", "true");
      railFill = document.createElement("span");
      railFill.className = "story-rail-fill";
      track.append(railFill);
      progressRail.append(track);

      STORY_ANCHORS.forEach((anchor, index) => {
        const stop = document.createElement("button");
        stop.type = "button";
        stop.className = "story-rail-stop";
        stop.innerHTML = `
          <span class="story-rail-label">${railLabels[index] || ""}</span>
          <span class="story-rail-dot" aria-hidden="true"></span>
        `;
        stop.addEventListener("click", () => scrollToProgress(anchor.progress));
        progressRail.append(stop);
        railStops.push(stop);
      });
    }

    scrollToStoryAnchor = (key) => {
      const anchor = STORY_ANCHORS.find((item) => item.key === key);
      if (anchor) scrollToProgress(anchor.progress);
    };

    function actOpacity(progress, beat) {
      const [inStart, inEnd] = beat.in;
      const [outStart, outEnd] = beat.out;
      const fadeIn =
        inEnd <= inStart ? 1 : clamp((progress - inStart) / (inEnd - inStart), 0, 1);
      const fadeOut = clamp((outEnd - progress) / (outEnd - outStart), 0, 1);
      return Math.min(fadeIn, fadeOut);
    }

    function updateOverlays(progress) {
      Object.entries(STORY_BEATS).forEach(([key, beat]) => {
        const node = actNodes[key];
        if (!node) return;
        const opacity = actOpacity(progress, beat);
        node.style.opacity = opacity.toFixed(3);
        node.style.transform = `translateY(${((1 - opacity) * 22).toFixed(1)}px)`;
        node.classList.toggle("is-active", opacity > 0.5);
      });

      chipNodes.forEach((chip, index) => {
        chip.classList.toggle(
          "is-on",
          progress >= STORY_CHIP_START + index * STORY_CHIP_STEP,
        );
      });

      statNumbers.forEach((node, index) => {
        const target = parseInt(node.dataset.target, 10) || 0;
        const local = clamp((progress - (0.355 + index * 0.015)) / 0.075, 0, 1);
        node.textContent = formatNumber(Math.round(easeOut(local) * target));
      });

      if (solutionNodes.length) {
        const start = STORY_BEATS.solutions.in[0];
        const end = STORY_BEATS.solutions.out[1];
        const span = (end - start) / solutionNodes.length;
        const ramp = 0.012;
        solutionNodes.forEach((node, index) => {
          const from = start + index * span;
          const to = from + span;
          const fadeIn = index === 0 ? 1 : clamp((progress - from) / ramp, 0, 1);
          const fadeOut =
            index === solutionNodes.length - 1
              ? 1
              : clamp((to - progress) / ramp, 0, 1);
          const opacity = Math.min(fadeIn, fadeOut);
          node.style.opacity = opacity.toFixed(3);
          node.classList.toggle("is-active", opacity > 0.5);
        });
      }

      let activeStop = 0;
      STORY_ANCHORS.forEach((anchor, index) => {
        if (progress >= anchor.progress - 0.02) activeStop = index;
      });
      railStops.forEach((stop, index) => {
        stop.classList.toggle("is-active", index === activeStop);
        stop.classList.toggle("is-passed", index < activeStop);
      });

      if (railFill && STORY_ANCHORS.length > 1) {
        // Map progress onto the rail's evenly spaced stops so the fill line
        // always meets each dot exactly when its act begins.
        let ratio = 1;
        for (let i = 0; i < STORY_ANCHORS.length - 1; i += 1) {
          const from = STORY_ANCHORS[i].progress;
          const to = STORY_ANCHORS[i + 1].progress;
          if (progress <= to) {
            ratio = (i + clamp((progress - from) / (to - from), 0, 1)) /
              (STORY_ANCHORS.length - 1);
            break;
          }
        }
        railFill.style.height = `${(ratio * 100).toFixed(1)}%`;
      }

      if (siteHeader) {
        siteHeader.classList.toggle(
          "is-story-hidden",
          progress > 0.015 && progress < 0.96,
        );
      }
      if (fadeOverlay) {
        fadeOverlay.style.opacity = clamp((progress - 0.95) / 0.05, 0, 1).toFixed(3);
      }
      if (hint) hint.classList.toggle("is-hidden", progress > 0.02);
    }

    let targetProgress = 0;
    let currentFrame = -1;
    let rafId = null;

    function tick() {
      rafId = null;
      targetProgress = sectionProgress();
      const targetFrame = targetProgress * (frameCount - 1);
      if (currentFrame < 0) currentFrame = targetFrame;
      const delta = targetFrame - currentFrame;
      if (Math.abs(delta) < 0.35) {
        currentFrame = targetFrame;
      } else {
        currentFrame += delta * 0.22;
      }
      drawFrame(currentFrame);
      updateOverlays(targetProgress);
      if (Math.abs(targetFrame - currentFrame) > 0.01) scheduleTick();
    }

    function scheduleTick() {
      if (rafId !== null) return;
      // rAF never fires while the page is hidden; fall back to a timer so the
      // first frame is ready when the tab becomes visible.
      rafId = document.hidden
        ? window.setTimeout(tick, 66)
        : window.requestAnimationFrame(tick);
    }

    function onScroll() {
      scheduleTick();
    }

    let resizeTimer = null;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (resizeCanvas()) {
          currentFrame = -1;
          onScroll();
        }
      }, 120);
    }

    function setFrameSet() {
      const nextTemplate = mqMobile.matches ? config.mobilePath : config.desktopPath;
      if (nextTemplate === frameTemplate) return;
      frameTemplate = nextTemplate;
      loadGeneration += 1;
      frames.fill(null);
      requested.clear();
      if (poster && posterFor()) poster.style.backgroundImage = `url("${posterFor()}")`;
      loadFramesProgressively();
    }

    mqMobile.addEventListener("change", setFrameSet);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    resizeCanvas();
    targetProgress = sectionProgress();
    updateOverlays(targetProgress);
    loadFramesProgressively();
  }

  function renderCustomers() {
    const list = $("[data-customers-list]");
    if (!list || !content.customers?.images?.length) return;

    list.innerHTML = content.customers.images
      .map(
        (src) => `
          <article class="customer-card" data-animate>
            <img src="${src}" alt="" loading="lazy" />
          </article>
        `,
      )
      .join("");
  }

  function renderBlogs() {
    const list = $("[data-blog-list]");
    if (!list || !content.blogs?.items?.length) return;

    const readMore = ui().readBlogPost || "Read article →";

    list.innerHTML = content.blogs.items
      .map(
        (item) => `
          <a class="blog-card" href="${blogPostUrl(item.slug)}" data-animate>
            <span class="blog-card-media">
              <img src="${item.image}" alt="" loading="lazy" />
            </span>
            <span class="blog-card-content">
              <span class="blog-card-type">${item.type === "external" ? (locale === "he" ? "אתר חיצוני" : "External") : (locale === "he" ? "מאמר" : "Article")}</span>
              <span class="blog-card-title">${item.title}</span>
              <span class="blog-card-excerpt">${item.excerpt}</span>
              <span class="blog-card-link">${readMore}</span>
            </span>
          </a>
        `,
      )
      .join("");
  }

  function renderRelatedSites() {
    const list = $("[data-related-sites]");
    const sites = content.footer.relatedSites?.items;
    if (!list || !sites?.length) return;

    const visitLabel = ui().visitSite || "Visit site →";

    list.innerHTML = sites
      .map(
        (site) => `
          <a class="related-site-card" href="${site.url}" target="_blank" rel="noreferrer">
            <span class="related-site-media">
              <img src="${site.image}" alt="" loading="lazy" />
            </span>
            <span class="related-site-copy">
              <span class="related-site-name">${site.name}</span>
              <span class="related-site-description">${site.description}</span>
              <span class="related-site-link">${visitLabel}</span>
            </span>
          </a>
        `,
      )
      .join("");
  }

  function renderPodcast() {
    const list = $("[data-podcast-list]");
    const [featured, ...sideItems] = content.podcast.items;
    const durationBadge = (length) =>
      length ? `<span class="video-duration">${length}</span>` : "";

    const renderCard = (item, className = "") => `
          <a class="video-card ${className}" href="${item.url}" target="_blank" rel="noreferrer" data-animate>
            <span class="video-thumb">
              <img src="${item.image}" alt="" loading="lazy" />
              <span class="play-button" aria-hidden="true">▶</span>
              ${durationBadge(item.length)}
            </span>
            <span class="video-content">
              <span class="video-info">${item.info}</span>
              <span class="video-title">${item.title}</span>
              <span class="video-body">${item.body}</span>
            </span>
          </a>
        `;

    list.innerHTML = `
      ${renderCard(featured, "video-card-featured")}
      <div class="video-side-list" aria-label="${ui().moreEpisodes || "More episodes"}">
        ${sideItems.map((item) => renderCard(item, "video-card-compact")).join("")}
      </div>
    `;
  }

  function renderMedia() {
    const list = $("[data-media-list]");
    const fullArticle = ui().fullArticle || "Read full article →";
    list.innerHTML = content.media.items
      .map(
        (item) => `
          <article class="media-card" style="--media-paper: url('${content.assets.mediaPaper}')" data-animate>
            <img class="media-logo" src="${item.logo}" alt="${item.source}" loading="lazy" />
            <h3>${item.title}</h3>
            <p>${item.body}</p>
            <a href="${item.url}">${fullArticle}</a>
          </article>
        `,
      )
      .join("");
  }

  function renderSocials() {
    const list = $("[data-social-links]");
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
      const isActive = buttonLocale === locale;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));

      if (buttonLocale === "he") {
        button.setAttribute("aria-label", ui().langHe || "Hebrew");
      } else if (buttonLocale === "en") {
        button.setAttribute("aria-label", ui().langEn || "English");
      }

      button.addEventListener("click", () => {
        if (buttonLocale === locale) return;
        localStorage.setItem(LOCALE_KEY, buttonLocale);
        window.location.reload();
      });
    });
  }

  function setupSplashScreen() {
    const splash = $("#splash");
    if (!splash) return;

    const storageKey = "pro-algorithm-splash-seen";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (sessionStorage.getItem(storageKey)) {
      splash.remove();
      return;
    }

    const logo = $("[data-splash-logo]");
    const icon = $("[data-splash-icon]");
    if (logo) {
      logo.src = content.assets.logoWhite;
      logo.alt = "Pro Algorithm";
    }
    if (icon) {
      icon.src = content.assets.logoIcon || content.assets.logoWhite;
      icon.alt = "Pro Algorithm";
    }

    splash.hidden = false;
    splash.setAttribute("aria-hidden", "false");
    document.body.classList.add("splash-active");

    const revealDuration = reducedMotion ? 0 : 1350;
    const holdDuration = reducedMotion ? 250 : 650;
    const exitDuration = 520;

    window.setTimeout(() => {
      splash.classList.add("is-exiting");
      splash.setAttribute("aria-hidden", "true");
      document.body.classList.remove("splash-active");
      sessionStorage.setItem(storageKey, "1");

      window.setTimeout(() => {
        splash.remove();
      }, exitDuration);
    }, revealDuration + holdDuration);
  }

  function setupSmoothNav() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;

        if (targetId.startsWith("#story-") && typeof scrollToStoryAnchor === "function") {
          event.preventDefault();
          scrollToStoryAnchor(targetId.slice("#story-".length));
          closeMobileMenu();
          return;
        }

        const target = $(targetId);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeMobileMenu();
      });
    });
  }

  function scrollToHashTarget() {
    const hash = window.location.hash;
    if (!hash || hash === "#") return;

    const target = $(hash);
    if (!target) return;

    const splashVisible = $("#splash") && !sessionStorage.getItem("pro-algorithm-splash-seen");
    const delay = splashVisible ? 2200 : 120;

    window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, delay);
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

  function scrollByCard(track, direction) {
    if (!track) return;
    const firstCard = track.firstElementChild;
    const distance = firstCard ? firstCard.getBoundingClientRect().width + 24 : track.clientWidth * 0.85;
    track.scrollBy({ left: distance * direction, behavior: "smooth" });
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
          if (entry.target.dataset.animate === "scroll") observer.unobserve(entry.target);
        });
      },
      { threshold: 0.22, rootMargin: "0px 0px -8% 0px" },
    );

    animated.forEach((node) => observer.observe(node));
  }

  function showContactToast() {
    const toast = $("#contactToast");
    if (!toast) return;

    toast.hidden = false;
    requestAnimationFrame(() => {
      toast.classList.add("is-visible");
    });

    window.clearTimeout(showContactToast._timer);
    showContactToast._timer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => {
        toast.hidden = true;
      }, 300);
    }, 2000);
  }

  function setupCarousels() {
    const tracks = {
      podcast: $("[data-podcast-list]"),
      media: $("[data-media-list]"),
      blog: $("[data-blog-list]"),
    };

    $$("[data-scroll-prev]").forEach((button) => {
      button.addEventListener("click", () => scrollByCard(tracks[button.dataset.scrollPrev], -1));
    });

    $$("[data-scroll-next]").forEach((button) => {
      button.addEventListener("click", () => scrollByCard(tracks[button.dataset.scrollNext], 1));
    });
  }

  // Mouse drag-to-scroll for the horizontal carousels (touch already scrolls
  // natively). While dragging, snap and smooth-scroll are suspended so the
  // track follows the pointer 1:1; a post-drag click on a card is swallowed.
  function setupDragScroll() {
    $$(".carousel, .media-layout, .blog-layout").forEach((track) => {
      let pointerId = null;
      let startX = 0;
      let startScroll = 0;
      let dragged = false;

      track.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        pointerId = event.pointerId;
        startX = event.clientX;
        startScroll = track.scrollLeft;
        dragged = false;
      });

      track.addEventListener("pointermove", (event) => {
        if (pointerId === null || event.pointerId !== pointerId) return;
        const deltaX = event.clientX - startX;
        if (!dragged && Math.abs(deltaX) > 6) {
          dragged = true;
          track.classList.add("is-dragging");
          try {
            track.setPointerCapture(pointerId);
          } catch {
            // Pointer may already be released; dragging still works without capture.
          }
        }
        if (dragged) track.scrollLeft = startScroll - deltaX;
      });

      const release = (event) => {
        if (pointerId === null || event.pointerId !== pointerId) return;
        if (track.hasPointerCapture && track.hasPointerCapture(pointerId)) {
          track.releasePointerCapture(pointerId);
        }
        pointerId = null;
        track.classList.remove("is-dragging");
        if (dragged) {
          // Keep the flag through the click that follows pointerup, then clear.
          window.setTimeout(() => {
            dragged = false;
          }, 0);
        }
      };
      track.addEventListener("pointerup", release);
      track.addEventListener("pointercancel", release);

      track.addEventListener(
        "click",
        (event) => {
          if (dragged) {
            event.preventDefault();
            event.stopPropagation();
          }
        },
        true,
      );

      track.addEventListener("dragstart", (event) => event.preventDefault());
    });
  }

  function setupKeyboardScroll() {
    $$(".carousel, .media-layout, .blog-layout").forEach((track) => {
      track.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const direction = event.key === "ArrowLeft" ? 1 : -1;
        scrollByCard(track, direction);
      });
    });

  }

  function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = form.querySelector('button[type="submit"]');
      const originalHtml = button.innerHTML;
      const strings = ui();

      button.textContent = strings.formSending;
      button.disabled = true;

      const payload = {
        name: form.querySelector('[name="name"]').value.trim(),
        phone: form.querySelector('[name="phone"]').value.trim(),
        email: form.querySelector('[name="email"]').value.trim(),
      };

      try {
        const response = await fetch(CONTACT_API.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || strings.formError);
        }

        button.textContent = strings.formSent;
        button.classList.add("is-success");
        showContactToast();

        window.setTimeout(() => {
          form.reset();
          button.innerHTML = originalHtml;
          button.disabled = false;
          button.classList.remove("is-success");
        }, 2000);
      } catch (error) {
        button.innerHTML = originalHtml;
        button.disabled = false;
        button.classList.remove("is-success");
        alert(error.message);
      }
    });
  }

  function init() {
    applyDocumentLocale();
    setupSplashScreen();
    hydrateStaticContent();
    renderNav();
    initStoryHero();
    renderCustomers();
    renderBlogs();
    renderRelatedSites();
    renderPodcast();
    renderMedia();
    renderSocials();
    setupLanguageSwitcher();
    setupMobileMenu();
    setupSmoothNav();
    scrollToHashTarget();
    setupRevealAnimations();
    setupCarousels();
    setupDragScroll();
    setupKeyboardScroll();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
