// ====================================================================== atrezo oscuro (farolas, árboles muertos, rocas con musgo, setas, huesos, estatua, verja)
Art.initProps2 = function () {
  const { img, p, r, ov, ova, line, shade } = Px;
  const put = (k, b) => { Art.P[k] = b; };
  const sh = (b, cx, cy, rx, ry) => { ova(b, cx, cy, rx, ry, 0x46000000); };
  // ---------------------------------------------------------------- farola de forja
  {
    const b = img(12, 34);
    sh(b, 6, 32, 4, 1.4);
    r(b, 5, 10, 2, 22, 0x1a1a1e); p(b, 5, 10, 0x3a3a42); r(b, 3, 30, 6, 2, 0x22222a); r(b, 4, 29, 4, 1, 0x2e2e36);
    r(b, 2, 3, 8, 8, 0x14141a); r(b, 3, 4, 6, 6, 0xf0c050); r(b, 4, 5, 2, 4, 0xfff0a0); r(b, 6, 4, 1, 6, 0x14141a);
    r(b, 1, 2, 10, 1, 0x22222a); r(b, 3, 1, 6, 1, 0x22222a); p(b, 6, 0, 0x22222a);
    Px.outlineTint(b);
    put('farola', b);
  }
  // ---------------------------------------------------------------- árbol muerto con raíces
  for (let v = 0; v < 2; v++) {
    const b = img(30, 36), R = RNG(1300 + v);
    sh(b, 15, 33, 11, 2.6);
    const dark = 0x1e1a1c, mid = 0x34302e, light = 0x4e4842;
    // raíces
    for (let i = 0; i < 5; i++) { const a = Math.PI * (0.1 + i * 0.2); line(b, 15, 31, 15 + Math.cos(a) * 11 * (i % 2 ? -1 : 1), 33 + Math.sin(a) * 2, mid); }
    // tronco retorcido
    for (let y = 12; y <= 32; y++) { const x = 13 + Math.round(Math.sin(y * 0.3 + v) * 1.5); r(b, x, y, 4, 1, mid); p(b, x, y, light); p(b, x + 3, y, dark); }
    const branch = (x0, y0, a, len, d) => {
      if (d > 4 || len < 2) return;
      const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
      line(b, x0, y0, x1, y1, d < 2 ? mid : dark); if (d < 1) line(b, x0 + 1, y0, x1 + 1, y1, dark);
      branch(x1, y1, a - 0.5 - R.next() * 0.3, len * 0.7, d + 1); branch(x1, y1, a + 0.4 + R.next() * 0.3, len * 0.62, d + 1);
    };
    branch(15, 13, -Math.PI / 2 - 0.3, 8, 0); branch(15, 15, -Math.PI / 2 + 0.6, 7, 1);
    if (v === 1) { r(b, 13, 20, 2, 2, 0x0a0808); p(b, 13, 20, 0x7a1a14); } // hueco con algo dentro
    Px.outlineTint(b, 0.25);
    put('arbol_muerto' + v, b);
  }
  // ---------------------------------------------------------------- roca con musgo
  for (let v = 0; v < 2; v++) {
    const b = img(22, 18), R = RNG(1400 + v);
    sh(b, 11, 15, 10, 2.4);
    const ramp = [0x2e3a3e, 0x44545a, 0x5a6c72, 0x748a90];
    for (let y = 2; y < 16; y++) for (let x = 1; x < 21; x++) {
      const dx = (x - 11) / 9.5, dy = (y - 10) / (6.5 + v);
      if (dx * dx + dy * dy > 1) continue;
      const lit = -dx * 0.5 - dy * 0.8 + (R.next() - 0.5) * 0.25;
      p(b, x, y, ramp[Math.max(0, Math.min(3, Math.floor((lit + 1) * 1.6)))]);
    }
    for (let i = 0; i < 26; i++) { const x = 4 + R.int(14), y = 3 + R.int(6); if (Px.op(b, x, y)) p(b, x, y, R.bool() ? 0x5a7a3a : 0x6e8e44); }
    for (let i = 0; i < 4; i++) { const x = 5 + R.int(12), y = 8 + R.int(5); p(b, x, y, 0x24302e); p(b, x + 1, y + 1, 0x24302e); }
    Px.outlineTint(b, 0.3);
    put('roca_musgo' + v, b);
  }
  // ---------------------------------------------------------------- setas (rojas y azules)
  for (let v = 0; v < 2; v++) {
    const b = img(12, 10), R = RNG(1500 + v);
    const cap = v ? [0x4a7a9a, 0x7ab0d0, 0xc8e8f8] : [0x8a2a1e, 0xc04a30, 0xf0a080];
    for (let i = 0; i < 3; i++) {
      const x = 2 + i * 3 + R.int(2), h = 3 + R.int(3);
      r(b, x, 9 - h, 1, h, 0xe0d8c0); ov(b, x + 0.5, 9 - h, 2.2, 1.4, cap[1]); p(b, x - 1, 9 - h, cap[0]); p(b, x, 8 - h, cap[2]);
    }
    put('setas' + v, b);
  }
  // ---------------------------------------------------------------- calavera y huesos
  {
    const b = img(14, 8);
    ov(b, 4, 4, 3, 3, 0xd8d0b8); r(b, 3, 6, 3, 2, 0xc8c0a8); p(b, 3, 4, 0x1a1410); p(b, 5, 4, 0x1a1410); p(b, 4, 6, 0x6a6050); p(b, 3, 2, 0xf0ead8);
    line(b, 8, 6, 13, 4, 0xd0c8b0); p(b, 8, 7, 0xd0c8b0); p(b, 13, 3, 0xd0c8b0); p(b, 13, 5, 0xd0c8b0);
    Px.outlineTint(b, 0.4);
    put('huesos', b);
  }
  // ---------------------------------------------------------------- estatua encapuchada
  {
    const b = img(18, 32);
    sh(b, 9, 30, 7, 2);
    r(b, 3, 26, 12, 5, 0x3e4a50); r(b, 3, 26, 12, 1, 0x5e6e74);
    for (let y = 4; y < 26; y++) { const w = 3 + Math.min(4, (y - 4) * 0.35); r(b, 9 - w, y, w * 2, 1, y % 5 === 0 ? 0x4e5c62 : 0x56666c); p(b, 9 - w, y, 0x6e8086); }
    ov(b, 9, 6, 3.5, 4, 0x46545a); r(b, 7, 6, 4, 3, 0x0e1416);
    r(b, 6, 14, 6, 2, 0x4e5c62); for (let i = 0; i < 6; i++) p(b, 7 + i % 3, 16 + (i >> 1), 0x5a7a3a);
    Px.outlineTint(b, 0.3);
    put('estatua', b);
  }
  // ---------------------------------------------------------------- verja de forja
  {
    const b = img(16, 16);
    r(b, 0, 4, 16, 1, 0x1a1a20); r(b, 0, 11, 16, 1, 0x1a1a20);
    for (let x = 1; x < 16; x += 3) { r(b, x, 2, 1, 13, 0x22222a); p(b, x, 1, 0x3a3a44); p(b, x - 1, 2, 0x22222a); p(b, x + 1, 2, 0x22222a); }
    r(b, 0, 14, 16, 2, 0x3e4a50);
    put('verja', b);
  }
};
