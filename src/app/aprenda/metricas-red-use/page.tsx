import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  ArchDiagram,
} from '@/components/article/primitives';

const ACCENT = '#79c0ff';

export const metadata = getModuleMetadata('metricas-red-use');

const quiz = [
  {
    question:
      'O método RED (Tom Wilkie, Weaveworks/Grafana) mede três coisas em cada serviço:',
    options: [
      'Requests, Errors, Database',
      'Rate, Errors, Duration',
      'Reliability, Efficiency, Durability',
      'Requests, Endpoints, Deployments',
    ],
    correct: 1,
    explanation:
      'RED = Rate (requisições por segundo), Errors (taxa de erros), Duration (latência — sempre percentiles, não média). Aplicado a cada serviço/endpoint, responde "o serviço está saudável?". RED é derivado dos Golden Signals do Google e é o framework canônico pra request-based services.',
  },
  {
    question:
      'O método USE (Brendan Gregg, Netflix) é pra:',
    options: [
      'Services',
      'Resources (CPU, memória, disco, rede, filas)',
      'APIs',
      'Databases',
    ],
    correct: 1,
    explanation:
      'USE = Utilization, Saturation, Errors — aplicado em cada recurso. Utilization: % ocupado. Saturation: quanto trabalho está pendente/filando. Errors: eventos de falha. É o complemento do RED: RED mede o output (service-side); USE mede o input/infra (resource-side). Juntos cobrem quase tudo.',
  },
  {
    question:
      'Por que latência deve ser reportada como p95/p99, não média?',
    options: [
      'Percentiles são mais modernos',
      'Média esconde outliers: 99 reqs a 100ms + 1 req a 10s → média 200ms (parece ok), mas 1% dos users sofreram 10s',
      'Percentiles são mais baratos de calcular',
      'Média exige aggregator externo',
    ],
    correct: 1,
    explanation:
      'Média é hostile ao usuário. Um único outlier de 10s mata a UX pra aquele user, mas quase não move a média. P99 expõe: "o 1% pior dos usuários teve experiência &lt;= X". Também importante: p99 não é agregável — nunca calcule "média dos p99 de cada réplica"; use histogramas (Prometheus histogram_quantile).',
  },
  {
    question:
      'Os "Four Golden Signals" do Google SRE Book são:',
    options: [
      'Latency, Throughput, CPU, Memory',
      'Latency, Traffic, Errors, Saturation',
      'Availability, Performance, Reliability, Cost',
      'Uptime, Downtime, Incidents, Deploys',
    ],
    correct: 1,
    explanation:
      'Latency, Traffic, Errors, Saturation (Google SRE Book, cap. 6). É o superset de RED+USE: Latency+Traffic+Errors = RED; Saturation = parte do USE aplicada ao service-level. Para um serviço, sempre monitore os 4. Saturation antecipa problemas (queue crescendo, CPU em 90%) antes de virarem latency/errors.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="metricas-red-use"
      title="Métricas RED e USE: os frameworks que cobrem 90% dos casos"
      icon="📉"
      xp={70}
      readTime={14}
      trailName="Observabilidade & SRE"
      trailColor={ACCENT}
      nextSlug="opentelemetry-stack"
      nextTitle="OpenTelemetry end-to-end: instrumentação app → backend"
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
        "O que eu devo monitorar?" é a pergunta que todo dev faz na primeira vez que sobe algo
        pra produção. Resposta ruim: "tudo que parecer útil". Resposta boa: dois frameworks
        complementares que cobrem 90% dos casos — <strong>RED</strong> pra serviços, <strong>USE</strong> pra
        recursos. Combinados com os <strong>Four Golden Signals</strong> do Google, você tem um
        checklist testado em escala massiva.
      </p>
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Este módulo mostra os 3 frameworks, quando aplicar cada um, por que <em>percentiles matam
        média</em>, e armadilhas clássicas (histogramas com buckets errados, averaging p99s, labels
        explosivos).
      </p>

      <Section title="RED Method: para serviços (request-driven)" accent={ACCENT}>
        <p>
          Proposto por Tom Wilkie (Weaveworks, depois Grafana Labs) em 2016. Simplifica drasticamente
          o "o que medir em cada serviço":
        </p>
        <ComparisonTable
          headers={['Métrica', 'O que é', 'Pergunta que responde']}
          rows={[
            ['Rate', 'Requisições por segundo (throughput)', 'Quanto tráfego o serviço recebe?'],
            ['Errors', 'Taxa de erros (req com falha / total)', 'Quantas requisições falham?'],
            ['Duration', 'Distribuição de latência (percentiles)', 'Quão rápido o serviço responde?'],
          ]}
        />

        <ArchDiagram>
{`Cada endpoint/serviço:

 Rate     ───►  http_requests_total{service, endpoint, status} (Counter)
 Errors   ───►  derivado do Rate: filtro por status 5xx / total
 Duration ───►  http_request_duration_seconds{service, endpoint} (Histogram)

Dashboard por serviço:
  ┌──────────────────────────────────────────┐
  │ Rate (req/s):   ████▇▆▅▅▄▃▃▃▃      200    │
  │ Error rate:     ──────────            0.2% │
  │ Duration p50:   ──────────            45ms │
  │ Duration p95:   ▅───────              180ms│
  │ Duration p99:   ▇▅──                  320ms│
  └──────────────────────────────────────────┘`}
        </ArchDiagram>

        <CodeBlock lang="python">{`# app.py — instrumentação RED com prometheus_client
from prometheus_client import Counter, Histogram
import time

REQUESTS = Counter(
    "http_requests_total",
    "Total de requisições HTTP",
    ["method", "endpoint", "status"],   # cardinalidade controlada
)

DURATION = Histogram(
    "http_request_duration_seconds",
    "Latência de requisições HTTP",
    ["method", "endpoint"],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10),
)

async def middleware(request, call_next):
    start = time.time()
    status = "500"
    try:
        response = await call_next(request)
        status = str(response.status_code)
        return response
    finally:
        elapsed = time.time() - start
        REQUESTS.labels(request.method, request.url.path, status).inc()
        DURATION.labels(request.method, request.url.path).observe(elapsed)`}</CodeBlock>

        <CodeBlock lang="promql">{`# Queries PromQL que derivam as 3 métricas RED

# Rate (req/s nos últimos 5min)
sum by (endpoint) (rate(http_requests_total[5m]))

# Errors (% erros 5xx)
sum by (endpoint) (rate(http_requests_total{status=~"5.."}[5m]))
  / sum by (endpoint) (rate(http_requests_total[5m]))

# Duration p99
histogram_quantile(0.99,
  sum by (endpoint, le) (rate(http_request_duration_seconds_bucket[5m]))
)`}</CodeBlock>
      </Section>

      <Section title="USE Method: para recursos (resource-driven)" accent={ACCENT}>
        <p>
          Proposto por Brendan Gregg (Netflix, performance guru) em 2012. Para cada recurso do sistema
          (CPU, memória, disco, NIC, connection pool, thread pool, fila):
        </p>
        <ComparisonTable
          headers={['Métrica', 'O que é', 'Indica']}
          rows={[
            [
              'Utilization',
              '% do tempo que o recurso está ocupado',
              'Quão "cheio" está — alto pode ser normal se não tem fila',
            ],
            [
              'Saturation',
              'Quantidade de trabalho em fila / não atendido ainda',
              'Demanda excede capacidade — causa latência',
            ],
            [
              'Errors',
              'Eventos de erro específicos do recurso',
              'Hardware/driver falhando',
            ],
          ]}
        />

        <p><strong>Exemplos</strong>:</p>
        <ComparisonTable
          headers={['Recurso', 'Utilization', 'Saturation', 'Errors']}
          rows={[
            ['CPU', '% CPU user+system', 'Run-queue length, load average', 'Throttles, machine checks'],
            ['Memória', '% RAM usada', 'Swap usage, kswapd busy', 'ECC errors, OOM kills'],
            ['Disco', '% busy (iostat util)', 'IO queue depth, avg wait', 'Bad sectors, retries'],
            ['Rede (NIC)', '% bandwidth usada', 'TX/RX queue dropped packets', 'CRC errors, collisions'],
            ['Connection pool (DB)', '% connections active', 'Waiters on acquire', 'Timeouts acquiring'],
            ['Thread pool', '% threads busy', 'Queue size de tasks pendentes', 'Task rejections'],
          ]}
        />

        <Callout tone="info">
          <strong>Gotcha comum — Saturation é mais útil que Utilization</strong>: CPU a 95% é normal
          num batch job. Mas CPU a 80% com load average 40 em máquina de 8 cores (saturação) = sistema
          em colapso. Utilization alto sem saturation = eficiência. Utilization moderado com saturation
          alta = gargalo.
        </Callout>
      </Section>

      <Section title="Four Golden Signals (Google SRE Book)" accent={ACCENT}>
        <p>
          Definidos no livro <em>Site Reliability Engineering</em> (Google, 2016, cap. 6). É o
          superset que sintetiza RED e USE aplicado a serviços:
        </p>
        <ComparisonTable
          headers={['Signal', 'Descrição', 'RED/USE equivalente']}
          rows={[
            ['Latency', 'Tempo de resposta — separe success vs failure', 'Duration do RED'],
            ['Traffic', 'Demanda — req/s, tx/s, user-session count', 'Rate do RED'],
            ['Errors', 'Taxa de falhas — explícitas E implícitas (latency alta)', 'Errors do RED'],
            ['Saturation', '"Cheio" do sistema — recurso mais saturado limita performance', 'Saturation do USE'],
          ]}
        />

        <Callout tone="info">
          <strong>Prática Google SRE</strong>: todo serviço deve ter dashboard com os 4 signals visíveis
          em uma tela. Alertas baseados em SLOs derivados deles. Esse é o padrão de fato pra
          "production-grade service".
        </Callout>
      </Section>

      <Section title="Quando usar RED vs USE vs Golden Signals" accent={ACCENT}>
        <ComparisonTable
          headers={['Contexto', 'Framework principal']}
          rows={[
            ['Serviço HTTP/gRPC/fila-request', 'RED'],
            ['Recurso de infra (CPU, disco, pool)', 'USE'],
            ['Serviço + visão de capacidade', 'Golden Signals (RED + Saturation)'],
            ['Banco de dados', 'USE + métricas específicas (slow queries, locks, replication lag)'],
            ['Fila/broker (Kafka, SQS, RabbitMQ)', 'USE (queue depth, consumer lag) + Traffic'],
            ['Batch jobs', 'Runtime, success rate, throughput de items'],
            ['Mobile/web client', 'RUM — Largest Contentful Paint, CLS, FID, INP'],
          ]}
        />

        <p>
          Na prática, <strong>combine</strong>. Um dashboard típico de serviço tem:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Topo (RED/Golden)</strong>: Rate, Error rate, Latency p50/p95/p99</li>
          <li><strong>Meio (Saturation)</strong>: CPU, memory, connection pool, thread pool, queue depth</li>
          <li><strong>Fundo (dependencies)</strong>: DB query p99, cache hit ratio, external API error rate</li>
          <li><strong>Lateral (deploy/release)</strong>: build version, feature flag state</li>
        </ul>
      </Section>

      <Section title="Armadilhas clássicas" accent={ACCENT}>
        <Callout tone="danger">
          <strong>#1: Reportar média ao invés de percentile</strong>. Média esconde outliers.
          <em> Sempre use percentis</em> (p50, p95, p99, p99.9). Não tire média de p99s entre réplicas
          — é matematicamente incorreto. Use histogramas agregáveis (Prometheus) + histogram_quantile.
        </Callout>
        <Callout tone="danger">
          <strong>#2: Buckets de histograma errados</strong>. Prometheus histogram precisa de buckets
          pré-definidos. Se seu p99 real é 2s mas o maior bucket é 1s, p99 reportado vira "+Inf" ou
          ruim. Escolha buckets que cubram 10x o p99 esperado. Ex:
          <code className="mx-1 rounded bg-[color:var(--ffv-bg3)] px-1 py-0.5 text-[0.8125rem]">(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10)</code>.
        </Callout>
        <Callout tone="danger">
          <strong>#3: Label explosion</strong>. <code>{"{user_id}"}</code>, <code>{"{trace_id}"}</code>, <code>{"{session}"}</code> em
          métricas matam Prometheus. Use events/logs pra essas dimensões, não métricas.
        </Callout>
        <Callout tone="danger">
          <strong>#4: Errors não inclui "latency igual a timeout"</strong>. Request que durou 30s e
          timed out no cliente conta como <em>error</em>, mesmo que servidor respondeu 200. Instrumente
          no cliente também, não só no servidor.
        </Callout>
        <Callout tone="danger">
          <strong>#5: Esquecer saturation</strong>. Sem saturation, você só vê o problema depois
          que virou latency/error. Saturation antecipa.
        </Callout>
      </Section>

      <Section title="Exemplo: aplicando tudo numa API real" accent={ACCENT}>
        <CodeBlock lang="yaml">{`# dashboard-checkout-api.yaml — estrutura de um dashboard production-grade

panels:
  - title: "Traffic (RED:Rate)"
    query: |
      sum by (endpoint) (rate(http_requests_total{service="checkout"}[5m]))

  - title: "Error Rate (RED:Errors, Golden:Errors)"
    query: |
      sum(rate(http_requests_total{service="checkout",status=~"5.."}[5m]))
      / sum(rate(http_requests_total{service="checkout"}[5m]))
    alert: "> 1% por 5min"

  - title: "Latency p50/p95/p99 (RED:Duration, Golden:Latency)"
    queries:
      - histogram_quantile(0.50, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))
      - histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))
      - histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))

  - title: "CPU Saturation (USE)"
    query: |
      sum by (pod) (rate(container_cpu_usage_seconds_total{pod=~"checkout-.*"}[5m]))
      / sum by (pod) (kube_pod_container_resource_limits{resource="cpu",pod=~"checkout-.*"})
    alert: "> 85% por 10min"

  - title: "DB Connection Pool Saturation (USE)"
    query: |
      pool_connections_active{pool="checkout_db"}
      / pool_connections_max{pool="checkout_db"}
    alert: "> 90%"

  - title: "DB Query p99 (RED aplicado ao DB)"
    query: |
      histogram_quantile(0.99,
        sum by (query_type, le) (rate(db_query_duration_seconds_bucket[5m]))
      )
    alert: "> 500ms por 10min"

  - title: "Queue Saturation (SQS consumer lag)"
    query: aws_sqs_approximate_number_of_messages_visible{queue="checkout-events"}
    alert: "> 10000 por 15min"`}</CodeBlock>
      </Section>

      <Section title="Decisões reais" accent={ACCENT}>
        <DecisionBox
          scenario="API REST nova, quero dashboard mínimo útil"
          winner="RED + 2-3 métricas de Saturation (CPU, pool conexão)"
          winnerColor={ACCENT}
          why="RED te dá 'o serviço tá bem?'. Saturation te antecipa problemas ('CPU em 90%, logo vai degradar'). Com 5 painéis, você já está 90% lá. Adicione mais conforme necessidade — evite dashboard com 50 painéis que ninguém lê."
          alternatives={[
            { label: 'Golden Signals completo', note: 'Essencialmente o mesmo — use como checklist.' },
          ]}
        />
        <DecisionBox
          scenario="Serviço de batch processing (worker consumindo fila)"
          winner="Saturation-heavy: queue depth + throughput de items + error rate"
          winnerColor={ACCENT}
          why="Workers não têm 'latência por request' tradicional — são throughput-oriented. Métricas chave: queue depth (consumer lag), items processed/s, error rate, duração média por item (se variável). RED clássico não se aplica bem."
          alternatives={[
            { label: 'RED tradicional', note: 'Meh — o "request" do worker é ambíguo.' },
          ]}
        />
        <DecisionBox
          scenario="Monitorar Postgres em produção"
          winner="USE no nível de recursos + métricas específicas (slow queries, locks, replication lag, WAL size)"
          winnerColor={ACCENT}
          why="Postgres tem idiossincrasias que genéricos não cobrem: VACUUM lag, bloat, replication slot size, xid wrap. Use postgres_exporter + queries customizadas. USE cobre CPU/disco/memória mas faltam as métricas de DB que matam."
          alternatives={[
            { label: 'Só USE genérico', note: 'Perde alertas específicos de DB — risco.' },
          ]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <div className="flex flex-col gap-4">
          <div>
            <p><strong>Quantas métricas por serviço são "muitas"?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Regra prática: ~20-50 métricas distintas por serviço. Inclui RED, saturation de recursos,
              métricas de negócio (orders_created_total, revenue_cents). Se tem 200 métricas, provavelmente
              há duplicação ou lixo.
            </p>
          </div>
          <div>
            <p><strong>Dashboards por serviço ou por time?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Ambos. <em>Service dashboards</em> (detalhe, on-call do serviço). <em>Team/squad
              dashboards</em> (visão macro dos serviços que o time dono). <em>Exec dashboards</em>
              (uptime, revenue impact). Camadas servem audiências diferentes.
            </p>
          </div>
          <div>
            <p><strong>Devo alertar em todas as métricas?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Não. Alerte em <em>consequências de usuário</em> (latency/error afetando SLO) e
              <em> leading indicators</em> (saturation alto) que te dariam tempo de agir. Alertar
              em cada spike de CPU = alert fatigue = alerta ignorado quando realmente importa.
            </p>
          </div>
          <div>
            <p><strong>Como monitorar serviço async/event-driven?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Adapte RED: "Rate" = events processed/s, "Errors" = events falhados, "Duration" = tempo
              end-to-end (produção → consumo). Adicione "age" do evento mais antigo não processado
              (alerta se passa de threshold).
            </p>
          </div>
          <div>
            <p><strong>Métricas de negócio no mesmo lugar?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Sim! Orders/s, signup rate, conversion% são as MAIS importantes. Quando elas caem,
              algo está errado mesmo que RED/USE estejam verdes. Misture técnicas com negócio
              nos dashboards principais.
            </p>
          </div>
        </div>
      </Section>

      <Callout tone="success">
        <strong>Take-aways</strong>:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>RED (Rate, Errors, Duration)</strong>: o mínimo pra todo serviço request-driven.</li>
          <li><strong>USE (Utilization, Saturation, Errors)</strong>: o mínimo pra todo recurso.</li>
          <li><strong>Four Golden Signals (Google SRE)</strong>: Latency + Traffic + Errors + Saturation. Superset operacional.</li>
          <li><strong>Sempre percentiles</strong> (p50, p95, p99), nunca média. Histogramas agregáveis com <em>histogram_quantile</em>.</li>
          <li><strong>Saturation antecipa</strong> problemas que viram latência/error. Monitorar o "quão cheio" o recurso.</li>
          <li>Cuidado com <strong>label explosion</strong> em métricas — use events/traces pra contexto rico.</li>
          <li>Complemente frameworks com <strong>métricas de negócio</strong> (orders/s, revenue, conversion).</li>
        </ul>
      </Callout>

      <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
        Próximo módulo: o SDK unificado pra instrumentar tudo — OpenTelemetry end-to-end.
      </p>
    </div>
  );
}
