package guardian;

import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.List;

/** Un mapa del juego (exterior o interior). */
public class World {
    public static final int TS = 16;

    public final String id;
    public final int w, h;
    public final int[] t;
    public final boolean[] blk;
    public boolean outdoor;
    public String defaultArea = "";
    public final List<Prop> props = new ArrayList<>();
    public final List<Prop> decor = new ArrayList<>();
    public final List<Warp> warps = new ArrayList<>();
    public final List<Npc> npcs = new ArrayList<>();
    public final List<Monster> monsters = new ArrayList<>();
    public final List<Pickup> pickups = new ArrayList<>();
    public final List<Area> areas = new ArrayList<>();

    public static class Warp {
        public int x, y, w, h; public String to; public double tx, ty; public int dir; public String label;
        public Warp(int x, int y, int w, int h, String to, double tx, double ty, int dir) {
            this.x = x; this.y = y; this.w = w; this.h = h; this.to = to; this.tx = tx; this.ty = ty; this.dir = dir;
        }
    }

    public static class Area {
        public String name; public int x, y, w, h; public boolean safe, noSpawn; public double tier = 1;
        public Area(String name, int x, int y, int w, int h) { this.name = name; this.x = x; this.y = y; this.w = w; this.h = h; }
        public boolean in(int tx, int ty) { return tx >= x && ty >= y && tx < x + w && ty < y + h; }
    }

    public World(String id, int w, int h, int fill) {
        this.id = id; this.w = w; this.h = h;
        t = new int[w * h]; blk = new boolean[w * h];
        java.util.Arrays.fill(t, fill);
    }

    public int get(int x, int y) {
        if (x < 0 || y < 0 || x >= w || y >= h) return T.VOID;
        return t[y * w + x];
    }

    public void set(int x, int y, int v) { if (x >= 0 && y >= 0 && x < w && y < h) t[y * w + x] = v; }

    public void fill(int x, int y, int ww, int hh, int v) {
        for (int j = y; j < y + hh; j++) for (int i = x; i < x + ww; i++) set(i, j, v);
    }

    public void block(int x, int y, int ww, int hh) {
        for (int j = y; j < y + hh; j++) for (int i = x; i < x + ww; i++) if (i >= 0 && j >= 0 && i < w && j < h) blk[j * w + i] = true;
    }

    public void unblock(int x, int y, int ww, int hh) {
        for (int j = y; j < y + hh; j++) for (int i = x; i < x + ww; i++) if (i >= 0 && j >= 0 && i < w && j < h) blk[j * w + i] = false;
    }

    public boolean solid(int x, int y) {
        if (x < 0 || y < 0 || x >= w || y >= h) return true;
        return T.SOLID[t[y * w + x]] || blk[y * w + x];
    }

    /** ¿Choca una caja (centro cx,cy; semiancho hw, semialto hh) con algo sólido? */
    public boolean blocked(double cx, double cy, double hw, double hh) {
        int x0 = (int) Math.floor((cx - hw) / TS), x1 = (int) Math.floor((cx + hw - 0.01) / TS);
        int y0 = (int) Math.floor((cy - hh) / TS), y1 = (int) Math.floor((cy + hh - 0.01) / TS);
        for (int y = y0; y <= y1; y++) for (int x = x0; x <= x1; x++) if (solid(x, y)) return true;
        return false;
    }

    /** Coloca un objeto con su base en la casilla (tx,ty), opcionalmente bloqueando casillas. */
    public Prop prop(String key, double tx, double ty) {
        BufferedImage im = Art.P.get(key);
        if (im == null) throw new IllegalArgumentException("Falta el dibujo " + key);
        Prop p = new Prop(im, tx * TS + 8, ty * TS + 15);
        props.add(p);
        return p;
    }

    public Prop prop(String key, double tx, double ty, int bx, int by, int bw, int bh) {
        Prop p = prop(key, tx, ty);
        block(bx, by, bw, bh);
        return p;
    }

    /** Decoración pegada a la pared (se dibuja encima de las casillas, debajo de los personajes). */
    public Prop wall(String key, double px, double py) {
        BufferedImage im = Art.P.get(key);
        if (im == null) throw new IllegalArgumentException("Falta el dibujo " + key);
        Prop p = new Prop(im, px, py);
        p.wallDecor = true;
        decor.add(p);
        return p;
    }

    public java.util.function.BiFunction<Integer, Integer, Area> regionFn;

    public Area areaAt(int tx, int ty) {
        for (Area a : areas) if (a.in(tx, ty)) return a;
        return regionFn != null ? regionFn.apply(tx, ty) : null;
    }

    public boolean noSpawnAt(int tx, int ty) {
        Area a = areaAt(tx, ty);
        return a != null && (a.noSpawn || a.safe);
    }

    public double tierAt(int tx, int ty) {
        Area a = areaAt(tx, ty);
        return a != null ? a.tier : 1;
    }

    public String areaName(int tx, int ty) {
        Area a = areaAt(tx, ty);
        return a != null ? a.name : defaultArea;
    }

    public boolean safeAt(int tx, int ty) {
        Area a = areaAt(tx, ty);
        return a != null && a.safe;
    }
}
