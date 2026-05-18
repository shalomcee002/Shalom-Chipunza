/**
 * Portfolio — core interactions
 * Modules: Theme, Navigation, Forms, Animations, Toast
 */
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const currentPage = document.body.dataset.page || 'home';
  const isSpa = currentPage === 'home' && document.querySelectorAll('.screen').length > 1;

  const splash = document.getElementById('splash');
  const screens = document.querySelectorAll('.screen');
  const contactForm = document.getElementById('contact-form');
  const typingEl = document.getElementById('typing-text');
  const cursorGlow = document.getElementById('cursor-glow');

  const ROLES = [
    'AI Engineer',
    'Full Stack Developer',
    'IoT Innovator',
    'Security-aware Architect'
  ];

  let currentScreen = '';
  let typingIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingTimer = null;
  const STAGGER_MS = prefersReducedMotion ? 0 : 80;

  /* ========== Theme ========== */
  const THEME_KEY = 'portfolio-theme';

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    const resolved = theme === 'light' || theme === 'dark' ? theme : getSystemTheme();
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem(THEME_KEY, resolved);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = resolved === 'light' ? '#f1f5f9' : '#0b1220';
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.setAttribute('aria-label', resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    applyTheme(stored || 'dark');
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    });
  }

  initTheme();

  /* ========== Navigation ========== */
  function setActivePageNav(page) {
    document.querySelectorAll('[data-nav-page]').forEach(el => {
      const active = el.getAttribute('data-nav-page') === page;
      el.classList.toggle('active', active);
      if (el.classList.contains('nav-item') || el.classList.contains('desktop-nav-link')) {
        el.toggleAttribute('aria-current', active ? 'page' : false);
      }
    });
  }

  setActivePageNav(currentPage);

  function setActiveScreenNav(screenId) {
    document.querySelectorAll('.bottom-nav .nav-item, .desktop-nav-link').forEach(item => {
      const page = item.getAttribute('data-nav-page');
      const active = page === screenId;
      item.classList.toggle('active', active);
      item.toggleAttribute('aria-current', active ? 'page' : false);
    });
  }

  function navigateTo(screenId, options = {}) {
    if (!isSpa || !screenId) return;
    if (screenId === currentScreen && !options.force) return;
    const target = document.getElementById(screenId);
    if (!target) return;

    resetAnimations(currentScreen);
    currentScreen = screenId;
    screens.forEach(s => s.classList.toggle('active', s.id === screenId));
    setActiveScreenNav(screenId);
    setActivePageNav(screenId);
    if (!options.silent && 'vibrate' in navigator) navigator.vibrate(8);
    triggerAnimations(screenId);
    if (history.replaceState) {
      const base = window.location.pathname.split('/').pop() || 'index.html';
      history.replaceState(null, '', screenId === 'home' ? base : `${base}#${screenId}`);
    }
  }

  /* ========== Splash ========== */
  function hideSplash() {
    if (!splash) return;
    splash.classList.add('is-exiting');
    splash.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      splash.style.display = 'none';
      if (isSpa) navigateTo('home', { force: true, silent: true });
      else triggerPageAnimations();
    }, prefersReducedMotion ? 0 : 520);
  }

  if (splash) {
    const splashLogo = splash.querySelector('.splash-logo');
    if (splashLogo && !prefersReducedMotion) splashLogo.classList.add('is-animating');
    window.addEventListener('load', () => setTimeout(hideSplash, prefersReducedMotion ? 400 : 1400));
  } else {
    triggerPageAnimations();
  }

  /* ========== Typing ========== */
  function tickTyping() {
    if (!typingEl || prefersReducedMotion) {
      if (typingEl) typingEl.textContent = ROLES[0];
      return;
    }
    const current = ROLES[typingIndex];
    const speed = isDeleting ? 45 : 85;
    if (!isDeleting) {
      typingEl.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        typingTimer = setTimeout(() => { isDeleting = true; tickTyping(); }, 2200);
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

  if (typingEl) {
    if (prefersReducedMotion) {
      typingEl.textContent = ROLES.join(' · ');
      const cursor = document.querySelector('.typing-cursor');
      if (cursor) cursor.hidden = true;
    } else {
      tickTyping();
    }
  }

  if (isSpa) {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href').slice(1);
        if (!id || !document.getElementById(id)) return;
        e.preventDefault();
        navigateTo(id);
      });
    });
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash)) navigateTo(hash, { force: true, silent: true });
    window.addEventListener('hashchange', () => {
      const id = window.location.hash.slice(1);
      if (id && document.getElementById(id)) navigateTo(id, { force: true, silent: true });
    });
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea, select')) return;
      const idx = Number(e.key);
      if (idx === 1) navigateTo('home');
      if (idx === 2) window.location.href = 'projects.html';
      if (idx === 3) window.location.href = 'skills.html';
      if (idx === 4) navigateTo('about');
      if (idx === 5) navigateTo('contact');
    });
  }

  /* ========== Animations (IntersectionObserver) ========== */
  function triggerAnimations(screenId) {
    const screen = document.getElementById(screenId);
    if (!screen) return;
    screen.querySelectorAll('.animate-in:not(.visible)').forEach((el, index) => {
      setTimeout(() => el.classList.add('visible'), index * STAGGER_MS);
    });
    screen.querySelectorAll('.progress').forEach((bar, i) => {
      const width = bar.getAttribute('data-width');
      if (!width) return;
      bar.style.width = '0';
      setTimeout(() => { bar.style.width = width; }, prefersReducedMotion ? 0 : 250 + i * 100);
    });
  }

  function triggerPageAnimations() {
    const pageScreen = document.querySelector('.page-screen.active, .screen.active');
    if (pageScreen) triggerAnimations(pageScreen.id);
  }

  function resetAnimations(screenId) {
    const screen = document.getElementById(screenId);
    if (!screen) return;
    screen.querySelectorAll('.animate-in').forEach(el => el.classList.remove('visible'));
    screen.querySelectorAll('.progress').forEach(bar => { bar.style.width = '0'; });
  }

  function initRevealObserver() {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.animate-in').forEach(el => el.classList.add('visible'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('visible');
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-in').forEach(el => revealObserver.observe(el));
  }

  function initAnimationPause() {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

    const animSelectors = '.splash-logo.is-animating, .profile-img.is-animating, .profile-ring.is-animating, .hero-orb.is-animating';
    const pauseObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('anim-paused', !entry.isIntersecting);
      });
    }, { threshold: 0 });

    document.querySelectorAll(animSelectors).forEach(el => pauseObserver.observe(el));
  }

  function initDecorAnimations() {
    if (prefersReducedMotion) return;
    document.querySelector('.splash-logo')?.classList.add('is-animating');
    document.querySelector('.profile-img')?.classList.add('is-animating');
    document.querySelector('.profile-ring')?.classList.add('is-animating');
    document.querySelector('.hero-orb--2')?.classList.add('is-animating');
  }

  initRevealObserver();
  initAnimationPause();
  initDecorAnimations();

  /* ========== Profile image load ========== */
  const profileImg = document.querySelector('.profile-img');
  const profileSkeleton = document.getElementById('profile-skeleton');
  if (profileImg) {
    const onProfileReady = () => {
      profileImg.classList.add('is-loaded');
      if (profileSkeleton) profileSkeleton.classList.add('hidden');
    };
    if (profileImg.complete) onProfileReady();
    else {
      profileImg.addEventListener('load', onProfileReady);
      profileImg.addEventListener('error', onProfileReady);
    }
  }

  /* ========== Cursor glow ========== */
  if (cursorGlow && !prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let glowActive = false;
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
      if (!glowActive) {
        cursorGlow.classList.add('is-active');
        glowActive = true;
      }
    }, { passive: true });
    document.addEventListener('mouseleave', () => {
      cursorGlow.classList.remove('is-active');
      glowActive = false;
    });
  }

  /* ========== Toast ========== */
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}" aria-hidden="true"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  /* ========== Forms (filled / focused — no :has()) ========== */
  function initFormStates() {
    document.querySelectorAll('.floating-group').forEach(group => {
      const field = group.querySelector('input, textarea, select');
      if (!field) return;

      const updateFilled = () => {
        let filled = false;
        if (field.tagName === 'SELECT') filled = field.value !== '';
        else filled = field.value.trim() !== '';
        group.classList.toggle('filled', filled);
      };

      field.addEventListener('focus', () => group.classList.add('focused'));
      field.addEventListener('blur', () => group.classList.remove('focused'));
      field.addEventListener('input', updateFilled);
      field.addEventListener('change', updateFilled);
      updateFilled();
    });
  }

  initFormStates();

  if (contactForm) {
    const inputs = contactForm.querySelectorAll('input:not(.hp-field), textarea, select');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const messageField = contactForm.querySelector('#message');
    const charCounter = contactForm.querySelector('.char-counter');

    if (messageField && charCounter) {
      const minLen = parseInt(messageField.getAttribute('minlength'), 10) || 10;
      const updateCounter = () => {
        const len = messageField.value.length;
        charCounter.textContent = `${len} / ${minLen}+ characters`;
        charCounter.classList.toggle('is-valid', len >= minLen);
        charCounter.classList.toggle('is-invalid', len > 0 && len < minLen);
      };
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

    inputs.forEach(input => {
      input.addEventListener('input', () => validateInput(input));
      input.addEventListener('blur', () => validateInput(input));
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (contactForm.querySelector('.hp-field')?.value) return;

      let isFormValid = true;
      inputs.forEach(input => { if (!validateInput(input)) isFormValid = false; });

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

      try {
        const response = await fetch('contact.php', { method: 'POST', body: new FormData(contactForm) });
        const result = await response.json();
        if (result.success) {
          showToast(result.message, 'success');
          contactForm.reset();
          contactForm.querySelectorAll('.floating-group').forEach(g => {
            g.classList.remove('filled', 'success', 'error', 'focused');
          });
          if (charCounter) charCounter.textContent = '0 / 10+ characters';
          if ('vibrate' in navigator) navigator.vibrate([40, 20, 40]);
        } else {
          showToast(result.message || 'Failed to send message.', 'error');
        }
      } catch {
        showToast('A connection error occurred. Please try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
        btnText.textContent = originalText;
        spinner.hidden = true;
      }
    });
  }

  document.body.addEventListener('touchmove', (e) => {
    if (!e.target.closest('.screen, .app-main--page')) e.preventDefault();
  }, { passive: false });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && typingTimer) clearTimeout(typingTimer);
    else if (!document.hidden && typingEl && !prefersReducedMotion) tickTyping();
  });
});
