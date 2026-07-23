import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'FFV Academy · Tecnologia — 157 módulos gratuitos · IA, AWS, Engenharia';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TechOG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(56,189,248,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.05) 1px, transparent 1px)',
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
            background: 'radial-gradient(circle, rgba(129,140,248,0.20) 0%, transparent 70%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
              border: '2px solid #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              fontSize: '32px',
            }}
          >
            💻
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', letterSpacing: '2px', fontWeight: '700' }}>
              BASE FFV · NO AR
            </span>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9' }}>
              Tecnologia
            </span>
          </div>
        </div>

        <h1
          style={{
            fontSize: '68px',
            fontWeight: '800',
            color: '#f1f5f9',
            lineHeight: '1.05',
            margin: '0 0 24px 0',
            maxWidth: '1000px',
            letterSpacing: '-2px',
          }}
        >
          Engenharia para a era da IA — <span style={{ color: '#38bdf8' }}>sem hype.</span>
        </h1>

        <p
          style={{
            fontSize: '22px',
            color: '#cbd5e1',
            margin: '0 0 40px 0',
            maxWidth: '900px',
            lineHeight: '1.45',
          }}
        >
          IA aplicada · AWS · Sistemas distribuídos · Dados · Frontend · Backend. Profundidade real, gratuito em PT-BR.
        </p>

        <div style={{ display: 'flex', gap: '14px', marginTop: 'auto' }}>
          {[
            { label: '157 módulos', color: '#38bdf8' },
            { label: '16 trilhas', color: '#818cf8' },
            { label: 'SRS · SM-2', color: '#a78bfa' },
            { label: '128+ badges', color: '#34d399' },
          ].map(({ label, color }) => (
            <div
              key={label}
              style={{
                padding: '11px 20px',
                borderRadius: '999px',
                border: `1.5px solid ${color}80`,
                background: `${color}1a`,
                color,
                fontSize: '16px',
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
