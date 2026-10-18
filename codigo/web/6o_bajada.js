// ====================================================================== LOS TIBIOS · capítulo V: la Bajada, y los tres finales
// Los demonios sitian Pozo Alcón y por fin bajan los ángeles. El Guardián baja por la caseta, por las
// escaleras en tramos de tres, donde su reloj va «en dirección contraria a su dirección en el cielo».
// Abajo: el líder sin nombre, el objeto del atril y el Anticristo, con Miguel peleando a su lado.
// Al final deja de ser tibio: Cielo, Tierra o Infierno.
SECCIONES.abajo = { name: 'Bajo la caseta', scene: 'escaleras', orden: -9 };

// ---------------------------------------------------------------- las escaleras y el atril
const ABJ = { rooms: [], hours: [2, 4, 5], good: [0, 2, 1] };
ABJ.build = function () {
  const W = 64, H = 44, w = new World('abajo', W, H, T.WALLTOP);
  w.mono = true; w.dark = 0.62; w.defaultArea = 'Las escaleras'; w.mapTitle = 'Bajo la caseta';
  ABJ.rooms = [];
  for (let i = 0; i < 3; i++) {
    const x0 = 2 + i * 20, y0 = 3, ww = 18, hh = 14;
    w.fill(x0, y0, ww, hh, T.CONCRETE);
    for (let x = x0; x < x0 + ww; x++) { w.set(x, y0, T.IWALL_HI); w.set(x, y0 + 1, T.IWALL_STONE); }
    // las paredes que dibujan triángulos: dos cuñas de piedra a los lados
    for (let k = 0; k < 5; k++) for (let j = 0; j <= k; j++) { w.set(x0 + j, y0 + 6 + k, T.IWALL_STONE); w.set(x0 + ww - 1 - j, y0 + 6 + k, T.IWALL_STONE); }
    const exits = [[x0 + 3, y0 + 2], [x0 + 9, y0 + 2], [x0 + 14, y0 + 2]];
    for (const [ex, ey] of exits) w.set(ex, ey, T.STAIRS);
    const h = ABJ.hours[i], good = ABJ.good[i], other = (h + 3) % 12 || 9;
    const shown = [0, 1, 2].map(k => k === good ? (12 - h) : k === (good + 1) % 3 ? h : other);
    ABJ.rooms.push({ x0, y0, ww, hh, entry: [x0 + 9, y0 + 12], exits, shown, good, h });
    w.areas.push(new Area(['Primer tramo', 'Segundo tramo', 'Tercer tramo'][i], x0, y0, ww, hh));
  }
  // el atril: un sitio muy angosto, con un hueco por el que entra algo de luz
  const cx0 = 24, cy0 = 24;
  w.fill(cx0, cy0, 16, 13, T.PAVING);
  for (let x = cx0; x < cx0 + 16; x++) { w.set(x, cy0, T.IWALL_HI); w.set(x, cy0 + 1, T.IWALL_STONE); }
  for (let k = 0; k < 4; k++) for (let j = 0; j <= k; j++) { w.set(cx0 + j, cy0 + 2 + k, T.IWALL_STONE); w.set(cx0 + 15 - j, cy0 + 2 + k, T.IWALL_STONE); }
  w.prop('haz_luz', 32, 29.6).light = 1;
  w.prop('atril', 32, 30, 31, 30, 3, 1).id = 'atril_final';
  w.prop('escalera_abajo', 32, 36).id = 'abajo_subir';
  ABJ.chamber = { x0: cx0, y0: cy0, entry: [32, 35] };
  w.areas.push(new Area('El atril', cx0, cy0, 16, 13));
  for (const a of w.areas) a.safe = false;
  // la salida de vuelta (en el primer tramo, abajo)
  w.prop('escalera_abajo', ABJ.rooms[0].entry[0], ABJ.rooms[0].entry[1] + 1).id = 'abajo_subir';
  return w;
};
const _gwB = G.getWorld;
G.getWorld = function (id) { if (id === 'abajo' && !this.worlds.abajo) { const w = ABJ.build(); w.pickups = []; this.worlds.abajo = w; return w; } return _gwB.call(this, id); };
ABJ.roomAt = (tx, ty) => ABJ.rooms.findIndex(r => tx >= r.x0 && tx < r.x0 + r.ww && ty >= r.y0 && ty < r.y0 + r.hh);
ABJ.toRoom = function (i) { const r = ABJ.rooms[i]; G.player.x = r.entry[0] * 16 + 8; G.player.y = r.entry[1] * 16 + 8; G.player.dir = 1; G.snapCamera(); ABJ.room = i; };
ABJ.toChamber = function () {
  const c = ABJ.chamber, E = ETAPA, w = G.worlds.abajo;
  G.player.x = c.entry[0] * 16 + 8; G.player.y = c.entry[1] * 16 + 8; G.player.dir = 1; G.snapCamera(); ABJ.room = 3;
  if (G.stage === E.BAJADA) { G.stage = E.ATRIL; G.save(); }
  if (G.stage === E.ATRIL && !w.monsters.some(m => m.lider && !m.dead)) ABJ.lider();
  if (G.stage === E.ANTICRISTO && !w.monsters.some(m => m.anticristo && !m.dead)) ABJ.anticristo(true);
};

// ---------------------------------------------------------------- jefes finales
ABJ.foe = function (key, name, x, y, o) {
  const w = G.worlds.abajo, m = new Monster(MK.HUMANO, x, y, 1);
  m.set = Art.people[key]; m.customName = name; m.maxHp = m.hp = o.hp; m.dmg = o.dmg; m.speed = o.sp; m.xp = o.xp;
  m.st = Object.assign({}, m.st, o.st || {}); Object.assign(m, o.props || {});
  m.aggro = true; m.spawnFade = 0.8; m.quest = true; w.monsters.push(m); G.boss = m; return m;
};
ABJ.lider = function () {
  const w = G.worlds.abajo, c = ABJ.chamber;
  w.npcs = w.npcs.filter(n => !n.abj);
  for (const [x, y] of [[c.x0 + 4, c.y0 + 8], [c.x0 + 11, c.y0 + 8]]) { const n = new Npc('Individuo', 'hombrecillo', Art.people.hombrecillo, null, null, x * 16 + 8, y * 16 + 13, 0); n.abj = true; w.npcs.push(n); }
  G.say('El líder', 'Estás en el infierno.', 'Pero esto es solo una parte. Concretamente, es el infierno que hay en este mundo.',
    'Volviste. Sabía que volverías. Los tibios siempre vuelven a lo que no terminaron.', 'Uno de los míos preguntó una vez qué pasaría si alguien tocara el objeto del atril. Le dije que sería fatal. ¿Quieres saber para quién?');
  G.dlgEnd = () => {
    ABJ.foe('lider', 'El más horrible de todos', 32 * 16 + 8, 31 * 16, { hp: 780, dmg: 20, sp: 50, xp: 700, st: { range: 30, atk: 0.24 }, props: { blink: true, drain: 8, lider: true } });
    for (let i = 0; i < 2; i++) { const m = new Monster(MK.HUECO, (c.x0 + 3 + i * 10) * 16, (c.y0 + 7) * 16, 1.9); m.aggro = true; m.spawnFade = 1; w.monsters.push(m); }
    Sound.play('roar'); G.shake(0.6);
  };
};
ABJ.anticristo = function (again) {
  const w = G.worlds.abajo, c = ABJ.chamber, E = ETAPA;
  // Miguel baja a pelear al lado del Guardián
  w.npcs = w.npcs.filter(n => n.key !== 'miguel_pie' && !n.abj);
  const mg = new Npc('Miguel', 'miguel_pie', Art.people.miguel_pie, null, null, (c.x0 + 5) * 16 + 8, (c.y0 + 9) * 16 + 13, 3); mg.ally = { dmg: 30, cd: 2.6, t: 2, heal: 5 }; w.npcs.push(mg);
  const go = () => { ABJ.foe('anticristo', 'El hombre de blanco', 32 * 16 + 8, 31 * 16, { hp: 1400, dmg: 22, sp: 54, xp: 1500, st: { range: 30, atk: 0.22, rec: 0.5 }, props: { blink: true, drain: 10, anticristo: true } }); ABJ.sumT = 9; Sound.play('roar'); G.shake(0.9); };
  if (again) { go(); return; }
  const f = G.flags;
  G.say('El hombre de blanco', 'Bajó la escalera sin hacer ruido, con el traje blanco impecable.',
    f.has('trato_aceptado') ? 'Hicimos un trato en la presa, ¿recuerdas? Me estrechaste la mano. Vengo a cobrarlo.' : f.has('trato_dudado') ? 'Me dijiste que lo pensarías. Ya has tenido tiempo, tibio.' : 'Me dijiste que no en la presa. Nadie me dice que no dos veces.',
    'Ese reloj que llevas en las manos no cierra nada. Solo cuenta. Y yo tengo todo el tiempo del mundo.');
  G.dlgEnd = () => {
    Sound.play('purify'); G.shake(0.5);
    G.say('Miguel', '(Una luz rompe el techo de piedra y Miguel baja por ella, de pie, con las alas abiertas.)', 'Te dije que tendrías que dejar de serlo, tibio. Hoy no peleas solo.');
    G.dlgEnd = () => { G.stage = E.ANTICRISTO; G.save(); go(); };
  };
};
// el hombre de blanco no siente el acero como siente la Luz
const _dmgB = G.damageMonster;
G.damageMonster = function (m, d, crit, kx, ky, holy) { if (m.anticristo && !holy) d = Math.max(1, Math.round(d * 0.6)); return _dmgB.call(this, m, d, crit, kx, ky, holy); };
const _killB = G.killMonster;
G.killMonster = function (m) {
  _killB.call(this, m);
  const E = ETAPA;
  if (m.lider && this.stage === E.ATRIL) {
    this.boss = null; for (const o of this.world.monsters) if (!o.dead && o !== m) o.dead = true;
    this.say('Guardián', 'El más horrible de todos se queda sentado en el suelo, como un niño cansado. «No va hacia atrás», murmura. «Fíjate bien.»', 'Y se deshace. Los dos individuos me miran. Ahora su extraña morfología ya no me parece tan anómala. Son hermanos. Salen corriendo escaleras arriba.');
    this.world.npcs = this.world.npcs.filter(n => !n.abj);
    this.dlgEnd = () => ABJ.anticristo(false);
  }
  if (m.anticristo && this.stage === E.ANTICRISTO) {
    this.boss = null; for (const o of this.world.monsters) if (!o.dead) o.dead = true;
    Sound.play('purify'); this.shake(1.2);
    for (let i = 0; i < 60; i++) this.fx.push(Fx.spark(m.x, m.y - 16, this.rnd.gauss() * 90, -this.rnd.next() * 110, i % 2 ? 0xfff4d0 : 0xd8d0c0, 1.3));
    this.stage = E.ELECCION; this.save();
    this.say('Guardián', 'El hombre de blanco se rompe como un espejo. Cada trozo refleja una cara distinta del pueblo. Ninguna es la suya.', 'Miguel baja las alas. «El atril, tibio. Ahora ya puedes mirarlo.»');
  }
};

// ---------------------------------------------------------------- el reloj de pulsera y el acertijo de las escaleras
ABJ.check = function () {
  const w = G.worlds.abajo, p = G.player, tx = Math.floor(p.x / 16), ty = Math.floor(p.y / 16);
  const i = ABJ.roomAt(tx, ty); if (i < 0) return;
  const r = ABJ.rooms[i], k = r.exits.findIndex(([ex, ey]) => ex === tx && ey === ty);
  if (k < 0) return;
  if (k === r.good) {
    Sound.play('door');
    if (i < 2) { ABJ.toRoom(i + 1); G.toast(['Otro tramo. Tres escalones. Otro tramo. Tres más.', 'Las paredes siguen dibujando triángulos. El reloj sigue yendo al revés.'][i]); if (i + 1 === 1) ABJ.hermanos(); }
    else { G.toast('De manera súbita, llego al final.'); ABJ.toChamber(); }
  } else {
    ABJ.loops = (ABJ.loops || 0) + 1; ABJ.toRoom(i); Sound.play('hit');
    G.toast('Los tramos se suceden uno tras otro sin llegar nunca al final. Estoy otra vez donde empecé.');
    if (ABJ.loops === 2) G.say('Una voz desde abajo', '(Con insuperable calma.) No va hacia atrás. Fíjate bien: solo va en dirección contraria a su dirección en el cielo.');
    if (ABJ.loops === 5) G.say('Guardián', 'Mi reloj marca una hora. Los relojes de las salidas marcan otras. Uno de ellos es mi reloj... mirado desde el otro lado.');
  }
};
// los dos individuos cansados del segundo tramo
ABJ.hermanos = function () {
  const w = G.worlds.abajo, r = ABJ.rooms[1];
  if (w.npcs.some(n => n.key === 'hombrecillo' && n.tramo)) return;
  for (const [x, y] of [[r.x0 + 4, r.y0 + 7], [r.x0 + 5, r.y0 + 8]]) { const n = new Npc('Individuo cansado', 'hombrecillo', Art.people.hombrecillo, null, null, x * 16 + 8, y * 16 + 13, 3); n.tramo = true; w.npcs.push(n); }
};
const _talkB = G.talk;
G.talk = function (n) {
  const E = ETAPA, st = this.stage;
  if (n.key === 'hombrecillo' && n.tramo) {
    Sound.play('talk');
    this.sayAs(n, '(Buscan llevar el poco oxígeno que hay aquí a sus pulmones.) ¿Tú también bajas?', '¿Cómo sabes cómo es la subida al cielo, si no quisiste ir? ... Ya. Algunos lo recuerdan sin haber estado.',
      'El final está muy cerca. Pero nosotros no seguimos bajando: la subida será horrible.', 'Si te pierdes, mira tu reloj. Y luego mira los otros. Uno de ellos eres tú, al revés.');
    return;
  }
  if (n.key === 'miguel_pie') { Sound.play('talk'); this.sayAs(n, st >= E.ELECCION ? 'El atril. Ahora decides tú. Por eso te quedaste aquí siete años.' : st >= E.BAJADA ? 'Baja, tibio. Yo voy detrás.' : 'La plaza es nuestra. Por ahora.'); return; }
  if (n.key === 'candida' && st >= E.VUELTA) {
    Sound.play('talk');
    if (st >= E.FIN) { this.sayAs(n, this.flags.has('final_tierra') ? 'Mañana subimos a ver al abuelo. Y pasado, también. Ya no hay prisa.' : 'Te esperé siete años. Puedo esperar lo que haga falta.'); return; }
    if (st === E.BAJADA || st === E.ATRIL || st === E.ANTICRISTO) { this.sayAs(n, 'Si no vuelves, te espero. Ya sé esperar.', 'Y si vuelves... no me sueltes la mano esta vez.'); return; }
    this.sayAs(n, 'He llegado por el camino de los pastores. Te esperaba en la plaza. Como en el sueño.'); return;
  }
  return _talkB.call(this, n);
};

// ---------------------------------------------------------------- objetivos del capítulo V
const _objB = G.objective;
G.objective = function () {
  const E = ETAPA;
  switch (this.stage) {
    case E.VUELTA: return 'Vuelve a Pozo Alcón con el Reloj del Cielo.' + (this.flags.has('reloj_pulsera') ? '' : ' (El Relojero quiere verte antes.)');
    case E.ASEDIO: { const n = this.worlds.exterior.monsters.filter(m => m.asedio && !m.dead).length; return 'Los demonios sitian Pozo Alcón. Defiende la plaza de la Encarnación.' + (n ? ' (Quedan ' + n + '.)' : ''); }
    case E.BAJADA: return 'Baja por la caseta de turismo con el Reloj del Cielo.';
    case E.ATRIL: return this.world && this.world.id === 'abajo' && ABJ.room !== 3 ? 'Baja las escaleras. Fíjate en tu reloj.' : 'Vence al más horrible de todos.';
    case E.ANTICRISTO: return 'Vence al hombre de blanco, con Miguel a tu lado.';
    case E.ELECCION: return 'Ve al atril. Deja de ser tibio.';
    case E.FIN: return 'Fin. Pozo Alcón es tuyo: sigue explorando, quedan historias raras por el valle.';
  }
  return _objB.call(this);
};
const _objTB = G.objectiveTarget;
G.objectiveTarget = function () {
  const E = ETAPA;
  switch (this.stage) {
    case E.VUELTA: return this.flags.has('reloj_pulsera') ? [WG.fireX, WG.fireY + 1, 'exterior'] : (SIE.door ? [SIE.door[0], SIE.door[1] + 1, 'sierra'] : null);
    case E.ASEDIO: { // la flecha va al demonio más cercano que quede
      const w = this.worlds.exterior, p = this.player, ms = w.monsters.filter(m => m.asedio && !m.dead);
      if (ms.length && this.world === w) { ms.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y)); return [Math.floor(ms[0].x / 16), Math.floor(ms[0].y / 16), 'exterior']; }
      return [WG.fireX, WG.fireY + 1, 'exterior'];
    }
    case E.BAJADA: return [WG.casetaX, WG.casetaY + 1, 'exterior'];
    case E.ATRIL: case E.ANTICRISTO: case E.ELECCION: return this.world && this.world.id === 'abajo' ? [32, 31, 'abajo'] : [WG.casetaX, WG.casetaY + 1, 'exterior'];
  }
  return _objTB.call(this);
};

// ---------------------------------------------------------------- el asedio de Pozo Alcón y los ángeles
ABJ.asedio = function () {
  const w = G.worlds.exterior, E = ETAPA;
  if (w.monsters.some(m => m.asedio && !m.dead)) return;
  G.flags.add('asedio_empezado');
  const fx = WG.fireX, fy = WG.fireY;
  const put = (k, x0, y0, t) => { const [x, y] = Q.free(w, x0, y0); const m = new Monster(k, x * 16 + 8, y * 16 + 8, t); m.asedio = true; m.quest = true; m.aggro = true; m.spawnFade = 1.2; w.monsters.push(m); return m; };
  put(MK.DEMONIO, fx - 6, fy + 6, 0.8); put(MK.DEMONIO, fx + 7, fy + 5, 0.8); put(MK.DEMONIO, fx, fy + 10, 0.95);
  for (let i = 0; i < 4; i++) put(MK.SOMBRA, fx - 8 + i * 5, fy + 13, 1.5);
  for (let i = 0; i < 4; i++) put(MK.HUECO, fx - 10 + i * 7, fy + 16, 1.5);
  // los ángeles y Miguel, de pie por fin
  w.npcs = w.npcs.filter(n => n.key !== 'angel' && n.key !== 'miguel' && n.key !== 'miguel_pie');
  const mg = new Npc('Miguel', 'miguel_pie', Art.people.miguel_pie, null, null, fx * 16 + 8, (fy + 4) * 16 + 13, 0); mg.ally = { dmg: 26, cd: 2.4, t: 1, heal: 3 }; w.npcs.push(mg);
  for (const [x, y] of [[fx - 5, fy + 3], [fx + 5, fy + 3]]) { const a = G.spawnAngel(x * 16 + 8, y * 16 + 8); a.ally = { dmg: 18, cd: 3.2, t: 2, heal: 0 }; a.asedioAngel = true; }
  Sound.play('roar'); G.shake(1);
  G.say('Padre Tomás', '¡Hijo! ¡Han bajado! ¡Los dos! ¡Los de arriba y los de abajo!', 'Que el Señor nos coja confesados... y tú, ¡pelea!');
};
ABJ.allyTick = function (dt) {
  const w = G.world, p = G.player;
  for (const n of w.npcs) {
    if (!n.ally) continue;
    n.ally.t -= dt; if (n.ally.t > 0) continue; n.ally.t = n.ally.cd;
    let best = null, bd = 170;
    for (const m of w.monsters) { if (m.dead || (m.vulnerable && !m.vulnerable())) continue; const d = Math.hypot(m.x - n.x, m.y - n.y); if (d < bd) { bd = d; best = m; } }
    if (best) {
      G.beams = G.beams || []; G.beams.push({ x0: n.x, y0: n.y - 18, x1: best.x, y1: best.y - 10, t: 0.3 });
      G.damageMonster(best, n.ally.dmg, false, best.x - n.x, best.y - n.y, true);
      Sound.play('light');
    }
    if (n.ally.heal && Math.hypot(p.x - n.x, p.y - n.y) < 140 && p.hp < p.maxHp) { p.hp = Math.min(p.maxHp, p.hp + n.ally.heal); G.fx.push(Fx.text(p.x, p.y - 30, '+' + n.ally.heal, 0xfff0a0)); }
  }
  if (G.beams) G.beams = G.beams.filter(b => (b.t -= dt) > 0);
};
// lo que se queda encajado en una pared o escondido encima de un tejado (los demonios en picado no chocan) vuelve al suelo
ABJ.unstick = function (w) {
  for (const m of w.monsters) {
    if (m.dead) continue;
    const tx = Math.floor(m.x / 16), ty = Math.floor(m.y / 16);
    if (m.kind === MK.AHOGADO || m.kind === MK.BESTIA || T.isWater(w.get(tx, ty))) continue;
    if (w.solid(tx, ty) && (m.state !== 'atk' || m.stT <= 0)) { const [x, y] = Q.free(w, tx, ty); m.x = x * 16 + 8; m.y = y * 16 + 8; m.homeX = m.x; m.homeY = m.y; }
  }
};
const _updB = G.updatePlay;
G.updatePlay = function (dt) {
  _updB.call(this, dt);
  const E = ETAPA, w = this.world, p = this.player;
  if (!w || this.st !== ST.PLAY && this.st !== ST.DIALOG) return;
  ABJ.allyTick(dt);
  ABJ.unstickT = (ABJ.unstickT || 0) - dt; if (ABJ.unstickT <= 0) { ABJ.unstickT = 1; ABJ.unstick(w); }
  if (w.id === 'exterior') {
    const tx = Math.floor(p.x / 16), ty = Math.floor(p.y / 16), inTown = tx > 10 && tx < 72 && ty > 82 && ty < 140;
    if (this.stage === E.VUELTA && inTown && this.st === ST.PLAY) { this.stage = E.ASEDIO; this.save(); this.playCine('asedio', () => ABJ.asedio()); return; }
    if (this.stage === E.ASEDIO && inTown && this.st === ST.PLAY) {
      ABJ.unstick(w);
      if (!w.monsters.some(m => m.asedio && !m.dead)) {
        if (this.flags.has('asedio_empezado')) {
          this.stage = E.BAJADA; this.flags.delete('asedio_empezado'); this.save();
          w.npcs = w.npcs.filter(n => !n.asedioAngel);
          for (const n of w.npcs) if (n.key === 'miguel_pie') { n.x = (WG.casetaX + 2) * 16 + 8; n.y = (WG.casetaY + 2) * 16 + 13; }
          this.say('Guardián', 'Los últimos demonios se deshacen en ceniza y azufre sobre la plaza. Los ángeles suben, uno a uno, sin mirar atrás.',
            'Miguel se queda. Señala la caseta, junto a la fuente del Músico. La puerta está abierta de par en par. Otra vez.');
        } else ABJ.asedio();
      }
    }
  }
  if (w.id === 'abajo' && this.st === ST.PLAY) {
    ABJ.check();
    const b = this.boss;
    if (b && b.anticristo && !b.dead) { ABJ.sumT = (ABJ.sumT || 9) - dt; if (ABJ.sumT <= 0 && w.monsters.filter(m => !m.dead).length < 4) { ABJ.sumT = 11; for (let i = 0; i < 2; i++) { const s = new Monster(MK.SOMBRA, b.x + this.rnd.gauss() * 40, b.y + this.rnd.gauss() * 30, 1.9); s.aggro = true; s.spawnFade = 0.8; w.monsters.push(s); } } }
  }
};
const _enterB = G.enter;
G.enter = function (id, x, y, dir) {
  _enterB.call(this, id, x, y, dir);
  const E = ETAPA;
  if (id === 'exterior' && this.stage >= E.VUELTA) {
    const w = this.worlds.exterior;
    if (!w.npcs.some(n => n.key === 'candida')) { const n = new Npc('Cándida', 'candida', Art.people.candida, null, null, (WG.fireX + 3) * 16 + 8, (WG.fireY + 1) * 16 + 13, 2); n.story = true; w.npcs.push(n); }
    if (this.stage >= E.BAJADA && !w.npcs.some(n => n.key === 'miguel_pie')) { const n = new Npc('Miguel', 'miguel_pie', Art.people.miguel_pie, null, null, (WG.casetaX + 2) * 16 + 8, (WG.casetaY + 2) * 16 + 13, 0); w.npcs.push(n); }
    if (this.stage === E.ASEDIO && this.flags.has('asedio_empezado') && !w.monsters.some(m => m.asedio && !m.dead)) { this.flags.delete('asedio_empezado'); }
  }
  if (id === 'abajo') { ABJ.loops = 0; }
};

// ---------------------------------------------------------------- la caseta, el atril y los finales
const _useB = G.use;
G.use = function (pr) {
  const E = ETAPA, st = this.stage;
  if (pr.id === 'caseta' && st >= E.BAJADA && st < E.FIN) {
    this.getWorld('abajo');
    const go = () => { Sound.play('door'); this.enter('abajo', 0, 0, 1); if (st === E.BAJADA) ABJ.toRoom(0); else ABJ.toChamber(); };
    if (st === E.BAJADA && !this.flags.has('cine_bajada')) { this.flags.add('cine_bajada'); this.playCine('bajada', go); } else go();
    return;
  }
  if (pr.id === 'abajo_subir') { this.enter('exterior', WG.casetaX * 16 + 8, (WG.casetaY + 2) * 16 + 8, 0); this.toast('La subida es mucho más dura y lenta que la bajada.'); return; }
  if (pr.id === 'atril_final') {
    if (st < E.ELECCION) { this.say('Guardián', 'Un atril antiguo de piedra bajo un haz de luz. Hay algo encima que no consigo identificar. Me atrae como un imán.'); return; }
    if (st >= E.FIN) { this.say('Guardián', 'El atril está vacío. Solo queda el haz de luz, cayendo sobre nada.'); return; }
    this.say('Guardián', 'Por fin lo veo. Lo que hay sobre el atril es... un reloj. Un reloj de pulsera como el mío, parado a las tres y treinta y tres. Es el mío. El que se quedó aquí abajo con mi cuerpo aquella noche.',
      'Llevo en las manos el Reloj del Cielo: la esfera, las agujas y la cuerda. Y en la pared del fondo, una salida que no conocía, pero que parece haber estado siempre ahí.');
    this.dlgEnd = () => ABJ.eleccion(false);
    return;
  }
  return _useB.call(this, pr);
};
ABJ.eleccion = function (sinCielo) {
  const opts = sinCielo ? [] : ['Poner el Reloj del Cielo en el atril, cerrar la puerta y subir por la salida.'];
  opts.push('Poner el Reloj del Cielo en el atril, cerrar la puerta y quedarme en Pozo Alcón.', 'Tocar el objeto del atril.');
  G.ask('Guardián', 'Ni frío ni caliente. Hasta ahora.', opts, k => {
    const pick = sinCielo ? ['tierra', 'infierno'][k] : ['cielo', 'tierra', 'infierno'][k];
    if (pick === 'cielo' && (G.balance || 0) < 2) {
      G.say('Guardián', 'Doy un paso hacia la salida... y la salida no está. Solo pared. Fría, gris.', 'Miguel no dice nada. No hace falta. Todavía no soy lo bastante caliente para esa puerta.');
      G.dlgEnd = () => ABJ.eleccion(true); return;
    }
    ABJ.final(pick);
  });
};
ABJ.final = function (k) {
  const E = ETAPA;
  this.finalK = k; G.flags.add('final_' + k);
  const lines = {
    cielo: ['Pongo el Reloj del Cielo sobre el atril. Las tres piezas encajan solas, y el reloj echa a andar. En su dirección.', 'Allá arriba, la puerta de la caseta se cierra. Lo oigo desde aquí, como un portazo en otra casa.', 'Esta vez, cuando me preguntan si quiero ver el cielo, digo que sí. Y alguien me coge de la mano. Cándida.'],
    tierra: ['Pongo el Reloj del Cielo sobre el atril. Las tres piezas encajan solas y el reloj echa a andar.', 'Allá arriba, la puerta de la caseta se cierra. La salida del fondo se queda abierta, esperando. Le digo a Miguel que no. Otra vez. Pero esta vez sé por qué.', 'Alguien tiene que quedarse a cuidar de lo que queda.'],
    infierno: ['Dejo el Reloj del Cielo en el suelo. Alargo la mano hacia el atril. No puedo parar mi inercia hacia él, y esta vez no quiero.', 'Miguel grita algo que no entiendo. El reloj de mi muñeca va hacia atrás, y ya no me parece que vaya al revés.', 'Lo toco.'],
  }[k];
  G.say('Guardián', ...lines);
  G.dlgEnd = () => G.playCine('final_' + k, () => {
    G.stage = E.FIN; G.boss = null;
    const ow = G.worlds.exterior;
    for (const id in G.worlds) G.worlds[id].monsters = G.worlds[id].monsters.filter(m => !m.anticristo && !m.lider);
    if (G.worlds.abajo) G.worlds.abajo.npcs = G.worlds.abajo.npcs.filter(n => n.key !== 'miguel_pie');
    G.day = 0.28;
    if (k === 'infierno') {
      G.enter('exterior', WG.casetaX * 16 + 8, (WG.casetaY + 2) * 16 + 8, 0);
      G.say('Guardián', 'Abro la ventanilla de la caseta cuando me da la gana. Los del pueblo pasan deprisa por delante, sin mirar.', 'Ni frío ni caliente, decían. Ahora ya sé de qué temperatura soy.', '(Final del Infierno · Puedes seguir jugando en el valle.)');
    } else {
      G.enter('exterior', (WG.fireX + 1) * 16 + 8, (WG.fireY + 2) * 16 + 8, 0);
      if (k === 'cielo') G.say('Guardián', 'Dicen en el pueblo que una mañana el Guardián del cortijo del río se fue, y que alguien con su misma barba sigue cuidando el valle. Será su sombra. O su costumbre.', '(Final del Cielo · Puedes seguir jugando en el valle.)');
      else { G.say('Padre Tomás', 'Las campanas de la Encarnación han sonado solas esta mañana, hijo. Por primera vez en siete años.'); G.say('Guardián', 'Pozo Alcón... siempre será mi lugar.', '(Final de la Tierra · Puedes seguir jugando en el valle.)'); }
    }
    G.player.hp = G.player.maxHp; G.player.fe = G.player.maxFe; G.restWorld = 'exterior'; G.restX = WG.fireX * 16 + 8; G.restY = (WG.fireY + 1) * 16 + 8;
    G.save();
  });
};
// el final viejo de la historia antigua ya no se usa
G.startEnding = function () { };

// ---------------------------------------------------------------- dibujo: rayos de los ángeles, relojes del acertijo y reloj de pulsera
const _lateB = Q.late;
Q.late = function () {
  _lateB();
  const drawClock = (g, x, y, r, h, m, sec, col) => {
    g.fillStyle = '#16120e'; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill();
    g.fillStyle = col || '#e8e0c8'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#4a3a2a'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillRect(Math.round(x + Math.cos(a) * (r - 1.5)), Math.round(y + Math.sin(a) * (r - 1.5)), 1, 1); }
    const hand = (a, L, c, w) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); };
    hand(-Math.PI / 2 + ((h % 12) + m / 60) / 12 * Math.PI * 2, r * 0.5, '#1a1410', 1.4);
    hand(-Math.PI / 2 + m / 60 * Math.PI * 2, r * 0.8, '#1a1410', 1);
    if (sec !== undefined) hand(-Math.PI / 2 + sec * Math.PI * 2, r * 0.85, '#b02a1a', 0.7);
    g.lineWidth = 1;
  };
  const _rw = G.renderWorld;
  G.renderWorld = function (g) {
    _rw.call(this, g);
    if (this.padel) return;
    const cx = Math.round(this.camX), cy = Math.round(this.camY);
    if (this.beams && this.beams.length) {
      g.save(); g.globalCompositeOperation = 'screen';
      for (const b of this.beams) { g.strokeStyle = `rgba(255,240,190,${Math.min(1, b.t * 4)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(b.x0 - cx, b.y0 - cy); g.lineTo(b.x1 - cx, b.y1 - cy); g.stroke(); g.strokeStyle = `rgba(255,255,255,${Math.min(1, b.t * 3)})`; g.lineWidth = 0.8; g.stroke(); }
      g.restore(); g.lineWidth = 1;
    }
    if (this.world && this.world.id === 'abajo') for (const r of ABJ.rooms) r.exits.forEach(([ex, ey], k) => drawClock(g, ex * 16 + 8 - cx, (ey - 1) * 16 + 6 - cy, 6, r.shown[k], 0));
  };
  const _hud = G.uiHud;
  G.uiHud = function (g) {
    _hud.call(this, g);
    if (this.padel || !this.player) return;
    const inAbajo = this.world && this.world.id === 'abajo';
    if (!inAbajo && !this.flags.has('reloj_pulsera')) return;
    let h, m, sec;
    if (inAbajo && ABJ.room !== undefined && ABJ.room < 3) { h = ABJ.rooms[ABJ.room].h; m = 0; sec = 1 - (this.clock % 1); }
    else if (inAbajo) { h = 3; m = 33; sec = 1 - (this.clock % 1); }
    else { const hh = this.hour(); h = Math.floor(hh); m = Math.floor((hh - h) * 60); sec = this.clock % 1; }
    this.panel(g, 122, 4, 22, 22, false);
    drawClock(g, 133, 15, 8, h, m, sec, inAbajo ? '#d8d0c0' : '#e8e0c8');
  };
};
