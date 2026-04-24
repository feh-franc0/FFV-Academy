import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('performance-em-node');

const accent = '#3178c6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o papel do libuv no Node.js?',
    options: [
      'Substituir o V8',
      'Implementar o event loop e a thread pool que faz I/O não-bloqueante em syscalls bloqueantes (fs, DNS, etc.)',
      'Gerenciar cache de módulos',
      'Compilar TypeScript',
    ],
    correct: 1,
    explanation: 'libuv é a lib C que dá ao Node seu event loop. Algumas syscalls (fs, getaddrinfo, crypto) são bloqueantes no SO — libuv roda em thread pool (default 4 threads) pra não travar o loop principal. Entender libuv é entender por que Node parece "single-threaded" mas tem paralelismo real em I/O.',
  },
  {
    question: 'O que é "backpressure" em streams?',
    options: [
      'Um tipo de compressão',
      'Quando o consumer é mais lento que o producer — pipeline precisa pausar o producer pra não estourar memória',
      'Latência do SSL',
      'Cache de rede',
    ],
    correct: 1,
    explanation: 'Se você lê arquivo grande rápido e escreve devagar (ex: upload pra S3 lento), o producer lota buffer. Backpressure é o mecanismo que para o producer quando consumer não dá conta. Use pipeline() em vez de pipe() — pipeline trata backpressure + erros + cleanup automaticamente.',
  },
  {
    question: 'Quando usar worker_threads em vez de async/await?',
    options: [
      'Sempre — é mais rápido',
      'Quando a tarefa é CPU-bound (ex: parse grande, crypto, compressão) — async não ajuda porque não há I/O pra aguardar',
      'Só em macOS',
      'Nunca — usar apenas em Python',
    ],
    correct: 1,
    explanation: 'async só resolve I/O. Se o código trava a CPU (loop pesado, hash grande), o event loop congela e toda a app trava. worker_threads roda em thread paralela, comunica por postMessage. Use pra CPU-bound; pra I/O basta async.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="performance-em-node"
      title="Performance em Node: event loop, streams e backpressure"
      icon="🚀"
      xp={65}
      readTime={15}
      trailName="TypeScript Profissional"
      trailColor={accent}
      nextSlug="monorepo-pnpm-turbo"
      nextTitle="Monorepo profissional: pnpm workspaces + Turbo + shared configs"
      quiz={quiz}
    >
      <Section title="Event loop em 60 segundos" accent={accent}>
        <p>
          Node roda <strong>um</strong> event loop que alterna entre fases:
        </p>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>timers</strong> — <InlineCode>setTimeout</InlineCode>, <InlineCode>setInterval</InlineCode></li>
          <li><strong>pending callbacks</strong> — I/O adiados</li>
          <li><strong>poll</strong> — I/O novos (onde Node passa mais tempo)</li>
          <li><strong>check</strong> — <InlineCode>setImmediate</InlineCode></li>
          <li><strong>close</strong> — cleanup de handles</li>
        </ul>
        <p>
          Entre cada fase, <InlineCode>process.nextTick</InlineCode> e microtasks (Promises) rodam. Bloquear qualquer uma dessas fases trava tudo.
        </p>
      </Section>

      <Section title="Sync vs async FS" accent={accent}>
        <CodeBlock lang="typescript">{`// ❌ bloqueia event loop — requests param
const data = fs.readFileSync('huge.json');

// ✅ thread pool do libuv cuida
const data = await fs.promises.readFile('huge.json');

// ✅✅ stream: não carrega tudo na memória
const stream = fs.createReadStream('huge.json');
for await (const chunk of stream) { /* processa */ }`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Sync FS em código de request é crime comum. Seu P99 vai explodir porque uma leitura lenta trava TODOS os requests concorrentes.
        </Callout>
      </Section>

      <Section title="Streams e backpressure" accent={accent}>
        <CodeBlock lang="typescript">{`import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';

// pipeline: composição com backpressure + erro + cleanup
await pipeline(
  createReadStream('input.log'),
  createGzip(),
  createWriteStream('input.log.gz'),
);

// Transform stream custom
import { Transform } from 'node:stream';
const upper = new Transform({
  transform(chunk, _enc, cb) {
    cb(null, chunk.toString().toUpperCase());
  },
});`}</CodeBlock>
      </Section>

      <Section title="CPU-bound: workers" accent={accent}>
        <CodeBlock lang="typescript">{`// main.ts
import { Worker } from 'node:worker_threads';
const w = new Worker('./hash-worker.js');
w.postMessage({ data });
w.on('message', result => console.log(result));

// hash-worker.js
import { parentPort } from 'node:worker_threads';
import { createHash } from 'node:crypto';
parentPort?.on('message', ({ data }) => {
  const hash = createHash('sha256').update(data).digest('hex');
  parentPort?.postMessage(hash);
});`}</CodeBlock>
      </Section>

      <Section title="Ferramentas pra diagnóstico" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><InlineCode>node --inspect</InlineCode> + Chrome DevTools — profiler, heap snapshot.</li>
          <li><InlineCode>clinic.js</InlineCode> (clinic doctor/flame/bubbleprof) — diagnóstico automatizado de gargalos.</li>
          <li><InlineCode>0x</InlineCode> — flamegraphs.</li>
          <li>Built-in perf hooks: <InlineCode>performance.now()</InlineCode>, <InlineCode>performance.mark()</InlineCode>.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
