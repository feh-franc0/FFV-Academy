import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  FlowDiagram,
  InlineCode,
} from '@/components/article/primitives';

const ACCENT = '#79c0ff';

export const metadata = getModuleMetadata('opentelemetry-stack');

const quiz = [
  {
    question:
      'OpenTelemetry (OTel) é:',
    options: [
      'Um backend de observability (como Prometheus ou Jaeger)',
      'Um padrão aberto (CNCF) de APIs, SDKs e protocolo OTLP para gerar e exportar telemetria (traces, metrics, logs) — agnóstico de backend',
      'Uma linguagem de programação',
      'Um fork do Jaeger',
    ],
    correct: 1,
    explanation:
      'OTel é a camada padrão de geração de telemetria — você instrumenta uma vez (OTel SDK) e exporta pra qualquer backend que aceite OTLP (Jaeger, Tempo, Datadog, Honeycomb, etc). Padronizado pela CNCF. A sacada: desacopla "como instrumentar" de "onde armazenar", fim do vendor lock-in.',
  },
  {
    question:
      'Qual é a diferença entre auto-instrumentation e manual instrumentation?',
    options: [
      'Auto é mais cara',
      'Auto = OTel detecta frameworks (HTTP, DB, Redis) e instrumenta sem código; Manual = você chama OTel SDK explicitamente pra criar spans customizados',
      'Manual só funciona em Java',
      'Auto gera mais overhead',
    ],
    correct: 1,
    explanation:
      'Auto-instrumentation usa bytecode manipulation (Java agent) ou monkey-patching (Python opentelemetry-instrument) pra injetar spans em libs populares sem mudar código. Dá 80% da observabilidade grátis. Manual (otel SDK direto) cria spans pra lógica de negócio específica. Use ambos: auto pra HTTP/DB/cache, manual pra "processPayment", "generateInvoice" etc.',
  },
  {
    question:
      'O OpenTelemetry Collector é um:',
    options: [
      'Backend de traces',
      'Proxy/ETL de telemetria: receivers (input) → processors (transform/filter/sample) → exporters (output para backends)',
      'Dashboard',
      'Load balancer',
    ],
    correct: 1,
    explanation:
      'Collector é o componente central da arquitetura OTel. Recebe via OTLP/gRPC/HTTP, aplica transformações (batching, sampling, attribute rewrite, PII scrubbing), e exporta pra um ou mais backends. Rodado como agent (sidecar/daemonset) ou gateway (cluster). Desacopla app do backend — trocar Jaeger por Tempo = mudar 3 linhas de config do Collector, não da app.',
  },
  {
    question:
      'Para que serve context propagation via W3C Trace Context?',
    options: [
      'Criptografar spans',
      'Carregar trace_id e span_id entre serviços via headers HTTP (traceparent, tracestate) pra span children conectarem ao span parent',
      'Comprimir payload',
      'Autenticar requests',
    ],
    correct: 1,
    explanation:
      'Quando Serviço A chama Serviço B, B precisa saber o trace_id/span_id do A pra criar span-filho conectado. W3C Trace Context (RFC) padroniza headers "traceparent" e "tracestate". OTel SDK injeta no outbound e extrai no inbound automaticamente. Sem isso, cada serviço gera trace separado e você perde visibilidade end-to-end.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="opentelemetry-stack"
      title="OpenTelemetry end-to-end: instrumentação app → backend"
      icon="🛰️"
      xp={90}
      readTime={18}
      trailName="Observabilidade & SRE"
      trailColor={ACCENT}
      nextSlug="logs-estruturados"
      nextTitle="Logs Estruturados: JSON, correlation IDs e levels com propósito"
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
        OpenTelemetry (OTel) é a maior vitória recente da observability — padrão aberto da CNCF
        pra gerar e exportar telemetria sem depender de vendor. Antes dele: cada backend (Datadog,
        New Relic, Jaeger) tinha SDK próprio, trocar era reescrever instrumentação. Depois dele:
        instrumente uma vez, exporte pra qualquer backend que aceite <strong>OTLP</strong>.
      </p>
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Este módulo é o guia prático de ponta a ponta: <strong>SDK</strong> (auto + manual),
        <strong> Collector</strong> (receivers, processors, exporters), <strong>context propagation</strong>,
        resource detection, e pipelines reais em Node/Python/Go. É o conhecimento que todo engenheiro
        sério precisa em 2026.
      </p>

      <Section title="Arquitetura OTel: os 3 componentes" accent={ACCENT}>
        <FlowDiagram
          orientation="horizontal"
          steps={[
            { label: 'SDK (na sua app)', desc: 'auto + manual instrumentation · 3 signals: traces, metrics, logs' },
            { label: 'OTel Collector', desc: 'OTLP grpc/http · receivers → processors → exporters' },
            { label: 'Backend(s)', desc: 'Jaeger / Tempo · Prometheus · Datadog / … → Query / Dashboard (Grafana)' },
          ]}
        />

        <ComparisonTable
          headers={['Componente', 'O que faz', 'Onde roda']}
          rows={[
            [
              'SDK',
              'Gera spans/metrics/logs na sua app',
              'Dentro do processo da aplicação',
            ],
            [
              'Collector',
              'Recebe via OTLP, transforma, exporta pra backends',
              'Sidecar, daemonset (por node) ou gateway (cluster separado)',
            ],
            [
              'Backend',
              'Armazena, indexa, permite query',
              'Managed (Datadog) ou self-host (Tempo/Jaeger/Loki)',
            ],
          ]}
        />
      </Section>

      <Section title="OTel SDK: auto vs manual instrumentation" accent={ACCENT}>
        <p>
          O SDK tem 2 camadas: <strong>auto-instrumentation</strong> (plug-and-play pra libs
          populares) e <strong>manual</strong> (spans customizados pra lógica de negócio).
        </p>

        <p><strong>Node.js — auto-instrumentation</strong>:</p>
        <CodeBlock lang="javascript">{`// instrumentation.js — rodado antes do app inicializar
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'checkout-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
  }),
  traceExporter: new OTLPTraceExporter({ url: 'http://otel-collector:4317' }),
  metricExporter: new OTLPMetricExporter({ url: 'http://otel-collector:4317' }),
  instrumentations: [getNodeAutoInstrumentations({
    // Remove instrumentação barulhenta se precisar
    '@opentelemetry/instrumentation-fs': { enabled: false },
  })],
});

sdk.start();`}</CodeBlock>

        <CodeBlock lang="bash">{`# Rode com a instrumentação carregada ANTES da app
node --require ./instrumentation.js server.js

# Ou (mais recente) via package.json:
# "scripts": { "start": "node --import ./instrumentation.js server.js" }`}</CodeBlock>

        <p><strong>Python — auto + manual</strong>:</p>
        <CodeBlock lang="bash">{`# Instala SDK + auto-instrumentations pra libs populares
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install

# Rode a app embrulhada
OTEL_SERVICE_NAME=checkout-api \\
  OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317 \\
  OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production \\
  opentelemetry-instrument python app.py`}</CodeBlock>

        <CodeBlock lang="python">{`# app.py — spans manuais pra lógica de negócio
from opentelemetry import trace, metrics

tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

orders_counter = meter.create_counter(
    "orders_created_total",
    description="Número de pedidos criados",
)

async def create_order(data: dict):
    with tracer.start_as_current_span("create_order") as span:
        span.set_attribute("user.id", data["user_id"])
        span.set_attribute("cart.item_count", len(data["items"]))
        span.set_attribute("cart.total_cents", data["total_cents"])

        # Sub-span pra lógica de validação
        with tracer.start_as_current_span("validate_inventory"):
            await validate_inventory(data["items"])

        # Sub-span pra payment
        with tracer.start_as_current_span("charge_payment") as pay_span:
            try:
                result = await charge(data["user_id"], data["total_cents"])
                pay_span.set_attribute("payment.gateway", result.gateway)
            except PaymentError as e:
                pay_span.set_status(trace.StatusCode.ERROR, str(e))
                pay_span.record_exception(e)
                raise

        orders_counter.add(1, {"tier": data.get("user_tier", "free")})
        return {"id": order_id}`}</CodeBlock>

        <Callout tone="info">
          <strong>Regra de ouro</strong>: use auto-instrumentation pra <em>infra comum</em> (HTTP server/client, DB,
          Redis, Kafka, gRPC). Adicione manual spans pra <em>lógica de negócio</em> que importa
          no debugging ("processPayment", "generateInvoice", "runEval"). Nomeie spans semanticamente —
          eles aparecem no trace como operação nomeada.
        </Callout>
      </Section>

      <Section title="Semantic Conventions: vocabulário padrão" accent={ACCENT}>
        <p>
          OTel padroniza nomes de atributos (<strong>semantic conventions</strong>) pra que traces
          entre serviços/vendors sejam comparáveis. Exemplos:
        </p>
        <ComparisonTable
          headers={['Domínio', 'Atributo padrão', 'Exemplo']}
          rows={[
            ['HTTP server', 'http.request.method, http.response.status_code, url.path', 'GET, 200, /api/users'],
            ['HTTP client', 'server.address, server.port, http.url', 'api.stripe.com, 443'],
            ['Database', 'db.system, db.name, db.statement', 'postgresql, myapp, SELECT ...'],
            ['Messaging', 'messaging.system, messaging.destination.name, messaging.message.id', 'kafka, orders, abc123'],
            ['RPC', 'rpc.system, rpc.service, rpc.method', 'grpc, UserService, GetUser'],
            ['Exception', 'exception.type, exception.message, exception.stacktrace', 'ValueError, ...'],
          ]}
        />
        <Callout tone="warn">
          <strong>Não invente nomes próprios</strong> pra coisas já padronizadas. "url.path" é a convenção
          OTel; "request_path", "http_path" e "endpoint" são não-padrão e quebram dashboards/queries
          pré-construídos. Use vocabulário oficial; adicione atributos custom (com prefixo da sua empresa)
          pra business-specific.
        </Callout>
      </Section>

      <Section title="OTel Collector: o proxy de telemetria" accent={ACCENT}>
        <p>
          Collector é um binário Go que você roda como agent (sidecar/daemon) ou gateway. Pipeline:
          <strong> receivers → processors → exporters</strong>.
        </p>
        <CodeBlock lang="yaml">{`# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

  # também aceita formatos alternativos pra migração
  jaeger:
    protocols:
      grpc: { endpoint: 0.0.0.0:14250 }
  prometheus:
    config:
      scrape_configs:
        - job_name: 'apps'
          static_configs:
            - targets: ['app:9090']

processors:
  batch:                      # agrupa antes de exportar — eficiência massiva
    timeout: 5s
    send_batch_size: 1024

  memory_limiter:              # evita OOM do Collector sob burst
    check_interval: 1s
    limit_mib: 500

  attributes:                  # scrub PII / transform attributes
    actions:
      - key: user.email
        action: delete
      - key: authorization
        action: delete
      - key: http.url
        action: update
        value: "REDACTED"
        pattern: "token=[^&]+"

  tail_sampling:               # amostragem inteligente — explicado abaixo
    decision_wait: 10s
    policies:
      - name: errors-policy
        type: status_code
        status_code: { status_codes: [ERROR] }
      - name: slow-policy
        type: latency
        latency: { threshold_ms: 500 }
      - name: random-policy
        type: probabilistic
        probabilistic: { sampling_percentage: 5 }

exporters:
  otlp/tempo:
    endpoint: tempo:4317
    tls: { insecure: true }
  prometheusremotewrite:
    endpoint: http://mimir:8080/api/v1/push
  loki:
    endpoint: http://loki:3100/loki/api/v1/push

service:
  pipelines:
    traces:
      receivers: [otlp, jaeger]
      processors: [memory_limiter, attributes, tail_sampling, batch]
      exporters: [otlp/tempo]
    metrics:
      receivers: [otlp, prometheus]
      processors: [memory_limiter, batch]
      exporters: [prometheusremotewrite]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, attributes, batch]
      exporters: [loki]`}</CodeBlock>

        <Callout tone="info">
          <strong>Por que agent + gateway?</strong> Agent (sidecar ou daemonset) tá próximo da app,
          faz buffering local se a rede falhar. Gateway (cluster central) consolida, aplica políticas
          corporativas (sampling, PII, routing), é o ponto único de contato com backends. Arquitetura
          típica de produção séria.
        </Callout>
      </Section>

      <Section title="Context Propagation: W3C Trace Context" accent={ACCENT}>
        <p>
          Quando Serviço A chama Serviço B, o span de B precisa saber o trace_id/span_id de A
          pra conectar. OTel usa <strong>W3C Trace Context</strong> (RFC, 2020) via headers HTTP:
        </p>
        <CodeBlock lang="http">{`# Request de A pra B
GET /api/items HTTP/1.1
Host: items-service
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             │  │                                 │                │
             │  └─ trace-id (hex, 16 bytes)       └─ parent-span  flags
             └─ version
tracestate: congo=t61rcWkgMzE,rojo=00f067aa0ba902b7       # vendor-specific extensions
baggage: user.tier=pro,tenant=acme                         # application-level context`}</CodeBlock>
        <p>
          OTel SDK injeta esses headers no outbound HTTP e extrai no inbound, automaticamente
          (via auto-instrumentation). Pra libs não suportadas, injete manual:
        </p>
        <CodeBlock lang="python">{`# manual_propagation.py — para libs sem instrumentação automática
from opentelemetry.propagate import inject, extract
from opentelemetry import context

# ─ outbound: injetar ─
carrier = {}
inject(carrier)   # preenche carrier com traceparent, tracestate, baggage
# carrier = {"traceparent": "00-...-01", "tracestate": "..."}
response = await http.post(url, json=data, headers=carrier)

# ─ inbound: extrair ─
ctx = extract(incoming_headers)
with tracer.start_as_current_span("handle", context=ctx):
    # span novo virou child do span upstream
    ...`}</CodeBlock>

        <p><strong>Baggage</strong> é diferente: carrega <em>dados de negócio</em> através do trace
        (ex: <InlineCode>tenant_id=acme</InlineCode>, <InlineCode>user.tier=pro</InlineCode>) disponíveis
        em qualquer span downstream. Use com moderação — cada header pesa na bandwidth.</p>
      </Section>

      <Section title="Sampling: head vs tail, probabilístico vs rule-based" accent={ACCENT}>
        <p>
          Em volumes altos, armazenar 100% dos traces é caro e desnecessário. Sampling escolhe
          quais guardar.
        </p>
        <ComparisonTable
          headers={['Tipo', 'Quando decide', 'Prós', 'Contras']}
          rows={[
            [
              'Head sampling (probabilistic)',
              'No início (primeiro span) — N%',
              'Barato, decisão local, consistente',
              'Pode perder erros raros; não conhece duration no início',
            ],
            [
              'Tail sampling (rule-based)',
              'Depois do trace completar, baseado em propriedades',
              'Guarda todos os erros, traces lentos, amostra o resto',
              'Requer Collector bufferizar, mais memória e latência',
            ],
            [
              'Ratio-based (TraceIdRatioBased)',
              'Head, baseado em hash(trace_id) &lt; ratio',
              'Consistente entre serviços — todo serviço do mesmo trace decide igual',
              'Mesmas limitações do head',
            ],
          ]}
        />

        <CodeBlock lang="yaml">{`# tail_sampling — política inteligente no Collector
processors:
  tail_sampling:
    decision_wait: 10s        # aguarda trace completar
    num_traces: 100000         # buffer de traces em memória
    policies:
      # Sempre guardar traces com erro
      - name: errors
        type: status_code
        status_code: { status_codes: [ERROR] }

      # Sempre guardar traces lentos
      - name: slow
        type: latency
        latency: { threshold_ms: 1000 }

      # Sempre guardar algum endpoint crítico
      - name: checkout
        type: string_attribute
        string_attribute:
          key: url.path
          values: ["/checkout"]

      # Amostra 5% do resto
      - name: baseline
        type: probabilistic
        probabilistic: { sampling_percentage: 5 }`}</CodeBlock>

        <Callout tone="info">
          <strong>Regra prática</strong>: em prod, use tail sampling pra manter 100% de erros e
          outliers + 1-5% baseline. Reduz custo ~20x com zero perda de visibilidade no que importa.
          Honeycomb popularizou isso; Tempo, Datadog e Grafana suportam.
        </Callout>
      </Section>

      <Section title="Resource Detection: contexto automático" accent={ACCENT}>
        <p>
          Resource Attributes identificam <em>quem</em> gerou a telemetria — service name, version,
          environment, kubernetes pod, cloud region. OTel detecta automaticamente se você ativar:
        </p>
        <CodeBlock lang="javascript">{`// Node.js — resource detectors
import { Resource } from '@opentelemetry/resources';
import { envDetector, hostDetector, processDetector } from '@opentelemetry/resources';
import { awsEcsDetector, awsEc2Detector } from '@opentelemetry/resource-detector-aws';
import { k8sAttributesDetector } from '@opentelemetry/resource-detector-kubernetes';

const sdk = new NodeSDK({
  resourceDetectors: [
    envDetector, hostDetector, processDetector,
    awsEc2Detector, awsEcsDetector,
    k8sAttributesDetector,
  ],
  // ...
});`}</CodeBlock>
        <p>
          Resultado: todo span automaticamente tem <InlineCode>k8s.pod.name</InlineCode>,
          <InlineCode> k8s.namespace</InlineCode>, <InlineCode>cloud.region</InlineCode>, etc. Filtrar
          "traces só do pod X" fica trivial.
        </p>
      </Section>

      <Section title="Decisões reais" accent={ACCENT}>
        <DecisionBox
          scenario="App novo em Node/Python — como começar OTel do zero?"
          winner="Auto-instrumentation + Collector sidecar + backend managed"
          winnerColor={ACCENT}
          why="80% do valor vem grátis. SDK auto + Collector como sidecar = ~2 dias pra ter traces end-to-end. Adicione manual spans em business logic conforme identifica gaps. Depois, adicione tail sampling pra reduzir custo."
          alternatives={[
            { label: 'SDK vendor-specific (Datadog Tracer, New Relic)', note: 'Menos portável; OTel venceu o mercado em 2024.' },
          ]}
        />
        <DecisionBox
          scenario="Migração de Jaeger client legacy pra OTel"
          winner="Collector com receiver jaeger, app segue emitindo Jaeger, depois migre SDK gradual"
          winnerColor={ACCENT}
          why="Collector aceita Jaeger input e exporta OTLP. Você ganha flexibilidade de backend imediatamente sem tocar app. Depois, migre cada serviço pro OTel SDK no seu tempo."
          alternatives={[
            { label: 'Big bang migration', note: 'Risco de perder visibilidade durante.' },
          ]}
        />
        <DecisionBox
          scenario="Alta volumetria (10k+ RPS) — sampling strategy"
          winner="Tail sampling com 100% errors/slow + 1-5% baseline"
          winnerColor={ACCENT}
          why="Cobre os traces que importam (problemas) + amostra normal. Reduz storage e custo de backend. Tail requer Collector bufferizado — use memory_limiter e gateway separado do sidecar."
          alternatives={[
            { label: 'Head sampling 10%', note: 'Mais simples, perde erros raros.' },
          ]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <div className="flex flex-col gap-4">
          <div>
            <p><strong>OTel overhead é relevante?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Auto-instrumentation: ~1-3% CPU em apps típicas. Manual spans: desprezível (ns/span).
              Export síncrono é que pode travar — SEMPRE use exportador batch+async (padrão do SDK).
            </p>
          </div>
          <div>
            <p><strong>OTel Logs já tá maduro?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Em Java, Python, .NET: sim. Em Node.js: quase (GA recente). Alternativa: continue com
              structured logs (JSON) + correlation via trace_id, OTel Collector tem receiver filelog
              pra coletar. Logs como signal OTel viraram GA em 2023.
            </p>
          </div>
          <div>
            <p><strong>Posso ter Collector em múltiplos backends?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Sim — pipelines paralelos. Ex: traces pra Tempo + Datadog (dual-write durante migração),
              metrics pra Prometheus + Honeycomb. O Collector copia pra cada exporter configurado.
            </p>
          </div>
          <div>
            <p><strong>Como lidar com apps legacy que não quero instrumentar?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              OTel Collector tem receivers pra sources externos: Prometheus (scrape), Fluentd/Fluent
              Bit (logs), podman/docker stats, hostmetrics. Você importa pra OTLP sem tocar o app.
            </p>
          </div>
          <div>
            <p><strong>Span attribute com dados sensíveis (PII) — o que fazer?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Use processor <InlineCode>attributes</InlineCode> ou <InlineCode>transform</InlineCode> no
              Collector pra delete/redact. Fazer no Collector centraliza políticas — em vez de
              dependendo de cada app fazer corretamente.
            </p>
          </div>
        </div>
      </Section>

      <Callout tone="success">
        <strong>Take-aways</strong>:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>OpenTelemetry = padrão aberto CNCF</strong> pra gerar/exportar telemetria. Mata vendor lock-in.</li>
          <li>SDK em 2 camadas: <strong>auto-instrumentation</strong> (pra libs) + <strong>manual</strong> (pra business logic).</li>
          <li><strong>OTel Collector</strong> é o proxy: receivers → processors → exporters. Sidecar + Gateway pra produção séria.</li>
          <li><strong>Semantic Conventions</strong>: use nomes padrão (http.request.method, db.system). Não invente.</li>
          <li><strong>W3C Trace Context</strong> propaga trace_id via headers (traceparent, tracestate, baggage).</li>
          <li><strong>Tail sampling</strong> &gt; head sampling em volumes altos — guarda o que importa (erros, slow), amostra o resto.</li>
          <li><strong>Resource detection</strong> (K8s, AWS, GCP) atribui contexto automático a todos os sinais.</li>
        </ul>
      </Callout>

      <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
        Próximo módulo: o pilar mais subestimado — logs estruturados bem feitos.
      </p>
    </div>
  );
}
