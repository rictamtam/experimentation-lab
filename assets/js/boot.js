/* Segnala subito che JavaScript è disponibile, prima del primo disegno della pagina. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
})();
