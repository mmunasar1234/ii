/* Admin — edit.html */
window.WeddingEditor = (function () {
  var KEYS = ['index', 'naqsho2', 'naqsho3'];
  var PAGES = { index: 'classic.html', naqsho2: 'naqsho2.html', naqsho3: 'naqsho3.html' };
  var TEXT_IDS = [
    'splashSub', 'splashHint', 'heroSub', 'scrollHint', 'coupleSub', 'coupleTitle', 'groomRole', 'brideRole',
    'loveSub', 'loveTitle', 'loveQuote', 'loveSign', 'gallerySub', 'galleryTitle',
    'venueSub', 'venueTitle', 'venueBtn',
    'countdownSub', 'countdownTitle', 'countdownDays', 'countdownHours', 'countdownMins', 'countdownSecs',
    'rsvpSub', 'rsvpTitle', 'rsvpMessage', 'rsvpBtn', 'footerTag', 'waMessage'
  ];

  var configs = {};
  var currentKey = 'index';
  var saveTimer = null;

  function storageKey(k) { return 'wedding-cfg-' + k; }

  function $(id) { return document.getElementById(id); }

  function loadAll() {
    KEYS.forEach(function (k) {
      try {
        var s = localStorage.getItem(storageKey(k));
        configs[k] = s ? JSON.parse(s) : JSON.parse(JSON.stringify(window.__defaults[k]));
      } catch (e) {
        configs[k] = JSON.parse(JSON.stringify(window.__defaults[k]));
      }
      if (!configs[k].venue) configs[k].venue = JSON.parse(JSON.stringify(window.__defaults[k].venue || {}));
    });
  }

  function setStatus(msg, ok) {
    var el = $('status');
    if (!el) return;
    el.textContent = msg;
    el.style.color = ok ? '#90ee90' : 'var(--gold)';
    if (ok) setTimeout(function () { el.textContent = 'Diyaar'; el.style.color = 'var(--gold)'; }, 2200);
  }

  function showImgPreview(url, id) {
    var img = $(id);
    if (!img) return;
    if (url && (url.indexOf('http') === 0 || url.indexOf('data:') === 0)) {
      img.src = url;
      img.hidden = false;
    } else img.hidden = true;
  }

  function compressImage(file, cb) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 900, w = img.width, h = img.height;
        if (w > max || h > max) {
          if (w > h) { h = Math.round(h * max / w); w = max; }
          else { w = Math.round(w * max / h); h = max; }
        }
        var cv = document.createElement('canvas');
        cv.width = w;
        cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        cb(cv.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function renderGallery(urls) {
    var list = $('galleryList');
    if (!list) return;
    list.innerHTML = '';
    (urls.length ? urls : ['']).forEach(function (url, i) {
      var row = document.createElement('div');
      row.className = 'gallery-item';
      var inp = document.createElement('input');
      inp.type = 'url';
      inp.value = url || '';
      inp.placeholder = 'Sawir ' + (i + 1);
      var file = document.createElement('input');
      file.type = 'file';
      file.accept = 'image/*';
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'btn btn-outline';
      rm.style.cssText = 'color:#999;padding:0.35rem 0.5rem';
      rm.textContent = '×';
      rm.onclick = function () { row.remove(); };
      file.onchange = function (e) {
        compressImage(e.target.files[0], function (data) { inp.value = data; });
      };
      row.appendChild(inp);
      row.appendChild(file);
      row.appendChild(rm);
      list.appendChild(row);
    });
  }

  function cfgToForm() {
    var c = configs[currentKey];
    $('groomName').value = c.groom.name || '';
    $('groomQuote').value = c.groom.quote || '';
    $('brideName').value = c.bride.name || '';
    $('brideQuote').value = c.bride.quote || '';
    $('dateText').value = c.date || '';
    $('dateISO').value = (c.dateISO || '').slice(0, 16);
        $('whatsapp').value = c.whatsapp || '';
        var ps = $('publicSiteUrl');
        if (ps) ps.value = localStorage.getItem('wedding-public-url') || '';
    $('heroImage').value = c.heroImage || '';
    $('groomPhoto').value = c.groom.photo || '';
    $('bridePhoto').value = c.bride.photo || '';
    $('musicUrl').value = c.music && c.music.indexOf('blob:') !== 0 ? c.music : '(uploaded)';
    if (!c.venue) c.venue = {};
    $('venueName').value = c.venue.name || '';
    $('venueAddress').value = c.venue.address || '';
    $('venueTime').value = c.venue.time || '';
    $('venueMapUrl').value = c.venue.mapUrl || '';
    TEXT_IDS.forEach(function (id) {
      var el = $(id);
      if (!el) return;
      if (id === 'venueBtn') el.value = (c.texts && c.texts.venueBtn) || '';
      else if (c.texts) el.value = c.texts[id] || '';
    });
    showImgPreview(c.heroImage, 'prevHero');
    showImgPreview(c.groom.photo, 'prevGroom');
    showImgPreview(c.bride.photo, 'prevBride');
    renderGallery(c.gallery || []);
    updatePreviewLinks();
    refreshIframe();
    if ($('musicStatus')) $('musicStatus').textContent = '';
    if ($('musicPreview')) $('musicPreview').hidden = true;
  }

  function formToCfg() {
    var c = configs[currentKey];
    c.groom.name = $('groomName').value.trim();
    c.groom.quote = $('groomQuote').value.trim();
    c.bride.name = $('brideName').value.trim();
    c.bride.quote = $('brideQuote').value.trim();
    c.date = $('dateText').value.trim();
    var iso = $('dateISO').value;
    c.dateISO = iso ? iso + ':00' : c.dateISO;
    c.whatsapp = $('whatsapp').value.trim().replace(/\D/g, '');
    c.heroImage = $('heroImage').value.trim();
    c.groom.photo = $('groomPhoto').value.trim();
    c.bride.photo = $('bridePhoto').value.trim();
    var mu = $('musicUrl').value.trim();
    if (mu && mu !== '(uploaded)') c.music = mu;
    if (!c.venue) c.venue = {};
    c.venue.name = $('venueName').value.trim();
    c.venue.address = $('venueAddress').value.trim();
    c.venue.time = $('venueTime').value.trim();
    c.venue.mapUrl = $('venueMapUrl').value.trim();
    if (!c.texts) c.texts = {};
    TEXT_IDS.forEach(function (id) {
      var el = $(id);
      if (el) c.texts[id] = el.value.trim();
    });
    c.gallery = [];
    document.querySelectorAll('#galleryList input[type=url]').forEach(function (inp) {
      var v = inp.value.trim();
      if (v) c.gallery.push(v);
    });
    return c;
  }

  function applySync(data, targetKey) {
    var target = configs[targetKey];
    var music = target.music;
    var syncCore = $('syncCore') && $('syncCore').checked;
    var syncFull = $('syncFull') && $('syncFull').checked;

    if (syncFull) {
      configs[targetKey] = JSON.parse(JSON.stringify(data));
      configs[targetKey].music = music;
      return;
    }
    if (syncCore) {
      target.groom = JSON.parse(JSON.stringify(data.groom));
      target.bride = JSON.parse(JSON.stringify(data.bride));
      target.date = data.date;
      target.dateISO = data.dateISO;
      target.whatsapp = data.whatsapp;
      target.venue = JSON.parse(JSON.stringify(data.venue || {}));
      if (target.texts && data.texts) {
        target.texts.venueSub = data.texts.venueSub;
        target.texts.venueTitle = data.texts.venueTitle;
        target.texts.venueBtn = data.texts.venueBtn;
      }
    }
  }

  function save() {
    formToCfg();
    var data = configs[currentKey];
    var syncCore = $('syncCore') && $('syncCore').checked;
    var syncFull = $('syncFull') && $('syncFull').checked;
    var keys = (syncCore || syncFull) ? KEYS : [currentKey];

        var pub = $('publicSiteUrl');
        if (pub && pub.value.trim()) localStorage.setItem('wedding-public-url', pub.value.trim());

        keys.forEach(function (k) {
          if (k !== currentKey && (syncCore || syncFull)) applySync(data, k);
          localStorage.setItem(storageKey(k), JSON.stringify(configs[k]));
        });
        setStatus('Waa la kaydiyay!', true);
    refreshIframe();
  }

  function scheduleAutoSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      formToCfg();
      localStorage.setItem(storageKey(currentKey), JSON.stringify(configs[currentKey]));
      setStatus('Auto-kaydin…', true);
    }, 1500);
  }

  function updatePreviewLinks() {
    var el = $('previewLinks');
    if (!el) return;
    var p = PAGES[currentKey];
    el.innerHTML = '<a href="' + p + '" target="_blank">Fur ' + p + '</a> · <a href="qr.html?page=' + p + '">Barcode</a>';
  }

  function refreshIframe() {
    var fr = $('livePreview');
    if (!fr) return;
    fr.src = PAGES[currentKey] + '?t=' + Date.now();
  }

  function init() {
    loadAll();
    var params = new URLSearchParams(location.search);
    var pre = params.get('design');
    if (pre && KEYS.indexOf(pre) >= 0) {
      currentKey = pre;
      $('designPick').value = pre;
    }
    cfgToForm();

    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.onclick = function () {
        document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
        document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
        tab.classList.add('active');
        $('panel-' + tab.dataset.tab).classList.add('active');
      };
    });

    $('designPick').onchange = function () {
      formToCfg();
      currentKey = $('designPick').value;
      cfgToForm();
    };

    $('btnSave').onclick = save;
    $('btnSave2').onclick = save;
    $('btnRefreshPreview').onclick = refreshIframe;

    $('btnAddGallery').onclick = function () {
      var list = $('galleryList');
      if (list.children.length >= 8) return;
      var urls = [];
      list.querySelectorAll('input[type=url]').forEach(function (i) { urls.push(i.value); });
      urls.push('');
      renderGallery(urls);
    };

    document.querySelectorAll('input[data-target]').forEach(function (inp) {
      inp.onchange = function (e) {
        compressImage(e.target.files[0], function (data) {
          $(inp.dataset.target).value = data;
          showImgPreview(data, inp.dataset.preview);
          scheduleAutoSave();
        });
      };
    });

    ['heroImage', 'groomPhoto', 'bridePhoto'].forEach(function (id) {
      $(id).oninput = function () {
        showImgPreview(this.value, id === 'heroImage' ? 'prevHero' : id === 'groomPhoto' ? 'prevGroom' : 'prevBride');
        scheduleAutoSave();
      };
    });

    document.querySelector('.wrap').addEventListener('input', scheduleAutoSave);
    document.querySelector('.wrap').addEventListener('change', scheduleAutoSave);

    $('musicFile').onchange = function (e) {
      var file = e.target.files[0];
      if (!file || !window.WeddingStore) return;
      WeddingStore.put('music-' + currentKey, file).then(function () {
        $('musicStatus').textContent = 'Muusig: ' + file.name;
        var aud = $('musicPreview');
        aud.src = URL.createObjectURL(file);
        aud.hidden = false;
        $('musicUrl').value = '(uploaded)';
        save();
      });
    };

    $('btnExport').onclick = function () {
      formToCfg();
      var blob = new Blob([JSON.stringify(configs[currentKey], null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'martiqaad-' + currentKey + '.json';
      a.click();
    };

    $('btnExportAll').onclick = function () {
      formToCfg();
      var blob = new Blob([JSON.stringify({ index: configs.index, naqsho2: configs.naqsho2, naqsho3: configs.naqsho3 }, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'martiqaad-dhammaan.json';
      a.click();
    };

    $('importFile').onchange = function (e) {
      var f = e.target.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (data.index || data.naqsho2) {
            KEYS.forEach(function (k) { if (data[k]) configs[k] = data[k]; });
          } else {
            configs[currentKey] = data;
          }
          cfgToForm();
          setStatus('JSON la soo geliyay — Kaydi!', true);
        } catch (err) { setStatus('JSON khaldan', false); }
      };
      reader.readAsText(f);
    };

    $('btnReset').onclick = function () {
      if (!confirm('Dib u celi default naqshaddan?')) return;
      configs[currentKey] = JSON.parse(JSON.stringify(window.__defaults[currentKey]));
      localStorage.removeItem(storageKey(currentKey));
      if (window.WeddingStore) WeddingStore.remove('music-' + currentKey);
      cfgToForm();
      setStatus('Default dib loo celiyay', true);
    };
  }

  return { init: init };
})();
