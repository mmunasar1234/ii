/* index.html — magacyada kaydsan */
(function () {
  var el = document.getElementById('coupleLine');
  var dateEl = document.getElementById('dateLine');
  if (!el) return;
  try {
    var cfg = JSON.parse(localStorage.getItem('wedding-cfg-index') || 'null');
    if (!cfg) return;
    el.textContent = (cfg.groom && cfg.groom.name) + ' & ' + (cfg.bride && cfg.bride.name);
    if (dateEl && cfg.date) dateEl.textContent = cfg.date;
  } catch (e) { /* */ }
})();
