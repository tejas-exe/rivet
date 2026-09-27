/**
 * Studio UI sound architecture.
 *
 * Sounds are synthesised with WebAudio so no assets are needed. Each cue is a
 * small recipe; swapping in sampled audio later only means replacing
 * `play()` for a cue with an AudioBuffer lookup.
 */
export type SoundCue = "hover" | "select" | "confirm" | "whoosh" | "error" | "tick" | "drop";

interface Tone {
  type: OscillatorType;
  from: number;
  to: number;
  duration: number;
  gain: number;
  delay?: number;
}

const RECIPES: Record<SoundCue, Tone[]> = {
  hover: [{ type: "sine", from: 1800, to: 1600, duration: 0.035, gain: 0.025 }],
  tick: [{ type: "square", from: 2400, to: 2400, duration: 0.015, gain: 0.012 }],
  select: [
    { type: "triangle", from: 660, to: 990, duration: 0.07, gain: 0.07 },
    { type: "sine", from: 1320, to: 1320, duration: 0.05, gain: 0.03, delay: 0.04 },
  ],
  confirm: [
    { type: "triangle", from: 520, to: 520, duration: 0.09, gain: 0.08 },
    { type: "triangle", from: 780, to: 780, duration: 0.09, gain: 0.08, delay: 0.08 },
    { type: "triangle", from: 1040, to: 1040, duration: 0.18, gain: 0.08, delay: 0.16 },
  ],
  whoosh: [{ type: "sawtooth", from: 180, to: 60, duration: 0.35, gain: 0.03 }],
  drop: [{ type: "sine", from: 300, to: 90, duration: 0.14, gain: 0.12 }],
  error: [
    { type: "square", from: 220, to: 180, duration: 0.12, gain: 0.04 },
    { type: "square", from: 180, to: 140, duration: 0.14, gain: 0.04, delay: 0.1 },
  ],
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private lastPlayed = new Map<SoundCue, number>();
  enabled = true;

  private context() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  play(cue: SoundCue) {
    if (!this.enabled) return;
    const now = performance.now();
    if (now - (this.lastPlayed.get(cue) ?? 0) < 40) return; // de-dupe bursts
    this.lastPlayed.set(cue, now);
    const ctx = this.context();
    if (!ctx) return;
    for (const tone of RECIPES[cue]) {
      const t0 = ctx.currentTime + (tone.delay ?? 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = tone.type;
      osc.frequency.setValueAtTime(tone.from, t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, tone.to), t0 + tone.duration);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(tone.gain, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + tone.duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + tone.duration + 0.02);
    }
  }
}

export const sound = new SoundEngine();
