'use strict';
// ====================================================================== utilidades de pixel art
const TS = 16, VW = 400, VH = 225, WW = 288, WH = 162; // VW×VH: interfaz · WW×WH: lo que ve la cámara del mundo (más cerca)

function RNG(seed) {
  let s = (seed | 0) || 1;
  const f = () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next: f,
    int: n => Math.floor(f() * n),
    bool: () => f() < 0.5,
    gauss: () => { let u = 0, v = 0; while (!u) u = f(); while (!v) v = f(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  };
}

const Px = {
  img(w, h) { return { w, h, d: new Uint32Array(w * h), c: null, t: null }; },
  p(b, x, y, c) { x = Math.floor(x); y = Math.floor(y); if (x >= 0 && y >= 0 && x < b.w && y < b.h) b.d[y * b.w + x] = (0xff000000 | c) >>> 0; },
  pa(b, x, y, argb) { x = Math.floor(x); y = Math.floor(y); if (x >= 0 && y >= 0 && x < b.w && y < b.h) b.d[y * b.w + x] = argb >>> 0; },
  op(b, x, y) { if (x < 0 || y < 0 || x >= b.w || y >= b.h) return false; return (b.d[y * b.w + x] >>> 24) > 0; },
  r(b, x, y, w, h, c) { x = Math.floor(x); y = Math.floor(y); for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) Px.p(b, i, j, c); },
  ov(b, cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) Px.p(b, x, y, c);
    }
  },
  ova(b, cx, cy, rx, ry, argb) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) Px.pa(b, x, y, argb);
    }
  },
  line(b, x0, y0, x1, y1, c) {
    x0 = Math.floor(x0); y0 = Math.floor(y0); x1 = Math.floor(x1); y1 = Math.floor(y1);
    let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
    for (let k = 0; k < 400; k++) {
      Px.p(b, x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  },
  speck(b, x, y, w, h, c, dens, R) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (R.next() < dens) Px.p(b, i, j, c); },
  outline(b, c) {
    const mark = [];
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
      if (Px.op(b, x, y)) continue;
      if (Px.op(b, x - 1, y) || Px.op(b, x + 1, y) || Px.op(b, x, y - 1) || Px.op(b, x, y + 1)) mark.push(y * b.w + x);
    }
    for (const i of mark) b.d[i] = (0xff000000 | c) >>> 0;
  },
  shade(c, f) {
    const r = Math.max(0, Math.min(255, ((c >> 16) & 255) * f)) | 0, g = Math.max(0, Math.min(255, ((c >> 8) & 255) * f)) | 0, bl = Math.max(0, Math.min(255, (c & 255) * f)) | 0;
    return (r << 16) | (g << 8) | bl;
  },
  mix(a, b, t) {
    const r = (((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t) | 0, g = (((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t) | 0, bl = ((a & 255) * (1 - t) + (b & 255) * t) | 0;
    return (r << 16) | (g << 8) | bl;
  },
  flipH(s) { const d = Px.img(s.w, s.h); for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) d.d[y * s.w + (s.w - 1 - x)] = s.d[y * s.w + x]; return d; },
  flipV(s) { const d = Px.img(s.w, s.h); for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) d.d[(s.h - 1 - y) * s.w + x] = s.d[y * s.w + x]; return d; },
  rot90(s) { const d = Px.img(s.h, s.w); for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) d.d[x * d.w + (s.h - 1 - y)] = s.d[y * s.w + x]; return d; },
  copy(s) { const d = Px.img(s.w, s.h); d.d.set(s.d); return d; },
  tint(s, c) { const d = Px.img(s.w, s.h); for (let i = 0; i < s.d.length; i++) { const a = s.d[i] >>> 24; if (a > 0) d.d[i] = ((a << 24) | c) >>> 0; } return d; },
  over(dst, src) { // dibuja src encima de dst (mismo tamaño)
    for (let i = 0; i < src.d.length; i++) {
      const v = src.d[i], a = v >>> 24;
      if (a === 255) dst.d[i] = v; else if (a > 0) {
        const o = dst.d[i], t = a / 255;
        dst.d[i] = ((Math.max(o >>> 24, a) << 24) | Px.mix(o & 0xffffff, v & 0xffffff, t)) >>> 0;
      }
    }
  },
  /** Da volumen a un sprite plano: borde izquierdo/superior de cada zona más claro, derecho/inferior más oscuro. */
  autoShade(b) {
    const W = b.w, H = b.h, src = new Uint32Array(b.d);
    const col = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : src[y * W + x];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = src[y * W + x]; if ((v >>> 24) === 0) continue;
      const c = v & 0xffffff;
      const diff = n => (n >>> 24) === 0 || (n & 0xffffff) !== c;
      let f = 1;
      if (diff(col(x + 1, y))) f *= 0.84; if (diff(col(x, y + 1))) f *= 0.88;
      if (diff(col(x - 1, y))) f *= 1.1; if (diff(col(x, y - 1))) f *= 1.08;
      if (f !== 1) b.d[y * W + x] = (0xff000000 | Px.shade(c, f)) >>> 0;
    }
  },
  /** Contorno teñido: cada píxel de borde toma el color vecino muy oscurecido (en vez de negro puro). */
  outlineTint(b, k = 0.32) {
    const W = b.w, H = b.h, mark = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (Px.op(b, x, y)) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (Px.op(b, x + dx, y + dy)) { mark.push([x, y, b.d[(y + dy) * W + x + dx] & 0xffffff]); break; }
    }
    for (const [x, y, c] of mark) b.d[y * W + x] = (0xff000000 | Px.shade(Px.mix(c, 0x140c10, 0.55), k * 2)) >>> 0;
  },
  voronoi(b, x0, y0, w, h, n, cols, border, R) {
    const sx = [], sy = [], cc = [];
    for (let i = 0; i < n; i++) { sx.push(R.next() * w); sy.push(R.next() * h); cc.push(cols[R.int(cols.length)]); }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let best = 1e9, second = 1e9, bi = 0;
      for (let i = 0; i < n; i++) {
        let dx = Math.abs(x + 0.5 - sx[i]); dx = Math.min(dx, w - dx);
        let dy = Math.abs(y + 0.5 - sy[i]); dy = Math.min(dy, h - dy);
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < best) { second = best; best = d; bi = i; } else if (d < second) second = d;
      }
      Px.p(b, x0 + x, y0 + y, (second - best) < 0.9 ? border : cc[bi]);
    }
  },
};

/** Convierte una imagen de píxeles en un canvas (con caché). */
function cv(b) {
  if (b.c) return b.c;
  const c = document.createElement('canvas');
  c.width = b.w; c.height = b.h;
  const x = c.getContext('2d');
  const id = x.createImageData(b.w, b.h);
  const u = new Uint32Array(id.data.buffer);
  for (let i = 0; i < b.d.length; i++) {
    const v = b.d[i];
    u[i] = (((v >>> 24) << 24) | ((v & 255) << 16) | (((v >> 8) & 255) << 8) | ((v >> 16) & 255)) >>> 0;
  }
  x.putImageData(id, 0, 0);
  b.c = c;
  return c;
}
function white(b) { if (!b.t) b.t = Px.tint(b, 0xffffff); return b.t; }
function css(c, a) { return a === undefined ? '#' + (c & 0xffffff).toString(16).padStart(6, '0') : `rgba(${(c >> 16) & 255},${(c >> 8) & 255},${c & 255},${a})`; }
