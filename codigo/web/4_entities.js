// ====================================================================== personajes
class Entity {
  constructor() { this.x = 0; this.y = 0; this.hw = 5; this.hh = 3; this.dir = 0; this.anim = 0; this.moving = false; this.kbx = 0; this.kby = 0; this.kbT = 0; this.flash = 0; this.hp = 0; this.maxHp = 0; this.dead = false; }
  move(w, dx, dy) {
    let moved = false;
    if (dx !== 0) { const nx = this.x + dx; if (!w.blocked(nx, this.y, this.hw, this.hh)) { this.x = nx; moved = true; } }
    if (dy !== 0) { const ny = this.y + dy; if (!w.blocked(this.x, ny, this.hw, this.hh)) { this.y = ny; moved = true; } }
    return moved;
  }
  faceTo(dx, dy) { if (Math.abs(dx) > Math.abs(dy)) this.dir = dx < 0 ? 2 : 3; else if (dy !== 0 || dx !== 0) this.dir = dy < 0 ? 1 : 0; }
  dist(o) { return Math.hypot(o.x - this.x, o.y - this.y); }
  knock(fx, fy, force) { let l = Math.hypot(fx, fy); if (l < 0.001) { fx = 0; fy = 1; l = 1; } this.kbx = fx / l * force; this.kby = fy / l * force; this.kbT = 0.16; }
  applyKnock(w, dt) { if (this.kbT > 0) { this.kbT -= dt; this.move(w, this.kbx * dt, this.kby * dt); } if (this.flash > 0) this.flash -= dt; }
}

class Player extends Entity {
  constructor() {
    super();
    this.maxHp = this.hp = 100; this.maxFe = this.fe = 60; this.lvl = 1; this.xp = 0; this.atk = 12; this.herbs = 0; this.relics = 0;
    this.feAcc = 0; this.hasSword = false; this.atkT = 0; this.atkCool = 0; this.invul = 0; this.prayT = 0; this.hitSet = new Set();
    this.rollT = 0; this.rollCool = 0; this.rollX = 0; this.rollY = 0; this.poison = 0; this.poisonAcc = 0;
    this.pts = 0; this.skills = new Set(); this.combo = 0; this.lastAtk = -9; this.atkKind = 'slash'; this.charge = 0; this.spinT = 0;
    this.nextCrit = false; this.shieldT = 0; this.alientoUsed = false; this.dodgeDone = false;
  }
  xpNext() { return Math.floor(25 + 22 * Math.pow(this.lvl, 1.45)); }
  canLight() { return this.lvl >= 3; }
}

const MK = { JABALI: 'JABALI', HUECO: 'HUECO', ALACRAN: 'ALACRAN', SOMBRA: 'SOMBRA', AHOGADO: 'AHOGADO', NIDO: 'NIDO', BESTIA: 'BESTIA', DEMONIO: 'DEMONIO', HUMANO: 'HUMANO' };
const MNAME = { JABALI: 'Jabalí podrido', HUECO: 'Hueco', ALACRAN: 'Alacrán gigante', SOMBRA: 'Sombra del valle', AHOGADO: 'Ahogado del Guadalentín', NIDO: 'Nido de engendros', BESTIA: 'La Bestia de La Bolera', DEMONIO: 'Demonio' };
const MRand = RNG(Date.now() & 0xffff);
// vida, daño, velocidad, xp, semiancho, semialto, alcance para empezar el ataque, aviso, ataque, recuperación
const MSTAT = {
  JABALI:  { hp: 34, dmg: 12, sp: 42, xp: 9,  hw: 8, hh: 3, range: 84, wind: 0.65, atk: 0.55, rec: 0.55 },
  HUECO:   { hp: 46, dmg: 13, sp: 30, xp: 11, hw: 5, hh: 3, range: 24, wind: 0.55, atk: 0.22, rec: 0.75 },
  ALACRAN: { hp: 28, dmg: 8,  sp: 52, xp: 10, hw: 6, hh: 4, range: 42, wind: 0.42, atk: 0.2,  rec: 0.55 },
  SOMBRA:  { hp: 36, dmg: 14, sp: 40, xp: 15, hw: 5, hh: 3, range: 80, wind: 0.75, atk: 0.22, rec: 0.85 },
  AHOGADO: { hp: 40, dmg: 10, sp: 32, xp: 13, hw: 5, hh: 3, range: 120, wind: 0.75, atk: 0.15, rec: 1.4 },
  NIDO:    { hp: 110, dmg: 0, sp: 0,  xp: 30, hw: 12, hh: 5, range: 0, wind: 0, atk: 0, rec: 0 },
  DEMONIO: { hp: 560, dmg: 22, sp: 70, xp: 260, hw: 10, hh: 4, range: 130, wind: 0.8, atk: 0.9, rec: 0.8 },
  BESTIA:  { hp: 700, dmg: 18, sp: 30, xp: 400, hw: 16, hh: 7, range: 0, wind: 0, atk: 0, rec: 0 },
  // personas y apariciones de las misiones (las estadísticas se ajustan en cada encuentro)
  HUMANO:  { hp: 160, dmg: 14, sp: 46, xp: 120, hw: 5, hh: 3, range: 26, wind: 0.5, atk: 0.22, rec: 0.6 },
};

class Monster extends Entity {
  constructor(kind, x, y, tier) {
    super();
    const st = MSTAT[kind];
    this.kind = kind; this.x = x; this.y = y; this.homeX = x; this.homeY = y;
    this.maxHp = Math.round(st.hp * tier); this.dmg = Math.round(st.dmg * (0.6 + 0.4 * tier)); this.speed = st.sp; this.xp = Math.round(st.xp * tier);
    this.hw = st.hw; this.hh = st.hh; this.st = st;
    this.hp = this.maxHp;
    this.state = 'idle'; this.stT = 0; this.ax = 0; this.ay = 0; this.hitDone = false;
    this.think = 0; this.wanderA = MRand.next() * Math.PI * 2; this.cool = 0.5 + MRand.next();
    this.shootT = 2.5; this.summonT = 8; this.chargeT = 0; this.charge = 0; this.spawnT = 3;
    this.spawnFade = 0.6; this.quest = false; this.aggro = false; this.lastH = 1; this.lair = null;
    this.submerged = kind === MK.AHOGADO;
  }
  name() { return this.customName || MNAME[this.kind]; }
  faceTo(dx, dy) { super.faceTo(dx, dy); if (Math.abs(dx) > 0.01) this.lastH = dx < 0 ? 0 : 1; }
  vulnerable() { return !(this.kind === MK.AHOGADO && this.submerged); }
  setState(s, t) { this.state = s; this.stT = t; this.hitDone = false; }

  // el ahogado solo se mueve por el agua
  moveIn(w, dx, dy) {
    if (this.kind !== MK.AHOGADO) return this.move(w, dx, dy);
    const nx = this.x + dx, ny = this.y + dy;
    const ok = (x, y) => T.isWater(w.get(Math.floor(x / TS), Math.floor(y / TS)));
    let moved = false;
    if (ok(nx, this.y)) { this.x = nx; moved = true; }
    if (ok(this.x, ny)) { this.y = ny; moved = true; }
    return moved;
  }

  update(g, dt) {
    const w = g.world, p = g.player;
    if (this.spawnFade > 0) this.spawnFade -= dt;
    this.applyKnock(w, dt);
    if (this.cool > 0) this.cool -= dt;
    this.anim += dt;
    const dx = p.x - this.x, dy = (p.y - 4) - this.y, d = Math.hypot(dx, dy);
    const sense = this.kind === MK.BESTIA ? 400 : this.kind === MK.DEMONIO ? 220 : (g.isNight() ? 130 : 105);
    if (p.dead || g.playerSafe()) this.aggro = false;
    else if (d < sense) this.aggro = true;
    else if (d > sense * 1.8) this.aggro = false;
    // atado a su guarida: si se aleja demasiado, vuelve
    if (this.lair && Math.hypot(this.x - this.homeX, this.y - this.homeY) > 13 * TS) this.aggro = false;
    this.moving = false;
    if (this.kind === MK.BESTIA) { if (this.kbT <= 0) this.boss(g, dt, dx, dy, d); return; }
    if (this.kind === MK.NIDO) { this.nest(g, dt, d); return; }
    if (this.kind === MK.DEMONIO) { if (this.kbT <= 0) this.demon(g, dt, dx, dy, d); return; }

    if (this.state !== 'idle' && this.state !== 'chase') {
      this.stT -= dt;
      this.attackStep(g, dt, dx, dy, d);
      if (this.stT <= 0) this.nextState(g);
      return;
    }
    if (this.kbT > 0) return;
    if (this.aggro) {
      this.state = 'chase';
      if (d < this.st.range && this.cool <= 0) { this.startWind(g, dx, dy, d); return; }
      this.chase(g, dt, dx, dy, d);
    } else {
      this.state = 'idle';
      this.wander(g, dt);
      if (this.kind === MK.AHOGADO) this.submerged = true;
    }
  }

  chase(g, dt, dx, dy, d) {
    const w = g.world, sp = this.speed;
    if (this.kind === MK.ALACRAN) {
      // se mueve a saltos, rodeando
      this.think -= dt;
      if (this.think <= 0 || Number.isNaN(this.wanderA)) { this.think = 0.4; this.wanderA = Math.atan2(dy, dx) + (MRand.bool() ? 1 : -1) * (0.6 + MRand.next() * 0.6); } // al pasar de quieto a perseguir, wanderA puede venir vacío (NaN)
      const mx = Math.cos(this.wanderA) * sp * dt, my = Math.sin(this.wanderA) * sp * dt;
      if (this.moveIn(w, mx, my)) this.moving = true; else this.think = 0;
      this.faceTo(dx, dy); return;
    }
    if (this.kind === MK.SOMBRA && d < 140) { // flota en círculo a media distancia
      const a = Math.atan2(-dy, -dx) + 0.9 * dt * 2;
      const tx = g.player.x + Math.cos(a) * 60, ty = g.player.y + Math.sin(a) * 60;
      const ex = tx - this.x, ey = ty - this.y, el = Math.hypot(ex, ey) || 1;
      this.x += ex / el * sp * dt; this.y += ey / el * sp * dt; this.moving = true; this.faceTo(dx, dy); return;
    }
    if (this.kind === MK.AHOGADO) { this.submerged = true; if (d > 60) { const l = d || 1; if (this.moveIn(w, dx / l * sp * dt, dy / l * sp * dt)) this.moving = true; } this.faceTo(dx, dy); return; }
    if (d > 2) {
      const mx = dx / d * sp * dt, my = dy / d * sp * dt;
      if (!this.move(w, mx, my)) { const a = Math.atan2(dy, dx) + (MRand.bool() ? 1.2 : -1.2); this.move(w, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt); }
      this.moving = true; this.faceTo(dx, dy);
    }
  }

  wander(g, dt) {
    const w = g.world;
    if (this.kind === MK.SOMBRA || this.kind === MK.AHOGADO) { this.anim += 0; }
    this.think -= dt;
    if (this.think <= 0) {
      this.think = 1 + MRand.next() * 2.5;
      const home = Math.hypot(this.homeX - this.x, this.homeY - this.y);
      this.wanderA = (MRand.next() < 0.35 && home < 3 * TS) ? NaN : Math.atan2(this.homeY - this.y, this.homeX - this.x) + (MRand.next() - 0.5) * (home > 4 * TS ? 0.6 : 2.6);
      if (home > 4 * TS && this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + Math.ceil(this.maxHp * 0.25));
    }
    if (!Number.isNaN(this.wanderA)) {
      const sp = this.speed * 0.45, mx = Math.cos(this.wanderA) * sp * dt, my = Math.sin(this.wanderA) * sp * dt;
      if (this.moveIn(w, mx, my)) { this.moving = true; this.faceTo(mx, my); } else this.think = 0;
    }
  }

  startWind(g, dx, dy, d) {
    this.faceTo(dx, dy);
    const l = d || 1; this.ax = dx / l; this.ay = dy / l;
    if (this.kind === MK.SOMBRA || (this.kind === MK.HUMANO && this.blink && MRand.next() < 0.5)) {
      // aparece por detrás del Guardián
      const p = g.player, back = [[0, -1], [0, 1], [1, 0], [-1, 0]][p.dir];
      for (const [bx, by] of [back, [back[1], back[0]], [-back[1], -back[0]]]) {
        const tx = p.x + bx * 22, ty = p.y + by * 22;
        if (!g.world.blocked(tx, ty, 4, 3)) { this.x = tx; this.y = ty; break; }
      }
      const ex = p.x - this.x, ey = (p.y - 4) - this.y, el = Math.hypot(ex, ey) || 1; this.ax = ex / el; this.ay = ey / el; this.faceTo(ex, ey);
      for (let i = 0; i < 8; i++) g.fx.push(Fx.spark(this.x, this.y - 12, MRand.gauss() * 30, MRand.gauss() * 30, 0x45345e, 0.4));
    }
    if (this.kind === MK.AHOGADO) { this.submerged = false; Sound.play('orb'); }
    this.setState('wind', this.st.wind);
  }

  nextState(g) {
    if (this.state === 'wind') {
      this.setState('atk', this.st.atk);
      if (this.kind === MK.AHOGADO) {
        const p = g.player, ex = p.x - this.x, ey = (p.y - 8) - (this.y - 14), el = Math.hypot(ex, ey) || 1;
        g.orbs.push({ x: this.x, y: this.y - 14, vx: ex / el * 125, vy: ey / el * 125, dmg: this.dmg, life: 2.2, mud: true });
      }
      if (this.kind === MK.JABALI) Sound.play('roar');
      else Sound.play('swing');
    } else if (this.state === 'atk') this.setState('rec', this.st.rec);
    else if (this.state === 'stun') this.setState('rec', 0.2);
    else { this.state = 'chase'; this.cool = 0.4 + MRand.next() * 0.7; if (this.kind === MK.AHOGADO) this.submerged = true; }
  }

  attackStep(g, dt, dx, dy, d) {
    const w = g.world, p = g.player;
    if (this.state === 'wind') {
      // el alacrán y el hueco siguen girándose hacia ti durante el aviso; el jabalí escarba
      if (this.kind !== MK.JABALI) { const l = d || 1; this.ax = dx / l; this.ay = dy / l; this.faceTo(dx, dy); }
      else if (Math.floor(this.anim * 12) % 3 === 0) g.fx.push(Fx.spark(this.x - this.ax * 8, this.y, -this.ax * 20 + MRand.gauss() * 8, -10, 0xb8a888, 0.3));
      return;
    }
    if (this.state !== 'atk') return;
    let hit = false;
    if (this.kind === MK.JABALI) {
      const sp = 165;
      if (!this.move(w, this.ax * sp * dt, this.ay * sp * dt)) { this.setState('stun', 1.1); g.shake(0.2); Sound.play('hit'); for (let i = 0; i < 8; i++) g.fx.push(Fx.spark(this.x + this.ax * 10, this.y - 6, MRand.gauss() * 40, -20 - MRand.next() * 30, 0xc8b898, 0.4)); return; }
      this.moving = true;
      hit = Math.hypot(p.x - this.x, p.y - this.y) < this.hw + 7;
    } else if (this.kind === MK.ALACRAN) {
      this.move(w, this.ax * 230 * dt, this.ay * 230 * dt);
      hit = Math.hypot(p.x - this.x, p.y - this.y) < 13;
    } else if (this.kind === MK.HUMANO && this.dash) { // embestida con cuchillo (Baldomero)
      this.move(w, this.ax * this.dash * dt, this.ay * this.dash * dt);
      hit = Math.hypot(p.x - this.x, p.y - this.y) < 14;
    } else if (this.kind === MK.HUECO || this.kind === MK.SOMBRA || this.kind === MK.HUMANO) {
      const cx = this.x + this.ax * 13, cy = this.y - 6 + this.ay * 13;
      hit = Math.hypot(p.x - cx, p.y - 8 - cy) < 15;
    }
    if (hit && !this.hitDone && p.rolling && !p.dead) { this.hitDone = true; g.perfectDodge(); }
    if (hit && !this.hitDone && p.invul <= 0 && !p.dead) {
      this.hitDone = true;
      g.hurtPlayer(this.dmg, this.x, this.y, this.kind === MK.ALACRAN || this.poisons ? 4 : 0);
      if (this.drain) { this.hp = Math.min(this.maxHp, this.hp + this.drain); g.fx.push(Fx.text(this.x, this.y - 26, '+' + this.drain, 0xc060ff)); if (this.onDrain) this.onDrain(this); }
      if (this.kind === MK.JABALI) this.setState('rec', this.st.rec);
    }
  }

  nest(g, dt, d) {
    this.anim += 0;
    if (!this.aggro || d > 150) return;
    this.spawnT -= dt;
    if (this.spawnT > 0) return;
    this.spawnT = 5.5;
    const near = g.world.monsters.filter(m => !m.dead && m.fromNest === this).length;
    if (near >= 3) return;
    const k = MRand.next() < 0.6 ? MK.HUECO : MK.ALACRAN;
    for (let i = 0; i < 8; i++) {
      const a = MRand.next() * Math.PI * 2, x = this.x + Math.cos(a) * 22, y = this.y + Math.sin(a) * 14;
      if (!g.world.blocked(x, y, 5, 3)) { const m = new Monster(k, x, y, 0.8); m.fromNest = this; m.lair = this.lair; m.homeX = this.x; m.homeY = this.y; m.aggro = true; g.world.monsters.push(m); for (let j = 0; j < 8; j++) g.fx.push(Fx.spark(x, y - 6, MRand.gauss() * 30, -20 - MRand.next() * 20, 0x7a3a50, 0.5)); break; }
    }
  }

  boss(g, dt, dx, dy, d) {
    const w = g.world, enraged = this.hp < this.maxHp / 2;
    if (this.charge > 0) {
      this.charge -= dt;
      const sp = enraged ? 190 : 160;
      if (!this.move(w, Math.cos(this.wanderA) * sp * dt, Math.sin(this.wanderA) * sp * dt)) { this.charge = 0; g.shake(0.3); }
      this.moving = true;
      if (Math.hypot(g.player.x - this.x, g.player.y - this.y) < 24 && g.player.invul <= 0) g.hurtPlayer(this.dmg, this.x, this.y);
      return;
    }
    if (this.chargeT > 0) { this.chargeT -= dt; if (this.chargeT <= 0) { this.charge = 0.7; this.wanderA = Math.atan2(dy, dx); Sound.play('roar'); } return; }
    this.shootT -= dt; this.summonT -= dt;
    if (this.shootT <= 0) {
      this.shootT = enraged ? 1.8 : 2.8;
      const n = enraged ? 12 : 8, off = MRand.next();
      for (let i = 0; i < n; i++) { const a = off + i * Math.PI * 2 / n; g.orbs.push({ x: this.x, y: this.y - 18, vx: Math.cos(a) * 70, vy: Math.sin(a) * 70, dmg: (this.dmg >> 1) + 2, life: 5 }); }
      Sound.play('orb');
      if (MRand.next() < (enraged ? 0.6 : 0.4)) this.chargeT = 0.8;
      return;
    }
    if (enraged && this.summonT <= 0) {
      this.summonT = 9;
      for (let i = 0; i < 2; i++) g.spawnNear(MRand.bool() ? MK.HUECO : MK.JABALI, this.x + (i === 0 ? -40 : 40), this.y + 10, 1.3);
      g.toast('La Bestia llama a sus engendros desde el agua...');
    }
    if (d > 30) { const sp = this.speed * (enraged ? 1.4 : 1); this.move(w, dx / d * sp * dt, dy / d * sp * dt); this.moving = true; this.faceTo(dx, dy); }
  }

  // Demonio: vuela en círculos, escupe fuego, cae en picado y desgarra. La espada apenas le hiere; la Luz, sí.
  demon(g, dt, dx, dy, d) {
    const w = g.world, p = g.player, rage = this.hp < this.maxHp / 2;
    if (rage && !this.raged) {
      this.raged = true; Sound.play('roar'); g.shake(0.6);
      g.toast('El demonio llama a los condenados...');
      for (let i = 0; i < 2; i++) g.spawnNear(MK.HUECO, this.x + (i ? -36 : 36), this.y + 12, 1.4);
    }
    if (this.state === 'wind') {
      this.stT -= dt;
      if (this.atkKind !== 'picado') { const l = d || 1; this.ax = dx / l; this.ay = dy / l; }
      this.faceTo(this.ax, this.ay);
      if (this.stT <= 0) { this.setState('atk', { fuego: rage ? 1.1 : 0.85, zarpazo: 0.25, picado: 0.55 }[this.atkKind]); this.fireT = 0; Sound.play(this.atkKind === 'fuego' ? 'roar' : 'swing'); }
      return;
    }
    if (this.state === 'atk') {
      this.stT -= dt;
      let hit = false;
      if (this.atkKind === 'fuego') {
        this.fireT -= dt;
        if (this.fireT <= 0) {
          this.fireT = rage ? 0.06 : 0.09;
          const a = Math.atan2(this.ay, this.ax) + (MRand.next() - 0.5) * 0.7, sp = 140 + MRand.next() * 40;
          g.orbs.push({ x: this.x + this.ax * 12, y: this.y - 26, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, dmg: Math.round(this.dmg * 0.4), life: 0.85, fire: true });
        }
      } else if (this.atkKind === 'picado') {
        this.x += this.ax * 240 * dt; this.y += this.ay * 240 * dt; this.moving = true;
        hit = Math.hypot(p.x - this.x, p.y - this.y) < 16;
      } else hit = Math.hypot(p.x - (this.x + this.ax * 16), p.y - 8 - (this.y - 10 + this.ay * 16)) < 18;
      if (hit && !this.hitDone && p.rolling && !p.dead) { this.hitDone = true; g.perfectDodge(); }
      if (hit && !this.hitDone && p.invul <= 0 && !p.dead) { this.hitDone = true; g.hurtPlayer(this.dmg, this.x, this.y); }
      if (this.stT <= 0) this.setState('rec', rage ? 0.45 : 0.8);
      return;
    }
    if (this.state === 'rec' || this.state === 'stun') { this.stT -= dt; if (this.stT <= 0) { this.state = 'chase'; this.cool = rage ? 0.5 : 0.9; } return; }
    if (!this.aggro) { this.state = 'idle'; this.wander(g, dt); return; }
    this.state = 'chase';
    // vuela en círculo alrededor del Guardián
    const a = Math.atan2(-dy, -dx) + (rage ? 1.1 : 0.7) * dt * 3, R0 = 70;
    const tx = p.x + Math.cos(a) * R0, ty = p.y - 4 + Math.sin(a) * R0 * 0.75;
    const ex = tx - this.x, ey = ty - this.y, el = Math.hypot(ex, ey) || 1, sp = this.speed * (rage ? 1.3 : 1);
    if (el > 2) { this.x += ex / el * Math.min(sp * dt, el); this.y += ey / el * Math.min(sp * dt, el); }
    this.x = Math.max(24, Math.min(w.w * TS - 24, this.x)); this.y = Math.max(30, Math.min(w.h * TS - 10, this.y));
    this.moving = true; this.faceTo(dx, dy);
    if (this.cool <= 0 && d < this.st.range) {
      const l = d || 1; this.ax = dx / l; this.ay = dy / l;
      this.atkKind = d < 34 ? 'zarpazo' : (MRand.next() < (rage ? 0.45 : 0.32) ? 'picado' : 'fuego');
      this.setState('wind', { zarpazo: 0.45, picado: 0.75, fuego: 0.8 }[this.atkKind]);
    }
  }

  frameKey() {
    if (this.state === 'wind') return 'wind';
    if (this.state === 'atk') return 'atk';
    if (this.state === 'stun') return 'wind';
    return this.moving ? (Math.floor(this.anim * 7) % 2 ? 'w1' : 'w0') : 'w0';
  }
  sprite() {
    const E = Art.E, k = this.frameKey();
    let s;
    switch (this.kind) {
      case MK.JABALI: s = E.boar[this.lastH][k]; break;
      case MK.HUECO: s = E.hollow[this.dir][k]; break;
      case MK.ALACRAN: s = E.scorp[this.dir][k]; break;
      case MK.SOMBRA: s = E.shade[k === 'w0' || k === 'w1' ? 'w' + (Math.floor(this.anim * 6) % 3) : k]; break;
      case MK.AHOGADO: s = this.submerged ? E.drown[Math.floor(this.anim * 3) % 2 ? 's1' : 's0'] : E.drown[k]; break;
      case MK.NIDO: s = E.nest[Math.floor(this.anim * 3) % 3]; break;
      case MK.DEMONIO: s = E.demon[this.lastH][k === 'w0' || k === 'w1' ? 'w' + (Math.floor(this.anim * 8) % 3) : k]; break;
      case MK.HUMANO: { const set = this.set || Art.people.malpario; s = set[this.dir][k === 'w1' ? 1 + (Math.floor(this.anim * 7) % 2) : 0]; break; }
      default: s = (this.flash > 0 ? Art.bossHurt : Art.boss)[(this.chargeT > 0 || this.shootT < 0.4) ? 1 : Math.floor(this.anim * 2) % 2];
    }
    if (this.flash > 0 && this.kind !== MK.BESTIA) s = white(s);
    return s;
  }
  ownShadow() { return this.kind === MK.JABALI || this.kind === MK.HUECO || this.kind === MK.ALACRAN || this.kind === MK.NIDO; }
}

const Fx = {
  text: (x, y, s, color) => ({ x, y, vx: 0, vy: -22, life: 0.9, max: 0.9, text: s, color }),
  spark: (x, y, vx, vy, color, life) => ({ x, y, vx, vy, life, max: life, color }),
  ring: (x, y, radius, color) => ({ x, y, vx: 0, vy: 0, radius, ring: true, life: 0.45, max: 0.45, color }),
};
