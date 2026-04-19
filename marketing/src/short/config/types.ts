// Tipos do pipeline de video comercial FFV Academy

export type Format = 'horizontal' | 'vertical';
export type Device = 'phone' | 'computer';

/** 4 variantes: horizontal+phone, horizontal+computer, vertical+phone, vertical+computer */
export type VariantId =
  | 'Hero-H-Phone'
  | 'Hero-H-Computer'
  | 'Hero-V-Phone'
  | 'Hero-V-Computer';

export type SceneSlot = 'hook' | 'pain' | 'reveal' | 'demo' | 'proof' | 'cta';

export type MotionEffect = 'none' | 'clickZoom' | 'punchIn' | 'panLeft' | 'panRight' | 'kenBurns' | 'floatTilt';

export interface BeatRef {
  /** id base do beat (sem extensao). Ex: 'h-01-hook'. O caminho final e resolvido em runtime baseado no device. */
  id: string;
  /** Em qual scene slot esse beat entra */
  slot: SceneSlot;
  /** Efeito de motion aplicado (default: punchIn para variedade) */
  motion?: MotionEffect;
  zoomTo?: { x: number; y: number };
  /** Velocidade de reproducao */
  playbackRate?: number;
  /** Duracao do beat na composicao final (em frames) */
  durationFrames?: number;
  /** Trim do video origem: pula os primeiros N segundos */
  trimStart?: number;
  /** Trim do video origem: para em N segundos */
  trimEnd?: number;
}

export type CaptionStyle = 'hook' | 'normal' | 'reward' | 'feature' | 'number' | 'cta' | 'pill';
export type CaptionEnter = 'bounce' | 'slideUp' | 'slideDown' | 'typewriter' | 'punch' | 'fade' | 'glitch' | 'maskReveal';

export interface CaptionRef {
  text: string;
  slot: SceneSlot;
  offsetFrames?: number;
  durationFrames?: number;
  position?: 'top' | 'middle' | 'bottom';
  style?: CaptionStyle;
  enter?: CaptionEnter;
  highlight?: [number, number];
  /** Accent especifico desta caption (override do accentColor do config) */
  accent?: string;
}

export interface BigNumberRef {
  value: number;
  label: string;
  offsetFrames: number;
  durationFrames: number;
  countFrames?: number;
  suffix?: string;
  /** Cor especifica do numero (override) */
  color?: string;
  /** Emoji/ icone opcional ao lado */
  icon?: string;
}

export interface VariantConfig {
  /** Id unico da variante (usado no output filename) */
  variant: VariantId;
  format: Format;
  device: Device;
  /** Titulo legivel para logs */
  title: string;
}

export interface HeroConfig {
  title: string;
  accentColor: string;
  accentSecondary: string;
  track: string;
  trackVolume?: number;
  beats: BeatRef[];
  captions: CaptionRef[];
  numbers: BigNumberRef[];
  cta: {
    url: string;
    primary: string;
    secondary: string;
    tagline?: string;
  };
}
