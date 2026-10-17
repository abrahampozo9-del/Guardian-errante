// Comprueba los dibujos, los interiores y recorre las nueve misiones: node test/misiones.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n'))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'guardian.html'));
  await page.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 30000 });
  const res = await page.evaluate(() => {
    const log = []; let fails = 0;
    const check = (w, ok) => { log.push((ok ? 'OK   ' : 'FALLO ') + w); if (!ok) fails++; };
    const all = [...document.scripts].map(s => s.textContent).join('\n'); const src = all.slice(all.indexOf('misiones secundarias: Relatos Raros'));
    // dibujos usados por las misiones
    const keys = new Set();
    for (const m of src.matchAll(/Q\.prop\('[a-z_0-9]+', '([a-z_0-9]+)'/g)) keys.add(m[1]);
    for (const m of src.matchAll(/w\.(?:prop|wall)\('([a-z_0-9]+)'/g)) keys.add(m[1]);
    for (const k of keys) check('dibujo ' + k, !!Art.P[k]);
    const ppl = new Set(); for (const m of src.matchAll(/Q\.(?:npc|foe)\('?[a-z_]*'?,? ?'?([a-z_]+)'/g)) ppl.add(m[1]);
    for (const m of src.matchAll(/Q\.npc\('[a-z_]+', '([a-z_]+)'/g)) ppl.add(m[1]);
    for (const k of ppl) check('persona ' + k, !!Art.people[k]);
    // ---------- recorrido de las nueve misiones
    let picks = [];
    const step = () => { G.just = new Set(G.queue); G.queue.clear(); G.update(1 / 60); };
    const run = (...ch) => { picks = ch; let n = 0; while ((G.st === 'DIALOG' || G.st === 'CHOICE' || G.st === 'CINE' || G.st === 'LOAD') && n++ < 200) { if (G.st === 'CINE') G.endCine(); else if (G.st === 'LOAD') { G.loading.t = 99; G.loading.built = false; G.updateLoad(0); } else if (G.st === 'CHOICE') { const c = G.choice; G.choice = null; G.st = 'PLAY'; c.cb(picks.length ? picks.shift() : 0); } else { G.dlgChars = 9999; G.nextPage(); } } };
    const hour = h => { G.day = (((h - 6) / 24) % 1 + 1) % 1; };
    const npc = (key, wid) => { const ids = wid ? [wid] : Object.keys(G.worlds); for (const id of ids) { const n = G.worlds[id].npcs.find(n => n.key === key && n.q) || G.worlds[id].npcs.find(n => n.key === key); if (n) return [id, n]; } return [null, null]; };
    const talk = (key, wid, ...ch) => { const [id, n] = npc(key, wid); if (!n) { check('encuentra a ' + key + (wid ? ' en ' + wid : ''), false); return; } if (G.world.id !== id) G.enter(id, n.x, n.y + 14, 1); G.talk(n); run(...ch); };
    const use = (pid, wid, ...ch) => { const w = G.worlds[wid]; const pr = w.props.find(p => p.id === pid) || w.decor.find(p => p.id === pid); if (!pr) { check('encuentra ' + pid + ' en ' + wid, false); return; } if (G.world.id !== wid) G.enter(wid, pr.x, pr.y + 14, 1); G.use(pr); run(...ch); };
    const kill = () => { for (let i = 0; i < 6; i++) { const ms = G.world.monsters.filter(m => !m.dead); if (!ms.length) break; for (const m of ms) G.killMonster(m); run(); } };
    const st = id => Q.st(id), D = id => Q.d(id);
    const day = () => { G.dayN++; Q.newDay(); };
    const fresh = stage => { G.newGame(); run(); G.player.hasSword = true; G.stage = stage; Q.refresh(); };
    const bfs = (w, sx, sy) => { const seen = new Uint8Array(w.w * w.h), q = [[sx, sy]]; seen[sy * w.w + sx] = 1; while (q.length) { const [x, y] = q.shift(); for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + a, Y = y + c; if (X < 0 || Y < 0 || X >= w.w || Y >= w.h || seen[Y * w.w + X] || w.solid(X, Y)) continue; seen[Y * w.w + X] = 1; q.push([X, Y]); } } return seen; };
    const near = (w, r, x, y) => { for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const X = x + i, Y = y + j; if (X >= 0 && Y >= 0 && X < w.w && Y < w.h && r[Y * w.w + X]) return true; } return false; };
    const reachAll = (label) => { // todo lo de las misiones ha de poderse alcanzar a pie
      for (const id in G.worlds) { const w = G.worlds[id]; if (!w.npcs.some(n => n.q) && !w.props.some(p => p.q)) continue;
        let sx, sy; if (id === 'exterior') { G.openBrambles(); sx = WG.doorX; sy = WG.doorY + 1; } else if (Q.exits[id]) { sx = Q.exits[id][0]; sy = w.h - 2; } else if (id === 'casa_alta') { sx = 18; sy = 5; } else if (id === 'q_infierno') { sx = 5; sy = 6; } else continue;
        const r = bfs(w, sx, sy);
        for (const n of w.npcs) if (n.q) check(label + ': alcanza ' + n.key + ' en ' + id, near(w, r, Math.floor(n.x / TS), Math.floor(n.y / TS)));
        for (const p of w.props) if (p.q && p.id && id !== 'q_infierno') check(label + ': alcanza ' + p.id + ' en ' + id, near(w, r, Math.floor(p.x / TS), Math.floor(p.y / TS) + 1) || near(w, r, Math.floor(p.x / TS), Math.floor(p.y / TS)));
      } };
    try {
      // 1 · La puerta
      fresh(ETAPA.OBSERVATORIO); G.getWorld('pantano');
      talk('manuel'); check('puerta: empieza', st('puerta') === 1);
      use('cochera', 'exterior'); check('puerta: pata de cabra', st('puerta') === 2);
      reachAll('puerta');
      use('q_puerta_casa', 'exterior'); check('puerta: dentro de la casa', G.world.id === 'q_casa_manuel');
      use('q_puerta_gris', 'q_casa_manuel'); check('puerta: cuarto gris', G.world.id === 'q_gris' && st('puerta') === 3 && G.world.monsters.length > 0);
      G.enter('q_casa_manuel', 9 * TS + 8, 10 * TS, 1); Q.go('q_gris'); check('puerta: el reflejo vuelve si sales', G.world.monsters.some(m => m.qfoe && !m.dead));
      kill(); check('puerta: reflejo vencido', st('puerta') === 4);
      use('q_foto', 'q_gris');
      talk('victor', 'q_casa_manuel'); check('puerta: Víctor', st('puerta') === 5);
      const b0 = G.balance || 0; talk('manuel', null, 0); check('puerta: final verdad', Q.done('puerta') && G.balance === b0 + 1);
      // 2 · El bujero
      fresh(ETAPA.GRECO); reachAll('bujero');
      talk('doro', 'exterior'); check('bujero: empieza', st('bujero') === 1);
      use('casablanca', 'exterior'); check('bujero: sótano', G.world.id === 'q_sotano' && G.world.monsters.length === 3);
      kill(); check('bujero: dos oleadas', st('bujero') === 2 && D('bujero').grande);
      reachAll('bujero2');
      use('q_saco', 'exterior'); check('bujero: saco', st('bujero') === 3);
      use('casablanca', 'exterior'); use('q_bujero', 'q_sotano', 1); check('bujero: final Doro', Q.done('bujero') && D('bujero').fin === 'doro');
      // 3 · Los obsequios (camino largo, disparando)
      fresh(ETAPA.IGLESIA); day(); check('obsequios: maletín', st('obsequios') === 1);
      reachAll('obsequios');
      use('q_maletin', 'exterior', 0); check('obsequios: coges las monedas', st('obsequios') === 2);
      day(); use('q_moneda', 'exterior'); check('obsequios: moneda', st('obsequios') === 3);
      day(); talk('ursula', 'exterior'); check('obsequios: Úrsula', st('obsequios') === 4);
      day(); talk('malpario', 'exterior', 0); kill(); check('obsequios: Malparío', st('obsequios') === 5);
      day(); talk('huevo', 'exterior'); use('q_pistola', 'exterior'); check('obsequios: pistola', st('obsequios') === 7);
      day(); reachAll('obsequios7'); use('q_ursula_casa', 'exterior'); talk('casimiro', 'q_casa_ursula', 0); check('obsequios: disparo', st('obsequios') === 8);
      hour(22); G.enter('exterior', WG.doorX * TS + 8, (WG.doorY + 1) * TS + 8, 0); check('obsequios: Casimiro vuelve de noche', G.boss && G.boss.qfoe); kill(); check('obsequios: final', Q.done('obsequios')); 
      // 4 · Nolasco
      fresh(ETAPA.GRECO); talk('curandera', 'exterior'); check('nolasco: empieza', st('nolasco') === 1);
      talk('abuelo', 'exterior'); use('q_olla', 'exterior'); use('q_maletin_n', 'exterior'); check('nolasco: pruebas', st('nolasco') === 3);
      talk('nolasco', 'exterior'); reachAll('nolasco'); talk('sancho', 'exterior'); log.push('n st ' + st('nolasco')); talk('nolasco', 'exterior'); log.push('foes ' + G.world.monsters.filter(m=>m.qfoe).length + ' ' + G.st); kill(); run(0); log.push('n st ' + st('nolasco') + ' ' + G.st + ' ' + JSON.stringify(D('nolasco'))); check('nolasco: final', Q.done('nolasco') && D('nolasco').fin === 'justicia');
      // 5 · Leomatilde
      fresh(ETAPA.CASETA); log.push('stage ' + G.stage + ' ' + G.st + ' ' + JSON.stringify(G.q)); talk('guardia', 'exterior'); log.push('l ' + st('leomatilde') + G.st); check('leomatilde: Curro viejo', st('leomatilde') === 1 && npc('guardia', 'exterior')[1].set === Art.people.curro_viejo);
      hour(12); use('q_ermita', 'exterior'); check('leomatilde: de día cerrada', G.world.id === 'exterior');
      hour(23); use('q_ermita', 'exterior'); check('leomatilde: ermita', G.world.id === 'q_ermita');
      reachAll('leomatilde');
      const hp0 = G.player.maxHp; talk('leovieja', 'q_ermita', 0); check('leomatilde: te quita vida', G.player.maxHp === hp0 - 20 && G.boss);
      kill(); check('leomatilde: final', Q.done('leomatilde') && G.player.maxHp >= hp0 + 10);
      talk('guardia', 'exterior'); check('leomatilde: Curro joven', npc('guardia', 'exterior')[1].set === Art.people.guardia);
      // 6 · Baldomero
      fresh(ETAPA.CASETA); talk('kevin', 'exterior'); check('baldomero: empieza', st('baldomero') === 1);
      reachAll('baldomero');
      day(); hour(13); const c = WG.ruins.conde; G.enter('exterior', c[0] * TS + 8, (c[1] + 1) * TS + 8, 0); log.push('área: ' + G.world.areaName(c[0], c[1] + 1));
      G.updatePlay(1 / 60); run(0); check('baldomero: pelea', !!G.boss && G.boss.customName === 'Baldomero');
      kill(); run(0); check('baldomero: final', Q.done('baldomero') && D('baldomero').fin === 'salvada');
      fresh(ETAPA.CASETA); talk('kevin', 'exterior'); day(); day(); hour(10); G.updatePlay(1 / 60); run(); check('baldomero: tarde', D('baldomero').fin === 'tarde');
      // 7 · Estelas de Alia
      fresh(ETAPA.IGLESIA); talk('javier', 'exterior'); check('alia: empieza', st('alia') === 1);
      reachAll('alia');
      hour(12); use('q_casa_madre', 'exterior'); check('alia: pronto', G.world.id === 'exterior');
      hour(21); use('q_casa_madre', 'exterior'); talk('madre_falsa', 'q_casa_madre', 0); check('alia: pelea', st('alia') === 2 && !!G.boss);
      kill(); use('q_cuadro', 'q_casa_madre'); check('alia: final', Q.done('alia') && D('alia').fin === 'abuela');
      // 8 · Infierno
      fresh(ETAPA.HOTEL); use('caseta', 'exterior', 0); check('infierno: abajo', G.world.id === 'q_infierno');
      kill(); use('q_esc1', 'q_infierno'); kill(); use('q_esc2', 'q_infierno'); kill(); use('q_atril', 'q_infierno'); check('infierno: final', Q.done('infierno'));
      use('q_esc0', 'q_infierno'); check('infierno: vuelta arriba', G.world.id === 'exterior' && !G.world.solid(Math.floor(G.player.x / TS), Math.floor(G.player.y / TS)));
      // 9 · Epílogo
      fresh(ETAPA.GRECO); hour(23); use('cama', 'casa_alta'); check('pasillo: empieza', st('pasillo') === 1);
      for (let i = 0; i < 3; i++) { hour(23); use('cama', 'casa_alta'); }
      check('pasillo: se acerca', D('pasillo').paso === 3);
      Q.set('puerta', QDONE); check('pasillo: misión la aleja', D('pasillo').paso === 1);
      for (let i = 0; i < 6; i++) { hour(23); use('cama', 'casa_alta'); }
      check('pasillo: pelea', st('pasillo') === 2 && !!G.boss); kill(); check('pasillo: final', Q.done('pasillo'));
      // guardar y cargar conserva las misiones
      G.save(); const qs = JSON.stringify(G.q); G.load(); check('guardar/cargar misiones', JSON.stringify(G.q) === qs);
      // diario
      G.st = 'PAUSE'; G.menuIdx = 1; G.queue.add('Enter'); step(); check('diario se abre', G.st === 'QUESTS'); G.render(G.ctx || document.querySelector('canvas').getContext('2d'), 800, 450, 1); check('lista del diario', Q.list().length >= 2);
    } catch (e) { check('excepción: ' + e.message + ' ' + (e.stack || '').split('\n')[1], false); }
    return { log, fails };
  });
  console.log(res.log.join('\n')); console.log('fallos:', res.fails); if (errs.length) console.log('ERRORES:\n' + errs.join('\n'));
  await b.close();
})();
