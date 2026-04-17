import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#6e7681';

export const metadata: Metadata = {
  title: 'Tempo distribuído: NTP, clock skew, monotonic vs wall — FFV Academy',
  description: 'Por que servidores em datacenters divergem de tempo mesmo sincronizados. Wall clock vs monotonic clock. Lamport timestamps e Google TrueTime.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que usar time.time() para medir a duração de uma operação é um erro?',
    options: [
      'time.time() é mais lento que time.monotonic()',
      'time.time() retorna o wall clock — que pode ser ajustado pelo NTP, pelo usuário ou por um leap second durante a medição. Se o relógio for "puxado" para trás enquanto você mede, você terá uma duração negativa ou incorreta. time.monotonic() garante que o valor sempre cresce, nunca retrocede — ideal para medir duração. time.time() é correto para timestamps absolutos.',
      'time.time() só funciona em sistemas Unix',
      'time.time() não tem precisão suficiente para medir duração',
    ],
    correct: 1,
    explanation: 'Wall clock (CLOCK_REALTIME) pode ser ajustado a qualquer momento: NTP slew, settime(), leap second. Monotonic clock (CLOCK_MONOTONIC) só avança — nunca recua — mas não tem relação com a hora do dia. Em Python: time.monotonic() para duração, time.time() para timestamps. Em Go: time.Now() tem ambos. Em Java: System.nanoTime() para duração, System.currentTimeMillis() para timestamp.',
  },
  {
    question: 'O que é clock skew e por que é problemático em sistemas distribuídos?',
    options: [
      'Clock skew é quando o servidor está em fuso horário diferente — resolvido com UTC',
      'Clock skew é a diferença de hora entre dois servidores — mesmo sincronizados via NTP, podem divergir em dezenas a centenas de milissegundos. Se o servidor A tem skew de +50ms em relação ao B: eventos de A com timestamp anterior ao de B podem ter chegado depois na realidade. Sistemas que usam timestamps para ordenar eventos (ex: bancos de dados, logs de auditoria) podem ter ordenação incorreta.',
      'Clock skew só afeta sistemas sem NTP configurado',
      'Clock skew é resolvido automaticamente pelo protocolo TCP',
    ],
    correct: 1,
    explanation: 'NTP típico mantém skew em ±10-100ms em LAN. GPS-disciplined clocks chegam a ±1µs. Google TrueTime API retorna um intervalo [earliest, latest] em vez de um instante — o sistema espera até o intervalo não se sobrepor antes de confirmar uma transação (TrueTime + wait = Spanner externa consistency). CockroachDB usa HLC (Hybrid Logical Clock) para ordenação sem GPS.',
  },
  {
    question: 'O que são Lamport timestamps e que problema eles resolvem?',
    options: [
      'Lamport timestamps são relógios físicos mais precisos que o NTP',
      'Lamport timestamps são contadores lógicos que capturam causalidade: "A aconteceu antes de B" mesmo sem relógios sincronizados. Regra: (1) ao enviar mensagem, incrementa contador local e envia junto; (2) ao receber, toma max(local, recebido) + 1. Assim A→B implica L(A) < L(B). Resolve ordenação de eventos em sistemas onde relógios físicos divergem — sem precisar de GPS.',
      'Lamport timestamps só funcionam em sistemas com 2 servidores',
      'Lamport timestamps sincronizam relógios usando algoritmo de consenso',
    ],
    correct: 1,
    explanation: 'Limitação: Lamport timestamps provam A→B se L(A)<L(B), mas L(A)<L(B) não prova A→B (pode ser concorrente). Vector clocks (Dynamo/Riak) resolvem isso — um vetor de contadores por nó captura concorrência real. HLC (Hybrid Logical Clock — CockroachDB) combina wall clock com contador lógico para ter a vantagem de ambos: ordenação causal E timestamps legíveis por humanos.',
  },
];

export default function TempoClocksNtpPage() {
  return (
    <ModuleLayout
      slug="tempo-clocks-ntp"
      title="Tempo distribuído: NTP, clock skew, monotonic vs wall"
      icon="⏱️"
      xp={60}
      readTime={12}
      trailName="Como o Computador Funciona"
      trailColor="#6e7681"
      nextSlug="cpu-pipeline-cache"
      nextTitle="CPU: pipeline, cache L1/L2/L3, branch prediction"
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
        Tempo parece simples — até você perceber que dois servidores no mesmo datacenter podem discordar em 100ms, que um leap second pode "voltar no tempo" e quebrar logs, e que a ordem de eventos em sistemas distribuídos não pode depender de relógio físico.
      </p>

      <Section accent={accent} title="Wall clock vs monotonic clock">
        <CodeBlock>{`import time

# Wall clock (CLOCK_REALTIME): hora real do mundo
# Pode ser ajustado a qualquer momento: NTP, settime, leap second
inicio = time.time()
time.sleep(0.1)
fim = time.time()
print(f"Wall: {fim - inicio:.4f}s")   # correto normalmente, mas pode ser negativo!

# Monotonic clock (CLOCK_MONOTONIC): contador que só avança
# Garantia: nunca recua, mesmo com ajuste de NTP
inicio = time.monotonic()
time.sleep(0.1)
fim = time.monotonic()
print(f"Monotonic: {fim - inicio:.4f}s")   # sempre >= 0

# Performance counter: máxima resolução disponível no OS
inicio = time.perf_counter()
# ... código a medir ...
fim = time.perf_counter()
print(f"Perf counter: {(fim - inicio) * 1000:.3f}ms")

# Regra de ouro:
# time.time()         → timestamps absolutos (logs, DB, expiração)
# time.monotonic()    → medir duração, timeouts, intervalos
# time.perf_counter() → benchmarks de alta precisão

# Exemplo do problema com wall clock:
# Servidor faz NTP slew enquanto você mede:
#   inicio = time.time()  →  1713430000.000
#   [NTP ajusta -200ms]
#   fim    = time.time()  →  1713429999.900
#   duração = fim - inicio = -0.100s  ← duração NEGATIVA!

# time.monotonic() nunca teria esse problema.`}</CodeBlock>
      </Section>

      <Section accent={accent} title="NTP: como relógios de rede se sincronizam">
        <CodeBlock>{`# NTP (Network Time Protocol) — RFC 5905
# Hierarquia de strata:
# Stratum 0: GPS, relógio atômico, GPS disciplined oscillator
# Stratum 1: servidores diretamente conectados ao stratum 0
# Stratum 2: servidores sincronizados com stratum 1 via NTP
# Stratum 3+: cascata (cada hop adiciona incerteza)

# Algoritmo de medição de offset:
# Cliente envia com timestamp T1
# Servidor recebe em T2, responde em T3
# Cliente recebe em T4
#
# RTT   = (T4 - T1) - (T3 - T2)   # round-trip time real
# offset = ((T2 - T1) + (T3 - T4)) / 2   # ajuste necessário

# NTP ajusta o relógio de duas formas:
# 1. Slew: ajuste gradual (≤500ppm) — menos disruptivo
# 2. Step: ajuste instantâneo (só se offset > 128ms por padrão)

# Verificar sincronização NTP no Linux:
# timedatectl show-timesync          # Linux systemd
# chronyc tracking                   # chrony (mais preciso que ntpd)
# ntpq -p                            # ntpd classic

# Saída típica de chronyc tracking:
# Reference ID    : A29F2303 (162.159.200.123 — Cloudflare NTP)
# Stratum         : 3
# System time     : 0.000042153 seconds fast of NTP time
# Last offset     : +0.000038471 seconds
# RMS offset      : 0.000019234 seconds
# Frequency       : 12.345 ppm fast
# Residual freq   : -0.002 ppm
# Skew            : 0.143 ppm
# Root delay      : 0.009823456 seconds
# Root dispersion : 0.001234567 seconds

import subprocess

def get_ntp_offset_ms():
    """Lê offset NTP atual via chronyc (Linux)."""
    try:
        result = subprocess.run(
            ["chronyc", "tracking"],
            capture_output=True, text=True, timeout=5
        )
        for line in result.stdout.splitlines():
            if "System time" in line:
                # "System time     : 0.000042153 seconds fast of NTP time"
                parts = line.split(":")
                offset_str = parts[1].strip().split()[0]
                return float(offset_str) * 1000  # ms
    except Exception:
        return None`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Clock skew em sistemas distribuídos">
        <ComparisonTable
          headers={['Método de sincronização', 'Precisão típica', 'Uso']}
          rows={[
            ['NTP público (pool.ntp.org)', '±10–100ms', 'Servidores comuns'],
            ['NTP local (datacenter)', '±1–10ms', 'Infraestrutura corporativa'],
            ['PTP (IEEE 1588)', '±1µs–1ms', 'Redes financeiras, telecom'],
            ['GPS disciplined oscillator', '±1–100ns', 'Stratum 0, Google Spanner'],
            ['AWS Time Sync Service', '±1ms', 'EC2 via hypervisor'],
            ['Google TrueTime API', '±7ms (bounded)', 'Spanner — retorna intervalo'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# O problema de clock skew para ordenação de eventos:
# Servidor A:  timestamp 10:00:00.050 → operação A
# Servidor B:  timestamp 10:00:00.040 → operação B
# Clock skew de A: +50ms acima do real
# Clock skew de B: -10ms abaixo do real

# Timestamps dizem: A aconteceu depois de B
# Realidade: B aconteceu depois de A (skew de 60ms total)

# Implicações reais:
# - Logs de audit podem ter ordem incorreta
# - Replicação de banco pode aplicar updates na ordem errada
# - Rate limiting baseado em timestamp pode ser bypassado
# - Certificates com not-before/not-after dependem de clock correto

import datetime
import time

def timestamp_com_monotonic():
    """
    Combina timestamp absoluto (wall) com monotonic para detectar regressão.
    Se wall clock regredir, usa monotonic para estimar o tempo correto.
    """
    wall = time.time()
    mono = time.monotonic()
    return {"wall": wall, "mono": mono, "iso": datetime.datetime.utcfromtimestamp(wall).isoformat()}

# Para sistemas que precisam de ordem global sem GPS:
# → Lamport timestamps (lógico, sem clock físico)
# → Vector clocks (detecta concorrência real)
# → HLC — Hybrid Logical Clock (CockroachDB)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Lamport timestamps e Vector Clocks">
        <CodeBlock>{`# Lamport Timestamps: relógio lógico para causalidade
# Regra: send incrementa, receive toma max(local, received) + 1

class LamportClock:
    def __init__(self, node_id: str):
        self.node_id = node_id
        self.counter = 0

    def tick(self) -> int:
        """Evento local: incrementa."""
        self.counter += 1
        return self.counter

    def send(self) -> int:
        """Ao enviar mensagem: incrementa e retorna timestamp."""
        self.counter += 1
        return self.counter

    def receive(self, received_ts: int) -> int:
        """Ao receber mensagem: max + 1."""
        self.counter = max(self.counter, received_ts) + 1
        return self.counter

# Simulação:
node_a = LamportClock("A")
node_b = LamportClock("B")

ts_a1 = node_a.tick()          # A: evento local       → L(a1) = 1
ts_send = node_a.send()        # A: envia para B        → L(send) = 2
ts_b1 = node_b.receive(ts_send) # B: recebe de A        → L(b1) = 3
ts_b2 = node_b.tick()          # B: evento local       → L(b2) = 4
print(f"A1={ts_a1}, A→B={ts_send}, B1={ts_b1}, B2={ts_b2}")
# A1=1, A→B=2, B1=3, B2=4

# Garantia: L(a_send) < L(b_receive) — a→b é provada causalmente
# Limitação: L(x) < L(y) NÃO prova x→y (pode ser concorrente)

# Vector Clocks: detecta concorrência real
# Cada nó mantém vetor de contadores por nó conhecido
class VectorClock:
    def __init__(self, node_id: str, nodes: list):
        self.node_id = node_id
        self.clock = {n: 0 for n in nodes}

    def tick(self):
        self.clock[self.node_id] += 1
        return dict(self.clock)

    def send(self):
        self.clock[self.node_id] += 1
        return dict(self.clock)

    def receive(self, received: dict):
        for node, ts in received.items():
            self.clock[node] = max(self.clock.get(node, 0), ts)
        self.clock[self.node_id] += 1

    def happened_before(self, vc_a: dict, vc_b: dict) -> bool:
        """vc_a → vc_b se todos os componentes de A ≤ B e pelo menos um <."""
        all_le = all(vc_a.get(n, 0) <= vc_b.get(n, 0) for n in vc_b)
        some_lt = any(vc_a.get(n, 0) < vc_b.get(n, 0) for n in vc_b)
        return all_le and some_lt`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Google TrueTime e Spanner">
        <CodeBlock>{`# Google TrueTime API (Spanner):
# Em vez de retornar UM timestamp, retorna um intervalo [earliest, latest]
# Garante que a hora real está dentro do intervalo
# Intervalo típico: ±7ms (GPS + atomic clocks em cada datacenter)

# Pseudocódigo do conceito TrueTime:
class TrueTime:
    def now(self):
        """Retorna (earliest, latest) com garantia que hora real está no intervalo."""
        uncertainty_ms = 7  # garantia Google TrueTime via GPS
        wall_ms = time.time() * 1000
        return (wall_ms - uncertainty_ms, wall_ms + uncertainty_ms)

    def after(self, t: float) -> bool:
        """Garante que agora é definitivamente DEPOIS de t."""
        earliest, _ = self.now()
        return earliest > t  # só retorna True se até o pior caso seja > t

    def before(self, t: float) -> bool:
        """Garante que agora é definitivamente ANTES de t."""
        _, latest = self.now()
        return latest < t

# Commit wait em Spanner:
# 1. Líder escolhe timestamp s = TT.now().latest
# 2. Aguarda até TT.after(s) → "commit wait"
# 3. Só então confirma — garante que NENHUM servidor tem s no futuro
# Resultado: external consistency sem coordenação global

# CockroachDB usa HLC (Hybrid Logical Clock):
# HLC = (wall_time, logical_counter)
# - wall_time: do relógio físico (NTP)
# - logical_counter: contador que avança quando wall_time empata
# Propriedade: HLC.now() ≥ max(todos os HLC vistos) E ≈ wall_time
# Mais robusto que Lamport (legível) sem precisar de GPS

import struct

def hlc_encode(wall_ms: int, logical: int) -> bytes:
    """Hybrid Logical Clock — 8 bytes: 48 bits wall + 16 bits logical."""
    # wall em ms cabe em 48 bits até ano 2^48ms ≈ ano 10889
    packed = (wall_ms << 16) | (logical & 0xFFFF)
    return struct.pack(">Q", packed)

def hlc_decode(b: bytes):
    packed = struct.unpack(">Q", b)[0]
    wall_ms = packed >> 16
    logical = packed & 0xFFFF
    return wall_ms, logical`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Regras práticas:</strong> sempre use <code>time.monotonic()</code> para medir duração e timeouts — nunca <code>time.time()</code>. Use UTC para todos os timestamps armazenados. NTP típico tem ±10–100ms de skew — nunca assuma ordem de eventos em sistemas distribuídos baseado só em timestamp. Para ordenação causal sem GPS: Lamport timestamps (simples) ou HLC (CockroachDB). Para garantia forte de ordem global: TrueTime + commit wait (Spanner/Cloud Spanner).
      </Callout>

      <Callout>
        Próximo: <strong>CPU: pipeline, cache e branch prediction</strong> — o que acontece dentro do processador em cada instrução.
      </Callout>
    </div>
  );
}
