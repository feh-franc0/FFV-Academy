import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'FFV Academy · Medicina Veterinária — Genética Animal · 16 módulos gratuitos';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function MedvetOG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #fbf7f0 0%, #f5efe0 50%, #ede5cf 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Sage glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(138,155,126,0.30) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(176,137,104,0.20) 0%, transparent 70%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              background: '#2d4a3e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
            }}
          >
            🐾
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', color: '#6b6358', letterSpacing: '2px', fontWeight: '700' }}>
              BASE FFV · NO AR
            </span>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#2d4a3e' }}>
              Medicina Veterinária
            </span>
          </div>
        </div>

        <h1
          style={{
            fontSize: '64px',
            fontWeight: '800',
            color: '#2d4a3e',
            lineHeight: '1.05',
            margin: '0 0 24px 0',
            maxWidth: '1000px',
            letterSpacing: '-1.5px',
          }}
        >
          Genética Animal <span style={{ color: '#8a9b7e', fontStyle: 'italic' }}>com profundidade real</span> — não decoreba.
        </h1>

        <p
          style={{
            fontSize: '22px',
            color: '#5f6b62',
            margin: '0 0 40px 0',
            maxWidth: '900px',
            lineHeight: '1.45',
          }}
        >
          Das Leis de Mendel ao melhoramento animal. 16 módulos · simulado de 100 questões · revisão espaçada SM-2. Gratuito.
        </p>

        <div style={{ display: 'flex', gap: '14px', marginTop: 'auto' }}>
          {[
            { label: '16 módulos', color: '#8a9b7e' },
            { label: 'Simulado 100q', color: '#b08968' },
            { label: 'Hardy-Weinberg', color: '#5e8068' },
            { label: 'Mendel & Melhoramento', color: '#2d4a3e' },
          ].map(({ label, color }) => (
            <div
              key={label}
              style={{
                padding: '11px 20px',
                borderRadius: '999px',
                border: `1.5px solid ${color}`,
                background: `${color}1a`,
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
