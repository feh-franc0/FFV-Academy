import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import type { HeroConfig, Device, Format } from '../config/types';
import { COLORS, FONTS, safeZoneFor } from '../styles/short-tokens';
import { ParticleField } from '../components/ParticleField';
import { LogoFormation } from '../components/LogoFormation';
import { ColorGrade } from '../components/ColorGrade';

interface Props { config: HeroConfig; device: Device; format: Format; includeText?: boolean; }

export function CTAScene({ config, format, includeText = false }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const safe = safeZoneFor(format);
  const isH = format === 'horizontal';

  const urlEnter = spring({ frame: frame - 35, fps, config: { damping: 12, stiffness: 160 } });
  const primaryEnter = spring({ frame: frame - 50, fps, config: { damping: 10, stiffness: 180 } });
  const taglineEnter = spring({ frame: frame - 80, fps, config: { damping: 14, stiffness: 200 } });
  const pulse = 1 + 0.05 * Math.sin(frame * 0.3);
  const gradRotate = interpolate(frame, [0, 60], [180, 210]);

  return (
    <ColorGrade mood="brandPeak" intensity={0.5}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(${gradRotate}deg, ${COLORS.bg} 0%, ${COLORS.bg2} 50%, ${config.accentColor}44 100%)`,
        }}
      >
        <ParticleField color={config.accentColor} count={130} intensity={1} seed="cta" />

        <LogoFormation
          color={config.accentColor}
          topPercent={includeText ? 32 : (isH ? 40 : 38)}
          fontSize={includeText ? (isH ? 240 : 200) : (isH ? 280 : 220)}
        />

        {/* Primary (text mode) */}
        {includeText && (
          <div
            style={{
              position: 'absolute',
              top: isH ? '58%' : '54%',
              left: 0,
              right: 0,
              textAlign: 'center',
              opacity: primaryEnter,
              transform: `translateY(${20 * (1 - primaryEnter)}px)`,
              fontFamily: FONTS.body,
              fontSize: isH ? 60 : 50,
              fontWeight: 800,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: 3,
              textShadow: `0 0 30px ${config.accentColor}aa`,
            }}
          >
            {config.cta.primary}
          </div>
        )}

        {/* URL — sempre presente (brand identity) */}
        <div
          style={{
            position: 'absolute',
            top: includeText ? (isH ? '66%' : '63%') : (isH ? '72%' : '68%'),
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: urlEnter,
            transform: `scale(${pulse})`,
            fontFamily: FONTS.heading,
            fontSize: isH ? 116 : 92,
            fontWeight: 900,
            color: config.accentColor,
            textShadow: `0 0 40px ${config.accentColor}, 0 4px 20px rgba(0,0,0,1)`,
            letterSpacing: -2,
          }}
        >
          {config.cta.secondary}
        </div>

        {/* Tagline (text mode) */}
        {includeText && config.cta.tagline && (
          <div
            style={{
              position: 'absolute',
              bottom: safe.bottom,
              left: 0,
              right: 0,
              textAlign: 'center',
              opacity: taglineEnter,
              transform: `scale(${0.5 + 0.5 * taglineEnter})`,
              fontFamily: FONTS.heading,
              fontSize: isH ? 180 : 140,
              fontWeight: 900,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: -3,
              textShadow: `0 0 60px ${config.accentColor}, 0 8px 0 #000`,
              WebkitTextStroke: `4px ${config.accentColor}`,
            }}
          >
            {config.cta.tagline}
          </div>
        )}
      </AbsoluteFill>
    </ColorGrade>
  );
}
