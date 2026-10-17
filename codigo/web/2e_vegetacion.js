// ====================================================================== árboles y matas con volumen
// Estilo de las referencias top-down: copas grandes hechas de pocos racimos redondos, cada racimo
// con su media luna de luz arriba a la izquierda y sombra abajo a la derecha; huecos oscuros entre
// racimos; contorno del tono más oscuro (no negro), más grueso abajo. Sin ruido píxel a píxel.
Art.initVegetation = function () {
  const { img, p, r, ov, ova, line, shade, mix } = Px;
  const put = (k, b) => { Art.P[k] = b; };
  const get = (b, x, y) => (x < 0 || y < 0 || x >= b.w || y >= b.h) ? 0 : b.d[y * b.w + x];

  // copa: ramp = [contorno, sombra, medio, claro, brillo]
  function canopy(b, cx, cy, rx, ry, ramp, seed, opts = {}) {
    const R = RNG(seed), n = opts.clumps || Math.max(5, Math.round((rx * ry) / 9));
    const cl = [];
    const cr0 = opts.clumpR || Math.max(3, Math.min(rx, ry) * 0.5);
    for (let i = 0; i < n; i++) {
      const a = R.next() * Math.PI * 2, d = Math.sqrt(R.next()) * 0.78;
      cl.push([cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, cr0 * (0.8 + R.next() * 0.4)]);
    }
    // un racimo arriba-izquierda siempre (la parte más iluminada de la copa)
    cl.push([cx - rx * 0.3, cy - ry * 0.45, cr0 * 1.05]);
    cl.sort((a, c) => a[1] - c[1]);
    const lx = -0.62, ly = -0.78, mask = new Uint8Array(b.w * b.h);
    // fondo de la copa en sombra profunda (los huecos entre racimos)
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (x < 0 || y < 0 || x >= b.w || y >= b.h) continue;
      const dx = (x + 0.5 - cx) / (rx * 0.92), dy = (y + 0.5 - cy) / (ry * 0.92);
      if (dx * dx + dy * dy <= 1) { p(b, x, y, ramp[1]); mask[y * b.w + x] = 1; }
    }
    for (const [x0, y0, cr] of cl) {
      for (let y = Math.floor(y0 - cr); y <= Math.ceil(y0 + cr); y++) for (let x = Math.floor(x0 - cr); x <= Math.ceil(x0 + cr); x++) {
        if (x < 0 || y < 0 || x >= b.w || y >= b.h) continue;
        const dx = (x + 0.5 - x0) / cr, dy = (y + 0.5 - y0) / cr, dd = dx * dx + dy * dy;
        if (dd > 1) continue;
        const local = dx * lx + dy * ly; // >0 hacia la luz
        const glob = ((cx - x) * 0.55 + (cy - y) * 0.9) / (rx + ry);
        const t = 0.5 + local * 0.42 + glob * 0.55 - dd * 0.12 + (((x + y) & 1) ? 0.035 : -0.035);
        let k = t < 0.3 ? 1 : t < 0.6 ? 2 : 3;
        if (t > 0.86 && dd < 0.55) k = 4;
        // borde inferior del racimo: línea de sombra que lo separa del de debajo
        if (dd > 0.72 && dy > 0.35) k = 1;
        p(b, x, y, ramp[k]); mask[y * b.w + x] = 1;
      }
    }
    // contorno: 1 px alrededor, 2 px por abajo
    const out = [];
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
      if (mask[y * b.w + x]) continue;
      const m = (X, Y) => X >= 0 && Y >= 0 && X < b.w && Y < b.h && mask[Y * b.w + X];
      if (m(x - 1, y) || m(x + 1, y) || m(x, y - 1) || m(x, y + 1) || m(x, y - 2)) out.push([x, y]);
    }
    for (const [x, y] of out) p(b, x, y, ramp[0]);
    return mask;
  }
  function trunk(b, x, y0, y1, w, dark, mid, light) {
    for (let y = y0; y <= y1; y++) { r(b, x, y, w, 1, mid); p(b, x, y, light); p(b, x + w - 1, y, dark); }
    for (let y = y0 + 1; y <= y1; y += 3) p(b, x + 1 + (y % 2), y, dark);
    p(b, x - 1, y1, dark); p(b, x + w, y1, dark); // raíces
  }
  function branch(b, x0, y0, x1, y1, c, c2) { line(b, x0, y0, x1, y1, c); if (c2) line(b, x0 + 1, y0, x1 + 1, y1, c2); }
  function shadowEl(b, cx, cy, rx, ry) { ova(b, cx, cy, rx, ry, 0x50000000); ova(b, cx + 1, cy, rx * 0.66, ry * 0.7, 0x28000000); }

  // ---------------------------------------------------------------- olivo: plateado, tronco gordo y retorcido
  const OLIVE = [0x232a1c, 0x3e4a30, 0x5e6c46, 0x8a9a6a, 0xc0cca0];
  for (let v = 0; v < 3; v++) {
    const b = img(32, 30);
    shadowEl(b, 16, 27, 12, 3);
    const tc = [0x3a2e22, 0x5a4836, 0x7a6450];
    for (let y = 18; y <= 28; y++) { const wv = 4 + (y > 25 ? 2 : 0), off = Math.round(Math.sin(y * 0.7 + v) * 1); r(b, 14 + off - (y > 25 ? 1 : 0), y, wv, 1, tc[1]); p(b, 14 + off, y, tc[2]); p(b, 17 + off + (y > 25 ? 1 : 0), y, tc[0]); }
    p(b, 15, 22, tc[0]); p(b, 16, 24, tc[0]); p(b, 15, 20, tc[2]);
    branch(b, 15, 19, 9, 13, tc[1], tc[2]); branch(b, 17, 19, 23, 12, tc[1], tc[0]);
    canopy(b, 16, 11, 14 + (v === 1 ? 1 : 0), 9, OLIVE, 300 + v, { clumpR: 4.2 });
    put('olivo' + v, b);
  }
  // ---------------------------------------------------------------- almendro: verde claro (y uno en flor blanca)
  for (let v = 0; v < 2; v++) {
    const b = img(28, 32);
    shadowEl(b, 14, 29, 10, 2.8);
    trunk(b, 13, 17, 29, 3, 0x2e2018, 0x4e3828, 0x6e5240);
    branch(b, 14, 19, 8, 13, 0x4e3828); branch(b, 15, 18, 21, 12, 0x4e3828);
    const ramp = v ? [0x4a3a3e, 0x9a8a90, 0xc8bcc0, 0xe8e0e2, 0xffffff] : [0x2e3a1c, 0x56682e, 0x7a9440, 0x9ab85a, 0xcce08c];
    canopy(b, 14, 11, 12, 9, ramp, 400 + v, { clumpR: 3.8 });
    put('almendro' + v, b);
  }
  // ---------------------------------------------------------------- pino carrasco: copa en pisos con el tronco a la vista
  const PINE = [0x101e16, 0x1e3626, 0x2c4c32, 0x426842, 0x6a9058];
  for (let v = 0; v < 3; v++) {
    const b = img(40, 52);
    shadowEl(b, 20, 49, 14, 3.4);
    trunk(b, 18, 20, 49, 4, 0x3a1e12, 0x6a3c24, 0x8e5a3a);
    const R = RNG(510 + v);
    branch(b, 20, 32, 9 + R.int(4), 24, 0x5a3420); branch(b, 21, 28, 30 + R.int(4), 20, 0x5a3420); branch(b, 20, 24, 14, 15, 0x5a3420);
    // pisos: nubes de agujas, la de arriba más grande
    canopy(b, 20 + (v - 1) * 2, 13, 15, 9, PINE, 500 + v, { clumpR: 4 });
    canopy(b, 10 + R.int(3), 24, 8, 5, PINE, 520 + v, { clumpR: 3.4 });
    canopy(b, 30 - R.int(3), 21, 8, 5, PINE, 530 + v, { clumpR: 3.4 });
    put('pino' + v, b);
  }
  // ---------------------------------------------------------------- chopo: columna alta y vibrante (como en las fotos del río)
  const POPLAR = [0x1a2c12, 0x34521e, 0x4e7428, 0x6e9a36, 0xa8cc62];
  for (let v = 0; v < 2; v++) {
    const b = img(22, 64);
    shadowEl(b, 11, 61, 7, 2.2);
    trunk(b, 10, 44, 61, 3, 0x4a463e, 0x8a8478, 0xb8b2a6);
    for (let y = 46; y < 60; y += 4) { p(b, 10, y, 0x3a3630); p(b, 11, y, 0x3a3630); } // ojos de la corteza
    canopy(b, 11, 24, 8.2, 22, POPLAR, 600 + v, { clumpR: 3.6, clumps: 16 });
    put('chopo' + v, b);
  }
  // ---------------------------------------------------------------- sauce llorón: cascada de ramas finas hasta el suelo
  {
    const b = img(44, 46);
    shadowEl(b, 22, 43, 17, 3.4);
    trunk(b, 20, 18, 43, 4, 0x2e2418, 0x56442e, 0x766048);
    const W = [0x223212, 0x3e5a20, 0x5a7c2c, 0x7ea03e, 0xb8d470];
    canopy(b, 22, 12, 17, 9, W, 700, { clumpR: 4 });
    const R = RNG(701);
    for (let i = 0; i < 46; i++) {
      const x = 5 + R.int(35), y0 = 9 + R.int(8), len = 14 + R.int(18);
      for (let y = y0; y < y0 + len && y < 44; y++) {
        const xx = x + Math.round(Math.sin(y * 0.35 + i) * 0.7);
        const c = y > y0 + len - 4 ? W[3] : (xx + y) % 4 === 0 ? W[1] : W[2];
        p(b, xx, y, c);
        if (x < 22) p(b, xx - 1, y, get(b, xx - 1, y) ? get(b, xx - 1, y) & 0xffffff : W[3]);
      }
      p(b, x + 1, y0 + 3, W[0]);
    }
    for (let i = 0; i < 20; i++) { const x = 4 + R.int(37), y = 12 + R.int(28); if (get(b, x, y)) p(b, x, y, W[4]); }
    put('sauce', b);
  }
  // ---------------------------------------------------------------- higuera: hoja ancha y oscura, ramas grises
  for (let v = 0; v < 2; v++) {
    const b = img(36, 32);
    shadowEl(b, 18, 29, 14, 3);
    branch(b, 18, 30, 17, 19, 0x7a7468, 0x9a948a); branch(b, 17, 21, 9, 15, 0x7a7468); branch(b, 18, 21, 27, 14, 0x7a7468);
    canopy(b, 18, 13, 16, 10, [0x14240c, 0x284618, 0x3c6224, 0x568430, 0x8ab454], 800 + v, { clumpR: 5 });
    put('higuera' + v, b);
  }
  // ---------------------------------------------------------------- nogal: copa enorme y redonda
  for (let v = 0; v < 2; v++) {
    const b = img(48, 50);
    shadowEl(b, 24, 46, 19, 4.5);
    trunk(b, 21, 26, 47, 5, 0x5a544a, 0x8a8478, 0xb4aea2);
    branch(b, 23, 30, 13, 20, 0x8a8478); branch(b, 25, 29, 35, 19, 0x8a8478);
    canopy(b, 24, 18, 21, 15, [0x1a2a12, 0x304c24, 0x466a32, 0x5e8a3e, 0x96b866], 900 + v, { clumpR: 5.4 });
    put('nogal' + v, b);
  }
  // ---------------------------------------------------------------- ciprés (cementerio, ermita)
  {
    const b = img(16, 46);
    shadowEl(b, 8, 43, 5.5, 1.8);
    canopy(b, 8, 21, 5.4, 20, [0x0a1610, 0x182e1c, 0x264428, 0x365c36, 0x5a8050], 1000, { clumpR: 3, clumps: 12 });
    put('cipres', b);
  }
  // ---------------------------------------------------------------- retama (flor amarilla) y matas
  for (let v = 0; v < 3; v++) {
    const b = img(20, 18);
    shadowEl(b, 10, 16, 8, 2);
    const R = RNG(1100 + v);
    for (let i = 0; i < 28; i++) { const x = 3 + R.int(14), h = 5 + R.int(9); line(b, 10, 16, x, 16 - h, R.bool() ? 0x4e6428 : 0x6a8636); if (v !== 2 && R.next() < 0.55) { p(b, x, 16 - h, 0xf8d040); p(b, x + 1, 16 - h, 0xd8a020); p(b, x, 15 - h, 0xffe880); } }
    put('retama' + v, b);
  }
  // ---------------------------------------------------------------- cañas de río (carrizo con penacho)
  {
    const b = img(20, 30); const R = RNG(1200);
    ova(b, 10, 28, 8, 2, 0x48000000);
    for (let i = 0; i < 16; i++) {
      const x = 2 + R.int(16), h = 14 + R.int(13), lean = R.int(3) - 1;
      line(b, x, 28, x + lean, 28 - h, R.bool() ? 0xb0aa6e : 0x8e9852);
      line(b, x + lean, 28 - h + 6, x + lean + (R.bool() ? 4 : -4), 28 - h + 9, 0x6a7a3a);
      if (R.next() < 0.5) { p(b, x + lean, 27 - h, 0xa07a50); p(b, x + lean, 26 - h, 0xc89a68); p(b, x + lean + 1, 26 - h, 0x8a6a40); }
    }
    put('canas', b);
  }
};
