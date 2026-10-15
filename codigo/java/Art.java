package guardian;

import java.awt.image.BufferedImage;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import static guardian.Px.*;

/**
 * Todo el pixel art del juego, generado por código al arrancar (sin archivos externos).
 * Paleta inspirada en el Guadalentín: caliza clara, olivar, agua turquesa y teja roja.
 */
public final class Art {
    public static final int TS = 16;
    public static final int VARIANTS = 4;

    public static BufferedImage[][][] tiles = new BufferedImage[T.COUNT][VARIANTS][];
    public static int[] tileColor = new int[T.COUNT];

    public static final Map<String, BufferedImage> P = new HashMap<>();

    // Personajes: [dir][frame]  dir: 0 abajo, 1 arriba, 2 izquierda, 3 derecha
    public static BufferedImage[][] hero, heroAtk;
    public static BufferedImage[][] hollow, scorpion;
    public static BufferedImage[][] boar; // [0 izq,1 der][frame]
    public static BufferedImage[] shade, boss, bossHurt, campfire;
    public static BufferedImage sword, orb, relic, herb, cat, dog, dogB;
    public static final Map<String, BufferedImage[][]> people = new HashMap<>();

    private static Random rnd = new Random(1);

    public static void init() {
        for (int id = 0; id < T.COUNT; id++) {
            for (int v = 0; v < VARIANTS; v++) {
                int frames = (id == T.WATER || id == T.DEEP) ? 4 : 1;
                tiles[id][v] = new BufferedImage[frames];
                for (int f = 0; f < frames; f++) {
                    rnd = new Random(id * 1000 + v * 37 + 11);
                    tiles[id][v][f] = makeTile(id, v, f);
                }
            }
            tileColor[id] = average(tiles[id][0][0]);
        }
        makeCharacters();
        makeProps();
    }

    public static BufferedImage tile(int id, int x, int y, int frame) {
        BufferedImage[][] t = tiles[id];
        int v = ((x * 73856093) ^ (y * 19349663)) & 0x7fffffff;
        BufferedImage[] f = t[v % VARIANTS];
        return f[frame % f.length];
    }

    static int average(BufferedImage b) {
        long r = 0, g = 0, bl = 0, n = 0;
        for (int y = 0; y < b.getHeight(); y++) for (int x = 0; x < b.getWidth(); x++) {
            int c = b.getRGB(x, y);
            if ((c >>> 24) == 0) continue;
            r += (c >> 16) & 255; g += (c >> 8) & 255; bl += c & 255; n++;
        }
        if (n == 0) return 0;
        return (int) ((r / n) << 16 | (g / n) << 8 | (bl / n));
    }

    // ------------------------------------------------------------------ CASILLAS
    static void ground(BufferedImage b, int base, int d1, int l1, double dd, double dl) {
        r(b, 0, 0, 16, 16, base);
        speck(b, 0, 0, 16, 16, d1, dd, rnd);
        speck(b, 0, 0, 16, 16, l1, dl, rnd);
    }

    static void tuft(BufferedImage b, int x, int y, int c) {
        p(b, x, y, c); p(b, x - 1, y - 1, c); p(b, x + 1, y - 1, c); p(b, x, y - 1, c);
    }

    static void pebble(BufferedImage b, int x, int y, int c) {
        p(b, x, y, c); p(b, x + 1, y, c); p(b, x, y + 1, shade(c, 0.8)); p(b, x + 1, y + 1, shade(c, 0.8));
    }

    static void plinth(BufferedImage b, int y0) {
        voronoi(b, 0, y0, 16, 16 - y0, 5, new int[]{0xc9a46c, 0xb8925a, 0xd6b47c}, 0xe2d4b6, rnd);
    }

    static BufferedImage makeTile(int id, int v, int f) {
        BufferedImage b = img(16, 16);
        switch (id) {
            case T.VOID -> r(b, 0, 0, 16, 16, 0x0b0907);
            case T.GRASS -> {
                ground(b, 0xa39d5c, 0x8f8a4c, 0xb7b06e, 0.22, 0.12);
                for (int i = 0; i < 2 + v; i++) tuft(b, 2 + rnd.nextInt(12), 3 + rnd.nextInt(12), 0x6f7a3a);
                if (v == 3) pebble(b, rnd.nextInt(13), rnd.nextInt(13), 0xc8bc9a);
            }
            case T.GRASS_GREEN -> {
                ground(b, 0x7f8e45, 0x6c7a38, 0x96a352, 0.25, 0.15);
                for (int i = 0; i < 3 + v; i++) tuft(b, 2 + rnd.nextInt(12), 3 + rnd.nextInt(12), 0x55662b);
            }
            case T.DIRT -> {
                ground(b, 0xcdb98e, 0xbca87c, 0xddcca4, 0.22, 0.12);
                for (int i = 0; i < v + 1; i++) pebble(b, rnd.nextInt(14), rnd.nextInt(14), 0xa8967a);
            }
            case T.TRACK -> {
                ground(b, 0xd9c8a0, 0xc8b68c, 0xe6d8b6, 0.2, 0.15);
                for (int i = 0; i < 2; i++) pebble(b, rnd.nextInt(14), rnd.nextInt(14), 0xb7a684);
            }
            case T.FIELD -> {
                ground(b, 0xb27a58, 0x9e684a, 0xc08a66, 0.2, 0.1);
                for (int y = 1; y < 16; y += 4) for (int x = 0; x < 16; x++) if (rnd.nextDouble() < 0.85) p(b, x, y, 0x93604a);
            }
            case T.SAND -> {
                ground(b, 0xcdbf9f, 0xbcae8e, 0xddd2b8, 0.2, 0.1);
                for (int i = 0; i < 5; i++) pebble(b, rnd.nextInt(14), rnd.nextInt(14), rnd.nextBoolean() ? 0xa9a49a : 0xe8e2d2);
            }
            case T.ASPHALT -> {
                ground(b, 0x56565b, 0x4b4b50, 0x626267, 0.3, 0.2);
                int x = rnd.nextInt(16), y = rnd.nextInt(16);
                for (int i = 0; i < 8; i++) { p(b, x, y, 0x38383c); x += rnd.nextInt(3) - 1; y += 1; }
                if (v == 2) tuft(b, 4 + rnd.nextInt(8), 5 + rnd.nextInt(8), 0x7b8a3f);
            }
            case T.PAVING -> {
                r(b, 0, 0, 16, 16, 0x8f897c);
                for (int y = 0; y < 16; y += 4) for (int x = ((y / 4) % 2) * 2; x < 18; x += 4) {
                    int c = rnd.nextBoolean() ? 0xbdb6a8 : 0xaaa395;
                    r(b, x, y, 3, 3, c); p(b, x, y, shade(c, 1.08));
                }
            }
            case T.CONCRETE -> {
                ground(b, 0xd8cfbb, 0xcbc1ad, 0xe4dcca, 0.25, 0.15);
                if (v == 1) { int x = rnd.nextInt(10) + 3; for (int y = 0; y < 9; y++) p(b, x + (y % 3 == 0 ? 1 : 0), y + 4, 0xb5ab98); }
            }
            case T.TERRACE -> voronoi(b, 0, 0, 16, 16, 7, new int[]{0xcdb9a6, 0xbfa996, 0xd8c8b4}, 0x9c8878, rnd);
            case T.WATER -> {
                r(b, 0, 0, 16, 16, 0x3a9e98);
                speck(b, 0, 0, 16, 16, 0x34928d, 0.25, rnd);
                Random wr = new Random(v * 31 + 5);
                for (int i = 0; i < 4; i++) {
                    int x = wr.nextInt(16), y = wr.nextInt(16);
                    int xx = (x + f * 2) % 16;
                    for (int k = 0; k < 3; k++) p(b, (xx + k) % 16, y, 0x7fcfc6);
                }
                if ((f + v) % 4 == 0) p(b, wr.nextInt(16), wr.nextInt(16), 0xd8f4ef);
            }
            case T.DEEP -> {
                r(b, 0, 0, 16, 16, 0x2b6e86);
                speck(b, 0, 0, 16, 16, 0x276580, 0.3, rnd);
                Random wr = new Random(v * 17 + 3);
                for (int i = 0; i < 3; i++) {
                    int x = wr.nextInt(16), y = wr.nextInt(16);
                    int xx = (x + f) % 16;
                    for (int k = 0; k < 4; k++) p(b, (xx + k) % 16, y, 0x4f93ab);
                }
            }
            case T.CLIFF -> {
                r(b, 0, 0, 16, 16, 0xc2ab82);
                for (int x = 0; x < 16; x++) {
                    int len = 3 + rnd.nextInt(10), y0 = rnd.nextInt(16);
                    if (rnd.nextDouble() < 0.55) for (int y = y0; y < y0 + len; y++) p(b, x, y % 16, rnd.nextBoolean() ? 0xa68e66 : 0xb39b72);
                }
                for (int x = 0; x < 16; x++) if (rnd.nextDouble() < 0.4) p(b, x, rnd.nextInt(16), 0xdcc9a2);
                if (v == 1) for (int i = 0; i < 3; i++) pebble(b, rnd.nextInt(14), rnd.nextInt(14), 0x8a7656);
            }
            case T.MOUNTAIN -> {
                voronoi(b, 0, 0, 16, 16, 4, new int[]{0x9d978c, 0x8e887d, 0xa8a297}, 0x6f6a61, rnd);
                speck(b, 0, 0, 16, 16, 0xbab4a8, 0.06, rnd);
                if (v >= 2) tuft(b, 3 + rnd.nextInt(10), 4 + rnd.nextInt(10), 0x5d6a35);
            }
            case T.WALL_WHITE -> {
                ground(b, 0xf2eee6, 0xe5dfd3, 0xfbf9f4, 0.15, 0.08);
                plinth(b, 12);
            }
            case T.WALL_STONE -> voronoi(b, 0, 0, 16, 16, 7, new int[]{0xc9a46c, 0xb8925a, 0xd6b47c, 0xbf9a62}, 0xe6dcc4, rnd);
            case T.WINDOW -> {
                ground(b, 0xf2eee6, 0xe5dfd3, 0xfbf9f4, 0.15, 0.08);
                plinth(b, 13);
                r(b, 3, 1, 10, 11, 0xc9a46c); r(b, 4, 2, 8, 9, 0xb08a52);
                r(b, 5, 3, 6, 7, 0x2f3c44);
                for (int x = 5; x < 11; x += 2) r(b, x, 3, 1, 7, 0x1d1d1d);
                r(b, 5, 6, 6, 1, 0x1d1d1d);
                r(b, 1, 2, 2, 9, 0x9a6a36); r(b, 13, 2, 2, 9, 0x9a6a36);
                p(b, 1, 6, 0x6e4524); p(b, 14, 6, 0x6e4524);
            }
            case T.DOOR -> {
                ground(b, 0xf2eee6, 0xe5dfd3, 0xfbf9f4, 0.15, 0.08);
                r(b, 2, 1, 12, 15, 0xc9a46c);
                r(b, 3, 2, 10, 14, 0x8a5a2e);
                for (int x = 5; x < 13; x += 3) r(b, x, 2, 1, 14, 0x6e4524);
                for (int y = 4; y < 16; y += 4) { p(b, 4, y, 0xd8c890); p(b, 11, y, 0xd8c890); }
                r(b, 10, 9, 2, 1, 0x2a2a2a);
            }
            case T.ROOF, T.ROOF_SOLAR, T.ROOF_DARK, T.CHURCH_ROOF -> {
                int base = id == T.ROOF_DARK ? 0x8e4b34 : id == T.CHURCH_ROOF ? 0xb4583a : 0xc4623e;
                r(b, 0, 0, 16, 16, base);
                for (int y = 0; y < 16; y += 4) {
                    r(b, 0, y + 3, 16, 1, shade(base, 0.72));
                    for (int x = (y / 4 % 2) * 2; x < 16; x += 4) { p(b, x, y, shade(base, 0.85)); p(b, x, y + 1, shade(base, 0.85)); p(b, x + 1, y, shade(base, 1.18)); }
                }
                speck(b, 0, 0, 16, 16, shade(base, 0.9), 0.08, rnd);
                if (id == T.ROOF_SOLAR) {
                    r(b, 1, 2, 14, 12, 0xc0c8d0);
                    r(b, 2, 3, 12, 10, 0x2c3e66);
                    for (int x = 5; x < 14; x += 3) r(b, x, 3, 1, 10, 0x6880aa);
                    r(b, 2, 8, 12, 1, 0x6880aa);
                    p(b, 3, 4, 0x9ab4e0);
                }
            }
            case T.SHED -> {
                r(b, 0, 0, 16, 16, 0x4c4f55);
                for (int x = 0; x < 16; x += 3) { r(b, x, 0, 1, 16, 0x3b3e43); r(b, x + 1, 0, 1, 16, 0x5c6066); }
                r(b, 0, 15, 16, 1, 0x2e3034);
            }
            case T.DRYWALL -> {
                r(b, 0, 0, 16, 16, 0xa39d5c);
                voronoi(b, 0, 2, 16, 12, 6, new int[]{0xb9ab8c, 0xa69878, 0xc8bc9e}, 0x7c705a, rnd);
                r(b, 0, 14, 16, 2, 0x7a744a);
            }
            case T.BRAMBLE -> {
                r(b, 0, 0, 16, 16, 0x2c2230);
                for (int i = 0; i < 7; i++) {
                    int x = rnd.nextInt(16), y = rnd.nextInt(16);
                    for (int k = 0; k < 7; k++) { p(b, x, y, k % 2 == 0 ? 0x5a2a5e : 0x3e1c44); x += rnd.nextInt(3) - 1; y += rnd.nextInt(3) - 1; }
                }
                for (int i = 0; i < 6; i++) p(b, rnd.nextInt(16), rnd.nextInt(16), 0x16101a);
                for (int i = 0; i < 2; i++) p(b, rnd.nextInt(16), rnd.nextInt(16), 0xd0283c);
            }
            case T.DAM -> {
                ground(b, 0xa9a79e, 0x9a988f, 0xb7b5ac, 0.2, 0.1);
                r(b, 0, 0, 1, 16, 0x86847c); r(b, 8, 0, 1, 16, 0x8e8c84);
                for (int i = 0; i < 2; i++) { int x = rnd.nextInt(14); for (int y = 0; y < 6; y++) p(b, x, rnd.nextInt(16), 0x7a7a70); }
            }
            case T.BRIDGE -> {
                r(b, 0, 0, 16, 16, 0xb8a47e);
                for (int y = 0; y < 16; y += 5) r(b, 0, y, 16, 1, 0x948260);
                for (int y = 0; y < 16; y += 5) for (int x = (y % 2) * 3; x < 16; x += 6) r(b, x, y, 1, 5, 0x948260);
                speck(b, 0, 0, 16, 16, 0xcbb994, 0.15, rnd);
            }
            case T.PORCH -> {
                voronoi(b, 0, 0, 16, 16, 6, new int[]{0xc8b6a4, 0xbaa794, 0xd2c2b0}, 0x968472, rnd);
            }
            case T.FLOOR -> {
                r(b, 0, 0, 16, 16, 0xb4784a);
                speck(b, 0, 0, 16, 16, 0xa66c40, 0.3, rnd);
                for (int i = 0; i < 3; i++) { int x = rnd.nextInt(16), y = rnd.nextInt(16); for (int k = 0; k < 5; k++) p(b, (x + k) % 16, (y + k / 2) % 16, 0x986038); }
                r(b, 0, 0, 16, 1, 0xd8b896); r(b, 0, 0, 1, 16, 0xd8b896);
            }
            case T.BATHFLOOR -> {
                r(b, 0, 0, 16, 16, 0xb98657);
                speck(b, 0, 0, 16, 16, 0xa97648, 0.25, rnd);
                r(b, 0, 0, 16, 1, 0xd8c0a0); r(b, 0, 0, 1, 16, 0xd8c0a0); r(b, 8, 0, 1, 16, 0xd8c0a0); r(b, 0, 8, 16, 1, 0xd8c0a0);
            }
            case T.IWALL -> {
                ground(b, 0xf0ebe2, 0xe6e0d6, 0xf8f6f0, 0.12, 0.06);
                r(b, 0, 0, 16, 1, 0xd8d0c4);
                r(b, 0, 13, 16, 3, 0xa86a40); r(b, 0, 13, 16, 1, 0xc88a5a);
            }
            case T.IWALL_HI -> {
                ground(b, 0xf0ebe2, 0xe6e0d6, 0xf8f6f0, 0.12, 0.06);
                r(b, 0, 0, 16, 2, 0xd0c8bc);
            }
            case T.IWALL_STONE -> {
                voronoi(b, 0, 0, 16, 16, 6, new int[]{0xc9a46c, 0xb48e56, 0xd6b47c, 0xa88650}, 0x8a6e48, rnd);
                r(b, 0, 15, 16, 1, 0x6e5636);
            }
            case T.BATHWALL -> {
                r(b, 0, 0, 16, 16, 0xdcc6a6);
                for (int y = 0; y < 16; y += 4) r(b, 0, y, 16, 1, 0xc8b08e);
                for (int x = 0; x < 16; x += 4) r(b, x, 0, 1, 16, 0xc8b08e);
                speck(b, 0, 0, 16, 16, 0xe8d6ba, 0.1, rnd);
            }
            case T.WALLTOP -> {
                r(b, 0, 0, 16, 16, 0x4a3c34);
                speck(b, 0, 0, 16, 16, 0x52443a, 0.2, rnd);
            }
            case T.STAIRS -> {
                for (int y = 0; y < 16; y += 4) {
                    r(b, 0, y, 16, 3, shade(0xb4784a, 1.0 - y * 0.02));
                    r(b, 0, y + 3, 16, 1, 0x7a4e2e);
                    r(b, 0, y, 16, 1, 0xd8a878);
                }
            }
            case T.CHURCH_WALL -> {
                r(b, 0, 0, 16, 16, 0xc4ac7e);
                for (int y = 0; y < 16; y += 4) {
                    for (int x = (y / 4 % 2) * 4; x < 20; x += 8) {
                        int c = rnd.nextBoolean() ? 0xdcc496 : 0xd2b98a;
                        r(b, x, y, 7, 3, c); p(b, x, y, 0xe6d2a8);
                    }
                }
            }
            case T.CHURCH_DOOR -> {
                makeChurchWallBase(b);
                r(b, 2, 3, 12, 13, 0xa88a5e);
                ov(b, 8, 4, 6, 3.5, 0xa88a5e);
                r(b, 3, 4, 10, 12, 0x6a3e1e);
                ov(b, 8, 5, 5, 2.8, 0x6a3e1e);
                r(b, 8, 3, 1, 13, 0x4a2a14);
                for (int y = 6; y < 16; y += 3) { p(b, 5, y, 0xc8b070); p(b, 11, y, 0xc8b070); }
            }
            case T.BARRICADE -> {
                r(b, 0, 0, 16, 16, 0xa39d5c);
                r(b, 0, 9, 16, 7, 0x9c8a5e);
                for (int x = 0; x < 16; x += 5) ov(b, x + 2.5, 12, 3, 2.5, 0xb8a676);
                for (int x = 0; x < 16; x += 5) ov(b, x + 2.5, 11, 2, 1, 0xccbc8c);
                r(b, 0, 3, 16, 3, 0x7a5432); r(b, 0, 3, 16, 1, 0x9a6e44);
                line(b, 1, 0, 14, 9, 0x6a4628); line(b, 2, 0, 15, 9, 0x8a6038);
            }
            default -> r(b, 0, 0, 16, 16, 0xff00ff);
        }
        return b;
    }

    static void makeChurchWallBase(BufferedImage b) {
        r(b, 0, 0, 16, 16, 0xc4ac7e);
        for (int y = 0; y < 16; y += 4)
            for (int x = (y / 4 % 2) * 4; x < 20; x += 8) r(b, x, y, 7, 3, 0xd6be90);
    }

    // ------------------------------------------------------------------ PERSONAJES
    /** Paleta de un humanoide. */
    public static final class Look {
        int skin, hair, shirt, pants, shoes, extra;
        boolean beard, cloak, robe, hollow, longHair, apron, helmet, bald;
        Look(int skin, int hair, int shirt, int pants, int shoes) { this.skin = skin; this.hair = hair; this.shirt = shirt; this.pants = pants; this.shoes = shoes; }
    }

    static BufferedImage person(Look L, int dir, int frame, boolean attack) {
        BufferedImage b = img(16, 24);
        int legL = 0, legR = 0, armL = 0, armR = 0;
        if (frame == 1) { legL = -1; armR = -1; armL = 1; }
        if (frame == 2) { legR = -1; armL = -1; armR = 1; }
        int bob = frame == 0 ? 0 : 0;
        int dark = shade(L.pants, 0.75);
        boolean side = dir >= 2;

        // capa por detrás
        if (L.cloak) {
            int cc = 0x3d3a34;
            if (dir == 1) { r(b, 2, 9, 12, 13, cc); for (int x = 2; x < 14; x += 2) p(b, x, 22, cc); }
            else if (!side) { r(b, 2, 10, 12, 11, cc); for (int x = 2; x < 14; x += 3) p(b, x, 21, cc); }
            else { r(b, 3, 9, 7, 12, cc); for (int x = 3; x < 10; x += 2) p(b, x, 21 + (frame == 0 ? 0 : (x / 2) % 2), cc); }
        }
        // piernas
        if (!side) {
            r(b, 5, 17, 3, 5 + legL, L.robe ? L.shirt : L.pants);
            r(b, 8, 17, 3, 5 + legR, L.robe ? L.shirt : L.pants);
            r(b, 5, 21 + legL, 3, 2, L.shoes);
            r(b, 8, 21 + legR, 3, 2, L.shoes);
            if (L.cloak) { r(b, 5, 19 + legL, 3, 1, 0x5a4636); r(b, 8, 19 + legR, 3, 1, 0x5a4636); }
        } else {
            int fx = frame == 1 ? 1 : frame == 2 ? -1 : 0;
            r(b, 6 - fx, 17, 3, 5, dark);
            r(b, 7 + fx, 17, 3, 5, L.robe ? L.shirt : L.pants);
            r(b, 6 - fx, 21, 3, 2, shade(L.shoes, 0.8));
            r(b, 7 + fx, 21, 4, 2, L.shoes);
        }
        // torso
        int torsoC = L.shirt;
        if (!side) {
            r(b, 4, 9 + bob, 8, 9, torsoC);
            if (L.robe) r(b, 4, 16, 8, 5, torsoC);
            if (L.apron && dir == 0) r(b, 5, 12, 6, 8, 0xe0dccc);
            if (L.cloak && dir == 0) {
                // tabardo blanco con cruz roja (como la ficha del Guardián)
                r(b, 6, 10, 4, 10, 0xd9d2bf);
                r(b, 7, 12, 2, 6, 0xa8322a); r(b, 6, 13, 4, 2, 0xa8322a);
                r(b, 4, 15, 8, 1, 0x5a3a20); p(b, 8, 15, 0xc8a040);
                r(b, 4, 9, 8, 2, 0x4a463e); // capucha caída
            }
            if (L.cloak && dir == 1) { r(b, 5, 11, 6, 6, 0x6e4a2a); r(b, 5, 11, 6, 1, 0x8a6038); r(b, 4, 9, 8, 2, 0x4a463e); }
            // brazos
            int armC = L.cloak ? 0x45413a : shade(torsoC, 0.9);
            if (L.hollow && dir == 0) {
                r(b, 3, 10, 2, 5, armC); r(b, 11, 10, 2, 5, armC);
                r(b, 3, 15, 2, 1, L.skin); r(b, 11, 15, 2, 1, L.skin);
            } else {
                r(b, 2, 10 + armL, 2, 6, armC); r(b, 12, 10 + armR, 2, 6, armC);
                r(b, 2, 16 + armL, 2, 1, L.skin); r(b, 12, 16 + armR, 2, 1, L.skin);
            }
        } else {
            r(b, 5, 9, 6, 9, torsoC);
            if (L.robe) r(b, 5, 16, 6, 5, torsoC);
            if (L.cloak) { r(b, 4, 9, 7, 2, 0x4a463e); r(b, 9, 10, 2, 8, 0xd9d2bf); r(b, 9, 12, 2, 4, 0xa8322a); r(b, 5, 15, 6, 1, 0x5a3a20); r(b, 4, 11, 2, 5, 0x6e4a2a); }
            int armC = L.cloak ? 0x45413a : shade(torsoC, 0.85);
            int ax = attack ? 9 : 7;
            int ay = frame == 1 ? -1 : frame == 2 ? 1 : 0;
            if (attack) { r(b, 8, 11, 5, 2, armC); r(b, 13, 11, 1, 2, L.skin); }
            else if (L.hollow) { r(b, 8, 11, 5, 2, armC); r(b, 13, 11, 1, 2, L.skin); }
            else { r(b, ax, 10 + ay, 2, 6, armC); r(b, ax, 16 + ay, 2, 1, L.skin); }
        }
        // cabeza
        if (!side) {
            r(b, 5, 3, 6, 6, L.skin);
            if (dir == 0) {
                p(b, 6, 5, 0x1a1210); p(b, 9, 5, 0x1a1210);
                if (L.hollow) { p(b, 6, 5, 0xe8d040); p(b, 9, 5, 0xe8d040); p(b, 7, 7, 0x3a2a20); p(b, 8, 7, 0x3a2a20); }
                if (L.beard) { r(b, 5, 7, 6, 3, L.hair); r(b, 6, 9, 4, 1, L.hair); p(b, 7, 7, shade(L.skin, 0.75)); p(b, 8, 7, shade(L.skin, 0.75)); r(b, 5, 6, 1, 1, L.hair); r(b, 10, 6, 1, 1, L.hair); }
                if (!L.bald) { r(b, 5, 2, 6, 2, L.hair); p(b, 4, 3, L.hair); p(b, 11, 3, L.hair); r(b, 5, 3, 6, 1, L.hair); }
                else { r(b, 5, 3, 1, 3, L.hair); r(b, 10, 3, 1, 3, L.hair); }
                if (L.longHair) { r(b, 4, 3, 1, 7, L.hair); r(b, 11, 3, 1, 7, L.hair); }
            } else {
                r(b, 5, 2, 6, 7, L.hair);
                if (L.bald) r(b, 6, 3, 4, 3, L.skin);
                if (L.longHair) r(b, 4, 3, 8, 8, L.hair);
                if (L.beard) { p(b, 5, 8, L.hair); p(b, 10, 8, L.hair); }
            }
            if (L.helmet) { r(b, 4, 1, 8, 3, 0x7a7c80); r(b, 4, 3, 8, 1, 0x5a5c60); p(b, 6, 1, 0xa0a4a8); }
        } else {
            r(b, 5, 3, 6, 6, L.skin);
            p(b, 11, 6, L.skin);
            p(b, 9, 5, L.hollow ? 0xe8d040 : 0x1a1210);
            if (!L.bald) { r(b, 5, 2, 6, 2, L.hair); r(b, 5, 3, 3, 3, L.hair); }
            else r(b, 5, 4, 2, 2, L.hair);
            if (L.longHair) r(b, 4, 3, 3, 8, L.hair);
            if (L.beard) { r(b, 7, 7, 4, 3, L.hair); r(b, 8, 9, 3, 1, L.hair); p(b, 10, 7, shade(L.skin, 0.75)); }
            if (L.helmet) { r(b, 4, 1, 8, 3, 0x7a7c80); p(b, 6, 1, 0xa0a4a8); }
        }
        outline(b, 0x1a1410);
        if (dir == 2) b = flipH(b);
        return b;
    }

    static BufferedImage[][] personSet(Look L) {
        BufferedImage[][] s = new BufferedImage[4][3];
        for (int d = 0; d < 4; d++) {
            int dd = d == 2 ? 3 : d;
            for (int f = 0; f < 3; f++) {
                BufferedImage im = person(L, dd, f, false);
                s[d][f] = d == 2 ? flipH(im) : im;
            }
        }
        return s;
    }

    static void makeCharacters() {
        Look heroL = new Look(0xc08a64, 0x2a1d16, 0x45413a, 0x4a3a2c, 0x3a2a1c);
        heroL.beard = true; heroL.cloak = true;
        hero = personSet(heroL);
        heroAtk = new BufferedImage[4][1];
        for (int d = 0; d < 4; d++) {
            int dd = d == 2 ? 3 : d;
            BufferedImage im = person(heroL, dd, 1, true);
            heroAtk[d][0] = d == 2 ? flipH(im) : im;
        }

        Look hl = new Look(0x8a9a7a, 0x3a3a30, 0x5a5466, 0x3e3a44, 0x2a2626);
        hl.hollow = true;
        hollow = personSet(hl);

        Look priest = new Look(0xd0a07c, 0xb8b4ac, 0x1e1e24, 0x1e1e24, 0x141414);
        priest.robe = true; priest.bald = true;
        people.put("cura", personSet(priest));
        Look healer = new Look(0xc89870, 0x8a8a8a, 0x6a3a4a, 0x3a2a30, 0x2a2020);
        healer.apron = true; healer.longHair = true;
        people.put("curandera", personSet(healer));
        Look guard = new Look(0xb88058, 0x3a2a1e, 0x5a6a3e, 0x3a3e30, 0x2a2420);
        guard.helmet = true; guard.beard = true;
        people.put("guardia", personSet(guard));
        Look mech = new Look(0xc48c66, 0x6a3a1e, 0x3a5a7a, 0x3a3a48, 0x2a2a2a);
        mech.longHair = true;
        people.put("mecanica", personSet(mech));
        Look kid = new Look(0xc8946c, 0x2a1a10, 0xb0563a, 0x3a4a6a, 0x2a2a2a);
        people.put("chaval", personSet(kid));
        Look old = new Look(0xc09070, 0xe0e0dc, 0x5a4a3a, 0x3a3630, 0x262220);
        old.bald = true;
        people.put("abuelo", personSet(old));

        // Jabalí podrido (vista lateral)
        boar = new BufferedImage[2][2];
        for (int f = 0; f < 2; f++) {
            BufferedImage b = img(22, 16);
            ov(b, 11, 8, 8, 5, 0x4a3a30);
            ov(b, 11, 6, 7, 3, 0x3a2c24);
            for (int x = 5; x < 16; x += 2) p(b, x, 2 + (x % 3), 0x241a14);
            ov(b, 18, 9, 3.5, 3, 0x5a463a);
            r(b, 20, 9, 2, 2, 0x7a5a4a);
            p(b, 18, 7, 0xff3020); p(b, 19, 7, 0xff7050);
            p(b, 20, 11, 0xe8e0d0); p(b, 21, 10, 0xe8e0d0);
            ov(b, 9, 9, 2, 1.5, 0x6a8a3a); ov(b, 13, 7, 1.5, 1, 0x7a9a44);
            int a = f == 0 ? 0 : 1;
            r(b, 5 + a, 12, 2, 3, 0x2a201a); r(b, 9 - a, 12, 2, 3, 0x2a201a);
            r(b, 13 + a, 12, 2, 3, 0x2a201a); r(b, 16 - a, 12, 2, 3, 0x2a201a);
            p(b, 3, 6, 0x3a2c24); p(b, 2, 5, 0x3a2c24);
            outline(b, 0x140e0a);
            boar[1][f] = b;
            boar[0][f] = flipH(b);
        }

        // Alacrán gigante (vista cenital)
        scorpion = new BufferedImage[4][2];
        for (int f = 0; f < 2; f++) {
            BufferedImage b = img(16, 16);
            for (int i = 0; i < 3; i++) {
                int ly = 7 + i * 2 + (f == 0 ? (i % 2) : ((i + 1) % 2));
                line(b, 5, 7 + i * 2, 2, ly, 0x3a2410); line(b, 10, 7 + i * 2, 13, ly, 0x3a2410);
            }
            ov(b, 7.5, 9, 3, 3.5, 0x6a4422);
            ov(b, 7.5, 8, 2, 2, 0x8a5a2e);
            r(b, 7, 12, 2, 2, 0x6a4422); r(b, 7, 14, 2, 1, 0x5a3a1c); p(b, 8, 15, 0x4a2e16);
            line(b, 5, 7, 3, 4, 0x6a4422); line(b, 10, 7, 12, 4, 0x6a4422);
            r(b, 2, 2, 2, 2, 0x8a5a2e); r(b, 12, 2, 2, 2, 0x8a5a2e);
            p(b, 7, 6, 0xff4020); p(b, 8, 6, 0xff4020);
            outline(b, 0x1e1208);
            scorpion[1][f] = b;
            BufferedImage r90 = rot90(b);
            scorpion[3][f] = r90;
            scorpion[0][f] = rot90(r90);
            scorpion[2][f] = rot90(rot90(r90));
        }

        // Sombra del barranco
        shade = new BufferedImage[3];
        for (int f = 0; f < 3; f++) {
            BufferedImage b = img(16, 22);
            ov(b, 8, 7, 5.5, 6, 0x2e2240);
            ov(b, 8, 12, 5, 5, 0x2e2240);
            for (int y = 15; y < 21; y++) {
                int off = (int) Math.round(Math.sin((y + f * 2) * 0.9) * 1.5);
                r(b, 5 + off + (y - 15) / 2, y, Math.max(1, 6 - (y - 15)), 1, 0x2e2240);
            }
            ov(b, 8, 6, 3.5, 3, 0x45345e);
            r(b, 6, 7, 1, 2, 0xf0f0ff); r(b, 10, 7, 1, 2, 0xf0f0ff);
            outline(b, 0x120c1a);
            shade[f] = b;
        }

        // La Bestia de La Bolera
        boss = new BufferedImage[2];
        bossHurt = new BufferedImage[2];
        for (int f = 0; f < 2; f++) {
            BufferedImage b = img(56, 52);
            ova(b, 28, 46, 24, 5, 0x60000000);
            ov(b, 28, 34, 22, 14, 0x24525a);
            ov(b, 28, 30, 18, 14, 0x2a6068);
            for (int i = 0; i < 6; i++) { int x = 12 + i * 6; ov(b, x, 18 - (i % 2) * 2, 2.5, 6, 0x1c4048); }
            ov(b, 28, 24, 14, 11, 0x307078);
            for (int y = 16; y < 40; y += 3) for (int x = 10 + (y % 2) * 2; x < 48; x += 5) p(b, x, y, 0x3c8890);
            ov(b, 28, 36, 10, 6, 0xb8c8a8);
            int open = f == 0 ? 2 : 6;
            r(b, 20, 32, 16, open, 0x3a0a10);
            for (int x = 21; x < 36; x += 3) { p(b, x, 32, 0xf0ece0); p(b, x + 1, 31 + open, 0xf0ece0); }
            int[][] eyes = {{20, 22}, {36, 22}, {24, 18}, {32, 18}, {28, 15}};
            for (int[] e : eyes) { ov(b, e[0], e[1], 2, 1.6, 0xff3a2a); p(b, e[0], e[1], 0xffe0a0); }
            ov(b, 7, 36, 5, 3, 0x24525a); ov(b, 49, 36, 5, 3, 0x24525a);
            for (int x = 3; x < 12; x += 3) p(b, x, 39, 0xe0e0d0);
            for (int x = 45; x < 54; x += 3) p(b, x, 39, 0xe0e0d0);
            outline(b, 0x0c1a1c);
            boss[f] = b;
            bossHurt[f] = tint(b, 0xffffff);
        }

        orb = img(8, 8);
        ov(orb, 4, 4, 3.6, 3.6, 0x1a7a7a); ov(orb, 4, 4, 2.4, 2.4, 0x50d8c8); p(orb, 3, 3, 0xe0fff8);

        sword = img(7, 18);
        r(sword, 3, 0, 1, 12, 0xe4e8ec); r(sword, 2, 1, 1, 11, 0xb8c0c8); r(sword, 4, 1, 1, 11, 0x9aa2aa);
        r(sword, 0, 12, 7, 1, 0xc8a040); p(sword, 0, 11, 0xc8a040); p(sword, 6, 11, 0xc8a040);
        r(sword, 3, 13, 1, 4, 0x5a3a20); p(sword, 3, 17, 0xc8a040);
        outline(sword, 0x1a1410);

        relic = img(12, 14);
        r(relic, 5, 1, 2, 12, 0xd8b048); r(relic, 2, 4, 8, 2, 0xd8b048); p(relic, 5, 1, 0xfff0a0); r(relic, 6, 2, 1, 10, 0xa88020);
        outline(relic, 0x3a2a10);
        herb = img(10, 10);
        line(herb, 5, 9, 5, 3, 0x4a6a2a); ov(herb, 3, 4, 2, 1.5, 0x6a9a3a); ov(herb, 7, 3, 2, 1.5, 0x7aaa44); ov(herb, 5, 1.5, 1.5, 1.5, 0x8abc52);
        outline(herb, 0x1a2a10);

        // Gato atigrado y perrillo del porche
        cat = img(16, 12);
        ov(cat, 7, 7, 5, 3.5, 0x8a8478); for (int x = 4; x < 11; x += 2) r(cat, x, 4, 1, 6, 0x4a463e);
        ov(cat, 12, 5, 2.5, 2.5, 0x8a8478); p(cat, 11, 2, 0x8a8478); p(cat, 13, 2, 0x8a8478); p(cat, 12, 5, 0x2a2a2a); p(cat, 13, 5, 0x2a2a2a);
        line(cat, 2, 8, 0, 5, 0x4a463e);
        outline(cat, 0x1a1814);
        dog = img(14, 12);
        ov(dog, 6, 7, 4, 2.5, 0xe0ccaa); ov(dog, 10, 4, 2.5, 2.5, 0xe0ccaa);
        p(dog, 9, 1, 0xc8a070); p(dog, 12, 1, 0xc8a070); p(dog, 9, 2, 0xc8a070); p(dog, 12, 2, 0xc8a070);
        p(dog, 10, 4, 0x1a1a1a); p(dog, 11, 4, 0x1a1a1a); r(dog, 3, 9, 1, 3, 0xd0b890); r(dog, 8, 9, 1, 3, 0xd0b890); p(dog, 2, 6, 0xd0b890); p(dog, 1, 5, 0xd0b890);
        r(dog, 5, 5, 3, 2, 0xb08050);
        outline(dog, 0x1a1410);
        dogB = Px.copy(dog);
        p(dogB, 1, 5, 0); p(dogB, 1, 7, 0xd0b890);

        campfire = new BufferedImage[3];
        for (int f = 0; f < 3; f++) {
            BufferedImage b = img(16, 16);
            r(b, 3, 13, 10, 2, 0x5a3a20); line(b, 3, 14, 12, 11, 0x6e4a2a); line(b, 3, 11, 12, 14, 0x6e4a2a);
            ov(b, 8, 10 - f % 2, 3.5, 4.5 + (f == 1 ? 1 : 0), 0xe85a20);
            ov(b, 8, 11 - f % 2, 2.2, 3, 0xf8a830);
            ov(b, 8, 12, 1.2, 1.6, 0xfff0a0);
            campfire[f] = b;
        }
    }

    // ------------------------------------------------------------------ OBJETOS (props)
    static BufferedImage shadowed(int w, int h, double cx, double cy, double rx, double ry) {
        BufferedImage b = img(w, h);
        ova(b, cx, cy, rx, ry, 0x50000000);
        return b;
    }

    static void put(String k, BufferedImage b) { P.put(k, b); }

    static void canopy(BufferedImage b, double cx, double cy, double rx, double ry, int dark, int mid, int light, Random rr, int blobs) {
        for (int i = 0; i < blobs; i++) {
            double a = rr.nextDouble() * Math.PI * 2, d = rr.nextDouble();
            ov(b, cx + Math.cos(a) * rx * d * 0.7, cy + Math.sin(a) * ry * d * 0.7, rx * 0.45, ry * 0.45, dark);
        }
        for (int i = 0; i < blobs; i++) {
            double a = rr.nextDouble() * Math.PI * 2, d = rr.nextDouble();
            ov(b, cx - 1 + Math.cos(a) * rx * d * 0.5, cy - 1 + Math.sin(a) * ry * d * 0.5, rx * 0.35, ry * 0.35, mid);
        }
        for (int i = 0; i < blobs / 2; i++) {
            double a = rr.nextDouble() * Math.PI * 2, d = rr.nextDouble();
            ov(b, cx - 2 + Math.cos(a) * rx * d * 0.35, cy - 2 + Math.sin(a) * ry * d * 0.35, rx * 0.18, ry * 0.18, light);
        }
    }

    static void makeProps() {
        Random rr = new Random(99);
        // Olivo
        for (int v = 0; v < 3; v++) {
            BufferedImage b = shadowed(18, 22, 9, 19, 7, 2.5);
            r(b, 8, 12, 2, 8, 0x5a4a38); p(b, 7, 18, 0x5a4a38); p(b, 10, 17, 0x4a3a2a); p(b, 9, 14, 0x7a6a50);
            BufferedImage c = img(18, 22);
            canopy(c, 9, 8.5, 8, 7, 0x5a6a3c, 0x75844e, 0x9ea876, rr, 9);
            Px.outline(c, 0x2f3820);
            b.getGraphics().drawImage(c, 0, 0, null);
            put("olivo" + v, b);
        }
        // Almendro
        for (int v = 0; v < 2; v++) {
            BufferedImage b = shadowed(18, 24, 9, 21, 6, 2);
            r(b, 8, 12, 2, 10, 0x4a3628); line(b, 9, 13, 5, 9, 0x4a3628); line(b, 9, 13, 13, 8, 0x4a3628);
            BufferedImage c = img(18, 24);
            canopy(c, 9, 8, 8, 6.5, 0x7a8a4a, 0x96a85e, 0xc0c890, rr, 8);
            Px.outline(c, 0x3a4220);
            b.getGraphics().drawImage(c, 0, 0, null);
            put("almendro" + v, b);
        }
        // Pino carrasco
        for (int v = 0; v < 3; v++) {
            BufferedImage b = shadowed(22, 34, 11, 31, 8, 2.5);
            r(b, 10, 14, 2, 18, 0x5a3e28); p(b, 9, 20, 0x5a3e28); p(b, 12, 24, 0x6e4c30);
            BufferedImage c = img(22, 34);
            canopy(c, 11, 10, 10, 8, 0x2e4a2a, 0x3e5e34, 0x5a7a44, rr, 10);
            canopy(c, 13, 17, 6, 4, 0x2e4a2a, 0x3e5e34, 0x5a7a44, rr, 5);
            Px.outline(c, 0x16241a);
            b.getGraphics().drawImage(c, 0, 0, null);
            put("pino" + v, b);
        }
        // Chopo (álamo alto)
        for (int v = 0; v < 2; v++) {
            BufferedImage b = shadowed(16, 44, 8, 41, 6, 2);
            r(b, 7, 30, 2, 12, 0x6a5a48);
            BufferedImage c = img(16, 44);
            for (int y = 3; y < 34; y += 3) {
                double w = 3 + Math.sin((y / 34.0) * Math.PI) * 4;
                ov(c, 8 + rr.nextInt(3) - 1, y, w, 3, 0x41612a);
            }
            for (int y = 4; y < 32; y += 4) ov(c, 7 + rr.nextInt(3) - 1, y, 2.5, 2, 0x5c7e36);
            for (int y = 5; y < 30; y += 6) p(c, 6 + rr.nextInt(4), y, 0x86a454);
            Px.outline(c, 0x1e2e14);
            b.getGraphics().drawImage(c, 0, 0, null);
            put("chopo" + v, b);
        }
        // Sauce llorón
        {
            BufferedImage b = shadowed(36, 38, 18, 35, 14, 3);
            r(b, 17, 22, 3, 14, 0x5a4a3a);
            BufferedImage c = img(36, 38);
            canopy(c, 18, 11, 14, 9, 0x5e7a34, 0x7a9844, 0x9ab85a, rr, 12);
            for (int x = 4; x < 32; x++) {
                int len = 12 + rr.nextInt(14);
                int col = rr.nextInt(3) == 0 ? 0x9ab85a : (x % 2 == 0 ? 0x6e8a3c : 0x84a24c);
                for (int y = 10; y < 10 + len && y < 36; y++) if (rr.nextDouble() < 0.85) p(c, x, y, col);
            }
            Px.outline(c, 0x2a3a18);
            b.getGraphics().drawImage(c, 0, 0, null);
            put("sauce", b);
        }
        // Higuera
        for (int v = 0; v < 2; v++) {
            BufferedImage b = shadowed(26, 26, 13, 23, 10, 2.5);
            r(b, 12, 15, 3, 9, 0x8a8278); line(b, 13, 16, 7, 11, 0x8a8278); line(b, 13, 16, 19, 10, 0x8a8278);
            BufferedImage c = img(26, 26);
            canopy(c, 13, 10, 12, 8, 0x3e6a2a, 0x58883a, 0x78a84e, rr, 12);
            for (int i = 0; i < 3; i++) p(c, 5 + rr.nextInt(16), 5 + rr.nextInt(9), 0x5a2a5a);
            Px.outline(c, 0x1a3014);
            b.getGraphics().drawImage(c, 0, 0, null);
            put("higuera" + v, b);
        }
        // Arizónica / ciprés
        {
            BufferedImage b = shadowed(14, 28, 7, 26, 5, 2);
            BufferedImage c = img(14, 28);
            for (int y = 2; y < 25; y++) { double w = Math.min(6, 1 + y * 0.35) * (y > 20 ? (25 - y) / 5.0 + 0.4 : 1); r(c, (int) (7 - w), y, (int) (w * 2), 1, y % 3 == 0 ? 0x557a68 : 0x456a58); }
            for (int i = 0; i < 8; i++) p(c, 4 + rr.nextInt(6), 5 + rr.nextInt(16), 0x6a9080);
            Px.outline(c, 0x1e3028);
            b.getGraphics().drawImage(c, 0, 0, null);
            put("cipres", b);
        }
        // Retama / arbusto
        for (int v = 0; v < 3; v++) {
            BufferedImage b = shadowed(16, 14, 8, 12, 6, 2);
            BufferedImage c = img(16, 14);
            int base = v == 2 ? 0x8a8a52 : 0xa8a45a;
            for (int i = 0; i < 26; i++) { int x = 2 + rr.nextInt(12), y = 2 + rr.nextInt(9); line(c, x, y, x + rr.nextInt(3) - 1, y + 3, rr.nextBoolean() ? base : shade(base, 0.8)); }
            Px.outline(c, 0x3a3a1c);
            b.getGraphics().drawImage(c, 0, 0, null);
            put("retama" + v, b);
        }
        // Cañas del río
        {
            BufferedImage b = img(16, 20);
            for (int i = 0; i < 9; i++) { int x = 2 + rr.nextInt(12); int h = 10 + rr.nextInt(8); line(b, x, 19, x + rr.nextInt(3) - 1, 19 - h, rr.nextBoolean() ? 0xa8a46a : 0x8a9450); }
            put("canas", b);
        }
        // Roca
        for (int v = 0; v < 2; v++) {
            BufferedImage b = shadowed(16, 14, 8, 11, 7, 2);
            BufferedImage c = img(16, 14);
            ov(c, 8, 8, 6.5 - v, 4.5, 0xb8a888); ov(c, 7, 7, 4.5, 3, 0xcfc0a0); p(c, 6, 6, 0xe0d4b8);
            Px.outline(c, 0x5a4e3a);
            b.getGraphics().drawImage(c, 0, 0, null);
            put("roca" + v, b);
        }
        // Tractor azul
        {
            BufferedImage b = shadowed(32, 26, 16, 23, 14, 3);
            r(b, 6, 9, 20, 9, 0x2a5aa8); r(b, 6, 9, 20, 2, 0x4a7ac8); r(b, 20, 6, 7, 10, 0x2a5aa8);
            r(b, 21, 7, 5, 2, 0x4a7ac8); for (int y = 11; y < 17; y += 2) r(b, 26, y, 2, 1, 0x1a1a1a);
            r(b, 8, 2, 1, 9, 0x2a2a2a); r(b, 15, 2, 1, 9, 0x2a2a2a); r(b, 8, 2, 8, 1, 0x2a2a2a); p(b, 11, 1, 0xf0a020); p(b, 12, 1, 0xf0a020);
            ov(b, 9, 19, 5.5, 5.5, 0x1e1e1e); ov(b, 9, 19, 3, 3, 0x8a8a8a); ov(b, 23, 20, 3.5, 3.5, 0x1e1e1e); ov(b, 23, 20, 1.6, 1.6, 0x8a8a8a);
            r(b, 17, 12, 4, 1, 0xe0e0e0);
            Px.outline(b, 0x10141a);
            put("tractor", b);
        }
        // Furgoneta blanca y todoterreno
        put("furgo", vehicle(0xeceae4, 0x30383e, false, rr));
        put("todoterreno", vehicle(0xe4e2dc, 0x30383e, true, rr));
        int[] wrecks = {0x8a3a2a, 0x3a5a7a, 0x6a6a5a, 0x9a8a5a, 0x5a3a4a};
        for (int v = 0; v < wrecks.length; v++) {
            BufferedImage w = vehicle(wrecks[v], 0x1a1a1a, v % 2 == 0, rr);
            for (int i = 0; i < 40; i++) { int x = rr.nextInt(32), y = rr.nextInt(20); if (Px.opaque(w, x, y) && (w.getRGB(x, y) & 0xffffff) != 0x1a1a1a) p(w, x, y, rr.nextBoolean() ? 0x7a4a2a : 0x5a3a20); }
            put("chatarra" + v, w);
        }
        // Casetas metálicas grises
        {
            BufferedImage b = shadowed(26, 26, 13, 24, 13, 2);
            r(b, 1, 4, 24, 4, 0x3c3f45); r(b, 1, 3, 24, 1, 0x5c6066);
            r(b, 2, 8, 22, 16, 0x4c4f55);
            for (int x = 2; x < 24; x += 3) r(b, x, 8, 1, 16, 0x3b3e43);
            r(b, 10, 10, 9, 14, 0x44474d); r(b, 10, 10, 9, 1, 0x5c6066); p(b, 17, 17, 0x1a1a1a);
            Px.outline(b, 0x16181c);
            put("caseta", b);
        }
        // Barbacoa / chimenea exterior de piedra
        {
            BufferedImage b = shadowed(14, 30, 7, 28, 6, 2);
            r(b, 2, 14, 10, 14, 0x8a4a28); r(b, 4, 17, 6, 6, 0x2a1a10); r(b, 5, 2, 4, 14, 0x5a5a5a); r(b, 4, 1, 6, 2, 0x3a3a3a);
            Px.outline(b, 0x1a1410);
            put("barbacoa", b);
        }
        put("tocon", stump());
        // Chimenea de piedra de la fachada (como la del cortijo)
        {
            BufferedImage b = img(12, 46);
            voronoi(b, 1, 4, 10, 42, 10, new int[]{0xc9a46c, 0xb8925a, 0xd6b47c, 0xe0c08a}, 0xe6dcc4, rr);
            r(b, 4, 0, 4, 5, 0x6a6a6a); r(b, 3, 0, 6, 1, 0x4a4a4a);
            Px.outline(b, 0x5a4428);
            put("chimenea", b);
        }
        // Placa solar suelta / farola solar de pared
        {
            BufferedImage b = img(14, 8);
            r(b, 0, 0, 14, 5, 0x2c3e66); for (int x = 3; x < 14; x += 3) r(b, x, 0, 1, 5, 0x6880aa); r(b, 6, 5, 2, 3, 0x2a2a2a);
            Px.outline(b, 0x1a1a1a);
            put("foco_solar", b);
        }
        // Carretilla
        {
            BufferedImage b = shadowed(18, 12, 9, 10, 7, 2);
            r(b, 3, 3, 11, 5, 0xd8a030); r(b, 3, 3, 11, 1, 0xf0c050); ov(b, 15, 8, 2, 2, 0x2a2a2a); line(b, 2, 8, 0, 11, 0x3a3a3a); line(b, 13, 7, 17, 9, 0x5a5a5a);
            Px.outline(b, 0x2a2010);
            put("carretilla", b);
        }
        // Caseta de perro con cojín y gato
        {
            BufferedImage b = shadowed(20, 22, 10, 20, 9, 2);
            r(b, 2, 9, 16, 11, 0xb89870); for (int x = 2; x < 18; x += 3) r(b, x, 9, 1, 11, 0x9a7a54);
            for (int i = 0; i < 9; i++) { r(b, 1 + i, 9 - i, 2, 1, 0xa88860); r(b, 17 - i, 9 - i, 2, 1, 0xa88860); }
            r(b, 7, 13, 6, 7, 0x3a2a1a);
            Px.outline(b, 0x2a2014);
            put("casetaperro", b);
        }
        // Radio (en la mesa del porche)
        {
            BufferedImage b = shadowed(20, 18, 10, 16, 9, 2);
            r(b, 1, 6, 18, 6, 0xe8e4dc); r(b, 2, 12, 2, 4, 0xd8d4cc); r(b, 16, 12, 2, 4, 0xd8d4cc);
            r(b, 5, 2, 9, 5, 0x3a3a34); r(b, 6, 3, 4, 3, 0x6a6a5a); p(b, 12, 4, 0xe03020); line(b, 13, 2, 16, 0, 0x8a8a8a);
            Px.outline(b, 0x2a2a24);
            put("radio", b);
        }
        // Mesa blanca de plástico con sillas
        {
            BufferedImage b = shadowed(26, 18, 13, 16, 12, 2);
            r(b, 4, 4, 18, 8, 0xf0f0ec); r(b, 4, 4, 18, 1, 0xffffff); r(b, 5, 12, 2, 4, 0xd8d8d4); r(b, 19, 12, 2, 4, 0xd8d8d4);
            r(b, 0, 7, 3, 7, 0xf0f0ec); r(b, 23, 7, 3, 7, 0xf0f0ec);
            Px.outline(b, 0x8a8a84);
            put("mesaporche", b);
        }
        // Pilar de piedra del porche
        {
            BufferedImage b = img(10, 30);
            voronoi(b, 1, 0, 8, 28, 6, new int[]{0xc9a46c, 0xb8925a, 0xd6b47c}, 0xe6dcc4, rr);
            r(b, 0, 26, 10, 4, 0xb8925a);
            Px.outline(b, 0x5a4428);
            put("pilar", b);
        }
        // Cuerda de tender con ropa y ristra de pimientos
        {
            BufferedImage b = img(32, 26);
            line(b, 0, 2, 31, 4, 0x2a2a2a);
            r(b, 2, 3, 6, 9, 0x2a2a2a); r(b, 3, 5, 1, 1, 0xf0f0f0); r(b, 5, 8, 1, 1, 0xf0f0f0);
            r(b, 10, 3, 7, 12, 0x1a1a22); r(b, 12, 3, 3, 3, 0x2a2a34);
            for (int y = 4; y < 22; y += 2) { r(b, 22, y, 2, 2, 0xb8221a); p(b, 21, y + 1, 0x8a1a10); }
            r(b, 26, 4, 5, 8, 0x3a3a4a);
            put("tendedero", b);
        }
        // Cruz de San Gregorio
        {
            BufferedImage b = shadowed(18, 34, 9, 31, 7, 2);
            r(b, 4, 26, 10, 5, 0xb0a490); r(b, 4, 26, 10, 1, 0xc8bca8);
            r(b, 8, 4, 3, 23, 0xd8ccb4); r(b, 3, 9, 13, 3, 0xd8ccb4); r(b, 8, 4, 1, 23, 0xece2cc);
            Px.outline(b, 0x4a4234);
            put("cruz", b);
            BufferedImage g = Px.copy(b);
            for (int y = 0; y < g.getHeight(); y++) for (int x = 0; x < g.getWidth(); x++) {
                int c = g.getRGB(x, y);
                if ((c >>> 24) == 255) g.setRGB(x, y, 0xff000000 | Px.mix(c & 0xffffff, 0xffe080, 0.45));
            }
            put("cruzluz", g);
        }
        // Fuente de la plaza
        {
            BufferedImage b = shadowed(34, 30, 17, 26, 16, 3);
            ov(b, 17, 20, 15, 7, 0xb8b0a0); ov(b, 17, 19, 13, 5.5, 0x3a9e98); ov(b, 15, 18, 6, 2, 0x7fcfc6);
            r(b, 15, 5, 4, 15, 0xc8c0b0); ov(b, 17, 6, 5, 2, 0xb8b0a0); p(b, 17, 2, 0x7fcfc6); p(b, 17, 3, 0x7fcfc6);
            Px.outline(b, 0x5a5448);
            put("fuente", b);
        }
        // Farola rota
        {
            BufferedImage b = shadowed(10, 34, 5, 32, 3, 1.5);
            r(b, 4, 6, 2, 26, 0x2a2a2e); r(b, 3, 30, 4, 2, 0x2a2a2e); r(b, 2, 3, 6, 4, 0x3a3a40); r(b, 3, 4, 4, 2, 0x8a8a70);
            Px.outline(b, 0x101012);
            put("farola", b);
        }
        // Banco
        {
            BufferedImage b = shadowed(26, 14, 13, 12, 12, 2);
            r(b, 1, 3, 24, 2, 0x8a6038); r(b, 1, 6, 24, 3, 0x9a7044); r(b, 3, 9, 2, 3, 0x2a2a2a); r(b, 21, 9, 2, 3, 0x2a2a2a);
            Px.outline(b, 0x2a1a10);
            put("banco", b);
        }
        // Barriles y sacos
        {
            BufferedImage b = shadowed(14, 18, 7, 16, 6, 2);
            r(b, 2, 2, 10, 14, 0x6a7a4a); r(b, 2, 4, 10, 1, 0x4a5a3a); r(b, 2, 12, 10, 1, 0x4a5a3a); ov(b, 7, 2, 5, 1.5, 0x7a8a5a);
            Px.outline(b, 0x1a2010);
            put("barril", b);
        }
        // Torre de la iglesia
        {
            BufferedImage b = img(32, 72);
            r(b, 4, 18, 24, 54, 0xc4ac7e);
            for (int y = 18; y < 72; y += 4) for (int x = 4 + (y / 4 % 2) * 4; x < 28; x += 8) r(b, x, y, 7, 3, rr.nextBoolean() ? 0xdcc496 : 0xd2b98a);
            r(b, 2, 16, 28, 3, 0xb09468);
            r(b, 6, 4, 20, 13, 0xc4ac7e);
            r(b, 9, 7, 5, 9, 0x2a2018); r(b, 18, 7, 5, 9, 0x2a2018); ov(b, 11.5, 7, 2.5, 2, 0x2a2018); ov(b, 20.5, 7, 2.5, 2, 0x2a2018);
            ov(b, 11.5, 12, 2, 2, 0xb08a30); ov(b, 20.5, 12, 2, 2, 0xb08a30);
            for (int i = 0; i < 5; i++) r(b, 6 + i * 2, 4 - i, 20 - i * 4, 1, 0xb4583a);
            r(b, 15, -1, 2, 6, 0x2a2a2a); r(b, 13, 1, 6, 1, 0x2a2a2a);
            r(b, 12, 28, 8, 8, 0xe0d6c0); ov(b, 16, 32, 3.5, 3.5, 0xf0ece0); line(b, 16, 32, 16, 29, 0x1a1a1a); line(b, 16, 32, 18, 33, 0x1a1a1a);
            r(b, 14, 46, 4, 8, 0x2a2018); ov(b, 16, 46, 2, 2, 0x2a2018);
            Px.outline(b, 0x4a3a24);
            put("torre", b);
        }
        // Higos (decoración del bosque encantado)
        {
            BufferedImage b = img(16, 16);
            for (int i = 0; i < 5; i++) { int x = 3 + rr.nextInt(10), y = 5 + rr.nextInt(8); ov(b, x, y, 1.5, 1.8, 0x5a2a5a); p(b, x, y - 1, 0x7a4a7a); }
            put("higos", b);
        }
        // Manantial (fuente del bosque)
        {
            BufferedImage b = shadowed(28, 22, 14, 17, 13, 3);
            ov(b, 14, 13, 13, 7, 0x9a9488); ov(b, 14, 12, 11, 5.5, 0x3fb4b0); ov(b, 12, 11, 4, 1.5, 0x9ae8e0); ov(b, 17, 13, 2, 1, 0xd8fff8);
            for (int i = 0; i < 6; i++) ov(b, 3 + i * 4, 15 + (i % 2), 2, 1.5, 0xb0a898);
            Px.outline(b, 0x3a3830);
            put("manantial", b);
        }
        // Señal de carretera
        {
            BufferedImage b = shadowed(20, 30, 10, 28, 4, 1.5);
            r(b, 9, 10, 2, 18, 0x8a8a8a); r(b, 1, 2, 18, 9, 0x2a7a3a); r(b, 2, 3, 16, 7, 0x3a9a4a); r(b, 3, 6, 14, 1, 0xf0f0f0); r(b, 3, 4, 6, 1, 0xf0f0f0);
            Px.outline(b, 0x1a1a1a);
            put("senal", b);
        }
        // Lápida/estatua de la presa: compuerta
        {
            BufferedImage b = img(16, 24);
            r(b, 2, 0, 12, 22, 0x8e8c84); r(b, 4, 2, 8, 18, 0x6a6a62); for (int y = 3; y < 20; y += 3) r(b, 4, y, 8, 1, 0x56564e);
            Px.outline(b, 0x2a2a26);
            put("compuerta", b);
        }

        makeInterior(rr);
    }

    static BufferedImage stump() {
        BufferedImage b = shadowed(12, 14, 6, 12, 5, 1.5);
        r(b, 2, 4, 8, 8, 0xb89870); ov(b, 6, 4, 4, 1.8, 0xd8c098); ov(b, 6, 4, 2, 0.8, 0xc0a074);
        Px.outline(b, 0x4a3a24);
        return b;
    }

    static BufferedImage vehicle(int body, int glass, boolean suv, Random rr) {
        BufferedImage b = shadowed(34, 22, 17, 19, 16, 3);
        r(b, 2, 8, 30, 9, shade(body, 0.92));
        r(b, 2, 8, 30, 2, body);
        r(b, suv ? 7 : 5, 2, suv ? 16 : 20, 7, body);
        r(b, suv ? 8 : 7, 3, suv ? 6 : 8, 5, glass); r(b, suv ? 16 : 17, 3, suv ? 6 : 7, 5, glass);
        r(b, 2, 14, 30, 1, shade(body, 0.7));
        ov(b, 8, 17, 3, 3, 0x1a1a1a); ov(b, 26, 17, 3, 3, 0x1a1a1a); ov(b, 8, 17, 1.3, 1.3, 0x8a8a8a); ov(b, 26, 17, 1.3, 1.3, 0x8a8a8a);
        r(b, 30, 10, 2, 2, 0xf0e0a0); r(b, 2, 10, 2, 2, 0xc03020);
        if (suv) { r(b, 2, 11, 4, 3, 0x3a3a3a); }
        Px.outline(b, 0x14161a);
        return b;
    }

    static void makeInterior(Random rr) {
        // Cama de matrimonio (colores de cada dormitorio)
        put("cama_gris", bed(0x8e939e, 0xc8ccd4, 0x1e1e22, true));
        put("cama_rosa", bed(0xd8b0c0, 0xece4e8, 0xb89870, false));
        put("cama_blanca", bed(0xf0eee8, 0xffffff, 0xc8a878, false));
        put("cama_lila", bed(0xc8a8d8, 0xe8d8f0, 0xe8e4dc, false));
        // Mesita de noche
        {
            BufferedImage b = img(14, 16);
            r(b, 1, 2, 12, 12, 0x7a4a2a); r(b, 1, 2, 12, 2, 0x9a6438); r(b, 2, 7, 10, 1, 0x5a3420); r(b, 6, 5, 2, 1, 0xc8a040); r(b, 6, 10, 2, 1, 0xc8a040);
            r(b, 8, 0, 3, 3, 0x2a7ad0); Px.outline(b, 0x2a1a10);
            put("mesita", b);
        }
        // Escritorio con dos monitores y portátil (el PC)
        {
            BufferedImage b = img(34, 26);
            r(b, 1, 10, 32, 8, 0xd8ccb0); r(b, 1, 10, 32, 1, 0xece4d0); r(b, 2, 18, 2, 7, 0x8a8a8a); r(b, 30, 18, 2, 7, 0x8a8a8a);
            r(b, 4, 2, 11, 8, 0x1a1a1e); r(b, 5, 3, 9, 6, 0x6a8a6a); p(b, 7, 5, 0xc0d0a0); p(b, 10, 4, 0x9ab07a);
            r(b, 17, 0, 14, 10, 0x1a1a1e); r(b, 18, 1, 12, 8, 0x283848); for (int y = 2; y < 8; y += 2) r(b, 19, y, 5 + rr.nextInt(5), 1, 0xb0c8e0);
            r(b, 23, 10, 2, 1, 0x3a3a3a); r(b, 8, 12, 10, 3, 0x2a2a2a); r(b, 20, 12, 8, 2, 0x3a3a3a); ov(b, 29, 13, 1.5, 1.5, 0xf0f0f0);
            Px.outline(b, 0x2a2420);
            put("escritorio", b);
        }
        // Silla de oficina
        {
            BufferedImage b = img(14, 16);
            r(b, 2, 0, 10, 7, 0x2a2a2e); r(b, 1, 7, 12, 4, 0x3a3a40); r(b, 6, 11, 2, 3, 0x6a6a6a); r(b, 2, 14, 10, 1, 0x4a4a4a);
            Px.outline(b, 0x101012);
            put("silla_oficina", b);
        }
        // Ventilador de pie
        {
            BufferedImage b = img(16, 30);
            ov(b, 8, 7, 7, 7, 0x5a5a5a); ov(b, 8, 7, 5.5, 5.5, 0x8a8a8a); for (int i = 0; i < 4; i++) line(b, 8, 7, 8 + (int) (Math.cos(i * 1.57 + 0.4) * 5), 7 + (int) (Math.sin(i * 1.57 + 0.4) * 5), 0xc8c8c8);
            ov(b, 8, 7, 1.5, 1.5, 0x2a2a2a); r(b, 7, 14, 2, 13, 0x2a2a2a); r(b, 3, 27, 10, 2, 0x2a2a2a);
            Px.outline(b, 0x101010);
            put("ventilador", b);
        }
        // Cómoda con espejo, libros y fotos
        {
            BufferedImage b = img(32, 30);
            r(b, 1, 14, 30, 15, 0x7a4a2a); r(b, 1, 14, 30, 2, 0xe0dcd0); for (int y = 18; y < 29; y += 4) { r(b, 2, y, 28, 1, 0x5a3420); r(b, 8, y + 2, 3, 1, 0xc8a040); r(b, 21, y + 2, 3, 1, 0xc8a040); }
            r(b, 9, 0, 14, 14, 0xf0f0f0); r(b, 10, 1, 12, 12, 0x9ab0b8); for (int x = 10; x < 22; x += 3) { p(b, x, 1, 0xfff8d0); p(b, x, 12, 0xfff8d0); }
            for (int i = 0; i < 6; i++) r(b, 2 + i, 8 - (i % 3), 1, 6 + (i % 3), new int[]{0xa83a2a, 0x2a4a8a, 0xe0c890, 0x3a6a3a}[i % 4]);
            r(b, 24, 9, 4, 5, 0xe0c890); r(b, 25, 10, 2, 3, 0x6a8aa8);
            Px.outline(b, 0x2a1a10);
            put("comoda", b);
        }
        // Cómoda clara (dormitorio blanco)
        {
            BufferedImage b = img(30, 18);
            r(b, 1, 2, 28, 15, 0xe8d8b0); r(b, 1, 2, 28, 2, 0xf4ead0); for (int y = 6; y < 17; y += 4) { r(b, 2, y, 26, 1, 0xc8b48c); p(b, 9, y + 2, 0xc8a040); p(b, 20, y + 2, 0xc8a040); }
            Px.outline(b, 0x6a5a3a);
            put("comoda_clara", b);
        }
        // Baúl del rellano (verde y latón)
        {
            BufferedImage b = img(32, 20);
            r(b, 1, 4, 30, 15, 0x6a6a30); for (int x = 1; x < 31; x += 2) r(b, x, 4, 1, 15, x % 4 == 1 ? 0x7a7a3a : 0x5a5a28);
            r(b, 1, 3, 30, 3, 0x8a7a38); for (int x = 4; x < 31; x += 8) r(b, x, 3, 2, 16, 0xc8a850);
            r(b, 14, 7, 4, 4, 0x2a2a2a); r(b, 1, 4, 3, 3, 0xd8b860);
            Px.outline(b, 0x2a2410);
            put("baul", b);
            BufferedImage o = Px.copy(b);
            r(o, 2, 0, 28, 5, 0x5a5a28); r(o, 3, 5, 26, 5, 0x1a1408);
            put("baul_abierto", o);
        }
        // Toallas sobre el baúl
        {
            BufferedImage b = img(16, 12);
            r(b, 1, 6, 14, 5, 0xf0e8e8); for (int x = 2; x < 15; x += 3) p(b, x, 8, 0xe8a0a0);
            r(b, 2, 3, 12, 3, 0xe8889a); r(b, 3, 0, 10, 3, 0xf4f0f0);
            Px.outline(b, 0x8a6a6a);
            put("toallas", b);
        }
        // Cubo y fregona
        {
            BufferedImage b = img(16, 26);
            r(b, 1, 16, 9, 9, 0x40b8d0); r(b, 1, 16, 9, 2, 0x70d8e8); line(b, 12, 0, 9, 22, 0x2a4a9a); for (int i = 0; i < 6; i++) line(b, 9, 22, 6 + i, 25, 0x40a040);
            Px.outline(b, 0x1a3a40);
            put("cubo", b);
        }
        // Baño
        {
            BufferedImage b = img(14, 18);
            r(b, 2, 0, 10, 6, 0xf4f4f0); ov(b, 7, 11, 5, 5, 0xf4f4f0); ov(b, 7, 11, 3, 3.2, 0xd8e8e8); Px.outline(b, 0x8a8a88);
            put("vater", b);
            BufferedImage d = img(14, 14);
            ov(d, 7, 8, 5, 5, 0xf4f4f0); ov(d, 7, 8, 3, 3, 0xd0e0e0); r(d, 6, 1, 2, 3, 0xc0c0c0); Px.outline(d, 0x8a8a88);
            put("bide", d);
            BufferedImage s = img(32, 22);
            r(s, 1, 6, 30, 15, 0x3a2a24); r(s, 1, 0, 30, 8, 0xf8f8f8); ov(s, 16, 4, 9, 3, 0xe0e8e8); r(s, 15, 0, 2, 2, 0xc0c0c0);
            r(s, 3, 1, 2, 4, 0xf0f0f0); r(s, 25, 0, 3, 5, 0x5ab06a); for (int y = 11; y < 21; y += 4) r(s, 12, y, 8, 1, 0xd0d0d0);
            Px.outline(s, 0x1a1414);
            put("lavabo", s);
            BufferedImage sh = img(30, 30);
            ov(sh, 15, 15, 14, 14, 0xf0f0f0); r(sh, 0, 0, 15, 15, 0xf0f0f0); r(sh, 0, 0, 30, 15, 0xf0f0f0); r(sh, 0, 0, 15, 30, 0xf0f0f0);
            ov(sh, 13, 13, 11, 11, 0xd8e4e8); r(sh, 2, 2, 11, 11, 0xd8e4e8);
            for (int i = 0; i < 4; i++) line(sh, 4 + i * 6, 2, 4 + i * 6, 26, 0xc0d0d8);
            r(sh, 4, 4, 2, 6, 0x2a2a2a); r(sh, 7, 4, 2, 5, 0x5ab06a);
            Px.outline(sh, 0x8a9498);
            put("ducha", sh);
            BufferedImage m = img(16, 30);
            r(m, 1, 0, 14, 30, 0x2e2420); r(m, 3, 2, 10, 14, 0xc8d4d8); r(m, 3, 18, 10, 10, 0x3a2e28); r(m, 11, 22, 1, 3, 0xc0c0c0);
            Px.outline(m, 0x100c0a);
            put("mueble_bano", m);
        }
        // Cocina: encimera de granito con fregadero, frigorífico, mesa larga con fruta
        {
            BufferedImage b = img(16, 18);
            r(b, 0, 0, 16, 7, 0x8a8a86); speck(b, 0, 0, 16, 7, 0x5a5a56, 0.4, rr); speck(b, 0, 0, 16, 7, 0xc0c0bc, 0.2, rr);
            r(b, 0, 7, 16, 11, 0x7a4a26); r(b, 1, 9, 6, 7, 0x6a3e20); r(b, 9, 9, 6, 7, 0x6a3e20); p(b, 6, 12, 0xc8a040); p(b, 9, 12, 0xc8a040);
            put("encimera", b);
            BufferedImage s = Px.copy(b);
            r(s, 3, 1, 10, 5, 0xb8bcc0); r(s, 4, 2, 8, 3, 0x8a9094); r(s, 7, 0, 2, 2, 0xd0d0d0);
            put("fregadero", s);
            BufferedImage f = img(18, 34);
            r(f, 1, 0, 16, 33, 0xa8acb0); r(f, 1, 0, 16, 2, 0xc8ccd0); r(f, 1, 12, 16, 1, 0x7a7e82); r(f, 14, 4, 1, 6, 0x5a5e62); r(f, 14, 15, 1, 10, 0x5a5e62);
            for (int i = 0; i < 4; i++) r(f, 3 + i * 3, 3 + (i % 2) * 3, 2, 2, new int[]{0xe03a2a, 0x2a8ae0, 0xf0c020, 0x40b040}[i]);
            Px.outline(f, 0x3a3e42);
            put("frigo", f);
            BufferedImage t = img(64, 34);
            r(t, 2, 4, 60, 22, 0xf0e8d8);
            for (int i = 0; i < 60; i++) { int x = 2 + rr.nextInt(60), y = 4 + rr.nextInt(22); p(t, x, y, rr.nextBoolean() ? 0xb8a890 : 0xd8b8c0); }
            r(t, 2, 26, 60, 3, 0xe0d8c8); for (int x = 4; x < 60; x += 4) p(t, x, 28, 0xc8b8a8);
            for (int i = 0; i < 3; i++) { int cx = 12 + i * 18; ov(t, cx, 14, 6, 4, 0xf4f0e8); for (int k = 0; k < 7; k++) ov(t, cx - 4 + rr.nextInt(8), 13 + rr.nextInt(3), 1.8, 1.6, i == 1 ? 0xe8c040 : 0xd83a28); }
            ov(t, 52, 20, 3, 2.5, 0x5a8a3a); r(t, 30, 21, 6, 2, 0x4a9a3a);
            r(t, 6, 29, 2, 5, 0x5a3420); r(t, 56, 29, 2, 5, 0x5a3420);
            for (int x = 6; x < 60; x += 12) { r(t, x, 0, 6, 4, 0x6a4024); r(t, x, 30, 6, 4, 0x6a4024); }
            Px.outline(t, 0x3a2414);
            put("mesa_larga", t);
        }
        // Salón: sofá de cuero, mesa camilla, tele, sillas, puerta
        {
            BufferedImage s = img(48, 18);
            r(s, 0, 0, 48, 7, 0x1e2230); r(s, 0, 7, 48, 9, 0x2a3044); r(s, 0, 7, 48, 1, 0x3a4258); for (int x = 16; x < 48; x += 16) r(s, x, 8, 1, 8, 0x1a1e2a);
            r(s, 0, 2, 3, 14, 0x1e2230); r(s, 45, 2, 3, 14, 0x1e2230);
            Px.outline(s, 0x0a0c12);
            put("sofa", s);
            put("sofa_n", Px.flipV(s));
            BufferedImage m = img(34, 30);
            ov(m, 17, 14, 16, 12, 0xd8d8d8); ov(m, 17, 13, 15, 10.5, 0xf0f0ee); for (int a = 0; a < 16; a++) { double an = a * Math.PI / 8; p(m, (int) (17 + Math.cos(an) * 15), (int) (19 + Math.sin(an) * 2 + 4), 0xb0b0c0); }
            r(m, 3, 18, 28, 10, 0xd0d0d4); for (int x = 4; x < 31; x += 4) r(m, x, 22, 1, 6, 0xa8a8b0);
            r(m, 12, 8, 3, 6, 0xc89838); r(m, 19, 9, 2, 5, 0xe8e0d0); r(m, 23, 10, 4, 2, 0x2a2a2a);
            Px.outline(m, 0x6a6a70);
            put("mesa_camilla", m);
            BufferedImage tv = img(34, 18);
            r(tv, 0, 0, 34, 18, 0x101012); r(tv, 2, 2, 30, 14, 0x203040); r(tv, 4, 4, 10, 8, 0x5a6a7a); r(tv, 16, 5, 13, 3, 0xe8e8e8); r(tv, 2, 13, 30, 2, 0xe8c020);
            put("tele", tv);
            put("tele_off", ((java.util.function.Supplier<BufferedImage>) () -> { BufferedImage o = img(34, 18); r(o, 0, 0, 34, 18, 0x101012); r(o, 2, 2, 30, 14, 0x161a1e); p(o, 5, 4, 0x3a4048); return o; }).get());
            BufferedImage ch = img(12, 18);
            r(ch, 2, 0, 8, 9, 0x7a4a26); for (int x = 3; x < 10; x += 2) r(ch, x, 1, 1, 7, 0x5a3418); r(ch, 1, 9, 10, 4, 0xb0a090); for (int x = 2; x < 11; x += 2) p(ch, x, 10, 0x6a5a4a);
            r(ch, 2, 13, 1, 5, 0x5a3418); r(ch, 9, 13, 1, 5, 0x5a3418);
            Px.outline(ch, 0x2a1a0c);
            put("silla", ch);
            BufferedImage ar = img(18, 18);
            r(ar, 0, 0, 18, 7, 0x1e2a44); r(ar, 2, 7, 14, 8, 0x2a3a5a); r(ar, 0, 4, 3, 12, 0x6a4024); r(ar, 15, 4, 3, 12, 0x6a4024);
            Px.outline(ar, 0x0a0e18);
            put("butaca", ar);
            BufferedImage dt = img(30, 22);
            r(dt, 1, 2, 28, 14, 0x3a2418); r(dt, 1, 2, 28, 1, 0x5a3a28); r(dt, 3, 4, 24, 10, 0xece4d8); for (int x = 4; x < 27; x += 3) p(dt, x, 13, 0xd0c8bc);
            r(dt, 6, 6, 5, 3, 0x6a6a6a); r(dt, 14, 7, 6, 2, 0x2a2a2a); r(dt, 3, 16, 2, 6, 0x2a1810); r(dt, 25, 16, 2, 6, 0x2a1810);
            Px.outline(dt, 0x140c08);
            put("mesa_oscura", dt);
            BufferedImage es = img(24, 22);
            r(es, 1, 2, 22, 20, 0x3a3a3c); r(es, 3, 5, 18, 10, 0x1a1a1a); r(es, 5, 7, 14, 7, 0x6a3a1a); ov(es, 12, 11, 4, 2.5, 0xe86a20); r(es, 1, 0, 22, 3, 0x6a5040);
            Px.outline(es, 0x101010);
            put("estufa", es);
        }
        // Decoración de pared: aplique de forja, cuadro de flores, contraventanas, puerta de madera con clavos
        {
            BufferedImage a = img(16, 14);
            line(a, 2, 2, 13, 2, 0x1a1a1a); p(a, 1, 1, 0x1a1a1a); p(a, 14, 1, 0x1a1a1a); r(a, 6, 2, 4, 3, 0x5a3a20); r(a, 5, 5, 6, 6, 0xa85a30); r(a, 6, 6, 4, 4, 0xf0d890);
            put("aplique", a);
            BufferedImage c = img(18, 22);
            r(c, 0, 0, 18, 22, 0xc8c8c0); r(c, 1, 1, 16, 20, 0xd8dcd0);
            for (int i = 0; i < 10; i++) ov(c, 3 + rr.nextInt(12), 2 + rr.nextInt(9), 2, 2, i % 3 == 0 ? 0xe8e4d4 : 0xf8f8f0);
            ov(c, 9, 14, 3, 4, 0xc89878); r(c, 6, 17, 7, 4, 0x2a2a2a);
            put("cuadro", c);
            BufferedImage w = img(22, 16);
            r(w, 0, 0, 22, 16, 0x9a6a36); r(w, 4, 1, 14, 14, 0x9a6a36); r(w, 5, 2, 12, 12, 0xa8d8f0); for (int x = 6; x < 17; x += 3) r(w, x, 2, 1, 12, 0x1a1a1a); r(w, 5, 8, 12, 1, 0x1a1a1a);
            r(w, 0, 1, 4, 14, 0xa87a44); r(w, 18, 1, 4, 14, 0xa87a44); for (int y = 3; y < 14; y += 2) { r(w, 0, y, 4, 1, 0x8a5a2e); r(w, 18, y, 4, 1, 0x8a5a2e); }
            put("ventana_int", w);
            BufferedImage d = img(16, 26);
            r(d, 0, 0, 16, 26, 0x8a5a2e); for (int x = 3; x < 16; x += 4) r(d, x, 0, 1, 26, 0x6e4524); for (int y = 3; y < 26; y += 5) { p(d, 2, y, 0xd8c890); p(d, 13, y, 0xd8c890); }
            r(d, 11, 13, 2, 4, 0x1a1a1a);
            Px.outline(d, 0x3a2410);
            put("puerta_int", d);
            BufferedImage pc = img(16, 26);
            r(pc, 0, 0, 16, 26, 0xa86a34); r(pc, 2, 2, 12, 9, 0x8a5428); r(pc, 2, 13, 12, 11, 0x8a5428); r(pc, 12, 13, 1, 3, 0x2a2a2a);
            Px.outline(pc, 0x4a2a10);
            put("puerta_hab", pc);
            BufferedImage lamp = img(14, 18);
            r(lamp, 2, 15, 10, 3, 0xf0f0f0); r(lamp, 6, 3, 2, 13, 0xf0f0f0); r(lamp, 2, 1, 10, 3, 0xf8f8f8); line(lamp, 7, 16, 12, 17, 0x2a2a2a);
            Px.outline(lamp, 0x8a8a8a);
            put("flexo", lamp);
            BufferedImage plants = img(16, 18);
            r(plants, 4, 10, 8, 7, 0xa85a30); for (int i = 0; i < 8; i++) ov(plants, 4 + rr.nextInt(8), 3 + rr.nextInt(7), 2.5, 2, i % 2 == 0 ? 0x4a8a3a : 0x6aaa4a); p(plants, 6, 4, 0xe0405a); p(plants, 10, 6, 0xe0405a);
            Px.outline(plants, 0x2a3a1a);
            put("maceta", plants);
            BufferedImage col = img(16, 34);
            voronoi(col, 0, 0, 16, 34, 9, new int[]{0xc9a46c, 0xb48e56, 0xd6b47c, 0xa88650}, 0x8a6e48, rr);
            Px.outline(col, 0x5a4428);
            put("columna", col);
            BufferedImage agua = img(10, 14);
            r(agua, 1, 3, 8, 10, 0x3a7ad0); r(agua, 2, 4, 2, 8, 0x8ab8f0); r(agua, 3, 0, 4, 3, 0x2a5aa0);
            Px.outline(agua, 0x1a3a6a);
            put("garrafa", agua);
        }
    }

    static BufferedImage bed(int cover, int pillow, int frame, boolean metal) {
        BufferedImage b = img(34, 38);
        if (metal) {
            for (int x = 2; x < 32; x += 1) { int y = (int) (6 - Math.abs(Math.sin(x * 0.4)) * 5); p(b, x, y, frame); }
            r(b, 1, 1, 2, 10, frame); r(b, 31, 1, 2, 10, frame); r(b, 1, 9, 32, 2, frame);
        } else {
            r(b, 1, 0, 32, 10, frame); r(b, 1, 0, 32, 2, shade(frame, 1.15)); for (int x = 5; x < 30; x += 6) r(b, x, 3, 4, 5, shade(frame, 0.85));
        }
        r(b, 2, 9, 30, 28, 0xf0ece4);
        r(b, 4, 10, 12, 6, pillow); r(b, 18, 10, 12, 6, pillow); r(b, 4, 15, 12, 1, shade(pillow, 0.85)); r(b, 18, 15, 12, 1, shade(pillow, 0.85));
        r(b, 2, 18, 30, 19, cover); r(b, 2, 18, 30, 2, shade(cover, 1.1));
        for (int y = 22; y < 37; y += 4) r(b, 2, y, 30, 1, shade(cover, 0.92));
        r(b, 2, 36, 30, 1, shade(cover, 0.75));
        Px.outline(b, 0x2a2420);
        return b;
    }
}
