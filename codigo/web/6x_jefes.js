// ====================================================================== jefes a la altura del Guardián
// Los jefes (de la historia y de las misiones) se ajustan al aparecer a lo fuerte que llegue el jugador:
// cuanto más ataque tengas (nivel, afilados, habilidades), más vida tienen; cuanto más nivel, más pegan.
// Y a media vida se enfurecen: más rápidos, con menos respiro entre golpe y golpe.
G.isBossFoe = function (m) {
  return m === this.boss || m.kind === MK.BESTIA || m.kind === MK.DEMONIO || m.lider || m.anticristo || m.casetero || (m.qfoe && m.maxHp >= 250);
};
// cada jefe se pensó para el nivel que suele tener el jugador en ese punto de la historia; si llegas más
// fuerte, crece contigo. Y a partir de nivel 4 todos son algo más duros que antes.
G.bossPower = function () {
  const p = this.player, lexp = Math.max(1, Math.min(22, 1 + (this.stage || 0) * 0.75));
  const pow = p.atk * (this.has('filo') ? 1.15 : 1) * (this.has('certero') ? 1.12 : 1) * (this.has('pulso') ? 1.05 : 1);
  const ref = 12 + (lexp - 1), base = 1 + 0.35 * Math.min(1, Math.max(0, p.lvl - 3) / 8);
  return {
    hp: Math.pow(Math.max(1, pow / ref), 0.9) * base,
    dmg: (1 + 0.04 * Math.max(0, p.lvl - 1)) * (1 + 0.15 * Math.min(1, Math.max(0, p.lvl - 3) / 8)),
  };
};
G.scaleBoss = function (m) {
  m._esc = true;
  const k = this.bossPower(), crowd = m.asedio ? 0.7 : 1; // los del asedio son muchos: algo menos cada uno
  const hpK = 1 + (k.hp - 1) * crowd, dmgK = 1 + (k.dmg - 1) * crowd;
  if (hpK > 1.01) { const frac = m.maxHp > 0 ? m.hp / m.maxHp : 1; m.maxHp = Math.round(m.maxHp * hpK); m.hp = Math.max(1, Math.round(m.maxHp * frac)); }
  m.dmg = Math.round(m.dmg * dmgK);
  m.xp = Math.round(m.xp * (1 + (hpK - 1) * 0.5));
  if (this.player.lvl >= 6) m.speed *= 1 + Math.min(0.18, 0.01 * (this.player.lvl - 5));
};
G.enrage = function (m) {
  m.rage = true; m.speed *= 1.22;
  m.st = Object.assign({}, m.st, { wind: m.st.wind * 0.75, rec: m.st.rec * 0.6 });
  if (m.cool > 0.3) m.cool = 0.3;
  this.shake(0.4); Sound.play('roar');
  this.fx.push(Fx.ring(m.x, m.y - 12, 34, 0xff4020));
  this.fx.push(Fx.text(m.x, m.y - 40, '¡Se enfurece!', 0xff7050));
};
const _updJ = G.updatePlay;
G.updatePlay = function (dt) {
  const w = this.world;
  if (w && this.player && !this.padel) for (const m of w.monsters) {
    if (m.dead || !this.isBossFoe(m)) continue;
    if (!m._esc) this.scaleBoss(m);
    if (!m.rage && m.kind !== MK.BESTIA && !m.asedio && m.hp < m.maxHp * 0.5) this.enrage(m);
  }
  _updJ.call(this, dt);
};
