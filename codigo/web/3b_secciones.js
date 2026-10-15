// ====================================================================== secciones del mundo (se generan al entrar por primera vez)
// 2 · La carretera del pantano: cañón del Guadalentín, Hotel Los Nogales (km 6, sobre el cortado de los buitres)
// 3 · La Bolera: el embalse, la presa, El Hornico y la cascada de Guazalamanco
const WS = (function () {
  const S = {};
  const A = (n, x, y, w, h) => new Area(n, x, y, w, h);
  const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) & 0xffffff) / 0x1000000; };
  function vnoise(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y); let fx = x - xi, fy = y - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; }
  const fbm = (x, y, s) => 0.5 * vnoise(x / 18, y / 18, s) + 0.3 * vnoise(x / 8, y / 8, s + 1) + 0.2 * vnoise(x / 3.5, y / 3.5, s + 2);
  const plateau = (y, c, half, taper) => { const d = Math.abs(y - c); if (d <= half) return 1; if (d >= half + taper) return 0; const t = 1 - (d - half) / taper; return t * t * (3 - 2 * t); };
  function road(w, res, pts, width, tile) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
      for (let s = 0; s <= steps; s++) {
        const t = s / steps, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
        for (let dy = 0; dy < width; dy++) for (let dx = 0; dx < width; dx++) {
          const tx = Math.round(x - width / 2 + dx), ty = Math.round(y - width / 2 + dy);
          if (tx < 0 || ty < 0 || tx >= w.w || ty >= w.h) continue;
          const cur = w.get(tx, ty);
          if (T.isWater(cur)) w.set(tx, ty, T.BRIDGE); else if (cur !== T.DAM) w.set(tx, ty, tile);
          res[ty * w.w + tx] = 1;
        }
      }
    }
  }
  const npc = (w, name, key, tx, ty, dir) => { w.npcs.push(new Npc(name, key, Art.people[key], null, null, tx * 16 + 8, ty * 16 + 13, dir)); w.block(tx, ty, 1, 1); };
  const sign = (w, res, x, y, text) => { const p = w.prop('senal', x, y, x, y, 1, 1); p.id = 'cartel:' + text; res[y * w.w + x] = 1; };
  function scatter(w, res, seed, fn) {
    const r = RNG(seed);
    for (let y = 1; y < w.h - 1; y++) for (let x = 1; x < w.w - 1; x++) {
      if (res[y * w.w + x] || w.blk[y * w.w + x] || T.SOLID[w.get(x, y)]) continue;
      fn(x, y, r, w.get(x, y));
    }
  }
  function border(w) { for (let x = 0; x < w.w; x++) { w.set(x, 0, T.MOUNTAIN); w.set(x, w.h - 1, T.MOUNTAIN); } for (let y = 0; y < w.h; y++) { w.set(0, y, T.MOUNTAIN); w.set(w.w - 1, y, T.MOUNTAIN); } }
  function lair(w, name, x, y, kinds, tier) {
    const water = kinds.includes(MK.AHOGADO);
    for (let rr = 0; rr < 8; rr++) for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) {
      const tx = Math.round(x) + dx, ty = Math.round(y) + dy;
      if (water ? T.isWater(w.get(tx, ty)) && w.get(tx, ty) !== T.DEEP : !w.solid(tx, ty)) { w.lairs.push({ name, x: tx, y: ty, kinds, tier, active: false, cleared: false }); return; }
    }
  }
  function keepPath(w, xFn, y0, y1) { // senda siempre libre de árboles
    for (let y = y0; y < y1; y++) { const x = Math.round(xFn(y)); for (const xx of [x, x + 1]) { const before = w.props.length; w.props = w.props.filter(pp => pp.id || !(Math.floor(pp.x / 16) === xx && Math.floor((pp.y - 1) / 16) === y)); if (before !== w.props.length) w.unblock(xx, y, 1, 1); } }
  }
  function campfire(w, x, y, id) { const f = new Prop(Art.campfire[0], x * 16 + 8, y * 16 + 15); f.anim = 1; f.id = id; w.props.push(f); w.block(x, y, 1, 1); }

  // ================================================================== 2 · LA CARRETERA DEL PANTANO
  S.pantano = function () {
    const W = 120, H = 180, w = new World('pantano', W, H, T.GRASS), res = new Uint8Array(W * H);
    w.outdoor = true; w.defaultArea = 'Carretera del pantano'; w.lairs = []; w.birds = [];
    const rvx = y => 80 + 8 * Math.sin(y * 0.03) + 3 * Math.sin(y * 0.1 + 1);
    S.prvx = rvx;
    const gorge = y => plateau(y, 70, 52, 18);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const n = fbm(x, y, 3), d = x - rvx(y), g = gorge(y), floor = 2.6 + (1 - g) * 8, wall = g > 0.35 ? 3 + fbm(x, y, 9) * 4 : 0;
      let t = n > 0.6 ? T.DIRT : T.GRASS;
      if (Math.abs(d) <= floor) t = n > 0.55 ? T.SAND : T.GRASS_GREEN;
      else if (Math.abs(d) <= floor + wall) t = T.CLIFF;
      else if (d > 0 && fbm(x * 1.2, y * 1.2, 7) > 0.66) t = T.CLIFF; // cárcavas al otro lado
      else if (d < 0 && fbm(x * 1.4, y * 1.4, 17) > 0.74 && x < 40) t = T.MOUNTAIN; // peñas en el pinar
      w.set(x, y, t);
    }
    for (let y = 1; y < H - 1; y++) { const x0 = Math.round(rvx(y)) - 1, ww = 2 + (fbm(0, y, 13) > 0.62 ? 1 : 0); for (let x = x0; x < x0 + ww; x++) w.set(x, y, fbm(x, y, 31) > 0.7 ? T.DEEP : T.WATER); }
    // la carretera, con sus curvas, por el lado oeste
    const rpts = [[50, 179], [48, 160], [54, 142], [46, 124], [44, 104], [48, 86], [46, 66], [52, 46], [48, 26], [54, 8], [56, 0]];
    road(w, res, rpts, 3, T.ASPHALT);
    [[47, 150, 'km 2'], [43, 112, 'km 4'], [45, 74, 'km 6 · Hotel Los Nogales'], [51, 34, 'km 8 · La Bolera']].forEach(([x, y, t]) => sign(w, res, x, y, 'A-326 · ' + t));
    // ---------------- Hotel Los Nogales
    const hx0 = 56, hy0 = 60;
    for (let y = hy0 - 2; y <= hy0 + 34; y++) for (let x = 51; x <= 76; x++) { if (!T.isWater(w.get(x, y)) && w.get(x, y) !== T.ASPHALT) w.set(x, y, T.GRASS_GREEN); res[y * W + x] = 1; }
    w.fill(51, hy0 + 4, 6, 12, T.ASPHALT); // aparcamiento
    w.prop('furgo', 53, hy0 + 6, 52, hy0 + 6, 2, 1); w.prop('todoterreno', 53, hy0 + 10, 52, hy0 + 10, 2, 1); w.prop('furgo', 55, hy0 + 14, 54, hy0 + 14, 2, 1);
    for (let y = hy0; y <= hy0 + 2; y++) for (let x = hx0 + 2; x <= hx0 + 16; x++) w.set(x, y, T.ROOF);
    for (let x = hx0 + 2; x <= hx0 + 16; x++) { w.set(x, hy0 + 3, T.WALL_WHITE); w.set(x, hy0 + 4, T.WALL_STONE); }
    for (const x of [hx0 + 3, hx0 + 6, hx0 + 12, hx0 + 15]) { w.set(x, hy0 + 3, T.WINDOW); }
    for (const x of [hx0 + 4, hx0 + 13]) w.set(x, hy0 + 4, T.WINDOW);
    S.hotelDoor = [hx0 + 9, hy0 + 4]; w.set(hx0 + 9, hy0 + 4, T.DOOR);
    const hd = w.prop('compuerta', hx0 + 9, hy0 + 4); hd.hidden = true; hd.id = 'hotel_puerta';
    w.fill(hx0 + 2, hy0 + 5, 15, 2, T.PORCH);
    for (const x of [hx0 + 2, hx0 + 8, hx0 + 16]) w.prop('pilar', x, hy0 + 5, x, hy0 + 5, 1, 1);
    w.prop('mesaporche', hx0 + 5, hy0 + 6, hx0 + 4, hy0 + 6, 2, 1); w.prop('mesaporche', hx0 + 12, hy0 + 6, hx0 + 11, hy0 + 6, 2, 1);
    campfire(w, hx0 + 14, hy0 + 7, 'hoguera_hotel'); S.hotelFire = [hx0 + 14, hy0 + 8];
    w.prop('farola', hx0 + 1, hy0 + 7).light = 1; w.prop('farola', hx0 + 17, hy0 + 7).light = 1;
    sign(w, res, 50, hy0 + 2, 'HOTEL LOS NOGALES ★★★ · Restaurante · Piscina · Pista de pádel · Observatorio de aves');
    // piscina
    w.fill(hx0 + 10, hy0 + 9, 8, 6, T.CONCRETE); w.fill(hx0 + 11, hy0 + 10, 6, 4, T.POOL);
    // pista de pádel (dibujo bajo todo) y la red para jugar
    S.padel = [hx0, hy0 + 16];
    w.fill(hx0, hy0 + 16, 8, 11, T.CONCRETE);
    w.decor.push({ img: Art.padel, x: hx0 * 16, y: (hy0 + 16) * 16 });
    const red = w.prop('compuerta', hx0 + 4, hy0 + 21); red.hidden = true; red.id = 'padel';
    // los nogales
    for (const [x, y] of [[hx0 + 11, hy0 + 18], [hx0 + 16, hy0 + 17], [hx0 + 12, hy0 + 24], [hx0 + 17, hy0 + 23], [hx0 + 14, hy0 + 30], [hx0 + 3, hy0 + 31], [hx0 + 9, hy0 + 32]]) w.prop('nogal' + ((x + y) & 1), x, y, x, y, 1, 1);
    // observatorio de aves sobre el cortado
    S.observatorio = [Math.round(rvx(hy0 + 12)) - 9, hy0 + 12];
    for (let y = S.observatorio[1] - 2; y <= S.observatorio[1] + 2; y++) for (let x = S.observatorio[0] - 3; x <= S.observatorio[0] + 2; x++) { if (w.get(x, y) === T.CLIFF) w.set(x, y, T.DIRT); res[y * W + x] = 1; }
    w.prop('observatorio', S.observatorio[0], S.observatorio[1], S.observatorio[0] - 1, S.observatorio[1], 2, 1).id = 'observatorio';
    w.birds.push({ cx: (rvx(hy0 + 12) + 2) * 16, cy: (hy0 + 10) * 16, r: 70, n: 6 });
    w.birds.push({ cx: (rvx(hy0 + 40) + 2) * 16, cy: (hy0 + 40) * 16, r: 50, n: 3 });
    npc(w, 'Doña Pura', 'gerente', hx0 + 10, hy0 + 6, 0);
    npc(w, 'Manuel', 'manuel', hx0 + 4, hy0 + 15, 0);
    // ---------------- Venta del Pantano, en ruinas
    for (let y = 138; y <= 143; y++) for (let x = 56; x <= 63; x++) { w.set(x, y, T.DIRT); res[y * W + x] = 1; }
    for (let x = 57; x <= 62; x++) { w.set(x, 138, x % 3 ? T.ROOF_DARK : T.DIRT); w.set(x, 139, T.WALL_WHITE); }
    w.set(59, 139, T.WINDOW); w.set(61, 139, T.DOOR);
    w.prop('chatarra1', 57.5, 141, 57, 141, 2, 1); w.prop('chatarra3', 61.5, 142, 61, 142, 2, 1);
    sign(w, res, 55, 141, 'VENTA DEL PANTANO · Comidas caseras. (Debajo, a rotulador: "no entréis, están dentro")');
    // ---------------- vegetación
    scatter(w, res, 7, (x, y, r, t) => {
      const d = x - rvx(y), g = gorge(y);
      if (Math.abs(d) < 5 && !T.isWater(t)) { if (r.next() < 0.08) w.prop('canas', x, y); else if (r.next() < 0.05) w.prop('chopo' + r.int(2), x, y, x, y, 1, 1); return; }
      if (d < 0 && x < 44) { if (r.next() < 0.2) w.prop('pino' + r.int(3), x, y, x, y, 1, 1); else if (r.next() < 0.02) w.prop('roca_musgo' + r.int(2), x, y, x, y, 1, 1); return; }
      if (d > 0) { if (r.next() < 0.03) w.prop('arbol_muerto' + r.int(2), x, y, x, y, 1, 1); else if (r.next() < 0.04) w.prop('retama' + r.int(3), x, y, x, y, 1, 1); else if (r.next() < 0.005) w.prop('huesos', x, y); return; }
      if (y > 140 && x % 3 === 0 && y % 3 === 1 && r.next() < 0.85) w.prop('olivo' + r.int(3), x, y, x, y, 1, 1);
      else if (r.next() < 0.04) w.prop('retama' + r.int(3), x, y, x, y, 1, 1);
      else if (r.next() < 0.03) w.prop('pino' + r.int(3), x, y, x, y, 1, 1);
    });
    keepPath(w, y => rvx(y) + 2, 2, H - 2); keepPath(w, y => rvx(y) - 2.5, 2, H - 2);
    for (let y = 2; y < H - 2; y++) for (const xx of [Math.round(rvx(y)) - 2, Math.round(rvx(y)) + 2]) if (w.get(xx, y) === T.CLIFF) w.set(xx, y, T.SAND); // orillas siempre andables
    for (const by of [60, 100, 128]) { const x0 = Math.round(rvx(by)) - 2; for (let x = x0; x <= x0 + 4; x++) { if (T.isWater(w.get(x, by))) w.set(x, by, T.BRIDGE); } } // pasarelas de madera
    w.pickups.push(new Pickup(Pickup.RELIC, (Math.round(rvx(95)) + 2) * 16 + 8, 95 * 16 + 8, 'reliquia_cortado'));
    border(w);
    // ---------------- salidas
    const south = new Warp(36, H - 2, 60, 1, 'exterior', 158 * 16 + 8, 3 * 16, 0); south.load = true; w.warps.push(south);
    const north = new Warp(44, 1, 20, 1, 'bolera', 54 * 16 + 8, 126 * 16, 1); north.load = true; w.warps.push(north);
    w.set(56, 0, T.ASPHALT);
    // ---------------- zonas y guaridas
    const hotel = A('Hotel Los Nogales', 50, hy0 - 2, 27, 37); hotel.safe = true; w.areas.push(hotel);
    w.areas.push(A('Observatorio de aves', S.observatorio[0] - 3, S.observatorio[1] - 3, 6, 6));
    w.areas.push(A('Venta del Pantano', 54, 136, 12, 9));
    const cort = A('El cortado de los buitres', 70, 40, 30, 60); cort.tier = 1.45; w.areas.push(cort);
    w.regionFn = (x, y) => { const a = A(y > 130 ? 'Olivares del pantano' : 'Cañón del Guadalentín', 0, 0, 0, 0); a.tier = y > 130 ? 1.3 : 1.45; return a; };
    lair(w, 'Olivar de la curva', 64, 165, [MK.JABALI, MK.JABALI, MK.HUECO], 1.3);
    lair(w, 'Los de la Venta', 60, 146, [MK.HUECO, MK.HUECO, MK.HUECO], 1.35);
    lair(w, 'Peñas del pinar', 30, 120, [MK.ALACRAN, MK.ALACRAN], 1.4);
    lair(w, 'Poza del cañón', rvx(150), 150, [MK.AHOGADO, MK.AHOGADO], 1.4);
    lair(w, 'Sombras del cortado', 66, 108, [MK.SOMBRA, MK.SOMBRA], 1.5);
    lair(w, 'Nido del pinar', 30, 60, [MK.NIDO, MK.HUECO], 1.5);
    lair(w, 'Cárcavas de enfrente', 100, 120, [MK.ALACRAN, MK.JABALI, MK.ALACRAN], 1.5);
    lair(w, 'Curva del km 8', 40, 30, [MK.JABALI, MK.SOMBRA], 1.55);
    w.mapTitle = 'La carretera del pantano';
    w.labels = [['Hotel Los Nogales', 64, 58], ['Observatorio', S.observatorio[0], S.observatorio[1] - 3], ['Venta del Pantano', 60, 136], ['Cañón del Guadalentín', 92, 100], ['↑ La Bolera', 54, 5], ['↓ Pozo Alcón', 50, 174]];
    return w;
  };

  // ================================================================== 3 · LA BOLERA
  S.bolera = function () {
    const W = 160, H = 130, w = new World('bolera', W, H, T.GRASS), res = new Uint8Array(W * H);
    w.outdoor = true; w.defaultArea = 'La Bolera'; w.lairs = []; w.birds = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const n = fbm(x, y, 41);
      let t = n > 0.58 ? T.DIRT : T.GRASS;
      let e = Math.pow((x - 100) / 58, 2) + Math.pow((y - 38) / 31, 2) - (fbm(x, y, 43) - 0.5) * 0.55;
      if (x >= 106 && x <= 134 && y >= 60 && y <= 75) e = Math.min(e, 0.6);
      if (e < 1) t = e < 0.62 ? T.DEEP : T.WATER; else if (e < 1.1) t = n > 0.5 ? T.SAND : T.DIRT;
      else if (fbm(x * 1.3, y * 1.3, 47) > 0.72) t = T.MOUNTAIN;
      w.set(x, y, t);
    }
    // la presa y la explanada de abajo (el sitio de la Bestia)
    for (let x = 102; x <= 138; x++) { w.set(x, 76, T.DAM); w.set(x, 77, T.DAM); w.set(x, 78, T.DAM); }
    for (let y = 79; y <= 92; y++) for (let x = 100; x <= 140; x++) {
      const edge = x < 103 || x > 137 || y >= 92;
      if (edge && !(x < 103 && y >= 83 && y <= 88)) w.set(x, y, T.CLIFF); else w.set(x, y, fbm(x, y, 5) > 0.68 ? T.SAND : T.CONCRETE);
      res[y * W + x] = 1;
    }
    for (let x = 106; x <= 134; x += 7) w.prop('compuerta', x, 78);
    S.bossX = 120; S.bossY = 86;
    for (let y = 93; y < H - 1; y++) { const x = 120 + Math.round(Math.sin(y * 0.15) * 3); w.set(x, y, T.WATER); w.set(x + 1, y, T.WATER); for (const dx of [-3, -2, 3, 4]) if (w.get(x + dx, y) !== T.WATER) w.set(x + dx, y, T.CLIFF); }
    // la cueva PB4, en la orilla de enfrente (Sierra de Castril)
    S.pb4 = [144, 70];
    for (let y = 66; y <= 74; y++) for (let x = 139; x <= 150; x++) { if (!T.isWater(w.get(x, y))) { w.set(x, y, x > 146 ? T.MOUNTAIN : T.DIRT); } res[y * W + x] = 1; }
    w.prop('cueva_pb4', S.pb4[0], S.pb4[1], S.pb4[0] - 1, S.pb4[1], 3, 1).id = 'cueva_pb4';
    // carreteras
    road(w, res, [[54, 129], [56, 112], [66, 100], [82, 95], [99, 86]], 3, T.ASPHALT);
    road(w, res, [[56, 112], [46, 102], [38, 92], [32, 80]], 2, T.TRACK);
    road(w, res, [[99, 86], [101, 80], [104, 77], [139, 77], [142, 72]], 2, T.TRACK);
    for (let x = 101; x <= 139; x++) { w.set(x, 77, T.ASPHALT); res[77 * W + x] = 1; } // coronación de la presa, transitable
    // ---------------- El Hornico
    for (let y = 58; y <= 92; y++) for (let x = 6; x <= 40; x++) { if (!T.isWater(w.get(x, y))) w.set(x, y, T.GRASS_GREEN); res[y * W + x] = 1; }
    // casa forestal de piedra
    for (let y = 60; y <= 62; y++) for (let x = 9; x <= 18; x++) w.set(x, y, T.ROOF);
    for (let x = 9; x <= 18; x++) { w.set(x, 63, T.WALL_STONE); w.set(x, 64, T.WALL_STONE); }
    w.set(11, 63, T.WINDOW); w.set(16, 63, T.WINDOW); w.set(13, 64, T.DOOR);
    const cf = w.prop('compuerta', 13, 64); cf.hidden = true; cf.id = 'hornico_casa';
    // aula de la naturaleza y casa de campamentos
    for (let y = 64; y <= 65; y++) for (let x = 23; x <= 34; x++) w.set(x, y, T.ROOF_DARK);
    for (let x = 23; x <= 34; x++) { w.set(x, 66, T.WALL_WHITE); w.set(x, 67, T.WALL_WHITE); }
    for (const x of [24, 27, 31, 33]) w.set(x, 66, T.WINDOW); w.set(29, 67, T.DOOR);
    const au = w.prop('compuerta', 29, 67); au.hidden = true; au.id = 'hornico_aula';
    sign(w, res, 21, 68, 'AULA DE LA NATURALEZA EL HORNICO · Jardín botánico · Campamentos');
    campfire(w, 30, 71, 'hoguera_hornico'); S.hornicoFire = [30, 72];
    w.prop('picnic', 34, 72, 33, 72, 2, 1); w.prop('picnic', 25, 72, 24, 72, 2, 1);
    w.prop('tienda', 37, 76, 36, 76, 2, 1); w.prop('tienda', 37, 80, 36, 80, 2, 1);
    w.prop('estatua', 20, 70, 20, 70, 1, 1);
    // jardín botánico
    for (let y = 75; y <= 89; y++) for (let x = 8; x <= 32; x++) w.set(x, y, (x % 5 === 0 || y % 5 === 0) ? T.TRACK : T.GRASS_GREEN);
    const plants = [['retama0', 'Retama (Spartium junceum)'], ['retama1', 'Centaurea mariana'], ['retama2', 'Phlomis lychnitis'], ['setas0', 'Hongos del pinar'], ['almendro0', 'Almendro'], ['cipres', 'Ciprés']];
    let pi = 0;
    for (let by = 76; by < 89; by += 5) for (let bx = 9; bx < 32; bx += 5) {
      if (bx === 19 && by === 81) continue;
      const [k, name] = plants[pi++ % plants.length];
      w.prop(k, bx + 2, by + 2, bx + 2, by + 2, 1, 1);
      if (pi % 2) sign(w, res, bx + 1, by + 3, 'Jardín botánico · ' + name);
    }
    S.agujas = [21, 83];
    w.prop('pedestal_negro', S.agujas[0] + 0.5, S.agujas[1], S.agujas[0], S.agujas[1], 1, 1).id = 'agujas';
    npc(w, 'Elena', 'monitora', 27, 70, 0);
    w.pickups.push(new Pickup(Pickup.RELIC, 10 * 16 + 8, 88 * 16 + 8, 'reliquia_hornico'));
    // ---------------- arroyo y cascada de Guazalamanco (al norte de El Hornico)
    const ay = x => 46 + Math.round(Math.sin(x * 0.2) * 2);
    for (let x = 4; x < 44; x++) { const y = ay(x); if (!T.isWater(w.get(x, y))) { w.set(x, y, T.WATER); w.set(x, y + 1, x % 4 ? T.WATER : T.SAND); } }
    for (let y = 36; y <= 44; y++) for (let x = 2; x <= 9; x++) w.set(x, y, T.CLIFF);
    for (let y = 44; y <= 49; y++) for (let x = 3; x <= 9; x++) { if (w.get(x, y) === T.CLIFF) w.set(x, y, T.GRASS_GREEN); res[y * W + x] = 1; }
    S.cascada = [6, 44];
    const cas = new Prop(Art.cascada[0], 6 * 16 + 8, 46 * 16 + 4); cas.id = 'cascada'; cas.anim = 2; w.props.push(cas); w.block(5, 45, 3, 1);
    road(w, res, [[28, 58], [22, 52], [14, 50], [9, 49]], 2, T.TRACK);
    sign(w, res, 26, 56, 'Sendero de la cascada de Guazalamanco · 1,7 km · Mirador sobre el embalse');
    // ---------------- vegetación: pinar alrededor
    scatter(w, res, 9, (x, y, r, t) => {
      if (T.isWater(t) || t === T.SAND) return;
      const lakeD = Math.pow((x - 100) / 58, 2) + Math.pow((y - 38) / 31, 2);
      if (lakeD < 1.25 && r.next() < 0.05) { w.prop('canas', x, y); return; }
      if (r.next() < (x < 60 || y < 10 ? 0.22 : 0.08)) w.prop('pino' + r.int(3), x, y, x, y, 1, 1);
      else if (r.next() < 0.015) w.prop('roca_musgo' + r.int(2), x, y, x, y, 1, 1);
      else if (r.next() < 0.01) w.prop('arbol_muerto' + r.int(2), x, y, x, y, 1, 1);
      else if (r.next() < 0.01) w.prop('setas' + r.int(2), x, y);
    });
    keepPath(w, y => 55 + (y > 112 ? (y - 112) * 0.1 : 0), 100, H - 2);
    border(w);
    const south = new Warp(46, H - 2, 18, 1, 'pantano', 56 * 16 + 8, 3 * 16, 0); south.load = true; w.warps.push(south);
    w.set(54, H - 1, T.ASPHALT);
    // ---------------- zonas y guaridas
    const presa = A('Presa de La Bolera', 100, 76, 41, 17); presa.noSpawn = true; presa.tier = 1.8; w.areas.push(presa);
    const hor = A('El Hornico', 6, 58, 35, 35); hor.safe = true; w.areas.push(hor);
    const cas2 = A('Cascada de Guazalamanco', 2, 40, 14, 12); cas2.tier = 1.7; w.areas.push(cas2);
    w.areas.push(A('Cueva PB4', 138, 64, 14, 12));
    w.regionFn = (x, y) => { const a = A(y < 60 && x > 40 ? 'Embalse de La Bolera' : 'Pinar de La Bolera', 0, 0, 0, 0); a.tier = 1.7; return a; };
    lair(w, 'Orilla de los ahogados', 60, 52, [MK.AHOGADO, MK.AHOGADO, MK.AHOGADO], 1.7);
    lair(w, 'Pinar del arroyo', 30, 30, [MK.SOMBRA, MK.JABALI], 1.7);
    lair(w, 'Nido del pinar alto', 20, 14, [MK.NIDO, MK.HUECO], 1.75);
    lair(w, 'Curva de la presa', 80, 100, [MK.HUECO, MK.HUECO, MK.JABALI], 1.7);
    lair(w, 'Los del arroyo', 36, 46, [MK.AHOGADO, MK.ALACRAN], 1.75);
    lair(w, 'Pinar de la entrada', 30, 112, [MK.JABALI, MK.JABALI], 1.65);
    lair(w, 'Ahogados de la presa', 120, 66, [MK.AHOGADO, MK.AHOGADO], 1.85);
    w.mapTitle = 'La Bolera';
    w.labels = [['Embalse de La Bolera', 100, 36], ['Presa', 120, 74], ['El Hornico', 22, 58], ['Cascada de Guazalamanco', 14, 38], ['Cueva PB4', 144, 64], ['↓ Al pantano', 54, 124]];
    return w;
  };
  return S;
})();
