// ====================================================================== cinemáticas pixel art
// TEXTOS DE LAS CINEMÁTICAS: para cambiar el lore basta con editar CINE.
// Cada cinemática tiene un título opcional (rótulo de misión) y una lista de páginas
// { escena, texto }. Escenas disponibles: escrituras, anticristo, apagon, arrebato, colapso,
// batalla, valle, ribera, guardian, radio, iglesia, cruz, bolera, alba.
const CINE = {
  intro: {
    pages: [
      ['escrituras', 'El mundo colapsó hace siete años.\nResulta que todo lo que decía el libro del Apocalipsis era real.'],
      ['anticristo', 'El Anticristo nos engañó y se apoderó de la Tierra.\nLo nombraron señor del mundo...'],
      ['apagon', '...y después, todo se apagó.'],
      ['arrebato', 'Los más nobles y limpios de espíritu ascendieron al cielo.'],
      ['colapso', 'Los más pecadores se convirtieron en cosas horribles...\no bajaron directamente al infierno.'],
      ['batalla', 'Ahora se libra una batalla. Se escuchan ruidos increíbles.\nMe han llegado rumores de ángeles y demonios luchando.'],
      ['escrituras', 'Estudio las escrituras para saber en qué fase estamos.\nPero todo es demasiado críptico, y la realidad está siendo demasiado para mí.'],
      ['valle', 'Y yo estoy aquí, en mi cortijo junto al Guadalentín, a las afueras de Pozo Alcón.\nSolo.'],
      ['guardian', 'Ni lo suficientemente pecador...\nni lo suficientemente santo.'],
    ],
  },
  ribera: {
    title: 'La ribera',
    pages: [
      ['ribera', 'Cada noche suben del río. Cada mañana hay huellas nuevas junto a la poza.'],
      ['guardian', 'Hoy no va a esperar a que lleguen a la puerta.'],
    ],
  },
  supervivientes: {
    title: 'La voz de la radio',
    pages: [
      ['radio', 'Siete años creyendo que era el último. Pero la voz de la radio era real.'],
      ['iglesia', 'En la Iglesia de la Encarnación, tras las barricadas, alguien resiste.\nPozo Alcón está al oeste, cruzando el puente viejo.'],
    ],
  },
  cruz: {
    title: 'La Cruz de San Gregorio',
    pages: [
      ['cruz', 'Junto a la A-326, la vieja cruz de piedra aún guarda algo de la luz de antes.'],
      ['cruz', 'Las zarzas negras de La Linde le tienen miedo. Si alguien reza allí con fe, quizá se abran.'],
    ],
  },
  bolera: {
    title: 'La Bestia de La Bolera',
    pages: [
      ['bolera', 'Todo empezó en La Bolera. Bajo el embalse, en la cueva del nacimiento del Guadalentín, algo despertó.'],
      ['bolera', 'Desde entonces, el agua trae la muerte. Río arriba, hasta la presa.'],
    ],
  },
  final: {
    pages: [
      ['alba', 'Las semanas siguientes, el agua de La Bolera volvió a bajar limpia por el Guadalentín.'],
      ['iglesia', 'Los once supervivientes de la Encarnación salieron de detrás de las barricadas.\nDespués llegaron otros, desde Hinojares, desde Huesa, desde Fontanar.'],
      ['valle', 'En el cortijo del río, las placas siguen dando luz.\nEl gato duerme al sol, y el perrillo ya no ladra de noche.'],
      ['guardian', '«La calma también es una forma de lucha.\nPozo Alcón... siempre será mi lugar.»'],
      ['alba', 'EL GUARDIÁN ERRANTE\n\nGracias por jugar.'],
    ],
  },
};

ST.CINE = 'CINE';
const CW = 200, CH = 113; // las escenas se pintan a media resolución y se escalan ×2: píxel gordo
const cineC = document.createElement('canvas'); cineC.width = CW; cineC.height = CH;
const cg = cineC.getContext('2d');

G.playCine = function (id, onEnd) {
  const c = CINE[id];
  if (!c) { if (onEnd) onEnd(); return; }
  this.cine = { id, c, idx: c.title ? -1 : 0, t: 0, chars: 0, onEnd, back: this.st };
  this.st = ST.CINE;
};
G.endCine = function () {
  const k = this.cine; this.cine = null;
  this.st = ST.PLAY;
  if (k.onEnd) k.onEnd();
};
G.updateCine = function (dt) {
  const k = this.cine; if (!k) { this.st = ST.PLAY; return; }
  k.t += dt; this.clock += dt;
  if (k.idx >= 0) k.chars += dt * 34;
  if (this.pressed('Escape', 'Skip')) { this.endCine(); return; }
  const text = k.idx >= 0 ? k.c.pages[k.idx][1] : '';
  const auto = k.idx < 0 && k.t > 2.6;
  if (this.confirm() || auto) {
    if (k.idx >= 0 && k.chars < text.length) { k.chars = 999; return; }
    if (k.idx < 0 && k.t < 0.4) return;
    if (++k.idx >= k.c.pages.length) { this.endCine(); return; }
    // si la escena siguiente es la misma, no se reinicia la animación
    const same = k.idx > 0 && k.c.pages[k.idx][0] === k.c.pages[k.idx - 1][0];
    if (!same) k.t = 0;
    k.chars = 0;
  }
};

// ---------------------------------------------------------------- pintura de escenas
const C = {
  r(x, y, w, h, c) { cg.fillStyle = c; cg.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h)); },
  // cielo por bandas con tramado, como un degradado de 16 bits
  sky(cols, y0 = 0, y1 = CH) {
    const n = cols.length - 1, h = (y1 - y0) / n;
    for (let i = 0; i < n; i++) for (let y = 0; y < Math.ceil(h); y++) {
      const yy = y0 + i * h + y, f = y / h;
      for (let x = 0; x < CW; x += 1) {
        const dith = ((x + yy) % 2 === 0 ? 0.25 : 0) + ((x % 4 === 0 && yy % 2 === 1) ? 0.5 : 0);
        cg.fillStyle = f + dith * 0.35 > 0.75 ? cols[i + 1] : cols[i];
        cg.fillRect(x, Math.floor(yy), 1, 1);
      }
    }
  },
  stars(n, seed, t, a = 1) {
    const R = RNG(seed);
    for (let i = 0; i < n; i++) {
      const x = R.int(CW), y = R.int(60), tw = Math.sin(t * (1 + R.next() * 3) + i) > 0.6;
      C.r(x, y, 1, 1, tw ? `rgba(255,255,230,${a})` : `rgba(200,200,220,${0.5 * a})`);
    }
  },
  ridge(base, amp, fr, seed, col, rough = 1) {
    const R = RNG(seed), ph = R.next() * 10, ph2 = R.next() * 10;
    cg.fillStyle = col;
    for (let x = 0; x < CW; x++) {
      const y = base - amp * (0.6 * Math.sin(x * fr + ph) + 0.3 * Math.sin(x * fr * 2.7 + ph2) + 0.1 * rough * Math.sin(x * 0.9 + ph));
      cg.fillRect(x, Math.floor(y), 1, CH - Math.floor(y));
    }
  },
  ridgeY(base, amp, fr, seed, x) {
    const R = RNG(seed), ph = R.next() * 10, ph2 = R.next() * 10;
    return base - amp * (0.6 * Math.sin(x * fr + ph) + 0.3 * Math.sin(x * fr * 2.7 + ph2) + 0.1 * Math.sin(x * 0.9 + ph));
  },
  dots(n, seed, x0, y0, w, h, col, s = 2) { const R = RNG(seed); for (let i = 0; i < n; i++) C.r(x0 + R.int(w), y0 + R.int(h), s, s - 1 || 1, col); },
  poplar(x, y, h, c1, c2) {
    C.r(x, y - 3, 1, 3, '#3a2a1c');
    for (let j = 0; j < h; j++) { const w = Math.max(1, Math.round(Math.sin((j / h) * Math.PI) * 3.2)); C.r(x - w + 1, y - 3 - j, w * 2 - 1, 1, j % 3 === 0 ? c2 : c1); }
  },
  olive(x, y, c) { C.r(x, y - 1, 1, 2, '#3a2a1c'); C.r(x - 2, y - 3, 5, 2, c); C.r(x - 1, y - 4, 3, 1, c); },
  house(x, y, w, h, wall, roof, lit) {
    C.r(x, y - h, w, h, wall); C.r(x - 1, y - h - 2, w + 2, 2, roof);
    for (let i = 2; i < w - 1; i += 3) C.r(x + i, y - h + 2, 1, 2, lit ? lit : '#30302c');
  },
  tower(x, y, h, wall, lit) {
    C.r(x, y - h, 6, h, wall); C.r(x + 1, y - h - 3, 4, 3, wall); C.r(x + 2, y - h - 6, 2, 3, wall); C.r(x + 2, y - h + 2, 2, 3, lit || '#222');
  },
  // el Guardián de silueta: capa, tabardo blanco con cruz roja, espada
  hero(x, y, s, t, opts = {}) {
    const k = s, wind = Math.sin(t * 3) * 1.5;
    const P = (dx, dy, w, h, c) => C.r(x + dx * k, y + dy * k, w * k, h * k, c);
    // capa al viento
    cg.fillStyle = opts.cloak || '#2b2420';
    cg.beginPath(); cg.moveTo(x - 3 * k, y - 15 * k); cg.lineTo(x + 3 * k, y - 15 * k);
    cg.lineTo(x + (5 + wind) * k, y); cg.lineTo(x - (8 + wind * 1.6) * k, y + k); cg.closePath(); cg.fill();
    P(-2, -14, 4, 9, opts.tabard || '#e8e2d2');  // tabardo
    P(-0.5, -13, 1, 6, '#b02a20'); P(-2, -11, 4, 1, '#b02a20'); // cruz roja
    P(-2, -5, 1.5, 5, '#3a3028'); P(0.5, -5, 1.5, 5, '#3a3028'); // piernas
    P(-1.5, -18, 3, 4, opts.skin || '#c89870'); P(-1.5, -16, 3, 2, '#3a2a1e'); P(-1.5, -19, 3, 1.5, '#2a1e16'); // cabeza y barba
    // espada en alto o al costado
    if (opts.raise) { P(2, -16, 1, 2, '#3a3028'); cg.fillStyle = '#e0e4ea'; cg.fillRect(Math.floor(x + 2.2 * k), Math.floor(y - 30 * k), Math.max(1, k * 0.8), 14 * k); P(1, -16.5, 3, 0.8, '#c8a040'); }
    else { P(2.5, -9, 1, 1, '#c8a040'); cg.fillStyle = '#d0d4da'; cg.fillRect(Math.floor(x + 2.8 * k), Math.floor(y - 9 * k), Math.max(1, k * 0.7), 9 * k); }
  },
  // el Guardián grande para las cinemáticas: capa, cota de malla, tabardo con cruz, barba y espada al rojo
  knight(x, y, t) {
    const wind = Math.sin(t * 1.6) * 2;
    // capa
    cg.fillStyle = '#1a2230';
    cg.beginPath(); cg.moveTo(x - 7, y - 40); cg.lineTo(x + 6, y - 40); cg.quadraticCurveTo(x + 14, y - 18, x + 12 + wind, y); cg.lineTo(x - 22 - wind * 2, y + 1); cg.quadraticCurveTo(x - 16, y - 20, x - 7, y - 40); cg.fill();
    cg.strokeStyle = '#2a3648'; cg.lineWidth = 1; for (const dx of [-12, -5, 3]) { cg.beginPath(); cg.moveTo(x + dx * 0.4, y - 34); cg.quadraticCurveTo(x + dx, y - 16, x + dx * 1.4 - wind, y); cg.stroke(); }
    cg.fillStyle = '#0e141e'; cg.beginPath(); cg.moveTo(x - 20 - wind * 2, y + 1); cg.lineTo(x - 14, y - 6); cg.lineTo(x - 10, y + 1); cg.fill();
    // piernas y botas
    C.r(x - 5, y - 14, 4, 12, '#3a3a40'); C.r(x + 1, y - 14, 4, 12, '#34343a'); C.r(x - 6, y - 3, 5, 3, '#1e1610'); C.r(x + 1, y - 3, 5, 3, '#1e1610');
    // cota de malla (tramada) y tabardo
    for (let yy = y - 34; yy < y - 14; yy++) for (let xx = x - 7; xx < x + 7; xx++) C.r(xx, yy, 1, 1, (xx + yy) % 2 ? '#5a626c' : '#3e444c');
    C.r(x - 4, y - 33, 8, 22, '#d8d2c2'); C.r(x - 4, y - 33, 1, 22, '#f0ead8'); C.r(x + 3, y - 33, 1, 22, '#a8a292');
    C.r(x - 1, y - 30, 2, 12, '#a8261c'); C.r(x - 3.5, y - 26, 7, 2, '#a8261c'); C.r(x - 1, y - 30, 1, 12, '#c83a2a');
    C.r(x - 7, y - 17, 14, 2, '#4a2e1a'); C.r(x - 1, y - 17, 2, 2, '#c8a040');
    // hombreras
    C.r(x - 9, y - 35, 5, 4, '#6a727c'); C.r(x + 4, y - 35, 5, 4, '#5a626c'); C.r(x - 9, y - 35, 5, 1, '#9aa2ac');
    // cabeza: pelo, barba y cara en penumbra
    C.r(x - 4, y - 46, 8, 8, '#b88a64'); C.r(x - 4, y - 46, 3, 8, '#8a6446');
    C.r(x - 5, y - 48, 10, 4, '#2a1d16'); C.r(x - 5, y - 46, 2, 6, '#2a1d16');
    C.r(x - 4, y - 41, 8, 6, '#2a1d16'); C.r(x - 2, y - 36, 5, 2, '#2a1d16');
    C.r(x + 1, y - 44, 2, 1, '#e8e0c8');
    // brazo y espada al rojo, apuntando al suelo
    C.r(x + 6, y - 32, 4, 12, '#4a525c'); C.r(x + 7, y - 21, 4, 3, '#b88a64');
    C.r(x + 5, y - 20, 8, 2, '#c8a040'); C.r(x + 8, y - 24, 2, 4, '#5a3a20');
    for (let i = 0; i < 26; i++) { const k = i / 26, bx = x + 9 + i * 0.75, by = y - 18 + i * 0.85; const c = k < 0.3 ? '#d8dce4' : k < 0.6 ? '#ffb060' : '#ff6a20'; C.r(bx, by, 2, 2, c); }
    C.glow(x + 22, y + 2, 16, 'rgba(255,110,30,0.55)');
  },
  rain(t, n, a, slant = 0.4) {
    const R = RNG(77); cg.fillStyle = `rgba(200,210,220,${a})`;
    for (let i = 0; i < n; i++) {
      const sp = 120 + R.next() * 80, x0 = R.next() * (CW + 60), y0 = R.next() * CH;
      const y = (y0 + t * sp) % (CH + 10) - 5, x = ((x0 - (t * sp) * slant) % (CW + 60) + CW + 60) % (CW + 60) - 30;
      for (let j = 0; j < 4; j++) cg.fillRect(Math.floor(x + j * slant), Math.floor(y - j), 1, 1);
    }
  },
  water(y0, y1, base, hi, t) {
    C.r(0, y0, CW, y1 - y0, base);
    const R = RNG(9);
    for (let i = 0; i < 40; i++) { const y = y0 + R.int(y1 - y0), x = (R.int(CW) + t * (6 + R.next() * 8)) % CW; C.r(x, y, 3 + R.int(5), 1, hi); }
  },
  // refleja en el agua (desde y0 hacia abajo) la franja de encima, con ondulación y tinte
  reflect(y0, h, t, tint) {
    const src = cg.getImageData(0, Math.max(0, y0 - h), CW, h);
    const tmp = document.createElement('canvas'); tmp.width = CW; tmp.height = h; tmp.getContext('2d').putImageData(src, 0, 0);
    for (let i = 0; i < h && y0 + i < CH; i++) { const off = Math.round(Math.sin(i * 0.9 + t * 3) * (0.5 + i * 0.05)); cg.drawImage(tmp, 0, h - 1 - i, CW, 1, off, y0 + i, CW, 1); }
    cg.fillStyle = tint; cg.fillRect(0, y0, CW, Math.min(h, CH - y0));
    for (let i = 0; i < 18; i++) { const y = y0 + 2 + ((i * 7) % h), x = ((i * 53 + t * 8) % (CW + 20)) - 10; C.r(x, y, 6 + (i % 4) * 3, 1, 'rgba(255,255,255,0.18)'); }
  },
  glow(x, y, r, col) { const g = cg.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); cg.fillStyle = g; cg.fillRect(x - r, y - r, r * 2, r * 2); },
  creature(x, y, s, t, i) {
    const b = Math.sin(t * 2 + i) * 0.6;
    cg.fillStyle = '#0c0a0a';
    cg.beginPath(); cg.ellipse(x, y - 5 * s + b, 3.5 * s, 5 * s, 0, 0, Math.PI * 2); cg.fill();
    C.r(x - 4.5 * s, y - 7 * s + b, s, 7 * s, '#0c0a0a'); C.r(x + 3.5 * s, y - 7 * s + b, s, 7 * s, '#0c0a0a');
    C.r(x - 1.5 * s, y - 8 * s + b, s, s, '#ff3020'); C.r(x + 0.5 * s, y - 8 * s + b, s, s, '#ff3020');
  },
  town(base, wall, roof, litFn) {
    const R = RNG(31); let x = 18;
    while (x < 150) {
      const w = 7 + R.int(8), h = 6 + R.int(7), yy = base - Math.floor(Math.sin((x - 18) / 132 * Math.PI) * 12);
      C.house(x, yy, w, h, wall, roof, litFn ? litFn(x) : null);
      x += w - 1;
      if (x > 74 && x < 84) { C.tower(80, yy - 2, 22, wall, litFn ? litFn(80) : null); x = 88; }
    }
  },
};

const SCENES = {
  escrituras(t) {
    // de noche, a la luz de una vela, las escrituras abiertas sobre la mesa
    C.r(0, 0, CW, CH, '#120c08');
    C.r(122, 10, 44, 36, '#1a0a0a'); C.sky(['#1a0606', '#3a0e08', '#5a1a0c'], 10, 46); C.r(0, 0, 122, 46, '#120c08'); C.r(166, 0, 34, 46, '#120c08');
    C.stars(6, 90, t, 0.4); C.r(122, 26, 44, 2, '#2a1c12'); C.r(143, 10, 2, 36, '#2a1c12'); C.r(120, 8, 48, 2, '#3a2818'); C.r(120, 46, 48, 2, '#3a2818');
    C.r(60, 14, 2, 12, '#5a4a38'); C.r(56, 18, 10, 2, '#5a4a38'); // crucifijo en la pared
    const fl = Math.sin(t * 13) * 0.6 + Math.sin(t * 7) * 0.4;
    cg.save(); cg.translate(0, -16);
    C.glow(70, 64, 70 + fl * 3, 'rgba(255,170,70,0.32)');
    C.r(0, 78, CW, 52, '#3a2618'); C.r(0, 78, CW, 2, '#5a3c24');
    // libro abierto
    cg.fillStyle = '#d8c8a0'; cg.beginPath(); cg.moveTo(78, 84); cg.lineTo(100, 82); cg.lineTo(100, 98); cg.lineTo(76, 100); cg.fill();
    cg.fillStyle = '#e6d8b4'; cg.beginPath(); cg.moveTo(100, 82); cg.lineTo(124, 84); cg.lineTo(126, 100); cg.lineTo(100, 98); cg.fill();
    C.r(99, 82, 2, 17, '#a89070');
    for (let i = 0; i < 6; i++) { C.r(80, 86 + i * 2, 17, 1, 'rgba(60,40,30,0.55)'); C.r(103, 86 + i * 2, 19 - (i === 5 ? 8 : 0), 1, 'rgba(60,40,30,0.55)'); }
    C.r(104, 86, 3, 3, '#a02018'); // letra capitular
    // vela
    C.r(66, 70, 5, 12, '#e8dcc0'); C.r(64, 81, 9, 2, '#8a6a40');
    cg.fillStyle = '#ffb040'; cg.beginPath(); cg.moveTo(66.5, 70); cg.lineTo(68.5 + fl, 63); cg.lineTo(70.5, 70); cg.fill();
    C.r(68, 66, 1, 3, '#fff0b0');
    cg.restore();
    C.r(0, 0, CW, CH, `rgba(0,0,0,${0.08 + 0.05 * fl})`);
  },
  anticristo(t) {
    C.sky(['#1a0c06', '#4a2008', '#8a4a10', '#c8902a']);
    // falso sol: un aro dorado enfermizo
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.3);
    C.glow(100, 34, 50, `rgba(255,220,120,${0.35 + 0.15 * pulse})`);
    cg.strokeStyle = '#ffe28a'; cg.lineWidth = 2; cg.beginPath(); cg.arc(100, 34, 16 + pulse, 0, Math.PI * 2); cg.stroke();
    C.ridge(78, 8, 0.03, 91, '#2a1408');
    // tribuna y figura con los brazos abiertos
    C.r(78, 62, 44, 22, '#140a06'); C.r(74, 60, 52, 3, '#2a160a');
    for (let i = 0; i < 4; i++) { C.r(84 + i * 10, 64, 2, 18, '#241208'); }
    const arm = Math.sin(t * 0.8) * 2;
    C.r(97, 40, 6, 20, '#0a0504'); C.r(98, 35, 4, 5, '#0a0504');
    cg.fillStyle = '#0a0504'; cg.beginPath(); cg.moveTo(97, 44); cg.lineTo(84, 34 - arm); cg.lineTo(85, 32 - arm); cg.lineTo(98, 41); cg.fill();
    cg.beginPath(); cg.moveTo(103, 44); cg.lineTo(116, 34 - arm); cg.lineTo(115, 32 - arm); cg.lineTo(102, 41); cg.fill();
    C.r(99, 37, 1, 1, '#ffcc40'); C.r(101, 37, 1, 1, '#ffcc40');
    // estandartes con un ojo
    for (const x of [40, 160]) { C.r(x, 20, 1, 60, '#3a2010'); C.r(x + 1, 22, 16, 26, '#6a1a10'); cg.fillStyle = '#e8c060'; cg.beginPath(); cg.ellipse(x + 9, 33, 5, 3, 0, 0, Math.PI * 2); cg.fill(); C.r(x + 8, 32, 2, 2, '#1a0806'); }
    // multitud
    const R = RNG(92);
    for (let i = 0; i < 70; i++) { const x = R.int(CW), y = 88 + R.int(22), h = 4 + R.int(4), sw = Math.sin(t * 2 + i) > 0.7 ? 1 : 0; C.r(x, y - h - sw, 3, h + 6, '#0c0604'); C.r(x, y - h - 3 - sw, 3, 3, '#0c0604'); if (i % 5 === 0) C.r(x + 1, y - h - 6 - sw, 1, 3, '#0c0604'); }
  },
  arrebato(t) {
    C.sky(['#050814', '#0c1430', '#18224a', '#202a40']);
    C.stars(50, 101, t, 0.8);
    C.ridge(86, 8, 0.03, 102, '#0c1018');
    C.town(92, '#141826', '#0e1018', null);
    C.r(0, 96, CW, 17, '#080a10');
    // columnas de luz y almas que suben
    cg.save(); cg.globalCompositeOperation = 'lighter';
    for (const [x, w] of [[44, 10], [100, 14], [156, 9]]) {
      const g2 = cg.createLinearGradient(0, 0, 0, CH); g2.addColorStop(0, 'rgba(255,250,220,0.5)'); g2.addColorStop(1, 'rgba(255,240,200,0.08)');
      cg.fillStyle = g2; cg.fillRect(x - w / 2, 0, w, 100);
      C.glow(x, 0, 30, 'rgba(255,250,230,0.5)');
      for (let i = 0; i < 4; i++) { const y = 100 - ((t * 14 + i * 26 + x) % 104); C.r(x - 1, y, 2, 4, 'rgba(255,255,240,0.9)'); C.r(x - 1, y - 2, 2, 2, 'rgba(255,255,240,0.9)'); }
    }
    cg.restore();
  },
  batalla(t) {
    C.sky(['#08060a', '#1c0e14', '#3a1414', '#5a2010']);
    // nubes revueltas
    for (let i = 0; i < 8; i++) { const x = (i * 33 + t * 6) % (CW + 60) - 30; C.glow(x, 30 + (i % 3) * 10, 30, 'rgba(10,6,8,0.7)'); }
    const R = RNG(111);
    // ángeles (luz blanca) y demonios (rojo oscuro, cuernos) chocando
    const angel = (x, y, s, f) => {
      C.glow(x, y, 12 * s, 'rgba(255,250,220,0.5)');
      cg.fillStyle = '#fffbe8'; const wf = Math.sin(t * 8 + f) * 3 * s;
      cg.beginPath(); cg.moveTo(x, y); cg.lineTo(x - 10 * s, y - 6 * s - wf); cg.lineTo(x - 7 * s, y + 2 * s); cg.fill();
      cg.beginPath(); cg.moveTo(x, y); cg.lineTo(x + 10 * s, y - 6 * s - wf); cg.lineTo(x + 7 * s, y + 2 * s); cg.fill();
      C.r(x - 1 * s, y - 2 * s, 2 * s, 7 * s, '#f0e8d0'); C.r(x - 1 * s, y - 4 * s, 2 * s, 2 * s, '#f8f0e0');
      C.r(x + 2 * s, y - 6 * s, 1, 12 * s, '#ffe080'); // lanza
    };
    const demon = (x, y, s, f) => {
      C.glow(x, y, 13 * s, 'rgba(200,40,10,0.45)');
      cg.fillStyle = '#1a0404'; const wf = Math.sin(t * 7 + f) * 3 * s;
      cg.beginPath(); cg.moveTo(x, y); cg.lineTo(x - 11 * s, y - 4 * s - wf); cg.lineTo(x - 8 * s, y + 1 * s); cg.lineTo(x - 5 * s, y - 1 * s); cg.fill();
      cg.beginPath(); cg.moveTo(x, y); cg.lineTo(x + 11 * s, y - 4 * s - wf); cg.lineTo(x + 8 * s, y + 1 * s); cg.lineTo(x + 5 * s, y - 1 * s); cg.fill();
      C.r(x - 1.5 * s, y - 2 * s, 3 * s, 8 * s, '#2a0606'); C.r(x - 1.5 * s, y - 4 * s, 3 * s, 2 * s, '#2a0606');
      C.r(x - 2 * s, y - 6 * s, 1, 2 * s, '#2a0606'); C.r(x + 1.5 * s, y - 6 * s, 1, 2 * s, '#2a0606');
      C.r(x - 1 * s, y - 3.5 * s, 1, 1, '#ff3010'); C.r(x + 0.5 * s, y - 3.5 * s, 1, 1, '#ff3010');
    };
    for (let i = 0; i < 5; i++) {
      const bx = 20 + i * 40 + Math.sin(t * 0.7 + i) * 6, by = 22 + (i % 2) * 18 + Math.cos(t + i * 2) * 4, s = i === 2 ? 1.6 : 1;
      angel(bx - 7 * s, by, s, i); demon(bx + 7 * s, by + 3, s, i + 3);
      if (Math.sin(t * 5 + i * 1.7) > 0.85) { C.glow(bx, by, 14, 'rgba(255,200,120,0.6)'); }
    }
    // rastros de fuego cayendo
    for (let i = 0; i < 5; i++) { const ph = (t * 0.5 + i * 0.21) % 1, x = 10 + R.int(180) + ph * 20, y = ph * 90; C.r(x, y, 2, 2, '#ffb040'); C.r(x - 2, y - 3, 2, 2, 'rgba(255,120,40,0.6)'); C.r(x - 4, y - 6, 2, 2, 'rgba(255,80,20,0.3)'); }
    // el pueblo, abajo
    C.ridge(92, 6, 0.04, 112, '#0a0606');
    C.town(98, '#120808', '#0a0404', x => Math.sin(x * 3 + t * 4) > 0.6 ? '#ff7a20' : '#1a0806');
    C.r(0, 100, CW, 13, '#060404');
    const fl = t % 4.2; if (fl > 3.0 && fl < 3.15) C.r(0, 0, CW, CH, 'rgba(255,240,220,0.3)');
  },
  apagon(t) {
    C.sky(['#06081a', '#0c1230', '#1a2244', '#2a2c48']);
    C.stars(60, 3, t, Math.min(1, t / 3));
    C.ridge(84, 6, 0.03, 5, '#121628');
    // las luces del pueblo se apagan una a una
    C.town(86, '#3a4058', '#24283c', x => (Math.sin(x * 12.9) * 0.5 + 0.5) * 6 + 0.8 > t ? '#ffd870' : '#141826');
    C.ridge(100, 4, 0.05, 6, '#0a0c16');
    C.dots(30, 8, 0, 96, CW, 14, '#151a24', 3);
    if (t > 6.2) C.r(0, 0, CW, CH, `rgba(0,0,0,${Math.min(0.5, (t - 6.2) * 0.2)})`);
  },
  colapso(t) {
    C.sky(['#1a0606', '#4a1008', '#9a2a10', '#d85a20']);
    for (let i = 0; i < 6; i++) { const x = (i * 40 + t * 4) % (CW + 40) - 20; C.glow(x, 20 + (i % 3) * 8, 26, 'rgba(20,10,8,0.6)'); }
    C.ridge(70, 6, 0.04, 12, '#2a0c08');
    C.town(74, '#1a0a08', '#120606', x => Math.sin(x * 7 + t * 9) > 0.3 ? '#ff8a20' : '#3a1006');
    for (let i = 0; i < 5; i++) C.glow(30 + i * 30, 66, 10 + Math.sin(t * 6 + i) * 2, 'rgba(255,120,30,0.35)');
    C.water(80, 92, '#1a0a0a', '#7a2a14', t);
    C.ridge(100, 3, 0.07, 13, '#0a0606');
    for (let i = 0; i < 7; i++) { const rise = Math.min(1, Math.max(0, t * 0.5 - i * 0.25)); C.creature(18 + i * 27, 104 - rise * 10 + (i % 2) * 4, 1.4, t, i); }
  },
  valle(t, dusk) {
    const sk = dusk ? ['#1a1830', '#5a3048', '#c06040', '#f0a050'] : ['#7aa8d8', '#a8c8e0', '#e8d8b8', '#f4e0b0'];
    C.sky(sk);
    C.glow(dusk ? 170 : 160, dusk ? 60 : 30, 30, dusk ? 'rgba(255,160,80,0.5)' : 'rgba(255,250,210,0.6)');
    C.r(dusk ? 166 : 156, dusk ? 56 : 26, 8, 8, dusk ? '#ffb070' : '#fff6d8');
    C.ridge(52, 8, 0.02, 21, dusk ? '#4a3a58' : '#8a9ab0');
    C.ridge(62, 9, 0.03, 22, dusk ? '#3a3040' : '#8a8a60');
    // laderas con olivos y almendros
    C.ridge(72, 7, 0.035, 23, dusk ? '#2c2a24' : '#9a9050');
    for (let x = 4; x < CW; x += 7) { const y = C.ridgeY(72, 7, 0.035, 23, x) + 4 + (x % 3) * 3; C.olive(x, y, dusk ? '#1c2418' : '#4a6030'); }
    C.r(0, 82, CW, 31, dusk ? '#242a18' : '#6a8a38'); // fondo del valle, hierba
    C.dots(70, 24, 0, 82, CW, 30, dusk ? '#1a2010' : '#5a7a30', 2);
    // río turquesa con chopos
    cg.fillStyle = dusk ? '#2a4048' : '#3ab0b0';
    for (let y = 84; y < CH; y++) { const cx = 60 + Math.sin(y * 0.12) * 10 + (y - 84) * 0.8; cg.fillRect(Math.floor(cx), y, 10 + (y - 84) * 0.5, 1); }
    for (let i = 0; i < 12; i++) { const y = 86 + i * 2.5, cx = 60 + Math.sin(y * 0.12) * 10 + (y - 84) * 0.8; C.r(cx + 2 + ((t * 8 + i * 5) % 6), y, 2, 1, dusk ? '#5a7078' : '#a8f0e8'); }
    for (let i = 0; i < 6; i++) C.poplar(52 + i * 3 + (i % 2) * 22, 92 + (i * 3) % 9, 16 + (i % 3) * 3, dusk ? '#1a2a14' : '#4a7a28', dusk ? '#243418' : '#6a9a38');
    // el cortijo: casa blanca, tejas, placas solares, humo
    C.house(118, 92, 26, 11, dusk ? '#9a9088' : '#f0ece0', dusk ? '#5a2a1a' : '#b04a28', dusk ? '#ffd070' : null);
    C.r(121, 79, 12, 1, '#20304a'); C.r(122, 78, 10, 1, '#3a5a8a');
    C.house(147, 92, 10, 7, dusk ? '#8a8078' : '#e4e0d4', dusk ? '#4a2418' : '#a04424');
    for (let i = 0; i < 5; i++) { const ph = (t * 0.6 + i * 0.2) % 1; C.r(140 + Math.sin(ph * 6 + i) * 2, 78 - ph * 20, 2, 2, `rgba(200,200,200,${0.5 * (1 - ph)})`); }
    C.r(138, 79, 2, 4, '#7a6a5a');
  },
  ribera(t) {
    SCENES.valle(t, true);
    for (let i = 0; i < 4; i++) { const rise = Math.min(1, Math.max(0, t * 0.4 - i * 0.3)); C.creature(64 + i * 8 + (i % 2) * 6, 108 - rise * 6, 1, t, i); }
    C.hero(150, 108, 1, t);
  },
  guardian(t) {
    // el caballero bajo la luna (ref.: luna enorme, árboles muertos, ruinas, espada al rojo, brasas)
    C.sky(['#0a1018', '#142230', '#22384a', '#3a5464']);
    C.glow(118, 30, 70, 'rgba(220,240,230,0.35)');
    cg.fillStyle = '#e8f0d8'; cg.beginPath(); cg.arc(118, 30, 19, 0, Math.PI * 2); cg.fill();
    cg.fillStyle = 'rgba(190,210,190,0.45)'; for (const [x, y, rr] of [[112, 24, 4], [124, 34, 3], [116, 38, 2], [126, 22, 2]]) { cg.beginPath(); cg.arc(x, y, rr, 0, Math.PI * 2); cg.fill(); }
    for (let i = 0; i < 4; i++) { const y = 26 + i * 6, x = ((i * 50 + t * (3 + i)) % 260) - 40; C.r(x, y, 46 - i * 6, 2, 'rgba(20,34,46,0.85)'); C.r(x + 6, y - 1, 26, 1, 'rgba(20,34,46,0.7)'); }
    C.ridge(70, 8, 0.035, 131, '#1a2a36');
    // ruinas
    for (const [x, w, h] of [[22, 12, 34], [36, 7, 22], [150, 14, 38], [168, 8, 26], [182, 10, 18]]) { C.r(x, 84 - h, w, h, '#16222c'); for (let yy = 84 - h; yy < 84; yy += 4) C.r(x + ((yy / 4) % 2) * 3, yy, 3, 1, '#1e2e3a'); C.r(x, 84 - h, w, 1, '#2a3e4c'); }
    // árboles muertos a los lados
    const tree = (x, y, h, dir) => { cg.strokeStyle = '#0a1016'; cg.lineCap = 'round'; const br = (x0, y0, a, len, w, d) => { if (d > 5 || len < 2) return; const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; cg.lineWidth = w; cg.beginPath(); cg.moveTo(x0, y0); cg.lineTo(x1, y1); cg.stroke(); br(x1, y1, a - 0.45 * dir, len * 0.72, w * 0.65, d + 1); br(x1, y1, a + 0.35 * dir, len * 0.6, w * 0.6, d + 1); }; br(x, y, -Math.PI / 2 + 0.1 * dir, h, 3.2, 0); };
    tree(10, 100, 26, 1); tree(192, 100, 30, -1); tree(176, 104, 18, 1);
    // suelo empedrado con brasas
    C.r(0, 84, CW, 29, '#121a20');
    const R = RNG(140);
    for (let i = 0; i < 70; i++) { const x = R.int(CW), y = 86 + R.int(26), w = 4 + R.int(6); C.r(x, y, w, 2, i % 3 ? '#1c2830' : '#24343e'); C.r(x, y, w, 1, '#2e424e'); }
    for (let i = 0; i < 16; i++) { const x = 70 + R.int(80), y = 92 + R.int(18), on = Math.sin(t * 3 + i) > 0; C.r(x, y, 3, 1, on ? '#c84a1a' : '#7a2a10'); if (on) C.glow(x + 1, y, 5, 'rgba(255,110,40,0.35)'); }
    // velas
    for (const [x, y] of [[44, 100], [160, 104]]) { const f = Math.sin(t * 11 + x) * 0.6; C.r(x, y - 8, 3, 8, '#d8c8a0'); C.glow(x + 1.5, y - 11, 14, 'rgba(255,170,60,0.55)'); cg.fillStyle = '#ffd060'; cg.beginPath(); cg.moveTo(x, y - 8); cg.lineTo(x + 1.5 + f, y - 13); cg.lineTo(x + 3, y - 8); cg.fill(); }
    C.knight(100, 95, t);
    // brasas que suben
    for (let i = 0; i < 26; i++) { const ph = (t * 0.25 + i * 0.137) % 1, x = 80 + ((i * 37) % 70) + Math.sin(t * 2 + i) * 4, y = 104 - ph * 90; C.r(x, y, 1, 1, `rgba(255,${120 + (i % 3) * 40},40,${1 - ph})`); }
  },
  tormenta(t) {
    // el cielo del cuadro: verde-negro, ascuas rojas a la izquierda, un haz a la derecha
    C.sky(['#0c100e', '#1a2420', '#2a302a', '#3a3428']);
    C.glow(20, 74, 70, 'rgba(200,60,24,0.45)');
    const beam = 0.4 + 0.2 * Math.sin(t * 0.8);
    cg.save(); cg.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { cg.fillStyle = `rgba(255,236,190,${0.08 * beam})`; cg.beginPath(); cg.moveTo(150 + i * 14, 0); cg.lineTo(166 + i * 16, 0); cg.lineTo(110 + i * 10, CH); cg.lineTo(86 + i * 10, CH); cg.fill(); }
    C.glow(170, 6, 40, `rgba(255,240,210,${0.5 * beam})`);
    cg.restore();
    C.ridge(78, 10, 0.03, 41, '#161a16');
    C.ridge(92, 6, 0.05, 42, '#0e100e');
    // peñasco y el Guardián en lo alto
    cg.fillStyle = '#0a0b09'; cg.beginPath(); cg.moveTo(40, CH); cg.lineTo(70, 86); cg.lineTo(98, 82); cg.lineTo(118, 90); cg.lineTo(150, CH); cg.fill();
    C.hero(86, 84, 2, t, { raise: t > 1.2 });
    C.rain(t, 140, 0.45, 0.45);
    // rayo
    const fl = (t % 5.5);
    if (fl > 2.0 && fl < 2.25) { C.r(0, 0, CW, CH, 'rgba(230,236,255,0.35)'); cg.strokeStyle = '#fff'; cg.lineWidth = 1; cg.beginPath(); cg.moveTo(40, 0); cg.lineTo(34, 14); cg.lineTo(42, 22); cg.lineTo(36, 40); cg.lineTo(44, 52); cg.stroke(); }
  },
  radio(t) {
    C.r(0, 0, CW, CH, '#1a1410');
    C.r(20, 10, 46, 34, '#0a0c1a'); C.stars(10, 40, t); C.r(20, 10, 46, 34, 'rgba(10,12,26,0.6)');
    C.r(20, 26, 46, 2, '#3a2a1c'); C.r(42, 10, 2, 34, '#3a2a1c'); C.r(18, 8, 50, 2, '#4a3a28'); C.r(18, 44, 50, 2, '#4a3a28');
    C.r(0, 76, CW, 37, '#3a2a1c'); C.r(0, 76, CW, 2, '#5a4430'); // mesa
    C.glow(130, 60, 60, 'rgba(255,170,80,0.18)');
    // la radio
    C.r(100, 50, 60, 28, '#6a5a44'); C.r(100, 50, 60, 2, '#8a7458'); C.r(104, 54, 26, 20, '#2a2218');
    for (let y = 56; y < 72; y += 2) C.r(105, y, 24, 1, '#4a3a2a');
    C.r(136, 56, 20, 6, '#c8b888'); C.r(138 + (t * 6 % 16), 56, 1, 6, '#b02020');
    C.r(138, 66, 5, 5, '#3a3028'); C.r(148, 66, 5, 5, '#3a3028');
    C.r(156, 52, 2, 2, Math.sin(t * 8) > 0 ? '#ff3020' : '#501010');
    C.r(152, 30, 1, 20, '#8a8a8a');
    // ondas
    for (let i = 0; i < 3; i++) { const r = ((t * 14 + i * 9) % 28) + 4; cg.strokeStyle = `rgba(255,220,140,${0.5 * (1 - r / 32)})`; cg.beginPath(); cg.arc(153, 30, r, -2.4, -0.7); cg.stroke(); }
  },
  iglesia(t) {
    C.sky(['#0a0a1a', '#1a1a34', '#2a2440', '#3a2a40']);
    C.stars(40, 50, t);
    // la Encarnación: fachada de piedra y campanario
    C.r(70, 34, 60, 50, '#8a7a64'); C.r(70, 34, 60, 2, '#a89478');
    C.r(122, 8, 18, 76, '#94846c'); C.r(124, 4, 14, 4, '#a89478'); C.r(128, 14, 6, 9, '#1a1410'); C.r(130, 0, 2, 4, '#a89478');
    C.r(92, 56, 16, 28, '#2a1a10'); cg.fillStyle = '#2a1a10'; cg.beginPath(); cg.arc(100, 56, 8, Math.PI, 0); cg.fill();
    C.r(97, 40, 6, 6, '#3a2a40'); C.glow(100, 43, 6, 'rgba(255,200,100,0.6)');
    C.r(0, 84, CW, 29, '#2a2420');
    // barricadas
    for (let i = 0; i < 9; i++) { const x = 10 + i * 21; C.r(x, 84 - (i % 3) * 3, 16, 8 + (i % 3) * 3, i % 2 ? '#4a3a2a' : '#3a3a40'); C.r(x + 2, 82 - (i % 3) * 3, 1, 12, '#5a4a38'); }
    // hoguera
    const f = Math.sin(t * 11) * 1.5;
    C.glow(60, 98, 34 + f * 2, 'rgba(255,140,40,0.45)');
    C.r(54, 100, 12, 3, '#3a2a1c');
    cg.fillStyle = '#ff8a20'; cg.beginPath(); cg.moveTo(54, 101); cg.lineTo(60, 88 + f); cg.lineTo(66, 101); cg.fill();
    cg.fillStyle = '#ffd860'; cg.beginPath(); cg.moveTo(57, 101); cg.lineTo(60, 93 - f); cg.lineTo(63, 101); cg.fill();
    // supervivientes junto al fuego
    for (const [x, h] of [[40, 11], [46, 9], [76, 12], [82, 8], [88, 10]]) { C.r(x, 104 - h, 4, h, '#120e0c'); C.r(x + 0.5, 101 - h, 3, 3, '#120e0c'); }
  },
  cruz(t) {
    C.sky(['#141022', '#2a1e38', '#5a3a48', '#8a5a48']);
    C.stars(30, 60, t, 0.6);
    C.ridge(70, 10, 0.025, 61, '#2a2030');
    C.ridge(86, 14, 0.02, 62, '#1c1820');
    // la carretera
    cg.fillStyle = '#3a3438'; cg.beginPath(); cg.moveTo(0, 100); cg.quadraticCurveTo(80, 84, 200, 90); cg.lineTo(200, 94); cg.quadraticCurveTo(80, 90, 0, 106); cg.fill();
    // la cruz sobre el cerro
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.6);
    C.glow(100, 46, 40 + pulse * 6, `rgba(255,220,140,${0.25 + 0.2 * pulse})`);
    C.r(92, 70, 16, 6, '#7a7068'); C.r(98, 38, 4, 32, '#a89c90'); C.r(91, 46, 18, 4, '#a89c90'); C.r(99, 38, 1, 32, '#c8bcae');
    // zarzas negras al frente
    const R = RNG(64);
    cg.strokeStyle = '#08060a'; cg.lineWidth = 1;
    for (let i = 0; i < 26; i++) { const x = R.int(CW), h = 10 + R.int(22); cg.beginPath(); cg.moveTo(x, CH); cg.quadraticCurveTo(x + (R.next() - 0.5) * 30, CH - h, x + (R.next() - 0.5) * 20 + Math.sin(t + i) * 1.5, CH - h - 4); cg.stroke(); }
    C.r(0, CH - 6, CW, 6, '#08060a');
  },
  bolera(t) {
    C.sky(['#0a0e0c', '#18201c', '#262c26', '#30302a']);
    C.ridge(44, 14, 0.03, 71, '#1a1e1a');
    C.ridge(54, 10, 0.04, 72, '#121612');
    // el embalse, oscuro
    C.water(56, 80, '#0e1a1c', '#2a3a3a', t);
    // la presa
    C.r(0, 78, CW, 8, '#5a5a54'); C.r(0, 78, CW, 1, '#7a7a72'); for (let x = 4; x < CW; x += 12) C.r(x, 80, 1, 6, '#3a3a36');
    C.r(0, 86, CW, 27, '#161a18');
    // la cueva del nacimiento y los ojos
    cg.fillStyle = '#040505'; cg.beginPath(); cg.ellipse(100, 60, 18, 10, 0, Math.PI, 0); cg.fill(); C.r(82, 60, 36, 2, '#040505');
    const blink = Math.sin(t * 0.9) > -0.9;
    C.glow(100, 54, 20, 'rgba(160,30,20,0.35)');
    if (blink) { C.r(93, 53, 3, 2, '#ff3a20'); C.r(104, 53, 3, 2, '#ff3a20'); }
    // ondas desde la cueva
    for (let i = 0; i < 3; i++) { const r = ((t * 10 + i * 10) % 30) + 4; cg.strokeStyle = `rgba(120,140,140,${0.5 * (1 - r / 34)})`; cg.beginPath(); cg.ellipse(100, 66, r, r * 0.25, 0, 0, Math.PI * 2); cg.stroke(); }
    C.rain(t, 90, 0.3, 0.3);
    C.hero(160, 104, 1.3, t);
  },
  alba(t) {
    C.sky(['#f0c080', '#f4d8a0', '#e8e8d0', '#a8c8d8']);
    const sun = Math.min(1, t / 5);
    C.glow(100, 66 - sun * 14, 60, 'rgba(255,230,160,0.7)');
    C.r(94, 60 - sun * 14, 12, 8, '#fff4d0');
    C.ridge(66, 8, 0.025, 81, '#a89090');
    C.ridge(72, 6, 0.04, 82, '#8a8070');
    C.reflect(74, 22, t, 'rgba(60,120,150,0.35)');
    C.r(0, 96, CW, 17, '#6a7a40');
    for (let i = 0; i < 6; i++) C.poplar(10 + i * 34, 104, 14 + (i % 2) * 4, '#4a6a28', '#6a8a38');
    // gente caminando hacia el pueblo
    for (let i = 0; i < 5; i++) { const x = (30 + i * 9 + t * 4) % (CW + 20) - 10, h = 7 + (i % 3); C.r(x, 104 - h, 3, h, '#2a2420'); C.r(x, 101 - h, 3, 3, '#2a2420'); }
    // pájaros
    for (let i = 0; i < 4; i++) { const x = (40 + i * 22 + t * 10) % CW, y = 24 + Math.sin(t + i) * 4 + i * 3; C.r(x, y, 1, 1, '#3a3028'); C.r(x - 1, y - 1, 1, 1, '#3a3028'); C.r(x + 1, y - 1, 1, 1, '#3a3028'); }
  },
};

G.renderCine = function (g) {
  const k = this.cine; if (!k) return;
  g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH);
  if (k.idx < 0) {
    // rótulo de misión
    const a = Math.min(1, k.t / 0.6) * Math.min(1, (2.6 - k.t) / 0.5 + 0.0001);
    g.globalAlpha = Math.max(0, a);
    g.font = FB(7); this.center(g, 'NUEVA MISIÓN', VH / 2 - 14, DIM);
    g.font = FT(16); this.center(g, k.c.title, VH / 2 + 6, GOLD);
    g.fillStyle = GOLD; g.fillRect(VW / 2 - 50, VH / 2 + 13, 100, 1);
    g.globalAlpha = 1;
  } else {
    const [scene, text] = k.c.pages[k.idx];
    cg.save(); (SCENES[scene] || SCENES.valle)(k.t); cg.restore();
    cinePost();
    g.imageSmoothingEnabled = false;
    g.drawImage(cineC, 0, 0, CW * 2, CH * 2);
    if (k.t < 0.7) { g.fillStyle = `rgba(0,0,0,${1 - k.t / 0.7})`; g.fillRect(0, 0, VW, VH); }
    // bandas de cine y texto
    g.fillStyle = 'rgba(0,0,0,0.9)'; g.fillRect(0, 0, VW, 12);
    const grd = g.createLinearGradient(0, VH - 70, 0, VH); grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(0.35, 'rgba(0,0,0,0.82)'); grd.addColorStop(1, 'rgba(0,0,0,0.95)');
    g.fillStyle = grd; g.fillRect(0, VH - 70, VW, 70);
    g.font = FT(9.5);
    const shown = Math.floor(Math.min(text.length, k.chars)), lines = [];
    for (const para of text.split('\n')) for (const l of (para ? this.wrap(g, para, VW - 50) : [''])) lines.push(l);
    const y0 = VH - 14 - lines.length * 12;
    let used = 0;
    lines.forEach((l, i) => { const take = Math.max(0, Math.min(l.length, shown - used)); const w = g.measureText(l).width; this.text(g, l.slice(0, take), VW / 2 - w / 2, y0 + i * 12 + 8, PAPER); used += l.length + 1; });
    if (k.chars >= text.length) { g.font = FB(5.8); this.text(g, '▸', VW - 14, VH - 6, `rgba(232,196,106,${0.5 + 0.5 * Math.sin(this.clock * 5)})`); }
  }
  // botón saltar
  g.font = FB(6); const sk = 'Saltar ›';
  this.text(g, sk, VW - g.measureText(sk).width - 8, 9, DIM);
  this.cineSkip = { x: VW - 56, y: 0, w: 56, h: 18 };
};

// ---------------------------------------------------------------- posproceso de las cinemáticas: brillo suave, grano y viñeta
const bloomC = document.createElement('canvas'); bloomC.width = 50; bloomC.height = 28;
const bloomG = bloomC.getContext('2d');
let grainC = null;
function cinePost() {
  bloomG.imageSmoothingEnabled = true; bloomG.clearRect(0, 0, 50, 28); bloomG.drawImage(cineC, 0, 0, 50, 28);
  cg.save(); cg.imageSmoothingEnabled = true; cg.globalCompositeOperation = 'screen'; cg.globalAlpha = 0.28; cg.drawImage(bloomC, 0, 0, CW, CH); cg.restore();
  if (!grainC) {
    grainC = document.createElement('canvas'); grainC.width = CW; grainC.height = CH;
    const gg = grainC.getContext('2d'), id = gg.createImageData(CW, CH);
    for (let i = 0; i < CW * CH; i++) { const v = Math.random() * 255; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 18; }
    gg.putImageData(id, 0, 0);
  }
  cg.drawImage(grainC, (Math.random() * 6) | 0 - 3, (Math.random() * 4) | 0 - 2);
  const gr = cg.createRadialGradient(CW / 2, CH / 2, CH * 0.3, CW / 2, CH / 2, CW * 0.62);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.5)');
  cg.fillStyle = gr; cg.fillRect(0, 0, CW, CH);
}
