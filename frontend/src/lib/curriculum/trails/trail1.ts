import type { Trail } from '../types';

/** Fundamentos da IA */
export const trilha_trail1: Trail = {
    id: 'trail1',
    name: 'Fundamentos da IA',
    color: '#58a6ff',
    icon: '🧠',
    /**
     * Texto longo de propósito, como nas outras 39 trilhas.
     *
     * Era a única `desc` curta (53 caracteres), e por isso o `TrailBlogClient`
     * tinha um parágrafo escrito no código só para esta trilha, escolhido por
     * `trail.id === 'trail1'`. O efeito colateral, medido em 06/ago/2026: as
     * OUTRAS 39 trilhas caíam no `else` e mostravam todas o MESMO parágrafo.
     * O texto que estava lá para o trail1 mudou de casa — foi para o dado.
     */
    desc: 'O ponto de partida. Aqui você vai entender o que a IA realmente é — sem buzzwords, sem exagero: dados, treino, redes neurais, tokens e transformers. Cada artigo constrói sobre o anterior, do conceito até a arquitetura que move o mundo hoje.',
    level: 'beginner',
    href: '/fundamentos-da-ia',
    modules: [
      {
        slug: 'o-que-e-ia',
        title: 'O que é Inteligência Artificial?',
        icon: '🤖',
        xp: 30,
        readTime: 6,
        desc: 'Do conceito à realidade: o que é IA, o que não é, e por que você precisa entender isso agora.',
        objetivo: 'Você distingue o que é IA do que é hype, com vocabulário suficiente para não se perder no resto da trilha.',
        level: 'beginner',
        keywords: 'o que é inteligencia artificial, IA para iniciantes, definição IA',
        nextSuggested: ['dados-o-combustivel'],
      },
      {
        slug: 'dados-o-combustivel',
        title: 'Dados: o Combustível da IA',
        icon: '⛽',
        xp: 30,
        readTime: 7,
        desc: 'Por que "dados são o novo petróleo" — e o que isso significa na prática para treinar um modelo.',
        level: 'beginner',
        keywords: 'dados inteligencia artificial, dataset machine learning, treinamento IA',
        prerequisites: ['o-que-e-ia'],
        nextSuggested: ['como-ia-aprende'],
      },
      {
        slug: 'como-ia-aprende',
        title: 'Como a IA Aprende (Machine Learning)',
        icon: '📈',
        xp: 40,
        readTime: 8,
        desc: 'Gradiente descendente, loss function, backpropagation — explicados sem complicar.',
        level: 'beginner',
        keywords: 'como machine learning funciona, gradiente descendente explicado, treinamento modelo IA',
        prerequisites: ['dados-o-combustivel'],
        nextSuggested: ['redes-neurais'],
      },
      {
        slug: 'redes-neurais',
        title: 'Redes Neurais: o Cérebro Artificial',
        icon: '🕸️',
        xp: 50,
        readTime: 10,
        desc: 'Neurônios, camadas, ativações — a arquitetura que imita (e supera) o cérebro em tarefas específicas.',
        level: 'beginner',
        keywords: 'redes neurais artificiais, deep learning, como funciona rede neural',
        prerequisites: ['como-ia-aprende'],
        nextSuggested: ['o-que-e-llm'],
      },
      {
        slug: 'o-que-e-llm',
        title: 'O que é um LLM?',
        icon: '💬',
        xp: 50,
        readTime: 9,
        desc: 'Large Language Models: o que os torna diferentes, como foram treinados e por que o ChatGPT foi um divisor de águas.',
        level: 'beginner',
        keywords: 'o que é LLM, large language model explicado, como funciona chatgpt',
        prerequisites: ['redes-neurais'],
        nextSuggested: ['tokens', 'transformers'],
      },
      {
        slug: 'tokens',
        title: 'Tokens e Tokenização',
        icon: '🔤',
        xp: 40,
        readTime: 7,
        desc: 'A IA não lê palavras — ela lê tokens. Entenda o que isso muda em custo, velocidade e limites de contexto.',
        level: 'beginner',
        keywords: 'tokens IA, tokenização LLM, contexto tokens, BPE tokenizacao',
        prerequisites: ['o-que-e-llm'],
        nextSuggested: ['transformers'],
      },
      {
        slug: 'transformers',
        title: 'Transformers e Mecanismo de Atenção',
        icon: '⚙️',
        xp: 60,
        readTime: 12,
        desc: 'A arquitetura que mudou tudo em 2017 — Attention Is All You Need e por que o transformer é onipresente.',
        level: 'beginner',
        keywords: 'transformer arquitetura IA, mecanismo atencao IA, attention is all you need',
        prerequisites: ['o-que-e-llm', 'tokens'],
        nextSuggested: ['kv-cache', 'coding-agents-panorama', 'rag-fundamentos'],
      },
    ],
  };
