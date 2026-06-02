/**
 * Portfolio — core interactions (plain script, no modules)
 */
(function () {
  'use strict';

  const THEME_KEY = 'portfolio-theme';
  const ROLES = [
    'AI Engineer',
    'Full Stack Developer',
    'IoT Innovator',
    'Security-aware Architect'
  ];

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    const resolved = theme === 'light' || theme === 'dark' ? theme : getSystemTheme();
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem(THEME_KEY, resolved);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = resolved === 'light' ? '#f1f5f9' : '#0b1220';
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    applyTheme(stored || 'dark');
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    });
  }

  function initNavigation() {
    const currentPage = document.body.dataset.page || 'home';
    document.querySelectorAll('[data-nav-page]').forEach(function (el) {
      const active = el.getAttribute('data-nav-page') === currentPage;
      el.classList.toggle('active', active);
      if (el.classList.contains('nav-item') || el.classList.contains('desktop-nav-link')) {
        el.toggleAttribute('aria-current', active ? 'page' : false);
      }
    });
  }

  function showToast(message, type) {
    type = type || 'success';
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = '<i class="fa-solid ' + (type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle') + '" aria-hidden="true"></i><span>' + message + '</span>';
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('visible'); });
    setTimeout(function () {
      toast.classList.remove('visible');
      setTimeout(function () { toast.remove(); }, 400);
    }, 3200);
  }

  function initSplash(prefersReducedMotion, onComplete) {
    const splash = document.getElementById('splash');
    if (!splash) {
      if (onComplete) onComplete();
      return;
    }

    const splashLogo = splash.querySelector('.splash-logo');
    if (splashLogo && !prefersReducedMotion) splashLogo.classList.add('is-animating');

    function hideSplash() {
      splash.classList.add('is-exiting');
      splash.setAttribute('aria-hidden', 'true');
      setTimeout(function () {
        splash.style.display = 'none';
        if (onComplete) onComplete();
      }, prefersReducedMotion ? 0 : 520);
    }

    window.addEventListener('load', function () {
      setTimeout(hideSplash, prefersReducedMotion ? 400 : 1400);
    });
  }

  function initTyping(prefersReducedMotion) {
    const typingEl = document.getElementById('typing-text');
    if (!typingEl) return { pause: function () {}, resume: function () {} };

    let typingIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingTimer = null;

    function tickTyping() {
      if (prefersReducedMotion) return;
      const current = ROLES[typingIndex];
      const speed = isDeleting ? 45 : 85;
      if (!isDeleting) {
        typingEl.textContent = current.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          typingTimer = setTimeout(function () { isDeleting = true; tickTyping(); }, 2200);
          return;
        }
      } else {
        typingEl.textContent = current.slice(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          typingIndex = (typingIndex + 1) % ROLES.length;
        }
      }
      typingTimer = setTimeout(tickTyping, speed);
    }

    if (prefersReducedMotion) {
      typingEl.textContent = ROLES.join(' · ');
      const cursor = document.querySelector('.typing-cursor');
      if (cursor) cursor.hidden = true;
      return { pause: function () {}, resume: function () {} };
    }

    tickTyping();
    return {
      pause: function () { if (typingTimer) clearTimeout(typingTimer); },
      resume: function () { if (!prefersReducedMotion) tickTyping(); }
    };
  }

  function createAnimationsController(prefersReducedMotion) {
    const STAGGER_MS = prefersReducedMotion ? 0 : 80;

    function triggerAnimations(screenId) {
      const screen = document.getElementById(screenId);
      if (!screen) return;
      screen.querySelectorAll('.animate-in:not(.visible)').forEach(function (el, index) {
        setTimeout(function () { el.classList.add('visible'); }, index * STAGGER_MS);
      });
      screen.querySelectorAll('.progress').forEach(function (bar, i) {
        const width = bar.getAttribute('data-width');
        if (!width) return;
        bar.style.width = '0';
        setTimeout(function () { bar.style.width = width; }, prefersReducedMotion ? 0 : 250 + i * 100);
      });
    }

    function triggerPageAnimations() {
      const pageScreen = document.querySelector('.page-screen.active, .screen.active');
      if (pageScreen) triggerAnimations(pageScreen.id);
    }

    function initRevealObserver() {
      if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        document.querySelectorAll('.animate-in').forEach(function (el) { el.classList.add('visible'); });
        return;
      }

      const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      document.querySelectorAll('.animate-in').forEach(function (el) { revealObserver.observe(el); });
    }

    function initAnimationPause() {
      if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

      const animSelectors = '.splash-logo.is-animating, .profile-img.is-animating, .profile-ring.is-animating, .hero-orb.is-animating';
      const pauseObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('anim-paused', !entry.isIntersecting);
        });
      }, { threshold: 0 });

      document.querySelectorAll(animSelectors).forEach(function (el) { pauseObserver.observe(el); });
    }

    function initDecorAnimations() {
      if (prefersReducedMotion) return;
      const splashLogo = document.querySelector('.splash-logo');
      const profileImg = document.querySelector('.profile-img');
      const profileRing = document.querySelector('.profile-ring');
      const heroOrb = document.querySelector('.hero-orb--2');
      if (splashLogo) splashLogo.classList.add('is-animating');
      if (profileImg) profileImg.classList.add('is-animating');
      if (profileRing) profileRing.classList.add('is-animating');
      if (heroOrb) heroOrb.classList.add('is-animating');
    }

    return {
      triggerPageAnimations: triggerPageAnimations,
      initRevealObserver: initRevealObserver,
      initAnimationPause: initAnimationPause,
      initDecorAnimations: initDecorAnimations
    };
  }

  function initCursorGlow(prefersReducedMotion) {
    const cursorGlow = document.getElementById('cursor-glow');
    if (!cursorGlow || prefersReducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }

    let glowActive = false;
    document.addEventListener('mousemove', function (e) {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
      if (!glowActive) {
        cursorGlow.classList.add('is-active');
        glowActive = true;
      }
    }, { passive: true });
    document.addEventListener('mouseleave', function () {
      cursorGlow.classList.remove('is-active');
      glowActive = false;
    });
  }

  function initProfileImage() {
    const profileImg = document.querySelector('.profile-img');
    const profileSkeleton = document.getElementById('profile-skeleton');
    if (!profileImg) return;

    function onProfileReady() {
      profileImg.classList.add('is-loaded');
      if (profileSkeleton) profileSkeleton.classList.add('hidden');
    }

    if (profileImg.complete) onProfileReady();
    else {
      profileImg.addEventListener('load', onProfileReady);
      profileImg.addEventListener('error', onProfileReady);
    }
  }

  function initFormStates() {
    document.querySelectorAll('.floating-group').forEach(function (group) {
      const field = group.querySelector('input, textarea, select');
      if (!field) return;

      function updateFilled() {
        let filled = false;
        if (field.tagName === 'SELECT') filled = field.value !== '';
        else filled = field.value.trim() !== '';
        group.classList.toggle('filled', filled);
      }

      field.addEventListener('focus', function () { group.classList.add('focused'); });
      field.addEventListener('blur', function () { group.classList.remove('focused'); });
      field.addEventListener('input', updateFilled);
      field.addEventListener('change', updateFilled);
      updateFilled();
    });
  }

  function initContactForm() {
    initFormStates();

    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const endpoint = contactForm.dataset.contactEndpoint || '/api/contact';
    const useJsonApi = endpoint.indexOf('/api/') !== -1;
    const inputs = contactForm.querySelectorAll('input:not(.hp-field), textarea, select');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const messageField = contactForm.querySelector('#message');
    const charCounter = contactForm.querySelector('.char-counter');

    if (messageField && charCounter) {
      const minLen = parseInt(messageField.getAttribute('minlength'), 10) || 10;
      function updateCounter() {
        const len = messageField.value.length;
        charCounter.textContent = len + ' / ' + minLen + '+ characters';
        charCounter.classList.toggle('is-valid', len >= minLen);
        charCounter.classList.toggle('is-invalid', len > 0 && len < minLen);
      }
      messageField.addEventListener('input', updateCounter);
      updateCounter();
    }

    function validateInput(input) {
      const group = input.closest('.floating-group');
      if (!group) return true;

      let isValid = input.checkValidity();
      if (input.type === 'email') isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
      if (input.id === 'phone') isValid = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(input.value);

      const touched = input.value !== '' || input.tagName === 'SELECT';
      const showError = !isValid && touched;
      group.classList.toggle('error', showError);
      group.classList.toggle('success', isValid && touched && input.value.trim() !== '');
      return isValid;
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', function () { validateInput(input); });
      input.addEventListener('blur', function () { validateInput(input); });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const honeypot = contactForm.querySelector('.hp-field, [name="website"]');
      if (honeypot && honeypot.value) return;

      if (window.location.protocol === 'file:') {
        showToast('Contact form needs a server. Run: vercel dev  or  php -S localhost:8000', 'error');
        return;
      }

      let isFormValid = true;
      inputs.forEach(function (input) {
        if (!validateInput(input)) isFormValid = false;
      });

      if (!isFormValid) {
        showToast('Please correct the errors in the form.', 'error');
        return;
      }

      const btnText = submitBtn.querySelector('.btn-text');
      const spinner = submitBtn.querySelector('.spinner');
      const originalText = btnText.textContent;

      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');
      btnText.textContent = 'Sending…';
      spinner.hidden = false;

      let fetchBody;
      let fetchHeaders = { Accept: 'application/json' };

      if (useJsonApi) {
        const fd = new FormData(contactForm);
        fetchBody = JSON.stringify({
          name: fd.get('name'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          subject: fd.get('subject'),
          message: fd.get('message'),
          website: fd.get('website') || ''
        });
        fetchHeaders['Content-Type'] = 'application/json';
      } else {
        fetchBody = new FormData(contactForm);
      }

      fetch(endpoint, {
        method: 'POST',
        body: fetchBody,
        headers: fetchHeaders
      })
        .then(function (response) {
          return response.json().then(function (result) {
            return { response: response, result: result };
          }).catch(function () {
            return { response: response, result: { success: false, message: 'Invalid server response.' } };
          });
        })
        .then(function (_ref) {
          const response = _ref.response;
          const result = _ref.result;
          if (response.ok && result.success) {
            showToast(result.message || 'Message sent successfully!', 'success');
            contactForm.reset();
            contactForm.querySelectorAll('.floating-group').forEach(function (g) {
              g.classList.remove('filled', 'success', 'error', 'focused');
            });
            if (charCounter) charCounter.textContent = '0 / 10+ characters';
            if ('vibrate' in navigator) navigator.vibrate([40, 20, 40]);
          } else {
            showToast(result.message || result.error || 'Failed to send message.', 'error');
          }
        })
        .catch(function () {
          showToast('A connection error occurred. Please try again.', 'error');
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.classList.remove('is-loading');
          btnText.textContent = originalText;
          spinner.hidden = true;
        });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    initTheme();
    initNavigation();

    const animations = createAnimationsController(prefersReducedMotion);
    animations.initRevealObserver();
    animations.initAnimationPause();
    animations.initDecorAnimations();

    initCursorGlow(prefersReducedMotion);
    initProfileImage();
    initContactForm();

    const typing = initTyping(prefersReducedMotion);

    function onReady() {
      animations.triggerPageAnimations();
    }

    if (document.getElementById('splash')) {
      initSplash(prefersReducedMotion, onReady);
    } else {
      onReady();
    }

    document.body.addEventListener('touchmove', function (e) {
      if (!e.target.closest('.screen, .app-main--page')) e.preventDefault();
    }, { passive: false });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) typing.pause();
      else typing.resume();
    });
  });
})();
