import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import type { Device, Format } from '../config/types';

type EntryDirection = 'left' | 'right' | 'top' | 'bottom' | 'scale' | 'none';

interface Props {
  device: Device;
  format: Format;
  tilt?: number;
  float?: boolean;
  scale?: number;
  entryFrom?: EntryDirection;
  entryDuration?: number;
  driftX?: number;
  driftY?: number;
  children: React.ReactNode;
}

/**
 * Mockups realistas:
 *   - Phone: iPhone 16 Pro Max (titanium natural, Dynamic Island, Camera Control, Action Button)
 *   - Laptop: MacBook Pro M4 (Space Black, notch, bezel fino, teclado refinado)
 * Zero zoom no conteudo. Motion no mockup inteiro.
 */
export function DeviceMockup({
  device, format, tilt = 3, float = true, scale = 1,
  entryFrom = 'scale', entryDuration = 18,
  driftX = 0, driftY = 0, children,
}: Props) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const tiltY = tilt * Math.sin(frame * 0.02);
  const tiltX = (tilt / 2) * Math.cos(frame * 0.015);
  const floatY = float ? 10 * Math.sin(frame * 0.05) : 0;

  const entryProg = spring({
    frame, fps,
    config: { damping: 14, stiffness: 130 },
    durationInFrames: entryDuration,
  });

  let entryX = 0, entryY = 0, entryScale = 1;
  if (entryFrom === 'left')   entryX = -width * 1.2 * (1 - entryProg);
  if (entryFrom === 'right')  entryX = width * 1.2 * (1 - entryProg);
  if (entryFrom === 'top')    entryY = -height * 1.2 * (1 - entryProg);
  if (entryFrom === 'bottom') entryY = height * 1.2 * (1 - entryProg);
  if (entryFrom === 'scale')  entryScale = 0.72 + 0.28 * entryProg;

  const finalScale = scale * entryScale;
  const totalX = entryX + driftX * width;
  const totalY = entryY + driftY * height + floatY;

  if (device === 'phone') {
    return <IPhone16ProMax
      tiltX={tiltX} tiltY={tiltY}
      translateX={totalX} translateY={totalY}
      scale={finalScale} format={format}
    >{children}</IPhone16ProMax>;
  }
  return <MacBookProM4
    tiltX={tiltX} tiltY={tiltY}
    translateX={totalX} translateY={totalY}
    scale={finalScale} format={format}
  >{children}</MacBookProM4>;
}

// ───────────────────────────────────────────────────────────────────────
// iPhone 16 Pro Max
// ───────────────────────────────────────────────────────────────────────

function IPhone16ProMax({ tiltX, tiltY, translateX, translateY, scale, format, children }: any) {
  const frame = useCurrentFrame();

  // Dimensoes proporcionais a iPhone 16 Pro Max (6.9" — aspect ~9:19.5)
  const phoneHeight = format === 'vertical' ? 1720 : 940;
  const phoneWidth = phoneHeight * (9 / 19.5);

  // Titanium bezel extremamente fino (iPhone 16 tem ~1.15mm real)
  const bezel = Math.max(12, phoneWidth * 0.018);
  const outerRadius = phoneWidth * 0.128;   // corner radius externo
  const innerRadius = outerRadius * 0.88;   // screen corner (menor que phone)

  // Dynamic Island — pill posicionado em cima
  const diWidth = phoneWidth * 0.29;
  const diHeight = phoneHeight * 0.026;
  const diTop = phoneHeight * 0.025;

  // Titanium light sweep — passagem sutil de luz pelo frame
  const sweepPos = ((frame * 0.6) % 200) - 50; // -50 → 150

  return (
    <AbsoluteFill
      style={{
        perspective: 2600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: phoneWidth,
          height: phoneHeight,
          transform: `translate(${translateX}px, ${translateY}px) rotateY(${tiltY}deg) rotateX(${tiltX}deg) scale(${scale})`,
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {/* Contact shadow — perto do "chao" */}
        <div
          style={{
            position: 'absolute',
            left: '10%',
            right: '10%',
            bottom: -20,
            height: 60,
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, transparent 60%)',
            filter: 'blur(20px)',
            zIndex: -2,
          }}
        />
        {/* Ambient shadow — suave, amplo */}
        <div
          style={{
            position: 'absolute',
            inset: -80,
            borderRadius: outerRadius + 80,
            background: 'radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0.5) 0%, transparent 70%)',
            filter: 'blur(60px)',
            zIndex: -1,
          }}
        />

        {/* FRAME EXTERNO — Titanio natural (warm gray / beige) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: outerRadius,
            background: `
              linear-gradient(135deg,
                #a8a19a 0%,
                #d4cfc7 15%,
                #8d847b 30%,
                #a39a91 45%,
                #756b61 60%,
                #9a9089 75%,
                #b8b1a8 90%,
                #7d756c 100%
              )
            `,
            boxShadow: `
              0 40px 100px rgba(0,0,0,0.5),
              0 15px 40px rgba(0,0,0,0.35),
              inset 0 0 0 1px rgba(255,255,255,0.15),
              inset 0 2px 3px rgba(255,255,255,0.3),
              inset 0 -2px 3px rgba(0,0,0,0.4)
            `,
          }}
        />
        {/* Light sweep (luz viajando pelo titanio) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: outerRadius,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${sweepPos}%`,
              width: 120,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
              transform: 'skewX(-12deg)',
              filter: 'blur(2px)',
            }}
          />
        </div>

        {/* Inner edge (borda interna do titanio — "ring" mais escuro) */}
        <div
          style={{
            position: 'absolute',
            inset: bezel * 0.6,
            borderRadius: outerRadius * 0.92,
            boxShadow: 'inset 0 0 0 1.5px rgba(0,0,0,0.45), inset 0 0 10px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
          }}
        />

        {/* SCREEN */}
        <div
          style={{
            position: 'absolute',
            top: bezel,
            left: bezel,
            right: bezel,
            bottom: bezel,
            borderRadius: innerRadius,
            overflow: 'hidden',
            background: '#000',
            boxShadow: 'inset 0 0 0 2px #000, inset 0 0 12px rgba(0,0,0,0.5)',
          }}
        >
          {children}
          {/* Reflexo superior da tela */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 25%, transparent 70%, rgba(255,255,255,0.06) 100%)',
            }}
          />
          {/* Glare sutil seguindo tilt */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${50 + tiltY * 4}%`,
              width: '60%',
              height: '40%',
              transform: 'translateX(-50%)',
              background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.08), transparent 60%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* DYNAMIC ISLAND (pill preta central) */}
        <DynamicIsland
          width={diWidth}
          height={diHeight}
          top={diTop}
          phoneWidth={phoneWidth}
        />

        {/* SIDE BUTTONS */}
        {/* Action Button (esquerda-topo) */}
        <SideButton side="left" topPercent={0.135} heightPx={phoneHeight * 0.028} width={4} radius={2} />
        {/* Volume Up */}
        <SideButton side="left" topPercent={0.20} heightPx={phoneHeight * 0.055} width={4} radius={2} />
        {/* Volume Down */}
        <SideButton side="left" topPercent={0.275} heightPx={phoneHeight * 0.055} width={4} radius={2} />

        {/* Power Button (direita-topo) */}
        <SideButton side="right" topPercent={0.175} heightPx={phoneHeight * 0.08} width={4} radius={2} />
        {/* Camera Control (direita-inferior — novidade iPhone 16) */}
        <SideButton side="right" topPercent={0.38} heightPx={phoneHeight * 0.05} width={5} radius={1} highlight />
      </div>
    </AbsoluteFill>
  );
}

function DynamicIsland({ width, height, top, phoneWidth }: { width: number; height: number; top: number; phoneWidth: number }) {
  const frame = useCurrentFrame();
  // Pulsacao sutil — breathing
  const pulse = 1 + 0.015 * Math.sin(frame * 0.08);
  // Subtle "activity" — a small dot inside the island that moves
  const dotX = Math.sin(frame * 0.1) * (width * 0.15);

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: '50%',
        transform: `translateX(-50%) scale(${pulse})`,
        width,
        height,
        borderRadius: height / 2,
        background: '#000',
        boxShadow: `
          0 2px 6px rgba(0,0,0,0.9),
          inset 0 0 0 1px rgba(30,30,35,0.8),
          inset 0 2px 3px rgba(0,0,0,0.9)
        `,
        zIndex: 10,
      }}
    >
      {/* Camera lens */}
      <div
        style={{
          position: 'absolute',
          right: height * 0.25,
          top: '50%',
          transform: 'translateY(-50%)',
          width: height * 0.45,
          height: height * 0.45,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #2a2a2e 0%, #000 40%)',
          boxShadow: 'inset 0 0 2px rgba(255,255,255,0.15)',
        }}
      />
      {/* Activity dot */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${dotX}px), -50%)`,
          width: height * 0.25,
          height: height * 0.25,
          borderRadius: '50%',
          background: '#58a6ff',
          opacity: 0.4 + 0.4 * Math.sin(frame * 0.12),
          filter: 'blur(1px)',
        }}
      />
    </div>
  );
}

function SideButton({
  side, topPercent, heightPx, width, radius, highlight,
}: { side: 'left' | 'right'; topPercent: number; heightPx: number; width: number; radius: number; highlight?: boolean }) {
  const pos = side === 'left' ? { left: -width + 1 } : { right: -width + 1 };
  return (
    <div
      style={{
        position: 'absolute',
        top: `${topPercent * 100}%`,
        ...pos,
        width,
        height: heightPx,
        borderRadius: radius,
        background: highlight
          ? 'linear-gradient(90deg, #e8e1d7 0%, #9a9089 50%, #6d6459 100%)'
          : 'linear-gradient(90deg, #7d756c 0%, #4a433c 100%)',
        boxShadow: highlight
          ? '0 0 6px rgba(232,225,215,0.4), inset 0 1px 1px rgba(255,255,255,0.35)'
          : 'inset 0 1px 1px rgba(255,255,255,0.12), 0 1px 2px rgba(0,0,0,0.4)',
      }}
    />
  );
}

// ───────────────────────────────────────────────────────────────────────
// MacBook Pro M4 (Space Black)
// ───────────────────────────────────────────────────────────────────────

function MacBookProM4({ tiltX, tiltY, translateX, translateY, scale, format, children }: any) {
  const screenWidth = format === 'horizontal' ? 1640 : 960;
  const screenHeight = screenWidth * (10 / 16);  // 10:16 da tela MBP
  const baseWidth = screenWidth * 1.08;
  const baseHeight = 42;
  const bezel = 14; // bezel fino da MBP M4
  const hingeGap = 8;
  const notchWidth = screenWidth * 0.13;
  const notchHeight = 16;

  return (
    <AbsoluteFill
      style={{
        perspective: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          transform: `translate(${translateX}px, ${translateY}px) rotateY(${tiltY}deg) rotateX(${tiltX * 0.6}deg) scale(${scale})`,
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {/* Screen body — Space Black */}
        <div
          style={{
            width: screenWidth,
            height: screenHeight,
            borderRadius: 18,
            padding: bezel,
            background: `
              linear-gradient(145deg,
                #2a2a2d 0%,
                #1a1a1c 25%,
                #0f0f11 50%,
                #18181a 75%,
                #242426 100%
              )
            `,
            boxShadow: `
              0 50px 120px rgba(0,0,0,0.7),
              0 15px 35px rgba(0,0,0,0.45),
              inset 0 0 0 1px rgba(255,255,255,0.06),
              inset 0 2px 2px rgba(255,255,255,0.08)
            `,
            position: 'relative',
          }}
        >
          {/* Tela */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 6,
              overflow: 'hidden',
              background: '#000',
              position: 'relative',
            }}
          >
            {children}
            {/* Glare de tela */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'linear-gradient(115deg, rgba(255,255,255,0.1) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.05) 100%)',
              }}
            />
          </div>

          {/* Notch no centro-topo */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: notchWidth,
              height: notchHeight,
              background: '#000',
              borderRadius: '0 0 8px 8px',
              zIndex: 5,
            }}
          >
            {/* Webcam dentro do notch */}
            <div
              style={{
                position: 'absolute',
                top: 4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 30%, #2a2a2e 0%, #000 50%)',
              }}
            />
          </div>
        </div>

        {/* Hinge */}
        <div
          style={{
            width: baseWidth,
            height: hingeGap,
            background: 'linear-gradient(180deg, #1a1a1c 0%, #0a0a0c 100%)',
            margin: '0 auto',
            borderRadius: '0 0 6px 6px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        />

        {/* Keyboard base — Space Black com refinamentos */}
        <div
          style={{
            width: baseWidth,
            height: baseHeight,
            margin: '0 auto',
            background: `
              linear-gradient(180deg,
                #2a2a2d 0%,
                #1c1c1f 40%,
                #111113 100%
              )
            `,
            borderRadius: '0 0 18px 18px',
            boxShadow: `
              0 40px 80px rgba(0,0,0,0.55),
              0 10px 25px rgba(0,0,0,0.3),
              inset 0 1px 0 rgba(255,255,255,0.08)
            `,
            position: 'relative',
          }}
        >
          {/* Trackpad bar (sugestao do trackpad) */}
          <div
            style={{
              position: 'absolute',
              bottom: 7,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '22%',
              height: 3,
              borderRadius: 1.5,
              background: 'rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.4)',
            }}
          />
          {/* Contact shadow entre tela e base */}
          <div
            style={{
              position: 'absolute',
              top: -2,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)',
            }}
          />
        </div>

        {/* Contact shadow abaixo */}
        <div
          style={{
            position: 'absolute',
            bottom: -70,
            left: '50%',
            transform: 'translateX(-50%)',
            width: baseWidth * 0.85,
            height: 70,
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 70%)',
            filter: 'blur(35px)',
            zIndex: -1,
          }}
        />
      </div>
    </AbsoluteFill>
  );
}
