// ====================================================================== personajes con cabeza grande y cara expresiva
// Proporciones de unas 2,3 cabezas (como las referencias de taberna): 20×28 px, ojos con blanco y pupila,
// pelo con volumen y mechones, ropa con pliegues. Luego autoShade + contorno teñido.
Art.initCharacters2 = function () {
  const { img, p, r, ov, line, shade, flipH } = Px;
  const Look = (skin, hair, shirt, pants, shoes, o = {}) => Object.assign({ skin, hair, shirt, pants, shoes, eyes: 0x2a3a5a }, o);

  function person(L, dir, frame, attack) {
    const b = img(20, 28);
    const step = frame === 1 ? 1 : frame === 2 ? -1 : 0, bob = frame ? 1 : 0;
    const side = dir >= 2, back = dir === 1;
    const hairD = shade(L.hair, 0.7), hairL = shade(L.hair, 1.35), skinD = shade(L.skin, 0.82);
    // ---------------- capa (detrás)
    if (L.cloak) {
      const cc = 0x2c3038, ccd = 0x1e2228;
      if (back) { r(b, 3, 13, 14, 13, cc); for (let x = 4; x < 16; x += 3) r(b, x, 15, 1, 11, ccd); r(b, 3, 25, 14, 1, ccd); }
      else if (!side) { r(b, 3, 13, 14, 12, cc); r(b, 3, 24, 2, 1, ccd); r(b, 15, 24, 2, 1, ccd); }
      else { r(b, 4, 13, 8, 12 + (frame ? 1 : 0), cc); for (let y = 15; y < 25; y += 3) p(b, 4, y, ccd); }
    }
    // ---------------- piernas y zapatos
    const legC = L.robe ? L.shirt : L.pants;
    if (!side) {
      r(b, 6, 21, 3, 5 - Math.max(0, step), legC); r(b, 11, 21, 3, 5 - Math.max(0, -step), legC);
      r(b, 6, 26 - Math.max(0, step), 3, 2, L.shoes); r(b, 11, 26 - Math.max(0, -step), 3, 2, L.shoes);
      p(b, 6, 26 - Math.max(0, step), shade(L.shoes, 1.4));
    } else {
      r(b, 7 - step, 21, 3, 5, shade(legC, 0.8)); r(b, 9 + step, 21, 3, 5, legC);
      r(b, 7 - step, 26, 3, 2, shade(L.shoes, 0.8)); r(b, 9 + step, 26, 4, 2, L.shoes);
    }
    // ---------------- torso
    const tY = 13 + (bob ? 0 : 0);
    if (!side) {
      r(b, 5, tY, 10, 9, L.shirt);
      if (L.robe) { r(b, 5, 20, 10, 6, L.shirt); for (let x = 6; x < 15; x += 3) r(b, x, 21, 1, 5, shade(L.shirt, 0.8)); }
      r(b, 5, tY, 10, 1, shade(L.shirt, 1.15));
      if (L.apron && dir === 0) { r(b, 6, tY + 3, 8, 9, 0xe8e2d0); r(b, 6, tY + 3, 8, 1, 0xc8c0aa); }
      if (L.vest) { r(b, 5, tY, 3, 8, L.vest); r(b, 12, tY, 3, 8, L.vest); }
      if (L.cloak && !back) {
        // cota de malla en los costados y tabardo blanco con cruz roja
        for (let y = tY; y < tY + 8; y++) for (let x = 5; x < 15; x++) p(b, x, y, (x + y) % 2 ? 0x6a727c : 0x4a525c);
        r(b, 7, tY, 6, 10, 0xe2dccb); r(b, 7, tY, 1, 10, 0xf2ecdc);
        r(b, 9, tY + 2, 2, 6, 0xb02a20); r(b, 8, tY + 4, 4, 2, 0xb02a20);
        r(b, 5, tY + 7, 10, 1, 0x4a2e1a); p(b, 10, tY + 7, 0xd0a840);
        r(b, 4, tY - 1, 12, 2, 0x2c3038); // cuello de la capa
      }
      if (L.cloak && back) { r(b, 8, tY + 1, 4, 8, 0x5a3a20); r(b, 8, tY + 1, 4, 1, 0x7a5030); }
      if (L.scarf) { r(b, 5, tY - 1, 10, 2, L.scarf); if (dir === 0) r(b, 12, tY + 1, 2, 3, L.scarf); }
      // brazos
      const armC = L.cloak ? 0x4e5660 : shade(L.shirt, 0.9);
      const aL = frame === 1 ? -1 : frame === 2 ? 1 : 0;
      if (attack && dir === 0) { r(b, 3, tY + 1, 2, 7, armC); r(b, 15, tY - 2, 2, 7, armC); r(b, 15, tY - 3, 2, 1, L.skin); r(b, 3, tY + 8, 2, 1, L.skin); }
      else { r(b, 3, tY + 1 + aL, 2, 7, armC); r(b, 15, tY + 1 - aL, 2, 7, armC); r(b, 3, tY + 8 + aL, 2, 2, L.skin); r(b, 15, tY + 8 - aL, 2, 2, L.skin); }
    } else {
      r(b, 6, tY, 8, 9, L.shirt);
      if (L.robe) r(b, 6, 20, 8, 6, L.shirt);
      if (L.apron) r(b, 12, tY + 3, 2, 8, 0xe8e2d0);
      if (L.cloak) { for (let y = tY; y < tY + 8; y++) for (let x = 6; x < 14; x++) p(b, x, y, (x + y) % 2 ? 0x6a727c : 0x4a525c); r(b, 10, tY, 4, 10, 0xe2dccb); r(b, 11, tY + 3, 2, 4, 0xb02a20); r(b, 6, tY + 7, 8, 1, 0x4a2e1a); r(b, 5, tY - 1, 9, 2, 0x2c3038); }
      if (L.scarf) r(b, 6, tY - 1, 8, 2, L.scarf);
      const armC = L.cloak ? 0x4e5660 : shade(L.shirt, 0.85);
      if (attack || L.hollow) { r(b, 10, tY + 3, 7, 2, armC); r(b, 17, tY + 3, 2, 2, L.skin); }
      else { const sw = frame === 1 ? -1 : frame === 2 ? 1 : 0; r(b, 9 + sw, tY + 1, 3, 7, armC); r(b, 9 + sw, tY + 8, 3, 2, L.skin); }
    }
    // ---------------- cabeza grande
    const hx = 4, hy = 1 + (frame === 1 ? 1 : 0) * 0;
    if (!side) {
      // cara redondeada
      r(b, hx + 1, hy + 2, 10, 10, L.skin); r(b, hx, hy + 4, 12, 6, L.skin); r(b, hx + 2, hy + 12, 8, 1, skinD);
      if (!back) {
        // ojos con blanco y pupila
        const ey = hy + 7;
        if (L.hollow) { r(b, hx + 2, ey, 2, 2, 0x1a1a14); r(b, hx + 8, ey, 2, 2, 0x1a1a14); p(b, hx + 3, ey, 0xe8d040); p(b, hx + 8, ey, 0xe8d040); }
        else {
          r(b, hx + 2, ey, 2, 2, 0xf4f0ea); r(b, hx + 8, ey, 2, 2, 0xf4f0ea);
          p(b, hx + 3, ey, L.eyes); p(b, hx + 3, ey + 1, shade(L.eyes, 0.6)); p(b, hx + 8, ey, L.eyes); p(b, hx + 8, ey + 1, shade(L.eyes, 0.6));
          r(b, hx + 2, ey - 1, 2, 1, hairD); r(b, hx + 8, ey - 1, 2, 1, hairD); // cejas
        }
        p(b, hx + 6, ey + 2, skinD); // nariz
        if (!L.beard) { r(b, hx + 5, ey + 4, 2, 1, shade(L.skin, 0.65)); if (L.blush) { p(b, hx + 1, ey + 2, 0xe08a80); p(b, hx + 10, ey + 2, 0xe08a80); } }
        if (L.beard) { r(b, hx + 1, ey + 2, 10, 4, L.hair); r(b, hx + 3, ey + 6, 6, 1, L.hair); r(b, hx + 5, ey + 3, 2, 1, shade(L.skin, 0.65)); p(b, hx + 2, ey + 2, hairL); }
        if (L.glasses) { r(b, hx + 1, ey - 1, 4, 3, 0x2a2a2a); r(b, hx + 7, ey - 1, 4, 3, 0x2a2a2a); r(b, hx + 2, ey, 2, 1, 0xd8e8f0); r(b, hx + 8, ey, 2, 1, 0xd8e8f0); }
      }
      // pelo
      if (back) { r(b, hx, hy + 1, 12, 10, L.hair); for (let x = hx + 1; x < hx + 12; x += 3) r(b, x, hy + 3, 1, 7, hairD); if (L.bald) r(b, hx + 2, hy + 1, 8, 6, L.skin); }
      else if (!L.bald) {
        r(b, hx, hy + 1, 12, 4, L.hair); r(b, hx + 1, hy, 10, 1, L.hair);
        for (let x = hx + 1; x < hx + 11; x += 2) p(b, x, hy + 5, L.hair); // flequillo en picos
        r(b, hx, hy + 4, 1, 4, L.hair); r(b, hx + 11, hy + 4, 1, 4, L.hair);
        r(b, hx + 3, hy + 1, 4, 1, hairL); p(b, hx + 2, hy + 2, hairL);
      } else { r(b, hx, hy + 5, 1, 3, L.hair); r(b, hx + 11, hy + 5, 1, 3, L.hair); p(b, hx + 4, hy + 3, shade(L.skin, 1.15)); }
      if (L.longHair) { r(b, hx - 1, hy + 3, 2, 12, L.hair); r(b, hx + 11, hy + 3, 2, 12, L.hair); if (back) r(b, hx, hy + 10, 12, 5, L.hair); }
      if (L.helmet) { r(b, hx - 1, hy, 14, 5, 0x7a7e86); r(b, hx - 1, hy + 4, 14, 1, 0x4a4e56); r(b, hx + 2, hy + 1, 3, 1, 0xb0b4bc); }
      if (L.hood) { r(b, hx - 1, hy, 14, 6, L.hood); r(b, hx - 1, hy + 5, 2, 7, L.hood); r(b, hx + 11, hy + 5, 2, 7, L.hood); }
    } else {
      // perfil mirando a la derecha
      r(b, hx + 1, hy + 2, 10, 10, L.skin); r(b, hx + 11, hy + 6, 1, 3, L.skin); r(b, hx + 2, hy + 12, 7, 1, skinD);
      const ey = hy + 7;
      if (L.hollow) { p(b, hx + 8, ey, 0xe8d040); } else { r(b, hx + 8, ey, 2, 2, 0xf4f0ea); p(b, hx + 9, ey, L.eyes); p(b, hx + 9, ey + 1, shade(L.eyes, 0.6)); r(b, hx + 8, ey - 1, 2, 1, hairD); }
      if (!L.beard) r(b, hx + 9, ey + 4, 2, 1, shade(L.skin, 0.65));
      if (L.beard) { r(b, hx + 5, ey + 2, 7, 4, L.hair); r(b, hx + 7, ey + 6, 4, 1, L.hair); r(b, hx + 10, ey + 3, 1, 1, shade(L.skin, 0.65)); }
      if (!L.bald) { r(b, hx, hy + 1, 11, 4, L.hair); r(b, hx, hy + 1, 5, 10, L.hair); r(b, hx + 1, hy, 9, 1, L.hair); for (let y = hy + 3; y < hy + 10; y += 2) p(b, hx + 1, y, hairD); r(b, hx + 3, hy + 1, 4, 1, hairL); p(b, hx + 10, hy + 5, L.hair); }
      else { r(b, hx, hy + 5, 3, 3, L.hair); }
      p(b, hx + 5, ey + 1, skinD); // oreja
      if (L.longHair) r(b, hx - 1, hy + 3, 4, 12, L.hair);
      if (L.helmet) { r(b, hx - 1, hy, 13, 5, 0x7a7e86); r(b, hx - 1, hy + 4, 13, 1, 0x4a4e56); }
      if (L.hood) { r(b, hx - 1, hy, 13, 6, L.hood); r(b, hx - 1, hy, 5, 12, L.hood); }
    }
    Px.autoShade(b);
    Px.outlineTint(b);
    return b;
  }
  function personSet(L) {
    const s = [];
    for (let d = 0; d < 4; d++) { s.push([]); const dd = d === 2 ? 3 : d; for (let f = 0; f < 3; f++) { const im = person(L, dd, f, false); s[d].push(d === 2 ? flipH(im) : im); } }
    return s;
  }
  const heroL = Look(0xc89470, 0x2a1d16, 0x45413a, 0x3a3a40, 0x2a1e14, { beard: true, cloak: true, eyes: 0x4a3a28 });
  Art.hero = personSet(heroL);
  Art.heroAtk = [0, 1, 2, 3].map(d => { const im = person(heroL, d === 2 ? 3 : d, 1, true); return d === 2 ? flipH(im) : im; });
  Art.people.cura = personSet(Look(0xd8a884, 0xb8b4ac, 0x1e1e26, 0x1e1e26, 0x141414, { robe: true, bald: true, glasses: true, eyes: 0x3a5a7a }));
  Art.people.curandera = personSet(Look(0xd0a078, 0x8a8a8a, 0x6a3a4a, 0x3a2a30, 0x2a2020, { apron: true, longHair: true, eyes: 0x4a6a3a }));
  Art.people.guardia = personSet(Look(0xb88058, 0x3a2a1e, 0x5a6a3e, 0x3a3e30, 0x2a2420, { helmet: true, beard: true }));
  Art.people.mecanica = personSet(Look(0xc89470, 0x8a3a1a, 0x3a5a7a, 0x3a3a48, 0x2a2a2a, { longHair: true, scarf: 0xb03a2a, blush: true, eyes: 0x3a6a4a }));
  Art.people.chaval = personSet(Look(0xc8946c, 0x2a1a10, 0xb0563a, 0x3a4a6a, 0x2a2a2a, { blush: true }));
  Art.people.santiago = personSet(Look(0xd0a07a, 0x2a2420, 0xf0ece0, 0x1e1e22, 0x141414, { bald: true, vest: 0x1a1a1e, beard: false, eyes: 0x3a2a1a }));
  Art.people.gerente = personSet(Look(0xd8aa86, 0x1a1210, 0x5a2a3a, 0x2a2a30, 0x1a1414, { longHair: true, vest: 0x2a1a22, eyes: 0x2a2a2a }));
  Art.people.manuel = personSet(Look(0xc8946c, 0x3a2a1e, 0xe8e4da, 0x1e1e24, 0x141414, { vest: 0x22222a, eyes: 0x3a4a2a }));
  Art.people.monitora = personSet(Look(0xc89470, 0x6a4a2a, 0x3a5a3a, 0x4a4a3a, 0x3a2a1a, { longHair: true, blush: true, eyes: 0x3a6a4a }));
  Art.people.relojero = personSet(Look(0xc09070, 0xd0ccc4, 0x4a3a2a, 0x3a3026, 0x221c16, { bald: true, beard: true, glasses: true }));
  // el Anticristo: traje blanco, pelo dorado peinado, sonrisa amable; ojos dorados
  Art.people.anticristo = personSet(Look(0xe0bc9c, 0xd8b050, 0xf2efe8, 0xe8e4dc, 0xf0ece4, { eyes: 0xc89a20, scarf: 0x8a1a14 }));
  Art.people.abuelo = personSet(Look(0xc09070, 0xe0e0dc, 0x5a4a3a, 0x3a3630, 0x262220, { bald: true, vest: 0x3a3226 }));
};
