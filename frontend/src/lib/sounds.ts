'use client';

/**
 * Sound effects synthesized via Web Audio API — no external files or dependencies.
 * All sounds are gated behind a user-interaction flag to comply with browser autoplay policy.
 */

let ctx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext ?? (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
}

/** Call once on any user gesture to unlock audio. */
export function unlockAudio() {
  if (unlocked) return;
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === 'suspended') {
    ac.resume().catch(() => {});
  }
  unlocked = true;
}

function beep(
  freq: number,
  gain: number,
  startAt: number,
  duration: number,
  type: OscillatorType = 'sine',
  endFreq?: number,
) {
  const ac = getCtx();
  if (!ac || !unlocked) return;

  const osc = ac.createOscillator();
  const gainNode = ac.createGain();

  osc.connect(gainNode);
  gainNode.connect(ac.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + startAt);
  if (endFreq !== undefined) {
    osc.frequency.linearRampToValueAtTime(endFreq, ac.currentTime + startAt + duration);
  }

  gainNode.gain.setValueAtTime(0, ac.currentTime + startAt);
  gainNode.gain.linearRampToValueAtTime(gain, ac.currentTime + startAt + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startAt + duration);

  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + duration + 0.05);
}

/** Short coin-collect blip — played on XP gain. */
export function playXPCoin() {
  beep(880, 0.18, 0, 0.06, 'square');
  beep(1320, 0.14, 0.05, 0.08, 'square');
}

/** Triumphant 3-note fanfare — played on level-up. */
export function playLevelUp() {
  beep(523, 0.2, 0, 0.15, 'sine');       // C5
  beep(659, 0.2, 0.12, 0.15, 'sine');    // E5
  beep(784, 0.2, 0.24, 0.15, 'sine');    // G5
  beep(1047, 0.22, 0.38, 0.35, 'sine');  // C6
}

/** Bright success ding — played on badge unlock. */
export function playBadge() {
  beep(1046, 0.18, 0, 0.1, 'sine');
  beep(1318, 0.16, 0.07, 0.1, 'sine');
  beep(1568, 0.14, 0.14, 0.18, 'sine');
}

/** Soft pop — played on streak milestone or freeze used. */
export function playPop() {
  beep(440, 0.15, 0, 0.05, 'sine', 660);
}
