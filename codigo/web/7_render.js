// ====================================================================== dibujo
const view = document.createElement('canvas'); view.width = WW; view.height = WH;
const vctx = view.getContext('2d');
const darkC = document.createElement('canvas'); darkC.width = WW; darkC.height = WH;
const dctx = darkC.getContext('2d');
vctx.imageSmoothingEnabled = false;
G.layout = { ox: 0, oy: 0, sc: 1 };

G.buildMap = function (ow) {
  const c = document.createElement('canvas'); c.width = ow.w; c.height = ow.h;
  const x = c.getContext('2d'), id = x.createImageData(ow.w, ow.h);
  const put = (i, col) => { id.data[i * 4] = (col >> 16) & 255; id.data[i * 4 + 1] = (col >> 8) & 255; id.data[i * 4 + 2] = col & 255; id.data[i * 4 + 3] = 255; };
  for (let i = 0; i < ow.w * ow.h; i++) put(i, Art.tileColor[ow.t[i]]);
  for (const p of ow.props) {
    const tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS);
    if (tx >= 0 && ty >= 0 && tx < ow.w && ty < ow.h && p.img.h > 18 && !p.hidden) put(ty * ow.w + tx, Px.shade(Art.tileColor[ow.get(tx, ty)], 0.62));
  }
  x.putImageData(id, 0, 0);
  return c;
};

G.render = function (ctx, cw, ch, dpr) {
  vctx.imageSmoothingEnabled = false;
  if (this.st === ST.TITLE || (this.st === ST.HELP && this.helpBack !== ST.PAUSE)) this.renderTitleBg(vctx);
  else if (this.st === ST.INTRO || this.st === ST.END || this.st === ST.CINE) { vctx.fillStyle = '#08060a'; vctx.fillRect(0, 0, WW, WH); this.embers(vctx); }
  else this.renderWorld(vctx);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, cw * dpr, ch * dpr);
  let sc = Math.min(cw / VW, ch / VH);
  const isc = Math.floor(sc * dpr) / dpr;
  if (isc >= 1 && sc - isc < 0.25 && !G.touch) sc = isc;
  const dw = VW * sc, dh = VH * sc, ox = (cw - dw) / 2, oy = (ch - dh) / 2;
  this.layout = { ox, oy, sc };
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(view, Math.round(ox * dpr), Math.round(oy * dpr), Math.round(dw * dpr), Math.round(dh * dpr));
  ctx.setTransform(sc * dpr, 0, 0, sc * dpr, ox * dpr, oy * dpr);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.clip();
  ctx.imageSmoothingEnabled = false;
  this.menuRects = [];
  switch (this.st) {
    case ST.TITLE: this.uiTitle(ctx); break;
    case ST.HELP: this.uiHelp(ctx); break;
    case ST.CINE: this.renderCine(ctx); break;
    case ST.INTRO: this.uiStory(ctx, this.introPages[this.introIdx], this.introChars); break;
    case ST.END: this.uiStory(ctx, this.endPages[this.endIdx], this.introChars); break;
    default:
      this.uiHud(ctx);
      if (this.st === ST.DIALOG) this.uiDialog(ctx);
      if (this.st === ST.MAP) this.uiMap(ctx);
      if (this.st === ST.PAUSE) this.uiPause(ctx);
      if (this.st === ST.DEAD) this.uiDead(ctx);
      if (this.st === ST.SKILLS) this.uiSkills(ctx);
  }
  if (this.toastT > 0 && this.st !== ST.TITLE) this.uiToast(ctx);
  ctx.restore();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (G.touch) Touch.draw(ctx, cw, ch);
};

G.renderWorld = function (g) {
  const p = this.player, w = this.world;
  this.camX += (p.x - WW / 2 - this.camX) * 0.18; this.camY += (p.y - 10 - WH / 2 - this.camY) * 0.18;
  this.clampCam();
  let cx = Math.round(this.camX), cy = Math.round(this.camY);
  if (this.shakeT > 0) { cx += this.rnd.int(5) - 2; cy += this.rnd.int(5) - 2; }
  g.fillStyle = '#0b0907'; g.fillRect(0, 0, WW, WH);
  const frame = Math.floor(this.clock * 3), tx0 = Math.floor(cx / TS), ty0 = Math.floor(cy / TS);
  for (let y = ty0; y <= ty0 + Math.ceil(WH / TS) + 1; y++) for (let x = tx0; x <= tx0 + Math.ceil(WW / TS) + 1; x++) {
    if (x < 0 || y < 0 || x >= w.w || y >= w.h) continue;
    const t = w.get(x, y), sx = x * TS - cx, sy = y * TS - cy;
    g.drawImage(cv(Art.tile(t, x, y, frame)), sx, sy);
    this.edgeDetail(g, t, x, y, sx, sy);
  }
  for (const d of w.decor) g.drawImage(cv(d.img), Math.floor(d.x) - cx, Math.floor(d.y) - cy);
  const list = [];
  for (const pr of w.props) {
    if (pr.hidden) continue;
    const l = pr.left() - cx, tp = pr.top() - cy;
    if (l > WW || tp > WH || l + pr.img.w < 0 || tp + pr.img.h < 0) continue;
    list.push([pr.y, 0, pr]);
  }
  for (const m of w.monsters) if (!m.dead && Math.abs(m.x - cx - WW / 2) < WW && Math.abs(m.y - cy - WH / 2) < WH) list.push([m.y, 1, m]);
  for (const n of w.npcs) list.push([n.y, 2, n]);
  for (const k of w.pickups) if (Math.abs(k.x - cx - WW / 2) < WW && Math.abs(k.y - cy - WH / 2) < WH) list.push([k.y - 4, 3, k]);
  list.push([p.y, 4, p]);
  list.sort((a, b) => a[0] - b[0]);
  for (const [, kind, e] of list) {
    if (kind === 0) g.drawImage(cv(e.img), e.left() - cx, e.top() - cy);
    else if (kind === 1) this.drawMonster(g, e, cx, cy);
    else if (kind === 2) { const s = e.sprite(this.clock); this.shadow(g, e.x - cx, e.y - cy, s.w / 2.5); g.drawImage(cv(s), Math.round(e.x - s.w / 2) - cx, Math.round(e.y - s.h) - cy); }
    else if (kind === 3) {
      const s = e.type === Pickup.RELIC ? Art.relic : Art.herb, bob = Math.sin(e.t * 3 + e.x) * 2;
      this.shadow(g, e.x - cx, e.y - cy, 4);
      if (e.type === Pickup.RELIC) this.glow(g, e.x - cx, e.y - 8 - cy, 14, 'rgba(255,220,120,0.28)');
      g.drawImage(cv(s), Math.floor(e.x - s.w / 2) - cx, Math.floor(e.y - s.h - 2 + bob) - cy);
    } else this.drawPlayer(g, cx, cy);
  }
  this.drawCombatFx(g, cx, cy);
  for (const o of this.orbs) { const im = o.mud ? Art.E.mud : Art.orb; g.drawImage(cv(im), Math.floor(o.x) - (im.w >> 1) - cx, Math.floor(o.y) - (im.h >> 1) - cy); }
  for (const f of this.fx) {
    const a = Math.max(0, Math.min(1, f.life / f.max));
    if (f.ring) {
      const r = f.radius * (1 - a * a);
      g.strokeStyle = css(f.color, 0.8 * a); g.lineWidth = 2;
      g.beginPath(); g.ellipse(f.x - cx, f.y - cy, Math.max(0.1, r), Math.max(0.1, r * 0.6), 0, 0, Math.PI * 2); g.stroke();
    } else if (!f.text) {
      g.fillStyle = css(f.color, a);
      const s = a > 0.6 ? 2 : 1;
      g.fillRect(Math.floor(f.x) - cx, Math.floor(f.y) - cy, s, s);
    }
  }
  const dk = Math.min(0.84, this.darkness() + this.stormDark());
  if (dk > 0.01) this.nightOverlay(g, dk, cx, cy);
  this.drawWeather(g);
  if (w.outdoor && this.stage >= 6) {
    const gx = WG.crossX * TS + 8 - cx, gy = WG.crossY * TS - 8 - cy;
    if (gx > -60 && gx < WW + 60 && gy > -60 && gy < WH + 60) this.glow(g, gx, gy, 26 + Math.sin(this.clock * 2) * 3, 'rgba(255,230,150,0.24)');
  }
  if (p.invul > 0.6) { g.fillStyle = `rgba(160,20,10,${0.35 * (p.invul - 0.6) / 0.3})`; g.fillRect(0, 0, WW, WH); }
  // flecha hacia el objetivo
  const tgt = this.objectiveTarget();
  if (tgt && w.outdoor && this.st === ST.PLAY) {
    const ox2 = tgt[0] * TS + 8 - cx, oy2 = tgt[1] * TS + 8 - cy;
    if (ox2 < 8 || ox2 > WW - 8 || oy2 < 8 || oy2 > WH - 8) {
      const ang = Math.atan2(oy2 - WH / 2, ox2 - WW / 2);
      let ex = WW / 2 + Math.cos(ang) * (WW / 2 - 14), ey = WH / 2 + Math.sin(ang) * (WH / 2 - 14);
      ex = Math.max(10, Math.min(WW - 10, ex)); ey = Math.max(30, Math.min(WH - 10, ey));
      g.fillStyle = `rgba(255,214,110,${(140 + Math.sin(this.clock * 5) * 80) / 255})`;
      g.beginPath();
      g.moveTo(ex + Math.cos(ang) * 6, ey + Math.sin(ang) * 6);
      g.lineTo(ex + Math.cos(ang + 2.4) * 5, ey + Math.sin(ang + 2.4) * 5);
      g.lineTo(ex + Math.cos(ang - 2.4) * 5, ey + Math.sin(ang - 2.4) * 5);
      g.fill();
    }
  }
};

const ROOFS = new Set([T.ROOF, T.ROOF_DARK, T.ROOF_SOLAR, T.CHURCH_ROOF]);
const FACES = new Set([T.WALL_WHITE, T.WINDOW, T.DOOR, T.CHURCH_WALL, T.CHURCH_DOOR, T.SHED, T.WALL_STONE, T.DAM, T.IWALL, T.IWALL_STONE, T.BATHWALL, T.WALLTOP, T.GARAGE, T.PRETIL]);
G.edgeDetail = function (g, t, x, y, sx, sy) {
  const w = this.world;
  if (T.isWater(t)) {
    const up = w.get(x, y - 1);
    if (!T.isWater(up) && up !== T.BRIDGE) { g.fillStyle = '#2a6a66'; g.fillRect(sx, sy, TS, 2); g.fillStyle = '#a8e4dc'; g.fillRect(sx, sy + 2, TS, 1); }
    g.fillStyle = '#9ad8d0';
    if (!T.isWater(w.get(x - 1, y))) g.fillRect(sx, sy, 1, TS);
    if (!T.isWater(w.get(x + 1, y))) g.fillRect(sx + TS - 1, sy, 1, TS);
    if (!T.isWater(w.get(x, y + 1))) { g.fillStyle = '#b8ece4'; g.fillRect(sx, sy + TS - 1, TS, 1); }
  } else if (t === T.CLIFF || t === T.MOUNTAIN) {
    const below = w.get(x, y + 1);
    if (below !== t && !T.isWater(below)) { g.fillStyle = 'rgba(0,0,0,0.27)'; g.fillRect(sx, sy + TS - 4, TS, 4); g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(sx, sy + TS, TS, 3); }
    const above = w.get(x, y - 1);
    if (above !== t && above !== T.VOID) { g.fillStyle = 'rgba(255,255,240,0.2)'; g.fillRect(sx, sy, TS, 2); }
  } else if (ROOFS.has(t)) {
    if (!ROOFS.has(w.get(x, y - 1))) { g.fillStyle = '#e89a74'; g.fillRect(sx, sy, TS, 1); g.fillStyle = '#7a3220'; g.fillRect(sx, sy + 1, TS, 1); }
    if (!ROOFS.has(w.get(x, y + 1))) { g.fillStyle = '#5a2416'; g.fillRect(sx, sy + TS - 2, TS, 2); }
  } else if (!T.SOLID[t]) {
    if (FACES.has(w.get(x, y - 1))) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(sx, sy, TS, 4); }
  }
  if (t === T.WALL_WHITE || t === T.WINDOW) {
    const below = w.get(x, y + 1);
    if (below === T.WALL_WHITE || below === T.WINDOW || below === T.DOOR) { g.fillStyle = '#f2eee6'; g.fillRect(sx, sy + 12, TS, 4); g.fillStyle = '#e5dfd3'; g.fillRect(sx + 3, sy + 13, 1, 1); }
  }
};
G.shadow = function (g, x, y, r) { if (r <= 0) return; g.fillStyle = 'rgba(0,0,0,0.27)'; g.beginPath(); g.ellipse(x, y, r, r * 0.4 + 0.5, 0, 0, Math.PI * 2); g.fill(); };
G.glow = function (g, x, y, r, col) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, col); gr.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
};
G.drawMonster = function (g, m, cx, cy) {
  const s = m.sprite();
  if (!m.ownShadow() && m.kind !== MK.BESTIA && !(m.kind === MK.AHOGADO && m.submerged)) this.shadow(g, m.x - cx, m.y - cy, s.w / 3);
  let alpha = 1;
  if (m.kind === MK.SOMBRA) alpha = 0.72 + 0.14 * Math.sin(m.anim * 4) + (m.state === 'wind' || m.state === 'atk' ? 0.15 : 0);
  if (m.spawnFade > 0) alpha *= Math.max(0, 1 - m.spawnFade / 0.6);
  g.globalAlpha = Math.max(0, Math.min(1, alpha));
  const bob = m.kind === MK.SOMBRA ? Math.sin(m.anim * 3) * 2 - 4 : 0;
  const shake = m.state === 'wind' && m.kind !== MK.SOMBRA ? Math.round(Math.sin(m.anim * 60)) : 0;
  const sx = Math.round(m.x - s.w / 2) - cx + shake;
  let sy = Math.round(m.y - s.h + 2 + bob) - cy;
  if (m.kind === MK.BESTIA) sy += 6;
  if (m.kind === MK.AHOGADO) sy += m.submerged ? 2 : 4;
  g.drawImage(cv(s), sx, sy);
  g.globalAlpha = 1;
  if (m.kind === MK.AHOGADO) { // ondas en el agua
    g.strokeStyle = 'rgba(200,245,240,0.55)'; g.lineWidth = 1;
    const r = 6 + (m.anim * 6) % 5;
    g.beginPath(); g.ellipse(m.x - cx, m.y - cy + (m.submerged ? -10 : 0), r + 3, r * 0.35 + 1, 0, 0, Math.PI * 2); g.stroke();
  }
  // aviso: "!" encima mientras prepara el ataque
  if (m.state === 'wind') {
    const t = 1 - m.stT / m.st.wind, a = cv(Art.E.alert);
    g.globalAlpha = 0.6 + 0.4 * Math.sin(this.clock * 30);
    g.drawImage(a, Math.round(m.x - 3) - cx, sy - 13 - Math.round(t * 2));
    g.globalAlpha = 1;
    if (m.kind === MK.JABALI) { // marca la línea de embestida
      g.strokeStyle = `rgba(255,70,40,${0.25 + 0.35 * t})`; g.lineWidth = 2; g.setLineDash([3, 3]);
      g.beginPath(); g.moveTo(m.x - cx, m.y - cy - 3); g.lineTo(m.x - cx + m.ax * 90, m.y - cy - 3 + m.ay * 90); g.stroke(); g.setLineDash([]);
    }
    if (m.kind === MK.HUECO || m.kind === MK.SOMBRA) {
      g.fillStyle = `rgba(255,60,40,${0.12 + 0.2 * t})`;
      g.beginPath(); g.arc(m.x + m.ax * 13 - cx, m.y - 6 + m.ay * 13 - cy, 15, 0, Math.PI * 2); g.fill();
    }
  }
  if (m.state === 'stun') { // aturdido: estrellitas
    for (let i = 0; i < 3; i++) { const a = this.clock * 6 + i * 2.1; g.fillStyle = '#ffe080'; g.fillRect(Math.round(m.x - cx + Math.cos(a) * 7), Math.round(sy - 3 + Math.sin(a) * 2), 2, 2); }
  }
  if (m.hp < m.maxHp && m.kind !== MK.BESTIA) {
    const bw = Math.max(16, s.w - 8), bx = Math.floor(m.x) - cx - bw / 2, by = sy - 4;
    g.fillStyle = '#140a0a'; g.fillRect(bx - 1, by - 1, bw + 2, 4);
    g.fillStyle = '#be281e'; g.fillRect(bx, by, Math.floor(bw * Math.max(0, m.hp) / m.maxHp), 2);
  }
};
G.drawPlayer = function (g, cx, cy) {
  const p = this.player;
  if (p.dead && this.deadT > 0.5) return;
  if (p.invul > 0 && !p.rolling && Math.floor(p.invul * 20) % 2 === 0 && !p.dead) return;
  const attacking = p.atkT > 0 && p.hasSword;
  const s = attacking ? Art.heroAtk[p.dir] : Art.hero[p.dir][p.moving ? 1 + Math.floor(p.anim * 7) % 2 : 0];
  const sx = Math.round(p.x - 8) - cx, sy = Math.round(p.y - 23) - cy;
  this.shadow(g, p.x - cx, p.y - cy, 6);
  if (p.prayT > 0) this.glow(g, p.x - cx, p.y - 10 - cy, 22, `rgba(255,230,150,${0.43 * p.prayT})`);
  // espada a la espalda: en diagonal, empuñadura asomando por encima del hombro
  const back = p.hasSword && !attacking && !p.rolling && p.spinT <= 0;
  const backSword = () => {
    const off = [0, 0, 2, -2][p.dir], tilt = [-0.62, 0.62, 0.55, -0.55][p.dir];
    g.save(); g.translate(p.x - cx + off + (p.dir === 0 ? 3 : 0), p.y - (p.dir === 0 ? 18 : 13) - cy); g.rotate(Math.PI + tilt);
    g.drawImage(cv(Art.sword), -2.5, -8, 5, 15); g.restore();
  };
  if (back && p.dir !== 1) backSword();
  if (attacking && p.dir === 1) this.drawSwing(g, cx, cy);
  if (p.spinT > 0) this.drawSpin(g, cx, cy, true);
  if (p.rolling) { g.save(); g.translate(sx + 8, sy + 23); g.rotate((1 - p.rollT / 0.3) * Math.PI * 2 * (p.rollX < 0 ? -1 : 1)); g.drawImage(cv(s), -8, -16, 16, 18); g.restore(); }
  else g.drawImage(cv(p.flash > 0 ? white(s) : s), sx, sy);
  if (attacking && p.dir !== 1) this.drawSwing(g, cx, cy);
  if (p.spinT > 0) this.drawSpin(g, cx, cy, false);
  if (back && p.dir === 1) backSword();
};
G.drawSpin = function (g, cx, cy, behind) {
  const p = this.player, t = 1 - p.spinT / 0.38, ang = -Math.PI / 2 + t * Math.PI * 2.2;
  const s = Math.sin(ang) < 0; if (s !== behind) return; // la mitad de arriba se pinta detrás del cuerpo
  const hx = p.x - cx, hy = p.y - 11 - cy;
  g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.ellipse(hx, hy + 2, 20, 13, 0, ang - 1.6, ang); g.stroke();
  g.save(); g.translate(hx + Math.cos(ang) * 4, hy + Math.sin(ang) * 3); g.rotate(ang + Math.PI / 2); g.drawImage(cv(Art.sword), -3, -18); g.restore();
};
G.drawSwing = function (g, cx, cy) {
  const p = this.player, t = 1 - p.atkT / 0.24;
  const base = [Math.PI / 2, -Math.PI / 2, Math.PI, 0][p.dir];
  if (p.atkKind === 'thrust') {
    const reach = Math.sin(Math.min(1, t * 1.6) * Math.PI / 2) * 12 - 4;
    const hx = p.x - cx + Math.cos(base) * reach, hy = p.y - 11 - cy + Math.sin(base) * reach;
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(hx + Math.cos(base) * 6, hy + Math.sin(base) * 6); g.lineTo(hx + Math.cos(base) * (22 + reach), hy + Math.sin(base) * (22 + reach)); g.stroke();
    g.save(); g.translate(hx, hy); g.rotate(base + Math.PI / 2); g.drawImage(cv(Art.sword), -3, -18); g.restore();
    return;
  }
  const rev = (p.dir === 2 || p.dir === 0) !== (p.atkKind === 'back');
  const a0 = rev ? base + 1.3 : base - 1.3, ang = rev ? a0 - t * 2.6 : a0 + t * 2.6;
  const hx = p.x - cx + (p.dir === 2 ? -3 : p.dir === 3 ? 3 : 0), hy = p.y - 11 - cy;
  g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.arc(hx, hy, 15, Math.min(a0, ang), Math.max(a0, ang)); g.stroke();
  g.save(); g.translate(hx, hy); g.rotate(ang + Math.PI / 2); g.drawImage(cv(Art.sword), -3, -18); g.restore();
};
G.nightOverlay = function (g, dk, cx, cy) {
  dctx.globalCompositeOperation = 'source-over';
  dctx.clearRect(0, 0, WW, WH);
  dctx.fillStyle = `rgba(8,12,36,${dk})`;
  dctx.fillRect(0, 0, WW, WH);
  dctx.globalCompositeOperation = 'destination-out';
  const light = (x, y, r) => {
    const gr = dctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.35, 'rgba(0,0,0,0.84)'); gr.addColorStop(0.7, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    dctx.fillStyle = gr; dctx.beginPath(); dctx.arc(x, y, r, 0, Math.PI * 2); dctx.fill();
  };
  light(this.player.x - cx, this.player.y - 10 - cy, 92);
  for (const pr of this.world.props) if (pr.anim === 1 || pr.img === Art.P.cruzluz) {
    const lx = pr.x - cx, ly = pr.y - 6 - cy;
    if (lx > -90 && lx < WW + 90 && ly > -90 && ly < WH + 90) light(lx, ly, pr.anim === 1 ? 72 + Math.sin(this.clock * 9) * 3 : 55);
  }
  for (const k of this.world.pickups) if (k.type === Pickup.RELIC) light(k.x - cx, k.y - 8 - cy, 20);
  dctx.globalCompositeOperation = 'source-over';
  g.drawImage(darkC, 0, 0);
  for (const pr of this.world.props) if (pr.anim === 1) {
    const lx = pr.x - cx, ly = pr.y - 6 - cy;
    if (lx > -90 && lx < WW + 90 && ly > -90 && ly < WH + 90) this.glow(g, lx, ly, 46, `rgba(255,140,40,${0.24 * dk})`);
  }
};
G.renderTitleBg = function (g) {
  const saved = this.world, sp = this.player;
  this.world = this.worlds.exterior;
  const fake = new Player();
  fake.x = (WG.rx + 2) * TS + Math.sin(this.titleT * 0.07) * 70; fake.y = 106 * TS;
  this.player = fake;
  this.camX = fake.x - WW / 2; this.camY = fake.y - WH / 2 - 10; this.clampCam();
  const cx = Math.floor(this.camX), cy = Math.floor(this.camY), w = this.world, frame = Math.floor(this.titleT * 3);
  for (let y = Math.floor(cy / TS); y <= Math.floor(cy / TS) + Math.ceil(WH / TS) + 1; y++) for (let x = Math.floor(cx / TS); x <= Math.floor(cx / TS) + Math.ceil(WW / TS) + 1; x++) {
    const t = w.get(x, y);
    g.drawImage(cv(Art.tile(t, x, y, frame)), x * TS - cx, y * TS - cy);
    this.edgeDetail(g, t, x, y, x * TS - cx, y * TS - cy);
  }
  const ps = w.props.filter(pr => !pr.hidden && pr.x > cx - 60 && pr.x < cx + WW + 60 && pr.y > cy - 20 && pr.y < cy + WH + 80).sort((a, b) => a.y - b.y);
  for (const pr of ps) g.drawImage(cv(pr.img), pr.left() - cx, pr.top() - cy);
  for (const n of w.npcs) { const s = n.sprite(this.titleT); g.drawImage(cv(s), Math.floor(n.x - s.w / 2) - cx, Math.floor(n.y - s.h) - cy); }
  this.world = saved; this.player = sp;
  const gr = g.createLinearGradient(0, 0, 0, WH);
  gr.addColorStop(0, 'rgba(10,8,6,0.82)'); gr.addColorStop(1, 'rgba(10,8,6,0.5)');
  g.fillStyle = gr; g.fillRect(0, 0, WW, WH);
  this.embers(g);
};
G.embers = function (g) {
  const r = RNG(4);
  for (let i = 0; i < 40; i++) {
    const sp = 6 + r.next() * 14, rx = r.next(), ry = r.next(), gg = r.int(80);
    const x = ((rx * WW + Math.sin(this.titleT * 0.7 + i) * 8) % WW + WW) % WW;
    const y = WH - ((this.titleT * sp + ry * WH) % (WH + 20));
    const a = Math.max(0, Math.min(1, (120 + 100 * Math.sin(this.titleT * 2 + i)) / 255));
    g.fillStyle = `rgba(255,${150 + gg},60,${a})`;
    g.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }
};

// ====================================================================== interfaz
G.panel = function (g, x, y, w, h) {
  g.fillStyle = PANEL; rr(g, x, y, w, h, 2); g.fill();
  g.lineWidth = 0.8; g.strokeStyle = '#8a6a3a'; rr(g, x + 0.5, y + 0.5, w - 1, h - 1, 2); g.stroke();
  g.strokeStyle = 'rgba(255,230,180,0.12)'; rr(g, x + 1.5, y + 1.5, w - 3, h - 3, 1.5); g.stroke();
};
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
G.text = function (g, s, x, y, c) { g.fillStyle = 'rgba(0,0,0,0.63)'; g.fillText(s, x + 0.5, y + 0.6); g.fillStyle = c; g.fillText(s, x, y); };
G.center = function (g, s, y, c) { this.text(g, s, VW / 2 - g.measureText(s).width / 2, y, c); };
G.wrap = function (g, s, width) {
  const out = [];
  for (const para of s.split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (g.measureText(t).width > width && line) { out.push(line); line = word; } else line = t;
    }
    out.push(line);
  }
  return out;
};
G.bar = function (g, x, y, w, h, frac, c, back) {
  frac = Math.max(0, Math.min(1, frac));
  g.fillStyle = 'rgba(10,6,4,0.86)'; g.fillRect(x - 0.8, y - 0.8, w + 1.6, h + 1.6);
  g.fillStyle = back; g.fillRect(x, y, w, h);
  g.fillStyle = c; g.fillRect(x, y, w * frac, h);
  g.fillStyle = 'rgba(255,255,255,0.24)'; g.fillRect(x, y, w * frac, h * 0.35);
};
G.star = function (g, x, y, r) {
  g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 === 0 ? r : r * 0.45; i ? g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : g.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
  g.closePath(); g.fillStyle = GOLD; g.fill(); g.strokeStyle = INK; g.lineWidth = 0.5; g.stroke();
};
G.uiHud = function (g) {
  const p = this.player;
  this.panel(g, 4, 4, 116, 40);
  g.font = FBB(7); this.text(g, 'Guardián  ·  Nv. ' + p.lvl, 9, 12.5, GOLD);
  if (p.pts > 0) { g.font = FBB(5.6); this.text(g, '+' + p.pts + ' hab.', 88, 12.5, `rgba(255,230,140,${0.6 + 0.4 * Math.sin(this.clock * 4)})`); }
  this.bar(g, 9, 16, 76, 5.2, p.hp / p.maxHp, p.poison > 0 ? '#6aa830' : '#c8402e', '#3a1410');
  this.bar(g, 9, 24, 76, 3.6, p.fe / p.maxFe, '#e8c050', '#3a2c10');
  this.bar(g, 9, 30.5, 76, 1.6, p.xp / p.xpNext(), '#8ac0e8', '#1a2430');
  g.font = FB(5.4); this.text(g, p.hp + '/' + p.maxHp, 88, 20.8, PAPER); this.text(g, 'Fe ' + p.fe, 88, 27.8, PAPER);
  g.drawImage(cv(Art.herb), 9, 34, 7, 7);
  g.font = FBB(5.8); this.text(g, '×' + p.herbs, 17, 40.3, PAPER);
  g.drawImage(cv(Art.relic), 34, 34, 6, 7); this.text(g, p.relics + '/5', 41, 40.3, PAPER);
  if (this.world.outdoor) {
    const h = Math.floor(this.hour()), mi = Math.floor((this.hour() - h) * 6) * 10;
    const cc = this.isNight() ? '#a8b8ff' : '#ffe08a';
    g.fillStyle = cc; g.beginPath(); g.arc(78, 37.4, 2, 0, Math.PI * 2); g.fill();
    if (this.isNight()) { g.fillStyle = '#120e0c'; g.beginPath(); g.arc(79.4, 36.8, 2, 0, Math.PI * 2); g.fill(); }
    this.text(g, String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0'), 83, 40.3, cc);
  }
  g.font = FB(6.2);
  const ob = this.wrap(g, this.objective(), 132), oh = 11 + ob.length * 7;
  this.panel(g, VW - 144, 4, 140, oh);
  g.font = FBB(5.2); this.text(g, 'OBJETIVO', VW - 139, 11, GOLD);
  g.font = FB(6.2); ob.forEach((l, i) => this.text(g, l, VW - 139, 18 + i * 7, PAPER));
  if (this.boss && !this.boss.dead) {
    g.font = FT(7); this.center(g, this.boss.name(), VH - 18, '#ffb0a0');
    this.bar(g, VW / 2 - 90, VH - 14, 180, 5, this.boss.hp / this.boss.maxHp, '#2aa8a0', '#0a2422');
  }
  if (this.bannerT > 0 && this.banner) {
    const a = Math.max(0, Math.min(1, Math.min(this.bannerT, 2.6 - this.bannerT) * 2.5));
    g.globalAlpha = a; g.font = FT(10);
    this.center(g, this.banner, 62, PAPER);
    const w = g.measureText(this.banner).width;
    g.fillStyle = GOLD; g.fillRect(VW / 2 - w / 2, 65, w, 0.7);
    g.globalAlpha = 1;
  }
  if (this.clock < 70 && this.st === ST.PLAY && !G.touch) {
    g.font = FB(5.4);
    const help = p.hasSword ? 'WASD: moverse · Espacio: espada · Mayús: rodar · E: usar · K: orar · Q: hierbas · M: mapa · Esc: menú' : 'WASD/flechas: moverse · E: hablar/usar · M: mapa · Esc: menú';
    this.panel(g, 4, VH - 13, VW - 8, 10);
    this.center(g, help, VH - 6, SOFT);
  }
};
G.uiToast = function (g) {
  g.font = FBB(6.6);
  const w = g.measureText(this.toastS).width + 14, y = this.st === ST.DIALOG ? 120 : (G.touch ? 70 : 160);
  g.globalAlpha = Math.min(1, this.toastT * 2);
  this.panel(g, VW / 2 - w / 2, y, w, 13);
  this.center(g, this.toastS, y + 9, PAPER);
  g.globalAlpha = 1;
};
G.uiDialog = function (g) {
  if (!this.page) return;
  const x = 8, y = VH - 62, w = VW - 16, h = 56;
  this.panel(g, x, y, w, h);
  const who = this.page[0];
  let portrait = null;
  if (this.page.length > 2 && Art.people[this.page[2]]) portrait = Art.people[this.page[2]][0][0];
  else if (who === 'Guardián') portrait = Art.hero[0][0];
  let tx = x + 8;
  if (portrait) {
    g.fillStyle = 'rgba(60,44,30,0.8)'; g.fillRect(x + 6, y + 6, 36, 44);
    g.drawImage(cv(portrait), x + 8, y + 4, 32, 48);
    tx = x + 48;
  }
  g.font = FT(7.6); this.text(g, who, tx, y + 12.5, GOLD);
  g.font = FB(7);
  const s = this.page[1], shown = Math.floor(Math.min(s.length, this.dlgChars));
  const lines = this.wrap(g, s, w - (tx - x) - 10);
  let used = 0;
  lines.forEach((l, i) => { const take = Math.max(0, Math.min(l.length, shown - used)); this.text(g, l.slice(0, take), tx, y + 22.5 + i * 8.2, PAPER); used += l.length + 1; });
  if (this.dlgChars >= s.length && Math.floor(this.clock * 3) % 2 === 0) {
    g.fillStyle = GOLD; g.beginPath(); g.moveTo(x + w - 13, y + h - 9); g.lineTo(x + w - 7, y + h - 9); g.lineTo(x + w - 10, y + h - 5); g.fill();
  }
};
G.uiMap = function (g) {
  g.fillStyle = 'rgba(0,0,0,0.8)'; g.fillRect(0, 0, VW, VH);
  const mw = this.mapCanvas.width, mh = this.mapCanvas.height, s = Math.min((VW - 30) / mw, (VH - 26) / mh), ox = (VW - mw * s) / 2, oy = 16;
  g.font = FT(8); this.center(g, 'Pozo Alcón y el valle del Guadalentín', 11, GOLD);
  g.fillStyle = '#8a6a3a'; g.fillRect(ox - 2, oy - 2, mw * s + 4, mh * s + 4);
  g.imageSmoothingEnabled = false;
  g.drawImage(this.mapCanvas, ox, oy, mw * s, mh * s);
  g.font = FBB(5);
  const labels = [['Pozo Alcón', 38, 112], ['Cortijo', WG.rx + 6, 103], ['Embalse de La Bolera', 160, 14], ['Presa', 160, 36], ['Cruz de S. Gregorio', WG.crossX, 80], ['Las Higueras', 158, 56], ['Sierra del Pozo', 30, 50], ['Los Llanos', 196, 120], ['Cárcavas', 180, 160], ['A-326', 92, 92]];
  for (const [n, lx, ly] of labels) { const w = g.measureText(n).width; this.text(g, n, ox + lx * s - w / 2, oy + ly * s, PAPER); }
  let px, py;
  if (this.world.outdoor) { px = ox + this.player.x / TS * s; py = oy + this.player.y / TS * s; } else { px = ox + (WG.doorX + 0.5) * s; py = oy + WG.doorY * s; }
  if (Math.floor(this.titleT * 4) % 2 === 0 || !this.world.outdoor) { g.fillStyle = '#ff4030'; g.beginPath(); g.arc(px, py, 2.5, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = '#fff'; g.lineWidth = 0.6; g.beginPath(); g.arc(px, py, 2.5, 0, Math.PI * 2); g.stroke();
  const t = this.objectiveTarget();
  if (t) this.star(g, ox + t[0] * s, oy + t[1] * s, 4.5);
  g.font = FB(5.6);
  g.fillStyle = '#ff4030'; g.beginPath(); g.arc(ox + 2, VH - 5, 2, 0, Math.PI * 2); g.fill();
  this.text(g, 'tú', ox + 6, VH - 3, SOFT);
  this.star(g, ox + 24, VH - 5, 3);
  this.text(g, 'objetivo   ·   ' + (G.touch ? 'toca para cerrar' : 'M para cerrar'), ox + 30, VH - 3, SOFT);
};
G.menuList = function (g, items, y0, step) {
  g.font = FBB(8);
  items.forEach((m, i) => {
    const sel = i === this.menuIdx, label = (sel ? '› ' : '') + m + (sel ? ' ‹' : '');
    this.center(g, label, y0 + i * step, sel ? PAPER : DIM);
    this.menuRects.push({ i, x: VW / 2 - 60, y: y0 + i * step - 9, w: 120, h: step });
  });
};
G.uiPause = function (g) {
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 0, VW, VH);
  this.panel(g, VW / 2 - 70, 26, 140, 148);
  g.font = FT(11); this.center(g, 'Pausa', 44, GOLD);
  this.menuList(g, this.pauseMenu(), 62, 15);
  g.font = FB(5.8);
  this.center(g, 'Reliquias ' + this.player.relics + '/5  ·  Ataque ' + this.player.atk + '  ·  Nivel ' + this.player.lvl, 166, SOFT);
};
G.uiDead = function (g) {
  const a = Math.min(1, this.deadT / 1.2);
  g.fillStyle = `rgba(20,0,0,${0.75 * a})`; g.fillRect(0, 0, VW, VH);
  g.font = FT(16); this.center(g, 'Has caído', 95, `rgba(220,80,60,${a})`);
  if (this.deadT > 1.2) { g.font = FB(7.5); this.center(g, (G.touch ? 'Toca la pantalla' : 'Pulsa Enter') + ' para levantarte en tu último descanso', 120, PAPER); }
};
G.uiTitle = function (g) {
  g.font = FT(24); this.center(g, 'El Guardián Errante', 66, PAPER);
  g.font = FT(9); this.center(g, 'Crónicas de Pozo Alcón', 82, GOLD);
  g.fillStyle = GOLD; g.fillRect(VW / 2 - 60, 88, 120, 0.7);
  g.drawImage(cv(Art.hero[0][0]), VW / 2 - 16, 94, 32, 48);
  this.menuList(g, this.menu(), 160, 15);
  g.font = FB(5.6);
  this.center(g, G.touch ? 'Toca una opción · Juega con el móvil en horizontal' : 'Flechas/WASD para elegir · Enter para aceptar · F11 pantalla completa', VH - 6, '#8a7a60');
};
G.uiHelp = function (g) {
  this.panel(g, 30, 12, VW - 60, VH - 24);
  g.font = FT(11); this.center(g, 'Controles', 30, GOLD);
  const rows = G.touch
    ? [['Joystick (izquierda)', 'Moverse'], ['Espada', 'Combo de golpes · mantén para Torbellino'], ['Rodar', 'Esquivar (eres invulnerable un instante)'], ['Usar', 'Hablar, abrir, examinar'], ['Orar', 'Recupera vida (25 de Fe)'], ['Luz', 'Onda sagrada (nivel 3, 40 de Fe)'], ['Hierba', 'Comer hierbas medicinales (+30 vida)'], ['Mapa / Menú / Hab.', 'Mapa, pausa y árbol de habilidades'], ['Toca la pantalla', 'Pasar los diálogos']]
    : [['WASD / Flechas', 'Moverse'], ['Espacio / J', 'Combo de espada (mantén: Torbellino)'], ['Mayús / X', 'Rodar para esquivar'], ['E / Enter', 'Hablar, usar, abrir, pasar texto'], ['K / 1', 'Orar: recupera vida (25 de Fe)'], ['L / 2', 'Luz: onda sagrada (nivel 3, 40 de Fe)'], ['Q / 3', 'Comer hierbas medicinales (+30 vida)'], ['M / Tab', 'Mapa de la comarca'], ['H', 'Árbol de habilidades'], ['Esc / P', 'Pausa y guardar'], ['N', 'Activar o quitar la música']];
  g.font = FB(7);
  rows.forEach((r, i) => { this.text(g, r[0], 52, 48 + i * 14, GOLD); this.text(g, r[1], 150, 48 + i * 14, PAPER); });
  g.font = FB(5.8);
  this.center(g, 'Descansa en tu cama o en la hoguera de la iglesia para guardar.  ' + (G.touch ? 'Toca para volver.' : 'Enter para volver.'), VH - 18, '#a89a80');
};
G.uiStory = function (g, s, chars) {
  g.font = FT(9.5);
  const shown = Math.floor(Math.min(s.length, chars)), lines = this.wrap(g, s, VW - 60), y0 = VH / 2 - lines.length * 7;
  let used = 0;
  lines.forEach((l, i) => { const take = Math.max(0, Math.min(l.length, shown - used)); const w = g.measureText(l).width; this.text(g, l.slice(0, take), VW / 2 - w / 2, y0 + i * 14, PAPER); used += l.length + 1; });
  if (chars >= s.length) { g.font = FB(6); this.center(g, (G.touch ? 'Toca para continuar' : 'Enter para continuar') + (this.st === ST.INTRO && !G.touch ? ' · Esc para saltar' : ''), VH - 12, DIM); }
};
