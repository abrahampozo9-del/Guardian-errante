// ====================================================================== las armas en la mano, y la rama de Armas
// Cada arma se dibuja en las manos del Guardián con su propia animación: el arco se tensa y se suelta, la
// ballesta se recarga con la manivela, la escopeta se bombea, el rifle se acerroja y la pistola retrocede.
// Solo el rifle apunta solo (al engendro más cercano que tenga a tiro, en cualquier dirección); las demás
// disparan hacia donde miras o hacia donde empujas el mando, con una ayuda muy pequeña.

// ---------------------------------------------------------------- habilidades: cuarta rama y sexta fila
SKILLS[0].list.push({ id: 'vigor', name: 'Brazo de hierro', desc: '+4 de ataque con la espada, para siempre.' });
SKILLS[1].list.push({ id: 'plenitud', name: 'Plenitud', desc: '+40 de Fe máxima, y cada vez que lanzas la Luz te devuelve 10 de Fe.' });
SKILLS[2].list.push({ id: 'roble', name: 'Como un roble', desc: '+40 de vida máxima y recibes un 10% menos de daño.' });
SKILLS.push({ branch: 'Armas', color: '#8ab0d0', list: [
  { id: 'pulso', name: 'Buen pulso', desc: 'Las armas de la cochera hacen un 25% más de daño.' },
  { id: 'recarga', name: 'Recarga rápida', desc: 'Disparas, tensas, bombeas y acerrojas un 30% más deprisa.' },
  { id: 'cartuchera', name: 'Cartuchera', desc: 'Un 35% de las veces el disparo no gasta munición.' },
  { id: 'perforante', name: 'Punta perforante', desc: 'Todo lo que disparas atraviesa a un engendro más. La escopeta suelta dos perdigones más.' },
  { id: 'ojo', name: 'Ojo de montero', desc: 'Los disparos llegan un 30% más lejos y hacen críticos más a menudo (25%) y más fuertes (×2,5).' },
  { id: 'bendita', name: 'Munición bendita', desc: 'Lo que disparas lleva la Luz: quema a los demonios como la Luz y deja un rastro blanco.' },
] });
SKILL_LVL.push(14);
const NB = () => SKILLS.length, NR = () => SKILL_LVL.length, NS = () => NB() * NR();
G.skillAt = function (i) { return SKILLS[i % NB()].list[Math.floor(i / NB())]; };
G.skillState = function (i) {
  const p = this.player, b = i % NB(), r = Math.floor(i / NB()), s = SKILLS[b].list[r];
  if (p.skills.has(s.id)) return 'ok';
  if (r > 0 && !p.skills.has(SKILLS[b].list[r - 1].id)) return 'bloq';
  if (p.lvl < SKILL_LVL[r]) return 'nivel';
  return p.pts > 0 ? 'puede' : 'sinpuntos';
};
G.learn = function (i) {
  const p = this.player, s = this.skillAt(i), st = this.skillState(i);
  if (st === 'ok') { this.toast('Ya la tienes.'); return; }
  if (st === 'bloq') { this.toast('Primero aprende la anterior de esta rama.'); return; }
  if (st === 'nivel') { this.toast('Necesitas nivel ' + SKILL_LVL[Math.floor(i / NB())] + '.'); return; }
  if (st === 'sinpuntos') { this.toast('No te quedan puntos. Sube de nivel.'); return; }
  p.pts--; p.skills.add(s.id);
  if (s.id === 'curtido') { p.maxHp += 25; p.hp += 25; }
  if (s.id === 'fervor') { p.maxFe += 30; p.fe += 30; }
  if (s.id === 'vigor') p.atk += 4;
  if (s.id === 'plenitud') { p.maxFe += 40; p.fe += 40; }
  if (s.id === 'roble') { p.maxHp += 40; p.hp += 40; }
  Sound.play('level'); this.toast('Aprendido: ' + s.name); this.save();
};
G.updateSkills = function () {
  if (this.pressed('Escape', 'KeyH', 'KeyP', 'Pick99')) { this.st = ST.PLAY; return; }
  const nb = NB(), n = NS();
  let s = this.skillSel || 0; if (s >= n) s = 0;
  if (this.pressed('ArrowLeft', 'KeyA')) s = s % nb === 0 ? s + nb - 1 : s - 1;
  if (this.pressed('ArrowRight', 'KeyD')) s = s % nb === nb - 1 ? s - nb + 1 : s + 1;
  if (this.pressed('ArrowUp', 'KeyW')) s = (s + n - nb) % n;
  if (this.pressed('ArrowDown', 'KeyS')) s = (s + nb) % n;
  for (let i = 0; i < n; i++) if (this.just.has('Pick' + i)) { this.just.delete('Pick' + i); if (s === i) this.learn(i); s = i; }
  this.skillSel = s;
  if (this.pressed('Enter', 'KeyE', 'Space', 'KeyZ')) this.learn(s);
};
G.uiSkills = function (g) {
  const p = this.player, nb = NB();
  g.fillStyle = 'rgba(10,8,6,0.94)'; g.fillRect(0, 0, VW, VH);
  g.font = FT(12); this.text(g, 'Árbol de habilidades', 12, 15, GOLD);
  g.font = FB(7); this.text(g, 'Nivel ' + p.lvl + '   ·   Puntos: ' + p.pts, 160, 14, p.pts > 0 ? '#ffe68a' : SOFT);
  g.fillStyle = 'rgba(232,196,106,0.15)'; g.fillRect(VW - 60, 4, 52, 14); g.strokeStyle = GOLD; g.lineWidth = 1; g.strokeRect(VW - 59.5, 4.5, 51, 13);
  g.font = FB(6.5); this.text(g, 'Volver', VW - 48, 14, PAPER);
  this.menuRects.push({ x: VW - 64, y: 0, w: 64, h: 22, i: 99 });
  const bw = 92, colX = SKILLS.map((_, b) => Math.round(VW / nb * (b + 0.5))), y0 = 37, dy = 22.5;
  SKILLS.forEach((B, b) => {
    g.font = FB(7); const tw = g.measureText(B.branch).width; this.text(g, B.branch, colX[b] - tw / 2, 28, B.color);
    g.strokeStyle = 'rgba(232,196,106,0.25)'; g.beginPath(); g.moveTo(colX[b], y0); g.lineTo(colX[b], y0 + dy * (NR() - 1)); g.stroke();
    B.list.forEach((s, r) => {
      const i = r * nb + b, x = colX[b], y = y0 + r * dy, st = this.skillState(i), sel = this.skillSel === i;
      const ok = st === 'ok', can = st === 'puede';
      g.fillStyle = ok ? B.color : (can ? 'rgba(232,196,106,0.18)' : 'rgba(40,34,28,0.95)');
      g.fillRect(x - bw / 2, y - 8, bw, 16);
      g.strokeStyle = sel ? '#fff' : (ok ? B.color : can ? GOLD : '#4a4036'); g.lineWidth = sel ? 1.5 : 1;
      g.strokeRect(x - bw / 2 + 0.5, y - 7.5, bw - 1, 15); g.lineWidth = 1;
      if (can) { g.fillStyle = `rgba(255,230,140,${0.25 + 0.2 * Math.sin(this.clock * 5)})`; g.fillRect(x - bw / 2, y - 8, 3, 16); }
      g.font = FB(6); const w = g.measureText(s.name).width;
      this.text(g, s.name, x - w / 2, y + 2.2, ok ? '#120e0a' : (st === 'bloq' || st === 'nivel') ? '#7a6e60' : PAPER);
      if (st === 'nivel') { g.font = FB(4.6); this.text(g, 'Nv ' + SKILL_LVL[r], x + bw / 2 - 15, y + 6.5, '#7a6e60'); }
      this.menuRects.push({ x: x - bw / 2 - 2, y: y - 10, w: bw + 4, h: 20, i });
    });
  });
  const sel = Math.min(this.skillSel || 0, NS() - 1), s = this.skillAt(sel), st = this.skillState(sel);
  g.fillStyle = 'rgba(30,24,18,0.95)'; g.fillRect(8, VH - 47, VW - 16, 42); g.strokeStyle = 'rgba(232,196,106,0.5)'; g.strokeRect(8.5, VH - 46.5, VW - 17, 41);
  g.font = FB(7.5); this.text(g, s.name, 16, VH - 35, GOLD);
  const stTxt = { ok: 'Aprendida', puede: G.touch ? 'Toca otra vez para aprender (1 punto)' : 'Enter para aprender (1 punto)', bloq: 'Requiere la anterior', nivel: 'Requiere nivel ' + SKILL_LVL[Math.floor(sel / nb)], sinpuntos: 'Sin puntos' }[st];
  g.font = FB(6); const tw = g.measureText(stTxt).width; this.text(g, stTxt, VW - 16 - tw, VH - 35, st === 'puede' ? '#ffe68a' : SOFT);
  g.font = FB(6.4); this.wrap(g, s.desc, VW - 36).forEach((l, k) => this.text(g, l, 16, VH - 24 + k * 9, PAPER));
};
// efectos de la sexta fila
const _hurtR = G.hurtPlayer;
G.hurtPlayer = function (dmg, fx, fy, poison) { if (this.has('roble')) dmg = Math.max(1, Math.round(dmg * 0.9)); return _hurtR.call(this, dmg, fx, fy, poison); };
const _luzP = G.holyLight;
G.holyLight = function () { const p = this.player, f = p.fe; const r = _luzP.apply(this, arguments); if (this.has('plenitud') && f - p.fe >= 40) p.fe = Math.min(p.maxFe, p.fe + 10); return r; };

// ---------------------------------------------------------------- disparar
G.gunStats = function (id) {
  const W = Object.assign({}, GUNS[id]);
  if (this.has('pulso')) W.dmg = Math.round(W.dmg * 1.25);
  if (this.has('recarga')) W.cd *= 0.7;
  if (this.has('perforante')) { W.pierce += 1; if (id === 'escopeta') { W.n += 2; W.spread *= 1.15; } }
  if (this.has('ojo')) W.life *= 1.3;
  return W;
};
// ¿hay vista libre entre dos puntos? (para que el rifle no apunte a lo que hay detrás de una pared)
G.lineFree = function (x0, y0, x1, y1) {
  const w = this.world, d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / 8);
  for (let i = 1; i < n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n, t = w.get(Math.floor(x / TS), Math.floor((y + 8) / TS)); if (T.SOLID[t] && !T.isWater(t)) return false; }
  return true;
};
G.gunFire = function () {
  const p = this.player, g = this.guns, id = g.eq;
  if (!id) { if (!this.flags.has('tuto_armas')) { this.flags.add('tuto_armas'); this.toast('No llevas arma de distancia. En el taller de la cochera puedes hacerte con una.'); } return; }
  const W = this.gunStats(id);
  if ((p.gunCool || 0) > 0 || p.rollT > 0 || p.rolling) return;
  if (!(g.ammo[W.ammo] > 0)) { this.toast('Sin ' + AMMO[W.ammo].name.toLowerCase() + '. Se compran en el taller de la cochera.'); p.gunCool = 0.4; return; }
  const free = this.has('cartuchera') && this.rnd.next() < 0.35;
  if (!free) g.ammo[W.ammo]--; else this.fx.push(Fx.text(p.x, p.y - 32, '¡Sin gastar!', 0xa8c8e8));
  p.gunCool = W.cd;
  // dirección: la del mando o la de las flechas; si no, hacia donde miras
  const fv = [[0, 1], [0, -1], [-1, 0], [1, 0]][p.dir];
  let sx = this.stick.x, sy = this.stick.y;
  if (this.down('ArrowLeft', 'KeyA')) sx -= 1; if (this.down('ArrowRight', 'KeyD')) sx += 1; if (this.down('ArrowUp', 'KeyW')) sy -= 1; if (this.down('ArrowDown', 'KeyS')) sy += 1;
  let ax = fv[0], ay = fv[1]; const sl = Math.hypot(sx, sy); if (sl > 0.3) { ax = sx / sl; ay = sy / sl; }
  const reach = W.sp * W.life + 10, ox = p.x, oy = p.y - 10;
  let best = null, bd = 1e9;
  for (const m of this.world.monsters) {
    if (m.dead || (m.vulnerable && !m.vulnerable())) continue;
    const dx = m.x - ox, dy = m.y - 8 - oy, d = Math.hypot(dx, dy);
    if (d > reach || d < 1) continue;
    if (id === 'rifle') { // el rifle autoapunta: el más cercano que tenga a tiro, mire donde mire
      if (d < bd && this.lineFree(ox, oy, m.x, m.y - 8)) { bd = d; best = [dx / d, dy / d]; }
    } else { // las demás, solo una ayuda pequeña hacia donde apuntas
      const cos = (dx * ax + dy * ay) / d; if (cos < 0.94) continue;
      const s = d * (2 - cos); if (s < bd) { bd = s; best = [dx / d, dy / d]; }
    }
  }
  if (best) { ax = best[0]; ay = best[1]; }
  const ang = Math.atan2(ay, ax);
  this.shots = this.shots || [];
  for (let i = 0; i < W.n; i++) {
    const a = ang + (W.n > 1 ? (i / (W.n - 1) - 0.5) * W.spread : 0) + (this.rnd.next() - 0.5) * W.spread * (W.n > 1 ? 0.3 : 1);
    this.shots.push({ x: ox + Math.cos(a) * 12, y: oy + Math.sin(a) * 12, vx: Math.cos(a) * W.sp, vy: Math.sin(a) * W.sp, life: W.life * (0.85 + this.rnd.next() * 0.3), dmg: W.dmg, pierce: W.pierce, kb: W.kb, kind: W.kind, hit: new Set(), holy: this.has('bendita') });
  }
  if (Math.abs(ax) > Math.abs(ay)) p.dir = ax < 0 ? 2 : 3; else p.dir = ay < 0 ? 1 : 0;
  // la animación: el arma en las manos, apuntando
  p.gunId = id; p.gunAng = ang; p.gunT = 0; p.gunCd = W.cd; p.gunEj = false;
  Sound.play(W.snd);
  if (W.kind !== 'flecha' && W.kind !== 'virote') this.shake(W.kind === 'perdigon' ? 0.14 : id === 'rifle' ? 0.1 : 0.05);
  if (id === 'rifle' && best) this.fx.push(Fx.ring(ox + ax * bd, oy + ay * bd, 9, 0xff5040)); // la mira sobre el blanco
};
G.updateShots = function (dt) {
  const w = this.world, p = this.player; if (p && p.gunT !== undefined) p.gunT += dt;
  if (!this.shots || !this.shots.length) return;
  const ojo = this.has('ojo');
  this.shots = this.shots.filter(s => {
    s.life -= dt; if (s.life <= 0) return false;
    if (s.holy && this.rnd.next() < 0.5) this.fx.push(Fx.spark(s.x, s.y, 0, 0, 0xfff4c8, 0.2));
    const steps = 3;
    for (let k = 0; k < steps; k++) {
      s.x += s.vx * dt / steps; s.y += s.vy * dt / steps;
      const tx = Math.floor(s.x / TS), ty = Math.floor((s.y + 8) / TS), t = w.get(tx, ty);
      if (T.SOLID[t] && !T.isWater(t)) { for (let i = 0; i < 3; i++) this.fx.push(Fx.spark(s.x, s.y, this.rnd.gauss() * 40, this.rnd.gauss() * 40, 0xb8a888, 0.2)); return false; }
      for (const m of w.monsters) {
        if (m.dead || s.hit.has(m) || (m.vulnerable && !m.vulnerable())) continue;
        if (Math.abs(m.x - s.x) < (m.hw || 6) + 5 && Math.abs(m.y - 8 - s.y) < (m.hh || 6) + 9) {
          s.hit.add(m); m.aggro = true;
          const crit = this.rnd.next() < (ojo ? 0.25 : 0.1);
          this.damageMonster(m, Math.round(s.dmg * (crit ? (ojo ? 2.5 : 1.6) : 1)), crit, s.vx, s.vy, !!s.holy);
          if (!m.dead && m.knock) m.knock(s.vx, s.vy, s.kb);
          if (s.pierce-- <= 0) return false;
        }
      }
    }
    return true;
  });
};
const _drawShotsA = G.drawShots;
G.drawShots = function (g) {
  _drawShotsA.call(this, g);
  if (!this.shots) return;
  const cx = this.camRX, cy = this.camRY;
  for (const s of this.shots) if (s.holy) { g.fillStyle = 'rgba(255,246,210,0.55)'; g.fillRect(Math.round(s.x - cx) - 1, Math.round(s.y - cy) - 1, 3, 3); }
};

// ---------------------------------------------------------------- el arma en las manos
G.heroSkinCss = '#c89470';
const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
G.drawGun = function (g, cx, cy) {
  const p = this.player, id = p.gunId;
  if (!id || p.gunT === undefined || p.gunT > p.gunCd + 0.7 || p.atkT > 0 || p.spinT > 0 || p.rolling || p.dead) return;
  const t = p.gunT, cd = p.gunCd, k = t / cd; // k: cuánto ha avanzado la recarga (0 → 1)
  const a = Math.round(p.gunAng / (Math.PI / 8)) * (Math.PI / 8), left = Math.cos(a) < -0.01;
  const hx = p.x - cx + Math.cos(a) * 3, hy = p.y - 11 - cy + (Math.sin(a) > 0.5 ? 1 : 0);
  const kick = { pistola: 2.5, rifle: 3.5, escopeta: 4, ballesta: 1.5, arco: 0 }[id] * Math.max(0, 1 - t / 0.11);
  const SK = this.heroSkinCss, MET = '#70707c', MET2 = '#b4b4c0', DARK = '#2e2e36', WOOD = '#9a5e2a', WOOD2 = '#c88a4a';
  g.save(); g.translate(Math.round(hx), Math.round(hy)); g.rotate(a); g.scale(1.3, left ? -1.3 : 1.3); g.translate(-kick, 0);
  g.shadowColor = 'rgba(12,8,6,0.85)'; g.shadowOffsetX = 0; g.shadowOffsetY = 1; g.shadowBlur = 0;
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const hand = (x, y) => { R(x, y, 2, 2, SK); R(x, y + 1, 2, 1, 'rgba(0,0,0,0.25)'); };
  const flash = (x, big) => { if (t < 0.07) { g.fillStyle = 'rgba(255,240,170,0.95)'; g.beginPath(); g.moveTo(x, -3 * big); g.lineTo(x + 6 * big, 0); g.lineTo(x, 3 * big); g.fill(); g.fillStyle = 'rgba(255,170,60,0.9)'; g.fillRect(x, -1, 3 * big, 2); } };
  if (id === 'pistola') {
    const slide = t < 0.09 ? 2 : 0;
    R(-1, 0, 3, 5, DARK); R(-2, -2, 9, 2, MET); R(-2 - slide, -3, 8, 1, MET2); R(6, -2, 1, 1, DARK);
    hand(-1, 1); hand(1, 2); flash(8, 0.8);
    if (!p.gunEj) { p.gunEj = true; this.eject(a, left); }
  } else if (id === 'rifle') {
    // cerrojo: tras el disparo, arriba, atrás, adelante y abajo
    const cyc = k < 0.25 ? 0 : k < 0.75 ? Math.sin((k - 0.25) / 0.5 * Math.PI) : 0;
    R(-9, -1, 7, 3, WOOD); R(-9, 1, 3, 2, WOOD); R(-2, -2, 15, 2, MET); R(3, 0, 8, 1, WOOD2); R(13, -2, 1, 1, DARK);
    R(1, -4, 6, 2, DARK); R(1, -4, 6, 1, '#5a6a7a'); // la mira
    R(-1 - cyc * 3, -1 - (cyc > 0.15 ? 2 : 0), 1, 2 + (cyc > 0.15 ? 0 : 1), MET2); // la palanca del cerrojo
    hand(-3, 0); hand(6, 0); flash(14, 1.1);
    if (!p.gunEj && k > 0.45) { p.gunEj = true; this.eject(a, left); }
  } else if (id === 'escopeta') {
    // corredera: atrás y adelante
    const pump = k < 0.2 ? 0 : k < 0.65 ? Math.sin((k - 0.2) / 0.45 * Math.PI) : 0;
    R(-8, -1, 6, 3, WOOD); R(-8, 1, 2, 2, WOOD); R(-2, -3, 13, 1, MET2); R(-2, -2, 13, 1, MET); R(-2, -1, 3, 2, DARK);
    const fx = 4 - pump * 3; R(fx, 0, 5, 2, WOOD2);
    hand(-2, 0); hand(fx + 1, 1); flash(11, 1.4);
    if (!p.gunEj && k > 0.35) { p.gunEj = true; this.eject(a, left, '#c83a2a'); }
  } else if (id === 'ballesta') {
    // tras el disparo la cuerda queda delante; se recarga con la manivela y vuelve a montarse
    const loaded = k > 0.8 || t > cd, crank = k < 0.8 ? k / 0.8 : 0;
    R(-6, -1, 13, 2, WOOD); R(-6, 1, 3, 2, WOOD);
    g.strokeStyle = '#5a3a1a'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(7, -7); g.quadraticCurveTo(10, 0, 7, 7); g.stroke();
    g.strokeStyle = '#e0d8c8'; g.lineWidth = 0.7; g.beginPath(); const sx = loaded ? 1 : 8; g.moveTo(7, -7); g.lineTo(sx, 0); g.lineTo(7, 7); g.stroke();
    if (loaded) { R(1, -1, 9, 1, '#4a3a2a'); R(10, -1, 1, 1, '#d8d8e0'); }
    if (crank > 0) { const ca = crank * Math.PI * 6; g.strokeStyle = MET2; g.lineWidth = 1; g.beginPath(); g.moveTo(-6, 0); g.lineTo(-6 + Math.cos(ca) * 3, Math.sin(ca) * 3); g.stroke(); hand(-7 + Math.cos(ca) * 3, Math.sin(ca) * 3 - 1); }
    else hand(-4, 0);
    hand(2, 1);
  } else if (id === 'arco') {
    // suelta, coge otra flecha y vuelve a tensar
    const pull = t < 0.08 ? 0 : k < 0.3 ? 0 : ease((k - 0.3) / 0.6) * 6, arrow = t > 0.2 && k > 0.25 || t > cd;
    g.strokeStyle = '#7a4a1e'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -9); g.quadraticCurveTo(6 + pull * 0.2, 0, 0, 9); g.stroke();
    g.strokeStyle = '#e8e0d0'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(0, -9); g.lineTo(-pull, 0); g.lineTo(0, 9); g.stroke();
    if (arrow) { R(-pull, -0.5, 11, 1, '#8a6a3a'); R(10 - pull, -1, 2, 2, '#d8d8e0'); R(-pull - 1, -1.5, 2, 3, '#e8e0d0'); }
    hand(2, -1); hand(-pull - 2, -1);
  }
  g.restore();
};
G.eject = function (a, left, col) { // la vaina (o el cartucho) que sale despedida hacia un lado
  const p = this.player, s = left ? 1 : -1, nx = -Math.sin(a) * s, ny = Math.cos(a) * s;
  this.fx.push(Fx.spark(p.x + Math.cos(a) * 3, p.y - 13, nx * -40 + this.rnd.gauss() * 10, -50 - this.rnd.next() * 20 + ny * 10, col ? parseInt(col.slice(1), 16) : 0xd8b040, 0.5));
};
const _lateA = Q.late;
Q.late = function () {
  _lateA();
  const _dp = G.drawPlayer;
  G.drawPlayer = function (g, cx, cy) {
    const p = this.player, behind = p.gunId && Math.sin(p.gunAng) < -0.4;
    if (behind) this.drawGun(g, cx, cy);
    _dp.call(this, g, cx, cy);
    if (!behind) this.drawGun(g, cx, cy);
  };
};
const _enterA = G.enter;
G.enter = function (id, x, y, dir) { if (this.player) this.player.gunId = null; return _enterA.call(this, id, x, y, dir); };
