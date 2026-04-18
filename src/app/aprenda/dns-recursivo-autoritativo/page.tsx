import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#1f6feb';

export const metadata = getModuleMetadata('dns-recursivo-autoritativo');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre um resolver DNS recursivo e um servidor DNS autoritativo?',
    options: [
      'Resolver recursivo responde queries; autoritativo armazena records',
      'Resolver recursivo (ex: 8.8.8.8, 1.1.1.1): recebe query do cliente e faz o trabalho de resolução — consulta root, TLD e autoritativo em nome do cliente, cacheia respostas pelo TTL. Autoritativo (ex: ns1.example.com): tem a resposta definitiva para um domínio específico — não redireciona, não recursa. Um resolver nunca é autoritativo e vice-versa na arquitetura clássica.',
      'Autoritativo usa TCP; recursivo usa UDP',
      'São a mesma coisa — termos diferentes para o mesmo servidor',
    ],
    correct: 1,
    explanation: 'Hierarquia de resolução: (1) Cache local do OS → (2) Resolver recursivo (configurado no OS via DHCP/manual) → (3) Root nameservers (13 IPs anycast, gerenciados por IANA) → (4) TLD nameserver (.com, .br, etc., gerenciados por Verisign/NIC.br) → (5) Autoritativo (gerenciado por você ou seu registrar). dig +trace mostra cada passo. Recursion Available (RA bit) indica se o resolver aceita recursão.',
  },
  {
    question: 'Por que usar CNAME em vez de A record para um serviço externo como Cloudflare?',
    options: [
      'CNAME é mais rápido que A record por usar cache maior',
      'CNAME aponta para um nome, não para um IP. Se Cloudflare muda seus IPs (failover, expansão de datacenter), o CNAME "example.com CNAME something.cdn.cloudflare.com" continua válido — Cloudflare atualiza seus A records. Com A record direto, você precisaria atualizar manualmente. Trade-off: CNAME exige lookup adicional (resolve o alvo). CNAME na zona apex (@) é inválido por RFC — use ALIAS/ANAME ou Cloudflare Proxy.',
      'CNAME usa menos banda que A record',
      'CNAME é obrigatório para HTTPS; A record não suporta TLS',
    ],
    correct: 1,
    explanation: 'CNAME chain: app.example.com CNAME lb.example.net → lb.example.net A 203.0.113.1. Cada CNAME exige lookup adicional. RFC 1034 proíbe CNAME na zona apex (example.com, não www.example.com) porque apex deve ter SOA e NS records. Soluções: ALIAS/ANAME (extensão proprietária de vários provedores), ou Cloudflare flattens CNAME (retorna A direto em vez de CNAME no apex).',
  },
  {
    question: 'Como funciona o DNS poisoning e o que DNSSEC faz para preveni-lo?',
    options: [
      'DNS poisoning é quando o TTL expira antes do cache ser renovado',
      'DNS poisoning: atacante injeta resposta falsa no cache do resolver (ex: example.com → IP malicioso). Ataque de Kaminsky (2008): explora que resolvers aceitavam qualquer resposta que chegasse para uma query ativa, se o Transaction ID de 16 bits combinasse — 65535 possibilidades, brute-forceable em segundos. DNSSEC assina digitalmente os records com a chave privada do dono do domínio — resolver verifica a assinatura, não aceita respostas sem assinatura válida.',
      'DNS poisoning é quando um servidor DNS é derrubado por DDoS',
      'DNSSEC criptografa os records DNS para prevenir interceptação',
    ],
    correct: 1,
    explanation: 'DNSSEC usa RRSIG (Resource Record Signature), DNSKEY, DS (Delegation Signer) e NSEC (Next Secure). Chain of trust: chave raiz (IANA) assina chaves TLD, TLD assina chaves de zona do domínio. DNSSEC NÃO criptografa — apenas autentica (integrity + authentication, não confidentiality). Para privacidade: DNS-over-HTTPS (DoH) ou DNS-over-TLS (DoT). dig +dnssec example.com mostra RRSIG records.',
  },
];

export default function DnsRecursivoAutoritativoPage() {
  return (
    <ModuleLayout
      slug="dns-recursivo-autoritativo"
      title="DNS: recursivo, autoritativo, registros, TTL, DNSSEC"
      icon="🔍"
      xp={70}
      readTime={14}
      trailName="Redes & Web"
      trailColor="#1f6feb"
      nextSlug="proxies-load-balancers"
      nextTitle="Proxies, reverse proxies, load balancers L4 vs L7"
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
        DNS é o catálogo telefônico da internet — converte "example.com" em IP. Parece trivial até você debugar uma propagação de 48 horas, entender por que um TTL baixo custa dinheiro, ou descobrir que seu resolver foi envenenado.
      </p>

      <Section accent={accent} title="Resolução DNS: o caminho completo">
        <CodeBlock>{`# dig +trace mostra cada passo da resolução:
# $ dig +trace example.com

# Passo 1: Root nameservers (. → TLD nameservers)
# .                         172800  NS  a.root-servers.net.
# .                         172800  NS  b.root-servers.net.
# (13 root servers: a-m.root-servers.net — anycast globalmente)

# Passo 2: TLD nameserver (.com → autoritativo de example.com)
# com.                      172800  NS  a.gtld-servers.net.
# example.com.              172800  NS  ns1.example.com.  ← glue records

# Passo 3: Autoritativo de example.com
# example.com.              3600    A   93.184.216.34
# www.example.com.          3600    CNAME example.com.

# Verificar resolução passo a passo:
import socket
import dns.resolver  # pip install dnspython

def resolver_completo(hostname: str):
    """Resolve um hostname mostrando os detalhes."""
    # Resolução padrão (usa resolver do sistema):
    addrs = socket.getaddrinfo(hostname, None)
    ips = list({addr[4][0] for addr in addrs})
    print(f"IPs de {hostname}: {ips}")

    # Usando dnspython para resolver manualmente:
    resolver = dns.resolver.Resolver()
    resolver.nameservers = ["8.8.8.8"]  # usar Google DNS diretamente

    try:
        answer = resolver.resolve(hostname, "A")
        for rdata in answer:
            print(f"A: {rdata.address}, TTL: {answer.ttl}s")
    except Exception as e:
        print(f"Erro: {e}")

# Medir latência DNS:
import time

def medir_latencia_dns(hostname: str, iterations: int = 10) -> float:
    tempos = []
    for _ in range(iterations):
        inicio = time.perf_counter()
        socket.getaddrinfo(hostname, 80)
        tempos.append((time.perf_counter() - inicio) * 1000)
    # 1ª chamada = sem cache; seguintes = com cache do OS
    print(f"Primeira: {tempos[0]:.1f}ms (sem cache)")
    print(f"Média restante: {sum(tempos[1:])/len(tempos[1:]):.2f}ms (com cache)")
    return sum(tempos) / len(tempos)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Tipos de registro DNS">
        <ComparisonTable
          headers={['Tipo', 'Função', 'Exemplo']}
          rows={[
            ['A', 'Hostname → IPv4', 'example.com → 93.184.216.34'],
            ['AAAA', 'Hostname → IPv6', 'example.com → 2606:2800:220:1:248:1893:25c8:1946'],
            ['CNAME', 'Alias → outro hostname', 'www.example.com → example.com'],
            ['MX', 'Mail server (com prioridade)', '10 mail.example.com (menor = maior prio)'],
            ['TXT', 'Texto livre (SPF, DKIM, verificação)', '"v=spf1 include:_spf.google.com ~all"'],
            ['NS', 'Nameservers autoritativos', 'example.com → ns1.example.com'],
            ['SOA', 'Start of Authority (zona info)', 'Serial, refresh, retry, expire, TTL'],
            ['PTR', 'IP → hostname (DNS reverso)', '34.216.184.93.in-addr.arpa → example.com'],
            ['SRV', 'Localização de serviço com porta', '_xmpp._tcp.example.com 10 5 5222 xmpp.example.com'],
            ['CAA', 'CAs autorizadas a emitir cert', '0 issue "letsencrypt.org"'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`import dns.resolver

def consultar_records(domain: str):
    """Consulta múltiplos tipos de record para um domínio."""
    tipos = ["A", "AAAA", "MX", "TXT", "NS", "CAA"]
    for tipo in tipos:
        try:
            answers = dns.resolver.resolve(domain, tipo, lifetime=3)
            for rdata in answers:
                print(f"{tipo:6}: {rdata}")
        except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
            pass
        except Exception as e:
            print(f"{tipo:6}: {e}")

# MX records têm prioridade:
# $ dig MX gmail.com
# gmail.com.  3600  MX  5  gmail-smtp-in.l.google.com.   ← menor = mais preferido
# gmail.com.  3600  MX  10 alt1.gmail-smtp-in.l.google.com.

# SPF (Sender Policy Framework) via TXT:
# "v=spf1 include:_spf.google.com include:mailgun.org ~all"
# include: autoriza IPs do serviço
# -all = falhar hard para outros IPs
# ~all = falhar soft (softfail)

# DKIM via TXT:
# selector._domainkey.example.com TXT "v=DKIM1; k=rsa; p=MIGfMA0..."

# DMARC via TXT:
# _dmarc.example.com TXT "v=DMARC1; p=reject; rua=mailto:dmarc@example.com"

# SRV record para descoberta de serviços:
# _https._tcp.example.com SRV 10 5 443 www.example.com.
# Kubernetes CoreDNS: _service._tcp.namespace.svc.cluster.local SRV`}</CodeBlock>
      </Section>

      <Section accent={accent} title="TTL, caching e propagação">
        <CodeBlock>{`# TTL (Time To Live): quantos segundos o record pode ser cacheado
# TTL baixo: mudanças propagam rápido, mas mais queries para o autoritativo
# TTL alto: menos load no servidor, mas mudanças demoram a propagar

# Estratégia para migrar DNS sem downtime:
# 1. SEMANA ANTES: reduzir TTL de 3600s para 300s (5min)
#    → propagação máxima = 300s após a mudança
# 2. HORA DA MIGRAÇÃO: alterar o record
# 3. PÓS-MIGRAÇÃO: aumentar TTL de volta para 3600s+ (economia de queries)

# Verificar TTL atual de um record:
def verificar_ttl(domain: str, record_type: str = "A"):
    answers = dns.resolver.resolve(domain, record_type)
    print(f"TTL de {domain} ({record_type}): {answers.ttl}s")
    print(f"Propagação máxima se mudar agora: {answers.ttl}s ({answers.ttl/60:.1f} min)")

# Cache DNS em diferentes níveis:
# 1. Cache do SO (/etc/hosts tem precedência absoluta)
# 2. nscd ou systemd-resolved (cache local)
# 3. Resolver recursivo (8.8.8.8 cacheia por TTL)
# 4. Browser tem seu próprio cache DNS (separado do OS!)

# Limpar cache DNS:
# Linux (systemd): sudo systemd-resolve --flush-caches
# macOS:           sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
# Windows:         ipconfig /flushdns
# Chrome:          chrome://net-internals/#dns → Clear host cache

# Negative caching (NXDOMAIN):
# Se domínio não existe, o TTL do SOA MINIMUM define por quanto tempo
# o resolver cacheia a resposta negativa
# $ dig nonexistent.example.com SOA → SOA TTL = quanto tempo cachear NXDOMAIN

# Negative TTL recomendado: 300-900s
# Por quê importa: NXDOMAIN cacheado pode impedir resolução após criar o record`}</CodeBlock>
      </Section>

      <Section accent={accent} title="DNSSEC e DoH/DoT">
        <CodeBlock>{`# DNSSEC: autenticação de records DNS
# NÃO criptografa — apenas assina digitalmente

# Records DNSSEC:
# DNSKEY: chave pública da zona
# RRSIG:  assinatura digital de cada RRset
# DS:     hash da DNSKEY filho no servidor pai (chain of trust)
# NSEC:   "não existe nada entre example.com e ftp.example.com" (negative proof)
# NSEC3:  versão com hashing (esconde nomes que existem na zona)

# Verificar DNSSEC:
# dig +dnssec example.com        → mostra RRSIG records
# dig +sigchase example.com      → valida a cadeia completa
# https://dnsviz.net/            → visualização gráfica da cadeia DNSSEC

# DNS-over-HTTPS (DoH): queries DNS dentro de HTTPS
# Endpoint: https://cloudflare-dns.com/dns-query
# Vantagem: queries criptografadas, passa por firewalls
# Desvantagem: centralização (Google/Cloudflare veem todas as queries)

import httpx
import base64
import struct

async def dns_over_https(domain: str, record_type: str = "A") -> list:
    """Faz query DNS via DoH (Cloudflare 1.1.1.1)."""
    # Construir query DNS binária (formato wire):
    # Simple A query for domain — simplificado aqui
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://cloudflare-dns.com/dns-query",
            params={"name": domain, "type": record_type},
            headers={"Accept": "application/dns-json"},
        )
        data = resp.json()
        return [a["data"] for a in data.get("Answer", []) if a["type"] == 1]

# DNS-over-TLS (DoT): queries DNS via TLS na porta 853
# Mais simples que DoH, mas porta 853 é fácil de bloquear

# Configurar DoH no sistema:
# Linux (systemd-resolved): DNSOverTLS=yes em /etc/systemd/resolved.conf
# macOS: Configurações → Rede → DNS → DoH
# Windows 11: Configurações → Rede → DNS → DoH`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Modelo mental:</strong> resolução DNS = cascade de caches (OS → recursivo → root → TLD → autoritativo). Resolver recursivo faz o trabalho; autoritativo tem a resposta definitiva. TTL controla por quanto tempo o cache vale — baixe antes de migrar, aumente depois. A records para IPs, CNAME para aliases, MX para email, TXT para SPF/DKIM/DMARC. DNSSEC autentica (não criptografa). DoH/DoT criptografam as queries para privacidade.
      </Callout>

      <Callout>
        Próximo: <strong>Proxies e load balancers</strong> — L4 vs L7, reverse proxy, HAProxy, Nginx e quando usar cada um.
      </Callout>
    </div>
  );
}
