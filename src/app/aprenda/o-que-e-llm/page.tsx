import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'O que é um LLM? — FFV Academy',
  description: 'O que é um Large Language Model, como funciona o ChatGPT, Claude e Gemini. Explicação completa.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'O que um LLM faz fundamentalmente?',
    options: [
      'Busca respostas em um banco de dados',
      'Prevê o próximo token mais provável dado o contexto',
      'Copia respostas da internet em tempo real',
      'Executa código para calcular respostas',
    ],
    correct: 1,
    explanation: 'Na essência, um LLM é um preditor de próximos tokens. Ele aprende distribuições de probabilidade sobre sequências de texto e gera texto token por token.',
  },
  {
    question: 'O que significa "pre-training" de um LLM?',
    options: [
      'Treinar o modelo antes de escolher a arquitetura',
      'Treinar em bilhões de tokens de texto para aprender linguagem geral',
      'Configurar os hiperparâmetros iniciais',
      'Baixar pesos pré-treinados de outro modelo',
    ],
    correct: 1,
    explanation: 'Pre-training é a fase onde o modelo é treinado em enormes quantidades de texto (web, livros, código) para aprender padrões de linguagem, fatos e raciocínio geral.',
  },
  {
    question: 'O que é RLHF?',
    options: [
      'Um tipo de arquitetura de rede neural',
      'Reinforcement Learning from Human Feedback — afina o modelo para ser útil e seguro',
      'Uma técnica de compressão de modelos',
      'Um benchmark de avaliação de LLMs',
    ],
    correct: 1,
    explanation: 'RLHF (Reinforcement Learning from Human Feedback) usa preferências humanas para afinar o modelo pós pre-training, tornando-o mais útil, honesto e seguro.',
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
      trailColor="#58a6ff"
      nextSlug="tokens"
      nextTitle="Tokens e Tokenização"
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
        GPT, Claude, Gemini, Llama — todos são LLMs. Mas o que eles fazem de verdade? A resposta é mais simples (e mais surpreendente) do que você imagina.
      </p>

      <Section title="A tarefa fundamental">
        <p>
          Um Large Language Model faz <strong>uma única coisa</strong>: prevê o próximo token mais provável dado uma sequência de tokens.
        </p>
        <div className="p-4 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <p className="text-xs font-mono" style={{ color: 'var(--ffv-muted)' }}>Prompt:</p>
          <p className="text-sm font-mono mt-1">"A capital do Brasil é"</p>
          <p className="text-xs font-mono mt-3" style={{ color: 'var(--ffv-muted)' }}>Distribuição de probabilidade do próximo token:</p>
          <div className="mt-2 flex flex-col gap-1 text-xs font-mono">
            {[['Brasília', '78%', '#58a6ff'], ['São Paulo', '12%', '#8b949e'], ['Rio', '7%', '#8b949e'], ['...', '3%', '#8b949e']].map(([word, pct, color]) => (
              <div key={word} className="flex items-center gap-2">
                <span style={{ color: 'var(--foreground)', minWidth: 80 }}>{word}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--ffv-bg3)' }}>
                  <div className="h-full rounded-full" style={{ width: pct, background: color }} />
                </div>
                <span style={{ color }}>{pct}</span>
              </div>
            ))}
          </div>
        </div>
        <p>
          Do treino em bilhões de textos, o modelo aprendeu que "Brasília" vem depois de "A capital do Brasil é" com alta probabilidade. Isso é tudo — mas o resultado emergente é impressionante.
        </p>
      </Section>

      <Section title="As três fases de um LLM">
        <div className="flex flex-col gap-3">
          {[
            { step: '1', title: 'Pre-training', color: '#58a6ff', desc: 'Treinado em trilhões de tokens da internet, livros e código. Aprende linguagem, fatos e raciocínio geral. Custa dezenas de milhões de dólares.' },
            { step: '2', title: 'Fine-tuning (SFT)', color: '#ffa657', desc: 'Ajustado em dados de alta qualidade (pares pergunta-resposta). Aprende a seguir instruções e ter conversas.' },
            { step: '3', title: 'RLHF', color: '#d2a8ff', desc: 'Humanos avaliam respostas. O modelo é otimizado para maximizar preferências humanas — ser mais útil, honesto e seguro.' },
          ].map(phase => (
            <div key={phase.step} className="flex gap-3 p-4 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${phase.color}30` }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${phase.color}20`, color: phase.color }}>{phase.step}</div>
              <div>
                <strong className="text-sm">{phase.title}</strong>
                <p className="text-xs mt-0.5" style={{ color: 'var(--ffv-muted)' }}>{phase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Por que o ChatGPT foi um divisor de águas?">
        <p>
          LLMs existiam antes do ChatGPT. A diferença foi que a OpenAI embrulhou o GPT-3.5 em uma <strong>interface de chat</strong> e aplicou RLHF pesado para torná-lo conversacional. O resultado mostrou ao mundo que LLMs podiam ser úteis de verdade — não só impressionantes em laboratório.
        </p>
      </Section>

      <Callout>
        Se LLMs operam com tokens, o que são tokens exatamente? No próximo módulo, você vai entender como o texto é dividido — e por que isso importa muito para custo e limites de contexto.
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
