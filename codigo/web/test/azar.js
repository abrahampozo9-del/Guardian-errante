// Pruebas al azar por todas las zonas y pantallas (errores y estados imposibles): node test/azar.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' | ' + (e.stack || '').split('\n').slice(1, 3).join(' ')));
  await page.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'guardian.html'));
  await page.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 30000 });
  const r = await page.evaluate(() => {
    const out = [], bad = {}; const note = (k, v) => { if (!bad[k]) { bad[k] = v; } };
    const l = document.getElementById('cargando'); if (l) l.remove(); window.requestAnimationFrame = () => 0;
    const c = document.querySelector('canvas'), ctx = c.getContext('2d');
    const R = RNG(1234);
    const KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyE', 'KeyF', 'KeyR', 'KeyK', 'KeyL', 'KeyQ', 'ShiftLeft', 'KeyM', 'Escape', 'Enter', 'KeyH', 'Tap', 'Pick0', 'Pick1', 'Pick2', 'Pick3'];
    const step = (n) => { for (let i = 0; i < n; i++) {
      if (R.next() < 0.08) { G.keys.clear(); const k = KEYS[R.int(4)]; G.keys.add(k); if (R.next() < 0.3) G.keys.add(KEYS[R.int(4)]); }
      if (R.next() < 0.06) G.queue.add(KEYS[4 + R.int(KEYS.length - 4)]);
      try { const j = G.just; j.clear(); for (const k of G.queue) j.add(k); G.queue.clear(); G.update(1 / 60); if (i % 3 === 0) G.render(ctx, 960, 540, 1); }
      catch (e) { note('excepción en ' + G.st + ' / ' + (G.world && G.world.id), e.message + ' ' + (e.stack || '').split('\n')[1]); }
      const p = G.player;
      if (p && (!isFinite(p.x) || !isFinite(p.y) || !isFinite(p.hp))) note('jugador NaN en ' + G.world.id, [p.x, p.y, p.hp].join());
      if (G.world) for (const m of G.world.monsters) if (!isFinite(m.x) || !isFinite(m.y) || !isFinite(m.hp)) note('engendro NaN ' + m.kind + ' en ' + G.world.id, [m.x, m.y, m.hp].join());
      if (p && G.world && G.st === 'PLAY' && !p.rolling && G.world.blocked(p.x, p.y, p.hw, p.hh)) { p._stuck = (p._stuck || 0) + 1; if (p._stuck > 120) note('jugador atrapado en ' + G.world.id, Math.round(p.x / 16) + ',' + Math.round(p.y / 16)); } else if (p) p._stuck = 0;
      if (G.st === 'DEAD' && R.next() < 0.05) { try { G.respawn(); } catch (e) { note('respawn', e.message); } }
      if (G.st === 'TITLE') { try { G.newGame(); G.clearDlg(); G.st = 'PLAY'; } catch (e) { note('newGame', e.message); } }
    } };
    G.newGame(); G.clearDlg(); G.st = 'PLAY'; const p = G.player; p.hasSword = true; G.stage = ETAPA.SIERRA; p.lvl = 15; p.maxHp = p.hp = 5000; p.herbs = 9;
    G.guns.own = Object.keys(GUNS); G.guns.eq = 'rifle'; for (const k in AMMO) G.guns.ammo[k] = 99; G.duros = 999;
    const ids = ['exterior', 'casa_baja', 'casa_alta', 'pantano', 'bolera', 'pb4', 'sierra', 'relojero', 'buhardilla', 'campocamara', 'abajo', 'q_casa_manuel', 'q_gris', 'q_sotano', 'q_ermita', 'q_casa_madre', 'q_casa_ursula', 'q_casa_cc', 'q_infierno'];
    for (const id of ids) {
      let w; try { w = G.getWorld(id); } catch (e) { note('getWorld ' + id, e.message); continue; } if (!w) { note('no existe ' + id, ''); continue; }
      // sitio libre al azar
      let spot = null; for (let t = 0; t < 400 && !spot; t++) { const x = 2 + R.int(w.w - 4), y = 2 + R.int(w.h - 4); if (!w.blocked(x * 16 + 8, y * 16 + 8, 5, 3)) spot = [x, y]; }
      if (!spot) { note('sin sitio libre en ' + id, ''); continue; }
      try { G.enter(id, spot[0] * 16 + 8, spot[1] * 16 + 8, 0); } catch (e) { note('enter ' + id, e.message); continue; }
      G.st = 'PLAY'; p.hp = p.maxHp;
      step(60 * 25);
      if (G.st !== 'PLAY') { G.clearDlg && G.clearDlg(); if (G.st === 'CINE') G.endCine(); G.st = 'PLAY'; }
      out.push(id + ' ok');
    }
    // pantallas: pausa, mapa, habilidades, diario, taller, pádel, elegir hermano
    for (const s of ['PAUSE', 'MAP', 'SKILLS', 'QUESTS']) { G.enter('exterior', WG.doorX * 16 + 8, (WG.doorY + 2) * 16, 0); G.st = s; step(200); }
    try { G.startPadel(10); step(60 * 40); } catch (e) { note('pádel', e.message); }
    try { G.st = 'TITLE'; G.startIntro(); step(30); } catch (e) { note('elegir hermano', e.message); }
    // guardar y cargar en cada zona
    for (const id of ids) { try { const w = G.getWorld(id); G.enter(id, w.w * 8, w.h * 8, 0); G.st = 'PLAY'; G.save(); G.load(); if (G.world.id !== id && !['abajo', 'q_infierno', 'q_gris'].includes(id)) note('carga en ' + id + ' acaba en ' + G.world.id, ''); } catch (e) { note('guardar/cargar ' + id, e.message); } }
    return { out: out.length, bad };
  });
  console.log(JSON.stringify(r, null, 1)); console.log('errores de página:', errs.slice(0, 10));
  await b.close();
})();
