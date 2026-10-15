package guardian;

import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.image.BufferStrategy;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.*;
import java.util.List;

/**
 * El Guardián Errante — RPG de acción en pixel art ambientado en Pozo Alcón (Jaén),
 * siete años después del Colapso.
 */
public class Game extends Canvas implements Runnable, KeyListener {
    public static final int VW = 400, VH = 225, TS = 16;
    public static final double DAY_LEN = 480; // segundos por día completo

    enum St { TITLE, INTRO, PLAY, DIALOG, MAP, PAUSE, DEAD, END, HELP }

    // --- ventana
    JFrame frame;
    BufferedImage view = new BufferedImage(VW, VH, BufferedImage.TYPE_INT_RGB);
    BufferedImage dark = new BufferedImage(VW, VH, BufferedImage.TYPE_INT_ARGB);
    volatile boolean running = true;
    boolean fullscreen;

    // --- entrada
    final boolean[] keys = new boolean[1024];
    final Set<Integer> queue = Collections.synchronizedSet(new HashSet<>());
    Set<Integer> just = new HashSet<>();

    // --- mundo
    final Map<String, World> worlds = new HashMap<>();
    public World world;
    public Player player = new Player();
    public final List<Orb> orbs = new ArrayList<>();
    final List<Fx> fx = new ArrayList<>();
    final Random rnd = new Random();
    Monster boss;
    BufferedImage mapImg;

    // --- estado de la partida
    St st = St.TITLE;
    int stage;
    final Set<String> flags = new HashSet<>();
    final Set<String> picked = new HashSet<>();
    int questKills;
    double clock, day = 0.05; // 0 = 6:00
    String restWorld = "casa_alta"; double restX, restY;
    double camX, camY, shakeT, spawnT, deadT, tableCool;
    String lastArea = "", banner = ""; double bannerT;
    String toast = ""; double toastT;
    double titleT;
    int menuIdx;
    boolean hasSave;

    // --- diálogo
    final ArrayDeque<String[]> dlg = new ArrayDeque<>();
    String[] page; double dlgChars; Runnable dlgEnd;
    List<String> introPages; int introIdx; double introChars;
    List<String> endPages; int endIdx;

    // --- fuentes
    static String titleFont = "Serif", bodyFont = "SansSerif";

    public static void main(String[] args) throws Exception {
        System.setProperty("sun.java2d.uiScale", "1");
        if (args.length > 0 && args[0].equals("--capturas")) { Shots.run(args.length > 1 ? args[1] : "capturas"); return; }
        if (args.length > 0 && args[0].equals("--simular")) { Shots.simulate(); return; }
        Game g = new Game();
        g.boot();
        g.openWindow();
        new Thread(g, "juego").start();
    }

    void boot() {
        pickFonts();
        Art.init();
        buildWorlds();
        restX = 4 * 16 + 8; restY = 7 * 16 + 8;
        hasSave = saveFile().exists();
    }

    static void pickFonts() {
        try {
            Set<String> av = new HashSet<>(Arrays.asList(GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames()));
            for (String f : new String[]{"Palatino Linotype", "Book Antiqua", "Georgia", "DejaVu Serif"}) if (av.contains(f)) { titleFont = f; break; }
            for (String f : new String[]{"Segoe UI", "Verdana", "DejaVu Sans"}) if (av.contains(f)) { bodyFont = f; break; }
        } catch (Throwable ignored) { }
    }

    void buildWorlds() {
        worlds.clear();
        World ow = WorldGen.overworld();
        worlds.put(ow.id, ow);
        World gb = WorldGen.houseGround();
        worlds.put(gb.id, gb);
        World up = WorldGen.houseUpper();
        worlds.put(up.id, up);
        mapImg = buildMapImage(ow);
    }

    void openWindow() {
        frame = new JFrame("El Guardián Errante · Pozo Alcón");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        Dimension scr = Toolkit.getDefaultToolkit().getScreenSize();
        int s = Math.max(2, Math.min((scr.width - 80) / VW, (scr.height - 120) / VH));
        setPreferredSize(new Dimension(VW * s, VH * s));
        setBackground(Color.BLACK);
        frame.add(this);
        frame.pack();
        frame.setLocationRelativeTo(null);
        frame.setIconImage(scale(Art.hero[0][0], 4));
        addKeyListener(this);
        setFocusTraversalKeysEnabled(false);
        addMouseListener(new MouseAdapter() { @Override public void mousePressed(MouseEvent e) { requestFocus(); } });
        frame.addWindowFocusListener(new WindowAdapter() {
            @Override public void windowGainedFocus(WindowEvent e) { requestFocusInWindow(); }
            @Override public void windowLostFocus(WindowEvent e) { Arrays.fill(keys, false); }
        });
        frame.setVisible(true);
        requestFocus();
        Sound.init();
    }

    void toggleFullscreen() {
        fullscreen = !fullscreen;
        frame.dispose();
        frame.setUndecorated(fullscreen);
        if (fullscreen) frame.setExtendedState(JFrame.MAXIMIZED_BOTH);
        else { frame.setExtendedState(JFrame.NORMAL); frame.pack(); frame.setLocationRelativeTo(null); }
        frame.setVisible(true);
        requestFocus();
    }

    static BufferedImage scale(BufferedImage s, int k) {
        BufferedImage d = new BufferedImage(s.getWidth() * k, s.getHeight() * k, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = d.createGraphics();
        g.drawImage(s, 0, 0, s.getWidth() * k, s.getHeight() * k, null);
        g.dispose();
        return d;
    }

    // ================================================================ BUCLE
    @Override
    public void run() {
        long last = System.nanoTime();
        double acc = 0, step = 1.0 / 60;
        while (running) {
            long now = System.nanoTime();
            acc += Math.min(0.25, (now - last) / 1e9);
            last = now;
            while (acc >= step) {
                synchronized (queue) { just = new HashSet<>(queue); queue.clear(); }
                update(step);
                acc -= step;
            }
            draw();
            try { Thread.sleep(2); } catch (InterruptedException e) { return; }
        }
    }

    void draw() {
        if (!isDisplayable()) return;
        BufferStrategy bs = getBufferStrategy();
        if (bs == null) { try { createBufferStrategy(2); } catch (Exception e) { return; } return; }
        Graphics2D g = (Graphics2D) bs.getDrawGraphics();
        try { render(g, getWidth(), getHeight()); } finally { g.dispose(); }
        bs.show();
        Toolkit.getDefaultToolkit().sync();
    }

    boolean pressed(int... codes) {
        for (int c : codes) if (just.contains(c)) { just.remove(c); return true; }
        return false;
    }

    boolean down(int... codes) {
        for (int c : codes) if (c < keys.length && keys[c]) return true;
        return false;
    }

    boolean confirm() { return pressed(KeyEvent.VK_ENTER, KeyEvent.VK_E, KeyEvent.VK_SPACE, KeyEvent.VK_Z); }

    // ================================================================ ACTUALIZACIÓN
    void update(double dt) {
        if (pressed(KeyEvent.VK_F11) && frame != null) toggleFullscreen();
        if (pressed(KeyEvent.VK_N)) { Sound.toggleMusic(); toast(Sound.musicOn ? "Música activada" : "Música desactivada"); }
        if (toastT > 0) toastT -= dt;
        if (bannerT > 0) bannerT -= dt;
        if (shakeT > 0) shakeT -= dt;
        titleT += dt;
        for (Prop p : world == null ? List.<Prop>of() : world.props) if (p.anim == 1) p.img = Art.campfire[(int) (clock * 8 + p.x) % 3];

        switch (st) {
            case TITLE -> updateTitle();
            case HELP -> { if (confirm() || pressed(KeyEvent.VK_ESCAPE)) st = St.TITLE; }
            case INTRO -> updateIntro(dt);
            case PLAY -> updatePlay(dt);
            case DIALOG -> { updateDialog(dt); updateFx(dt); clock += dt; }
            case MAP -> { if (pressed(KeyEvent.VK_M, KeyEvent.VK_ESCAPE, KeyEvent.VK_TAB, KeyEvent.VK_ENTER)) st = St.PLAY; }
            case PAUSE -> updatePause();
            case DEAD -> {
                deadT += dt; updateFx(dt);
                if (deadT > 1.2 && confirm()) respawn();
            }
            case END -> {
                introChars += dt * 40;
                if (confirm()) {
                    if (introChars < endPages.get(endIdx).length()) introChars = 999;
                    else if (++endIdx >= endPages.size()) { st = St.PLAY; stage = 9; Sound.music("calma"); save(); toast("Partida guardada. Pozo Alcón es tuyo: explora libremente."); }
                    else introChars = 0;
                }
            }
        }
    }

    // ---------------------------------------------------------------- título
    String[] menu() {
        return hasSave ? new String[]{"Continuar", "Nueva partida", "Controles", "Salir"} : new String[]{"Nueva partida", "Controles", "Salir"};
    }

    void updateTitle() {
        String[] m = menu();
        if (pressed(KeyEvent.VK_UP, KeyEvent.VK_W)) menuIdx = (menuIdx + m.length - 1) % m.length;
        if (pressed(KeyEvent.VK_DOWN, KeyEvent.VK_S)) menuIdx = (menuIdx + 1) % m.length;
        if (confirm()) {
            String o = m[menuIdx];
            switch (o) {
                case "Continuar" -> { if (load()) { st = St.PLAY; Sound.music(stage == 7 ? "batalla" : "calma"); } else toast("No se pudo cargar la partida."); }
                case "Nueva partida" -> startIntro();
                case "Controles" -> st = St.HELP;
                case "Salir" -> System.exit(0);
            }
        }
    }

    void startIntro() {
        introPages = List.of(
                "Primero fueron los apagones. Luego, el silencio en la radio.\nY después... ellos.",
                "Salieron del agua y de la tierra.\nEn pocos meses, casi toda la humanidad había caído.",
                "Siete años después del Colapso, en un cortijo junto al río Guadalentín,\na las afueras de Pozo Alcón, un hombre sigue en pie.",
                "«No soy un santo. Solo un hombre que sigue la luz,\naunque a veces la encuentre en la oscuridad.»");
        introIdx = 0; introChars = 0;
        st = St.INTRO;
    }

    void updateIntro(double dt) {
        introChars += dt * 38;
        if (pressed(KeyEvent.VK_ESCAPE)) { newGame(); return; }
        if (confirm()) {
            if (introChars < introPages.get(introIdx).length()) introChars = 999;
            else if (++introIdx >= introPages.size()) newGame();
            else introChars = 0;
        }
    }

    void newGame() {
        buildWorlds();
        player = new Player();
        stage = 0; flags.clear(); picked.clear(); questKills = 0; clock = 0; day = 0.04;
        boss = null; orbs.clear(); fx.clear();
        enter("casa_alta", 4 * 16 + 8, 7 * 16 + 8, 3);
        restWorld = "casa_alta"; restX = player.x; restY = player.y;
        st = St.PLAY;
        Sound.music("calma");
        say("Guardián", "Otra mañana en el cortijo. El ventilador no gira desde que cayó la red, pero las placas solares aún dan para la radio.",
                "Mi espada está en el baúl del rellano. Ya no salgo de casa sin ella.");
    }

    // ---------------------------------------------------------------- pausa
    String[] pauseMenu() { return new String[]{"Continuar", "Guardar partida", "Controles", Sound.musicOn ? "Música: sí" : "Música: no", "Salir al título"}; }

    void updatePause() {
        String[] m = pauseMenu();
        if (pressed(KeyEvent.VK_ESCAPE)) { st = St.PLAY; return; }
        if (pressed(KeyEvent.VK_UP, KeyEvent.VK_W)) menuIdx = (menuIdx + m.length - 1) % m.length;
        if (pressed(KeyEvent.VK_DOWN, KeyEvent.VK_S)) menuIdx = (menuIdx + 1) % m.length;
        if (confirm()) {
            switch (menuIdx) {
                case 0 -> st = St.PLAY;
                case 1 -> { save(); toast("Partida guardada"); st = St.PLAY; }
                case 2 -> { st = St.HELP; }
                case 3 -> Sound.toggleMusic();
                case 4 -> { st = St.TITLE; menuIdx = 0; hasSave = saveFile().exists(); Sound.music("calma"); }
            }
        }
    }

    // ---------------------------------------------------------------- juego
    public boolean isNight() {
        double h = hour();
        return h >= 20.5 || h < 5.5;
    }

    double hour() { return (day * 24 + 6) % 24; }

    double darkness() {
        if (!world.outdoor) return 0;
        double h = hour();
        if (h >= 7 && h < 18.5) return 0;
        if (h >= 18.5 && h < 21) return (h - 18.5) / 2.5 * 0.74;
        if (h >= 21 || h < 4.5) return 0.74;
        return (1 - (h - 4.5) / 2.5) * 0.74;
    }

    public boolean playerSafe() {
        return world.safeAt((int) (player.x / TS), (int) (player.y / TS));
    }

    void updatePlay(double dt) {
        Player p = player;
        clock += dt;
        if (world.outdoor) day = (day + dt / DAY_LEN) % 1.0;
        if (tableCool > 0) tableCool -= dt;

        if (pressed(KeyEvent.VK_ESCAPE, KeyEvent.VK_P)) { st = St.PAUSE; menuIdx = 0; return; }
        if (pressed(KeyEvent.VK_M, KeyEvent.VK_TAB)) { st = St.MAP; return; }

        // --- entrada
        double ix = 0, iy = 0;
        if (down(KeyEvent.VK_LEFT, KeyEvent.VK_A)) ix -= 1;
        if (down(KeyEvent.VK_RIGHT, KeyEvent.VK_D)) ix += 1;
        if (down(KeyEvent.VK_UP, KeyEvent.VK_W)) iy -= 1;
        if (down(KeyEvent.VK_DOWN, KeyEvent.VK_S)) iy += 1;
        if (pressed(KeyEvent.VK_SPACE, KeyEvent.VK_J)) {
            if (!p.hasSword) toast("No llevas la espada. Está en el baúl del rellano.");
            else if (p.atkCool <= 0) { p.atkT = 0.24; p.atkCool = 0.36; p.hitSet.clear(); Sound.play("swing"); }
        }
        if (pressed(KeyEvent.VK_K, KeyEvent.VK_1)) pray();
        if (pressed(KeyEvent.VK_L, KeyEvent.VK_2)) holyLight();
        if (pressed(KeyEvent.VK_Q, KeyEvent.VK_3)) eatHerb();
        if (pressed(KeyEvent.VK_E, KeyEvent.VK_ENTER)) { interact(); if (st != St.PLAY) return; }

        // --- movimiento
        if (p.atkCool > 0) p.atkCool -= dt;
        if (p.atkT > 0) p.atkT -= dt;
        if (p.invul > 0) p.invul -= dt;
        if (p.prayT > 0) p.prayT -= dt;
        p.applyKnockPublic(world, dt);
        double len = Math.hypot(ix, iy);
        p.moving = len > 0 && p.kbT <= 0;
        if (p.moving) {
            double sp = 74 * (p.atkT > 0 ? 0.45 : 1);
            if (p.atkT <= 0) p.faceTo(ix, iy);
            p.move(world, ix / len * sp * dt, iy / len * sp * dt);
            p.anim += dt;
        } else p.anim = 0;

        // --- regeneración de Fe
        p.feAcc += dt * (isNight() ? 1.0 : 1.6);
        while (p.feAcc >= 1) { p.feAcc -= 1; if (p.fe < p.maxFe) p.fe++; }

        // --- golpe de espada
        if (p.atkT > 0.04 && p.atkT < 0.21) {
            double[] c = swordCenter();
            for (Monster m : world.monsters) {
                if (m.dead || p.hitSet.contains(m)) continue;
                double r = 15 + m.hw;
                if (Math.hypot(m.x - c[0], (m.y - 6) - c[1]) < r) {
                    p.hitSet.add(m);
                    int d = p.atk + rnd.nextInt(5) - 1;
                    boolean crit = rnd.nextDouble() < 0.1;
                    if (crit) d = d * 2;
                    damageMonster(m, d, crit, m.x - p.x, m.y - p.y);
                }
            }
        }

        // --- puertas y escaleras
        int ptx = (int) Math.floor(p.x / TS), pty = (int) Math.floor(p.y / TS);
        for (World.Warp w : world.warps) {
            if (ptx >= w.x && ptx < w.x + w.w && pty >= w.y && pty < w.y + w.h) {
                Sound.play("door");
                enter(w.to, w.tx, w.ty, w.dir);
                return;
            }
        }

        // --- objetos del suelo
        for (Iterator<Pickup> it = world.pickups.iterator(); it.hasNext(); ) {
            Pickup k = it.next();
            k.t += dt;
            if (Math.hypot(k.x - p.x, k.y - p.y) < 11) { it.remove(); collect(k); }
        }

        // --- monstruos
        for (Monster m : world.monsters) {
            if (m.dead) continue;
            m.update(this, dt);
            if (p.dead || p.invul > 0 || m.spawnFade > 0) continue;
            double reach = m.kind == Monster.Kind.BESTIA ? 22 : (m.hw + 5);
            if (Math.hypot(m.x - p.x, m.y - p.y) < reach) hurtPlayer(m.dmg, m.x, m.y);
        }
        world.monsters.removeIf(m -> m.dead || (!m.quest && m.kind != Monster.Kind.BESTIA && m.dist(p) > 36 * TS));

        // --- proyectiles
        for (Iterator<Orb> it = orbs.iterator(); it.hasNext(); ) {
            Orb o = it.next();
            o.x += o.vx * dt; o.y += o.vy * dt; o.life -= dt;
            boolean gone = o.life <= 0 || world.solid((int) (o.x / TS), (int) (o.y / TS)) && !T.isWater(world.get((int) (o.x / TS), (int) (o.y / TS)));
            if (!gone && p.invul <= 0 && Math.hypot(o.x - p.x, o.y - (p.y - 8)) < 8) { hurtPlayer(o.dmg, o.x, o.y); gone = true; }
            if (gone) { it.remove(); for (int i = 0; i < 4; i++) fx.add(Fx.spark(o.x, o.y, rnd.nextGaussian() * 30, rnd.nextGaussian() * 30, 0x50d8c8, 0.3)); }
        }

        spawnLogic(dt);
        stageLogic();
        updateFx(dt);

        // --- nombre de la zona
        String an = world.areaName(ptx, pty);
        if (!an.equals(lastArea)) { lastArea = an; banner = an; bannerT = 2.6; }
    }

    double[] swordCenter() {
        Player p = player;
        return switch (p.dir) {
            case 0 -> new double[]{p.x, p.y + 6};
            case 1 -> new double[]{p.x, p.y - 22};
            case 2 -> new double[]{p.x - 15, p.y - 8};
            default -> new double[]{p.x + 15, p.y - 8};
        };
    }

    void damageMonster(Monster m, int d, boolean crit, double kx, double ky) {
        m.hp -= d;
        m.flash = 0.12;
        if (m.kind != Monster.Kind.BESTIA) m.knock(kx, ky, crit ? 240 : 170);
        else if (crit) m.knock(kx, ky, 60);
        fx.add(Fx.text(m.x, m.y - 22, (crit ? "¡" + d + "!" : "" + d), crit ? 0xffe060 : 0xffffff));
        for (int i = 0; i < 5; i++) fx.add(Fx.spark(m.x, m.y - 8, rnd.nextGaussian() * 50, rnd.nextGaussian() * 50 - 20, m.kind == Monster.Kind.SOMBRA ? 0x8a6ab0 : 0x7a1a14, 0.35));
        Sound.play("hit");
        if (m.hp <= 0) killMonster(m);
    }

    void killMonster(Monster m) {
        m.dead = true;
        for (int i = 0; i < 14; i++) fx.add(Fx.spark(m.x, m.y - 8, rnd.nextGaussian() * 60, rnd.nextGaussian() * 60 - 30, i % 2 == 0 ? 0x2a2030 : 0x6a5a7a, 0.6));
        gainXp(m.xp, m.x, m.y - 28);
        if (rnd.nextDouble() < 0.22) world.pickups.add(new Pickup(Pickup.HERB, m.x, m.y, null));
        if (stage == 2 && world.outdoor) {
            questKills++;
            if (questKills >= 6) {
                stage = 3; save();
                say("Guardián", "La ribera está limpia... por ahora.", "La radio del porche ha vuelto a crepitar. Juraría que he oído una voz.");
            } else toast("Engendros eliminados: " + questKills + "/6");
        }
        if (m.kind == Monster.Kind.BESTIA) bossDefeated();
    }

    void gainXp(int amount, double x, double y) {
        Player p = player;
        p.xp += amount;
        fx.add(Fx.text(x, y, "+" + amount + " XP", 0xb0e0ff));
        while (p.xp >= p.xpNext()) {
            p.xp -= p.xpNext();
            p.lvl++;
            p.maxHp += 12; p.maxFe += 6; p.atk += 2;
            p.hp = p.maxHp; p.fe = p.maxFe;
            Sound.play("level");
            fx.add(Fx.ring(p.x, p.y - 8, 40, 0xffe080));
            if (p.lvl == 3) say("Guardián", "¡Nivel 3! Siento la luz más fuerte que nunca.", "Has aprendido LUZ: pulsa L para liberar una onda sagrada que daña a los engendros cercanos (cuesta 40 de Fe).");
            else toast("¡Nivel " + p.lvl + "! Vida y Fe al máximo. Ataque +2");
        }
    }

    void hurtPlayer(int dmg, double fromX, double fromY) {
        Player p = player;
        if (p.dead) return;
        p.hp -= dmg;
        p.invul = 0.9;
        p.flash = 0.2;
        p.knock(p.x - fromX, p.y - fromY, 160);
        shake(0.18);
        fx.add(Fx.text(p.x, p.y - 26, "-" + dmg, 0xff6050));
        Sound.play("hurt");
        if (p.hp <= 0) {
            p.hp = 0; p.dead = true; deadT = 0; st = St.DEAD;
            Sound.play("die");
        }
    }

    public void shake(double t) { shakeT = Math.max(shakeT, t); }

    public void sfx(String k) { Sound.play(k); }

    void pray() {
        Player p = player;
        if (p.fe < 25) { toast("No te queda Fe suficiente para orar (25)."); return; }
        if (p.hp >= p.maxHp) { toast("No estás herido."); return; }
        p.fe -= 25;
        int h = Math.max(25, (int) (p.maxHp * 0.35));
        p.hp = Math.min(p.maxHp, p.hp + h);
        p.prayT = 0.8;
        fx.add(Fx.text(p.x, p.y - 30, "+" + h, 0x80ff90));
        for (int i = 0; i < 18; i++) fx.add(Fx.spark(p.x + rnd.nextGaussian() * 8, p.y - rnd.nextDouble() * 20, 0, -20 - rnd.nextDouble() * 30, 0xffe8a0, 0.9));
        Sound.play("heal");
    }

    void holyLight() {
        Player p = player;
        if (!p.canLight()) { toast("Aún no dominas la Luz (nivel 3)."); return; }
        if (p.fe < 40) { toast("No te queda Fe suficiente para la Luz (40)."); return; }
        p.fe -= 40;
        fx.add(Fx.ring(p.x, p.y - 8, 64, 0xfff0b0));
        for (int i = 0; i < 24; i++) { double a = i * Math.PI / 12; fx.add(Fx.spark(p.x, p.y - 8, Math.cos(a) * 140, Math.sin(a) * 140, 0xfff0b0, 0.4)); }
        Sound.play("light");
        shake(0.15);
        for (Monster m : new ArrayList<>(world.monsters)) {
            if (m.dead) continue;
            if (Math.hypot(m.x - p.x, m.y - p.y) < 64 + m.hw) damageMonster(m, p.atk * 2 + 6, false, m.x - p.x, m.y - p.y);
        }
    }

    void eatHerb() {
        Player p = player;
        if (p.herbs <= 0) { toast("No te quedan hierbas medicinales."); return; }
        if (p.hp >= p.maxHp) { toast("No estás herido."); return; }
        p.herbs--;
        p.hp = Math.min(p.maxHp, p.hp + 30);
        fx.add(Fx.text(p.x, p.y - 30, "+30", 0x80ff90));
        Sound.play("heal");
    }

    void collect(Pickup k) {
        Player p = player;
        Sound.play("pickup");
        if (k.type == Pickup.HERB) { p.herbs++; toast("+1 hierba medicinal (Q para usarla)"); }
        else if (k.type == Pickup.RELIC) {
            picked.add(k.id);
            p.relics++;
            p.maxHp += 10; p.atk += 1; p.maxFe += 5; p.hp = p.maxHp;
            fx.add(Fx.ring(k.x, k.y, 30, 0xffd860));
            say("Guardián", "Una reliquia de los viejos santuarios. Al tocarla, el cansancio desaparece.",
                    "Reliquias: " + p.relics + "/5.  Vida máxima +10, Fe máxima +5, Ataque +1.");
            save();
        }
    }

    // ---------------------------------------------------------------- aparición de engendros
    void spawnLogic(double dt) {
        if (!world.outdoor) return;
        spawnT -= dt;
        if (spawnT > 0) return;
        spawnT = 1.1;
        Player p = player;
        int near = 0;
        for (Monster m : world.monsters) if (m.dist(p) < 26 * TS) near++;
        int cap = isNight() ? 8 : 4;
        if (stage < 2) cap = 0;
        if (stage == 2) cap = 1;
        if (near >= cap) return;
        for (int tries = 0; tries < 12; tries++) {
            double a = rnd.nextDouble() * Math.PI * 2, d = (13 + rnd.nextDouble() * 8) * TS;
            double x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d;
            int tx = (int) (x / TS), ty = (int) (y / TS);
            if (world.solid(tx, ty) || world.noSpawnAt(tx, ty)) continue;
            if (world.blocked(x, y, 6, 4)) continue;
            double tier = world.tierAt(tx, ty);
            World.Area ar = world.areaAt(tx, ty);
            String an = ar == null ? "" : ar.name;
            Monster.Kind k;
            double r = rnd.nextDouble();
            if (isNight() && r < 0.4) k = Monster.Kind.SOMBRA;
            else if (an.startsWith("Pozo")) k = r < 0.8 ? Monster.Kind.HUECO : Monster.Kind.JABALI;
            else if (an.startsWith("Cárcavas") || an.startsWith("Los Llanos")) k = r < 0.65 ? Monster.Kind.ALACRAN : Monster.Kind.JABALI;
            else if (an.startsWith("Barranco")) k = r < 0.5 ? Monster.Kind.JABALI : Monster.Kind.HUECO;
            else k = r < 0.55 ? Monster.Kind.JABALI : (r < 0.8 ? Monster.Kind.HUECO : Monster.Kind.ALACRAN);
            if (stage >= 8) tier *= 0.85;
            if (isNight()) tier *= 1.15;
            tier *= 1 + 0.05 * (player.lvl - 1);
            world.monsters.add(new Monster(k, x, y, tier));
            return;
        }
    }

    public void spawnNear(Monster.Kind k, double x, double y, double tier) {
        for (int i = 0; i < 10; i++) {
            double xx = x + rnd.nextGaussian() * 10, yy = y + rnd.nextGaussian() * 10;
            if (!world.blocked(xx, yy, 6, 4)) { world.monsters.add(new Monster(k, xx, yy, tier)); return; }
        }
    }

    // ---------------------------------------------------------------- historia
    String objective() {
        return switch (stage) {
            case 0 -> "Coge tu espada del baúl del rellano.";
            case 1 -> "Sal del cortijo.";
            case 2 -> "Limpia la ribera de engendros (" + questKills + "/6).";
            case 3 -> "Escucha la radio del porche.";
            case 4 -> "Ve a Pozo Alcón: Iglesia de la Encarnación (al oeste, por la A-326).";
            case 5 -> "Reza en la Cruz de San Gregorio (A-326, camino de La Bolera).";
            case 6 -> "Sigue el Guadalentín río arriba hasta la presa de La Bolera.";
            case 7 -> "Derrota a la Bestia de La Bolera.";
            case 8 -> "Vuelve con los tuyos.";
            default -> "Pozo Alcón respira. Busca las reliquias (" + player.relics + "/5).";
        };
    }

    int[] objectiveTarget() {
        return switch (stage) {
            case 2, 3 -> new int[]{WorldGen.doorX, WorldGen.doorY + 2};
            case 4 -> new int[]{WorldGen.priestX, WorldGen.priestY};
            case 5 -> new int[]{WorldGen.crossX, WorldGen.crossY};
            case 6, 7 -> new int[]{WorldGen.bossX, WorldGen.bossY};
            case 8 -> new int[]{WorldGen.priestX, WorldGen.priestY};
            default -> null;
        };
    }

    void stageLogic() {
        if (stage == 1 && world.outdoor) {
            stage = 2;
            for (int[] q : WorldGen.questSpawns) {
                Monster.Kind k = rnd.nextBoolean() ? Monster.Kind.JABALI : Monster.Kind.HUECO;
                double x = q[0] * TS + 8, y = q[1] * TS + 8;
                if (world.blocked(x, y, 7, 4)) { x += 16; }
                Monster m = new Monster(k, x, y, 0.85);
                m.quest = true;
                world.monsters.add(m);
            }
            say("Guardián", "Ahí están otra vez, rondando la poza.", "Mientras yo siga aquí, nadie toca esta casa.  [Espacio] para atacar.");
        }
        if ((stage == 6 || stage == 7) && world.outdoor && boss == null && lastArea.equals("Presa de La Bolera")) {
            stage = 7;
            boss = new Monster(Monster.Kind.BESTIA, WorldGen.bossX * TS + 8, (WorldGen.bossY - 1) * TS, 1);
            world.monsters.add(boss);
            Sound.music("batalla");
            Sound.play("roar");
            shake(0.8);
            say("Guardián", "El agua del pantano se agita... Algo enorme sube desde la cueva del nacimiento.", "«No todos los que caminan en la oscuridad son malos. Algunos solo buscan la luz.» Pero tú no.");
        }
    }

    void bossDefeated() {
        stage = 8;
        boss = null;
        orbs.clear();
        for (Monster m : world.monsters) if (!m.dead) { m.dead = true; }
        Sound.music("calma");
        Sound.play("purify");
        shake(1.0);
        say("Guardián", "La Bestia se hunde en el agua oscura... y no vuelve a salir.",
                "Sobre el embalse de La Bolera, por primera vez en siete años, el agua refleja el cielo.",
                "Tengo que contárselo a Padre Tomás.");
        save();
    }

    void purifyCross() {
        stage = 6;
        openBrambles();
        Sound.play("purify");
        shake(0.6);
        for (int i = 0; i < 40; i++) fx.add(Fx.spark(WorldGen.crossX * TS + 8, WorldGen.crossY * TS - 10, rnd.nextGaussian() * 70, rnd.nextGaussian() * 70, 0xffe8a0, 1.2));
        fx.add(Fx.ring(WorldGen.crossX * TS + 8, WorldGen.crossY * TS, 90, 0xfff0c0));
        say("Guardián", "«No soy un santo... solo un hombre que sigue la luz.»",
                "La cruz se enciende con una luz cálida. A lo lejos, las zarzas negras de La Linde se marchitan y se deshacen en ceniza.",
                "El camino del norte está abierto. Río arriba, hacia La Bolera.");
        save();
    }

    void openBrambles() {
        World ow = worlds.get("exterior");
        for (int[] b : WorldGen.brambles) if (ow.get(b[0], b[1]) == T.BRAMBLE) ow.set(b[0], b[1], b[2]);
        for (Prop p : ow.props) if ("cruz".equals(p.id)) p.img = Art.P.get("cruzluz");
        mapImg = buildMapImage(ow);
    }

    // ---------------------------------------------------------------- interacción
    void interact() {
        Player p = player;
        double fx0 = p.x + (p.dir == 2 ? -12 : p.dir == 3 ? 12 : 0);
        double fy0 = p.y - 4 + (p.dir == 0 ? 12 : p.dir == 1 ? -14 : 0);
        Npc bestN = null; double bd = 22;
        for (Npc n : world.npcs) { double d = Math.hypot(n.x - fx0, n.y - 6 - fy0); if (d < bd) { bd = d; bestN = n; } }
        if (bestN != null) {
            if (bestN.set != null) bestN.dir = p.dir == 0 ? 1 : p.dir == 1 ? 0 : p.dir == 2 ? 3 : 2;
            talk(bestN);
            return;
        }
        Prop best = null; bd = 26;
        for (Prop pr : world.props) {
            if (pr.id == null) continue;
            double px = pr.x, py = pr.y - Math.min(10, pr.img.getHeight() / 3.0);
            double d = Math.hypot(px - fx0, py - fy0);
            double reach = Math.max(18, pr.img.getWidth() / 2.0 + 6);
            if (d < reach && d < bd + 12) { if (best == null || d < bd) { bd = d; best = pr; } }
        }
        if (best != null) use(best);
    }

    void talk(Npc n) {
        String k = n.key;
        Sound.play("talk");
        switch (k) {
            case "gato" -> say("Guardián", "El gato atigrado duerme sobre el cojín, como siempre. Algunas cosas no cambian.");
            case "perro" -> say("Guardián", "El perrillo mueve la cola. Es el mejor centinela del barranco: ladra antes de que lleguen.");
            case "cura" -> {
                if (stage <= 4) {
                    sayAs(n, "¡Dios bendito! ¡Un hombre del barranco, vivo! Te oímos por la radio... bueno, oímos que alguien nos oía.",
                            "Soy Tomás. Somos once, resistiendo tras estas barricadas desde el Colapso.",
                            "Todo empezó en La Bolera. Algo despertó en la cueva del nacimiento del Guadalentín, bajo el embalse. Desde entonces, el agua trae la muerte.",
                            "Las zarzas negras de La Linde han cerrado el camino del norte. Pero la Cruz de San Gregorio, en la A-326 camino del pantano, aún guarda luz.",
                            "Ve a la cruz y reza. Si las zarzas se abren, sigue el río hasta la presa. Y puedes descansar junto a nuestra hoguera cuando quieras.");
                    if (stage <= 4) { stage = 5; restWorld = "exterior"; restX = WorldGen.fireX * TS + 8; restY = (WorldGen.fireY + 1) * TS + 8; dlgEnd = this::save; }
                } else if (stage == 5) sayAs(n, "La Cruz de San Gregorio está al norte, junto a la A-326, camino de La Bolera. Que Dios te guarde.");
                else if (stage <= 7) sayAs(n, "Las zarzas han caído... lo hemos visto desde el campanario. Sigue el río hasta la presa, hijo.");
                else if (stage == 8) {
                    sayAs(n, "¿Lo has hecho? ¿De verdad? ... El agua del pantano vuelve a ser agua.",
                            "Las campanas de la Encarnación volverán a sonar en Pozo Alcón. Gracias, Guardián.");
                    dlgEnd = this::startEnding;
                } else sayAs(n, "Cada mañana sale más gente de las casas. Pozo Alcón vuelve a respirar.");
            }
            case "curandera" -> {
                player.hp = player.maxHp; player.fe = player.maxFe;
                if (!flags.contains("hierbas_remedios")) {
                    flags.add("hierbas_remedios"); player.herbs += 3;
                    sayAs(n, "Ay, qué mala cara traes. Toma, una infusión de romero y tomillo.", "Y llévate estas hierbas para el camino. (+3 hierbas medicinales · Vida y Fe al máximo)");
                } else sayAs(n, "Siéntate un poco, que te curo esas heridas. (Vida y Fe al máximo)");
            }
            case "guardia" -> sayAs(n, stage < 6 ? "Por la noche salen las Sombras del barranco. Si puedes, no andes a oscuras lejos de una hoguera."
                    : "Antes conducía el autobús a Baza. Ahora vigilo esta barricada. La vida da muchas vueltas, ¿eh?",
                    "Un consejo: cuando la Fe te lo permita, ora con K. Te salvará el pellejo.");
            case "mecanica" -> sayAs(n, "Dicen que quedan reliquias de los viejos santuarios: la Ermita de Santa Ana, la balsa de riego de la carretera, las cárcavas del este...",
                    "Y otra en la sierra y otra en el Bosque de Las Higueras, más allá de las zarzas. Cada una te hace más fuerte. Llevas " + player.relics + " de 5.");
            case "chaval" -> sayAs(n, "¿Tú has estado en el Bosque Encantado de Las Higueras? Mi abuela decía que su manantial cura cualquier cosa.",
                    "Está río arriba, entre tu casa y el pantano.");
            case "abuelo" -> sayAs(n, "¿Sabías que dicen que dos carabelas de Colón, la Pinta y la Niña, se hicieron con pinos de esta tierra?",
                    "Y aquí mismo el cardenal Aragón convenció al bandolero Pedro de Valenzuela para que se entregara. Este pueblo siempre ha sabido plantar cara.");
        }
    }

    void use(Prop pr) {
        Player p = player;
        String id = pr.id;
        if (id.startsWith("cartel:")) { say("Cartel", id.substring(7)); return; }
        switch (id) {
            case "baul" -> {
                if (!p.hasSword) {
                    p.hasSword = true; stage = Math.max(stage, 1);
                    pr.img = Art.P.get("baul_abierto");
                    Sound.play("pickup");
                    say("Guardián", "Bajo las toallas, envuelta en un paño, mi espada.", "Has cogido la ESPADA.  [Espacio] o [J] para atacar.");
                } else say("Guardián", "Mantas, toallas y la caja vacía de la vieja escopeta del abuelo.");
            }
            case "pc" -> say("Guardián", "El ordenador. Siete años apagado.", "Encima del escritorio siguen mis viejos apuntes de primeros auxilios. Me han servido más que el ordenador.");
            case "cama" -> rest(isNight() ? "Duermes hasta el amanecer." : "Descansas un rato en tu cama.");
            case "mesa_cocina" -> {
                if (tableCool <= 0 && p.hp < p.maxHp) { tableCool = 90; p.hp = Math.min(p.maxHp, p.hp + 25); say("Guardián", "Tomates, membrillos y pimientos del huerto. Como algo. (+25 vida)"); }
                else say("Guardián", "Tomates, membrillos y pimientos del huerto. No tengo hambre ahora.");
            }
            case "estufa" -> say("Guardián", "La estufa de leña. En invierno es lo único que mantiene viva la casa.");
            case "radio" -> {
                if (stage == 3) {
                    stage = 4;
                    say("Radio", "...ksshh... ¿Hay alguien? Aquí Padre Tomás, desde la Iglesia de la Encarnación, en Pozo Alcón...",
                            "...somos once... los engendros salen cada noche de La Bolera... si alguien me oye... ksshh...");
                    dlg.add(new String[]{"Guardián", "Supervivientes. En el pueblo. Siete años creyendo que era el último..."});
                    dlg.add(new String[]{"Guardián", "Pozo Alcón está al oeste: cruzo el puente viejo y subo hasta la A-326."});
                    dlgEnd = this::save;
                } else if (stage < 3) say("Guardián", "La radio solo escupe estática. Hace semanas que nadie contesta.");
                else say("Guardián", "Estática. Ya sé dónde están: en la iglesia del pueblo.");
            }
            case "caseta" -> say("Guardián", "El gato duerme sobre el cojín, encima de la caseta. Ni los engendros le quitan el sitio.");
            case "cruz", "cruzluz" -> {
                if (stage == 5) purifyCross();
                else if (stage < 5) say("Guardián", "Una vieja cruz de piedra en el camino del pantano. Al tocarla siento algo cálido.");
                else say("Guardián", "La Cruz de San Gregorio brilla con una luz tibia.");
            }
            case "manantial" -> {
                p.hp = p.maxHp; p.fe = p.maxFe;
                if (!flags.contains("manantial")) {
                    flags.add("manantial"); p.maxHp += 20; p.hp = p.maxHp;
                    Sound.play("level");
                    say("Guardián", "El agua del manantial de Las Higueras está helada y limpia. Me llena de fuerza.", "Vida máxima +20.");
                    save();
                } else say("Guardián", "El agua fresca del manantial. Vida y Fe al máximo.");
            }
            case "fuente_plaza" -> { p.hp = Math.min(p.maxHp, p.hp + 30); say("Guardián", "La fuente de la Plaza del Ayuntamiento todavía corre. Bebo. (+30 vida)"); }
            case "hoguera" -> {
                restWorld = "exterior"; restX = WorldGen.fireX * TS + 8; restY = (WorldGen.fireY + 1) * TS + 10;
                rest("Descansas junto a la hoguera de los supervivientes.");
            }
            case "puerta_iglesia" -> say("Guardián", "La puerta de la Encarnación está atrancada. Dentro descansan los heridos.");
        }
    }

    void rest(String msg) {
        Player p = player;
        for (Monster m : world.monsters) if (!m.dead && m.dist(p) < 10 * TS && m.aggro) { toast("No puedes descansar con engendros cerca."); return; }
        p.hp = p.maxHp; p.fe = p.maxFe;
        if (world.id.equals("casa_alta")) { restWorld = "casa_alta"; restX = 4 * 16 + 8; restY = 7 * 16 + 8; }
        if (isNight()) day = 0.02;
        save();
        say("Guardián", msg, "Vida y Fe recuperadas. Partida guardada.");
    }

    void startEnding() {
        endPages = List.of(
                "Las semanas siguientes, el agua de La Bolera volvió a bajar limpia por el Guadalentín.",
                "Los once supervivientes de la Encarnación salieron de detrás de las barricadas.\nDespués llegaron otros, desde Hinojares, desde Huesa, desde Fontanar.",
                "En el cortijo del río, el ventilador sigue sin girar.\nPero el gato duerme al sol, y el perrillo ya no ladra de noche.",
                "«La calma también es una forma de lucha.\nPozo Alcón... siempre será mi lugar.»",
                "EL GUARDIÁN ERRANTE\n\nGracias por jugar.");
        endIdx = 0; introChars = 0;
        stage = 9;
        st = St.END;
    }

    // ---------------------------------------------------------------- diálogos
    public void say(String who, String... lines) {
        for (String l : lines) dlg.add(new String[]{who, l});
        if (page == null && (st == St.PLAY || st == St.DIALOG)) nextPage();
    }

    void sayAs(Npc n, String... lines) {
        for (String l : lines) dlg.add(new String[]{n.name, l, n.key});
        if (page == null) nextPage();
    }

    public void say(String line) { toast(line); }

    void nextPage() {
        if (dlg.isEmpty()) {
            page = null;
            if (st == St.DIALOG) st = St.PLAY;
            Runnable r = dlgEnd; dlgEnd = null;
            if (r != null) r.run();
            return;
        }
        page = dlg.poll();
        dlgChars = 0;
        st = St.DIALOG;
    }

    void updateDialog(double dt) {
        if (page == null) { st = St.PLAY; return; }
        dlgChars += dt * 55;
        if (confirm() || pressed(KeyEvent.VK_ESCAPE)) {
            if (dlgChars < page[1].length()) dlgChars = 9999;
            else nextPage();
        }
    }

    void toast(String s) { toast = s; toastT = 3.2; }

    // ---------------------------------------------------------------- mundos
    void enter(String id, double x, double y, int dir) {
        World w = worlds.get(id);
        if (w == null) return;
        world = w;
        player.x = x; player.y = y; player.dir = dir; player.kbT = 0;
        orbs.clear();
        if (!w.outdoor) w.monsters.clear();
        lastArea = "";
        snapCamera();
    }

    void respawn() {
        Player p = player;
        p.dead = false; p.hp = p.maxHp; p.fe = p.maxFe; p.invul = 2; p.flash = 0;
        World ow = worlds.get("exterior");
        ow.monsters.removeIf(m -> !m.quest && m.kind != Monster.Kind.BESTIA);
        if (boss != null) { boss.hp = boss.maxHp; boss.x = WorldGen.bossX * TS + 8; boss.y = (WorldGen.bossY - 1) * TS; }
        orbs.clear();
        enter(restWorld, restX, restY, 0);
        boss = null;
        ow.monsters.removeIf(m -> m.kind == Monster.Kind.BESTIA);
        if (stage == 7) { stage = 6; Sound.music("calma"); }
        st = St.PLAY;
        toast("Te levantas de nuevo. La luz no te ha abandonado.");
    }

    void updateFx(double dt) {
        for (Iterator<Fx> it = fx.iterator(); it.hasNext(); ) {
            Fx f = it.next();
            f.life -= dt;
            if (f.life <= 0) { it.remove(); continue; }
            f.x += f.vx * dt; f.y += f.vy * dt;
            if (f.text == null && !f.ring) { f.vx *= 0.92; f.vy = f.vy * 0.92 + 30 * dt; }
        }
    }

    void snapCamera() {
        camX = player.x - VW / 2.0; camY = player.y - 10 - VH / 2.0;
        clampCam();
    }

    void clampCam() {
        double mw = world.w * TS, mh = world.h * TS;
        if (mw <= VW) camX = (mw - VW) / 2; else camX = Math.max(0, Math.min(mw - VW, camX));
        if (mh <= VH) camY = (mh - VH) / 2; else camY = Math.max(0, Math.min(mh - VH, camY));
    }

    // ================================================================ GUARDAR / CARGAR
    static File saveFile() {
        File dir = new File(System.getProperty("user.home"), ".guardian_pozo");
        return new File(dir, "partida.properties");
    }

    void save() {
        try {
            Properties pr = new Properties();
            Player p = player;
            pr.setProperty("stage", "" + stage);
            pr.setProperty("flags", String.join(",", flags));
            pr.setProperty("picked", String.join(",", picked));
            pr.setProperty("hp", "" + p.hp); pr.setProperty("maxHp", "" + p.maxHp);
            pr.setProperty("fe", "" + p.fe); pr.setProperty("maxFe", "" + p.maxFe);
            pr.setProperty("lvl", "" + p.lvl); pr.setProperty("xp", "" + p.xp); pr.setProperty("atk", "" + p.atk);
            pr.setProperty("herbs", "" + p.herbs); pr.setProperty("relics", "" + p.relics);
            pr.setProperty("sword", "" + p.hasSword);
            pr.setProperty("world", world.id); pr.setProperty("x", "" + p.x); pr.setProperty("y", "" + p.y);
            pr.setProperty("restWorld", restWorld); pr.setProperty("restX", "" + restX); pr.setProperty("restY", "" + restY);
            pr.setProperty("day", "" + day); pr.setProperty("kills", "" + questKills);
            File f = saveFile();
            f.getParentFile().mkdirs();
            try (OutputStream o = new FileOutputStream(f)) { pr.store(o, "El Guardian Errante - partida"); }
            hasSave = true;
        } catch (Exception e) { toast("No se pudo guardar: " + e.getMessage()); }
    }

    boolean load() {
        try {
            Properties pr = new Properties();
            try (InputStream in = new FileInputStream(saveFile())) { pr.load(in); }
            buildWorlds();
            player = new Player();
            Player p = player;
            stage = Integer.parseInt(pr.getProperty("stage", "0"));
            flags.clear(); for (String s : pr.getProperty("flags", "").split(",")) if (!s.isBlank()) flags.add(s);
            picked.clear(); for (String s : pr.getProperty("picked", "").split(",")) if (!s.isBlank()) picked.add(s);
            p.maxHp = Integer.parseInt(pr.getProperty("maxHp", "100")); p.hp = Integer.parseInt(pr.getProperty("hp", "100"));
            p.maxFe = Integer.parseInt(pr.getProperty("maxFe", "60")); p.fe = Integer.parseInt(pr.getProperty("fe", "60"));
            p.lvl = Integer.parseInt(pr.getProperty("lvl", "1")); p.xp = Integer.parseInt(pr.getProperty("xp", "0"));
            p.atk = Integer.parseInt(pr.getProperty("atk", "12"));
            p.herbs = Integer.parseInt(pr.getProperty("herbs", "0")); p.relics = Integer.parseInt(pr.getProperty("relics", "0"));
            p.hasSword = Boolean.parseBoolean(pr.getProperty("sword", "false"));
            restWorld = pr.getProperty("restWorld", "casa_alta");
            restX = Double.parseDouble(pr.getProperty("restX", "72")); restY = Double.parseDouble(pr.getProperty("restY", "120"));
            day = Double.parseDouble(pr.getProperty("day", "0.1"));
            questKills = Integer.parseInt(pr.getProperty("kills", "0"));
            for (World w : worlds.values()) w.pickups.removeIf(k -> k.id != null && picked.contains(k.id));
            if (p.hasSword) for (Prop pp : worlds.get("casa_alta").props) if ("baul".equals(pp.id)) pp.img = Art.P.get("baul_abierto");
            if (stage >= 6) openBrambles();
            if (stage == 7) stage = 6;
            if (stage == 2) { stage = 1; questKills = 0; }
            boss = null; orbs.clear(); fx.clear(); dlg.clear(); page = null;
            enter(pr.getProperty("world", "casa_alta"), Double.parseDouble(pr.getProperty("x", "72")), Double.parseDouble(pr.getProperty("y", "120")), 0);
            if (stage == 1 && world.outdoor) stageLogic();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ================================================================ DIBUJO
    void render(Graphics2D g, int sw, int sh) {
        Graphics2D v = view.createGraphics();
        v.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_NEAREST_NEIGHBOR);
        if (st == St.TITLE || st == St.HELP) renderTitleBg(v);
        else if (st == St.INTRO || (st == St.END)) { v.setColor(new Color(8, 6, 10)); v.fillRect(0, 0, VW, VH); embers(v); }
        else renderWorld(v);
        v.dispose();

        g.setColor(Color.BLACK);
        g.fillRect(0, 0, sw, sh);
        double sc = Math.min(sw / (double) VW, sh / (double) VH);
        double isc = Math.floor(sc);
        if (isc >= 1 && sc - isc < 0.25) sc = isc;
        int dw = (int) (VW * sc), dh = (int) (VH * sc);
        int ox = (sw - dw) / 2, oy = (sh - dh) / 2;
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_NEAREST_NEIGHBOR);
        g.drawImage(view, ox, oy, dw, dh, null);

        Graphics2D u = (Graphics2D) g.create();
        u.translate(ox, oy);
        u.scale(sc, sc);
        u.setClip(0, 0, VW, VH);
        u.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        u.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        u.setRenderingHint(RenderingHints.KEY_FRACTIONALMETRICS, RenderingHints.VALUE_FRACTIONALMETRICS_ON);
        u.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_NEAREST_NEIGHBOR);
        switch (st) {
            case TITLE -> uiTitle(u);
            case HELP -> uiHelp(u);
            case INTRO -> uiStory(u, introPages.get(introIdx), introChars, introIdx == introPages.size() - 1);
            case END -> uiStory(u, endPages.get(endIdx), introChars, false);
            default -> {
                uiHud(u);
                if (st == St.DIALOG) uiDialog(u);
                if (st == St.MAP) uiMap(u);
                if (st == St.PAUSE) uiPause(u);
                if (st == St.DEAD) uiDead(u);
            }
        }
        if (toastT > 0 && st != St.TITLE) uiToast(u);
        u.dispose();
    }

    // ---------------------------------------------------------------- mundo
    void renderWorld(Graphics2D g) {
        Player p = player;
        double tx = p.x - VW / 2.0, ty = p.y - 10 - VH / 2.0;
        camX += (tx - camX) * 0.18; camY += (ty - camY) * 0.18;
        clampCam();
        int cx = (int) Math.round(camX), cy = (int) Math.round(camY);
        if (shakeT > 0) { cx += rnd.nextInt(5) - 2; cy += rnd.nextInt(5) - 2; }
        g.setColor(new Color(11, 9, 7));
        g.fillRect(0, 0, VW, VH);
        int frame = (int) (clock * 3);
        int tx0 = Math.floorDiv(cx, TS), ty0 = Math.floorDiv(cy, TS);
        for (int y = ty0; y <= ty0 + VH / TS + 1; y++) for (int x = tx0; x <= tx0 + VW / TS + 1; x++) {
            if (x < 0 || y < 0 || x >= world.w || y >= world.h) continue;
            int t = world.get(x, y);
            int sx = x * TS - cx, sy = y * TS - cy;
            g.drawImage(Art.tile(t, x, y, frame), sx, sy, null);
            edgeDetail(g, t, x, y, sx, sy);
        }
        for (Prop d : world.decor) g.drawImage(d.img, (int) d.x - cx, (int) d.y - cy, null);

        // objetos y personajes ordenados por profundidad
        List<Object[]> list = new ArrayList<>();
        for (Prop pr : world.props) {
            if (pr.hidden) continue;
            int l = pr.left() - cx, tp = pr.top() - cy;
            if (l > VW || tp > VH || l + pr.img.getWidth() < 0 || tp + pr.img.getHeight() < 0) continue;
            list.add(new Object[]{pr.y, pr});
        }
        for (Monster m : world.monsters) if (!m.dead && Math.abs(m.x - cx - VW / 2.0) < VW && Math.abs(m.y - cy - VH / 2.0) < VH) list.add(new Object[]{m.y, m});
        for (Npc n : world.npcs) list.add(new Object[]{n.y, n});
        for (Pickup k : world.pickups) if (Math.abs(k.x - cx - VW / 2.0) < VW && Math.abs(k.y - cy - VH / 2.0) < VH) list.add(new Object[]{k.y - 4, k});
        list.add(new Object[]{p.y, p});
        list.sort(Comparator.comparingDouble(o -> (Double) o[0]));
        for (Object[] o : list) {
            Object e = o[1];
            if (e instanceof Prop pr) g.drawImage(pr.img, pr.left() - cx, pr.top() - cy, null);
            else if (e instanceof Monster m) drawMonster(g, m, cx, cy);
            else if (e instanceof Npc n) {
                BufferedImage s = n.sprite(clock);
                shadow(g, n.x - cx, n.y - cy, s.getWidth() / 2.5);
                g.drawImage(s, (int) Math.round(n.x - s.getWidth() / 2.0) - cx, (int) Math.round(n.y - s.getHeight()) - cy, null);
            } else if (e instanceof Pickup k) {
                BufferedImage s = k.type == Pickup.RELIC ? Art.relic : Art.herb;
                double bob = Math.sin(k.t * 3 + k.x) * 2;
                shadow(g, k.x - cx, k.y - cy, 4);
                if (k.type == Pickup.RELIC) glow(g, k.x - cx, k.y - 8 - cy, 14, new Color(255, 220, 120, 70));
                g.drawImage(s, (int) (k.x - s.getWidth() / 2.0) - cx, (int) (k.y - s.getHeight() - 2 + bob) - cy, null);
            } else if (e instanceof Player) drawPlayer(g, cx, cy);
        }
        // proyectiles
        for (Orb o : orbs) g.drawImage(Art.orb, (int) o.x - 4 - cx, (int) o.y - 4 - cy, null);
        // partículas
        for (Fx f : fx) {
            double a = Math.max(0, Math.min(1, f.life / f.max));
            if (f.ring) {
                double r = f.radius * (1 - a * a);
                g.setColor(new Color((f.color >> 16) & 255, (f.color >> 8) & 255, f.color & 255, (int) (200 * a)));
                g.setStroke(new BasicStroke(2f));
                g.drawOval((int) (f.x - r - cx), (int) (f.y - r * 0.6 - cy), (int) (r * 2), (int) (r * 1.2));
            } else if (f.text == null) {
                g.setColor(new Color((f.color >> 16) & 255, (f.color >> 8) & 255, f.color & 255, (int) (255 * a)));
                g.fillRect((int) f.x - cx, (int) f.y - cy, f.size + (a > 0.6 ? 1 : 0), f.size + (a > 0.6 ? 1 : 0));
            }
        }
        // noche
        double dk = darkness();
        if (dk > 0.01) nightOverlay(g, dk, cx, cy);
        // brillo de la cruz purificada
        if (world.outdoor && stage >= 6) {
            int gx = WorldGen.crossX * TS + 8 - cx, gy = WorldGen.crossY * TS - 8 - cy;
            if (gx > -60 && gx < VW + 60 && gy > -60 && gy < VH + 60) glow(g, gx, gy, 26 + Math.sin(clock * 2) * 3, new Color(255, 230, 150, 60));
        }
        // destello rojo al recibir daño
        if (p.invul > 0.6) {
            g.setColor(new Color(160, 20, 10, (int) (90 * (p.invul - 0.6) / 0.3)));
            g.fillRect(0, 0, VW, VH);
        }
        // objetivo fuera de pantalla: flecha
        int[] tgt = objectiveTarget();
        if (tgt != null && world.outdoor && st == St.PLAY) {
            double ox2 = tgt[0] * TS + 8 - cx, oy2 = tgt[1] * TS + 8 - cy;
            if (ox2 < 8 || ox2 > VW - 8 || oy2 < 8 || oy2 > VH - 8) {
                double ang = Math.atan2(oy2 - VH / 2.0, ox2 - VW / 2.0);
                double ex = VW / 2.0 + Math.cos(ang) * (VW / 2.0 - 14), ey = VH / 2.0 + Math.sin(ang) * (VH / 2.0 - 14);
                ex = Math.max(10, Math.min(VW - 10, ex)); ey = Math.max(30, Math.min(VH - 10, ey));
                Polygon tri = new Polygon();
                tri.addPoint((int) (ex + Math.cos(ang) * 6), (int) (ey + Math.sin(ang) * 6));
                tri.addPoint((int) (ex + Math.cos(ang + 2.4) * 5), (int) (ey + Math.sin(ang + 2.4) * 5));
                tri.addPoint((int) (ex + Math.cos(ang - 2.4) * 5), (int) (ey + Math.sin(ang - 2.4) * 5));
                int al = 140 + (int) (Math.sin(clock * 5) * 80);
                g.setColor(new Color(255, 214, 110, al));
                g.fill(tri);
            }
        }
    }

    void edgeDetail(Graphics2D g, int t, int x, int y, int sx, int sy) {
        if (T.isWater(t)) {
            if (!T.isWater(world.get(x, y - 1)) && world.get(x, y - 1) != T.BRIDGE) { g.setColor(new Color(0x2a6a66)); g.fillRect(sx, sy, TS, 2); g.setColor(new Color(0xa8e4dc)); g.fillRect(sx, sy + 2, TS, 1); }
            if (!T.isWater(world.get(x - 1, y))) { g.setColor(new Color(0x9ad8d0)); g.fillRect(sx, sy, 1, TS); }
            if (!T.isWater(world.get(x + 1, y))) { g.setColor(new Color(0x9ad8d0)); g.fillRect(sx + TS - 1, sy, 1, TS); }
            if (!T.isWater(world.get(x, y + 1))) { g.setColor(new Color(0xb8ece4)); g.fillRect(sx, sy + TS - 1, TS, 1); }
        } else if (t == T.CLIFF || t == T.MOUNTAIN) {
            int below = world.get(x, y + 1);
            if (below != t && !T.isWater(below)) { g.setColor(new Color(0, 0, 0, 70)); g.fillRect(sx, sy + TS - 4, TS, 4); g.setColor(new Color(0, 0, 0, 40)); g.fillRect(sx, sy + TS, TS, 3); }
            int above = world.get(x, y - 1);
            if (above != t && above != T.VOID) { g.setColor(new Color(255, 255, 240, 50)); g.fillRect(sx, sy, TS, 2); }
        } else if (t == T.ROOF || t == T.ROOF_DARK || t == T.ROOF_SOLAR || t == T.CHURCH_ROOF) {
            int above = world.get(x, y - 1);
            if (!(above == T.ROOF || above == T.ROOF_DARK || above == T.ROOF_SOLAR || above == T.CHURCH_ROOF)) { g.setColor(new Color(0xe89a74)); g.fillRect(sx, sy, TS, 1); g.setColor(new Color(0x7a3220)); g.fillRect(sx, sy + 1, TS, 1); }
            int below = world.get(x, y + 1);
            if (!(below == T.ROOF || below == T.ROOF_DARK || below == T.ROOF_SOLAR || below == T.CHURCH_ROOF)) { g.setColor(new Color(0x5a2416)); g.fillRect(sx, sy + TS - 2, TS, 2); }
        } else if (!T.SOLID[t]) {
            int above = world.get(x, y - 1);
            if (above == T.WALL_WHITE || above == T.WINDOW || above == T.DOOR || above == T.CHURCH_WALL || above == T.CHURCH_DOOR || above == T.SHED || above == T.WALL_STONE || above == T.DAM
                    || above == T.IWALL || above == T.IWALL_STONE || above == T.BATHWALL || above == T.WALLTOP) {
                g.setColor(new Color(0, 0, 0, 55)); g.fillRect(sx, sy, TS, 4);
            }
        }
        if (t == T.WALL_WHITE || t == T.WINDOW) {
            int below = world.get(x, y + 1);
            if (below == T.WALL_WHITE || below == T.WINDOW || below == T.DOOR) { g.setColor(new Color(0xf2eee6)); g.fillRect(sx, sy + 12, TS, 4); g.setColor(new Color(0xe5dfd3)); g.fillRect(sx + 3, sy + 13, 1, 1); }
        }
    }

    void shadow(Graphics2D g, double x, double y, double r) {
        g.setColor(new Color(0, 0, 0, 70));
        g.fillOval((int) (x - r), (int) (y - r * 0.4), (int) (r * 2), (int) (r * 0.8) + 1);
    }

    void glow(Graphics2D g, double x, double y, double r, Color c) {
        RadialGradientPaint rg = new RadialGradientPaint(new java.awt.geom.Point2D.Double(x, y), (float) r, new float[]{0f, 1f}, new Color[]{c, new Color(c.getRed(), c.getGreen(), c.getBlue(), 0)});
        Paint old = g.getPaint();
        g.setPaint(rg);
        g.fillOval((int) (x - r), (int) (y - r), (int) (r * 2), (int) (r * 2));
        g.setPaint(old);
    }

    void drawMonster(Graphics2D g, Monster m, int cx, int cy) {
        BufferedImage s = m.sprite();
        shadow(g, m.x - cx, m.y - cy, m.kind == Monster.Kind.BESTIA ? 0 : s.getWidth() / 2.6);
        Composite old = g.getComposite();
        float alpha = 1f;
        if (m.kind == Monster.Kind.SOMBRA) alpha = 0.78f + 0.12f * (float) Math.sin(m.anim * 4);
        if (m.spawnFade > 0) alpha *= (float) Math.max(0, 1 - m.spawnFade / 0.6);
        if (alpha < 1f) g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, Math.max(0f, alpha)));
        double bob = m.kind == Monster.Kind.SOMBRA ? Math.sin(m.anim * 3) * 2 - 3 : 0;
        int sx = (int) Math.round(m.x - s.getWidth() / 2.0) - cx, sy = (int) Math.round(m.y - s.getHeight() + 2 + bob) - cy;
        if (m.kind == Monster.Kind.BESTIA) sy += 6;
        g.drawImage(s, sx, sy, null);
        g.setComposite(old);
        if (m.kind == Monster.Kind.JABALI && m.chargeT > 0) { g.setColor(new Color(255, 60, 40)); g.fillRect((int) m.x - cx - 1, sy - 6, 2, 4); }
        if (m.hp < m.maxHp && m.kind != Monster.Kind.BESTIA) {
            int w = 16, bx = (int) m.x - cx - w / 2, by = sy - 4;
            g.setColor(new Color(20, 10, 10)); g.fillRect(bx - 1, by - 1, w + 2, 4);
            g.setColor(new Color(190, 40, 30)); g.fillRect(bx, by, (int) (w * Math.max(0, m.hp) / (double) m.maxHp), 2);
        }
    }

    void drawPlayer(Graphics2D g, int cx, int cy) {
        Player p = player;
        if (p.dead && deadT > 0.5) return;
        if (p.invul > 0 && ((int) (p.invul * 20)) % 2 == 0 && !p.dead) return;
        BufferedImage s;
        boolean attacking = p.atkT > 0 && p.hasSword;
        if (attacking) s = Art.heroAtk[p.dir][0];
        else s = Art.hero[p.dir][p.moving ? 1 + ((int) (p.anim * 7) % 2) : 0];
        int sx = (int) Math.round(p.x - 8) - cx, sy = (int) Math.round(p.y - 23) - cy;
        shadow(g, p.x - cx, p.y - cy, 6);
        if (p.prayT > 0) glow(g, p.x - cx, p.y - 10 - cy, 22, new Color(255, 230, 150, (int) (110 * p.prayT)));
        // espada a la espalda cuando no ataca
        if (p.hasSword && !attacking && p.dir == 1) g.drawImage(Art.sword, sx + 9, sy + 4, null);
        if (attacking && p.dir == 1) drawSwing(g, cx, cy);
        g.drawImage(p.flash > 0 ? Px.tint(s, 0xffffff) : s, sx, sy, null);
        if (attacking && p.dir != 1) drawSwing(g, cx, cy);
        if (p.hasSword && !attacking && p.dir != 1) {
            if (p.dir == 0) g.drawImage(Art.sword, sx + 11, sy + 9, 5, 13, null);
            else if (p.dir == 3) g.drawImage(Art.sword, sx + 3, sy + 10, 5, 13, null);
            else g.drawImage(Art.sword, sx + 8, sy + 10, 5, 13, null);
        }
    }

    void drawSwing(Graphics2D g, int cx, int cy) {
        Player p = player;
        double t = 1 - p.atkT / 0.24; // 0..1
        double base = switch (p.dir) { case 0 -> Math.PI / 2; case 1 -> -Math.PI / 2; case 2 -> Math.PI; default -> 0; };
        double ang = base - 1.3 + t * 2.6;
        if (p.dir == 2 || p.dir == 0) ang = base + 1.3 - t * 2.6;
        double hx = p.x - cx + (p.dir == 2 ? -3 : p.dir == 3 ? 3 : 0), hy = p.y - 11 - cy;
        // estela
        g.setColor(new Color(255, 255, 255, 90));
        g.setStroke(new BasicStroke(3f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        double a0 = Math.toDegrees(-(base - 1.3)), ext = -Math.toDegrees(2.6 * t);
        if (p.dir == 2 || p.dir == 0) { a0 = Math.toDegrees(-(base + 1.3)); ext = Math.toDegrees(2.6 * t); }
        g.drawArc((int) (hx - 15), (int) (hy - 15), 30, 30, (int) a0, (int) ext);
        java.awt.geom.AffineTransform old = g.getTransform();
        g.translate(hx, hy);
        g.rotate(ang + Math.PI / 2);
        g.drawImage(Art.sword, -3, -18, null);
        g.setTransform(old);
    }

    void nightOverlay(Graphics2D g, double dk, int cx, int cy) {
        Graphics2D d = dark.createGraphics();
        d.setComposite(AlphaComposite.Src);
        d.setColor(new Color(8, 12, 36, (int) (255 * dk)));
        d.fillRect(0, 0, VW, VH);
        d.setComposite(AlphaComposite.DstOut);
        light(d, player.x - cx, player.y - 10 - cy, 92);
        for (Prop pr : world.props) {
            if (pr.anim == 1 || pr.img == Art.P.get("cruzluz") || pr.img == Art.P.get("farola") && rnd.nextDouble() < 0) {
                double lx = pr.x - cx, ly = pr.y - 6 - cy;
                if (lx > -90 && lx < VW + 90 && ly > -90 && ly < VH + 90) light(d, lx, ly, pr.anim == 1 ? 72 + Math.sin(clock * 9) * 3 : 55);
            }
        }
        for (Pickup k : world.pickups) if (k.type == Pickup.RELIC) light(d, k.x - cx, k.y - 8 - cy, 20);
        d.dispose();
        g.drawImage(dark, 0, 0, null);
        for (Prop pr : world.props) if (pr.anim == 1) {
            double lx = pr.x - cx, ly = pr.y - 6 - cy;
            if (lx > -90 && lx < VW + 90 && ly > -90 && ly < VH + 90) glow(g, lx, ly, 46, new Color(255, 140, 40, (int) (60 * dk)));
        }
    }

    void light(Graphics2D d, double x, double y, double r) {
        RadialGradientPaint rg = new RadialGradientPaint(new java.awt.geom.Point2D.Double(x, y), (float) r,
                new float[]{0f, 0.35f, 0.7f, 1f}, new Color[]{new Color(0, 0, 0, 255), new Color(0, 0, 0, 215), new Color(0, 0, 0, 90), new Color(0, 0, 0, 0)});
        d.setPaint(rg);
        d.fillOval((int) (x - r), (int) (y - r), (int) (r * 2), (int) (r * 2));
    }

    void renderTitleBg(Graphics2D g) {
        World ow = worlds.get("exterior");
        World saved = world; Player sp = player;
        world = ow;
        Player fake = new Player();
        fake.x = (WorldGen.rx + 2) * TS + Math.sin(titleT * 0.07) * 70;
        fake.y = 106 * TS;
        player = fake;
        double sd = day; day = 0.3;
        camX = fake.x - VW / 2.0; camY = fake.y - VH / 2.0 - 10; clampCam();
        double sc = clock; clock = titleT;
        renderWorldNoPlayer(g);
        clock = sc; day = sd;
        world = saved; player = sp;
        GradientPaint gp = new GradientPaint(0, 0, new Color(10, 8, 6, 210), 0, VH, new Color(10, 8, 6, 120));
        g.setPaint(gp);
        g.fillRect(0, 0, VW, VH);
        embers(g);
    }

    void renderWorldNoPlayer(Graphics2D g) {
        int cx = (int) camX, cy = (int) camY;
        int frame = (int) (clock * 3);
        for (int y = cy / TS; y <= cy / TS + VH / TS + 1; y++) for (int x = cx / TS; x <= cx / TS + VW / TS + 1; x++) {
            int t = world.get(x, y);
            g.drawImage(Art.tile(t, x, y, frame), x * TS - cx, y * TS - cy, null);
            edgeDetail(g, t, x, y, x * TS - cx, y * TS - cy);
        }
        List<Prop> ps = new ArrayList<>();
        for (Prop pr : world.props) if (!pr.hidden && pr.x > cx - 60 && pr.x < cx + VW + 60 && pr.y > cy - 20 && pr.y < cy + VH + 80) ps.add(pr);
        ps.sort(Comparator.comparingDouble(o -> o.y));
        for (Prop pr : ps) g.drawImage(pr.img, pr.left() - cx, pr.top() - cy, null);
        for (Npc n : world.npcs) { BufferedImage s = n.sprite(clock); g.drawImage(s, (int) (n.x - s.getWidth() / 2.0) - cx, (int) (n.y - s.getHeight()) - cy, null); }
    }

    void embers(Graphics2D g) {
        Random r = new Random(4);
        for (int i = 0; i < 40; i++) {
            double sp = 6 + r.nextDouble() * 14;
            double x = (r.nextDouble() * VW + Math.sin(titleT * 0.7 + i) * 8) % VW;
            double y = VH - ((titleT * sp + r.nextDouble() * VH) % (VH + 20));
            int a = (int) (120 + 100 * Math.sin(titleT * 2 + i));
            g.setColor(new Color(255, 150 + r.nextInt(80), 60, Math.max(0, Math.min(255, a))));
            g.fillRect((int) x, (int) y, 1, 1);
        }
    }

    BufferedImage buildMapImage(World ow) {
        BufferedImage m = new BufferedImage(ow.w, ow.h, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < ow.h; y++) for (int x = 0; x < ow.w; x++) m.setRGB(x, y, Art.tileColor[ow.get(x, y)]);
        for (Prop p : ow.props) {
            int x = (int) (p.x / TS), y = (int) (p.y / TS);
            if (x >= 0 && y >= 0 && x < ow.w && y < ow.h && p.img.getHeight() > 18 && !p.hidden) m.setRGB(x, y, Px.shade(Art.tileColor[ow.get(x, y)], 0.62));
        }
        return m;
    }

    // ================================================================ INTERFAZ
    Font fb(float s) { return new Font(bodyFont, Font.PLAIN, 1).deriveFont(s); }
    Font fbb(float s) { return new Font(bodyFont, Font.BOLD, 1).deriveFont(s); }
    Font ft(float s) { return new Font(titleFont, Font.BOLD, 1).deriveFont(s); }

    static final Color GOLD = new Color(0xe8c46a), PAPER = new Color(0xf2e6cc), INK = new Color(0x1a1410), PANEL = new Color(18, 14, 12, 215);

    void panel(Graphics2D g, double x, double y, double w, double h) {
        g.setColor(PANEL);
        g.fill(new java.awt.geom.RoundRectangle2D.Double(x, y, w, h, 4, 4));
        g.setStroke(new BasicStroke(0.8f));
        g.setColor(new Color(0x8a6a3a));
        g.draw(new java.awt.geom.RoundRectangle2D.Double(x + 0.5, y + 0.5, w - 1, h - 1, 4, 4));
        g.setColor(new Color(255, 230, 180, 30));
        g.draw(new java.awt.geom.RoundRectangle2D.Double(x + 1.5, y + 1.5, w - 3, h - 3, 3, 3));
    }

    void text(Graphics2D g, String s, double x, double y, Color c) {
        g.setColor(new Color(0, 0, 0, 160));
        g.drawString(s, (float) x + 0.5f, (float) y + 0.6f);
        g.setColor(c);
        g.drawString(s, (float) x, (float) y);
    }

    void center(Graphics2D g, String s, double y, Color c) {
        double w = g.getFontMetrics().getStringBounds(s, g).getWidth();
        text(g, s, VW / 2.0 - w / 2, y, c);
    }

    List<String> wrap(Graphics2D g, String s, double width) {
        List<String> out = new ArrayList<>();
        for (String para : s.split("\n")) {
            StringBuilder line = new StringBuilder();
            for (String word : para.split(" ")) {
                String tryS = line.length() == 0 ? word : line + " " + word;
                if (g.getFontMetrics().getStringBounds(tryS, g).getWidth() > width && line.length() > 0) { out.add(line.toString()); line = new StringBuilder(word); }
                else line = new StringBuilder(tryS);
            }
            out.add(line.toString());
        }
        return out;
    }

    void bar(Graphics2D g, double x, double y, double w, double h, double frac, Color c, Color back) {
        g.setColor(new Color(10, 6, 4, 220));
        g.fill(new java.awt.geom.Rectangle2D.Double(x - 0.8, y - 0.8, w + 1.6, h + 1.6));
        g.setColor(back);
        g.fill(new java.awt.geom.Rectangle2D.Double(x, y, w, h));
        g.setColor(c);
        g.fill(new java.awt.geom.Rectangle2D.Double(x, y, w * Math.max(0, Math.min(1, frac)), h));
        g.setColor(new Color(255, 255, 255, 60));
        g.fill(new java.awt.geom.Rectangle2D.Double(x, y, w * Math.max(0, Math.min(1, frac)), h * 0.35));
    }

    void uiHud(Graphics2D g) {
        Player p = player;
        panel(g, 4, 4, 116, 40);
        g.setFont(fbb(6.4f));
        text(g, "Guardián  ·  Nv. " + p.lvl, 9, 12.5, GOLD);
        bar(g, 9, 16, 76, 5.2, p.hp / (double) p.maxHp, new Color(0xc8402e), new Color(0x3a1410));
        bar(g, 9, 24, 76, 3.6, p.fe / (double) p.maxFe, new Color(0xe8c050), new Color(0x3a2c10));
        bar(g, 9, 30.5, 76, 1.6, p.xp / (double) p.xpNext(), new Color(0x8ac0e8), new Color(0x1a2430));
        g.setFont(fb(4.6f));
        text(g, p.hp + "/" + p.maxHp, 88, 20.6, PAPER);
        text(g, "Fe " + p.fe, 88, 27.6, PAPER);
        g.drawImage(Art.herb, 9, 34, 7, 7, null);
        g.setFont(fbb(5f));
        text(g, "×" + p.herbs, 17, 40.3, PAPER);
        g.drawImage(Art.relic, 34, 34, 6, 7, null);
        text(g, p.relics + "/5", 41, 40.3, PAPER);
        if (world.outdoor) {
            int h = (int) hour(), mi = (int) ((hour() - h) * 60) / 10 * 10;
            String clockS = String.format("%02d:%02d", h, mi);
            Color cc = isNight() ? new Color(0xa8b8ff) : new Color(0xffe08a);
            g.setColor(cc);
            g.fill(new java.awt.geom.Ellipse2D.Double(76, 35.4, 4, 4));
            if (isNight()) { g.setColor(PANEL); g.fill(new java.awt.geom.Ellipse2D.Double(77.4, 34.8, 4, 4)); }
            text(g, clockS, 83, 40.3, cc);
        }

        // objetivo
        g.setFont(fb(5.4f));
        List<String> ob = wrap(g, objective(), 132);
        double oh = 11 + ob.size() * 7;
        panel(g, VW - 144, 4, 140, oh);
        g.setFont(fbb(4.8f));
        text(g, "OBJETIVO", VW - 139, 11, GOLD);
        g.setFont(fb(5.4f));
        for (int i = 0; i < ob.size(); i++) text(g, ob.get(i), VW - 139, 18 + i * 7, PAPER);

        // jefe
        if (boss != null && !boss.dead) {
            g.setFont(ft(7f));
            center(g, boss.name(), VH - 18, new Color(0xffb0a0));
            bar(g, VW / 2.0 - 90, VH - 14, 180, 5, boss.hp / (double) boss.maxHp, new Color(0x2aa8a0), new Color(0x0a2422));
        }
        // nombre de zona
        if (bannerT > 0 && !banner.isEmpty()) {
            double a = Math.min(1, Math.min(bannerT, 2.6 - bannerT) * 2.5);
            g.setFont(ft(10f));
            Composite c = g.getComposite();
            g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, (float) Math.max(0, Math.min(1, a))));
            center(g, banner, 62, PAPER);
            double w = g.getFontMetrics().getStringBounds(banner, g).getWidth();
            g.setColor(GOLD);
            g.fill(new java.awt.geom.Rectangle2D.Double(VW / 2.0 - w / 2, 65, w, 0.7));
            g.setComposite(c);
        }
        // ayuda al principio
        if (clock < 70 && st == St.PLAY) {
            g.setFont(fb(4.8f));
            String help = player.hasSword ? "WASD/flechas: moverse · Espacio: espada · E: hablar/usar · K: orar · Q: hierbas · M: mapa · Esc: menú"
                    : "WASD/flechas: moverse · E: hablar/usar · M: mapa · Esc: menú";
            panel(g, 4, VH - 13, VW - 8, 10);
            center(g, help, VH - 6, new Color(0xd8ccb0));
        }
    }

    void uiToast(Graphics2D g) {
        g.setFont(fbb(6f));
        double w = g.getFontMetrics().getStringBounds(toast, g).getWidth() + 14;
        double y = st == St.DIALOG ? 120 : 160;
        Composite c = g.getComposite();
        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, (float) Math.min(1, toastT * 2)));
        panel(g, VW / 2.0 - w / 2, y, w, 13);
        center(g, toast, y + 9, PAPER);
        g.setComposite(c);
    }

    void uiDialog(Graphics2D g) {
        if (page == null) return;
        double x = 8, y = VH - 62, w = VW - 16, h = 56;
        panel(g, x, y, w, h);
        String who = page[0];
        BufferedImage portrait = null;
        if (page.length > 2 && Art.people.containsKey(page[2])) portrait = Art.people.get(page[2])[0][0];
        else if (who.equals("Guardián")) portrait = Art.hero[0][0];
        double tx = x + 8;
        if (portrait != null) {
            g.setColor(new Color(60, 44, 30, 200));
            g.fill(new java.awt.geom.Rectangle2D.Double(x + 6, y + 6, 36, 44));
            g.drawImage(portrait, (int) (x + 8), (int) (y + 4), 32, 48, null);
            tx = x + 48;
        }
        g.setFont(ft(7.2f));
        text(g, who, tx, y + 12, GOLD);
        g.setFont(fb(6.3f));
        String s = page[1];
        String shown = s.substring(0, (int) Math.min(s.length(), dlgChars));
        List<String> lines = wrap(g, s, w - (tx - x) - 10);
        int used = 0;
        for (int i = 0; i < lines.size(); i++) {
            String l = lines.get(i);
            int take = Math.max(0, Math.min(l.length(), shown.length() - used));
            text(g, l.substring(0, take), tx, y + 22 + i * 8.2, PAPER);
            used += l.length() + 1;
        }
        if (dlgChars >= s.length() && ((int) (clock * 3)) % 2 == 0) {
            Polygon tri = new Polygon(new int[]{(int) (x + w - 13), (int) (x + w - 7), (int) (x + w - 10)}, new int[]{(int) (y + h - 9), (int) (y + h - 9), (int) (y + h - 5)}, 3);
            g.setColor(GOLD);
            g.fill(tri);
        }
    }

    void uiMap(Graphics2D g) {
        g.setColor(new Color(0, 0, 0, 200));
        g.fillRect(0, 0, VW, VH);
        double mw = mapImg.getWidth(), mh = mapImg.getHeight();
        double s = Math.min((VW - 30) / mw, (VH - 26) / mh);
        double ox = (VW - mw * s) / 2, oy = 16;
        g.setFont(ft(8f));
        center(g, "Pozo Alcón y el barranco del Guadalentín", 11, GOLD);
        g.setColor(new Color(0x8a6a3a));
        g.fill(new java.awt.geom.Rectangle2D.Double(ox - 2, oy - 2, mw * s + 4, mh * s + 4));
        g.drawImage(mapImg, (int) ox, (int) oy, (int) (mw * s), (int) (mh * s), null);
        g.setFont(fbb(4.6f));
        String[][] labels = {{"Pozo Alcón", "38", "112"}, {"Cortijo", "" + (WorldGen.rx + 6), "103"}, {"Embalse de La Bolera", "160", "14"}, {"Presa", "160", "36"},
                {"Cruz de S. Gregorio", "" + WorldGen.crossX, "80"}, {"Las Higueras", "158", "56"}, {"Sierra del Pozo", "30", "50"}, {"Los Llanos", "196", "120"}, {"Cárcavas", "180", "160"}, {"A-326", "92", "92"}};
        for (String[] l : labels) {
            double lx = ox + Integer.parseInt(l[1]) * s, ly = oy + Integer.parseInt(l[2]) * s;
            double w = g.getFontMetrics().getStringBounds(l[0], g).getWidth();
            text(g, l[0], lx - w / 2, ly, PAPER);
        }
        if (world.outdoor) {
            double px = ox + player.x / TS * s, py = oy + player.y / TS * s;
            if (((int) (titleT * 4)) % 2 == 0) { g.setColor(new Color(0xff4030)); g.fill(new java.awt.geom.Ellipse2D.Double(px - 2.5, py - 2.5, 5, 5)); }
            g.setColor(Color.WHITE); g.draw(new java.awt.geom.Ellipse2D.Double(px - 2.5, py - 2.5, 5, 5));
        } else {
            double px = ox + (WorldGen.doorX + 0.5) * s, py = oy + WorldGen.doorY * s;
            g.setColor(new Color(0xff4030)); g.fill(new java.awt.geom.Ellipse2D.Double(px - 2.5, py - 2.5, 5, 5));
        }
        int[] t = objectiveTarget();
        if (t != null) {
            double px = ox + t[0] * s, py = oy + t[1] * s;
            star(g, px, py, 4.5);
        }
        g.setFont(fb(5f));
        g.setColor(new Color(0xff4030)); g.fill(new java.awt.geom.Ellipse2D.Double(ox, VH - 7, 4, 4));
        text(g, "tú", ox + 6, VH - 3, new Color(0xd8ccb0));
        star(g, ox + 24, VH - 5, 3);
        text(g, "objetivo   ·   M para cerrar", ox + 30, VH - 3, new Color(0xd8ccb0));
    }

    void star(Graphics2D g, double x, double y, double r) {
        java.awt.geom.Path2D.Double p = new java.awt.geom.Path2D.Double();
        for (int i = 0; i < 10; i++) {
            double a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 == 0 ? r : r * 0.45;
            if (i == 0) p.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else p.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
        }
        p.closePath();
        g.setColor(GOLD);
        g.fill(p);
        g.setColor(INK);
        g.setStroke(new BasicStroke(0.5f));
        g.draw(p);
    }

    void uiPause(Graphics2D g) {
        g.setColor(new Color(0, 0, 0, 150));
        g.fillRect(0, 0, VW, VH);
        panel(g, VW / 2.0 - 70, 40, 140, 120);
        g.setFont(ft(11f));
        center(g, "Pausa", 58, GOLD);
        String[] m = pauseMenu();
        g.setFont(fbb(7f));
        for (int i = 0; i < m.length; i++) center(g, (i == menuIdx ? "› " : "") + m[i] + (i == menuIdx ? " ‹" : ""), 76 + i * 13, i == menuIdx ? PAPER : new Color(0x9a8a70));
        g.setFont(fb(5.2f));
        center(g, "Reliquias " + player.relics + "/5  ·  Ataque " + player.atk + "  ·  Nivel " + player.lvl, 150, new Color(0xd8ccb0));
    }

    void uiDead(Graphics2D g) {
        double a = Math.min(1, deadT / 1.2);
        g.setColor(new Color(20, 0, 0, (int) (190 * a)));
        g.fillRect(0, 0, VW, VH);
        g.setFont(ft(16f));
        center(g, "Has caído", 95, new Color(220, 80, 60, (int) (255 * a)));
        if (deadT > 1.2) {
            g.setFont(fb(7f));
            center(g, "Pulsa Enter para levantarte en tu último descanso", 120, PAPER);
        }
    }

    void uiTitle(Graphics2D g) {
        g.setFont(ft(26f));
        center(g, "El Guardián Errante", 70, PAPER);
        g.setFont(ft(9f));
        center(g, "Crónicas de Pozo Alcón", 86, GOLD);
        g.setColor(GOLD);
        g.fill(new java.awt.geom.Rectangle2D.Double(VW / 2.0 - 60, 92, 120, 0.7));
        g.drawImage(Art.hero[0][(int) (titleT * 2) % 3 == 2 ? 0 : 0], VW / 2 - 16, 96, 32, 48, null);
        String[] m = menu();
        g.setFont(fbb(8f));
        for (int i = 0; i < m.length; i++) {
            boolean sel = i == menuIdx;
            center(g, (sel ? "› " : "") + m[i] + (sel ? " ‹" : ""), 158 + i * 13, sel ? PAPER : new Color(0x9a8a70));
        }
        g.setFont(fb(5f));
        center(g, "Flechas/WASD para elegir · Enter para aceptar · F11 pantalla completa", VH - 6, new Color(0x8a7a60));
    }

    void uiHelp(Graphics2D g) {
        panel(g, 40, 16, VW - 80, VH - 32);
        g.setFont(ft(11f));
        center(g, "Controles", 34, GOLD);
        String[][] rows = {
                {"WASD / Flechas", "Moverse"}, {"Espacio / J", "Golpe de espada"}, {"E / Enter", "Hablar, usar, abrir, pasar texto"},
                {"K / 1", "Orar: recupera vida (25 de Fe)"}, {"L / 2", "Luz: onda sagrada (nivel 3, 40 de Fe)"}, {"Q / 3", "Comer hierbas medicinales (+30 vida)"},
                {"M / Tab", "Mapa de la comarca"}, {"Esc / P", "Pausa y guardar"}, {"N", "Activar o quitar la música"}, {"F11", "Pantalla completa"}};
        g.setFont(fb(6.5f));
        for (int i = 0; i < rows.length; i++) {
            text(g, rows[i][0], 64, 52 + i * 13, GOLD);
            text(g, rows[i][1], 150, 52 + i * 13, PAPER);
        }
        g.setFont(fb(5f));
        center(g, "Descansa en tu cama o junto a la hoguera de la iglesia para guardar. Enter para volver.", VH - 22, new Color(0xa89a80));
    }

    void uiStory(Graphics2D g, String s, double chars, boolean last) {
        g.setFont(ft(9.5f));
        String shown = s.substring(0, (int) Math.min(s.length(), chars));
        List<String> lines = wrap(g, s, VW - 60);
        double y0 = VH / 2.0 - lines.size() * 7;
        int used = 0;
        for (int i = 0; i < lines.size(); i++) {
            String l = lines.get(i);
            int take = Math.max(0, Math.min(l.length(), shown.length() - used));
            String part = l.substring(0, take);
            double w = g.getFontMetrics().getStringBounds(l, g).getWidth();
            text(g, part, VW / 2.0 - w / 2, y0 + i * 14, PAPER);
            used += l.length() + 1;
        }
        if (chars >= s.length()) {
            g.setFont(fb(5.5f));
            center(g, "Enter para continuar" + (st == St.INTRO ? " · Esc para saltar" : ""), VH - 12, new Color(0x9a8a70));
        }
    }

    // ================================================================ TECLADO
    @Override public void keyPressed(KeyEvent e) {
        int c = e.getKeyCode();
        if (c >= 0 && c < keys.length) {
            if (!keys[c]) queue.add(c);
            keys[c] = true;
        }
    }
    @Override public void keyReleased(KeyEvent e) { int c = e.getKeyCode(); if (c >= 0 && c < keys.length) keys[c] = false; }
    @Override public void keyTyped(KeyEvent e) { }
}
