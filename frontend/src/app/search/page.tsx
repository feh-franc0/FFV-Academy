import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail39')!;

export const metadata: Metadata = {
  title: 'Search & Information Retrieval — FFV Academy',
  description:
    'Search profissional em PT-BR: precision/recall/NDCG sem misticismo, full-text search em Postgres com tsvector + GIN, quando migrar pra Elasticsearch/OpenSearch, BM25 e TF-IDF na prática, vector search com HNSW e IVF (pgvector/Pinecone/Qdrant), hybrid search com RRF e reranker cross-encoder. Capstone busca multimodal e-commerce.',
  keywords:
    'search information retrieval, precision recall ndcg, postgres full text search tsvector, elasticsearch opensearch, bm25 tf idf, vector search hnsw ivf, pgvector pinecone qdrant, hybrid search rrf cohere reranker',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
