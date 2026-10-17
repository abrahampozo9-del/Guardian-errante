// ====================================================================== cinemáticas pixel art
// TEXTOS DE LAS CINEMÁTICAS: para cambiar el lore basta con editar CINE.
// Cada cinemática tiene un título opcional (rótulo de misión) y una lista de páginas
// { escena, texto }. Escenas disponibles: escrituras, anticristo, apagon, arrebato, colapso,
// batalla, valle, ribera, guardian, radio, iglesia, cruz, bolera, alba.
const CINE = {
  intro: {
    pages: [
      ['escrituras', 'El mundo colapsó hace siete años.\nResulta que todo lo que decía el libro del Apocalipsis era real.'],
      ['anticristo', 'El Anticristo nos engañó y se apoderó de la Tierra.\nLo nombraron señor del mundo...'],
      ['apagon', '...y después, todo se apagó.'],
      ['arrebato', 'Los más nobles y limpios de espíritu ascendieron al cielo.'],
      ['colapso', 'Los más pecadores se convirtieron en cosas horribles...\no bajaron directamente al infierno.'],
      ['batalla', 'Ahora se libra una batalla. Se escuchan ruidos increíbles.\nMe han llegado rumores de ángeles y demonios luchando.'],
      ['escrituras', 'Estudio las escrituras para saber en qué fase estamos.\nPero todo es demasiado críptico, y la realidad está siendo demasiado para mí.'],
      ['valle', 'Y yo estoy aquí, en mi cortijo junto al Guadalentín, a las afueras de Pozo Alcón.\nSolo.'],
      ['guardian', 'Ni lo suficientemente pecador...\nni lo suficientemente santo.'],
    ],
  },
  ribera: {
    title: 'La ribera',
    pages: [
      ['ribera', 'Cada noche suben del río. Cada mañana hay huellas nuevas junto a la poza.'],
      ['guardian', 'Hoy no va a esperar a que lleguen a la puerta.'],
    ],
  },
  supervivientes: {
    title: 'La voz de la radio',
    pages: [
      ['radio', 'Siete años creyendo que era el último. Pero la voz de la radio era real.'],
      ['iglesia', 'En la Iglesia de la Encarnación, tras las barricadas, alguien resiste.\nPozo Alcón está al oeste, cruzando el puente viejo.'],
    ],
  },
  cruz: {
    title: 'La Cruz de San Gregorio',
    pages: [
      ['cruz', 'Junto a la A-326, la vieja cruz de piedra aún guarda algo de la luz de antes.'],
      ['cruz', 'Las zarzas negras de La Linde le tienen miedo. Si alguien reza allí con fe, quizá se abran.'],
    ],
  },
  bolera: {
    title: 'La Bestia de La Bolera',
    pages: [
      ['bolera', 'Todo empezó en La Bolera. Bajo el embalse, en la cueva del nacimiento del Guadalentín, algo despertó.'],
      ['bolera', 'Desde entonces, el agua trae la muerte. Río arriba, hasta la presa.'],
    ],
  },
  final: {
    pages: [
      ['alba', 'Las semanas siguientes, el agua de La Bolera volvió a bajar limpia por el Guadalentín.'],
      ['iglesia', 'Los once supervivientes de la Encarnación salieron de detrás de las barricadas.\nDespués llegaron otros, desde Hinojares, desde Huesa, desde Fontanar.'],
      ['valle', 'En el cortijo del río, las placas siguen dando luz.\nEl gato duerme al sol, y el perrillo ya no ladra de noche.'],
      ['guardian', '«La calma también es una forma de lucha.\nPozo Alcón... siempre será mi lugar.»'],
      ['alba', 'EL GUARDIÁN ERRANTE\n\nGracias por jugar.'],
    ],
  },
};

ST.CINE = 'CINE';
// Las escenas se pintan a resolución completa (400×225). Cada escena se construye una vez en capas
// (cielo, nubes, montes, pueblo, figuras...) pintadas píxel a píxel con rampas de color y tramado
// ordenado, y luego se componen en cada fotograma con paralaje, movimiento de cámara, luz y partículas.
const CW = 400, CH = 225;
const cineC = document.createElement('canvas'); cineC.width = CW; cineC.height = CH;
const cg = cineC.getContext('2d');

G.playCine = function (id, onEnd) {
  const c = CINE[id];
  if (!c) { if (onEnd) onEnd(); return; }
  this.cine = { id, c, idx: c.title ? -1 : 0, t: 0, chars: 0, onEnd, back: this.st };
  this.st = ST.CINE;
  if (c.pages[0]) CS.prepare(c.pages[0][0]);
};
G.endCine = function () {
  const k = this.cine; this.cine = null;
  this.st = ST.PLAY;
  if (k.onEnd) k.onEnd();
};
G.updateCine = function (dt) {
  const k = this.cine; if (!k) { this.st = ST.PLAY; return; }
  k.t += dt; this.clock += dt;
  if (k.idx >= 0) k.chars += dt * 34;
  // prepara en segundo plano la escena de la página siguiente
  const nx = k.c.pages[k.idx + 1]; if (nx && k.t > 0.4) CS.prepareSoon(nx[0]);
  if (this.pressed('Escape', 'Skip')) { this.endCine(); return; }
  const text = k.idx >= 0 ? k.c.pages[k.idx][1] : '';
  const auto = k.idx < 0 && k.t > 2.6;
  if (this.confirm() || auto) {
    if (k.idx >= 0 && k.chars < text.length) { k.chars = 999; return; }
    if (k.idx < 0 && k.t < 0.4) return;
    if (++k.idx >= k.c.pages.length) { this.endCine(); return; }
    const same = k.idx > 0 && k.c.pages[k.idx][0] === k.c.pages[k.idx - 1][0];
    if (!same) k.t = 0;
    k.chars = 0;
  }
};

// ====================================================================== biblioteca de pintura
const CP = (function () {
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16 - 0.5);
  const hsh = (x, y, s) => { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) & 0xffffff) / 0x1000000; };
  function vn(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y); let fx = x - xi, fy = y - yi;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const a = hsh(xi, yi, s), b = hsh(xi + 1, yi, s), c = hsh(xi, yi + 1, s), d = hsh(xi + 1, yi + 1, s);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }
  function fbm(x, y, s, oct = 5) { let v = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < oct; i++) { v += a * vn(x * f, y * f, s + i * 17); n += a; a *= 0.5; f *= 2.03; } return v / n; }
  const ridged = (x, y, s, oct = 5) => { let v = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < oct; i++) { v += a * (1 - Math.abs(2 * vn(x * f, y * f, s + i * 13) - 1)); n += a; a *= 0.5; f *= 2.1; } return v / n; };
  const hex = c => typeof c === 'number' ? c : parseInt(c.replace('#', ''), 16);
  const R = cols => cols.map(hex);
  // color de una rampa con tramado ordenado (v en 0..1)
  function q(ramp, v, x, y, dith = 1) {
    const n = ramp.length, f = Math.max(0, Math.min(n - 1, v * (n - 1) + BAYER[(y & 3) * 4 + (x & 3)] * dith));
    return ramp[Math.round(f)];
  }
  const L = (w, h) => Px.img(w, h);
  const put = (b, x, y, c) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < b.w && y < b.h) b.d[y * b.w + x] = (0xff000000 | c) >>> 0; };
  const putA = (b, x, y, c, a) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= b.w || y >= b.h) return; const i = y * b.w + x, o = b.d[i]; if ((o >>> 24) === 0) { b.d[i] = (((a * 255) << 24) | c) >>> 0; return; } b.d[i] = (0xff000000 | Px.mix(o & 0xffffff, c, a)) >>> 0; };
  const has = (b, x, y) => x >= 0 && y >= 0 && x < b.w && y < b.h && (b.d[y * b.w + x] >>> 24) > 0;
  const lerp = (a, b, t) => a + (b - a) * t;

  // cielo: degradado vertical + resplandor en un punto (sol, luna, incendio)
  function sky(b, ramp, o = {}) {
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
      let v = 1 - y / b.h * (o.k || 1);
      if (o.inv) v = y / b.h;
      if (o.gx !== undefined) { const d = Math.hypot((x - o.gx) / (o.gr || 120), (y - o.gy) / ((o.gr || 120) * 0.7)); v += Math.max(0, 1 - d) * (o.gk || 0.5); }
      v += (fbm(x / 90, y / 40, o.seed || 3, 3) - 0.5) * (o.mottle || 0.12);
      put(b, x, y, q(ramp, v, x, y));
    }
  }
  // nubes de tormenta: masas de ruido con relieve iluminado desde (lx, ly) y borde claro donde da la luz
  function clouds(b, ramp, o) {
    const sc = o.scale || 60, cover = o.cover || 0.5, y0 = o.y0 || 0, y1 = o.y1 || b.h, lx = o.lx || 0, ly = o.ly === undefined ? -1 : o.ly;
    for (let y = y0; y < y1; y++) for (let x = 0; x < b.w; x++) {
      const band = Math.min(1, (y - y0) / 14, (y1 - y) / 24);
      const nx = x / sc, ny = y / (sc * 0.42);
      // masas grandes (baja frecuencia) con detalle encima: formaciones como en los cuadros de tormenta
      const big = fbm(nx * 0.3, ny * 0.3, (o.seed || 11) + 50, 3);
      const n = fbm(nx, ny, o.seed || 11, 4) * 0.65 + big * 0.35;
      const d = (n - (1 - cover)) * band;
      if (d <= 0) continue;
      const n2 = fbm(nx - lx * 0.08, ny - ly * 0.16, o.seed || 11, 4) * 0.65 + big * 0.35;
      let v = 0.34 + (n - n2) * (o.relief || 7) * 0.55 + d * 1.1;
      if (o.lightAt) { const dd = Math.hypot(x - o.lightAt[0], (y - o.lightAt[1]) * 1.6); v += Math.max(0, 1 - dd / o.lightAt[2]) * 0.45; }
      if (d < 0.025) v += 0.25; // fleco de luz
      put(b, x, y, q(ramp, v, x, y));
    }
  }
  // cordillera: perfil de ruido con caras al sol y en sombra, estratos, labio claro en la cresta
  function range(b, ramp, o) {
    const base = o.base, amp = o.amp, fr = o.freq || 0.008, s = o.seed || 21, lit = o.lit === undefined ? -1 : o.lit;
    // perfil normalizado (de valle a cumbre) para que haya picos de verdad y no una muralla plana
    const raw = x => o.soft ? fbm(x * fr, 0.5, s, 4) : ridged(x * fr, 0.5, s, 5) * 0.7 + fbm(x * fr * 0.35, 3.5, s + 9, 3) * 0.3;
    let mn = 1e9, mx = -1e9; for (let x = -1; x <= b.w + 1; x++) { const v = raw(x); mn = Math.min(mn, v); mx = Math.max(mx, v); }
    const hAt = x => { const m = (raw(x) - mn) / (mx - mn || 1); return base - amp * Math.pow(Math.max(0, m), o.soft ? 1 : 1.35) + (o.tilt || 0) * x; };
    const H = []; for (let x = -1; x <= b.w; x++) H.push(hAt(x));
    for (let x = 0; x < b.w; x++) {
      const h = H[x + 1], slope = (H[x + 2] - H[x]) * lit;
      for (let y = Math.max(0, Math.floor(h)); y < b.h; y++) {
        const depth = (y - h) / (b.h - h + 1), near = Math.max(0, 1 - (y - h) / 14);
        // relieve 2D: barrancos y espolones que bajan de la cresta, iluminados de lado
        const gx = ridged((x + 1.5) / 26, y / 34, s + 5, 3) - ridged((x - 1.5) / 26, y / 34, s + 5, 3);
        let v = 0.55 + slope * (o.sk || 0.35) * near - gx * lit * 2.2 * (o.tex === undefined ? 1 : o.tex * 2.5) - depth * (o.fade || 0.5) + (fbm(x / 9, y / 9, s + 3, 3) - 0.5) * 0.18;
        if (y - h < 1.5) v += 0.3;
        if (o.snow && y - h < o.snow * (0.5 + fbm(x / 9, 1, s, 2))) v += 0.4;
        put(b, x, y, q(ramp, v, x, y));
      }
    }
    return hAt;
  }
  // relleno de un polígono con un sombreador (x, y, u, v) -> color | -1
  function poly(b, pts, shade) {
    let minY = 1e9, maxY = -1e9, minX = 1e9, maxX = -1e9;
    for (const [x, y] of pts) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
    const W = maxX - minX || 1, Hh = maxY - minY || 1;
    for (let y = Math.max(0, Math.floor(minY)); y <= Math.min(b.h - 1, Math.ceil(maxY)); y++) {
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
        if ((y1 <= y + 0.5 && y2 > y + 0.5) || (y2 <= y + 0.5 && y1 > y + 0.5)) xs.push(x1 + (y + 0.5 - y1) / (y2 - y1) * (x2 - x1));
      }
      xs.sort((a, c) => a - c);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.round(xs[k])); x < Math.min(b.w, Math.round(xs[k + 1])); x++) {
        const c = typeof shade === 'function' ? shade(x, y, (x - minX) / W, (y - minY) / Hh) : shade;
        if (c >= 0) put(b, x, y, c);
      }
    }
  }
  function ell(b, cx, cy, rx, ry, shade) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, dd = dx * dx + dy * dy;
      if (dd > 1) continue;
      const c = typeof shade === 'function' ? shade(x, y, dx, dy, dd) : shade;
      if (c >= 0) put(b, x, y, c);
    }
  }
  // sombreado "cilíndrico" desde la izquierda (lit=-1) o la derecha (lit=1)
  const cyl = (ramp, lit = -1, k = 0) => (x, y, u, v) => q(ramp, (lit < 0 ? 1 - u : u) * 0.75 + (1 - v) * 0.15 + k, x, y);
  // contorno teñido alrededor de lo pintado (para separar figuras del fondo)
  function outline(b, c) {
    const W = b.w, H = b.h, mark = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (has(b, x, y)) continue; if (has(b, x - 1, y) || has(b, x + 1, y) || has(b, x, y - 1) || has(b, x, y + 1)) mark.push(y * W + x); }
    for (const i of mark) b.d[i] = (0xff000000 | c) >>> 0;
  }
  // luz de borde: los píxeles del contorno por el lado de la luz se aclaran hacia un color
  function rim(b, col, dir = -1, k = 0.6) {
    const W = b.w, H = b.h, mk = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (has(b, x, y) && !has(b, x + dir, y)) mk.push([x, y]);
    for (const [x, y] of mk) b.d[y * W + x] = (0xff000000 | Px.mix(b.d[y * W + x] & 0xffffff, col, k)) >>> 0;
  }
  // ---------------------------------------------------------------- vegetación y edificios en plano medio
  function olive(b, x, y, s, ramp) {
    for (let k = 0; k < 4 * s; k++) put(b, x + Math.round(Math.sin(k * 0.6) * 0.6), y - k, ramp[0]);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, cx = x + Math.cos(a) * 4 * s, cy = y - 6 * s + Math.sin(a) * 2 * s; ell(b, cx, cy, 3 * s, 2.2 * s, (px, py, dx, dy) => q(ramp, 0.55 - dx * 0.25 - dy * 0.35, px, py)); }
  }
  function poplar(b, x, y, h, ramp, w = 0.22) {
    for (let k = 0; k < h * 0.2; k++) put(b, x, y - k, ramp[0]);
    ell(b, x, y - h * 0.58, h * w, h * 0.45, (px, py, dx, dy) => q(ramp, 0.5 - dx * 0.4 - dy * 0.15 + (CP.vn(px / 2, py / 3, 5) - 0.5) * 0.5, px, py));
  }
  function deadTree(b, x, y, h, col, seed, spread = 0.5) {
    const Rr = RNG(seed);
    const br = (x0, y0, a, len, w, d) => { if (d > 7 || len < 1.5) return; const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; const n = Math.ceil(len); for (let i = 0; i <= n; i++) { const t = i / n, xx = lerp(x0, x1, t), yy = lerp(y0, y1, t); for (let k = 0; k < Math.max(1, w * (1 - t * 0.3)); k++) put(b, xx + k - w / 2, yy, col); } br(x1, y1, a - spread - Rr.next() * 0.35, len * 0.72, w * 0.62, d + 1); br(x1, y1, a + spread * 0.8 + Rr.next() * 0.35, len * 0.66, w * 0.6, d + 1); if (Rr.next() < 0.3) br(x1, y1, a + (Rr.next() - 0.5) * 0.4, len * 0.55, w * 0.5, d + 2); };
    br(x, y, -Math.PI / 2 + (Rr.next() - 0.5) * 0.15, h * 0.42, Math.max(2, h / 12), 0);
  }
  function pine(b, x, y, s, ramp) {
    for (let k = 0; k < 12 * s; k++) put(b, x, y - k, ramp[0]);
    for (const [dx, dy, rx, ry] of [[0, -13, 9, 4], [-6, -9, 6, 3], [6, -10, 6, 3]]) ell(b, x + dx * s, y + dy * s, rx * s, ry * s, (px, py, ex, ey) => q(ramp, 0.5 - ex * 0.3 - ey * 0.4 + (CP.vn(px / 2, py / 2, 9) - 0.5) * 0.4, px, py));
  }
  function cypress(b, x, y, h, ramp) { ell(b, x, y - h * 0.5, h * 0.12, h * 0.5, (px, py, dx, dy) => q(ramp, 0.45 - dx * 0.45 - dy * 0.1 + (CP.vn(px / 1.5, py / 3, 7) - 0.5) * 0.4, px, py)); }
  // pueblo andaluz: casas encaladas escalonadas, tejados de teja árabe, ventanas encendidas o apagadas
  function town(b, x0, x1, baseY, o = {}) {
    const Rr = RNG(o.seed || 31), wall = o.wall, roof = o.roof, win = o.win || 0x1a1410, lit = o.lit || 0;
    let x = x0; const out = [];
    while (x < x1) {
      const w = 10 + Rr.int(14), h = 9 + Rr.int(10), hill = o.hill ? Math.sin((x - x0) / (x1 - x0) * Math.PI) * o.hill : 0, by = baseY - hill + Rr.int(3);
      poly(b, [[x, by - h], [x + w, by - h], [x + w, by], [x, by]], (px, py, u, v) => q(wall, 0.75 - u * 0.25 - v * 0.2, px, py));
      poly(b, [[x - 1, by - h], [x + w + 1, by - h], [x + w - 2, by - h - 4], [x + 2, by - h - 4]], (px, py, u, v) => q(roof, 0.6 - v * 0.2 + ((py & 1) ? 0.08 : -0.08), px, py));
      for (let wx = x + 3; wx < x + w - 3; wx += 5) { const on = Rr.next() < lit; for (let k = 0; k < 6; k++) put(b, wx + (k & 1), by - h + 4 + (k >> 1), on ? (k < 2 ? 0xffe8a0 : 0xffb050) : win); if (on) out.push([wx + 1, by - h + 5]); }
      x += w - 1 - Rr.int(3);
    }
    return out; // posiciones de ventanas encendidas (para halos)
  }
  // la torre de la Encarnación: cuerpo de piedra, campanario con arco y chapitel
  function tower(b, x, baseY, h, ramp, o = {}) {
    const w = o.w || 12;
    poly(b, [[x, baseY - h], [x + w, baseY - h], [x + w, baseY], [x, baseY]], cyl(ramp, -1));
    poly(b, [[x - 1, baseY - h], [x + w + 1, baseY - h], [x + w + 1, baseY - h + 2], [x - 1, baseY - h + 2]], ramp[ramp.length - 1]);
    poly(b, [[x + 1, baseY - h - 14], [x + w - 1, baseY - h - 14], [x + w - 1, baseY - h], [x + 1, baseY - h]], cyl(ramp, -1, 0.05));
    poly(b, [[x + 3, baseY - h - 11], [x + w - 3, baseY - h - 11], [x + w - 3, baseY - h - 2], [x + 3, baseY - h - 2]], o.bellLit ? 0xffb050 : 0x0e0a08);
    poly(b, [[x + 1, baseY - h - 14], [x + w / 2, baseY - h - 24], [x + w - 1, baseY - h - 14]], cyl(o.roof || ramp, -1));
    for (let k = 0; k < 5; k++) put(b, x + w / 2, baseY - h - 24 - k, ramp[ramp.length - 1]);
    put(b, x + w / 2 - 1, baseY - h - 27, ramp[ramp.length - 1]); put(b, x + w / 2 + 1, baseY - h - 27, ramp[ramp.length - 1]);
  }
  function crowd(b, x0, x1, y, n, col, seed, hmin = 10, hvar = 8) {
    const Rr = RNG(seed);
    for (let i = 0; i < n; i++) { const x = x0 + Rr.next() * (x1 - x0), h = hmin + Rr.int(hvar), yy = y + Rr.int(10); poly(b, [[x - 3, yy], [x - 2.5, yy - h * 0.7], [x + 2.5, yy - h * 0.7], [x + 3, yy]], col); ell(b, x, yy - h * 0.82, 2.3, 2.6, col); if (Rr.next() < 0.3) poly(b, [[x + 2, yy - h * 0.6], [x + 7, yy - h * 1.05], [x + 6, yy - h * 1.1], [x + 1.5, yy - h * 0.7]], col); }
  }
  const cv1 = b => { b.c = null; return cv(b); };
  return { BAYER, vn, fbm, ridged, hsh, R, q, L, put, putA, has, lerp, sky, clouds, range, poly, ell, cyl, outline, rim, olive, poplar, deadTree, pine, cypress, town, tower, crowd, cv: cv1 };
})();

// ====================================================================== personajes grandes
// El Guardián según su ficha: pelo corto oscuro, barba cuidada, capa con capucha caída gris verdosa y
// raída, tabardo blanco con cruces rojas, correajes de cuero, bastón de madera con cordones, espada al
// cinto y botas con vendas. Se pinta en una capa propia (varios fotogramas para la capa al viento).
const FIG = (function () {
  const { q, poly, ell, put, R, cyl, outline, rim, L } = CP;
  const SKIN = R([0x3a2418, 0x6a4430, 0x9a6a4a, 0xc08a64, 0xdcaa80]);
  const HAIR = R([0x0e0a08, 0x1e1612, 0x2e221a, 0x40322a]);
  const CLOAK = R([0x10140f, 0x1c2219, 0x2a3226, 0x3a4434, 0x4e5a46, 0x66705a]);
  const TAB = R([0x6a6458, 0x9a9282, 0xc4bca8, 0xe2dccb, 0xf6f0e2]);
  const RED = R([0x4a0e0a, 0x7a1810, 0xa8261a, 0xc8402a]);
  const LEATHER = R([0x1e120a, 0x3a2414, 0x5a3a20, 0x7a5430, 0x9a7044]);
  const CLOTH = R([0x14120f, 0x24201b, 0x36302a, 0x4a4238]);
  const WOOD = R([0x24160c, 0x4a3018, 0x6e4a28, 0x94683c]);
  const STEEL = R([0x3a3e46, 0x6a7078, 0x9aa2ac, 0xd8dee6, 0xffffff]);
  const GOLD = R([0x5a3a0e, 0x9a6a1a, 0xd8a838, 0xffe08a]);
  // guardian(frame, opts): figura de ~120 px de alto, pies en (60, 138) de una capa de 120×140
  function guardian(fr, o = {}) {
    const b = L(130, 142), X = 62, Y = 139, wnd = Math.sin(fr / 4 * Math.PI * 2) * 3 * (o.wind === undefined ? 1 : o.wind), lit = o.lit || -1;
    // capa por detrás, al viento hacia la derecha
    poly(b, [[X - 17, Y - 98], [X + 17, Y - 98], [X + 26 + wnd, Y - 50], [X + 30 + wnd * 1.6, Y - 6], [X + 22 + wnd, Y - 2], [X + 15 + wnd, Y - 8], [X + 7, Y - 1], [X - 2, Y - 6], [X - 10, Y - 2], [X - 18, Y - 7], [X - 24 + wnd * 0.4, Y - 3], [X - 26, Y - 50]],
      (x, y, u, v) => { const fold = Math.sin((x - X) * 0.55 + v * 2) * 0.12; return q(CLOAK, 0.5 - (lit < 0 ? u : 1 - u) * 0.45 + fold - v * 0.15, x, y); });
    // piernas con vendas y botas
    for (const s of [-1, 1]) {
      const lx = X + s * 6;
      poly(b, [[lx - 5, Y - 58], [lx + 5, Y - 58], [lx + 4.5, Y - 14], [lx - 4.5, Y - 14]], (x, y, u, v) => { const wrap = ((y + x * 0.6) | 0) % 6 < 1; return q(wrap ? LEATHER : CLOTH, 0.7 - u * 0.5, x, y); });
      poly(b, [[lx - 6, Y - 16], [lx + 5, Y - 16], [lx + 7 + (s > 0 ? 2 : 0), Y], [lx - 6 - (s < 0 ? 2 : 0), Y]], cyl(LEATHER, lit));
      for (let k = 0; k < 11; k++) put(b, lx - 6 + k, Y - 16, LEATHER[4]);
    }
    // torso (túnica oscura) y tabardo blanco por encima, con el bajo raído
    poly(b, [[X - 15, Y - 98], [X + 15, Y - 98], [X + 13, Y - 58], [X - 13, Y - 58]], cyl(CLOTH, lit));
    poly(b, [[X - 10, Y - 96], [X + 10, Y - 96], [X + 11, Y - 40], [X + 8, Y - 34], [X + 4, Y - 38], [X + 1, Y - 31], [X - 3, Y - 37], [X - 7, Y - 33], [X - 11, Y - 40]],
      (x, y, u, v) => q(TAB, 0.85 - (lit < 0 ? u : 1 - u) * 0.45 - v * 0.15 + (CP.vn(x / 3, y / 5, 4) - 0.5) * 0.25, x, y));
    // cruces rojas (pecho y faldón)
    const cross = (cx, cy, h, w) => { poly(b, [[cx - 1.5, cy - h / 2], [cx + 1.5, cy - h / 2], [cx + 1.5, cy + h / 2], [cx - 1.5, cy + h / 2]], (x, y, u) => q(RED, 0.8 - u * 0.5, x, y)); poly(b, [[cx - w / 2, cy - h / 2 + h * 0.3], [cx + w / 2, cy - h / 2 + h * 0.3], [cx + w / 2, cy - h / 2 + h * 0.3 + 3], [cx - w / 2, cy - h / 2 + h * 0.3 + 3]], (x, y, u) => q(RED, 0.8 - u * 0.5, x, y)); };
    cross(X, Y - 82, 14, 10); cross(X + 1, Y - 47, 10, 7);
    // correajes: cinturón, bandolera y bolsas
    poly(b, [[X - 14, Y - 63], [X + 14, Y - 63], [X + 14, Y - 58], [X - 14, Y - 58]], cyl(LEATHER, lit));
    poly(b, [[X - 13, Y - 96], [X - 8, Y - 96], [X + 14, Y - 64], [X + 9, Y - 63]], cyl(LEATHER, lit));
    poly(b, [[X - 2, Y - 64], [X + 3, Y - 64], [X + 3, Y - 58], [X - 2, Y - 58]], (x, y, u) => q(GOLD, 0.9 - u * 0.5, x, y));
    poly(b, [[X - 14, Y - 59], [X - 6, Y - 59], [X - 6, Y - 49], [X - 14, Y - 50]], cyl(LEATHER, lit, 0.1));
    put(b, X - 10, Y - 56, GOLD[3]);
    // espada al cinto (vaina en diagonal hacia atrás)
    poly(b, [[X + 9, Y - 62], [X + 13, Y - 63], [X + 26, Y - 22], [X + 23, Y - 21]], cyl(LEATHER, lit, -0.1));
    poly(b, [[X + 6, Y - 66], [X + 16, Y - 69], [X + 16.5, Y - 67], [X + 6.5, Y - 64]], (x, y, u) => q(GOLD, 0.9 - u * 0.4, x, y));
    poly(b, [[X + 9, Y - 74], [X + 12, Y - 75], [X + 13, Y - 67], [X + 10, Y - 66]], cyl(LEATHER, lit));
    ell(b, X + 10.5, Y - 76, 2, 2, GOLD[2]);
    // brazos: el izquierdo (nuestra derecha) sobre la empuñadura; el derecho (nuestra izquierda) con el bastón
    poly(b, [[X - 17, Y - 97], [X - 10, Y - 95], [X - 14, Y - 70], [X - 21, Y - 72]], cyl(CLOTH, lit));
    poly(b, [[X - 21, Y - 74], [X - 14, Y - 72], [X - 15, Y - 62], [X - 22, Y - 63]], cyl(LEATHER, lit));
    ell(b, X - 19, Y - 60, 4, 3.6, (x, y, dx) => q(SKIN, 0.6 - dx * 0.3, x, y));
    poly(b, [[X + 10, Y - 95], [X + 17, Y - 97], [X + 16, Y - 74], [X + 10, Y - 74]], cyl(CLOTH, lit));
    poly(b, [[X + 9, Y - 76], [X + 16, Y - 76], [X + 14, Y - 67], [X + 8, Y - 68]], cyl(LEATHER, lit));
    ell(b, X + 11, Y - 66, 3.6, 3.2, (x, y, dx) => q(SKIN, 0.55 - dx * 0.3, x, y));
    // capucha caída: un rollo de tela sobre los hombros y el cuello
    ell(b, X, Y - 97, 16, 6, (x, y, dx, dy) => q(CLOAK, 0.55 - dx * 0.35 - dy * 0.3 + Math.sin(x * 0.9) * 0.08, x, y));
    // cabeza: cuello, cara, barba, pelo corto, orejas y ojos
    poly(b, [[X - 4, Y - 104], [X + 4, Y - 104], [X + 4, Y - 98], [X - 4, Y - 98]], cyl(SKIN, lit, -0.2));
    ell(b, X, Y - 112, 8, 9.5, (x, y, dx, dy) => q(SKIN, 0.68 - dx * (lit < 0 ? 0.42 : -0.42) - dy * 0.12, x, y));
    ell(b, X - 8, Y - 112, 1.8, 2.6, SKIN[1]); ell(b, X + 8, Y - 112, 1.8, 2.6, SKIN[2]);
    // barba que tapa mandíbula y mejillas bajas
    poly(b, [[X - 8, Y - 113], [X - 6, Y - 108], [X - 3, Y - 106], [X + 3, Y - 106], [X + 6, Y - 108], [X + 8, Y - 113], [X + 8, Y - 106], [X + 5, Y - 100], [X, Y - 98], [X - 5, Y - 100], [X - 8, Y - 106]],
      (x, y, u, v) => q(HAIR, 0.55 - (lit < 0 ? u : 1 - u) * 0.3 + (CP.vn(x / 1.5, y / 1.5, 8) - 0.5) * 0.5, x, y));
    poly(b, [[X - 3, Y - 108], [X + 3, Y - 108], [X + 2, Y - 106.5], [X - 2, Y - 106.5]], HAIR[1]); // bigote
    put(b, X - 1, Y - 105, SKIN[1]); put(b, X, Y - 105, SKIN[1]); put(b, X + 1, Y - 105, SKIN[1]); // labio
    // pelo corto
    ell(b, X, Y - 118, 8.6, 5.5, (x, y, dx, dy) => dy > 0.35 && Math.abs(dx) < 0.55 ? -1 : q(HAIR, 0.6 - dx * 0.3 - dy * 0.3 + (CP.vn(x, y, 2) - 0.5) * 0.5, x, y));
    // ojos marrones, cejas, nariz
    for (const s of [-1, 1]) { put(b, X + s * 3, Y - 113, 0x1a0e08); put(b, X + s * 3 + (s < 0 ? 1 : -1), Y - 113, 0xe8d8c0); for (let k = -1; k <= 1; k++) put(b, X + s * 3 + k, Y - 115, HAIR[1]); }
    put(b, X - 1, Y - 112, SKIN[1]); put(b, X, Y - 111, SKIN[1]); put(b, X, Y - 110, SKIN[0]);
    put(b, X + 4, Y - 116, SKIN[0]); // la cicatriz de la ceja
    // colgante: cruz dorada con cordón
    for (let k = 0; k < 6; k++) put(b, X - 2 + k * 0.4, Y - 96 + k, LEATHER[1]);
    poly(b, [[X - 0.5, Y - 92], [X + 1.5, Y - 92], [X + 1.5, Y - 86], [X - 0.5, Y - 86]], GOLD[3]); poly(b, [[X - 2, Y - 90.5], [X + 3, Y - 90.5], [X + 3, Y - 89], [X - 2, Y - 89]], GOLD[2]);
    // bastón de madera, por delante de la mano derecha, con cordones y borla
    if (o.staff !== false) {
      const sx = X - 20;
      poly(b, [[sx - 1.5, Y - 132], [sx + 1.5, Y - 132], [sx + 2, Y], [sx - 1, Y]], cyl(WOOD, lit));
      for (let k = 0; k < 4; k++) for (let i = -2; i <= 2; i++) put(b, sx + i, Y - 126 + k * 3, LEATHER[3]);
      for (let k = 0; k < 14; k++) put(b, sx - 3 + Math.sin(k * 0.6) * 0.8, Y - 124 + k, LEATHER[2]);
      poly(b, [[sx - 5, Y - 110], [sx - 1, Y - 110], [sx, Y - 102], [sx - 6, Y - 102]], GOLD[1]);
      ell(b, sx - 19 + 19, Y - 61, 4.2, 3.6, (x, y, dx) => q(SKIN, 0.62 - dx * 0.3, x, y)); // la mano delante del bastón
    }
    if (o.drawn) { // espada desenvainada al rojo, apuntando al suelo
      for (let i = 0; i < 46; i++) { const t = i / 46, bx = X + 14 + i * 0.55, by = Y - 66 + i * 1.32; const c = t < 0.35 ? STEEL[3] : t < 0.6 ? 0xffb060 : 0xff6a20; put(b, bx, by, c); put(b, bx + 1, by, t < 0.35 ? STEEL[2] : 0xd84a14); put(b, bx - 1, by, t < 0.35 ? STEEL[4] : 0xffd090); }
    }
    outline(b, o.outline || 0x080608);
    if (o.rimCol) rim(b, o.rimCol, lit, 0.55);
    return b;
  }
  // el hombre de blanco (el Anticristo): alto, traje blanco impecable, pelo dorado, sonrisa amable
  function antichrist(o = {}) {
    const b = L(70, 140), X = 35, Y = 138;
    const WH = R([0x8a8478, 0xb8b2a6, 0xdcd6ca, 0xf2eee4, 0xffffff]), GD = R([0x6a4a10, 0xa87a20, 0xd8a838, 0xf8d878]), PALE = R([0x8a6a5a, 0xc0a08a, 0xe0c4ac, 0xf4dcc4]);
    for (const s of [-1, 1]) poly(b, [[X + s * 6 - 4, Y - 62], [X + s * 6 + 4, Y - 62], [X + s * 5 + 3, Y - 3], [X + s * 5 - 4, Y - 3]], cyl(WH, -1, -0.05));
    for (const s of [-1, 1]) poly(b, [[X + s * 5 - 4, Y - 4], [X + s * 5 + 5, Y - 4], [X + s * 6 + 5, Y], [X + s * 5 - 4, Y]], 0xe8e4dc);
    poly(b, [[X - 14, Y - 104], [X + 14, Y - 104], [X + 12, Y - 60], [X + 8, Y - 56], [X - 8, Y - 56], [X - 12, Y - 60]], cyl(WH, -1));
    poly(b, [[X - 4, Y - 104], [X + 4, Y - 104], [X, Y - 82]], 0xf6f2ea); poly(b, [[X - 1, Y - 100], [X + 1, Y - 100], [X + 1.5, Y - 80], [X, Y - 77], [X - 1.5, Y - 80]], (x, y, u) => q(R([0x5a0a08, 0x8a1410, 0xb81e18]), 0.8 - u * 0.6, x, y));
    for (const s of [-1, 1]) poly(b, [[X + s * 14 - 4, Y - 103], [X + s * 14 + 4, Y - 103], [X + s * 16 + 3, Y - 66], [X + s * 16 - 4, Y - 66]], cyl(WH, -1, -0.05));
    for (const s of [-1, 1]) ell(b, X + s * 16, Y - 63, 3.2, 3.6, (x, y, dx) => q(PALE, 0.7 - dx * 0.3, x, y));
    poly(b, [[X - 3.5, Y - 112], [X + 3.5, Y - 112], [X + 3.5, Y - 104], [X - 3.5, Y - 104]], PALE[1]);
    ell(b, X, Y - 120, 7.5, 9, (x, y, dx, dy) => q(PALE, 0.75 - dx * 0.35 - dy * 0.1, x, y));
    ell(b, X, Y - 127, 8.2, 5, (x, y, dx, dy) => dy > 0.4 ? -1 : q(GD, 0.7 - dx * 0.3 - dy * 0.2, x, y));
    for (const s of [-1, 1]) { put(b, X + s * 3, Y - 121, 0x8a6a10); put(b, X + s * 3, Y - 120, 0xd8a838); }
    for (let k = -2; k <= 2; k++) put(b, X + k, Y - 115 - (Math.abs(k) === 2 ? 1 : 0), 0x8a5a4a); // la sonrisa
    outline(b, 0x14100c);
    return b;
  }
  // pluma: elipse alargada orientada (ang), más ancha en el centro, con raquis y borde oscuro
  function feather(b, x0, y0, ang, len, wid, ramp, k = 0) {
    const ca = Math.cos(ang), sa = Math.sin(ang), r = len + wid;
    for (let y = Math.floor(y0 - r); y <= y0 + r; y++) for (let x = Math.floor(x0 - r); x <= x0 + r; x++) {
      const dx = x + 0.5 - x0, dy = y + 0.5 - y0, u = dx * ca + dy * sa, v = -dx * sa + dy * ca;
      if (u < 0 || u > len) continue;
      const half = wid * Math.pow(Math.sin(Math.PI * Math.min(1, u / len * 0.85 + 0.15)), 0.6);
      if (Math.abs(v) > half) continue;
      let t = 0.75 + k - u / len * 0.25 - (v / half) * 0.2;
      if (Math.abs(v) > half - 1) t -= 0.35; else if (Math.abs(v) < 0.6) t += 0.12;
      put(b, x, y, q(ramp, t, x, y));
    }
  }
  // ala: hueso hombro → codo → punta, y tres hileras de plumas colgando de él
  function wing(b, sx, sy, s, o) {
    const FE = o.ramp, ex = sx + s * o.ex, ey = sy + o.ey, tx = sx + s * o.tx, ty = sy + o.ty;
    const bone = t => t < 0.45 ? [CP.lerp(sx, ex, t / 0.45), CP.lerp(sy, ey, t / 0.45)] : [CP.lerp(ex, tx, (t - 0.45) / 0.55), CP.lerp(ey, ty, (t - 0.45) / 0.55)];
    const droop = o.droop; // dirección en que cuelgan las plumas
    const base = s > 0 ? droop : Math.PI - droop;
    for (let i = 0; i < 16; i++) { const t = 0.3 + i / 15 * 0.7, [x, y] = bone(t); feather(b, x, y, base - s * t * o.fan, 18 + t * t * o.plen, 3.4 + t * 1.2, FE, -0.12); }
    for (let i = 0; i < 18; i++) { const t = i / 17 * 0.85, [x, y] = bone(t); feather(b, x, y, base - s * t * o.fan * 0.6, 12 + t * 14, 3.2, FE, 0); }
    for (let i = 0; i < 22; i++) { const t = i / 21 * 0.75, [x, y] = bone(t); feather(b, x, y, base - s * 0.2, 6 + t * 6, 2.6, FE, 0.12); }
    if (o.blood) for (let k = 0; k < 7; k++) { const [x, y] = bone(0.2 + k * 0.1); ell(b, x + s * 3, y + 9 + (k % 3) * 5, 1.6 + (k % 2), 1.2, 0x8a1410); }
  }
  // Miguel: arcángel con armadura dorada, alas de plumas; caído de rodillas (fallen) o en pie
  function miguel(o = {}) {
    const b = L(240, 160), X = 120, Y = 156, fallen = !!o.fallen;
    const FE = R([0x5a5244, 0x8a8270, 0xb4aa96, 0xd8d0be, 0xf0eadc, 0xffffff]), AR = R([0x4a300c, 0x8a5e18, 0xc8962e, 0xecc25a, 0xfff0b0]), SK = R([0x7a4e32, 0xb88260, 0xdcac86, 0xf4d0ac]);
    const ROBE = R([0x6a6458, 0x9a9282, 0xc6bea8, 0xe4dece, 0xfaf6ea]), HAIRG = R([0x6a4410, 0xa87420, 0xd8a83c, 0xf6d878]);
    if (fallen) {
      for (const s of [-1, 1]) wing(b, X + s * 8, Y - 62, s, { ramp: FE, ex: 34, ey: -26, tx: 92, ty: 34, droop: 1.75, fan: 0.6, plen: 26, blood: o.blood });
      // túnica de rodillas con pliegues
      poly(b, [[X - 15, Y - 64], [X + 15, Y - 64], [X + 22, Y - 24], [X + 34, Y - 2], [X + 30, Y], [X - 30, Y], [X - 34, Y - 2], [X - 22, Y - 24]], (x, y, u, v) => q(ROBE, 0.82 - u * 0.4 - v * 0.15 + (Math.sin((x - X) * 0.5 + v * 3) > 0.7 ? -0.25 : 0), x, y));
      poly(b, [[X - 13, Y - 72], [X + 13, Y - 72], [X + 12, Y - 46], [X - 12, Y - 46]], (x, y, u, v) => q(AR, 0.9 - u * 0.55 - v * 0.15, x, y));
      for (let x = X - 12; x <= X + 12; x++) put(b, x, Y - 47, AR[1]);
      // brazo que se sostiene sobre la espada clavada
      poly(b, [[X + 12, Y - 70], [X + 18, Y - 70], [X + 24, Y - 44], [X + 18, Y - 44]], (x, y, u) => q(AR, 0.8 - u * 0.5, x, y));
      for (let k = 0; k < 44; k++) { put(b, X + 22, Y - 46 + k, k < 6 ? AR[3] : 0xe8eef4); put(b, X + 23, Y - 46 + k, k < 6 ? AR[2] : 0xb8c0c8); }
      poly(b, [[X + 16, Y - 47], [X + 29, Y - 47], [X + 29, Y - 45], [X + 16, Y - 45]], AR[3]);
      ell(b, X + 21, Y - 44, 3.5, 3, (x, y, dx) => q(SK, 0.6 - dx * 0.3, x, y));
      // cabeza gacha, melena dorada
      ell(b, X + 1, Y - 79, 7, 8.5, (x, y, dx, dy) => q(SK, 0.66 - dx * 0.35 - dy * 0.1, x, y));
      poly(b, [[X - 9, Y - 86], [X + 9, Y - 88], [X + 10, Y - 70], [X + 6, Y - 68], [X + 7, Y - 80], [X - 6, Y - 80], [X - 7, Y - 66], [X - 10, Y - 70]], (x, y, u, v) => q(HAIRG, 0.8 - u * 0.4 - v * 0.2 + Math.sin(x * 1.3) * 0.08, x, y));
      for (const s of [-1, 1]) put(b, X + 1 + s * 3, Y - 78, 0x3a2414);
      for (let k = 0; k < 10; k++) put(b, X - 4 + k * 0.6, Y - 58 + k * 1.2, 0x9a1410); // la herida
      ell(b, X + 1, Y - 95, 11, 2.6, (x, y, dx, dy) => Math.abs(dy) < 0.5 ? -1 : AR[4]); // aureola apagándose
    } else {
      for (const s of [-1, 1]) wing(b, X + s * 10, Y - 104, s, { ramp: FE, ex: 34, ey: -34, tx: 104, ty: -60, droop: 1.4, fan: 0.9, plen: 30 });
      for (const s of [-1, 1]) poly(b, [[X + s * 6 - 5, Y - 60], [X + s * 6 + 5, Y - 60], [X + s * 6 + 4, Y], [X + s * 6 - 5, Y]], (x, y, u) => q(AR, 0.85 - u * 0.5, x, y));
      poly(b, [[X - 16, Y - 108], [X + 16, Y - 108], [X + 13, Y - 58], [X - 13, Y - 58]], (x, y, u, v) => q(AR, 0.95 - u * 0.55 - v * 0.2, x, y));
      poly(b, [[X - 13, Y - 62], [X + 13, Y - 62], [X + 18, Y - 22], [X - 18, Y - 22]], (x, y, u, v) => q(ROBE, 0.85 - u * 0.45 + (Math.sin((x - X) * 0.6) > 0.7 ? -0.2 : 0), x, y));
      ell(b, X, Y - 119, 8, 9.5, (x, y, dx) => q(SK, 0.7 - dx * 0.35, x, y));
      poly(b, [[X - 10, Y - 128], [X + 10, Y - 128], [X + 11, Y - 108], [X + 7, Y - 112], [X + 7, Y - 122], [X - 7, Y - 122], [X - 7, Y - 112], [X - 11, Y - 108]], (x, y, u, v) => q(HAIRG, 0.85 - u * 0.4 - v * 0.2, x, y));
      for (const s of [-1, 1]) put(b, X + s * 3, Y - 119, 0x3a2414);
      // espada de luz en alto
      for (let i = 0; i < 80; i++) { put(b, X + 24, Y - 150 + i, i < 70 ? 0xfff6d0 : AR[2]); put(b, X + 25, Y - 150 + i, i < 70 ? 0xffffff : AR[3]); put(b, X + 23, Y - 150 + i, i < 70 ? 0xffe8a0 : AR[1]); }
      poly(b, [[X + 17, Y - 80], [X + 32, Y - 80], [X + 32, Y - 77], [X + 17, Y - 77]], AR[3]);
      poly(b, [[X + 13, Y - 106], [X + 19, Y - 106], [X + 26, Y - 80], [X + 20, Y - 78]], (x, y, u) => q(AR, 0.8 - u * 0.5, x, y));
    }
    outline(b, 0x241a10);
    return b;
  }
  // demonio: enorme, cuernos, alas de murciélago desgarradas, grietas de brasa, ojos encendidos
  function demon(o = {}) {
    const b = L(220, 170), X = 110, Y = 166;
    const SKN = R([0x0c0404, 0x1a0808, 0x2a0c0a, 0x3e1410, 0x5a1e14]), MEM = R([0x140606, 0x2a0a0a, 0x40100e, 0x5a1a14]);
    for (const s of [-1, 1]) {
      const pts = [[X + s * 14, Y - 112], [X + s * 50, Y - 150], [X + s * 104, Y - 128]];
      for (let k = 0; k < 4; k++) pts.push([X + s * (100 - k * 22), Y - 96 + (k % 2 ? -10 : 8)]);
      pts.push([X + s * 18, Y - 88]);
      poly(b, pts, (x, y, u, v) => q(MEM, 0.55 - v * 0.4 + (Math.sin((x - X) * 0.18) > 0.85 ? 0.3 : 0), x, y));
      for (let k = 0; k < 4; k++) { const ex = X + s * (100 - k * 22), ey = Y - 96 + (k % 2 ? -10 : 8); for (let i = 0; i < 40; i++) put(b, CP.lerp(X + s * 50, ex, i / 40), CP.lerp(Y - 150, ey, i / 40), SKN[3]); }
    }
    for (const s of [-1, 1]) poly(b, [[X + s * 10 - 7, Y - 64], [X + s * 10 + 7, Y - 64], [X + s * 16 + 6, Y - 30], [X + s * 12 + 4, Y], [X + s * 12 - 8, Y], [X + s * 8 - 6, Y - 30]], cyl(SKN, -1));
    poly(b, [[X - 28, Y - 120], [X + 28, Y - 120], [X + 18, Y - 60], [X - 18, Y - 60]], (x, y, u, v) => q(SKN, 0.7 - u * 0.5 - v * 0.2, x, y));
    for (const s of [-1, 1]) poly(b, [[X + s * 26 - 7, Y - 118], [X + s * 26 + 7, Y - 118], [X + s * 34 + 6, Y - 70], [X + s * 34 - 6, Y - 70]], cyl(SKN, -1));
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) poly(b, [[X + s * 34 - 4 + k * 3, Y - 70], [X + s * 34 - 3 + k * 3, Y - 70], [X + s * 37 - 3 + k * 4, Y - 58], [X + s * 36 - 4 + k * 4, Y - 58]], 0xc8b8a0);
    ell(b, X, Y - 132, 13, 14, (x, y, dx, dy) => q(SKN, 0.65 - dx * 0.4 - dy * 0.15, x, y));
    for (const s of [-1, 1]) poly(b, [[X + s * 7, Y - 142], [X + s * 13, Y - 140], [X + s * 30, Y - 168], [X + s * 24, Y - 166], [X + s * 18, Y - 150]], (x, y, u, v) => q(R([0x3a3028, 0x6a5a48, 0x9a8a70, 0xc8b898]), 0.8 - v * 0.6, x, y));
    for (const s of [-1, 1]) { ell(b, X + s * 5, Y - 134, 3, 2, 0xff5a14); put(b, X + s * 5, Y - 134, 0xfff0a0); }
    poly(b, [[X - 7, Y - 124], [X + 7, Y - 124], [X + 5, Y - 120], [X - 5, Y - 120]], 0x080202);
    for (let k = -3; k <= 3; k++) put(b, X + k * 2, Y - 123, 0xd8c8a8);
    // grietas de brasa en el pecho
    const Rr = RNG(66); for (let i = 0; i < 9; i++) { let x = X - 18 + Rr.int(36), y = Y - 116 + Rr.int(50); for (let k = 0; k < 9; k++) { put(b, x, y, k % 3 ? 0xff6a1a : 0xffc060); x += Rr.int(3) - 1; y += 1; } }
    outline(b, 0x050101);
    return b;
  }
  return { guardian, antichrist, miguel, demon, SKIN, CLOAK, TAB, LEATHER, WOOD, GOLD, STEEL };
})();

// ====================================================================== motor de escenas
const CS = (function () {
  const defs = {}, built = {}, pending = new Set();
  function def(name, build, draw) { defs[name] = { build, draw }; SCENES[name] = t => run(name, t); }
  function prepare(name) { if (!defs[name] || built[name]) return; built[name] = defs[name].build(); }
  function prepareSoon(name) { if (!defs[name] || built[name] || pending.has(name)) return; pending.add(name); setTimeout(() => { prepare(name); pending.delete(name); }, 30); }
  function run(name, t) { prepare(name); defs[name].draw(t, built[name]); }
  // capa: dibuja con paralaje (k) y desplazamiento de cámara
  const cam = { x: 0, y: 0 };
  function blit(b, x, y, k = 1) { if (!b) return; cg.drawImage(CP.cv(b) === b.c ? b.c : cv(b), Math.round(x - cam.x * k), Math.round(y - cam.y * k)); }
  function lay(b, x, y, k = 1) { if (!b) return; if (!b.c) cv(b); cg.drawImage(b.c, Math.round(x - cam.x * k), Math.round(y - cam.y * k)); }
  function pan(t, x0, y0, x1, y1, dur = 10) { const k = Math.min(1, t / dur), e = k * k * (3 - 2 * k); cam.x = x0 + (x1 - x0) * e; cam.y = y0 + (y1 - y0) * e; }
  // efectos por fotograma
  function glow(x, y, r, col, a = 1) { const g = cg.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); cg.save(); cg.globalAlpha = a; cg.globalCompositeOperation = 'screen'; cg.fillStyle = g; cg.fillRect(x - r, y - r, r * 2, r * 2); cg.restore(); }
  function rays(x, y, n, len, spread, ang, col, a, t) {
    cg.save(); cg.globalCompositeOperation = 'screen';
    for (let i = 0; i < n; i++) {
      const aa = ang + (i / (n - 1 || 1) - 0.5) * spread + Math.sin(t * 0.3 + i * 1.7) * 0.02, w = 0.03 + (i % 3) * 0.02;
      const g = cg.createLinearGradient(x, y, x + Math.cos(aa) * len, y + Math.sin(aa) * len);
      g.addColorStop(0, col.replace('A', (a * (0.6 + 0.4 * Math.sin(t * 0.7 + i))).toFixed(3))); g.addColorStop(1, col.replace('A', '0'));
      cg.fillStyle = g; cg.beginPath(); cg.moveTo(x, y); cg.lineTo(x + Math.cos(aa - w) * len, y + Math.sin(aa - w) * len); cg.lineTo(x + Math.cos(aa + w) * len, y + Math.sin(aa + w) * len); cg.fill();
    }
    cg.restore();
  }
  function rain(t, n, a, slant = 0.35, sp = 260) {
    const R = RNG(77); cg.fillStyle = `rgba(190,200,215,${a})`;
    for (let i = 0; i < n; i++) {
      const s = sp * (0.7 + R.next() * 0.6), x0 = R.next() * (CW + 120), y0 = R.next() * CH, L = 5 + R.int(5);
      const y = (y0 + t * s) % (CH + 20) - 10, x = ((x0 - t * s * slant) % (CW + 120) + CW + 120) % (CW + 120) - 60;
      for (let j = 0; j < L; j++) cg.fillRect(Math.round(x + j * slant), Math.round(y - j), 1, 1);
    }
  }
  function embers(t, n, x0, x1, y0, col = [255, 140, 50], up = 30) {
    const R = RNG(91);
    for (let i = 0; i < n; i++) { const ph = (t * (0.08 + R.next() * 0.1) + R.next()) % 1, x = x0 + R.next() * (x1 - x0) + Math.sin(t * 2 + i) * 6, y = y0 - ph * up * 4; cg.fillStyle = `rgba(${col[0]},${col[1] + (i % 3) * 30},${col[2]},${(1 - ph) * 0.9})`; cg.fillRect(Math.round(x), Math.round(y), i % 4 ? 1 : 2, 1); }
  }
  function ash(t, n, a = 0.5) { const R = RNG(55); for (let i = 0; i < n; i++) { const ph = (t * (0.03 + R.next() * 0.04) + R.next()) % 1, x = (R.next() * CW + Math.sin(t * 0.8 + i) * 10 + t * 4) % CW, y = ph * CH; cg.fillStyle = `rgba(210,200,200,${a * (1 - ph * 0.5)})`; cg.fillRect(Math.round(x), Math.round(y), 1, 1); } }
  function flash(t, period, at, dur = 0.12, a = 0.45) { const f = t % period; if (f > at && f < at + dur) { cg.fillStyle = `rgba(230,236,255,${a})`; cg.fillRect(0, 0, CW, CH); return true; } return false; }
  function bolt(x, y, seed, len = 120) { const R = RNG(seed); cg.strokeStyle = '#f4f6ff'; cg.lineWidth = 1; cg.beginPath(); cg.moveTo(x, y); let cx = x, cy = y; while (cy < y + len) { cx += (R.next() - 0.5) * 18; cy += 6 + R.next() * 10; cg.lineTo(Math.round(cx), Math.round(cy)); } cg.stroke(); }
  function flame(x, y, s, t, i = 0) {
    for (let k = 0; k < 3; k++) {
      const h = s * (1 - k * 0.28) * (0.85 + 0.15 * Math.sin(t * 13 + i + k)), w = s * 0.32 * (1 - k * 0.25);
      cg.fillStyle = ['#c8340e', '#ff8a20', '#ffe080'][k];
      cg.beginPath(); cg.moveTo(Math.round(x - w), Math.round(y)); cg.quadraticCurveTo(x - w * 0.7, y - h * 0.5, Math.round(x + Math.sin(t * 9 + i) * w * 0.4), Math.round(y - h)); cg.quadraticCurveTo(x + w * 0.7, y - h * 0.5, Math.round(x + w), Math.round(y)); cg.fill();
    }
  }
  function fade(a, col = '0,0,0') { if (a > 0) { cg.fillStyle = `rgba(${col},${Math.min(1, a)})`; cg.fillRect(0, 0, CW, CH); } }
  return { def, prepare, prepareSoon, run, cam, lay, pan, glow, rays, rain, embers, ash, flash, bolt, flame, fade };
})();
const SCENES = {};

G.renderCine = function (g) {
  const k = this.cine; if (!k) return;
  g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH);
  if (k.idx < 0) {
    // rótulo de misión
    const a = Math.min(1, k.t / 0.6) * Math.min(1, (2.6 - k.t) / 0.5 + 0.0001);
    g.globalAlpha = Math.max(0, a);
    g.font = FB(7); this.center(g, 'NUEVA MISIÓN', VH / 2 - 14, DIM);
    g.font = FT(16); this.center(g, k.c.title, VH / 2 + 6, GOLD);
    g.fillStyle = GOLD; g.fillRect(VW / 2 - 50, VH / 2 + 13, 100, 1);
    g.globalAlpha = 1;
  } else {
    const [scene, text] = k.c.pages[k.idx];
    cg.save(); (SCENES[scene] || SCENES.valle)(k.t); cg.restore();
    cinePost();
    g.imageSmoothingEnabled = false;
    g.drawImage(cineC, 0, 0, VW, VH);
    if (k.t < 0.7) { g.fillStyle = `rgba(0,0,0,${1 - k.t / 0.7})`; g.fillRect(0, 0, VW, VH); }
    // bandas de cine y texto
    g.fillStyle = 'rgba(0,0,0,0.92)'; g.fillRect(0, 0, VW, 14);
    const grd = g.createLinearGradient(0, VH - 72, 0, VH); grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(0.35, 'rgba(0,0,0,0.8)'); grd.addColorStop(1, 'rgba(0,0,0,0.95)');
    g.fillStyle = grd; g.fillRect(0, VH - 72, VW, 72);
    g.font = FT(9.5);
    const shown = Math.floor(Math.min(text.length, k.chars)), lines = [];
    for (const para of text.split('\n')) for (const l of (para ? this.wrap(g, para, VW - 50) : [''])) lines.push(l);
    const y0 = VH - 14 - lines.length * 12;
    let used = 0;
    lines.forEach((l, i) => { const take = Math.max(0, Math.min(l.length, shown - used)); const w = g.measureText(l).width; this.text(g, l.slice(0, take), VW / 2 - w / 2, y0 + i * 12 + 8, PAPER); used += l.length + 1; });
    if (k.chars >= text.length) { g.font = FB(5.8); this.text(g, '▸', VW - 14, VH - 6, `rgba(232,196,106,${0.5 + 0.5 * Math.sin(this.clock * 5)})`); }
  }
  g.font = FB(6); const sk = 'Saltar ›';
  this.text(g, sk, VW - g.measureText(sk).width - 8, 10, DIM);
  this.cineSkip = { x: VW - 56, y: 0, w: 56, h: 18 };
};

// ---------------------------------------------------------------- posproceso: brillo suave, grano, viñeta y aberración leve
const bloomC = document.createElement('canvas'); bloomC.width = 100; bloomC.height = 56;
const bloomG = bloomC.getContext('2d');
let grainC = null, vigC = null;
function cinePost() {
  bloomG.imageSmoothingEnabled = true; bloomG.clearRect(0, 0, 100, 56); bloomG.filter = 'brightness(0.9) contrast(1.6)'; bloomG.drawImage(cineC, 0, 0, 100, 56); bloomG.filter = 'none';
  cg.save(); cg.imageSmoothingEnabled = true; cg.globalCompositeOperation = 'screen'; cg.globalAlpha = 0.22; cg.drawImage(bloomC, 0, 0, CW, CH); cg.restore();
  if (!grainC) {
    grainC = document.createElement('canvas'); grainC.width = CW + 8; grainC.height = CH + 8;
    const gg = grainC.getContext('2d'), id = gg.createImageData(grainC.width, grainC.height);
    for (let i = 0; i < grainC.width * grainC.height; i++) { const v = Math.random() * 255; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 14; }
    gg.putImageData(id, 0, 0);
    vigC = document.createElement('canvas'); vigC.width = CW; vigC.height = CH;
    const vg = vigC.getContext('2d'), gr = vg.createRadialGradient(CW / 2, CH / 2, CH * 0.32, CW / 2, CH / 2, CW * 0.62);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.55)'); vg.fillStyle = gr; vg.fillRect(0, 0, CW, CH);
  }
  cg.drawImage(grainC, -((Math.random() * 8) | 0), -((Math.random() * 8) | 0));
  cg.drawImage(vigC, 0, 0);
}
