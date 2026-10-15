package guardian;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.ArrayDeque;

/** Herramienta de prueba: genera capturas sin ventana y comprueba que los sitios clave son alcanzables. */
public final class Shots {
    static int W = 1200, H = 675;

    public static void run(String dir) throws Exception {
        new File(dir).mkdirs();
        Game g = new Game();
        g.boot();

        // Alcance a pie desde la puerta del cortijo
        World ow = g.worlds.get("exterior");
        boolean[] reach = bfs(ow, WorldGen.doorX, WorldGen.doorY + 1);
        report(ow, reach, "hoguera iglesia", WorldGen.fireX, WorldGen.fireY + 1);
        report(ow, reach, "Padre Tomás", WorldGen.priestX, WorldGen.priestY + 1);
        report(ow, reach, "Cruz S. Gregorio", WorldGen.crossX, WorldGen.crossY + 1);
        report(ow, reach, "balsa reliquia", 109, 106);
        report(ow, reach, "ermita reliquia", 0, 0);
        report(ow, reach, "cárcavas reliquia", 182, 152);
        report(ow, reach, "presa (antes de abrir, debe ser NO)", WorldGen.bossX, WorldGen.bossY);
        for (Pickup k : ow.pickups) if (k.id != null) report(ow, reach, k.id, (int) (k.x / 16), (int) (k.y / 16));
        g.openBrambles();
        boolean[] reach2 = bfs(ow, WorldGen.doorX, WorldGen.doorY + 1);
        report(ow, reach2, "presa (abierta)", WorldGen.bossX, WorldGen.bossY);
        for (Pickup k : ow.pickups) if (k.id != null) report(ow, reach2, k.id + " (abierto)", (int) (k.x / 16), (int) (k.y / 16));
        report(ow, reach2, "manantial", (int) Math.round(WorldGen.riverX(57)) + 4, 58);
        // reconstruir el mundo con zarzas
        g.buildWorlds();

        // 1. título
        shot(g, dir + "/01_titulo.png");
        // 2. dormitorio al empezar
        g.newGame();
        g.page = null; g.dlg.clear(); g.st = Game.St.PLAY;
        g.snapCamera();
        shot(g, dir + "/02_dormitorio.png");
        // 3. diálogo
        g.say("Guardián", "Mi espada está en el baúl del rellano. Ya no salgo de casa sin ella.");
        shot(g, dir + "/03_dialogo.png");
        g.page = null; g.dlg.clear(); g.st = Game.St.PLAY;
        // rellano
        g.player.x = 15 * 16; g.player.y = 6 * 16; g.player.dir = 1; g.snapCamera();
        shot(g, dir + "/04_rellano.png");
        // 4. planta baja
        g.enter("casa_baja", 9 * 16, 9 * 16, 0);
        shot(g, dir + "/05_planta_baja.png");
        // 5. exterior cortijo de día
        g.player.hasSword = true;
        g.stage = 3;
        g.enter("exterior", WorldGen.doorX * 16 + 8, (WorldGen.doorY + 3) * 16, 0);
        g.day = 0.25;
        shot(g, dir + "/06_cortijo.png");
        g.player.x = (WorldGen.rx) * 16; g.player.y = 101 * 16 + 8; g.snapCamera();
        shot(g, dir + "/07_puente_poza.png");
        // 6. combate
        g.player.x = (WorldGen.rx + 6) * 16; g.player.y = 112 * 16; g.snapCamera();
        g.world.monsters.add(new Monster(Monster.Kind.JABALI, g.player.x + 40, g.player.y + 10, 1));
        g.world.monsters.add(new Monster(Monster.Kind.HUECO, g.player.x - 50, g.player.y + 20, 1));
        g.world.monsters.add(new Monster(Monster.Kind.ALACRAN, g.player.x + 10, g.player.y + 40, 1));
        for (Monster m : g.world.monsters) m.spawnFade = 0;
        g.player.atkT = 0.14; g.player.dir = 3;
        shot(g, dir + "/08_combate.png");
        g.player.atkT = 0;
        // 7. noche
        g.day = 0.68;
        g.world.monsters.clear();
        g.world.monsters.add(new Monster(Monster.Kind.SOMBRA, g.player.x - 40, g.player.y - 10, 1));
        g.world.monsters.get(0).spawnFade = 0;
        shot(g, dir + "/09_noche.png");
        g.world.monsters.clear();
        g.day = 0.3;
        // 8. pueblo
        g.player.x = 41 * 16; g.player.y = 99 * 16 + 12; g.player.dir = 1; g.snapCamera();
        shot(g, dir + "/10_iglesia.png");
        g.player.x = 46 * 16; g.player.y = 118 * 16; g.snapCamera();
        shot(g, dir + "/11_plaza_ayto.png");
        g.player.x = 80 * 16; g.player.y = 110 * 16; g.snapCamera();
        shot(g, dir + "/12_olivares_A326.png");
        g.player.x = WorldGen.crossX * 16; g.player.y = (WorldGen.crossY + 3) * 16; g.snapCamera();
        shot(g, dir + "/13_cruz_zarzas.png");
        // 9. presa con jefe
        g.openBrambles();
        g.stage = 7;
        g.player.x = WorldGen.bossX * 16; g.player.y = (WorldGen.bossY + 4) * 16; g.player.dir = 1; g.snapCamera();
        g.boss = new Monster(Monster.Kind.BESTIA, WorldGen.bossX * 16 + 8, (WorldGen.bossY - 1) * 16, 1);
        g.boss.spawnFade = 0;
        g.world.monsters.add(g.boss);
        g.orbs.add(new Orb(g.player.x - 30, g.player.y - 40, 0, 0, 5));
        g.orbs.add(new Orb(g.player.x + 30, g.player.y - 40, 0, 0, 5));
        shot(g, dir + "/14_jefe_presa.png");
        g.world.monsters.clear(); g.boss = null; g.orbs.clear();
        g.player.x = (int) WorldGen.riverX(57) * 16 + 40; g.player.y = 58 * 16; g.snapCamera();
        shot(g, dir + "/15_higueras.png");
        g.player.x = 180 * 16; g.player.y = 150 * 16; g.snapCamera();
        shot(g, dir + "/16_carcavas.png");
        // mapa
        g.stage = 5;
        g.player.x = WorldGen.doorX * 16; g.player.y = (WorldGen.doorY + 2) * 16;
        g.st = Game.St.MAP;
        shot(g, dir + "/17_mapa.png");
        g.st = Game.St.PLAY;
        // mapa completo del mundo a escala 1:1 (para revisar)
        BufferedImage full = new BufferedImage(ow.w * 4, ow.h * 4, BufferedImage.TYPE_INT_RGB);
        Graphics2D fg = full.createGraphics();
        fg.drawImage(g.buildMapImage(g.worlds.get("exterior")), 0, 0, ow.w * 4, ow.h * 4, null);
        fg.dispose();
        ImageIO.write(full, "png", new File(dir + "/mapa_completo.png"));
        System.out.println("Capturas en " + dir);
    }

    /** Juega la historia entera llamando a la lógica real y comprueba cada paso. */
    public static void simulate() {
        Game g = new Game();
        g.boot();
        g.newGame();
        skip(g);
        check("empieza sin espada", !g.player.hasSword && g.stage == 0);
        // ir al baúl
        g.player.x = 15.5 * 16; g.player.y = 5 * 16 + 4; g.player.dir = 1;
        g.interact(); skip(g);
        check("coge la espada", g.player.hasSword && g.stage == 1);
        // caminar hasta la escalera (andando de verdad)
        g.player.x = 14.5 * 16 + 8; g.player.y = 12 * 16;
        walk(g, java.awt.event.KeyEvent.VK_DOWN, 1.5);
        check("baja a la planta baja", g.world.id.equals("casa_baja"));
        g.player.x = 17 * 16 + 8; g.player.y = 11 * 16 + 4;
        walk(g, java.awt.event.KeyEvent.VK_DOWN, 1.0);
        check("sale al exterior", g.world.outdoor);
        skip(g);
        for (int i = 0; i < 10; i++) step(g, 1 / 60.0);
        check("misión de la ribera (6 engendros)", g.stage == 2 && g.world.monsters.stream().filter(m -> m.quest).count() == 6);
        // combate real: espada contra un engendro
        Monster target = g.world.monsters.get(0);
        target.x = g.player.x; target.y = g.player.y + 14; target.spawnFade = 0;
        g.player.dir = 0;
        int before = target.hp;
        g.queue.add(java.awt.event.KeyEvent.VK_SPACE);
        for (int i = 0; i < 20; i++) step(g, 1 / 60.0);
        check("la espada hace daño", target.hp < before || target.dead);
        for (Monster m : new java.util.ArrayList<>(g.world.monsters)) if (m.quest && !m.dead) g.damageMonster(m, 999, false, 0, 1);
        skip(g);
        check("ribera limpia -> radio", g.stage == 3);
        // radio
        Prop radio = g.world.props.stream().filter(p -> "radio".equals(p.id)).findFirst().get();
        g.player.x = radio.x; g.player.y = radio.y + 14; g.player.dir = 1;
        g.interact(); skip(g);
        check("escucha la radio", g.stage == 4);
        // Padre Tomás
        Npc cura = g.world.npcs.stream().filter(n -> n.key.equals("cura")).findFirst().get();
        g.player.x = cura.x; g.player.y = cura.y + 16; g.player.dir = 1;
        g.interact(); skip(g);
        check("habla con el cura", g.stage == 5);
        // Remedios cura y da hierbas
        g.player.hp = 10;
        Npc rem = g.world.npcs.stream().filter(n -> n.key.equals("curandera")).findFirst().get();
        g.player.x = rem.x; g.player.y = rem.y + 16; g.player.dir = 1;
        g.interact(); skip(g);
        check("Remedios cura y da hierbas", g.player.hp == g.player.maxHp && g.player.herbs >= 3);
        // la cruz
        g.player.x = WorldGen.crossX * 16 + 8; g.player.y = (WorldGen.crossY + 1) * 16 + 10; g.player.dir = 1;
        g.interact(); skip(g);
        check("purifica la cruz y abre la Linde", g.stage == 6 && g.world.get(102, 64) != T.BRAMBLE);
        // a la presa
        g.player.x = WorldGen.bossX * 16; g.player.y = (WorldGen.bossY + 4) * 16;
        for (int i = 0; i < 5; i++) step(g, 1 / 60.0);
        skip(g);
        check("aparece la Bestia", g.stage == 7 && g.boss != null);
        // pelear un rato de verdad (que no reviente nada)
        for (int i = 0; i < 600; i++) { if (i % 20 == 0) g.queue.add(java.awt.event.KeyEvent.VK_SPACE); step(g, 1 / 60.0); if (g.st == Game.St.DEAD) { g.respawn(); break; } skip(g); }
        if (g.boss == null) { // murió el Guardián y se reinició el combate
            g.enter("exterior", WorldGen.bossX * 16, (WorldGen.bossY + 4) * 16, 1);
            for (int i = 0; i < 5; i++) step(g, 1 / 60.0);
            skip(g);
        }
        check("la Bestia sigue presente para el combate", g.boss != null);
        g.player.invul = 999;
        g.damageMonster(g.boss, 99999, false, 0, -1);
        skip(g);
        check("vence a la Bestia", g.stage == 8);
        g.player.invul = 0;
        cura = g.world.npcs.stream().filter(n -> n.key.equals("cura")).findFirst().get();
        g.enter("exterior", cura.x, cura.y + 16, 1);
        g.interact(); skip(g);
        check("epílogo", g.st == Game.St.END);
        for (int i = 0; i < 20 && g.st == Game.St.END; i++) { g.queue.add(java.awt.event.KeyEvent.VK_ENTER); step(g, 1 / 60.0); }
        check("vuelve al juego libre", g.st == Game.St.PLAY && g.stage == 9);
        // guardar y cargar
        g.save();
        int lvl = g.player.lvl;
        check("carga la partida", g.load() && g.player.lvl == lvl && g.stage == 9 && g.world.get(102, 64) != T.BRAMBLE);
        // vagar de noche con monstruos durante 3 minutos de juego
        g.day = 0.7;
        g.player.invul = 0;
        java.util.Random r = new java.util.Random(3);
        int[] dirs = {java.awt.event.KeyEvent.VK_LEFT, java.awt.event.KeyEvent.VK_RIGHT, java.awt.event.KeyEvent.VK_UP, java.awt.event.KeyEvent.VK_DOWN};
        int deaths = 0, maxMon = 0;
        g.enter("exterior", 80 * 16, 120 * 16, 0);
        for (int i = 0; i < 60 * 180; i++) {
            if (i % 40 == 0) { java.util.Arrays.fill(g.keys, false); g.keys[dirs[r.nextInt(4)]] = true; }
            if (i % 15 == 0) g.queue.add(java.awt.event.KeyEvent.VK_SPACE);
            if (i % 300 == 0) g.queue.add(java.awt.event.KeyEvent.VK_K);
            step(g, 1 / 60.0);
            skip(g);
            if (g.st == Game.St.DEAD) { deaths++; g.respawn(); g.enter("exterior", 80 * 16, 120 * 16, 0); g.day = 0.7; }
            maxMon = Math.max(maxMon, g.world.monsters.size());
        }
        System.out.println("  vagabundeo: muertes=" + deaths + " max monstruos=" + maxMon + " nivel=" + g.player.lvl + " xp=" + g.player.xp);
        System.out.println(fails == 0 ? "SIMULACIÓN OK" : "FALLOS: " + fails);
    }

    static int fails = 0;

    static void check(String what, boolean ok) {
        System.out.println((ok ? "  OK   " : "  FALLO ") + what);
        if (!ok) fails++;
    }

    static void step(Game g, double dt) {
        synchronized (g.queue) { g.just = new java.util.HashSet<>(g.queue); g.queue.clear(); }
        g.update(dt);
    }

    static void skip(Game g) {
        int guard = 0;
        while (g.st == Game.St.DIALOG && guard++ < 50) { g.dlgChars = 9999; g.nextPage(); }
    }

    static void walk(Game g, int key, double secs) {
        g.keys[key] = true;
        for (int i = 0; i < secs * 60; i++) { step(g, 1 / 60.0); skip(g); }
        g.keys[key] = false;
    }

    static void shot(Game g, String file) throws Exception {
        BufferedImage img = new BufferedImage(W, H, BufferedImage.TYPE_INT_RGB);
        Graphics2D gg = img.createGraphics();
        for (int i = 0; i < 30; i++) g.render(gg, W, H); // estabiliza la cámara
        gg.dispose();
        ImageIO.write(img, "png", new File(file));
    }

    static boolean[] bfs(World w, int sx, int sy) {
        boolean[] seen = new boolean[w.w * w.h];
        ArrayDeque<int[]> q = new ArrayDeque<>();
        q.add(new int[]{sx, sy}); seen[sy * w.w + sx] = true;
        int[][] d = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!q.isEmpty()) {
            int[] c = q.poll();
            for (int[] k : d) {
                int x = c[0] + k[0], y = c[1] + k[1];
                if (x < 0 || y < 0 || x >= w.w || y >= w.h || seen[y * w.w + x] || w.solid(x, y)) continue;
                seen[y * w.w + x] = true; q.add(new int[]{x, y});
            }
        }
        return seen;
    }

    static void report(World w, boolean[] r, String name, int x, int y) {
        if (x == 0 && y == 0) return;
        boolean ok = false;
        for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
            int xx = x + i, yy = y + j;
            if (xx >= 0 && yy >= 0 && xx < w.w && yy < w.h && r[yy * w.w + xx]) ok = true;
        }
        System.out.println((ok ? "  OK   " : "  NO   ") + name + " (" + x + "," + y + ")");
    }
}
