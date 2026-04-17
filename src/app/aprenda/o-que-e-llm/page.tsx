import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  FlowDiagram,
  ComparisonFlow,
  CodeBlock,
  StackFlow,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'O que é um LLM? — FFV Academy',
  description: 'Como um Large Language Model funciona por dentro: pré-treino, fine-tuning, RLHF, context window, temperature, top-p, custos por token e os limites reais.',
};

const ACCENT = '#58a6ff';

const quiz: QuizQuestion[] = [
  {
    question: 'Um LLM com context window de 128k tokens recebe um prompt de 120k tokens. Qual é o espaço disponível para a resposta?',
    options: [
      '128k tokens — a resposta não conta no contexto',
      '8k tokens — porque prompt + resposta precisam caber juntos na context window',
      '120k tokens — o modelo gera a mesma quantidade que recebe',
      '0 tokens — contexto cheio impede qualquer geração',
    ],
    correct: 1,
    explanation: 'Context window = prompt + resposta. Se o prompt ocupa 120k dos 128k, restam apenas 8k tokens para a geração. Por isso prompts muito longos limitam a qualidade da resposta — o modelo tem pouco espaço para "pensar".',
  },
  {
    question: 'Qual é o efeito de definir temperature=0 numa chamada de API a um LLM?',
    options: [
      'O modelo para de funcionar por falta de entropia',
      'A geração fica determinística — o modelo sempre escolhe o token mais provável, produzindo a mesma saída para o mesmo input',
      'A resposta fica mais criativa e diversa',
      'O modelo gasta menos tokens por resposta',
    ],
    correct: 1,
    explanation: 'Temperature=0 faz o modelo ser greedy: sempre pega o token com maior probabilidade. Ótimo para tarefas factuais (JSON, classificação). Temperature alta (0.7-1.0) aumenta aleatoriedade — melhor para criatividade, brainstorming.',
  },
  {
    question: 'Na fase de RLHF, o que o modelo realmente aprende?',
    options: [
      'Novos fatos e informações do mundo',
      'A minimizar uma reward model que reflete preferências humanas — basicamente "o que os humanos consideram uma boa resposta"',
      'A copiar respostas de outros modelos',
      'A ser mais rápido na inferência',
    ],
    correct: 1,
    explanation: 'RLHF treina um modelo de reward a partir de comparações humanas, depois usa RL (PPO ou DPO) para ajustar o LLM a maximizar esse reward. O modelo não aprende fatos novos — aprende estilo: ser útil, honesto, seguir instruções, recusar pedidos perigosos.',
  },
  {
    question: 'Por que o custo de input tokens geralmente é menor que o de output tokens nas APIs?',
    options: [
      'Input tokens são menores em bytes',
      'Processar o input é paralelizável (todos os tokens de uma vez) enquanto gerar output é sequencial (token por token) — cada output token requer um forward pass completo pelo modelo',
      'Os provedores cobram mais na saída por decisão de marketing',
      'Output tokens usam modelos diferentes internamente',
    ],
    correct: 1,
    explanation: 'No input (prefill), todos os tokens são processados em paralelo numa única passada. No output (decode), cada token requer uma passada separada pelo modelo, usando o KV Cache. Isso faz output ser ~2-4× mais caro computacionalmente — e por isso mais caro na API.',
  },
];

export default function OQueELLMPage() {
  return (
    <ModuleLayout
      slug="o-que-e-llm"
      title="O que é um LLM?"
      icon="💬"
      xp={50}
      readTime={9}
      trailName="Fundamentos da IA"
      trailColor={ACCENT}
      nextSlug="tokens"
      nextTitle="Tokens e Tokenização"
      quiz={quiz}
      seoDesc="Como um Large Language Model funciona por dentro: pré-treino, fine-tuning, RLHF, context window, temperature, top-p, custos e limites."
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        GPT, Claude, Gemini, Llama — todos são LLMs. Mas o que eles <em>fazem de verdade</em>? A resposta é mais simples e mais
        surpreendente do que parece: um LLM faz <strong>uma única coisa</strong> — prevê o próximo token. Só que faz isso com
        tanta precisão, treinado em tanto texto, que o resultado emergente parece inteligência. Neste módulo, vamos além da
        superfície: como são treinados (e quanto custa), o que é context window, temperature, top-p, e por que um prompt de
        100 palavras pode custar dinheiro real.
      </p>

      <Section title="A tarefa fundamental: prever o próximo token" accent={ACCENT}>
        <FlowDiagram
          title="Geração autorregressiva — um token por vez"
          accent={ACCENT}
          orientation="vertical"
          steps={[
            { icon: '📥', label: 'Input', desc: '"A capital do Brasil é"' },
            { icon: '🔢', label: 'Passo 1', desc: 'P(próximo | input) → "Brasília" 78% · "São Paulo" 12% · escolhe "Brasília"' },
            { icon: '🔢', label: 'Passo 2', desc: 'P(próximo | "...Brasília") → "," 45% · "." 35% · escolhe ","' },
            { icon: '🔢', label: 'Passo N', desc: 'Cada token gerado vira parte do input do próximo passo' },
            { icon: '📤', label: 'Output', desc: '"A capital do Brasil é Brasília, localizada no..." (geração contínua)' },
          ]}
        />
        <p>
          Do treino em trilhões de tokens de texto, o modelo aprendeu distribuições estatísticas sobre a linguagem humana.
          <strong> Ele não busca em banco de dados. Não acessa a internet. Não "entende" como um humano.</strong> O que faz é
          calcular probabilidades condicionais com uma precisão que emerge em comportamento que <em>parece</em> compreensão.
        </p>
      </Section>

      <Section title="As 3 fases do treino" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          title="Pipeline de treino de um LLM moderno"
          items={[
            {
              icon: '📚',
              label: 'Pré-treino (Pre-training)',
              sub: 'meses · $10M–$100M+',
              detail: 'Treinado em trilhões de tokens (web, livros, código, papers). Aprende linguagem, fatos, raciocínio, código. Objetivo: next-token prediction. Resultado: modelo base (capaz mas "selvagem", não segue instruções).',
              connector: 'gera modelo base',
            },
            {
              icon: '🎯',
              label: 'Fine-tuning supervisionado (SFT)',
              sub: 'dias · $10k–$1M',
              detail: 'Treinado em milhares de pares (instrução → resposta ideal) escritos por humanos. Aprende a seguir instruções, ter formato de chat, ser útil. É aqui que "base model" vira "assistant".',
              connector: 'gera assistant',
            },
            {
              icon: '🧑‍⚖️',
              label: 'RLHF / DPO (alinhamento)',
              sub: 'dias · $50k–$500k',
              detail: 'Humanos comparam pares de respostas e escolhem a melhor. Um reward model aprende as preferências. O LLM é otimizado (PPO ou DPO) pra maximizar esse reward: ser útil, honesto, seguro.',
            },
          ]}
        />
        <Callout tone="info">
          <strong>Custo real:</strong> treinar GPT-4 custou estimados $100M+. Claude 3.5 Sonnet: dezenas de milhões. Llama 3 405B:
          ~$30M em compute. O pré-treino domina o custo — SFT e RLHF são "baratos" em comparação.
        </Callout>
      </Section>

      <Section title="Context window: o limite mais importante" accent={ACCENT}>
        <p>
          A <strong>context window</strong> é o número máximo de tokens que o modelo pode processar numa única chamada — incluindo
          prompt <em>e</em> resposta. Tudo que está fora da window não existe para o modelo.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'Context window', 'Equivalente em texto', 'Nota']}
          rows={[
            ['GPT-3.5', '4k tokens', '~3.000 palavras', 'O ChatGPT original'],
            ['GPT-4o', '128k tokens', '~100.000 palavras', '~1 livro inteiro'],
            ['Claude 3.5 Sonnet', '200k tokens', '~150.000 palavras', '~2-3 livros'],
            ['Gemini 1.5 Pro', '1M tokens', '~750.000 palavras', '~10 livros'],
            ['Claude Opus 4', '200k tokens', '~150.000 palavras', 'Extended thinking usa parte da window'],
          ]}
        />
        <Callout tone="warn">
          <strong>Context != memória.</strong> O modelo não "lembra" conversas anteriores — cada chamada de API é independente.
          O que parece memória em chatbots é o app reenviando todo o histórico a cada mensagem (consumindo mais tokens/custo).
        </Callout>
      </Section>

      <Section title="Temperature e top-p: controlando a aleatoriedade" accent={ACCENT}>
        <p>
          Quando o modelo calcula a distribuição de probabilidade do próximo token, <strong>temperature</strong> e <strong>top-p</strong>
          controlam <em>qual</em> token é escolhido dessa distribuição:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Parâmetro', 'Valor baixo', 'Valor alto', 'Quando usar']}
          rows={[
            ['Temperature', '0 = greedy (sempre o mais provável) → determinístico', '1.0+ = mais aleatoriedade → diversidade/criatividade', 'Factuais/código: 0-0.2 · Criativo: 0.7-1.0'],
            ['Top-p (nucleus)', '0.1 = só os tokens mais prováveis que somam 10%', '0.95 = quase toda a distribuição entra', 'Geralmente 0.9-0.95 · combina com temperature'],
          ]}
        />
        <ComparisonFlow
          title="Temperature 0 vs 0.7 na prática — prompt: &quot;O sol é uma...&quot;"
          accent={ACCENT}
          left={{
            label: 'TEMPERATURE = 0 (greedy)',
            steps: ['"estrela" 100% das vezes', 'Sempre o token mais provável', 'Previsível · factual · determinístico', 'Ideal para: JSON, código, classificação'],
          }}
          right={{
            label: 'TEMPERATURE = 0.7',
            steps: ['"estrela" 65% · "bola" 15%', '"fonte" 10% · "esfera" 8%', 'Escolha aleatória ponderada', 'Ideal para: criatividade · brainstorming'],
          }}
        />
      </Section>

      <Section title="Custos reais de API" accent={ACCENT}>
        <p>
          Usar um LLM via API custa por token — separado em <strong>input</strong> (seu prompt) e <strong>output</strong> (resposta gerada).
          Output é mais caro porque é gerado sequencialmente (1 forward pass por token).
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo (abril 2026)', 'Input (por 1M tokens)', 'Output (por 1M tokens)', 'Nota']}
          rows={[
            ['GPT-4o', '$2.50', '$10.00', 'Bom equilíbrio custo/qualidade'],
            ['Claude 3.5 Sonnet', '$3.00', '$15.00', 'Forte em código e raciocínio longo'],
            ['Claude Opus 4', '$15.00', '$75.00', 'Frontier — raciocínio profundo'],
            ['GPT-4o mini', '$0.15', '$0.60', 'Classificação, roteamento, tarefas simples'],
            ['Llama 3.1 405B (self-hosted)', '~$1.50', '~$3.00', 'Custo de GPU, sem markup de API'],
          ]}
        />
        <p>
          <strong>Conta rápida:</strong> um chatbot que processa 100 mensagens/dia com média de 2.000 tokens por chamada (input+output)
          usando Claude 3.5 Sonnet: ~200k tokens/dia → ~6M tokens/mês → ~$18 input + ~$90 output = <strong>~$108/mês</strong>.
        </p>
      </Section>

      <Section title="Scaling Laws: tamanho importa — mas quanto?" accent={ACCENT}>
        <p>
          Uma das descobertas mais importantes da pesquisa de LLMs foi que o desempenho segue
          <strong> leis de escala (scaling laws)</strong> previsíveis: à medida que você aumenta parâmetros,
          dados de treino e compute, o desempenho melhora de forma logarítmica e previsível.
          O paper Chinchilla (DeepMind, 2022) mudou como os modelos são treinados.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Lei', 'O que diz', 'Consequência prática']}
          rows={[
            ['Kaplan et al. (2020)', 'Loss ∝ N^(-α) — dobrar params reduz loss em fator fixo', 'GPT-3 foi treinado com 300B tokens em 175B params (sub-ótimo)'],
            ['Chinchilla (2022)', 'Para compute fixo, N e D devem crescer proporcionalmente: N ≈ D', 'LLaMA 3 70B treinou em 15T tokens (4× mais dados que OpenAI)'],
            ['Emergência', 'Capacidades surgem abruptamente acima de thresholds de escala', 'Chain-of-thought só emerge acima de ~100B params no pré-treino denso'],
            ['Scaling de inferência', 'Mais compute no decode (sampling, refinamento) melhora qualidade', 'o1, DeepSeek-R1: "thinking" durante geração — nova fronteira'],
          ]}
        />
        <Callout tone="info">
          A lição do Chinchilla: <strong>dados de qualidade importam tanto quanto params</strong>.
          Meta treinou LLaMA 3 70B em 15T tokens (muito mais que o "compute-optimal" para esse tamanho)
          para criar um modelo que fosse barato de servir com alta qualidade — o resultado é que LLaMA 3 70B
          supera modelos com mais params mas menos dados de treino.
        </Callout>
      </Section>

      <Section title="Open-source vs Closed: a divisão que mudou a IA" accent={ACCENT}>
        <p>
          Em 2023, a Meta abriu os pesos do LLaMA — e mudou a dinâmica da IA para sempre.
          Hoje existe uma divisão clara entre modelos abertos e fechados, com trade-offs reais:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'Modelos Fechados (GPT-4, Claude)', 'Modelos Abertos (LLaMA 3, Mistral, Qwen)']}
          rows={[
            ['Acesso', 'Apenas via API do provedor', 'Download e deploy local ou em qualquer nuvem'],
            ['Custo', 'Por token (variável com uso)', 'Custo de GPU/infraestrutura (fixo)'],
            ['Privacidade', 'Dados vão para servidores do provedor', 'Dados ficam nos seus servidores'],
            ['Customização', 'Fine-tuning limitado via API', 'Fine-tuning total, quantização, modificação da arquitetura'],
            ['Qualidade frontier', 'GPT-4o, Claude Opus 4 ainda à frente', 'LLaMA 3 405B, Qwen 2.5 72B: competitivos em muitas tarefas'],
            ['Compliance', 'Depende dos ToS do provedor', 'Controle total — essencial para saúde, financeiro, governo'],
          ]}
        />
        <DecisionBox
          scenario="Preciso decidir entre API de LLM fechado ou hospedar modelo open-source"
          winner="Depende do caso de uso"
          winnerColor={ACCENT}
          why="API fechada: custo zero de infra, zero manutenção, qualidade frontier. Open-source: controle total, custo fixo em alto volume, privacidade, possibilidade de fine-tuning profundo."
          alternatives={[
            { name: 'API (Claude/GPT)', note: 'Para protótipos, uso esporádico, qualidade frontier necessária, equipe sem GPU expertise.' },
            { name: 'Open-source self-hosted', note: 'Para alto volume (>1M tokens/dia), regulação de dados (HIPAA, LGPD), fine-tuning vertical.' },
          ]}
        />
      </Section>

      <Section title="Limitações reais (o que o LLM NÃO faz)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Limitação', 'O que acontece', 'Como mitigar']}
          rows={[
            ['Alucinação', 'Gera texto plausível mas factualmente errado com alta confiança', 'RAG (busca em base), citations, verificação humana'],
            ['Cutoff de treino', 'Não sabe eventos após a data de treino', 'Tool calling (busca web), RAG com dados frescos'],
            ['Raciocínio multi-step', 'Erra em cadeias longas de lógica ou matemática', 'Chain-of-thought, decomposição, code execution'],
            ['Contexto perdido', 'Depois da window, informação desaparece', 'Sumarização, RAG, agentic loops com memória'],
            ['Sem estado entre chamadas', 'Cada request é independente — não "lembra"', 'Reenviar contexto, usar database externa'],
          ]}
        />
      </Section>

      <Section title="Alucinação: por que acontece e como mitigar" accent={ACCENT}>
        <p>
          <strong>Alucinação</strong> é o nome técnico para quando o LLM gera texto factualmente errado
          com aparente confiança. Não é um bug — é uma consequência direta de como LLMs são treinados:
          maximizar probabilidade do próximo token, não verificar facticidade.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo de alucinação', 'Exemplo', 'Causa provável', 'Mitigação']}
          rows={[
            ['Factual incorreto', '"A Torre Eiffel tem 450m" (são 330m)', 'Conflito ou ruído no corpus de treino', 'RAG com fonte autoritativa, citations'],
            ['Citação inventada', 'Autor + título de paper que não existe', 'Interpolação de padrões de citação', 'Sempre verificar DOI/URL da citação'],
            ['Código que compila mas não funciona', 'API com assinatura errada, método deprecado', 'Função raramente usada no corpus', 'Testes automatizados, type checking'],
            ['Confabulação de timeline', '"X aconteceu em 2019" (foi em 2021)', 'Datas raramente contextualizadas no corpus', 'Verificação de fatos com dados estruturados'],
            ['Auto-confiança injustificada', 'Responde com certeza em domínio desconhecido', 'Calibração de confiança não é objetivo do treino', 'Prompts que pedem "diga se não sabe"'],
          ]}
        />
        <Callout tone="danger">
          <strong>A armadilha do especialista:</strong> LLMs alucinam mais em domínios especializados (medicina, direito,
          finanças, engenharia específica) do que em conhecimento geral — exatamente onde o erro mais prejudica.
          Nunca use respostas de LLM sem verificação em decisões de alto risco.
        </Callout>
      </Section>

      <Section title="Quantização: rodando grandes modelos em hardware menor" accent={ACCENT}>
        <p>
          Um modelo de 70B parâmetros em FP32 precisa de ~280GB de VRAM — impossível em hardware comum.
          <strong>Quantização</strong> reduz a precisão dos pesos (de float32 para int8, int4 ou int2),
          reduzindo VRAM drasticamente com pequena perda de qualidade.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Precisão', 'Bits por param', 'VRAM para 70B', 'Perda de qualidade', 'Tool']}
          rows={[
            ['FP32', '32 bits', '~280 GB', 'Nenhuma (referência)', 'PyTorch padrão'],
            ['FP16 / BF16', '16 bits', '~140 GB', 'Mínima', 'HuggingFace auto'],
            ['INT8 (Q8)', '8 bits', '~70 GB', '~1–2% em benchmarks', 'bitsandbytes, llama.cpp'],
            ['INT4 (Q4_K_M)', '4 bits', '~35 GB', '~3–5% em benchmarks', 'GGUF/llama.cpp, GPTQ'],
            ['INT2 (Q2_K)', '2 bits', '~17 GB', '>10% — perda notável', 'Apenas para hardware limitado'],
          ]}
        />
        <p>
          Na prática, <strong>Q4_K_M é o sweet spot</strong>: LLaMA 3 70B quantizado em Q4 roda em 2×
          GPUs de 24GB (como 2× RTX 4090) com qualidade próxima ao FP16. Ferramentas como
          <InlineCode>ollama</InlineCode> e <InlineCode>llama.cpp</InlineCode> fazem isso automaticamente.
        </p>
      </Section>

      <Section title="Modelos: quem é quem em 2026" accent={ACCENT}>
        <DecisionBox
          scenario="Preciso de qualidade máxima em raciocínio complexo, código ou análise longa"
          winner="Claude Opus 4 ou GPT-4.5"
          winnerColor={ACCENT}
          why="Modelos frontier com extended thinking/chain-of-thought. Custo alto, mas qualidade imbatível em tarefas complexas."
          alternatives={[{ name: 'Modelos menores', note: 'Sonnet/GPT-4o cobrem 90% dos casos com custo 5-10× menor.' }]}
        />
        <DecisionBox
          scenario="Classificar textos, extrair dados, roteamento — alta velocidade, custo mínimo"
          winner="GPT-4o mini, Claude Haiku ou Gemini Flash"
          winnerColor={ACCENT}
          why="Modelos leves otimizados pra throughput. 10-50× mais baratos que frontier. Perfeitos pra tarefas onde velocidade > qualidade frontier."
          alternatives={[{ name: 'Modelos open-source (Llama, Mistral)', note: 'sem custo de API se auto-hosted, mas precisa de GPU.' }]}
        />
      </Section>

      <Section title="Embeddings: como o modelo representa conhecimento" accent={ACCENT}>
        <p>
          Internamente, um LLM representa cada token como um vetor de alta dimensão (geralmente 4096 a 16384 floats).
          Esse vetor é o <strong>embedding</strong> — uma codificação numérica onde tokens semanticamente similares
          ficam próximos no espaço vetorial. À medida que o texto passa pelas camadas do Transformer, os embeddings
          acumulam <em>contexto</em>: o vetor de "banco" muda dependendo de estar em "banco de dados" vs "banco do parque".
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Camada', 'O que o embedding captura', 'Exemplo']}
          rows={[
            ['Input embedding (camada 0)', 'Identidade do token — puramente sintática', '"run" e "running" são vetores diferentes'],
            ['Camadas iniciais (1–10)', 'Sintaxe, POS tags, co-ocorrências locais', '"banco" começa a diferenciar por contexto próximo'],
            ['Camadas médias (10–40)', 'Entidades, relações semânticas, correferência', '"ele" aponta para o sujeito anterior da frase'],
            ['Camadas finais (40–96)', 'Raciocínio, intenção, resposta esperada', 'Representação otimizada para prever o próximo token'],
          ]}
        />
        <p>
          Os embeddings da última camada são o que o modelo usa para calcular a distribuição de probabilidade do próximo token.
          É por isso que LLMs conseguem "entender" contexto longo — as camadas de atenção integram informação de qualquer posição
          dentro da context window.
        </p>
      </Section>

      <Section title="Inferência: o que acontece quando você faz uma chamada" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          items={[
            { icon: '📝', label: 'Tokenização', sub: 'BPE', detail: 'Texto → sequência de token IDs. "Hello world" → [15496, 995].', connector: 'IDs' },
            { icon: '⚡', label: 'Prefill (input processing)', sub: 'paralelo', detail: 'Todos os tokens do prompt processados em paralelo. Gera o KV Cache.', connector: 'KV cache pronto' },
            { icon: '🔄', label: 'Decode (generation)', sub: 'sequencial', detail: 'Gera 1 token por vez. Cada token requer 1 forward pass usando o KV Cache. Até encontrar token de parada ou atingir max_tokens.', connector: 'tokens' },
            { icon: '📤', label: 'Detokenização', sub: 'IDs → texto', detail: 'Token IDs → texto legível. Pode ser streamed (envia token a token) ou batched.' },
          ]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="LLMs entendem o que dizem?"
          a="Depende da definição de 'entender'. Eles manipulam representações estatísticas de linguagem com precisão suficiente para produzir resultados que parecem compreensão. Se isso constitui entendimento é um debate filosófico. Na prática: trate como uma ferramenta muito capaz que pode estar errada com muita confiança."
        />
        <QAItem
          q="Qual a diferença entre modelo base e modelo instruct?"
          a="O modelo base completa texto — dá 'O céu é' e ele continua 'azul durante o dia...'. O modelo instruct (após SFT + RLHF) segue instruções — dá 'Explique o céu' e ele responde em formato estruturado. A capacidade está no base; a usabilidade está no instruct."
        />
        <QAItem
          q="Fine-tuning é a mesma coisa que RAG?"
          a={<>
            Não. <strong>Fine-tuning</strong> modifica os pesos do modelo (treina mais). <strong>RAG</strong> não muda o modelo — injeta informação no prompt em runtime. Fine-tuning ensina estilo/formato; RAG injeta fatos atualizados.
            Regra: se o conhecimento muda frequentemente → RAG. Se quer mudar comportamento permanente → fine-tuning.
          </>}
        />
        <QAItem
          q="Posso rodar um LLM no meu computador?"
          a="Sim, se tiver GPU suficiente. Llama 3.1 8B roda em GPUs de 8GB (quantizado). 70B precisa de ~40GB de VRAM. 405B precisa de cluster. Tools: llama.cpp, Ollama, vLLM. Qualidade menor que APIs frontier, mas custo zero por token e privacidade total."
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> (1) LLM = preditor de próximo token treinado em trilhões de tokens. (2) Três fases: pré-treino
        ($$$), SFT (instruções), RLHF (alinhamento). (3) Context window = prompt + resposta — o que não cabe, não existe.
        (4) Temperature controla aleatoriedade: 0 = factual, 0.7+ = criativo. (5) Output custa mais que input porque é sequencial.
        (6) LLMs alucinam — sempre verifique fatos críticos. Próximo módulo: tokens e tokenização — o &quot;idioma&quot; real do modelo.
      </Callout>
    </div>
  );
}
