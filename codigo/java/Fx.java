package guardian;

/** Partículas y números flotantes. */
public class Fx {
    public double x, y, vx, vy, life, max, grav;
    public int color, size = 1;
    public String text;
    public boolean ring;  // onda expansiva (Luz)
    public double radius;

    public static Fx text(double x, double y, String s, int color) {
        Fx f = new Fx(); f.x = x; f.y = y; f.vy = -22; f.life = f.max = 0.9; f.text = s; f.color = color; return f;
    }

    public static Fx spark(double x, double y, double vx, double vy, int color, double life) {
        Fx f = new Fx(); f.x = x; f.y = y; f.vx = vx; f.vy = vy; f.life = f.max = life; f.color = color; return f;
    }

    public static Fx ring(double x, double y, double radius, int color) {
        Fx f = new Fx(); f.x = x; f.y = y; f.radius = radius; f.ring = true; f.life = f.max = 0.45; f.color = color; return f;
    }
}
