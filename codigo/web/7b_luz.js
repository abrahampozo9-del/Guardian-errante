// ====================================================================== luz y ambiente
// Color de la hora del día, viñeta, motas de polvo al sol y luciérnagas por la noche.
const GRADE = [ // hora, r, g, b, intensidad (fundido "soft-light")
  [0, 60, 80, 160, 0.0], [5.5, 90, 90, 170, 0.0], [6.5, 255, 160, 120, 0.3], [8, 255, 215, 170, 0.16],
  [11, 255, 240, 210, 0.08], [15, 255, 235, 200, 0.1], [17, 255, 200, 130, 0.2], [19, 255, 140, 70, 0.34],
  [20.5, 200, 90, 90, 0.2], [21.5, 60, 80, 160, 0.0], [24, 60, 80, 160, 0.0],
];
let vignetteC = null;
G.grade = function (g) {
  const w = this.world;
  if (!w.outdoor) { // interiores: luz cálida de casa
    g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(255,190,130,0.22)'; g.fillRect(0, 0, WW, WH); g.restore();
    return;
  }
  const h = this.hour();
  let i = 0; while (i < GRADE.length - 2 && GRADE[i + 1][0] <= h) i++;
  const a = GRADE[i], b = GRADE[i + 1], t = (h - a[0]) / Math.max(0.001, b[0] - a[0]);
  const L = k => a[k] + (b[k] - a[k]) * t;
  const strength = L(4) * (1 - (typeof Wx !== 'undefined' ? Wx.s * 0.7 : 0));
  if (strength < 0.01) return;
  g.save(); g.globalCompositeOperation = 'soft-light';
  g.fillStyle = `rgba(${L(1) | 0},${L(2) | 0},${L(3) | 0},${strength})`; g.fillRect(0, 0, WW, WH);
  g.restore();
};
G.mood = function (g) {
  // tono del juego: algo desaturado y sombras frías, más oscuro y melancólico
  g.save();
  g.globalCompositeOperation = 'saturation'; g.fillStyle = 'rgba(128,128,128,0.22)'; g.fillRect(0, 0, WW, WH);
  g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(40,70,90,0.22)'; g.fillRect(0, 0, WW, WH);
  g.restore();
};
G.vignette = function (g) {
  if (!vignetteC) {
    vignetteC = document.createElement('canvas'); vignetteC.width = WW; vignetteC.height = WH;
    const v = vignetteC.getContext('2d'), gr = v.createRadialGradient(WW / 2, WH / 2, WH * 0.35, WW / 2, WH / 2, WW * 0.62);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,6,4,0.38)');
    v.fillStyle = gr; v.fillRect(0, 0, WW, WH);
  }
  g.drawImage(vignetteC, 0, 0);
};
const AMB = { motes: [], flies: [] };
G.ambient = function (g, cx, cy, dark) {
  const w = this.world; if (!w.outdoor) return;
  const t = this.clock, rnd = this.rnd;
  // motas de polvo y polen a contraluz (de día)
  const wantM = dark < 0.3 ? 22 : 0;
  while (AMB.motes.length < wantM) AMB.motes.push({ x: cx + rnd.next() * WW, y: cy + rnd.next() * WH, ph: rnd.next() * 9, sp: 3 + rnd.next() * 5 });
  if (AMB.motes.length > wantM) AMB.motes.length = wantM;
  for (const m of AMB.motes) {
    m.x += Math.sin(t * 0.7 + m.ph) * 0.08 + 0.05; m.y -= m.sp * 0.004;
    if (m.x < cx - 4 || m.x > cx + WW + 4 || m.y < cy - 4 || m.y > cy + WH + 4) { m.x = cx + rnd.next() * WW; m.y = cy + WH * (0.3 + rnd.next() * 0.7); }
    const a = 0.25 + 0.25 * Math.sin(t * 2 + m.ph);
    g.fillStyle = `rgba(255,250,220,${a})`; g.fillRect(Math.round(m.x - cx), Math.round(m.y - cy), 1, 1);
  }
  // luciérnagas (de noche, más cerca del agua y la hierba)
  const wantF = dark > 0.35 ? 16 : 0;
  while (AMB.flies.length < wantF) {
    const x = cx + rnd.next() * WW, y = cy + rnd.next() * WH, tt = w.get(Math.floor(x / TS), Math.floor(y / TS));
    if (tt === T.GRASS_GREEN || tt === T.GRASS || T.isWater(tt) || rnd.next() < 0.2) AMB.flies.push({ x, y, ph: rnd.next() * 9, vx: 0, vy: 0 });
    else if (AMB.flies.length < wantF && rnd.next() < 0.02) break;
  }
  if (AMB.flies.length > wantF) AMB.flies.length = wantF;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const f of AMB.flies) {
    f.vx += (rnd.next() - 0.5) * 0.04; f.vy += (rnd.next() - 0.5) * 0.04; f.vx *= 0.96; f.vy *= 0.96;
    f.x += f.vx; f.y += f.vy;
    if (f.x < cx - 10 || f.x > cx + WW + 10 || f.y < cy - 10 || f.y > cy + WH + 10) { f.x = cx + rnd.next() * WW; f.y = cy + rnd.next() * WH; }
    const blink = Math.max(0, Math.sin(t * 2.2 + f.ph)) * Math.min(1, dark * 1.5);
    if (blink < 0.05) continue;
    const sx = f.x - cx, sy = f.y - cy, gr = g.createRadialGradient(sx, sy, 0, sx, sy, 6);
    gr.addColorStop(0, `rgba(200,255,120,${0.5 * blink})`); gr.addColorStop(1, 'rgba(200,255,120,0)');
    g.fillStyle = gr; g.fillRect(sx - 6, sy - 6, 12, 12);
    g.fillStyle = `rgba(240,255,190,${blink})`; g.fillRect(Math.round(sx), Math.round(sy), 1, 1);
  }
  g.restore();
};
