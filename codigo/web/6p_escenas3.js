// ====================================================================== escenas de los capítulos IV y V y de los tres finales
(function () {
  const { R, q, L, put, poly, ell, cyl, sky, clouds, range, pine, town, crowd, outline, fbm, vn } = CP;
  const { def, lay, pan, glow, rays, embers, ash, flash, flame, fade, cam } = CS;
  const W = CW + 48, H = CH + 24;
  const ROCK = R([0x050506, 0x0c0b0c, 0x161413, 0x22201c, 0x302c26, 0x423c32, 0x5a5244]);
  const GREY = R([0x0e0e10, 0x1a1a1c, 0x28282a, 0x38383a, 0x4a4a4a, 0x5e5e5c, 0x76746e]);
  const WOOD = R([0x120a05, 0x22140a, 0x341e10, 0x4a2c16, 0x643c1e, 0x7e4e28]);
  // esfera de reloj pintada (parado a las 3:33 si no se dice otra cosa)
  function clock(b, x, y, r, rim, h = 3, m = 33) {
    ell(b, x, y, r + 1.5, r + 1.5, rim); ell(b, x, y, r, r, (px, py, dx, dy) => q(R([0x8a8070, 0xb8ae98, 0xd8d0b8, 0xece6d2]), 0.75 - dx * 0.2 - dy * 0.3, px, py));
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; put(b, x + Math.cos(a) * (r - 1.5), y + Math.sin(a) * (r - 1.5), 0x2a2018); }
    const hand = (a, len) => { for (let k = 0; k < len; k += 0.5) put(b, x + Math.cos(a) * k, y + Math.sin(a) * k, 0x140e0a); };
    hand(-Math.PI / 2 + (h + m / 60) / 12 * Math.PI * 2, r * 0.5); hand(-Math.PI / 2 + m / 60 * Math.PI * 2, r * 0.8);
  }
  const figure = (b, x, y, h, col, o = {}) => { // silueta simple de persona (para gente pequeña o a contraluz)
    poly(b, [[x - h * 0.12, y], [x - h * 0.15, y - h * 0.42], [x - h * 0.17, y - h * 0.62], [x - h * 0.06, y - h * 0.68], [x + h * 0.06, y - h * 0.68], [x + h * 0.17, y - h * 0.62], [x + h * 0.15, y - h * 0.42], [x + h * 0.12, y]], col);
    poly(b, [[x - h * 0.035, y - h * 0.68], [x + h * 0.035, y - h * 0.68], [x + h * 0.035, y - h * 0.73], [x - h * 0.035, y - h * 0.73]], col);
    ell(b, x, y - h * 0.81, h * 0.08, h * 0.095, col);
    if (o.hair) poly(b, [[x - h * 0.09, y - h * 0.84], [x + h * 0.09, y - h * 0.84], [x + h * 0.12, y - h * 0.6], [x - h * 0.12, y - h * 0.6]], col);
  };

  // ---------------------------------------------------------------- la cueva PB4: horizontal, estrecha, a oscuras
  def('cueva', () => {
    const b = L(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const top = 78 + Math.sin(x * 0.03) * 14 + (fbm(x / 30, 0.3, 801, 3) - 0.5) * 30, bot = 168 + Math.sin(x * 0.025 + 1) * 10 + (fbm(x / 26, 2.3, 802, 3) - 0.5) * 26;
      const inTun = y > top && y < bot, d = inTun ? Math.min(y - top, bot - y) / ((bot - top) / 2) : 0;
      const v = inTun ? 0.32 + (1 - d) * 0.3 + (vn(x / 7, y / 5, 803) - 0.5) * 0.3 : 0.22 + (fbm(x / 14, y / 10, 804, 3) - 0.5) * 0.45 + (Math.abs(y - top) < 3 || Math.abs(y - bot) < 3 ? 0.35 : 0);
      put(b, x, y, q(ROCK, v, x, y));
    }
    const Rr = RNG(805);
    for (let i = 0; i < 26; i++) { const x = Rr.int(W), top = 78 + Math.sin(x * 0.03) * 14 + (fbm(x / 30, 0.3, 801, 3) - 0.5) * 30, len = 6 + Rr.int(16); poly(b, [[x - 3, top - 2], [x + 3, top - 2], [x, top + len]], (px, py, u, v) => q(ROCK, 0.55 - v * 0.35 - u * 0.15, px, py)); }
    for (let i = 0; i < 18; i++) { const x = Rr.int(W), bot = 168 + Math.sin(x * 0.025 + 1) * 10 + (fbm(x / 26, 2.3, 802, 3) - 0.5) * 26, len = 4 + Rr.int(12); poly(b, [[x - 4, bot + 2], [x + 4, bot + 2], [x, bot - len]], (px, py, u, v) => q(ROCK, 0.4 + v * 0.2 - u * 0.15, px, py)); }
    const g = [0, 1, 2, 3].map(f => FIG.guardian(f, { lit: 0.6, rimCol: 0xffe0a0 }));
    return { b, g };
  }, (t, S) => {
    pan(t, 0, 10, 40, 10, 12);
    lay(S.b, 0, 0, 1);
    const lx = 150 - cam.x + Math.sin(t * 0.7) * 4, ly = 128 - cam.y;
    cg.save(); cg.globalCompositeOperation = 'multiply'; const m = cg.createRadialGradient(lx, ly, 20, lx, ly, 220); m.addColorStop(0, 'rgba(255,255,255,1)'); m.addColorStop(0.45, 'rgba(190,175,150,1)'); m.addColorStop(0.8, 'rgba(70,60,52,1)'); m.addColorStop(1, 'rgba(20,18,16,1)'); cg.fillStyle = m; cg.fillRect(0, 0, CW, CH); cg.restore();
    glow(lx, ly, 70 + Math.sin(t * 5) * 4, 'rgba(255,220,150,0.55)');
    cg.save(); cg.imageSmoothingEnabled = false; const fr = CS.img(S.g[Math.floor(t * 2) % 4]); cg.drawImage(fr, Math.round(lx - fr.width * 0.25), Math.round(ly - fr.height * 0.42), Math.round(fr.width * 0.5), Math.round(fr.height * 0.5)); cg.restore();
    for (let i = 0; i < 4; i++) { const ph = (t * 0.6 + i * 0.25) % 1; cg.fillStyle = `rgba(180,200,220,${0.5 - ph * 0.5})`; cg.fillRect(Math.round(60 + i * 80 - cam.x), Math.round(70 + ph * 90 - cam.y), 1, 2); }
  });

  // ---------------------------------------------------------------- la Sierra de Castril y el Cortijo del Relojero
  def('sierra', () => {
    const sk = L(W, H); sky(sk, R([0x0e1626, 0x1a2a40, 0x2c4260, 0x4a6684, 0x7a92a8, 0xb8c4cc]), { gx: 320, gy: 40, gr: 160, gk: 0.4, seed: 811 });
    const c1 = L(W + 200, 110); clouds(c1, R([0x1a2436, 0x2a3a52, 0x44587a, 0x6a809e, 0x9aacbe]), { seed: 812, scale: 70, cover: 0.42, y0: 0, y1: 110, ly: -1, relief: 6 });
    const far = L(W, H); range(far, R([0x2a3a52, 0x3e526e, 0x5a7090, 0x8aa0b8, 0xd8e2ea]), { base: 120, amp: 70, freq: 0.006, seed: 813, snow: 10 });
    const mid = L(W, H); range(mid, R([0x0e1a1e, 0x16262a, 0x22363a, 0x34484a, 0x4a5e5c]), { base: 160, amp: 50, freq: 0.01, seed: 814 });
    const PIN = R([0x040806, 0x08120c, 0x0e1c12, 0x16281a, 0x203624]);
    for (let y = 186; y < H; y++) for (let x = 0; x < W; x++) put(mid, x, y, q(PIN, 0.35 + (vn(x / 5, y / 4, 815) - 0.5) * 0.5, x, y));
    for (let r = 0; r < 5; r++) for (let x = (r * 13) % 22; x < W; x += 16 + r * 4) pine(mid, x, 168 + r * 16 + ((x * 7) % 9), 1.4 + r * 0.55, PIN);
    // el cortijo de piedra sobre la boca de la cueva
    const STO = R([0x1e1c1a, 0x302c28, 0x46403a, 0x5e5850, 0x7a7266]);
    poly(mid, [[250, 128], [320, 128], [320, 160], [250, 160]], (x, y, u, v) => q(STO, 0.6 - u * 0.3 + ((x % 7 === 0 || y % 5 === 0) ? -0.2 : 0), x, y));
    poly(mid, [[244, 128], [326, 128], [304, 108], [266, 108]], (x, y, u, v) => q(R([0x0e0806, 0x1e100a, 0x2e1a10, 0x40241a]), 0.6 - v * 0.3 + ((y & 1) ? 0.1 : -0.05), x, y));
    poly(mid, [[300, 96], [306, 96], [306, 114], [300, 114]], STO[2]);
    poly(mid, [[262, 138], [272, 138], [272, 148], [262, 148]], 0xffc060); poly(mid, [[296, 138], [306, 138], [306, 148], [296, 148]], 0xffa040);
    poly(mid, [[270, 182], [300, 182], [296, 168], [274, 168]], 0x020203); // la boca de la cueva
    return { sk, c1, far, mid };
  }, (t, S) => {
    pan(t, 0, 16, 30, 8, 12);
    lay(S.sk, 0, 0, 0.15); lay(S.c1, -((t * 4) % 200) - 20, 0, 0.3); lay(S.far, 0, 0, 0.4); lay(S.mid, 0, 0, 0.8);
    glow(267 - cam.x * 0.8, 143 - cam.y * 0.8, 40, 'rgba(255,190,90,0.5)'); glow(301 - cam.x * 0.8, 143 - cam.y * 0.8, 36, 'rgba(255,170,70,0.45)');
    for (let i = 0; i < 14; i++) { const ph = (t * 0.12 + i / 14) % 1; cg.fillStyle = `rgba(150,150,160,${0.35 * (1 - ph)})`; cg.fillRect(Math.round(303 - cam.x * 0.8 + Math.sin(t + i) * 6 + ph * 20), Math.round(94 - cam.y * 0.8 - ph * 60), 3, 2); }
  });

  // ---------------------------------------------------------------- la buhardilla: todos los relojes parados a la misma hora
  def('relojes', () => {
    const b = L(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) put(b, x, y, q(WOOD, 0.35 - y / H * 0.2 + (vn(x / 3, y / 18, 821) - 0.5) * 0.2 + ((x % 34) < 2 ? -0.2 : 0), x, y));
    // vigas del tejado a dos aguas
    poly(b, [[0, 0], [W, 0], [W, 40], [W / 2, 6], [0, 40]], (x, y, u, v) => q(WOOD, 0.15 + v * 0.2, x, y));
    for (let k = 0; k < 7; k++) { const x = 20 + k * 64; poly(b, [[x, 0], [x + 8, 0], [x + 8, H], [x, H]], (px, py, u) => q(WOOD, 0.5 - u * 0.3, px, py)); }
    poly(b, [[0, 178], [W, 178], [W, H], [0, H]], (x, y, u, v) => q(WOOD, 0.45 - v * 0.3 + ((x % 22) < 1 ? -0.2 : 0), x, y));
    const Rr = RNG(822);
    for (let i = 0; i < 34; i++) { const x = 10 + Rr.int(W - 20), y = 40 + Rr.int(110), r = 5 + Rr.int(9); if (Math.abs(x - 215) < 46 && y > 60) continue; clock(b, x, y, r, [0x4a2c14, 0x7a5a30, 0x8a8a90][i % 3]); }
    // el reloj grande, en el centro
    poly(b, [[192, 60], [238, 60], [238, 190], [192, 190]], (x, y, u, v) => q(WOOD, 0.75 - u * 0.4, x, y));
    poly(b, [[200, 110], [230, 110], [230, 178], [200, 178]], 0x0c0604);
    clock(b, 215, 84, 18, 0x8a5a2a);
    for (let y = 112; y < 168; y++) put(b, 215, y, 0xc8a050);
    ell(b, 215, 170, 6, 6, (px, py, dx, dy) => q(R([0x7a5a20, 0xb8902c, 0xe8c050, 0xfff0a0]), 0.8 - dx * 0.4 - dy * 0.3, px, py));
    figure(b, 290, 186, 54, 0x0a0606, { hair: true });
    return { b, g: FIG.guardian(1, { lit: 0.7, rimCol: 0xc8d8f0 }) };
  }, (t, S) => {
    pan(t, 10, 12, 30, 10, 12);
    lay(S.b, 0, 0, 1);
    rays(320 - cam.x, -10 - cam.y, 5, 260, 0.35, Math.PI * 0.66, 'rgba(170,190,230,A)', 0.18, t);
    glow(215 - cam.x, 84 - cam.y, 40 + Math.sin(t * 1.2) * 4, 'rgba(255,220,150,0.25)');
    for (let i = 0; i < 20; i++) { const ph = (t * 0.05 + i / 20) % 1; cg.fillStyle = 'rgba(200,210,230,0.35)'; cg.fillRect(Math.round(260 + Math.sin(i * 3 + t * 0.3) * 50 - cam.x), Math.round(20 + ph * 180 - cam.y), 1, 1); }
    cg.save(); cg.imageSmoothingEnabled = false; const fr = CS.img(S.g); cg.drawImage(fr, Math.round(110 - cam.x), Math.round(60 - cam.y), Math.round(fr.width * 0.8), Math.round(fr.height * 0.8)); cg.restore();
  });

  // ---------------------------------------------------------------- el salón de El Greco, aquella noche
  def('greco', () => {
    const b = L(W, H), WALL = R([0x2a1410, 0x3e1e16, 0x56281c, 0x6e3624, 0x8a4a30, 0xa86240]);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) put(b, x, y, q(WALL, 0.55 - y / H * 0.3 + (vn(x / 20, y / 8, 831) - 0.5) * 0.15 + ((y % 46) < 1 ? -0.2 : 0), x, y));
    poly(b, [[0, 150], [W, 150], [W, H], [0, H]], (x, y, u, v) => q(R([0x0c0806, 0x1a120c, 0x2a1c12, 0x3a2818]), 0.6 - v * 0.4 + (((x + y * 2) % 24) < 2 ? -0.2 : 0), x, y));
    // guirnaldas de la celebración
    for (let k = 0; k < 6; k++) for (let x = 0; x < W; x++) { const y = 20 + k * 3 + Math.sin(x / 40 + k) * 8 + Math.abs(Math.sin(x / 40)) * 10; if (x % 2) put(b, x, y | 0, [0xe8c050, 0xc83a2a, 0xe8e0d0][k % 3]); }
    // mesas con mantel
    for (const x of [40, 130, 250, 340]) { poly(b, [[x - 34, 140], [x + 34, 140], [x + 30, 160], [x - 30, 160]], (px, py, u, v) => q(R([0x9a9284, 0xc8c0b0, 0xe8e2d4]), 0.8 - v * 0.5, px, py)); }
    // la salida que nadie conocía, a la derecha, blanca
    poly(b, [[372, 50], [412, 50], [412, 150], [372, 150]], (x, y, u, v) => q(R([0xd8d4c8, 0xeeeae0, 0xfffcf0]), 0.9 - Math.abs(u - 0.5) * 0.6, x, y));
    // la gente: muy baja, toda parecida
    crowd(b, 30, 360, 146, 46, 0x0e0806, 832, 22, 6);
    // el Guardián y Cándida, de la mano, en primer plano
    figure(b, 150, 200, 92, 0x050304); figure(b, 186, 200, 84, 0x050304, { hair: true });
    poly(b, [[160, 160], [178, 160], [178, 165], [160, 165]], 0x050304);
    return { b };
  }, (t, S) => {
    pan(t, 0, 8, 40, 8, 12);
    lay(S.b, 0, 0, 1);
    rays(392 - cam.x, 100 - cam.y, 7, 300, 0.9, Math.PI, 'rgba(255,250,230,A)', 0.22, t);
    glow(392 - cam.x, 100 - cam.y, 110 + Math.sin(t * 2) * 8, 'rgba(255,250,235,0.5)');
    for (const x of [40, 130, 250, 340]) glow(x - cam.x, 138 - cam.y, 30, 'rgba(255,190,110,0.25)');
  });

  // ---------------------------------------------------------------- las escaleras en tramos de tres, describiendo triángulos
  def('escaleras', () => {
    const b = L(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) put(b, x, y, q(GREY, 0.3 + (vn(x / 6, y / 6, 841) - 0.5) * 0.25, x, y));
    // tramos: triángulos que se encogen hacia el fondo
    for (let k = 0; k < 9; k++) {
      const s = Math.pow(0.78, k), cx = W / 2 + Math.sin(k * 2.1) * 20 * s, cy = 130 - (1 - s) * 70, w0 = 340 * s, h0 = 150 * s;
      const A = [cx - w0 / 2, cy + h0 / 2], B = [cx + w0 / 2, cy + h0 / 2], C = [cx, cy - h0 / 2];
      poly(b, [A, B, C], (x, y, u, v) => q(GREY, 0.75 - k * 0.07 - v * 0.15 + ((Math.floor((y - (cy - h0 / 2)) / Math.max(1, 6 * s))) % 2 ? 0.08 : -0.08), x, y));
      poly(b, [[A[0] + 10 * s, A[1] - 6 * s], [B[0] - 10 * s, B[1] - 6 * s], [C[0], C[1] + 14 * s]], (x, y, u, v) => q(GREY, 0.45 - k * 0.06 - v * 0.2 + ((Math.floor(y / Math.max(1, 5 * s))) % 3 === 0 ? -0.18 : 0), x, y));
    }
    figure(b, 214, 206, 46, 0x050506);
    return { b };
  }, (t, S) => {
    pan(t, 10, 0, 34, 20, 12);
    lay(S.b, 0, 0, 1);
    cg.save(); cg.globalCompositeOperation = 'multiply'; const m = cg.createRadialGradient(CW / 2, 70, 10, CW / 2, 120, 260); m.addColorStop(0, 'rgba(40,30,30,1)'); m.addColorStop(0.4, 'rgba(170,165,160,1)'); m.addColorStop(1, 'rgba(60,60,64,1)'); cg.fillStyle = m; cg.fillRect(0, 0, CW, CH); cg.restore();
    glow(CW / 2 - cam.x * 0.2, 60, 60 + Math.sin(t * 1.5) * 8, 'rgba(200,40,20,0.25)');
  });

  // ---------------------------------------------------------------- el atril: un hueco por el que entra algo de luz
  def('atril', () => {
    const b = L(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const wall = Math.abs(x - W / 2) > 70 + y * 0.35; put(b, x, y, q(GREY, (wall ? 0.35 : 0.2) + (vn(x / 5, y / 7, 851) - 0.5) * 0.3 - (wall ? Math.abs(x - W / 2) / 900 : 0), x, y)); }
    const ST = R([0x1a1a1c, 0x2e2e30, 0x48484a, 0x66665e, 0x86847a]);
    poly(b, [[W / 2 - 22, 210], [W / 2 + 22, 210], [W / 2 + 14, 150], [W / 2 - 14, 150]], cyl(ST, -1));
    poly(b, [[W / 2 - 34, 150], [W / 2 + 34, 150], [W / 2 + 26, 138], [W / 2 - 26, 138]], (x, y, u, v) => q(ST, 0.85 - v * 0.3, x, y));
    figure(b, W / 2 - 120, 220, 70, 0x050506); figure(b, W / 2 + 116, 220, 64, 0x050506); figure(b, W / 2 + 150, 222, 80, 0x020203);
    return { b };
  }, (t, S) => {
    pan(t, 20, 10, 28, 18, 12);
    lay(S.b, 0, 0, 1);
    rays(W / 2 - cam.x, -20 - cam.y, 5, 200, 0.18, Math.PI / 2, 'rgba(255,245,215,A)', 0.4, t);
    glow(W / 2 - cam.x, 132 - cam.y, 34 + Math.sin(t * 3) * 6, 'rgba(255,240,200,0.75)');
    // lo que hay sobre el atril: no se distingue
    const ox = W / 2 - cam.x, oy = 130 - cam.y; for (let i = 0; i < 14; i++) { const a = t * 1.3 + i; cg.fillStyle = `rgba(255,255,240,${0.4 + 0.3 * Math.sin(a * 2)})`; cg.fillRect(Math.round(ox + Math.cos(a) * 6), Math.round(oy + Math.sin(a * 1.3) * 3), 1, 1); }
  });

  // ---------------------------------------------------------------- la subida: la salida que siempre estuvo ahí
  def('subida', () => {
    const b = L(W, H), LIGHT = R([0x5a5650, 0x8a867c, 0xb8b4a8, 0xdcd8cc, 0xf4f0e4, 0xfffdf6]);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) put(b, x, y, q(LIGHT, 0.4 + (1 - y / H) * 0.55 - Math.abs(x - W / 2) / 500 + (vn(x / 30, y / 20, 861) - 0.5) * 0.08, x, y));
    for (let k = 0; k < 14; k++) { const y = 220 - k * 14, w0 = 160 - k * 9; poly(b, [[W / 2 - w0 / 2, y], [W / 2 + w0 / 2, y], [W / 2 + w0 / 2 - 4, y - 6], [W / 2 - w0 / 2 + 4, y - 6]], (x, yy, u, v) => q(LIGHT, 0.65 + k * 0.025 - v * 0.2, x, yy)); }
    figure(b, W / 2 - 14, 190, 48, 0x3a3630); figure(b, W / 2 + 10, 190, 44, 0x3a3630, { hair: true });
    poly(b, [[W / 2 - 8, 168], [W / 2 + 4, 168], [W / 2 + 4, 171], [W / 2 - 8, 171]], 0x3a3630);
    return { b };
  }, (t, S) => {
    pan(t, 24, 30, 24, 0, 14);
    lay(S.b, 0, 0, 1);
    rays(W / 2 - cam.x, -30, 9, 320, 1.2, Math.PI / 2, 'rgba(255,255,250,A)', 0.25, t);
    glow(W / 2 - cam.x, 20 - cam.y, 160, 'rgba(255,255,245,0.6)');
    for (let i = 0; i < 30; i++) { const ph = (t * 0.1 + i / 30) % 1; cg.fillStyle = `rgba(255,250,220,${0.6 * (1 - ph)})`; cg.fillRect(Math.round(W / 2 - cam.x + Math.sin(i * 7) * 90), Math.round(220 - ph * 230 - cam.y), 1, 1); }
    if (t > 9) fade((t - 9) / 3, '255,255,250');
  });
})();

// ---------------------------------------------------------------- textos de las cinemáticas
CINE.cueva = { title: 'La cueva PB4', pages: [
  ['cueva', 'La cueva PB4 se abre bajo la Sierra de Castril. Horizontal, estrecha. A gatas y a oscuras.'],
  ['cueva', 'Aquí la Luz no es solo para pelear. Es para ver.'],
] };
CINE.sierra = { title: 'La Sierra', pages: [
  ['sierra', 'Al otro lado de la cueva, la sierra. Pinos, piedra y un frío limpio que no huele a ceniza.'],
  ['sierra', 'Encaramado sobre la boca de la cueva, un cortijo de piedra con la chimenea encendida. Siete años sin ver una chimenea encendida.'],
] };
CINE.recuerdo = { title: 'Aquella noche', pages: [
  ['relojes', 'Cándida me coge de la mano. Y todos los relojes de la buhardilla marcan la misma hora: las tres y treinta y tres.'],
  ['greco', 'El Greco. Una boda, o un bautizo. Gente muy bajita, toda parecida. Uno me pregunta si quiero ver el cielo.'],
  ['greco', 'Me señala una salida que no conocía, pero que parecía haber estado siempre ahí. Y yo digo que no.'],
  ['caseta', 'De madrugada, la puerta de la caseta está abierta de par en par. Si ante el cielo sentí rechazo, ante el infierno siento atracción.'],
  ['escaleras', 'Escaleras que bajan en tramos de tres, describiendo triángulos. Bajo cada tramo en tres saltos. Ya no sé bajar de otra manera.'],
  ['atril', 'Al final, un atril antiguo de piedra bajo un hilo de luz. Algo encima que no consigo ver, y que me atrae hasta lo físico.'],
  ['atril', 'Mi visión se desprende de mi cuerpo. Lo último que veo es cómo se cierra la puerta que se había abierto para mí.'],
] };
CINE.asedio = { title: 'El asedio', pages: [
  ['batalla', 'Los demonios bajan sobre Pozo Alcón. Y, por fin, bajan también los ángeles.'],
  ['iglesia', 'La batalla del cielo, en la plaza de la Encarnación.'],
] };
CINE.bajada = { title: 'La Bajada', pages: [
  ['caseta', 'La puerta de la caseta, abierta de par en par. Esta vez no me empuja nada. Bajo porque quiero.'],
  ['escaleras', 'Un tramo. Tres escalones. Otro tramo. Tres más. Mi reloj empieza a ir al revés.'],
] };
CINE.final_cielo = { title: 'Final del Cielo', pages: [
  ['atril', 'El Reloj del Cielo echa a andar sobre el atril. Arriba, la puerta de la caseta se cierra.'],
  ['subida', 'La salida que una vez rechacé. Cándida no me suelta la mano. Esta vez, no.'],
  ['alba', 'Ni frío ni caliente, decían. Al final, caliente.'],
  ['alba', 'EL GUARDIÁN ERRANTE\n\nFinal del Cielo'],
] };
CINE.final_tierra = { title: 'Final de la Tierra', pages: [
  ['atril', 'El Reloj del Cielo echa a andar sobre el atril. Arriba, la puerta de la caseta se cierra.'],
  ['alba', 'Las semanas siguientes, el agua de La Bolera vuelve a bajar limpia por el Guadalentín. De Hinojares, de Huesa, de Fontanar, baja gente.'],
  ['valle', 'En el cortijo del río, las placas siguen dando luz. Cándida sube a ver al abuelo los domingos. Yo la acompaño.'],
  ['guardian', '«La calma también es una forma de lucha. Pozo Alcón... siempre será mi lugar.»'],
  ['alba', 'EL GUARDIÁN ERRANTE\n\nFinal de la Tierra'],
] };
CINE.final_infierno = { title: 'Final del Infierno', pages: [
  ['atril', 'Toco el objeto del atril. Y por fin lo veo: es mi cara.'],
  ['escaleras', 'La subida no es dura. No subo. Las escaleras me suben solas, en tramos de tres.'],
  ['caseta', 'La caseta de turismo vuelve a tener a alguien dentro. Abre la ventanilla cuando le da la gana.'],
  ['anticristo', 'EL GUARDIÁN ERRANTE\n\nFinal del Infierno'],
] };
