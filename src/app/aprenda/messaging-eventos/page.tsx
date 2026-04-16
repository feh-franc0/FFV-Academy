import type { Metadata } from 'next';
import { ModuleLayout, type QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  ArchDiagram,
  QAItem,
  ExamDomainBadge,
  KeyValue,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Messaging: SQS, SNS, EventBridge, Kinesis — SAA-C03',
  description: 'Desacoplamento e eventos no SAA-C03: SQS Standard vs FIFO vs DLQ, SNS fanout, EventBridge rules e pipes, Kinesis Streams vs Firehose vs Data Analytics.',
  keywords: 'SQS, SNS, EventBridge, Kinesis, FIFO, DLQ, fanout, event-driven, SAA-C03',
};

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Sistema de pagamentos exige exactly-once processing e ordem estrita por conta de usuário. Qual serviço escolher?',
    options: [
      'SQS Standard',
      'SQS FIFO com MessageGroupId = UserId',
      'SNS Standard',
      'Kinesis Data Streams',
    ],
    correct: 1,
    explanation: 'SQS FIFO garante exactly-once (via Deduplication ID) e ordem dentro de MessageGroupId. Usando UserId como group, mensagens da mesma conta são ordenadas mas contas diferentes processam em paralelo. SQS Standard é at-least-once e best-effort order. SNS Standard não é fila. Kinesis oferece ordem por shard mas é sobre stream, não fila transacional.',
  },
  {
    question: 'Qual serviço é indicado para rotear eventos de 15 SaaS parceiros (Zendesk, Shopify, Auth0) para múltiplos targets AWS com filtros por evento?',
    options: ['SNS', 'SQS', 'EventBridge', 'Kinesis Firehose'],
    correct: 2,
    explanation: 'EventBridge tem Partner Event Buses para integração com SaaS terceiros, filtros declarativos em regras JSON, e 20+ targets nativos (Lambda, Step Functions, Kinesis, SQS, etc.). SNS não tem filtros avançados nem integração SaaS nativa. SQS não roteia. Kinesis Firehose é delivery para destinos específicos (S3, Redshift), não roteamento.',
  },
  {
    question: 'Uma mensagem no SQS Standard foi processada com sucesso mas a aplicação esqueceu de fazer DeleteMessage. O que acontece?',
    options: [
      'A mensagem é removida após a visibility timeout',
      'A mensagem é redelivered após a visibility timeout',
      'A mensagem fica locked para sempre',
      'A mensagem vai direto para a DLQ',
    ],
    correct: 1,
    explanation: 'SQS é at-least-once: se não deletar explicitamente, após a visibility timeout (default 30s) a mensagem volta a ser visível e será entregue novamente. Depois de maxReceiveCount tentativas, vai para DLQ se configurada. Isso é por design — motivo pelo qual consumers devem ser idempotentes.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="messaging-eventos"
      title="Messaging: SQS, SNS, EventBridge, Kinesis"
      icon="📬"
      xp={70}
      readTime={13}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="seguranca-avancada"
      nextTitle="Segurança Avançada: KMS, Secrets, WAF, Shield"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Desacoplamento é o segredo de sistemas resilientes. Acoplar dois serviços via API síncrona sincroniza falhas —
        se o downstream cai, o upstream cai junto. AWS oferece 4 primitivos de messaging/streaming: SQS (filas),
        SNS (pub/sub broadcast), EventBridge (roteamento por regras) e Kinesis (streaming de dados). O SAA cobra quando
        usar cada um, features específicas (FIFO, DLQ, fanout) e combinações comuns.
      </p>

      <div className="flex flex-wrap gap-2">
        <ExamDomainBadge domain="Resilient" weight="26%" color={ACCENT} />
        <ExamDomainBadge domain="High-Performing" weight="24%" color={ACCENT} />
      </div>

      <Section title="Mapa mental: qual serviço para qual problema?" accent={ACCENT}>
        <ArchDiagram title="Decisão rápida de messaging" accent={ACCENT}>
{`    "Preciso entregar mensagem para..."
                │
  ┌─────────────┼──────────────────┬──────────────────┐
  │             │                  │                  │
1 consumer   N consumers       Com filtros      Stream contínuo
  │             │              e roteamento      (analytics)
  ▼             ▼                  ▼                  ▼
 SQS         SNS → SQS        EventBridge         Kinesis
(fila)       (fanout)         (event bus)       (data stream)`}
        </ArchDiagram>
      </Section>

      <Section title="SQS — filas para desacoplar producer de consumer" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Feature', 'Standard', 'FIFO']}
          rows={[
            ['Throughput', 'Ilimitado', '300 msg/s (3.000 com batching, 30.000 com high throughput mode)'],
            ['Ordem', 'Best-effort', 'Garantida dentro do MessageGroupId'],
            ['Duplicação', 'Possível (at-least-once)', 'Exactly-once via DeduplicationId (5min window)'],
            ['Naming', 'qualquer', 'Obrigatório sufixo .fifo'],
            ['Caso', 'Alta escala, ordem não crítica', 'Pagamentos, workflows ordenados'],
          ]}
        />
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Visibility Timeout', v: 'Tempo (default 30s, max 12h) que uma mensagem fica "invisível" após ReceiveMessage. Consumer deve deletar antes de expirar ou a msg volta para fila.' },
            { k: 'Long Polling', v: 'WaitTimeSeconds até 20s no ReceiveMessage. Reduz chamadas vazias e custo.' },
            { k: 'DLQ (Dead Letter Queue)', v: 'Fila separada que recebe mensagens após maxReceiveCount falhas. Obrigatório em produção.' },
            { k: 'Message Retention', v: 'Default 4 dias, max 14 dias. Após, mensagem é deletada se não consumida.' },
            { k: 'Message size', v: 'Até 256KB no corpo. Para objetos maiores use SQS Extended Client + S3.' },
            { k: 'Delay Queue', v: 'Atraso default de entrega 0–15min. Também por mensagem individual.' },
            { k: 'Server-side encryption', v: 'SSE-SQS (grátis) ou SSE-KMS.' },
          ]}
        />
        <Callout tone="warn">
          <strong>Visibility timeout é pegadinha:</strong> se o consumer demora mais que o timeout, a msg reaparece e
          outro consumer a pega também — dupla execução. Calcule: tempo de processing × 2 + margem. Ou use{' '}
          <InlineCode>ChangeMessageVisibility</InlineCode> para estender dinamicamente.
        </Callout>
        <CodeBlock lang="bash">{`# Criar FIFO com DLQ
aws sqs create-queue --queue-name jobs.fifo \\
  --attributes FifoQueue=true,ContentBasedDeduplication=true,\\
RedrivePolicy='{"deadLetterTargetArn":"arn:aws:sqs:...jobs-dlq.fifo","maxReceiveCount":"5"}'

# Consumir com long polling
aws sqs receive-message --queue-url ... \\
  --wait-time-seconds 20 --max-number-of-messages 10`}</CodeBlock>
      </Section>

      <Section title="SNS — pub/sub para fanout" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          SNS é tópico: publisher publica uma mensagem, N subscribers recebem. Subscribers podem ser SQS, Lambda, HTTP/S,
          Email, SMS, Mobile Push, Kinesis Firehose.
        </p>
        <ArchDiagram title="Fanout pattern: SNS → múltiplas SQS" accent={ACCENT}>
{`     Publisher (app)
          │ PublishMessage
          ▼
    ┌─────────────┐
    │  SNS Topic  │
    │   orders    │
    └──┬──┬──┬────┘
       │  │  │
   ┌───┘  │  └────────┐
   ▼      ▼           ▼
 SQS    SQS        Lambda
notif  fulfillm.   audit
 │      │            │
 EC2   ECS         CloudWatch`}
        </ArchDiagram>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Standard vs FIFO', v: 'SNS também tem FIFO, compatível apenas com SQS FIFO como subscriber.' },
            { k: 'Message Filtering', v: 'Subscribers aplicam filter policy em atributos da mensagem. Subscriber só recebe se bater o filtro.' },
            { k: 'Message Attributes', v: 'Até 10 atributos nome-valor fora do payload. Usados para filtering e routing.' },
            { k: 'Delivery retries', v: 'HTTP/S retry com backoff configurável. SQS/Lambda tem retries nativos.' },
            { k: 'DLQ no SNS', v: 'Mensagens não entregues após retries vão para DLQ (SQS) do subscription.' },
            { k: 'Mobile push', v: 'APNS (iOS), FCM (Android), Baidu, ADM, WNS. Feature nicho mas cobrada.' },
          ]}
        />
      </Section>

      <Section title="EventBridge — roteamento de eventos por regras" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          EventBridge é o evoluído do CloudWatch Events. É event bus: recebe eventos JSON, aplica regras declarativas
          (pattern matching em JSON) e despacha para até 5 targets por regra. Targets suportados: Lambda, Step Functions,
          SQS, SNS, Kinesis, ECS task, EC2 start/stop, Batch, API destination (HTTP), e ~20 outros.
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Default bus', v: 'Recebe eventos de serviços AWS (EC2 state change, S3 events, CodePipeline, etc.).' },
            { k: 'Custom bus', v: 'Para seus próprios eventos de domínio (OrderPlaced, UserRegistered).' },
            { k: 'Partner bus', v: 'Recebe eventos de SaaS (Zendesk, Shopify, Datadog, Auth0, 50+ parceiros).' },
            { k: 'Event pattern', v: 'JSON matching com operadores exists, anything-but, numeric, prefix. Mais expressivo que SNS filter.' },
            { k: 'Schedule', v: 'EventBridge Scheduler substitui CloudWatch Events rule cron. Suporta one-time + recorrente + timezones.' },
            { k: 'Pipes', v: 'Source (SQS/Kinesis/DDB Stream/MSK) → optional filter/enrichment → Target. Substitui Lambda glue code.' },
            { k: 'Schema registry', v: 'Descoberta automática de schemas + code binding para SDKs.' },
            { k: 'Archive + Replay', v: 'Guarda eventos para reprocessar depois.' },
            { k: 'Cross-account', v: 'Resource policy no bus permite contas externas publicarem.' },
          ]}
        />
        <CodeBlock lang="json">{`{
  "source": ["com.ffv.orders"],
  "detail-type": ["OrderPlaced"],
  "detail": {
    "amount": [{ "numeric": [">=", 1000] }],
    "region": ["BR", "AR"]
  }
}`}</CodeBlock>
      </Section>

      <Section title="SNS vs EventBridge — a diferença sutil" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'SNS', 'EventBridge']}
          rows={[
            ['Conceito', 'Pub/sub broadcast', 'Bus de eventos com roteamento inteligente'],
            ['Filtros', 'Por atributos simples', 'Pattern matching JSON complexo'],
            ['Throughput', 'Muito alto (fanout amplo)', 'Alto mas com overhead de matching'],
            ['Targets', '~6 (SQS, Lambda, HTTP, email, SMS, push)', '20+ nativos AWS'],
            ['Latência', 'Baixíssima (<100ms)', 'Baixa (~500ms)'],
            ['Schema discovery', 'Não', 'Sim'],
            ['SaaS nativo', 'Não', 'Sim (Partner Event Sources)'],
            ['Archive/Replay', 'Não', 'Sim'],
            ['Caso ideal', 'Fanout simples para serviços conhecidos', 'Arquitetura event-driven complexa com múltiplas fontes'],
          ]}
        />
      </Section>

      <Section title="Kinesis — streaming de dados" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Variante', 'Função', 'Caso de uso']}
          rows={[
            ['Kinesis Data Streams', 'Stream ordenado por shard, retenção 24h–365d', 'Real-time ingest, múltiplos consumers independentes'],
            ['Kinesis Data Firehose', 'Delivery managed para S3/Redshift/OpenSearch/Splunk', 'ETL simples, sem custom processing'],
            ['Kinesis Data Analytics', 'SQL/Flink sobre streams', 'Analytics em janela de tempo (tumbling/sliding)'],
            ['Kinesis Video Streams', 'Ingest de vídeo/áudio', 'CCTV, ML sobre vídeo, WebRTC'],
          ]}
        />
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Shard', v: 'Unidade de escalabilidade. 1MB/s ou 1.000 records/s de entrada. 2MB/s de saída por shard por consumer.' },
            { k: 'On-demand mode', v: 'Kinesis escala shards automaticamente. Paga por dados in/out.' },
            { k: 'Enhanced Fan-Out', v: 'Cada consumer ganha 2MB/s dedicado (sem dividir). Custo maior.' },
            { k: 'Ordem', v: 'Garantida dentro de um shard. Use Partition Key para rotear mensagens relacionadas ao mesmo shard.' },
            { k: 'Retenção', v: 'Default 24h, configurável até 365 dias.' },
            { k: 'Consumers', v: 'KCL (Kinesis Client Library) cuida de checkpoint em DynamoDB.' },
          ]}
        />
        <Callout tone="info">
          <strong>SQS FIFO vs Kinesis:</strong> ambos ordenam, mas: FIFO é fila (1 consumer, remove mensagem após read);
          Kinesis é stream (N consumers independentes, mensagem persiste por retention). Para analytics com múltiplos
          pipelines lendo o mesmo dado → Kinesis. Para worker queue → SQS.
        </Callout>
      </Section>

      <Section title="Padrões combinados comuns" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Evento 'NovoPedido' precisa: enviar email, debitar estoque, registrar em data warehouse"
          winner="SNS → 3 SQS → 3 consumers independentes"
          why="Fanout via SNS garante que cada subscriber receba. SQS dá DLQ e desacoplamento. Se email cair, estoque e warehouse continuam."
          alternatives={[
            { name: 'EventBridge → 3 Lambdas', note: 'mais moderno; útil se quer filtros por evento.' },
          ]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Ingest de 1 milhão events/s de IoT para análise real-time + armazenar em S3 + alertas"
          winner="Kinesis Data Streams → Lambda (alertas) + Firehose (S3)"
          why="Streams suporta throughput massivo e múltiplos consumers. Firehose entrega batches otimizados para S3. Lambda para regras ad-hoc."
          alternatives={[
            { name: 'MSK (Kafka managed)', note: 'opção se já usa Kafka ecosystem.' },
          ]}
        />
      </Section>

      <Section title="Q&A estilo exame" accent={ACCENT}>
        <QAItem
          q="Consumer SQS está falhando e mensagens ficam voltando. Como evitar infinite loop?"
          a={
            <span>
              Configure uma DLQ e defina <InlineCode>maxReceiveCount</InlineCode> (ex: 5). Após 5 falhas, mensagem é
              movida para DLQ, onde você pode analisar e reprocessar manualmente.
            </span>
          }
        />
        <QAItem
          q="Como garantir que mensagens SQS sejam criptografadas em trânsito e em repouso?"
          a={
            <span>
              Em trânsito é automático (TLS obrigatório). Em repouso, habilite SSE-SQS (grátis, chave AWS) ou SSE-KMS
              (chave sua, com auditoria CloudTrail).
            </span>
          }
        />
        <QAItem
          q="Qual serviço AWS é ideal para reagir a mudanças de estado de recursos (ex: EC2 state change, S3 put)?"
          a={
            <span>
              EventBridge default bus recebe automaticamente esses eventos. Crie regras com pattern matching para
              disparar Lambda, Step Function, SNS, etc.
            </span>
          }
        />
        <QAItem
          q="SQS FIFO está limitado a 300 msg/s. Como aumentar?"
          a={
            <span>
              Ative &ldquo;High Throughput for FIFO&rdquo;: 3.000 msg/s por API action sem batching, 30.000 com batch de 10.
              Requer partitioning por MessageGroupId distribuído.
            </span>
          }
        />
      </Section>

      <Callout tone="warn">
        <strong>Armadilhas:</strong> (1) SQS Standard é at-least-once — consumer deve ser idempotente; (2) FIFO ordem só
        dentro de MessageGroupId; (3) SNS sem SQS na ponta perde mensagens se subscriber cair; (4) Kinesis shards têm
        limites — planeje partition key; (5) EventBridge regra sem target é no-op silencioso.
      </Callout>

      <Callout tone="success">
        <strong>Take-aways:</strong> SQS = fila 1:1, SNS = pub/sub N:M, EventBridge = roteamento inteligente com filtros
        e SaaS, Kinesis = stream real-time com retention. Combine: SNS→SQS para fanout durável; EventBridge→SQS/Lambda
        para event-driven moderno; Kinesis→Firehose→S3 para data lake.
      </Callout>
    </div>
  );
}
