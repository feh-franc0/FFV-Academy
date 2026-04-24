import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#1f6feb';

export const metadata = getModuleMetadata('tcp-handshake-congestao');

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o TCP three-way handshake usa 3 mensagens em vez de 2?',
    options: [
      'Por questões históricas — era o padrão da época',
      'Para estabelecer números de sequência iniciais (ISN) em ambas as direções. SYN do cliente: "meu ISN é X, vou receber de Y". SYN-ACK do servidor: "recebi X, meu ISN é Y, vou receber de X+1". ACK do cliente: "recebi Y, confirm X+1". Sem a terceira mensagem, o servidor nunca saberia se o cliente recebeu o SYN-ACK — e o cliente nunca poderia confirmar o ISN do servidor.',
      'Para dar tempo ao firewall de inspecionar a conexão',
      'TCP usa 3 mensagens para compatibilidade com IPv6',
    ],
    correct: 1,
    explanation: 'ISN (Initial Sequence Number) é aleatório por segurança — evita session hijacking e conflito com conexões antigas. TCP four-way termination (FIN/ACK/FIN/ACK) é separado porque o servidor pode ter dados pendentes antes de fechar. TIME_WAIT (2×MSL ≈ 4 minutos) garante que o último ACK chegou e que segmentos antigos expiraram. `ss -tn` mostra estados: ESTABLISHED, TIME_WAIT, CLOSE_WAIT.',
  },
  {
    question: 'O que é o algoritmo de slow start e por que a janela de congestionamento não cresce linearmente?',
    options: [
      'Slow start limita a velocidade para poupar energia do servidor',
      'Slow start começa com cwnd (congestion window) = 1 MSS e dobra a cada RTT até atingir ssthresh (slow start threshold). Depois entra em congestion avoidance: cresce +1 MSS por RTT (linear, mais conservador). O crescimento exponencial inicial não é "lento" — é o nome do algoritmo. A lógica: começar devagar para sondar a capacidade da rede sem sobrecarregá-la imediatamente.',
      'Slow start é ativado apenas em conexões com alto RTT (>100ms)',
      'Slow start só funciona com HTTP/1.1, não com HTTP/2',
    ],
    correct: 1,
    explanation: 'AIMD (Additive Increase, Multiplicative Decrease): ao detectar congestionamento (3 ACKs duplicados ou timeout), cwnd é cortado pela metade (ou para 1 em timeout). Isso cria a "dente de serra" característica do TCP. TCP Cubic (padrão Linux) usa função cúbica para crescer mais rápido em redes de alta largura de banda. BBR (Google, 2016) modela a largura de banda real em vez de reagir a perdas.',
  },
  {
    question: 'Qual a diferença entre fast retransmit e retransmissão por timeout?',
    options: [
      'Fast retransmit é mais lento que timeout porque envia confirmação extra',
      'Retransmissão por timeout: aguarda RTO (Retransmission Timeout, ~1s inicial) antes de reenviar — lento, indica perda grave. Fast retransmit: ao receber 3 ACKs duplicados (receptor pede o mesmo byte 3 vezes), o remetente imediatamente reenvia sem esperar timeout. Detecta perda de segmento isolado muito mais rápido (~1 RTT vs 1 segundo).',
      'São a mesma coisa — diferentes nomes para o mesmo mecanismo',
      'Timeout retransmite apenas 1 segmento; fast retransmit reenvia todos',
    ],
    correct: 1,
    explanation: 'Cenário: segmentos 1,2,3,4,5 enviados. Segmento 2 perdido. Receptor recebe 1 (ACK=2), 3 (ACK=2 dup), 4 (ACK=2 dup), 5 (ACK=2 dup). Após 3 dups: fast retransmit envia segmento 2. Fast recovery mantém cwnd alto (não vai para slow start). SACK (Selective ACK) permite reportar o que foi recebido, evitando reenvio desnecessário de segmentos que chegaram depois do perdido.',
  },
];

export default function TcpHandshakeCongestaoPage() {
  return (
    <ModuleLayout
      slug="tcp-handshake-congestao"
      title="TCP de verdade: handshake, congestion control, retransmissão"
      icon="🤝"
      xp={85}
      readTime={17}
      trailName="Redes & Web"
      trailColor="#1f6feb"
      nextSlug="udp-quic-http3"
      nextTitle="UDP, QUIC e HTTP/3: por que Google jogou TCP fora"
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
        TCP entrega dados de forma confiável sobre IP — que não garante entrega, ordem ou integridade. Entender como TCP faz isso (handshake, números de sequência, janela deslizante, controle de congestionamento) explica por que a web funciona e onde ela é lenta.
      </p>

      <Section accent={accent} title="Three-way handshake e estados de conexão">
        <CodeBlock>{`# TCP Three-Way Handshake:
# Cliente                    Servidor
#   |----SYN seq=X----------->|    SYN_SENT → SYN_RECEIVED
#   |<---SYN-ACK seq=Y,ack=X+1|
#   |----ACK ack=Y+1---------->|    ESTABLISHED (ambos)

# SYN = Synchronize: "vou começar com seq número X"
# ACK = Acknowledge: "recebi até seq número X, aguardando X+1"
# ISN (Initial Sequence Number): aleatório para evitar session hijacking

import socket
import time

# Medir latência do handshake:
def tcp_handshake_time(host: str, port: int) -> float:
    inicio = time.perf_counter()
    with socket.create_connection((host, port), timeout=5):
        handshake_ms = (time.perf_counter() - inicio) * 1000
    return handshake_ms

# ESTADOS TCP (máquina de estados):
# LISTEN     → servidor aguardando conexão
# SYN_SENT   → cliente enviou SYN
# SYN_RCVD   → servidor recebeu SYN, enviou SYN-ACK
# ESTABLISHED → conexão ativa, dados podem fluir
# FIN_WAIT_1  → iniciou encerramento
# TIME_WAIT   → aguarda 2×MSL (Maximum Segment Lifetime ≈ 2min) para
#               garantir que ACK final chegou

# Ver estados das conexões:
# ss -tn                ← sockets TCP, sem resolver nomes
# ss -tn state ESTABLISHED
# ss -tn state TIME_WAIT | wc -l   ← muitas TIME_WAIT = muitas conexões curtas

# Four-way termination:
# Ativo                    Passivo
#  |----FIN---------------->|    FIN_WAIT_1
#  |<---ACK-----------------|    CLOSE_WAIT
#  |<---FIN-----------------|    LAST_ACK
#  |----ACK---------------->|    TIME_WAIT → CLOSED
# (servidor pode ter dados para enviar antes do FIN — por isso 4 mensagens)

# Otimização: TCP Fast Open (TFO)
# Envia dados junto com o SYN, elimina 1 RTT na primeira conexão
# Habilitado com: sysctl net.ipv4.tcp_fastopen=3`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Números de sequência, janela e entrega confiável">
        <CodeBlock>{`# Janela deslizante (sliding window): permite enviar múltiplos segmentos
# sem esperar ACK de cada um — mantém o pipe cheio

# send window = min(rwnd, cwnd)
# rwnd = receiver window (capacidade do receptor)
# cwnd = congestion window (estimativa da rede)

# Receive window (rwnd): campo no header TCP (16 bits, máx 65535 bytes)
# Com window scaling (RFC 7323): até 1GB (shift de até 14 bits)

# Exemplo: RTT = 50ms, banda = 100Mbps
# Bandwidth-Delay Product (BDP) = RTT × banda = 0.05s × 100Mbps = 5Mbit = 625KB
# Para utilizar 100% da banda, a janela deve ser ≥ 625KB
# Janela padrão de 65KB → utilização máxima: 65KB/625KB ≈ 10%
# → window scaling NECESSÁRIO para links de alta velocidade

# Verificar configurações de janela no Linux:
# sysctl net.ipv4.tcp_rmem   → [min, default, max] receive buffer
# sysctl net.ipv4.tcp_wmem   → [min, default, max] send buffer
# sysctl net.ipv4.tcp_window_scaling   → deve ser 1 (habilitado)

# SACK (Selective ACK): informa exatamente quais segmentos chegaram
# Sem SACK: perda de 1 segmento → reenvia tudo depois dele
# Com SACK: reenvia só o perdido
# sysctl net.ipv4.tcp_sack   → deve ser 1

# Números de sequência — como detectar reordenação e duplicatas:
# seq=1000, len=1000 → cobre bytes 1000-1999
# seq=2000, len=500  → cobre bytes 2000-2499
# Se chegar seq=2000 antes de seq=1000: receptor bufferiza, ACK=1000 (não avança)
# Quando seq=1000 chega: receptor entrega ambos, ACK=2500`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Controle de congestionamento">
        <ComparisonTable
          headers={['Algoritmo', 'Crescimento', 'Reação à perda', 'Uso']}
          rows={[
            ['Tahoe', 'Slow start + AIMD', 'cwnd=1, slow start', 'Legado'],
            ['Reno', 'Slow start + AIMD', 'Fast recovery (halve)', 'Legado'],
            ['CUBIC', 'Função cúbica do tempo', 'Halve cwnd', 'Default Linux'],
            ['BBR v1', 'Modelo de banda+RTT', 'Não reage a perda direta', 'YouTube/Google'],
            ['BBR v2', 'Modelo + perda', 'Balanceado', 'Padrão crescente'],
            ['QUIC CC', 'Pluggable (CUBIC/BBR)', 'Por stream', 'HTTP/3'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Slow start e Congestion Avoidance — simulação conceitual:

def simulate_tcp_cubic(rtts: int = 20) -> list:
    """Simula crescimento simplificado do cwnd TCP Cubic."""
    cwnd = 1      # começa em 1 MSS (Maximum Segment Size ≈ 1460 bytes)
    ssthresh = 32 # slow start threshold (initial)
    history = []

    for rtt in range(rtts):
        history.append(cwnd)

        if cwnd < ssthresh:
            cwnd *= 2  # slow start: dobra por RTT (exponencial)
        else:
            cwnd += 1  # congestion avoidance: +1 por RTT (linear)

        # Simulando perda no RTT 12 (3 ACKs duplicados):
        if rtt == 12:
            ssthresh = max(cwnd // 2, 2)
            cwnd = ssthresh  # fast recovery: halve
            print(f"RTT {rtt}: Perda! ssthresh={ssthresh}, cwnd={cwnd}")

    return history

history = simulate_tcp_cubic()
for i, w in enumerate(history):
    bar = "█" * min(w, 64)
    print(f"RTT {i:2d}: cwnd={w:3d} {bar}")

# Verificar variante em uso:
# sysctl net.ipv4.tcp_congestion_control   → cubic (padrão)
# ss -tin dst 8.8.8.8 | grep cubic        ← mostra por conexão
# sysctl net.ipv4.tcp_available_congestion_control

# BBR (Bottleneck Bandwidth and RTT):
# Mede: max(bandwidth_samples) e min(RTT_samples)
# Modelo: a rede pode suportar max_bw na latência min_RTT
# Não reage a perda (considera ruído, não congestionamento)
# Usado por: YouTube, Google Search, Cloudflare em alguns casos`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Retransmissão: timeout vs fast retransmit">
        <CodeBlock>{`# RTO (Retransmission Timeout): calculado dinamicamente
# RTO = SRTT + 4 × RTTVAR
# SRTT = Smoothed RTT (média exponencialmente ponderada)
# RTTVAR = variância do RTT
# Backoff exponencial: RTO dobra a cada retransmissão falha

# Fast Retransmit (RFC 5681):
# 3 ACKs duplicados → reenvia imediatamente sem esperar RTO
# Indica segmento perdido isolado (os posteriores chegaram)

# Timeline do fast retransmit:
# T=0ms:  envia seg 1,2,3,4,5
# T=50ms: seg 1 chega  → ACK 2
# T=50ms: seg 2 PERDIDO
# T=55ms: seg 3 chega  → ACK 2 (dup #1)
# T=60ms: seg 4 chega  → ACK 2 (dup #2)
# T=65ms: seg 5 chega  → ACK 2 (dup #3) ← fast retransmit! reenvia seg 2
# T=115ms: seg 2 entregue → ACK 6 (avança para o final)
# Total: ~115ms vs ~1000ms de timeout!

import socket
import time
import struct

def get_tcp_info(sock: socket.socket) -> dict:
    """Lê métricas TCP do kernel via TCP_INFO (Linux)."""
    # TCP_INFO: struct tcp_info do kernel
    TCP_INFO = 11
    fmt = "BBBBBBBBIIIIIIIIIIIII"  # simplificado
    data = sock.getsockopt(socket.IPPROTO_TCP, TCP_INFO, 200)
    fields = struct.unpack(fmt, data[:struct.calcsize(fmt)])
    return {
        "state": fields[0],
        "retrans": fields[4],      # retransmissões
        "rtt_us": fields[16],      # RTT em microssegundos
        "rttvar_us": fields[17],   # variância do RTT
        "snd_cwnd": fields[14],    # janela de congestionamento
    }

# Uso:
# sock = socket.create_connection(("example.com", 80))
# info = get_tcp_info(sock)
# print(f"RTT: {info['rtt_us']/1000:.2f}ms, cwnd: {info['snd_cwnd']} MSS")

# Nagle Algorithm: agrega pequenos writes em um segmento
# Ativo por padrão → aumenta latência para protocolos interativos
# Desativar para aplicações de baixa latência (jogos, telnet, SSH):
# sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Modelo mental:</strong> TCP garante entrega confiável com três mecanismos — números de sequência (detecta perda e reordenação), ACKs cumulativos + retransmissão (reentrega perdidos), e janela deslizante (mantém o pipe cheio). Controle de congestionamento (CUBIC/BBR) sonda a capacidade da rede gradualmente. Fast retransmit detecta perdas isoladas em ~1 RTT em vez de esperar ~1s de timeout. TCP_NODELAY desativa Nagle para latência mínima em protocolos interativos.
      </Callout>

      <Callout>
        Próximo: <strong>UDP, QUIC e HTTP/3</strong> — por que Google construiu um protocolo de transporte do zero em cima de UDP.
      </Callout>
    </div>
  );
}
