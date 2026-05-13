import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('react-fiber-commit-phase');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre render phase e commit phase em React?',
    options: [
      'Nenhuma',
      'Render phase: React chama seus componentes e calcula o que mudou (virtual DOM diff). É PURO — pode ser pausado, retomado ou descartado. Commit phase: React aplica as mudanças ao DOM real e roda effects (useLayoutEffect síncrono, useEffect após paint). É SÍNCRONO e irreversível',
      'Render é DOM',
      'Commit é estilo',
    ],
    correct: 1,
    explanation: 'Essa distinção governa quase todo bug estranho em React. Side effect em render phase (setState em render, fetch sem useEffect) quebra porque render pode rodar duas vezes (StrictMode) ou ser descartado. Commit phase é onde efeitos observáveis acontecem. Entender isso explica useEffect, StrictMode double invoke, Suspense e concurrent rendering.',
  },
  {
    question: 'Por que StrictMode chama seu componente duas vezes em dev?',
    options: [
      'Bug',
      'Para detectar efeitos impuros: se seu componente tem side effect em render phase (mutar variável de módulo, chamar API sem useEffect), o double invoke faz o bug aparecer em dev. Em prod é single invoke. Também chama cleanup + setup de effects duas vezes para expor bugs de "effect não limpa direito"',
      'Para lentidão',
      'Sem motivo',
    ],
    correct: 1,
    explanation: 'StrictMode double invoke é design intencional — "render phase é pura, efeitos cleaunam". Se seu código quebra com double invoke, ele quebraria em Suspense, Offscreen ou qualquer recurso concurrent. Em prod roda uma vez; em dev expõe bugs cedo. Aceitar e adaptar é parte de React moderno.',
  },
  {
    question: 'Quando usar useTransition vs useDeferredValue?',
    options: [
      'São idênticos',
      'useTransition envolve update de estado em transition de baixa prioridade (ex: trocar de aba de filtro pesado): você controla a fonte. useDeferredValue recebe um valor pronto e entrega versão "deferred" dele, útil quando você não controla o setState (lib externa, prop). Ambos usam concurrent rendering para não travar UI',
      'Só um é React',
      'useTransition é para CSS',
    ],
    correct: 1,
    explanation: 'useTransition é "eu sei que este setState é lento, agende como baixa prioridade". useDeferredValue é "recebo este valor e quero versão atrasada dele". Primeiro é ativo (você escolhe a transição); segundo é reativo (você deriva). Ambos permitem concurrent rendering interromper trabalho em benefício de input urgente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="react-fiber-commit-phase"
      title="React fiber + commit phase: reatividade real"
      icon="⚛️"
      xp={65}
      readTime={15}
      trailName="Frontend Moderno — HTML, CSS, JS e React"
      trailColor={accent}
      nextSlug="react-server-components"
      nextTitle="React Server Components e Actions (2026)"
      quiz={quiz}
    >
      <Section title="Por que entender o runtime importa" accent={accent}>
        <p>
          Maioria dos bugs bizarros em React — infinite loops, double rendering, estado inconsistente, Suspense que recarrega — vêm de mal-entendido do runtime. React não é "renderizador que executa seu código". É um runtime em duas fases com scheduler próprio, que pode pausar, retomar e descartar trabalho. Entender o modelo destrava design de componentes.
        </p>
      </Section>

      <Section title="Fiber: a estrutura interna" accent={accent}>
        <p>
          React representa cada componente como um <strong>fiber</strong> (objeto JS com pai, filho, irmão, estado, props, efeitos pendentes). A árvore de fibers permite percorrer o trabalho de renderização de forma interrompível — diferente da recursão tradicional que rodava de cabo a rabo sem pausa.
        </p>
        <CodeBlock lang="ts">{`// Estrutura conceitual (simplificada) de um Fiber
type Fiber = {
  type: string | Function;  // div, MyComponent
  pendingProps: Props;
  memoizedProps: Props;
  memoizedState: unknown;   // hooks state
  child: Fiber | null;
  sibling: Fiber | null;
  return: Fiber | null;     // pai
  flags: number;            // bitmask de efeitos: Placement, Update, Deletion...
  alternate: Fiber | null;  // árvore "work-in-progress"
};

// Em cada update, React constrói árvore WIP em paralelo à atual.
// Pode abortar WIP se chegar update de prioridade maior.
// Ao terminar WIP sem interrupções: commit.`}</CodeBlock>
      </Section>

      <Section title="As duas fases" accent={accent}>
        <CodeBlock lang="yaml">{`render_phase:
  propriedades: pura, interruptible, retryable
  o_que_acontece:
    - React chama seu componente
    - hooks são disparados (useState, useMemo, useReducer)
    - JSX é avaliado -> descreve o que deveria existir
  regras:
    - NÃO mutar variáveis externas
    - NÃO fazer fetch/DOM/setTimeout aqui
    - deve retornar mesma coisa para mesmas props+state
  pode_rodar_multiplas_vezes:
    - StrictMode dev: 2x
    - update interrompido por input urgente: N+1 vezes
    - Suspense retry após resolver: N+1 vezes

commit_phase:
  propriedades: síncrona, irreversível
  o_que_acontece:
    - React aplica mudanças no DOM real
    - useLayoutEffect roda (antes do browser pintar)
    - useInsertionEffect (para CSS-in-JS libs)
    - browser pinta
    - useEffect roda (depois de pintar)
  regras:
    - aqui é onde side effects observáveis VIVEM
    - efeitos com cleanup rodam em pares (cleanup prev + setup novo)`}</CodeBlock>
      </Section>

      <Section title="StrictMode double invoke: o que ele tenta te ensinar" accent={accent}>
        <CodeBlock lang="tsx">{`// ❌ RUIM — side effect em render (quebra em StrictMode, Suspense, etc.)
let idCounter = 0;
function Item({ label }: { label: string }) {
  const id = ++idCounter; // muta módulo ao renderizar
  return <div id={'i-' + id}>{label}</div>;
}

// ✅ BOM — efeito dentro de useEffect, ou useId para IDs estáveis
function Item({ label }: { label: string }) {
  const id = useId();
  return <div id={id}>{label}</div>;
}

// ❌ RUIM — effect sem cleanup quebra em StrictMode
useEffect(() => {
  const sub = api.subscribe(handle);
  // SEM return => cleanup não roda => dobra de subs em dev
}, []);

// ✅ BOM — cleanup existe
useEffect(() => {
  const sub = api.subscribe(handle);
  return () => sub.unsubscribe();
}, []);`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Regra operacional: se seu código quebra em StrictMode, ele quebraria em produção com Suspense ou concurrent rendering. StrictMode não é chato — é canário.
        </Callout>
      </Section>

      <Section title="useTransition: update de baixa prioridade" accent={accent}>
        <CodeBlock lang="tsx">{`import { useState, useTransition } from 'react';

export function SearchablePanel({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('');
  const [filteredQuery, setFilteredQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    // Urgente: atualiza input imediatamente
    setQuery(e.target.value);

    // Baixa prioridade: filtro pesado pode ser interrompido se input continuar
    startTransition(() => {
      setFilteredQuery(e.target.value);
    });
  }

  return (
    <>
      <input value={query} onChange={onInput} />
      {isPending && <span>filtrando...</span>}
      <ExpensiveList items={items} query={filteredQuery} />
    </>
  );
}`}</CodeBlock>
      </Section>

      <Section title="useDeferredValue: derivar versão atrasada" accent={accent}>
        <CodeBlock lang="tsx">{`import { useDeferredValue, memo } from 'react';

export function List({ query }: { query: string }) {
  // Recebo query de fora; não controlo o setState. Defer o valor.
  const deferred = useDeferredValue(query);
  const isStale = query !== deferred;

  return (
    <div style={{ opacity: isStale ? 0.6 : 1 }}>
      <ExpensiveList query={deferred} />
    </div>
  );
}

// Combinado com memo, evita re-render de filhos pesados durante typing
export const ExpensiveList = memo(function ExpensiveList({ query }: { query: string }) {
  // cálculo pesado, aqui
  return <ul>{/* ... */}</ul>;
});`}</CodeBlock>
      </Section>

      <Section title="Suspense real: não é só loading spinner" accent={accent}>
        <CodeBlock lang="tsx">{`import { Suspense } from 'react';
import { use } from 'react';

function Orders() {
  const orders = use(fetchOrdersPromise); // suspende até resolver
  return <ul>{orders.map((o) => <li key={o.id}>{o.title}</li>)}</ul>;
}

export default function Page() {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <Orders />
    </Suspense>
  );
}

// Aninhar Suspense para UX de streaming:
// partes da página aparecem conforme dados chegam.`}</CodeBlock>
      </Section>

      <Section title="Key prop: o que realmente faz" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          <code>key</code> não é só para listas. É ID de identidade do componente no fiber tree. Trocar key força React a desmontar e montar de novo (state perdido, effects re-run). Uso deliberado: resetar form com <code>{'<Form key={userId} />'}</code> ou reinicializar animação. Uso errado: <code>{'key={index}'}</code> em lista mutável causa reconciliation errada e estado embaralhado.
        </Callout>
      </Section>

      <Section title="Resumo" accent={accent}>
        <Callout tone="success" icon="✅">
          Render phase é pura e pode rodar N vezes; commit phase aplica efeitos. StrictMode double invoke é ferramenta, não bug. useTransition para seus setStates lentos; useDeferredValue para valores que você não controla. Suspense integra streaming de dados. Key é identidade do fiber. Saber isso muda como você desenha componentes — zero "truques" de workaround.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
