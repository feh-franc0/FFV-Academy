import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  KeyValue,
  QAItem,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-mvp-fullstack');

const ACCENT = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Você acabou de fazer deploy de uma nova versão da API e o health check falhou. Qual é a primeira ação?',
    options: [
      'Reiniciar toda a stack com docker compose down && docker compose up',
      'Verificar os logs do container com `docker compose logs api` para entender a causa do erro antes de qualquer outra ação',
      'Fazer rollback imediatamente sem investigar',
      'Aumentar os recursos (RAM/CPU) do servidor',
    ],
    correct: 1,
    explanation:
      'Logs primeiro, sempre. O erro pode ser: variável de ambiente faltando, conexão com banco falhou, porta errada, código com bug. Sem entender a causa, qualquer ação é chute. `docker compose logs api` mostra o que o processo tentou fazer antes de falhar.',
  },
  {
    question: 'O que é monitoramento de uptime e por que é importante após o deploy?',
    options: [
      'É apenas uma métrica cosmética para dashboards',
      'É a verificação automática e periódica de que o site/API responde corretamente — sem isso, você pode ter horas de downtime sem perceber até um usuário reclamar',
      'É o tempo que o servidor ficou ligado sem reiniciar',
      'É o monitoramento do uso de banda de rede',
    ],
    correct: 1,
    explanation:
      'Sem monitoramento, downtime é invisível para você. Um certificado SSL que expirou, um container que crashou por OOM, um banco que ficou sem espaço — você só descobre quando o usuário reclama. Ferramentas como UptimeRobot (gratuito) verificam a cada 5 minutos e enviam alerta se o site cair.',
  },
  {
    question: 'Qual é a estratégia mínima de backup para um banco de dados PostgreSQL em produção?',
    options: [
      'O Docker Compose faz backup automático dos volumes',
      'Dump diário com pg_dump, comprimido e enviado para um local externo (S3, Google Drive, outro servidor) — o volume Docker não é backup (está no mesmo servidor)',
      'Fazer snapshot do servidor todo mês',
      'PostgreSQL tem replicação automática built-in',
    ],
    correct: 1,
    explanation:
      'Volume Docker e o servidor são o mesmo ponto de falha. Se o servidor pega fogo (literalmente ou metaforicamente — falha de disco, exclusão acidental), você perde tudo. Backup externo é cópia dos dados em local geograficamente separado. pg_dump + cron + upload para S3 é o mínimo aceitável.',
  },
  {
    question: 'Como verificar se o deploy foi bem-sucedido após `docker compose up -d`?',
    options: [
      'Aguardar 5 minutos e assumir que funcionou',
      'Verificar que os containers estão "healthy" com `docker compose ps`, testar o endpoint de health com curl, e verificar nos logs que não há erros de inicialização',
      'Olhar o output do docker compose up — se não mostrou erro, está OK',
      'Testar apenas no browser acessando o site',
    ],
    correct: 1,
    explanation:
      '`docker compose ps` mostra o status dos containers (Up, Exited, Restarting). Status "Restarting" indica que o container está crashando e sendo reiniciado em loop — parece que está rodando mas não está. O endpoint /health + logs confirmam que a aplicação está de fato respondendo corretamente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-mvp-fullstack"
      title="Capstone: MVP full stack do zero à produção"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="Deploy Full Stack: VPS, Docker e CI/CD"
      trailColor={ACCENT}
      relatedSlugs={['docker-compose-producao', 'github-actions-deploy-vps', 'nginx-proxy-reverso-ssl']}
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
        Este é o módulo de fechamento da trilha. Não há conceito novo aqui — é o checklist completo de tudo que você aprendeu,
        na ordem correta, com comandos de verificação para cada etapa. Use como guia quando for colocar um MVP em produção do
        zero. No final, você terá: VPS segura, Docker Compose rodando, Nginx com SSL, CI/CD automático, secrets gerenciados e
        frontend deployado. E saberá o que fazer a seguir.
      </p>

      <Section title="Fase 1: Infraestrutura base" accent={ACCENT}>
        <p>
          <strong>Checklist: VPS provisionada e segura</strong>
        </p>
        <CodeBlock lang="bash">{`# ─── 1.1 VPS provisionada ───────────────────────────────────────
# [ ] VPS Ubuntu 24.04 LTS criada na Hostinger (ou outro provedor)
# [ ] IP do servidor anotado

# Verificação: login SSH funciona?
ssh root@203.0.113.10 "hostname && uname -a"
# ubuntu-servidor Linux 6.8.0-... x86_64

# ─── 1.2 Sistema atualizado ─────────────────────────────────────
# [ ] apt update && apt upgrade -y executado
# [ ] Hostname configurado

# Verificação:
ssh root@203.0.113.10 "hostnamectl && cat /var/run/reboot-required 2>/dev/null || echo 'OK'"

# ─── 1.3 Usuário não-root criado ────────────────────────────────
# [ ] Usuário "deploy" criado com sudo
# [ ] Chave SSH da máquina local adicionada para o usuário deploy
# [ ] Login SSH como usuário deploy funciona

# Verificação: login com usuário não-root
ssh deploy@203.0.113.10 "id && sudo whoami"
# uid=1000(deploy) ... groups=... sudo
# root

# ─── 1.4 SSH seguro ─────────────────────────────────────────────
# [ ] PermitRootLogin no configurado no sshd_config
# [ ] PasswordAuthentication no configurado
# [ ] sshd reiniciado

# Verificação:
ssh deploy@203.0.113.10 "sudo sshd -T | grep -E 'permitrootlogin|passwordauthentication'"
# permitrootlogin no
# passwordauthentication no

# ─── 1.5 Firewall UFW ───────────────────────────────────────────
# [ ] UFW ativo com default deny incoming
# [ ] Portas 22, 80, 443 liberadas

# Verificação:
ssh deploy@203.0.113.10 "sudo ufw status"
# Status: active
# 22/tcp ALLOW Anywhere
# 80/tcp ALLOW Anywhere
# 443/tcp ALLOW Anywhere

# ─── 1.6 fail2ban ───────────────────────────────────────────────
# [ ] fail2ban instalado e ativo
# [ ] Jail sshd habilitado

# Verificação:
ssh deploy@203.0.113.10 "sudo fail2ban-client status sshd"
# Status for the jail: sshd
# |- Filter: ...
# \`- Actions: Currently banned: 0`}</CodeBlock>
      </Section>

      <Section title="Fase 2: Docker e aplicação" accent={ACCENT}>
        <CodeBlock lang="bash">{`# ─── 2.1 Docker instalado ───────────────────────────────────────
# [ ] Docker Engine instalado via repositório oficial
# [ ] Usuário deploy está no grupo docker

# Verificação:
ssh deploy@203.0.113.10 "docker --version && docker compose version && groups"
# Docker version 26.x.x
# Docker Compose version v2.x.x
# deploy sudo docker

# ─── 2.2 Aplicação no servidor ──────────────────────────────────
# [ ] Repositório clonado em /opt/meu-app ou arquivos copiados
# [ ] docker-compose.prod.yml na pasta da aplicação
# [ ] .env.production criado com os valores reais (chmod 600)

# Verificação:
ssh deploy@203.0.113.10 "ls -la /opt/meu-app/ && stat -c '%a' /opt/meu-app/.env.production"
# total ...
# -rw-r--r--  docker-compose.prod.yml
# -rw-------  .env.production          ← 600 = correto
# 600

# ─── 2.3 Containers rodando e healthy ───────────────────────────
# [ ] docker compose up -d executado
# [ ] Todos os containers estão "Up (healthy)"

# Verificação:
ssh deploy@203.0.113.10 "docker compose -f /opt/meu-app/docker-compose.prod.yml ps"
# NAME          STATUS          PORTS
# app-nginx-1   Up (healthy)    0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
# app-api-1     Up (healthy)
# app-api-2     Up (healthy)
# app-db-1      Up (healthy)
# app-cache-1   Up

# Health check da API diretamente:
ssh deploy@203.0.113.10 "curl -f http://localhost:3000/health"
# {"status":"ok","version":"1.0.0"}`}</CodeBlock>
      </Section>

      <Section title="Fase 3: Nginx e SSL" accent={ACCENT}>
        <CodeBlock lang="bash">{`# ─── 3.1 DNS apontando para a VPS ──────────────────────────────
# [ ] Registro A do domínio apontando para o IP da VPS

# Verificação:
dig seudominio.com +short
# 203.0.113.10   ← deve ser o IP da sua VPS

# ─── 3.2 Nginx rodando e servindo a API ─────────────────────────
# [ ] nginx.conf e sites/ configurados corretamente
# [ ] Proxy reverso para a API funcionando
# [ ] HTTP redireciona para HTTPS

# Verificação:
curl -I http://seudominio.com
# HTTP/1.1 301 Moved Permanently
# Location: https://seudominio.com/

# ─── 3.3 SSL com Let's Encrypt ──────────────────────────────────
# [ ] Certificado emitido pelo Certbot
# [ ] HTTPS funcionando sem erro de certificado
# [ ] Renovação automática configurada (cron ou systemd timer)

# Verificação:
curl -I https://seudominio.com
# HTTP/2 200
# strict-transport-security: max-age=31536000; includeSubDomains

# Verificar data de expiração do certificado:
echo | openssl s_client -connect seudominio.com:443 2>/dev/null | openssl x509 -noout -enddate
# notAfter=Aug  8 23:59:59 2026 GMT

# Verificar renovação automática:
certbot renew --dry-run
# All simulated renewals succeeded.`}</CodeBlock>
      </Section>

      <Section title="Fase 4: CI/CD" accent={ACCENT}>
        <CodeBlock lang="bash">{`# ─── 4.1 Secrets no GitHub Actions ─────────────────────────────
# [ ] VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_PORT configurados
# [ ] HOSTINGER_FTP_SERVER, HOSTINGER_FTP_USERNAME, HOSTINGER_FTP_PASSWORD configurados
# [ ] DEPLOY_ENABLED = true (em Variables, não Secrets)

# Verificação:
# GitHub → Settings → Secrets and variables → Actions
# Todos os secrets devem aparecer como "Updated X days ago"

# ─── 4.2 Pipeline rodando com sucesso ───────────────────────────
# [ ] Primeiro push na main disparou o workflow
# [ ] Todos os jobs passaram (check, build-push, deploy)
# [ ] Imagem aparece no GHCR (GitHub → Packages)

# Verificação no servidor:
ssh deploy@203.0.113.10 "docker images ghcr.io/seu-usuario/sua-api"
# REPOSITORY                        TAG          IMAGE ID    CREATED
# ghcr.io/seu-usuario/sua-api       sha-abc1234  ...         2 hours ago

# ─── 4.3 Deploy automático funcionando ──────────────────────────
# [ ] Faça uma mudança pequena, commit e push
# [ ] Aguardar o workflow completar (~3-5 minutos)
# [ ] A mudança aparece em produção

# Verificação após push:
# Abra GitHub → Actions e acompanhe o workflow ao vivo
# Após completion: curl https://api.seudominio.com/version para ver a nova versão`}</CodeBlock>
      </Section>

      <Section title="Fase 5: Frontend" accent={ACCENT}>
        <CodeBlock lang="bash">{`# ─── 5.1 Frontend deployado ─────────────────────────────────────
# [ ] next.config.ts com output: "export" e trailingSlash: true
# [ ] Build gera a pasta out/ sem erros
# [ ] FTP-Deploy-Action enviou os arquivos para /public_html/

# Verificação:
curl -I https://seudominio.com
# HTTP/2 200
# content-type: text/html; charset=utf-8

# Testar uma página interna (verifica trailingSlash):
curl -I https://seudominio.com/sobre/
# HTTP/2 200

# Verificar que a API está sendo chamada corretamente:
# Abra o browser → DevTools → Network → filtrar por "api"
# As requisições devem ir para https://api.seudominio.com

# ─── 5.2 Variável de ambiente correta ───────────────────────────
# [ ] NEXT_PUBLIC_API_BASE_URL aponta para a URL correta da API

# Verificação (no browser, abrir o JS bundle e procurar a URL):
curl https://seudominio.com/_next/static/chunks/*.js | grep -o '"https://api[^"]*"' | head -1
# "https://api.seudominio.com"`}</CodeBlock>
      </Section>

      <Section title="O que fazer a seguir: próximos passos" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: '📊 Monitoramento de uptime', v: 'UptimeRobot (gratuito): verifica a cada 5min e envia email se o site cair. Configure para API e frontend.' },
            { k: '💾 Backup do banco de dados', v: 'Cron diário com pg_dump + upload para S3 ou Google Drive. O volume Docker não é backup.' },
            { k: '📈 Métricas da aplicação', v: 'Prometheus + Grafana (stack completa) ou New Relic (SaaS mais simples). Monitore latência de API, uso de RAM, erros 5xx.' },
            { k: '📧 Email com domínio próprio', v: 'Hostinger inclui email com o domínio. Configure MX records e use o painel de email da Hostinger.' },
            { k: '🔄 Rotação de secrets', v: 'Defina uma agenda (90 dias) para rotacionar JWT_SECRET, senhas de banco e API keys externas.' },
            { k: '📝 Logs centralizados', v: 'docker compose logs vai crescendo indefinidamente. Configure log rotation ou envie para uma ferramenta como Loki + Grafana.' },
            { k: '🔒 Scan de vulnerabilidades', v: 'Trivy ou docker scout cves na imagem Docker. Configure no CI para falhar em CVE críticos.' },
            { k: '🌍 CDN para assets', v: 'Para tráfego global, Cloudflare (gratuito) na frente do Hostinger cache e distribui os assets estáticos globalmente.' },
          ]}
        />
      </Section>

      <Section title="Diagnóstico rápido: o que fazer quando algo dá errado" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Sintoma', 'Onde investigar', 'Comandos de diagnóstico']}
          rows={[
            ['Site retorna 502 Bad Gateway', 'Nginx → API (API caiu ou não está healthy)', 'docker compose ps api && docker compose logs api'],
            ['Site retorna 504 Gateway Timeout', 'API demorando muito (db lento, query pesada)', 'docker compose logs api | grep timeout'],
            ['Certificado SSL expirado', 'Certbot não renovou automaticamente', 'certbot certificates && certbot renew'],
            ['Container em loop Restarting', 'Crash da aplicação (erro de inicialização)', 'docker compose logs --tail 50 api'],
            ['Banco de dados inacessível', 'Container db parado ou sem memória', 'docker compose ps db && docker stats db'],
            ['Deploy falhou no CI', 'Logs do GitHub Actions', 'GitHub → Actions → Workflow → Job com X vermelho'],
            ['Frontend com dados antigos', 'Cache do browser ou CDN', 'Ctrl+Shift+R (hard reload) ou Cloudflare → Purge Cache'],
          ]}
        />
        <CodeBlock lang="bash">{`# Kit de sobrevivência: comandos essenciais de diagnóstico

# Ver status geral
docker compose -f /opt/meu-app/docker-compose.prod.yml ps

# Ver logs de todos os serviços (últimas 100 linhas)
docker compose -f /opt/meu-app/docker-compose.prod.yml logs --tail 100

# Ver uso de recursos em tempo real
docker stats

# Verificar espaço em disco (problema comum em produção)
df -h
du -sh /var/lib/docker/volumes/*

# Limpar imagens e containers não utilizados (libera espaço)
docker system prune -f

# Verificar se o banco de dados está respondendo
docker compose -f /opt/meu-app/docker-compose.prod.yml exec db pg_isready -U app

# Verificar logs do Nginx
docker compose -f /opt/meu-app/docker-compose.prod.yml logs --tail 50 nginx

# Verificar logs do sistema (kernel, OOM killer, etc.)
journalctl -n 100 --no-pager`}</CodeBlock>
      </Section>

      <Section title="Configurando o backup automático" accent={ACCENT}>
        <p>
          Backup do PostgreSQL é não-negociável em produção. Configure agora:
        </p>
        <CodeBlock lang="bash">{`# Script de backup diário do PostgreSQL
cat > /opt/meu-app/scripts/backup.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_DIR=/opt/backups/postgres
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Dump do banco comprimido
docker compose -f /opt/meu-app/docker-compose.prod.yml exec -T db \
  pg_dump -U app app | gzip > "$BACKUP_FILE"

echo "Backup criado: $BACKUP_FILE ($(du -sh $BACKUP_FILE | cut -f1))"

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "backup_*.sql.gz" | sort -r | tail -n +8 | xargs rm -f

echo "Backups disponíveis:"
ls -lh $BACKUP_DIR
EOF

chmod +x /opt/meu-app/scripts/backup.sh

# Testar o script:
/opt/meu-app/scripts/backup.sh

# Agendar backup diário às 3h da manhã:
crontab -e
# Adicione:
# 0 3 * * * /opt/meu-app/scripts/backup.sh >> /var/log/backup.log 2>&1`}</CodeBlock>
      </Section>

      <Section title="Configurando o UptimeRobot" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Crie uma conta gratuita', v: 'uptimerobot.com — plano gratuito monitora até 50 URLs a cada 5 minutos' },
            { k: 'Monitor tipo HTTP(S)', v: 'URL: https://api.seudominio.com/health — monitora o endpoint de health da API' },
            { k: 'Monitor tipo HTTP(S)', v: 'URL: https://seudominio.com — monitora o frontend' },
            { k: 'Configure alertas', v: 'Email ou Telegram quando o site cair (response time > 30s ou status != 200)' },
            { k: 'Status page pública', v: 'UptimeRobot gera uma página de status pública (status.seudominio.com) — transparência para usuários' },
          ]}
        />
      </Section>

      <Section title="Parabéns: o que você construiu" accent={ACCENT}>
        <p>
          Ao completar esta trilha, você tem na prática:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Componente', 'O que você aprendeu', 'Por que importa']}
          rows={[
            ['VPS Ubuntu 24.04', 'Provisionar, atualizar, configurar hostname', 'Infraestrutura própria sem dependência de PaaS'],
            ['SSH + UFW + fail2ban', 'Usuário não-root, firewall, proteção de brute force', 'Servidor seguro desde o primeiro dia'],
            ['Docker Compose prod', 'Redes separadas, health checks, resource limits', 'Orquestração de múltiplos serviços com confiabilidade'],
            ['Nginx proxy reverso', 'Upstream, rate limiting, headers de segurança', 'Camada profissional entre internet e aplicação'],
            ["Let's Encrypt SSL", 'Protocolo ACME, Certbot, renovação automática', 'HTTPS gratuito e automático para sempre'],
            ['GitHub Actions CI/CD', 'Pipeline check → build → deploy, GHCR, SSH deploy', 'Deploy automático e confiável em toda mudança'],
            ['Secrets management', 'openssl rand, GitHub Secrets, env_file, chmod 600', 'Credenciais nunca expostas no código'],
            ['FTP Deploy incremental', 'output: export, sync por hash, trailingSlash', 'Frontend estático barato e deploy rápido'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Esta stack escala para produção real com muitos usuários?"
          a="Para MVPs e projetos de pequeno/médio porte: sim. Uma VPS de 4-8 GB de RAM com 2-4 réplicas da API aguenta centenas de usuários simultâneos. Para escala maior, os próximos passos são: load balancer dedicado, múltiplos servidores, banco de dados gerenciado (RDS/Cloud SQL), e orquestração com Kubernetes."
        />
        <QAItem
          q="Preciso de tudo isso para um projeto pessoal pequeno?"
          a="Não necessariamente. Para um blog ou site estático: só o frontend na Hostinger é suficiente. Para um pet project com backend: VPS + Docker Compose sem réplicas + GitHub Actions básico. Esta trilha ensinou o setup completo para você conhecer todas as peças — use o que fizer sentido para seu contexto."
        />
        <QAItem
          q="Quanto custa tudo isso por mês?"
          a="VPS KVM2 Hostinger: ~€5/mês. Shared hosting (frontend): incluído no plano ou ~€3/mês separado. GitHub Actions: gratuito para repositórios públicos, 2000 minutos/mês gratuitos em privados. GHCR: gratuito para repos públicos. Let's Encrypt: gratuito. Total: ~€5-8/mês para stack completa."
        />
      </Section>

      <Callout tone="success">
        <strong>Trilha concluída.</strong> Você aprendeu a colocar um MVP full stack em produção do zero: VPS segura,
        Docker Compose orquestrado, Nginx com SSL, CI/CD automático no GitHub Actions, secrets bem gerenciados e frontend
        estático deployado via FTP. Esta é a base que 90% dos projetos reais precisam. Os próximos passos naturais são:
        Kubernetes para escala real, observabilidade com Prometheus/Grafana, e arquitetura de múltiplas regiões.
      </Callout>
    </div>
  );
}
