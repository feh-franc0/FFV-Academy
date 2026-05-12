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
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('nginx-proxy-reverso-ssl');

const ACCENT = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'O que faz o bloco `upstream` no Nginx?',
    options: [
      'Define o certificado SSL do servidor',
      'Agrupa um conjunto de servidores backend e configura como o Nginx distribui requisições entre eles (load balancing)',
      'Configura o rate limiting de requisições',
      'Define as portas que o Nginx escuta',
    ],
    correct: 1,
    explanation:
      'O bloco upstream define um grupo de backends. O Nginx então referencia esse grupo no proxy_pass. Por padrão usa round-robin entre os backends. Você pode usar ip_hash para afinidade de sessão, ou least_conn para rotear para o servidor com menos conexões ativas.',
  },
  {
    question: 'O que a diretiva `limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s` configura?',
    options: [
      'Limita o tamanho máximo de requisição para 10 MB',
      'Cria uma zona de rate limiting chamada "api" que armazena o estado de IPs em 10 MB de memória e permite 10 requisições por segundo por IP',
      'Define timeout de 10 minutos para requisições de API',
      'Limita a API a 10 conexões simultâneas no total',
    ],
    correct: 1,
    explanation:
      '$binary_remote_addr usa o IP do cliente como chave. 10m de memória suporta ~160.000 IPs únicos. rate=10r/s significa 10 requisições por segundo por IP. O Nginx vai enfileirar ou rejeitar (429) requisições que excedam esse limite. Use limit_req na location para ativar.',
  },
  {
    question: 'Qual é o propósito do header HSTS (Strict-Transport-Security)?',
    options: [
      'Habilitar compressão gzip na resposta',
      'Instruir o browser a sempre usar HTTPS para aquele domínio pelo período especificado, mesmo se o usuário digitar http://',
      'Bloquear acesso de IPs específicos',
      'Configurar o tempo de cache do browser',
    ],
    correct: 1,
    explanation:
      'HSTS diz ao browser: "por X segundos, sempre use HTTPS para este domínio". Mesmo que o usuário acesse http://, o browser redireciona internamente para https:// antes de fazer a requisição. Isso elimina a janela de ataque do primeiro request HTTP (SSL stripping).',
  },
  {
    question: 'O que significa `proxy_next_upstream error timeout http_502 http_503` no Nginx?',
    options: [
      'Que o Nginx vai fazer 3 tentativas antes de retornar erro ao cliente',
      'Que o Nginx vai tentar o próximo servidor do upstream quando receber erro, timeout ou status 502/503 do backend atual — failover automático',
      'Que requisições com erro 502 são descartadas silenciosamente',
      'Que o Nginx só aceita respostas com status 200',
    ],
    correct: 1,
    explanation:
      'proxy_next_upstream configura failover automático: se um backend retorna erro de rede, timeout, ou status 502/503, o Nginx automaticamente tenta o próximo servidor no upstream. Com 2 réplicas da API, se uma cair, a outra assume sem que o cliente perceba.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="nginx-proxy-reverso-ssl"
      title="Nginx: proxy reverso, rate limiting e load balancing"
      icon="⚡"
      xp={65}
      readTime={14}
      trailName="Deploy Full Stack: VPS, Docker e CI/CD"
      trailColor={ACCENT}
      nextSlug="ssl-letsencrypt-certbot"
      nextTitle="SSL gratuito: Let's Encrypt e Certbot do zero"
      relatedSlugs={['docker-compose-producao', 'ssl-letsencrypt-certbot', 'vps-seguranca-ssh-firewall']}
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
        Nginx é o servidor web e proxy reverso mais usado no mundo — mais de 40% dos sites usam Nginx na frente da aplicação.
        Neste módulo você configura o Nginx como proxy reverso para uma API com múltiplas réplicas, adiciona rate limiting
        para proteger contra abuse, configura failover automático com <InlineCode>proxy_next_upstream</InlineCode> e aplica
        headers de segurança essenciais. A configuração de SSL é coberta no próximo módulo — aqui tratamos a base HTTP primeiro.
      </p>

      <Section title="Por que Nginx em frente à API?" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Terminação SSL', v: 'Nginx gerencia o certificado SSL — a API recebe tráfego HTTP interno (mais simples e mais rápido)' },
            { k: 'Load balancing', v: 'Distribui requisições entre múltiplas réplicas da API automaticamente' },
            { k: 'Arquivos estáticos', v: 'Nginx serve arquivos estáticos diretamente do disco (muito mais rápido que Node/Go servindo estáticos)' },
            { k: 'Rate limiting', v: 'Protege a API de abuse sem precisar de middleware na aplicação' },
            { k: 'Buffer de requests', v: 'Absorve conexões lentas de clientes — a API recebe a requisição completa de uma vez' },
            { k: 'Headers de segurança', v: 'HSTS, X-Frame-Options, CSP — configurados uma vez no Nginx para todas as respostas' },
          ]}
        />
      </Section>

      <Section title="Estrutura de diretórios do Nginx" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Estrutura recomendada no repositório do projeto
nginx/
├── nginx.conf          # configuração principal (worker_processes, events, http global)
└── sites/
    ├── api.conf        # configuração do virtualhost da API
    └── frontend.conf   # (se servir frontend estático pelo Nginx)

# No docker-compose.prod.yml, monta assim:
# volumes:
#   - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
#   - ./nginx/sites:/etc/nginx/conf.d:ro`}</CodeBlock>
      </Section>

      <Section title="nginx.conf: configuração principal" accent={ACCENT}>
        <CodeBlock lang="nginx">{`# nginx/nginx.conf
user nginx;
worker_processes auto;          # 1 worker por CPU core automaticamente
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;    # conexões simultâneas por worker
    use epoll;                  # melhor performance no Linux
    multi_accept on;            # aceita múltiplas conexões por vez
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Formato de log com informações úteis
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    'rt=$request_time uct=$upstream_connect_time '
                    'uht=$upstream_header_time urt=$upstream_response_time';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Ocultar versão do Nginx nos headers de resposta
    server_tokens off;

    # Compressão gzip para respostas de texto
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;
    gzip_vary on;

    # ─── Rate limiting zones (definidas aqui, usadas nos sites) ────
    # Limite por IP para a API: 10 req/s com burst de 20
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Limite mais rígido para endpoints de autenticação: 5 req/min
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    # ─── Incluir configurações de sites ────────────────────────────
    include /etc/nginx/conf.d/*.conf;
}`}</CodeBlock>
      </Section>

      <Section title="sites/api.conf: proxy reverso com load balancing" accent={ACCENT}>
        <CodeBlock lang="nginx">{`# nginx/sites/api.conf

# ─── Upstream: grupo de backends da API ─────────────────────────
# Os nomes "api" referencia o serviço Docker Compose pelo nome
# Se tiver 2 réplicas (api-1 e api-2), use IPs ou nomes com porta
upstream api_backends {
    # Round-robin por padrão entre os backends listados
    server api:3000;          # nome do serviço Docker, porta interna

    # Com múltiplas réplicas explícitas (se não usar deploy.replicas):
    # server api-1:3000;
    # server api-2:3000;

    # Configurações de health check e timeout do upstream
    keepalive 32;             # mantém 32 conexões HTTP keepalive com o backend
}

# ─── Servidor HTTP: redireciona para HTTPS ──────────────────────
server {
    listen 80;
    server_name api.seudominio.com;

    # Desafio do Let's Encrypt (necessário para renovação de certificado)
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Todo o resto redireciona para HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# ─── Servidor HTTPS ─────────────────────────────────────────────
server {
    listen 443 ssl http2;
    server_name api.seudominio.com;

    # Certificados SSL (gerados pelo Certbot — próximo módulo)
    ssl_certificate /etc/letsencrypt/live/api.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seudominio.com/privkey.pem;

    # Configuração SSL moderna (TLS 1.2 e 1.3 apenas)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # ─── Headers de segurança ───────────────────────────────────
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # ─── Rate limiting na API ───────────────────────────────────
    limit_req zone=api burst=20 nodelay;
    limit_req_status 429;

    # ─── Proxy para a API ───────────────────────────────────────
    location / {
        proxy_pass http://api_backends;

        # Headers necessários para a API conhecer o cliente real
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts razoáveis
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Failover: se o backend retornar erro, tenta o próximo
        proxy_next_upstream error timeout http_502 http_503 http_504;
        proxy_next_upstream_tries 2;

        # HTTP/1.1 necessário para keepalive com o upstream
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    # Rate limiting mais rígido em endpoints de auth
    location /api/v1/auth {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://api_backends;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check público (sem rate limiting)
    location /health {
        proxy_pass http://api_backends;
        access_log off;         # não polui o log com health checks
    }
}`}</CodeBlock>
      </Section>

      <Section title="Rate limiting: entendendo burst e nodelay" accent={ACCENT}>
        <p>
          Rate limiting no Nginx funciona com um algoritmo de <em>leaky bucket</em>. Entender <InlineCode>burst</InlineCode>{' '}
          e <InlineCode>nodelay</InlineCode> é crucial para não bloquear usuários legítimos:
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'rate=10r/s', v: 'Permite 10 requisições por segundo por IP em média (equivale a 1 req a cada 100ms)' },
            { k: 'burst=20', v: 'Permite picos de até 20 requisições acima do limite — ficam em fila antes de serem processadas' },
            { k: 'nodelay', v: 'Processa as requisições em burst imediatamente (sem fila/delay), mas conta para o limite. Sem nodelay, as em burst ficam esperando.' },
            { k: 'Sem burst, sem nodelay', v: 'Qualquer req além de 10/s é rejeitada com 429 imediatamente — muito agressivo para UIs' },
            { k: 'Com burst+nodelay', v: 'Picos curtos passam rapidamente; ataques de volume são bloqueados após o burst' },
          ]}
        />
        <CodeBlock lang="nginx">{`# Exemplo prático de quando cada configuração é adequada:

# API pública — permite picos curtos (load de página com múltiplos requests)
limit_req zone=api burst=20 nodelay;

# Login/autenticação — mais restritivo, sem burst generoso
limit_req zone=auth burst=5;

# Endpoint de upload — processamento mais lento, timeout maior
location /api/upload {
    limit_req zone=api burst=5;
    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_pass http://api_backends;
}`}</CodeBlock>
      </Section>

      <Section title="Headers de segurança: o que cada um faz" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Strict-Transport-Security', v: 'HSTS: browser sempre usa HTTPS por 31536000 segundos (1 ano). includeSubDomains aplica para subdomínios também.' },
            { k: 'X-Frame-Options: DENY', v: 'Impede que seu site seja embarcado em iframe de outro domínio — bloqueia clickjacking.' },
            { k: 'X-Content-Type-Options: nosniff', v: 'Impede que o browser "adivinhe" o tipo de arquivo. Sem isso, um arquivo de texto com HTML pode ser executado como HTML.' },
            { k: 'X-XSS-Protection', v: 'Ativa o filtro XSS de browsers mais antigos. Browsers modernos ignoram (têm proteção própria), mas não custa nada.' },
            { k: 'Referrer-Policy', v: 'Controla quanta informação do Referer é enviada em navegação. strict-origin-when-cross-origin envia só a origem (sem path) em cross-origin.' },
          ]}
        />
      </Section>

      <Section title="Testando a configuração" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Testar configuração sem reiniciar o Nginx (nunca reinicie sem testar)
docker compose exec nginx nginx -t
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Recarregar configuração sem downtime (graceful reload)
docker compose exec nginx nginx -s reload

# Testar headers de segurança com curl
curl -I https://api.seudominio.com
# HTTP/2 200
# strict-transport-security: max-age=31536000; includeSubDomains
# x-frame-options: DENY
# x-content-type-options: nosniff

# Testar rate limiting (vai retornar 429 após o burst)
for i in {1..30}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://api.seudominio.com/api/test
done
# 200 200 200 ... 429 429 429

# Ver logs do Nginx em tempo real
docker compose logs -f nginx

# Ver acessos específicos (ajuda a diagnosticar problemas)
docker compose exec nginx tail -f /var/log/nginx/access.log`}</CodeBlock>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Meu backend usa WebSockets. O que preciso adicionar?"
          a={
            <>
              WebSockets precisam de configuração especial no Nginx para funcionar com proxy. Adicione na location:
              {' '}<InlineCode>proxy_http_version 1.1;</InlineCode>
              {' '}<InlineCode>proxy_set_header Upgrade $http_upgrade;</InlineCode>
              {' '}<InlineCode>proxy_set_header Connection &quot;upgrade&quot;;</InlineCode>
              {' '}Sem isso, o handshake WebSocket falha silenciosamente.
            </>
          }
        />
        <QAItem
          q="Como servir arquivos estáticos do frontend pelo Nginx?"
          a="Adicione um novo location / com root apontando para o diretório dos arquivos estáticos e try_files $uri $uri/ /index.html; (necessário para SPAs com client-side routing). Isso é muito mais eficiente que deixar o backend servir arquivos."
        />
        <QAItem
          q="O que é o header X-Real-IP e por que preciso dele?"
          a="Sem proxy_set_header X-Real-IP $remote_addr, sua API vai ver o IP do Nginx (127.0.0.1 ou IP interno do Docker) como IP do cliente em todas as requisições. Com o header, a API pode ler o IP real do usuário para logs, rate limiting na aplicação, geolocalização, etc."
        />
      </Section>

      <Callout tone="success">
        <strong>Resumo.</strong> O Nginx está configurado como proxy reverso com upstream para múltiplas réplicas,
        rate limiting por zona (geral e de auth), failover automático, headers de segurança e redirecionamento HTTP→HTTPS.
        O próximo módulo adiciona o certificado SSL via Let&apos;s Encrypt para que o HTTPS funcione de verdade.
      </Callout>
    </div>
  );
}
