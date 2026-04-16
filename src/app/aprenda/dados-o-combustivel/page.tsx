import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'Dados: o Combustível da IA — FFV Academy',
  description: 'Por que dados são essenciais para a IA funcionar. Como datasets são criados e o que é qualidade de dados.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que dados são chamados de "combustível" da IA?',
    options: [
      'Porque aquecem os servidores',
      'Porque sem dados de treinamento, modelos não aprendem nada',
      'Porque são armazenados em discos rígidos',
      'Porque dados custam muito dinheiro',
    ],
    correct: 1,
    explanation: 'Sem dados de qualidade, qualquer algoritmo de ML produz resultados inúteis. Os dados são o que o modelo "estuda" para aprender padrões.',
  },
  {
    question: 'O que é "overfitting"?',
    options: [
      'Quando o modelo é muito grande para a GPU',
      'Quando o modelo memoriza os dados de treino mas falha em dados novos',
      'Quando os dados de treino são muito grandes',
      'Quando o modelo treina rápido demais',
    ],
    correct: 1,
    explanation: 'Overfitting ocorre quando o modelo "decora" os exemplos de treino em vez de aprender o padrão geral. Ele vai bem no treino mas falha em dados que nunca viu.',
  },
  {
    question: 'Qual a diferença entre dado e label em ML supervisionado?',
    options: [
      'São a mesma coisa',
      'Dado é o arquivo e label é o tamanho',
      'Dado é a entrada (ex: foto) e label é a resposta correta (ex: "gato")',
      'Label é o nome do arquivo de dado',
    ],
    correct: 2,
    explanation: 'Em aprendizado supervisionado, o modelo aprende a partir de pares (dado, label). A foto é o dado, "gato" ou "cachorro" é o label (rótulo correto).',
  },
];

export default function DadosCombustivelPage() {
  return (
    <ModuleLayout
      slug="dados-o-combustivel"
      title="Dados: o Combustível da IA"
      icon="⛽"
      xp={30}
      readTime={7}
      trailName="Fundamentos da IA"
      trailColor="#58a6ff"
      nextSlug="como-ia-aprende"
      nextTitle="Como a IA Aprende"
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
        "Dados são o novo petróleo" — você já ouviu isso. Mas o que isso significa na prática? Por que sem dados bons nenhuma IA funciona?
      </p>

      <Section title="O que são dados de treinamento">
        <p>
          Para um modelo aprender, ele precisa de <strong>exemplos</strong>. Milhares, milhões ou bilhões de exemplos. Cada exemplo é um par: uma <em>entrada</em> e uma <em>saída esperada</em>.
        </p>
        <div className="grid gap-2">
          {[
            { entrada: '📷 Foto de um gato', saida: '"gato"', tipo: 'Classificação de imagem' },
            { entrada: '"Que horas são?" (pt-BR)', saida: '"What time is it?" (en)', tipo: 'Tradução' },
            { entrada: 'Texto + contexto', saida: 'Próxima palavra mais provável', tipo: 'LLM (GPT/Claude)' },
          ].map(ex => (
            <div key={ex.tipo} className="p-3 rounded-lg grid grid-cols-3 gap-2 text-xs" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <span style={{ color: 'var(--ffv-muted)' }}>Entrada: <span style={{ color: 'var(--foreground)' }}>{ex.entrada}</span></span>
              <span style={{ color: 'var(--ffv-muted)' }}>→ Saída: <span style={{ color: 'var(--ffv-green)' }}>{ex.saida}</span></span>
              <span style={{ color: 'var(--ffv-blue)' }}>{ex.tipo}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Qualidade vs. quantidade">
        <p>
          Mais dados nem sempre é melhor. Dados ruins ensinam coisas erradas. O modelo aprende o que <em>está nos dados</em> — incluindo vieses, erros e inconsistências.
        </p>
        <Callout>
          <strong>Exemplo real:</strong> Um modelo de reconhecimento facial treinado predominantemente com rostos brancos vai errar muito mais em rostos negros. O viés estava nos dados de treinamento.
        </Callout>
        <p>Três pilares de qualidade:</p>
        <ul className="flex flex-col gap-1.5 ml-4">
          <li>✅ <strong>Relevância</strong> — os dados representam o problema real</li>
          <li>✅ <strong>Diversidade</strong> — cobre os diferentes casos que existem</li>
          <li>✅ <strong>Limpeza</strong> — sem duplicatas, erros ou ruído excessivo</li>
        </ul>
      </Section>

      <Section title="Train / Validation / Test">
        <p>Um erro clássico: treinar e avaliar o modelo nos <em>mesmos</em> dados. É como dar a prova para o aluno estudar — ele vai se sair bem, mas não aprendeu de verdade.</p>
        <p>A divisão padrão:</p>
        <div className="p-4 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <div className="flex gap-1 h-8 rounded-full overflow-hidden text-xs font-semibold">
            <div className="flex items-center justify-center" style={{ width: '70%', background: 'rgba(88,166,255,0.3)', color: 'var(--ffv-blue)' }}>70% Treino</div>
            <div className="flex items-center justify-center" style={{ width: '15%', background: 'rgba(255,166,87,0.3)', color: 'var(--ffv-orange)' }}>15% Val</div>
            <div className="flex items-center justify-center" style={{ width: '15%', background: 'rgba(63,185,80,0.3)', color: 'var(--ffv-green)' }}>15% Teste</div>
          </div>
          <div className="mt-3 flex flex-col gap-1 text-xs" style={{ color: 'var(--ffv-muted)' }}>
            <span>🔵 <strong style={{ color: 'var(--foreground)' }}>Treino:</strong> o modelo aprende aqui</span>
            <span>🟠 <strong style={{ color: 'var(--foreground)' }}>Validação:</strong> ajusta hiperparâmetros sem contaminação</span>
            <span>🟢 <strong style={{ color: 'var(--foreground)' }}>Teste:</strong> avaliação final — tocado apenas uma vez</span>
          </div>
        </div>
      </Section>

      <Section title="De onde vêm os dados?">
        <ul className="flex flex-col gap-2 ml-4">
          <li>🌐 <strong>Web scraping</strong> — o GPT-4 foi treinado em boa parte da internet pública</li>
          <li>📚 <strong>Datasets públicos</strong> — ImageNet, Wikipedia, Common Crawl</li>
          <li>👥 <strong>Rotulagem humana</strong> — pessoas reais classificando exemplos (RLHF usa isso)</li>
          <li>🔄 <strong>Dados sintéticos</strong> — gerados por outros modelos de IA</li>
        </ul>
      </Section>

      <Callout>
        No próximo módulo, vamos ver o que o modelo faz com esses dados — como ele realmente <strong>aprende</strong>. Spoiler: envolve muito cálculo e um conceito chamado gradiente descendente.
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
