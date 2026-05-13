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
  StackFlow,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('github-actions-deploy-vps');

const ACCENT = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre GitHub Secrets e GitHub Variables no contexto de GitHub Actions?',
    options: [
      'São equivalentes com diferentes nomes',
      'Secrets são criptografados e mascarados nos logs (para senhas, tokens, chaves privadas). Variables são visíveis nos logs (para configurações não-sensíveis como URLs públicas, flags de feature)',
      'Variables são mais rápidas de acessar que Secrets',
      'Secrets só podem ser usados em jobs de produção',
    ],
    correct: 1,
    explanation:
      'GitHub Secrets nunca aparecem em logs — o GitHub os mascara automaticamente. Variables aparecem nos logs normalmente. Use Secrets para: SSH keys, tokens de registry, passwords de banco. Use Variables para: URLs públicas de API, nomes de branch, configurações não-sensíveis.',
  },
  {
    question: 'O que é o GHCR (GitHub Container Registry) e por que usá-lo?',
    options: [
      'É um serviço pago separado da conta GitHub',
      'É o registry de containers integrado ao GitHub — gratuito para repositórios públicos, armazena imagens Docker junto ao código e integra nativamente com GitHub Actions via GITHUB_TOKEN',
      'É apenas um alias para Docker Hub',
      'Só funciona com repositórios privados',
    ],
    correct: 1,
    explanation:
      'ghcr.io é o registry de containers do GitHub. Para repositórios públicos, armazenamento é gratuito. Para privados, usa a cota de storage do plano GitHub. A grande vantagem: autenticação via GITHUB_TOKEN (sem criar token separado) e visibilidade integrada ao repositório.',
  },
  {
    question: 'Por que usar `appleboy/ssh-action` ao invés de configurar SSH manualmente no workflow?',
    options: [
      'Porque o SSH padrão não funciona no GitHub Actions',
      'Porque a action abstrai a configuração de known_hosts, identidade SSH e execução de comandos remotos — menos código, menos chance de erro de configuração',
      'Porque é mais rápida que SSH nativo',
      'Porque permite acesso sem chave SSH',
    ],
    correct: 1,
    explanation:
      'Configurar SSH no CI manualmente exige: adicionar a chave privada a known_hosts, configurar o ssh-agent, lidar com fingerprints. O appleboy/ssh-action encapsula isso em 5 linhas de YAML. Menos código de infraestrutura = menos bugs. O comportamento é idêntico ao SSH nativo.',
  },
  {
    question: 'O que o `DEPLOY_ENABLED` variable gate no workflow resolve?',
    options: [
      'Impede builds duplicados no mesmo commit',
      'Permite ativar/desativar o deploy sem modificar o código — útil para pausar deploys durante incidentes ou quando a infra ainda não está pronta',
      'Controla quais branches podem fazer deploy',
      'Limita o número de deploys por hora',
    ],
    correct: 1,
    explanation:
      'Um gate de variável permite desativar o deploy sem tocar no código ou fazer push. No painel GitHub → Settings → Variables → DEPLOY_ENABLED = false pausa todos os deploys. Útil em incidentes, manutenção de infra, ou quando a VPS ainda não está configurada.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="github-actions-deploy-vps"
      title="CI/CD com GitHub Actions: deploy automático na VPS"
      icon="🤖"
      xp={80}
      readTime={18}
      trailName="Deploy Full Stack: VPS, Docker e CI/CD"
      trailColor={ACCENT}
      nextSlug="deploy-script-rollback"
      nextTitle="Script de deploy com rollback automático e migrations"
      relatedSlugs={['docker-compose-producao', 'deploy-script-rollback', 'secrets-env-producao']}
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
        Deploy manual é inimigo da consistência: você esquece um passo, usa a versão errada, ou comete um erro de digitação.
        CI/CD com GitHub Actions resolve isso: todo <InlineCode>git push</InlineCode> na branch main dispara um pipeline
        automático que valida, constrói, publica a imagem e faz deploy na VPS via SSH. Este módulo monta esse pipeline
        do zero com boas práticas: gate de ativação, autenticação no GHCR, build de imagem Docker e deploy remoto seguro.
      </p>

      <Section title="O pipeline completo: visão geral" accent={ACCENT}>
        <StackFlow
          title="4 jobs encadeados"
          accent={ACCENT}
          items={[
            {
              icon: '🛂',
              label: 'Job: check',
              sub: 'gate DEPLOY_ENABLED',
              detail: 'Lê vars.DEPLOY_ENABLED (Repository Variable, não Secret) e decide se o resto do pipeline roda. Permite pausar deploys sem mexer no código.',
              connector: 'needs: nothing',
            },
            {
              icon: '🏗️',
              label: 'Job: build-push',
              sub: 'Docker image → GHCR',
              detail: 'docker/build-push-action@v6 com BuildKit + cache GHA. Tags: sha-<short> + latest. provenance: true para supply-chain.',
              connector: 'needs: check',
            },
            {
              icon: '🚀',
              label: 'Job: deploy-backend',
              sub: 'scp + ssh → VPS',
              detail: 'scp-action envia compose/nginx/migrations/deploy.sh para /tmp/ffv-deploy/. ssh-action move pra /opt/ffv/ e roda o script de deploy.',
              connector: 'paralelo com deploy-frontend',
            },
            {
              icon: '📤',
              label: 'Job: deploy-frontend',
              sub: 'FTP → Hostinger shared',
              detail: 'SamKirkland/FTP-Deploy-Action@v4.3.5 com sync incremental (compara hash, só envia o que mudou).',
              connector: 'paralelo com deploy-backend',
            },
          ]}
        />
      </Section>

      <Section title="Por que DEPLOY_ENABLED é Variable, não Secret" accent={ACCENT}>
        <Callout tone="warn">
          <strong>Pegadinha real:</strong> <InlineCode>if: secrets.DEPLOY_ENABLED == &apos;true&apos;</InlineCode>{' '}
          <strong>não funciona</strong>. Secrets nunca são avaliados em condições <InlineCode>if:</InlineCode> em
          workflows — o GitHub mascara o valor antes da expressão ser resolvida, e a comparação sempre dá falso. A
          única forma de usar um valor para gating é uma <strong>Repository Variable</strong>:{' '}
          <InlineCode>if: vars.DEPLOY_ENABLED == &apos;true&apos;</InlineCode>.
        </Callout>
        <CodeBlock lang="bash">{`# Cadastrar a variável:
#   GitHub repo → Settings → Secrets and variables → Actions → tab "Variables" → New
#   Name: DEPLOY_ENABLED
#   Value: true (ou false para pausar)
#
# Diferente de Secrets: o valor APARECE nos logs e é avaliável em if:.
# Para esse uso (gate booleano), não há nada secreto — só um liga/desliga.`}</CodeBlock>
      </Section>

      <Section title="Pattern scp-action + ssh-action: arquivos primeiro, comando depois" accent={ACCENT}>
        <p>
          Em vez de fazer <InlineCode>git pull</InlineCode> dentro da VPS (que exigiria chave de leitura do repo na VPS),
          o pipeline usa <strong>duas actions sequenciais</strong>:
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: '1️⃣ appleboy/scp-action@v0.1.7', v: 'Envia os arquivos versionados (docker-compose.prod.yml, nginx/, migrations/, scripts/deploy.sh) para /tmp/ffv-deploy/ na VPS. O CI já tem o checkout do repo, então a fonte é o filesystem do runner.' },
            { k: '2️⃣ appleboy/ssh-action@v1.0.3', v: 'Conecta via SSH e roda um script remoto que: (a) move /tmp/ffv-deploy/* para /opt/ffv/ com rsync ou mv; (b) chmod +x /opt/ffv/bin/deploy.sh; (c) executa /opt/ffv/bin/deploy.sh com IMAGE_TAG no env.' },
            { k: 'Por que separar?', v: 'A VPS nunca precisa de credencial do GitHub — toda a transferência usa só SSH key. Plus: scp é mais barato que clonar repo a cada deploy.' },
          ]}
        />
        <CodeBlock lang="yaml" filename=".github/workflows/deploy.yml — job deploy-backend (trecho)">{`deploy-backend:
  needs: [check, build-push]
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Copy deploy artifacts to VPS
      uses: appleboy/scp-action@v0.1.7
      with:
        host: \${{ secrets.VPS_HOST }}
        username: \${{ secrets.VPS_USER }}
        key: \${{ secrets.VPS_SSH_KEY }}
        port: 22
        source: |
          deployments/docker-compose.prod.yml
          deployments/nginx/
          migrations/
          scripts/deploy.sh
        target: /tmp/ffv-deploy/
        strip_components: 1

    - name: Run remote deploy script
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: \${{ secrets.VPS_HOST }}
        username: \${{ secrets.VPS_USER }}
        key: \${{ secrets.VPS_SSH_KEY }}
        port: 22
        envs: IMAGE_TAG,GHCR_TOKEN,REPO_OWNER
        script: |
          set -euo pipefail
          sudo mkdir -p /opt/ffv/bin /opt/ffv/nginx /opt/ffv/migrations
          sudo rsync -a /tmp/ffv-deploy/ /opt/ffv/
          sudo chmod +x /opt/ffv/scripts/deploy.sh
          IMAGE_TAG="\${IMAGE_TAG}" \\
          GHCR_TOKEN="\${GHCR_TOKEN}" \\
          REPO_OWNER="\${REPO_OWNER}" \\
          sudo -E /opt/ffv/scripts/deploy.sh
      env:
        IMAGE_TAG: sha-\${{ github.sha }}
        # GITHUB_TOKEN é injetado pelo GH Actions; pode ler ghcr.io do mesmo repo.
        GHCR_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        REPO_OWNER: \${{ github.repository_owner }}`}</CodeBlock>
      </Section>

      <Section title="O script scripts/deploy.sh: orquestração remota" accent={ACCENT}>
        <p>
          Esse é o script que <em>realmente</em> faz o deploy na VPS. O workflow só copia arquivos e dispara — toda a
          lógica de rolling update, health check e rollback vive aqui. Detalhamento completo no módulo dedicado
          (&quot;Script de deploy com rollback automático&quot;), mas o fluxo de alto nível:
        </p>
        <CodeBlock lang="bash" filename="scripts/deploy.sh (esqueleto)">{`#!/usr/bin/env bash
set -euo pipefail

cd /opt/ffv

# 1. Login no GHCR
echo "\${GHCR_TOKEN}" | docker login ghcr.io -u "\${REPO_OWNER}" --password-stdin

# 2. Pull da nova imagem
docker pull "ghcr.io/feh-franc0/ffv-api:\${IMAGE_TAG}"

# 3. Salva tag atual para rollback (lida do .env atual ou docker inspect)
CURRENT_TAG=$(grep '^IMAGE_TAG=' /opt/ffv/.env 2>/dev/null | cut -d= -f2 || echo "")
echo "\${CURRENT_TAG}" > /opt/ffv/.current_tag

# 4. Sobe postgres + redis se não estiverem rodando
docker compose -f docker-compose.prod.yml up -d postgres redis

# 5. Aguarda Postgres ficar pronto (até 60s)
for i in {1..30}; do
  docker compose exec -T postgres pg_isready -U ffv && break
  sleep 2
done

# 6. Roda migrations (do HOST, não dentro do container — usa loopback)
#    Trick: troca @postgres: por @localhost: porque o CLI roda fora do compose
DB_URL_LOCAL=$(grep '^DATABASE_URL=' .env | cut -d= -f2- | sed 's/@postgres:/@localhost:/')
migrate -path /opt/ffv/migrations -database "\${DB_URL_LOCAL}" up

# 7. Atualiza .env com novo IMAGE_TAG e sobe nova versão da API
sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=\${IMAGE_TAG}|" .env
docker compose -f docker-compose.prod.yml up -d --no-deps --pull never --scale api=2 api

# 8. Health check loop (≥1 réplica healthy em 120s)
DEADLINE=$((SECONDS + 120))
while [ \$SECONDS -lt \$DEADLINE ]; do
  HEALTHY=$(docker compose ps -q api | xargs -I{} docker inspect \\
    --format '{{.State.Health.Status}}' {} | grep -c healthy || true)
  if [ "\$HEALTHY" -ge 1 ]; then
    echo "OK: \$HEALTHY réplicas healthy"
    docker compose -f docker-compose.prod.yml up -d --no-deps nginx
    docker image prune -f --filter "until=24h"
    exit 0
  fi
  sleep 3
done

# 9. Falha → rollback automático
echo "FAIL: nenhuma réplica ficou healthy em 120s. Rollback..."
PREVIOUS_TAG=$(cat /opt/ffv/.current_tag)
sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=\${PREVIOUS_TAG}|" .env
docker compose -f docker-compose.prod.yml up -d --no-deps --scale api=2 api
exit 1`}</CodeBlock>
        <Callout tone="info">
          O script é <strong>idempotente</strong> e <strong>auto-rollback</strong>: se a nova imagem subir mas não passar
          no healthcheck, o script volta sozinho pra tag anterior. Você nunca fica com a API quebrada por mais que ~2
          minutos.
        </Callout>
      </Section>

      <Section title="Migrations no pipeline: o trick do @postgres → @localhost" accent={ACCENT}>
        <p>
          As migrations (<InlineCode>migrate</InlineCode> da golang-migrate) rodam <strong>no host</strong>, não dentro
          de um container — isso evita ter que buildar uma imagem só com o CLI, e mantém o controle de versão dos
          schemas em um único lugar.
        </p>
        <p>
          O detalhe sutil: o <InlineCode>.env</InlineCode> da API tem{' '}
          <InlineCode>DATABASE_URL=postgres://ffv:SENHA@postgres:5432/ffv_prod</InlineCode>. O hostname{' '}
          <InlineCode>postgres</InlineCode> só resolve <em>dentro</em> da rede do Compose. Pra rodar o CLI no host,
          precisamos trocar pra <InlineCode>@localhost:</InlineCode> — que funciona porque o serviço expõe{' '}
          <InlineCode>127.0.0.1:5432:5432</InlineCode> no host.
        </p>
        <CodeBlock lang="bash">{`# Dentro do deploy.sh:
DB_URL_LOCAL=$(grep '^DATABASE_URL=' .env | cut -d= -f2- | sed 's/@postgres:/@localhost:/')

# A migrate CLI tem que estar instalada na VPS:
# curl -L https://github.com/golang-migrate/migrate/releases/download/v4.17.0/migrate.linux-amd64.tar.gz \\
#   | tar xz && sudo mv migrate /opt/ffv/bin/migrate

# Rodar:
/opt/ffv/bin/migrate \\
  -path /opt/ffv/migrations \\
  -database "\${DB_URL_LOCAL}" \\
  up

# Migrations são versionadas em /opt/ffv/migrations/000001_init.up.sql, etc.
# Migrate guarda o estado na tabela schema_migrations dentro do banco.`}</CodeBlock>
      </Section>

      <Section title="Configurando os Secrets no GitHub" accent={ACCENT}>
        <p>
          Antes de criar o workflow, adicione os secrets em <strong>GitHub → Settings → Secrets and variables → Actions</strong>:
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'VPS_HOST', v: 'IP da sua VPS (ex: 203.0.113.10)' },
            { k: 'VPS_USER', v: 'Usuário SSH (ex: deploy)' },
            { k: 'VPS_SSH_KEY', v: 'Conteúdo da chave privada SSH (id_ed25519 — começa com -----BEGIN OPENSSH PRIVATE KEY-----)' },
            { k: 'VPS_PORT', v: '22 (porta SSH padrão)' },
          ]}
        />
        <p className="mt-2">
          E em <strong>GitHub → Settings → Variables</strong> (não Secrets — é visível):
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'DEPLOY_ENABLED', v: 'true para ativar o deploy automático. false para pausar (ex: durante incidentes)' },
          ]}
        />
        <CodeBlock lang="bash">{`# Como gerar e adicionar a chave SSH para o CI:

# Na sua máquina local, gere uma chave dedicada para CI
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_ci -C "github-actions-ci" -N ""

# Adicione a chave PÚBLICA na VPS (como usuário deploy):
cat ~/.ssh/id_ed25519_ci.pub >> ~/.ssh/authorized_keys

# Copie a chave PRIVADA para o GitHub Secret VPS_SSH_KEY:
cat ~/.ssh/id_ed25519_ci
# -----BEGIN OPENSSH PRIVATE KEY-----
# b3BlbnNzaC1rZXktdjEAAAAA...
# -----END OPENSSH PRIVATE KEY-----`}</CodeBlock>
        <Callout tone="danger">
          <strong>Segurança:</strong> gere uma chave SSH <em>separada</em> para o CI — não reutilize sua chave pessoal.
          Se o repositório for comprometido e os secrets vazarem, você pode revogar apenas a chave do CI sem afetar
          o acesso pessoal à VPS.
        </Callout>
      </Section>

      <Section title="O workflow completo" accent={ACCENT}>
        <CodeBlock lang="yaml">{`# .github/workflows/deploy.yml
name: Deploy to VPS

on:
  push:
    branches: [main]
  workflow_dispatch:      # permite rodar manualmente pelo painel GitHub

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${'$'}{{ github.repository }}   # ex: seu-usuario/sua-api

jobs:
  # ─── Job 1: Validação ─────────────────────────────────────────
  check:
    name: Lint & Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

  # ─── Job 2: Build e Push da imagem Docker ──────────────────────
  build-push:
    name: Build & Push Docker Image
    runs-on: ubuntu-latest
    needs: check
    permissions:
      contents: read
      packages: write       # necessário para push no GHCR

    outputs:
      image-tag: ${'$'}{{ steps.meta.outputs.tags }}

    steps:
      - uses: actions/checkout@v4

      - name: Login no GHCR
        uses: docker/login-action@v3
        with:
          registry: ${'$'}{{ env.REGISTRY }}
          username: ${'$'}{{ github.actor }}
          password: ${'$'}{{ secrets.GITHUB_TOKEN }}   # automático, sem configurar

      - name: Configurar BuildKit
        uses: docker/setup-buildx-action@v3

      - name: Extrair metadata (tags, labels)
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${'$'}{{ env.REGISTRY }}/${'$'}{{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix=sha-          # sha-abc1234 — imutável e rastreável
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build e push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${'$'}{{ steps.meta.outputs.tags }}
          labels: ${'$'}{{ steps.meta.outputs.labels }}
          cache-from: type=gha          # cache do BuildKit no GitHub Actions
          cache-to: type=gha,mode=max

  # ─── Job 3: Deploy na VPS ──────────────────────────────────────
  deploy:
    name: Deploy to VPS
    runs-on: ubuntu-latest
    needs: build-push
    environment: production
    # Gate: só deploya se DEPLOY_ENABLED = true
    if: vars.DEPLOY_ENABLED == 'true'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${'$'}{{ secrets.VPS_HOST }}
          username: ${'$'}{{ secrets.VPS_USER }}
          key: ${'$'}{{ secrets.VPS_SSH_KEY }}
          port: ${'$'}{{ secrets.VPS_PORT }}
          script: |
            # Navegar para o diretório da aplicação
            cd /opt/meu-app

            # Autenticar no GHCR (usa token de leitura — não precisa de write)
            echo "${'$'}{{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${'$'}{{ github.actor }} --password-stdin

            # Pull da nova imagem
            docker pull ghcr.io/${'$'}{{ github.repository }}:sha-${'$'}{{ github.sha }}

            # Atualizar a variável de tag no .env.production
            echo "API_IMAGE=ghcr.io/${'$'}{{ github.repository }}:sha-${'$'}{{ github.sha }}" > /opt/meu-app/.env.deploy

            # Restart apenas o serviço de API (sem derrubar o banco ou Nginx)
            docker compose -f docker-compose.prod.yml up -d --no-deps --force-recreate api

            # Aguardar o health check passar
            sleep 10
            docker compose -f docker-compose.prod.yml ps api

            # Limpar imagens antigas (mantém apenas as últimas 3)
            docker image prune -f --filter "until=72h"

      - name: Verificar deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${'$'}{{ secrets.VPS_HOST }}
          username: ${'$'}{{ secrets.VPS_USER }}
          key: ${'$'}{{ secrets.VPS_SSH_KEY }}
          port: ${'$'}{{ secrets.VPS_PORT }}
          script: |
            # Verificar que o health check está passando
            curl -f http://localhost:3000/health || exit 1
            echo "Deploy bem-sucedido: $(docker compose -f /opt/meu-app/docker-compose.prod.yml ps api | tail -1)"

      - name: Notificar sucesso
        if: success()
        run: echo "Deploy concluído com sucesso! Tag: sha-${'$'}{{ github.sha }}"

      - name: Rollback em caso de falha
        if: failure()
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${'$'}{{ secrets.VPS_HOST }}
          username: ${'$'}{{ secrets.VPS_USER }}
          key: ${'$'}{{ secrets.VPS_SSH_KEY }}
          port: ${'$'}{{ secrets.VPS_PORT }}
          script: |
            # Rollback: usar a imagem anterior (tag latest do commit anterior)
            cd /opt/meu-app
            docker compose -f docker-compose.prod.yml up -d --no-deps api
            echo "ROLLBACK executado"`}</CodeBlock>
      </Section>

      <Section title="Usando a imagem correta no docker-compose.prod.yml" accent={ACCENT}>
        <p>
          Para que o workflow injete a tag da nova imagem, o Compose precisa lê-la de uma variável de ambiente:
        </p>
        <CodeBlock lang="yaml">{`# docker-compose.prod.yml — use variável de ambiente para a tag da imagem
services:
  api:
    image: ghcr.io/seu-usuario/sua-api:\${API_IMAGE_TAG:-latest}
    # ...`}</CodeBlock>
        <CodeBlock lang="bash">{`# No script de deploy (dentro do ssh-action):
# Exportar a tag para ser lida pelo Compose
export API_IMAGE_TAG="sha-${'$'}{{ github.sha }}"
docker compose -f docker-compose.prod.yml up -d --no-deps api

# Alternativa: usar --env-file com o arquivo gerado pelo CI
docker compose -f docker-compose.prod.yml --env-file .env.deploy up -d --no-deps api`}</CodeBlock>
      </Section>

      <Section title="Estratégia de rollback" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Tag por SHA', v: 'Cada build gera uma imagem com a tag sha-{commit}. É possível voltar para qualquer commit anterior.' },
            { k: 'Tag latest', v: 'Aponta para a última imagem da branch main. Útil para deployment manual: docker pull + up.' },
            { k: 'Rollback automático', v: 'O bloco `if: failure()` no workflow faz rollback automaticamente se a verificação de health falhar.' },
            { k: 'Rollback manual', v: 'ssh deploy@VPS → cd /opt/meu-app → export API_IMAGE_TAG=sha-COMMIT_ANTIGO → docker compose up -d --no-deps api' },
          ]}
        />
        <CodeBlock lang="bash">{`# Ver histórico de imagens disponíveis no GHCR (tags)
docker images ghcr.io/seu-usuario/sua-api
# REPOSITORY                      TAG          IMAGE ID   CREATED
# ghcr.io/seu-usuario/sua-api     sha-abc1234  aaa111bbb  2 hours ago
# ghcr.io/seu-usuario/sua-api     sha-def5678  bbb222ccc  1 day ago
# ghcr.io/seu-usuario/sua-api     sha-ghi9012  ccc333ddd  3 days ago

# Rollback para um commit específico:
export API_IMAGE_TAG=sha-def5678
docker compose -f docker-compose.prod.yml up -d --no-deps api`}</CodeBlock>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="O GITHUB_TOKEN tem acesso para fazer push no GHCR do meu repositório?"
          a="Sim, desde que o job tenha `permissions: packages: write`. O GITHUB_TOKEN é gerado automaticamente pelo GitHub Actions para cada run e tem permissões configuráveis. Para push no GHCR do mesmo repositório, basta adicionar packages: write nas permissions do job."
        />
        <QAItem
          q="Como evitar que o Nginx perca conexões durante o restart da API?"
          a="Com `docker compose up -d --no-deps api`, o Docker para o container antigo e sobe o novo. Durante esse tempo (segundos), o Nginx pode retornar 502. Para zero downtime real, você precisaria de 2+ réplicas e atualizá-las sequencialmente (rolling update), que requer Swarm ou Kubernetes para automação completa."
        />
        <QAItem
          q="Posso usar o mesmo workflow para múltiplos ambientes (staging e prod)?"
          a="Sim. Use `environment: staging` e `environment: production` nos jobs. Configure Secrets separados para cada ambiente no GitHub. O ambiente de staging pode ser disparado por push em outra branch (ex: develop). O de produção, por merge na main."
        />
      </Section>

      <Callout tone="warn">
        <strong>War story — senha FTP da Hostinger não fica visível.</strong> No painel Hostinger, a senha do usuário
        FTP <em>não</em> aparece em lugar nenhum depois que você criou a conta — eles guardam só o hash. Quando for
        configurar o secret <InlineCode>HOSTINGER_FTP_PASSWORD</InlineCode> no GitHub e não lembrar mais qual era, vá
        em <strong>Hostinger → FTP Accounts → ⋮ → &quot;Esqueceu sua senha FTP?&quot;</strong> e gere uma nova. Não
        existe &quot;mostrar senha atual&quot; — só reset.
      </Callout>

      <Callout tone="success">
        <strong>CI/CD configurado.</strong> Todo push na main agora: (1) gate via{' '}
        <InlineCode>vars.DEPLOY_ENABLED</InlineCode>, (2) build + push da imagem Docker para o GHCR com tag imutável por
        SHA, (3) scp dos artifacts + ssh executando o <InlineCode>deploy.sh</InlineCode> com rolling update, health check
        e rollback automático, (4) frontend via FTP incremental em paralelo. O próximo módulo abre o script de deploy
        em detalhes.
      </Callout>
    </div>
  );
}
