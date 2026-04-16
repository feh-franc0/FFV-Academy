import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'Transformers e Mecanismo de Atenção — FFV Academy',
  description: 'Como funciona o Transformer e mecanismo de atenção. A arquitetura por trás de GPT, Claude e BERT.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'O que o mecanismo de atenção permite que o modelo faça?',
    options: [
      'Processar tokens mais rápido',
      'Focar em partes relevantes da sequência ao processar cada token',
      'Reduzir o número de parâmetros',
      'Treinar sem dados de rotulagem',
    ],
    correct: 1,
    explanation: 'Atenção permite que cada token "olhe" para todos os outros tokens e decida quais são mais relevantes para entender seu significado no contexto atual.',
  },
  {
    question: 'Em "Attention is All You Need" (2017), qual foi a grande inovação?',
    options: [
      'Criação das redes neurais',
      'Substituição de RNNs por mecanismo de atenção puro, permitindo paralelização',
      'Desenvolvimento de GPUs para IA',
      'Criação do backpropagation',
    ],
    correct: 1,
    explanation: 'O paper introduziu a arquitetura Transformer, que eliminou RNNs/LSTMs que processavam tokens sequencialmente. Com atenção pura, todo o contexto é processado em paralelo — muito mais rápido de treinar.',
  },
  {
    question: 'O que é "positional encoding"?',
    options: [
      'Encode o valor numérico de cada token',
      'Informação que indica a posição de cada token na sequência, pois atenção não tem ordem implícita',
      'A posição do modelo na GPU',
      'Um tipo de normalização de camada',
    ],
    correct: 1,
    explanation: 'Atenção trata todos os tokens de forma intercambiável — ela não sabe qual veio primeiro. Positional encoding adiciona informação de posição para que o modelo saiba a ordem dos tokens.',
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
      trailColor="#58a6ff"
      nextSlug="kv-cache"
      nextTitle="KV Cache"
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
        Em 2017, um paper chamado "Attention is All You Need" mudou a IA para sempre. A arquitetura Transformer que ele introduziu é a base de praticamente todo modelo de linguagem moderno.
      </p>

      <Section title="O problema que o Transformer resolveu">
        <p>
          Antes dos Transformers, modelos de linguagem usavam <strong>RNNs</strong> e <strong>LSTMs</strong> — arquiteturas que processavam texto token por token, em sequência. O problema: tokens distantes na sequência eram difíceis de relacionar, e o processamento não podia ser paralelizado.
        </p>
        <div className="p-3 rounded-lg text-xs" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <p style={{ color: 'var(--ffv-red)' }}>❌ RNN: processa token 1 → token 2 → ... → token N (sequencial, lento)</p>
          <p className="mt-1" style={{ color: 'var(--ffv-green)' }}>✅ Transformer: processa todos os tokens em paralelo (rápido!)</p>
        </div>
      </Section>

      <Section title="Mecanismo de atenção">
        <p>
          A atenção responde a pergunta: <em>quais outros tokens são relevantes para entender este token?</em>
        </p>
        <p>
          Para cada token, o modelo cria três vetores: <strong>Query (Q)</strong>, <strong>Key (K)</strong> e <strong>Value (V)</strong>:
        </p>
        <div className="p-4 rounded-lg font-mono text-xs" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--ffv-green)' }}>
          <p style={{ color: 'var(--ffv-muted)' }}>// Para a frase: "O gato sentou no tapete"</p>
          <p style={{ color: 'var(--ffv-muted)' }}>// Processando o token "sentou":</p>
          <p className="mt-1">Q("sentou") · K("gato")   → alta atenção ✓</p>
          <p>Q("sentou") · K("tapete") → alta atenção ✓</p>
          <p>Q("sentou") · K("O")      → baixa atenção ✗</p>
        </div>
        <p>
          Os scores de atenção são normalizados (softmax) e usados para combinar os Values — o resultado é uma representação de "sentou" que inclui informação de "gato" e "tapete".
        </p>
      </Section>

      <Section title="Multi-head attention">
        <p>
          Em vez de um único mecanismo de atenção, Transformers usam <strong>múltiplas "cabeças" de atenção em paralelo</strong>. Cada cabeça aprende a focar em aspectos diferentes:
        </p>
        <div className="flex flex-col gap-2">
          {[
            { head: 'Head 1', focus: 'relações sintáticas (sujeito-verbo)', color: '#58a6ff' },
            { head: 'Head 2', focus: 'correferências (ele → o gato)', color: '#d2a8ff' },
            { head: 'Head 3', focus: 'posição relativa dos tokens', color: '#3fb950' },
          ].map(h => (
            <div key={h.head} className="flex gap-2 items-center p-2 rounded text-xs" style={{ background: 'var(--ffv-bg2)' }}>
              <span className="font-semibold px-2 py-0.5 rounded" style={{ background: `${h.color}20`, color: h.color }}>{h.head}</span>
              <span style={{ color: 'var(--ffv-muted)' }}>aprende {h.focus}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Arquitetura completa">
        <p>Um bloco Transformer (repetido N vezes) contém:</p>
        <div className="flex flex-col gap-1.5 text-xs">
          {[
            '1. Multi-head self-attention',
            '2. Add & Norm (conexão residual + layer norm)',
            '3. Feed-forward network (MLP)',
            '4. Add & Norm',
          ].map((step, i) => (
            <div key={i} className="px-3 py-2 rounded" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              {step}
            </div>
          ))}
        </div>
        <p>
          GPT-4 tem estimados ~120 blocos. Claude 3 tem arquitetura similar. Cada bloco refina a representação dos tokens.
        </p>
      </Section>

      <Callout>
        🎉 Você concluiu a Trilha 1! Agora você entende a base de tudo. A Trilha 2 começa onde isso para: como esses modelos funcionam <strong>em produção</strong> — KV Cache, MoE, Tool Calling e muito mais.
      </Callout>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold mb-3 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full inline-block" style={{ background: '#58a6ff' }} />
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl flex gap-3" style={{ background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.2)' }}>
      <span className="text-xl flex-shrink-0">💡</span>
      <p className="text-sm">{children}</p>
    </div>
  );
}
