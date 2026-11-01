/* Lettura e scrittura della configurazione "capitoli + casi".
   La configurazione vive solo nell'indirizzo (parametri ?c= e ?s=).
   Non è un controllo di accesso: serve a personalizzare la presentazione. */
(function () {
  'use strict';

  var S = window.SITE;
  if (!S) { return; }

  var ALL_CHAPTERS = S.chapters.map(function (c) { return c.n; });
  var ALL_CASES = S.cases.map(function (c) { return c.id; });

  // Filtra la stringa ricevuta con un elenco di valori ammessi (allowlist), senza duplicati.
  function filterAllowed(raw, allowed, asNumber) {
    var seen = {};
    var out = [];
    if (typeof raw !== 'string') { return out; }
    for (var i = 0; i < raw.length && i < 32; i++) {
      var ch = raw.charAt(i);
      var val = asNumber ? parseInt(ch, 10) : ch.toUpperCase();
      if (allowed.indexOf(val) !== -1 && !seen[val]) {
        seen[val] = true;
        out.push(val);
      }
    }
    return out.sort(function (a, b) { return a > b ? 1 : (a < b ? -1 : 0); });
  }

  function parse(search) {
    var params;
    try { params = new URLSearchParams(search || ''); } catch (e) { params = new URLSearchParams(''); }
    var c = filterAllowed(params.get('c'), ALL_CHAPTERS, true);
    var s = filterAllowed(params.get('s'), ALL_CASES, false);
    if (!c.length) { c = ALL_CHAPTERS.slice(); }
    if (!s.length) { s = ALL_CASES.slice(); }
    return build(c, s);
  }

  function build(chapters, cases) {
    return {
      chapters: chapters,
      cases: cases,
      custom: chapters.length !== ALL_CHAPTERS.length || cases.length !== ALL_CASES.length
    };
  }

  function toQuery(cfg) {
    if (!cfg.custom) { return ''; }
    return '?c=' + cfg.chapters.join('') + '&s=' + cfg.cases.join('');
  }

  window.SiteConfig = {
    allChapters: ALL_CHAPTERS,
    allCases: ALL_CASES,
    parse: parse,
    build: build,
    toQuery: toQuery,
    full: function () { return build(ALL_CHAPTERS.slice(), ALL_CASES.slice()); }
  };
})();
