import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, ComparisonTable, KeyValue, DecisionBox } from '@/components/article/primitives';

export const metadata = getModuleMetadata('vector-dbs-comparados');

const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  { question: 'HNSW vs IVF — diferença?', options: ['São idênticos', 'HNSW (Hierarchical Navigable Small World): grafo multi-camada, O(log N) search, alta recall, mais memória. IVF (Inverted File Index): clusters por k-means + busca em cluster, menos memória, recall menor. HNSW domina em produção 2026', 'IVF é mais rápido sempre', 'HNSW só em GPU'], correct: 1, explanation: 'HNSW (Malkov & Yashunin 2018) virou padrão por recall/latency tradeoff. IVF ainda usa quando memória é restrição forte. DiskANN (Microsoft) combina ambos com SSD-aware design.' },
  { question: 'pgvector vs vector DB dedicado:', options: ['Sempre pgvector', 'pgvector: Postgres extension, ótimo até ~10M vetores, SQL nativo + filters complexos, ops zero (já tem Postgres). Dedicated (Qdrant/Weaviate): scale > 100M vetores, features avançadas (hybrid search nativo, multi-tenancy). Use pgvector primeiro, migrar quando atingir limite', 'Sempre dedicated', 'pgvector não suporta HNSW'], correct: 1, explanation: 'pgvector 0.7+ tem HNSW nativo, performa bem até 10-50M vetores. Para SaaS B2B típico, basta. Migre quando: latência > 100ms, dataset > 100M, hybrid search complex.' },
  { question: 'Qdrant destaca-se por:', options: ['Ser pago', 'Rust performance, filtering rico em metadata durante search (não pré ou pós, durante), payload indexing, snapshots para backup. Self-host friendly, sem vendor lock', 'Não ter API', 'Só rodar em AWS'], correct: 1, explanation: 'Qdrant ganhou tração 2024-2026 por: Rust speed, on-the-fly filtering (ex: "kNN onde tenant_id = X AND created > Y"), excelente DX self-host.' },
  { question: 'Pinecone hoje:', options: ['Open source', 'SaaS gerenciado, serverless tier (cobrança por write/read, não cluster fixo), namespaces para multi-tenancy. Pro: ops zero. Contra: vendor lock, custo escala', 'Self-host', 'Grátis sempre'], correct: 1, explanation: 'Pinecone foi pioneiro serverless vector DB. Em 2026, model de pricing serverless ficou competitivo. Útil quando time não quer operar; ainda caro em alta escala constante.' },
  { question: 'LanceDB diferencial:', options: ['Servidor', 'Embedded — single binary, arquivos parquet-like (Lance format), zero servidor, multi-modal (image, vector, text). Ideal para apps desktop/CLI/edge', 'Apenas vetor', 'Não open-source'], correct: 1, explanation: 'LanceDB é "SQLite para vetores". Zero ops, performance excelente em datasets até dezenas de milhões em disco local. Casos: Notion clones, Obsidian plugins, RAG local.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="vector-dbs-comparados" title="Vector DBs em 2026: Qdrant, Weaviate, Pinecone, pgvector" icon="🗄️" xp={65} readTime={13}
      trailName="Search & IR Profundo" trailColor={accent} nextSlug="search-eval-mrr-ndcg" nextTitle="Avaliação de busca: MRR, NDCG" quiz={quiz}>
      <Section title="O cenário em 2026" accent={accent}>
        <p className="text-sm leading-6">Mercado consolidou: pgvector para start, Qdrant para self-host sério, Pinecone para serverless gerenciado. Weaviate ainda forte em casos com schema rico. LanceDB para embedded. Milvus em deployments massivos. Escolha errada vira migration dolorosa.</p>
      </Section>
      <Section title="Comparativo definitivo" accent={accent}>
        <ComparisonTable accent={accent} headers={['DB', 'Modelo', 'Scale típico', 'Forte em', 'Fraco em']} rows={[
          ['pgvector', 'Postgres extension', '≤10-50M', 'SQL filters, ops zero (já tem PG)', '>100M, latência alta'],
          ['Qdrant', 'Self-host / cloud', '100M+', 'Rust speed, on-the-fly filtering', 'Aprender API'],
          ['Weaviate', 'Self-host / cloud', '100M+', 'GraphQL, multi-modal, vetorização built-in', 'Mais opinionated'],
          ['Pinecone', 'Serverless SaaS', 'Ilimitado', 'Zero ops, latência consistente', 'Custo em escala alta, vendor lock'],
          ['LanceDB', 'Embedded', '~10M local', 'Single binary, multi-modal, offline', 'Não centralizado'],
          ['Milvus', 'Self-host / Zilliz cloud', 'B+ vetores', 'Massive scale', 'Complexidade ops'],
          ['Chroma', 'Embedded / self-host', '~10M', 'DX amigável Python', 'Maturidade em escala'],
          ['Vespa', 'Self-host', 'B+ vetores', 'Hybrid lexical+vector + ranking complex', 'Curva de aprendizado'],
        ]} />
      </Section>
      <Section title="Algoritmos por dentro" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'HNSW (Hierarchical Navigable Small World)', v: 'Grafo multi-camada, O(log N), high recall, ~4-8 bytes/dim overhead' },
          { k: 'IVF (Inverted File Index)', v: 'Cluster k-means; busca em cluster próximo. Memória eficiente, recall menor' },
          { k: 'PQ (Product Quantization)', v: 'Compressão por sub-vector quantization. 32x memory savings com pequena perda' },
          { k: 'DiskANN (Microsoft)', v: 'SSD-aware, single-machine billions de vetores' },
          { k: 'ScaNN (Google)', v: 'Anisotropic vector quantization, alta accuracy' },
        ]} />
      </Section>
      <DecisionBox scenario="Qual escolher?" winner="Comece com pgvector" winnerColor={accent}
        why="Já tem Postgres. Zero ops adicional. HNSW nativo bom até 10M. Migre quando comprovar limite."
        alternatives={[
          { name: 'Qdrant', note: 'Quando passar de 50M ou precisar filtering complex on-the-fly' },
          { name: 'Pinecone', note: 'Time pequeno, sem appetite ops, custo OK' },
          { name: 'LanceDB', note: 'App desktop/edge/CLI' },
          { name: 'Milvus', note: 'B+ vetores em produção' },
        ]} />
    </ModuleLayout>
  );
}
