/**
 * /cheatsheets/[slug] — render dinâmico de cheatsheet do backend.
 *
 * Substitui as 5 page.tsx hardcoded (postgres, git, kubernetes, rust,
 * system-design). Conteúdo agora vem de GET /api/v1/cheatsheets/{slug}
 * e é renderizado via renderMarkdown — sem dependência externa de marked.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { renderMarkdown } from '@/lib/markdown';
import { BASE, social } from '@/lib/metadata-social';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface CheatsheetFull {
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  accent: string;
  emoji?: string;
  bodyMd: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

async function fetchCheatsheet(slug: string): Promise<CheatsheetFull | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/api/v1/cheatsheets/${encodeURIComponent(slug)}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as CheatsheetFull;
  } catch {
    return null;
  }
}

// Fallback usado quando backend não está disponível (CI sem API_BASE_URL,
// ou falha de rede). Os 5 slugs originais — Next.js precisa de >0 itens
// para `output: export` aceitar a rota.
const FALLBACK_SLUGS = ['postgres', 'git', 'kubernetes', 'rust', 'system-design'];

async function fetchAllSlugs(): Promise<string[]> {
  if (!API_BASE) return FALLBACK_SLUGS;
  try {
    const res = await fetch(`${API_BASE}/api/v1/cheatsheets`, { cache: 'no-store' });
    if (!res.ok) return FALLBACK_SLUGS;
    const body = (await res.json()) as { data?: { slug: string }[] };
    const slugs = (body.data ?? []).map(it => it.slug);
    return slugs.length > 0 ? slugs : FALLBACK_SLUGS;
  } catch {
    return FALLBACK_SLUGS;
  }
}

export async function generateStaticParams() {
  const slugs = await fetchAllSlugs();
  return slugs.map(slug => ({ slug }));
}

export const dynamicParams = false;

/** `postgres` → `Postgres`; `system-design` → `System design`. */
function tituloDoSlug(slug: string): string {
  const s = slug.replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const it = await fetchCheatsheet(slug);

  /**
   * O caminho de fallback é o que mais rodou até aqui, e era o mais defeituoso.
   *
   * Quando o build não alcança o backend — CI sem `NEXT_PUBLIC_API_BASE_URL`, ou
   * falha de rede —, `fetchCheatsheet` devolve `null`. Antes, isso retornava
   * `{ title: 'Cheatsheet' }` e mais nada: TODAS as páginas de cheatsheet saíam
   * com o MESMO `<title>` ("Cheatsheet — FFV Academy"), sem `description` e **sem
   * canônica**. Medido em 06/ago/2026 no HTML servido: `/cheatsheets/postgres` e
   * `/cheatsheets/git` com título idêntico. Título repetido em páginas diferentes
   * é sinal de conteúdo duplicado; canônica ausente deixa a escolha da URL para o
   * buscador.
   *
   * Agora o fallback deriva um título do próprio slug e declara a canônica de
   * qualquer jeito — o que o servidor sabe sem o backend já é suficiente para o
   * `<head>` ficar correto e distinto.
   */
  const titulo = it?.title ?? tituloDoSlug(slug);
  return {
    // SEM sufixo de marca: o template `'%s — FFV Academy'` do layout raiz o
    // aplica. Escrever à mão produzia `X — FFV Academy — FFV Academy`, e o
    // defeito ficou invisível localmente porque o caminho de fallback vencia.
    title: `Cheatsheet ${titulo}`,
    description:
      it?.description ?? it?.subtitle ?? `Cheatsheet de ${titulo}: os comandos e conceitos que se esquece na hora, em uma página.`,
    // Sem barra final, como o resto do site. Auditoria de 05/ago/2026: era a
    // única rota dinâmica indexável sem canônica declarada.
    alternates: { canonical: `${BASE}/cheatsheets/${slug}` },
    ...social({
      titulo: `Cheatsheet ${titulo} — FFV Academy`,
      descricao: it?.description ?? it?.subtitle ?? `Referência rápida de ${titulo}.`,
      caminho: `/cheatsheets/${slug}`,
      tipo: 'article',
    }),
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const it = await fetchCheatsheet(slug);

  if (!it) {
    // Build sem backend (CI) renderiza placeholder pra não quebrar SSG.
    if (!API_BASE) {
      return (
        <article className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold mb-3">Cheatsheet: {slug}</h1>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            Conteúdo será carregado do backend quando disponível.
          </p>
        </article>
      );
    }
    notFound();
  }

  const html = renderMarkdown(it.bodyMd);

  return (
    <article className="max-w-3xl mx-auto px-6 py-10">
      <nav className="text-xs mb-6" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/cheatsheets" style={{ color: 'var(--ffv-muted)' }}>Cheatsheets</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>{it.title}</span>
      </nav>
      <header className="mb-8 pb-6" style={{ borderBottom: `1px solid ${it.accent}40` }}>
        <div className="flex items-center gap-3 mb-2">
          {it.emoji && <span className="text-3xl">{it.emoji}</span>}
          <h1 className="text-3xl font-bold" style={{ color: it.accent }}>{it.title}</h1>
        </div>
        {it.subtitle && (
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>{it.subtitle}</p>
        )}
      </header>
      <div
        className="ffv-md-content prose-ffv text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
