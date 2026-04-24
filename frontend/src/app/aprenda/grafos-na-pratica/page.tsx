import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('grafos-na-pratica');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando usar BFS em vez de DFS?',
    options: [
      'Nunca',
      'BFS quando você quer MENOR caminho em grafo não-ponderado (menor nº de hops), nível-por-nível. DFS pra detectar ciclo, topological sort, explorar profundidade primeiro',
      'BFS é sempre melhor',
      'Não há diferença prática',
    ],
    correct: 1,
    explanation: 'BFS (queue) expande por camadas — garante shortest path em graph unweighted. DFS (stack/recursão) vai fundo — bom pra: connected components, ciclo (3 cores visitation), topological sort (DAG), path enumeration. Memória: BFS O(largura), DFS O(profundidade).',
  },
  {
    question: 'Qual algoritmo resolve shortest path em graph PONDERADO (arestas com custo)?',
    options: [
      'BFS',
      'Dijkstra pra pesos não-negativos (O(E log V) com heap). Bellman-Ford se pesos negativos (O(V*E)). A* se tem heurística boa (jogo, pathfinding em mapa)',
      'DFS',
      'Floyd-Warshall',
    ],
    correct: 1,
    explanation: 'BFS só funciona em unweighted (implícito peso=1). Dijkstra com heap é eficiente pra pesos positivos (rotas, rede). Bellman-Ford suporta negativo mas mais lento. Floyd-Warshall pra all-pairs. A* com heurística Manhattan em pathfinding 2D.',
  },
  {
    question: 'Onde grafos aparecem em código "normal"?',
    options: [
      'Só em maps',
      'Dependency graph (npm deps, Docker builds, Make), import graph (bundlers), social graph, roteamento (k8s service mesh), workflow engines (Airflow DAGs), RDF',
      'Raramente',
      'Apenas em entrevista',
    ],
    correct: 1,
    explanation: 'Grafos são abstração comum, só não chamamos de "grafo". npm resolve deps em topological order. Webpack cria import graph. Permissões ReBAC (Zanzibar). Airflow/Dagster são DAGs. Detectar ciclo em build system vira DFS com 3-color marking.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="grafos-na-pratica"
      title="Grafos na prática: BFS, DFS, Dijkstra e quando aparecem"
      icon="🕸️"
      xp={55}
      readTime={13}
      trailName="Estruturas de Dados & Algoritmos"
      trailColor={accent}
      nextSlug="recursao-e-dp-para-quem-odeia"
      nextTitle="Recursão e DP para quem odeia: pensando em subproblemas"
      quiz={quiz}
    >
      <Section title="Representação: adjacency list vs matrix" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Representação', 'Memória', 'Check edge (u,v)?', 'Iterar vizinhos de u']}
          rows={[
            ['Adjacency list', 'O(V + E)', 'O(grau(u))', 'O(grau(u))'],
            ['Adjacency matrix', 'O(V²)', 'O(1)', 'O(V)'],
          ]}
        />
        <p>
          Adjacency list é default na prática (sparse graphs = maioria). Matrix vale se grafo denso (E ≈ V²) ou precisa check edge rápido.
        </p>
      </Section>

      <Section title="BFS em TS" accent={accent}>
        <CodeBlock lang="typescript">{`type Graph = Map<string, string[]>;

function bfs(g: Graph, start: string): Map<string, number> {
  const dist = new Map<string, number>([[start, 0]]);
  const queue: string[] = [start];
  while (queue.length) {
    const u = queue.shift()!;
    for (const v of g.get(u) ?? []) {
      if (dist.has(v)) continue;
      dist.set(v, dist.get(u)! + 1);
      queue.push(v);
    }
  }
  return dist;
}

// Use: menor hops entre dois nodes
const dist = bfs(socialGraph, 'alice');
console.log(dist.get('bob')); // graus de separação`}</CodeBlock>
      </Section>

      <Section title="DFS + detecção de ciclo (3-color)" accent={accent}>
        <CodeBlock lang="typescript">{`type Color = 'white' | 'gray' | 'black';

function hasCycle(g: Graph): boolean {
  const color = new Map<string, Color>();
  for (const u of g.keys()) color.set(u, 'white');

  function dfs(u: string): boolean {
    color.set(u, 'gray');
    for (const v of g.get(u) ?? []) {
      const c = color.get(v);
      if (c === 'gray') return true;  // back-edge → ciclo
      if (c === 'white' && dfs(v)) return true;
    }
    color.set(u, 'black');
    return false;
  }

  for (const u of g.keys()) if (color.get(u) === 'white' && dfs(u)) return true;
  return false;
}

// Use: validar que sua config de dependência é DAG`}</CodeBlock>
      </Section>

      <Section title="Dijkstra com heap" accent={accent}>
        <CodeBlock lang="typescript">{`import TinyQueue from 'tinyqueue';
type WGraph = Map<string, { to: string; w: number }[]>;

function dijkstra(g: WGraph, start: string): Map<string, number> {
  const dist = new Map<string, number>([[start, 0]]);
  const pq = new TinyQueue<{ node: string; d: number }>(
    [{ node: start, d: 0 }],
    (a, b) => a.d - b.d
  );
  while (pq.length) {
    const { node: u, d } = pq.pop()!;
    if (d > (dist.get(u) ?? Infinity)) continue; // skip stale
    for (const { to, w } of g.get(u) ?? []) {
      const nd = d + w;
      if (nd < (dist.get(to) ?? Infinity)) {
        dist.set(to, nd);
        pq.push({ node: to, d: nd });
      }
    }
  }
  return dist;
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Dijkstra com heap binária: O((V+E) log V). Suficiente pra grafos de milhões de nós. Pra bilhões (Google Maps), algoritmos especializados com pré-processamento (contraction hierarchies).
        </Callout>
      </Section>

      <Section title="Topological sort (DAG)" accent={accent}>
        <CodeBlock lang="typescript">{`function topoSort(g: Graph): string[] | null {
  const inDegree = new Map<string, number>();
  for (const [u, neigh] of g) {
    inDegree.set(u, inDegree.get(u) ?? 0);
    for (const v of neigh) inDegree.set(v, (inDegree.get(v) ?? 0) + 1);
  }

  const queue = [...inDegree.entries()].filter(([_, d]) => d === 0).map(([u]) => u);
  const result: string[] = [];

  while (queue.length) {
    const u = queue.shift()!;
    result.push(u);
    for (const v of g.get(u) ?? []) {
      inDegree.set(v, inDegree.get(v)! - 1);
      if (inDegree.get(v) === 0) queue.push(v);
    }
  }

  return result.length === inDegree.size ? result : null; // null = ciclo
}

// Use: ordem de build em monorepo, ordem de migration`}</CodeBlock>
      </Section>
    </ModuleLayout>
  );
}
