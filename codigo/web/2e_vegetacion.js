// ====================================================================== árboles y matas con volumen
// Copas hechas de racimos de hojas, cada racimo iluminado desde arriba a la izquierda,
// con el interior en sombra y un contorno del color más oscuro de la copa (no negro).
Art.initVegetation = function () {
  const { img, p, r, ov, ova, line, shade, mix } = Px;
  const put = (k, b) => { Art.P[k] = b; };
  const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) & 0xffffff) / 0x1000000; };

  // copa: racimos dentro de una elipse; ramp = [contorno, sombra, medio, claro, brillo]
  function canopy(b, cx, cy, rx, ry, ramp, seed, opts = {}) {
    const R = RNG(seed), n = opts.clumps || Math.round((rx * ry) / 3.2);
    const cl = [];
    for (let i = 0; i < n; i++) {
      const a = R.next() * Math.PI * 2, d = Math.sqrt(R.next()) * 0.8;
      const cr = (opts.clumpR || Math.max(2.4, Math.min(rx, ry) * 0.42)) * (0.75 + R.next() * 0.5);
      cl.push([cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, cr]);
    }
    cl.sort((a, c) => a[1] - c[1]); // los de abajo se pintan después (por delante)
    const lx = -0.62, ly = -0.78;
    const mask = new Uint8Array(b.w * b.h);
    // fondo de la copa en sombra, para que no queden huecos entre racimos
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (x < 0 || y < 0 || x >= b.w || y >= b.h) continue;
      const dx = (x + 0.5 - cx) / (rx * 0.9), dy = (y + 0.5 - cy) / (ry * 0.9);
      if (dx * dx + dy * dy <= 1) { p(b, x, y, ramp[1]); mask[y * b.w + x] = 1; }
    }
    for (const [x0, y0, cr] of cl) {
      for (let y = Math.floor(y0 - cr); y <= Math.ceil(y0 + cr); y++) for (let x = Math.floor(x0 - cr); x <= Math.ceil(x0 + cr); x++) {
        if (x < 0 || y < 0 || x >= b.w || y >= b.h) continue;
        const dx = (x + 0.5 - x0) / cr, dy = (y + 0.5 - y0) / cr, dd = dx * dx + dy * dy;
        if (dd > 1) continue;
        // luz local del racimo + luz global de la copa
        const local = -(dx * lx + dy * ly) * -1; // >0 hacia la luz
        const glob = ((cx - x) * 0.6 + (cy - y) * 0.9) / (rx + ry);
        let t = 0.45 + local * 0.32 + glob * 0.5 - dd * 0.12 + (hash(x, y, seed) - 0.5) * 0.18;
        const k = t < 0.28 ? 1 : t < 0.52 ? 2 : t < 0.74 ? 3 : 4;
        p(b, x, y, ramp[k]); mask[y * b.w + x] = 1;
      }
    }
    // contorno con el tono más oscuro (abajo y a la derecha más grueso)
    const out = [];
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
      if (mask[y * b.w + x]) continue;
      const m = (X, Y) => X >= 0 && Y >= 0 && X < b.w && Y < b.h && mask[Y * b.w + X];
      if (m(x - 1, y) || m(x + 1, y) || m(x, y - 1) || m(x, y + 1)) out.push([x, y]);
    }
    for (const [x, y] of out) p(b, x, y, ramp[0]);
    // destellos sueltos
    for (let i = 0; i < (opts.sparkle || 6); i++) { const [x0, y0] = cl[R.int(cl.length)]; p(b, x0 - 1, y0 - 1, ramp[4]); }
    return mask;
  }
  function trunk(b, x, y0, y1, w, dark, mid, light) {
    for (let y = y0; y <= y1; y++) { r(b, x, y, w, 1, mid); p(b, x, y, light); p(b, x + w - 1, y, dark); }
    for (let y = y0; y <= y1; y += 3) p(b, x + 1 + (y % 2), y, dark);
  }
  function shadowEl(b, cx, cy, rx, ry) { ova(b, cx, cy, rx, ry, 0x46000000); ova(b, cx, cy, rx * 0.7, ry * 0.7, 0x22000000); }

  // ---------------------------------------------------------------- olivo: plateado, tronco retorcido
  const OLIVE = [0x2c3420, 0x4a5636, 0x66744a, 0x8a9868, 0xb8c49a];
  for (let v = 0; v < 3; v++) {
    const b = img(26, 26);
    shadowEl(b, 13, 23, 10, 2.8);
    // tronco retorcido y abierto en dos
    line(b, 12, 24, 11, 15, 0x4a3a2a); line(b, 13, 24, 14, 15, 0x5a4836); line(b, 14, 24, 15, 16, 0x6e5a44);
    line(b, 11, 16, 7, 12, 0x4a3a2a); line(b, 15, 16, 19, 11, 0x5a4836); p(b, 12, 21, 0x2e241a); p(b, 14, 19, 0x7e6a52);
    canopy(b, 13, 10, 11 + (v === 1 ? 1 : 0), 7.5, OLIVE, 300 + v, { clumpR: 3, sparkle: 8 });
    put('olivo' + v, b);
  }
  // ---------------------------------------------------------------- almendro: verde claro (y uno en flor)
  for (let v = 0; v < 2; v++) {
    const b = img(24, 28);
    shadowEl(b, 12, 25, 9, 2.6);
    trunk(b, 11, 15, 25, 2, 0x3a2a1e, 0x5a4230, 0x7a5c44);
    line(b, 12, 17, 7, 12, 0x5a4230); line(b, 12, 16, 17, 11, 0x5a4230);
    const ramp = v ? [0x34401e, 0x627238, 0x7e964a, 0xa0b862, 0xd0dc98] : [0x3a4422, 0x6a7a40, 0x88a050, 0xa8bc6a, 0xd4e0a0];
    canopy(b, 12, 10, 10, 7.5, ramp, 400 + v, { clumpR: 3, sparkle: v ? 14 : 6 });
    put('almendro' + v, b);
  }
  // ---------------------------------------------------------------- pino carrasco: copa en pisos
  const PINE = [0x16261a, 0x24402a, 0x335636, 0x466e44, 0x6a9058];
  for (let v = 0; v < 3; v++) {
    const b = img(28, 40);
    shadowEl(b, 14, 37, 11, 3);
    trunk(b, 13, 18, 37, 3, 0x4a2a1a, 0x7a4a2e, 0x9a6a46);
    line(b, 14, 26, 9, 22, 0x7a4a2e); line(b, 15, 22, 20, 18, 0x7a4a2e);
    canopy(b, 14, 13, 12.5, 11, PINE, 500 + v, { clumpR: 3.4, sparkle: 5 });
    put('pino' + v, b);
  }
  // ---------------------------------------------------------------- chopo: columna alta, verde vivo
  const POPLAR = [0x1e3214, 0x3a5a22, 0x52782e, 0x6e9638, 0xa8c860];
  for (let v = 0; v < 2; v++) {
    const b = img(18, 50);
    shadowEl(b, 9, 47, 6, 2);
    trunk(b, 8, 34, 47, 2, 0x5a5448, 0x8a8478, 0xb0aa9e);
    canopy(b, 9, 19, 6.5, 17, POPLAR, 600 + v, { clumpR: 2.8, sparkle: 6 });
    put('chopo' + v, b);
  }
  // ---------------------------------------------------------------- sauce llorón: ramas que cuelgan
  {
    const b = img(34, 36);
    shadowEl(b, 17, 33, 13, 3);
    trunk(b, 16, 16, 33, 3, 0x3a2e20, 0x5e4a34, 0x7e6650);
    const W = [0x2a3a14, 0x4a6624, 0x6a8a32, 0x8aaa44, 0xbcd472];
    canopy(b, 17, 10, 13, 7, W, 700, { clumpR: 3.2, sparkle: 6 });
    const R = RNG(701);
    for (let i = 0; i < 26; i++) { const x = 5 + R.int(25), y0 = 10 + R.int(6), len = 10 + R.int(12); for (let y = y0; y < y0 + len && y < 34; y++) p(b, x + (y % 5 === 0 ? (x % 2 ? 1 : -1) : 0), y, y > y0 + len - 3 ? W[3] : (y % 3 ? W[2] : W[1])); p(b, x + 1, y0 + 2, W[0]); }
    put('sauce', b);
  }
  // ---------------------------------------------------------------- higuera: hoja ancha y oscura
  for (let v = 0; v < 2; v++) {
    const b = img(30, 28);
    shadowEl(b, 15, 25, 12, 3);
    line(b, 15, 26, 14, 16, 0x7a7468); line(b, 14, 18, 8, 13, 0x8a8478); line(b, 15, 18, 22, 12, 0x8a8478);
    canopy(b, 15, 11, 13, 8.5, [0x18280e, 0x2e4a1c, 0x426628, 0x5a8434, 0x8ab454], 800 + v, { clumpR: 4, sparkle: 6 });
    put('higuera' + v, b);
  }
  // ---------------------------------------------------------------- nogal: copa enorme y redonda
  for (let v = 0; v < 2; v++) {
    const b = img(42, 44);
    shadowEl(b, 21, 40, 17, 4);
    trunk(b, 19, 22, 41, 4, 0x5a544a, 0x8a8478, 0xb4aea2);
    line(b, 21, 26, 12, 18, 0x8a8478); line(b, 22, 25, 31, 17, 0x8a8478);
    canopy(b, 21, 16, 19, 13, [0x1e3016, 0x36522a, 0x4c6e36, 0x648c42, 0x9ab868], 900 + v, { clumpR: 4.2, sparkle: 10 });
    put('nogal' + v, b);
  }
  // ---------------------------------------------------------------- ciprés
  {
    const b = img(14, 40);
    shadowEl(b, 7, 37, 5, 1.8);
    canopy(b, 7, 18, 4.6, 16.5, [0x0e1c12, 0x1e3420, 0x2a4a2c, 0x3a6038, 0x5a8050], 1000, { clumpR: 2.2, sparkle: 3 });
    put('cipres', b);
  }
  // ---------------------------------------------------------------- retama (flor amarilla) y matas
  for (let v = 0; v < 3; v++) {
    const b = img(18, 16);
    shadowEl(b, 9, 14, 7, 1.8);
    const R = RNG(1100 + v);
    for (let i = 0; i < 22; i++) { const x = 3 + R.int(12), h = 4 + R.int(8); line(b, 9, 14, x, 14 - h, R.bool() ? 0x5a7030 : 0x6e8a3a); if (v !== 2 && R.next() < 0.6) { p(b, x, 14 - h, 0xf0c838); p(b, x + 1, 14 - h, 0xd8a020); } }
    put('retama' + v, b);
  }
  // ---------------------------------------------------------------- cañas de río
  {
    const b = img(18, 24); const R = RNG(1200);
    ova(b, 9, 22, 7, 1.8, 0x40000000);
    for (let i = 0; i < 12; i++) { const x = 2 + R.int(14), h = 12 + R.int(10), lean = R.int(3) - 1; line(b, x, 22, x + lean, 22 - h, R.bool() ? 0xa8a46a : 0x8a9450); line(b, x + lean, 22 - h, x + lean + (R.bool() ? 3 : -3), 22 - h + 3, 0x6a7a3a); if (R.next() < 0.4) { p(b, x + lean, 22 - h - 1, 0x8a6a40); p(b, x + lean, 22 - h - 2, 0x8a6a40); } }
    put('canas', b);
  }
};
