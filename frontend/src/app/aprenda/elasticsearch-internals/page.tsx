import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  Timeline,
  DecisionBox,
  StackFlow,
  NodeGraph,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('elasticsearch-internals');
const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é um segment no Lucene/Elasticsearch e por que ele é imutável?',
    options: [
      'Um shard',
      'Um arquivo binário imutável contendo um sub-índice completo (inverted index + doc values + stored fields). Imutabilidade vem da arquitetura write-once de Lucene: writes criam novos segments; deletes marcam tombstones; merges consolidam segments antigos em novos. Imutabilidade habilita caching agressivo (os.page cache), mmap, e leitura lock-free',
      'Um shard físico',
      'Um snapshot de backup',
    ],
    correct: 1,
    explanation: 'Lucene é o engine que está dentro do Elasticsearch, OpenSearch e Solr. Sua escolha arquitetural fundamental é segments imutáveis: cada commit cria um novo segment com seu próprio inverted index, doc values, stored fields. Deletes não modificam segments — eles marcam doc IDs como deletados num bitset .liv. Updates são delete + insert (em segment novo). Periodicamente, um merge consolida segments pequenos em maiores, "expunge" docs deletados, e o resultado vai pra disco. Essa imutabilidade habilita: leitura sem locks, mmap eficiente, cache de page do OS, e busca paralela em múltiplos segments simultaneamente.',
  },
  {
    question: 'Qual é a função do refresh_interval em Elasticsearch e por que o default é 1s?',
    options: [
      'Renovar conexões',
      'Define com que frequência docs indexados ficam visíveis para busca. Cada refresh cria um novo segment in-memory que pode ser pesquisado, mesmo antes do fsync para disco. Default 1s = compromisso entre near-real-time (NRT) search e custo de IO de criar muitos segments pequenos. Pode aumentar para 30s ou desativar (-1) em bulk ingest pesado para acelerar 5-10×',
      'Tempo de heartbeat',
      'TTL de cache',
    ],
    correct: 1,
    explanation: 'Elasticsearch promete near-real-time search, não real-time. Doc indexado num momento T fica buscável depois do próximo refresh. Refresh = forçar Lucene a abrir um IndexReader sobre o buffer em memória (RAM, ainda não fsync). Default 1s significa: doc indexado T será buscável até T+1s. Cada refresh tem custo: cria segment, abre file descriptors, invalida caches de filtros. Em bulk reindex onde você não precisa de NRT, configurar refresh_interval: -1 durante o load (e back to 1s depois) acelera ingestão drasticamente — segments grandes são criados em vez de milhares de minúsculos, evitando merge thrashing.',
  },
  {
    question: 'Qual é a função do translog (transaction log) e por que ele existe se já temos segments?',
    options: [
      'Logs de erro',
      'Durabilidade. Segments só vão para disco em commits periódicos (a cada ~5 GB ou após fsync). Entre commits, docs já indexados estão só em RAM. Se o nó cai, perderíamos esses docs. Translog é um WAL append-only fsynced a cada request (ou async). No restart, o nó replay o translog para reconstruir o estado pós-último commit',
      'Compactação',
      'Cache de query',
    ],
    correct: 1,
    explanation: 'Translog é o write-ahead log do Lucene/Elasticsearch. Cada operação de indexação é primeiro escrita no translog, depois no buffer in-memory. Refresh (criar segment buscável) NÃO faz fsync — é barato. Flush é quem faz fsync: segments para disco + translog truncado + checkpoint. Sem translog, qualquer crash entre flushes perderia docs. Default é fsync a cada request (durability total) — pode-se aliviar para async fsync a cada 5s em ingest pesado para mais throughput, trocando durabilidade window por velocidade. É o mesmo trade-off do fsync do PostgreSQL.',
  },
  {
    question: 'O que define quantos shards um índice Elasticsearch deve ter?',
    options: [
      'Sempre 5',
      'O tamanho esperado do índice e o paralelismo desejado em queries. Cada shard é um Lucene index inteiro com overhead próprio. Regra prática: 20-50 GB por shard primário, no máximo 600 shards por nó. Over-sharding = overhead de coordenação; under-sharding = shards gigantes lentos para snapshot/recovery',
      'O número de nós',
      'A taxa de inserção',
    ],
    correct: 1,
    explanation: 'Shards são unidades de distribuição e paralelismo do Elasticsearch. Cada shard primário é um Lucene index completo. Queries são paralelizadas entre shards e mergeadas no coordinator. Trade-offs: poucos shards grandes = recovery/snapshot lentos, sem paralelismo de query, hot shards; muitos shards pequenos = overhead massivo (cada shard tem heap próprio, file descriptors, cache). Elastic.co recomenda 20-50 GB por shard primário. Para corpora de 1 TB, ~30 shards. Para 100 GB, ~5 shards. Indices criados em 2026 frequentemente usam Data Streams + ILM (Index Lifecycle Management) com rollover automático, gerenciando shard size sem você pensar.',
  },
  {
    question: 'Qual foi a controvérsia da Elastic License em janeiro de 2021 e por que originou o OpenSearch?',
    options: [
      'Bug de segurança',
      'Elastic NV relicenciou Elasticsearch e Kibana de Apache 2.0 para SSPL/Elastic License, restrições contra SaaS (mirando AWS). AWS forkou em Apache 2.0 sob o nome OpenSearch (com Kibana → OpenSearch Dashboards). Em agosto/2024, Elastic voltou a licenciar AGPL/Apache 2.0 também — mas o fork persiste como ecossistema separado',
      'Não houve controvérsia',
      'Mudança de logo',
    ],
    correct: 1,
    explanation: 'Em janeiro/2021, Elastic NV (empresa por trás do ES) mudou unilateralmente a licença de Apache 2.0 para uma combinação de SSPL (Server Side Public License) e Elastic License v2 — fechando o uso comercial em SaaS sem pagamento. O alvo declarado foi AWS, que oferecia ES gerenciado. AWS reagiu forkando a versão Apache 2.0 final como OpenSearch (e Kibana virou OpenSearch Dashboards). Em agosto/2024, Elastic voltou a oferecer também AGPL (open source novamente) — mas o fork OpenSearch já tem governance própria (Linux Foundation), comunidade forte, e features divergem. Decisão de adoção em 2026 envolve mais que licença: roadmap, integrações AWS, e maturidade de features.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="elasticsearch-internals"
      title="Elasticsearch internals: Lucene, segments, shards, refresh"
      icon="🔬"
      xp={75}
      readTime={15}
      trailName="Search & IR Profundo"
      trailColor={accent}
      nextSlug="opensearch-meilisearch-typesense"
      nextTitle="OpenSearch vs Meilisearch vs Typesense"
      quiz={quiz}
    >
      <Section title="Por dentro do Elasticsearch (e Lucene)" accent={accent}>
        <p>
          Elasticsearch é frequentemente descrito como &quot;banco de busca&quot;, mas isso esconde a verdade: ele é
          uma camada distribuída em cima do <strong>Apache Lucene</strong>, um engine de IR escrito por Doug Cutting
          (mesmo criador do Hadoop) que já existe desde 1999. Toda performance, garantias de durabilidade e modelo de
          dados vem do Lucene. Elasticsearch adiciona: REST API, sharding, replicação, cluster coordination, ingest
          pipelines, ILM, mapping, query DSL.
        </p>
        <p>
          Entender Lucene é entender Elasticsearch (e OpenSearch, e Solr). Este módulo desce ao nível do inverted index,
          segments imutáveis, refresh vs flush, translog, e como tudo isso se compõe num cluster distribuído.
        </p>
        <Callout tone="info" icon="📚">
          Referências: Lucene wiki oficial (apache.org), &quot;Elasticsearch: The Definitive Guide&quot; (Clinton Gormley
          &amp; Zachary Tong, O&apos;Reilly, ainda relevante apesar de antigo), e o blog Elastic.co (especialmente posts de
          Adrien Grand sobre segments e merging).
        </Callout>
      </Section>

      <Section title="Stack: do disco ao cluster" accent={accent}>
        <StackFlow
          accent={accent}
          title="Camadas da arquitetura"
          items={[
            'Hardware — NVMe SSD (latência baixa essencial), 64+ GB RAM (page cache + heap)',
            'OS / Filesystem — Linux, ext4/xfs, mmap habilitado, vm.max_map_count alto',
            'Lucene segments (imutáveis) — Inverted index, doc values, stored fields, term vectors',
            'Lucene IndexWriter / IndexReader — Buffer em RAM, refresh cria reader sobre segments',
            'Translog (WAL) — Append-only, fsync por request (ou async)',
            'Elasticsearch shard — Um Lucene index + translog + metadata',
            'Elasticsearch node — JVM, hospeda múltiplos shards (primary + replica)',
            'Elasticsearch cluster — Master eleito, coordenação via Zen Discovery / cluster state',
          ]}
        />
      </Section>

      <Section title="Inverted index: a estrutura fundamental" accent={accent}>
        <p>
          O coração do Lucene é o <strong>inverted index</strong>: um mapeamento de term → lista de doc IDs que contêm
          o termo. Para cada termo, há uma <em>posting list</em> com (doc_id, term_freq, positions). Buscar &quot;postgres
          mvcc&quot; vira:
        </p>
        <CodeBlock lang="text">{`Inverted index (esquema simplificado)
====================================

Term Dictionary (ordenado, com FST — Finite State Transducer)
─────────────────────────────────────────────────────────────
"mvcc"      → ptr posting list A
"postgres"  → ptr posting list B
"vacuum"    → ptr posting list C
...

Posting List "postgres" (comprimida com PFOR-Delta / FOR / VInt)
────────────────────────────────────────────────────────────────
[ (doc=3,   tf=2,  positions=[12, 47]),
  (doc=17,  tf=1,  positions=[8]),
  (doc=42,  tf=3,  positions=[2, 19, 91]),
  ...
]

Skip list overlay (para acelerar AND queries com docs grandes)
──────────────────────────────────────────────────────────────
Skip a cada N postings (N=128 default), permitindo "advance"
direto para um doc_id próximo sem decodificar tudo.

Query "postgres AND mvcc":
  1. Recupera posting list de "postgres" e "mvcc"
  2. Caminha as duas listas em paralelo (merge sort)
  3. Para cada doc comum, calcula score BM25
  4. Mantém heap top-K
  5. Retorna ordenado por score`}</CodeBlock>
      </Section>

      <Section title="Segments imutáveis: a escolha arquitetural" accent={accent}>
        <p>
          Lucene não atualiza segments. Nunca. Cada commit cria um novo segment. Deletes não removem nada — marcam num
          bitset <InlineCode>.liv</InlineCode> dentro do segment. Updates são delete + insert (em segment novo).
          Periodicamente, um <strong>merge</strong> consolida segments pequenos em um maior, descartando docs deletados.
        </p>
        <NodeGraph
          accent={accent}
          title="Ciclo de vida de um segment"
          columns={[
            {
              title: 'In-memory buffer',
              nodes: [
                'IndexWriter buffer — docs novos em RAM, não buscáveis ainda',
              ],
            },
            {
              title: 'Refresh',
              nodes: [
                'New segment — criado em RAM (in-memory FS), IndexReader aberto. Buscável.',
              ],
            },
            {
              title: 'Flush',
              nodes: [
                'Disk segment — fsync, translog truncado, checkpoint. Durável.',
              ],
            },
            {
              title: 'Merge',
              nodes: [
                'Tiered merge — Lucene consolida segments pequenos → segment maior, expunge deletes',
              ],
            },
          ]}
        />
        <Callout tone="info" icon="💡">
          Imutabilidade é o que habilita: leitura sem locks, mmap eficiente, paralelismo por segment, page cache do OS.
          O custo é: deletes não liberam espaço até merge, write amplification em merges grandes.
        </Callout>
      </Section>

      <Section title="Refresh vs flush vs commit (todo mundo confunde)" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Operação', 'O que faz', 'Custo', 'Default']}
          rows={[
            ['Refresh', 'Cria segment in-memory + abre IndexReader. Docs viram buscáveis.', 'Baixo (não fsync)', 'A cada 1s (refresh_interval)'],
            ['Flush', 'fsync de segments + truncate translog + checkpoint. Durabilidade.', 'Alto (IO)', 'A cada 512 MB de translog ou 30 min'],
            ['Commit', 'Termo Lucene equivalente a flush — escreve segments e metadata no disco.', 'Alto', 'Implícito no flush'],
            ['Merge', 'Consolida segments pequenos em maiores, expunge deletes.', 'Alto (CPU + IO)', 'Background, tiered merge policy'],
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          Bulk ingest pesado? Aumente <InlineCode>refresh_interval</InlineCode> para 30s ou desative (-1) durante o load,
          depois retorne a 1s. Pode acelerar ingestão em 5-10× — porque cada refresh cria segment e dispara merge
          eventual. Menos refreshes = segments maiores desde o início.
        </Callout>
      </Section>

      <Section title="Translog: durabilidade entre commits" accent={accent}>
        <p>
          Segments só vão para disco em flushes (a cada ~512 MB de translog ou 30 min). Entre flushes, docs já indexados
          estão num segment in-memory. Se o nó cai, perderíamos tudo desde o último flush. Solução: <strong>translog</strong>,
          o write-ahead log do ES.
        </p>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Caminho de um doc indexado"
          steps={[
            { label: '1. Index request', desc: 'POST /index/_doc {...}' },
            { label: '2. Write ao translog', desc: 'Append + fsync (durability default: request-level)' },
            { label: '3. Add ao buffer in-memory', desc: 'IndexWriter buffer (não buscável ainda)' },
            { label: '4. Refresh (a cada 1s)', desc: 'Buffer → segment in-memory. Reader reaberto. Doc buscável.' },
            { label: '5. Flush (lazy)', desc: 'fsync segments para disco. Translog truncado. Doc durável em segment.' },
            { label: '6. Merge eventual', desc: 'Background. Segments pequenos → grandes. Deletes purgados.' },
          ]}
        />
        <Callout tone="info" icon="🔒">
          <strong>Durabilidade ajustável</strong>: <InlineCode>index.translog.durability: request</InlineCode> (default,
          fsync por request, ~ms) ou <InlineCode>async</InlineCode> (fsync a cada 5s, perda potencial de 5s de writes em
          crash, mas throughput maior). É a mesma equação de fsync que você encara no Postgres.
        </Callout>
      </Section>

      <Section title="Shards: distribuição e paralelismo" accent={accent}>
        <p>
          Um índice ES é dividido em <strong>shards primários</strong> (P0, P1, ..., Pn), cada um sendo um Lucene index
          completo. Para HA, cada primário tem N <strong>réplicas</strong> em outros nós. Queries são paralelizadas:
          coordinator broadcast para todos os shards primários (ou réplicas), cada shard responde com top-K local,
          coordinator merge top-K global.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Shard primário', v: 'Lucene index. Aceita writes. Replica para réplicas.' },
            { k: 'Shard réplica', v: 'Cópia exata de um primário. Aceita reads. Promovida a primário em failover.' },
            { k: 'Routing', v: 'Hash(doc_id) % num_primary_shards → qual shard. Mudar num_primary requer reindex.' },
            { k: 'Allocation', v: 'Master atribui shards a nós (balance, awareness, allocation filtering)' },
            { k: 'Recovery', v: 'Cópia de translog + segments para réplicas novas. Pode ser longo em shards de TBs.' },
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          <strong>Regra prática 2026</strong>: shard primário entre 20-50 GB. Mais que 50 GB → recovery lento, queries
          pesadas; menos que 20 GB → overhead de coordenação domina. Para tempo-séries, use Data Streams + ILM com
          rollover por tamanho (e.g., rollover quando shard atingir 50 GB).
        </Callout>
      </Section>

      <Section title="Query path: o que acontece num search" accent={accent}>
        <CodeBlock lang="text">{`Client → POST /logs-*/_search { query: ... }
              │
              ▼
       Coordinator node
              │
   ┌──────────┼──────────┐
   ▼          ▼          ▼
 Shard 0    Shard 1   Shard 2     (em paralelo)
   │          │          │
   │  Lucene index search por shard:
   │  - Para cada termo da query, recupera posting list
   │  - AND/OR/phrase merge
   │  - Calcula BM25 (default similarity)
   │  - Mantém top-K em heap
   ▼          ▼          ▼
 (doc_ids + scores top-K de cada shard)
              │
              ▼
       Coordinator merge:
       - Junta top-K de cada shard
       - Re-sort por score
       - Top-N global
       - Fetch phase: busca _source dos N docs finais
              │
              ▼
         Response → client

Latência típica:
- query phase: ~5-30 ms (CPU bound)
- fetch phase: ~5-15 ms (IO bound, _source no disco)
- network: ~1-5 ms intra-cluster`}</CodeBlock>
      </Section>

      <Section title="Tiered merge policy: por que merges acontecem" accent={accent}>
        <p>
          Lucene usa <InlineCode>TieredMergePolicy</InlineCode> (default) para decidir quando merge segments. A heurística:
          agrupar segments de tamanho similar em &quot;tiers&quot; e mergear tiers que ultrapassem um limite. Parâmetros chave:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm text-slate-300">
          <li><InlineCode>max_merged_segment</InlineCode> — tamanho máximo de segment pós-merge (default 5 GB)</li>
          <li><InlineCode>segments_per_tier</InlineCode> — quantos segments por tier antes de mergear (default 10)</li>
          <li><InlineCode>floor_segment</InlineCode> — segments menores que isso são agrupados (default 2 MB)</li>
        </ul>
        <Callout tone="info" icon="⚙️">
          Em produção: nunca force <InlineCode>_forcemerge</InlineCode> em índices ativos. Isso cria 1 mega-segment que
          tira eficiência de merges futuros e bloqueia até completar. Force-merge só faz sentido em índices read-only
          (logs antigos, finalizados via ILM).
        </Callout>
      </Section>

      <Section title="Elastic License: o drama de 2021" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '2010', label: 'Elasticsearch 0.4 lançado', detail: 'Shay Banon, Apache 2.0. Comunidade cresce rapidamente.' },
            { when: '2012', label: 'Elastic NV fundada', detail: 'Empresa por trás do projeto. Modelo open core.' },
            { when: '2015', label: 'AWS lança Elasticsearch Service', detail: 'ES gerenciado em AWS. Concorre com Elastic Cloud.' },
            { when: 'Jan/2021', label: 'Relicenciamento para SSPL/Elastic License', detail: 'Elastic NV muda unilateralmente. AWS reage e forka.' },
            { when: 'Abr/2021', label: 'OpenSearch nasce', detail: 'AWS forka da última versão Apache 2.0. Linux Foundation hospeda governance.' },
            { when: 'Ago/2024', label: 'Elastic volta a oferecer AGPL', detail: 'Re-licencia também sob AGPL além de SSPL/EL. Open source de novo, mas fork persiste.' },
            { when: '2026', label: 'Dois ecossistemas paralelos', detail: 'Elasticsearch e OpenSearch divergem em features. Decisão depende de stack, AWS-first, e roadmap.' },
          ]}
        />
      </Section>

      <Section title="Quando usar Elasticsearch (e quando não)" accent={accent}>
        <DecisionBox
          scenario="Busca full-text + agregações + analytics em escala"
          winner="Elasticsearch / OpenSearch"
          winnerColor={accent}
          why="Inverted index Lucene maduro, BM25 default, hybrid search nativo (8.x+); Agregações (terms, date_histogram, percentiles) extremamente otimizadas; Sharding + replicação out-of-the-box, scaling horizontal real; Ecossistema (Logstash, Kibana, Beats) para logs/observability"
          alternatives={[
            { name: 'Postgres tsvector / FTS: ok para apps pequenos a médios sem necessidade de cluster. Limite ~1M docs com performance digna.' }, { name: 'Meilisearch / Typesense: developer experience superior, typo tolerance built-in, ideal para "instant search" em e-commerce' }, { name: 'Vespa: superior em large-scale ML ranking, mas curva de aprendizado brutal' }, { name: 'Vector DB puro (Qdrant, Weaviate): se busca é 100% semântica e você não precisa de keyword search' }
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={accent}>
        <QAItem
          q="ES e OpenSearch são compatíveis?"
          a="Até versão 7.10 (ponto do fork) sim. Após isso divergem. Clients oficiais Elasticsearch 8.x não funcionam com OpenSearch e vice-versa. Use SDKs específicos."
        />
        <QAItem
          q="Vale rodar ES self-hosted ou ir em managed?"
          a="Self-hosted exige expertise em JVM tuning, cluster ops, snapshots. Managed (Elastic Cloud, AWS OpenSearch, Bonsai) cobra premium mas elimina toil. Para times sem dedicated infra, managed quase sempre vale."
        />
        <QAItem
          q="ES suporta vector search?"
          a="Sim, desde 8.0 (HNSW nativo no Lucene). Em 2026, ES 8.13+ tem dense_vector field, kNN query, e hybrid search (BM25 + vector + RRF) out-of-the-box."
        />
        <QAItem
          q="Por que meu cluster fica 'yellow'?"
          a="Yellow = todos primários OK, mas algumas réplicas não alocadas. Comum em cluster de 1 nó (réplica não pode ir no mesmo nó do primário). Solução: adicionar nó ou setar number_of_replicas: 0 em dev."
        />
      </Section>

      <Section title="Resumo executivo" accent={accent}>
        <Callout tone="success" icon="✅">
          Elasticsearch = Lucene distribuído. Domine os conceitos do Lucene (inverted index, segments imutáveis, refresh
          vs flush, merges, translog) e o resto vira aplicação de tuning sobre essa base. Em 2026, ES 8.x e OpenSearch
          2.x oferecem hybrid search nativo (BM25 + vector + RRF) — o que torna ES um candidato sério mesmo para
          aplicações modernas de RAG.
        </Callout>
        <Callout tone="info" icon="💡">
          Próximo módulo: comparativo prático entre OpenSearch, Meilisearch e Typesense — quando escolher qual.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
