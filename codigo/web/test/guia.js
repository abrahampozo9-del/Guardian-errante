// La flecha guía a la misión elegida en el diario: node test/guia.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'guardian.html'));
  await page.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 30000 });
  const res = await page.evaluate(() => {
    const log = []; let fails = 0; const check = (w, ok) => { log.push((ok ? 'OK   ' : 'FALLO ') + w); if (!ok) fails++; };
    const run = () => { let n = 0; while ((G.st === 'DIALOG' || G.st === 'CHOICE' || G.st === 'CINE') && n++ < 100) { if (G.st === 'CINE') G.endCine(); else if (G.st === 'CHOICE') { const c = G.choice; G.choice = null; G.st = 'PLAY'; c.cb(0); } else { G.dlgChars = 9999; G.nextPage(); } } };
    const ctx = document.querySelector('canvas').getContext('2d');
    try {
      G.newGame(); run(); G.player.hasSword = true; G.stage = ETAPA.HOTEL; G.getWorld('pantano'); G.getWorld('bolera'); Q.refresh();
      const home = () => G.enter('exterior', WG.doorX * 16 + 8, (WG.doorY + 3) * 16 + 8, 0);
      home();
      const main = G.objectiveTarget(); check('sin elegir nada, guía la principal', !!main && main[2] === 'pantano');
      Q.set('puerta', 1); check('empezar una misión no cambia la guía', !G.q._track);
      G.setGuide(Q.list().find(x => x.id === 'puerta')); check('eliges La puerta', G.q._track === 'puerta');
      { const t = G.objectiveTarget(), c = QG.prop('exterior', 'cochera'); check('la flecha va a la cochera', t && c && t[0] === c[0] && t[1] === c[1]); const a = G.arrowTarget(); check('flecha en el exterior', a && a[0] === c[0]); }
      Q.set('puerta', 2); check('avanzar no cambia la guía', G.q._track === 'puerta');
      { const a = G.arrowTarget(), d = Q.d('puerta').door; check('paso 2: primero la puerta de la casa', a && a[0] === d[0] && a[1] === d[1]); }
      G.enter('q_casa_manuel', 9 * 16 + 8, 10 * 16, 1); { const a = G.arrowTarget(); check('dentro de la casa: la puerta gris', a && a[0] === 12 && a[1] === 9); G.render(ctx, 800, 450, 1); }
      Q.set('puerta', 5); G.enter('q_casa_manuel', 9 * 16 + 8, 10 * 16, 1); { const a = G.arrowTarget(), wp = G.world.warps[0]; check('paso 5 dentro: sal por la puerta', a && wp && Math.abs(a[0] - wp.x) < 2); }
      home(); { const a = G.arrowTarget(), wp = G.world.warps.find(w => w.to === 'pantano'); check('paso 5 fuera: hacia el pantano', a && wp && a[1] === wp.y + Math.floor(wp.h / 2)); }
      // la principal otra vez desde el diario
      G.setGuide(Q.list()[0]); check('vuelves a la principal desde el diario', !G.q._track && Q.list()[0].id === 'main');
      // al cumplir la misión guiada, vuelve a la principal
      G.setGuide(Q.list().find(x => x.id === 'puerta')); Q.set('puerta', QDONE); run(); check('al cumplirla, vuelve la principal', !G.q._track);
      // todas las misiones, todos los pasos: siempre hay a dónde ir, desde casa y desde el pantano
      const steps = { bujero: [1, 2, 3], obsequios: [1, 2, 3, 4, 5, 6, 7, 8], nolasco: [1, 2, 3, 4, 5], leomatilde: [1, 2, 3], baldomero: [1, 2], alia: [1, 2, 3], infierno: [1, 2], pasillo: [1, 2], malasuerte: [1, 2, 3, 4, 5] };
      G.stage = ETAPA.HOTEL;
      for (const id in steps) for (const s of steps[id]) {
        G.q[id] = G.q[id] || { s: 0, d: {} }; G.q[id].s = s; if (id === 'malasuerte' && s >= 4) G.getWorld('campocamara'); Q.refresh(); G.q._track = id;
        home(); const t = G.objectiveTarget(), a = G.arrowTarget();
        G.enter('pantano', 56 * 16, 150 * 16, 1); const a2 = G.arrowTarget();
        check(id + ' paso ' + s + ': destino ' + (t ? t.join(',') : '—') + ', flecha desde casa y desde el pantano', !!t && !!a && !!a2);
      }
      // desde Campocámara hacia el pantano y desde la sierra hacia el pueblo
      G.q.malasuerte.s = 5; G.q._track = 'malasuerte'; G.getWorld('campocamara'); G.enter('campocamara', 30 * 16, 24 * 16, 0); { const a = G.arrowTarget(); check('desde Campocámara, la salida hacia el valle', a && a[0] === 0); }
      G.q.malasuerte.s = 2; Q.d('malasuerte').p = {}; { const a = G.arrowTarget(); check('en Campocámara, a la primera pista', a && a[0] === 34); }
      // obsequios: mientras toca esperar al día siguiente, lo dice y la flecha va a la cama
      G.q.obsequios = { s: 3, d: { robo: true, day: G.dayN } }; G.q._track = 'obsequios'; Q.refresh(); home();
      check('Úrsula aún no está (hasta mañana)', !G.worlds.exterior.npcs.some(n => n.key === 'ursula'));
      check('el objetivo dice que es mañana', /Mañana, Úrsula/.test(Q.defs.obsequios.steps(3)));
      { const t = G.objectiveTarget(); check('la flecha lleva a la cama', t && t[2] === 'casa_alta'); }
      G.dayN++; Q.newDay(); check('al día siguiente Úrsula está en la plaza', G.worlds.exterior.npcs.some(n => n.key === 'ursula'));
      { const t = G.objectiveTarget(), n = G.worlds.exterior.npcs.find(n => n.key === 'ursula'); check('y la flecha va a ella', t && t[2] === 'exterior' && Math.abs(t[0] - n.x / 16) < 2); }
      check('el objetivo ya dice que está', /está en la Plaza/.test(Q.defs.obsequios.steps(3)));
      // diario: hay principal, se desplaza y se dibuja
      G.st = 'QUESTS'; G.qSel = 9; G.render(ctx, 800, 450, 1); check('el diario se dibuja con scroll', G.menuRects.some(r => r.i === 97));
      G.queue.add('Pick97'); G.just = new Set(G.queue); G.queue.clear(); G.update(1 / 60); check('flecha arriba del diario', G.qSel === 8);
      G.st = 'PLAY'; G.save(); const tr = G.q._track; G.load(); run(); check('la elección se guarda', G.q._track === tr);
    } catch (e) { check('excepción: ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' '), false); }
    return { log, fails };
  });
  console.log(res.log.join('\n')); console.log('fallos:', res.fails); if (errs.length) console.log('ERRORES:\n' + errs.join('\n'));
  await b.close();
})();
