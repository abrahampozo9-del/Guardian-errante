// ====================================================================== LOS TIBIOS · historia principal (capítulos I a III)
// Las etapas siguen el documento de la historia. Los textos están aquí juntos para poder retocarlos.
const ETAPA = { ESPADA: 0, SALIR: 1, RIBERA: 2, RADIO: 3, IGLESIA: 4, GRECO: 5, CASETA: 6, CRUZ: 7, MIGUEL: 8, HOTEL: 9, OBSERVATORIO: 10, HORNICO: 11, CASCADA: 12, AGUJAS: 13, BESTIA: 14, TENTACION: 15, SIERRA: 16 };
const SAVE_VERSION = 2;

CINE.caseta = { title: 'La caseta', pages: [
  ['caseta', 'La puerta de la caseta de turismo, la que nunca se abría, está abierta de par en par.'],
  ['caseta', 'Dentro, unas escaleras bajan en tramos de tres. Huele a algo que no es de este mundo.'],
] };
CINE.caida = { title: 'Miguel', pages: [
  ['caida', 'La cruz se enciende... y el cielo se rasga.'],
  ['caida', 'Algo cae ardiendo sobre los olivares. Algo con alas.'],
] };
CINE.nogales = { title: 'Los Nogales', pages: [
  ['carretera', 'La carretera del pantano sube por el cañón del Guadalentín. Siete años sin que pase un coche.'],
  ['carretera', 'En el kilómetro 6, sobre el cortado de los buitres, hay luz en el Hotel Los Nogales.'],
] };
CINE.hornico = { title: 'La Bolera', pages: [
  ['bolera', 'El embalse de La Bolera. Aquí empezó todo, dicen. Aquí el agua trae la muerte.'],
  ['bolera', 'En la orilla, la vieja casa forestal de El Hornico. Alguien ha encendido una hoguera.'],
] };
CINE.tentacion = { title: 'El señor del mundo', pages: [
  ['tentacion', 'Cuando la Bestia se hunde, el agua se queda quieta como un espejo. Y en la presa hay un hombre.'],
  ['tentacion', 'Traje blanco. Sonrisa amable. No lleva cuernos ni fuego. No le hace falta.'],
] };
CINE.continuara = { pages: [
  ['guardian', 'La cueva PB4 se abre bajo la Sierra de Castril. Al otro lado, dicen, hay una casa llena de relojes parados.'],
  ['alba', 'CONTINUARÁ\n\nCapítulo IV · La Sierra (en preparación)'],
] };
SCENES.caseta = function (t) {
  C.sky(['#06040a', '#120a14', '#1e1018', '#2a1418']);
  C.stars(20, 401, t, 0.5);
  C.r(0, 84, CW, 29, '#1a1614'); for (let x = 0; x < CW; x += 7) C.r(x, 84 + (x % 3), 6, 1, '#24201c');
  // la caseta, grande y en el centro
  C.r(70, 40, 60, 44, '#b8b0a2'); C.r(70, 40, 60, 2, '#d8d0c2'); for (let x = 66; x < 134; x += 6) C.r(x, 30, 6, 11, '#6a2a1a');
  C.r(76, 52, 18, 14, '#1a1614'); C.r(74, 66, 22, 3, '#a89a84');
  const pulse = 0.5 + 0.5 * Math.sin(t * 2);
  C.r(104, 48, 18, 36, '#100204'); C.glow(113, 70, 28 + pulse * 6, `rgba(220,40,20,${0.35 + 0.25 * pulse})`);
  for (let i = 0; i < 5; i++) C.r(106 + i, 56 + i * 6, 14 - i * 2, 2, `rgba(${120 - i * 15},20,10,0.9)`);
  // fuente del Músico al lado
  cg.fillStyle = '#5a564e'; cg.beginPath(); cg.ellipse(42, 84, 18, 5, 0, 0, Math.PI * 2); cg.fill(); C.r(40, 60, 4, 24, '#6a665e'); C.r(39, 52, 6, 9, '#3a4a40'); C.r(40, 48, 4, 4, '#3a4a40');
  C.r(166, 40, 3, 44, '#141414'); C.r(163, 34, 9, 7, '#141414'); C.r(164, 35, 7, 5, '#f0c050'); C.glow(167, 38, 14, 'rgba(255,200,90,0.45)');
};
SCENES.caida = function (t) {
  C.sky(['#0a0814', '#1a1020', '#3a1a20', '#6a2a1a']);
  C.ridge(80, 6, 0.04, 411, '#140c10');
  for (let x = 6; x < CW; x += 9) { const y = 92 + (x % 3); C.r(x, y - 6, 1, 6, '#1a1210'); C.r(x - 3, y - 9, 7, 4, '#2a2a1e'); }
  C.r(0, 96, CW, 17, '#0e0a0a');
  // la cruz encendida a la izquierda
  C.glow(30, 70, 30, 'rgba(255,220,140,0.45)'); C.r(28, 58, 4, 24, '#d8ccb8'); C.r(22, 64, 16, 4, '#d8ccb8');
  // el ángel cayendo en llamas
  const k = Math.min(1, t / 3), x = 170 - k * 60, y = 6 + k * 84;
  for (let i = 0; i < 18; i++) { const tt = i / 18; C.r(x + tt * 40, y - tt * 50, 3 - tt * 2, 3 - tt * 2, `rgba(255,${180 - i * 6},60,${1 - tt})`); }
  C.glow(x, y, 22, 'rgba(255,240,200,0.7)');
  cg.fillStyle = '#fff8e8'; cg.beginPath(); cg.moveTo(x, y); cg.lineTo(x - 12, y - 6); cg.lineTo(x - 4, y + 3); cg.fill(); cg.beginPath(); cg.moveTo(x, y); cg.lineTo(x + 10, y - 9); cg.lineTo(x + 5, y + 3); cg.fill();
  if (t > 3) { C.glow(110, 92, 40 + Math.sin(t * 10) * 3, 'rgba(255,160,60,0.5)'); }
};
SCENES.tentacion = function (t) {
  C.sky(['#0a0a10', '#14141c', '#1e1e26', '#2a2a30']);
  C.reflect ? 0 : 0;
  C.r(0, 52, CW, 30, '#1c2024'); for (let i = 0; i < 30; i++) C.r((i * 37 + t * 4) % CW, 54 + (i * 7) % 26, 8, 1, 'rgba(160,170,180,0.15)');
  C.r(0, 82, CW, 8, '#5a5a54'); C.r(0, 82, CW, 1, '#7a7a72'); for (let x = 4; x < CW; x += 14) C.r(x, 84, 1, 6, '#3a3a36');
  C.r(0, 90, CW, 23, '#121416');
  // el hombre de blanco en la presa
  const x = 120;
  C.glow(x, 66, 26, 'rgba(255,230,180,0.25)');
  C.r(x - 4, 64, 8, 18, '#eeeae2'); C.r(x - 4, 64, 2, 18, '#ffffff'); C.r(x - 3, 56, 6, 8, '#e0bc9c'); C.r(x - 3, 54, 6, 3, '#d8b050'); C.r(x - 1, 66, 2, 6, '#8a1a14');
  C.r(x - 1, 59, 1, 1, '#c89a20'); C.r(x + 1, 59, 1, 1, '#c89a20');
  C.knight(60, 108, t);
};

// ---------------------------------------------------------------- elecciones en los diálogos
ST.CHOICE = 'CHOICE';
G.ask = function (who, text, options, cb) {
  this.choice = { who, text, options, cb, sel: 0 };
  this.st = ST.CHOICE;
};
G.updateChoice = function () {
  const c = this.choice; if (!c) { this.st = ST.PLAY; return; }
  if (this.pressed('ArrowUp', 'KeyW')) c.sel = (c.sel + c.options.length - 1) % c.options.length;
  if (this.pressed('ArrowDown', 'KeyS')) c.sel = (c.sel + 1) % c.options.length;
  let pick = -1;
  for (let i = 0; i < c.options.length; i++) if (this.just.has('Pick' + i)) { this.just.delete('Pick' + i); if (c.sel === i) pick = i; c.sel = i; }
  if (this.pressed('Enter', 'KeyE', 'Space', 'KeyZ')) pick = c.sel;
  if (pick >= 0) { this.choice = null; this.st = ST.PLAY; c.cb(pick); }
};
G.uiChoice = function (g) {
  const c = this.choice; if (!c) return;
  const x = 8, y = VH - 62, w = VW - 16;
  this.panel(g, x, y - c.options.length * 13, w, 56 + c.options.length * 13);
  g.font = FT(7.6); this.text(g, c.who, x + 10, y - c.options.length * 13 + 13, GOLD);
  g.font = FB(7); this.wrap(g, c.text, w - 24).slice(0, 3).forEach((l, i) => this.text(g, l, x + 10, y - c.options.length * 13 + 25 + i * 9, PAPER));
  c.options.forEach((o, i) => {
    const yy = y + 14 + i * 13, sel = i === c.sel;
    if (sel) { g.fillStyle = 'rgba(160,30,24,0.35)'; g.fillRect(x + 8, yy - 9, w - 16, 12); }
    g.font = FB(7); this.text(g, (sel ? '› ' : '  ') + o, x + 12, yy, sel ? PAPER : '#9a8a72');
    this.menuRects.push({ i, x: x + 8, y: yy - 10, w: w - 16, h: 13 });
  });
};

// ---------------------------------------------------------------- objetivos
G.objective = function () {
  const E = ETAPA;
  switch (this.stage) {
    case E.ESPADA: return 'Coge tu espada del baúl del rellano.';
    case E.SALIR: return 'Sal del cortijo.';
    case E.RIBERA: return 'Limpia la ribera de engendros (' + this.questKills + '/6).';
    case E.RADIO: return 'Escucha la radio del porche.';
    case E.IGLESIA: return 'Ve a la Iglesia de la Encarnación, en Pozo Alcón.';
    case E.GRECO: return 'Busca a Santiago, el de El Greco, junto a la fuente del Músico.';
    case E.CASETA: return 'La caseta de turismo está abierta. Mira dentro.';
    case E.CRUZ: return 'Reza en la Cruz de San Gregorio (A-326).';
    case E.MIGUEL: return this.miguelDemon ? 'Protege al ángel caído.' : 'Habla con el ángel caído.';
    case E.HOTEL: return 'Sube por la carretera del pantano hasta el Hotel Los Nogales.';
    case E.OBSERVATORIO: return 'Echa al demonio del observatorio de aves y recupera la esfera.';
    case E.HORNICO: return 'Sigue hasta La Bolera: busca a la gente de El Hornico.';
    case E.CASCADA: return 'Trae agua limpia de la cascada de Guazalamanco.';
    case E.AGUJAS: return 'Limpia las agujas en el jardín botánico de El Hornico.';
    case E.BESTIA: return 'El pantano se agita. Ve a la presa de La Bolera.';
    case E.TENTACION: return 'Hay un hombre de blanco en la presa.';
    default: return 'La cueva PB4 lleva a la sierra (próximamente). Busca reliquias (' + this.player.relics + '/' + RELIQUIAS + ').';
  }
};
const RELIQUIAS = 7;
G.objectiveTarget = function () {
  const E = ETAPA;
  switch (this.stage) {
    case E.RIBERA: case E.RADIO: return [WG.doorX, WG.doorY + 2, 'exterior'];
    case E.IGLESIA: return [WG.priestX, WG.priestY, 'exterior'];
    case E.GRECO: return [WG.grecoX + 1, WG.grecoY + 1, 'exterior'];
    case E.CASETA: return [WG.casetaX, WG.casetaY + 1, 'exterior'];
    case E.CRUZ: return [WG.crossX, WG.crossY, 'exterior'];
    case E.MIGUEL: return [WG.crossX - 4, WG.crossY + 3, 'exterior'];
    case E.HOTEL: return [WS.hotelDoor ? WS.hotelDoor[0] + 1 : 66, WS.hotelDoor ? WS.hotelDoor[1] + 2 : 66, 'pantano'];
    case E.OBSERVATORIO: return [WS.observatorio ? WS.observatorio[0] : 70, WS.observatorio ? WS.observatorio[1] + 1 : 72, 'pantano'];
    case E.HORNICO: return [27, 71, 'bolera'];
    case E.CASCADA: return [6, 48, 'bolera'];
    case E.AGUJAS: return [21, 84, 'bolera'];
    case E.BESTIA: case E.TENTACION: return [120, 86, 'bolera'];
    case E.SIERRA: return [144, 71, 'bolera'];
    default: return null;
  }
};

// ---------------------------------------------------------------- lo que pasa solo
G.stageLogic = function () {
  const w = this.world, p = this.player, E = ETAPA;
  if (this.stage === E.SALIR && w.outdoor) {
    this.stage = E.RIBERA;
    for (const q of WG.questSpawns) {
      const k = this.rnd.bool() ? MK.JABALI : MK.HUECO;
      let x = q[0] * TS + 8; const y = q[1] * TS + 8;
      if (w.blocked(x, y, 7, 4)) x += 16;
      const m = new Monster(k, x, y, 0.85); m.quest = true; w.monsters.push(m);
    }
    this.playCine('ribera', () => this.say('Guardián', 'Ahí están otra vez, rondando la poza. Eran vecinos, algunos. Ahora son... esto.', 'Mientras yo siga aquí, nadie toca esta casa. Ataca con Espacio o con el botón de la espada.'));
  }
  // el demonio que baja a por Miguel: cuando está a media vida, la luz del ángel lo espanta
  if (this.stage === E.MIGUEL && this.miguelDemon && w.id === 'exterior') {
    const d = this.miguelDemon;
    this.miguelT = (this.miguelT || 0) - 1 / 60;
    if (!d.dead && this.miguelT <= 0) {
      this.miguelT = 5;
      const mg = w.npcs.find(n => n.key === 'miguel');
      if (mg && Math.hypot(d.x - mg.x, d.y - mg.y) < 260) { this.damageMonster(d, 18, false, d.x - mg.x, d.y - mg.y, true); for (let i = 0; i < 16; i++) this.fx.push(Fx.spark(mg.x, mg.y - 10, (d.x - mg.x) * 0.6 + this.rnd.gauss() * 20, (d.y - mg.y) * 0.6 + this.rnd.gauss() * 20, 0xfff4c0, 0.6)); }
    }
    if (d.dead || d.hp < d.maxHp * 0.5) {
      if (!d.dead) { d.dead = true; for (let i = 0; i < 30; i++) this.fx.push(Fx.spark(d.x, d.y - 20, this.rnd.gauss() * 80, -this.rnd.next() * 90, i % 2 ? 0xff6a20 : 0x1a0404, 1)); }
      this.miguelDemon = null; Sound.play('roar'); this.shake(0.5);
      this.say('Guardián', 'El demonio chilla, se cubre la cara con las alas y huye hacia el norte, echando humo.', 'El ángel ha levantado una mano. Solo eso. Y ha bastado.');
      this.save();
    }
  }
  if (this.stage === E.BESTIA && w.id === 'bolera' && !this.boss && this.lastArea === 'Presa de La Bolera') {
    this.boss = new Monster(MK.BESTIA, WS.bossX * TS + 8, (WS.bossY - 1) * TS, 1.15);
    w.monsters.push(this.boss);
    Sound.play('roar'); this.shake(0.8);
    this.say('Guardián', 'El agua del pantano hierve... Algo enorme sube desde la cueva del nacimiento.', 'Lo que bajó a la cueva aquella noche no era un hombre. Ya no.');
  }
};
G.onArrive = function (id) {
  const E = ETAPA;
  if (id === 'pantano' && !this.flags.has('cine_nogales')) { this.flags.add('cine_nogales'); this.playCine('nogales'); }
  if (id === 'bolera' && !this.flags.has('cine_hornico')) { this.flags.add('cine_hornico'); this.playCine('hornico'); }
  if (id === 'pantano' && this.stage === E.OBSERVATORIO) this.ensureObsDemon();
};
G.ensureObsDemon = function () {
  const w = this.worlds.pantano; if (!w || w.monsters.some(m => m.kind === MK.DEMONIO && !m.dead)) return;
  const [ox, oy] = WS.observatorio;
  const m = new Monster(MK.DEMONIO, ox * TS, (oy - 1) * TS, 0.75); m.homeX = m.x; m.homeY = m.y; m.spawnFade = 0.5; m.obs = true;
  w.monsters.push(m);
};
G.bossDefeated = function () {
  const E = ETAPA;
  this.boss = null; this.orbs = [];
  for (const m of this.world.monsters) if (m.kind !== MK.BESTIA) m.dead = true;
  Sound.play('purify'); this.shake(1);
  this.stage = E.TENTACION; this.save();
  this.say('Guardián', 'La Bestia se hunde en el agua oscura... y no vuelve a salir.', 'Y entonces todo se queda en silencio. Hasta la ceniza deja de caer.');
  this.dlgEnd = () => this.playCine('tentacion', () => {
    const w = this.world, x = WS.bossX + 2, y = WS.bossY - 3;
    w.npcs.push(new Npc('El hombre de blanco', 'anticristo', Art.people.anticristo, null, null, x * 16 + 8, y * 16 + 13, 0));
  });
};
const _kill = G.killMonster;
G.killMonster = function (m) {
  _kill.call(this, m);
  if (m.obs && this.stage === ETAPA.OBSERVATORIO) {
    this.stage = ETAPA.HORNICO; this.flags.add('esfera'); this.save();
    Sound.play('level');
    this.say('Guardián', 'Entre las tablas del observatorio, donde anidaba el demonio, algo brilla: una esfera de cristal y oro, tibia como una mano.', 'La ESFERA del Reloj del Cielo. Al cogerla, la noche se me aclara un poco: ya veo lo que viene antes de que llegue.', 'Doña Pura dijo que la siguiente pieza estaría «donde el agua todavía está limpia». Río arriba: La Bolera.');
  }
};

// ---------------------------------------------------------------- conversaciones
const _talk = G.talk;
G.talk = function (n) {
  const E = ETAPA, p = this.player, st = this.stage;
  Sound.play('talk');
  switch (n.key) {
    case 'cura':
      if (st <= E.IGLESIA) {
        this.sayAs(n, '¡Dios bendito! ¡Un hombre del valle, vivo! Te oímos por la radio... bueno, oímos que alguien nos oía.',
          'Soy Tomás. Somos once, tras estas barricadas desde el Colapso. Once que no subieron... y que tampoco bajaron.',
          '¿Sabes lo que creo, hijo? Que somos tibios. Ni fríos ni calientes. Apocalipsis 3:16. Por eso seguimos aquí.',
          'Si quieres entender aquella noche, habla con Santiago, el de El Greco, junto a la fuente del Músico. Él abrió la puerta del salón.',
          'Y puedes descansar junto a nuestra hoguera cuando quieras.');
        this.stage = E.GRECO; this.restWorld = 'exterior'; this.restX = WG.fireX * TS + 8; this.restY = (WG.fireY + 1) * TS + 8;
        this.dlgEnd = () => this.save();
      } else if (st === E.GRECO) this.sayAs(n, 'Santiago no sale de El Greco. Está junto a la fuente del Músico. No le hagas mucho caso cuando bebe... o sí.');
      else if (st === E.CASETA) this.sayAs(n, '¿La caseta? ¿Abierta? Que el Señor nos coja confesados.');
      else if (st === E.CRUZ) this.sayAs(n, '¿Te echó la escalera? Entonces no era tu hora. Ve a la Cruz de San Gregorio, junto a la A-326. Reza. A veces el cielo contesta.');
      else if (st <= E.HOTEL) this.sayAs(n, '¿Un ángel? ¿Miguel? ¿El que venció al Dragón? ... Hijo, me tiemblan las piernas. Haz lo que te diga.');
      else this.sayAs(n, 'Cada noche rezo por ti. No sé si sirve. Pero rezo.');
      return;
    case 'santiago':
      if (st < E.GRECO) this.sayAs(n, 'Cerrado. Hace siete años que está cerrado. Vuelve cuando el cura te mande, que a mí no me gusta hablar con forasteros.');
      else if (st === E.GRECO) {
        this.sayAs(n, '¿Te manda Tomás? ... Siéntate. No, mejor de pie. Esto se cuenta de pie.',
          'Aquella noche había una boda, o un bautizo, nunca lo supe. El salón estaba lleno de gente muy bajita. Todos iguales. Todos raros.',
          'Uno te preguntaba si querías ver el cielo. Así, sin más. Y luego había una salida en la pared que nunca había estado ahí.',
          'Muchos se fueron por ella. Otros no quisieron. Y el más raro de todos dijo: «Las puertas del infierno están abiertas».',
          '¿Y sabes qué puerta era? La de la caseta de turismo. Ahí, al lado de la fuente. La que nunca se abría.',
          'Tú estuviste aquí esa noche, ¿sabes? Con una chica de la mano. Te vi. ... ¿No te acuerdas? Ya. Nadie se acuerda.');
        this.stage = E.CASETA; this.dlgEnd = () => this.save();
      } else if (st === E.CASETA) this.sayAs(n, 'La caseta está ahí. Si te atreves, mira. Yo no he vuelto a acercarme.');
      else this.sayAs(n, 'Ultrasantiago, me llamaba un chaval. Nunca supe por qué. Quizá porque sé más de lo que digo.');
      return;
    case 'miguel':
      if (this.miguelDemon) { this.say('Guardián', 'Primero el demonio. ¡Tiene que alejarse de él!'); return; }
      if (st === E.MIGUEL) {
        this.sayAs(n, '...Un tibio. Claro. Solo un tibio podía oír la cruz.',
          'Soy Miguel. Luché contra el Dragón y lo arrojé a la tierra. Ahora la tierra es suya, y yo estoy en el suelo de un olivar.',
          'Escucha. Bajo la caseta del pueblo está el atril, y sobre el atril, lo que mantiene la puerta abierta. Para cerrarla hace falta el Reloj del Cielo.',
          'Se rompió la noche del Arrebato en tres piezas: la esfera, las agujas y la cuerda. Cayeron donde el mundo es más fino.',
          'La esfera está río arriba, en un sitio con nogales, donde los buitres vigilan. Las agujas, donde el agua aún está limpia. La cuerda... en lo alto, entre relojes.',
          'He quemado las zarzas de La Linde. El camino del norte está abierto. Yo no puedo andar todavía. Tú sí.',
          'Y otra cosa, tibio: cuando llegue el momento, tendrás que dejar de serlo.');
        this.dlgEnd = () => { this.openBrambles(); this.stage = E.HOTEL; Sound.play('purify'); this.shake(0.4); this.toast('Las zarzas negras de La Linde arden y se deshacen.'); this.save(); };
      } else this.sayAs(n, 'Sigue la luz, tibio. Aunque a veces la encuentres en la oscuridad.');
      return;
    case 'gerente':
      if (st < E.HOTEL) this.sayAs(n, 'Aquí no se entra sin pagar. Y no aceptamos euros.');
      else if (st === E.HOTEL) {
        this.sayAs(n, 'Un forastero con espada. Qué antiguo. Soy Pura, la gerente. Bueno, lo era. Ahora mando yo.',
          'Aquí somos catorce. Comemos, dormimos y jugamos al pádel. Sí, al pádel. Hay que mantener las costumbres o te vuelves loco.',
          '¿Una esfera brillante? ... Cayó en el observatorio de aves, encima del cortado, la noche que se apagó todo. Desde entonces algo anida ahí.',
          'Los buitres no comen. Vigilan. Y por las noches esa cosa nos mira desde el observatorio.',
          'Quítanosla de encima y la esfera es tuya. Y mientras tanto, la hoguera de la terraza es tuya también.');
        this.stage = E.OBSERVATORIO; this.restWorld = 'pantano'; this.restX = WS.hotelFire[0] * TS + 8; this.restY = WS.hotelFire[1] * TS + 8;
        this.dlgEnd = () => { this.ensureObsDemon(); this.save(); };
      } else if (st === E.OBSERVATORIO) this.sayAs(n, 'El observatorio está al borde del cortado, pasada la piscina. Ten cuidado: esa cosa no es un engendro cualquiera.');
      else this.sayAs(n, 'Desde que te lo cargaste, los buitres se han ido. No sé si eso es bueno.');
      return;
    case 'manuel':
      if (!this.flags.has('manuel1')) {
        this.flags.add('manuel1');
        this.sayAs(n, 'Manuel, camarero. Bueno, camarero era. Ahora soy el que lleva la cuenta de los partidos de pádel.',
          'Antes del Colapso volví al cortijo de mis padres a por unos papeles. Había una puerta que nunca se abría... La abrí.',
          'No me preguntes qué había detrás. Desde entonces me paso las noches mirando una puerta del hotel que tampoco abre.',
          'Si algún día te apetece un partido, aquí estoy. La pista sigue entera. La red, también.');
      } else this.sayAs(n, '¿Un partido? Toca la red de la pista cuando quieras. Los de aquí apuestan raciones de comida.');
      return;
    case 'monitora':
      if (st < E.HORNICO) this.sayAs(n, 'Aquí venían los colegios de campamento. Ahora venimos los que no tenemos adónde ir.');
      else if (st === E.HORNICO) {
        this.sayAs(n, 'Soy Elena. Era monitora del aula de la naturaleza. Esto era un sitio de risas y mochilas, ¿sabes?',
          '¿Unas agujas de oro? Están en el jardín botánico, clavadas en el pedestal del centro. Pero están negras, podridas.',
          'Todo lo que crece alrededor ha cambiado. Hay plantas que no son de este mundo.',
          'Solo hay un agua que sigue limpia: la de la cascada de Guazalamanco, siguiendo el arroyo hacia el oeste. Tráela y a lo mejor las salvas.',
          'La hoguera es tuya. Y si ves a los del arroyo, corre.');
        this.stage = E.CASCADA; this.restWorld = 'bolera'; this.restX = WS.hornicoFire[0] * TS + 8; this.restY = WS.hornicoFire[1] * TS + 8;
        this.dlgEnd = () => this.save();
      } else if (st <= E.AGUJAS) this.sayAs(n, st === E.CASCADA ? 'La cascada está al oeste, sigue el sendero junto al arroyo.' : 'El pedestal está en el centro del jardín. Echa el agua despacio.');
      else this.sayAs(n, 'Cuando sonó lo de la presa pensé que se acababa el mundo. Otra vez.');
      return;
    case 'anticristo':
      this.sayAs(n, 'Por fin. El guardián del valle. El que dijo que no al cielo... y luego tampoco quiso el infierno.',
        'No me mires así. No vengo a pelear. Si quisiera tu muerte, estarías muerto desde hace siete años.',
        'Vengo a ofrecerte algo. Tú no eres de nadie, Guardián. Eso te hace valioso. Para mí, por ejemplo.',
        'Trabaja para mí y te devuelvo lo que perdiste. La memoria. A Cándida. Una casa con luz y sin monstruos en la puerta.');
      this.dlgEnd = () => this.ask('El hombre de blanco', '¿Qué me dices, tibio?', ['«No soy tuyo. Ni ahora ni nunca.»', '«...Déjame pensarlo.»', '«Acepto.»'], k => {
        const w = this.world; w.npcs = w.npcs.filter(x => x.key !== 'anticristo');
        this.balance = (this.balance || 0) + [2, 0, -3][k];
        this.flags.add(['trato_rechazado', 'trato_dudado', 'trato_aceptado'][k]);
        for (let i = 0; i < 40; i++) this.fx.push(Fx.spark(n.x, n.y - 14, this.rnd.gauss() * 60, -this.rnd.next() * 80, k === 0 ? 0xfff0c0 : 0x8a1a14, 1));
        Sound.play(k === 2 ? 'roar' : 'purify');
        const lines = [
          ['Sonríe como si le hubiera hecho gracia. «Ya volverás.» Y ya no está.', 'Siento algo caliente en el pecho. Por primera vez en siete años, no me siento tibio.'],
          ['«Piénsalo. Tengo todo el tiempo del mundo. Literalmente.» Y se deshace como humo.', 'Me tiemblan las manos. No sé si he hecho bien.'],
          ['«Sabía que eras listo.» Me estrecha la mano. Está fría como el agua del pantano.', 'Algo se me ha quedado dentro. Algo que no es mío.'],
        ][k];
        this.stage = ETAPA.SIERRA; this.save();
        this.say('Guardián', ...lines, 'Al otro lado del embalse, la boca de la cueva PB4. Por ahí se sube a la sierra.');
      });
      return;
  }
  _talk.call(this, n);
};

// ---------------------------------------------------------------- objetos
const _use = G.use;
G.use = function (pr) {
  const E = ETAPA, st = this.stage, p = this.player;
  switch (pr.id) {
    case 'caseta':
      if (st < E.CASETA) this.say('Guardián', 'La caseta de turismo. La puerta siempre ha estado cerrada. La ventanilla del poyete, también.');
      else if (st === E.CASETA) {
        pr.img = Art.P.caseta_abierta;
        this.playCine('caseta', () => {
          this.shake(1); Sound.play('roar');
          this.say('Guardián', 'Bajo un tramo. Tres escalones. Otro tramo. Tres más. Las piernas se me mueven solas...',
            'Y de pronto algo me empuja hacia arriba, como si la escalera me escupiera. Caigo de culo junto a la fuente.',
            'Una voz desde abajo, tranquila, horrible: «Todavía no. Ni frío ni caliente. Vuelve cuando seas algo».',
            'Padre Tomás dijo que en la Cruz de San Gregorio el cielo a veces contesta. Habrá que preguntarle.');
          this.stage = E.CRUZ; this.dlgEnd = () => this.save();
        });
      } else this.say('Guardián', 'La puerta sigue abierta. Abajo se oye, muy lejos, una música de celebración.');
      return;
    case 'fuente_musico': p.hp = Math.min(p.maxHp, p.hp + 20); this.say('Guardián', 'La fuente del Músico. El agua está fría y sabe a hierro. (+20 vida)'); return;
    case 'greco_puerta': this.say('Guardián', 'El Greco: bar, restaurante y salón de celebraciones. La puerta del salón tiene un candado oxidado. Y arañazos por dentro.'); return;
    case 'cruz':
      if (st === E.CRUZ) this.fallMiguel();
      else if (st < E.CRUZ) this.say('Guardián', 'Una vieja cruz de piedra en el camino del pantano. Al tocarla siento algo cálido.');
      else this.say('Guardián', 'La Cruz de San Gregorio brilla con una luz tibia.');
      return;
    case 'hotel_puerta': this.say('Guardián', 'La recepción del hotel. Huele a lejía y a guiso. Dentro duermen los que hacen guardia por la noche.'); return;
    case 'observatorio': this.say('Guardián', st <= E.OBSERVATORIO ? 'El observatorio de aves. Las tablas están arañadas y huele a azufre.' : 'Desde aquí se ve todo el cortado. Los buitres ya no vuelven.'); return;
    case 'padel': this.say('Manuel', 'El pádel, de momento, solo en la pista de Manuel... y aún está tensando la red. (Minijuego en preparación.)'); return;
    case 'hoguera_hotel':
      this.restWorld = 'pantano'; this.restX = WS.hotelFire[0] * TS + 8; this.restY = WS.hotelFire[1] * TS + 8;
      this.rest('Descansas junto a la hoguera de la terraza de Los Nogales.'); return;
    case 'hoguera_hornico':
      this.restWorld = 'bolera'; this.restX = WS.hornicoFire[0] * TS + 8; this.restY = WS.hornicoFire[1] * TS + 8;
      this.rest('Descansas junto a la hoguera de El Hornico.'); return;
    case 'hornico_casa': this.say('Guardián', 'La vieja casa forestal, restaurada. Dentro, mapas del parque natural clavados con chinchetas y un fusil sin balas.'); return;
    case 'hornico_aula': this.say('Guardián', 'El aula de la naturaleza. Literas, dibujos de pájaros en las paredes y una mochila pequeña que nadie ha venido a recoger.'); return;
    case 'cascada':
      if (st === E.CASCADA) {
        this.flags.add('agua_limpia'); this.stage = E.AGUJAS; Sound.play('heal'); this.save();
        p.hp = p.maxHp; p.fe = p.maxFe;
        this.say('Guardián', 'La cascada de Guazalamanco. El agua cae entre la arboleda, limpia, como si aquí no hubiera pasado nada.', 'Lleno la cantimplora. AGUA LIMPIA. Vida y Fe al máximo.');
      } else { p.hp = p.maxHp; this.say('Guardián', 'El agua de Guazalamanco. Beber aquí es como volver a ser niño. (Vida al máximo)'); }
      return;
    case 'agujas':
      if (st === E.AGUJAS) {
        pr.img = Art.P.pedestal_limpio; this.flags.add('agujas'); this.stage = E.BESTIA; Sound.play('purify'); this.shake(0.8); this.save();
        this.say('Guardián', 'Echo el agua de Guazalamanco sobre las agujas. El negro se deshace como hollín mojado.', 'Las AGUJAS del Reloj del Cielo. Doradas. Y, en cuanto las arranco del pedestal, el suelo tiembla.', 'Del embalse llega un rugido que no es de este mundo. Viene de la presa.');
      } else if (st < E.AGUJAS) this.say('Guardián', 'Unas agujas de reloj enormes, clavadas en el pedestal. Negras, podridas. Al tocarlas me arde la mano.');
      else this.say('Guardián', 'El pedestal vacío. Alrededor, las plantas raras se están secando.');
      return;
    case 'cueva_pb4':
      if (st >= E.SIERRA) this.playCine('continuara');
      else this.say('Guardián', 'La boca de la cueva PB4. Estrecha, oscura, horizontal. Un cartel de espeleología medio borrado. Aún no es el momento.');
      return;
  }
  _use.call(this, pr);
};
G.fallMiguel = function () {
  const E = ETAPA, w = this.world;
  for (const pr of w.props) if (pr.id === 'cruz') pr.img = Art.P.cruzluz;
  Sound.play('purify'); this.shake(0.6);
  this.playCine('caida', () => {
    const mx = WG.crossX - 4, my = WG.crossY + 3;
    const mg = new Npc('Miguel', 'miguel', null, Art.P.miguel_caido, null, mx * 16 + 8, my * 16 + 13, 0);
    w.npcs.push(mg); w.block(mx, my, 1, 1);
    this.stage = E.MIGUEL;
    const d = new Monster(MK.DEMONIO, (mx + 6) * TS, (my - 5) * TS, 0.5); d.aggro = true; d.spawnFade = 1;
    w.monsters.push(d); this.miguelDemon = d; this.miguelT = 3;
    Sound.play('roar'); this.shake(0.8);
    this.say('Guardián', 'Entre los olivos, un hombre con alas, herido, con la túnica manchada de sangre. Brilla.', 'Y detrás de él, bajando del cielo a por él, un demonio.', '¡Tengo que alejarlo del ángel! (La espada apenas le hace daño. Aguanta: el ángel te ayudará.)');
  });
};
