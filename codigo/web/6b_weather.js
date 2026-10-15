// ====================================================================== tormentas apocalípticas
// De vez en cuando el cielo se rompe: lluvia oblicua, cielo verde-negro, rayos, un resplandor rojo
// en el horizonte y, al amainar, un haz de luz que se abre paso entre las nubes.
const Wx = {
  s: 0,            // intensidad actual 0..1
  target: 0,       // intensidad buscada
  left: 0,         // segundos que le quedan a la tormenta
  next: 150,       // segundos hasta la próxima tirada
  flash: 0, boltT: 0, bolt: null, thunderIn: -1, beam: 0,
  drops: [], splash: [],
};

G.stormOn = function () { return Wx.s > 0.05; };
G.startStorm = function (dur) {
  Wx.target = 1; Wx.left = dur || 70 + this.rnd.next() * 90;
  if (this.world && this.world.outdoor) this.toast('El cielo se rompe. Tormenta.');
};
G.updateWeather = function (dt) {
  // tiradas: solo cuando ya has salido al mundo
  if (this.stage >= 2) {
    if (Wx.target > 0) { Wx.left -= dt; if (Wx.left <= 0) { Wx.target = 0; Wx.beam = 1; Wx.next = 200 + this.rnd.next() * 260; } }
    else if ((Wx.next -= dt) <= 0) { if (this.rnd.next() < 0.45) this.startStorm(); else Wx.next = 120 + this.rnd.next() * 160; }
  }
  Wx.s += (Wx.target - Wx.s) * Math.min(1, dt * 0.35);
  if (Wx.beam > 0) Wx.beam = Math.max(0, Wx.beam - dt / 22);
  if (Wx.flash > 0) Wx.flash = Math.max(0, Wx.flash - dt * 2.6);
  if (Wx.boltT > 0) Wx.boltT -= dt;
  // rayos
  if (Wx.s > 0.6 && this.rnd.next() < dt * 0.11 * Wx.s) {
    Wx.flash = 1; Wx.boltT = 0.22;
    const pts = []; let x = 30 + this.rnd.next() * (WW - 60), y = -4;
    while (y < WH * (0.35 + this.rnd.next() * 0.45)) { pts.push([x, y]); x += (this.rnd.next() - 0.5) * 22; y += 6 + this.rnd.next() * 10; }
    pts.push([x, y]); Wx.bolt = pts;
    Wx.thunderIn = 0.15 + this.rnd.next() * 0.9;
  }
  if (Wx.thunderIn >= 0 && (Wx.thunderIn -= dt) < 0) { Sound.play('thunder'); if (this.world && this.world.outdoor) this.shake(0.35); }
  Sound.rain(this.world && this.world.outdoor ? Wx.s : Wx.s * 0.35);
  // gotas en espacio de pantalla
  const want = Math.floor(260 * Wx.s);
  while (Wx.drops.length < want) Wx.drops.push({ x: this.rnd.next() * (WW + 80), y: this.rnd.next() * WH - WH, v: 300 + this.rnd.next() * 160, l: 6 + this.rnd.int(7), z: this.rnd.next() });
  if (Wx.drops.length > want) Wx.drops.length = want;
  for (const d of Wx.drops) {
    d.x -= d.v * 0.42 * dt; d.y += d.v * dt;
    const ground = WH * (0.25 + d.z * 0.8);
    if (d.y > ground) {
      if (Wx.splash.length < 80) Wx.splash.push({ x: d.x, y: d.y, t: 0.18 });
      d.x = this.rnd.next() * (WW + 80); d.y = -10 - this.rnd.next() * 30;
    }
    if (d.x < -10) d.x += WW + 80;
  }
  for (const s of Wx.splash) s.t -= dt;
  Wx.splash = Wx.splash.filter(s => s.t > 0);
};
/** Oscuridad extra que añade la tormenta (se suma a la de la noche). */
G.stormDark = function () { return this.world && this.world.outdoor ? Wx.s * 0.5 : 0; };

G.drawWeather = function (g) {
  if (!this.world || Wx.s < 0.02 && Wx.beam <= 0 && Wx.flash <= 0) return;
  const out = this.world.outdoor, s = Wx.s;
  if (!out) {
    // dentro de casa: solo el destello del rayo por las ventanas
    if (Wx.flash > 0) { g.fillStyle = `rgba(220,230,255,${0.18 * Wx.flash})`; g.fillRect(0, 0, WW, WH); }
    return;
  }
  // cielo enfermo: verde-negro arriba, ascuas rojas en el horizonte
  let gr = g.createLinearGradient(0, 0, 0, WH);
  gr.addColorStop(0, `rgba(10,16,12,${0.62 * s})`); gr.addColorStop(0.55, `rgba(26,32,26,${0.4 * s})`); gr.addColorStop(1, `rgba(20,16,12,${0.35 * s})`);
  g.fillStyle = gr; g.fillRect(0, 0, WW, WH);
  const ember = 0.5 + 0.5 * Math.sin(this.clock * 0.7);
  gr = g.createRadialGradient(WW * 0.12, WH * 0.62, 4, WW * 0.12, WH * 0.62, WW * 0.45);
  gr.addColorStop(0, `rgba(200,60,30,${(0.22 + 0.08 * ember) * s})`); gr.addColorStop(1, 'rgba(200,60,30,0)');
  g.fillStyle = gr; g.fillRect(0, 0, WW, WH);
  // cortinas de lluvia (bandas oscuras oblicuas que se desplazan)
  g.save(); g.globalAlpha = 0.16 * s; g.fillStyle = '#9aa3a0';
  for (let k = 0; k < 5; k++) {
    const bx = ((k * 97 - this.clock * 26) % (WW + 160) + WW + 160) % (WW + 160) - 80;
    g.beginPath(); g.moveTo(bx, 0); g.lineTo(bx + 26 + k * 4, 0); g.lineTo(bx + 26 + k * 4 - WH * 0.42, WH); g.lineTo(bx - WH * 0.42, WH); g.fill();
  }
  g.restore();
  // gotas
  g.lineWidth = 1;
  for (const d of Wx.drops) {
    g.strokeStyle = `rgba(190,205,215,${(0.25 + d.z * 0.45) * Math.min(1, s * 1.5)})`;
    g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(d.x + d.l * 0.42, d.y - d.l); g.stroke();
  }
  g.fillStyle = `rgba(200,215,225,${0.5 * s})`;
  for (const p of Wx.splash) { const r = (0.18 - p.t) * 18; g.fillRect(Math.floor(p.x - r), Math.floor(p.y), 1, 1); g.fillRect(Math.floor(p.x + r), Math.floor(p.y), 1, 1); g.fillRect(Math.floor(p.x), Math.floor(p.y - r * 0.6), 1, 1); }
  // rayo
  if (Wx.boltT > 0 && Wx.bolt) {
    for (const [w, c] of [[4, 'rgba(160,170,255,0.35)'], [1.5, 'rgba(255,255,255,0.95)']]) {
      g.strokeStyle = c; g.lineWidth = w; g.beginPath();
      Wx.bolt.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
    }
  }
  if (Wx.flash > 0) { g.fillStyle = `rgba(235,240,255,${0.55 * Wx.flash * Wx.flash})`; g.fillRect(0, 0, WW, WH); }
  // al amainar: un haz de luz rompe las nubes (arriba a la derecha)
  const beam = Wx.beam * (1 - s);
  if (beam > 0.01) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++) {
      const x0 = WW * (0.7 + k * 0.08), wd = 18 + k * 10;
      gr = g.createLinearGradient(x0, 0, x0 - WH * 0.5, WH);
      gr.addColorStop(0, `rgba(255,240,200,${0.22 * beam})`); gr.addColorStop(1, 'rgba(255,240,200,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0, -2); g.lineTo(x0 + wd, -2); g.lineTo(x0 + wd - WH * 0.55, WH); g.lineTo(x0 - WH * 0.55 - wd * 0.6, WH); g.fill();
    }
    g.restore();
  }
};
