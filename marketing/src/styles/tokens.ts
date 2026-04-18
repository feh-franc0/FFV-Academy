// Design tokens da FFV Academy — extraidos de globals.css
// Usados em todas as cenas e componentes Remotion

export const COLORS = {
  bg: '#0d1117',
  bg2: '#161b22',
  bg3: '#21262d',
  border: '#30363d',
  text: '#f0f6fc',
  muted: '#8b949e',
  blue: '#58a6ff',
  green: '#3fb950',
  purple: '#d2a8ff',
  orange: '#ffa657',
  yellow: '#e3b341',
  red: '#f78166',
} as const;

export const FONTS = {
  heading: 'Poppins',
  body: 'Inter',
  mono: 'Roboto Mono',
} as const;

export const VIDEO = {
  FPS: 30,
  WIDTH: 1920,
  HEIGHT: 1080,
  DURATION_SECONDS: 90,
  TOTAL_FRAMES: 30 * 90, // 2700
} as const;

// Mapa de cenas → frames (90s total, mais features)
export const SCENES = {
  hook:     { from: 0,    duration: 210  }, // 0s–7s
  problem:  { from: 210,  duration: 270  }, // 7s–16s
  reveal:   { from: 480,  duration: 330  }, // 16s–27s
  features: { from: 810,  duration: 1050 }, // 27s–62s (EXPANDIDO: 35s, 7 sub-cenas)
  proof:    { from: 1860, duration: 270  }, // 62s–71s
  cta:      { from: 2130, duration: 570  }, // 71s–90s
} as const;

// Sub-cenas de features (7 features × 150 frames = 1050)
export const FEATURE_SCENES = {
  hubs:       { from: 0,   duration: 150 }, // 5s — 4 hubs tematicos
  trails:     { from: 150, duration: 150 }, // 5s — trilhas com progresso
  article:    { from: 300, duration: 150 }, // 5s — artigo com TOC
  quiz:       { from: 450, duration: 150 }, // 5s — quiz interativo (crossfade)
  progress:   { from: 600, duration: 150 }, // 5s — dashboard progresso
  srs:        { from: 750, duration: 150 }, // 5s — revisao espacada
  darkLight:  { from: 900, duration: 150 }, // 5s — transicao dark/light
} as const;
