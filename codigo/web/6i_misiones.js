// ====================================================================== misiones secundarias: Relatos Raros
// Nueve historias del libro de Abraham Fernández y Víctor Ortega llevadas al valle después del Colapso.
// Cada misión guarda su paso en G.q[id] = { s, d } (s: paso; 9 = terminada). Los textos están aquí
// juntos para poder retocarlos: van con el habla del libro (dequeísmos, "bujero"...) y lo explícito
// solo se sugiere.
const QDONE = 9;
const Q = {
  pending: {},
  defs: {},
  st(id) { return (G.q[id] && G.q[id].s) || 0; },
  d(id) { if (!G.q[id]) G.q[id] = { s: 0, d: {} }; return G.q[id].d; },
  set(id, s, msg) {
    if (!G.q[id]) G.q[id] = { s: 0, d: {} };
    const was = G.q[id].s; G.q[id].s = s; G.q[id].t = G.clock;
    if (s >= QDONE && was < QDONE) { G.toast('Misión cumplida: ' + Q.defs[id].title); Sound.play('purify'); G.q._last = id; Q.pasilloBack(); }
    else if (was === 0 && s > 0) { G.toast('Nueva misión: ' + Q.defs[id].title); Sound.play('level'); }
    else if (msg !== false) G.toast(Q.defs[id].title + ': ' + Q.defs[id].steps(s));
    G.q._track = s >= QDONE ? null : id;
    G.save(); Q.refresh();
  },
  done(id) { return Q.st(id) >= QDONE; },
  reward(xp, pts, extra) {
    const p = G.player;
    if (pts) { p.pts += pts; G.fx.push(Fx.text(p.x, p.y - 40, '+' + pts + ' punto de habilidad', 0xffe08a)); }
    if (xp) G.gainXp(xp, p.x, p.y - 30);
    if (extra) extra(p);
  },
  // gente y cosas de las misiones: se quitan y se vuelven a poner según el paso de cada una
  refresh() {
    if (!G.worlds || !G.worlds.exterior) return;
    for (const id in G.worlds) {
      const w = G.worlds[id];
      w.npcs = w.npcs.filter(n => !n.q); w.props = w.props.filter(pr => !pr.q);
    }
    for (const k in Q.defs) if (Q.defs[k].place) Q.defs[k].place();
    Q.doors();
    // la marca de "tiene algo que contarte"
    for (const id in G.worlds) for (const n of G.worlds[id].npcs) n.mark = !!(n.q && n.q.mark && n.q.mark());
    for (const id in G.worlds) for (const n of G.worlds[id].npcs) if (!n.q && Q.marks[n.key] && Q.marks[n.key]()) n.mark = true;
  },
  marks: {},
  // entrada (casilla de abajo) de cada interior y adónde lleva su salida
  exits: {
    q_casa_manuel: [9, () => Q.d('puerta').door],
    q_gris: [4, null],
    q_sotano: [17, () => [WG.rx - 9, 95]],
    q_ermita: [8, () => Q.ermita()],
    q_casa_madre: [2, () => Q.d('alia').door],
    q_casa_ursula: [7, () => Q.d('obsequios').door],
  },
  doors() {
    for (const id in Q.exits) {
      const w = G.worlds[id]; if (!w) continue;
      const [ex, f] = Q.exits[id];
      w.set(ex, w.h - 1, T.FLOOR);
      if (id === 'q_gris') { w.warps = [new Warp(ex, w.h - 1, 1, 1, 'q_casa_manuel', 12 * TS + 8, 9 * TS + 8, 0)]; continue; }
      const d = f(); if (!d) continue;
      w.warps = [new Warp(ex, w.h - 1, 1, 1, Q.exits[id][2] || 'exterior', d[0] * TS + 8, (d[1] + 1) * TS + 8, 0)];
    }
  },
  go(id) { const w = G.worlds[id], ex = Q.exits[id][0]; Sound.play('door'); G.enter(id, ex * TS + 8, (w.h - 2) * TS + 8, 1); },
  npc(wid, key, name, x, y, o = {}) {
    const w = G.worlds[wid]; if (!w) return null;
    const set = o.set || Art.people[key];
    const n = new Npc(name, key, set, o.single || null, null, x * TS + 8, y * TS + 13, o.dir || 0);
    n.q = { mark: o.mark || null }; if (o.alpha !== undefined) n.alpha = o.alpha;
    w.npcs.push(n); return n;
  },
  prop(wid, key, id, x, y, o = {}) {
    const w = G.worlds[wid]; if (!w) return null;
    const pr = new Prop(Art.P[key], x * TS + 8, y * TS + 15); pr.id = id; pr.q = true; if (o.hidden) pr.hidden = true;
    w.props.push(pr); return pr;
  },
  // casilla libre más cercana (para colocar gente sin que quede encajada)
  free(w, x, y) {
    for (let r = 0; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const X = x + dx, Y = y + dy;
      if (!w.solid(X, Y) && !w.solid(X, Y + 1) && !w.npcs.some(n => Math.abs(n.x - (X * TS + 8)) < 12 && Math.abs(n.y - (Y * TS + 13)) < 12)) return [X, Y];
    }
    return [x, y];
  },
  // puerta de una casa del pueblo (la más cercana al punto pedido que no esté ya cogida)
  door(x, y, avoid = []) {
    const w = G.worlds.exterior; let best = null, bd = 1e9;
    for (let j = 80; j < 140; j++) for (let i = 10; i < 70; i++) if (w.get(i, j) === T.DOOR && w.get(i, j + 1) === T.PAVING) {
      if (avoid.some(a => a && Math.abs(a[0] - i) < 3 && Math.abs(a[1] - j) < 2)) continue;
      const d = Math.hypot(i - x, j - y); if (d < bd) { bd = d; best = [i, j]; }
    }
    return best;
  },
  // un enemigo de misión (persona o aparición) con sus reglas propias
  foe(w, key, name, x, y, o = {}) {
    const m = new Monster(o.kind || MK.HUMANO, x, y, o.tier || 1);
    m.set = o.set || Art.people[key]; m.customName = name;
    m.st = Object.assign({}, m.st, o.st || {});
    if (o.hp) m.maxHp = m.hp = o.hp; if (o.dmg) m.dmg = o.dmg; if (o.sp) m.speed = o.sp; if (o.xp) m.xp = o.xp;
    Object.assign(m, o.props || {});
    m.aggro = true; m.spawnFade = 0.5; m.qfoe = true; m.quest = true;
    // si mueres o sales de la sala a media pelea, vuelve a estar ahí cuando regreses
    const qid = G.q._track, qs = qid ? Q.st(qid) : 0, rec = { qid, qs, args: [key, name, x, y, o] };
    Q.pending[w.id] = rec;
    m.onDeath = mm => { if (Q.pending[w.id] === rec) delete Q.pending[w.id]; if (o.onDeath) o.onDeath(mm); };
    w.monsters.push(m);
    if (o.boss) G.boss = m;
    return m;
  },
};
G.q = {};
G.dayN = 0;

// ---------------------------------------------------------------- interiores de las misiones
function qRoom(id, W, H, name, o = {}) {
  const w = new World(id, W, H, o.floor || T.FLOOR);
  w.defaultArea = name; w.areas.push(new Area(name, 0, 0, W, H));
  w.fill(0, 0, W, 1, T.WALLTOP); w.fill(0, H - 1, W, 1, T.WALLTOP);
  for (let y = 0; y < H; y++) { w.set(0, y, T.WALLTOP); w.set(W - 1, y, T.WALLTOP); }
  for (let x = 1; x < W - 1; x++) { w.set(x, 1, o.wallHi || T.IWALL_HI); w.set(x, 2, o.wall || T.IWALL); }
  return w;
}
Q.worlds = function () {
  const ws = {};
  // la casa de los padres de Manuel (La puerta): salón polvoriento y el pasillo con la puerta
  { const w = qRoom('q_casa_manuel', 18, 12, 'Casa de los padres de Manuel'); w.dark = 0.62;
    w.wall('ventana_int', 3 * 16, 2 * 16 - 2); w.prop('sofa', 4, 5, 3, 5, 3, 1); w.prop('mesa_camilla', 4.5, 8, 4, 7, 2, 2); w.prop('comoda', 13, 4, 12, 4, 2, 1); w.prop('estanteria0', 15.5, 4, 15, 4, 2, 1);
    for (let y = 3; y < 11; y++) w.set(10, y, T.IWALL_STONE); w.set(10, 8, T.FLOOR); w.set(10, 9, T.FLOOR);
    ws[w.id] = w; }
  // el cuarto gris: vastísimo, vacío, frío, con el mismo estilo que la casa
  { const w = qRoom('q_gris', 40, 26, 'El otro lado de la puerta'); w.mono = true; w.dark = 0.5;
    for (let i = 0; i < 9; i++) w.wall('ventana_int', (4 + i * 4) * 16, 2 * 16 - 2);
    w.prop('sofa', 20, 13, 19, 13, 3, 1); w.prop('comoda', 33, 20, 32, 20, 2, 1);
    ws[w.id] = w; }
  // el sótano de la casa blanca (El bujero): enorme, absurdo para una entrada tan pequeña
  { const w = qRoom('q_sotano', 34, 22, 'El sótano', { floor: T.CONCRETE, wallHi: T.IWALL_STONE, wall: T.IWALL_STONE }); w.dark = 0.68;
    w.prop('barril', 3, 5, 3, 5, 1, 1); w.prop('carretilla', 4, 7); w.prop('cubo', 5, 5, 5, 5, 1, 1); w.prop('garrafa', 6, 4, 6, 4, 1, 1);
    ws[w.id] = w; }
  // la ermita de Santa Ana por dentro
  { const w = qRoom('q_ermita', 16, 14, 'Ermita de Santa Ana', { floor: T.PAVING, wallHi: T.CHURCH_WALL, wall: T.CHURCH_WALL }); w.dark = 0.7;
    w.prop('altar', 8, 4, 7, 4, 3, 1); for (const x of [5, 11]) w.prop('vela', x, 4);
    for (let y = 7; y <= 11; y += 2) { w.prop('banco', 4, y); w.prop('banco', 11, y); }
    ws[w.id] = w; }
  // la casa de la madre de Javier (Estelas de Alia): la cocina con la mesa y el pasillo de la entrada
  { const w = qRoom('q_casa_madre', 18, 12, 'Casa de la madre de Javier'); w.dark = 0.55;
    w.wall('ventana_int', 4 * 16, 2 * 16 - 2); w.prop('mesa_larga', 8, 6, 6, 5, 4, 2).id = 'q_mesa_cena'; w.prop('frigo', 15, 4, 15, 3, 1, 2); w.prop('encimera', 13, 3.6, 13, 3, 1, 1);
    for (let y = 3; y < 11; y++) w.set(4, y, T.IWALL_STONE); w.set(4, 9, T.FLOOR);
    ws[w.id] = w; }
  // la casa de Úrsula (La semana de los obsequios): la merienda con Casimiro
  { const w = qRoom('q_casa_ursula', 14, 11, 'Casa de Úrsula'); w.dark = 0.5;
    w.wall('ventana_int', 6 * 16, 2 * 16 - 2); w.prop('mesa_camilla', 7, 6, 6, 5, 2, 2); w.prop('sofa', 4, 4, 3, 4, 3, 1); w.prop('maceta', 12, 3, 12, 3, 1, 1);
    ws[w.id] = w; }
  // Bajada al infierno: tres salas que bajan en tramos de tres; en la última, el atril
  { const w = new World('q_infierno', 64, 22, T.PAVING); w.hell = true; w.dark = 0.6; w.defaultArea = 'Bajo la caseta';
    w.fill(0, 0, 64, 22, T.WALLTOP);
    const salas = [[2, 3, 18, 15], [23, 3, 18, 15], [44, 3, 18, 15]];
    salas.forEach(([x0, y0, ww, hh], i) => {
      w.fill(x0, y0, ww, hh, T.PAVING);
      for (let x = x0; x < x0 + ww; x++) { w.set(x, y0, T.IWALL_HI); w.set(x, y0 + 1, T.IWALL_STONE); }
      w.areas.push(new Area(['Primer tramo', 'Segundo tramo', 'El atril'][i], x0, y0, ww, hh));
    });
    ws[w.id] = w; }
  for (const k in ws) { ws[k].fromQuest = true; for (const a of ws[k].areas) a.safe = false; }
  return ws;
};
const _buildWorlds = G.buildWorlds;
G.buildWorlds = function () { _buildWorlds.call(this); Object.assign(this.worlds, Q.worlds()); };

// interiores sin luz propia: se ven en penumbra y el cuarto gris, sin color
const _darkness = G.darkness;
G.darkness = function () { if (this.world && this.world.dark !== undefined) return this.world.dark; return _darkness.call(this); };
Q.late = function () {
const _mood = G.mood;
G.mood = function (g) {
  _mood.call(this, g);
  if (this.world.mono) { g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(0, 0, WW, WH); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgb(170,176,196)'; g.fillRect(0, 0, WW, WH); g.restore(); }
  if (this.world.hell) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgb(220,90,70)'; g.fillRect(0, 0, WW, WH); g.restore(); }
};
const _rq = G.render;
G.render = function (ctx, cw, ch, dpr) {
  if (this.st !== ST.QUESTS) return _rq.call(this, ctx, cw, ch, dpr);
  this.st = ST.MAPQ; _rq.call(this, ctx, cw, ch, dpr); this.st = ST.QUESTS;
  const L = this.layout;
  ctx.setTransform(L.sc * dpr, 0, 0, L.sc * dpr, L.ox * dpr, L.oy * dpr);
  this.menuRects = [];
  this.uiQuests(ctx);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
};
G.uiPause = function (g) {
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 0, VW, VH);
  this.panel(g, VW / 2 - 70, 18, 140, 176);
  g.font = FT(11); this.center(g, 'Pausa', 36, GOLD);
  this.menuList(g, this.pauseMenu(), 54, 15);
  g.font = FB(5.8);
  this.center(g, 'Reliquias ' + this.player.relics + '/5  ·  Ataque ' + this.player.atk + '  ·  Nivel ' + this.player.lvl, 186, SOFT);
};
};
const _bootQ = G.boot;
G.boot = function () { Q.late(); return _bootQ.apply(this, arguments); };
ST.MAPQ = 'MAPQ';

// ---------------------------------------------------------------- días, entrada en los mundos, conversaciones y objetos
const _upd = G.updatePlay;
G.updatePlay = function (dt) {
  const before = this.day; this._rested = false;
  _upd.call(this, dt);
  if (!this._rested && this.day < before - 0.5) { this.dayN++; Q.newDay(); }
  if (Q.tick) Q.tick(dt);
};
Q.tick = function (dt) { for (const k in Q.defs) if (Q.defs[k].tick) Q.defs[k].tick(dt); };
Q.newDay = function (slept) { for (const k in Q.defs) if (Q.defs[k].newDay) Q.defs[k].newDay(slept); Q.refresh(); };
const _enterQ = G.enter;
G.enter = function (id, x, y, dir) {
  _enterQ.call(this, id, x, y, dir);
  if (this.boss && this.boss.qfoe) this.boss = null;
  const pd = Q.pending[id], w = this.worlds[id];
  if (pd && w && (!pd.qid || Q.st(pd.qid) === pd.qs) && !w.monsters.some(m => m.qfoe && !m.dead)) { delete Q.pending[id]; Q.foe(w, ...pd.args); }
  for (const k in Q.defs) if (Q.defs[k].enter) Q.defs[k].enter(id);
};
const _talkQ = G.talk;
G.talk = function (n) {
  for (const k in Q.defs) { const f = Q.defs[k].talk; if (f && f(n) === true) { Sound.play('talk'); return; } }
  _talkQ.call(this, n);
};
const _useQ = G.use;
G.use = function (pr) {
  for (const k in Q.defs) { const f = Q.defs[k].use; if (f && f(pr) === true) return; }
  _useQ.call(this, pr);
};
const _killQ = G.killMonster;
G.killMonster = function (m) {
  _killQ.call(this, m);
  if (this.boss === m) this.boss = null;
  if (m.onDeath) { const f = m.onDeath; m.onDeath = null; f(m); }
};
// guardar y cargar el estado de las misiones
const _saveQ = G.save;
G.save = function () {
  _saveQ.call(this);
  try { const s = localStorage.getItem(SAVE_KEY); if (s) { const d = JSON.parse(s); d.q = this.q; d.dayN = this.dayN; localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } } catch (e) { }
};
const _loadQ = G.load;
G.load = function () {
  this.clearDlg();
  const ok = _loadQ.call(this);
  if (ok) { const d = this.readSave(); this.q = (d && d.q) || {}; this.dayN = (d && d.dayN) || 0; Q.refresh(); if (Q.afterLoad) Q.afterLoad(); }
  return ok;
};
// si se cargó la partida a mitad de una pelea, se vuelve al paso de antes para poder repetirla
Q.afterLoad = function () {
  Q.pending = {};
  const back = { leomatilde: [3, 2], alia: [2, 1], baldomero: [2, 1] };
  for (const k in back) if (Q.st(k) === back[k][0]) G.q[k].s = back[k][1];
  if (Q.st('pasillo') === 2) { G.q.pasillo.s = 1; G.q.pasillo.d.paso = 6; }
  if (Q.st('obsequios') === 8) Q.d('obsequios').peleaHecha = false;
  Q.refresh();
};
// una elección que llega con un diálogo a medias (p. ej. el de subir de nivel) espera a que termine
const _askQ = G.ask;
G.ask = function (who, text, options, cb) {
  if (this.page || this.dlg.length) { const prev = this.dlgEnd; this.dlgEnd = () => { if (prev) prev(); this.ask(who, text, options, cb); }; if (this.st !== ST.DIALOG) this.st = ST.DIALOG; return; }
  _askQ.call(this, who, text, options, cb);
};
const _newQ = G.newGame;
G.clearDlg = function () { this.dlg = []; this.page = null; this.dlgEnd = null; this.choice = null; };
G.newGame = function () { this.clearDlg(); this.q = {}; this.dayN = 0; Q.pending = {}; _newQ.call(this); Q.refresh(); };
const _gw = G.getWorld;
G.getWorld = function (id) { const had = !!this.worlds[id]; const w = _gw.call(this, id); if (w && !had) Q.refresh(); return w; };

// lo que pone en el HUD bajo el objetivo principal
G.sideObjective = function () {
  const id = this.q._track; if (!id || !Q.defs[id] || Q.done(id) || Q.st(id) === 0) return null;
  return '◆ ' + Q.defs[id].title + ': ' + Q.defs[id].steps(Q.st(id));
};
const hora = () => G.hour();
const noche = () => { const h = hora(); return h >= 20 || h < 5; };
const enArea = (name) => G.world.id === 'exterior' && G.world.areaName(Math.floor(G.player.x / TS), Math.floor(G.player.y / TS)) === name;
const toTile = n => [Math.floor(n.x / TS), Math.floor(n.y / TS)];

// ====================================================================== 1 · LA PUERTA
Q.defs.puerta = {
  title: 'La puerta',
  steps: s => ['', 'Coge la pata de cabra de tu cochera.', 'Ve a la casa de los padres de Manuel, en Pozo Alcón.', 'Cruza la puerta.', 'Sal del cuarto gris.', 'Vuelve con Manuel, al Hotel Los Nogales.'][s] || '',
  place() {
    const s = Q.st('puerta'), d = Q.d('puerta');
    if (!d.door) d.door = Q.door(26, 128);
    if (s >= 2 && s < QDONE && d.door) Q.prop('exterior', 'compuerta', 'q_puerta_casa', d.door[0], d.door[1], { hidden: true });
    if (s >= 2) { Q.prop('q_casa_manuel', s >= 3 ? 'puerta_sangre' : 'puerta_gris', 'q_puerta_gris', 12, 8); }
    if (s >= 4 && s < QDONE) Q.npc('q_casa_manuel', 'victor', 'Víctor, el vecino', 6, 9, { mark: () => !Q.d('puerta').victor });
    if (s >= 3) Q.prop('q_gris', 'cuadro', 'q_foto', 36, 3);
  },
  talk(n) {
    const s = Q.st('puerta');
    if (n.key === 'manuel' && G.stage >= ETAPA.OBSERVATORIO && s === 0) {
      G.sayAs(n, 'Oye, tú que andas por todo el valle... ¿Me harías un favor? No es de los fáciles.',
        'En la casa de mis padres, en el pueblo, hay una puerta. Siempre había estado ahí. No abría, era como una pared más, y nadie preguntó nunca por ella.',
        'Antes del Colapso volví a por unos papeles. Y me dio por abrirla. Con una pata de cabra, con un destornillador... con un hacha de la ferretería.',
        'Al otro lado había un cuarto enorme, gris, frío en pleno verano. Salí corriendo. Y desde entonces... no me acuerdo bien de lo que pasó después.',
        'Hay cosas que se me han borrado, ¿sabes? Necesito saber qué hay detrás. Yo no puedo volver. Tú sí.',
        'Para forzarla te hará falta una buena pata de cabra. Seguro que en tu cochera tienes una.');
      G.dlgEnd = () => Q.set('puerta', 1);
      return true;
    }
    if (n.key === 'manuel' && s > 0 && s < 5) { G.sayAs(n, s < 2 ? 'La pata de cabra, en tu cochera. Y luego la casa, en el pueblo. La puerta está al final del pasillo.' : 'No me cuentes nada todavía. Cuando sepas lo que hay, vuelve.'); return true; }
    if (n.key === 'manuel' && s === 5) {
      G.sayAs(n, '¿Y bien? ¿Qué había detrás de la puerta?');
      G.dlgEnd = () => G.ask('Manuel', '¿Qué le cuentas?', ['La verdad: el cuarto gris, Víctor... y lo que colgaba de la puerta.', 'Que detrás no había nada. Solo un tabique.'], k => {
        if (k === 0) {
          G.balance = (G.balance || 0) + 1;
          G.say('Manuel', '...Mi mujer y mi hija. Ya lo sabía. Por eso me vine al hotel a mirar puertas que no se abren.', 'Gracias por no mentirme. Es lo único que me quedaba por saber. Ahora por lo menos sé a quién le rezo.', '(+1 en la balanza · +300 XP · +1 punto de habilidad)');
          G.dlgEnd = () => { Q.reward(300, 1); Q.d('puerta').fin = 'verdad'; Q.set('puerta', QDONE); };
        } else {
          G.balance = (G.balance || 0) - 1;
          G.say('Manuel', '¿Nada? ¿Un tabique? ... Menos mal. Menos mal, coño. Pensaba que me estaba volviendo loco.', 'Gracias, de verdad. Esta noche a lo mejor duermo.', '(−1 en la balanza · +300 XP · +1 punto de habilidad)');
          G.dlgEnd = () => { Q.reward(300, 1); Q.d('puerta').fin = 'mentira'; Q.set('puerta', QDONE); };
        }
      });
      return true;
    }
    if (n.key === 'victor' && n.q) {
      Q.d('puerta').victor = true;
      G.sayAs(n, 'Escuché los golpes desde enfrente y vine a ver. ¿Eres amigo de Manolo?',
        'Yo vivo en la casa de enfrente desde siempre. La noche que Manolo volvió por los papeles también escuché golpes. Hachazos.',
        'Cuando entré estaba bañado en sangre, de arriba abajo, delante de esa puerta... y algo colgaba del otro lado.',
        '¿Qué has hecho, Manolo? le dije. Por Dios... ¿Qué has hecho? Eran su mujer y su hija.',
        'Él no se acuerda. Salió corriendo y el mundo se acabó esa misma semana. Díselo tú, si tienes estómago. O no se lo digas.');
      G.dlgEnd = () => Q.set('puerta', 5);
      return true;
    }
  },
  use(pr) {
    const s = Q.st('puerta');
    if (pr.id === 'cochera' && s === 1) { G.say('Guardián', 'Entre las herramientas del campo, la pata de cabra de toda la vida. Pesa como un muerto.', 'Has cogido la PATA DE CABRA.'); G.dlgEnd = () => Q.set('puerta', 2); return true; }
    if (pr.id === 'q_puerta_casa') { Q.go('q_casa_manuel'); G.toast('Huele a cerrado. El polvo lo cubre todo.'); return true; }
    if (pr.id === 'q_puerta_gris') {
      if (s === 2) {
        G.shake(0.4); Sound.play('hit');
        G.say('Guardián', 'Meto la pata de cabra en la ranura. Fuerzo. Nada. Otra vez. La madera cruje como si le doliera.',
          'De las marcas que voy haciendo empieza a brotar algo oscuro y caliente. Sangre. La puerta sangra.',
          'Y de pronto, «click». La puerta se abre sola, muy despacio, hacia dentro.');
        G.dlgEnd = () => { pr.img = Art.P.puerta_sangre; Q.set('puerta', 3); Q.go('q_gris'); };
        return true;
      }
      if (s >= 3 && s < QDONE) { Q.go('q_gris'); return true; }
      G.say('Guardián', 'La puerta ya no sangra. Pero tampoco quiero volver a abrirla.'); return true;
    }
    if (pr.id === 'q_foto') {
      G.say('Guardián', 'Una foto enmarcada, la única cosa con color en todo el cuarto: Manuel, una mujer y una niña, en la feria de Pozo Alcón.', 'Alguien ha rayado las dos caras con un clavo. Por detrás pone, a lápiz: «La puerta siempre había estado ahí».');
      return true;
    }
  },
  enter(id) {
    const s = Q.st('puerta');
    if (id === 'q_gris') {
      const w = G.worlds.q_gris;

      if (s === 3) {
        G.toast('Hace un frío que no es de verano. Al fondo, alguien te espera. Eres tú.');
        Q.foe(w, 'reflejo', 'El reflejo gris', 30 * TS, 14 * TS, { set: Art.people.reflejo, hp: 300, dmg: 15, sp: 58, xp: 220, boss: true, props: { blink: true },
          onDeath: () => { G.say('Guardián', 'El reflejo se deshace como ceniza fría. En la pared del fondo hay algo colgado. Una foto.'); Q.set('puerta', 4); } });
      }
    }
  },
};
Q.marks.manuel = () => (G.stage >= ETAPA.OBSERVATORIO && Q.st('puerta') === 0) || Q.st('puerta') === 5;

// ====================================================================== 2 · EL BUJERO
Q.defs.bujero = {
  title: 'El bujero',
  steps: s => ['', 'Baja al sótano de la casa blanca del puente.', 'Busca un saco de cemento (en el Cortijo de los Llanos).', 'Vuelve al sótano y tapa el bujero.'][s] || '',
  place() {
    const s = Q.st('bujero'), rx = WG.rx;
    if (s < QDONE && G.stage >= ETAPA.GRECO) { const [x, y] = Q.free(G.worlds.exterior, rx - 11, 98); Q.npc('exterior', 'doro', 'Doro', x, y, { mark: () => Q.st('bujero') === 0 }); }
    if (s === 2) Q.prop('exterior', 'saco', 'q_saco', WG.ruins.llanos[0] + 1, WG.ruins.llanos[1] + 1);
    if (s >= 1) { const big = Q.d('bujero').grande; Q.prop('q_sotano', s >= QDONE ? 'bujero0' : big ? 'bujero2' : 'bujero1', 'q_bujero', 17, 11); }
  },
  talk(n) {
    if (n.key !== 'doro' || !n.q) return;
    const s = Q.st('bujero');
    if (s === 0) {
      G.sayAs(n, 'Teodoro, aunque todo el mundo me llama Doro, que no me gusta. Tenía un bar a dos calles, «La casa de Teodoro». Y la gente, «Casadoro». Cojones, para algo estaba bien escrito en el cartel.',
        'El caso es que tengo un bujero en el sótano. Un «bujero», sí. ¿Es que no lo ves? Está bastante claro lo que es.',
        'Al principio era una manchita negra en mitad del sótano. Luego cabía yo dentro, si hubiera querido meterme. Y ahora de ahí sale... cosa mala.',
        'Mi Natalia... bueno, Natalia ya no está. Se fue. Tú baja y me dices qué hay que hacer pa taparlo, que yo ya no me atrevo a bajar.');
      G.dlgEnd = () => Q.set('bujero', 1);
      return true;
    }
    if (s === 1) { G.sayAs(n, 'El sótano está bajando por la puerta de casa. La entrada es pequeñísima, pero luego dentro caben siete coches y un campo de fútbol. Sin gradas.'); return true; }
    if (s === 2) { G.sayAs(n, '¿Cemento? En el Cortijo de los Llanos, el que está hundido al este, quedaban sacos del que iban a hacer la nave. Con suficiente hormigón se tapa cualquier cosa.'); return true; }
    if (s === 3) { G.sayAs(n, 'Ve tú delante, que yo bajo detrás. Ay, Natalia...'); return true; }
  },
  use(pr) {
    const s = Q.st('bujero');
    if (pr.id === 'casablanca' && s >= 1) { Q.go('q_sotano'); return true; }
    if (pr.id === 'q_saco') { G.say('Guardián', 'Un saco de cemento de veinticinco kilos, medio mojado pero aprovechable. Pesa lo suyo.', 'Has cogido el SACO DE CEMENTO.'); G.dlgEnd = () => Q.set('bujero', 3); return true; }
    if (pr.id === 'q_bujero') {
      if (s === 3) {
        G.say('Guardián', 'Vacío el saco de cemento en el bujero. El agujero lo traga sin hacer ruido, como si tuviera hambre.',
          'Y entonces, desde el fondo, una voz de mujer, ronca, llena de rabia: «Dorooo... ¿No bajas, cobarde? Tú no eres un hombre. Un hombre sí me tiraría al bujero».',
          'Doro ha bajado detrás de mí. Está blanco como la cal.');
        G.dlgEnd = () => {
          const doro = Q.npc('q_sotano', 'doro', 'Doro', 15, 12);
          G.sayAs(doro, 'Natalia... Yo no la empujé. Bueno... un poco. Me tenía hasta los santísimos cojones. Le dije «al bujero te tendría que tirar», y la cogí de los pelos, y...',
            'Y luego el bujero se cerró casi entero. Y yo estaba en paz. En paz, como pocas veces. Y desde entonces, cada vez que me enfado con alguien, el bujero se ensancha.',
            'Me está llamando. ¿Lo oyes? Me está llamando.');
          G.dlgEnd = () => G.ask('Doro', 'Doro da un paso hacia el bujero.', ['Sujetarle y terminar de tapar el bujero.', 'Dejar que el bujero decida.'], k => {
            if (k === 0) { G.balance = (G.balance || 0) + 1; G.say('Guardián', 'Le cojo del brazo y le aparto. Echo el resto del cemento con las manos. El bujero se queda en una grieta del tamaño de un dedo.', 'Doro llora como un niño. Vivirá con ello. Que es lo peor que le puede pasar.', '(+1 en la balanza · +260 XP · +1 punto de habilidad)'); Q.d('bujero').fin = 'tapado'; }
            else { G.balance = (G.balance || 0) - 1; G.say('Guardián', 'Doro se asoma. Se escucha rebotar en las paredes; solo eso. No hay más. Ni ruido ni nada.', 'El bujero se cierra casi entero. Un silencio sepulcral, tranquilo. Era la paz absoluta.', '(−1 en la balanza · +260 XP · +1 punto de habilidad)'); Q.d('bujero').fin = 'doro'; G.worlds.q_sotano.npcs = G.worlds.q_sotano.npcs.filter(x => x.key !== 'doro'); }
            G.dlgEnd = () => { Q.reward(260, 1); Q.set('bujero', QDONE); };
          });
        };
        return true;
      }
      G.say('Guardián', s >= QDONE ? 'Una grieta en el cemento, del tamaño de un dedo. Por si acaso, no me asomo.' : 'Un agujero negro en mitad del sótano. No se ve el fondo. Huele a humedad y a algo dulzón.');
      return true;
    }
  },
  enter(id) {
    if (id !== 'q_sotano') return;
    const s = Q.st('bujero'), w = G.worlds.q_sotano, d = Q.d('bujero');
    if (s !== 1) return;
    // el bujero escupe engendros en dos oleadas; tras la primera, crece
    const wave = (n, kinds, then) => {
      let left = n;
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2, m = new Monster(kinds[i % kinds.length], (17 + Math.cos(a) * 3) * TS, (11 + Math.sin(a) * 2) * TS, 1.15);
        m.aggro = true; m.spawnFade = 0.8; m.onDeath = () => { if (--left === 0) then(); }; w.monsters.push(m);
      }
    };
    G.toast('Del bujero sube un ruido de uñas contra la piedra...');
    wave(3, [MK.HUECO, MK.HUECO, MK.ALACRAN], () => {
      d.grande = true; Q.refresh(); G.shake(0.6); Sound.play('roar'); G.toast('El bujero se ensancha. Sale más.');
      wave(4, [MK.SOMBRA, MK.HUECO, MK.HUECO, MK.SOMBRA], () => { G.say('Guardián', 'Silencio. El bujero ha crecido el doble. Esto no se tapa a espadazos.', 'Hace falta cemento. Mucho cemento.'); G.dlgEnd = () => Q.set('bujero', 2); });
    });
  },
};

// ====================================================================== 3 · LA SEMANA DE LOS OBSEQUIOS
// Casimiro deja un maletín en tu puerta. Si te llevas sus monedas, empieza una semana de "regalos".
Q.defs.obsequios = {
  title: 'La semana de los obsequios',
  steps: s => ['', 'Hay un maletín en la puerta de tu cortijo.', 'Espera al día siguiente: otro obsequio.', 'Úrsula ha vuelto al pueblo: está en la Plaza del Ayuntamiento.', 'El Malparío ronda por las calles del pueblo.', 'Huevo bebe delante de El Greco.', 'Coge lo que hay en la grieta del baño de El Greco.', 'Úrsula te invita a merendar a su casa.', 'Esta noche, en tu puerta, el último obsequio.'][s] || '',
  place() {
    const s = Q.st('obsequios'), d = Q.d('obsequios'), ow = G.worlds.exterior;
    if (s === 1) Q.prop('exterior', 'maletin', 'q_maletin', WG.doorX + 2, WG.doorY + 2);
    if (s === 2 && G.dayN > d.day) Q.prop('exterior', 'moneda', 'q_moneda', WG.doorX + 2, WG.doorY + 2);
    if ((s === 3 || s === 7) && G.dayN > d.day) { const [x, y] = Q.free(ow, 44, 115); Q.npc('exterior', 'ursula', 'Úrsula', x, y, { mark: () => true }); }
    if (s === 4 && G.dayN > d.day) { const [x, y] = Q.free(ow, 30, 111); Q.npc('exterior', 'malpario', 'El Malparío', x, y, { mark: () => true }); }
    if ((s === 5 || s === 6) && G.dayN > d.day) { const [x, y] = Q.free(ow, WG.grecoX + 3, WG.grecoY + 2); Q.npc('exterior', 'huevo', 'Huevo', x, y, { mark: () => Q.st('obsequios') === 5 }); }
    if (s === 6) Q.prop('exterior', 'pistola', 'q_pistola', WG.grecoX - 2, WG.grecoY + 1);
    if (!d.door) d.door = Q.door(52, 92, [Q.d('puerta').door]);
    if (s === 7 && G.dayN > d.day && d.door) Q.prop('exterior', 'compuerta', 'q_ursula_casa', d.door[0], d.door[1], { hidden: true });
    if (s === 7) { Q.npc('q_casa_ursula', 'ursula', 'Úrsula', 5, 6); Q.npc('q_casa_ursula', 'casimiro', 'Casimiro', 9, 6, { mark: () => true }); }
  },
  newDay() {
    const s = Q.st('obsequios'), d = Q.d('obsequios');
    // el maletín aparece por primera vez una noche, después de oír la radio
    if (s === 0 && G.stage >= ETAPA.IGLESIA && !d.visto) { d.visto = true; G.q.obsequios.s = 1; G.q.obsequios.t = G.clock; }
    if (s === 1 && d.dejado && G.dayN - d.dejado >= 3 && !d.robo) { d.fin = 'honrado'; G.q.obsequios.s = QDONE; G.toast('El maletín ya no está. Ni un céntimo ha cogido nadie en tres días.'); G.balance = (G.balance || 0) + 1; Q.reward(150, 0); }
    if (s === 8 && G.dayN > d.day && !d.casimiroVuelve) d.casimiroVuelve = true;
  },
  talk(n) {
    const s = Q.st('obsequios'), d = Q.d('obsequios');
    if (n.key === 'ursula' && n.q && s === 3) {
      G.sayAs(n, '¿Me reconoces? Soy Úrsula. Hace casi cinco lustros que no me veías... Volví al pueblo a por la herencia de mi padre: más de mil olivas, fíjate. Mil olivas y ni un alma para cogerlas.',
        'Siempre pensé que tú eras de los que se quedarían. Aquí el más tonto tiene sesenta fanegas de tierra, ¿no?',
        'Me alegro de verte. De verdad. Hacía mucho que nadie me miraba así.');
      G.dlgEnd = () => { d.day = G.dayN; Q.set('obsequios', 4); };
      return true;
    }
    if (n.key === 'malpario' && n.q && s === 4) {
      G.sayAs(n, '¿Qué miras? ... Ah, eres tú. Ya sé, ya sé. Los cuatrocientos euros. Que el mundo se ha acabado, hombre. ¿Qué quieres que te pague, en latas?');
      G.dlgEnd = () => G.ask('El Malparío', 'El hijo pequeño de los Malparíos, el que más dinero te debía, sin nadie que lo proteja.', ['Cobrársela a palos.', 'Olvidar la deuda.'], k => {
        const fin = () => { d.day = G.dayN; Q.set('obsequios', 5); };
        if (k === 0) { G.balance = (G.balance || 0) - 1; G.worlds.exterior.npcs = G.worlds.exterior.npcs.filter(x => x !== n); Q.foe(G.worlds.exterior, 'malpario', 'El Malparío', n.x, n.y - 4, { hp: 120, dmg: 9, sp: 52, xp: 80, onDeath: () => { G.say('Guardián', 'Entre varios engendros tendrían que haberlo cogido. Pero no hay nadie. Se arrastra, gimiendo, calle abajo.', 'No sabría decir qué regalo me gustó más. Y eso es lo que más miedo me da.'); fin(); } }); }
        else { G.balance = (G.balance || 0) + 1; G.say('El Malparío', '¿En serio? ... Pues gracias. Eres el primero que no me pega.'); fin(); }
      });
      return true;
    }
    if (n.key === 'huevo' && n.q && s === 5) {
      G.sayAs(n, 'Huevo. Me llaman Huevo. En realidad me llamo Prudencio, pero soy tan poco prudente que alguien me puso el mote, y desde entonces le doy las gracias cada día.',
        '¿Sabes lo que te digo? Que el mundo no se ha acabado, que se ha puesto sincero. Antes los regalos venían envueltos. Ahora vienen con la etiqueta del precio.',
        'Por cierto... en el baño de El Greco, la segunda vez que vacías el depósito, perdona la metáfora, se te van los ojos a una grieta en la pared. Hay algo dentro. Yo no lo he tocado. No soy tan tonto.');
      G.dlgEnd = () => Q.set('obsequios', 6);
      return true;
    }
    if (n.key === 'ursula' && n.q && s === 7 && G.world.id === 'exterior') { G.sayAs(n, 'Ven a merendar a mi casa, anda. Está en la calle de arriba, la de la puerta verde. Quiero que conozcas a alguien.'); return true; }
    if (n.key === 'casimiro' && n.q && s === 7) {
      G.sayAs(n, 'Así que tú eres el del maletín. Casimiro, para servirte. Sí, el del carné. El de los dos euros y sesenta y dos céntimos.',
        'No me mires así. Yo pongo maletines en las puertas, y la gente decide. Llevo mucho tiempo haciéndolo. Más del que crees.',
        'Mi mujer dice que eres buena persona. ¿Tú qué dices? Llevas mi pistola en el pantalón, en la parte de atrás. Lo sé. Yo te la regalé.');
      G.dlgEnd = () => G.ask('Casimiro', 'Úrsula ha ido a la cocina. Estáis solos.', ['Dispararle, como si fuera un suicidio.', 'Devolverle el monedero y la pistola.'], k => {
        if (k === 0) {
          G.balance = (G.balance || 0) - 3; d.fin = 'disparo'; d.day = G.dayN;
          G.worlds.q_casa_ursula.npcs = G.worlds.q_casa_ursula.npcs.filter(x => x.key !== 'casimiro');
          G.say('Guardián', 'Le pido que mire a su izquierda. Le disparo en la sien derecha y le pongo la pistola en la mano.', 'Úrsula grita desde la cocina. Y en mi cabeza, burlona, la gallina de la moneda de plata.', 'Esta noche, en mi puerta, me espera el último obsequio. Lo sé.', '(−3 en la balanza)');
          G.dlgEnd = () => Q.set('obsequios', 8);
        } else {
          G.balance = (G.balance || 0) + 2; d.fin = 'devuelto';
          G.say('Casimiro', 'Vaya. Por fin uno que devuelve lo que no es suyo.', 'Te diré una cosa, tibio: los regalos de verdad no vienen en maletines. Toma. Este sí es tuyo.', '(+2 en la balanza · +350 XP · +1 punto de habilidad · Vida máxima +15)');
          G.dlgEnd = () => { Q.reward(350, 1, p => { p.maxHp += 15; p.hp = p.maxHp; }); Q.set('obsequios', QDONE); G.worlds.q_casa_ursula.npcs = G.worlds.q_casa_ursula.npcs.filter(x => x.key !== 'casimiro'); };
        }
      });
      return true;
    }
  },
  use(pr) {
    const s = Q.st('obsequios'), d = Q.d('obsequios');
    if (pr.id === 'q_maletin') {
      G.say('Guardián', 'Un maletín solitario en la oscura noche, en la puerta de mi casa. Está abierto.', 'Dentro, un monedero de cuero viejo, un cartón de puros, no muy buenos, y dos mecheros. En el monedero, dos euros y sesenta y dos céntimos y un carné de identidad: Casimiro. Un nombre que parece un chiste.');
      G.dlgEnd = () => G.ask('Guardián', 'Robar dos euros con sesenta y dos no es en sí un acto rebelde. Pero lo simbólico del acto, sí.', ['Coger las monedas.', 'Dejarlo todo como estaba.'], k => {
        if (k === 0) { d.robo = true; d.day = G.dayN; G.balance = (G.balance || 0) - 1; G.say('Guardián', 'Me guardo las monedas. Así, de esta manera tan concreta, empieza una extraña semana repleta de simbólicos obsequios.'); G.dlgEnd = () => Q.set('obsequios', 2); }
        else { d.dejado = d.dejado || G.dayN; G.toast('Dejas el maletín tal cual. Mañana seguirá ahí, intacto.'); }
      });
      return true;
    }
    if (pr.id === 'q_moneda') { G.say('Guardián', 'En el mismo sitio donde estaba el maletín, una moneda de plata antigua. En la cara, una gallina.', 'El segundo obsequio. Alguien me está tratando de comunicar un mensaje más profundo.'); G.dlgEnd = () => { d.day = G.dayN; Q.set('obsequios', 3); }; return true; }
    if (pr.id === 'q_pistola') { G.say('Guardián', 'En la grieta del baño de El Greco, envuelta en un trapo: una pistola. Cargada. El Universo me la regala.', 'Me la guardo en el pantalón, en la parte de atrás.'); G.dlgEnd = () => { d.day = G.dayN; Q.set('obsequios', 7); }; return true; }
    if (pr.id === 'q_ursula_casa') { Q.go('q_casa_ursula'); return true; }
  },
  enter(id) {
    const s = Q.st('obsequios'), d = Q.d('obsequios');
    // el último obsequio: Casimiro vuelve de noche a tu puerta, y ya no es un hombre
    if (id === 'exterior' && s === 8 && noche() && !d.peleaHecha) {
      d.peleaHecha = true;
      {
        Q.foe(G.worlds.exterior, 'casimiro', 'Casimiro, el del maletín', (WG.doorX + 2) * TS, (WG.doorY + 4) * TS, { hp: 520, dmg: 18, sp: 50, xp: 420, boss: true, props: { blink: true, drain: 6 },
          onDeath: () => { G.say('Guardián', 'Casimiro se deshace en humo de puro malo. En el suelo queda el maletín, vacío.', 'No sé si le he ganado o si esto también era un regalo.', '(+420 XP · +1 punto de habilidad)'); G.dlgEnd = () => { Q.reward(0, 1); Q.set('obsequios', QDONE); }; } });
        G.toast('En tu puerta, un hombre viejo te espera con un maletín. Sonríe.');
      }
    }
  },
};
Q.defs.obsequios.mark = () => false;

// ====================================================================== 4 · LAS OBSCURAS AFICIONES DE NOLASCO
Q.defs.nolasco = {
  title: 'Las obscuras aficiones de Nolasco',
  steps: s => ['', 'Habla con Tío Paco, que está malo.', 'Mira en la olla y en el maletín de Nolasco.', 'Pregúntale a Nolasco.', 'Busca a Sancho a la entrada del pueblo.', 'Desenmascara a Nolasco delante de todos.'][s] || '',
  place() {
    const s = Q.st('nolasco'), ow = G.worlds.exterior;
    if (G.stage < ETAPA.GRECO) return;
    if (s < QDONE || Q.d('nolasco').fin === 'perdon') { const [x, y] = Q.free(ow, 38, 99); Q.npc('exterior', 'nolasco', 'Nolasco', x, y, { mark: () => [3, 5].includes(Q.st('nolasco')) }); }
    if (s >= 1 && s < QDONE) { const [x, y] = Q.free(ow, 39, 100); Q.prop('exterior', 'olla', 'q_olla', x, y); const [a, b] = Q.free(ow, 37, 101); Q.prop('exterior', 'maletin', 'q_maletin_n', a, b); }
    if (s >= 4 && s < QDONE) { const [x, y] = Q.free(ow, 77, 111); Q.npc('exterior', 'sancho', 'Sancho', x, y, { mark: () => Q.st('nolasco') === 4 }); }
  },
  talk(n) {
    const s = Q.st('nolasco'), d = Q.d('nolasco');
    if (n.key === 'curandera' && G.stage >= ETAPA.GRECO && s === 0) {
      G.sayAs(n, 'Ay, hijo, qué bien que vienes. Tengo a tres de los nuestros con cagaleras y fiebres, y a Tío Paco que ni se levanta.',
        'Y todos desde que comen del guiso de Nolasco. Que cocina muy bien, eso nadie se lo quita. Dicen que antes era inspector agrario, de los de las cooperativas.',
        'Pero a mí ese hombre nunca me dio buena espina. ¿Me ayudas a averiguarlo sin que se entere nadie?');
      G.dlgEnd = () => Q.set('nolasco', 1);
      return true;
    }
    if (n.key === 'abuelo' && s === 1) { G.sayAs(n, 'Ay... Me duelen hasta los pelos de las orejas. El guiso de anoche sabía raro, a almendras amargas. Y a algo más que no te digo.', 'Nolasco me sirvió el primero, con una sonrisa... como si le dieran algo a cambio.'); G.dlgEnd = () => Q.set('nolasco', 2); return true; }
    if (n.key === 'nolasco' && n.q) {
      if (s === 3) { G.sayAs(n, '¿Setas? ¿Un frasco? Eso será de Sancho, el de la almazara, que es el que me trae la carne. Siempre ha sido un dejao.', 'Yo cocino con amor, ¿eh? Mis recetas las han disfrutado decenas de personas. Lo que pasa es que la gente es muy desagradecida.'); G.dlgEnd = () => Q.set('nolasco', 4); return true; }
      if (s === 5) {
        G.sayAs(n, '¿Delante de todos? ¿Me vas a acusar delante de todos? ...', 'Mis invitados no podían quedarse en la degustación, ¿entiendes? Debía ser algo que les acompañara. Que les transformara. A mí me parece una genialidad.', '¡Maldito perfeccionismo...!');
        G.dlgEnd = () => { G.worlds.exterior.npcs = G.worlds.exterior.npcs.filter(x => x !== n); Q.foe(G.worlds.exterior, 'nolasco', 'Nolasco, el cocinero', n.x, n.y - 4, { hp: 260, dmg: 12, sp: 48, xp: 240, boss: true, props: { poisons: true }, onDeath: () => {
          G.ask('Nolasco', 'Nolasco está en el suelo, con el cuchillo de cocina lejos de la mano. Los supervivientes os miran.', ['Entregarlo al Padre Tomás.', 'Desterrarlo al pantano, que no vuelva.'], k => {
            if (k === 0) { G.balance = (G.balance || 0) + 1; d.fin = 'justicia'; G.say('Padre Tomás', 'Lo encerraremos en la sacristía. Que Dios le juzgue, que nosotros bastante tenemos con sobrevivir.', '(+1 en la balanza)'); }
            else { d.fin = 'destierro'; G.say('Guardián', 'Nolasco se va carretera arriba, hacia el pantano, con su maletín. No se vuelve a mirar.'); }
            G.dlgEnd = () => { Q.reward(240, 1, p => { p.herbs += 4; }); G.say('Remedios', 'Tío Paco ya se levanta. Toma estas hierbas, hijo, y que Dios te lo pague. (+4 hierbas · +1 punto de habilidad)'); G.dlgEnd = () => Q.set('nolasco', QDONE); };
          });
        } }); };
        return true;
      }
      G.sayAs(n, s >= QDONE ? '...' : '¿Una ración? Hoy hay guiso de venado. Con un ingrediente secreto.'); return true;
    }
    if (n.key === 'sancho' && n.q && s === 4) {
      G.sayAs(n, 'Sancho. Trabajaba en la almazara de la cooperativa, con Eliseo. Ahora traigo carne cuando hay suerte.',
        'Yo la carne la traigo limpia. La carne no envenena a nadie; la mano que la cocina, sí.',
        'Y te digo otra cosa: antes del Colapso echaron a un inspector agrario, un tal Nolasco, por unas cosas muy feas que salieron a la luz. A ese le quitaron de empleo y sueldo.');
      G.dlgEnd = () => Q.set('nolasco', 5);
      return true;
    }
  },
  use(pr) {
    const s = Q.st('nolasco');
    if ((pr.id === 'q_olla' || pr.id === 'q_maletin_n') && s >= 1 && s <= 2) {
      if (pr.id === 'q_olla') Q.d('nolasco').olla = true; else Q.d('nolasco').maletin = true;
      const d = Q.d('nolasco');
      G.say('Guardián', pr.id === 'q_olla' ? 'El guiso huele a gloria. Pero en el fondo de la olla hay trozos de algo que no es venado ni es seta de las buenas.' : 'El maletín de Nolasco: cuadernos de recetas con letra pequeñita, un frasco sin etiqueta y un puñado de setas blancas, de las que matan.');
      if (d.olla && d.maletin) G.dlgEnd = () => Q.set('nolasco', 3);
      return true;
    }
  },
};
Q.marks.curandera = () => G.stage >= ETAPA.GRECO && Q.st('nolasco') === 0;
Q.marks.abuelo = () => Q.st('nolasco') === 1;

// ====================================================================== 5 · LEOMATILDE
Q.defs.leomatilde = {
  title: 'Leomatilde',
  steps: s => ['', 'Ve de noche a la Ermita de Santa Ana.', 'Habla con la viejecita de la ermita.', 'Acaba con Leomatilde.'][s] || '',
  place() {
    const s = Q.st('leomatilde'), ow = G.worlds.exterior;
    const curro = ow.npcs.find(n => n.key === 'guardia' && !n.q);
    if (curro) { curro.set = (s >= 1 && s < QDONE) ? Art.people.curro_viejo : Art.people.guardia; curro.name = (s >= 1 && s < QDONE) ? 'Curro (envejecido)' : 'Curro'; }
    if (s >= 1 && s < QDONE) { const e = Q.ermita(); if (e) Q.prop('exterior', 'compuerta', 'q_ermita', e[0], e[1], { hidden: true }); }
    if (s >= 1 && s <= 2) Q.npc('q_ermita', 'leovieja', 'Leomatilde', 8, 6, { mark: () => true });
  },
  talk(n) {
    const s = Q.st('leomatilde');
    if (n.key === 'guardia' && G.stage >= ETAPA.CASETA && s === 0) {
      G.say('Curro', 'No me mires así. Ya sé que parezco mi abuelo. Ayer tenía cuarenta años. Hoy tengo... no sé. Noventa.',
        'Anoche fui a la ermita de Santa Ana. Había una viejecita, sola, que me pidió compañía. Leomatilde, se llamaba. Una mala mezcla entre Leocadia y Matilde.',
        'Me contaba las aventuras de su larga vida. Mentía más de lo que hablaba. Pero había algo en ella... Me pidió «un último gusto antes de irse». Y yo...',
        'Y cuando me quise dar cuenta, ella ya no era vieja. Y yo sí. Se reía. Solo reía. Por favor... ve. Pero ve de noche, que de día no está.');
      G.dlgEnd = () => Q.set('leomatilde', 1);
      return true;
    }
    if (n.key === 'leovieja' && n.q) {
      G.sayAs(n, 'Ay, muchacho, qué guapo eres. Ven, siéntate a mi lado, que ya no veo bien. Tengo casi cien años, ¿sabes? Y eso no pasa en balde.',
        'Nunca formé una familia. Precisamente por lo guapa que fui: no podía desperdiciar probar a cada hombre que se me antojara.',
        'Acércate más. Me gustaría tener un último gusto antes de irme...');
      G.dlgEnd = () => G.ask('Leomatilde', 'Algo te empuja hacia ella, un instinto que no es tuyo.', ['Acercarte.', 'Rezar en voz alta (25 de Fe).'], k => {
        const p = G.player, w = G.worlds.q_ermita;
        if (k === 0) { Q.d('leomatilde').robo = true; p.maxHp -= 20; p.hp = Math.min(p.hp, p.maxHp); G.say('Guardián', 'Me acerco. Siento cómo se me va algo por la piel: los años. Me miro las manos y son las de un viejo. (Vida máxima −20 hasta que acabes con ella)'); }
        else { if (p.fe >= 25) { p.fe -= 25; G.say('Guardián', '«Ni frío ni caliente, pero no tuyo.» La viejecita chilla como un gato escaldado.'); } else G.say('Guardián', 'Rezo, pero no me queda Fe. La viejecita se ríe con la boca sin dientes.'); }
        G.dlgEnd = () => {
          w.npcs = w.npcs.filter(x => x !== n); G.shake(0.6); Sound.play('roar');
          Q.set('leomatilde', 3, false);
          Q.foe(w, 'leojoven', 'Leomatilde', n.x, n.y - 4, { hp: 420, dmg: 15, sp: 50, xp: 360, boss: true, props: { drain: 14, blink: true },
            onDeath: () => {
              if (Q.d('leomatilde').robo) { p.maxHp += 20; }
              G.say('Guardián', 'Leomatilde se arruga como un papel en el fuego, y se ríe hasta el final. Solo reía...', 'Las velas de la ermita vuelven a arder derechas.', '(+360 XP · Vida máxima +10 · Fe máxima +10)');
              G.dlgEnd = () => { Q.reward(0, 0, pp => { pp.maxHp += 10; pp.maxFe += 10; pp.hp = pp.maxHp; pp.fe = pp.maxFe; }); Q.set('leomatilde', QDONE); };
            } });
        };
      });
      return true;
    }
    if (n.key === 'guardia' && s >= QDONE && !Q.d('leomatilde').gracias) { Q.d('leomatilde').gracias = true; G.say('Curro', '¡Mírame! ¡Tengo cuarenta años otra vez! Bueno, cuarenta y uno, que tampoco es un milagro.', 'Nunca más voy a la ermita. Ni a misa de doce. Toma, que algo te tengo que dar. (+1 punto de habilidad)'); G.dlgEnd = () => Q.reward(0, 1); return true; }
  },
  use(pr) {
    if (pr.id === 'q_ermita') {
      if (!noche()) { G.say('Guardián', 'La puerta de la ermita está cerrada. De día no hay nadie. Curro dijo que de noche.'); return true; }
      const e = Q.ermita();
      Q.go('q_ermita');
      if (Q.st('leomatilde') === 1) Q.set('leomatilde', 2, false);
      return true;
    }
  },
};
Q.ermita = () => { const w = G.worlds.exterior; for (let y = 115; y < 140; y++) for (let x = 10; x < 30; x++) if (w.get(x, y) === T.CHURCH_DOOR) return [x, y]; return null; };
Q.marks.guardia = () => (G.stage >= ETAPA.CASETA && Q.st('leomatilde') === 0) || (Q.done('leomatilde') && !Q.d('leomatilde').gracias);

// ====================================================================== 6 · EL DÍA DE BALDOMERO
Q.defs.baldomero = {
  title: 'El día de Baldomero',
  steps: s => ['', 'Mañana, antes de las 15:30, ve al Cortijo del Conde.', 'Protege a Andrea.'][s] || '',
  place() {
    const s = Q.st('baldomero'), d = Q.d('baldomero'), ow = G.worlds.exterior;
    if (G.stage < ETAPA.CASETA) return;
    if (s === 0 || (s >= QDONE && d.fin !== 'muerto')) { const [x, y] = Q.free(ow, 45, 113); Q.npc('exterior', 'baldomero', 'Baldomero, el alcalde', x, y); }
    if (s < QDONE || d.fin === 'oscuro') { const [x, y] = Q.free(ow, 48, 116); Q.npc('exterior', 'kevin', 'Kevin', x, y, { mark: () => Q.st('baldomero') === 0 }); }
    if (s === 1 || s === 2) { const [x, y] = Q.free(ow, WG.ruins.conde[0] + 2, WG.ruins.conde[1]); Q.npc('exterior', 'andrea', 'Andrea, la maestra', x, y); }
    if (s >= QDONE && d.fin === 'salvada') { const [x, y] = Q.free(ow, 37, 97); Q.npc('exterior', 'andrea', 'Andrea, la maestra', x, y); }
  },
  talk(n) {
    const s = Q.st('baldomero'), d = Q.d('baldomero');
    if (n.key === 'baldomero' && n.q && s === 0) { G.sayAs(n, '¡Hombre, el Guardián! Baldomero, para servirte. Alcalde de lo que queda, que no es poco.', 'Aquí cada uno arrima el hombro. Si necesitas algo, lo que sea, me lo dices. Siempre que puedo ayudar a alguien, lo hago encantadísimo.'); return true; }
    if (n.key === 'kevin' && n.q && s === 0) {
      G.sayAs(n, '(Kevin se ha afeitado con obstinada delicadeza. Te habla bajito, mirando a todos lados.)',
        'Baldomero y yo nos criamos juntos en un pueblo serrano. Es el mejor hombre que conozco. Y una vez al año... una vez al año no lo es.',
        'Mañana es el día de Baldomero. Cada año, desde hace diecisiete, le acompaño. Yo no hago nada, ¿eh? Solo... estoy. Y luego echo hojarasca por encima de la tierra movida.',
        'Este año ha elegido a la maestra nueva, Andrea, la que vive sola en el Cortijo del Conde, en los olivares del sur. Mañana, a la hora de comer.',
        'No sé por qué te lo cuento. Bueno, sí lo sé.');
      G.dlgEnd = () => { d.day = G.dayN; Q.set('baldomero', 1); };
      return true;
    }
    if (n.key === 'kevin' && n.q && s === 1) { G.sayAs(n, 'Mañana. A la hora de comer. Las 15:31, siempre a la misma hora. Él es muy metódico.'); return true; }
    if (n.key === 'andrea' && n.q && s >= 1 && s < QDONE) { G.sayAs(n, '¿Tú también vienes a darme la bienvenida? Qué pueblo más amable. El alcalde dice que hoy pasará a verme a la hora de comer.'); return true; }
    if (n.key === 'andrea' && n.q && s >= QDONE) { G.sayAs(n, 'Doy clase a los críos en la sacristía. Por las noches sueño con un cuchillo. Pero me despierto.'); return true; }
  },
  tick() {
    const s = Q.st('baldomero'), d = Q.d('baldomero');
    if (s !== 1 || G.world.id !== 'exterior') return;
    const h = hora(), dia = G.dayN - d.day;
    // si se pasa la hora (o el día), llegas tarde
    if (dia > 1 || (dia === 1 && h >= 15.5 && h < 20)) {
      d.fin = 'tarde'; G.q.baldomero.s = QDONE;
      G.say('Guardián', 'Un humito sale por una ventana trasera del Cortijo del Conde. Es tarde. Ha sido a las 15:31, como siempre.', 'En la Plaza del Ayuntamiento, Baldomero saluda a todo el mundo con una felicidad en los ojos propia de un niño. Kevin ya no me mira.');
      Q.refresh(); G.save(); return;
    }
    if (dia === 1 && h >= 11 && h < 15.5 && enArea('Cortijo del Conde') && !G.boss) {
      Q.set('baldomero', 2, false);
      const ow = G.worlds.exterior, [x, y] = Q.free(ow, WG.ruins.conde[0] - 2, WG.ruins.conde[1] + 1);
      const b = Q.npc('exterior', 'baldomero', 'Baldomero', x, y);
      G.sayAs(b, '¡Guardián! Qué casualidad. ¿Tú por aquí, a la hora de comer?', 'Kevin te lo ha contado, ¿verdad? Kevin... Eres el mejor amigo que alguien podría tener, pero hablas demasiado.', 'Mira, te lo explico fácil: si me paso el año pensando en este instante, y lo hago una sola vez, el resto del año soy un buen alcalde. ¿No es mejor así para todos?');
      G.dlgEnd = () => G.ask('Baldomero', 'Andrea, en el porche, no entiende nada.', ['Ponerte delante de Andrea.', 'Mirar hacia otro lado. (Es el día de Baldomero.)'], k => {
        ow.npcs = ow.npcs.filter(z => z !== b);
        if (k === 0) {
          Q.foe(ow, 'baldomero', 'Baldomero', b.x, b.y - 4, { hp: 380, dmg: 19, sp: 56, xp: 380, boss: true, st: { range: 80, wind: 0.6, atk: 0.35, rec: 0.7 }, props: { dash: 230 },
            onDeath: () => G.ask('Baldomero', '«No puedo parar, Kevin lo sabe. Quizás deba entregarme... o ir al manicomio.»', ['Llevarlo ante Padre Tomás.', 'Acabar con él aquí, entre los olivos.'], j => {
              if (j === 0) { G.balance = (G.balance || 0) + 1; d.fin = 'salvada'; G.say('Guardián', 'Baldomero se deja llevar sin resistirse. Andrea no deja de temblar.', 'El pueblo no se lo cree. Su alcalde. El de las mejores ideas. (+1 en la balanza · +1 punto de habilidad)'); }
              else { G.balance = (G.balance || 0) - 1; d.fin = 'salvada'; d.muerto = true; G.say('Guardián', 'Echo hojarasca por encima de la tierra movida. Unas palabras demasiado frías, me diría Kevin.', '(−1 en la balanza · +1 punto de habilidad)'); }
              G.dlgEnd = () => { Q.reward(0, 1); Q.set('baldomero', QDONE); };
            }) });
        } else {
          G.balance = (G.balance || 0) - 3; d.fin = 'oscuro';
          G.say('Guardián', 'Me doy la vuelta. Veinticinco minutos de pura y oscura tristeza entre los olivos. Luego, un humito por la ventana de atrás.', 'Kevin me da un abrazo, masculino, y me mete algo en el bolsillo: el cuchillo. «Para eso están los amigos, ¿no?»', '(−3 en la balanza · Ataque +2)');
          G.dlgEnd = () => { Q.reward(300, 0, p => { p.atk += 2; }); Q.set('baldomero', QDONE); };
        }
      });
    }
  },
};

// ====================================================================== 7 · ESTELAS DE ALIA / UNA TARDE DE INVIERNO
Q.defs.alia = {
  title: 'Estelas de Alia',
  steps: s => ['', 'Ve a cenar a casa de Javier esta noche (a partir de las 20:00).', 'Descubre qué le pasa a su madre.', 'Mira el cuadro de la abuela.'][s] || '',
  place() {
    const s = Q.st('alia'), d = Q.d('alia'), ow = G.worlds.exterior;
    if (G.stage < ETAPA.IGLESIA) return;
    if (!d.door) d.door = Q.door(20, 100, [Q.d('puerta').door, Q.d('obsequios').door]);
    if (s === 0 && d.door) { const [x, y] = Q.free(ow, d.door[0] + 1, d.door[1] + 1); Q.npc('exterior', 'javier', 'Javier', x, y, { mark: () => true }); }
    if (s >= 1 && d.door) Q.prop('exterior', 'compuerta', 'q_casa_madre', d.door[0], d.door[1], { hidden: true });
    const bien = d.fin !== 'fallo';
    if (s >= 1 && bien) Q.npc('q_casa_madre', 'javier', 'Javier', 9, 8);
    if (s === 1) Q.npc('q_casa_madre', 'madre_falsa', 'La madre', 7, 8, { mark: () => true });
    if (s >= 2 && bien) Q.npc('q_casa_madre', 'madre', 'La madre de Javier', 3, 8);
    if (s >= 1) Q.prop('q_casa_madre', s >= 3 && bien ? 'cuadro_urna' : 'cuadro_abuela', 'q_cuadro', 12, 2);
  },
  talk(n) {
    const s = Q.st('alia'), d = Q.d('alia');
    if (n.key === 'javier' && n.q && s === 0) {
      G.sayAs(n, 'Javier. Hace una semana que volví a la casa de mi madre. Tres años con Alia tirados a la basura por una infidelidad. Qué pena...',
        'Trato de mantener la cabeza ocupada, escribiendo, leyendo... Pero la que me preocupa es mi madre. Está rara. Desde lo de mi padre no habla de esas cosas, y ahora no para de hablar de la muerte.',
        '¿Te vienes a cenar esta noche? A partir de las ocho. Así la ves tú. A lo mejor son cosas mías.');
      G.dlgEnd = () => Q.set('alia', 1);
      return true;
    }
    if (n.key === 'madre_falsa' && n.q) {
      G.sayAs(n, '¿Cómo ha ido la tarde, hijo? ... Siéntate. He estado pensando en la muerte.',
        'El tiempo nos engaña, hijo. Al otro lado se encuentran todas las respuestas. Claro está, para quien llega al otro lado.',
        '(Se mete en la boca trozos de carne casi cruda, llenos de sangre de venado. Intenta comerse el propio tenedor mientras te mira.)',
        'Nunca me había sentido más viva. La tristeza de mi hijo me da una nueva vitalidad. Hacía tiempo que no me sentía tan bien.');
      G.dlgEnd = () => {
        G.shake(0.3); Sound.play('door');
        const m2 = Q.npc('q_casa_madre', 'madre', 'La madre de Javier', 2, 9);
        G.sayAs(m2, '¡Javier! Se me olvidaron las llaves, hijo. Finalmente he ido a comprar y traigo las salchichas que te gustan.', '¿Qué pasa? ¿Qué es esa cara? Estás muy pálido.');
        G.dlgEnd = () => G.ask('Guardián', 'Dos madres. Una en la mesa, otra en el pasillo de la entrada. Javier no puede ni hablar.', ['Echar a la que está sentada a la mesa.', 'Echar a la que acaba de llegar.'], k => {
          const w = G.worlds.q_casa_madre;
          if (k === 0) {
            G.say('La madre', '¿No te vas a terminar la cena, hijo...?', '(La voz es atronadora, grave y profunda. Ya no es la voz de una madre.)');
            G.dlgEnd = () => { w.npcs = w.npcs.filter(x => x.key !== 'madre_falsa'); Q.set('alia', 2, false);
              Q.foe(w, 'madre_falsa', 'Lo que se sentó a la mesa', 7 * TS + 8, 7 * TS, { hp: 360, dmg: 15, sp: 46, xp: 320, boss: true, props: { blink: true, drain: 8 },
                onDeath: () => { G.say('Guardián', 'La cosa se deshace en un frío que hiela la cocina. Su madre, la de verdad, abraza a Javier.', 'Javier señala el cuadro de su abuela, en la pared. Algo ha cambiado en él.'); G.dlgEnd = () => Q.set('alia', 3); } }); };
          } else {
            d.fin = 'fallo';
            G.say('La madre', '(La de la mesa ríe de una forma estridente. Se apaga la luz.)', '(Cuando vuelve, no hay nadie. Ni madre, ni madre, ni Javier. Solo la cena, a medio comer.)');
            G.dlgEnd = () => { w.npcs = w.npcs.filter(x => !x.q); Q.set('alia', QDONE); G.toast('Has perdido a Javier.'); };
          }
        });
      };
      return true;
    }
    if (n.key === 'madre' && n.q && s >= 3) { G.sayAs(n, 'Mi madre pintó ese cuadro un invierno de mucho aire. Yo nunca le vi la urna. Ahora sí la veo.', 'Gracias por quedarte a cenar, hijo. Javier dice que no le dejes solo.'); return true; }
  },
  use(pr) {
    const s = Q.st('alia'), d = Q.d('alia');
    if (pr.id === 'q_casa_madre') {
      if (s === 1 && !noche()) { G.say('Guardián', 'Javier dijo a partir de las ocho. Todavía es pronto para la cena.'); return true; }
      Q.go('q_casa_madre');
      return true;
    }
    if (pr.id === 'q_cuadro') {
      if (s === 3) {
        G.say('Guardián', 'El cuadro era un regalo de la abuela. Un aciago día, también de atroz aire, la abuela estaba tratando de llamar a alguien...',
          'Dios santo... ahora hay pintada una urna. Una embellecida aunque fría urna. No una urna cualquiera: la urna de la abuela.',
          'Al tocar el marco siento un calor de manos viejas en las mías. (+300 XP · Vida máxima +10 · Ataque +1)');
        G.dlgEnd = () => { Q.reward(300, 0, p => { p.maxHp += 10; p.atk += 1; p.hp = p.maxHp; }); d.fin = 'abuela'; Q.set('alia', QDONE); };
        return true;
      }
      G.say('Guardián', s >= QDONE && d.fin === 'abuela' ? 'La urna pintada. Parece que la abuela vigila la cocina.' : 'Un cuadro de la abuela de Javier: un paisaje de invierno, una casa, una figura que mira al espectador.');
      return true;
    }
  },
};

// ====================================================================== 8 · BAJADA AL INFIERNO (mazmorra opcional bajo la caseta)
Q.defs.infierno = {
  title: 'Bajada al infierno',
  steps: s => ['', 'Baja los tres tramos de escaleras.', 'Llega al atril.'][s] || '',
  place() {
    const s = Q.st('infierno');
    Q.prop('q_infierno', 'escalera_abajo', 'q_esc1', 18, 15); Q.prop('q_infierno', 'escalera_abajo', 'q_esc2', 39, 15);
    Q.prop('q_infierno', 'escalera_abajo', 'q_esc0', 3, 4);
    Q.prop('q_infierno', 'atril', 'q_atril', 53, 7);
    for (const [x, y] of [[8, 6], [14, 12], [28, 6], [36, 11], [47, 9], [58, 9]]) Q.prop('q_infierno', 'vela', 'q_vela', x, y);
  },
  use(pr) {
    const s = Q.st('infierno');
    if (pr.id === 'caseta' && G.stage >= ETAPA.HOTEL && !Q.done('infierno')) {
      G.ask('Guardián', 'La puerta de la caseta sigue abierta. Abajo suena, muy lejos, una música de celebración, como la del salón de El Greco.', ['Bajar.', 'Todavía no.'], k => {
        if (k !== 0) return;
        if (s === 0) Q.set('infierno', 1, false);
        G.enter('q_infierno', 5 * TS, 6 * TS, 0); Q.sala(0);
      });
      return true;
    }
    if (pr.id === 'q_esc0') { G.enter('exterior', (WG.casetaX + 1) * TS, (WG.casetaY + 2) * TS, 0); return true; }
    if (pr.id === 'q_esc1') { G.player.x = 25 * TS; G.player.y = 6 * TS; G.snapCamera(); Q.sala(1); return true; }
    if (pr.id === 'q_esc2') { G.player.x = 46 * TS; G.player.y = 6 * TS; G.snapCamera(); Q.sala(2); return true; }
    if (pr.id === 'q_vela') { G.say('Guardián', 'Una vela negra que no se consume. Las escaleras giran en tramos de tres, describiendo triángulos.'); return true; }
    if (pr.id === 'q_atril') {
      if (G.world.monsters.some(m => !m.dead)) { G.toast('No puedes leer con los condenados encima.'); return true; }
      if (s >= QDONE) { G.say('Guardián', 'El libro del atril sigue abierto por la misma página. Mi nombre ya no está.'); return true; }
      G.say('Guardián', 'Sobre el atril, un libro enorme abierto. Una lista de nombres del pueblo, con letra apretada. Algunos tachados. Otros, en rojo.',
        'Al final de la página está el mío. Al lado, en vez de una cruz o de una raya, pone: «Ni frío ni caliente».',
        'Una voz detrás de mí, tranquila, horrible: «Esto es solo una parte, tibio. El infierno que hay en este pueblo. El de cada uno se lo trae puesto».',
        'Arranco la página. Arde en mis manos sin quemarme. (+500 XP · +1 punto de habilidad · Fe máxima +15)');
      G.dlgEnd = () => { Q.reward(500, 1, p => { p.maxFe += 15; p.fe = p.maxFe; }); Q.set('infierno', QDONE); };
      return true;
    }
  },
};
// cada tramo, sus condenados (la primera vez y cada vez que vuelvas a bajar)
Q.sala = function (i) {
  const w = G.worlds.q_infierno, R = RNG(G.dayN * 7 + i);
  const salas = [[2, 3, 18, 15], [23, 3, 18, 15], [44, 3, 18, 15]], [x0, y0, ww, hh] = salas[i];
  const kinds = [[MK.HUECO, MK.HUECO, MK.HUECO, MK.SOMBRA], [MK.SOMBRA, MK.SOMBRA, MK.HUECO, MK.ALACRAN, MK.ALACRAN], [MK.SOMBRA, MK.HUECO, MK.HUECO]][i];
  for (const k of kinds) { const m = new Monster(k, (x0 + 4 + R.int(ww - 8)) * TS, (y0 + 5 + R.int(hh - 7)) * TS, 1.4 + i * 0.15); m.aggro = true; w.monsters.push(m); }
  if (i === 2 && !Q.done('infierno')) { const d = new Monster(MK.DEMONIO, 55 * TS, 12 * TS, 0.6); d.aggro = true; d.spawnFade = 1; w.monsters.push(d); G.boss = d; G.toast('Un demonio guarda el atril.'); }
  if (i === 1) Q.set('infierno', 2, false);
};

// ====================================================================== 9 · EPÍLOGO: LA MUJER DEL PASILLO
// Cada noche que duermes en tu cama se acerca un poco por el pasillo. Terminar misiones la aleja.
Q.defs.pasillo = {
  title: 'Epílogo',
  steps: s => ['', 'Cada noche, la mujer del pasillo está más cerca.', 'Está a tu lado.'][s] || '',
  place() {
    const s = Q.st('pasillo'), d = Q.d('pasillo');
    if (s >= 1 && s < QDONE && noche()) {
      const [x, y] = [[22, 7], [20, 7], [19, 8], [17, 6], [15, 7], [15, 8], [15, 10]][Math.min(6, d.paso || 0)];
      Q.npc('casa_alta', 'mujer', 'La mujer del pasillo', x, y, { alpha: 0.85, dir: 2 });
    }
  },
  talk(n) {
    if (n.key !== 'mujer' || !n.q) return;
    G.say('Guardián', '(Me mira. Sus ojos, o lo poco que puedo ver de ellos, son grandes y negros. Horriblemente negros.)', '(No dice nada. No se mueve. Pero mañana estará más cerca.)');
    return true;
  },
  use(pr) {
    if (pr.id !== 'cama' || G.stage < ETAPA.GRECO || !noche()) return;
    const s = Q.st('pasillo'), d = Q.d('pasillo');
    if (s === 0) { G.q.pasillo = { s: 1, d: { paso: 0 }, t: G.clock }; G.say('Guardián', 'Tumbado en la cama, con la puerta abierta para que pase la corriente fresca de la noche, la veo en el pasillo.', 'Una mujer, ligeramente blanquecina, que me mira fijamente. No me puedo mover de ninguna forma.'); G.dlgEnd = () => { G.rest('Al final, el sueño te vence.'); Q.refresh(); }; return true; }
    if (s >= 1 && s < QDONE) {
      // se acerca mientras duermes: un paso por cada 4 horas de sueño (lo que sobra se guarda para otra noche)
      const horas = G.sleepHours ? G.sleepHours() : 8, p0 = d.paso || 0;
      d.acc = (d.acc || 0) + horas; const pasos = Math.floor(d.acc / 4); d.acc -= pasos * 4;
      d.paso = p0 + pasos;
      if (d.paso >= 7) {
        G.say('Guardián', 'Esta noche, por fin, está a centímetros de mí. Puede que siempre haya estado ahí, desde mi mismo nacimiento, acercándose poco a poco.', 'La noche ya está aquí.');
        G.dlgEnd = () => {
          const w = G.worlds.casa_alta; for (const a of w.areas) a.safe = false;
          Q.set('pasillo', 2, false);
          Q.foe(w, 'mujer', 'La mujer del pasillo', G.player.x + 18, G.player.y - 4, { hp: 520, dmg: 18, sp: 44, xp: 500, boss: true, props: { blink: true },
            onDeath: () => {
              for (const a of w.areas) a.safe = true;
              G.say('Guardián', 'Se deshace sin ruido, como la escarcha al sol. El pasillo vuelve a oler a casa.', 'Encima del escritorio hay una nota con mi letra. No recuerdo haberla escrito: «Con suerte, puede que alguien me crea».', '(+500 XP · +2 puntos de habilidad)');
              G.dlgEnd = () => { Q.reward(0, 2); Q.set('pasillo', QDONE); };
            } });
        };
        return true;
      }
      const donde = ['al fondo del pasillo, junto al baño', 'a la altura del baño', 'a la puerta de la habitación 3', 'casi en tu puerta', 'en tu puerta', 'dentro de la habitación', 'a los pies de la cama'][Math.min(6, d.paso)];
      G.dlgEnd = null;
      G.rest(pasos === 0 ? 'Abro los ojos de golpe. La mujer sigue ' + donde + '. No se ha movido. Creo.' : pasos === 1 ? 'Duermo mal. Al abrir los ojos, la mujer del pasillo está un poco más cerca: ' + donde + '.' : 'He dormido demasiado. Al abrir los ojos, la mujer ha avanzado mucho: ya está ' + donde + '.');
      Q.refresh();
      return true;
    }
  },
};
// terminar una misión la aleja dos noches
Q.pasilloBack = function () { const d = G.q.pasillo && G.q.pasillo.d; if (d && G.q.pasillo.s < QDONE && G.q._last !== 'pasillo') d.paso = Math.max(0, (d.paso || 0) - 2); };

// ---------------------------------------------------------------- diario de misiones (en el menú de pausa)
ST.QUESTS = 'QUESTS';
const _pm = G.pauseMenu;
G.pauseMenu = function () { const m = _pm.call(this); m.splice(1, 0, 'Diario de misiones'); return m; };
G.updatePause = function () {
  const m = this.pauseMenu();
  if (this.pressed('Escape', 'KeyP')) { this.st = ST.PLAY; return; }
  if (this.menuNav(m)) {
    switch (this.menuIdx) {
      case 0: this.st = ST.PLAY; break;
      case 1: this.st = ST.QUESTS; this.qSel = 0; break;
      case 2: this.openSkills(); break;
      case 3: this.save(); this.toast('Partida guardada'); this.st = ST.PLAY; break;
      case 4: this.helpBack = ST.PAUSE; this.st = ST.HELP; break;
      case 5: Sound.toggle(); break;
      case 6: this.st = ST.TITLE; this.menuIdx = 0; this.hasSave = !!this.readSave(); Sound.music('noche'); break;
    }
  }
};
G.updateQuests = function () {
  const list = Q.list();
  if (this.pressed('Escape', 'KeyP', 'Back')) { this.st = ST.PAUSE; return; }
  if (this.pressed('ArrowDown', 'KeyS')) this.qSel = Math.min(list.length - 1, (this.qSel || 0) + 1);
  if (this.pressed('ArrowUp', 'KeyW')) this.qSel = Math.max(0, (this.qSel || 0) - 1);
  if (this.pressed('Enter', 'KeyE', 'Space') && list[this.qSel]) { this.q._track = list[this.qSel].id; this.toast('Siguiendo: ' + list[this.qSel].title); this.st = ST.PLAY; }
  for (let i = 0; i < list.length; i++) if (this.just.has('Pick' + i)) { this.just.delete('Pick' + i); if (this.qSel === i) { this.q._track = list[i].id; this.toast('Siguiendo: ' + list[i].title); this.st = ST.PLAY; } else this.qSel = i; }
  if (this.just.has('Pick99') || this.just.has('Tap')) { this.just.delete('Pick99'); this.just.delete('Tap'); this.st = ST.PAUSE; }
};
Q.list = () => Object.keys(Q.defs).filter(k => Q.st(k) > 0).map(k => ({ id: k, title: Q.defs[k].title, done: Q.done(k), step: Q.done(k) ? ({ verdad: 'Le contaste la verdad a Manuel.', mentira: 'Le dijiste a Manuel que no había nada.', tapado: 'El bujero está tapado. Doro vive con ello.', doro: 'Doro se asomó al bujero.', honrado: 'Ni un céntimo del maletín.', disparo: 'Le disparaste a Casimiro.', devuelto: 'Devolviste lo que no era tuyo.', justicia: 'Nolasco, encerrado en la sacristía.', destierro: 'Nolasco, desterrado al pantano.', salvada: 'Andrea está viva.', oscuro: 'Fue el día de Baldomero.', tarde: 'Llegaste tarde al Cortijo del Conde.', fallo: 'Perdiste a Javier.', abuela: 'La urna de la abuela.' }[Q.d(k).fin] || 'Cumplida.') : Q.defs[k].steps(Q.st(k)) }));
G.uiQuests = function (g) {
  g.fillStyle = 'rgba(6,4,4,0.82)'; g.fillRect(0, 0, VW, VH);
  this.panel(g, 24, 14, VW - 48, VH - 28);
  g.font = FT(11); this.center(g, 'Diario de misiones', 32, GOLD);
  g.fillStyle = UI.bronze; g.fillRect(VW / 2 - 60, 36, 120, 1);
  const list = Q.list();
  if (!list.length) { g.font = FB(7); this.center(g, 'Todavía no te has metido en los asuntos de nadie.', 70, PAPER); }
  list.forEach((q, i) => {
    const y = 50 + i * 17, sel = i === (this.qSel || 0);
    if (sel) { g.fillStyle = 'rgba(160,30,24,0.3)'; g.fillRect(32, y - 9, VW - 64, 16); }
    g.font = FT(7.6); this.text(g, (q.done ? '✓ ' : (this.q._track === q.id ? '◆ ' : '· ')) + q.title, 38, y, q.done ? '#8a7a62' : GOLD);
    g.font = FB(6); this.text(g, q.step, 160, y, q.done ? '#7a6a5a' : PAPER);
    this.menuRects.push({ i, x: 32, y: y - 9, w: VW - 64, h: 16 });
  });
  g.font = FB(5.6); this.center(g, G.touch ? 'Toca una misión para seguirla (dos toques)' : 'Enter: seguir esta misión · Esc o clic en Volver: salir', VH - 34, DIM);
  // botón de volver
  this.panel(g, VW / 2 - 34, VH - 30, 68, 15, false);
  g.font = FT(7.4); this.center(g, '‹ Volver', VH - 19.5, PAPER);
  this.menuRects.push({ i: 99, x: VW / 2 - 40, y: VH - 32, w: 80, h: 20 });
};
const _updQ = G.update;
G.update = function (dt) { if (this.st === ST.PLAY && this.page) this.st = ST.DIALOG; if (this.st === ST.QUESTS) { this.updateQuests(); this.clock += dt; return; } _updQ.call(this, dt); };
