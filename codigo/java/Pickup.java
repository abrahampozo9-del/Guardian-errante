package guardian;

/** Objetos en el suelo: hierbas medicinales y reliquias. */
public class Pickup {
    public static final int HERB = 0, RELIC = 1, SWORD = 2;
    public double x, y;
    public int type;
    public String id;
    public double t;

    public Pickup(int type, double x, double y, String id) { this.type = type; this.x = x; this.y = y; this.id = id; }
}
