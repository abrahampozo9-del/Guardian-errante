// ====================================================================== Moneo, el de la guitarra, junto a la lumbre
// Moneo es un gitano del valle de toda la vida que, después del Colapso, se quedó en la hoguera de la plaza con
// su guitarra. Personaje del juego (no es ningún artista real). Toca junto a la chimenea del salón del cortijo. Cuando te acercas, la música del
// juego se vuelve guitarra flamenca (cadencia andaluza, rasgueos y palmas por bulerías) y salen notas.
// Habla de la inteligencia artificial y de respetar a cada cual como es.

// ---------------------------------------------------------------- el dibujo: de frente, con la guitarra, rasgueando
const _initQuestsCur = Art.initQuests;
Art.initQuests = function () {
  _initQuestsCur.call(this);
  const { r, p, ov, line, outline } = Px;
  const base = Art.makePerson(0xb47c54, 0x141010, 0xece6d8, 0x1a1a1e, 0x101012, { vest: 0x22202a, eyes: 0x2a1a10 });
  const frames = [];
  for (let f = 0; f < 4; f++) {
    const b = Px.copy(base[0][0]);
    // pelo rizado y algo de barba de tres días
    for (const [x, y] of [[4, 1], [6, 0], [9, 0], [12, 0], [15, 1], [3, 3], [16, 3], [5, 0], [14, 0]]) p(b, x, y, 0x141010);
    for (const [x, y] of [[6, 11], [8, 12], [11, 12], [13, 11]]) p(b, x, y, 0x5a4030);
    // la guitarra cruzada: caja abajo a la izquierda, mástil hacia arriba a la derecha
    ov(b, 7, 20, 4.4, 3.4, 0x2a1408); ov(b, 7, 20, 3.8, 2.8, 0xc07a34); ov(b, 6, 19.4, 1.6, 1.2, 0xe0a050); // caja y brillo
    ov(b, 8, 20, 1.2, 1.2, 0x1a0c06); // boca
    line(b, 9, 19, 17, 11, 0x5a3418); line(b, 10, 19, 17, 12, 0x3a2210); // mástil
    r(b, 16, 9, 3, 3, 0x2a1408); p(b, 16, 9, 0xd0c8b0); p(b, 18, 9, 0xd0c8b0); // clavijero
    // la mano izquierda en el mástil (cambia de acorde) y la derecha rasgueando sobre la boca
    const lh = [[15, 12], [14, 13], [15, 12], [13, 14]][f];
    r(b, lh[0], lh[1], 2, 2, 0xb47c54);
    const rh = [[7, 18], [8, 21], [7, 19], [8, 22]][f];
    r(b, rh[0], rh[1], 2, 2, 0xb47c54); p(b, rh[0] + 1, rh[1] + (f % 2 ? -1 : 2), 0xfff0c0); // la uña que roza las cuerdas
    outline(b, 0x0c0808);
    frames.push(b);
  }
  Art.people.cantaor = frames;
};

// ---------------------------------------------------------------- dónde está
const CUR = {};
CUR.place = function () {
  const w = G.worlds && G.worlds.casa_baja; if (!w || !Art.people.cantaor || w.npcs.some(n => n.key === 'cantaor')) return;
  const [x, y] = Q.free(w, 3, 9); // junto a la lumbre del salón
  const n = new Npc('Moneo', 'cantaor', null, Art.people.cantaor[0], null, x * 16 + 8, y * 16 + 13, 0);
  n.sprite = t => Art.people.cantaor[Math.floor(t * 5) % 4]; // rasguea sin parar
  w.npcs.push(n); CUR.npc = n;
};
const _bwCur = G.buildWorlds;
G.buildWorlds = function () { _bwCur.call(this); CUR.npc = null; CUR.place(); };
const _refCur = Q.refresh;
Q.refresh = function () { _refCur.call(Q); CUR.place(); };

// ---------------------------------------------------------------- lo que cuenta (Moneo)
CUR.lines = [
  ['Siéntate, primo, que la lumbre es de todos. Me llamo Moneo, gitano de aquí del valle de toda la vida. Cuando se apagó el mundo vi luz en tu cortijo, llamé con la guitarra a la espalda y aquí me quedé: el que tiene guitarra no está nunca solo.'],
  ['Antes del Colapso las máquinas ya escribían canciones. Muy apañás, todo hay que decirlo. Pero el duende no se programa, primo: pa\'l quejío hay que haber sufrío.'],
  ['Una inteligencia artificial es como un buen palmero: te lleva el compás, te ayuda, te aguanta la noche entera sin quejarse... pero el cante lo tienes que poner tú.'],
  ['Me contaron que en las ciudades la gente le preguntaba a la máquina hasta qué comer. Yo le pregunto a mi abuela. Bueno, le preguntaba. Ahora le pregunto a la guitarra, que contesta parecío.'],
  ['Al lado de esta lumbre cabe to\'l mundo: el gitano de derechas, el anarquista, y el que es las dos cosas a la vez, como yo, que no hay quien me entienda. Respeto, primo. A cada uno como es.', 'Lo que no se respeta no se puede cantar.'],
  ['Dicen que hasta este mundo que pisas lo ha dibujao una máquina. Pues mira: la máquina pondrá los colores, pero las historias las ha puesto uno de Pozo Alcón. Y eso se nota.'],
  ['¿Tú sabes lo que es una bulería? Doce tiempos y ninguno igual. Como los días aquí después del Colapso.'],
  ['El que piensa por ti no te quiere libre. Usa la cabeza, usa la máquina si quieres, pero que nadie te diga quién tienes que ser. Eso es ser anarquista y gitano a la vez, primo: no dejarte domar.'],
];
const _talkCur = G.talk;
G.talk = function (n) {
  if (n.key !== 'cantaor') return _talkCur.call(this, n);
  Sound.play('talk');
  const i = (this.curroN = (this.curroN || 0) + 1) - 1, L = CUR.lines[i % CUR.lines.length];
  this.sayAs(n, ...L);
  // escucharle descansa el alma: un poco de Fe y menos cansancio (una vez cada rato)
  if (this.clock - (this.curroT || -999) > 120) {
    this.curroT = this.clock;
    this.dlgEnd = () => { const p = this.player; p.fe = Math.min(p.maxFe, p.fe + 15); if (this.addFatigue) this.addFatigue(-6); this.toast('Escuchas un rato la guitarra junto a la lumbre. (+15 Fe, algo menos cansado)'); };
  }
};

// ---------------------------------------------------------------- la música y las notas
CUR.near = function () { const n = CUR.npc, p = G.player; return n && G.world && G.world.id === 'casa_baja' && p && Math.hypot(n.x - p.x, n.y - p.y) < 96; };
const _autoCur = G.autoMusic;
G.autoMusic = function (dt) {
  if (CUR.near() && !(this.boss && !this.boss.dead) && !this.world.monsters.some(x => !x.dead && x.aggro)) {
    if (Sound.wanted !== 'flamenco') { this.musicT = (this.musicT || 0) + dt; if (this.musicT > 0.6) { this.musicT = 0; Sound.music('flamenco'); } }
    return;
  }
  return _autoCur.call(this, dt);
};
const _updCur = G.updatePlay;
G.updatePlay = function (dt) {
  _updCur.call(this, dt);
  const n = CUR.npc;
  if (n && CUR.near() && this.st === ST.PLAY && this.rnd.next() < dt * 1.4) {
    const f = Fx.text(n.x + 4 + this.rnd.gauss() * 3, n.y - 30, this.rnd.next() < 0.5 ? '♪' : '♫', 0xf0d890); f.vy = -14; f.vx = this.rnd.gauss() * 4; this.fx.push(f);
  }
};

// guitarra flamenca sintetizada: cadencia andaluza (La m – Sol – Fa – Mi), rasgueos y palmas por bulerías
Sound._gens.flamenco = function (RATE) {
  const R = RNG(21), note = n => { const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; const pp = n.slice(0, -1), o = +n.slice(-1); return 440 * Math.pow(2, (12 * (o + 1) + names.indexOf(pp) - 69) / 12); };
  const beat = 0.2, compas = 12, comps = 4, out = new Float32Array(Math.floor(RATE * beat * compas * comps) + RATE * 2);
  const pluck = (start, f, amp, decay) => { const n = Math.max(2, Math.floor(RATE / f)), b = new Float32Array(n); for (let i = 0; i < n; i++) b[i] = (R.next() * 2 - 1) * amp; let idx = 0; const len = Math.min(out.length - start, Math.floor(RATE * 1.8)); for (let i = 0; i < len; i++) { const j = (idx + 1) % n; out[start + i] += b[idx]; b[idx] = decay * 0.5 * (b[idx] + b[j]); idx = j; } };
  const strum = (start, ch, amp, up) => { const order = up ? ch.slice().reverse() : ch; order.forEach((nt, k) => pluck(start + Math.floor(k * RATE * 0.012), note(nt), amp, 0.993)); };
  const clap = (start, amp) => { let lp = 0; const n = Math.floor(RATE * 0.06); for (let i = 0; i < n && start + i < out.length; i++) { lp += ((R.next() * 2 - 1) - lp) * 0.6; out[start + i] += lp * amp * Math.exp(-i / (RATE * 0.012)); } };
  const chords = [['A2', 'E3', 'A3', 'C4', 'E4'], ['G2', 'D3', 'G3', 'B3', 'D4'], ['F2', 'C3', 'F3', 'A3', 'C4'], ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4']];
  const acc = [3, 6, 8, 10, 12]; // los acentos de la bulería (12 tiempos)
  for (let c = 0; c < comps; c++) for (let k = 1; k <= compas; k++) {
    const pos = Math.floor(((c * compas) + k - 1) * beat * RATE), ch = chords[Math.min(3, Math.floor((k - 1) / 3))];
    const strong = acc.includes(k);
    strum(pos, ch, strong ? 0.32 : 0.16, k % 2 === 0);
    if (strong) { strum(pos + Math.floor(beat * RATE * 0.5), ch, 0.12, true); clap(pos, 0.5); } else if (k % 2) clap(pos, 0.18);
    if (k === 12 && c % 2 === 1) for (let q = 0; q < 4; q++) pluck(pos + Math.floor(q * beat * RATE * 0.25), note(['E4', 'F4', 'E4', 'D4'][q]), 0.25, 0.996); // un remate
  }
  const len = Math.floor(RATE * beat * compas * comps), loop = new Float32Array(len);
  loop.set(out.subarray(0, len)); for (let i = 0; i < out.length - len && i < len; i++) loop[i] += out[len + i];
  let m = 0; for (let i = 0; i < len; i++) m = Math.max(m, Math.abs(loop[i]));
  const g = 0.34 / Math.max(0.01, m); for (let i = 0; i < len; i++) loop[i] *= g;
  return loop;
};
