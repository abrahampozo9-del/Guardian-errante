// ====================================================================== casas andaluzas con detalle
// Tejas árabes por filas (canal y cobija), cal con zócalo, rejas de forja con macetas,
// puertas de madera claveteadas. Sustituye los dibujos sencillos de 2_art.js.
Art.initBuildings = function () {
  const { img, p, r, ov, line, shade, mix, voronoi } = Px;
  const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) & 0xffffff) / 0x1000000; };
  const VAR = 4;
  const set = (id, fn) => { Art.tiles[id] = []; for (let v = 0; v < VAR; v++) { const b = img(16, 16); fn(b, v, RNG(id * 97 + v * 13)); Art.tiles[id][v] = [b]; } };

  function lime(b, R) {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const n = hash(x, y, 5) * 0.6 + hash(x >> 2, y >> 2, 6) * 0.4;
      p(b, x, y, n < 0.15 ? 0xe8e2d6 : n < 0.85 ? 0xf3efe6 : 0xfbf8f2);
    }
    if (R.next() < 0.4) { let x = R.int(16), y = R.int(8); for (let k = 0; k < 5; k++) { p(b, x, y, 0xd8d0c2); x += R.int(3) - 1; y++; } }
  }
  function zocalo(b, y0, R) {
    // zócalo de piedra ocre con remate
    for (let y = y0; y < 16; y++) for (let x = 0; x < 16; x++) p(b, x, y, hash(x, y, 9) < 0.5 ? 0xc49a62 : 0xb88e58);
    r(b, 0, y0, 16, 1, 0xe2c896); r(b, 0, y0 + 1, 16, 1, 0x9a744a);
    for (let x = R.int(4); x < 16; x += 5) p(b, x, y0 + 2 + R.int(2), 0x8a6a42);
    r(b, 0, 15, 16, 1, 0x7a5a38);
  }
  // ---------------------------------------------------------------- tejado de teja árabe
  function roof(base, solar) {
    return (b, v, R) => {
      for (let row = 0; row < 4; row++) {
        const y0 = row * 4, off = (row % 2) * 2;
        for (let x = -2; x < 18; x += 4) {
          const tc = shade(base, 0.9 + hash(x + 7, row + v * 5, 3) * 0.22);
          const moss = hash(x, row * 3 + v, 11) < 0.08;
          // cobija (convexa): centro claro, bordes oscuros
          for (let y = y0; y < y0 + 4; y++) {
            p(b, x + off, y, shade(tc, 0.72)); p(b, x + off + 1, y, shade(tc, 1.08)); p(b, x + off + 2, y, shade(tc, 1.2)); p(b, x + off + 3, y, shade(tc, 0.95));
          }
          p(b, x + off + 2, y0, shade(tc, 1.35)); // brillo en la punta
          r(b, x + off, y0 + 3, 4, 1, shade(tc, 0.62)); // sombra bajo la teja de arriba
          if (moss) { p(b, x + off + 1, y0 + 2, 0x8a8a48); p(b, x + off + 2, y0 + 1, 0x9aa050); }
        }
      }
      if (solar) {
        r(b, 1, 1, 14, 13, 0xb8c0c8); r(b, 2, 2, 12, 11, 0x1e2e58);
        for (let y = 2; y < 13; y++) for (let x = 2; x < 14; x++) if ((x - 2) % 4 === 3 || (y - 2) % 4 === 3) p(b, x, y, 0x4a62a0); else if ((x + y) % 7 === 0) p(b, x, y, 0x2a3e70);
        line(b, 3, 12, 12, 3, 0x6880c0); p(b, 4, 3, 0xc8d8ff); p(b, 5, 3, 0x9ab4e8);
        r(b, 1, 14, 14, 1, 0x6a6e74);
      }
    };
  }
  set(T.ROOF, roof(0xc4623e));
  set(T.ROOF_DARK, roof(0x8e4b34));
  set(T.CHURCH_ROOF, roof(0xb4583a));
  set(T.ROOF_SOLAR, roof(0xc4623e, true));
  // ---------------------------------------------------------------- pared encalada
  set(T.WALL_WHITE, (b, v, R) => { lime(b, R); zocalo(b, 12, R); });
  // ---------------------------------------------------------------- ventana con reja, contraventanas y maceta
  set(T.WINDOW, (b, v, R) => {
    lime(b, R); zocalo(b, 13, R);
    r(b, 3, 1, 10, 11, 0xd8cdb8); // jamba de piedra
    r(b, 4, 2, 8, 9, 0x1c2830); // hueco
    for (let y = 2; y < 11; y++) for (let x = 4; x < 12; x++) if (x - y > -2 && x - y < 1) p(b, x, y, 0x3a5468); // reflejo
    p(b, 5, 3, 0x6a90a8);
    // reja de forja
    for (let x = 5; x < 12; x += 2) r(b, x, 2, 1, 9, 0x141414);
    r(b, 4, 4, 8, 1, 0x141414); r(b, 4, 8, 8, 1, 0x141414); p(b, 6, 3, 0x141414); p(b, 10, 3, 0x141414);
    // contraventanas
    const sh = v % 2 ? 0x3a6a4a : 0x7a4a2a;
    r(b, 1, 2, 2, 9, sh); r(b, 13, 2, 2, 9, sh); p(b, 1, 2, shade(sh, 1.3)); p(b, 13, 2, shade(sh, 1.3));
    for (let y = 3; y < 11; y += 2) { p(b, 1, y, shade(sh, 0.7)); p(b, 14, y, shade(sh, 0.7)); }
    // alféizar y maceta
    r(b, 2, 11, 12, 1, 0xe8dcc4); r(b, 2, 12, 12, 1, 0x9a8a70);
    if (v !== 1) {
      r(b, 5, 9, 6, 2, 0xb05a30); r(b, 5, 9, 6, 1, 0xd07a48);
      for (const [x, y, c] of [[5, 7, 0xd02a2a], [7, 6, 0xf04040], [9, 7, 0xd02a2a], [10, 6, 0xf06060], [6, 8, 0x3a7a2a], [8, 8, 0x4a8a32], [10, 8, 0x3a7a2a]]) p(b, x, y, c);
    }
  });
  // ---------------------------------------------------------------- puerta de madera claveteada
  set(T.DOOR, (b, v, R) => {
    lime(b, R);
    r(b, 2, 0, 12, 16, 0xd8cdb8); r(b, 2, 0, 12, 1, 0xeee6d4);
    r(b, 3, 1, 10, 15, 0x5a3418);
    for (let x = 3; x < 13; x += 2) { r(b, x, 1, 1, 15, 0x4a2a12); r(b, x + 1, 1, 1, 15, 0x6e4220); }
    p(b, 3, 1, 0x8a5a30);
    for (const y of [3, 8, 13]) for (let x = 4; x < 13; x += 3) { p(b, x, y, 0xb8a070); p(b, x + 1, y + 1, 0x2a1a0a); }
    r(b, 11, 8, 1, 2, 0xd8c070); p(b, 10, 9, 0xd8c070);
    r(b, 1, 15, 14, 1, 0xa89a80);
  });
  // ---------------------------------------------------------------- piedra de sillería / mampostería
  set(T.WALL_STONE, (b, v, R) => {
    voronoi(b, 0, 0, 16, 16, 8, [0xc9a46c, 0xb8925a, 0xd6b47c, 0xbf9a62], 0x7e6444, R);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const c = b.d[y * 16 + x] & 0xffffff; if (c === 0x7e6444) continue;
      const below = y < 15 ? b.d[(y + 1) * 16 + x] & 0xffffff : 0, above = y > 0 ? b.d[(y - 1) * 16 + x] & 0xffffff : 0;
      if (below === 0x7e6444) p(b, x, y, shade(c, 0.8)); else if (above === 0x7e6444) p(b, x, y, shade(c, 1.15));
    }
  });
  // ---------------------------------------------------------------- muro de piedra seca (bancales)
  set(T.DRYWALL, (b, v, R) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) p(b, x, y, hash(x, y, 3 + v) < 0.5 ? 0x8a9048 : 0x7a8a40);
    const stones = [];
    for (let row = 0; row < 3; row++) for (let x = -(row % 2) * 3; x < 16; x += 5 + R.int(2)) stones.push([x, 3 + row * 4, 4 + R.int(2), 3 + (R.next() < 0.3 ? 1 : 0)]);
    for (const [x, y, w, h] of stones) {
      const c = [0xb9ab8c, 0xa69878, 0xc8bc9e, 0x9e9070][R.int(4)];
      r(b, x, y, w, h, c); r(b, x, y, w, 1, shade(c, 1.15)); r(b, x, y + h - 1, w, 1, shade(c, 0.78)); p(b, x + w - 1, y, shade(c, 0.85));
      r(b, x, y + h, w, 1, 0x4a4a2a);
    }
    for (let i = 0; i < 4; i++) { const x = R.int(16), y = R.int(3); p(b, x, y, 0x5a7030); p(b, x, y + 1, 0x4a6028); }
  });
  // ---------------------------------------------------------------- porche enlosado
  set(T.PORCH, (b, v, R) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const tx = x >> 3, ty = y >> 3, c = [0xc8a888, 0xbe9c7c, 0xd2b294, 0xc4a282][(tx + ty * 2 + v) & 3];
      p(b, x, y, (x & 7) === 0 || (y & 7) === 0 ? 0x8a6a50 : (x & 7) === 1 || (y & 7) === 1 ? shade(c, 1.08) : c);
    }
  });
  // ---------------------------------------------------------------- tablero del puente viejo
  set(T.BRIDGE, (b, v, R) => {
    for (let y = 0; y < 16; y++) {
      const row = y >> 2, off = (row % 2) * 3;
      for (let x = 0; x < 16; x++) {
        const bx = Math.floor((x + off) / 6), c = [0xb8a47e, 0xa8946e, 0xc4b08a][(bx + row + v) % 3];
        let col = c;
        if ((y & 3) === 3 || ((x + off) % 6) === 5) col = 0x7a6a4e; else if ((y & 3) === 0) col = shade(c, 1.1);
        p(b, x, y, col);
      }
    }
    for (let i = 0; i < 3; i++) p(b, R.int(16), R.int(16), 0x6a7a3a);
  });
  for (const id of [T.ROOF, T.ROOF_DARK, T.CHURCH_ROOF, T.ROOF_SOLAR, T.WALL_WHITE, T.WINDOW, T.DOOR, T.WALL_STONE, T.DRYWALL, T.PORCH, T.BRIDGE]) {
    const d = Art.tiles[id][0][0].d; let rr = 0, gg = 0, bb = 0;
    for (let i = 0; i < 256; i++) { rr += (d[i] >> 16) & 255; gg += (d[i] >> 8) & 255; bb += d[i] & 255; }
    Art.tileColor[id] = ((rr / 256) << 16) | ((gg / 256) << 8) | (bb / 256);
  }
};
