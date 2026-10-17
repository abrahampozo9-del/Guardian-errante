// Hoja de props: node test/props.js OUT.png [filtro]
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2], filt = process.argv[3] ? new RegExp(process.argv[3]) : null;
  const b = await chromium.launch(); const page = await b.newPage();
  await page.goto('file://' + process.cwd() + '/guardian.html');
  await page.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 30000 });
  const url = await page.evaluate((f) => {
    const keys = Object.keys(Art.P).filter(k => !f || new RegExp(f).test(k)), S = 3;
    const c = document.createElement('canvas'); c.width = 1500; c.height = 1400; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.fillStyle = '#4c5a2e'; g.fillRect(0, 0, c.width, c.height);
    let x = 4, y = 4, rowH = 0;
    for (const k of keys) { const im = Art.P[k]; if (!im || !im.w) continue; const w = im.w * S, h = im.h * S; if (x + w > c.width) { x = 4; y += rowH + 16; rowH = 0; } g.drawImage(cv(im), x, y, w, h); g.fillStyle = '#fff'; g.font = '10px sans-serif'; g.fillText(k, x, y + h + 11); x += Math.max(w, 60) + 8; rowH = Math.max(rowH, h); }
    return c.toDataURL();
  }, process.argv[3] || null);
  require('fs').writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); await b.close();
})();
