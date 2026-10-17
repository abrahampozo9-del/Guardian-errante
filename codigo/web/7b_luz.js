// ====================================================================== luz y ambiente
// Iluminación por multiplicación: la escena se multiplica por un "mapa de luz" (azul frío de noche,
// gris cubierto de día) en el que las fuentes de luz pintan manchas cálidas. Así los colores y los
// contrastes del suelo se conservan, en vez de quedar tapados por una neblina gris uniforme.
// Encima van sombras de nubes de día, bruma baja al amanecer y de noche, ceniza y luciérnagas.
const GRADE = [ // hora, r, g, b, intensidad (fundido "soft-light")
  [0, 40, 60, 140, 0.18], [5.5, 70, 70, 150, 0.15], [6.5, 230, 110, 80, 0.32], [8, 220, 170, 140, 0.14],
  [11, 210, 200, 190, 0.08], [15, 220, 190, 160, 0.1], [17, 255, 130, 80, 0.28], [19, 255, 80, 50, 0.42],
  [20.5, 170, 70, 90, 0.26], [21.5, 40, 60, 140, 0.18], [24, 40, 60, 140, 0.18],
];
let vignetteC = null;
G.grade = function (g) {
  const w = this.world;
  if (!w.outdoor) return;
  const h = this.hour();
  let i = 0; while (i < GRADE.length - 2 && GRADE[i + 1][0] <= h) i++;
  const a = GRADE[i], b = GRADE[i + 1], t = (h - a[0]) / Math.max(0.001, b[0] - a[0]);
  const L = k => a[k] + (b[k] - a[k]) * t;
  const strength = L(4) * (1 - (typeof Wx !== 'undefined' ? Wx.s * 0.6 : 0));
  if (strength < 0.01) return;
  g.save(); g.globalCompositeOperation = 'soft-light';
  g.fillStyle = `rgba(${L(1) | 0},${L(2) | 0},${L(3) | 0},${strength})`; g.fillRect(0, 0, WW, WH);
  g.restore();
};
G.mood = function (g) {
  // el mundo tras el Colapso: color algo lavado y sombras frías, sin tapar los valores
  g.save();
  g.globalCompositeOperation = 'saturation'; g.fillStyle = `rgba(128,128,128,${this.world.outdoor ? 0.28 : 0.18})`; g.fillRect(0, 0, WW, WH);
  g.globalCompositeOperation = 'soft-light'; g.fillStyle = this.world.outdoor ? 'rgba(40,50,90,0.22)' : 'rgba(90,50,30,0.18)'; g.fillRect(0, 0, WW, WH);
  g.restore();
};

// ---------------------------------------------------------------- mapa de luz
const NIGHT_OUT = [16, 22, 50], NIGHT_IN = [62, 44, 36];
G.lightColor = function (dk) {
  const n = this.world.outdoor ? NIGHT_OUT : NIGHT_IN;
  return n.map(c => Math.round(255 - dk * (255 - c)));
};
G.nightOverlay = function (g, dk, cx, cy) {
  const base = this.lightColor(dk);
  dctx.globalCompositeOperation = 'source-over';
  dctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
  dctx.fillRect(0, 0, WW, WH);
  dctx.globalCompositeOperation = 'lighten';
  const lights = [];
  const light = (x, y, r, col, k = 1) => {
    if (x < -r || y < -r || x > WW + r || y > WH + r) return;
    const gr = dctx.createRadialGradient(x, y, 0, x, y, r);
    const c = col.map((v, i) => Math.round(base[i] + (v - base[i]) * k));
    gr.addColorStop(0, `rgb(${c[0]},${c[1]},${c[2]})`);
    gr.addColorStop(0.45, `rgba(${c[0]},${c[1]},${c[2]},0.6)`);
    gr.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
    dctx.fillStyle = gr; dctx.fillRect(x - r, y - r, r * 2, r * 2);
    lights.push([x, y, r, col]);
  };
  const fl = Math.sin(this.clock * 9) * 0.04 + Math.sin(this.clock * 23) * 0.03;
  const out = this.world.outdoor;
  // alrededor del Guardián: la vista acostumbrada a la oscuridad (luz de luna fría)
  light(this.player.x - cx, this.player.y - 10 - cy, out ? 78 : 100, out ? [150, 165, 205] : [205, 180, 150], Math.min(1, dk * 1.2));
  for (const pr of this.world.props) {
    let r = 0, col = null, oy = 6, k = 1;
    if (pr.anim === 1) { r = 84; col = [255, 170, 90]; k = 1 + fl * 3; }
    else if (pr.light) { r = 66; col = [255, 205, 130]; oy = 26; }
    else if (pr.img === Art.P.cruzluz) { r = 70; col = [255, 235, 180]; oy = 14; }
    else if (pr.id === 'chimenea') { r = 70; col = [255, 150, 80]; k = 1 + fl * 3; }
    else if (pr.id === 'tele' || pr.id === 'pc') { r = 46; col = [150, 180, 255]; }
    else if (pr.id === 'radio') { r = 30; col = [255, 190, 120]; }
    if (!r) continue;
    light(pr.x - cx, pr.y - oy - cy, r, col, k);
  }
  for (const k of this.world.pickups) if (k.type === Pickup.RELIC) light(k.x - cx, k.y - 8 - cy, 26, [255, 225, 150]);
  for (const n of this.world.npcs) if (n.key === 'miguel' || n.key === 'angel') light(n.x - cx, n.y - 20 - cy, 80, [255, 245, 215]);
  for (const m of this.world.monsters) if (!m.dead && m.kind === MK.DEMONIO) light(m.x - cx, m.y - 16 - cy, 60, [255, 90, 40], 0.9);
  for (const o of this.orbs) if (o.fire) light(o.x - cx, o.y - cy, 30, [255, 140, 60]);
  dctx.globalCompositeOperation = 'source-over';
  g.save(); g.globalCompositeOperation = 'multiply'; g.drawImage(darkC, 0, 0); g.restore();
  // halo cálido sobre las llamas y farolas (brillo que se derrama un poco)
  g.save(); g.globalCompositeOperation = 'screen';
  for (const [x, y, r, col] of lights) {
    if (r < 40) continue;
    const a = 0.16 * dk;
    const gr = g.createRadialGradient(x, y, 0, x, y, r * 0.55);
    gr.addColorStop(0, `rgba(${col[0]},${col[1] - 20},${col[2] - 40},${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.restore();
};

G.vignette = function (g) {
  if (!vignetteC) {
    vignetteC = document.createElement('canvas'); vignetteC.width = WW; vignetteC.height = WH;
    const v = vignetteC.getContext('2d'), gr = v.createRadialGradient(WW / 2, WH / 2, WH * 0.38, WW / 2, WH / 2, WW * 0.64);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(8,4,6,0.42)');
    v.fillStyle = gr; v.fillRect(0, 0, WW, WH);
  }
  g.drawImage(vignetteC, 0, 0);
};
const AMB = { motes: [], flies: [] };
G.ambient = function (g, cx, cy, dark) {
  const w = this.world; if (!w.outdoor) return;
  const t = this.clock, rnd = this.rnd;
  // ceniza que cae despacio, meciéndose (alguna brasa)
  const wantM = 30;
  while (AMB.motes.length < wantM) AMB.motes.push({ x: cx + rnd.next() * WW, y: cy + rnd.next() * WH, ph: rnd.next() * 9, sp: 3 + rnd.next() * 5 });
  if (AMB.motes.length > wantM) AMB.motes.length = wantM;
  for (const m of AMB.motes) {
    m.x += Math.sin(t * 0.9 + m.ph) * 0.12 + 0.05; m.y += m.sp * 0.012;
    if (m.x < cx - 4 || m.x > cx + WW + 4 || m.y < cy - 4 || m.y > cy + WH + 4) { m.x = cx + rnd.next() * WW; m.y = cy - 2; }
    const a = 0.3 + 0.2 * Math.sin(t * 2 + m.ph);
    g.fillStyle = m.ph > 8.4 ? `rgba(255,130,60,${a + 0.2})` : `rgba(205,200,210,${a})`; g.fillRect(Math.round(m.x - cx), Math.round(m.y - cy), m.ph > 5 ? 1 : 2, 1);
  }
  // luciérnagas (de noche, cerca del agua y la hierba)
  const wantF = dark > 0.55 ? 14 : 0;
  let tries = 0;
  while (AMB.flies.length < wantF && tries++ < 40) {
    const x = cx + rnd.next() * WW, y = cy + rnd.next() * WH, tt = w.get(Math.floor(x / TS), Math.floor(y / TS));
    if (tt === T.GRASS_GREEN || tt === T.GRASS || T.isWater(tt)) AMB.flies.push({ x, y, ph: rnd.next() * 9, vx: 0, vy: 0 });
  }
  if (AMB.flies.length > wantF) AMB.flies.length = wantF;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const f of AMB.flies) {
    f.vx += (rnd.next() - 0.5) * 0.04; f.vy += (rnd.next() - 0.5) * 0.04; f.vx *= 0.96; f.vy *= 0.96;
    f.x += f.vx; f.y += f.vy;
    if (f.x < cx - 10 || f.x > cx + WW + 10 || f.y < cy - 10 || f.y > cy + WH + 10) { f.x = cx + rnd.next() * WW; f.y = cy + rnd.next() * WH; }
    const blink = Math.max(0, Math.sin(t * 2.2 + f.ph)) * Math.min(1, dark * 1.5);
    if (blink < 0.05) continue;
    const sx = f.x - cx, sy = f.y - cy, gr = g.createRadialGradient(sx, sy, 0, sx, sy, 7);
    gr.addColorStop(0, `rgba(190,255,120,${0.55 * blink})`); gr.addColorStop(1, 'rgba(190,255,120,0)');
    g.fillStyle = gr; g.fillRect(sx - 7, sy - 7, 14, 14);
    g.fillStyle = `rgba(240,255,190,${blink})`; g.fillRect(Math.round(sx), Math.round(sy), 1, 1);
  }
  g.restore();
};

// ---------------------------------------------------------------- nubes y bruma
// Una textura de ruido periódica, ampliada ×3 con suavizado: formas grandes y blandas.
let noiseC = null;
function makeNoiseC() {
  const S = 128; const c = document.createElement('canvas'); c.width = S; c.height = S;
  const fg = c.getContext('2d'), id = fg.createImageData(S, S);
  const hsh = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) & 255) / 255; };
  const vn = (x, y, cell) => { const n = S / cell, gx = x / cell, gy = y / cell, xi = Math.floor(gx), yi = Math.floor(gy); let fx = gx - xi, fy = gy - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); const q = (i, j) => hsh(((i % n) + n) % n, ((j % n) + n) % n); const a = q(xi, yi), b = q(xi + 1, yi), c2 = q(xi, yi + 1), d = q(xi + 1, yi + 1); return a + (b - a) * fx + (c2 - a) * fy + (a - b - c2 + d) * fx * fy; };
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = vn(x, y, 32) * 0.62 + vn(x, y, 16) * 0.28 + vn(x, y, 8) * 0.1, a = Math.max(0, Math.min(1, (n - 0.42) * 2.6));
    const i = (y * S + x) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = 255; id.data[i + 3] = Math.round(a * a * (3 - 2 * a) * 255);
  }
  fg.putImageData(id, 0, 0);
  return c;
}
let shadowC = null, mistC = null;
function tinted(src, rgb) { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = rgb; x.fillRect(0, 0, c.width, c.height); return c; }
G.fog = function (g, cx, cy) {
  if (!this.world.outdoor) return;
  if (!noiseC) { noiseC = makeNoiseC(); shadowC = tinted(noiseC, 'rgb(14,12,22)'); mistC = tinted(noiseC, 'rgb(185,190,210)'); }
  const h = this.hour(), dk = this.darkness();
  const tile = (src, scale, sx, sy, alpha) => {
    const S = 128 * scale;
    const ox = -((((cx + sx) % S) + S) % S), oy = -((((cy + sy) % S) + S) % S);
    g.save(); g.globalAlpha = alpha; g.imageSmoothingEnabled = true;
    for (let y = oy; y < WH; y += S) for (let x = ox; x < WW; x += S) g.drawImage(src, Math.floor(x), Math.floor(y), S, S);
    g.restore();
  };
  // sombras de nubes que barren el valle (solo con algo de luz)
  const day = Math.max(0, 1 - dk / 0.55);
  if (day > 0.05) tile(shadowC, 3, this.clock * 7, this.clock * 2.5, 0.26 * day);
  // bruma baja: al amanecer, al anochecer y de noche, más espesa cerca del río
  const dawn = Math.max(0, 1 - Math.abs(h - 6.5) / 2), night = dk > 0.6 ? 0.5 : 0;
  const k = Math.max(dawn, night) * (typeof Wx !== 'undefined' ? 1 + Wx.s * 0.5 : 1);
  if (k > 0.02) { tile(mistC, 2, this.clock * 3, this.clock * 0.8, 0.16 * k); tile(mistC, 3, -this.clock * 2, 40, 0.1 * k); }
};
