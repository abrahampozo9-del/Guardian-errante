// ====================================================================== duros, armas de distancia y el taller de la cochera
// Después del Colapso el euro se fue con la luz y en el valle se volvió a pagar con duros: los de cinco
// pesetas de toda la vida y la calderilla vieja que la gente guardaba en los cajones. Se ganan matando
// engendros, limpiando guaridas, cumpliendo misiones, registrando coches y apostando al pádel.
// Se gastan en el banco de trabajo de la cochera del cortijo: armas, munición y mejoras.
const DURO = { uno: 'duro', varios: 'duros' };
const nDuros = n => n + ' ' + (n === 1 ? DURO.uno : DURO.varios);

// ---------------------------------------------------------------- armas
// dmg: daño por proyectil · cd: segundos entre disparos · sp: velocidad (px/s) · life: alcance (s)
// n/spread: perdigones · pierce: enemigos que atraviesa · kb: empuje · ammo: munición que gasta
const GUNS = {
  arco: { name: 'Arco de caza', short: 'Arco', price: 45, dmg: 20, cd: 0.6, sp: 300, life: 0.75, n: 1, spread: 0, pierce: 0, kb: 120, ammo: 'flechas', kind: 'flecha', snd: 'swing', desc: 'Silencioso y barato. Flechas de caña con punta de hierro.' },
  pistola: { name: 'Pistola corta', short: 'Pistola', price: 90, dmg: 17, cd: 0.32, sp: 430, life: 0.55, n: 1, spread: 0.04, pierce: 0, kb: 90, ammo: 'balas', kind: 'bala', snd: 'hit', desc: 'Rápida y de poco alcance. La de la Guardia Civil de Huesa.', stage: ETAPA.RIBERA },
  ballesta: { name: 'Ballesta', short: 'Ballesta', price: 140, dmg: 46, cd: 1.25, sp: 360, life: 0.85, n: 1, spread: 0, pierce: 1, kb: 200, ammo: 'virotes', kind: 'virote', snd: 'swing', desc: 'Lenta de cargar, pero el virote atraviesa a un engendro y sigue.', stage: ETAPA.IGLESIA },
  escopeta: { name: 'Escopeta del abuelo', short: 'Escopeta', price: 180, dmg: 13, cd: 1.05, sp: 380, life: 0.3, n: 6, spread: 0.42, pierce: 0, kb: 260, ammo: 'cartuchos', kind: 'perdigon', snd: 'roar', desc: 'La del abuelo, la de la caja vacía del baúl. Arreglada, de cerca no perdona.', stage: ETAPA.GRECO },
  rifle: { name: 'Rifle de cerrojo', short: 'Rifle', price: 300, dmg: 72, cd: 1.6, sp: 720, life: 0.7, n: 1, spread: 0, pierce: 2, kb: 220, ammo: 'balas_rifle', kind: 'bala', snd: 'roar', desc: 'De los de las monterías de la sierra. Lejos, fuerte y atraviesa.', stage: ETAPA.HOTEL },
};
const AMMO = {
  flechas: { name: 'Flechas', n: 12, price: 8 },
  balas: { name: 'Balas de pistola', n: 12, price: 12 },
  virotes: { name: 'Virotes', n: 6, price: 12 },
  cartuchos: { name: 'Cartuchos', n: 6, price: 15 },
  balas_rifle: { name: 'Balas de rifle', n: 5, price: 20 },
};
const AFILAR = [60, 120, 200]; // tres afilados de la espada: +2 de ataque cada uno

// estado del jugador (se guarda con la partida)
G.duros = 0;
G.guns = { own: [], eq: null, ammo: {}, afilado: 0 };
G.addDuros = function (n, x, y) {
  if (!n) return;
  this.duros = Math.max(0, (this.duros || 0) + n);
  const p = this.player;
  if (n > 0 && p) this.fx.push(Fx.text(x !== undefined ? x : p.x, (y !== undefined ? y : p.y) - 34, '+' + nDuros(n), 0xe0e0e8));
};

// ---------------------------------------------------------------- arte (iconos y proyectiles)
const _initQuestsT = Art.initQuests;
Art.initQuests = function () {
  _initQuestsT.call(this);
  const { img, p, r, line, outline } = Px;
  const ic = {};
  { const b = img(16, 16); for (let i = 0; i < 12; i++) { const a = -1.2 + i * 0.2; p(b, 8 + Math.cos(a) * 6 - 2, 8 + Math.sin(a) * 6, 0x8a5a2a); } line(b, 4, 2, 4, 14, 0xd8d0c0); line(b, 4, 8, 13, 8, 0x6a4a2a); p(b, 14, 8, 0xc8c8d0); outline(b, 0x1a120a); ic.arco = b; }
  { const b = img(16, 16); r(b, 3, 6, 10, 3, 0x3a3a40); r(b, 3, 6, 10, 1, 0x6a6a72); r(b, 9, 9, 3, 4, 0x2a2420); outline(b, 0x0e0e10); ic.pistola = b; }
  { const b = img(16, 16); r(b, 2, 8, 12, 2, 0x6a4a2a); line(b, 9, 3, 9, 13, 0x4a3a2a); line(b, 9, 3, 14, 8, 0xd8d0c0); line(b, 9, 13, 14, 9, 0xd8d0c0); r(b, 2, 10, 3, 3, 0x5a3a1a); outline(b, 0x140c06); ic.ballesta = b; }
  { const b = img(16, 16); r(b, 1, 7, 9, 2, 0x3a3a40); r(b, 1, 6, 9, 1, 0x7a7a82); r(b, 10, 7, 5, 3, 0x6a3a1a); r(b, 12, 10, 3, 3, 0x6a3a1a); outline(b, 0x0e0a08); ic.escopeta = b; }
  { const b = img(16, 16); r(b, 0, 7, 11, 1, 0x3a3a40); r(b, 5, 5, 4, 1, 0x2a2a30); r(b, 9, 7, 6, 2, 0x7a4a22); r(b, 12, 9, 3, 3, 0x7a4a22); p(b, 8, 8, 0xc8c8d0); outline(b, 0x0e0a08); ic.rifle = b; }
  { const b = img(16, 16); line(b, 3, 13, 13, 3, 0xd8dce4); line(b, 4, 13, 13, 4, 0x9aa0aa); r(b, 2, 12, 3, 3, 0x6a4a2a); outline(b, 0x1a1a20); ic.afilar = b; }
  { const b = img(16, 16); for (const [x, y, c] of [[3, 4, 0xc87a2a], [7, 4, 0xc8a02a], [11, 4, 0xa8a8b0]]) { r(b, x, y, 3, 8, c); r(b, x, y, 3, 1, 0xf0e0b0); } outline(b, 0x1a120a); ic.municion = b; }
  Art.gunIcons = ic;
};

// ---------------------------------------------------------------- disparar
G.gunFire = function () {
  const p = this.player, g = this.guns, id = g.eq;
  if (!id) { if (!this.flags.has('tuto_armas')) { this.flags.add('tuto_armas'); this.toast('No llevas arma de distancia. En el taller de la cochera puedes hacerte con una.'); } return; }
  const W = GUNS[id];
  if ((p.gunCool || 0) > 0 || p.rollT > 0) return;
  if (!(g.ammo[W.ammo] > 0)) { this.toast('Sin ' + AMMO[W.ammo].name.toLowerCase() + '. Se compran en el taller de la cochera.'); p.gunCool = 0.4; return; }
  g.ammo[W.ammo]--; p.gunCool = W.cd;
  // apunta solo hacia el engendro más cercano que tengas delante; si no hay, hacia donde miras
  const fv = [[0, 1], [0, -1], [-1, 0], [1, 0]][p.dir];
  let sx = this.stick.x, sy = this.stick.y;
  if (this.down('ArrowLeft', 'KeyA')) sx -= 1; if (this.down('ArrowRight', 'KeyD')) sx += 1; if (this.down('ArrowUp', 'KeyW')) sy -= 1; if (this.down('ArrowDown', 'KeyS')) sy += 1;
  let ax = fv[0], ay = fv[1]; const sl = Math.hypot(sx, sy); if (sl > 0.3) { ax = sx / sl; ay = sy / sl; }
  const reach = W.sp * W.life + 20;
  let best = null, bd = 1e9;
  for (const m of this.world.monsters) {
    if (m.dead || (m.vulnerable && !m.vulnerable())) continue;
    const dx = m.x - p.x, dy = m.y - 8 - (p.y - 10), d = Math.hypot(dx, dy);
    if (d > reach || d < 1) continue;
    const cos = (dx * ax + dy * ay) / d; if (cos < 0.62) continue;
    const s = d * (2 - cos); if (s < bd) { bd = s; best = [dx / d, dy / d]; }
  }
  if (best) { ax = best[0]; ay = best[1]; }
  const ang = Math.atan2(ay, ax);
  this.shots = this.shots || [];
  for (let i = 0; i < W.n; i++) {
    const a = ang + (W.n > 1 ? (i / (W.n - 1) - 0.5) * W.spread : 0) + (this.rnd.next() - 0.5) * W.spread * (W.n > 1 ? 0.3 : 1);
    this.shots.push({ x: p.x + Math.cos(a) * 8, y: p.y - 10 + Math.sin(a) * 8, vx: Math.cos(a) * W.sp, vy: Math.sin(a) * W.sp, life: W.life * (0.85 + this.rnd.next() * 0.3), dmg: W.dmg, pierce: W.pierce, kb: W.kb, kind: W.kind, hit: new Set() });
  }
  if (Math.abs(ax) > Math.abs(ay)) p.dir = ax < 0 ? 2 : 3; else p.dir = ay < 0 ? 1 : 0;
  Sound.play(W.snd);
  if (W.kind !== 'flecha' && W.kind !== 'virote') { for (let i = 0; i < 4; i++) this.fx.push(Fx.spark(p.x + ax * 12, p.y - 10 + ay * 12, ax * 80 + this.rnd.gauss() * 30, ay * 80 + this.rnd.gauss() * 30, 0xffd070, 0.18)); this.shake(W.kind === 'perdigon' ? 0.12 : 0.06); }
};
G.updateShots = function (dt) {
  const w = this.world; if (!this.shots || !this.shots.length) return;
  this.shots = this.shots.filter(s => {
    s.life -= dt; if (s.life <= 0) return false;
    const steps = 3;
    for (let k = 0; k < steps; k++) {
      s.x += s.vx * dt / steps; s.y += s.vy * dt / steps;
      const tx = Math.floor(s.x / TS), ty = Math.floor((s.y + 8) / TS), t = w.get(tx, ty);
      if (T.SOLID[t] && !T.isWater(t)) { for (let i = 0; i < 3; i++) this.fx.push(Fx.spark(s.x, s.y, this.rnd.gauss() * 40, this.rnd.gauss() * 40, 0xb8a888, 0.2)); return false; }
      for (const m of w.monsters) {
        if (m.dead || s.hit.has(m) || (m.vulnerable && !m.vulnerable())) continue;
        if (Math.abs(m.x - s.x) < (m.hw || 6) + 5 && Math.abs(m.y - 8 - s.y) < (m.hh || 6) + 9) {
          s.hit.add(m); m.aggro = true;
          const crit = this.rnd.next() < 0.1;
          this.damageMonster(m, Math.round(s.dmg * (crit ? 1.6 : 1)), crit, s.vx, s.vy, false);
          if (!m.dead && m.knock) m.knock(s.vx, s.vy, s.kb);
          if (s.pierce-- <= 0) return false;
        }
      }
    }
    return true;
  });
};
G.drawShots = function (g) {
  if (!this.shots || !this.shots.length) return;
  const cx = Math.round(this.camX), cy = Math.round(this.camY);
  for (const s of this.shots) {
    const x = s.x - cx, y = s.y - cy, l = Math.hypot(s.vx, s.vy), ux = s.vx / l, uy = s.vy / l;
    if (s.kind === 'flecha' || s.kind === 'virote') {
      const L = s.kind === 'virote' ? 7 : 9;
      g.strokeStyle = s.kind === 'virote' ? '#4a3a2a' : '#8a6a3a'; g.lineWidth = s.kind === 'virote' ? 1.6 : 1; g.beginPath(); g.moveTo(x - ux * L, y - uy * L); g.lineTo(x, y); g.stroke();
      g.fillStyle = '#d8d8e0'; g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
      g.fillStyle = '#e8e0d0'; g.fillRect(Math.round(x - ux * L) - 1, Math.round(y - uy * L) - 1, 2, 2);
    } else {
      const L = s.kind === 'perdigon' ? 3 : 7;
      g.strokeStyle = 'rgba(255,220,120,0.9)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - ux * L, y - uy * L); g.lineTo(x, y); g.stroke();
      g.fillStyle = '#fff4c0'; g.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  }
  g.lineWidth = 1;
};
G.cycleGun = function () {
  const g = this.guns; if (g.own.length < 2) return;
  const i = g.own.indexOf(g.eq); g.eq = g.own[(i + 1) % g.own.length];
  this.toast(GUNS[g.eq].name + ' · ' + (g.ammo[GUNS[g.eq].ammo] || 0) + ' ' + AMMO[GUNS[g.eq].ammo].name.toLowerCase());
};
const _updT = G.updatePlay;
G.updatePlay = function (dt) {
  const p = this.player;
  if (this.st === ST.PLAY && p && !p.dead) {
    if (this.pressed('KeyF', 'Shoot')) this.gunFire();
    if (this.pressed('KeyR', 'Swap')) this.cycleGun();
  }
  _updT.call(this, dt);
  if (p) p.gunCool = Math.max(0, (p.gunCool || 0) - dt);
  this.updateShots(dt);
};
const _enterT = G.enter;
G.enter = function (id, x, y, dir) { this.shots = []; _enterT.call(this, id, x, y, dir); };

// ---------------------------------------------------------------- de dónde salen los duros
const BOTIN = {}; // por tipo de engendro: [mínimo, máximo]
BOTIN[MK.HUECO] = [1, 3]; BOTIN[MK.SOMBRA] = [2, 4]; BOTIN[MK.ALACRAN] = [1, 3]; BOTIN[MK.JABALI] = [2, 5]; BOTIN[MK.AHOGADO] = [2, 4];
BOTIN[MK.NIDO] = [5, 9]; BOTIN[MK.DEMONIO] = [25, 40]; BOTIN[MK.BESTIA] = [80, 100]; BOTIN[MK.HUMANO] = [12, 20];
const _killT = G.killMonster;
G.killMonster = function (m) {
  const wasDead = m.dead, lair = m.lair, lairWas = lair && lair.cleared;
  _killT.call(this, m);
  if (wasDead) return;
  const b = BOTIN[m.kind]; if (b) { const n = Math.round((b[0] + this.rnd.int(b[1] - b[0] + 1)) * Math.max(1, m.tier || 1)); this.addDuros(n, m.x, m.y); }
  if (lair && lair.cleared && !lairWas) { this.addDuros(10); }
};
// cada misión cumplida, una bolsa de duros
const _qset = Q.set;
Q.set = function (id, s, msg) { const was = Q.st(id); _qset.call(Q, id, s, msg); if (s >= QDONE && was < QDONE && id !== 'taller') G.addDuros(35); };
// coches abandonados: se registran una vez
const _bwT = G.buildWorlds;
G.buildWorlds = function () {
  _bwT.call(this);
  let k = 0;
  for (const id in this.worlds) for (const pr of this.worlds[id].props) if (!pr.id && pr.img && [Art.P.coche0, Art.P.coche1, Art.P.coche2].includes(pr.img)) pr.id = 'coche:' + id + ':' + (k++);
};
const _gwT = G.getWorld;
G.getWorld = function (id) { const had = !!this.worlds[id], w = _gwT.call(this, id); if (w && !had) { let k = 0; for (const pr of w.props) if (!pr.id && pr.img && [Art.P.coche0, Art.P.coche1, Art.P.coche2].includes(pr.img)) pr.id = 'coche:' + id + ':' + (k++); } return w; };

// ---------------------------------------------------------------- el taller de la cochera
ST.TALLER = 'TALLER';
G.tallerItems = function () {
  const g = this.guns, p = this.player, out = [];
  for (const id in GUNS) {
    const W = GUNS[id], own = g.own.includes(id), locked = W.stage !== undefined && this.stage < W.stage;
    out.push({ key: 'gun:' + id, icon: id, name: W.name, desc: locked ? 'Todavía no tienes con qué arreglarla. Más adelante.' : W.desc + ' Daño ' + W.dmg + (W.n > 1 ? '×' + W.n : '') + '.', price: own ? 0 : W.price, status: own ? (g.eq === id ? 'Equipada' : 'Equipar') : locked ? '—' : nDuros(W.price), locked });
  }
  for (const a in AMMO) {
    const A = AMMO[a], usable = Object.keys(GUNS).some(id => GUNS[id].ammo === a && g.own.includes(id));
    if (!usable) continue;
    out.push({ key: 'ammo:' + a, icon: 'municion', name: A.name + ' ×' + A.n, desc: 'Llevas ' + (g.ammo[a] || 0) + '.', price: A.price, status: nDuros(A.price) });
  }
  const af = g.afilado || 0;
  out.push({ key: 'afilar', icon: 'afilar', name: af >= AFILAR.length ? 'Espada afilada al máximo' : 'Afilar la espada (' + (af + 1) + '/' + AFILAR.length + ')', desc: af >= AFILAR.length ? 'Ya no le queda más filo que sacarle.' : 'Piedra de amolar y aceite: +2 de ataque.', price: af >= AFILAR.length ? 0 : AFILAR[af], status: af >= AFILAR.length ? '—' : nDuros(AFILAR[af]), locked: af >= AFILAR.length });
  out.push({ key: 'hierbas', icon: null, name: 'Hierbas medicinales ×3', desc: 'Romero, tomillo y manzanilla del huerto. Llevas ' + p.herbs + '.', price: 15, status: nDuros(15) });
  return out;
};
G.tallerBuy = function (it) {
  const g = this.guns, p = this.player;
  if (it.locked) { Sound.play('hit'); return; }
  if (it.key.startsWith('gun:') && g.own.includes(it.key.slice(4))) { g.eq = it.key.slice(4); Sound.play('pickup'); this.tallerMsg = 'Llevas ' + GUNS[g.eq].name.toLowerCase() + '.'; return; }
  if ((this.duros || 0) < it.price) { this.tallerMsg = 'No te llega. Te faltan ' + nDuros(it.price - (this.duros || 0)) + '.'; Sound.play('hit'); return; }
  this.duros -= it.price; Sound.play('pickup');
  if (it.key.startsWith('gun:')) { const id = it.key.slice(4); g.own.push(id); g.eq = id; const a = GUNS[id].ammo; g.ammo[a] = (g.ammo[a] || 0) + AMMO[a].n; this.tallerMsg = GUNS[id].name + ', con un puñado de ' + AMMO[a].name.toLowerCase() + ' de regalo. Dispara con F o el botón de tiro.'; }
  else if (it.key.startsWith('ammo:')) { const a = it.key.slice(5); g.ammo[a] = (g.ammo[a] || 0) + AMMO[a].n; this.tallerMsg = '+' + AMMO[a].n + ' ' + AMMO[a].name.toLowerCase() + '.'; }
  else if (it.key === 'afilar') { g.afilado = (g.afilado || 0) + 1; p.atk += 2; this.tallerMsg = 'La espada corta el aire de otra manera. Ataque +2.'; }
  else if (it.key === 'hierbas') { p.herbs += 3; this.tallerMsg = '+3 hierbas.'; }
  this.save();
};
G.updateTaller = function () {
  const it = this.tallerItems();
  this.tSel = Math.max(0, Math.min(it.length - 1, this.tSel || 0));
  if (this.pressed('Escape', 'KeyP', 'Back')) { this.st = ST.PLAY; return; }
  if (this.pressed('ArrowDown', 'KeyS')) this.tSel = Math.min(it.length - 1, this.tSel + 1);
  if (this.pressed('ArrowUp', 'KeyW')) this.tSel = Math.max(0, this.tSel - 1);
  if (this.pressed('Enter', 'KeyE', 'Space')) this.tallerBuy(it[this.tSel]);
  for (let i = 0; i < it.length; i++) if (this.just.has('Pick' + i)) { this.just.delete('Pick' + i); if (this.tSel === i) this.tallerBuy(it[i]); else this.tSel = i; }
  if (this.just.has('Pick99')) { this.just.delete('Pick99'); this.st = ST.PLAY; }
};
G.uiTaller = function (g) {
  const it = this.tallerItems(), sel = this.tSel || 0;
  g.fillStyle = 'rgba(6,4,4,0.82)'; g.fillRect(0, 0, VW, VH);
  this.panel(g, 20, 8, VW - 40, VH - 16);
  g.font = FT(11); this.center(g, 'El taller de la cochera', 25, GOLD);
  g.drawImage(cv(Art.P.moneda), VW - 104, 15, 8, 8); g.font = FBB(7.4); this.text(g, nDuros(this.duros || 0), VW - 93, 22, '#e8e8f0');
  const rowH = 14.5, top = 36, vis = 9, off = Math.max(0, Math.min(it.length - vis, sel - 4));
  it.slice(off, off + vis).forEach((x, j) => {
    const i = j + off, y = top + j * rowH, s = i === sel;
    if (s) { g.fillStyle = 'rgba(160,30,24,0.32)'; g.fillRect(28, y - 1, VW - 56, rowH - 1); }
    if (x.icon && Art.gunIcons[x.icon]) g.drawImage(cv(Art.gunIcons[x.icon]), 31, y - 1, 13, 13); else if (x.key === 'hierbas') g.drawImage(cv(Art.herb), 33, y + 1, 9, 9);
    g.font = FT(7); this.text(g, x.name, 48, y + 8, x.locked ? '#7a6a5a' : s ? PAPER : SOFT);
    g.font = FBB(6.4); const st = x.status, w = g.measureText(st).width; this.text(g, st, VW - 34 - w, y + 8, st === 'Equipada' ? GOLD : x.locked ? '#7a6a5a' : (this.duros || 0) >= x.price ? '#e8e8f0' : '#c87a6a');
    this.menuRects.push({ i, x: 28, y: y - 1, w: VW - 56, h: rowH - 1 });
  });
  const cur = it[sel];
  g.fillStyle = 'rgba(200,160,90,0.35)'; g.fillRect(30, VH - 48, VW - 60, 0.6);
  g.font = FB(6.4); this.wrap(g, this.tallerMsg || (cur ? cur.desc : ''), VW - 64).slice(0, 2).forEach((l, i) => this.text(g, l, 32, VH - 39 + i * 8, this.tallerMsg ? GOLD : PAPER));
  this.panel(g, VW / 2 - 34, VH - 24, 68, 14, false); g.font = FT(7); this.center(g, '‹ Salir', VH - 14.5, PAPER);
  this.menuRects.push({ i: 99, x: VW / 2 - 40, y: VH - 26, w: 80, h: 18 });
  g.font = FB(5.2); if (!this.touch) this.center(g, 'Enter: comprar o equipar · Esc: salir', VH - 3, DIM);
};

Q.defs.taller = {
  title: 'Taller', steps: () => '',
  use(pr) {
    if (pr.id === 'cochera') {
      if (Q.st('puerta') === 1) return; // primero la pata de cabra de La puerta
      Q.defs.taller.open();
      return true;
    }
    if (pr.id && pr.id.startsWith('coche:')) {
      if (G.picked.has(pr.id)) { G.say('Guardián', 'Ya lo registré. Ni el mechero de la guantera queda.'); return true; }
      G.picked.add(pr.id);
      const n = 5 + G.rnd.int(9);
      G.say('Guardián', ['En la guantera, entre papeles del seguro y un CD de Camela, un puñado de duros.', 'Debajo del asiento: monedas sueltas, un rosario y un ticket de la gasolinera de Pozo Alcón.', 'En el cenicero, calderilla. Mucha calderilla. Alguien la iba guardando para algo.'][G.rnd.int(3)], '(+' + nDuros(n) + ')');
      G.addDuros(n); G.save();
      return true;
    }
  },
  open() {
    G.st = ST.TALLER; G.tSel = 0; G.tallerMsg = '';
    if (!G.flags.has('taller_visto')) { G.flags.add('taller_visto'); G.tallerMsg = 'El banco de trabajo del abuelo, las herramientas del campo y lo que vas trayendo. Aquí se gastan los duros.'; }
  },
};

// ---------------------------------------------------------------- guardar, cargar y empezar
const _saveT = G.save;
G.save = function () {
  _saveT.call(this);
  try { const s = localStorage.getItem(SAVE_KEY); if (s) { const d = JSON.parse(s); d.duros = this.duros || 0; d.guns = this.guns; localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } } catch (e) { }
};
const _loadT = G.load;
G.load = function () {
  const ok = _loadT.call(this);
  if (ok) { const d = this.readSave(); this.duros = (d && d.duros) || 0; this.guns = (d && d.guns) || { own: [], eq: null, ammo: {}, afilado: 0 }; this.shots = []; }
  return ok;
};
const _newT = G.newGame;
G.newGame = function () { this.duros = 0; this.guns = { own: [], eq: null, ammo: {}, afilado: 0 }; this.shots = []; _newT.call(this); };
// si te quedaste la pistola de Casimiro, es tuya
const _qsetP = Q.set;
Q.set = function (id, s, msg) {
  _qsetP.call(Q, id, s, msg);
  if (id === 'obsequios' && Q.d('obsequios').fin === 'disparo' && !G.guns.own.includes('pistola')) { G.guns.own.push('pistola'); G.guns.ammo.balas = (G.guns.ammo.balas || 0) + 5; if (!G.guns.eq) G.guns.eq = 'pistola'; G.toast('Te quedas la pistola de Casimiro. Le quedan 5 balas.'); }
};

// ---------------------------------------------------------------- dibujo e interfaz (cuando ya existe todo lo de 7_*.js y 8_main.js)
const _lateT = Q.late;
Q.late = function () {
  _lateT();
  const _rw = G.renderWorld;
  G.renderWorld = function (g) { _rw.call(this, g); if (!this.padel) this.drawShots(g); };
  // duros y arma en el marcador
  const _top = G.hudTop;
  G.hudTop = function (g) {
    _top.call(this, g);
    const gn = this.guns, eq = gn && gn.eq;
    this.panel(g, 4, 46, 116, 13, false);
    g.drawImage(cv(Art.P.moneda), 9, 48.5, 7, 7); g.font = FBB(5.8); this.text(g, '' + (this.duros || 0), 18, 55, '#e8e8f0');
    if (eq) { g.drawImage(cv(Art.gunIcons[eq]), 46, 47, 10, 10); this.text(g, GUNS[eq].short + ' ' + (gn.ammo[GUNS[eq].ammo] || 0), 58, 55, (gn.ammo[GUNS[eq].ammo] || 0) > 0 ? PAPER : '#c87a6a'); }
  };
  const _hud = G.uiHud;
  G.uiHud = function (g) {
    if (this.padel) return _hud.call(this, g);
    const gn = this.guns, k = (this.duros || 0) + '|' + (gn ? gn.eq + ':' + (gn.eq ? gn.ammo[GUNS[gn.eq].ammo] : '') : '');
    if (this._hudDur !== k) { this._hudDur = k; this.hudSig = null; }
    return _hud.call(this, g);
  };
  // la pantalla del taller, sobre el mundo
  const _rq = G.render;
  G.render = function (ctx, cw, ch, dpr) {
    if (this.st !== ST.TALLER) return _rq.call(this, ctx, cw, ch, dpr);
    this.st = ST.MAPQ; _rq.call(this, ctx, cw, ch, dpr); this.st = ST.TALLER;
    const L = this.layout; ctx.setTransform(L.sc * dpr, 0, 0, L.sc * dpr, L.ox * dpr, L.oy * dpr);
    this.menuRects = []; this.uiTaller(ctx); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const _upd = G.update;
  G.update = function (dt) { if (this.st === ST.TALLER) { if (this.toastT > 0) this.toastT -= dt; this.clock += dt; this.updateTaller(); return; } _upd.call(this, dt); };
  // botones táctiles: disparo y cambio de arma
  if (typeof Touch !== 'undefined') {
    const _lay = Touch.layout;
    Touch.layout = function (cw, ch) {
      _lay.call(this, cw, ch);
      const k = this.k, gn = G.guns;
      if (gn && gn.eq) {
        const W = GUNS[gn.eq];
        this.buttons.push({ id: 'shoot', x: cw - 204 * k, y: ch - 148 * k, r: 23 * k, label: W.short + ' ' + (gn.ammo[W.ammo] || 0), code: 'Shoot' });
        if (gn.own.length > 1) this.buttons.push({ id: 'swap', x: cw - 252 * k, y: ch - 118 * k, r: 15 * k, label: '⇄', code: 'Swap' });
      }
    };
  }
};
CONSEJOS.push('Los duros se ganan matando engendros, limpiando guaridas, cumpliendo misiones y registrando coches abandonados.', 'En el taller de la cochera se compran armas de distancia. Se disparan con F (o el botón de tiro) y R cambia de arma.', 'El acero, aunque sea de bala, apenas hace mella en los demonios. La Luz, sí.');
