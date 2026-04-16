import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'Tokens e Tokenização — FFV Academy',
  description: 'O que são tokens em IA, como funciona tokenização BPE e por que isso afeta custo e limites de contexto.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Aproximadamente quantos tokens equivalem a 1000 palavras em inglês?',
    options: ['500 tokens', '750 tokens', '1300 tokens', '2000 tokens'],
    correct: 2,
    explanation: 'A regra geral é ~1.3 tokens por palavra em inglês. Em português e outros idiomas, a proporção costuma ser maior (mais tokens por palavra) pois os tokenizadores foram treinados com mais texto em inglês.',
  },
  {
    question: 'O que é BPE (Byte Pair Encoding)?',
    options: [
      'Um algoritmo de compressão de imagens',
      'Um algoritmo que constrói o vocabulário de tokens mesclando pares frequentes de bytes/chars',
      'Um método de inicialização de pesos',
      'Um formato de arquivo para modelos',
    ],
    correct: 1,
    explanation: 'BPE começa com bytes individuais e iterativamente mescla os pares mais frequentes. Palavras comuns como "the" viram um único token; palavras raras são divididas em sub-tokens.',
  },
  {
    question: 'Por que tokens importam para o custo da API?',
    options: [
      'APIs cobram por requisição, não por token',
      'Tokens mais longos são mais caros de processar computacionalmente, e APIs cobram por token',
      'Tokens afetam apenas a velocidade, não o custo',
      'APIs cobram por caractere, não por token',
    ],
    correct: 1,
    explanation: 'APIs de LLM cobram por token de input e output. Prompts longos = mais tokens = maior custo. Além disso, o contexto máximo (ex: 200k tokens) limita quanto texto você pode enviar de uma vez.',
  },
];

export default function TokensPage() {
  return (
    <ModuleLayout
      slug="tokens"
      title="Tokens e Tokenização"
      icon="🔤"
      xp={40}
      readTime={7}
      trailName="Fundamentos da IA"
      trailColor="#58a6ff"
      nextSlug="transformers"
      nextTitle="Transformers e Atenção"
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
        A IA não lê texto como você. Ela lê <strong>tokens</strong>. Entender isso muda como você escreve prompts, estima custos e entende os limites dos modelos.
      </p>

      <Section title="O que é um token?">
        <p>
          Um token é a unidade básica de texto que o modelo processa. Não é necessariamente uma palavra — pode ser parte de uma palavra, uma palavra inteira ou até pontuação.
        </p>
        <div className="p-4 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <p className="text-xs mb-3" style={{ color: 'var(--ffv-muted)' }}>Exemplo de tokenização:</p>
          <div className="flex flex-wrap gap-1">
            {[
              { text: 'Machine', color: '#58a6ff' },
              { text: ' learning', color: '#3fb950' },
              { text: ' é', color: '#d2a8ff' },
              { text: ' incr', color: '#ffa657' },
              { text: 'ível', color: '#f78166' },
              { text: '!', color: '#e3b341' },
            ].map((t, i) => (
              <span key={i} className="px-2 py-1 rounded text-xs font-mono border" style={{ background: `${t.color}15`, borderColor: `${t.color}40`, color: t.color }}>
                {t.text.replace(/ /g, '·')}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs" style={{ color: 'var(--ffv-muted)' }}>6 tokens para 5 palavras + 1 pontuação</p>
        </div>
      </Section>

      <Section title="Como funciona o BPE">
        <p>
          A maioria dos LLMs usa <strong>Byte Pair Encoding (BPE)</strong>. O algoritmo:
        </p>
        <div className="flex flex-col gap-2 text-xs">
          {[
            '1. Começa com caracteres individuais (ou bytes)',
            '2. Conta os pares de caracteres mais frequentes no corpus de treino',
            '3. Mescla o par mais frequente em um novo token',
            '4. Repete até atingir o tamanho de vocabulário desejado (ex: 50.000 tokens)',
          ].map((step, i) => (
            <div key={i} className="flex gap-2 p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <span style={{ color: 'var(--ffv-blue)' }}>{step}</span>
            </div>
          ))}
        </div>
        <p>
          Palavras comuns como <strong>"the"</strong>, <strong>"is"</strong> viram um único token. Palavras raras como <strong>"tokenização"</strong> são divididas: <code className="px-1 rounded text-xs" style={{ background: 'var(--ffv-bg3)' }}>token</code> + <code className="px-1 rounded text-xs" style={{ background: 'var(--ffv-bg3)' }}>ização</code>.
        </p>
      </Section>

      <Section title="Por que idiomas importam">
        <p>
          Tokenizadores treinados com mais texto em inglês são mais eficientes para inglês. Para português e outros idiomas, o mesmo texto frequentemente precisa de <strong>mais tokens</strong>.
        </p>
        <div className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between">
              <span>"Hello, how are you?" (inglês)</span>
              <span style={{ color: 'var(--ffv-green)' }}>~6 tokens</span>
            </div>
            <div className="flex justify-between">
              <span>"Olá, como você está?" (português)</span>
              <span style={{ color: 'var(--ffv-orange)' }}>~8-9 tokens</span>
            </div>
          </div>
        </div>
        <p>
          Isso afeta diretamente o custo e os limites de contexto ao usar APIs em português.
        </p>
      </Section>

      <Section title="Tokens e custo de API">
        <p>
          APIs como Claude e GPT cobram por token. Uma janela de contexto de 200k tokens parece enorme — mas se você estiver passando documentos longos em português, ela pode encher rápido.
        </p>
        <Callout>
          Regra prática: ~750 palavras em inglês ≈ 1000 tokens. Em português, conte com ~20-30% a mais de tokens para o mesmo conteúdo.
        </Callout>
      </Section>

      <Callout>
        Agora você sabe <em>como</em> o texto entra no modelo. No próximo módulo, vamos ver <em>o que acontece dentro</em> — a arquitetura Transformer que processa esses tokens.
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
