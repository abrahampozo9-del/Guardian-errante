// ====================================================================== arte de las misiones de Relatos Raros
Art.initQuests = function () {
  const { img, p, r, ov, ova, line, shade, mix, outline } = Px;
  const put = (k, b) => { Art.P[k] = b; };
  const mk = Art.makePerson, PP = Art.people;
  // ---------------------------------------------------------------- gente del libro
  PP.doro = mk(0xc89470, 0x2a2420, 0x6a5a4a, 0x2a2a30, 0x1a1414, { bald: true, apron: true, eyes: 0x3a2a1a });
  PP.casimiro = mk(0xd8b090, 0xc8c4bc, 0x2a2622, 0x22201c, 0x141210, { glasses: true, vest: 0x161412, eyes: 0x2a2a2a });
  PP.ursula = mk(0xe0b48e, 0x8a3a1e, 0x8a1e22, 0x6a161a, 0x2a1010, { longHair: true, robe: true, blush: true, eyes: 0x3a5a2a });
  PP.huevo = mk(0xc89470, 0x5a4a2a, 0x4a6a4a, 0x3a3a48, 0x2a2a2a, { scarf: 0xc8a040, blush: true, eyes: 0x4a4a2a });
  PP.malpario = mk(0xb88058, 0x1a1410, 0x6a6a6a, 0x2a3a5a, 0x1a1a1a, { bald: true, eyes: 0x3a2a1a });
  PP.nolasco = mk(0xe0c0a0, 0x3a3a3a, 0xe8e4da, 0x2a2a30, 0x141414, { apron: true, bald: true, glasses: true, eyes: 0x1a1a1a });
  PP.sancho = mk(0xb88058, 0x4a3a2a, 0x8a6a3a, 0x3a3a30, 0x2a2016, { beard: true, eyes: 0x3a2a1a });
  PP.leovieja = mk(0xe0c8b8, 0xe8e8e4, 0x9ab0c0, 0x8aa0b0, 0xd8d8d8, { longHair: true, robe: true, eyes: 0x3a3a5a });
  PP.leojoven = mk(0xf0d0b8, 0x140a0e, 0x6a0e1a, 0x4a0812, 0x1a0606, { longHair: true, robe: true, hollow: true });
  PP.kevin = mk(0xd0a07a, 0x3a2a1a, 0xe8e8ec, 0x3a4458, 0x1a1a1a, { vest: 0x2a3448, eyes: 0x2a4a6a });
  PP.baldomero = mk(0xc89470, 0x2a1d16, 0xf0ece0, 0x2a2a30, 0x141414, { bald: true, beard: true, vest: 0x3a2a1e, eyes: 0x2a1a10 });
  PP.baldo_cuchillo = PP.baldomero;
  PP.andrea = mk(0xe0b48e, 0x3a2410, 0x5a7a9a, 0x3a3a48, 0x2a2420, { longHair: true, blush: true, eyes: 0x3a5a2a });
  PP.javier = mk(0xc89470, 0x2a1d16, 0x3a3a40, 0x2a2a34, 0x1a1a1a, { eyes: 0x3a2a1a });
  PP.madre = mk(0xd8b090, 0x8a8682, 0x5a3a4a, 0x3a2a30, 0x2a2020, { longHair: true, apron: true, eyes: 0x3a3a2a });
  PP.madre_falsa = mk(0xc8c0b8, 0x8a8682, 0x5a3a4a, 0x3a2a30, 0x2a2020, { longHair: true, apron: true, hollow: true });
  PP.mujer = mk(0xf2eee8, 0x060406, 0xeeeae2, 0xdcd8d0, 0xe8e4dc, { longHair: true, robe: true, hollow: true });
  PP.victor = mk(0xc8a080, 0xdcdcd8, 0x4a4a3a, 0x3a3830, 0x262220, { bald: true, glasses: true, vest: 0x3a3226 });
  PP.curro_viejo = mk(0xc8a890, 0xe8e8e4, 0x5a6a3e, 0x3a3e30, 0x2a2420, { helmet: true, beard: true });
  PP.eliseo = mk(0xc8a080, 0xd0ccc4, 0x3a3226, 0x2a2620, 0x1a1612, { bald: true, vest: 0x2a2018 });
  // el reflejo gris: el Guardián en gris (para el cuarto gris de La puerta)
  const grey = s => { const d = Px.copy(s); for (let i = 0; i < d.d.length; i++) { const v = d.d[i]; if ((v >>> 24) === 0) continue; const g = Math.round(((v >> 16 & 255) * 0.3 + (v >> 8 & 255) * 0.59 + (v & 255) * 0.11) * 0.9 + 20); d.d[i] = ((v & 0xff000000) | (g << 16) | (g << 8) | Math.min(255, g + 12)) >>> 0; } return d; };
  PP.reflejo = Art.hero.map(dir => dir.map(grey));
  // ---------------------------------------------------------------- objetos
  { // maletín de cuero (abierto y cerrado)
    for (const open of [0, 1]) {
      const b = img(18, 14); ova(b, 9, 12, 8, 1.6, 0x46000000);
      r(b, 2, 4 + (open ? 2 : 0), 14, 8 - (open ? 2 : 0), 0x5a3a20); r(b, 2, 4 + (open ? 2 : 0), 14, 1, 0x7a5430);
      if (open) { r(b, 2, 1, 14, 5, 0x4a2e18); r(b, 3, 2, 12, 3, 0x2a1a10); r(b, 4, 6, 4, 3, 0x7a5a3a); r(b, 9, 6, 5, 2, 0xc8b898); p(b, 10, 7, 0x8a2a1a); }
      else { r(b, 7, 2, 4, 2, 0x3a2414); r(b, 8, 5, 2, 1, 0xc8a040); }
      outline(b, 0x1a100a); put(open ? 'maletin_abierto' : 'maletin', b);
    }
  }
  { // el bujero: tres tamaños (crece)
    for (const [k, rx, ry] of [['bujero0', 7, 3.5], ['bujero1', 14, 7], ['bujero2', 26, 12]]) {
      const b = img(rx * 2 + 8, ry * 2 + 8), cx = rx + 4, cy = ry + 4;
      ov(b, cx, cy, rx + 2, ry + 2, 0x4a4238); ov(b, cx, cy + 0.5, rx + 1, ry + 1, 0x2a241e);
      ov(b, cx, cy, rx, ry, 0x050304); ov(b, cx, cy + ry * 0.35, rx * 0.8, ry * 0.5, 0x000000);
      const R = RNG(rx); for (let i = 0; i < rx * 3; i++) { const a = R.next() * 6.28; p(b, cx + Math.cos(a) * (rx + 2), cy + Math.sin(a) * (ry + 2), 0x6a5e50); }
      put(k, b);
    }
  }
  { // la puerta que nunca abrió: cerrada, astillada y sangrando
    for (const [k, blood] of [['puerta_gris', 0], ['puerta_sangre', 1]]) {
      const b = img(18, 30);
      r(b, 0, 0, 18, 30, 0x3a2a1c); r(b, 2, 2, 14, 28, 0x6a4a30); r(b, 2, 2, 14, 1, 0x8a6440);
      for (let y = 4; y < 28; y += 6) r(b, 4, y, 10, 4, 0x5a3e28);
      r(b, 13, 15, 2, 2, 0xc8a040);
      if (blood) { const R = RNG(7); for (let i = 0; i < 18; i++) { const x = 3 + R.int(12), y0 = 4 + R.int(16), l = 3 + R.int(10); for (let y = y0; y < y0 + l && y < 30; y++) p(b, x, y, y === y0 ? 0x5a0a08 : 0x9a1410); } line(b, 5, 8, 11, 14, 0x2a1a10); line(b, 9, 18, 14, 24, 0x2a1a10); }
      outline(b, 0x120a06); put(k, b);
    }
  }
  { // el atril del infierno con el libro abierto
    const b = img(20, 30); ova(b, 10, 28, 8, 2, 0x46000000);
    r(b, 8, 12, 4, 16, 0x2a1210); r(b, 5, 26, 10, 2, 0x1a0a08); line(b, 2, 10, 18, 6, 0x3a1a14); r(b, 2, 6, 16, 6, 0x4a2018);
    r(b, 3, 3, 7, 5, 0xd8c8a0); r(b, 10, 3, 7, 5, 0xe8dcb8); line(b, 4, 5, 8, 5, 0x5a3a2a); line(b, 11, 5, 15, 5, 0x5a3a2a); p(b, 12, 4, 0xa01810);
    outline(b, 0x0a0404); put('atril', b);
  }
  { // el cuadro de la abuela (con la urna pintada)
    for (const [k, urna] of [['cuadro_abuela', 0], ['cuadro_urna', 1]]) {
      const b = img(20, 16);
      r(b, 0, 0, 20, 16, 0x6a4a1a); r(b, 1, 1, 18, 14, 0xa8803a); r(b, 2, 2, 16, 12, 0x2a3a3a);
      r(b, 2, 9, 16, 5, 0x3a4a30); ov(b, 6, 7, 3, 3, 0x6a7a5a);
      if (urna) { r(b, 10, 5, 5, 7, 0x8a7a6a); r(b, 9, 5, 7, 1, 0xa89a88); r(b, 11, 3, 3, 2, 0x8a7a6a); p(b, 12, 8, 0xd8c8a8); }
      else { ov(b, 12, 8, 3, 4, 0xc89a7a); r(b, 10, 4, 5, 3, 0xa8a8a0); }
      put(k, b);
    }
  }
  { // saco de cemento, olla del guiso, frasco y setas, pistola, moneda
    let b = img(14, 12); ova(b, 7, 10, 6, 1.4, 0x46000000); r(b, 2, 3, 10, 7, 0xb8b0a0); r(b, 2, 3, 10, 1, 0xd8d0c0); r(b, 4, 5, 6, 3, 0x8a3a1a); outline(b, 0x4a4436); put('saco', b);
    b = img(16, 14); ova(b, 8, 12, 7, 1.6, 0x46000000); ov(b, 8, 8, 7, 4, 0x2a2a2a); ov(b, 8, 6, 6, 2, 0x5a4a20); p(b, 6, 6, 0x8a7a30); p(b, 10, 5, 0x3a6a20); r(b, 0, 7, 2, 1, 0x1a1a1a); r(b, 14, 7, 2, 1, 0x1a1a1a); outline(b, 0x0a0a0a); put('olla', b);
    b = img(12, 12); ova(b, 6, 10, 5, 1.2, 0x46000000); r(b, 2, 4, 4, 6, 0x3a6a3a); r(b, 3, 2, 2, 2, 0x8a6a4a); ov(b, 9, 8, 2, 1.5, 0xd8d0b0); r(b, 9, 8, 1, 2, 0xe8e0c8); outline(b, 0x101010); put('frasco', b);
    b = img(12, 8); r(b, 1, 2, 9, 3, 0x2a2a2e); r(b, 1, 2, 9, 1, 0x5a5a62); r(b, 6, 4, 3, 4, 0x3a2a1a); p(b, 3, 5, 0x1a1a1a); outline(b, 0x0a0a0a); put('pistola', b);
    b = img(8, 8); ov(b, 4, 4, 3.5, 3.5, 0xc8c8c8); ov(b, 4, 4, 2.5, 2.5, 0xa8a8b0); p(b, 3, 3, 0x6a6a6a); p(b, 4, 3, 0x6a6a6a); p(b, 4, 4, 0x6a6a6a); p(b, 5, 5, 0x6a6a6a); outline(b, 0x3a3a3a); put('moneda', b);
  }
  { // altar de la ermita y vela grande
    let b = img(32, 22); ova(b, 16, 20, 14, 2, 0x46000000); r(b, 2, 8, 28, 12, 0xd8d0c0); r(b, 2, 8, 28, 2, 0xf0e8d8); r(b, 2, 12, 28, 1, 0xa89e8e); r(b, 13, 2, 6, 6, 0xc8a040); r(b, 15, 0, 2, 6, 0xe8c860); r(b, 13, 2, 6, 1, 0xe8c860); outline(b, 0x3a3228); put('altar', b);
    b = img(6, 16); r(b, 2, 4, 3, 11, 0xe8dcc0); r(b, 2, 4, 1, 11, 0xfff4dc); p(b, 3, 2, 0xffd060); p(b, 3, 3, 0xff9a30); r(b, 1, 14, 5, 2, 0x8a6a40); put('vela', b);
  }
  { // escalera que baja (en tramos de tres) para el infierno
    const b = img(32, 32);
    for (let i = 0; i < 6; i++) { const c = shade(0x5a1a10, 1 - i * 0.14); r(b, 2 + i * 2, 2 + i * 5, 28 - i * 4, 5, c); r(b, 2 + i * 2, 2 + i * 5, 28 - i * 4, 1, shade(c, 1.4)); }
    put('escalera_abajo', b);
  }
};
