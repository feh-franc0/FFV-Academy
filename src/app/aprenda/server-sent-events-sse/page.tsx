import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('server-sent-events-sse');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando SSE é estritamente melhor que WebSocket?',
    options: [
      'Nunca',
      'Quando o tráfego é one-way server→client (notifications, token streaming de LLM, feeds), pois SSE é HTTP/1.1 ou HTTP/2 puro: atravessa proxies corporativos sem Upgrade, reconexão é nativa no browser via EventSource com Last-Event-ID, e funciona em CDN/edge (Cloudflare Workers, Vercel Edge) sem complicação de upgrade',
      'Em qualquer caso',
      'Só com HTTPS',
    ],
    correct: 1,
    explanation: 'SSE brilha em padrão pub: notificações, token streaming (exatamente o que ChatGPT/Claude UI usam), price tickers. Vantagens: HTTP puro, reconexão automática com Last-Event-ID, funciona em edge. Limitação: uni-direcional; cliente volta a falar por HTTP normal. Se há bidirecionalidade intensa, WS vence.',
  },
  {
    question: 'Qual é o formato correto de um event stream?',
    options: [
      'JSON bruto em loop',
      'text/event-stream, com campos opcionais data:, event:, id:, retry:, cada evento separado por linha em branco. Server envia Content-Type: text/event-stream, desliga buffering, e o browser EventSource consome linha a linha',
      'XML',
      'Protobuf',
    ],
    correct: 1,
    explanation: 'Formato RFC: linhas "data: ...", opcionalmente "event: tipo", "id: N", "retry: ms". Evento termina em linha vazia. Header essencial: Content-Type: text/event-stream, Cache-Control: no-cache, e desligar buffer do proxy (X-Accel-Buffering: no no nginx, flushHeaders no Node).',
  },
  {
    question: 'Para que serve o header Last-Event-ID enviado pelo browser no reconnect?',
    options: [
      'Auth',
      'O browser guarda o último id: recebido e reenvia em Last-Event-ID na reconexão automática. O server usa esse id para resumir o stream do ponto certo (ex: offset Kafka, timestamp), permitindo reconexão sem perda quando a conexão cai',
      'Compression',
      'Nada, é decoração',
    ],
    correct: 1,
    explanation: 'Mecanismo de resume nativo do SSE: cada evento com "id: X" é memorizado pelo browser; no reconnect, o header Last-Event-ID: X chega ao server, que replica/seeka seu storage para retomar dali. É o que diferencia SSE de "long polling enganado".',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="server-sent-events-sse"
      title="Server-Sent Events (SSE)"
      icon="📡"
      xp={45}
      readTime={10}
      trailName="Real-time Systems"
      trailColor={accent}
      nextSlug="webrtc-basico"
      nextTitle="WebRTC: voice, video, data channels"
      quiz={quiz}
    >
      <Section title="SSE em uma frase" accent={accent}>
        <p>
          Um endpoint HTTP que nunca fecha a resposta e vai escrevendo eventos. Cliente usa EventSource do browser, que lida com reconexão automática, Last-Event-ID e parsing do formato. HTTP/1.1 (ou /2) puro, atravessa CDN e proxy sem Upgrade.
        </p>
      </Section>

      <Section title="Server Node mínimo (Express-ish)" accent={accent}>
        <CodeBlock lang="ts">{`import type { Request, Response } from 'express';

export function handleStream(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // nginx
  res.flushHeaders();

  const since = Number(req.header('Last-Event-ID') ?? 0);
  const iter = subscribe(since); // replay + live

  const keepAlive = setInterval(() =&gt; res.write(': ping\\n\\n'), 15000);

  (async () =&gt; {
    for await (const ev of iter) {
      res.write(\`id: \${ev.id}\\n\`);
      res.write(\`event: \${ev.type}\\n\`);
      res.write(\`data: \${JSON.stringify(ev.payload)}\\n\\n\`);
    }
  })().catch(() =&gt; res.end());

  req.on('close', () =&gt; { clearInterval(keepAlive); iter.return?.(); });
}`}</CodeBlock>
        <Callout tone="info">
          O comentário ": ping" a cada 15s mantém a conexão viva atravessando proxies com idle timeout curto. Não é parseado pelo browser como evento.
        </Callout>
      </Section>

      <Section title="Client EventSource" accent={accent}>
        <CodeBlock lang="ts">{`const es = new EventSource('/api/stream');

es.addEventListener('order.created', (ev) =&gt; {
  const data = JSON.parse((ev as MessageEvent).data);
  console.log('novo pedido', data.orderId);
});

es.addEventListener('error', () =&gt; {
  // browser reconecta sozinho com Last-Event-ID
  console.warn('sse reconnecting...');
});`}</CodeBlock>
        <Callout tone="warn">
          EventSource do browser não aceita headers custom nem body POST. Se precisa de auth, use cookie HttpOnly ou fetch+ReadableStream manual (com reconnection manual).
        </Callout>
      </Section>

      <Section title="SSE para streaming de tokens de LLM" accent={accent}>
        <p>
          Provider típico de LLM (Anthropic, OpenAI) entrega stream em text/event-stream. Seu backend pode simplesmente pipe para o browser, sem WebSocket.
        </p>
        <CodeBlock lang="ts">{`app.post('/api/chat', async (req, res) =&gt; {
  res.setHeader('Content-Type', 'text/event-stream');
  res.flushHeaders();

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.KEY! },
    body: JSON.stringify({ model: 'claude', stream: true, messages: req.body.messages }),
  });

  const reader = upstream.body!.getReader();
  const dec = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    res.write(dec.decode(value));
  }
  res.end();
});`}</CodeBlock>
      </Section>

      <Section title="SSE em edge: Cloudflare Workers, Vercel Edge" accent={accent}>
        <CodeBlock lang="ts">{`// Cloudflare Worker
export default {
  async fetch(req: Request) {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const enc = new TextEncoder();
    (async () =&gt; {
      for (let i = 0; i &lt; 100; i++) {
        await writer.write(enc.encode(\`id: \${i}\\ndata: tick \${i}\\n\\n\`));
        await new Promise(r =&gt; setTimeout(r, 1000));
      }
      await writer.close();
    })();
    return new Response(readable, {
      headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' },
    });
  },
};`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Para notificações, feeds, token streaming: comece com SSE. Mais simples, escala em edge, reconnect nativo. Só vá para WS quando bidirecionalidade real aparecer.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
