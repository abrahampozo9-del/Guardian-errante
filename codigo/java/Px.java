package guardian;

import java.awt.image.BufferedImage;
import java.util.Random;

/** Utilidades para pintar pixel art píxel a píxel. */
public final class Px {
    private Px() {}

    public static BufferedImage img(int w, int h) {
        return new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
    }

    public static void p(BufferedImage b, int x, int y, int c) {
        if (x >= 0 && y >= 0 && x < b.getWidth() && y < b.getHeight()) b.setRGB(x, y, 0xff000000 | c);
    }

    /** Pixel con alfa explícito (c en formato 0xAARRGGBB). */
    public static void pa(BufferedImage b, int x, int y, int argb) {
        if (x >= 0 && y >= 0 && x < b.getWidth() && y < b.getHeight()) b.setRGB(x, y, argb);
    }

    public static boolean opaque(BufferedImage b, int x, int y) {
        if (x < 0 || y < 0 || x >= b.getWidth() || y >= b.getHeight()) return false;
        return (b.getRGB(x, y) >>> 24) > 0;
    }

    public static void r(BufferedImage b, int x, int y, int w, int h, int c) {
        for (int j = y; j < y + h; j++) for (int i = x; i < x + w; i++) p(b, i, j, c);
    }

    public static void ov(BufferedImage b, double cx, double cy, double rx, double ry, int c) {
        for (int y = (int) Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
            for (int x = (int) Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
                double dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
                if (dx * dx + dy * dy <= 1.0) p(b, x, y, c);
            }
    }

    /** Elipse semitransparente (sombra). */
    public static void ova(BufferedImage b, double cx, double cy, double rx, double ry, int argb) {
        for (int y = (int) Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
            for (int x = (int) Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
                double dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
                if (dx * dx + dy * dy <= 1.0) pa(b, x, y, argb);
            }
    }

    public static void line(BufferedImage b, int x0, int y0, int x1, int y1, int c) {
        int dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
        while (true) {
            p(b, x0, y0, c);
            if (x0 == x1 && y0 == y1) break;
            int e2 = 2 * err;
            if (e2 >= dy) { err += dy; x0 += sx; }
            if (e2 <= dx) { err += dx; y0 += sy; }
        }
    }

    public static void speck(BufferedImage b, int x, int y, int w, int h, int c, double dens, Random rnd) {
        for (int j = y; j < y + h; j++) for (int i = x; i < x + w; i++) if (rnd.nextDouble() < dens) p(b, i, j, c);
    }

    /** Añade contorno de 1px alrededor de los píxeles opacos. */
    public static void outline(BufferedImage b, int c) {
        int w = b.getWidth(), h = b.getHeight();
        boolean[] mark = new boolean[w * h];
        for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
            if (opaque(b, x, y)) continue;
            if (opaque(b, x - 1, y) || opaque(b, x + 1, y) || opaque(b, x, y - 1) || opaque(b, x, y + 1)) mark[y * w + x] = true;
        }
        for (int i = 0; i < mark.length; i++) if (mark[i]) b.setRGB(i % w, i / w, 0xff000000 | c);
    }

    public static int shade(int c, double f) {
        int r = (int) Math.max(0, Math.min(255, ((c >> 16) & 255) * f));
        int g = (int) Math.max(0, Math.min(255, ((c >> 8) & 255) * f));
        int bl = (int) Math.max(0, Math.min(255, (c & 255) * f));
        return (r << 16) | (g << 8) | bl;
    }

    public static int mix(int a, int b, double t) {
        int r = (int) (((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t);
        int g = (int) (((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t);
        int bl = (int) ((a & 255) * (1 - t) + (b & 255) * t);
        return (r << 16) | (g << 8) | bl;
    }

    public static BufferedImage flipH(BufferedImage s) {
        BufferedImage d = img(s.getWidth(), s.getHeight());
        for (int y = 0; y < s.getHeight(); y++) for (int x = 0; x < s.getWidth(); x++)
            d.setRGB(s.getWidth() - 1 - x, y, s.getRGB(x, y));
        return d;
    }

    public static BufferedImage flipV(BufferedImage s) {
        BufferedImage d = img(s.getWidth(), s.getHeight());
        for (int y = 0; y < s.getHeight(); y++) for (int x = 0; x < s.getWidth(); x++)
            d.setRGB(x, s.getHeight() - 1 - y, s.getRGB(x, y));
        return d;
    }

    /** Rota 90º en sentido horario. */
    public static BufferedImage rot90(BufferedImage s) {
        BufferedImage d = img(s.getHeight(), s.getWidth());
        for (int y = 0; y < s.getHeight(); y++) for (int x = 0; x < s.getWidth(); x++)
            d.setRGB(s.getHeight() - 1 - y, x, s.getRGB(x, y));
        return d;
    }

    public static BufferedImage copy(BufferedImage s) {
        BufferedImage d = img(s.getWidth(), s.getHeight());
        d.getGraphics().drawImage(s, 0, 0, null);
        return d;
    }

    /** Versión teñida en blanco (destello al recibir daño). */
    public static BufferedImage tint(BufferedImage s, int c) {
        BufferedImage d = img(s.getWidth(), s.getHeight());
        for (int y = 0; y < s.getHeight(); y++) for (int x = 0; x < s.getWidth(); x++) {
            int a = s.getRGB(x, y) >>> 24;
            if (a > 0) d.setRGB(x, y, (a << 24) | c);
        }
        return d;
    }

    /** Mosaico tipo Voronoi para piedras, baldosas irregulares, etc. */
    public static void voronoi(BufferedImage b, int x0, int y0, int w, int h, int n, int[] cols, int border, Random rnd) {
        double[] sx = new double[n], sy = new double[n];
        int[] cc = new int[n];
        for (int i = 0; i < n; i++) {
            sx[i] = rnd.nextDouble() * w; sy[i] = rnd.nextDouble() * h; cc[i] = cols[rnd.nextInt(cols.length)];
        }
        int[] owner = new int[w * h];
        for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
            double best = 1e9, second = 1e9; int bi = 0;
            for (int i = 0; i < n; i++) {
                // distancia toroidal para que el mosaico sea continuo entre casillas
                double dx = Math.abs(x + 0.5 - sx[i]); dx = Math.min(dx, w - dx);
                double dy = Math.abs(y + 0.5 - sy[i]); dy = Math.min(dy, h - dy);
                double d = Math.sqrt(dx * dx + dy * dy);
                if (d < best) { second = best; best = d; bi = i; } else if (d < second) second = d;
            }
            owner[y * w + x] = bi;
            p(b, x0 + x, y0 + y, (second - best) < 0.9 ? border : cc[bi]);
        }
    }
}
