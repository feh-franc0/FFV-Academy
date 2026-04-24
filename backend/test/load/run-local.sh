#!/usr/bin/env bash
# Roda a suite de load tests contra um backend local em :8080.
# Uso:
#   ./run-local.sh               # roda tudo
#   ./run-local.sh smoke         # roda só smoke
#   BASE_URL=http://host:9090 ./run-local.sh
#
# Requer: k6 instalado (brew install k6), backend rodando.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BASE_URL="${BASE_URL:-http://localhost:8080}"
STAMP="$(date +%Y-%m-%dT%H%M%S)"
REPORTS_DIR="$SCRIPT_DIR/reports"
mkdir -p "$REPORTS_DIR"

# --- pré-checks ---------------------------------------------------------------

if ! command -v k6 >/dev/null 2>&1; then
  echo "ERRO: k6 não encontrado. Instale com 'brew install k6' (macOS) ou veja README.md." >&2
  exit 1
fi

echo "==> Verificando backend em $BASE_URL ..."
if ! curl -sf --max-time 3 "$BASE_URL/healthz" >/dev/null; then
  echo "ERRO: backend não respondeu em $BASE_URL/healthz. Suba com 'make run' antes." >&2
  exit 1
fi
echo "    OK."

# --- helpers ------------------------------------------------------------------

run_one() {
  local name="$1"
  local script="${name}.js"
  local report="$REPORTS_DIR/${name}-${STAMP}.json"

  if [[ ! -f "$script" ]]; then
    echo "SKIP: $script não existe."
    return 0
  fi

  echo ""
  echo "==> $name"
  echo "    script : $script"
  echo "    report : $report"

  BASE_URL="$BASE_URL" k6 run \
    --out "json=$report" \
    "$script"
}

# --- execução -----------------------------------------------------------------

# Filtro opcional via $1 (ex: ./run-local.sh smoke).
FILTER="${1:-}"

# Smoke SEMPRE primeiro — aborta se falhar.
if [[ -z "$FILTER" || "$FILTER" == "smoke" ]]; then
  run_one "smoke"
  if [[ "$FILTER" == "smoke" ]]; then exit 0; fi
fi

SCENARIOS=(
  "simulados-list"
  "auth-request-token"
  "certificates-verify"
  "tutor-ask-capped"
  "progress-sync"
)

for s in "${SCENARIOS[@]}"; do
  if [[ -n "$FILTER" && "$FILTER" != "$s" ]]; then continue; fi

  # Scripts que precisam de JWT: avisa e pula se ausente.
  case "$s" in
    tutor-ask-capped|progress-sync)
      if [[ -z "${TEST_JWT:-}" ]]; then
        echo ""
        echo "==> SKIP $s: TEST_JWT não definido. Veja README.md seção 'Autenticação em testes'."
        continue
      fi
      ;;
  esac

  run_one "$s" || {
    echo "!! $s violou thresholds. Continuando com os próximos..."
  }
done

echo ""
echo "==> Concluído. Relatórios em: $REPORTS_DIR"
ls -1 "$REPORTS_DIR" | tail -n 10
