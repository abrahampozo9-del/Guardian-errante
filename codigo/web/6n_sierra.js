// ====================================================================== LOS TIBIOS · capítulo IV: la Sierra
// Siguiendo «Los Tibios · Historia de El Guardián Errante»: la cueva PB4 (horizontal, estrecha, a oscuras:
// aquí la Luz sirve para ver), el Cortijo del Relojero con la buhardilla de relojes parados a la hora del
// Colapso, el Relojero (el abuelo de Cándida, el del coche de colección que nunca llegó a El Greco),
// Cándida, la cuerda del Reloj del Cielo y la revelación: el Guardián es el narrador de «Bajada al infierno».
Object.assign(ETAPA, { CUEVA: 17, RELOJERO: 18, CANDIDA: 19, BUHARDILLA: 20, GUARDA: 21, VUELTA: 22, ASEDIO: 23, BAJADA: 24, ATRIL: 25, ANTICRISTO: 26, ELECCION: 27, FIN: 28 });
SECCIONES.pb4 = { name: 'La cueva PB4', scene: 'cueva', orden: 3 };
SECCIONES.sierra = { name: 'La Sierra de Castril', scene: 'sierra', orden: 4 };
CONSEJOS.push('En la cueva PB4 no se ve nada: reza o usa la Luz para alumbrar. La esfera del Reloj del Cielo da un poco de claridad.', 'Tu reloj de pulsera marca la hora de la Tierra. Cerca del infierno empieza a ir al revés.');

// ---------------------------------------------------------------- arte
const _initQuestsS = Art.initQuests;
Art.initQuests = function () {
  _initQuestsS.call(this);
  const { img, p, r, ov, ova, line, outline } = Px;
  const put = (k, b) => { Art.P[k] = b; };
  const mk = Art.makePerson, PP = Art.people;
  PP.candida = mk(0xe8c0a0, 0x5a2e16, 0xd8d0c0, 0x5a4a5a, 0x2a2024, { longHair: true, blush: true, scarf: 0x7a2a3a, eyes: 0x4a6a3a });
  PP.casetero = mk(0xb89070, 0x1a1612, 0x3a3a34, 0x26261e, 0x141210, { beard: true, vest: 0x1e1e18, eyes: 0x8a1a10 });
  PP.lider = mk(0xa8a090, 0x0a0808, 0x1a1a1e, 0x121216, 0x0a0a0c, { bald: true, robe: true, hollow: true });
  PP.hombrecillo = mk(0xb8ac98, 0x2a2420, 0x4a4a4e, 0x2a2a2e, 0x1a1a1a, { bald: true, eyes: 0x1a1a1a });
  let mgSet = null; Object.defineProperty(PP, 'miguel_pie', { configurable: true, get() { if (!mgSet && Art.E && Art.E.angel) mgSet = [0, 1, 2, 3].map(() => [Art.E.angel[0], Art.E.angel[1], Art.E.angel[0]]); return mgSet || PP.cura; } });
  // relojes: de pared, de pie y el reloj grande de la buhardilla, todos parados a la misma hora
  const face = (b, cx, cy, rr, rim) => { ov(b, cx, cy, rr, rr, rim); ov(b, cx, cy, rr - 1.2, rr - 1.2, 0xe8e0c8); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; p(b, cx + Math.cos(a) * (rr - 2), cy + Math.sin(a) * (rr - 2), 0x3a3026); } const hA = -Math.PI / 2 + (3 + 33 / 60) / 12 * Math.PI * 2, mA = -Math.PI / 2 + 33 / 60 * Math.PI * 2; line(b, cx, cy, cx + Math.cos(hA) * (rr * 0.45), cy + Math.sin(hA) * (rr * 0.45), 0x1a1410); line(b, cx, cy, cx + Math.cos(mA) * (rr * 0.75), cy + Math.sin(mA) * (rr * 0.75), 0x1a1410); };
  { const b = img(14, 14); face(b, 7, 7, 6, 0x6a4a2a); outline(b, 0x1a120a); put('reloj_pared', b); }
  { const b = img(12, 12); face(b, 6, 6, 5, 0x8a8a90); outline(b, 0x1a1a1e); put('reloj_pared2', b); }
  { const b = img(14, 34); ova(b, 7, 32, 6, 1.6, 0x46000000); r(b, 2, 6, 10, 26, 0x5a3a1e); r(b, 2, 6, 10, 1, 0x8a5a2e); r(b, 4, 18, 6, 12, 0x2a1a0e); line(b, 7, 18, 7, 26, 0xc8a050); ov(b, 7, 27, 1.6, 1.6, 0xe8c060); face(b, 7, 7, 5, 0x8a5a2e); outline(b, 0x1a0e06); put('reloj_pie', b); }
  { const b = img(16, 18); r(b, 2, 4, 12, 12, 0x6a4024); r(b, 1, 2, 14, 3, 0x4a2a14); r(b, 6, 0, 4, 3, 0x4a2a14); face(b, 8, 10, 4.5, 0x8a5a30); r(b, 7, 15, 2, 3, 0xc8a050); outline(b, 0x1a0e06); put('reloj_cuco', b); }
  { const b = img(30, 46); ova(b, 15, 44, 13, 2, 0x50000000); r(b, 4, 10, 22, 34, 0x4a2c14); r(b, 4, 10, 22, 2, 0x7a4a24); r(b, 8, 24, 14, 18, 0x1a0e06); line(b, 15, 24, 15, 36, 0xd8b060); ov(b, 15, 37, 3, 3, 0xf0d070); face(b, 15, 11, 10, 0x9a6a36); r(b, 2, 2, 26, 2, 0x5a3418); outline(b, 0x120804); put('reloj_gigante', b); }
  { const b = img(32, 18); ova(b, 16, 16, 15, 2, 0x46000000); r(b, 1, 6, 30, 4, 0x7a5a36); r(b, 1, 6, 30, 1, 0xa88050); r(b, 2, 10, 3, 7, 0x4a3420); r(b, 27, 10, 3, 7, 0x4a3420); for (const x of [6, 12, 20]) { ov(b, x, 4, 2.4, 2.4, 0xd8d0b8); p(b, x, 4, 0x2a2018); } r(b, 24, 3, 4, 3, 0x8a8a90); outline(b, 0x1a1008); put('banco_relojero', b); }
  { const b = img(14, 10); for (let i = 0; i < 26; i++) { const a = i * 0.7, rr = 1.5 + i * 0.18; p(b, 7 + Math.cos(a) * rr, 5 + Math.sin(a) * rr * 0.6, i % 3 ? 0xd8b060 : 0xf0d890); } put('cuerda', b); }
  // la cueva: estalactitas y la salida hacia la sierra
  { const b = img(12, 16); for (let y = 0; y < 16; y++) { const w = Math.max(0, 5 - y * 0.32); r(b, 6 - w, y, w * 2, 1, y < 4 ? 0x6a645a : 0x8a8478); } outline(b, 0x1a1814); put('estalagmita', b); }
  { const b = img(20, 14); ova(b, 10, 12, 9, 2, 0x46000000); ov(b, 10, 8, 9, 5, 0x5a554c); ov(b, 8, 7, 6, 3.5, 0x7a7468); ov(b, 13, 9, 4, 2.6, 0x4a463e); outline(b, 0x16140f); put('roca_cueva', b); }
  // el haz de luz que cae sobre el atril
  { const b = img(28, 60); for (let y = 0; y < 60; y++) { const w = 4 + y * 0.18; for (let x = 0; x < 28; x++) { const d = Math.abs(x - 14) / w; if (d < 1) Px.pa(b, x, y, (((1 - d) * (0.25 + y / 240) * 255) << 24 | 0xfff0c8) >>> 0); } } put('haz_luz', b); }
  // el cortijo del relojero por fuera: muro de piedra seca
  { const b = img(16, 12); r(b, 0, 2, 16, 10, 0x6a6458); for (let i = 0; i < 9; i++) { r(b, (i * 5) % 14, 3 + (i % 3) * 3, 4, 2, i % 2 ? 0x8a8474 : 0x5a5448); } r(b, 0, 2, 16, 1, 0x9a9484); outline(b, 0x1e1c16); put('muro_piedra', b); }
};

// ---------------------------------------------------------------- la cueva PB4
const SIE = {};
SIE.cueva = function () {
  const W = 96, H = 40, w = new World('pb4', W, H, T.MOUNTAIN), R = RNG(8410);
  w.cave = true; w.outdoor = false; w.dark = 0.96; w.defaultArea = 'Cueva PB4'; w.mapTitle = 'La cueva PB4';
  const carve = (x, y, rr, t) => { for (let j = -rr; j <= rr; j++) for (let i = -rr; i <= rr; i++) if (i * i + j * j <= rr * rr + rr) { const X = x + i, Y = y + j; if (X > 0 && Y > 1 && X < W - 1 && Y < H - 2) w.set(X, Y, t || (R.next() < 0.18 ? T.SAND : T.DIRT)); } };
  let y = 20; const path = [];
  for (let x = 1; x < W - 1; x++) {
    const y0 = y;
    if (x % 3 === 0) y += R.int(3) - 1; y = Math.max(8, Math.min(H - 10, y));
    const narrow = (x > 12 && x < 18) || (x > 38 && x < 43) || (x > 64 && x < 70); // gateras
    carve(x, y, narrow ? 0 : 1); if (y !== y0) carve(x, y0, narrow ? 0 : 1); path[x] = [x, y];
  }
  path[0] = [0, path[1][1]]; path[W - 1] = [W - 1, path[W - 2][1]];
  SIE.cave = { path };
  const salas = [[25, 'Sala de las Sombras', 5], [53, 'El sifón', 6], [80, 'La sala del eco', 5]];
  for (const [sx, name, rr] of salas) { const sy = path[sx][1]; carve(sx, sy, rr); for (let k = 0; k < 6; k++) carve(sx - rr + R.int(rr * 2), sy - rr + R.int(rr * 2), 1); w.areas.push(new Area(name, sx - rr - 1, sy - rr - 1, rr * 2 + 3, rr * 2 + 3)); }
  // el sifón: agua en medio de la sala, con orilla para pasar
  { const sx = 53, sy = path[53][1]; for (let j = -3; j <= 3; j++) for (let i = -3; i <= 2; i++) if (i * i + j * j < 11 && j > -2) w.set(sx + i, sy + j + 1, (i * i + j * j < 4) ? T.DEEP : T.WATER); for (let i = -6; i <= 6; i++) w.set(sx + i, sy - 2, T.SAND); }
  // estalagmitas y rocas en las salas
  for (let i = 0; i < 70; i++) { const x = 3 + R.int(W - 6), yy = 3 + R.int(H - 6); if (w.get(x, yy) === T.DIRT && w.get(x, yy - 1) === T.MOUNTAIN && !path.some(([px, py]) => px === x && Math.abs(py - yy) < 1)) w.prop(R.next() < 0.6 ? 'estalagmita' : 'roca_cueva', x, yy); }
  // un cartel de espeleología a la entrada
  w.prop('senal', 4, path[4][1] - 1).id = 'cartel:CAVIDAD PB-4 · Sierra de Castril · Grupo de Espeleología · Prohibido el paso sin equipo';
  // entradas: al oeste, la boca de La Bolera; al este, la salida a la sierra
  const wIn = new Warp(0, path[1][1] - 2, 1, 5, 'bolera', WS.pb4[0] * 16 + 8, (WS.pb4[1] + 1) * 16 + 10, 0); wIn.load = true; w.warps.push(wIn);
  const wOut = new Warp(W - 1, path[W - 2][1] - 2, 1, 5, 'sierra', 4 * 16 + 8, 42 * 16 + 8, 3); wOut.load = true; w.warps.push(wOut);
  for (let j = -2; j <= 2; j++) { w.set(0, path[1][1] + j, T.DIRT); w.set(W - 1, path[W - 2][1] + j, T.DIRT); }
  SIE.caveIn = [2, path[2][1]]; SIE.caveOut = [W - 3, path[W - 3][1]];
  return w;
};
// los de la cueva: cada vez que entras, vuelven a estar
SIE.poblarCueva = function (w) {
  if (w.monsters.some(m => !m.dead)) return;
  const P = SIE.cave.path, R = RNG(G.dayN * 13 + 7);
  const put = (k, x, y, t) => { const m = new Monster(k, x * 16 + 8, y * 16 + 8, t); m.spawnFade = 1; w.monsters.push(m); return m; };
  for (let i = 0; i < 4; i++) put(MK.SOMBRA, 22 + R.int(7), P[25][1] - 2 + R.int(4), 1.6);
  put(MK.AHOGADO, 53, P[53][1] + 1, 1.6); put(MK.AHOGADO, 52, P[53][1] + 2, 1.6);
  for (let i = 0; i < 3; i++) put(MK.ALACRAN, 46 + R.int(14), P[50][1] - 1 + R.int(3), 1.6);
  put(MK.NIDO, 81, P[80][1] - 3, 1.5); put(MK.HUECO, 78, P[80][1] + 1, 1.7); put(MK.HUECO, 83, P[80][1] + 2, 1.7);
  for (const k of [33, 60, 72]) put(MK.ALACRAN, k, P[k][1], 1.6);
};

// ---------------------------------------------------------------- la Sierra de Castril y el Cortijo del Relojero
SIE.sierra = function () {
  const W = 120, H = 84, w = new World('sierra', W, H, T.GRASS), R = RNG(4420);
  w.outdoor = true; w.defaultArea = 'Sierra de Castril'; w.mapTitle = 'La Sierra de Castril'; w.lairs = []; w.birds = [];
  const n = (x, y, s) => CP.fbm(x / 22, y / 22, s, 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const v = n(x, y, 3), m = n(x, y, 9) + (1 - y / H) * 0.35;
    let t = v > 0.58 ? T.GRASS_GREEN : v < 0.4 ? T.SCRUB : T.GRASS;
    if (m > 0.78 || y < 4 || x < 1 || x > W - 2 || y > H - 2) t = T.MOUNTAIN; else if (m > 0.72) t = T.CLIFF;
    w.set(x, y, t);
  }
  const road = (pts, t = T.TRACK) => { for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], L = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= L; k++) { const x = Math.round(x0 + (x1 - x0) * k / L), y = Math.round(y0 + (y1 - y0) * k / L); for (const [dx, dy] of [[0, 0], [1, 0], [0, 1]]) w.set(x + dx, y + dy, t); } } };
  // la salida de la cueva, al oeste, bajo un cantil
  for (let y = 36; y <= 48; y++) for (let x = 1; x <= 8; x++) w.set(x, y, x < 3 && (y < 40 || y > 44) ? T.MOUNTAIN : T.DIRT);
  w.prop('cueva_pb4', 2, 41, 1, 41, 3, 1).id = 'cueva_sierra';
  const back = new Warp(0, 40, 1, 5, 'pb4', SIE.caveOut[0] * 16 + 8, SIE.caveOut[1] * 16 + 8, 2); back.load = true; w.warps.push(back);
  // caminos: de la cueva al cortijo, del cortijo a las cumbres y a la majada
  road([[4, 42], [12, 40], [20, 38], [26, 37]]);
  road([[26, 37], [34, 30], [44, 22], [58, 14], [70, 9]]);
  road([[26, 37], [40, 46], [58, 52], [78, 58], [96, 62]]);
  // el Cortijo del Relojero: casa de guarda de piedra encaramada sobre la salida de la cueva, con buhardilla
  const hx = 20, hy = 28;
  for (let y = hy - 2; y <= hy + 12; y++) for (let x = hx - 3; x <= hx + 12; x++) w.set(x, y, y > hy + 8 ? T.TRACK : T.GRASS);
  w.roofMeta = new Map(); const meta = { x0: hx, x1: hx + 8, y0: hy, yb: hy + 3, ridge: hy + 1, tone: 2 };
  for (let y = hy; y <= hy + 3; y++) for (let x = hx; x <= hx + 8; x++) { w.set(x, y, T.ROOF_DARK); w.roofMeta.set(y * W + x, meta); }
  for (let x = hx; x <= hx + 8; x++) { w.set(x, hy + 4, x % 3 === 1 ? T.WINDOW : T.WALL_STONE); w.set(x, hy + 5, x === hx + 4 ? T.DOOR : x % 4 === 2 ? T.WINDOW : T.WALL_STONE); }
  w.block(hx + 4, hy + 5, 1, 1);
  w.prop('chimenea_t', hx + 6, hy + 2);
  w.prop('compuerta', hx + 4, hy + 5).id = 'relojero_puerta'; w.props[w.props.length - 1].hidden = true;
  for (let x = hx - 3; x <= hx + 12; x += 2) if (x < hx - 1 || x > hx + 9) w.prop('muro_piedra', x, hy + 9, x, hy + 9, 1, 1);
  const fire = new Prop(Art.campfire[0], (hx + 10) * 16 + 8, (hy + 7) * 16 + 15); fire.anim = 1; fire.id = 'hoguera_relojero'; w.props.push(fire); w.block(hx + 10, hy + 7, 1, 1);
  w.prop('banco', hx + 8, hy + 8);
  SIE.door = [hx + 4, hy + 5]; SIE.fire = [hx + 10, hy + 8];
  w.areas.push(new Area('Cortijo del Relojero', hx - 3, hy - 2, 16, 15));
  w.areas[w.areas.length - 1].safe = true;
  w.areas.push(new Area('Las cumbres', 50, 4, 30, 16));
  w.areas.push(new Area('La majada', 84, 54, 26, 16));
  // pinar: pinos por todas partes salvo en caminos y en el cortijo
  for (let i = 0; i < 700; i++) {
    const x = 2 + R.int(W - 4), y = 5 + R.int(H - 8), t = w.get(x, y);
    if (t !== T.GRASS && t !== T.GRASS_GREEN && t !== T.SCRUB) continue;
    if (w.solid(x, y + 1) || w.areaAt(x, y) && w.areaAt(x, y).safe) continue;
    if ([T.TRACK].includes(w.get(x + 1, y)) || [T.TRACK].includes(w.get(x - 1, y)) || [T.TRACK].includes(w.get(x, y + 1))) continue;
    const k = R.next() < 0.75 ? 'pino' + R.int(3) : R.next() < 0.5 ? 'roca' + R.int(2) : 'retama0';
    if (Art.P[k]) w.prop(k, x, y, x, y, 1, 1);
  }
  // la majada: un aprisco viejo; las cumbres: un vértice geodésico
  w.prop('ruina1', 96, 60, 95, 60, 3, 1);
  w.prop('senal', 66, 10).id = 'cartel:Vértice geodésico · Sierra de Castril · Desde aquí, dicen, se ve Pozo Alcón entero';
  const lair = (name, x, y, kinds, tier) => w.lairs.push({ name, x, y, kinds, tier, active: false, cleared: false });
  lair('Pinar del collado', 40, 40, [MK.JABALI, MK.JABALI], 1.7);
  lair('Las cumbres', 62, 12, [MK.SOMBRA, MK.SOMBRA, MK.ALACRAN], 1.8);
  lair('La majada', 92, 62, [MK.HUECO, MK.HUECO, MK.JABALI], 1.75);
  lair('Barranco del pino', 70, 40, [MK.ALACRAN, MK.ALACRAN], 1.7);
  w.regionFn = (x, y) => { const a = new Area(y < 22 ? 'Las cumbres' : 'Sierra de Castril', 0, 0, 0, 0); a.tier = 1.75; return a; };
  w.labels = [['Cortijo del Relojero', hx + 4, hy - 2], ['Las cumbres', 64, 6], ['La majada', 96, 56], ['← Cueva PB4', 6, 38]];
  return w;
};
// el taller del relojero (planta baja) y la buhardilla de los relojes parados
SIE.taller = function () {
  const w = qRoom('relojero', 18, 12, 'El taller del Relojero'); w.dark = 0.5;
  w.wall('ventana_int', 4 * 16, 2 * 16 - 2);
  for (const [x, k] of [[2, 'reloj_pared'], [7, 'reloj_cuco'], [9, 'reloj_pared2'], [11, 'reloj_pared'], [13, 'reloj_pared2']]) w.wall(k, x * 16 + 2, 16 + 4);
  w.prop('banco_relojero', 6, 3.6, 5, 3, 3, 1).id = 'banco_relojero';
  w.prop('reloj_pie', 2, 4.4, 2, 4, 1, 1); w.prop('reloj_pie', 14, 9.4, 14, 9, 1, 1);
  w.prop('mesa_camilla', 8, 8, 7, 7, 2, 2); w.prop('estanteria0', 11.5, 4, 11, 4, 2, 1);
  w.fill(15, 1, 2, 2, T.STAIRS); w.set(15, 3, T.FLOOR); w.set(16, 3, T.FLOOR);
  w.warps.push(new Warp(15, 1, 2, 2, 'buhardilla', 3 * 16 + 8, 6 * 16 + 8, 3));
  w.warps.push(new Warp(8, 11, 1, 1, 'sierra', SIE.door[0] * 16 + 8, (SIE.door[1] + 1) * 16 + 8, 0)); w.set(8, 11, T.FLOOR);
  for (const a of w.areas) a.safe = true;
  return w;
};
SIE.buhardilla = function () {
  const w = qRoom('buhardilla', 16, 9, 'La buhardilla de los relojes'); w.dark = 0.62;
  const R = RNG(3333);
  for (let i = 0; i < 14; i++) w.wall(i % 3 ? 'reloj_pared' : 'reloj_pared2', (1 + i) * 15 * 0.98 + 4, 16 + 3 + (i % 2) * 6);
  w.prop('reloj_gigante', 8, 3.4, 7, 2, 3, 2).id = 'reloj_gigante';
  for (const [x, y] of [[2, 5], [13, 5], [5, 7], [11, 7]]) w.prop(R.next() < 0.5 ? 'reloj_pie' : 'reloj_cuco', x, y, x, y, 1, 1);
  w.fill(1, 6, 2, 2, T.STAIRS); w.warps.push(new Warp(1, 6, 1, 2, 'relojero', 14 * 16 + 8, 4 * 16 + 4, 0));
  for (const a of w.areas) a.safe = true;
  return w;
};
const _gwS = G.getWorld;
G.getWorld = function (id) {
  if (!this.worlds[id] && ['pb4', 'sierra', 'relojero', 'buhardilla'].includes(id)) {
    if (id !== 'pb4' && !this.worlds.pb4) this.worlds.pb4 = SIE.cueva();
    if (id !== 'sierra' && id !== 'pb4' && !this.worlds.sierra) this.worlds.sierra = SIE.sierra();
    const w = { pb4: SIE.cueva, sierra: SIE.sierra, relojero: SIE.taller, buhardilla: SIE.buhardilla }[id]();
    w.pickups = w.pickups || [];
    this.worlds[id] = w; if (typeof Q !== 'undefined') Q.refresh(); SIE.place();
    return w;
  }
  return _gwS.call(this, id);
};

// ---------------------------------------------------------------- quién está dónde en el capítulo IV
SIE.npc = (wid, key, name, x, y, dir) => { const w = G.worlds[wid]; if (!w) return null; w.npcs = w.npcs.filter(n => n.key !== key); const n = new Npc(name, key, Art.people[key], null, null, x * 16 + 8, y * 16 + 13, dir || 0); n.story = true; w.npcs.push(n); return n; };
SIE.place = function () {
  const st = G.stage, E = ETAPA;
  if (G.worlds.relojero) { SIE.npc('relojero', 'relojero', 'El Relojero', 6, 6, 0); if (st >= E.RELOJERO && st < E.BUHARDILLA) SIE.npc('relojero', 'candida', 'Cándida', 11, 8, 2); else G.worlds.relojero.npcs = G.worlds.relojero.npcs.filter(n => n.key !== 'candida'); }
  if (G.worlds.buhardilla) { if (st === E.BUHARDILLA) SIE.npc('buhardilla', 'candida', 'Cándida', 10, 5, 2); else G.worlds.buhardilla.npcs = G.worlds.buhardilla.npcs.filter(n => n.key !== 'candida'); }
  if (G.worlds.sierra && st >= E.GUARDA && st < E.VUELTA + 1) SIE.npc('sierra', 'candida', 'Cándida', SIE.door[0] + 2, SIE.door[1] + 2, 0);
  else if (G.worlds.sierra) G.worlds.sierra.npcs = G.worlds.sierra.npcs.filter(n => n.key !== 'candida');
  for (const id in G.worlds) for (const n of G.worlds[id].npcs) if (n.story) n.mark = SIE.marks(n);
};
SIE.marks = n => {
  const st = G.stage, E = ETAPA;
  return (n.key === 'relojero' && st === E.RELOJERO) || (n.key === 'candida' && (st === E.CANDIDA || st === E.GUARDA && G.flags.has('casetero_muerto')));
};
const _refS = Q.refresh;
Q.refresh = function () { _refS.call(Q); if (G.worlds) SIE.place(); };

// ---------------------------------------------------------------- objetivos
const _objS = G.objective;
G.objective = function () {
  const E = ETAPA;
  switch (this.stage) {
    case E.SIERRA: return 'Entra en la cueva PB4, al otro lado de la presa.';
    case E.CUEVA: return 'Cruza la cueva PB4. Reza o usa la Luz para ver.';
    case E.RELOJERO: return 'Llama a la puerta del Cortijo del Relojero.';
    case E.CANDIDA: return 'Habla con Cándida.';
    case E.BUHARDILLA: return 'Sube a la buhardilla con Cándida.';
    case E.GUARDA: return this.flags.has('casetero_muerto') ? 'Habla con Cándida, en la puerta del cortijo.' : 'Alguien ha subido a la sierra a por la cuerda. Sal a la puerta.';
  }
  return _objS.call(this);
};
const _objTS = G.objectiveTarget;
G.objectiveTarget = function () {
  const E = ETAPA;
  switch (this.stage) {
    case E.SIERRA: return [WS.pb4[0], WS.pb4[1] + 1, 'bolera'];
    case E.CUEVA: return SIE.caveOut ? [SIE.caveOut[0], SIE.caveOut[1], 'pb4'] : null;
    case E.RELOJERO: case E.CANDIDA: case E.BUHARDILLA: case E.GUARDA: return SIE.door ? [SIE.door[0], SIE.door[1] + 1, 'sierra'] : null;
  }
  return _objTS.call(this);
};

// ---------------------------------------------------------------- conversaciones del capítulo IV
const _talkS = G.talk;
G.talk = function (n) {
  const E = ETAPA, st = this.stage;
  if (n.key === 'relojero') {
    Sound.play('talk');
    if (st === E.RELOJERO) {
      this.sayAs(n, '¿Quién...? Vaya. Has salido de la cueva. Hacía siete años que no salía nadie de ahí. Ni entraba.',
        'Yo arreglaba relojes en el pueblo, en la calle de la Iglesia. Un buen día empezaron a ir raros. Todos a la vez. Unos adelantaban, otros se paraban, y alguno iba al revés.',
        'Me subí aquí con mis cachivaches y con mi coche, el de colección, a ver si en la sierra se aclaraban. Esa noche teníamos que bajar a El Greco a conocer a la familia del novio de mi nieta.',
        'No llegamos. A las tres y treinta y tres se pararon todos los relojes de esta casa. Todos. Y abajo se apagó el mundo.',
        'Hay dos relojes, ¿sabes? El de la Tierra y el del Cielo. El de la Tierra va hacia delante. El del Cielo también... pero en su dirección. Cuando te acerques al infierno, el tuyo parecerá ir hacia atrás. No va hacia atrás: va en dirección contraria a su dirección en el cielo.',
        'Lo que buscas está arriba, en la buhardilla. Cayó por el tejado esa misma noche. Pero antes habla con mi nieta. Lleva siete años esperando que alguien salga de esa cueva.');
      this.dlgEnd = () => { this.stage = E.CANDIDA; SIE.place(); this.save(); };
      return;
    }
    if (st < E.RELOJERO) { this.sayAs(n, 'Siéntate, siéntate. Aquí arriba el tiempo no corre. Literalmente.'); return; }
    if (st >= E.VUELTA && !this.flags.has('reloj_pulsera')) {
      this.flags.add('reloj_pulsera');
      this.sayAs(n, 'Dame ese reloj de pulsera que llevas parado en la muñeca. ... Ya está. Ahora anda. Y marca la hora de la Tierra.', 'Cuando empiece a ir al revés, no te asustes: fíjate bien. Es el otro reloj, que se te asoma.', '(Tu reloj de pulsera vuelve a andar: lo verás junto a tu vida.)');
      this.dlgEnd = () => this.save();
      return;
    }
    this.sayAs(n, st >= E.VUELTA ? 'Baja ya. Y cuida de la niña, que la niña te cuida a ti desde hace siete años.' : 'Arriba, la buhardilla. No toques nada sin ella.');
    return;
  }
  if (n.key === 'candida') {
    Sound.play('talk');
    if (st === E.RELOJERO) { this.sayAs(n, '...'); return; }
    if (st === E.CANDIDA) {
      this.sayAs(n, 'Tardaste siete años.', '¿No me conoces? ... No. Claro que no. Soy Cándida.',
        'Íbamos a presentar a mis abuelos a tus padres. Tu padre se empeñó en que el salón de casa era pequeño, y acabamos todos en El Greco. ¿Te acuerdas de Giro, tu gato, con la cabeza torcida?',
        'Yo te tuve de la mano toda la noche. Hasta la puerta del salón. Hasta la salida que nadie conocía. Y luego te soltaste.',
        'Tengo sueños que se cumplen, ¿sabes? Anoche soñé que salías de la cueva con una luz en la mano. Por eso estaba despierta.',
        'Sube conmigo a la buhardilla. Lo que buscas está allí. Y a lo mejor tú también.');
      this.dlgEnd = () => { this.stage = E.BUHARDILLA; SIE.place(); this.save(); };
      return;
    }
    if (st === E.BUHARDILLA) { this.sayAs(n, 'El reloj grande. Pon la mano en él. Yo te cojo la otra.'); return; }
    if (st === E.GUARDA && this.flags.has('casetero_muerto')) {
      this.sayAs(n, 'Era el de la caseta. El que abría la ventanilla cuando le daba la gana. Ha subido hasta aquí por ti.',
        'Ahora lo sabes todo. Bajaste aquella noche. Dijiste que no al cielo y casi caes en lo del atril. Por eso eres tibio: te quedaste a medias, como yo.',
        'Anoche soñé otra cosa: tú bajando por la caseta, con el Reloj del Cielo en las manos. Y yo esperándote en la plaza, como entonces.',
        'Baja al pueblo. Yo voy detrás, por el camino de los pastores. Y pásate por el abuelo antes, que te tiene algo.');
      this.dlgEnd = () => { this.stage = E.VUELTA; this.flags.add('reloj_completo'); SIE.place(); this.save(); Sound.play('level'); this.toast('El Reloj del Cielo está completo: la esfera, las agujas y la cuerda.'); };
      return;
    }
    this.sayAs(n, st >= E.VUELTA ? 'Ve. Te espero en la plaza.' : 'Aquí estoy.');
    return;
  }
  return _talkS.call(this, n);
};

// ---------------------------------------------------------------- objetos y lugares del capítulo IV
const _useS = G.use;
G.use = function (pr) {
  const E = ETAPA, st = this.stage, p = this.player;
  switch (pr.id) {
    case 'cueva_pb4':
      if (st >= E.SIERRA) {
        const w = { to: 'pb4', tx: SIE.caveIn ? SIE.caveIn[0] * 16 + 8 : 40, ty: SIE.caveIn ? SIE.caveIn[1] * 16 + 8 : 320, dir: 3, load: true };
        if (!SIE.caveIn) { this.getWorld('pb4'); w.tx = SIE.caveIn[0] * 16 + 8; w.ty = SIE.caveIn[1] * 16 + 8; }
        this.travel(w); return;
      }
      break;
    case 'cueva_sierra': this.say('Guardián', 'La boca de la PB4 por el lado de la sierra. Huele a humedad y a tierra vieja. Para volver al pantano, hay que cruzarla otra vez.'); return;
    case 'relojero_puerta': Sound.play('door'); this.enter('relojero', 8 * 16 + 8, 10 * 16 + 8, 1); return;
    case 'hoguera_relojero':
      this.restWorld = 'sierra'; this.restX = SIE.fire[0] * 16 + 8; this.restY = (SIE.fire[1] + 1) * 16 + 8;
      this.rest('Descansas junto a la hoguera del Cortijo del Relojero. Abajo, muy lejos, se ve una luz en Pozo Alcón.'); return;
    case 'banco_relojero': this.say('Guardián', 'El banco del Relojero: lupas, muelles, ruedecillas, un frasco de aceite fino. Todo ordenado como si fuera a abrir mañana la tienda.'); return;
    case 'reloj_gigante':
      if (st === E.BUHARDILLA) { this.recuerdo(); return; }
      this.say('Guardián', st > E.BUHARDILLA ? 'El reloj grande vuelve a andar. Despacio, pero anda.' : 'Un reloj de pie enorme, parado a las tres y treinta y tres. Como todos.');
      return;
  }
  if (pr.img === Art.P.reloj_pie || pr.img === Art.P.reloj_cuco) { this.say('Guardián', 'Las tres y treinta y tres. Este también.'); return; }
  return _useS.call(this, pr);
};
// la revelación: Cándida le coge de la mano junto al reloj grande y él se acuerda de aquella noche
G.recuerdo = function () {
  const E = ETAPA;
  this.say('Cándida', 'Dame la mano. Como aquella noche.');
  this.dlgEnd = () => this.playCine('recuerdo', () => {
    this.flags.add('cuerda'); this.flags.add('recuerdo');
    this.player.maxFe += 20; this.player.fe = this.player.maxFe;
    Sound.play('purify'); this.shake(0.6);
    this.say('Guardián', 'Me acuerdo. De todo.', 'El Greco. La salida que nadie conocía. «¿Quieres ver el cielo?» Y yo dije que no.', 'La caseta abierta. Las escaleras en tramos de tres. El atril, y aquello que no conseguía ver. Mi vista se desprendió de mi cuerpo... y desperté en el cortijo, siete años después.',
      'Del reloj grande cae algo dorado, enroscado como una culebra: la CUERDA del Reloj del Cielo. (Fe máxima +20)',
      'Abajo, alguien golpea la puerta del cortijo. Tres golpes. Otros tres.');
    this.dlgEnd = () => { this.stage = E.GUARDA; this.day = 0.78; SIE.place(); this.save(); };
  });
};
// el hombre de la caseta sube a la sierra a por la cuerda
const _enterS = G.enter;
G.enter = function (id, x, y, dir) {
  _enterS.call(this, id, x, y, dir);
  const E = ETAPA, w = this.world;
  if (id === 'pb4') { SIE.poblarCueva(w); if (!this.flags.has('tuto_cueva')) { this.flags.add('tuto_cueva'); this.toast('No se ve nada. Reza (K) o usa la Luz (L) para alumbrar la cueva.'); } }
  if (id === 'sierra' && this.stage === E.GUARDA && !this.flags.has('casetero_muerto') && !w.monsters.some(m => m.casetero && !m.dead)) {
    const [dx, dy] = SIE.door;
    const m = new Monster(MK.HUMANO, (dx + 3) * 16, (dy + 5) * 16, 1); m.set = Art.people.casetero; m.customName = 'El hombre de la caseta';
    m.maxHp = m.hp = 640; m.dmg = 20; m.speed = 52; m.xp = 600; m.blink = true; m.drain = 6; m.aggro = true; m.quest = true; m.casetero = true; m.spawnFade = 0.6;
    m.st = Object.assign({}, m.st, { range: 30, atk: 0.25 });
    w.monsters.push(m); this.boss = m; this.summonT = 6;
    this.say('El hombre de la caseta', 'Esa cuerda no es tuya, tibio. Ni el reloj. Ni la niña.', 'Siete años abriendo la ventanilla cuando me daba la gana. Hoy me da la gana de abrirte a ti.');
  }
  if (id === 'sierra' && !this.flags.has('cine_sierra')) { this.flags.add('cine_sierra'); if (this.stage === E.CUEVA) { this.stage = E.RELOJERO; this.save(); } this.playCine('sierra'); }
  if (id === 'sierra' && this.stage === E.CUEVA) { this.stage = E.RELOJERO; this.save(); }
  SIE.place();
};
const _killS = G.killMonster;
G.killMonster = function (m) {
  _killS.call(this, m);
  if (m.casetero && !this.flags.has('casetero_muerto')) {
    this.flags.add('casetero_muerto'); this.boss = null;
    for (const o of this.world.monsters) if (o.casereroHijo) o.dead = true;
    Sound.play('purify'); this.shake(0.8);
    this.say('Guardián', 'El hombre de la caseta se dobla como un papel mojado. Del bolsillo se le cae una llave pequeña, la de la ventanilla.', 'La puerta del infierno no necesita llave. Pero me la guardo.');
    this.dlgEnd = () => { SIE.place(); this.save(); };
  }
};
// mientras pelea, llama a las sombras de la sierra
const _updS = G.updatePlay;
G.updatePlay = function (dt) {
  _updS.call(this, dt);
  const b = this.boss;
  if (b && b.casetero && !b.dead && this.world.id === 'sierra') {
    this.summonT = (this.summonT || 6) - dt;
    if (this.summonT <= 0 && this.world.monsters.filter(o => o.casereroHijo && !o.dead).length < 3) { this.summonT = 9; const s = new Monster(MK.SOMBRA, b.x + this.rnd.gauss() * 30, b.y + this.rnd.gauss() * 30, 1.6); s.aggro = true; s.casereroHijo = true; s.spawnFade = 0.8; this.world.monsters.push(s); }
  }
  if (this.caveLit > 0) this.caveLit -= dt;
};
// rezar o usar la Luz alumbra la cueva un rato
const _prayS = G.pray, _lightS = G.holyLight;
G.pray = function () {
  const p = this.player, f = p.fe, cost = this.has('oracion') ? 18 : 25;
  // en la cueva se reza también para ver, aunque no estés herido
  if (this.world.cave && p.hp >= p.maxHp && p.fe >= cost) { p.fe -= cost; this.caveLit = 10; Sound.play('heal'); this.toast('Rezo en voz baja. La oscuridad se aparta un poco.'); return; }
  const r = _prayS.apply(this, arguments); if (this.world.cave && p.fe < f) this.caveLit = 10; return r;
};
G.holyLight = function () { const f = this.player.fe; const r = _lightS.apply(this, arguments); if (this.world.cave && this.player.fe < f) this.caveLit = 16; return r; };
// llegadas
const _arrS = G.onArrive;
G.onArrive = function (id) {
  if (_arrS) _arrS.call(this, id);
  if (id === 'pb4' && this.stage === ETAPA.SIERRA) { this.stage = ETAPA.CUEVA; this.save(); this.playCine('cueva'); }
};
// si mueres en la cueva o en la sierra, te levantas en la hoguera del relojero si ya la usaste

// ---------------------------------------------------------------- la oscuridad de la cueva (solo ves lo que alumbras)
const _lateS = Q.late;
Q.late = function () {
  _lateS();
  const mask = document.createElement('canvas'); mask.width = WW; mask.height = WH; const mg = mask.getContext('2d');
  const _rw = G.renderWorld;
  G.renderWorld = function (g) {
    _rw.call(this, g);
    const w = this.world; if (!w || !w.cave || this.padel) return;
    const p = this.player, cx = Math.round(this.camX), cy = Math.round(this.camY);
    const lit = Math.max(0, Math.min(1, (this.caveLit || 0) / 2));
    const base = 20 + (this.flags.has('esfera') ? 12 : 0) + Math.sin(this.clock * 3) * 1.5, rr = base + lit * 70;
    mg.globalCompositeOperation = 'source-over'; mg.fillStyle = 'rgba(2,2,4,0.985)'; mg.fillRect(0, 0, WW, WH);
    mg.globalCompositeOperation = 'destination-out';
    const sx = p.x - cx, sy = p.y - 10 - cy, gr = mg.createRadialGradient(sx, sy, rr * 0.25, sx, sy, rr);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.7, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    mg.fillStyle = gr; mg.fillRect(0, 0, WW, WH);
    // los ojos de lo que acecha en la oscuridad
    mg.globalCompositeOperation = 'source-over';
    g.drawImage(mask, 0, 0);
    for (const m of w.monsters) if (!m.dead) { const ex = m.x - cx, ey = m.y - 14 - cy, d = Math.hypot(ex - sx, ey - sy); if (d > rr * 0.8 && d < 160) { g.fillStyle = 'rgba(255,60,40,0.8)'; g.fillRect(Math.round(ex - 2), Math.round(ey), 1, 1); g.fillRect(Math.round(ex + 1), Math.round(ey), 1, 1); } }
    if (lit > 0) { g.save(); g.globalCompositeOperation = 'screen'; const gl = g.createRadialGradient(sx, sy, 0, sx, sy, rr); gl.addColorStop(0, `rgba(255,230,170,${0.18 * lit})`); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(0, 0, WW, WH); g.restore(); }
  };
};
