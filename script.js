/* ============================================
   MEXAA-IT GmbH — script.js
   Navigation | Partikel | Animationen | Slider
   ============================================ */

'use strict';

/* ---- Hilfsfunktionen ---- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================
   1. NAVIGATION — Scroll-Blur + Aktiv-State
   ============================================ */
const nav = $('.nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* Aktive Seite in der Navigation hervorheben */
(function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-item[data-page]').forEach(item => {
    const pages = item.dataset.page.split(',');
    if (pages.some(p => path.includes(p))) {
      const link = item.querySelector('.nav-link');
      if (link) link.classList.add('active');
    }
  });
})();

/* ============================================
   2. HAMBURGER / MOBILE MENU
   ============================================ */
const hamburger = $('.hamburger');
const navMobile = $('.nav-mobile');

if (hamburger && navMobile) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active');
    navMobile.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Mobile Links schließen das Menü */
  $$('.mobile-link', navMobile).forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMobile.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* Klick außerhalb schließt Menü */
  navMobile.addEventListener('click', (e) => {
    if (e.target === navMobile) {
      hamburger.classList.remove('active');
      navMobile.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ============================================
   3. PARTIKEL-ANIMATION (Hero Canvas)
   ============================================ */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;
  let W, H;

  const CFG = {
    count:        80,
    speed:        0.38,
    minRadius:    1.0,
    maxRadius:    2.8,
    lineDistance: 120,
    dotColor:     '126, 196, 240',
    lineColor:    '26, 111, 168',
  };

  function resize() {
    const parent = canvas.parentElement;
    W = canvas.width  = parent.offsetWidth;
    H = canvas.height = parent.offsetHeight;
  }

  function makeParticle() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * CFG.speed,
      vy: (Math.random() - 0.5) * CFG.speed,
      r:  CFG.minRadius + Math.random() * (CFG.maxRadius - CFG.minRadius),
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CFG.count }, makeParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Punkte bewegen + zeichnen */
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CFG.dotColor}, 0.55)`;
      ctx.fill();
    }

    /* Verbindungslinien */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CFG.lineDistance) {
          const alpha = (1 - dist / CFG.lineDistance) * 0.28;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${CFG.lineColor}, ${alpha})`;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  /* Größe bei Resize anpassen */
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(animId);
    resize();
    draw();
  });
  ro.observe(canvas.parentElement);

  init();
  draw();
})();

/* ============================================
   4. INTERSECTION OBSERVER — Fade-In
   ============================================ */
(function initFadeIn() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  $$('.fade-in').forEach(el => io.observe(el));
})();

/* ============================================
   5. COUNTER-ANIMATION (Kennzahlen)
   ============================================ */
(function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target   = parseInt(el.dataset.count, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();

    (function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease-out Cubic */
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    })(start);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
})();

/* ============================================
   6. TESTIMONIALS SLIDER
   ============================================ */
(function initSlider() {
  const track   = $('.testimonials-track');
  if (!track) return;

  const slides  = $$('.testimonial', track);
  const dots    = $$('.slider-dot');
  const prevBtn = $('.slider-btn.prev');
  const nextBtn = $('.slider-btn.next');
  let current   = 0;
  let autoTimer;

  function goTo(idx) {
    current = ((idx % slides.length) + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 5500); }
  function stopAuto()  { clearInterval(autoTimer); }

  prevBtn?.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  nextBtn?.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));

  /* Touch-Support */
  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { stopAuto(); goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
  });

  goTo(0);
  startAuto();
})();

/* ============================================
   7. KONTAKT-FORMULAR
   ============================================ */
(function initContactForm() {
  const form = $('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn  = form.querySelector('.form-submit');
    const orig = btn.textContent;

    btn.textContent = 'Wird gesendet …';
    btn.disabled    = true;
    btn.style.opacity = '0.7';

    /* Simulierte Übermittlung — hier echten API-Call einfügen */
    setTimeout(() => {
      btn.textContent   = '✓ Nachricht erfolgreich gesendet!';
      btn.style.opacity = '1';
      btn.style.background = '#10b981';

      setTimeout(() => {
        btn.textContent      = orig;
        btn.style.background = '';
        btn.disabled         = false;
        form.reset();
      }, 3500);
    }, 1600);
  });
})();

/* ============================================
   8. SMOOTH SCROLL für Anker-Links
   ============================================ */
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = $(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 82;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
