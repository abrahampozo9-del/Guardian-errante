// ====================================================================== más cosas que tocar en el cortijo del río
// Casi todo lo de la casa se puede usar: sentarse en el sofá, beber agua, ducharse (quita el veneno y el
// cansancio), mirarse al espejo, regar la maceta... y tres cosas nuevas: la foto de los dos hermanos,
// el calendario de la cocina y el botiquín del baño.
const _initQuestsC = Art.initQuests;
Art.initQuests = function () {
  _initQuestsC.call(this);
  const { img, p, r, ov, line, outline } = Px;
  // aparador pequeño con la foto enmarcada encima
  { const b = img(16, 22); r(b, 2, 10, 12, 11, 0x6a4424); r(b, 2, 10, 12, 1, 0x8a5e34); r(b, 3, 13, 10, 3, 0x5a3a1e); r(b, 3, 17, 10, 3, 0x5a3a1e); p(b, 8, 14, 0xd0a840); p(b, 8, 18, 0xd0a840);
    r(b, 4, 2, 8, 8, 0x8a6a3a); r(b, 5, 3, 6, 6, 0xd8ccb0); r(b, 5, 6, 6, 3, 0x7a9ab0); ov(b, 6.6, 5.5, 1, 1.4, 0x5a3a2a); ov(b, 9.4, 5.6, 1, 1.3, 0x8a5a3a); r(b, 6, 7, 2, 2, 0x3a4a5a); r(b, 9, 7, 2, 2, 0x6a3a2a);
    outline(b, 0x1a120a); Art.P.aparador_foto = b; }
  // calendario de pared
  { const b = img(12, 14); r(b, 1, 2, 10, 11, 0xf0ece0); r(b, 1, 2, 10, 3, 0xb03a2a); p(b, 6, 1, 0x3a3a3a); for (let y = 6; y < 12; y += 2) for (let x = 2; x < 10; x += 2) p(b, x, y, 0x8a8478); line(b, 2, 6, 7, 10, 0x2a2a2a); outline(b, 0x3a3226); Art.P.calendario = b; }
  // botiquín de pared
  { const b = img(14, 12); r(b, 1, 1, 12, 10, 0xf2f0ea); r(b, 1, 1, 12, 1, 0xffffff); r(b, 6, 3, 2, 6, 0xc82a20); r(b, 4, 5, 6, 2, 0xc82a20); r(b, 12, 2, 1, 8, 0xc8c4b8); outline(b, 0x5a5650); Art.P.botiquin = b; }
};

// ---------------------------------------------------------------- dar nombre a lo que ya había
const idsCasa = (w, list) => { for (const [key, id, fn] of list) { const im = Art.P[key]; let k = 0; for (const pr of w.props) if (pr.img === im && !pr.id) { const nid = fn ? fn(pr, k++) : id; if (nid) pr.id = nid; } } };
const _hgC = WG.houseGround;
WG.houseGround = function () {
  const w = _hgC.call(this);
  idsCasa(w, [['sofa', 'sofa'], ['sofa_v', 'sofa'], ['butaca', 'butaca'], ['mesa_camilla', 'camilla'], ['maceta', 'maceta'], ['fregadero_lat', 'fregadero'], ['garrafa', 'garrafa'], ['silla', 'silla'],
    ['encimera_lat', null, (pr, k) => k === 0 ? 'despensa' : k === 2 ? 'cajon_cocina' : null]]);
  w.prop('aparador_foto', 2, 2, 2, 2, 1, 1).id = 'foto';
  w.prop('calendario', 13, 1).id = 'calendario';
  return w;
};
const _huC = WG.houseUpper;
WG.houseUpper = function () {
  const w = _huC.call(this);
  idsCasa(w, [['lavabo', 'espejo'], ['vater', 'vater'], ['bide', 'bide'], ['ducha', 'ducha'], ['cama_lila', 'cama_hermano'], ['cama_blanca', 'cama_padres'], ['cama_rosa', 'cama_rosa'],
    ['comoda', 'comoda'], ['comoda_clara', 'comoda_madre'], ['cubo', 'cubo'], ['toallas', 'toallas'], ['flexo', 'flexo'], ['silla_oficina', 'silla_pc'],
    ['mesita', null, (pr) => pr.x < 40 ? 'mesita_padres' : pr.x < 200 ? 'mesita_tuya' : 'mesita_rosa']]);
  w.prop('botiquin', 25, 5).id = 'botiquin';
  return w;
};

// ---------------------------------------------------------------- qué pasa al usarlas
G.casaCool = {};
const listo = (id, s) => { const t = G.casaCool[id] || 0; if (G.clock < t) return false; G.casaCool[id] = G.clock + s; return true; };
const unaVez = id => { if (G.flags.has('casa_' + id)) return false; G.flags.add('casa_' + id); return true; };
const _useC = G.use;
G.use = function (pr) {
  const p = this.player, H = this.brother ? this.brother() : 'mi hermano', fam = typeof FAM !== 'undefined' && FAM.casa(), oli = this.hero === 'oliver';
  const yo = oli ? 'Oliver' : 'Abraham';
  switch (pr.id) {
    case 'sofa': case 'butaca':
      if (listo('sofa', 60)) { this.addFatigue && this.addFatigue(-8); p.hp = Math.min(p.maxHp, p.hp + 15); this.say('Guardián', pr.id === 'butaca' ? 'La butaca del abuelo. Me siento cinco minutos y cierro los ojos. (+15 vida, algo menos cansado)' : 'Me dejo caer en el sofá. Los muelles crujen como siempre. (+15 vida, algo menos cansado)'); }
      else this.say('Guardián', 'Si me siento otra vez, ya no me levanto.');
      return;
    case 'camilla': this.say('Guardián', 'La mesa camilla, con sus faldas de cuadros y el brasero eléctrico debajo.', this.isNight() ? 'De noche es donde mejor se está de toda la casa.' : 'En invierno, aquí se hace la vida.'); return;
    case 'maceta': {
      if (!listo('maceta', 200)) { this.say('Guardián', 'Ya la he regado. Si le echo más, la ahogo.'); return; }
      const n = (this.flags.has('riego4') ? 5 : this.flags.has('riego3') ? 4 : this.flags.has('riego2') ? 3 : this.flags.has('riego1') ? 2 : 1); this.flags.add('riego' + n);
      if (n >= 5 && unaVez('flor')) { p.maxFe += 5; p.fe = Math.min(p.maxFe, p.fe + 5); Sound.play('level'); this.say('Guardián', 'La gitanilla ha echado flor. Roja, como las de los balcones de antes.', 'Es una tontería, pero me alegra el día. (Fe máxima +5)'); }
      else this.say('Guardián', n >= 5 ? 'La gitanilla sigue en flor.' : 'Riego la maceta. Siete años y la gitanilla sigue viva, a su manera.');
      return;
    }
    case 'fregadero': case 'garrafa':
      if (listo('agua', 30)) { p.hp = Math.min(p.maxHp, p.hp + 10); this.say('Guardián', pr.id === 'garrafa' ? 'Agua del Nacimiento del Guadalentín, en garrafa. Fría y buena. (+10 vida)' : 'El grifo tira del depósito de la cubierta. Me echo agua en la cara y bebo. (+10 vida)'); }
      else this.say('Guardián', 'Ya he bebido bastante.');
      return;
    case 'silla': this.say('Guardián', 'La silla de enea de la cocina. Cojea de una pata desde que tengo memoria.'); return;
    case 'despensa':
      if (unaVez('despensa')) { this.addDuros && this.addDuros(15); this.say('Guardián', 'Detrás de los botes de tomate hay una lata de galletas. Dentro, los duros que guardaba la abuela «por si acaso». (+15 duros)'); }
      else this.say('Guardián', 'Botes de tomate, legumbres, aceite de la almazara. Para un tiempo hay.');
      return;
    case 'cajon_cocina': this.say('Guardián', 'El cajón de todo: velas, pilas, gomas, llaves que no abren nada y el abridor de la abuela.'); return;
    case 'foto':
      this.say('Guardián', 'La foto de los dos en la Bolera, de chicos. ' + yo + ' a la izquierda, con el bañador mojado; ' + H + ' a la derecha, poniendo cuernos.',
        fam ? H + ' dice que él salía más guapo. No es verdad.' : 'No sé dónde está ' + H + '. Se fue a trabajar fuera unos días antes del Colapso y ya no supe más.');
      return;
    case 'calendario': {
      const d = (this.dayN || 0);
      this.say('Guardián', 'El calendario de la cocina sigue en el mes en que se fue la luz. Yo voy tachando los días a lápiz por detrás.', d ? 'Desde que me desperté, van ' + d + (d === 1 ? ' día.' : ' días.') : 'Hoy es el primer día que tacho desde que me desperté.');
      return;
    }
    case 'espejo': this.say('Guardián', 'En el espejo, un hombre con la barba ' + (oli ? 'castaña' : 'negra') + ' y siete años encima que no recuerda haber vivido.', yo + '. Eso sí lo sé.'); return;
    case 'vater': this.say('Guardián', 'Funciona. Después del fin del mundo, esto es lo que más se agradece.'); return;
    case 'bide': this.say('Guardián', 'El bidé. Ahora sirve para remojar los calcetines.'); return;
    case 'ducha':
      if (listo('ducha', 120)) { p.poison = 0; this.addFatigue && this.addFatigue(-20); Sound.play('pickup'); this.say('Guardián', 'Agua caliente de la placa solar. Se me va el barro, el cansancio y hasta el veneno. (Sin veneno, mucho menos cansado)'); }
      else this.say('Guardián', 'Ya me he duchado. El agua caliente no es infinita.');
      return;
    case 'botiquin':
      if (listo('botiquin', 300)) { p.hp = p.maxHp; p.poison = 0; Sound.play('pickup'); this.say('Guardián', 'Vendas, agua oxigenada, yodo y un antídoto viejo que todavía sirve. Me curo lo que llevo encima. (Vida al máximo)'); }
      else this.say('Guardián', 'Quedan pocas vendas. Mejor guardarlas para cuando haga falta de verdad.');
      return;
    case 'cama_hermano': this.say('Guardián', fam ? 'La cama de ' + H + '. Por fin deshecha. Ronca como un jabalí.' : 'La cama de mi hermano ' + H + ', con la colcha lila de mamá. Sigue hecha, como él la dejó.'); return;
    case 'cama_padres': this.say('Guardián', 'La cama de mis padres. No la he tocado en siete años. Ni pienso.'); return;
    case 'cama_rosa': this.say('Guardián', fam && oli ? 'La cama de Mario. Dice que es de princesa, pero que le da igual. Hay una espada de madera debajo de la almohada.' : 'La cama de invitados. Hace mucho que no viene nadie.'); return;
    case 'comoda':
      if (unaVez('comoda')) { this.addDuros && this.addDuros(6); this.say('Guardián', 'Calcetines, mantas y, al fondo del cajón, seis duros sueltos. (+6 duros)'); }
      else this.say('Guardián', 'Calcetines desparejados. El mismo misterio de siempre.');
      return;
    case 'comoda_madre': this.say('Guardián', 'La ropa de mi madre, doblada como ella la dejó. Huele todavía a jabón de sosa.'); return;
    case 'mesita_padres': this.say('Guardián', 'El flexo y las gafas de leer de mi padre, encima de un libro de Delibes con el marcapáginas a la mitad.'); return;
    case 'mesita_tuya':
      if (unaVez('rosario')) { p.maxFe += 10; p.fe = Math.min(p.maxFe, p.fe + 10); Sound.play('level'); this.say('Guardián', 'En el cajón de la mesita, el rosario de la abuela. Me lo guardo en el bolsillo. (Fe máxima +10)'); }
      else this.say('Guardián', 'La mesita de noche. Un vaso de agua y la linterna, por si acaso.');
      return;
    case 'mesita_rosa': this.say('Guardián', fam && oli ? 'Los dibujos de Mario: un jabalí, una cueva y tres personas de la mano.' : 'Una mesita vacía.'); return;
    case 'cubo': this.say('Guardián', 'La fregona y el cubo. El fin del mundo no ha acabado con el polvo.'); return;
    case 'toallas': this.say('Guardián', 'Toallas limpias, dobladas encima del baúl.'); return;
    case 'flexo': this.say('Guardián', 'El flexo enciende. Las placas dan para todo.'); return;
    case 'silla_pc': this.say('Guardián', 'La silla del ordenador. Gira, pero solo hacia la izquierda.'); return;
  }
  return _useC.call(this, pr);
};
