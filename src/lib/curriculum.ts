export interface Module {
  slug: string;
  title: string;
  icon: string;
  xp: number;
  readTime: number;
  desc: string;
  seoDesc: string;
  keywords: string;
  externalUrl?: string;
}

export interface Trail {
  id: string;
  name: string;
  color: string;
  icon: string;
  desc: string;
  unlockAfter?: string;
  modules: Module[];
}

export const CURRICULUM: Trail[] = [
  {
    id: 'trail1',
    name: 'Fundamentos da IA',
    color: '#58a6ff',
    icon: '🧠',
    desc: 'Do zero ao LLM — entenda como a IA realmente funciona',
    modules: [
      {
        slug: 'o-que-e-ia',
        title: 'O que é Inteligência Artificial?',
        icon: '🤖',
        xp: 30,
        readTime: 6,
        desc: 'Do conceito à realidade: o que é IA, o que não é, e por que você precisa entender isso agora.',
        seoDesc: 'Entenda o que é Inteligência Artificial de verdade, sem buzzwords. Definição clara, exemplos práticos e histórico.',
        keywords: 'o que é inteligencia artificial, IA para iniciantes, definição IA',
      },
      {
        slug: 'dados-o-combustivel',
        title: 'Dados: o Combustível da IA',
        icon: '⛽',
        xp: 30,
        readTime: 7,
        desc: 'Por que "dados são o novo petróleo" — e o que isso significa na prática para treinar um modelo.',
        seoDesc: 'Entenda por que dados são essenciais para a IA funcionar, como datasets são criados e o que é qualidade de dados.',
        keywords: 'dados inteligencia artificial, dataset machine learning, treinamento IA',
      },
      {
        slug: 'como-ia-aprende',
        title: 'Como a IA Aprende (Machine Learning)',
        icon: '📈',
        xp: 40,
        readTime: 8,
        desc: 'Gradiente descendente, loss function, backpropagation — explicados sem complicar.',
        seoDesc: 'Como machine learning funciona na prática: treinamento, gradiente descendente e otimização explicados de forma simples.',
        keywords: 'como machine learning funciona, gradiente descendente explicado, treinamento modelo IA',
      },
      {
        slug: 'redes-neurais',
        title: 'Redes Neurais: o Cérebro Artificial',
        icon: '🕸️',
        xp: 50,
        readTime: 10,
        desc: 'Neurônios, camadas, ativações — a arquitetura que imita (e supera) o cérebro em tarefas específicas.',
        seoDesc: 'O que são redes neurais artificiais, como funcionam neurônios artificiais, camadas e funções de ativação.',
        keywords: 'redes neurais artificiais, deep learning, como funciona rede neural',
      },
      {
        slug: 'o-que-e-llm',
        title: 'O que é um LLM?',
        icon: '💬',
        xp: 50,
        readTime: 9,
        desc: 'Large Language Models: o que os torna diferentes, como foram treinados e por que o ChatGPT foi um divisor de águas.',
        seoDesc: 'O que é um LLM (Large Language Model), como funciona o ChatGPT, Claude e Gemini. Explicação completa.',
        keywords: 'o que é LLM, large language model explicado, como funciona chatgpt',
      },
      {
        slug: 'tokens',
        title: 'Tokens e Tokenização',
        icon: '🔤',
        xp: 40,
        readTime: 7,
        desc: 'A IA não lê palavras — ela lê tokens. Entenda o que isso muda em custo, velocidade e limites de contexto.',
        seoDesc: 'O que são tokens em IA, como funciona tokenização BPE, por que contexto é medido em tokens e como isso afeta o custo.',
        keywords: 'tokens IA, tokenização LLM, contexto tokens, BPE tokenizacao',
      },
      {
        slug: 'transformers',
        title: 'Transformers e Mecanismo de Atenção',
        icon: '⚙️',
        xp: 60,
        readTime: 12,
        desc: 'A arquitetura que mudou tudo em 2017 — Attention Is All You Need e por que o transformer é onipresente.',
        seoDesc: 'Como funciona o Transformer e mecanismo de atenção. A arquitetura por trás de GPT, Claude e BERT explicada.',
        keywords: 'transformer arquitetura IA, mecanismo atencao IA, attention is all you need',
      },
    ],
  },
  {
    id: 'trail2',
    name: 'IA Além do LLM',
    color: '#d2a8ff',
    icon: '🏗️',
    desc: 'KV Cache, MoE, Tool Calling, avaliação — como modelos funcionam em produção',
    modules: [
      {
        slug: 'kv-cache',
        title: 'KV Cache: Memória Eficiente',
        icon: '⚡',
        xp: 60,
        readTime: 8,
        desc: 'Por que um modelo de 30GB pode precisar de 60GB de VRAM — e como o KV Cache resolve isso.',
        seoDesc: 'O que é KV Cache em transformers, como funciona Key-Value Cache, por que é essencial para inferência eficiente.',
        keywords: 'kv cache transformers, key value cache LLM, memoria eficiente IA',
      },
      {
        slug: 'mixture-of-experts',
        title: 'Mixture of Experts (MoE)',
        icon: '🧩',
        xp: 70,
        readTime: 10,
        desc: '200B parâmetros que não cabem na GPU — veja como o MoE ativa só o que é necessário.',
        seoDesc: 'O que é Mixture of Experts (MoE), como funciona o roteamento de experts, Mixtral e modelos MoE explicados.',
        keywords: 'mixture of experts MoE, mixtral arquitetura, sparse model IA',
      },
      {
        slug: 'tool-calling',
        title: 'Tool Calling e Agentes',
        icon: '🔧',
        xp: 70,
        readTime: 9,
        desc: 'Como a IA aprendeu a usar ferramentas externas — e por que isso transformou LLMs em agentes.',
        seoDesc: 'O que é tool calling em IA, como agentes usam ferramentas, function calling na API do Claude e OpenAI.',
        keywords: 'tool calling IA, function calling LLM, agentes IA ferramentas',
      },
      {
        slug: 'ia-alem-do-llm',
        title: 'Harness: a Infraestrutura do Agente',
        icon: '🏗️',
        xp: 80,
        readTime: 15,
        desc: 'Os 6 componentes que fazem um agente de IA funcionar de verdade.',
        seoDesc: 'O que é um coding harness para agentes de IA, os 6 componentes de um agente de programação, Claude Code vs Cursor.',
        keywords: 'harness agente IA, componentes agente programacao, claude code vs cursor',
      },
      {
        slug: 'como-avaliar-modelos',
        title: 'Como Avaliar Modelos de IA',
        icon: '📊',
        xp: 60,
        readTime: 8,
        desc: 'MMLU, HumanEval, benchmark contamination — como saber se um modelo é realmente melhor.',
        seoDesc: 'Como avaliar modelos de IA, o que são benchmarks MMLU HumanEval, como LM Eval Harness funciona.',
        keywords: 'avaliar modelos IA, benchmarks LLM, MMLU HumanEval, lm evaluation harness',
      },
    ],
  },
  {
    id: 'trail3',
    name: 'Ferramentas de IA para Código',
    color: '#ffa657',
    icon: '💻',
    desc: 'Claude Code, Codex, Cursor, Kiro — as diferenças reais entre os coding agents',
    modules: [
      {
        slug: 'coding-agents-panorama',
        title: 'O Panorama dos Coding Agents',
        icon: '🗺️',
        xp: 50,
        readTime: 8,
        desc: 'De Copilot ao Claude Code — como os assistentes de código evoluíram de autocomplete para agentes autônomos.',
        seoDesc: 'O que são coding agents, diferença entre autocomplete e agentes de IA para código, histórico e evolução.',
        keywords: 'coding agents IA, assistentes codigo IA, claude code vs copilot, ferramentas IA programacao',
      },
      {
        slug: 'claude-code-arquitetura',
        title: 'Claude Code: Filosofia e Arquitetura',
        icon: '🤖',
        xp: 70,
        readTime: 12,
        desc: 'Como o Claude Code funciona por dentro — o loop agêntico, as ferramentas, o modelo de confiança e por que é diferente dos IDEs.',
        seoDesc: 'Como Claude Code funciona internamente, loop agêntico, ferramentas bash/read/write, arquitetura do agente de terminal.',
        keywords: 'claude code como funciona, arquitetura claude code, loop agentico claude, CLI agente IA',
      },
      {
        slug: 'openai-codex-cloud',
        title: 'OpenAI Codex: o Agente na Nuvem',
        icon: '☁️',
        xp: 65,
        readTime: 10,
        desc: 'O novo Codex (2025) é completamente diferente do antigo — roda em sandbox na nuvem, é assíncrono e paralelo. Entenda o que isso muda.',
        seoDesc: 'Como funciona o OpenAI Codex 2025, sandbox cloud, execução assíncrona, diferença do Claude Code.',
        keywords: 'openai codex 2025, codex cloud sandbox, openai coding agent, codex vs claude code',
      },
      {
        slug: 'cursor-copilot-ides',
        title: 'Cursor, Copilot e os IDEs Aumentados',
        icon: '🖥️',
        xp: 60,
        readTime: 10,
        desc: 'A abordagem IDE-first — como Cursor e Copilot integram IA no editor e por que isso é uma filosofia diferente dos agentes de terminal.',
        seoDesc: 'Como Cursor e GitHub Copilot funcionam, diferenças entre IDEs com IA e agentes de terminal, comparação técnica.',
        keywords: 'cursor ide IA, github copilot arquitetura, cursor vs claude code, IDE aumentado IA',
      },
      {
        slug: 'amazon-q-kiro',
        title: 'Amazon Q e Kiro: a Aposta da AWS',
        icon: '☁️',
        xp: 60,
        readTime: 9,
        desc: 'O Amazon Q Developer e o novo Kiro têm filosofias distintas — um é extensão de IDE corporativo, o outro é spec-driven development.',
        seoDesc: 'O que é Amazon Q Developer, o que é Kiro AWS, spec-driven development, diferença entre Q e Kiro.',
        keywords: 'amazon q developer, kiro aws, spec driven development, amazon coding agent',
      },
      {
        slug: 'qual-coding-agent-usar',
        title: 'Qual Ferramenta Usar e Quando',
        icon: '⚖️',
        xp: 80,
        readTime: 12,
        desc: 'Matriz de decisão real: quando o Claude Code brilha, quando o Cursor vence, quando o Codex na nuvem faz sentido. Sem achismo.',
        seoDesc: 'Comparação técnica entre coding agents de IA: Claude Code vs Codex vs Cursor vs Copilot vs Kiro. Quando usar cada um.',
        keywords: 'comparar coding agents IA, claude code vs cursor vs copilot, qual IA usar para codigo, melhor ferramenta IA programacao',
      },
    ],
  },
];

export const LEVELS = [
  { level: 1, name: 'Curioso',         xpMin: 0,    xpMax: 100,  color: '#8b949e', icon: '🌱' },
  { level: 2, name: 'Aprendiz',        xpMin: 100,  xpMax: 250,  color: '#58a6ff', icon: '📚' },
  { level: 3, name: 'Praticante',      xpMin: 250,  xpMax: 500,  color: '#3fb950', icon: '⚡' },
  { level: 4, name: 'Desenvolvedor',   xpMin: 500,  xpMax: 800,  color: '#ffa657', icon: '🔧' },
  { level: 5, name: 'Especialista',    xpMin: 800,  xpMax: 1200, color: '#d2a8ff', icon: '🧠' },
  { level: 6, name: 'Arquiteto de IA', xpMin: 1200, xpMax: 1800, color: '#f78166', icon: '🏗️' },
  { level: 7, name: 'Mestre da IA',    xpMin: 1800, xpMax: 9999, color: '#ffa657', icon: '🚀' },
];

export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  xpBonus: number;
}

export const BADGES_DEF: BadgeDef[] = [
  { id: 'first_step',     name: 'Primeiro Passo',      icon: '👣', desc: 'Completou seu primeiro módulo',         xpBonus: 10  },
  { id: 'quiz_perfect',   name: 'Gabarito',             icon: '🎯', desc: 'Acertou todas as questões de um quiz', xpBonus: 20  },
  { id: 'streak_3',       name: '3 Dias Seguidos',      icon: '🔥', desc: '3 dias de estudo consecutivos',        xpBonus: 30  },
  { id: 'streak_7',       name: 'Semana Perfeita',      icon: '💪', desc: '7 dias de estudo consecutivos',        xpBonus: 75  },
  { id: 'streak_30',      name: 'Mês Dedicado',         icon: '🏆', desc: '30 dias de estudo consecutivos',       xpBonus: 200 },
  { id: 'trail1_done',    name: 'Fundamentos Sólidos',  icon: '🏅', desc: 'Completou a Trilha 1 completa',        xpBonus: 100 },
  { id: 'trail2_done',    name: 'Arquitetura Profunda', icon: '🥇', desc: 'Completou a Trilha 2 completa',        xpBonus: 150 },
  { id: 'trail3_done',    name: 'Engenheiro de Agentes',icon: '💻', desc: 'Completou a Trilha 3 completa',        xpBonus: 175 },
  { id: 'all_done',       name: 'Mestre Completo',      icon: '👑', desc: 'Completou TODAS as trilhas',           xpBonus: 300 },
  { id: 'speed_run',      name: 'Speed Run',            icon: '⚡', desc: 'Completou 3 módulos no mesmo dia',     xpBonus: 50  },
  { id: 'curious',        name: 'Muito Curioso',        icon: '🔍', desc: 'Revisitou um módulo já concluído',     xpBonus: 5   },
];

export function getLevelInfo(xp: number) {
  return LEVELS.find(l => xp >= l.xpMin && xp < l.xpMax) ?? LEVELS[LEVELS.length - 1];
}

export function getTrailProgress(trailModules: Module[], completedModules: string[]) {
  const done = trailModules.filter(m => completedModules.includes(m.slug)).length;
  return { done, total: trailModules.length, pct: Math.round((done / trailModules.length) * 100) };
}
