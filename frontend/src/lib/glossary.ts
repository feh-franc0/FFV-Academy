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
  // ─── AI 2026 expansion ───
  'tool-use': {
    term: 'Tool Use (Function Calling)',
    short: 'Capacidade do LLM de chamar ferramentas/APIs externas de forma estruturada: o modelo retorna JSON com "nome da tool + parâmetros", app executa e devolve resultado pro modelo. Base dos agents.',
    related: ['mcp', 'agents'],
  },
  'agent-harness': {
    term: 'Agent Harness',
    short: 'Infraestrutura ao redor do LLM que gerencia loop de decisão: system prompt, tool calls, permissões, context management, hooks. Claude Code é um harness; agent SDK permite criar harnesses customizados.',
    related: ['tool-use'],
  },
  'mcp': {
    term: 'MCP (Model Context Protocol)',
    short: 'Protocolo aberto da Anthropic (2024) para conectar LLMs a fontes de dados/ferramentas externas de forma padronizada. Cliente-servidor, JSON-RPC. Desacopla modelo de integração.',
    related: ['tool-use', 'agent-harness'],
  },
  'moe': {
    term: 'MoE (Mixture of Experts)',
    short: 'Arquitetura onde apenas um subset dos parâmetros (experts) é ativado por token — total grande, compute menor. Usado em Mixtral, DeepSeek-V3, GPT-4, Claude. Router decide qual expert.',
    related: ['llm', 'inference'],
  },
  'rag-evals': {
    term: 'RAG Evaluation',
    short: 'Métricas para sistemas RAG: faithfulness (resposta baseada no contexto?), answer relevance, context precision/recall. Frameworks: ragas, TruLens. Diferente de eval de LLM puro.',
    related: ['rag', 'llm-as-judge'],
  },
  'kv-cache': {
    term: 'KV Cache',
    short: 'Cache de chaves/valores de atenção em transformers — evita recalcular tokens já processados. Essencial pra perf; cresce linearmente com context → bottleneck de memória em LLMs longos.',
    related: ['inference'],
  },
  'speculative-decoding': {
    term: 'Speculative Decoding',
    short: 'Técnica de inference: modelo pequeno gera rascunho de N tokens, modelo grande verifica em paralelo. Acelera 2-4× sem perder qualidade. Usado em Claude, GPT-4 2024+.',
    related: ['inference', 'kv-cache'],
  },
  'lora': {
    term: 'LoRA / QLoRA',
    short: 'Low-Rank Adaptation: fine-tuning que treina apenas matrizes low-rank plugadas ao modelo original — 99% menos parâmetros treinados, mesma qualidade. QLoRA adiciona quantization pra rodar em GPU menor.',
    related: ['fine-tuning'],
  },
  'dpo': {
    term: 'DPO (Direct Preference Optimization)',
    short: 'Alternativa ao RLHF: otimiza diretamente com pares (preferida, rejeitada) sem reward model separado. Mais simples, resultados competitivos. Adoção rápida pós-paper 2023.',
    related: ['rlhf', 'fine-tuning'],
  },
  'constitutional-ai': {
    term: 'Constitutional AI',
    short: 'Método da Anthropic: modelo se auto-critica seguindo princípios (a "constituição") antes de responder. Reduz conteúdo prejudicial sem humano anotando cada exemplo.',
    related: ['rlhf'],
  },
  'prompt-injection': {
    term: 'Prompt Injection',
    short: 'Ataque onde input do usuário subverte instruções do system prompt. Indirect: atacante injeta via documento que o agent lê. Vetor crítico em agents com tool use em 2026.',
    related: ['agents', 'tool-use'],
  },
  'llm-as-judge': {
    term: 'LLM-as-Judge',
    short: 'Usar um LLM pra avaliar saídas de outro LLM. Armadilhas: position bias, verbosity bias, self-enhancement. Mitigação: random order, cross-family (GPT julga Claude), calibração humana.',
    related: ['rag-evals'],
  },
  'golden-set': {
    term: 'Golden Set',
    short: 'Dataset curado de referência usado pra avaliar consistentemente mudanças em prompts/modelos/arch. Deve ser stratified (easy/medium/hard), annotated, sem contamination com training data.',
    related: ['llm-as-judge'],
  },
  'ann-search': {
    term: 'ANN (Approximate Nearest Neighbors)',
    short: 'Busca aproximada em vetores alta-dimensão: HNSW (grafos), IVF (clusters), LSH. Trade-off recall × latency × memória. Usado em todo vector DB.',
    related: ['vector-db', 'embedding'],
  },
  'vector-db': {
    term: 'Vector Database',
    short: 'DB especializado em indexar embeddings e busca ANN. pgvector (Postgres ext), Pinecone (managed), Weaviate (hybrid), Qdrant (Rust-based), Milvus. Base de RAG.',
    related: ['rag', 'ann-search', 'embedding'],
  },
  'agents': {
    term: 'Agents (LLM)',
    short: 'LLM em loop: recebe objetivo → decide tool call → executa → observa → itera até completar. Requer tool use, memória, permissões. Claude Code, AutoGPT, crewAI são exemplos.',
    related: ['tool-use', 'agent-harness', 'mcp'],
  },
  'rlhf': {
    term: 'RLHF',
    short: 'Reinforcement Learning from Human Feedback: humanos ranqueiam saídas, reward model aprende, PPO ajusta LLM. Base de ChatGPT. Custoso; DPO surgiu como alternativa.',
    related: ['dpo', 'fine-tuning'],
  },
  'inference': {
    term: 'Inference',
    short: 'Rodar modelo já treinado pra gerar output. Bottleneck: memória (KV cache) + compute. Otimizações: quantization, speculative decoding, batching dinâmico (vLLM, Triton).',
    related: ['kv-cache', 'speculative-decoding'],
  },
};

export const GLOSSARY_SORTED = Object.entries(GLOSSARY)
  .sort(([, a], [, b]) => a.term.localeCompare(b.term, 'pt-BR'));
