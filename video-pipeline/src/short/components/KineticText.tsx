import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { EASE } from '../styles/easing';
import { FONTS, safeZoneFor } from '../styles/short-tokens';
import type { Format } from '../config/types';

interface Word {
  text: string;
  emphasis?: boolean;
  color?: string;
}

interface Props {
  words: Word[];
  color: string;
  format: Format;
  position?: 'top' | 'middle' | 'bottom';
  baseSize?: number;
  stagger?: number;
}

/**
 * Kinetic typography — palavras staggered com scale + emphasis.
 * Usado em Hook (text mode) e Pain pills.
 */
export function KineticText({ words, color, format, position = 'middle', baseSize, stagger = 6 }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const safe = safeZoneFor(format);
  const isH = format === 'horizontal';
  const size = baseSize ?? (isH ? 140 : 110);

  const verticalStyle: React.CSSProperties =
    position === 'top'    ? { top: safe.top }
  : position === 'middle' ? { top: '50%', transform: 'translateY(-50%)' }
  : { bottom: safe.bottom };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: safe.sides,
          right: safe.sides,
          ...verticalStyle,
          textAlign: 'center',
          fontFamily: FONTS.heading,
          fontWeight: 900,
          letterSpacing: -3,
          textTransform: 'uppercase',
          lineHeight: 1.0,
        }}
      >
        {words.map((word, i) => {
          const delay = i * stagger;
          const enterProgress = spring({
            frame: frame - delay,
            fps,
            config: { damping: word.emphasis ? 8 : 14, stiffness: word.emphasis ? 200 : 160 },
          });
          const scale = word.emphasis
            ? 0.3 + 1.0 * EASE.outBack(enterProgress)
            : 0.6 + 0.4 * enterProgress;

          const shakeX = word.emphasis && frame - delay < 15
            ? Math.sin((frame - delay) * 0.7) * 6
            : 0;

          const wordColor = word.color ?? (word.emphasis ? color : '#ffffff');
          const fontSize = word.emphasis ? size * 1.15 : size * 0.75;

          return (
            <span
              key={`${word.text}-${i}`}
              style={{
                display: 'inline-block',
                margin: '0 0.15em',
                transform: `translate(${shakeX}px, 0) scale(${scale})`,
                opacity: Math.min(1, enterProgress * 1.2),
                color: wordColor,
                fontSize,
                textShadow: word.emphasis
                  ? `0 0 40px ${wordColor}, 0 0 80px ${wordColor}66, 0 4px 0 rgba(0,0,0,0.5)`
                  : '0 4px 20px rgba(0,0,0,0.9)',
                WebkitTextStroke: word.emphasis ? `3px rgba(0,0,0,0.6)` : 'none',
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
