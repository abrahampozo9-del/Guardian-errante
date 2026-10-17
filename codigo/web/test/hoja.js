// Hoja de contacto de cinemáticas: node test/hoja.js OUT.png [escena,escena...] [t]
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2], only = process.argv[3] && process.argv[3] !== 'all' ? process.argv[3].split(',') : null, T = +(process.argv[4] || 2.5);
  const b = await chromium.launch(); const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + process.cwd() + '/guardian.html');
  await page.waitForFunction(() => typeof G !== 'undefined' && typeof SCENES !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 30000 });
  await page.waitForTimeout(500);
  const data = await page.evaluate(([only, T]) => {
    const names = only || Object.keys(SCENES);
    const S = 2, cols = names.length > 4 ? 3 : Math.min(2, names.length), rows = Math.ceil(names.length / cols);
    const W = cineC.width * S, H = cineC.height * S;
    const big = document.createElement('canvas'); big.width = cols * W; big.height = rows * (H + 14);
    const g = big.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, big.width, big.height); g.imageSmoothingEnabled = false;
    const times = {};
    names.forEach((n, i) => {
      const t0 = performance.now();
      cg.save(); try { SCENES[n](T); } catch (e) { cg.restore(); cg.fillStyle = '#f00'; cg.fillRect(0, 0, 20, 20); console.error(n + ': ' + e.message); } cg.restore();
      if (window.cinePost) cinePost();
      times[n] = Math.round(performance.now() - t0);
      const x = (i % cols) * W, y = Math.floor(i / cols) * (H + 14);
      g.drawImage(cineC, x, y, W, H); g.fillStyle = '#ccc'; g.font = '11px sans-serif'; g.fillText(n + ' (' + times[n] + 'ms)', x + 4, y + H + 11);
    });
    return { url: big.toDataURL('image/png'), times };
  }, [only, T]);
  require('fs').writeFileSync(out, Buffer.from(data.url.split(',')[1], 'base64'));
  console.log(JSON.stringify(data.times)); if (errs.length) console.log('ERRORES', errs);
  await b.close();
})();
