import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('algoritmos-de-string');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que regex ruim pode travar servidor (ReDoS)?',
    options: [
      'Regex é lento inerentemente',
      'Regex com backtracking catastrófico (ex: nested quantifiers "(a+)+") pode ter complexidade EXPONENCIAL em input malicioso. Atacante envia string que força exploração exaustiva',
      'Apenas em Python',
      'Regex não é Turing-complete',
    ],
    correct: 1,
    explanation: 'ReDoS (Regular expression DoS) é ataque real. `/^(a+)+$/` com input "aaaa...aaaa!" explode. Solução: libs com engine RE2 (Google) que garante linear, evitar catastrophic backtracking. Lint: eslint-plugin-security detecta. Timeout regex em user input.',
  },
  {
    question: 'Quando usar edit distance vs string contains?',
    options: [
      'Mesma coisa',
      'contains: match exato de substring (O(n+m) com Boyer-Moore). Edit distance: quão "parecidas" duas strings são, permitindo typos — "você quis dizer X?" com threshold',
      'Edit distance é mais rápido',
      'Nenhum deles serve',
    ],
    correct: 1,
    explanation: 'contains: "abc" em "xabcy"? sim/não. Edit distance: "abc" vs "abd" = 1 edit; útil pra fuzzy match de nomes, autocorreção de username. Libs: fuse.js, fast-fuzzy. Postgres: pg_trgm pra fuzzy search direto no DB.',
  },
  {
    question: 'O que é suffix array?',
    options: [
      'Hack específico de suffix',
      'Array de índices que representa TODOS os sufixos de uma string em ordem lexicográfica — permite substring search em O(m log n) e operações como longest common substring eficientemente',
      'Apenas teoria',
      'Tipo de regex',
    ],
    correct: 1,
    explanation: 'Suffix array é estrutura fundamental em text indexing. Com LCP (longest common prefix) array associado, resolve substring search, longest repeated substring, LCS em múltiplas strings. Bioinformática usa muito (genoma tem muita repetição).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="algoritmos-de-string"
      title="Algoritmos de string: substring, regex internals e fuzzy"
      icon="🔤"
      xp={45}
      readTime={11}
      trailName="Estruturas de Dados & Algoritmos"
      trailColor={accent}
      nextSlug="sorting-real"
      nextTitle="Sorting real: timsort, quickselect e por que Array.sort basta"
      quiz={quiz}
    >
      <Section title="Substring search na lib padrão" accent={accent}>
        <p>
          <InlineCode>str.indexOf(needle)</InlineCode> em V8 moderno usa Two-Way (variante de Boyer-Moore) — O(n+m) no caso bom. Naïve seria O(n*m). Na prática, raramente você implementa — use a lib.
        </p>
      </Section>

      <Section title="Regex: NFA vs DFA" accent={accent}>
        <p>
          JS/Python/Java regex usa <strong>NFA com backtracking</strong> — poderoso (backreferences, lookahead) mas suscetível a ReDoS. Go/RE2 usa <strong>DFA</strong> — sem backreferences, mas garante linear time. Rust tem <InlineCode>regex</InlineCode> crate baseado em RE2.
        </p>
        <CodeBlock lang="typescript">{`// ❌ ReDoS — "(a+)+" é catastrófico
/^(a+)+$/.test('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!');  // ~2 segundos!

// ✅ Regex simples linear
/^a+$/.test('aaaa...');  // instantâneo

// Timeout em user regex:
function safeMatch(pattern: string, input: string, timeoutMs = 100): boolean {
  // Em Node: vm.runInNewContext com timeout
  // Em prod: use re2-wasm ou servidor separado
}`}</CodeBlock>
      </Section>

      <Section title="Fuzzy matching em TS" accent={accent}>
        <CodeBlock lang="typescript">{`import Fuse from 'fuse.js';

const list = [
  { text: 'Fernando Franco Valle' },
  { text: 'Fernanda Silva' },
  { text: 'Ferreira' },
];

const fuse = new Fuse(list, {
  keys: ['name'],
  threshold: 0.4,  // 0 = exato, 1 = tudo
});

fuse.search('fernano valle');
// Match "Fernando Franco Valle" mesmo com typo`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Pra fuzzy em grande escala, delegar ao DB: Postgres <InlineCode>pg_trgm</InlineCode> com GIN index. Elasticsearch com fuzzy query. SQLite FTS5.
        </Callout>
      </Section>

      <Section title="Quando escrever algoritmo de string do zero" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Nunca em produção web típica.</li>
          <li>Raramente em infra (parsing de log custom em escala).</li>
          <li>Às vezes em ferramentas (linter, bundler — aí use Rust/Go).</li>
          <li>Bioinformática/NLP research — aí sim, mas ferramentas especializadas já existem.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
