import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-rt-app-completo');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que um app real-time portfolio-grade combina WS + Yjs + LiveKit em vez de uma única primitiva?',
    options: [
      'Só para impressionar',
      'Cada primitiva resolve um problema distinto: WebSocket para chat/presence (bidi texto), Yjs para colab document (CRDT convergente sem server árbitro), LiveKit para video/voice (SFU com simulcast). Usar WS para tudo obrigaria reinventar CRDT e SFU manualmente — erro clássico',
      'LiveKit faz tudo',
      'Yjs substitui WS',
    ],
    correct: 1,
    explanation: 'Cada camada tem modelo correto: chat é mensagens ordenadas (WS+pubsub), colab é estado convergente (CRDT Yjs), mídia é streams SRTP (SFU LiveKit). Tentativa de unificar em WS genérico costuma acabar com CRDT caseiro buggado e mix fake de vídeo que não escala.',
  },
  {
    question: 'Qual é a responsabilidade mais crítica do load balancer em arquitetura real-time?',
    options: [
      'Só rotear HTTP',
      'Suporte a WebSocket upgrade + idle timeout configurável (mínimo 5 minutos, não 60s default) + sticky sessions por connection id se o backend for stateful com session local, ou consistent hashing por user id se stateless com Redis. ALB/nginx/envoy todos servem se configurados',
      'SSL apenas',
      'Cache',
    ],
    correct: 1,
    explanation: 'Default 60s do ALB/nginx mata WS com heartbeat de 30s sem margem. Idle timeout precisa ser confortavelmente maior que heartbeat interval. Sticky sessions por conn id (não por IP, NAT quebra) ou pubsub Redis; escolha certa depende se gateway mantém estado local.',
  },
  {
    question: 'Que tipo de failure-injection é obrigatória em writeup de capstone real-time sério?',
    options: [
      'Nenhuma',
      'Kill de 1 gateway WS durante chat ativo (mede tempo de reconexão + replay), kill de um SFU node durante call (mede handoff), partição Redis (pubsub degradado), perda de 10-30% de pacotes UDP (mede qualidade adaptativa WebRTC). Documentar SLOs observados e recovery',
      'Só teste de carga',
      'Só unit tests',
    ],
    correct: 1,
    explanation: 'Real-time distingue-se por comportamento sob falha, não só happy path. Failure injection + SLO documentados (ex: p99 de reconnect &lt; 3s, chamada sobrevive ao kill de SFU sem dropout &gt; 500ms) mostram rigor de sistemas distribuídos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-rt-app-completo"
      title="Capstone: app real-time completo"
      icon="🏁"
      xp={85}
      readTime={20}
      trailName="Real-time Systems"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Construa um app colaborativo do tipo "Notion + Slack + Meet" com três primitivas bem separadas: chat em tempo real com presence, documento colaborativo Yjs e sala de vídeo/voz via LiveKit. Scaling horizontal em Redis pubsub, failure-injection documentada, dashboards Grafana.
        </p>
      </Section>

      <Section title="Arquitetura alvo" accent={accent}>
        <CodeBlock lang="yaml">{`Client (Next.js 16 + Tailwind):
  - chat: WebSocket nativo
  - doc: Yjs + TipTap (CollaborationCursor)
  - video: livekit-client (adaptiveStream + dynacast)

Gateway WS (Node 22, pods stateless):
  - upgrade WS, auth por JWT
  - Redis pubsub para broadcast cross-pod
  - heartbeat 25s, reconnect com Last-Seq replay

Yjs Sync (y-websocket + y-redis):
  - persistência em Redis streams
  - snapshot offload para Postgres por doc

LiveKit SFU (self-host em Kubernetes):
  - 3 replicas com region-affinity
  - TURN via coturn dedicado
  - egress server separado para gravações S3

Infra comum:
  - Redis Cluster (3 masters, 3 replicas)
  - Postgres 16 (auth, users, rooms, doc snapshots)
  - NGINX Ingress com WS upgrade + idle 5min
  - Prometheus + Grafana + Loki
  - Tracing OpenTelemetry (chat msg -> broadcast -> render)`}</CodeBlock>
      </Section>

      <Section title="Entregáveis técnicos" accent={accent}>
        <CodeBlock lang="yaml">{`1. Monorepo pnpm workspaces
   - /apps/web        (Next.js)
   - /apps/gateway-ws (Node)
   - /apps/yjs-sync   (Node)
   - /infra           (terraform + helm charts)
   - /load            (k6 scripts)

2. Features funcionais
   - login JWT + refresh
   - room com chat + doc + video simultâneos
   - presence (online, typing, cursor no doc)
   - mentions @ com notificações
   - offline-first no doc (Yjs IndexedDB provider)

3. Scaling benchmarks
   - 10k conexões WS sustentadas em 3 pods
   - 500 participantes simultâneos no SFU (LiveKit load tester)
   - latência chat p50/p95/p99 cross-region
   - throughput Yjs (ops/s por doc)

4. Failure injection (chaos)
   - kubectl delete pod gateway-ws
   - kill SFU durante call
   - drop 30% UDP packets (tc netem)
   - partition Redis master
   Documentar tempo de recovery e SLOs observados`}</CodeBlock>
      </Section>

      <Section title="Esqueleto do gateway WS" accent={accent}>
        <CodeBlock lang="ts">{`import { WebSocketServer } from 'ws';
import Redis from 'ioredis';
import { verifyJwt } from './auth';

const wss = new WebSocketServer({ port: 3001 });
const sub = new Redis(); const pub = new Redis();
const local = new Map&lt;string, Set&lt;import('ws').WebSocket&gt;&gt;();

sub.on('message', (ch, payload) =&gt; {
  const room = ch.replace(/^room:/, '');
  for (const ws of local.get(room) ?? []) {
    if (ws.readyState === 1) ws.send(payload);
  }
});

wss.on('connection', async (ws, req) =&gt; {
  const user = await verifyJwt(req.headers['sec-websocket-protocol']);
  const room = new URL(req.url!, 'http://x').searchParams.get('room')!;
  if (!local.has(room)) { local.set(room, new Set()); sub.subscribe('room:' + room); }
  local.get(room)!.add(ws);

  ws.on('message', (raw) =&gt; {
    const msg = JSON.parse(String(raw));
    pub.publish('room:' + room, JSON.stringify({ ...msg, user: user.id, ts: Date.now() }));
  });
  ws.on('close', () =&gt; {
    local.get(room)!.delete(ws);
    if (local.get(room)!.size === 0) { local.delete(room); sub.unsubscribe('room:' + room); }
  });
});`}</CodeBlock>
      </Section>

      <Section title="Writeup ideal" accent={accent}>
        <CodeBlock lang="markdown">{`# RT Collab App — Design + Results

## 1. Motivação e escopo
Problema, não-objetivos, user stories.

## 2. Arquitetura
Diagrama (C4 level 2), decisões principais.

## 3. ADRs
- WS + Redis pubsub vs Socket.io
- Yjs vs Automerge vs OT
- LiveKit self-host vs Daily SaaS
- sticky vs stateless gateway

## 4. Benchmarks
Setup (HW, configs), metodologia (warmup, duração),
percentis p50/p95/p99, custo por 1k MAU.

## 5. Failure injection
Cenários testados, SLOs observados, gaps conhecidos.

## 6. Observability
Screenshots Grafana, queries Prometheus chave.

## 7. Limitations & next steps
O que não foi feito, por quê, como continuar.`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Esse capstone, entregue com benchmarks + ADRs + failure injection + observability real, posiciona você como engineer capaz de operar real-time em escala. É o nível pedido em posições senior+ de infra/SRE em 2026.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
