import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  NodeGraph,
  FlowDiagram,
  StackFlow,
  InlineCode,
} from '@/components/article/primitives';

const ACCENT = '#f78166';

export const metadata = getModuleMetadata('idempotencia-retries');

const quiz = [
  {
    question:
      'Uma operação é idempotente quando:',
    options: [
      'Retorna sempre o mesmo valor, independente de input',
      'Aplicar a operação N vezes (N≥1) produz o mesmo estado final que aplicá-la 1 vez',
      'Executa em uma única transação atômica',
      'Garante entrega exatamente uma vez (exactly-once)',
    ],
    correct: 1,
    explanation:
      'Idempotência: f(f(x)) = f(x). O resultado final após aplicar a operação 1 ou N vezes é idêntico. GET, PUT e DELETE são tipicamente idempotentes; POST não é, por isso POST precisa de idempotency keys pra poder ser retried com segurança.',
  },
  {
    question:
      'Por que retries sem jitter podem matar um serviço que está se recuperando?',
    options: [
      'Porque consomem memória do cliente',
      'Porque causam thundering herd — milhares de clientes retriando em sincronia, amplificando a carga',
      'Porque quebram a ordenação FIFO das requisições',
      'Porque aumentam o p50 de latência',
    ],
    correct: 1,
    explanation:
      'Sem jitter, retries exponenciais sincronizados criam "thundering herd": todos os clientes chegam na mesma fatia de tempo (ex: 2s, 4s, 8s após o erro). Com jitter (aleatorização), os retries se espalham — a AWS publicou estudo seminal "Exponential Backoff And Jitter" mostrando que full jitter é quase sempre superior.',
  },
  {
    question:
      'Qual abaixo NÃO é uma garantia de entrega possível em sistema distribuído?',
    options: [
      'At-most-once (pode perder, nunca duplica)',
      'At-least-once (nunca perde, pode duplicar)',
      'Exactly-once end-to-end verdadeiro (sem nenhuma idempotência do consumidor)',
      'Effectively-once (at-least-once + idempotência do consumidor)',
    ],
    correct: 2,
    explanation:
      'Exactly-once end-to-end puro é teoricamente impossível num sistema com falhas de rede — você nunca sabe se a confirmação do consumidor foi perdida. O que é prático é "effectively-once": broker entrega at-least-once, consumidor é idempotente (via idempotency key + dedup). Kafka EOS, Pulsar EOS e SQS FIFO fazem isso dentro de fronteiras específicas.',
  },
  {
    question:
      'Um circuit breaker abre (bloqueia chamadas) quando:',
    options: [
      'O usuário clica em "cancelar"',
      'Taxa de erro ou latência passa de um threshold por uma janela de tempo',
      'A aplicação é reiniciada',
      'Um deploy novo é detectado',
    ],
    correct: 1,
    explanation:
      'Circuit breaker (padrão de Hystrix/Resilience4j) monitora taxa de erro ou latência p99 numa janela deslizante. Se passa do threshold, ele "abre" e rejeita chamadas imediatamente por um período, depois entra em "half-open" pra testar recuperação. Evita que a aplicação afogue tentando chamar um serviço morto.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="idempotencia-retries"
      title="Idempotência e Retries: o antídoto pra rede que quebra"
      icon="🔁"
      xp={75}
      readTime={15}
      trailName="Sistemas Distribuídos"
      trailColor={ACCENT}
      nextSlug="sagas-2pc"
      nextTitle="Sagas vs 2PC: transações distribuídas sem perder o sono"
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
        Todas as redes mentem. Pacotes se perdem. Timeouts disparam antes da resposta chegar.
        Servidores crasham <em>entre</em> processar a requisição e mandar o ACK. O cliente não tem
        como saber se a operação aconteceu — então ele <strong>retria</strong>. Se a operação não é
        idempotente, você acaba de debitar o cartão duas vezes. Se ela é, tudo bem. Este módulo
        é sobre as ferramentas que separam aplicações amadoras de sistemas que sobrevivem a AWS
        caindo no meio da noite.
      </p>
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Vamos cobrir: o que é idempotência formalmente, como implementar <strong>idempotency keys</strong> do
        jeito que a Stripe faz, <strong>backoff exponencial com jitter</strong> (e por que jitter não é opcional),
        <strong> circuit breakers</strong> pra não afogar serviços recuperando, e as garantias reais
        de entrega em brokers como Kafka, SQS e RabbitMQ.
      </p>

      <Section title="O que é idempotência (e quais operações já são)" accent={ACCENT}>
        <p>
          Formalmente: uma função <InlineCode>f</InlineCode> é idempotente se
          <InlineCode> f(f(x)) = f(x)</InlineCode>. Aplicada em sistemas distribuídos: chamar a
          operação 1 vez ou 50 vezes deixa o sistema no mesmo estado final.
        </p>
        <ComparisonTable
          headers={['Operação', 'Idempotente?', 'Exemplo']}
          rows={[
            ['GET', 'Sim (sem side effects)', 'GET /users/42'],
            ['PUT', 'Sim (substitui por completo)', 'PUT /users/42 {"name":"Ana"}'],
            ['DELETE', 'Sim (se já apagado, continua apagado)', 'DELETE /users/42'],
            ['POST (sem idempotency key)', 'Não', 'POST /payments → cria novo pagamento cada chamada'],
            ['POST (com idempotency key)', 'Sim (com key + dedup server-side)', 'POST /payments com Idempotency-Key: uuid'],
            ['Incremento: counter += 1', 'Não', 'Repetir → incrementa de novo'],
            ['Set absoluto: counter = 42', 'Sim', 'Qualquer número de repetições → 42'],
            ['Compare-and-swap (CAS)', 'Sim (primeira aplica, demais falham sem erro)', 'UPDATE ... WHERE version=X'],
          ]}
        />
        <Callout tone="warn">
          <strong>Pegadinha clássica</strong>: "enviar email de boas-vindas" não é idempotente.
          Se você retria após crash, manda o email duas vezes. Solução: wrap em idempotency key
          (ex: <InlineCode>send_email(user_id, template=&apos;welcome&apos;)</InlineCode> grava em
          tabela <InlineCode>sent_emails (user_id, template) UNIQUE</InlineCode> antes de enviar).
        </Callout>
      </Section>

      <Section title="Idempotency Keys: a pedra fundamental" accent={ACCENT}>
        <p>
          O padrão canônico, popularizado pela Stripe (2015): o cliente gera um UUID por <em>intenção</em> de operação
          e passa no header <InlineCode>Idempotency-Key: &lt;uuid&gt;</InlineCode>. O servidor:
        </p>
        <ol className="list-decimal space-y-2 pl-6">
          <li>Busca a key em storage (Redis, Postgres)</li>
          <li>Se existe: retorna a resposta <em>armazenada</em> — mesma exata que foi enviada antes</li>
          <li>Se não existe: executa a operação, <strong>grava a resposta</strong> com a key, retorna</li>
        </ol>

        <NodeGraph
          accent={ACCENT}
          columns={[
            {
              label: 'Cliente',
              nodes: [
                { label: 'POST /payments', sub: 'Idempotency-Key: abc123' },
                { label: '201 Created', sub: 'resposta recebida' },
                { label: 'POST /payments (retry)', sub: 'mesma Key: abc123' },
                { label: '201 Created (mesma!)', sub: 'sem reprocessar' },
              ],
            },
            {
              label: 'Server',
              nodes: [
                { label: 'SELECT key', sub: 'not found → executa' },
                { label: 'BEGIN TX', sub: 'Insert payment + key → COMMIT' },
                { label: 'SELECT key', sub: 'found: 201 + body' },
              ],
            },
            {
              label: 'DB',
              nodes: [
                { label: 'payments', sub: 'INSERT' },
                { label: 'idempotency_keys', sub: 'INSERT (key, response_json)' },
                { label: 'idempotency_keys', sub: 'SELECT → retorna cached' },
              ],
            },
          ]}
        />

        <p><strong>Implementação Postgres + FastAPI</strong> (enxuta mas production-shaped):</p>
        <CodeBlock lang="python">{`# idempotency.py — pattern completo com locking e TTL
from fastapi import FastAPI, Header, HTTPException, Request
from sqlalchemy import text
import json, hashlib

app = FastAPI()

IDEMPOTENCY_TTL_HOURS = 24  # Stripe guarda 24h, ajuste por caso de uso

@app.post("/payments")
async def create_payment(
    request: Request,
    idempotency_key: str = Header(..., alias="Idempotency-Key"),
):
    body = await request.json()
    body_hash = hashlib.sha256(json.dumps(body, sort_keys=True).encode()).hexdigest()

    async with db.begin() as tx:
        # Lock da key — evita duas réplicas da API processarem o mesmo key em paralelo
        row = await tx.execute(
            text("""
                SELECT status_code, response_body, request_hash
                FROM idempotency_keys
                WHERE key = :k AND created_at > NOW() - INTERVAL '24 hours'
                FOR UPDATE
            """),
            {"k": idempotency_key},
        )
        existing = row.fetchone()

        if existing:
            # Proteção: mesma key com body diferente = erro 422 (Stripe faz isso)
            if existing.request_hash != body_hash:
                raise HTTPException(422, "Idempotency-Key reuse with different payload")
            return {"status": existing.status_code, "body": existing.response_body}

        # Executa a lógica real do pagamento
        payment = await create_payment_logic(body)
        response = {"id": payment.id, "status": "created"}

        # Grava a resposta pra próxima chamada com a mesma key
        await tx.execute(
            text("""
                INSERT INTO idempotency_keys
                  (key, request_hash, status_code, response_body, created_at)
                VALUES (:k, :h, 201, :r, NOW())
            """),
            {"k": idempotency_key, "h": body_hash, "r": json.dumps(response)},
        )
        return response`}</CodeBlock>

        <Callout tone="danger">
          <strong>Armadilha #1: in-flight requests</strong>. Se dois retries chegam
          <em> ao mesmo tempo</em> em réplicas diferentes da API, sem <InlineCode>FOR UPDATE</InlineCode> os
          dois não acham a key existente e <em>ambos executam</em>. Sempre lock (row-level
          no Postgres ou SET NX no Redis com TTL). A Stripe usa locking explícito em todas
          as rotas idempotentes.
        </Callout>
        <Callout tone="warn">
          <strong>Armadilha #2: body diferente com mesma key</strong>. Um bug no cliente pode reusar a
          key com body alterado. Guarde o hash do body e rejeite divergências com 422. Evita
          cenários em que o cliente "acha" que fez uma coisa mas o servidor tem outra.
        </Callout>
      </Section>

      <Section title="Backoff exponencial com jitter (a AWS tem paper sobre isso)" accent={ACCENT}>
        <p>
          Quando um retry é necessário, <em>como</em> esperar importa muito. A evolução histórica:
        </p>
        <ComparisonTable
          headers={['Estratégia', 'Fórmula', 'Problema']}
          rows={[
            ['Retry imediato', 'sleep = 0', 'Thundering herd instantâneo — pior das opções.'],
            ['Retry fixo', 'sleep = 1s', 'Espalha mas não cede carga se o serviço está estressado.'],
            ['Backoff linear', 'sleep = n * 1s', 'Muito lento pra propagar; ainda sincroniza se N clientes erram juntos.'],
            ['Backoff exponencial', 'sleep = base * 2^n', 'Bom, mas todos retriam nos mesmos instantes (2s, 4s, 8s).'],
            ['Exp + full jitter (AWS)', 'sleep = random(0, base * 2^n)', 'Melhor: espalhado no tempo, decresce a carga exponencialmente.'],
            ['Exp + equal jitter', 'sleep = base*2^n/2 + random(0, base*2^n/2)', 'Full jitter com piso mínimo.'],
          ]}
        />
        <Callout tone="info">
          <strong>Paper seminal</strong>: <em>Exponential Backoff And Jitter</em> (AWS Architecture Blog, 2015).
          Conclusão experimental: <strong>full jitter</strong> (ou "decorrelated jitter") tem throughput
          efetivo superior em quase todos os cenários. Use.
        </Callout>

        <p><strong>Implementação Python com tenacity</strong>:</p>
        <CodeBlock lang="python">{`# retry_with_jitter.py
from tenacity import retry, stop_after_attempt, wait_random_exponential, retry_if_exception_type
import httpx

@retry(
    stop=stop_after_attempt(5),                       # até 5 tentativas
    wait=wait_random_exponential(                     # full jitter
        multiplier=1,                                 # base em segundos
        max=30,                                       # cap em 30s
    ),
    retry=retry_if_exception_type(httpx.TransportError),
    reraise=True,
)
async def call_payment_gateway(payload: dict):
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.post(
            "https://gateway.example.com/charge",
            json=payload,
            headers={"Idempotency-Key": payload["op_id"]},  # sempre junto!
        )
        resp.raise_for_status()
        return resp.json()`}</CodeBlock>

        <p><strong>Implementação TypeScript manual</strong> (quando não quer dep):</p>
        <CodeBlock lang="typescript">{`// backoff.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  opts: { maxAttempts?: number; baseMs?: number; capMs?: number } = {},
): Promise<T> {
  const { maxAttempts = 5, baseMs = 200, capMs = 30_000 } = opts;
  let lastErr: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err)) throw err;              // 4xx não-429: não retria
      if (attempt === maxAttempts - 1) break;

      const exp = Math.min(capMs, baseMs * 2 ** attempt);
      const jitter = Math.random() * exp;            // full jitter
      await new Promise((r) => setTimeout(r, jitter));
    }
  }
  throw lastErr;
}

function isRetryable(err: unknown): boolean {
  // network + 5xx + 429 = retriáveis. 4xx normais = não.
  if (err instanceof TypeError) return true;           // network
  const status = (err as { status?: number })?.status;
  return status === 429 || (!!status && status >= 500);
}`}</CodeBlock>

        <Callout tone="warn">
          <strong>Nem tudo deve ser retriado</strong>. Retries cegos em 4xx (400, 401, 422) só
          desperdiçam quota. Regra: retria em timeouts, erros de rede, 429 (respeitando
          Retry-After header) e 5xx. 4xx são <em>problema seu</em>, não do servidor.
        </Callout>
      </Section>

      <Section title="Circuit Breaker: quando parar de retriar" accent={ACCENT}>
        <p>
          Imagine que o pagamento gateway está 100% fora há 2 minutos. Sua API continua
          aceitando requests, cada uma esperando 5s de timeout + 5 retries com backoff = 30s.
          Threads começam a acumular, pool de conexão esgota, sua API morre <em>por tabela</em>.
          Circuit breaker quebra esse ciclo.
        </p>

        <FlowDiagram
          accent={ACCENT}
          orientation="horizontal"
          steps={[
            { label: 'CLOSED', desc: 'operação normal' },
            { label: 'OPEN', desc: 'rejeita tudo · aguarda timeout (60s)' },
            { label: 'HALF-OPEN', desc: 'deixa 1 request passar · se ok → CLOSED' },
          ]}
        />

        <p><strong>Implementação básica em Python</strong>:</p>
        <CodeBlock lang="python">{`# circuit_breaker.py — versão educativa
import time
from enum import Enum

class State(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreaker:
    def __init__(self, fail_threshold=5, reset_timeout_s=60):
        self.state = State.CLOSED
        self.fail_count = 0
        self.fail_threshold = fail_threshold
        self.reset_timeout_s = reset_timeout_s
        self.opened_at: float | None = None

    def call(self, fn, *args, **kwargs):
        if self.state == State.OPEN:
            if time.time() - self.opened_at > self.reset_timeout_s:
                self.state = State.HALF_OPEN   # deixa 1 tentativa passar
            else:
                raise CircuitOpenError("circuit is open")

        try:
            result = fn(*args, **kwargs)
        except Exception:
            self._on_failure()
            raise
        self._on_success()
        return result

    def _on_success(self):
        self.fail_count = 0
        self.state = State.CLOSED

    def _on_failure(self):
        self.fail_count += 1
        if self.fail_count >= self.fail_threshold:
            self.state = State.OPEN
            self.opened_at = time.time()

class CircuitOpenError(Exception): ...`}</CodeBlock>

        <p>
          Em produção use bibliotecas prontas: <InlineCode>resilience4j</InlineCode> (Java),
          <InlineCode> opossum</InlineCode> (Node), <InlineCode>pybreaker</InlineCode> ou <InlineCode>aiobreaker</InlineCode> (Python),
          service meshes (Istio, Linkerd) fazem no proxy. Features extras: sliding window de
          falhas (não só contador), bulkheads (isola chamadas por pool), fallback values.
        </p>
      </Section>

      <Section title="At-most-once, at-least-once, exactly-once" accent={ACCENT}>
        <p>
          As três garantias de entrega que todo engenheiro distribuído precisa saber de cor:
        </p>
        <ComparisonTable
          headers={['Garantia', 'Significado', 'Custo']}
          rows={[
            [
              'At-most-once',
              'Pode perder mensagens, nunca duplica',
              'Sem retries, fire-and-forget. UDP, metrics.',
            ],
            [
              'At-least-once',
              'Nunca perde, pode duplicar (retry + dedup do consumer)',
              'Broker guarda até ACK. SQS, RabbitMQ, Kafka (default).',
            ],
            [
              'Exactly-once (teórico)',
              'Nenhuma perda, nenhuma duplicação',
              'Impossível end-to-end em rede real (Two Generals Problem).',
            ],
            [
              'Effectively-once (prático)',
              'At-least-once + consumer idempotente → efeito = exactly-once',
              'Padrão em sistemas sérios. Kafka EOS, Pulsar EOS dentro do broker.',
            ],
          ]}
        />

        <Callout tone="info">
          <strong>Two Generals Problem</strong> (1975): dois exércitos precisam atacar juntos por
          mensageiros que podem ser capturados. Prova-se que <em>nenhum número finito de
          confirmações resolve a incerteza</em>. Tradução pra rede: você nunca sabe se a ACK
          final chegou. Por isso exactly-once puro é mito; effectively-once é a realidade.
        </Callout>

        <p><strong>Effectively-once na prática</strong>:</p>
        <CodeBlock lang="python">{`# consumer_dedup.py — at-least-once do broker + dedup local = effectively-once
async def process_message(msg: dict):
    msg_id = msg["id"]  # broker garante que este id é estável

    async with db.begin() as tx:
        # Tenta inserir — se duplicata, constraint falha e a gente ignora
        result = await tx.execute(
            text("""
                INSERT INTO processed_messages (id, processed_at)
                VALUES (:id, NOW())
                ON CONFLICT (id) DO NOTHING
            """),
            {"id": msg_id},
        )
        if result.rowcount == 0:
            log.info("duplicate message, skipping", msg_id=msg_id)
            return

        # Primeira vez vendo essa msg — processa na mesma transação
        await apply_side_effects(msg, tx)

    # Só ACK o broker depois do commit bem-sucedido
    await broker.ack(msg)`}</CodeBlock>
      </Section>

      <Section title="Outbox Pattern: publicar eventos sem perder ou duplicar" accent={ACCENT}>
        <p>
          Problema clássico: você quer <em>criar um pedido E publicar um evento "OrderCreated"</em>.
          Se faz em duas etapas (INSERT + publish), pode crashar no meio — DB tem o pedido,
          o evento nunca saiu (ou vice-versa).
        </p>
        <StackFlow
          accent={ACCENT}
          items={[
            { label: 'Transação ATÔMICA', sub: 'INSERT INTO orders + INSERT INTO outbox → COMMIT' },
            { label: 'Relay Worker', sub: 'SELECT * FROM outbox WHERE sent=false · polling ou CDC (Debezium)' },
            { label: 'Broker', sub: 'Kafka / SQS / RabbitMQ — publica evento' },
            { label: 'Marcar enviado', sub: 'UPDATE outbox SET sent=true' },
          ]}
        />
        <p>
          Por que funciona: a transação é atômica (ACID do banco garante). O relay é idempotente
          (se crashar entre publicar e marcar como sent, apenas republica — consumer fará dedup).
          Combinado com <InlineCode>ON CONFLICT DO NOTHING</InlineCode> no consumer = effectively-once
          end-to-end.
        </p>
      </Section>

      <Section title="Decisões reais" accent={ACCENT}>
        <DecisionBox
          scenario="API de pagamento que aceita POST — retry do cliente pode duplicar cobrança"
          winner="Idempotency-Key no header, validação com FOR UPDATE, TTL 24h"
          winnerColor={ACCENT}
          why="Esse é o padrão Stripe e é o esperado no mercado. SDKs (Stripe, Paddle) já geram a key automaticamente. Sem isso, toda integração que você fizer será arriscada, porque retries acontecem."
          alternatives={[
            { label: 'Nada (confiar no cliente)', note: 'Garante duplicidade em redes ruins.' },
            { label: 'Hash do payload como key', note: 'Funciona se o cliente não muda nada entre retries, mas frágil.' },
          ]}
        />
        <DecisionBox
          scenario="Microserviço chamando outro que está lento/instável"
          winner="Timeout agressivo + retry com jitter + circuit breaker"
          winnerColor={ACCENT}
          why="Timeout curto evita acumular threads. Retry com jitter lida com transients sem thundering herd. Circuit breaker protege seu serviço quando o upstream morre. As 3 camadas juntas. Service mesh (Istio, Linkerd) faz isso pra você, mas vale saber implementar."
          alternatives={[
            { label: 'Só retry', note: 'Funciona em 80% dos casos, morre no outro 20.' },
            { label: 'Só timeout', note: 'Não aproveita transients — usuário vê erro que teria resolvido em 200ms.' },
          ]}
        />
        <DecisionBox
          scenario={'Publicar evento "user.created" após INSERT no banco'}
          winner="Outbox pattern (transactional outbox)"
          winnerColor={ACCENT}
          why="Garante que evento e dado são atômicos — ou ambos aconteceram ou nenhum. Combine com Debezium/Kafka Connect pra CDC automático, ou um worker simples que faz polling. Alternativas como 'publish depois do commit' são loucamente quebradas quando o processo crasha no meio."
          alternatives={[
            { label: 'Publish antes do commit', note: 'Pode publicar e depois abortar a tx — evento fantasma.' },
            { label: 'Publish depois do commit', note: 'Pode crashar entre commit e publish — evento nunca sai.' },
            { label: 'CDC puro (Debezium)', note: 'Lê WAL do Postgres. Poderoso mas acopla ao schema da tabela.' },
          ]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <div className="flex flex-col gap-4">
          <div>
            <p><strong>Preciso de idempotency key em GET?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Não. GET não muda estado. Você pode chamar 1 ou 100 vezes e o sistema fica igual.
              Idempotency keys são para operações com side effects (POST, às vezes PATCH).
            </p>
          </div>
          <div>
            <p><strong>TTL da idempotency key — quanto tempo?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Depende do caso. Stripe usa 24h — tempo suficiente pra retries longos, curto pra
              não encher o DB. Pra filas batch que podem ficar presas dias, considere 7d.
              Nunca infinito, ou você paga armazenamento crescente.
            </p>
          </div>
          <div>
            <p><strong>Quando um retry é pior que desistir?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Em 4xx (exceto 429): o servidor tá te dizendo que a request é inválida, retry não
              resolve. Em operações não-idempotentes sem key: retry duplica. Em endpoint
              com lógica lenta que timed out no cliente mas ainda está rodando: retry empurra
              trabalho duplicado.
            </p>
          </div>
          <div>
            <p><strong>Kafka EOS (Exactly-Once Semantics) é exactly-once verdadeiro?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Dentro do Kafka, sim (produção idempotente + transações). Mas end-to-end, o consumer
              ainda precisa ser idempotente se escreve em sistemas externos (DBs, APIs). EOS do
              Kafka resolve <em>uma parte</em> da equação; o outro lado fica com você.
            </p>
          </div>
          <div>
            <p><strong>Circuit breaker fecha sozinho?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Sim — depois do reset_timeout ele vai pra HALF-OPEN, deixa 1 chamada passar. Se
              sucesso, fecha (CLOSED). Se falha, volta pra OPEN e reseta o relógio. Automático.
            </p>
          </div>
        </div>
      </Section>

      <Callout tone="success">
        <strong>Take-aways</strong>:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>Idempotência = f(f(x)) = f(x)</strong>. Design APIs PUT/DELETE idempotentes nativamente. POST exige idempotency key.</li>
          <li><strong>Idempotency-Key no header</strong> + lock + hash do body + TTL. O padrão Stripe é o padrão.</li>
          <li><strong>Backoff exponencial com full jitter</strong> — sem jitter, thundering herd mata o serviço recuperando.</li>
          <li>Retria só <strong>transients</strong>: timeouts, 429 (com Retry-After), 5xx. Nunca 4xx não-429.</li>
          <li><strong>Circuit breaker</strong> protege seu serviço quando o upstream morre. 3 estados: CLOSED, OPEN, HALF-OPEN.</li>
          <li>Exactly-once end-to-end é mito (Two Generals). O real é <strong>effectively-once</strong> = at-least-once + dedup.</li>
          <li><strong>Outbox pattern</strong> pra publicar eventos sem perder nem duplicar — atômico com o dado.</li>
        </ul>
      </Callout>

      <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
        Próximo módulo: quando você tem <em>várias operações</em> em serviços diferentes que
        precisam acontecer juntas — Sagas vs 2PC.
      </p>
    </div>
  );
}
