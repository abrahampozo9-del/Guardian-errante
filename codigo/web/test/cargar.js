// Guardar en cada zona y continuar desde el título en una página recién abierta: node test/cargar.js
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); let fails = 0;
await p.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'guardian.html'));
await p.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 30000 });
const ids = ['exterior', 'casa_alta', 'pantano', 'bolera', 'pb4', 'sierra', 'relojero', 'buhardilla', 'campocamara', 'q_casa_cc', 'abajo', 'q_gris', 'q_sotano', 'q_ermita', 'q_infierno'];
for (const id of ids) {
  await p.evaluate(id => { G.newGame(); G.dlg = []; G.page = null; G.st = 'PLAY'; G.stage = ETAPA.VUELTA; G.getWorld(id); const w = G.worlds[id]; let x = 5, y = 5; outer: for (let j = Math.floor(w.h / 2); j < w.h - 2; j++) for (let i = 2; i < w.w - 2; i++) if (!w.solid(i, j) && !w.warps.some(wp => i >= wp.x && i < wp.x + wp.w && j >= wp.y && j < wp.y + wp.h)) { x = i; y = j; break outer; } G.enter(id, x * 16 + 8, y * 16 + 8, 0); G.save(); }, id);
  await p.reload(); await p.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 30000 });
  const r = await p.evaluate(() => { try { const l = document.getElementById('cargando'); if (l) l.remove(); G.st = 'TITLE'; G.hasSave = !!G.readSave(); G.menuIdx = 0; G.queue.add('Enter'); for (let i = 0; i < 5; i++) { G.just = new Set(G.queue); G.queue.clear(); G.update(1 / 60); } return G.world ? G.world.id : 'ninguno'; } catch (e) { return 'excepción ' + e.message; } });
  const ok = r === id; if (!ok) fails++; console.log((ok ? 'OK   ' : 'FALLO ') + 'continuar en ' + id + (ok ? '' : ' → ' + r));
}
console.log('fallos:', fails); await b.close(); })();
