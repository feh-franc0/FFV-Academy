import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-search-ir-deep')!;

export const metadata: Metadata = {
  title: 'Search & Information Retrieval Profundo — FFV Academy',
  description:
    'Busca como engenharia: BM25/TF-IDF math, Elasticsearch internals (Lucene), OpenSearch/Meilisearch/Typesense comparados, hybrid search + reranking (BGE/Cohere), embeddings (BGE-M3, e5, Voyage), vector DBs (Qdrant/Weaviate/pgvector), métricas MRR/NDCG.',
  keywords: 'bm25, elasticsearch lucene, opensearch meilisearch, hybrid search, bge-m3, cohere rerank, qdrant pgvector, mrr ndcg',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
