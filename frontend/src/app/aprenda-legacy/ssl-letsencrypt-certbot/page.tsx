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
  Timeline,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('ssl-letsencrypt-certbot');

const ACCENT = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: "Como o protocolo ACME (usado pelo Let's Encrypt) verifica que você é dono do domínio?",
    options: [
      "Enviando um email para o WHOIS do domínio",
      "Pedindo para você criar um arquivo temporário em um caminho específico do servidor (HTTP-01 challenge) ou registro DNS TXT (DNS-01 challenge), provando controle do domínio",
      "Verificando o certificado SSL atual do domínio",
      "Ligando para o número de telefone do registrante do domínio",
    ],
    correct: 1,
    explanation:
      "O desafio HTTP-01 (mais comum) pede que você sirva um token em /.well-known/acme-challenge/TOKEN. O servidor Let's Encrypt tenta acessar esse URL pelo domínio. Se conseguir ler o token correto, prova que você controla o servidor daquele domínio.",
  },
  {
    question: "Por que você precisa parar o Nginx antes de usar o Certbot no modo standalone?",
    options: [
      "Porque o Certbot e o Nginx não podem usar a mesma versão do OpenSSL",
      "Porque o modo standalone sobe um servidor web temporário próprio na porta 80 para o desafio ACME — se o Nginx estiver na porta 80, ocorre conflito de porta",
      "Porque o Nginx bloqueia a criação de arquivos no diretório /etc/letsencrypt",
      "Por razões de segurança — o Certbot exige que nenhum serviço esteja rodando",
    ],
    correct: 1,
    explanation:
      "O modo standalone do Certbot sobe um servidor HTTP temporário na porta 80 para responder ao desafio ACME. Se o Nginx já ocupa a porta 80, haverá conflito e o Certbot falhará. Alternativa: usar o modo webroot (Nginx continua rodando, Certbot escreve o challenge no diretório configurado).",
  },
  {
    question: "Os certificados do Let's Encrypt expiram em 90 dias. Por que isso é considerado uma vantagem?",
    options: [
      "Não é uma vantagem — é uma limitação técnica que não conseguiram resolver",
      "Validade curta incentiva renovação automática e limita o impacto de comprometimento de uma chave privada roubada — após 90 dias o certificado comprometido expira",
      "Facilita o trabalho dos administradores de sistema que precisam renovar manualmente",
      "Reduz o custo do serviço para o Let's Encrypt",
    ],
    correct: 1,
    explanation:
      "90 dias é uma decisão de design deliberada: força automação (ninguém renova manualmente a cada 3 meses), reduz o impacto de certificados comprometidos (expiram em até 90 dias) e incentiva práticas modernas de PKI. CAs tradicionais emitem por 1-2 anos, aumentando o risco de chaves roubadas.",
  },
  {
    question: "Como verificar se seu certificado SSL está válido e por quanto tempo falta para expirar?",
    options: [
      "Acessar o site no browser e ver se aparece o cadeado",
      "openssl s_client -connect seudominio.com:443 | openssl x509 -noout -dates",
      "cat /etc/ssl/certs/*.pem",
      "certbot status",
    ],
    correct: 1,
    explanation:
      "openssl s_client conecta ao servidor via TLS e passa o certificado para openssl x509 que extrai as datas. Você vê exatamente quando o certificado foi emitido e quando expira. Equivalente: certbot certificates também mostra esta informação.",
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ssl-letsencrypt-certbot"
      title="SSL gratuito: Let's Encrypt e Certbot do zero"
      icon="🔐"
      xp={50}
      readTime={11}
      trailName="Deploy Full Stack: VPS, Docker e CI/CD"
      trailColor={ACCENT}
      nextSlug="github-actions-deploy-vps"
      nextTitle="CI/CD com GitHub Actions: deploy automático na VPS"
      relatedSlugs={['nginx-proxy-reverso-ssl', 'github-actions-deploy-vps', 'vps-seguranca-ssh-firewall']}
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
        Antes do Let&apos;s Encrypt, um certificado SSL custava entre $50 e $300 por ano e envolvia validação manual com a CA.
        O Let&apos;s Encrypt mudou isso em 2015: certificados gratuitos, automáticos e com renovação via API (protocolo ACME).
        Hoje é o padrão para qualquer projeto sério. Neste módulo você entende como o protocolo ACME funciona, emite o primeiro
        certificado com Certbot e configura renovação automática.
      </p>

      <Section title="Como o ACME funciona por baixo" accent={ACCENT}>
        <p>
          ACME (Automatic Certificate Management Environment) é o protocolo que o Certbot implementa para comunicar com
          o Let&apos;s Encrypt. O fluxo do desafio HTTP-01 (o mais comum):
        </p>
        <Timeline
          accent={ACCENT}
          events={[
            {
              when: '1',
              label: 'Certbot pede certificado para o domínio',
              detail: 'Certbot gera um par de chaves (Account Key) e envia requisição para o servidor ACME do Let\'s Encrypt: "quero um certificado para api.seudominio.com"',
            },
            {
              when: '2',
              label: "Let's Encrypt emite um desafio",
              detail: 'Servidor ACME responde: "coloque o token XYZ em http://api.seudominio.com/.well-known/acme-challenge/TOKEN"',
              highlight: true,
            },
            {
              when: '3',
              label: 'Certbot serve o token',
              detail: 'Certbot (modo standalone) sobe um servidor HTTP temporário na porta 80 que responde ao caminho do desafio com o token.',
            },
            {
              when: '4',
              label: "Let's Encrypt verifica",
              detail: 'Servidor ACME faz uma requisição HTTP para seu domínio e lê o token. Se bater, a propriedade do domínio está provada.',
              highlight: true,
            },
            {
              when: '5',
              label: 'Certificado emitido',
              detail: 'Let\'s Encrypt assina e entrega o certificado (fullchain.pem) e a chave privada (privkey.pem). Válido por 90 dias.',
            },
          ]}
        />
        <Callout tone="info">
          <strong>Pré-requisito:</strong> o domínio deve apontar para o IP da sua VPS <em>antes</em> de emitir o certificado.
          O Let&apos;s Encrypt faz uma consulta DNS e depois uma requisição HTTP — se o DNS não aponta para o servidor certo,
          o desafio falha.
        </Callout>
      </Section>

      <Section title="Configurando o DNS" accent={ACCENT}>
        <p>
          Antes de emitir o certificado, aponte seu domínio para o IP da VPS. No painel do seu registrador (ex: Hostinger,
          Namecheap, Cloudflare):
        </p>
        <CodeBlock lang="bash">{`# Registros DNS necessários (no painel do registrador):
# Tipo   Nome            Valor               TTL
# A      @               203.0.113.10        300     ← root domain → IP da VPS
# A      api             203.0.113.10        300     ← api.seudominio.com → IP
# CNAME  www             seudominio.com      300     ← www → root

# Verificar propagação DNS (pode levar até 24h, mas geralmente < 5min):
dig api.seudominio.com +short
# 203.0.113.10   ← se mostrar o IP correto, está propagado

# Ou use nslookup:
nslookup api.seudominio.com
# Address: 203.0.113.10`}</CodeBlock>
      </Section>

      <Section title="Instalando o Certbot na VPS" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Certbot via snap (método recomendado pelo Let's Encrypt para Ubuntu)
snap install --classic certbot

# Criar symlink para usar o comando diretamente
ln -s /snap/bin/certbot /usr/local/bin/certbot

# Verificar instalação
certbot --version
# certbot 2.x.x`}</CodeBlock>
      </Section>

      <Section title="Emitindo o primeiro certificado" accent={ACCENT}>
        <p>
          Se estiver usando o modo standalone (Certbot sobe servidor web próprio), pare o Nginx primeiro:
        </p>
        <Callout tone="warn">
          <strong>War story — nginx do HOST ocupando porta 80.</strong> Na primeira tentativa, rodei certbot{' '}
          <InlineCode>--standalone</InlineCode> com o nginx do Docker parado e levei{' '}
          <InlineCode>Could not bind TCP port 80 because it is already in use by another process</InlineCode>. Causa:
          a VPS Ubuntu fresh tinha um <InlineCode>nginx</InlineCode> instalado <em>no host</em> (não-Docker), ativo
          por padrão depois de <InlineCode>apt install nginx</InlineCode> em algum passo anterior. Solução:{' '}
          <InlineCode>systemctl stop nginx</InlineCode> e <InlineCode>systemctl disable nginx</InlineCode> antes do
          certbot. O nginx do projeto vive no Docker — o do host só atrapalha.
        </Callout>
        <CodeBlock lang="bash">{`# ANTES DO CERTBOT — desativar nginx do host se existir
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl disable nginx 2>/dev/null || true
# Confirmar que nada ocupa a porta 80:
sudo ss -tlnp | grep ':80 ' || echo "porta 80 livre"

# OPÇÃO 1: Modo standalone (requer parar o Nginx do Docker temporariamente)
# Parar o Nginx se estiver rodando
docker compose -f docker-compose.prod.yml stop nginx

# Emitir certificado
certbot certonly \
  --standalone \
  --email seu-email@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d api.seudominio.com

# Reiniciar o Nginx após emissão
docker compose -f docker-compose.prod.yml start nginx

# ─────────────────────────────────────────────────────────────────

# OPÇÃO 2: Modo webroot (Nginx continua rodando — recomendado)
# Requer que o Nginx sirva /.well-known/acme-challenge/ de um diretório
# (já configurado na aula de Nginx com o volume certbot-webroot)
certbot certonly \
  --webroot \
  -w /var/www/certbot \
  --email seu-email@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d api.seudominio.com \
  -d www.seudominio.com    # pode adicionar múltiplos domínios`}</CodeBlock>
        <Callout tone="warn">
          <strong>Rate limits do Let&apos;s Encrypt:</strong> você pode emitir no máximo 5 certificados por domínio por semana.
          Durante testes, use o parâmetro <InlineCode>--staging</InlineCode> para obter um certificado de teste
          (não confiável pelo browser, mas sem rate limit). Remova <InlineCode>--staging</InlineCode> apenas para produção real.
        </Callout>
      </Section>

      <Section title="Onde ficam os certificados" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Após emissão bem-sucedida:
ls /etc/letsencrypt/live/api.seudominio.com/
# cert.pem       ← apenas o certificado do domínio (sem chain)
# chain.pem      ← certificados intermediários
# fullchain.pem  ← cert.pem + chain.pem (USE ESTE no Nginx)
# privkey.pem    ← chave privada (NUNCA exponha)

# No Nginx (como configurado no módulo anterior):
# ssl_certificate /etc/letsencrypt/live/api.seudominio.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/api.seudominio.com/privkey.pem;

# Ver detalhes do certificado emitido
certbot certificates
# Found the following certs:
#   Certificate Name: api.seudominio.com
#     Domains: api.seudominio.com
#     Expiry Date: 2026-08-10 (VALID: 89 days)
#     Certificate Path: /etc/letsencrypt/live/api.seudominio.com/fullchain.pem
#     Private Key Path: /etc/letsencrypt/live/api.seudominio.com/privkey.pem`}</CodeBlock>
      </Section>

      <Section title="Renovação automática com cron" accent={ACCENT}>
        <p>
          Certificados do Let&apos;s Encrypt expiram em 90 dias. Configure renovação automática para nunca deixar o
          certificado expirar:
        </p>
        <CodeBlock lang="bash">{`# Testar a renovação (dry run — não renova de verdade, só testa o processo)
certbot renew --dry-run
# Simulating renewal of an existing certificate for api.seudominio.com
# ...
# Congratulations, all simulated renewals succeeded.

# O certbot via snap já cria um timer systemd automático (verificar):
systemctl list-timers | grep certbot
# snap.certbot.renew.timer   Sat 2026-06-01 00:00:00 UTC  23h left

# Se não tiver o timer, adicione um cron job:
crontab -e
# Adicione a linha:
# 0 3 * * * /usr/bin/certbot renew --quiet --post-hook "docker compose -f /opt/meu-app/docker-compose.prod.yml exec nginx nginx -s reload"

# O Certbot só renova se faltar menos de 30 dias — seguro rodar diariamente
# O --post-hook recarrega o Nginx APENAS se houve renovação bem-sucedida

# Verificar o próximo agendamento
crontab -l`}</CodeBlock>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: '--quiet', v: 'Não imprime saída se não houver renovação (evita emails de cron desnecessários)' },
            { k: '--post-hook', v: 'Comando executado APENAS após renovação bem-sucedida. Ideal para recarregar Nginx.' },
            { k: '--pre-hook', v: 'Executado antes de tentar renovar. Use para parar o Nginx em modo standalone.' },
            { k: 'Quando renova', v: 'Quando faltam menos de 30 dias para expirar. Com renovação diária, você tem 30 dias de buffer.' },
          ]}
        />
      </Section>

      <Section title="Testando o SSL com curl e openssl" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Verificar se o HTTPS está funcionando
curl -v https://api.seudominio.com/health
# * Server certificate:
# *  subject: CN=api.seudominio.com
# *  start date: May 10 00:00:00 2026 GMT
# *  expire date: Aug 8 23:59:59 2026 GMT
# *  issuer: C=US, O=Let's Encrypt, CN=R3
# *  SSL certificate verify ok.

# Ver datas de validade do certificado
echo | openssl s_client -connect api.seudominio.com:443 -servername api.seudominio.com 2>/dev/null | openssl x509 -noout -dates
# notBefore=May 10 00:00:00 2026 GMT
# notAfter=Aug  8 23:59:59 2026 GMT

# Testar que HTTP redireciona para HTTPS
curl -I http://api.seudominio.com
# HTTP/1.1 301 Moved Permanently
# Location: https://api.seudominio.com/

# Verificar a nota de segurança SSL (deve ser A ou A+)
# Use: https://www.ssllabs.com/ssltest/analyze.html?d=api.seudominio.com`}</CodeBlock>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Posso usar um único certificado para múltiplos subdomínios?"
          a="Sim. Adicione múltiplos -d no comando do Certbot: -d seudominio.com -d api.seudominio.com -d www.seudominio.com. O certificado resultante é um SAN (Subject Alternative Names) válido para todos esses domínios. Limite: 100 domínios por certificado."
        />
        <QAItem
          q="O que fazer quando o certificado expirar sem renovar automaticamente?"
          a="Execute certbot renew manualmente. Se falhar (ex: nginx ocupando a porta), pare o Nginx, execute certbot renew --force-renewal, e reinicie o Nginx. Certifique-se de que o cron/systemd timer está ativo para evitar que aconteça novamente."
        />
        <QAItem
          q="Certificado wildcard (*.seudominio.com) é possível com Let's Encrypt?"
          a="Sim, mas requer o desafio DNS-01 (criar um registro TXT no DNS) em vez do HTTP-01. Você precisa de uma API do seu registrador de domínio para automatizar a criação do registro TXT. Certbot tem plugins para Cloudflare, Route53, DigitalOcean, etc."
        />
      </Section>

      <Callout tone="success">
        <strong>SSL configurado.</strong> Você tem HTTPS com certificado válido, renovação automática e redirecionamento
        HTTP→HTTPS. O próximo módulo automatiza todo o deploy com GitHub Actions — zero intervenção manual para colocar
        uma nova versão em produção.
      </Callout>
    </div>
  );
}
