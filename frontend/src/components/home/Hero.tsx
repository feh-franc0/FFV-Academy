'use client';

import { ClaudeTerminal } from './ClaudeTerminal';
import { Counter } from './Counter';
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
      {/* Aurora animada — blobs de cor à deriva, desfocados (profundidade viva) */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="ffv-aurora absolute rounded-full"
          style={{
            top: '-14%', left: '-6%', width: 560, height: 560,
            background: 'radial-gradient(circle, color-mix(in srgb, var(--ffv-blue) 42%, transparent) 0%, transparent 68%)',
            filter: 'blur(64px)', opacity: 0.55,
          }}
        />
        <div
          className="ffv-aurora absolute rounded-full"
          style={{
            top: '8%', right: '-10%', width: 500, height: 500,
            background: 'radial-gradient(circle, color-mix(in srgb, var(--ffv-purple) 38%, transparent) 0%, transparent 68%)',
            filter: 'blur(72px)', opacity: 0.45, animationDelay: '-7s',
          }}
        />
        <div
          className="ffv-aurora absolute rounded-full"
          style={{
            bottom: '-18%', left: '30%', width: 460, height: 460,
            background: 'radial-gradient(circle, color-mix(in srgb, var(--ffv-cyan) 30%, transparent) 0%, transparent 70%)',
            filter: 'blur(80px)', opacity: 0.32, animationDelay: '-13s',
          }}
        />
      </div>
      {/* Grid técnico sutil que desvanece — profundidade sem ruído */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--ffv-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--ffv-grid-line) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          maskImage: 'radial-gradient(ellipse 75% 65% at 30% 0%, black 0%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 30% 0%, black 0%, transparent 72%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        <div className="ffv-stagger">
          <div className="flex items-center gap-2 mb-5">
            <StatusBadge tone="live">ATIVO · CONTEÚDO NOVO TODA SEMANA</StatusBadge>
          </div>

          <p
            className="font-mono uppercase tracking-widest text-xs mb-4"
            style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}
          >
            A escola de engenharia para a era da IA
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
            Aprenda a construir com IA, Claude e AWS{' '}
            <span
              className="ffv-shimmer-text"
              style={{
                background:
                  'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple), var(--ffv-cyan), var(--ffv-purple), var(--ffv-blue))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              como engenheiro — não como usuário de hype.
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
            {totalArticles}+ artigos com os internals de verdade — Claude Code, agents, RAG, MCP e
            AWS em produção — em trilhas do zero ao avançado. Gamificado com XP, streak, ranking e
            revisão espaçada real (SM-2). <strong style={{ color: 'var(--foreground)' }}>100%
            gratuito</strong>, em português.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            {isReturning && lastArticle ? (
              <>
                <FfvButton href={lastArticle.href} variant="primary" size="lg" className="ffv-shine">
                  Continuar: {lastArticle.title.length > 32 ? lastArticle.title.slice(0, 32) + '…' : lastArticle.title} →
                </FfvButton>
                <FfvButton href="/mapa" variant="secondary" size="lg">
                  Explorar trilhas
                </FfvButton>
              </>
            ) : (
              <>
                <span className="relative inline-flex">
                  <span
                    aria-hidden
                    className="ffv-glow-pulse"
                    style={{
                      position: 'absolute', inset: -5, borderRadius: 16, zIndex: 0,
                      background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
                      filter: 'blur(16px)', opacity: 0.55,
                    }}
                  />
                  {!isLoggedIn ? (
                    <FfvButton
                      onClick={() => requireLogin('criar sua conta na FFV Academy').catch(() => {})}
                      variant="primary"
                      size="lg"
                      className="ffv-shine relative z-10"
                    >
                      Criar conta grátis →
                    </FfvButton>
                  ) : (
                    <FfvButton href="/mapa" variant="primary" size="lg" className="ffv-shine relative z-10">
                      Explorar trilhas →
                    </FfvButton>
                  )}
                </span>
                <FfvButton href="/mapa" variant="secondary" size="lg">
                  Ver o currículo
                </FfvButton>
              </>
            )}
          </div>

          {!isReturning && (
            <div className="flex items-center gap-6 mt-8 flex-wrap">
              <StatPill value={<Counter to={totalArticles} suffix="+" />} label="artigos" />
              <Divider />
              <StatPill value={<Counter to={totalTrails} />} label="trilhas" />
              <Divider />
              <StatPill value={<Counter to={90} suffix="+" />} label="badges" />
              <Divider />
              <StatPill value="SM-2" label="revisão espaçada" />
            </div>
          )}
        </div>

        <div className="lg:hidden mt-4">
          <ClaudeTerminal />
        </div>
        <div className="hidden lg:block ffv-float">
          <ClaudeTerminal />
        </div>
      </div>
    </section>
  );
}

function StatPill({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <span className="flex flex-col">
      <span className="text-base font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>{value}</span>
      <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{label}</span>
    </span>
  );
}

function Divider() {
  return <span className="h-6 w-px" style={{ background: 'var(--ffv-border)' }} />;
}
