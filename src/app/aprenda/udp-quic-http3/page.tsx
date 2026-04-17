import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#1f6feb';

export const metadata: Metadata = {
  title: 'UDP, QUIC e HTTP/3: por que Google jogou TCP fora — FFV Academy',
  description: 'UDP sem garantias e quando é melhor. QUIC resolve head-of-line blocking, 0-RTT e mobilidade de IP. HTTP/3 sobre QUIC: o futuro da web.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que streaming de vídeo ao vivo usa UDP em vez de TCP?',
    options: [
      'UDP é mais rápido porque não precisa de processamento de protocolo',
      'Para vídeo ao vivo, um frame atrasado é inútil — é melhor descartar e mostrar o próximo. TCP retransmitiria o frame perdido, atrasando todos os frames seguintes (head-of-line blocking), causando congelamento visível. UDP entrega o que chegou, quando chegou. A aplicação (RTP/WebRTC) implementa apenas o que precisa: sequenciamento para detecção de perda, nenhuma retransmissão.',
      'UDP usa menos bateria em dispositivos móveis',
      'TCP não funciona em redes Wi-Fi para streaming',
    ],
    correct: 1,
    explanation: 'RTP (Real-time Transport Protocol) roda sobre UDP: adiciona timestamp e número de sequência sem retransmissão. RTCP (companion) reporta estatísticas de qualidade. WebRTC usa DTLS-SRTP sobre UDP. Casos de uso de UDP: jogos online (posição do personagem — dado velho é inútil), DNS (query simples, retransmite na camada de aplicação), VoIP, streaming ao vivo.',
  },
  {
    question: 'O que é head-of-line blocking no TCP e como QUIC resolve isso?',
    options: [
      'Head-of-line blocking é um problema de hardware dos roteadores',
      'No TCP, todos os dados de uma conexão são um stream único e ordenado. Se o segmento 2 se perde, os segmentos 3,4,5... aguardam no buffer mesmo que pertençam a recursos independentes (CSS, JS, imagens). HTTP/2 multiplexou streams sobre uma única conexão TCP — mas o HoL blocking do TCP bloqueia TODOS os streams por um único pacote perdido. QUIC implementa streams independentes sobre UDP — perda em stream A não bloqueia stream B.',
      'Head-of-line blocking só afeta HTTP/1.1, não HTTP/2',
      'QUIC resolve HoL blocking usando compressão mais eficiente',
    ],
    correct: 1,
    explanation: 'HTTP/2 resolve HoL blocking da camada de aplicação (request/response), mas não o HoL blocking do TCP (transporte). Em redes com 1% de perda de pacotes, HTTP/2 pode ser mais lento que HTTP/1.1 (vários pipelines) justamente por isso. QUIC resolve o HoL blocking no nível de transporte — cada stream tem controle de fluxo independente. Medições Google: QUIC reduz latência de vídeo em ~30% em redes ruins.',
  },
  {
    question: 'O que é 0-RTT connection resumption do QUIC e qual a diferença de TLS 1.3 0-RTT?',
    options: [
      '0-RTT significa que a conexão é estabelecida sem nenhuma latência',
      'QUIC 0-RTT: ao reconectar para um servidor conhecido, envia dados da aplicação junto com o primeiro pacote QUIC (sem esperar handshake). Usa chave derivada de sessão anterior (session ticket/resumption). TLS 1.3 tem 0-RTT similar mas sobre TCP, que ainda exige 1 RTT de handshake TCP. QUIC elimina tanto o handshake TCP quanto parte do handshake QUIC/TLS — 0 RTT total para reconexão.',
      '0-RTT é exclusivo do QUIC e não existe em TLS 1.3',
      '0-RTT elimina o handshake TLS permanentemente após a primeira conexão',
    ],
    correct: 1,
    explanation: 'Trade-off de segurança do 0-RTT: dados 0-RTT são vulneráveis a ataques de replay (o servidor não pode distinguir retransmissão de replay). Por isso 0-RTT é seguro apenas para operações idempotentes (GET, não POST com side-effects). Servidores podem limitar quais endpoints aceitam 0-RTT. QUIC também resolve mobilidade de IP: ao mudar de Wi-Fi para 4G, a conexão QUIC continua com o mesmo Connection ID (sem re-handshake), algo impossível com TCP.',
  },
];

export default function UdpQuicHttp3Page() {
  return (
    <ModuleLayout
      slug="udp-quic-http3"
      title="UDP, QUIC e HTTP/3: por que Google jogou TCP fora"
      icon="⚡"
      xp={70}
      readTime={14}
      trailName="Redes & Web"
      trailColor="#1f6feb"
      nextSlug="http-1-vs-2-vs-3"
      nextTitle="HTTP/1.1, /2, /3: multiplexing, HPACK, server push"
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
        UDP é o protocolo sem garantias — sem conexão, sem ordem, sem retransmissão. Isso que o torna ideal para tempo real. QUIC reimplementa as partes boas do TCP em cima do UDP, sem carregar suas limitações de décadas. HTTP/3 é a versão da web sobre QUIC.
      </p>

      <Section accent={accent} title="UDP: o protocolo sem garantias">
        <CodeBlock>{`import socket
import time

# UDP: User Datagram Protocol
# Header mínimo: src_port(2) + dst_port(2) + length(2) + checksum(2) = 8 bytes
# TCP header: 20+ bytes. UDP: 8 bytes.
# Sem: conexão, confirmação, ordering, controle de fluxo, congestionamento

# Servidor UDP simples:
def udp_server(host: str = "0.0.0.0", port: int = 5005):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((host, port))
    print(f"UDP server ouvindo em {host}:{port}")
    while True:
        data, addr = sock.recvfrom(65535)  # máximo de um datagrama UDP
        print(f"De {addr}: {data.decode()}")
        sock.sendto(b"ok", addr)

# Cliente UDP simples:
def udp_client(host: str, port: int, message: str):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(1.0)
    sock.sendto(message.encode(), (host, port))
    try:
        resp, _ = sock.recvfrom(1024)
        return resp.decode()
    except socket.timeout:
        return None  # datagrama perdido — sem retransmissão automática

# DNS usa UDP (porta 53):
# Query simples (< 512 bytes) → UDP
# Respostas grandes (DNSSEC) → TCP (truncated flag indica necessidade)
# dig usa UDP por padrão; dig +tcp força TCP

# Datagramas UDP não garantem:
# 1. Entrega (pode ser descartado por router/firewall)
# 2. Ordem (seg 1 pode chegar depois de seg 2)
# 3. Integridade (checksum optional no IPv4 — pode ser zerado)
# 4. Unicidade (pode duplicar em retransmissões de L2)

# Casos onde UDP ganha:
# - RTT único (DNS, DHCP) — mais rápido que TCP handshake
# - Dados em tempo real (voz, vídeo) — dado velho inútil
# - Broadcast/multicast (TCP é ponto-a-ponto apenas)
# - Jogos online (posição, inputs — dado velho descartável)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="QUIC: TCP reimaginado sobre UDP">
        <ComparisonTable
          headers={['Característica', 'TCP+TLS', 'QUIC (UDP)']}
          rows={[
            ['Handshake nova conexão', '3 RTTs (TCP+TLS 1.3)', '1 RTT'],
            ['Handshake reconexão', '1 RTT (TLS session)', '0 RTT'],
            ['Múltiplos streams', 'Não (1 stream por conexão)', 'Sim (independentes)'],
            ['HoL blocking', 'Sim (transporte)', 'Não (por stream)'],
            ['Mobilidade de IP', 'Não (quebra conexão)', 'Sim (Connection ID)'],
            ['Header encryption', 'Não', 'Sim (IP+porta apenas visíveis)'],
            ['User-space stack', 'Não (kernel)', 'Sim (flexível, iterável)'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# QUIC (RFC 9000): protocolo de transporte multiplexado e seguro
# Implementado em userspace — facilita evolução sem mudança de kernel

# Estrutura de um pacote QUIC:
# [UDP header 8B] [QUIC header: Connection ID + packet num + version] [frames]
# Frames QUIC dentro do payload (criptografados):
# - STREAM: dados de um stream específico
# - ACK: confirmação de pacotes recebidos
# - CRYPTO: handshake TLS 1.3
# - RESET_STREAM: cancela um stream individual
# - CONNECTION_CLOSE: fecha a conexão

# Streams independentes: a chave do HoL blocking fix
# Stream 1: HTML
# Stream 2: CSS      ← se perda de pacote QUIC aqui
# Stream 3: JS       ← este stream NÃO é bloqueado
# Stream 4: imagem   ← este stream NÃO é bloqueado
# Diferente do TCP onde perda bloqueia TODOS os dados subsequentes

# Connection ID: permite mobilidade de IP
# TCP identifica conexão por (src_ip, src_port, dst_ip, dst_port)
# Mudar de Wi-Fi para 4G → src_ip muda → conexão TCP quebra
# QUIC usa Connection ID opaco (64 bits) — não muda com IP
# Celular muda de rede → QUIC continua sem re-handshake

# 0-RTT connection resumption:
# 1ª conexão: 1 RTT handshake. Servidor envia "session ticket" criptografado.
# 2ª conexão: cliente envia dados da aplicação COM o primeiro pacote QUIC.
# Servidor decripta session ticket → recupera chaves de sessão → decripta dados.
# Total: 0 RTTs adicionais de handshake (limitado a dados idempotentes)

# Implementações QUIC em Python:
# aioquic: https://github.com/aiortc/aioquic
# Exemplo de cliente HTTP/3:
# python -m aioquic.examples.http3_client https://quic.nginx.org/

# Verificar se site suporta QUIC/HTTP3:
# curl --http3 https://cloudflare.com -I
# chrome://net-internals/#quic (Chrome DevTools)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="UDP para tempo real: RTP e WebRTC">
        <CodeBlock>{`# RTP (Real-time Transport Protocol, RFC 3550):
# Roda sobre UDP. Adiciona apenas o que importa para mídia:
# - Sequence number (16 bits): detectar perda e reordenação
# - Timestamp: sincronização de playback (não wall clock)
# - SSRC: identifica a fonte de mídia
# NÃO adiciona: retransmissão, controle de congestionamento
# Controle de qualidade: RTCP (companion) reporta jitter, perda, RTT

import socket
import struct
import time

# Header RTP (12 bytes):
# V(2) P(1) X(1) CC(4) M(1) PT(7) | Sequence(16) | Timestamp(32) | SSRC(32)
def build_rtp_header(seq: int, timestamp: int, ssrc: int, payload_type: int = 96) -> bytes:
    """Constrói header RTP mínimo."""
    version = 0b10  # RTP version 2
    first_byte = (version << 6)  # sem padding, sem extensão, CC=0
    second_byte = payload_type & 0x7F  # PT sem marker
    return struct.pack("!BBHII", first_byte, second_byte, seq, timestamp, ssrc)

# WebRTC: P2P real-time usando DTLS-SRTP sobre UDP
# DTLS: TLS adaptado para datagramas (handles packet loss/reorder)
# SRTP: RTP com criptografia (DTLS negocia chaves)
# ICE: encontra o melhor caminho (direct UDP, STUN, TURN)

# ICE (Interactive Connectivity Establishment):
# 1. Gather candidates: endereço local, STUN (NAT reflexive), TURN (relay)
# 2. Connectivity check: testa cada par de candidatos
# 3. Nominate: escolhe o melhor caminho (preferência: direto > STUN > TURN)

# STUN (Session Traversal Utilities for NAT):
# Pergunta para servidor público: "qual é meu IP:porta externa?"
# Servidor responde com o IP:porta que o NAT mapeou

# TURN (Traversal Using Relays around NAT):
# Relay para casos onde conexão direta falha (NAT simétrico)
# Custo: tráfego passa pelo servidor relay

# Jitter buffer: compensa variação de latência (jitter)
# Atrasa reprodução em X ms para ter buffer de frames
# Trade-off: menor atraso vs maior conforto (sem glitches)
# WebRTC adapta o jitter buffer dinamicamente`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Modelo mental:</strong> UDP = enviar e esquecer (sem garantias, mas 8 bytes de overhead e zero latência de handshake). Ideal quando dado velho é inútil (vídeo ao vivo, jogos, DNS). QUIC = TCP reimaginado sobre UDP: 0-1 RTT de handshake, streams independentes (sem HoL blocking), mobilidade de IP (Connection ID), header criptografado, implementado em userspace. HTTP/3 roda sobre QUIC — já usado por 25%+ dos sites do mundo (Cloudflare, Google, Meta).
      </Callout>

      <Callout>
        Próximo: <strong>HTTP/1.1, /2, /3</strong> — como cada versão resolveu limitações da anterior e o que muda na prática.
      </Callout>
    </div>
  );
}
