import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('presence-sistemas');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que presence não é persistido em DB como "is_online=true"?',
    options: [
      'Por moda',
      'Porque estado efêmero: client desconectou por GC/tab close/rede e DB nunca recebe "offline". Precisa de heartbeat com TTL (Redis EXPIRE) ou registry in-memory no gateway que morre junto com a conexão. Presence é soft-state, não source of truth',
      'DB é mais lento',
      'Por LGPD',
    ],
    correct: 1,
    explanation: 'O desafio é detectar offline sem que o client peça gentilmente. TTL (Redis SETEX user:123 45) + heartbeat a cada 30s: se client morre, TTL expira e usuário some. Se persistisse no DB, um client que crashou ficaria "online" para sempre. Presence é semântica de cache com expiração curta.',
  },
  {
    question: 'Qual é o problema N² em rooms grandes de presence?',
    options: [
      'Nenhum',
      'Cada usuário em room de N pessoas precisa receber updates de presence de cada um dos outros N-1; com cursor/typing em alta frequência vira O(N²) mensagens por segundo. Mitigar com throttling (10-20Hz), coalescing (última cursor position vale), ou pagination de presence (só top 50 ativos)',
      'Falta de CPU',
      'Falta de banda',
    ],
    correct: 1,
    explanation: 'Em room de 100 pessoas com cursor a 60Hz, são 100 * 99 * 60 = 594k msgs/s só de cursor. Soluções reais: throttle para 10Hz, coalescing (drop updates intermediárias), presence pagination (mostra N mais ativos), viewport-based (só trackeia quem está visível).',
  },
  {
    question: 'Por que Redis pubsub sozinho não basta para presence em múltiplos gateways?',
    options: [
      'Basta sim',
      'Pubsub é fire-and-forget: quem assina recebe publishes dali em diante, mas não tem histórico. Presence precisa consulta de estado corrente ("quem está online agora em doc X"). Combinação correta: Redis Hash/Set por room para estado + pubsub para deltas',
      'Redis é lento',
      'Só funciona single-node',
    ],
    correct: 1,
    explanation: 'Pubsub Redis não mantém histórico. Solução clássica: HSET room:123 user:42 "{cursor:...,ts:...}" + TTL, e publica delta em "ch:room:123". Novo client que entra: HGETALL para snapshot atual, depois consome pubsub para updates. Gateway stateless, escalável horizontalmente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="presence-sistemas"
      title="Presence systems em escala"
      icon="👥"
      xp={50}
      readTime={12}
      trailName="Real-time Systems"
      trailColor={accent}
      nextSlug="livekit-mediasoup"
      nextTitle="LiveKit, mediasoup: SFU para voice/video"
      quiz={quiz}
    >
      <Section title="Presence é estado efêmero" accent={accent}>
        <p>
          Online/offline, typing indicators, cursor tracking, selection ranges, last-seen — tudo isso é soft-state derivado da conexão viva. Quando a conexão cai, o estado some. Persistir em DB relacional como flag booleana é erro clássico; ninguém chama "DELETE" ao crashar.
        </p>
      </Section>

      <Section title="Padrão heartbeat + TTL no Redis" accent={accent}>
        <CodeBlock lang="ts">{`import Redis from 'ioredis';
const redis = new Redis();
const TTL = 45; // segundos

// Client envia heartbeat a cada 30s via WS
wss.on('connection', (ws, req) =&gt; {
  const userId = auth(req);
  const roomId = room(req);

  async function touch() {
    await redis.multi()
      .hset(\`presence:\${roomId}\`, userId, JSON.stringify({ ts: Date.now() }))
      .expire(\`presence:\${roomId}\`, TTL)
      .exec();
    await redis.publish(\`presence:ch:\${roomId}\`,
      JSON.stringify({ type: 'join', userId }));
  }

  ws.on('message', (raw) =&gt; {
    const m = JSON.parse(String(raw));
    if (m.type === 'heartbeat') touch();
    if (m.type === 'cursor') {
      redis.publish(\`presence:ch:\${roomId}\`,
        JSON.stringify({ type: 'cursor', userId, pos: m.pos }));
    }
  });

  ws.on('close', () =&gt; {
    redis.hdel(\`presence:\${roomId}\`, userId);
    redis.publish(\`presence:ch:\${roomId}\`,
      JSON.stringify({ type: 'leave', userId }));
  });

  touch();
});`}</CodeBlock>
      </Section>

      <Section title="Snapshot + deltas para novos clients" accent={accent}>
        <CodeBlock lang="ts">{`const snapshot = await redis.hgetall(\`presence:\${roomId}\`);
ws.send(JSON.stringify({ type: 'snapshot', users: snapshot }));

const sub = new Redis();
sub.subscribe(\`presence:ch:\${roomId}\`);
sub.on('message', (_ch, payload) =&gt; ws.send(payload));`}</CodeBlock>
      </Section>

      <Section title="Throttle e coalescing para cursor/typing" accent={accent}>
        <CodeBlock lang="ts">{`let pending: { x: number; y: number } | null = null;
let flushTimer: ReturnType&lt;typeof setTimeout&gt; | null = null;

document.addEventListener('mousemove', (e) =&gt; {
  pending = { x: e.clientX, y: e.clientY };
  if (!flushTimer) {
    flushTimer = setTimeout(() =&gt; {
      if (pending) ws.send(JSON.stringify({ type: 'cursor', pos: pending }));
      pending = null;
      flushTimer = null;
    }, 100);
  }
});`}</CodeBlock>
        <Callout tone="warn">
          Sem throttle, 120Hz de movimento de mouse gera tráfego suicida. Throttle 100ms + coalescing é o mínimo; em rooms grandes caia para 200-300ms.
        </Callout>
      </Section>

      <Section title="Quando usar Liveblocks/Ably/Pusher vs self-host" accent={accent}>
        <CodeBlock lang="yaml">{`self-host (Redis + Node):
  + zero vendor lock
  + custo baixo até milhões de conexões
  - operação (scale out, failover, metrics)
Liveblocks:
  + SDK opinativo (presence + Yjs integrados)
  + free tier generoso, preço razoável
  - vendor lock, ótimo em workflows de colab
Ably/Pusher/PubNub:
  + pubsub managed, SLAs fortes
  - preço escala com msg, caro em rooms muito ativas`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Regra prática: MVP = managed (Liveblocks/Ably). Escala séria = self-host Redis pubsub + WS stateless. Migração vale quando conta mensal ultrapassa salário de SRE.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
