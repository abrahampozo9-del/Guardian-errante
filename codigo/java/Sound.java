package guardian;

import javax.sound.sampled.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/** Sonido sintetizado: guitarra punteada (cadencia andaluza) y efectos. Sin archivos externos. */
public final class Sound {
    static final int RATE = 22050;
    static volatile boolean ok = false;
    public static boolean musicOn = true;
    static final Map<String, Clip[]> sfx = new HashMap<>();
    static final Map<String, Integer> rr = new HashMap<>();
    static Clip calm, battle, current;
    static String wanted = "calma";

    public static void init() {
        Thread t = new Thread(() -> {
            try {
                put("swing", swing(), 3);
                put("hit", hit(), 3);
                put("hurt", hurt(), 2);
                put("heal", arp(new double[]{523, 659, 784, 1046}, 0.07, 0.35), 1);
                put("light", chord(new double[]{523, 659, 784, 1046, 1318}, 0.9), 1);
                put("pickup", arp(new double[]{880, 1318}, 0.06, 0.25), 2);
                put("level", arp(new double[]{392, 523, 659, 784, 1046}, 0.09, 0.5), 1);
                put("roar", roar(), 1);
                put("orb", blip(), 3);
                put("purify", chord(new double[]{392, 587, 784, 1175}, 2.2), 1);
                put("talk", arp(new double[]{660}, 0.03, 0.05), 2);
                put("die", arp(new double[]{330, 262, 196, 131}, 0.18, 0.8), 1);
                put("door", hit(), 1);
                calm = clip(guitarLoop(false));
                battle = clip(guitarLoop(true));
                ok = true;
                music(wanted);
            } catch (Throwable e) {
                ok = false;
            }
        }, "sonido");
        t.setDaemon(true);
        t.start();
    }

    static void put(String k, short[] d, int n) throws Exception {
        Clip[] c = new Clip[n];
        for (int i = 0; i < n; i++) c[i] = clip(d);
        sfx.put(k, c);
    }

    static Clip clip(short[] d) throws Exception {
        AudioFormat f = new AudioFormat(RATE, 16, 1, true, false);
        byte[] b = new byte[d.length * 2];
        for (int i = 0; i < d.length; i++) { b[i * 2] = (byte) d[i]; b[i * 2 + 1] = (byte) (d[i] >> 8); }
        Clip c = AudioSystem.getClip();
        c.open(f, b, 0, b.length);
        return c;
    }

    public static void play(String k) {
        if (!ok) return;
        Clip[] arr = sfx.get(k);
        if (arr == null) return;
        int i = rr.getOrDefault(k, 0);
        rr.put(k, (i + 1) % arr.length);
        Clip c = arr[i];
        try { c.stop(); c.setFramePosition(0); c.start(); } catch (Exception ignored) { }
    }

    public static void music(String which) {
        wanted = which;
        if (!ok) return;
        Clip next = "batalla".equals(which) ? battle : calm;
        if (!musicOn) next = null;
        if (next == current) return;
        try {
            if (current != null) current.stop();
            current = next;
            if (current != null) { current.setFramePosition(0); current.loop(Clip.LOOP_CONTINUOUSLY); }
        } catch (Exception ignored) { }
    }

    public static void toggleMusic() {
        musicOn = !musicOn;
        if (!musicOn && current != null) { current.stop(); current = null; }
        music(wanted);
    }

    // ------------------------------------------------------------ síntesis
    static short[] toShort(double[] s, double vol) {
        short[] o = new short[s.length];
        for (int i = 0; i < s.length; i++) o[i] = (short) Math.max(-32767, Math.min(32767, s[i] * vol * 32767));
        return o;
    }

    /** Cuerda punteada (Karplus-Strong). */
    static void pluck(double[] out, int start, double freq, double amp, double decay, Random r) {
        int n = (int) (RATE / freq);
        double[] buf = new double[n];
        for (int i = 0; i < n; i++) buf[i] = (r.nextDouble() * 2 - 1) * amp;
        int idx = 0;
        int len = Math.min(out.length - start, (int) (RATE * 2.5));
        for (int i = 0; i < len; i++) {
            int j = (idx + 1) % n;
            double v = buf[idx];
            out[start + i] += v;
            buf[idx] = decay * 0.5 * (buf[idx] + buf[j]);
            idx = j;
        }
    }

    static double note(String n) {
        String[] names = {"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"};
        String p = n.substring(0, n.length() - 1);
        int oct = n.charAt(n.length() - 1) - '0';
        int k = 0;
        for (int i = 0; i < 12; i++) if (names[i].equals(p)) k = i;
        int midi = 12 * (oct + 1) + k;
        return 440 * Math.pow(2, (midi - 69) / 12.0);
    }

    static short[] guitarLoop(boolean battleMode) {
        Random r = new Random(5);
        double step = battleMode ? 0.16 : 0.3;
        // Cadencia andaluza: Lam - Sol - Fa - Mi
        String[][] chords = battleMode
                ? new String[][]{{"E2", "B2", "E3", "G3", "B3", "E4"}, {"F2", "C3", "F3", "A3", "C4", "F4"}, {"E2", "B2", "E3", "G#3", "B3", "E4"}, {"D2", "A2", "D3", "F3", "A3", "D4"}}
                : new String[][]{{"A2", "E3", "A3", "C4", "E4", "A4"}, {"G2", "D3", "G3", "B3", "D4", "G4"}, {"F2", "C3", "F3", "A3", "C4", "F4"}, {"E2", "B2", "E3", "G#3", "B3", "E4"}};
        int[] pattern = {0, 2, 3, 4, 5, 4, 3, 2};
        String[] melody = battleMode ? new String[]{} :
                new String[]{"E5", "", "D5", "C5", "B4", "", "C5", "", "D5", "", "C5", "B4", "A4", "", "", "", "C5", "", "B4", "A4", "G#4", "", "A4", "B4", "B4", "", "", "", "G#4", "", "", ""};
        int passes = 2;
        int steps = chords.length * 8 * passes;
        double[] out = new double[(int) (RATE * step * steps) + RATE];
        int s = 0;
        for (int pass = 0; pass < passes; pass++)
            for (int c = 0; c < chords.length; c++)
                for (int k = 0; k < 8; k++, s++) {
                    int pos = (int) (s * step * RATE);
                    String[] ch = chords[c];
                    if (k == 0) pluck(out, pos, note(ch[0]), 0.55, 0.996, r);
                    if (battleMode && k % 2 == 0) {
                        // tambor grave
                        for (int i = 0; i < RATE * 0.12 && pos + i < out.length; i++) {
                            double t = i / (double) RATE;
                            out[pos + i] += Math.sin(2 * Math.PI * (70 - t * 200) * t) * Math.exp(-t * 30) * (k == 0 ? 0.6 : 0.35);
                        }
                    }
                    pluck(out, pos, note(ch[pattern[k]]), 0.3, 0.994, r);
                    if (pass == 1 && melody.length > 0) {
                        String m = melody[(c * 8 + k) % melody.length];
                        if (!m.isEmpty()) pluck(out, pos, note(m), 0.32, 0.997, r);
                    }
                }
        // recorta al bucle exacto con fundido corto en los extremos
        int len = (int) (RATE * step * steps);
        double[] loop = new double[len];
        System.arraycopy(out, 0, loop, 0, len);
        for (int i = 0; i < out.length - len && i < len; i++) loop[i] += out[len + i];
        double max = 0;
        for (double v : loop) max = Math.max(max, Math.abs(v));
        double vol = 0.33 / Math.max(0.01, max);
        return toShort(loop, vol);
    }

    static short[] swing() {
        int n = (int) (RATE * 0.16);
        double[] o = new double[n];
        Random r = new Random(1);
        double lp = 0;
        for (int i = 0; i < n; i++) {
            double t = i / (double) n;
            double a = 0.15 + 0.85 * t;
            lp += (r.nextDouble() * 2 - 1 - lp) * a;
            o[i] = lp * Math.sin(Math.PI * t) * 0.8;
        }
        return toShort(o, 0.6);
    }

    static short[] hit() {
        int n = (int) (RATE * 0.14);
        double[] o = new double[n];
        Random r = new Random(2);
        for (int i = 0; i < n; i++) {
            double t = i / (double) RATE;
            o[i] = (Math.sin(2 * Math.PI * (160 - t * 600) * t) * 0.8 + (r.nextDouble() * 2 - 1) * 0.4) * Math.exp(-t * 28);
        }
        return toShort(o, 0.7);
    }

    static short[] hurt() {
        int n = (int) (RATE * 0.25);
        double[] o = new double[n];
        for (int i = 0; i < n; i++) {
            double t = i / (double) RATE;
            double f = 300 - t * 700;
            o[i] = Math.signum(Math.sin(2 * Math.PI * f * t)) * Math.exp(-t * 10) * 0.5;
        }
        return toShort(o, 0.4);
    }

    static short[] roar() {
        int n = (int) (RATE * 1.0);
        double[] o = new double[n];
        Random r = new Random(3);
        double lp = 0;
        for (int i = 0; i < n; i++) {
            double t = i / (double) RATE;
            lp += (r.nextDouble() * 2 - 1 - lp) * 0.08;
            o[i] = (lp * 3 + Math.sin(2 * Math.PI * (60 + 20 * Math.sin(t * 30)) * t) * 0.5) * Math.sin(Math.PI * t);
        }
        return toShort(o, 0.6);
    }

    static short[] blip() {
        int n = (int) (RATE * 0.12);
        double[] o = new double[n];
        for (int i = 0; i < n; i++) {
            double t = i / (double) RATE;
            o[i] = Math.sin(2 * Math.PI * (500 - t * 2000) * t) * Math.exp(-t * 20);
        }
        return toShort(o, 0.35);
    }

    static short[] arp(double[] fs, double step, double tail) {
        int n = (int) (RATE * (fs.length * step + tail));
        double[] o = new double[n];
        for (int k = 0; k < fs.length; k++) {
            int st = (int) (k * step * RATE);
            for (int i = 0; st + i < n; i++) {
                double t = i / (double) RATE;
                o[st + i] += (Math.sin(2 * Math.PI * fs[k] * t) + 0.3 * Math.sin(4 * Math.PI * fs[k] * t)) * Math.exp(-t * 7) * 0.4;
            }
        }
        return toShort(o, 0.5);
    }

    static short[] chord(double[] fs, double dur) {
        int n = (int) (RATE * dur);
        double[] o = new double[n];
        for (double f : fs) for (int i = 0; i < n; i++) {
            double t = i / (double) RATE;
            o[i] += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 2.5) * 0.25 * Math.min(1, t * 40);
        }
        return toShort(o, 0.45);
    }
}
