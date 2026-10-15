// ====================================================================== secciones y pantallas de carga
ST.LOAD = 'LOAD';
const SECCIONES = {
  exterior: { name: 'El Valle y Pozo Alcón', scene: 'valle', orden: 0 },
  pantano: { name: 'La carretera del pantano', scene: 'carretera', orden: 1 },
  bolera: { name: 'La Bolera', scene: 'bolera', orden: 2 },
};
const CONSEJOS = [
  'Los demonios apenas sienten el acero. La Luz los quema de verdad.',
  'Rueda a través de un ataque en el momento justo y el tiempo se detendrá un instante.',
  'Las hogueras de los refugios te curan y guardan la partida.',
  'De noche, las Sombras rondan lejos de las farolas.',
  'Cada nivel te da un punto de habilidad. Ábrelo con H o con el botón Hab.',
  'Los Ahogados solo pueden herirte cuando salen del agua.',
  '«Por cuanto eres tibio, y no frío ni caliente, te vomitaré de mi boca.» (Apocalipsis 3:16)',
  'Mantén pulsada la espada y suéltala: Torbellino.',
  'Las hierbas curan el veneno de los alacranes.',
  'Hay reliquias escondidas en cada sección. Te hacen más fuerte.',
  'Algunas decisiones inclinan la balanza. Los ángeles y los demonios se dan cuenta.',
];

G.getWorld = function (id) {
  if (this.worlds[id]) return this.worlds[id];
  let w = null;
  if (id === 'pantano') w = WS.pantano(); else if (id === 'bolera') w = WS.bolera();
  if (!w) return null;
  w.pickups = w.pickups.filter(k => !(k.id && this.picked.has(k.id)));
  this.worlds[id] = w;
  if (id === 'bolera' && this.stage > ETAPA.AGUJAS) for (const pp of w.props) if (pp.id === 'agujas') pp.img = Art.P.pedestal_limpio;
  if (this.onWorldBuilt) this.onWorldBuilt(w);
  return w;
};
const _enter = G.enter;
G.enter = function (id, x, y, dir) { this.getWorld(id); _enter.call(this, id, x, y, dir); };

G.travel = function (wp) {
  const info = SECCIONES[wp.to] || { name: wp.to, scene: 'valle' };
  this.loading = { wp, t: 0, built: !!this.worlds[wp.to], info, tip: CONSEJOS[Math.floor(Math.random() * CONSEJOS.length)] };
  this.st = ST.LOAD; Sound.play('door');
};
G.updateLoad = function (dt) {
  const L = this.loading; if (!L) { this.st = ST.PLAY; return; }
  L.t += dt; this.clock += dt;
  if (!L.built && L.t > 0.25) { this.getWorld(L.wp.to); L.built = true; }
  if (L.built && L.t > 1.8) {
    const wp = L.wp; this.loading = null; this.st = ST.PLAY;
    this.enter(wp.to, wp.tx, wp.ty, wp.dir);
    if (this.onArrive) this.onArrive(wp.to);
  }
};
G.renderLoad = function (g) {
  const L = this.loading; if (!L) return;
  g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH);
  cg.save(); (SCENES[L.info.scene] || SCENES.valle)(L.t + 3); cg.restore(); cinePost();
  const a = Math.min(1, L.t / 0.4);
  g.globalAlpha = a; g.imageSmoothingEnabled = false; g.drawImage(cineC, 0, 0, CW * 2, CH * 2); g.globalAlpha = 1;
  g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 0, VW, VH);
  g.font = FB(6.5); this.center(g, 'SECCIÓN ' + ((L.info.orden || 0) + 1), 70, UI.bronzeHi);
  g.font = FT(18); this.center(g, L.info.name, 92, '#efe2c8');
  g.fillStyle = UI.bronze; g.fillRect(VW / 2 - 60, 99, 120, 1);
  this.panel(g, 40, VH - 62, VW - 80, 34);
  g.font = FB(6.6); this.wrap(g, L.tip, VW - 110).forEach((l, i) => this.center(g, l, VH - 47 + i * 9, PAPER));
  this.bar(g, VW / 2 - 70, VH - 18, 140, 3, Math.min(1, L.t / 1.8), '#a83a2a', '#1a1210');
};

// ---------------------------------------------------------------- objetivo entre secciones
// Si el objetivo está en otra sección, la flecha apunta a la salida que lleva hacia allí.
G.arrowTarget = function () {
  const t = this.objectiveTarget(); if (!t) return null;
  const w = this.world, tw = t[2] || 'exterior';
  if (!w.outdoor) return null;
  if (tw === w.id) return t;
  const here = (SECCIONES[w.id] || {}).orden || 0, there = (SECCIONES[tw] || {}).orden || 0;
  const want = Object.keys(SECCIONES).find(k => SECCIONES[k].orden === here + (there > here ? 1 : -1));
  const ex = w.warps.find(wp => wp.load && wp.to === want);
  return ex ? [ex.x + ex.w / 2, ex.y] : null;
};

// ---------------------------------------------------------------- buitres sobre el cortado
G.drawBirds = function (g, cx, cy) {
  const w = this.world; if (!w.birds) return;
  for (const B of w.birds) for (let i = 0; i < B.n; i++) {
    const a = this.clock * (0.25 + i * 0.03) + i * (Math.PI * 2 / B.n), rr = B.r * (0.6 + 0.4 * ((i * 37) % 10) / 10);
    const x = B.cx + Math.cos(a) * rr - cx, y = B.cy + Math.sin(a) * rr * 0.6 - cy, fl = Math.sin(this.clock * 3 + i) > 0.6 ? 1 : 0;
    if (x < -20 || y < -20 || x > WW + 20 || y > WH + 20) continue;
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(Math.round(x + 10), Math.round(y + 24), 6, 2);
    g.fillStyle = '#1a1412';
    g.fillRect(Math.round(x - 1), Math.round(y), 3, 2);
    g.fillRect(Math.round(x - 6), Math.round(y - 1 + fl), 5, 1); g.fillRect(Math.round(x + 2), Math.round(y - 1 + fl), 5, 1);
    g.fillRect(Math.round(x - 8), Math.round(y + fl * 2), 2, 1); g.fillRect(Math.round(x + 7), Math.round(y + fl * 2), 2, 1);
    g.fillStyle = '#d8d0c0'; g.fillRect(Math.round(x), Math.round(y - 1), 1, 1);
  }
};

// escena de carga de la carretera: el cañón con la carretera y los buitres
SCENES.carretera = function (t) {
  C.sky(['#1a1820', '#2a2630', '#3a3238', '#4a3a3a']);
  C.ridge(46, 12, 0.03, 301, '#2a2428');
  // paredes del cañón
  cg.fillStyle = '#4a3a30'; cg.beginPath(); cg.moveTo(110, CH); cg.lineTo(118, 50); cg.lineTo(132, 40); cg.lineTo(150, 44); cg.lineTo(160, CH); cg.fill();
  cg.fillStyle = '#5a4838'; cg.beginPath(); cg.moveTo(160, CH); cg.lineTo(170, 36); cg.lineTo(200, 30); cg.lineTo(200, CH); cg.fill();
  for (let y = 50; y < CH; y += 6) { C.r(118 + (y - 50) * 0.1, y, 30, 1, 'rgba(30,20,16,0.5)'); C.r(172, y - 8, 28, 1, 'rgba(30,20,16,0.5)'); }
  C.water(96, CH, '#1e3a3e', '#3a6066', t);
  // carretera con curva y quitamiedos
  cg.fillStyle = '#2a2a2e'; cg.beginPath(); cg.moveTo(0, 80); cg.quadraticCurveTo(60, 60, 104, 56); cg.lineTo(106, 62); cg.quadraticCurveTo(60, 70, 0, 96); cg.fill();
  for (let i = 0; i < 9; i++) C.r(8 + i * 11, 82 - i * 2.6, 6, 1, '#c8c0a0');
  C.ridge(100, 4, 0.08, 302, '#1a1614');
  // hotel a lo lejos con una luz encendida
  C.r(70, 44, 18, 8, '#6a5a4a'); C.r(68, 41, 22, 3, '#4a2a20'); C.r(76, 47, 2, 2, '#ffc060'); C.glow(77, 48, 6, 'rgba(255,180,80,0.5)');
  // buitres
  for (let i = 0; i < 5; i++) { const a = t * 0.4 + i * 1.3, x = 140 + Math.cos(a) * 26, y = 26 + Math.sin(a) * 8; C.r(x - 4, y, 9, 1, '#120e0c'); C.r(x - 1, y - 1, 3, 2, '#120e0c'); }
  C.rain(t, 30, 0.12, 0.2);
};
