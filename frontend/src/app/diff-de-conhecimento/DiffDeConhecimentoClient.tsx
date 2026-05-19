'use client';

import Link from 'next/link';
import {
  computeDiffSummary,
  MOCK_DIFF_ENTRIES,
  type QuizDiffEntry,
} from '@/lib/diff-de-conhecimento';

/**
 * DiffDeConhecimentoClient — UI da feature defensável "Diff de Conhecimento".
 *
 * V1: usa MOCK_DIFF_ENTRIES pra demonstrar conceito. Comunicação clara
 * de que é PREVIEW.
 *
 * Layout:
 * 1. Hero — frase de venda + métrica resumo "você está X pts à frente de Y"
 * 2. Tabela comparativa por quiz — Aluno vs ChatGPT vs Gemini com bars
 * 3. Onde você se destaca (studentEdge agregado)
 * 4. Onde precisa estudar mais (studentGap agregado)
 * 5. Shareable card (Spotify-Wrapped style)
 */

export function DiffDeConhecimentoClient() {
  const entries = MOCK_DIFF_ENTRIES;
  const summary = computeDiffSummary(entries);

  const allEdges = Array.from(new Set(entries.flatMap(e => e.studentEdge)));
  const allGaps = Array.from(new Set(entries.flatMap(e => e.studentGap)));

  return (
    <div
      data-testid="diff-de-conhecimento"
      style={{
        background: 'var(--ffv-paper)',
        color: 'var(--ffv-ink)',
        minHeight: '100vh',
        paddingTop: 'clamp(72px, 9vw, 112px)',
        paddingBottom: 'clamp(72px, 9vw, 112px)',
      }}
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        {/* PREVIEW banner — honestidade */}
        <div
          className="mb-8 px-4 py-3 rounded-lg text-sm flex items-center gap-3"
          style={{
            background: 'color-mix(in srgb, var(--ffv-amber) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ffv-amber) 35%, transparent)',
            color: 'var(--ffv-ink)',
          }}
          role="status"
        >
          <span aria-hidden style={{ fontSize: 18 }}>🧪</span>
          <span>
            <strong>Preview V1.</strong> Os números abaixo são representativos
            (dados mockados). Quando você fizer quizzes reais, a FFV rodará
            ChatGPT/Gemini com as mesmas perguntas via API e mostrará os
            scores reais aqui.
          </span>
        </div>

        {/* Hero */}
        <header className="mb-12">
          <p
            className="font-mono uppercase text-[11px] mb-3"
            style={{ color: 'var(--ffv-amber)', letterSpacing: '0.16em', fontWeight: 700 }}
          >
            Diff de Conhecimento
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4.5vw, 3.6rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              marginBottom: 16,
            }}
          >
            Você{' '}
            <em
              style={{
                fontStyle: 'italic',
                background: 'linear-gradient(135deg, var(--ffv-amber), #c2410c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              vs IAs
            </em>{' '}
            no mesmo quiz.
          </h1>
          <p
            className="max-w-2xl"
            style={{
              fontSize: 'clamp(1rem, 1.25vw, 1.15rem)',
              color: '#44403c',
              lineHeight: 1.65,
            }}
          >
            Nenhuma plataforma mostra isso. ChatGPT diz que &ldquo;está aprendendo&rdquo;.
            Nós mostramos onde você está acima e onde precisa estudar mais — com base nos mesmos
            quizzes que ChatGPT e Gemini respondem.
          </p>
        </header>

        {/* Resumo grande */}
        <section
          className="p-8 rounded-2xl mb-12"
          style={{
            background: '#ffffff',
            border: '1px solid var(--ffv-border)',
            boxShadow: '0 12px 32px -16px rgba(28,25,23,0.12)',
          }}
        >
          <div className="grid sm:grid-cols-3 gap-6 text-center mb-6">
            <ScoreBlock label="Você" value={summary.studentAvg} highlight />
            <ScoreBlock label="ChatGPT 4o" value={summary.chatgptAvg} />
            <ScoreBlock label="Gemini 2.5" value={summary.geminiAvg} />
          </div>
          <p
            className="text-center text-sm"
            style={{ color: 'var(--ffv-muted)', lineHeight: 1.55 }}
          >
            Em {summary.totalQuizzes} quizzes,{' '}
            {summary.vsChatGPT === 'ahead' && (
              <>
                você está <strong style={{ color: 'var(--ffv-green)' }}>+{summary.pointsAheadOfChatGPT}pp</strong>{' '}
                à frente do ChatGPT
              </>
            )}
            {summary.vsChatGPT === 'tied' && <>você empata com o ChatGPT</>}
            {summary.vsChatGPT === 'behind' && (
              <>
                você está {summary.pointsAheadOfChatGPT}pp atrás do ChatGPT — espaço pra
                crescer
              </>
            )}
            .
          </p>
        </section>

        {/* Tabela detalhada */}
        <section className="mb-12">
          <h2
            className="font-mono uppercase text-[11px] mb-4"
            style={{ color: 'var(--ffv-amber)', letterSpacing: '0.14em', fontWeight: 700 }}
          >
            Quiz a quiz
          </h2>
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background: '#ffffff',
              border: '1px solid var(--ffv-border)',
            }}
          >
            <ol className="list-none p-0 m-0">
              {entries.map(e => (
                <DiffRow key={e.moduleSlug} entry={e} />
              ))}
            </ol>
          </div>
        </section>

        {/* Edge e Gap */}
        <div className="grid md:grid-cols-2 gap-5 mb-12">
          <article
            className="p-6 rounded-xl"
            style={{
              background: '#ffffff',
              border: '1px solid var(--ffv-border)',
            }}
          >
            <p
              className="font-mono uppercase text-[10px] mb-3"
              style={{ color: 'var(--ffv-green)', letterSpacing: '0.14em', fontWeight: 700 }}
            >
              ✓ Onde você passou as IAs
            </p>
            {allEdges.length > 0 ? (
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {allEdges.map(e => (
                  <li key={e} className="text-sm flex items-start gap-2">
                    <span aria-hidden style={{ color: 'var(--ffv-green)', fontWeight: 700 }}>•</span>
                    <span style={{ lineHeight: 1.55 }}>{e}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
                Ainda sem edge identificado. Continue estudando.
              </p>
            )}
          </article>

          <article
            className="p-6 rounded-xl"
            style={{
              background: '#ffffff',
              border: '1px solid var(--ffv-border)',
            }}
          >
            <p
              className="font-mono uppercase text-[10px] mb-3"
              style={{ color: '#d97706', letterSpacing: '0.14em', fontWeight: 700 }}
            >
              ⚠ Onde precisa estudar mais
            </p>
            {allGaps.length > 0 ? (
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {allGaps.map(g => (
                  <li key={g} className="text-sm flex items-start gap-2">
                    <span aria-hidden style={{ color: '#d97706', fontWeight: 700 }}>•</span>
                    <span style={{ lineHeight: 1.55 }}>{g}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
                Você está acima das IAs em todos os quizzes testados. 🎯
              </p>
            )}
          </article>
        </div>

        {/* Shareable + CTA */}
        <section
          className="p-8 lg:p-10 rounded-2xl mb-8"
          style={{
            background: 'linear-gradient(135deg, var(--ffv-ink) 0%, #292524 100%)',
            color: '#faf7f2',
          }}
        >
          <p
            className="font-mono uppercase text-[10px] mb-4"
            style={{ color: '#fbbf24', letterSpacing: '0.16em', fontWeight: 700 }}
          >
            Compartilhar
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'clamp(1.5rem, 3vw, 2.4rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 14,
            }}
          >
            Acertei <em style={{ fontStyle: 'italic', color: '#fbbf24' }}>{summary.studentAvg}%</em>{' '}
            onde o ChatGPT acertou <em style={{ fontStyle: 'italic', color: '#a8a29e' }}>{summary.chatgptAvg}%</em>.
          </h2>
          <p style={{ color: '#d6d3d1', fontSize: 14, lineHeight: 1.55 }}>
            Studied with{' '}
            <strong style={{ color: '#fbbf24' }}>FFV Academy</strong> — onde o aprendizado é{' '}
            <strong style={{ color: '#faf7f2' }}>medido vs IA</strong>, não comparado a outros alunos.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/meu-aprendizado"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors"
            style={{
              background: 'var(--ffv-ink)',
              color: '#fff',
              borderRadius: 10,
              textDecoration: 'none',
            }}
          >
            Ver meu espelho de aprendizado →
          </Link>
          <Link
            href="/bases"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors"
            style={{
              background: 'transparent',
              border: '1px solid var(--ffv-ink)',
              color: 'var(--ffv-ink)',
              borderRadius: 10,
              textDecoration: 'none',
            }}
          >
            Explorar bases
          </Link>
        </div>
      </div>
    </div>
  );
}

function ScoreBlock({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div>
      <p
        className="font-mono uppercase text-[10px] mb-2"
        style={{ color: 'var(--ffv-muted)', letterSpacing: '0.14em', fontWeight: 700 }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
          lineHeight: 1,
          letterSpacing: '-0.025em',
          color: highlight ? 'var(--ffv-amber)' : 'var(--ffv-ink)',
        }}
      >
        {value}
        <span className="text-base ml-1" style={{ color: 'var(--ffv-muted)' }}>%</span>
      </p>
    </div>
  );
}

function DiffRow({ entry }: { entry: QuizDiffEntry }) {
  const studentLead = entry.studentScore - Math.max(entry.chatgptScore, entry.geminiScore);

  return (
    <li
      className="p-5 flex flex-col gap-3"
      style={{ borderBottom: '1px solid var(--ffv-border)' }}
    >
      <header className="flex items-center justify-between gap-3">
        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--ffv-ink)' }}>{entry.moduleTitle}</p>
        <span
          className="text-[10px] font-mono uppercase px-2 py-0.5 rounded"
          style={{
            background:
              studentLead > 0
                ? 'color-mix(in srgb, var(--ffv-green) 14%, transparent)'
                : studentLead < 0
                  ? 'color-mix(in srgb, #d97706 14%, transparent)'
                  : 'var(--ffv-bg)',
            color: studentLead > 0 ? 'var(--ffv-green)' : studentLead < 0 ? '#d97706' : 'var(--ffv-muted)',
            letterSpacing: '0.08em',
            fontWeight: 700,
          }}
        >
          {studentLead > 0 ? `+${studentLead}pp` : studentLead < 0 ? `${studentLead}pp` : 'empate'}
        </span>
      </header>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <Bar label="Você" value={entry.studentScore} tone="amber" />
        <Bar label="ChatGPT" value={entry.chatgptScore} tone="neutral" />
        <Bar label="Gemini" value={entry.geminiScore} tone="neutral" />
      </div>
    </li>
  );
}

function Bar({ label, value, tone }: { label: string; value: number; tone: 'amber' | 'neutral' }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span style={{ color: 'var(--ffv-muted)', fontWeight: 600 }}>{label}</span>
        <span style={{ color: 'var(--ffv-ink)', fontWeight: 700, fontFamily: 'var(--font-inter)' }}>
          {value}%
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: 'var(--ffv-bg)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${value}%`}
      >
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            background:
              tone === 'amber'
                ? 'linear-gradient(90deg, var(--ffv-amber), #c2410c)'
                : 'var(--ffv-muted)',
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}
