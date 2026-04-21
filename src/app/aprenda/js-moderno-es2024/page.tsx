import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('js-moderno-es2024');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que preferir structuredClone() a JSON.parse(JSON.stringify(x))?',
    options: [
      'Não precisa',
      'Porque structuredClone preserva tipos que JSON perde: Date, Map, Set, ArrayBuffer, TypedArray, RegExp, Error, e até referências circulares. JSON stringify corrompe Date em string e explode em circular. structuredClone é nativo desde 2022, zero dependência de lodash.cloneDeep',
      'É mais lento',
      'Só Node',
    ],
    correct: 1,
    explanation: 'JSON hack era gambiarra: corrompe Date, perde undefined, explode em circular, não preserva Map/Set. structuredClone() nativo faz deep clone correto em ~100-200ns para objetos pequenos, sem deps. Pra maioria dos casos em produto, substitui lodash.cloneDeep.',
  },
  {
    question: 'O que toSorted, toReversed, toSpliced resolvem?',
    options: [
      'Nada novo',
      'Métodos de Array imutáveis: retornam cópia modificada em vez de mutar o array original. arr.sort() muta; arr.toSorted() não. Essencial em código reativo (React, Svelte, Solid) onde mutar estado é pegadinha. Disponível desde 2023',
      'São obsoletos',
      'Só TypeScript',
    ],
    correct: 1,
    explanation: 'Array.prototype.sort/reverse/splice sempre mutaram o array — fonte de bugs em código reativo. ES2023 trouxe as versões imutáveis: toSorted, toReversed, toSpliced, with. Equivalem a [...arr].sort() sem a cópia manual. Código mais claro e sem mutação acidental.',
  },
  {
    question: 'O que Temporal API resolve que Date nunca resolveu?',
    options: [
      'Nada',
      'Date tem problemas clássicos: month 0-indexed, mutável, timezone-naive, math de data frágil. Temporal (ES2025 stage 4) traz Temporal.PlainDate, Temporal.ZonedDateTime, Temporal.Duration tipados e imutáveis. Soma/subtração de datas correta, timezone first-class. Fim do moment.js/date-fns para a maioria dos casos',
      'Só estilo',
      'É Node-only',
    ],
    correct: 1,
    explanation: 'Date é um acidente preservado por retrocompatibilidade. Temporal (polyfill @js-temporal/polyfill) corrige tudo: immutable, type-safe, timezone-aware, aritmética correta. Implementação nativa em Firefox e Safari; Chrome atrás. Para código novo, comece com Temporal + polyfill — migração para nativo é trivial.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="js-moderno-es2024"
      title="JS moderno: ES2024+, modules, async sem pegadinha"
      icon="🧩"
      xp={55}
      readTime={13}
      trailName="Frontend Moderno — HTML, CSS, JS e React"
      trailColor={accent}
      nextSlug="react-fiber-commit-phase"
      nextTitle="React fiber + commit phase: reatividade real"
      quiz={quiz}
    >
      <Section title="JS não parou em ES6" accent={accent}>
        <p>
          Quem programa JS olhando só ES2015 perde ferramentas importantes. De 2020 para cá a linguagem ganhou top-level await, optional chaining, nullish coalescing, structuredClone, Array métodos imutáveis, Set methods, WeakRef, Temporal (stage 4). Este módulo é tour prático do que vale adotar agora em 2026.
        </p>
      </Section>

      <Section title="Modules nativos (ESM) em todos os lados" accent={accent}>
        <CodeBlock lang="html">{`<!-- Browser: tipo module dá ESM + strict mode + deferred automatic -->
<script type="module" src="./app.js"></script>

<!-- Import maps: aliasing sem bundler -->
<script type="importmap">
  {
    "imports": {
      "lit": "https://esm.sh/lit@3",
      "@/": "/src/"
    }
  }
</script>`}</CodeBlock>
        <CodeBlock lang="js">{`// app.js — Node 20+ e Bun rodam ESM nativo
import { readFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';

// Top-level await: permite aguardar em módulo sem IIFE async
const config = JSON.parse(await readFile('./config.json', 'utf8'));
await sleep(100);`}</CodeBlock>
      </Section>

      <Section title="Async correto (e os 3 erros clássicos)" accent={accent}>
        <CodeBlock lang="js">{`// ❌ Erro 1: forEach com async não aguarda
users.forEach(async (u) => { await save(u); });
// forEach ignora a promise retornada. Loop termina antes dos saves.

// ✅ Correto: for...of + await sequencial
for (const u of users) await save(u);

// ✅ Paralelo controlado: Promise.all + map
await Promise.all(users.map((u) => save(u)));

// ✅ Paralelo com concorrência limitada
import pLimit from 'p-limit';
const limit = pLimit(5);
await Promise.all(users.map((u) => limit(() => save(u))));

// ❌ Erro 2: try/catch mal posicionado engole erro da Promise
try {
  return users.map(async (u) => JSON.parse(u.json)); // array de promises!
} catch (e) { /* nunca pega */ }

// ❌ Erro 3: Promise constructor onde já existe async
const p = new Promise(async (resolve, reject) => { /* anti-pattern */ });
// Funções async JÁ retornam promise. Não embrulhe.

// ✅ Promise.allSettled quando quer TODOS os resultados, sucesso ou falha
const results = await Promise.allSettled(tasks);
for (const r of results) {
  if (r.status === 'fulfilled') use(r.value);
  else report(r.reason);
}`}</CodeBlock>
      </Section>

      <Section title="structuredClone + Array immutable methods" accent={accent}>
        <CodeBlock lang="js">{`// Deep clone nativo, preserva Date, Map, Set, circular
const copy = structuredClone(state);

// Array sem mutar original (ES2023)
const sorted = items.toSorted((a, b) => a.price - b.price);
const reversed = items.toReversed();
const replaced = items.with(2, newItem);                 // cópia com index 2 alterado
const trimmed = items.toSpliced(0, 1);                   // remove primeiro sem mutar

// .at(-1) em vez de arr[arr.length - 1]
const last = items.at(-1);
const penultimo = items.at(-2);

// .findLast / .findLastIndex (ES2023)
const errosRecentes = logs.findLast((l) => l.level === 'error');

// Set ops (ES2025)
const inter = setA.intersection(setB);
const uni = setA.union(setB);
const diff = setA.difference(setB);
const sub = setA.isSubsetOf(setB);`}</CodeBlock>
      </Section>

      <Section title="Temporal: data séria" accent={accent}>
        <CodeBlock lang="ts">{`import { Temporal } from '@js-temporal/polyfill';
// ou Temporal nativo em Firefox/Safari (checar)

// PlainDate: só a data, sem timezone
const hoje = Temporal.Now.plainDateISO();      // 2026-04-19
const amanha = hoje.add({ days: 1 });

// Duration: aritmética segura
const duracao = Temporal.Duration.from({ hours: 2, minutes: 30 });
const depois = Temporal.Now.instant().add(duracao);

// ZonedDateTime: com timezone explícito
const saoPaulo = Temporal.ZonedDateTime.from({
  year: 2026, month: 4, day: 19, hour: 14,
  timeZone: 'America/Sao_Paulo',
});
const emTokyo = saoPaulo.withTimeZone('Asia/Tokyo');

// Comparação correta
if (Temporal.PlainDate.compare(hoje, dueDate) > 0) {
  console.log('vencida');
}`}</CodeBlock>
      </Section>

      <Section title="Pattern matching pobres: switch + tagged unions" accent={accent}>
        <CodeBlock lang="ts">{`type Event =
  | { type: 'click'; x: number; y: number }
  | { type: 'keydown'; key: string }
  | { type: 'scroll'; top: number };

function handle(e: Event) {
  switch (e.type) {
    case 'click': return onClick(e.x, e.y);
    case 'keydown': return onKey(e.key);
    case 'scroll': return onScroll(e.top);
    default: {
      const _never: never = e; // TS garante exaustividade em compile time
      return _never;
    }
  }
}`}</CodeBlock>
      </Section>

      <Section title="Workers: CPU-bound fora do main thread" accent={accent}>
        <CodeBlock lang="js">{`// Main thread
const worker = new Worker(new URL('./heavy.js', import.meta.url), { type: 'module' });
worker.postMessage({ data: largePayload });
worker.onmessage = (e) => render(e.data);

// heavy.js (module worker)
self.onmessage = (e) => {
  const result = expensiveComputation(e.data);
  // Transferir ArrayBuffer ao invés de copiar
  self.postMessage(result.buffer, [result.buffer]);
};`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Qualquer processamento &gt;16ms que bloqueie UI (parse grande, crypto, compressão) deve ir para Worker. Main thread existe para interação — é regra, não otimização exótica.
        </Callout>
      </Section>

      <Section title="Checklist de adoção" accent={accent}>
        <Callout tone="success" icon="✅">
          Adote já: ESM nativo, top-level await, structuredClone, Array imutáveis (toSorted, with, at), Promise.allSettled, Workers para CPU-bound. Migre gradualmente para Temporal (polyfill hoje, nativo amanhã). Saiba os 3 erros de async (forEach async, new Promise(async), try/catch fora do await) — são 50% dos bugs em review.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
