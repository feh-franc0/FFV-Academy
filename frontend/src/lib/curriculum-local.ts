import 'server-only';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CURRICULUM, HUBS } from './curriculum';
import type { ArticleWithBlocks } from '@/components/article/blocks/schemas';

/**
 * Fallback de DESENVOLVIMENTO para /aprenda/[slug].
 *
 * A rota real busca os blocos do backend Go + Postgres. Sem eles de pé — o caso
 * normal em máquina de dev — o fetch falha e a página caía em 404, o que fazia
 * parecer que o conteúdo não existia. Aqui lemos o mesmo JSON que o importer
 * carregaria (`scripts/seeds/articles/<slug>.json`) e montamos a resposta com a
 * metadata do curriculum.ts.
 *
 * Isso NÃO substitui o backend: é leitura de arquivo, sem progresso, sem
 * ranking e sem admin. Só existe para revisar conteúdo e diagramas com o
 * layout real, em vez de um preview simplificado.
 *
 * Habilitado em DESENVOLVIMENTO e durante o BUILD. Em runtime de produção
 * retorna null — ali o backend é a fonte de verdade. Ver a nota abaixo.
 */

const SEEDS = join(process.cwd(), '..', 'scripts', 'seeds', 'articles');

/**
 * O build precisa dos seeds, e essa era a lacuna.
 *
 * A regra original era só `NODE_ENV === 'development'`, com a intenção certa:
 * em produção, quem manda é o CMS, e servir arquivo do repositório poderia
 * entregar conteúdo velho depois de uma edição no admin.
 *
 * O efeito colateral não era visível: `next build` roda em NODE_ENV de
 * produção e NÃO tem backend alcançável — a imagem é construída no runner do
 * CI, longe da VPS. Resultado medido em 05/ago/2026, com a varredura de rotas:
 * as **415 páginas de módulo pré-renderizavam como "Módulo não encontrado"**,
 * sem `<h1>` e sem conteúdo. Como a rota tem revalidação de 1 hora, o primeiro
 * visitante de cada página depois de todo deploy recebia essa versão — e os
 * rastreadores de busca também.
 *
 * A correção distingue BUILD de RUNTIME. Durante o build, os seeds são
 * exatamente o conteúdo que o importer carrega no banco no mesmo deploy: usar
 * o arquivo produz a mesma página, e uma página correta é estritamente melhor
 * que um 404. Em runtime de produção o guarda permanece, e a intenção original
 * — CMS como fonte de verdade — fica preservada.
 */
export function localArticlesEnabled(): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  return process.env.NEXT_PHASE === 'phase-production-build';
}

export async function fetchArticleFromSeeds(
  slug: string,
): Promise<ArticleWithBlocks | null> {
  if (!localArticlesEnabled()) return null;

  const trail = CURRICULUM.find(t => t.modules.some(m => m.slug === slug));
  const modulo = trail?.modules.find(m => m.slug === slug);
  if (!trail || !modulo) return null;

  let blocks: ArticleWithBlocks['blocks'];
  try {
    const raw = await readFile(join(SEEDS, `${slug}.json`), 'utf-8');
    const doc = JSON.parse(raw) as { blocks?: ArticleWithBlocks['blocks'] };
    if (!doc.blocks?.length) return null;
    blocks = doc.blocks;
  } catch {
    // Slug declarado no curriculum.ts sem seed correspondente — é a dívida que
    // o check-curriculum-seed-drift.mjs reporta. Deixa o 404 acontecer.
    return null;
  }

  const hub = HUBS.find(h => h.trailIds.includes(trail.id));
  const ordem = trail.modules.findIndex(m => m.slug === slug);

  return {
    slug,
    title: modulo.title,
    trail_id: trail.id,
    hub_id: hub?.id ?? 'hub-ia',
    xp: modulo.xp ?? 10,
    read_time: modulo.readTime ?? 5,
    difficulty: modulo.level ?? trail.level ?? 'intermediate',
    order: ordem >= 0 ? ordem : 0,
    updated_at: new Date(0).toISOString(), // estável: evita diff a cada render
    blocks,
  };
}
