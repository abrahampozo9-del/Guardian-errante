// ====================================================================== controles táctiles
const Touch = {
  stickId: null, ox: 0, oy: 0, cx: 0, cy: 0, buttons: [], flash: {},
  layout(cw, ch) {
    const k = Math.max(0.75, Math.min(1.25, ch / 390));
    this.k = k;
    this.padX = Math.max(78 * k, Math.min(G.layout.ox * 0.5 + 40 * k, 120 * k));
    this.padY = ch - 88 * k;
    this.buttons = [
      { id: 'atk', x: cw - 64 * k, y: ch - 72 * k, r: 34 * k, label: 'Espada', code: 'Space' },
      { id: 'use', x: cw - 142 * k, y: ch - 42 * k, r: 26 * k, label: 'Usar', code: 'KeyE' },
      { id: 'pray', x: cw - 138 * k, y: ch - 118 * k, r: 21 * k, label: 'Orar', code: 'KeyK' },
      { id: 'light', x: cw - 64 * k, y: ch - 150 * k, r: 21 * k, label: 'Luz', code: 'KeyL' },
      { id: 'herb', x: cw - 204 * k, y: ch - 82 * k, r: 21 * k, label: 'Hierba', code: 'KeyQ' },
      { id: 'roll', x: cw - 214 * k, y: ch - 32 * k, r: 22 * k, label: 'Rodar', code: 'Roll' },
    ];
    const side = G.layout.ox;
    if (side > 44 * k) {
      this.buttons.push({ id: 'menu', x: side / 2, y: 34 * k, r: 17 * k, label: 'Menú', code: 'Escape' });
      this.buttons.push({ id: 'map', x: cw - side / 2, y: 34 * k, r: 17 * k, label: 'Mapa', code: 'KeyM' });
    } else {
      this.buttons.push({ id: 'menu', x: cw / 2 - 26 * k, y: ch - 18 * k, r: 15 * k, label: 'Menú', code: 'Escape' });
      this.buttons.push({ id: 'map', x: cw / 2 + 26 * k, y: ch - 18 * k, r: 15 * k, label: 'Mapa', code: 'KeyM' });
    }
  },
  hit(x, y) { for (const b of this.buttons) if (Math.hypot(x - b.x, y - b.y) < b.r * 1.2) return b; return null; },
  draw(ctx, cw, ch) {
    this.layout(cw, ch);
    if (ch > cw) {
      ctx.fillStyle = 'rgba(8,6,4,0.88)'; ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = PAPER; ctx.textAlign = 'center';
      ctx.font = FT(22); ctx.fillText('Gira el móvil', cw / 2, ch / 2 - 10);
      ctx.font = FB(16); ctx.fillStyle = SOFT; ctx.fillText('El Guardián Errante se juega en horizontal', cw / 2, ch / 2 + 18);
      ctx.textAlign = 'left';
      return;
    }
    if (G.st !== ST.PLAY) return;
    const p = G.player;
    for (const b of this.buttons) {
      const lit = (this.flash[b.id] || 0) > performance.now();
      const off = (b.id === 'light' && !p.canLight()) || (b.id === 'herb' && p.herbs === 0) || (b.id === 'atk' && !p.hasSword);
      ctx.globalAlpha = off ? 0.35 : 1;
      ctx.fillStyle = lit ? 'rgba(232,196,106,0.55)' : 'rgba(18,14,12,0.45)';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(232,196,106,0.75)'; ctx.stroke();
      ctx.fillStyle = PAPER; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = FBB(Math.round((b.r > 25 ? 14 : 12) * this.k));
      if (b.id === 'atk') {
        ctx.save(); ctx.translate(b.x, b.y - 4 * this.k); ctx.rotate(-0.6); ctx.imageSmoothingEnabled = false;
        ctx.drawImage(cv(Art.sword), -7 * this.k, -18 * this.k, 14 * this.k, 36 * this.k); ctx.restore();
        ctx.font = FBB(Math.round(11 * this.k)); ctx.fillText(b.label, b.x, b.y + b.r * 0.62);
      } else if (b.id === 'herb') { ctx.fillText(b.label, b.x, b.y); ctx.font = FBB(Math.round(10 * this.k)); ctx.fillText('×' + p.herbs, b.x, b.y + b.r * 0.55); }
      else ctx.fillText(b.label, b.x, b.y + 1);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    }
    ctx.globalAlpha = 1;
    this.drawPad(ctx);
  },
  padCenter() { return [this.padX, this.padY]; },
  /** Cruceta translúcida fija, siempre visible. */
  drawPad(ctx) {
    const k = this.k, cx = this.padX, cy = this.padY, arm = 22 * k, len = 58 * k;
    const sx = G.stick.x, sy = G.stick.y, act = this.stickId !== null;
    ctx.save();
    ctx.globalAlpha = act ? 0.85 : 0.6;
    // base circular
    ctx.fillStyle = 'rgba(18,14,12,0.35)';
    ctx.beginPath(); ctx.arc(cx, cy, len + 8 * k, 0, Math.PI * 2); ctx.fill();
    // cruz
    ctx.fillStyle = 'rgba(30,24,20,0.7)'; ctx.strokeStyle = 'rgba(232,196,106,0.85)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - arm / 2, cy - len); ctx.lineTo(cx + arm / 2, cy - len); ctx.lineTo(cx + arm / 2, cy - arm / 2);
    ctx.lineTo(cx + len, cy - arm / 2); ctx.lineTo(cx + len, cy + arm / 2); ctx.lineTo(cx + arm / 2, cy + arm / 2);
    ctx.lineTo(cx + arm / 2, cy + len); ctx.lineTo(cx - arm / 2, cy + len); ctx.lineTo(cx - arm / 2, cy + arm / 2);
    ctx.lineTo(cx - len, cy + arm / 2); ctx.lineTo(cx - len, cy - arm / 2); ctx.lineTo(cx - arm / 2, cy - arm / 2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // flechas (se iluminan en la dirección pulsada)
    const dirs = [[0, -1, sy < -0.35], [0, 1, sy > 0.35], [-1, 0, sx < -0.35], [1, 0, sx > 0.35]];
    for (const [dx, dy, on] of dirs) {
      const ax = cx + dx * len * 0.68, ay = cy + dy * len * 0.68, s = 8 * k;
      ctx.fillStyle = on ? 'rgba(255,224,140,1)' : 'rgba(242,230,204,0.85)';
      ctx.beginPath();
      ctx.moveTo(ax + dx * s, ay + dy * s);
      ctx.lineTo(ax - dx * s * 0.4 + dy * s, ay - dy * s * 0.4 + dx * s);
      ctx.lineTo(ax - dx * s * 0.4 - dy * s, ay - dy * s * 0.4 - dx * s);
      ctx.closePath(); ctx.fill();
    }
    // pomo que sigue al dedo
    if (act) {
      ctx.fillStyle = 'rgba(232,196,106,0.75)';
      ctx.beginPath(); ctx.arc(cx + sx * len * 0.75, cy + sy * len * 0.75, 15 * k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  },
  /** La dirección se calcula desde el centro fijo de la cruceta: vale tocar encima o deslizar. */
  updateStick() {
    const max = 40 * (this.k || 1);
    let dx = this.cx - this.padX, dy = this.cy - this.padY;
    const l = Math.hypot(dx, dy);
    if (l < 6 * (this.k || 1)) { G.stick.x = G.stick.y = 0; return; }
    if (l > max) { dx = dx / l * max; dy = dy / l * max; }
    G.stick.x = dx / max; G.stick.y = dy / max;
  },
};

// ====================================================================== arranque y bucle
(function () {
  const canvas = document.getElementById('juego');
  const ctx = canvas.getContext('2d');
  let cw = 0, ch = 0, dpr = 1;
  function resize() {
    dpr = Math.min(3, window.devicePixelRatio || 1);
    cw = canvas.clientWidth; ch = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(cw * dpr)); canvas.height = Math.max(1, Math.round(ch * dpr));
  }
  window.addEventListener('resize', resize);
  resize();

  function toView(x, y) { const L = G.layout; return [(x - L.ox) / L.sc, (y - L.oy) / L.sc]; }
  function tapAt(x, y) {
    if (G.st === ST.TITLE || G.st === ST.PAUSE) {
      const [vx, vy] = toView(x, y);
      for (const r of G.menuRects) if (vx >= r.x && vx <= r.x + r.w && vy >= r.y && vy <= r.y + r.h) { G.queue.add('Pick' + r.i); return; }
      return;
    }
    if (G.st === 'CINE' && G.cineSkip) { const [vx, vy] = toView(x, y), r = G.cineSkip; if (vx >= r.x && vy <= r.y + r.h) { G.queue.add('Skip'); return; } }
    G.queue.add('Tap');
  }
  function localXY(t) { const b = canvas.getBoundingClientRect(); return [t.clientX - b.left, t.clientY - b.top]; }

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    Sound.unlock();
    if (!G.touch) { G.touch = true; }
    for (const t of e.changedTouches) {
      const [x, y] = localXY(t);
      if (G.st === ST.PLAY) {
        Touch.layout(cw, ch);
        const b = Touch.hit(x, y);
        if (b) { G.queue.add(b.code); Touch.flash[b.id] = performance.now() + 150; continue; }
        if (x < cw * 0.45 && Touch.stickId === null) { Touch.stickId = t.identifier; Touch.cx = x; Touch.cy = y; Touch.updateStick(); }
      } else tapAt(x, y);
    }
  }, { passive: false });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const t of e.changedTouches) if (t.identifier === Touch.stickId) { const [x, y] = localXY(t); Touch.cx = x; Touch.cy = y; Touch.updateStick(); }
  }, { passive: false });
  const endTouch = e => {
    e.preventDefault();
    Sound.unlock();
    for (const t of e.changedTouches) if (t.identifier === Touch.stickId) { Touch.stickId = null; G.stick.x = G.stick.y = 0; }
  };
  canvas.addEventListener('touchend', endTouch, { passive: false });
  canvas.addEventListener('touchcancel', endTouch, { passive: false });
  canvas.addEventListener('mousedown', e => {
    Sound.unlock();
    if (G.touch) return;
    const [x, y] = localXY(e);
    if (G.st !== ST.PLAY) tapAt(x, y);
  });
  document.addEventListener('gesturestart', e => e.preventDefault());

  const block = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab']);
  window.addEventListener('keydown', e => {
    Sound.unlock();
    if (block.has(e.code)) e.preventDefault();
    if (!G.keys.has(e.code)) G.queue.add(e.code);
    G.keys.add(e.code);
  });
  window.addEventListener('keyup', e => G.keys.delete(e.code));
  window.addEventListener('blur', () => { G.keys.clear(); G.stick.x = G.stick.y = 0; Touch.stickId = null; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      Sound.suspend();
      if (G.st === ST.PLAY && G.world && G.stage > 0 && !G.player.dead) { G.save(); G.st = ST.PAUSE; G.menuIdx = 0; }
    } else Sound.resume();
  });

  G.touch = navigator.maxTouchPoints > 0 || ('ontouchstart' in window) || (window.matchMedia && matchMedia('(pointer: coarse)').matches);

  function start() {
    G.boot();
    const load = document.getElementById('cargando');
    if (load) load.remove();
    let last = performance.now(), acc = 0;
    const step = 1 / 60;
    function frame(now) {
      acc += Math.min(0.25, (now - last) / 1000); last = now;
      if (canvas.clientWidth !== cw || canvas.clientHeight !== ch) resize();
      while (acc >= step) { G.just = new Set(G.queue); G.queue.clear(); G.update(step); acc -= step; }
      G.render(ctx, cw, ch, dpr);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const fontsReady = (document.fonts && document.fonts.load)
    ? Promise.race([Promise.all([document.fonts.load(FT(20)), document.fonts.load(FB(20)), document.fonts.load(FBB(20))]), new Promise(r => setTimeout(r, 2500))])
    : Promise.resolve();
  fontsReady.catch(() => { }).then(() => setTimeout(start, 30));
  window.G = G;
})();
