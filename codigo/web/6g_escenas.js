// ====================================================================== escenas de las cinemáticas
// Referencias: cielos de tormenta de John Martin (masas oscuras con un rasgón de luz y haces que caen),
// las fotos del valle (río turquesa, chopos, olivares en bancales, cortijo encalado), y la ficha del
// Guardián. Cada escena: build() pinta las capas una vez; draw(t, L) las compone con cámara y efectos.
(function () {
  const { R, q, L, put, poly, ell, cyl, sky, clouds, range, olive, poplar, deadTree, pine, cypress, town, tower, crowd, outline, rim, fbm, vn } = CP;
  const { def, lay, pan, glow, rays, rain, embers, ash, flash, bolt, flame, fade, cam } = CS;
  const W = CW + 48, H = CH + 24; // capas un poco mayores que la pantalla para mover la cámara
  const scaled = (b, x, y, s, k = 1) => { cg.imageSmoothingEnabled = false; cg.drawImage(CS.img(b), Math.round(x - cam.x * k), Math.round(y - cam.y * k), b.w * s, b.h * s); };
  const guardFrames = (o) => [0, 1, 2, 3].map(f => FIG.guardian(f, o));
  const pick = (arr, t, fps = 4) => arr[Math.floor(t * fps) % arr.length];

  // ---------------------------------------------------------------- paletas
  const P = {
    stormSky: R([0x07080c, 0x0e1218, 0x161c24, 0x222a32, 0x343c42, 0x4e5450, 0x76765e, 0xb8a878, 0xf2e0a8]),
    stormCloud: R([0x06070a, 0x0e1116, 0x181c22, 0x262a2e, 0x3a3c3a, 0x5a5848, 0x8e8460, 0xd8c890]),
    bloodSky: R([0x080204, 0x16050a, 0x2a080c, 0x46100e, 0x6a1a10, 0x942a12, 0xc44a18, 0xf08a2a]),
    bloodCloud: R([0x060203, 0x12050a, 0x22080c, 0x3a0e0e, 0x5a1610, 0x8a2814, 0xc0481c]),
    nightSky: R([0x020308, 0x060a16, 0x0c1426, 0x142038, 0x1e2c4a, 0x2c3c5c]),
    nightCloud: R([0x030409, 0x080c16, 0x101826, 0x1a2436, 0x2a364a, 0x3e4c62, 0x6a7a90]),
    duskSky: R([0x0e0a18, 0x1e1228, 0x3a1a34, 0x642638, 0x963a36, 0xc85c3a, 0xf0904a, 0xffc878]),
    duskCloud: R([0x0a0610, 0x180c1c, 0x2c1424, 0x4a1e2a, 0x742c2e, 0xa84634, 0xe07a44, 0xffb870]),
    dawnSky: R([0x3a3a50, 0x5a5268, 0x8a6e78, 0xb8887e, 0xe0a888, 0xf4c89a, 0xfce0b4]),
    sierraFar: R([0x1a1c28, 0x242838, 0x2e3446, 0x3a4256, 0x4a5466]),
    sierraMid: R([0x10141a, 0x182028, 0x222c34, 0x2e3a40, 0x3e4c4e, 0x56645e]),
    hillsOlive: R([0x0e120c, 0x161e12, 0x202a18, 0x2c3820, 0x3c4a2a, 0x506034, 0x6a7a42]),
    olive: R([0x0e140c, 0x1e2a18, 0x2e3c24, 0x44543a, 0x5e6e50, 0x7e8c6a]),
    poplar: R([0x0e1a0a, 0x1e3212, 0x2e4a1a, 0x426624, 0x5a8430, 0x7aa240]),
    river: R([0x08202a, 0x0e3038, 0x164448, 0x1e5a58, 0x2a7470, 0x48a098, 0x8ad0c4]),
    whiteWall: R([0x5a5650, 0x86807a, 0xb0aaa0, 0xd2ccc0, 0xece6da]),
    roof: R([0x2a0e08, 0x4a1a10, 0x6a2a18, 0x8a3c22, 0xa8502e]),
    stone: R([0x2a2420, 0x4a403a, 0x6a5e54, 0x8a7e70, 0xaaa090, 0xcac0ae]),
    ground: R([0x0a0806, 0x14100c, 0x1e1812, 0x2a2218, 0x3a3022, 0x4c402e]),
    hellGround: R([0x060202, 0x120404, 0x1e0806, 0x2e0c08, 0x44140a, 0x6a2210]),
  };
  // cielo de tormenta completo (fondo + dos capas de nubes que se mueven a distinta velocidad)
  function storm(o) {
    const sk = L(W, H); sky(sk, o.sky, { gx: o.gx, gy: o.gy, gr: o.gr || 160, gk: o.gk || 0.55, seed: o.seed, k: o.k || 1.05 });
    const c1 = L(W + 200, Math.round(H * 0.75)); clouds(c1, o.cloud, { seed: o.seed + 1, scale: o.scale || 70, cover: o.cover || 0.55, y0: 0, y1: c1.h, lx: o.lx || 0, ly: -1, lightAt: o.gx !== undefined ? [o.gx + 100, o.gy, o.gr || 160] : null, relief: 8 });
    const c2 = L(W + 200, Math.round(H * 0.5)); clouds(c2, o.cloud, { seed: o.seed + 7, scale: (o.scale || 70) * 0.7, cover: (o.cover || 0.55) - 0.12, y0: 0, y1: c2.h, lx: o.lx || 0, ly: -1, relief: 6 });
    return { sk, c1, c2 };
  }
  function drawStorm(S, t, sp = 1) {
    lay(S.sk, 0, 0, 0.2);
    lay(S.c2, -((t * 3 * sp) % 200), -4, 0.3);
    lay(S.c1, -((t * 6 * sp) % 200) - 40, 0, 0.45);
  }
  // valle del Guadalentín (según las fotos): sierra, laderas de olivos en bancales, chopos, río turquesa
  function valley(o) {
    const far = L(W, H); range(far, o.far || P.sierraFar, { base: 92, amp: 46, freq: 0.006, seed: 21, lit: -1, fade: 0.4 });
    const mid = L(W, H); range(mid, o.mid || P.sierraMid, { base: 118, amp: 32, freq: 0.01, seed: 22, lit: -1, fade: 0.6, tex: 0.5 });
    const hills = L(W, H); const hAt = range(hills, o.hills || P.hillsOlive, { base: 146, amp: 22, freq: 0.012, seed: 23, lit: -1, fade: 0.55, soft: true, tex: 0.4 });
    for (let x = 4; x < W; x += 9) for (let k = 0; k < 4; k++) { const y = hAt(x) + 6 + k * 9 + ((x / 9) % 2) * 3; if (y < H - 30) olive(hills, x + (k % 2) * 4, y, 0.85 + k * 0.15, o.olive || P.olive); }
    for (let x = 0; x < W; x++) for (let k = 1; k < 4; k++) { const y = Math.round(hAt(x) + k * 9 + 2); if (y < H) put(hills, x, y, (o.hills || P.hillsOlive)[1]); } // muros de bancal
    const front = L(W, H);
    // vega: hierba y el río que serpentea hacia el espectador
    for (let y = 168; y < H; y++) for (let x = 0; x < W; x++) put(front, x, y, q(o.grass || P.hillsOlive, 0.55 - (y - 168) / 90 + (fbm(x / 12, y / 4, 31, 3) - 0.5) * 0.5, x, y));
    for (let y = 166; y < H; y++) { const cx = 150 + Math.sin(y * 0.09) * 20 + (y - 166) * 1.4, w = 8 + (y - 166) * 0.9; for (let x = Math.floor(cx - w); x < cx + w; x++) put(front, x, y, q(o.river || P.river, 0.65 - Math.abs(x - cx) / w * 0.3 + (vn(x / 6, y / 1.5, 4) > 0.72 ? 0.35 : 0), x, y)); }
    for (let i = 0; i < 9; i++) poplar(front, 118 + i * 9 + (i % 2) * 40, 182 + (i * 7) % 18, 46 + (i % 3) * 10, o.poplar || P.poplar);
    return { far, mid, hills, front };
  }
  // el cortijo (como en las fotos): casa blanca alargada, tejado de teja, chimenea de piedra, placas solares
  function cortijo(b, x, y, lit) {
    poly(b, [[x, y - 22], [x + 64, y - 22], [x + 64, y], [x, y]], (px, py, u, v) => q(P.whiteWall, 0.85 - u * 0.25 - v * 0.15, px, py));
    poly(b, [[x - 3, y - 22], [x + 67, y - 22], [x + 60, y - 31], [x + 4, y - 31]], (px, py, u, v) => q(P.roof, 0.65 - v * 0.3 + ((py & 1) ? 0.1 : -0.06), px, py));
    for (let k = 0; k < 4; k++) poly(b, [[x + 14 + k * 9, y - 30], [x + 22 + k * 9, y - 30], [x + 23 + k * 9, y - 25], [x + 13 + k * 9, y - 25]], (px, py, u) => q(R([0x101826, 0x1e2e48, 0x3a5a8a, 0x8ab0e0]), 0.7 - u * 0.4, px, py));
    poly(b, [[x + 56, y - 40], [x + 62, y - 40], [x + 62, y - 26], [x + 56, y - 26]], cyl(P.stone, -1));
    poly(b, [[x + 55, y - 42], [x + 63, y - 42], [x + 63, y - 40], [x + 55, y - 40]], P.stone[1]);
    for (const wx of [x + 8, x + 26, x + 44]) { poly(b, [[wx, y - 15], [wx + 6, y - 15], [wx + 6, y - 7], [wx, y - 7]], lit ? 0xffc060 : 0x1a1410); poly(b, [[wx - 1, y - 16], [wx + 7, y - 16], [wx + 7, y - 15], [wx - 1, y - 15]], 0x5a3a20); }
    poly(b, [[x + 34, y - 14], [x + 40, y - 14], [x + 40, y], [x + 34, y]], 0x4a2a14);
    poly(b, [[x + 70, y - 14], [x + 92, y - 14], [x + 92, y], [x + 70, y]], (px, py, u) => q(P.whiteWall, 0.7 - u * 0.3, px, py)); // la cochera aparte
    poly(b, [[x + 68, y - 14], [x + 94, y - 14], [x + 90, y - 19], [x + 72, y - 19]], (px, py) => q(P.roof, 0.55, px, py));
    poly(b, [[x + 75, y - 10], [x + 87, y - 10], [x + 87, y], [x + 75, y]], 0x3a3a3c);
  }

  // ================================================================== INTRO
  def('escrituras', () => {
    const room = L(W, H);
    // pared de yeso en penumbra, luz de vela desde abajo a la izquierda (horneada)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const d = Math.hypot(x - 150, (y - 150) * 1.2); put(room, x, y, q(R([0x060404, 0x0e0a08, 0x18120c, 0x261c12, 0x3a2a1a, 0x523a22]), 0.95 - d / 260 + (fbm(x / 20, y / 20, 3, 3) - 0.5) * 0.15, x, y)); }
    // ventana con reja a la noche roja
    const wx = 250, wy = 26, ww = 96, wh = 76;
    const win = L(ww, wh); sky(win, P.bloodSky, { gx: 70, gy: 70, gr: 90, gk: 0.4, seed: 5 }); clouds(win, P.bloodCloud, { seed: 6, scale: 26, cover: 0.55, y0: 0, y1: 50, ly: 1, relief: 6 });
    range(win, R([0x060203, 0x0e0405, 0x180708]), { base: 62, amp: 14, freq: 0.04, seed: 8, soft: true });
    poly(win, [[46, 46], [48, 46], [48, 62], [46, 62]], 0x040102); poly(win, [[42, 50], [52, 50], [52, 52], [42, 52]], 0x040102); // la cruz del cerro
    for (let y = 0; y < wh; y++) for (let x = 0; x < ww; x++) room.d[(wy + y) * W + wx + x] = win.d[y * ww + x];
    for (const bx of [wx + 23, wx + 47, wx + 71]) poly(room, [[bx, wy], [bx + 2, wy], [bx + 2, wy + wh], [bx, wy + wh]], 0x0a0806);
    poly(room, [[wx, wy + 37], [wx + ww, wy + 37], [wx + ww, wy + 39], [wx, wy + 39]], 0x0a0806);
    poly(room, [[wx - 5, wy - 5], [wx + ww + 5, wy - 5], [wx + ww + 5, wy], [wx - 5, wy]], 0x2a1a10); poly(room, [[wx - 5, wy + wh], [wx + ww + 5, wy + wh], [wx + ww + 5, wy + wh + 6], [wx - 5, wy + wh + 6]], 0x3a2616);
    // crucifijo en la pared
    poly(room, [[118, 30], [123, 30], [123, 70], [118, 70]], cyl(R([0x1a0e08, 0x3a2414, 0x5a3a20, 0x7a5430]), -1)); poly(room, [[108, 40], [133, 40], [133, 45], [108, 45]], cyl(R([0x1a0e08, 0x3a2414, 0x5a3a20, 0x7a5430]), -1));
    // mesa de madera
    const desk = L(W, H);
    for (let y = 150; y < H; y++) for (let x = 0; x < W; x++) put(desk, x, y, q(R([0x0a0604, 0x1a0e08, 0x2e1a0e, 0x462814, 0x5e381c, 0x7a4a26]), 0.8 - Math.hypot(x - 150, y - 160) / 260 + (Math.sin(x * 0.08 + Math.sin(y * 0.3) * 2) * 0.08), x, y));
    // la Biblia abierta (grande), con letra capitular roja
    const book = L(W, H), PG = R([0x5a4a32, 0x8a7656, 0xb8a27c, 0xdccaa0, 0xf0e2bc]);
    poly(book, [[110, 166], [200, 158], [204, 210], [104, 216]], (x, y, u, v) => q(PG, 0.85 - (1 - u) * 0.2 - Math.abs(u - 1) * 0.1 - v * 0.25, x, y));
    poly(book, [[200, 158], [292, 164], [298, 214], [204, 210]], (x, y, u, v) => q(PG, 0.9 - u * 0.3 - v * 0.2, x, y));
    for (let i = 0; i < 9; i++) { for (let x = 120; x < 192; x++) if (vn(x / 2, i, 3) > 0.25) put(book, x, 172 + i * 4 + (x - 120) * -0.08, 0x3a2a1c); for (let x = 210; x < 288; x++) if (vn(x / 2, i + 20, 3) > 0.25 && !(i < 3 && x < 222)) put(book, x, 170 + i * 4 + (x - 210) * 0.06, 0x3a2a1c); }
    poly(book, [[211, 168], [220, 168], [220, 180], [211, 180]], (x, y, u) => q(R([0x5a0a08, 0x9a1810, 0xc8301e]), 0.8 - u * 0.4, x, y));
    poly(book, [[198, 158], [206, 158], [206, 212], [198, 212]], PG[1]);
    poly(book, [[104, 214], [204, 210], [298, 212], [298, 218], [204, 216], [104, 220]], 0x3a1a0e); // tapa
    // vela
    poly(book, [[78, 132], [90, 132], [90, 178], [78, 178]], cyl(R([0x8a7a5a, 0xc8b88e, 0xeadcb4, 0xfff4d8]), -1));
    ell(book, 84, 180, 14, 4, cyl(R([0x3a2a14, 0x6a5030, 0x9a7a4a]), -1));
    return { room, desk, book };
  }, (t, S) => {
    pan(t, 30, 20, 8, 8, 14);
    const fl = Math.sin(t * 11) * 0.6 + Math.sin(t * 17) * 0.4;
    lay(S.room, 0, 0, 0.5); lay(S.desk, 0, 0, 0.9); lay(S.book, 0, 0, 1);
    glow(84 - cam.x, 120 - cam.y, 180 + fl * 4, 'rgba(255,150,60,0.28)');
    glow(84 - cam.x, 120 - cam.y, 50, 'rgba(255,210,120,0.4)');
    flame(84 - cam.x, 132 - cam.y, 14, t);
    // polvo en la luz de la vela
    embers(t, 14, 40 - cam.x, 140 - cam.x, 150 - cam.y, [255, 220, 170], 18);
    fade(0.06 + 0.04 * fl);
  });

  def('anticristo', () => {
    const S = storm({ sky: R([0x0a0604, 0x1e1006, 0x3a200a, 0x5e3410, 0x8a5018, 0xb87424, 0xe0a63a, 0xffd870]), cloud: R([0x080402, 0x160a04, 0x2a1408, 0x46220c, 0x6a3812, 0x9a5a1e, 0xd08e34]), seed: 40, gx: 220, gy: 70, gr: 170, gk: 0.7, cover: 0.5 });
    const stage = L(W, H), DK = R([0x060302, 0x100804, 0x1a0e06, 0x28160a]);
    poly(stage, [[150, 150], [300, 150], [320, 200], [130, 200]], (x, y, u, v) => q(DK, 0.7 - v * 0.6, x, y));
    poly(stage, [[140, 146], [310, 146], [312, 152], [138, 152]], R([0x3a2a10])[0]);
    for (let i = 0; i < 7; i++) poly(stage, [[160 + i * 22, 152], [164 + i * 22, 152], [164 + i * 22, 198], [160 + i * 22, 198]], DK[2]);
    // estandartes con el ojo
    for (const bx of [70, 360]) {
      poly(stage, [[bx, 30], [bx + 3, 30], [bx + 3, 200], [bx, 200]], DK[1]);
      poly(stage, [[bx + 3, 34], [bx + 40, 34], [bx + 40, 104], [bx + 22, 94], [bx + 3, 104]], (x, y, u, v) => q(R([0x2a0806, 0x4a0e0a, 0x6a1610, 0x8a2216, 0xa83020]), 0.8 - u * 0.5 + Math.sin(y * 0.3) * 0.05, x, y));
      ell(stage, bx + 22, 62, 12, 7, (x, y, dx, dy) => q(R([0x8a6a20, 0xc8a040, 0xf0d070]), 0.8 - dy * 0.3, x, y)); ell(stage, bx + 22, 62, 5, 5, 0x1a0806); ell(stage, bx + 21, 61, 1.5, 1.5, 0xf0e0b0);
    }
    const crowdL = L(W, H); crowd(crowdL, -10, W + 10, 196, 160, 0x070302, 41, 14, 10); crowd(crowdL, -10, W + 10, 214, 140, 0x040201, 42, 18, 12);
    const ac = FIG.antichrist();
    return { S, stage, crowdL, ac };
  }, (t, S) => {
    pan(t, 20, 18, 24, 6, 12);
    drawStorm(S.S, t, 0.5);
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.3);
    glow(224 - cam.x * 0.3, 64 - cam.y * 0.3, 160, `rgba(255,210,120,${0.3 + 0.15 * pulse})`);
    cg.save(); cg.strokeStyle = '#ffe28a'; cg.lineWidth = 3; cg.globalAlpha = 0.85; cg.beginPath(); cg.arc(Math.round(224 - cam.x * 0.3), Math.round(64 - cam.y * 0.3), 36 + pulse * 2, 0, Math.PI * 2); cg.stroke(); cg.restore();
    rays(224 - cam.x * 0.3, 64 - cam.y * 0.3, 9, 300, 2.4, Math.PI / 2, 'rgba(255,220,140,A)', 0.14, t);
    lay(S.stage, 0, 0, 0.8);
    const arm = Math.sin(t * 0.8) * 3;
    scaled(S.ac, 225 - 35, 150 - 136 + arm * 0.2, 1, 0.8);
    lay(S.crowdL, Math.sin(t * 2) * 1, 0, 1);
    // brazos alzados de la multitud que se mueven
    for (let i = 0; i < 30; i++) { const x = (i * 37) % W - cam.x, y = 186 + (i * 13) % 20 - cam.y, up = Math.sin(t * 3 + i) > 0.2; cg.fillStyle = '#070302'; cg.fillRect(Math.round(x), Math.round(y - (up ? 16 : 10)), 2, up ? 8 : 4); }
  });

  def('apagon', () => {
    const S = storm({ sky: P.nightSky, cloud: P.nightCloud, seed: 50, cover: 0.42, scale: 80 });
    const stars = L(W, H); const Rr = RNG(51); for (let i = 0; i < 160; i++) put(stars, Rr.int(W), Rr.int(110), i % 5 ? 0x8a94b0 : 0xe8f0ff);
    const far = L(W, H); range(far, P.sierraFar, { base: 108, amp: 40, freq: 0.006, seed: 52, fade: 0.4 });
    const tw = L(W, H); range(tw, R([0x080a12, 0x0e1220, 0x161c2c, 0x202838]), { base: 150, amp: 16, freq: 0.01, seed: 53, soft: true });
    const wins = town(tw, 70, 380, 156, { wall: R([0x1a1e2c, 0x2a3040, 0x3a4256, 0x4a546a]), roof: R([0x0e1018, 0x1a1c28, 0x262836]), lit: 1, seed: 54, hill: 22 });
    tower(tw, 214, 136, 34, R([0x1a1e2c, 0x2a3040, 0x3a4256, 0x4c566c]), { roof: R([0x0e1018, 0x1a1c28]) });
    const fg = L(W, H); range(fg, R([0x020306, 0x05070c, 0x0a0e16]), { base: 196, amp: 10, freq: 0.02, seed: 55, soft: true });
    for (let i = 0; i < 6; i++) olive(fg, 20 + i * 70, 200 + (i % 2) * 6, 1.6, R([0x020306, 0x060a10, 0x0c1218]));
    // orden en que se apagan las ventanas
    const order = wins.map((p, i) => [p, CP.hsh(i, 3, 9)]).sort((a, b) => a[1] - b[1]).map(a => a[0]);
    return { S, stars, far, tw, fg, order };
  }, (t, S) => {
    pan(t, 10, 8, 30, 14, 9);
    lay(S.S.sk, 0, 0, 0.1); lay(S.stars, 0, 0, 0.1);
    lay(S.S.c2, -((t * 2) % 200), 0, 0.2);
    lay(S.far, 0, 0, 0.3); lay(S.tw, 0, 0, 0.6);
    const on = Math.max(0, S.order.length * (1 - t / 6.2));
    for (let i = 0; i < on; i++) { const [x, y] = S.order[i]; cg.fillStyle = i % 3 ? '#ffd070' : '#ffe8a0'; cg.fillRect(Math.round(x - cam.x * 0.6), Math.round(y - cam.y * 0.6), 2, 3); }
    if (on > 2) glow(220 - cam.x * 0.6, 150 - cam.y * 0.6, 160, `rgba(255,190,90,${0.25 * on / S.order.length})`);
    lay(S.fg, 0, 0, 1);
    if (t > 6.2) fade((t - 6.2) * 0.25);
  });

  def('arrebato', () => {
    const S = storm({ sky: P.nightSky, cloud: P.nightCloud, seed: 60, cover: 0.62, gx: 220, gy: 0, gr: 140, gk: 0.4 });
    const far = L(W, H); range(far, P.sierraFar, { base: 120, amp: 34, freq: 0.007, seed: 61 });
    const tw = L(W, H); range(tw, R([0x080a12, 0x0e1220, 0x161c2c]), { base: 162, amp: 12, freq: 0.012, seed: 62, soft: true });
    town(tw, 60, 390, 168, { wall: R([0x262c3e, 0x384058, 0x4c5672, 0x606a86]), roof: R([0x10121c, 0x1c1e2c, 0x2a2c3c]), seed: 63, hill: 20 });
    tower(tw, 210, 148, 32, R([0x262c3e, 0x384058, 0x4c5672, 0x6a7490]));
    return { S, far, tw };
  }, (t, S) => {
    pan(t, 24, 20, 24, 0, 10);
    drawStorm(S.S, t, 0.4);
    // el cielo se rasga: luz que baja
    glow(244 - cam.x * 0.3, -10, 180, 'rgba(255,248,220,0.45)');
    rays(244 - cam.x * 0.3, -20, 7, 260, 1.2, Math.PI / 2, 'rgba(255,250,230,A)', 0.16, t);
    lay(S.far, 0, 0, 0.3); lay(S.tw, 0, 0, 0.6);
    // columnas de luz y almas subiendo
    cg.save(); cg.globalCompositeOperation = 'screen';
    for (const [x, w] of [[100, 16], [214, 22], [320, 14], [158, 8], [270, 9]]) {
      const xx = x - cam.x * 0.6, g = cg.createLinearGradient(0, 0, 0, 170); g.addColorStop(0, 'rgba(255,250,225,0.55)'); g.addColorStop(1, 'rgba(255,240,200,0.05)');
      cg.fillStyle = g; cg.fillRect(Math.round(xx - w / 2), 0, w, 170 - cam.y * 0.6);
      for (let i = 0; i < 5; i++) { const y = 165 - ((t * 18 + i * 34 + x) % 170); cg.fillStyle = 'rgba(255,255,245,0.95)'; cg.fillRect(Math.round(xx - 1), Math.round(y), 3, 6); cg.fillRect(Math.round(xx - 1), Math.round(y - 3), 3, 2); cg.fillRect(Math.round(xx - 3), Math.round(y + 1), 7, 1); }
    }
    cg.restore();
  });

  def('colapso', () => {
    const S = storm({ sky: P.bloodSky, cloud: P.bloodCloud, seed: 70, gx: 200, gy: 160, gr: 220, gk: 0.6, cover: 0.58 });
    const far = L(W, H); range(far, R([0x120406, 0x1e080a, 0x2e0e0c, 0x461410]), { base: 116, amp: 34, freq: 0.007, seed: 71 });
    const tw = L(W, H); range(tw, R([0x080202, 0x120404, 0x1c0806]), { base: 150, amp: 12, freq: 0.012, seed: 72, soft: true });
    const wins = town(tw, 50, 390, 156, { wall: R([0x1a0806, 0x2a0e0a, 0x3a160e]), roof: R([0x0c0302, 0x160605]), lit: 0.5, seed: 73, hill: 18, win: 0x080202 });
    tower(tw, 205, 138, 30, R([0x1a0806, 0x2a0e0a, 0x3a160e, 0x4a1e12]), { bellLit: true });
    const fg = L(W, H);
    for (let y = 170; y < H; y++) for (let x = 0; x < W; x++) put(fg, x, y, q(P.hellGround, 0.5 - (y - 170) / 100 + (fbm(x / 10, y / 4, 74, 3) - 0.5) * 0.6, x, y));
    // grietas de lava en el suelo
    const Rr = RNG(75); for (let i = 0; i < 14; i++) { let x = Rr.int(W), y = 172 + Rr.int(40); for (let k = 0; k < 30; k++) { put(fg, x, y, k % 4 ? 0xe85a14 : 0xffb040); put(fg, x, y + 1, 0x6a1a08); x += Rr.int(3) - 1 + (i % 2 ? 1 : -1) * 0.5; y += Rr.next() < 0.3 ? 1 : 0; } }
    return { S, far, tw, fg, wins };
  }, (t, S) => {
    pan(t, 20, 4, 24, 20, 10);
    drawStorm(S.S, t, 1.2);
    lay(S.far, 0, 0, 0.3); lay(S.tw, 0, 0, 0.6);
    for (const [x, y] of S.wins) if (Math.sin(t * 7 + x) > 0) glow(x - cam.x * 0.6, y - cam.y * 0.6, 10, 'rgba(255,120,30,0.6)');
    for (let i = 0; i < 6; i++) flame(70 + i * 55 - cam.x * 0.6, 150 - cam.y * 0.6 + (i % 2) * 4, 18 + (i % 3) * 6, t, i);
    lay(S.fg, 0, 0, 1);
    glow(200 - cam.x, 200 - cam.y, 220, 'rgba(255,90,30,0.25)');
    // engendros que salen de las grietas
    for (let i = 0; i < 8; i++) {
      const rise = Math.min(1, Math.max(0, t * 0.35 - i * 0.18)), x = 30 + i * 48 - cam.x, y = 214 - rise * 26 + (i % 2) * 6 - cam.y;
      cg.fillStyle = '#060202';
      cg.beginPath(); cg.ellipse(Math.round(x), Math.round(y - 12), 8, 14, 0, 0, Math.PI * 2); cg.fill();
      cg.fillRect(Math.round(x - 12), Math.round(y - 18), 3, 18); cg.fillRect(Math.round(x + 9), Math.round(y - 20), 3, 20);
      cg.fillStyle = '#ff3a18'; cg.fillRect(Math.round(x - 4), Math.round(y - 20), 2, 2); cg.fillRect(Math.round(x + 2), Math.round(y - 20), 2, 2);
    }
    embers(t, 60, 0, CW, 225);
    ash(t, 40, 0.5);
  });

  def('batalla', () => {
    const S = storm({ sky: R([0x060408, 0x0e0a12, 0x1a1018, 0x2a1418, 0x401a16, 0x5e2414, 0x8a3a18]), cloud: R([0x050306, 0x0c080c, 0x161014, 0x241618, 0x381e1a, 0x582a1e, 0x8a4426]), seed: 80, gx: 300, gy: 30, gr: 150, gk: 0.4, cover: 0.62 });
    const far = L(W, H); range(far, R([0x08060a, 0x100c10, 0x1a1418, 0x261c1e]), { base: 168, amp: 40, freq: 0.006, seed: 81 });
    const tw = L(W, H); town(tw, 40, 380, 198, { wall: R([0x120808, 0x1e0e0c, 0x2a1410]), roof: R([0x080404, 0x100606]), lit: 0.4, seed: 82, hill: 12, win: 0x0a0404 }); tower(tw, 200, 180, 26, R([0x120808, 0x1e0e0c, 0x2a1410, 0x3a1c14]));
    const ang = FIG.miguel({}), dem = FIG.demon({});
    return { S, far, tw, ang, dem };
  }, (t, S) => {
    pan(t, 20, 0, 28, 18, 10);
    drawStorm(S.S, t, 1.5);
    lay(S.far, 0, 0, 0.3);
    // a lo lejos, ángeles (destellos) y demonios chocando
    for (let i = 0; i < 9; i++) { const x = 40 + i * 42 + Math.sin(t * 0.6 + i) * 12 - cam.x * 0.4, y = 40 + (i % 3) * 18 + Math.cos(t * 0.9 + i * 2) * 6 - cam.y * 0.4; glow(x, y, 14, i % 2 ? 'rgba(255,250,220,0.7)' : 'rgba(255,60,20,0.6)'); cg.fillStyle = i % 2 ? '#fffbe8' : '#1a0404'; cg.fillRect(Math.round(x - 4), Math.round(y - 1), 9, 2); cg.fillRect(Math.round(x - 1), Math.round(y - 3), 3, 6); }
    // en primer plano, un arcángel y un demonio enormes enfrentados
    const bob = Math.sin(t * 1.4) * 4;
    glow(118 - cam.x * 0.7, 80 - cam.y * 0.7, 120, 'rgba(255,245,210,0.35)');
    scaled(S.ang, -2, 18 + bob, 1, 0.7);
    glow(300 - cam.x * 0.7, 80 - cam.y * 0.7, 110, 'rgba(255,60,20,0.3)');
    scaled(S.dem, 190, 4 - bob, 1, 0.7);
    if (Math.sin(t * 5) > 0.92) glow(206 - cam.x * 0.7, 70 - cam.y * 0.7, 40, 'rgba(255,230,160,0.8)');
    lay(S.tw, 0, 0, 1);
    embers(t, 40, 0, CW, 225);
    if (flash(t, 4.6, 3.1)) bolt(340, 0, Math.floor(t / 4.6));
  });

  def('valle', () => {
    const S = storm({ sky: R([0x3a4048, 0x4e545a, 0x666a6c, 0x84867e, 0xa6a490, 0xcac4a4]), cloud: R([0x262a30, 0x363a40, 0x4a4e52, 0x62666a, 0x7e8080, 0xa0a098]), seed: 90, gx: 320, gy: 40, gr: 130, gk: 0.35, cover: 0.5 });
    const V = valley({ far: R([0x3a4250, 0x4a5262, 0x5a6474, 0x6c7686, 0x808a98]), mid: R([0x263028, 0x323e34, 0x404c40, 0x50604c, 0x627258]), hills: R([0x2a3420, 0x364428, 0x445432, 0x54663c, 0x667a46, 0x7a8e54]), olive: R([0x1a2416, 0x2a3822, 0x3e4e32, 0x56664a, 0x728262, 0x8e9c7c]), poplar: R([0x1a2c10, 0x2a4618, 0x3e6222, 0x52802c, 0x6aa038, 0x90c050]), grass: R([0x2a3a1a, 0x384a22, 0x48602a, 0x5a7434, 0x70883e]) });
    const c = L(W, H); cortijo(c, 250, 176, false);
    return { S, V, c };
  }, (t, S) => {
    pan(t, 10, 18, 34, 10, 12);
    drawStorm(S.S, t, 0.4);
    lay(S.V.far, 0, 0, 0.25); lay(S.V.mid, 0, 0, 0.4); lay(S.V.hills, 0, 0, 0.6); lay(S.c, 0, 0, 0.8); lay(S.V.front, 0, 0, 1);
    // humo de la chimenea
    for (let i = 0; i < 8; i++) { const ph = (t * 0.25 + i * 0.125) % 1; cg.fillStyle = `rgba(200,200,200,${0.4 * (1 - ph)})`; cg.fillRect(Math.round(309 + Math.sin(ph * 6 + i) * 3 + ph * 10 - cam.x * 0.8), Math.round(134 - ph * 40 - cam.y * 0.8), 3, 2); }
    // destellos del río
    for (let i = 0; i < 10; i++) { const y = 172 + ((i * 11 + t * 6) % 50), cx = 150 + Math.sin(y * 0.09) * 20 + (y - 166) * 1.4; cg.fillStyle = 'rgba(200,250,240,0.6)'; cg.fillRect(Math.round(cx + Math.sin(t + i) * 4 - cam.x), Math.round(y - cam.y), 4, 1); }
    ash(t, 20, 0.35);
  });

  def('ribera', () => {
    const S = storm({ sky: P.duskSky, cloud: P.duskCloud, seed: 100, gx: 330, gy: 120, gr: 180, gk: 0.6, cover: 0.52 });
    const V = valley({ far: R([0x1e1424, 0x2a1a2e, 0x3a2236, 0x4c2c3e]), mid: R([0x120c14, 0x1a121a, 0x241820, 0x302028]), hills: R([0x0e0c0c, 0x161410, 0x201c14, 0x2c2618, 0x3a321e]), olive: R([0x080806, 0x12120c, 0x1c1c12, 0x28281a]), poplar: R([0x080a06, 0x10140a, 0x1a2010, 0x262e16]), grass: R([0x0a0c06, 0x12160a, 0x1c2010, 0x262c16]), river: R([0x0e1418, 0x18242a, 0x2a3a3e, 0x5a4a48, 0xa8603e, 0xe8904a]) });
    const c = L(W, H); cortijo(c, 250, 176, true);
    const g = guardFrames({ rimCol: 0xff9a50, lit: 1, drawn: true });
    return { S, V, c, g };
  }, (t, S) => {
    pan(t, 30, 16, 10, 8, 12);
    drawStorm(S.S, t, 0.6);
    lay(S.V.far, 0, 0, 0.25); lay(S.V.mid, 0, 0, 0.4); lay(S.V.hills, 0, 0, 0.6); lay(S.c, 0, 0, 0.8); lay(S.V.front, 0, 0, 1);
    glow(276 - cam.x * 0.8, 166 - cam.y * 0.8, 30, 'rgba(255,190,90,0.5)');
    for (let i = 0; i < 5; i++) {
      const rise = Math.min(1, Math.max(0, t * 0.4 - i * 0.3)), x = 120 + i * 16 + (i % 2) * 8 - cam.x, y = 214 - rise * 14 - cam.y;
      cg.fillStyle = '#050403'; cg.beginPath(); cg.ellipse(Math.round(x), Math.round(y - 8), 5, 9, 0, 0, Math.PI * 2); cg.fill();
      cg.fillRect(Math.round(x - 7), Math.round(y - 12), 2, 12); cg.fillRect(Math.round(x + 5), Math.round(y - 13), 2, 13);
      cg.fillStyle = '#ff3a18'; cg.fillRect(Math.round(x - 2), Math.round(y - 13), 1, 1); cg.fillRect(Math.round(x + 1), Math.round(y - 13), 1, 1);
    }
    lay(pick(S.g, t), 290, 92, 1.15);
  });

  // ---------------------------------------------------------------- el Guardián bajo la luna (portada del juego)
  def('guardian', () => {
    const S = storm({ sky: R([0x05080c, 0x0a1218, 0x101c24, 0x182a32, 0x223a40, 0x2e4c4e]), cloud: R([0x04070a, 0x081016, 0x0e1a20, 0x16262c, 0x223438, 0x34484a, 0x56706a]), seed: 110, cover: 0.48, scale: 90, gx: 200, gy: 60, gr: 120, gk: 0.3 });
    const moon = L(120, 120); ell(moon, 60, 60, 46, 46, (x, y, dx, dy) => q(R([0x8a9a8a, 0xa8b8a4, 0xc8d4be, 0xe2ead4, 0xf6f8ea]), 0.85 - dx * 0.2 - dy * 0.15 - (vn(x / 7, y / 7, 3) > 0.62 ? 0.25 : 0), x, y));
    const ruins = L(W, H), RU = R([0x060a0e, 0x0c141a, 0x121e26, 0x1a2a32, 0x24363e]);
    range(ruins, R([0x060a0e, 0x0a1218, 0x101c22]), { base: 150, amp: 22, freq: 0.012, seed: 111, soft: true });
    for (const [x, w, h] of [[22, 30, 90], [58, 16, 56], [330, 34, 100], [372, 20, 62], [300, 14, 44]]) { poly(ruins, [[x, 178 - h], [x + w * 0.4, 178 - h - 8], [x + w * 0.7, 178 - h + 6], [x + w, 178 - h + 2], [x + w, 178], [x, 178]], (px, py, u, v) => q(RU, 0.75 - u * 0.5 + ((py >> 2) % 2 && (px >> 3) % 2 ? 0.12 : 0), px, py)); if (h > 60) poly(ruins, [[x + w * 0.3, 178 - h * 0.7], [x + w * 0.6, 178 - h * 0.7], [x + w * 0.6, 178 - h * 0.45], [x + w * 0.3, 178 - h * 0.45]], 0x030507); }
    deadTree(ruins, 12, 230, 160, 0x03060a, 112, 0.55); deadTree(ruins, 404, 236, 170, 0x03060a, 113, 0.5);
    const fg = L(W, H), GR = R([0x030506, 0x070b0e, 0x0c1216, 0x121a1e, 0x1a2428, 0x243034]);
    for (let y = 176; y < H; y++) for (let x = 0; x < W; x++) { const cell = vn(x / 9, y / 4, 114); put(fg, x, y, q(GR, 0.6 - (y - 176) / 90 + (cell > 0.5 ? 0.15 : -0.1) + ((x + y * 3) % 17 === 0 ? -0.3 : 0), x, y)); }
    const g = guardFrames({ drawn: true, rimCol: 0xbfe0dc, lit: -1 });
    return { S, moon, ruins, fg, g };
  }, (t, S) => {
    pan(t, 20, 18, 24, 6, 12);
    lay(S.S.sk, 0, 0, 0.1);
    glow(226 - cam.x * 0.15, 66 - cam.y * 0.15, 150, 'rgba(210,235,220,0.3)');
    lay(S.moon, 166, 6, 0.15);
    lay(S.S.c2, -((t * 4) % 200), 30, 0.25); lay(S.S.c1, -((t * 7) % 200) - 30, 40, 0.35);
    lay(S.ruins, 0, 0, 0.6); lay(S.fg, 0, 0, 0.9);
    // velas y brasas en el suelo
    for (const [x, y] of [[96, 196], [318, 200]]) { glow(x - cam.x * 0.9, y - 8 - cam.y * 0.9, 34, 'rgba(255,170,60,0.45)'); cg.fillStyle = '#d8c8a0'; cg.fillRect(Math.round(x - 2 - cam.x * 0.9), Math.round(y - 10 - cam.y * 0.9), 4, 10); flame(x - cam.x * 0.9, y - 10 - cam.y * 0.9, 7, t, x); }
    glow(250 - cam.x, 214 - cam.y, 60, 'rgba(255,110,30,0.35)');
    lay(pick(S.g, t, 3), 152, 70, 1);
    embers(t, 30, 160 - cam.x, 300 - cam.x, 220 - cam.y);
  });

  def('tormenta', () => {
    const S = storm({ sky: R([0x060807, 0x0c100e, 0x141a16, 0x1e2620, 0x2a322a, 0x3a4032, 0x58583e, 0x8e8458]), cloud: R([0x040605, 0x0a0e0c, 0x121814, 0x1c221c, 0x2a3026, 0x3e4232, 0x5e5c40, 0x9a8c5a]), seed: 120, gx: 320, gy: 10, gr: 130, gk: 0.55, cover: 0.62, lx: 1 });
    const far = L(W, H); range(far, R([0x0e100e, 0x161a16, 0x1e241e, 0x283028]), { base: 150, amp: 30, freq: 0.008, seed: 121 });
    const fire = L(W, H); for (let y = 120; y < 170; y++) for (let x = 0; x < 140; x++) { const v = (1 - x / 140) * (1 - Math.abs(y - 150) / 30); if (v > 0) CP.putA(fire, x, y, 0xc83c14, Math.min(0.6, v)); }
    const rock = L(W, H); poly(rock, [[80, H], [140, 168], [190, 158], [240, 164], [300, H]], (x, y, u, v) => q(R([0x020302, 0x060806, 0x0c0e0c, 0x141814]), 0.7 - u * 0.4 - v * 0.3, x, y));
    const g = guardFrames({ rimCol: 0xe8e0b0, lit: 1, wind: 1.8 });
    return { S, far, fire, rock, g };
  }, (t, S) => {
    pan(t, 30, 10, 14, 4, 10);
    drawStorm(S.S, t, 2);
    rays(330 - cam.x * 0.3, -10, 6, 300, 0.5, Math.PI * 0.62, 'rgba(255,236,190,A)', 0.2, t);
    lay(S.fire, 0, 0, 0.3); lay(S.far, 0, 0, 0.4); lay(S.rock, 0, 0, 0.9);
    lay(pick(S.g, t, 6), 128, 24, 0.9);
    rain(t, 220, 0.4, 0.45, 300);
    if (flash(t, 5.5, 2.0, 0.15)) bolt(60, 0, Math.floor(t / 5.5), 110);
  });

  // ================================================================== CAPÍTULO 0-I
  def('radio', () => {
    const room = L(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) put(room, x, y, q(R([0x050404, 0x0c0a08, 0x16120e, 0x221a14, 0x30241a]), 0.9 - Math.hypot(x - 250, y - 130) / 240, x, y));
    const win = L(110, 80); sky(win, P.nightSky, { seed: 2 }); const Rr = RNG(3); for (let i = 0; i < 30; i++) put(win, Rr.int(110), Rr.int(50), 0xc8d0e8);
    range(win, R([0x04060a, 0x080c14, 0x0e1420]), { base: 60, amp: 18, freq: 0.04, seed: 4 }); for (let i = 0; i < 5; i++) poplar(win, 10 + i * 22, 82, 30, R([0x020304, 0x04060a, 0x080c12]));
    for (let y = 0; y < 80; y++) for (let x = 0; x < 110; x++) room.d[(24 + y) * W + 30 + x] = win.d[y * 110 + x];
    for (const bx of [55, 85, 115]) poly(room, [[bx, 24], [bx + 2, 24], [bx + 2, 104], [bx, 104]], 0x080604);
    poly(room, [[24, 18], [146, 18], [146, 24], [24, 24]], 0x2a1c12); poly(room, [[24, 104], [146, 104], [146, 110], [24, 110]], 0x3a2618);
    const desk = L(W, H); for (let y = 160; y < H; y++) for (let x = 0; x < W; x++) put(desk, x, y, q(R([0x0a0604, 0x1e120a, 0x341e10, 0x4c2c16, 0x6a3e1e]), 0.85 - Math.hypot(x - 250, y - 170) / 230 + Math.sin(x * 0.07 + y * 0.2) * 0.05, x, y));
    // la radio antigua, grande
    const rd = L(W, H), WD = R([0x1e120a, 0x3e2614, 0x5e3c20, 0x80562e, 0xa07040]);
    poly(rd, [[176, 98], [336, 98], [336, 172], [176, 172]], (x, y, u, v) => q(WD, 0.8 - u * 0.4 - v * 0.2 + Math.sin(y * 0.6) * 0.04, x, y));
    poly(rd, [[176, 92], [336, 92], [330, 98], [182, 98]], WD[4]);
    poly(rd, [[186, 106], [252, 106], [252, 164], [186, 164]], 0x1a120a);
    for (let y = 109; y < 162; y += 3) for (let x = 189; x < 250; x++) put(rd, x, y, (x + y) % 5 ? 0x3a2a1a : 0x2a1e12);
    poly(rd, [[264, 108], [326, 108], [326, 128], [264, 128]], (x, y, u) => q(R([0x8a7a4a, 0xc8b878, 0xe8dca0]), 0.9 - u * 0.2, x, y));
    for (let x = 268; x < 324; x += 4) put(rd, x, 112, 0x3a2a1a);
    for (const [cx, cy] of [[278, 148], [312, 148]]) ell(rd, cx, cy, 9, 9, (x, y, dx, dy) => q(R([0x14100c, 0x2a221a, 0x4a3e30, 0x6a5a48]), 0.7 - dx * 0.3 - dy * 0.3, x, y));
    poly(rd, [[316, 40], [318, 40], [318, 92], [316, 92]], 0x8a8a8a);
    return { room, desk, rd };
  }, (t, S) => {
    pan(t, 6, 10, 22, 4, 12);
    lay(S.room, 0, 0, 0.5); lay(S.desk, 0, 0, 0.9); lay(S.rd, 0, 0, 1);
    glow(295 - cam.x, 118 - cam.y, 90, 'rgba(255,180,90,0.35)');
    cg.fillStyle = '#c02018'; cg.fillRect(Math.round(268 + ((t * 9) % 56) - cam.x), Math.round(110 - cam.y), 1, 16);
    cg.fillStyle = Math.sin(t * 8) > 0 ? '#ff3020' : '#501010'; cg.fillRect(Math.round(330 - cam.x), Math.round(102 - cam.y), 3, 3);
    for (let i = 0; i < 4; i++) { const r = ((t * 22 + i * 14) % 56) + 6; cg.strokeStyle = `rgba(255,220,140,${0.5 * (1 - r / 62)})`; cg.lineWidth = 1; cg.beginPath(); cg.arc(Math.round(317 - cam.x), Math.round(40 - cam.y), r, -2.5, -0.6); cg.stroke(); }
    // ruido de estática
    for (let i = 0; i < 30; i++) { cg.fillStyle = `rgba(255,230,180,${Math.random() * 0.2})`; cg.fillRect(189 + Math.random() * 60 - cam.x, 108 + Math.random() * 54 - cam.y, 2, 1); }
  });

  def('iglesia', () => {
    const S = storm({ sky: P.nightSky, cloud: P.nightCloud, seed: 130, cover: 0.5 });
    const ch = L(W, H), ST2 = R([0x1a1612, 0x2e2822, 0x463c32, 0x5e5244, 0x786a58, 0x948470]);
    // la Encarnación: fachada de sillería con portada de arco y la torre a la izquierda
    poly(ch, [[140, 70], [300, 70], [300, 182], [140, 182]], (x, y, u, v) => q(ST2, 0.7 - u * 0.35 + (((y >> 3) + (x >> 4)) % 2 ? 0.04 : -0.04) + ((y & 7) === 0 ? -0.15 : 0), x, y));
    poly(ch, [[136, 66], [304, 66], [304, 72], [136, 72]], ST2[4]);
    poly(ch, [[200, 118], [240, 118], [240, 182], [200, 182]], 0x0e0a06); ell(ch, 220, 118, 20, 18, (x, y, dx, dy) => dy > 0 ? -1 : 0x0e0a06);
    for (let a = 0; a < Math.PI; a += 0.12) { put(ch, 220 + Math.cos(a) * 22, 118 - Math.sin(a) * 20, ST2[5]); put(ch, 220 + Math.cos(a) * 23, 118 - Math.sin(a) * 21, ST2[5]); }
    ell(ch, 220, 88, 9, 9, 0x2a1a10);
    tower(ch, 100, 182, 120, ST2, { w: 34, roof: R([0x10100e, 0x1e1c18, 0x2e2a24]) });
    const fg = L(W, H);
    for (let y = 180; y < H; y++) for (let x = 0; x < W; x++) put(fg, x, y, q(R([0x060504, 0x0e0c0a, 0x181410, 0x221c16]), 0.6 - (y - 180) / 60 + (vn(x / 8, y / 3, 131) - 0.5) * 0.5, x, y));
    // barricadas: muebles, palés, coches
    const Rr = RNG(132); for (let i = 0; i < 12; i++) { const x = i * 36 + Rr.int(10) - 10, h = 12 + Rr.int(14), w = 26 + Rr.int(10); poly(fg, [[x, 196 - h], [x + w, 194 - h + Rr.int(5)], [x + w, 198], [x, 198]], (px, py, u, v) => q(i % 3 ? R([0x0e0a06, 0x1e1610, 0x2e2418, 0x3e3222]) : R([0x0c0e10, 0x1a1e22, 0x2a3036, 0x3c444a]), 0.7 - u * 0.4, px, py)); if (i % 2) poly(fg, [[x + 6, 194 - h], [x + 8, 194 - h], [x + 8, 198], [x + 6, 198]], 0x050403); }
    crowd(fg, 130, 175, 212, 5, 0x030202, 133, 22, 6); crowd(fg, 240, 300, 212, 6, 0x030202, 134, 22, 6);
    return { S, ch, fg };
  }, (t, S) => {
    pan(t, 14, 4, 28, 16, 12);
    drawStorm(S.S, t, 0.5);
    lay(S.ch, 0, 0, 0.7);
    glow(220 - cam.x * 0.7, 88 - cam.y * 0.7, 18, 'rgba(255,200,110,0.6)');
    const f = Math.sin(t * 11);
    glow(205 - cam.x, 204 - cam.y, 110 + f * 4, 'rgba(255,140,50,0.5)');
    lay(S.fg, 0, 0, 1);
    flame(205 - cam.x, 214 - cam.y, 26, t);
    embers(t, 30, 190 - cam.x, 220 - cam.x, 210 - cam.y);
  });

  def('cruz', () => {
    const S = storm({ sky: P.duskSky, cloud: P.duskCloud, seed: 140, gx: 220, gy: 120, gr: 160, gk: 0.5, cover: 0.55 });
    const far = L(W, H); range(far, R([0x1e1424, 0x2a1a2e, 0x3a2236, 0x4c2c3e]), { base: 126, amp: 30, freq: 0.007, seed: 141 });
    const hill = L(W, H); const hAt = range(hill, R([0x0a080c, 0x120e12, 0x1c161a, 0x282024]), { base: 168, amp: 34, freq: 0.006, seed: 142, soft: true, tilt: 0 });
    // la carretera que sube
    for (let y = 176; y < H; y++) { const cx = 60 + (y - 176) * 4.2, w = 6 + (y - 176) * 0.9; for (let x = Math.floor(cx - w); x < cx + w; x++) put(hill, x, y, q(R([0x14121a, 0x1e1c24, 0x2a2830]), 0.6 - Math.abs(x - cx) / w * 0.3, x, y)); if (y % 6 < 3) put(hill, cx, y, 0x8a8478); }
    const cr = L(60, 110), CS2 = R([0x4a4038, 0x6a5e54, 0x8a7e70, 0xaa9e8e, 0xcac0ae, 0xeae2d0]);
    poly(cr, [[22, 4], [36, 4], [36, 98], [22, 98]], cyl(CS2, -1)); poly(cr, [[4, 26], [54, 26], [54, 38], [4, 38]], cyl(CS2, -1));
    poly(cr, [[12, 96], [46, 96], [50, 108], [8, 108]], cyl(R([0x2a241e, 0x4a4038, 0x6a5e54]), -1));
    outline(cr, 0x0a0806);
    const br = L(W, H); const Rr = RNG(143);
    for (let i = 0; i < 70; i++) { let x = Rr.int(W), y = H - 2, a = -Math.PI / 2 + (Rr.next() - 0.5) * 1.6; const len = 20 + Rr.int(40); for (let k = 0; k < len; k++) { put(br, x, y, k % 5 ? 0x050306 : 0x1a0a12); if (k % 7 === 3) { put(br, x + 1, y - 1, 0x2a0a14); put(br, x - 1, y - 1, 0x2a0a14); } x += Math.cos(a); y += Math.sin(a); a += (Rr.next() - 0.5) * 0.3 + (k > len / 2 ? 0.05 : 0); } }
    return { S, far, hill, cr, br, top: hAt(215) };
  }, (t, S) => {
    pan(t, 20, 16, 24, 0, 12);
    drawStorm(S.S, t, 0.4);
    lay(S.far, 0, 0, 0.3); lay(S.hill, 0, 0, 0.6);
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.6);
    glow(216 - cam.x * 0.6, S.top - 60 - cam.y * 0.6, 120 + pulse * 10, `rgba(255,225,150,${0.3 + 0.2 * pulse})`);
    lay(S.cr, 186, S.top - 104, 0.6);
    lay(S.br, Math.sin(t) * 1.5, 0, 1);
  });

  def('bolera', () => {
    const S = storm({ sky: R([0x050707, 0x0a0e0e, 0x101616, 0x181e1e, 0x222828, 0x2e3432]), cloud: R([0x040606, 0x080c0c, 0x0e1414, 0x161c1c, 0x202826, 0x2e3634, 0x485048]), seed: 150, cover: 0.62 });
    const far = L(W, H); range(far, R([0x0c100e, 0x141a16, 0x1c241e, 0x262e26]), { base: 110, amp: 40, freq: 0.007, seed: 151 });
    for (let x = 0; x < W; x += 6) pine(far, x + (x % 4), 120 + ((x * 7) % 9), 0.9, R([0x050806, 0x0a0e0a, 0x101610]));
    const wtr = L(W, H); for (let y = 120; y < 182; y++) for (let x = 0; x < W; x++) put(wtr, x, y, q(R([0x040808, 0x081010, 0x0e1818, 0x162222, 0x203030]), 0.45 + (vn(x / 30, y / 2, 152) - 0.5) * 0.3 - (y - 120) / 160, x, y));
    // la cueva del nacimiento al fondo, en la orilla
    ell(wtr, 200, 122, 34, 18, (x, y, dx, dy) => dy > 0 ? -1 : 0x010202);
    // la presa
    const dam = L(W, H), CO = R([0x2a2a28, 0x3e3e3a, 0x54544e, 0x6c6c64, 0x86867c]);
    poly(dam, [[0, 178], [W, 178], [W, 196], [0, 196]], (x, y, u, v) => q(CO, 0.8 - v * 0.6 + ((x % 34) < 2 ? -0.3 : 0), x, y));
    poly(dam, [[0, 174], [W, 174], [W, 178], [0, 178]], CO[4]);
    for (let x = 6; x < W; x += 34) poly(dam, [[x, 166], [x + 4, 166], [x + 4, 174], [x, 174]], CO[2]);
    for (let y = 196; y < H; y++) for (let x = 0; x < W; x++) put(dam, x, y, q(R([0x050505, 0x0a0a0a, 0x121212]), 0.6 - (y - 196) / 40, x, y));
    const g = guardFrames({ rimCol: 0x8ab0a8, lit: -1 });
    return { S, far, wtr, dam, g };
  }, (t, S) => {
    pan(t, 10, 14, 30, 6, 12);
    drawStorm(S.S, t, 0.8);
    lay(S.far, 0, 0, 0.3); lay(S.wtr, 0, 0, 0.5);
    const blink = Math.sin(t * 0.9) > -0.85;
    glow(200 - cam.x * 0.5, 116 - cam.y * 0.5, 50, 'rgba(160,20,10,0.4)');
    if (blink) { cg.fillStyle = '#ff3a1a'; cg.fillRect(Math.round(188 - cam.x * 0.5), Math.round(112 - cam.y * 0.5), 5, 3); cg.fillRect(Math.round(207 - cam.x * 0.5), Math.round(112 - cam.y * 0.5), 5, 3); }
    for (let i = 0; i < 4; i++) { const r = ((t * 14 + i * 16) % 64) + 6; cg.strokeStyle = `rgba(110,140,140,${0.45 * (1 - r / 70)})`; cg.lineWidth = 1; cg.beginPath(); cg.ellipse(Math.round(200 - cam.x * 0.5), Math.round(140 - cam.y * 0.5), r, r * 0.2, 0, 0, Math.PI * 2); cg.stroke(); }
    lay(S.dam, 0, 0, 0.8);
    lay(pick(S.g, t), 290, 62, 1);
    rain(t, 160, 0.3, 0.3);
  });

  def('alba', () => {
    const S = storm({ sky: P.dawnSky, cloud: R([0x4a4458, 0x6a5a6c, 0x947480, 0xc29486, 0xe8b894, 0xfcd8a8]), seed: 160, gx: 210, gy: 150, gr: 200, gk: 0.7, cover: 0.42 });
    const V = valley({ far: R([0x6a6a84, 0x7e7a90, 0x948a9a, 0xaa9aa2]), mid: R([0x4a5050, 0x5a6058, 0x6a7262, 0x7e866e]), hills: R([0x4a5232, 0x5a643a, 0x6a7644, 0x7c884e, 0x909c5a]), olive: R([0x3a4430, 0x4e5a40, 0x647056, 0x7c886a, 0x96a080]), poplar: R([0x2e4818, 0x426622, 0x5a842e, 0x76a23a, 0x9ac258]), grass: R([0x4a6028, 0x5a7230, 0x6c863a, 0x80984a]), river: R([0x2a6a6a, 0x3a8484, 0x4c9e98, 0x6cbab0, 0xa4dccc, 0xe8f4e0]) });
    const c = L(W, H); cortijo(c, 250, 176, false);
    return { S, V, c };
  }, (t, S) => {
    pan(t, 30, 20, 10, 6, 14);
    drawStorm(S.S, t, 0.3);
    const sun = Math.min(1, t / 6);
    glow(210 - cam.x * 0.2, 120 - sun * 30, 140, 'rgba(255,230,170,0.55)');
    cg.fillStyle = '#fff2d0'; cg.beginPath(); cg.arc(Math.round(210 - cam.x * 0.2), Math.round(122 - sun * 30), 12, 0, Math.PI * 2); cg.fill();
    rays(210 - cam.x * 0.2, 122 - sun * 30, 10, 300, 3, -Math.PI / 2, 'rgba(255,240,200,A)', 0.12, t);
    lay(S.V.far, 0, 0, 0.25); lay(S.V.mid, 0, 0, 0.4); lay(S.V.hills, 0, 0, 0.6); lay(S.c, 0, 0, 0.8); lay(S.V.front, 0, 0, 1);
    for (let i = 0; i < 6; i++) { const x = (40 + i * 14 + t * 5) % (W + 20) - 10 - cam.x, h = 12 + (i % 3) * 2; cg.fillStyle = '#2a2420'; cg.fillRect(Math.round(x), Math.round(206 - h - cam.y), 4, h); cg.fillRect(Math.round(x), Math.round(201 - h - cam.y), 4, 4); }
    for (let i = 0; i < 6; i++) { const x = (60 + i * 30 + t * 12) % W, y = 40 + Math.sin(t + i) * 5 + i * 4; cg.fillStyle = '#2a2420'; cg.fillRect(Math.round(x), Math.round(y), 1, 1); cg.fillRect(Math.round(x - 2), Math.round(y - 1), 2, 1); cg.fillRect(Math.round(x + 1), Math.round(y - 1), 2, 1); }
  });
})();
