import type { Metadata } from 'next';
import Link from 'next/link';
import { listTrilhasEspelho, totalEstimatedHours } from '@/lib/trilhas-espelho';

export const metadata: Metadata = {
  title: 'Trilhas Espelho — FFV Academy',
  description:
    'Planos de estudo agregados pra provas e concursos brasileiros — OAB, AWS, CNU, residência. Cada trilha consolida material de múltiplos alunos. Gratuito.',
  alternates: { canonical: 'https://fernandofrancovalle.com/trilhas-espelho' },
};

/**
 * /trilhas-espelho — catálogo público.
 *
 * Cada card é uma trilha agregada pra uma prova/concurso específico.
 * Quando 5+ alunos enviam material da mesma prova, sistema (V2) gera a
 * trilha agregada e publica aqui. V1: catálogo hardcoded representativo.
 *
 * SEO: cada trilha tem sua própria página `/trilhas-espelho/<slug>` com
 * metadata otimizada. Esta listagem é o hub.
 */
export default function TrilhasEspelhoIndex() {
  const trilhas = listTrilhasEspelho();

  return (
    <div
      style={{
        background: 'var(--ffv-paper)',
        color: 'var(--ffv-ink)',
        minHeight: '100vh',
        paddingTop: 'clamp(72px, 9vw, 112px)',
        paddingBottom: 'clamp(72px, 9vw, 112px)',
      }}
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <header className="mb-12">
          <p
            className="font-mono uppercase text-[11px] mb-3"
            style={{ color: 'var(--ffv-amber)', letterSpacing: '0.16em', fontWeight: 700 }}
          >
            Catálogo público
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
            Trilhas Espelho
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
            Cada trilha aqui foi <strong>agregada</strong> a partir de material que múltiplos alunos enviaram pra mesma prova. Quanto mais gente contribui, mais aderente fica.
            Concursa.ai só faz pra concurso público. A FFV faz <strong>transversal</strong> — OAB, AWS, CNU, residência, ENEM.
          </p>
        </header>

        <ol className="list-none p-0 m-0 flex flex-col gap-4">
          {trilhas.map(t => {
            const hours = totalEstimatedHours(t);
            const isLive = t.status === 'live';
            return (
              <li key={t.slug}>
                <Link
                  href={`/trilhas-espelho/${t.slug}`}
                  className="block p-6 rounded-2xl transition-all"
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--ffv-border)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div className="flex flex-wrap items-start gap-3 mb-3">
                    <span
                      className="text-[10px] font-mono uppercase px-2 py-0.5 rounded"
                      style={{
                        background: isLive
                          ? 'color-mix(in srgb, var(--ffv-green) 18%, transparent)'
                          : 'color-mix(in srgb, var(--ffv-amber) 18%, transparent)',
                        color: isLive ? 'var(--ffv-green)' : 'var(--ffv-amber)',
                        letterSpacing: '0.1em',
                        fontWeight: 700,
                      }}
                    >
                      {isLive ? 'Live' : 'Em incubação'}
                    </span>
                    <span
                      className="text-[11px] font-mono"
                      style={{ color: 'var(--ffv-muted)', letterSpacing: '0.04em' }}
                    >
                      {t.examEdition}
                    </span>
                  </div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(1.3rem, 2.2vw, 1.75rem)',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.15,
                      marginBottom: 8,
                    }}
                  >
                    {t.examName}
                  </h2>
                  <p
                    className="text-sm mb-4"
                    style={{ color: '#57534e', lineHeight: 1.55 }}
                  >
                    {t.pitch}
                  </p>
                  <div
                    className="flex flex-wrap gap-3 text-xs"
                    style={{ color: 'var(--ffv-muted)' }}
                  >
                    <span>{t.modules.length} módulos</span>
                    <span aria-hidden>·</span>
                    <span>~{hours}h estimadas</span>
                    <span aria-hidden>·</span>
                    <span>{t.contributorCount} alunos contribuíram</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
