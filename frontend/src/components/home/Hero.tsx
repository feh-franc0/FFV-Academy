'use client';

import { GameDemo } from './GameDemo';
import { FfvButton } from '@/components/ui/ffv-button';
import { StatusBadge } from '@/components/ui/status-badge';

export function Hero({ totalArticles, totalTrails }: { totalArticles: number; totalTrails: number }) {
  return (
    <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-24 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 45% at 25% 10%, var(--ffv-hero-glow) 0%, transparent 65%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr,1fr] gap-12 items-center">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <StatusBadge tone="live">ATIVO · NOVOS ARTIGOS TODA SEMANA</StatusBadge>
          </div>

          <h1
            className="font-bold"
            style={{
              fontSize: 'var(--text-hero)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 20,
            }}
          >
            Vire um dos profissionais mais qualificados da{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              nova era da IA no digital.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)',
              color: 'var(--ffv-muted)',
              lineHeight: 1.65,
              maxWidth: 560,
              marginBottom: 28,
            }}
          >
            IA, AWS, engenharia, comunicação, carreira e empreendedorismo digital — em uma plataforma
            gamificada com XP, badges e ranking. {totalArticles}+ artigos técnicos em {totalTrails} trilhas,
            100% gratuito.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <FfvButton href="/mapa" variant="primary" size="lg">
              Começar agora — é gratuito →
            </FfvButton>
            <FfvButton href="/progresso" variant="secondary" size="lg">
              Ver meu progresso
            </FfvButton>
          </div>
        </div>

        {/* Mobile: GameDemo só após CTAs, com versão compacta */}
        <div className="lg:hidden">
          <GameDemo compact />
        </div>
        {/* Desktop: GameDemo completo na coluna direita */}
        <div className="hidden lg:block">
          <GameDemo />
        </div>
      </div>
    </section>
  );
}

