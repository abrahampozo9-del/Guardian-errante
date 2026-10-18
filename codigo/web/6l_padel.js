// ====================================================================== pádel en el Hotel Los Nogales
// Dos contra dos: el Guardián y Doña Pura contra Manuel y Elena. Pista vista de lado (20 × 10 m),
// red en el centro, cristales al fondo. Saque cruzado, voleas, rebotes en el cristal, doble bote,
// 15-30-40 con punto de oro y partido a 3 juegos. Espada: golpe plano. Rodar: globo.
ST.PADEL = 'PADEL';
const PD = { S: 12, OX: 24, OY: 34, W: 20, H: 10, NET: 0.88, G: 8.5, WALL: 3.2, SPD: 5.2, AISPD: 4.5 };
const pdx = x => PD.OX + x * PD.S, pdy = y => PD.OY + y * PD.S;
const PADEL_NOMBRES = ['Tú y Doña Pura', 'Manuel y Elena'];

G.startPadel = function (bet) {
  const mk = (name, set, team, x, y, ai, err) => ({ name, set, team, x, y, ai, err, dir: team === 0 ? 3 : 2, anim: 0, swing: 0, homeY: y, moving: false });
  const P = Art.people;
  this.padel = {
    bet, t: 0, games: [0, 0], pts: [0, 0], server: 0, point: 0, phase: 'serve', phaseT: 0, msg: '', msgT: 0, ball: null, trail: [],
    pl: [mk('Tú', Art.hero, 0, 4, 7.5, false, 0), mk('Doña Pura', P.gerente, 0, 7.5, 2.5, true, 0.1), mk('Manuel', P.manuel, 1, 16, 2.5, true, 0.12), mk('Elena', P.monitora, 1, 12.5, 7.5, true, 0.14)],
  };
  this.st = ST.PADEL; Sound.music && Sound.music('calma');
  this.padelSetupServe();
};

// colocación para el saque: el que saca detrás de la línea, el que resta en diagonal
G.padelSetupServe = function () {
  const P = this.padel, even = (P.pts[0] + P.pts[1]) % 2 === 0, T = P.server;
  // el que saca está a su derecha en los puntos pares (equipo 0 mira a la derecha: su derecha es y > 5)
  const sy = T === 0 ? (even ? 7.5 : 2.5) : (even ? 2.5 : 7.5);
  const ry = 10 - sy;
  const srv = T === 0 ? P.pl[0] : P.pl[2], mate = T === 0 ? P.pl[1] : P.pl[3];
  const recTeam = 1 - T, recs = P.pl.filter(q => q.team === recTeam);
  // en el equipo que resta, resta el que esté en el lado de la diagonal (el jugador, si es su lado)
  let rec = recs.find(q => !q.ai && Math.sign(q.homeY - 5) === Math.sign(ry - 5)) || recs.find(q => Math.sign(q.homeY - 5) === Math.sign(ry - 5)) || recs[0];
  const recMate = recs.find(q => q !== rec);
  srv.x = T === 0 ? 1.6 : 18.4; srv.y = sy; srv.homeY = sy;
  mate.x = T === 0 ? 7.6 : 12.4; mate.y = ry; mate.homeY = ry;
  rec.x = recTeam === 0 ? 2.4 : 17.6; rec.y = ry; rec.homeY = ry;
  recMate.x = recTeam === 0 ? 5 : 15; recMate.y = sy; recMate.homeY = sy;
  P.serverP = srv; P.receiver = rec;
  P.ball = { x: srv.x + (T === 0 ? 0.4 : -0.4), y: srv.y, z: 1, vx: 0, vy: 0, vz: 0, held: true, side: T, lastTeam: T, bounces: 0, serve: true, box: { x0: recTeam === 0 ? 3.05 : 10, x1: recTeam === 0 ? 10 : 16.95, y0: ry < 5 ? 0 : 5, y1: ry < 5 ? 5 : 10 } };
  P.phase = 'serve'; P.phaseT = 0; P.trail = [];
};

// lanzar la bola hacia (tx, ty) con un golpe de tipo k ('plano', 'globo', 'remate', 'saque')
G.padelLaunch = function (b, tx, ty, k) {
  const dx = tx - b.x, dy = ty - b.y, dist = Math.hypot(dx, dy) || 1;
  const sp = k === 'globo' ? 6 : k === 'remate' ? 14 : k === 'saque' ? 9 : 10.5;
  let T = dist / sp;
  for (let i = 0; i < 10; i++) {
    const vz = (PD.G * T * T / 2 - b.z) / T, vx = dx / T, tn = Math.abs(vx) > 0.01 ? (10 - b.x) / vx : 99;
    const zn = tn > 0 && tn < T ? b.z + vz * tn - PD.G * tn * tn / 2 : 9;
    if (zn > PD.NET + (k === 'globo' ? 1.8 : 0.22)) break;
    T *= 1.12;
  }
  b.vx = dx / T; b.vy = dy / T; b.vz = (PD.G * T * T / 2 - b.z) / T;
};

// ¿puede este jugador darle ahora?
G.padelCanHit = function (q) {
  const b = this.padel.ball;
  if (!b || b.held || this.padel.phase !== 'rally') return false;
  if (b.side !== q.team || b.lastTeam === q.team) return false;
  if (b.serve && b.bounces === 0) return false; // el resto, siempre después del bote
  return Math.hypot(q.x - b.x, q.y - b.y) < 1.15 && b.z < 2.4;
};
G.padelHit = function (q, kind, aimY) {
  const P = this.padel, b = P.ball, R = this.rnd;
  const dirX = q.team === 0 ? 1 : -1;
  if (b.z > 1.7 && kind !== 'globo') kind = 'remate';
  let tx = 10 + dirX * (kind === 'globo' ? 7.6 + R.next() * 1.4 : kind === 'remate' ? 4 + R.next() * 3.5 : 3.6 + R.next() * 4.2);
  let ty;
  if (aimY !== undefined && Math.abs(aimY) > 0.3) ty = 5 + aimY * 3.8 + (R.next() - 0.5) * 1.2;
  else ty = (q.y < 5 ? 6.8 : 3.2) + (R.next() - 0.5) * 2.4; // cruzado, por defecto
  ty = Math.max(0.7, Math.min(9.3, ty));
  // errores de la IA (y alguno tuyo si le das muy abajo o muy lejos)
  let err = q.ai ? q.err : (b.z < 0.2 ? 0.25 : 0.03);
  if (R.next() < err) { if (R.next() < 0.5) tx = 10 + dirX * (10.6 + R.next() * 2); else { this.padelLaunch(b, tx, ty, kind); b.vz *= 0.45; b.lastTeam = q.team; b.bounces = 0; b.serve = false; q.swing = 0.25; Sound.play('swing'); return; } }
  this.padelLaunch(b, tx, ty, kind);
  b.lastTeam = q.team; b.bounces = 0; b.serve = false; b.wall = 0;
  q.swing = 0.25; Sound.play('swing');
};

G.padelPointTo = function (team, why) {
  const P = this.padel; if (P.phase !== 'rally' && P.phase !== 'serveFly') return;
  P.phase = 'point'; P.phaseT = 0; P.pointTeam = team;
  P.msg = (team === 0 ? '¡Punto vuestro! ' : 'Punto de ellos. ') + why; P.msgT = 1.6;
  Sound.play(team === 0 ? 'pickup' : 'hit');
};
G.padelScore = function () {
  const P = this.padel, t = P.pointTeam;
  P.pts[t]++;
  if (P.pts[t] >= 4) { // 40 y punto (con punto de oro en el 40-40)
    P.games[t]++; P.pts = [0, 0]; P.server = 1 - P.server;
    if (P.games[t] >= 3) { this.padelEnd(t === 0); return; }
    P.msg = 'Juego para ' + (t === 0 ? 'vosotros' : 'Manuel y Elena') + '. ' + P.games[0] + ' – ' + P.games[1]; P.msgT = 1.8;
  }
  this.padelSetupServe();
};
G.padelEnd = function (win) {
  const P = this.padel, p = this.player;
  this.padel = null; this.st = ST.PLAY;
  // el partido dura una hora y cansa
  this.day = (this.day + 1 / 24) % 1; if (this.addFatigue) this.addFatigue(14);
  const res = P.games[0] + ' – ' + P.games[1];
  const first = win && !this.flags.has('padel_win');
  if (win) {
    this.flags.add('padel_win'); if (P.bet) this.addDuros(P.bet * 2);
    this.gainXp(first ? 200 : 80, p.x, p.y - 30);
    if (first) p.pts += 1;
    this.say('Manuel', '¡' + res + '! Ni el fin del mundo te quita el revés, ¿eh?', P.bet ? 'Toma, lo apostado y lo mío. (+' + nDuros(P.bet * 2) + ')' : 'La próxima nos apostamos algo, que así no tiene gracia.', first ? 'Hacía años que no perdía en mi pista. Te has ganado esto. (+1 punto de habilidad)' : '');
  } else {
    if (P.bet) this.duros = Math.max(0, (this.duros || 0) - P.bet);
    this.say('Manuel', res + '. Aquí la pista la conocemos de memoria, no te sientas mal.', P.bet ? 'Los duros, para la casa. (−' + nDuros(P.bet) + ')' : 'Cuando quieras la revancha, ya sabes dónde está la red.');
  }
  this.dlg = this.dlg.filter(l => l[1]);
  this.save();
};

// ---------------------------------------------------------------- simulación
G.padelBallStep = function (b, dt, sim) {
  b.vz -= PD.G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
  const side = b.x < 10 ? 0 : 1;
  if (side !== b.side) {
    if (b.z < PD.NET) return sim ? 'net' : this.padelPointTo(1 - b.lastTeam, 'Red.'), 'net';
    b.side = side; b.bounces = 0;
  }
  if (b.z <= 0 && b.vz < 0) {
    b.z = 0; b.vz = -b.vz * 0.6; b.vx *= 0.85; b.vy *= 0.85;
    if (Math.abs(b.vz) < 0.8) b.vz = 0.8;
    if (b.side === b.lastTeam) return sim ? 'own' : (this.padelPointTo(1 - b.lastTeam, 'No pasó la red.'), 'own');
    if (b.serve && b.bounces === 0 && !sim) { const x = b.box; if (!(b.x >= x.x0 && b.x <= x.x1 && b.y >= x.y0 && b.y <= x.y1)) { this.padelPointTo(1 - b.lastTeam, 'Falta de saque.'); return 'fault'; } }
    b.bounces++;
    if (!sim) Sound.play('step');
    if (b.bounces >= 2) return sim ? 'dead' : (this.padelPointTo(b.lastTeam, 'Doble bote.'), 'dead');
  }
  // cristales y verja
  const wallHit = (pos, lim) => {
    if (b.bounces === 0 && b.side !== b.lastTeam) return sim ? 'out' : (this.padelPointTo(1 - b.lastTeam, 'Directa a la pared.'), 'out');
    if (b.z > PD.WALL) return sim ? 'out' : (this.padelPointTo(b.lastTeam, 'Se fue por encima del cristal.'), 'out');
    return null;
  };
  if (b.x < 0 || b.x > PD.W) { const r = wallHit(); if (r) return r; b.vx = -b.vx * 0.55; b.x = Math.max(0, Math.min(PD.W, b.x)); b.vz *= 0.8; if (!sim) Sound.play('hit'); }
  if (b.y < 0 || b.y > PD.H) { const r = wallHit(); if (r) return r; b.vy = -b.vy * 0.55; b.y = Math.max(0, Math.min(PD.H, b.y)); if (!sim) Sound.play('hit'); }
  return null;
};
// dónde le va a poder dar este equipo (para que la IA se mueva)
G.padelPredict = function (team, volley) {
  const b0 = this.padel.ball; if (!b0 || b0.held) return null;
  const b = Object.assign({}, b0, { box: b0.box });
  for (let t = 0; t < 3; t += 0.03) {
    const r = this.padelBallStep(b, 0.03, true); if (r) return null;
    if (b.side === team && b.lastTeam !== team && b.z > 0.25 && b.z < 1.6 && (b.bounces >= 1 || (volley && !b.serve && Math.abs(b.x - 10) < 4.5))) return [b.x, b.y, t];
  }
  return null;
};
G.updatePadel = function (dt) {
  const P = this.padel; if (!P) { this.st = ST.PLAY; return; }
  P.t += dt; P.phaseT += dt; if (P.msgT > 0) P.msgT -= dt;
  if (this.pressed('Escape', 'KeyP')) {
    this.ask('Manuel', '¿Lo dejamos? Si te vas, el partido cuenta como perdido.', ['Seguir jugando.', 'Abandonar el partido.'], k => { if (k === 1) this.padelEnd(false); else this.st = ST.PADEL; });
    return;
  }
  const me = P.pl[0], b = P.ball;
  // tu jugador
  let ix = this.stick.x, iy = this.stick.y;
  if (this.down('ArrowLeft', 'KeyA')) ix -= 1; if (this.down('ArrowRight', 'KeyD')) ix += 1;
  if (this.down('ArrowUp', 'KeyW')) iy -= 1; if (this.down('ArrowDown', 'KeyS')) iy += 1;
  const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
  const canMove = !(P.phase === 'serve' && P.serverP === me);
  if (canMove && il > 0.15) { me.x += ix * PD.SPD * dt; me.y += iy * PD.SPD * dt; me.moving = true; me.anim += dt; } else me.moving = false;
  const hitKey = this.pressed('Space', 'KeyJ', 'KeyE', 'Tap'), lobKey = this.pressed('ShiftLeft', 'ShiftRight', 'KeyX', 'Roll');
  if (hitKey || lobKey) { me.swingBuf = 0.28; me.kind = lobKey ? 'globo' : 'plano'; me.aimY = iy; me.swing = 0.22; }
  // el saque
  if (P.phase === 'serve') {
    const s = P.serverP;
    if (P.phaseT > 0.4 && ((s === me && me.swingBuf > 0) || (s.ai && P.phaseT > 1.1))) {
      const x = b.box, R = this.rnd; b.held = false;
      this.padelLaunch(b, x.x0 + (x.x1 - x.x0) * (0.3 + R.next() * 0.5), x.y0 + 0.8 + R.next() * 3.4, 'saque');
      s.swing = 0.25; me.swingBuf = 0; Sound.play('swing'); P.phase = 'rally';
    }
  }
  if (me.swingBuf > 0) { me.swingBuf -= dt; if (this.padelCanHit(me)) { this.padelHit(me, me.kind, me.aimY); me.swingBuf = 0; } }
  // los demás
  for (const q of P.pl) {
    q.swing = Math.max(0, q.swing - dt);
    if (!q.ai) continue;
    let tx = q.team === 0 ? 6.5 : 13.5, ty = q.homeY;
    if (P.phase === 'rally' && b && !b.held) {
      const mates = P.pl.filter(o => o.team === q.team);
      const pr = this.padelPredict(q.team, Math.abs(q.x - 10) < 3.5);
      if (pr) {
        // persigue el que esté en esa mitad de la pista (en tu equipo, Doña Pura deja tu mitad para ti)
        const half = pr[1] < 5 ? 0 : 1, mine = (q.homeY < 5 ? 0 : 1) === half;
        const other = mates.find(o => o !== q), closer = Math.hypot(q.x - pr[0], q.y - pr[1]) <= Math.hypot(other.x - pr[0], other.y - pr[1]);
        if (q.team === 0 ? mine : (mine || closer)) { tx = pr[0] + (q.team === 0 ? -0.3 : 0.3); ty = pr[1]; }
      }
      if (this.padelCanHit(q)) {
        const opp = P.pl.filter(o => o.team !== q.team), atNet = opp.some(o => Math.abs(o.x - 10) < 3);
        this.padelHit(q, atNet && this.rnd.next() < 0.45 ? 'globo' : 'plano');
      }
    } else if (P.phase === 'serve') { tx = q.x; ty = q.y; }
    const dx = tx - q.x, dy = ty - q.y, d = Math.hypot(dx, dy), sp = PD.AISPD * dt;
    if (d > 0.08) { q.x += dx / d * Math.min(d, sp); q.y += dy / d * Math.min(d, sp); q.moving = true; q.anim += dt; } else q.moving = false;
  }
  // cada uno en su campo
  for (const q of P.pl) { q.x = q.team === 0 ? Math.max(0.3, Math.min(9.7, q.x)) : Math.max(10.3, Math.min(19.7, q.x)); q.y = Math.max(0.3, Math.min(9.7, q.y)); }
  // la bola
  if (b && !b.held && (P.phase === 'rally')) {
    for (let i = 0; i < 4 && P.phase === 'rally'; i++) this.padelBallStep(b, dt / 4, false);
    P.trail.push([b.x, b.y, b.z]); if (P.trail.length > 6) P.trail.shift();
  } else if (b && b.held) { b.x = P.serverP.x + (P.serverP.team === 0 ? 0.4 : -0.4); b.y = P.serverP.y; b.z = 1 + Math.sin(P.t * 6) * 0.15; }
  if (P.phase === 'point' && P.phaseT > 1.4) this.padelScore();
};

// ---------------------------------------------------------------- dibujo
G.drawPadel = function (g) {
  const P = this.padel, S = PD.S;
  g.fillStyle = '#141a22'; g.fillRect(0, 0, WW, WH);
  // gradas y fondo del hotel
  g.fillStyle = '#1e2630'; g.fillRect(0, 0, WW, PD.OY - 10);
  for (let x = 0; x < WW; x += 6) { g.fillStyle = (x / 6) % 2 ? '#26303c' : '#222b36'; g.fillRect(x, 4, 5, PD.OY - 16); }
  // suelo de la pista
  g.fillStyle = '#2c5d8f'; g.fillRect(pdx(0), pdy(0), 20 * S, 10 * S);
  g.fillStyle = '#28568a'; for (let y = 0; y < 10 * S; y += 2) for (let x = (y >> 1) % 4; x < 20 * S; x += 4) g.fillRect(pdx(0) + x, pdy(0) + y, 1, 1);
  g.fillStyle = '#e8eef4';
  g.fillRect(pdx(0), pdy(0), 20 * S, 1); g.fillRect(pdx(0), pdy(10) - 1, 20 * S, 1); g.fillRect(pdx(0), pdy(0), 1, 10 * S); g.fillRect(pdx(20) - 1, pdy(0), 1, 10 * S);
  g.fillRect(pdx(3.05), pdy(0), 1, 10 * S); g.fillRect(pdx(16.95), pdy(0), 1, 10 * S); g.fillRect(pdx(3.05), pdy(5), (16.95 - 3.05) * S, 1);
  // cuadro del saque
  if (P.ball && P.ball.serve && (P.phase === 'serve' || P.ball.bounces === 0)) { const x = P.ball.box; g.fillStyle = 'rgba(255,230,120,0.12)'; g.fillRect(pdx(x.x0), pdy(x.y0), (x.x1 - x.x0) * S, (x.y1 - x.y0) * S); }
  // cristales (fondos y los primeros metros de los lados) y verja en medio
  g.fillStyle = 'rgba(150,210,240,0.35)';
  g.fillRect(pdx(0) - 4, pdy(0) - 4, 4, 10 * S + 8); g.fillRect(pdx(20), pdy(0) - 4, 4, 10 * S + 8);
  for (const yy of [pdy(0) - 4, pdy(10)]) { g.fillRect(pdx(0), yy, 2 * S, 4); g.fillRect(pdx(18), yy, 2 * S, 4); g.fillStyle = '#3a3e46'; g.fillRect(pdx(2), yy, 16 * S, 4); g.fillStyle = '#5a606a'; for (let x = pdx(2); x < pdx(18); x += 3) g.fillRect(x, yy + 1, 1, 2); g.fillStyle = 'rgba(150,210,240,0.35)'; }
  g.fillStyle = '#d8f0ff'; g.fillRect(pdx(0) - 4, pdy(0) - 4, 1, 10 * S + 8); g.fillRect(pdx(20) + 3, pdy(0) - 4, 1, 10 * S + 8);
  // sombra de la red y la red
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(pdx(10) + 1, pdy(0), 3, 10 * S);
  // entidades por profundidad
  const ents = P.pl.map(q => ({ y: q.y, q }));
  const b = P.ball; if (b) ents.push({ y: b.y, b });
  ents.push({ y: 5.0001, net: true });
  ents.sort((a, c) => a.y - c.y);
  // la red se dibuja como una banda vertical que cruza la pista: se pinta antes que todo lo que esté "delante"
  const drawNet = () => {
    const x = pdx(10);
    g.fillStyle = '#1a1a1e'; g.fillRect(x - 1, pdy(0) - 10, 2, 10 * S + 10);
    g.fillStyle = 'rgba(230,230,230,0.5)'; for (let y = pdy(0) - 8; y < pdy(10); y += 3) g.fillRect(x - 1, y, 2, 1);
    g.fillStyle = '#f0f0f0'; g.fillRect(x - 1, pdy(0) - 10, 2, 1);
    g.fillStyle = '#4a4a52'; g.fillRect(x - 2, pdy(0) - 12, 4, 4); g.fillRect(x - 2, pdy(10) - 2, 4, 4);
  };
  drawNet();
  if (b) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(Math.round(pdx(b.x)) - 2, Math.round(pdy(b.y)) - 1, 4, 2); }
  for (const e of ents) {
    if (e.q) {
      const q = e.q, set = q.set, f = q.moving ? 1 + (Math.floor(q.anim * 8) % 2) : 0, im = set[q.dir][f];
      const c = cv(im), sx = Math.round(pdx(q.x) - im.w / 2), sy = Math.round(pdy(q.y) - im.h + 2);
      g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(sx + 3, Math.round(pdy(q.y)) - 1, im.w - 6, 2);
      g.drawImage(c, sx, sy);
      // la pala
      const hx = Math.round(pdx(q.x) + (q.team === 0 ? 6 : -7)), hy = Math.round(pdy(q.y) - 12 - (q.swing > 0 ? 4 : 0));
      g.fillStyle = '#222'; g.fillRect(hx, hy + 4, 1, 3);
      g.fillStyle = q.team === 0 ? '#c83a2a' : '#2a6ac8'; g.fillRect(hx - 2, hy - 1, 5, 6); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(hx - 1, hy, 1, 2);
      if (q === P.pl[0]) { g.fillStyle = GOLD; g.fillRect(Math.round(pdx(q.x)) - 1, sy - 5, 3, 2); }
    } else if (e.b) {
      const bx = Math.round(pdx(b.x)), by = Math.round(pdy(b.y) - b.z * S * 0.85);
      g.fillStyle = 'rgba(230,240,120,0.25)'; for (const [tx, ty, tz] of P.trail) g.fillRect(Math.round(pdx(tx)) - 1, Math.round(pdy(ty) - tz * S * 0.85) - 1, 2, 2);
      g.fillStyle = '#d8e840'; g.fillRect(bx - 1, by - 1, 3, 3); g.fillStyle = '#ffffa0'; g.fillRect(bx - 1, by - 1, 1, 1);
    }
  }
};
G.uiPadel = function (g) {
  const P = this.padel, pts = ['0', '15', '30', '40'];
  this.panel(g, VW / 2 - 120, 4, 240, 26, false);
  g.font = FT(7.4);
  this.text(g, PADEL_NOMBRES[0], VW / 2 - 112, 15, P.server === 0 ? GOLD : PAPER);
  const r = PADEL_NOMBRES[1]; this.text(g, r, VW / 2 + 112 - g.measureText(r).width, 15, P.server === 1 ? GOLD : PAPER);
  g.font = FT(10); this.center(g, P.games[0] + ' – ' + P.games[1], 17, PAPER);
  g.font = FB(6.6); const ps = (P.pts[0] === 3 && P.pts[1] === 3) ? '40 – 40 · punto de oro' : pts[Math.min(3, P.pts[0])] + ' – ' + pts[Math.min(3, P.pts[1])];
  this.center(g, ps, 26, SOFT);
  if (P.msgT > 0) { g.font = FT(9); const w = g.measureText(P.msg).width; this.panel(g, VW / 2 - w / 2 - 10, VH / 2 - 14, w + 20, 20, false); this.center(g, P.msg, VH / 2 - 0.5, P.msg.startsWith('¡') ? GOLD : PAPER); }
  g.font = FB(5.8);
  const hint = P.phase === 'serve' && P.serverP === P.pl[0] ? (this.touch ? 'Toca Espada para sacar' : 'Espacio para sacar') : (this.touch ? 'Espada: golpe · Rodar: globo · la cruceta apunta' : 'Espacio: golpe · Mayús: globo · las flechas apuntan · Esc: dejarlo');
  this.center(g, hint, VH - 6, DIM);
};

// ---------------------------------------------------------------- enganches con el resto del juego
const _useP = G.use;
G.use = function (pr) {
  if (pr.id !== 'padel') return _useP.call(this, pr);
  const p = this.player;
  this.say('Manuel', '¡Hombre! ¿Un partidito? Tú con Doña Pura, contra Elena y yo. A tres juegos, con punto de oro.', 'Aquí se apuestan duros. Tú dirás.');
  this.dlgEnd = () => this.ask('Manuel', 'Llevas ' + nDuros(this.duros || 0) + '.', ['Jugar apostando 10 duros.', 'Jugar por gusto.', 'Ahora no.'], k => {
    if (k === 2) return;
    if (k === 0 && (this.duros || 0) < 10) { this.say('Manuel', 'Con lo que llevas no te llega ni para apostar. Jugamos por gusto, anda.'); this.dlgEnd = () => this.startPadel(0); return; }
    this.startPadel(k === 0 ? 10 : 0);
  });
};
const _updP = G.update;
G.update = function (dt) {
  if (this.st === ST.PADEL) { if (this.toastT > 0) this.toastT -= dt; this.clock += dt; this.updatePadel(dt); return; }
  _updP.call(this, dt);
};
const _lateP = Q.late;
Q.late = function () {
  _lateP();
  const _rw = G.renderWorld; G.renderWorld = function (g) { if (this.padel) return this.drawPadel(g); return _rw.call(this, g); };
  const _hud = G.uiHud; G.uiHud = function (g) { if (this.padel) return this.uiPadel(g); return _hud.call(this, g); };
};
