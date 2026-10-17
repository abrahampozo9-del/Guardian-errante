// Perfil de rendimiento: node test/perf.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await page.addInitScript(() => { window.__t0 = performance.now(); });
  await page.goto('file://' + process.cwd() + '/guardian.html');
  await page.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 60000 });
  const r = await page.evaluate(() => {
    const out = {}; out.arranque_total = Math.round(performance.now() - window.__t0);
    // fases del arranque, repitiéndolas
    const time = (n, f) => { const t = performance.now(); f(); out[n] = Math.round(performance.now() - t); };
    time('Art.init', () => Art.init()); time('initTerrain', () => Art.initTerrain()); time('initVegetation', () => Art.initVegetation());
    time('initBuildings', () => Art.initBuildings()); time('initProps2', () => Art.initProps2()); time('initCharacters2', () => Art.initCharacters2());
    time('initPlaces', () => Art.initPlaces()); time('initLandmarks', () => Art.initLandmarks()); time('initEnemies', () => Art.initEnemies());
    time('buildWorlds', () => G.buildWorlds()); time('mundo pantano', () => { delete G.worlds.pantano; G.getWorld('pantano'); }); time('mundo bolera', () => { delete G.worlds.bolera; G.getWorld('bolera'); });
    // fotogramas en el mundo
    const l = document.getElementById('cargando'); if (l) l.remove();
    G.newGame(); G.dlg = []; G.page = null; G.cine = null; G.st = 'PLAY'; G.player.hasSword = true;
    const c = document.createElement('canvas'); c.width = 1280; c.height = 720; const ctx = c.getContext('2d');
    const frames = (label, x, y, day, n = 120) => {
      G.enter('exterior', x * 16, y * 16, 0); G.day = day; G.world.monsters = [];
      for (let i = 0; i < 10; i++) G.render(ctx, 1280, 720, 1);
      let tu = 0, tr = 0;
      for (let i = 0; i < n; i++) { let t = performance.now(); G.update(1 / 60); tu += performance.now() - t; t = performance.now(); G.render(ctx, 1280, 720, 1); tr += performance.now() - t; }
      out[label] = 'update ' + (tu / n).toFixed(2) + ' ms · render ' + (tr / n).toFixed(2) + ' ms';
    };
    frames('día cortijo', WG.doorX, WG.doorY + 6, 0.3); frames('noche cortijo', WG.doorX, WG.doorY + 6, 0.72); frames('día pueblo', WG.priestX, WG.priestY + 4, 0.3); frames('noche pueblo', WG.priestX, WG.priestY + 4, 0.72);
    // desglose del render (día pueblo)
    G.enter('exterior', WG.priestX * 16, (WG.priestY + 4) * 16, 0); G.day = 0.72;
    const parts = ['mood', 'grade', 'nightOverlay', 'fog', 'ambient', 'drawWeather', 'vignette', 'edgeDetail', 'drawHigh', 'drawPlayer', 'drawMonster'];
    const acc = {}; const orig = {};
    for (const p of parts) { orig[p] = G[p]; acc[p] = 0; G[p] = function (...a) { const t = performance.now(); const v = orig[p].apply(this, a); acc[p] += performance.now() - t; return v; }; }
    const t0 = performance.now(); for (let i = 0; i < 60; i++) G.render(ctx, 1280, 720, 1); const tot = (performance.now() - t0) / 60;
    for (const p of parts) G[p] = orig[p];
    out['desglose (noche pueblo, ms/fotograma)'] = 'total ' + tot.toFixed(2) + ' | ' + parts.map(p => p + ' ' + (acc[p] / 60).toFixed(2)).join(' · ');
    // cinemáticas: construcción y fotograma
    const cin = {};
    for (const n of Object.keys(SCENES)) { cg.save(); let t = performance.now(); SCENES[n](2); const tb = performance.now() - t; cg.restore(); t = performance.now(); for (let i = 0; i < 20; i++) { cg.save(); SCENES[n](2 + i / 60); cg.restore(); cinePost(); } cin[n] = Math.round(tb) + ' / ' + ((performance.now() - t) / 20).toFixed(1); }
    out['cinemáticas (construir ms / fotograma ms)'] = JSON.stringify(cin);
    out['memoria JS (MB)'] = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : '?';
    return out;
  });
  for (const k in r) console.log(k.padEnd(42), r[k]);
  const fs = require('fs'); console.log('tamaño guardian.html'.padEnd(42), Math.round(fs.statSync('guardian.html').size / 1024) + ' KB');
  await b.close();
})();
