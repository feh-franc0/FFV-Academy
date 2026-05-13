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
  StackFlow,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('pulsar-multi-tenant');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'A arquitetura de "compute/storage separados" do Pulsar significa o quê concretamente?',
    options: [
      'Roda em containers',
      'Brokers (compute) são stateless: aceitam producers/consumers, mantêm cursor de subscription, mas NÃO armazenam dados localmente. BookKeeper (storage) é o componente que persiste mensagens em "ledgers" replicados. Isso permite escalar brokers e storage independentemente, fazer rebalance de tópicos entre brokers em segundos, e usar bookies em hardware otimizado para I/O sem afetar brokers',
      'Tem dois processos no mesmo nó',
      'Usa Kubernetes obrigatoriamente',
    ],
    correct: 1,
    explanation:
      'Esse design é a diferença mais profunda vs Kafka. Em Kafka, partition leader é amarrada a um broker específico (com seus arquivos locais); rebalance custa caro (cópia de TB). Em Pulsar, broker só serve; storage é em BookKeeper (bookies independentes). Trocar broker que serve um tópico é mover um ponteiro, não copiar dados.',
  },
  {
    question: 'Tenant/Namespace/Topic na hierarquia Pulsar serve para quê?',
    options: [
      'Só organização visual',
      'Cada nível tem políticas próprias: tenant define isolamento administrativo (auth, quotas, recursos), namespace agrupa tópicos relacionados com políticas comuns (retention, message TTL, backlog, replication clusters, schema), topic é o canal de fato. Permite multi-tenancy real onde um cluster atende vários times/produtos com isolamento de policies sem clusters separados',
      'Apenas namespaces',
      'É só para Kafka compat',
    ],
    correct: 1,
    explanation:
      'Multi-tenancy nativa é o diferencial competitivo do Pulsar. Em Kafka, multi-tenancy é alcançada com ACLs + naming convention; em Pulsar, é um conceito de primeira classe: tenant tem authorização separada, namespace tem retention/replication/quotas próprios, e o operator pode oferecer "Pulsar as a service" interno sem cluster por time.',
  },
  {
    question: 'Geo-replication built-in funciona como?',
    options: [
      'Via Kafka Connect MirrorMaker',
      'Você marca um namespace como "replicated" entre N clusters geo-distribuídos; o broker em cada cluster automaticamente replica mensagens publicadas localmente para os outros clusters via async producer interno. Não precisa de processo externo (MirrorMaker, Connect); o próprio broker faz. Suporta active-active com semântica de "produce em qualquer cluster, consume em qualquer cluster"',
      'Não suporta geo-replicação',
      'Só funciona com 2 clusters',
    ],
    correct: 1,
    explanation:
      'Esse é outro diferencial vs Kafka (onde MirrorMaker 2 ou Confluent Replicator são processos externos com seu próprio operacional). Em Pulsar, configurar replicação é mudar uma policy do namespace. Mensagens replicadas têm metadata "replicatedFrom" para evitar loops. Active-active funciona naturalmente.',
  },
  {
    question: 'BookKeeper ledger é o quê?',
    options: [
      'Um banco SQL',
      'Append-only log replicado, criado para cada segmento de tópico Pulsar; cada ledger tem N bookies (E ensemble, Qw write quorum, Qa ack quorum), os bookies armazenam entradas e o ledger fecha quando atinge tamanho/idade — após fechado é imutável. Permite cópia paralela entre bookies, escala horizontal por ledger e separação compute/storage clean',
      'Um arquivo único',
      'Cache em memória apenas',
    ],
    correct: 1,
    explanation:
      'BookKeeper foi originalmente criado para o write-ahead log do HDFS NameNode HA. Pulsar reusa: cada topic é dividido em ledgers; bookies são storage nodes. E/Qw/Qa controlam replicação e durabilidade. Quando ledger fecha, ele é imutável (compactação acontece criando ledger novo). Esse modelo permite operar storage e compute independentemente.',
  },
  {
    question: 'Pulsar Functions resolve qual problema?',
    options: [
      'É só um alias de Lambda',
      'Stream processing leve in-cluster: você escreve uma função em Java/Python/Go que consome de tópico(s), processa, e produz em outro tópico, e o cluster Pulsar roda essa função em pods leves (function workers). Sem Flink/Streams separado. Bom para transformações simples (mapeamento, filtro, enrichment), mas não substitui Flink em joins/windowing complexos',
      'Substitui Flink',
      'Lambdas serverless externos',
    ],
    correct: 1,
    explanation:
      'Pulsar Functions é o "serverless dentro do Pulsar". Function workers (processo separado dos brokers) executam funções. Modelo de execução: thread, process ou Kubernetes pod. Útil para evitar adicionar Flink em transformações simples. Para windowing, joins de streams ou state grande, Flink continua sendo a escolha.',
  },
  {
    question: 'Pulsar IO connectors funcionam parecido com Kafka Connect, mas com qual diferença?',
    options: [
      'Nenhuma diferença, é fork',
      'Executam dentro do cluster Pulsar (em function workers), não em processo separado tipo Connect worker; reusam infraestrutura de gerenciamento, observabilidade e isolamento do Pulsar Functions; o ecossistema é menor (dezenas de connectors vs 500+ do Kafka Connect), mas para Postgres, S3, Elasticsearch, Cassandra, Debezium etc., há connectors oficiais',
      'Não suportam Debezium',
      'Só funcionam em Java',
    ],
    correct: 1,
    explanation:
      'Pulsar IO é integrado: connectors rodam como Functions especializadas. Vantagem: menos infraestrutura paralela. Desvantagem: ecossistema menor. Em 2026 isso ainda é o principal "calcanhar de Aquiles" do Pulsar vs Kafka — quando você precisa de connector exótico, Kafka Connect vence pela quantidade.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="pulsar-multi-tenant"
      title="Apache Pulsar: multi-tenant + geo-replication nativos"
      icon="🌐"
      xp={70}
      readTime={14}
      trailName="Mensageria & Streaming"
      trailColor={accent}
      nextSlug="queue-patterns-dlq"
      nextTitle="Queue patterns: DLQ, retry, idempotência, ordering"
      quiz={quiz}
    >
      <Section title="A tese do Pulsar em uma frase" accent={accent}>
        <p>
          <strong>Apache Pulsar</strong> (criado no Yahoo em 2013, OSS 2016, top-level Apache 2018) é a única plataforma mainstream de mensageria com três diferenciais nativos: <em>multi-tenancy</em> de primeira classe, <em>geo-replicação</em> sem componente externo, e <em>separação compute/storage</em> via BookKeeper. Quando esses requisitos importam, Pulsar é a escolha óbvia. Quando não importam, Kafka costuma ganhar pelo ecossistema.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Origem', v: 'Yahoo (2013, interno), Apache OSS 2016, top-level project 2018' },
            { k: 'Lang', v: 'Brokers em Java; BookKeeper em Java; clients em Java/Python/Go/C++/.NET' },
            { k: 'Modelo de tópico', v: 'Multi-tenant: persistent://tenant/namespace/topic' },
            { k: 'Subscription model', v: 'Exclusive, Shared, Failover, Key_Shared (cada uma tem semântica de delivery diferente)' },
            { k: 'Storage', v: 'BookKeeper (ledgers replicados); brokers stateless' },
            { k: 'Tiered storage', v: 'Nativo, offload para S3/GCS/Azure/HDFS' },
            { k: 'Geo-replication', v: 'Nativa, por namespace policy' },
            { k: 'Kafka compat', v: 'KoP (Kafka-on-Pulsar protocol handler) — produtores/consumidores Kafka funcionam sem mudar código' },
          ]}
        />
      </Section>

      <Section title="Hierarquia tenant/namespace/topic" accent={accent}>
        <p>
          Endereço de um tópico Pulsar é <InlineCode>persistent://&lt;tenant&gt;/&lt;namespace&gt;/&lt;topic&gt;</InlineCode>. Cada nível tem políticas próprias:
        </p>
        <ArchFlow
          title="Camadas administrativas"
          accent={accent}
          columns={[
            {
              title: 'Tenant',
              items: [
                'Unidade administrativa',
                'Auth/role próprios',
                'Quotas de cluster',
                'Isolation de configuração',
                'Ex: time-pagamentos, time-analytics',
              ],
            },
            {
              title: 'Namespace',
              items: [
                'Agrupa tópicos relacionados',
                'Retention/TTL/backlog',
                'Replication clusters list',
                'Schema validation',
                'Auth ACLs',
                'Ex: orders, customer-events',
              ],
            },
            {
              title: 'Topic',
              items: [
                'Canal de mensagens',
                'persistent ou non-persistent',
                'Particionado ou não',
                'Schema vinculado',
                'Ex: persistent://payments/orders/new',
              ],
            },
          ]}
        />
        <Callout tone="info">
          Em Kafka, multi-tenancy é simulada com ACL prefix + nomes-padrão (<InlineCode>{'pmts_orders_new'}</InlineCode>). Em Pulsar é hierárquico de verdade: você dá ao time pagamentos um tenant inteiro com suas próprias quotas, sem mexer em quotas de outros tenants.
        </Callout>
      </Section>

      <Section title="Arquitetura: brokers stateless + BookKeeper" accent={accent}>
        <StackFlow
          title="Stack de uma write"
          accent={accent}
          items={[
            { layer: 'Producer (Java/Py/Go client)', tech: 'Envia mensagem ao broker via TCP (Pulsar binary protocol)' },
            { layer: 'Broker (compute)', tech: 'Stateless. Roteia ao ledger correto do tópico' },
            { layer: 'BookKeeper client (no broker)', tech: 'Envia entrada ao ensemble de bookies em paralelo' },
            { layer: 'Bookies (storage)', tech: 'Write-ahead log + journal + ledger storage; ack quando Qa confirmaram' },
            { layer: 'Broker recebe Qa acks', tech: 'Confirma write ao producer' },
            { layer: 'Bookies (compaction)', tech: 'Background: compaction + tiered offload para S3/GCS' },
          ]}
        />
        <p>
          Parâmetros do ensemble:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'E (ensemble size)', v: 'Quantos bookies participam de um ledger. Default 3' },
            { k: 'Qw (write quorum)', v: 'Quantos bookies recebem cada entrada. Default 3 (≤ E)' },
            { k: 'Qa (ack quorum)', v: 'Quantos precisam confirmar antes do ack ao producer. Default 2 (≤ Qw)' },
          ]}
        />
        <Callout tone="warn">
          Trade-off clássico: E=5, Qw=3, Qa=2 dá tolerância a 1 falha sem perder write e permite leitura distribuída. E=Qw=Qa=3 dá durabilidade máxima mas zero tolerância a falha durante write. Para prod: <strong>E=3, Qw=3, Qa=2</strong> é o ponto padrão.
        </Callout>
      </Section>

      <Section title="Subscription models — escolha que muda tudo" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Modelo', 'Comportamento', 'Análogo Kafka']}
          rows={[
            ['Exclusive', '1 consumer ativo. Falha → erro', 'Não existe direto (similar a max.poll de 1 consumer)'],
            ['Failover', '1 consumer ativo, outros em standby. Falha → próximo assume', 'Consumer group com 1 partition'],
            ['Shared', 'N consumers, mensagens distribuídas round-robin. Sem ordering', 'Não existe — Kafka sempre ordena por partition'],
            ['Key_Shared', 'N consumers, mensagens com mesma key vão ao mesmo consumer (ordering por key)', 'Consumer group com partitioner por key'],
          ]}
        />
        <Callout tone="success">
          <strong>Shared subscription</strong> é o que Pulsar tem e Kafka não: distribui carga sem precisar criar N partitions. Trade-off: você perde ordering. <strong>Key_Shared</strong> é o meio-termo: paralelismo + ordering por chave.
        </Callout>
        <CodeBlock lang="java" filename="PulsarConsumer.java">{`PulsarClient client = PulsarClient.builder()
    .serviceUrl("pulsar://broker1:6650,broker2:6650,broker3:6650")
    .build();

Consumer<byte[]> consumer = client.newConsumer()
    .topic("persistent://payments/orders/new")
    .subscriptionName("order-processor")
    .subscriptionType(SubscriptionType.Key_Shared)
    .keySharedPolicy(KeySharedPolicy.autoSplitHashRange())
    .ackTimeout(30, TimeUnit.SECONDS)
    .negativeAckRedeliveryDelay(10, TimeUnit.SECONDS)
    .deadLetterPolicy(DeadLetterPolicy.builder()
        .maxRedeliverCount(5)
        .deadLetterTopic("persistent://payments/orders/new-dlq")
        .build())
    .subscribe();

while (true) {
    Message<byte[]> msg = consumer.receive();
    try {
        process(msg.getValue(), msg.getKey());
        consumer.acknowledge(msg);
    } catch (Exception e) {
        consumer.negativeAcknowledge(msg);
    }
}`}</CodeBlock>
      </Section>

      <Section title="Geo-replication nativa" accent={accent}>
        <p>
          Em Kafka, replicação geográfica exige <strong>MirrorMaker 2</strong> ou <strong>Confluent Replicator</strong> — processos externos com seu próprio Connect cluster, configuração, monitoramento e modos (active-active complica). Em Pulsar, é uma policy de namespace:
        </p>
        <CodeBlock lang="bash" filename="enable-geo-replication.sh">{`# Tenant tem clusters permitidos
pulsar-admin tenants create payments \\
  --admin-roles payments-admin \\
  --allowed-clusters us-east,us-west,eu-west

# Namespace habilita replicação entre clusters
pulsar-admin namespaces set-clusters payments/orders \\
  --clusters us-east,us-west,eu-west

# A partir daqui, qualquer tópico publicado em qualquer um dos 3 clusters
# é automaticamente replicado para os outros, com metadata replicatedFrom
# para evitar loops.`}</CodeBlock>
        <FlowDiagram
          title="Active-active geo-replication"
          accent={accent}
          steps={[
            { label: 'Producer (us-east)', desc: 'Publish em persistent://payments/orders/new' },
            { label: 'Broker us-east', desc: 'Persiste localmente + replica via async producer interno' },
            { label: 'Brokers us-west e eu-west', desc: 'Recebem com replicatedFrom=us-east, persistem (não re-replicam)' },
            { label: 'Consumers em qualquer cluster', desc: 'Veem todas as mensagens; ordering eventual entre clusters' },
            { label: 'Falha de cluster', desc: 'Outros continuam servindo; recovery automático quando voltar' },
          ]}
        />
        <Callout tone="info">
          Para active-active estrito (mesma sequência de mensagens em todos os clusters), você precisa de "deduplicação" e cuidado com clock skew. Pulsar oferece dedup nativo via message ID. Para casos de "DR somente" (1 cluster ativo + 1 standby), basta ativar a policy.
        </Callout>
      </Section>

      <Section title="Tiered storage: retention sem explodir custo" accent={accent}>
        <p>
          Ledgers fechados (segmentos imutáveis) podem ser offloaded para S3/GCS/Azure/HDFS automaticamente:
        </p>
        <CodeBlock lang="bash" filename="tiered-offload.sh">{`# Habilita offload para S3 no namespace
pulsar-admin namespaces set-offload-policies payments/orders \\
  --driver aws-s3 \\
  --bucket pulsar-archive-payments \\
  --region us-east-1 \\
  --offload-after-elapsed 7d \\
  --offload-after-threshold 100GB

# Ledgers > 7 dias OU acima de 100GB são automaticamente movidos para S3.
# Leituras antigas vão direto ao S3 (transparente para o consumer).`}</CodeBlock>
        <Callout tone="success">
          Mesma ideia que Kafka KIP-405 (tiered storage), mas em Pulsar existe desde 2.1 (2018) — anos antes de Kafka. Para retention de meses/anos com 90% dos dados em S3 (custo ~$0.023/GB) em vez de SSD ($0.10–0.25/GB), o TCO cai drasticamente.
        </Callout>
      </Section>

      <Section title="Pulsar Functions e Pulsar IO" accent={accent}>
        <p>
          Stream processing leve in-cluster (Functions) e connectors integrados (IO) usam a mesma runtime: <em>function workers</em>.
        </p>
        <CodeBlock lang="python" filename="enrichment_function.py">{`# Pulsar Function (Python) — enrichment simples
from pulsar import Function

class EnrichOrder(Function):
    def process(self, input_bytes, context):
        import json
        order = json.loads(input_bytes)
        # Enrichment: adicionar tier do customer via lookup
        customer = context.get_state("customer:" + order["customer_id"])
        if customer:
            order["customer_tier"] = customer.get("tier", "basic")
        else:
            order["customer_tier"] = "unknown"
        order["enriched_at"] = context.get_current_message_topic_name()
        return json.dumps(order).encode()

# Deploy:
# pulsar-admin functions create \\
#   --py enrich.py --classname enrich.EnrichOrder \\
#   --inputs persistent://payments/orders/new \\
#   --output persistent://payments/orders/enriched \\
#   --tenant payments --namespace orders --name enrich`}</CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['Caso', 'Pulsar Functions', 'Apache Flink']}
          rows={[
            ['Map/filter simples', '✅ Ergonomia melhor', '✅ Funciona, mas overkill'],
            ['Stateful agregação', '🟡 State limitado por function', '✅ RocksDB state, checkpoints'],
            ['Windowing complexo', '❌', '✅ Event time, watermarks'],
            ['Joins de streams', '❌', '✅ Interval joins, temporal joins'],
            ['Exactly-once', '🟡 Idempotency manual', '✅ 2PC via Flink sinks'],
            ['Infraestrutura separada', '✅ Roda no Pulsar', '❌ Cluster Flink + Job/TaskManagers'],
          ]}
        />
      </Section>

      <Section title="Pulsar vs Kafka: a comparação justa" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Kafka', 'Pulsar']}
          rows={[
            ['Arquitetura', 'Broker = compute + storage (Kafka KRaft simplifica metadata)', 'Broker stateless + BookKeeper storage'],
            ['Rebalance', 'Caro (cópia de TB entre brokers)', 'Cheap (move ponteiro de ledger ownership)'],
            ['Multi-tenancy', 'ACLs + naming convention', 'Nativa: tenant/namespace/topic'],
            ['Geo-replication', 'MirrorMaker 2 (externo)', 'Nativa por policy de namespace'],
            ['Tiered storage', 'KIP-405 (3.6+, 2023)', 'Desde 2.1 (2018)'],
            ['Subscription models', 'Consumer groups (ordering por partition)', 'Exclusive/Shared/Failover/Key_Shared'],
            ['Stream processing in-cluster', 'Kafka Streams (cliente Java)', 'Pulsar Functions (Java/Py/Go runtime)'],
            ['Ecosystem connectors', '500+ via Kafka Connect', 'Dezenas via Pulsar IO'],
            ['Mercado / adoção', 'Domínio absoluto', 'Crescente em casos multi-tenant/geo'],
            ['Latência típica', 'P99 10–50ms (acks=all)', 'P99 5–25ms'],
            ['Operação', 'Madura, muito documentada', 'Mais complexa (broker + BK + ZK/Oxia)'],
          ]}
        />
      </Section>

      <Section title="Quando Pulsar vence Kafka" accent={accent}>
        <DecisionBox
          scenario="Plataforma interna 'messaging-as-a-service' com 50+ times consumidores"
          winner="Pulsar"
          winnerColor={accent}
          why="Multi-tenancy nativa elimina cluster-por-time. Cada tenant tem isolamento real (auth, quotas, namespaces). Operacionalmente impagável para empresas grandes."
          alternatives={[
            { name: 'Confluent com namespace-prefix + ACLs cobre, mas com ergonomia inferior' }
          ]}
        />
        <DecisionBox
          scenario="Aplicação ativo-ativo entre us-east, us-west, eu-west sem MirrorMaker"
          winner="Pulsar"
          winnerColor={accent}
          why="Geo-replication nativa por policy. Producers/consumers em qualquer cluster, semântica de replicação clara, sem stack extra de Connect."
          alternatives={[
            { name: 'Confluent Replicator para Kafka, mas adiciona Connect cluster por região' }
          ]}
        />
        <DecisionBox
          scenario="Mistura de fila (queue-like) e log (Kafka-like) na mesma plataforma"
          winner="Pulsar"
          winnerColor={accent}
          why="Subscription Shared elimina a necessidade de N partitions para escala de queue. Mesmo topic suporta múltiplas subscriptions com semânticas diferentes."
          alternatives={[
            { name: 'Kafka + RabbitMQ separados, ou Kafka apenas (com perda de ergonomia queue)' }
          ]}
        />
        <DecisionBox
          scenario="Ecossistema rico de Connect (Debezium + 20 sinks específicos)"
          winner="Kafka"
          winnerColor="#3b82f6"
          why="Pulsar IO tem connectors essenciais (Debezium, S3, JDBC), mas Kafka Connect tem 500+ connectors maduros."
          alternatives={[
            { name: 'Usar Kafka Connect com KoP no Pulsar como broker — funciona mas estranho' }
          ]}
        />
      </Section>

      <Section title="Timeline" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { t: '2013', label: 'Yahoo desenvolve Pulsar interno' },
            { t: '2016', label: 'OSS no Yahoo GitHub' },
            { t: '2017', label: 'Apache Incubator' },
            { t: '2018', label: 'Apache top-level project; Tiered Storage GA' },
            { t: '2019', label: 'Pulsar Functions + Pulsar IO maduros' },
            { t: '2020', label: 'KoP (Kafka-on-Pulsar) torna producers/consumers Kafka compatíveis' },
            { t: '2021', label: 'StreamNative (empresa principal) lança Pulsar Cloud managed' },
            { t: '2022', label: 'Transactions GA; suporte a Kubernetes Operator melhorado' },
            { t: '2023', label: 'Oxia (substituto do ZooKeeper, mantido por StreamNative) projeto novo' },
            { t: '2024', label: 'Adoção em telcos, fintechs multi-region (Tencent, Yahoo Japan, Splunk)' },
            { t: '2026', label: 'Coexistência com Kafka: Pulsar dominante em multi-tenant/geo, Kafka dominante em ecossistema de connectors' },
          ]}
        />
      </Section>

      <Section title="Anti-patterns e armadilhas" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Subir Pulsar sem multi-tenant/geo', v: 'Operacional é mais complexo que Kafka — sem o diferencial, Kafka ganha por simplicidade' },
            { k: 'Ignorar Bookies', v: 'BK precisa de I/O dedicado, journal em SSD separado, capacity planning próprio' },
            { k: 'Usar Shared subscription quando queria ordering', v: 'Shared não preserva ordem; use Key_Shared se precisar ordering por chave' },
            { k: 'E/Qw/Qa mal calibrados', v: 'E=Qw=Qa=3 dá zero margem; padrão é Qa<Qw para tolerar bookie lento sem bloquear write' },
            { k: 'Replicação sem dedup', v: 'Active-active sem dedup pode entregar mensagem duas vezes em failover; use message ID dedup' },
            { k: 'Functions para processamento pesado', v: 'Functions é para transformações leves; joins/windowing → Flink' },
          ]}
        />
      </Section>

      <Section title="Checklist de produção" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Bookies', v: '3+ por cluster, journal em SSD NVMe dedicado, ledger storage em HDD/SSD separado' },
            { k: 'Brokers', v: '3+, stateless, auto-scaling por CPU/memory' },
            { k: 'Metadata store', v: 'ZooKeeper ensemble (5 nodes) ou Oxia (2.10+); 3 mínimos' },
            { k: 'E/Qw/Qa', v: 'E=3, Qw=3, Qa=2 — durável e tolerante' },
            { k: 'Tiered storage', v: 'Habilitado para namespaces com retention > 7 dias' },
            { k: 'Geo-replication', v: 'Policies por namespace; dedup ativo se active-active' },
            { k: 'Authentication', v: 'JWT ou mTLS (nunca anonymous em prod)' },
            { k: 'Observabilidade', v: '/metrics Prometheus + pulsar-admin stats; alarmes em backlog' },
            { k: 'Backup', v: 'Tiered offload já cobre dados antigos; metadata via pulsar-admin export' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
