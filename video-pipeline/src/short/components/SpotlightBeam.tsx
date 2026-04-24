import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Props {
  color: string;
  /** Direcao do sweep: lr, rl, td (top-down), bt */
  direction?: 'lr' | 'rl' | 'td' | 'bt';
  intensity?: number;
}

/** Feixe de spotlight que atravessa a cena — usado em transicoes de destaque */
export function SpotlightBeam({ color, direction = 'lr', intensity = 0.5 }: Props) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [-30, 130]);

  const gradient =
    direction === 'lr' || direction === 'rl'
      ? `linear-gradient(${direction === 'lr' ? '90deg' : '-90deg'},
          transparent ${progress - 20}%,
          ${color}44 ${progress - 5}%,
          ${color}88 ${progress}%,
          ${color}44 ${progress + 5}%,
          transparent ${progress + 20}%)`
      : `linear-gradient(${direction === 'td' ? '180deg' : '0deg'},
          transparent ${progress - 20}%,
          ${color}44 ${progress - 5}%,
          ${color}88 ${progress}%,
          ${color}44 ${progress + 5}%,
          transparent ${progress + 20}%)`;

  return (
    <AbsoluteFill
      style={{
        background: gradient,
        mixBlendMode: 'screen',
        opacity: intensity,
        pointerEvents: 'none',
      }}
    />
  );
}
