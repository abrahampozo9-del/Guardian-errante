// ====================================================================== luz y ambiente
// Color de la hora del día, viñeta, motas de polvo al sol y luciérnagas por la noche.
const GRADE = [ // hora, r, g, b, intensidad (fundido "soft-light")
  [0, 60, 80, 160, 0.0], [5.5, 90, 90, 170, 0.0], [6.5, 220, 90, 90, 0.3], [8, 200, 170, 190, 0.12],
  [11, 200, 200, 230, 0.06], [15, 210, 200, 220, 0.08], [17, 255, 120, 90, 0.22], [19, 255, 70, 50, 0.38],
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
  // apocalíptico: color lavado, todo más apagado y una dominante azul violácea
  g.globalCompositeOperation = 'saturation'; g.fillStyle = 'rgba(128,128,128,0.55)'; g.fillRect(0, 0, WW, WH);
  g.globalCompositeOperation = 'multiply'; g.fillStyle = this.world.outdoor ? 'rgb(150,148,172)' : 'rgb(170,150,140)'; g.fillRect(0, 0, WW, WH);
  g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(60,50,110,0.35)'; g.fillRect(0, 0, WW, WH);
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
  const wantM = 34;
  while (AMB.motes.length < wantM) AMB.motes.push({ x: cx + rnd.next() * WW, y: cy + rnd.next() * WH, ph: rnd.next() * 9, sp: 3 + rnd.next() * 5 });
  if (AMB.motes.length > wantM) AMB.motes.length = wantM;
  for (const m of AMB.motes) {
    // ceniza que cae despacio, meciéndose
    m.x += Math.sin(t * 0.9 + m.ph) * 0.12 + 0.04; m.y += m.sp * 0.012;
    if (m.x < cx - 4 || m.x > cx + WW + 4 || m.y < cy - 4 || m.y > cy + WH + 4) { m.x = cx + rnd.next() * WW; m.y = cy - 2; }
    const a = 0.35 + 0.2 * Math.sin(t * 2 + m.ph);
    g.fillStyle = m.ph > 8.6 ? `rgba(255,120,50,${a})` : `rgba(190,185,200,${a})`; g.fillRect(Math.round(m.x - cx), Math.round(m.y - cy), m.ph > 5 ? 1 : 2, 1);
  }
  // luciérnagas (de noche, más cerca del agua y la hierba)
  const wantF = dark > 0.6 ? 12 : 0;
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

// niebla baja que se desplaza (textura de nubes repetida)
let fogC = null;
G.fog = function (g, cx, cy) {
  if (!this.world.outdoor) return;
  if (!fogC) {
    const S = 128; fogC = document.createElement('canvas'); fogC.width = S; fogC.height = S;
    const fg = fogC.getContext('2d'), id = fg.createImageData(S, S);
    const hsh = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) & 255) / 255; };
    const vn = (x, y, c) => { const n = S / c, gx = x / c, gy = y / c, xi = Math.floor(gx), yi = Math.floor(gy); let fx = gx - xi, fy = gy - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); const q = (i, j) => hsh(((i % n) + n) % n, ((j % n) + n) % n); const a = q(xi, yi), b = q(xi + 1, yi), c2 = q(xi, yi + 1), d = q(xi + 1, yi + 1); return a + (b - a) * fx + (c2 - a) * fy + (a - b - c2 + d) * fx * fy; };
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const n = vn(x, y, 32) * 0.6 + vn(x, y, 16) * 0.3 + vn(x, y, 8) * 0.1, a = Math.max(0, n - 0.45) * 2;
      const i = (y * S + x) * 4; id.data[i] = 150; id.data[i + 1] = 150; id.data[i + 2] = 175; id.data[i + 3] = Math.min(255, a * 85);
    }
    fg.putImageData(id, 0, 0);
  }
  const S = 128, ox = -(((cx * 1.0 + this.clock * 4) % S) + S) % S, oy = -(((cy * 1.0 + this.clock * 1.5) % S) + S) % S;
  for (let y = oy; y < WH; y += S) for (let x = ox; x < WW; x += S) g.drawImage(fogC, Math.floor(x), Math.floor(y));
};
