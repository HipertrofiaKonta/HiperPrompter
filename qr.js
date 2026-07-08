/* Minimalny enkoder QR (byte mode, ECC poziom L, wersje 1-5, maska 0).
   Własna implementacja — zero zależności zewnętrznych.
   API: qrEncode(text) -> {size, modules[row][col] (0/1)} lub null gdy tekst za długi.
        qrToCanvas(qr, scale, quiet) -> HTMLCanvasElement */
(function (global) {
  'use strict';

  // [wersja, liczba wszystkich kodesłów, liczba kodesłów ECC] — poziom L, 1 blok RS
  var VERSIONS = [
    [1, 26, 7],
    [2, 44, 10],
    [3, 70, 15],
    [4, 100, 20],
    [5, 134, 26]
  ];

  // GF(256), wielomian 0x11d
  var EXP = new Array(512), LOG = new Array(256);
  (function () {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x; LOG[x] = i;
      x <<= 1; if (x & 0x100) x ^= 0x11d;
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();
  function gmul(a, b) { return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]]; }

  function rsEcc(data, ecLen) {
    // wielomian generujący: iloczyn (x - alfa^i), i = 0..ecLen-1
    var gen = [1];
    for (var i = 0; i < ecLen; i++) {
      var next = new Array(gen.length + 1).fill(0);
      for (var j = 0; j < gen.length; j++) {
        next[j] ^= gen[j];                    // * x
        next[j + 1] ^= gmul(gen[j], EXP[i]);  // * alfa^i
      }
      gen = next;
    }
    var rem = data.concat(new Array(ecLen).fill(0));
    for (var k = 0; k < data.length; k++) {
      var f = rem[k];
      if (f === 0) continue;
      for (var m = 0; m < gen.length; m++) rem[k + m] ^= gmul(gen[m], f);
    }
    return rem.slice(rem.length - ecLen);
  }

  function utf8Bytes(str) {
    if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(str));
    var out = [], enc = encodeURIComponent(str);
    for (var i = 0; i < enc.length; i++) {
      var c = enc.charAt(i);
      if (c === '%') { out.push(parseInt(enc.substr(i + 1, 2), 16)); i += 2; }
      else out.push(c.charCodeAt(0));
    }
    return out;
  }

  function qrEncode(text) {
    var data = utf8Bytes(text);
    var chosen = null;
    for (var v = 0; v < VERSIONS.length; v++) {
      var cap = VERSIONS[v][1] - VERSIONS[v][2] - 2; // bajty: dane - ECC - (tryb+licznik)
      if (data.length <= cap) { chosen = VERSIONS[v]; break; }
    }
    if (!chosen) return null;
    var version = chosen[0], totalCW = chosen[1], ecLen = chosen[2];
    var dataCW = totalCW - ecLen;
    var size = 17 + version * 4;

    // --- strumień bitów ---
    var bits = [];
    function push(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); }
    push(4, 4);               // tryb: byte
    push(data.length, 8);     // licznik (8 bitów dla wersji 1-9)
    for (var b = 0; b < data.length; b++) push(data[b], 8);
    var termLen = Math.min(4, dataCW * 8 - bits.length);
    push(0, termLen);
    while (bits.length % 8 !== 0) bits.push(0);
    var bytes = [];
    for (var i2 = 0; i2 < bits.length; i2 += 8) {
      var byteVal = 0;
      for (var j2 = 0; j2 < 8; j2++) byteVal = (byteVal << 1) | bits[i2 + j2];
      bytes.push(byteVal);
    }
    var pads = [0xEC, 0x11], pi = 0;
    while (bytes.length < dataCW) bytes.push(pads[pi++ % 2]);

    var codewords = bytes.concat(rsEcc(bytes, ecLen));

    // --- macierz ---
    var mod = [], rsv = [];
    for (var r = 0; r < size; r++) { mod.push(new Array(size).fill(0)); rsv.push(new Array(size).fill(false)); }
    function set(r2, c2, v2) { mod[r2][c2] = v2 ? 1 : 0; rsv[r2][c2] = true; }

    function placeFinder(r0, c0) {
      for (var dr = -1; dr <= 7; dr++) for (var dc = -1; dc <= 7; dc++) {
        var rr = r0 + dr, cc = c0 + dc;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        var on = (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6) &&
                 (dr === 0 || dr === 6 || dc === 0 || dc === 6 ||
                  (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
        set(rr, cc, on);
      }
    }
    placeFinder(0, 0);
    placeFinder(0, size - 7);
    placeFinder(size - 7, 0);

    // timing
    for (var t = 8; t < size - 8; t++) {
      if (!rsv[6][t]) set(6, t, t % 2 === 0);
      if (!rsv[t][6]) set(t, 6, t % 2 === 0);
    }

    // wzór pozycjonujący (wersje 2-5: jeden, w prawym dolnym rogu siatki)
    if (version >= 2) {
      var ap = size - 7; // 18/22/26/30
      for (var ar = -2; ar <= 2; ar++) for (var ac = -2; ac <= 2; ac++) {
        var on2 = Math.max(Math.abs(ar), Math.abs(ac)) !== 1;
        set(ap + ar, ap + ac, on2);
      }
    }

    // ciemny moduł
    set(4 * version + 9, 8, 1);

    // rezerwacja pól formatu
    for (var f1 = 0; f1 <= 8; f1++) {
      if (!rsv[8][f1]) set(8, f1, 0);
      if (!rsv[f1][8]) set(f1, 8, 0);
    }
    for (var f2 = size - 8; f2 < size; f2++) {
      if (!rsv[8][f2]) set(8, f2, 0);
      if (!rsv[f2][8]) set(f2, 8, 0);
    }

    // --- dane zygzakiem, maska 0: (r+c) % 2 === 0 ---
    var bitIdx = 0, totalBits = codewords.length * 8;
    var dir = -1, row = size - 1;
    for (var col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      while (true) {
        for (var cx = 0; cx < 2; cx++) {
          var cc2 = col - cx;
          if (!rsv[row][cc2]) {
            var bit = 0;
            if (bitIdx < totalBits) bit = (codewords[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1;
            bitIdx++;
            if ((row + cc2) % 2 === 0) bit ^= 1;
            mod[row][cc2] = bit;
          }
        }
        row += dir;
        if (row < 0 || row >= size) { row -= dir; dir = -dir; break; }
      }
    }

    // --- informacja formatu: ECC L (01) + maska 0 (000), BCH(15,5) ---
    var fmtData = (0x1 << 3) | 0; // 01000
    var rem2 = fmtData << 10;
    var G = 0x537; // 10100110111
    for (var fb = 14; fb >= 10; fb--) if ((rem2 >> fb) & 1) rem2 ^= G << (fb - 10);
    var fmt = ((fmtData << 10) | (rem2 & 0x3ff)) ^ 0x5412;

    for (var fi = 0; fi < 15; fi++) {
      var fbit = (fmt >> fi) & 1;
      // kopia 1 — wokół lewego górnego wzoru
      if (fi < 6) mod[fi][8] = fbit;
      else if (fi === 6) mod[7][8] = fbit;
      else if (fi === 7) mod[8][8] = fbit;
      else if (fi === 8) mod[8][7] = fbit;
      else mod[8][14 - fi] = fbit;
      // kopia 2 — przy pozostałych wzorach
      if (fi < 8) mod[8][size - 1 - fi] = fbit;
      else mod[size - 15 + fi][8] = fbit;
    }
    mod[4 * version + 9][8] = 1; // ciemny moduł (na wszelki wypadek po formacie)

    return { size: size, modules: mod, version: version };
  }

  function qrToCanvas(qr, scale, quiet) {
    scale = scale || 6; quiet = (quiet == null) ? 4 : quiet;
    var px = (qr.size + quiet * 2) * scale;
    var canvas = document.createElement('canvas');
    canvas.width = px; canvas.height = px;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, px, px);
    ctx.fillStyle = '#000';
    for (var r = 0; r < qr.size; r++) for (var c = 0; c < qr.size; c++) {
      if (qr.modules[r][c]) ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
    }
    return canvas;
  }

  global.qrEncode = qrEncode;
  global.qrToCanvas = qrToCanvas;
})(typeof window !== 'undefined' ? window : globalThis);

