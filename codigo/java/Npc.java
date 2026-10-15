package guardian;

import java.awt.image.BufferedImage;

/** Supervivientes y animales con los que se puede hablar. */
public class Npc {
    public double x, y;
    public int dir;
    public String name, key;
    public BufferedImage[][] set;   // personas
    public BufferedImage single, alt; // animales
    public double anim;
    public double wanderT;

    public Npc(String name, String key, BufferedImage[][] set, double x, double y, int dir) {
        this.name = name; this.key = key; this.set = set; this.x = x; this.y = y; this.dir = dir;
    }

    public Npc(String name, String key, BufferedImage single, BufferedImage alt, double x, double y) {
        this.name = name; this.key = key; this.single = single; this.alt = alt; this.x = x; this.y = y;
    }

    public BufferedImage sprite(double time) {
        if (set != null) return set[dir][0];
        if (alt != null && ((int) (time * 2 + x) % 4 == 0)) return alt;
        return single;
    }
}
