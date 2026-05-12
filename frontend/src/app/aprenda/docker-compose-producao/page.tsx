import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  KeyValue,
  QAItem,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('docker-compose-producao');

const ACCENT = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que usar redes separadas (proxy e data) no Docker Compose de produção?',
    options: [
      'Para economizar memória do servidor',
      'Por segmentação de rede: o Nginx (proxy) fica na rede pública e se comunica com a API; o banco de dados fica em uma rede interna isolada sem acesso externo direto',
      'Porque o Docker não suporta múltiplos serviços na mesma rede',
      'Para melhorar a velocidade de comunicação entre containers',
    ],
    correct: 1,
    explanation:
      'Separar redes é um princípio de segurança: o banco de dados não precisa (nem deve) ter acesso direto ao Nginx. Com redes separadas, o banco só é alcançável pela API. Se o Nginx for comprometido, o atacante não tem acesso direto ao banco — precisa primeiro comprometer a API.',
  },
  {
    question: 'O que acontece com um container que não tem `restart: unless-stopped` configurado e o processo interno crasha?',
    options: [
      'O Docker reinicia automaticamente com contagem de 3 tentativas',
      'O container fica parado e não é reiniciado automaticamente — você precisa reiniciar manualmente ou via monitoramento externo',
      'O Docker Compose reinicia toda a stack',
      'O container é removido e recriado com uma nova imagem',
    ],
    correct: 1,
    explanation:
      'Sem restart policy, um container que crasha fica parado para sempre. Em produção, isso significa downtime silencioso — a aplicação para e ninguém percebe até alguém tentar acessar. `restart: unless-stopped` resolve isso fazendo o Docker reiniciar automaticamente após crashes.',
  },
  {
    question: 'O que a diretiva `condition: service_healthy` no depends_on faz?',
    options: [
      'Verifica se o serviço está rodando há mais de 5 minutos',
      'Aguarda o healthcheck do serviço retornar "healthy" antes de iniciar o serviço dependente — evita a corrida "app sobe antes do banco"',
      'Verifica se o serviço tem pelo menos 100 MB de memória livre',
      'Checa se o serviço responde na porta configurada com TCP',
    ],
    correct: 1,
    explanation:
      'depends_on sem condition apenas espera o container iniciar — mas o PostgreSQL pode estar iniciando internamente por vários segundos após o container subir. `condition: service_healthy` espera o healthcheck passar (ex: pg_isready retornar sucesso), garantindo que o banco está realmente pronto.',
  },
  {
    question: 'Qual é a diferença entre `mem_limit` e `memswap_limit` no Docker Compose?',
    options: [
      'São equivalentes com nomes diferentes',
      '`mem_limit` limita a RAM. `memswap_limit` limita RAM + swap juntos. Se `memswap_limit = mem_limit`, o swap é desativado para aquele container.',
      '`mem_limit` é para serviços, `memswap_limit` é para volumes',
      '`memswap_limit` só funciona se o host tiver swap configurado',
    ],
    correct: 1,
    explanation:
      'mem_limit = 512m significa que o container usa no máximo 512 MB de RAM. Se memswap_limit não for definido, o padrão é 2× o mem_limit em swap. Para evitar que a aplicação use swap (que é muito mais lento), defina memswap_limit igual ao mem_limit.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="docker-compose-producao"
      title="Docker Compose em produção: réplicas e health checks"
      icon="🐳"
      xp={70}
      readTime={15}
      trailName="Deploy Full Stack: VPS, Docker e CI/CD"
      trailColor={ACCENT}
      nextSlug="nginx-proxy-reverso-ssl"
      nextTitle="Nginx: proxy reverso, rate limiting e load balancing"
      relatedSlugs={['docker-completo', 'nginx-proxy-reverso-ssl', 'github-actions-deploy-vps']}
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
        Docker Compose transforma a orquestração de múltiplos containers em um arquivo YAML declarativo. O que levaria
        uma série de <InlineCode>docker run</InlineCode> com flags complexas vira um único <InlineCode>docker compose up -d</InlineCode>.
        Mas um Compose de produção é diferente do de desenvolvimento: redes separadas, health checks reais, limites de recurso,
        restart policies e réplicas. Neste módulo você escreve um <InlineCode>docker-compose.prod.yml</InlineCode> profissional
        do zero.
      </p>

      <Section title="Instalando o Docker na VPS" accent={ACCENT}>
        <p>
          Antes de tudo, instale o Docker Engine na sua VPS Ubuntu 24.04. Use o método oficial (repositório da Docker),
          não o pacote do apt do Ubuntu (versão desatualizada):
        </p>
        <CodeBlock lang="bash">{`# Adicionar a chave GPG oficial do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar o repositório Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine + Compose
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verificar instalação
docker --version
# Docker version 26.x.x, build ...

docker compose version
# Docker Compose version v2.x.x

# Adicionar o usuário deploy ao grupo docker (evitar usar sudo toda vez)
usermod -aG docker deploy

# Habilitar Docker para iniciar com o sistema
systemctl enable docker
systemctl start docker

# Verifique (como usuário deploy, após relogin):
# docker ps`}</CodeBlock>
      </Section>

      <Section title="A estrutura do docker-compose.prod.yml" accent={ACCENT}>
        <p>
          Um Compose de produção tem diferenças fundamentais do de desenvolvimento. Aqui está o arquivo completo
          com explicações inline:
        </p>
        <CodeBlock lang="yaml" filename="deployments/docker-compose.prod.yml">{`# Sintaxe Compose v2 (sem "version:" no topo — depreciado no Compose v2+)
# Nomes EXATOS de service: nginx, api, postgres, redis.

services:
  # ─── Nginx (proxy reverso) ──────────────────────────────────────
  nginx:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/sites:/etc/nginx/conf.d:ro
      - certbot-webroot:/var/www/certbot:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    networks:
      - proxy                  # só na rede de proxy — não acessa o banco
    depends_on:
      api:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 5s
      retries: 3

  # ─── API (backend Go, distroless) ──────────────────────────────
  api:
    image: ghcr.io/feh-franc0/ffv-api:\${IMAGE_TAG:-latest}
    env_file:
      - .env                   # POSTGRES_PASSWORD, REDIS_PASSWORD, JWT_SECRET, DATABASE_URL, REDIS_URL
    networks:
      - proxy                  # fala com Nginx
      - data                   # fala com postgres e redis
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    deploy:
      replicas: 2              # 2 instâncias da API (rolling update no deploy.sh)
      resources:
        limits:
          cpus: '0.75'
          memory: 512M
        reservations:
          cpus: '0.1'
          memory: 128M
    healthcheck:
      # Distroless não tem curl/wget — o binário Go expõe --healthcheck
      # que internamente faz GET /healthz e sai 0/1.
      test: ["CMD", "/api", "--healthcheck"]
      interval: 15s
      timeout: 5s
      start_period: 20s
      retries: 3

  # ─── Postgres (banco de dados) ─────────────────────────────────
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ffv
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: ffv_prod
    ports:
      # Loopback only: expõe pro host (migrate CLI roda do host) mas NÃO pra internet.
      # 0.0.0.0:5432 seria suicídio. 127.0.0.1:5432 é o pulo-do-gato.
      - "127.0.0.1:5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ffv -d ffv_prod"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  # ─── Redis (cache + rate limit) ────────────────────────────────
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass \${REDIS_PASSWORD} --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redisdata:/data
    networks:
      - data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 320M

networks:
  proxy:
    external: true             # criada uma vez com: docker network create proxy
  data:
    driver: bridge
    internal: true             # sem acesso à internet — Postgres e Redis isolados

volumes:
  pgdata:
  redisdata:
  certbot-webroot:`}</CodeBlock>
        <Callout tone="warn">
          <strong>War story — REDIS_URL é obrigatório no .env.</strong> O backend Go usa{' '}
          <InlineCode>envconfig</InlineCode> com{' '}
          <InlineCode>REDIS_URL string envconfig:&quot;REDIS_URL&quot; required:&quot;true&quot;</InlineCode>. Se você
          colocar só <InlineCode>REDIS_PASSWORD</InlineCode> no .env e esquecer{' '}
          <InlineCode>REDIS_URL=redis://:SENHA@redis:6379/0</InlineCode>, o boot quebra na hora com{' '}
          <InlineCode>config: required key REDIS_URL missing value</InlineCode> — e a API nunca fica healthy. Aconteceu
          comigo no primeiro deploy.
        </Callout>
        <Callout tone="info">
          <strong>Por que <InlineCode>127.0.0.1:5432:5432</InlineCode> e não publicar pra fora:</strong> o{' '}
          <InlineCode>migrate</InlineCode> CLI roda <em>no host</em> (não dentro de container) durante o deploy. Para
          o CLI conseguir falar com o Postgres, a porta precisa estar acessível em <InlineCode>localhost</InlineCode>{' '}
          do host. Mas <InlineCode>0.0.0.0:5432</InlineCode> exporia o banco pra internet (atacantes de Shodan acham em
          minutos). O loopback <InlineCode>127.0.0.1</InlineCode> resolve as duas pontas.
        </Callout>
      </Section>

      <Section title="O Dockerfile distroless (multi-stage)" accent={ACCENT}>
        <p>
          A imagem da API é construída em duas etapas: <strong>builder</strong> com o toolchain do Go e{' '}
          <strong>runtime</strong> que é só um sistema mínimo com o binário estático. O resultado é uma imagem
          minúscula (~15-20 MB), sem shell, sem package manager, sem nada além do binário — superfície de ataque
          praticamente nula.
        </p>
        <CodeBlock lang="dockerfile" filename="deployments/Dockerfile">{`# ─── Stage 1: builder ──────────────────────────────────────────
FROM golang:1.25-alpine AS builder

WORKDIR /src

# Cache de módulos: copia go.mod/go.sum primeiro para invalidar
# o cache só quando as dependências mudam (não a cada edit de .go).
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Binário 100% estático para rodar em distroless (que não tem libc completa).
# -s -w remove tabela de símbolos e DWARF, reduzindo o binário em ~30%.
RUN CGO_ENABLED=0 GOOS=linux \\
    go build -ldflags="-s -w" -o /out/api ./cmd/api

# ─── Stage 2: runtime distroless ───────────────────────────────
FROM gcr.io/distroless/static-debian12:nonroot

COPY --from=builder /out/api /api

USER nonroot:nonroot
EXPOSE 8080

# Distroless não tem curl, wget, sh, bash. O healthcheck do Compose
# precisa rodar ALGO — então o próprio binário Go aceita a flag
# --healthcheck, que internamente faz http.Get("http://localhost:8080/healthz")
# e sai com 0 (OK) ou 1 (falha). Sem isso, healthcheck seria impossível.
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \\
    CMD ["/api", "--healthcheck"]

ENTRYPOINT ["/api"]`}</CodeBlock>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Por que distroless?', v: 'Sem shell = atacante que conseguir RCE não tem onde rodar comandos. Sem package manager = não dá pra apt install ferramentas pós-exploração. ~15 MB vs ~200 MB de alpine cheio.' },
            { k: 'Por que CGO_ENABLED=0?', v: 'Binário totalmente estático, sem depender de glibc/musl. Funciona em qualquer base mínima (scratch, distroless static).' },
            { k: 'Por que -s -w?', v: '-s remove tabela de símbolos, -w remove informação de debug DWARF. Binário ~30% menor sem perder funcionalidade. Tradeoff: stacktrace fica menos legível em panic — OK em prod com observabilidade externa.' },
            { k: 'A flag --healthcheck', v: 'O binário Go detecta o argumento, abre HTTP client, faz GET /healthz, e os.Exit(0) ou (1). É o jeito padrão de health check em imagens distroless.' },
          ]}
        />
      </Section>

      <Section title="Health checks: a diferença entre up e healthy" accent={ACCENT}>
        <p>
          Um container pode estar <em>running</em> (processo existe) mas não <em>healthy</em> (serviço respondendo).
          Health checks resolvem isso:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Estado do container', 'O que significa', 'depends_on condition']}
          rows={[
            ['starting', 'Container iniciando, healthcheck ainda não rodou', '-'],
            ['healthy', 'Healthcheck passou nas últimas N tentativas', 'service_healthy ✅'],
            ['unhealthy', 'Healthcheck falhou N vezes consecutivas', 'Docker pode restartar'],
            ['running (sem healthcheck)', 'Processo existe, mas sem verificação de saúde', 'service_started (pouco confiável)'],
          ]}
        />
        <CodeBlock lang="yaml">{`# Exemplos de healthcheck para diferentes serviços:

# API Node.js que expõe /health
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  start_period: 40s    # tempo para a app inicializar antes de começar os checks
  retries: 3

# API Go com wget (alpine não tem curl por padrão)
healthcheck:
  test: ["CMD", "wget", "-qO-", "http://localhost:8080/health"]
  interval: 30s
  timeout: 5s
  retries: 3

# PostgreSQL
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER} -d \${POSTGRES_DB}"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s

# Redis
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 10s
  timeout: 3s
  retries: 3`}</CodeBlock>
      </Section>

      <Section title="Redes separadas: segmentação como segurança" accent={ACCENT}>
        <p>
          Separar a rede de proxy da rede de dados é um princípio de <em>defense in depth</em>. Aqui está o fluxo
          de comunicação com redes separadas:
        </p>
        <CodeBlock lang="text">{`Internet
   │
   ▼
[nginx] ─── rede: proxy ───► [api ×2]
                                │
                           rede: data
                          ┌─────┴─────┐
                          ▼           ▼
                      [postgres]  [redis]

• nginx só está na rede "proxy" — não vê postgres
• api está em ambas as redes — faz a ponte
• postgres e redis só estão em "data" — invisíveis pro nginx
• "internal: true" na rede data = containers não acessam internet
• postgres tem ports: ["127.0.0.1:5432:5432"] (loopback do host só)`}</CodeBlock>
        <Callout tone="success">
          <strong>Por que isso importa:</strong> se o Nginx for comprometido via um exploit (ex: configuração errada
          permitindo path traversal), o atacante não tem como alcançar diretamente o banco de dados — está em uma rede
          diferente. Precisa primeiro comprometer a API.
        </Callout>
      </Section>

      <Section title="Gerenciando o deploy na VPS" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Na VPS, como usuário deploy:

# Clonar o repositório (ou mover os arquivos)
git clone https://github.com/feh-franc0/ffv-api.git /opt/ffv
cd /opt/ffv

# Criar .env com placeholders (NUNCA commitar):
nano .env
# POSTGRES_PASSWORD=<gerado com: openssl rand -hex 32>
# REDIS_PASSWORD=<gerado com: openssl rand -hex 32>
# JWT_SECRET=<gerado com: openssl rand -hex 32>
# DATABASE_URL=postgres://ffv:SENHA@postgres:5432/ffv_prod?sslmode=disable
# REDIS_URL=redis://:SENHA@redis:6379/0   # OBRIGATÓRIO — boot quebra sem ele

# Primeira execução: pull das imagens e subir tudo
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Verificar status
docker compose -f docker-compose.prod.yml ps
# NAME              IMAGE                       STATUS          PORTS
# ffv-nginx-1       nginx:1.27-alpine           Up (healthy)    0.0.0.0:80->80/tcp
# ffv-api-1         ghcr.io/feh-franc0/ffv-api  Up (healthy)
# ffv-api-2         ghcr.io/feh-franc0/ffv-api  Up (healthy)
# ffv-postgres-1    postgres:16-alpine          Up (healthy)    127.0.0.1:5432->5432/tcp
# ffv-redis-1       redis:7-alpine              Up

# Ver logs em tempo real
docker compose -f docker-compose.prod.yml logs -f api

# Deploy de nova versão (rolling update via script — ver módulo "deploy-script-rollback")
docker compose -f docker-compose.prod.yml pull api
docker compose -f docker-compose.prod.yml up -d --no-deps --scale api=2 api`}</CodeBlock>
      </Section>

      <Section title="Resource limits: evitando que um serviço consuma tudo" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'cpus', v: "Fração de CPU disponível. '0.5' = 50% de 1 core. Em um servidor com 2 cores, '2.0' = usar ambos." },
            { k: 'memory (limits)', v: 'Máximo de RAM. Se ultrapassar, o container é reiniciado (OOMKilled). Configure com margem.' },
            { k: 'memory (reservations)', v: 'RAM garantida para o container. O Docker scheduler usa isso para evitar overcommit.' },
            { k: 'memswap_limit', v: 'RAM + swap juntos. Se igual ao memory limit, desativa swap para o container.' },
          ]}
        />
        <CodeBlock lang="bash">{`# Ver uso de recursos em tempo real
docker stats

# Output:
# CONTAINER         CPU %   MEM USAGE / LIMIT   MEM %   NET I/O
# ffv-api-1         2.3%    89MiB / 512MiB      17.3%   1.2MB / 0.8MB
# ffv-api-2         1.8%    91MiB / 512MiB      17.7%   1.1MB / 0.7MB
# ffv-postgres-1    0.5%    180MiB / 1GiB       17.5%   2.3MB / 1.9MB
# ffv-redis-1       0.1%    14MiB / 320MiB      4.3%    0.5MB / 0.3MB
# ffv-nginx-1       0.1%    8MiB / —            —       15MB / 12MB

# Ver eventos do Docker (restarts, OOMKills, etc.)
docker events --filter container=ffv-api-1`}</CodeBlock>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Posso usar réplicas com Docker Compose sem Swarm?"
          a="Sim, parcialmente. Com Compose standalone (sem swarm mode), `deploy.replicas` cria N containers do mesmo serviço, mas o load balancing entre eles deve ser feito pelo Nginx (upstream com múltiplos backends). Para load balancing automático do Docker, seria necessário Swarm ou Kubernetes."
        />
        <QAItem
          q="O que acontece com o banco de dados quando faço `docker compose down`?"
          a="O container é parado e removido, mas o VOLUME persiste. Os dados não são perdidos. Para apagar os dados, use `docker compose down -v` (o -v remove volumes). Nunca faça isso em produção sem backup."
        />
        <QAItem
          q="Devo usar `image:` ou `build:` no Compose de produção?"
          a="Sempre `image:` em produção. `build:` compila no servidor — lento, sem cache do CI, sem versionamento por tag. O correto é buildar a imagem no CI, fazer push para o registry (GHCR, ECR, etc.) e referenciar a imagem por tag no Compose de produção."
        />
      </Section>

      <Callout tone="success">
        <strong>Resumo.</strong> Um Compose de produção tem: redes separadas (proxy + data), health checks em todos os serviços,
        restart policies, resource limits, volumes nomeados para persistência e imagens do registry (não build local).
        O próximo módulo configura o Nginx como proxy reverso para rotear tráfego para as réplicas da API e servir HTTPS.
      </Callout>
    </div>
  );
}
