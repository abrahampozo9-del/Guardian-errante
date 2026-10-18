// ====================================================================== un Guardián más ágil
// Pequeños detalles de animación que hacen que el muñeco no parezca un bloque deslizándose:
// encoge y estira al arrancar, frenar o caer de una voltereta; la capa ondea al correr; levanta polvo al
// pisar; y la voltereta es una voltereta de verdad (se agacha, rueda hecho un ovillo y se levanta).
const AGIL = {};
AGIL.squash = function (p) {
  const q = p.sq; if (!q || q.t <= 0) return [1, 1];
  const k = q.t / q.dur, e = k * k; // vuelve rápido a su forma
  return [1 + (q.kx - 1) * e, 1 + (q.ky - 1) * e];
};
AGIL.kick = function (p, kx, ky, dur) { p.sq = { kx, ky, dur, t: dur }; };
// la capa: unos píxeles que se quedan atrás y ondean al correr de perfil
AGIL.cape = function (g, p, x0, y0, d, ph, idle) {
  const backX = d === 3 ? x0 + 4 : x0 + 15, out = d === 3 ? -1 : 1, amp = idle ? 0.45 : 0.8, base = idle ? 0.1 : 0.6, lift = idle ? 0.12 : 0.35;
  for (let j = 0; j < 7; j++) {
    const o = Math.round(j * lift + base + Math.sin(ph * Math.PI / 4 + j * 0.7) * amp);
    if (o <= 0) continue;
    g.fillStyle = j > 4 ? '#1e2228' : '#2c3038';
    g.fillRect(Math.round(backX + out * o) - (out < 0 ? 1 : 0), Math.round(y0 + 16 + j), 2, 1);
  }
};
// respiración: más rápida y más honda después de correr o pelear
AGIL.breath = p => Math.sin(p.brPh || 0);
// parpadeo cada pocos segundos (de frente y de perfil)
AGIL.blink = function (g, p, d, x, y, S, clock) {
  if (d === 1 || (clock + (p.blinkOff || 0)) % 3.7 > 0.13) return;
  g.fillStyle = S.skin;
  const eyes = d === 0 ? [6, 12] : d === 3 ? [12] : [6];
  for (const ex of eyes) { g.fillRect(x + ex, y + 8, 2, 2); g.fillStyle = '#3a2a20'; g.fillRect(x + ex, y + 9, 2, 1); g.fillStyle = S.skin; }
};
// el ovillo de la voltereta: 8 fotogramas, girando
AGIL.balls = {};
AGIL.ball = function (hero) {
  if (AGIL.balls[hero]) return AGIL.balls[hero];
  const { img, p, outline } = Px, S = Art.heroSets[hero], skin = parseInt(S.skin.slice(1), 16), hair = hero === 'oliver' ? 0x6a4426 : 0x2a1d16;
  const out = [];
  for (let i = 0; i < 8; i++) {
    const b = img(16, 16), a = i * Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const dx = x + 0.5 - 8, dy = y + 0.5 - 8.5, r = Math.hypot(dx, dy); if (r > 6.4) continue;
      const u = dx * ca + dy * sa, v = -dx * sa + dy * ca; // girado con el ovillo
      let c = r > 5.4 ? 0x1e2228 : 0x2c3038;
      if (Math.abs(v) < 1.7 && u < 3) c = 0xe2dccb; // el tabardo blanco
      if ((Math.abs(v) < 0.7 && u > -2.5 && u < 2) || (Math.abs(u + 0.3) < 0.7 && Math.abs(v) < 1.7)) c = 0xb02a20; // la cruz
      if (r < 6 && r > 4.6 && (x + y + i) % 3 === 0 && c === 0x2c3038) c = 0x4a525c; // malla
      p(b, x, y, c);
    }
    // la cabeza asoma por un lado del ovillo y las botas por el otro
    const hx = 8 + ca * 4.3, hy = 8.5 + sa * 4.3;
    for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) { const r = Math.hypot(x, y); if (r > 2.8) continue; const outer = x * ca + y * sa > 0.3; p(b, Math.round(hx + x), Math.round(hy + y), outer ? hair : skin); }
    const bx = 8 - ca * 5, by = 8.5 - sa * 5; p(b, Math.round(bx), Math.round(by), 0x2a1e14); p(b, Math.round(bx + 1), Math.round(by), 0x2a1e14); p(b, Math.round(bx), Math.round(by + 1), 0x2a1e14);
    outline(b, 0x0e0c0e); out.push(b);
  }
  return (AGIL.balls[hero] = out);
};
AGIL.drawRoll = function (g, p, fx, fy, S) {
  const t = 1 - p.rollT / 0.3, d = p.dir;
  const fl = im => cv(p.flash > 0 ? white(im) : im);
  if (t < 0.14 || t > 0.86) {
    // agacharse antes de rodar y levantarse al final
    const k = t < 0.14 ? t / 0.14 : (1 - t) / 0.14, s = Art.hero[d][0];
    const ky = 1 - 0.3 * k, kx = 1 + 0.16 * k, W = Math.round(s.w * kx), H = Math.round(s.h * ky);
    g.drawImage(fl(s), Math.round(fx - W / 2), Math.round(fy + 1 - H), W, H);
    return;
  }
  const prog = (t - 0.14) / 0.72, sign = Math.abs(p.rollX) > 0.3 ? Math.sign(p.rollX) : (p.rollY < 0 ? -1 : 1);
  const balls = AGIL.ball(this.hero || G.hero), i = ((Math.floor(prog * 8) * sign) % 8 + 8) % 8;
  const hop = Math.round(Math.sin(prog * Math.PI) * 2);
  g.drawImage(fl(balls[i]), Math.round(fx - 8), Math.round(fy - 15 - hop));
};

// ---------------------------------------------------------------- los momentos que se notan
const _updAg = G.updatePlay;
G.updatePlay = function (dt) {
  const p = this.player;
  const wasMov = p && p.moving, wasRoll = p && p.rolling, sgn0 = p ? Math.sign(p.vx || 0) : 0, wf0 = p ? Math.floor(p.anim * 15) % 8 : 0;
  _updAg.call(this, dt);
  if (!p || this.st !== ST.PLAY) return;
  if (p.sq && p.sq.t > 0) p.sq.t -= dt;
  // jadeo: sube corriendo, peleando o rodando, y baja poco a poco
  const run = Math.hypot(p.vx || 0, p.vy || 0) > 60 || p.atkT > 0 || p.rolling;
  p.exert = Math.max(0, Math.min(1, (p.exert || 0) + (run ? dt * 0.12 : -dt * 0.1)));
  const ph0 = p.brPh || 0; p.brPh = ph0 + dt * (2.1 + p.exert * 4.5);
  // vaho al soltar el aire si hace frío (de noche, en la sierra, en la cueva o abajo)
  const cold = this.world.id === 'sierra' || this.world.id === 'pb4' || this.world.id === 'abajo' || (this.world.outdoor && this.isNight());
  if (cold && p.dir !== 1 && Math.floor(ph0 / (Math.PI * 2)) !== Math.floor(p.brPh / (Math.PI * 2))) {
    const fx = p.dir === 2 ? -6 : p.dir === 3 ? 6 : 3;
    for (let i = 0; i < 3; i++) this.fx.push(Fx.spark(p.x + fx, p.y - 19, (fx > 0 ? 1 : fx < 0 ? -1 : 0) * (8 + i * 4) + this.rnd.gauss() * 3, -6 - i * 2, 0xdce6f0, 0.6 + i * 0.15));
  }
  if (wasRoll && !p.rolling) { AGIL.kick(p, 1.14, 0.84, 0.13); p.vx = p.rollX * 70; p.vy = p.rollY * 70; for (let i = 0; i < 5; i++) this.fx.push(Fx.spark(p.x + this.rnd.gauss() * 4, p.y, this.rnd.gauss() * 25, -10 - this.rnd.next() * 12, 0xc8b898, 0.35)); }
  else if (!p.rolling && !wasMov && p.moving) AGIL.kick(p, 1.08, 0.92, 0.09);
  else if (!p.rolling && wasMov && !p.moving) AGIL.kick(p, 1.06, 0.93, 0.09);
  else if (p.moving && sgn0 && Math.sign(p.vx || 0) === -sgn0 && Math.abs(p.vx) > 20) AGIL.kick(p, 0.93, 1.05, 0.08); // media vuelta
  // polvo al pisar (cuando el pie toca el suelo, a buen paso)
  if (p.moving && !p.rolling && Math.hypot(p.vx || 0, p.vy || 0) > 60 && this.world.outdoor) {
    const wf = Math.floor(p.anim * 15) % 8;
    if (wf !== wf0 && (wf === 2 || wf === 6) && this.rnd.next() < 0.7) this.fx.push(Fx.spark(p.x + (wf === 2 ? 2 : -2), p.y, -(p.vx || 0) * 0.15 + this.rnd.gauss() * 6, -6 - this.rnd.next() * 6, 0xb8a888, 0.3));
  }
};
const _enterAg = G.enter;
G.enter = function (id, x, y, dir) { const p = this.player; if (p) { p.vx = 0; p.vy = 0; p.sq = null; } return _enterAg.call(this, id, x, y, dir); };

// ---------------------------------------------------------------- la lumbre del salón: luz que baila en la estancia
// La chimenea encendida reparte una luz cálida que tiembla por las paredes y el suelo, con manchas que se
// mueven delante del hogar, alguna chispa que sube y la sombra de quien esté cerca alargándose hacia atrás.
AGIL.fireOf = w => { if (!w || w.outdoor) return null; const pr = w.props.find(x => x.id === 'chimenea'); return pr ? [pr.left() + 12, pr.top() + 35] : null; };
AGIL.flick = t => 0.78 + 0.12 * Math.sin(t * 7.3) + 0.08 * Math.sin(t * 13.1 + 1.3) + 0.06 * Math.sin(t * 23.7 + 0.4) + 0.04 * Math.sin(t * 41.9);
G.drawFire = AGIL.drawFire = function (g, cx, cy) {
  const w = this.world, F = AGIL.fireOf(w); if (!F) return;
  const t = this.clock, f = AGIL.flick(t), x = F[0] - cx, y = F[1] - cy;
  if (x < -200 || x > WW + 200 || y < -200 || y > WH + 200) return;
  const dk = Math.min(0.84, this.darkness() + (this.stormDark ? this.stormDark() : 0)), night = 0.6 + dk * 0.8;
  g.save();
  // sombras alargadas de quien esté cerca del fuego (antes que la luz, para que la luz las suavice)
  g.globalCompositeOperation = 'multiply';
  for (const e of [this.player, ...w.npcs]) {
    if (!e) continue;
    const ex = e.x - cx, ey = e.y - cy, dx = ex - x, dy = ey - y, d = Math.hypot(dx, dy);
    if (d < 12 || d > 170) continue;
    const k = (1 - d / 170) * f, L = 10 + 26 * (1 - d / 170), ux = dx / d, uy = dy / d;
    g.save(); g.translate(ex + ux * L * 0.5, ey + uy * L * 0.3); g.rotate(Math.atan2(uy, ux));
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, L * 0.6);
    gr.addColorStop(0, `rgba(60,34,22,${0.45 * k})`); gr.addColorStop(1, 'rgba(60,34,22,0)');
    g.fillStyle = gr; g.scale(1, 0.32); g.beginPath(); g.arc(0, 0, L * 0.6, 0, Math.PI * 2); g.fill(); g.restore();
  }
  // penumbra lejos del fuego: el borde de la luz se mueve con las llamas
  const Rd = 190 * (0.93 + 0.08 * f);
  let gd = g.createRadialGradient(x, y, 20, x, y, Rd);
  gd.addColorStop(0, 'rgba(255,255,255,0)'); gd.addColorStop(0.45, `rgba(190,170,170,${0.25 * night})`); gd.addColorStop(1, `rgba(110,95,110,${0.55 * night})`);
  g.fillStyle = gd; g.fillRect(0, 0, WW, WH);
  // luz cálida que tiembla
  g.globalCompositeOperation = 'screen';
  const R = 130 * (0.95 + 0.06 * f);
  let gr = g.createRadialGradient(x, y, 2, x, y, R);
  gr.addColorStop(0, `rgba(255,170,80,${0.6 * f * night})`); gr.addColorStop(0.35, `rgba(255,120,50,${0.28 * f * night})`); gr.addColorStop(1, 'rgba(255,90,30,0)');
  g.fillStyle = gr; g.fillRect(x - R, y - R, R * 2, R * 2);
  // manchas de luz que bailan en el suelo delante del hogar
  for (let i = 0; i < 4; i++) {
    const a = t * (1.3 + i * 0.37) + i * 2.1, px = x + 22 + i * 13 + Math.sin(a) * 5, py = y + 10 + Math.cos(a * 1.3) * 7 + (i % 2) * 8, r = 14 + 6 * Math.sin(a * 2.1 + i);
    gr = g.createRadialGradient(px, py, 0, px, py, r);
    gr.addColorStop(0, `rgba(255,190,110,${0.2 * f * night})`); gr.addColorStop(1, 'rgba(255,150,70,0)');
    g.fillStyle = gr; g.fillRect(px - r, py - r, r * 2, r * 2);
  }
  // un tinte cálido en toda la estancia que sube y baja con las llamas
  g.globalCompositeOperation = 'soft-light';
  g.fillStyle = `rgba(255,140,60,${(0.07 + 0.06 * (f - 0.78)) * night})`; g.fillRect(0, 0, WW, WH);
  g.restore();
};
const _updFire = G.updatePlay;
G.updatePlay = function (dt) {
  _updFire.call(this, dt);
  const F = AGIL.fireOf(this.world);
  if (F && this.st === ST.PLAY && this.rnd.next() < dt * 3) this.fx.push(Fx.spark(F[0] + this.rnd.gauss() * 2, F[1] - 2, this.rnd.gauss() * 6, -18 - this.rnd.next() * 14, this.rnd.next() < 0.5 ? 0xffb040 : 0xff7020, 0.6 + this.rnd.next() * 0.4));
};
const _lateAg = Q.late;
Q.late = function () {
  _lateAg();
  const _vig = G.vignette;
  G.vignette = function (g) { if (!this.padel) this.drawFire(g, this.camRX, this.camRY); return _vig.call(this, g); };
};
