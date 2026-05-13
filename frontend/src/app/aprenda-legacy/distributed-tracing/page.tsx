import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, DecisionBox, NodeGraph, ComparisonFlow } from '@/components/article/primitives';

export const metadata = getModuleMetadata('distributed-tracing');

const ACCENT = '#79c0ff';

const quiz = [
  {
    question: 'O que define a relação parent-child entre spans?',
    options: [
      'O span filho tem menor timestamp que o pai',
      'O span filho contém o parent_id do span pai no mesmo trace_id',
      'O span pai e filho compartilham o mesmo span_id',
      'Spans são relacionados por serviço, não por ID',
    ],
    correct: 1,
    explanation: 'Um span filho carrega o span_id do pai como parent_span_id, ambos no mesmo trace_id. Isso forma a árvore de spans. Spans raiz (root) têm parent_span_id ausente ou nulo.',
  },
  {
    question: 'Qual a diferença entre head sampling e tail sampling?',
    options: [
      'Head sampling é mais preciso pois coleta mais dados',
      'Head sampling decide no início da requisição (aleatório); tail sampling decide após completar o trace (baseado em dados reais)',
      'Tail sampling é feito no cliente; head sampling no servidor',
      'São termos equivalentes para a mesma técnica',
    ],
    correct: 1,
    explanation: 'Head sampling: decisão no primeiro span (100% aleatória, baixo custo, mas pode descartar traces com erro). Tail sampling: decisão após o trace completar — permite guardar todos os traces lentos ou com erro, independente da taxa. Tail sampling requer buffer e é feito no Collector.',
  },
  {
    question: 'Para que serve o W3C Baggage (campo `baggage` no header HTTP)?',
    options: [
      'Comprimir o trace_id para economizar bandwidth',
      'Propagar metadados de negócio pelo contexto sem precisar re-passar em cada chamada',
      'Autenticar spans entre serviços',
      'Definir o timeout máximo de um trace',
    ],
    correct: 1,
    explanation: 'Baggage propaga key-value pairs pelo contexto de trace — ex: `user_tier=premium`, `tenant_id=acme`. Qualquer serviço downstream pode ler sem precisar receber como parâmetro explícito. Útil para enriquecer logs, aplicar rate limits diferenciados, ou decisões de feature flag por tenant.',
  },
  {
    question: 'Um span com `status=ERROR` mas sem evento de exceção é problemático por quê?',
    options: [
      'Não é problemático — status é suficiente',
      'Backends de tracing descartam spans de erro automaticamente',
      'Você sabe que algo falhou mas não tem o stack trace/mensagem para diagnosticar',
      'Spans de erro consomem mais storage desnecessariamente',
    ],
    correct: 2,
    explanation: 'Marcar status ERROR sem registrar o evento de exceção (span.record_exception()) deixa o span vermelho no Jaeger/Tempo mas sem contexto de diagnóstico. Ao capturar uma exceção, sempre: 1) span.record_exception(exc), 2) span.set_status(StatusCode.ERROR, str(exc)), 3) re-raise ou logar.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="distributed-tracing"
      title="Distributed Tracing: spans, baggage e sampling strategies"
      icon="🔍"
      xp={80}
      readTime={16}
      trailName="Observabilidade & SRE"
      trailColor={ACCENT}
      nextSlug="slos-error-budgets"
      nextTitle="SLOs e Error Budgets: da definição ao burn rate alert"
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
        Métricas dizem <em>que</em> algo está errado. Logs mostram <em>o que</em> aconteceu num serviço.
        Traces revelam <em>por que</em> uma requisição foi lenta ou falhou — rastreando o caminho completo
        por todos os serviços envolvidos. Em sistemas distribuídos com dezenas de microserviços, tracing
        é a única técnica que dá visibilidade ponta-a-ponta.
      </p>
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Neste módulo você vai entender a estrutura de spans e traces, como o W3C Trace Context propaga
        contexto por HTTP/gRPC/filas, o que é baggage e quando usar, e a diferença crucial entre head
        sampling (simples) e tail sampling (inteligente). Ao final, você saberá configurar tracing em
        serviços reais e escolher entre Jaeger e Grafana Tempo.
      </p>

      <Section title="Anatomia de um trace: spans e árvore">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Um <strong>trace</strong> é a representação completa de uma requisição distribuída — do momento
          em que entra no sistema até a resposta. É composto de <strong>spans</strong>: unidades de trabalho
          com duração, atributos e relação parent-child.
        </p>
        <NodeGraph
          title="Trace: POST /checkout — 450ms total"
          accent={ACCENT}
          legend="Waterfall: cada coluna representa um nível da hierarquia parent→child. payment-service é o gargalo (340ms) com ERROR no Stripe."
          columns={[
            {
              label: 'Root',
              nodes: [
                { icon: '🌐', label: 'HTTP POST /checkout', sub: 'api-gateway · 450ms · OK', tone: 'emphasis' },
              ],
            },
            {
              label: 'Services',
              nodes: [
                { label: 'validate-order', sub: 'order-service · 20ms · OK', tone: 'default' },
                { label: 'reserve-inventory', sub: 'inventory-service · 80ms · OK', tone: 'default' },
                { label: 'process-payment', sub: 'payment-service · 340ms · ERROR', tone: 'danger' },
              ],
            },
            {
              label: 'Downstream',
              nodes: [
                { label: 'db.query SELECT', sub: 'postgres · 75ms · db.system=postgresql', tone: 'muted' },
                { label: 'stripe-api-call', sub: 'http.client · 300ms · HTTP 408', tone: 'danger' },
                { label: 'payment-service.compensate', sub: '35ms · OK', tone: 'default' },
              ],
            },
          ]}
        />
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Cada span contém:
        </p>
        <CodeBlock lang="python">{`# Estrutura de um span OpenTelemetry
{
    "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",  # 128 bits, único por trace
    "span_id": "i9j0c2d4e6f8a0b2",                  # 64 bits, único por span
    "parent_span_id": "a1b2c3d4e5f6a7b8",            # None = root span
    "name": "process-payment",
    "kind": "SERVER",              # CLIENT | SERVER | PRODUCER | CONSUMER | INTERNAL
    "start_time": 1705329791.350,
    "end_time": 1705329791.690,    # duration = 340ms
    "status": {"code": "ERROR", "message": "Stripe timeout"},

    # Atributos — dados de contexto do span
    "attributes": {
        "service.name": "payment-service",
        "http.method": "POST",
        "http.url": "https://api.stripe.com/v1/charges",
        "http.status_code": 408,
        "payment.amount": 9990,
        "payment.currency": "BRL",
    },

    # Eventos — logs point-in-time dentro do span
    "events": [
        {
            "name": "exception",
            "timestamp": 1705329791.645,
            "attributes": {
                "exception.type": "stripe.error.APIConnectionError",
                "exception.message": "Connection timeout after 300s",
                "exception.stacktrace": "...",
            }
        }
    ],

    # Links — referências a outros traces (ex: mensagem de fila)
    "links": [],
    "resource": {"service.name": "payment-service", "service.version": "2.1.0"}
}`}</CodeBlock>
      </Section>

      <Section title="W3C Trace Context: propagação por HTTP">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Para que spans de serviços diferentes compartilhem o mesmo trace_id, o contexto precisa ser
          propagado nos headers HTTP. O padrão W3C Trace Context define dois headers:
        </p>
        <CodeBlock lang="bash">{`# traceparent — obrigatório
# Formato: versão-trace_id-parent_span_id-flags
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
#             ^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^ ^^
#             v0  trace_id (32 hex chars / 128 bits) parent_span_id  sampled=1

# tracestate — opcional, vendor-specific key-value
tracestate: rojo=00f067aa0ba902b7,congo=t61rcWkgMzE

# Flags (último byte):
# 01 = sampled (este trace está sendo coletado)
# 00 = not sampled (propaga contexto mas sem coletar dados)`}</CodeBlock>
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          O OpenTelemetry propaga isso automaticamente com auto-instrumentação. Para propagação manual:
        </p>
        <CodeBlock lang="python">{`# Python: propagação manual (útil em filas, workers assíncronos)
from opentelemetry import trace, propagate
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

propagator = TraceContextTextMapPropagator()

# === PRODUTOR (quem cria a mensagem) ===
def publish_to_queue(payload: dict, queue):
    carrier = {}
    propagator.inject(carrier)  # Extrai contexto ativo → dict

    message = {
        "payload": payload,
        "otel_context": carrier,  # {"traceparent": "00-4bf9...", "tracestate": ""}
    }
    queue.publish(message)

# === CONSUMIDOR (worker que processa a mensagem) ===
def process_queue_message(message: dict):
    carrier = message.get("otel_context", {})
    ctx = propagator.extract(carrier)  # Restaura contexto do produtor

    tracer = trace.get_tracer(__name__)
    with tracer.start_as_current_span(
        "process-order-event",
        context=ctx,  # Continua o trace do produtor
        kind=trace.SpanKind.CONSUMER,
    ) as span:
        span.set_attribute("messaging.system", "rabbitmq")
        span.set_attribute("messaging.destination", "orders")
        process(message["payload"])`}</CodeBlock>
      </Section>

      <Section title="Baggage: metadados de negócio no contexto">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          <strong>Baggage</strong> é um mecanismo para propagar key-value pairs pelo contexto de trace —
          além do trace_id. Qualquer serviço downstream pode ler sem receber como parâmetro explícito.
        </p>
        <CodeBlock lang="python">{`from opentelemetry import baggage, context

# === Injetar no início da requisição (ex: middleware de auth) ===
ctx = baggage.set_baggage("user.tier", "premium")
ctx = baggage.set_baggage("tenant.id", "acme-corp", context=ctx)
ctx = baggage.set_baggage("feature.flags", "new-checkout", context=ctx)

# Attach ao contexto da thread/coroutine
token = context.attach(ctx)

# === Ler em qualquer serviço downstream ===
user_tier = baggage.get_baggage("user.tier")      # "premium"
tenant_id = baggage.get_baggage("tenant.id")      # "acme-corp"

# Usar para decisões sem parâmetro explícito
if user_tier == "premium":
    rate_limit = 1000  # req/min
else:
    rate_limit = 100

# Baggage é propagado no header:
# baggage: user.tier=premium,tenant.id=acme-corp,feature.flags=new-checkout`}</CodeBlock>
        <Callout tone="warn">
          <strong>Limites do Baggage:</strong> Baggage é propagado em clear text no header HTTP e vai para
          TODOS os serviços downstream — incluindo serviços de terceiros. Nunca coloque PII, tokens ou
          dados sensíveis em baggage. Mantenha o payload pequeno (recomendado: &lt; 8KB total).
        </Callout>
      </Section>

      <Section title="Instrumentação manual: quando auto-instrumentation não basta">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Auto-instrumentação cobre HTTP, DB, gRPC. Para lógica de negócio interna (processamento de arquivo,
          algoritmo customizado, call externo não-suportado), instrumentação manual é necessária.
        </p>
        <CodeBlock lang="python">{`from opentelemetry import trace
from opentelemetry.trace import StatusCode

tracer = trace.get_tracer(__name__, schema_url="https://semconv.org/")

def process_checkout(cart_id: str, user_id: str) -> Order:
    with tracer.start_as_current_span("checkout.process") as span:
        # Atributos descrevem o que o span representa
        span.set_attribute("checkout.cart_id", cart_id)
        span.set_attribute("checkout.user_id", user_id)
        span.set_attribute("checkout.item_count", len(cart.items))

        try:
            # Sub-operação — span filho automático
            with tracer.start_as_current_span("checkout.validate_inventory") as inv_span:
                inventory = check_inventory(cart.items)
                inv_span.set_attribute("inventory.items_available", len(inventory))

            # Evento point-in-time dentro do span pai
            span.add_event("inventory.validated", {"available": len(inventory)})

            order = create_order(cart, user_id)
            span.set_attribute("checkout.order_id", order.id)
            span.set_status(StatusCode.OK)
            return order

        except InventoryError as e:
            # Registrar exceção — aparece na timeline do span no Jaeger/Tempo
            span.record_exception(e)
            span.set_status(StatusCode.ERROR, f"Inventory unavailable: {e}")
            raise

        except Exception as e:
            span.record_exception(e)
            span.set_status(StatusCode.ERROR, str(e))
            raise`}</CodeBlock>
        <CodeBlock lang="typescript">{`// Node.js: instrumentação manual
import { trace, SpanStatusCode, SpanKind } from '@opentelemetry/api';

const tracer = trace.getTracer('checkout-service', '1.0.0');

async function processCheckout(cartId: string, userId: string): Promise<Order> {
  return tracer.startActiveSpan(
    'checkout.process',
    {
      kind: SpanKind.SERVER,
      attributes: { 'checkout.cart_id': cartId, 'checkout.user_id': userId },
    },
    async (span) => {
      try {
        const order = await createOrder(cartId, userId);
        span.setAttributes({ 'checkout.order_id': order.id });
        span.setStatus({ code: SpanStatusCode.OK });
        return order;
      } catch (err) {
        span.recordException(err as Error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
        throw err;
      } finally {
        span.end(); // SEMPRE chamar end() — mesmo em erro
      }
    }
  );
}`}</CodeBlock>
      </Section>

      <Section title="Sampling: head vs tail">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Em produção, coletar 100% dos traces é inviável (custo, storage, ingestão). Sampling define
          quais traces guardar. Existem duas estratégias fundamentais:
        </p>
        <ComparisonFlow
          title="Head Sampling vs Tail Sampling"
          accent={ACCENT}
          left={{
            label: '⚡ HEAD SAMPLING',
            steps: [
              'Request chega',
              'Root Span criado',
              'Sorteia aleatório (ex: 10%)',
              '10% → coleta todos os spans',
              '90% → descarta todos os spans',
              '✅ Zero overhead para 90% dos requests',
              '❌ Pode descartar traces com erro ou lentos',
            ],
          }}
          right={{
            label: '🧠 TAIL SAMPLING',
            steps: [
              'Request chega',
              'Todos os spans bufferizados no Collector',
              'Aguarda trace completar (~30s)',
              'Avalia: ERROR? latência > 2s? debug?',
              'Guarda sempre os problemáticos',
              '✅ Garante captura de traces problemáticos',
              '❌ Requer buffer de memória no Collector',
            ],
          }}
        />
        <CodeBlock lang="yaml">{`# Tail sampling no OTel Collector
processors:
  tail_sampling:
    decision_wait: 30s          # Aguarda trace completar
    num_traces: 100000          # Buffer de traces em memória
    expected_new_traces_per_sec: 1000

    policies:
      # SEMPRE guardar traces com erro
      - name: errors-policy
        type: status_code
        status_code: {status_codes: [ERROR]}

      # SEMPRE guardar traces lentos (> 2s)
      - name: slow-traces-policy
        type: latency
        latency: {threshold_ms: 2000}

      # SEMPRE guardar traces com header de debug
      - name: debug-policy
        type: string_attribute
        string_attribute:
          key: "sampling.debug"
          values: ["true"]

      # 5% dos restantes aleatoriamente
      - name: baseline-policy
        type: probabilistic
        probabilistic: {sampling_percentage: 5}

      # Composta: todos os spans de um trace devem satisfazer
      - name: composite-policy
        type: composite
        composite:
          max_total_spans_per_second: 10000
          policy_order: [errors-policy, slow-traces-policy, debug-policy, baseline-policy]`}</CodeBlock>
      </Section>

      <Section title="Jaeger vs Grafana Tempo">
        <ComparisonTable
          headers={['Critério', 'Jaeger', 'Grafana Tempo']}
          rows={[
            ['Storage backend', 'Elasticsearch, Cassandra, Badger', 'Object storage (S3, GCS, MinIO) — muito mais barato'],
            ['Query language', 'Jaeger Query (simples)', 'TraceQL — como PromQL mas para traces'],
            ['Integração Grafana', 'Plugin separado', 'Nativa — mesma UI que Loki e Mimir'],
            ['Escalabilidade', 'Limitada pelo ES/Cassandra', 'Horizontal via object storage — barato em escala'],
            ['Quando usar', 'Já tem ES na stack; time pequeno; familiar', 'Stack LGTM completa; custo é preocupação; TraceQL'],
            ['Managed', 'Jaeger no Kubernetes | sem SaaS oficial', 'Grafana Cloud Traces (serverless)'],
          ]}
        />
        <DecisionBox
          scenario="Nova stack de observabilidade, time de 5-20 engenheiros, custo importa"
          winner="Grafana Tempo + Loki + Mimir (LGTM stack)"
          winnerColor={ACCENT}
          why="Object storage é 10-50× mais barato que Elasticsearch para dados de trace. TraceQL permite queries avançadas. Integração nativa entre traces (Tempo), logs (Loki) e métricas (Mimir) no Grafana — link direto de log para trace via trace_id."
          alternatives={[
            { label: 'Jaeger + Elasticsearch', when: 'Já tem ES operado internamente, time familiarizado com Jaeger' },
            { label: 'Datadog APM / Honeycomb (SaaS)', when: 'Time pequeno sem capacidade de operar infra de observabilidade; aceita custo SaaS' },
            { label: 'Zipkin', when: 'Legacy — evitar para novas stacks; sem suporte a OTLP nativo' },
          ]}
        />
      </Section>

      <Section title="TraceQL: consultando traces como dados">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          TraceQL (Grafana Tempo) permite queries poderosas sobre atributos de spans — muito além de
          buscar por trace_id.
        </p>
        <CodeBlock lang="bash">{`# TraceQL — exemplos práticos

# Todos os traces com erro no payment-service
{service.name="payment-service" && status=error}

# Traces com duração > 2s no checkout
{span.name="checkout.process" && duration > 2s}

# Traces onde payment falhou com status HTTP 500
{service.name="payment-service" && http.status_code=500}

# Traces de usuário premium com latência > 1s (via baggage/atributo)
{span.user.tier="premium" && duration > 1s}

# Buscar por atributo de negócio
{span.checkout.order_id="ORD-12345"}

# Agrupar por serviço + contar erros (Tempo 2.4+)
{status=error} | by(service.name) | count() > 10

# Rate de erros por serviço
rate({status=error}[5m]) by (service.name)`}</CodeBlock>
      </Section>

      <Section title="Semantic Conventions: nomes padronizados">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          OpenTelemetry Semantic Conventions define nomes de atributos padronizados. Seguir essas convenções
          permite que ferramentas como Jaeger e Tempo reconheçam e exibam dados automaticamente.
        </p>
        <ComparisonTable
          headers={['Domínio', 'Atributo', 'Exemplo']}
          rows={[
            ['HTTP', 'http.method, http.url, http.status_code, http.route', 'POST, /checkout, 200, /checkout'],
            ['Database', 'db.system, db.name, db.statement, db.operation', 'postgresql, orders_db, SELECT..., query'],
            ['Messaging', 'messaging.system, messaging.destination, messaging.operation', 'rabbitmq, orders, publish'],
            ['RPC', 'rpc.system, rpc.service, rpc.method', 'grpc, OrderService, CreateOrder'],
            ['Serviço', 'service.name, service.version, service.namespace', 'payment-service, 2.1.0, production'],
            ['Runtime', 'process.runtime.name, process.pid', 'python, 12345'],
          ]}
        />
      </Section>

      <Section title="Q&A — perguntas típicas de entrevista SRE">
        <div className="flex flex-col gap-4">
          {[
            {
              q: 'Como tracear uma requisição que passa por uma fila de mensagens (ex: SQS, Kafka)?',
              a: 'Injetar o carrier (traceparent + tracestate) nos metadados da mensagem ao publicar. O consumidor extrai o carrier e restaura o contexto com propagator.extract(). O span do consumidor usa kind=CONSUMER e recebe o contexto do produtor — continuando o mesmo trace_id. Assim o Jaeger/Tempo mostra o trace completo incluindo o "gap" assíncrono da fila.',
            },
            {
              q: 'Um trace tem um span lento mas não consigo ver por quê. O que verificar?',
              a: 'Waterfall: identificar qual span filho é o mais lento. Verificar atributos do span (ex: db.statement — query sem índice?). Ver eventos registrados (span.add_event) para timestamps internos. Verificar se há "gap" entre spans (tempo no servidor sem span correspondente — pode indicar processamento não instrumentado ou contenção de thread). Se for DB, verificar db.rows_affected e db.statement.',
            },
            {
              q: 'Por que não instrumentar tudo manualmente desde o início?',
              a: 'Auto-instrumentação cobre 80% do trabalho com zero código. Frameworks como FastAPI, Django, Flask, Express, gRPC, sqlalchemy, redis, boto3 já têm instrumentadores automáticos. Instrumentação manual deve ser adicionada apenas para operações de negócio críticas não cobertas — ex: processamento de arquivo, algoritmos customizados, integrações sem instrumentador oficial.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-lg p-4" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <p className="font-semibold mb-2" style={{ color: 'var(--ffv-muted)' }}>P: {q}</p>
              <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>R: {a}</p>
            </div>
          ))}
        </div>
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Trace = árvore de spans com mesmo trace_id. Span = unidade de trabalho com duração, atributos e eventos.</li>
          <li>W3C Trace Context (header traceparent) propaga contexto automaticamente por HTTP — OTel faz isso sem código manual.</li>
          <li>Baggage propaga metadados de negócio (tenant_id, user_tier) downstream — nunca PII ou dados sensíveis.</li>
          <li>Head sampling: simples, zero overhead, pode perder traces problemáticos. Tail sampling: inteligente, guarda erros/lentos, requer buffer.</li>
          <li>Sempre registrar exceção no span: record_exception() + set_status(ERROR) + span.end() no finally.</li>
          <li>Grafana Tempo + object storage (S3/MinIO) é significativamente mais barato que Jaeger + Elasticsearch em escala.</li>
          <li>Seguir Semantic Conventions é o que permite ferramentas reconhecerem automaticamente operações de DB, HTTP, messaging.</li>
        </ul>
      </Callout>
    </div>
  );
}
