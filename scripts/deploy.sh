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
# postgres fica exposto em 127.0.0.1:5432; migrate CLI conecta pelo loopback do host.
log "Rodando migrations..."
DATABASE_URL=$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2- | sed 's/@postgres:/@localhost:/')
migrate -path "$MIGRATIONS_DIR" -database "$DATABASE_URL" up \
  || die "Migrations falharam. Deploy abortado."

# ─── 6. Deploy da nova imagem da API ─────────────────────────────────────────
log "Subindo nova versão da API (IMAGE_TAG=$IMAGE_TAG)..."
IMAGE_TAG="$IMAGE_TAG" docker compose -f "$COMPOSE_FILE" up -d --no-deps --pull never api

# ─── 7. Health check com timeout ─────────────────────────────────────────────
log "Aguardando health check (máx 120s)..."
CONTAINER_ID=$(docker compose -f "$COMPOSE_FILE" ps -q api 2>/dev/null | head -1)
[[ -z "$CONTAINER_ID" ]] && die "Container da API não encontrado após deploy."

for i in $(seq 1 12); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_ID" 2>/dev/null || echo "unknown")
  if [[ "$STATUS" == "healthy" ]]; then
    log "API saudável. Deploy concluído com sucesso!"
    # Garantir que o nginx aponta para a nova API
    IMAGE_TAG="$IMAGE_TAG" docker compose -f "$COMPOSE_FILE" up -d --no-deps nginx
    # Limpar imagens antigas (mantém as últimas 24h de cache)
    docker image prune -f --filter "until=24h" > /dev/null 2>&1 || true
    exit 0
  fi
  log "Tentativa $i/12 — status: $STATUS. Aguardando 10s..."
  sleep 10
done

# ─── 8. Rollback automático ───────────────────────────────────────────────────
log "Health check falhou! Revertendo para $PREVIOUS_TAG..."
echo "$PREVIOUS_TAG" > "$DEPLOY_DIR/.current_tag"
IMAGE_TAG="$PREVIOUS_TAG" docker compose -f "$COMPOSE_FILE" up -d --no-deps --pull never api

# Aguarda rollback ficar saudável também
sleep 15
ROLLBACK_STATUS=$(docker inspect --format='{{.State.Health.Status}}' \
  "$(docker compose -f "$COMPOSE_FILE" ps -q api | head -1)" 2>/dev/null || echo "unknown")
log "Status após rollback: $ROLLBACK_STATUS"

die "Deploy da imagem $IMAGE_TAG falhou. Rollback para $PREVIOUS_TAG executado."
