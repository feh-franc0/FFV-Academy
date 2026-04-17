export interface GlossaryEntry {
  term: string;
  short: string;
  long?: string;
  related?: string[];
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  embedding: {
    term: 'Embedding',
    short: 'Vetor numérico que representa o significado semântico de um texto, imagem ou dado estruturado num espaço contínuo.',
    related: ['token', 'cosine-similarity'],
  },
  token: {
    term: 'Token',
    short: 'Pedaço atômico de texto (subpalavra, palavra ou caractere) que o modelo processa. Um token ≈ ¾ de uma palavra em inglês.',
    related: ['embedding', 'bpe'],
  },
  bpe: {
    term: 'BPE (Byte Pair Encoding)',
    short: 'Algoritmo de tokenização que funde iterativamente os pares de bytes mais frequentes até atingir o tamanho desejado de vocabulário.',
    related: ['token'],
  },
  'cosine-similarity': {
    term: 'Cosine Similarity',
    short: 'Medida de similaridade entre dois vetores baseada no ângulo entre eles (0 = ortogonais, 1 = idênticos).',
    related: ['embedding'],
  },
  backpropagation: {
    term: 'Backpropagation',
    short: 'Algoritmo que calcula o gradiente da loss em relação a cada peso da rede, propagando o erro da saída para a entrada.',
    related: ['gradient-descent', 'loss-function'],
  },
  'gradient-descent': {
    term: 'Gradient Descent',
    short: 'Otimizador que ajusta pesos na direção oposta ao gradiente da loss, iterativamente reduzindo o erro.',
    related: ['backpropagation', 'learning-rate'],
  },
  'loss-function': {
    term: 'Loss Function (Função de Custo)',
    short: 'Métrica numérica que quantifica o erro entre a previsão do modelo e o valor real. O treino minimiza essa função.',
    related: ['backpropagation', 'gradient-descent'],
  },
  'learning-rate': {
    term: 'Learning Rate',
    short: 'Hiperparâmetro que controla o tamanho do passo em cada atualização de peso. Alto demais diverge, baixo demais estagna.',
    related: ['gradient-descent'],
  },
  overfitting: {
    term: 'Overfitting',
    short: 'Quando o modelo decora o treino e perde capacidade de generalizar para dados novos.',
    related: ['regularization', 'dropout'],
  },
  regularization: {
    term: 'Regularização (L1/L2)',
    short: 'Técnica que penaliza pesos grandes para evitar overfitting. L1 gera sparsity, L2 distribui pesos.',
    related: ['overfitting', 'dropout'],
  },
  dropout: {
    term: 'Dropout',
    short: 'Técnica de regularização que desativa neurônios aleatoriamente durante o treino, forçando redundância.',
    related: ['overfitting', 'regularization'],
  },
  attention: {
    term: 'Attention (Mecanismo de Atenção)',
    short: 'Mecanismo que permite ao modelo pesar a importância relativa de cada token em relação a todos os outros na sequência.',
    related: ['transformer', 'self-attention'],
  },
  'self-attention': {
    term: 'Self-Attention',
    short: 'Caso específico de attention onde queries, keys e values vêm da mesma sequência.',
    related: ['attention', 'transformer'],
  },
  transformer: {
    term: 'Transformer',
    short: 'Arquitetura de rede neural baseada em attention (Vaswani et al., 2017). Base de todos os LLMs modernos.',
    related: ['attention', 'self-attention'],
  },
  llm: {
    term: 'LLM (Large Language Model)',
    short: 'Modelo de linguagem com bilhões de parâmetros, pré-treinado em grandes corpora, capaz de gerar e compreender texto.',
    related: ['transformer', 'token'],
  },
  rag: {
    term: 'RAG (Retrieval-Augmented Generation)',
    short: 'Padrão que combina busca em base de conhecimento + geração do LLM para respostas fundamentadas.',
    related: ['embedding', 'cosine-similarity'],
  },
  idempotencia: {
    term: 'Idempotência',
    short: 'Propriedade onde executar uma operação N vezes produz o mesmo resultado que executá-la uma vez.',
  },
  'cap-theorem': {
    term: 'Teorema CAP',
    short: 'Em sistema distribuído, é impossível garantir simultaneamente Consistency, Availability e Partition tolerance — escolha 2.',
  },
  slo: {
    term: 'SLO (Service Level Objective)',
    short: 'Meta interna de confiabilidade de um serviço (ex: "99,9% dos requests em < 200ms"). Mais restrito que SLA.',
    related: ['error-budget', 'sli'],
  },
  sli: {
    term: 'SLI (Service Level Indicator)',
    short: 'Métrica real que mede a experiência do usuário (ex: percentual de requests com latência < 200ms).',
    related: ['slo'],
  },
  'error-budget': {
    term: 'Error Budget',
    short: 'Margem de erro tolerada por um SLO (ex: se SLO é 99,9%, o budget é 0,1% = 43,2 min/mês).',
    related: ['slo'],
  },
  vpc: {
    term: 'VPC (Virtual Private Cloud)',
    short: 'Rede virtual isolada na AWS onde você roda seus recursos. Define sub-redes, routing e segurança.',
  },
  iam: {
    term: 'IAM (Identity and Access Management)',
    short: 'Serviço AWS que controla quem (identidade) pode fazer o quê (permissões) em quais recursos.',
  },
  'context-window': {
    term: 'Context Window',
    short: 'Quantidade máxima de tokens que um LLM pode processar numa única chamada (inclui prompt + resposta).',
    related: ['token', 'llm'],
  },
  temperature: {
    term: 'Temperature',
    short: 'Parâmetro que controla aleatoriedade na geração. 0 = determinístico, 1+ = mais criativo/aleatório.',
    related: ['llm', 'top-p'],
  },
  'top-p': {
    term: 'Top-p (Nucleus Sampling)',
    short: 'Estratégia de sampling que considera apenas tokens cuja probabilidade acumulada atinge p%. Top-p=0.9 ignora os 10% menos prováveis.',
    related: ['temperature'],
  },
};

export const GLOSSARY_SORTED = Object.entries(GLOSSARY)
  .sort(([, a], [, b]) => a.term.localeCompare(b.term, 'pt-BR'));
