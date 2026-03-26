/* ========================================
   ABSOLUTT MASKIN AS - Main JavaScript
   ======================================== */

(function () {
  'use strict';

  // ----------------------------------------
  // Navigation: scroll state
  // ----------------------------------------
  const nav = document.getElementById('nav');

  function updateNavScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', updateNavScroll, { passive: true });
  updateNavScroll();

  // ----------------------------------------
  // Mobile hamburger menu
  // ----------------------------------------
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      menuOpen = !menuOpen;
      hamburger.classList.toggle('nav__hamburger--active', menuOpen);
      mobileMenu.classList.toggle('nav__mobile-menu--open', menuOpen);
      document.body.style.overflow = menuOpen ? 'hidden' : '';
    });

    // Close menu when clicking a link
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        menuOpen = false;
        hamburger.classList.remove('nav__hamburger--active');
        mobileMenu.classList.remove('nav__mobile-menu--open');
        document.body.style.overflow = '';
      });
    });
  }

  // ----------------------------------------
  // Scroll reveal animations
  // ----------------------------------------
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all elements
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // ----------------------------------------
  // Counter animation
  // ----------------------------------------
  const counters = document.querySelectorAll('[data-count]');

  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  // ----------------------------------------
  // Contact form handling
  // ----------------------------------------
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Collect form data
      const formData = new FormData(contactForm);
      const data = {};
      formData.forEach(function (value, key) {
        data[key] = value;
      });

      // Basic validation
      if (!data.name || !data.email || !data.phone) {
        showFormMessage('Vennligst fyll ut alle påkrevde felt.', 'error');
        return;
      }

      // Email validation
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(data.email)) {
        showFormMessage('Vennligst oppgi en gyldig e-postadresse.', 'error');
        return;
      }

      // Phone validation (Norwegian format)
      var phoneClean = data.phone.replace(/[\s\-\+]/g, '');
      if (phoneClean.length < 8) {
        showFormMessage('Vennligst oppgi et gyldig telefonnummer.', 'error');
        return;
      }

      // Send via Resend API
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sender...';
      submitBtn.disabled = true;

      sendContactForm(data)
        .then(function () {
          showFormMessage(
            'Takk for din henvendelse! Vi tar kontakt innen 24 timer.',
            'success'
          );
          contactForm.reset();
        })
        .catch(function () {
          showFormMessage(
            'Noe gikk galt. Prøv igjen, eller ring oss direkte på 900 91 998.',
            'error'
          );
        })
        .finally(function () {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        });
    });
  }

  function showFormMessage(message, type) {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = 'form-message';
    formMessage.classList.add('form-message--' + type);
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function sendContactForm(data) {
    // Resend API integration
    // Replace with your actual Resend API key and endpoint
    var response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer YOUR_RESEND_API_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'nettside@absag.no',
        to: 'post@absag.no',
        subject: 'Ny henvendelse fra nettside – ' + (data.projectType || 'Generell'),
        html:
          '<h2>Ny henvendelse fra absag.no</h2>' +
          '<table style="border-collapse:collapse;width:100%;">' +
          '<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Navn</td><td style="padding:8px;border:1px solid #ddd;">' + escapeHtml(data.name) + '</td></tr>' +
          '<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">E-post</td><td style="padding:8px;border:1px solid #ddd;">' + escapeHtml(data.email) + '</td></tr>' +
          '<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Telefon</td><td style="padding:8px;border:1px solid #ddd;">' + escapeHtml(data.phone) + '</td></tr>' +
          '<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Adresse</td><td style="padding:8px;border:1px solid #ddd;">' + escapeHtml(data.address || 'Ikke oppgitt') + '</td></tr>' +
          '<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Type prosjekt</td><td style="padding:8px;border:1px solid #ddd;">' + escapeHtml(data.projectType || 'Ikke valgt') + '</td></tr>' +
          '<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Beskrivelse</td><td style="padding:8px;border:1px solid #ddd;">' + escapeHtml(data.description || 'Ikke oppgitt') + '</td></tr>' +
          '<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Ønsker befaring</td><td style="padding:8px;border:1px solid #ddd;">' + (data.befaring === 'ja' ? 'Ja' : 'Nei') + '</td></tr>' +
          '</table>',
      }),
    });

    if (!response.ok) {
      throw new Error('Email sending failed');
    }

    return response.json();
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ----------------------------------------
  // Smooth scroll for anchor links
  // ----------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ----------------------------------------
  // Active nav link highlight
  // ----------------------------------------
  // Handled via class in HTML per page

})();
