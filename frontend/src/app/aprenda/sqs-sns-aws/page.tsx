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

export const metadata = getModuleMetadata('sqs-sns-aws');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre SQS Standard e SQS FIFO?',
    options: [
      'Nenhuma, só nomes diferentes',
      'Standard: throughput "ilimitado" (escala automática a milhões de msgs/s), at-least-once com possibilidade de duplicata e ordering best-effort (não garantida). FIFO: ordering estrita por MessageGroupId, exactly-once dedup por MessageDeduplicationId (janela 5min), limitado a 3000 msgs/s por grupo (300 sem batching) ou 30k msgs/s com high-throughput mode',
      'FIFO é deprecated',
      'Standard tem ordering e FIFO não',
    ],
    correct: 1,
    explanation:
      'Standard prioriza throughput e disponibilidade (eventual consistency, duplicatas possíveis). FIFO prioriza ordem e exactly-once dentro da janela de dedup. High-throughput FIFO (2021+) elevou o teto, mas Standard ainda escala muito mais. Default: use Standard com idempotência consumer-side; FIFO só quando ordering for requisito de domínio (ex: financeiro estrito).',
  },
  {
    question: 'Visibility timeout em SQS resolve o quê?',
    options: [
      'Nada, é cosmético',
      'Quando um consumer recebe uma mensagem (ReceiveMessage), ela vira "invisível" para outros consumers por N segundos (default 30s, max 12h); se o consumer não chama DeleteMessage antes do timeout, a mensagem volta a ficar visível e pode ser entregue de novo — essa é a base do at-least-once em SQS',
      'Criptografia em trânsito',
      'Apenas latência de rede',
    ],
    correct: 1,
    explanation:
      'Visibility timeout é o coração da semântica SQS. Consumer estende com ChangeMessageVisibility se precisar de mais tempo. Default 30s costuma ser pouco para jobs longos — calibre baseado no P99 de processamento. Mensagem "stuck visible+invisible" indicaria bug; CloudWatch ApproximateNumberOfMessagesNotVisible monitora isso.',
  },
  {
    question: 'SNS topic filter policies servem para quê?',
    options: [
      'Filtrar por IP do producer',
      'Cada subscription (SQS, Lambda, HTTP) pode ter uma policy JSON que filtra mensagens por MessageAttributes; só as mensagens cujos atributos batem com a policy são entregues àquela subscription, reduzindo entregas desnecessárias e custos downstream',
      'Filtrar logs do CloudTrail',
      'Aplicar RBAC',
    ],
    correct: 1,
    explanation:
      'Filter policies eliminam o anti-pattern de "fan-out e o consumer filtra". Você define filtro server-side; SNS só entrega o que casa. Suporta exact match, prefix, anything-but, numeric ranges, exists. Custos: SNS cobra publish, mas você economiza chamadas a Lambda/SQS que seriam descartadas.',
  },
  {
    question: 'EventBridge difere de SNS em que aspecto crítico?',
    options: [
      'EventBridge é mais barato',
      'EventBridge é event bus com routing baseado em pattern matching no payload completo (não só MessageAttributes), tem schema registry com discovery automático, archives + replay (replay um intervalo passado para targets), múltiplos buses por conta, integração nativa com SaaS partners (Datadog, Auth0, etc.), e cross-account/cross-region rules',
      'SNS suporta replay e EventBridge não',
      'EventBridge só serve para eventos AWS',
    ],
    correct: 1,
    explanation:
      'SNS é pub/sub message router (otimizado para fan-out de notificações). EventBridge é event bus com semântica de eventos de domínio: pattern matching profundo, schema registry, archives, replay. Para eventos AWS internos (S3 events, EC2 state) EventBridge é o caminho moderno. Para fan-out simples de notificações, SNS continua mais barato.',
  },
  {
    question: 'Dead Letter Queue (DLQ) em SQS funciona como?',
    options: [
      'Lambda separado',
      'Você cria outra queue SQS (não pode ser FIFO mixado com Standard) e configura RedrivePolicy na queue principal com maxReceiveCount=N; após N tentativas malsucedidas (ReceiveMessage sem Delete antes do visibility timeout), a mensagem é movida automaticamente para a DLQ',
      'Inline na própria queue',
      'Via SNS topic dedicado',
    ],
    correct: 1,
    explanation:
      'maxReceiveCount é a "tentativas antes de DLQ". DLQ deve ter mesmo tipo (Standard/FIFO) da queue principal. Padrão prod: DLQ + CloudWatch alarm em ApproximateNumberOfMessagesVisible > 0, com runbook claro. SQS também oferece DLQ Redrive (2021+) que reenvia mensagens da DLQ para a queue original via console/API.',
  },
  {
    question: 'EventBridge archive + replay é útil quando?',
    options: [
      'Nunca, é feature inútil',
      'Quando você quer replay histórico para reprocessar eventos: criar archive com retention (até indefinido), arquivar todos os eventos que batem um pattern, e depois fazer ReplayEvent para um intervalo de tempo, enviando aos targets atuais. Útil para bug fixes em consumers que perderam eventos, debug, ou testar nova arquitetura com tráfego real histórico',
      'Apenas para Lambda',
      'Substitui CloudTrail',
    ],
    correct: 1,
    explanation:
      'Archive é como "tape backup" de event bus. Pattern define o que arquivar (você pode arquivar tudo ou só subset). Replay envia os eventos arquivados para todos os matching rules na janela de tempo escolhida. Custo: $0.10/GB-month archive + $0.10/GB-month replay. Solução elegante para "perdi eventos no consumer e quero reprocessar 48h".',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sqs-sns-aws"
      title="SQS + SNS + EventBridge: AWS messaging stack"
      icon="☁️"
      xp={60}
      readTime={12}
      trailName="Mensageria & Streaming"
      trailColor={accent}
      nextSlug="pulsar-multi-tenant"
      nextTitle="Apache Pulsar: multi-tenant + geo-replication nativos"
      quiz={quiz}
    >
      <Section title="O stack messaging da AWS em uma frase" accent={accent}>
        <p>
          A AWS tem três serviços principais de mensageria que se complementam: <strong>SQS</strong> (fila), <strong>SNS</strong> (pub/sub fan-out), <strong>EventBridge</strong> (event bus com pattern matching, schema registry, replay). Eles cobrem 90% dos casos sem precisar gerenciar Kafka/RabbitMQ.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'SQS', v: 'Fila durável, pull-based, at-least-once (Standard) ou FIFO. Sem servers para gerenciar' },
            { k: 'SNS', v: 'Pub/sub push para múltiplos targets (SQS, Lambda, HTTP, email, SMS). Fan-out N:M' },
            { k: 'EventBridge', v: 'Event bus com pattern matching profundo, schema registry, archive/replay, SaaS partners' },
          ]}
        />
        <Callout tone="info">
          Regra: <strong>SQS</strong> = "preciso garantir que esse job é processado eventualmente". <strong>SNS</strong> = "vários consumidores precisam saber desse evento agora". <strong>EventBridge</strong> = "tenho eventos de domínio que vários sistemas reagem com regras complexas".
        </Callout>
      </Section>

      <Section title="SQS: Standard vs FIFO" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'SQS Standard', 'SQS FIFO']}
          rows={[
            ['Throughput', 'Ilimitado (escala automaticamente)', '300/s sem batching; 3000/s com batching; 30k/s high-throughput mode'],
            ['Ordering', 'Best-effort (não garantida)', 'Estrita por MessageGroupId'],
            ['Delivery', 'At-least-once (duplicatas possíveis)', 'Exactly-once (dedup por MessageDeduplicationId, janela 5min)'],
            ['Throughput por grupo (FIFO)', 'N/A', '300/s default; 3000/s high-throughput'],
            ['Custo / 1M req', '$0.40', '$0.50'],
            ['Tamanho msg', '256 KB (até 2 GB com Extended Library + S3)', '256 KB'],
            ['Retention', '1 min – 14 dias (default 4d)', '1 min – 14 dias'],
            ['Quando usar', 'Default; idempotência consumer-side cobre duplicatas', 'Requisitos estritos de ordem (financeiro, sequenciamento)'],
          ]}
        />
        <CodeBlock lang="python" filename="sqs_consumer.py">{`import boto3
from botocore.config import Config

sqs = boto3.client('sqs', config=Config(retries={'max_attempts': 10, 'mode': 'adaptive'}))
QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123/orders-queue'

while True:
    resp = sqs.receive_message(
        QueueUrl=QUEUE_URL,
        MaxNumberOfMessages=10,      # batch de 1-10
        WaitTimeSeconds=20,          # long polling (reduz custo e latência)
        VisibilityTimeout=120,       # 2min para processar
        AttributeNames=['ApproximateReceiveCount'],
        MessageAttributeNames=['All'],
    )
    for msg in resp.get('Messages', []):
        receipt = msg['ReceiptHandle']
        attempts = int(msg['Attributes']['ApproximateReceiveCount'])
        try:
            # Idempotência: chave única (msg_id, version) — DLQ após maxReceiveCount
            process_order(msg['Body'], idem_key=msg['MessageId'])
            sqs.delete_message(QueueUrl=QUEUE_URL, ReceiptHandle=receipt)
        except TransientError:
            # Não deletar → re-entrega após VisibilityTimeout
            # Estender timeout se job está demorando:
            sqs.change_message_visibility(
                QueueUrl=QUEUE_URL, ReceiptHandle=receipt,
                VisibilityTimeout=300,
            )
        except PermanentError:
            # Forçar entrada na DLQ (após N tentativas via maxReceiveCount)
            # ou deletar + publicar erro em outro topic
            sqs.delete_message(QueueUrl=QUEUE_URL, ReceiptHandle=receipt)
            publish_error(msg)`}</CodeBlock>
        <Callout tone="warn">
          <strong>Long polling</strong> (WaitTimeSeconds=20) é obrigatório em prod. Short polling (default 0) gera 20x mais chamadas, custo maior e latência pior. Não há contraindicação para usar 20s.
        </Callout>
      </Section>

      <Section title="Visibility timeout — o coração do at-least-once" accent={accent}>
        <p>
          Quando o consumer chama <InlineCode>ReceiveMessage</InlineCode>, a mensagem fica <em>invisível</em> por N segundos. Se o consumer chamar <InlineCode>DeleteMessage</InlineCode> antes do timeout, ela é removida. Se não chamar (crash, timeout, network), ela volta a ficar visível e pode ser entregue novamente.
        </p>
        <FlowDiagram
          title="Ciclo da mensagem em SQS"
          accent={accent}
          steps={[
            { label: 'SendMessage', desc: 'Producer publica; mensagem visível na queue' },
            { label: 'ReceiveMessage', desc: 'Consumer recebe; mensagem fica invisível por VisibilityTimeout' },
            { label: 'Processamento', desc: 'Consumer trabalha; pode estender via ChangeMessageVisibility' },
            { label: 'DeleteMessage', desc: 'Consumer confirma sucesso; mensagem removida da queue' },
            { label: 'OU timeout sem delete', desc: 'Mensagem volta a ficar visível; ApproximateReceiveCount++' },
            { label: 'Após maxReceiveCount', desc: 'Movida automaticamente para DLQ (se RedrivePolicy configurada)' },
          ]}
        />
        <Callout tone="warn">
          Visibility timeout default é 30s — quase sempre pouco. Calibre para <strong>P99 do tempo de processamento × 1.5–2</strong>. Para Lambda consumer, AWS recomenda VisibilityTimeout ≥ 6× Lambda timeout.
        </Callout>
      </Section>

      <Section title="DLQ + redrive: padrão obrigatório" accent={accent}>
        <CodeBlock lang="json" filename="redrive-policy.json">{`{
  "deadLetterTargetArn": "arn:aws:sqs:us-east-1:123:orders-dlq",
  "maxReceiveCount": 5
}`}</CodeBlock>
        <p>
          Após 5 tentativas malsucedidas (consumer recebeu mas não deletou antes do timeout), a mensagem migra automaticamente para a DLQ. Padrão de produção:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'CloudWatch alarm', v: 'ApproximateNumberOfMessagesVisible da DLQ > 0 → SNS notify' },
            { k: 'Runbook', v: 'Investigar (logs do consumer + payload), decidir: redrive, descartar, ou patch' },
            { k: 'Redrive (2021+)', v: 'Console/API permite reenviar mensagens da DLQ para a original em batch — sem reescrever código' },
            { k: 'Retention DLQ', v: 'Configurar 14 dias (max), dá tempo para investigação' },
            { k: 'Métricas extras', v: 'Idade da mensagem mais antiga (ApproximateAgeOfOldestMessage)' },
          ]}
        />
      </Section>

      <Section title="SNS: pub/sub com filter policies" accent={accent}>
        <p>
          SNS é um fan-out push: um <strong>topic</strong> tem N <strong>subscriptions</strong>, e cada Publish entrega a todas as subscriptions (ou ao subset que casa com a filter policy).
        </p>
        <ArchFlow
          title="Fan-out típico"
          accent={accent}
          columns={[
            {
              title: 'Producer',
              items: [
                'Service que detecta evento',
                'Publish em SNS topic',
                'MessageAttributes (filterable)',
              ],
            },
            {
              title: 'SNS topic',
              items: [
                'Distribui por filter policy',
                'Cross-region replication',
                'FIFO topics disponíveis',
                'Server-side encryption (KMS)',
              ],
            },
            {
              title: 'Subscribers',
              items: [
                'SQS queues (queues por consumidor)',
                'Lambda direto',
                'HTTPS endpoint (webhook)',
                'Email/SMS/Mobile push',
                'Firehose (S3 archive)',
              ],
            },
          ]}
        />
        <CodeBlock lang="json" filename="filter-policy.json">{`{
  "event_type": ["order_created", "order_paid"],
  "region": ["us-east-1", "us-west-2"],
  "amount_usd": [{"numeric": [">=", 100]}],
  "customer_tier": [{"anything-but": "free"}]
}`}</CodeBlock>
        <Callout tone="info">
          Padrão recomendado: <strong>SNS → SQS fan-out</strong>. Cada consumidor tem sua queue própria; failure ou slowness de um não afeta os outros. SNS Lambda direto é OK para fire-and-forget, mas perde retry/DLQ ergonomia que SQS dá.
        </Callout>
      </Section>

      <Section title="EventBridge: event bus moderno" accent={accent}>
        <p>
          EventBridge é o sucessor lógico de CloudWatch Events. Conceitos centrais:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Event bus', v: 'Container nomeado de eventos. Default bus recebe eventos AWS; você cria custom buses para domínio' },
            { k: 'Event', v: 'JSON com source, detail-type, detail (payload), time, region' },
            { k: 'Rule', v: 'Pattern matching no event JSON (não só atributos como SNS); aciona targets' },
            { k: 'Target', v: 'Lambda, SQS, SNS, Step Functions, Kinesis, ECS task, API destination, cross-account, etc.' },
            { k: 'Schema Registry', v: 'Discovery automático de schemas dos eventos; gera code bindings (Java, Python, TS)' },
            { k: 'Archive', v: 'Retenção indefinida de eventos que batem um pattern (audit + replay)' },
            { k: 'Replay', v: 'Reenviar eventos arquivados de um intervalo para os targets atuais' },
            { k: 'Pipes', v: 'Source (SQS/Kinesis/DDB Streams/Kafka) → enrich (Lambda) → bus/target. Substitui Lambda glue' },
            { k: 'Scheduler', v: 'Cron/rate one-time/recurring (sucessor de CW Events scheduled rules)' },
            { k: 'SaaS partners', v: 'Datadog, Auth0, Stripe, Shopify, etc., publicam diretamente no seu bus' },
          ]}
        />
        <CodeBlock lang="json" filename="eb-rule-pattern.json">{`{
  "source": ["app.orders"],
  "detail-type": ["OrderCreated"],
  "detail": {
    "amount_usd": [{"numeric": [">=", 1000]}],
    "customer": {
      "tier": ["enterprise"],
      "region": [{"prefix": "us-"}]
    },
    "items": {
      "category": ["luxury", "premium"]
    }
  }
}`}</CodeBlock>
        <Callout tone="success">
          Pattern matching aninhado é a diferença chave vs SNS. Você pode filtrar por campos profundos do payload, prefix, numeric range, exists, anything-but. Reduz drasticamente Lambda invocations desnecessárias.
        </Callout>
      </Section>

      <Section title="Archive + Replay: time machine de eventos" accent={accent}>
        <p>
          Cenário real: consumer Lambda teve bug por 48h e descartou eventos sem alarmar. Sem archive, eventos perdidos. Com archive habilitado:
        </p>
        <FlowDiagram
          title="Replay de janela perdida"
          accent={accent}
          steps={[
            { label: 'Criar Archive', desc: 'Pattern: source=app.orders. Retention: 90 dias' },
            { label: 'Bug descoberto', desc: 'Eventos entre 2026-05-01T10:00 e 2026-05-03T14:30 perdidos' },
            { label: 'StartReplay', desc: 'EventStartTime/EventEndTime + target bus + filter por rule names' },
            { label: 'EventBridge re-envia', desc: 'Eventos arquivados batendo o pattern são publicados de novo' },
            { label: 'Targets atuais processam', desc: 'Lambda agora corrigido reprocessa; idempotência impede duplicação' },
          ]}
        />
        <Callout tone="warn">
          Replay envia para os <strong>targets atuais</strong>, não os de quando o evento foi originalmente publicado. Se você apagou um rule, ela não receberá. Garanta idempotência consumer-side antes de replay massivo.
        </Callout>
      </Section>

      <Section title="Quando usar cada um" accent={accent}>
        <DecisionBox
          scenario="Fila de jobs assíncronos (image processing, email sending, batch)"
          winner="SQS Standard"
          winnerColor={accent}
          why="Queue durável, scaling automático, retry+DLQ embutido. Lambda como consumer escala automaticamente até reservedConcurrency."
          alternatives={[
            { name: 'SQS FIFO se ordering for crítica; EventBridge Pipes se houver enrichment Lambda intermediário' }
          ]}
        />
        <DecisionBox
          scenario="Notificar N times/serviços que um evento aconteceu (sem complexidade de filter)"
          winner="SNS → SQS fan-out"
          winnerColor={accent}
          why="Cada consumer tem fila isolada (sem head-of-line blocking entre eles). Filter policies em MessageAttributes cobrem casos simples. Custo baixo."
          alternatives={[
            { name: 'EventBridge se filtros precisarem inspecionar payload profundo ou se houver schema registry' }
          ]}
        />
        <DecisionBox
          scenario="Event-driven architecture com 20+ tipos de eventos, regras complexas, schema versionado"
          winner="EventBridge"
          winnerColor={accent}
          why="Pattern matching profundo, schema registry com discovery, archive/replay, SaaS partners, cross-account/region rules. É o event bus que SNS quer ser mas não é."
          alternatives={[
            { name: 'Apache Kafka self-hosted se latência sub-50ms e retention longa forem requisitos' }
          ]}
        />
        <DecisionBox
          scenario="Cron job recorrente (rodar relatório toda segunda 9h)"
          winner="EventBridge Scheduler"
          winnerColor={accent}
          why="One-time ou recurring com timezone-aware, flexible time windows, target nativo (Lambda, ECS, Step Functions). Sucessor moderno de CloudWatch Events scheduled rules."
          alternatives={[
            { name: 'Step Functions com Wait state se workflow complexo' }
          ]}
        />
      </Section>

      <Section title="Custos comparados (us-east-1, 2026)" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Serviço', 'Unidade', 'Preço']}
          rows={[
            ['SQS Standard', 'Por 1M requests', '$0.40'],
            ['SQS FIFO', 'Por 1M requests', '$0.50'],
            ['SNS', 'Por 1M publishes (excl. mobile/SMS)', '$0.50'],
            ['SNS → Lambda/SQS/HTTP', 'Notificações', '$0.50 por 1M (delivery)'],
            ['EventBridge events', 'Por 1M events publicados', '$1.00'],
            ['EventBridge schema discovery', 'Por evento processado', '$0.10 / 1M'],
            ['EventBridge archive', 'Storage GB/mês', '$0.10'],
            ['EventBridge replay', 'GB processado', '$0.10'],
          ]}
        />
        <Callout tone="info">
          EventBridge custa <strong>2x</strong> SNS por publish, mas elimina Lambda invocations desnecessárias (filter server-side) e custos de SQS extra. Em arquiteturas event-driven complexas, o TCO costuma ser menor que SNS+SQS+Lambda glue.
        </Callout>
      </Section>

      <Section title="Timeline" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { t: '2006', label: 'SQS lançado (primeiro serviço AWS, junto com S3 e EC2)' },
            { t: '2010', label: 'SNS lançado' },
            { t: '2016', label: 'CloudWatch Events (precursor do EventBridge)' },
            { t: '2017', label: 'SQS FIFO' },
            { t: '2019', label: 'EventBridge GA (rebrand + extensão de CW Events)' },
            { t: '2020', label: 'EventBridge Schema Registry' },
            { t: '2021', label: 'SQS High-throughput FIFO (30k msgs/s); EventBridge Archive/Replay' },
            { t: '2022', label: 'EventBridge Pipes (source → enrich → target sem Lambda glue)' },
            { t: '2023', label: 'EventBridge Scheduler (substitui CW Events scheduled rules)' },
            { t: '2024', label: 'SQS Server-side encryption + SQS managed SSE default' },
            { t: '2026', label: 'Stack estabilizado: SQS+SNS+EventBridge cobrem 90% dos casos messaging na AWS' },
          ]}
        />
      </Section>

      <Section title="Anti-patterns comuns" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Short polling em SQS', v: 'Default 0s gera 20x mais custos e latência pior — sempre WaitTimeSeconds=20' },
            { k: 'Visibility timeout muito curto', v: 'Mensagem volta visível durante processamento → duplicate processing' },
            { k: 'Sem DLQ + alarme', v: 'Mensagens "stuck" em retry loop infinito; descobre o bug semanas depois' },
            { k: 'Fan-out direto SNS → Lambda (vários)', v: 'Sem queue intermediária, throttle de Lambda perde mensagens. SNS → SQS → Lambda é o padrão' },
            { k: 'SNS para event sourcing', v: 'SNS não tem archive nem retention para replay — use EventBridge' },
            { k: 'EventBridge para fila de jobs', v: 'EventBridge é event bus, não queue; use SQS para work distribution' },
            { k: 'Consumer sem idempotência', v: 'SQS Standard é at-least-once → duplicates acontecem; sempre idempotency key' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
