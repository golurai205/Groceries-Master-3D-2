// Lightweight WebAudio synth for SFX (no external assets)
let ctx: AudioContext | null = null;
let musicGain: GainNode | null = null;
let musicNodes: { osc: OscillatorNode; lfo: OscillatorNode; lfoGain: GainNode }[] = [];
let musicPlaying = false;

export const audioState = {
  sound: true,
  music: true,
};

function getCtx() {
  if (!ctx) {
    const AC = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.18, delay = 0) {
  if (!audioState.sound) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function sweep(f1: number, f2: number, dur: number, type: OscillatorType = 'sine', vol = 0.2) {
  if (!audioState.sound) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f1, t);
  osc.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export const sfx = {
  tap: () => tone(620, 0.08, 'triangle', 0.15),
  pickup: () => { tone(520, 0.08, 'sine', 0.14); tone(780, 0.1, 'sine', 0.12, 0.04); },
  match: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.18, i * 0.05));
  },
  combo: (n: number) => {
    const base = 440 + n * 60;
    [0, 1, 2].forEach((i) => tone(base * Math.pow(1.25, i), 0.15, 'square', 0.12, i * 0.04));
  },
  warn: () => sweep(880, 660, 0.18, 'square', 0.1),
  danger: () => { sweep(1100, 220, 0.3, 'sawtooth', 0.18); },
  win: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'triangle', 0.2, i * 0.08));
  },
  lose: () => {
    [392, 330, 262, 196].forEach((f, i) => tone(f, 0.25, 'sawtooth', 0.16, i * 0.1));
  },
  click: () => tone(800, 0.05, 'square', 0.1),
  star: () => { tone(1320, 0.1, 'triangle', 0.16); tone(1760, 0.15, 'triangle', 0.14, 0.06); },
  coin: () => { tone(988, 0.06, 'square', 0.12); tone(1318, 0.1, 'square', 0.12, 0.05); },
  shuffle: () => { sweep(300, 900, 0.3, 'triangle', 0.14); sweep(900, 400, 0.2, 'triangle', 0.12); },
  freeze: () => { sweep(1200, 400, 0.5, 'sine', 0.16); },
};

export function startMusic() {
  if (musicPlaying || !audioState.music) return;
  const c = getCtx();
  if (!c) return;
  musicGain = c.createGain();
  musicGain.gain.value = 0.04;
  musicGain.connect(c.destination);

  // Simple ambient pad with a slow LFO arpeggio
  const notes = [261.63, 329.63, 392.0, 523.25]; // C major chord
  notes.forEach((n, i) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = n;
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.15 + i * 0.05;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(osc.frequency);
    osc.connect(musicGain!);
    osc.start();
    lfo.start();
    musicNodes.push({ osc, lfo, lfoGain });
  });
  musicPlaying = true;
}

export function stopMusic() {
  musicNodes.forEach(({ osc, lfo }) => {
    try { osc.stop(); lfo.stop(); } catch {}
  });
  musicNodes = [];
  if (musicGain) try { musicGain.disconnect(); } catch {}
  musicGain = null;
  musicPlaying = false;
}

export function setMusic(on: boolean) {
  audioState.music = on;
  if (on) startMusic(); else stopMusic();
}
export function setSound(on: boolean) {
  audioState.sound = on;
}
