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
  DecisionBox,
  ArchFlow,
  Timeline,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('nats-vs-kafka');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença fundamental de modelo entre NATS core e Kafka?',
    options: [
      'Nenhuma, ambos são log-based',
      'NATS core é um broker pub/sub at-most-once em memória, projetado para latência sub-milissegundo e fan-out massivo; Kafka é um log distribuído com persistência forte, ordering por partition e retention configurável. NATS JetStream adiciona persistência (file/memory store) com semântica de stream, mas o core continua sendo "fire-and-forget" otimizado para edge/IoT/microservices',
      'Kafka usa UDP e NATS usa TCP',
      'NATS só funciona em Go, Kafka só em Java',
    ],
    correct: 1,
    explanation:
      'NATS core privilegia velocidade extrema e simplicidade (subject-based routing, sem consumer groups, sem offsets). JetStream traz storage e replay para casos que precisam de durabilidade, mas a base do NATS é diferente da do Kafka — pense em NATS como "mensageria leve onipresente" e Kafka como "commit log distribuído enterprise".',
  },
  {
    question: 'NATS JetStream usa qual algoritmo de consenso para replicação de streams?',
    options: [
      'Paxos clássico',
      'Raft, com replicação síncrona dentro do cluster (RAFT group por stream) e suporte a clusters geo-distribuídos via supercluster (gateways) — diferente do Kafka que historicamente usou Zookeeper e agora KRaft (Raft próprio)',
      'Two-phase commit puro',
      'Gossip eventual',
    ],
    correct: 1,
    explanation:
      'JetStream usa Raft para metadata e para replicação de streams (R=1, 3 ou 5). Cada stream tem seu próprio grupo Raft. Kafka KRaft também adotou Raft, mas com modelo diferente: brokers + controller quorum, partitions são replicadas por ISR (não Raft direto).',
  },
  {
    question: 'Qual benchmark da Synadia (2024) mostra a maior diferença qualitativa?',
    options: [
      'Throughput bruto, onde NATS sempre vence',
      'Latência P99 em payloads pequenos (~256B) com fan-out alto: NATS core entrega P99 sub-milissegundo em milhões de subjects, enquanto Kafka, por design (batching, fsync, partition routing), opera melhor com batches maiores e P99 na casa de 10–100ms. Para throughput contínuo de megabytes/s por partition, Kafka costuma vencer',
      'Compressão Zstd',
      'Uso de CPU em idle',
    ],
    correct: 1,
    explanation:
      'Synadia publica benchmarks anuais (2023, 2024) mostrando que NATS é otimizado para "muitas mensagens pequenas, baixa latência, alto fan-out" — perfil edge/IoT/microservices. Kafka é otimizado para "throughput sustentado em poucos topics com retention longa" — perfil data pipeline/analytics. Ambos rodam em produção em escala, mas para casos de uso diferentes.',
  },
  {
    question: 'Por que ordenação global é difícil em NATS JetStream?',
    options: [
      'NATS não suporta ordenação',
      'JetStream ordena dentro de um stream (single writer interno), mas se você quer ordering por chave em fan-in massivo, precisa modelar com subjects determinísticos ou usar partition_filter no consumer; Kafka resolve isso naturalmente com partitioner por key e garantia de ordem dentro da partition',
      'Só funciona com R=1',
      'Precisa de Zookeeper',
    ],
    correct: 1,
    explanation:
      'O modelo do Kafka (partition + offset) torna ordering-per-key trivial. NATS é subject-based; para conseguir o mesmo efeito você usa subjects determinísticos (ex: orders.{userId}) e consumers com filter. JetStream 2.10+ trouxe partitioned consumers para facilitar esse padrão, mas a ergonomia para data pipelines ainda é menor que em Kafka.',
  },
  {
    question: 'Quando escolher NATS em vez de Kafka?',
    options: [
      'Sempre, NATS é melhor',
      'Quando o caso de uso exige latência muito baixa em payloads pequenos, fan-out massivo, edge/IoT, request-reply (NATS tem isso nativo via INBOX), KV/object store leve embutido (JetStream KV), e overhead operacional baixo (single binary em Go, footprint MB). Kafka brilha em data lake/pipeline, retention longa, ecossistema (Connect, Streams, ksqlDB)',
      'Quando precisa de exactly-once cross-system',
      'Quando paga Confluent',
    ],
    correct: 1,
    explanation:
      'NATS vence em "service mesh de eventos": microsserviços conversando, IoT, edge, command/control com request-reply. Kafka vence em "backbone de dados": ingestão, ETL, integração entre sistemas, retention de semanas/meses, processamento stream (Flink/Streams).',
  },
  {
    question: 'NATS JetStream KV é equivalente a quê do ecossistema Kafka?',
    options: [
      'Apache Pinot',
      'Mais próximo de um "compacted topic" do Kafka mais um cliente KV consumer-side: o JetStream KV é um stream com compactação por chave, exposto via API key/value (PUT, GET, WATCH, history). É feature builtin do binário do NATS, sem precisar Kafka Streams ou cluster externo de Redis/etcd',
      'AWS S3',
      'Cassandra',
    ],
    correct: 1,
    explanation:
      'No Kafka, padrão equivalente é "compacted topic + KTable em Streams" ou "compacted topic + GlobalKTable + interactive queries". JetStream KV entrega isso como produto pronto, com TTL por chave, WATCH (que é como subscrever em changes), e history (últimas N revisões por chave).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="nats-vs-kafka"
      title="NATS vs Kafka: quando cada um vence"
      icon="⚡"
      xp={65}
      readTime={13}
      trailName="Mensageria & Streaming"
      trailColor={accent}
      nextSlug="rabbitmq-deep"
      nextTitle="RabbitMQ profundo: AMQP 0-9-1, exchanges, mirroring"
      quiz={quiz}
    >
      <Section title="Por que comparar (e por que a comparação é injusta)" accent={accent}>
        <p>
          NATS e Kafka aparecem em duelos de blog post há anos, mas a verdade é que eles nasceram para resolver problemas diferentes. <strong>Kafka</strong> foi criado no LinkedIn (2011) como um <em>commit log distribuído</em> para integrar sistemas heterogêneos com retention de dias e replay arbitrário. <strong>NATS</strong> foi criado por Derek Collison (CloudFoundry) como o <em>nervous system</em> do CloudFoundry — mensageria de controle ultra-leve, fire-and-forget, para microsserviços conversando entre si.
        </p>
        <p>
          Em 2017 NATS ganhou JetStream (persistência e replay), aproximando-se do território Kafka. E o Kafka, com KRaft (3.3 GA) e tiered storage (KIP-405), ficou mais leve operacionalmente. Hoje a sobreposição existe, mas cada um continua melhor em seu domínio nativo.
        </p>
        <Callout tone="info">
          Regra mental: <strong>NATS = service mesh de eventos</strong> (microsserviços, IoT, edge, request-reply, latência sub-ms). <strong>Kafka = backbone de dados</strong> (ingestão, ETL, analytics, retention longa, ecossistema de stream processing).
        </Callout>
      </Section>

      <Section title="Modelo mental: subject vs partition" accent={accent}>
        <p>
          A diferença mais profunda está em como cada um endereça mensagens. <strong>Kafka</strong> trabalha com <InlineCode>topic + partition + offset</InlineCode>. Topic é namespace, partition é unidade de paralelismo e ordering, offset é posição imutável no log. Tudo é <em>log-based</em>: você produz appendando, consome lendo offsets.
        </p>
        <p>
          <strong>NATS</strong> trabalha com <InlineCode>subject</InlineCode> hierárquico (ex: <InlineCode>orders.us-east.new</InlineCode>) e wildcard matching (<InlineCode>orders.*.new</InlineCode>, <InlineCode>orders.&gt;</InlineCode>). O core é <em>publish/subscribe</em> sem armazenamento. JetStream adiciona streams que <em>filtram subjects</em> e persistem (memory ou file store).
        </p>
        <ArchFlow
          title="Endereçamento e armazenamento"
          accent={accent}
          columns={[
            {
              title: 'Kafka',
              items: [
                'Topic = namespace',
                'Partition = unit de ordem',
                'Offset = posição imutável',
                'Retention por tempo/bytes',
                'Replicação via ISR',
              ],
            },
            {
              title: 'NATS core',
              items: [
                'Subject hierárquico',
                'Wildcards * e >',
                'Sem storage',
                'Fan-out gossip-style',
                'At-most-once',
              ],
            },
            {
              title: 'NATS JetStream',
              items: [
                'Stream filtra subjects',
                'Memory ou file store',
                'Sequence per stream',
                'Raft (R=1/3/5)',
                'At-least-once + idempotent',
              ],
            },
          ]}
        />
        <Callout tone="warn">
          Isso muda design: em Kafka você pensa em <em>partitions por chave</em>. Em NATS você pensa em <em>hierarquia de subjects</em>. Aplicações que dependem de routing dinâmico (subject wildcards) sofrem em Kafka; aplicações que dependem de ordering global por chave sofrem em NATS JetStream sem partitioned consumers.
        </Callout>
      </Section>

      <Section title="Consumer model" accent={accent}>
        <p>
          Em Kafka, consumers formam um <strong>consumer group</strong>. O coordinator atribui partitions; cada partition tem no máximo 1 consumer ativo no grupo. Offsets são commitados (auto ou manual) para o topic <InlineCode>__consumer_offsets</InlineCode>. Rebalance acontece quando consumers entram/saem.
        </p>
        <p>
          Em NATS core, subscribers são efêmeros. Em JetStream existem <strong>durable consumers</strong> com modos <em>push</em> ou <em>pull</em>, ACK policies (<InlineCode>none</InlineCode>, <InlineCode>all</InlineCode>, <InlineCode>explicit</InlineCode>), e <em>filter subject</em> que delimita o que cada consumer vê dentro do stream. Pull consumers (modo default recomendado) suportam batches e dão controle de backpressure ao cliente.
        </p>
        <CodeBlock lang="go" filename="nats_pull_consumer.go">{`// JetStream pull consumer (Go) — at-least-once com explicit ack
js, _ := nc.JetStream()

// Cria stream que captura tudo de orders.>
js.AddStream(&nats.StreamConfig{
    Name:      "ORDERS",
    Subjects:  []string{"orders.>"},
    Retention: nats.LimitsPolicy,
    Storage:   nats.FileStorage,
    Replicas:  3,
})

// Consumer durable, filtrando só new orders
sub, _ := js.PullSubscribe(
    "orders.*.new",
    "order-processor",
    nats.AckExplicit(),
    nats.ManualAck(),
    nats.MaxAckPending(1000),
)

for {
    msgs, err := sub.Fetch(50, nats.MaxWait(5*time.Second))
    if err != nil { continue }
    for _, m := range msgs {
        if err := processOrder(m.Data); err == nil {
            m.Ack()
        } else {
            m.Nak() // redelivery automático
        }
    }
}`}</CodeBlock>
        <CodeBlock lang="java" filename="KafkaConsumer.java">{`// Kafka consumer group — at-least-once
Properties p = new Properties();
p.put("bootstrap.servers", "b1:9092,b2:9092");
p.put("group.id", "order-processor");
p.put("enable.auto.commit", false);
p.put("isolation.level", "read_committed");
p.put("max.poll.records", 500);

try (KafkaConsumer<String,String> c = new KafkaConsumer<>(p)) {
    c.subscribe(List.of("orders.new"));
    while (running) {
        ConsumerRecords<String,String> recs = c.poll(Duration.ofMillis(500));
        for (ConsumerRecord<String,String> r : recs) {
            processOrder(r.value());
        }
        c.commitSync(); // commit offset depois do processamento
    }
}`}</CodeBlock>
      </Section>

      <Section title="Persistência, retention e replay" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Kafka', 'NATS JetStream']}
          rows={[
            ['Storage default', 'File (segments append-only)', 'File ou memory'],
            ['Retention', 'Tempo, bytes, compactação por chave', 'Tempo, bytes, mensagens, MaxMsgsPerSubject'],
            ['Replicação', 'ISR (in-sync replicas), acks=all', 'Raft (R=1, 3 ou 5)'],
            ['Replay arbitrário', 'Sim, por offset, qualquer ponto', 'Sim, por sequence, por subject filter, por time'],
            ['Compaction por chave', 'Sim, log compaction', 'Sim, com MaxMsgsPerSubject=1 + subject por chave'],
            ['Tiered storage', 'KIP-405, hot disk + cold object store', 'Não nativo (proposta em discussão)'],
            ['Tamanho típico', 'TBs a PBs por cluster', 'GBs a TBs por cluster (otimizado para working set)'],
          ]}
        />
        <Callout tone="info">
          Para data lake/CDC com retention de semanas e replays históricos massivos, Kafka + tiered storage é o estado-da-arte. Para working set quente de eventos recentes (horas/dias) com baixa latência, JetStream é mais barato operacionalmente.
        </Callout>
      </Section>

      <Section title="Latência: o gráfico que importa" accent={accent}>
        <p>
          Os <strong>benchmarks da Synadia (2024)</strong> publicaram números que ajudam a calibrar expectativa. Em payload de 256 bytes com fan-out de 10:1:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'NATS core P99', v: '~0.5–1 ms (sub-milissegundo)' },
            { k: 'NATS JetStream P99 (R=3 file)', v: '~5–15 ms' },
            { k: 'Kafka P99 (acks=all, linger=0)', v: '~10–30 ms' },
            { k: 'Kafka P99 (acks=all, linger=20ms)', v: '~30–80 ms' },
          ]}
        />
        <p>
          Esses números variam com hardware, payload, replication, mas o padrão é claro: NATS core é uma ordem de magnitude mais rápido que Kafka em latência ponta-a-ponta de payloads pequenos. Para throughput sustentado de payloads grandes, a diferença diminui (e Kafka frequentemente vence em bytes/s por broker por causa do batching).
        </p>
        <Callout tone="warn">
          Não use latência média (P50) — use P99 ou P99.9. P50 baixo com P99 explodindo é a regra em qualquer sistema com GC, lock contention ou disk fsync.
        </Callout>
      </Section>

      <Section title="Operação: footprint e complexidade" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Op', 'Kafka', 'NATS JetStream']}
          rows={[
            ['Binário', 'JVM (~200MB RSS idle) + KRaft controller', 'Go single binary (~30MB RSS idle)'],
            ['Dependências', 'KRaft (ou ZK em legado)', 'Nenhuma'],
            ['Cluster mínimo prod', '3 brokers + 3 controllers (ou combined)', '3 servers'],
            ['Geo-replicação', 'MirrorMaker 2 (Connect)', 'Supercluster com gateways nativos'],
            ['Schema management', 'Schema Registry (Confluent) externo', 'JetStream consumer-side ou external'],
            ['Observabilidade', 'JMX + Prometheus JMX exporter', '/varz, /streamz endpoints + Prometheus exporter'],
          ]}
        />
        <p>
          Time pequeno SRE/devops: NATS reduz drasticamente o custo operacional. Time grande já com Kafka rodando: o investimento em ferramental (Connect, Streams, ksqlDB, Schema Registry, kafka-ui) torna Kafka difícil de substituir.
        </p>
      </Section>

      <Section title="Recursos exclusivos que mudam decisão" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'NATS request-reply', v: 'Padrão RPC builtin via INBOX subject; útil para command/control sincronizado' },
            { k: 'NATS JetStream KV', v: 'Key-value store builtin (PUT/GET/WATCH/HISTORY); substitui Redis em muitos casos leves' },
            { k: 'NATS JetStream Object Store', v: 'Blob store builtin (chunked) — útil para artifacts pequenos em edge' },
            { k: 'NATS Subject hierarchy + wildcards', v: 'Routing dinâmico sem registrar topics; ótimo para multi-tenant fan-out' },
            { k: 'Kafka Streams / ksqlDB', v: 'Stream processing in-process (Streams) ou SQL declarativo (ksqlDB); maturidade enorme' },
            { k: 'Kafka Connect', v: '500+ connectors prontos (Debezium, JDBC, S3, Elastic, etc.)' },
            { k: 'Kafka Tiered Storage', v: 'Retention de meses/anos sem explodir custo de SSD (KIP-405)' },
            { k: 'Kafka Transactional Producer', v: 'EOS dentro do Kafka (read-process-write) com 2PC' },
          ]}
        />
      </Section>

      <Section title="Quando cada um vence (decisões reais)" accent={accent}>
        <DecisionBox
          scenario="Microsserviços conversando, latência crítica, fan-out alto, footprint mínimo"
          winner="NATS (core ou JetStream)"
          winnerColor={accent}
          why="NATS foi desenhado para isso. Subject routing + request-reply + sub-ms P99 + Go binary de 30MB. JetStream cobre os casos que precisam de durabilidade."
          alternatives={[
            { name: 'Kafka funciona, mas adiciona JVM, KRaft, Connect e complexidade que time pequeno não absorve' }
          ]}
        />
        <DecisionBox
          scenario="Pipeline de dados, CDC, ingestão de logs, analytics, retention de semanas/meses"
          winner="Kafka"
          winnerColor="#3b82f6"
          why="Tiered storage, Connect com Debezium/JDBC/S3, ksqlDB, Streams, Flink integração nativa. Ecossistema maduro e battle-tested em PB-scale."
          alternatives={[
            { name: 'NATS JetStream funciona para o caso de uso, mas a stack de stream processing e connectors é menor' }
          ]}
        />
        <DecisionBox
          scenario="IoT/edge com milhões de devices, mensagens pequenas, conectividade intermitente"
          winner="NATS"
          winnerColor={accent}
          why="MQTT-compatível em NATS 2.10+, leaf nodes em edge, multi-tenancy nativo (accounts), JetStream local em edge com replicação para cloud."
          alternatives={[
            { name: 'MQTT puro (Mosquitto, EMQX) é alternativa clássica; Kafka raramente é a melhor escolha para edge' }
          ]}
        />
        <DecisionBox
          scenario="Exactly-once dentro de um pipeline read-process-write"
          winner="Kafka"
          winnerColor="#3b82f6"
          why="Transactional producer + read_committed consumer + idempotent producer dá EOS dentro do Kafka. Padrão consolidado, documentado, com Streams já abstraído."
          alternatives={[
            { name: 'JetStream tem idempotent producers (msg ID dedup), mas EOS cross-stream end-to-end é mais artesanal' }
          ]}
        />
      </Section>

      <Section title="Timeline da convergência" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { t: '2011', label: 'Kafka 0.7 (LinkedIn, OSS)' },
            { t: '2011', label: 'NATS 0.x (Apcera/CloudFoundry, Ruby/Go)' },
            { t: '2017', label: 'Kafka 0.11: idempotent producer + transactions (EOS dentro do Kafka)' },
            { t: '2020', label: 'NATS 2.2: JetStream GA (persistência + replay)' },
            { t: '2022', label: 'Kafka 3.3: KRaft GA (adeus Zookeeper)' },
            { t: '2023', label: 'Kafka 3.6: Tiered Storage GA (KIP-405)' },
            { t: '2023', label: 'NATS 2.10: subject mapping, weighted routing, partitioned consumers' },
            { t: '2024', label: 'NATS 2.11: improved JetStream KV, multi-cluster mirroring' },
            { t: '2025', label: 'Kafka 4.0: Zookeeper removido definitivamente' },
            { t: '2026', label: 'Coexistência: NATS para service mesh de eventos, Kafka para data backbone' },
          ]}
        />
      </Section>

      <Section title="Padrão híbrido (cada vez mais comum)" accent={accent}>
        <p>
          Empresas grandes usam <strong>os dois</strong>. NATS na camada de microsserviços/edge (eventos efêmeros de aplicação, request-reply, comandos), Kafka na camada de dados (eventos de domínio com retention longa, ingestão, analytics). Bridge entre eles via NATS-Kafka connector ou via Debezium/Connect lendo de tópicos JetStream específicos.
        </p>
        <FlowDiagram
          title="Arquitetura híbrida"
          accent={accent}
          steps={[
            { label: 'Edge devices / mobile', desc: 'MQTT/NATS leaf nodes' },
            { label: 'NATS supercluster (eventos quentes)', desc: 'Request-reply, KV, comandos, latência sub-ms' },
            { label: 'Bridge NATS → Kafka', desc: 'JetStream consumer publica em Kafka topic' },
            { label: 'Kafka backbone (eventos frios + analytics)', desc: 'Retention longa, Connect, Streams, Flink' },
            { label: 'Sinks: data lake, ETL, ML, dashboards', desc: 'Iceberg, Snowflake, BigQuery, Elasticsearch' },
          ]}
        />
      </Section>

      <Section title="Checklist para decidir hoje" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Latência P99 < 5ms é requisito?', v: 'NATS provavelmente' },
            { k: 'Retention > 7 dias com replay massivo?', v: 'Kafka provavelmente' },
            { k: 'Time SRE pequeno (< 3 pessoas)?', v: 'NATS reduz superfície operacional' },
            { k: 'Já tem Confluent/MSK rodando?', v: 'Kafka é o caminho de menor atrito' },
            { k: 'Precisa de Debezium/CDC?', v: 'Kafka (Connect tem Debezium nativo)' },
            { k: 'Edge/IoT/multi-region com baixa banda?', v: 'NATS (supercluster + leaf nodes)' },
            { k: 'Stream processing complexo (SQL, windows, joins)?', v: 'Kafka (Streams, Flink, ksqlDB)' },
            { k: 'Request-reply síncrono entre services?', v: 'NATS (builtin)' },
          ]}
        />
        <Callout tone="success">
          Não existe escolha errada — existe escolha errada para o seu caso. A pergunta certa não é "qual é melhor", é "qual é melhor para o perfil de tráfego, time e SLO que tenho hoje, com horizonte de 2–3 anos".
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
