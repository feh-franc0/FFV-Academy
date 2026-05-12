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

# ─── 6. Deploy da nova imagem da API (2 réplicas) ────────────────────────────
# --scale api=2: sobe 2 réplicas. Nginx faz round-robin entre elas.
# Se uma réplica travar, Nginx detecta via max_fails e roteia 100% para a outra.
log "Subindo nova versão da API com 2 réplicas (IMAGE_TAG=$IMAGE_TAG)..."
IMAGE_TAG="$IMAGE_TAG" docker compose -f "$COMPOSE_FILE" up -d --no-deps --pull never --scale api=2 api

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
