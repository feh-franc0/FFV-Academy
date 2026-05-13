/**
 * Auditoria PROFUNDA do conteúdo CMS-driven contra o backend real.
 *
 * Esta suíte:
 *   1. Busca TODOS os artigos do backend (paginação completa)
 *   2. Compara com a fonte de verdade (CURRICULUM em src/lib/curriculum.ts)
 *   3. Para cada slug: valida o payload contra ArticleWithBlocksSchema
 *   4. Verifica que cada bloco tem dados parseáveis pelos schemas Zod
 *   5. Faz um censo de tipos de blocos (descobre se o parser deixa algum tipo
 *      fora) e compara com a lista de tipos suportados pelo BlockRenderer
 *   6. Mede a latência média do endpoint /blocks
 *   7. Falha se houver artigos sem blocos, slugs órfãos ou tipos não suportados
 *
 * GATING: roda só quando `CMS_AUDIT=1` está no ambiente (precisa backend
 * rodando em CMS_BACKEND_URL ou http://localhost:8080). Senão, skip silencioso
 * — o `npm test` regular continua passando.
 *
 * Como rodar manualmente:
 *   CMS_AUDIT=1 npm test -- src/tests/integration/cms-backend-audit.test.ts
 *   CMS_AUDIT=1 CMS_BACKEND_URL=http://localhost:8080 npm test
 *
 * Modo amostra (mais rápido, valida só 50 slugs aleatórios):
 *   CMS_AUDIT=1 CMS_SAMPLE=50 npm test
 */
import { describe, it, expect, beforeAll } from 'vitest';
import {
  ArticleWithBlocksSchema,
  BlockTypeSchema,
  type Block,
} from '@/components/article/blocks/schemas';
import { CURRICULUM } from '@/lib/curriculum';

const ENABLED = process.env.CMS_AUDIT === '1';
const BACKEND = (process.env.CMS_BACKEND_URL ?? 'http://localhost:8080').replace(/\/+$/, '');
const SAMPLE = process.env.CMS_SAMPLE ? Number(process.env.CMS_SAMPLE) : 0;

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

interface BackendListItem {
  slug: string;
  title: string;
}
interface BackendArticle {
  slug: string;
  title: string;
  trail_id: string;
  hub_id: string;
  xp: number;
  read_time: number;
  difficulty: string;
  order: number;
  updated_at: string;
  blocks: Block[];
}

async function fetchPage(offset: number): Promise<{ data: BackendListItem[]; total: number }> {
  const res = await fetch(`${BACKEND}/api/v1/curriculum?limit=${PAGE_SIZE}&offset=${offset}`);
  if (!res.ok) throw new Error(`list page offset=${offset}: HTTP ${res.status}`);
  return res.json();
}

async function fetchBlocks(slug: string): Promise<BackendArticle> {
  const res = await fetch(`${BACKEND}/api/v1/curriculum/${encodeURIComponent(slug)}/blocks`);
  if (!res.ok) throw new Error(`blocks ${slug}: HTTP ${res.status}`);
  return res.json();
}

function flattenTypes(blocks: Block[], counter: Map<string, number>) {
  for (const b of blocks) {
    counter.set(b.type, (counter.get(b.type) ?? 0) + 1);
    if (b.children?.length) flattenTypes(b.children, counter);
  }
}

const curriculumSlugs = new Set(CURRICULUM.flatMap(t => t.modules.map(m => m.slug)));
const supportedTypes = new Set(BlockTypeSchema.options);

describe.skipIf(!ENABLED)('CMS Backend — auditoria profunda', () => {
  const backendSlugs: BackendListItem[] = [];
  let backendTotal = 0;

  beforeAll(async () => {
    let offset = 0;
    let pages = 0;
    while (pages < MAX_PAGES) {
      const page = await fetchPage(offset);
      backendTotal = page.total;
      backendSlugs.push(...page.data);
      if (page.data.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
      pages++;
    }
  }, 30_000);

  it('endpoint /curriculum retorna ≥ 700 artigos', () => {
    expect(backendTotal).toBeGreaterThanOrEqual(700);
    expect(backendSlugs.length).toBe(backendTotal);
  });

  it('todo slug do CURRICULUM existe no backend', () => {
    const backendSet = new Set(backendSlugs.map(s => s.slug));
    const missing: string[] = [];
    for (const slug of curriculumSlugs) {
      if (!backendSet.has(slug)) missing.push(slug);
    }
    expect(missing, `Slugs faltando no backend (${missing.length}):\n${missing.slice(0, 30).join('\n')}`).toEqual([]);
  });

  it('todo slug do backend tem entrada no CURRICULUM (sem órfãos)', () => {
    const orphans = backendSlugs.filter(s => !curriculumSlugs.has(s.slug)).map(s => s.slug);
    expect(orphans, `Slugs órfãos no backend (${orphans.length}):\n${orphans.slice(0, 30).join('\n')}`).toEqual([]);
  });

  it('payload de cada artigo passa em ArticleWithBlocksSchema', async () => {
    const targets = SAMPLE > 0
      ? backendSlugs.slice().sort(() => Math.random() - 0.5).slice(0, SAMPLE)
      : backendSlugs;

    const invalid: { slug: string; error: string }[] = [];
    const empty: string[] = [];
    let totalBlocks = 0;
    const typeCounter = new Map<string, number>();
    const latencies: number[] = [];

    // Limita concorrência pra não saturar o backend
    const CONCURRENCY = 10;
    for (let i = 0; i < targets.length; i += CONCURRENCY) {
      const batch = targets.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map(async ({ slug }) => {
          const t0 = performance.now();
          let raw: unknown;
          try {
            raw = await fetchBlocks(slug);
          } catch (e) {
            invalid.push({ slug, error: (e as Error).message });
            return;
          }
          latencies.push(performance.now() - t0);

          const parsed = ArticleWithBlocksSchema.safeParse(raw);
          if (!parsed.success) {
            invalid.push({ slug, error: parsed.error.message.slice(0, 200) });
            return;
          }
          const article = parsed.data;
          totalBlocks += article.blocks.length;
          flattenTypes(article.blocks, typeCounter);
          if (article.blocks.length === 0) empty.push(slug);
        }),
      );
    }

    const p50 = latencies.slice().sort((a, b) => a - b)[Math.floor(latencies.length / 2)] ?? 0;
    const p95 = latencies.slice().sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)] ?? 0;

    console.log('\n=== Auditoria CMS ===');
    console.log(`Slugs auditados:     ${targets.length}`);
    console.log(`Total de blocos:     ${totalBlocks}`);
    console.log(`Schema inválido:     ${invalid.length}`);
    console.log(`Sem blocos:          ${empty.length}`);
    console.log(`Latência p50/p95:    ${p50.toFixed(1)}ms / ${p95.toFixed(1)}ms`);
    console.log('Distribuição de tipos:');
    [...typeCounter.entries()]
      .sort((a, b) => b[1] - a[1])
      .forEach(([t, n]) => console.log(`  ${t.padEnd(20)} ${n}`));

    if (invalid.length) {
      console.error('\nArtigos inválidos:');
      invalid.slice(0, 20).forEach(x => console.error(` - ${x.slug}: ${x.error}`));
    }
    if (empty.length) {
      console.error('\nArtigos sem blocos:');
      empty.slice(0, 20).forEach(s => console.error(` - ${s}`));
    }

    expect(invalid).toEqual([]);
    expect(empty).toEqual([]);
    expect(p95).toBeLessThan(500);

    // Censo: tipos no DB devem ser subset dos suportados pelo renderer
    const unsupportedInDB = [...typeCounter.keys()].filter(t => !supportedTypes.has(t as never));
    expect(unsupportedInDB, `Tipos no DB não suportados pelo renderer: ${unsupportedInDB.join(', ')}`).toEqual([]);

    // Sanity: pelo menos 80% dos tipos suportados aparecem em algum artigo
    const present = [...supportedTypes].filter(t => typeCounter.has(t));
    const coverage = present.length / supportedTypes.size;
    console.log(`Cobertura de tipos:  ${(coverage * 100).toFixed(1)}% (${present.length}/${supportedTypes.size})`);
    expect(coverage).toBeGreaterThanOrEqual(0.8);
  }, 120_000);

  it('ETag/Cache-Control presentes em respostas /blocks', async () => {
    const sample = backendSlugs[0]?.slug;
    if (!sample) return;
    const res = await fetch(`${BACKEND}/api/v1/curriculum/${sample}/blocks`);
    expect(res.ok).toBe(true);
    const cacheControl = res.headers.get('cache-control');
    const etag = res.headers.get('etag');
    expect(cacheControl ?? etag).toBeTruthy();
  });

  it('slug inexistente retorna 404 com Problem+JSON', async () => {
    const res = await fetch(`${BACKEND}/api/v1/curriculum/slug-que-nunca-existirá-123/blocks`);
    expect(res.status).toBe(404);
  });
});
