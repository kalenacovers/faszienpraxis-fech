// ════════════════════════════════════════════════════════
//  Fech Puls — site behaviour (all pages)
//  Progressive enhancement: every block checks for its markup,
//  and every page stays fully usable without this file.
// ════════════════════════════════════════════════════════
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2,.7,.2,1)';

  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  // ── Footer year ─────────────────────────────────────────
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ── Mobile menu (<details>) ─────────────────────────────
  var menu = document.querySelector('.menu');
  if (menu) {
    document.addEventListener('click', function (e) {
      if (menu.open && !menu.contains(e.target)) menu.open = false;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    });
  }

  // ── Hover rows: one active row per group ────────────────
  $$('[data-hover-group]').forEach(function (group) {
    var items = $$('[data-hover-item]', group);
    items.forEach(function (item) {
      item.addEventListener('pointerenter', function () {
        items.forEach(function (i) { i.classList.toggle('is-active', i === item); });
      });
    });
  });

  // ── FAQ accordion: at most one answer open ──────────────
  var faqItems = $$('.faq__item');
  function syncFaq() {
    faqItems.forEach(function (item) {
      item.querySelector('.faq__q').setAttribute('aria-expanded', String(item.classList.contains('is-open')));
    });
  }
  faqItems.forEach(function (item) {
    item.querySelector('.faq__q').addEventListener('click', function () {
      var open = !item.classList.contains('is-open');
      faqItems.forEach(function (i) { i.classList.toggle('is-open', open && i === item); });
      syncFaq();
    });
  });
  syncFaq();

  // ── Certificate lightbox ────────────────────────────────
  var dialog = document.querySelector('.lightbox');
  var certs = $$('[data-cert]');
  if (dialog && typeof dialog.showModal === 'function' && certs.length) {
    var lbImg = dialog.querySelector('img');
    var lbTitle = dialog.querySelector('.lightbox__title');
    var current = 0;
    var show = function (i) {
      current = (i + certs.length) % certs.length;
      var cert = certs[current];
      lbImg.src = cert.getAttribute('href');
      lbImg.alt = cert.querySelector('img').alt;
      lbTitle.textContent = cert.querySelector('.cert__title').textContent;
    };
    certs.forEach(function (cert, i) {
      cert.addEventListener('click', function (e) {
        e.preventDefault();
        show(i);
        dialog.showModal();
      });
    });
    dialog.querySelector('[data-prev]').addEventListener('click', function () { show(current - 1); });
    dialog.querySelector('[data-next]').addEventListener('click', function () { show(current + 1); });
    dialog.querySelector('[data-close]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });
  }

  // ── Gutschein form → /api/gutschein ─────────────────────
  var form = document.getElementById('gutschein-form');
  if (form) initVoucherForm(form);

  function initVoucherForm(form) {
    var DRAFT_KEY = 'fp-gutschein-draft';
    var thanks = document.getElementById('gutschein-thanks');
    var errorBox = document.getElementById('gutschein-error');
    var genericError = errorBox.textContent;
    var submitBtn = form.querySelector('[type="submit"]');
    var totalEl = form.querySelector('[data-total]');
    var qty = form.elements.anzahl;

    function count() { return clamp(parseInt(qty.value, 10) || 1, 1, 20); }
    function updateTotal() {
      var checked = form.querySelector('input[name="dauer"]:checked');
      var price = checked ? Number(checked.dataset.price) : 100;
      totalEl.textContent = (price * count()).toLocaleString('de-DE') + ' €';
    }

    // Draft persistence: a reload (or a mobile tab eviction) never loses input.
    function saveDraft() {
      try {
        var data = {};
        new FormData(form).forEach(function (v, k) { if (k !== '_honey') data[k] = v; });
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      } catch (e) { /* storage unavailable */ }
    }
    function restoreDraft() {
      try {
        var data = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
        if (!data) return;
        Object.keys(data).forEach(function (k) {
          var field = form.elements[k];
          if (!field) return;
          if (field instanceof RadioNodeList) {
            $$('input[name="' + k + '"]', form).forEach(function (r) { r.checked = r.value === data[k]; });
          } else {
            field.value = data[k];
          }
        });
      } catch (e) { /* corrupt or unavailable draft */ }
    }
    function clearDraft() {
      try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* storage unavailable */ }
    }

    function showThanks() {
      clearDraft();
      form.hidden = true;
      errorBox.hidden = true;
      thanks.hidden = false;
      // The page just got shorter by the whole form; bring the message back into view.
      thanks.focus({ preventScroll: true });
      thanks.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    }
    function showError(msg) {
      errorBox.textContent = msg || genericError;
      errorBox.hidden = false;
      submitBtn.disabled = false;
    }

    $$('[data-step]', form).forEach(function (btn) {
      btn.addEventListener('click', function () {
        qty.value = clamp(count() + Number(btn.dataset.step), 1, 20);
        updateTotal();
        saveDraft();
      });
    });
    qty.addEventListener('change', function () { qty.value = count(); });
    form.addEventListener('input', function () { updateTotal(); saveDraft(); });
    form.addEventListener('change', function () { updateTotal(); saveDraft(); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      submitBtn.disabled = true;
      errorBox.hidden = true;

      var payload = {};
      new FormData(form).forEach(function (v, k) { payload[k] = v; });
      payload.anzahl = count();

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (body) { return { ok: r.ok, body: body }; });
        })
        .then(function (res) {
          if (res.ok && res.body.success) showThanks();
          else showError(res.body.error);
        })
        .catch(function () {
          showError('Keine Verbindung zum Server. Bitte Internetverbindung prüfen und erneut versuchen – oder telefonisch melden: 07424 960 609 9.');
        });
    });

    thanks.querySelector('[data-reset]').addEventListener('click', function () {
      form.reset();
      updateTotal();
      submitBtn.disabled = false;
      thanks.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });

    restoreDraft();
    updateTotal();

    // Result of a native (no-JS) submit: the API redirects to ?sent=1 / ?error=1.
    var params = new URLSearchParams(window.location.search);
    if (params.has('sent') || params.has('error')) {
      history.replaceState(null, '', window.location.pathname + '#bestellen');
      if (params.get('sent') === '1') {
        showThanks();
      } else {
        showError();
        errorBox.scrollIntoView({ block: 'center' });
      }
    }
  }

  // ════════════════════════════════════════════════════════
  //  Motion — skipped entirely for prefers-reduced-motion
  // ════════════════════════════════════════════════════════
  if (reduced) return;

  var main = document.querySelector('main');
  if (!main) return;

  // Scroll-driven effects share one rAF loop. Each effect exposes
  // update(dt) → true while it still needs frames.
  var effects = [];
  var running = false;
  function kick() {
    if (running) return;
    running = true;
    var last = performance.now();
    requestAnimationFrame(function frame(now) {
      var dt = Math.min(64, now - last);
      last = now;
      var busy = false;
      effects.forEach(function (fx) { if (fx(dt)) busy = true; });
      if (busy) requestAnimationFrame(frame);
      else running = false;
    });
  }
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  // Exponential smoothing toward a target, like a scrubbed timeline.
  function follow(cur, target, dt, seconds) {
    var next = cur + (target - cur) * (1 - Math.exp(-dt / (seconds * 300)));
    return Math.abs(target - next) < 0.001 ? target : next;
  }

  // Split an element's text nodes into word spans; keeps inline markup.
  function splitWords(el, wrap) {
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 1) { walk(n); return; }
        if (n.nodeType !== 3 || !n.data.trim()) return;
        var frag = document.createDocumentFragment();
        n.data.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var span = wrap(part);
          frag.appendChild(span.outer);
          words.push(span.inner);
        });
        n.parentNode.replaceChild(frag, n);
      });
    })(el);
    return words;
  }

  // ── H1 intro: words rise out of a mask ──────────────────
  var h1 = main.querySelector('h1');
  if (h1) {
    splitWords(h1, function (word) {
      var inner = document.createElement('span');
      inner.textContent = word;
      // A soft hyphen must stay breakable, so those words only fade.
      if (word.indexOf('­') !== -1) { inner.dataset.soft = '1'; return { outer: inner, inner: inner }; }
      var outer = document.createElement('span');
      outer.className = 'word-mask';
      outer.appendChild(inner);
      return { outer: outer, inner: inner };
    }).forEach(function (el, i) {
      var opts = { duration: 1100, delay: 150 + i * 70, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' };
      if (el.dataset.soft) el.animate([{ opacity: 0 }, { opacity: 1 }], opts);
      else el.animate([{ transform: 'translateY(115%)' }, { transform: 'none' }], opts);
    });
  }

  // ── Reveal: sections, grid tiles, list items, headings ──
  var targets = [];
  Array.prototype.slice.call(main.children).forEach(function (sec) {
    if (sec.hasAttribute('data-hero')) return;
    var kids = Array.prototype.slice.call(sec.children);
    if (getComputedStyle(sec).display === 'grid' && kids.length > 1) {
      kids.forEach(function (k, i) { targets.push({ el: k, delay: i * 90, dy: 28 }); });
    } else {
      targets.push({ el: sec, delay: 0, dy: 28 });
    }
    $$('ol > li, ul > li, article', sec).forEach(function (li, i) {
      if (kids.indexOf(li) === -1) targets.push({ el: li, delay: 120 + (i % 6) * 60, dy: 17 });
    });
    $$('h2', sec).forEach(function (h) { targets.push({ el: h, delay: 80, dy: 36 }); });
    $$('figure > img', sec).forEach(function (img) { targets.push({ el: img, zoom: true }); });
  });
  var byEl = new Map();
  targets.forEach(function (t) {
    // Content that starts hidden (e.g. the voucher thank-you) appears without a reveal.
    if (!t.el.getClientRects().length) return;
    byEl.set(t.el, t);
    if (!t.zoom) t.el.style.opacity = '0';
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var t = byEl.get(entry.target);
      io.unobserve(entry.target);
      if (t.zoom) {
        t.el.animate([{ scale: 1.07 }, { scale: 1 }], { duration: 1350, easing: EASE });
        return;
      }
      t.el.style.opacity = '';
      t.el.animate([
        { opacity: 0, translate: '0 ' + t.dy + 'px' },
        { opacity: 1, translate: '0 0' }
      ], { duration: 750, delay: t.delay, easing: EASE, fill: 'backwards' });
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  byEl.forEach(function (t, el) { io.observe(el); });

  // ── Text reveal: words brighten as the block scrolls through ──
  var texts = $$('h2, blockquote, p', main)
    .filter(function (el) {
      return el.getClientRects().length && (el.tagName !== 'P' || parseFloat(getComputedStyle(el).fontSize) >= 20);
    })
    .map(function (el) {
      var words = splitWords(el, function (word) {
        var s = document.createElement('span');
        s.textContent = word;
        s.style.opacity = '.18';
        return { outer: s, inner: s };
      });
      return { el: el, words: words, cur: -1, target: 0 };
    });
  effects.push(function (dt) {
    var vh = window.innerHeight;
    var busy = false;
    texts.forEach(function (t) {
      var r = t.el.getBoundingClientRect();
      // 0 when the top crosses 88% of the viewport, 1 when the bottom crosses 55%.
      t.target = clamp((vh * 0.88 - r.top) / (vh * 0.33 + r.height), 0, 1);
      if (t.cur < 0) t.cur = t.target;
      if (t.cur === t.target && t.painted) return;
      t.cur = follow(t.cur, t.target, dt, 0.6);
      var stagger = 0.08, span = 0.5, total = span + stagger * (t.words.length - 1);
      var time = t.cur * total;
      t.words.forEach(function (w, i) {
        w.style.opacity = (0.18 + 0.82 * clamp((time - i * stagger) / span, 0, 1)).toFixed(3);
      });
      t.painted = true;
      if (t.cur !== t.target) busy = true;
    });
    return busy;
  });

  // ── Hero image: slow zoom while scrolling past ──────────
  var hero = main.querySelector('[data-hero]');
  var heroImg = hero && hero.querySelector('img');
  if (heroImg) {
    var zoom = 0;
    effects.push(function (dt) {
      var target = clamp(window.scrollY / hero.offsetHeight, 0, 1);
      zoom = follow(zoom, target, dt, 0.4);
      heroImg.style.scale = (1 + 0.1 * zoom).toFixed(4);
      return zoom !== target;
    });
  }

  // ── Tile merge: card grids close up as they scroll in ───
  var merges = [];
  $$('section, ol, ul', main).forEach(function (el) {
    var cs = getComputedStyle(el);
    if (cs.display !== 'grid' || cs.alignItems === 'start') return;
    var kids = Array.prototype.slice.call(el.children);
    if (kids.length < 2) return;
    var tiles = kids.every(function (k) {
      var s = getComputedStyle(k);
      return parseFloat(s.borderTopLeftRadius) >= 14 && (s.backgroundColor !== 'rgba(0, 0, 0, 0)' || k.tagName === 'FIGURE');
    });
    if (!tiles) return;
    var r = parseFloat(getComputedStyle(kids[0]).borderTopLeftRadius);
    el.style.borderRadius = r + 'px';
    el.style.overflow = 'clip';
    merges.push({ el: el, kids: kids, r: r, gap: parseFloat(cs.columnGap) || 12, p: -1 });
  });
  effects.push(function () {
    var vh = window.innerHeight;
    // Read every position before writing any gap, so layout runs once.
    var tops = merges.map(function (m) { return m.el.getBoundingClientRect().top; });
    merges.forEach(function (m, i) {
      var x = clamp((vh * 0.85 - tops[i]) / (vh * 0.5), 0, 1);
      var p = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
      if (p === m.p) return;
      m.p = p;
      m.el.style.gap = Math.max(Math.min(m.gap, 6), m.gap * (1 - p * 0.5)) + 'px';
      var kr = (m.r * (1 - p * 0.7)).toFixed(1) + 'px';
      m.kids.forEach(function (k) { k.style.borderRadius = kr; });
    });
    return false;
  });

  // ── Magnetic circles follow the pointer ─────────────────
  if (window.matchMedia('(hover: hover)').matches) {
    $$('[data-magnetic]').forEach(function (el) {
      var target = el.querySelector('[data-magnetic-target]') || el;
      el.addEventListener('pointermove', function (e) {
        var b = el === target ? el.getBoundingClientRect() : target.getBoundingClientRect();
        target.style.translate = ((e.clientX - b.left - b.width / 2) * 0.25).toFixed(1) + 'px ' +
          ((e.clientY - b.top - b.height / 2) * 0.25).toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () { target.style.translate = ''; });
    });
  }

  kick();
  if (document.fonts) document.fonts.ready.then(kick);
})();
