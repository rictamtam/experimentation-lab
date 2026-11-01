/* Console di configurazione (facoltativa).
   Genera un link che porta con sé la scelta di capitoli e casi.
   Non modifica i contenuti, non protegge nulla, non salva nulla sul server. */
(function () {
  'use strict';

  var S = window.SITE;
  var C = window.SiteConfig;
  if (!S || !C) { return; }

  var STORE_KEY = 'console-config-v1';
  var root;
  try { root = new URL('../', window.location.href); } catch (e) { return; }

  var chapterBoxes = {};
  var caseBoxes = {};
  var linkInput = document.getElementById('link-out');
  var targetSel = document.getElementById('target');
  var statusEl = document.getElementById('status');
  var rememberBox = document.getElementById('remember');
  var previewEl = document.getElementById('preview');
  var openLink = document.getElementById('open-preview');

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  function say(msg) { statusEl.textContent = msg; }

  function readBoxes() {
    var ch = [];
    var cs = [];
    C.allChapters.forEach(function (n) { if (chapterBoxes[n] && chapterBoxes[n].checked) { ch.push(n); } });
    C.allCases.forEach(function (id) { if (caseBoxes[id] && caseBoxes[id].checked) { cs.push(id); } });
    return C.build(ch, cs);
  }

  function writeBoxes(cfg) {
    C.allChapters.forEach(function (n) { chapterBoxes[n].checked = cfg.chapters.indexOf(n) !== -1; });
    C.allCases.forEach(function (id) { caseBoxes[id].checked = cfg.cases.indexOf(id) !== -1; });
  }

  function targetUrl(cfg) {
    var slug = targetSel.value;
    var u = new URL(slug ? slug + '/' : '', root);
    u.search = C.toQuery(cfg).slice(1);
    return u.href;
  }

  function syncTargets(cfg) {
    each(targetSel.options, function (opt) {
      var n = parseInt(opt.getAttribute('data-ch'), 10);
      opt.disabled = !!n && cfg.chapters.indexOf(n) === -1;
    });
    if (targetSel.options[targetSel.selectedIndex].disabled) { targetSel.value = ''; }
  }

  function renderPreview(cfg) {
    while (previewEl.firstChild) { previewEl.removeChild(previewEl.firstChild); }
    S.groups.forEach(function (g) {
      var inGroup = S.chapters.filter(function (c) { return c.group === g.id; });
      var anyOn = inGroup.some(function (c) { return cfg.chapters.indexOf(c.n) !== -1; });
      var li = document.createElement('li');
      var strong = document.createElement('strong');
      strong.textContent = g.label + (anyOn ? '' : ' (voce nascosta dal menu)');
      li.appendChild(strong);
      var ul = document.createElement('ul');
      inGroup.forEach(function (c) {
        var item = document.createElement('li');
        var on = cfg.chapters.indexOf(c.n) !== -1;
        item.textContent = (c.n < 10 ? '0' : '') + c.n + ' · ' + c.title + (on ? '' : ' — non inclusa');
        if (!on) { item.className = 'off'; }
        ul.appendChild(item);
      });
      li.appendChild(ul);
      previewEl.appendChild(li);
    });
  }

  function save(cfg) {
    try {
      if (rememberBox.checked) {
        window.localStorage.setItem(STORE_KEY, JSON.stringify({ c: cfg.chapters, s: cfg.cases }));
      } else {
        window.localStorage.removeItem(STORE_KEY);
      }
    } catch (e) { /* la memoria locale può non essere disponibile: nessun problema */ }
  }

  function refresh(announce) {
    var cfg = readBoxes();
    syncTargets(cfg);
    var url = targetUrl(cfg);
    linkInput.value = url;
    openLink.setAttribute('href', url);
    renderPreview(cfg);
    save(cfg);
    if (announce) {
      say(cfg.custom
        ? cfg.chapters.length + ' capitoli e ' + cfg.cases.length + ' casi inclusi. Il link è aggiornato.'
        : 'Versione completa: nessun parametro nel link.');
    }
  }

  function loadInitial() {
    var fromUrl = C.parse(window.location.search);
    if (fromUrl.custom) { return fromUrl; }
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        var obj = JSON.parse(raw);
        var q = '?c=' + String((obj.c || []).join('')) + '&s=' + String((obj.s || []).join(''));
        rememberBox.checked = true;
        return C.parse(q);
      }
    } catch (e) { /* ignora */ }
    return C.full();
  }

  function init() {
    each(document.querySelectorAll('input[data-chapter-box]'), function (b) {
      chapterBoxes[parseInt(b.getAttribute('data-chapter-box'), 10)] = b;
    });
    each(document.querySelectorAll('input[data-case-box]'), function (b) {
      caseBoxes[b.getAttribute('data-case-box')] = b;
    });

    writeBoxes(loadInitial());

    each(document.querySelectorAll('input[data-chapter-box]'), function (b) {
      b.addEventListener('change', function () {
        if (!C.allChapters.some(function (n) { return chapterBoxes[n].checked; })) {
          b.checked = true;
          say('Serve almeno un capitolo: l’ultimo non si può spegnere.');
          return;
        }
        refresh(true);
      });
    });
    each(document.querySelectorAll('input[data-case-box]'), function (b) {
      b.addEventListener('change', function () {
        if (!C.allCases.some(function (id) { return caseBoxes[id].checked; })) {
          b.checked = true;
          say('Serve almeno un caso: l’ultimo non si può spegnere.');
          return;
        }
        refresh(true);
      });
    });

    targetSel.addEventListener('change', function () { refresh(false); say('Pagina di arrivo aggiornata.'); });
    rememberBox.addEventListener('change', function () {
      refresh(false);
      say(rememberBox.checked ? 'Configurazione ricordata solo in questo browser.' : 'Memoria locale cancellata.');
    });

    document.getElementById('reset').addEventListener('click', function () {
      writeBoxes(C.full());
      targetSel.value = '';
      refresh(true);
    });

    document.getElementById('copy').addEventListener('click', function () {
      var text = linkInput.value;
      var done = function () { say('Link copiato.'); };
      var fallback = function () {
        linkInput.focus();
        linkInput.select();
        try { say(document.execCommand('copy') ? 'Link copiato.' : 'Seleziona il link e copialo a mano.'); }
        catch (e) { say('Seleziona il link e copialo a mano.'); }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
    });

    refresh(false);
  }

  init();
})();
