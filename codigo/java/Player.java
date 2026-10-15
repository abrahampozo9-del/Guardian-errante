package guardian;

/** El Guardián Errante. */
public class Player extends Entity {
    public int fe, maxFe, lvl = 1, xp, atk, herbs, relics;
    public double feAcc;
    public boolean hasSword;
    public double atkT, atkCool, invul, prayT, lightT;
    public boolean hitThisSwing;
    public final java.util.Set<Monster> hitSet = new java.util.HashSet<>();

    public Player() {
        hw = 5; hh = 3;
        maxHp = hp = 100;
        maxFe = fe = 60;
        atk = 12;
    }

    public int xpNext() { return (int) (25 + 22 * Math.pow(lvl, 1.45)); }

    public boolean canLight() { return lvl >= 3; }

    public void applyKnockPublic(World w, double dt) { applyKnock(w, dt); }
}
