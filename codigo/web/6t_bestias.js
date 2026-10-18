// ====================================================================== más engendros, y algo más duros
// Tres tipos nuevos: el perro asilvestrado (en jauría, rápido, se abalanza), el escupidor (de lejos, ácido
// que envenena) y la mole (lenta, enorme, golpea el suelo a su alrededor). Además todos pegan y aguantan algo
// más, y de vez en cuando sale uno de élite (aura roja: más vida, más daño, más experiencia y más duros).
Object.assign(MK, { PERRO: 'PERRO', ESCUPIDOR: 'ESCUPIDOR', MOLE: 'MOLE' });
Object.assign(MNAME, { PERRO: 'Perro asilvestrado', ESCUPIDOR: 'Escupidor', MOLE: 'La mole' });
Object.assign(MSTAT, {
  PERRO: { hp: 30, dmg: 10, sp: 76, xp: 10, hw: 7, hh: 3, range: 46, wind: 0.35, atk: 0.26, rec: 0.6 },
  ESCUPIDOR: { hp: 54, dmg: 12, sp: 30, xp: 17, hw: 5, hh: 3, range: 150, wind: 0.7, atk: 0.2, rec: 1.0 },
  MOLE: { hp: 280, dmg: 28, sp: 22, xp: 70, hw: 9, hh: 5, range: 34, wind: 0.95, atk: 0.3, rec: 1.1 },
});
// un poco más duros todos (las personas de las misiones ya llevan sus propias cifras)
for (const k of ['JABALI', 'HUECO', 'ALACRAN', 'SOMBRA', 'AHOGADO', 'NIDO']) { MSTAT[k].hp = Math.round(MSTAT[k].hp * 1.25); MSTAT[k].dmg = Math.round(MSTAT[k].dmg * 1.15); }
if (typeof BOTIN !== 'undefined') { BOTIN[MK.PERRO] = [1, 3]; BOTIN[MK.ESCUPIDOR] = [3, 5]; BOTIN[MK.MOLE] = [10, 16]; }

// ---------------------------------------------------------------- dibujos
const _initEnemiesB = Art.initEnemies;
Art.initEnemies = function () {
  _initEnemiesB.call(this);
  const { img, p, r, ov, ova, line, outline, flipH } = Px, E = Art.E;
  // el perro: de lado, flaco, el pelo erizado
  const dog = (f, mode) => {
    const b = img(24, 16), C = 0x4a3c30, D = 0x2e241c, L = 0x6a5644;
    ova(b, 12, 14.5, 9, 1.6, 0x50000000);
    const crouch = mode === 'wind' ? 2 : 0, st = mode === 'atk' ? 3 : 0;
    ov(b, 11 + st * 0.5, 8 + crouch, 7 + st, 3.2, C); r(b, 6 + st, 6 + crouch, 9, 2, L);
    for (let x = 6; x < 16; x += 2) p(b, x + st, 5 + crouch, D); // pelo erizado
    ov(b, 18 + st, 6 + crouch, 3.2, 2.6, C); r(b, 20 + st, 6 + crouch, 3, 2, D); p(b, 18 + st, 5 + crouch, 0xe03018); // cabeza y ojo
    r(b, 17 + st, 3 + crouch, 1, 2, D); r(b, 19 + st, 3 + crouch, 1, 2, D); // orejas
    if (mode === 'atk') { r(b, 21 + st, 8, 2, 1, 0xe8e0d0); }
    line(b, 4, 7 + crouch, 1, 4 + crouch, D); // cola
    const lg = mode === 'walk' ? (f ? 1 : -1) : 0;
    for (const [x, o] of [[7, lg], [9, -lg], [14, -lg], [16, lg]]) line(b, x + st * 0.6, 10 + crouch, x + o + st * 0.6, 14, D);
    outline(b, 0x0e0a08); return b;
  };
  E.dog = [{}, {}];
  for (const [k, f, m] of [['w0', 0, 'walk'], ['w1', 1, 'walk'], ['wind', 0, 'wind'], ['atk', 0, 'atk']]) { const s = dog(f, m); E.dog[1][k] = s; E.dog[0][k] = flipH(s); }
  // el escupidor: un hueco verdoso con la panza hinchada
  const recolor = (s, fn) => { const b = Px.copy(s); for (let i = 0; i < b.d.length; i++) { const v = b.d[i]; if ((v >>> 24) === 0) continue; b.d[i] = (0xff000000 | fn(v >> 16 & 255, v >> 8 & 255, v & 255)) >>> 0; } return b; };
  E.spit = E.hollow.map(set => { const o = {}; for (const k in set) { const b = recolor(set[k], (R, Gc, B) => (Math.min(255, R * 0.55) << 16) | (Math.min(255, Gc * 0.95 + 24) << 8) | Math.min(255, B * 0.45)); ov(b, b.w / 2, b.h * 0.58, b.w * 0.24, b.h * 0.16, 0x6a8a3a); ov(b, b.w / 2 - 1, b.h * 0.55, b.w * 0.12, b.h * 0.07, 0x9ab85a); if (k === 'wind' || k === 'atk') ov(b, b.w / 2, b.h * 0.3, 1.6, 1.6, 0xb8e050); o[k] = b; } return o; });
  // la mole: un hueco enorme, más oscuro, con los ojos encendidos
  const scale = (s, k) => { const W = Math.round(s.w * k), H = Math.round(s.h * k), b = img(W, H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) b.d[y * W + x] = s.d[Math.floor(y / k) * s.w + Math.floor(x / k)]; return b; };
  E.mole = E.hollow.map(set => { const o = {}; for (const k in set) { const b = recolor(scale(set[k], 1.6), (R, Gc, B) => ((R * 0.62) << 16) | ((Gc * 0.55) << 8) | (B * 0.6)); for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) { const v = b.d[y * b.w + x]; if ((v >>> 24) && y < b.h * 0.32 && ((v >> 16 & 255) > 80 || (v & 255) > 80) && x % 3 === 0) b.d[y * b.w + x] = 0xffe04020; } o[k] = b; } return o; });
  // el ácido que escupe
  { const b = img(8, 8); ov(b, 4, 4, 3, 3, 0x7ab030); ov(b, 3, 3, 1.6, 1.6, 0xc8f070); outline(b, 0x2a3a10); E.acid = b; }
};

// ---------------------------------------------------------------- comportamiento
const MP = Monster.prototype;
const _sprite = MP.sprite;
MP.sprite = function () {
  const E = Art.E;
  if (this.kind === MK.PERRO || this.kind === MK.ESCUPIDOR || this.kind === MK.MOLE) {
    const k = this.frameKey();
    let s = this.kind === MK.PERRO ? E.dog[this.lastH][k] : (this.kind === MK.ESCUPIDOR ? E.spit : E.mole)[this.dir][k];
    if (this.flash > 0) s = white(s);
    return s;
  }
  return _sprite.call(this);
};
const _ownShadow = MP.ownShadow;
MP.ownShadow = function () { return this.kind === MK.PERRO || this.kind === MK.MOLE || _ownShadow.call(this); };
const _chase = MP.chase;
MP.chase = function (g, dt, dx, dy, d) {
  if (this.kind === MK.ESCUPIDOR) { // guarda las distancias: ni muy cerca ni muy lejos
    const w = g.world, sp = this.speed, l = d || 1;
    let mx = 0, my = 0;
    if (this.noSight > 0) { this.noSight -= dt; return _chase.call(this, g, dt, dx, dy, d); }
    if (d < 80) { mx = -dx / l; my = -dy / l; } else if (d > 125) { mx = dx / l; my = dy / l; } else { mx = -dy / l * 0.6; my = dx / l * 0.6; }
    if (this.moveIn(w, mx * sp * dt, my * sp * dt)) this.moving = true;
    this.faceTo(dx, dy); return;
  }
  return _chase.call(this, g, dt, dx, dy, d);
};
// el escupidor solo escupe si te ve: si hay una pared o un banco en medio, se acerca
const _wind = MP.startWind;
MP.startWind = function (g, dx, dy, d) {
  if (this.kind === MK.ESCUPIDOR && g.lineFree && !g.lineFree(this.x, this.y - 12, g.player.x, g.player.y - 8)) { this.cool = 0.25; this.noSight = 0.8; return; }
  return _wind.call(this, g, dx, dy, d);
};
const _knock = MP.knock;
MP.knock = function (fx, fy, force) { return _knock.call(this, fx, fy, this.kind === MK.MOLE ? force * 0.2 : force); };
const _next = MP.nextState;
MP.nextState = function (g) {
  if (this.kind === MK.ESCUPIDOR && this.state === 'wind') {
    const p = g.player, ex = p.x - this.x, ey = (p.y - 8) - (this.y - 12), el = Math.hypot(ex, ey) || 1;
    for (const a of this.elite ? [-0.2, 0, 0.2] : [0]) { const c = Math.cos(a), s = Math.sin(a), vx = (ex * c - ey * s) / el, vy = (ex * s + ey * c) / el; g.orbs.push({ x: this.x, y: this.y - 12, vx: vx * 115, vy: vy * 115, dmg: this.dmg, life: 2, acid: true }); }
    Sound.play('orb');
  }
  if (this.kind === MK.MOLE && this.state === 'wind') { this.slam = true; }
  return _next.call(this, g);
};
const _atk = MP.attackStep;
MP.attackStep = function (g, dt, dx, dy, d) {
  const w = g.world, p = g.player;
  if (this.kind === MK.PERRO && this.state === 'atk') { // se abalanza
    this.move(w, this.ax * 210 * dt, this.ay * 210 * dt); this.moving = true;
    const hit = Math.hypot(p.x - this.x, p.y - this.y) < 13;
    if (hit && !this.hitDone && p.rolling && !p.dead) { this.hitDone = true; g.perfectDodge(); }
    if (hit && !this.hitDone && p.invul <= 0 && !p.dead) { this.hitDone = true; g.hurtPlayer(this.dmg, this.x, this.y); }
    return;
  }
  if (this.kind === MK.MOLE && this.state === 'atk') { // golpe en el suelo: duele a todo lo que esté cerca
    if (this.slam) {
      this.slam = false; g.shake(0.35); Sound.play('hit');
      g.fx.push(Fx.ring(this.x, this.y - 4, 36, 0xb8a888));
      for (let i = 0; i < 12; i++) g.fx.push(Fx.spark(this.x, this.y - 2, MRand.gauss() * 60, -MRand.next() * 40, 0x8a7a62, 0.45));
      if (Math.hypot(p.x - this.x, p.y - this.y) < 38) { if (p.rolling) g.perfectDodge(); else if (p.invul <= 0 && !p.dead) g.hurtPlayer(this.dmg, this.x, this.y); }
    }
    return;
  }
  if (this.kind === MK.ESCUPIDOR && this.state === 'atk') return;
  return _atk.call(this, g, dt, dx, dy, d);
};

// ---------------------------------------------------------------- dónde viven
const _bwB = G.buildWorlds;
G.buildWorlds = function () {
  _bwB.call(this);
  const ow = this.worlds.exterior, rx = WG.rx;
  const add = (w, name, x, y, kinds, tier) => { if (!w.lairs) return; for (let r = 0; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const X = x + dx, Y = y + dy; if (!w.solid(X, Y) && !w.solid(X + 1, Y)) { w.lairs.push({ name, x: X, y: Y, kinds, tier, active: false, cleared: false }); return; } } };
  add(ow, 'Jauría del vertedero', 66, 140, [MK.PERRO, MK.PERRO, MK.PERRO], 1);
  add(ow, 'Escupidores del barranco', rx + 34, 156, [MK.ESCUPIDOR, MK.ESCUPIDOR, MK.HUECO], 1.15);
  if (WG.ruins && WG.ruins.quemado) add(ow, 'La mole del Cortijo Quemado', WG.ruins.quemado[0] + 2, WG.ruins.quemado[1] + 3, [MK.MOLE, MK.HUECO], 1.3);
  add(ow, 'Perros de Los Llanos', 190, 118, [MK.PERRO, MK.PERRO, MK.JABALI], 1.2);
  add(ow, 'Escupidores de la encina', (WG.encina ? WG.encina[0] : 204) - 6, (WG.encina ? WG.encina[1] : 132) + 6, [MK.ESCUPIDOR, MK.ALACRAN], 1.25);
};
const _gwB2 = G.getWorld;
G.getWorld = function (id) {
  const had = !!this.worlds[id], w = _gwB2.call(this, id);
  if (w && !had && w.lairs) {
    const add = (name, x, y, kinds, tier) => { for (let r = 0; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const X = x + dx, Y = y + dy; if (!w.solid(X, Y) && !w.solid(X + 1, Y)) { w.lairs.push({ name, x: X, y: Y, kinds, tier, active: false, cleared: false }); return; } } };
    if (id === 'pantano') { add('Jauría de la Venta', 62, 156, [MK.PERRO, MK.PERRO, MK.PERRO], 1.35); add('La mole del cañón', 64, 96, [MK.MOLE, MK.ESCUPIDOR], 1.4); }
    if (id === 'bolera') { add('Escupidores del arroyo', 16, 52, [MK.ESCUPIDOR, MK.ESCUPIDOR], 1.5); add('Jauría del embalse', 70, 100, [MK.PERRO, MK.PERRO, MK.SOMBRA], 1.5); }
    if (id === 'sierra') { add('Lobos del collado', 48, 30, [MK.PERRO, MK.PERRO, MK.PERRO, MK.PERRO], 1.8); add('La mole de la majada', 100, 64, [MK.MOLE, MK.MOLE], 1.7); }
    if (id === 'campocamara') { add('Perros de la era', 54, 34, [MK.PERRO, MK.PERRO], 1.25); }
  }
  return w;
};

// ---------------------------------------------------------------- de élite
const _spawnL = G.spawnLair;
G.spawnLair = function (L) {
  const w = this.world, n0 = w.monsters.length;
  _spawnL.call(this, L);
  if (this.stage < ETAPA.RADIO) return;
  for (let i = n0; i < w.monsters.length; i++) {
    const m = w.monsters[i];
    if (m.kind === MK.NIDO || m.kind === MK.BESTIA || this.rnd.next() > 0.12) continue;
    m.elite = true; m.maxHp = m.hp = Math.round(m.maxHp * 1.8); m.dmg = Math.round(m.dmg * 1.3); m.xp = m.xp * 2; m.speed *= 1.1;
  }
};
const _killE = G.killMonster;
G.killMonster = function (m) { const was = m.dead; _killE.call(this, m); if (!was && m.elite && this.addDuros) this.addDuros(8 + this.rnd.int(8), m.x, m.y - 10); };
const _lateE = Q.late;
Q.late = function () {
  _lateE();
  const _rw = G.renderWorld;
  G.renderWorld = function (g) {
    _rw.call(this, g);
    if (this.padel || !this.world) return;
    const cx = this.camRX, cy = this.camRY, t = this.clock;
    for (const m of this.world.monsters) {
      if (m.dead || !m.elite) continue;
      const x = m.x - cx, y = m.y - cy; if (x < -30 || y < -40 || x > WW + 30 || y > WH + 30) continue;
      g.strokeStyle = `rgba(255,60,30,${0.45 + 0.25 * Math.sin(t * 6)})`; g.lineWidth = 1;
      g.beginPath(); g.ellipse(x, y, (m.hw || 6) + 5, 3.5, 0, 0, Math.PI * 2); g.stroke();
      g.fillStyle = 'rgba(255,90,40,0.8)'; g.fillRect(Math.round(x) - 1, Math.round(y - 30 - Math.sin(t * 3) * 1.5), 2, 2);
    }
  };
};
