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
    ['gris', "G.enter('q_gris', 20*16, 18*16, 1); Q.foe(G.world, 'reflejo', 'El reflejo gris', 24*16, 14*16, { set: Art.people.reflejo, boss: true });"],
    ['casa_manuel', "G.enter('q_casa_manuel', 9*16+8, 10*16, 1)"],
    ['sotano', "Q.go('q_sotano')"],
    ['ermita', "G.day = 0.7; Q.go('q_ermita')"],
    ['madre', "Q.go('q_casa_madre')"],
    ['ursula', "Q.go('q_casa_ursula')"],
    ['infierno', "G.enter('q_infierno', 50*16, 9*16, 1); Q.sala(2)"],
    ['doro', "G.day = 0.3; G.q.bujero.s = 0; Q.refresh(); const n = G.worlds.exterior.npcs.find(n => n.key === 'doro'); G.enter('exterior', n.x, n.y + 20, 1)"],
    ['iglesia', "const n = G.worlds.exterior.npcs.find(n => n.key === 'nolasco'); G.enter('exterior', n.x + 20, n.y + 10, 1)"],
    ['plaza', "const n = G.worlds.exterior.npcs.find(n => n.key === 'kevin'); G.enter('exterior', n.x, n.y + 10, 1)"],
    ['diario', "G.st = 'QUESTS'"],
    ['pausa', "G.st = 'PAUSE'; G.menuIdx = 1"],
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
