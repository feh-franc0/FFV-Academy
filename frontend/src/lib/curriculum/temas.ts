import type { Module, Trail } from './types';
import { CURRICULUM } from './trails';
import { MODULOS_POR_TEMA } from './temas-mapa';
import { temConteudo } from '../content-availability';

/**
 * Temas — o eixo de ASSUNTO, transversal a hub e trilha.
 *
 * ## Por que existe uma terceira classificação
 *
 * Hub e trilha são hierarquia de ENSINO: onde o aluno está na jornada, em que
 * ordem estudar, o que vem antes. É a classificação certa para quem já entrou.
 *
 * Quem chega da busca não pergunta isso. A consulta é "como medir alucinação em
 * produção", e a resposta mora em três trilhas diferentes — Evals, LLMOps e
 * Bedrock. Hub não ajuda: o assunto atravessa hubs. Trilha não ajuda: o assunto é
 * menor que uma trilha e maior que um módulo.
 *
 * Tema é esse recorte. Um módulo tem 1 hub, 1 trilha e **N temas**.
 *
 * ## Por que isso é a unidade que a busca com IA mede
 *
 * O estudo de 1.094 categorias em ChatGPT (Semrush + Kevin Indig, 2026) mediu
 * presença por TÓPICO, não por página, e encontrou uma penalidade para quem
 * aparece em apenas 1 dos 5 arquétipos de prompt de uma categoria — penalidade
 * que só desaparece ao cobrir 3 de 5. Para agir sobre isso é preciso ter o tópico
 * como objeto no sistema. Sem tema, não há o que medir nem onde agrupar.
 *
 * O levantamento completo está em `PESQUISA_DEMANDA_BUSCA_2026-08.md`.
 *
 * ## Onde o mapa mora
 *
 * A atribuição módulo → temas está em `temas-mapa.ts`, GERADO por
 * `scripts/seo/gerar_corpus.py` a partir de título, descrição e palavras-chave de
 * cada módulo, com uma lista de exceções para os falsos positivos conhecidos. O
 * gerador é a fonte; este arquivo é só a definição editorial dos 21 temas.
 */

export type TemaId =
  | 'agentes'
  | 'rag-retrieval'
  | 'prompt-contexto'
  | 'avaliacao-evals'
  | 'seguranca-ia'
  | 'modelos-internals'
  | 'custo-finops'
  | 'producao-sre'
  | 'dados-engenharia'
  | 'aws-core'
  | 'bedrock'
  | 'certificacao'
  | 'linguagens'
  | 'fundamentos-cs'
  | 'arquitetura-design'
  | 'carreira'
  | 'busca-ia-geo'
  | 'conformidade-ia'
  | 'ferramentas-ia';

export interface Tema {
  id: TemaId;
  /** Rota: `/temas/<slug>`. Igual ao id, por decisão — id que difere de slug vira bug de link. */
  slug: TemaId;
  name: string;
  icon: string;
  color: string;
  /** Uma linha. Vira a descrição de metadados da página do tema. */
  tagline: string;
  /** Um parágrafo. Vira o texto de abertura da página. */
  desc: string;
}

export const TEMAS: Tema[] = [
  {
    id: 'agentes',
    slug: 'agentes',
    name: 'Agentes e orquestração',
    icon: '🤖',
    color: '#cc785c',
    tagline: 'Agente que executa, erra e corrige: loop, ferramentas, permissão e limite de gasto.',
    desc: 'Um agente não é um chat com personalidade — é um laço que chama ferramenta, lê o resultado e decide o passo seguinte. O que define o comportamento é o harness em volta do modelo: quais ferramentas existem, o que a permissão deixa passar, e onde o laço para. Aqui entra desde o primeiro tool call até time de subagentes, memória, e o problema que ninguém resolve no primeiro dia: custo imprevisível por construção.',
  },
  {
    id: 'rag-retrieval',
    slug: 'rag-retrieval',
    name: 'RAG e retrieval',
    icon: '🔍',
    color: '#10b981',
    tagline: 'Buscar o trecho certo antes de gerar: chunking, embedding, índice e reranking.',
    desc: 'RAG resolve um problema de FATO, não de comportamento: o modelo não sabe o que está no seu banco. A qualidade da resposta é decidida na recuperação, não na geração — e é por isso que a maior parte do trabalho é chunking, escolha de índice, busca híbrida e reranking. Quem começa ajustando o prompt de geração está mexendo na última etapa de uma fila.',
  },
  {
    id: 'prompt-contexto',
    slug: 'prompt-contexto',
    name: 'Prompt e engenharia de contexto',
    icon: '📝',
    color: '#58a6ff',
    tagline: 'O que entra na janela decide o resultado — e a conta.',
    desc: 'Engenharia de contexto é decidir o que ocupa a janela e em que ordem. Tem consequência dupla: atenção do modelo e custo de entrada, que é normalmente o maior item da fatura. A parte estável do prompt vindo primeiro é o que permite cache; instrução permanente escrita na mensagem do usuário se perde na chamada seguinte. Aqui também entram os limites: instrução é pedido, não garantia.',
  },
  {
    id: 'avaliacao-evals',
    slug: 'avaliacao-evals',
    name: 'Avaliação e evals',
    icon: '🎯',
    color: '#a78bfa',
    tagline: 'Saber se está certo antes de subir — e medir quando piora.',
    desc: 'A frustração nº 1 de quem programa com IA é a resposta "quase certa, mas não" — 66% dos desenvolvedores em 2026. Eval é o que transforma essa sensação em número: conjunto de casos, critério de acerto, e regressão detectada antes do deploy. Inclui as armadilhas de usar modelo como juiz, detecção de alucinação em produção e o custo de rodar avaliação no CI.',
  },
  {
    id: 'seguranca-ia',
    slug: 'seguranca-ia',
    name: 'Segurança de IA',
    icon: '🛡️',
    color: '#f85149',
    tagline: 'Prompt injection, jailbreak, sandbox e o que só código garante.',
    desc: 'A superfície de ataque de um sistema com IA não é a do software tradicional: a entrada é linguagem, e linguagem instrui. Prompt injection é o risco nº 1 do OWASP LLM Top 10 porque não existe filtro de texto que resolva — o que resolve é limitar o que o sistema PODE fazer. Regra que organiza o tema: o que não pode falhar não pertence ao prompt, pertence à permissão e ao sandbox.',
  },
  {
    id: 'modelos-internals',
    slug: 'modelos-internals',
    name: 'Modelos por dentro',
    icon: '🧠',
    color: '#818cf8',
    tagline: 'Transformer, atenção, tokenização, quantização, fine-tuning e raciocínio.',
    desc: 'A parte que a maioria dos cursos pula. Como a atenção funciona matematicamente, por que a tokenização explica erro de contagem, o que a quantização troca por memória, quando fine-tuning muda comportamento e por que não resolve falta de conhecimento. Entender isto é a diferença entre ajustar parâmetro por tentativa e prever o que vai acontecer.',
  },
  {
    id: 'custo-finops',
    slug: 'custo-finops',
    name: 'Custo e FinOps',
    icon: '💰',
    color: '#e3b341',
    tagline: 'Cache de prompt, roteamento de modelo, lote e teto de gasto.',
    desc: 'Sistema com IA tem custo que varia com o comportamento do usuário e do próprio agente — o número de voltas do laço não é decidido por você. As alavancas reais são poucas e ordenáveis: cache da parte estável do prompt, roteamento por tarefa, processamento em lote quando ninguém espera, e teto de passos. Aqui também entra o lado AWS: reserva, spot e alocação de custo em escala.',
  },
  {
    id: 'producao-sre',
    slug: 'producao-sre',
    name: 'Produção, SRE e observabilidade',
    icon: '⚙️',
    color: '#fb923c',
    tagline: 'SLO, trace, incidente e deploy — a camada que sustenta IA no ar.',
    desc: 'O que separa protótipo de produto é a camada de operação: o que se mede, o que acorda alguém às 3h e o que se faz quando quebra. Para sistema com IA há um agravante — a saída é não determinística, então "funcionou no teste" não é evidência. Trace de agente, span por chamada de ferramenta e SLO que reflete experiência, não média.',
  },
  {
    id: 'dados-engenharia',
    slug: 'dados-engenharia',
    name: 'Dados e engenharia de dados',
    icon: '🏭',
    color: '#22d3ee',
    tagline: 'Postgres por dentro, pipeline, streaming e o índice que decide a latência.',
    desc: 'Sistema de IA é sistema de dados com um modelo na ponta. O que decide desempenho continua sendo o de sempre: escolha de índice, plano de consulta, transação, replicação, formato de arquivo. Inclui internals de Postgres (MVCC, vacuum, tipos de índice), pipeline em lote e em fluxo, e a decisão entre banco relacional e outros modelos.',
  },
  {
    id: 'aws-core',
    slug: 'aws-core',
    name: 'Serviços AWS',
    icon: '☁️',
    color: '#ff9900',
    tagline: 'VPC, IAM, S3, Lambda, filas e os serviços que caem na prova e no trabalho.',
    desc: 'Os serviços que aparecem em toda arquitetura e em toda certificação: rede e isolamento, identidade e permissão, armazenamento, computação, fila e evento. O corte é por decisão — quando Lambda em vez de container, quando fila em vez de chamada direta, o que a permissão realmente permite — porque decorar nome de serviço não passa em prova de arquitetura nem resolve incidente.',
  },
  {
    id: 'bedrock',
    slug: 'bedrock',
    name: 'Amazon Bedrock',
    icon: '🪨',
    color: '#ff9900',
    tagline: 'Modelo gerenciado na AWS: Converse, agentes, knowledge bases e guardrails.',
    desc: 'Bedrock é a ponte entre construir com IA e operar dentro da AWS: modelo gerenciado, sem servidor para provisionar, com IAM, VPC e faturamento da conta. Aqui entram a escolha de modelo do catálogo, a API Converse, knowledge bases para RAG, agentes, guardrails e o que muda em relação a chamar a API do fornecedor direto.',
  },
  {
    id: 'certificacao',
    slug: 'certificacao',
    name: 'Certificação',
    icon: '🏅',
    color: '#ff9900',
    tagline: 'CLF-C02, AIF-C01, DVA-C02, SAA-C03 e SAP-C03 — domínio, peso e simulado.',
    desc: 'A certificação vale pelo que ela força a estudar em ordem, e pela porta que abre: Solutions Architect Associate é a credencial mais pedida em vaga, e AI Practitioner é a que mais cresceu em agendamento. Cada trilha cobre os domínios com o peso real da prova e fecha em simulado com questão comentada — explicação que trata cada alternativa errada, não só a certa.',
  },
  {
    id: 'linguagens',
    slug: 'linguagens',
    name: 'Linguagens',
    icon: '💻',
    color: '#38bdf8',
    tagline: 'Python, Go, TypeScript e Rust do ponto de vista de quem constrói com IA.',
    desc: 'Linguagem para quem constrói sistema de IA: Python pelo ecossistema e pelas armadilhas de tipagem em código que vira produção, Go pela concorrência e pelo binário único, TypeScript pelo tipo que sobrevive ao build, Rust pelo custo que se paga uma vez. O corte é por decisão de engenharia, não por sintaxe.',
  },
  {
    id: 'fundamentos-cs',
    slug: 'fundamentos-cs',
    name: 'Fundamentos de computação',
    icon: '🔬',
    color: '#94a3b8',
    tagline: 'HTTP, DNS, TLS, Git, Linux, memória e concorrência — a base que não envelhece.',
    desc: 'A camada que continua igual embaixo de qualquer novidade. O que acontece entre digitar uma URL e ver a página, por que a restrição de origem é do navegador e não do servidor, o que o Git guarda de verdade, como o sistema operacional decide o que roda. É o que permite depurar em vez de tentar.',
  },
  {
    id: 'arquitetura-design',
    slug: 'arquitetura-design',
    name: 'Arquitetura e system design',
    icon: '📐',
    color: '#c084fc',
    tagline: 'Consistência, saga, idempotência, fila e entrevista de sistema.',
    desc: 'As decisões que não se desfazem sem migração: onde fica o estado, o que é consistente e quando, o que acontece na retentativa, o que a fila desacopla e o que ela esconde. Serve para projetar e para a entrevista sênior, que é a mesma conversa com tempo cronometrado.',
  },
  {
    id: 'carreira',
    slug: 'carreira',
    name: 'Carreira e mercado',
    icon: '🚀',
    color: '#34d399',
    tagline: 'Engenheiro de IA no Brasil: rotina, faixa salarial, portfólio e entrevista.',
    desc: 'Engenheiro de IA é o nº 1 do ranking de Empregos em Alta 2026 do LinkedIn no Brasil, e vaga que exige alguma habilidade de IA paga em média 28% mais. O que este tema cobre é o lado prático da transição: o que o papel faz de verdade, o que aprender em que ordem, que projeto prova competência em triagem técnica, e o que se pergunta em entrevista.',
  },
  {
    id: 'busca-ia-geo',
    slug: 'busca-ia-geo',
    name: 'Busca com IA e visibilidade',
    icon: '🔭',
    color: '#f472b6',
    tagline: 'AI Overviews, query fan-out, dados estruturados e como ser citado.',
    desc: 'O buscador deixou de devolver links e passou a devolver resposta: resumo de IA aparece em 48% das buscas, e o clique cai 15,5% quando aparece. O mecanismo por baixo é o query fan-out — uma consulta é decomposta em 8 a 12 sub-consultas paralelas —, o que muda a unidade de trabalho de página para assunto. Aqui entram os dados estruturados que existem, os que foram descontinuados, e como medir citação em resposta de IA.',
  },
  {
    id: 'conformidade-ia',
    slug: 'conformidade-ia',
    name: 'Conformidade e regulação de IA',
    icon: '⚖️',
    color: '#fbbf24',
    tagline: 'LGPD, PL 2338, EU AI Act, governança e rastro de auditoria.',
    desc: 'A pergunta corporativa nº 1 sobre IA não é técnica: "posso mandar dado de cliente para esse modelo?". Responder exige entender o que a LGPD trata como tratamento de dado, o que o marco legal brasileiro em discussão exige, por que o AI Act europeu alcança empresa brasileira, e o que precisa ficar registrado para uma auditoria conseguir reconstruir uma decisão automatizada.',
  },
  {
    id: 'ferramentas-ia',
    slug: 'ferramentas-ia',
    name: 'Ferramentas de IA do mercado',
    icon: '🧰',
    color: '#60a5fa',
    tagline: 'Claude Code, Cursor, Copilot, ChatGPT, Ollama — o que cada um resolve.',
    desc: 'Adoção de ferramenta de IA para código chegou a 84% em 2026, e a confiança caiu: só 29% acham a saída precisa, e 45% dizem que depurar código gerado leva mais tempo que escrever. Comparar ferramenta é, portanto, comparar o que cada uma exige de revisão. O corte aqui é de engenharia — forma, contexto, permissão, custo — não de preferência.',
  },
];

/**
 * Mínimo de módulos com conteúdo para um tema ganhar página própria.
 *
 * Três é o limiar, e o número vem do estudo de 1.094 categorias: presença em 1 de
 * 5 arquétipos de prompt é penalizada até se chegar a 3 de 5. Um tema com dois
 * módulos não sustenta três arquétipos, então a página seria fina — e página fina
 * não é neutra, ela dilui o resto do domínio. O tema aparece no índice de
 * `/temas` marcado como em produção, com a contagem à vista.
 */
export const MINIMO_PARA_PAGINA = 3;

const POR_SLUG = new Map(TEMAS.map(t => [t.slug as string, t]));

export function getTema(slug: string): Tema | undefined {
  return POR_SLUG.get(slug);
}

export interface ModuloDeTema {
  /** `modulo`, e não `module`: o identificador `module` é reservado no lint do Next. */
  modulo: Module;
  trilha: Trail;
}

/**
 * Módulos de um tema, na ordem do currículo, **só os que têm conteúdo escrito**.
 *
 * O filtro por conteúdo é o mesmo do sitemap e existe pela mesma razão: anunciar
 * URL que responde 404 gasta rastreamento e leva o leitor ao erro.
 */
export function getTemaModules(id: TemaId): ModuloDeTema[] {
  const slugs = new Set(MODULOS_POR_TEMA[id] ?? []);
  const saida: ModuloDeTema[] = [];
  for (const trilha of CURRICULUM) {
    for (const modulo of trilha.modules) {
      if (slugs.has(modulo.slug) && temConteudo(modulo.slug)) {
        saida.push({ modulo, trilha });
      }
    }
  }
  return saida;
}

export function getTemaStats(id: TemaId): { modules: number; minutes: number; xp: number; trails: number } {
  const itens = getTemaModules(id);
  return {
    modules: itens.length,
    minutes: itens.reduce((a, i) => a + i.modulo.readTime, 0),
    xp: itens.reduce((a, i) => a + i.modulo.xp, 0),
    trails: new Set(itens.map(i => i.trilha.id)).size,
  };
}

/** Temas de um módulo — usado para cruzar assunto no fim do artigo. */
export function getTemasDoModulo(slug: string): Tema[] {
  return TEMAS.filter(t => (MODULOS_POR_TEMA[t.id] ?? []).includes(slug));
}
