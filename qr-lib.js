/* Barcode Code 128 — scan telefoon → toos u fur link https */
(function (global) {
  var PATTERNS = [
    '11011001100','11001101100','11001100110','10010011000','10010001100','10001001100','10011001000','10011000100','10001100100','11001001000',
    '11001000100','11000100100','10110011100','10011011100','10011001110','10111001100','10011101100','10011100110','11001110010','11001011100',
    '11001001110','11011100100','11001110100','11101101110','11101001100','11100101100','11100100110','11101100100','11100110100','11100110010',
    '11011011000','11011000110','11000110110','10100011000','10001011000','10001000110','10110001000','10001101000','10001100010','11010001000',
    '11000101000','11000100010','10110111000','10110001110','10001101110','10111011000','10111000110','10001110110','11101110110','11010001110',
    '11000101110','11011101000','11011100010','11011101110','11101011000','11101000110','11100010110','11101101000','11101100010','11100011010',
    '11101111010','11001000010','11110001010','10100110000','10100001100','10010110000','10010000110','10000101100','10000100110','10110010000',
    '10110000100','10011010000','10011000010','10000110100','10000110010','11000010010','11001010000','11110111010','11000010100','10001111010',
    '10100111100','10010111100','10010011110','10111100100','10011110100','10011110010','11110100100','11110010100','11110010010','11011011110',
    '11011110110','11110110110','10101111000','10100011110','10001011110','10111101000','10111100010','11110101000','11110100010','10111011110',
    '10111101110','11101011110','11110101110','11010000100','11010010000','11010011100','1100011101011'
  ];
  var START_B = 104, STOP = 106;

  function encode128B(text) {
    var codes = [START_B];
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      if (c < 32 || c > 126) c = 45;
      codes.push(c - 32);
    }
    var sum = START_B;
    for (var j = 1; j < codes.length; j++) sum += codes[j] * j;
    codes.push(sum % 103);
    codes.push(STOP);
    return codes;
  }

  function normalizeBase(input) {
    var u = (input || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u.replace(/\/+$/, '') + '/';
  }

  function getPublicBase() {
    try {
      var saved = localStorage.getItem('wedding-public-url');
      if (saved && saved.trim()) return normalizeBase(saved);
    } catch (e) { /* */ }
    if (typeof location !== 'undefined' && location.protocol === 'https:') {
      return location.href.replace(/[^/]*$/, '');
    }
    return '';
  }

  function setPublicBase(url) {
    var b = normalizeBase(url);
    if (b) {
      try { localStorage.setItem('wedding-public-url', b); } catch (e) { /* */ }
    }
    return b;
  }

  /** Link toos ah — ugu fiican barcode scan (gaaban, https) */
  function directLink(page, showWelcome) {
    var base = getPublicBase();
    if (!base) {
      throw new Error('Geli link https internet ah (ma aha file://)');
    }
    var url = new URL(page, base);
    if (showWelcome) url.searchParams.set('s', '1');
    return url.href;
  }

  function uniqueUrl(page) {
    return directLink(page, true);
  }

  function isValidScanUrl(url) {
    return /^https:\/\/.+\..+/i.test(url);
  }

  function drawBarcode(canvas, text, opts) {
    opts = opts || {};
    if (!text || !isValidScanUrl(text)) {
      throw new Error('URL waa inuu noqdaa https:// (internet)');
    }
    var dark = opts.dark || '#000000';
    var light = opts.light || '#ffffff';
    var height = opts.barHeight || 90;
    var maxWidth = opts.maxWidth || 640;
    var padX = opts.padX == null ? 16 : opts.padX;
    var padY = opts.padY == null ? 12 : opts.padY;

    var codes = encode128B(text);
    var bits = '';
    for (var i = 0; i < codes.length; i++) bits += PATTERNS[codes[i]];

    var moduleW = opts.moduleWidth || 2;
    var barW = bits.length * moduleW;
    if (barW > maxWidth - padX * 2) {
      moduleW = Math.max(1, Math.floor((maxWidth - padX * 2) / bits.length));
    }

    var w = bits.length * moduleW + padX * 2;
    var h = height + padY * 2;
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = dark;
    var x = padX;
    for (var k = 0; k < bits.length; k++) {
      if (bits.charAt(k) === '1') ctx.fillRect(x, padY, moduleW, height);
      x += moduleW;
    }
    return { ok: true, width: w, height: h, text: text };
  }

  global.WeddingBarcode = {
    draw: drawBarcode,
    directLink: directLink,
    uniqueUrl: uniqueUrl,
    getPublicBase: getPublicBase,
    setPublicBase: setPublicBase,
    isValidScanUrl: isValidScanUrl
  };
  global.WeddingQR = global.WeddingBarcode;
})(typeof window !== 'undefined' ? window : this);
