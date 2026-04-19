// ── AESTHETIC FEATURES CAROUSEL ──

(function () {
  if (window.innerWidth <= 768) return;

  gsap.registerPlugin(ScrollTrigger);

  const SLIDES = 3;
  const wrap = document.getElementById("featureWrap");
  if (!wrap) return;

  // Let GSAP control the pinning — no manual height needed
  const textSlides = gsap.utils.toArray(".feat-text-slide");
 const imgSlides = gsap.utils.toArray(".feat-img-slide");

function activateSlide(idx) {
  textSlides.forEach((el, i) => el.classList.toggle("active", i === idx));
  imgSlides.forEach((el, i) => el.classList.toggle("active", i === idx));
}

  ScrollTrigger.create({
    trigger: wrap,
    start: "top top",
    end: `+=${window.innerHeight * (SLIDES - 1)}`,
    pin: ".features-sticky",
    pinSpacing: true,
    anticipatePin: 1,
    onUpdate: (self) => {
      const idx = Math.min(SLIDES - 1, Math.floor(self.progress * SLIDES));
      activateSlide(idx);
    },
  });

  // Smooth dot + phone transition using GSAP tweens
  let currentSlide = 0;
  const observer = new MutationObserver(() => {
    textSlides.forEach((el, i) => {
      if (el.classList.contains("active") && i !== currentSlide) {
        currentSlide = i;
      }
    });
  });
  textSlides.forEach((el) =>
    observer.observe(el, {
      attributes: true,
      attributeFilter: ["class"],
    }),
  );

  ScrollTrigger.addEventListener("refreshInit", () => {
    if (window.innerWidth <= 768) {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    }
  });
})();

// ── SCREENS CAROUSEL ──

(function () {
  if (window.innerWidth <= 768) return;

  gsap.registerPlugin(ScrollTrigger);

  const wrap = document.getElementById("screensWrap");
  const rail = document.getElementById("screensRail");
  const cards = gsap.utils.toArray(".screen-card");
  const dots = gsap.utils.toArray(".screens-prog-dot");

  if (!wrap || !rail || !cards.length) return;

  const TOTAL = cards.length;
  let currentIdx = -1;

  function activateCard(idx) {
    if (idx === currentIdx) return;
    currentIdx = idx;

    cards.forEach((card, i) => {
      const isActive = i === idx;
      card.classList.toggle("highlight", isActive);
      card.classList.toggle("dim", !isActive);

      gsap.to(card, {
        scale: isActive ? 1.04 : 0.92,
        opacity: isActive ? 1 : 0.38,
        duration: 0.15,
        ease: "power3.out",
        overwrite: "auto",
      });
    });

    dots.forEach((dot, i) => dot.classList.toggle("active", i === idx));

    // Gently nudge the rail so the active card is roughly centered,
    // but clamp so cards never leave the viewport entirely.
    const railContainer = rail.parentElement;
    const containerWidth = railContainer.offsetWidth;
    const cardEl = cards[idx];
    const cardCenter = cardEl.offsetLeft + cardEl.offsetWidth / 2;
    const idealX = containerWidth / 2 - cardCenter;

    // Clamp: don't push rail past its natural left edge (0)
    // and don't push so far right that last cards disappear
    const railWidth = rail.scrollWidth;
    const minX = Math.min(0, containerWidth - railWidth - 24);
    const clampedX = Math.max(minX, Math.min(0, idealX));

    gsap.to(rail, {
      x: clampedX,
      duration: 0.35,
      ease: "power3.out",
      overwrite: "auto",
    });
  }

  // Init first card
  activateCard(0);

  ScrollTrigger.create({
    trigger: wrap,
    start: "top top",
    end: `+=${window.innerHeight * (TOTAL - 1)}`,
    pin: ".screens-sticky",
    pinSpacing: true,
    anticipatePin: 1,
    onUpdate: (self) => {
      const idx = Math.min(TOTAL - 1, Math.round(self.progress * (TOTAL - 1)));
      activateCard(idx);
    },
  });

  ScrollTrigger.addEventListener("refreshInit", () => {
    if (window.innerWidth <= 768) {
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === wrap)
        .forEach((st) => st.kill());
      gsap.set(rail, { x: 0 });
      cards.forEach((card) => {
        card.classList.remove("highlight", "dim");
        gsap.set(card, { scale: 1, opacity: 1 });
      });
    }
  });
})();


// ── INTIMACY PROJECT ──
(function () {
  const bgSlides  = document.querySelectorAll('.ip-bg-slide');
  const qSlides   = document.querySelectorAll('.ip-quote-slide');
  const dotsEl    = document.getElementById('ipDots');
  const prevBtn   = document.getElementById('ipPrev');
  const nextBtn   = document.getElementById('ipNext');
  const section   = document.getElementById('intimacySection');
  const total     = bgSlides.length;
  let current     = 0;
  let animating   = false;

  // Build dots
  for (let i = 0; i < total; i++) {
    const d = document.createElement('button');
    d.className = 'ip-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  }

  function getDots() { return dotsEl.querySelectorAll('.ip-dot'); }

  function goTo(idx) {
    if (animating || idx === current) return;
    animating = true;
    const dir = idx > current ? 1 : -1;
    const dots = getDots();

    dots[current].classList.remove('active');
    dots[idx].classList.add('active');

    // Background: crossfade with subtle scale
    gsap.to(bgSlides[current], {
      opacity: 0, scale: 1.06, duration: 1.2, ease: 'power2.inOut',
      onComplete: () => bgSlides[current].classList.remove('active')
    });
    gsap.fromTo(bgSlides[idx],
      { opacity: 0, scale: 1.08 },
      { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out',
        onStart: () => bgSlides[idx].classList.add('active') }
    );

    // Quote: slide out / in
    gsap.to(qSlides[current], {
      opacity: 0, y: dir * -18, duration: .45, ease: 'power2.in',
      onComplete: () => qSlides[current].classList.remove('active')
    });
    gsap.fromTo(qSlides[idx],
      { opacity: 0, y: dir * 18 },
      { opacity: 1, y: 0, duration: .6, ease: 'power2.out', delay: .3,
        onStart: () => qSlides[idx].classList.add('active'),
        onComplete: () => { animating = false; }
      }
    );

    current = idx;
  }

  prevBtn.addEventListener('click', () => goTo((current - 1 + total) % total));
  nextBtn.addEventListener('click', () => goTo((current + 1) % total));

  // Entrance animation (scroll-triggered if ScrollTrigger available, else on load)
  const entranceTl = gsap.timeline({
    scrollTrigger: window.ScrollTrigger ? {
      trigger: section, start: 'top 75%', once: true
    } : undefined
  });
  entranceTl
    .fromTo('.ip-left',  { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out' })
    .fromTo('.ip-right', { opacity: 0, x:  40 }, { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out' }, '-=0.8');

  // Autoplay — pause on hover
  let timer = setInterval(() => goTo((current + 1) % total), 5500);
  section.addEventListener('mouseenter', () => clearInterval(timer));
  section.addEventListener('mouseleave', () => {
    timer = setInterval(() => goTo((current + 1) % total), 5500);
  });
})();
// ── INTRO ──
window.addEventListener("load", () => {
  const t = document.getElementById("intro-text"),
    i = document.getElementById("intro");
  setTimeout(() => t.classList.add("show"), 300);
  setTimeout(() => i.classList.add("lift"), 1800);
  setTimeout(() => (i.style.display = "none"), 3200);
});

// ── NAV ──
// ── NAV: show only when scrolled past hero ──
const navEl = document.getElementById("nav");
const heroEl = document.getElementById("hero");

function updateNav() {
  const heroBottom = heroEl.getBoundingClientRect().bottom;
  // show nav when hero bottom is at or above viewport

  if (heroBottom <= 800) {
    navEl.classList.add("nav-visible");
  } else {
    navEl.classList.remove("nav-visible");
  }
}

window.addEventListener("scroll", updateNav, { passive: true });
updateNav();

document
  .getElementById("hamburger")
  .addEventListener("click", () =>
    document.getElementById("navLinks").classList.toggle("open"),
  );
document
  .querySelectorAll(".nav-links a")
  .forEach((a) =>
    a.addEventListener("click", () =>
      document.getElementById("navLinks").classList.remove("open"),
    ),
  );

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (t) {
      e.preventDefault();
      t.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ── SIMPLE AOS ──
const aosObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const d = parseInt(e.target.dataset.aosDelay || 0);
        setTimeout(() => e.target.classList.add("aos-animate"), d);
      }
    });
  },
  { threshold: 0.1 },
);
document.querySelectorAll("[data-aos]").forEach((el) => aosObs.observe(el));

// ── FAQ — close first, then open ──
document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item");
    const isOpen = item.classList.contains("open");
    const openItem = document.querySelector(".faq-item.open");

    if (openItem && openItem !== item) {
      // Animate close
      openItem.classList.remove("open");
      // Then open new one after transition finishes
      setTimeout(() => {
        if (!isOpen) item.classList.add("open");
      }, 240);
    } else {
      item.classList.toggle("open", !isOpen);
    }
  });
});

// ── COUNTERS ──
let counted = false;
function animateCounters() {
  if (counted) return;
  const s = document.querySelector(".stats-section");
  if (!s || s.getBoundingClientRect().top > window.innerHeight - 100) return;
  counted = true;
  const targets = {
    stat1: 24000,
    stat2: 180000,
    stat3: 56000,
    stat4: 200,
  };
  Object.entries(targets).forEach(([id, target]) => {
    const el = document.getElementById(id);
    if (!el) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 2000, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = Math.floor(ease * target);
      el.textContent =
        val >= 1000
          ? (val / 1000).toFixed(val >= 10000 ? 0 : 1) + "k+"
          : val + "+";
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
window.addEventListener("scroll", animateCounters);
animateCounters();



// GET APP -----
document.querySelectorAll('.store-btn[data-store]').forEach(btn => {
  btn.addEventListener('click', e => e.preventDefault());
});