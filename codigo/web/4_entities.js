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
  }
  xpNext() { return Math.floor(25 + 22 * Math.pow(this.lvl, 1.45)); }
  canLight() { return this.lvl >= 3; }
}

const MK = { JABALI: 'JABALI', HUECO: 'HUECO', ALACRAN: 'ALACRAN', SOMBRA: 'SOMBRA', BESTIA: 'BESTIA' };
const MNAME = { JABALI: 'Jabalí podrido', HUECO: 'Hueco', ALACRAN: 'Alacrán gigante', SOMBRA: 'Sombra del barranco', BESTIA: 'La Bestia de La Bolera' };
const MRand = RNG(Date.now() & 0xffff);

class Monster extends Entity {
  constructor(kind, x, y, tier) {
    super();
    this.kind = kind; this.x = x; this.y = y; this.homeX = x; this.homeY = y;
    const st = { JABALI: [30, 8, 46, 8, 7, 3], HUECO: [44, 10, 28, 10, 5, 3], ALACRAN: [26, 11, 40, 9, 5, 4], SOMBRA: [34, 12, 44, 14, 5, 3], BESTIA: [700, 18, 30, 400, 16, 7] }[kind];
    this.maxHp = Math.round(st[0] * tier); this.dmg = Math.round(st[1] * (0.6 + 0.4 * tier)); this.speed = st[2]; this.xp = Math.round(st[3] * tier); this.hw = st[4]; this.hh = st[5];
    this.hp = this.maxHp;
    this.think = 0; this.wanderA = MRand.next() * Math.PI * 2; this.cool = 0; this.charge = 0; this.chargeT = 0; this.shootT = 2.5; this.summonT = 8; this.spawnFade = 0.6;
    this.quest = false; this.aggro = false; this.lastH = 1;
  }
  name() { return MNAME[this.kind]; }
  faceTo(dx, dy) { super.faceTo(dx, dy); if (Math.abs(dx) > 0.01) this.lastH = dx < 0 ? 0 : 1; }
  update(g, dt) {
    const w = g.world, p = g.player;
    if (this.spawnFade > 0) this.spawnFade -= dt;
    this.applyKnock(w, dt);
    if (this.cool > 0) this.cool -= dt;
    this.anim += dt;
    const dx = p.x - this.x, dy = (p.y - 4) - this.y, d = Math.hypot(dx, dy);
    const sense = this.kind === MK.BESTIA ? 400 : (g.isNight() ? 120 : 92);
    if (p.dead || g.playerSafe()) this.aggro = false;
    else if (d < sense) this.aggro = true;
    else if (d > sense * 1.8) this.aggro = false;
    this.moving = false;
    if (this.kbT > 0) return;
    if (this.kind === MK.BESTIA) { this.boss(g, dt, dx, dy, d); return; }
    if (this.aggro) {
      let sp = this.speed;
      if (this.kind === MK.JABALI) {
        if (this.chargeT > 0) {
          this.chargeT -= dt; sp = 0;
          if (this.chargeT <= 0) { this.charge = 0.55; this.faceTo(dx, dy); this.wanderA = Math.atan2(dy, dx); }
          return;
        } else if (this.charge > 0) {
          this.charge -= dt;
          const mx = Math.cos(this.wanderA) * 150 * dt, my = Math.sin(this.wanderA) * 150 * dt;
          if (!this.move(w, mx, my)) this.charge = 0;
          this.moving = true; return;
        } else if (d < 70 && this.cool <= 0) { this.chargeT = 0.45; this.cool = 2.2; return; }
      }
      if (this.kind === MK.ALACRAN) {
        this.think -= dt;
        if (this.think <= 0) { this.think = 0.35; this.wanderA = Math.atan2(dy, dx) + (MRand.next() - 0.5) * 1.4; }
        const mx = Math.cos(this.wanderA) * sp * dt, my = Math.sin(this.wanderA) * sp * dt;
        if (this.move(w, mx, my)) this.moving = true;
        this.faceTo(mx, my); return;
      }
      if (d > 2) {
        const mx = dx / d * sp * dt, my = dy / d * sp * dt;
        if (!this.move(w, mx, my)) { const a = Math.atan2(dy, dx) + (MRand.bool() ? 1.2 : -1.2); this.move(w, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt); }
        this.moving = true; this.faceTo(dx, dy);
      }
    } else {
      this.think -= dt;
      if (this.think <= 0) {
        this.think = 1 + MRand.next() * 2.5;
        this.wanderA = MRand.next() < 0.35 ? NaN : Math.atan2(this.homeY - this.y, this.homeX - this.x) + (MRand.next() - 0.5) * 2.6;
      }
      if (!Number.isNaN(this.wanderA)) {
        const sp = this.speed * 0.4, mx = Math.cos(this.wanderA) * sp * dt, my = Math.sin(this.wanderA) * sp * dt;
        if (this.move(w, mx, my)) { this.moving = true; this.faceTo(mx, my); } else this.think = 0;
      }
    }
  }
  boss(g, dt, dx, dy, d) {
    const w = g.world, enraged = this.hp < this.maxHp / 2;
    if (this.charge > 0) {
      this.charge -= dt;
      const sp = enraged ? 190 : 160;
      if (!this.move(w, Math.cos(this.wanderA) * sp * dt, Math.sin(this.wanderA) * sp * dt)) { this.charge = 0; g.shake(0.3); }
      this.moving = true; return;
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
  sprite() {
    const f2 = this.moving ? Math.floor(this.anim * 8) % 2 : 0, f3 = this.moving ? 1 + Math.floor(this.anim * 7) % 2 : 0;
    let s;
    switch (this.kind) {
      case MK.JABALI: s = Art.boar[this.lastH][this.chargeT > 0 ? Math.floor(this.anim * 20) % 2 : f2]; break;
      case MK.HUECO: s = Art.hollow[this.dir][f3]; break;
      case MK.ALACRAN: s = Art.scorpion[this.dir][f2]; break;
      case MK.SOMBRA: s = Art.shade[Math.floor(this.anim * 6) % 3]; break;
      default: s = (this.flash > 0 ? Art.bossHurt : Art.boss)[(this.chargeT > 0 || this.shootT < 0.4) ? 1 : Math.floor(this.anim * 2) % 2];
    }
    if (this.flash > 0 && this.kind !== MK.BESTIA) s = white(s);
    return s;
  }
}

const Fx = {
  text: (x, y, s, color) => ({ x, y, vx: 0, vy: -22, life: 0.9, max: 0.9, text: s, color }),
  spark: (x, y, vx, vy, color, life) => ({ x, y, vx, vy, life, max: life, color }),
  ring: (x, y, radius, color) => ({ x, y, vx: 0, vy: 0, radius, ring: true, life: 0.45, max: 0.45, color }),
};
