import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, NodeGraph } from '@/components/article/primitives';

export const metadata = getModuleMetadata('webrtc-pratica');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'WebRTC é um protocolo P2P "puro" — não precisa de servidor?',
    options: [
      'Sim, é totalmente serverless',
      'Não — exige um signaling server (HTTP/WebSocket) para troca de SDP offer/answer + ICE candidates. O servidor não roteia mídia (isso é P2P), mas é indispensável para a negociação inicial. NAT traversal usa STUN (público) e fallback via TURN (relay pago)',
      'Sim, mas só em LAN',
      'Não, sempre passa por servidor durante toda a sessão',
    ],
    correct: 1,
    explanation: 'WebRTC = mídia P2P + signaling externo. Você precisa implementar signaling (qualquer transport: WebSocket, Firebase, custom). STUN descobre IP público; TURN é fallback quando NAT simétrico bloqueia P2P (≈10-20% das conexões em redes corporativas e mobile).',
  },
  {
    question: 'O que é SDP em WebRTC?',
    options: [
      'Software Defined Peer',
      'Session Description Protocol — formato texto que descreve capacidades de mídia (codecs, resoluções, ICE candidates, criptografia DTLS). Offer/Answer trocados via signaling',
      'Simple Datagram Protocol',
      'Secure Data Path',
    ],
    correct: 1,
    explanation: 'SDP (RFC 4566) é um formato texto, antigo, herdado do SIP. WebRTC usa SDP munged: a parte essencial é a lista de codecs + parâmetros + ICE candidates. Frameworks novos (mediasoup, livekit) abstraem o SDP, mas conhecer é útil para debug.',
  },
  {
    question: 'Qual a melhor escolha para uma chamada de vídeo 1:1 simples?',
    options: [
      'SFU (Selective Forwarding Unit)',
      'P2P puro (RTCPeerConnection direto entre os dois clients) — sem servidor de mídia, baixa latência, custo zero de bandwidth do servidor',
      'MCU (Multipoint Conferencing Unit)',
      'Sempre TURN relay',
    ],
    correct: 1,
    explanation: 'Para 1:1, P2P puro é ideal: ~100ms RTT, sem custo de servidor de mídia. SFU/MCU só entram quando você tem 3+ participantes (custo de upload do client cresce linearmente em mesh, então centraliza no SFU).',
  },
  {
    question: 'O que são RTCDataChannels?',
    options: [
      'Apenas para áudio',
      'Canais de dados bidirecionais sobre a mesma conexão WebRTC — alternativa a WebSocket, com latência menor, multiplexação, reliable/unreliable configurável (UDP-like via SCTP)',
      'Apenas para vídeo',
      'Backup do WebSocket',
    ],
    correct: 1,
    explanation: 'Data channels rodam sobre SCTP/DTLS na mesma conexão WebRTC. Suportam modo reliable ordered (TCP-like) ou unreliable unordered (UDP-like). Casos: file transfer P2P, game state, telemetria, chat em sala de vídeo. Não substituem WebSocket em servidor-client.',
  },
  {
    question: 'STUN vs TURN:',
    options: [
      'STUN faz relay; TURN descobre IP',
      'STUN é um servidor leve que devolve seu IP público; TURN é um servidor que faz relay completo da mídia quando NAT impede P2P. STUN é grátis (Google opera servers públicos); TURN custa caro em bandwidth',
      'Ambos fazem a mesma coisa',
      'TURN é mais rápido que STUN',
    ],
    correct: 1,
    explanation: 'STUN é descoberta (cheap, free). TURN é relay (expensive, com auth). Em produção, oferte ambos via ICE; ICE escolhe a melhor opção. Twilio NTS, Cloudflare Realtime e coturn (self-host) são opções comuns para TURN.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="webrtc-pratica"
      title="WebRTC: peer-to-peer, signaling, STUN/TURN"
      icon="📞"
      xp={70}
      readTime={14}
      trailName="Browser & Web Internals Profundo"
      trailColor={accent}
      nextSlug="webtransport-http3"
      nextTitle="WebTransport sobre HTTP/3"
      quiz={quiz}
    >
      <Section title="O que WebRTC realmente é (e o que não é)" accent={accent}>
        <p className="text-sm leading-6">
          WebRTC nasceu em 2011 (Google open-source o stack que veio do GIPS). É um conjunto de APIs do browser para mídia em tempo real (áudio, vídeo, dados) <b>com criptografia obrigatória</b> (DTLS-SRTP), capaz de funcionar P2P quando a rede permite. Toda chamada de vídeo séria — Google Meet, Discord (parcialmente), Whereby, Daily, LiveKit, Twilio Video — usa WebRTC por baixo.
        </p>
        <Callout tone="warn">
          WebRTC NÃO é P2P "mágico". Você precisa implementar signaling (server) e oferecer STUN/TURN. ~10-20% das conexões em produção mundial dependem de TURN relay.
        </Callout>
      </Section>

      <Section title="As 3 APIs principais" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'getUserMedia()', v: 'Acessar microfone e câmera do usuário com permissão' },
            { k: 'RTCPeerConnection', v: 'Estabelecer conexão P2P, gerenciar ICE, codecs, mídia' },
            { k: 'RTCDataChannel', v: 'Canal de dados bidirecional sobre a mesma conexão' },
          ]}
        />
      </Section>

      <Section title="O fluxo completo de uma chamada P2P" accent={accent}>
        <FlowDiagram
          title="Handshake WebRTC"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '🎥', label: '1. getUserMedia', desc: 'Cada peer captura sua mídia local' },
            { icon: '🔌', label: '2. createOffer (Alice)', desc: 'SDP com codecs + capabilities' },
            { icon: '📡', label: '3. Signaling: offer → Bob', desc: 'Via WebSocket / Firebase / qualquer canal' },
            { icon: '↩️', label: '4. createAnswer (Bob)', desc: 'Responde SDP com intersecção de capabilities' },
            { icon: '📡', label: '5. Signaling: answer → Alice', desc: 'Mesmo canal de volta' },
            { icon: '🧊', label: '6. ICE candidates trocados', desc: 'IPs descobertos via STUN, possivelmente TURN' },
            { icon: '🔐', label: '7. DTLS handshake', desc: 'Negocia chaves SRTP' },
            { icon: '📺', label: '8. Mídia flui P2P', desc: 'Áudio/vídeo direto entre os peers' },
          ]}
        />
      </Section>

      <Section title="Código mínimo (cliente lado A)" accent={accent}>
        <CodeBlock lang="typescript">{`const pc = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },                       // STUN (grátis)
    { urls: 'turn:turn.example.com', username: 'u', credential: 'p' } // TURN (pago)
  ],
});

// 1. Captura mídia local
const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
stream.getTracks().forEach(track => pc.addTrack(track, stream));

// 2. Quando ICE candidate aparece, envia ao peer via signaling
pc.onicecandidate = ({ candidate }) => {
  if (candidate) signaling.send({ type: 'candidate', candidate });
};

// 3. Mídia remota chegando
pc.ontrack = (event) => {
  remoteVideo.srcObject = event.streams[0];
};

// 4. Cria offer
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
signaling.send({ type: 'offer', sdp: offer });

// 5. Recebe answer
signaling.on('answer', async ({ sdp }) => {
  await pc.setRemoteDescription(sdp);
});

// 6. Recebe candidates
signaling.on('candidate', async ({ candidate }) => {
  await pc.addIceCandidate(candidate);
});`}</CodeBlock>
      </Section>

      <Section title="Topologias quando há 3+ participantes" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Topologia', 'Como funciona', 'Quando usar']}
          rows={[
            ['Mesh (P2P full)', 'Cada um conecta com cada um (N×(N-1)/2 conexões)', '≤4 participantes, baixa latência'],
            ['SFU (Selective Forwarding Unit)', 'Cada peer envia para o SFU; SFU encaminha para os outros sem decodificar', 'Padrão para 5-50 peers (mediasoup, LiveKit, Janus)'],
            ['MCU (Multipoint Conferencing Unit)', 'SFU + transcodifica/mistura streams em um único output', 'Conferências legadas, salas com 50+'],
            ['Mesh + SFU híbrido', 'P2P para 1:1, escala para SFU quando entra 3º', 'Otimização de custo (apps modernos)'],
          ]}
        />
      </Section>

      <Section title="NAT traversal — o problema do mundo real" accent={accent}>
        <p className="text-sm leading-6">
          A maioria dos clientes está atrás de NAT (residencial, corporativo, mobile). ICE (Interactive Connectivity Establishment, RFC 8445) tenta múltiplos caminhos:
        </p>
        <NodeGraph
          title="Tipos de NAT — em ordem de dificuldade"
          accent={accent}
          columns={[
            { label: 'Fáceis (P2P funciona)', nodes: [
              { icon: '🟢', label: 'Full Cone NAT', sub: 'Qualquer IP externo pode enviar', tone: 'success' },
              { icon: '🟢', label: 'Restricted Cone', sub: 'Só IPs que recebemos pacote' },
            ]},
            { label: 'Médios (STUN ajuda)', nodes: [
              { icon: '🟡', label: 'Port-Restricted Cone', sub: 'IP + porta específicos' },
            ]},
            { label: 'Difíceis (TURN obrigatório)', nodes: [
              { icon: '🔴', label: 'Symmetric NAT', sub: 'Porta externa muda por destino', tone: 'danger' },
              { icon: '🔴', label: 'Firewall corporativo bloqueando UDP', sub: 'Cai pra TURN/TCP/443', tone: 'danger' },
            ]},
          ]}
        />
      </Section>

      <Section title="Frameworks de produção em 2026" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tool', 'Foco', 'Quando escolher']}
          rows={[
            ['LiveKit', 'Open-source SFU + SDKs em todas plataformas', 'Default 2026 — DX excelente, self-host ou cloud'],
            ['mediasoup', 'Node.js SFU low-level, máxima flexibilidade', 'Quer customizar pipeline a fundo'],
            ['Twilio Programmable Video', 'Cloud gerenciado, alto SLA', 'Não quer operar SFU'],
            ['Daily.co / 100ms', 'API-first, prebuilt UI', 'Time-to-market rápido'],
            ['Cloudflare Realtime SFU', 'Edge network, SFU global', 'Latência baixa global'],
          ]}
        />
      </Section>

      <Section title="Pitfalls comuns" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Achar que STUN basta', v: '10-20% dos usuários precisam de TURN. Sem TURN, falha em rede corporativa.' },
            { k: 'Esquecer permissão HTTPS', v: 'getUserMedia exige contexto seguro (HTTPS ou localhost).' },
            { k: 'Não tratar perda de conexão', v: 'ICE pode reconectar; implemente UI de reconexão.' },
            { k: 'Bandwidth ilimitado no cliente', v: 'Em mesh, upload do client cresce linearmente. Use simulcast/SVC.' },
            { k: 'Não medir QoS', v: 'getStats() devolve packet loss, jitter, RTT. Logue para troubleshoot.' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
