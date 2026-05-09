// ════════════════════════════════════════════════════════
//  Shared component loader — nav.html + footer.html
//  Fetches fragments, injects them, wires all behaviour.
// ════════════════════════════════════════════════════════

var REVIEW_COUNT = 185;

// ── helpers ──────────────────────────────────────────────
function fetchFragment(url) {
  return fetch(url).then(function (r) {
    if (!r.ok) throw new Error('Fragment ' + url + ' not found');
    return r.text();
  });
}

// ── NAV ──────────────────────────────────────────────────
function initNav(container, activePage) {
  var navEl = container.querySelector('body > nav, nav');
  var heroEl = document.querySelector('.hero');

  // Scroll state
  if (navEl && 'IntersectionObserver' in window && heroEl) {
    var obs = new IntersectionObserver(function (entries) {
      navEl.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px', threshold: 0 });
    obs.observe(heroEl);
  } else if (navEl) {
    var onScroll = function () {
      navEl.classList.toggle('is-scrolled', window.scrollY > 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    // On pages without a hero the nav is always scrolled
    if (!heroEl) navEl.classList.add('is-scrolled');
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
    hamburger.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

// ── FOOTER ───────────────────────────────────────────────
function initFooter(container) {
  // Patch review count placeholders injected by footer fragment
  container.querySelectorAll('[data-review-replace]').forEach(function (el) {
    el.textContent = el.textContent.replace(/\d+/, REVIEW_COUNT);
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
        if (t > now) return { date: t, day: d.getDay(), hh: s[0], mm: s[1], today: i === 0 };
      }
    }
    return null;
  }

  function updateHoursStatus() {
    var el = document.getElementById('hours-status');
    if (!el) return;
    var textEl = el.querySelector('.hours-status-text');
    var now = new Date();
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
          : (next.date.getDate() - now.getDate() === 1 ? 'morgen' : dayLabels[next.day]);
        textEl.innerHTML = 'Geschlossen — öffnet ' + when + ' um <strong>' + fmt(next.hh, next.mm) + ' Uhr</strong>';
      } else {
        textEl.textContent = 'Öffnungszeiten';
      }
    }
  }

  updateHoursStatus();
  setInterval(updateHoursStatus, 60000);
}

// ── Patch all data-review-replace on the base document ───
function patchReviewCount() {
  document.querySelectorAll('[data-review-replace]').forEach(function (el) {
    el.textContent = el.textContent.replace(/\d+/, REVIEW_COUNT);
  });
}

// ── Inject shared nav-active style ───────────────────────
(function () {
  var style = document.createElement('style');
  style.textContent = '.nav-links a.nav-active:not(.nav-cta){opacity:1}.nav-links a.nav-active:not(.nav-cta)::after{transform:scaleX(1)!important}';
  document.head.appendChild(style);
})();

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
      })
    );
  }

  if (footerPlaceholder) {
    promises.push(
      fetchFragment('footer.html').then(function (html) {
        footerPlaceholder.outerHTML = html;
        initFooter(document);
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
});
