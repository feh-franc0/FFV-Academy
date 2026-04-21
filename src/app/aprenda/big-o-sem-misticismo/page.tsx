import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('big-o-sem-misticismo');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual afirmação descreve melhor Big-O?',
    options: [
      'Mede tempo real em segundos',
      'Linguagem pra falar do COMPORTAMENTO ASSINTÓTICO do custo (tempo ou espaço) conforme n cresce — ignora constantes e termos de menor ordem',
      'Só serve em entrevista',
      'Complexidade exata',
    ],
    correct: 1,
    explanation: 'Big-O é limite superior no crescimento. O(n²) significa "custo cresce no máximo proporcional a n²". Ignora constantes (2n = O(n), 1000n = O(n)) porque em n grande, os termos de maior ordem dominam. Mas em n pequeno, constantes MUITO importam (daí timsort > mergesort teórico).',
  },
  {
    question: 'Qual é a ordem correta de crescimento do mais lento pro mais rápido?',
    options: [
      'O(n²) < O(n log n) < O(n) < O(log n) < O(1)',
      'O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)',
      'O(log n) < O(1) < O(n)',
      'Ordem varia por linguagem',
    ],
    correct: 1,
    explanation: 'Do mais rápido: O(1) constante → O(log n) binary search → O(n) linear → O(n log n) sort eficiente → O(n²) nested loops → O(2ⁿ) recursion sem memo → O(n!) permutations brute force. Cada salto é dramaticamente maior em n=10⁶.',
  },
  {
    question: 'O que é "análise amortizada"?',
    options: [
      'Empréstimo de algoritmo',
      'Custo MÉDIO por operação numa sequência, mesmo que operações individuais custem muito. Ex: array dynamic resize é O(1) amortizado, embora resize ocasional seja O(n)',
      'Cálculo impreciso',
      'Só funciona em estruturas lineares',
    ],
    correct: 1,
    explanation: 'Array que dobra capacidade quando cheio: push é O(1) na maioria, O(n) no resize. Ao longo de n pushes, total é O(n) → amortizado O(1) por push. Hashmap resize funciona igual. "Amortizado" é mais honesto que "worst case" pra muitas estruturas reais.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="big-o-sem-misticismo"
      title="Big-O sem misticismo: pense em custo, não em notação"
      icon="📈"
      xp={40}
      readTime={10}
      trailName="Estruturas de Dados & Algoritmos"
      trailColor={accent}
      nextSlug="arrays-hashmaps-e-quando-importam"
      nextTitle="Arrays, hashmaps e quando realmente importam"
      quiz={quiz}
    >
      <Section title="Big-O é linguagem, não matemática" accent={accent}>
        <p>
          Big-O serve pra você e seu colega concordarem: &quot;essa função é O(n log n)&quot; — ambos sabem o que esperar em n=10⁶. Não é cálculo preciso, é ordem de grandeza.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['n', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)']}
          rows={[
            ['100', '7', '100', '700', '10.000'],
            ['10.000', '14', '10.000', '140.000', '100M'],
            ['1.000.000', '20', '1.000.000', '20M', '10¹² — inviável'],
          ]}
        />
        <Callout tone="info" icon="💡">
          O(n²) em n=10⁶ é impraticável em qualquer máquina moderna. É por isso que algoritmos importam — troca-se de O(n²) pra O(n log n) e uma operação de 3 dias vira 3 segundos.
        </Callout>
      </Section>

      <Section title="Quando constantes importam" accent={accent}>
        <p>
          Big-O ignora constantes — mas em n pequeno, constantes ganham. Timsort (O(n log n)) tem constante grande; em n &lt; 32 vira insertion sort (O(n²) mas constante minúscula). Por isso V8/Python/Java todos usam timsort real, não quicksort teórico puro.
        </p>
        <CodeBlock lang="typescript">{`// Exemplo — loop "O(n)" mas com 1000x overhead
for (const item of items) { /* setup caro */ await dbCall(item); }  // 1 query por item

// "O(n)" mas 1 query total
await db.items.findMany({ where: { id: { in: items.map(i => i.id) } } });

// Ambos são O(n). Mas o segundo é 1000x mais rápido em produção.`}</CodeBlock>
      </Section>

      <Section title="Worst-case vs average vs amortized" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Worst-case</strong>: pior input possível. Ex: quicksort com pivot ruim → O(n²). Seguro como garantia.</li>
          <li><strong>Average</strong>: esperado em input aleatório. Quicksort average é O(n log n). Bom para expectativa, mau para SLO.</li>
          <li><strong>Amortized</strong>: média numa sequência. Hashmap put é O(1) amortizado (resize ocasional absorbido).</li>
        </ul>
        <p>
          Pra produção, worst-case importa MUITO em sistemas com SLO (p99). Um algoritmo average O(n log n) worst O(n²) vai gerar cauda gorda — usuários específicos sofrem muito.
        </p>
      </Section>

      <Section title="Como estimar custo de um código real" accent={accent}>
        <ol className="list-decimal pl-5 my-3 text-sm space-y-2">
          <li>Identifique o loop principal. Quantas vezes itera? (n)</li>
          <li>Dentro do loop: outro loop sobre n? (n²). Binary search? (log n). Constante? (1).</li>
          <li>Operações de estrutura: Array.indexOf dentro de loop = O(n²) disfarçado. Use Set/Map.</li>
          <li>I/O dentro de loop? Cada call dominate o big-O se rede/DB (amortize com batch).</li>
          <li>Recursão: desenhe a árvore. Profundidade × trabalho por nível = custo.</li>
        </ol>
      </Section>
    </ModuleLayout>
  );
}
