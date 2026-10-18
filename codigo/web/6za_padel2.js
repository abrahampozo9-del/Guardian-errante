// ====================================================================== pádel: cuatro golpes y el mate
// Normal (plano), globo, dejada (muere junto a la red) y cortado (raso, patina y bota bajo). Si el contrario
// te tira un globo y le das por arriba, sale un mate: fortísimo, hacia abajo, y la bola sale botando alta.
// En el móvil, el pádel tiene sus propios botones a la derecha y el joystick a la izquierda.
const PADEL_GOLPES = { plano: 'Normal', globo: 'Globo', dejada: 'Dejada', cortado: 'Cortado' };

// ¿esta bola se puede rematar? (viene del contrario en globo y la pillas por arriba)
G.padelMateable = function (q) {
  const b = this.padel && this.padel.ball;
  return !!(b && !b.held && b.kind === 'globo' && b.lastTeam !== q.team && b.side === q.team && b.z > 1.15);
};

// lanzamiento con los golpes nuevos
const _launchP2 = G.padelLaunch;
G.padelLaunch = function (b, tx, ty, k) {
  if (k !== 'dejada' && k !== 'cortado' && k !== 'mate') return _launchP2.call(this, b, tx, ty, k);
  const dx = tx - b.x, dy = ty - b.y, dist = Math.hypot(dx, dy) || 1;
  const sp = k === 'dejada' ? 4.6 : k === 'cortado' ? 9.5 : 17, clear = k === 'dejada' ? 0.35 : k === 'cortado' ? 0.12 : 0.1;
  let T = dist / sp;
  for (let i = 0; i < 14; i++) {
    const vz = (PD.G * T * T / 2 - b.z) / T, vx = dx / T, tn = Math.abs(vx) > 0.01 ? (10 - b.x) / vx : 99;
    const zn = tn > 0 && tn < T ? b.z + vz * tn - PD.G * tn * tn / 2 : 9;
    if (zn > PD.NET + clear) break;
    T *= 1.08;
  }
  b.vx = dx / T; b.vy = dy / T; b.vz = (PD.G * T * T / 2 - b.z) / T;
};

// los golpes
const _hitP2 = G.padelHit;
G.padelHit = function (q, kind, aimY) {
  const P = this.padel, b = P.ball, R = this.rnd, prev = b.kind, dirX = q.team === 0 ? 1 : -1;
  // a un globo del contrario, por arriba: mate (para todos, también la máquina)
  if (this.padelMateable(q) && kind !== 'globo') kind = 'mate';
  if (kind === 'plano' || kind === 'globo') {
    _hitP2.call(this, q, kind, aimY);
    b.kind = b.z > 1.7 && kind !== 'globo' ? 'remate' : kind;
  } else {
    let tx = kind === 'dejada' ? 10 + dirX * (1.1 + R.next() * 1.3) : kind === 'cortado' ? 10 + dirX * (4.5 + R.next() * 3.2) : 10 + dirX * (4.5 + R.next() * 3.5);
    let ty;
    if (aimY !== undefined && Math.abs(aimY) > 0.3) ty = 5 + aimY * 3.8 + (R.next() - 0.5) * 1.2;
    else ty = (q.y < 5 ? 6.8 : 3.2) + (R.next() - 0.5) * 2.4;
    ty = Math.max(0.7, Math.min(9.3, ty));
    // errores: la dejada es delicada; el mate, si no estás debajo de la bola
    let err = q.ai ? q.err * (kind === 'dejada' ? 1.6 : 1) : (b.z < 0.2 ? 0.25 : kind === 'dejada' ? 0.08 : 0.03);
    if (R.next() < err) tx = kind === 'dejada' ? 10 - dirX * 0.4 : 10 + dirX * (10.6 + R.next() * 2);
    this.padelLaunch(b, tx, ty, kind);
    b.lastTeam = q.team; b.bounces = 0; b.serve = false; b.wall = 0; b.kind = kind;
    q.swing = 0.25; Sound.play(kind === 'mate' ? 'hit' : 'swing');
  }
  if (kind === 'mate') {
    P.mateT = 0.6; P.mateBy = q; Sound.play('hit');
    P.msg = q.team === 0 ? '¡Mate!' : 'Mate de ' + q.name + '.'; P.msgT = 0.8;
  }
  P.lastShot = { team: q.team, kind, prev };
};

// cómo bota cada golpe
const _stepP2 = G.padelBallStep;
G.padelBallStep = function (b, dt, sim) {
  const vz0 = b.vz, bo0 = b.bounces;
  const r = _stepP2.call(this, b, dt, sim);
  if (!r && b.bounces > bo0 && vz0 < 0) {
    if (b.kind === 'dejada') { b.vz = Math.max(b.vz * 0.5, 2.2); b.vx *= 0.45; b.vy *= 0.5; } // se queda muerta junto a la red
    else if (b.kind === 'cortado') { b.vz *= 0.68; b.vx /= 0.85; b.vy /= 0.85; } // patina: no pierde velocidad
    else if (b.kind === 'mate') { b.vz *= 1.45; } // bota alto, hacia el cristal
  }
  return r;
};
// al mate se le puede pegar más arriba (de un salto)
const _canP2 = G.padelCanHit;
G.padelCanHit = function (q) {
  if (_canP2.call(this, q)) return true;
  const b = this.padel.ball;
  if (!b || b.held || this.padel.phase !== 'rally' || b.side !== q.team || b.lastTeam === q.team) return false;
  return this.padelMateable(q) && Math.hypot(q.x - b.x, q.y - b.y) < 1.25 && b.z < 3.3;
};
// la máquina también mezcla golpes, y le cuesta devolver los mates y las dejadas
const _hitAI = G.padelHit;
G.padelHitAI = function (q) {
  const P = this.padel, b = P.ball, R = this.rnd, opp = P.pl.filter(o => o.team !== q.team);
  const atNet = opp.some(o => Math.abs(o.x - 10) < 3), deep = opp.every(o => Math.abs(o.x - 10) > 6);
  // devolver un mate o una dejada no es fácil
  if (b.kind === 'mate' && R.next() < 0.45) { this.padelHit(q, 'plano'); b.vz *= 0.4; return; }
  let k = 'plano', r = R.next();
  if (atNet && r < 0.4) k = 'globo';
  else if (deep && r < 0.18) k = 'dejada';
  else if (r < 0.27) k = 'cortado';
  this.padelHit(q, k);
};
// sustituir la elección de golpe de la máquina: se intercepta su llamada a padelHit con 'plano'/'globo'
const _updPadel2 = G.updatePadel;
G.updatePadel = function (dt) {
  const P = this.padel;
  if (P) {
    // golpes nuevos con teclado: Q dejada, E cortado (Espacio normal, Mayús globo)
    const me = P.pl[0];
    const dej = this.pressed('KeyQ', 'PdDejada'), cor = this.pressed('KeyE', 'PdCortado');
    if (dej || cor) {
      let iy = this.stick.y; if (this.down('ArrowUp', 'KeyW')) iy -= 1; if (this.down('ArrowDown', 'KeyS')) iy += 1;
      me.swingBuf = 0.28; me.kind = dej ? 'dejada' : 'cortado'; me.aimY = Math.max(-1, Math.min(1, iy)); me.swing = 0.22;
    }
    if (P.mateT > 0) P.mateT -= dt;
  }
  // la IA: mientras corre la actualización, su padelHit pasa por la elección de golpes
  const orig = G.padelHit, self = this;
  this.padelHit = function (q, kind, aimY) { if (q.ai && !q._choosing) { q._choosing = true; try { self.padelHitAI.call(self, q); } finally { q._choosing = false; } return; } return orig.call(self, q, kind, aimY); };
  try { _updPadel2.call(this, dt); } finally { this.padelHit = orig; }
};
// que la tecla E ya no sea «golpe normal» (ahora es el cortado)
const _pressedP2 = G.pressed;
G.pressed = function (...codes) {
  if (this.st === ST.PADEL && codes.includes('KeyE') && codes.includes('Space')) codes = codes.filter(c => c !== 'KeyE');
  return _pressedP2.apply(this, codes);
};
// al sacar, la bola es «normal»
const _serveP2 = G.padelSetupServe;
G.padelSetupServe = function () { _serveP2.call(this); if (this.padel.ball) this.padel.ball.kind = 'saque'; this.padel.mateT = 0; };

// ---------------------------------------------------------------- dibujo: mate, bola de cada golpe y ayuda
const _drawP2 = G.drawPadel;
G.drawPadel = function (g) {
  _drawP2.call(this, g);
  const P = this.padel, b = P.ball;
  if (b && !b.held) {
    const bx = Math.round(pdx(b.x)), by = Math.round(pdy(b.y) - b.z * PD.S * 0.85);
    if (b.kind === 'mate') { g.fillStyle = 'rgba(255,120,60,0.55)'; for (const [tx, ty, tz] of P.trail) g.fillRect(Math.round(pdx(tx)) - 1, Math.round(pdy(ty) - tz * PD.S * 0.85) - 1, 3, 3); }
    if (b.kind === 'cortado') { g.fillStyle = 'rgba(160,220,255,0.6)'; g.fillRect(bx - 3, by, 2, 1); }
    // ¡a por el mate!: aviso sobre la bola cuando puedes rematar
    if (this.padelMateable(P.pl[0]) && Math.hypot(P.pl[0].x - b.x, P.pl[0].y - b.y) < 2.4) {
      g.strokeStyle = `rgba(255,214,110,${0.6 + 0.4 * Math.sin(this.clock * 14)})`; g.lineWidth = 1;
      g.beginPath(); g.arc(bx, by, 5, 0, Math.PI * 2); g.stroke();
    }
  }
  if (P.mateT > 0) { g.fillStyle = `rgba(255,240,200,${P.mateT * 0.25})`; g.fillRect(0, 0, WW, WH); }
};
const _uiP2 = G.uiPadel;
G.uiPadel = function (g) {
  const P = this.padel, saveHint = this.center;
  // la línea de ayuda de abajo se cambia por la nueva
  this.center = function (gg, s, y, c) { if (y === VH - 6) return; return saveHint.call(this, gg, s, y, c); };
  try { _uiP2.call(this, g); } finally { this.center = saveHint; }
  g.font = FB(5.8);
  const serve = P.phase === 'serve' && P.serverP === P.pl[0];
  const hint = this.touch ? (serve ? 'Toca Normal para sacar' : 'Normal · Globo · Dejada · Cortado · al globo del contrario: ¡mate!')
    : serve ? 'Espacio para sacar' : 'Espacio: normal · Mayús: globo · Q: dejada · E: cortado · al globo del contrario, ¡mate! · Esc: dejarlo';
  this.center(g, hint, VH - 6, DIM);
};

// ---------------------------------------------------------------- botones del pádel en el móvil
const _lateP2 = Q.late;
Q.late = function () {
  _lateP2();
  if (typeof Touch === 'undefined') return;
  const _lay = Touch.layout, _draw = Touch.draw;
  Touch.layout = function (cw, ch) {
    _lay.call(this, cw, ch);
    if (G.st !== ST.PADEL) return;
    const k = this.k;
    this.buttons = [
      { id: 'pd_normal', x: cw - 64 * k, y: ch - 72 * k, r: 34 * k, label: 'Normal', code: 'Space' },
      { id: 'pd_globo', x: cw - 70 * k, y: ch - 158 * k, r: 25 * k, label: 'Globo', code: 'Roll' },
      { id: 'pd_dejada', x: cw - 150 * k, y: ch - 40 * k, r: 25 * k, label: 'Dejada', code: 'PdDejada' },
      { id: 'pd_cortado', x: cw - 150 * k, y: ch - 118 * k, r: 25 * k, label: 'Cortado', code: 'PdCortado' },
      { id: 'menu', x: (G.layout.ox > 44 * k ? G.layout.ox / 2 : cw / 2), y: G.layout.ox > 44 * k ? 34 * k : ch - 18 * k, r: 16 * k, label: 'Menú', code: 'Escape' },
    ];
  };
  Touch.draw = function (ctx, cw, ch) {
    if (G.st !== ST.PADEL || ch > cw) return _draw.call(this, ctx, cw, ch);
    this.layout(cw, ch);
    const P = G.padel, mate = P && G.padelMateable(P.pl[0]);
    for (const b of this.buttons) {
      const lit = (this.flash[b.id] || 0) > performance.now(), glow = b.id === 'pd_normal' && mate;
      ctx.fillStyle = lit ? 'rgba(232,196,106,0.55)' : glow ? `rgba(255,170,60,${0.35 + 0.25 * Math.sin(performance.now() / 70)})` : 'rgba(18,14,12,0.45)';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = b.id === 'pd_normal' ? 'rgba(200,58,42,0.9)' : 'rgba(138,100,64,0.9)'; ctx.stroke();
      ctx.fillStyle = PAPER; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = FBB(Math.round((b.r > 30 ? 14 : 11) * this.k));
      ctx.fillText(glow ? '¡Mate!' : b.label, b.x, b.y + 1);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    }
    this.drawPad(ctx);
  };
};
