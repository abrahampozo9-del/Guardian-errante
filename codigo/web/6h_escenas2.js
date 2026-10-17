// ====================================================================== escenas de los capítulos y del título
(function () {
  const { R, q, L, put, poly, ell, cyl, sky, clouds, range, olive, poplar, deadTree, pine, cypress, town, tower, crowd, outline, fbm, vn } = CP;
  const { def, lay, pan, glow, rays, rain, embers, ash, flash, bolt, flame, fade, cam } = CS;
  const W = CW + 48, H = CH + 24;
  const scaled = (b, x, y, s, k = 1) => { cg.imageSmoothingEnabled = false; cg.drawImage(CS.img(b), Math.round(x - cam.x * k), Math.round(y - cam.y * k), b.w * s, b.h * s); };
  const pick = (arr, t, fps = 4) => arr[Math.floor(t * fps) % arr.length];
  const night = R([0x020308, 0x060a16, 0x0c1426, 0x142038, 0x1e2c4a, 0x2c3c5c]), nightCl = R([0x030409, 0x080c16, 0x101826, 0x1a2436, 0x2a364a, 0x3e4c62, 0x6a7a90]);
  function storm(o) {
    const sk = L(W, H); sky(sk, o.sky, { gx: o.gx, gy: o.gy, gr: o.gr || 160, gk: o.gk || 0.5, seed: o.seed });
    const c1 = L(W + 200, Math.round(H * 0.7)); clouds(c1, o.cloud, { seed: o.seed + 1, scale: o.scale || 70, cover: o.cover || 0.55, y0: 0, y1: c1.h, ly: -1, lightAt: o.gx !== undefined ? [o.gx + 100, o.gy, o.gr || 160] : null, relief: 8 });
    return { sk, c1 };
  }
  const drawStorm = (S, t, sp = 1) => { lay(S.sk, 0, 0, 0.2); lay(S.c1, -((t * 5 * sp) % 200) - 30, 0, 0.4); };
  const WALL = R([0x3a3a40, 0x5a5a60, 0x86847e, 0xb0aca2, 0xd2cec2]), ROOF = R([0x1e0a06, 0x36140c, 0x521e12, 0x6e2c1a]), PAV = R([0x0a0a0c, 0x141418, 0x1e1e22, 0x2a2a2e, 0x38383a]);

  // ---------------------------------------------------------------- la caseta de turismo abierta, junto a la fuente del Músico
  def('caseta', () => {
    const S = storm({ sky: night, cloud: nightCl, seed: 200, cover: 0.5 });
    const st = L(W, H);
    town(st, -10, 120, 150, { wall: R([0x14161e, 0x20242e, 0x2c3240]), roof: R([0x0a0a10, 0x121218]), seed: 201, lit: 0.15 });
    town(st, 300, W + 10, 150, { wall: R([0x14161e, 0x20242e, 0x2c3240]), roof: R([0x0a0a10, 0x121218]), seed: 202, lit: 0.2 });
    for (let y = 150; y < H; y++) for (let x = 0; x < W; x++) { const c = vn(x / 6, y / 3, 203); put(st, x, y, q(PAV, 0.6 - (y - 150) / 120 + (c > 0.5 ? 0.12 : -0.08) + (((x * 0.3 + y) | 0) % 9 === 0 ? -0.25 : 0), x, y)); }
    // la caseta: casita encalada con tejado a dos aguas, ventanilla y la puerta (abierta: dentro, escaleras)
    poly(st, [[160, 84], [260, 84], [260, 160], [160, 160]], (x, y, u, v) => q(WALL, 0.85 - u * 0.35 - v * 0.15, x, y));
    poly(st, [[152, 84], [268, 84], [210, 58]], (x, y, u, v) => q(ROOF, 0.7 - v * 0.2 + ((y & 1) ? 0.08 : -0.06) - Math.abs(u - 0.5) * 0.3, x, y));
    poly(st, [[172, 106], [196, 106], [196, 126], [172, 126]], 0x0c0a0a); poly(st, [[168, 126], [200, 126], [200, 130], [168, 130]], WALL[4]);
    poly(st, [[214, 100], [244, 100], [244, 160], [214, 160]], 0x060102);
    for (let i = 0; i < 6; i++) poly(st, [[217 + i * 0.5, 112 + i * 8], [241 - i * 0.5, 112 + i * 8], [241 - i * 0.5, 115 + i * 8], [217 + i * 0.5, 115 + i * 8]], R([0x1a0404, 0x2e0806, 0x46100a, 0x5e1a0e, 0x7a2412, 0x9a3418])[5 - i]);
    poly(st, [[244, 100], [252, 102], [252, 158], [244, 160]], R([0x2a1a0e, 0x3e2814])[1]); // la hoja de la puerta
    // la fuente del Músico: pilón redondo, columna y la figura con el instrumento
    const FS = R([0x16181a, 0x262a2c, 0x3a3e3e, 0x50544e, 0x6a6c64]), BR = R([0x0e1a14, 0x1a2e22, 0x2a4432, 0x3e5e44]);
    ell(st, 90, 176, 46, 12, (x, y, dx, dy) => q(FS, 0.6 - dx * 0.25 - dy * 0.2, x, y)); ell(st, 90, 174, 38, 8, (x, y, dx, dy) => q(R([0x06101a, 0x0c1a28, 0x142a3a, 0x2a4a5a]), 0.5 + (vn(x / 4, y, 9) > 0.7 ? 0.4 : 0), x, y));
    poly(st, [[84, 120], [96, 120], [96, 172], [84, 172]], cyl(FS, -1));
    ell(st, 90, 104, 6, 7, (x, y, dx) => q(BR, 0.6 - dx * 0.3, x, y)); poly(st, [[83, 108], [97, 108], [99, 122], [81, 122]], cyl(BR, -1)); poly(st, [[96, 104], [112, 98], [113, 101], [97, 107]], BR[2]);
    // farola de forja encendida
    poly(st, [[330, 70], [333, 70], [333, 176], [330, 176]], 0x0a0a0c); poly(st, [[324, 58], [340, 58], [340, 72], [324, 72]], 0x0a0a0c); poly(st, [[326, 60], [338, 60], [338, 70], [326, 70]], 0xf0c050);
    return { S, st };
  }, (t, S) => {
    pan(t, 10, 18, 30, 8, 12);
    drawStorm(S.S, t, 0.4);
    lay(S.st, 0, 0, 0.8);
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
    glow(229 - cam.x * 0.8, 140 - cam.y * 0.8, 90 + pulse * 20, `rgba(230,40,20,${0.35 + 0.2 * pulse})`);
    glow(229 - cam.x * 0.8, 170 - cam.y * 0.8, 60, `rgba(255,80,30,${0.25 + 0.15 * pulse})`);
    glow(332 - cam.x * 0.8, 66 - cam.y * 0.8, 70, 'rgba(255,200,90,0.45)');
    // gotas de la fuente
    for (let i = 0; i < 6; i++) { const ph = (t * 1.5 + i / 6) % 1; cg.fillStyle = 'rgba(160,200,220,0.7)'; cg.fillRect(Math.round(112 - cam.x * 0.8 + ph * 6), Math.round(100 - cam.y * 0.8 + ph * ph * 70), 1, 2); }
    embers(t, 12, 214 - cam.x * 0.8, 244 - cam.x * 0.8, 160 - cam.y * 0.8, [255, 80, 40], 20);
  });

  // ---------------------------------------------------------------- Miguel cae ardiendo sobre los olivares
  def('caida', () => {
    const S = storm({ sky: R([0x050408, 0x0e0a14, 0x1a1020, 0x2a1626, 0x441e26, 0x6a2a22, 0x9a3e1e]), cloud: R([0x040306, 0x0a0810, 0x140e18, 0x22141e, 0x381c22, 0x5a2822, 0x8a4022]), seed: 210, cover: 0.55, gx: 330, gy: 0, gr: 120, gk: 0.4 });
    const far = L(W, H); range(far, R([0x0a0810, 0x120e16, 0x1a141e, 0x241a26]), { base: 136, amp: 26, freq: 0.008, seed: 211 });
    const grove = L(W, H); range(grove, R([0x050405, 0x0a080a, 0x100c0e, 0x161214]), { base: 168, amp: 10, freq: 0.015, seed: 212, soft: true });
    for (let r = 0; r < 4; r++) for (let x = (r % 2) * 14; x < W; x += 28) olive(grove, x, 178 + r * 14, 1.2 + r * 0.35, R([0x030203, 0x080608, 0x0e0a0e, 0x161014]));
    // la cruz encendida a la izquierda, en su cerro
    poly(grove, [[44, 120], [52, 120], [52, 172], [44, 172]], cyl(R([0x8a7e70, 0xb8ac9a, 0xe2d8c4]), -1)); poly(grove, [[32, 132], [64, 132], [64, 140], [32, 140]], cyl(R([0x8a7e70, 0xb8ac9a, 0xe2d8c4]), -1));
    const mg = FIG.miguel({ fallen: true, blood: true });
    return { S, far, grove, mg };
  }, (t, S) => {
    pan(t, 10, 6, 26, 16, 8);
    drawStorm(S.S, t, 1);
    lay(S.far, 0, 0, 0.3);
    glow(48 - cam.x * 0.7, 134 - cam.y * 0.7, 90, 'rgba(255,225,150,0.45)');
    const k = Math.min(1, t / 3.2), x = 360 - k * 160 - cam.x * 0.6, y = -10 + k * 168 - cam.y * 0.6;
    if (k < 1) {
      for (let i = 0; i < 40; i++) { const tt = i / 40; cg.fillStyle = `rgba(255,${200 - i * 3},${80 - i},${1 - tt})`; const s = Math.max(1, 5 - tt * 4); cg.fillRect(Math.round(x + tt * 120), Math.round(y - tt * 130), s, s); }
      glow(x, y, 50, 'rgba(255,240,200,0.8)'); glow(x, y, 120, 'rgba(255,150,60,0.35)');
    } else {
      const fl = Math.sin(t * 9) * 0.1;
      glow(x, y - 20, 140, `rgba(255,170,70,${0.45 + fl})`);
      lay(S.mg, 200 - 120, 158 - 156 + 10, 0.6);
      glow(x, y - 30, 70, 'rgba(255,245,215,0.4)');
      for (let i = 0; i < 6; i++) flame(x - 60 + i * 24, y + 6, 10 + (i % 3) * 5, t, i);
      embers(t, 40, x - 80, x + 80, y + 10);
    }
    lay(S.grove, 0, 0, 1);
    if (k >= 1 && t < 3.5) fade(1 - (t - 3.2) / 0.3, '255,240,210');
  });

  // ---------------------------------------------------------------- el hombre de blanco en la presa: el agua como un espejo
  def('tentacion', () => {
    const S = storm({ sky: R([0x0a0a10, 0x14141c, 0x1e1e28, 0x2a2834, 0x3a3440, 0x524248, 0x7a5a52]), cloud: R([0x08080c, 0x101016, 0x1a1a22, 0x26242e, 0x36303a, 0x4e4048, 0x7a5c56]), seed: 220, cover: 0.5, gx: 210, gy: 60, gr: 120, gk: 0.3 });
    const far = L(W, H); range(far, R([0x0e0e14, 0x16161e, 0x201e28, 0x2a2832]), { base: 108, amp: 30, freq: 0.008, seed: 221 });
    const dam = L(W, H), CO = R([0x2a2a2c, 0x403e3e, 0x5a5654, 0x76706a, 0x928a82]);
    poly(dam, [[0, 150], [W, 150], [W, 168], [0, 168]], (x, y, u, v) => q(CO, 0.8 - v * 0.6 + ((x % 40) < 2 ? -0.3 : 0), x, y));
    poly(dam, [[0, 146], [W, 146], [W, 150], [0, 150]], CO[4]);
    for (let y = 168; y < H; y++) for (let x = 0; x < W; x++) put(dam, x, y, q(R([0x050506, 0x0a0a0c, 0x121214, 0x1a1a1e]), 0.7 - (y - 168) / 50 + (vn(x / 10, y / 3, 222) - 0.5) * 0.3, x, y));
    const ac = FIG.antichrist();
    const g = [0, 1, 2, 3].map(f => FIG.guardian(f, { lit: 1, rimCol: 0xe8d8c0, staff: true }));
    return { S, far, dam, ac, g };
  }, (t, S) => {
    pan(t, 30, 10, 14, 14, 12);
    drawStorm(S.S, t, 0.3);
    lay(S.far, 0, 0, 0.3);
    // el agua quieta, reflejando cielo y montes
    const src = cg.getImageData(0, 30, CW, 70);
    const tmp = document.createElement('canvas'); tmp.width = CW; tmp.height = 70; tmp.getContext('2d').putImageData(src, 0, 0);
    for (let i = 0; i < 50; i++) { const off = Math.round(Math.sin(i * 0.8 + t * 1.5) * (0.5 + i * 0.03)); cg.drawImage(tmp, 0, 69 - i, CW, 1, off, 100 + i, CW, 1); }
    cg.fillStyle = 'rgba(10,14,22,0.35)'; cg.fillRect(0, 100, CW, 50);
    glow(226 - cam.x * 0.7, 100 - cam.y * 0.7, 90, 'rgba(255,235,190,0.25)');
    lay(S.dam, 0, 0, 0.7);
    lay(S.ac, 226 - 35, 148 - 138, 0.7);
    lay(pick(S.g, t, 2), 40, 60, 1);
  });

  // ---------------------------------------------------------------- la carretera del pantano: el cañón, los buitres y la luz del hotel
  def('carretera', () => {
    const S = storm({ sky: R([0x0e0c12, 0x18141c, 0x241c26, 0x342630, 0x4a3236, 0x6a4038]), cloud: R([0x0a080c, 0x141016, 0x1e1820, 0x2c2228, 0x3e2e30, 0x5a3e38, 0x8a5a48]), seed: 230, cover: 0.5, gx: 120, gy: 80, gr: 140, gk: 0.4 });
    const far = L(W, H); range(far, R([0x16121a, 0x201a22, 0x2c222c, 0x382c34]), { base: 104, amp: 30, freq: 0.008, seed: 231 });
    const walls = L(W, H), CL = R([0x140e0a, 0x241810, 0x382418, 0x4e3220, 0x66422a, 0x825636]);
    // paredes del cañón: borde irregular, estratos horizontales de arenisca, la cara de la izquierda al sol
    const wall = (edgeX, top, lit) => {
      for (let y = 0; y < H; y++) {
        const ex = edgeX(y) + (fbm(1, y / 9, 234, 3) - 0.5) * 22;
        for (let x = Math.max(0, Math.floor(ex)); x < W; x++) {
          const tY = top(x) + (fbm(x / 14, 2, 235, 3) - 0.5) * 16; if (y < tY) continue;
          const strata = Math.sin((y + fbm(x / 30, y / 30, 236, 2) * 14) * 0.42) * 0.12, dx = x - ex;
          let v = 0.62 - Math.min(1, dx / 70) * 0.45 * lit + strata + (dx < 4 ? 0.22 : 0) - (y - tY) / 400 + (fbm(x / 7, y / 3, 237, 3) - 0.5) * 0.25;
          if (y - tY < 2) v += 0.25;
          put(walls, x, y, q(CL, v, x, y));
        }
      }
    };
    wall(y => 232 + y * 0.06, x => 62 + (x - 232) * -0.2, 1);
    wall(y => 318 - y * 0.02, x => 40 + (x - 318) * -0.08, 0.6);
    for (let y = 186; y < H; y++) for (let x = 200; x < 330; x++) put(walls, x, y, q(R([0x081014, 0x0e1c22, 0x162c32, 0x24444a]), 0.5 + (vn(x / 8, y, 232) > 0.7 ? 0.3 : 0), x, y));
    const road = L(W, H);
    for (let y = 120; y < H; y++) for (let x = 0; x < W; x++) { const cx = 230 - (y - 120) * 1.6, w = 6 + (y - 120) * 0.45; if (Math.abs(x - cx) < w) put(road, x, y, q(R([0x16161a, 0x202024, 0x2a2a30]), 0.6 - Math.abs(x - cx) / w * 0.3, x, y)); if (Math.abs(x - (cx + w)) < 1 && y % 8 < 5) put(road, x, y, 0xb8b0a0); }
    range(road, R([0x050404, 0x0a0808, 0x100e0c]), { base: 210, amp: 16, freq: 0.02, seed: 233, soft: true });
    for (let x = 0; x < 200; x += 18) pine(road, x + 6, 214 + (x % 3) * 3, 1.5, R([0x030403, 0x070907, 0x0c100c]));
    // el hotel a lo lejos, con una luz
    poly(far, [[146, 112], [190, 112], [190, 126], [146, 126]], cyl(R([0x3a3632, 0x5a544c, 0x7a7268]), -1)); poly(far, [[142, 106], [194, 106], [190, 112], [146, 112]], R([0x2a120c])[0]);
    return { S, far, walls, road };
  }, (t, S) => {
    pan(t, 10, 4, 30, 10, 12);
    drawStorm(S.S, t, 0.6);
    lay(S.far, 0, 0, 0.3);
    glow(160 - cam.x * 0.3, 118 - cam.y * 0.3, 24, 'rgba(255,190,90,0.7)'); cg.fillStyle = '#ffc060'; cg.fillRect(Math.round(158 - cam.x * 0.3), Math.round(116 - cam.y * 0.3), 3, 3);
    lay(S.walls, 0, 0, 0.6);
    for (let i = 0; i < 7; i++) { const a = t * 0.35 + i * 0.9, x = 300 + Math.cos(a) * (40 + i * 4) - cam.x * 0.5, y = 50 + Math.sin(a) * 12 - cam.y * 0.5, fl = Math.sin(t * 3 + i) > 0.6 ? 1 : 0; cg.fillStyle = '#0e0a0a'; cg.fillRect(Math.round(x - 6), Math.round(y + fl), 13, 1); cg.fillRect(Math.round(x - 1), Math.round(y - 1), 3, 3); cg.fillRect(Math.round(x - 8), Math.round(y + 1 + fl), 2, 1); cg.fillRect(Math.round(x + 7), Math.round(y + 1 + fl), 2, 1); cg.fillStyle = '#d8d0c0'; cg.fillRect(Math.round(x), Math.round(y - 2), 1, 1); }
    lay(S.road, 0, 0, 1);
    rain(t, 40, 0.15, 0.25);
  });

  // ---------------------------------------------------------------- título: luna de sangre sobre Pozo Alcón (según la referencia del castillo y la luna roja)
  def('titulo', () => {
    const S = storm({ sky: R([0x060203, 0x120406, 0x22070a, 0x3a0c0e, 0x581410, 0x7a1e14, 0xa02e1a]), cloud: R([0x050102, 0x0e0304, 0x1a0607, 0x2c0a0a, 0x44100e, 0x681a12, 0x9a2c18]), seed: 240, cover: 0.5, gx: 290, gy: 70, gr: 170, gk: 0.55 });
    const moon = L(140, 140); ell(moon, 70, 70, 58, 58, (x, y, dx, dy) => q(R([0x5a1008, 0x861a0e, 0xb02a14, 0xd0401e, 0xe86a34]), 0.8 - dx * 0.25 - dy * 0.15 - (vn(x / 8, y / 8, 4) > 0.6 ? 0.22 : 0), x, y));
    const far = L(W, H); range(far, R([0x1a0507, 0x26080a, 0x340c0c, 0x461210]), { base: 140, amp: 34, freq: 0.007, seed: 241 });
    // Pozo Alcón en su cerro: casas escalonadas y la torre de la Encarnación en lo alto
    const tw = L(W, H); range(tw, R([0x0a0203, 0x120405, 0x1a0607, 0x240a0a]), { base: 190, amp: 52, freq: 0.006, seed: 242, soft: true });
    const wins = town(tw, 150, 330, 166, { wall: R([0x140506, 0x1e0808, 0x2a0c0c, 0x381210]), roof: R([0x080203, 0x100405]), seed: 243, lit: 0.25, hill: 30, win: 0x060102 });
    tower(tw, 232, 128, 46, R([0x140506, 0x1e0808, 0x2a0c0c, 0x3a1410, 0x4e1c14]), { w: 16, bellLit: true, roof: R([0x080203, 0x100405, 0x180607]) });
    const fg = L(W, H), RK = R([0x020001, 0x060203, 0x0c0405, 0x140707]);
    poly(fg, [[0, H], [0, 160], [30, 150], [70, 168], [110, 186], [130, H]], (x, y, u, v) => q(RK, 0.6 - v * 0.5 + (vn(x / 6, y / 6, 3) - 0.5) * 0.4, x, y));
    poly(fg, [[W, H], [W, 150], [400, 140], [360, 162], [320, 184], [300, H]], (x, y, u, v) => q(RK, 0.6 - v * 0.5 + (vn(x / 6, y / 6, 4) - 0.5) * 0.4, x, y));
    deadTree(fg, 40, 166, 150, 0x030001, 244, 0.5);
    // el ángel de piedra llorando, con las alas plegadas
    const AS = R([0x140c0e, 0x241a1c, 0x382c2e, 0x4c3e40, 0x605254]);
    poly(fg, [[356, 192], [348, 142], [362, 120], [378, 130], [384, 192]], (x, y, u, v) => q(AS, 0.75 - u * 0.5 - v * 0.15, x, y));
    ell(fg, 366, 116, 6, 7, (x, y, dx) => q(AS, 0.7 - dx * 0.3, x, y)); poly(fg, [[358, 124], [374, 124], [372, 170], [360, 170]], cyl(AS, -1, 0.1));
    const Rr = RNG(245); for (let i = 0; i < 90; i++) { const x = Rr.int(W), y = 196 + Rr.int(28); put(fg, x, y, i % 4 ? 0x6a5a54 : 0xc8b8a8); }
    return { S, moon, far, tw, fg, wins };
  }, (t, S) => {
    pan(t, 20, 14, 30, 6, 16);
    lay(S.S.sk, 0, 0, 0.1);
    glow(300 - cam.x * 0.1, 70 - cam.y * 0.1, 170, 'rgba(255,60,40,0.3)');
    lay(S.moon, 232, 2, 0.1);
    lay(S.S.c1, -((t * 4) % 200) - 30, 30, 0.3);
    lay(S.far, 0, 0, 0.3); lay(S.tw, 0, 0, 0.55);
    for (const [x, y] of S.wins) if (Math.sin(t * 2 + x) > -0.3) { cg.fillStyle = '#c84a1a'; cg.fillRect(Math.round(x - cam.x * 0.55), Math.round(y - cam.y * 0.55), 2, 2); }
    glow(240 - cam.x * 0.55, 110 - cam.y * 0.55, 20, 'rgba(255,110,40,0.6)');
    lay(S.fg, 0, 0, 1);
    ash(t, 50, 0.55);
    embers(t, 10, 0, CW, 225, [255, 90, 40], 40);
  });

  // ---------------------------------------------------------------- las demás pantallas de carga reutilizan escenas
  CS.alias = (name, src) => { SCENES[name] = SCENES[src]; };
})();
