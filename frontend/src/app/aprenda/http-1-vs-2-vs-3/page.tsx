import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#1f6feb';

export const metadata = getModuleMetadata('http-1-vs-2-vs-3');

const quiz: QuizQuestion[] = [
  {
    question: 'Por que HTTP/1.1 com pipelining ainda é lento e browsers não o habilitam?',
    options: [
      'Pipelining foi removido do HTTP/1.1 por questões de segurança',
      'Pipelining permite enviar múltiplos requests sem esperar respostas, mas as respostas DEVEM voltar na mesma ordem. Se request 2 (CSS) é rápido mas request 1 (HTML grande) ainda está processando, CSS espera — head-of-line blocking na camada HTTP. Bugs de implementação em proxies e servidores levaram browsers a desabilitar por padrão. HTTP/2 resolve de verdade com multiplexing por stream ID.',
      'Pipelining só funciona com HTTPS, não com HTTP',
      'Pipelining exige que o servidor suporte HTTP/2',
    ],
    correct: 1,
    explanation: 'HTTP/1.0: uma conexão por request (TCP re-handshake para cada request). HTTP/1.1: keep-alive por padrão (reutiliza conexão), mas requests são serializados. Workaround real: browsers abrem 6 conexões TCP por origem (domain sharding explorava isso com subdomínios). HTTP/2 elimina a necessidade de domain sharding e bundling de recursos.',
  },
  {
    question: 'O que é HPACK e por que header compression importa tanto no HTTP/2?',
    options: [
      'HPACK comprime apenas o body do response, não os headers',
      'Headers HTTP se repetem em cada request: User-Agent, Accept, Cookie, Authorization — iguais em todos os 100+ requests de uma página. HPACK mantém uma tabela de headers vistos (estática + dinâmica). Headers repetidos viram referência de 1-2 bytes em vez de 200+ bytes. Cookie de sessão (tipicamente 300-500 bytes) vira 1 byte. Redução de 80-90% no tamanho dos headers — crítico em mobile.',
      'HPACK comprime apenas o header Content-Encoding',
      'HPACK é opcional no HTTP/2 e não é usado por padrão',
    ],
    correct: 1,
    explanation: 'HPACK (RFC 7541) usa duas tabelas: estática (61 headers comuns pré-definidos como ":method GET" = index 2) e dinâmica (headers vistos na conexão, adicionados ao longo do tempo). Huffman coding comprime os valores dos headers. QPACK (HTTP/3) é a versão para QUIC — adapta para streams out-of-order sem bloquear a tabela dinâmica.',
  },
  {
    question: 'O que é server push no HTTP/2 e por que raramente vale a pena usá-lo?',
    options: [
      'Server push é a mesma coisa que WebSocket — comunicação bidirecional',
      'Server push: servidor envia recursos que o cliente ainda não pediu (CSS, JS junto com HTML), antes que o cliente descubra que precisa deles via parser. Na prática: o servidor não sabe o que está no cache do browser — pode enviar o que já está em cache (desperdiçando banda). Implementação complexa, sem ganho mensurável em produção. Resource hints (<link rel="preload">) são mais simples e eficazes.',
      'Server push é o mecanismo que HTTP/2 usa para WebSocket',
      'Server push só funciona com HTTP/2 mas foi removido no HTTP/3',
    ],
    correct: 1,
    explanation: 'Server push foi oficialmente removido do Chrome em 2022 e do HTTP/3/QUIC por design. A alternativa que funciona: 103 Early Hints (RFC 8297) — resposta intermediária antes do 200, contendo Link headers para preload. Cloudflare e Fastly suportam 103 Early Hints. O browser cancela pushes com RST_STREAM se já tem o recurso em cache.',
  },
];

export default function Http1Vs2Vs3Page() {
  return (
    <ModuleLayout
      slug="http-1-vs-2-vs-3"
      title="HTTP/1.1, /2, /3: multiplexing, HPACK, server push"
      icon="🔄"
      xp={75}
      readTime={15}
      trailName="Redes & Web"
      trailColor="#1f6feb"
      nextSlug="tls-handshake-detalhe"
      nextTitle="TLS 1.3: handshake, chaves, certificados, SNI, ALPN"
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
        Cada versão do HTTP foi criada para resolver gargalos específicos da anterior. HTTP/1.1 adicionou keep-alive mas serializou requests. HTTP/2 trouxe multiplexing real mas herdou o HoL blocking do TCP. HTTP/3 resolveu isso mudando o protocolo de transporte.
      </p>

      <Section accent={accent} title="Evolução do HTTP: o que mudou em cada versão">
        <ComparisonTable
          headers={['Característica', 'HTTP/1.0', 'HTTP/1.1', 'HTTP/2', 'HTTP/3']}
          rows={[
            ['Conexões por origem', '1 por request', '6 (keep-alive)', '1 (mux)', '1 (QUIC)'],
            ['Multiplexing', 'Não', 'Pipelining (defeituoso)', 'Sim (streams)', 'Sim (QUIC streams)'],
            ['Header compression', 'Não', 'Não', 'HPACK', 'QPACK'],
            ['HoL blocking', 'Severo', 'Moderado', 'Parcial (TCP)', 'Não'],
            ['Transporte', 'TCP', 'TCP', 'TCP+TLS', 'QUIC (UDP+TLS)'],
            ['Server push', 'Não', 'Não', 'Sim (deprecado)', 'Não'],
            ['Formato', 'Texto', 'Texto', 'Binário', 'Binário'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="HTTP/1.1: keep-alive e pipelining">
        <CodeBlock>{`import socket

# HTTP/1.0: uma conexão TCP por request
# HTTP/1.1: Connection: keep-alive por padrão

# Request/Response HTTP/1.1 (formato texto):
request = (
    "GET / HTTP/1.1\\r\\n"
    "Host: example.com\\r\\n"
    "Connection: keep-alive\\r\\n"
    "Accept: text/html\\r\\n"
    "\\r\\n"
)

# Problema: requests serializados em uma conexão
# Request 1 → Response 1 → Request 2 → Response 2
# Latência: N_requests × RTT (sequencial)

# Workarounds da era HTTP/1.1:
# 1. Domain sharding: img1.example.com, img2.example.com
#    → cada domínio = 6 conexões paralelas
#    → overhead: múltiplos DNS lookups + TLS handshakes

# 2. Resource bundling (anti-pattern moderno):
#    concat all CSS → 1 request (mas invalida cache de tudo se 1 linha muda)
#    sprite images → 1 request para ícones
#    → HTTP/2 tornou isso desnecessário

# 3. Inline crítico: CSS/JS inline no HTML para recursos acima da dobra

# Pipelining: envia múltiplos requests sem esperar resposta
# Problema: responses DEVEM voltar em ordem (head-of-line blocking)
# Se request 1 demora 500ms e request 2 demora 10ms:
# request 2 aguarda request 1 terminar
# Bugs em proxies intermediários → browsers desabilitaram

# Verificar versão HTTP:
# curl -I --http1.1 https://example.com | head -1
# curl -I --http2   https://example.com | head -1
# curl -I --http3   https://cloudflare.com | head -1`}</CodeBlock>
      </Section>

      <Section accent={accent} title="HTTP/2: multiplexing e HPACK">
        <CodeBlock>{`# HTTP/2: protocolo binário, não texto
# Frame types: DATA, HEADERS, PRIORITY, RST_STREAM, SETTINGS,
#              PUSH_PROMISE, PING, GOAWAY, WINDOW_UPDATE, CONTINUATION

# Streams: cada request/response é um stream com ID (cliente: ímpar, servidor: par)
# Stream multiplexing: frames de streams diferentes intercalados na conexão

# HPACK — header compression:
# Tabela estática (61 entradas padrão):
# 1: :authority
# 2: :method GET        ← índice 2 em vez de "GET" (7 bytes)
# 3: :method POST
# 7: :scheme https
# 8: :status 200        ← índice 8 em vez de "200 OK" (6 bytes)

# Tabela dinâmica (headers vistos na conexão):
# Após ver "Authorization: Bearer abc123" pela 1ª vez → entra na tabela dinâmica
# Próximas requests: referência ao índice (1-2 bytes)

# Exemplo de economia com HPACK:
# Sem compressão:
headers_sem_compressao = {
    ":method": "GET",         # 14 bytes
    ":path": "/api/users",    # 20 bytes
    "host": "api.example.com",# 24 bytes
    "user-agent": "Mozilla/5.0 (compatible)", # 45 bytes
    "cookie": "session=abc123def456; pref=dark; _ga=GA1.2.123",  # 70 bytes
    "accept": "application/json", # 27 bytes
    "authorization": "Bearer eyJhbGciOiJSUzI1NiJ9...",  # 200+ bytes
}
# Total: ~400 bytes por request × 100 requests = 40 KB só de headers

# Com HPACK (após 1ª request):
# method, path, host → índices: ~3 bytes cada
# user-agent → índice da tabela dinâmica: 2 bytes
# cookie → índice: 2 bytes
# authorization → índice: 2 bytes
# Total: ~15 bytes por request × 100 requests = 1.5 KB (96% menor)

# HTTP/2 em Python com httpx:
import httpx

async def http2_example():
    async with httpx.AsyncClient(http2=True) as client:
        # Múltiplos requests simultâneos no mesmo TCP connection:
        resps = await asyncio.gather(
            client.get("https://httpbin.org/get?n=1"),
            client.get("https://httpbin.org/get?n=2"),
            client.get("https://httpbin.org/get?n=3"),
        )
        for r in resps:
            print(r.http_version, r.status_code)

# Server Push (HTTP/2, agora deprecado):
# Link: </style.css>; rel=preload; as=style   ← alternativa moderna (funciona!)
# HTTP 103 Early Hints — ainda melhor que push`}</CodeBlock>
      </Section>

      <Section accent={accent} title="HTTP/3: sobre QUIC">
        <CodeBlock>{`# HTTP/3 (RFC 9114): HTTP/2 sobre QUIC em vez de TCP+TLS
# QUIC = UDP + TLS 1.3 + multiplexing + flow control

# Diferenças HTTP/2 → HTTP/3:
# HoL blocking: eliminado (QUIC streams independentes)
# Header compression: HPACK → QPACK (adapta para out-of-order)
# Server push: removido por design
# Handshake: TCP+TLS 1.3 (2 RTT) → QUIC (1 RTT, 0 RTT para reconexão)
# Mobilidade: muda de IP sem reconectar (Connection ID)

# QPACK vs HPACK:
# HPACK: tabela dinâmica bloqueante (stream 0 deve ordenar updates)
# QPACK: tabela dinâmica não-bloqueante (encoder/decoder streams separados)
# Por quê: QUIC entrega frames out-of-order entre streams diferentes

# Verificar adoção HTTP/3:
# curl --http3 -I https://cloudflare.com 2>/dev/null | head -1
# curl --http3 -I https://youtube.com 2>/dev/null | head -1
# curl --http3 -I https://facebook.com 2>/dev/null | head -1

# Alt-Svc header: como servidores anunciam HTTP/3:
# Alt-Svc: h3=":443"; ma=86400
# Significa: "suporto HTTP/3 na porta 443, válido por 86400s"
# Browser usa HTTP/2 na 1ª visita, HTTP/3 nas seguintes

# Performance comparada (Cloudflare measurements):
# HTTP/1.1: 100% (baseline)
# HTTP/2:   60% de requests completados em 2s (vs 45% do 1.1)
# HTTP/3:   75% de requests completados em 2s
# Ganho maior em: redes móveis, alta latência, packet loss > 0.1%

# Adoção (2025): ~30% dos sites suportam HTTP/3
# CDNs (Cloudflare, Fastly, Akamai) habilitam automaticamente
# Nginx: compilar com --with-http_v3_module (ou pacote nginx-plus)
# Caddy: HTTP/3 por padrão (zero config)

# Verificar suporte sem curl:
# Chrome DevTools → Network → Protocol column
# https://www.http3check.net/`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Resumo prático:</strong> HTTP/1.1 com keep-alive ainda roda em 70%+ da web interna. HTTP/2 é obrigatório em APIs públicas de alto tráfego — HPACK comprime headers 90%, multiplexing elimina domain sharding. HTTP/3 ganha em condições de rede adversas (mobile, alta latência, pacote loss). Alt-Svc anuncia suporte HTTP/3 automaticamente — CDNs como Cloudflare o habilitam por padrão. Server push: esqueça; use Link preload ou 103 Early Hints.
      </Callout>

      <Callout>
        Próximo: <strong>TLS 1.3</strong> — handshake, como as chaves são negociadas, certificados, SNI e ALPN.
      </Callout>
    </div>
  );
}
