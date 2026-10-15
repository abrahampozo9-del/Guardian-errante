package guardian;

import java.awt.image.BufferedImage;
import java.util.Random;

/** Engendros que acabaron con casi toda la humanidad. */
public class Monster extends Entity {
    public enum Kind { JABALI, HUECO, ALACRAN, SOMBRA, BESTIA }

    public final Kind kind;
    public int dmg, xp;
    public double speed;
    public double think, wanderA, cool, charge, chargeT, shootT, summonT, spawnFade;
    public double homeX, homeY;
    public boolean quest, aggro;
    private static final Random R = new Random();

    public Monster(Kind k, double x, double y, double tier) {
        this.kind = k; this.x = x; this.y = y; this.homeX = x; this.homeY = y;
        switch (k) {
            case JABALI -> { maxHp = 30; dmg = 8; speed = 46; xp = 8; hw = 7; hh = 3; }
            case HUECO -> { maxHp = 44; dmg = 10; speed = 28; xp = 10; }
            case ALACRAN -> { maxHp = 26; dmg = 11; speed = 40; xp = 9; hw = 5; hh = 4; }
            case SOMBRA -> { maxHp = 34; dmg = 12; speed = 44; xp = 14; }
            case BESTIA -> { maxHp = 700; dmg = 18; speed = 30; xp = 400; hw = 16; hh = 7; }
        }
        maxHp = (int) Math.round(maxHp * tier);
        dmg = (int) Math.round(dmg * (0.6 + 0.4 * tier));
        xp = (int) Math.round(xp * tier);
        hp = maxHp;
        wanderA = R.nextDouble() * Math.PI * 2;
        spawnFade = 0.6;
        shootT = 2.5; summonT = 8;
    }

    public int lastH = 1;

    @Override
    public void faceTo(double dx, double dy) {
        super.faceTo(dx, dy);
        if (Math.abs(dx) > 0.01) lastH = dx < 0 ? 0 : 1;
    }

    public String name() {
        return switch (kind) {
            case JABALI -> "Jabalí podrido";
            case HUECO -> "Hueco";
            case ALACRAN -> "Alacrán gigante";
            case SOMBRA -> "Sombra del barranco";
            case BESTIA -> "La Bestia de La Bolera";
        };
    }

    public void update(Game g, double dt) {
        World w = g.world;
        Player p = g.player;
        if (spawnFade > 0) spawnFade -= dt;
        applyKnock(w, dt);
        if (cool > 0) cool -= dt;
        anim += dt;
        double dx = p.x - x, dy = (p.y - 4) - y;
        double d = Math.hypot(dx, dy);
        double sense = kind == Kind.BESTIA ? 400 : (g.isNight() ? 120 : 92);
        if (p.dead || g.playerSafe()) { aggro = false; }
        else if (d < sense) aggro = true;
        else if (d > sense * 1.8) aggro = false;

        moving = false;
        if (kbT > 0) return;

        if (kind == Kind.BESTIA) { bossLogic(g, dt, dx, dy, d); return; }

        if (aggro) {
            double sp = speed;
            if (kind == Kind.JABALI) {
                // Embestida: se para, carga y sale disparado
                if (chargeT > 0) {
                    chargeT -= dt;
                    sp = 0;
                    if (chargeT <= 0) { charge = 0.55; faceTo(dx, dy); wanderA = Math.atan2(dy, dx); }
                } else if (charge > 0) {
                    charge -= dt;
                    sp = 150;
                    double mx = Math.cos(wanderA) * sp * dt, my = Math.sin(wanderA) * sp * dt;
                    if (!move(w, mx, my)) charge = 0;
                    moving = true;
                    return;
                } else if (d < 70 && cool <= 0) {
                    chargeT = 0.45; cool = 2.2;
                    return;
                }
            }
            if (kind == Kind.ALACRAN) {
                think -= dt;
                if (think <= 0) { think = 0.35; wanderA = Math.atan2(dy, dx) + (R.nextDouble() - 0.5) * 1.4; }
                double mx = Math.cos(wanderA) * sp * dt, my = Math.sin(wanderA) * sp * dt;
                if (move(w, mx, my)) moving = true;
                faceTo(mx, my);
                return;
            }
            if (d > 2) {
                double mx = dx / d * sp * dt, my = dy / d * sp * dt;
                if (!move(w, mx, my)) {
                    // rodear obstáculos
                    double a = Math.atan2(dy, dx) + (R.nextBoolean() ? 1.2 : -1.2);
                    move(w, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt);
                }
                moving = true;
                faceTo(dx, dy);
            }
        } else {
            think -= dt;
            if (think <= 0) {
                think = 1 + R.nextDouble() * 2.5;
                wanderA = R.nextDouble() < 0.35 ? Double.NaN : Math.atan2(homeY - y, homeX - x) + (R.nextDouble() - 0.5) * 2.6;
            }
            if (!Double.isNaN(wanderA)) {
                double sp = speed * 0.4;
                double mx = Math.cos(wanderA) * sp * dt, my = Math.sin(wanderA) * sp * dt;
                if (move(w, mx, my)) { moving = true; faceTo(mx, my); } else think = 0;
            }
        }
    }

    private void bossLogic(Game g, double dt, double dx, double dy, double d) {
        World w = g.world;
        boolean enraged = hp < maxHp / 2;
        if (charge > 0) {
            charge -= dt;
            double sp = enraged ? 190 : 160;
            if (!move(w, Math.cos(wanderA) * sp * dt, Math.sin(wanderA) * sp * dt)) { charge = 0; g.shake(0.3); }
            moving = true;
            return;
        }
        if (chargeT > 0) {
            chargeT -= dt;
            if (chargeT <= 0) { charge = 0.7; wanderA = Math.atan2(dy, dx); g.sfx("roar"); }
            return;
        }
        shootT -= dt;
        summonT -= dt;
        if (shootT <= 0) {
            shootT = enraged ? 1.8 : 2.8;
            int n = enraged ? 12 : 8;
            double off = R.nextDouble();
            for (int i = 0; i < n; i++) {
                double a = off + i * Math.PI * 2 / n;
                g.orbs.add(new Orb(x, y - 18, Math.cos(a) * 70, Math.sin(a) * 70, dmg / 2 + 2));
            }
            g.sfx("orb");
            if (R.nextDouble() < (enraged ? 0.6 : 0.4)) chargeT = 0.8;
            return;
        }
        if (enraged && summonT <= 0) {
            summonT = 9;
            for (int i = 0; i < 2; i++) g.spawnNear(R.nextBoolean() ? Kind.HUECO : Kind.JABALI, x + (i == 0 ? -40 : 40), y + 10, 1.3);
            g.say("La Bestia llama a sus engendros desde el agua...");
        }
        if (d > 30) {
            double sp = speed * (enraged ? 1.4 : 1);
            move(w, dx / d * sp * dt, dy / d * sp * dt);
            moving = true;
            faceTo(dx, dy);
        }
    }

    public BufferedImage sprite() {
        int f2 = moving ? ((int) (anim * 8) % 2) : 0;
        int f3 = moving ? 1 + ((int) (anim * 7) % 2) : 0;
        BufferedImage s = switch (kind) {
            case JABALI -> Art.boar[lastH][chargeT > 0 ? (int) (anim * 20) % 2 : f2];
            case HUECO -> Art.hollow[dir][f3];
            case ALACRAN -> Art.scorpion[dir][f2];
            case SOMBRA -> Art.shade[(int) (anim * 6) % 3];
            case BESTIA -> (flash > 0 ? Art.bossHurt : Art.boss)[(chargeT > 0 || shootT < 0.4) ? 1 : (int) (anim * 2) % 2];
        };
        if (flash > 0 && kind != Kind.BESTIA) s = Px.tint(s, 0xffffff);
        return s;
    }
}
