import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import sitemap, { PAGINAS_ESTATICAS } from '@/app/sitemap';
import { SITE_GRAPH, ID, BASE_URL } from '@/lib/site-jsonld';

/**
 * Indexação — a convenção de URL e o grafo de entidades.
 *
 * ## Os defeitos que este arquivo tranca
 *
 * A auditoria de 05/ago/2026 mediu, contra o servidor de produção, que:
 *
 *  1. o servidor **não** usa `trailingSlash` — `/aprenda/x/` responde **308**
 *     para `/aprenda/x`;
 *  2. as 415 páginas de módulo declaravam `canonical: /aprenda/x/` — ou seja,
 *     **canônica apontando para um redirect**, que é sinal conflitante: o
 *     buscador descarta a declaração e escolhe a URL sozinho;
 *  3. o `Article` em JSON-LD e o `llms.txt` repetiam a forma com barra, enquanto
 *     o sitemap publicava a forma sem barra;
 *  4. **71 rotas indexáveis não tinham canônica**, incluindo a home, os 7 hubs e
 *     as 39 trilhas;
 *  5. **13 rotas de `/admin` eram indexáveis**;
 *  6. não havia entidade nenhuma do site — só um `publisher` inline repetido em
 *     cada artigo, sem `@id`.
 *
 * Nada disso quebra build, teste ou página. Aparece só em quem lê o HTML para
 * decidir o que indexar.
 */

const RAIZ = process.cwd();
const APP = join(RAIZ, 'src', 'app');

function rotasDePagina(dir = APP, prefixo = ''): { rota: string; arquivo: string }[] {
  const achadas: { rota: string; arquivo: string }[] = [];
  for (const e of readdirSync(dir)) {
    if (e.startsWith('_') || e.startsWith('(') || e === 'api') continue;
    const caminho = join(dir, e);
    if (!statSync(caminho).isDirectory()) continue;
    const rota = `${prefixo}/${e}`;
    const page = readdirSync(caminho).find(f => /^page\.(tsx|ts)$/.test(f));
    if (page) achadas.push({ rota, arquivo: join(caminho, page) });
    achadas.push(...rotasDePagina(caminho, rota));
  }
  return achadas;
}

const ROTAS = rotasDePagina();

describe('convenção de URL: sem barra final', () => {
  it('nenhuma canônica termina em barra', () => {
    // A barra final responde 308. Canônica que aponta para redirect entrega ao
    // buscador a decisão de qual URL é a verdadeira.
    const falhas: string[] = [];
    for (const { rota, arquivo } of ROTAS) {
      const src = readFileSync(arquivo, 'utf8');
      for (const m of src.matchAll(/canonical:\s*[`'"]([^`'"]+)[`'"]/g)) {
        if (m[1].length > 1 && m[1].endsWith('/')) falhas.push(`${rota} → ${m[1]}`);
      }
    }
    expect(falhas).toEqual([]);
  });

  it('nenhuma URL do sitemap termina em barra', () => {
    const comBarra = sitemap()
      .map(e => e.url)
      .filter(u => u !== `${BASE_URL}/` && u.endsWith('/'));
    expect(comBarra).toEqual([]);
  });

  it('o JSON-LD do artigo usa a mesma forma da canônica', () => {
    const src = readFileSync(join(RAIZ, 'src', 'components', 'article', 'ArticleJsonLd.tsx'), 'utf8');
    // Duas formas da mesma URL no mesmo HTML é o defeito que o buscador resolve
    // ignorando as duas.
    expect(src).not.toMatch(/\/aprenda\/\$\{slug\}\//);
  });

  it('o llms.txt publica links sem redirect', () => {
    const src = readFileSync(join(RAIZ, 'src', 'app', 'llms.txt', 'route.ts'), 'utf8');
    expect(src).not.toMatch(/\/aprenda\/\$\{m\.slug\}\//);
  });
});

describe('cobertura de canônica e de noindex', () => {
  /** Rota que não deve ser indexada, por natureza do conteúdo. */
  const FORA_DO_INDICE = ['/admin', '/perfil', '/progresso', '/revisar', '/dev-preview', '/preferencias'];

  /**
   * Rota que é client component não pode exportar `metadata` — nela o `noindex`
   * vem por `X-Robots-Tag` em next.config.ts. O teste exige que cada uma esteja
   * declarada lá, senão "é client component" viraria desculpa para rota sem
   * controle de indexação nenhum.
   */
  const NOINDEX_POR_HEADER = ['/admin', '/revisar/maratona', '/dev-preview'];

  it('toda rota indexável declara canônica', () => {
    const semCanonica: string[] = [];
    for (const { rota, arquivo } of ROTAS) {
      if (FORA_DO_INDICE.some(p => rota === p || rota.startsWith(`${p}/`))) continue;
      const src = readFileSync(arquivo, 'utf8');
      if (src.includes('index: false') || src.includes('noindex')) continue;
      // Segmento dinâmico resolve a URL em runtime, via generateMetadata.
      if (rota.includes('[') && src.includes('generateMetadata')) {
        if (!src.includes('canonical')) semCanonica.push(`${rota} (generateMetadata sem canonical)`);
        continue;
      }
      if (!src.includes('canonical')) semCanonica.push(rota);
    }
    expect(semCanonica).toEqual([]);
  });

  it('toda rota fora do índice por header está declarada em next.config', () => {
    const config = readFileSync(join(RAIZ, 'next.config.ts'), 'utf8');
    for (const rota of NOINDEX_POR_HEADER) {
      expect(config, `${rota} sem X-Robots-Tag`).toMatch(
        new RegExp(`source:\\s*["']${rota.replace(/\//g, '\\/')}`),
      );
    }
  });

  it('nenhuma rota de admin é indexável', () => {
    // O layout de /admin é client component e não pode exportar `metadata`, então
    // o controle é `X-Robots-Tag` por header, em next.config.ts, mais o disallow
    // no robots.txt. Os dois fazem trabalhos diferentes e ambos são necessários.
    const config = readFileSync(join(RAIZ, 'next.config.ts'), 'utf8');
    expect(config).toMatch(/source:\s*["']\/admin\/:path\*["']/);
    expect(config).toMatch(/X-Robots-Tag/);
    const robots = readFileSync(join(RAIZ, 'src', 'app', 'robots.ts'), 'utf8');
    expect(robots).toMatch(/'\/admin'/);
  });

  it('rota com noindex não aparece no sitemap', () => {
    // Anunciar no sitemap uma URL que pede para não ser indexada é sinal
    // contraditório — e foi o que aconteceu com /progresso.
    const noSitemap = new Set(PAGINAS_ESTATICAS.map(p => p.path));
    const contraditorias = ['/progresso', '/perfil', '/revisar'].filter(p => noSitemap.has(p));
    expect(contraditorias).toEqual([]);
  });

  it('robots.txt não bloqueia rota que declara noindex na página', () => {
    // Bloquear o rastreamento impede o buscador de LER o noindex — a URL fica
    // no índice sem descrição, que é o pior dos dois mundos.
    const robots = readFileSync(join(RAIZ, 'src', 'app', 'robots.ts'), 'utf8');
    for (const rota of ['/progresso', '/perfil', '/revisar']) {
      expect(robots, `${rota} não deve estar no disallow`).not.toMatch(
        new RegExp(`'${rota}'`),
      );
    }
  });
});

describe('nenhuma página de captação é órfã', () => {
  it('o rodapé liga /perguntas e /temas', () => {
    // Página sem link de entrada é alcançável só pelo sitemap, e sitemap é
    // sugestão de rastreamento, não sinal de importância. `/perguntas` nasceu
    // órfã: 168 links de saída e nenhum de entrada.
    const footer = readFileSync(join(RAIZ, 'src', 'components', 'SiteFooter.tsx'), 'utf8');
    for (const rota of ['/perguntas', '/temas']) {
      expect(footer, `rodapé sem link para ${rota}`).toContain(`href="${rota}"`);
    }
  });

  it('todo módulo liga os temas a que pertence', () => {
    const pagina = readFileSync(join(RAIZ, 'src', 'app', 'aprenda', '[slug]', 'page.tsx'), 'utf8');
    expect(pagina).toContain('getTemasDoModulo');
    expect(pagina).toMatch(/href=\{`\/temas\/\$\{t\.slug\}`\}/);
  });
});

describe('grafo de entidades do site', () => {
  const nos = SITE_GRAPH['@graph'] as Record<string, unknown>[];

  it('declara escola, autor e site, cada um com @id estável', () => {
    expect(nos.map(n => n['@type'])).toEqual(['EducationalOrganization', 'Person', 'WebSite']);
    expect(nos.map(n => n['@id'])).toEqual([ID.organizacao, ID.autor, ID.site]);
  });

  it('o autor tem perfis verificáveis', () => {
    // `sameAs` é o sinal de experiência mais direto de um site de autor único.
    const autor = nos.find(n => n['@type'] === 'Person')!;
    const perfis = autor.sameAs as string[];
    expect(perfis.length).toBeGreaterThanOrEqual(2);
    for (const p of perfis) expect(p).toMatch(/^https:\/\//);
  });

  it('escola e autor se referenciam por @id, sem duplicar o objeto', () => {
    const org = nos.find(n => n['@type'] === 'EducationalOrganization')!;
    const autor = nos.find(n => n['@type'] === 'Person')!;
    expect(org.founder).toEqual({ '@id': ID.autor });
    expect(autor.worksFor).toEqual({ '@id': ID.organizacao });
  });

  it('NÃO declara SearchAction', () => {
    // A caixa de busca em resultado exige uma URL de busca com parâmetro. A rota
    // `/search` foi removida no pivot de jul/2026 — declarar apontaria para 404.
    // Quando existir `/busca?q=`, este teste sai junto com a implementação.
    const bruto = JSON.stringify(SITE_GRAPH);
    expect(bruto).not.toMatch(/SearchAction/);
    const arquivo = readFileSync(join(RAIZ, 'src', 'lib', 'site-jsonld.ts'), 'utf8');
    expect(arquivo).toMatch(/SearchAction/); // a decisão está documentada
  });

  it('o artigo referencia as entidades por @id', () => {
    const src = readFileSync(join(RAIZ, 'src', 'components', 'article', 'ArticleJsonLd.tsx'), 'utf8');
    expect(src).toMatch(/'@id':\s*ID\.autor/);
    expect(src).toMatch(/'@id':\s*ID\.organizacao/);
  });

  it('o layout raiz emite o grafo uma única vez', () => {
    const layout = readFileSync(join(RAIZ, 'src', 'app', 'layout.tsx'), 'utf8');
    expect(layout).toContain('SITE_GRAPH');
    expect(layout.match(/SITE_GRAPH/g)?.length).toBe(2); // import + uso
  });
});
