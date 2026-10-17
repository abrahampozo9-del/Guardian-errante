// Capturas de las misiones: node test/misiones_fotos.js OUTDIR
const { chromium } = require('playwright');
(async () => {
  const OUT = process.argv[2];
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1200, height: 675 } });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + process.cwd() + '/guardian.html');
  await page.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 30000 });
  await page.evaluate(() => { const l = document.getElementById('cargando'); if (l) l.remove(); G.newGame(); G.dlg = []; G.page = null; G.st = 'PLAY'; G.player.hasSword = true; G.stage = ETAPA.HOTEL;
    for (const k of ['puerta', 'bujero', 'obsequios', 'alia', 'leomatilde', 'nolasco']) G.q[k] = { s: 1, d: {} };
    G.q.puerta.s = 4; G.q.obsequios.s = 7; G.q.obsequios.d.day = -1; G.q.alia.s = 1; G.q.leomatilde.s = 1; G.q._track = 'puerta'; Q.refresh(); });
  const shots = [
    ['cc_plaza', "G.day = 0.3; G.getWorld('campocamara'); Q.refresh(); G.enter('campocamara', 35*16, 21*16, 1)"],
    ['cc_casa', "G.enter('campocamara', 46*16, 26*16, 1)"],
    ['cc_entrada', "G.enter('campocamara', 8*16, 24*16, 3)"],
    ['cc_cocina', "Q.go('q_casa_cc')"],
    ['cc_camino', "G.enter('exterior', 212*16, 114*16, 3)"],
    ['diario', "G.st = 'QUESTS'"],
  ];
  for (const [n, code] of shots) {
    const ok = await page.evaluate(code => { try { G.st = 'PLAY'; eval(code); G.snapCamera && G.snapCamera(); return 'ok'; } catch (e) { return e.message; } }, code);
    for (let i = 0; i < 3; i++) await page.evaluate(() => { const s = G.st; G.update(1 / 60); });
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${OUT}/q_${n}.png` });
    if (ok !== 'ok') console.log(n, ok);
  }
  console.log('errores', errs); await b.close();
})();
