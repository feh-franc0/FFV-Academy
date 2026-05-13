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

export const metadata = getModuleMetadata('event-loop-microtasks-macrotasks');

const ACCENT = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença fundamental entre uma microtask e uma macrotask?',
    options: [
      'Microtasks são síncronas, macrotasks assíncronas',
      'Microtasks são executadas ATÉ esgotar a fila ao final de cada task da macro queue, antes de qualquer rendering ou nova task. Macrotasks (setTimeout, fetch callback, eventos DOM) executam uma por vez',
      'Microtasks são mais rápidas porque rodam na GPU',
      'Microtasks só existem em workers; macrotasks no main thread',
    ],
    correct: 1,
    explanation:
      'A diferença é o checkpoint: após cada macrotask, o HTML spec manda “perform a microtask checkpoint” — drenar TODA a microtask queue antes de seguir. Isso garante que promises resolvem antes do próximo `setTimeout(0)` e antes de qualquer rendering. Ver HTML Living Standard, “processing model” em html.spec.whatwg.org/#event-loops.',
  },
  {
    question: 'No código abaixo, qual é a ordem de saída? `setTimeout(()=>console.log(1),0); Promise.resolve().then(()=>console.log(2)); console.log(3); queueMicrotask(()=>console.log(4));`',
    options: [
      '1, 2, 3, 4',
      '3, 2, 4, 1',
      '3, 4, 2, 1',
      '1, 3, 2, 4',
    ],
    correct: 1,
    explanation:
      'Síncrono primeiro: imprime 3. Ao terminar, microtask checkpoint drena a fila na ordem de inserção: Promise.then (2), depois queueMicrotask (4). Só então a macrotask de setTimeout roda: 1. Resultado: 3, 2, 4, 1. Truque: ambos Promise.then e queueMicrotask vão para a MESMA fila de microtasks.',
  },
  {
    question: 'O que `await` faz internamente em termos de event loop?',
    options: [
      'Bloqueia a thread até a promise resolver',
      'Suspende a função async e enfileira o resto da função como microtask quando a promise resolver. Equivale a `.then(resto)`',
      'Cria uma nova thread para executar a continuação',
      'É açúcar sintático para `setTimeout(0)`',
    ],
    correct: 1,
    explanation:
      '`await p` é açúcar para `p.then(continuation)`. A continuação é enfileirada como microtask quando p resolve. Por isso `for (const x of huge) await something(x)` é serial mas não bloqueia o thread — entre cada iteração, microtask checkpoint roda, mas a UI ainda fica bloqueada se você não der respiro com `setTimeout(0)` ou scheduler.yield().',
  },
  {
    question: 'Qual a diferença entre `requestAnimationFrame` (rAF) e `requestIdleCallback` (RIC)?',
    options: [
      'rAF é mais novo que RIC',
      'rAF executa antes do próximo paint (sincronizado com refresh do display, ~16.67ms em 60Hz). RIC executa apenas quando o browser está ocioso, com `timeRemaining()` indicando quanto tempo você tem',
      'RIC é apenas para Service Workers',
      'rAF é macrotask; RIC é microtask',
    ],
    correct: 1,
    explanation:
      'rAF é o ponto certo para mutações visuais — sincronizado com o paint, evita layout thrashing. RIC é para trabalho de baixa prioridade (preload, analytics, idle prefetch). RIC pode ter `timeRemaining()` perto de 50ms se o browser está bem ocioso, ou nunca rodar se o usuário interage constantemente. Importante: Safari só ganhou RIC em 2022 (Safari 15.4); use polyfill ou Scheduler API.',
  },
  {
    question: 'Quando o rendering pipeline (style, layout, paint, composite) roda dentro do event loop?',
    options: [
      'A cada microtask',
      'Em pontos específicos definidos pelo HTML spec — geralmente após drenar microtasks, antes de chamar rAF callbacks, no máximo uma vez por “loop iteration”. Não é garantido rodar a cada iteration — browser decide baseado em vsync',
      'Sempre antes de qualquer task',
      'Apenas a cada 16.67ms exatos',
    ],
    correct: 1,
    explanation:
      'HTML spec: “update the rendering” é uma fase do event loop que roda “se necessário” (display ready para um novo frame). Ordem: task → microtask checkpoint → rAF callbacks → style/layout/paint → composite. Por isso código pesado em microtask atrasa rAF/paint — você está “antes” do rendering. Ver html.spec.whatwg.org/#event-loop-processing-model.',
  },
  {
    question: 'O que a API Scheduler (`scheduler.postTask`, `scheduler.yield`) traz que setTimeout não?',
    options: [
      'É apenas um polyfill mais bonito',
      'Prioridades explícitas (user-blocking, user-visible, background) e a habilidade de “yield” cooperativamente no meio de trabalho longo, permitindo que o browser intercale rendering e input handling. Origin trial avançado em 2024, shipping em Chrome estável',
      'Funciona apenas em Service Workers',
      'Substitui completamente o event loop',
    ],
    correct: 1,
    explanation:
      'Scheduler API (TC39 + WICG) resolve o problema clássico: `setTimeout(0)` não tem prioridade, sempre vai para o final da macro queue. `scheduler.postTask(fn, {priority: "user-blocking"})` permite ao browser priorizar input/scrolling sobre seu task. `await scheduler.yield()` é a forma moderna de dar respiro no meio de trabalho longo sem perder posição na fila.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="event-loop-microtasks-macrotasks"
      title="Event loop a fundo: micro vs macro, RIC, idle, frame"
      icon="🔁"
      xp={70}
      readTime={14}
      trailName="Browser & Web Internals Profundo"
      trailColor={ACCENT}
      nextSlug="rendering-pipeline-paint"
      nextTitle="Rendering pipeline: parse → style → layout → paint → composite"
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
        “Event loop é uma fila” é a versão de bootcamp. A verdade que a HTML Living Standard
        define em <InlineCode>html.spec.whatwg.org/#event-loops</InlineCode> tem múltiplas
        task queues priorizadas, microtask checkpoint em pontos específicos, integração com o
        rendering pipeline e cooperação com idle time. Quem entende isso domina jank.
      </p>

      <Section title="O modelo real (HTML Living Standard)" accent={ACCENT}>
        <p>
          O event loop não é “uma” fila. O spec define <strong>múltiplas task sources</strong>:
          DOM manipulation, user interaction, networking, history traversal, timers, file IO,
          postMessage, etc. O browser tem liberdade de priorizar entre elas — por isso input
          tem prioridade sobre timers.
        </p>
        <StackFlow
          title="Uma iteração completa do event loop (simplificada)"
          accent={ACCENT}
          items={[
            {
              icon: '1️⃣',
              label: 'Pick a task',
              sub: 'Macrotask queue',
              detail: 'Browser escolhe uma task de alguma task queue (ex: timer expirado, evento de clique, mensagem). Apenas UMA task por iteration.',
              connector: 'executar',
            },
            {
              icon: '2️⃣',
              label: 'Run task to completion',
              sub: 'Síncrono',
              detail: 'Task é executada inteira (run-to-completion). JS não pode ser interrompido no meio. Por isso loops longos travam tudo.',
              connector: 'fim da task',
            },
            {
              icon: '3️⃣',
              label: 'Microtask checkpoint',
              sub: 'Drenar TODAS as microtasks',
              detail: 'Promise.then, queueMicrotask, mutation observer callbacks. Roda em loop até a fila esvaziar — novas microtasks adicionadas durante o checkpoint também rodam.',
              connector: 'se for rendering opportunity',
            },
            {
              icon: '4️⃣',
              label: 'Update the rendering',
              sub: 'rAF callbacks → style → layout → paint',
              detail: 'Roda no máximo uma vez por iteration, se há frame para entregar. Caso contrário pula direto para a próxima task.',
              connector: 'se ocioso',
            },
            {
              icon: '5️⃣',
              label: 'Idle period',
              sub: 'requestIdleCallback',
              detail: 'Se sobrou tempo antes do próximo vsync, browser pode rodar RIC callbacks com timeRemaining() indicando o budget.',
            },
          ]}
        />
        <Callout tone="info" icon="📚">
          A leitura definitiva é <InlineCode>html.spec.whatwg.org/#event-loop-processing-model</InlineCode>.
          Vídeo lendário: “In The Loop” por Jake Archibald (Chrome DevRel, JSConf.Asia 2018) —
          a melhor explicação visual jamais feita.
        </Callout>
      </Section>

      <Section title="Microtask vs Macrotask — exemplos concretos" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Fontes', 'Quando roda']}
          rows={[
            ['Macrotask', 'setTimeout/setInterval, fetch callback, evento DOM, postMessage, MessageChannel', 'Uma por iteração do loop'],
            ['Microtask', 'Promise.then/catch/finally, queueMicrotask, MutationObserver, await continuation', 'Drenam toda a fila após cada macrotask'],
            ['Animation frame', 'requestAnimationFrame', 'Antes do próximo paint, sincronizado com vsync (~16.67ms@60Hz, ~8.33ms@120Hz)'],
            ['Idle callback', 'requestIdleCallback', 'Quando browser está ocioso, com timeRemaining()'],
            ['Scheduler', 'scheduler.postTask, scheduler.yield', 'Conforme prioridade (user-blocking, user-visible, background)'],
          ]}
        />
        <CodeBlock lang="javascript" filename="ordering.js">{`console.log('1: sync start');

setTimeout(() => console.log('5: macrotask setTimeout'), 0);

Promise.resolve().then(() => {
  console.log('3: microtask promise');
  // microtasks adicionadas durante checkpoint TAMBÉM rodam
  Promise.resolve().then(() => console.log('4: microtask aninhada'));
});

queueMicrotask(() => console.log('3b: queueMicrotask'));

console.log('2: sync end');

// Saída:
// 1: sync start
// 2: sync end
// 3: microtask promise
// 3b: queueMicrotask
// 4: microtask aninhada       ← mesmo checkpoint!
// 5: macrotask setTimeout`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          <strong>Infinite microtask loop trava o browser.</strong> Se uma microtask agenda
          outra microtask que agenda outra microtask, o checkpoint nunca termina. Rendering,
          input, GC — tudo pausado. Use <InlineCode>setTimeout(0)</InlineCode> ou{' '}
          <InlineCode>scheduler.yield()</InlineCode> para sair da fila de microtasks.
        </Callout>
      </Section>

      <Section title="Async/await por dentro" accent={ACCENT}>
        <p>
          <InlineCode>await p</InlineCode> é açúcar para <InlineCode>p.then(continuation)</InlineCode>.
          A continuação da função é uma microtask agendada quando p resolve.
        </p>
        <CodeBlock lang="javascript" filename="await-microtask.js">{`async function run() {
  console.log('a');
  await Promise.resolve();
  console.log('b');         // microtask
  await Promise.resolve();
  console.log('c');         // microtask (2 ticks depois)
}

run();
console.log('d');

// Saída: a, d, b, c
// run() executa síncrono até o primeiro await,
// "b" e "c" são microtasks no checkpoint da macrotask atual.`}</CodeBlock>
        <Callout tone="tip" icon="💡">
          Loops sequenciais com await NÃO bloqueiam thread, mas não dão respiro para
          rendering/input — você está em microtasks o tempo todo. Para processar lista grande
          sem travar UI: <InlineCode>await scheduler.yield()</InlineCode> a cada N iterações.
        </Callout>
      </Section>

      <Section title="rAF vs RIC vs Scheduler" accent={ACCENT}>
        <DecisionBox
          scenario="Você tem 50k itens para processar e renderizar gradualmente"
          winner="Scheduler.postTask com priority='background' + yield"
          winnerColor={ACCENT}
          why="Scheduler API permite background priority (não compete com input), e scheduler.yield() devolve controle entre lotes mantendo posição na fila. Browser intercala rendering/input naturalmente."
          alternatives={[
            { name: 'requestIdleCallback', when: 'Trabalho realmente baixa-prioridade que pode demorar; sem garantia de timing' },
            { name: 'requestAnimationFrame', when: 'Apenas se cada batch resulta em mudança visual; outro caso desperdiça paint' },
            { name: 'setTimeout(0)', when: 'Fallback se Scheduler API não disponível (Safari < 17)' },
            { name: 'Web Worker', when: 'CPU-bound puro sem DOM — paraleliza de verdade' },
          ]}
        />
        <CodeBlock lang="javascript" filename="long-task-patterns.js">{`// ✅ MODERNO (Chrome 94+, em vias de tornar-se padrão)
async function processLargeList(items) {
  for (let i = 0; i < items.length; i++) {
    process(items[i]);
    // dá respiro a cada 100 itens
    if (i % 100 === 0) await scheduler.yield();
  }
}

// ✅ COMPATÍVEL (todos os browsers modernos)
async function processLargeListCompat(items) {
  for (let i = 0; i < items.length; i++) {
    process(items[i]);
    if (i % 100 === 0) await new Promise(r => setTimeout(r, 0));
  }
}

// ✅ Para animação visual sincronizada com vsync
function animate() {
  requestAnimationFrame((ts) => {
    updatePositions(ts);
    if (!finished) animate();
  });
}

// ✅ Trabalho de background (analytics, prefetch)
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && queue.length) {
    sendAnalytic(queue.shift());
  }
}, { timeout: 2000 });  // forçar execução em 2s mesmo se nunca ocioso

// ✅ Scheduler com prioridade explícita
scheduler.postTask(() => sendAnalytic(x), { priority: 'background' });
scheduler.postTask(() => animate(), { priority: 'user-visible' });
scheduler.postTask(() => handleInput(), { priority: 'user-blocking' });`}</CodeBlock>
      </Section>

      <Section title="Long Tasks e INP" accent={ACCENT}>
        <p>
          Em 2024 INP (Interaction to Next Paint) substituiu FID como Core Web Vital. INP mede
          a maior latência entre uma interação e o próximo paint. Tasks longas (&gt;50ms)
          aumentam INP — porque a interação fica enfileirada esperando.
        </p>
        <FlowDiagram
          title="Como long task derruba INP"
          accent={ACCENT}
          orientation="vertical"
          steps={[
            { icon: '👆', label: 'User clica', desc: 'Browser enfileira evento click' },
            { icon: '⏳', label: 'Task em curso (200ms)', desc: 'JS pesado segurando a thread' },
            { icon: '🚫', label: 'Click NÃO processado', desc: 'Browser não pode interromper task' },
            { icon: '✅', label: 'Task termina, click roda', desc: '200ms+ depois' },
            { icon: '🎨', label: 'Paint', desc: 'Mais 16.67ms até o próximo frame' },
            { icon: '💀', label: 'INP = 216ms', desc: 'Acima de 200ms = ruim' },
          ]}
        />
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Long task', v: '> 50ms (PerformanceObserver entryType: "longtask")' },
            { k: 'INP good', v: '≤ 200ms (p75 dos usuários)' },
            { k: 'INP needs improvement', v: '200–500ms' },
            { k: 'INP poor', v: '> 500ms' },
            { k: 'Estratégia', v: 'Quebrar tasks > 50ms com yield, mover CPU para Worker, evitar layout thrashing em handlers' },
          ]}
        />
      </Section>

      <Section title="Node.js: libuv event loop" accent={ACCENT}>
        <p>
          Node usa libuv com fases distintas: timers, pending callbacks, idle/prepare, poll, check
          (setImmediate), close. Microtasks (Promise) e <InlineCode>process.nextTick</InlineCode>{' '}
          rodam entre fases.
        </p>
        <Timeline
          accent={ACCENT}
          events={[
            { when: 'timers', label: 'setTimeout/setInterval expirados', detail: 'Apenas timers cujo delay já passou' },
            { when: 'pending', label: 'Callbacks de I/O pendentes', detail: 'Erros de TCP, etc' },
            { when: 'poll', label: 'I/O novo', detail: 'Onde o loop passa a maior parte do tempo bloqueado esperando eventos', highlight: true },
            { when: 'check', label: 'setImmediate', detail: 'Roda imediatamente após poll, ÚTIL para “depois de I/O atual”' },
            { when: 'close', label: 'Callbacks de fechamento', detail: 'socket.on(\'close\') etc' },
          ]}
        />
        <Callout tone="info" icon="🟢">
          Node: <InlineCode>process.nextTick</InlineCode> tem fila própria mais prioritária
          que microtasks (Promise). Drena antes. Por isso{' '}
          <InlineCode>process.nextTick</InlineCode> em loop trava o loop inteiro — semelhante
          ao loop infinito de microtask no browser.
        </Callout>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="`setTimeout(fn, 0)` realmente roda em 0ms?"
          a={
            <span>
              Não. HTML spec define mínimo de 4ms para timers aninhados (clamping). Browsers
              modernos também aplicam throttling em tabs em background (~1s). Para “dar respiro
              imediato” use <InlineCode>queueMicrotask</InlineCode> (mesma iteração) ou{' '}
              <InlineCode>MessageChannel</InlineCode> (próxima iteração, sem clamp).
            </span>
          }
        />
        <QAItem
          q="MutationObserver é microtask?"
          a={
            <span>
              Sim. Mutation Observer callbacks são entregues como microtasks — após mutações
              DOM, durante o próximo microtask checkpoint. Por isso são úteis para reagir a
              mudanças DOM sem race com renderização.
            </span>
          }
        />
        <QAItem
          q="`postMessage` vs `setTimeout(0)`?"
          a={
            <span>
              <InlineCode>postMessage</InlineCode> via MessageChannel cria task sem o clamp de
              4ms do setTimeout. É a técnica usada por bibliotecas (zone.js, React scheduler)
              para “next tick” real. Já se chamou “channel messaging hack”.
            </span>
          }
        />
        <QAItem
          q="Por que React 18+ usa scheduler próprio em vez de rAF?"
          a={
            <span>
              React Scheduler usa MessageChannel + prioridades simuladas, e em 2024+ adota{' '}
              <InlineCode>scheduler.postTask</InlineCode> onde disponível. rAF é caro de chamar
              só para “dar respiro” quando você não tem mudanças visuais. React precisa de
              prioridade e yield, não de sincronização com paint.
            </span>
          }
        />
      </Section>

      <Callout tone="success" icon="✅">
        Próximo: como o browser transforma seu JS+CSS+DOM em pixels — o rendering pipeline.
        Veja <InlineCode>rendering-pipeline-paint</InlineCode>.
      </Callout>
    </div>
  );
}
