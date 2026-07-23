import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MEDVET_BASE } from '@/lib/bases/medvet';
import { MEDVET_THEME } from '@/lib/bases/medvet/theme';

const BASE_PATH = '/medicina-veterinaria';

export function generateStaticParams() {
  return (MEDVET_BASE.hubs ?? []).map(h => ({ slug: h.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hub = MEDVET_BASE.hubs?.find(h => h.slug === slug);
  if (!hub) return { title: 'Hub não encontrado — FFV Academy' };
  return {
    title: `${hub.name} — Genética Veterinária — FFV Academy`,
    description: hub.description,
    alternates: { canonical: `https://fernandofrancovalle.com${BASE_PATH}/hub/${hub.slug}` },
  };
}

export default async function MedvetHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hub = MEDVET_BASE.hubs?.find(h => h.slug === slug);
  if (!hub) notFound();

  const modulesBySlug = new Map(
    MEDVET_BASE.trails.flatMap(t => t.modules.map(m => [m.slug, m] as const)),
  );
  const modules = hub.moduleSlugs
    .map(s => modulesBySlug.get(s))
    .filter((m): m is NonNullable<typeof m> => !!m);

  const color = MEDVET_THEME.hubColors[hub.colorIndex];
  const totalMin = modules.reduce((acc, m) => acc + m.estimatedMin, 0);

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <section className="relative px-6 pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in srgb, ${color} 18%, transparent) 0%, transparent 65%)`,
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          <nav
            className="flex items-center gap-2 text-xs mb-6"
            style={{ color: 'var(--ffv-muted)' }}
          >
            <Link href="/" className="transition-colors hover:opacity-80">FFV Academy</Link>
            <span>/</span>
            <Link
              href={BASE_PATH}
              className="transition-colors hover:opacity-80"
            >
              Medicina Veterinária
            </Link>
            <span>/</span>
            <span style={{ color }}>{hub.name}</span>
          </nav>

          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: `color-mix(in srgb, ${color} 14%, transparent)`,
                border: `1px solid color-mix(in srgb, ${color} 34%, transparent)`,
              }}
            >
              {hub.icon}
            </div>
            <p
              className="font-mono text-[11px] tracking-[0.18em] uppercase font-bold"
              style={{ color }}
            >
              Hub · {hub.name}
            </p>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 16,
              maxWidth: 720,
            }}
          >
            {hub.description}
          </h1>

          <div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] mt-6"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.04em' }}
          >
            <span>{modules.length} módulos</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>~{totalMin} min de leitura</span>
          </div>
        </div>
      </section>

      <section
        className="px-6 py-12"
        style={{ borderTop: '1px solid var(--ffv-border)' }}
      >
        <div className="max-w-4xl mx-auto">
          <p
            className="font-mono text-[11px] tracking-[0.14em] uppercase font-bold mb-6"
            style={{ color: 'var(--ffv-muted)' }}
          >
            MÓDULOS DESTE HUB
          </p>

          <ul className="flex flex-col gap-3">
            {modules.map(m => (
              <li key={m.slug}>
                <Link
                  href={`${BASE_PATH}/${m.slug}/`}
                  className="block group"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <article
                    className="flex items-start gap-4 p-5 rounded-2xl transition-all"
                    style={{
                      background: 'var(--ffv-bg2)',
                      border: `1px solid ${color}25`,
                    }}
                  >
                    <div
                      className="flex-shrink-0 flex items-center justify-center font-mono font-bold"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: `color-mix(in srgb, ${color} 14%, transparent)`,
                        border: `1px solid ${color}35`,
                        color,
                        fontSize: 14,
                      }}
                    >
                      {String(m.num).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span style={{ fontSize: 18 }}>{m.icon}</span>
                        <h3
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            letterSpacing: '-0.01em',
                            lineHeight: 1.25,
                          }}
                        >
                          {m.title}
                        </h3>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: 'var(--ffv-muted)',
                          lineHeight: 1.6,
                          marginBottom: 8,
                        }}
                      >
                        {m.summary}
                      </p>
                      <div
                        className="font-mono text-[11px]"
                        style={{ color: 'var(--ffv-muted)', letterSpacing: '0.04em' }}
                      >
                        ~{m.estimatedMin} min
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="flex-shrink-0 self-center"
                      style={{ color, fontWeight: 700, fontSize: 16 }}
                    >
                      →
                    </span>
                  </article>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex justify-center">
            <Link
              href={BASE_PATH}
              className="font-mono text-xs"
              style={{
                color: 'var(--ffv-muted)',
                letterSpacing: '0.06em',
                textDecoration: 'underline',
              }}
            >
              ← Voltar para Medicina Veterinária
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
