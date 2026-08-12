import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail-search-ir-deep')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Busca como engenharia: BM25/TF-IDF math, Elasticsearch internals (Lucene), OpenSearch/Meilisearch/Typesense comparados, hybrid search + reranking (BGE/Cohere), embeddings (BGE-M3, e5, Voyage), vector DBs (Qdrant/Weaviate/pgvector), métricas MRR/NDCG.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/search-ir-deep` },
  ...social({ titulo: `Search & Information Retrieval Profundo — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/search-ir-deep' }),
  title: 'Search & Information Retrieval Profundo',
  description: DESCRICAO_CARTAO,
  keywords: 'bm25, elasticsearch lucene, opensearch meilisearch, hybrid search, bge-m3, cohere rerank, qdrant pgvector, mrr ndcg',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
