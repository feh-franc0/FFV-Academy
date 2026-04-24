// Design tokens do pipeline comercial FFV Academy

import type { Format, Device } from '../config/types';

export const FPS = 30;
export const DURATION_SEC = 60;
export const TOTAL_FRAMES = FPS * DURATION_SEC; // 1800

/** Dimensoes por formato */
export function dimsFor(format: Format): { width: number; height: number } {
  return format === 'horizontal'
    ? { width: 1920, height: 1080 }
    : { width: 1080, height: 1920 };
}

/** Viewport de gravacao por device */
export function recordViewportFor(device: Device): { width: number; height: number } {
  return device === 'phone'
    ? { width: 412, height: 915 }          // Pixel 7 ish — realistico pra mockup
    : { width: 1920, height: 1080 };       // Desktop
}

/** Slots do arco 60s (em frames) */
export const SCENES = {
  hook:    { from: 0,    duration: 90   }, // 0-3s   gancho cognitivo
  pain:    { from: 90,   duration: 120  }, // 3-7s   dor
  reveal:  { from: 210,  duration: 120  }, // 7-11s  brand reveal
  demo:    { from: 330,  duration: 900  }, // 11-41s 8 features rapid-fire
  proof:   { from: 1230, duration: 300  }, // 41-51s numeros com explosao
  cta:     { from: 1530, duration: 270  }, // 51-60s CTA hard
} as const;

export const COLORS = {
  bg: '#0d1117',
  bg2: '#161b22',
  bg3: '#1c2430',
  text: '#f0f6fc',
  muted: '#8b949e',
  accentHero: '#58a6ff',       // azul FFV
  accentSecondary: '#d2a8ff',  // roxo secundario
  accentHot: '#f78166',        // laranja energia
  accentGold: '#e3b341',       // conquistas
  accentGreen: '#3fb950',      // streak / sucesso
  gradientHook: 'linear-gradient(135deg, #0d1117 0%, #1a2332 50%, #0d1117 100%)',
  gradientPain: 'linear-gradient(180deg, #0d1117 0%, #2d1b1b 50%, #0d1117 100%)',
  gradientReveal: 'radial-gradient(circle at center, #1f2937 0%, #0d1117 70%)',
  gradientProof: 'radial-gradient(circle at 50% 40%, #1c2430 0%, #0d1117 80%)',
  gradientCta: 'linear-gradient(180deg, #0d1117 0%, #1a2332 50%, #58a6ff22 100%)',
} as const;

export const FONTS = {
  heading: 'Poppins',
  body: 'Inter',
  mono: 'Roboto Mono',
} as const;

export const RHYTHM = {
  MAX_STATIC_FRAMES: 45,       // 1.5s
  CAPTION_MIN_FRAMES: 24,      // 0.8s
  CAPTION_MAX_FRAMES: 60,      // 2s
  BEAT_MARKER_FRAMES: 3,
  ZOOM_DURATION_FRAMES: 10,
  PUNCH_DURATION_FRAMES: 15,
} as const;

/** Safe zones por formato (diferentes em H vs V) */
export function safeZoneFor(format: Format): { top: number; bottom: number; sides: number } {
  return format === 'horizontal'
    ? { top: 90,  bottom: 110, sides: 140 }
    : { top: 220, bottom: 380, sides: 60 };
}
