// EMBERVOW - procedural SFX and music.
// Palette: ember percussion, bowed ash, cracked brass, and glassy ward chimes.

let ctx: AudioContext | null = null;
let graph: {
  master: GainNode;
  sfx: GainNode;
  music: GainNode;
  convolver: ConvolverNode;
} | null = null;

type Bus = 'sfx' | 'music';

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  const ac = ctx;
  if (!ac) return null;
  if (ac.state === 'suspended') ac.resume().catch(() => {});
  ensureGraph(ac);
  return ac;
}

function impulse(ac: AudioContext, seconds = 2.2, decay = 3.6): AudioBuffer {
  const length = Math.floor(ac.sampleRate * seconds);
  const buffer = ac.createBuffer(2, length, ac.sampleRate);
  for (let ch = 0; ch < 2; ch += 1) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i += 1) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
    }
  }
  return buffer;
}

function ensureGraph(ac: AudioContext) {
  if (graph) return;

  const master = ac.createGain();
  master.gain.value = 0.82;

  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -17;
  comp.knee.value = 16;
  comp.ratio.value = 3.5;
  comp.attack.value = 0.005;
  comp.release.value = 0.2;
  master.connect(comp).connect(ac.destination);

  const sfx = ac.createGain();
  sfx.gain.value = 0.92;
  sfx.connect(master);

  const music = ac.createGain();
  music.gain.value = 0.42;
  music.connect(master);

  const convolver = ac.createConvolver();
  convolver.buffer = impulse(ac);
  const wet = ac.createGain();
  wet.gain.value = 0.13;
  convolver.connect(wet).connect(master);

  graph = { master, sfx, music, convolver };
}

function connect(node: AudioNode, bus: Bus = 'sfx', wet = 0) {
  const ac = getCtx();
  if (!ac || !graph) return;
  node.connect(graph[bus]);
  if (wet > 0) {
    const send = ac.createGain();
    send.gain.value = wet;
    node.connect(send).connect(graph.convolver);
  }
}

function env(gain: GainNode, when: number, peak: number, attack: number, hold: number, release = 0.0001) {
  const safePeak = Math.max(0.0002, peak);
  gain.gain.cancelScheduledValues(when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(safePeak, when + Math.max(0.003, attack));
  gain.gain.exponentialRampToValueAtTime(release, when + Math.max(attack + 0.02, hold));
}

function tone(opts: {
  freq: number;
  duration: number;
  gain: number;
  type?: OscillatorType;
  sweepTo?: number;
  when?: number;
  attack?: number;
  pan?: number;
  bus?: Bus;
  wet?: number;
}) {
  const ac = getCtx();
  if (!ac) return;
  const when = opts.when ?? ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(Math.max(20, opts.freq), when);
  if (opts.sweepTo) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.sweepTo), when + opts.duration);
  }
  env(gain, when, opts.gain, opts.attack ?? 0.006, opts.duration);
  let node: AudioNode = gain;
  if ('StereoPannerNode' in window) {
    const pan = ac.createStereoPanner();
    pan.pan.value = opts.pan ?? 0;
    gain.connect(pan);
    node = pan;
  }
  osc.connect(gain);
  connect(node, opts.bus ?? 'sfx', opts.wet ?? 0);
  osc.start(when);
  osc.stop(when + opts.duration + 0.06);
}

function noise(opts: {
  duration: number;
  gain: number;
  filterStart: number;
  filterEnd: number;
  type?: BiquadFilterType;
  q?: number;
  when?: number;
  pan?: number;
  bus?: Bus;
  wet?: number;
}) {
  const ac = getCtx();
  if (!ac) return;
  const when = opts.when ?? ac.currentTime;
  const length = Math.max(1, Math.ceil(ac.sampleRate * opts.duration));
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    const t = i / length;
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.7);
  }

  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = opts.type ?? 'lowpass';
  filter.Q.value = opts.q ?? 0.9;
  filter.frequency.setValueAtTime(opts.filterStart, when);
  filter.frequency.exponentialRampToValueAtTime(Math.max(45, opts.filterEnd), when + opts.duration);
  const gain = ac.createGain();
  env(gain, when, opts.gain, 0.002, opts.duration);
  let node: AudioNode = gain;
  if ('StereoPannerNode' in window) {
    const pan = ac.createStereoPanner();
    pan.pan.value = opts.pan ?? 0;
    gain.connect(pan);
    node = pan;
  }
  src.connect(filter).connect(gain);
  connect(node, opts.bus ?? 'sfx', opts.wet ?? 0);
  src.start(when);
  src.stop(when + opts.duration + 0.06);
}

function chord(freqs: number[], duration: number, gain: number, delay = 0, wet = 0.12, bus: Bus = 'sfx') {
  const ac = getCtx();
  if (!ac) return;
  freqs.forEach((freq, i) => tone({
    freq,
    duration,
    gain: gain / Math.sqrt(freqs.length),
    type: i % 2 ? 'triangle' : 'sine',
    when: ac.currentTime + delay + i * 0.014,
    pan: (i - (freqs.length - 1) / 2) * 0.16,
    wet,
    bus,
  }));
}

function emberKick(delay = 0, heavy = false, bus: Bus = 'sfx') {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + delay;
  tone({ freq: heavy ? 76 : 94, sweepTo: heavy ? 36 : 48, duration: heavy ? 0.26 : 0.17, gain: heavy ? 0.26 : 0.18, type: 'sine', when: t, bus });
  noise({ duration: heavy ? 0.16 : 0.09, gain: heavy ? 0.16 : 0.1, filterStart: 720, filterEnd: 90, when: t, bus, wet: 0.03 });
}

function blade(delay = 0, sharp = true) {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + delay;
  noise({ duration: sharp ? 0.07 : 0.11, gain: sharp ? 0.17 : 0.11, filterStart: 8200, filterEnd: 1900, type: 'highpass', q: 0.45, when: t, pan: -0.12, wet: 0.05 });
  tone({ freq: sharp ? 1240 : 760, sweepTo: sharp ? 520 : 330, duration: sharp ? 0.08 : 0.12, gain: sharp ? 0.055 : 0.04, type: 'sawtooth', when: t + 0.006, pan: -0.08, wet: 0.04 });
}

function bell(root: number, delay = 0, gain = 0.08, bus: Bus = 'sfx') {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + delay;
  tone({ freq: root, duration: 0.5, gain, type: 'sine', when: t, wet: 0.22, bus });
  tone({ freq: root * 2.02, duration: 0.32, gain: gain * 0.42, type: 'triangle', when: t + 0.01, wet: 0.2, bus });
  tone({ freq: root * 2.77, duration: 0.2, gain: gain * 0.26, type: 'sine', when: t + 0.02, wet: 0.18, bus });
}

function synth(opts: {
  freq: number;
  duration: number;
  gain: number;
  type?: OscillatorType;
  detune?: number;
  filterStart: number;
  filterEnd?: number;
  q?: number;
  when: number;
  attack?: number;
  pan?: number;
  wet?: number;
}) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();
  osc.type = opts.type ?? 'sawtooth';
  osc.frequency.setValueAtTime(opts.freq, opts.when);
  osc.detune.value = opts.detune ?? 0;
  filter.type = 'lowpass';
  filter.Q.value = opts.q ?? 1.2;
  filter.frequency.setValueAtTime(opts.filterStart, opts.when);
  filter.frequency.exponentialRampToValueAtTime(opts.filterEnd ?? opts.filterStart, opts.when + opts.duration);
  env(gain, opts.when, opts.gain, opts.attack ?? 0.02, opts.duration);
  let node: AudioNode = gain;
  if ('StereoPannerNode' in window) {
    const pan = ac.createStereoPanner();
    pan.pan.value = opts.pan ?? 0;
    gain.connect(pan);
    node = pan;
  }
  osc.connect(filter).connect(gain);
  connect(node, 'music', opts.wet ?? 0.16);
  osc.start(opts.when);
  osc.stop(opts.when + opts.duration + 0.08);
}

export const sfx = {
  attackHit: () => {
    blade(0, true);
    emberKick(0.035, false);
    tone({ freq: 176, sweepTo: 120, duration: 0.11, gain: 0.045, type: 'triangle', when: (getCtx()?.currentTime ?? 0) + 0.04, wet: 0.05 });
  },

  damage: () => {
    emberKick(0, true);
    noise({ duration: 0.13, gain: 0.17, filterStart: 2400, filterEnd: 220, type: 'bandpass', q: 1.6, wet: 0.07 });
    tone({ freq: 52, sweepTo: 31, duration: 0.22, gain: 0.09, type: 'sine', when: (getCtx()?.currentTime ?? 0) + 0.04 });
  },

  wardGain: () => {
    bell(523.25, 0, 0.075);
    bell(783.99, 0.085, 0.055);
    noise({ duration: 0.18, gain: 0.035, filterStart: 7000, filterEnd: 2700, type: 'highpass', wet: 0.18 });
  },

  heal: () => {
    chord([329.63, 493.88, 659.25, 987.77], 0.52, 0.14, 0, 0.24);
    bell(1318.51, 0.14, 0.045);
  },

  statusApply: () => {
    tone({ freq: 311.13, sweepTo: 233.08, duration: 0.22, gain: 0.07, type: 'triangle', wet: 0.12 });
    noise({ duration: 0.12, gain: 0.055, filterStart: 4100, filterEnd: 840, type: 'bandpass', q: 2.2, wet: 0.1 });
  },

  cardHover: (() => {
    let last = 0;
    return () => {
      const now = performance.now();
      if (now - last < 45) return;
      last = now;
      tone({ freq: 1046.5, sweepTo: 1396.91, duration: 0.035, gain: 0.018, type: 'triangle', wet: 0.03 });
    };
  })(),

  cardSelect: () => {
    tone({ freq: 587.33, duration: 0.07, gain: 0.052, type: 'triangle', wet: 0.08 });
    bell(1174.66, 0.035, 0.034);
  },

  cardPlay: (kind?: string) => {
    if (kind === 'attack') {
      blade(0, false);
      tone({ freq: 220, sweepTo: 146.83, duration: 0.15, gain: 0.07, type: 'triangle', wet: 0.06 });
      return;
    }
    if (kind === 'power') {
      emberKick(0, false);
      chord([130.81, 196, 261.63, 392], 0.72, 0.2, 0.02, 0.24);
      bell(880, 0.16, 0.052);
      return;
    }
    noise({ duration: 0.09, gain: 0.07, filterStart: 4800, filterEnd: 1100, wet: 0.08 });
    chord([392, 587.33, 739.99], 0.26, 0.095, 0.03, 0.16);
  },

  endTurn: () => {
    emberKick(0, false);
    tone({ freq: 196, sweepTo: 130.81, duration: 0.18, gain: 0.085, type: 'triangle', when: (getCtx()?.currentTime ?? 0) + 0.07, wet: 0.08 });
    bell(261.63, 0.18, 0.04);
  },

  enemyMove: () => {
    tone({ freq: 98, sweepTo: 61.74, duration: 0.14, gain: 0.105, type: 'sawtooth', wet: 0.04 });
    noise({ duration: 0.09, gain: 0.07, filterStart: 1200, filterEnd: 140, wet: 0.04 });
  },

  potionUse: () => {
    noise({ duration: 0.1, gain: 0.052, filterStart: 7600, filterEnd: 2600, type: 'highpass', wet: 0.16 });
    bell(987.77, 0, 0.055);
    bell(1479.98, 0.09, 0.047);
    chord([392, 493.88, 659.25], 0.32, 0.08, 0.04, 0.18);
  },

  victory: () => {
    chord([261.63, 329.63, 392, 523.25], 0.58, 0.2, 0, 0.24);
    chord([329.63, 392, 493.88, 659.25], 0.75, 0.18, 0.22, 0.24);
    bell(1046.5, 0.42, 0.085);
    bell(1567.98, 0.55, 0.055);
  },

  defeat: () => {
    tone({ freq: 174.61, sweepTo: 82.41, duration: 0.72, gain: 0.15, type: 'triangle', wet: 0.2 });
    tone({ freq: 130.81, sweepTo: 61.74, duration: 0.9, gain: 0.12, type: 'sine', when: (getCtx()?.currentTime ?? 0) + 0.22, wet: 0.22 });
    noise({ duration: 0.7, gain: 0.07, filterStart: 780, filterEnd: 70, wet: 0.14 });
  },

  nodeEnter: () => {
    bell(440, 0, 0.055);
    tone({ freq: 220, sweepTo: 293.66, duration: 0.2, gain: 0.05, type: 'triangle', wet: 0.1 });
  },

  heartbeat: () => {
    tone({ freq: 56, sweepTo: 40, duration: 0.12, gain: 0.14, type: 'sine' });
    tone({ freq: 47, sweepTo: 33, duration: 0.16, gain: 0.105, type: 'sine', when: (getCtx()?.currentTime ?? 0) + 0.13 });
  },
};

export type SfxKey = keyof typeof sfx;

type AmbienceHandle = { stop: () => void };
let ambience: AmbienceHandle | null = null;
export type MusicMood = 'menu' | 'map' | 'combat' | 'sanctuary' | 'event' | 'reward' | 'victory' | 'defeat';
let currentMood: MusicMood = 'menu';
let musicStep = 0;

const EPIC_ROOTS = [55, 65.41, 49, 73.42];
const EPIC_CHORDS = [
  [110, 164.81, 220, 261.63, 329.63],
  [130.81, 196, 261.63, 329.63, 392],
  [98, 146.83, 196, 246.94, 293.66],
  [146.83, 220, 293.66, 369.99, 440],
];
const EPIC_LEAD = [
  2, 3, 4, 3, 2.5, 3, 4, 6,
  3, 4, 6, 4, 3, 2.5, 2, 1.5,
];
const EPIC_RUN = [2, 2.5, 3, 4, 6, 4, 3, 2.5];
const DUNGEON_CHANT = [1, 1.5, 2, 2.5, 3, 2.5, 2, 1.5];

function scheduleMenuStep(step: number, t: number) {
  const bar = Math.floor(step / 32);
  const root = [55, 49, 65.41, 41.2][bar % 4];
  const pulse = step % 32;
  if (pulse === 0) {
    [root * 2, root * 2.5, root * 3, root * 4.5].forEach((freq, i) => {
      synth({ freq, duration: 9.4, gain: 0.018, type: 'triangle', filterStart: 320, filterEnd: 760, when: t + i * 0.09, attack: 1.2, pan: (i - 1.5) * 0.28, wet: 0.62 });
    });
    tone({ freq: root * 0.25, duration: 10, gain: 0.05, type: 'sine', when: t, bus: 'music', wet: 0.42, attack: 1.4 });
  }
  if (pulse === 10 || pulse === 24) bell(root * 6, t - (getCtx()?.currentTime ?? t), 0.018, 'music');
  if (pulse === 16) noise({ duration: 1.2, gain: 0.018, filterStart: 1100, filterEnd: 90, type: 'bandpass', when: t, bus: 'music', wet: 0.36 });
}

function scheduleMapStep(step: number, t: number) {
  const bar = Math.floor(step / 16);
  const root = [49, 55, 65.41, 73.42][bar % 4];
  const pulse = step % 16;
  if (pulse === 0) {
    [root * 2, root * 2.5, root * 3, root * 4].forEach((freq, i) => {
      synth({ freq, duration: 5.8, gain: 0.022, type: 'sawtooth', detune: i % 2 ? -8 : 8, filterStart: 520, filterEnd: 1250, when: t + i * 0.03, attack: 0.42, pan: (i - 1.5) * 0.2, wet: 0.42 });
    });
    tone({ freq: root * 0.5, duration: 5.8, gain: 0.045, type: 'sine', when: t, bus: 'music', wet: 0.3, attack: 0.5 });
  }
  if (pulse === 0 || pulse === 6 || pulse === 10) {
    synth({ freq: root * (pulse === 10 ? 1.5 : 1), duration: 0.22, gain: 0.062, type: 'square', filterStart: 440, filterEnd: 110, when: t, wet: 0.08 });
    noise({ duration: 0.11, gain: 0.045, filterStart: 720, filterEnd: 85, when: t, bus: 'music', wet: 0.08 });
  }
  if (pulse === 4 || pulse === 12) {
    const chant = root * DUNGEON_CHANT[(bar + pulse) % DUNGEON_CHANT.length];
    synth({ freq: chant, duration: 0.72, gain: 0.035, type: 'triangle', filterStart: 680, filterEnd: 1500, when: t, attack: 0.08, pan: pulse === 4 ? -0.18 : 0.18, wet: 0.42 });
  }
  if (pulse === 2 || pulse === 8 || pulse === 14) {
    noise({ duration: 0.045, gain: 0.025, filterStart: 8200, filterEnd: 3400, type: 'highpass', when: t, bus: 'music', wet: 0.08 });
  }
  if (pulse === 15) noise({ duration: 0.36, gain: 0.032, filterStart: 2200, filterEnd: 5200, type: 'highpass', when: t, bus: 'music', wet: 0.24 });
}

function scheduleSanctuaryStep(step: number, t: number) {
  const bar = Math.floor(step / 24);
  const root = [65.41, 82.41, 73.42, 98][bar % 4];
  const pulse = step % 24;
  if (pulse === 0) {
    [root * 2, root * 2.5, root * 3, root * 4, root * 5].forEach((freq, i) => {
      synth({ freq, duration: 7.6, gain: 0.016, type: 'sine', filterStart: 1200, filterEnd: 2400, when: t + i * 0.08, attack: 0.9, pan: (i - 2) * 0.22, wet: 0.58 });
    });
  }
  if (pulse === 2 || pulse === 8 || pulse === 16) bell(root * 8, t - (getCtx()?.currentTime ?? t), 0.034, 'music');
  if (pulse === 12) chord([root * 2, root * 2.5, root * 3, root * 4], 1.8, 0.06, t - (getCtx()?.currentTime ?? t), 0.42, 'music');
  if (pulse === 20) noise({ duration: 0.34, gain: 0.018, filterStart: 7800, filterEnd: 3200, type: 'highpass', when: t, bus: 'music', wet: 0.34 });
}

function scheduleEventStep(step: number, t: number) {
  const bar = Math.floor(step / 12);
  const root = [46.25, 55, 51.91, 61.74][bar % 4];
  const pulse = step % 12;
  if (pulse === 0) {
    synth({ freq: root, duration: 4.6, gain: 0.052, type: 'sawtooth', filterStart: 260, filterEnd: 760, when: t, attack: 0.34, wet: 0.48 });
    synth({ freq: root * 2.37, duration: 3.8, gain: 0.033, type: 'square', filterStart: 560, filterEnd: 1550, when: t + 0.08, attack: 0.24, pan: -0.22, wet: 0.54 });
  }
  if (pulse === 1 || pulse === 5 || pulse === 9) noise({ duration: 0.13, gain: 0.042, filterStart: 5200, filterEnd: 520, type: 'bandpass', q: 2.8, when: t, bus: 'music', wet: 0.32 });
  if (pulse === 6) bell(root * 7.1, t - (getCtx()?.currentTime ?? t), 0.028, 'music');
  if (pulse === 11) synth({ freq: root * 5.6, duration: 0.26, gain: 0.032, type: 'sawtooth', filterStart: 900, filterEnd: 5200, when: t, attack: 0.01, pan: 0.2, wet: 0.36 });
}

function scheduleRewardStep(step: number, t: number) {
  const bar = Math.floor(step / 16);
  const root = [82.41, 98, 110, 130.81][bar % 4];
  const pulse = step % 16;
  if (pulse === 0) chord([root * 2, root * 2.5, root * 3, root * 4, root * 6], 2.4, 0.095, t - (getCtx()?.currentTime ?? t), 0.4, 'music');
  if (pulse === 0 || pulse === 4 || pulse === 8 || pulse === 12) bell(root * (pulse === 8 ? 10 : 8), t - (getCtx()?.currentTime ?? t), 0.043, 'music');
  if (pulse === 2 || pulse === 6 || pulse === 10 || pulse === 14) synth({ freq: root * [3, 4, 5, 6][Math.floor(pulse / 4)], duration: 0.2, gain: 0.042, type: 'triangle', filterStart: 1800, filterEnd: 5200, when: t, wet: 0.26 });
}

function scheduleEndStep(step: number, t: number, victory: boolean) {
  const bar = Math.floor(step / 16);
  const root = victory ? [98, 130.81, 146.83, 196][bar % 4] : [49, 46.25, 41.2, 36.71][bar % 4];
  const pulse = step % 16;
  if (pulse === 0) {
    const tones = victory ? [2, 2.5, 3, 4, 6] : [2, 2.4, 3, 3.5];
    tones.forEach((mul, i) => synth({ freq: root * mul, duration: 7, gain: victory ? 0.032 : 0.026, type: victory ? 'sawtooth' : 'triangle', filterStart: victory ? 1200 : 480, filterEnd: victory ? 2800 : 820, when: t + i * 0.045, attack: 0.45, pan: (i - 2) * 0.18, wet: 0.48 }));
  }
  if (victory && (pulse === 0 || pulse === 8)) {
    tone({ freq: root, sweepTo: root * 0.5, duration: 0.42, gain: 0.14, type: 'sine', when: t, bus: 'music', wet: 0.08 });
    bell(root * 8, t - (getCtx()?.currentTime ?? t) + 0.05, 0.044, 'music');
  }
  if (!victory && (pulse === 4 || pulse === 12)) {
    noise({ duration: 0.38, gain: 0.05, filterStart: 600, filterEnd: 70, when: t, bus: 'music', wet: 0.26 });
  }
}

function scheduleCombatStep(step: number, t: number) {
  const bar = Math.floor(step / 16);
  const root = EPIC_ROOTS[bar % EPIC_ROOTS.length];
  const chordNotes = EPIC_CHORDS[bar % EPIC_CHORDS.length];
  const pulse = step % 16;

  if (pulse === 0) {
    chordNotes.forEach((freq, i) => {
      synth({
        freq,
        duration: 7.2,
        gain: i === 0 ? 0.026 : 0.032,
        type: 'sawtooth',
        detune: i % 2 ? -9 : 9,
        filterStart: 840,
        filterEnd: 2500,
        when: t + i * 0.025,
        attack: 0.22,
        pan: (i - 2) * 0.18,
        wet: 0.34,
      });
      synth({
        freq: freq * 0.5,
        duration: 7.4,
        gain: i === 0 ? 0.03 : 0.014,
        type: 'square',
        detune: i % 2 ? 5 : -5,
        filterStart: 520,
        filterEnd: 980,
        when: t + i * 0.025,
        attack: 0.3,
        pan: (2 - i) * 0.14,
        wet: 0.28,
      });
    });
    noise({ duration: 1.15, gain: 0.04, filterStart: 520, filterEnd: 120, type: 'lowpass', when: t, bus: 'music', wet: 0.18 });
    tone({ freq: root * 0.5, sweepTo: root * 0.48, duration: 7.4, gain: 0.06, type: 'sine', when: t, bus: 'music', wet: 0.24, attack: 0.55 });
  }

  if (pulse === 0 || pulse === 8) {
    const chant = root * DUNGEON_CHANT[(bar * 2 + (pulse === 8 ? 1 : 0)) % DUNGEON_CHANT.length];
    synth({ freq: chant, duration: 1.25, gain: 0.058, type: 'triangle', filterStart: 620, filterEnd: 1350, when: t + 0.03, attack: 0.16, pan: pulse === 0 ? -0.12 : 0.12, wet: 0.42 });
    synth({ freq: chant * 2.01, duration: 1.1, gain: 0.024, type: 'sawtooth', filterStart: 900, filterEnd: 1700, when: t + 0.06, attack: 0.18, pan: pulse === 0 ? 0.18 : -0.18, wet: 0.45 });
  }

  if (pulse === 0 || pulse === 4 || pulse === 8 || pulse === 12) {
    const strong = pulse === 0 || pulse === 8;
    tone({ freq: root, sweepTo: root * 0.42, duration: strong ? 0.46 : 0.3, gain: strong ? 0.24 : 0.16, type: 'sine', when: t, bus: 'music', wet: 0.04 });
    synth({ freq: root, duration: strong ? 0.36 : 0.24, gain: strong ? 0.15 : 0.1, type: 'square', filterStart: 680, filterEnd: 95, when: t, wet: 0.04 });
    noise({ duration: strong ? 0.2 : 0.13, gain: strong ? 0.14 : 0.085, filterStart: 980, filterEnd: 80, when: t, bus: 'music', wet: 0.04 });
  }

  if (pulse === 4 || pulse === 12) {
    noise({ duration: 0.18, gain: 0.11, filterStart: 2800, filterEnd: 420, type: 'bandpass', q: 0.75, when: t, bus: 'music', wet: 0.16 });
    tone({ freq: root * 2, sweepTo: root * 1.2, duration: 0.13, gain: 0.04, type: 'triangle', when: t + 0.015, bus: 'music', wet: 0.12 });
    bell(root * 6, t - (getCtx()?.currentTime ?? t) + 0.035, 0.034, 'music');
  }

  if (pulse === 2 || pulse === 6 || pulse === 10 || pulse === 14) {
    synth({ freq: root * 1.5, duration: 0.2, gain: 0.09, type: 'sawtooth', filterStart: 1350, filterEnd: 220, when: t, pan: pulse < 8 ? -0.14 : 0.14, wet: 0.08 });
    noise({ duration: 0.095, gain: 0.07, filterStart: 3000, filterEnd: 460, type: 'bandpass', q: 1.4, when: t, bus: 'music', wet: 0.08 });
  }

  if (pulse === 1 || pulse === 5 || pulse === 9 || pulse === 13) {
    synth({ freq: root * 0.75, duration: 0.12, gain: 0.05, type: 'square', filterStart: 720, filterEnd: 180, when: t, pan: pulse < 8 ? 0.12 : -0.12, wet: 0.04 });
  }

  if (step % 2 === 1) {
    noise({ duration: 0.052, gain: 0.045, filterStart: 9800, filterEnd: 4300, type: 'highpass', q: 0.42, when: t, pan: pulse % 4 === 1 ? -0.32 : 0.32, bus: 'music', wet: 0.06 });
  }

  if (pulse === 3 || pulse === 7 || pulse === 11 || pulse === 15) {
    const freq = root * EPIC_LEAD[(step + bar * 2) % EPIC_LEAD.length];
    synth({ freq, duration: 0.24, gain: 0.07, type: 'sawtooth', filterStart: 2600, filterEnd: 6200, when: t, attack: 0.005, pan: pulse < 8 ? -0.2 : 0.2, wet: 0.18 });
    tone({ freq: freq * 2, duration: 0.15, gain: 0.026, type: 'triangle', when: t + 0.018, bus: 'music', wet: 0.18 });
  }

  if (pulse % 2 === 0) {
    const runFreq = root * EPIC_RUN[(step / 2 + bar * 3) % EPIC_RUN.length];
    synth({ freq: runFreq, duration: 0.1, gain: 0.026, type: 'sawtooth', filterStart: 1900, filterEnd: 5000, when: t + 0.095, attack: 0.004, pan: pulse < 8 ? 0.24 : -0.24, wet: 0.16 });
  }

  if (pulse === 15) {
    const lift = root * (bar % 2 === 0 ? 8 : 6);
    synth({ freq: lift, duration: 0.5, gain: 0.075, type: 'sawtooth', filterStart: 1900, filterEnd: 7200, when: t, attack: 0.01, pan: 0, wet: 0.28 });
    bell(root * 5, t - (getCtx()?.currentTime ?? t) + 0.08, 0.04, 'music');
  }

  if (step % 32 === 30) {
    noise({ duration: 0.68, gain: 0.075, filterStart: 2600, filterEnd: 9800, type: 'highpass', when: t, bus: 'music', wet: 0.3 });
  }

  if (step % 64 === 48) {
    chordNotes.slice(1).forEach((freq, i) => {
      synth({
        freq: freq * 2,
        duration: 2.4,
        gain: 0.035,
        type: 'sawtooth',
        detune: i % 2 ? 12 : -12,
        filterStart: 1400,
        filterEnd: 3600,
        when: t + i * 0.045,
        attack: 0.18,
        pan: (i - 1.5) * 0.2,
        wet: 0.48,
      });
    });
    noise({ duration: 1.1, gain: 0.05, filterStart: 700, filterEnd: 90, type: 'lowpass', when: t, bus: 'music', wet: 0.28 });
  }
}

function scheduleMusicStep(step: number, t: number) {
  if (currentMood === 'menu') scheduleMenuStep(step, t);
  else if (currentMood === 'map') scheduleMapStep(step, t);
  else if (currentMood === 'sanctuary') scheduleSanctuaryStep(step, t);
  else if (currentMood === 'event') scheduleEventStep(step, t);
  else if (currentMood === 'reward') scheduleRewardStep(step, t);
  else if (currentMood === 'victory') scheduleEndStep(step, t, true);
  else if (currentMood === 'defeat') scheduleEndStep(step, t, false);
  else scheduleCombatStep(step, t);
}

function moodLevel(mood: MusicMood): number {
  if (mood === 'combat') return 0.56;
  if (mood === 'victory') return 0.52;
  if (mood === 'defeat') return 0.42;
  if (mood === 'map') return 0.4;
  if (mood === 'reward') return 0.38;
  if (mood === 'sanctuary') return 0.32;
  if (mood === 'event') return 0.36;
  return 0.3;
}

function moodBeat(mood: MusicMood): number {
  if (mood === 'combat') return 0.18;
  if (mood === 'event') return 0.23;
  if (mood === 'map') return 0.24;
  if (mood === 'reward') return 0.2;
  if (mood === 'victory') return 0.2;
  if (mood === 'defeat') return 0.28;
  if (mood === 'sanctuary') return 0.3;
  return 0.34;
}

export function setAmbienceMode(mood: MusicMood): void {
  if (currentMood === mood) return;
  currentMood = mood;
  musicStep = 0;
  if (!ambience) return;
  const ac = getCtx();
  if (!ac || !graph) return;
  graph.music.gain.cancelScheduledValues(ac.currentTime);
  graph.music.gain.setTargetAtTime(moodLevel(mood), ac.currentTime, 0.65);
}

export function startAmbience(mood: MusicMood = 'menu'): void {
  currentMood = mood;
  if (ambience) return;
  const ac = getCtx();
  if (!ac || !graph) return;

  graph.music.gain.cancelScheduledValues(ac.currentTime);
  graph.music.gain.setValueAtTime(0.0001, ac.currentTime);
  graph.music.gain.exponentialRampToValueAtTime(Math.max(0.0002, moodLevel(currentMood)), ac.currentTime + 1.1);

  let stopped = false;
  musicStep = 0;
  let next = ac.currentTime + 0.08;
  const lookahead = 0.24;
  const timer = window.setInterval(() => {
    const now = ac.currentTime;
    while (!stopped && next < now + lookahead) {
      scheduleMusicStep(musicStep, next);
      musicStep += 1;
      next += moodBeat(currentMood);
    }
  }, 80);

  ambience = {
    stop: () => {
      stopped = true;
      window.clearInterval(timer);
      const now = ac.currentTime;
      graph?.music.gain.cancelScheduledValues(now);
      graph?.music.gain.setTargetAtTime(0.0001, now, 0.45);
      ambience = null;
    },
  };
}

export function stopAmbience(): void {
  ambience?.stop();
}
