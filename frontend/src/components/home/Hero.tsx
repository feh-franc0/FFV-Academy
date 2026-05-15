'use client';

import { GameDemo } from './GameDemo';
import { FfvButton } from '@/components/ui/ffv-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';

export function Hero({ totalArticles, totalTrails }: { totalArticles: number; totalTrails: number }) {
  const { state } = useGameState();
  const { isLoggedIn, requireLogin } = useAuth();
  const lastArticle = state?.lastArticle;
  const isReturning = !!lastArticle && (state?.completedModules?.length ?? 0) > 0;

  return (
    <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
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
          <div className="flex items-center gap-2 mb-5">
            <StatusBadge tone="live">ATIVO · NOVOS ARTIGOS TODA SEMANA</StatusBadge>
          </div>

          <p
            className="font-mono uppercase tracking-widest text-xs mb-4"
            style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}
          >
            Para devs que levam a carreira a sério
          </p>

          <h1
            style={{
              fontSize: 'var(--text-hero)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              marginBottom: 20,
            }}
          >
            Aprenda IA, AWS e engenharia{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              como engenheiro. Não como usuário de hype.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)',
              color: 'var(--ffv-muted)',
              lineHeight: 1.7,
              maxWidth: 540,
              marginBottom: 28,
            }}
          >
            {totalArticles}+ artigos técnicos em {totalTrails} trilhas — os internals reais de
            transformers, sistemas distribuídos, RAG, AWS e muito mais. Gamificado com XP, badges e
            ranking. 100% gratuito.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            {isReturning && lastArticle ? (
              <>
                <FfvButton href={lastArticle.href} variant="primary" size="lg">
                  Continuar: {lastArticle.title.length > 32 ? lastArticle.title.slice(0, 32) + '…' : lastArticle.title} →
                </FfvButton>
                <FfvButton href="/mapa" variant="secondary" size="lg">
                  Explorar trilhas
                </FfvButton>
              </>
            ) : (
              <>
                {!isLoggedIn ? (
                  <FfvButton
                    onClick={() => requireLogin('criar sua conta na FFV Academy').catch(() => {})}
                    variant="primary"
                    size="lg"
                  >
                    Criar conta grátis →
                  </FfvButton>
                ) : (
                  <FfvButton href="/mapa" variant="primary" size="lg">
                    Explorar trilhas →
                  </FfvButton>
                )}
                <FfvButton href="/mapa" variant="secondary" size="lg">
                  Ver o currículo
                </FfvButton>
              </>
            )}
          </div>

          {!isReturning && (
            <div className="flex items-center gap-6 mt-8 flex-wrap">
              <StatPill value={`${totalArticles}+`} label="artigos" />
              <Divider />
              <StatPill value={`${totalTrails}`} label="trilhas" />
              <Divider />
              <StatPill value="128+" label="badges" />
              <Divider />
              <StatPill value="SM-2" label="revisão espaçada" />
            </div>
          )}
        </div>

        <div className="lg:hidden">
          <GameDemo compact />
        </div>
        <div className="hidden lg:block">
          <GameDemo />
        </div>
      </div>
    </section>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex flex-col">
      <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{value}</span>
      <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{label}</span>
    </span>
  );
}

function Divider() {
  return <span className="h-6 w-px" style={{ background: 'var(--ffv-border)' }} />;
}
