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

G.renderTitleBg = function (g) { g.fillStyle = '#000'; g.fillRect(0, 0, WW, WH); };
G.uiTitle = function (g) {
  cg.save(); SCENES.titulo(this.titleT); cg.restore();
  cinePost();
  g.imageSmoothingEnabled = false; g.drawImage(cineC, 0, 0, VW, VH);
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
  const GI = typeof window !== 'undefined' && window.guardianInstall, inst = GI && GI.puede;
  const hint = inst && GI.android ? (GI.directo() ? 'Instálalo como app: elige «Instalar en el móvil»' : 'Instálalo como app: menú ⋮ de Chrome → «Instalar aplicación»')
    : inst && GI.ios ? 'Instálalo como app: Compartir → «Añadir a pantalla de inicio»'
    : G.touch ? 'Toca una opción · Juega con el móvil en horizontal' : 'Flechas para elegir · Enter para aceptar · F11 pantalla completa';
  this.text(g, hint, 30, VH - 8, inst ? '#e8c46a' : '#7a6a5a');
};
