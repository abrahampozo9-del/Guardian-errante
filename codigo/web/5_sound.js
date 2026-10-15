// ====================================================================== sonido sintetizado (Web Audio)
const Sound = (function () {
  const RATE = 22050;
  let ctx = null, ready = false, musicGain = null, sfxGain = null, current = null, currentName = null;
  const buf = {};
  const S = { musicOn: true, wanted: 'noche', _gens: {} };
  try { S.musicOn = localStorage.getItem('guardian_musica') !== 'no'; } catch (e) { }

  function pluck(out, start, freq, amp, decay, R) {
    const n = Math.floor(RATE / freq), b = new Float32Array(n);
    for (let i = 0; i < n; i++) b[i] = (R.next() * 2 - 1) * amp;
    let idx = 0;
    const len = Math.min(out.length - start, Math.floor(RATE * 2.5));
    for (let i = 0; i < len; i++) {
      const j = (idx + 1) % n, v = b[idx];
      out[start + i] += v;
      b[idx] = decay * 0.5 * (b[idx] + b[j]);
      idx = j;
    }
  }
  function note(n) {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const p = n.slice(0, -1), oct = +n.slice(-1);
    return 440 * Math.pow(2, (12 * (oct + 1) + names.indexOf(p) - 69) / 12);
  }
  function guitarLoop(battle) {
    const R = RNG(5), step = battle ? 0.16 : 0.3;
    const chords = battle
      ? [['E2', 'B2', 'E3', 'G3', 'B3', 'E4'], ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'], ['D2', 'A2', 'D3', 'F3', 'A3', 'D4']]
      : [['A2', 'E3', 'A3', 'C4', 'E4', 'A4'], ['G2', 'D3', 'G3', 'B3', 'D4', 'G4'], ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4']];
    const pattern = [0, 2, 3, 4, 5, 4, 3, 2];
    const melody = battle ? [] : ['E5', '', 'D5', 'C5', 'B4', '', 'C5', '', 'D5', '', 'C5', 'B4', 'A4', '', '', '', 'C5', '', 'B4', 'A4', 'G#4', '', 'A4', 'B4', 'B4', '', '', '', 'G#4', '', '', ''];
    const passes = 2, steps = chords.length * 8 * passes;
    const out = new Float32Array(Math.floor(RATE * step * steps) + RATE);
    let s = 0;
    for (let pass = 0; pass < passes; pass++) for (let c = 0; c < chords.length; c++) for (let k = 0; k < 8; k++, s++) {
      const pos = Math.floor(s * step * RATE), ch = chords[c];
      if (k === 0) pluck(out, pos, note(ch[0]), 0.55, 0.996, R);
      if (battle && k % 2 === 0) for (let i = 0; i < RATE * 0.12 && pos + i < out.length; i++) { const t = i / RATE; out[pos + i] += Math.sin(2 * Math.PI * (70 - t * 200) * t) * Math.exp(-t * 30) * (k === 0 ? 0.6 : 0.35); }
      pluck(out, pos, note(ch[pattern[k]]), 0.3, 0.994, R);
      if (pass === 1 && melody.length) { const m = melody[(c * 8 + k) % melody.length]; if (m) pluck(out, pos, note(m), 0.32, 0.997, R); }
    }
    const len = Math.floor(RATE * step * steps), loop = new Float32Array(len);
    loop.set(out.subarray(0, len));
    for (let i = 0; i < out.length - len && i < len; i++) loop[i] += out[len + i];
    let max = 0; for (const v of loop) max = Math.max(max, Math.abs(v));
    const k = 0.33 / Math.max(0.01, max);
    for (let i = 0; i < len; i++) loop[i] *= k;
    return loop;
  }
  function gen(dur, fn) { const n = Math.floor(RATE * dur), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = fn(i / RATE, i, n); return o; }
  function arp(fs, step, tail) {
    const n = Math.floor(RATE * (fs.length * step + tail)), o = new Float32Array(n);
    fs.forEach((f, k) => { const st = Math.floor(k * step * RATE); for (let i = 0; st + i < n; i++) { const t = i / RATE; o[st + i] += (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)) * Math.exp(-t * 7) * 0.2; } });
    return o;
  }
  function chord(fs, dur) {
    const n = Math.floor(RATE * dur), o = new Float32Array(n);
    for (const f of fs) for (let i = 0; i < n; i++) { const t = i / RATE; o[i] += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 2.5) * 0.11 * Math.min(1, t * 40); }
    return o;
  }
  function make() {
    const R = RNG(1);
    let lp = 0;
    const raw = {
      swing: gen(0.16, (t, i, n) => { const u = i / n, a = 0.15 + 0.85 * u; lp += (R.next() * 2 - 1 - lp) * a; return lp * Math.sin(Math.PI * u) * 0.45; }),
      hit: gen(0.14, t => (Math.sin(2 * Math.PI * (160 - t * 600) * t) * 0.8 + (R.next() * 2 - 1) * 0.4) * Math.exp(-t * 28) * 0.6),
      hurt: gen(0.25, t => Math.sign(Math.sin(2 * Math.PI * (300 - t * 700) * t)) * Math.exp(-t * 10) * 0.2),
      heal: arp([523, 659, 784, 1046], 0.07, 0.35),
      light: chord([523, 659, 784, 1046, 1318], 0.9),
      pickup: arp([880, 1318], 0.06, 0.25),
      level: arp([392, 523, 659, 784, 1046], 0.09, 0.5),
      roar: (() => { let l = 0; return gen(1.0, t => { l += (R.next() * 2 - 1 - l) * 0.08; return (l * 3 + Math.sin(2 * Math.PI * (60 + 20 * Math.sin(t * 30)) * t) * 0.5) * Math.sin(Math.PI * t) * 0.5; }); })(),
      orb: gen(0.12, t => Math.sin(2 * Math.PI * (500 - t * 2000) * t) * Math.exp(-t * 20) * 0.3),
      purify: chord([392, 587, 784, 1175], 2.2),
      talk: arp([660], 0.03, 0.05),
      die: arp([330, 262, 196, 131], 0.18, 0.8),
      thunder: (() => { let l = 0, l2 = 0; return gen(3.2, t => { l += (R.next() * 2 - 1 - l) * 0.05; l2 += (l - l2) * 0.3; const env = t < 0.05 ? t / 0.05 : Math.exp(-(t - 0.05) * 1.3) * (0.7 + 0.3 * Math.sin(t * 9)); return l2 * 9 * env; }); })(),
      door: gen(0.14, t => (Math.sin(2 * Math.PI * (120 - t * 300) * t)) * Math.exp(-t * 30) * 0.5),
    };
    for (const k in raw) buf[k] = toBuffer(raw[k]);
    { let a = 0, b2 = 0; const r = gen(4, () => { a += (R.next() * 2 - 1 - a) * 0.5; b2 += (a - b2) * 0.35; return b2 * 0.5 + (R.next() < 0.002 ? (R.next() - 0.5) * 0.6 : 0); }); const n = r.length, f = 2000; for (let i = 0; i < f; i++) { const k = i / f; r[i] = r[i] * k + r[n - f + i] * (1 - k); } buf.rain = toBuffer(r.subarray(0, n - f)); }
    buf.calma = toBuffer(guitarLoop(false));
    buf.batalla = toBuffer(guitarLoop(true));
  }
  function toBuffer(f) { const b = ctx.createBuffer(1, f.length, RATE); b.copyToChannel(f, 0); return b; }

  S.unlock = function () {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      musicGain = ctx.createGain(); musicGain.gain.value = 0.55; musicGain.connect(ctx.destination);
      sfxGain = ctx.createGain(); sfxGain.gain.value = 0.9; sfxGain.connect(ctx.destination);
      // desbloqueo en iOS: sonido vacío dentro del gesto
      const b = ctx.createBuffer(1, 1, RATE), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0);
      setTimeout(() => {
        try { make(); ready = true; S.music(S.wanted); } catch (e) { }
        // el resto de músicas se preparan poco a poco, para que no haya parones al cambiar de zona
        const names = Object.keys(S._gens); let i = 0;
        const next = () => { if (i >= names.length) return; const n = names[i++]; if (!buf[n]) { try { buf[n] = toBuffer(S._gens[n](RATE)); } catch (e) { } } setTimeout(next, 1500); };
        setTimeout(next, 1000);
      }, 0);
    } catch (e) { ctx = null; }
  };
  S.play = function (k) {
    if (!ready || !buf[k]) return;
    const s = ctx.createBufferSource(); s.buffer = buf[k]; s.connect(sfxGain); s.start();
  };
  S.music = function (name) {
    S.wanted = name;
    if (!ready) return;
    const next = S.musicOn ? name : null;
    if (next === currentName) return;
    if (next && !buf[next] && S._gens[next]) { try { buf[next] = toBuffer(S._gens[next](RATE)); } catch (e) { return; } }
    if (next && !buf[next]) return;
    if (current) { try { current.stop(); } catch (e) { } current = null; }
    currentName = next;
    if (next) { current = ctx.createBufferSource(); current.buffer = buf[next]; current.loop = true; current.connect(musicGain); current.start(); }
  };
  S.toggle = function () {
    S.musicOn = !S.musicOn;
    try { localStorage.setItem('guardian_musica', S.musicOn ? 'si' : 'no'); } catch (e) { }
    S.music(S.wanted);
  };
  let rainSrc = null, rainGain = null;
  S.rain = function (v) {
    if (!ready) return;
    if (!rainSrc && v > 0.02) { rainGain = ctx.createGain(); rainGain.gain.value = 0; rainGain.connect(sfxGain); rainSrc = ctx.createBufferSource(); rainSrc.buffer = buf.rain; rainSrc.loop = true; rainSrc.connect(rainGain); rainSrc.start(); }
    if (rainSrc) { rainGain.gain.value = Math.min(1, v) * 0.55; if (v <= 0.02) { try { rainSrc.stop(); } catch (e) { } rainSrc = null; } }
  };
  S.suspend = function () { if (ctx && ctx.state === 'running') ctx.suspend(); };
  S.resume = function () { if (ctx && ctx.state === 'suspended') ctx.resume(); };
  return S;
})();
