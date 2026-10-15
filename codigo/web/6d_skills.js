// ====================================================================== árbol de habilidades y combate avanzado
// Tres ramas de cinco habilidades. Cada una pide la anterior de su rama y un nivel mínimo.
const SKILLS = [
  { branch: 'Espada', color: '#d0503a', list: [
    { id: 'filo', name: 'Filo templado', desc: 'Tu espada hace un 15% más de daño.' },
    { id: 'estocada', name: 'Estocada', desc: 'Tercer golpe del combo: una estocada que hace ×1,6 de daño, llega más lejos y aturde a los enemigos ligeros.' },
    { id: 'torbellino', name: 'Torbellino', desc: 'Mantén pulsado atacar y suelta: giras con la espada y golpeas a todo lo que te rodea (×2 de daño).' },
    { id: 'certero', name: 'Golpe certero', desc: 'Críticos más frecuentes (22%) y más fuertes (×2,5).' },
    { id: 'juicio', name: 'Juicio', desc: 'La estocada y el torbellino lanzan ondas cortantes de luz que atraviesan a los engendros.' },
  ] },
  { branch: 'Fe', color: '#e8c46a', list: [
    { id: 'oracion', name: 'Oración profunda', desc: 'Orar cuesta menos Fe (18) y cura un 50% más.' },
    { id: 'ardiente', name: 'Luz ardiente', desc: 'La Luz hace un 50% más de daño y llega más lejos.' },
    { id: 'fervor', name: 'Fervor', desc: '+30 de Fe máxima. La Fe se recupera el doble de rápido y cada espadazo te da 1 de Fe.' },
    { id: 'escudo', name: 'Escudo de fe', desc: 'Después de orar, durante 5 segundos recibes la mitad de daño.' },
    { id: 'cruzluz', name: 'Cruz de luz', desc: 'La Luz aturde 2 segundos a los engendros y te cura el veneno.' },
  ] },
  { branch: 'Camino', color: '#7ab04a', list: [
    { id: 'curtido', name: 'Piel curtida', desc: '+25 de vida máxima.' },
    { id: 'ligero', name: 'Pies ligeros', desc: 'Andas un 12% más rápido y puedes volver a rodar en la mitad de tiempo.' },
    { id: 'herbolario', name: 'Herbolario', desc: 'Las hierbas curan 55, los engendros sueltan más y el veneno te dura la mitad.' },
    { id: 'esquiva', name: 'Esquiva perfecta', desc: 'Si ruedas a través de un ataque, el tiempo se ralentiza y tu siguiente golpe es crítico.' },
    { id: 'aliento', name: 'Segundo aliento', desc: 'Una vez por descanso, si caes te levantas con el 40% de la vida.' },
  ] },
];
const SKILL_LVL = [1, 3, 5, 8, 11]; // nivel mínimo de cada fila

G.has = function (id) { return this.player.skills.has(id); };
G.skillAt = function (i) { return SKILLS[i % 3].list[Math.floor(i / 3)]; };
G.skillState = function (i) {
  const p = this.player, b = i % 3, r = Math.floor(i / 3), s = SKILLS[b].list[r];
  if (p.skills.has(s.id)) return 'ok';
  if (r > 0 && !p.skills.has(SKILLS[b].list[r - 1].id)) return 'bloq';
  if (p.lvl < SKILL_LVL[r]) return 'nivel';
  return p.pts > 0 ? 'puede' : 'sinpuntos';
};
G.learn = function (i) {
  const p = this.player, s = this.skillAt(i), st = this.skillState(i);
  if (st === 'ok') { this.toast('Ya la tienes.'); return; }
  if (st === 'bloq') { this.toast('Primero aprende la anterior de esta rama.'); return; }
  if (st === 'nivel') { this.toast('Necesitas nivel ' + SKILL_LVL[Math.floor(i / 3)] + '.'); return; }
  if (st === 'sinpuntos') { this.toast('No te quedan puntos. Sube de nivel.'); return; }
  p.pts--; p.skills.add(s.id);
  if (s.id === 'curtido') { p.maxHp += 25; p.hp += 25; }
  if (s.id === 'fervor') { p.maxFe += 30; p.fe += 30; }
  Sound.play('level');
  this.toast('Aprendido: ' + s.name);
  this.save();
};
G.openSkills = function () { this.st = ST.SKILLS; this.skillSel = this.skillSel || 0; };
ST.SKILLS = 'SKILLS';
G.updateSkills = function () {
  if (this.pressed('Escape', 'KeyH', 'KeyP', 'Pick99')) { this.st = ST.PLAY; return; }
  let s = this.skillSel || 0;
  if (this.pressed('ArrowLeft', 'KeyA')) s = s % 3 === 0 ? s + 2 : s - 1;
  if (this.pressed('ArrowRight', 'KeyD')) s = s % 3 === 2 ? s - 2 : s + 1;
  if (this.pressed('ArrowUp', 'KeyW')) s = (s + 12) % 15;
  if (this.pressed('ArrowDown', 'KeyS')) s = (s + 3) % 15;
  for (let i = 0; i < 15; i++) if (this.just.has('Pick' + i)) { this.just.delete('Pick' + i); if (s === i) this.learn(i); s = i; }
  this.skillSel = s;
  if (this.pressed('Enter', 'KeyE', 'Space', 'KeyZ')) this.learn(s);
};
G.uiSkills = function (g) {
  const p = this.player;
  g.fillStyle = 'rgba(10,8,6,0.94)'; g.fillRect(0, 0, VW, VH);
  g.font = FT(12); this.text(g, 'Árbol de habilidades', 14, 16, GOLD);
  g.font = FB(7); this.text(g, 'Nivel ' + p.lvl + '   ·   Puntos: ' + p.pts, 160, 15, p.pts > 0 ? '#ffe68a' : SOFT);
  // botón volver
  g.fillStyle = 'rgba(232,196,106,0.15)'; g.fillRect(VW - 60, 5, 52, 14); g.strokeStyle = GOLD; g.strokeRect(VW - 59.5, 5.5, 51, 13);
  g.font = FB(6.5); this.text(g, 'Volver', VW - 48, 15, PAPER);
  this.menuRects.push({ x: VW - 64, y: 0, w: 64, h: 24, i: 99 });
  const colX = [70, 200, 330], y0 = 42, dy = 26;
  SKILLS.forEach((B, b) => {
    g.font = FB(7.5); const tw = g.measureText(B.branch).width; this.text(g, B.branch, colX[b] - tw / 2, 32, B.color);
    g.strokeStyle = 'rgba(232,196,106,0.25)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(colX[b], y0); g.lineTo(colX[b], y0 + dy * 4); g.stroke();
    B.list.forEach((s, r) => {
      const i = r * 3 + b, x = colX[b], y = y0 + r * dy, st = this.skillState(i), sel = this.skillSel === i;
      const ok = st === 'ok', can = st === 'puede';
      g.fillStyle = ok ? B.color : (can ? 'rgba(232,196,106,0.18)' : 'rgba(40,34,28,0.95)');
      g.fillRect(x - 54, y - 9, 108, 18);
      g.strokeStyle = sel ? '#fff' : (ok ? B.color : can ? GOLD : '#4a4036'); g.lineWidth = sel ? 1.5 : 1;
      g.strokeRect(x - 53.5, y - 8.5, 107, 17);
      if (can) { g.fillStyle = `rgba(255,230,140,${0.25 + 0.2 * Math.sin(this.clock * 5)})`; g.fillRect(x - 54, y - 9, 3, 18); }
      g.font = FB(6.6);
      const nm = s.name, w = g.measureText(nm).width;
      this.text(g, nm, x - w / 2, y + 2.5, ok ? '#120e0a' : (st === 'bloq' || st === 'nivel') ? '#7a6e60' : PAPER);
      if (st === 'nivel') { g.font = FB(5); this.text(g, 'Nv ' + SKILL_LVL[r], x + 38, y + 7, '#7a6e60'); }
      this.menuRects.push({ x: x - 56, y: y - 11, w: 112, h: 22, i });
    });
  });
  // descripción
  const s = this.skillAt(this.skillSel || 0), st = this.skillState(this.skillSel || 0);
  g.fillStyle = 'rgba(30,24,18,0.95)'; g.fillRect(10, VH - 50, VW - 20, 44); g.strokeStyle = 'rgba(232,196,106,0.5)'; g.strokeRect(10.5, VH - 49.5, VW - 21, 43);
  g.font = FB(7.5); this.text(g, s.name, 18, VH - 38, GOLD);
  const stTxt = { ok: 'Aprendida', puede: G.touch ? 'Toca otra vez para aprender (1 punto)' : 'Enter para aprender (1 punto)', bloq: 'Requiere la anterior', nivel: 'Requiere nivel ' + SKILL_LVL[Math.floor((this.skillSel || 0) / 3)], sinpuntos: 'Sin puntos' }[st];
  g.font = FB(6); const tw = g.measureText(stTxt).width; this.text(g, stTxt, VW - 18 - tw, VH - 38, st === 'puede' ? '#ffe68a' : SOFT);
  g.font = FB(6.6); this.wrap(g, s.desc, VW - 40).forEach((l, k) => this.text(g, l, 18, VH - 27 + k * 9, PAPER));
};

// ---------------------------------------------------------------- combate
G.swordDamage = function (mult) {
  const p = this.player;
  let d = (p.atk * (this.has('filo') ? 1.15 : 1) + this.rnd.int(5) - 1) * mult;
  let crit = this.rnd.next() < (this.has('certero') ? 0.22 : 0.1);
  if (p.nextCrit) { crit = true; p.nextCrit = false; }
  if (crit) d *= this.has('certero') ? 2.5 : 2;
  return [Math.round(d), crit];
};
G.attackPress = function () {
  const p = this.player;
  if (!p.hasSword) { this.toast('No llevas la espada. Está en el baúl del rellano.'); return; }
  if (p.atkCool > 0 || p.spinT > 0 || p.rolling) return;
  const maxCombo = this.has('estocada') ? 3 : 2;
  p.combo = this.clock - p.lastAtk < 0.6 ? (p.combo + 1) % maxCombo : 0;
  p.lastAtk = this.clock;
  p.atkKind = p.combo === 2 ? 'thrust' : p.combo === 1 ? 'back' : 'slash';
  p.atkT = 0.24; p.atkCool = p.atkKind === 'thrust' ? 0.5 : p.atkKind === 'back' ? 0.28 : 0.32;
  p.hitSet.clear(); Sound.play('swing');
  if (p.atkKind === 'thrust') {
    const [dx, dy] = [[0, 1], [0, -1], [-1, 0], [1, 0]][p.dir];
    p.move(this.world, dx * 7, dy * 7);
    if (this.has('juicio')) this.wave(p.x + dx * 12, p.y - 8 + dy * 12, dx, dy);
  }
};
G.spinAttack = function () {
  const p = this.player;
  p.spinT = 0.38; p.atkT = 0; p.atkCool = 0.45; p.hitSet.clear(); p.combo = 0;
  Sound.play('swing'); setTimeout(() => Sound.play('swing'), 120);
  this.fx.push(Fx.ring(p.x, p.y - 8, 34, 0xffffff));
  this.shake(0.12);
  if (this.has('juicio')) for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; this.wave(p.x, p.y - 8, Math.cos(a), Math.sin(a)); }
};
G.wave = function (x, y, dx, dy) {
  this.waves.push({ x, y, vx: dx * 190, vy: dy * 190, life: 0.55, hit: new Set() });
};
G.swordHit = function (m, mult) {
  const p = this.player;
  p.hitSet.add(m);
  const [d, crit] = this.swordDamage(mult);
  this.damageMonster(m, d, crit, m.x - p.x, m.y - p.y);
  this.hitStop = crit ? 0.075 : 0.04;
  if (crit) this.shake(0.1);
  if (this.has('fervor') && p.fe < p.maxFe) p.fe++;
};
G.updateCombat = function (dt) {
  const p = this.player, w = this.world;
  // cargar el torbellino manteniendo el botón
  const holding = this.down('Space', 'KeyJ', 'AtkHold');
  if (holding && p.hasSword && this.has('torbellino') && p.atkT <= 0 && !p.rolling && p.spinT <= 0) {
    const was = p.charge; p.charge += dt;
    if (was < 0.55 && p.charge >= 0.55) { Sound.play('orb'); this.fx.push(Fx.ring(p.x, p.y - 8, 18, 0xffe8a0)); }
  } else if (!holding) {
    if (p.charge >= 0.55 && this.has('torbellino')) this.spinAttack();
    p.charge = 0;
  }
  if (p.shieldT > 0) p.shieldT -= dt;
  // golpes de espada
  if (p.atkT > 0.04 && p.atkT < 0.21) {
    const thrust = p.atkKind === 'thrust', c = this.swordCenter(thrust ? 24 : 15), rad = thrust ? 13 : 15;
    for (const m of w.monsters) {
      if (m.dead || p.hitSet.has(m)) continue;
      if (Math.hypot(m.x - c[0], (m.y - 6) - c[1]) < rad + m.hw) {
        this.swordHit(m, thrust ? 1.6 : p.atkKind === 'back' ? 0.9 : 1);
        if (thrust && !m.dead && m.kind !== MK.BESTIA && m.kind !== MK.NIDO && m.vulnerable()) m.setState('stun', 0.6);
      }
    }
  }
  if (p.spinT > 0) {
    p.spinT -= dt;
    for (const m of w.monsters) if (!m.dead && !p.hitSet.has(m) && Math.hypot(m.x - p.x, m.y - p.y) < 30 + m.hw) this.swordHit(m, 2);
  }
  // ondas de Juicio
  this.waves = this.waves.filter(o => {
    o.x += o.vx * dt; o.y += o.vy * dt; o.life -= dt;
    for (const m of w.monsters) if (!m.dead && !o.hit.has(m) && Math.hypot(m.x - o.x, m.y - 6 - o.y) < 10 + m.hw) {
      o.hit.add(m); const [d, crit] = this.swordDamage(1.1); this.damageMonster(m, d, crit, o.vx, o.vy);
    }
    if (this.rnd.next() < 0.6) this.fx.push(Fx.spark(o.x, o.y, this.rnd.gauss() * 10, this.rnd.gauss() * 10, 0xfff0b0, 0.25));
    return o.life > 0 && !w.solid(Math.floor(o.x / TS), Math.floor((o.y + 8) / TS));
  });
};
/** Rodaste a través de un ataque. */
G.perfectDodge = function () {
  const p = this.player;
  if (!this.has('esquiva') || p.dodgeDone) return;
  p.dodgeDone = true; p.nextCrit = true; this.slowT = 0.7;
  this.fx.push(Fx.text(p.x, p.y - 30, '¡Esquiva perfecta!', 0xa0e8ff));
  this.fx.push(Fx.ring(p.x, p.y - 8, 28, 0xa0e8ff));
  Sound.play('orb');
};
G.drawCombatFx = function (g, cx, cy) {
  const p = this.player;
  if (p.charge > 0.15 && this.has('torbellino')) {
    const k = Math.min(1, p.charge / 0.55);
    g.strokeStyle = k >= 1 ? `rgba(255,236,160,${0.6 + 0.3 * Math.sin(this.clock * 20)})` : `rgba(255,255,255,${0.35 * k})`;
    g.lineWidth = 1.5; g.beginPath(); g.arc(p.x - cx, p.y - 10 - cy, 13, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.stroke();
  }
  if (p.shieldT > 0) {
    g.strokeStyle = `rgba(255,220,120,${0.3 + 0.15 * Math.sin(this.clock * 6)})`; g.lineWidth = 1;
    g.beginPath(); g.ellipse(p.x - cx, p.y - 10 - cy, 12, 15, 0, 0, Math.PI * 2); g.stroke();
  }
  for (const o of this.waves) {
    const a = Math.atan2(o.vy, o.vx);
    g.strokeStyle = 'rgba(255,240,190,0.9)'; g.lineWidth = 2;
    g.beginPath(); g.arc(o.x - cx, o.y - cy, 8, a - 1.1, a + 1.1); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1;
    g.beginPath(); g.arc(o.x - cx - Math.cos(a) * 3, o.y - cy - Math.sin(a) * 3, 8, a - 0.9, a + 0.9); g.stroke();
  }
};
