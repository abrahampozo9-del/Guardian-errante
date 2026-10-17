// ====================================================================== suelos
// Cada terreno es una textura continua de 64×64 que se corta en 16 casillas (no se ven juntas).
// Criterios (guías de tiles top-down de Slynyrd): pocos colores por textura, matas agrupadas con
// huecos lisos entre ellas ("espacio negativo"), valores bien separados entre terrenos para que se
// lean de un vistazo, sombras que tiran a azul/violeta y luces que tiran a amarillo.
// Los cortados y la sierra tienen dos texturas: la CIMA (lo que se ve desde arriba) y la PARED
// frontal (estratos verticales), que el dibujo pone en las dos filas del borde sur: así hay relieve.
Art.initTerrain = function () {
  const { img, p, shade, mix } = Px;
  const S = 64;
  const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) & 0xffffff) / 0x1000000; };
  function wnoise(x, y, cell, s, W = S, H = S) {
    const nx = W / cell, ny = H / cell, gx = x / cell, gy = y / cell, xi = Math.floor(gx), yi = Math.floor(gy);
    let fx = gx - xi, fy = gy - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const g = (i, j) => hash(((i % nx) + nx) % nx, ((j % ny) + ny) % ny, s);
    const a = g(xi, yi), b = g(xi + 1, yi), c = g(xi, yi + 1), d = g(xi + 1, yi + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }
  const fbm = (x, y, s) => 0.55 * wnoise(x, y, 16, s) + 0.3 * wnoise(x, y, 8, s + 1) + 0.15 * wnoise(x, y, 4, s + 2);
  const wp = (b, x, y, c) => { const W = b.w, H = b.h; p(b, ((x % W) + W) % W, ((y % H) + H) % H, c); };
  const get = (b, x, y) => b.d[((((y % b.h) + b.h) % b.h) * b.w) + (((x % b.w) + b.w) % b.w)] & 0xffffff;
  const pick = (cols, t) => cols[Math.max(0, Math.min(cols.length - 1, Math.floor(t * cols.length)))];
  const R = RNG(777);
  // base en manchas grandes: 3 valores como mucho, con tramado en la frontera (16 bits)
  function base(b, cols, seed, cell = 16, dith = 0.06) {
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
      const n = 0.7 * wnoise(x, y, cell, seed, b.w, b.h) + 0.3 * wnoise(x, y, cell / 2, seed + 1, b.w, b.h);
      const d = ((x + y) & 1) ? dith : -dith;
      b.d[y * b.w + x] = (0xff000000 | pick(cols, Math.max(0, Math.min(0.999, (n - 0.2) * 1.6 + d)))) >>> 0;
    }
  }
  // mata de hierba: abanico de briznas, oscura en la base y con punta clara
  function tuft(b, x, y, h, cols, w = 2) {
    for (let i = -w; i <= w; i++) {
      const hh = h - Math.abs(i) + (R.next() < 0.3 ? 1 : 0), lean = i < 0 ? -1 : i > 0 ? 1 : 0;
      for (let k = 0; k < hh; k++) {
        const xx = x + i + (k > hh / 2 ? lean : 0), c = k === hh - 1 ? cols[2] : k === 0 ? cols[0] : cols[1];
        wp(b, xx, y - k, c);
      }
    }
    wp(b, x - w, y + 1, cols[3] !== undefined ? cols[3] : shade(cols[0], 0.8)); wp(b, x + w, y + 1, cols[3] !== undefined ? cols[3] : shade(cols[0], 0.8));
  }
  function stone(b, x, y, c, big) {
    const sh = shade(get(b, x, y + 1), 0.72);
    wp(b, x, y + 1, sh); wp(b, x + 1, y + 1, sh); if (big) { wp(b, x + 2, y + 1, sh); wp(b, x + 2, y, sh); }
    wp(b, x, y, c); wp(b, x + 1, y, shade(c, 0.85)); if (big) { wp(b, x + 1, y - 1, shade(c, 1.12)); wp(b, x, y - 1, shade(c, 1.18)); }
  }
  // corros: centros repartidos y elementos alrededor (agrupar, nunca espolvorear uniforme)
  function clusters(n, spread, per, fn, seed) {
    for (let i = 0; i < n; i++) {
      const cx = Math.floor(hash(i, 1, seed) * S), cy = Math.floor(hash(i, 2, seed) * S);
      for (let k = 0; k < per; k++) fn(cx + Math.round(R.gauss() * spread), cy + Math.round(R.gauss() * spread * 0.8), k);
    }
  }

  // ---------------------------------------------------------------- recetas
  function grass(cols, blade, flowers, seed, nClump, straw) {
    const b = img(S, S);
    base(b, cols, seed);
    clusters(nClump, 3.2, 5, (x, y) => tuft(b, x, y, 3 + R.int(2), blade, 1 + R.int(2)), seed + 5);
    for (let i = 0; i < 26; i++) { const x = R.int(S), y = R.int(S); wp(b, x, y, blade[1]); wp(b, x, y - 1, blade[2]); } // briznas sueltas
    if (straw) for (let i = 0; i < 18; i++) { const x = R.int(S), y = R.int(S); wp(b, x, y, straw); wp(b, x + 1, y - 1, straw); }
    for (const [c, c2, n] of flowers) clusters(n, 2, 4, (x, y) => { wp(b, x, y, c); wp(b, x, y + 1, c2); }, seed + c % 97);
    return b;
  }
  function soil(cols, pebble, seed, opts = {}) {
    const b = img(S, S);
    base(b, cols, seed, 16, 0.08);
    for (let i = 0; i < (opts.cracks || 0); i++) { let x = R.int(S), y = R.int(S); for (let k = 0; k < 5 + R.int(7); k++) { wp(b, x, y, shade(cols[0], 0.82)); x += R.int(3) - 1; y += R.bool() ? 1 : 0; } }
    clusters(opts.pebbleClusters || 10, 3, opts.perCluster || 4, (x, y) => stone(b, x, y, pebble[R.int(pebble.length)], R.next() < 0.3), seed + 7);
    if (opts.ruts) for (const ry of [18, 44]) for (let x = 0; x < S; x++) { const yy = ry + Math.round(Math.sin(x * 0.2) * 1); wp(b, x, yy, shade(cols[0], 0.86)); wp(b, x, yy + 1, shade(cols[1], 1.08)); }
    if (opts.weeds) clusters(opts.weeds, 2.5, 3, (x, y) => tuft(b, x, y, 2 + R.int(2), opts.weedCols, 1), seed + 9);
    return b;
  }
  function olivar() {
    // tierra de olivar de Jaén: rojiza, labrada, con terrones y alguna hierba
    const b = img(S, S), cols = [0x6e4430, 0x7c4e36, 0x8a5a3e, 0x98674a];
    base(b, cols, 131, 16, 0.07);
    for (let y = 0; y < S; y += 6) for (let x = 0; x < S; x++) if (hash(x, y, 3) < 0.7) { wp(b, x, y + (x % 7 === 0 ? 1 : 0), 0x5e3826); wp(b, x, y + 1, 0x9a6a4c); }
    clusters(14, 3, 4, (x, y) => { wp(b, x, y, 0xa87656); wp(b, x + 1, y, 0x8a5a3e); wp(b, x, y + 1, 0x5a3424); }, 133);
    clusters(5, 2.5, 3, (x, y) => tuft(b, x, y, 2 + R.int(2), [0x4a5226, 0x6a7432, 0x8a9442], 1), 135);
    return b;
  }
  function scrub() {
    // estepa de esparto (Los Llanos): suelo claro y pajizo, matas de esparto redondas y separadas
    const b = img(S, S), cols = [0x9a8a5e, 0xa69666, 0xb2a272];
    base(b, cols, 141, 16, 0.07);
    for (let i = 0; i < 9; i++) {
      const x = Math.floor(hash(i, 1, 143) * S), y = Math.floor(hash(i, 2, 143) * S);
      for (let k = 0; k < 7; k++) { const dx = k - 3; wp(b, x + dx, y + 1, 0x6a6036); }
      for (let k = 0; k < 9; k++) { const dx = k - 4, hh = 4 - Math.abs(dx) * 0.6; for (let j = 0; j < hh; j++) wp(b, x + dx + (j > 2 ? Math.sign(dx) : 0), y - j, j > hh - 1.5 ? 0xc8bc80 : j === 0 ? 0x5e6232 : 0x7e8040); }
    }
    clusters(6, 4, 3, (x, y) => stone(b, x, y, 0xc4b896, R.next() < 0.4), 145);
    return b;
  }
  function cobbles(cols, mortar, seed) {
    const b = img(S, S), pts = [], n = 190;
    for (let i = 0; i < n; i++) pts.push([hash(i, 1, seed) * S, hash(i, 2, seed) * S, cols[Math.floor(hash(i, 3, seed) * cols.length)]]);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      let best = 1e9, second = 1e9, bi = 0, bdx = 0, bdy = 0;
      for (let i = 0; i < n; i++) {
        let dx = x + 0.5 - pts[i][0], dy = y + 0.5 - pts[i][1];
        if (dx > S / 2) dx -= S; if (dx < -S / 2) dx += S; if (dy > S / 2) dy -= S; if (dy < -S / 2) dy += S;
        const d = Math.hypot(dx, dy * 1.15);
        if (d < best) { second = best; best = d; bi = i; bdx = dx; bdy = dy; } else if (d < second) second = d;
      }
      const edge = second - best;
      let c = pts[bi][2];
      if (edge < 0.9) c = mortar;
      else if (edge < 1.8 && bdx + bdy > 0) c = shade(c, 0.78);
      else if (-(bdx + bdy) / (best + 2) > 0.35 && best > 1.0) c = shade(c, 1.12);
      b.d[y * S + x] = (0xff000000 | c) >>> 0;
    }
    clusters(4, 2, 3, (x, y) => { wp(b, x, y, 0x4a5a2a); wp(b, x, y - 1, 0x6a7a3a); }, seed + 3); // hierbajos entre las piedras
    return b;
  }
  // agua: red de ondas finas (líneas de contorno del ruido) con sombra desplazada debajo
  function water(f, deep) {
    const b = img(S, S);
    const cols = deep ? [0x0f2a3a, 0x123244, 0x15394c] : [0x184a56, 0x1c5662, 0x21606a];
    base(b, cols, deep ? 61 : 51, 32, 0.05);
    const thr = [0.5, 0.515, 0.53, 0.515][f], hi = deep ? 0x3a7a92 : 0x5ab8b4, hi2 = deep ? 0x5a9ab0 : 0x9ae0d4, lo = deep ? 0x0b2230 : 0x123c48;
    const nv = (x, y) => 0.6 * wnoise(x, y, 16, deep ? 71 : 81) + 0.4 * wnoise(x + f * 2, y, 8, deep ? 72 : 82);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const n = nv(x, y);
      if (Math.abs(n - thr) < 0.012 && hash(x >> 2, y >> 1, f + 5) > 0.25) { wp(b, x, y, hash(x, y, 9) < 0.15 ? hi2 : hi); if (get(b, x, y + 2) !== hi) wp(b, x, y + 2, lo); }
    }
    for (let i = 0; i < 5; i++) { const x = Math.floor(hash(i, f, 21) * S), y = Math.floor(hash(i, f, 22) * S); wp(b, x, y, 0xe8fff8); wp(b, x + 1, y, hi2); }
    return b;
  }
  // pared de cortado: estratos horizontales de arcilla, surcos verticales de erosión; 64×32 (dos filas)
  function face(cols, seed, opts = {}) {
    const W = S, H = 32, b = img(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const strata = Math.sin((y + wnoise(x, y, 16, seed, W, H) * 5) * (opts.blocky ? 0.5 : 0.95)) * 0.5 + 0.5;
      const groove = wnoise(x, y * 0.2, 4, seed + 4, W, H);
      let n = strata * 0.5 + wnoise(x, y, 8, seed + 1, W, H) * 0.5;
      if (groove > 0.7) n -= 0.3; else if (groove > 0.6) n += 0.16;
      n -= (y / H) * 0.35; // oscurece hacia el pie (oclusión)
      if (y < 2) n += 0.35; // labio iluminado arriba
      b.d[y * W + x] = (0xff000000 | pick(cols, Math.max(0, Math.min(0.999, n + 0.15)))) >>> 0;
    }
    if (opts.blocky) for (let i = 0; i < 18; i++) { const x = R.int(W), y = 3 + R.int(H - 6); for (let k = 0; k < 4 + R.int(6); k++) wp(b, x + k, y, shade(cols[0], 0.8)); wp(b, x, y - 1, cols[cols.length - 1]); }
    for (let i = 0; i < (opts.plants || 0); i++) { const x = R.int(W), y = 4 + R.int(H - 10); tuft(b, x, y, 2, opts.plantCols, 1); }
    for (let x = 0; x < W; x++) { wp(b, x, H - 1, shade(cols[0], 0.7)); }
    return b;
  }
  function top(cols, seed, tufts, tuftCols, stones) {
    const b = img(S, S);
    base(b, cols, seed, 16, 0.07);
    clusters(tufts, 3, 3, (x, y) => tuft(b, x, y, 2 + R.int(3), tuftCols, 1 + R.int(2)), seed + 3);
    clusters(stones || 4, 3, 3, (x, y) => stone(b, x, y, mix(cols[cols.length - 1], 0xffffff, 0.15), R.next() < 0.5), seed + 4);
    return b;
  }
  function asphalt() {
    const b = img(S, S), cols = [0x3a3a40, 0x424248, 0x4a4a50];
    base(b, cols, 71, 16, 0.08);
    for (let i = 0; i < 5; i++) { let x = R.int(S), y = R.int(S); for (let k = 0; k < 14; k++) { wp(b, x, y, 0x2a2a30); x += R.int(3) - 1; y += 1; } }
    clusters(4, 2, 3, (x, y) => { wp(b, x, y, 0x5a6a2e); wp(b, x, y - 1, 0x7a8a3e); }, 73);
    return b;
  }
  function field() {
    const b = img(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const row = y % 4, n = fbm(x, y, 81);
      const base0 = row === 0 ? 0x5e3a28 : row === 1 ? 0x8a5a3c : row === 2 ? 0x7a4e34 : 0x6a442e;
      b.d[y * S + x] = (0xff000000 | shade(base0, 0.92 + n * 0.16)) >>> 0;
    }
    for (let i = 0; i < 40; i++) { const x = R.int(S), y = R.int(S / 4) * 4 + 1; wp(b, x, y, 0x9e6c4a); wp(b, x + 1, y + 1, 0x4e3020); }
    clusters(6, 3, 4, (x, y) => { const yy = (y >> 2) * 4 + 1; tuft(b, x, yy, 2, [0x3a4a22, 0x5a6e30, 0x7e9242], 1); }, 83); // brotes en los surcos
    return b;
  }
  function concrete() {
    const b = img(S, S), cols = [0xa8a090, 0xb4ac9c, 0xc0b8a8];
    base(b, cols, 91, 16, 0.06);
    for (let x = 0; x < S; x += 32) for (let y = 0; y < S; y++) wp(b, x, y, 0x8e8676);
    for (let y = 0; y < S; y += 32) for (let x = 0; x < S; x++) wp(b, x, y, 0x8e8676);
    for (let i = 0; i < 4; i++) { let x = R.int(S), y = R.int(S); for (let k = 0; k < 9; k++) { wp(b, x, y, 0x847c6c); x += R.int(3) - 1; y += 1; } }
    return b;
  }

  // ---------------------------------------------------------------- atlas
  const A = Art.atlas = {};
  A[T.GRASS] = [grass([0x4c5a2e, 0x55642f, 0x5f6e34], [0x3a4624, 0x6a7a36, 0x96a04e], [[0xc8c0a0, 0x7a7458, 2], [0xc8a040, 0x6a5a22, 2]], 11, 9, 0x9c9050)];
  A[T.GRASS_GREEN] = [grass([0x2e4a2a, 0x34522c, 0x3b5c30], [0x223a20, 0x4e7236, 0x7ea04a], [[0xe0e0d0, 0x8a9088, 3], [0xb8402e, 0x6a2018, 2], [0x9ab8d8, 0x4a6a80, 2]], 21, 12, null)];
  A[T.DIRT] = [soil([0x8a6e4a, 0x967852, 0xa2845c], [0xb09a76, 0xc4b08a, 0x8a7a62], 31, { pebbleClusters: 8, cracks: 2, weeds: 4, weedCols: [0x3e4822, 0x5e6a2e, 0x82904a] })];
  A[T.TRACK] = [soil([0xa88e64, 0xb4996c, 0xbea476], [0xc8b48e, 0xd8c8a4, 0x9a8a6c], 41, { pebbleClusters: 10, perCluster: 3, ruts: true })];
  A[T.SAND] = [soil([0x8e8676, 0x9a9282, 0xa69e8c], [0xbab2a0, 0xd0c8b6, 0x787266, 0x6e7a7e], 51, { pebbleClusters: 16, perCluster: 5 })];
  A[T.PAVING] = [cobbles([0x7e786e, 0x8a8478, 0x969082, 0x747066, 0x9e988a], 0x4a4640, 61)];
  A[T.ASPHALT] = [asphalt()];
  A[T.FIELD] = [field()];
  A[T.CONCRETE] = [concrete()];
  A[T.OLIVAR] = [olivar()];
  A[T.SCRUB] = [scrub()];
  // cimas
  A[T.CLIFF] = [top([0x8a6c48, 0x967650, 0xa28258], 101, 6, [0x5a5428, 0x7a7436, 0x9a9448], 6)];
  A[T.MOUNTAIN] = [top([0x5e5c56, 0x6a6862, 0x76746c], 111, 10, [0x2e4026, 0x44583a, 0x5e7448], 8)];
  A[T.WATER] = [0, 1, 2, 3].map(f => water(f, false));
  A[T.DEEP] = [0, 1, 2, 3].map(f => water(f, true));
  // paredes (dos filas: 0 = la de arriba, 1 = la del pie)
  Art.faceTex = {
    [T.CLIFF]: face([0x5a3e2a, 0x6e4c32, 0x84603e, 0x9a744c, 0xb08a5c, 0xc4a070], 121, { plants: 4, plantCols: [0x3a3a1e, 0x5a5a2a, 0x7a7a3a] }),
    [T.MOUNTAIN]: face([0x3a3a3e, 0x48484c, 0x56565a, 0x66666a, 0x78787a, 0x8c8c8c], 131, { blocky: true, plants: 6, plantCols: [0x223020, 0x34482c, 0x4a6038] }),
  };
  // cortar en casillas
  const slice = (src, i, j) => { const t = img(16, 16); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) t.d[y * 16 + x] = src.d[(j * 16 + y) * src.w + i * 16 + x]; return t; };
  for (const id in A) {
    const frames = A[id];
    Art.tiles[id] = [];
    for (let k = 0; k < 16; k++) Art.tiles[id][k] = frames.map(fr => slice(fr, k & 3, k >> 2));
    let rr = 0, gg = 0, bb = 0; const d = frames[0].d;
    for (let i = 0; i < d.length; i++) { rr += (d[i] >> 16) & 255; gg += (d[i] >> 8) & 255; bb += d[i] & 255; }
    Art.tileColor[id] = ((rr / d.length) << 16) | ((gg / d.length) << 8) | (bb / d.length);
  }
  Art.faces = {};
  for (const id in Art.faceTex) { Art.faces[id] = [[0, 1, 2, 3].map(i => slice(Art.faceTex[id], i, 0)), [0, 1, 2, 3].map(i => slice(Art.faceTex[id], i, 1))]; }
  Art.atlasIds = new Set(Object.keys(A).map(Number));

  // ---------------------------------------------------------------- fundidos entre terrenos
  // Prioridad: el de número más alto se derrama sobre el vecino de número más bajo.
  Art.blendPri = { [T.DEEP]: 0.2, [T.WATER]: 0.4, [T.ASPHALT]: 0.6, [T.SAND]: 1, [T.FIELD]: 2, [T.OLIVAR]: 2.2, [T.TRACK]: 2.5, [T.DIRT]: 3, [T.SCRUB]: 3.5, [T.GRASS]: 4, [T.GRASS_GREEN]: 5 };
  // máscaras: 0 N, 1 E, 2 S, 3 W, 4 NE, 5 SE, 6 SW, 7 NW (dos variantes cada una)
  const masks = [];
  for (let m = 0; m < 8; m++) for (let v = 0; v < 2; v++) {
    const mk = new Uint8Array(256), M = RNG(m * 13 + v * 7 + 3);
    const raw = []; for (let i = 0; i < 18; i++) raw.push(2.6 + Math.sin(i * 0.55 + v * 2 + m) * 1.1 + M.next() * 0.9);
    const prof = []; for (let i = 0; i < 16; i++) prof.push((raw[i] + raw[i + 1] + raw[i + 2]) / 3);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      let d;
      if (m === 0) d = y < prof[x]; else if (m === 2) d = 15 - y < prof[x]; else if (m === 1) d = 15 - x < prof[y]; else if (m === 3) d = x < prof[y];
      else { const cx = m === 4 || m === 5 ? 15 : 0, cy = m === 4 || m === 7 ? 0 : 15; d = Math.hypot(x - cx, y - cy) < 3.2 + prof[(x + y) & 15] * 0.35; }
      mk[y * 16 + x] = d ? 1 : 0;
    }
    masks.push(mk);
  }
  const cache = new Map();
  Art.blend = function (id, x, y, m, onWater) {
    const k = (x & 3) + ((y & 3) << 2), v = ((x * 7 + y * 13) >>> 0) & 1, key = (onWater ? 500000 : 0) + id * 1000 + k * 40 + m * 2 + v;
    let c = cache.get(key);
    if (!c) {
      const src = Art.tiles[id][k][0], mk = masks[m * 2 + v], b = img(16, 16);
      for (let i = 0; i < 256; i++) if (mk[i]) b.d[i] = src.d[i];
      for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
        const i = yy * 16 + xx; if (!mk[i]) continue;
        const out = (dx, dy) => { const X = xx + dx, Y = yy + dy; return X >= 0 && Y >= 0 && X < 16 && Y < 16 && !mk[Y * 16 + X]; };
        if (out(0, 1) || out(1, 0)) b.d[i] = (0xff000000 | shade(src.d[i] & 0xffffff, 0.74)) >>> 0;
        else if (out(0, -1) || out(-1, 0)) b.d[i] = (0xff000000 | shade(src.d[i] & 0xffffff, 1.12)) >>> 0;
      }
      if (onWater && !T.isWater(id)) { // orilla: espuma justo fuera de la tierra y agua somera
        for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
          const i = yy * 16 + xx; if (mk[i]) continue;
          let dmin = 9;
          for (let j = -2; j <= 2; j++) for (let q = -2; q <= 2; q++) { const X = xx + q, Y = yy + j; if (X >= 0 && Y >= 0 && X < 16 && Y < 16 && mk[Y * 16 + X]) dmin = Math.min(dmin, Math.abs(q) + Math.abs(j)); }
          if (dmin === 1) b.d[i] = ((xx + yy) & 3) ? 0xffb8e0d8 : 0xffe8fff8; else if (dmin === 2) b.d[i] = 0x9060a8a8; else if (dmin <= 3) b.d[i] = 0x50407a80;
        }
      }
      c = cv(b); cache.set(key, c);
    }
    return c;
  };
};
