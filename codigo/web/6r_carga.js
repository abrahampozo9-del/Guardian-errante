// ====================================================================== versión del juego y carga a prueba de fallos
// La versión se pone sola al publicar (la misma que la del archivo sw.js). Se ve en la pantalla de título.
const GAME_VERSION = '__VERSION__';

// si algo falla al cargar donde guardaste, se carga la partida en tu último descanso o en tu cortijo
const _loadR = G.load;
G.load = function () {
  const errs = [], ce = console.error;
  console.error = (...a) => { errs.push(a.map(x => x && x.message ? x.message + ' ' + ((x.stack || '').split('\n')[1] || '').trim() : String(x)).join(' ')); ce.apply(console, a); };
  const attempt = () => { try { const want = (this.readSave() || {}).world; const ok = _loadR.call(this) && !!this.world && !!this.player; if (ok && want && !this.worlds[want]) { errs.push('no existe el sitio guardado: ' + want); return false; } return ok; } catch (e) { errs.push(e.message + ' ' + ((e.stack || '').split('\n')[1] || '').trim()); return false; } };
  let ok = attempt();
  if (!ok) {
    const d = this.readSave();
    if (d) for (const alt of [{ world: d.restWorld || 'casa_alta', x: d.restX, y: d.restY }, { world: 'casa_alta', x: WG.upStart[0], y: WG.upStart[1], restWorld: 'casa_alta', restX: WG.upStart[0], restY: WG.upStart[1] }]) {
      if (!alt.world || alt.x === undefined) continue;
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(Object.assign({}, d, alt))); } catch (e) { break; }
      ok = attempt();
      if (ok) { this.toast('Algo fallaba donde guardaste: te levantas en ' + (alt.world === 'casa_alta' ? 'tu cortijo' : 'tu último descanso') + '.'); this.save(); break; }
    }
    if (!ok && d) try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch (e) { }
  }
  console.error = ce;
  this.loadError = ok ? null : (errs[0] || 'error desconocido');
  return ok;
};
// el aviso del título dice por qué no carga (para poder arreglarlo)
const _updTitleR = G.updateTitle;
G.updateTitle = function () {
  _updTitleR.call(this);
  if (this.st === ST.TITLE && this.loadError && this.toastS === 'No se pudo cargar la partida.') { this.toastS = 'No se pudo cargar la partida (' + GAME_VERSION + '): ' + this.loadError.slice(0, 120); this.toastT = 8; }
};

// ---------------------------------------------------------------- versión nueva: el juego se actualiza solo en el título
G.checkUpdate = function () {
  if (!/^https?:/.test(location.protocol) || GAME_VERSION.startsWith('__')) return;
  fetch('sw.js', { cache: 'no-store' }).then(r => r.text()).then(t => {
    const m = t.match(/guardian-v\d+/); if (!m || m[0] === GAME_VERSION) return;
    this.newVersion = m[0];
    if (this.st === ST.TITLE) { this.toast('Hay una versión nueva del juego. Actualizando…'); setTimeout(() => location.reload(), 900); }
  }).catch(() => { });
};
window.addEventListener('load', () => setTimeout(() => G.checkUpdate(), 1500));
document.addEventListener('visibilitychange', () => { if (!document.hidden) G.checkUpdate(); });
const _lateR = Q.late;
Q.late = function () {
  _lateR();
  const _ut = G.uiTitle;
  G.uiTitle = function (g) {
    _ut.call(this, g);
    g.font = FB(5.4); const s = (GAME_VERSION.startsWith('__') ? 'versión de prueba' : 'versión ' + GAME_VERSION.replace('guardian-v', '')) + (this.newVersion ? ' · hay una nueva: ' + this.newVersion.replace('guardian-v', '') : '');
    this.text(g, s, VW - 6 - g.measureText(s).width, VH - 5, 'rgba(216,204,176,0.6)');
  };
  // con una versión nueva esperando, en la pausa se avisa
  const _up = G.uiPause;
  G.uiPause = function (g) { _up.call(this, g); if (this.newVersion) { g.font = FB(5.6); this.center(g, 'Hay una versión nueva: guarda y sal al título para actualizar.', 12, '#8ad8ff'); } };
};
