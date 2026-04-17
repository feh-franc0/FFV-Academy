import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#1f6feb';

export const metadata: Metadata = {
  title: 'OSI e TCP/IP: as camadas que explicam tudo — FFV Academy',
  description: 'O modelo OSI de 7 camadas, o stack TCP/IP real, encapsulamento, e como cada camada explica problemas de rede do dia a dia.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o modelo OSI tem 7 camadas mas o TCP/IP real usa 4?',
    options: [
      'TCP/IP é mais antigo e incompleto — OSI é o padrão atual',
      'OSI é um modelo conceitual/didático criado pela ISO para padronizar interoperabilidade. TCP/IP é o stack real que venceu a guerra de protocolos: colapsa Sessão/Apresentação/Aplicação em uma só (Aplicação), e Física/Enlace em outra (Acesso à rede). OSI ensina conceitos, TCP/IP é o que roda. Conhecer OSI ajuda a entender onde cada protocolo opera.',
      'TCP/IP descarta as camadas 5, 6 e 7 por não serem necessárias',
      'OSI usa hardware diferente de TCP/IP',
    ],
    correct: 1,
    explanation: 'A "guerra de protocolos" dos anos 80: OSI (ISO) vs TCP/IP (ARPANET/DARPA). TCP/IP venceu por simplicidade e implementações abertas. Hoje: OSI é referência para troubleshooting ("layer 1 problem" = cabo; "layer 3 problem" = roteamento; "layer 7 problem" = aplicação). Engenheiros falam "layer X" para indicar onde o problema está, não que usam o stack OSI real.',
  },
  {
    question: 'O que é encapsulamento e como funciona quando você envia um HTTP request?',
    options: [
      'Encapsulamento é quando o servidor criptografa os dados antes de enviar',
      'Encapsulamento: cada camada adiciona seu header (e às vezes trailer) ao dado que recebeu da camada superior. HTTP request → TCP adiciona porta/sequência → IP adiciona endereço IP → Ethernet adiciona MAC + CRC → bits na rede. No destino, cada camada remove seu header (desencapsulamento) e passa o payload para cima.',
      'Encapsulamento só acontece em conexões HTTPS',
      'Encapsulamento é o processo de compressão de dados para economizar banda',
    ],
    correct: 1,
    explanation: 'Exemplo real: curl http://example.com → Dados: "GET / HTTP/1.1\\r\\n..." → TCP segment: [src:port 54321, dst:port 80, seq:1, dados] → IP packet: [src:192.168.1.10, dst:93.184.216.34, proto:TCP, segmento] → Ethernet frame: [src MAC, dst MAC, type:IPv4, pacote, CRC32]. Cada camada só vê seu próprio header + payload opaco. MTU (1500 bytes Ethernet) limita tamanho do payload — pacotes maiores são fragmentados.',
  },
  {
    question: 'Qual a diferença entre endereço MAC e endereço IP em termos de função?',
    options: [
      'MAC e IP são a mesma coisa — apenas nomenclaturas diferentes',
      'MAC (Media Access Control) é o endereço físico de hardware — único por NIC, opera na camada 2 (Enlace), usado para entrega dentro da mesma rede local (LAN). IP é o endereço lógico — atribuído por configuração, opera na camada 3 (Rede), usado para roteamento entre redes. ARP traduz IP→MAC localmente. Roteadores usam IP para decidir para onde enviar; switches usam MAC para entrega local.',
      'MAC é permanente; IP muda a cada segundo',
      'IP funciona em LANs; MAC funciona em WANs',
    ],
    correct: 1,
    explanation: 'ARP (Address Resolution Protocol): "Quem tem o IP 192.168.1.1? Me responda, 00:11:22:33:44:55." O gateway responde com seu MAC. O frame Ethernet é endereçado ao MAC do gateway; o pacote IP mantém o IP de destino final. A cada hop de roteador, os MACs de origem/destino mudam mas os IPs permanecem. `arp -n` lista o cache ARP local. `ip neigh` no Linux moderno.',
  },
];

export default function ModeloOsiTcpIpPage() {
  return (
    <ModuleLayout
      slug="modelo-osi-tcp-ip"
      title="OSI e TCP/IP: as camadas que explicam tudo"
      icon="🌐"
      xp={60}
      readTime={12}
      trailName="Redes & Web"
      trailColor="#1f6feb"
      nextSlug="tcp-handshake-congestao"
      nextTitle="TCP de verdade: handshake, congestion control, retransmissão"
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
        Redes parecem mágica até você entender que toda comunicação é apenas dados atravessando camadas bem definidas — cada uma com uma responsabilidade específica. O modelo OSI dá o vocabulário; o TCP/IP é o que realmente roda.
      </p>

      <Section accent={accent} title="Modelos OSI e TCP/IP: comparação direta">
        <ComparisonTable
          headers={['Camada OSI', '#', 'Camada TCP/IP', 'Protocolos', 'Unidade']}
          rows={[
            ['Aplicação', '7', 'Aplicação', 'HTTP, DNS, SMTP, SSH', 'Mensagem'],
            ['Apresentação', '6', 'Aplicação', 'TLS, SSL, gzip', 'Mensagem'],
            ['Sessão', '5', 'Aplicação', 'RPC, WebSocket session', 'Mensagem'],
            ['Transporte', '4', 'Transporte', 'TCP, UDP, QUIC', 'Segmento/Datagrama'],
            ['Rede', '3', 'Internet', 'IP, ICMP, BGP, OSPF', 'Pacote'],
            ['Enlace', '2', 'Acesso à rede', 'Ethernet, Wi-Fi, ARP', 'Frame'],
            ['Física', '1', 'Acesso à rede', 'Cabo, fibra, rádio', 'Bit'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Encapsulamento: o que viaja pela rede">
        <CodeBlock>{`# Encapsulamento de um HTTP GET request:
# Cada camada envolve os dados da camada superior com seu header

# Camada 7 — Aplicação (HTTP):
payload_http = b"GET / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n"

# Camada 4 — Transporte (TCP):
# Header TCP: src_port(2) + dst_port(2) + seq(4) + ack(4) + flags(2) + window(2) + checksum(2) + urgent(2) = 20 bytes
tcp_segment = {
    "src_port": 54321,
    "dst_port": 80,
    "seq": 1,
    "ack": 0,
    "flags": 0x002,  # SYN
    "data": payload_http,
}

# Camada 3 — Rede (IP):
# Header IPv4: version(1) + IHL(1) + DSCP(1) + total_len(2) + id(2) + flags/offset(2) + TTL(1) + proto(1) + checksum(2) + src_ip(4) + dst_ip(4) = 20 bytes
ip_packet = {
    "version": 4,
    "ttl": 64,
    "protocol": 6,  # TCP
    "src_ip": "192.168.1.10",
    "dst_ip": "93.184.216.34",
    "data": tcp_segment,
}

# Camada 2 — Enlace (Ethernet):
# Header Ethernet: dst_mac(6) + src_mac(6) + ethertype(2) = 14 bytes + CRC(4) trailer
ethernet_frame = {
    "dst_mac": "aa:bb:cc:dd:ee:ff",  # MAC do gateway local
    "src_mac": "00:11:22:33:44:55",
    "ethertype": 0x0800,             # IPv4
    "data": ip_packet,
    "fcs": 0xDEADBEEF,              # CRC32
}

# Overhead total: 20 (TCP) + 20 (IP) + 14+4 (Ethernet) = 58 bytes de header
# Para 40 bytes de payload HTTP = 59% é overhead de protocolo!
# (Por isso HTTP/2 e HTTP/3 comprimem headers)

# Verificar encapsulamento com tcpdump:
# tcpdump -i eth0 -n 'tcp port 80' -vv
# Mostra cada campo de cada camada

# Wireshark é a versão gráfica — disasambla cada campo visualmente`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Endereçamento: MAC vs IP vs porta">
        <CodeBlock>{`import socket
import struct
import subprocess

# Endereço MAC: identidade física de uma interface de rede
# 48 bits = 6 bytes, escrito como aa:bb:cc:dd:ee:ff
# OUI (Organizational Unique Identifier): primeiros 3 bytes = fabricante
# Exemplo: 00:1A:2B = Cisco, DC:A6:32 = Raspberry Pi Foundation

# Verificar MACs das interfaces:
# ip link show        ← moderno
# ifconfig -a         ← legado

# Endereço IP: endereço lógico de roteamento
# IPv4: 32 bits, anotação dotted-decimal 192.168.1.10
# IPv6: 128 bits, hexadecimal 2001:db8::1

def ip_to_binary(ip: str) -> str:
    """Converte IP para binário — mostra por que subnets funcionam."""
    parts = ip.split(".")
    return ".".join(f"{int(p):08b}" for p in parts)

print(ip_to_binary("192.168.1.10"))
# 11000000.10101000.00000001.00001010

print(ip_to_binary("255.255.255.0"))
# 11111111.11111111.11111111.00000000  ← máscara /24

# AND entre IP e máscara = endereço de rede:
# 192.168.1.10 AND 255.255.255.0 = 192.168.1.0

# Porta: identifica o processo/serviço dentro do host
# 0–1023: bem conhecidas (root requerido no Linux)
# 1024–49151: registradas (recomendado para serviços)
# 49152–65535: efêmeras (clientes, temporárias)

# Soquete = IP + porta (endpoint único na rede)
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.bind(("0.0.0.0", 8080))   # qualquer interface, porta 8080
sock.listen(128)
addr = sock.getsockname()
print(f"Ouvindo em {addr[0]}:{addr[1]}")
sock.close()

# ARP: traduz IP local → MAC
# arp -n           ← cache ARP
# ip neigh show    ← moderno
# Exemplo: 192.168.1.1 dev eth0 lladdr aa:bb:cc:dd:ee:ff STALE`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Troubleshooting por camada">
        <CodeBlock>{`# Diagnóstico por camada OSI — toolkit essencial

# CAMADA 1 — Física (cabo, sinal)
# ip link show      → "state UP" ou "state DOWN"
# ethtool eth0      → velocidade, duplex, link detected

# CAMADA 2 — Enlace (MAC, switch)
# arp -n            → cache ARP (vê MAC dos vizinhos)
# ip neigh show     → equivalente moderno
# bridge fdb show   → tabela de forwarding do bridge Linux

# CAMADA 3 — Rede (IP, roteamento)
# ping 8.8.8.8      → ICMP echo — testa conectividade IP
# ip route show     → tabela de roteamento
# traceroute 8.8.8.8 → mostra cada hop (TTL decrement)
# mtr 8.8.8.8       → traceroute contínuo com latência por hop

# CAMADA 4 — Transporte (TCP/UDP, portas)
# ss -tlnp          → sockets TCP ouvindo (moderno)
# netstat -tlnp     → equivalente legado
# nc -zv host 443   → testa conectividade TCP na porta

# CAMADA 7 — Aplicação (HTTP, DNS)
# curl -v http://example.com    → mostra headers de request/response
# dig example.com               → query DNS detalhada
# openssl s_client -connect example.com:443  → inspeciona TLS

# Exemplo de diagnóstico real:
# "Minha aplicação não conecta no banco de dados"
# 1. ping db_host             → OK? (L3 alcançável)
# 2. nc -zv db_host 5432      → OK? (L4 porta aberta)
# 3. psql -h db_host -U user  → OK? (L7 autenticação)
# → Problema em cada camada tem causa diferente

import subprocess

def check_port(host: str, port: int) -> bool:
    """Verifica se porta TCP está aberta (L4 check)."""
    try:
        with socket.create_connection((host, port), timeout=3):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False

print(check_port("8.8.8.8", 53))   # DNS Google — deve ser True`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Modelo mental:</strong> cada camada tem uma responsabilidade única — física (bits), enlace (frames na LAN), rede (roteamento IP), transporte (conexão ponta-a-ponta), aplicação (protocolo do serviço). Quando algo quebra, a pergunta "em que camada?" direciona o diagnóstico. MAC = entrega local dentro da LAN; IP = roteamento global; porta = processo dentro do host. Encapsulamento adiciona ~58 bytes de overhead por pacote Ethernet/TCP/IP.
      </Callout>

      <Callout>
        Próximo: <strong>TCP de verdade</strong> — handshake, controle de congestionamento e por que TCP é confiável mesmo sobre IP não-confiável.
      </Callout>
    </div>
  );
}
