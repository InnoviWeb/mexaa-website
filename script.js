/**
 * mexaa Website – script.js
 * Sticky Nav | Hamburger Menu | Smooth Scroll | Scroll Animations | Form
 */

(function () {
  'use strict';

  /* ── Elemente ─────────────────────────────────────── */
  const navbar    = document.getElementById('navbar');
  const burger    = document.getElementById('burger');
  const navLinks  = document.getElementById('navLinks');
  const allLinks  = navLinks ? navLinks.querySelectorAll('.nav__link') : [];
  const form      = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const fadeEls   = document.querySelectorAll('.fade-in');

  /* ── 1. Sticky Navigation mit Schatten ───────────── */
  function handleScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial-Check

  /* ── 2. Hamburger Menü ───────────────────────────── */
  function openMenu() {
    navLinks.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Menü schließen');
    document.body.style.overflow = 'hidden'; // Scrollen sperren
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Menü öffnen');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    if (navLinks.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (burger) {
    burger.addEventListener('click', toggleMenu);
  }

  // Menü bei Klick auf einen Link schließen
  allLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Menü schließen bei Klick außerhalb
  document.addEventListener('click', function (e) {
    if (
      navLinks &&
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !burger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Menü schließen bei Resize auf Desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      closeMenu();
    }
  });

  /* ── 3. Smooth Scroll ────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = navbar ? navbar.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    });
  });

  /* ── 4. Scroll Animations (IntersectionObserver) ─── */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Einmalig ausführen
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: alle sofort sichtbar
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ── 5. Kontaktformular ──────────────────────────── */
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Einfache Client-seitige Validierung
      const name    = form.querySelector('#name');
      const email   = form.querySelector('#email');
      const message = form.querySelector('#message');
      let valid = true;

      [name, email, message].forEach(function (field) {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          valid = false;
        }
      });

      // E-Mail-Format prüfen
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.style.borderColor = '#ef4444';
        valid = false;
      }

      if (!valid) return;

      // Submit-Button deaktivieren & Feedback zeigen
      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Wird gesendet…';

      // Simulation (hier echten API-Call einbauen)
      setTimeout(function () {
        form.reset();
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Nachricht absenden';

        if (formSuccess) {
          formSuccess.hidden = false;
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

          // Erfolgsmeldung nach 6 Sekunden ausblenden
          setTimeout(function () {
            formSuccess.hidden = true;
          }, 6000);
        }
      }, 900);
    });

    // Rote Ränder beim Tippen zurücksetzen
    form.querySelectorAll('.form-input').forEach(function (input) {
      input.addEventListener('input', function () {
        this.style.borderColor = '';
      });
    });
  }

  /* ── 6. Active Nav-Link beim Scrollen ────────────── */
  const sections = document.querySelectorAll('section[id]');

  function setActiveLink() {
    const scrollPos = window.scrollY + (navbar ? navbar.offsetHeight : 0) + 40;

    sections.forEach(function (section) {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = navLinks ? navLinks.querySelector('.nav__link[href="#' + id + '"]') : null;

      if (link) {
        if (scrollPos >= top && scrollPos < bottom) {
          link.style.color = '#ffffff';
        } else {
          link.style.color = '';
        }
      }
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

})();
