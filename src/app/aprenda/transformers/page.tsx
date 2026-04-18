import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section, Callout, ComparisonTable, DecisionBox,
  FlowDiagram, MatrixDiagram, ArchFlow, QAItem, StackFlow, CodeBlock, Timeline,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('transformers');

const accent = '#58a6ff';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o Transformer calcula Attention(Q,K,V) = softmax(QKᵀ / √dₖ)V dividindo por √dₖ?',
    options: [
      'Para normalizar os vetores Q e K para comprimento unitário',
      'Para evitar que dot products grandes saturem o softmax, produzindo gradientes próximos de zero',
      'Para reduzir o número de parâmetros treináveis da camada de atenção',
      'Para garantir que a soma das atenções seja sempre exatamente 1.0',
    ],
    correct: 1,
    explanation: 'Quando dₖ é grande, os dot products QKᵀ crescem em magnitude. Valores muito grandes no input do softmax produzem distribuições quase one-hot, com gradientes próximos de zero (vanishing gradient). Dividir por √dₖ mantém a variância estável e o treinamento saudável.',
  },
  {
    question: 'Qual a vantagem fundamental de multi-head attention sobre single-head attention com a mesma dimensão total?',
    options: [
      'Multi-head usa menos memória porque cada cabeça é menor',
      'Multi-head permite que o modelo aprenda múltiplos tipos de relações em paralelo (sintática, semântica, posicional) em subespaços diferentes',
      'Multi-head converge mais rápido porque tem mais parâmetros',
      'Multi-head elimina a necessidade de positional encoding',
    ],
    correct: 1,
    explanation: 'Cada cabeça opera em um subespaço de dimensão dₖ/h. Uma cabeça pode aprender relações sintáticas (sujeito-verbo), outra semânticas (sinônimos), outra posicionais (tokens próximos). Single-head com a mesma dimensão total teria que comprimir tudo em um único padrão de atenção.',
  },
  {
    question: 'GPT é decoder-only. Qual é a consequência prática da máscara causal no self-attention do decoder?',
    options: [
      'O modelo não consegue processar sequências maiores que o context window',
      'Cada token só pode atender a tokens anteriores e a si mesmo, nunca a tokens futuros — essencial para geração autorregressiva',
      'O modelo é obrigado a gerar tokens da esquerda para a direita, mas pode olhar para frente durante o treinamento',
      'A máscara reduz o custo computacional de O(n²) para O(n log n)',
    ],
    correct: 1,
    explanation: 'A máscara causal seta -∞ nas posições futuras antes do softmax, zerando a atenção a tokens que ainda não foram gerados. Isso simula a geração autorregressiva (token por token) mesmo durante o treinamento paralelo. O custo continua O(n²) — a máscara não muda a complexidade.',
  },
  {
    question: 'O paper original do Transformer (2017) usava arquitetura encoder-decoder. Qual das opções descreve corretamente a diferença entre encoder e decoder?',
    options: [
      'Encoder usa atenção bidirecional (cada token vê todos os outros); decoder usa atenção causal (cada token só vê os anteriores) + cross-attention ao encoder',
      'Encoder processa texto em inglês e decoder traduz para outras línguas — são específicos por idioma',
      'Encoder comprime o texto em um vetor único; decoder descomprime esse vetor de volta em texto',
      'Encoder é treinado com dados rotulados; decoder é treinado com dados não-rotulados',
    ],
    correct: 0,
    explanation: 'O encoder tem self-attention bidirecional — cada token vê toda a sequência. O decoder tem self-attention causal (mascarada) + uma camada extra de cross-attention que atende ao output do encoder. BERT é encoder-only (bidirecional). GPT é decoder-only (causal). T5 é encoder-decoder.',
  },
];

export default function TransformersPage() {
  return (
    <ModuleLayout
      slug="transformers"
      title="Transformers e Mecanismo de Atenção"
      icon="⚙️"
      xp={60}
      readTime={12}
      trailName="Fundamentos da IA"
      trailColor={accent}
      nextSlug="kv-cache"
      nextTitle="KV Cache"
      seoDesc="Como funciona a arquitetura Transformer: self-attention, Q/K/V, positional encoding, multi-head attention, encoder vs decoder."
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Em junho de 2017, oito pesquisadores do Google publicaram &ldquo;Attention is All You Need&rdquo; — um paper de 15 páginas que mudou a IA para sempre. A arquitetura que eles propuseram, o <strong>Transformer</strong>, é a base de GPT, Claude, Gemini, LLaMA e praticamente todo modelo de linguagem moderno. Neste artigo, você vai entender como ele funciona <strong>por dentro</strong>: da fórmula de atenção à máscara causal que torna a geração de texto possível.
      </p>

      <Callout tone="warn">
        Pré-requisito real: você precisa entender <strong>redes neurais</strong> (forward pass, loss, backpropagation) e saber o que são <strong>tokens</strong>. Se não leu esses artigos, leia antes — sem isso, o Transformer vira decoreba.
      </Callout>

      <Section title="O problema que o Transformer resolveu" accent={accent}>
        <p>
          Antes de 2017, modelos de linguagem usavam <strong>RNNs</strong> (Recurrent Neural Networks) e <strong>LSTMs</strong> (Long Short-Term Memory). Essas arquiteturas processavam texto <em>token por token, em sequência</em>. Dois problemas fatais:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Problema', 'RNN/LSTM', 'Transformer']}
          rows={[
            ['Paralelização', 'Impossível — token N depende do output de N-1', 'Total — todos os tokens processados de uma vez'],
            ['Dependências longas', 'Gradiente desaparece após ~100 tokens', 'Atenção alcança qualquer posição na sequência'],
            ['Velocidade de treino', 'Lento — operações sequenciais', 'Rápido — GPUs adoram operações matriciais paralelas'],
            ['Escalabilidade', 'Modelo com 1B params já era impraticável', 'GPT-4: ~1.7T params (estimado)'],
          ]}
        />
        <p>
          O Transformer resolveu tudo de uma vez: substituiu a recorrência por um mecanismo de <strong>atenção pura</strong> que processa toda a sequência em paralelo. Resultado: modelos 10-100× maiores treinados em fração do tempo.
        </p>
      </Section>

      <Section title="Self-Attention: a ideia central" accent={accent}>
        <p>
          A pergunta que self-attention responde é simples: <em>&ldquo;para entender este token, quais outros tokens da sequência são relevantes?&rdquo;</em>
        </p>
        <p>
          Para cada token, o modelo cria três vetores multiplicando o embedding por três matrizes de pesos aprendidas:
        </p>
        <FlowDiagram
          title='Q, K, V — os três vetores do token "sentou"'
          accent={accent}
          steps={[
            { icon: '📥', label: 'Embedding', desc: 'vetor de dimensão d' },
            { icon: '✖️', label: '× Wq / Wk / Wv', desc: 'matrizes de pesos aprendidas' },
            { icon: '🔍', label: 'Q — Query', desc: '"o que eu procuro"' },
            { icon: '🔑', label: 'K — Key', desc: '"o que eu ofereço"' },
            { icon: '📖', label: 'V — Value', desc: '"meu conteúdo"' },
          ]}
        />
        <p className="text-xs mt-2" style={{ color: 'var(--ffv-muted)' }}>
          <strong>Analogia da biblioteca:</strong> Query = sua pergunta; Key = título de cada livro; Value = conteúdo do livro. Atenção = match(Query, Key) → pega Value.
        </p>
        <p>
          Cada token gera seus próprios Q, K e V. A mágica acontece quando comparamos o Query de um token com as Keys de <strong>todos os outros tokens</strong>.
        </p>
      </Section>

      <Section title="A fórmula: Attention(Q, K, V)" accent={accent}>
        <p>
          A fórmula completa de scaled dot-product attention é:
        </p>
        <p className="text-sm font-mono p-4 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${accent}30`, color: 'var(--foreground)' }}>
          <strong>Attention(Q, K, V)</strong> = softmax( Q · Kᵀ / √dₖ ) · V
        </p>
        <p className="text-xs mt-1 mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Passo a passo para <em>&ldquo;sentou&rdquo;</em> na frase <em>&ldquo;O gato sentou no tapete&rdquo;</em>:
        </p>
        <MatrixDiagram
          title="Atenção de 'sentou' para cada token (após softmax)"
          accent={accent}
          rowLabels={['sentou']}
          colLabels={['O', 'gato', 'sentou', 'no', 'tapete']}
          data={[[0.06, 0.31, 0.33, 0.07, 0.23]]}
          highlightThreshold={0.25}
        />
        <FlowDiagram
          title="Pipeline completo do Attention"
          accent={accent}
          steps={[
            { icon: '🔢', label: '1. SCORE', desc: 'Q("sentou") · Kᵀ(todos)' },
            { icon: '📏', label: '2. SCALE', desc: '÷ √dₖ para estabilidade' },
            { icon: '🎯', label: '3. SOFTMAX', desc: 'converte em probs (soma=1)' },
            { icon: '➕', label: '4. COMBINE', desc: 'soma V × peso de atenção' },
          ]}
        />

        <Callout tone="info">
          <strong>Por que dividir por √dₖ?</strong> Quando a dimensão dₖ é grande (ex: 128), os dot products Q·K crescem em magnitude. Valores muito grandes no input do softmax produzem distribuições quase one-hot: quase toda atenção vai para um único token, e os gradientes ficam próximos de zero. Dividir por √dₖ mantém a variância estável — é a diferença entre treinar e não treinar.
        </Callout>
      </Section>

      <Section title="Forma matricial: processando tudo de uma vez" accent={accent}>
        <p>
          Na prática, Q, K e V não são vetores individuais — são <strong>matrizes</strong> onde cada linha é o vetor de um token. Para uma sequência de n tokens com dimensão dₖ:
        </p>
        <FlowDiagram
          title="Dimensões das matrizes (n=5 tokens, d=512, dₖ=64)"
          accent={accent}
          steps={[
            { icon: '📊', label: 'Embeddings X', desc: 'ℝ⁵ˣ⁵¹²' },
            { icon: '✖️', label: '× Wq/Wk/Wv', desc: '(512→64)' },
            { icon: '📐', label: 'Q, K, V', desc: 'ℝ⁵ˣ⁶⁴ cada' },
            { icon: '🔢', label: 'Q·Kᵀ Scores', desc: 'ℝ⁵ˣ⁵ — custo O(n²)' },
            { icon: '📤', label: 'Output', desc: 'ℝ⁵ˣ⁶⁴' },
          ]}
        />
        <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
          Custo: O(n²·dₖ) — quadrático no comprimento da sequência. Para n=8192, ~67 milhões de scores por camada.
        </p>
        <Callout tone="warn">
          O custo O(n²) é o grande gargalo dos Transformers. Context windows de 128k tokens significam n²=16 bilhões de scores por camada. Por isso existem otimizações como <strong>KV Cache</strong> (próximo artigo), <strong>Flash Attention</strong>, e <strong>sparse attention</strong>.
        </Callout>
      </Section>

      <Section title="Multi-Head Attention: olhar de múltiplos ângulos" accent={accent}>
        <p>
          Uma única cabeça de atenção aprende <strong>um tipo de relação</strong>. Mas linguagem tem muitas dimensões: sintaxe, semântica, correferência, posição relativa. A solução: <strong>múltiplas cabeças em paralelo</strong>, cada uma operando em um subespaço diferente.
        </p>
        <ArchFlow
          title="Multi-Head Attention — d=512, h=8 cabeças, dₖ=64"
          accent={accent}
          columns={[
            {
              header: 'INPUT (512)',
              headerColor: accent,
              items: ['Embedding de cada token', 'Dimensão d = 512'],
            },
            {
              header: 'H CABEÇAS EM PARALELO',
              headerColor: 'var(--ffv-purple)',
              items: ['Head 1: Wq₁,Wk₁,Wv₁ → Attn', 'Head 2: Wq₂,Wk₂,Wv₂ → Attn', '...', 'Head 8: Wq₈,Wk₈,Wv₈ → Attn'],
              footer: 'Cada head: 512→64 dims',
            },
            {
              header: 'OUTPUT (512)',
              headerColor: 'var(--ffv-green)',
              items: ['Concat [out₁|...|out₈]', '× Wo (512×512)', 'Output final d=512'],
              useCases: ['Head 1: sujeito→verbo', 'Head 3: pronome→referência', 'Head 5: adj→substantivo', 'Head 7: posição relativa'],
            },
          ]}
        />
        <p>
          O custo computacional é o <strong>mesmo</strong> que single-head: h cabeças de dimensão d/h = uma multiplicação matricial de dimensão d. Mas o modelo ganha capacidade expressiva massivamente superior.
        </p>
      </Section>

      <Section title="Positional Encoding: ensinando ordem ao Transformer" accent={accent}>
        <p>
          Self-attention é <strong>invariante à ordem</strong>: &ldquo;gato mordeu cachorro&rdquo; e &ldquo;cachorro mordeu gato&rdquo; produzem os mesmos scores de atenção (os mesmos tokens, os mesmos dot products). Isso é um problema sério — ordem muda significado.
        </p>
        <p>
          A solução: somar ao embedding de cada token um vetor que codifica sua <strong>posição na sequência</strong>. O paper original usou funções seno/cosseno com frequências diferentes:
        </p>
        <MatrixDiagram
          title="Positional Encoding — valores PE para os primeiros 4 tokens (d=8)"
          accent={accent}
          rowLabels={['pos 0', 'pos 1', 'pos 2', 'pos 3']}
          colLabels={['dim0', 'dim1', 'dim2', 'dim3', 'dim4', 'dim5', 'dim6', 'dim7']}
          data={[
            [0.00, 1.00, 0.00, 1.00, 0.00, 1.00, 0.00, 1.00],
            [0.84, 0.54, 0.10, 0.99, 0.01, 1.00, 0.00, 1.00],
            [0.91, -0.42, 0.20, 0.98, 0.02, 1.00, 0.00, 1.00],
            [0.14, -0.99, 0.30, 0.96, 0.03, 1.00, 0.00, 1.00],
          ]}
          highlightThreshold={0.8}
        />
        <p className="text-xs mt-2" style={{ color: 'var(--ffv-muted)' }}>
          Frequências altas (dim0–1) mudam rápido entre posições; frequências baixas (dim6–7) mudam devagar — o modelo aprende a ler posição a partir do padrão combinado. <strong>Embedding final = token_embedding + positional_encoding</strong>.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Tipo de PE', 'Como funciona', 'Usado em']}
          rows={[
            ['Sinusoidal (fixa)', 'Funções sin/cos com frequências diferentes; não treinável', 'Transformer original (2017)'],
            ['Learned (aprendida)', 'Vetor treinável por posição; mais flexível', 'GPT-2, BERT'],
            ['RoPE (Rotary)', 'Rotação no espaço complexo; extrapola para sequências maiores', 'LLaMA, GPT-NeoX, Claude'],
            ['ALiBi', 'Bias linear na atenção proporcional à distância; sem PE no embedding', 'BLOOM, MPT'],
          ]}
        />
        <p>
          Modelos modernos preferem RoPE porque ela permite <strong>extrapolar</strong> para sequências mais longas do que as vistas no treino — essencial para context windows de 100k+ tokens.
        </p>
      </Section>

      <Section title="Bloco Transformer completo" accent={accent}>
        <p>
          Cada bloco Transformer (também chamado de &ldquo;layer&rdquo;) combina atenção com uma rede feed-forward e usa duas técnicas cruciais: <strong>conexões residuais</strong> e <strong>layer normalization</strong>.
        </p>
        <StackFlow
          title="Um bloco Transformer (repetido N vezes)"
          accent={accent}
          items={[
            {
              icon: '📥',
              label: 'Input',
              sub: 'n × d',
              detail: 'Embeddings dos tokens + positional encoding (ou output do bloco anterior)',
            },
            {
              icon: '👁️',
              label: 'Multi-Head Self-Attention',
              sub: 'MHA',
              detail: 'Cada token atende a todos os outros (ou só anteriores, se decoder). Produz representação contextualizada.',
              connector: 'ADD & NORM',
            },
            {
              icon: '➕',
              label: 'Residual + LayerNorm',
              sub: 'estabilidade',
              detail: 'output = LayerNorm(input + MHA(input)). A conexão residual permite gradientes fluírem direto; LayerNorm estabiliza escala.',
              connector: 'FFN',
            },
            {
              icon: '🧠',
              label: 'Feed-Forward Network (FFN)',
              sub: 'MLP',
              detail: 'Duas camadas lineares com ativação (GELU): FFN(x) = GELU(xW₁ + b₁)W₂ + b₂. Dimensão interna tipicamente 4× a do modelo (ex: 512→2048→512).',
              connector: 'ADD & NORM',
            },
            {
              icon: '➕',
              label: 'Residual + LayerNorm',
              sub: 'estabilidade',
              detail: 'output = LayerNorm(x + FFN(x)). Mesmo padrão: residual + normalização.',
            },
            {
              icon: '📤',
              label: 'Output',
              sub: 'n × d',
              detail: 'Representação refinada de cada token. Vai para o próximo bloco (ou para a camada de predição no último bloco).',
            },
          ]}
        />
        <Callout tone="info">
          <strong>Pre-LN vs Post-LN:</strong> o paper original coloca LayerNorm <em>depois</em> da soma residual (Post-LN). Modelos modernos (GPT-3+, LLaMA, Claude) usam Pre-LN: LayerNorm <em>antes</em> da atenção/FFN. Pre-LN treina de forma mais estável com learning rates maiores.
        </Callout>
      </Section>

      <Section title="Encoder vs Decoder: as três arquiteturas" accent={accent}>
        <p>
          O paper original propôs encoder + decoder juntos (para tradução). Mas a comunidade descobriu que cada metade funciona sozinha para tarefas diferentes.
        </p>
        <ArchFlow
          title="Três variantes de Transformer"
          accent={accent}
          columns={[
            {
              header: 'ENCODER-ONLY',
              headerColor: accent,
              items: ['Self-Attention BIDIRECIONAL', 'Cada token vê todos os outros', 'Representações contextuais ricas'],
              footer: 'BERT · RoBERTa · DeBERTa',
              useCases: ['Classificação', 'NER', 'Embeddings'],
            },
            {
              header: 'DECODER-ONLY',
              headerColor: 'var(--ffv-purple)',
              items: ['Masked Self-Attention', 'CAUSAL (←) — só vê anteriores', 'Gera token por token'],
              footer: 'GPT · Claude · LLaMA · Gemini',
              useCases: ['Geração de texto', 'Chat', 'Código'],
            },
            {
              header: 'ENCODER-DECODER',
              headerColor: 'var(--ffv-green)',
              items: ['Encoder: bidirecional', 'Decoder: causal + cross-attention', 'Cross-attn lê output do encoder'],
              footer: 'T5 · BART · Whisper · Flan-T5',
              useCases: ['Tradução', 'Sumarização', 'Speech-to-text'],
            },
          ]}
        />
      </Section>

      <Section title="Máscara causal: como o decoder gera texto" accent={accent}>
        <p>
          O decoder precisa gerar tokens <strong>um de cada vez</strong>, da esquerda para a direita. Mas self-attention, por padrão, permite que cada token veja a sequência inteira — incluindo tokens futuros. Isso seria &ldquo;trapacear&rdquo;.
        </p>
        <p>
          A solução é a <strong>máscara causal</strong>: antes do softmax, setamos -∞ em todas as posições futuras. Após o softmax, elas viram 0 — atenção zero.
        </p>
        <MatrixDiagram
          title='Atenção após máscara causal — frase "O gato sentou"'
          accent={accent}
          rowLabels={['O', 'gato', 'sentou']}
          colLabels={['O', 'gato', 'sentou']}
          data={[
            [1.00, 0.00, 0.00],
            [0.29, 0.71, 0.00],
            [0.05, 0.60, 0.35],
          ]}
          highlightThreshold={0.4}
        />
        <p className="text-xs mt-2" style={{ color: 'var(--ffv-muted)' }}>
          Posições bloqueadas (futuro) recebem score -∞ antes do softmax → atenção 0 após softmax. &ldquo;O&rdquo; só vê a si mesmo; &ldquo;sentou&rdquo; vê os três tokens.
        </p>
        <p>
          Durante o <strong>treinamento</strong>, a máscara permite processar toda a sequência em paralelo (teacher forcing). Durante a <strong>inferência</strong>, o modelo gera token por token, e a máscara garante que cada novo token é condicionado apenas nos anteriores.
        </p>
      </Section>

      <Section title="Cross-Attention: encoder fala com decoder" accent={accent}>
        <p>
          No Transformer original (encoder-decoder), o decoder tem uma camada extra entre self-attention e FFN: <strong>cross-attention</strong>. Nela, o Query vem do decoder mas Key e Value vêm do <strong>output do encoder</strong>.
        </p>
        <ArchFlow
          title="Cross-Attention — como encoder e decoder se comunicam"
          accent={accent}
          columns={[
            {
              header: 'ENCODER',
              headerColor: accent,
              items: ['"The cat sat"', '→ [e₁, e₂, e₃]', 'Representações bidirecionais'],
              footer: 'Fornece K e V',
            },
            {
              header: 'CROSS-ATTENTION',
              headerColor: 'var(--ffv-orange)',
              items: ['Q vem do decoder (d₁, d₂)', 'K e V vêm do encoder (e₁-e₃)', '"gato" atende a "cat" → alta attn', '"gato" atende a "The" → baixa attn'],
            },
            {
              header: 'DECODER',
              headerColor: 'var(--ffv-purple)',
              items: ['"O gato" → self-attn', '→ [d₁, d₂]', 'Consulta encoder para gerar'],
              footer: 'Fornece Q',
            },
          ]}
        />
        <p>
          Modelos decoder-only como GPT e Claude <strong>não precisam</strong> de cross-attention porque não têm encoder. Toda a informação (input + output) vive na mesma sequência — o prompt é o &ldquo;encoder&rdquo;.
        </p>
      </Section>

      <Section title="Por que GPT é decoder-only?" accent={accent}>
        <p>
          Uma das decisões mais impactantes da história recente da IA: por que não usar encoder?
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Fator', 'Encoder-Decoder', 'Decoder-Only']}
          rows={[
            ['Complexidade', '2 stacks separados, cross-attention', '1 stack, mais simples de escalar'],
            ['Escala', 'Parâmetros divididos entre encoder e decoder', 'Todos os parâmetros focados em uma direção'],
            ['Treinamento', 'Precisa de pares (input, output)', 'Treina em texto contínuo — dados infinitos na web'],
            ['Versatilidade', 'Especializado em seq2seq (tradução, resumo)', 'Qualquer tarefa formulada como "completar texto"'],
            ['Few-shot/ICL', 'Difícil — encoder e decoder têm papéis fixos', 'Natural — exemplos vão no prompt como contexto'],
            ['Emergência', 'Escala até ~10B params com retornos decrescentes', 'Capacidades emergentes em escala (>100B params)'],
          ]}
        />
        <DecisionBox
          scenario="Qual arquitetura para um LLM de uso geral?"
          winner="Decoder-only"
          winnerColor={accent}
          why="Simplicidade de escalar + treino em texto da web sem supervisão + versatilidade de prompt = dominância total desde GPT-3 (2020). O mercado validou: GPT, Claude, LLaMA, Gemini — todos decoder-only."
          alternatives={[
            { name: 'Encoder-only (BERT)', note: 'Ainda usado para embeddings, classificação e busca semântica onde bidirecionalidade importa.' },
            { name: 'Encoder-decoder (T5)', note: 'Usado em tradução, speech-to-text (Whisper) e tarefas com input/output claramente separados.' },
          ]}
        />
      </Section>

      <Section title="Escala: dos 65M aos 1.7T parâmetros" accent={accent}>
        <Timeline
          title="Evolução dos Transformers"
          accent={accent}
          events={[
            { when: '2017', label: 'Transformer original', detail: '65M params, 6 blocos encoder + 6 decoder. Tradução inglês→alemão.' },
            { when: '2018', label: 'GPT-1 + BERT', detail: 'GPT-1: 117M (decoder). BERT: 340M (encoder). Proof que pré-treino funciona.' },
            { when: '2019', label: 'GPT-2', detail: '1.5B params. "Too dangerous to release." Geração coerente de texto longo.', highlight: true },
            { when: '2020', label: 'GPT-3', detail: '175B params. Few-shot learning emerge — o modelo faz tarefas sem fine-tune.', highlight: true },
            { when: '2022', label: 'ChatGPT (GPT-3.5)', detail: 'RLHF transforma GPT em assistente. 100M usuários em 2 meses.' },
            { when: '2023', label: 'GPT-4 / Claude 2 / LLaMA', detail: 'GPT-4: ~1.7T params (MoE). Claude: segurança. LLaMA: open weights.' },
            { when: '2024', label: 'Claude 3.5 / GPT-4o / LLaMA 3', detail: 'Context windows de 128k-200k. Multimodal. Tool use nativo.' },
            { when: '2025', label: 'Claude 4 / GPT-4.5 / DeepSeek v3', detail: 'Reasoning, code agents, context >1M tokens. MoE generalizado.' },
          ]}
        />
        <p>
          O padrão é claro: a <strong>mesma arquitetura</strong> (Transformer decoder-only) escala de 117M a 1.7T parâmetros com capacidades emergentes previsíveis. A inovação não está mais na arquitetura — está nos <strong>dados</strong>, no <strong>treinamento</strong> (RLHF, DPO) e na <strong>infraestrutura</strong> (MoE, Flash Attention, KV Cache).
        </p>
      </Section>

      <Section title="Código real: self-attention em PyTorch" accent={accent}>
        <CodeBlock lang="python">
{`import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    """Attention(Q, K, V) = softmax(QKᵀ / √dₖ) V"""
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)

    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))

    weights = F.softmax(scores, dim=-1)
    return torch.matmul(weights, V), weights

# Exemplo: sequência de 5 tokens, dimensão 64
Q = torch.randn(1, 5, 64)  # (batch, seq_len, d_k)
K = torch.randn(1, 5, 64)
V = torch.randn(1, 5, 64)

# Máscara causal: triângulo inferior
mask = torch.tril(torch.ones(5, 5))  # [[1,0,0,0,0],[1,1,0,0,0],...]

output, attn_weights = scaled_dot_product_attention(Q, K, V, mask)
print(f"Output shape: {output.shape}")       # (1, 5, 64)
print(f"Attn weights shape: {attn_weights.shape}")  # (1, 5, 5)
print(f"Attn weights[0,0]: {attn_weights[0,0]}")
# → tensor([1.0, 0.0, 0.0, 0.0, 0.0]) ← token 0 só atende a si`}
        </CodeBlock>
      </Section>

      <Section title="Perguntas e respostas" accent={accent}>
        <QAItem
          q="Se atenção é O(n²), como modelos processam 128k tokens?"
          a={<>Várias otimizações: <strong>Flash Attention</strong> (reordena cálculos para minimizar acessos à memória HBM — mesma complexidade, 2-4× mais rápido), <strong>KV Cache</strong> (reutiliza K e V de tokens já processados na inferência), <strong>sparse attention</strong> (cada token atende só a um subconjunto), e <strong>sliding window attention</strong> (Mistral — cada token atende aos N tokens mais próximos + alguns globais).</>}
        />
        <QAItem
          q="O que são as 'camadas' de um Transformer? Quando alguém diz 'GPT-3 tem 96 layers', o que significa?"
          a={<>Cada &ldquo;layer&rdquo; é um bloco Transformer completo: MHA + residual + FFN + residual. GPT-3 tem 96 desses blocos empilhados. O token passa por todos sequencialmente. As primeiras camadas capturam padrões locais e sintáticos; as últimas, semânticos e abstratos.</>}
        />
        <QAItem
          q="Feed-forward tem 4× a dimensão do modelo. Por quê?"
          a={<>O FFN é onde o modelo &ldquo;pensa&rdquo; — transforma as representações da atenção. A expansão 4× (512→2048→512) cria um &ldquo;espaço de trabalho&rdquo; mais rico para combinações não-lineares. Pesquisas recentes (SwiGLU, usado em LLaMA) usam 8/3× em vez de 4× com ativação gated, com resultados superiores.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>O que você aprendeu:</strong> como self-attention funciona com Q/K/V, por que dividir por √dₖ, como multi-head atenção aprende relações diferentes em paralelo, o papel do positional encoding, a diferença entre encoder e decoder, como a máscara causal torna geração de texto possível, e por que decoder-only dominou. Você agora entende a <strong>arquitetura que roda o mundo da IA</strong>. Próximo passo: como fazer essa arquitetura funcionar de forma eficiente com <strong>KV Cache</strong>.
      </Callout>
    </div>
  );
}
