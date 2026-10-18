// ====================================================================== Abraham u Oliver, y la familia en la casa del río
// Al empezar una partida nueva se elige hermano. Con Oliver (tez más blanca, castaño), Cándida pasa a ser
// Anabelén, una chica de Olvera (Cádiz), y tienen un hijo pequeño, Mario. Al acabar la historia (si no
// acabas en la caseta), ella se viene a vivir al cortijo del río, y el otro hermano vuelve también.
G.hero = 'abraham';
const HEROES = {
  abraham: { name: 'Abraham', other: 'Oliver', desc: ['Moreno, de barba cerrada.', 'Lleva siete años solo en el cortijo.'], skin: [0x3a2418, 0x6a4430, 0x9a6a4a, 0xc08a64, 0xdcaa80], hair: [0x0e0a08, 0x1e1612, 0x2e221a, 0x40322a] },
  oliver: { name: 'Oliver', other: 'Abraham', desc: ['Castaño y de piel clara.', 'En la sierra, alguien no ha dejado de esperarle.'], skin: [0x6a4a3a, 0x9a7460, 0xc8a088, 0xe4c0a4, 0xf4dcc4], hair: [0x24160c, 0x40281a, 0x6a4426, 0x8a5e38] },
};
G.brother = function () { return HEROES[this.hero].other; };
G.novia = function () { return this.hero === 'oliver' ? 'Anabelén' : 'Cándida'; };
G.setHero = function (id) {
  if (!HEROES[id]) id = 'abraham';
  this.hero = id;
  const S = Art.heroSets && Art.heroSets[id];
  if (S) {
    Art.hero = S.hero; Art.heroAtk = S.atk; this.heroSkinCss = S.skin;
    if (Art.people.reflejo) { const grey = s => { const b = Px.copy(s); for (let i = 0; i < b.d.length; i++) { const v = b.d[i]; if (!(v >>> 24)) continue; const l = Math.round(((v >> 16 & 255) * 0.3 + (v >> 8 & 255) * 0.59 + (v & 255) * 0.11) * 0.9); b.d[i] = ((v & 0xff000000) | (l << 16) | (l << 8) | Math.min(255, l + 12)) >>> 0; } return b; }; Art.people.reflejo = Art.hero.map(d => d.map(grey)); }
  }
  const H = HEROES[id];
  if (typeof FIG !== 'undefined' && FIG.GSKIN) { H.skin.forEach((c, i) => FIG.GSKIN[i] = c); H.hair.forEach((c, i) => FIG.GHAIR[i] = c); }
  if (typeof CS !== 'undefined' && CS.flush) CS.flush();
  this.hudSig = null;
};

// ---------------------------------------------------------------- textos que cambian con Oliver
const OLI_LINES = {
  'Yo arreglaba relojes en el pueblo, en la calle de la Iglesia. Un buen día empezaron a ir raros. Todos a la vez. Unos adelantaban, otros se paraban, y alguno iba al revés.':
    'Yo arreglaba relojes en Olvera, allá en la sierra de Cádiz, en la calle Llana. Un buen día empezaron a ir raros. Todos a la vez. Unos adelantaban, otros se paraban, y alguno iba al revés.',
  'Me subí aquí con mis cachivaches y con mi coche, el de colección, a ver si en la sierra se aclaraban. Esa noche teníamos que bajar a El Greco a conocer a la familia del novio de mi nieta.':
    'Me vine a Pozo Alcón con mi nieta, con mis cachivaches y con mi coche, el de colección, y subí a la sierra a ver si aquí se aclaraban. Esa noche teníamos que bajar a El Greco a conocer a la familia del novio de la niña.',
  'Íbamos a presentar a mis abuelos a tus padres. Tu padre se empeñó en que el salón de casa era pequeño, y acabamos todos en El Greco. ¿Te acuerdas de Giro, tu gato, con la cabeza torcida?':
    ['Vinimos desde Olvera para presentar a mis abuelos a tus padres. Tu padre se empeñó en que el salón de casa era pequeño, y acabamos todos en El Greco. ¿Te acuerdas de Giro, tu gato, con la cabeza torcida?',
      'Y este es Mario. Tiene seis años. Es tuyo, Oliver. Nació aquí arriba, el invierno después de que te soltaras de mi mano.'],
  'Baja ya. Y cuida de la niña, que la niña te cuida a ti desde hace siete años.': 'Baja ya. Y cuida de la niña y del chiquillo, que la niña te cuida a ti desde hace siete años.',
  'Baja al pueblo. Yo voy detrás, por el camino de los pastores. Y pásate por el abuelo antes, que te tiene algo.': 'Baja al pueblo. Yo voy detrás con Mario, por el camino de los pastores. Y pásate por el abuelo antes, que te tiene algo.',
  'He llegado por el camino de los pastores. Te esperaba en la plaza. Como en el sueño.': 'He llegado con Mario por el camino de los pastores. Te esperábamos en la plaza. Como en el sueño.',
  'En el cortijo del río, las placas siguen dando luz. Cándida se viene a vivir conmigo, y los domingos subimos a ver al abuelo. Mi hermano Oliver también ha vuelto.':
    'En el cortijo del río, las placas siguen dando luz. Anabelén y Mario se vienen a vivir conmigo, y los domingos subimos a ver al abuelo. Mi hermano Abraham también ha vuelto.',
};
G.fixText = function (s) {
  if (typeof s !== 'string' || this.hero !== 'oliver') return s;
  const r = OLI_LINES[s]; if (r) return r;
  return s.replace(/Cándida/g, 'Anabelén').replace(/Mi hermano Oliver/g, 'Mi hermano Abraham');
};
const fixLines = lines => { const out = []; for (const l of lines) { const r = G.fixText(l); if (Array.isArray(r)) out.push(...r); else out.push(r); } return out; };
const _sayF = G.say;
G.say = function (who, ...lines) { return _sayF.call(this, this.fixText(who), ...fixLines(lines)); };
const _sayAsF = G.sayAs;
G.sayAs = function (n, ...lines) { if (n && n.key === 'candida') n.name = this.novia(); return _sayAsF.call(this, n, ...fixLines(lines)); };
const _toastF = G.toast;
G.toast = function (s) { return _toastF.call(this, this.fixText(s)); };
const _objF = G.objective;
G.objective = function () { return this.fixText(_objF.call(this)); };
const _cineF = G.playCine;
G.playCine = function (id, onEnd) {
  const c = CINE[id];
  if (c) { if (!c._orig) c._orig = c.pages; c.pages = c._orig.map(([sc, t]) => [sc, this.fixText(t)]); }
  return _cineF.call(this, id, onEnd);
};
// el final de la Tierra cuenta que ella y el hermano se vienen a la casa
if (CINE.final_tierra) for (const pg of CINE.final_tierra.pages) if (pg[1].startsWith('En el cortijo del río')) pg[1] = 'En el cortijo del río, las placas siguen dando luz. Cándida se viene a vivir conmigo, y los domingos subimos a ver al abuelo. Mi hermano Oliver también ha vuelto.';

// ---------------------------------------------------------------- elegir hermano al empezar
ST.HEROE = 'HEROE';
const _introF = G.startIntro;
G.startIntro = function () { this.st = ST.HEROE; this.heroSel = this.hero === 'oliver' ? 1 : 0; this.heroIntro = _introF; };
G.updateHeroe = function () {
  const ids = ['abraham', 'oliver'];
  if (this.pressed('Escape', 'Pick99')) { this.st = ST.TITLE; return; }
  if (this.pressed('ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD')) { this.heroSel = 1 - (this.heroSel || 0); Sound.play('talk'); }
  for (let i = 0; i < 2; i++) if (this.just.has('Pick' + i)) { this.just.delete('Pick' + i); if (this.heroSel === i) { this.pickHero(ids[i]); return; } this.heroSel = i; Sound.play('talk'); }
  if (this.pressed('Enter', 'KeyE', 'Space', 'KeyZ', 'Pick50')) this.pickHero(ids[this.heroSel || 0]);
};
G.pickHero = function (id) { this.setHero(id); Sound.play('level'); _introF.call(this); };
G.uiHeroe = function (g) {
  g.fillStyle = 'rgba(8,6,5,0.96)'; g.fillRect(0, 0, VW, VH);
  g.font = FT(13); let tw = g.measureText('¿Quién eres?').width; this.text(g, '¿Quién eres?', VW / 2 - tw / 2, 26, GOLD);
  g.font = FB(6.5); const sub = 'Dos hermanos del cortijo del río. Elige con cuál vives esta historia.'; tw = g.measureText(sub).width; this.text(g, sub, VW / 2 - tw / 2, 38, SOFT);
  ['abraham', 'oliver'].forEach((id, i) => {
    const H = HEROES[id], S = Art.heroSets[id], x = VW / 2 + (i ? 70 : -70), y = 112, sel = (this.heroSel || 0) === i;
    g.fillStyle = sel ? 'rgba(232,196,106,0.14)' : 'rgba(40,34,28,0.7)'; g.fillRect(x - 62, 48, 124, 136);
    g.strokeStyle = sel ? GOLD : '#4a4036'; g.lineWidth = sel ? 1.5 : 1; g.strokeRect(x - 61.5, 48.5, 123, 135); g.lineWidth = 1;
    const fr = sel ? S.hero[0][1 + Math.floor(this.clock * 4) % 2] : S.hero[0][0];
    g.drawImage(cv(fr), x - 20, y - 52, 40, 56);
    g.font = FT(10); tw = g.measureText(H.name).width; this.text(g, H.name, x - tw / 2, y + 22, sel ? GOLD : PAPER);
    g.font = FB(6); H.desc.forEach((l, k) => { this.wrap(g, l, 112).forEach((ll, j) => { const w = g.measureText(ll).width; this.text(g, ll, x - w / 2, y + 36 + k * 18 + j * 8, SOFT); }); });
    this.menuRects.push({ x: x - 62, y: 48, w: 124, h: 136, i });
  });
  g.font = FB(6.5); const hint = this.touch ? 'Toca otra vez para empezar' : '← → para elegir · Enter para empezar'; tw = g.measureText(hint).width; this.text(g, hint, VW / 2 - tw / 2, VH - 22, '#ffe68a');
  g.fillStyle = 'rgba(232,196,106,0.15)'; g.fillRect(8, VH - 30, 50, 14); g.strokeStyle = GOLD; g.strokeRect(8.5, VH - 29.5, 49, 13);
  g.font = FB(6.5); this.text(g, 'Volver', 19, VH - 20, PAPER); this.menuRects.push({ x: 4, y: VH - 34, w: 58, h: 22, i: 99 });
};

// ---------------------------------------------------------------- guardar y cargar
const _saveF = G.save;
G.save = function () {
  const r = _saveF.apply(this, arguments);
  try { const s = localStorage.getItem(SAVE_KEY); if (s) { const d = JSON.parse(s); d.hero = this.hero; localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } } catch (e) { }
  return r;
};
const _loadF = G.load;
G.load = function () {
  const d = this.readSave(); this.setHero(d && d.hero || 'abraham');
  const ok = _loadF.apply(this, arguments); if (ok) FAM.sync(); return ok;
};
const _newF = G.newGame;
G.newGame = function () { this.setHero(this.hero); _newF.call(this); };

// ---------------------------------------------------------------- Mario, y la familia en casa
const FAM = {};
FAM.casa = () => G.stage >= ETAPA.FIN && !G.flags.has('final_infierno');
FAM.put = (wid, key, name, set, x, y, dir) => {
  const w = G.worlds[wid]; if (!w || w.npcs.some(n => n.key === key)) return;
  const n = new Npc(name, key, set, null, null, x * 16 + 8, y * 16 + 13, dir || 0); n.story = true; n.fam = true; w.npcs.push(n);
};
FAM.drop = (wid, key) => { const w = G.worlds[wid]; if (w) w.npcs = w.npcs.filter(n => n.key !== key); };
FAM.sync = function () {
  if (!G.worlds) return;
  const oli = G.hero === 'oliver';
  for (const id in G.worlds) for (const n of G.worlds[id].npcs) if (n.key === 'candida') n.name = G.novia();
  // Mario va siempre al lado de su madre, salvo en la buhardilla
  for (const id in G.worlds) {
    const w = G.worlds[id], c = w.npcs.find(n => n.key === 'candida');
    const m = w.npcs.find(n => n.key === 'mario');
    if (oli && c && id !== 'buhardilla') { if (!m) { const n = new Npc('Mario', 'mario', Art.people.mario, null, null, c.x + 14, c.y + 4, c.dir); n.story = true; w.npcs.push(n); } else { m.x = c.x + 14; m.y = c.y + 4; } }
    else if (m && !(m.fam && oli && FAM.casa())) w.npcs = w.npcs.filter(n => n !== m);
  }
  // después del final: a vivir al cortijo del río
  if (FAM.casa()) {
    FAM.drop('exterior', 'candida'); FAM.drop('exterior', 'mario');
    FAM.put('casa_baja', 'candida', G.novia(), Art.people.candida, 20, 6, 2);
    FAM.put('casa_baja', 'hermano', G.brother(), Art.people[oli ? 'abraham_c' : 'oliver_c'], 3, 7, 3);
    if (oli) FAM.put('casa_alta', 'mario', 'Mario', Art.people.mario, 24, 13, 0);
  } else { FAM.drop('casa_baja', 'candida'); FAM.drop('casa_baja', 'hermano'); FAM.drop('casa_alta', 'mario'); }
};
const _refF = Q.refresh;
Q.refresh = function () { _refF.call(Q); FAM.sync(); };
const _enterF = G.enter;
G.enter = function (id, x, y, dir) { const r = _enterF.call(this, id, x, y, dir); FAM.sync(); return r; };
// al terminar la historia: el hermano llega por el camino de Huesa
const _finalF = ABJ.final;
ABJ.final = function (k) {
  _finalF.call(this, k);
  if (k !== 'infierno') G.flags.add('fam_llegada'); // se cuenta en cuanto acaben la cinemática y los diálogos del final
};
FAM.llegada = function () {
  G.flags.delete('fam_llegada'); G.flags.add('fam_casa'); FAM.sync();
  const b = G.brother(), n = G.novia(), oli = G.hero === 'oliver';
  G.say('Guardián', 'Esa tarde, por el camino de Huesa, sube alguien con una mochila al hombro y la barba llena de polvo. Lo conozco por la forma de andar antes de verle la cara.',
    'Es mi hermano. ' + b + '. Siete años sin saber el uno del otro.',
    n + (oli ? ' y Mario han' : ' ha') + ' bajado de la sierra con sus cosas. Ya no se vuelve' + (oli ? 'n' : '') + ' a subir: se queda' + (oli ? 'n' : '') + ' a vivir conmigo en el cortijo del río.',
    b + ' coge su cama de siempre, la de la colcha lila. En la casa del río vuelve a haber ruido.');
  G.dlgEnd = () => G.save();
};
const _updF = G.update;
G.update = function (dt) {
  _updF.call(this, dt);
  if (this.st === ST.PLAY && !this.page && !this.cine && this.flags && this.flags.has('fam_llegada') && this.stage >= ETAPA.FIN) FAM.llegada();
};
const _talkF = G.talk;
G.talk = function (n) {
  const oli = this.hero === 'oliver', day = this.dayN || 0;
  const pick = arr => arr[day % arr.length];
  if (n.key === 'mario') {
    Sound.play('talk');
    if (n.fam) { this.sayAs(n, ...pick([['¡Papá! ¿Me enseñas a usar la espada? ... Vale, la de madera.'], ['El tío ' + this.brother() + ' dice que tú de pequeño te dabas con todas las puertas.', 'Yo no me doy con ninguna.'], ['He visto un jabalí desde la ventana. Era así de grande. No, más.'], ['Mamá dice que en Olvera las casas son blancas y están colgadas de una peña. ¿Me llevas un día?']])); return; }
    this.sayAs(n, ...(this.stage >= ETAPA.VUELTA ? ['¿Tú eres mi papá? Mamá dice que sí. Que te perdiste en una cueva muy larga.', 'Yo no me pierdo nunca. Me sé todos los caminos de la sierra.'] : ['...', '(Mario se esconde detrás de su madre y te mira de reojo.)']));
    return;
  }
  if (n.key === 'hermano') {
    Sound.play('talk');
    this.sayAs(n, ...pick([
      ['Siete años, hermano. Yo estaba en Huesa cuando se fue la luz. Nadie salía de allí: el pueblo entero se encerró.', 'Cuando vi bajar el agua limpia por el río, supe que habías sido tú.'],
      ['Mi cama sigue igual. Hasta la colcha lila de mamá. No has tocado nada en siete años, ¿eh?'],
      ['Mañana me bajo a la cochera a mirar las baterías. Tú descansa, que ya has hecho bastante.'],
      ['¿Te acuerdas de cuando el abuelo nos llevaba a Las Juntas a coger cangrejos? Ya habrá vuelto alguno.'],
    ]));
    return;
  }
  if (n.key === 'candida' && n.fam) {
    Sound.play('talk');
    this.sayAs(n, ...pick(oli ? [
      ['En Olvera las casas son blancas y se cuelgan de la peña. Esta es de piedra y se agarra al río. Me gusta igual.'],
      ['Mario ya ha elegido habitación: la del cuadro. Dice que la cama rosa es de princesa, pero que le da igual.'],
      ['Los domingos subimos a ver al abuelo. Dice que en cuanto acabe el reloj de cuco de la abuela se baja con nosotros.'],
    ] : [
      ['Te esperé siete años en la sierra. Ahora no pienso esperar ni un día más lejos de ti.'],
      ['El abuelo dice que los relojes de esta casa van bien. Que es la primera casa del valle en la que van bien.'],
      ['Los domingos subimos a ver al abuelo. Y el resto de la semana, aquí. Ya no hay prisa.'],
    ]));
    return;
  }
  return _talkF.call(this, n);
};

// ---------------------------------------------------------------- pantalla y bucle
const _lateF = Q.late;
Q.late = function () {
  _lateF();
  const _rq = G.render;
  G.render = function (ctx, cw, ch, dpr) {
    if (this.st !== ST.HEROE) return _rq.call(this, ctx, cw, ch, dpr);
    this.st = ST.TITLE; _rq.call(this, ctx, cw, ch, dpr); this.st = ST.HEROE;
    const L = this.layout; ctx.setTransform(L.sc * dpr, 0, 0, L.sc * dpr, L.ox * dpr, L.oy * dpr);
    this.menuRects = []; this.uiHeroe(ctx); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const _upd = G.update;
  G.update = function (dt) { if (this.st === ST.HEROE) { this.clock += dt; this.updateHeroe(); return; } _upd.call(this, dt); };
};
