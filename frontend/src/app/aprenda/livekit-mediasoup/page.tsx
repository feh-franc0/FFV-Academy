import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('livekit-mediasoup');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'SFU vs MCU: qual é o trade-off central?',
    options: [
      'São iguais',
      'SFU apenas roteia streams (encaminha pacotes encriptados SRTP a cada peer); CPU server baixo, mas cada client recebe N-1 streams e paga upload/download por peer. MCU recodifica todos os streams em um mix único no server (CPU caríssimo, transcoding) mas cada client recebe/envia só 1 stream. SFU venceu para quase tudo em 2026',
      'MCU é sempre melhor',
      'SFU não faz video',
    ],
    correct: 1,
    explanation: 'SFU (LiveKit, mediasoup, Janus, Jitsi Videobridge): custo CPU server linear com número de streams roteados, zero transcoding, qualidade nativa preservada. MCU (FreeSWITCH old school): mixa tudo num único stream, ótimo para telefonia/PSTN, inviável economicamente para video em escala.',
  },
  {
    question: 'Simulcast no SFU serve para quê?',
    options: [
      'Nada, é marketing',
      'Client publica 2-3 camadas de qualidade (ex: 180p, 360p, 720p) simultaneamente; SFU decide qual camada encaminhar a cada receiver baseado em bandwidth/tile size. Resolve heterogeneidade de rede sem transcoding no server',
      'Só áudio',
      'Compression',
    ],
    correct: 1,
    explanation: 'Simulcast + SVC (Scalable Video Coding) são o que torna SFU viável com receivers heterogêneos. Receiver em 4G recebe 180p; tile grande em monitor 4K recebe 720p. SFU só escolhe qual camada forward, sem recodificar. LiveKit, mediasoup, Jitsi implementam isso nativamente.',
  },
  {
    question: 'LiveKit vs mediasoup: quando escolher cada?',
    options: [
      'Indistinto',
      'LiveKit (Go, open source Apache 2) é plataforma completa — servidor + SDK multi-plataforma + cloud opcional, ops baixo. mediasoup (Node/C++) é library pura; você constrói o server inteiro, mais controle e customização, mais código. LiveKit default para produto; mediasoup para quem precisa arquitetura sob medida',
      'Só áudio vs só vídeo',
      'mediasoup é pago',
    ],
    correct: 1,
    explanation: 'LiveKit: entrega pronta (rooms, recordings, egress, agents, SDKs JS/iOS/Android/Flutter), Apache 2, self-host ou cloud. mediasoup: biblioteca Node que expõe workers C++; você escreve signaling, rooms, autorização, scaling. Controle maior, esforço maior. Pion (Go) é ainda mais lowlevel.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="livekit-mediasoup"
      title="LiveKit, mediasoup: SFU para voice/video"
      icon="🎙️"
      xp={55}
      readTime={13}
      trailName="Real-time Systems"
      trailColor={accent}
      nextSlug="capstone-rt-app-completo"
      nextTitle="Capstone: app real-time completo"
      quiz={quiz}
    >
      <Section title="Por que SFU é inevitável" accent={accent}>
        <p>
          Chamadas de vídeo com 5+ participantes em mesh explodem o upload do usuário. SFU centraliza o forwarding: cada peer manda uma vez, server distribui. Combinação de simulcast + SVC + bandwidth estimation entrega vídeo adaptativo sem recodificar.
        </p>
      </Section>

      <Section title="LiveKit: room server em 20 linhas" accent={accent}>
        <CodeBlock lang="ts">{`// Server: emite JWT de acesso
import { AccessToken } from 'livekit-server-sdk';

export function issueToken(userId: string, roomName: string) {
  const at = new AccessToken(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!, {
    identity: userId,
    ttl: 60 * 60,
  });
  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
  return at.toJwt();
}

// Client (web)
import { Room, RoomEvent, createLocalTracks } from 'livekit-client';

const room = new Room({ adaptiveStream: true, dynacast: true });
await room.connect('wss://livekit.ffv.com', token);
const tracks = await createLocalTracks({ audio: true, video: { resolution: { width: 1280, height: 720 } } });
for (const t of tracks) await room.localParticipant.publishTrack(t);

room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) =&gt; {
  const el = track.attach();
  document.getElementById('tile-' + participant.identity)?.appendChild(el);
});`}</CodeBlock>
        <Callout tone="info">
          dynacast: true faz LiveKit pausar upload de camadas que nenhum receiver está assinando (ex: ninguém olhando seu tile em 720p). Economia real de banda em rooms grandes.
        </Callout>
      </Section>

      <Section title="mediasoup: plumbing manual" accent={accent}>
        <CodeBlock lang="js">{`const mediasoup = require('mediasoup');

const worker = await mediasoup.createWorker({ rtcMinPort: 40000, rtcMaxPort: 49999 });
const router = await worker.createRouter({
  mediaCodecs: [
    { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
    { kind: 'video', mimeType: 'video/VP8',  clockRate: 90000 },
  ],
});

const transport = await router.createWebRtcTransport({
  listenIps: [{ ip: '0.0.0.0', announcedIp: PUBLIC_IP }],
  enableUdp: true, enableTcp: true, preferUdp: true,
});`}</CodeBlock>
        <Callout tone="warn">
          mediasoup você monta room, autorização, signaling, scale, gravação, mute/unmute, tudo. Poder total, tempo de entrega alto. LiveKit e Jitsi Videobridge ganham em produtividade.
        </Callout>
      </Section>

      <Section title="Egress: recording e streaming" accent={accent}>
        <CodeBlock lang="yaml">{`LiveKit Egress:
  - composite recording (mix visual) para MP4
  - track egress (1 arquivo por participante)
  - stream egress para RTMP (YouTube Live, Twitch)
  - roda em container separado, upload direto para S3
mediasoup:
  - PlainTransport + ffmpeg pipeline custom
  - você constrói tudo; mais flexível, mais trabalho`}</CodeBlock>
      </Section>

      <Section title="SaaS vs self-host" accent={accent}>
        <CodeBlock lang="yaml">{`Twilio Video, Agora, Daily, Zoom Video SDK:
  + SLA forte, global edge, zero ops
  - preço por minuto-participante, escala linear com uso
LiveKit Cloud:
  + mesmo SDK que self-host; migração trivial
  - preço intermediário
LiveKit self-host / mediasoup self-host:
  + custo infraestrutura (EC2 + egress), previsível
  - ops (autoscale SFU, TURN, monitoring)`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          2026 pragmático: LiveKit self-host se tráfego justifica SRE dedicado; Cloud LiveKit ou Daily para MVP/produto pequeno. mediasoup/Pion só quando arquitetura exige customização que nenhum OSS pronto cobre.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
