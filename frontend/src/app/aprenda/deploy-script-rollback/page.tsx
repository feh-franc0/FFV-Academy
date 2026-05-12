import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  KeyValue,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('deploy-script-rollback');

const ACCENT = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o deploy.sh salva a tag anterior em /opt/ffv/.current_tag antes de subir a nova imagem?',
    options: [
      'Para auditoria histórica de versões deployadas',
      'Para que, se o health check da nova versão falhar, o script consiga voltar automaticamente para a imagem que estava rodando antes — rollback sem intervenção humana',
      'Porque o Docker exige esse arquivo para registrar tags',
      'Para o GitHub Actions ler depois do deploy',
    ],
    correct: 1,
    explanation:
      'Sem salvar a tag anterior, o rollback automático é impossível — o script perderia a referência da imagem que estava saudável. Ao gravar em .current_tag antes de tocar no .env, criamos um ponto de restauração que sobrevive a qualquer falha posterior no script.',
  },
  {
    question: 'Por que as migrations rodam do host (com migrate CLI) e não dentro do container da API?',
    options: [
      'Porque a imagem distroless da API não tem shell nem ferramentas — instalar migrate ali inflaria a imagem e quebraria o princípio mínimo',
      'Porque migrate só funciona em Ubuntu',
      'Porque o Compose não permite executar comandos one-off',
      'Por uma limitação do PostgreSQL 16',
    ],
    correct: 0,
    explanation:
      'A imagem da API é distroless (sem shell, sem package manager, ~15 MB). Colocar o migrate CLI ali quebraria o objetivo da imagem mínima. Rodar do host é mais simples, mais auditável, e mantém o controle de versão dos schemas centralizado no diretório /opt/ffv/migrations.',
  },
  {
    question: 'O loop de health check espera no máximo 120s contando "réplicas com State.Health.Status == healthy". Por que ≥1, e não ==2?',
    options: [
      'Porque o Docker Compose nunca consegue manter 2 réplicas saudáveis simultaneamente',
      'Para tolerar deploys onde uma réplica leva mais tempo para ficar healthy (cold start, conexões iniciais) — basta uma para começar a servir tráfego sem 502, e a outra fica healthy pouco depois',
      'Porque pg_isready só verifica uma conexão por vez',
      'Para economizar memória do servidor',
    ],
    correct: 1,
    explanation:
      'Exigir as 2 réplicas em 120s deixa o critério rígido demais — um cold start de Go inicializando pool de conexões pode demorar 30-40s. Aceitar ≥1 healthy garante que pelo menos um worker está atendendo. A 2ª réplica fica saudável pouco depois e o Compose distribui carga automaticamente.',
  },
  {
    question: 'O trick de trocar @postgres: por @localhost: na DATABASE_URL antes de rodar migrate serve para quê?',
    options: [
      'Para criptografar a senha do banco',
      'O hostname "postgres" só resolve dentro da rede do Compose (DNS interno). O CLI migrate roda fora do Compose, no host — onde "postgres" não resolve. Trocar por "localhost" funciona porque o serviço expõe ports: ["127.0.0.1:5432:5432"]',
      'Para acelerar a conexão',
      'Por compatibilidade com o psql do Ubuntu',
    ],
    correct: 1,
    explanation:
      'Dentro do Compose, o Docker DNS resolve "postgres" → IP do container. Fora do Compose, esse nome não existe. O host só consegue alcançar o banco via 127.0.0.1:5432 (loopback exposto). Sem essa troca, migrate falha com "no such host: postgres".',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="deploy-script-rollback"
      title="Script de deploy com rollback automático e migrations"
      icon="🔄"
      xp={65}
      readTime={14}
      trailName="Deploy Full Stack: VPS, Docker e CI/CD"
      trailColor={ACCENT}
      nextSlug="secrets-env-producao"
      nextTitle="Secrets e variáveis de ambiente em produção"
      relatedSlugs={['github-actions-deploy-vps', 'docker-compose-producao', 'secrets-env-producao']}
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
        O GitHub Actions disparou o pipeline e quer fazer deploy. Mas o workflow YAML <em>não</em> é onde a lógica de
        deploy mora — ele só copia arquivos e chama um <strong>script bash na VPS</strong> que faz o trabalho pesado:
        autentica no GHCR, pula a imagem, salva a tag anterior para rollback, sobe Postgres/Redis, espera o banco ficar
        pronto, roda migrations, atualiza a API com rolling update, valida health check em 120s — e, se algo falhar,
        reverte sozinho. Este módulo mostra esse script linha por linha.
      </p>

      <Section title="Por que script remoto e não tudo no workflow YAML?" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Idempotência', v: 'Você pode rodar o script manualmente pra fazer redeploy ou debugar — não precisa do GitHub Actions pra deployar. SSH na VPS, /opt/ffv/scripts/deploy.sh, pronto.' },
            { k: 'Localidade da lógica', v: 'Estado (tag atual, .env, volumes Postgres) vive na VPS. Lógica que muda esse estado faz mais sentido perto dele. Workflow YAML fica responsável só por "copiar e disparar".' },
            { k: 'Tempo de iteração', v: 'Editar o script é editar um arquivo bash. Editar o workflow exige git push + esperar runner subir. Em incidente, você quer iterar rápido.' },
            { k: 'Logs locais', v: 'O script grava log em /var/log/ffv-deploy.log na VPS — fica disponível mesmo depois que o run do GH expirar (logs do GH somem após 90 dias).' },
          ]}
        />
      </Section>

      <Section title="O script completo (scripts/deploy.sh)" accent={ACCENT}>
        <CodeBlock lang="bash" filename="/opt/ffv/scripts/deploy.sh">{`#!/usr/bin/env bash
# Deploy script para FFV API — rolling update + rollback automático.
# Rodado pelo GH Actions (via ssh-action) ou manualmente na VPS.

set -euo pipefail

# ─── Inputs (via env) ──────────────────────────────────────────
: "\${IMAGE_TAG:?IMAGE_TAG não setado}"
: "\${GHCR_TOKEN:?GHCR_TOKEN não setado}"
: "\${REPO_OWNER:?REPO_OWNER não setado}"

# ─── Constantes ────────────────────────────────────────────────
WORKDIR=/opt/ffv
COMPOSE_FILE="\${WORKDIR}/deployments/docker-compose.prod.yml"
ENV_FILE="\${WORKDIR}/.env"
IMAGE="ghcr.io/feh-franc0/ffv-api"
HEALTH_TIMEOUT=120
PG_TIMEOUT=60

cd "\${WORKDIR}"

log() { echo "[\$(date +'%Y-%m-%dT%H:%M:%S')] \$*"; }

# ─── 1. Login no GHCR ──────────────────────────────────────────
log "🔑 Login no GHCR como \${REPO_OWNER}"
echo "\${GHCR_TOKEN}" | docker login ghcr.io -u "\${REPO_OWNER}" --password-stdin

# ─── 2. Pull da nova imagem ────────────────────────────────────
log "📥 docker pull \${IMAGE}:\${IMAGE_TAG}"
docker pull "\${IMAGE}:\${IMAGE_TAG}"

# ─── 3. Salva tag atual para rollback ──────────────────────────
CURRENT_TAG=$(grep '^IMAGE_TAG=' "\${ENV_FILE}" 2>/dev/null | cut -d= -f2 || echo "latest")
echo "\${CURRENT_TAG}" > "\${WORKDIR}/.current_tag"
log "💾 Tag anterior salva em .current_tag: \${CURRENT_TAG}"

# ─── 4. Sobe postgres + redis (idempotente) ────────────────────
log "🐘 Garantindo postgres + redis up"
docker compose -f "\${COMPOSE_FILE}" --env-file "\${ENV_FILE}" up -d postgres redis

# ─── 5. Aguarda Postgres ficar healthy (máx 60s) ───────────────
log "⏳ Aguardando Postgres ficar pronto..."
for i in $(seq 1 30); do
  if docker compose -f "\${COMPOSE_FILE}" exec -T postgres pg_isready -U ffv >/dev/null 2>&1; then
    log "✅ Postgres pronto em \${i}×2s"
    break
  fi
  sleep 2
  if [ "\${i}" -eq 30 ]; then
    log "❌ Postgres não ficou pronto em \${PG_TIMEOUT}s"
    exit 1
  fi
done

# ─── 6. Roda migrations (do host, trocando @postgres: por @localhost:) ──
log "🔧 Rodando migrations"
DB_URL_LOCAL=$(grep '^DATABASE_URL=' "\${ENV_FILE}" | cut -d= -f2- | sed 's/@postgres:/@localhost:/')
"\${WORKDIR}/bin/migrate" \\
  -path "\${WORKDIR}/migrations" \\
  -database "\${DB_URL_LOCAL}" \\
  up

# ─── 7. Atualiza .env com nova IMAGE_TAG e sobe API ─────────────
log "🚀 Atualizando API para \${IMAGE_TAG} (2 réplicas)"
sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=\${IMAGE_TAG}|" "\${ENV_FILE}"
docker compose -f "\${COMPOSE_FILE}" --env-file "\${ENV_FILE}" \\
  up -d --no-deps --pull never --scale api=2 api

# ─── 8. Loop de health check (≥1 réplica healthy em 120s) ──────
log "🩺 Health check loop (timeout \${HEALTH_TIMEOUT}s, exige ≥1 healthy)"
deadline=$((SECONDS + HEALTH_TIMEOUT))
while [ "\${SECONDS}" -lt "\${deadline}" ]; do
  HEALTHY=$(docker compose -f "\${COMPOSE_FILE}" ps -q api \\
    | xargs -I{} docker inspect --format '{{.State.Health.Status}}' {} 2>/dev/null \\
    | grep -c healthy || true)
  if [ "\${HEALTHY}" -ge 1 ]; then
    log "✅ \${HEALTHY} réplica(s) healthy"
    docker compose -f "\${COMPOSE_FILE}" --env-file "\${ENV_FILE}" up -d --no-deps nginx
    docker image prune -f --filter "until=24h"
    log "🎉 Deploy concluído: \${IMAGE_TAG}"
    exit 0
  fi
  sleep 3
done

# ─── 9. FAIL → rollback automático ─────────────────────────────
log "❌ Nenhuma réplica healthy em \${HEALTH_TIMEOUT}s. Iniciando rollback..."
PREVIOUS_TAG=$(cat "\${WORKDIR}/.current_tag")
log "↩️  Voltando para \${PREVIOUS_TAG}"
sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=\${PREVIOUS_TAG}|" "\${ENV_FILE}"
docker compose -f "\${COMPOSE_FILE}" --env-file "\${ENV_FILE}" \\
  up -d --no-deps --pull never --scale api=2 api

# Validação rápida do rollback
sleep 10
HEALTHY=$(docker compose -f "\${COMPOSE_FILE}" ps -q api \\
  | xargs -I{} docker inspect --format '{{.State.Health.Status}}' {} \\
  | grep -c healthy || true)
if [ "\${HEALTHY}" -ge 1 ]; then
  log "✅ Rollback OK: \${HEALTHY} réplica(s) healthy"
else
  log "🔥 ALERTA: rollback também falhou — intervenção manual necessária"
fi

exit 1`}</CodeBlock>
      </Section>

      <Section title="Anatomia: o que cada etapa garante" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'set -euo pipefail', v: 'Falha cedo: qualquer comando que retorne ≠ 0 (-e), uso de variável não setada (-u), ou erro em qualquer pipe (-o pipefail) aborta. Sem isso, deploys quebrados continuariam silenciosamente.' },
            { k: ': "${VAR:?msg}"', v: 'Validação de inputs obrigatórios. Se IMAGE_TAG vier vazio do CI, falha com mensagem clara em vez de fazer um deploy com tag "latest" por acidente.' },
            { k: '.current_tag', v: 'Arquivo de checkpoint. Salvo ANTES de qualquer mudança destrutiva. Se o servidor reiniciar no meio do deploy, esse arquivo ainda permite rollback manual.' },
            { k: 'pg_isready loop', v: 'Em deploy frio (primeira vez ou após reboot), o Postgres demora ~15-30s para aceitar conexões. Sem o loop, a migrate falha imediatamente.' },
            { k: '--no-deps --pull never', v: '--no-deps impede que o Compose recrie postgres/redis (queremos manter o estado). --pull never evita um pull extra (já pegamos a imagem no passo 2).' },
            { k: '--scale api=2', v: 'O Compose v2 com --scale faz rolling update: para a réplica antiga, sobe a nova, espera ela ficar healthy. Durante o gap, a 2ª réplica antiga ainda serve tráfego.' },
            { k: 'docker image prune --filter "until=24h"', v: 'Limpa imagens não usadas há mais de 24h. Mantém as últimas 2-3 builds para rollback rápido, mas evita acumular GBs de imagens antigas na VPS.' },
          ]}
        />
      </Section>

      <Section title="Rollback: como funciona na prática" accent={ACCENT}>
        <Callout tone="info">
          <strong>Rollback é só re-deploy com a tag antiga.</strong> Não há mágica — o script grava{' '}
          <InlineCode>.current_tag</InlineCode> antes de mudar qualquer coisa, e o catch de falha lê esse arquivo,
          troca o <InlineCode>IMAGE_TAG</InlineCode> no <InlineCode>.env</InlineCode> e roda o mesmo{' '}
          <InlineCode>docker compose up</InlineCode> com a imagem anterior.
        </Callout>
        <CodeBlock lang="bash">{`# Rollback manual (sem GH Actions) — útil quando você quer voltar 2-3 versões:

ssh deploy@72.60.28.82
cd /opt/ffv

# Ver tags disponíveis no host:
docker images ghcr.io/feh-franc0/ffv-api --format '{{.Tag}}\\t{{.CreatedSince}}'
# sha-a1b2c3d   2 hours ago
# sha-e4f5g6h   1 day ago
# sha-i7j8k9l   3 days ago
# latest        2 hours ago

# Rollback para um SHA específico:
sudo sed -i 's|^IMAGE_TAG=.*|IMAGE_TAG=sha-e4f5g6h|' .env
sudo docker compose -f deployments/docker-compose.prod.yml --env-file .env \\
  up -d --no-deps --pull never --scale api=2 api

# Validar
docker compose ps api
curl -fsS https://api.fernandofrancovalle.com/healthz`}</CodeBlock>
      </Section>

      <Section title="Migrations dentro do deploy: ordem importa" accent={ACCENT}>
        <Callout tone="warn">
          <strong>Migrations rodam ANTES da API subir.</strong> Se a nova versão do binário espera uma coluna nova,
          subir a API antes da migration causaria erros 500 em massa. A ordem é: (1) postgres pronto, (2) migrations
          aplicadas, (3) API nova com a tag nova. Migrations destrutivas (DROP COLUMN, RENAME) exigem 2 deploys
          (expand/contract pattern) — sai do escopo deste módulo.
        </Callout>
        <CodeBlock lang="bash">{`# Estrutura esperada em /opt/ffv/migrations:
ls /opt/ffv/migrations/
# 000001_init.up.sql
# 000001_init.down.sql
# 000002_add_users_table.up.sql
# 000002_add_users_table.down.sql
# ...

# Migrate guarda o estado na tabela schema_migrations no Postgres:
psql "\${DATABASE_URL//@postgres:/@localhost:}" -c \\
  "SELECT version, dirty FROM schema_migrations"
# version | dirty
# --------+-------
#      42 | f
# (1 row)

# "dirty = t" significa que uma migration parou no meio.
# Resolução manual: corrigir o estado SQL → migrate force <ultima_versao_ok>`}</CodeBlock>
      </Section>

      <Section title="Observabilidade: confiando no script" accent={ACCENT}>
        <p>
          Um script de deploy é tão útil quanto a sua capacidade de saber se algo deu errado. Algumas práticas
          mínimas:
        </p>
        <CodeBlock lang="bash">{`# 1. Log estruturado em /var/log/ffv-deploy.log
sudo tee -a /etc/cron.d/ffv-logrotate <<'EOF'
/var/log/ffv-deploy.log {
  daily
  rotate 30
  compress
  missingok
  notifempty
}
EOF

# 2. Symlink no PATH para rodar manualmente:
sudo ln -sf /opt/ffv/scripts/deploy.sh /usr/local/bin/ffv-deploy

# 3. Ao rodar do GH Actions, captura todo o stdout/stderr:
#    No script, redireciona para o arquivo de log E imprime para o ssh-action:
exec > >(tee -a /var/log/ffv-deploy.log) 2>&1

# 4. Verificar último deploy:
tail -50 /var/log/ffv-deploy.log
grep -E '(❌|🎉|↩️)' /var/log/ffv-deploy.log | tail -20`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Deploy resiliente.</strong> Esse script faz com ~80 linhas de bash o que ferramentas pesadas (ArgoCD,
        Flux, Spinnaker) fazem com clusters Kubernetes inteiros: rolling update, health check, rollback automático.
        Não é &quot;production-grade enterprise&quot; — é production-grade para um MVP solo, e isso é exatamente o que
        você precisa. O próximo módulo cobre como gerenciar os secrets (POSTGRES_PASSWORD, REDIS_PASSWORD, JWT_SECRET,
        GHCR_TOKEN) que esse script consome.
      </Callout>
    </div>
  );
}
