// ====================================================================== enemigos (sprites grandes, con fotogramas de aviso y ataque)
// Cada enemigo tiene: andar (2), aviso (windup) y ataque. Lados: 0 izq, 1 der (los que se ven de lado)
// o 4 direcciones (los que se ven desde arriba).
Art.initEnemies = function () {
  const { img, p, r, ov, ova, line, outline, shade, flipH, rot90, speck } = Px;
  const R = RNG(4242);
  const E = Art.E = {};

  // ---------------------------------------------------------------- Jabalí podrido (32×24, de lado)
  function boar(f, mode) {
    const b = img(34, 24);
    ova(b, 17, 21, 14, 2.6, 0x50000000);
    const lift = mode === 'wind' ? -1 : 0, lean = mode === 'atk' ? 2 : 0;
    // patas
    const a = f % 2;
    const legs = mode === 'atk' ? [[7, -2], [11, 2], [20, -2], [24, 2]] : mode === 'wind' ? [[6, 0], [10, 0], [21, 1], [25, 1]] : [[7 + a, 0], [11 - a, 0], [20 + a, 0], [24 - a, 0]];
    for (const [x, d] of legs) { r(b, x + lean, 15, 3, 5, 0x2a1e18); r(b, x + lean + d * 0.5, 19, 3, 2, 0x1a120e); }
    // cuerpo
    ov(b, 15 + lean, 12 + lift, 12, 6.5, 0x4a382c);
    ov(b, 15 + lean, 10 + lift, 11, 4.5, 0x5a4434);
    ov(b, 13 + lean, 9 + lift, 7, 2.5, 0x6a5040);
    // crin erizada
    for (let x = 6; x < 22; x += 2) line(b, x + lean, 7 + lift, x + lean + 1, 3 + lift - (x % 4 === 0 ? 1 : 0), 0x241a14);
    // carne podrida y costillas
    ov(b, 11 + lean, 14 + lift, 3, 2, 0x8a3a30); for (let i = 0; i < 3; i++) line(b, 9 + i * 2 + lean, 13 + lift, 10 + i * 2 + lean, 16 + lift, 0xd8ccb0);
    ov(b, 18 + lean, 9 + lift, 2, 1.4, 0x6a8a3a); ov(b, 22 + lean, 13 + lift, 1.6, 1.2, 0x7a9a44);
    // cabeza
    const hx = 26 + lean + (mode === 'wind' ? -1 : 0), hy = 12 + lift + (mode === 'wind' ? 1 : 0);
    ov(b, hx, hy, 5, 4, 0x4a382c); ov(b, hx + 1, hy - 1, 4, 3, 0x5a4434);
    r(b, hx + 4, hy, 3, 3, 0x7a5a4a); p(b, hx + 6, hy + 1, 0x2a1a14);
    p(b, hx + 1, hy - 2, mode === 'wind' ? 0xffe060 : 0xff3020); p(b, hx + 2, hy - 2, 0xff7050);
    line(b, hx + 4, hy + 3, hx + 7, hy, 0xf0e8d0); line(b, hx + 3, hy + 3, hx + 6, hy + 1, 0xd8d0b8);
    p(b, hx - 2, hy - 4, 0x3a2c24); p(b, hx - 1, hy - 5, 0x3a2c24);
    // cola
    line(b, 3 + lean, 9 + lift, 1 + lean, 6 + lift, 0x3a2c24);
    outline(b, 0x120c08);
    return b;
  }
  E.boar = [[], []];
  for (const [k, f, m] of [['w0', 0, 'walk'], ['w1', 1, 'walk'], ['wind', 0, 'wind'], ['atk', 0, 'atk']]) { const s = boar(f, m); E.boar[1][k] = s; E.boar[0][k] = flipH(s); }

  // ---------------------------------------------------------------- Hueco (24×34, humano vaciado de brazos largos)
  function hollow(dir, f, mode) {
    const b = img(26, 36);
    ova(b, 13, 33, 7, 2, 0x50000000);
    const skin = 0x8a9a7a, dskin = 0x6a7a5e, rag = 0x4a4656, rag2 = 0x3a3644;
    const a = f % 2 ? 1 : -1;
    // piernas
    r(b, 9, 24, 3, 9 + (mode === 'walk' ? a : 0), rag2); r(b, 14, 24, 3, 9 - (mode === 'walk' ? a : 0), rag2);
    r(b, 9, 32 + (mode === 'walk' ? a : 0), 3, 1, 0x1a1a1a); r(b, 14, 32 - (mode === 'walk' ? a : 0), 3, 1, 0x1a1a1a);
    // torso jorobado
    r(b, 8, 12, 10, 13, rag); r(b, 8, 12, 10, 2, rag2);
    for (let y = 15; y < 25; y += 3) p(b, 9 + (y % 2), y, 0x2a2834);
    r(b, 11, 15, 4, 6, dskin); line(b, 11, 17, 14, 17, 0x5a6a4e); line(b, 11, 19, 14, 19, 0x5a6a4e);
    // brazos (largos)
    if (mode === 'wind') { r(b, 4, 3, 3, 12, dskin); r(b, 19, 3, 3, 12, dskin); for (const x of [3, 5, 7, 18, 20, 22]) line(b, x, 3, x, 0, 0xd8d8c0); }
    else if (mode === 'atk') { r(b, 3, 14, 3, 14, dskin); r(b, 20, 14, 3, 14, dskin); for (const x of [2, 4, 6, 19, 21, 23]) line(b, x, 28, x, 33, 0xd8d8c0); }
    else { r(b, 5, 13, 3, 13 + a, dskin); r(b, 18, 13, 3, 13 - a, dskin); for (const x of [5, 7, 18, 20]) line(b, x, 26 + (x < 10 ? a : -a), x, 28 + (x < 10 ? a : -a), 0xd8d8c0); }
    // cabeza
    ov(b, 13, 8, 5, 5.5, skin); ov(b, 13, 6, 4, 3, 0x9aaa8a);
    if (dir !== 1) {
      const glow = mode === 'wind' ? 0xff3020 : 0xe8d040;
      ov(b, 10.5, 8, 1.6, 1.8, 0x14100c); ov(b, 15.5, 8, 1.6, 1.8, 0x14100c); p(b, 10, 8, glow); p(b, 15, 8, glow);
      r(b, 11, 11, 4, 2, 0x2a1a14); for (let x = 11; x < 15; x += 1) p(b, x, 11, 0xd8d0b8);
    } else { r(b, 9, 4, 8, 4, 0x3a3a30); }
    r(b, 9, 3, 2, 2, 0x3a3a30); r(b, 15, 2, 3, 2, 0x3a3a30);
    outline(b, 0x0e0c10);
    return b;
  }
  E.hollow = [];
  for (let d = 0; d < 4; d++) {
    const set = {};
    for (const [k, f, m] of [['w0', 0, 'walk'], ['w1', 1, 'walk'], ['wind', 0, 'wind'], ['atk', 0, 'atk']]) {
      let s = hollow(d === 2 ? 3 : d, f, m);
      if (d === 2 || d === 3) { // de lado: inclina un poco hacia el frente
        const t = img(s.w, s.h); for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) { const sx = x - Math.round((s.h - y) * 0.08) + 1; if (sx >= 0 && sx < s.w) t.d[y * s.w + x] = s.d[y * s.w + sx]; } s = t;
        if (d === 2) s = flipH(s);
      }
      set[k] = s;
    }
    E.hollow.push(set);
  }

  // ---------------------------------------------------------------- Alacrán gigante (28×28, desde arriba)
  function scorp(f, mode) {
    const b = img(28, 28);
    ova(b, 14, 17, 9, 7, 0x40000000);
    const c1 = 0x6a4422, c2 = 0x8a5a2e, c3 = 0xa8743c;
    for (let i = 0; i < 4; i++) {
      const y = 12 + i * 3, o = (f + i) % 2 ? 1 : -1;
      line(b, 10, y, 4, y + o + 1, 0x3a2410); line(b, 4, y + o + 1, 2, y + o + 4, 0x3a2410);
      line(b, 17, y, 23, y - o + 1, 0x3a2410); line(b, 23, y - o + 1, 25, y - o + 4, 0x3a2410);
    }
    ov(b, 13.5, 15, 4.5, 6, c1); ov(b, 13.5, 14, 3.5, 4.5, c2); for (let y = 11; y < 20; y += 2) line(b, 10, y, 17, y, c1);
    p(b, 12, 9, 0xff4020); p(b, 15, 9, 0xff4020);
    // pinzas
    const pz = mode === 'atk' ? -3 : mode === 'wind' ? -1 : 0;
    line(b, 10, 10, 6, 5 + pz, c1); line(b, 17, 10, 21, 5 + pz, c1);
    ov(b, 6, 4 + pz, 3, 2.2, c2); ov(b, 21, 4 + pz, 3, 2.2, c2); p(b, 5, 2 + pz, 0x2a1a0a); p(b, 22, 2 + pz, 0x2a1a0a);
    // cola: de reposo cuelga detrás; en aviso se curva por encima
    if (mode === 'wind' || mode === 'atk') {
      const pts = [[13.5, 21], [14, 23], [15, 24], [16, 22], [16.5, 19], [16, 15]];
      for (const [x, y] of pts) ov(b, x, y, 1.8, 1.8, c2);
      ov(b, 15.5, 12, 2, 2, mode === 'atk' ? 0xff8030 : 0xffd040); p(b, 15, 10, 0xfff0a0);
    } else {
      for (let i = 0; i < 5; i++) ov(b, 13.5, 21 + i * 1.3, 1.7 - i * 0.1, 1.5, i % 2 ? c2 : c3);
      ov(b, 13.5, 27, 1.5, 1, 0x4a2e16);
    }
    outline(b, 0x1e1208);
    return b;
  }
  E.scorp = [[], [], [], []];
  for (const [k, f, m] of [['w0', 0, 'walk'], ['w1', 1, 'walk'], ['wind', 0, 'wind'], ['atk', 0, 'atk']]) {
    const up = scorp(f, m), right = rot90(up), down = rot90(right), left = rot90(down);
    E.scorp[1][k] = up; E.scorp[3][k] = right; E.scorp[0][k] = down; E.scorp[2][k] = left;
  }

  // ---------------------------------------------------------------- Sombra del valle (26×34, flota)
  function shadeSpr(f, mode) {
    const b = img(26, 34);
    const c = 0x2e2240, c2 = 0x45345e;
    ov(b, 13, 11, 8, 9, c); ov(b, 13, 18, 8.5, 8, c);
    for (let y = 24; y < 33; y++) { const off = Math.round(Math.sin((y + f * 2) * 0.8) * 2); r(b, 7 + off + ((y - 24) >> 1), y, Math.max(1, 12 - (y - 24) * 1.3), 1, c); }
    ov(b, 13, 9, 6, 5, c2);
    if (mode === 'atk') { line(b, 5, 16, 0, 22, c); line(b, 21, 16, 26, 22, c); for (const x of [0, 2, 24, 26]) line(b, x, 22, x, 25, 0xc8c0e0); }
    const eye = mode === 'wind' || mode === 'atk' ? 0xff3a3a : 0xf0f0ff;
    r(b, 9, 10, 2, 3, eye); r(b, 15, 10, 2, 3, eye);
    if (mode === 'wind') { ov(b, 10, 11, 2.5, 2.5, 0x80ff3a3a | 0); ov(b, 16, 11, 2.5, 2.5, 0x80ff3a3a | 0); r(b, 9, 10, 2, 3, eye); r(b, 15, 10, 2, 3, eye); }
    outline(b, 0x120c1a);
    return b;
  }
  E.shade = {};
  for (const [k, f, m] of [['w0', 0, 'walk'], ['w1', 1, 'walk'], ['w2', 2, 'walk'], ['wind', 0, 'wind'], ['atk', 1, 'atk']]) E.shade[k] = shadeSpr(f, m);

  // ---------------------------------------------------------------- Ahogado del Guadalentín (24×32, sale del agua)
  function drowned(f, mode, sub) {
    const b = img(26, 34);
    const skin = 0x9ab8b8, dsk = 0x6a8a90, weed = 0x3a6a3a;
    if (!sub) { r(b, 9, 24, 3, 8, 0x3a4a52); r(b, 14, 24, 3, 8, 0x3a4a52); }
    ov(b, 13, 19, 7, 8, dsk); ov(b, 13, 18, 6, 7, skin);
    for (let i = 0; i < 6; i++) line(b, 7 + i * 2, 13 + (i % 3), 6 + i * 2 + (f % 2), 24 + (i % 2) * 2, weed);
    const a = mode === 'wind' ? -4 : mode === 'atk' ? 2 : (f % 2);
    r(b, 4, 15 + a, 3, 9, dsk); r(b, 19, 15 + a, 3, 9, dsk);
    ov(b, 13, 8, 5.5, 6, skin); ov(b, 12, 6, 4, 3, 0xb8d0d0);
    ov(b, 10.5, 8, 1.4, 1.6, 0x0e1a1e); ov(b, 15.5, 8, 1.4, 1.6, 0x0e1a1e);
    if (mode === 'wind') { ov(b, 13, 12, 2.5, 2.2, 0x1a2a20); ov(b, 13, 12, 1.4, 1.2, 0x5a6a2a); }
    else r(b, 11, 12, 4, 1, 0x2a3a3a);
    for (let i = 0; i < 4; i++) line(b, 9 + i * 2, 2, 8 + i * 3, 9, weed);
    outline(b, 0x0c1416);
    if (sub) { // medio cuerpo bajo el agua
      for (let y = 22; y < 34; y++) for (let x = 0; x < 26; x++) b.d[y * 26 + x] = 0;
      for (let x = 3; x < 23; x++) if ((x + f) % 3 === 0) p(b, x, 22, 0xa8e4dc);
    }
    return b;
  }
  E.drown = {};
  for (const [k, f, m, s] of [['w0', 0, 'walk', false], ['w1', 1, 'walk', false], ['wind', 0, 'wind', false], ['atk', 0, 'atk', false], ['s0', 0, 'walk', true], ['s1', 1, 'walk', true], ['swind', 0, 'wind', true]]) E.drown[k] = drowned(f, m, s);
  const mud = img(10, 10); ov(mud, 5, 5, 4, 4, 0x4a5a2a); ov(mud, 4, 4, 2.5, 2.5, 0x6a7a3a); p(mud, 3, 3, 0xa8b870); E.mud = mud;

  // ---------------------------------------------------------------- Nido de engendros (32×26)
  E.nest = [];
  for (let f = 0; f < 3; f++) {
    const b = img(34, 28);
    ova(b, 17, 23, 15, 4, 0x50000000);
    const pulse = [0, 1, 2][f];
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; line(b, 17, 18, 17 + Math.cos(a) * 15, 20 + Math.sin(a) * 6, 0x3a1e2a); }
    ov(b, 17, 16, 11 + pulse * 0.5, 8 + pulse * 0.5, 0x5a2a3e); ov(b, 17, 14, 9 + pulse * 0.5, 6, 0x7a3a50);
    for (let i = 0; i < 6; i++) ov(b, 10 + i * 3, 13 + (i % 2) * 3, 1.6, 1.6, 0xb85a70);
    ov(b, 17, 12, 3, 2, 0xe8a0b0); p(b, 16, 11, 0xffe0e8);
    for (let i = 0; i < 5; i++) line(b, 8 + i * 4, 9, 9 + i * 4, 5 - (i % 2) * 2, 0x2a141e);
    outline(b, 0x14080e);
    E.nest.push(b);
  }

  // icono de aviso "!"
  const ex = img(7, 11); r(ex, 2, 0, 3, 7, 0xffd040); r(ex, 2, 8, 3, 3, 0xffd040); outline(ex, 0x3a1a00); E.alert = ex;
};
