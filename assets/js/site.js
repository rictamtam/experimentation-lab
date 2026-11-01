/* Comportamento condiviso: menu, sottomenu, navigazione tra capitoli, indice di pagina
   e applicazione della configurazione scelta nella console.
   Nessuna libreria esterna. Nessun uso di innerHTML. */
(function () {
  'use strict';

  var S = window.SITE;
  var C = window.SiteConfig;
  if (!S || !C) { return; }

  var scriptEl = document.currentScript;
  var root;
  try {
    root = new URL('../../', scriptEl.src);
  } catch (e) {
    root = new URL('./', window.location.href);
  }

  var cfg = C.parse(window.location.search);
  var qs = C.toQuery(cfg);
  var body = document.body;
  var currentChapter = parseInt(body.getAttribute('data-chapter'), 10) || 0;
  var NUM_WORDS = ['nessun', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto'];

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function chapterEnabled(n) { return cfg.chapters.indexOf(n) !== -1; }
  function caseEnabled(id) { return cfg.cases.indexOf(id) !== -1; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function urlFor(slug) {
    var u = new URL(slug ? slug + '/' : '', root);
    u.search = qs ? qs.slice(1) : '';
    return u.href;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text) { node.textContent = text; }
    return node;
  }

  /* ---------- 1. Configurazione: visibilità ---------- */

  function applyVisibility() {
    each(document.querySelectorAll('[data-ch]'), function (node) {
      node.hidden = !chapterEnabled(parseInt(node.getAttribute('data-ch'), 10));
    });
    each(document.querySelectorAll('[data-case]'), function (node) {
      node.hidden = !caseEnabled(node.getAttribute('data-case'));
    });
    each(document.querySelectorAll('[data-group]'), function (node) {
      var group = node.getAttribute('data-group');
      var any = S.chapters.some(function (c) { return c.group === group && chapterEnabled(c.n); });
      node.hidden = !any;
    });
    each(document.querySelectorAll('[data-n]'), function (node) {
      var kind = node.getAttribute('data-n');
      var count = kind === 'cases' ? cfg.cases.length : cfg.chapters.length;
      node.textContent = NUM_WORDS[count] || String(count);
    });
    var first = S.chapters.filter(function (c) { return chapterEnabled(c.n); })[0];
    each(document.querySelectorAll('[data-first]'), function (a) {
      if (first) { a.setAttribute('href', urlFor(first.slug)); }
    });
  }

  function rewriteLinks() {
    if (!qs) { return; }
    each(document.querySelectorAll('a[href]'), function (a) {
      if (a.hasAttribute('data-nocfg')) { return; }
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(mailto:|tel:)/i.test(href)) { return; }
      var u;
      try { u = new URL(href, window.location.href); } catch (e) { return; }
      if (u.origin !== window.location.origin) { return; }
      if (u.pathname.indexOf(root.pathname) !== 0) { return; }
      if (/\/console\/?$/.test(u.pathname)) { return; }
      u.search = qs.slice(1);
      a.setAttribute('href', u.pathname + u.search + u.hash);
    });
  }

  function showBanner() {
    if (!cfg.custom) { return; }
    var banner = el('div', 'banner');
    banner.setAttribute('role', 'status');
    banner.appendChild(document.createTextNode(
      'Versione personalizzata di questo percorso: ' + cfg.chapters.length + ' capitoli su ' + C.allChapters.length +
      ', ' + cfg.cases.length + ' casi su ' + C.allCases.length + '. '
    ));
    var link = el('a', '', 'Vedi la versione completa');
    link.setAttribute('href', window.location.pathname);
    link.setAttribute('data-nocfg', '');
    banner.appendChild(link);
    var header = document.querySelector('.site-header');
    if (header && header.parentNode) { header.parentNode.insertBefore(banner, header.nextSibling); }
    else { body.insertBefore(banner, body.firstChild); }
  }

  function showDisabledNotice() {
    var main = document.getElementById('contenuto');
    if (!main) { return; }
    each(main.children, function (child) { child.hidden = true; });
    var box = el('div', 'notice');
    box.appendChild(el('h1', '', 'Questa sezione non è inclusa in questa versione'));
    box.appendChild(el('p', '', 'Chi ha condiviso il link ha scelto di presentare solo una parte del percorso. Il contenuto resta consultabile nella versione completa.'));
    var full = el('a', 'btn btn-solid', 'Vedi la versione completa');
    full.setAttribute('href', window.location.pathname);
    full.setAttribute('data-nocfg', '');
    var home = el('a', 'btn btn-outline', 'Torna all’inizio di questa versione');
    home.setAttribute('href', urlFor(''));
    var actions = el('p', 'hero-actions');
    actions.appendChild(full);
    actions.appendChild(document.createTextNode(' '));
    actions.appendChild(home);
    box.appendChild(actions);
    main.appendChild(box);
    each(document.querySelectorAll('.mobile-bar, [data-pager]'), function (n) { n.hidden = true; });
  }

  /* ---------- 2. Precedente / successivo ---------- */

  function sequence() {
    var seq = [{ n: 0, slug: '', title: 'Introduzione' }];
    S.chapters.forEach(function (c) { if (chapterEnabled(c.n)) { seq.push(c); } });
    return seq;
  }

  function buildPager() {
    if (!currentChapter) { return; }
    var seq = sequence();
    var idx = -1;
    seq.forEach(function (c, i) { if (c.n === currentChapter) { idx = i; } });
    if (idx === -1) { return; }
    var prev = seq[idx - 1];
    var next = seq[idx + 1];

    var holder = document.querySelector('[data-pager]');
    if (holder) {
      while (holder.firstChild) { holder.removeChild(holder.firstChild); }
      if (prev) { holder.appendChild(pagerCard(prev, 'prev', 'Precedente')); }
      if (next) { holder.appendChild(pagerCard(next, 'next', 'Successivo')); }
    }

    var bar = el('nav', 'mobile-bar');
    bar.setAttribute('aria-label', 'Navigazione tra i capitoli');
    bar.appendChild(barLink(prev, '←', 'Capitolo precedente'));
    var pos = el('span', 'pos', pad(idx) + ' / ' + pad(seq.length - 1));
    pos.setAttribute('aria-label', 'Capitolo ' + idx + ' di ' + (seq.length - 1));
    bar.appendChild(pos);
    bar.appendChild(barLink(next, '→', 'Capitolo successivo'));
    body.appendChild(bar);
  }

  function pagerCard(c, cls, label) {
    var a = el('a', cls);
    a.setAttribute('href', urlFor(c.slug));
    a.setAttribute('rel', cls === 'prev' ? 'prev' : 'next');
    a.appendChild(el('span', 'dir', (cls === 'prev' ? '← ' : '') + label + (cls === 'next' ? ' →' : '')));
    a.appendChild(el('span', 't', (c.n ? pad(c.n) + ' · ' : '') + c.title));
    return a;
  }

  function barLink(c, sign, label) {
    if (!c) {
      var off = el('span', 'off', sign);
      off.setAttribute('aria-hidden', 'true');
      return off;
    }
    var a = el('a', '', sign);
    a.setAttribute('href', urlFor(c.slug));
    a.setAttribute('aria-label', label + ': ' + c.title);
    return a;
  }

  /* ---------- 3. Menu e sottomenu ---------- */

  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  var groups = nav ? nav.querySelectorAll('.nav-group') : [];

  function closeGroups(except) {
    each(groups, function (g) {
      if (g === except) { return; }
      g.classList.remove('is-open');
      var b = g.querySelector('.nav-group-btn');
      if (b) { b.setAttribute('aria-expanded', 'false'); }
    });
  }

  function openGroup(g) {
    closeGroups(g);
    g.classList.add('is-open');
    g.querySelector('.nav-group-btn').setAttribute('aria-expanded', 'true');
  }

  function menuIsOpen() { return nav && nav.classList.contains('is-open'); }

  function setMenu(open) {
    if (!nav || !toggle) { return; }
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    var label = toggle.querySelector('.menu-toggle-label');
    if (label) { label.textContent = open ? 'Chiudi' : 'Menu'; }
    body.classList.toggle('menu-open', open);
    if (!open) { closeGroups(null); }
  }

  function initMenu() {
    if (!nav) { return; }
    each(groups, function (g) {
      var btn = g.querySelector('.nav-group-btn');
      if (!btn) { return; }
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        if (g.classList.contains('is-open')) {
          g.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          openGroup(g);
        }
      });
      g.addEventListener('focusout', function (ev) {
        if (menuIsOpen()) { return; }
        if (!ev.relatedTarget || !g.contains(ev.relatedTarget)) {
          g.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', function () { setMenu(!menuIsOpen()); });
    }

    document.addEventListener('click', function (ev) {
      if (!nav.contains(ev.target) && !(toggle && toggle.contains(ev.target))) {
        closeGroups(null);
      }
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        var open = nav.querySelector('.nav-group.is-open');
        if (open) {
          var b = open.querySelector('.nav-group-btn');
          closeGroups(null);
          if (b) { b.focus(); }
          ev.preventDefault();
          return;
        }
        if (menuIsOpen()) {
          setMenu(false);
          if (toggle) { toggle.focus(); }
          ev.preventDefault();
        }
        return;
      }
      if (ev.key === 'Tab' && menuIsOpen() && toggle) {
        var focusables = [toggle].concat(Array.prototype.slice.call(
          nav.querySelectorAll('a[href], button:not([disabled])')
        )).filter(function (n) { return n.offsetParent !== null; });
        if (!focusables.length) { return; }
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (ev.shiftKey && document.activeElement === first) { last.focus(); ev.preventDefault(); }
        else if (!ev.shiftKey && document.activeElement === last) { first.focus(); ev.preventDefault(); }
      }
    });

    var mq = window.matchMedia('(min-width: 901px)');
    var onChange = function () { if (mq.matches) { setMenu(false); } };
    if (mq.addEventListener) { mq.addEventListener('change', onChange); }
    else if (mq.addListener) { mq.addListener(onChange); }

    each(nav.querySelectorAll('a[href]'), function (a) {
      a.addEventListener('click', function () { if (menuIsOpen()) { setMenu(false); } });
    });
  }

  /* ---------- 4. Indice di pagina (evidenzia la sezione visibile) ---------- */

  function initToc() {
    var links = document.querySelectorAll('.toc a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) { return; }
    var map = {};
    each(links, function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && map[entry.target.id]) {
          each(links, function (a) { a.removeAttribute('aria-current'); });
          map[entry.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    each(document.querySelectorAll('.section[id]'), function (s) { observer.observe(s); });
  }

  /* ---------- Avvio ---------- */

  applyVisibility();
  rewriteLinks();
  showBanner();
  if (currentChapter && !chapterEnabled(currentChapter)) {
    showDisabledNotice();
  } else {
    buildPager();
  }
  initMenu();
  initToc();
})();
