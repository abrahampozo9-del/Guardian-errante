// Duros, taller y armas de distancia: node test/taller.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'guardian.html'));
  await page.waitForFunction(() => typeof G !== 'undefined' && G.worlds && G.worlds.exterior, null, { timeout: 30000 });
  const res = await page.evaluate(() => {
    const log = []; let fails = 0; const check = (w, ok) => { log.push((ok ? 'OK   ' : 'FALLO ') + w); if (!ok) fails++; };
    const run = (...ch) => { let n = 0; while ((G.st === 'DIALOG' || G.st === 'CHOICE') && n++ < 80) { if (G.st === 'CHOICE') { const c = G.choice; G.choice = null; G.st = 'PLAY'; c.cb(ch.length ? ch.shift() : 0); } else { G.dlgChars = 9999; G.nextPage(); } } };
    const step = () => { G.just = new Set(G.queue); G.queue.clear(); G.update(1 / 60); };
    try {
      G.newGame(); run(); G.player.hasSword = true; G.stage = ETAPA.RIBERA;
      check('empiezas sin duros', G.duros === 0);
      const ow = G.worlds.exterior, p = G.player; G.enter('exterior', WG.doorX * TS + 8, (WG.doorY + 3) * TS + 8, 0); run();
      const m = new Monster(MK.HUECO, p.x, p.y + 40, 1); ow.monsters.push(m); G.killMonster(m); check('matar un engendro da duros (' + G.duros + ')', G.duros >= 1);
      // taller
      const coch = ow.props.find(x => x.id === 'cochera'); G.use(coch); run(); check('la cochera abre el taller', G.st === 'TALLER');
      let it = G.tallerItems(); check('el arco está a la venta', it.some(x => x.key === 'gun:arco' && !x.locked)); check('el rifle aún bloqueado', it.find(x => x.key === 'gun:rifle').locked);
      G.tallerBuy(it.find(x => x.key === 'gun:arco')); check('sin dinero no compras', !G.guns.own.includes('arco') && /No te llega/.test(G.tallerMsg));
      G.duros = 200; G.tallerBuy(G.tallerItems().find(x => x.key === 'gun:arco')); check('compras el arco', G.guns.own.includes('arco') && G.guns.eq === 'arco' && G.guns.ammo.flechas === 12 && G.duros === 155);
      G.tallerBuy(G.tallerItems().find(x => x.key === 'ammo:flechas')); check('compras flechas', G.guns.ammo.flechas === 24);
      const atk0 = p.atk; G.tallerBuy(G.tallerItems().find(x => x.key === 'afilar')); check('afilar la espada', p.atk === atk0 + 2 && G.guns.afilado === 1);
      G.render(document.querySelector('canvas').getContext('2d'), 800, 450, 1); check('el taller se dibuja con botón de salir', G.menuRects.some(r => r.i === 99));
      G.queue.add('Escape'); step(); check('Esc sale del taller', G.st === 'PLAY');
      // disparo
      const m2 = new Monster(MK.HUECO, p.x, p.y + 50, 1); m2.aggro = false; ow.monsters.push(m2); p.dir = 0; const hp0 = m2.hp;
      G.queue.add('KeyF'); for (let i = 0; i < 40; i++) step();
      check('la flecha le da (' + hp0 + ' → ' + m2.hp + ')', m2.hp < hp0 || m2.dead); check('gasta una flecha', G.guns.ammo.flechas === 23);
      // apunta solo hacia un engendro que esté delante aunque mires de lado
      const m3 = new Monster(MK.SOMBRA, p.x + 60, p.y + 10, 1); ow.monsters.push(m3); p.dir = 3; const h3 = m3.hp; p.gunCool = 0; G.queue.add('KeyF'); for (let i = 0; i < 40; i++) step(); check('apuntado automático', m3.hp < h3 || m3.dead);
      ow.monsters = ow.monsters.filter(x => x !== m2 && x !== m3);
      // escopeta (bloqueada hasta El Greco) y rifle
      G.stage = ETAPA.HOTEL; G.duros = 1000; G.tallerBuy(G.tallerItems().find(x => x.key === 'gun:escopeta')); G.tallerBuy(G.tallerItems().find(x => x.key === 'gun:rifle'));
      check('escopeta y rifle', G.guns.own.includes('escopeta') && G.guns.own.includes('rifle'));
      G.guns.eq = 'escopeta'; p.gunCool = 0; const m4 = new Monster(MK.JABALI, p.x + 30, p.y, 1); ow.monsters.push(m4); const h4 = m4.hp; p.dir = 3; G.queue.add('KeyF'); for (let i = 0; i < 30; i++) step(); check('la escopeta suelta perdigones y hace daño (' + h4 + '→' + m4.hp + ')', m4.hp < h4 - 20 || m4.dead);
      ow.monsters = ow.monsters.filter(x => x !== m4);
      G.queue.add('KeyR'); step(); check('R cambia de arma', G.guns.eq !== 'escopeta');
      // contra la pared no atraviesa
      // coche abandonado
      const car = ow.props.find(x => x.id && x.id.startsWith('coche:')); check('hay coches que registrar', !!car);
      if (car) { const d0 = G.duros; G.use(car); run(); check('el coche da duros', G.duros > d0); const d1 = G.duros; G.use(car); run(); check('el coche solo una vez', G.duros === d1); }
      // misión cumplida
      { const d0 = G.duros; Q.set('puerta', 1); Q.set('puerta', QDONE); run(); check('misión cumplida: +35 duros', G.duros >= d0 + 35); }
      // guardar y cargar
      G.save(); const sv = JSON.stringify([G.duros, G.guns]); G.duros = 0; G.guns = { own: [], eq: null, ammo: {} }; G.load(); run(); check('guardar y cargar duros y armas', JSON.stringify([G.duros, G.guns]) === sv);
      // botón táctil de disparo
      G.touch = true; Touch.layout(800, 450); check('botón táctil de tiro', Touch.buttons.some(b => b.id === 'shoot')); G.touch = false;
      // nueva partida limpia
      G.newGame(); run(); check('nueva partida sin duros ni armas', G.duros === 0 && G.guns.own.length === 0);
      // pistola de Casimiro
      G.q.obsequios = { s: 7, d: { fin: 'disparo' } }; Q.set('obsequios', 8); run(); check('te quedas la pistola de Casimiro', G.guns.own.includes('pistola'));
    } catch (e) { check('excepción: ' + e.message + ' ' + (e.stack || '').split('\n')[1], false); }
    return { log, fails };
  });
  console.log(res.log.join('\n')); console.log('fallos:', res.fails); if (errs.length) console.log('ERRORES:\n' + errs.join('\n'));
  await b.close();
})();
