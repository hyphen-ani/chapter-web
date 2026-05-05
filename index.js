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
  const bgSlides = document.querySelectorAll(".ip-bg-slide");
  const qSlides = document.querySelectorAll(".ip-quote-slide");
  const dotsEl = document.getElementById("ipDots");
  const prevBtn = document.getElementById("ipPrev");
  const nextBtn = document.getElementById("ipNext");
  const section = document.getElementById("intimacySection");
  const total = bgSlides.length;
  let current = 0;
  let animating = false;

  // Build dots
  for (let i = 0; i < total; i++) {
    const d = document.createElement("button");
    d.className = "ip-dot" + (i === 0 ? " active" : "");
    d.setAttribute("aria-label", "Go to slide " + (i + 1));
    d.addEventListener("click", () => goTo(i));
    dotsEl.appendChild(d);
  }

  function getDots() {
    return dotsEl.querySelectorAll(".ip-dot");
  }

  function goTo(idx) {
    if (animating || idx === current) return;
    animating = true;
    const dir = idx > current ? 1 : -1;
    const dots = getDots();

    dots[current].classList.remove("active");
    dots[idx].classList.add("active");

    // Background: crossfade with subtle scale
    gsap.to(bgSlides[current], {
      opacity: 0,
      scale: 1.06,
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => bgSlides[current].classList.remove("active"),
    });
    gsap.fromTo(
      bgSlides[idx],
      { opacity: 0, scale: 1.08 },
      {
        opacity: 1,
        scale: 1,
        duration: 1.4,
        ease: "power2.out",
        onStart: () => bgSlides[idx].classList.add("active"),
      },
    );

    // Quote: slide out / in
    gsap.to(qSlides[current], {
      opacity: 0,
      y: dir * -18,
      duration: 0.45,
      ease: "power2.in",
      onComplete: () => qSlides[current].classList.remove("active"),
    });
    gsap.fromTo(
      qSlides[idx],
      { opacity: 0, y: dir * 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.3,
        onStart: () => qSlides[idx].classList.add("active"),
        onComplete: () => {
          animating = false;
        },
      },
    );

    current = idx;
  }

  prevBtn.addEventListener("click", () => goTo((current - 1 + total) % total));
  nextBtn.addEventListener("click", () => goTo((current + 1) % total));

  // Entrance animation (scroll-triggered if ScrollTrigger available, else on load)
  const entranceTl = gsap.timeline({
    scrollTrigger: window.ScrollTrigger
      ? {
          trigger: section,
          start: "top 75%",
          once: true,
        }
      : undefined,
  });
  entranceTl
    .fromTo(
      ".ip-left",
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 1.1, ease: "power3.out" },
    )
    .fromTo(
      ".ip-right",
      { opacity: 0, x: 40 },
      { opacity: 1, x: 0, duration: 1.1, ease: "power3.out" },
      "-=0.8",
    );

  // Autoplay — pause on hover
  let timer = setInterval(() => goTo((current + 1) % total), 5500);
  section.addEventListener("mouseenter", () => clearInterval(timer));
  section.addEventListener("mouseleave", () => {
    timer = setInterval(() => goTo((current + 1) % total), 5500);
  });
})();
// ── INTRO ──
(() => {
  const t = document.getElementById("intro-text"),
    i = document.getElementById("intro");
  setTimeout(() => t.classList.add("show"), 300);
  setTimeout(() => i.classList.add("lift"), 1800);
  setTimeout(() => (i.style.display = "none"), 3200);
})();

// ── NAV: show only when scrolled past hero ──
const navEl = document.getElementById("nav");
const heroEl = document.getElementById("hero");
const screenWidth = window.innerWidth;
console.log("SCREEN WIDTH:", screenWidth);

function updateNav() {
  const heroBottom = heroEl.getBoundingClientRect().bottom;
  // show nav when hero bottom is at or above viewport

  if (screenWidth >= 1520 && heroBottom <= 800) {
    navEl.classList.add("nav-visible");
  } else if (screenWidth < 1500 && heroBottom <= 600) {
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
document.querySelectorAll(".store-btn[data-store]").forEach((btn) => {
  btn.addEventListener("click", (e) => e.preventDefault());
});

// TESTIMONIALS
const couples = [
  {
    initials: "P&R",
    image: "/assets/realcouples/PrianshuAndAnanna.png",
    name: "Prianshu & Ananna",
    meta: "Kolkata",
    quote:
      "We fight, we heal, we grow and somehow, we always find our way back.",
    avatarGrad: "linear-gradient(135deg,#ff8b8d,#ff618b)",
    imgColor: "#fde0d0",
    imgPattern: "dots",
  },

  {
    initials: "A&K",
    image: "/assets/realcouples/TamannaAndIshan.jpeg",
    name: "Tamanna & Ishan",
    meta: "Pune",
    quote:
      "In a world that keeps changing, we found something steady in each other, a quiet kind of love that doesn’t need to be loud to be real",
    avatarGrad: "linear-gradient(135deg,#ff5c67,#ff8b8d)",
    imgColor: "#f9c6cb",
    imgPattern: "hearts",
  },

  {
    initials: "A&M",
    image: "/assets/realcouples/JahnviAndTushar.png",
    name: "Jahnvi & Tushar",
    meta: "Delhi",
    quote:
      "6 years with you felt like 6 minutes, I hope growing old with you gives us all the time to cherish it",
    avatarGrad: "linear-gradient(135deg,#f7c4a4,#f0a87b)",
    imgColor: "#fce4cc",
    imgPattern: "circles",
  },
  {
    initials: "S&V",
    image: "/assets/realcouples/AbhishekAndAditi.png",
    name: "Abhishek & Aditi",
    meta: "Kolkata",
    quote:
      "Some love stories don’t stay strong, they fall apart, and then quietly rebuild themselves",
    avatarGrad: "linear-gradient(135deg,#b5a4f7,#9b87f0)",
    imgColor: "#ddd4fc",
    imgPattern: "waves",
  },

  {
    initials: "A&P",
    image: "/assets/realcouples/AnkuAndPrashant.png",
    name: "Anku & Prashant",
    meta: "Pune",
    quote:
      "We started as strangers in a game, just two players in the same lobby, but somewhere between revives and late night matches, we became something neither of us expected.",
    avatarGrad: "linear-gradient(135deg,#a4f7c4,#7bf0a8)",
    imgColor: "#ccf5e0",
    imgPattern: "stars",
  },
    {
    initials: "K&S",
    image: "/assets/realcouples/RajenAndPunam.png",
    name: "Rajen & Punam",
    meta: "Kolkata",
    quote:'The key to stable relationships isn’t finding the perfect person, but learning to see an imperfect person perfectly.',
    avatarGrad: "linear-gradient(135deg,#f7a4d4,#f07bb8)",
    imgColor: "#fcd4ec",
    imgPattern: "hearts",
  },
  {
    initials: "M&R",
    image: "/assets/realcouples/MokshaAndNull.png",
    name: "Moksha & Risheet",
    meta: "Ahmedabad",
    quote:
      "To live with someone I really love and respect, who really loves and respects me - what a difference it has made to our life.",
    avatarGrad: "linear-gradient(135deg,#f7a4d4,#f07bb8)",
    imgColor: "#fcd4ec",
    imgPattern: "hearts",
  },

  {
    initials: "P&R",
    image: "/assets/realcouples/SudiptoAndSreyashi.png",
    name: "Sudipto & Sreyashi",
    meta: "Delhi + Mumbai (Long Distance)",
    quote:
      "In all the chaos and noise around us, we built something quiet and meaningful, something that reminds us that love doesn’t have to be complicated to be beautiful.",
    avatarGrad: "linear-gradient(135deg,#ff8b8d,#ff618b)",
    imgColor: "#fde0d0",
    imgPattern: "dots",
  },
];
const track = document.getElementById("tsTrack");
const dotsEl = document.getElementById("tsDots");
const wrap = document.getElementById("tsWrap");

const CARD_W = 300;
const GAP = 20;
const UNIT = CARD_W + GAP;
const allCouples = [...couples, ...couples, ...couples];
const N = couples.length;
let currentOffset = N;
let isDragging = false;
let dragStartX = 0,
  dragStartOffset = 0;

allCouples.forEach((c, i) => {
  const card = document.createElement("div");
  card.className = "ts-card";
  card.dataset.realIdx = i % N;
  card.innerHTML = `
  <div class="ts-card-inner">
    <div class="ts-img">
      <img class="ts-img-bg" src="${c.image}" alt="${c.name}">
    </div>
    <div class="ts-img-footer">
      <div class="ts-couple-name">${c.name}</div>
      <div class="ts-couple-meta">${c.meta}</div>
      <div class="ts-quote-overlay">
        <p class="ts-quote">"${c.quote}"</p>
      </div>
    </div>
  </div>`;
  track.appendChild(card);
});

function getX(idx) {
  return -(idx * UNIT);
}

function jumpTo(idx, animate) {
  currentOffset = idx;
  const x = getX(idx);
  if (animate) {
    gsap.to(track, { x, duration: 0.45, ease: "power2.inOut" });
  } else {
    gsap.set(track, { x });
  }
  updateDots();
}

function updateDots() {
  const realIdx = ((currentOffset % N) + N) % N;
  document
    .querySelectorAll(".ts-dot")
    .forEach((d, i) => d.classList.toggle("active", i === realIdx));
}

jumpTo(N, false);

for (let i = 0; i < N; i++) {
  const dot = document.createElement("button");
  dot.className = "ts-dot" + (i === 0 ? " active" : "");
  dot.addEventListener("click", () => {
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
  jumpTo(currentOffset + dir, true);
  setTimeout(checkLoop, 500);
}

document.getElementById("tsPrev").addEventListener("click", () => navigate(-1));
document.getElementById("tsNext").addEventListener("click", () => navigate(1));

if (wrap) {
  wrap.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartOffset = gsap.getProperty(track, "x");
    wrap.style.cursor = "grabbing";
    e.preventDefault();
  });
}
window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  gsap.set(track, { x: dragStartOffset + (e.clientX - dragStartX) });
});
window.addEventListener("mouseup", (e) => {
  if (!isDragging) return;
  isDragging = false;
  wrap.style.cursor = "grab";
  const moved = Math.round(-(e.clientX - dragStartX) / UNIT);
  jumpTo(currentOffset + moved, true);
  setTimeout(checkLoop, 500);
});

let touchStartX = 0;
if (wrap) {
  wrap.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      dragStartOffset = gsap.getProperty(track, "x");
    },
    { passive: true },
  );
  wrap.addEventListener(
    "touchmove",
    (e) => {
      gsap.set(track, {
        x: dragStartOffset + (e.touches[0].clientX - touchStartX),
      });
    },
    { passive: true },
  );
  wrap.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const moved = Math.round(-dx / UNIT);
    jumpTo(currentOffset + (moved || (dx < -30 ? 1 : dx > 30 ? -1 : 0)), true);
    setTimeout(checkLoop, 500);
  });
}



// GET APP

const LAUNCH = new Date('2026-05-29T00:00:00');
function pad(n){return String(n).padStart(2,'0')}
function tick(){
  const now=new Date();
  const diff=LAUNCH-now;
  if(diff<=0){
    ['cd-d','cd-h','cd-m','cd-s'].forEach(id=>{document.getElementById(id).textContent='00'});
    return;
  }
  const d=Math.floor(diff/86400000);
  const h=Math.floor((diff%86400000)/3600000);
  const m=Math.floor((diff%3600000)/60000);
  const s=Math.floor((diff%60000)/1000);
  document.getElementById('cd-d').textContent=pad(d);
  document.getElementById('cd-h').textContent=pad(h);
  document.getElementById('cd-m').textContent=pad(m);
  document.getElementById('cd-s').textContent=pad(s);
}
tick();setInterval(tick,1000);

const overlay=document.getElementById('modalOverlay');
const form=document.getElementById('modalForm');
const success=document.getElementById('modalSuccess');
const emailInput=document.getElementById('emailInput');
const emailError=document.getElementById('emailError');
const nameInput=document.getElementById('nameInput');
const nameError=document.getElementById('nameError');
const btnSubmit=document.getElementById('btnSubmit');

document.getElementById('btnJoin').addEventListener('click',()=>{
  form.classList.remove('hide');
  success.classList.remove('show');
  emailInput.value='';
  emailError.style.display='none';
  nameError.style.display='none';
  nameInput.value='';
  btnSubmit.disabled=false;
  btnSubmit.textContent='Claim my spot →';
  overlay.classList.add('open');
  setTimeout(()=>emailInput.focus(),350);
});
document.getElementById('modalClose').addEventListener('click',()=>overlay.classList.remove('open'));
overlay.addEventListener('click',(e)=>{if(e.target===overlay)overlay.classList.remove('open')});

document.getElementById('emailInput').addEventListener('keydown',(e)=>{if(e.key==='Enter')document.getElementById('btnSubmit').click()});
document.getElementById('nameInput').addEventListener('keydown',(e)=>{if(e.key==='Enter')document.getElementById('btnSubmit').click()});


function isValidEmail(e){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}
function isValidName(e){return e.trim().length>=2}

const BEURL = 'https://chapter-mock-server.vercel.app/'
// const BEURL = 'http://localhost:4500'

btnSubmit.addEventListener('click',async()=>{
  const email=emailInput.value.trim();
  const name=nameInput.value.trim();

  if(!isValidName(name)){
    nameError.textContent='Please enter your name.';
    nameError.style.display='block';
    nameInput.style.borderColor='var(--pink)';
    return;
  }
  nameInput.style.borderColor='#e5e5e5';
  nameError.style.display='none';
  if(!isValidEmail(email)){
    emailError.textContent='Please enter a valid email address.';
    emailError.style.display='block';
    emailInput.style.borderColor='var(--pink)';
    return;
  }

  emailError.style.display='none';
  emailInput.style.borderColor='#e5e5e5';

  btnSubmit.disabled=true;
  btnSubmit.textContent='Adding you...';
  try{

    // Replace this fetch with your actual API endpoint
    const response = await fetch(BEURL + '/api/email', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email, name})});
    console.log('Response status:', response.status);
    form.classList.add('hide');
    success.classList.add('show');
  }catch(err){
    btnSubmit.disabled=false;
    btnSubmit.textContent='Claim my spot →';
    emailError.textContent='Something went wrong. Please try again.';
    emailError.style.display='block';
  }
});

const hearts=['♥'];
document.getElementById('btnLove').addEventListener('click',(e)=>{
  const cx=e.clientX,cy=e.clientY;
  for(let i=0;i<22;i++){
    const h=document.createElement('div');
    h.className='heart-particle';
    h.textContent=hearts[Math.floor(Math.random()*hearts.length)];
    const xOff=(Math.random()-0.5)*260;
    const rot=(Math.random()-0.5)*60+'deg';
    h.style.cssText=`left:${cx+xOff}px;top:${cy}px;--rot:${rot};font-size:${0.9+Math.random()*1.1}rem;animation-delay:${Math.random()*.3}s;animation-duration:${1.8+Math.random()*.8}s`;
    document.body.appendChild(h);
    setTimeout(()=>h.remove(),3000);
  }
});