// ════════════════════════════════════════════════════════
//  Shared component loader — nav.html + footer.html
//  Fetches fragments, injects them, wires all behaviour.
// ════════════════════════════════════════════════════════

var REVIEW_COUNT = 196;

// ── helpers ──────────────────────────────────────────────
function fetchFragment(url) {
  return fetch(url).then(function (r) {
    if (!r.ok) throw new Error('Fragment ' + url + ' not found');
    return r.text();
  });
}

// ── NAV ──────────────────────────────────────────────────
// The nav is solid by default (site.css). Only while it overlaps a
// photo hero (.hero on the home page) is it transparent.
function initNav(container, activePage) {
  var navEl = container.querySelector('.site-nav');
  var heroEl = document.querySelector('.hero');

  if (navEl && heroEl && 'IntersectionObserver' in window) {
    navEl.classList.add('is-over-hero');
    var obs = new IntersectionObserver(function (entries) {
      navEl.classList.toggle('is-over-hero', entries[0].isIntersecting);
    }, { rootMargin: '-96px 0px 0px 0px', threshold: 0 });
    obs.observe(heroEl);
  }

  // Active link
  if (activePage) {
    container.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.dataset.nav === activePage) {
        a.classList.add('nav-active');
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  // Hamburger
  var hamburger = container.querySelector('#hamburger');
  var mobileMenu = container.querySelector('#nav-mobile');

  if (hamburger && mobileMenu) {
    var closeMobileMenu = function (returnFocus) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('menu-open');
      document.body.style.overflow = '';
      if (returnFocus) hamburger.focus();
    };

    hamburger.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      // Body-Scroll sperren und schwebende Elemente ausblenden, solange das Menü offen ist
      document.documentElement.classList.toggle('menu-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileMenu(false);
      });
    });

    // Escape schließt das Menü und gibt den Fokus an den Hamburger zurück
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu(true);
      }
    });

    // Klick außerhalb von #nav-mobile und #hamburger schließt das Menü
    document.addEventListener('click', function (e) {
      if (!mobileMenu.classList.contains('open')) return;
      if (mobileMenu.contains(e.target) || hamburger.contains(e.target)) return;
      closeMobileMenu(false);
    });
  }
}

// ── FOOTER ───────────────────────────────────────────────
function initFooter(container) {
  // Patch review count placeholders injected by footer fragment
  container.querySelectorAll('[data-review-replace]').forEach(function (el) {
    el.textContent = el.textContent.replace(/\d+/, REVIEW_COUNT);
  });

  // Aktuelles Jahr in [data-year]-Platzhalter schreiben (footer.html nutzt <span data-year>)
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Hours strip live status
  var schedule = {
    1: [[8, 0, 11, 0], [15, 0, 18, 0]],
    2: [[8, 0, 11, 0], [15, 0, 18, 0]],
    3: [[9, 0, 13, 0]],
    4: [[15, 0, 19, 0]],
    5: [[9, 0, 13, 0]]
  };
  var dayLabels = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  function fmt(h, m) { return h + ':' + (m < 10 ? '0' + m : m); }

  function nextOpening(now) {
    for (var i = 0; i < 7; i++) {
      var d = new Date(now);
      d.setDate(d.getDate() + i);
      var slots = schedule[d.getDay()];
      if (!slots) continue;
      for (var j = 0; j < slots.length; j++) {
        var s = slots[j];
        var t = new Date(d);
        t.setHours(s[0], s[1], 0, 0);
        if (t > now) return { date: t, day: d.getDay(), hh: s[0], mm: s[1], today: i === 0, tomorrow: i === 1 };
      }
    }
    return null;
  }

  function updateHoursStatus() {
    var el = document.getElementById('hours-status');
    if (!el) return;
    var textEl = el.querySelector('.hours-status-text');
    // In Praxiszeit (Europe/Berlin) rechnen, nicht in Besucher-Zeitzone
    var now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
    var slots = schedule[now.getDay()];
    var isOpen = false;
    var closesAt = null;

    if (slots) {
      for (var i = 0; i < slots.length; i++) {
        var s = slots[i];
        var open = new Date(now); open.setHours(s[0], s[1], 0, 0);
        var close = new Date(now); close.setHours(s[2], s[3], 0, 0);
        if (now >= open && now < close) { isOpen = true; closesAt = { hh: s[2], mm: s[3] }; break; }
      }
    }

    if (isOpen) {
      el.setAttribute('data-open', 'true');
      textEl.innerHTML = 'Jetzt geöffnet <strong>bis ' + fmt(closesAt.hh, closesAt.mm) + ' Uhr</strong>';
    } else {
      el.setAttribute('data-open', 'false');
      var next = nextOpening(now);
      if (next) {
        var when = next.today ? 'heute'
          : (next.tomorrow ? 'morgen' : dayLabels[next.day]);
        textEl.innerHTML = 'Geschlossen — öffnet ' + when + ' um <strong>' + fmt(next.hh, next.mm) + ' Uhr</strong>';
      } else {
        textEl.textContent = 'Öffnungszeiten';
      }
    }
  }

  // Öffnungsstatus: falls lang.js geladen ist, komplett an dessen
  // (übersetzte, Europe/Berlin-basierte) updateHours delegieren, um doppelte
  // Timer und widersprüchliche Texte zu vermeiden. Sonst eigene Logik nutzen.
  if (window.fpLang && typeof window.fpLang.updateHours === 'function') {
    window.fpLang.updateHours();
  } else {
    updateHoursStatus();
    setInterval(updateHoursStatus, 60000);
  }
}

// ── Patch all data-review-replace on the base document ───
function patchReviewCount() {
  document.querySelectorAll('[data-review-replace]').forEach(function (el) {
    el.textContent = el.textContent.replace(/\d+/, REVIEW_COUNT);
  });
}

// ── Boot ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  // data-page on <body> or <html> identifies the active nav item
  var activePage = document.body.dataset.page || document.documentElement.dataset.page || '';

  var navPlaceholder = document.getElementById('site-nav');
  var footerPlaceholder = document.getElementById('site-footer');

  var base = document.querySelector('base');
  var prefix = base ? '' : '';  // fragments are root-relative; fetch resolves against document URL

  var promises = [];

  if (navPlaceholder) {
    promises.push(
      fetchFragment('nav.html').then(function (html) {
        navPlaceholder.outerHTML = html;
        // Re-query after DOM replacement
        initNav(document, activePage);
      }).catch(function () {
        // Fallback: Pflichtseiten müssen erreichbar bleiben, auch wenn das Fragment fehlt
        navPlaceholder.innerHTML =
          '<nav class="site-nav">' +
          '<a href="/" style="color:#fff;text-decoration:none">Fech Puls</a>' +
          '<ul class="nav-links">' +
          '<li><a href="/impressum">Impressum</a></li>' +
          '<li><a href="/datenschutz">Datenschutz</a></li>' +
          '</ul></nav>';
      })
    );
  }

  if (footerPlaceholder) {
    promises.push(
      fetchFragment('footer.html').then(function (html) {
        footerPlaceholder.outerHTML = html;
        initFooter(document);
      }).catch(function () {
        // Fallback: minimaler Footer mit erreichbaren Pflichtseiten
        footerPlaceholder.innerHTML =
          '<footer class="site-footer"><div class="footer-bottom">' +
          '<p>Faszienpraxis Fech · Spaichingen</p>' +
          '<nav class="footer-links" aria-label="Rechtliches">' +
          '<a href="/impressum">Impressum</a>' +
          '<a href="/datenschutz">Datenschutz</a>' +
          '</nav></div></footer>';
      })
    );
  }

  // Always patch review count in the base document too
  patchReviewCount();

  // FAQ accordion (index.html)
  var faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length) {
    function openFaqItem(item) {
      faqItems.forEach(function (el) {
        el.classList.remove('open');
        var b = el.querySelector('.faq-q');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      item.classList.add('open');
      var btn = item.querySelector('.faq-q');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }

    faqItems.forEach(function (item) {
      var btn = item.querySelector('.faq-q');
      if (!btn) return;
      btn.addEventListener('click', function () {
        if (item.classList.contains('open')) {
          item.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          openFaqItem(item);
        }
      });
    });

    function openFaqFromHash() {
      var hash = window.location.hash;
      if (!hash) return;
      var target = document.querySelector(hash);
      if (target && target.classList.contains('faq-item')) {
        openFaqItem(target);
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    openFaqFromHash();
    window.addEventListener('hashchange', openFaqFromHash);
  }

  // Scroll reveal (§28)
  initScrollReveal();
});

// ── SCROLL REVEAL (§28) ──────────────────────────────────
// Progressive enhancement: only tags <html> and hides elements when an
// IntersectionObserver is available and reduced-motion is NOT requested.
// Reveals once (16–24px rise, ~600ms, ~80ms stagger), then cleans itself up
// so per-element hover transitions are not affected.
function initScrollReveal() {
  var root = document.documentElement;
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Blocks below the fold that fade in once. Hero content uses .animate instead.
  var sel = '[data-reveal], .section-head, .reveal-group > *';
  var els = Array.prototype.slice.call(document.querySelectorAll(sel));
  if (!els.length) return;

  root.classList.add('js-reveal');
  els.forEach(function (el) { el.setAttribute('data-reveal', ''); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var sibs = el.parentElement
        ? Array.prototype.slice.call(el.parentElement.children).filter(function (c) {
            return c.hasAttribute && c.hasAttribute('data-reveal');
          })
        : [el];
      var idx = Math.max(0, sibs.indexOf(el));
      var delay = Math.min(idx, 6) * 80;
      el.style.transitionDelay = delay + 'ms';
      el.classList.add('is-in');
      io.unobserve(el);
      window.setTimeout(function () {
        el.style.transitionDelay = '';
        el.removeAttribute('data-reveal');
      }, 650 + delay);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  els.forEach(function (el) { io.observe(el); });
}
