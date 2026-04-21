import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('arrays-hashmaps-e-quando-importam');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a complexidade amortizada de get/put em hashmap?',
    options: [
      'O(n)',
      'O(1) amortizado no caso esperado; O(n) worst-case se hash for degenerado (todas keys colidem) ou load factor explodir',
      'Sempre O(log n)',
      'O(n²)',
    ],
    correct: 1,
    explanation: 'O(1) esperado requer: (1) hash uniformemente distribuído, (2) load factor controlado (resize quando n/capacidade > 0.75 em Java, 1.0 em V8). Atacante pode forçar O(n) via hash flooding (todas keys colidem). Libs modernas usam SipHash com seed aleatório pra mitigar.',
  },
  {
    question: 'Quando Map é preferível a Object em TS/JS?',
    options: [
      'Nunca',
      'Quando: (1) chaves não-string (number/object), (2) precisa de size, (3) iteração com ordem de inserção, (4) muitas inserções/remoções dinâmicas, (5) não quer colisão com prototype (Object has __proto__)',
      'Só com chaves string',
      'Map é obsoleto',
    ],
    correct: 1,
    explanation: 'Object foi "hashmap" legacy do JS. Map foi adicionado (ES2015) pra resolver: chaves arbitrárias (incluindo objetos), size O(1), iteração ordenada, não colisão com prototype. Performance em V8 é similar. Use Object pra config/estrutura fixa, Map pra dicionário dinâmico.',
  },
  {
    question: 'O que é "cache locality" e como arrays tiram vantagem?',
    options: [
      'Cache de CDN',
      'CPU lê memória em linhas de 64 bytes. Arrays são contíguos em memória, então iterar puxa próximos elementos "grátis" pro cache L1. Linked list salta por ponteiros, cada acesso pode ser cache miss',
      'Feature do browser',
      'Cache do navegador',
    ],
    correct: 1,
    explanation: 'Cache locality é por que iterar Array é 10-100x mais rápido que iterar LinkedList com mesmo N. Isso raramente importa em JS (objects não são contíguos mesmo em array) mas MUITO em C/Rust/Go. Em apps de latência crítica (game dev, HFT), você pensa em cache primeiro.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="arrays-hashmaps-e-quando-importam"
      title="Arrays, hashmaps e quando realmente importam"
      icon="🗂️"
      xp={45}
      readTime={11}
      trailName="Estruturas de Dados & Algoritmos"
      trailColor={accent}
      nextSlug="arvores-que-voce-realmente-usa"
      nextTitle="Árvores que você realmente usa (BST, heap, trie)"
      quiz={quiz}
    >
      <Section title="Array ops e suas complexidades reais" accent={accent}>
        <CodeBlock lang="typescript">{`// Ops O(1) amortizado no fim
arr.push(x), arr.pop()

// Ops O(n) — shiftam elementos
arr.shift(), arr.unshift(x), arr.splice(i, 0, x)

// Lookup O(1) por índice, O(n) por valor
arr[i]                  // O(1)
arr.indexOf(x)          // O(n) — pra grande n use Set
arr.includes(x)         // O(n)

// Slice e concat criam cópia — O(n)
arr.slice(0, 10)        // O(k) onde k = 10
arr.concat(other)       // O(n + m)`}</CodeBlock>
      </Section>

      <Section title="Hashmap — Map em JS" accent={accent}>
        <CodeBlock lang="typescript">{`const m = new Map<string, User>();

// Ops O(1) amortizado
m.set('id1', user);
m.get('id1');
m.has('id1');
m.delete('id1');
m.size;  // getter O(1)

// Iteração: ordem de inserção (ES2015+)
for (const [k, v] of m) { /* ... */ }

// Conversão
const obj = Object.fromEntries(m);
const arr = [...m.entries()];`}</CodeBlock>
        <Callout tone="info" icon="💡">
          <strong>Set</strong> é Map sem valor — <InlineCode>Set&lt;T&gt;</InlineCode> pra dedup. Padrão: <InlineCode>[...new Set(arr)]</InlineCode> pra unique preservando ordem.
        </Callout>
      </Section>

      <Section title="WeakMap/WeakSet — chaves coletáveis" accent={accent}>
        <CodeBlock lang="typescript">{`// WeakMap: chave é objeto; se objeto é GC'd, entrada some
const metadata = new WeakMap<HTMLElement, MetaData>();

function attach(el: HTMLElement, meta: MetaData) {
  metadata.set(el, meta);
}

// Quando el sai do DOM e não tem mais refs, entrada some automaticamente.
// Útil pra: cache por objeto sem memory leak, private fields via lexical scope.

// Limitações: não iterável (não tem .keys/.entries), não tem .size,
// só aceita objeto como chave.`}</CodeBlock>
      </Section>

      <Section title="Quando Object ainda vence Map" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>JSON serialization trivial (Object ↔ JSON; Map precisa conversão).</li>
          <li>Destructuring (<InlineCode>const {'{ name, age }'} = obj</InlineCode>).</li>
          <li>Config estático conhecido em compile time.</li>
          <li>Shape tipado com <InlineCode>Record&lt;K, V&gt;</InlineCode>.</li>
        </ul>
        <p>
          Regra: Object pra <em>tipos</em> (config, enum-like, shape fixo); Map pra <em>dicionários</em> dinâmicos.
        </p>
      </Section>

      <Section title="Hash collision — quando O(1) vira O(n)" accent={accent}>
        <p>
          Se muitas chaves colidem no mesmo bucket, lookup degrada pra O(k) no bucket. No pior caso (hash flooding attack: atacante escolhe keys que todas colidem), O(n). V8 usa SipHash com seed aleatório por processo, mitigando.
        </p>
        <p>
          Load factor (n/buckets) alto → mais colisões. V8 resize quando load factor passa limit. Rehashing é O(n) mas amortizado O(1).
        </p>
      </Section>
    </ModuleLayout>
  );
}
