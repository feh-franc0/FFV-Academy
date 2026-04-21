import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('webrtc-basico');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o papel de STUN vs TURN no WebRTC?',
    options: [
      'São sinônimos',
      'STUN descobre o IP público do peer atrás de NAT e tenta hole punching para conexão direta P2P; TURN é servidor relay (fallback) que encaminha mídia quando NATs simétricos ou firewalls bloqueiam o P2P direto. ICE é o algoritmo que testa candidatos em ordem de preferência',
      'Só em mobile',
      'TURN é para signaling',
    ],
    correct: 1,
    explanation: 'STUN (RFC 5389): server pequeno que responde "seu IP público é X:Y", permitindo hole punching. Em ~70-80% dos casos basta. TURN (RFC 8656): relay autenticado que encaminha pacotes quando P2P falha (NAT simétrico, firewall corporativo). ICE coleta candidatos (host, srflx, relay) e testa em ordem de custo/latência.',
  },
  {
    question: 'P2P mesh vs SFU: quando escolher SFU?',
    options: [
      'Sempre mesh',
      'Acima de 3-4 participantes: cada peer em mesh envia/recebe N-1 streams, upload explode. SFU (Selective Forwarding Unit) recebe uma vez de cada peer e redistribui, linearizando o upload por peer. Padrão em 2026 para calls 5+ pessoas, classes, webinars',
      'Só áudio',
      'Mesh sempre escala',
    ],
    correct: 1,
    explanation: 'Em mesh de N peers, cada um faz upload de (N-1) streams — inviável acima de ~4 em redes residenciais. SFU recebe 1 stream por peer e encaminha a todos, mantendo upload constante. MCU (mix central) recodifica, custa CPU server alto; SFU só roteia, barato e preserva qualidade nativa.',
  },
  {
    question: 'Data channels são úteis para o quê?',
    options: [
      'Nada, use WS',
      'Transferência P2P direta de dados arbitrários com latência baixíssima (sem ida ao servidor): game state, cursor tracking, file transfer, colab CRDT sync. Suportam SCTP reliable ou unreliable/unordered, escolhível por caso',
      'Só texto',
      'Criptografia',
    ],
    correct: 1,
    explanation: 'RTCDataChannel roda sobre SCTP+DTLS, P2P puro após ICE. Modo reliable/ordered (como TCP) ou unreliable/unordered (como UDP, para game state onde último valor vale). Latência cai para ~10-30ms em LAN/mesma região, imbatível por qualquer solução cliente-servidor.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="webrtc-basico"
      title="WebRTC: voice, video, data channels"
      icon="📹"
      xp={60}
      readTime={14}
      trailName="Real-time Systems"
      trailColor={accent}
      nextSlug="crdts-colab-editing"
      nextTitle="CRDTs: Yjs, Automerge"
      quiz={quiz}
    >
      <Section title="Arquitetura: signaling + ICE + media" accent={accent}>
        <p>
          WebRTC tem três camadas: (1) signaling (fora do padrão, você implementa via WS/SSE) troca SDP offer/answer entre peers; (2) ICE coleta candidatos (local, STUN reflexive, TURN relay) e tenta conectar na ordem de preferência; (3) mídia flui direto entre peers (ou via SFU), com DTLS-SRTP para cripto.
        </p>
      </Section>

      <Section title="Fluxo de offer/answer" accent={accent}>
        <CodeBlock lang="ts">{`const ice = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:turn.ffv.com:3478', username: 'u', credential: 'p' },
  ],
};

// Alice (caller)
const pc = new RTCPeerConnection(ice);
const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
stream.getTracks().forEach(t =&gt; pc.addTrack(t, stream));

pc.onicecandidate = (e) =&gt; {
  if (e.candidate) signal.send({ type: 'ice', candidate: e.candidate });
};

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
signal.send({ type: 'offer', sdp: offer.sdp });

// Bob (callee) recebe offer via signaling
signal.on('offer', async (msg) =&gt; {
  await pc.setRemoteDescription({ type: 'offer', sdp: msg.sdp });
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  signal.send({ type: 'answer', sdp: answer.sdp });
});`}</CodeBlock>
      </Section>

      <Section title="Data channels para baixa latência" accent={accent}>
        <CodeBlock lang="ts">{`const dc = pc.createDataChannel('game-state', {
  ordered: false,          // frames novos invalidam antigos
  maxRetransmits: 0,       // unreliable, tipo UDP
});

dc.onopen = () =&gt; console.log('data channel aberto');
dc.onmessage = (ev) =&gt; applyRemoteState(JSON.parse(ev.data));

function broadcastLocalState(state: unknown) {
  if (dc.readyState === 'open') dc.send(JSON.stringify(state));
}`}</CodeBlock>
        <Callout tone="info">
          Para estado de jogo ou cursor em colab editor, unreliable+unordered é ideal: último valor vale, retransmitir é desperdício. Para file transfer, reliable+ordered (default).
        </Callout>
      </Section>

      <Section title="TURN: por que vai pagar ou auto-hospedar" accent={accent}>
        <p>
          STUN é grátis e resolve maioria dos NATs. TURN sempre consome banda real (todo pacote de mídia passa pelo server), por isso não existe TURN público grátis sério. Em produção: Coturn self-hosted (OSS, custo EC2 + egress) ou Twilio/Xirsys/Cloudflare Calls.
        </p>
        <CodeBlock lang="yaml">{`# coturn básico em Docker
services:
  coturn:
    image: coturn/coturn:latest
    network_mode: host
    command:
      - -n
      - --listening-port=3478
      - --tls-listening-port=5349
      - --realm=ffv.com
      - --user=ffv:supersenha
      - --cert=/certs/fullchain.pem
      - --pkey=/certs/privkey.pem
      - --no-cli`}</CodeBlock>
      </Section>

      <Section title="Limites do P2P puro" accent={accent}>
        <CodeBlock lang="yaml">{`mesh N peers:
  uploads por peer: N-1 streams
  downloads por peer: N-1 streams
  regra prática: até 4 peers em rede residencial
  acima disso: SFU (próximos módulos: LiveKit/mediasoup)`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          WebRTC é a única primitiva browser nativa para mídia real-time P2P. Para calls 1:1 ou 1:poucos, mesh basta. Para rooms, SFU é inevitável — é onde LiveKit e mediasoup entram.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
