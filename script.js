const revealItems = document.querySelectorAll(
  ".reveal, .service-card, .kids-care-grid article, .process-grid article, .feature-grid article, .gallery-case, .review-card, .home-review-card, .doctor-card, .doctor-achievements article, .testimonial-grid article"
);

const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".nav");

if (siteHeader && menuToggle && primaryNav) {
  const setMenuState = (isOpen) => {
    siteHeader.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  };

  menuToggle.addEventListener("click", () => {
    setMenuState(!siteHeader.classList.contains("menu-open"));
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setMenuState(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (siteHeader.classList.contains("menu-open") && !siteHeader.contains(event.target)) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const navLinks = Array.from(document.querySelectorAll(".nav a[href^='#']"));
const navTargets = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && navTargets.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    { rootMargin: "-25% 0px -55% 0px", threshold: [0.1, 0.4, 0.7] }
  );

  navTargets.forEach((target) => navObserver.observe(target));
}

const aboutLightbox = document.querySelector("#about-lightbox");

if (aboutLightbox) {
  const lightboxImage = aboutLightbox.querySelector("img");
  const lightboxCaption = aboutLightbox.querySelector("figcaption");
  const lightboxClose = aboutLightbox.querySelector(".about-lightbox-close");
  let lightboxTrigger = null;

  const closeLightbox = () => {
    aboutLightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    if (lightboxTrigger) {
      lightboxTrigger.focus();
    }
  };

  document.querySelectorAll("[data-lightbox-src]").forEach((button) => {
    button.addEventListener("click", () => {
      lightboxTrigger = button;
      lightboxImage.src = button.dataset.lightboxSrc;
      lightboxImage.alt = button.dataset.lightboxAlt || "";
      lightboxCaption.textContent = button.dataset.lightboxAlt || "";
      aboutLightbox.hidden = false;
      document.body.classList.add("lightbox-open");
      lightboxClose.focus();
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);

  aboutLightbox.addEventListener("click", (event) => {
    if (event.target === aboutLightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !aboutLightbox.hidden) {
      closeLightbox();
    }
  });
}
