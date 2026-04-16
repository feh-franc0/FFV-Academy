import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'Tool Calling e Agentes — FFV Academy',
  description: 'O que é tool calling em IA, como agentes usam ferramentas, function calling na API do Claude e OpenAI.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'O que é Tool Calling (Function Calling)?',
    options: [
      'O modelo executa código diretamente no servidor',
      'O modelo sinaliza que quer chamar uma função externa, especificando nome e argumentos',
      'Uma API que permite ao modelo navegar na internet',
      'Uma forma de treinar modelos com ferramentas',
    ],
    correct: 1,
    explanation: 'Tool calling não executa código no modelo. O modelo gera uma estrutura indicando qual ferramenta chamar e com quais argumentos. O seu código executa a ferramenta e devolve o resultado ao modelo.',
  },
  {
    question: 'Qual a diferença entre um LLM e um Agente?',
    options: [
      'Agentes são modelos maiores',
      'LLMs apenas geram texto; agentes usam LLMs + tools + memória para executar tarefas multi-step',
      'Agentes funcionam offline',
      'LLMs são mais inteligentes que agentes',
    ],
    correct: 1,
    explanation: 'Um agente usa um LLM como "cérebro" mas combina com ferramentas (busca, código, APIs), memória e um loop de decisão para completar tarefas complexas e de múltiplos passos.',
  },
  {
    question: 'Por que o modelo precisa ser treinado para usar tools?',
    options: [
      'Não precisa — qualquer modelo consegue usar tools',
      'Para aprender o formato correto de sinalizar chamadas de ferramentas e quando usá-las',
      'Para reduzir a latência das chamadas',
      'Para autenticar nas APIs externas',
    ],
    correct: 1,
    explanation: 'O modelo precisa aprender durante o fine-tuning quando e como usar tools — o formato JSON das chamadas, quando tool calling é apropriado vs. resposta direta, e como interpretar os resultados.',
  },
];

export default function ToolCallingPage() {
  return (
    <ModuleLayout
      slug="tool-calling"
      title="Tool Calling e Agentes"
      icon="🔧"
      xp={70}
      readTime={9}
      trailName="IA Além do LLM"
      trailColor="#d2a8ff"
      nextSlug="ia-alem-do-llm"
      nextTitle="Harness: Infraestrutura do Agente"
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
        LLMs são bons em gerar texto. Mas o mundo real precisa de mais do que texto — precisa de ações. É aqui que Tool Calling entra, transformando um modelo de linguagem em um agente.
      </p>

      <Section title="O problema do LLM puro">
        <p>
          Um LLM sozinho tem limitações sérias:
        </p>
        <ul className="flex flex-col gap-1.5 ml-4">
          <li>📅 <strong>Conhecimento desatualizado</strong> — sabe apenas até a data de corte do treino</li>
          <li>🔢 <strong>Matemática imprecisa</strong> — aproxima cálculos em vez de calcular com precisão</li>
          <li>📁 <strong>Sem acesso a dados externos</strong> — não pode ler seu banco de dados</li>
          <li>⚡ <strong>Sem efeitos colaterais</strong> — não pode enviar e-mails ou criar arquivos</li>
        </ul>
      </Section>

      <Section title="Como Tool Calling funciona">
        <p>
          O modelo não executa código diretamente. O fluxo é:
        </p>
        <div className="flex flex-col gap-0">
          {[
            { step: '1', desc: 'Você define as ferramentas disponíveis (nome, parâmetros, descrição)', color: '#58a6ff' },
            { step: '2', desc: 'O modelo recebe sua pergunta + definições das tools', color: '#d2a8ff' },
            { step: '3', desc: 'Modelo decide chamar uma tool e retorna nome + argumentos JSON', color: '#ffa657' },
            { step: '4', desc: 'SEU código executa a tool e retorna o resultado', color: '#3fb950' },
            { step: '5', desc: 'Modelo recebe o resultado e formula a resposta final', color: '#58a6ff' },
          ].map((s, i) => (
            <div key={i} className="flex gap-3 items-start p-3 border-l-2 ml-3" style={{ borderColor: `${s.color}40` }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${s.color}20`, color: s.color }}>{s.step}</div>
              <p className="text-xs" style={{ color: 'var(--foreground)' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <p className="text-xs font-mono mb-2" style={{ color: 'var(--ffv-muted)' }}>// Exemplo: "Qual a previsão do tempo em São Paulo?"</p>
          <p className="text-xs font-mono" style={{ color: 'var(--ffv-purple)' }}>// Modelo retorna:</p>
          <pre className="text-xs font-mono mt-1" style={{ color: 'var(--ffv-green)' }}>{`{
  "tool": "get_weather",
  "arguments": {
    "city": "São Paulo",
    "unit": "celsius"
  }
}`}</pre>
          <p className="text-xs font-mono mt-2" style={{ color: 'var(--ffv-muted)' }}>{'// Seu código executa → retorna {temp: 24, condition: "Parcialmente nublado"}'}</p>
          <p className="text-xs font-mono mt-1" style={{ color: 'var(--ffv-blue)' }}>// Modelo: "Em São Paulo está 24°C com tempo parcialmente nublado."</p>
        </div>
      </Section>

      <Section title="De Tool Calling para Agentes">
        <p>
          Um <strong>agente</strong> é um sistema que usa um LLM em loop — pensa, age, observa o resultado e pensa de novo — até completar uma tarefa complexa.
        </p>
        <div className="flex items-center justify-center gap-3 p-4 rounded-lg flex-wrap" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          {['🧠 Pensar', '→', '🔧 Usar Tool', '→', '👀 Observar', '→', '🔄 Repetir'].map((item, i) => (
            <span key={i} className="text-xs" style={{ color: item === '→' ? 'var(--ffv-border)' : 'var(--foreground)' }}>{item}</span>
          ))}
        </div>
        <p>
          Claude Code, Cursor, Devin — todos são agentes. Eles recebem uma tarefa, usam tools (criar arquivo, rodar código, buscar docs) e iteram até terminar.
        </p>
      </Section>

      <Callout>
        No próximo módulo, vamos ver a arquitetura completa de um agente de programação — os 6 componentes que fazem sistemas como o Claude Code funcionar.
      </Callout>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold mb-3 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full inline-block" style={{ background: '#d2a8ff' }} />
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl flex gap-3" style={{ background: 'rgba(210,168,255,0.08)', border: '1px solid rgba(210,168,255,0.2)' }}>
      <span className="text-xl flex-shrink-0">💡</span>
      <p className="text-sm">{children}</p>
    </div>
  );
}
