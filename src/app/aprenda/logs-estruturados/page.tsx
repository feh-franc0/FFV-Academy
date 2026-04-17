import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, DecisionBox, ArchDiagram } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Logs Estruturados: JSON, correlation IDs e levels com propósito | FFV Academy',
  description: 'JSON logs, trace_id/span_id correlation, log levels (o que DEBUG, INFO, WARN, ERROR realmente significam), structured logging libs e formatter cost.',
  keywords: 'logs estruturados, structured logging, JSON logs, correlation ID, trace_id, log levels, observabilidade, SRE',
};

const ACCENT = '#79c0ff';

const quiz = [
  {
    question: 'Por que `print("user logged in")` é inferior a log estruturado em produção?',
    options: [
      'É mais lento em tempo de CPU',
      'Não pode ser indexado/filtrado por campos específicos num sistema de logs centralizado',
      'Strings não suportam unicode em Python',
      'Print não aparece em containers Docker',
    ],
    correct: 1,
    explanation: 'Logs de texto livre exigem regex frágil para extrair campos. Logs JSON permitem filtros exatos — `level="error" service="checkout"` — sem parsing custoso e com garantia de schema.',
  },
  {
    question: 'Qual o propósito do campo `trace_id` num log estruturado?',
    options: [
      'Identificar o servidor físico que gerou o log',
      'Correlacionar todos os logs de uma requisição distribuída num único trace',
      'Aumentar a entropia do log para segurança',
      'Substituir o timestamp ISO 8601',
    ],
    correct: 1,
    explanation: '`trace_id` é propagado via W3C Trace Context (header `traceparent`) e injetado em todos os logs gerados durante aquela requisição — mesmo em microserviços diferentes. Permite reconstruir o caminho completo de uma request só filtrando pelo trace_id.',
  },
  {
    question: 'Em que nível de log você deve registrar uma falha ao salvar no banco que causa rollback de transação?',
    options: [
      'DEBUG — é informação de diagnóstico interna',
      'INFO — usuário foi informado do erro',
      'WARN — o sistema se recuperou automaticamente',
      'ERROR — a operação falhou, requer investigação',
    ],
    correct: 3,
    explanation: 'ERROR significa: operação falhou, dado pode ter se perdido ou estado ficou inconsistente, e alguém precisa investigar. WARN é reservado para situações degradadas mas recuperáveis (retry bem-sucedido, cache miss, etc.).',
  },
  {
    question: 'Qual a principal preocupação de performance com logging síncrono em hot paths?',
    options: [
      'Logs consomem muita RAM de heap',
      'Serialização JSON e I/O de disco/rede no caminho crítico aumentam latência de p99',
      'Logs em JSON são maiores que texto e saturm o disco mais rápido',
      'O GC do Python não consegue limpar buffers de log',
    ],
    correct: 1,
    explanation: 'Serializar JSON e fazer write() síncrono em hot path (ex: handler de request) adiciona microssegundos a milissegundos de latência. A solução é logging assíncrono: buffer em memória + worker thread dedicado ao flush, ou usar libs como `loguru` (Python) e `pino` (Node) que já são async/low-latency por design.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="logs-estruturados"
      title="Logs Estruturados: JSON, correlation IDs e levels com propósito"
      icon="📝"
      xp={70}
      readTime={14}
      trailName="Observabilidade & SRE"
      trailColor={ACCENT}
      nextSlug="distributed-tracing"
      nextTitle="Distributed Tracing: spans, baggage e sampling strategies"
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
        Todo sistema em produção tem logs. Poucos têm logs que realmente ajudam numa crise às 3h da manhã.
        A diferença entre um log inútil e um que resolve um incidente em 5 minutos não é quantidade — é
        estrutura. Log estruturado não é modismo: é a base de qualquer sistema de observabilidade que
        funciona em escala.
      </p>
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Neste módulo você vai entender por que JSON logs substituíram texto livre, como correlation IDs
        ligam logs de diferentes serviços numa mesma requisição, o que cada nível de log realmente significa
        (e por que 90% dos times usa WARN errado), e o custo real de formatter síncrono em hot paths.
      </p>

      <Section title="Onde isso entra no exame e na prática">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          No domínio de Observabilidade & SRE, logs estruturados são o pré-requisito para tudo mais: métricas
          derivadas de logs, correlação com traces, alertas baseados em padrões. Sem estrutura, logs são
          strings opacas. Com estrutura, são dados consultáveis.
        </p>
        <Callout tone="info">
          <strong>Nível alvo:</strong> Você deve conseguir implementar structured logging em qualquer serviço,
          injetar trace_id/span_id automaticamente, e configurar o pipeline de logs para não impactar latência
          de produção.
        </Callout>
      </Section>

      <Section title="Texto livre vs JSON estruturado">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Considere o mesmo evento em dois formatos:
        </p>
        <CodeBlock lang="bash">{`# ❌ Texto livre — o que a maioria tem
2024-01-15 14:23:11 ERROR Failed to process order 12345 for user 99 after 3 retries

# ✅ JSON estruturado — o que você quer ter
{
  "timestamp": "2024-01-15T14:23:11.847Z",
  "level": "error",
  "message": "Failed to process order after retries",
  "service": "order-service",
  "version": "1.4.2",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "order_id": "12345",
  "user_id": "99",
  "retry_count": 3,
  "error": "ConnectionTimeout",
  "error_detail": "payment-service:8080 unreachable after 5000ms",
  "duration_ms": 15234
}`}</CodeBlock>
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Com JSON, você filtra em qualquer sistema de logs (Loki, Datadog, CloudWatch):
        </p>
        <CodeBlock lang="bash">{`# Loki LogQL — todos os erros de payment no último 1h
{service="order-service"} | json | level="error" | error_detail =~ "payment.*"

# Busca pelo trace_id específico (correlaciona com spans no Tempo)
{service=~".+"} | json | trace_id="4bf92f3577b34da6a3ce929d0e0e4736"

# Latência P99 derivada de logs (sem Prometheus)
{service="order-service"} | json | unwrap duration_ms | p99()`}</CodeBlock>
      </Section>

      <Section title="Correlation IDs: amarrando tudo">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Uma requisição de checkout passa por 5 serviços. Sem um identificador comum, você tem 5 grupos
          de logs desconexos. Com <code>trace_id</code>, você tem a jornada completa.
        </p>
        <ArchDiagram>{`
  Cliente
    │
    ▼ POST /checkout
  ┌─────────────────────────────────────────────────────────┐
  │  API Gateway                                            │
  │  Gera trace_id: "4bf92f3577b34da6a3ce929d0e0e4736"     │
  │  Injeta header: traceparent: 00-4bf9...-00f0...-01      │
  └─────────────┬───────────────────────────────────────────┘
                │ HTTP + traceparent header
    ┌───────────▼───────────┐   ┌──────────────────────┐
    │  order-service        │──▶│  payment-service      │
    │  trace_id: 4bf9...    │   │  trace_id: 4bf9...    │
    │  span_id:  00f0...    │   │  span_id:  a3ce...    │
    └───────────────────────┘   └──────────────────────┘
                │
    ┌───────────▼───────────┐   ┌──────────────────────┐
    │  inventory-service    │   │  notification-service │
    │  trace_id: 4bf9...    │   │  trace_id: 4bf9...    │
    └───────────────────────┘   └──────────────────────┘

  Resultado: filtrar trace_id="4bf9..." retorna TODOS os logs
  de TODOS os serviços para essa requisição específica
`}</ArchDiagram>
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          O OpenTelemetry propaga isso automaticamente via W3C Trace Context (visto no módulo anterior).
          O que importa aqui é que o log exija que o trace_id seja <em>injetado no contexto de logging</em>
          — não passado manualmente a cada chamada de log.
        </p>
      </Section>

      <Section title="Injeção automática de trace_id no logger">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          A forma correta: configurar o logger para ler o span ativo do contexto OTel a cada registro.
          Sem poluir chamadas individuais com parâmetros extras.
        </p>
        <CodeBlock lang="python">{`# Python: loguru + OpenTelemetry context bridge
import logging
import json
from opentelemetry import trace
from opentelemetry.trace import format_trace_id, format_span_id

class OtelJsonFormatter(logging.Formatter):
    """Injeta trace_id e span_id do contexto OTel ativo."""

    def format(self, record: logging.LogRecord) -> str:
        ctx = trace.get_current_span().get_span_context()

        log_entry = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
            "level": record.levelname.lower(),
            "message": record.getMessage(),
            "logger": record.name,
            "module": record.module,
            "line": record.lineno,
        }

        # Injetar trace context se span ativo
        if ctx.is_valid:
            log_entry["trace_id"] = format_trace_id(ctx.trace_id)
            log_entry["span_id"] = format_span_id(ctx.span_id)
            log_entry["trace_flags"] = ctx.trace_flags

        # Campos extras passados via extra={}
        for key, value in record.__dict__.items():
            if key not in logging.LogRecord.__dict__ and not key.startswith("_"):
                log_entry[key] = value

        # Stacktrace se exception
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, default=str)


# Setup — uma vez no startup
handler = logging.StreamHandler()
handler.setFormatter(OtelJsonFormatter())
logging.getLogger().addHandler(handler)
logging.getLogger().setLevel(logging.INFO)

logger = logging.getLogger(__name__)

# Uso em qualquer lugar — trace_id é injetado automaticamente
def process_order(order_id: str, user_id: str):
    logger.info(
        "Processing order",
        extra={"order_id": order_id, "user_id": user_id}
    )
    # Output: {"timestamp":"...","level":"info","message":"Processing order",
    #          "trace_id":"4bf92f...","span_id":"00f067...","order_id":"123","user_id":"99"}`}</CodeBlock>

        <CodeBlock lang="typescript">{`// Node.js: pino + OpenTelemetry (pino é 8× mais rápido que winston)
import pino from 'pino';
import { trace, context } from '@opentelemetry/api';

// Mixin lido a cada registro — injeta trace context
const otelMixin = () => {
  const span = trace.getActiveSpan();
  if (!span) return {};

  const ctx = span.spanContext();
  return {
    trace_id: ctx.traceId,
    span_id: ctx.spanId,
    trace_flags: ctx.traceFlags,
  };
};

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  mixin: otelMixin,
  timestamp: pino.stdTimeFunctions.isoTime,
  // pino serializa em JSON por default — zero config adicional
});

export { logger };

// Uso
logger.info({ order_id: '123', user_id: '99' }, 'Processing order');
// Output: {"time":"2024-01-15T14:23:11.847Z","level":"info","msg":"Processing order",
//          "trace_id":"4bf92f...","span_id":"00f067...","order_id":"123","user_id":"99"}`}</CodeBlock>
      </Section>

      <Section title="Log levels: o que cada um realmente significa">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          A maioria dos times usa log levels de forma inconsistente. Aqui está a semântica correta —
          testada em ambientes de produção reais:
        </p>
        <ComparisonTable
          headers={['Level', 'Quando usar', 'Resposta esperada', 'Em produção']}
          rows={[
            ['TRACE', 'Passos internos granulares (loop iteration, byte parsing)', 'Nenhuma — só diagnóstico local', '❌ Nunca ligado'],
            ['DEBUG', 'Valores de variáveis, decisões de branch, SQL gerado', 'Nenhuma — diagnóstico sob demanda', '⚠️ Sob demanda com sampling'],
            ['INFO', 'Evento de negócio significativo (order criada, user logado, payment aprovado)', 'Nenhuma — operação normal', '✅ Sempre ligado'],
            ['WARN', 'Situação degradada mas recuperada (retry bem-sucedido, cache miss, rate limit atingido)', 'Monitorar tendência', '✅ Sempre ligado + alertas de volume'],
            ['ERROR', 'Operação falhou, dado pode estar perdido ou inconsistente', 'Investigação imediata', '🚨 Alerta em qualquer ocorrência'],
            ['FATAL/CRITICAL', 'Sistema não consegue continuar (DB connection pool esgotado, config inválida)', 'Restart + pager duty', '🚨🚨 PagerDuty imediato'],
          ]}
        />
        <Callout tone="warn">
          <strong>Anti-patterns comuns:</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li><code>logger.error("User not found")</code> — 404 é INFO, não ERROR. Erro do cliente ≠ erro do sistema.</li>
            <li><code>logger.warn("Database query took 500ms")</code> — se isso é normal no P99, é INFO. Se é anomalia, é ERROR com context.</li>
            <li><code>logger.info("SELECT * FROM orders WHERE id=...")</code> em loop — INFO deve ser eventos de negócio, não I/O interno. Use DEBUG.</li>
            <li>Logar exceptions sem stack trace — sempre passe o objeto de exceção ao logger.</li>
          </ul>
        </Callout>
      </Section>

      <Section title="Campos obrigatórios vs opcionais">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Defina um schema base que <em>todos</em> os serviços seguem. Campos extras são opcionais por serviço.
        </p>
        <CodeBlock lang="python">{`# Schema base obrigatório (todos os serviços)
REQUIRED_FIELDS = {
    "timestamp",    # ISO 8601 com milissegundos
    "level",        # error | warn | info | debug
    "message",      # descrição human-readable do evento
    "service",      # nome do serviço (ex: "order-service")
    "version",      # versão do binário (ex: "1.4.2")
    "trace_id",     # se OTel ativo (W3C format)
    "span_id",      # se OTel ativo
}

# Campos opcionais recomendados por contexto
CONTEXT_FIELDS = {
    # HTTP handler
    "http_method", "http_path", "http_status", "duration_ms",

    # Database
    "db_operation", "db_table", "db_duration_ms",

    # Queue/messaging
    "queue_name", "message_id", "consumer_group",

    # Negócio
    "user_id",      # ⚠️ Cuidado LGPD/GDPR — anonimizar se necessário
    "order_id", "payment_id", "tenant_id",

    # Error
    "error",        # tipo/classe do erro
    "error_detail", # mensagem de detalhe
    "retry_count",  # número de tentativas anteriores
}`}</CodeBlock>
      </Section>

      <Section title="Bibliotecas recomendadas por linguagem">
        <ComparisonTable
          headers={['Linguagem', 'Lib recomendada', 'Por quê', 'Alternativa']}
          rows={[
            ['Python', 'structlog', 'Pipeline de processadores, contexto thread-local/async, OTel bridge nativo', 'loguru (ergonomia, async)'],
            ['Node.js/TS', 'pino', 'Async, 8× mais rápido que winston, JSON por default, child loggers', 'winston (mais configurável)'],
            ['Go', 'slog (stdlib 1.21+)', 'Padrão da linguagem, zero deps, structured por design', 'zerolog (mais rápido)'],
            ['Java', 'logback + logstash-encoder', 'JSON encoder para Logback, padrão enterprise', 'log4j2 (async appender)'],
            ['Rust', 'tracing + tracing-subscriber', 'Integração nativa com tokio async, OTel bridge', 'slog'],
          ]}
        />
        <CodeBlock lang="python">{`# structlog: o mais ergonômico em Python
import structlog
from opentelemetry import trace

# Configurar uma vez
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,     # contexto async-safe
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.BoundLogger,
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
)

logger = structlog.get_logger()

# Contexto de request — FastAPI middleware
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    span = trace.get_current_span()
    ctx = span.get_span_context()

    # Bind ao contexto da coroutine — disponível em TODOS os logs da request
    structlog.contextvars.bind_contextvars(
        trace_id=format(ctx.trace_id, "032x"),
        span_id=format(ctx.span_id, "016x"),
        method=request.method,
        path=request.url.path,
        request_id=request.headers.get("x-request-id"),
    )

    response = await call_next(request)

    logger.info(
        "request.completed",
        status=response.status_code,
    )
    # Output: {"event":"request.completed","level":"info","timestamp":"...",
    #          "trace_id":"...","method":"POST","path":"/checkout","status":200}

    structlog.contextvars.clear_contextvars()
    return response`}</CodeBlock>
      </Section>

      <Section title="Performance: o custo real de logging">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Logging mal implementado é uma das causas mais comuns de latência inexplicável em produção.
          Os culpados principais:
        </p>
        <ComparisonTable
          headers={['Problema', 'Impacto', 'Solução']}
          rows={[
            ['Write síncrono em cada log', '+0.1–5ms por log em hot path', 'Logger assíncrono com buffer em memória + worker thread'],
            ['JSON serialization a cada registro', '+0.05–0.5ms (Python: stdlib json lento)', 'orjson (Python) ou pino (Node) — 5–10× mais rápido'],
            ['String interpolation eager', 'CPU gasta formatando strings que podem ser filtradas', 'Lazy evaluation: log.debug("Val: %s", expensive_fn()) — só executa se DEBUG ativo'],
            ['Lock global no handler', 'Contention em multi-thread — degrada throughput linear', 'Handler thread-safe sem lock global (pino, zerolog)'],
            ['Stack trace em cada WARN', 'Stack trace serialization é 10–100× mais caro que mensagem', 'Stack trace apenas em ERROR+; WARN usa campos estruturados'],
          ]}
        />
        <CodeBlock lang="python">{`# ❌ Eager evaluation — executa mesmo se DEBUG desligado
logger.debug(f"Cache keys: {json.dumps(cache.keys())}")  # dump() sempre executa

# ✅ Lazy — executa só se DEBUG ativo
logger.debug("Cache keys: %s", lambda: json.dumps(cache.keys()))

# ❌ Write síncrono em loop
for item in items:
    logger.info("Processing", extra={"item_id": item.id})  # I/O a cada iteração

# ✅ Agrupar ou usar rate limiting de logs
if len(items) > 100:
    logger.info("Processing batch", extra={"count": len(items)})
else:
    for item in items:
        logger.info("Processing", extra={"item_id": item.id})

# Configurar handler assíncrono (Python)
import logging.handlers
import queue

log_queue = queue.Queue(-1)  # unlimited
queue_handler = logging.handlers.QueueHandler(log_queue)
queue_listener = logging.handlers.QueueListener(
    log_queue,
    actual_handler,  # O handler real (StreamHandler, RotatingFileHandler)
    respect_handler_level=True,
)
queue_listener.start()  # Thread separada para I/O`}</CodeBlock>
      </Section>

      <Section title="Log sampling: quando você tem muito dado">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Serviços de alto volume (1k+ req/s) não podem logar cada request ao nível INFO sem custo proibitivo.
          Sampling é a solução — mas precisa preservar logs de erros e traces completos.
        </p>
        <DecisionBox
          scenario="Serviço com 5.000 req/s — logging de cada request custa $2.000/mês em Datadog"
          winner="Head sampling + full error logs"
          winnerColor={ACCENT}
          why="Amostrar 10% dos requests INFO reduz custo em 90%. Erros, WARNs e traces com anomalia são sempre enviados integralmente."
          alternatives={[
            { label: 'Logar tudo (sem sampling)', when: 'Serviços < 100 req/s ou auditoria regulatória obrigatória' },
            { label: 'Sampling por trace_id (tail)', when: 'Quando o Collector OTel controla sampling — logs e traces amostrados consistentemente' },
            { label: 'Drop total de INFO em produção', when: 'Anti-pattern — você perde visibilidade de operações normais que precedem falhas' },
          ]}
        />
        <CodeBlock lang="python">{`# Rate-limited logging: logar no máximo N vezes/segundo
import time
from collections import defaultdict

class RateLimitedLogger:
    def __init__(self, logger, max_per_second: int = 100):
        self._logger = logger
        self._max = max_per_second
        self._counts: dict[str, int] = defaultdict(int)
        self._window_start = time.monotonic()

    def info(self, event: str, **kwargs):
        now = time.monotonic()
        if now - self._window_start > 1.0:
            self._counts.clear()
            self._window_start = now

        if self._counts[event] < self._max:
            self._counts[event] += 1
            self._logger.info(event, **kwargs)
        # Dropped — nunca bloqueia o caller`}</CodeBlock>
      </Section>

      <Section title="Pipeline de logs: do serviço ao storage">
        <ArchDiagram>{`
  ┌─────────────────────────────────────────────────────────────────┐
  │  Serviços (qualquer linguagem)                                  │
  │  Emitem JSON para stdout                                        │
  │  ← padrão 12-factor app: log vai para stdout, infra coleta     │
  └──────┬──────────────┬──────────────────┬────────────────────────┘
         │              │                  │
         ▼              ▼                  ▼
  ┌────────────┐ ┌────────────┐ ┌────────────────────┐
  │  Fluent    │ │  Promtail  │ │  OTel Collector     │
  │  Bit/D     │ │  (Grafana) │ │  (logs pipeline)    │
  │ DaemonSet  │ │ DaemonSet  │ │  Deployment         │
  └─────┬──────┘ └─────┬──────┘ └────────┬────────────┘
        │              │                  │
        ▼              ▼                  ▼
  ┌─────────────────────────────────────────────────────┐
  │  Log Backend                                        │
  │                                                     │
  │  Self-hosted: Grafana Loki (labels + LogQL)         │
  │  Managed: Datadog Logs, CloudWatch Logs Insights    │
  │  Enterprise: Elastic/OpenSearch                     │
  │                                                     │
  │  Retenção:                                          │
  │  • ERROR/WARN: 90 dias                              │
  │  • INFO: 30 dias                                    │
  │  • DEBUG: 7 dias (se coletado)                      │
  └─────────────────────────────────────────────────────┘
`}</ArchDiagram>
        <Callout tone="info">
          <strong>Loki labels vs fields:</strong> No Grafana Loki, <em>labels</em> são indexados (baixa cardinalidade:
          service, env, level). <em>Campos</em> dentro do JSON são consultados via parser (<code>| json</code>)
          sem index — mais flexíveis mas mais lentos. Nunca coloque user_id ou trace_id como label Loki —
          isso explode a cardinalidade do índice.
        </Callout>
      </Section>

      <Callout tone="warn">
        <strong>Dados sensíveis em logs:</strong> LGPD/GDPR proíbem logar PII sem justificativa.
        Nunca logue passwords, tokens, CPF, cartão de crédito, email completo em INFO+.
        Use masking ou hashing antes de logar: <code>"email": "f***@gmail.com"</code>,
        <code>"card": "**** **** **** 4242"</code>. Erros de compliance em logs são difíceis de
        reverter — logs são frequentemente arquivados por anos.
      </Callout>

      <Section title="Q&A — perguntas típicas de entrevista SRE">
        <div className="flex flex-col gap-4">
          {[
            {
              q: 'Qual a diferença entre correlation ID, request ID e trace ID?',
              a: 'Request ID: identifica uma requisição HTTP individual (gerado no edge/gateway). Correlation ID: termo genérico para qualquer ID que correlaciona eventos — pode ser o request ID propagado. Trace ID: formato específico do OpenTelemetry (W3C Trace Context) — 128 bits hex — garante unicidade global e integra com Jaeger/Tempo. Use trace_id quando tiver OTel; correlation_id como fallback manual.',
            },
            {
              q: 'Por que logar para stdout e não diretamente para arquivo ou Elasticsearch?',
              a: '12-factor app: "Logs são streams de eventos". Logar para stdout desacopla o serviço de infraestrutura de logging. Em Kubernetes, kubelet já captura stdout. Você pode trocar o backend (Loki, Elasticsearch, Datadog) sem mudar código. Logar direto para Elastic cria dependência de runtime — se o Elastic cair, o serviço pode bloquear ou perder dados.',
            },
            {
              q: 'Como debugar em produção sem ligar DEBUG global (que gera volume absurdo)?',
              a: 'Dynamic log level por trace_id ou por flag de feature: o middleware verifica se o request tem header `X-Debug-Token: <secret>` e então eleva o nível para DEBUG apenas para aquela requisição/goroutine. Ou use tail-based sampling no Collector OTel: spans com erro trigam coleta de todos os logs daquele trace, independente do nível.',
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
          <li>JSON estruturado não é opcional em produção — é a base de toda observabilidade que escala.</li>
          <li>trace_id/span_id devem ser injetados automaticamente via contexto OTel — não passados manualmente.</li>
          <li>ERROR = alguém precisa investigar agora. WARN = situação degradada mas recuperada. INFO = evento de negócio.</li>
          <li>Handler assíncrono + buffer é obrigatório em hot paths — logging síncrono adiciona latência de I/O ao caminho crítico.</li>
          <li>Nunca coloque PII (CPF, email, cartão) em logs sem masking — compliance é mais difícil de reverter que um bug.</li>
          <li>Em Loki/Elastic: labels têm baixa cardinalidade (service, env, level); campos JSON são filtragem sem índice.</li>
        </ul>
      </Callout>
    </div>
  );
}
