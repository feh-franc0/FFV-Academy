import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'KV Cache: Memória Eficiente — FFV Academy',
  description: 'O que é KV Cache em transformers, como funciona Key-Value Cache e por que é essencial para inferência eficiente.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Para que serve o KV Cache?',
    options: [
      'Para armazenar o modelo inteiro na RAM',
      'Para evitar recalcular as chaves e valores de tokens já processados',
      'Para comprimir o modelo e ocupar menos espaço',
      'Para acelerar o treinamento do modelo',
    ],
    correct: 1,
    explanation: 'O KV Cache guarda os vetores K (Key) e V (Value) de tokens que já foram processados, evitando recalcular esses valores a cada novo token gerado.',
  },
  {
    question: 'Por que um modelo de 30GB pode precisar de 60GB de VRAM durante inferência?',
    options: [
      'Por causa de bugs no código',
      'Porque a GPU duplica os dados por segurança',
      'O KV Cache cresce com o contexto — para contextos longos, pode superar o tamanho do modelo',
      'Porque o modelo carrega duas cópias de si mesmo',
    ],
    correct: 2,
    explanation: 'O KV Cache armazena vetores para cada token em cada camada. Com contextos longos (ex: 128k tokens) e muitas camadas, o cache pode facilmente superar o tamanho do próprio modelo.',
  },
  {
    question: 'O Prompt Caching (ex: da API do Claude) serve para:',
    options: [
      'Salvar prompts no disco rígido do usuário',
      'Reutilizar o KV Cache de um prefixo repetido entre requisições diferentes',
      'Comprimir o prompt para usar menos tokens',
      'Armazenar as respostas do modelo para reutilizar',
    ],
    correct: 1,
    explanation: 'O Prompt Caching permite que o KV Cache de uma parte do prompt (ex: instruções de sistema longas) seja reutilizado entre chamadas à API, reduzindo latência e custo.',
  },
];

export default function KVCachePage() {
  return (
    <ModuleLayout
      slug="kv-cache"
      title="KV Cache: Memória Eficiente"
      icon="⚡"
      xp={60}
      readTime={8}
      trailName="IA Além do LLM"
      trailColor="#d2a8ff"
      nextSlug="mixture-of-experts"
      nextTitle="Mixture of Experts"
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
        Por que um modelo de 30GB de parâmetros pode precisar de 60GB ou mais de VRAM? A resposta é o KV Cache — um dos conceitos mais importantes (e menos explicados) da inferência moderna.
      </p>

      <Section title="O problema: atenção é cara">
        <p>
          Os Transformers funcionam com um mecanismo de <strong>atenção</strong> onde cada token "presta atenção" em todos os outros. Para isso, cada token gera três vetores: <strong>Query (Q)</strong>, <strong>Key (K)</strong> e <strong>Value (V)</strong>.
        </p>
        <p>
          Quando o modelo gera uma resposta <em>token por token</em>, ele precisa calcular a atenção do novo token com <em>todos os tokens anteriores</em>. Sem cache, isso significa recalcular K e V de tudo do zero a cada novo token.
        </p>
        <CodeBlock>{`// Sem KV Cache: para cada novo token
Para token t:
  Recalcula K e V de t=1 até t=n  ← INEFICIENTE
  Calcula atenção
  Gera próximo token

// Complexidade: O(n²) — cresce quadraticamente com o contexto`}</CodeBlock>
      </Section>

      <Section title="A solução: guardar o que já foi calculado">
        <p>
          O KV Cache é simples na ideia: <strong>calcule K e V de cada token uma única vez e guarde em memória</strong>. Quando o próximo token chegar, só calcula K e V <em>dele</em> e concatena com o cache.
        </p>
        <CodeBlock>{`// Com KV Cache:
Cache = { K: [], V: [] }

Para cada novo token t:
  Calcula K[t] e V[t] apenas para t
  Cache.K.append(K[t])
  Cache.V.append(V[t])
  Atenção usando todo o Cache  ← rápido!
  Gera próximo token`}</CodeBlock>
        <Callout>
          Isso torna a geração de tokens muito mais rápida — complexidade cai de O(n²) para O(n) por token gerado.
        </Callout>
      </Section>

      <Section title="O custo: memória">
        <p>
          Guardar K e V de todos os tokens em todas as camadas ocupa memória. Muito. Veja a conta:
        </p>
        <div className="p-4 rounded-lg font-mono text-xs" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--ffv-green)' }}>
          <p>Modelo: 70B parâmetros, 80 camadas, dim=8192</p>
          <p>Contexto: 128k tokens</p>
          <p>─────────────────────────────────</p>
          <p>KV Cache = 2 × camadas × seq_len × dim × bytes</p>
          <p>         = 2 × 80 × 128000 × 8192 × 2</p>
          <p style={{ color: 'var(--ffv-orange)' }}>         ≈ 320 GB de VRAM apenas para o cache!</p>
        </div>
        <p>
          É por isso que contextos muito longos são caros e exigem hardware especializado ou técnicas como <strong>sliding window attention</strong> e <strong>GQA (Grouped Query Attention)</strong>.
        </p>
      </Section>

      <Section title="Prompt Caching na API">
        <p>
          Serviços como o Claude (Anthropic) e o GPT-4 (OpenAI) implementaram <strong>Prompt Caching</strong>: se você fizer duas chamadas à API com o mesmo prefixo de prompt, o KV Cache desse prefixo é reutilizado.
        </p>
        <p>
          Isso é exatamente o que seu sistema de notas mencionou: você paga para calcular o cache uma vez, e na segunda chamada ele já está salvo — menor latência e menor custo.
        </p>
        <div className="p-4 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <div className="text-xs flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(247,129,102,0.2)', color: 'var(--ffv-red)' }}>Chamada 1</span>
              <span style={{ color: 'var(--ffv-muted)' }}>Sistema (2000 tokens) + pergunta → calcula e guarda cache</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(63,185,80,0.2)', color: 'var(--ffv-green)' }}>Chamada 2</span>
              <span style={{ color: 'var(--ffv-muted)' }}>Sistema (mesmo) + nova pergunta → reutiliza cache 🚀</span>
            </div>
          </div>
        </div>
      </Section>

      <Callout>
        No próximo módulo: <strong>Mixture of Experts</strong> — como modelos com 200B+ parâmetros conseguem rodar sem precisar carregar tudo na memória ao mesmo tempo.
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

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--ffv-green)', fontFamily: 'var(--font-geist-mono)' }}>
      {children}
    </pre>
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
