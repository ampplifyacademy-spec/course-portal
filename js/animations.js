/* Motion layer for the whole site. Companion to css/animations.css.
   - scroll-reveal for every card / heading / section, including the ones that are
     rendered later from Firestore (MutationObserver)
   - top scroll-progress bar
   - hero mouse parallax
   Does nothing when the visitor has asked for reduced motion. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var root = document.documentElement;
  root.classList.add('js-anim');

  var TARGETS = [
    '.csection > h2', '.csection > .lead', '.section-label', '.partner-hero > *',
    '.module-card', '.service-card', '.plan-card', '.expertise-card', '.case-card', '.about-card',
    '.story-card', '.portfolio-card', '.folder-card', '.tool-card', '.partner-point', '.partner-form-card',
    '.proof', '.feedback-form-wrap', '.pricing-card', '.price-features > div', '.faq-wrap details',
    '.instructor-strip .inner', '.batch-card', '.stat-card', '.footer-col', '.footer-bottom',
    '.cta-band > *', '.booking-card', '.testimonial-row', '.video-review-wrap', '.back-link'
  ].join(',');
  var SKIP = '.testimonial-track, .video-review-track, [data-no-anim]';

  var io = new IntersectionObserver(function (entries) {
    var shown = entries.filter(function (e) { return e.isIntersecting; });
    // elements that scroll in together get a short stagger, in reading order
    shown.sort(function (a, b) {
      var ra = a.boundingClientRect, rb = b.boundingClientRect;
      return (ra.top - rb.top) || (ra.left - rb.left);
    });
    shown.forEach(function (e, i) {
      var el = e.target, delay = Math.min(i, 6) * 90;
      io.unobserve(el);
      el.style.setProperty('--d', delay + 'ms');
      el.classList.add('rv-in');
      if (el.tagName === 'H2') el.classList.add('h-in');
      // once it has settled, drop the reveal classes so hover transforms work normally again
      setTimeout(function () {
        el.classList.remove('rv', 'rv-in');
        el.style.removeProperty('--d');
      }, 750 + delay + 120);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 0px 0px' });

  function prep(el) {
    if (el.__rv || el.closest(SKIP)) return;
    el.__rv = true;
    el.classList.add('rv');
    io.observe(el);
  }

  function scan(node) {
    if (node.nodeType !== 1) return;
    if (node.matches(TARGETS)) prep(node);
    var found = node.querySelectorAll(TARGETS);
    for (var i = 0; i < found.length; i++) prep(found[i]);
  }

  scan(document.body);

  var pending = [], queued = false;
  new MutationObserver(function (records) {
    records.forEach(function (r) {
      r.addedNodes.forEach(function (n) { if (n.nodeType === 1) pending.push(n); });
    });
    if (queued || !pending.length) return;
    queued = true;
    requestAnimationFrame(function () {
      var batch = pending; pending = []; queued = false;
      batch.forEach(scan);
    });
  }).observe(document.body, { childList: true, subtree: true });

  // safety net: anything that is on screen must never stay hidden (tiny elements flush against the
  // very bottom of the page can miss the observer threshold). Runs after load and whenever scrolling stops.
  function revealVisible() {
    document.querySelectorAll('.rv:not(.rv-in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width && r.height && r.top < window.innerHeight && r.bottom > 0) {
        io.unobserve(el);
        el.classList.add('rv-in');
        if (el.tagName === 'H2') el.classList.add('h-in');
        setTimeout(function () { el.classList.remove('rv', 'rv-in'); el.style.removeProperty('--d'); }, 900);
      }
    });
  }
  setTimeout(revealVisible, 3000);
  var idleTimer;
  window.addEventListener('scroll', function () {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(revealVisible, 450);
  }, { passive: true });

  // scroll progress bar
  var bar = document.createElement('div');
  bar.id = 'scrollProgress';
  document.body.appendChild(bar);
  var ticking = false;
  function updateBar() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  updateBar();

  // hero parallax (mouse only)
  var hero = document.querySelector('.chero');
  if (hero && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      hero.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
    hero.addEventListener('pointerleave', function () {
      hero.style.setProperty('--mx', 0);
      hero.style.setProperty('--my', 0);
    });
  }
})();
