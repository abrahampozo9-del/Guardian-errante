// En cada zona, todas las salidas se alcanzan andando desde donde se entra: node test/salidas.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  await page.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'guardian.html'));
  await page.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 30000 });
  const res = await page.evaluate(() => {
    const log = []; let fails = 0; const check = (w, ok) => { log.push((ok ? 'OK   ' : 'FALLO ') + w); if (!ok) fails++; };
    G.newGame(); G.dlg = []; G.page = null; G.st = 'PLAY'; G.openBrambles();
    const bfs = (w, sx, sy) => { const seen = new Uint8Array(w.w * w.h), q = [[sx, sy]]; seen[sy * w.w + sx] = 1; while (q.length) { const [x, y] = q.shift(); for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + a, Y = y + c; if (X < 0 || Y < 0 || X >= w.w || Y >= w.h || seen[Y * w.w + X] || w.solid(X, Y)) continue; seen[Y * w.w + X] = 1; q.push([X, Y]); } } return seen; };
    const ids = ['exterior', 'pantano', 'bolera', 'pb4', 'sierra', 'campocamara'];
    for (const id of ids) G.getWorld(id);
    for (const id of ids) {
      const w = G.worlds[id];
      // puntos de llegada: los destinos de las salidas de las demás zonas que llevan aquí
      const arrivals = []; for (const o of ids) for (const wp of G.worlds[o].warps) if (wp.to === id) arrivals.push([Math.floor(wp.tx / 16), Math.floor(wp.ty / 16), o]);
      for (const [ax, ay, from] of arrivals) {
        check(id + ': se llega desde ' + from + ' a un sitio libre (' + ax + ',' + ay + ')', !w.solid(ax, ay));
        const r = bfs(w, ax, ay);
        for (const wp of w.warps) { let ok = false; for (let j = 0; j < wp.h; j++) for (let i = 0; i < wp.w; i++) if (r[(wp.y + j) * w.w + wp.x + i]) ok = true; check('  desde ahí, la salida a ' + wp.to, ok); }
      }
    }
    return { log, fails };
  });
  console.log(res.log.join('\n')); console.log('fallos:', res.fails);
  await b.close();
})();
