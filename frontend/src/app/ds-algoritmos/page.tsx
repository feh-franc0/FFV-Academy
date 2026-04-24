import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail20')!;

export const metadata: Metadata = {
  title: 'Estruturas de Dados & Algoritmos — FFV Academy',
  description:
    'DS&A em PT-BR sem LeetCode acadêmico: Big-O sem misticismo, hashmaps e arrays no dia a dia, árvores que você realmente usa (BST, heap, trie), grafos na prática (BFS/DFS/Dijkstra), recursão e DP, algoritmos de string, sorting real, estruturas probabilísticas (Bloom, HyperLogLog). Capstone com 5 problemas de produção.',
  keywords:
    'estruturas de dados algoritmos, big o javascript, hashmap, arvore binaria pratica, bfs dfs dijkstra, dp memoization, bloom filter hyperloglog, ds&a pragmatico',
};

export default function DsAlgoritmosPage() {
  return <TrailBlogClient trail={trail} />;
}
