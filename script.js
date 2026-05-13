(function () {
  const content = window.PRO_ALGORITHM_CONTENT;
  const CONTACT_API = {
    url: "https://fleet360-server-1069352823739.me-west1.run.app/contact/buildings",
    // url: "http://127.0.0.1:8181/contact/buildings",
  };

  if (!content) {
    throw new Error("Missing PRO_ALGORITHM_CONTENT. Load content.js before script.js.");
  }

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const pad = (number) => String(number).padStart(2, "0");

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

  function hydrateStaticContent() {
    document.title = content.meta.title;
    const description = $('meta[name="description"]');
    if (description) description.content = content.meta.description;

    $$("[data-logo]").forEach((image) => {
      image.src = content.assets.logo;
    });
    $$("[data-logo-white]").forEach((image) => {
      image.src = content.assets.logoWhite;
    });
    setText('[data-content="hero-title"]', content.hero.title);
    setText('[data-content="hero-body"]', content.hero.body);
    setText('[data-content="solutions-eyebrow"]', content.solutionsIntro.eyebrow);
    setText('[data-content="solutions-title"]', content.solutionsIntro.title);
    setText('[data-content="podcast-eyebrow"]', content.podcast.eyebrow);
    setText('[data-content="podcast-title"]', content.podcast.title);
    setText('[data-content="podcast-body"]', content.podcast.body);
    setText('[data-content="podcast-all"]', `← ${content.podcast.allEpisodes}`);
    setText('[data-content="media-eyebrow"]', content.media.eyebrow);
    setText('[data-content="media-title"]', content.media.title);
    setText('[data-content="media-body"]', content.media.body);
    setText('[data-content="footer-body"]', content.footer.body);
    setText('[data-content="footer-title"]', content.footer.title);
    setText('[data-content="copyright"]', content.footer.copyright);
    setText('[data-content="contact-phone"] .desktop-only', content.cta.contact);

    setLink('[data-content="contact-phone"]', "#contact");
    setLink('[data-content="podcast-all"]', content.podcast.allEpisodesUrl);
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

  function renderHeroMedia() {
    const heroMedia = $("[data-hero-media]");
    if (!heroMedia || !content.assets.heroVideo) return;

    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.poster = content.assets.heroFallback;
    video.setAttribute("aria-hidden", "true");

    const source = document.createElement("source");
    source.src = content.assets.heroVideo;
    source.type = "video/mp4";
    video.append(source);
    heroMedia.prepend(video);
  }

  function renderProjectsMedia() {
    const projectsMedia = $("[data-projects-media]");
    if (!projectsMedia || !content.assets.projectsVideo) return;

    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("aria-hidden", "true");

    const source = document.createElement("source");
    source.src = content.assets.projectsVideo;
    source.type = "video/mp4";
    video.append(source);
    projectsMedia.prepend(video);
  }

  function renderExpertise() {
    const list = $("[data-expertise-list]");
    list.innerHTML = content.expertise
      .map(
        (item) => `
          <article class="expertise-card" data-animate>
            <h1>🗹</h1>
            <h3>${item.title}</h3>
            <p>${item.body}</p>
          </article>
        `,
      )
      .join("");
  }

  function renderSolutions() {
    const track = $("[data-solutions-track]");
    track.innerHTML = content.solutions
      .map(
        (item, index) => `
          <article class="solution-slide" data-solution-slide aria-label="${pad(index + 1)} מתוך ${pad(content.solutions.length)}">
            <div class="solution-visual" aria-hidden="true">
              <img src="${item.image}" alt="" loading="lazy" />
            </div>
            <div class="solution-content">
              <h3>${item.title}</h3>
              <div class="solution-tags">
                ${item.bullets.map((bullet) => `<span class="solution-label">${bullet}</span>`).join("")}
              </div>
              <p>${item.body}</p>
            </div>
          </article>
        `,
      )
      .join("");

    $("[data-solution-total]").textContent = pad(content.solutions.length);
  }

  function renderStats() {
    const list = $("[data-stats-list]");
    list.innerHTML = content.stats
      .map(
        (item) => `
          <article class="stat-card" data-animate>
            <img class="stat-icon" src="${item.icon}" alt="" loading="lazy" />
            <strong class="stat-value">
              <span class="stat-number" data-target="${item.value}">0</span>
              <span class="stat-suffix">${item.suffix ? ` ${item.suffix}` : ""}</span>
            </strong>
            <h3 class="stat-title">${item.title}</h3>
            <p class="stat-label">${item.body}</p>
          </article>
        `,
      )
      .join("");
  }

  function renderPodcast() {
    const list = $("[data-podcast-list]");
    const [featured, ...sideItems] = content.podcast.items;
    const renderCard = (item, className = "") => `
          <a class="video-card ${className}" href="${item.url}" target="_blank" rel="noreferrer" data-animate>
            <span class="video-thumb">
              <img src="${item.image}" alt="" loading="lazy" />
              <span class="play-button" aria-hidden="true">▶</span>
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
      <div class="video-side-list" aria-label="פרקים נוספים">
        ${sideItems.map((item) => renderCard(item, "video-card-compact")).join("")}
      </div>
    `;
  }

  function renderMedia() {
    const list = $("[data-media-list]");
    list.innerHTML = content.media.items
      .map(
        (item) => `
          <article class="media-card" style="--media-paper: url('${content.assets.mediaPaper}')" data-animate>
            <img class="media-logo" src="${item.logo}" alt="${item.source}" loading="lazy" />
            <h3>${item.title}</h3>
            <p>${item.body}</p>
            <a href="${item.url}">לכתבה המלאה ←</a>
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

  function setupSmoothNav() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const target = $(targetId);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeMobileMenu();
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

  function scrollByCard(track, direction) {
    if (!track) return;
    const firstCard = track.firstElementChild;
    const distance = firstCard ? firstCard.getBoundingClientRect().width + 24 : track.clientWidth * 0.85;
    track.scrollBy({ left: distance * direction, behavior: "smooth" });
  }

  function setupSolutionSlider() {
    const track = $("[data-solutions-track]");
    const slides = $$("[data-solution-slide]", track);
    const current = $("[data-solution-current]");
    if (!track || !slides.length) return;

    let activeIndex = 0;

    const setActive = (index) => {
      activeIndex = Math.max(0, Math.min(slides.length - 1, index));
      current.textContent = activeIndex + 1;
    };

    const updateFromScroll = () => {
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.top + trackRect.height / 2;
      const nearest = slides.reduce(
        (best, slide, index) => {
          const rect = slide.getBoundingClientRect();
          const distance = Math.abs(rect.top + rect.height / 2 - center);
          return distance < best.distance ? { index, distance } : best;
        },
        { index: 0, distance: Infinity },
      );
      setActive(nearest.index);
    };

    let raf = 0;
    track.addEventListener(
      "scroll",
      () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(updateFromScroll);
      },
      { passive: true },
    );

    setActive(0);
  }

  function setupCarousels() {
    const tracks = {
      podcast: $("[data-podcast-list]"),
      media: $("[data-media-list]"),
    };

    $$("[data-scroll-prev]").forEach((button) => {
      button.addEventListener("click", () => scrollByCard(tracks[button.dataset.scrollPrev], -1));
    });

    $$("[data-scroll-next]").forEach((button) => {
      button.addEventListener("click", () => scrollByCard(tracks[button.dataset.scrollNext], 1));
    });
  }

  function setupKeyboardScroll() {
    $$(".carousel, .media-layout").forEach((track) => {
      track.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const direction = event.key === "ArrowLeft" ? 1 : -1;
        scrollByCard(track, direction);
      });
    });

    const solutionTrack = $("[data-solutions-track]");
    if (solutionTrack) {
      solutionTrack.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        solutionTrack.scrollBy({ top: solutionTrack.clientHeight * direction, behavior: "smooth" });
      });
    }
  }

  function initCounters() {
    const counters = $$(".stat-number");
    const statsSection = $(".stats");
    if (!counters.length || !statsSection) return;

    let hasAnimated = false;

    const animateCounter = (counter) => {
      const target = parseInt(counter.dataset.target, 10) || 0;
      const duration = 2000;
      const startTime = performance.now();

      const easeOutExpo = (progress) => (progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress));

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(easeOutExpo(progress) * target);

        counter.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toLocaleString();
        }
      };

      requestAnimationFrame(updateCounter);
    };

    const animateCounters = () => {
      if (hasAnimated) return;

      const rect = statsSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight * 0.85 && rect.bottom > 0) {
        hasAnimated = true;
        counters.forEach(animateCounter);
        window.removeEventListener("scroll", animateCounters);
      }
    };

    window.addEventListener("scroll", animateCounters, { passive: true });
    animateCounters();
  }

  function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = form.querySelector('button[type="submit"]');
      const originalHtml = button.innerHTML;
      const isEnglish = document.documentElement.lang === "en";

      button.textContent = isEnglish ? "Sending..." : "שולח...";
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
          const fallback = isEnglish ? "Something went wrong" : "משהו השתבש";
          throw new Error(data?.message || fallback);
        }

        button.textContent = isEnglish ? "Sent!" : "נשלח!";
        button.classList.add("is-success");

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
    hydrateStaticContent();
    renderNav();
    renderHeroMedia();
    renderProjectsMedia();
    renderExpertise();
    renderSolutions();
    renderStats();
    initCounters();
    renderPodcast();
    renderMedia();
    renderSocials();
    setupMobileMenu();
    setupSmoothNav();
    setupRevealAnimations();
    setupSolutionSlider();
    setupCarousels();
    setupKeyboardScroll();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
