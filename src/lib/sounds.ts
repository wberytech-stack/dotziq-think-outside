// Web Audio sound effects for Dotziq
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export function playLineConnect(lineIndex: number) {
  // Rising pitch per line segment
  const baseFreq = 440 + lineIndex * 80;
  playTone(baseFreq, 0.12, 'sine', 0.12);
}

export function playDotHit() {
  playTone(880, 0.06, 'sine', 0.08);
}

export function playWin() {
  // Arpeggio celebration
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.15), i * 100);
  });
}

export function playError() {
  playTone(220, 0.25, 'sawtooth', 0.08);
}

export function playReset() {
  playTone(330, 0.1, 'triangle', 0.08);
}
