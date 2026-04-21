import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('sorting-real');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que V8 (Node/Chrome) usa Timsort em vez de QuickSort?',
    options: [
      'Timsort é mais simples',
      'Timsort é STABLE (preserva ordem de iguais), detecta runs pré-ordenadas e é quase-linear em input parcialmente ordenado — cenários comuns em código real',
      'Quicksort não existe em JS',
      'Timsort é mais rápido em todos os casos',
    ],
    correct: 1,
    explanation: 'Timsort (2002, Python) é hybrid: identifica "runs" ordenadas no input, merge-ordena. Em input random é O(n log n); em input quase-sorted é O(n). Stable (empates mantêm ordem — crítico pra UI). QuickSort rápido mas não stable e worst-case O(n²).',
  },
  {
    question: 'Quando quickselect vence sort completo?',
    options: [
      'Nunca',
      'Quando você só precisa de TOP-K ou MEDIAN — quickselect é O(n) em vez de O(n log n) do sort completo; escolha um pivot e recursa só no lado que importa',
      'Em array pequeno',
      'Em array já ordenado',
    ],
    correct: 1,
    explanation: 'Quickselect = quicksort modificado que só desce no lado que contém o k-ésimo. Average O(n). Uso típico: top-10 queries lentas, mediana de latência. Na prática, para K pequeno: use min-heap de tamanho K (O(n log k)).',
  },
  {
    question: 'Quando counting/radix sort ganham de comparisons sorts?',
    options: [
      'Nunca — O(n log n) é ótimo',
      'Quando dados têm range pequeno/fixo (ex: integers 0-1000, ou strings fixas) — counting é O(n+k), radix é O(n·d). Ignoram o limite log n porque não comparam',
      'Em strings aleatórias',
      'Em structs complexos',
    ],
    correct: 1,
    explanation: 'O(n log n) é lower bound para COMPARISON sort. Counting/radix não comparam — usam info do dado. Counting: array contador indexado pelo valor. Uso: sort de ages (0-150), prioridades fixas, IPs. Em dados arbitrários, não aplicam.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sorting-real"
      title="Sorting real: timsort, quickselect e por que Array.sort basta"
      icon="🔢"
      xp={40}
      readTime={10}
      trailName="Estruturas de Dados & Algoritmos"
      trailColor={accent}
      nextSlug="estruturas-probabilisticas"
      nextTitle="Bloom, HyperLogLog, Count-Min: estruturas probabilísticas"
      quiz={quiz}
    >
      <Section title="O que libs modernas usam" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Plataforma', 'Algoritmo', 'Nota']}
          rows={[
            ['V8 (Node/Chrome)', 'Timsort (desde 2018)', 'Stable, otimizado para real'],
            ['Python', 'Timsort', 'Origem do algoritmo'],
            ['JVM', 'Timsort (objects), DualPivot QS (primitives)', 'Ambos stable/unstable'],
            ['Go', 'IntroSort', 'QS híbrido com heapsort fallback'],
            ['Rust std', 'Timsort (pdqsort para primitives)', 'Pattern-defeating QS'],
          ]}
        />
      </Section>

      <Section title="Quickselect — top-K sem ordenar tudo" accent={accent}>
        <CodeBlock lang="typescript">{`function quickselect<T>(arr: T[], k: number, cmp: (a: T, b: T) => number): T {
  // Encontra o k-ésimo menor (0-indexed) em O(n) average
  const a = [...arr];  // cópia para não mutar
  let lo = 0, hi = a.length - 1;
  while (lo < hi) {
    const pivot = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (cmp(a[j], pivot) < 0) {
        [a[i], a[j]] = [a[j], a[i]];
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    if (i === k) return a[i];
    if (i < k) lo = i + 1;
    else hi = i - 1;
  }
  return a[lo];
}

// Mediana em O(n):
const median = quickselect(arr, Math.floor(arr.length / 2), (a, b) => a - b);`}</CodeBlock>
      </Section>

      <Section title="Stable sort importa em UI" accent={accent}>
        <CodeBlock lang="typescript">{`// Tabela ordenada por name. User clica em "sort by age".
// Stable: registros com mesma age mantêm ordem por name (desejado).
// Unstable: ordem dentro de empates é aleatória, UX ruim.

users.sort((a, b) => a.age - b.age);
// Array.prototype.sort é stable desde ES2019 (e V8 7.0+)
// Em versão antiga, não era garantido — bug na UI.`}</CodeBlock>
      </Section>

      <Section title="Regra: não reinvente" accent={accent}>
        <Callout tone="success" icon="✅">
          99% das vezes, <InlineCode>arr.sort()</InlineCode> é a resposta certa. Reinvente só se precisar de característica específica (quickselect, counting em range fixo, external sort pra dados &gt; RAM).
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
