#!/usr/bin/env bash
# Roda na VPS a cada deploy. Chamado pelo GitHub Actions via SSH.
# Variáveis de ambiente esperadas: IMAGE_TAG, GHCR_TOKEN, REPO_OWNER
set -euo pipefail

DEPLOY_DIR="/opt/ffv"
COMPOSE_FILE="$DEPLOY_DIR/docker-compose.prod.yml"
ENV_FILE="$DEPLOY_DIR/.env"
MIGRATIONS_DIR="$DEPLOY_DIR/migrations"
IMAGE="ghcr.io/${REPO_OWNER}/ffv-api:${IMAGE_TAG}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
die() { log "ERRO: $*" >&2; exit 1; }

# ─── 1. Login no GHCR ────────────────────────────────────────────────────────
log "Autenticando no GHCR..."
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$REPO_OWNER" --password-stdin

# ─── 2. Pull da nova imagem ───────────────────────────────────────────────────
log "Baixando imagem $IMAGE..."
docker pull "$IMAGE"

# ─── 3. Salvar tag atual para rollback ───────────────────────────────────────
PREVIOUS_TAG=$(cat "$DEPLOY_DIR/.current_tag" 2>/dev/null || echo "latest")
log "Tag anterior: $PREVIOUS_TAG → nova: $IMAGE_TAG"
echo "$IMAGE_TAG" > "$DEPLOY_DIR/.current_tag"

# ─── 4. Garantir que postgres e redis estão rodando ──────────────────────────
log "Verificando infraestrutura (postgres + redis)..."
IMAGE_TAG="$IMAGE_TAG" docker compose -f "$COMPOSE_FILE" up -d postgres redis

# Aguarda postgres estar pronto (máx 60s)
for i in $(seq 1 12); do
  if docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U ffv -d ffv_prod > /dev/null 2>&1; then
    log "Postgres pronto."
    break
  fi
  [[ $i -eq 12 ]] && die "Postgres não ficou pronto em 60s."
  log "Aguardando postgres... ($i/12)"
  sleep 5
done

# ─── 5. Rodar migrations ──────────────────────────────────────────────────────
# Estratégia: container temporário na rede `data` do compose, conectando ao
# postgres pelo hostname interno (sem depender de port binding do host).
# Vantagens:
#   - imune a IPv4/IPv6 resolution issues
#   - imune a containers postgres pré-existentes sem ports: configurado
#   - migrate roda exatamente como a API roda (mesma rede, mesmas regras)
log "Rodando migrations (container ephemeral na rede interna)..."

# Rede vem do `name: ffv-prod` declarado no docker-compose.prod.yml + nome da
# network `data:` (internal). Compose junta em "{name}_{network}".
NETWORK_NAME="ffv-prod_data"

# DATABASE_URL usa @postgres: (hostname interno do compose) — sem reescrever.
DATABASE_URL_INTERNAL=$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)

docker run --rm \
  --network "$NETWORK_NAME" \
  -v "$MIGRATIONS_DIR:/migrations:ro" \
  migrate/migrate:v4.17.1 \
  -path /migrations \
  -database "$DATABASE_URL_INTERNAL" \
  up \
  || die "Migrations falharam. Deploy abortado."

# ─── 5.5. Seed de questões CLF/DVA ──────────────────────────────────────────
# Faz upsert das questões — idempotente, pode rodar múltiplas vezes sem dano.
# Só falha se não conseguir conectar ao banco.
log "Rodando seed de questões CLF/DVA..."
SEED_BINARY="/opt/ffv/bin/seed-clf-questions"
QUESTION_BANK="/opt/ffv/question-bank"

if [[ -f "$SEED_BINARY" ]]; then
  DATABASE_URL_INTERNAL=$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)
  NETWORK_NAME="ffv-prod_data"

  docker run --rm \
    --network "$NETWORK_NAME" \
    -e DATABASE_URL="$DATABASE_URL_INTERNAL" \
    -v "$SEED_BINARY:/usr/local/bin/seed-clf-questions:ro" \
    -v "$QUESTION_BANK:/question-bank:ro" \
    alpine:3.20 \
    /usr/local/bin/seed-clf-questions /question-bank \
    && log "Seed concluído." \
    || log "::warning::Seed falhou — banco pode estar com dados desatualizados."
else
  log "Binário de seed não encontrado em $SEED_BINARY — pulando. Rode manualmente."
fi

# ─── 6. Deploy da nova imagem da API (2 réplicas) ────────────────────────────
# --scale api=2: sobe 2 réplicas. Nginx faz round-robin entre elas.
# Se uma réplica travar, Nginx detecta via max_fails e roteia 100% para a outra.
log "Subindo nova versão da API com 2 réplicas (IMAGE_TAG=$IMAGE_TAG)..."
IMAGE_TAG="$IMAGE_TAG" docker compose -f "$COMPOSE_FILE" up -d --no-deps --pull never --scale api=2 api

# ─── 6.5. Deploy do frontend ─────────────────────────────────────────────────
if [[ -n "${FRONTEND_TAG:-}" ]]; then
  log "Subindo frontend (FRONTEND_TAG=$FRONTEND_TAG)..."
  FRONTEND_TAG="$FRONTEND_TAG" IMAGE_TAG="$IMAGE_TAG" \
    docker compose -f "$COMPOSE_FILE" up -d --no-deps --pull never frontend
fi

# ─── 7. Health check — aguarda ao menos 1 réplica saudável ──────────────────
log "Aguardando health check das réplicas (máx 120s)..."
for i in $(seq 1 12); do
  # Conta quantas réplicas da api estão healthy
  HEALTHY=$(docker compose -f "$COMPOSE_FILE" ps -q api 2>/dev/null \
    | xargs -I{} docker inspect --format='{{.State.Health.Status}}' {} 2>/dev/null \
    | grep -c "^healthy$" || true)

  if [[ "$HEALTHY" -ge 1 ]]; then
    log "$HEALTHY réplica(s) saudável(is). Atualizando nginx..."
    IMAGE_TAG="$IMAGE_TAG" docker compose -f "$COMPOSE_FILE" up -d --no-deps nginx
    docker image prune -f --filter "until=24h" > /dev/null 2>&1 || true

    # Health check do frontend (se foi deployado nesta execução)
    if [[ -n "${FRONTEND_TAG:-}" ]]; then
      log "Verificando saúde do frontend..."
      FRONTEND_HEALTHY=0
      for j in $(seq 1 6); do
        FE_STATUS=$(docker compose -f "$COMPOSE_FILE" ps -q frontend 2>/dev/null \
          | xargs -I{} docker inspect --format='{{.State.Health.Status}}' {} 2>/dev/null \
          | grep -c "^healthy$" || true)
        if [[ "$FE_STATUS" -ge 1 ]]; then
          FRONTEND_HEALTHY=1
          break
        fi
        log "Frontend ainda não saudável (tentativa $j/6). Aguardando 10s..."
        sleep 10
      done
      if [[ "$FRONTEND_HEALTHY" -eq 1 ]]; then
        log "Frontend saudável."
      else
        log "::warning::Frontend não respondeu ao health check — pode estar iniciando ainda."
      fi
    fi

    log "Deploy concluído. Réplicas ativas: $HEALTHY/2"
    exit 0
  fi
  log "Tentativa $i/12 — réplicas saudáveis: $HEALTHY/2. Aguardando 10s..."
  sleep 10
done

# ─── 8. Rollback automático ───────────────────────────────────────────────────
log "Health check falhou! Revertendo para $PREVIOUS_TAG..."
echo "$PREVIOUS_TAG" > "$DEPLOY_DIR/.current_tag"
IMAGE_TAG="$PREVIOUS_TAG" docker compose -f "$COMPOSE_FILE" up -d --no-deps --pull never --scale api=2 api

sleep 15
HEALTHY_AFTER=$(docker compose -f "$COMPOSE_FILE" ps -q api 2>/dev/null \
  | xargs -I{} docker inspect --format='{{.State.Health.Status}}' {} 2>/dev/null \
  | grep -c "^healthy$" || true)
log "Status após rollback: $HEALTHY_AFTER réplica(s) saudável(is)"

die "Deploy da imagem $IMAGE_TAG falhou. Rollback para $PREVIOUS_TAG executado."
