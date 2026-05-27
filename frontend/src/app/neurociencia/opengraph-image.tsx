import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'FFV Academy · Neurociência aplicada ao Marketing — 8 módulos gratuitos';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function NeurocienciaOG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #faf8ff 0%, #ede4fb 50%, #e2d4f7 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Violet glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(124,58,237,0.30) 0%, transparent 70%)',
          }}
        />
        {/* Pink glow */}
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 70%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              background: '#2a1a4a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
            }}
          >
            🧠
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', color: '#6b5b8a', letterSpacing: '2px', fontWeight: '700' }}>
              BASE FFV · NO AR
            </span>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#2a1a4a' }}>
              Neurociência
            </span>
          </div>
        </div>

        {/*
          IMPORTANTE: Satori (motor por trás de next/og) NÃO suporta
          `<span>` inline mesclando estilos diferentes na mesma linha sem
          glitch — letras se sobrepunham (visto em compartilhamento WhatsApp
          em 2026-05-26). Solução: quebrar em duas linhas separadas (sem
          spans inline), fontSize menor + maxWidth full pra word-wrap natural.
        */}
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '1056px' }}>
          <h1
            style={{
              fontSize: '54px',
              fontWeight: 800,
              color: '#2a1a4a',
              lineHeight: 1.1,
              margin: '0 0 8px 0',
              letterSpacing: '-1.5px',
            }}
          >
            Como o cérebro humano decide comprar
          </h1>
          <p
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#7c3aed',
              lineHeight: 1.15,
              margin: '0 0 28px 0',
              letterSpacing: '-0.5px',
              fontStyle: 'italic',
            }}
          >
            com profundidade real.
          </p>
        </div>

        <p
          style={{
            fontSize: '22px',
            color: '#5a4e80',
            margin: '0 0 40px 0',
            maxWidth: '950px',
            lineHeight: 1.45,
          }}
        >
          Kahneman, Cialdini, Schultz, Knutson — 8 módulos com exemplos
          do dia a dia, analogias lúdicas e exercícios. Gratuito.
        </p>

        <div style={{ display: 'flex', gap: '14px', marginTop: 'auto' }}>
          {[
            { label: '8 módulos', color: '#7c3aed' },
            { label: 'Sistema 1/2', color: '#ec4899' },
            { label: 'Cialdini', color: '#f59e0b' },
            { label: 'Neuropricing', color: '#06b6d4' },
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
