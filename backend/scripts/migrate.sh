#!/usr/bin/env bash
# migrate.sh — aplica as migrations com golang-migrate
set -euo pipefail

DIRECTION=${1:-up}
DATABASE_URL=${DATABASE_URL:?"DATABASE_URL obrigatório"}
MIGRATIONS_DIR="$(dirname "$0")/../migrations"

echo "▶ Executando migrations ($DIRECTION) em: $DATABASE_URL"
migrate -path "$MIGRATIONS_DIR" -database "$DATABASE_URL" "$DIRECTION"
echo "✓ Migrations concluídas"
