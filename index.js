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



// TESTIMONIALS
const couples = [
    {
    initials: "P&R",
    image:"/assets/realcouples/PrianshuAndAnanna.png",
    name: "Prianshu & Ananna",
    meta: "Bangalore · 1 year together",
    quote: "We fight, we heal, we grow and somehow, we always find our way back.",
    avatarGrad: "linear-gradient(135deg,#ff8b8d,#ff618b)",
    imgColor: "#fde0d0",
    imgPattern: "dots"
  },

    {
    initials: "A&K",
    image:"/assets/realcouples/TamannaAndIshan.jpeg",
    name: "Tamanna & Ishan",
    meta: "Mumbai · 3 years together",
    quote: "Chapter made us realise how many things we were doing together but never documenting. Now our profile is like a love diary — and we're obsessed.",
    avatarGrad: "linear-gradient(135deg,#ff5c67,#ff8b8d)",
    imgColor: "#f9c6cb",
    imgPattern: "hearts"
  },

  {
    initials: "A&M",
    image:"/assets/realcouples/JahnviAndTushar.png",
    name: "Jahnvi & Tushar",
    meta: "Chennai + London · 2 years",
    quote: "My long-distance boyfriend and I use Chapter to stay connected. Watching the same movies, planning places to visit — it makes distance feel smaller.",
    avatarGrad: "linear-gradient(135deg,#f7c4a4,#f0a87b)",
    imgColor: "#fce4cc",
    imgPattern: "circles"
  },
    {
    initials: "S&V",
    image:"/assets/realcouples/AbhishekAndAditi.png",
    name: "Abhishek & Aditi",
    meta: "Delhi · 5 years together",
    quote: "Some love stories don’t stay strong, they fall apart, and then quietly rebuild themselves",
    avatarGrad: "linear-gradient(135deg,#b5a4f7,#9b87f0)",
    imgColor: "#ddd4fc",
    imgPattern: "waves"
  },
 
  {
    initials: "N&D",
    image:"/assets/realcouples/SeemaAndSachin.png",
    name: "Seema & Sachin",
    meta: "Pune · 4 years together",
    quote: "We joined as a fun experiment and ended up falling more in love. Seeing our chapters grow together is honestly one of the best feelings.",
    avatarGrad: "linear-gradient(135deg,#a4f7c4,#7bf0a8)",
    imgColor: "#ccf5e0",
    imgPattern: "stars"
  },
  {
    initials: "K&S",
    image:"/assets/realcouples/MokshaAndNull.png",
    name: "Moksha & Null",
    meta: "Hyderabad · 2 years together",
    quote: "The onboarding was such a sweet experience. Answering questions about your relationship felt like writing our story for the very first time.",
    avatarGrad: "linear-gradient(135deg,#f7a4d4,#f07bb8)",
    imgColor: "#fcd4ec",
    imgPattern: "hearts"
  },

     {
    initials: "P&R",
    image:"/assets/realcouples/SudiptoAndSreyashi.png",
    name: "Sudipto & Sreyashi",
    meta: "Bangalore · 1 year together",
    quote: "We used to struggle with 'what should we do this weekend?' Chapter solved that. The explore places feature is genuinely so good for date ideas.",
    avatarGrad: "linear-gradient(135deg,#ff8b8d,#ff618b)",
    imgColor: "#fde0d0",
    imgPattern: "dots"
  },
 
];


const track = document.getElementById('tsTrack');
const dotsEl = document.getElementById('tsDots');
const wrap = document.getElementById('tsWrap');

const CARD_W = 300;
const GAP = 20;
const EXPANDED_W = 620;
const UNIT = CARD_W + GAP;

const allCouples = [...couples, ...couples, ...couples];
const N = couples.length;
let currentOffset = N;
let expandedCard = null;
let isAnimating = false;
let dragStartX = 0, dragStartOffset = 0, isDragging = false;

allCouples.forEach((c, i) => {
  const card = document.createElement('div');
  card.className = 'ts-card';
  card.dataset.realIdx = i % N;
  card.innerHTML = `
    <div class="ts-card-inner">
      <div class="ts-img">
        <img class="ts-img-bg" src="${c.image}" alt="${c.name}">
        <div class="ts-img-overlay"></div>
        <div class="ts-img-footer">
          <div class="ts-couple-name">${c.name}</div>
          <div class="ts-couple-meta">${c.meta}</div>
        </div>
      </div>
      <div class="ts-content">
        <p class="ts-quote">"${c.quote}"</p>
        <div class="ts-divider"></div>
        <div class="ts-content-name">${c.name}</div>
        <div class="ts-content-meta">${c.meta}</div>
      </div>
    </div>`;

  card.addEventListener('mouseenter', () => {
    if (isDragging) return;
    if (expandedCard && expandedCard !== card) collapseCard(expandedCard, true);
    expandCard(card);
  });

  card.addEventListener('mouseleave', () => {
    collapseCard(card, false);
  });

  track.appendChild(card);
});
function expandCard(card) {
  if (expandedCard === card) return;
  expandedCard = card;
  const content = card.querySelector('.ts-content');
  card.classList.add('expanded');
  gsap.fromTo(card,
    { flexBasis: '300px' },
    { flexBasis: '620px', duration: 0.6, ease: 'power3.inOut' }
  );
  gsap.set(content, { opacity: 0, x: 14, display: 'flex' });
  gsap.to(content, {
    opacity: 1, x: 0,
    duration: 0.35, ease: 'power2.out',
    delay: 0.42          // waits until card is nearly fully wide
  });
  gsap.to(card, { boxShadow: '0 16px 48px rgba(255,92,103,0.18)', duration: 0.5, ease: 'power2.out' });
}
function collapseCard(card, instant) {
  if (!card.classList.contains('expanded')) return;
  const content = card.querySelector('.ts-content');
  const dur = instant ? 0.18 : 0.5;
  gsap.to(content, { opacity: 0, x: 10, duration: 0.15, ease: 'power2.in', onComplete: () => {
    gsap.set(content, { display: 'none' });
  }});
  gsap.to(card, {
    flexBasis: '300px',
    duration: dur,
    delay: 0.1,           // tiny pause so text vanishes first
    ease: 'power3.inOut',
    onComplete: () => {
      card.classList.remove('expanded');
      gsap.set(content, { clearProps: 'all' });
    }
  });
  gsap.to(card, { boxShadow: '0 2px 12px rgba(255,92,103,0.06)', duration: dur, ease: 'power2.in' });
  if (expandedCard === card) expandedCard = null;
}
function getX(idx) {
  return -(idx * UNIT);
}

function jumpTo(idx, animate) {
  currentOffset = idx;
  const x = getX(idx);
  if (animate) {
    gsap.to(track, { x, duration: 0.15, ease: 'power2.inOut' });
  } else {
    gsap.set(track, { x });
  }
  updateDots();
}

function updateDots() {
  const realIdx = ((currentOffset % N) + N) % N;
  document.querySelectorAll('.ts-dot').forEach((d, i) => d.classList.toggle('active', i === realIdx));
}

jumpTo(N, false);

for (let i = 0; i < N; i++) {
  const dot = document.createElement('button');
  dot.className = 'ts-dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => {
    const diff = i - (((currentOffset % N) + N) % N);
    jumpTo(currentOffset + diff, true);
    checkLoop();
  });
  dotsEl.appendChild(dot);
}

function checkLoop() {
  if (currentOffset <= 1) {
    setTimeout(() => jumpTo(currentOffset + N, false), 10);
  } else if (currentOffset >= allCouples.length - 2) {
    setTimeout(() => jumpTo(currentOffset - N, false), 10);
  }
}

function navigate(dir) {
  if (expandedCard) { collapseCard(expandedCard, true); }
  jumpTo(currentOffset + dir, true);
  setTimeout(checkLoop, 580);
}

document.getElementById('tsPrev').addEventListener('click', () => navigate(-1));
document.getElementById('tsNext').addEventListener('click', () => navigate(1));

wrap.addEventListener('mousedown', e => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartOffset = gsap.getProperty(track, 'x');
  wrap.style.cursor = 'grabbing';
  e.preventDefault();
});

window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const dx = e.clientX - dragStartX;
  gsap.set(track, { x: dragStartOffset + dx });
});

window.addEventListener('mouseup', e => {
  if (!isDragging) return;
  isDragging = false;
  wrap.style.cursor = 'grab';
  const dx = e.clientX - dragStartX;
  const moved = Math.round(-dx / UNIT);
  jumpTo(currentOffset + moved, true);
  setTimeout(checkLoop, 580);
});

let touchStartX = 0;
wrap.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  dragStartOffset = gsap.getProperty(track, 'x');
}, { passive: true });

wrap.addEventListener('touchmove', e => {
  const dx = e.touches[0].clientX - touchStartX;
  gsap.set(track, { x: dragStartOffset + dx });
}, { passive: true });

wrap.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const moved = Math.round(-dx / UNIT);
  jumpTo(currentOffset + (moved || (dx < -30 ? 1 : dx > 30 ? -1 : 0)), true);
  setTimeout(checkLoop, 580);
});