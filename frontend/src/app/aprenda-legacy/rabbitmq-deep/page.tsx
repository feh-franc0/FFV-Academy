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

export const metadata = getModuleMetadata('rabbitmq-deep');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'No protocolo AMQP 0-9-1, qual é o caminho exato que uma mensagem percorre do producer até o consumer?',
    options: [
      'Producer → queue direto',
      'Producer publica em exchange (não em queue) com routing key; o exchange decide para qual(is) queue(s) entregar baseado no tipo (direct/topic/fanout/headers) e nos bindings; consumers se inscrevem em queues; o broker entrega via push (basic.deliver) ou pull (basic.get)',
      'Producer publica direto em consumer',
      'Sempre via DLX',
    ],
    correct: 1,
    explanation:
      'AMQP 0-9-1 separa exchange (routing) de queue (storage/delivery). Producer NUNCA publica em queue diretamente — sempre em um exchange (a default exchange "" tem binding implícito por nome de queue, o que cria a ilusão). Esse design permite fan-out, topic matching e routing complexo sem o producer saber consumers.',
  },
  {
    question: 'Qual é a diferença entre exchange "topic" e exchange "direct"?',
    options: [
      'Nenhuma, são sinônimos',
      'Direct faz match exato entre routing key e binding key (orders.new == orders.new); topic suporta wildcards: * (uma palavra) e # (zero ou mais palavras), separados por ponto — ex: orders.*.new ou orders.# — permitindo subscrição hierárquica',
      'Topic só funciona em Erlang',
      'Direct é depreciado',
    ],
    correct: 1,
    explanation:
      'Direct: alta performance, routing simples 1:1 ou N:1 com chaves exatas. Topic: roteamento hierárquico, útil quando subjects naturalmente formam árvores (orders.region.action, logs.service.level). Topic tem custo computacional ligeiramente maior pelo matching, mas é o exchange mais usado em prática.',
  },
  {
    question: 'Por que quorum queues substituíram mirrored queues em produção (a partir do RabbitMQ 3.8+)?',
    options: [
      'Performance bruta',
      'Mirrored queues usavam um algoritmo de sincronização frágil (sync via Erlang messages, sem consenso formal) que sofria de split-brain, perda silenciosa de mensagens em network partition e re-sync caríssimo; quorum queues usam Raft (via biblioteca Ra), com semântica de consenso formal, recuperação previsível e zero split-brain. RabbitMQ 4.0 marcou mirrored queues como removidas',
      'Eram em Python',
      'Quorum custa mais',
    ],
    correct: 1,
    explanation:
      'Mirrored queues funcionavam bem em rede estável, mas em failure modes reais (partition, kill -9 do master) tinham perda de mensagens documentada e re-sync que congelava o cluster. Quorum queues, baseadas em Raft, dão semântica formal: maioria do quórum confirma antes do ack, e logs determinísticos permitem recovery confiável.',
  },
  {
    question: 'Streams (RabbitMQ 3.9+) competem com Kafka em quê?',
    options: [
      'Em nada, é só rebranding de queue',
      'Adicionam um log persistente append-only (segmentos no disco) com retention por tempo/bytes, suporte a replay arbitrário (consumer especifica offset/timestamp), throughput muito maior que quorum queues e protocolo binário próprio (não AMQP) — preenchendo o gap "event streaming" dentro do RabbitMQ sem precisar Kafka separado',
      'Só funcionam em memória',
      'Não suportam replicação',
    ],
    correct: 1,
    explanation:
      'Streams são log-based (não queue-based). Mantêm posição por consumer, suportam replay, têm protocolo binário otimizado (stream protocol, porta 5552), e replicam via Raft. Não substituem queues clássicas (work distribution efêmera ainda é melhor em queue), mas cobrem casos de event sourcing/audit log sem precisar adicionar Kafka ao stack.',
  },
  {
    question: 'Dead Letter Exchange (DLX) é configurado como?',
    options: [
      'Variável de ambiente global',
      'Argumento da queue (x-dead-letter-exchange) que aponta para um exchange (não diretamente para uma queue), e opcionalmente x-dead-letter-routing-key; mensagens rejeitadas (basic.reject com requeue=false), TTL expirado ou queue cheia são re-publicadas nesse exchange',
      'Headers da mensagem apenas',
      'Plugin externo',
    ],
    correct: 1,
    explanation:
      'DLX é per-queue. Você cria um exchange (geralmente direct), define x-dead-letter-exchange na queue original e binda uma DLQ ao DLX. Causas de dead-lettering: rejeição explícita, TTL expirou, queue length excedeu (com x-overflow=reject-publish-dlx). É padrão para retry+DLQ pipelines.',
  },
  {
    question: 'No RabbitMQ Kubernetes Operator (cluster-operator), o que ele NÃO faz por você?',
    options: [
      'Cria RabbitmqCluster CRD',
      'Roda upgrades automáticos sem revisão humana de breaking changes entre versões majors (3.x → 4.x), define política de backup de quorum data (responsabilidade do operador humano via Velero/snapshots), nem decide retention/storage class — ele provisiona, configura TLS, plugins, expõe metrics, mas o desenho de capacidade/SLO é seu',
      'Provisiona pods',
      'Configura TLS',
    ],
    correct: 1,
    explanation:
      'O operator cuida do "dia 2 operacional" de provisão, mas não substitui o engenheiro: você define replicas, resources, storage class, plugins, policies. Upgrades de major requerem leitura de release notes (especialmente 3.13→4.0 que removeu mirrored queues). Backup ainda é tarefa do operador humano (snapshot do PV ou export de definitions).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rabbitmq-deep"
      title="RabbitMQ profundo: AMQP, exchanges, quorum, streams"
      icon="🐰"
      xp={65}
      readTime={13}
      trailName="Mensageria & Streaming"
      trailColor={accent}
      nextSlug="sqs-sns-aws"
      nextTitle="SQS + SNS + EventBridge: AWS messaging stack"
      quiz={quiz}
    >
      <Section title="Por que RabbitMQ ainda importa em 2026" accent={accent}>
        <p>
          Em meio à explosão de Kafka, NATS e Pulsar, RabbitMQ continua sendo a escolha default de mensageria task-queue em ecossistemas Python (Celery), Ruby (Sidekiq-AMQP), .NET (MassTransit) e Java (Spring AMQP). A combinação de <strong>AMQP 0-9-1</strong> bem especificado, routing flexível via exchanges, semântica clara de ack/reject, e a chegada de <strong>quorum queues</strong> (3.8+) e <strong>streams</strong> (3.9+) cobriu as duas fraquezas históricas (consistência em partition e event-streaming).
        </p>
        <Callout tone="info">
          A grande mudança 2020 → 2026: <strong>mirrored queues morreram</strong> (RabbitMQ 4.0 removeu), <strong>quorum queues</strong> (Raft) são o default para durabilidade, e <strong>streams</strong> cobrem o caso event-log dentro do mesmo broker. O Erlang continua sendo o detalhe inevitável do operacional.
        </Callout>
      </Section>

      <Section title="Modelo AMQP 0-9-1: o caminho da mensagem" accent={accent}>
        <p>
          Diferente de Kafka (producer → topic/partition → consumer) e NATS (producer → subject → subscriber), AMQP introduz uma camada explícita de <strong>roteamento</strong> entre producer e queue. Producer NÃO publica em queue diretamente — publica em <strong>exchange</strong> com uma <em>routing key</em>. O exchange consulta seus <em>bindings</em> e entrega para zero, uma ou várias queues.
        </p>
        <FlowDiagram
          title="Caminho AMQP 0-9-1"
          accent={accent}
          steps={[
            { label: 'Producer (basic.publish)', desc: 'exchange="orders", routing_key="orders.us.new"' },
            { label: 'Exchange', desc: 'tipo direct/topic/fanout/headers' },
            { label: 'Binding(s)', desc: 'exchange → queue com pattern' },
            { label: 'Queue', desc: 'classic / quorum / stream — armazena' },
            { label: 'Consumer (basic.consume)', desc: 'push (auto/manual ack) ou pull (basic.get)' },
            { label: 'Ack / Reject / Nack', desc: 'reject+requeue=false → DLX se configurado' },
          ]}
        />
        <Callout tone="warn">
          Tem uma exchange especial chamada <strong>default exchange</strong> (nome <InlineCode>{'""'}</InlineCode>) que tem binding implícito: routing_key igual ao nome da queue entrega àquela queue. Isso cria a ilusão de "publish direto na queue", mas é só açúcar sintático.
        </Callout>
      </Section>

      <Section title="Os 4 tipos de exchange" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tipo', 'Lógica de routing', 'Caso de uso']}
          rows={[
            ['direct', 'routing_key == binding_key (exato)', 'Routing 1:1 ou N:1 simples, alta performance'],
            ['topic', 'pattern match com * e # (separados por .)', 'Hierarquia (orders.*.new, logs.#), routing dinâmico'],
            ['fanout', 'broadcast: entrega para TODAS queues bound (ignora key)', 'Pub/sub puro, notificações em massa'],
            ['headers', 'match por argumentos de header (x-match=any/all)', 'Routing complexo sem encaixar em key string'],
          ]}
        />
        <CodeBlock lang="python" filename="rabbit_topic_routing.py">{`import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Declare topic exchange e queues
channel.exchange_declare(exchange='orders', exchange_type='topic', durable=True)

channel.queue_declare(queue='orders.us', durable=True,
                      arguments={'x-queue-type': 'quorum'})
channel.queue_declare(queue='orders.new', durable=True,
                      arguments={'x-queue-type': 'quorum'})
channel.queue_declare(queue='orders.audit', durable=True,
                      arguments={'x-queue-type': 'quorum'})

# Bindings com wildcards
channel.queue_bind(queue='orders.us',    exchange='orders', routing_key='orders.us.*')
channel.queue_bind(queue='orders.new',   exchange='orders', routing_key='orders.*.new')
channel.queue_bind(queue='orders.audit', exchange='orders', routing_key='orders.#')

# Publish: chega em orders.us, orders.new E orders.audit
channel.basic_publish(
    exchange='orders',
    routing_key='orders.us.new',
    body=b'{"order_id":42}',
    properties=pika.BasicProperties(
        delivery_mode=pika.DeliveryMode.Persistent,
        message_id='msg-42',
        content_type='application/json',
    ),
)`}</CodeBlock>
      </Section>

      <Section title="Quorum queues (Raft) — o default para durabilidade" accent={accent}>
        <p>
          Até RabbitMQ 3.7, durabilidade alta significava <strong>mirrored queues</strong> (espelhamento via política de HA). Funcionavam em rede estável, mas em network partition tinham split-brain, perda silenciosa e re-sync caríssimo. Em 3.8+ chegaram <strong>quorum queues</strong>, baseadas na biblioteca <em>Ra</em> (implementação Raft em Erlang). Em 4.0, mirrored queues foram <strong>removidas</strong>.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Algoritmo', v: 'Raft (Ra library, derivada do paper original)' },
            { k: 'Replica count', v: '3 ou 5 (sempre ímpar), maioria do quórum confirma' },
            { k: 'Durabilidade', v: 'Mensagens fsync no log antes do publisher confirm' },
            { k: 'Producer confirm', v: 'Volta só quando majority commited' },
            { k: 'Memory limit', v: 'x-max-in-memory-length (overflow paginated to disk)' },
            { k: 'Não suporta', v: 'Priority, TTL per-message complexo, lazy mode (default já paginated)' },
            { k: 'Trade-off', v: 'Latência ligeiramente maior que classic; durabilidade muito superior' },
          ]}
        />
        <Callout tone="success">
          Em produção 2026: <strong>quorum queues + publisher confirms + manual ack + DLX</strong> é a baseline. Classic queues sem mirror só para caches efêmeros sem requisito de durabilidade.
        </Callout>
        <CodeBlock lang="bash" filename="declare-quorum.sh">{`# Declare quorum queue via rabbitmqadmin
rabbitmqadmin declare queue name=orders.processing \\
  durable=true \\
  arguments='{
    "x-queue-type": "quorum",
    "x-quorum-initial-group-size": 3,
    "x-delivery-limit": 5,
    "x-dead-letter-exchange": "orders.dlx"
  }'

# x-delivery-limit é único de quorum: limita re-deliveries
# (after N attempts → DLX). Evita poison pill loop.`}</CodeBlock>
      </Section>

      <Section title="Streams (3.9+) — quando virar Kafka light" accent={accent}>
        <p>
          Antes de streams, casos de event-log (audit trail, event sourcing, replay histórico) dentro do RabbitMQ eram impróprios — queues consomem-e-descartam. A solução era adicionar Kafka ao stack. <strong>Streams</strong> trouxeram um log append-only persistente, replicado via Raft, com retention por tempo/bytes e protocolo binário próprio (stream protocol, porta 5552, muito mais eficiente que AMQP para esse caso).
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Queue (classic/quorum)', 'Stream']}
          rows={[
            ['Modelo', 'Consume-e-descartar', 'Append-only log + replay'],
            ['Storage', 'In-memory + paginação', 'Segmentos no disco (mmap)'],
            ['Protocolo', 'AMQP 0-9-1 (porta 5672)', 'Stream binary protocol (5552) ou AMQP'],
            ['Replicação', 'Quorum: Raft. Classic: opcional', 'Raft, replicas configuráveis'],
            ['Retention', 'Até consume + TTL', 'x-max-age, x-max-length-bytes'],
            ['Replay', 'Não (mensagem some após ack)', 'Sim — first/last/offset/timestamp'],
            ['Throughput', 'Dezenas-centenas de Kmsg/s', 'Centenas de Kmsg/s — Mmsg/s (próximo a Kafka)'],
            ['Caso uso', 'Task queue, work distribution', 'Event log, audit, fan-out histórico'],
          ]}
        />
        <CodeBlock lang="java" filename="StreamConsumer.java">{`// Consumer via stream protocol (rabbitmq-stream-java-client)
Environment env = Environment.builder()
    .uri("rabbitmq-stream://guest:guest@localhost:5552")
    .build();

env.streamCreator()
    .stream("audit-events")
    .maxAge(Duration.ofDays(30))
    .maxLengthBytes(ByteCapacity.GB(50))
    .leaderLocator(LeaderLocator.BALANCED)
    .create();

env.consumerBuilder()
    .stream("audit-events")
    .offset(OffsetSpecification.timestamp(
        Instant.now().minus(Duration.ofHours(1)).toEpochMilli()))
    .messageHandler((context, message) -> {
        processAudit(message.getBodyAsBinary());
        context.storeOffset();
    })
    .build();`}</CodeBlock>
      </Section>

      <Section title="Padrões essenciais de produção" accent={accent}>
        <ArchFlow
          title="Retry + DLQ pipeline"
          accent={accent}
          columns={[
            {
              title: 'Producer',
              items: [
                'Publish em exchange principal',
                'mandatory=true + return listener',
                'Publisher confirms ON',
              ],
            },
            {
              title: 'Queue principal',
              items: [
                'Type quorum',
                'x-delivery-limit: 5',
                'x-dead-letter-exchange: dlx',
                'x-dead-letter-routing-key: failed',
              ],
            },
            {
              title: 'DLX → DLQ',
              items: [
                'Direct exchange',
                'Bind DLQ com routing_key="failed"',
                'Consumer alerta + retry manual',
                'Métrica + alarme de length',
              ],
            },
          ]}
        />
        <Callout tone="info">
          Para <strong>retry com backoff</strong>, padrão clássico: queue principal → DLX → "delay queue" com TTL crescente (5s, 30s, 5min) → DLX de volta → queue principal. RabbitMQ não tem delay nativo; alternativa é o plugin <InlineCode>rabbitmq-delayed-message-exchange</InlineCode>.
        </Callout>
      </Section>

      <Section title="Publisher confirms vs basic.ack: ergonomia de durabilidade" accent={accent}>
        <p>
          Há dois acks distintos em AMQP que confundem iniciantes:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Publisher confirm (broker → producer)', v: 'Habilitado via confirm.select. Broker envia basic.ack ao producer quando a mensagem foi persistida (quorum) ou aceita por todos os bindings (classic). Sem isso, producer NÃO sabe se o broker recebeu' },
            { k: 'basic.ack (consumer → broker)', v: 'Consumer confirma que processou a mensagem. Sem isso (auto_ack=true ou sem ack manual), a mensagem é removida ao ser entregue — perdida em crash do consumer' },
            { k: 'basic.reject(requeue=true)', v: 'Devolve para a queue (head). Pode causar redelivery loop se erro for permanente' },
            { k: 'basic.reject(requeue=false)', v: 'Manda para DLX se configurado, senão descarta' },
            { k: 'basic.nack(multiple=true)', v: 'Rejeita várias de uma vez por delivery tag — útil para batch processing' },
          ]}
        />
        <Callout tone="warn">
          Produção exige <strong>publisher confirms ON</strong> + <strong>manual ack</strong> + <strong>prefetch</strong> baixo (ex: 50–200). Sem essa tríade, você tem mensageria, não durabilidade.
        </Callout>
      </Section>

      <Section title="Kubernetes Operator (cluster-operator)" accent={accent}>
        <p>
          O <strong>RabbitMQ Cluster Operator</strong> (mantido por VMware Tanzu) é a forma moderna de rodar em Kubernetes. Define um CRD <InlineCode>RabbitmqCluster</InlineCode> que descreve replicas, recursos, plugins, TLS, e o operator reconcilia.
        </p>
        <CodeBlock lang="yaml" filename="rabbitmq-cluster.yaml">{`apiVersion: rabbitmq.com/v1beta1
kind: RabbitmqCluster
metadata:
  name: orders-rmq
  namespace: messaging
spec:
  replicas: 3
  image: rabbitmq:3.13-management
  resources:
    requests: {cpu: "1",   memory: "2Gi"}
    limits:   {cpu: "2",   memory: "4Gi"}
  persistence:
    storageClassName: gp3-encrypted
    storage: 100Gi
  rabbitmq:
    additionalPlugins:
      - rabbitmq_stream
      - rabbitmq_prometheus
      - rabbitmq_management
    advancedConfig: |
      [
        {rabbit, [
          {cluster_partition_handling, pause_minority},
          {queue_master_locator, <<"min-masters">>}
        ]}
      ].
  tls:
    secretName: orders-rmq-tls
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - topologyKey: topology.kubernetes.io/zone
          labelSelector:
            matchExpressions:
              - {key: app.kubernetes.io/name, operator: In, values: [rabbitmq]}`}</CodeBlock>
        <Callout tone="info">
          O operator <em>provisiona</em>, mas o desenho (capacity, retention, DR, backup) continua sendo seu. Para backup: exportar definitions via API regular + snapshot do PV (Velero/CSI). Não confie em "ele faz tudo".
        </Callout>
      </Section>

      <Section title="Trade-offs: RabbitMQ vs concorrentes" accent={accent}>
        <DecisionBox
          scenario="Task queue tradicional (Celery, Sidekiq, MassTransit), work distribution com retry"
          winner="RabbitMQ"
          winnerColor={accent}
          why="AMQP é o protocolo nativo dessas libs. Quorum queues + DLX + delayed plugin cobrem 99% dos padrões de job processing. Ecossistema maduro."
          alternatives={[
            { name: 'Redis Streams (Sidekiq 7+) é alternativa leve; SQS na AWS managed sem manutenção' }
          ]}
        />
        <DecisionBox
          scenario="Event sourcing / audit log com retention de semanas"
          winner="Kafka ou RabbitMQ Streams"
          winnerColor="#3b82f6"
          why="Kafka tem ecossistema (Connect, Streams, ksqlDB) mais maduro para esse uso. RMQ Streams é alternativa válida se já tem RMQ no stack e não quer adicionar Kafka."
          alternatives={[
            { name: 'Pulsar com tiered storage cobre o caso e oferece multi-tenancy nativa' }
          ]}
        />
        <DecisionBox
          scenario="Microsserviços com routing dinâmico complexo, fan-out por header/topic"
          winner="RabbitMQ"
          winnerColor={accent}
          why="Exchange topic/headers + bindings + DLX = expressividade que Kafka e NATS não têm com a mesma ergonomia."
          alternatives={[
            { name: 'NATS com subject hierarchy é alternativa mais leve, mas com menos features de routing complexo' }
          ]}
        />
      </Section>

      <Section title="Timeline" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { t: '2007', label: 'RabbitMQ 1.0 (Rabbit Technologies, Erlang/OTP)' },
            { t: '2010', label: 'Aquisição pela VMware/Pivotal' },
            { t: '2014', label: 'Mirrored queues como HA padrão' },
            { t: '2019', label: 'RabbitMQ 3.8: Quorum queues (Ra/Raft) GA' },
            { t: '2021', label: 'RabbitMQ 3.9: Streams GA (log append-only)' },
            { t: '2022', label: 'Cluster Operator (Kubernetes) GA' },
            { t: '2023', label: 'RabbitMQ 3.12: streams SAC (single active consumer), AMQP 1.0 melhor' },
            { t: '2024', label: 'RabbitMQ 4.0: mirrored queues REMOVIDAS; AMQP 1.0 default; Khepri (metadata store) GA' },
            { t: '2026', label: 'Khepri (Raft metadata) substituindo Mnesia; quorum como única opção HA' },
          ]}
        />
      </Section>

      <Section title="Checklist de produção" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Queue type', v: 'quorum (ou stream se for log)' },
            { k: 'Replicas', v: '3 (zonas diferentes via pod anti-affinity)' },
            { k: 'Publisher confirms', v: 'ON, sempre' },
            { k: 'Consumer ack', v: 'manual, com prefetch 50–200' },
            { k: 'DLX', v: 'configurado, com alarme em DLQ length > 0' },
            { k: 'x-delivery-limit', v: '5–10 para evitar poison pill loop' },
            { k: 'Plugin Prometheus', v: 'habilitado, scrape /metrics' },
            { k: 'TLS', v: 'sempre, mesmo cluster interno (mTLS via Operator)' },
            { k: 'Backup', v: 'definitions export + PV snapshot (Velero) diário' },
            { k: 'Monitoramento crítico', v: 'queue depth, ready vs unacked, memory, disk, file descriptors' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
