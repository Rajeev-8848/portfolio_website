const CONFIG = {
  typingRoles: [
    "Full Stack Developer",
    "Designer",
  ],
  typingSpeed: 90,       // ms per character while typing
  deletingSpeed: 45,     // ms per character while deleting
  holdDelay: 1800,       // ms to hold a completed word before deleting
  scrollOffset: 90,      // navbar height offset for smooth scroll / active link detection
  enableMagnetic: true,  // magnetic button effect (auto-disabled on touch)
  enableCursorGlow: true // mouse-follow glow (auto-disabled on touch)
};
const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const navbar = $("#navbar");
  const hamburger = $("#hamburger");
  const navLinks = $("#navLinks");
  const links = $$(".nav-link");
  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  hamburger.addEventListener("click", () => {
    const isActive = navLinks.classList.toggle("active");
    hamburger.classList.toggle("active", isActive);
    hamburger.setAttribute("aria-expanded", String(isActive));
    document.body.style.overflow = isActive ? "hidden" : "";
  });
  links.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (targetId.length <= 1) return;
      const target = $(targetId);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - CONFIG.scrollOffset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });
(function initActiveSection() {
  const sections = $$("main section[id]");
  const navLinks = $$(".nav-link");
  const setActive = (id) => {
    navLinks.forEach(link => {
      link.classList.toggle("active-link", link.dataset.section === id);
    });
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  }, { rootMargin: `-${CONFIG.scrollOffset}px 0px -60% 0px`, threshold: 0.1 });
  sections.forEach(section => observer.observe(section));
})();
(function initTypingEffect() {
  const el = $(".role-text");
  if (!el || prefersReducedMotion) {
    if (el) el.textContent = CONFIG.typingRoles[0];
    return;
  }
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  function tick() {
    const currentRole = CONFIG.typingRoles[roleIndex];
    if (!isDeleting) {
      charIndex++;
      el.textContent = currentRole.slice(0, charIndex);
      if (charIndex === currentRole.length) {
        isDeleting = true;
        setTimeout(tick, CONFIG.holdDelay);
        return;
      }
    } else {
      charIndex--;
      el.textContent = currentRole.slice(0, charIndex);
      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % CONFIG.typingRoles.length;
      }
    }
    setTimeout(tick, isDeleting ? CONFIG.deletingSpeed : CONFIG.typingSpeed);
  }
  tick();
})();
(function initScrollReveal() {
  const revealEls = $$(".reveal");
  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add("active"));
    return;
  }
  const groupedSelectors = [".projects-grid .reveal", ".skills-grid .reveal", ".achievements-grid .reveal"];
  groupedSelectors.forEach(selector => {
    $$(selector).forEach((el, i) => el.style.setProperty("--stagger", i));
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
  revealEls.forEach(el => observer.observe(el));
})();
/* =================================================================
   FALLBACK: Force-reveal any stuck elements after a timeout
   Protects against buggy in-app browser WebViews where
   IntersectionObserver may fail to fire correctly.
================================================================= */
(function initRevealFallback() {
  setTimeout(() => {
    $$(".reveal:not(.active)").forEach(el => el.classList.add("active"));
  }, 2500); // if not revealed within 2.5s, force show
})();
(function initStatCounters() {
  const counters = $$(".stat-number");
  if (!counters.length) return;
  const animateCount = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    if (prefersReducedMotion) {
      el.textContent = target + "+";
      return;
    }
    const duration = 1500;
    const startTime = performance.now();
    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target) + (progress === 1 ? "+" : "");
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
})();
(function initCursorGlow() {
  const glow = $("#cursorGlow");
  if (!glow || isTouchDevice || !CONFIG.enableCursorGlow) {
    if (glow) glow.style.display = "none";
    return;
  }
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  }, { passive: true });
  function animate() {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
(function initMagneticButtons() {
  if (isTouchDevice || !CONFIG.enableMagnetic || prefersReducedMotion) return;
  const magneticEls = $$(".magnetic");
  const strength = 0.35;
  magneticEls.forEach(el => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0, 0)";
    });
  });
})();
(function initRippleEffect() {
  $$(".btn").forEach(btn => {
    btn.addEventListener("click", function (e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.classList.add("ripple");
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
})();
(function initCardLighting() {
  if (isTouchDevice) return;
  $$(".project-card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });
  });
})();
(function initContactForm() {
  const form = $("#contactForm");
  const status = $("#formStatus");
  const submitBtn = $("#formSubmitBtn");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const requiredFields = $$("[required]", form);
    const isValid = requiredFields.every(field => field.value.trim() !== "");
    if (!isValid) {
      status.textContent = "Please fill in all fields before sending.";
      status.style.color = "#f87171";
      return;
    }
    submitBtn.disabled = true;
    status.style.color = "#22d3ee";
    status.textContent = "Sending message...";
    try {
      const response = await fetch(form.action, {
        method: form.method || "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (response.ok) {
        status.style.color = "#4ade80";
        status.textContent = "✓ Message sent successfully! I'll get back to you soon.";
        form.reset();
      } else {
        const data = await response.json().catch(() => null);
        const errorMsg = data?.errors?.map(err => err.message).join(", ");
        status.style.color = "#f87171";
        status.textContent = errorMsg || "Something went wrong. Please try again or email me directly.";
      }
    } catch (error) {
      status.style.color = "#f87171";
      status.textContent = "Network error. Please check your connection and try again.";
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
(function initBackToTop() {
  const btn = $("#backToTop");
  if (!btn) return;
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
})();
(function initFooterYear() {
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();