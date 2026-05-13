#!/usr/bin/env bash
# Smoke test pós-deploy: verifica que TODAS as páginas geradas no build
# respondem HTTP 200 em produção. Falha (exit 1) se qualquer página retornar
# != 200, com sumário dos problemas encontrados.
#
# Uso:
#   bash scripts/smoke-test-frontend.sh [BASE_URL]
#
# Variáveis de ambiente:
#   BASE_URL          (default: https://fernandofrancovalle.com)
#   OUT_DIR           (default: frontend/out)
#   SAMPLE_SIZE       (default: 0 = todas; >0 = sample aleatório)
#   PARALLEL          (default: 10)
#   TIMEOUT_SECONDS   (default: 10)

set -uo pipefail

BASE_URL="${1:-${BASE_URL:-https://fernandofrancovalle.com}}"
OUT_DIR="${OUT_DIR:-frontend/out}"
SAMPLE_SIZE="${SAMPLE_SIZE:-0}"
PARALLEL="${PARALLEL:-10}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-10}"

# Cores (desliga se TTY não suporta)
if [[ -t 1 ]]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
  BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; NC=''
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_PATH="$REPO_ROOT/$OUT_DIR"

if [[ ! -d "$OUT_PATH" ]]; then
  printf "%bERRO: diretório %s não existe.%b\n" "$RED" "$OUT_PATH" "$NC" >&2
  echo "Rode 'npm run build' no frontend antes." >&2
  exit 2
fi

# ─── Constrói lista de URLs a partir dos .html do build ──────────────────────
# Converte arquivo → URL:
#   out/index.html             → /
#   out/aprenda/X/index.html   → /aprenda/X/   (trailingSlash mode)
#   out/aprenda/X.html         → /aprenda/X/   (sem trailingSlash — Hostinger
#                                                redireciona pra com barra,
#                                                então testamos a forma final)

URLS_FILE=$(mktemp)
trap 'rm -f "$URLS_FILE"' EXIT

cd "$OUT_PATH"
find . -name "*.html" -type f -print0 | while IFS= read -r -d '' file; do
  path="${file#./}"
  path="${path%.html}"

  if [[ "$path" == "index" ]]; then
    echo "/"
  elif [[ "$path" == */index ]]; then
    echo "/${path%/index}/"
  else
    echo "/${path}/"
  fi
done | sort -u > "$URLS_FILE"

cd "$REPO_ROOT"

TOTAL_ALL=$(wc -l < "$URLS_FILE" | tr -d ' ')

# Sample aleatório se SAMPLE_SIZE > 0
if [[ "$SAMPLE_SIZE" -gt 0 ]] && [[ "$SAMPLE_SIZE" -lt "$TOTAL_ALL" ]]; then
  SAMPLED=$(mktemp)
  awk 'BEGIN { srand() } { print rand() "\t" $0 }' "$URLS_FILE" \
    | sort -k1,1n \
    | cut -f2- \
    | head -n "$SAMPLE_SIZE" > "$SAMPLED"
  mv "$SAMPLED" "$URLS_FILE"
fi

TOTAL=$(wc -l < "$URLS_FILE" | tr -d ' ')

printf "%b═══════════════════════════════════════════════%b\n" "$BOLD" "$NC"
printf "%b  Smoke test do frontend%b\n" "$BOLD" "$NC"
printf "%b═══════════════════════════════════════════════%b\n" "$BOLD" "$NC"
printf "Base URL:      %b%s%b\n" "$BLUE" "$BASE_URL" "$NC"
printf "Total URLs:    %b%s%b" "$BLUE" "$TOTAL" "$NC"
if [[ "$SAMPLE_SIZE" -gt 0 ]] && [[ "$TOTAL_ALL" != "$TOTAL" ]]; then
  printf " %b(sample de %s)%b" "$YELLOW" "$TOTAL_ALL" "$NC"
fi
echo ""
printf "Paralelismo:   %b%s%b\n" "$BLUE" "$PARALLEL" "$NC"
printf "Timeout:       %b%ss%b\n" "$BLUE" "$TIMEOUT_SECONDS" "$NC"
echo ""

# ─── Testa cada URL em paralelo ──────────────────────────────────────────────
# Saída: STATUS URL (separado por espaço) por linha
RESULTS_FILE=$(mktemp)
trap 'rm -f "$URLS_FILE" "$RESULTS_FILE"' EXIT

START=$(date +%s)

# Usa xargs com função inline (mais portátil que export -f)
xargs -P "$PARALLEL" -I {} bash -c '
  url="{}"
  status=$(curl -s -o /dev/null -w "%{http_code}" \
    --max-time '"$TIMEOUT_SECONDS"' \
    "'"$BASE_URL"'${url}" 2>/dev/null || echo "000")
  echo "$status $url"
' < "$URLS_FILE" > "$RESULTS_FILE"

END=$(date +%s)
DURATION=$((END - START))

# ─── Classifica resultados ───────────────────────────────────────────────────
OK=0
FAILED=0
REDIRECTS=0

while IFS=' ' read -r status url; do
  case "$status" in
    200)       OK=$((OK + 1)) ;;
    301|302|307|308) REDIRECTS=$((REDIRECTS + 1)); OK=$((OK + 1)) ;;
    *)         FAILED=$((FAILED + 1)) ;;
  esac
done < "$RESULTS_FILE"

# ─── Relatório ───────────────────────────────────────────────────────────────
echo ""
printf "%b═══════════════════════════════════════════════%b\n" "$BOLD" "$NC"
printf "%b  Resultado%b\n" "$BOLD" "$NC"
printf "%b═══════════════════════════════════════════════%b\n" "$BOLD" "$NC"
printf "Tempo total:   %b%ss%b\n" "$BLUE" "$DURATION" "$NC"
printf "%bOK (200/3xx):  %s / %s%b\n" "$GREEN" "$OK" "$TOTAL" "$NC"

if [[ "$REDIRECTS" -gt 0 ]]; then
  printf "%b  (sendo %s redirects 3xx)%b\n" "$YELLOW" "$REDIRECTS" "$NC"
fi

printf "%bFalhas:        %s%b\n" "$RED" "$FAILED" "$NC"

if [[ "$FAILED" -gt 0 ]]; then
  echo ""
  printf "%b%bURLs com problema:%b\n" "$RED" "$BOLD" "$NC"
  grep -vE '^(2[0-9]{2}|3[0-9]{2}) ' "$RESULTS_FILE" | head -50 | while read -r line; do
    printf "  %b✗%b %s\n" "$RED" "$NC" "$line"
  done

  FAIL_COUNT=$(grep -cvE '^(2[0-9]{2}|3[0-9]{2}) ' "$RESULTS_FILE" || true)
  if [[ "$FAIL_COUNT" -gt 50 ]]; then
    printf "  %b... e mais %s falhas%b\n" "$YELLOW" "$((FAIL_COUNT - 50))" "$NC"
  fi
  echo ""
  printf "%b%bSmoke test FALHOU.%b\n" "$RED" "$BOLD" "$NC"
  exit 1
fi

# Mostra redirects se forem poucos (debug)
if [[ "$REDIRECTS" -gt 0 ]] && [[ "$REDIRECTS" -le 10 ]]; then
  echo ""
  printf "%bRedirects (não-críticos):%b\n" "$YELLOW" "$NC"
  grep -E '^3[0-9]{2} ' "$RESULTS_FILE" | head -10 | while read -r line; do
    printf "  %b→%b %s\n" "$YELLOW" "$NC" "$line"
  done
fi

echo ""
printf "%b%b✓ Todas as %s páginas respondem corretamente.%b\n" "$GREEN" "$BOLD" "$TOTAL" "$NC"
exit 0
