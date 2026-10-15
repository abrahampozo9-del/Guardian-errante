// ====================================================================== dibujos de los lugares de la historia
Art.initPlaces = function () {
  const { img, p, r, ov, ova, line, shade } = Px;
  const put = (k, b) => { Art.P[k] = b; };
  const sh = (b, cx, cy, rx, ry) => ova(b, cx, cy, rx, ry, 0x46000000);
  const fin = b => { Px.outlineTint(b, 0.3); return b; };
  // ---------------------------------------------------------------- fuente del Músico: pilón octogonal y el músico de bronce con su guitarra
  {
    const b = img(34, 34);
    sh(b, 17, 31, 15, 3);
    ov(b, 17, 26, 15, 6, 0x8a8478); ov(b, 17, 25, 14, 5, 0xb0a898); ov(b, 17, 25, 11, 3.6, 0x24606a); ov(b, 15, 24, 4, 1.2, 0x5aa0a8);
    r(b, 15, 12, 4, 14, 0x9a9488); r(b, 15, 12, 1, 14, 0xc4bcae);
    // el músico
    r(b, 15, 4, 4, 9, 0x4a6a5a); ov(b, 17, 3, 2.2, 2.2, 0x5a7a68); r(b, 13, 8, 8, 2, 0x3e5a4c); ov(b, 20, 9, 2.5, 2, 0x6a5030); line(b, 19, 8, 23, 4, 0x6a5030);
    for (let i = 0; i < 4; i++) p(b, 12 + i * 3, 22 - (i % 2), 0xa8e0e8);
    put('fuente_musico', fin(b));
  }
  // ---------------------------------------------------------------- caseta de turismo: casita con ventanilla y poyete
  for (let v = 0; v < 2; v++) {
    const b = img(34, 36);
    sh(b, 17, 33, 15, 3);
    r(b, 3, 12, 28, 21, 0xece6d8); r(b, 3, 12, 28, 1, 0xfaf6ee); r(b, 3, 30, 28, 3, 0xb89a6a);
    for (let x = 1; x < 33; x += 4) { r(b, x, 4, 4, 9, 0xb4583a); r(b, x, 4, 1, 9, 0x8a3a22); p(b, x + 2, 5, 0xd87a52); }
    r(b, 1, 12, 32, 1, 0x6a2a1a);
    // ventanilla con poyete (a la izquierda)
    r(b, 6, 16, 9, 7, 0x2a2420); r(b, 6, 16, 9, 1, 0x4a3a2a); r(b, 5, 23, 11, 2, 0xd8ccb4);
    // puerta: cerrada o abierta de par en par con luz roja de dentro
    if (!v) { r(b, 20, 16, 8, 14, 0x5a3a20); for (let x = 21; x < 28; x += 2) r(b, x, 16, 1, 14, 0x4a2a14); p(b, 26, 23, 0xd0b060); }
    else { r(b, 20, 16, 8, 14, 0x1a0404); for (let y = 18; y < 30; y += 3) r(b, 21, y, 6, 1, 0x5a1408); r(b, 22, 27, 4, 3, 0xa02a10); r(b, 28, 16, 2, 14, 0x5a3a20); }
    r(b, 8, 26, 1, 4, 0x8a8a8a); // cartel "i"
    put(v ? 'caseta_abierta' : 'caseta_turismo', fin(b));
  }
  // ---------------------------------------------------------------- observatorio de aves: caseta de madera sobre pilotes
  {
    const b = img(34, 38);
    sh(b, 17, 35, 14, 3);
    for (const x of [6, 26]) { r(b, x, 22, 2, 14, 0x4a3420); line(b, x, 35, x + (x < 15 ? 6 : -6), 24, 0x3a2818); }
    r(b, 3, 10, 28, 14, 0x6a4a2a); for (let y = 11; y < 24; y += 3) r(b, 3, y, 28, 1, 0x4a3220);
    r(b, 7, 15, 20, 2, 0x0e0a08);
    for (let x = 1; x < 33; x += 3) { line(b, 17, 2, x, 10, 0x3a3a3a); } r(b, 1, 9, 32, 2, 0x2a2a2a);
    r(b, 12, 24, 10, 2, 0x5a4026); r(b, 14, 26, 6, 10, 0x4a3420); for (let y = 27; y < 36; y += 2) r(b, 14, y, 6, 1, 0x6a4a2e);
    put('observatorio', fin(b));
  }
  // ---------------------------------------------------------------- pedestal del jardín con las agujas (negras o limpias)
  for (let v = 0; v < 2; v++) {
    const b = img(18, 24);
    sh(b, 9, 22, 7, 2);
    r(b, 4, 12, 10, 10, 0x8a8478); r(b, 3, 11, 12, 2, 0xb0a898); r(b, 3, 21, 12, 2, 0x6e6a60);
    for (let i = 0; i < 5; i++) p(b, 5 + i * 2, 15 + (i % 2) * 3, 0x5a7a3a);
    if (!v) { line(b, 7, 10, 9, 2, 0x1a1410); line(b, 10, 10, 13, 4, 0x1a1410); r(b, 8, 9, 3, 2, 0x2a1a14); for (let i = 0; i < 6; i++) p(b, 6 + i, 3 + (i * 7) % 6, 0x3a1a3a); }
    else { line(b, 7, 10, 9, 2, 0xf0d080); line(b, 10, 10, 13, 4, 0xf0d080); r(b, 8, 9, 3, 2, 0xc8a040); p(b, 9, 2, 0xffffff); }
    put(v ? 'pedestal_limpio' : 'pedestal_negro', fin(b));
  }
  // ---------------------------------------------------------------- cascada de Guazalamanco (3 fotogramas)
  Art.cascada = [];
  for (let f = 0; f < 3; f++) {
    const b = img(32, 44);
    for (let y = 0; y < 34; y++) for (let x = 8; x < 24; x++) { const c = (y + f * 3 + x * 2) % 7 < 2 ? 0xd8f4f0 : (x % 3 === 0 ? 0x7ac8c8 : 0x4aa8b0); p(b, x, y, c); }
    ov(b, 16, 37, 15, 6, 0x2a8a92); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; p(b, 16 + Math.cos(a) * (8 + f), 36 + Math.sin(a) * 3, 0xf0fffc); }
    for (let i = 0; i < 6; i++) p(b, 10 + ((i * 5 + f * 3) % 14), 33 - (i % 3), 0xffffff);
    Art.cascada.push(b);
  }
  put('cascada', Art.cascada[0]);
  // ---------------------------------------------------------------- boca de la cueva PB4
  {
    const b = img(40, 30);
    ov(b, 20, 20, 19, 12, 0x5a564e); ov(b, 20, 18, 17, 10, 0x6e6a60);
    ov(b, 20, 22, 10, 8, 0x060606); r(b, 10, 22, 20, 8, 0x060606);
    for (let i = 0; i < 8; i++) p(b, 12 + i * 2, 14 + (i % 3), 0x8a8478);
    line(b, 8, 12, 4, 6, 0x4a5a3a); line(b, 32, 12, 36, 7, 0x4a5a3a);
    r(b, 15, 26, 2, 4, 0xc8b070); r(b, 14, 25, 4, 1, 0xc8b070); // cartel del espeleo
    put('cueva_pb4', fin(b));
  }
  // ---------------------------------------------------------------- tienda de campaña y mesa de pícnic
  { const b = img(24, 18); sh(b, 12, 16, 11, 2); for (let y = 2; y < 16; y++) { const w = (y - 2) * 0.8; r(b, 12 - w, y, w * 2, 1, y % 4 ? 0x3a6a4a : 0x2e5a3e); } r(b, 11, 8, 2, 8, 0x14201a); put('tienda', fin(b)); }
  { const b = img(24, 16); sh(b, 12, 14, 11, 2); r(b, 2, 4, 20, 4, 0x8a6a42); r(b, 2, 4, 20, 1, 0xa8885a); r(b, 0, 10, 24, 2, 0x7a5a36); for (const x of [4, 18]) r(b, x, 8, 2, 6, 0x5a4026); put('picnic', fin(b)); }
  // ---------------------------------------------------------------- pista de pádel (suelo, se dibuja bajo todo)
  {
    const W = 8 * 16, H = 11 * 16, b = img(W, H);
    r(b, 0, 0, W, H, 0x2a4a7a);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x * 7 + y * 13) % 11 === 0) p(b, x, y, 0x26446e);
    const L = 0xe8eef4;
    r(b, 6, 6, W - 12, 1, L); r(b, 6, H - 7, W - 12, 1, L); r(b, 6, 6, 1, H - 12, L); r(b, W - 7, 6, 1, H - 12, L);
    r(b, 6, 40, W - 12, 1, L); r(b, 6, H - 41, W - 12, 1, L); r(b, W / 2, 40, 1, H - 80, L);
    r(b, 4, H / 2 - 1, W - 8, 3, 0x1a1a1a); for (let x = 4; x < W - 4; x += 2) p(b, x, H / 2, 0xd8d8d8); r(b, 4, H / 2 - 1, W - 8, 1, 0xf0f0f0);
    // cristales y verja en los fondos
    for (const yy of [0, H - 5]) { r(b, 0, yy, W, 5, 0x6a8aa8); for (let x = 0; x < W; x += 12) r(b, x, yy, 1, 5, 0x2a2a30); r(b, 0, yy, W, 1, 0xb8d8f0); }
    for (const xx of [0, W - 3]) { r(b, xx, 0, 3, H, 0x2a2a30); for (let y = 0; y < H; y += 3) p(b, xx + 1, y, 0x6a6a78); }
    Art.padel = b;
  }
  // ---------------------------------------------------------------- Miguel caído (tumbado, alas abiertas, herido)
  {
    const b = img(44, 20), wing = 0xf4f2ea, w2 = 0xc8ccd4;
    sh(b, 22, 16, 20, 3);
    for (let k = 0; k < 7; k++) { line(b, 20, 10, 2 + k, 2 + k * 2, k % 2 ? w2 : wing); line(b, 24, 10, 42 - k, 3 + k * 2, k % 2 ? w2 : wing); }
    r(b, 14, 9, 16, 6, 0xf0ece0); r(b, 26, 8, 6, 6, 0xf0d8c0); r(b, 31, 8, 3, 6, 0xe8d090);
    r(b, 18, 11, 6, 2, 0xa02a20); p(b, 20, 14, 0x8a1a10); p(b, 23, 15, 0x8a1a10);
    r(b, 8, 12, 10, 1, 0xfff0b0);
    put('miguel_caido', fin(b));
  }
};
