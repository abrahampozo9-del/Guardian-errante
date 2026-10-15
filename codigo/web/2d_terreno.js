// ====================================================================== suelos de alta calidad
// Cada terreno es una textura continua de 64×64 que se corta en 16 casillas: así no se ven
// las juntas entre casillas. Encima, los bordes entre hierba, tierra y arena se funden con
// máscaras irregulares en vez de cortes cuadrados. Luz de arriba a la izquierda.
Art.initTerrain = function () {
  const { img, p, r, ov, shade, mix } = Px;
  const S = 64;
  const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) & 0xffffff) / 0x1000000; };
  // ruido de valor periódico (se repite cada 64 px sin costura)
  function wnoise(x, y, cell, s) {
    const n = S / cell, gx = x / cell, gy = y / cell, xi = Math.floor(gx), yi = Math.floor(gy);
    let fx = gx - xi, fy = gy - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const g = (i, j) => hash(((i % n) + n) % n, ((j % n) + n) % n, s);
    const a = g(xi, yi), b = g(xi + 1, yi), c = g(xi, yi + 1), d = g(xi + 1, yi + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }
  const fbm = (x, y, s) => 0.55 * wnoise(x, y, 16, s) + 0.3 * wnoise(x, y, 8, s + 1) + 0.15 * wnoise(x, y, 4, s + 2);
  const wp = (b, x, y, c) => p(b, ((x % S) + S) % S, ((y % S) + S) % S, c);
  const ramp = (cols, t) => cols[Math.max(0, Math.min(cols.length - 1, Math.floor(t * cols.length)))];
  const R = RNG(777);

  // ---------------------------------------------------------------- recetas
  function grass(cols, blade, flowers, seed, lush) {
    const b = img(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const n = fbm(x, y, seed) * 0.85 + hash(x, y, seed + 9) * 0.15;
      b.d[y * S + x] = (0xff000000 | ramp(cols, n * 0.9 + 0.05)) >>> 0;
    }
    // matas de hierba: trazos verticales, oscuros abajo y claros en la punta
    const nb = lush ? 260 : 200;
    for (let i = 0; i < nb; i++) {
      const x = R.int(S), y = R.int(S), h = 2 + R.int(lush ? 4 : 3), lean = R.int(3) - 1;
      for (let k = 0; k < h; k++) wp(b, x + (k === h - 1 ? lean : 0), y - k, k === h - 1 ? blade[2] : k === 0 ? blade[0] : blade[1]);
      if (R.next() < 0.5) { wp(b, x + 1, y, blade[0]); wp(b, x + 1, y - 1, blade[1]); }
    }
    for (const [c, c2, n] of flowers) for (let i = 0; i < n; i++) {
      // en corros: casi todas cerca de unos pocos centros
      const cx = Math.floor(hash(i >> 2, 7, seed + c) * S), cy = Math.floor(hash(i >> 2, 8, seed + c) * S);
      const x = cx + R.int(7) - 3, y = cy + R.int(7) - 3;
      wp(b, x, y, c); wp(b, x + 1, y, c); wp(b, x, y + 1, c2); wp(b, x - 1, y, c); wp(b, x, y - 1, c);
      wp(b, x, y, 0xfff4b0);
    }
    return b;
  }
  function soil(cols, pebble, seed, opts = {}) {
    const b = img(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const n = fbm(x, y, seed) * 0.75 + hash(x, y, seed + 3) * 0.25;
      b.d[y * S + x] = (0xff000000 | ramp(cols, n)) >>> 0;
    }
    // grietas finas
    for (let i = 0; i < (opts.cracks || 4); i++) {
      let x = R.int(S), y = R.int(S);
      for (let k = 0; k < 6 + R.int(8); k++) { wp(b, x, y, shade(cols[0], 0.85)); x += R.int(3) - 1; y += R.bool() ? 1 : 0; }
    }
    // piedrecitas con luz y sombra
    for (let i = 0; i < (opts.pebbles || 34); i++) {
      const x = R.int(S), y = R.int(S), c = pebble[R.int(pebble.length)], big = R.next() < 0.3;
      wp(b, x + 1, y + 1, shade(cols[0], 0.8)); if (big) { wp(b, x + 2, y + 1, shade(cols[0], 0.8)); wp(b, x + 1, y + 2, shade(cols[0], 0.8)); }
      wp(b, x, y, c); if (big) { wp(b, x + 1, y, c); wp(b, x, y + 1, shade(c, 0.85)); wp(b, x + 1, y + 1, shade(c, 0.8)); }
      wp(b, x, y, shade(c, 1.15));
    }
    // alguna mata suelta
    for (let i = 0; i < (opts.tufts || 0); i++) { const x = R.int(S), y = R.int(S); for (let k = 0; k < 3; k++) { wp(b, x + k - 1, y - (k === 1 ? 2 : 1), 0x7a8a3e); wp(b, x + k - 1, y, 0x5a6a2c); } }
    return b;
  }
  function cobbles(cols, mortar, seed) {
    // empedrado: celdas de Voronoi periódicas, cada piedra abombada (luz arriba-izquierda)
    const b = img(S, S), pts = [];
    const n = 120;
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
      else {
        const lit = -(bdx + bdy) / (best + 2);
        if (edge < 1.7 && bdx + bdy > 0) c = shade(c, 0.8); else if (lit > 0.35 && best > 1.0) c = shade(c, 1.12);
        if (hash(x, y, seed + 5) < 0.06) c = shade(c, 0.92);
      }
      b.d[y * S + x] = (0xff000000 | c) >>> 0;
    }
    return b;
  }
  function water(f, deep) {
    const b = img(S, S);
    const cols = deep ? [0x163a4e, 0x1a4458, 0x1f4e62, 0x25586c] : [0x1f6a70, 0x24777c, 0x2a8488, 0x339092];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const n = fbm(x + f * 4, y + f * 2, deep ? 61 : 51);
      b.d[y * S + x] = (0xff000000 | ramp(cols, n)) >>> 0;
    }
    // ondas: arcos claros que se desplazan
    const W = RNG(deep ? 9 : 5);
    for (let i = 0; i < (deep ? 14 : 22); i++) {
      const x0 = W.int(S), y0 = W.int(S), len = 3 + W.int(5), xx = x0 + f * 2;
      for (let k = 0; k < len; k++) wp(b, xx + k, y0 + (k === 0 || k === len - 1 ? 1 : 0), deep ? 0x4f93ab : 0x7fd2c8);
      if (!deep) wp(b, xx + 1, y0 - 1 + 0, 0xb8f0e6);
    }
    // destellos
    for (let i = 0; i < 6; i++) { const x = W.int(S), y = W.int(S); if ((i + f) % 4 === 0) { wp(b, x, y, 0xffffff); wp(b, x + 1, y, 0xd8fff8); } }
    return b;
  }
  function rockFace(seed) {
    // cortado de arcilla y arenisca (cárcavas de Pozo Alcón): estratos ocres y surcos de erosión
    const b = img(S, S);
    const cols = [0x8a6a44, 0xa07e54, 0xb59464, 0xc6a676, 0xd6b98a];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const strata = Math.sin((y + wnoise(x, y, 16, seed) * 6) * 0.9) * 0.5 + 0.5;
      const groove = wnoise(x, y * 0.25, 4, seed + 4);
      let n = strata * 0.55 + fbm(x, y, seed + 1) * 0.45;
      if (groove > 0.72) n -= 0.25; else if (groove > 0.62) n += 0.12;
      b.d[y * S + x] = (0xff000000 | ramp(cols, n)) >>> 0;
    }
    for (let i = 0; i < 30; i++) { const x = R.int(S), y = R.int(S); wp(b, x, y, 0x6e5234); wp(b, x + 1, y, 0xe6cfa0); }
    return b;
  }
  function limestone(seed) {
    const b = img(S, S);
    const cols = [0x6f6a61, 0x858076, 0x9d978c, 0xb0aa9e, 0xc4beb2];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const n = fbm(x, y, seed) * 0.8 + hash(x, y, seed) * 0.2;
      b.d[y * S + x] = (0xff000000 | ramp(cols, n)) >>> 0;
    }
    for (let i = 0; i < 10; i++) { let x = R.int(S), y = R.int(S); for (let k = 0; k < 10; k++) { wp(b, x, y, 0x55514a); wp(b, x + 1, y, 0xc8c2b6); x += R.int(3) - 1; y += 1; } }
    for (let i = 0; i < 18; i++) { const x = R.int(S), y = R.int(S); for (let k = 0; k < 4; k++) wp(b, x + R.int(3) - 1, y - R.int(3), k % 2 ? 0x5d6a35 : 0x48562a); }
    return b;
  }
  function asphalt() {
    const b = img(S, S), cols = [0x46464b, 0x4e4e53, 0x56565b, 0x5e5e63];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) b.d[y * S + x] = (0xff000000 | ramp(cols, fbm(x, y, 71) * 0.5 + hash(x, y, 72) * 0.5)) >>> 0;
    for (let i = 0; i < 6; i++) { let x = R.int(S), y = R.int(S); for (let k = 0; k < 12; k++) { wp(b, x, y, 0x333337); x += R.int(3) - 1; y += 1; } }
    for (let i = 0; i < 14; i++) { const x = R.int(S), y = R.int(S); wp(b, x, y, 0x6a7a3a); wp(b, x, y - 1, 0x8a9a4a); }
    return b;
  }
  function field() {
    const b = img(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const row = y % 4, n = fbm(x, y, 81);
      const base = row === 0 ? 0x8a5a40 : row === 1 ? 0xb07a56 : row === 2 ? 0xa06c4c : 0x93604a;
      b.d[y * S + x] = (0xff000000 | shade(base, 0.92 + n * 0.16)) >>> 0;
    }
    for (let i = 0; i < 60; i++) { const x = R.int(S), y = R.int(S / 4) * 4 + 1; wp(b, x, y, 0xc4906a); wp(b, x + 1, y + 1, 0x7a4c34); }
    return b;
  }
  function concrete() {
    const b = img(S, S), cols = [0xc8bfab, 0xd2c9b5, 0xdad1bd, 0xe2dac8];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      let c = ramp(cols, fbm(x, y, 91) * 0.6 + hash(x, y, 92) * 0.4);
      b.d[y * S + x] = (0xff000000 | c) >>> 0;
    }
    for (let i = 0; i < 5; i++) { const x = R.int(S), y = R.int(S); for (let k = 0; k < 12; k++) wp(b, x + R.int(5) - 2, y + R.int(5) - 2, 0xbab09a); }
    return b;
  }

  // ---------------------------------------------------------------- atlas
  const A = Art.atlas = {};
  const GRASS_DRY = [0x545a34, 0x63683a, 0x737542, 0x83824c, 0x928e56];
  const GRASS_LUSH = [0x2c3e28, 0x354a2c, 0x3f5632, 0x4a6238, 0x5a7240];
  A[T.GRASS] = [grass(GRASS_DRY, [0x484c2a, 0x7a7c48, 0xa8a272], [[0xd8d4c4, 0x8a8678, 3], [0xc8a84a, 0x7a6a2a, 2], [0x9a7ab8, 0x5a4a78, 1]], 11, false)];
  A[T.GRASS_GREEN] = [grass(GRASS_LUSH, [0x22321e, 0x4e6a3a, 0x7a9a5a], [[0xd8dcd0, 0x8a9088, 4], [0xb03a30, 0x6a2018, 3], [0x8ab0c8, 0x4a6a80, 3]], 21, true)];
  A[T.DIRT] = [soil([0xb09a70, 0xbfa97e, 0xcdb98e, 0xd8c69c, 0xe2d3ac], [0xa8967a, 0xc8bc9a, 0x9a8a70], 31, { tufts: 8 })];
  A[T.TRACK] = [soil([0xc6b48c, 0xd2c09a, 0xdccca6, 0xe4d6b4, 0xece0c0], [0xb7a684, 0xd8ccb0], 41, { pebbles: 50, cracks: 2 })];
  A[T.SAND] = [soil([0xbcae8e, 0xc8baa0, 0xd2c6ac, 0xdcd2ba, 0xe6dec8], [0xa9a49a, 0xe8e2d2, 0x8a8a84], 51, { pebbles: 40, cracks: 0 })];
  A[T.PAVING] = [cobbles([0xa49c8c, 0xb0a898, 0xbcb4a4, 0x9a9282, 0xc4bcac], 0x6e685c, 61)];
  A[T.ASPHALT] = [asphalt()];
  A[T.FIELD] = [field()];
  A[T.CONCRETE] = [concrete()];
  A[T.CLIFF] = [rockFace(101)];
  A[T.MOUNTAIN] = [limestone(111)];
  A[T.WATER] = [0, 1, 2, 3].map(f => water(f, false));
  A[T.DEEP] = [0, 1, 2, 3].map(f => water(f, true));
  // cortar en casillas
  const slice = (src, i, j) => { const t = img(16, 16); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) t.d[y * 16 + x] = src.d[(j * 16 + y) * S + i * 16 + x]; return t; };
  for (const id in A) {
    const frames = A[id];
    Art.tiles[id] = [];
    for (let k = 0; k < 16; k++) Art.tiles[id][k] = frames.map(fr => slice(fr, k & 3, k >> 2));
    let rr = 0, gg = 0, bb = 0; const d = frames[0].d;
    for (let i = 0; i < d.length; i++) { rr += (d[i] >> 16) & 255; gg += (d[i] >> 8) & 255; bb += d[i] & 255; }
    Art.tileColor[id] = ((rr / d.length) << 16) | ((gg / d.length) << 8) | (bb / d.length);
  }
  Art.atlasIds = new Set(Object.keys(A).map(Number));

  // ---------------------------------------------------------------- fundidos entre terrenos
  // Prioridad: el de número más alto se derrama sobre el vecino de número más bajo.
  Art.blendPri = { [T.DEEP]: 0.2, [T.WATER]: 0.4, [T.ASPHALT]: 0.6, [T.SAND]: 1, [T.FIELD]: 2, [T.DIRT]: 3, [T.TRACK]: 2.5, [T.GRASS]: 4, [T.GRASS_GREEN]: 5 };
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
      // borde: una línea más oscura donde termina la capa (da relieve)
      for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
        const i = yy * 16 + xx; if (!mk[i]) continue;
        const out = (dx, dy) => { const X = xx + dx, Y = yy + dy; return X >= 0 && Y >= 0 && X < 16 && Y < 16 && !mk[Y * 16 + X]; };
        if (out(0, 1) || out(1, 0)) b.d[i] = (0xff000000 | shade(src.d[i] & 0xffffff, 0.78)) >>> 0;
        else if (out(0, -1) || out(-1, 0)) b.d[i] = (0xff000000 | shade(src.d[i] & 0xffffff, 1.1)) >>> 0;
      }
      if (onWater && !T.isWater(id)) { // orilla: espuma clara justo fuera de la tierra y agua somera
        for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
          const i = yy * 16 + xx; if (mk[i]) continue;
          let dmin = 9;
          for (let j = -2; j <= 2; j++) for (let q = -2; q <= 2; q++) { const X = xx + q, Y = yy + j; if (X >= 0 && Y >= 0 && X < 16 && Y < 16 && mk[Y * 16 + X]) dmin = Math.min(dmin, Math.abs(q) + Math.abs(j)); }
          if (dmin === 1) b.d[i] = 0xffd8f4ee; else if (dmin === 2) b.d[i] = 0x8070d0c8; else if (dmin <= 3) b.d[i] = 0x4070d0c8;
        }
      }
      c = cv(b); cache.set(key, c);
    }
    return c;
  };
};
