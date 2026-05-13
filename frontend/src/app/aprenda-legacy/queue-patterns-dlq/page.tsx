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
  AnnotatedFormula,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('queue-patterns-dlq');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que retry com "exponential backoff with jitter" e não backoff puro?',
    options: [
      'Jitter é cosmético',
      'Sem jitter, múltiplos consumers falhando ao mesmo tempo (ex: dependência caída) re-tentam exatamente nos mesmos instantes (1s, 2s, 4s, 8s) — esse "thundering herd" sobrecarrega ainda mais a dependência quando ela volta; jitter aleatório (full ou decorrelated) espalha as tentativas no tempo. AWS Architecture Blog "Exponential Backoff And Jitter" (Marc Brooker, 2015) é a referência canônica',
      'Jitter é mais rápido',
      'Backoff puro é proibido',
    ],
    correct: 1,
    explanation:
      'Pattern padrão é full jitter: sleep = random(0, min(cap, base * 2^attempt)). Decorrelated jitter (sleep_new = min(cap, random(base, sleep_prev * 3))) tem propriedades ligeiramente melhores em caudas. Sempre tenha um cap (ex: 30s) e um max_attempts (ex: 5-10) — sem isso é DoS contra si mesmo.',
  },
  {
    question: 'Idempotência consumer-side resolve qual problema concretamente?',
    options: [
      'Performance',
      'Em sistemas at-least-once (Kafka default, SQS Standard, RabbitMQ com basic.reject(requeue=true), NATS JetStream com explicit ack), a mesma mensagem pode ser entregue mais de uma vez (network glitch, consumer crash antes do ack, redelivery após visibility timeout). Idempotency key (UUID por operação, hash do conteúdo, ID da operação de negócio) permite ao consumer detectar duplicata e fazer no-op no efeito colateral',
      'Substitui transactions',
      'Apenas garante ordering',
    ],
    correct: 1,
    explanation:
      'Stripe popularizou o pattern: cliente envia header Idempotency-Key, servidor armazena (key → resultado) por 24h. Mesma key → mesmo resultado, sem efeito colateral duplicado. Em consumer de mensageria: armazenar idempotency_key em tabela com unique index; INSERT ON CONFLICT DO NOTHING; só executa side effect se INSERT teve sucesso.',
  },
  {
    question: 'Strict ordering em sistemas particionados exige o quê?',
    options: [
      'Cluster single-node',
      'Que todas as mensagens de uma "entidade" (ex: pedido X, conta Y) caiam na MESMA partition/group; isso se faz com partition key = ID da entidade (Kafka), MessageGroupId = ID (SQS FIFO), routing key consistente (RabbitMQ direct), Key_Shared (Pulsar). Dentro da partition, broker garante ordem; entre partitions não há ordem global',
      'Single producer apenas',
      'Locking distribuído',
    ],
    correct: 1,
    explanation:
      'Ordering global em sistema distribuído é caríssimo (sequencer central, gargalo). Ordering por chave é o padrão: mesmas chaves no mesmo "canal lógico" (partition, group, shard). Aplicação naturalmente quebra ordering por entidade (pedido, conta, usuário) — raramente precisa ordering global de verdade. Pergunte sempre: "ordering global é mesmo requisito?"',
  },
  {
    question: 'O que é "poison pill" e como detectá-lo?',
    options: [
      'Mensagem encriptada',
      'Mensagem que SEMPRE falha no processamento (ex: payload malformado, bug do consumer com aquele tipo específico), bloqueando o avanço da queue/partition se o consumer continuar tentando indefinidamente; detecta-se com contador de redelivery (ApproximateReceiveCount em SQS, header x-delivery-count em RabbitMQ, header dos message properties em Kafka) e move-se para DLQ após N tentativas',
      'Mensagem grande',
      'Mensagem em outro idioma',
    ],
    correct: 1,
    explanation:
      'Sem cap em redelivery, poison pill consome 100% do throughput do consumer indefinidamente. Pattern: maxReceiveCount (SQS), x-delivery-limit (RabbitMQ quorum), maxRedeliverCount (Pulsar), retry interceptor (Kafka — você implementa). Move para DLQ + alarme. Triage humana decide: bug? evento estranho? schema mudou?',
  },
  {
    question: 'Por que DLQ deve ser monitorada com CloudWatch/Prometheus alarme?',
    options: [
      'Compliance só',
      'Mensagem em DLQ significa que o pipeline falhou em processar algo, e geralmente sem alarme isso fica invisível por dias/semanas; alarme em "DLQ length > 0" (ou > threshold) força triage rápida: investigar payload + logs do consumer, decidir se redrive (reenvia para queue original após fix) ou descarta + corrige producer/schema',
      'É opcional',
      'DLQ não precisa monitor',
    ],
    correct: 1,
    explanation:
      'DLQ não monitorada é igual a "log file no /var/log que ninguém olha". Pattern: CloudWatch alarm + SNS + PagerDuty/Slack. Métrica: ApproximateNumberOfMessagesVisible > 0 (SQS), queue length > 0 (RMQ), DLQ subscription backlog > 0 (Pulsar). Runbook claro: como fazer redrive, como descartar, como investigar.',
  },
  {
    question: 'Outbox pattern resolve o quê?',
    options: [
      'Latência de rede',
      'O problema clássico de "atomicidade entre escrita no banco e publicação em messaging": commit no banco + send para Kafka não é atômico, então pode haver inconsistência (banco commitado mas mensagem perdida, ou vice-versa). Solução: dentro da MESMA transação do banco, escrever a mensagem em uma tabela "outbox"; um processo separado lê a outbox e publica no broker com at-least-once; consumer faz idempotência',
      'Cache invalidation',
      'Compression',
    ],
    correct: 1,
    explanation:
      'Outbox é a base de event-driven com banco SQL. CDC com Debezium pode ler diretamente da tabela outbox via Postgres logical decoding, eliminando o publisher process custom. Padrão é tão comum que Debezium tem "Outbox Event Router SMT" pronto. Sem outbox, dual-write é uma armadilha clássica.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="queue-patterns-dlq"
      title="Queue patterns: DLQ, retry, idempotência, ordering"
      icon="🔁"
      xp={70}
      readTime={14}
      trailName="Mensageria & Streaming"
      trailColor={accent}
      nextSlug="cdc-debezium"
      nextTitle="CDC com Debezium: Postgres → Kafka em tempo real"
      quiz={quiz}
    >
      <Section title="Os 5 patterns que você vai usar 90% do tempo" accent={accent}>
        <p>
          Mensageria em produção exige um conjunto pequeno de patterns que se repete em SQS, RabbitMQ, Kafka, NATS, Pulsar. Quem os domina entrega sistemas estáveis; quem ignora, opera incidente atrás de incidente. Os cinco fundamentais:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: '1. Retry com backoff + jitter', v: 'Tentar de novo errado é causa de cascading failure' },
            { k: '2. Dead Letter Queue (DLQ)', v: 'Cap em retries; isolar mensagens problemáticas; alarme' },
            { k: '3. Idempotência consumer-side', v: 'At-least-once é a realidade; consumer precisa lidar com duplicatas' },
            { k: '4. Ordering por chave (não global)', v: 'Ordering global é caríssimo; ordering por entidade é o que aplicação precisa' },
            { k: '5. Outbox pattern', v: 'Dual-write banco+broker não é atômico; outbox resolve' },
          ]}
        />
        <Callout tone="info">
          Esses cinco patterns aparecem juntos em qualquer postmortem público de uma empresa séria (Stripe, Shopify, Netflix). Não são opcionais.
        </Callout>
      </Section>

      <Section title="Pattern 1: Exponential backoff with jitter" accent={accent}>
        <p>
          Retry sem backoff: cliente falhou → retry imediato → falha de novo → loop. Vira DoS contra a dependência. Retry com backoff: 1s, 2s, 4s, 8s... mas se 1000 clientes falharam ao mesmo tempo, os retries acontecem em sincronia, causando spikes brutais a cada potência de 2.
        </p>
        <p>
          A solução: <strong>jitter</strong> (aleatoriedade) no intervalo. Marc Brooker (AWS Principal Engineer) publicou em 2015 o artigo "Exponential Backoff And Jitter" — referência canônica.
        </p>
        <AnnotatedFormula
          title="Full jitter (recomendado padrão)"
          accent={accent}
          formula="sleep = random(0, min(cap, base * 2^attempt))"
          parts={[
            { text: 'base', annotation: 'intervalo inicial (ex: 100ms ou 1s)' },
            { text: 'attempt', annotation: 'número da tentativa (0, 1, 2, ...)' },
            { text: 'cap', annotation: 'teto absoluto (ex: 30s) — sem isso, retries ficam astronomicamente longos' },
            { text: 'random(0, X)', annotation: 'uniforme entre 0 e X; espalha tentativas no tempo' },
          ]}
        />
        <AnnotatedFormula
          title="Decorrelated jitter (melhor para caudas)"
          accent={accent}
          formula="sleep_new = min(cap, random(base, sleep_prev * 3))"
          parts={[
            { text: 'sleep_prev', annotation: 'último sleep efetivamente usado' },
            { text: 'random(base, X)', annotation: 'uniforme entre base e X; ergue mais cedo, espalha melhor' },
          ]}
        />
        <CodeBlock lang="python" filename="retry_with_jitter.py">{`import random, time

def retry_with_jitter(call, max_attempts=5, base=0.1, cap=30.0):
    """Full jitter exponential backoff."""
    for attempt in range(max_attempts):
        try:
            return call()
        except TransientError as e:
            if attempt == max_attempts - 1:
                raise
            sleep = random.uniform(0, min(cap, base * (2 ** attempt)))
            log.warning(f"attempt {attempt} failed, sleeping {sleep:.2f}s: {e}")
            time.sleep(sleep)`}</CodeBlock>
        <Callout tone="warn">
          Sempre tenha <strong>max_attempts</strong> + <strong>cap</strong>. Sem cap, o sleep cresce exponencialmente até horas; sem max_attempts, é retry infinito (poison pill).
        </Callout>
      </Section>

      <Section title="Pattern 2: Dead Letter Queue (DLQ)" accent={accent}>
        <p>
          DLQ é a "lixeira investigável" de mensagens que falharam mais que N vezes. Configuração varia por broker:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Broker', 'Configuração', 'Métrica para alarme']}
          rows={[
            ['SQS', 'RedrivePolicy: deadLetterTargetArn + maxReceiveCount', 'ApproximateNumberOfMessagesVisible da DLQ'],
            ['RabbitMQ', 'x-dead-letter-exchange + x-delivery-limit (quorum)', 'queue messages_ready da DLQ'],
            ['Kafka', 'Aplicação implementa (Spring Kafka, Streams têm helpers)', 'consumer lag + count em "topic.DLT"'],
            ['NATS JetStream', 'max_deliver + dead_letter_subject', 'subject count'],
            ['Pulsar', 'DeadLetterPolicy.maxRedeliverCount + deadLetterTopic', 'subscription backlog do DLQ topic'],
          ]}
        />
        <ArchFlow
          title="Pipeline com DLQ"
          accent={accent}
          columns={[
            {
              title: 'Producer',
              items: ['Publica em queue principal', 'Idempotency key no payload', 'Schema versionado'],
            },
            {
              title: 'Consumer + retry',
              items: [
                'Pull mensagem',
                'Try processar',
                'Falha → NACK ou no-ack (timeout)',
                'Redelivery automático',
                'Após N tentativas → DLQ',
              ],
            },
            {
              title: 'DLQ + alerta',
              items: [
                'CloudWatch/Prometheus alarm > 0',
                'PagerDuty/Slack notify',
                'Operador inspeciona payload + logs',
                'Decisão: redrive, descartar, hotfix',
              ],
            },
          ]}
        />
        <Callout tone="success">
          Padrão prod: DLQ + alarme + runbook. SQS oferece <strong>DLQ Redrive</strong> nativo (console/API reenvia para a queue original em batch). Em outros brokers, você escreve um pequeno script.
        </Callout>
      </Section>

      <Section title="Pattern 3: Idempotência consumer-side" accent={accent}>
        <p>
          At-least-once é a semântica de produção em 99% dos casos. Exactly-once <em>dentro do mesmo cluster</em> existe (Kafka transactional + Flink 2PC sinks), mas cross-system (HTTP, DB externo) precisa de idempotência no receiver.
        </p>
        <CodeBlock lang="sql" filename="idempotency_table.sql">{`-- Tabela de idempotency keys (Postgres)
CREATE TABLE idempotency_keys (
    key            UUID PRIMARY KEY,
    operation      TEXT NOT NULL,
    result_json    JSONB NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at     TIMESTAMPTZ NOT NULL
);

CREATE INDEX idempotency_keys_expires_at_idx ON idempotency_keys(expires_at);

-- Cleanup job diário
DELETE FROM idempotency_keys WHERE expires_at < now();`}</CodeBlock>
        <CodeBlock lang="python" filename="idempotent_consumer.py">{`def process_order_message(msg):
    idem_key = msg.headers.get('idempotency_key') or msg.message_id
    with db.transaction():
        # Tentativa atômica de "claim" do idempotency key
        inserted = db.execute("""
            INSERT INTO idempotency_keys (key, operation, result_json, expires_at)
            VALUES (%s, 'process_order', '{}', now() + interval '24 hours')
            ON CONFLICT (key) DO NOTHING
            RETURNING key
        """, (idem_key,)).fetchone()

        if inserted is None:
            # Já processada antes; ack e seguir
            log.info(f"duplicate detected for key={idem_key}, skipping")
            return

        # Primeira vez: executa side effect dentro da mesma transação
        order = parse_order(msg.body)
        result = create_order_in_db(order)
        db.execute("UPDATE idempotency_keys SET result_json=%s WHERE key=%s",
                   (json.dumps(result), idem_key))
        # commit ao sair do with`}</CodeBlock>
        <Callout tone="info">
          Para side effects externos (charge no Stripe, envio de email): <strong>fazer no provider primeiro</strong> com Idempotency-Key, depois marcar como processado. Stripe, Square, Mercado Pago aceitam header Idempotency-Key e fazem dedup server-side.
        </Callout>
      </Section>

      <Section title="Pattern 4: Ordering por chave (não global)" accent={accent}>
        <p>
          Ordering global em sistema distribuído é caríssimo: exige sequencer central (gargalo single-point) ou consenso por mensagem (latência). Ordering <strong>por entidade</strong> é o que a aplicação precisa em 99% dos casos: "todos os eventos do pedido X em ordem" não "todos os eventos do mundo em ordem".
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Broker', 'Como garantir ordering por chave']}
          rows={[
            ['Kafka', 'Partitioner por key (default murmur2). Mesma key → mesma partition → ordem garantida'],
            ['SQS FIFO', 'MessageGroupId = ID da entidade. Ordering estrita dentro do grupo'],
            ['RabbitMQ', 'Routing key consistente + single active consumer (SAC) ou consistent-hash exchange'],
            ['NATS JetStream', 'Subject determinístico (orders.{order_id}) + filter no consumer'],
            ['Pulsar', 'Key_Shared subscription type + message key = ID da entidade'],
          ]}
        />
        <Callout tone="warn">
          Cuidado com <strong>partition skew</strong>: se 80% das mensagens têm a mesma key, uma partition fica sobrecarregada. Solução: keys com cardinalidade suficiente (use ID estável, não enum de pequena cardinalidade).
        </Callout>
        <CodeBlock lang="java" filename="KafkaOrderedProducer.java">{`// Producer Kafka — ordering por order_id
ProducerRecord<String,String> record = new ProducerRecord<>(
    "orders.events",
    order.getId(),   // KEY → partitioner garante mesma partition
    json
);
producer.send(record);

// Consumer Kafka — naturally ordered per partition
// Cada consumer no grupo lê de partitions disjuntas
// Eventos do mesmo order_id sempre na mesma partition, processados em ordem`}</CodeBlock>
      </Section>

      <Section title="Pattern 5: Poison pill detection" accent={accent}>
        <p>
          Mensagem que sempre falha (payload malformado, bug específico, schema incompatível) bloqueia o consumer se for re-tentada indefinidamente. Detecção: contador de redelivery.
        </p>
        <CodeBlock lang="python" filename="poison_pill_handler.py">{`def handle_message(msg):
    redelivery_count = int(msg.headers.get('x-delivery-count', 0))

    if redelivery_count >= 5:
        # Move para DLQ explicitamente (alguns brokers fazem auto)
        log.error(
            f"poison pill detected after {redelivery_count} attempts",
            extra={"msg_id": msg.id, "payload_size": len(msg.body)}
        )
        send_to_dlq(msg, reason="max_retries_exceeded")
        emit_metric("poison_pill.detected", tags={"queue": "orders"})
        ack(msg)
        return

    try:
        process(msg.body)
        ack(msg)
    except (SchemaError, ValidationError) as e:
        # Erros permanentes: vão direto para DLQ (não retry)
        log.warning(f"permanent error: {e}; sending to DLQ")
        send_to_dlq(msg, reason=str(e))
        ack(msg)
    except TransientError as e:
        # Erros transientes: NACK, deixa redelivery
        log.warning(f"transient error: {e}; will retry")
        nack(msg)`}</CodeBlock>
        <Callout tone="info">
          Distinguir <strong>permanent vs transient</strong> errors economiza muito retry desnecessário. SchemaError, ValidationError, NotFound: permanente → DLQ direto. Timeout, ConnectionError, 5xx: transient → retry com backoff.
        </Callout>
      </Section>

      <Section title="Pattern 6: Outbox (a glória escondida)" accent={accent}>
        <p>
          O problema: você quer escrever no banco <em>e</em> publicar no broker, atomicamente. Não há 2PC entre Postgres e Kafka. Se você commitar no banco e o publish falhar, perde a mensagem. Se publicar antes do commit, pode publicar e o commit falhar.
        </p>
        <FlowDiagram
          title="Outbox pattern"
          accent={accent}
          steps={[
            { label: 'Application code', desc: 'BEGIN transaction' },
            { label: 'INSERT into business_table', desc: 'Estado do domínio' },
            { label: 'INSERT into outbox_events', desc: 'Evento a publicar (mesma TX)' },
            { label: 'COMMIT', desc: 'Atomicidade garantida pelo banco' },
            { label: 'Relay process (ou CDC)', desc: 'Lê outbox_events e publica no broker; marca como publicado' },
            { label: 'Consumers', desc: 'Idempotência (mesma key) → seguro mesmo com replays' },
          ]}
        />
        <CodeBlock lang="sql" filename="outbox_schema.sql">{`-- Tabela outbox (Postgres)
CREATE TABLE outbox_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type  TEXT NOT NULL,           -- 'order', 'customer', etc.
    aggregate_id    TEXT NOT NULL,           -- usado como partition key
    event_type      TEXT NOT NULL,           -- 'OrderCreated', 'OrderShipped'
    payload         JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at    TIMESTAMPTZ,             -- NULL = ainda pendente
    INDEX (published_at, created_at)         -- relay scan
);

-- Relay process (Python pseudo-código)
-- SELECT * FROM outbox_events WHERE published_at IS NULL ORDER BY created_at LIMIT 100;
-- Para cada: kafka.send(topic, key=aggregate_id, value=payload)
-- UPDATE outbox_events SET published_at = now() WHERE id = ANY(...);

-- OU MELHOR: Debezium lê o WAL e publica direto, eliminando relay process custom`}</CodeBlock>
        <Callout tone="success">
          Debezium tem <strong>Outbox Event Router SMT</strong> pronto: lê tabela <InlineCode>outbox_events</InlineCode> via logical decoding, transforma cada row em um Kafka record com headers/topic/key derivados das colunas. Substitui o relay process por configuração.
        </Callout>
      </Section>

      <Section title="Outros patterns úteis" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Saga / Choreography', v: 'Transação distribuída via cadeia de eventos com compensações (rollback semântico)' },
            { k: 'Event sourcing', v: 'Estado é projeção de eventos imutáveis; reconstrói lendo o log' },
            { k: 'Competing consumers', v: 'N consumers no mesmo grupo dividem carga; padrão de SQS/RMQ/Kafka' },
            { k: 'Priority queues', v: 'Filas separadas por prioridade (RMQ tem priority queue nativa até 255 níveis)' },
            { k: 'Delay queues', v: 'Mensagens visíveis só após N segundos (SQS DelaySeconds, RMQ delayed plugin)' },
            { k: 'Throttling consumer-side', v: 'Limitar req/s para não saturar dependência (rate limiter local + DLQ se exceeded)' },
            { k: 'Circuit breaker no consumer', v: 'Pausar consumo se dependência está degradada (em vez de gerar 1000 retries)' },
            { k: 'Schema evolution', v: 'Avro/Protobuf com BACKWARD compat; producer só deploya schema novo após consumers' },
          ]}
        />
      </Section>

      <Section title="Decisões clássicas" accent={accent}>
        <DecisionBox
          scenario="Worker que processa jobs com latência variável (10ms – 5min)"
          winner="SQS Standard ou RabbitMQ quorum"
          winnerColor={accent}
          why="Visibility timeout / prefetch adaptativos absorvem variância. DLQ + idempotência + jitter cobrem failure modes."
          alternatives={[
            { name: 'Kafka funciona, mas consumer-side timeouts são mais artesanais' }
          ]}
        />
        <DecisionBox
          scenario="Ordering estrita de eventos de domínio por entidade (financeiro)"
          winner="Kafka com partition key + EOS"
          winnerColor="#3b82f6"
          why="Transactional producer + idempotent + read_committed dá ordering por chave com exactly-once dentro do Kafka."
          alternatives={[
            { name: 'SQS FIFO se latência aceita e throughput < 30k/s; Pulsar Key_Shared se multi-tenant' }
          ]}
        />
        <DecisionBox
          scenario="Migração de microsserviço com banco SQL para event-driven"
          winner="Outbox pattern + Debezium"
          winnerColor={accent}
          why="Atomicidade garantida (mesma TX do banco), zero código custom de relay, evolve incrementalmente."
          alternatives={[
            { name: 'Dual-write é tentador mas é a armadilha #1 — não faça' }
          ]}
        />
      </Section>

      <Section title="Checklist anti-incidente" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Exponential backoff com jitter', v: 'Todo retry, sem exceção. Cap + max_attempts.' },
            { k: 'DLQ configurada', v: 'Em todas as queues, com alarme em length > 0' },
            { k: 'Idempotency key', v: 'Em todo handler de mensagem; tabela com TTL 24h+' },
            { k: 'Distinção permanent vs transient', v: 'Errors permanentes vão direto para DLQ, não desperdiçam retries' },
            { k: 'Métricas: consumer lag, queue depth, redelivery rate', v: 'Dashboards + alarmes' },
            { k: 'Runbook DLQ', v: 'Como redrive, como descartar, como investigar — escrito antes do incidente' },
            { k: 'Chaos test', v: 'Mate o consumer no meio do processamento; verifique se duplicata é detectada' },
            { k: 'Schema versionado', v: 'Avro/Protobuf/JSON Schema; backward compat enforced em CI' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
