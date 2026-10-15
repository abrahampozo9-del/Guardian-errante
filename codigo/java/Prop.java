package guardian;

import java.awt.image.BufferedImage;

/** Objeto del escenario: árboles, muebles, coches... Se dibuja ordenado por su base (y). */
public class Prop {
    public BufferedImage img;
    public double x, y;          // centro de la base, en píxeles
    public String id;            // identificador para interacciones (puede ser null)
    public boolean wallDecor;    // decoración de pared: se dibuja sin ordenar, debajo de todo
    public int anim;             // 0 nada; 1 hoguera
    public boolean hidden;

    public Prop(BufferedImage img, double x, double y) { this.img = img; this.x = x; this.y = y; }

    public int left() { return (int) Math.round(x - img.getWidth() / 2.0); }
    public int top() { return (int) Math.round(y - img.getHeight()); }
}
