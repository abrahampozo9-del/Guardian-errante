// Fluidez con el bucle real del juego: RS=3 T=30 THR=4 node test/fluidez.js  (THR: procesador N veces más lento)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--enable-precise-memory-info', '--disable-gpu-vsync', '--disable-frame-rate-limit'].slice(0, Number(process.env.NOLIM || 1)) });
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.THR || 4) });
  await page.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'guardian.html'));
  await page.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior && !document.getElementById('cargando'), null, { timeout: 30000 });
  await page.evaluate((RS) => {
    G.rsMax = RS; G.newGame(); G.clearDlg(); G.st = 'PLAY'; G.player.hasSword = true; G.stage = ETAPA.HOTEL; G.player.lvl = 10; G.player.maxHp = G.player.hp = 99999;
    G.guns.own = Object.keys(GUNS); G.guns.eq = 'escopeta'; for (const k in AMMO) G.guns.ammo[k] = 999;
    // medir: intervalo entre fotogramas y lo que tarda cada render
    window.__F = []; const _r = G.render; let last = performance.now();
    G.render = function () { const t = performance.now(); const r = _r.apply(this, arguments); window.__F.push([t - last, performance.now() - t]); last = t; return r; };
    // un jugador de mentira
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']; let ki = 0, n = 0;
    window.__bot = setInterval(() => { n++; if (G.st !== 'PLAY') { G.clearDlg && G.clearDlg(); if (G.st === 'CINE') G.endCine(); G.st = 'PLAY'; }
      if (n % 25 === 0) { G.keys.clear(); G.keys.add(keys[ki++ % 4]); if (ki % 3 === 0) G.keys.add(keys[(ki + 1) % 4]); }
      if (n % 7 === 0) G.queue.add('Space'); if (n % 16 === 0) G.queue.add('KeyF'); if (n % 39 === 0) G.queue.add('ShiftLeft');
      if (n === 150) G.enter('exterior', WG.priestX * 16, (WG.priestY + 4) * 16, 0); if (n === 300) { G.getWorld('pantano'); G.enter('pantano', 60 * 16, 140 * 16, 0); } }, 100);
  }, Number(process.env.RS || 3));
  await page.waitForTimeout(Number(process.env.T || 40) * 1000);
  const r = await page.evaluate(() => {
    clearInterval(window.__bot); const F = window.__F.slice(30);
    const iv = F.map(f => f[0]).sort((a, b) => a - b), rd = F.map(f => f[1]).sort((a, b) => a - b), p = (a, q) => a[Math.floor(a.length * q)].toFixed(1);
    return 'fotogramas ' + F.length + ' · intervalo p50 ' + p(iv, .5) + ' p95 ' + p(iv, .95) + ' p99 ' + p(iv, .99) + ' max ' + iv[iv.length - 1].toFixed(0) + ' ms · >33ms: ' + iv.filter(x => x > 33).length + ' · >50ms: ' + iv.filter(x => x > 50).length + ' | render p50 ' + p(rd, .5) + ' p99 ' + p(rd, .99) + ' · S=' + G.rs + ' (máx ' + G.rsMax + ')';
  });
  console.log(r); if (errs.length) console.log('ERRORES', errs.slice(0, 5));
  await b.close();
})();
