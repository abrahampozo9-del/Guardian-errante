// ====================================================================== interfaz "dark fantasy"
// Marcos de bronce con remaches y filigrana, barras enmarcadas, menú con zarzas y pantalla de título
// con luna de sangre sobre Pozo Alcón.
const UI = { bronze: '#8a6440', bronzeHi: '#c8a06a', bronzeLo: '#4a3424', ink: 'rgba(16,12,10,0.94)' };

G.panel = function (g, x, y, w, h, fancy) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  g.fillStyle = UI.ink; g.fillRect(x + 1, y + 1, w - 2, h - 2);
  // doble marco
  g.fillStyle = '#0a0706'; g.fillRect(x, y, w, 1); g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h);
  g.fillStyle = UI.bronze; g.fillRect(x + 1, y + 1, w - 2, 1); g.fillRect(x + 1, y + h - 2, w - 2, 1); g.fillRect(x + 1, y + 1, 1, h - 2); g.fillRect(x + w - 2, y + 1, 1, h - 2);
  g.fillStyle = UI.bronzeLo; g.fillRect(x + 3, y + 3, w - 6, 1); g.fillRect(x + 3, y + h - 4, w - 6, 1); g.fillRect(x + 3, y + 3, 1, h - 6); g.fillRect(x + w - 4, y + 3, 1, h - 6);
  g.fillStyle = 'rgba(200,160,106,0.25)'; g.fillRect(x + 2, y + 2, w - 4, 1);
  // esquinas: rombo con remache
  const corner = (cx, cy) => { g.fillStyle = UI.bronze; g.fillRect(cx - 2, cy - 1, 5, 3); g.fillRect(cx - 1, cy - 2, 3, 5); g.fillStyle = UI.bronzeHi; g.fillRect(cx, cy, 1, 1); };
  corner(x + 1.5, y + 1.5); corner(x + w - 2.5, y + 1.5); corner(x + 1.5, y + h - 2.5); corner(x + w - 2.5, y + h - 2.5);
  if (fancy !== false && w > 110) { // filigrana arriba y abajo en el centro
    const fil = (cy, dir) => {
      const cx = x + w / 2;
      g.fillStyle = UI.bronze;
      g.fillRect(cx - 1, cy - dir * 2, 3, 3); g.fillRect(cx - 9, cy, 19, 1);
      for (const s of [-1, 1]) { g.fillRect(cx + s * 10 - (s < 0 ? 1 : 0), cy - dir, 2, 1); g.fillRect(cx + s * 12 - (s < 0 ? 1 : 0), cy - dir * 2, 2, 1); g.fillRect(cx + s * 5, cy - dir, 1, 1); }
      g.fillStyle = UI.bronzeHi; g.fillRect(cx, cy - dir * 1, 1, 1);
    };
    fil(y + 1, 1); fil(y + h - 2, -1);
  }
};
G.bar = function (g, x, y, w, h, frac, c, back) {
  frac = Math.max(0, Math.min(1, frac));
  g.fillStyle = '#0a0706'; g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle = UI.bronzeLo; g.fillRect(x - 1, y - 1, w + 2, 1); g.fillRect(x - 1, y + h, w + 2, 1);
  g.fillStyle = back || '#1a1210'; g.fillRect(x, y, w, h);
  const fw = Math.round(w * frac);
  if (fw > 0) {
    g.fillStyle = c; g.fillRect(x, y, fw, h);
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(x, y, fw, Math.max(1, h * 0.3));
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x, y + h - Math.max(1, h * 0.25), fw, Math.max(1, h * 0.25));
    g.fillStyle = 'rgba(255,240,210,0.55)'; g.fillRect(x + fw - 1, y, 1, h);
  }
  for (let i = 1; i < 10; i++) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(Math.round(x + w * i / 10), y, 1, h); }
  g.fillStyle = UI.bronze; g.fillRect(x - 2, y - 1, 1, h + 2); g.fillRect(x + w + 1, y - 1, 1, h + 2);
};
// opciones de menú: la elegida en una placa enmarcada; las demás, tenues y subrayadas
G.menuList = function (g, items, y0, step, left) {
  g.font = FT(8.6);
  const w = 132, x0 = left !== undefined ? left : VW / 2 - w / 2;
  items.forEach((m, i) => {
    const sel = i === this.menuIdx, y = y0 + i * step;
    if (sel) {
      this.panel(g, x0, y - 10, w, 14, false);
      g.fillStyle = 'rgba(160,30,24,0.25)'; g.fillRect(x0 + 4, y - 7, w - 8, 8);
      this.text(g, m, x0 + 10, y + 0.5, PAPER);
      g.fillStyle = UI.bronzeHi; g.beginPath(); g.arc(x0 + w - 9, y - 3, 2.6, 0, Math.PI * 2); g.lineWidth = 0.8; g.strokeStyle = UI.bronzeHi; g.stroke();
      g.fillRect(x0 + w - 10, y - 4, 2, 2);
    } else {
      this.text(g, m, x0 + 10, y + 0.5, '#8a7a66');
      const gr = g.createLinearGradient(x0 + 8, 0, x0 + w, 0); gr.addColorStop(0, 'rgba(138,100,64,0.6)'); gr.addColorStop(1, 'rgba(138,100,64,0)');
      g.fillStyle = gr; g.fillRect(x0 + 8, y + 3, w - 12, 0.6);
    }
    this.menuRects.push({ i, x: x0, y: y - 10, w, h: step });
  });
};

// ---------------------------------------------------------------- pantalla de título: luna de sangre sobre Pozo Alcón
SCENES.titulo = function (t) {
  C.sky(['#0c0406', '#2a0608', '#5a0c0c', '#8a1a12']);
  // nubes rojas que pasan
  for (let i = 0; i < 7; i++) { const x = ((i * 47 + t * (2 + i % 3)) % (CW + 80)) - 40, y = 14 + (i % 4) * 9; C.glow(x, y, 26, 'rgba(20,4,6,0.55)'); C.r(x - 16, y, 34, 2, 'rgba(150,24,18,0.5)'); }
  // luna de sangre en creciente
  C.glow(140, 34, 46, 'rgba(255,60,40,0.35)');
  cg.fillStyle = '#c83a26'; cg.beginPath(); cg.arc(140, 34, 22, 0, Math.PI * 2); cg.fill();
  cg.fillStyle = 'rgba(120,20,14,0.6)'; for (const [x, y, r] of [[134, 28, 4], [146, 40, 3], [138, 44, 2.5], [148, 26, 2]]) { cg.beginPath(); cg.arc(x, y, r, 0, Math.PI * 2); cg.fill(); }
  cg.fillStyle = '#2a0608'; cg.beginPath(); cg.arc(131, 30, 20, 0, Math.PI * 2); cg.fill();
  // sierra y cerro con el pueblo y la torre de la Encarnación en silueta
  C.ridge(70, 12, 0.03, 201, '#24080a');
  C.ridge(82, 8, 0.045, 202, '#160506');
  C.r(92, 46, 8, 34, '#0c0304'); C.r(93, 40, 6, 6, '#0c0304'); C.r(95, 34, 2, 6, '#0c0304'); C.r(94, 36, 4, 1, '#0c0304'); C.r(95, 50, 2, 4, '#ff6a20'); C.glow(96, 52, 6, 'rgba(255,100,30,0.5)');
  for (const [x, w, h] of [[70, 9, 10], [79, 8, 14], [100, 10, 12], [110, 7, 9], [60, 8, 7], [118, 9, 6]]) { C.r(x, 80 - h, w, h, '#0c0304'); if ((x * 7) % 3 === 0) C.r(x + 3, 80 - h + 3, 1, 2, '#c84a1a'); }
  // primer plano: rocas, el ángel de piedra llorando a la derecha y la cruz caída
  cg.fillStyle = '#070203'; cg.beginPath(); cg.moveTo(0, CH); cg.lineTo(0, 80); cg.lineTo(14, 74); cg.lineTo(30, 86); cg.lineTo(48, 92); cg.lineTo(60, CH); cg.fill();
  cg.beginPath(); cg.moveTo(CW, CH); cg.lineTo(CW, 70); cg.lineTo(184, 66); cg.lineTo(168, 84); cg.lineTo(150, 96); cg.lineTo(140, CH); cg.fill();
  // ángel de piedra (alas plegadas, cabeza gacha)
  cg.fillStyle = '#2a2224'; cg.beginPath(); cg.moveTo(170, 98); cg.lineTo(166, 72); cg.lineTo(174, 62); cg.lineTo(182, 70); cg.lineTo(184, 98); cg.fill();
  cg.fillStyle = '#3a3034'; C.r(173, 64, 5, 6, '#3a3034'); C.r(172, 70, 7, 22, '#342a2e'); C.r(174, 64, 1, 4, '#4a4044');
  C.r(0, 100, CW, 13, '#050102');
  // flores blancas entre las rocas
  const R = RNG(203); for (let i = 0; i < 60; i++) { const x = R.int(CW), y = 100 + R.int(12); C.r(x, y, 1, 1, i % 4 ? '#8a7a70' : '#c8b8a8'); }
  // ceniza
  for (let i = 0; i < 40; i++) { const ph = (t * 0.06 + i * 0.071) % 1, x = (i * 53 + Math.sin(t + i) * 6) % CW, y = ph * CH; C.r(x, y, 1, 1, `rgba(220,200,200,${0.6 * (1 - ph)})`); }
};
G.renderTitleBg = function (g) {
  cg.save(); SCENES.titulo(this.titleT); cg.restore();
  cinePost();
  g.imageSmoothingEnabled = false; g.drawImage(cineC, 0, 0, WW, WH);
};
G.uiTitle = function (g) {
  // título con sombra roja y subrayado de bronce
  g.font = FT(22);
  const tt = 'El Guardián Errante', tw = g.measureText(tt).width, tx = 28;
  g.fillStyle = 'rgba(140,20,14,0.6)'; g.fillText(tt, tx + 1, 46);
  this.text(g, tt, tx, 44, '#efe2c8');
  g.font = FT(8.5); this.text(g, 'Crónicas de Pozo Alcón', tx + 2, 57, UI.bronzeHi);
  g.fillStyle = UI.bronze; g.fillRect(tx, 61, tw * 0.7, 1); g.fillRect(tx + tw * 0.7, 60, 3, 3);
  // zarza vertical a la izquierda del menú
  const items = this.menu(), y0 = 98, step = 22, x0 = 34;
  g.strokeStyle = '#4a3a30'; g.lineWidth = 1.2; g.beginPath();
  for (let y = y0 - 16; y < y0 + items.length * step; y += 2) { const xx = x0 - 6 + Math.sin(y * 0.35) * 1.6; if (y === y0 - 16) g.moveTo(xx, y); else g.lineTo(xx, y); }
  g.stroke();
  g.fillStyle = '#6a5446';
  for (let y = y0 - 14; y < y0 + items.length * step; y += 5) { const xx = x0 - 6 + Math.sin(y * 0.35) * 1.6, s = (y / 5) % 2 ? 1 : -1; g.fillRect(xx + s * 1.5, y, s * 2.5, 0.8); }
  this.menuList(g, items, y0, step, x0);
  g.font = FB(5.6);
  this.text(g, G.touch ? 'Toca una opción · Juega con el móvil en horizontal' : 'Flechas para elegir · Enter para aceptar · F11 pantalla completa', 30, VH - 8, '#7a6a5a');
};
