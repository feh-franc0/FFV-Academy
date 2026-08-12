/**
 * Inventário das rotas retiradas no pivot de jul/2026 — e o que fazer com cada uma.
 *
 * ## Por que este arquivo existe
 *
 * O pivot estreitou a plataforma de 10 hubs / 88 trilhas para 7 hubs / 40 trilhas.
 * Isso apagou **55 páginas** que o site serve em produção HOJE e que o sitemap de
 * `main` publica — porque ele deriva as URLs de `trail.href` e `hub.href`. Quando
 * esta branch subir, cada uma dessas URLs muda de 200 para outra coisa.
 *
 * Auditoria de 05/ago/2026: existiam **6 redirects para 55 rotas apagadas**. As
 * outras 49 iam virar 404 sem aviso — perda de tudo que elas acumularam de
 * autoridade, e erro de rastreamento no Search Console.
 *
 * ## As três disposições, e por que 404 é resposta legítima
 *
 * A tentação é redirecionar todas para algum hub e declarar "zero 404". Isso é
 * pior, não melhor: redirect para página que não fala do assunto é exatamente o
 * que o Google classifica como **soft 404**, e ainda entrega ao leitor uma página
 * que não responde o que ele buscou. Então a disposição é escolhida por ASSUNTO:
 *
 *  - `sucessor` — existe página viva que cobre substancialmente o mesmo assunto.
 *    301 preserva a autoridade e leva o leitor ao conteúdo certo.
 *  - `hub` — não há sucessor direto, mas o hub sobrevivente é o pai temático
 *    honesto. 301 de nível de categoria é prática aceita: o leitor cai numa
 *    página que lista trilhas do mesmo campo.
 *  - `removido` — o assunto foi deliberadamente cortado no pivot e NÃO há destino
 *    honesto. Aqui a resposta correta é 404: o Google desindexa, sem penalidade e
 *    sem enganar ninguém. Fingir um destino seria mentir para o rastreador e para
 *    o leitor.
 *
 * ## Limite declarado
 *
 * Este arquivo é a fonte DECLARADA, não derivada. O gate
 * (`rotas-retiradas.test.ts`) valida a consistência interna — destino existe,
 * `source` não sombreia página viva, não há cadeia de redirect. Ele **não**
 * descobre sozinho uma 56ª rota apagada no futuro, porque comparar com `main`
 * exige histórico e o checkout do CI é raso (`fetch-depth` padrão = 1). Quem
 * apagar rota nova precisa adicionar aqui; o que o gate garante é que o que está
 * aqui está correto.
 */

export type Disposicao =
  /** Página viva cobre o mesmo assunto — 301 preserva autoridade e serve o leitor. */
  | { tipo: 'sucessor'; destino: string; porque: string }
  /** Sem sucessor direto; o hub é o pai temático honesto — 301 de categoria. */
  | { tipo: 'hub'; destino: string; porque: string }
  /** Assunto cortado no pivot, sem destino honesto — 404 é o sinal correto. */
  | { tipo: 'removido'; porque: string };

export const ROTAS_RETIRADAS: Record<string, Disposicao> = {
  // ─── sucessor: existe página viva sobre o mesmo assunto ────────────────────
  '/revisao': {
    tipo: 'sucessor',
    destino: '/revisar/maratona',
    porque: 'segunda implementação órfã da maratona; a viva tem filtro por trilha e quantidade',
  },
  '/search': {
    tipo: 'sucessor',
    destino: '/explorar',
    porque: 'página de busca duplicada e órfã; a busca viva é o CommandPalette, e /explorar é o índice navegável',
  },
  '/search-trilha': {
    tipo: 'sucessor',
    destino: '/search-ir-deep',
    porque: 'é a MESMA trilha de Search & Information Retrieval, só renomeada — BM25, TF-IDF, pgvector, hybrid search',
  },
  '/como-computador-funciona': {
    tipo: 'sucessor',
    destino: '/fundamentos-tecnicos',
    porque: 'a trilha viva abre com "Como o computador roda seu código (do teclado ao pixel)" — é o sucessor literal, melhor que o hub',
  },
  '/python-profundo': {
    tipo: 'sucessor',
    destino: '/python-engenheiros',
    porque: 'Python continua na plataforma; apontar para /claude-anthropic era destino errado — a trilha de Python existe',
  },
  '/chaos-engineering': {
    tipo: 'sucessor',
    destino: '/observabilidade-sre',
    porque: 'chaos engineering é prática de confiabilidade; a trilha de SRE é onde o assunto vive agora',
  },
  '/authorization-engineering': {
    tipo: 'sucessor',
    destino: '/security-engineering',
    porque: 'autorização é subtema de segurança; a trilha cobre threat modeling e controle de acesso',
  },
  '/cryptography-applied': {
    tipo: 'sucessor',
    destino: '/security-engineering',
    porque: 'criptografia aplicada é subtema da trilha de segurança sobrevivente',
  },
  '/privacy-compliance': {
    tipo: 'sucessor',
    destino: '/security-engineering',
    porque: 'privacidade e conformidade entraram na trilha de segurança',
  },
  '/real-time-systems': {
    tipo: 'sucessor',
    destino: '/sistemas-distribuidos',
    porque: 'sistemas de tempo real são subtema de distribuídos, que cobre CAP, PACELC e consistência',
  },
  '/kafka-streaming': {
    tipo: 'sucessor',
    destino: '/data-engineering',
    porque: 'a trilha viva abre com "Batch vs stream: mental model e trade-offs reais" — é onde streaming ficou',
  },
  '/streaming-messaging': {
    tipo: 'sucessor',
    destino: '/data-engineering',
    porque: 'mensageria e streaming foram absorvidos pela trilha de data engineering',
  },
  '/browser-internals': {
    tipo: 'sucessor',
    destino: '/redes-web',
    porque: 'a trilha cobre a pilha da web (OSI, TCP/IP, TLS, HTTP, WebSocket, CORS) — o que sobrou de browser internals',
  },
  '/edge-computing': {
    tipo: 'sucessor',
    destino: '/redes-web',
    porque: 'edge é topologia de rede; a trilha de redes e web é o assunto sobrevivente mais próximo',
  },
  '/devops-containers': {
    tipo: 'sucessor',
    destino: '/observabilidade-sre',
    porque: 'operação de containers virou assunto de SRE — mais específico que o hub, que era o destino anterior',
  },

  // ─── hub: sem sucessor direto, mas o pai temático é honesto ────────────────
  '/engenharia-software': {
    tipo: 'hub',
    destino: '/engenharia',
    porque: 'trilha guarda-chuva de engenharia; o hub de Engenharia de Produção é o pai temático',
  },
  '/api-design': {
    tipo: 'hub',
    destino: '/engenharia',
    porque: 'design de API é prática de engenharia; o hub cobre system design e distribuídos',
  },
  '/graphql': {
    tipo: 'hub',
    destino: '/engenharia',
    porque: 'sem trilha de GraphQL; o hub de engenharia é o campo mais próximo',
  },
  '/testing-engineering': {
    tipo: 'hub',
    destino: '/engenharia',
    porque: 'testes de software não têm trilha própria; o hub é o pai. (llm-evals é sobre testar LLM, assunto diferente)',
  },
  '/performance-engineering': {
    tipo: 'hub',
    destino: '/engenharia',
    porque: 'performance é prática de produção coberta em parte por SRE e distribuídos',
  },
  '/platform-engineering': {
    tipo: 'hub',
    destino: '/engenharia',
    porque: 'plataforma interna é assunto do hub de produção',
  },
  '/deploy-fullstack-vps': {
    tipo: 'hub',
    destino: '/engenharia',
    porque: 'deploy e operação caem no hub de Engenharia de Produção',
  },
  '/lib-authoring': {
    tipo: 'hub',
    destino: '/engenharia',
    porque: 'publicar biblioteca é prática de engenharia sem trilha própria',
  },
  '/dx-productivity': {
    tipo: 'hub',
    destino: '/engenharia',
    porque: 'developer experience é prática de engenharia sem trilha sobrevivente',
  },
  '/devtools-productivity': {
    tipo: 'hub',
    destino: '/engenharia',
    porque: 'ferramental de dev sem trilha própria; o hub é o pai temático',
  },
  '/product-engineering': {
    tipo: 'hub',
    destino: '/engenharia',
    porque: 'engenharia de produto sem trilha sobrevivente; o hub é o campo',
  },
  '/c-programming': {
    tipo: 'hub',
    destino: '/fundamentos',
    porque: 'o hub Base técnica absorveu Linguagens do AI Engineer e é o pai de linguagem, hoje com Python, TypeScript e Go',
  },
  '/cpp-moderno': {
    tipo: 'hub',
    destino: '/fundamentos',
    porque: 'idem — linguagem sem trilha própria após o pivot',
  },
  '/csharp-dotnet': {
    tipo: 'hub',
    destino: '/fundamentos',
    porque: 'idem — linguagem sem trilha própria após o pivot',
  },
  '/java-moderno': {
    tipo: 'hub',
    destino: '/fundamentos',
    porque: 'idem — linguagem sem trilha própria após o pivot',
  },
  '/rust-profissional': {
    tipo: 'hub',
    destino: '/fundamentos',
    porque: 'idem — linguagem sem trilha própria após o pivot',
  },
  '/linguagens-comparadas': {
    tipo: 'hub',
    destino: '/fundamentos',
    porque: 'comparação de linguagens pertence ao hub de Base técnica, que absorveu o de linguagens',
  },
  '/ds-algoritmos': {
    tipo: 'hub',
    destino: '/fundamentos',
    porque: 'estruturas de dados e algoritmos são base de computação; o hub Fundamentos para IA é o pai',
  },
  '/construcao': {
    tipo: 'hub',
    destino: '/explorar',
    porque: 'era um HUB (Frontend, Mobile & Edge) e nenhum hub sucedeu — /explorar é o índice navegável de tudo',
  },

  // ─── removido: assunto cortado, 404 é o sinal honesto ─────────────────────
  '/acessibilidade': {
    tipo: 'removido',
    porque: 'trilha de a11y e inclusive engineering cortada no pivot; nenhuma trilha viva cobre WCAG',
  },
  '/frontend-moderno': { tipo: 'removido', porque: 'frontend saiu do escopo — o eixo é IA/Claude/AWS' },
  '/design-systems': { tipo: 'removido', porque: 'design system saiu com o hub de frontend' },
  '/animation-motion': { tipo: 'removido', porque: 'animação e motion saíram com o hub de frontend' },
  '/android-native': { tipo: 'removido', porque: 'mobile nativo saiu do escopo no pivot' },
  '/ios-native': { tipo: 'removido', porque: 'mobile nativo saiu do escopo no pivot' },
  '/mobile-rn': { tipo: 'removido', porque: 'React Native saiu com a camada de mobile' },
  '/maps-geospatial': { tipo: 'removido', porque: 'geoespacial saiu do escopo; nenhuma trilha viva cobre o assunto' },
  '/web3-pragmatico': { tipo: 'removido', porque: 'Web3 saiu do escopo — fora do eixo defensável' },
  '/flipper-zero': { tipo: 'removido', porque: 'hardware hacking saiu do escopo' },
  '/seguranca-hardware-hacking': {
    tipo: 'removido',
    porque: 'hacking de hardware não é coberto por security-engineering, que é threat modeling de software',
  },
  '/carreira-digital': { tipo: 'removido', porque: 'carreira saiu do pivot; trilha de carreira está no roadmap, não existe ainda' },
  '/career-engineering': { tipo: 'removido', porque: 'idem — sem destino honesto até a trilha de carreira existir' },
  '/tech-leadership': { tipo: 'removido', porque: 'liderança técnica cortada; nenhum hub cobre o assunto' },
  '/technical-writing': { tipo: 'removido', porque: 'escrita técnica cortada; nenhum hub cobre o assunto' },
  '/comunicacao-humana': { tipo: 'removido', porque: 'comunicação saiu com o eixo do Profissional Digital' },
  '/criacao-conteudo': { tipo: 'removido', porque: 'criação de conteúdo saiu com o eixo do Profissional Digital' },
  '/marketing-digital': { tipo: 'removido', porque: 'marketing saiu do escopo no pivot' },
  '/empreendedorismo-digital': { tipo: 'removido', porque: 'empreendedorismo saiu do escopo no pivot' },
  '/solo-saas': { tipo: 'removido', porque: 'SaaS solo saiu com o eixo de empreendedorismo' },
  '/ingles': { tipo: 'removido', porque: 'inglês saiu do escopo — não é engenharia' },
  // ─── consolidação no eixo AWS + IA (ago/2026) ──────────────────────────────
  // O hub Claude & Anthropic e suas quatro trilhas saíram: o eixo da plataforma
  // é arquitetura de soluções AWS e IA sobre serviços AWS, e Claude Code, a
  // engenharia de harness e a certificação Anthropic não ensinam nem uma coisa
  // nem outra. Onde o assunto sobrevive do lado AWS, há sucessor; onde não
  // sobrevive, 404 é a resposta honesta.
  '/claude-api-agents': {
    tipo: 'sucessor',
    destino: '/aws-bedrock',
    porque:
      'é substancialmente o MESMO assunto do lado AWS — Converse API, tool use, RAG, padrões agênticos e custo em produção — e a trilha Bedrock cobre cada um mais fundo (tool use 21,2k contra 13,5k; RAG 20,0k contra 13,1k)',
  },
  '/anthropic-ai-practitioner': {
    tipo: 'hub',
    destino: '/ia-aws',
    porque:
      'certificação de fornecedor sem equivalente vivo; quem buscava "AI practitioner" encontra no hub a AIF-C01, que é a certificação de IA que a plataforma prepara',
  },
  '/claude-anthropic': {
    tipo: 'hub',
    destino: '/ia-aws',
    porque:
      'o hub foi retirado e o assunto que sobrevive é Claude COMO MODELO na AWS, que mora em /ia-aws (o módulo bedrock-claude-na-aws-ecossistema trata dos quatro caminhos)',
  },
  '/claude-code-masterclass': {
    tipo: 'removido',
    porque:
      'Claude Code é ferramenta de codificação, não arquitetura de IA na AWS. Não há destino honesto: redirecionar para Bedrock seria soft 404, porque quem busca "claude code subagents" não quer Knowledge Bases',
  },
  '/claude-code-pro': {
    tipo: 'removido',
    porque: 'idem — harness engineering saiu com a masterclass de Claude Code',
  },
  // Dois TEMAS retirados junto com o eixo Claude-ferramenta. Tema é eixo de
  // assunto e tinha página própria; o assunto que sobrevive foi para `agentes`
  // (function calling, saída estruturada, MCP e AgentCore migraram de padrão).
  '/temas/claude-code': {
    tipo: 'removido',
    porque:
      'o tema existia para os 27 módulos de Claude Code, todos retirados; `ferramentas-ia` compara ferramentas de código e é outro assunto, então redirecionar para lá seria soft 404',
  },
  '/temas/api-claude': {
    tipo: 'sucessor',
    destino: '/temas/agentes',
    porque:
      'o que o tema tinha de reaproveitável — chamar função, saída estruturada, o laço de ferramenta — é assunto de agente e migrou para os padrões de `agentes`, que hoje casa function calling, structured output e agentcore',
  },
  // Dois hubs absorvidos por outros: assunto vivo, hub morto.
  '/dados': {
    tipo: 'hub',
    destino: '/engenharia',
    porque:
      'as quatro trilhas de dados (Postgres, NoSQL/vetores, Search & IR, Data Engineering) foram absorvidas por Produção e Dados para IA — nenhum módulo se perdeu',
  },
  '/programacao': {
    tipo: 'hub',
    destino: '/fundamentos',
    porque:
      'as três trilhas de linguagem (Python, TypeScript, Go) foram absorvidas por Base técnica — nenhum módulo se perdeu',
  },
};
/** As que viram 301. `next.config.ts` consome exatamente isto. */
export const REDIRECTS_RETIRADOS = Object.entries(ROTAS_RETIRADAS)
  .filter(([, d]) => d.tipo !== 'removido')
  .map(([source, d]) => ({
    source,
    destination: (d as Extract<Disposicao, { destino: string }>).destino,
    permanent: true,
  }));
