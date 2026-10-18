// Capítulos IV y V y los tres finales: node test/historia.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'guardian.html'));
  await page.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 30000 });
  const res = await page.evaluate(() => {
    const log = []; let fails = 0; const check = (w, ok) => { log.push((ok ? 'OK   ' : 'FALLO ') + w); if (!ok) fails++; };
    let picks = [];
    const run = (...ch) => { if (ch.length) picks = ch; let n = 0; while ((G.st === 'DIALOG' || G.st === 'CHOICE' || G.st === 'CINE' || G.st === 'LOAD') && n++ < 300) { if (G.st === 'CINE') G.endCine(); else if (G.st === 'LOAD') { G.loading.t = 99; G.loading.built = false; G.updateLoad(0); G.updateLoad(0); } else if (G.st === 'CHOICE') { const c = G.choice; G.choice = null; G.st = 'PLAY'; c.cb(picks.length ? picks.shift() : 0); } else { G.dlgChars = 9999; G.nextPage(); } } };
    const step = (n = 1) => { for (let i = 0; i < n; i++) { G.just = new Set(G.queue); G.queue.clear(); G.update(1 / 60); run(); } };
    const bfs = (w, sx, sy) => { const seen = new Uint8Array(w.w * w.h), q = [[sx, sy]]; seen[sy * w.w + sx] = 1; while (q.length) { const [x, y] = q.shift(); for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + a, Y = y + c; if (X < 0 || Y < 0 || X >= w.w || Y >= w.h || seen[Y * w.w + X] || w.solid(X, Y)) continue; seen[Y * w.w + X] = 1; q.push([X, Y]); } } return seen; };
    const near = (w, r, x, y) => { for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const X = x + i, Y = y + j; if (X >= 0 && Y >= 0 && X < w.w && Y < w.h && r[Y * w.w + X]) return true; } return false; };
    const prop = (wid, id) => G.getWorld(wid) && G.worlds[wid].props.find(p => p.id === id);
    const use = (wid, id, ...ch) => { const pr = prop(wid, id); if (!pr) { check('existe ' + id + ' en ' + wid, false); return; } if (G.world.id !== wid) G.enter(wid, pr.x, pr.y + 16, 1); G.use(pr); run(...ch); };
    const talk = (wid, key, ...ch) => { const w = G.getWorld(wid), n = w.npcs.find(n => n.key === key); if (!n) { check('está ' + key + ' en ' + wid, false); return; } if (G.world.id !== wid) G.enter(wid, n.x, n.y + 16, 1); G.talk(n); run(...ch); };
    const killAll = (...ch) => { for (let i = 0; i < 10; i++) { const ms = G.world.monsters.filter(m => !m.dead); if (!ms.length) break; for (const m of ms) G.killMonster(m); run(...ch); } };
    const canvas = document.querySelector('canvas'), ctx = canvas.getContext('2d');
    const draw = label => { try { G.render(ctx, 800, 450, 1); return true; } catch (e) { check('dibuja ' + label + ': ' + e.message, false); return false; } };
    const E = ETAPA;
    const toSierra = (balance) => {
      G.newGame(); run(); G.player.hasSword = true; G.player.lvl = 8; G.flags.add('esfera'); G.flags.add('agujas'); G.flags.add('trato_rechazado'); G.stage = E.SIERRA; G.balance = balance; G.getWorld('pantano'); G.getWorld('bolera');
    };
    try {
      // ---------- capítulo IV
      toSierra(0);
      check('objetivo PB4 con flecha', !!G.objectiveTarget() && /PB4/.test(G.objective()));
      use('bolera', 'cueva_pb4'); check('entras en la PB4 y empieza la cueva', G.world.id === 'pb4' && G.stage === E.CUEVA);
      check('la cueva está a oscuras', G.world.cave && G.darkness() > 0.9); draw('cueva');
      { const w = G.world, r = bfs(w, SIE.caveIn[0], SIE.caveIn[1]); check('la cueva se cruza andando', near(w, r, SIE.caveOut[0], SIE.caveOut[1])); check('hay engendros en la cueva', w.monsters.filter(m => !m.dead).length >= 10); }
      G.player.fe = 60; G.pray(); check('rezar alumbra la cueva', G.caveLit > 0);
      // cruzar la salida del este
      G.world.monsters = []; G.player.x = (SIE.caveOut[0] + 2) * 16 + 8; G.player.y = SIE.caveOut[1] * 16 + 8; step(3);
      check('sales a la Sierra de Castril', G.world.id === 'sierra' && G.stage === E.RELOJERO); draw('sierra');
      { const w = G.world, r = bfs(w, 4, 42); check('de la cueva al cortijo andando', near(w, r, SIE.door[0], SIE.door[1] + 1)); for (const L of w.lairs) check('guarida ' + L.name + ' alcanzable', near(w, r, L.x, L.y)); check('hoguera del relojero alcanzable', near(w, r, SIE.fire[0], SIE.fire[1])); }
      { const w = G.world, r = bfs(w, 4, 42), wp = w.warps.find(x => x.to === 'pb4'); check('de vuelta: se llega andando a la boca de la cueva', wp && [0, 1, 2, 3, 4].some(j => near(w, r, wp.x, wp.y + j))); }
      { const sx = G.player.x, sy = G.player.y; use('sierra', 'cueva_sierra'); check('usar la boca de la cueva te mete en la PB4', G.world.id === 'pb4'); G.world.monsters = []; G.player.x = 1 * 16 + 8; G.player.y = SIE.caveIn[1] * 16 + 8; G.player.x -= 16; step(3); check('y al otro lado sales a La Bolera', G.world.id === 'bolera'); G.enter('sierra', sx, sy, 0); }
      use('sierra', 'relojero_puerta'); check('dentro del taller', G.world.id === 'relojero'); draw('taller');
      { const w = G.world, r = bfs(w, 8, 10); check('escalera de la buhardilla alcanzable', near(w, r, 15, 3)); }
      talk('relojero', 'relojero'); check('el Relojero cuenta lo de los dos relojes', G.stage === E.CANDIDA);
      talk('relojero', 'candida'); check('Cándida', G.stage === E.BUHARDILLA);
      G.enter('buhardilla', 3 * 16 + 8, 6 * 16 + 8, 3); draw('buhardilla');
      { const w = G.world, r = bfs(w, 3, 6); check('el reloj grande alcanzable', near(w, r, 8, 4)); check('Cándida sube contigo', w.npcs.some(n => n.key === 'candida')); }
      use('buhardilla', 'reloj_gigante'); check('la revelación y la cuerda', G.stage === E.GUARDA && G.flags.has('cuerda') && G.flags.has('recuerdo'));
      G.enter('sierra', SIE.door[0] * 16 + 8, (SIE.door[1] + 1) * 16 + 8, 0); run();
      check('el hombre de la caseta sube a la sierra', !!G.boss && G.boss.casetero);
      step(20); killAll(); check('vences al hombre de la caseta', G.flags.has('casetero_muerto') && !G.boss);
      talk('sierra', 'candida'); check('Reloj del Cielo completo', G.stage === E.VUELTA && G.flags.has('reloj_completo'));
      talk('relojero', 'relojero'); check('el Relojero te arregla el reloj de pulsera', G.flags.has('reloj_pulsera'));
      // guardar y cargar en la sierra
      G.enter('sierra', SIE.fire[0] * 16 + 8, (SIE.fire[1] + 1) * 16 + 8, 0); G.save(); G.load(); run(); check('cargar en la sierra', G.world.id === 'sierra' && G.stage === E.VUELTA);
      // ---------- capítulo V
      G.enter('exterior', WG.fireX * 16 + 8, (WG.fireY + 4) * 16 + 8, 0); step(3);
      check('el asedio de Pozo Alcón', G.stage === E.ASEDIO && G.world.monsters.some(m => m.asedio && !m.dead)); draw('asedio');
      check('Miguel y los ángeles bajan', G.world.npcs.some(n => n.key === 'miguel_pie') && G.world.npcs.filter(n => n.key === 'angel').length >= 2);
      { const w = G.world, r = bfs(w, WG.doorX, WG.doorY + 1); for (const m of w.monsters.filter(m => m.asedio)) check('demonio del asedio alcanzable', near(w, r, Math.floor(m.x / 16), Math.floor(m.y / 16))); }
      { const ms = G.world.monsters.filter(m => m.asedio), hp = ms.reduce((a, m) => a + m.hp, 0); G.player.invul = 99; for (let i = 0; i < 300; i++) step(); check('los ángeles atacan a los demonios', ms.reduce((a, m) => a + Math.max(0, m.hp), 0) < hp || ms.some(m => m.dead)); G.player.invul = 0; }
      killAll(); step(3); check('la plaza es nuestra: a la caseta', G.stage === E.BAJADA);
      check('Cándida espera en la plaza', G.world.npcs.some(n => n.key === 'candida'));
      use('exterior', 'caseta'); check('bajas por la caseta', G.world.id === 'abajo' && ABJ.room === 0); draw('escaleras');
      // el acertijo: una salida equivocada te devuelve al principio del tramo
      const r0 = ABJ.rooms[0], bad = (r0.good + 1) % 3;
      G.player.x = r0.exits[bad][0] * 16 + 8; G.player.y = r0.exits[bad][1] * 16 + 8; step(1); check('salida equivocada: vuelves a empezar', ABJ.room === 0 && Math.floor(G.player.y / 16) === r0.entry[1]);
      check('reloj de pulsera y los de las salidas', r0.shown[r0.good] === 12 - r0.h);
      for (let i = 0; i < 3; i++) { const r = ABJ.rooms[i]; const w = G.world, rr = bfs(w, r.entry[0], r.entry[1]); check('tramo ' + (i + 1) + ': salidas alcanzables', r.exits.every(([x, y]) => near(w, rr, x, y))); G.player.x = r.exits[r.good][0] * 16 + 8; G.player.y = r.exits[r.good][1] * 16 + 8; step(1); }
      check('llegas al atril', ABJ.room === 3 && G.stage === E.ATRIL && G.world.monsters.some(m => m.lider)); draw('atril');
      { const w = G.world, rr = bfs(w, ABJ.chamber.entry[0], ABJ.chamber.entry[1]); check('el atril alcanzable', near(w, rr, 32, 31)); }
      // morir aquí y volver: el líder sigue
      G.player.dead = true; G.respawn(); run(); use('exterior', 'caseta'); check('al volver, el líder te espera', ABJ.room === 3 && G.world.monsters.some(m => m.lider && !m.dead));
      for (const m of G.world.monsters.filter(m => !m.dead)) G.killMonster(m); run(); check('el hombre de blanco y Miguel', G.stage === E.ANTICRISTO && G.world.monsters.some(m => m.anticristo && !m.dead) && G.world.npcs.some(n => n.key === 'miguel_pie'));
      { const ac = G.world.monsters.find(m => m.anticristo), hp = ac.hp; G.damageMonster(ac, 100, false, 1, 0, false); check('el acero le hace poco (' + (hp - ac.hp) + ')', hp - ac.hp === 60); }
      G.save(); const svSt = G.stage; G.load(); run(); check('cargar a mitad del jefe final', G.stage === svSt);
      use('exterior', 'caseta'); check('vuelve el hombre de blanco', G.world.monsters.some(m => m.anticristo && !m.dead));
      killAll(); check('la elección', G.stage === E.ELECCION);
      use('abajo', 'atril_final', 0, 0); check('sin balanza no hay salida al cielo: Tierra', G.stage === E.FIN && G.flags.has('final_tierra') && G.world.id === 'exterior');
      check('objetivo final', /Fin/.test(G.objective())); draw('fin');
      // ---------- los otros dos finales
      for (const [bal, ch, fin] of [[5, 0, 'final_cielo'], [0, 2, 'final_infierno']]) {
        toSierra(bal); G.stage = E.ELECCION; G.flags.add('reloj_completo'); G.getWorld('abajo'); G.enter('abajo', 0, 0, 1); ABJ.toChamber(); run();
        use('abajo', 'atril_final', ch); check(fin, G.stage === E.FIN && G.flags.has(fin));
      }
      // ---------- cinemáticas nuevas
      for (const n of ['cueva', 'sierra', 'relojes', 'greco', 'escaleras', 'atril', 'subida']) { try { SCENES[n](1.5); SCENES[n](8); check('cinemática ' + n, true); } catch (e) { check('cinemática ' + n + ': ' + e.message, false); } }
      for (const c of ['cueva', 'sierra', 'recuerdo', 'asedio', 'bajada', 'final_cielo', 'final_tierra', 'final_infierno']) check('textos ' + c, !!CINE[c] && CINE[c].pages.every(p => SCENES[p[0]]));
    } catch (e) { check('excepción: ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' '), false); }
    return { log, fails };
  });
  console.log(res.log.join('\n')); console.log('fallos:', res.fails); if (errs.length) console.log('ERRORES:\n' + errs.join('\n'));
  await b.close();
})();
