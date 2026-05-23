import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'FFV Academy — IA que transforma seus PDFs em uma escola completa em 24h';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #faf6ee 0%, #f5efe1 50%, #ede5cf 100%)',
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
        {/* Top-right amber glow */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '560px',
            height: '560px',
            background: 'radial-gradient(circle, rgba(184,131,90,0.20) 0%, transparent 70%)',
          }}
        />
        {/* Bottom-left sage glow */}
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '420px',
            height: '420px',
            background: 'radial-gradient(circle, rgba(94,128,104,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Logo + kicker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '48px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '16px',
              background: '#1f3a30',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
              fontSize: '24px',
              fontWeight: '800',
              letterSpacing: '-1px',
            }}
          >
            FFV
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '26px', fontWeight: '700', color: '#1f3a30' }}>
              FFV Academy
            </span>
            <span style={{ fontSize: '13px', color: '#5f6b62', letterSpacing: '2px', fontWeight: '600' }}>
              IA · CURADORIA · 24H · PT-BR
            </span>
          </div>
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontSize: '64px',
            fontWeight: '800',
            color: '#1f3a30',
            lineHeight: '1.05',
            margin: '0 0 28px 0',
            maxWidth: '900px',
            letterSpacing: '-2px',
          }}
        >
          IA que transforma seus PDFs em <span style={{ color: '#b8835a', fontStyle: 'italic' }}>uma escola completa</span> em 24h.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '24px',
            color: '#5f6b62',
            margin: '0 0 44px 0',
            maxWidth: '820px',
            lineHeight: '1.45',
            fontWeight: '400',
          }}
        >
          Trilhas sequenciais · Quiz integrado · Revisão espaçada SM-2. Não é chatbot — é a sua escola.
        </p>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: '14px' }}>
          {[
            { label: 'Tecnologia · 157 módulos', color: '#1e3a8a' },
            { label: 'Medicina Vet · 12 módulos', color: '#5e8068' },
            { label: 'Gratuito V1', color: '#b8835a' },
            { label: 'PT-BR', color: '#1f3a30' },
          ].map(({ label, color }) => (
            <div
              key={label}
              style={{
                padding: '10px 18px',
                borderRadius: '999px',
                border: `1.5px solid ${color}`,
                background: `${color}14`,
                color,
                fontSize: '15px',
                fontWeight: '700',
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
