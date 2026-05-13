'use client';
import { safeJsonLd } from '@/lib/safe-json';

import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import { Progress } from '@/components/ui/progress';
import { type Trail } from '@/lib/curriculum';

interface Props {
  trail: Trail;
}

import { TrailActions } from './TrailActions';

export function TrailBlogClient({ trail }: Props) {
  const { state, trailsProgress } = useGameState();

  const trailProgress = trailsProgress.find(t => t.id === trail.id);
  const completedModules = state?.completedModules ?? [];
  const totalXP = trail.modules.reduce((acc, m) => acc + m.xp, 0);

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: trail.name,
    description: trail.desc,
    provider: {
      '@type': 'Organization',
      name: 'FFV Academy',
      url: 'https://fernandofrancovalle.com',
    },
    url: trail.href ? `https://fernandofrancovalle.com${trail.href}` : 'https://fernandofrancovalle.com',
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    numberOfCredits: trail.modules.length,
    hasCourseInstance: trail.modules.slice(0, 5).map(m => ({
      '@type': 'CourseInstance',
      name: m.title,
      url: `https://fernandofrancovalle.com/aprenda/${m.slug}`,
      courseMode: 'online',
    })),
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(courseJsonLd) }} />

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-xs pt-10 mb-8" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" className="hover:text-white transition-colors">FFV Academy</Link>
        <span>/</span>
        <span style={{ color: trail.color }}>{trail.name}</span>
      </nav>

      {/* ── Header do blog ── */}
      <header className="pb-10" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: `${trail.color}15`, border: `1px solid ${trail.color}25` }}
          >
            {trail.icon}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: trail.color }}>
              Blog
            </p>
            <h1 className="text-xl font-bold">{trail.name}</h1>
          </div>
        </div>

        <p className="text-sm leading-7 mb-6" style={{ color: 'var(--ffv-muted)' }}>
          {trail.id === 'trail1'
            ? 'O ponto de partida. Aqui você vai entender o que a IA realmente é — sem buzzwords, sem exagero. Cada artigo constrói sobre o anterior, do conceito até a arquitetura que move o mundo hoje.'
            : 'Para quem já sabe o básico e quer ir fundo. Aqui o assunto é como os modelos funcionam em produção: memória, roteamento, ferramentas, agentes. O lado técnico que pouca gente explica direito.'}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <div>
            <span className="font-bold" style={{ color: trail.color }}>{trail.modules.length}</span>
            <span className="ml-1" style={{ color: 'var(--ffv-muted)' }}>artigos</span>
          </div>
          <div>
            <span className="font-bold" style={{ color: trail.color }}>{totalXP}</span>
            <span className="ml-1" style={{ color: 'var(--ffv-muted)' }}>XP total</span>
          </div>
          {trailProgress && trailProgress.done > 0 && (
            <div className="flex items-center gap-2 flex-1 min-w-32">
              <Progress value={trailProgress.pct} className="h-1.5 flex-1" />
              <span className="text-xs tabular-nums" style={{ color: trail.color }}>
                {trailProgress.done}/{trail.modules.length}
              </span>
            </div>
          )}
        </div>

        <TrailActions trail={trail} />
      </header>

      {/* ── Lista de artigos ── */}
      <div className="mt-2">
        {trail.modules.map((mod, idx) => {
          const isCompleted = completedModules.includes(mod.slug);
          const quizScore = state?.quizScores[mod.slug];

          return (
            <Link
              key={mod.slug}
              href={`/aprenda/${mod.slug}`}
              className="group flex items-start gap-4 py-6 transition-all"
              style={{ borderBottom: '1px solid var(--ffv-border)' }}
            >
              {/* Número / check */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 transition-all group-hover:scale-105"
                style={{
                  background: isCompleted ? `${trail.color}18` : 'var(--ffv-bg2)',
                  border: `1px solid ${isCompleted ? trail.color + '40' : 'var(--ffv-border)'}`,
                  color: isCompleted ? trail.color : 'var(--ffv-muted)',
                }}
              >
                {isCompleted ? '✓' : String(idx + 1).padStart(2, '0')}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <h2
                  className="font-semibold text-sm leading-snug transition-colors group-hover:text-white"
                  style={{ color: isCompleted ? 'var(--ffv-muted)' : 'var(--foreground)' }}
                >
                  {mod.icon} {mod.title}
                  {isCompleted && (
                    <span className="ml-2 text-xs font-normal" style={{ color: 'var(--ffv-green)' }}>
                      lido
                    </span>
                  )}
                </h2>
                <p className="text-xs mt-1.5 leading-relaxed line-clamp-2" style={{ color: 'var(--ffv-muted)' }}>
                  {mod.desc}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                  <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                    ⏱ {mod.readTime} min
                  </span>
                  <span style={{ color: 'var(--ffv-border)' }}>·</span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: trail.color }}
                  >
                    +{mod.xp} XP
                  </span>
                  {quizScore && (
                    <>
                      <span style={{ color: 'var(--ffv-border)' }}>·</span>
                      <span className="text-xs" style={{ color: quizScore.perfect ? 'var(--ffv-green)' : 'var(--ffv-muted)' }}>
                        {quizScore.perfect ? '🎯' : '📝'} Quiz {quizScore.score}/{quizScore.total}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Seta */}
              <span
                className="text-sm mt-1 flex-shrink-0 transition-all opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1"
                style={{ color: trail.color }}
              >
                →
              </span>
            </Link>
          );
        })}
      </div>

      {/* ── Footer do blog ── */}
      <div className="mt-12 pt-8 flex items-center justify-between flex-wrap gap-4" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <Link href="/" className="text-xs transition-colors hover:text-white" style={{ color: 'var(--ffv-muted)' }}>
          ← Voltar à home
        </Link>
        {trail.id === 'trail1' && (
          <Link
            href="/ia-alem-do-llm"
            className="text-xs font-semibold flex items-center gap-1 transition-colors"
            style={{ color: 'var(--ffv-purple)' }}
          >
            Ver também: IA Além do LLM 🏗️
          </Link>
        )}
        {trail.id === 'trail2' && (
          <Link
            href="/fundamentos-da-ia"
            className="text-xs font-semibold flex items-center gap-1 transition-colors"
            style={{ color: 'var(--ffv-blue)' }}
          >
            Ver também: Fundamentos da IA 🧠
          </Link>
        )}
      </div>
    </div>
  );
}
