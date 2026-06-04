/* Ku dar kaydinta browser-ka (edit.html) config-ka asalka ah */
(function () {
  var key = document.documentElement.getAttribute('data-wedding-key') || 'index';
  var storageKey = 'wedding-cfg-' + key;

  function deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    Object.keys(source).forEach(function (k) {
      var sv = source[k];
      var tv = target[k];
      if (sv && typeof sv === 'object' && !Array.isArray(sv) && typeof tv === 'object' && !Array.isArray(tv)) {
        deepMerge(tv, sv);
      } else {
        target[k] = sv;
      }
    });
    return target;
  }

  function applyStoredConfig() {
    try {
      var raw = localStorage.getItem(storageKey);
      if (raw && typeof WEDDING_CONFIG !== 'undefined') {
        deepMerge(WEDDING_CONFIG, JSON.parse(raw));
      }
    } catch (e) { /* ignore */ }
  }

  applyStoredConfig();

  window.__weddingReady = Promise.resolve().then(function () {
    if (!window.WeddingStore) return;
    return WeddingStore.getObjectUrl('music-' + key).then(function (url) {
      if (url && typeof WEDDING_CONFIG !== 'undefined') WEDDING_CONFIG.music = url;
    });
  }).catch(function () {});
})();
