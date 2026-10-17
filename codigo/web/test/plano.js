// Plano completo de un mundo: node test/plano.js OUT.png [mundo] [escala]
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2], wid = process.argv[3] || 'exterior', S = +(process.argv[4] || 4);
  const b = await chromium.launch(); const page = await b.newPage();
  await page.goto('file://' + process.cwd() + '/guardian.html');
  await page.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 30000 });
  const url = await page.evaluate(([wid, S]) => {
    const w = G.getWorld ? G.getWorld(wid) : G.worlds[wid];
    const c = document.createElement('canvas'); c.width = w.w * S; c.height = w.h * S; const g = c.getContext('2d');
    for (let y = 0; y < w.h; y++) for (let x = 0; x < w.w; x++) { g.fillStyle = css(Art.tileColor[w.get(x, y)]); g.fillRect(x * S, y * S, S, S); }
    for (const p of w.props) { if (p.hidden) continue; const big = p.img.h > 18; g.fillStyle = big ? 'rgba(10,40,10,0.85)' : 'rgba(60,40,20,0.6)'; g.fillRect(Math.floor(p.x / 16) * S, Math.floor((p.y - 1) / 16) * S, S, S); }
    for (const n of w.npcs) { g.fillStyle = '#ff0'; g.fillRect(n.x / 16 * S - 2, n.y / 16 * S - 2, 5, 5); }
    for (const k of w.pickups) { g.fillStyle = k.type === Pickup.RELIC ? '#f0f' : '#0f0'; g.fillRect(k.x / 16 * S - 2, k.y / 16 * S - 2, 4, 4); }
    for (const L of (w.lairs || [])) { g.strokeStyle = '#f00'; g.strokeRect(L.x * S - 4, L.y * S - 4, 8, 8); }
    for (const wp of w.warps) { g.strokeStyle = '#0ff'; g.lineWidth = 2; g.strokeRect(wp.x * S, wp.y * S, wp.w * S, wp.h * S); }
    g.font = (S * 3) + 'px sans-serif'; g.fillStyle = '#fff';
    for (const [n, x, y] of (w.labels || [])) { g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillText(n, x * S + 1, y * S + 1); g.fillStyle = '#fff'; g.fillText(n, x * S, y * S); }
    return c.toDataURL();
  }, [wid, S]);
  require('fs').writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); await b.close();
})();
