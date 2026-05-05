'use client';

import { FfvButton } from '@/components/ui/ffv-button';

export function FinalCta() {
  return (
    <section
      className="px-6 py-24 relative overflow-hidden"
      style={{ borderTop: '1px solid var(--ffv-border)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 100%, color-mix(in srgb, var(--ffv-blue) 15%, transparent) 0%, transparent 70%)',
        }}
      />
      <div className="relative max-w-3xl mx-auto text-center">
        <h2
          style={{
            fontSize: 'var(--text-5xl)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 16,
            lineHeight: 1.15,
          }}
        >
          Vire um dos profissionais mais qualificados
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            da nova era da IA no digital.
          </span>
        </h2>
        <p
          style={{
            fontSize: 16,
            color: 'var(--ffv-muted)',
            maxWidth: 540,
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}
        >
          IA, AWS, engenharia, comunicação, carreira e empreendedorismo digital — em uma plataforma
          gamificada. Comece agora, ganhe XP, suba no ranking.
        </p>

        <FfvButton href="/mapa" variant="primary" size="xl">
          Começar agora — é gratuito →
        </FfvButton>

        <p
          className="font-mono mt-5 text-xs"
          style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}
        >
          SEM CADASTRO · SEM E-MAIL OBRIGATÓRIO · SEM PAYWALL
        </p>
      </div>
    </section>
  );
}
