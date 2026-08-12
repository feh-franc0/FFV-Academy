import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

// Import ESTÁTICO de propósito: `await import()` de um `.ts` não passa pelo
// transpilador do Playwright e falha com "Unexpected token 'export'". Este módulo
// não importa nada, então trazê-lo aqui não arrasta cadeia de `@/`.
import { ROTAS_RETIRADAS } from '../src/lib/rotas-retiradas';

/**
 * Varredura de TODAS as rotas do site.
 *
 * Os testes de rota que existiam cobriam uma lista escolhida à mão de slugs
 * "críticos". Isso prova que aqueles funcionam — não que os outros 400
 * funcionam. A plataforma tem 415 páginas de conteúdo e dezenas de páginas
 * estáticas, e um 404 em qualquer uma é invisível até alguém reclamar.
 *
 * ## Duas passadas, por um motivo de custo medido
 *
 * A primeira versão renderizava cada página no navegador e levou 10 minutos
 * para 95 rotas — estourou o próprio limite e o relatório virou uma cascata de
 * "browser closed" que escondia os defeitos reais.
 *
 * As páginas são pré-renderizadas, então o HTML servido já contém tudo o que
 * importa para as checagens estruturais. A varredura completa passou a ser
 * feita por requisição HTTP + leitura do HTML, o que a torna viável para
 * centenas de rotas. A renderização de verdade — que é a única forma de pegar
 * erro de hidratação e exceção de cliente — roda sobre uma amostra.
 *
 * O que a passada estrutural verifica, em TODAS as rotas:
 *   1. HTTP 200;
 *   2. `<h1>` presente e com texto — shell vazio responde 200 e não ensina nada;
 *   3. ausência da mensagem de página não encontrada;
 *   4. volume mínimo de conteúdo;
 *   5. nas rotas de módulo, ao menos um `data-ffv-visual` — apoio visual é
 *      requisito do padrão de ensino da casa, não enfeite.
 *
 * Falhas são ACUMULADAS e reportadas juntas: parar na primeira esconderia o
 * mapa, que é o valor da varredura.
 */

const RAIZ = process.cwd();
const APP = join(RAIZ, 'src', 'app');

function slugsDeConteudo(): string[] {
  const m = JSON.parse(
    readFileSync(join(RAIZ, 'src', 'lib', 'content-manifest.json'), 'utf8'),
  ) as { slugs: string[] };
  return m.slugs;
}

/**
 * Temas publicáveis, lidos da fonte no disco.
 *
 * `temas-mapa.ts` é gerado por `scripts/seo/gerar_corpus.py` e lista TODOS os
 * módulos do tema; a página só conta os que têm conteúdo escrito. A interseção
 * com o manifesto reproduz aqui a mesma regra que `getTemaStats` aplica lá — e é
 * de propósito que a duplicação seja explícita: se as duas divergirem, a
 * comparação com o sitemap acusa.
 */
function temasPublicados(): { publicados: string[]; minimo: number } {
  const mapaSrc = readFileSync(join(RAIZ, 'src', 'lib', 'curriculum', 'temas-mapa.ts'), 'utf8');
  const temasSrc = readFileSync(join(RAIZ, 'src', 'lib', 'curriculum', 'temas.ts'), 'utf8');
  const minimo = Number(/MINIMO_PARA_PAGINA\s*=\s*(\d+)/.exec(temasSrc)?.[1]);
  if (!minimo) throw new Error('não achei MINIMO_PARA_PAGINA em temas.ts');

  const comConteudo = new Set(slugsDeConteudo());
  const publicados: string[] = [];
  for (const m of mapaSrc.matchAll(/'([a-z0-9-]+)':\s*\[([^\]]*)\]/g)) {
    const slugs = [...m[2].matchAll(/'([a-z0-9-]+)'/g)].map(x => x[1]);
    if (slugs.filter(s => comConteudo.has(s)).length >= minimo) publicados.push(m[1]);
  }
  return { publicados, minimo };
}

/**
 * Rotas estáticas derivadas do diretório de rotas — não de uma lista mantida à
 * mão, que é o tipo de lista que envelhece calada. Segmentos dinâmicos ficam de
 * fora; eles são cobertos pelos slugs.
 */
function rotasEstaticas(dir = APP, prefixo = ''): string[] {
  const achadas: string[] = [];
  for (const e of readdirSync(dir)) {
    if (e.startsWith('_') || e.startsWith('.')) continue;
    const caminho = join(dir, e);
    if (!statSync(caminho).isDirectory()) continue;
    if (e.startsWith('[') || e.startsWith('(') || e === 'api') continue;
    const rota = `${prefixo}/${e}`;
    if (readdirSync(caminho).some(f => /^page\.(tsx|ts|jsx|js)$/.test(f))) achadas.push(rota);
    achadas.push(...rotasEstaticas(caminho, rota));
  }
  return achadas;
}

interface Falha { rota: string; motivo: string }

/** Texto visível aproximado: sem script, style nem marcação. */
function texto(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function conferirHtml(
  req: APIRequestContext, rota: string, exigirVisual: boolean,
): Promise<Falha[]> {
  const falhas: Falha[] = [];
  const resp = await req.get(rota, { failOnStatusCode: false }).catch(() => null);
  if (!resp) return [{ rota, motivo: 'sem resposta' }];
  if (resp.status() !== 200) return [{ rota, motivo: `HTTP ${resp.status()}` }];

  const html = await resp.text();
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  if (!h1 || !texto(h1[1])) falhas.push({ rota, motivo: 'sem <h1> com texto' });

  const corpo = texto(html);
  if (/could not be found/i.test(corpo)) {
    falhas.push({ rota, motivo: 'corpo indica página não encontrada' });
  }
  if (corpo.length < 400) {
    falhas.push({ rota, motivo: `apenas ${corpo.length} caracteres de texto` });
  }
  if (exigirVisual && !html.includes('data-ffv-visual')) {
    falhas.push({ rota, motivo: 'nenhum apoio visual (tabela, diagrama, fluxo…)' });
  }
  return falhas;
}

/** Passada cara: renderiza de verdade e escuta o console. */
async function conferirRender(page: Page, rota: string): Promise<Falha[]> {
  const erros: string[] = [];
  const onConsole = (m: { type(): string; text(): string }) => {
    if (m.type() === 'error') erros.push(m.text());
  };
  const onErr = (e: Error) => erros.push(`exceção: ${e.message}`);
  page.on('console', onConsole);
  page.on('pageerror', onErr);
  try {
    await page.goto(rota, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForTimeout(300); // dá tempo de a hidratação reclamar
  } catch (e) {
    return [{ rota, motivo: `falhou ao carregar: ${(e as Error).message.slice(0, 100)}` }];
  } finally {
    page.off('console', onConsole);
    page.off('pageerror', onErr);
  }
  const relevantes = erros.filter(e => !/favicon|DevTools|Failed to load resource/i.test(e));
  return relevantes.length ? [{ rota, motivo: `console: ${relevantes[0].slice(0, 150)}` }] : [];
}

function relatar(falhas: Falha[], total: number, oque: string) {
  if (!falhas.length) return;
  throw new Error(
    `${falhas.length} de ${total} ${oque} com problema:\n` +
    falhas.map(f => `  ${f.rota} → ${f.motivo}`).join('\n'),
  );
}

test.describe('varredura completa do site', () => {
  test('rotas estáticas: 200, título e conteúdo', async ({ request }) => {
    test.setTimeout(10 * 60_000);
    const rotas = ['/', ...rotasEstaticas()];
    expect(rotas.length).toBeGreaterThan(50);
    const falhas: Falha[] = [];
    for (const r of rotas) falhas.push(...(await conferirHtml(request, r, false)));
    relatar(falhas, rotas.length, 'rotas estáticas');
  });

  test('páginas de módulo: 200, título, conteúdo e apoio visual', async ({ request }) => {
    test.setTimeout(20 * 60_000);
    const slugs = slugsDeConteudo();
    expect(slugs.length, 'o manifesto deveria listar centenas de slugs').toBeGreaterThan(300);
    const falhas: Falha[] = [];
    for (const s of slugs) falhas.push(...(await conferirHtml(request, `/aprenda/${s}/`, true)));
    relatar(falhas, slugs.length, 'páginas de módulo');
  });

  test('acessibilidade: nenhuma violação estrutural, e contraste sob teto declarado', async ({ page }) => {
    test.setTimeout(15 * 60_000);
    /**
     * Primeira medição de acessibilidade da plataforma, com axe-core, em
     * 06/ago/2026. Ela achou três violações SÉRIAS em **toda** página, porque
     * moravam em componente compartilhado:
     *
     *  1. `aria-progressbar-name` — a barra de XP do GameHUD sem nome acessível.
     *  2. `nested-interactive` — `TooltipTrigger` (um <button>) envolvendo um <a>.
     *     Leitor de tela anuncia um e some com o outro.
     *  3. `scrollable-region-focusable` — o diagrama de arquitetura rola na
     *     horizontal e não recebia foco: quem usa teclado não alcançava o que
     *     estava à direita. Dez por página nos módulos de arquitetura.
     *
     * As três foram corrigidas. Esta checagem existe para elas não voltarem — e
     * para o contraste, que é dívida MAIOR e ainda aberta, ficar visível.
     *
     * ## Por que teto em vez de zero
     *
     * Restam ~479 nós de `color-contrast`: as paletas de trilha, hub, tema e
     * nível são da linhagem GitHub **dark** e falham WCAG AA como texto sobre
     * fundo claro — 41 das 43 cores, entre 1,57:1 e 4,35:1. O conserto existe
     * (`.ffv-acento-texto` em globals.css, com fator calculado) e foi aplicado
     * onde mais repetia; o resto são ~40 pontos de `style={{ color: X }}`
     * espalhados, e cada um precisa de conferência visual nos dois temas.
     *
     * Exigir zero agora reprovaria o CI sem ninguém poder consertar no mesmo
     * commit — e a saída seria desligar a checagem. Teto por rota transforma a
     * dívida em número que só pode DESCER: baixar o teto é o trabalho, e subir
     * exige explicar por quê.
     */
    const AXE = readFileSync(join(RAIZ, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');

    /**
     * Teto de nós com `color-contrast` por rota — **remedido em 07/ago/2026**,
     * sobre o build, que é a condição em que esta varredura roda. (Medir no `next
     * dev` dá números diferentes; a primeira tentativa de atualizar esta tabela
     * comparou dev contra build e concluiu que sete rotas tinham regredido.)
     *
     * ## A descida: 480 → 308 nos mesmos 20 alvos
     *
     * A dívida era `style={{ color: cor }}` com paleta de trilha e de hub — cores
     * da linhagem GitHub **dark**, que como TEXTO sobre fundo claro ficam entre
     * 1,3:1 e 2,3:1. `.ffv-acento-texto` já existia em `globals.css` desde
     * ago/2026 e estava aplicado em dois lugares. Aplicá-lo onde faltava:
     *
     *   /mapa                    82 → 2    (7 hubs × 41 trilhas na mesma página)
     *   /aws-bedrock             39 → 3
     *   /ia                      31 → 1
     *   /arquiteturas-ia-aws     17 → 3
     *   /aws                     11 → 1
     *   bedrock-knowledge-bases   8 → 5
     *
     * O teto só desce. Ele foi descido junto com a correção, no mesmo commit —
     * deixá-lo alto depois de consertar devolveria o espaço para a dívida voltar
     * sem ninguém notar, que é o oposto do motivo pelo qual ele existe.
     *
     * ## O que sobra, nomeado
     *
     * `/glossario` (68), `/explorar` (61), `/simulados` (45), `/perguntas` (34) e
     * `/temas` (24) são a maior parte do que resta. `/aprenda/…` tem dois padrões
     * de componente: rótulo de passo de `flow_diagram` em `--ffv-blue` a 4,25:1 (a
     * 8 de 4,5) e botão de TOC a 4,17:1. São variável de paleta usada como texto,
     * não cor de trilha — outra correção, e ela mexe nos dois temas.
     */
    const TETO: Record<string, number> = {
      '/': 0, '/explorar': 0, '/temas': 4, '/perguntas': 0, '/temas/agentes': 0,
      '/ranking': 0, '/arquiteturas-ia-aws': 2, '/aws-bedrock': 2, '/ia': 0,
      '/aws': 0, '/simulados': 0, '/sobre': 0, '/glossario': 0, '/cheatsheets': 3,
      '/mapa': 1, '/comunidade': 3, '/newsletter': 1, '/verificar': 1,
      '/aprenda/arq-ia-aws-atendimento': 0, '/aprenda/bedrock-knowledge-bases-rag': 2,
      // Rotas do laboratório L01, auditadas desde que entraram. Lista explícita
      // significa que rota nova escapa da auditoria se ninguém a acrescentar.
      '/exemplos-arquitetura-aws': 2, '/aprenda/lab-app-web-ecs-fargate-rds': 0,
      '/aprenda/lab-rede-vpc-subrede-privada-nat': 0,
      '/aprenda/lab-deploy-ecr-rolling-update-drenagem': 0,
      '/aprenda/lab-segredo-secrets-manager-rotacao': 0,
      '/aprenda/lab-dominio-tls-cloudfront-estatico': 0,
      '/aprenda/lab-escala-automatica-ecs-metrica': 0,
      '/aprenda/lab-banco-replica-multiaz-pool': 0,
      '/aprenda/lab-api-gateway-cota-versao-ou-alb': 0,
      '/aprenda/lab-autenticacao-cognito-sessao-sem-estado': 0,
      '/aprenda/lab-escolher-banco-pela-carga': 0,
      '/aprenda/lab-cache-redis-invalidacao-p95': 0,
      '/aprenda/lab-upload-direto-s3-url-assinada': 0,
      '/aprenda/lab-migration-expand-contract-sem-janela': 0,
      '/aprenda/lab-observabilidade-trace-correlacao': 0,
      '/aprenda/lab-custo-tags-orcamento-rateio': 0,
      '/aprenda/lab-spa-na-borda-ou-ssr-no-conteiner': 0,
      '/aprenda/lab-restauracao-ensaiada-rto-rpo': 0,
      '/aprenda/lab-aurora-serverless-v2-endpoint-failover': 0,
      '/aprenda/lab-dynamodb-modelagem-tabela-unica': 0,
      '/aprenda/lab-busca-catalogo-opensearch-vs-like': 0,
      '/aprenda/lab-lambda-dotnet8-cold-start': 0,
      '/aprenda/lab-fila-sqs-dlq-idempotencia': 0,
      '/aprenda/lab-fanout-sns-sqs-multiplos-consumidores': 0,
      '/aprenda/lab-eventbridge-espinha-dorsal': 0,
      '/aprenda/lab-step-functions-orquestracao-ou-codigo': 0,
      '/aprenda/lab-api-serverless-onde-nao-serve': 0,
      '/aprenda/lab-eventbridge-scheduler-sem-ec2-cron': 0,
      '/aprenda/lab-pipeline-s3-evento-processamento': 0,
      '/aprenda/lab-streaming-mudanca-dynamodb-streams': 0,
      '/aprenda/lab-limites-serverless-medidos': 0,
      '/aprenda/lab-extrair-servico-fronteira-transacao': 0,
      '/aprenda/lab-sincrono-ou-assincrono-entre-servicos': 0,
      '/aprenda/lab-descoberta-servico-connect-lattice': 0,
      '/aprenda/lab-eks-quando-ecs-nao-basta': 0,
      '/aprenda/lab-saga-transacao-distribuida-compensacao': 0,
      '/aprenda/lab-retry-backoff-jitter-circuit-breaker-polly': 0,
      '/aprenda/lab-consistencia-eventual-ponto-de-vista-usuario': 0,
      '/aprenda/lab-multi-tenant-linha-schema-conta': 0,
      '/aprenda/lab-blue-green-canario-codedeploy-ecs': 0,
      '/aprenda/lab-teste-de-carga-gargalo-real': 0,
      '/aprenda/lab-iam-policy-menor-privilegio-auditoria': 0,
      '/aprenda/lab-identidade-workload-task-role-irsa': 0,
      '/aprenda/lab-multi-conta-organizations-scp-control-tower': 0,
      '/aprenda/lab-endpoint-vpc-privatelink-sem-nat': 0,
      '/aprenda/lab-rede-hibrida-vpn-direct-connect-transit-gateway': 0,
      '/aprenda/lab-kms-envelope-cmk-rotacao': 0,
      '/aprenda/lab-waf-shield-bloqueio-na-borda': 0,
      '/aprenda/lab-deteccao-guardduty-security-hub-config': 0,
      '/aprenda/lab-dado-pessoal-minimizar-mascarar-macie': 0,
      '/aprenda/lab-resposta-incidente-blast-radius': 0,
      '/aprenda/lab-opentelemetry-tres-pilares-dotnet': 0,
      '/aprenda/lab-slo-error-budget-alarme-acionavel': 0,
      '/aprenda/lab-dashboard-pergunta-operacional': 0,
      '/aprenda/lab-pipeline-cicd-oidc-sem-chave': 0,
      '/aprenda/lab-terraform-modulo-estado-remoto-drift': 0,
      '/aprenda/lab-ambiente-por-conta-sem-copiar-colar': 0,
      '/aprenda/lab-chaos-derrubar-az-fis': 0,
      '/aprenda/lab-dr-multiregiao-quatro-estrategias': 0,
      '/aprenda/lab-finops-rightsizing-antes-compromisso': 0,
      '/aprenda/lab-well-architected-review-seis-pilares': 0,
      '/aprenda/lab-operacional-analitico-extracao-incremental': 0,
      '/aprenda/lab-data-lake-bronze-prata-ouro': 0,
      '/aprenda/lab-kinesis-shard-ordem-reprocesso': 0,
      '/aprenda/lab-parquet-particao-arquivo-pequeno': 0,
      '/aprenda/lab-glue-catalog-crawler-job-idempotente': 0,
      '/aprenda/lab-athena-consulta-barata-workgroup': 0,
      '/aprenda/lab-iceberg-upsert-time-travel': 0,
      '/aprenda/lab-redshift-dashboard-lento': 0,
      '/aprenda/lab-lake-formation-permissao-coluna': 0,
      '/aprenda/lab-qualidade-dado-contrato-quarentena': 0,
      '/aprenda/lab-regra-ou-modelo-baseline': 0,
      '/aprenda/lab-feature-store-treino-inferencia': 0,
      '/aprenda/lab-sagemaker-treino-experimento-rastreavel': 0,
      '/aprenda/lab-servir-modelo-quatro-modos-inferencia': 0,
      '/aprenda/lab-model-registry-promocao-rollback': 0,
      '/aprenda/lab-pipeline-ml-ponta-a-ponta': 0,
      '/aprenda/lab-drift-dado-conceito-model-monitor': 0,
      '/aprenda/lab-metrica-modelo-vs-negocio': 0,
      '/aprenda/lab-consumir-modelo-dotnet-fallback': 0,
      '/aprenda/lab-custo-ml-onde-vaza': 0,
      '/aprenda/lab-bedrock-primeira-chamada-dotnet': 0,
      '/aprenda/lab-prompt-versionado-teste-regressao': 0,
      '/aprenda/lab-rag-minimo-com-citacao': 0,
      '/aprenda/lab-onde-guardar-vetor-quatro-opcoes': 0,
      '/aprenda/lab-recuperacao-hibrida-reranking': 0,
      '/aprenda/lab-guardrails-limite-do-controle': 0,
      '/aprenda/lab-agente-com-ferramenta-quem-executa': 0,
      '/aprenda/lab-avaliar-sistema-llm-juiz': 0,
      '/aprenda/lab-custo-latencia-genai': 0,
      '/aprenda/lab-prompt-injection-vazamento-inquilinos': 0,
      '/aprenda/lab-atendimento-voz-prazo-escalonamento': 0,
      '/aprenda/lab-idp-extracao-confianca-revisao-humana': 0,
      '/aprenda/lab-copiloto-interno-permissao-por-fonte': 0,
      '/aprenda/lab-busca-produto-hibrida-rerank-geracao': 0,
      '/aprenda/lab-enriquecimento-lote-acervo': 0,
      '/aprenda/lab-agente-diagnostica-incidente-somente-leitura': 0,
      '/aprenda/lab-trilha-imutavel-decisao-automatizada': 0,
      '/aprenda/lab-plataforma-ia-multi-time-cota-chargeback': 0,
      '/aprenda/lab-multi-regiao-ia-residencia-de-dado': 0,
      '/aprenda/lab-projeto-final-plataforma-dotnet-aws-ia': 0,
    };

    const falhas: Falha[] = [];
    for (const [rota, teto] of Object.entries(TETO)) {
      await page.goto(rota, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      // O modal de boas-vindas cobre a página e mede a si mesmo, não a rota.
      await page.evaluate(() => {
        document.querySelectorAll('[role="dialog"]').forEach(e => e.remove());
      });
      await page.addScriptTag({ content: AXE });
      const res = await page.evaluate(async () =>
        // @ts-expect-error axe é injetado em runtime
        await window.axe.run(document, { resultTypes: ['violations'] }),
      ) as { violations: { id: string; impact: string; nodes: unknown[] }[] };

      const graves = res.violations.filter(v => ['critical', 'serious'].includes(v.impact));
      for (const v of graves) {
        const n = v.nodes.length;
        if (v.id === 'color-contrast') {
          if (n > teto) {
            falhas.push({ rota, motivo: `contraste: ${n} nós, teto declarado ${teto}` });
          }
        } else {
          // Qualquer violação ESTRUTURAL é regressão: o teto não a cobre.
          falhas.push({ rota, motivo: `[${v.impact}] ${v.id} ×${n} — violação estrutural` });
        }
      }
    }
    relatar(falhas, Object.keys(TETO).length, 'rotas auditadas com axe-core');
  });

  test('imagem social por módulo: og:image presente, próprio e servindo PNG', async ({ request }) => {
    test.setTimeout(10 * 60_000);
    /**
     * O defeito que esta checagem existe para impedir só era visível no HTML
     * SERVIDO. As 426 páginas de módulo saíam **sem `og:image` nenhum**: havia
     * apenas `twitter:image`, herdado do layout raiz, e `twitter:image` serve ao X
     * e a mais nada. Facebook, LinkedIn, WhatsApp, Slack e Discord leem
     * `og:image` — todo link de módulo compartilhado neles ia sem imagem.
     *
     * E `twitter:title`/`twitter:description` também vinham do layout raiz, então
     * compartilhar QUALQUER módulo anunciava "FFV Academy — Escola de Engenharia
     * para a Era da IA" em vez do módulo.
     *
     * Nenhum teste de componente pega isso: a metadata é resolvida pelo Next no
     * servidor, e o defeito nasce da interação entre `generateMetadata` e a
     * convenção de arquivo. Só ler o `<head>` entregue prova.
     */
    const slugs = slugsDeConteudo();
    // Amostra espalhada: gerar 426 imagens de 97 KB dominaria a varredura.
    const amostra = slugs.filter((_, i) => i % 37 === 0);
    const falhas: Falha[] = [];

    for (const slug of amostra) {
      const resp = await request.get(`/aprenda/${slug}/`, { failOnStatusCode: false });
      if (resp.status() !== 200) {
        falhas.push({ rota: slug, motivo: `página HTTP ${resp.status()}` });
        continue;
      }
      const head = (await resp.text()).split('</head>')[0];

      const og = /<meta property="og:image"[^>]*content="([^"]+)"/.exec(head)?.[1];
      if (!og) {
        falhas.push({ rota: slug, motivo: 'sem og:image no head' });
        continue;
      }
      if (!og.includes(slug)) {
        falhas.push({ rota: slug, motivo: `og:image genérico, não do módulo: ${og}` });
      }

      const img = await request.get(og.replace('https://fernandofrancovalle.com', ''),
                                    { failOnStatusCode: false });
      if (img.status() !== 200) {
        falhas.push({ rota: slug, motivo: `og:image responde ${img.status()}` });
      } else if (!/^image\//.test(img.headers()['content-type'] ?? '')) {
        falhas.push({ rota: slug, motivo: `og:image não é imagem: ${img.headers()['content-type']}` });
      }

      // O título social precisa ser do MÓDULO, não do site.
      const twTitle = /<meta name="twitter:title"[^>]*content="([^"]+)"/.exec(head)?.[1] ?? '';
      if (/^FFV Academy — Escola de Engenharia/.test(twTitle)) {
        falhas.push({ rota: slug, motivo: 'twitter:title é o genérico do layout raiz' });
      }
    }

    expect(amostra.length, 'a amostra não pode ficar vazia').toBeGreaterThan(8);
    relatar(falhas, amostra.length, 'módulos conferidos na imagem social');
  });

  test('as 100 arquiteturas chegam à tela, dez por módulo', async ({ request }) => {
    test.setTimeout(5 * 60_000);
    /**
     * A checagem anterior exige ao menos UM `data-ffv-visual` por módulo. Isso não
     * distingue módulo com dez diagramas de módulo com um — e nesta trilha o
     * diagrama É o conteúdo: se nove desaparecerem, o módulo continua respondendo
     * 200, com `<h1>`, com prosa e com um visual.
     *
     * O caminho pelo qual eles desaparecem é conhecido e silencioso: bloco que o
     * Zod recusa devolve `null` e o `BlockRenderer` não renderiza nada, sem erro.
     * `arquiteturas-100.test.ts` valida os seeds contra o schema; esta checagem
     * confirma no HTML SERVIDO — que é a única prova de que o dado atravessou o
     * importador, a API, o adapter e o renderizador.
     */
    const modulos = [
      'atendimento', 'documentos', 'busca', 'agentes', 'copiloto',
      'dados', 'conteudo', 'risco', 'plataforma', 'operacao',
    ].map(f => `arq-ia-aws-${f}`);

    const falhas: Falha[] = [];
    let total = 0;
    for (const slug of modulos) {
      const r = await request.get(`/aprenda/${slug}/`);
      if (!r.ok()) {
        falhas.push({ rota: slug, motivo: `HTTP ${r.status()}` });
        continue;
      }
      const html = await r.text();
      const n = (html.match(/data-ffv-visual="ArchDiagram"/g) ?? []).length;
      total += n;
      if (n !== 10) {
        falhas.push({ rota: slug, motivo: `${n} diagramas no HTML (esperado 10)` });
      }
      // Passo sem botão é passo que ninguém percorre: o diagrama vira figura.
      const passos = (html.match(/aria-label="Passos do fluxo"/g) ?? []).length;
      if (passos !== 10) {
        falhas.push({ rota: slug, motivo: `${passos} diagramas com passos (esperado 10)` });
      }
    }
    expect(total, 'o total servido deve ser 100 arquiteturas').toBe(100);
    relatar(falhas, modulos.length, 'módulos de arquitetura');
  });

  test('TODAS as telas renderizadas: sem erro de console nem exceção', async ({ page }) => {
    test.setTimeout(35 * 60_000);
    const slugs = slugsDeConteudo();

    /**
     * Renderiza de verdade **toda tela navegável**: as rotas estáticas, as páginas
     * de tema e os 416 módulos.
     *
     * A versão anterior renderizava uma amostra de um a cada 25 módulos, e a razão
     * era custo: a primeira tentativa levou 10 minutos para 95 rotas e estourou o
     * limite. O que mudou é que agora só a renderização pega o que importa aqui —
     * erro de hidratação e exceção de cliente — e amostra de 4% deixa 96% dos
     * módulos sem nunca ter sido abertos num navegador.
     *
     * O custo é real: esta checagem sozinha domina o tempo da varredura. Ela roda
     * na varredura completa (`npm run varredura`), não no fluxo de cada commit.
     */
    const telas = [
      ...rotasEstaticas().filter(r => !r.includes('[')),
      ...temasPublicados().publicados.map(t => `/temas/${t}`),
      ...slugs.map(s => `/aprenda/${s}`),
    ];
    expect(telas.length, 'deveria cobrir centenas de telas').toBeGreaterThan(450);

    const falhas: Falha[] = [];
    for (const r of telas) falhas.push(...(await conferirRender(page, r)));
    relatar(falhas, telas.length, 'telas renderizadas');
  });

  test('amostra renderizada com foco em JavaScript de cliente', async ({ page }) => {
    test.setTimeout(10 * 60_000);
    const slugs = slugsDeConteudo();
    // As rotas de aplicação que têm mais JavaScript do lado do cliente, mais uma
    // amostra espalhada de módulos. Existe separada da checagem de todas as telas
    // para dar sinal rápido quando alguém quer rodar só uma delas.
    const amostra = [
      '/', '/progresso', '/revisar', '/ranking', '/explorar', '/simulados', '/verificar', '/mapa',
      ...slugs.filter((_, i) => i % 25 === 0).map(s => `/aprenda/${s}/`),
    ];
    const falhas: Falha[] = [];
    for (const r of amostra) falhas.push(...(await conferirRender(page, r)));
    relatar(falhas, amostra.length, 'páginas renderizadas na amostra');
  });

  test('dados estruturados válidos e sem identificador interno em todo módulo', async ({ request }) => {
    test.setTimeout(20 * 60_000);
    // Só o navegador — ou a leitura do HTML servido — enxerga isto. Teste de
    // componente prova que o gerador funciona; não prova que a página emite.
    const falhas: Falha[] = [];
    for (const s of slugsDeConteudo()) {
      const rota = `/aprenda/${s}/`;
      const resp = await request.get(rota, { failOnStatusCode: false }).catch(() => null);
      if (resp?.status() !== 200) { falhas.push({ rota, motivo: `HTTP ${resp?.status()}` }); continue; }
      const html = await resp.text();

      const blocos: Record<string, unknown>[] = [];
      for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
        try {
          blocos.push(JSON.parse(m[1].replace(/\\u003c/g, '<')));
        } catch {
          // JSON-LD que não parseia é descartado pelo buscador em silêncio —
          // pior que bloco ausente, porque parece existir.
          falhas.push({ rota, motivo: 'bloco de dado estruturado não parseia' });
        }
      }
      const tipos = blocos.map(b => b['@type']);
      if (!tipos.includes('Article')) falhas.push({ rota, motivo: 'sem Article' });
      if (!tipos.includes('BreadcrumbList')) falhas.push({ rota, motivo: 'sem BreadcrumbList' });
      if (!tipos.includes('Quiz')) falhas.push({ rota, motivo: 'sem Quiz (a página tem 3 perguntas)' });

      const artigo = blocos.find(b => b['@type'] === 'Article');
      const desc = String((artigo?.description as string) ?? '');
      // O defeito real: `Aprenda X na trilha trail1 (hub hub-ia)`.
      if (/\btrail\d|\bhub-[a-z]/.test(desc)) {
        falhas.push({ rota, motivo: `descrição com id interno: ${desc.slice(0, 70)}` });
      }
      if (!(artigo?.author as Record<string, string>)?.name) {
        falhas.push({ rota, motivo: 'Article sem autor' });
      }

      const quiz = blocos.find(b => b['@type'] === 'Quiz');
      const perguntas = (quiz?.hasPart as Record<string, unknown>[]) ?? [];
      if (perguntas.some(q => q.eduQuestionType !== 'Flashcard')) {
        // Uma pergunta fora do tipo derruba a elegibilidade da página inteira.
        falhas.push({ rota, motivo: 'pergunta sem eduQuestionType Flashcard' });
      }

      // A pergunta precisa ser CABEÇALHO no HTML, não parágrafo: é o formato que
      // buscador e resumo de IA privilegiam, e o que dá navegação por cabeçalho.
      //
      // A comparação decodifica entidades antes de casar. A primeira versão
      // comparava o texto cru contra o HTML e acusou 6 páginas — todas com aspas
      // ou `&` na pergunta, que no HTML viram `&quot;` e `&amp;`. Eram falsos
      // positivos: a pergunta ESTAVA no cabeçalho.
      if (perguntas.length) {
        const decodificar = (t: string) => t
          .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));

        const cabecalhos = [...html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/g)]
          .map(m => decodificar(m[1].replace(/<[^>]+>/g, '')).trim());

        const nome = String(perguntas[0].name ?? '').trim();
        if (nome && !cabecalhos.some(c => c.includes(nome.slice(0, 40)))) {
          falhas.push({ rota, motivo: 'pergunta não está em <h2>/<h3>' });
        }
      }
    }
    relatar(falhas, slugsDeConteudo().length, 'páginas de módulo (dado estruturado)');
  });

  test('llms.txt existe, descreve a plataforma e lista os módulos', async ({ request }) => {
    const r = await request.get('/llms.txt', { failOnStatusCode: false });
    expect(r.status(), '/llms.txt deveria responder 200').toBe(200);
    const txt = await r.text();
    expect(r.headers()['content-type']).toContain('text/plain');
    expect(txt.startsWith('# ')).toBe(true);
    // Link sem descrição obriga o agente a baixar a página para saber o que é.
    expect(txt).toMatch(/\/aprenda\/[a-z0-9-]+\) · /);
    const links = [...txt.matchAll(/\/aprenda\/([a-z0-9-]+)\)/g)].map(m => m[1]);
    expect(new Set(links).size).toBe(slugsDeConteudo().length);
  });

  test('páginas de hub declaram a lista de cursos', async ({ request }) => {
    const hubs = ['/ia', '/aws', '/engenharia', '/dados', '/fundamentos', '/claude-anthropic', '/programacao'];
    const falhas: Falha[] = [];
    for (const h of hubs) {
      const r = await request.get(h, { failOnStatusCode: false });
      if (r.status() !== 200) { falhas.push({ rota: h, motivo: `HTTP ${r.status()}` }); continue; }
      const html = await r.text();
      // É o par que o recurso de carrossel exige: página-resumo com ItemList de
      // Course, apontando para as páginas de curso. Faltava a metade do resumo.
      if (!html.includes('"ItemList"')) falhas.push({ rota: h, motivo: 'sem ItemList de cursos' });
    }
    relatar(falhas, hubs.length, 'páginas de hub');
  });

  test('páginas de tema respondem, listam módulos e declaram a coleção', async ({ request }) => {
    test.setTimeout(5 * 60_000);
    // `rotasEstaticas()` não alcança `/temas/[tema]` — segmento dinâmico fica de
    // fora por construção. Sem esta checagem, as 19 páginas de tema seriam a
    // parte do site que nenhuma varredura olha, que é exatamente onde o defeito
    // silencioso mora.
    //
    // A lista é derivada dos ARQUIVOS, não importada: `import()` de módulo TS com
    // alias de caminho não resolve no processo do Playwright, e o resto deste
    // arquivo já lê fonte do disco pelo mesmo motivo.
    const { publicados, minimo } = temasPublicados();
    expect(publicados.length, 'deveria haver temas publicáveis').toBeGreaterThan(10);

    // O sitemap tem de anunciar exatamente os temas publicados. Anunciar rota
    // que o build não gerou é o defeito que já aconteceu com três rotas
    // deletadas; deixar de anunciar rota que existe é tráfego jogado fora.
    const sm = await request.get('/sitemap.xml', { failOnStatusCode: false });
    const noSitemap = new Set(
      [...(await sm.text()).matchAll(/\/temas\/([a-z0-9-]+)</g)].map(m => m[1]),
    );
    expect([...noSitemap].sort()).toEqual([...publicados].sort());

    const falhas: Falha[] = [];
    falhas.push(...(await conferirHtml(request, '/temas/', false)));

    for (const tema of publicados) {
      const rota = `/temas/${tema}/`;
      falhas.push(...(await conferirHtml(request, rota, false)));

      const r = await request.get(rota, { failOnStatusCode: false }).catch(() => null);
      if (r?.status() !== 200) continue;
      const html = await r.text();

      let colecao: Record<string, unknown> | undefined;
      for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
        try {
          const b = JSON.parse(m[1].replace(/\\u003c/g, '<')) as Record<string, unknown>;
          if (b['@type'] === 'CollectionPage') colecao = b;
        } catch {
          falhas.push({ rota, motivo: 'bloco de dado estruturado não parseia' });
        }
      }
      if (!colecao) { falhas.push({ rota, motivo: 'sem CollectionPage' }); continue; }

      const lista = colecao.mainEntity as { numberOfItems?: number; itemListElement?: unknown[] };
      const declarados = lista?.numberOfItems ?? 0;
      const itens = lista?.itemListElement?.length ?? 0;
      if (declarados !== itens) {
        // Contagem que não corresponde à lista é a forma mais fácil de o dado
        // estruturado mentir sem ninguém notar.
        falhas.push({ rota, motivo: `numberOfItems ${declarados} ≠ ${itens} itens` });
      }
      if (itens < minimo) {
        falhas.push({ rota, motivo: `só ${itens} módulos — abaixo do limiar de publicação` });
      }
      if (!/href="\/aprenda\//.test(html)) {
        falhas.push({ rota, motivo: 'nenhum link para módulo no HTML' });
      }
      if (/\btrail\d|\bhub-[a-z]/.test(String(colecao.description ?? ''))) {
        falhas.push({ rota, motivo: 'descrição com identificador interno' });
      }

      // A pergunta tem de chegar ao HTML como CABEÇALHO, com a resposta
      // imediatamente abaixo. É o formato que resumo de IA cita, e é a única
      // parte da estratégia de captação que só a leitura do HTML comprova:
      // teste de dado prova que o texto existe, não que a página o emite.
      const cabecalhos = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)]
        .map(m => m[1].replace(/<[^>]+>/g, '').trim());
      const perguntasNoHtml = cabecalhos.filter(c => c.endsWith('?'));
      if (perguntasNoHtml.length < 3) {
        falhas.push({ rota, motivo: `só ${perguntasNoHtml.length} perguntas em <h3> (mínimo 3)` });
      }
    }
    relatar(falhas, publicados.length + 1, 'páginas de tema');
  });

  test('indexação: canônica sem redirect, grafo do site e hub de perguntas', async ({ request }) => {
    test.setTimeout(5 * 60_000);
    const falhas: Falha[] = [];

    /**
     * A checagem que só o servidor responde: a canônica declarada tem de ser a
     * URL FINAL, não uma que redireciona.
     *
     * Era o defeito real de 05/ago/2026 — as 415 páginas de módulo declaravam
     * `/aprenda/<slug>/`, e essa forma responde 308. Teste de código prova que a
     * string não tem barra; só a requisição prova que a URL não redireciona.
     */
    const amostra = ['/', '/temas', '/perguntas', '/ia', '/aws',
      ...slugsDeConteudo().filter((_, i) => i % 60 === 0).map(s => `/aprenda/${s}`)];

    for (const rota of amostra) {
      const r = await request.get(rota, { failOnStatusCode: false, maxRedirects: 0 }).catch(() => null);
      if (r?.status() !== 200) { falhas.push({ rota, motivo: `HTTP ${r?.status()} sem seguir redirect` }); continue; }
      const html = await r.text();
      const canon = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
      if (!canon) { falhas.push({ rota, motivo: 'sem <link rel="canonical">' }); continue; }

      const caminho = new URL(canon).pathname;
      const alvo = await request.get(caminho, { failOnStatusCode: false, maxRedirects: 0 }).catch(() => null);
      if (alvo?.status() !== 200) {
        falhas.push({ rota, motivo: `canônica ${caminho} responde ${alvo?.status()} — aponta para redirect` });
      }
    }

    // Grafo do site: uma vez, no layout, com @id estável.
    const home = await request.get('/', { failOnStatusCode: false });
    const htmlHome = await home.text();
    const grafos = [...htmlHome.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map(m => { try { return JSON.parse(m[1].replace(/\\u003c/g, '<')); } catch { return null; } })
      .filter(Boolean) as Record<string, unknown>[];
    const comGrafo = grafos.find(g => Array.isArray(g['@graph']));
    if (!comGrafo) falhas.push({ rota: '/', motivo: 'home sem @graph de entidades' });
    else {
      const tipos = (comGrafo['@graph'] as Record<string, unknown>[]).map(n => n['@type']);
      for (const t of ['EducationalOrganization', 'Person', 'WebSite']) {
        if (!tipos.includes(t)) falhas.push({ rota: '/', motivo: `@graph sem ${t}` });
      }
    }

    // Hub de perguntas: existe, tem `ItemList` e os links levam a 200.
    const hub = await request.get('/perguntas', { failOnStatusCode: false });
    if (hub.status() !== 200) falhas.push({ rota: '/perguntas', motivo: `HTTP ${hub.status()}` });
    else {
      const html = await hub.text();
      const lista = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
        .map(m => { try { return JSON.parse(m[1].replace(/\\u003c/g, '<')); } catch { return null; } })
        .find(g => g && (g as Record<string, unknown>)['@type'] === 'CollectionPage') as Record<string, unknown> | undefined;
      const itens = (lista?.mainEntity as { itemListElement?: unknown[] })?.itemListElement?.length ?? 0;
      if (itens < 100) falhas.push({ rota: '/perguntas', motivo: `só ${itens} perguntas no ItemList` });

      // Âncora descritiva: o texto do link é a pergunta inteira, não "clique aqui".
      const ancoras = [...html.matchAll(/<a[^>]+href="\/(aprenda|temas)\/[^"]*"[^>]*>([\s\S]*?)<\/a>/g)]
        .map(m => m[2].replace(/<[^>]+>/g, '').trim());
      if (!ancoras.some(a => a.endsWith('?'))) {
        falhas.push({ rota: '/perguntas', motivo: 'nenhuma âncora com o texto da pergunta' });
      }
    }

    // /admin fora do índice, por header.
    const admin = await request.get('/admin', { failOnStatusCode: false });
    const tag = admin.headers()['x-robots-tag'] ?? '';
    if (!tag.includes('noindex')) {
      falhas.push({ rota: '/admin', motivo: `X-Robots-Tag ausente ou sem noindex: "${tag}"` });
    }

    relatar(falhas, amostra.length + 3, 'checagens de indexação');
  });

  test('links internos da home não levam a 404', async ({ page, request }) => {
    test.setTimeout(5 * 60_000);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const hrefs = await page.locator('a[href^="/"]').evaluateAll(as =>
      [...new Set(as.map(a => (a as HTMLAnchorElement).getAttribute('href') ?? ''))]
        .filter(h => h && !h.startsWith('//') && !h.includes('#')),
    );
    expect(hrefs.length, 'a home deveria ter links internos').toBeGreaterThan(5);
    const falhas: Falha[] = [];
    for (const h of hrefs) {
      const r = await request.get(h, { failOnStatusCode: false }).catch(() => null);
      // Link que aponta para 404 é o beco sem saída que o usuário encontra
      // clicando — e que nenhum teste de unidade pega.
      if (r?.status() !== 200) falhas.push({ rota: h, motivo: `HTTP ${r?.status() ?? 'sem resposta'}` });
    }
    relatar(falhas, hrefs.length, 'links internos da home');
  });

  test('cartão social e canônica coerentes em TODA URL do sitemap', async ({ request }) => {
    /**
     * A checagem que nasceu de uma auditoria com 16 achados no HTML servido, em
     * 06/ago/2026. Nenhum deles aparecia em teste de componente, e vários não
     * apareciam nem em teste de código — porque nasciam da HERANÇA de metadados,
     * que só existe depois que o Next resolve a árvore de segmentos:
     *
     *  · **58 páginas** emitiam `og:url` da HOME e `twitter:title` genérico do
     *    site. Cada uma dizia às redes sociais que ELA era a página inicial.
     *    Causa: o layout raiz declarava `title` e `url` no `openGraph`, e quem não
     *    declarava o próprio bloco herdava tudo — inclusive o que era mentira.
     *  · **11 páginas sem `og:image`**, pela razão oposta: declararam `openGraph`
     *    sem `images`, e o bloco da página SUBSTITUI o da raiz em vez de mesclar.
     *  · **12 títulos** com a marca duplicada, porque o `title` da página repetia
     *    o sufixo que o template do layout já aplica.
     *
     * Os três são invisíveis localmente sem medir o HTML. Este teste mede.
     */
    test.setTimeout(5 * 60_000);

    const sm = await request.get('/sitemap.xml', { failOnStatusCode: false });
    expect(sm.status(), 'sitemap.xml precisa responder 200').toBe(200);
    const urls = [...(await sm.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    expect(urls.length, 'sitemap vazio').toBeGreaterThan(400);

    // Uma amostra por template + todas as páginas que não são de módulo: é onde a
    // herança varia. As de módulo já têm a 4ª checagem, dedicada a elas.
    const naoModulo = urls.filter(u => !u.includes('/aprenda/'));
    const modulos = urls.filter(u => u.includes('/aprenda/')).filter((_, i) => i % 40 === 0);
    const amostra = [...naoModulo, ...modulos];

    const falhas: Falha[] = [];
    for (const url of amostra) {
      const rota = new URL(url).pathname;
      const r = await request.get(rota, { failOnStatusCode: false, maxRedirects: 0 }).catch(() => null);
      if (r?.status() !== 200) { falhas.push({ rota, motivo: `HTTP ${r?.status()}` }); continue; }
      const h = await r.text();

      const canon = /<link rel="canonical" href="([^"]+)"/.exec(h)?.[1];
      const ogUrl = /property="og:url" content="([^"]+)"/.exec(h)?.[1];
      const ogImg = /property="og:image" content="([^"]+)"/.exec(h)?.[1];
      const twT = /name="twitter:title" content="([^"]+)"/.exec(h)?.[1];
      const twI = /name="twitter:image" content="([^"]+)"/.exec(h)?.[1];
      const titulo = /<title>([^<]*)<\/title>/.exec(h)?.[1] ?? '';
      const robots = /<meta name="robots" content="([^"]+)"/.exec(h)?.[1] ?? '';

      // URL anunciada no sitemap não pode pedir para não ser indexada.
      if (/noindex/.test(robots)) falhas.push({ rota, motivo: 'está no sitemap E declara noindex' });

      if (!canon) falhas.push({ rota, motivo: 'sem <link rel="canonical">' });
      else if (canon !== url) falhas.push({ rota, motivo: `canônica "${canon}" difere do sitemap "${url}"` });

      // As quatro propriedades básicas do protocolo Open Graph.
      if (!ogUrl) falhas.push({ rota, motivo: 'sem og:url (propriedade básica do Open Graph)' });
      else if (canon && ogUrl !== canon) falhas.push({ rota, motivo: `og:url "${ogUrl}" != canônica "${canon}"` });
      if (!ogImg) falhas.push({ rota, motivo: 'sem og:image — openGraph próprio sem `images` apaga o da raiz' });
      if (!/property="og:title"/.test(h)) falhas.push({ rota, motivo: 'sem og:title' });
      if (!/property="og:type"/.test(h)) falhas.push({ rota, motivo: 'sem og:type' });

      // `twitter` não herda de `openGraph`: tem de vir preenchido e ser da PÁGINA.
      if (!twT) falhas.push({ rota, motivo: 'sem twitter:title' });
      if (!twI) falhas.push({ rota, motivo: 'sem twitter:image' });
      if (rota !== '/' && /^FFV Academy — Escola de Engenharia/.test(twT ?? '')) {
        falhas.push({ rota, motivo: 'twitter:title é o genérico do site, não o da página' });
      }

      // Marca duplicada: o template do layout raiz já aplica o sufixo.
      if ((titulo.match(/FFV Academy/g) ?? []).length > 1) {
        falhas.push({ rota, motivo: `título repete a marca: "${titulo}"` });
      }
    }
    relatar(falhas, amostra.length, 'URLs do sitemap');
  });

  test('sitemap: lastmod DISTINGUE páginas, ou não existe', async ({ request }) => {
    /**
     * Esta checagem trocou de pergunta em 07/ago/2026.
     *
     * Antes ela exigia AUSÊNCIA, porque não havia data real: até 06/ago as 520
     * URLs traziam o mesmo `<lastmod>` — o instante do build — afirmando a cada
     * deploy que o site inteiro mudou. O Google usa `lastmod` só se ele for
     * consistentemente exato e, diante de valor uniforme, passa a IGNORAR o
     * campo, inclusive nas páginas que de fato mudaram. O campo falso não era
     * neutro: custava o sinal.
     *
     * Agora existe data real (migration 000045 + `contentHash` no importador), e
     * a pergunta passou a ser se a data DISTINGUE. Três regras, e a terceira é a
     * que impede o defeito antigo de voltar disfarçado:
     *
     *   1. ausência total continua válida — é o estado sem banco no build;
     *   2. `lastmod` só em URL de artigo (`/aprenda/`), porque só artigo tem data
     *      de conteúdo. Em página derivada do currículo, a data seria a do build;
     *   3. se TODAS as datas declaradas forem iguais, reprova. Uma data uniforme
     *      é o sinal falso de antes, agora vindo do banco em vez do build.
     */
    const sm = await request.get('/sitemap.xml', { failOnStatusCode: false });
    const xml = await sm.text();

    // Cada <url> é uma entrada; casar loc e lastmod POR ENTRADA é o que permite
    // dizer qual URL declara data. Casar os dois separadamente só daria contagens.
    const entradas = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => {
      const bloco = m[1];
      return {
        loc: bloco.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '',
        lastmod: bloco.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null,
      };
    });
    const comData = entradas.filter(e => e.lastmod !== null);

    // Regra 1: ausência total é válida.
    if (comData.length === 0) return;

    // Regra 2: nada além de artigo declara data.
    const forasteiras = comData.filter(e => !e.loc.includes('/aprenda/'));
    expect(
      forasteiras.map(e => `${e.loc} (${e.lastmod})`),
      'URL sem data de conteúdo declarando lastmod — a data seria a do build, ' +
      'que é o sinal falso que esta checagem existe para impedir',
    ).toEqual([]);

    // Regra 3: data uniforme reprova.
    const distintas = new Set(comData.map(e => e.lastmod));
    expect(
      distintas.size,
      `${comData.length} URL(s) declarando lastmod, com ${distintas.size} data(s) distinta(s) ` +
      `— data uniforme é o defeito de 06/ago vindo do banco em vez do build. ` +
      `Provável causa: o hash de conteúdo não está distinguindo os artigos.`,
    ).toBeGreaterThan(1);
  });

  test('nenhuma página servida contém marcador de preenchimento', async ({ request }) => {
    /**
     * `/privacidade` tem quatro `[PREENCHER]` no lugar do nome do controlador, do
     * documento e do e-mail do encarregado. A página está no repositório e vai ao
     * ar junto com o resto no momento da migração de domínio — então o bloqueio
     * precisa existir ANTES disso, não depois de alguém ver.
     *
     * A regra é sobre o que o USUÁRIO LÊ, e por isso mede o HTML servido, com
     * script, style e tags removidos. Marcador em comentário de código não
     * reprova: ele não chega ao leitor, e reprovar comentário produziria um gate
     * que se contorna renomeando a variável.
     *
     * `TODO` entra em caixa alta e como palavra inteira. Em minúsculas ele aparece
     * em português corrente ("todo o conteúdo", "em todo módulo"), e casar isso
     * daria centenas de falsos positivos — gate que erra é gate que se desliga.
     */
    /**
     * A lista é ESTREITA, e cada exclusão foi medida antes de decidir. A primeira
     * versão trazia `TODO`, `XXX`, `placeholder` e `lorem ipsum` soltos, e a
     * medição sobre os 427 seeds mostrou que TODAS as ocorrências eram legítimas:
     *
     *   `TODO`         7 módulos — é português. "Instance Profile daria a permissão
     *                  para TODO container no host", em caixa alta por ênfase.
     *   `XXX`          2 módulos — redação de segredo em exemplo:
     *                  `https://hooks.slack.com/services/T00/B00/XXX`.
     *   `lorem ipsum`  1 módulo — dado de teste num arquivo de promptfoo.
     *   `placeholder`  3 módulos — termo técnico corrente: ".env versionado:
     *                  proibido. com placeholders OK."
     *
     * Gate que reprova conteúdo correto é gate que alguém desliga, e aí ele deixa
     * de proteger o caso que importava. Marcador ENTRE COLCHETES não tem uso
     * legítimo: ninguém escreve `[PREENCHER]` como conteúdo.
     */
    const MARCADORES = [
      // `[^\]]*` é obrigatório, e a falta dele foi um buraco real: a primeira
      // versão procurava `[PREENCHER]` exato, e a página de privacidade escreve
      // `[PREENCHER: nome/razão social]`, `[PREENCHER: CPF/CNPJ]` e
      // `[PREENCHER: e-mail do encarregado]`. O gate passava verde sobre
      // exatamente o caso que ele existe para bloquear — e só apareceu porque a
      // checagem foi conferida contra o HTML servido, em vez de aceita por ter
      // passado.
      /\[PREENCHER[^\]]*\]/,
      /\[TODO[^\]]*\]/,
      /\[FIXME[^\]]*\]/,
      /\[INSERIR[^\]]*\]/,
      /\[NOME[^\]]*\]/,
      /\[SEU[^\]]*\]/,
      /\[A DEFINIR[^\]]*\]/i,
      /\bTODO_REVIEW\b/,
      /\bXXXX+\b/,
    ];

    test.setTimeout(5 * 60_000);

    const sm = await request.get('/sitemap.xml', { failOnStatusCode: false });
    expect(sm.status(), 'sitemap.xml precisa responder 200').toBe(200);
    const todas = [...(await sm.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

    // TODA página que não é de módulo, mais uma amostra de módulo. Marcador de
    // preenchimento é defeito de página escrita à mão — as 427 de módulo passam
    // por `validate_texto_sem_lacuna.py`, que já procura lacuna na prosa dos seeds.
    const urls = [
      ...todas.filter(u => !u.includes('/aprenda/')),
      ...todas.filter(u => u.includes('/aprenda/')).filter((_, i) => i % 20 === 0),
    ];

    const falhas: Falha[] = [];
    for (const url of urls) {
      const rota = new URL(url).pathname;
      const resp = await request.get(rota, { failOnStatusCode: false }).catch(() => null);
      if (!resp || resp.status() !== 200) continue;
      const corpo = texto(await resp.text());
      for (const m of MARCADORES) {
        const achado = m.exec(corpo);
        if (!achado) continue;
        const i = Math.max(0, achado.index - 60);
        falhas.push({
          rota,
          motivo: `marcador de preenchimento "${achado[0]}" no texto visível: ` +
                  `"…${corpo.slice(i, achado.index + 60)}…"`,
        });
        break;
      }
    }
    relatar(falhas, urls.length, 'URLs do sitemap');
  });

  test('rotas retiradas: 301 chega ao destino, e 404 deliberado é 404', async ({ request }) => {
    /**
     * A checagem que só o SERVIDOR responde.
     *
     * `rotas-retiradas.test.ts` prova que a tabela é coerente e que o destino tem
     * `page.tsx`. Isso é código lendo código. O que ele não prova é que o servidor
     * de verdade emite o redirect e que o destino responde 200 — e é aí que moram
     * duas falhas possíveis: um `source` que o Next não casa como escrito, e um
     * destino que existe como arquivo mas quebra ao renderizar.
     *
     * As 21 rotas `removido` são verificadas ao contrário: têm de responder 404.
     * Se alguma virar 200 ou 301 sem passar pelo inventário, o site voltou a
     * servir conteúdo que o pivot decidiu tirar do ar.
     */
    test.setTimeout(5 * 60_000);
    const entradas = Object.entries(ROTAS_RETIRADAS);
    expect(entradas.length, 'inventário de rotas retiradas vazio').toBeGreaterThan(50);

    const falhas: Falha[] = [];
    for (const [rota, disp] of entradas) {
      const r = await request.get(rota, { failOnStatusCode: false, maxRedirects: 0 }).catch(() => null);
      if (!r) { falhas.push({ rota, motivo: 'sem resposta do servidor' }); continue; }

      if (disp.tipo === 'removido') {
        if (r.status() !== 404) {
          falhas.push({ rota, motivo: `esperado 404 deliberado, veio ${r.status()}` });
        }
        continue;
      }

      // 301 e 308 valem: `permanent: true` no Next emite 308, e o Google trata
      // os dois como permanente equivalente.
      if (r.status() !== 301 && r.status() !== 308) {
        falhas.push({ rota, motivo: `esperado redirect permanente, veio ${r.status()}` });
        continue;
      }
      const local = r.headers()['location'];
      if (local !== disp.destino) {
        falhas.push({ rota, motivo: `Location "${local}" difere do destino declarado "${disp.destino}"` });
        continue;
      }
      const alvo = await request.get(disp.destino, { failOnStatusCode: false, maxRedirects: 0 }).catch(() => null);
      if (alvo?.status() !== 200) {
        falhas.push({ rota, motivo: `destino ${disp.destino} responde ${alvo?.status()} — redirect para não-200` });
      }
    }
    relatar(falhas, entradas.length, 'rotas retiradas');
  });
});
