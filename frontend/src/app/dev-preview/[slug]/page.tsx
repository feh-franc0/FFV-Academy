/**
 * Preview de artigo — SOMENTE DESENVOLVIMENTO.
 *
 * A rota real (/aprenda/[slug]) busca os blocos do backend Go + Postgres.
 * Esta lê o mesmo JSON direto de scripts/seeds/articles/, para revisar
 * conteúdo e diagramas sem subir banco e importer.
 *
 * Renderiza pelo MESMO BlockTree da rota real — o que você vê aqui é o que
 * o BlockRenderer produz em produção. O que muda é só a origem do dado.
 *
 * Retorna 404 em produção (guarda no topo do componente).
 */

import { notFound } from 'next/navigation';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import Link from 'next/link';
import { BlockTree } from '@/components/article/BlockRenderer';
import { CURRICULUM } from '@/lib/curriculum';
import type { Block } from '@/components/article/blocks/schemas';

export const dynamic = 'force-dynamic';

const SEEDS = join(process.cwd(), '..', 'scripts', 'seeds', 'articles');

async function lerSeed(slug: string): Promise<Block[] | null> {
  try {
    const raw = await readFile(join(SEEDS, `${slug}.json`), 'utf-8');
    const doc = JSON.parse(raw) as { blocks?: Block[] };
    return doc.blocks ?? null;
  } catch {
    return null;
  }
}

export default async function DevPreview({ params }: { params: Promise<{ slug: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();

  const { slug } = await params;
  const blocks = await lerSeed(slug);
  if (!blocks) notFound();

  const modulo = CURRICULUM.flatMap(t => t.modules).find(m => m.slug === slug);

  // Índice dos artigos que têm diagrama, para navegar rápido
  const arquivos = await readdir(SEEDS).catch(() => [] as string[]);
  const comDiagrama: string[] = [];
  for (const f of arquivos) {
    if (!f.endsWith('.json') || f.startsWith('_')) continue;
    const raw = await readFile(join(SEEDS, f), 'utf-8');
    if (raw.includes('"arch_diagram"') || raw.includes('"aws_diagram"')) comDiagrama.push(f.replace(/\.json$/, ''));
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 rounded-lg border border-[var(--ffv-orange)]/40 bg-[var(--ffv-orange)]/10 p-3 text-sm">
        <strong className="text-[var(--ffv-orange)]">Preview de desenvolvimento</strong> — lendo{' '}
        <code>scripts/seeds/articles/{slug}.json</code> do disco. A rota real{' '}
        <code>/aprenda/{slug}</code> busca do backend.
      </div>

      <nav className="mb-8 flex flex-wrap gap-2 text-xs">
        {comDiagrama.map(s => (
          <Link
            key={s}
            href={`/dev-preview/${s}`}
            className={`rounded-md border px-2 py-1 transition-colors ${
              s === slug
                ? 'border-[var(--ffv-blue)] bg-[var(--ffv-blue)]/15 text-[var(--ffv-blue)]'
                : 'border-[var(--ffv-border)] text-[var(--ffv-muted)] hover:text-[var(--ffv-text)]'
            }`}
          >
            {s.replace(/^bedrock-/, '')}
          </Link>
        ))}
      </nav>

      <header className="mb-8 border-b border-[var(--ffv-border)] pb-6">
        <h1 className="mb-2 text-3xl font-bold">{modulo?.title ?? slug}</h1>
        {modulo && (
          <p className="text-sm text-[var(--ffv-muted)]">
            ⏱ {modulo.readTime} min · ⭐ {modulo.xp} XP · {blocks.length} blocos raiz
          </p>
        )}
      </header>

      <article className="prose prose-invert max-w-none">
        <BlockTree blocks={blocks} />
      </article>
    </article>
  );
}
