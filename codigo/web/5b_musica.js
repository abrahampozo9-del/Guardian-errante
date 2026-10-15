// ====================================================================== música de terror (sintetizada al vuelo, la primera vez que suena)
// pesadilla: exploración de día · noche: caja de música rota y viento · iglesia: órgano con la cadencia andaluza
// jefe: tambores, tritonos y coro · infierno: zumbido grave y voces al revés (para la Bajada)
(function () {
  const note = n => { const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; const p = n.slice(0, -1), o = +n.slice(-1); return 440 * Math.pow(2, (12 * (o + 1) + names.indexOf(p) - 69) / 12); };
  const TAU = Math.PI * 2;
  function finish(o, RATE, wet) {
    // reverberación: peines con realimentación + paso bajo
    const out = new Float32Array(o.length);
    const taps = [[Math.floor(RATE * 0.0371), 0.7], [Math.floor(RATE * 0.0411), 0.68], [Math.floor(RATE * 0.0437), 0.66], [Math.floor(RATE * 0.0293), 0.64]];
    for (const [d, fb] of taps) { const bufd = new Float32Array(d); let i2 = 0, lp = 0; for (let i = 0; i < o.length * 1.0; i++) { const y = bufd[i2]; lp += (y - lp) * 0.45; bufd[i2] = o[i] + lp * fb; i2 = (i2 + 1) % d; out[i] += y * 0.25; } }
    for (let i = 0; i < o.length; i++) out[i] = o[i] * (1 - wet) + out[i] * wet;
    // bucle sin chasquido: funde el final con el principio
    const f = Math.floor(RATE * 0.5), n = out.length;
    for (let i = 0; i < f; i++) { const k = i / f; out[i] = out[i] * k + out[n - f + i] * (1 - k); }
    const res = out.subarray(0, n - f);
    let m = 0; for (const v of res) m = Math.max(m, Math.abs(v));
    const g = 0.36 / Math.max(0.001, m); for (let i = 0; i < res.length; i++) res[i] *= g;
    return res;
  }
  function noiseLP(o, RATE, amp, cutoff, swell, seed) {
    const R = RNG(seed); let lp = 0, lp2 = 0;
    for (let i = 0; i < o.length; i++) { const t = i / RATE; lp += ((R.next() * 2 - 1) - lp) * cutoff; lp2 += (lp - lp2) * cutoff; o[i] += lp2 * amp * (0.5 + 0.5 * Math.sin(TAU * t / swell)); }
  }
  function bell(o, RATE, start, f, amp, dec) {
    const n = Math.min(o.length - start, Math.floor(RATE * 5));
    for (let i = 0; i < n; i++) { const t = i / RATE, e = Math.exp(-t * dec) * amp; o[start + i] += e * (Math.sin(TAU * f * t) + 0.5 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-t * 2) + 0.3 * Math.sin(TAU * f * 5.4 * t) * Math.exp(-t * 4)); }
  }
  function thump(o, RATE, start, amp) {
    const n = Math.min(o.length - start, Math.floor(RATE * 0.35));
    for (let i = 0; i < n; i++) { const t = i / RATE; o[start + i] += Math.sin(TAU * (60 - t * 70) * t) * Math.exp(-t * 14) * amp; }
  }
  function pad(o, RATE, start, dur, freqs, amp, attack) {
    const n = Math.min(o.length - start, Math.floor(RATE * dur));
    for (let i = 0; i < n; i++) {
      const t = i / RATE, env = Math.min(1, t / attack) * Math.min(1, (dur - t) / attack) * amp;
      let v = 0; for (const f of freqs) { const vib = 1 + 0.004 * Math.sin(TAU * 5 * t); v += Math.sin(TAU * f * vib * t) + 0.35 * Math.sin(TAU * f * 2 * t) + 0.15 * Math.sin(TAU * f * 3 * t); }
      o[start + i] += v * env / freqs.length;
    }
  }

  Sound._gens.pesadilla = function (RATE) {
    const L = 40, o = new Float32Array(Math.floor(RATE * L));
    // zumbido grave que late (La y Si bemol, una segunda menor que roza)
    for (let i = 0; i < o.length; i++) { const t = i / RATE, sw = 0.6 + 0.4 * Math.sin(TAU * t / 10); let v = 0; for (let h = 1; h <= 5; h++) v += (Math.sin(TAU * 55 * h * t) + 0.6 * Math.sin(TAU * 58.27 * h * t)) / (h * h); o[i] += v * 0.12 * sw; }
    noiseLP(o, RATE, 0.5, 0.02, 13, 7);
    const bells = ['A4', 'A#4', 'E5', 'D#5', 'A3', 'C5'];
    for (let k = 0; k < 8; k++) bell(o, RATE, Math.floor(RATE * (2 + k * 4.7)), note(bells[k % bells.length]), 0.18, 0.9);
    for (let s = 20; s < 36; s += 1.5) { thump(o, RATE, Math.floor(RATE * s), 0.35); thump(o, RATE, Math.floor(RATE * (s + 0.28)), 0.25); }
    pad(o, RATE, Math.floor(RATE * 8), 12, [note('E3'), note('F3'), note('A#3')], 0.06, 3);
    return finish(o, RATE, 0.45);
  };
  Sound._gens.noche = function (RATE) {
    const L = 34, o = new Float32Array(Math.floor(RATE * L));
    noiseLP(o, RATE, 0.7, 0.03, 9, 11);
    const mel = ['E5', 'A4', 'C5', 'B4', 'E5', 'G#4', 'A4', '', 'F5', 'E5', 'D#5', 'E5', 'C5', 'B4', 'A4', '', 'E5', 'A4', 'C5', 'B4', 'D5', 'C5', 'B4', 'G#4', 'A4', '', '', ''];
    mel.forEach((m, k) => {
      if (!m) return; const st = Math.floor(RATE * (1 + k * 1.1)), f = note(m) * (k % 7 === 3 ? 0.985 : 1);
      const n = Math.min(o.length - st, Math.floor(RATE * 2.2));
      for (let i = 0; i < n; i++) { const t = i / RATE, e = Math.exp(-t * 2.6) * 0.22, wob = 1 + 0.006 * Math.sin(TAU * 3 * t); o[st + i] += e * (Math.sin(TAU * f * wob * t) + 0.4 * Math.sin(TAU * f * 3 * t) * Math.exp(-t * 6)); }
    });
    for (let i = 0; i < o.length; i++) { const t = i / RATE; o[i] += Math.sin(TAU * 41.2 * t) * 0.05 * (0.5 + 0.5 * Math.sin(TAU * t / 7)); }
    return finish(o, RATE, 0.5);
  };
  Sound._gens.iglesia = function (RATE) {
    const L = 34, o = new Float32Array(Math.floor(RATE * L));
    const ch = [['A2', 'E3', 'A3', 'C4', 'E4'], ['G2', 'D3', 'G3', 'B3', 'D4'], ['F2', 'C3', 'F3', 'A3', 'C4'], ['E2', 'B2', 'E3', 'G#3', 'B3'], ['A2', 'E3', 'A3', 'C4', 'E4'], ['D2', 'A2', 'D3', 'F3', 'A3'], ['E2', 'B2', 'E3', 'G#3', 'B3'], ['E2', 'B2', 'E3', 'G#3', 'D4']];
    ch.forEach((c, k) => pad(o, RATE, Math.floor(RATE * (k * 4.1)), 4.6, c.map(note), 0.32, 0.6));
    return finish(o, RATE, 0.55);
  };
  Sound._gens.jefe = function (RATE) {
    const bpm = 132, beat = 60 / bpm, bars = 8, L = bars * 4 * beat + 0.5, o = new Float32Array(Math.floor(RATE * L));
    const R = RNG(5);
    for (let b = 0; b < bars * 8; b++) {
      const st = Math.floor(RATE * b * beat / 2);
      if ([0, 3, 4, 6].includes(b % 8)) { const n = Math.floor(RATE * 0.25); for (let i = 0; i < n && st + i < o.length; i++) { const t = i / RATE; o[st + i] += (Math.sin(TAU * (110 - t * 160) * t) * 0.7 + (R.next() * 2 - 1) * 0.25) * Math.exp(-t * 12) * 0.8; } }
      // bajo ostinato en La con el tritono
      const bf = note(b % 8 === 7 ? 'D#2' : 'A1'), n2 = Math.floor(RATE * beat / 2);
      for (let i = 0; i < n2 && st + i < o.length; i++) { const t = i / RATE; let v = 0; for (let h = 1; h < 6; h++) v += Math.sin(TAU * bf * h * t) / h; o[st + i] += v * 0.18 * Math.exp(-t * 3); }
    }
    for (let bar = 0; bar < bars; bar++) {
      const st = Math.floor(RATE * bar * 4 * beat), chord = bar % 2 ? ['A3', 'C4', 'D#4'] : ['A3', 'C4', 'E4'];
      const n = Math.floor(RATE * beat * 1.5);
      for (let i = 0; i < n && st + i < o.length; i++) { const t = i / RATE; let v = 0; for (const c of chord) { const f = note(c); for (let h = 1; h < 7; h++) v += Math.sin(TAU * f * h * t) / (h * 1.3); } o[st + i] += v * 0.06 * Math.exp(-t * 2.5); }
      pad(o, RATE, st, beat * 4, [note(bar % 2 ? 'D#5' : 'E5'), note('A4')], 0.1, 0.4);
    }
    return finish(o, RATE, 0.3);
  };
  Sound._gens.infierno = function (RATE) {
    const L = 36, o = new Float32Array(Math.floor(RATE * L));
    for (let i = 0; i < o.length; i++) { const t = i / RATE; o[i] += (Math.sin(TAU * 36.7 * t) + 0.5 * Math.sin(TAU * 38.9 * t) + 0.3 * Math.sin(TAU * 73.4 * t)) * 0.18; }
    noiseLP(o, RATE, 0.9, 0.015, 5, 23);
    // "voces" al revés: coros que crecen y se cortan de golpe
    for (let k = 0; k < 6; k++) { const st = Math.floor(RATE * (3 + k * 5.5)), dur = 3.5, n = Math.floor(RATE * dur), fs = [note('C4'), note('F#4'), note('C5')].map(f => f * (1 - k * 0.01));
      for (let i = 0; i < n && st + i < o.length; i++) { const t = i / RATE, e = Math.pow(t / dur, 2.5) * 0.12; let v = 0; for (const f of fs) v += Math.sin(TAU * f * (1 + 0.01 * Math.sin(TAU * 6 * t)) * t); o[st + i] += v * e; } }
    for (let s = 1; s < 34; s += 3) thump(o, RATE, Math.floor(RATE * s), 0.4);
    return finish(o, RATE, 0.5);
  };
})();
