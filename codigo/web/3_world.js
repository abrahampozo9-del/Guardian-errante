// ====================================================================== mapas
class Prop {
  constructor(img, x, y) { this.img = img; this.x = x; this.y = y; this.id = null; this.wallDecor = false; this.anim = 0; this.hidden = false; }
  left() { return Math.round(this.x - this.img.w / 2); }
  top() { return Math.round(this.y - this.img.h); }
}
class Area {
  constructor(name, x, y, w, h) { this.name = name; this.x = x; this.y = y; this.w = w; this.h = h; this.safe = false; this.noSpawn = false; this.tier = 1; }
  in(tx, ty) { return tx >= this.x && ty >= this.y && tx < this.x + this.w && ty < this.y + this.h; }
}
class World {
  constructor(id, w, h, fill) {
    this.id = id; this.w = w; this.h = h;
    this.t = new Uint8Array(w * h).fill(fill); this.blk = new Uint8Array(w * h);
    this.outdoor = false; this.defaultArea = '';
    this.props = []; this.decor = []; this.warps = []; this.npcs = []; this.monsters = []; this.pickups = []; this.areas = []; this.regionFn = null;
  }
  get(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return T.VOID; return this.t[y * this.w + x]; }
  set(x, y, v) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.t[y * this.w + x] = v; }
  fill(x, y, ww, hh, v) { for (let j = y; j < y + hh; j++) for (let i = x; i < x + ww; i++) this.set(i, j, v); }
  block(x, y, ww, hh) { for (let j = y; j < y + hh; j++) for (let i = x; i < x + ww; i++) if (i >= 0 && j >= 0 && i < this.w && j < this.h) this.blk[j * this.w + i] = 1; }
  unblock(x, y, ww, hh) { for (let j = y; j < y + hh; j++) for (let i = x; i < x + ww; i++) if (i >= 0 && j >= 0 && i < this.w && j < this.h) this.blk[j * this.w + i] = 0; }
  solid(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return true; return T.SOLID[this.t[y * this.w + x]] || this.blk[y * this.w + x] === 1; }
  blocked(cx, cy, hw, hh) {
    const x0 = Math.floor((cx - hw) / TS), x1 = Math.floor((cx + hw - 0.01) / TS), y0 = Math.floor((cy - hh) / TS), y1 = Math.floor((cy + hh - 0.01) / TS);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (this.solid(x, y)) return true;
    return false;
  }
  prop(key, tx, ty, bx, by, bw, bh) {
    const im = Art.P[key];
    if (!im) throw new Error('Falta el dibujo ' + key);
    const p = new Prop(im, tx * TS + 8, ty * TS + 15);
    this.props.push(p);
    if (bw !== undefined) this.block(bx, by, bw, bh);
    return p;
  }
  wall(key, px, py) { const p = new Prop(Art.P[key], px, py); p.wallDecor = true; this.decor.push(p); return p; }
  areaAt(tx, ty) { for (const a of this.areas) if (a.in(tx, ty)) return a; return this.regionFn ? this.regionFn(tx, ty) : null; }
  areaName(tx, ty) { const a = this.areaAt(tx, ty); return a ? a.name : this.defaultArea; }
  safeAt(tx, ty) { const a = this.areaAt(tx, ty); return !!(a && a.safe); }
  noSpawnAt(tx, ty) { const a = this.areaAt(tx, ty); return !!(a && (a.noSpawn || a.safe)); }
  tierAt(tx, ty) { const a = this.areaAt(tx, ty); return a ? a.tier : 1; }
}
class Warp { constructor(x, y, w, h, to, tx, ty, dir) { Object.assign(this, { x, y, w, h, to, tx, ty, dir }); } }
class Npc {
  constructor(name, key, set, single, alt, x, y, dir) { Object.assign(this, { name, key, set, single, alt, x, y, dir: dir || 0 }); }
  sprite(time) { if (this.set) return this.set[this.dir][0]; if (this.alt && (Math.floor(time * 2 + this.x) % 4 === 0)) return this.alt; return this.single; }
}
class Pickup { constructor(type, x, y, id) { Object.assign(this, { type, x, y, id, t: 0 }); } }
Pickup.HERB = 0; Pickup.RELIC = 1;

// ====================================================================== generación (geografía real a escala, 1 casilla ≈ 25 m)
const WG = (function () {
  const OW_W = 220, OW_H = 200;
  const G = { OW_W, OW_H, brambles: [], questSpawns: [] };
  let R, reserved;
  const A = (n, x, y, w, h) => new Area(n, x, y, w, h);

  function hash(x, y, s) {
    let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h & 0xffffff) / 0x1000000;
  }
  function vnoise(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y);
    let fx = x - xi, fy = y - yi;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }
  function fbm(x, y, s) { return 0.5 * vnoise(x / 18, y / 18, s) + 0.3 * vnoise(x / 8, y / 8, s + 1) + 0.2 * vnoise(x / 3.5, y / 3.5, s + 2); }
  function plateau(y, c, half, taper) {
    const d = Math.abs(y - c);
    if (d <= half) return 1; if (d >= half + taper) return 0;
    const t = 1 - (d - half) / taper; return t * t * (3 - 2 * t);
  }
  const riverBase = y => 160 - (y - 43) * 0.17 + 3 * Math.sin(y * 0.11) + 1.5 * Math.sin(y * 0.31 + 1);
  function riverX(y) { const k = plateau(y, 109, 13, 6); return riverBase(y) * (1 - k) + Math.round(riverBase(109)) * k; }
  function floorW(y) { return 4 + 2 * fbm(3, y, 50) + 13 * plateau(y, 109, 9, 6) + 5 * plateau(y, 57, 4, 4); }
  G.riverX = riverX; G.floorW = floorW;

  const R_OLIV = A('Olivares de Pozo Alcón', 0, 0, 0, 0), R_BARR = A('Barranco del Guadalentín', 0, 0, 0, 0), R_CARC = A('Cárcavas del Guadalentín', 0, 0, 0, 0),
    R_LLAN = A('Los Llanos', 0, 0, 0, 0), R_SIER = A('Sierra del Pozo', 0, 0, 0, 0), R_NORTE = A('Tierras del norte', 0, 0, 0, 0), R_EMB = A('Embalse de La Bolera', 0, 0, 0, 0);
  R_CARC.tier = 1.2; R_LLAN.tier = 1.25; R_SIER.tier = 1.5; R_NORTE.tier = 1.5; R_EMB.tier = 1.6;
  function region(x, y) {
    if (y < 30 && x >= 100) return R_EMB;
    if ((x < 62 && y < 84) || (x < 112 && y < 28)) return R_SIER;
    if (y >= 43) {
      const cx = riverX(y), fw = floorW(y), d = x - cx;
      if (Math.abs(d) <= fw + 3) return y < 64 ? R_NORTE : R_BARR;
      if (d > 0) return d <= fw + 28 ? R_CARC : R_LLAN;
    }
    if (y < 64) return R_NORTE;
    return R_OLIV;
  }

  function road(w, pts, width, tile) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
      for (let s = 0; s <= steps; s++) {
        const t = s / steps, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
        for (let dy = 0; dy < width; dy++) for (let dx = 0; dx < width; dx++) {
          const tx = Math.round(x - width / 2 + dx), ty = Math.round(y - width / 2 + dy);
          if (tx < 0 || ty < 0 || tx >= w.w || ty >= w.h) continue;
          const cur = w.get(tx, ty);
          if (T.isWater(cur)) w.set(tx, ty, T.BRIDGE); else if (cur !== T.DAM) w.set(tx, ty, tile);
          reserved[ty * w.w + tx] = 1;
        }
      }
    }
  }
  function sign(w, x, y, text) { const p = w.prop('senal', x, y, x, y, 1, 1); p.id = 'cartel:' + text; reserved[y * OW_W + x] = 1; }
  function clearAround(w, x, y, r) {
    for (let j = y - r; j <= y + r; j++) for (let i = x - r; i <= x + r; i++) { const t = w.get(i, j); if (T.SOLID[t] && t !== T.WATER) w.set(i, j, T.GRASS); reserved[j * OW_W + i] = 1; }
  }
  function npc(w, name, key, tx, ty, dir) { w.npcs.push(new Npc(name, key, Art.people[key], null, null, tx * 16 + 8, ty * 16 + 13, dir)); w.block(tx, ty, 1, 1); }
  function nearWater(w, x, y) { for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (T.isWater(w.get(x + i, y + j))) return true; return false; }

  G.overworld = function () {
    R = RNG(1993);
    G.brambles = []; G.questSpawns = [];
    const w = new World('exterior', OW_W, OW_H, T.GRASS);
    w.outdoor = true;
    reserved = new Uint8Array(OW_W * OW_H);
    // relieve
    for (let y = 0; y < OW_H; y++) for (let x = 0; x < OW_W; x++) {
      const n = fbm(x, y, 1);
      let t = n > 0.62 ? T.DIRT : T.GRASS;
      if (y >= 43) {
        const cx = riverX(y), fw = floorW(y), d = x - cx, wall = 3 + fbm(x, y, 9) * 1.6;
        if (Math.abs(d) <= fw) t = Math.abs(d) < 3.5 ? T.GRASS_GREEN : (n > 0.55 ? T.DIRT : T.GRASS_GREEN);
        else if (Math.abs(d) <= fw + wall) t = T.CLIFF;
        else if (d > 0) {
          const bw = 22 + fbm(1, y, 3) * 8;
          if (d <= fw + wall + bw) t = fbm(x, y, 7) > 0.6 ? T.CLIFF : (n > 0.45 ? T.DIRT : T.GRASS);
          else t = fbm(x * 0.6, y * 0.6, 4) > 0.42 ? T.FIELD : T.GRASS;
        }
      }
      w.set(x, y, t);
    }
    // Sierra del Pozo
    for (let y = 0; y < OW_H; y++) for (let x = 0; x < OW_W; x++) {
      const sierra = (x < 62 && y < 84) || (x < 112 && y < 28);
      if (!sierra) continue;
      const n = fbm(x, y, 21);
      const edge = Math.min(y < 84 && x < 62 ? Math.min(62 - x, 84 - y) : 99, (x < 112 && y < 28) ? Math.min(112 - x, 28 - y) : 99);
      if (n > 0.47 - Math.min(edge, 10) * 0.012 || (x <= 60 && y >= 56 && y <= 72)) w.set(x, y, T.MOUNTAIN);
      else w.set(x, y, n > 0.4 ? T.DIRT : T.GRASS);
    }
    // Embalse
    for (let y = 0; y < 30; y++) for (let x = 100; x < OW_W; x++) {
      let e = Math.pow((x - 170) / 62, 2) + Math.pow((y - 10) / 14, 2);
      e -= (fbm(x, y, 33) - 0.5) * 0.5;
      if (y >= 27 && x >= 140 && x <= 180) e = 0.5;
      if (e < 1) w.set(x, y, e < 0.75 ? T.DEEP : T.WATER); else if (e < 1.12) w.set(x, y, T.SAND);
    }
    // Explanada de la presa
    for (let y = 30; y < 44; y++) for (let x = 140; x < 182; x++) {
      const edge = x < 143 || x > 178 || y >= 43;
      if (y <= 32) w.set(x, y, T.DAM);
      else if (edge && !(x < 143 && y >= 35 && y <= 39)) w.set(x, y, T.CLIFF);
      else w.set(x, y, fbm(x, y, 5) > 0.68 ? T.SAND : T.CONCRETE);
      reserved[y * OW_W + x] = 1;
    }
    G.bossX = 160; G.bossY = 37;
    for (let y = 42; y < 44; y++) for (let x = 158; x <= 161; x++) w.set(x, y, T.WATER);
    for (let x = 146; x <= 176; x += 6) w.prop('compuerta', x, 32);
    // río
    for (let y = 43; y < OW_H; y++) {
      const cx = riverX(y), x0 = Math.round(cx) - 1, ww = 2 + (fbm(0, y, 13) > 0.6 ? 1 : 0);
      for (let x = x0; x < x0 + ww; x++) w.set(x, y, T.WATER);
      if (w.get(x0 - 1, y) === T.GRASS_GREEN && R.next() < 0.4) w.set(x0 - 1, y, T.SAND);
      if (w.get(x0 + ww, y) === T.GRASS_GREEN && R.next() < 0.4) w.set(x0 + ww, y, T.SAND);
    }
    // carreteras
    road(w, [[60, 112], [66, 110], [80, 108], [95, 104], [100, 96], [101, 84], [101, 72], [104, 64], [110, 54], [118, 46], [130, 41], [141, 37]], 3, T.ASPHALT);
    road(w, [[60, 135], [64, 150], [70, 170], [74, 199]], 3, T.ASPHALT);
    road(w, [[16, 130], [8, 146], [0, 166]], 3, T.ASPHALT);
    const rx = G.rx = Math.round(riverX(109));
    const brY = 99;
    road(w, [[100, 101], [112, 102], [124, 100], [136, 99], [rx - 2, 99]], 2, T.TRACK);
    for (let x = rx - 2; x <= rx + 3; x++) for (let y = brY; y <= brY + 1; y++) w.set(x, y, T.isWater(w.get(x, y)) ? T.BRIDGE : T.TRACK);
    for (let x = rx - 2; x <= rx + 1; x++) { if (T.isWater(w.get(x, brY - 1))) w.set(x, brY - 1, T.DRYWALL); if (T.isWater(w.get(x, brY + 2))) w.set(x, brY + 2, T.DRYWALL); }
    for (let y = brY; y <= 110; y++) for (let x = rx + 2; x <= rx + 3; x++) w.set(x, y, T.TRACK);
    road(w, [[66, 120], [80, 124], [96, 130], [112, 132]], 2, T.TRACK);
    road(w, [[68, 96], [80, 92], [92, 86], [100, 86]], 2, T.TRACK);
    road(w, [[70, 140], [90, 150], [110, 156], [125, 160]], 2, T.TRACK);
    for (const py of [132, 160, 182, 76]) {
      const cx = riverX(py);
      for (let x = Math.floor(cx - floorW(py) - 6); x <= Math.floor(cx + floorW(py) + 6); x++) for (let y = py; y <= py + 1; y++) if (w.get(x, y) === T.CLIFF) w.set(x, y, T.TRACK);
    }
    for (const py of [118, 146]) {
      const cx = riverX(py);
      for (let x = Math.floor(cx); x <= Math.floor(cx + floorW(py) + 6); x++) for (let y = py; y <= py + 1; y++) if (w.get(x, y) === T.CLIFF) w.set(x, y, T.TRACK);
    }
    // balsa
    w.fill(104, 103, 6, 4, T.CONCRETE); w.fill(105, 104, 4, 2, T.WATER);
    for (let y = 102; y < 108; y++) for (let x = 103; x < 111; x++) reserved[y * OW_W + x] = 1;

    buildTown(w);
    buildCortijo(w);

    // La Linde Negra
    for (let y = 64; y <= 65; y++) for (let x = 56; x < OW_W; x++) {
      const t = w.get(x, y);
      if (T.isWater(t) || t === T.CLIFF || t === T.MOUNTAIN) continue;
      G.brambles.push([x, y, t]); w.set(x, y, T.BRAMBLE); reserved[y * OW_W + x] = 1;
    }
    G.crossX = 104; G.crossY = 76;
    w.fill(103, 75, 3, 3, T.DIRT);
    w.prop('cruz', G.crossX, G.crossY, G.crossX, G.crossY, 1, 1).id = 'cruz';
    for (let y = 74; y < 79; y++) for (let x = 102; x < 107; x++) reserved[y * OW_W + x] = 1;
    // Bosque Encantado de Las Higueras
    for (let y = 52; y < 63; y++) {
      const cx = riverX(y);
      for (let x = Math.floor(cx - floorW(y)); x <= cx + floorW(y); x++) {
        if (w.get(x, y) === T.GRASS_GREEN || w.get(x, y) === T.DIRT) {
          if (R.next() < 0.16 && !T.isWater(w.get(x, y + 1)) && !T.isWater(w.get(x, y - 1))) { w.prop('higuera' + R.int(2), x, y, x, y, 1, 1); reserved[y * OW_W + x] = 1; }
          else if (R.next() < 0.05) w.prop('higos', x, y);
        }
      }
    }
    {
      const my = 57, mx = Math.round(riverX(57)) + 4;
      w.fill(mx - 2, my - 1, 5, 3, T.GRASS_GREEN);
      w.unblock(mx - 3, my - 2, 7, 5);
      w.props = w.props.filter(p => !(Math.abs(p.x / 16 - mx) < 3.5 && Math.abs(p.y / 16 - my) < 3));
      w.prop('manantial', mx, my, mx - 1, my, 3, 1).id = 'manantial';
      G.springX = mx; G.springY = my;
      w.pickups.push(new Pickup(Pickup.RELIC, (mx + 2) * 16 + 8, (my + 1) * 16 + 8, 'reliquia_higueras'));
      for (let y = my - 2; y <= my + 2; y++) for (let x = mx - 3; x <= mx + 3; x++) reserved[y * OW_W + x] = 1;
    }
    sign(w, 98, 102, 'Camino del Guadalentín. A tu casa, al este, cruzando el puente viejo.');
    sign(w, 70, 106, 'POZO ALCÓN. La pintura del cartel está casi borrada.');
    sign(w, 99, 70, 'A-326  ·  Presa de La Bolera 4 km  ·  Castril');
    sign(w, 139, 41, 'Presa de La Bolera. Alguien ha escrito encima con pintura roja: NO BAJÉIS AL AGUA.');
    w.pickups.push(new Pickup(Pickup.RELIC, 109 * 16 + 8, 106 * 16 + 4, 'reliquia_balsa'));
    w.pickups.push(new Pickup(Pickup.RELIC, 182 * 16 + 8, 152 * 16 + 8, 'reliquia_carcavas'));
    w.pickups.push(new Pickup(Pickup.RELIC, 74 * 16 + 8, 44 * 16 + 8, 'reliquia_sierra'));
    clearAround(w, 182, 152, 1); clearAround(w, 74, 44, 1);
    scatter(w);
    for (let x = 0; x < OW_W; x++) { w.set(x, 0, T.MOUNTAIN); w.set(x, OW_H - 1, T.MOUNTAIN); }
    for (let y = 0; y < OW_H; y++) { w.set(0, y, T.MOUNTAIN); w.set(OW_W - 1, y, T.MOUNTAIN); }
    const cort = A('Cortijo Río Guadalentín', rx - 6, 96, 26, 26); cort.noSpawn = true; w.areas.push(cort);
    const church = A('Iglesia de la Encarnación', 29, 86, 23, 16); church.safe = true; w.areas.push(church);
    w.areas.push(A('Plaza del Ayuntamiento', 42, 112, 11, 7));
    w.areas.push(A('Ermita de Santa Ana', 16, 125, 12, 10));
    w.areas.push(A('Pozo Alcón', 12, 85, 57, 52));
    w.areas.push(A('Cruz de San Gregorio', 97, 70, 12, 11));
    w.areas.push(A('Balsa de riego', 102, 101, 10, 8));
    const presa = A('Presa de La Bolera', 140, 30, 42, 14); presa.noSpawn = true; presa.tier = 1.6; w.areas.push(presa);
    const hig = A('Bosque Encantado de Las Higueras', 135, 50, 40, 14); hig.tier = 1.4; w.areas.push(hig);
    const linde = A('La Linde Negra', 56, 63, 164, 4); linde.noSpawn = true; w.areas.push(linde);
    w.regionFn = region;
    return w;
  };

  function buildTown(w) {
    const hs = [86, 95, 103, 111, 119, 127, 134], vs = [13, 23, 32, 41, 50, 59, 66];
    for (let y = 85; y <= 136; y++) for (let x = 12; x <= 68; x++) { w.set(x, y, T.DIRT); reserved[y * OW_W + x] = 1; }
    for (const h of hs) w.fill(12, h, 57, 2, T.PAVING);
    for (const v of vs) w.fill(v, 85, 2, 52, T.PAVING);
    for (let bi = 0; bi < hs.length - 1; bi++) for (let bj = 0; bj < vs.length - 1; bj++) {
      const y0 = hs[bi] + 2, y1 = hs[bi + 1] - 1, x0 = vs[bj] + 2, x1 = vs[bj + 1] - 1;
      if (x1 < x0 || y1 < y0) continue;
      const cxm = (x0 + x1) >> 1, cym = (y0 + y1) >> 1;
      if (cxm >= 33 && cxm <= 49 && cym < 95) { church(w, x0, y0, x1, y1); continue; }
      if (cxm >= 42 && cxm <= 50 && cym > 111 && cym < 119) { plazaAyto(w, x0, y0, x1, y1); continue; }
      if (cxm < 23 && cym > 127) { ermita(w, x0, y0, x1, y1); continue; }
      houses(w, x0, y0, x1, y1);
    }
    const px0 = 33, px1 = 50, py0 = 95, py1 = 102;
    w.fill(px0, py0, px1 - px0 + 1, py1 - py0 + 1, T.PAVING);
    w.unblock(px0, py0 + 2, px1 - px0 + 1, py1 - py0 - 1);
    w.props = w.props.filter(p => !(p.x / 16 >= px0 && p.x / 16 < px1 + 1 && p.y / 16 >= py0 && p.y / 16 < py1 + 1));
    for (let x = px0; x <= px1; x++) if (x < 40 || x > 41) w.set(x, py1, T.BARRICADE);
    for (let y = py0 + 2; y <= py1; y++) { w.set(px0, y, T.BARRICADE); w.set(px1, y, T.BARRICADE); }
    G.fireX = 41; G.fireY = 98;
    w.prop('barril', 37, 97, 37, 97, 1, 1);
    w.prop('barril', 45, 99, 45, 99, 1, 1);
    const fire = new Prop(Art.campfire[0], G.fireX * 16 + 8, G.fireY * 16 + 15); fire.anim = 1; fire.id = 'hoguera';
    w.props.push(fire); w.block(G.fireX, G.fireY, 1, 1);
    G.priestX = 40; G.priestY = 96;
    w.prop('banco', 35, 99); w.prop('banco', 47, 98);
    npc(w, 'Padre Tomás', 'cura', G.priestX, G.priestY, 0);
    npc(w, 'Remedios', 'curandera', 44, 97, 2);
    npc(w, 'Curro', 'guardia', 43, 100, 0);
    npc(w, 'Lucía', 'mecanica', 35, 97, 3);
    npc(w, 'Dani', 'chaval', 48, 96, 2);
    npc(w, 'Tío Paco', 'abuelo', 36, 100, 1);
    for (let i = 0; i < 26; i++) {
      const h = hs[R.int(hs.length)], x = 14 + R.int(50);
      if (w.get(x, h) !== T.PAVING || w.get(x + 1, h) !== T.PAVING) continue;
      if (x >= 28 && x <= 53 && h === 95) continue;
      if (vs.some(v => x >= v - 1 && x <= v + 2)) continue;
      w.prop('chatarra' + R.int(5), x + 0.5, h, x, h, 2, 1);
    }
    for (let i = 0; i < 6; i++) { const pt = [62 + i * 3, 110 - (i >> 1)]; if (R.next() < 0.6) w.prop('chatarra' + R.int(5), pt[0], pt[1] - 1, pt[0] - 1, pt[1] - 1, 2, 1); }
    for (let i = 0; i < 14; i++) {
      const x = vs[R.int(vs.length)] + (R.bool() ? 0 : 1), y = 88 + R.int(46);
      if (w.get(x, y) === T.PAVING && w.get(x, y - 1) === T.PAVING) w.prop('farola', x, y, x, y, 1, 1);
    }
  }
  function houses(w, x0, y0, x1, y1) {
    let x = x0;
    while (x <= x1) {
      let hw = Math.min(3 + R.int(3), x1 - x + 1);
      if (x1 - (x + hw - 1) < 3) hw = x1 - x + 1;
      const kind = R.int(10);
      if (kind === 0) {
        for (let yy = y0; yy <= y1; yy++) for (let xx = x; xx < x + hw; xx++) w.set(xx, yy, R.next() < 0.35 ? T.WALL_STONE : T.DIRT);
        for (let k = 0; k < 2; k++) w.prop('roca' + R.int(2), x + R.int(hw), y0 + 1 + R.int(Math.max(1, y1 - y0)));
      } else if (kind === 1 && hw >= 3) {
        w.fill(x, y0, hw, y1 - y0 + 1, T.GRASS);
        for (let xx = x; xx < x + hw; xx++) w.set(xx, y1, T.DRYWALL);
        w.prop(R.bool() ? 'olivo' + R.int(3) : 'almendro' + R.int(2), x + (hw >> 1), y0 + 1, x + (hw >> 1), y0 + 1, 1, 1);
      } else {
        const roof = R.int(3) === 0 ? T.ROOF_DARK : T.ROOF;
        for (let yy = y0; yy <= y1 - 2; yy++) for (let xx = x; xx < x + hw; xx++) w.set(xx, yy, roof);
        for (let xx = x; xx < x + hw; xx++) { w.set(xx, y1 - 1, R.next() < 0.45 ? T.WINDOW : T.WALL_WHITE); w.set(xx, y1, R.next() < 0.3 ? T.WINDOW : T.WALL_WHITE); }
        w.set(x + R.int(hw), y1, T.DOOR);
        if (R.next() < 0.2) w.set(x + R.int(hw), y0, T.ROOF_SOLAR);
      }
      x += hw;
    }
    for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) if (w.get(xx, yy) === T.DOOR) w.block(xx, yy, 1, 1);
  }
  function church(w, x0, y0, x1, y1) {
    w.fill(x0, y0, x1 - x0 + 1, y1 - y0 + 1, T.DIRT);
    const cx0 = 34, cx1 = 47;
    for (let y = y0; y <= y1 - 2; y++) for (let x = cx0; x <= cx1; x++) w.set(x, y, T.CHURCH_ROOF);
    for (let x = cx0; x <= cx1; x++) { w.set(x, y1 - 1, T.CHURCH_WALL); w.set(x, y1, T.CHURCH_WALL); }
    w.set(40, y1, T.CHURCH_DOOR); w.set(41, y1, T.CHURCH_DOOR); w.block(40, y1, 2, 1);
    const door = w.prop('compuerta', 40.5, y1); door.hidden = true; door.id = 'puerta_iglesia';
    w.prop('torre', 36, y1, 35, y1 - 2, 3, 3);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) if (x < cx0 || x > cx1) w.set(x, y, T.GRASS);
    w.prop('cipres', 33, y1); w.prop('cipres', 49, y1);
  }
  function plazaAyto(w, x0, y0, x1, y1) {
    w.fill(x0, y0, x1 - x0 + 1, y1 - y0 + 1, T.PAVING);
    const cx = (x0 + x1) >> 1, cy = (y0 + y1) >> 1;
    w.prop('fuente', cx, cy + 1, cx - 1, cy, 3, 2).id = 'fuente_plaza';
    w.prop('banco', x0 + 1, y0 + 1); w.prop('banco', x1 - 1, y1 - 1);
    w.prop('farola', x0, y1, x0, y1, 1, 1); w.prop('farola', x1, y0 + 1, x1, y0 + 1, 1, 1);
    w.prop('maceta', x1, y1, x1, y1, 1, 1);
  }
  function ermita(w, x0, y0, x1, y1) {
    w.fill(x0, y0, x1 - x0 + 1, y1 - y0 + 1, T.GRASS);
    const ex0 = x0 + 1, ex1 = x0 + 5;
    for (let y = y0; y <= y1 - 3; y++) for (let x = ex0; x <= ex1; x++) w.set(x, y, T.CHURCH_ROOF);
    for (let x = ex0; x <= ex1; x++) { w.set(x, y1 - 2, T.CHURCH_WALL); w.set(x, y1 - 1, T.CHURCH_WALL); }
    w.set(ex0 + 2, y1 - 1, T.CHURCH_DOOR); w.block(ex0 + 2, y1 - 1, 1, 1);
    w.prop('cipres', ex1 + 1, y1 - 1);
    w.pickups.push(new Pickup(Pickup.RELIC, (ex0 + 2) * 16 + 8, y1 * 16 + 10, 'reliquia_ermita'));
  }

  function buildCortijo(w) {
    const rx = G.rx, hx0 = rx + 4, hx1 = rx + 12;
    for (let y = 97; y <= 121; y++) for (let x = rx + 2; x <= rx + 18; x++) {
      if (w.get(x, y) === T.CLIFF && x <= rx + 17 && y >= 101 && y <= 119) w.set(x, y, T.DIRT);
      reserved[y * OW_W + x] = 1;
    }
    for (let y = 97; y <= 121; y++) for (let x = rx - 6; x <= rx + 1; x++) reserved[y * OW_W + x] = 1;
    for (let y = 105; y <= 112; y++) for (let x = rx - 4; x <= rx + 1; x++) {
      const dx = (x - (rx - 1.5)) / 3.4, dy = (y - 108.5) / 3.9;
      if (dx * dx + dy * dy < 1) w.set(x, y, dx * dx + dy * dy < 0.35 ? T.DEEP : T.WATER);
    }
    w.fill(hx0 - 2, 108, hx1 - hx0 + 8, 9, T.CONCRETE);
    w.fill(rx + 2, 99, 2, 9, T.TRACK);
    for (let y = 101; y <= 104; y++) for (let x = hx0; x <= hx1; x++) w.set(x, y, T.ROOF);
    w.set(hx0 + 5, 102, T.ROOF_SOLAR); w.set(hx0 + 6, 102, T.ROOF_SOLAR); w.set(hx0 + 2, 103, T.ROOF_SOLAR);
    for (let x = hx0; x <= hx1; x++) { w.set(x, 105, T.WALL_WHITE); w.set(x, 106, T.WALL_WHITE); }
    w.set(hx0 + 1, 105, T.WINDOW); w.set(hx0 + 6, 105, T.WINDOW); w.set(hx1 - 1, 105, T.WINDOW);
    w.set(hx0 + 2, 106, T.WINDOW); w.set(hx1 - 1, 106, T.WINDOW);
    G.doorX = hx0 + 4; G.doorY = 106;
    w.set(G.doorX, G.doorY, T.DOOR);
    for (let y = 103; y <= 104; y++) for (let x = hx1 + 1; x <= hx1 + 4; x++) w.set(x, y, (y === 103 && (x === hx1 + 2 || x === hx1 + 3)) ? T.ROOF_SOLAR : T.ROOF);
    for (let x = hx1 + 1; x <= hx1 + 4; x++) { w.set(x, 105, T.WALL_WHITE); w.set(x, 106, T.WALL_WHITE); }
    w.set(hx1 + 2, 106, T.WINDOW);
    w.fill(hx0, 107, hx1 - hx0 + 1, 2, T.PORCH);
    w.prop('chimenea', hx0 - 0.3, 106, hx0 - 1, 106, 1, 1);
    for (const x of [hx0, hx0 + 3, hx0 + 7]) w.prop('pilar', x, 108, x, 108, 1, 1);
    w.prop('mesaporche', hx0 + 6, 107, hx0 + 5, 107, 2, 1);
    w.prop('radio', hx0 + 9, 107, hx0 + 9, 107, 1, 1).id = 'radio';
    w.prop('tendedero', hx0 + 2, 108);
    w.prop('casetaperro', hx0 + 1.2, 107.2, hx0 + 1, 107, 1, 1).id = 'caseta';
    w.prop('foco_solar', hx0 + 0.5, 104.6);
    w.prop('caseta', hx1 + 4, 113, hx1 + 3, 112, 2, 2);
    w.prop('caseta', hx1 + 4, 116, hx1 + 3, 115, 2, 2);
    w.prop('barbacoa', hx1 + 4, 110, hx1 + 4, 110, 1, 1);
    w.prop('tocon', hx0 + 3, 112); w.prop('tocon', hx0 + 8, 110);
    w.prop('carretilla', hx0 + 5, 114);
    w.prop('sauce', rx + 1, 114, rx, 114, 2, 1);
    w.prop('chopo0', rx - 3, 103, rx - 3, 103, 1, 1);
    w.prop('chopo1', rx - 6, 107, rx - 6, 107, 1, 1);
    w.prop('chopo0', rx - 4, 113, rx - 4, 113, 1, 1);
    w.prop('chopo1', rx + 4, 117, rx + 4, 117, 1, 1);
    w.prop('cipres', hx1 + 1, 108, hx1 + 1, 108, 1, 1);
    w.prop('higuera0', rx + 15, 109, rx + 15, 109, 1, 1);
    w.prop('canas', rx + 2, 110); w.prop('canas', rx - 5, 110);
    w.prop('tractor', rx + 3, 113, rx + 2, 113, 2, 1);
    w.prop('furgo', rx + 6, 118, rx + 5, 118, 2, 1);
    w.prop('todoterreno', rx + 9, 119, rx + 8, 119, 2, 1);
    w.fill(hx0 + 8, 110, 3, 3, T.FIELD);
    w.pickups.push(new Pickup(Pickup.HERB, (hx0 + 8) * 16 + 8, 110 * 16 + 10, null));
    w.pickups.push(new Pickup(Pickup.HERB, (hx0 + 10) * 16 + 8, 112 * 16 + 10, null));
    w.npcs.push(new Npc('Gato', 'gato', null, Art.cat, null, (hx0 + 1) * 16 + 6, 107 * 16 + 6));
    w.npcs.push(new Npc('Perrillo', 'perro', null, Art.dog, Art.dogB, (hx0 + 5) * 16 + 8, 109 * 16 + 12));
    w.block(hx0 + 5, 109, 1, 1);
    w.warps.push(new Warp(G.doorX, G.doorY, 1, 1, 'casa_baja', 17.5 * 16, 11 * 16 + 4, 1));
    G.questSpawns = [[rx - 3, 116], [rx + 1, 119], [rx + 7, 120], [rx - 4, 101], [rx + 12, 118], [rx - 6, 117]];
  }

  function scatter(w) {
    const r = RNG(77);
    for (let y = 1; y < OW_H - 1; y++) for (let x = 1; x < OW_W - 1; x++) {
      if (reserved[y * OW_W + x] || w.blk[y * OW_W + x]) continue;
      const t = w.get(x, y);
      if (T.SOLID[t]) continue;
      const sierra = (x < 62 && y < 84) || (x < 112 && y < 28);
      const reg = region(x, y), n = fbm(x, y, 41);
      if (sierra) { if (r.next() < 0.22) w.prop('pino' + r.int(3), x, y, x, y, 1, 1); continue; }
      if (reg === R_BARR || (reg === R_NORTE && Math.abs(x - riverX(y)) <= floorW(y))) {
        const dr = Math.abs(x - riverX(y));
        if (dr < 4 && r.next() < 0.07 && !nearWater(w, x, y)) w.prop('chopo' + r.int(2), x, y, x, y, 1, 1);
        else if (dr < 3 && r.next() < 0.08) w.prop('canas', x, y);
        else if (r.next() < 0.025) w.prop('sauce', x, y, x, y, 1, 1);
        else if (r.next() < 0.03) w.prop('retama' + r.int(3), x, y, x, y, 1, 1);
        continue;
      }
      if (reg === R_CARC) {
        if (r.next() < 0.07) w.prop('retama' + r.int(3), x, y, x, y, 1, 1);
        else if (r.next() < 0.03) w.prop('roca' + r.int(2), x, y, x, y, 1, 1);
        else if (r.next() < 0.015) w.prop('pino' + r.int(3), x, y, x, y, 1, 1);
        continue;
      }
      if (reg === R_LLAN) {
        if (t === T.GRASS && x % 4 === 0 && y % 4 === 2 && fbm(x, y, 8) > 0.45 && r.next() < 0.8) w.prop('almendro' + r.int(2), x, y, x, y, 1, 1);
        else if (r.next() < 0.01) w.prop('retama' + r.int(3), x, y, x, y, 1, 1);
        continue;
      }
      const grove = fbm(x * 0.7, y * 0.7, 12) > 0.36;
      if (grove && x % 3 === 0 && y % 3 === 1) { if (r.next() < 0.92) w.prop('olivo' + r.int(3), x, y, x, y, 1, 1); }
      else if (!grove && n > 0.62 && r.next() < 0.12) w.prop('pino' + r.int(3), x, y, x, y, 1, 1);
      else if (!grove && r.next() < 0.02) w.prop('retama' + r.int(3), x, y, x, y, 1, 1);
      else if (r.next() < 0.004) w.pickups.push(new Pickup(Pickup.HERB, x * 16 + 8, y * 16 + 10, null));
    }
  }

  function wallFace(w, x0, x1, y, hi, lo) { for (let x = x0; x <= x1; x++) { w.set(x, y, hi); w.set(x, y + 1, lo); } }

  G.houseGround = function () {
    const w = new World('casa_baja', 22, 13, T.FLOOR);
    w.defaultArea = 'Cortijo · planta baja';
    const a = A('Cortijo · planta baja', 0, 0, 22, 13); a.safe = true; w.areas.push(a);
    w.fill(0, 0, 22, 1, T.WALLTOP);
    wallFace(w, 1, 20, 1, T.IWALL_HI, T.IWALL);
    for (let y = 0; y < 13; y++) { w.set(0, y, T.WALLTOP); w.set(21, y, T.WALLTOP); }
    w.fill(0, 12, 22, 1, T.WALLTOP);
    w.set(17, 12, T.FLOOR);
    w.fill(10, 1, 2, 3, T.IWALL_STONE);
    w.fill(1, 8, 2, 3, T.STAIRS);
    w.warps.push(new Warp(1, 8, 2, 1, 'casa_alta', 15 * 16, 11 * 16 + 8, 0));
    w.warps.push(new Warp(17, 12, 1, 1, 'exterior', G.doorX * 16 + 8, (G.doorY + 1) * 16 + 8, 0));
    w.wall('ventana_int', 4 * 16, 2 * 16 - 2);
    w.wall('aplique', 7 * 16 + 8, 16 + 4);
    w.prop('encimera', 1, 3, 1, 3, 1, 1); w.prop('fregadero', 2, 3, 2, 3, 1, 1); w.prop('encimera', 3, 3, 3, 3, 1, 1); w.prop('encimera', 4, 3, 4, 3, 1, 1);
    w.prop('frigo', 8.5, 3, 8, 3, 2, 1);
    w.prop('maceta', 6, 3, 6, 3, 1, 1);
    w.prop('mesa_larga', 5.5, 7, 3, 6, 6, 2).id = 'mesa_cocina';
    w.prop('garrafa', 9, 9, 9, 9, 1, 1);
    w.wall('ventana_int', 14 * 16, 2 * 16 - 2);
    w.wall('tele', 17 * 16 + 8, 2 * 16);
    w.wall('aplique', 20 * 16, 16 + 4);
    w.prop('estufa', 12.5, 3, 12, 3, 2, 1).id = 'estufa';
    w.prop('mesa_camilla', 17.5, 7, 16, 6, 3, 1);
    w.prop('sofa_n', 17.5, 9, 16, 9, 3, 1);
    w.prop('butaca', 20, 6, 20, 6, 1, 1);
    w.prop('silla', 15, 3, 15, 3, 1, 1); w.prop('silla', 19, 3, 19, 3, 1, 1);
    w.prop('mesa_oscura', 13, 10, 12, 10, 2, 1);
    w.prop('columna', 11, 7, 10, 7, 2, 1);
    return w;
  };

  G.houseUpper = function () {
    const w = new World('casa_alta', 30, 16, T.FLOOR);
    w.defaultArea = 'Cortijo · planta alta';
    const a = A('Cortijo · planta alta', 0, 0, 30, 16); a.safe = true; w.areas.push(a);
    w.fill(0, 0, 30, 1, T.WALLTOP); w.fill(0, 15, 30, 1, T.WALLTOP);
    for (let y = 0; y < 16; y++) { w.set(0, y, T.WALLTOP); w.set(29, y, T.WALLTOP); w.set(12, y, T.WALLTOP); w.set(18, y, T.WALLTOP); }
    wallFace(w, 1, 11, 1, T.IWALL_HI, T.IWALL); wallFace(w, 13, 17, 1, T.IWALL_HI, T.IWALL); wallFace(w, 19, 28, 1, T.BATHWALL, T.BATHWALL);
    w.fill(1, 8, 11, 1, T.WALLTOP); w.fill(19, 8, 10, 1, T.WALLTOP);
    w.fill(1, 9, 11, 1, T.IWALL); w.fill(19, 9, 10, 1, T.IWALL);
    w.fill(19, 3, 10, 5, T.BATHFLOOR);
    w.set(12, 5, T.FLOOR); w.set(12, 12, T.FLOOR); w.set(18, 5, T.FLOOR); w.set(18, 12, T.FLOOR);
    w.fill(14, 12, 2, 3, T.STAIRS);
    w.warps.push(new Warp(14, 14, 2, 1, 'casa_baja', 2 * 16, 11 * 16 + 10, 0));
    w.wall('ventana_int', 2 * 16 + 8, 2 * 16 - 2);
    w.wall('aplique', 7 * 16, 16 + 4); w.wall('aplique', 10 * 16 + 8, 16 + 4);
    w.prop('escritorio', 3, 3, 2, 3, 2, 1).id = 'pc';
    w.prop('silla_oficina', 3, 4.6);
    w.prop('ventilador', 1, 5, 1, 5, 1, 1);
    w.prop('cama_gris', 5.5, 6, 5, 4, 2, 3).id = 'cama';
    w.prop('mesita', 7, 3.6, 7, 3, 1, 1);
    w.prop('cama_lila', 8.5, 6, 8, 4, 2, 3);
    w.wall('ventana_int', 7 * 16 + 8, 9 * 16 + 8);
    w.prop('cama_blanca', 3.5, 13, 3, 11, 2, 3);
    w.prop('mesita', 1, 10.8, 1, 10, 1, 1); w.prop('flexo', 1, 10.2);
    w.prop('comoda_clara', 8.5, 10.6, 8, 10, 2, 1);
    w.prop('garrafa', 1, 14, 1, 14, 1, 1);
    w.wall('aplique', 15 * 16, 16 + 4);
    w.prop('baul', 15.5, 3.6, 14, 3, 3, 1).id = 'baul';
    w.prop('toallas', 14.5, 3.0);
    w.prop('cubo', 17, 7, 17, 7, 1, 1);
    w.prop('comoda', 13.5, 9, 13, 9, 2, 1);
    w.wall('aplique', 27 * 16, 16 + 4);
    w.prop('lavabo', 20.5, 3.4, 20, 3, 2, 1); w.prop('vater', 23, 3, 23, 3, 1, 1); w.prop('bide', 24.5, 4.5, 24, 4, 1, 1);
    w.prop('ducha', 27.5, 4, 27, 3, 2, 2); w.prop('mueble_bano', 28, 7, 28, 6, 1, 2);
    w.wall('cuadro', 26 * 16, 9 * 16 + 14); w.wall('ventana_int', 22 * 16, 9 * 16 + 8);
    w.prop('cama_rosa', 21.5, 13, 21, 11, 2, 3);
    w.prop('mesita', 19.5, 10.8, 19, 10, 1, 1); w.prop('mesita', 23.5, 10.8, 23, 10, 1, 1);
    return w;
  };
  return G;
})();
