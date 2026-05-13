import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('idempotency-keys-e-webhooks');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é Idempotency-Key header (padrão Stripe)?',
    options: [
      'Uma chave de API secundária',
      'UUID que cliente passa em POST crítico; servidor cacheia response por 24h+ — se cliente retry com mesma chave, retorna mesma resposta em vez de duplicar operação',
      'Substitui OAuth',
      'É hash da request',
    ],
    correct: 1,
    explanation: 'Cliente gera UUID antes do POST. Servidor verifica: já vi essa chave? Se sim, retorna cached response. Se não, processa e salva (response, statusCode, etc). Cliente pode retry à vontade — duplicate charge/order/email impossível. É o padrão-ouro pra operações críticas.',
  },
  {
    question: 'Por que webhooks precisam de HMAC signature?',
    options: [
      'Para comprimir',
      'Pra provar que foi seu servidor quem enviou (não um atacante que descobriu a URL) — receiver verifica HMAC com shared secret',
      'Só em HTTPS',
      'Substitui TLS',
    ],
    correct: 1,
    explanation: 'Webhook URL é pública (receiver tem que aceitar HTTP externo). Sem assinatura, qualquer um manda request falsa. Sender assina body + timestamp com HMAC-SHA256 + secret. Receiver recalcula e compara. Timestamp + janela (ex: ±5min) previne replay.',
  },
  {
    question: 'O que é DLQ (Dead Letter Queue) em webhooks?',
    options: [
      'Fila premium',
      'Fila onde vão mensagens que falharam N tentativas — permite revisar sem bloquear processamento novo',
      'Só no AWS',
      'Fila FIFO',
    ],
    correct: 1,
    explanation: 'Se webhook receiver falha (HTTP 500, timeout), você retry exponencial. Depois de N tentativas (ex: 10 ao longo de 3 dias), mensagem vai pra DLQ — não bloqueia novas entregas. Ops investiga e reprocessa manualmente. Sem DLQ, retry infinito entope worker.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="idempotency-keys-e-webhooks"
      title="Idempotency keys e webhooks: exactly-once na prática"
      icon="🔁"
      xp={55}
      readTime={12}
      trailName="API Design & Contratos"
      trailColor={accent}
      nextSlug="rate-limiting-e-quotas-em-api"
      nextTitle="Rate limiting e quotas: token bucket, leaky bucket e fairness"
      quiz={quiz}
    >
      <Section title="O problema: retry seguro em POST" accent={accent}>
        <p>
          POST de pagamento falhou: timeout no cliente. O servidor processou? Não dá pra saber. Se retry, risco de cobrança dupla. Sem retry, cliente perde. Idempotency-Key resolve.
        </p>
      </Section>

      <Section title="Implementação de Idempotency-Key" accent={accent}>
        <CodeBlock lang="typescript">{`// Cliente gera UUID antes do POST
const key = crypto.randomUUID();

await fetch('/charges', {
  method: 'POST',
  headers: {
    'Idempotency-Key': key,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ amount: 1000 }),
});

// Retry com MESMA chave — seguro`}</CodeBlock>
        <CodeBlock lang="typescript">{`// Server pseudocódigo
async function handleCharge(req) {
  const key = req.headers['idempotency-key'];
  if (!key) return 400;

  const cached = await redis.get(\`idem:\${key}\`);
  if (cached) {
    const { status, body } = JSON.parse(cached);
    return new Response(body, { status, headers: { 'Idempotent-Replay': 'true' } });
  }

  // Processar — dentro de transação
  const charge = await db.$transaction(async (tx) => {
    await tx.charge.create({ data: req.body });
    await tx.idempotencyKey.create({ data: { key, request: req.body } });
  });
  const response = { status: 201, detail: charge };
  await redis.set(\`idem:\${key}\`, JSON.stringify(response), 'EX', 86400 * 2);
  return new Response(JSON.stringify(charge), { status: 201 });
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Stripe recomenda TTL de 24h. Uber usa 7 dias. Escolha baseado no pior caso de retry que seu cliente pode fazer (ex: replay de job em cron de outro data center).
        </Callout>
      </Section>

      <Section title="Webhooks: design" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Payload mínimo</strong>: envie só <InlineCode>{'{ event, id, timestamp }'}</InlineCode>. Cliente faz GET pra buscar detalhes. Reduz risco de vazamento em logs.</li>
          <li><strong>Assinatura HMAC</strong>: header <InlineCode>X-Signature: sha256=...</InlineCode> com HMAC do body + timestamp.</li>
          <li><strong>Timestamp anti-replay</strong>: rejeite events com <InlineCode>timestamp</InlineCode> fora de ±5min.</li>
          <li><strong>Retry exponencial</strong>: tentar em 0, 1min, 5min, 30min, 2h, 6h, 24h. Depois DLQ.</li>
          <li><strong>Receiver idempotente</strong>: mesmo event.id processado 2x deve ter o mesmo efeito que 1x. Store event_id em Redis por 48h.</li>
        </ul>
      </Section>

      <Section title="Receiver em TS" accent={accent}>
        <CodeBlock lang="typescript">{`import crypto from 'node:crypto';

export async function webhookHandler(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get('X-Signature')?.replace('sha256=', '');
  const timestamp = req.headers.get('X-Timestamp');
  if (!sig || !timestamp) return new Response('missing', { status: 400 });

  // Anti-replay: rejeita se > 5min
  if (Math.abs(Date.now() - Number(timestamp)) > 5 * 60_000) {
    return new Response('stale', { status: 400 });
  }

  // Verifica HMAC
  const expected = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET!)
    .update(timestamp + rawBody)
    .digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return new Response('invalid sig', { status: 401 });
  }

  const event = JSON.parse(rawBody);

  // Dedupe
  const dup = await redis.set(\`event:\${event.id}\`, '1', 'NX', 'EX', 172800);
  if (!dup) return new Response('already processed', { status: 200 });

  // Processa
  await processEvent(event);
  return new Response('ok', { status: 200 });
}`}</CodeBlock>
      </Section>
    </ModuleLayout>
  );
}
