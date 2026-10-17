// ====================================================================== 10 · MALA SUERTE (Relatos Raros)
// Campocámara, la aldea de más allá de Los Llanos. Un forastero tropezó, se agarró a una barra del pilón
// y la arrancó. Lo demás vino solo. El Guardián llega después y encuentra lo que dejó.
// Lo de la casa (los críos) no se enseña ni se cuenta: solo se sugiere.

// ---------------------------------------------------------------- arte
const _initQuestsMS = Art.initQuests;
Art.initQuests = function () {
  _initQuestsMS.call(this);
  const { img, p, r, ov, ova, line, outline } = Px;
  const put = (k, b) => { Art.P[k] = b; };
  const mk = Art.makePerson, PP = Art.people;
  PP.juan = mk(0xd8b090, 0x5a3a20, 0x8ab0d0, 0xb8a888, 0x4a3a2a, { eyes: 0x3a4a5a });
  PP.ventero = mk(0xc89470, 0x2a2420, 0xe8e4da, 0x2a2a30, 0x141414, { apron: true, beard: true, eyes: 0x2a1a10 });
  { // el pilón de la plaza, con su barandilla de hierro (le falta una barra)
    const b = img(44, 22); ova(b, 22, 19, 21, 3, 0x46000000);
    r(b, 2, 10, 40, 9, 0xa8a090); r(b, 2, 10, 40, 2, 0xc8c0b0); r(b, 4, 12, 36, 4, 0x3a7a8a); r(b, 5, 12, 20, 1, 0x7ab8c0); r(b, 2, 17, 40, 2, 0x7a7466);
    r(b, 2, 2, 40, 1, 0x3a3a3e); r(b, 2, 6, 40, 1, 0x3a3a3e);
    for (let x = 2; x <= 42; x += 5) if (x !== 27) r(b, x, 2, 1, 9, 0x2a2a2e);
    p(b, 27, 2, 0x8a3a20); p(b, 27, 9, 0x8a3a20); p(b, 26, 10, 0xd8d0c0); p(b, 28, 10, 0xd8d0c0); // la rotura
    outline(b, 0x3a3630); put('pilon', b);
  }
  { // una vecina en el suelo de la plaza (bulto oscuro, sin detalle)
    const b = img(26, 12); ova(b, 14, 8, 12, 3.4, 0xa0601010); ova(b, 16, 9, 9, 2.4, 0xc8701414);
    ov(b, 11, 6, 8, 3, 0x3a3046); ov(b, 6, 6, 3, 2.6, 0x4a3a30); ov(b, 17, 7, 3, 2, 0x2a2436); r(b, 18, 6, 5, 2, 0x2a2436); outline(b, 0x140e18); put('cuerpo', b);
  }
  { // bolsa de la compra reventada
    const b = img(18, 10); ova(b, 9, 8, 8, 2, 0x46000000); ov(b, 6, 5, 4, 3, 0xe8e4d8); r(b, 9, 4, 6, 3, 0xd8a050); r(b, 9, 4, 6, 1, 0xf0c070);
    ov(b, 14, 7, 1.6, 1.6, 0xf08a1a); ov(b, 3, 8, 1.5, 1.5, 0xf08a1a); r(b, 11, 8, 3, 2, 0xc8b070); outline(b, 0x3a2a1a); put('bolsa', b);
  }
  { // mancha de sangre (en el suelo)
    const b = img(18, 8); ova(b, 9, 4, 8, 3, 0xb06a0a0a); ova(b, 7, 4, 5, 2, 0xd0801010); ova(b, 14, 5, 2, 1, 0xa0700a0a); put('mancha', b);
  }
  { // rodadas de coche en el polvo
    const b = img(14, 30); for (let y = 0; y < 30; y++) { const dx = Math.round(Math.sin(y * 0.2) * 1.5); for (const x0 of [2, 10]) { if ((y >> 1) % 2) p(b, x0 + dx, y, 0x5a4a36); p(b, x0 + 1 + dx, y, 0x4a3a2a); } } put('rodadas', b);
  }
  { // vaso de leche estrellado contra la pared
    const b = img(16, 10); ova(b, 8, 7, 7, 2.4, 0xd8f4f0e8); ova(b, 6, 7, 3, 1.4, 0xf0fffff8); for (const [x, y] of [[3, 8], [11, 6], [13, 8], [8, 9]]) { p(b, x, y, 0xc8e0e8); p(b, x + 1, y, 0x8ab0c0); } line(b, 9, 0, 9, 5, 0xe8e8e0); put('vaso_roto', b);
  }
  { // cartel de la aldea
    const b = img(16, 22); ova(b, 8, 20, 6, 1.6, 0x46000000); r(b, 7, 8, 2, 13, 0x5a5a5e); r(b, 1, 2, 14, 7, 0xe8e4d8); r(b, 1, 2, 14, 1, 0xffffff); r(b, 2, 4, 12, 1, 0x2a2a2a); r(b, 3, 6, 10, 1, 0x2a2a2a); outline(b, 0x2a2a2a); put('cartel_cc', b);
  }
};

// ---------------------------------------------------------------- la aldea
const CC = { W: 64, H: 44, cx: 0, cy: 0 };
CC.build = function () {
  const W = CC.W, H = CC.H, w = new World('campocamara', W, H, T.SCRUB), R = RNG(4242);
  w.outdoor = true; w.defaultArea = 'Campocámara'; w.lairs = []; w.mapTitle = 'Campocámara';
  const n = (x, y) => (Math.sin(x * 0.31 + y * 0.17) + Math.sin(x * 0.11 - y * 0.27 + 2) + Math.sin(x * 0.05 + y * 0.07)) / 3;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = n(x, y); w.set(x, y, v > 0.35 ? T.FIELD : v < -0.4 ? T.OLIVAR : v < -0.15 ? T.SAND : T.SCRUB); }
  for (let x = 0; x < W; x++) { w.set(x, 0, T.MOUNTAIN); w.set(x, 1, T.MOUNTAIN); w.set(x, H - 1, T.MOUNTAIN); w.set(x, H - 2, T.MOUNTAIN); }
  for (let y = 0; y < H; y++) { w.set(W - 1, y, T.MOUNTAIN); w.set(W - 2, y, T.MOUNTAIN); w.set(0, y, T.MOUNTAIN); }
  // el camino desde Los Llanos (entra por el oeste) y la salida de las rodadas, al este
  w.fill(0, 24, 18, 2, T.TRACK); w.fill(52, 24, 10, 2, T.TRACK);
  // calles empedradas
  const hs = [13, 24, 35], vs = [16, 28, 40, 52];
  for (const h of hs) w.fill(16, h, 38, 2, T.PAVING);
  for (const v of vs) w.fill(v, 13, 2, 24, T.PAVING);
  // casas: tejado, dos filas de fachada blanca y la puerta abajo, a la calle
  w.roofMeta = new Map();
  const house = (x, hw, y0, y1, door) => {
    const roof = R.int(3) === 0 ? T.ROOF_DARK : T.ROOF;
    for (let yy = y0; yy <= y1 - 2; yy++) for (let xx = x; xx < x + hw; xx++) w.set(xx, yy, roof);
    const meta = { x0: x, x1: x + hw - 1, y0, yb: y1 - 2, ridge: y0 + Math.max(0, Math.floor((y1 - 2 - y0) / 2)), tone: R.int(4) };
    for (let yy = y0; yy <= y1 - 2; yy++) for (let xx = x; xx < x + hw; xx++) w.roofMeta.set(yy * W + xx, meta);
    if (R.next() < 0.5) w.prop('chimenea_t', x + 1 + R.int(Math.max(1, hw - 2)), meta.ridge + 1);
    for (let xx = x; xx < x + hw; xx++) { w.set(xx, y1 - 1, R.next() < 0.4 ? T.WINDOW : T.WALL_WHITE); w.set(xx, y1, R.next() < 0.25 ? T.WINDOW : T.WALL_WHITE); }
    const dx = door !== undefined ? door : x + R.int(hw); w.set(dx, y1, T.DOOR); w.block(dx, y1, 1, 1);
    if (R.next() < 0.3 && w.get(dx + 1, y1 + 1) === T.PAVING) w.prop('maceta', dx + 1, y1 + 1, dx + 1, y1 + 1, 1, 1);
    return dx;
  };
  const row = (x0, x1, y0, y1, skip) => { let x = x0; while (x <= x1) { let hw = Math.min(3 + R.int(3), x1 - x + 1); if (x1 - (x + hw - 1) < 3) hw = x1 - x + 1; if (!skip || !skip(x, hw)) house(x, hw, y0, y1); x += hw; } };
  // bloques entre calles (y 15..23 y 26..34)
  for (const [x0, x1] of [[18, 27], [42, 51]]) row(x0, x1, 15, 23, (x, hw) => x0 === 42 && x <= 48 && x + hw > 44);
  for (const [x0, x1] of [[18, 27], [30, 39], [42, 51]]) row(x0, x1, 26, 34);
  // la casa de enfrente de la plaza (la ventana del niño): sola, en el bloque de arriba a la derecha
  w.fill(42, 15, 10, 9, T.SCRUB);
  CC.door = [house(43, 6, 15, 23, 46), 23];
  for (let x = 49; x <= 51; x++) for (let y = 15; y <= 23; y++) w.set(x, y, T.GRASS);
  w.prop('almendro0', 50, 19, 50, 19, 1, 1);
  // plazuela con el pilón
  w.fill(30, 15, 10, 9, T.PAVING);
  w.prop('pilon', 34, 18.4, 32, 17, 5, 2).id = 'q_cc_pilon';
  w.prop('banco', 31, 21); w.prop('banco', 38, 16);
  // alrededores: olivos, almendros y algún coche muerto
  for (let i = 0; i < 70; i++) {
    const x = 3 + R.int(W - 6), y = 3 + R.int(H - 6);
    if (x >= 14 && x <= 55 && y >= 11 && y <= 38) continue;
    if (Math.abs(y - 24.5) < 2.5) continue;
    if (w.solid(x, y) || w.solid(x, y + 1)) continue;
    const t = w.get(x, y); const k = t === T.OLIVAR ? 'olivo' + R.int(3) : R.next() < 0.5 ? 'almendro' + R.int(2) : 'retama0';
    if (Art.P[k]) w.prop(k, x, y, x, y, 1, 1);
  }
  w.prop('coche1', 8, 28, 7, 28, 3, 1);
  w.prop('cartel_cc', 13, 23).id = 'cartel:CAMPOCÁMARA · Pozo Alcón (Jaén)';
  // salida a Los Llanos
  const back = new Warp(0, 23, 1, 4, 'exterior', CC.exitX * 16 + 8, (CC.exitY + 0) * 16 + 8, 2); back.load = true; w.warps.push(back);
  w.set(0, 24, T.TRACK); w.set(0, 25, T.TRACK);
  const a = new Area('Campocámara', 14, 11, 42, 28); a.noSpawn = true; w.areas.push(a);
  const pl = new Area('Plaza de Campocámara', 30, 15, 10, 9); pl.noSpawn = true; w.areas.push(pl);
  w.regionFn = () => { const r = new Area('Campos de Campocámara', 0, 0, 0, 0); r.tier = 1.2; return r; };
  w.labels = [['Campocámara', 34, 12], ['← Los Llanos', 6, 22]];
  return w;
};
SECCIONES.campocamara = { name: 'Campocámara', scene: 'valle', orden: -9 };
// el camino que sale de Los Llanos hacia el este, hasta el borde del valle
const _bwMS = G.buildWorlds;
G.buildWorlds = function () {
  _bwMS.call(this);
  const ow = this.worlds.exterior;
  let y0 = 111; while (y0 > 95 && ow.get(216, y0) !== T.TRACK && ow.get(215, y0) !== T.TRACK && ow.get(214, y0) !== T.TRACK) y0--;
  for (let y = y0; y <= 115; y++) ow.set(215, y, T.TRACK), ow.unblock(215, y, 1, 1);
  for (let x = 215; x < ow.w; x++) { ow.set(x, 114, T.TRACK); ow.set(x, 115, T.TRACK); ow.unblock(x, 114, 1, 2); }
  ow.props = ow.props.filter(pr => !(pr.x / 16 >= 213 && pr.y / 16 >= y0 - 1 && pr.y / 16 <= 117 && (Math.abs(pr.x / 16 - 215.5) < 2 || pr.y / 16 >= 113)));
  const wp = new Warp(ow.w - 1, 113, 1, 4, 'campocamara', 3 * 16 + 8, 24 * 16 + 8, 3); wp.load = true; ow.warps.push(wp);
  CC.exitX = ow.w - 3; CC.exitY = 114;
  if (ow.labels) ow.labels.push(['Campocámara →', 206, 112]);
  ow.areas.push(new Area('Camino de Campocámara', 210, 108, 10, 10));
  this.mapCanvas = this.buildMap(ow);
};
const _gwMS = G.getWorld;
G.getWorld = function (id) {
  if (id === 'campocamara' && !this.worlds[id]) { const w = CC.build(); w.pickups = []; this.worlds[id] = w; Q.refresh(); return w; }
  return _gwMS.call(this, id);
};
// dentro de la casa: la cocina
Q.exits.q_casa_cc = [8, () => CC.door, 'campocamara'];
const _qwMS = Q.worlds;
Q.worlds = function () {
  const ws = _qwMS();
  const w = qRoom('q_casa_cc', 16, 11, 'La casa de enfrente'); w.dark = 0.6; w.fromQuest = true; for (const a of w.areas) a.safe = false;
  w.wall('ventana_int', 11 * 16, 2 * 16 - 2);
  w.prop('mesa_camilla', 6, 6, 5, 5, 2, 2); w.prop('encimera', 12, 3.6, 12, 3, 2, 1); w.prop('frigo', 14, 4, 14, 3, 1, 2);
  w.fill(2, 1, 2, 2, T.STAIRS);
  ws[w.id] = w;
  return ws;
};

// ---------------------------------------------------------------- la misión
const MS_PISTAS = ['pilon', 'mujer', 'bolsa', 'casa'];
Q.defs.malasuerte = {
  title: 'Mala suerte',
  steps: s => ['', 'Ve a Campocámara, pasando Los Llanos hacia el este.', 'Averigua qué ha pasado en Campocámara (' + Object.keys(Q.d('malasuerte').p || {}).length + '/4).', 'Los vecinos de Campocámara se han levantado.', 'Sigue las rodadas del coche: el forastero se ha ido hacia el pantano.', 'Habla con el forastero de la Venta del Pantano.'][s] || '',
  place() {
    const s = Q.st('malasuerte'), d = Q.d('malasuerte');
    if (G.worlds.campocamara) {
      // los dos de la calle siguen ahí hasta que se levantan
      if (s < 3) { Q.prop('campocamara', 'cuerpo', 'q_cc_mujer', 36, 22); Q.prop('campocamara', 'cuerpo', 'q_cc_viejo', 46, 25.4); }
      Q.prop('campocamara', 'mancha', 'q_cc_m1', 36.5, 22.4);
      Q.prop('campocamara', 'bolsa', 'q_cc_bolsa', 44, 25);
      Q.prop('campocamara', 'compuerta', 'q_cc_puerta', CC.door[0], CC.door[1], { hidden: true });
      Q.prop('campocamara', 'mancha', 'q_cc_m2', CC.door[0], CC.door[1] + 1.2);
      Q.prop('campocamara', 'rodadas', 'q_cc_rodadas', 57, 25.8);
    }
    Q.prop('q_casa_cc', 'vaso_roto', 'q_cc_vaso', 12, 2.6);
    Q.prop('q_casa_cc', 'mancha', 'q_cc_m3', 13, 6); Q.prop('q_casa_cc', 'mancha', 'q_cc_m4', 11, 7.5);
    Q.prop('q_casa_cc', 'compuerta', 'q_cc_escalera', 2.5, 3, { hidden: true });
    if (G.worlds.pantano && s >= 4) {
      const pw = G.worlds.pantano;
      { const [x, y] = Q.free(pw, 58, 141); Q.npc('pantano', 'ventero', 'El ventero', x, y); }
      if (s < QDONE) { const [x, y] = Q.free(pw, 61, 141); Q.npc('pantano', 'juan', 'El forastero', x, y, { mark: () => Q.st('malasuerte') === 5 }); }
    }
    if (s >= QDONE && d.fin === 'entregado') { const [x, y] = Q.free(G.worlds.exterior, 34, 99); Q.npc('exterior', 'juan', 'Juan, el forastero', x, y); }
  },
  talk(n) {
    const s = Q.st('malasuerte'), d = Q.d('malasuerte');
    if (n.key === 'mecanica' && G.stage >= ETAPA.IGLESIA && s === 0) {
      G.sayAs(n, '¿Te has fijado? Ayer pasó un coche por el camino de Los Llanos. Un coche con motor, que no sé yo de dónde sacaría gasolina.',
        'Iba hacia Campocámara. Y hoy no ha bajado nadie de allí con los huevos, y eso no pasa nunca. Allí quedan cuatro gatos, pero gente buena.',
        '¿Te acercas tú? Es pasando Los Llanos, siguiendo el camino hacia el este, hasta donde se acaba el valle.');
      G.dlgEnd = () => Q.set('malasuerte', 1);
      return true;
    }
    if (n.key === 'ventero' && n.q) { G.sayAs(n, s >= QDONE ? 'Aquí paran los que vienen de lejos. Cada vez menos, gracias a Dios.' : 'Pasa, pasa. Hay potaje y vino del año. El de la mesa del fondo llegó anoche en coche. ¡En coche, fíjate!'); return true; }
    if (n.key === 'juan' && n.q && s === 5) {
      G.sayAs(n, 'Juan. Me llamo Juan. Iba de paso, ¿sabes? Hasta con el mundo acabado uno se busca unas vacaciones. Vi el cartel de Campocámara y me dio por parar.',
        'Tropecé. Me agarré a una barra del pilón y la arranqué. Hasta cómico fue, te lo juro: yo de culo, con la barra en la mano. Y la barra salió volando hacia atrás.',
        'Una mujer. Justo ahí. Ni la había visto.',
        'Y luego un viejo con su bolsa de la compra, mirándome. Echó a correr. ¿Qué iba a hacer yo? Una muerte accidental y una muerte táctica. Dicho así suena peor de lo que fue.',
        'Y la casa de enfrente... Ya has estado en la casa. No me hagas contarlo.',
        'Yo siempre he sido buena persona. Siempre. Los padres no habrían soportado llegar y encontrarse aquello, ¿entiendes? Les ahorré el disgusto.',
        'Mala suerte. Eso es lo que fue. Me crucé en el camino de la mala suerte de aquel día.');
      G.dlgEnd = () => G.ask('Juan', 'Juan te mira esperando algo. Comprensión, quizá. Tiene las manos limpias; se lavó por el camino.', ['Llevarlo ante el Padre Tomás.', 'Dejarlo ir. Fue mala suerte.', 'Decirle a la cara lo que es.'], k => {
        const fin = (f, txt) => { d.fin = f; G.say('Guardián', ...txt); G.dlgEnd = () => { Q.reward(400, 1, f === 'entregado' ? (p => { p.maxFe += 10; p.fe = p.maxFe; }) : null); Q.set('malasuerte', QDONE); }; };
        if (k === 0) { G.balance = (G.balance || 0) + 1; fin('entregado', ['Juan no se resiste. Pregunta, eso sí, si en la sacristía hay leche.', 'Padre Tomás le escuchará. Dios sabrá qué hacer con él. Yo no.', '(+1 en la balanza · +400 XP · +1 punto de habilidad · Fe máxima +10)']); }
        else if (k === 1) { G.balance = (G.balance || 0) - 2; fin('libre', ['Juan me da las gracias. Paga el potaje, arranca el coche y se va carretera arriba.', 'Hace cuarenta minutos que dejó de ser él, y a lo mejor nunca lo vuelve a ser. Pero sigue suelto.', '(−2 en la balanza · +400 XP · +1 punto de habilidad)']); }
        else {
          G.sayAs(n, '¿Asesino? ¿Yo? Yo soy una víctima, ¿no lo ves? Una víctima absurda del destino.', '(Saca la barra del pilón de debajo de la mesa. Todavía tiene sangre seca.) Mala suerte, Guardián.');
          G.dlgEnd = () => {
            const w = G.worlds.pantano; w.npcs = w.npcs.filter(x => x !== n);
            Q.foe(w, 'juan', 'Juan, el de la barra', n.x, n.y - 4, { hp: 340, dmg: 17, sp: 54, xp: 300, boss: true, st: { range: 70, wind: 0.55, atk: 0.3, rec: 0.7 }, props: { dash: 210 },
              onDeath: () => G.ask('Juan', 'Juan está en el suelo, llorando. «Víctima y verdugo», dice. «Las dos cosas.»', ['Atarlo y llevarlo ante el Padre Tomás.', 'Terminar con él, con su propia barra.'], j => {
                if (j === 0) { G.balance = (G.balance || 0) + 1; fin('entregado', ['Lo ato con la cuerda del pozo de la venta. No para de pedir perdón a nadie en concreto.', '(+1 en la balanza · +400 XP · +1 punto de habilidad · Fe máxima +10)']); }
                else { G.balance = (G.balance || 0) - 1; d.fin = 'muerto'; G.say('Guardián', 'Una muerte táctica, me diría él.', 'Me quedo la barra. Pesa más de lo que debería. (−1 en la balanza · +400 XP · +1 punto de habilidad · Ataque +2)'); G.dlgEnd = () => { Q.reward(400, 1, p => { p.atk += 2; }); Q.set('malasuerte', QDONE); }; }
              }) });
          };
        }
      });
      return true;
    }
    if (n.key === 'juan' && n.q && s >= QDONE) { G.sayAs(n, 'Mala suerte, ¿eh? Al Padre le he contado que soy buena persona. Creo que no se lo cree.'); return true; }
    if (n.key === 'juan' && n.q) { G.sayAs(n, '(El forastero come despacio, mirando el plato. No levanta la vista.)'); return true; }
  },
  use(pr) {
    const s = Q.st('malasuerte'), d = Q.d('malasuerte');
    const pista = (k, ...txt) => {
      G.say('Guardián', ...txt);
      if (s === 2 && MS_PISTAS.includes(k)) { d.p = d.p || {}; if (!d.p[k]) { d.p[k] = 1; const n = Object.keys(d.p).length; G.dlgEnd = () => { if (n >= 4) Q.levantar(); else { G.toast('Mala suerte: ' + Q.defs.malasuerte.steps(2)); G.save(); } }; } }
      return true;
    };
    switch (pr.id) {
      case 'q_cc_pilon': return pista('pilon', 'El pilón de la plaza, con su barandilla de hierro. Le falta una barra: arrancada de cuajo. La rotura está limpia, reciente.');
      case 'q_cc_mujer': return pista('mujer', 'Una mujer, en mitad de la plaza. No es un engendro: es una vecina. Tiene una herida en el cuello, como de lanza.', 'Quien lo hizo se llevó el arma.');
      case 'q_cc_viejo': case 'q_cc_bolsa': return pista('bolsa', 'Una bolsa de la compra reventada: pan, unas naranjas, un paquete de garbanzos. Y al lado, un hombre mayor.', 'Le alcanzaron corriendo. Por la espalda.');
      case 'q_cc_m1': case 'q_cc_m2': case 'q_cc_m3': case 'q_cc_m4': G.say('Guardián', 'Sangre. Ya seca.'); return true;
      case 'q_cc_puerta': Q.go('q_casa_cc'); G.toast('La puerta está abierta. Huele a hierro.'); return true;
      case 'q_cc_vaso': return pista('casa', 'Un vaso de leche estrellado contra la pared. Alguien se sentó aquí, tan tranquilo, a beberse un vaso de leche de la granja.', 'En el suelo, junto a la puerta de atrás, dos bultos que no voy a describir. Los dueños de la casa.');
      case 'q_cc_escalera': G.say('Guardián', 'Arriba no subo. No hace falta.', 'De ahí arriba baja un silencio que no es de casa vacía. En la ventana de la calle había alguien pequeño. Ya no.'); return true;
      case 'q_cc_rodadas': G.say('Guardián', 'Rodadas de coche, frescas, en el polvo de la salida. Un coche con gasolina, después del Colapso.', s >= 4 ? 'Van hacia la carretera del pantano. Allí solo queda un sitio donde comer caliente: la Venta del Pantano.' : 'Alguien se fue de aquí con prisa.'); if (s === 4) G.toast('La Venta del Pantano, en la carretera del pantano.'); return true;
    }
  },
  enter(id) {
    const s = Q.st('malasuerte');
    if (id === 'campocamara') {
      if (s <= 1) { G.say('Guardián', 'Campocámara. Calles empedradas y treinta casas como mucho. Acogedor, apacible... y en silencio. Ni un perro ladra.'); Q.set('malasuerte', 2); }
      if (s === 3 && !G.world.monsters.some(m => m.ccVecino && !m.dead)) Q.levantar(true);
    }
  },
  tick() {
    const s = Q.st('malasuerte'), d = Q.d('malasuerte');
    if (s !== 4 || G.world.id !== 'pantano' || d.oyo) return;
    const p = G.player, a = G.world.areaName(Math.floor(p.x / TS), Math.floor(p.y / TS));
    if (a !== 'Venta del Pantano') return;
    const v = G.world.npcs.find(n => n.key === 'ventero' && n.q), j = G.world.npcs.find(n => n.key === 'juan' && n.q);
    if (!v || !j) return;
    d.oyo = true;
    G.sayAs(v, '¡Menuda cara traes, hombre! ¡Ni que hubieras visto a un muerto!');
    G.sayAs(j, '(El forastero levanta la vista del plato y sonríe, muy poco.)', 'O cinco.');
    G.dlgEnd = () => Q.set('malasuerte', 5);
  },
};
// los que mueren mal ya no se quedan quietos
Q.levantar = function (again) {
  const w = G.worlds.campocamara; if (!w) return;
  if (!again) { Q.set('malasuerte', 3, false); G.shake(0.5); Sound.play('roar'); G.say('Guardián', 'Un ruido a mi espalda. Los vecinos de Campocámara se están levantando.', 'Después del Colapso, los que mueren mal no se quedan quietos.'); }
  if (G.world !== w) return;
  let left = 0;
  for (const [x, y] of [[36, 22], [46, 25], [CC.door[0] - 1, CC.door[1] + 1], [CC.door[0] + 1, CC.door[1] + 1]]) {
    const m = new Monster(MK.HUECO, x * TS + 8, y * TS + 8, 1.25); m.customName = 'Vecino de Campocámara'; m.aggro = true; m.spawnFade = 1.2; m.ccVecino = true; m.quest = true;
    left++; m.onDeath = () => { if (--left === 0) { G.say('Guardián', 'Descansad. Ahora sí.', 'En la salida de la aldea, hacia el este, hay rodadas de coche.'); G.dlgEnd = () => Q.set('malasuerte', 4); } };
    w.monsters.push(m);
  }
};
Q.marks.mecanica = () => G.stage >= ETAPA.IGLESIA && Q.st('malasuerte') === 0;
// la flecha del objetivo, desde Campocámara, apunta a la salida
const _lateMS = Q.late;
Q.late = function () {
  _lateMS();
  const _arrow = G.arrowTarget;
  G.arrowTarget = function () { if (this.world && this.world.id === 'campocamara' && this.objectiveTarget()) return [0, 24]; return _arrow.call(this); };
};
