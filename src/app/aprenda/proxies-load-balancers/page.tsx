import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#1f6feb';

export const metadata: Metadata = {
  title: 'Proxies, reverse proxies, load balancers L4 vs L7 — FFV Academy',
  description: 'Forward vs reverse proxy. Load balancer na camada 4 (TCP) vs camada 7 (HTTP). Algoritmos de balanceamento, health checks e sticky sessions.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre forward proxy e reverse proxy?',
    options: [
      'Forward proxy fica no servidor; reverse proxy fica no cliente',
      'Forward proxy: fica na borda da rede do CLIENTE, encaminha requests em nome dos clientes para a internet (ex: proxy corporativo que filtra tráfego, Squid). O servidor vê o IP do proxy. Reverse proxy: fica na borda da rede do SERVIDOR, recebe requests dos clientes e distribui para backends (ex: Nginx, Cloudflare, AWS ALB). O cliente vê o IP do reverse proxy.',
      'São a mesma coisa com posicionamento diferente',
      'Forward proxy é para HTTP; reverse proxy é para TCP',
    ],
    correct: 1,
    explanation: 'Forward proxy: clientes configuram explicitamente (ou via WPAD/PAC). Usos: filtro de conteúdo corporativo, anonimidade (Tor, VPN), cache compartilhado (Squid). Reverse proxy: transparente ao cliente — ele acha que fala diretamente com o servidor. Usos: TLS termination, load balancing, caching de responses, WAF (Web Application Firewall), rate limiting. Cloudflare, Fastly, AWS CloudFront são CDNs que são essencialmente reverse proxies + cache.',
  },
  {
    question: 'Quando usar load balancer L4 em vez de L7?',
    options: [
      'L4 é sempre superior — L7 é legado',
      'L4 (TCP/UDP): roteia com base em IP e porta, sem inspecionar o payload. Mais rápido (sem parsing de HTTP), suporta qualquer protocolo TCP/UDP, preserva o protocolo ponta-a-ponta (útil para WebSocket, gRPC, banco de dados). L7 (HTTP/HTTPS): lê headers, URL, cookies — permite roteamento inteligente (canary por header, routing por path, WAF). Custo: parsing de HTTP em cada request.',
      'L4 é para tráfego interno; L7 é para tráfego externo',
      'L7 é sempre mais rápido por fazer menos trabalho',
    ],
    correct: 1,
    explanation: 'Exemplos reais: L4 → AWS NLB (Network Load Balancer), HAProxy em modo TCP, iptables DNAT. L7 → AWS ALB (Application Load Balancer), Nginx, Envoy, Traefik. Kubernetes: Service (L4 via iptables/IPVS) vs Ingress (L7 via controller como nginx-ingress ou Traefik). Para PostgreSQL, Redis, gRPC: L4 (L7 precisaria entender o protocolo). Para APIs HTTP com rotas diferentes por path: L7.',
  },
  {
    question: 'O que são sticky sessions e qual o trade-off de usá-las?',
    options: [
      'Sticky sessions melhoram performance sem nenhum custo',
      'Sticky sessions (session affinity): garante que o mesmo cliente sempre vá para o mesmo backend (via cookie ou hash do IP). Necessário quando estado da sessão está na memória local do servidor. Trade-off: perde balanceamento real (um backend pode ficar sobrecarregado enquanto outro fica ocioso) e hot reload dificulta (não pode tirar um backend do pool sem perder sessões). Solução melhor: session store externo (Redis, DynamoDB) — qualquer backend serve qualquer request.',
      'Sticky sessions são obrigatórias para HTTPS funcionar',
      'Sticky sessions são implementadas apenas no cliente via cookies',
    ],
    correct: 1,
    explanation: 'Formas de implementar: IP Hash (fragil com proxies/CGNAT), Cookie (AWSALB, SERVERID — mais preciso), Header (X-Session-Id). Problema com IP hash: muitos clientes atrás de um único NAT → todos vão para o mesmo backend. Solução definitiva: arquitetura stateless — state no Redis/DB, qualquer backend pode servir. 12-Factor App recomenda stateless.',
  },
];

export default function ProxiesLoadBalancersPage() {
  return (
    <ModuleLayout
      slug="proxies-load-balancers"
      title="Proxies, reverse proxies, load balancers L4 vs L7"
      icon="⚖️"
      xp={70}
      readTime={14}
      trailName="Redes & Web"
      trailColor="#1f6feb"
      nextSlug="websocket-sse-streaming"
      nextTitle="WebSocket, SSE, streaming: comunicação bidirecional"
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
        Entre o cliente e o servidor existem múltiplas camadas de intermediários — cada um com responsabilidade específica. Entender proxies e load balancers é o que diferencia "sobe numa VPS" de "opera em alta disponibilidade".
      </p>

      <Section accent={accent} title="Forward proxy vs reverse proxy">
        <CodeBlock>{`# Forward proxy: serve o CLIENTE (fala em nome dos clientes)
# Cliente → [Forward Proxy] → Internet
# Servidor vê: IP do proxy, não do cliente

# Reverse proxy: serve o SERVIDOR (fala em nome dos servidores)
# Internet → [Reverse Proxy] → Backends
# Cliente vê: IP do reverse proxy, não do backend

# Nginx como reverse proxy simples:
nginx_config = """
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:8000;    # encaminha para backend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
"""

# X-Forwarded-For: lista de IPs que o request atravessou
# "X-Forwarded-For: 203.0.113.1, 10.0.0.1"
# 203.0.113.1 = IP real do cliente
# 10.0.0.1   = IP do primeiro proxy interno

# Cuidado: X-Forwarded-For pode ser forjado pelo cliente!
# Confie apenas no ÚLTIMO IP adicionado por um proxy CONFIÁVEL
# AWS ALB adiciona o IP real do cliente como último entry

# Verificar IP real do cliente em Flask/FastAPI:
from fastapi import Request

def get_real_ip(request: Request) -> str:
    """Extrai IP real do cliente considerando proxies."""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # O IP mais à esquerda é o do cliente (mas pode ser forjado)
        # Em produção: confie apenas em IPs adicionados por seu proxy
        return forwarded_for.split(",")[0].strip()
    return request.client.host`}</CodeBlock>
      </Section>

      <Section accent={accent} title="L4 vs L7: comparação e casos de uso">
        <ComparisonTable
          headers={['Aspecto', 'L4 (TCP/UDP)', 'L7 (HTTP/HTTPS)']}
          rows={[
            ['Visibilidade', 'IP, porta, protocolo TCP', 'Headers, URL, body, cookies'],
            ['Velocidade', 'Mais rápido (sem parsing)', 'Overhead de parse HTTP'],
            ['Roteamento', 'Por IP/porta apenas', 'Por path, header, host, cookie'],
            ['TLS termination', 'Passthrough (não inspeciona)', 'Termina TLS, reinspeciona'],
            ['WebSocket', 'Transparente', 'Requer configuração explícita'],
            ['Banco de dados', 'Sim (qualquer protocolo)', 'Não (sem protocolo DB)'],
            ['WAF / rate limit', 'Não possível', 'Sim'],
            ['Exemplos', 'AWS NLB, HAProxy TCP, IPVS', 'AWS ALB, Nginx, Envoy, Traefik'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Nginx como load balancer L7:
nginx_upstream_config = """
upstream api_backends {
    # Algoritmos de balanceamento:
    # (sem declaração) = round robin  ← padrão, simples
    # least_conn;                     ← menor número de conexões ativas
    # ip_hash;                        ← sticky por IP do cliente
    # random two least_conn;          ← escolhe 2 aleatórios, menor conexão

    server backend1:8000 weight=3;  # recebe 3x mais tráfego
    server backend2:8000 weight=1;
    server backend3:8000 backup;    # só recebe se os outros falharem

    keepalive 32;   # pool de conexões persistentes para os backends
}

server {
    listen 443 ssl http2;

    # Roteamento por path (L7):
    location /api/ {
        proxy_pass http://api_backends;
    }

    location /static/ {
        root /var/www;  # serve arquivos locais (sem proxy)
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Roteamento por header (canary deployment):
    location /v2/ {
        if ($http_x_version = "beta") {
            proxy_pass http://beta_backend;
            break;
        }
        proxy_pass http://stable_backend;
    }
}
"""

# HAProxy como L4/L7:
haproxy_config = """
frontend http_in
    bind *:80
    mode http
    default_backend app_servers

backend app_servers
    mode http
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    server app1 10.0.0.1:8000 check inter 2s fall 3 rise 2
    server app2 10.0.0.2:8000 check inter 2s fall 3 rise 2
    server app3 10.0.0.3:8000 check inter 2s fall 3 rise 2
"""`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Health checks e algoritmos de balanceamento">
        <CodeBlock>{`# Health checks: detectar backends doentes antes que usuários sofram

from fastapi import FastAPI
import time
import psutil

app = FastAPI()

# Endpoint de health check — deve ser leve e rápido:
@app.get("/health")
def health():
    return {"status": "ok", "ts": time.time()}

# Endpoint de readiness (K8s) — verifica dependências:
@app.get("/ready")
async def ready():
    checks = {}

    # Verificar banco de dados:
    try:
        # await db.execute("SELECT 1")
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"

    # Verificar Redis:
    try:
        # await redis.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {e}"

    all_ok = all(v == "ok" for v in checks.values())
    status = 200 if all_ok else 503
    return checks  # retorna 200 = pronto, 503 = não pronto

# Algoritmos de balanceamento:
# Round Robin:   distribui sequencialmente — simples, funciona bem se requests são iguais
# Weighted RR:   versão com pesos — útil quando backends têm capacidades diferentes
# Least Conn:    envia para backend com menos conexões ativas — ideal para long-polling
# Random:        escolha aleatória — simples, funciona bem estatisticamente
# IP Hash:       hash do IP do cliente → mesmo backend (sticky, frágil)
# Consistent Hash: hash do request key → mesmo backend (estável com adição/remoção)

# Consistent hashing (usado em Redis Cluster, Cassandra, CDNs):
import hashlib

class ConsistentHashRing:
    def __init__(self, nodes: list, replicas: int = 100):
        self.ring = {}
        self.sorted_keys = []
        for node in nodes:
            for i in range(replicas):
                key = self._hash(f"{node}:{i}")
                self.ring[key] = node
                self.sorted_keys.append(key)
        self.sorted_keys.sort()

    def _hash(self, s: str) -> int:
        return int(hashlib.md5(s.encode()).hexdigest(), 16)

    def get_node(self, key: str) -> str:
        if not self.ring:
            return None
        h = self._hash(key)
        for ring_key in self.sorted_keys:
            if h <= ring_key:
                return self.ring[ring_key]
        return self.ring[self.sorted_keys[0]]  # wrap around

ring = ConsistentHashRing(["backend1", "backend2", "backend3"])
print(ring.get_node("user:123"))  # sempre o mesmo backend para este user`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Modelo mental:</strong> forward proxy = fala em nome dos clientes (filtro corporativo, privacidade). Reverse proxy = fala em nome dos servidores (TLS termination, cache, LB). L4 = mais rápido, qualquer protocolo TCP/UDP, sem inspeção de payload. L7 = roteamento por conteúdo HTTP, WAF, rate limiting. Sticky sessions são uma muleta — a solução certa é state externo (Redis). Health checks (fall 3, rise 2) garantem que backends doentes saem do pool antes de usuários sofrerem.
      </Callout>

      <Callout>
        Próximo: <strong>WebSocket, SSE e streaming</strong> — comunicação bidirecional e push do servidor para o cliente.
      </Callout>
    </div>
  );
}
