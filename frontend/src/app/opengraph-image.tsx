import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'FFV Academy — Escola de Engenharia para a Era da IA';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Top-right glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Bottom-left glow */}
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
              border: '2px solid rgba(56,189,248,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: '800',
              letterSpacing: '-1px',
            }}
          >
            FFV
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                fontSize: '24px',
                fontWeight: '700',
                background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              FFV Academy
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', letterSpacing: '2px', fontWeight: '600' }}>
              ENGENHARIA · IA · AWS
            </span>
          </div>
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontSize: '64px',
            fontWeight: '800',
            color: '#f1f5f9',
            lineHeight: '1.1',
            margin: '0 0 24px 0',
            maxWidth: '800px',
            letterSpacing: '-2px',
          }}
        >
          Escola de Engenharia para a Era da IA
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            margin: '0 0 48px 0',
            maxWidth: '700px',
            lineHeight: '1.5',
            fontWeight: '400',
          }}
        >
          Zero hype. Arquitetura real. 38 trilhas gamificadas — IA na AWS, arquitetura de solução e produção.
        </p>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {/*
            Números conferidos contra o CURRICULUM por `numeros-publicos.test.ts`.
            Diziam "17 trilhas" e "570+ módulos" — a imagem que TODO link
            compartilhado do site mostrava anunciava um catálogo que não existia
            (nem para mais, nem para menos: 38 trilhas e 490 módulos).
          */}
          {[
            { label: '38 trilhas', color: '#38bdf8' },
            { label: '490 módulos', color: '#818cf8' },
            { label: '100% gratuito', color: '#a78bfa' },
            { label: 'XP + revisão espaçada', color: '#34d399' },
          ].map(({ label, color }) => (
            <div
              key={label}
              style={{
                padding: '10px 20px',
                borderRadius: '999px',
                border: `1px solid ${color}40`,
                background: `${color}10`,
                color,
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
