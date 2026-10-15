package guardian;

/** Tipos de casilla del mapa. */
public final class T {
    public static final int VOID = 0, GRASS = 1, DIRT = 2, TRACK = 3, FIELD = 4, SAND = 5,
            ASPHALT = 6, PAVING = 7, CONCRETE = 8, TERRACE = 9, WATER = 10, DEEP = 11,
            CLIFF = 12, MOUNTAIN = 13, WALL_WHITE = 14, WALL_STONE = 15, WINDOW = 16, DOOR = 17,
            ROOF = 18, ROOF_SOLAR = 19, SHED = 20, DRYWALL = 21, BRAMBLE = 22, DAM = 23,
            BRIDGE = 24, FLOOR = 25, IWALL = 26, IWALL_STONE = 27, BATHWALL = 28, WALLTOP = 29,
            STAIRS = 30, CHURCH_WALL = 31, CHURCH_DOOR = 32, BARRICADE = 33, GRASS_GREEN = 34,
            ROOF_DARK = 35, PORCH = 36, CHURCH_ROOF = 37, BATHFLOOR = 38, IWALL_HI = 39;
    public static final int COUNT = 40;

    public static final boolean[] SOLID = new boolean[COUNT];
    public static final String[] NAME = new String[COUNT];

    static {
        int[] solid = {VOID, WATER, DEEP, CLIFF, MOUNTAIN, WALL_WHITE, WALL_STONE, WINDOW, ROOF,
                ROOF_SOLAR, SHED, DRYWALL, BRAMBLE, DAM, IWALL, IWALL_STONE, BATHWALL, WALLTOP,
                CHURCH_WALL, BARRICADE, ROOF_DARK, CHURCH_ROOF, IWALL_HI};
        for (int s : solid) SOLID[s] = true;
    }

    public static boolean isWater(int t) { return t == WATER || t == DEEP; }
}
