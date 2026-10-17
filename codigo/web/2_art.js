// ====================================================================== casillas
const T = {
  VOID: 0, GRASS: 1, DIRT: 2, TRACK: 3, FIELD: 4, SAND: 5, ASPHALT: 6, PAVING: 7, CONCRETE: 8, TERRACE: 9, WATER: 10, DEEP: 11,
  CLIFF: 12, MOUNTAIN: 13, WALL_WHITE: 14, WALL_STONE: 15, WINDOW: 16, DOOR: 17, ROOF: 18, ROOF_SOLAR: 19, SHED: 20, DRYWALL: 21,
  BRAMBLE: 22, DAM: 23, BRIDGE: 24, FLOOR: 25, IWALL: 26, IWALL_STONE: 27, BATHWALL: 28, WALLTOP: 29, STAIRS: 30, CHURCH_WALL: 31,
  CHURCH_DOOR: 32, BARRICADE: 33, GRASS_GREEN: 34, ROOF_DARK: 35, PORCH: 36, CHURCH_ROOF: 37, BATHFLOOR: 38, IWALL_HI: 39, GARAGE: 40, PRETIL: 41, POOL: 42, OLIVAR: 43, SCRUB: 44, COUNT: 45
};
T.SOLID = new Array(T.COUNT).fill(false);
for (const s of [T.VOID, T.WATER, T.DEEP, T.CLIFF, T.MOUNTAIN, T.WALL_WHITE, T.WALL_STONE, T.WINDOW, T.ROOF, T.ROOF_SOLAR, T.SHED, T.DRYWALL,
  T.BRAMBLE, T.DAM, T.IWALL, T.IWALL_STONE, T.BATHWALL, T.WALLTOP, T.CHURCH_WALL, T.BARRICADE, T.ROOF_DARK, T.CHURCH_ROOF, T.IWALL_HI, T.GARAGE, T.PRETIL, T.POOL]) T.SOLID[s] = true;
T.isWater = t => t === T.WATER || t === T.DEEP || t === T.POOL;

// ====================================================================== dibujos (generados por código)
const Art = { tiles: [], tileColor: [], P: {}, people: {} };
(function () {
  const { img, p, r, ov, ova, line, speck, outline, shade, mix, flipH, rot90, copy, tint, voronoi, over } = Px;
  let R = RNG(1);
  const VAR = 4;

  function ground(b, base, d1, l1, dd, dl) { r(b, 0, 0, 16, 16, base); speck(b, 0, 0, 16, 16, d1, dd, R); speck(b, 0, 0, 16, 16, l1, dl, R); }
  function tuft(b, x, y, c) { p(b, x, y, c); p(b, x - 1, y - 1, c); p(b, x + 1, y - 1, c); p(b, x, y - 1, c); }
  function pebble(b, x, y, c) { p(b, x, y, c); p(b, x + 1, y, c); p(b, x, y + 1, shade(c, 0.8)); p(b, x + 1, y + 1, shade(c, 0.8)); }
  function plinth(b, y0) { voronoi(b, 0, y0, 16, 16 - y0, 5, [0xc9a46c, 0xb8925a, 0xd6b47c], 0xe2d4b6, R); }

  function makeTile(id, v, f) {
    const b = img(16, 16);
    switch (id) {
      case T.VOID: r(b, 0, 0, 16, 16, 0x0b0907); break;
      case T.GRASS:
        ground(b, 0xa39d5c, 0x8f8a4c, 0xb7b06e, 0.22, 0.12);
        for (let i = 0; i < 2 + v; i++) tuft(b, 2 + R.int(12), 3 + R.int(12), 0x6f7a3a);
        if (v === 3) pebble(b, R.int(13), R.int(13), 0xc8bc9a);
        break;
      case T.GRASS_GREEN:
        ground(b, 0x7f8e45, 0x6c7a38, 0x96a352, 0.25, 0.15);
        for (let i = 0; i < 3 + v; i++) tuft(b, 2 + R.int(12), 3 + R.int(12), 0x55662b);
        break;
      case T.DIRT:
        ground(b, 0xcdb98e, 0xbca87c, 0xddcca4, 0.22, 0.12);
        for (let i = 0; i < v + 1; i++) pebble(b, R.int(14), R.int(14), 0xa8967a);
        break;
      case T.TRACK:
        ground(b, 0xd9c8a0, 0xc8b68c, 0xe6d8b6, 0.2, 0.15);
        for (let i = 0; i < 2; i++) pebble(b, R.int(14), R.int(14), 0xb7a684);
        break;
      case T.FIELD:
        ground(b, 0xb27a58, 0x9e684a, 0xc08a66, 0.2, 0.1);
        for (let y = 1; y < 16; y += 4) for (let x = 0; x < 16; x++) if (R.next() < 0.85) p(b, x, y, 0x93604a);
        break;
      case T.SAND:
        ground(b, 0xcdbf9f, 0xbcae8e, 0xddd2b8, 0.2, 0.1);
        for (let i = 0; i < 5; i++) pebble(b, R.int(14), R.int(14), R.bool() ? 0xa9a49a : 0xe8e2d2);
        break;
      case T.ASPHALT: {
        ground(b, 0x56565b, 0x4b4b50, 0x626267, 0.3, 0.2);
        let x = R.int(16), y = R.int(16);
        for (let i = 0; i < 8; i++) { p(b, x, y, 0x38383c); x += R.int(3) - 1; y += 1; }
        if (v === 2) tuft(b, 4 + R.int(8), 5 + R.int(8), 0x7b8a3f);
        break;
      }
      case T.PAVING:
        r(b, 0, 0, 16, 16, 0x8f897c);
        for (let y = 0; y < 16; y += 4) for (let x = ((y / 4) % 2) * 2; x < 18; x += 4) { const c = R.bool() ? 0xbdb6a8 : 0xaaa395; r(b, x, y, 3, 3, c); p(b, x, y, shade(c, 1.08)); }
        break;
      case T.CONCRETE:
        ground(b, 0xd8cfbb, 0xcbc1ad, 0xe4dcca, 0.25, 0.15);
        if (v === 1) { const x = R.int(10) + 3; for (let y = 0; y < 9; y++) p(b, x + (y % 3 === 0 ? 1 : 0), y + 4, 0xb5ab98); }
        break;
      case T.TERRACE: voronoi(b, 0, 0, 16, 16, 7, [0xcdb9a6, 0xbfa996, 0xd8c8b4], 0x9c8878, R); break;
      case T.WATER: {
        r(b, 0, 0, 16, 16, 0x3a9e98);
        speck(b, 0, 0, 16, 16, 0x34928d, 0.25, R);
        const W = RNG(v * 31 + 5);
        for (let i = 0; i < 4; i++) { const x = W.int(16), y = W.int(16), xx = (x + f * 2) % 16; for (let k = 0; k < 3; k++) p(b, (xx + k) % 16, y, 0x7fcfc6); }
        if ((f + v) % 4 === 0) p(b, W.int(16), W.int(16), 0xd8f4ef);
        break;
      }
      case T.DEEP: {
        r(b, 0, 0, 16, 16, 0x2b6e86);
        speck(b, 0, 0, 16, 16, 0x276580, 0.3, R);
        const W = RNG(v * 17 + 3);
        for (let i = 0; i < 3; i++) { const x = W.int(16), y = W.int(16), xx = (x + f) % 16; for (let k = 0; k < 4; k++) p(b, (xx + k) % 16, y, 0x4f93ab); }
        break;
      }
      case T.CLIFF:
        r(b, 0, 0, 16, 16, 0xc2ab82);
        for (let x = 0; x < 16; x++) { const len = 3 + R.int(10), y0 = R.int(16); if (R.next() < 0.55) for (let y = y0; y < y0 + len; y++) p(b, x, y % 16, R.bool() ? 0xa68e66 : 0xb39b72); }
        for (let x = 0; x < 16; x++) if (R.next() < 0.4) p(b, x, R.int(16), 0xdcc9a2);
        if (v === 1) for (let i = 0; i < 3; i++) pebble(b, R.int(14), R.int(14), 0x8a7656);
        break;
      case T.MOUNTAIN:
        voronoi(b, 0, 0, 16, 16, 4, [0x9d978c, 0x8e887d, 0xa8a297], 0x6f6a61, R);
        speck(b, 0, 0, 16, 16, 0xbab4a8, 0.06, R);
        if (v >= 2) tuft(b, 3 + R.int(10), 4 + R.int(10), 0x5d6a35);
        break;
      case T.WALL_WHITE: ground(b, 0xf2eee6, 0xe5dfd3, 0xfbf9f4, 0.15, 0.08); plinth(b, 12); break;
      case T.WALL_STONE: voronoi(b, 0, 0, 16, 16, 7, [0xc9a46c, 0xb8925a, 0xd6b47c, 0xbf9a62], 0xe6dcc4, R); break;
      case T.WINDOW:
        ground(b, 0xf2eee6, 0xe5dfd3, 0xfbf9f4, 0.15, 0.08); plinth(b, 13);
        r(b, 3, 1, 10, 11, 0xc9a46c); r(b, 4, 2, 8, 9, 0xb08a52); r(b, 5, 3, 6, 7, 0x2f3c44);
        for (let x = 5; x < 11; x += 2) r(b, x, 3, 1, 7, 0x1d1d1d);
        r(b, 5, 6, 6, 1, 0x1d1d1d);
        r(b, 1, 2, 2, 9, 0x9a6a36); r(b, 13, 2, 2, 9, 0x9a6a36); p(b, 1, 6, 0x6e4524); p(b, 14, 6, 0x6e4524);
        break;
      case T.DOOR:
        ground(b, 0xf2eee6, 0xe5dfd3, 0xfbf9f4, 0.15, 0.08);
        r(b, 2, 1, 12, 15, 0xc9a46c); r(b, 3, 2, 10, 14, 0x8a5a2e);
        for (let x = 5; x < 13; x += 3) r(b, x, 2, 1, 14, 0x6e4524);
        for (let y = 4; y < 16; y += 4) { p(b, 4, y, 0xd8c890); p(b, 11, y, 0xd8c890); }
        r(b, 10, 9, 2, 1, 0x2a2a2a);
        break;
      case T.ROOF: case T.ROOF_SOLAR: case T.ROOF_DARK: case T.CHURCH_ROOF: {
        const base = id === T.ROOF_DARK ? 0x8e4b34 : id === T.CHURCH_ROOF ? 0xb4583a : 0xc4623e;
        r(b, 0, 0, 16, 16, base);
        for (let y = 0; y < 16; y += 4) {
          r(b, 0, y + 3, 16, 1, shade(base, 0.72));
          for (let x = (y / 4 % 2) * 2; x < 16; x += 4) { p(b, x, y, shade(base, 0.85)); p(b, x, y + 1, shade(base, 0.85)); p(b, x + 1, y, shade(base, 1.18)); }
        }
        speck(b, 0, 0, 16, 16, shade(base, 0.9), 0.08, R);
        if (id === T.ROOF_SOLAR) {
          r(b, 1, 2, 14, 12, 0xc0c8d0); r(b, 2, 3, 12, 10, 0x2c3e66);
          for (let x = 5; x < 14; x += 3) r(b, x, 3, 1, 10, 0x6880aa);
          r(b, 2, 8, 12, 1, 0x6880aa); p(b, 3, 4, 0x9ab4e0);
        }
        break;
      }
      case T.SHED:
        r(b, 0, 0, 16, 16, 0x4c4f55);
        for (let x = 0; x < 16; x += 3) { r(b, x, 0, 1, 16, 0x3b3e43); r(b, x + 1, 0, 1, 16, 0x5c6066); }
        r(b, 0, 15, 16, 1, 0x2e3034);
        break;
      case T.DRYWALL:
        r(b, 0, 0, 16, 16, 0xa39d5c);
        voronoi(b, 0, 2, 16, 12, 6, [0xb9ab8c, 0xa69878, 0xc8bc9e], 0x7c705a, R);
        r(b, 0, 14, 16, 2, 0x7a744a);
        break;
      case T.BRAMBLE:
        r(b, 0, 0, 16, 16, 0x2c2230);
        for (let i = 0; i < 7; i++) { let x = R.int(16), y = R.int(16); for (let k = 0; k < 7; k++) { p(b, x, y, k % 2 === 0 ? 0x5a2a5e : 0x3e1c44); x += R.int(3) - 1; y += R.int(3) - 1; } }
        for (let i = 0; i < 6; i++) p(b, R.int(16), R.int(16), 0x16101a);
        for (let i = 0; i < 2; i++) p(b, R.int(16), R.int(16), 0xd0283c);
        break;
      case T.DAM:
        ground(b, 0x8f8d85, 0x83817a, 0x9c9a92, 0.2, 0.1);
        r(b, 0, 0, 1, 16, 0x6e6c66); r(b, 8, 0, 1, 16, 0x76746e);
        for (let i = 0; i < 2; i++) { const x = R.int(14); for (let y = 0; y < 6; y++) p(b, x, R.int(16), 0x62625a); }
        break;
      case T.BRIDGE:
        r(b, 0, 0, 16, 16, 0xb8a47e);
        for (let y = 0; y < 16; y += 5) r(b, 0, y, 16, 1, 0x948260);
        for (let y = 0; y < 16; y += 5) for (let x = (y % 2) * 3; x < 16; x += 6) r(b, x, y, 1, 5, 0x948260);
        speck(b, 0, 0, 16, 16, 0xcbb994, 0.15, R);
        break;
      case T.POOL: // agua de piscina: azul limpio con la rejilla del gresite
        r(b, 0, 0, 16, 16, 0x3aa8d8);
        for (let i = 0; i < 16; i += 4) { r(b, i, 0, 1, 16, 0x48b6e2); r(b, 0, i, 16, 1, 0x48b6e2); }
        for (let i = 0; i < 3; i++) { const y = 2 + R.int(12), x = R.int(10); r(b, x, y, 5, 1, 0xa8e8f8); }
        break;
      case T.PRETIL: // pretil de piedra del puente viejo: losa de remate y sillares
        r(b, 0, 0, 16, 16, 0xb8a47e);
        voronoi(b, 0, 5, 16, 9, 4, [0xb0a088, 0x9e8e74, 0xc2b296], 0x6e6250, R);
        r(b, 0, 2, 16, 3, 0xd6ccb4); r(b, 0, 2, 16, 1, 0xeee6d2); r(b, 0, 5, 16, 1, 0x8a7c64);
        for (let x = 4; x < 16; x += 8) r(b, x, 2, 1, 3, 0xa89c84);
        r(b, 0, 14, 16, 2, 0x5a5040);
        speck(b, 0, 6, 16, 8, 0x7a8a4a, 0.05, R);
        break;
      case T.PORCH: voronoi(b, 0, 0, 16, 16, 6, [0xc8b6a4, 0xbaa794, 0xd2c2b0], 0x968472, R); break;
      case T.FLOOR:
        r(b, 0, 0, 16, 16, 0xb4784a);
        speck(b, 0, 0, 16, 16, 0xa66c40, 0.3, R);
        for (let i = 0; i < 3; i++) { const x = R.int(16), y = R.int(16); for (let k = 0; k < 5; k++) p(b, (x + k) % 16, (y + (k >> 1)) % 16, 0x986038); }
        r(b, 0, 0, 16, 1, 0xd8b896); r(b, 0, 0, 1, 16, 0xd8b896);
        break;
      case T.BATHFLOOR:
        r(b, 0, 0, 16, 16, 0xb98657); speck(b, 0, 0, 16, 16, 0xa97648, 0.25, R);
        r(b, 0, 0, 16, 1, 0xd8c0a0); r(b, 0, 0, 1, 16, 0xd8c0a0); r(b, 8, 0, 1, 16, 0xd8c0a0); r(b, 0, 8, 16, 1, 0xd8c0a0);
        break;
      case T.IWALL:
        ground(b, 0xf0ebe2, 0xe6e0d6, 0xf8f6f0, 0.12, 0.06);
        r(b, 0, 0, 16, 1, 0xd8d0c4); r(b, 0, 13, 16, 3, 0xa86a40); r(b, 0, 13, 16, 1, 0xc88a5a);
        break;
      case T.IWALL_HI: ground(b, 0xf0ebe2, 0xe6e0d6, 0xf8f6f0, 0.12, 0.06); r(b, 0, 0, 16, 2, 0xd0c8bc); break;
      case T.IWALL_STONE: voronoi(b, 0, 0, 16, 16, 6, [0xc9a46c, 0xb48e56, 0xd6b47c, 0xa88650], 0x8a6e48, R); r(b, 0, 15, 16, 1, 0x6e5636); break;
      case T.BATHWALL:
        r(b, 0, 0, 16, 16, 0xdcc6a6);
        for (let y = 0; y < 16; y += 4) r(b, 0, y, 16, 1, 0xc8b08e);
        for (let x = 0; x < 16; x += 4) r(b, x, 0, 1, 16, 0xc8b08e);
        speck(b, 0, 0, 16, 16, 0xe8d6ba, 0.1, R);
        break;
      case T.WALLTOP: r(b, 0, 0, 16, 16, 0x4a3c34); speck(b, 0, 0, 16, 16, 0x52443a, 0.2, R); break;
      case T.STAIRS:
        for (let y = 0; y < 16; y += 4) { r(b, 0, y, 16, 3, shade(0xb4784a, 1 - y * 0.02)); r(b, 0, y + 3, 16, 1, 0x7a4e2e); r(b, 0, y, 16, 1, 0xd8a878); }
        break;
      case T.CHURCH_WALL:
        r(b, 0, 0, 16, 16, 0xc4ac7e);
        for (let y = 0; y < 16; y += 4) for (let x = (y / 4 % 2) * 4; x < 20; x += 8) { const c = R.bool() ? 0xdcc496 : 0xd2b98a; r(b, x, y, 7, 3, c); p(b, x, y, 0xe6d2a8); }
        break;
      case T.CHURCH_DOOR:
        r(b, 0, 0, 16, 16, 0xc4ac7e);
        for (let y = 0; y < 16; y += 4) for (let x = (y / 4 % 2) * 4; x < 20; x += 8) r(b, x, y, 7, 3, 0xd6be90);
        r(b, 2, 3, 12, 13, 0xa88a5e); ov(b, 8, 4, 6, 3.5, 0xa88a5e);
        r(b, 3, 4, 10, 12, 0x6a3e1e); ov(b, 8, 5, 5, 2.8, 0x6a3e1e);
        r(b, 8, 3, 1, 13, 0x4a2a14);
        for (let y = 6; y < 16; y += 3) { p(b, 5, y, 0xc8b070); p(b, 11, y, 0xc8b070); }
        break;
      case T.GARAGE:
        r(b, 0, 0, 16, 16, 0x8a8d92);
        for (let y = 1; y < 16; y += 3) { r(b, 0, y, 16, 1, 0x6a6d72); r(b, 0, y + 1, 16, 1, 0xa2a5aa); }
        speck(b, 0, 0, 16, 16, 0x7a7d82, 0.08, R);
        break;
      case T.BARRICADE:
        r(b, 0, 0, 16, 16, 0x8f897c);
        r(b, 0, 9, 16, 7, 0x9c8a5e);
        for (let x = 0; x < 16; x += 5) ov(b, x + 2.5, 12, 3, 2.5, 0xb8a676);
        for (let x = 0; x < 16; x += 5) ov(b, x + 2.5, 11, 2, 1, 0xccbc8c);
        r(b, 0, 3, 16, 3, 0x7a5432); r(b, 0, 3, 16, 1, 0x9a6e44);
        line(b, 1, 0, 14, 9, 0x6a4628); line(b, 2, 0, 15, 9, 0x8a6038);
        break;
      default: r(b, 0, 0, 16, 16, 0xff00ff);
    }
    return b;
  }

  function average(b) {
    let rr = 0, g = 0, bl = 0, n = 0;
    for (const c of b.d) { if ((c >>> 24) === 0) continue; rr += (c >> 16) & 255; g += (c >> 8) & 255; bl += c & 255; n++; }
    return n ? ((Math.floor(rr / n) << 16) | (Math.floor(g / n) << 8) | Math.floor(bl / n)) : 0;
  }

  // ------------------------------------------------------------------ personajes
  function Look(skin, hair, shirt, pants, shoes) { return { skin, hair, shirt, pants, shoes }; }

  function person(L, dir, frame, attack) {
    const b = img(16, 24);
    let legL = 0, legR = 0, armL = 0, armR = 0;
    if (frame === 1) { legL = -1; armR = -1; armL = 1; }
    if (frame === 2) { legR = -1; armL = -1; armR = 1; }
    const dark = shade(L.pants, 0.75);
    const side = dir >= 2;
    if (L.cloak) {
      const cc = 0x3d3a34;
      if (dir === 1) { r(b, 2, 9, 12, 13, cc); for (let x = 2; x < 14; x += 2) p(b, x, 22, cc); }
      else if (!side) { r(b, 2, 10, 12, 11, cc); for (let x = 2; x < 14; x += 3) p(b, x, 21, cc); }
      else { r(b, 3, 9, 7, 12, cc); for (let x = 3; x < 10; x += 2) p(b, x, 21 + (frame === 0 ? 0 : (x >> 1) % 2), cc); }
    }
    if (!side) {
      r(b, 5, 17, 3, 5 + legL, L.robe ? L.shirt : L.pants);
      r(b, 8, 17, 3, 5 + legR, L.robe ? L.shirt : L.pants);
      r(b, 5, 21 + legL, 3, 2, L.shoes);
      r(b, 8, 21 + legR, 3, 2, L.shoes);
      if (L.cloak) { r(b, 5, 19 + legL, 3, 1, 0x5a4636); r(b, 8, 19 + legR, 3, 1, 0x5a4636); }
    } else {
      const fx = frame === 1 ? 1 : frame === 2 ? -1 : 0;
      r(b, 6 - fx, 17, 3, 5, dark);
      r(b, 7 + fx, 17, 3, 5, L.robe ? L.shirt : L.pants);
      r(b, 6 - fx, 21, 3, 2, shade(L.shoes, 0.8));
      r(b, 7 + fx, 21, 4, 2, L.shoes);
    }
    const torsoC = L.shirt;
    if (!side) {
      r(b, 4, 9, 8, 9, torsoC);
      if (L.robe) r(b, 4, 16, 8, 5, torsoC);
      if (L.apron && dir === 0) r(b, 5, 12, 6, 8, 0xe0dccc);
      if (L.cloak && dir === 0) {
        r(b, 6, 10, 4, 10, 0xd9d2bf);
        r(b, 7, 12, 2, 6, 0xa8322a); r(b, 6, 13, 4, 2, 0xa8322a);
        r(b, 4, 15, 8, 1, 0x5a3a20); p(b, 8, 15, 0xc8a040);
        r(b, 4, 9, 8, 2, 0x4a463e);
      }
      if (L.cloak && dir === 1) { r(b, 5, 11, 6, 6, 0x6e4a2a); r(b, 5, 11, 6, 1, 0x8a6038); r(b, 4, 9, 8, 2, 0x4a463e); }
      const armC = L.cloak ? 0x45413a : shade(torsoC, 0.9);
      if (L.hollow && dir === 0) {
        r(b, 3, 10, 2, 5, armC); r(b, 11, 10, 2, 5, armC); r(b, 3, 15, 2, 1, L.skin); r(b, 11, 15, 2, 1, L.skin);
      } else {
        r(b, 2, 10 + armL, 2, 6, armC); r(b, 12, 10 + armR, 2, 6, armC);
        r(b, 2, 16 + armL, 2, 1, L.skin); r(b, 12, 16 + armR, 2, 1, L.skin);
      }
    } else {
      r(b, 5, 9, 6, 9, torsoC);
      if (L.robe) r(b, 5, 16, 6, 5, torsoC);
      if (L.cloak) { r(b, 4, 9, 7, 2, 0x4a463e); r(b, 9, 10, 2, 8, 0xd9d2bf); r(b, 9, 12, 2, 4, 0xa8322a); r(b, 5, 15, 6, 1, 0x5a3a20); r(b, 4, 11, 2, 5, 0x6e4a2a); }
      const armC = L.cloak ? 0x45413a : shade(torsoC, 0.85);
      const ax = attack ? 9 : 7, ay = frame === 1 ? -1 : frame === 2 ? 1 : 0;
      if (attack || L.hollow) { r(b, 8, 11, 5, 2, armC); r(b, 13, 11, 1, 2, L.skin); }
      else { r(b, ax, 10 + ay, 2, 6, armC); r(b, ax, 16 + ay, 2, 1, L.skin); }
    }
    if (!side) {
      r(b, 5, 3, 6, 6, L.skin);
      if (dir === 0) {
        p(b, 6, 5, 0x1a1210); p(b, 9, 5, 0x1a1210);
        if (L.hollow) { p(b, 6, 5, 0xe8d040); p(b, 9, 5, 0xe8d040); p(b, 7, 7, 0x3a2a20); p(b, 8, 7, 0x3a2a20); }
        if (L.beard) { r(b, 5, 7, 6, 3, L.hair); r(b, 6, 9, 4, 1, L.hair); p(b, 7, 7, shade(L.skin, 0.75)); p(b, 8, 7, shade(L.skin, 0.75)); p(b, 5, 6, L.hair); p(b, 10, 6, L.hair); }
        if (!L.bald) { r(b, 5, 2, 6, 2, L.hair); p(b, 4, 3, L.hair); p(b, 11, 3, L.hair); r(b, 5, 3, 6, 1, L.hair); }
        else { r(b, 5, 3, 1, 3, L.hair); r(b, 10, 3, 1, 3, L.hair); }
        if (L.longHair) { r(b, 4, 3, 1, 7, L.hair); r(b, 11, 3, 1, 7, L.hair); }
      } else {
        r(b, 5, 2, 6, 7, L.hair);
        if (L.bald) r(b, 6, 3, 4, 3, L.skin);
        if (L.longHair) r(b, 4, 3, 8, 8, L.hair);
        if (L.beard) { p(b, 5, 8, L.hair); p(b, 10, 8, L.hair); }
      }
      if (L.helmet) { r(b, 4, 1, 8, 3, 0x7a7c80); r(b, 4, 3, 8, 1, 0x5a5c60); p(b, 6, 1, 0xa0a4a8); }
    } else {
      r(b, 5, 3, 6, 6, L.skin);
      p(b, 11, 6, L.skin);
      p(b, 9, 5, L.hollow ? 0xe8d040 : 0x1a1210);
      if (!L.bald) { r(b, 5, 2, 6, 2, L.hair); r(b, 5, 3, 3, 3, L.hair); } else r(b, 5, 4, 2, 2, L.hair);
      if (L.longHair) r(b, 4, 3, 3, 8, L.hair);
      if (L.beard) { r(b, 7, 7, 4, 3, L.hair); r(b, 8, 9, 3, 1, L.hair); p(b, 10, 7, shade(L.skin, 0.75)); }
      if (L.helmet) { r(b, 4, 1, 8, 3, 0x7a7c80); p(b, 6, 1, 0xa0a4a8); }
    }
    Px.autoShade(b);
    Px.outlineTint(b);
    return b;
  }

  function personSet(L) {
    const s = [];
    for (let d = 0; d < 4; d++) {
      s.push([]);
      const dd = d === 2 ? 3 : d;
      for (let f = 0; f < 3; f++) { const im = person(L, dd, f, false); s[d].push(d === 2 ? flipH(im) : im); }
    }
    return s;
  }

  function makeCharacters() {
    const heroL = Look(0xc08a64, 0x2a1d16, 0x45413a, 0x4a3a2c, 0x3a2a1c); heroL.beard = true; heroL.cloak = true;
    Art.hero = personSet(heroL);
    Art.heroAtk = [0, 1, 2, 3].map(d => { const im = person(heroL, d === 2 ? 3 : d, 1, true); return d === 2 ? flipH(im) : im; });
    const hl = Look(0x8a9a7a, 0x3a3a30, 0x5a5466, 0x3e3a44, 0x2a2626); hl.hollow = true;
    Art.hollow = personSet(hl);
    const priest = Look(0xd0a07c, 0xb8b4ac, 0x1e1e24, 0x1e1e24, 0x141414); priest.robe = true; priest.bald = true; Art.people.cura = personSet(priest);
    const healer = Look(0xc89870, 0x8a8a8a, 0x6a3a4a, 0x3a2a30, 0x2a2020); healer.apron = true; healer.longHair = true; Art.people.curandera = personSet(healer);
    const guard = Look(0xb88058, 0x3a2a1e, 0x5a6a3e, 0x3a3e30, 0x2a2420); guard.helmet = true; guard.beard = true; Art.people.guardia = personSet(guard);
    const mech = Look(0xc48c66, 0x6a3a1e, 0x3a5a7a, 0x3a3a48, 0x2a2a2a); mech.longHair = true; Art.people.mecanica = personSet(mech);
    Art.people.chaval = personSet(Look(0xc8946c, 0x2a1a10, 0xb0563a, 0x3a4a6a, 0x2a2a2a));
    const old = Look(0xc09070, 0xe0e0dc, 0x5a4a3a, 0x3a3630, 0x262220); old.bald = true; Art.people.abuelo = personSet(old);

    Art.boar = [[], []];
    for (let f = 0; f < 2; f++) {
      const b = img(22, 16);
      ov(b, 11, 8, 8, 5, 0x4a3a30); ov(b, 11, 6, 7, 3, 0x3a2c24);
      for (let x = 5; x < 16; x += 2) p(b, x, 2 + (x % 3), 0x241a14);
      ov(b, 18, 9, 3.5, 3, 0x5a463a); r(b, 20, 9, 2, 2, 0x7a5a4a);
      p(b, 18, 7, 0xff3020); p(b, 19, 7, 0xff7050); p(b, 20, 11, 0xe8e0d0); p(b, 21, 10, 0xe8e0d0);
      ov(b, 9, 9, 2, 1.5, 0x6a8a3a); ov(b, 13, 7, 1.5, 1, 0x7a9a44);
      const a = f;
      r(b, 5 + a, 12, 2, 3, 0x2a201a); r(b, 9 - a, 12, 2, 3, 0x2a201a); r(b, 13 + a, 12, 2, 3, 0x2a201a); r(b, 16 - a, 12, 2, 3, 0x2a201a);
      p(b, 3, 6, 0x3a2c24); p(b, 2, 5, 0x3a2c24);
      outline(b, 0x140e0a);
      Art.boar[1][f] = b; Art.boar[0][f] = flipH(b);
    }
    Art.scorpion = [[], [], [], []];
    for (let f = 0; f < 2; f++) {
      const b = img(16, 16);
      for (let i = 0; i < 3; i++) { const ly = 7 + i * 2 + (f === 0 ? i % 2 : (i + 1) % 2); line(b, 5, 7 + i * 2, 2, ly, 0x3a2410); line(b, 10, 7 + i * 2, 13, ly, 0x3a2410); }
      ov(b, 7.5, 9, 3, 3.5, 0x6a4422); ov(b, 7.5, 8, 2, 2, 0x8a5a2e);
      r(b, 7, 12, 2, 2, 0x6a4422); r(b, 7, 14, 2, 1, 0x5a3a1c); p(b, 8, 15, 0x4a2e16);
      line(b, 5, 7, 3, 4, 0x6a4422); line(b, 10, 7, 12, 4, 0x6a4422);
      r(b, 2, 2, 2, 2, 0x8a5a2e); r(b, 12, 2, 2, 2, 0x8a5a2e);
      p(b, 7, 6, 0xff4020); p(b, 8, 6, 0xff4020);
      outline(b, 0x1e1208);
      Art.scorpion[1][f] = b;
      const r90 = rot90(b);
      Art.scorpion[3][f] = r90; Art.scorpion[0][f] = rot90(r90); Art.scorpion[2][f] = rot90(rot90(r90));
    }
    Art.shade = [];
    for (let f = 0; f < 3; f++) {
      const b = img(16, 22);
      ov(b, 8, 7, 5.5, 6, 0x2e2240); ov(b, 8, 12, 5, 5, 0x2e2240);
      for (let y = 15; y < 21; y++) { const off = Math.round(Math.sin((y + f * 2) * 0.9) * 1.5); r(b, 5 + off + ((y - 15) >> 1), y, Math.max(1, 6 - (y - 15)), 1, 0x2e2240); }
      ov(b, 8, 6, 3.5, 3, 0x45345e);
      r(b, 6, 7, 1, 2, 0xf0f0ff); r(b, 10, 7, 1, 2, 0xf0f0ff);
      outline(b, 0x120c1a);
      Art.shade.push(b);
    }
    Art.boss = []; Art.bossHurt = [];
    for (let f = 0; f < 2; f++) {
      const b = img(56, 52);
      ova(b, 28, 46, 24, 5, 0x60000000);
      ov(b, 28, 34, 22, 14, 0x24525a); ov(b, 28, 30, 18, 14, 0x2a6068);
      for (let i = 0; i < 6; i++) ov(b, 12 + i * 6, 18 - (i % 2) * 2, 2.5, 6, 0x1c4048);
      ov(b, 28, 24, 14, 11, 0x307078);
      for (let y = 16; y < 40; y += 3) for (let x = 10 + (y % 2) * 2; x < 48; x += 5) p(b, x, y, 0x3c8890);
      ov(b, 28, 36, 10, 6, 0xb8c8a8);
      const open = f === 0 ? 2 : 6;
      r(b, 20, 32, 16, open, 0x3a0a10);
      for (let x = 21; x < 36; x += 3) { p(b, x, 32, 0xf0ece0); p(b, x + 1, 31 + open, 0xf0ece0); }
      for (const e of [[20, 22], [36, 22], [24, 18], [32, 18], [28, 15]]) { ov(b, e[0], e[1], 2, 1.6, 0xff3a2a); p(b, e[0], e[1], 0xffe0a0); }
      ov(b, 7, 36, 5, 3, 0x24525a); ov(b, 49, 36, 5, 3, 0x24525a);
      for (let x = 3; x < 12; x += 3) p(b, x, 39, 0xe0e0d0);
      for (let x = 45; x < 54; x += 3) p(b, x, 39, 0xe0e0d0);
      outline(b, 0x0c1a1c);
      Art.boss.push(b); Art.bossHurt.push(tint(b, 0xffffff));
    }
    const orb = img(8, 8); ov(orb, 4, 4, 3.6, 3.6, 0x1a7a7a); ov(orb, 4, 4, 2.4, 2.4, 0x50d8c8); p(orb, 3, 3, 0xe0fff8); Art.orb = orb;
    const sw = img(7, 18);
    r(sw, 3, 0, 1, 12, 0xe4e8ec); r(sw, 2, 1, 1, 11, 0xb8c0c8); r(sw, 4, 1, 1, 11, 0x9aa2aa);
    r(sw, 0, 12, 7, 1, 0xc8a040); p(sw, 0, 11, 0xc8a040); p(sw, 6, 11, 0xc8a040);
    r(sw, 3, 13, 1, 4, 0x5a3a20); p(sw, 3, 17, 0xc8a040);
    outline(sw, 0x1a1410); Art.sword = sw;
    const rel = img(12, 14); r(rel, 5, 1, 2, 12, 0xd8b048); r(rel, 2, 4, 8, 2, 0xd8b048); p(rel, 5, 1, 0xfff0a0); r(rel, 6, 2, 1, 10, 0xa88020); outline(rel, 0x3a2a10); Art.relic = rel;
    const herb = img(10, 10); line(herb, 5, 9, 5, 3, 0x4a6a2a); ov(herb, 3, 4, 2, 1.5, 0x6a9a3a); ov(herb, 7, 3, 2, 1.5, 0x7aaa44); ov(herb, 5, 1.5, 1.5, 1.5, 0x8abc52); outline(herb, 0x1a2a10); Art.herb = herb;
    const cat = img(16, 12);
    ov(cat, 7, 7, 5, 3.5, 0x8a8478); for (let x = 4; x < 11; x += 2) r(cat, x, 4, 1, 6, 0x4a463e);
    ov(cat, 12, 5, 2.5, 2.5, 0x8a8478); p(cat, 11, 2, 0x8a8478); p(cat, 13, 2, 0x8a8478); p(cat, 12, 5, 0x2a2a2a); p(cat, 13, 5, 0x2a2a2a);
    line(cat, 2, 8, 0, 5, 0x4a463e); outline(cat, 0x1a1814); Art.cat = cat;
    const dog = img(14, 12);
    ov(dog, 6, 7, 4, 2.5, 0xe0ccaa); ov(dog, 10, 4, 2.5, 2.5, 0xe0ccaa);
    p(dog, 9, 1, 0xc8a070); p(dog, 12, 1, 0xc8a070); p(dog, 9, 2, 0xc8a070); p(dog, 12, 2, 0xc8a070);
    p(dog, 10, 4, 0x1a1a1a); p(dog, 11, 4, 0x1a1a1a); r(dog, 3, 9, 1, 3, 0xd0b890); r(dog, 8, 9, 1, 3, 0xd0b890); p(dog, 2, 6, 0xd0b890); p(dog, 1, 5, 0xd0b890);
    r(dog, 5, 5, 3, 2, 0xb08050); outline(dog, 0x1a1410); Art.dog = dog;
    const dogB = copy(dog); dogB.d[5 * dogB.w + 1] = 0; p(dogB, 1, 7, 0xd0b890); Art.dogB = dogB;
    Art.campfire = [];
    for (let f = 0; f < 3; f++) {
      const b = img(16, 16);
      r(b, 3, 13, 10, 2, 0x5a3a20); line(b, 3, 14, 12, 11, 0x6e4a2a); line(b, 3, 11, 12, 14, 0x6e4a2a);
      ov(b, 8, 10 - f % 2, 3.5, 4.5 + (f === 1 ? 1 : 0), 0xe85a20); ov(b, 8, 11 - f % 2, 2.2, 3, 0xf8a830); ov(b, 8, 12, 1.2, 1.6, 0xfff0a0);
      Art.campfire.push(b);
    }
  }

  // ------------------------------------------------------------------ objetos
  function shadowed(w, h, cx, cy, rx, ry) { const b = img(w, h); ova(b, cx, cy, rx, ry, 0x50000000); return b; }
  const put = (k, b) => { Art.P[k] = b; };
  function canopy(b, cx, cy, rx, ry, dark, mid, light, rr, blobs) {
    for (let i = 0; i < blobs; i++) { const a = rr.next() * Math.PI * 2, d = rr.next(); ov(b, cx + Math.cos(a) * rx * d * 0.7, cy + Math.sin(a) * ry * d * 0.7, rx * 0.45, ry * 0.45, dark); }
    for (let i = 0; i < blobs; i++) { const a = rr.next() * Math.PI * 2, d = rr.next(); ov(b, cx - 1 + Math.cos(a) * rx * d * 0.5, cy - 1 + Math.sin(a) * ry * d * 0.5, rx * 0.35, ry * 0.35, mid); }
    for (let i = 0; i < (blobs >> 1); i++) { const a = rr.next() * Math.PI * 2, d = rr.next(); ov(b, cx - 2 + Math.cos(a) * rx * d * 0.35, cy - 2 + Math.sin(a) * ry * d * 0.35, rx * 0.18, ry * 0.18, light); }
  }
  function vehicle(body, glass, suv) {
    const b = shadowed(34, 22, 17, 19, 16, 3);
    r(b, 2, 8, 30, 9, shade(body, 0.92)); r(b, 2, 8, 30, 2, body);
    r(b, suv ? 7 : 5, 2, suv ? 16 : 20, 7, body);
    r(b, suv ? 8 : 7, 3, suv ? 6 : 8, 5, glass); r(b, suv ? 16 : 17, 3, suv ? 6 : 7, 5, glass);
    r(b, 2, 14, 30, 1, shade(body, 0.7));
    ov(b, 8, 17, 3, 3, 0x1a1a1a); ov(b, 26, 17, 3, 3, 0x1a1a1a); ov(b, 8, 17, 1.3, 1.3, 0x8a8a8a); ov(b, 26, 17, 1.3, 1.3, 0x8a8a8a);
    r(b, 30, 10, 2, 2, 0xf0e0a0); r(b, 2, 10, 2, 2, 0xc03020);
    if (suv) r(b, 2, 11, 4, 3, 0x3a3a3a);
    outline(b, 0x14161a);
    return b;
  }
  function bed(cover, pillow, frame, metal) {
    const b = img(34, 38);
    if (metal) {
      for (let x = 2; x < 32; x++) p(b, x, Math.floor(6 - Math.abs(Math.sin(x * 0.4)) * 5), frame);
      r(b, 1, 1, 2, 10, frame); r(b, 31, 1, 2, 10, frame); r(b, 1, 9, 32, 2, frame);
    } else {
      r(b, 1, 0, 32, 10, frame); r(b, 1, 0, 32, 2, shade(frame, 1.15)); for (let x = 5; x < 30; x += 6) r(b, x, 3, 4, 5, shade(frame, 0.85));
    }
    r(b, 2, 9, 30, 28, 0xf0ece4);
    r(b, 4, 10, 12, 6, pillow); r(b, 18, 10, 12, 6, pillow); r(b, 4, 15, 12, 1, shade(pillow, 0.85)); r(b, 18, 15, 12, 1, shade(pillow, 0.85));
    r(b, 2, 18, 30, 19, cover); r(b, 2, 18, 30, 2, shade(cover, 1.1));
    for (let y = 22; y < 37; y += 4) r(b, 2, y, 30, 1, shade(cover, 0.92));
    r(b, 2, 36, 30, 1, shade(cover, 0.75));
    outline(b, 0x2a2420);
    return b;
  }

  function makeProps() {
    const rr = RNG(99);
    for (let v = 0; v < 3; v++) {
      const b = shadowed(18, 22, 9, 19, 7, 2.5);
      r(b, 8, 12, 2, 8, 0x5a4a38); p(b, 7, 18, 0x5a4a38); p(b, 10, 17, 0x4a3a2a); p(b, 9, 14, 0x7a6a50);
      const c = img(18, 22); canopy(c, 9, 8.5, 8, 7, 0x5a6a3c, 0x75844e, 0x9ea876, rr, 9); outline(c, 0x2f3820); over(b, c);
      put('olivo' + v, b);
    }
    for (let v = 0; v < 2; v++) {
      const b = shadowed(18, 24, 9, 21, 6, 2);
      r(b, 8, 12, 2, 10, 0x4a3628); line(b, 9, 13, 5, 9, 0x4a3628); line(b, 9, 13, 13, 8, 0x4a3628);
      const c = img(18, 24); canopy(c, 9, 8, 8, 6.5, 0x7a8a4a, 0x96a85e, 0xc0c890, rr, 8); outline(c, 0x3a4220); over(b, c);
      put('almendro' + v, b);
    }
    for (let v = 0; v < 3; v++) {
      const b = shadowed(22, 34, 11, 31, 8, 2.5);
      r(b, 10, 14, 2, 18, 0x5a3e28); p(b, 9, 20, 0x5a3e28); p(b, 12, 24, 0x6e4c30);
      const c = img(22, 34); canopy(c, 11, 10, 10, 8, 0x2e4a2a, 0x3e5e34, 0x5a7a44, rr, 10); canopy(c, 13, 17, 6, 4, 0x2e4a2a, 0x3e5e34, 0x5a7a44, rr, 5); outline(c, 0x16241a); over(b, c);
      put('pino' + v, b);
    }
    for (let v = 0; v < 2; v++) {
      const b = shadowed(16, 44, 8, 41, 6, 2);
      r(b, 7, 30, 2, 12, 0x6a5a48);
      const c = img(16, 44);
      for (let y = 3; y < 34; y += 3) { const w = 3 + Math.sin((y / 34) * Math.PI) * 4; ov(c, 8 + rr.int(3) - 1, y, w, 3, 0x41612a); }
      for (let y = 4; y < 32; y += 4) ov(c, 7 + rr.int(3) - 1, y, 2.5, 2, 0x5c7e36);
      for (let y = 5; y < 30; y += 6) p(c, 6 + rr.int(4), y, 0x86a454);
      outline(c, 0x1e2e14); over(b, c);
      put('chopo' + v, b);
    }
    {
      const b = shadowed(36, 38, 18, 35, 14, 3);
      r(b, 17, 22, 3, 14, 0x5a4a3a);
      const c = img(36, 38);
      canopy(c, 18, 11, 14, 9, 0x5e7a34, 0x7a9844, 0x9ab85a, rr, 12);
      for (let x = 4; x < 32; x++) { const len = 12 + rr.int(14); const col = rr.int(3) === 0 ? 0x9ab85a : (x % 2 === 0 ? 0x6e8a3c : 0x84a24c); for (let y = 10; y < 10 + len && y < 36; y++) if (rr.next() < 0.85) p(c, x, y, col); }
      outline(c, 0x2a3a18); over(b, c);
      put('sauce', b);
    }
    for (let v = 0; v < 2; v++) {
      const b = shadowed(26, 26, 13, 23, 10, 2.5);
      r(b, 12, 15, 3, 9, 0x8a8278); line(b, 13, 16, 7, 11, 0x8a8278); line(b, 13, 16, 19, 10, 0x8a8278);
      const c = img(26, 26); canopy(c, 13, 10, 12, 8, 0x3e6a2a, 0x58883a, 0x78a84e, rr, 12);
      for (let i = 0; i < 3; i++) p(c, 5 + rr.int(16), 5 + rr.int(9), 0x5a2a5a);
      outline(c, 0x1a3014); over(b, c);
      put('higuera' + v, b);
    }
    {
      const b = shadowed(14, 28, 7, 26, 5, 2);
      const c = img(14, 28);
      for (let y = 2; y < 25; y++) { const w = Math.min(6, 1 + y * 0.35) * (y > 20 ? (25 - y) / 5 + 0.4 : 1); r(c, Math.floor(7 - w), y, Math.floor(w * 2), 1, y % 3 === 0 ? 0x557a68 : 0x456a58); }
      for (let i = 0; i < 8; i++) p(c, 4 + rr.int(6), 5 + rr.int(16), 0x6a9080);
      outline(c, 0x1e3028); over(b, c);
      put('cipres', b);
    }
    for (let v = 0; v < 3; v++) {
      const b = shadowed(16, 14, 8, 12, 6, 2);
      const c = img(16, 14);
      const base = v === 2 ? 0x8a8a52 : 0xa8a45a;
      for (let i = 0; i < 26; i++) { const x = 2 + rr.int(12), y = 2 + rr.int(9); line(c, x, y, x + rr.int(3) - 1, y + 3, rr.bool() ? base : shade(base, 0.8)); }
      outline(c, 0x3a3a1c); over(b, c);
      put('retama' + v, b);
    }
    { const b = img(16, 20); for (let i = 0; i < 9; i++) { const x = 2 + rr.int(12), h = 10 + rr.int(8); line(b, x, 19, x + rr.int(3) - 1, 19 - h, rr.bool() ? 0xa8a46a : 0x8a9450); } put('canas', b); }
    for (let v = 0; v < 2; v++) {
      const b = shadowed(16, 14, 8, 11, 7, 2);
      const c = img(16, 14); ov(c, 8, 8, 6.5 - v, 4.5, 0xb8a888); ov(c, 7, 7, 4.5, 3, 0xcfc0a0); p(c, 6, 6, 0xe0d4b8); outline(c, 0x5a4e3a); over(b, c);
      put('roca' + v, b);
    }
    {
      const b = shadowed(32, 26, 16, 23, 14, 3);
      r(b, 6, 9, 20, 9, 0x2a5aa8); r(b, 6, 9, 20, 2, 0x4a7ac8); r(b, 20, 6, 7, 10, 0x2a5aa8);
      r(b, 21, 7, 5, 2, 0x4a7ac8); for (let y = 11; y < 17; y += 2) r(b, 26, y, 2, 1, 0x1a1a1a);
      r(b, 8, 2, 1, 9, 0x2a2a2a); r(b, 15, 2, 1, 9, 0x2a2a2a); r(b, 8, 2, 8, 1, 0x2a2a2a); p(b, 11, 1, 0xf0a020); p(b, 12, 1, 0xf0a020);
      ov(b, 9, 19, 5.5, 5.5, 0x1e1e1e); ov(b, 9, 19, 3, 3, 0x8a8a8a); ov(b, 23, 20, 3.5, 3.5, 0x1e1e1e); ov(b, 23, 20, 1.6, 1.6, 0x8a8a8a);
      r(b, 17, 12, 4, 1, 0xe0e0e0);
      outline(b, 0x10141a); put('tractor', b);
    }
    put('furgo', vehicle(0xeceae4, 0x30383e, false));
    put('todoterreno', vehicle(0xe4e2dc, 0x30383e, true));
    [0x8a3a2a, 0x3a5a7a, 0x6a6a5a, 0x9a8a5a, 0x5a3a4a].forEach((col, v) => {
      const w = vehicle(col, 0x1a1a1a, v % 2 === 0);
      for (let i = 0; i < 40; i++) { const x = rr.int(32), y = rr.int(20); if (Px.op(w, x, y) && (w.d[y * w.w + x] & 0xffffff) !== 0x1a1a1a) p(w, x, y, rr.bool() ? 0x7a4a2a : 0x5a3a20); }
      put('chatarra' + v, w);
    });
    {
      const b = shadowed(26, 26, 13, 24, 13, 2);
      r(b, 1, 4, 24, 4, 0x3c3f45); r(b, 1, 3, 24, 1, 0x5c6066); r(b, 2, 8, 22, 16, 0x4c4f55);
      for (let x = 2; x < 24; x += 3) r(b, x, 8, 1, 16, 0x3b3e43);
      r(b, 10, 10, 9, 14, 0x44474d); r(b, 10, 10, 9, 1, 0x5c6066); p(b, 17, 17, 0x1a1a1a);
      outline(b, 0x16181c); put('caseta', b);
    }
    { const b = shadowed(14, 30, 7, 28, 6, 2); r(b, 2, 14, 10, 14, 0x8a4a28); r(b, 4, 17, 6, 6, 0x2a1a10); r(b, 5, 2, 4, 14, 0x5a5a5a); r(b, 4, 1, 6, 2, 0x3a3a3a); outline(b, 0x1a1410); put('barbacoa', b); }
    { const b = shadowed(12, 14, 6, 12, 5, 1.5); r(b, 2, 4, 8, 8, 0xb89870); ov(b, 6, 4, 4, 1.8, 0xd8c098); ov(b, 6, 4, 2, 0.8, 0xc0a074); outline(b, 0x4a3a24); put('tocon', b); }
    { const b = img(12, 46); voronoi(b, 1, 4, 10, 42, 10, [0xc9a46c, 0xb8925a, 0xd6b47c, 0xe0c08a], 0xe6dcc4, rr); r(b, 4, 0, 4, 5, 0x6a6a6a); r(b, 3, 0, 6, 1, 0x4a4a4a); outline(b, 0x5a4428); put('chimenea', b); }
    { const b = img(14, 8); r(b, 0, 0, 14, 5, 0x2c3e66); for (let x = 3; x < 14; x += 3) r(b, x, 0, 1, 5, 0x6880aa); r(b, 6, 5, 2, 3, 0x2a2a2a); outline(b, 0x1a1a1a); put('foco_solar', b); }
    { const b = shadowed(18, 12, 9, 10, 7, 2); r(b, 3, 3, 11, 5, 0xd8a030); r(b, 3, 3, 11, 1, 0xf0c050); ov(b, 15, 8, 2, 2, 0x2a2a2a); line(b, 2, 8, 0, 11, 0x3a3a3a); line(b, 13, 7, 17, 9, 0x5a5a5a); outline(b, 0x2a2010); put('carretilla', b); }
    {
      const b = shadowed(20, 22, 10, 20, 9, 2);
      r(b, 2, 9, 16, 11, 0xb89870); for (let x = 2; x < 18; x += 3) r(b, x, 9, 1, 11, 0x9a7a54);
      for (let i = 0; i < 9; i++) { r(b, 1 + i, 9 - i, 2, 1, 0xa88860); r(b, 17 - i, 9 - i, 2, 1, 0xa88860); }
      r(b, 7, 13, 6, 7, 0x3a2a1a); outline(b, 0x2a2014); put('casetaperro', b);
    }
    { const b = shadowed(20, 18, 10, 16, 9, 2); r(b, 1, 6, 18, 6, 0xe8e4dc); r(b, 2, 12, 2, 4, 0xd8d4cc); r(b, 16, 12, 2, 4, 0xd8d4cc); r(b, 5, 2, 9, 5, 0x3a3a34); r(b, 6, 3, 4, 3, 0x6a6a5a); p(b, 12, 4, 0xe03020); line(b, 13, 2, 16, 0, 0x8a8a8a); outline(b, 0x2a2a24); put('radio', b); }
    { const b = shadowed(26, 18, 13, 16, 12, 2); r(b, 4, 4, 18, 8, 0xf0f0ec); r(b, 4, 4, 18, 1, 0xffffff); r(b, 5, 12, 2, 4, 0xd8d8d4); r(b, 19, 12, 2, 4, 0xd8d8d4); r(b, 0, 7, 3, 7, 0xf0f0ec); r(b, 23, 7, 3, 7, 0xf0f0ec); outline(b, 0x8a8a84); put('mesaporche', b); }
    { const b = img(10, 30); voronoi(b, 1, 0, 8, 28, 6, [0xc9a46c, 0xb8925a, 0xd6b47c], 0xe6dcc4, rr); r(b, 0, 26, 10, 4, 0xb8925a); outline(b, 0x5a4428); put('pilar', b); }
    {
      const b = img(32, 26);
      line(b, 0, 2, 31, 4, 0x2a2a2a);
      r(b, 2, 3, 6, 9, 0x2a2a2a); r(b, 3, 5, 1, 1, 0xf0f0f0); r(b, 5, 8, 1, 1, 0xf0f0f0);
      r(b, 10, 3, 7, 12, 0x1a1a22); r(b, 12, 3, 3, 3, 0x2a2a34);
      for (let y = 4; y < 22; y += 2) { r(b, 22, y, 2, 2, 0xb8221a); p(b, 21, y + 1, 0x8a1a10); }
      r(b, 26, 4, 5, 8, 0x3a3a4a);
      put('tendedero', b);
    }
    {
      const b = shadowed(18, 34, 9, 31, 7, 2);
      r(b, 4, 26, 10, 5, 0xb0a490); r(b, 4, 26, 10, 1, 0xc8bca8);
      r(b, 8, 4, 3, 23, 0xd8ccb4); r(b, 3, 9, 13, 3, 0xd8ccb4); r(b, 8, 4, 1, 23, 0xece2cc);
      outline(b, 0x4a4234); put('cruz', b);
      const g = copy(b);
      for (let i = 0; i < g.d.length; i++) if ((g.d[i] >>> 24) === 255) g.d[i] = (0xff000000 | mix(g.d[i] & 0xffffff, 0xffe080, 0.45)) >>> 0;
      put('cruzluz', g);
    }
    { const b = shadowed(34, 30, 17, 26, 16, 3); ov(b, 17, 20, 15, 7, 0xb8b0a0); ov(b, 17, 19, 13, 5.5, 0x3a9e98); ov(b, 15, 18, 6, 2, 0x7fcfc6); r(b, 15, 5, 4, 15, 0xc8c0b0); ov(b, 17, 6, 5, 2, 0xb8b0a0); p(b, 17, 2, 0x7fcfc6); p(b, 17, 3, 0x7fcfc6); outline(b, 0x5a5448); put('fuente', b); }
    { const b = shadowed(10, 34, 5, 32, 3, 1.5); r(b, 4, 6, 2, 26, 0x2a2a2e); r(b, 3, 30, 4, 2, 0x2a2a2e); r(b, 2, 3, 6, 4, 0x3a3a40); r(b, 3, 4, 4, 2, 0x8a8a70); outline(b, 0x101012); put('farola', b); }
    { const b = shadowed(26, 14, 13, 12, 12, 2); r(b, 1, 3, 24, 2, 0x8a6038); r(b, 1, 6, 24, 3, 0x9a7044); r(b, 3, 9, 2, 3, 0x2a2a2a); r(b, 21, 9, 2, 3, 0x2a2a2a); outline(b, 0x2a1a10); put('banco', b); }
    { const b = shadowed(14, 18, 7, 16, 6, 2); r(b, 2, 2, 10, 14, 0x6a7a4a); r(b, 2, 4, 10, 1, 0x4a5a3a); r(b, 2, 12, 10, 1, 0x4a5a3a); ov(b, 7, 2, 5, 1.5, 0x7a8a5a); outline(b, 0x1a2010); put('barril', b); }
    {
      const b = img(32, 72);
      r(b, 4, 18, 24, 54, 0xc4ac7e);
      for (let y = 18; y < 72; y += 4) for (let x = 4 + (y / 4 % 2) * 4; x < 28; x += 8) r(b, x, y, 7, 3, rr.bool() ? 0xdcc496 : 0xd2b98a);
      r(b, 2, 16, 28, 3, 0xb09468); r(b, 6, 4, 20, 13, 0xc4ac7e);
      r(b, 9, 7, 5, 9, 0x2a2018); r(b, 18, 7, 5, 9, 0x2a2018); ov(b, 11.5, 7, 2.5, 2, 0x2a2018); ov(b, 20.5, 7, 2.5, 2, 0x2a2018);
      ov(b, 11.5, 12, 2, 2, 0xb08a30); ov(b, 20.5, 12, 2, 2, 0xb08a30);
      for (let i = 0; i < 5; i++) r(b, 6 + i * 2, 4 - i, 20 - i * 4, 1, 0xb4583a);
      r(b, 15, 0, 2, 5, 0x2a2a2a); r(b, 13, 1, 6, 1, 0x2a2a2a);
      r(b, 12, 28, 8, 8, 0xe0d6c0); ov(b, 16, 32, 3.5, 3.5, 0xf0ece0); line(b, 16, 32, 16, 29, 0x1a1a1a); line(b, 16, 32, 18, 33, 0x1a1a1a);
      r(b, 14, 46, 4, 8, 0x2a2018); ov(b, 16, 46, 2, 2, 0x2a2018);
      outline(b, 0x4a3a24); put('torre', b);
    }
    { const b = img(16, 16); for (let i = 0; i < 5; i++) { const x = 3 + rr.int(10), y = 5 + rr.int(8); ov(b, x, y, 1.5, 1.8, 0x5a2a5a); p(b, x, y - 1, 0x7a4a7a); } put('higos', b); }
    { const b = shadowed(28, 22, 14, 17, 13, 3); ov(b, 14, 13, 13, 7, 0x9a9488); ov(b, 14, 12, 11, 5.5, 0x3fb4b0); ov(b, 12, 11, 4, 1.5, 0x9ae8e0); ov(b, 17, 13, 2, 1, 0xd8fff8); for (let i = 0; i < 6; i++) ov(b, 3 + i * 4, 15 + (i % 2), 2, 1.5, 0xb0a898); outline(b, 0x3a3830); put('manantial', b); }
    { const b = shadowed(20, 30, 10, 28, 4, 1.5); r(b, 9, 10, 2, 18, 0x8a8a8a); r(b, 1, 2, 18, 9, 0x2a7a3a); r(b, 2, 3, 16, 7, 0x3a9a4a); r(b, 3, 6, 14, 1, 0xf0f0f0); r(b, 3, 4, 6, 1, 0xf0f0f0); outline(b, 0x1a1a1a); put('senal', b); }
    { const b = img(16, 24); r(b, 2, 0, 12, 22, 0x6e6c66); r(b, 4, 2, 8, 18, 0x4a4a44); for (let y = 3; y < 20; y += 3) r(b, 4, y, 8, 1, 0x3a3a34); outline(b, 0x2a2a26); put('compuerta', b); }
    makeInterior(rr);
  }

  function makeInterior(rr) {

    {
      // Estanterías llenas de libros (habitación 1)
      const lomos = [0xa83a2a, 0x2a4a8a, 0xe0c890, 0x3a6a3a, 0x6a3a6a, 0xc87a30, 0x2a2a2a, 0xd8d0c0, 0x8a5a2e, 0x4a7a8a];
      for (let v = 0; v < 2; v++) {
        const e = img(32, 36);
        r(e, 0, 0, 32, 36, 0x5a3418); r(e, 1, 1, 30, 34, 0x3a2010);
        for (let sh = 0; sh < 4; sh++) {
          const y0 = 2 + sh * 8;
          r(e, 1, y0 + 7, 30, 1, 0x6a4024);
          let x = 2;
          while (x < 30) {
            const w = 1 + rr.int(3), h = 4 + rr.int(3), c = lomos[rr.int(lomos.length)];
            if (rr.next() < 0.12 && x < 26) { r(e, x, y0 + 5, 4, 2, c); x += 5; continue; }
            r(e, x, y0 + 7 - h, w, h, c); p(e, x, y0 + 7 - h, Px.shade(c, 1.3)); x += w;
          }
        }
        outline(e, 0x1a0e06); put('estanteria' + v, e);
      }
      for (let v = 0; v < 2; v++) {
        const pl = img(16, 16);
        let y = 14;
        for (let i = 0; i < 4 + v * 2; i++) { const w = 9 + rr.int(4), x = 3 + rr.int(3) - 1, c = lomos[rr.int(lomos.length)]; r(pl, x, y - 2, w, 2, c); r(pl, x, y - 2, w, 1, Px.shade(c, 1.25)); y -= 2; }
        outline(pl, 0x1a0e06); put('pila_libros' + v, pl);
      }
      // Chimenea de piedra en la pared izquierda del salón, vista de lado
      const ch = img(18, 50);
      voronoi(ch, 0, 0, 12, 50, 9, [0xc9a46c, 0xb48e56, 0xd6b47c, 0xa88650], 0x8a6e48, rr);
      r(ch, 8, 16, 10, 26, 0x6a5040); r(ch, 9, 18, 8, 22, 0x1a1210);
      ov(ch, 12, 33, 3, 5, 0xe86a20); ov(ch, 12, 35, 2, 3, 0xf8b030); ov(ch, 12, 37, 1, 1.5, 0xfff0a0);
      r(ch, 10, 38, 6, 2, 0x5a3a20);
      r(ch, 8, 14, 10, 3, 0x8a6a4a); r(ch, 8, 42, 10, 3, 0x8a6a4a);
      outline(ch, 0x3a2a1a); put('chimenea_lat', ch);
      // Encimera de cocina pegada a la pared derecha (vista de arriba)
      const en = img(16, 16);
      r(en, 0, 0, 16, 16, 0x8a8a86); speck(en, 0, 0, 16, 16, 0x5a5a56, 0.4, rr); speck(en, 0, 0, 16, 16, 0xc0c0bc, 0.2, rr);
      r(en, 0, 0, 2, 16, 0x6a6a66); r(en, 14, 0, 2, 16, 0x7a4a26);
      put('encimera_lat', en);
      const fr = Px.copy(en); r(fr, 3, 3, 9, 10, 0xb8bcc0); r(fr, 4, 4, 7, 8, 0x8a9094); r(fr, 12, 7, 2, 2, 0xd0d0d0); put('fregadero_lat', fr);
      const fo = Px.copy(en); for (const [x, y] of [[5, 4], [10, 4], [5, 11], [10, 11]]) { ov(fo, x, y, 2.5, 2.5, 0x2a2a2a); ov(fo, x, y, 1.2, 1.2, 0x5a5a5a); } put('fogones_lat', fo);
    }
    put('cama_gris', bed(0x8e939e, 0xc8ccd4, 0x1e1e22, true));
    put('cama_rosa', bed(0xd8b0c0, 0xece4e8, 0xb89870, false));
    put('cama_blanca', bed(0xf0eee8, 0xffffff, 0xc8a878, false));
    put('cama_lila', bed(0xc8a8d8, 0xe8d8f0, 0xe8e4dc, false));
    { const b = img(14, 16); r(b, 1, 2, 12, 12, 0x7a4a2a); r(b, 1, 2, 12, 2, 0x9a6438); r(b, 2, 7, 10, 1, 0x5a3420); r(b, 6, 5, 2, 1, 0xc8a040); r(b, 6, 10, 2, 1, 0xc8a040); r(b, 8, 0, 3, 3, 0x2a7ad0); outline(b, 0x2a1a10); put('mesita', b); }
    {
      const b = img(34, 26);
      r(b, 1, 10, 32, 8, 0xd8ccb0); r(b, 1, 10, 32, 1, 0xece4d0); r(b, 2, 18, 2, 7, 0x8a8a8a); r(b, 30, 18, 2, 7, 0x8a8a8a);
      r(b, 4, 2, 11, 8, 0x1a1a1e); r(b, 5, 3, 9, 6, 0x6a8a6a); p(b, 7, 5, 0xc0d0a0); p(b, 10, 4, 0x9ab07a);
      r(b, 17, 0, 14, 10, 0x1a1a1e); r(b, 18, 1, 12, 8, 0x283848); for (let y = 2; y < 8; y += 2) r(b, 19, y, 5 + rr.int(5), 1, 0xb0c8e0);
      r(b, 23, 10, 2, 1, 0x3a3a3a); r(b, 8, 12, 10, 3, 0x2a2a2a); r(b, 20, 12, 8, 2, 0x3a3a3a); ov(b, 29, 13, 1.5, 1.5, 0xf0f0f0);
      outline(b, 0x2a2420); put('escritorio', b);
    }
    { const b = img(14, 16); r(b, 2, 0, 10, 7, 0x2a2a2e); r(b, 1, 7, 12, 4, 0x3a3a40); r(b, 6, 11, 2, 3, 0x6a6a6a); r(b, 2, 14, 10, 1, 0x4a4a4a); outline(b, 0x101012); put('silla_oficina', b); }
    {
      const b = img(16, 30);
      ov(b, 8, 7, 7, 7, 0x5a5a5a); ov(b, 8, 7, 5.5, 5.5, 0x8a8a8a);
      for (let i = 0; i < 4; i++) line(b, 8, 7, 8 + Math.floor(Math.cos(i * 1.57 + 0.4) * 5), 7 + Math.floor(Math.sin(i * 1.57 + 0.4) * 5), 0xc8c8c8);
      ov(b, 8, 7, 1.5, 1.5, 0x2a2a2a); r(b, 7, 14, 2, 13, 0x2a2a2a); r(b, 3, 27, 10, 2, 0x2a2a2a);
      outline(b, 0x101010); put('ventilador', b);
    }
    {
      const b = img(32, 30);
      r(b, 1, 14, 30, 15, 0x7a4a2a); r(b, 1, 14, 30, 2, 0xe0dcd0);
      for (let y = 18; y < 29; y += 4) { r(b, 2, y, 28, 1, 0x5a3420); r(b, 8, y + 2, 3, 1, 0xc8a040); r(b, 21, y + 2, 3, 1, 0xc8a040); }
      r(b, 9, 0, 14, 14, 0xf0f0f0); r(b, 10, 1, 12, 12, 0x9ab0b8); for (let x = 10; x < 22; x += 3) { p(b, x, 1, 0xfff8d0); p(b, x, 12, 0xfff8d0); }
      for (let i = 0; i < 6; i++) r(b, 2 + i, 8 - (i % 3), 1, 6 + (i % 3), [0xa83a2a, 0x2a4a8a, 0xe0c890, 0x3a6a3a][i % 4]);
      r(b, 24, 9, 4, 5, 0xe0c890); r(b, 25, 10, 2, 3, 0x6a8aa8);
      outline(b, 0x2a1a10); put('comoda', b);
    }
    { const b = img(30, 18); r(b, 1, 2, 28, 15, 0xe8d8b0); r(b, 1, 2, 28, 2, 0xf4ead0); for (let y = 6; y < 17; y += 4) { r(b, 2, y, 26, 1, 0xc8b48c); p(b, 9, y + 2, 0xc8a040); p(b, 20, y + 2, 0xc8a040); } outline(b, 0x6a5a3a); put('comoda_clara', b); }
    {
      const b = img(32, 20);
      r(b, 1, 4, 30, 15, 0x6a6a30); for (let x = 1; x < 31; x += 2) r(b, x, 4, 1, 15, x % 4 === 1 ? 0x7a7a3a : 0x5a5a28);
      r(b, 1, 3, 30, 3, 0x8a7a38); for (let x = 4; x < 31; x += 8) r(b, x, 3, 2, 16, 0xc8a850);
      r(b, 14, 7, 4, 4, 0x2a2a2a); r(b, 1, 4, 3, 3, 0xd8b860);
      outline(b, 0x2a2410); put('baul', b);
      const o = copy(b); r(o, 2, 0, 28, 5, 0x5a5a28); r(o, 3, 5, 26, 5, 0x1a1408); put('baul_abierto', o);
    }
    { const b = img(16, 12); r(b, 1, 6, 14, 5, 0xf0e8e8); for (let x = 2; x < 15; x += 3) p(b, x, 8, 0xe8a0a0); r(b, 2, 3, 12, 3, 0xe8889a); r(b, 3, 0, 10, 3, 0xf4f0f0); outline(b, 0x8a6a6a); put('toallas', b); }
    { const b = img(16, 26); r(b, 1, 16, 9, 9, 0x40b8d0); r(b, 1, 16, 9, 2, 0x70d8e8); line(b, 12, 0, 9, 22, 0x2a4a9a); for (let i = 0; i < 6; i++) line(b, 9, 22, 6 + i, 25, 0x40a040); outline(b, 0x1a3a40); put('cubo', b); }
    {
      const b = img(14, 18); r(b, 2, 0, 10, 6, 0xf4f4f0); ov(b, 7, 11, 5, 5, 0xf4f4f0); ov(b, 7, 11, 3, 3.2, 0xd8e8e8); outline(b, 0x8a8a88); put('vater', b);
      const d = img(14, 14); ov(d, 7, 8, 5, 5, 0xf4f4f0); ov(d, 7, 8, 3, 3, 0xd0e0e0); r(d, 6, 1, 2, 3, 0xc0c0c0); outline(d, 0x8a8a88); put('bide', d);
      const s = img(32, 22);
      r(s, 1, 6, 30, 15, 0x3a2a24); r(s, 1, 0, 30, 8, 0xf8f8f8); ov(s, 16, 4, 9, 3, 0xe0e8e8); r(s, 15, 0, 2, 2, 0xc0c0c0);
      r(s, 3, 1, 2, 4, 0xf0f0f0); r(s, 25, 0, 3, 5, 0x5ab06a); for (let y = 11; y < 21; y += 4) r(s, 12, y, 8, 1, 0xd0d0d0);
      outline(s, 0x1a1414); put('lavabo', s);
      const sh = img(30, 30);
      ov(sh, 15, 15, 14, 14, 0xf0f0f0); r(sh, 0, 0, 30, 15, 0xf0f0f0); r(sh, 0, 0, 15, 30, 0xf0f0f0);
      ov(sh, 13, 13, 11, 11, 0xd8e4e8); r(sh, 2, 2, 11, 11, 0xd8e4e8);
      for (let i = 0; i < 4; i++) line(sh, 4 + i * 6, 2, 4 + i * 6, 26, 0xc0d0d8);
      r(sh, 4, 4, 2, 6, 0x2a2a2a); r(sh, 7, 4, 2, 5, 0x5ab06a);
      outline(sh, 0x8a9498); put('ducha', sh);
      const m = img(16, 30); r(m, 1, 0, 14, 30, 0x2e2420); r(m, 3, 2, 10, 14, 0xc8d4d8); r(m, 3, 18, 10, 10, 0x3a2e28); r(m, 11, 22, 1, 3, 0xc0c0c0); outline(m, 0x100c0a); put('mueble_bano', m);
    }
    {
      const b = img(16, 18);
      r(b, 0, 0, 16, 7, 0x8a8a86); speck(b, 0, 0, 16, 7, 0x5a5a56, 0.4, rr); speck(b, 0, 0, 16, 7, 0xc0c0bc, 0.2, rr);
      r(b, 0, 7, 16, 11, 0x7a4a26); r(b, 1, 9, 6, 7, 0x6a3e20); r(b, 9, 9, 6, 7, 0x6a3e20); p(b, 6, 12, 0xc8a040); p(b, 9, 12, 0xc8a040);
      put('encimera', b);
      const s = copy(b); r(s, 3, 1, 10, 5, 0xb8bcc0); r(s, 4, 2, 8, 3, 0x8a9094); r(s, 7, 0, 2, 2, 0xd0d0d0); put('fregadero', s);
      const f = img(18, 34);
      r(f, 1, 0, 16, 33, 0xa8acb0); r(f, 1, 0, 16, 2, 0xc8ccd0); r(f, 1, 12, 16, 1, 0x7a7e82); r(f, 14, 4, 1, 6, 0x5a5e62); r(f, 14, 15, 1, 10, 0x5a5e62);
      for (let i = 0; i < 4; i++) r(f, 3 + i * 3, 3 + (i % 2) * 3, 2, 2, [0xe03a2a, 0x2a8ae0, 0xf0c020, 0x40b040][i]);
      outline(f, 0x3a3e42); put('frigo', f);
      const t = img(64, 34);
      r(t, 2, 4, 60, 22, 0xf0e8d8);
      for (let i = 0; i < 60; i++) p(t, 2 + rr.int(60), 4 + rr.int(22), rr.bool() ? 0xb8a890 : 0xd8b8c0);
      r(t, 2, 26, 60, 3, 0xe0d8c8); for (let x = 4; x < 60; x += 4) p(t, x, 28, 0xc8b8a8);
      for (let i = 0; i < 3; i++) { const cx = 12 + i * 18; ov(t, cx, 14, 6, 4, 0xf4f0e8); for (let k = 0; k < 7; k++) ov(t, cx - 4 + rr.int(8), 13 + rr.int(3), 1.8, 1.6, i === 1 ? 0xe8c040 : 0xd83a28); }
      ov(t, 52, 20, 3, 2.5, 0x5a8a3a); r(t, 30, 21, 6, 2, 0x4a9a3a);
      r(t, 6, 29, 2, 5, 0x5a3420); r(t, 56, 29, 2, 5, 0x5a3420);
      for (let x = 6; x < 60; x += 12) { r(t, x, 0, 6, 4, 0x6a4024); r(t, x, 30, 6, 4, 0x6a4024); }
      outline(t, 0x3a2414); put('mesa_larga', t); put('mesa_larga_v', Px.rot90(t));
    }
    {
      const s = img(48, 18);
      r(s, 0, 0, 48, 7, 0x1e2230); r(s, 0, 7, 48, 9, 0x2a3044); r(s, 0, 7, 48, 1, 0x3a4258); for (let x = 16; x < 48; x += 16) r(s, x, 8, 1, 8, 0x1a1e2a);
      r(s, 0, 2, 3, 14, 0x1e2230); r(s, 45, 2, 3, 14, 0x1e2230);
      outline(s, 0x0a0c12); put('sofa_n', Px.flipV(s)); put('sofa', s); put('sofa_v', Px.rot90(s));
      const m = img(34, 30);
      ov(m, 17, 14, 16, 12, 0xd8d8d8); ov(m, 17, 13, 15, 10.5, 0xf0f0ee);
      r(m, 3, 18, 28, 10, 0xd0d0d4); for (let x = 4; x < 31; x += 4) r(m, x, 22, 1, 6, 0xa8a8b0);
      r(m, 12, 8, 3, 6, 0xc89838); r(m, 19, 9, 2, 5, 0xe8e0d0); r(m, 23, 10, 4, 2, 0x2a2a2a);
      outline(m, 0x6a6a70); put('mesa_camilla', m);
      const tv = img(34, 18); r(tv, 0, 0, 34, 18, 0x101012); r(tv, 2, 2, 30, 14, 0x203040); r(tv, 4, 4, 10, 8, 0x5a6a7a); r(tv, 16, 5, 13, 3, 0xe8e8e8); r(tv, 2, 13, 30, 2, 0xe8c020); put('tele', tv);
      const ch = img(12, 18);
      r(ch, 2, 0, 8, 9, 0x7a4a26); for (let x = 3; x < 10; x += 2) r(ch, x, 1, 1, 7, 0x5a3418); r(ch, 1, 9, 10, 4, 0xb0a090); for (let x = 2; x < 11; x += 2) p(ch, x, 10, 0x6a5a4a);
      r(ch, 2, 13, 1, 5, 0x5a3418); r(ch, 9, 13, 1, 5, 0x5a3418);
      outline(ch, 0x2a1a0c); put('silla', ch);
      const ar = img(18, 18); r(ar, 0, 0, 18, 7, 0x1e2a44); r(ar, 2, 7, 14, 8, 0x2a3a5a); r(ar, 0, 4, 3, 12, 0x6a4024); r(ar, 15, 4, 3, 12, 0x6a4024); outline(ar, 0x0a0e18); put('butaca', ar);
      const dt = img(30, 22);
      r(dt, 1, 2, 28, 14, 0x3a2418); r(dt, 1, 2, 28, 1, 0x5a3a28); r(dt, 3, 4, 24, 10, 0xece4d8); for (let x = 4; x < 27; x += 3) p(dt, x, 13, 0xd0c8bc);
      r(dt, 6, 6, 5, 3, 0x6a6a6a); r(dt, 14, 7, 6, 2, 0x2a2a2a); r(dt, 3, 16, 2, 6, 0x2a1810); r(dt, 25, 16, 2, 6, 0x2a1810);
      outline(dt, 0x140c08); put('mesa_oscura', dt);
      const es = img(24, 22); r(es, 1, 2, 22, 20, 0x3a3a3c); r(es, 3, 5, 18, 10, 0x1a1a1a); r(es, 5, 7, 14, 7, 0x6a3a1a); ov(es, 12, 11, 4, 2.5, 0xe86a20); r(es, 1, 0, 22, 3, 0x6a5040); outline(es, 0x101010); put('estufa', es);
    }
    {
      const a = img(16, 14); line(a, 2, 2, 13, 2, 0x1a1a1a); p(a, 1, 1, 0x1a1a1a); p(a, 14, 1, 0x1a1a1a); r(a, 6, 2, 4, 3, 0x5a3a20); r(a, 5, 5, 6, 6, 0xa85a30); r(a, 6, 6, 4, 4, 0xf0d890); put('aplique', a);
      const c = img(18, 22); r(c, 0, 0, 18, 22, 0xc8c8c0); r(c, 1, 1, 16, 20, 0xd8dcd0);
      for (let i = 0; i < 10; i++) ov(c, 3 + rr.int(12), 2 + rr.int(9), 2, 2, i % 3 === 0 ? 0xe8e4d4 : 0xf8f8f0);
      ov(c, 9, 14, 3, 4, 0xc89878); r(c, 6, 17, 7, 4, 0x2a2a2a); put('cuadro', c);
      const w = img(22, 16);
      r(w, 0, 0, 22, 16, 0x9a6a36); r(w, 5, 2, 12, 12, 0xa8d8f0); for (let x = 6; x < 17; x += 3) r(w, x, 2, 1, 12, 0x1a1a1a); r(w, 5, 8, 12, 1, 0x1a1a1a);
      r(w, 0, 1, 4, 14, 0xa87a44); r(w, 18, 1, 4, 14, 0xa87a44); for (let y = 3; y < 14; y += 2) { r(w, 0, y, 4, 1, 0x8a5a2e); r(w, 18, y, 4, 1, 0x8a5a2e); }
      put('ventana_int', w);
      const lamp = img(14, 18); r(lamp, 2, 15, 10, 3, 0xf0f0f0); r(lamp, 6, 3, 2, 13, 0xf0f0f0); r(lamp, 2, 1, 10, 3, 0xf8f8f8); line(lamp, 7, 16, 12, 17, 0x2a2a2a); outline(lamp, 0x8a8a8a); put('flexo', lamp);
      const pl = img(16, 18); r(pl, 4, 10, 8, 7, 0xa85a30); for (let i = 0; i < 8; i++) ov(pl, 4 + rr.int(8), 3 + rr.int(7), 2.5, 2, i % 2 === 0 ? 0x4a8a3a : 0x6aaa4a); p(pl, 6, 4, 0xe0405a); p(pl, 10, 6, 0xe0405a); outline(pl, 0x2a3a1a); put('maceta', pl);
      const col = img(16, 34); voronoi(col, 0, 0, 16, 34, 9, [0xc9a46c, 0xb48e56, 0xd6b47c, 0xa88650], 0x8a6e48, rr); outline(col, 0x5a4428); put('columna', col);
      const ag = img(10, 14); r(ag, 1, 3, 8, 10, 0x3a7ad0); r(ag, 2, 4, 2, 8, 0x8ab8f0); r(ag, 3, 0, 4, 3, 0x2a5aa0); outline(ag, 0x1a3a6a); put('garrafa', ag);
    }
  }

  Art.init = function () {
    for (let id = 0; id < T.COUNT; id++) {
      Art.tiles[id] = [];
      for (let v = 0; v < VAR; v++) {
        const frames = (id === T.WATER || id === T.DEEP) ? 4 : 1;
        Art.tiles[id][v] = [];
        for (let f = 0; f < frames; f++) { R = RNG(id * 1000 + v * 37 + 11); Art.tiles[id][v][f] = makeTile(id, v, f); }
      }
      Art.tileColor[id] = average(Art.tiles[id][0][0]);
    }
    makeCharacters();
    makeProps();
    Art.H = { shadowed, canopy, put, vehicle };
  };
  Art.tile = function (id, x, y, frame) {
    if (Art.atlasIds && Art.atlasIds.has(id)) { const f = Art.tiles[id][(x & 3) + ((y & 3) << 2)]; return f[frame % f.length]; }
    const v = ((Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0) % VAR;
    const f = Art.tiles[id][v];
    return f[frame % f.length];
  };
})();
