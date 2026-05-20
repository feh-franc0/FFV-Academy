'use client';

import Link from 'next/link';
import { totalEstimatedHours, type TrilhaEspelho } from '@/lib/trilhas-espelho';

interface Props {
  trilha: TrilhaEspelho;
}

/**
 * TrilhaEspelhoClient — UI da Trilha Espelho pública.
 *
 * Estrutura SEO-friendly:
 *   1. Hero — examName + edition + pitch + stats (módulos / horas / alunos)
 *   2. Status — "incubating" mostra banner de "trilha ainda agregando"
 *   3. Lista numerada de módulos com tempo + tópicos
 *   4. CTA — "Solicitar minha versão personalizada" → /
 *
 * Server-rendered shell + interatividade mínima (links, hover).
 */
export function TrilhaEspelhoClient({ trilha }: Props) {
  const hours = totalEstimatedHours(trilha);
  const isLive = trilha.status === 'live';

  return (
    <div
      data-testid="trilha-espelho-client"
      style={{
        background: 'var(--ffv-paper)',
        color: 'var(--ffv-ink)',
        minHeight: '100vh',
        paddingTop: 'clamp(72px, 9vw, 112px)',
        paddingBottom: 'clamp(72px, 9vw, 112px)',
      }}
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        {/* Status banner pra trilhas em incubação */}
        {!isLive && (
          <div
            className="mb-8 px-4 py-3 rounded-lg text-sm flex items-center gap-3"
            style={{
              background: 'color-mix(in srgb, var(--ffv-amber) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--ffv-amber) 35%, transparent)',
              color: 'var(--ffv-ink)',
            }}
            role="status"
          >
            <span aria-hidden style={{ fontSize: 18 }}>🌱</span>
            <span>
              <strong>Trilha em incubação.</strong> {trilha.contributorCount} alunos contribuíram com material até agora. Quando atingirmos 15, esta trilha vira oficialmente &ldquo;live&rdquo;.
            </span>
          </div>
        )}

        {/* Hero */}
        <header className="mb-12">
          <p
            className="font-mono uppercase text-[11px] mb-3"
            style={{ color: 'var(--ffv-amber)', letterSpacing: '0.16em', fontWeight: 700 }}
          >
            Trilha Espelho · {trilha.examEdition}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4.5vw, 3.6rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              marginBottom: 18,
            }}
          >
            {trilha.examName}
          </h1>
          <p
            className="max-w-2xl"
            style={{
              fontSize: 'clamp(1rem, 1.25vw, 1.15rem)',
              color: '#44403c',
              lineHeight: 1.65,
              marginBottom: 24,
            }}
          >
            {trilha.pitch}
          </p>

          {/* Stats */}
          <div className="grid sm:grid-cols-4 gap-4">
            <Stat label="Módulos" value={String(trilha.modules.length)} />
            <Stat label="Horas estimadas" value={`~${hours}h`} />
            <Stat label="Alunos contribuintes" value={String(trilha.contributorCount)} />
            <Stat label="Base origem" value={trilha.baseSlug} link={`/${trilha.baseSlug}`} />
          </div>
        </header>

        {/* Lista numerada de módulos */}
        <section className="mb-12">
          <h2
            className="font-mono uppercase text-[11px] mb-5"
            style={{ color: 'var(--ffv-amber)', letterSpacing: '0.14em', fontWeight: 700 }}
          >
            Plano de estudo completo
          </h2>
          <ol className="list-none p-0 m-0 flex flex-col gap-2">
            {trilha.modules.map(mod => (
              <ModuleRow key={mod.slug} num={mod.num} title={mod.title} summary={mod.summary} estimatedMin={mod.estimatedMin} topics={mod.topics} />
            ))}
          </ol>
        </section>

        {/* CTA conversão */}
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
            Quer a versão personalizada?
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
            Esta é a trilha <em style={{ fontStyle: 'italic', color: '#fbbf24' }}>consolidada</em>. A sua nasce em 24h.
          </h2>
          <p style={{ color: '#d6d3d1', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            Mande seu material (PDFs da faculdade, anotações, edital específico) e a FFV monta uma trilha calibrada pelo SEU contexto. Curadoria humana revisa antes de entregar.
          </p>
          <Link
            href="/?nohome=1#solicitar-base"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors"
            style={{
              background: '#fbbf24',
              color: '#1c1917',
              borderRadius: 10,
              textDecoration: 'none',
            }}
          >
            Solicitar minha trilha personalizada →
          </Link>
        </section>

        {/* Footer info */}
        <footer
          className="text-xs"
          style={{ color: 'var(--ffv-muted)', lineHeight: 1.55 }}
        >
          Atualizado em {new Date(trilha.publishedAt).toLocaleDateString('pt-BR')}.
          Agregado a partir de material enviado por {trilha.contributorCount} alunos.
          Material individual nunca é exposto — apenas a estrutura agregada.
        </footer>
      </div>
    </div>
  );
}

// ─── Sub-componentes ─────────────────────────────────────────────────────

function Stat({ label, value, link }: { label: string; value: string; link?: string }) {
  const content = (
    <article
      className="p-4 rounded-xl"
      style={{
        background: '#ffffff',
        border: '1px solid var(--ffv-border)',
      }}
    >
      <p
        className="font-mono uppercase text-[10px] mb-1.5"
        style={{ color: 'var(--ffv-muted)', letterSpacing: '0.14em', fontWeight: 700 }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.4rem, 2.4vw, 1.8rem)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: 'var(--ffv-ink)',
        }}
      >
        {value}
      </p>
    </article>
  );

  if (link) {
    return (
      <Link href={link} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }
  return content;
}

interface ModuleRowProps {
  num: number;
  title: string;
  summary: string;
  estimatedMin: number;
  topics: string[];
}

function ModuleRow({ num, title, summary, estimatedMin, topics }: ModuleRowProps) {
  return (
    <li
      className="p-5 rounded-xl"
      style={{
        background: '#ffffff',
        border: '1px solid var(--ffv-border)',
      }}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="font-mono shrink-0"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--ffv-amber)',
            letterSpacing: '0.04em',
            minWidth: 28,
            paddingTop: 3,
          }}
        >
          {String(num).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <h3
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
              fontWeight: 700,
              color: 'var(--ffv-ink)',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
              marginBottom: 4,
            }}
          >
            {title}
          </h3>
          <p
            className="text-sm"
            style={{ color: '#57534e', lineHeight: 1.55, marginBottom: 8 }}
          >
            {summary}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--ffv-muted)', letterSpacing: '0.04em' }}
            >
              ~{estimatedMin}min
            </span>
            {topics.map(topic => (
              <span
                key={topic}
                className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded"
                style={{
                  background: 'color-mix(in srgb, var(--ffv-amber) 12%, transparent)',
                  color: 'var(--ffv-amber)',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}
