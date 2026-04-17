import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'LLM APIs em Produção: streaming, structured output, batch e cache — FFV Academy',
  description:
    'Padrões profissionais para LLM APIs: streaming SSE, tool use, structured output com JSON schema/Zod, batch API (50% off), prompt caching, retry com jitter, rate limit handling.',
};

const ACCENT = '#ff7eb6';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando streaming (SSE) vale a pena habilitar?',
    options: [
      'Sempre',
      'Em qualquer UI onde usuário aguarda resposta, para reduzir percepção de latência. O primeiro token chega em 100-500ms; o resto "pinga" conforme gerado. Em backend-to-backend (batch, jobs), streaming não ajuda — só adiciona complexidade de parse de eventos',
      'Só em mobile',
      'Nunca em produção',
    ],
    correct: 1,
    explanation:
      'Time to First Token (TTFT) cai 5-10× com streaming na percepção do usuário. Chat UI sem streaming parece travado. Batch jobs ou integrações server-to-server onde você só usa a resposta final não ganham nada — processe a resposta completa para simplificar parse e retry.',
  },
  {
    question: 'Por que structured output com JSON schema venceu "prompt me peça JSON"?',
    options: [
      'É só mais moderno',
      'Porque providers (OpenAI, Anthropic, Google) decodam respeitando o schema no nível do sampler — não só pedem "por favor, JSON". Garantia de validade sintática, tipos corretos, enums respeitados. Sem isso, 1-5% das respostas quebram parser e você precisa de retry + prompt reinforcement',
      'Por conta de preço',
      'Porque só funciona em inglês',
    ],
    correct: 1,
    explanation:
      'Antes: "Responda em JSON {...}" + prayer + regex de parse. Agora: passa schema (JSON Schema / Zod / Pydantic); provider força o output a cumprir. OpenAI Structured Outputs (2024), Anthropic tool_use, Google controlled generation. Útil em extração, function calling, pipelines ETL — qualquer lugar que JSON inválido custa dinheiro.',
  },
  {
    question: 'Quando usar Batch API (Anthropic/OpenAI)?',
    options: [
      'Em qualquer chamada',
      'Para jobs offline/async que não precisam de resposta imediata: avaliação, extração de lote, geração de dataset, re-embedding. Desconto típico: 50% do preço. Latência: até 24h (geralmente minutos). Não serve para UI/tempo-real',
      'Só Google oferece',
      'Em chamadas síncronas',
    ],
    correct: 1,
    explanation:
      'Batch API recebe JSONL com N requests, processa em fila de prioridade mais baixa, retorna JSONL com N responses. 50% off é significativo em jobs grandes (reembedding de 10M chunks, eval de golden set de 10k itens). Para qualquer rota de UI, use chamada normal — batch tem SLA longo.',
  },
  {
    question: 'Qual o padrão correto de retry em LLM API?',
    options: [
      'Retry imediato 3×',
      'Exponential backoff com jitter em erros 5xx, 429 (rate limit) e connect timeouts. Não retry em 4xx (exceto 429) — é erro do seu lado. Sempre respeite o header retry-after quando presente. Max retries: 3-5. Idempotency key em mutations para evitar dupla cobrança',
      'Nunca retry',
      'Retry sem limite',
    ],
    correct: 1,
    explanation:
      'Retry imediato agrava rate limit e thundering herd. Backoff (1s, 2s, 4s) + jitter (±25%) distribui tentativas. Em 429, provider diz "retry-after"; respeite. 400, 401, 403 não se resolvem com retry. Idempotency key em endpoints que podem criar estado (pagamento, thread) evita duplicação em retry depois de resposta perdida.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="llm-apis-producao"
      title="LLM APIs em Produção: streaming, structured output, batch e cache"
      icon="🚀"
      xp={80}
      readTime={16}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="llmops-drift-canary"
      nextTitle="LLMOps: eval harness, drift detection e canary de prompts"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Chamar <InlineCode>client.messages.create()</InlineCode> no notebook é fácil. Fazer isso em produção com
        100k req/dia, SLOs de latência, custo sob controle e sem romper o banco em deploy ruim — é outra história.
        Este módulo cobre os padrões que separam protótipo de sistema: streaming, structured output, batch API,
        prompt caching, retry, rate limit e idempotência.
      </p>

      <Section title="Streaming SSE: reduzir percepção de latência" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Server-Sent Events (SSE) é um fluxo HTTP unidirecional onde o servidor manda <InlineCode>data:</InlineCode>{' '}
          eventos conforme tokens chegam. Em chat UI, o usuário vê a resposta sendo digitada — percepção de
          latência despenca.
        </p>
        <CodeBlock lang="python">{`# Streaming com Anthropic SDK
from anthropic import Anthropic
client = Anthropic()

with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Explique quantum tunneling."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
    final = stream.get_final_message()

# Passando adiante em FastAPI/Hono como SSE para o browser
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.post("/chat")
async def chat(body: dict):
    async def gen():
        async with client.messages.stream(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=body["messages"],
        ) as stream:
            async for text in stream.text_stream:
                yield f"data: {json.dumps({'delta': text})}\\n\\n"
            yield "data: [DONE]\\n\\n"
    return StreamingResponse(gen(), media_type="text/event-stream")`}</CodeBlock>
        <Callout tone="warn">
          Streaming complica retry: você já entregou parte da resposta quando o stream quebra. Estratégia comum é
          abortar e reiniciar no cliente (mostrar "tentando novamente"), ou persistir o request_id e reenviar do
          zero em 5xx no primeiro chunk. Em meio de stream, raramente vale retry.
        </Callout>
      </Section>

      <Section title="Structured output: JSON schema no sampler" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em vez de pedir JSON por prompt e torcer, passe o schema para o provider. O decoder aplica gramática
          (constrained sampling) — a saída é garantidamente válida. Fim do parse com try/except.
        </p>
        <CodeBlock lang="python">{`# OpenAI Structured Outputs com Pydantic
from openai import OpenAI
from pydantic import BaseModel
from typing import Literal

client = OpenAI()

class Extract(BaseModel):
    customer_name: str
    sentiment: Literal["positive", "neutral", "negative"]
    urgency: int   # 1-5
    categories: list[str]

resp = client.responses.parse(
    model="gpt-5",
    input=[
        {"role": "system", "content": "Extraia dados estruturados do ticket."},
        {"role": "user",   "content": ticket_text},
    ],
    text_format=Extract,
)
extracted: Extract = resp.output_parsed     # tipado, válido

# Anthropic: usar tool_use como mecanismo (pattern comum)
schema = {
    "name": "extract_ticket",
    "description": "Extrai dados estruturados do ticket.",
    "input_schema": Extract.model_json_schema(),
}
r = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=500,
    tools=[schema],
    tool_choice={"type": "tool", "name": "extract_ticket"},   # força uso
    messages=[{"role": "user", "content": ticket_text}],
)
parsed = next(b for b in r.content if b.type == "tool_use").input`}</CodeBlock>
        <DecisionBox
          scenario="Extrair dados estruturados de texto em pipeline ETL"
          winner="Structured output com schema (tool_use ou responses.parse)"
          winnerColor={ACCENT}
          why="Garantia de validade elimina camada de retry/parse defensivo. Código downstream assume tipos corretos. Reduz bugs invisíveis em dados."
          alternatives={[
            { name: 'JSON in prompt + try/except', note: 'funciona mas 1-5% quebra; custo de debug acumula' },
            { name: 'Function calling "livre"', note: 'ok se a API aceita mas structured output é mais direto' },
          ]}
        />
      </Section>

      <Section title="Batch API: 50% off em jobs offline" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Anthropic, OpenAI e Google têm Batch API: você envia JSONL com N requests, recebe JSONL com N responses em
          até 24h (tipicamente minutos). Preço de input/output: 50% do normal.
        </p>
        <CodeBlock lang="python">{`# Anthropic Batch API (Message Batches)
from anthropic import Anthropic
client = Anthropic()

batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": f"item-{i}",
            "params": {
                "model": "claude-sonnet-4-6",
                "max_tokens": 512,
                "messages": [{"role": "user", "content": prompt}],
            },
        }
        for i, prompt in enumerate(prompts)      # pode ter 10k+ itens
    ],
)

# Poll até terminar
import time
while True:
    status = client.messages.batches.retrieve(batch.id)
    if status.processing_status in ("ended", "failed", "canceled"):
        break
    time.sleep(30)

# Ler resultados (JSONL streamed)
for line in client.messages.batches.results(batch.id):
    if line.result.type == "succeeded":
        save_result(line.custom_id, line.result.message)`}</CodeBlock>
        <ComparisonTable
          accent={ACCENT}
          headers={['Caso', 'Batch', 'Synchronous']}
          rows={[
            ['Eval harness (golden set de 1k)', '✓ — desconto compensa', 'ok para dev'],
            ['Reembedding de 10M chunks', '✓ — economia enorme', '× custo x2'],
            ['Enriquecimento noturno de dados', '✓', '×'],
            ['Resposta em UI', '×', '✓ (streaming)'],
            ['Pipeline event-driven em tempo real', '×', '✓'],
            ['Score de risco por request', '×', '✓'],
          ]}
        />
      </Section>

      <Section title="Prompt caching em APIs (revisão rápida)" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Coberto em detalhe no módulo de context engineering. O resumo operacional para APIs:
        </p>
        <ul className="flex flex-col gap-1 pl-5 list-disc" style={{ color: 'var(--ffv-muted)' }}>
          <li><strong>Anthropic:</strong> marque blocos com <InlineCode>cache_control: {"{"}type:"ephemeral"{"}"}</InlineCode>; write 125% / read 10%.</li>
          <li><strong>OpenAI:</strong> automático para prefixos repetidos ≥1024 tokens; read ~50%.</li>
          <li><strong>Google Gemini:</strong> cachedContent API explícita; read ~25% + taxa de storage.</li>
          <li>TTL típico: ~5min. Volume baixo + janelas esparsas perdem o benefício.</li>
        </ul>
      </Section>

      <Section title="Retry, backoff e jitter" accent={ACCENT}>
        <CodeBlock lang="python">{`# Retry robusto com tenacity
from tenacity import retry, stop_after_attempt, wait_exponential_jitter, retry_if_exception_type
from anthropic import APIStatusError, APITimeoutError, RateLimitError

@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential_jitter(initial=1, max=30, jitter=2),
    retry=retry_if_exception_type((APITimeoutError, RateLimitError, APIStatusError)),
    reraise=True,
)
def llm_call(messages, **kwargs):
    try:
        return client.messages.create(messages=messages, **kwargs)
    except APIStatusError as e:
        # Retry só em 5xx e 429; 4xx persistente não resolve
        if e.status_code < 500 and e.status_code != 429:
            raise StopRetry() from e
        raise`}</CodeBlock>
        <ComparisonTable
          accent={ACCENT}
          headers={['Status', 'Retry?', 'Por que']}
          rows={[
            ['408 Request Timeout', 'Sim, backoff', 'Servidor estourou tempo — pode passar em nova tentativa'],
            ['429 Too Many Requests', 'Sim, respeitar retry-after', 'Rate limit ou quota'],
            ['500 Internal Server Error', 'Sim, backoff', 'Erro transiente do provider'],
            ['502/503/504 Gateway', 'Sim, backoff', 'Upstream transiente'],
            ['400 Bad Request', 'Não', 'Seu request está inválido — retry não corrige'],
            ['401 Unauthorized', 'Não', 'Token inválido/expirado — gere novo fora do retry'],
            ['403 Forbidden', 'Não', 'Permission; abra ticket'],
            ['404 Not Found', 'Não', 'Recurso inexistente'],
            ['Connect timeout', 'Sim, backoff', 'Rede — pode passar'],
          ]}
        />
      </Section>

      <Section title="Rate limits e backpressure" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Providers têm limits por minuto (RPM) e por tokens/min (TPM). Ultrapassar → 429. Em volume, você precisa
          de um gateway/cliente que:
        </p>
        <ul className="flex flex-col gap-1 pl-5 list-disc" style={{ color: 'var(--ffv-muted)' }}>
          <li>Estime tokens antes de enviar (tiktoken, @anthropic-ai/tokenizer).</li>
          <li>Use <strong>token bucket</strong> local para não estourar RPM/TPM.</li>
          <li>Aplique <strong>backpressure</strong>: quando cheio, responda 429 ou enfileire com queue (SQS, Redis).</li>
          <li>Priorize queries críticas (UI) sobre jobs (batch/analytics) — separe por API key se possível.</li>
        </ul>
        <CodeBlock lang="typescript">{`// Token bucket simples (RPM=60) para não bater 429 no provider
class TokenBucket {
  private tokens: number;
  private last: number;
  constructor(private rate: number, private capacity: number) {
    this.tokens = capacity;
    this.last = Date.now();
  }
  async acquire(n = 1): Promise<void> {
    while (true) {
      this.refill();
      if (this.tokens >= n) { this.tokens -= n; return; }
      const need = (n - this.tokens) / this.rate;
      await new Promise(r => setTimeout(r, need * 1000));
    }
  }
  private refill() {
    const now = Date.now();
    const add = ((now - this.last) / 1000) * this.rate;
    this.tokens = Math.min(this.capacity, this.tokens + add);
    this.last = now;
  }
}

const bucket = new TokenBucket(60 / 60, 60);  // 60 RPM
await bucket.acquire();
const r = await client.messages.create(...);`}</CodeBlock>
      </Section>

      <Section title="Idempotência e deduplicação" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Retry depois de resposta perdida é comum (proxy errou, timeout na última milha). Sem idempotency key, você
          cobra duas vezes o cliente. LLM APIs usam <InlineCode>anthropic-idempotency-key</InlineCode> (Anthropic),{' '}
          <InlineCode>idempotency-key</InlineCode> (OpenAI) — UUID v4 por request lógico, reutilizado em retries.
        </p>
        <CodeBlock lang="python">{`import uuid
from anthropic import Anthropic
client = Anthropic()

def generate_for_request(request_id: str, prompt: str):
    # idempotency_key estável → provider dedupe no seu lado
    r = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
        extra_headers={"anthropic-idempotency-key": request_id},
    )
    return r

# Em jobs async: persista (request_id, response) no seu lado.
# Antes de chamar LLM, consulte cache; só chama se não tiver.`}</CodeBlock>
      </Section>

      <Section title="Observability mínima para LLM API" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Métrica', 'Por que logar', 'Onde']}
          rows={[
            ['input_tokens / output_tokens', 'Custo e anomalias de tamanho', 'Por request, agregado por endpoint'],
            ['model', 'Drift de versão silencioso', 'Alert se mudar sem release'],
            ['ttft (time to first token)', 'UX streaming', 'Em UI, p50/p95'],
            ['latency_total', 'SLO', 'p50/p95/p99 por endpoint'],
            ['stop_reason', 'Detectar truncation (max_tokens)', 'Alert se taxa &gt; 5%'],
            ['cache_read / cache_write', 'Efetividade do prompt caching', 'Calcular hit ratio'],
            ['finish_reason = "content_filter"', 'Violação de policy', 'Investigar casos'],
            ['retry_count', 'Saúde do provider', 'Alert se subir persistente'],
          ]}
        />
        <Callout tone="info">
          Ferramentas prontas: Langfuse, LangSmith, Phoenix (Arize), Helicone. Todas instrumentam LLM calls com tags,
          traces e dashboards. Se preferir rolar no OpenTelemetry, use as semantic conventions para
          <InlineCode>gen_ai.*</InlineCode> — padronização recente (2025).
        </Callout>
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Como escolher entre streaming e non-streaming em um endpoint?"
          a={<>Pela UX e pelo consumo. Chat UI, assistente, geração longa → streaming (melhor TTFT). Extração estruturada, classificação curta, job async → non-streaming (simplifica parse e retry). Regra: se usuário está olhando, streaming; se é pipeline, não.</>}
        />
        <QAItem
          q="Posso misturar providers no mesmo app?"
          a={<>Pode e é recomendado para resiliência. Padrão: abstrair atrás de uma interface ("generate(messages)") e fallback entre Anthropic/OpenAI/Google. Cuidado com diferenças de tool schema e prompt caching — cada provider tem particularidades. LiteLLM, OpenRouter, Portkey são gateways que ajudam.</>}
        />
        <QAItem
          q="Preciso mesmo de structured output, ou JSON mode basta?"
          a={<>Structured output com schema é mais forte que JSON mode. JSON mode garante JSON válido, mas não garante o schema (campos, tipos). Structured output força ambos. Para extração séria, sempre vá no schema explícito.</>}
        />
        <QAItem
          q="Batch API é sempre mais barato?"
          a={<>É ~50% off, mas SLA é até 24h. Se seu job pode aceitar delay, sempre use. Se precisar em minutos consistentes (ex: onboarding de clientes), synchronous com rate-limit controlado pode ser o certo. Não misture — job crítico em batch vira incident quando demora mais que o esperado.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Streaming reduz percepção de latência em UIs. Structured output com schema
        elimina retry de parse. Batch API dá 50% off em jobs offline. Prompt caching corta custo em agents
        repetitivos. Retry: exponential backoff + jitter, respeite retry-after, não retry em 4xx. Rate limit é seu
        problema — token bucket no cliente evita 429. Idempotency key é obrigatório em endpoints que criam estado.
        Observability (tokens, latência, stop_reason, cache ratio) é a base. Próximo: LLMOps — como operar tudo
        isso em produção com eval, drift, canary.
      </Callout>
    </div>
  );
}
