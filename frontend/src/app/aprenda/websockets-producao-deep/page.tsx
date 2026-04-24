import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('websockets-producao-deep');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que ping/pong de aplicação é necessário mesmo com ping/pong nativo do WS?',
    options: [
      'Nunca é necessário',
      'Porque intermediários (load balancer, proxy corporativo, CDN) podem timeoutar conexões idle sem liberar nem frame de close para o cliente. Ping nativo do RFC 6455 é opcional e nem todo proxy propaga. Ping de aplicação com timeout + reconexão é a única forma confiável de detectar "conexão zumbi"',
      'Só para economizar banda',
      'É decoração',
    ],
    correct: 1,
    explanation: 'LBs (AWS ALB 60s idle timeout default, nginx 60s) matam a TCP silenciosamente. WS ping frame do protocolo é mal implementado em muitos clients/proxies. O padrão em produção: heartbeat de aplicação (JSON {type:ping}) a cada 25-30s com timeout de 5s, reconexão automática se falhar.',
  },
  {
    question: 'Sticky sessions vs stateless+pubsub: quando escolher cada?',
    options: [
      'Sempre sticky',
      'Sticky é mais simples para cluster pequeno (single-region, poucos nodes) mas quebra em autoscale: connection vai para node morto. Stateless + pubsub (Redis, NATS, Kafka) desacopla publish de delivery — qualquer node entrega para seus clients conectados, escala melhor mas adiciona latência e ponto de falha',
      'Nunca sticky',
      'Tanto faz sempre',
    ],
    correct: 1,
    explanation: 'Sticky: client sempre bate no mesmo pod. Simples, zero extra infra, mas desbalanceia em scale-in. Stateless + pubsub: cada node mantém só suas connections locais; publishes vão para Redis, todos os nodes consomem e entregam aos clients locais. Escala horizontal linear, mas fan-out tem custo e latência.',
  },
  {
    question: 'Close code 1006 significa o quê e como reagir?',
    options: [
      'Normal close, ignorar',
      'Abnormal closure: a conexão caiu sem frame de close (rede, crash). Cliente deve reconectar com backoff exponencial + jitter (ex: 1s, 2s, 4s, 8s, max 30s, ±20% jitter) e resumir estado via sequence number ou replay. Reconectar imediato em loop gera thundering herd no recovery',
      'Cliente autenticado',
      'Protocolo incompatível',
    ],
    correct: 1,
    explanation: '1006 é "gerado pelo browser quando não veio close frame". Backoff exponencial evita thundering herd após outage; jitter dessincroniza reconexões; sequence number no payload deixa client pedir "me mande eventos &gt; N" no reconnect. Sem isso, após queda do servidor todo mundo reconecta junto e derruba de novo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="websockets-producao-deep"
      title="WebSockets em produção"
      icon="🔌"
      xp={55}
      readTime={13}
      trailName="Real-time Systems"
      trailColor={accent}
      nextSlug="server-sent-events-sse"
      nextTitle="Server-Sent Events (SSE)"
      quiz={quiz}
    >
      <Section title="Handshake e framing" accent={accent}>
        <p>
          WebSocket começa como HTTP/1.1 Upgrade: Connection: Upgrade, Upgrade: websocket, Sec-WebSocket-Key. Após 101 Switching Protocols, a conexão TCP vira full-duplex com frames binários (opcode, mask, length, payload). Text frames (0x1), binary (0x2), close (0x8), ping (0x9), pong (0xA).
        </p>
        <CodeBlock lang="bash">{`# Handshake cliente (headers relevantes)
GET /ws HTTP/1.1
Host: app.ffv.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

# Response
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=`}</CodeBlock>
      </Section>

      <Section title="Heartbeat aplicação: a regra que salva produção" accent={accent}>
        <CodeBlock lang="ts">{`// Server
ws.on('message', (data) =&gt; {
  const msg = JSON.parse(String(data));
  if (msg.type === 'ping') {
    ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
    return;
  }
  // ... roteamento normal
});

// Client com timeout
let pingTimer: ReturnType&lt;typeof setInterval&gt;;
let pongDeadline: ReturnType&lt;typeof setTimeout&gt;;

function startHeartbeat(ws: WebSocket) {
  pingTimer = setInterval(() =&gt; {
    ws.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
    pongDeadline = setTimeout(() =&gt; ws.close(4000, 'pong-timeout'), 5000);
  }, 25000);
  ws.addEventListener('message', (ev) =&gt; {
    const m = JSON.parse(ev.data);
    if (m.type === 'pong') clearTimeout(pongDeadline);
  });
}`}</CodeBlock>
        <Callout tone="warn">
          Sem heartbeat de aplicação, clientes atrás de corporate proxies ficam com conexão "morta viva" e seu produto não entrega mensagem. É o bug mais comum de WS em produção.
        </Callout>
      </Section>

      <Section title="Scaling: sticky vs stateless+pubsub" accent={accent}>
        <CodeBlock lang="ts">{`// Stateless + Redis pub/sub (Node)
import { WebSocketServer } from 'ws';
import Redis from 'ioredis';

const sub = new Redis();
const pub = new Redis();
const wss = new WebSocketServer({ port: 3001 });
const localSubs = new Map&lt;string, Set&lt;WebSocket&gt;&gt;(); // channel -&gt; sockets

wss.on('connection', (ws, req) =&gt; {
  const channel = new URL(req.url!, 'http://x').searchParams.get('c')!;
  if (!localSubs.has(channel)) localSubs.set(channel, new Set());
  localSubs.get(channel)!.add(ws);
  sub.subscribe(\`ch:\${channel}\`);

  ws.on('close', () =&gt; {
    localSubs.get(channel)?.delete(ws);
    if (localSubs.get(channel)?.size === 0) {
      localSubs.delete(channel);
      sub.unsubscribe(\`ch:\${channel}\`);
    }
  });
});

sub.on('message', (topic, payload) =&gt; {
  const channel = topic.replace(/^ch:/, '');
  for (const ws of localSubs.get(channel) ?? []) {
    if (ws.readyState === 1) ws.send(payload);
  }
});

// publish de qualquer node
export function publish(channel: string, payload: string) {
  pub.publish(\`ch:\${channel}\`, payload);
}`}</CodeBlock>
        <Callout tone="info">
          Stateless + pubsub é o padrão correto em autoscale. Sticky sessions quebram quando HPA remove pods; Redis/NATS pubsub desacopla topologia.
        </Callout>
      </Section>

      <Section title="Reconnection com backoff + replay" accent={accent}>
        <CodeBlock lang="ts">{`function connect(url: string, lastSeq: number, onMessage: (m: unknown) =&gt; void) {
  let attempt = 0;
  const open = () =&gt; {
    const ws = new WebSocket(\`\${url}?since=\${lastSeq}\`);
    ws.onopen = () =&gt; { attempt = 0; };
    ws.onmessage = (ev) =&gt; {
      const m = JSON.parse(ev.data);
      if (typeof m.seq === 'number') lastSeq = m.seq;
      onMessage(m);
    };
    ws.onclose = () =&gt; {
      attempt++;
      const base = Math.min(30000, 1000 * 2 ** attempt);
      const jitter = base * (0.8 + Math.random() * 0.4);
      setTimeout(open, jitter);
    };
  };
  open();
}`}</CodeBlock>
      </Section>

      <Section title="Socket.io: quando vale" accent={accent}>
        <p>
          Socket.io não é WebSocket puro: é protocolo próprio sobre WS com fallback para long-polling, salas nativas, acks, reconexão automática. Útil se precisa de IE legado (raro em 2026) ou quer abstração de rooms. Custo: payload maior, menor interop com clientes outros que não Socket.io.
        </p>
        <Callout tone="success" icon="🎯">
          Default 2026: WS puro + Redis pubsub para novos projetos. Socket.io só quando rooms/acks internos compensam o lock-in.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
