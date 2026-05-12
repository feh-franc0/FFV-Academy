import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('web-workers-shared-memory');

const ACCENT = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença fundamental entre Dedicated Worker, Shared Worker e Service Worker?',
    options: [
      'Apenas naming convention — todos são equivalentes',
      'Dedicated: 1 worker por aba que o criou; Shared: compartilhado entre abas/iframes do mesmo origin; Service: proxy de rede entre origin e network, vive além do tempo de vida das abas',
      'Dedicated roda na CPU, Shared na GPU, Service na network card',
      'Apenas Dedicated tem acesso a postMessage',
    ],
    correct: 1,
    explanation:
      'Dedicated Worker: criado por uma página, morre quando ela fecha. Shared Worker: várias páginas do mesmo origin conectam ao mesmo worker via porta — útil para coordenar abas. Service Worker: registrado uma vez, persiste, intercepta requests de fetch para cache/offline. Cada um com use cases distintos. Ver MDN “Web Workers API” e “Service Worker API”.',
  },
  {
    question: 'Por que SharedArrayBuffer exige os headers COOP e COEP em 2026?',
    options: [
      'Apenas convenção de segurança recomendada',
      'Após Spectre (2018), SharedArrayBuffer foi desabilitado em todos os browsers; voltou em 2020 só sob “cross-origin isolation”: COOP (Cross-Origin-Opener-Policy: same-origin) + COEP (Cross-Origin-Embedder-Policy: require-corp). Garante isolamento de processo para evitar side-channel attacks',
      'COOP/COEP são apenas para browsers móveis',
      'Para suportar HTTP/3',
    ],
    correct: 1,
    explanation:
      'Spectre demonstrou timing attacks usando memória compartilhada. Browsers desabilitaram SAB em 2018. Em 2020+, voltou com requirement: cross-origin isolation. COOP isola opener/openee de outras origens; COEP requer que todas as subresources opt-in (CORP header). Sem ambos, `crossOriginIsolated` é false e SAB é null. Ver web.dev/articles/coop-coep.',
  },
  {
    question: 'O que são “transferable objects” em postMessage?',
    options: [
      'Objetos que podem ser modificados depois de enviados',
      'Objetos cuja propriedade pode ser TRANSFERIDA (não copiada) para o destinatário — ArrayBuffer, MessagePort, ImageBitmap, OffscreenCanvas. Após transferir, o lado origem perde acesso. Zero-copy entre threads',
      'Apenas strings podem ser transferidas',
      'Objetos com método .transfer() implementado',
    ],
    correct: 1,
    explanation:
      'postMessage por padrão usa structured clone — copia tudo (caro para buffers grandes). `postMessage(msg, [buffer])` lista de transferables move a ownership. Após transfer, o ArrayBuffer no lado origem fica com byteLength=0. Zero-copy é essencial para imagem/vídeo/audio processing em Worker. ImageBitmap, OffscreenCanvas são casos especiais úteis.',
  },
  {
    question: 'O que Atomics oferece sobre operações em SharedArrayBuffer?',
    options: [
      'Apenas performance — operações “normais” também funcionam',
      'Garantias de atomicidade (load/store atômicos), ordering (memory barriers), e wait/notify para sincronização entre threads. Equivalente a std::atomic em C++ ou java.util.concurrent.atomic',
      'Apenas para criptografia',
      'API legacy substituída por novos métodos em SharedArrayBuffer.prototype',
    ],
    correct: 1,
    explanation:
      'Sem Atomics, operações em SAB são unsafe — data races. Atomics.load/store garantem leitura/escrita atômica. Atomics.add/sub/and/or/xor são read-modify-write atômicos. Atomics.wait(ia, idx, val) bloqueia thread até notify; Atomics.notify acorda. Modelo é JavaScript Memory Model spec (TC39), equivalente a memory_order_seq_cst de C++.',
  },
  {
    question: 'Comlink (Google) facilita workers — o que ele faz?',
    options: [
      'Polyfill para Workers em browsers antigos',
      'Wrap mensagens postMessage em RPC proxy: você chama `worker.heavyTask(args)` e Comlink serializa/transmite/aguarda resposta como promise transparentemente. Elimina o boilerplate de postMessage + event listener',
      'Plugin Webpack para auto-bundling de workers',
      'Web framework como Next.js',
    ],
    correct: 1,
    explanation:
      'Comlink (github.com/GoogleChromeLabs/comlink) usa Proxy para criar interface RPC. `const worker = Comlink.wrap(new Worker(...))`; depois `await worker.fazAlgo(1, 2)` parece chamada local mas é mensagem ida-e-volta. Suporta callbacks (Comlink.proxy), classes, transferables. ~1KB. Use em qualquer worker não-trivial.',
  },
  {
    question: 'Quando NÃO usar Web Workers?',
    options: [
      'Trabalho < 50ms — overhead de serialização e startup supera o ganho',
      'Quando você precisa acessar DOM diretamente',
      'Trabalho pesado de CPU como image processing ou ML',
      'A e B estão corretos',
    ],
    correct: 3,
    explanation:
      'Workers NÃO têm acesso a DOM (sem window/document). Para tarefas curtas (<50ms), overhead de Worker (startup ~10ms, postMessage serialization) supera o trabalho. Use para: CPU-bound contínuo (parsing grande, image filtros, ML inference, crypto, compressão). NÃO use para: pequenas funções, código que precisa DOM, “otimização preventiva” sem profile.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="web-workers-shared-memory"
      title="Web Workers + SharedArrayBuffer: paralelismo real"
      icon="🧵"
      xp={70}
      readTime={14}
      trailName="Browser & Web Internals Profundo"
      trailColor={ACCENT}
      nextSlug="service-workers-offline"
      nextTitle="Service Workers: offline-first, background sync, push"
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
        JavaScript é single-threaded — mas isso é só o main thread. Web Workers permitem
        threads de verdade, com isolation memory. SharedArrayBuffer + Atomics quebram esse
        isolamento (com cuidado) para zero-copy parallelism. Em 2026, COOP/COEP destravaram
        de novo o uso após o exílio do Spectre.
      </p>

      <Section title="Os 3 tipos de workers" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Escopo', 'Use case']}
          rows={[
            ['Dedicated Worker', 'Uma página, vida atrelada', 'CPU pesado isolado: image filters, ML, parsing'],
            ['Shared Worker', 'Várias abas mesmo origin', 'Coordenar abas, single WebSocket compartilhada'],
            ['Service Worker', 'Origin inteiro, persiste', 'Offline cache, push, background sync (módulo separado)'],
            ['Worklets (Audio/Paint/Animation)', 'Threads específicas de pipeline', 'AudioWorklet para áudio low-latency, PaintWorklet para CSS Painting API'],
          ]}
        />
        <Callout tone="info" icon="📚">
          Spec: <InlineCode>html.spec.whatwg.org/#workers</InlineCode>. MDN guides são
          excelentes. Para padrões: “Off the main thread” por Surma e Jake Archibald
          (HTTP 203 podcast / web.dev).
        </Callout>
      </Section>

      <Section title="Dedicated Worker — o caso comum" accent={ACCENT}>
        <CodeBlock lang="javascript" filename="main.js">{`// main thread
const worker = new Worker(new URL('./heavy.worker.js', import.meta.url), {
  type: 'module',  // ES modules em workers (Chrome 80+, Safari 15+)
});

worker.postMessage({ cmd: 'process', data: bigArray });

worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

worker.onerror = (e) => {
  console.error('Worker error:', e.message);
};

// Para terminar:
worker.terminate();`}</CodeBlock>
        <CodeBlock lang="javascript" filename="heavy.worker.js">{`// worker scope — sem 'window', 'document', mas tem 'self', fetch, WebSocket, IndexedDB
self.onmessage = async (e) => {
  const { cmd, data } = e.data;
  if (cmd === 'process') {
    const result = heavyComputation(data);
    self.postMessage(result);
  }
};

function heavyComputation(arr) {
  // CPU-bound puro — não trava UI do main thread
  return arr.reduce((acc, x) => acc + Math.sqrt(x), 0);
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Worker NÃO tem acesso a DOM. Tem: <InlineCode>self</InlineCode>,{' '}
          <InlineCode>fetch</InlineCode>, <InlineCode>WebSocket</InlineCode>,{' '}
          <InlineCode>IndexedDB</InlineCode>, <InlineCode>crypto.subtle</InlineCode>,{' '}
          <InlineCode>OffscreenCanvas</InlineCode>, importScripts/ES modules. Não tem:
          window, document, localStorage, alert.
        </Callout>
      </Section>

      <Section title="Transferable objects — zero-copy" accent={ACCENT}>
        <p>
          postMessage por padrão clona via structured clone — caro para buffers grandes. Use
          transferables para mover ownership sem cópia.
        </p>
        <CodeBlock lang="javascript" filename="transferables.js">{`// main → worker: transferir buffer (zero-copy)
const buffer = new ArrayBuffer(100 * 1024 * 1024);  // 100MB
worker.postMessage({ buffer }, [buffer]);  // ← segundo arg: lista de transferables
console.log(buffer.byteLength);  // 0 — main perdeu acesso!

// worker recebe normalmente
self.onmessage = (e) => {
  const { buffer } = e.data;
  const view = new Uint8Array(buffer);
  // process...
  // devolver:
  self.postMessage({ buffer }, [buffer]);
};

// Outros transferables úteis:
// - MessagePort (canal direto)
// - ImageBitmap (decoded image, sem re-decode)
// - OffscreenCanvas (rendering em worker)
// - ReadableStream / WritableStream`}</CodeBlock>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Structured clone', v: 'Copia tudo. Lento para grandes. Default.' },
            { k: 'Transferable', v: 'Move ownership. Zero-copy. Source perde acesso.' },
            { k: 'SharedArrayBuffer', v: 'Compartilhado entre threads. Mutação visível em ambos. Requer COOP/COEP.' },
          ]}
        />
      </Section>

      <Section title="SharedArrayBuffer + Atomics" accent={ACCENT}>
        <p>
          Para verdadeira memória compartilhada (não transferida), use SharedArrayBuffer. Mas
          atenção: sem Atomics, é land of data races.
        </p>
        <CodeBlock lang="javascript" filename="server-headers.txt">{`# Requeridos pelo browser para crossOriginIsolated = true
# Sem isso, SharedArrayBuffer é null em produção

Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp

# Subresources (imagens externas, iframes) precisam CORP:
Cross-Origin-Resource-Policy: cross-origin

# No JS, verificar:
if (self.crossOriginIsolated) {
  // OK, SAB disponível
}`}</CodeBlock>
        <CodeBlock lang="javascript" filename="atomics.js">{`// Cria SAB compartilhado entre main e worker
const sab = new SharedArrayBuffer(1024);
const ia = new Int32Array(sab);

worker.postMessage({ sab });  // mesma ref, não cópia/transfer

// main
Atomics.store(ia, 0, 42);     // store atômico
const v = Atomics.load(ia, 0); // load atômico
Atomics.add(ia, 1, 1);         // RMW atômico

// Sincronização: worker espera, main acorda
// worker:
Atomics.wait(ia, 0, 0);       // bloqueia enquanto ia[0] === 0

// main:
Atomics.store(ia, 0, 1);
Atomics.notify(ia, 0, 1);     // acorda 1 thread esperando

// ⚠️ Atomics.wait NÃO pode ser usado no main thread (bloquearia UI).
// Use Atomics.waitAsync (retorna promise) em main.
const { async, value } = Atomics.waitAsync(ia, 0, 0);
if (async) value.then(result => /* ... */);`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Compartilhar mutável entre threads é difícil em qualquer linguagem. Erros comuns:
          ABA problem, memory ordering bugs, livelock. Para 99% dos casos, prefira
          postMessage + transferables. SAB+Atomics é para casos extremos: WASM threads, ring
          buffers de audio, ML inference paralela.
        </Callout>
      </Section>

      <Section title="Comlink — ergonomia decente" accent={ACCENT}>
        <p>
          postMessage manual é tedioso. Comlink (Google Chrome Labs) transforma em RPC com
          proxy.
        </p>
        <CodeBlock lang="javascript" filename="with-comlink.js">{`// worker.js
import * as Comlink from 'comlink';

const api = {
  async heavyTask(data) {
    return process(data);
  },
  async stream(callback) {
    for (let i = 0; i < 100; i++) {
      callback(i);
      await sleep(10);
    }
  }
};

Comlink.expose(api);

// main.js
import * as Comlink from 'comlink';

const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
const api = Comlink.wrap(worker);

// Use como chamada local — mas é async (postMessage por baixo)
const result = await api.heavyTask([1, 2, 3]);

// Callback funciona via Comlink.proxy
await api.stream(Comlink.proxy((i) => console.log(i)));`}</CodeBlock>
      </Section>

      <Section title="Worker pools" accent={ACCENT}>
        <p>
          Criar um worker tem custo (~10ms startup, memória). Para tarefas em lote, pool de
          workers é o padrão.
        </p>
        <CodeBlock lang="typescript" filename="worker-pool.ts">{`class WorkerPool<T, R> {
  private workers: Worker[];
  private queue: { args: T; resolve: (r: R) => void }[] = [];
  private busy: Set<Worker> = new Set();

  constructor(url: URL, size = navigator.hardwareConcurrency ?? 4) {
    this.workers = Array.from({ length: size }, () => new Worker(url, { type: 'module' }));
  }

  exec(args: T): Promise<R> {
    return new Promise((resolve) => {
      this.queue.push({ args, resolve });
      this.drain();
    });
  }

  private drain() {
    for (const w of this.workers) {
      if (this.busy.has(w) || this.queue.length === 0) continue;
      const job = this.queue.shift()!;
      this.busy.add(w);
      const onMessage = (e: MessageEvent<R>) => {
        w.removeEventListener('message', onMessage);
        this.busy.delete(w);
        job.resolve(e.data);
        this.drain();
      };
      w.addEventListener('message', onMessage);
      w.postMessage(job.args);
    }
  }
}

// uso
const pool = new WorkerPool<number[], number>(
  new URL('./compute.worker.js', import.meta.url)
);
const results = await Promise.all(chunks.map(c => pool.exec(c)));`}</CodeBlock>
        <Callout tone="tip" icon="💡">
          <InlineCode>navigator.hardwareConcurrency</InlineCode> dá número de cores lógicos —
          bom default para tamanho de pool. Em mobile, cuidado: criar 8 workers pode esgotar
          memória.
        </Callout>
      </Section>

      <Section title="OffscreenCanvas — rendering em worker" accent={ACCENT}>
        <p>
          OffscreenCanvas permite Canvas2D/WebGL/WebGPU em worker — útil para renderizar
          gráficos pesados (charts, mapas, jogos) sem competir com main thread.
        </p>
        <CodeBlock lang="javascript" filename="offscreen.js">{`// main.js
const canvas = document.querySelector('canvas');
const offscreen = canvas.transferControlToOffscreen();
worker.postMessage({ canvas: offscreen }, [offscreen]);

// worker.js
self.onmessage = (e) => {
  const canvas = e.data.canvas;
  const ctx = canvas.getContext('2d');
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ...draw...
    requestAnimationFrame(render);  // rAF funciona em worker!
  }
  render();
};`}</CodeBlock>
      </Section>

      <Section title="Decidir entre as opções" accent={ACCENT}>
        <DecisionBox
          scenario="Você precisa processar 100MB de logs no client antes de visualizar"
          winner="Dedicated Worker + transferable ArrayBuffer + Comlink"
          winnerColor={ACCENT}
          why="CPU-bound puro, sem DOM. Transferable evita cópia de 100MB. Comlink dá ergonomia de RPC. Não vale SAB nesse caso — não precisa de mutação compartilhada concorrente."
          alternatives={[
            { name: 'WASM em worker', when: 'Se algoritmo é puramente numérico/string-bound' },
            { name: 'Stream + pipe', when: 'Se dados vêm de network — processar em chunks ReadableStream em worker' },
            { name: 'SAB + Atomics', when: 'Precisa de coordenação entre múltiplos workers escrevendo no mesmo buffer' },
          ]}
        />
        <FlowDiagram
          title="Quando usar cada ferramenta"
          accent={ACCENT}
          orientation="vertical"
          steps={[
            { icon: '⚡', label: 'Tarefa < 50ms', desc: 'Não use worker — overhead supera' },
            { icon: '🧵', label: '50ms–segundos, isolado', desc: 'Dedicated Worker + Comlink' },
            { icon: '🔀', label: 'Paralelizar entre N cores', desc: 'WorkerPool com hardwareConcurrency' },
            { icon: '🔄', label: 'Compartilhar mutação contínua', desc: 'SharedArrayBuffer + Atomics' },
            { icon: '🎨', label: 'Renderização pesada', desc: 'OffscreenCanvas em worker' },
            { icon: '🌐', label: 'Coordenar abas', desc: 'SharedWorker ou BroadcastChannel' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Vite/Next.js suportam workers nativamente?"
          a={
            <span>
              Sim. Vite: <InlineCode>?worker</InlineCode> import (<InlineCode>{`import MyW from './w?worker'`}</InlineCode>).
              Next.js suporta worker via <InlineCode>new Worker(new URL('./w.js', import.meta.url))</InlineCode>{' '}
              em client components.
            </span>
          }
        />
        <QAItem
          q="Por que Atomics.wait NÃO funciona no main thread?"
          a={
            <span>
              Bloquearia a UI por tempo indeterminado. Browsers explicitamente proíbem (TypeError).
              Use <InlineCode>Atomics.waitAsync</InlineCode> que retorna promise resolvida quando
              notify chega.
            </span>
          }
        />
        <QAItem
          q="Workers podem importar npm packages?"
          a={
            <span>
              Com <InlineCode>type: 'module'</InlineCode>, sim — ES imports funcionam normalmente.
              Bundlers (Vite/Webpack) tratam workers como entry points separados.
            </span>
          }
        />
        <QAItem
          q="Como debug worker?"
          a={
            <span>
              Chrome DevTools mostra worker como “target” separado em Sources/Network. Breakpoints,
              console.log, profiling funcionam. <InlineCode>chrome://inspect</InlineCode> →
              dedicated workers.
            </span>
          }
        />
      </Section>

      <Callout tone="success" icon="✅">
        Próximo: o irmão especial dos workers, que vive além das abas e intercepta network.
        Veja <InlineCode>service-workers-offline</InlineCode>.
      </Callout>
    </div>
  );
}
