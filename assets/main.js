(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Theme (light by default) ---------- */
  var toggle = $('.theme-toggle');
  function syncToggle() {
    toggle.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  toggle.addEventListener('click', function () {
    var dark = root.dataset.theme !== 'dark';
    if (dark) root.dataset.theme = 'dark'; else delete root.dataset.theme;
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
    syncToggle();
  });
  syncToggle();

  /* ---------- Scroll progress ---------- */
  var bar = $('.progress');
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Toast + copy email ---------- */
  var toast = $('.toast'), toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }
  $$('.js-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.dataset.copy;
      var done = function () { showToast('Email copied ✓'); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { location.href = 'mailto:' + text; });
      } else {
        location.href = 'mailto:' + text;
      }
    });
  });

  /* ---------- Split the name into bouncy letters ---------- */
  var nameEl = $('[data-split]');
  var nameText = nameEl.textContent.trim();
  nameEl.setAttribute('aria-label', nameText);
  nameEl.innerHTML = nameText.split('').map(function (c) {
    return c === ' ' ? '<span class="sp" aria-hidden="true"> </span>' : '<span class="ch" aria-hidden="true">' + c + '</span>';
  }).join('');

  /* ---------- Typewriter ---------- */
  function typeLoop(el, messages, hold) {
    var i = 0, timer;
    function show(msg, cb) {
      var n = 0;
      (function tick() {
        el.textContent = msg.slice(0, ++n);
        timer = setTimeout(n < msg.length ? tick : cb, n < msg.length ? 38 : hold);
      })();
    }
    function next() { i = (i + 1) % messages.length; show(messages[i], next); }
    show(messages[0], next);
    return { skip: function () { clearTimeout(timer); next(); } };
  }

  var bubble = typeLoop($('.bubble-text'), [
    'All systems green ✓',
    'Pager quiet. Coffee hot.',
    'MTTD down 60%',
    'RTO down 70%',
    '99.9% uptime, as usual',
    'Runbook? Already written.',
    'p99 latency: chill'
  ], 2400);

  /* ---------- Mascot: eyes follow the pointer, hop on click ---------- */
  var mascot = $('.mascot');
  var pupils = $$('.m-pupil');
  var eyes = $$('[data-eye] .m-eyeball');
  var px = 0, py = 0, raf = 0;
  function lookAt() {
    raf = 0;
    eyes.forEach(function (eye, k) {
      var r = eye.getBoundingClientRect();
      var dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
      var a = Math.atan2(dy, dx), d = Math.min(7, Math.hypot(dx, dy) / 30);
      pupils[k].style.transform = 'translate(' + (Math.cos(a) * d).toFixed(2) + 'px,' + (Math.sin(a) * d).toFixed(2) + 'px)';
    });
  }
  addEventListener('pointermove', function (e) {
    px = e.clientX; py = e.clientY;
    if (!raf) raf = requestAnimationFrame(lookAt);
  }, { passive: true });

  mascot.addEventListener('click', function () {
    mascot.classList.remove('jump');
    void mascot.getBoundingClientRect();
    mascot.classList.add('jump');
    bubble.skip();
  });

  /* ---------- Draggable stickers ---------- */
  var hint = $('.drag-hint');
  $$('.sticker').forEach(function (s) {
    var ox = 0, oy = 0, sx, sy, active = false;
    s.addEventListener('pointerdown', function (e) {
      active = true; sx = e.clientX - ox; sy = e.clientY - oy;
      s.setPointerCapture(e.pointerId);
      s.classList.add('dragging');
      if (hint) hint.style.opacity = '0';
    });
    s.addEventListener('pointermove', function (e) {
      if (!active) return;
      ox = e.clientX - sx; oy = e.clientY - sy;
      s.style.translate = ox + 'px ' + oy + 'px';
    });
    var end = function () { active = false; s.classList.remove('dragging'); };
    s.addEventListener('pointerup', end);
    s.addEventListener('pointercancel', end);
  });

  /* ---------- Confetti on resume download ---------- */
  var colors = ['#E2B4BD', '#F7D6D0', '#FFF5F5', '#4A4A4A', '#FFFFFF'];
  $$('.js-confetti').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showToast('Resume on its way ↓');
      if (!window.gsap) return;
      var r = btn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      for (var i = 0; i < 26; i++) {
        var p = document.createElement('span');
        p.className = 'confetti';
        p.style.left = cx + 'px'; p.style.top = cy + 'px';
        p.style.background = colors[i % colors.length];
        document.body.appendChild(p);
        gsap.timeline({ onComplete: p.remove.bind(p) })
          .to(p, { x: gsap.utils.random(-170, 170), y: gsap.utils.random(-220, -70), rotation: gsap.utils.random(-360, 360), duration: .55, ease: 'power2.out' })
          .to(p, { y: '+=' + gsap.utils.random(160, 300), opacity: 0, rotation: '+=180', duration: .9, ease: 'power1.in' });
      }
    });
  });

  /* ---------- Incident tabs ---------- */
  var tabs = $$('.tab');
  function animateEpisode(panel) {
    if (!window.gsap) return;
    var m = reduce ? 0 : 1;
    gsap.from($$('.panel', panel), { y: 40 * m, opacity: 0, rotation: -4 * m, stagger: .1, duration: .6, ease: m ? 'back.out(1.8)' : 'power1.out', clearProps: 'transform,opacity' });
    gsap.from($('.stamp', panel), { scale: m ? 3 : 1, opacity: 0, rotation: 10 * m, delay: .6, duration: .45, ease: m ? 'back.out(2.5)' : 'power1.out', clearProps: 'transform,opacity' });
    gsap.from($('.moral', panel), { y: 20 * m, opacity: 0, delay: .5, duration: .5, ease: m ? 'back.out(2)' : 'power1.out', clearProps: 'transform,opacity' });
  }
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    animateEpisode(document.getElementById(tab.getAttribute('aria-controls')));
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { if (t.getAttribute('aria-selected') !== 'true') selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (k === undefined) return;
      e.preventDefault();
      selectTab(tabs[(k + tabs.length) % tabs.length], true);
    });
  });

  /* ---------- Active nav link ---------- */
  var links = $$('.nav-links a');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Pager ---------- */
  var pager = $('.pager'), pagerStarted = false;
  function startPager() {
    if (pagerStarted) return;
    pagerStarted = true;
    pager.classList.add('buzz');
    typeLoop($('.pager-text'), [
      'NEW PAGE ▸ hire an SRE?',
      'SEV: none ▸ all green',
      'REPLY ▸ mahendranmaahin007@gmail.com'
    ], 2600);
  }

  /* =========================================================
     GSAP — motion only; the page is complete without it.
     With reduced motion, things fade in place instead of flying.
     ========================================================= */
  if (!window.gsap || !window.ScrollTrigger) { startPager(); return; }
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('gsap');
  var M = reduce ? 0 : 1; // scales every movement distance

  // Pager starts when it scrolls into view.
  ScrollTrigger.create({ trigger: pager, start: 'top 85%', once: true, onEnter: startPager });

  // Counters tick up once they come into view.
  $$('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0), suf = el.dataset.suffix || '';
    var fmt = function (v) { return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; };
    var o = { v: 0 };
    el.textContent = fmt(0);
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: function () { gsap.to(o, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: function () { el.textContent = fmt(o.v); } }); }
    });
  });

  // Hero entrance.
  var squiggle = $('.squiggle path'), len = squiggle.getTotalLength();
  gsap.set(squiggle, { strokeDasharray: len, strokeDashoffset: len });
  gsap.set('.name .ch, .sticker-in', { transition: 'none' });
  gsap.timeline({ defaults: { ease: M ? 'back.out(1.8)' : 'power1.out' } })
    .from('.name .ch', { yPercent: 120 * M, opacity: 0, rotation: function () { return gsap.utils.random(-30, 30) * M; }, stagger: .04, duration: .7, clearProps: 'transform,opacity,transition' })
    .from('[data-hero]', { y: 26 * M, opacity: 0, stagger: .08, duration: .6, clearProps: 'transform,opacity' }, '-=.45')
    .to(squiggle, { strokeDashoffset: 0, duration: .8, ease: 'power2.inOut' }, '-=.2')
    .from('.mascot', { scale: M ? .6 : 1, opacity: 0, transformOrigin: '50% 90%', duration: .8, ease: M ? 'elastic.out(1, .55)' : 'power1.out' }, .2)
    .from('.bubble', { scale: M ? 0 : 1, opacity: 0, transformOrigin: '20% 100%', duration: .5 }, .7)
    .from('.sticker-in', { scale: M ? 0 : 1, opacity: 0, stagger: .08, duration: .5, ease: M ? 'back.out(3)' : 'power1.out', clearProps: 'transform,opacity,transition' }, .6)
    .from('.blob', { scale: M ? 0 : 1, opacity: 0, duration: 1.2, ease: M ? 'elastic.out(1, .5)' : 'power1.out' }, 0);

  // Generic pop-in for everything marked data-reveal.
  gsap.set('[data-reveal]', { y: 50 * M, opacity: 0, transition: 'none' });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: function (els) {
      gsap.to(els, { y: 0, opacity: 1, stagger: .08, duration: .7, ease: M ? 'back.out(1.6)' : 'power1.out', clearProps: 'transform,opacity,transition' });
    }
  });

  // Receipt "prints" line by line.
  gsap.timeline({ scrollTrigger: { trigger: '[data-receipt]', start: 'top 80%', once: true } })
    .from('[data-receipt]', { yPercent: -12 * M, opacity: 0, rotation: -4 * M, duration: .7, ease: M ? 'back.out(1.6)' : 'power1.out', clearProps: 'transform,opacity' })
    .from('[data-receipt] .r-items > div, [data-receipt] .r-total', { x: -14 * M, opacity: 0, stagger: .07, duration: .3, clearProps: 'transform,opacity' }, '-=.3');

  // Career road draws itself as you scroll.
  gsap.fromTo('.road-fg', { scaleY: 0 }, {
    scaleY: 1, transformOrigin: '50% 0%', ease: 'none',
    scrollTrigger: { trigger: '.road', start: 'top 70%', end: 'bottom 70%', scrub: .6 }
  });

  // First episode animates when the section arrives.
  ScrollTrigger.create({ trigger: '#incidents .strip', start: 'top 80%', once: true, onEnter: function () { animateEpisode($('.episode:not([hidden])')); } });

  if (reduce) return; // everything below is large, continuous movement

  // Marquee bands loop forever; scrolling speeds them up and flips their direction.
  var bands = $$('.band-track').map(function (track, i) {
    var tw = gsap.fromTo(track, { xPercent: i ? -50 : 0 }, { xPercent: i ? 0 : -50, duration: i ? 42 : 34, ease: 'none', repeat: -1 });
    tw.totalTime(tw.duration() * 100); // head start so reversing never hits time zero
    return tw;
  });
  ScrollTrigger.create({
    onUpdate: function (self) {
      var dir = self.direction;
      var boost = dir * (1 + Math.min(Math.abs(self.getVelocity()) / 250, 6));
      bands.forEach(function (tw) {
        gsap.to(tw, { timeScale: boost, duration: .2, overwrite: true });
        gsap.to(tw, { timeScale: dir, duration: 1.2, delay: .3, ease: 'power2.out' });
      });
    }
  });

  // Parallax on hero blobs.
  gsap.to('.blob-a', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.blob-b', { yPercent: -60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
})();
