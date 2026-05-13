import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram } from '@/components/article/primitives';

export const metadata = getModuleMetadata('webtransport-http3');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'WebTransport roda sobre qual protocolo de transporte?',
    options: [
      'TCP',
      'QUIC (que roda sobre UDP) e é parte do HTTP/3. Permite multiplexação sem head-of-line blocking, streams ordenados e datagrams unreliable na mesma conexão',
      'WebSocket',
      'gRPC',
    ],
    correct: 1,
    explanation: 'WebTransport (W3C spec) é o transport API moderno do browser sobre QUIC/HTTP/3. Vantagens: zero RTT em conexões recorrentes, multiplexação sem HOL blocking (pacote perdido em um stream não trava os outros), e datagrams unreliable opcionais.',
  },
  {
    question: 'Qual a diferença principal entre WebSocket e WebTransport?',
    options: [
      'WebTransport é mais lento',
      'WebSocket é single bidirectional stream sobre TCP (HOL blocking afeta tudo); WebTransport oferece múltiplos streams independentes + datagrams unreliable, sobre QUIC',
      'São idênticos',
      'WebSocket é mais novo',
    ],
    correct: 1,
    explanation: 'WebSocket é da era TCP. WebTransport é da era QUIC. Para apps modernos (games, edição colaborativa, live streaming, telemetria), WebTransport oferece primitivas melhores. WebSocket continua vivo por compatibilidade e simplicidade.',
  },
  {
    question: 'Quando usar datagrams unreliable do WebTransport?',
    options: [
      'Sempre',
      'Quando atraso é pior que perda — telemetria de jogo (posição do jogador), live audio/video low-latency, sensores. Não usar para mensagens que precisam chegar (use streams ordenados nesses casos)',
      'Para upload de arquivos',
      'Para autenticação',
    ],
    correct: 1,
    explanation: 'Datagrams = "envio e esqueço". Perfeito para dados que ficam obsoletos rápido (posição em jogo a cada 50ms). Para dados que precisam chegar (chat, comandos críticos), use streams ordenados reliable do WebTransport (similar a TCP, mas multiplexado).',
  },
  {
    question: 'Suporte de WebTransport em maio/2026:',
    options: [
      'Nenhum browser suporta',
      'Chrome/Edge (estável desde 97), Firefox (estável desde 114, com flags em algumas versões), Safari (atrasado, parcial em 18.x). Cobertura ~85% de usuários globalmente',
      'Apenas Safari',
      '100% de cobertura',
    ],
    correct: 1,
    explanation: 'WebTransport entrou em Chrome em 2022 (v97), Firefox em 2023 (v114). Safari foi o último — suporte parcial em 2025. Em maio/2026, ~85% de cobertura global. Fallback para WebSocket ainda é prudente para apps com base ampla.',
  },
  {
    question: 'Por que QUIC elimina head-of-line blocking?',
    options: [
      'Porque é mais rápido',
      'Em TCP, um pacote perdido bloqueia TODOS os bytes posteriores (mesmo de outros streams multiplexados em HTTP/2). QUIC implementa streams independentes na camada de transporte — perda em um stream não afeta outros',
      'Porque usa criptografia',
      'Porque tem cabeçalhos menores',
    ],
    correct: 1,
    explanation: 'HOL blocking foi a razão pela qual HTTP/2 multiplexado ainda sofria em redes com perda. QUIC resolve estruturalmente — cada stream tem state próprio, perda isolada. Em rede 3% loss, ganho real medido por engenheiros de Cloudflare/Google: 20-30% melhor.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="webtransport-http3"
      title="WebTransport sobre HTTP/3: o sucessor do WebSocket"
      icon="🚀"
      xp={65}
      readTime={13}
      trailName="Browser & Web Internals Profundo"
      trailColor={accent}
      nextSlug="view-transitions-api"
      nextTitle="View Transitions API"
      quiz={quiz}
    >
      <Section title="Por que WebSocket finalmente vai aposentar" accent={accent}>
        <p className="text-sm leading-6">
          WebSocket nasceu em 2011 (RFC 6455). Resolveu o problema da época: full-duplex sobre TCP. Mas hoje, em conexões com perda real (mobile, Wi-Fi corporativo), WebSocket sofre de <b>head-of-line blocking</b>: um pacote TCP perdido trava todos os bytes posteriores, mesmo que sejam mensagens lógicas independentes. WebTransport, sobre QUIC, resolve estruturalmente.
        </p>
        <Callout tone="info">
          Em 2026 WebSocket continua na maioria das aplicações por inércia e fallback. WebTransport ganha onde latência sob perda importa: games, edição colaborativa, sensores, live audio.
        </Callout>
      </Section>

      <Section title="QUIC em 30 segundos" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Sobre UDP', v: 'Não TCP — QUIC implementa reliability + ordering em userspace' },
            { k: 'Criptografia obrigatória', v: 'TLS 1.3 integrado (não é uma layer separada)' },
            { k: 'Streams independentes', v: 'Múltiplos streams na mesma conexão, sem HOL' },
            { k: '0-RTT', v: 'Reconexões podem enviar dados no primeiro pacote' },
            { k: 'Connection migration', v: 'Troca de Wi-Fi → 4G sem reconectar (connection ID)' },
            { k: 'HTTP/3', v: 'HTTP que roda sobre QUIC' },
          ]}
        />
      </Section>

      <Section title="As primitivas do WebTransport" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Primitiva', 'Característica', 'Uso típico']}
          rows={[
            ['Unidirectional Stream', 'Ordenado, reliable, server→client OU client→server', 'Upload de arquivo, log stream'],
            ['Bidirectional Stream', 'Ordenado, reliable, bidirecional', 'Substitui WebSocket'],
            ['Datagram', 'Unordered, unreliable, fire-and-forget', 'Posição em jogo, live audio'],
          ]}
        />
      </Section>

      <Section title="Código mínimo (client)" accent={accent}>
        <CodeBlock lang="typescript">{`// 1. Abrir conexão
const transport = new WebTransport('https://example.com:4433/wt');
await transport.ready;

// 2. Bidi stream (substitui WebSocket)
const stream = await transport.createBidirectionalStream();
const writer = stream.writable.getWriter();
const reader = stream.readable.getReader();

await writer.write(new TextEncoder().encode('hello'));

// Loop de leitura
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  console.log('recv:', new TextDecoder().decode(value));
}

// 3. Datagrams (unreliable, low-latency)
const dgWriter = transport.datagrams.writable.getWriter();
await dgWriter.write(new Uint8Array([1, 2, 3]));

// 4. Receber datagrams
const dgReader = transport.datagrams.readable.getReader();
const { value } = await dgReader.read();
// value é Uint8Array — sem garantia de ordem ou entrega`}</CodeBlock>
      </Section>

      <Section title="Server-side em 2026" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Stack', 'Linguagem', 'Maturidade']}
          rows={[
            ['quiche (Cloudflare)', 'Rust', 'Production — usado pelo próprio Cloudflare'],
            ['quic-go', 'Go', 'Maduro — usado por Caddy, Traefik'],
            ['msquic (Microsoft)', 'C++', 'Production em Azure/Windows'],
            ['Aioquic', 'Python', 'Bom para protótipos/testes'],
            ['Node.js webtransport (nodejs/http3)', 'Node', 'Experimental em maio/2026'],
            ['Deno', 'TS', 'Suporte nativo via Hyper (Rust under)'],
          ]}
        />
      </Section>

      <Section title="Quando trocar WebSocket por WebTransport" accent={accent}>
        <FlowDiagram
          title="Critérios de decisão"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '🎮', label: 'Game / colaboração realtime', desc: 'Datagrams + streams = stack ideal' },
            { icon: '📊', label: 'Telemetria de alta frequência', desc: 'Datagrams reduzem custo de framing' },
            { icon: '📱', label: 'Mobile com troca de rede', desc: 'Connection migration evita reconectar' },
            { icon: '🎙️', label: 'Audio/video low-latency complementar', desc: 'Datagrams para metadata em call WebRTC' },
            { icon: '🐢', label: 'Chat simples / app interno', desc: 'WebSocket continua suficiente' },
            { icon: '🌐', label: 'App com cobertura ampla legado', desc: 'WebSocket + fallback (não migre por hype)' },
          ]}
        />
      </Section>

      <Section title="Pitfalls em produção" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Suporte em proxies corporativos', v: 'Alguns proxies não falam HTTP/3. Fallback para WebSocket é prudente.' },
            { k: 'Debugging mais difícil', v: 'Wireshark precisa de chaves TLS para descriptografar QUIC. Use logging estruturado.' },
            { k: 'Certificate pinning', v: 'WebTransport browser permite restrição por certificate hash (serverCertificateHashes) — útil para PKI custom.' },
            { k: 'Não confundir com HTTP/3 normal', v: 'WebTransport é uma API específica, não "uso HTTP/3"' },
            { k: 'Backpressure manual', v: 'Streams ReadableStream/WritableStream — não esquece o backpressure' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
