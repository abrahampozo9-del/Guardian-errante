package guardian;

/** Proyectil de agua oscura que lanza la Bestia. */
public class Orb {
    public double x, y, vx, vy, life = 5;
    public int dmg;

    public Orb(double x, double y, double vx, double vy, int dmg) { this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.dmg = dmg; }
}
