import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate, random } from 'remotion';
import type { CaptionRef, Format } from '../config/types';
import { FONTS, safeZoneFor } from '../styles/short-tokens';

interface Props {
  caption: CaptionRef;
  accentColor: string;
  format: Format;
}

export function QuickCaption({ caption, accentColor, format }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = caption.durationFrames ?? 45;
  const style = caption.style ?? 'normal';
  const enterKind = caption.enter ?? defaultEnterFor(style);
  const safe = safeZoneFor(format);

  const enterProgress = getEnterProgress(enterKind, frame, fps);
  const exitStart = duration - 8;
  const exitProgress = interpolate(frame, [exitStart, duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const visible = Math.min(enterProgress, exitProgress);

  const visual = getVisualStyle(style, accentColor, format);
  const transform = getEnterTransform(enterKind, enterProgress, frame);

  const position = caption.position ?? 'bottom';
  const verticalStyle: React.CSSProperties =
    position === 'top'    ? { top: safe.top, bottom: 'auto' }
  : position === 'middle' ? { top: '50%', transform: 'translateY(-50%)' }
  : { bottom: safe.bottom, top: 'auto' };

  let displayText = caption.text;
  if (enterKind === 'typewriter') {
    const chars = Math.floor(caption.text.length * enterProgress);
    displayText = caption.text.slice(0, chars);
  }

  // Glitch: jitter na posicao durante primeiros 6 frames
  const glitchJitter = enterKind === 'glitch' && frame < 8
    ? { x: (random(`gj-${frame}`) - 0.5) * 20, y: (random(`gjy-${frame}`) - 0.5) * 10 }
    : { x: 0, y: 0 };

  const content = caption.highlight
    ? renderHighlighted(displayText, caption.highlight, accentColor)
    : (enterKind === 'maskReveal'
        ? renderMaskReveal(displayText, enterProgress)
        : displayText);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: safe.sides,
          right: safe.sides,
          ...verticalStyle,
          opacity: visible,
          transform: `${verticalStyle.transform ?? ''} translate(${glitchJitter.x}px, ${glitchJitter.y}px) ${transform}`.trim(),
          textAlign: 'center',
          ...visual,
        }}
      >
        {content}
      </div>
    </AbsoluteFill>
  );
}

function defaultEnterFor(style: CaptionRef['style']): NonNullable<CaptionRef['enter']> {
  switch (style) {
    case 'hook': return 'punch';
    case 'reward': return 'bounce';
    case 'feature': return 'slideUp';
    case 'number': return 'bounce';
    case 'cta': return 'punch';
    case 'pill': return 'bounce';
    default: return 'slideUp';
  }
}

function getEnterProgress(enter: NonNullable<CaptionRef['enter']>, frame: number, fps: number): number {
  if (enter === 'bounce' || enter === 'punch' || enter === 'glitch') {
    return spring({ frame, fps, config: { damping: enter === 'punch' ? 14 : 9, stiffness: enter === 'punch' ? 220 : 180 } });
  }
  if (enter === 'slideUp' || enter === 'slideDown') {
    return spring({ frame, fps, config: { damping: 18, stiffness: 140 } });
  }
  if (enter === 'typewriter') return Math.min(frame / 22, 1);
  if (enter === 'maskReveal') return interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
}

function getEnterTransform(enter: NonNullable<CaptionRef['enter']>, progress: number, frame: number): string {
  if (enter === 'punch') return `scale(${0.4 + 0.6 * progress})`;
  if (enter === 'bounce') return `scale(${0.65 + 0.35 * progress})`;
  if (enter === 'slideUp') return `translateY(${70 * (1 - progress)}px)`;
  if (enter === 'slideDown') return `translateY(${-70 * (1 - progress)}px)`;
  if (enter === 'glitch') {
    const skew = 10 * (1 - progress);
    return `scale(${0.8 + 0.2 * progress}) skewX(${skew}deg)`;
  }
  return '';
}

function renderMaskReveal(text: string, progress: number): React.ReactNode {
  return (
    <span
      style={{
        display: 'inline-block',
        clipPath: `polygon(0 0, ${progress * 100}% 0, ${progress * 100}% 100%, 0 100%)`,
      }}
    >
      {text}
    </span>
  );
}

function getVisualStyle(style: NonNullable<CaptionRef['style']>, accentColor: string, format: Format): React.CSSProperties {
  const isH = format === 'horizontal';
  const base: React.CSSProperties = {
    fontFamily: FONTS.heading,
    color: '#ffffff',
    lineHeight: 1.05,
    textShadow: '0 4px 24px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,1)',
  };
  switch (style) {
    case 'hook':
      return {
        ...base,
        fontSize: isH ? 180 : 140,
        fontWeight: 900,
        letterSpacing: -3,
        textTransform: 'uppercase',
        WebkitTextStroke: '3px rgba(0,0,0,0.7)',
      };
    case 'reward':
      return {
        ...base,
        fontSize: isH ? 150 : 120,
        fontWeight: 900,
        color: accentColor,
        textShadow: `0 0 45px ${accentColor}, 0 0 90px ${accentColor}`,
        letterSpacing: -2,
      };
    case 'feature':
      return {
        ...base,
        fontSize: isH ? 96 : 84,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: 1,
      };
    case 'number':
      return {
        ...base,
        fontSize: isH ? 200 : 160,
        fontWeight: 900,
        color: accentColor,
        letterSpacing: -4,
      };
    case 'cta':
      return {
        ...base,
        fontSize: isH ? 120 : 96,
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: -1,
        color: accentColor,
        textShadow: `0 0 30px ${accentColor}, 0 4px 20px rgba(0,0,0,1)`,
      };
    case 'pill':
      return {
        ...base,
        fontFamily: FONTS.body,
        fontSize: isH ? 56 : 48,
        fontWeight: 800,
        color: '#0d1117',
        background: accentColor,
        borderRadius: 999,
        padding: '18px 40px',
        display: 'inline-block',
        boxShadow: `0 0 30px ${accentColor}88, 0 4px 20px rgba(0,0,0,0.4)`,
        textShadow: 'none',
      };
    case 'normal':
    default:
      return {
        ...base,
        fontFamily: FONTS.body,
        fontSize: isH ? 78 : 68,
        fontWeight: 700,
        letterSpacing: -0.5,
      };
  }
}

function renderHighlighted(text: string, range: [number, number], color: string): React.ReactNode {
  const [from, to] = range;
  return (
    <>
      {text.slice(0, from)}
      <span style={{ color, textShadow: `0 0 40px ${color}` }}>{text.slice(from, to)}</span>
      {text.slice(to)}
    </>
  );
}
