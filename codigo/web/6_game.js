// ====================================================================== juego
const DAY_LEN = 480;
const ST = { TITLE: 'TITLE', INTRO: 'INTRO', PLAY: 'PLAY', DIALOG: 'DIALOG', MAP: 'MAP', PAUSE: 'PAUSE', DEAD: 'DEAD', END: 'END', HELP: 'HELP' };
const SAVE_KEY = 'guardian_pozo_partida';
const GOLD = '#e8c46a', PAPER = '#f2e6cc', INK = '#1a1410', PANEL = 'rgba(18,14,12,0.85)', DIM = '#9a8a70', SOFT = '#d8ccb0';
const FT = (s) => `700 ${s}px Cinzel, Georgia, serif`, FB = (s) => `400 ${s}px "Alegreya Sans", "Segoe UI", sans-serif`, FBB = (s) => `700 ${s}px "Alegreya Sans", "Segoe UI", sans-serif`;

const G = {
  worlds: {}, world: null, player: new Player(), orbs: [], fx: [], boss: null, mapCanvas: null,
  st: ST.TITLE, stage: 0, flags: new Set(), picked: new Set(), questKills: 0, clock: 0, day: 0.05,
  restWorld: 'casa_alta', restX: 72, restY: 120, camX: 0, camY: 0, shakeT: 0, spawnT: 0, deadT: 0, tableCool: 0,
  lastArea: '', banner: '', bannerT: 0, toastS: '', toastT: 0, titleT: 0, menuIdx: 0, hasSave: false,
  dlg: [], page: null, dlgChars: 0, dlgEnd: null, introPages: null, introIdx: 0, introChars: 0, endPages: null, endIdx: 0,
  keys: new Set(), queue: new Set(), just: new Set(), stick: { x: 0, y: 0 }, menuRects: [],
  rnd: RNG(12345), waves: [], hitStop: 0, slowT: 0, skillSel: 0,
};

// --------------------------------------------------------------------- entrada
G.pressed = function (...codes) { for (const c of codes) if (this.just.has(c)) { this.just.delete(c); return true; } return false; };
G.down = function (...codes) { for (const c of codes) if (this.keys.has(c)) return true; return false; };
G.confirm = function () { return this.pressed('Enter', 'KeyE', 'Space', 'KeyZ', 'Tap'); };

// --------------------------------------------------------------------- arranque
G.boot = function () {
  Art.init();
  Art.initTerrain();
  Art.initVegetation();
  Art.initBuildings();
  Art.initProps2();
  Art.initCharacters2();
  Art.initPlaces();
  Art.initLandmarks();
  Art.initRoofProps();
  Art.initQuests();
  Art.initEnemies();
  this.buildWorlds();
  this.hasSave = !!this.readSave();
};
G.buildWorlds = function () {
  this.worlds = {};
  const ow = WG.overworld(); this.worlds[ow.id] = ow;
  const gb = WG.houseGround(); this.worlds[gb.id] = gb;
  const up = WG.houseUpper(); this.worlds[up.id] = up;
  this.mapCanvas = this.buildMap(ow); this.mapCanvases = {};
};

// --------------------------------------------------------------------- actualización
G.update = function (dt) {
  if (this.pressed('KeyN')) { Sound.toggle(); this.toast(Sound.musicOn ? 'Música activada' : 'Música desactivada'); }
  if (this.toastT > 0) this.toastT -= dt;
  if (this.bannerT > 0) this.bannerT -= dt;
  if (this.shakeT > 0) this.shakeT -= dt;
  this.titleT += dt;
  const w0 = this.world;
  if (w0) {
    if (w0._animSrc !== w0.props || w0._animLen !== w0.props.length) { w0._anim = w0.props.filter(p => p.anim); w0._animSrc = w0.props; w0._animLen = w0.props.length; }
    for (const p of w0._anim) { if (p.anim === 1) p.img = Art.campfire[Math.floor(this.clock * 8 + p.x) % 3]; else if (p.anim === 2) p.img = Art.cascada[Math.floor(this.clock * 8) % 3]; }
  }
  switch (this.st) {
    case ST.TITLE: this.updateTitle(); break;
    case ST.HELP: if (this.confirm() || this.pressed('Escape')) this.st = this.helpBack || ST.TITLE; break;
    case ST.INTRO: this.updateIntro(dt); break;
    case ST.CINE: this.updateCine(dt); break;
    case ST.LOAD: this.updateLoad(dt); break;
    case ST.CHOICE: this.updateChoice(); this.clock += dt; break;
    case ST.PLAY:
      if (this.hitStop > 0) this.hitStop -= dt;
      else this.updatePlay(this.slowT > 0 ? dt * 0.35 : dt);
      if (this.slowT > 0) this.slowT -= dt;
      break;
    case ST.SKILLS: this.updateSkills(); this.clock += dt; break;
    case ST.DIALOG: this.updateDialog(dt); this.updateFx(dt); this.clock += dt; break;
    case ST.MAP: if (this.pressed('KeyM', 'Escape', 'Tab', 'Enter', 'Tap', 'Space', 'KeyE')) this.st = ST.PLAY; break;
    case ST.PAUSE: this.updatePause(); break;
    case ST.DEAD: this.deadT += dt; this.updateFx(dt); if (this.deadT > 1.2 && this.confirm()) this.respawn(); break;
    case ST.END:
      this.introChars += dt * 40;
      if (this.confirm()) {
        if (this.introChars < this.endPages[this.endIdx].length) this.introChars = 999;
        else if (++this.endIdx >= this.endPages.length) { this.st = ST.PLAY; this.stage = 9; Sound.music('calma'); this.save(); this.toast('Partida guardada. Pozo Alcón es tuyo: explora libremente.'); }
        else this.introChars = 0;
      }
      break;
  }
};

G.menu = function () { return this.hasSave ? ['Continuar', 'Nueva partida', 'Controles'] : ['Nueva partida', 'Controles']; };
G.menuNav = function (m) {
  if (this.pressed('ArrowUp', 'KeyW')) this.menuIdx = (this.menuIdx + m.length - 1) % m.length;
  if (this.pressed('ArrowDown', 'KeyS')) this.menuIdx = (this.menuIdx + 1) % m.length;
  for (const r of this.menuRects) if (this.just.has('Pick' + r.i)) { this.just.delete('Pick' + r.i); this.menuIdx = r.i; return true; }
  return this.pressed('Enter', 'KeyE', 'Space', 'KeyZ');
};
G.updateTitle = function () {
  const m = this.menu();
  if (this.menuIdx >= m.length) this.menuIdx = 0;
  if (this.menuNav(m)) {
    const o = m[this.menuIdx];
    if (o === 'Continuar') { if (this.load()) { this.st = ST.PLAY; Sound.music('calma'); } else this.toast('No se pudo cargar la partida.'); }
    else if (o === 'Nueva partida') this.startIntro();
    else if (o === 'Controles') { this.helpBack = ST.TITLE; this.st = ST.HELP; }
  }
};
G.startIntro = function () { Sound.music('infierno'); this.playCine('intro', () => this.newGame()); };
G.updateIntro = function (dt) {
  this.introChars += dt * 38;
  if (this.pressed('Escape')) { this.newGame(); return; }
  if (this.confirm()) {
    if (this.introChars < this.introPages[this.introIdx].length) this.introChars = 999;
    else if (++this.introIdx >= this.introPages.length) this.newGame();
    else this.introChars = 0;
  }
};
G.newGame = function () {
  this.buildWorlds();
  this.player = new Player();
  this.stage = 0; this.flags = new Set(); this.picked = new Set(); this.questKills = 0; this.clock = 0; this.day = 0.04;
  this.boss = null; this.orbs = []; this.fx = [];
  this.enter('casa_alta', WG.upStart[0], WG.upStart[1], 3);
  this.restWorld = 'casa_alta'; this.restX = this.player.x; this.restY = this.player.y;
  this.st = ST.PLAY;
  Sound.music('calma');
  this.say('Guardián', 'Otra mañana en el cortijo. La red eléctrica cayó hace siete años, pero las placas y las baterías dan luz de sobra: nevera, tele, ventilador... Lo que ya no hay es nadie al otro lado.',
    'Mi espada está en el baúl del rellano. Ya no salgo de casa sin ella.');
};
G.pauseMenu = function () { return ['Continuar', 'Habilidades' + (this.player.pts > 0 ? ' (' + this.player.pts + ')' : ''), 'Guardar partida', 'Controles', Sound.musicOn ? 'Música: sí' : 'Música: no', 'Salir al título']; };
G.updatePause = function () {
  const m = this.pauseMenu();
  if (this.pressed('Escape', 'KeyP')) { this.st = ST.PLAY; return; }
  if (this.menuNav(m)) {
    switch (this.menuIdx) {
      case 0: this.st = ST.PLAY; break;
      case 1: this.openSkills(); break;
      case 2: this.save(); this.toast('Partida guardada'); this.st = ST.PLAY; break;
      case 3: this.helpBack = ST.PAUSE; this.st = ST.HELP; break;
      case 4: Sound.toggle(); break;
      case 5: this.st = ST.TITLE; this.menuIdx = 0; this.hasSave = !!this.readSave(); Sound.music('noche'); break;
    }
  }
};

G.hour = function () { return (this.day * 24 + 6) % 24; };
G.isNight = function () { const h = this.hour(); return h >= 20.5 || h < 5.5; };
// El mundo tras el Colapso nunca está del todo iluminado: de día el cielo sigue cubierto.
G.darkness = function () {
  if (!this.world.outdoor) return 0.42;
  const h = this.hour(), DAY = 0.22, NIGHT = 0.86;
  if (h >= 7 && h < 18.5) return DAY;
  if (h >= 18.5 && h < 21) return DAY + (h - 18.5) / 2.5 * (NIGHT - DAY);
  if (h >= 21 || h < 4.5) return NIGHT;
  return NIGHT - (h - 4.5) / 2.5 * (NIGHT - DAY);
};
// la música cambia sola según dónde estás y qué pasa (con un margen para que no salte a cada momento)
G.autoMusic = function (dt) {
  const w = this.world, p = this.player;
  let m;
  if ((this.boss && !this.boss.dead) || w.monsters.some(x => !x.dead && x.kind === MK.DEMONIO && x.aggro)) m = 'jefe';
  else if (w.monsters.some(x => !x.dead && x.aggro && Math.hypot(x.x - p.x, x.y - p.y) < 150)) m = 'batalla';
  else if (!w.outdoor) m = w.id.startsWith('casa') ? 'calma' : 'pesadilla';
  else if (this.playerSafe()) m = 'iglesia';
  else if (this.isNight() || (typeof Wx !== 'undefined' && Wx.s > 0.5)) m = 'noche';
  else m = 'pesadilla';
  if (m !== Sound.wanted) {
    this.musicT = (this.musicT || 0) + dt;
    if (this.musicT > (m === 'batalla' || m === 'jefe' ? 0.1 : 2.5)) { this.musicT = 0; Sound.music(m); }
  } else this.musicT = 0;
};
G.playerSafe = function () { return this.world.safeAt(Math.floor(this.player.x / TS), Math.floor(this.player.y / TS)); };

G.updatePlay = function (dt) {
  const p = this.player, w = this.world;
  this.clock += dt;
  if (w.outdoor) this.day = (this.day + dt / DAY_LEN) % 1;
  this.updateWeather(dt);
  this.autoMusic(dt);
  if (this.tableCool > 0) this.tableCool -= dt;
  if (this.pressed('Escape', 'KeyP')) { this.st = ST.PAUSE; this.menuIdx = 0; return; }
  if (this.pressed('KeyM', 'Tab')) { this.st = ST.MAP; return; }
  let ix = this.stick.x, iy = this.stick.y;
  if (this.down('ArrowLeft', 'KeyA')) ix -= 1;
  if (this.down('ArrowRight', 'KeyD')) ix += 1;
  if (this.down('ArrowUp', 'KeyW')) iy -= 1;
  if (this.down('ArrowDown', 'KeyS')) iy += 1;
  if (this.pressed('KeyH', 'Skills')) { this.openSkills(); return; }
  if (this.pressed('Space', 'KeyJ')) this.attackPress();
  if (this.pressed('ShiftLeft', 'ShiftRight', 'KeyX', 'Roll') && p.rollCool <= 0 && p.kbT <= 0) {
    let rx = ix, ry = iy; const rl = Math.hypot(rx, ry);
    if (rl < 0.25) { rx = [0, 0, -1, 1][p.dir]; ry = [1, -1, 0, 0][p.dir]; } else { rx /= rl; ry /= rl; }
    p.rollT = 0.3; p.rollCool = this.has('ligero') ? 0.35 : 0.65; p.rollX = rx; p.rollY = ry; p.invul = Math.max(p.invul, 0.32); p.atkT = 0; p.charge = 0; p.rolling = true; p.dodgeDone = false;
    Sound.play('swing');
  }
  if (this.pressed('KeyK', 'Digit1')) this.pray();
  if (this.pressed('KeyL', 'Digit2')) this.holyLight();
  if (this.pressed('KeyQ', 'Digit3')) this.eatHerb();
  if (this.pressed('KeyE', 'Enter')) { this.interact(); if (this.st !== ST.PLAY) return; }
  if (p.atkCool > 0) p.atkCool -= dt;
  if (p.atkT > 0) p.atkT -= dt;
  if (p.invul > 0) p.invul -= dt;
  if (p.prayT > 0) p.prayT -= dt;
  if (p.rollCool > 0) p.rollCool -= dt;
  if (p.poison > 0) {
    p.poison -= dt; p.poisonAcc += dt;
    if (p.poisonAcc >= 1) { p.poisonAcc -= 1; if (p.hp > 1) { p.hp -= 3; this.fx.push(Fx.text(p.x, p.y - 26, '-3', 0x80d040)); } }
  }
  p.applyKnock(w, dt);
  const len = Math.hypot(ix, iy);
  if (p.rollT > 0) {
    p.rollT -= dt;
    p.move(w, p.rollX * (this.has('ligero') ? 190 : 175) * dt, p.rollY * (this.has('ligero') ? 190 : 175) * dt);
    if (this.rnd.next() < 0.5) this.fx.push(Fx.spark(p.x + this.rnd.gauss() * 3, p.y, this.rnd.gauss() * 10, -8, 0xc8b898, 0.35));
    p.moving = true; p.anim += dt * 2;
    if (p.rollT <= 0) p.rolling = false;
  } else
  if ((p.moving = len > 0.25 && p.kbT <= 0)) {
    const sp = 74 * (this.has('ligero') ? 1.12 : 1) * (p.atkT > 0 || p.charge > 0.2 ? 0.45 : 1) * Math.min(1, len);
    if (p.atkT <= 0) p.faceTo(ix, iy);
    p.move(w, ix / len * sp * dt, iy / len * sp * dt);
    p.anim += dt;
  } else p.anim = 0;
  p.feAcc += dt * (this.isNight() ? 1.0 : 1.6) * (this.has('fervor') ? 2 : 1);
  while (p.feAcc >= 1) { p.feAcc -= 1; if (p.fe < p.maxFe) p.fe++; }
  this.updateCombat(dt);
  const ptx = Math.floor(p.x / TS), pty = Math.floor(p.y / TS);
  for (const wp of w.warps) {
    if (ptx >= wp.x && ptx < wp.x + wp.w && pty >= wp.y && pty < wp.y + wp.h) { if (wp.load) { this.travel(wp); return; } Sound.play('door'); this.enter(wp.to, wp.tx, wp.ty, wp.dir); return; }
  }
  w.pickups = w.pickups.filter(k => { k.t += dt; if (Math.hypot(k.x - p.x, k.y - p.y) < 11) { this.collect(k); return false; } return true; });
  for (const m of w.monsters) {
    if (m.dead) continue;
    m.update(this, dt);
    if (m.kind === MK.BESTIA && !p.dead && p.invul <= 0 && Math.hypot(m.x - p.x, m.y - p.y) < 20) this.hurtPlayer(m.dmg, m.x, m.y);
  }
  w.monsters = w.monsters.filter(m => !(m.dead || (!m.quest && !m.lair && m.kind !== MK.BESTIA && m.dist(p) > 36 * TS)));
  this.orbs = this.orbs.filter(o => {
    o.x += o.vx * dt; o.y += o.vy * dt; o.life -= dt;
    const tx = Math.floor(o.x / TS), ty = Math.floor(o.y / TS);
    let gone = o.life <= 0 || (w.solid(tx, ty) && !T.isWater(w.get(tx, ty)));
    if (!gone && p.rolling && Math.hypot(o.x - p.x, o.y - (p.y - 8)) < 10) this.perfectDodge();
    if (!gone && p.invul <= 0 && Math.hypot(o.x - p.x, o.y - (p.y - 8)) < 8) { this.hurtPlayer(o.dmg, o.x, o.y); gone = true; }
    if (gone) for (let i = 0; i < 4; i++) this.fx.push(Fx.spark(o.x, o.y, this.rnd.gauss() * 30, this.rnd.gauss() * 30, o.mud ? 0x6a7a3a : 0x50d8c8, 0.3));
    return !gone;
  });
  this.spawnLogic(dt);
  this.stageLogic();
  this.updateFx(dt);
  const an = w.areaName(ptx, pty);
  if (an !== this.lastArea) { this.lastArea = an; this.banner = an; this.bannerT = 2.6; }
};
G.swordCenter = function (r = 15) {
  const p = this.player;
  return [[p.x, p.y - 8 + r - 1], [p.x, p.y - 8 - r + 1], [p.x - r, p.y - 8], [p.x + r, p.y - 8]][p.dir];
};
G.damageMonster = function (m, d, crit, kx, ky, holy) {
  if (!m.vulnerable()) { this.fx.push(Fx.text(m.x, m.y - 14, 'bajo el agua', 0x9ad8d0)); return; }
  if (m.kind === MK.DEMONIO) {
    if (holy) { d = Math.round(d * 2.5); crit = true; }
    else { d = Math.max(1, Math.round(d * 0.45)); if (!this.flags.has('tuto_demonio')) { this.flags.add('tuto_demonio'); this.toast('La espada apenas le hace mella. Solo la Luz lo quema de verdad.'); } }
  }
  if (m.state === 'stun') { d = Math.round(d * 1.6); crit = true; }
  m.hp -= d; m.flash = 0.12;
  const heavy = m.kind === MK.BESTIA || m.kind === MK.NIDO || m.kind === MK.DEMONIO || (m.kind === MK.JABALI && m.state === 'atk') || (m.kind === MK.HUECO && m.state === 'wind');
  if (!heavy) m.knock(kx, ky, crit ? 240 : 170); else if (crit && m.kind !== MK.NIDO) m.knock(kx, ky, 60);
  // golpear durante el aviso interrumpe a los enemigos ligeros
  if (m.state === 'wind' && (m.kind === MK.ALACRAN || m.kind === MK.SOMBRA || m.kind === MK.AHOGADO)) { m.setState('rec', 0.5); m.cool = 0.8; }
  this.fx.push(Fx.text(m.x, m.y - 22, crit ? '¡' + d + '!' : '' + d, crit ? 0xffe060 : 0xffffff));
  for (let i = 0; i < 5; i++) this.fx.push(Fx.spark(m.x, m.y - 8, this.rnd.gauss() * 50, this.rnd.gauss() * 50 - 20, m.kind === MK.SOMBRA ? 0x8a6ab0 : 0x7a1a14, 0.35));
  Sound.play('hit');
  if (m.hp <= 0 && !m.dead) this.killMonster(m);
};
G.killMonster = function (m) {
  m.dead = true;
  for (let i = 0; i < 14; i++) this.fx.push(Fx.spark(m.x, m.y - 8, this.rnd.gauss() * 60, this.rnd.gauss() * 60 - 30, i % 2 === 0 ? 0x2a2030 : 0x6a5a7a, 0.6));
  this.gainXp(m.xp, m.x, m.y - 28);
  if (this.rnd.next() < (this.has('herbolario') ? 0.35 : 0.22)) this.world.pickups.push(new Pickup(Pickup.HERB, m.x, m.y, null));
  if (this.stage === 2 && this.world.outdoor) {
    this.questKills++;
    if (this.questKills >= 6) { this.stage = 3; this.save(); this.say('Guardián', 'La ribera está limpia... por ahora.', 'La radio del porche ha vuelto a crepitar. Juraría que he oído una voz.'); }
    else this.toast('Engendros eliminados: ' + this.questKills + '/6');
  }
  if (m.kind === MK.BESTIA) this.bossDefeated();
  if (m.kind === MK.DEMONIO) { Sound.play('purify'); this.shake(0.8); for (let i = 0; i < 30; i++) this.fx.push(Fx.spark(m.x, m.y - 20, this.rnd.gauss() * 70, this.rnd.gauss() * 70 - 30, i % 2 ? 0xff7a20 : 0x2a0606, 0.9)); this.toast('El demonio se deshace en ceniza y azufre.'); if (this.onDemonDead) { const f = this.onDemonDead; this.onDemonDead = null; f(m); } }
  if (m.lair) {
    const left = this.world.monsters.filter(o => o.lair === m.lair && !o.dead && !o.fromNest).length;
    if (left === 0) { m.lair.cleared = true; m.lair.active = false; this.toast('Guarida limpia: ' + m.lair.name); for (const o of this.world.monsters) if (o.lair === m.lair && !o.dead) { o.dead = true; } }
  }
};
G.gainXp = function (amount, x, y) {
  const p = this.player;
  p.xp += amount;
  this.fx.push(Fx.text(x, y, '+' + amount + ' XP', 0xb0e0ff));
  while (p.xp >= p.xpNext()) {
    p.xp -= p.xpNext(); p.lvl++;
    const gain = p.lvl % 5 === 0 ? 2 : 1;
    p.maxHp += 8; p.maxFe += 4; p.atk += 1; p.hp = p.maxHp; p.fe = p.maxFe; p.pts += gain;
    Sound.play('level');
    this.fx.push(Fx.ring(p.x, p.y - 8, 40, 0xffe080));
    const how = this.touch ? 'el botón Hab.' : 'la tecla H';
    if (p.lvl === 3) this.say('Guardián', '¡Nivel 3! Siento la luz más fuerte que nunca.', 'Has aprendido LUZ: pulsa L (o el botón Luz) para liberar una onda sagrada que daña a los engendros cercanos. Cuesta 40 de Fe.', 'Y tienes un punto de habilidad nuevo: gástalo en el árbol con ' + how + '.');
    else if (!this.flags.has('tuto_hab')) { this.flags.add('tuto_hab'); this.say('Guardián', '¡Nivel ' + p.lvl + '! Vida y Fe al máximo.', 'Has ganado un punto de habilidad. Ábrelo con ' + how + ': hay tres ramas, Espada, Fe y Camino.'); }
    else this.toast('¡Nivel ' + p.lvl + '! +' + gain + (gain > 1 ? ' puntos' : ' punto') + ' de habilidad (' + how + ')');
  }
};
G.hurtPlayer = function (dmg, fx, fy, poison) {
  const p = this.player;
  if (p.dead) return;
  if (poison) { p.poison = Math.max(p.poison, this.has('herbolario') ? poison / 2 : poison); this.toast('¡Envenenado! Come hierbas para curarte.'); }
  if (p.shieldT > 0) dmg = Math.ceil(dmg / 2);
  p.hp -= dmg; p.invul = 0.9; p.flash = 0.2;
  p.knock(p.x - fx, p.y - fy, 160);
  this.shake(0.18);
  this.fx.push(Fx.text(p.x, p.y - 26, '-' + dmg, 0xff6050));
  Sound.play('hurt');
  try { if (navigator.vibrate) navigator.vibrate(40); } catch (e) { }
  if (p.hp <= 0 && this.has('aliento') && !p.alientoUsed) {
    p.alientoUsed = true; p.hp = Math.round(p.maxHp * 0.4); p.invul = 1.6;
    this.fx.push(Fx.ring(p.x, p.y - 8, 50, 0xffe8a0)); Sound.play('purify'); this.toast('¡Segundo aliento! Te levantas.');
    return;
  }
  if (p.hp <= 0) { p.hp = 0; p.dead = true; this.deadT = 0; this.st = ST.DEAD; Sound.play('die'); }
};
G.shake = function (t) { this.shakeT = Math.max(this.shakeT, t); };
G.pray = function () {
  const p = this.player;
  const cost = this.has('oracion') ? 18 : 25;
  if (p.fe < cost) { this.toast('No te queda Fe suficiente para orar (' + cost + ').'); return; }
  if (p.hp >= p.maxHp && !this.has('escudo')) { this.toast('No estás herido.'); return; }
  p.fe -= cost;
  if (this.has('escudo')) p.shieldT = 5;
  const h = Math.round(Math.max(25, Math.floor(p.maxHp * 0.35)) * (this.has('oracion') ? 1.5 : 1));
  p.hp = Math.min(p.maxHp, p.hp + h); p.prayT = 0.8;
  this.fx.push(Fx.text(p.x, p.y - 30, '+' + h, 0x80ff90));
  for (let i = 0; i < 18; i++) this.fx.push(Fx.spark(p.x + this.rnd.gauss() * 8, p.y - this.rnd.next() * 20, 0, -20 - this.rnd.next() * 30, 0xffe8a0, 0.9));
  Sound.play('heal');
};
G.holyLight = function () {
  const p = this.player;
  if (!p.canLight()) { this.toast('Aún no dominas la Luz (nivel 3).'); return; }
  if (p.fe < 40) { this.toast('No te queda Fe suficiente para la Luz (40).'); return; }
  p.fe -= 40;
  const R = this.has('ardiente') ? 83 : 64;
  if (this.has('cruzluz')) p.poison = 0;
  this.fx.push(Fx.ring(p.x, p.y - 8, R, 0xfff0b0));
  for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12; this.fx.push(Fx.spark(p.x, p.y - 8, Math.cos(a) * 140, Math.sin(a) * 140, 0xfff0b0, 0.4)); }
  Sound.play('light'); this.shake(0.15);
  for (const m of [...this.world.monsters]) if (!m.dead && Math.hypot(m.x - p.x, m.y - p.y) < R + m.hw) {
    this.damageMonster(m, Math.round((p.atk * 2 + 6) * (this.has('ardiente') ? 1.5 : 1)), false, m.x - p.x, m.y - p.y, true);
    if (this.has('cruzluz') && !m.dead && m.kind !== MK.BESTIA && m.kind !== MK.NIDO && m.vulnerable()) m.setState('stun', 2);
  }
};
G.eatHerb = function () {
  const p = this.player;
  if (p.herbs <= 0) { this.toast('No te quedan hierbas medicinales.'); return; }
  if (p.hp >= p.maxHp && p.poison <= 0) { this.toast('No estás herido.'); return; }
  const hh = this.has('herbolario') ? 55 : 30;
  p.herbs--; p.hp = Math.min(p.maxHp, p.hp + hh); p.poison = 0;
  this.fx.push(Fx.text(p.x, p.y - 30, '+' + hh, 0x80ff90));
  Sound.play('heal');
};
G.collect = function (k) {
  const p = this.player;
  Sound.play('pickup');
  if (k.type === Pickup.HERB) { p.herbs++; this.toast('+1 hierba medicinal (Q o botón Hierba para usarla)'); }
  else {
    this.picked.add(k.id); p.relics++;
    p.maxHp += 10; p.atk += 1; p.maxFe += 5; p.hp = p.maxHp;
    this.fx.push(Fx.ring(k.x, k.y, 30, 0xffd860));
    this.say('Guardián', 'Una reliquia de los viejos santuarios. Al tocarla, el cansancio desaparece.', 'Reliquias: ' + p.relics + '/5.  Vida máxima +10, Fe máxima +5, Ataque +1.');
    this.save();
  }
};
G.spawnLogic = function (dt) {
  const w = this.world, p = this.player;
  if (!w.outdoor || this.stage < 2) return;
  this.spawnT -= dt;
  if (this.spawnT > 0) return;
  this.spawnT = 0.8;
  for (const L of (w.lairs || [])) {
    const d = Math.hypot(L.x * TS - p.x, L.y * TS - p.y) / TS;
    if (!L.active && !L.cleared && d < 19) this.spawnLair(L);
    else if (L.active && d > 30) { w.monsters = w.monsters.filter(m => m.lair !== L); L.active = false; }
  }
  // de noche (o con tormenta) rondan algunas sombras sueltas
  if (!this.isNight() && !this.stormOn()) return;
  const shades = w.monsters.filter(m => m.kind === MK.SOMBRA && !m.lair && !m.dead).length;
  if (shades >= 2 || this.rnd.next() > 0.15) return;
  for (let tries = 0; tries < 10; tries++) {
    const a = this.rnd.next() * Math.PI * 2, d = (11 + this.rnd.next() * 6) * TS;
    const x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d, tx = Math.floor(x / TS), ty = Math.floor(y / TS);
    if (w.solid(tx, ty) || w.noSpawnAt(tx, ty) || w.blocked(x, y, 6, 4)) continue;
    w.monsters.push(new Monster(MK.SOMBRA, x, y, w.tierAt(tx, ty) * (1 + 0.05 * (p.lvl - 1))));
    return;
  }
};
G.spawnLair = function (L) {
  const w = this.world, p = this.player;
  L.active = true;
  const tier = L.tier * (1 + 0.05 * (p.lvl - 1)) * (this.stage >= 8 ? 0.9 : 1);
  L.kinds.forEach((k, i) => {
    for (let t = 0; t < 30; t++) {
      const a = i * 2.1 + t * 0.7, r = t === 0 && i === 0 ? 0 : 1 + (t % 4) * 0.7;
      const x = (L.x + 0.5 + Math.cos(a) * r) * TS, y = (L.y + 0.5 + Math.sin(a) * r) * TS;
      const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
      if (k === MK.AHOGADO ? !T.isWater(w.get(tx, ty)) : w.blocked(x, y, 7, 4)) continue;
      const m = new Monster(k, x, y, tier); m.lair = L; m.homeX = L.x * TS + 8; m.homeY = L.y * TS + 8;
      w.monsters.push(m);
      break;
    }
  });
};
G.spawnNear = function (k, x, y, tier) {
  for (let i = 0; i < 10; i++) { const xx = x + this.rnd.gauss() * 10, yy = y + this.rnd.gauss() * 10; if (!this.world.blocked(xx, yy, 6, 4)) { this.world.monsters.push(new Monster(k, xx, yy, tier)); return; } }
};

// --------------------------------------------------------------------- historia
G.objective = function () {
  switch (this.stage) {
    case 0: return 'Coge tu espada del baúl del rellano.';
    case 1: return 'Sal del cortijo.';
    case 2: return 'Limpia la ribera de engendros (' + this.questKills + '/6).';
    case 3: return 'Escucha la radio del porche.';
    case 4: return 'Ve a Pozo Alcón: Iglesia de la Encarnación (al oeste, por la A-326).';
    case 5: return 'Reza en la Cruz de San Gregorio (A-326, camino de La Bolera).';
    case 6: return 'Sigue el Guadalentín río arriba hasta la presa de La Bolera.';
    case 7: return 'Derrota a la Bestia de La Bolera.';
    case 8: return 'Vuelve con los tuyos.';
    default: return 'Pozo Alcón respira. Busca las reliquias (' + this.player.relics + '/5).';
  }
};
G.objectiveTarget = function () {
  switch (this.stage) {
    case 2: case 3: return [WG.doorX, WG.doorY + 2];
    case 4: case 8: return [WG.priestX, WG.priestY];
    case 5: return [WG.crossX, WG.crossY];
    case 6: case 7: return [WG.bossX, WG.bossY];
    default: return null;
  }
};
G.stageLogic = function () {
  const w = this.world;
  if (this.stage === 1 && w.outdoor) {
    this.stage = 2;
    for (const q of WG.questSpawns) {
      const k = this.rnd.bool() ? MK.JABALI : MK.HUECO;
      let x = q[0] * TS + 8; const y = q[1] * TS + 8;
      if (w.blocked(x, y, 7, 4)) x += 16;
      const m = new Monster(k, x, y, 0.85); m.quest = true; w.monsters.push(m);
    }
    this.playCine('ribera', () => this.say('Guardián', 'Ahí están otra vez, rondando la poza.', 'Mientras yo siga aquí, nadie toca esta casa. Ataca con Espacio o con el botón de la espada.'));
  }
  if ((this.stage === 6 || this.stage === 7) && w.outdoor && !this.boss && this.lastArea === 'Presa de La Bolera') {
    this.stage = 7;
    this.boss = new Monster(MK.BESTIA, WG.bossX * TS + 8, (WG.bossY - 1) * TS, 1);
    w.monsters.push(this.boss);
    Sound.music('batalla'); Sound.play('roar'); this.shake(0.8);
    this.say('Guardián', 'El agua del pantano se agita... Algo enorme sube desde la cueva del nacimiento.', '«No todos los que caminan en la oscuridad son malos. Algunos solo buscan la luz.» Pero tú no.');
  }
};
G.bossDefeated = function () {
  this.stage = 8; this.boss = null; this.orbs = [];
  for (const m of this.world.monsters) m.dead = true;
  Sound.music('calma'); Sound.play('purify'); this.shake(1);
  this.say('Guardián', 'La Bestia se hunde en el agua oscura... y no vuelve a salir.', 'Sobre el embalse de La Bolera, por primera vez en siete años, el agua refleja el cielo.', 'Tengo que contárselo a Padre Tomás.');
  this.save();
};
G.purifyCross = function () {
  this.stage = 6;
  this.openBrambles();
  Sound.play('purify'); this.shake(0.6);
  for (let i = 0; i < 40; i++) this.fx.push(Fx.spark(WG.crossX * TS + 8, WG.crossY * TS - 10, this.rnd.gauss() * 70, this.rnd.gauss() * 70, 0xffe8a0, 1.2));
  this.fx.push(Fx.ring(WG.crossX * TS + 8, WG.crossY * TS, 90, 0xfff0c0));
  this.say('Guardián', '«No soy un santo... solo un hombre que sigue la luz.»',
    'La cruz se enciende con una luz cálida. A lo lejos, las zarzas negras de La Linde se marchitan y se deshacen en ceniza.',
    'El camino del norte está abierto. Río arriba, hacia La Bolera.');
  this.dlgEnd = () => this.playCine('bolera');
  this.save();
};
G.openBrambles = function () {
  const ow = this.worlds.exterior;
  for (const b of WG.brambles) if (ow.get(b[0], b[1]) === T.BRAMBLE) ow.set(b[0], b[1], b[2]);
  for (const p of ow.props) if (p.id === 'cruz') p.img = Art.P.cruzluz;
  this.mapCanvas = this.buildMap(ow); this.mapCanvases = {};
};

// --------------------------------------------------------------------- interacción
G.interact = function () {
  const p = this.player, w = this.world;
  const fx0 = p.x + (p.dir === 2 ? -12 : p.dir === 3 ? 12 : 0), fy0 = p.y - 4 + (p.dir === 0 ? 12 : p.dir === 1 ? -14 : 0);
  let bestN = null, bd = 22;
  for (const n of w.npcs) { const d = Math.hypot(n.x - fx0, n.y - 6 - fy0); if (d < bd) { bd = d; bestN = n; } }
  if (bestN) { if (bestN.set) bestN.dir = [1, 0, 3, 2][p.dir]; this.talk(bestN); return true; }
  let best = null; bd = 26;
  for (const pr of w.props) {
    if (!pr.id) continue;
    const d = Math.hypot(pr.x - fx0, pr.y - Math.min(10, pr.img.h / 3) - fy0);
    const reach = Math.max(18, pr.img.w / 2 + 6);
    if (d < reach && d < bd + 12 && (!best || d < bd)) { bd = d; best = pr; }
  }
  if (best) { this.use(best); return true; }
  return false;
};
G.talk = function (n) {
  Sound.play('talk');
  const p = this.player;
  switch (n.key) {
    case 'angel': this.sayAs(n, ...(this.angelLines || ['No temas, Guardián. No todos te hemos olvidado.', 'La batalla no ha terminado. Sigue la luz... aunque la encuentres en la oscuridad.'])); break;
    case 'gato': this.say('Guardián', 'El gato atigrado duerme sobre el cojín, como siempre. Algunas cosas no cambian.'); break;
    case 'perro': this.say('Guardián', 'El perrillo mueve la cola. Es el mejor centinela del valle: ladra antes de que lleguen.'); break;
    case 'cura':
      if (this.stage <= 4) {
        this.sayAs(n, '¡Dios bendito! ¡Un hombre del valle, vivo! Te oímos por la radio... bueno, oímos que alguien nos oía.',
          'Soy Tomás. Somos once, resistiendo tras estas barricadas desde el Colapso.',
          'Todo empezó en La Bolera. Algo despertó en la cueva del nacimiento del Guadalentín, bajo el embalse. Desde entonces, el agua trae la muerte.',
          'Las zarzas negras de La Linde han cerrado el camino del norte. Pero la Cruz de San Gregorio, en la A-326 camino del pantano, aún guarda luz.',
          'Ve a la cruz y reza. Si las zarzas se abren, sigue el río hasta la presa. Y puedes descansar junto a nuestra hoguera cuando quieras.');
        this.stage = 5; this.restWorld = 'exterior'; this.restX = WG.fireX * TS + 8; this.restY = (WG.fireY + 1) * TS + 8; this.dlgEnd = () => { this.save(); this.playCine('cruz'); };
      } else if (this.stage === 5) this.sayAs(n, 'La Cruz de San Gregorio está al norte, junto a la A-326, camino de La Bolera. Que Dios te guarde.');
      else if (this.stage <= 7) this.sayAs(n, 'Las zarzas han caído... lo hemos visto desde el campanario. Sigue el río hasta la presa, hijo.');
      else if (this.stage === 8) {
        this.sayAs(n, '¿Lo has hecho? ¿De verdad? ... El agua del pantano vuelve a ser agua.', 'Las campanas de la Encarnación volverán a sonar en Pozo Alcón. Gracias, Guardián.');
        this.dlgEnd = () => this.startEnding();
      } else this.sayAs(n, 'Cada mañana sale más gente de las casas. Pozo Alcón vuelve a respirar.');
      break;
    case 'curandera':
      p.hp = p.maxHp; p.fe = p.maxFe;
      if (!this.flags.has('hierbas_remedios')) { this.flags.add('hierbas_remedios'); p.herbs += 3; this.sayAs(n, 'Ay, qué mala cara traes. Toma, una infusión de romero y tomillo.', 'Y llévate estas hierbas para el camino. (+3 hierbas medicinales · Vida y Fe al máximo)'); }
      else this.sayAs(n, 'Siéntate un poco, que te curo esas heridas. (Vida y Fe al máximo)');
      break;
    case 'guardia':
      this.sayAs(n, this.stage < 6 ? 'Por la noche salen las Sombras del valle. Si puedes, no andes a oscuras lejos de una hoguera.' : 'Antes conducía el autobús a Baza. Ahora vigilo esta barricada. La vida da muchas vueltas, ¿eh?',
        'Un consejo: cuando la Fe te lo permita, ora. Te salvará el pellejo.');
      break;
    case 'mecanica':
      this.sayAs(n, 'Dicen que quedan reliquias de los viejos santuarios: la Ermita de Santa Ana, la balsa de riego de la carretera, las cárcavas del este...',
        'Y otra en la sierra y otra en el Bosque de Las Higueras, más allá de las zarzas. Cada una te hace más fuerte. Llevas ' + p.relics + ' de 5.');
      break;
    case 'chaval': this.sayAs(n, '¿Tú has estado en el Bosque Encantado de Las Higueras? Mi abuela decía que su manantial cura cualquier cosa.', 'Está río arriba, entre tu casa y el pantano.'); break;
    case 'abuelo': this.sayAs(n, '¿Sabías que dicen que dos carabelas de Colón, la Pinta y la Niña, se hicieron con pinos de esta tierra?', 'Y aquí mismo el cardenal Aragón convenció al bandolero Pedro de Valenzuela para que se entregara. Este pueblo siempre ha sabido plantar cara.'); break;
  }
};
G.use = function (pr) {
  const p = this.player, id = pr.id;
  if (id.startsWith('cartel:')) { this.say('Cartel', id.slice(7)); return; }
  switch (id) {
    case 'baul':
      if (!p.hasSword) {
        p.hasSword = true; this.stage = Math.max(this.stage, 1); pr.img = Art.P.baul_abierto; Sound.play('pickup');
        this.say('Guardián', 'Bajo las toallas, envuelta en un paño, mi espada.', 'Has cogido la ESPADA. Ataca con Espacio, J o el botón de la espada.');
      } else this.say('Guardián', 'Mantas, toallas y la caja vacía de la vieja escopeta del abuelo.');
      break;
    case 'pc': this.say('Guardián', 'El ordenador enciende sin problema: las placas dan de sobra. Lo que no hay es internet.', 'Encima del escritorio siguen mis apuntes de primeros auxilios. Me han servido más que nada en estos años.'); break;
    case 'libros': this.say('Guardián', 'Libros por todas partes: filosofía, teología, historia, primeros auxilios, novelas que he leído tres veces...', 'Cuando cayó el mundo, los libros siguieron hablando. Por eso los guardo.'); break;
    case 'ventilador': this.say('Guardián', 'El ventilador zumba a toda potencia. En agosto, en este valle, es casi un lujo.'); break;
    case 'tele': this.say('Guardián', 'La tele enciende, pero todos los canales son nieve.', 'Por lo menos el reproductor aún lee las películas viejas. Alguna noche me pongo una.'); break;
    case 'nevera': this.say('Guardián', 'La nevera funciona gracias a las baterías. Agua fría, embutido de la matanza y poco más.'); break;
    case 'cocina': this.say('Guardián', 'La placa de la cocina tira de las baterías sin rechistar. Aquí se come caliente.'); break;
    case 'chimenea': this.say('Guardián', 'La chimenea de piedra del salón. Luz no falta, pero en invierno no hay nada como la leña.'); break;
    case 'cochera': this.say('Guardián', 'La cochera. Dentro están las herramientas del campo, los bidones de gasoil y el armario de las baterías de las placas.', 'Mientras haya sol en Pozo Alcón, en esta casa habrá luz.'); break;
    case 'cama': this.rest(this.isNight() ? 'Duermes hasta el amanecer.' : 'Descansas un rato en tu cama.'); break;
    case 'mesa_cocina':
      if (this.tableCool <= 0 && p.hp < p.maxHp) { this.tableCool = 90; p.hp = Math.min(p.maxHp, p.hp + 25); this.say('Guardián', 'Tomates, membrillos y pimientos del huerto. Como algo. (+25 vida)'); }
      else this.say('Guardián', 'Tomates, membrillos y pimientos del huerto. No tengo hambre ahora.');
      break;
    case 'estufa': this.say('Guardián', 'La estufa de leña. En invierno es lo único que mantiene viva la casa.'); break;
    case 'radio':
      if (this.stage === 3) {
        this.stage = 4;
        this.say('Radio', '...ksshh... ¿Hay alguien? Aquí Padre Tomás, desde la Iglesia de la Encarnación, en Pozo Alcón...', '...somos once... los engendros salen cada noche de La Bolera... si alguien me oye... ksshh...');
        this.dlg.push(['Guardián', 'Supervivientes. En el pueblo. Siete años creyendo que era el último...']);
        this.dlg.push(['Guardián', 'Pozo Alcón está al oeste: cruzo el puente viejo y subo hasta la A-326.']);
        this.dlgEnd = () => { this.save(); this.playCine('supervivientes'); };
      } else if (this.stage < 3) this.say('Guardián', 'La radio solo escupe estática. Hace semanas que nadie contesta.');
      else this.say('Guardián', 'Estática. Ya sé dónde están: en la iglesia del pueblo.');
      break;
    case 'caseta': this.say('Guardián', 'El gato duerme sobre el cojín, encima de la caseta. Ni los engendros le quitan el sitio.'); break;
    case 'cruz':
      if (this.stage === 5) this.purifyCross();
      else if (this.stage < 5) this.say('Guardián', 'Una vieja cruz de piedra en el camino del pantano. Al tocarla siento algo cálido.');
      else this.say('Guardián', 'La Cruz de San Gregorio brilla con una luz tibia.');
      break;
    case 'manantial':
      p.hp = p.maxHp; p.fe = p.maxFe;
      if (!this.flags.has('manantial')) { this.flags.add('manantial'); p.maxHp += 20; p.hp = p.maxHp; Sound.play('level'); this.say('Guardián', 'El agua del manantial de Las Higueras está helada y limpia. Me llena de fuerza.', 'Vida máxima +20.'); this.save(); }
      else this.say('Guardián', 'El agua fresca del manantial. Vida y Fe al máximo.');
      break;
    case 'fuente_plaza': p.hp = Math.min(p.maxHp, p.hp + 30); this.say('Guardián', 'La fuente de la Plaza del Ayuntamiento todavía corre. Bebo. (+30 vida)'); break;
    case 'hoguera':
      this.restWorld = 'exterior'; this.restX = WG.fireX * TS + 8; this.restY = (WG.fireY + 1) * TS + 10;
      this.rest('Descansas junto a la hoguera de los supervivientes.');
      break;
    case 'casablanca': this.say('Guardián', 'La casa blanca de enfrente del puente. Era de los vecinos; se fueron el primer invierno del Colapso.', 'Las ventanas están tapiadas por dentro. Alguien las tapió... desde dentro.'); break;
    case 'puerta_iglesia': this.say('Guardián', 'La puerta de la Encarnación está atrancada. Dentro descansan los heridos.'); break;
  }
};
G.rest = function (msg) {
  const p = this.player;
  for (const m of this.world.monsters) if (!m.dead && m.dist(p) < 10 * TS && m.aggro) { this.toast('No puedes descansar con engendros cerca.'); return; }
  p.hp = p.maxHp; p.fe = p.maxFe; p.poison = 0; p.alientoUsed = false;
  for (const id in this.worlds) { const ww = this.worlds[id]; for (const L of (ww.lairs || [])) { L.cleared = false; L.active = false; } if (ww.outdoor) ww.monsters = ww.monsters.filter(m => !m.lair || m.kind === MK.BESTIA); }
  if (this.world.id === 'casa_alta') { this.restWorld = 'casa_alta'; this.restX = WG.upStart[0]; this.restY = WG.upStart[1]; }
  if (this.isNight()) this.day = 0.02;
  this.save();
  this.say('Guardián', msg, 'Vida y Fe recuperadas. Partida guardada.');
};
G.startEnding = function () {
  this.stage = 9;
  this.playCine('final', () => { Sound.music('calma'); this.save(); this.toast('Partida guardada. Pozo Alcón es tuyo: explora libremente.'); });
};
// --------------------------------------------------------------------- diálogos
G.say = function (who, ...lines) {
  if (lines.length === 0) { this.toast(who); return; }
  for (const l of lines) this.dlg.push([who, l]);
  if (!this.page && (this.st === ST.PLAY || this.st === ST.DIALOG)) this.nextPage();
};
G.sayAs = function (n, ...lines) { for (const l of lines) this.dlg.push([n.name, l, n.key]); if (!this.page) this.nextPage(); };
G.nextPage = function () {
  if (this.dlg.length === 0) {
    this.page = null;
    if (this.st === ST.DIALOG) this.st = ST.PLAY;
    const r = this.dlgEnd; this.dlgEnd = null;
    if (r) r();
    return;
  }
  this.page = this.dlg.shift(); this.dlgChars = 0; this.st = ST.DIALOG;
};
G.updateDialog = function (dt) {
  if (!this.page) { this.st = ST.PLAY; return; }
  this.dlgChars += dt * 55;
  if (this.confirm() || this.pressed('Escape')) { if (this.dlgChars < this.page[1].length) this.dlgChars = 9999; else this.nextPage(); }
};
G.toast = function (s) { this.toastS = s; this.toastT = 3.2; };

// --------------------------------------------------------------------- mundos
G.enter = function (id, x, y, dir) {
  const w = this.worlds[id];
  if (!w) return;
  this.world = w;
  const p = this.player;
  p.x = x; p.y = y; p.dir = dir; p.kbT = 0;
  this.orbs = [];
  if (!w.outdoor) w.monsters = [];
  this.lastArea = '';
  this.snapCamera();
};
G.respawn = function () {
  const p = this.player;
  p.dead = false; p.hp = p.maxHp; p.fe = p.maxFe; p.invul = 2; p.flash = 0;
  for (const id in this.worlds) { const ww = this.worlds[id]; if (!ww.outdoor) continue; ww.monsters = ww.monsters.filter(m => m.quest || m.obs || (m.kind === MK.DEMONIO && m === this.miguelDemon)); for (const L of (ww.lairs || [])) L.active = false; }
  this.orbs = [];
  this.enter(this.restWorld, this.restX, this.restY, 0);
  this.boss = null;
  this.st = ST.PLAY;
  this.toast('Te levantas de nuevo. La luz no te ha abandonado.');
};
G.updateFx = function (dt) {
  this.fx = this.fx.filter(f => {
    f.life -= dt;
    if (f.life <= 0) return false;
    f.x += f.vx * dt; f.y += f.vy * dt;
    if (!f.text && !f.ring) { f.vx *= 0.92; f.vy = f.vy * 0.92 + 30 * dt; }
    return true;
  });
};
G.snapCamera = function () { this.camX = this.player.x - WW / 2; this.camY = this.player.y - 10 - WH / 2; this.clampCam(); };
G.clampCam = function () {
  const mw = this.world.w * TS, mh = this.world.h * TS;
  this.camX = mw <= WW ? (mw - WW) / 2 : Math.max(0, Math.min(mw - WW, this.camX));
  this.camY = mh <= WH ? (mh - WH) / 2 : Math.max(0, Math.min(mh - WH, this.camY));
};

// --------------------------------------------------------------------- guardar
G.readSave = function () { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } };
G.save = function () {
  const p = this.player;
  const d = {
    stage: this.stage, flags: [...this.flags], picked: [...this.picked], hp: p.hp, maxHp: p.maxHp, fe: p.fe, maxFe: p.maxFe, lvl: p.lvl, xp: p.xp, atk: p.atk,
    v: SAVE_VERSION, balance: this.balance || 0,
    herbs: p.herbs, relics: p.relics, sword: p.hasSword, world: this.world.id, x: p.x, y: p.y, restWorld: this.restWorld, restX: this.restX, restY: this.restY, day: this.day, kills: this.questKills,
    pts: p.pts, skills: [...p.skills]
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); this.hasSave = true; } catch (e) { this.toast('Este navegador no deja guardar la partida.'); }
};
G.load = function () {
  const d = this.readSave();
  if (!d) return false;
  try {
    this.buildWorlds();
    const p = this.player = new Player();
    this.stage = d.stage; this.flags = new Set(d.flags); this.picked = new Set(d.picked); this.balance = d.balance || 0;
    if ((d.v || 1) < 2) this.stage = d.stage >= 6 ? ETAPA.HOTEL : d.stage; // partidas de la historia antigua
    Object.assign(p, { hp: d.hp, maxHp: d.maxHp, fe: d.fe, maxFe: d.maxFe, lvl: d.lvl, xp: d.xp, atk: d.atk, herbs: d.herbs, relics: d.relics, hasSword: d.sword });
    p.skills = new Set(d.skills || []); p.pts = d.pts !== undefined ? d.pts : Math.max(0, d.lvl - 1);
    this.restWorld = d.restWorld; this.restX = d.restX; this.restY = d.restY; this.day = d.day; this.questKills = d.kills;
    for (const id in this.worlds) { const w = this.worlds[id]; w.pickups = w.pickups.filter(k => !(k.id && this.picked.has(k.id))); }
    if (p.hasSword) for (const pp of this.worlds.casa_alta.props) if (pp.id === 'baul') pp.img = Art.P.baul_abierto;
    if (this.stage >= ETAPA.HOTEL) this.openBrambles();
    if (this.stage >= ETAPA.MIGUEL) for (const pp of this.worlds.exterior.props) if (pp.id === 'cruz') pp.img = Art.P.cruzluz;
    if (this.stage === ETAPA.MIGUEL) { this.stage = ETAPA.CRUZ; }
    if (this.stage >= ETAPA.HOTEL) { const mx = WG.crossX - 4, my = WG.crossY + 3; const mg = new Npc('Miguel', 'miguel', null, Art.P.miguel_caido, null, mx * 16 + 8, my * 16 + 13, 0); this.worlds.exterior.npcs.push(mg); this.worlds.exterior.block(mx, my, 1, 1); }
    if (this.stage > ETAPA.CASETA) for (const pp of this.worlds.exterior.props) if (pp.id === 'caseta') pp.img = Art.P.caseta_abierta;
    this.miguelDemon = null;
    if (this.stage === 2) { this.stage = 1; this.questKills = 0; }
    this.boss = null; this.orbs = []; this.fx = []; this.dlg = []; this.page = null;
    this.enter(d.world, d.x, d.y, 0);
    if (this.world.blocked(this.player.x, this.player.y, this.player.hw, this.player.hh) && !this.world.outdoor) { this.player.x = WG.upStart[0]; this.player.y = WG.upStart[1]; this.world = this.worlds.casa_alta; this.snapCamera(); }
    if (this.restWorld === 'casa_alta') { this.restX = WG.upStart[0]; this.restY = WG.upStart[1]; }
    if (this.stage === 1 && this.world.outdoor) this.stageLogic();
    return true;
  } catch (e) { console.error(e); return false; }
};
