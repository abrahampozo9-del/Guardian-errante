// ====================================================================== a qué misión guía la flecha
// En el Diario de misiones se elige qué seguir: la historia principal o cualquier misión secundaria.
// La flecha, la estrella del mapa y el marcador apuntan a esa. Si el sitio está dentro de una casa o en
// otra zona, la flecha lleva primero a la puerta o al camino que lleva hasta allí.
G.isGuided = function (id) { return id === 'main' ? !this.q._track : this.q._track === id; };
G.setGuide = function (it) {
  if (!it) return;
  if (it.done) { this.toast(it.title + ' ya está cumplida.'); return; }
  this.q._track = it.id === 'main' ? null : it.id;
  this.toast('La flecha te guía a: ' + it.title);
  this.hudSig = null; this.st = ST.PLAY; this.save();
};
const _listG = Q.list;
Q.list = function () { return [{ id: 'main', title: 'Historia principal', done: false, step: G.objective() }].concat(_listG()); };

// ---------------------------------------------------------------- dónde está cada cosa
const QG = {};
QG.prop = (wid, id) => { const w = G.worlds[wid]; if (!w) return null; const p = w.props.find(pr => pr.id === id); return p ? [Math.floor(p.x / 16), Math.floor((p.y - 2) / 16) + 1, wid] : null; };
QG.npc = (wid, key) => { const w = G.worlds[wid]; if (!w) return null; const n = w.npcs.find(x => x.key === key && x.q) || w.npcs.find(x => x.key === key); return n ? [Math.floor(n.x / 16), Math.floor(n.y / 16), wid] : null; };
QG.foe = () => { const b = G.boss; return b && !b.dead && b.qfoe ? [Math.floor(b.x / 16), Math.floor(b.y / 16), G.world.id] : null; };
QG.at = (x, y, wid) => [x, y, wid];
// destino de cada misión según el paso en que va
Q.targets = {
  puerta: s => {
    const d = Q.d('puerta');
    if (s === 1) return QG.prop('exterior', 'cochera');
    if (s === 2) return QG.at(12, 9, 'q_casa_manuel');
    if (s === 3) return QG.foe() || QG.at(30, 14, 'q_gris');
    if (s === 4) return QG.npc('q_casa_manuel', 'victor') || QG.at(6, 9, 'q_casa_manuel');
    if (s === 5) return QG.npc('pantano', 'manuel') || (WS.hotelDoor ? [WS.hotelDoor[0] + 1, WS.hotelDoor[1] + 2, 'pantano'] : null);
  },
  bujero: s => s === 2 ? QG.prop('exterior', 'q_saco') : QG.at(17, 12, 'q_sotano'),
  obsequios: s => {
    if (s === 1) return QG.prop('exterior', 'q_maletin');
    if (s === 2) return QG.prop('exterior', 'q_moneda') || [WG.doorX + 2, WG.doorY + 2, 'exterior'];
    if (s === 3) return QG.npc('exterior', 'ursula') || [44, 115, 'exterior'];
    if (s === 4) return QG.foe() || QG.npc('exterior', 'malpario') || [30, 111, 'exterior'];
    if (s === 5) return QG.npc('exterior', 'huevo') || [WG.grecoX + 3, WG.grecoY + 2, 'exterior'];
    if (s === 6) return QG.prop('exterior', 'q_pistola');
    if (s === 7) return QG.at(9, 7, 'q_casa_ursula');
    if (s === 8) return QG.foe() || [WG.doorX + 2, WG.doorY + 3, 'exterior'];
  },
  nolasco: s => {
    const d = Q.d('nolasco');
    if (s === 1) return QG.npc('exterior', 'abuelo');
    if (s === 2) return QG.prop('exterior', d.olla ? 'q_maletin_n' : 'q_olla');
    if (s === 3) return QG.npc('exterior', 'nolasco');
    if (s === 4) return QG.npc('exterior', 'sancho');
    if (s === 5) return QG.foe() || QG.npc('exterior', 'nolasco');
  },
  leomatilde: s => QG.foe() || QG.npc('q_ermita', 'leovieja') || QG.at(8, 7, 'q_ermita'),
  baldomero: s => QG.foe() || (WG.ruins && WG.ruins.conde ? [WG.ruins.conde[0], WG.ruins.conde[1] + 1, 'exterior'] : null),
  alia: s => s === 3 ? QG.at(12, 3, 'q_casa_madre') : QG.foe() || QG.at(7, 9, 'q_casa_madre'),
  infierno: s => s === 2 ? QG.at(53, 8, 'q_infierno') : QG.at(18, 15, 'q_infierno'),
  pasillo: s => QG.foe() || QG.at(7, 12, 'casa_alta'),
  malasuerte: s => {
    const d = Q.d('malasuerte'), p = d.p || {};
    if (s === 1) return QG.at(4, 24, 'campocamara');
    if (s === 2) { if (!p.pilon) return QG.at(34, 19, 'campocamara'); if (!p.mujer) return QG.at(36, 23, 'campocamara'); if (!p.bolsa) return QG.at(44, 26, 'campocamara'); return QG.at(12, 3, 'q_casa_cc'); }
    if (s === 3) { const w = G.worlds.campocamara, m = w && w.monsters.find(x => x.ccVecino && !x.dead); return m ? [Math.floor(m.x / 16), Math.floor(m.y / 16), 'campocamara'] : QG.at(40, 25, 'campocamara'); }
    if (s === 4) return QG.npc('pantano', 'juan') || [60, 141, 'pantano'];
    if (s === 5) return QG.foe() || QG.npc('pantano', 'juan') || [60, 140, 'pantano'];
  },
};
Q.target = function (id) { const f = Q.targets[id]; if (!f) return null; try { return f(Q.st(id)) || null; } catch (e) { return null; } };
const _objTG = G.objectiveTarget;
G.mainTarget = function () { return _objTG.call(this); };
G.objectiveTarget = function () {
  const id = this.q && this.q._track;
  if (id && Q.defs[id] && Q.st(id) > 0 && !Q.done(id)) return Q.target(id);
  return _objTG.call(this);
};

// ---------------------------------------------------------------- cómo se llega: cada interior y su puerta
// padre(id) = [mundo donde está la puerta, [x, y] de la puerta]
QG.parent = function (id) {
  switch (id) {
    case 'q_casa_manuel': return Q.d('puerta').door ? ['exterior', Q.d('puerta').door] : null;
    case 'q_gris': return ['q_casa_manuel', [12, 9]];
    case 'q_sotano': return ['exterior', [WG.rx - 9, 95]];
    case 'q_ermita': { const e = Q.ermita(); return e ? ['exterior', e] : null; }
    case 'q_casa_madre': return Q.d('alia').door ? ['exterior', Q.d('alia').door] : null;
    case 'q_casa_ursula': return Q.d('obsequios').door ? ['exterior', Q.d('obsequios').door] : null;
    case 'q_casa_cc': return typeof CC !== 'undefined' && CC.door ? ['campocamara', CC.door] : null;
    case 'q_infierno': case 'abajo': return ['exterior', [WG.casetaX, WG.casetaY]];
    case 'relojero': return typeof SIE !== 'undefined' && SIE.door ? ['sierra', SIE.door] : null;
    case 'buhardilla': return ['relojero', [15, 2]];
    case 'casa_baja': return ['exterior', [WG.doorX, WG.doorY]];
    case 'casa_alta': return ['casa_baja', [20, 2]];
  }
  return null;
};
const ordenDe = id => id === 'campocamara' ? 0 : ((SECCIONES[id] || {}).orden || 0);
const ARROW = G.arrowTarget = function () {
  const t = this.objectiveTarget(); if (!t) return null;
  const w = this.world; if (!w) return null;
  let tw = t[2] || 'exterior';
  if (tw === w.id) return t;
  // la cadena de puertas desde el destino hasta el exterior
  const chain = [tw]; for (let k = 0; k < 6; k++) { const p = QG.parent(chain[chain.length - 1]); if (!p) break; chain.push(p[0]); }
  const i = chain.indexOf(w.id);
  if (i > 0) { const door = QG.parent(chain[i - 1]); return door ? [door[1][0], door[1][1]] : null; }
  // si estás en un interior que no va hacia allí, sal por donde entraste
  if (!w.outdoor) { const wp = w.warps[w.warps.length - 1]; return wp ? [wp.x + Math.floor(wp.w / 2), wp.y + Math.floor(wp.h / 2)] : null; }
  // de una zona a otra: primero el camino directo, si lo hay; si no, hacia la zona siguiente
  const O = chain[chain.length - 1];
  const direct = w.warps.find(wp => wp.load && wp.to === O);
  if (direct) return [direct.x + Math.floor(direct.w / 2), direct.y + Math.floor(direct.h / 2)];
  const here = ordenDe(w.id), there = ordenDe(O);
  if (here === there) { const any = w.warps.find(wp => wp.load && wp.to === 'exterior'); return any ? [any.x, any.y + Math.floor(any.h / 2)] : null; }
  const want = Object.keys(SECCIONES).find(k => SECCIONES[k].orden === here + (there > here ? 1 : -1)) || (here + (there > here ? 1 : -1) === 0 ? 'exterior' : null);
  const ex = w.warps.find(wp => wp.load && wp.to === want) || w.warps.find(wp => wp.load && wp.to === 'exterior');
  return ex ? [ex.x + Math.floor(ex.w / 2), ex.y + Math.floor(ex.h / 2)] : null;
};

// ---------------------------------------------------------------- flecha también en interiores, y rombo sobre el destino
const _lateG = Q.late;
Q.late = function () {
  _lateG();
  G.arrowTarget = ARROW; // la de este archivo manda sobre las versiones anteriores
  const _rw = G.renderWorld;
  G.renderWorld = function (g) {
    _rw.call(this, g);
    if (this.padel || this.st !== ST.PLAY) return;
    const w = this.world, tgt = this.arrowTarget(); if (!tgt) return;
    const cx = Math.round(this.camX), cy = Math.round(this.camY);
    const ox = tgt[0] * TS + 8 - cx, oy = tgt[1] * TS + 8 - cy;
    const col = this.q._track ? '120,220,255' : '255,214,110';
    if (ox >= 8 && ox <= WW - 8 && oy >= 8 && oy <= WH - 8) {
      // a la vista: rombo que flota encima
      const by = oy - 20 + Math.sin(this.clock * 4) * 2;
      g.fillStyle = `rgba(${col},0.9)`; g.beginPath(); g.moveTo(ox, by - 4); g.lineTo(ox + 3, by); g.lineTo(ox, by + 4); g.lineTo(ox - 3, by); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(Math.round(ox) - 1, Math.round(by) - 2, 1, 2);
    } else if (!w.outdoor) {
      // fuera de la vista, en interiores (en exteriores la flecha del borde ya la pinta el juego)
      const ang = Math.atan2(oy - WH / 2, ox - WW / 2);
      let ex = WW / 2 + Math.cos(ang) * (WW / 2 - 14), ey = WH / 2 + Math.sin(ang) * (WH / 2 - 14);
      ex = Math.max(10, Math.min(WW - 10, ex)); ey = Math.max(30, Math.min(WH - 10, ey));
      g.fillStyle = `rgba(${col},${(140 + Math.sin(this.clock * 5) * 80) / 255})`;
      g.beginPath(); g.moveTo(ex + Math.cos(ang) * 6, ey + Math.sin(ang) * 6); g.lineTo(ex + Math.cos(ang + 2.4) * 5, ey + Math.sin(ang + 2.4) * 5); g.lineTo(ex + Math.cos(ang - 2.4) * 5, ey + Math.sin(ang - 2.4) * 5); g.fill();
    }
  };
};
