import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  Timeline,
  DecisionBox,
  StackFlow,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('js-garbage-collection');

const ACCENT = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o V8 separa o heap em young generation e old generation (generational GC)?',
    options: [
      'Para suportar objetos grandes (>1MB) em pool separado',
      'Hipótese geracional: a maioria dos objetos morre jovem. Coletar só a young gen com frequência (Scavenger barato) e raramente a old gen (Mark-Compact caro) maximiza throughput e minimiza pause time',
      'Para isolar memória de cada Web Worker em pools distintas',
      'Compatibilidade com APIs WeakMap/WeakRef que exigem heaps separados',
    ],
    correct: 1,
    explanation:
      'A weak generational hypothesis é empírica: ~80–95% dos objetos alocados se tornam unreachable rapidamente (closures temporárias, objetos de uma iteração). Coletar essa young gen com um Scavenger (Cheney semi-space) é rápido — copia os sobreviventes (poucos) e descarta o resto. A old gen, que tem objetos longevos, usa Mark-Compact incremental, rodada raramente. Ver v8.dev/blog/trash-talk.',
  },
  {
    question: 'O que o Scavenger (minor GC) faz quando o young gen enche?',
    options: [
      'Marca recursivamente todos os objetos vivos e libera o resto',
      'Algoritmo Cheney semi-space: divide young gen em from-space e to-space, copia objetos vivos do from para o to, e troca os papéis. Sobreviventes que “envelhecem” são promovidos para old gen',
      'Pausa todas as threads e roda full mark-and-sweep no heap inteiro',
      'Usa reference counting para liberar imediatamente quem chegou a zero',
    ],
    correct: 1,
    explanation:
      'Scavenger usa o algoritmo de Cheney (1970). O young gen é dividido em dois semi-spaces. Aloca-se sempre no from-space. Quando enche, copia objetos vivos (acessíveis pelas roots) para o to-space, atualiza ponteiros, e descarta o from-space inteiro. Objetos que sobrevivem 2 scavenges são promovidos para old gen. Custo é proporcional ao volume de sobreviventes, não ao total alocado.',
  },
  {
    question: 'O que é incremental marking no Orinoco?',
    options: [
      'Marca apenas objetos modificados desde o último GC',
      'Em vez de stop-the-world por dezenas de ms, o marking da old gen é fatiado em pequenas pausas (1–10ms) intercaladas com execução de JS, usando write barriers para manter o tri-color invariant correto',
      'Marca objetos por geração (young primeiro, old depois)',
      'Usa GPU para marcar em paralelo via WebGPU',
    ],
    correct: 1,
    explanation:
      'Incremental marking trava o pause máximo em ~5ms. Cada slice marca alguns objetos, depois devolve controle ao JS. Write barriers garantem que se JS modifica um ponteiro durante o marking (de objeto branco para preto, por exemplo), o invariant tri-color é preservado. Combinado com concurrent marking (em outra thread) e concurrent sweeping, o Orinoco transforma GC de “stop-the-world” em “mostly background”. Ver v8.dev/blog/orinoco-parallel-scavenger.',
  },
  {
    question: 'Qual a diferença prática entre Map/Set e WeakMap/WeakSet?',
    options: [
      'WeakMap permite apenas chaves primitivas; Map aceita objetos',
      'WeakMap mantém referências fracas às chaves: se a chave não for referenciada em nenhum outro lugar, o GC pode coletá-la e a entrada some automaticamente. Map mantém referências fortes — entradas vivem até serem removidas explicitamente',
      'WeakMap é apenas mais rápido em V8',
      'WeakMap é uma API legacy do ES5, Map é moderna',
    ],
    correct: 1,
    explanation:
      'WeakMap/WeakSet evitam memory leaks em caches por instância (ex: associar metadata a um DOM node sem impedir sua remoção). Limitações: chaves só podem ser objetos (não primitivos), não é iterável, não tem `size`. Para detectar coleta, use WeakRef + FinalizationRegistry (cuidado: comportamento não é determinístico — apenas “best effort”).',
  },
  {
    question: 'Como detectar memory leaks em uma SPA Next.js usando Chrome DevTools?',
    options: [
      'Performance tab → record → ver heap usage curve',
      'Memory tab → Heap snapshot antes e depois de um ciclo (abrir/fechar modal, navegar). Comparar snapshots em modo “Comparison” mostra Detached DOM nodes, objetos retidos, closures presas. 3-snapshot technique também ajuda a identificar growth pattern',
      'Apenas habilitar --expose-gc no Node e chamar gc() periodicamente',
      'Usar console.memory.usedJSHeapSize em loop',
    ],
    correct: 1,
    explanation:
      'Heap snapshots são a ferramenta fundamental. Take snapshot, faça uma ação que deveria liberar memória (fechar modal), force GC (botão), take outro. Compare. “Detached HTMLDivElement” retidos = leak via listener não removido. 3-snapshot technique (Loreena Lee, Google) detecta growth: snap → ação → snap → ação → snap; objetos que crescem 1→2→3 instâncias são leaks. --trace-gc no Node mostra GC pressure.',
  },
  {
    question: 'O que NÃO é uma boa prática para reduzir GC pressure?',
    options: [
      'Reusar arrays/buffers pré-alocados em hot loops em vez de criar novos',
      'Object pool para objetos frequentemente criados/descartados',
      'Chamar gc() manualmente no início de cada frame de animação para liberar memória',
      'Evitar closures dentro de hot loops que capturam variáveis grandes desnecessariamente',
    ],
    correct: 2,
    explanation:
      'Chamar gc() manualmente é antipattern. Primeiro, só funciona com --expose-gc (não em produção). Segundo, força full GC sincronamente — pause maior que o Orinoco já ofereceria. O Orinoco é projetado para rodar em paralelo/incremental; interferir manualmente regride a UX. Outras opções são legítimas: object pool, buffer reuse e cuidar de closures reduzem allocation rate, que é a métrica que de fato importa.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="js-garbage-collection"
      title="GC do V8: Orinoco, generational, concurrent, incremental"
      icon="🗑️"
      xp={65}
      readTime={13}
      trailName="Browser & Web Internals Profundo"
      trailColor={ACCENT}
      nextSlug="event-loop-microtasks-macrotasks"
      nextTitle="Event loop a fundo: micro vs macro, RIC, idle, frame"
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
        O Orinoco — nome do projeto de GC do V8 — não é “um garbage collector”. É um conjunto
        de algoritmos coordenados: Scavenger generational para young gen, Mark-Compact
        incremental e concurrent para old gen, write barriers, idle-time work scheduling.
        Entender quando cada um roda é o que separa quem otimiza por sorte de quem otimiza por
        causa.
      </p>

      <Section title="A hipótese geracional" accent={ACCENT}>
        <p>
          Estudos clássicos (Ungar 1984, Lieberman & Hewitt 1983) mostraram que em linguagens
          orientadas a objetos, ~80–95% dos objetos morrem jovem. A weak generational
          hypothesis embute essa observação no design: separe o heap em “young” e “old”,
          colete o young com frequência e o old raramente.
        </p>
        <StackFlow
          title="Layout do heap V8 (simplificado)"
          accent={ACCENT}
          items={[
            {
              icon: '🌱',
              label: 'Young generation (new space)',
              sub: '~1–8 MB total',
              detail: 'Dividida em from-space e to-space (semi-space). Aloca-se sempre no from. Scavenger coleta quando enche (~ms). Sobreviventes a 2 scavenges são promovidos.',
              connector: 'promoção após 2 scavenges',
            },
            {
              icon: '🌳',
              label: 'Old generation (old space)',
              sub: 'GBs em apps grandes',
              detail: 'Objetos longevos. Coletada por Mark-Compact, intensificada por incremental marking + concurrent sweeping. Roda raro mas é “a” GC pause percebida.',
              connector: 'objetos > 1MB',
            },
            {
              icon: '📦',
              label: 'Large object space (LOS)',
              sub: 'Objetos > limite (~512KB)',
              detail: 'ArrayBuffers grandes, strings enormes. Não copiados (caros demais), coletados in-place com Mark-Sweep.',
            },
          ]}
        />
        <Callout tone="info" icon="📚">
          “Trash talk: The Orinoco garbage collector” em <InlineCode>v8.dev/blog/trash-talk</InlineCode>{' '}
          é a leitura canônica. “Concurrent marking in V8”, “Parallel scavenger” e “Concurrent
          marking in V8” no mesmo blog cobrem cada fase em detalhe.
        </Callout>
      </Section>

      <Section title="Scavenger — minor GC" accent={ACCENT}>
        <p>
          O Scavenger é uma implementação paralela do algoritmo Cheney (1970). Quando o young
          gen enche:
        </p>
        <FlowDiagram
          title="Algoritmo do Scavenger (Cheney semi-space)"
          accent={ACCENT}
          orientation="vertical"
          steps={[
            { icon: '1️⃣', label: 'Pause curta', desc: 'Tipicamente <1ms para young gen pequeno' },
            { icon: '2️⃣', label: 'Identificar roots', desc: 'Stack, globais, remembered set (old→young refs)' },
            { icon: '3️⃣', label: 'Copy live objects', desc: 'Do from-space para o to-space (BFS via worklist)' },
            { icon: '4️⃣', label: 'Atualizar ponteiros', desc: 'Old refs apontando para from passam a apontar para to' },
            { icon: '5️⃣', label: 'Promover sobreviventes', desc: 'Objetos que sobreviveram 2 scavenges → old gen' },
            { icon: '6️⃣', label: 'Trocar spaces', desc: 'From-space inteiro é descartado; to-space vira novo from' },
          ]}
        />
        <Callout tone="tip" icon="💡">
          O Scavenger custa O(sobreviventes), não O(alocados). Por isso “alocar muito mas a maior
          parte morre jovem” é OK — é exatamente o caso para o qual o algoritmo foi feito.
        </Callout>
      </Section>

      <Section title="Mark-Compact — major GC" accent={ACCENT}>
        <p>
          A old gen usa Mark-Compact, composto por três fases. O Orinoco torna cada uma
          incremental e/ou concurrent.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Fase', 'O que faz', 'Como o Orinoco a otimiza']}
          rows={[
            ['Marking', 'Marca todos os objetos alcançáveis a partir das roots (tri-color)', 'Incremental (fatias de ~5ms) + concurrent (helper threads em paralelo ao JS)'],
            ['Sweeping', 'Libera memória dos objetos não marcados (adiciona à free list)', 'Concurrent — roda em background threads sem pausar o main'],
            ['Compaction', 'Move objetos vivos para juntar espaço livre contíguo (combate fragmentação)', 'Paralela em múltiplas threads, só páginas mais fragmentadas'],
          ]}
        />
        <CodeBlock lang="bash" filename="trace-gc.sh">{`# Node.js: ver GC events
node --trace-gc --trace-gc-verbose app.js

# Saída típica:
# [12345:0x...] 100 ms: Scavenge 1.2 (1.5) -> 0.3 (1.5) MB, 0.5 / 0.0 ms
# [12345:0x...] 500 ms: Mark-sweep 3.1 (4.0) -> 1.2 (4.0) MB, 12.4 / 0.0 ms
#                              ^ heap antes (committed) → depois, tempo gasto

# Diferencias minor vs major:
# Scavenge       = young gen (rápido, frequente)
# Mark-sweep     = old gen (lento, raro)
# Incremental    = fatias incrementais de marking`}</CodeBlock>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Pause budget V8', v: '~5ms target para incremental marking slices' },
            { k: 'Write barrier', v: 'Toda atribuição ptr → ptr é checada; old→young refs vão no remembered set' },
            { k: 'Concurrent', v: '“Em outra thread, paralelo ao JS” (não pausa)' },
            { k: 'Incremental', v: '“Em fatias pequenas no main thread” (pausa curta repetida)' },
            { k: 'Idle GC', v: 'V8 usa requestIdleCallback do browser para rodar GC em tempo ocioso' },
          ]}
        />
      </Section>

      <Section title="WeakMap, WeakSet, WeakRef, FinalizationRegistry" accent={ACCENT}>
        <p>
          Quando você precisa associar metadata a um objeto sem prendê-lo vivo, use referências
          fracas. O GC pode coletar livremente; as entradas “somem” automaticamente.
        </p>
        <CodeBlock lang="javascript" filename="weak-refs.js">{`// WeakMap: chaves fracas. Útil para metadata por instância.
const metadata = new WeakMap();
function tagNode(node, meta) {
  metadata.set(node, meta);
}
// Quando o DOM node é removido e ninguém mais aponta para ele,
// a entry sai do WeakMap automaticamente — zero leak.

// WeakRef (ES2021): ref fraca a qualquer objeto
const ref = new WeakRef(someObject);
const obj = ref.deref();  // pode ser undefined se já foi coletado
if (obj) {
  // use obj — mas sem garantir que estará vivo no próximo tick
}

// FinalizationRegistry: callback quando objeto é coletado
const registry = new FinalizationRegistry((heldValue) => {
  console.log(\`Objeto com tag \${heldValue} foi coletado\`);
});
let target = { big: 'data' };
registry.register(target, 'minhaTag');
target = null;  // agora elegível para GC; callback rodará "em breve"

// ⚠️ Comportamento NÃO é determinístico. Não use para liberar recursos críticos
// (file handles, sockets). Use AbortController/disposal explícito.`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          WeakRef e FinalizationRegistry têm semântica “best effort”. O TC39 explicitamente
          alerta: <em>“correctness should not depend on when finalizers run”</em>. Para
          recursos críticos use disposers explícitos (try/finally, AbortController, ou o
          futuro Explicit Resource Management — <InlineCode>using</InlineCode> proposal,
          stage 3 em 2026).
        </Callout>
      </Section>

      <Section title="Detectando memory leaks" accent={ACCENT}>
        <DecisionBox
          scenario="Sua SPA Next.js cresce 5MB/min em uso normal — clientes reclamam de lentidão após horas"
          winner="Chrome DevTools → Memory → Heap snapshots + 3-snapshot technique"
          winnerColor={ACCENT}
          why="Snapshot capture o estado vivo do heap. Comparar dois snapshots identifica o que cresceu. A técnica de 3 snapshots (snap → ação → snap → ação → snap) destaca objetos que crescem linearmente — sinal claro de leak. Filter “Detached” no class filter mostra DOM nodes presos por closures/listeners."
          alternatives={[
            { name: 'Performance.memory', note: 'Apenas Chrome, dá só o total. Útil para alerta, não diagnóstico' },
            { name: 'node --inspect + Chrome', note: 'Mesma técnica server-side; clinic.js heap profile também ajuda' },
            { name: 'why-is-node-running', note: 'Para Node — mostra event loop holders, não heap leaks' },
          ]}
        />
        <CodeBlock lang="javascript" filename="common-leak-patterns.js">{`// ❌ LEAK 1: listener não removido
function setupModal() {
  const handler = () => console.log('click');
  document.addEventListener('click', handler);
  // ...modal abre/fecha mas handler nunca removeEventListener
}

// ✅ FIX: AbortController centraliza limpeza
function setupModal() {
  const ctrl = new AbortController();
  document.addEventListener('click', () => {}, { signal: ctrl.signal });
  return () => ctrl.abort();  // chame ao fechar
}

// ❌ LEAK 2: closure capturando big data
function createHandler(bigArray) {
  return () => console.log('clicked');  // bigArray fica retido!
}

// ✅ FIX: capturar só o necessário
function createHandler(bigArray) {
  const len = bigArray.length;  // captura só primitive
  return () => console.log('clicked', len);
}

// ❌ LEAK 3: cache crescendo sem limite
const cache = new Map();
function get(key) {
  if (!cache.has(key)) cache.set(key, expensive(key));
  return cache.get(key);
}

// ✅ FIX: WeakMap se chaves são objetos, ou LRU bounded
const cache = new Map();
const MAX = 1000;
function get(key) {
  if (cache.has(key)) return cache.get(key);
  if (cache.size >= MAX) cache.delete(cache.keys().next().value);
  const v = expensive(key);
  cache.set(key, v);
  return v;
}`}</CodeBlock>
      </Section>

      <Section title="Timeline do Orinoco" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            { when: '2011', label: 'Original V8 GC', detail: 'Stop-the-world mark-sweep. Pauses de 50–200ms em apps grandes — dor real.' },
            { when: '2016', label: 'Concurrent marking', detail: 'Marking sai do main thread, roda em paralelo. Pauses caem ~50%.' },
            { when: '2017', label: 'Orinoco oficial', detail: 'Conjunto coordenado: parallel scavenger, concurrent marking, concurrent sweeping, idle GC.', highlight: true },
            { when: '2018', label: 'Parallel scavenger', detail: 'Scavenger ganha helper threads. Young GC fica 20–50% mais rápido.' },
            { when: '2020', label: 'Concurrent young GC', detail: 'Experimento de young gen concurrent (Major GC menos disruptivo).' },
            { when: '2024–26', label: 'Refinamentos contínuos', detail: 'Tuning para WebGPU/SharedArrayBuffer workloads, melhorias para Workers de Edge runtimes.' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Por que chamar `gc()` manualmente é antipattern?"
          a={
            <span>
              Só funciona com <InlineCode>--expose-gc</InlineCode> (não em browser/produção).
              Força full Mark-Compact sincronamente — pausa MAIOR que o Orinoco ofereceria
              incrementalmente. Você está se sabotando.
            </span>
          }
        />
        <QAItem
          q="`Array(1e6).fill(0)` aloca tudo de uma vez? Vai para old gen direto?"
          a={
            <span>
              Sim, alocação grande (≥ 512KB) vai direto para o Large Object Space, pulando o
              young gen. Não é copiada, é coletada in-place no major GC. Útil saber em hot
              loops: prealocar buffers grandes uma vez evita allocation churn.
            </span>
          }
        />
        <QAItem
          q="`--max-old-space-size` afeta o que exatamente?"
          a={
            <span>
              Limita o tamanho da old gen. Default ~1.5GB em 64-bit. Apps que crescem além
              precisam aumentar (ex: <InlineCode>--max-old-space-size=4096</InlineCode> = 4GB).
              Não afeta young gen (controlado por <InlineCode>--max-semi-space-size</InlineCode>).
            </span>
          }
        />
        <QAItem
          q="Object pooling vale a pena em 2026?"
          a={
            <span>
              Depende. Para hot paths que alocam 100k+ objetos/s do mesmo shape (ex: game loop,
              parsers), sim — reduz GC pressure dramaticamente. Para código “normal”, não — o
              Scavenger já lida bem e pooling adiciona complexidade. Profile antes.
            </span>
          }
        />
      </Section>

      <Callout tone="success" icon="✅">
        Próximo: como o event loop coordena execução com micro/macrotasks, RIC, animation
        frames. Veja <InlineCode>event-loop-microtasks-macrotasks</InlineCode>.
      </Callout>
    </div>
  );
}
