// ====================================================================== cansancio (estadística oculta)
// El Guardián se cansa con las horas despierto y con el esfuerzo (golpes, volteretas, heridas).
// En la cama duerme más o menos horas según lo cansado que esté; en una hoguera solo se sienta un rato.
// No se ve en ningún sitio: solo se nota en lo que dice el Guardián y en lo que dura el sueño.
const FATIGA_DIA = 18; // horas de juego despierto hasta estar reventado
G.fatigue = 10;
G.addFatigue = function (v) {
  const f0 = this.fatigue || 0, f = this.fatigue = Math.max(0, Math.min(100, f0 + v));
  if (this.st !== ST.PLAY) return;
  if (f0 < 70 && f >= 70) this.toast('Empiezas a notar el cansancio en los hombros.');
  else if (f0 < 90 && f >= 90) this.toast('Se te cierran los ojos. Te vendría bien dormir en tu cama.');
};
const _updFat = G.updatePlay;
G.updatePlay = function (dt) {
  const p = this.player, roll0 = p && p.rollT;
  _updFat.call(this, dt);
  if (this.st !== ST.PLAY && this.st !== ST.DIALOG) return;
  // una hora de juego son DAY_LEN/24 segundos, dentro o fuera de casa
  let k = dt / (DAY_LEN / 24) * (100 / FATIGA_DIA);
  if (this.isNight()) k *= 1.25;
  this.addFatigue(k);
  if (p && p.rollT > 0 && !(roll0 > 0)) this.addFatigue(0.35);
};
const _atkFat = G.attackPress;
G.attackPress = function () { this.addFatigue(0.12); return _atkFat.apply(this, arguments); };
const _hurtFat = G.hurtPlayer;
G.hurtPlayer = function (dmg) { const hp0 = this.player.hp; const r = _hurtFat.apply(this, arguments); if (this.player.hp < hp0) this.addFatigue((hp0 - this.player.hp) * 0.04); return r; };

// horas que duerme según el cansancio (de 1 a 9)
G.sleepHours = function () { return Math.max(1, Math.min(9, Math.round((this.fatigue || 0) * 0.09))); };
const hhmm = h => { const H = Math.floor(h) % 24, M = Math.floor((h - Math.floor(h)) * 60 / 10) * 10; return String(H).padStart(2, '0') + ':' + String(M).padStart(2, '0'); };
G.rest = function (msg) {
  const p = this.player;
  for (const m of this.world.monsters) if (!m.dead && m.dist(p) < 10 * TS && m.aggro) { this.toast('No puedes descansar con engendros cerca.'); return; }
  const bed = this.world.id === 'casa_alta';
  const f = this.fatigue || 0, hours = bed ? this.sleepHours() : 1;
  // el tiempo pasa
  const d0 = this.day; let nd = d0 + hours / 24;
  const wrapped = nd >= 1; this.day = nd % 1;
  this.fatigue = Math.max(0, f - (bed ? hours * 12.5 : 12));
  // se recupera más cuanto más se duerme (las hogueras, como siempre, lo curan todo)
  const k = bed ? Math.min(1, 0.3 + hours * 0.12) : 1;
  p.hp = Math.min(p.maxHp, Math.max(p.hp, Math.round(p.hp + p.maxHp * k))); p.fe = Math.min(p.maxFe, Math.max(p.fe, Math.round(p.fe + p.maxFe * k)));
  if (k >= 1) { p.hp = p.maxHp; p.fe = p.maxFe; }
  p.poison = 0; p.alientoUsed = false;
  for (const id in this.worlds) { const ww = this.worlds[id]; for (const L of (ww.lairs || [])) { L.cleared = false; L.active = false; } if (ww.outdoor) ww.monsters = ww.monsters.filter(m => !m.lair || m.kind === MK.BESTIA || m.quest); }
  if (bed) { this.restWorld = 'casa_alta'; this.restX = WG.upStart[0]; this.restY = WG.upStart[1]; }
  this._rested = true;
  if (wrapped) { this.dayN = (this.dayN || 0) + 1; if (typeof Q !== 'undefined') Q.newDay(true); }
  this.save();
  const lines = [];
  if (bed) {
    const def = msg === 'Duermes hasta el amanecer.' || msg === 'Descansas un rato en tu cama.';
    if (!def && msg) lines.push(msg);
    if (f < 15) lines.push('No tengo sueño. Doy vueltas en la cama y a la hora me levanto. Son las ' + hhmm(this.hour()) + '.');
    else if (hours <= 3) lines.push('Echo una cabezada de ' + (hours === 1 ? 'una hora' : hours + ' horas') + '. Son las ' + hhmm(this.hour()) + '.');
    else if (f >= 85) lines.push('Caigo redondo. Duermo ' + hours + ' horas del tirón, sin soñar. Son las ' + hhmm(this.hour()) + '.');
    else lines.push('Duermo unas ' + hours + ' horas. Son las ' + hhmm(this.hour()) + '.');
    lines.push(k >= 1 ? 'Vida y Fe recuperadas. Partida guardada.' : 'Recuperas parte de la vida y la Fe. Partida guardada.');
  } else { lines.push(msg, 'Vida y Fe recuperadas. Partida guardada.'); }
  this.say('Guardián', ...lines);
};
// se guarda con la partida
const _saveFat = G.save;
G.save = function () {
  _saveFat.call(this);
  try { const s = localStorage.getItem(SAVE_KEY); if (s) { const d = JSON.parse(s); d.fatigue = Math.round((this.fatigue || 0) * 10) / 10; localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } } catch (e) { }
};
const _loadFat = G.load;
G.load = function () { const ok = _loadFat.call(this); if (ok) { const d = this.readSave(); this.fatigue = d && d.fatigue !== undefined ? d.fatigue : 20; } return ok; };
const _newFat = G.newGame;
G.newGame = function () { this.fatigue = 10; _newFat.call(this); };
