// ====================================================================== cómo empuña el Guardián la espada y las armas
// El cuerpo se dibuja sin los brazos que se mueven, y los brazos se pintan aparte, del hombro a la mano, para
// que siempre agarren de verdad lo que llevan: la espada por el puño y con las dos manos, el rifle por la
// culata y el guardamanos, la escopeta con la mano de delante en la corredera (que se mueve al bombear),
// el arco con una mano en la empuñadura y la otra tirando de la cuerda.
// El espadazo tiene tres tiempos, como en las hojas de animación clásicas: preparación (la espada sube por
// detrás y el cuerpo se echa atrás), golpe (zancada hacia delante, estela en media luna) y guardia.
const POSE = {};
POSE.sleeve = '#4e5660'; POSE.edge = '#17151a';
// hombros (relativos a los pies del jugador) según hacia dónde mira: [el de la espada, el otro]
POSE.shoulders = d => [[[-6, -13], [5, -13]], [[5, -13], [-6, -13]], [[-1, -13], [0, -14]], [[0, -13], [-1, -14]]][d];
POSE.dirV = d => [[0, 1], [0, -1], [-1, 0], [1, 0]][d];
const poseOut = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
const poseIO = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
const plerp = (a, b, k) => a + (b - a) * k;
// un brazo de píxeles: contorno oscuro, manga y la mano al final
POSE.arm = function (g, x0, y0, x1, y1, skin) {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  g.fillStyle = POSE.edge;
  for (let i = 0; i <= n; i++) { const x = Math.round(plerp(x0, x1, i / n)), y = Math.round(plerp(y0, y1, i / n)); g.fillRect(x - 1.5, y - 1.5, 3, 3); }
  g.fillStyle = POSE.sleeve;
  for (let i = 0; i <= n; i++) { const x = Math.round(plerp(x0, x1, i / n)), y = Math.round(plerp(y0, y1, i / n)); g.fillRect(x - 1, y - 1, 2, 2); }
  g.fillStyle = skin; g.fillRect(Math.round(x1) - 1, Math.round(y1) - 1, 2, 2);
};

// ---------------------------------------------------------------- el espadazo
// ángulos (de la mano respecto al pecho) de inicio y fin de cada golpe, por dirección
POSE.arc = function (d, kind) {
  let a0, a1;
  if (d === 3) { a0 = -2.1; a1 = 1.15; } // de perfil: tajo de arriba (por detrás) hacia abajo y delante
  else if (d === 2) { a0 = Math.PI + 2.1; a1 = Math.PI - 1.15; }
  else if (d === 0) { a0 = 2.75; a1 = 0.4; } // de frente: barrido por delante, de izquierda a derecha
  else { a0 = -0.4; a1 = -2.75; } // de espaldas: barrido por delante de él (detrás de su cuerpo para nosotros)
  if (kind === 'back') { if (d >= 2) { const m = d === 3 ? [1.7, -1.0] : [Math.PI - 1.7, Math.PI + 1.0]; a0 = m[0]; a1 = m[1]; } else { const t = a0; a0 = a1; a1 = t; } }
  return [a0, a1];
};
// estado de la espada en un momento t (0 → 1) del golpe
POSE.swing = function (p) {
  const t = 1 - p.atkT / 0.24, d = p.dir, [dx, dy] = POSE.dirV(d);
  if (p.atkKind === 'thrust') {
    const ang = Math.atan2(dy, dx);
    const ext = t < 0.25 ? plerp(4, 2, poseIO(t / 0.25)) : t < 0.55 ? plerp(2, 11, poseOut((t - 0.25) / 0.3)) : plerp(11, 7, poseIO((t - 0.55) / 0.45));
    const lean = t < 0.25 ? -1.5 * poseIO(t / 0.25) : t < 0.55 ? plerp(-1.5, 3, poseOut((t - 0.25) / 0.3)) : plerp(3, 1, (t - 0.55) / 0.45);
    return { hand: ext, ang, blade: ang, lean, stride: t > 0.25, smear: null, lunge: t > 0.25 && t < 0.7, t };
  }
  const [a0, a1] = POSE.arc(d, p.atkKind), dir = Math.sign(a1 - a0);
  const over = a0 - dir * 0.35; // la preparación pasa un poco del inicio
  let ang, blade, reach, lean, smear = null;
  if (t < 0.2) { const k = poseIO(t / 0.2); ang = plerp(a0 + (a1 - a0) * 0.15, over, k); blade = ang + dir * 0.3 * k; reach = plerp(6, 5, k); lean = -1.6 * k; }
  else if (t < 0.55) { const k = poseOut((t - 0.2) / 0.35); ang = plerp(over, a1, k); blade = ang + dir * 0.3 * (1 - k); reach = 5 + 3 * Math.sin(k * Math.PI); lean = plerp(-1.6, 2.6, k); smear = [over + dir * 0.3, ang, 1]; }
  else { const k = poseIO((t - 0.55) / 0.45); ang = a1 + dir * 0.12 * k; blade = ang + dir * 0.18 * k; reach = plerp(5, 6, k); lean = plerp(2.6, 1.2, k); smear = k < 0.5 ? [over + dir * 0.3 + (a1 - over) * k * 1.6, a1, 1 - k * 2] : null; }
  return { hand: reach, ang, blade, lean, stride: t >= 0.2, smear, t };
};
// la estela en media luna: blanca por dentro, celeste por fuera
POSE.smear = function (g, cx, cy, from, to, r0, r1, alpha) {
  if (alpha <= 0.02 || Math.abs(to - from) < 0.05) return;
  const n = Math.max(4, Math.ceil(Math.abs(to - from) / 0.12)), cols = [[170, 225, 255, 0.55], [225, 245, 255, 0.9], [255, 255, 255, 1]];
  for (let band = 0; band < 3; band++) {
    const ra = plerp(r0, r1, band / 3), rb = plerp(r0, r1, (band + 1) / 3), c = cols[band];
    for (let i = 0; i < n; i++) {
      const k0 = i / n, k1 = (i + 1) / n, b0 = plerp(from, to, k0), b1 = plerp(from, to, k1);
      const fade = alpha * c[3] * Math.pow(k1, 1.6); // más intensa cerca de la espada
      // la punta de la media luna se afila: las bandas exteriores empiezan más tarde
      if (k1 < band * 0.18) continue;
      g.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${fade})`;
      g.beginPath(); g.moveTo(cx + Math.cos(b0) * ra, cy + Math.sin(b0) * ra * 0.82); g.lineTo(cx + Math.cos(b1) * ra, cy + Math.sin(b1) * ra * 0.82);
      g.lineTo(cx + Math.cos(b1) * rb, cy + Math.sin(b1) * rb * 0.82); g.lineTo(cx + Math.cos(b0) * rb, cy + Math.sin(b0) * rb * 0.82); g.fill();
    }
  }
};
// la espada con las dos manos en el puño
POSE.sword = function (g, hx, hy, ang) {
  g.save(); g.translate(Math.round(hx), Math.round(hy)); g.rotate(ang + Math.PI / 2); g.drawImage(cv(Art.sword), -3, -18); g.restore();
};

// ---------------------------------------------------------------- las armas de fuego y de cuerda
// pinta el arma en coordenadas propias (x hacia la boca del cañón) y devuelve dónde van las dos manos
POSE.gun = function (g, id, t, cd) {
  const k = t / cd;
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const MET = '#70707c', MET2 = '#b4b4c0', DARK = '#2e2e36', WOOD = '#9a5e2a', WOOD2 = '#c88a4a';
  const flash = (x, big) => { if (t < 0.07) { g.fillStyle = 'rgba(255,240,170,0.95)'; g.beginPath(); g.moveTo(x, -3 * big); g.lineTo(x + 6 * big, 0); g.lineTo(x, 3 * big); g.fill(); g.fillStyle = 'rgba(255,170,60,0.9)'; g.fillRect(x, -1, 3 * big, 2); } };
  if (id === 'pistola') {
    const slide = t < 0.09 ? 2 : 0;
    R(-1, 0, 3, 4, DARK); R(-2, -2, 9, 2, MET); R(-2 - slide, -3, 8, 1, MET2); R(6, -2, 1, 1, DARK); flash(8, 0.8);
    return { rear: [0, 2], front: [1, 3] };
  }
  if (id === 'rifle') {
    const cyc = k < 0.25 ? 0 : k < 0.75 ? Math.sin((k - 0.25) / 0.5 * Math.PI) : 0;
    R(-9, -1, 7, 3, WOOD); R(-9, 1, 3, 2, WOOD); R(-2, -2, 15, 2, MET); R(3, 0, 8, 1, WOOD2); R(13, -2, 1, 1, DARK);
    R(1, -4, 6, 2, DARK); R(1, -4, 6, 1, '#5a6a7a');
    const bx = -1 - cyc * 3; R(bx, -1 - (cyc > 0.15 ? 2 : 0), 1, 2 + (cyc > 0.15 ? 0 : 1), MET2); flash(14, 1.1);
    // al acerrojar, la mano de atrás suelta la empuñadura y tira del cerrojo
    return { rear: cyc > 0.05 ? [bx, -2] : [-3, 1], front: [6, 1] };
  }
  if (id === 'escopeta') {
    const pump = k < 0.2 ? 0 : k < 0.65 ? Math.sin((k - 0.2) / 0.45 * Math.PI) : 0;
    R(-8, -1, 6, 3, WOOD); R(-8, 1, 2, 2, WOOD); R(-2, -3, 13, 1, MET2); R(-2, -2, 13, 1, MET); R(-2, -1, 3, 2, DARK);
    const fx = 4 - pump * 3; R(fx, 0, 5, 2, WOOD2); flash(11, 1.4);
    return { rear: [-2, 1], front: [fx + 2, 1] };
  }
  if (id === 'ballesta') {
    const loaded = k > 0.8 || t > cd, crank = k < 0.8 ? k / 0.8 : 0;
    R(-6, -1, 13, 2, WOOD); R(-6, 1, 3, 2, WOOD);
    g.strokeStyle = '#5a3a1a'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(7, -7); g.quadraticCurveTo(10, 0, 7, 7); g.stroke();
    g.strokeStyle = '#e0d8c8'; g.lineWidth = 0.7; g.beginPath(); const sx = loaded ? 1 : 8; g.moveTo(7, -7); g.lineTo(sx, 0); g.lineTo(7, 7); g.stroke();
    if (loaded) { R(1, -1, 9, 1, '#4a3a2a'); R(10, -1, 1, 1, '#d8d8e0'); }
    let rear = [-4, 1];
    if (crank > 0) { const ca = crank * Math.PI * 6; g.strokeStyle = MET2; g.lineWidth = 1; g.beginPath(); g.moveTo(-6, 0); g.lineTo(-6 + Math.cos(ca) * 3, Math.sin(ca) * 3); g.stroke(); rear = [-6 + Math.cos(ca) * 3, Math.sin(ca) * 3]; }
    return { rear, front: [3, 1] };
  }
  // arco: suelta, coge otra flecha y vuelve a tensar
  const pull = t < 0.08 ? 0 : k < 0.3 ? 0 : poseIO((k - 0.3) / 0.6) * 6, arrow = (t > 0.2 && k > 0.25) || t > cd;
  g.strokeStyle = '#7a4a1e'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(2, -9); g.quadraticCurveTo(8 + pull * 0.2, 0, 2, 9); g.stroke();
  g.strokeStyle = '#e8e0d0'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(2, -9); g.lineTo(2 - pull, 0); g.lineTo(2, 9); g.stroke();
  if (arrow) { R(2 - pull, -0.5, 11, 1, '#8a6a3a'); R(12 - pull, -1, 2, 2, '#d8d8e0'); R(1 - pull, -1.5, 2, 3, '#e8e0d0'); }
  // la mano de la cuerda vuelve hacia la cara al tensar
  return { rear: [2 - pull - (t < 0.08 ? 0 : 1), 0], front: [5, 0], bow: true };
};

// ---------------------------------------------------------------- el jugador entero
G.drawPlayerPose = function (g, cx, cy) {
  const p = this.player;
  if (p.dead && this.deadT > 0.5) return;
  if (p.invul > 0 && !p.rolling && Math.floor(p.invul * 20) % 2 === 0 && !p.dead) return;
  const S = Art.heroSets[this.hero] || Art.heroSets.abraham, skin = S.skin;
  const attacking = p.atkT > 0 && p.hasSword && !p.rolling;
  const guard = !attacking && (p.guardT || 0) > 0 && p.hasSword && !p.rolling && p.spinT <= 0;
  const gunOn = p.gunId && p.gunT !== undefined && p.gunT <= p.gunCd + 0.7 && !attacking && p.spinT <= 0 && !p.rolling && !p.dead;
  const spin = p.spinT > 0 && !p.rolling;
  const posed = attacking || spin || gunOn || guard;
  const fx = p.x - cx, fy = p.y - cy;
  this.shadow(g, fx, fy, 6);
  if (p.prayT > 0) this.glow(g, fx, fy - 10, 22, `rgba(255,230,150,${0.43 * p.prayT})`);
  const backSword = () => {
    const off = [0, 0, 2, -2][p.dir], tilt = [-0.62, 0.62, 0.55, -0.55][p.dir];
    g.save(); g.translate(fx + off + (p.dir === 0 ? 4 : 0), fy - (p.dir === 0 ? 20 : 15)); g.rotate(Math.PI + tilt);
    g.drawImage(cv(Art.sword), -2.5, -8, 5, 15); g.restore();
  };
  const showBack = p.hasSword && !attacking && !p.rolling && !spin && !guard;
  if (!posed) {
    // como siempre: andando, rodando o quieto
    const s = Art.hero[p.dir][p.moving ? 1 + Math.floor(p.anim * 7) % 2 : 0];
    const sx = Math.round(p.x - s.w / 2) - cx, sy = Math.round(p.y - s.h + 1) - cy;
    if (showBack && p.dir !== 1) backSword();
    if (p.rolling) { g.save(); g.translate(sx + 8, sy + 23); g.rotate((1 - p.rollT / 0.3) * Math.PI * 2 * (p.rollX < 0 ? -1 : 1)); g.drawImage(cv(s), -s.w / 2, -s.h * 0.75, s.w, s.h * 0.8); g.restore(); }
    else g.drawImage(cv(p.flash > 0 ? white(s) : s), sx, sy);
    if (showBack && p.dir === 1) backSword();
    return;
  }
  // ---- con algo en las manos: cuerpo sin brazos + brazos + arma
  const d = p.dir, [dvx, dvy] = POSE.dirV(d);
  let lean = 0, frame = p.moving ? 1 + Math.floor(p.anim * 7) % 2 : 0, layers = [], arms = [], behind = false;
  const sh = POSE.shoulders(d);
  if (attacking || guard) {
    let st;
    if (attacking) st = POSE.swing(p);
    else { const k = p.guardT / 0.2, [a0, a1] = POSE.arc(d, p.lastKind || 'slash'); const a = p.lastKind === 'thrust' ? Math.atan2(dvy, dvx) + 0.5 : a1 + Math.sign(a1 - a0) * 0.12; st = { hand: 6, ang: a, blade: a + (p.lastKind === 'thrust' ? 0.3 : 0.25 * Math.sign(a1 - a0)), lean: 1.2 * k, stride: k > 0.5 }; }
    lean = st.lean; if (st.stride) frame = 1;
    const ox = Math.round(dvx * lean), oy = Math.round(dvy * lean * 0.6);
    const chestX = fx + ox + (d === 2 ? -1 : d === 3 ? 0 : -0.5), chestY = fy + oy - 12;
    const hx = chestX + Math.cos(st.ang) * st.hand, hy = chestY + Math.sin(st.ang) * st.hand * 0.85;
    const bu = [Math.cos(st.blade), Math.sin(st.blade)];
    behind = d === 1 ? Math.sin(st.blade) < 0.5 : Math.sin(st.blade) < -0.45;
    layers.push(() => {
      if (st.smear) { const [s0, s1, al] = st.smear; POSE.smear(g, chestX, chestY, s0, s1, st.hand + 5, st.hand + 18, al); }
      if (st.lunge) { g.fillStyle = 'rgba(235,248,255,0.6)'; for (let k = 0; k < 3; k++) { const o = (k - 1) * 3, px = -dvy * o, py = dvx * o; g.fillRect(Math.round(hx + bu[0] * (20 + k * 2) + px), Math.round(hy + bu[1] * (20 + k * 2) + py), Math.abs(dvx) ? 5 : 1, Math.abs(dvy) ? 5 : 1); } }
      POSE.sword(g, hx, hy, st.blade);
    });
    arms.push(() => {
      POSE.arm(g, fx + ox + sh[1][0], fy + oy + sh[1][1], hx + bu[0] * 4, hy + bu[1] * 4, skin);
      POSE.arm(g, fx + ox + sh[0][0], fy + oy + sh[0][1], hx + bu[0] * 2, hy + bu[1] * 2, skin);
    });
  } else if (spin) {
    const t = 1 - p.spinT / 0.38, ang = -Math.PI / 2 + poseOut(t) * Math.PI * 2.15;
    const chestX = fx, chestY = fy - 12, hx = chestX + Math.cos(ang) * 7, hy = chestY + Math.sin(ang) * 5;
    behind = Math.sin(ang) < -0.2; frame = 1;
    layers.push(() => {
      POSE.smear(g, chestX, chestY, ang - Math.min(2.6, t * 8), ang, 9, 24, 1);
      POSE.sword(g, hx, hy, ang);
    });
    arms.push(() => {
      const bu = [Math.cos(ang), Math.sin(ang)];
      POSE.arm(g, fx + sh[1][0], fy + sh[1][1], hx + bu[0] * 4, hy + bu[1] * 4, skin);
      POSE.arm(g, fx + sh[0][0], fy + sh[0][1], hx + bu[0] * 2, hy + bu[1] * 2, skin);
    });
  } else if (gunOn) {
    const id = p.gunId, t = p.gunT, cd = p.gunCd;
    const a = Math.round(p.gunAng / (Math.PI / 8)) * (Math.PI / 8), left = Math.cos(a) < -0.01;
    const kick = { pistola: 2.5, rifle: 3.5, escopeta: 4, ballesta: 1.5, arco: 0 }[id] * Math.max(0, 1 - t / 0.11);
    lean = -kick * 0.35; // el retroceso echa el cuerpo atrás
    const ox = Math.round(Math.cos(a) * lean), oy = Math.round(Math.sin(a) * lean * 0.6);
    // el arma se sujeta delante del pecho; el arco, con el brazo estirado
    const reachG = id === 'arco' ? 5 : id === 'pistola' ? 6 : 3;
    const vert = Math.abs(Math.sin(a)), fore = vert > 0.7 ? 0.6 : vert > 0.35 ? 0.82 : 1;
    const gx = fx + ox + Math.cos(a) * reachG + (d === 2 ? -1 : 0) + sh[0][0] * 0.5 * (vert > 0.7 ? 1 : 0), gy = fy + oy - 12 + Math.sin(a) * reachG * 0.85 + (Math.sin(a) > 0.5 ? 1 : 0);
    const SC = 1.2, cs = Math.cos(a), sn = Math.sin(a);
    const toW = ([lx, ly]) => { const X = (lx - kick) * SC * fore, Y = ly * SC * (left ? -1 : 1); return [gx + X * cs - Y * sn, gy + X * sn + Y * cs]; };
    behind = Math.sin(a) < -0.4;
    layers.push(() => {
      g.save(); g.translate(Math.round(gx), Math.round(gy)); g.rotate(a); g.scale(SC * fore, left ? -SC : SC); g.translate(-kick, 0);
      g.shadowColor = 'rgba(12,8,6,0.85)'; g.shadowOffsetY = 1; g.shadowBlur = 0;
      const H = POSE.gun(g, id, t, cd); g.restore(); hands = H;
    });
    let hands = null;
    arms.push(() => {
      const H = hands; if (!H) return;
      const rear = toW(H.rear), front = toW(H.front);
      // la mano de atrás va al hombro del arma, la de delante al otro; de perfil, el brazo lejano queda detrás del arma
      POSE.arm(g, fx + ox + sh[1][0], fy + oy + sh[1][1], front[0], front[1], skin);
      POSE.arm(g, fx + ox + sh[0][0], fy + oy + sh[0][1], rear[0], rear[1], skin);
      if (!p.gunEj && ((id === 'pistola') || (id === 'rifle' && t / cd > 0.45) || (id === 'escopeta' && t / cd > 0.35))) { p.gunEj = true; this.eject(a, left, id === 'escopeta' ? '#c83a2a' : null); }
    });
  }
  const sp = (S.free2 || Art.hero)[d][frame];
  const ox = Math.round(dvx * lean), oy = Math.round(dvy * lean * 0.6);
  const sx = Math.round(p.x - sp.w / 2) - cx + ox, sy = Math.round(p.y - sp.h + 1) - cy + oy;
  // si el arma queda detrás del cuerpo, los brazos (que salen de los hombros) se ven igualmente por encima
  if (behind) layers.forEach(f => f());
  g.drawImage(cv(p.flash > 0 ? white(sp) : sp), sx, sy);
  if (!behind) layers.forEach(f => f());
  arms.forEach(f => f());
  if (showBack && gunOn && d !== 1) { /* la espada sigue a la espalda: se ve asomando */ }
};

// ---------------------------------------------------------------- efectos: polvo al dar la zancada, estrella al golpear, guardia
const _updPose = G.updatePlay;
G.updatePlay = function (dt) {
  const p = this.player, was = p ? p.atkT : 0;
  _updPose.call(this, dt);
  if (!p) return;
  if (p.atkT > 0) {
    p.lastKind = p.atkKind;
    const t = 1 - p.atkT / 0.24;
    if (!p._dust && t > 0.22) { p._dust = true; const [dx, dy] = POSE.dirV(p.dir); for (let i = 0; i < 4; i++) this.fx.push(Fx.spark(p.x - dx * 5 + this.rnd.gauss() * 3, p.y - 1, -dx * 25 + this.rnd.gauss() * 12, -8 - this.rnd.next() * 10, 0xc8b898, 0.35)); }
  } else { p._dust = false; if (was > 0 && p.hasSword) p.guardT = 0.2; }
  if (p.guardT > 0) p.guardT -= dt;
};
const _hitPose = G.swordHit;
G.swordHit = function (m, mult) {
  _hitPose.call(this, m, mult);
  // estrella de impacto
  const x = m.x, y = m.y - 10;
  this.fx.push(Fx.ring(x, y, 10, 0xffffff));
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + this.rnd.next() * 0.3, v = 70 + this.rnd.next() * 50; this.fx.push(Fx.spark(x, y, Math.cos(a) * v, Math.sin(a) * v, i % 2 ? 0xfff2a0 : 0xffffff, 0.22)); }
};
const _latePose = Q.late;
Q.late = function () {
  _latePose();
  G.drawPlayer = function (g, cx, cy) { return this.drawPlayerPose(g, cx, cy); };
};
