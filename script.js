'use strict';

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

/* ===== NAV SCROLL ===== */
const nav = $('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ===== ACTIVE PAGE ===== */
const page = window.location.pathname.split('/').pop() || 'index.html';
$$('.nav-item').forEach(item => {
  const link = item.querySelector('a.nav-link');
  if (!link) return;
  const href = link.getAttribute('href') || '';
  if (href === page || (page === '' && href === 'index.html') || (href !== 'index.html' && page.startsWith(href.replace('.html','')))) {
    item.classList.add('active');
  }
});

/* ===== HAMBURGER / MOBILE MENU ===== */
const hamburger = $('.hamburger');
const mobileNav = $('.nav-mobile');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  $$('.nav-mobile-link').forEach(link => {
    const dropdown = link.nextElementSibling;
    if (!dropdown || !dropdown.classList.contains('nav-mobile-dropdown')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      const isOpen = dropdown.classList.toggle('open');
      link.classList.toggle('open', isOpen);
    });
  });

  $$('.nav-mobile-dropdown a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ===== CANVAS PARTICLES ===== */
const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let rafId;

  const COUNT = 80;
  const MAX_DIST = 120;
  const SPEED = 0.4;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function init() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r: Math.random() * 1.5 + 0.5,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${(1 - d / MAX_DIST) * 0.35})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    rafId = requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();
  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });
}

/* ===== FADE IN ===== */
const fadeEls = $$('.fade-in');
if (fadeEls.length) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  fadeEls.forEach(el => obs.observe(el));
}

/* ===== COUNTER ANIMATION ===== */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function animateCounter(el, target, suffix, duration = 2000) {
  const start = performance.now();
  (function update(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(easeOutCubic(p) * target) + suffix;
    if (p < 1) requestAnimationFrame(update);
  })(start);
}

const statsBar = $('.stats-bar');
if (statsBar) {
  let done = false;
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !done) {
      done = true;
      $$('[data-count]', statsBar).forEach(el => {
        animateCounter(el, +el.dataset.count, el.dataset.suffix || '');
      });
    }
  }, { threshold: 0.5 }).observe(statsBar);
}

/* ===== CONTACT FORM ===== */
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const successMsg = form.querySelector('.form-success');
    const origText = btn.textContent;
    btn.textContent = 'Wird gesendet...';
    btn.disabled = true;
    await new Promise(r => setTimeout(r, 1500));
    if (successMsg) { successMsg.style.display = 'block'; }
    btn.textContent = 'Gesendet!';
    btn.style.background = '#16a34a';
    setTimeout(() => {
      form.reset();
      btn.textContent = origText;
      btn.style.background = '';
      btn.disabled = false;
      if (successMsg) successMsg.style.display = 'none';
    }, 4000);
  });
}

/* ===== SMOOTH SCROLL ===== */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' }); }
  });
});
