'use client';

import { GameDemo } from './GameDemo';
import { FfvButton } from '@/components/ui/ffv-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useGameState } from '@/hooks/useGameState';
import { useActiveBase } from '@/components/base/ActiveBaseContext';
import { selectLastArticleForBase, selectCompletedForBase } from '@/lib/bases/state-selectors';

/**
 * Hero — header da página índice de uma base de conhecimento.
 *
 * Todos os textos e CTAs são parametrizáveis via props. Defaults são da base
 * de Tecnologia (mantém o comportamento existente). Outras bases (medvet,
 * direito, design...) passam seus próprios textos.
 *
 * O bloco "continuar de onde parou" só aparece se o GameDemo for habilitado
 * (significa que essa base usa o sistema de gamificação global).
 */

interface StatItem {
  value: string;
  label: string;
}

interface CtaItem {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'gold';
}

export interface HeroProps {
  /** Texto pequeno em monospace antes do badge. Default: kicker de tecnologia. */
  kicker?: string;
  /** Badge "no ar" no topo. */
  badgeText?: string;
  /** Título principal — string ou JSX (suporta spans coloridos). */
  title?: React.ReactNode;
  /** Descrição abaixo do título. */
  description?: string;
  /** CTAs (1 ou 2). */
  ctas?: CtaItem[];
  /** Stats no rodapé. Se omitido, usa defaults de tecnologia. */
  stats?: StatItem[];
  /** Habilita o GameDemo à direita (só faz sentido para bases com gamificação ligada). */
  showGameDemo?: boolean;
  /** Compat: stats default de tecnologia */
  totalArticles?: number;
  totalTrails?: number;
}

const DEFAULT_KICKER = 'Tecnologia · Base de conhecimento';
const DEFAULT_BADGE = 'BASE DE TECNOLOGIA · GERADA EM 2026';

export function Hero({
  kicker = DEFAULT_KICKER,
  badgeText = DEFAULT_BADGE,
  title,
  description,
  ctas,
  stats,
  showGameDemo = true,
  totalArticles,
  totalTrails,
}: HeroProps) {
  const { state } = useGameState();
  // Filtra lastArticle e completedModules pela base ativa pra não vazar
  // "continuar Postgres MVCC" pra usuário em medvet (e vice-versa).
  const { base: activeBase } = useActiveBase();
  const lastArticle = selectLastArticleForBase(state?.lastArticle, activeBase.slug);
  const completedInBase = selectCompletedForBase(state?.completedModules ?? [], activeBase.slug);
  const isReturning = !!lastArticle && completedInBase.length > 0;

  // Default title/description/ctas/stats de tecnologia
  const finalTitle = title ?? (
    <>
      Aprenda IA, AWS e engenharia de software{' '}
      <span style={{ color: 'var(--ffv-blue)' }}>como engenheiro — não como consumidor de hype.</span>
    </>
  );

  const finalDescription =
    description ??
    'Esta é a base de Tecnologia da FFV Academy: trilhas, módulos, questões e revisão espaçada cobrindo IA, AWS, sistemas distribuídos, engenharia de software, dados e frontend. Tudo gratuito, em PT-BR e gamificado de verdade.';

  const finalCtas: CtaItem[] = ctas ?? [
    { href: '#comecar-aqui', label: 'Começar por aqui →', variant: 'primary' },
    { href: '/mapa', label: 'Ver o mapa de trilhas', variant: 'secondary' },
  ];

  const finalStats: StatItem[] = stats ?? [
    { value: `${totalArticles ?? 0}+`, label: 'módulos' },
    { value: `${totalTrails ?? 0}`, label: 'trilhas' },
    { value: '8', label: 'hubs' },
    { value: 'R$ 0', label: 'custo' },
  ];

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

      <div
        className={
          showGameDemo
            ? 'relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr,1fr] gap-12 items-center'
            : 'relative max-w-6xl mx-auto'
        }
      >
        <div>
          <div className="flex items-center gap-2 mb-5">
            <StatusBadge tone="live">{badgeText}</StatusBadge>
          </div>

          <p
            className="font-mono uppercase tracking-widest text-xs mb-4"
            style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}
          >
            {kicker}
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
            {finalTitle}
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)',
              color: 'var(--ffv-muted)',
              lineHeight: 1.7,
              maxWidth: 560,
              marginBottom: 28,
            }}
          >
            {finalDescription}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            {finalCtas.map((cta, i) => (
              <FfvButton
                key={cta.href + i}
                href={cta.href}
                variant={cta.variant ?? (i === 0 ? 'primary' : 'secondary')}
                size="lg"
              >
                {cta.label}
              </FfvButton>
            ))}
          </div>

          {showGameDemo && isReturning && lastArticle && (
            <div
              className="mt-6 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
              style={{
                background: 'var(--ffv-bg2)',
                border: '1px solid var(--ffv-border)',
                color: 'var(--ffv-muted)',
              }}
            >
              <span>👋 Bem-vindo de volta —</span>
              <a href={lastArticle.href} className="font-semibold" style={{ color: 'var(--ffv-blue)' }}>
                continuar &ldquo;{lastArticle.title.length > 28 ? lastArticle.title.slice(0, 28) + '…' : lastArticle.title}&rdquo; →
              </a>
            </div>
          )}

          {(!showGameDemo || !isReturning) && finalStats.length > 0 && (
            <div className="flex items-center gap-6 mt-8 flex-wrap">
              {finalStats.map((s, i) => (
                <span key={s.label} className="contents">
                  <StatPill value={s.value} label={s.label} />
                  {i < finalStats.length - 1 && <Divider />}
                </span>
              ))}
            </div>
          )}
        </div>

        {showGameDemo && (
          <>
            <div className="lg:hidden">
              <GameDemo compact />
            </div>
            <div className="hidden lg:block">
              <GameDemo />
            </div>
          </>
        )}
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
