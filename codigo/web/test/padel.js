// Pádel: partidos simulados (IA contra IA) y uno contigo dándole cuando llega la bola: node test/padel.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'guardian.html'));
  await page.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 30000 });
  const res = await page.evaluate(() => {
    const out = [];
    const run = () => { let n = 0; while ((G.st === 'DIALOG' || G.st === 'CHOICE') && n++ < 50) { if (G.st === 'CHOICE') { const c = G.choice; G.choice = null; G.st = 'PLAY'; c.cb(0); } else { G.dlgChars = 9999; G.nextPage(); } } };
    G.newGame(); run(); G.player.hasSword = true; G.stage = ETAPA.HOTEL; G.player.herbs = 5;
    G.getWorld('pantano'); const pr = G.worlds.pantano.props.find(p => p.id === 'padel'); G.enter('pantano', pr.x, pr.y + 16, 1);
    G.use(pr); run(); out.push('empieza: ' + G.st + ' apuesta ' + (G.padel && G.padel.bet));
    // IA contra IA (tu jugador también lo lleva la máquina)
    const stats = { points: 0, hits: 0, why: {} };
    const _hit = G.padelHit; G.padelHit = function (q, k, a) { stats.hits++; return _hit.call(this, q, k, a); };
    const _pt = G.padelPointTo; G.padelPointTo = function (t, why) { if (this.padel.phase === 'rally') { stats.points++; stats.why[why] = (stats.why[why] || 0) + 1; } return _pt.call(this, t, why); };
    let matches = 0, wins = 0, frames = 0;
    for (let m = 0; m < 6; m++) {
      if (!G.padel) { G.use(pr); run(); }
      G.padel.pl[0].ai = true; G.padel.pl[0].err = 0.12;
      let f = 0; while (G.padel && f++ < 60 * 60 * 20) { G.just = new Set(); G.update(1 / 60); frames++; }
      const won = G.flags.has('padel_win'); matches++; run();
      out.push('partido ' + m + ': ' + (G.padel ? 'NO TERMINA' : 'terminado') + ' en ' + Math.round(f / 60) + ' s');
      if (G.padel) break;
    }
    out.push('golpes por punto: ' + (stats.hits / Math.max(1, stats.points)).toFixed(2) + ' · motivos: ' + JSON.stringify(stats.why));
    // tú: pulsas golpe cuando la bola está cerca
    G.use(pr); run(); const P = G.padel; let mine = 0, myPts = 0, f = 0;
    const _h2 = G.padelHit; G.padelHit = function (q, k, a) { if (q === P.pl[0]) mine++; return _h2.call(this, q, k, a); };
    while (G.padel && f++ < 60 * 60 * 15) {
      const me = P.pl[0], bl = P.ball; G.just = new Set(); G.keys = new Set(); G.stick = { x: 0, y: 0 };
      if (bl && !bl.held && bl.side === 0 && bl.lastTeam === 1) { const dx = bl.x - me.x, dy = bl.y - me.y, d = Math.hypot(dx, dy); if (d > 0.4) { G.stick = { x: dx / d, y: dy / d }; } if (d < 1.1 && bl.z < 2 && !(bl.serve && bl.bounces === 0)) G.just.add('Space'); }
      if (P.phase === 'serve' && P.serverP === me && P.phaseT > 0.5) G.just.add('Space');
      G.update(1 / 60);
    }
    out.push('partido contigo: ' + (G.padel ? 'NO TERMINA' : 'terminado') + ', golpes tuyos ' + mine + ', resultado ' + P.games.join('-'));
    run(); out.push('estado al final: ' + G.st + ' · mundo ' + G.world.id + ' · hierbas ' + G.player.herbs);
    return out;
  });
  console.log(res.join('\n')); if (errs.length) console.log('ERRORES:\n' + errs.join('\n'));
  await b.close();
})();
