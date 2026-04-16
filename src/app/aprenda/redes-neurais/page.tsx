import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'Redes Neurais: o Cérebro Artificial — FFV Academy',
  description: 'O que são redes neurais artificiais, como funcionam neurônios artificiais, camadas e funções de ativação.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'O que é um "neurônio" artificial em uma rede neural?',
    options: [
      'Um processador físico especializado',
      'Uma unidade que recebe entradas, aplica pesos e uma função de ativação',
      'Um arquivo de dados de treinamento',
      'Um tipo de GPU',
    ],
    correct: 1,
    explanation: 'Um neurônio artificial recebe valores de entrada, multiplica por pesos (aprendidos), soma tudo e aplica uma função de ativação para decidir se "dispara" e com qual intensidade.',
  },
  {
    question: 'Para que serve a função de ativação (ex: ReLU)?',
    options: [
      'Para inicializar os pesos',
      'Para normalizar os dados de entrada',
      'Para introduzir não-linearidade, permitindo aprender padrões complexos',
      'Para calcular o gradiente',
    ],
    correct: 2,
    explanation: 'Sem funções de ativação não-lineares, empilhar camadas seria inútil — a rede seria equivalente a uma única transformação linear. ReLU e similares permitem aprender relações complexas.',
  },
  {
    question: 'O que é "deep learning"?',
    options: [
      'Aprender de forma muito lenta e profunda',
      'Machine learning com muitos dados',
      'Redes neurais com muitas camadas ocultas',
      'Um modelo que usa a GPU',
    ],
    correct: 2,
    explanation: 'Deep learning = redes neurais "profundas", ou seja, com muitas camadas ocultas (hidden layers). A profundidade permite aprender representações cada vez mais abstratas dos dados.',
  },
];

export default function RedesNeuraisPage() {
  return (
    <ModuleLayout
      slug="redes-neurais"
      title="Redes Neurais: o Cérebro Artificial"
      icon="🕸️"
      xp={50}
      readTime={10}
      trailName="Fundamentos da IA"
      trailColor="#58a6ff"
      nextSlug="o-que-e-llm"
      nextTitle="O que é um LLM?"
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
        Redes neurais são inspiradas (vagamente) no cérebro humano. Mas não se deixe enganar pela analogia — o que realmente importa é a matemática por trás.
      </p>

      <Section title="O neurônio artificial">
        <p>
          Um neurônio artificial faz três coisas:
        </p>
        <div className="p-4 rounded-lg font-mono text-xs" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--ffv-green)' }}>
          <p>1. Recebe entradas:  x₁, x₂, x₃...</p>
          <p>2. Aplica pesos:     z = w₁x₁ + w₂x₂ + w₃x₃ + bias</p>
          <p>3. Função ativação: saída = ReLU(z) = max(0, z)</p>
        </div>
        <p>Os <strong>pesos</strong> são o que o modelo aprende. O <strong>bias</strong> é um ajuste. A <strong>função de ativação</strong> adiciona não-linearidade.</p>
      </Section>

      <Section title="Arquitetura: camadas">
        <p>Uma rede neural é composta de camadas de neurônios:</p>
        <div className="flex items-center justify-between p-4 rounded-lg gap-4 text-xs text-center" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          {[
            { label: 'Input Layer', desc: 'Dados brutos', color: '#58a6ff' },
            { label: 'Hidden Layers', desc: 'Aprende padrões', color: '#d2a8ff' },
            { label: 'Output Layer', desc: 'Previsão final', color: '#3fb950' },
          ].map((layer, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className="w-full py-2 rounded-lg font-semibold" style={{ background: `${layer.color}20`, color: layer.color }}>{layer.label}</div>
              <span style={{ color: 'var(--ffv-muted)' }}>{layer.desc}</span>
            </div>
          ))}
        </div>
        <p>
          A <strong>profundidade</strong> (número de hidden layers) dá nome ao "deep" em deep learning. Camadas mais próximas da entrada aprendem padrões simples (bordas em imagens). Camadas mais fundo aprendem conceitos abstratos (rostos, objetos).
        </p>
      </Section>

      <Section title="Por que funciona?">
        <p>
          A teoria da aproximação universal diz que uma rede neural com neurônios suficientes pode <em>aproximar qualquer função</em>. Na prática, isso significa que redes neurais podem aprender qualquer mapeamento input → output — desde reconhecer gatos até traduzir idiomas.
        </p>
      </Section>

      <Section title="Parâmetros">
        <p>
          Os <strong>parâmetros</strong> de uma rede são todos os pesos e biases. Um modelo com "7 bilhões de parâmetros" tem 7 bilhões de números que foram ajustados durante o treinamento. GPT-4 tem estimados 1.8 trilhões.
        </p>
        <p>
          Mais parâmetros = mais capacidade de aprender padrões complexos. Mas também = mais dados de treino necessários, mais computação e mais memória.
        </p>
      </Section>

      <Callout>
        No próximo módulo: como as redes neurais foram aplicadas à <strong>linguagem</strong> — e por que isso resultou nos LLMs que conhecemos hoje.
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
