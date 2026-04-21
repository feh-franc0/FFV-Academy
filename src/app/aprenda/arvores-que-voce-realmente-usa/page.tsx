import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('arvores-que-voce-realmente-usa');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o caso de uso REAL de heap em produção?',
    options: [
      'Armazenar dados gerais',
      'Priority queue — escalonador de jobs (Kubernetes scheduler), Dijkstra, top-K elementos (min-heap de tamanho K), event loop interno',
      'Sort completo',
      'Só em leetcode',
    ],
    correct: 1,
    explanation: 'Heap (binary heap) = O(log n) insert + O(log n) extract-min/max + O(1) peek. Perfeito pra scheduler: sempre pegar job com maior prioridade. Node tem setImmediate/timers implementados com heap. Em JS use lib tinyqueue/heap-js. Não confunda heap (estrutura) com heap (memória).',
  },
  {
    question: 'O que é uma trie?',
    options: [
      'Array indexado',
      'Árvore onde cada nó representa um CARACTERE; o caminho raiz→nó forma uma string. Usado em autocomplete, filesystems, IP routing (trie de bits), prefix match',
      'Linked list com cabeça',
      'Variante de hashmap',
    ],
    correct: 1,
    explanation: 'Trie (ou prefix tree): insere "cat" gera c→a→t, com marker "palavra termina". Lookup "ca" é O(|prefixo|). Autocomplete: encontra nó do prefixo, DFS coleta todas palavras. Radix tree (compactada) economiza memória. IP routing usa trie binária.',
  },
  {
    question: 'Por que BST balanceada (AVL, Red-Black) em bibliotecas em vez de hashmap?',
    options: [
      'Mais rápida',
      'Ordem! Hashmap é O(1) mas não preserva ordem. BST é O(log n) MAS permite: range query, iteração ordenada, next/prev, percentile. C++ std::map, Java TreeMap usam red-black',
      'Ocupa menos memória',
      'Nunca se usa',
    ],
    correct: 1,
    explanation: 'Hashmap perde em cenários ordenados: "todas keys entre A e F", "maior que X", "iterar em ordem". BST balanceada resolve. Em JS/TS faltam built-ins; libs: `sorted-btree`, `skiplist`. Quando precisa de estrutura ordenada, pense BST; quando só lookup, hashmap.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="arvores-que-voce-realmente-usa"
      title="Árvores que você realmente usa (BST, heap, trie)"
      icon="🌳"
      xp={50}
      readTime={12}
      trailName="Estruturas de Dados & Algoritmos"
      trailColor={accent}
      nextSlug="grafos-na-pratica"
      nextTitle="Grafos na prática: BFS, DFS, Dijkstra e quando aparecem"
      quiz={quiz}
    >
      <Section title="BST balanceada" accent={accent}>
        <p>
          Binary Search Tree onde altura permanece O(log n). Variantes reais: AVL (strict), Red-Black (relaxed, usada em kernel, Java, C++), B-Tree (DB indexes), Splay (cache-friendly).
        </p>
        <p>
          Em JS sem built-in, use <InlineCode>sorted-btree</InlineCode>:
        </p>
        <CodeBlock lang="typescript">{`import BTree from 'sorted-btree';
const scores = new BTree<number, User>();
scores.set(100, userA);
scores.set(50, userB);
scores.set(75, userC);

// Top 3 — ordem descendente
const top3 = [...scores.entriesReversed()].slice(0, 3);

// Range query: users com score 60..90
const range = [...scores.entries(60, 91)];`}</CodeBlock>
      </Section>

      <Section title="Heap (priority queue)" accent={accent}>
        <CodeBlock lang="typescript">{`import TinyQueue from 'tinyqueue';

// Min-heap por default
const queue = new TinyQueue<Job>([], (a, b) => a.priority - b.priority);
queue.push({ priority: 5, task: 'email' });
queue.push({ priority: 1, task: 'urgent' });  // processa primeiro
queue.push({ priority: 3, task: 'normal' });

while (queue.length) {
  const job = queue.pop()!;  // menor priority primeiro
  await process(job);
}

// Top-K: manter heap tamanho K
function topK(items: number[], k: number): number[] {
  const heap = new TinyQueue<number>([], (a, b) => a - b);
  for (const x of items) {
    heap.push(x);
    if (heap.length > k) heap.pop();  // remove menor
  }
  return [...heap].sort((a, b) => b - a);
}
// O(n log k) em vez de O(n log n) de sort completo`}</CodeBlock>
      </Section>

      <Section title="Trie — autocomplete" accent={accent}>
        <CodeBlock lang="typescript">{`class TrieNode {
  children = new Map<string, TrieNode>();
  end = false;
}

class Trie {
  root = new TrieNode();

  insert(word: string) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.end = true;
  }

  autocomplete(prefix: string, max = 10): string[] {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return [];
      node = node.children.get(ch)!;
    }
    const results: string[] = [];
    this.dfs(node, prefix, results, max);
    return results;
  }

  private dfs(node: TrieNode, prefix: string, out: string[], max: number) {
    if (out.length >= max) return;
    if (node.end) out.push(prefix);
    for (const [ch, child] of node.children) this.dfs(child, prefix + ch, out, max);
  }
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Em produção com muitas palavras: use Postgres FTS (tsvector) ou Elasticsearch. Trie em memória só vale pra datasets pequenos (&lt; 100k) com autocomplete zero-latency.
        </Callout>
      </Section>

      <Section title="Quando NÃO implementar do zero" accent={accent}>
        <p>
          90% das vezes: use lib ou delegate. Postgres com B-Tree index resolve range+order em escala. Redis ZSET é skip list por baixo (ranked). Elasticsearch pra search. SQLite FTS5 pra trie-like. O valor de saber a estrutura é <strong>escolher certa</strong>, não reimplementar.
        </p>
      </Section>
    </ModuleLayout>
  );
}
