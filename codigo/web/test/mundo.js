// Capturas del mundo: node test/mundo.js OUTDIR prefijo  (lista de sitios dentro)
const { chromium } = require('playwright');
(async () => {
  const OUT = process.argv[2], pre = process.argv[3] || 'm';
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1200, height: 675 } });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + process.cwd() + '/guardian.html');
  await page.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 30000 });
  await page.evaluate(() => { const l = document.getElementById('cargando'); if (l) l.remove(); G.newGame(); G.dlg = []; G.page = null; G.cine = null; G.st = 'PLAY'; G.player.hasSword = true; G.stage = 5; G.toastT = 0; G.day = 0.3; });
  const sitios = JSON.parse(process.argv[4] || 'null') || [
    ['cortijo', 'exterior', 'WG.doorX', 'WG.doorY+4'], ['ribera', 'exterior', 'WG.rx', 'WG.doorY+14'], ['puente', 'exterior', 'G.bridgeX||WG.rx-8', 'G.bridgeY||100'],
    ['pueblo', 'exterior', 'WG.priestX', 'WG.priestY+4'], ['greco', 'exterior', 'WG.grecoX', 'WG.grecoY+3'], ['cruz', 'exterior', 'WG.crossX', 'WG.crossY+3'],
    ['campo', 'exterior', '150', '120'], ['carcavas', 'exterior', '185', '160'], ['sierra', 'exterior', '30', '55'],
    ['casa_baja', 'casa_baja', '9', '7'], ['casa_alta', 'casa_alta', '12', '6'], ['hotel', 'pantano', '64', '68'],
  ];
  for (const [n, wid, xs, ys] of sitios) {
    const ok = await page.evaluate(([wid, xs, ys]) => { try { const x = eval(xs), y = eval(ys); G.getWorld ? G.getWorld(wid) : 0; if (!G.worlds[wid]) return 'no world'; G.enter(wid, x * 16 + 8, y * 16 + 8, 0); G.world.monsters = []; G.bannerT = 0; G.toastT = 0; G.snapCamera && G.snapCamera(); return 'ok'; } catch (e) { return e.message; } }, [wid, xs, ys]);
    for (let i = 0; i < 3; i++) await page.evaluate(() => { G.update(1 / 60); });
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${OUT}/${pre}_${n}.png` });
    if (ok !== 'ok') console.log(n, ok);
  }
  console.log('errores', errs); await b.close();
})();
