(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const progress = $('#progressBar');
  const menuToggle = $('#menuToggle');
  const nav = $('.nav-links');
  const glow = $('.cursor-glow');
  $('#year').textContent = new Date().getFullYear();

  // Scroll progress + gentle cursor glow
  let rafPending = false;
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    rafPending = false;
  };
  addEventListener('scroll', () => {
    if (!rafPending) { requestAnimationFrame(updateScroll); rafPending = true; }
  }, { passive: true });
  updateScroll();

  if (matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', e => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    }, { passive: true });
  } else glow.style.display = 'none';

  // Reveal sections on entry; supports dynamic browser sizes.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('visible'));

  // Mobile navigation.
  menuToggle?.addEventListener('click', () => {
    const opened = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(opened));
    menuToggle.setAttribute('aria-label', opened ? 'Close menu' : 'Open menu');
  });
  $$('.nav-links a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));

  // 3D pointer tilt, disabled on touch / reduced motion.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (matchMedia('(pointer:fine)').matches && !reducedMotion) {
    $$('.tilt-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - .5;
        const y = (e.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(4px)`;
      });
      card.addEventListener('pointerleave', () => card.style.transform = '');
    });
    $$('.magnetic').forEach(button => {
      button.addEventListener('pointermove', e => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * .08}px, ${y * .12}px)`;
      });
      button.addEventListener('pointerleave', () => button.style.transform = '');
    });
  }

  // Keep background video lightweight and pause it when the tab is hidden.
  const videos = $$('video');
  document.addEventListener('visibilitychange', () => {
    videos.forEach(video => {
      if (document.hidden) video.pause();
      else if (!reducedMotion) video.play().catch(() => {});
    });
  });
  if (reducedMotion) {
    document.documentElement.classList.add('reduced-motion');
    videos.forEach(video => { video.pause(); video.removeAttribute('autoplay'); });
  }
})();
