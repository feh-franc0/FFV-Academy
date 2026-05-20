'use client';

/**
 * BaseModule — componente genérico que renderiza um módulo de QUALQUER base.
 * Sidebar com trilha + content (key terms, sections, quiz) + prev/next.
 *
 * Tudo o que é cor vem do theme. Conteúdo vem dos dados.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import type { Base, Module, Trail, Section } from '@/lib/bases/types';
import type { BaseTheme } from '@/lib/bases/theme';
import { useGameState } from '@/hooks/useGameState';
import { saveQuizScore } from '@/lib/engine';
import { emit as emitEngagement } from '@/lib/personalization/engagement-store';
import { TrailProvider } from './TrailContext';
import { TrailSummaryDrawer } from './TrailSummaryDrawer';
import { FloatingTrailMenuButton } from './FloatingTrailMenuButton';

const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' };
const SANS: React.CSSProperties = { fontFamily: 'var(--font-inter)' };

interface BaseModuleProps {
  base: Base;
  trail: Trail;
  module: Module;
  theme: BaseTheme;
  /** Ex: '/medicina-veterinaria' */
  basePath: string;
}

function BaseModuleInner({ base, trail, module: m, theme, basePath }: BaseModuleProps) {
  const currentIdx = trail.modules.findIndex(x => x.slug === m.slug);
  const prev = currentIdx > 0 ? trail.modules[currentIdx - 1] : null;
  const next = currentIdx < trail.modules.length - 1 ? trail.modules[currentIdx + 1] : null;

  // Engagement tracking — alimenta o ranker em /bases e métricas futuras
  // do admin. Eventos: visit_base ao mount + open_module pro slug atual.
  // Dispara só uma vez por render do módulo (não em re-renders).
  useEffect(() => {
    emitEngagement({ kind: 'visit_base', baseSlug: base.slug });
    emitEngagement({ kind: 'open_module', baseSlug: base.slug, moduleSlug: m.slug });
  }, [base.slug, m.slug]);

  // ── Gamificação — XP + badges + streak quando o quiz é concluído ──
  // Triggered uma vez quando o usuário revela todas as questões. Engine global
  // grava no GameState (mesmo do /tecnologia), então /ranking, /progresso e
  // GameHUD refletem a atividade da base.
  const { markComplete, state } = useGameState();
  const completedRef = useRef(false);
  const alreadyDone = state?.completedModules?.includes(m.slug) ?? false;

  function handleQuizFinished(correct: number, total: number) {
    if (completedRef.current || alreadyDone) return;
    completedRef.current = true;
    saveQuizScore(m.slug, correct, total);
    markComplete({
      slug: m.slug,
      title: m.title,
      trailColor: theme.accent,
      readTime: m.estimatedMin,
      quizScore: total > 0 ? correct / total : 1,
      quiz: m.quiz.map(q => ({
        question: q.question,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
      })),
    });
  }

  const kicker: React.CSSProperties = {
    ...SANS,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: theme.accent,
  };

  return (
    <div style={{ background: theme.paper, color: theme.ink }}>
      <div
        className="base-module-grid max-w-7xl mx-auto px-6 lg:px-10"
        style={{ paddingTop: 'clamp(96px, 12vw, 144px)', paddingBottom: 'clamp(72px, 10vw, 128px)' }}
      >
        {/* ── Sidebar — trilha index (desktop only) ─────────────────
            Em mobile, a sidebar fica acessível via FloatingTrailMenuButton
            → TrailSummaryDrawer (drawer da direita).
        */}
        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          <Link
            href={basePath}
            className="inline-flex items-center gap-1.5 text-xs font-mono mb-5"
            style={{ color: theme.muted, letterSpacing: '0.08em', textDecoration: 'none' }}
          >
            ← VOLTAR PARA {base.name.toUpperCase()}
          </Link>

          <div className="flex items-center gap-2.5 mb-5">
            <span style={{ fontSize: 22 }}>{trail.icon}</span>
            <div>
              <p style={{ ...kicker, fontSize: 9, lineHeight: 1 }}>Trilha</p>
              <p
                style={{
                  ...SERIF,
                  fontWeight: 700,
                  fontSize: 17,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                  marginTop: 4,
                }}
              >
                {trail.title}
              </p>
            </div>
          </div>

          <ol
            className="flex flex-col gap-1.5 list-none p-0 pb-6"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            {trail.modules.map((mod, idx) => {
              const isCurrent = mod.slug === m.slug;
              const isCompleted = state?.completedModules?.includes(mod.slug) ?? false;
              const isPast = idx < currentIdx;
              return (
                <li key={mod.slug}>
                  <Link
                    href={`${basePath}/${mod.slug}`}
                    aria-current={isCurrent ? 'page' : undefined}
                    className="flex items-start gap-2 px-2.5 py-1.5 rounded transition-colors"
                    style={{
                      textDecoration: 'none',
                      color: isCurrent ? theme.ink : isCompleted ? theme.muted : isPast ? theme.muted : '#44403c',
                      background: isCurrent ? theme.cream : 'transparent',
                      fontWeight: isCurrent ? 600 : 400,
                      borderLeft: isCurrent ? `3px solid ${theme.accent}` : '3px solid transparent',
                      paddingLeft: 8,
                    }}
                    onMouseOver={e => {
                      if (!isCurrent) e.currentTarget.style.background = theme.cream;
                    }}
                    onMouseOut={e => {
                      if (!isCurrent) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span
                      style={{
                        ...SANS,
                        fontSize: 11,
                        fontWeight: 600,
                        color: isCompleted ? theme.success : isCurrent ? theme.accent : theme.muted,
                        minWidth: 22,
                        marginTop: 2,
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                      aria-label={isCompleted ? 'Módulo concluído' : undefined}
                    >
                      {isCompleted ? (
                        <Check size={14} strokeWidth={2.5} aria-hidden />
                      ) : (
                        String(idx + 1).padStart(2, '0')
                      )}
                    </span>
                    <span style={{ ...SANS, fontSize: 13, lineHeight: 1.4 }}>{mod.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>

          <p
            className="text-[10px] mt-4 italic"
            style={{ ...SERIF, color: theme.muted, lineHeight: 1.5 }}
          >
            {base.attribution}
          </p>
        </aside>

        {/* ── Main ─────────────────────────────────────────────────── */}
        <article>
          <p style={kicker}>
            Módulo {String(m.num).padStart(2, '0')} de {trail.modules.length} · {trail.title}
          </p>

          <div className="flex items-start gap-4 mt-3 mb-4">
            <span style={{ fontSize: 32, lineHeight: 1, marginTop: 4 }}>{m.icon}</span>
            <h1
              style={{
                ...SERIF,
                fontWeight: 700,
                fontSize: 'clamp(1.7rem, 2.8vw, 2.4rem)',
                letterSpacing: '-0.022em',
                lineHeight: 1.1,
                color: theme.ink,
              }}
            >
              {m.title}
            </h1>
          </div>
          <p
            style={{
              ...SANS,
              fontSize: '1.05rem',
              color: '#44403c',
              lineHeight: 1.65,
              maxWidth: 720,
              marginBottom: 20,
            }}
          >
            {m.summary}
          </p>

          {/* Progress da trilha */}
          <div className="mb-10">
            <div
              className="flex items-center justify-between text-[11px] mb-2"
              style={{ color: theme.muted }}
            >
              <span className="font-mono uppercase" style={{ letterSpacing: '0.08em' }}>
                Progresso da trilha
              </span>
              <span style={{ fontWeight: 600, color: theme.ink }}>
                {currentIdx + 1} / {trail.modules.length} ·{' '}
                {Math.round(((currentIdx + 1) / trail.modules.length) * 100)}%
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: theme.cream }}
            >
              <div
                style={{
                  width: `${((currentIdx + 1) / trail.modules.length) * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                  borderRadius: 999,
                }}
              />
            </div>
          </div>

          <div
            className="flex items-center gap-5 text-xs flex-wrap mb-12"
            style={{ color: theme.muted }}
          >
            <span className="font-mono uppercase" style={{ letterSpacing: '0.08em' }}>
              ⏱ {m.estimatedMin} min
            </span>
            <span className="font-mono uppercase" style={{ letterSpacing: '0.08em' }}>
              📖 {m.sections.length} seções
            </span>
            <span className="font-mono uppercase" style={{ letterSpacing: '0.08em' }}>
              📝 {m.quiz.length} questões
            </span>
            <span className="font-mono uppercase" style={{ letterSpacing: '0.08em' }}>
              🔑 {m.keyTerms.length} termos-chave
            </span>
          </div>

          {/* Key Terms */}
          {m.keyTerms.length > 0 && (
            <section className="mb-14">
              <h2
                style={{
                  ...SERIF,
                  fontWeight: 700,
                  fontSize: 'clamp(1.4rem, 2.2vw, 1.7rem)',
                  letterSpacing: '-0.02em',
                  color: theme.ink,
                  marginBottom: 16,
                }}
              >
                Termos-chave
              </h2>
              <dl
                className="grid sm:grid-cols-2 gap-px"
                style={{
                  background: theme.border,
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: `1px solid ${theme.border}`,
                }}
              >
                {m.keyTerms.map(kt => (
                  <div key={kt.term} className="p-4" style={{ background: '#ffffff' }}>
                    <dt
                      style={{
                        ...SERIF,
                        fontWeight: 700,
                        fontSize: 14,
                        color: theme.ink,
                        letterSpacing: '-0.01em',
                        marginBottom: 4,
                      }}
                    >
                      {kt.term}
                    </dt>
                    <dd
                      className="text-[13px]"
                      style={{ ...SANS, color: '#57534e', lineHeight: 1.55, marginLeft: 0 }}
                    >
                      {kt.definition}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Sections */}
          <section
            className="flex flex-col gap-10 pb-12"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            {m.sections.map((s, i) => (
              <SectionView key={i} section={s} theme={theme} />
            ))}
          </section>

          {/* Quiz */}
          {m.quiz.length > 0 && (
            <section className="pt-14">
              <p style={kicker}>Exercícios</p>
              <h2
                style={{
                  ...SERIF,
                  fontWeight: 700,
                  fontSize: 'clamp(1.6rem, 2.6vw, 2rem)',
                  letterSpacing: '-0.022em',
                  color: theme.ink,
                  marginTop: 12,
                  marginBottom: 24,
                }}
              >
                Teste o que você aprendeu.
              </h2>
              <Quiz
                questions={m.quiz}
                theme={theme}
                onComplete={handleQuizFinished}
                alreadyDone={alreadyDone}
              />
            </section>
          )}

          {/* Prev / Next */}
          <nav
            className="grid sm:grid-cols-2 gap-4 mt-16 pt-10"
            style={{ borderTop: `1px solid ${theme.border}` }}
            aria-label="Navegação entre módulos"
          >
            {prev ? (
              <Link
                href={`${basePath}/${prev.slug}`}
                className="p-5 transition-all"
                style={{
                  background: '#ffffff',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = theme.ink)}
                onMouseOut={e => (e.currentTarget.style.borderColor = theme.border)}
              >
                <p
                  className="font-mono text-[10px] uppercase mb-2"
                  style={{ color: theme.muted, letterSpacing: '0.12em' }}
                >
                  ← Anterior
                </p>
                <p
                  style={{
                    ...SERIF,
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: theme.ink,
                  }}
                >
                  {prev.icon} {prev.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`${basePath}/${next.slug}`}
                className="p-5 text-right transition-all"
                style={{
                  background: theme.ink,
                  border: `1px solid ${theme.ink}`,
                  borderRadius: 12,
                  textDecoration: 'none',
                  color: theme.paper,
                }}
                onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseOut={e => (e.currentTarget.style.transform = '')}
              >
                <p
                  className="font-mono text-[10px] uppercase mb-2"
                  style={{ color: theme.accentLight, letterSpacing: '0.12em' }}
                >
                  Próximo →
                </p>
                <p
                  style={{
                    ...SERIF,
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: theme.paper,
                  }}
                >
                  {next.icon} {next.title}
                </p>
              </Link>
            ) : (
              <div
                className="p-5 text-right"
                style={{
                  background: theme.cream,
                  border: `1px dashed ${theme.border}`,
                  borderRadius: 12,
                }}
              >
                <p
                  className="font-mono text-[10px] uppercase mb-2"
                  style={{ color: theme.accent, letterSpacing: '0.12em' }}
                >
                  Trilha completa
                </p>
                <p style={{ ...SERIF, fontSize: 16, fontWeight: 700, color: theme.ink }}>
                  🎓 Você concluiu {trail.title}
                </p>
              </div>
            )}
          </nav>
        </article>
      </div>
    </div>
  );
}

// ─── Export wrapper — envolve com TrailProvider e monta drawer + FAB ─────────
//
// O TrailProvider precisa estar acima de qualquer consumidor (sidebar desktop,
// drawer mobile, FAB). Como BaseModule é o orquestrador da página de módulo,
// ele é o lugar natural pra plantar o provider.

export function BaseModule(props: BaseModuleProps) {
  const { state } = useGameState();
  const completed = state?.completedModules ?? [];

  return (
    <TrailProvider
      trail={props.trail}
      currentModule={props.module}
      basePath={props.basePath}
      baseName={props.base.name}
      theme={props.theme}
      completedSlugs={completed}
    >
      <BaseModuleInner {...props} />
      <TrailSummaryDrawer />
      <FloatingTrailMenuButton />
    </TrailProvider>
  );
}

// ─── SectionView ─────────────────────────────────────────────────────────────

function SectionView({ section, theme }: { section: Section; theme: BaseTheme }) {
  if (section.kind === 'intro') {
    return (
      <div
        style={{
          ...SERIF,
          fontStyle: 'italic',
          fontSize: 'clamp(1.05rem, 1.25vw, 1.18rem)',
          color: '#44403c',
          lineHeight: 1.7,
          borderLeft: `3px solid ${theme.accent}`,
          paddingLeft: 18,
        }}
      >
        {section.body}
      </div>
    );
  }

  if (section.kind === 'concept') {
    return (
      <div>
        <h3
          style={{
            ...SERIF,
            fontWeight: 700,
            fontSize: 'clamp(1.3rem, 2vw, 1.55rem)',
            letterSpacing: '-0.018em',
            color: theme.ink,
            marginBottom: 12,
            lineHeight: 1.2,
          }}
        >
          {section.title}
        </h3>
        <p style={{ ...SANS, fontSize: '1.02rem', color: '#44403c', lineHeight: 1.7 }}>
          {section.body}
        </p>
        {section.metadata && (
          <p
            className="mt-3 text-xs font-mono px-3 py-2 rounded"
            style={{
              background: theme.cream,
              color: theme.ink,
              borderLeft: `2px solid ${theme.accent}`,
            }}
          >
            {section.metadata}
          </p>
        )}
      </div>
    );
  }

  if (section.kind === 'example') {
    return (
      <div
        className="p-6"
        style={{ background: '#ffffff', border: `1px solid ${theme.border}`, borderRadius: 12 }}
      >
        <p
          className="font-mono text-[10px] uppercase mb-2"
          style={{ color: theme.accent, letterSpacing: '0.14em' }}
        >
          Exemplo prático
        </p>
        <h3
          style={{
            ...SERIF,
            fontWeight: 700,
            fontSize: '1.2rem',
            letterSpacing: '-0.015em',
            color: theme.ink,
            marginBottom: 10,
          }}
        >
          {section.title}
        </h3>
        <p style={{ ...SANS, fontSize: 15, color: '#44403c', lineHeight: 1.7 }}>{section.body}</p>
        {section.metadata && (
          <p
            className="mt-3 text-xs font-mono px-3 py-2 rounded"
            style={{
              background: theme.cream,
              color: theme.ink,
              borderLeft: `2px solid ${theme.accent}`,
            }}
          >
            {section.metadata}
          </p>
        )}
      </div>
    );
  }

  if (section.kind === 'formula') {
    return (
      <div
        className="p-6 text-center"
        style={{ background: theme.ink, color: theme.paper, borderRadius: 12 }}
      >
        <p
          className="font-mono text-[10px] uppercase mb-2"
          style={{ color: theme.accentLight, letterSpacing: '0.14em' }}
        >
          Fórmula · {section.title}
        </p>
        <p
          style={{
            ...SERIF,
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: 'clamp(1.4rem, 2.4vw, 1.8rem)',
            color: theme.accentLight,
            letterSpacing: '-0.01em',
            margin: '14px 0',
          }}
        >
          {section.formula}
        </p>
        <p
          style={{
            ...SANS,
            fontSize: 14,
            color: '#d6d3d1',
            lineHeight: 1.6,
            maxWidth: 620,
            margin: '0 auto',
          }}
        >
          {section.explanation}
        </p>
      </div>
    );
  }

  if (section.kind === 'table') {
    return (
      <div>
        {section.caption && (
          <p
            className="font-mono text-[10px] uppercase mb-2"
            style={{ color: theme.muted, letterSpacing: '0.14em' }}
          >
            {section.caption}
          </p>
        )}
        <div className="overflow-x-auto">
          <table
            style={{
              ...SANS,
              fontSize: 13.5,
              borderCollapse: 'collapse',
              width: '100%',
              background: '#ffffff',
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <thead style={{ background: theme.cream }}>
              <tr>
                {section.headers.map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      color: theme.ink,
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      borderBottom: `1px solid ${theme.border}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    borderBottom:
                      ri < section.rows.length - 1 ? `1px solid ${theme.border}` : 'none',
                  }}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: '10px 14px',
                        color: '#44403c',
                        verticalAlign: 'top',
                        lineHeight: 1.5,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (section.kind === 'summary') {
    return (
      <div
        className="p-6"
        style={{ background: theme.cream, border: `1px solid ${theme.border}`, borderRadius: 12 }}
      >
        <p
          className="font-mono text-[10px] uppercase mb-3"
          style={{ color: theme.accent, letterSpacing: '0.14em' }}
        >
          Resumo
        </p>
        {section.title && (
          <h3
            style={{
              ...SERIF,
              fontWeight: 700,
              fontSize: '1.15rem',
              letterSpacing: '-0.015em',
              color: theme.ink,
              marginBottom: 12,
            }}
          >
            {section.title}
          </h3>
        )}
        <ul className="flex flex-col gap-2.5">
          {section.bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm"
              style={{ color: '#44403c', lineHeight: 1.6 }}
            >
              <span
                aria-hidden
                style={{
                  flexShrink: 0,
                  marginTop: 7,
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: theme.accent,
                }}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (section.kind === 'callout') {
    const colors = {
      info:      { border: '#0891b2',     bg: 'rgba(8,145,178,0.06)',  text: '#155e75' },
      warning:   { border: theme.accent,  bg: `color-mix(in srgb, ${theme.accent} 7%, transparent)`,  text: '#92400e' },
      highlight: { border: theme.success, bg: `color-mix(in srgb, ${theme.success} 6%, transparent)`, text: '#166534' },
      note:      { border: theme.muted,   bg: theme.cream,             text: theme.ink },
    } as const;
    const c = colors[section.tone];
    return (
      <div
        className="p-5"
        style={{ background: c.bg, borderLeft: `3px solid ${c.border}`, borderRadius: 8 }}
      >
        {section.title && (
          <p
            className="text-xs font-bold mb-2 uppercase"
            style={{ color: c.border, letterSpacing: '0.08em' }}
          >
            {section.title}
          </p>
        )}
        <p style={{ ...SANS, fontSize: 14, color: c.text, lineHeight: 1.65 }}>{section.body}</p>
      </div>
    );
  }

  return null;
}

// ─── Quiz ──────────────────────────────────────────────────────────────────

function Quiz({
  questions,
  theme,
  onComplete,
  alreadyDone,
}: {
  questions: Module['quiz'];
  theme: BaseTheme;
  onComplete: (correct: number, total: number) => void;
  alreadyDone: boolean;
}) {
  const [answers, setAnswers] = useState<{ selected: number | null; revealed: boolean }[]>(
    () => questions.map(() => ({ selected: null, revealed: false })),
  );

  // Quando todas as questões forem reveladas, dispara onComplete uma vez.
  useEffect(() => {
    const allRevealed = answers.length > 0 && answers.every(a => a.revealed);
    if (allRevealed) {
      const correct = answers.reduce(
        (acc, a, i) => acc + (a.selected === questions[i].correct ? 1 : 0),
        0,
      );
      onComplete(correct, questions.length);
    }
  }, [answers, questions, onComplete]);

  return (
    <>
      {alreadyDone && (
        <div
          className="p-4 mb-5 text-sm"
          style={{
            background: `color-mix(in srgb, ${theme.success} 8%, transparent)`,
            border: `1px solid ${theme.success}`,
            borderRadius: 8,
            color: theme.success,
            fontWeight: 600,
          }}
        >
          ✓ Módulo já concluído. As respostas estão disponíveis pra revisão.
        </div>
      )}
      <ol className="flex flex-col gap-5 list-none p-0">
        {questions.map((q, i) => (
          <QuizItem
            key={i}
            num={i + 1}
            q={q}
            theme={theme}
            selected={answers[i].selected}
            revealed={answers[i].revealed}
            onSelect={idx =>
              setAnswers(prev => prev.map((a, j) => (j === i ? { ...a, selected: idx } : a)))
            }
            onReveal={() =>
              setAnswers(prev => prev.map((a, j) => (j === i ? { ...a, revealed: true } : a)))
            }
          />
        ))}
      </ol>
    </>
  );
}

function QuizItem({
  num,
  q,
  theme,
  selected,
  revealed,
  onSelect,
  onReveal,
}: {
  num: number;
  q: Module['quiz'][number];
  theme: BaseTheme;
  selected: number | null;
  revealed: boolean;
  onSelect: (idx: number) => void;
  onReveal: () => void;
}) {
  const [hintOpen, setHintOpen] = useState(false);
  const questionId = `quiz-q-${num}`;
  const hintId = `quiz-q-${num}-hint`;

  /**
   * Navegação por teclado dentro do radiogroup:
   *  - ↑/← move pra opção anterior, ↓/→ pra próxima (wrap)
   *  - 1-4 ou A-D seleciona diretamente a opção
   * Acessibilidade: WCAG 2.1.1 + design pattern radiogroup.
   */
  function handleKeyNav(e: React.KeyboardEvent<HTMLUListElement>) {
    if (revealed) return;
    const n = q.options.length;
    const k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowRight') {
      e.preventDefault();
      const next = selected === null ? 0 : (selected + 1) % n;
      onSelect(next);
      return;
    }
    if (k === 'ArrowUp' || k === 'ArrowLeft') {
      e.preventDefault();
      const prev = selected === null ? n - 1 : (selected - 1 + n) % n;
      onSelect(prev);
      return;
    }
    // 1-4 dígito
    if (/^[1-9]$/.test(k)) {
      const idx = Number(k) - 1;
      if (idx < n) {
        e.preventDefault();
        onSelect(idx);
      }
      return;
    }
    // A-D letra (case-insensitive)
    const upper = k.toUpperCase();
    if (upper.length === 1 && upper >= 'A' && upper <= 'Z') {
      const idx = upper.charCodeAt(0) - 65;
      if (idx < n) {
        e.preventDefault();
        onSelect(idx);
      }
    }
  }

  return (
    <li
      className="p-6"
      style={{ background: '#ffffff', border: `1px solid ${theme.border}`, borderRadius: 12 }}
    >
      <p
        className="font-mono text-[10px] uppercase mb-2"
        style={{ color: theme.accent, letterSpacing: '0.14em' }}
      >
        Questão {String(num).padStart(2, '0')}
      </p>
      <h3
        id={questionId}
        style={{
          ...SERIF,
          fontSize: '1.1rem',
          fontWeight: 700,
          letterSpacing: '-0.012em',
          color: theme.ink,
          lineHeight: 1.35,
          marginBottom: 14,
        }}
      >
        {q.question}
      </h3>

      {q.hint && (
        <div className="mb-4">
          {!hintOpen ? (
            <button
              type="button"
              onClick={() => setHintOpen(true)}
              aria-expanded={false}
              aria-controls={hintId}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 transition-colors"
              style={{
                background: 'transparent',
                border: `1px dashed ${theme.border}`,
                color: theme.muted,
                borderRadius: 6,
                cursor: 'pointer',
                minHeight: 32,
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = theme.accent;
                e.currentTarget.style.color = theme.ink;
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.color = theme.muted;
              }}
            >
              💡 Pedir dica
            </button>
          ) : (
            <div
              id={hintId}
              role="region"
              aria-label="Dica da questão"
              className="p-3 text-sm"
              style={{
                background: `color-mix(in srgb, ${theme.accent} 6%, transparent)`,
                borderLeft: `3px solid ${theme.accent}`,
                borderRadius: 6,
                color: '#44403c',
                lineHeight: 1.65,
              }}
            >
              <p
                className="font-bold text-xs uppercase mb-1"
                style={{ color: theme.accent, letterSpacing: '0.08em' }}
              >
                💡 Dica
              </p>
              {q.hint}
            </div>
          )}
        </div>
      )}

      <ul
        role="radiogroup"
        aria-labelledby={questionId}
        onKeyDown={handleKeyNav}
        className="flex flex-col gap-2 mb-4 focus:outline-none"
      >
        {q.options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrect = revealed && idx === q.correct;
          const isWrongPicked = revealed && isSelected && idx !== q.correct;
          return (
            <li key={idx}>
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected || (selected === null && idx === 0) ? 0 : -1}
                onClick={() => {
                  if (revealed) return;
                  onSelect(idx);
                }}
                className="w-full text-left flex items-start gap-3 px-4 py-3 transition-colors"
                style={{
                  background: isCorrect
                    ? `color-mix(in srgb, ${theme.success} 8%, transparent)`
                    : isWrongPicked
                      ? `color-mix(in srgb, ${theme.accent} 7%, transparent)`
                      : isSelected
                        ? theme.cream
                        : '#ffffff',
                  border: '1px solid',
                  borderColor: isCorrect
                    ? theme.success
                    : isWrongPicked
                      ? theme.accent
                      : isSelected
                        ? theme.ink
                        : theme.border,
                  borderRadius: 8,
                  cursor: revealed ? 'default' : 'pointer',
                  minHeight: 44,
                }}
              >
                <span
                  className="font-mono text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ color: theme.muted, minWidth: 18 }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span style={{ ...SANS, fontSize: 14, color: theme.ink, lineHeight: 1.55 }}>
                  {opt}
                </span>
                {isCorrect && (
                  <span
                    style={{ marginLeft: 'auto', color: theme.success, fontWeight: 800 }}
                    aria-hidden
                  >
                    ✓
                  </span>
                )}
                {isWrongPicked && (
                  <span
                    style={{ marginLeft: 'auto', color: theme.accent, fontWeight: 800 }}
                    aria-hidden
                  >
                    ×
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {!revealed && (
        <button
          type="button"
          disabled={selected === null}
          onClick={onReveal}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all"
          style={{
            background: selected === null ? theme.cream : theme.ink,
            color: selected === null ? theme.muted : '#fff',
            borderRadius: 8,
            cursor: selected === null ? 'not-allowed' : 'pointer',
            opacity: selected === null ? 0.7 : 1,
          }}
        >
          Verificar resposta
        </button>
      )}

      {revealed && (
        <div
          className="mt-2 p-4 text-sm"
          style={{
            background:
              selected === q.correct
                ? `color-mix(in srgb, ${theme.success} 6%, transparent)`
                : `color-mix(in srgb, ${theme.accent} 6%, transparent)`,
            borderLeft: `3px solid ${selected === q.correct ? theme.success : theme.accent}`,
            borderRadius: 8,
            color: '#44403c',
            lineHeight: 1.6,
          }}
        >
          <p
            className="font-bold mb-1"
            style={{ color: selected === q.correct ? theme.success : theme.accent }}
          >
            {selected === q.correct ? '✓ Correto!' : '× Não foi dessa vez.'}
          </p>
          {q.explanation}
        </div>
      )}
    </li>
  );
}
