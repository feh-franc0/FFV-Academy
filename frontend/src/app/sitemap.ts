import { MetadataRoute } from 'next';
import { CURRICULUM, HUBS } from '@/lib/curriculum';
import { MINIMO_PARA_PAGINA, TEMAS, getTemaStats } from '@/lib/curriculum/temas';
import { SIMULADOS_CATALOG } from '@/lib/simulados-catalog';
import manifesto from '@/lib/content-manifest.json';
import datasDeConteudo from '@/lib/content-dates.json';

/**
 * Sitemap da plataforma.
 *
 * Duas regras que existem por causa de defeitos reais encontrados em auditoria:
 *
 * 1. MÓDULO SÓ ENTRA SE TIVER CONTEÚDO. Antes, o sitemap mapeava
 *    `CURRICULUM.flatMap(t => t.modules)` — todas as 415 URLs declaradas. As 27
 *    sem conteúdo escrito respondem 404, e eram entregues ao Google: crawl
 *    budget desperdiçado e, pior, resultado de busca levando o usuário direto ao
 *    erro. O filtro usa `content-manifest.json`, gerado por
 *    scripts/import-blocks/src/extract-curriculum.ts (não dá para ler
 *    scripts/seeds/ em runtime: fica fora do contexto de build do Docker).
 *
 * 2. A LISTA ESTÁTICA É VERIFICADA POR TESTE. Ela tinha `/acessibilidade`,
 *    `/ds-algoritmos` e `/testing-engineering` — três rotas deletadas no pivot de
 *    jul/2026 — anunciando 404 havia meses. Lista escrita à mão sempre apodrece,
 *    então sitemap.test.ts confere que toda URL daqui corresponde a uma rota
 *    existente. Adicionar rota morta aqui quebra o CI.
 */

export const dynamic = 'force-static';

/**
 * ## `lastModified` existe SÓ para artigo, e só quando há data real
 *
 * ### O que aconteceu antes
 *
 * Até 06/ago/2026 todas as URLs recebiam `new Date()` do momento do build. Medido:
 * **520 URLs com o mesmo `<lastmod>`**. Isso não é informação, é ruído assinado —
 * a cada deploy o sitemap afirmava ao Google que as 520 páginas mudaram, o que é
 * falso para praticamente todas.
 *
 * O Google usa `lastmod` **apenas se ele for consistentemente exato**; diante de
 * valor que não confere, passa a ignorar o campo — inclusive para as páginas que
 * de fato mudaram. Ou seja, o campo falso não era neutro: custava o sinal. Por
 * isso o campo foi removido, e a ausência ficou registrada como decisão.
 *
 * As fontes de data que foram examinadas e descartadas, para não serem
 * reexaminadas:
 *
 *  - os seeds em `scripts/seeds/articles/*.json` não têm campo de data;
 *  - `content-manifest.json` não carrega data (é gerado dos seeds);
 *  - `mtime` de arquivo é a hora do checkout em CI e no Docker;
 *  - `git log` não serve: o checkout do CI é raso (`fetch-depth` padrão = 1).
 *
 * ### O que mudou em 07/ago/2026
 *
 * A quinta fonte — `curriculum_articles.updated_at` — era falsa pelo mesmo motivo
 * que a data de build: o importador fazia `SET updated_at = now()`
 * INCONDICIONALMENTE em todos os 427 artigos, a cada execução.
 *
 * Isso foi corrigido na origem: a migration 000045 acrescentou `content_hash`, e
 * o importador só move `updated_at` quando o hash do conteúdo NORMALIZADO muda
 * (`backend/cmd/importer/hash.go` — ordem de chave estável, `id` de bloco fora do
 * cálculo, fim de linha e espaço à direita descartados). A data passou a
 * significar "este artigo mudou".
 *
 * ### As três regras que sobraram
 *
 * 1. **Só artigo declara `lastModified`.** Página estática, hub, trilha, tema e
 *    simulado não têm data de conteúdo — são derivadas do currículo, e a data
 *    delas seria a do build outra vez.
 *
 * 2. **Só slug presente em `content-dates.json`.** Esse arquivo é escrito pelo
 *    importador (`--emit-dates`) e contém apenas artigo com `content_hash`
 *    preenchido. Artigo cuja data ainda é de um deploy antigo fica de fora — a
 *    ausência é honesta, a data velha seria mentira.
 *
 * 3. **Arquivo vazio é estado válido, e é o padrão.** Sem banco no build, nenhuma
 *    URL declara `lastmod`, que é exatamente o comportamento de 06/ago. A volta do
 *    campo não pode depender de haver banco no build — pode depender de haver
 *    data, que é coisa diferente.
 */

/** Slugs com conteúdo escrito — só estes podem ser anunciados. */
const COM_CONTEUDO = new Set(manifesto.slugs);

/**
 * slug → data da última mudança real. Vazio hoje, e vazio é válido: sem data, a
 * URL sai sem `lastmod`, que é o estado de 06/ago e a resposta honesta.
 */
const DATAS: Record<string, string> = datasDeConteudo.datas;

/**
 * Páginas fixas, com prioridade editorial. Mantida à mão porque a prioridade e a
 * frequência são decisão editorial, não derivável — mas validada por teste.
 */
export const PAGINAS_ESTATICAS: { path: string; freq: 'daily' | 'weekly' | 'monthly' | 'yearly'; prio: number }[] = [
  { path: '/', freq: 'weekly', prio: 1.0 },
  // Prioridade logo abaixo da home: é a página que responde "por onde começo?",
  // a consulta de maior intenção do domínio, e a única que liga as 38 trilhas.
  { path: '/jornada', freq: 'monthly', prio: 0.95 },
  { path: '/explorar', freq: 'weekly', prio: 0.8 },
  { path: '/simulados', freq: 'monthly', prio: 0.9 },
  { path: '/ranking', freq: 'daily', prio: 0.9 },
  { path: '/news', freq: 'daily', prio: 0.9 },
  { path: '/mapa', freq: 'monthly', prio: 0.7 },
  { path: '/roadmaps', freq: 'monthly', prio: 0.7 },
  { path: '/playlists', freq: 'monthly', prio: 0.7 },
  { path: '/cheatsheets', freq: 'monthly', prio: 0.7 },
  { path: '/glossario', freq: 'monthly', prio: 0.6 },
  { path: '/temas', freq: 'monthly', prio: 0.8 },
  { path: '/perguntas', freq: 'weekly', prio: 0.9 },
  { path: '/sobre', freq: 'monthly', prio: 0.7 },
  { path: '/comunidade', freq: 'monthly', prio: 0.7 },
  { path: '/newsletter', freq: 'weekly', prio: 0.7 },
  { path: '/privacidade', freq: 'yearly', prio: 0.4 },
  { path: '/verificar', freq: 'yearly', prio: 0.4 },
  // `/progresso`, `/perfil` e `/revisar` saíram: passaram a declarar `noindex`
  // na auditoria de 05/ago/2026, porque o conteúdo é do usuário, não do site.
  // Anunciar no sitemap URL que pede para não ser indexada é sinal contraditório.
  //
  // Pelo MESMO princípio, a auditoria de 06/ago/2026 tirou do índice mais cinco,
  // que respondiam 200 e eram indexáveis sem estar aqui: `/devcard`, `/plano`,
  // `/times` e `/certificacoes` mostram dado do usuário (rastreador anônimo vê o
  // estado vazio), e `/simulados/cloud-practitioner/estudo` é envolvida em
  // `RequireAuth` — indexar parede de login entrega resultado inútil.
  // Landings de aquisição
  { path: '/claude-code-vs-cursor', freq: 'monthly', prio: 0.8 },
  { path: '/melhores-ferramentas-ia-codigo-2026', freq: 'monthly', prio: 0.8 },
  // Lead magnet: existe para ser encontrado, e o conteúdo é do site, não do
  // usuário. Estava fora do sitemap por esquecimento, não por decisão.
  { path: '/cheatsheet', freq: 'monthly', prio: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://fernandofrancovalle.com';

  const estaticas = PAGINAS_ESTATICAS.map(p => ({
    // A raiz sai SEM barra. O Next remove a barra final da canônica (medido em
    // 06/ago/2026: escrevi `.com/` e o HTML servido trouxe `.com`), e sitemap e
    // canônica discordando sobre a mesma página é achado de auditoria.
    url: p.path === '/' ? base : `${base}${p.path}`,
    changeFrequency: p.freq,
    priority: p.prio,
  }));

  const hubs = HUBS.map(hub => ({
    url: `${base}${hub.href}`,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const trilhas = CURRICULUM.filter(t => t.href).map(trail => ({
    url: `${base}${trail.href}`,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  /**
   * Só tema publicado entra. `generateStaticParams` de `/temas/[tema]` usa o
   * mesmo limiar, e anunciar rota que o build não gerou é o defeito que o
   * comentário 1 acima descreve — com a agravante de ser derivável.
   */
  const temas = TEMAS.filter(t => getTemaStats(t.id).modules >= MINIMO_PARA_PAGINA).map(t => ({
    url: `${base}/temas/${t.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const simulados = SIMULADOS_CATALOG.map(s => ({
    url: `${base}/simulados/${s.id.replace(/^simulado-/, '')}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const artigos = CURRICULUM.flatMap(trail =>
    trail.modules
      .filter(mod => COM_CONTEUDO.has(mod.slug))
      .map(mod => {
        const quando = DATAS[mod.slug];
        return {
          url: `${base}/aprenda/${mod.slug}`,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
          // Campo OMITIDO quando não há data — e não preenchido com um palpite.
          // `lastModified: undefined` e a ausência da chave dão o mesmo resultado
          // no XML, mas a condicional deixa explícito que a ausência é decisão.
          ...(quando ? { lastModified: quando } : {}),
        };
      }),
  );

  return [...estaticas, ...hubs, ...trilhas, ...temas, ...simulados, ...artigos];
}
