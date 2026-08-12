/**
 * Dado ESTÁTICO das playlists curadas — sem dependência do currículo.
 *
 * Separado de `playlists.ts` em 11/ago/2026: aquele arquivo importa
 * `CURRICULUM` completo (~92 KB gz) no topo, para `resolvePlaylist`. Mas
 * `PLAYLISTS` em si (id/title/subtitle/color/emoji/moduleSlugs) não usa o
 * currículo — é prosa e uma lista de slugs escritas à mão. Quem só precisa
 * mostrar a LISTA de playlists (ex.: `home/Explorar.tsx`, que renderiza uma
 * prévia na home) pagava pelo currículo inteiro para importar isso.
 *
 * `playlists.ts` reexporta `PLAYLISTS`/`Playlist` daqui, então os 2
 * consumidores existentes continuam funcionando sem mudança.
 */

export interface Playlist {
  id: string;
  title: string;
  subtitle: string;
  audience: string;
  color: string;
  emoji: string;
  /** Slugs de módulos, em ordem recomendada de consumo. */
  moduleSlugs: string[];
}

export const PLAYLISTS: Playlist[] = [
  {
    id: 'do-zero-a-ia',
    title: 'Do zero à IA',
    subtitle: 'Entenda IA como quem vai usar pra engenharia.',
    audience: 'Nunca mexeu com IA e quer o básico técnico real.',
    color: '#58a6ff',
    emoji: '🚀',
    moduleSlugs: [
      'o-que-e-ia',
      'dados-o-combustivel',
      'como-ia-aprende',
      'redes-neurais',
      'o-que-e-llm',
      'tokens',
      'transformers',
      'tool-calling',
    ],
  },
  {
    id: 'ja-sei-python-quero-ia',
    title: 'Já sei Python, quero IA',
    subtitle: 'Da programação à engenharia de sistemas de IA.',
    audience: 'Dev Python que quer sair de "uso API" pra "desenho agentes".',
    color: '#a371f7',
    emoji: '🧠',
    moduleSlugs: [
      'o-que-e-llm',
      'tool-calling',
      'rag-fundamentos',
      'chunking-embeddings',
      'agentes-padroes',
      'mcp-servers',
      'llm-apis-producao',
      'llmops-drift-canary',
    ],
  },
  {
    id: 'ia-na-aws-do-zero',
    title: 'IA na AWS do zero',
    subtitle: 'Da primeira chamada ao Bedrock à arquitetura de RAG em produção.',
    audience: 'Dev que sabe AWS e quer colocar IA em produção sem virar pesquisador.',
    color: '#ff9900',
    emoji: '◈',
    moduleSlugs: [
      'bedrock-o-que-e-e-por-que',
      'bedrock-primeira-chamada-converse',
      'bedrock-catalogo-modelos-qual-escolher',
      'bedrock-knowledge-bases-rag',
      'bedrock-rag-producao-padroes',
      'bedrock-guardrails-seguranca-ia',
      'bedrock-evals-qualidade-producao',
      'bedrock-finops-roi-controle-de-custo',
    ],
  },
  {
    id: 'ia-para-dev-backend',
    title: 'IA para devs backend',
    subtitle: 'Do LLM na API ao RAG em produção sem magia.',
    audience: 'Dev backend que quer entregar features com IA sem virar pesquisador.',
    color: '#58a6ff',
    emoji: '🧠',
    moduleSlugs: [
      'o-que-e-llm',
      'tokens',
      'bedrock-prompt-engineering',
      'bedrock-tool-use-function-calling',
      'rag-fundamentos',
      'chunking-embeddings',
      'vector-dbs-pgvector-pinecone',
      'eval-frameworks',
      'llmops-drift-canary',
    ],
  },
  {
    id: 'devops-cloud-architect',
    title: 'Cloud Architect AWS',
    subtitle: 'Da VPC à arquitetura resiliente SAA-C03.',
    audience: 'Dev que quer virar arquiteto de soluções AWS.',
    color: '#f78166',
    emoji: '☁️',
    moduleSlugs: [
      'vpc-avancado',
      'containers-ecs-eks',
      'rds-aurora-dynamodb',
      'caching-performance',
      'disaster-recovery',
      'cost-optimization-saa',
    ],
  },
  {
    id: 'engenharia-moderna',
    title: 'Distribuídos & SRE',
    subtitle: 'Sistemas distribuídos, observabilidade e operação em produção.',
    audience: 'Dev que quer consolidar base sênior de sistemas em produção.',
    color: '#3fb950',
    emoji: '🏗️',
    moduleSlugs: [
      'cap-pacelc',
      'idempotencia-retries',
      'observability-pilares',
      'slos-error-budgets',
      'incident-response-postmortem',
    ],
  },
  {
    id: 'primeiros-90-dias-dev',
    title: 'Fundamentos do dev',
    subtitle: 'A base sem a qual nada em cima faz sentido.',
    audience: 'Dev júnior ou em transição que quer solidificar o básico técnico.',
    color: '#f59e0b',
    emoji: '🚀',
    moduleSlugs: [
      'linux-terminal-basico',
      'git-de-verdade',
      'github-fluxo-profissional',
      'http-do-zero',
      'select-join-na-pratica',
    ],
  },
];
