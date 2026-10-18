// Hermanos, familia, casa, armas, habilidades y engendros nuevos: node test/familia.js
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
    const txt = () => JSON.stringify([G.page, G.dlg]);
    const talkT = (wid, key) => { const w = G.getWorld(wid), n = w.npcs.find(n => n.key === key); if (!n) { check('está ' + key + ' en ' + wid, false); return ''; } if (G.world.id !== wid) G.enter(wid, n.x, n.y + 16, 1); G.talk(n); const t = txt(); run(); return t; };
    const useT = (wid, id) => { const pr = prop(wid, id); if (!pr) { check('existe ' + id + ' en ' + wid, false); return ''; } if (G.world.id !== wid) G.enter(wid, pr.x, pr.y + 16, 1); G.use(pr); const t = txt(); run(); return t; };
    try {
      // ---------- elegir hermano
      G.st = ST.TITLE; G.startIntro(); check('Nueva partida: pantalla de elegir hermano', G.st === 'HEROE'); draw('elegir');
      G.queue.add('ArrowRight'); step(); G.just = new Set(['Enter']); G.updateHeroe();
      check('eliges a Oliver y empieza la intro', G.hero === 'oliver' && G.st === 'CINE' && Art.hero === Art.heroSets.oliver.hero);
      run(); check('la partida empieza', G.st === 'PLAY' || G.st === 'DIALOG');
      check('Oliver es más claro de piel en las cinemáticas', FIG.GSKIN[4] === 0xf4dcc4);
      G.save(); G.hero = 'abraham'; G.load(); run(); check('se guarda el hermano elegido', G.hero === 'oliver' && Art.hero === Art.heroSets.oliver.hero);
      // ---------- Anabelén, Olvera y Mario
      toSierra(0); check('sigue siendo Oliver', G.hero === 'oliver');
      G.getWorld('relojero'); G.stage = E.RELOJERO; Q.refresh();
      let t = talkT('relojero', 'relojero'); check('el Relojero arreglaba relojes en Olvera', /Olvera/.test(t));
      check('Mario está con su madre', G.worlds.relojero.npcs.some(n => n.key === 'mario'));
      t = talkT('relojero', 'candida'); check('se llama Anabelén', /Anabelén/.test(t) && !/Cándida/.test(t)); check('y te presenta a Mario', /Mario/.test(t) && /Olvera/.test(t));
      check('el nombre sobre ella es Anabelén', t.includes('["Anabelén"'));
      t = talkT('relojero', 'mario'); check('Mario habla', t.length > 20);
      check('objetivo con su nombre', !/Cándida/.test(G.objective()));
      draw('relojero con Mario');
      // ---------- el final: la familia se viene a la casa del río
      G.stage = E.ELECCION; G.flags.add('reloj_completo'); G.getWorld('abajo'); G.enter('abajo', 0, 0, 1); ABJ.toChamber(); run();
      use('abajo', 'atril_final', 0, 0); for (let i = 0; i < 5; i++) step(); run();
      check('final de la Tierra', G.stage === E.FIN && G.flags.has('final_tierra'));
      check('llega el hermano', G.flags.has('fam_casa'));
      { const cb = G.worlds.casa_baja, ca = G.worlds.casa_alta;
        check('Anabelén vive en el cortijo', cb.npcs.some(n => n.key === 'candida' && n.name === 'Anabelén'));
        check('el hermano es Abraham y vive en el cortijo', cb.npcs.some(n => n.key === 'hermano' && n.name === 'Abraham'));
        check('Mario vive arriba', ca.npcs.some(n => n.key === 'mario'));
        check('ya no está en la plaza', !G.worlds.exterior.npcs.some(n => n.key === 'candida')); }
      t = talkT('casa_baja', 'hermano'); check('el hermano habla', t.length > 30); t = talkT('casa_baja', 'candida'); check('Anabelén en casa', t.length > 30); t = talkT('casa_alta', 'mario'); check('Mario en casa', /Papá|tío|Olvera|jabalí/.test(t));
      draw('casa con familia');
      G.save(); G.load(); run(); check('al cargar siguen en casa', G.worlds.casa_baja.npcs.some(n => n.key === 'hermano'));
      // con Abraham
      G.setHero('abraham'); toSierra(0); G.stage = E.ELECCION; G.flags.add('reloj_completo'); G.getWorld('abajo'); G.enter('abajo', 0, 0, 1); ABJ.toChamber(); run();
      use('abajo', 'atril_final', 0, 0); for (let i = 0; i < 5; i++) step(); run();
      check('con Abraham: Cándida y Oliver en casa, sin Mario', G.worlds.casa_baja.npcs.some(n => n.key === 'candida' && n.name === 'Cándida') && G.worlds.casa_baja.npcs.some(n => n.key === 'hermano' && n.name === 'Oliver') && !G.worlds.casa_alta.npcs.some(n => n.key === 'mario'));
      // ---------- la casa
      for (const [wid, ids] of [['casa_baja', ['sofa', 'butaca', 'camilla', 'maceta', 'fregadero', 'garrafa', 'silla', 'despensa', 'cajon_cocina', 'foto', 'calendario', 'tele']], ['casa_alta', ['espejo', 'vater', 'bide', 'ducha', 'botiquin', 'cama_hermano', 'cama_padres', 'cama_rosa', 'comoda', 'comoda_madre', 'mesita_padres', 'mesita_tuya', 'mesita_rosa', 'cubo', 'toallas', 'libros', 'pc']]])
        for (const id of ids) { const tt = useT(wid, id); if (tt) check('casa: ' + id, tt.length > 20 && !/primeros auxilios/.test(tt)); }
      G.casaCool = {}; G.player.poison = 5; useT('casa_alta', 'ducha'); check('la ducha quita el veneno', G.player.poison === 0);
      G.casaCool = {}; G.player.hp = 3; useT('casa_alta', 'botiquin'); check('el botiquín cura', G.player.hp === G.player.maxHp);
      { const r = bfs(G.worlds.casa_baja, 9, 11); check('la casa sigue andándose', near(G.worlds.casa_baja, r, 18, 4) && near(G.worlds.casa_baja, r, 3, 3)); }
      // ---------- habilidades
      check('24 habilidades en 4 ramas', SKILLS.length === 4 && SKILLS.every(b => b.list.length === 6));
      G.player.lvl = 30; G.player.skills.clear(); G.player.pts = 24; const atk0 = G.player.atk;
      for (let r = 0; r < 6; r++) for (let b = 0; b < 4; b++) G.learn(r * 4 + b);
      check('se aprenden todas', G.player.skills.size === 24 && G.player.pts === 0 && G.player.atk === atk0 + 4);
      G.openSkills(); draw('habilidades'); G.st = 'PLAY';
      // ---------- armas
      G.enter('exterior', WG.fireX * 16 + 8, (WG.fireY + 3) * 16 + 8, 0); G.world.monsters = []; G.player.invul = 999;
      const p = G.player; G.guns.own = Object.keys(GUNS); for (const k in AMMO) G.guns.ammo[k] = 99;
      for (const id of Object.keys(GUNS)) { G.guns.eq = id; p.gunCool = 0; G.gunFire(); for (let i = 0; i < 20; i++) { step(); if (i % 5 === 0) draw('arma ' + id); } check('animación ' + id, p.gunId === id); }
      // el rifle autoapunta a lo que tienes detrás; la pistola no
      p.dir = 3; G.guns.eq = 'rifle'; p.gunCool = 0; let m = new Monster(MK.HUECO, p.x - 70, p.y, 1); m.spawnFade = 0; G.world.monsters.push(m); let h = m.hp; G.gunFire(); for (let i = 0; i < 30; i++) step();
      check('el rifle autoapunta (detrás de ti)', m.hp < h || m.dead); G.world.monsters = [];
      p.dir = 3; G.guns.eq = 'pistola'; p.gunCool = 0; m = new Monster(MK.HUECO, p.x - 70, p.y, 1); G.world.monsters.push(m); h = m.hp; G.gunFire(); for (let i = 0; i < 30; i++) step();
      check('la pistola dispara hacia donde miras', m.hp === h); G.world.monsters = [];
      // ---------- engendros nuevos
      G.playerSafe = () => false;
      { const w = G.worlds.exterior; let spot = null; for (let y = 90; y < 160 && !spot; y++) for (let x = 20; x < w.w - 20 && !spot; x++) { let ok = true; for (let j = -4; j <= 4 && ok; j++) for (let i = -8; i <= 8 && ok; i++) if (w.solid(x + i, y + j)) ok = false; if (ok) spot = [x, y]; } G.enter('exterior', spot[0] * 16 + 8, spot[1] * 16 + 8, 3); G.world.monsters = []; G.world.lairs.forEach(l => l.cleared = true); }
      for (const k of [MK.PERRO, MK.ESCUPIDOR, MK.MOLE, MK.HUECO]) {
        G.player.invul = 0; G.player.hp = G.player.maxHp = 9999; G.player.poison = 0;
        const mm = new Monster(k, p.x + 60, p.y, 1.2); mm.aggro = true; mm.spawnFade = 0; G.world.monsters = [mm]; const hp0 = G.player.hp; let pz = 0;
        for (let i = 0; i < (k === MK.ESCUPIDOR ? 1200 : 400); i++) { step(); pz = Math.max(pz, G.player.poison || 0); if (i % 100 === 0) draw(k); }
        check(MNAME[k] + ' ataca (' + (hp0 - G.player.hp) + ')', G.player.hp < hp0);
        if (k === MK.ESCUPIDOR) check('el escupidor envenena', pz > 0);
      }
      { const L = G.worlds.exterior.lairs; check('guaridas nuevas', L.some(l => l.kinds.includes(MK.PERRO)) && L.some(l => l.kinds.includes(MK.ESCUPIDOR)) && L.some(l => l.kinds.includes(MK.MOLE)));
        const r = bfs(G.worlds.exterior, WG.doorX, WG.doorY + 1); G.openBrambles && G.openBrambles();
        const r2 = bfs(G.worlds.exterior, WG.doorX, WG.doorY + 1);
        for (const l of L.filter(l => l.kinds.some(k => [MK.PERRO, MK.ESCUPIDOR, MK.MOLE].includes(k)))) check('guarida ' + l.name + ' alcanzable', near(G.worlds.exterior, r2, l.x, l.y)); }
      { G.stage = E.HOTEL; let el = 0; for (let i = 0; i < 60; i++) { const L = { name: 't', x: Math.floor(p.x / 16), y: Math.floor(p.y / 16) + 2, kinds: [MK.HUECO, MK.HUECO], tier: 1 }; G.world.monsters = []; G.spawnLair(L); el += G.world.monsters.filter(x => x.elite).length; } check('salen engendros de élite (' + el + '/120)', el > 3 && el < 40); draw('élite'); }
    } catch (e) { check('excepción: ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' '), false); }
    return { log, fails };
  });
  console.log(res.log.join('\n')); console.log('fallos:', res.fails); if (errs.length) console.log('ERRORES:\n' + errs.join('\n'));
  await b.close();
})();
