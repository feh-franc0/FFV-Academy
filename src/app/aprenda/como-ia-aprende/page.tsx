import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'Como a IA Aprende (Machine Learning) — FFV Academy',
  description: 'Gradiente descendente, loss function e backpropagation explicados de forma simples.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'O que é a "loss function" (função de perda)?',
    options: [
      'Uma função que aumenta a velocidade do modelo',
      'Uma medida de quão errado o modelo está — quanto menor, melhor',
      'O número de parâmetros do modelo',
      'A taxa de aprendizado do otimizador',
    ],
    correct: 1,
    explanation: 'A loss function mede o erro do modelo. Durante o treino, o objetivo é minimizá-la — fazer o modelo errar cada vez menos.',
  },
  {
    question: 'Para que serve o gradiente descendente?',
    options: [
      'Para aumentar a loss function',
      'Para inicializar os pesos aleatoriamente',
      'Para ajustar os pesos na direção que reduz o erro',
      'Para dividir os dados em treino e teste',
    ],
    correct: 2,
    explanation: 'O gradiente indica a direção de maior aumento da loss. Descendo na direção oposta (gradiente descendente), os pesos são ajustados para reduzir o erro gradualmente.',
  },
  {
    question: 'O que é backpropagation?',
    options: [
      'Treinar o modelo de trás para frente',
      'O algoritmo que calcula os gradientes propagando o erro da saída para a entrada',
      'Uma forma de aumentar a taxa de aprendizado',
      'Revertir o treinamento do modelo',
    ],
    correct: 1,
    explanation: 'Backpropagation usa a regra da cadeia do cálculo para propagar o erro da camada de saída até a entrada, calculando o gradiente de cada peso eficientemente.',
  },
];

export default function ComoIaAprendePage() {
  return (
    <ModuleLayout
      slug="como-ia-aprende"
      title="Como a IA Aprende (Machine Learning)"
      icon="📈"
      xp={40}
      readTime={8}
      trailName="Fundamentos da IA"
      trailColor="#58a6ff"
      nextSlug="redes-neurais"
      nextTitle="Redes Neurais"
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
        Você já sabe que ML aprende a partir de dados. Mas como exatamente esse aprendizado acontece? A resposta envolve erros, derivadas e muita repetição.
      </p>

      <Section title="A ideia central: minimizar o erro">
        <p>
          No início do treinamento, o modelo chuta. Literalmente — os pesos (parâmetros) são iniciados de forma aleatória. O modelo vê uma imagem e diz "cachorro" quando era um gato.
        </p>
        <p>
          O aprendizado é o processo de <strong>ajustar esses pesos para errar cada vez menos</strong>.
        </p>
      </Section>

      <Section title="Loss function: medindo o erro">
        <p>
          Precisamos de uma forma de medir quão errado o modelo está. Isso é a <strong>loss function</strong> (função de perda).
        </p>
        <CodeBlock>{`// Exemplo simples: Mean Squared Error
Previsão do modelo: 0.3
Resposta correta:   1.0
Loss = (1.0 - 0.3)² = 0.49

// Quanto maior a loss, mais errado o modelo está.
// Objetivo: minimizar a loss.`}</CodeBlock>
      </Section>

      <Section title="Gradiente Descendente">
        <p>
          Como reduzir a loss? Usando o <strong>gradiente descendente</strong>. O gradiente é a derivada da loss em relação aos pesos — ele aponta a direção onde a loss <em>aumenta mais rápido</em>.
        </p>
        <p>
          Então fazemos o oposto: movemos os pesos na <strong>direção contrária ao gradiente</strong>.
        </p>
        <div className="p-4 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <p className="text-xs font-mono" style={{ color: 'var(--ffv-green)' }}>
            peso_novo = peso_atual - (taxa_de_aprendizado × gradiente)
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--ffv-muted)' }}>
            A taxa de aprendizado (learning rate) controla o tamanho do passo. Muito grande = pula o mínimo. Muito pequena = converge lento demais.
          </p>
        </div>
      </Section>

      <Section title="Backpropagation: calculando os gradientes">
        <p>
          Um modelo de deep learning tem bilhões de parâmetros. Calcular o gradiente de cada um manualmente seria impossível. O <strong>backpropagation</strong> faz isso automaticamente.
        </p>
        <p>
          Ele usa a regra da cadeia do cálculo para propagar o erro da camada de saída até a entrada, calculando o gradiente de cada peso em uma única passagem.
        </p>
        <Callout>
          <strong>Forward pass:</strong> dados entram → modelo faz previsão → loss é calculada.<br />
          <strong>Backward pass:</strong> error propaga de trás pra frente → gradientes calculados → pesos atualizados.
        </Callout>
      </Section>

      <Section title="Épocas e mini-batches">
        <p>
          Uma <strong>época</strong> é uma passagem completa por todo o dataset. Treinamos por várias épocas.
          Para ser eficiente, os dados são divididos em <strong>mini-batches</strong> (ex: 32 ou 128 exemplos por vez).
        </p>
        <p>
          O ciclo completo: forward pass → calcula loss → backprop → atualiza pesos → repete para o próximo batch.
        </p>
      </Section>

      <Callout>
        Agora que você sabe como um modelo aprende, no próximo módulo vamos ver a <strong>estrutura</strong> que torna isso possível: as Redes Neurais.
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

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--ffv-green)', fontFamily: 'var(--font-geist-mono)' }}>
      {children}
    </pre>
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
