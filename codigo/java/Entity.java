package guardian;

/** Base de todo lo que se mueve: el Guardián y los monstruos. */
public abstract class Entity {
    public double x, y;            // pies, en píxeles
    public double hw = 5, hh = 3;  // caja de colisión (semiancho, semialto)
    public int dir = 0;            // 0 abajo, 1 arriba, 2 izquierda, 3 derecha
    public double anim;
    public boolean moving;
    public double kbx, kby, kbT;   // retroceso al recibir un golpe
    public double flash;           // destello blanco al ser golpeado
    public int hp, maxHp;
    public boolean dead;

    /** Mueve con colisiones, eje por eje para deslizar junto a las paredes. */
    public boolean move(World w, double dx, double dy) {
        boolean moved = false;
        if (dx != 0) {
            double nx = x + dx;
            if (!w.blocked(nx, y, hw, hh)) { x = nx; moved = true; }
        }
        if (dy != 0) {
            double ny = y + dy;
            if (!w.blocked(x, ny, hw, hh)) { y = ny; moved = true; }
        }
        return moved;
    }

    public void faceTo(double dx, double dy) {
        if (Math.abs(dx) > Math.abs(dy)) dir = dx < 0 ? 2 : 3;
        else if (dy != 0 || dx != 0) dir = dy < 0 ? 1 : 0;
    }

    public double dist(Entity o) { return Math.hypot(o.x - x, o.y - y); }

    public void knock(double fx, double fy, double force) {
        double l = Math.hypot(fx, fy);
        if (l < 0.001) { fx = 0; fy = 1; l = 1; }
        kbx = fx / l * force; kby = fy / l * force; kbT = 0.16;
    }

    protected void applyKnock(World w, double dt) {
        if (kbT > 0) {
            kbT -= dt;
            move(w, kbx * dt, kby * dt);
        }
        if (flash > 0) flash -= dt;
    }
}
