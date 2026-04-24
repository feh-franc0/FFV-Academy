import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('recursao-e-dp-para-quem-odeia');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre memoization e tabulation?',
    options: [
      'São sinônimos',
      'Memoization é TOP-DOWN recursivo com cache (lazy); tabulation é BOTTOM-UP iterativo preenchendo tabela (eager). Resultado mesmo; memoization mais natural pra ler, tabulation evita recursão',
      'Memoization é mais lento',
      'Tabulation só funciona em arrays',
    ],
    correct: 1,
    explanation: 'Memoization: escreve função recursiva normal, decora com cache. Bom quando nem todos subproblems precisam ser calculados. Tabulation: loop preenche tabela dp[i][j]. Evita stack overflow, mas calcula tudo. Ambas transformam O(2^n) em O(n*m).',
  },
  {
    question: 'Qual exemplo REAL de DP no dia a dia?',
    options: [
      'Nenhum — só leetcode',
      'Edit distance (Levenshtein) em fuzzy search, diff de texto (git diff), LCS (longest common subsequence) em merge, knapsack em budget allocation, bellman-ford routing',
      'Só em jogos',
      'Apenas algoritmos acadêmicos',
    ],
    correct: 1,
    explanation: 'DP aparece em tudo. Levenshtein é clássico — "você quis dizer X?". git diff usa LCS variation (Myers diff). Kubernetes scheduler resolve bin packing (variante knapsack). Bellman-Ford (routing com pesos negativos) é DP. Dominar DP = reconhecer subproblemas.',
  },
  {
    question: 'Quando a recursão estoura stack em JS/Node?',
    options: [
      'Em qualquer recursão',
      'V8 default ~10k frames de profundidade. Recursão profunda (tree grande, lista encadeada longa) estoura. Soluções: iterativo com stack manual, tail call optimization (só em Safari/Strict Mode), continuation-passing',
      'Nunca',
      'Só em browser',
    ],
    correct: 1,
    explanation: 'V8 não faz tail call optimization (proposta ES2015 raramente implementada). Recursão com n = 100k crasha. Tree traversal — OK geralmente. Lista linked de 100k? Stack overflow. Reescreve iterativo com while+stack explícito.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="recursao-e-dp-para-quem-odeia"
      title="Recursão e DP para quem odeia: pensando em subproblemas"
      icon="🔁"
      xp={50}
      readTime={12}
      trailName="Estruturas de Dados & Algoritmos"
      trailColor={accent}
      nextSlug="algoritmos-de-string"
      nextTitle="Algoritmos de string: substring, regex internals e fuzzy"
      quiz={quiz}
    >
      <Section title="Recursão em 3 regras" accent={accent}>
        <ol className="list-decimal pl-5 my-3 text-sm space-y-1">
          <li>Defina <strong>caso base</strong> — quando parar.</li>
          <li>Reduza para subproblema menor.</li>
          <li>Combine resultado.</li>
        </ol>
        <CodeBlock lang="typescript">{`// Fibonacci naïve — O(2^n), impraticável pra n > 40
function fib(n: number): number {
  if (n < 2) return n;  // base
  return fib(n - 1) + fib(n - 2);  // recursão
}`}</CodeBlock>
      </Section>

      <Section title="Memoization (top-down)" accent={accent}>
        <CodeBlock lang="typescript">{`function fibMemo(n: number, cache = new Map<number, number>()): number {
  if (n < 2) return n;
  if (cache.has(n)) return cache.get(n)!;
  const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
  cache.set(n, result);
  return result;
}
// O(n) tempo e espaço — cada subproblem resolve 1x só`}</CodeBlock>
      </Section>

      <Section title="Tabulation (bottom-up)" accent={accent}>
        <CodeBlock lang="typescript">{`function fibTab(n: number): number {
  if (n < 2) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}
// O(n) tempo, O(1) espaço — melhor que memoization`}</CodeBlock>
      </Section>

      <Section title="Edit distance (Levenshtein) — DP clássico útil" accent={accent}>
        <CodeBlock lang="typescript">{`// Quantas edições pra transformar s1 em s2? (insert, delete, substitute)
function editDistance(s1: string, s2: string): number {
  const m = s1.length, n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
// Uso: fuzzy match "você quis dizer X?" (threshold ≤ 2 para typos)`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Padrão pra reconhecer DP: &quot;consegue resolver problema maior combinando respostas de problemas menores, e os menores repetem?&quot;. Se sim, cache.
        </Callout>
      </Section>

      <Section title="Reescrevendo recursão profunda iterativamente" accent={accent}>
        <CodeBlock lang="typescript">{`// ❌ Pode estourar stack em lista grande
function traverse(node: Node | null): void {
  if (!node) return;
  visit(node);
  traverse(node.next);
}

// ✅ Iterativo — sem stack overflow
function traverse(node: Node | null): void {
  while (node) {
    visit(node);
    node = node.next;
  }
}

// Tree: use stack explícita
function dfs(root: TreeNode): void {
  const stack = [root];
  while (stack.length) {
    const node = stack.pop()!;
    visit(node);
    for (const child of node.children) stack.push(child);
  }
}`}</CodeBlock>
      </Section>
    </ModuleLayout>
  );
}
