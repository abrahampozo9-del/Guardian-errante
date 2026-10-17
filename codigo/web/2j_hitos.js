// ====================================================================== hitos del paisaje
// Elementos que se ven de lejos y sirven para orientarse (Lynch: "landmarks"): torres de la luz que
// siguen las carreteras, eras de trillar redondas, pozos, olivos quemados, la gran encina seca de
// Los Llanos, muros de cortijos en ruinas, coches abandonados.
Art.initLandmarks = function () {
  const { img, p, r, ov, ova, line, shade } = Px;
  const put = (k, b) => { Art.P[k] = b; };
  // ---------------------------------------------------------------- torre de la luz (celosía metálica), con cables caídos
  {
    const b = img(34, 70);
    ova(b, 17, 67, 13, 2.6, 0x50000000);
    const c = 0x3a3c42, c2 = 0x5a5e66, hi = 0x8a8e96;
    const leg = (x0, x1) => line(b, x0, 67, x1, 6, c);
    leg(4, 14); leg(30, 20); leg(5, 15); leg(29, 19);
    for (let y = 10; y < 66; y += 6) { const w = 3 + (y - 6) * 0.17; line(b, 17 - w, y, 17 + w, y + 6, c2); line(b, 17 + w, y, 17 - w, y + 6, c2); line(b, 17 - w, y, 17 + w, y, c); }
    for (const y of [12, 26]) { line(b, 1, y, 33, y, c); line(b, 1, y + 1, 33, y + 1, c2); p(b, 1, y + 2, hi); p(b, 33, y + 2, hi); r(b, 1, y + 2, 1, 4, 0xa8a8a0); r(b, 33, y + 2, 1, 4, 0xa8a8a0); }
    r(b, 15, 3, 4, 4, c); p(b, 16, 3, hi);
    line(b, 14, 6, 20, 6, hi);
    Px.outlineTint(b);
    put('torre_luz', b);
  }
  // ---------------------------------------------------------------- era de trillar: círculo empedrado con borde de lajas
  {
    const b = img(64, 48);
    const R = RNG(3101);
    for (let y = 0; y < 48; y++) for (let x = 0; x < 64; x++) {
      const dx = (x + 0.5 - 32) / 30, dy = (y + 0.5 - 24) / 22, d = Math.sqrt(dx * dx + dy * dy);
      if (d > 1) continue;
      let c = d > 0.9 ? ((Math.atan2(dy, dx) * 9 | 0) % 2 ? 0x8a8478 : 0x9e988a) : (R.next() < 0.5 ? 0xa8946c : 0xb4a07a);
      if (d <= 0.9 && ((x * 3 + y * 7) % 11 === 0)) c = 0x8a7656;
      if (d > 0.9 && dy > 0.3) c = shade(c, 0.78);
      p(b, x, y, c);
    }
    for (let i = 0; i < 30; i++) { const a = R.next() * 6.28, rr = R.next() * 0.8; p(b, 32 + Math.cos(a) * 30 * rr, 24 + Math.sin(a) * 22 * rr, 0xd8c69a); }
    for (let i = 0; i < 6; i++) { const a = R.next() * 6.28; const x = 32 + Math.cos(a) * 20, y = 24 + Math.sin(a) * 14; p(b, x, y, 0x5a6a2e); p(b, x, y - 1, 0x7a8a3e); }
    put('era', b);
  }
  // ---------------------------------------------------------------- pozo de piedra con brocal y garrucha
  {
    const b = img(24, 32);
    ova(b, 12, 29, 10, 2.4, 0x50000000);
    ov(b, 12, 24, 10, 5, 0x7a746a); ov(b, 12, 23, 10, 5, 0x9a948a); ov(b, 12, 23, 7, 3.4, 0x14181c); ov(b, 12, 23.6, 5, 2, 0x203038);
    for (let i = 0; i < 8; i++) p(b, 3 + i * 2.5, 26 + (i % 2), 0x6a645a);
    r(b, 3, 6, 2, 18, 0x4a3a2a); r(b, 19, 6, 2, 18, 0x4a3a2a); r(b, 3, 5, 18, 2, 0x5a4836); p(b, 3, 5, 0x7a6450);
    ov(b, 12, 8, 2.5, 2.5, 0x3a3a3a); line(b, 12, 10, 12, 21, 0x8a7a5a);
    r(b, 10, 18, 4, 4, 0x6a5a40);
    Px.outlineTint(b);
    put('pozo', b);
  }
  // ---------------------------------------------------------------- olivo quemado (las tierras del norte ardieron)
  for (let v = 0; v < 2; v++) {
    const b = img(30, 30);
    ova(b, 15, 27, 11, 2.6, 0x50000000);
    const c = [0x0e0a0a, 0x1e1614, 0x2e2420];
    for (let y = 16; y <= 28; y++) { const off = Math.round(Math.sin(y * 0.7 + v) * 1); r(b, 13 + off, y, 4, 1, c[1]); p(b, 13 + off, y, c[2]); }
    const R = RNG(3200 + v);
    const br = (x0, y0, a, len, d) => { if (d > 3 || len < 2) return; const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; line(b, x0, y0, x1, y1, d < 2 ? c[1] : c[0]); if (d < 1) line(b, x0 + 1, y0, x1 + 1, y1, c[1]); br(x1, y1, a - 0.5 - R.next() * 0.3, len * 0.7, d + 1); br(x1, y1, a + 0.4 + R.next() * 0.3, len * 0.65, d + 1); };
    br(15, 17, -Math.PI / 2 - 0.5, 7, 0); br(15, 17, -Math.PI / 2 + 0.6, 7, 0);
    for (let i = 0; i < 8; i++) p(b, 6 + R.int(18), 4 + R.int(12), 0x3a2a24); // hojas secas que quedan
    for (let i = 0; i < 3; i++) p(b, 12 + R.int(6), 20 + R.int(6), 0xa83a14); // brasa
    put('olivo_quemado' + v, b);
  }
  // ---------------------------------------------------------------- la gran encina seca (se ve desde lejos en Los Llanos)
  {
    const b = img(72, 80);
    ova(b, 36, 76, 26, 4, 0x50000000);
    const c = [0x1a1210, 0x2e2420, 0x4a3a32, 0x6a564a];
    for (let y = 46; y <= 77; y++) { const w = 7 + (y > 70 ? (y - 70) : 0); r(b, 36 - w / 2, y, w, 1, c[2]); p(b, 36 - w / 2, y, c[3]); p(b, 36 + w / 2 - 1, y, c[0]); if (y % 4 === 0) p(b, 35, y, c[1]); }
    const R = RNG(3300);
    const br = (x0, y0, a, len, w, d) => { if (d > 6 || len < 2) return; const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; for (let k = 0; k < Math.max(1, w); k++) line(b, x0 + k, y0, x1 + k, y1, k === 0 ? c[3] : c[1]); br(x1, y1, a - 0.45 - R.next() * 0.3, len * 0.72, w - 1, d + 1); br(x1, y1, a + 0.35 + R.next() * 0.3, len * 0.66, w - 1, d + 1); if (R.next() < 0.3) br(x1, y1, a, len * 0.5, w - 2, d + 2); };
    br(36, 48, -Math.PI / 2 - 0.55, 16, 4, 0); br(36, 48, -Math.PI / 2 + 0.5, 15, 4, 0); br(36, 50, -Math.PI / 2, 12, 3, 1);
    // una cuerda colgando de una rama (siniestro)
    line(b, 52, 22, 52, 40, 0x8a7a5a); ov(b, 52, 42, 2, 2.5, 0x8a7a5a); p(b, 52, 42, 0);
    for (let i = 0; i < 5; i++) { const x = 20 + R.int(34); p(b, x, 74 + R.int(3), 0xd8d0c0); } // huesos
    put('encina_seca', b);
  }
  // ---------------------------------------------------------------- coches abandonados (vista cenital, de lado)
  const car = (body, dark, burnt) => {
    const b = img(34, 22);
    ova(b, 17, 19, 15, 2.6, 0x50000000);
    r(b, 2, 8, 30, 9, body); r(b, 7, 3, 18, 6, body); r(b, 2, 8, 30, 1, shade(body, 1.25)); r(b, 7, 3, 18, 1, shade(body, 1.25));
    r(b, 9, 4, 6, 4, burnt ? 0x1a1414 : 0x2a3a48); r(b, 16, 4, 7, 4, burnt ? 0x1a1414 : 0x3a4a58); p(b, 10, 4, burnt ? 0x2a1e1a : 0x7a9ab0);
    r(b, 2, 15, 30, 2, dark); ov(b, 8, 17, 3.2, 3.2, 0x141414); ov(b, 26, 17, 3.2, 3.2, 0x141414); ov(b, 8, 17, 1.4, 1.4, 0x5a5a5a); ov(b, 26, 17, 1.4, 1.4, 0x5a5a5a);
    if (burnt) { const R = RNG(body); for (let i = 0; i < 40; i++) p(b, 3 + R.int(28), 4 + R.int(12), R.bool() ? 0x5a3a24 : 0x2a1a14); }
    else { r(b, 30, 10, 2, 2, 0xe8c070); r(b, 2, 10, 1, 2, 0xa83020); }
    Px.outlineTint(b);
    return b;
  };
  put('coche0', car(0x7a1e1a, 0x3a0e0c, false)); put('coche1', car(0x5a6a7a, 0x2a3440, false)); put('coche2', car(0x4a3a30, 0x1a1210, true));
  // ---------------------------------------------------------------- muro en ruinas (para cortijos abandonados)
  for (let v = 0; v < 3; v++) {
    const b = img(16, 24);
    const R = RNG(3400 + v), h = 10 + R.int(10);
    for (let y = 24 - h; y < 22; y++) for (let x = 0; x < 16; x++) {
      const top = 24 - h + Math.round(Math.sin(x * 0.9 + v) * 2 + R.next() * 2);
      if (y < top) continue;
      const row = Math.floor(y / 3), off = row % 2 ? 2 : 0, brick = (x + off) % 5 === 0 || y % 3 === 0;
      p(b, x, y, brick ? 0x6a6050 : (R.next() < 0.5 ? 0xb0a48a : 0xbcb096));
      if (y === top) p(b, x, y, 0xd4c8ae);
    }
    r(b, 0, 22, 16, 2, 0x4a4236);
    for (let i = 0; i < 4; i++) { const x = R.int(16), y = 22 - R.int(h); p(b, x, y, 0x4a6028); p(b, x, y + 1, 0x3a4a20); }
    put('ruina' + v, b);
  }
  // ---------------------------------------------------------------- zarza negra (La Linde)
  for (let v = 0; v < 2; v++) {
    const b = img(24, 20);
    ova(b, 12, 18, 10, 2, 0x50000000);
    const R = RNG(3500 + v);
    for (let i = 0; i < 18; i++) { const x0 = 12 + R.int(5) - 2, a = -Math.PI * (0.1 + R.next() * 0.8), len = 6 + R.int(9); let x = x0, y = 18; for (let k = 0; k < len; k++) { x += Math.cos(a) * 0.9; y += Math.sin(a) * 0.9 + (k > len / 2 ? 0.3 : 0); p(b, x, y, k % 3 ? 0x140a12 : 0x2a1424); if (k % 4 === 2) p(b, x + 1, y - 1, 0x5a1a2a); } }
    for (let i = 0; i < 5; i++) { const x = 4 + R.int(16), y = 4 + R.int(12); p(b, x, y, 0x8a1a1a); p(b, x + 1, y, 0x5a0e10); }
    put('zarza' + v, b);
  }
};
