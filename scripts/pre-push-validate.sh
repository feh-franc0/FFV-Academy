#!/usr/bin/env bash
# Validação pré-push — roda os mesmos checks que o CI faz.
# Se algum falhar, aborte o push e corrija antes de continuar.
#
# Uso:
#   bash scripts/pre-push-validate.sh          # roda tudo
#   bash scripts/pre-push-validate.sh backend  # só backend
#   bash scripts/pre-push-validate.sh frontend # só frontend
#   bash scripts/pre-push-validate.sh quick    # só checks rápidos (gofmt + build + lint frontend)
#
# Instalação como git hook (opcional):
#   ln -sf ../../scripts/pre-push-validate.sh .git/hooks/pre-push
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${1:-all}"

# Cores para output legível
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Contadores
TOTAL=0
PASSED=0
FAILED=0
FAILED_STEPS=()

step() {
  local name="$1"
  shift
  TOTAL=$((TOTAL + 1))
  echo -e "\n${BLUE}━━━ ${BOLD}$name${NC}${BLUE} ━━━${NC}"
  local start=$(date +%s)
  if "$@"; then
    local end=$(date +%s)
    local dur=$((end - start))
    echo -e "${GREEN}✓ $name passou${NC} (${dur}s)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗ $name falhou${NC}"
    FAILED=$((FAILED + 1))
    FAILED_STEPS+=("$name")
  fi
}

# ─── Backend (Go) ────────────────────────────────────────────────────────────

check_gofmt() {
  cd "$REPO_ROOT/backend"
  local unformatted
  unformatted=$(gofmt -l .)
  if [[ -n "$unformatted" ]]; then
    echo -e "${YELLOW}Arquivos não formatados:${NC}"
    echo "$unformatted"
    echo ""
    echo -e "${YELLOW}Auto-fix:${NC} gofmt -w ."
    return 1
  fi
}

check_govet() {
  cd "$REPO_ROOT/backend"
  go vet ./...
}

check_build_go() {
  cd "$REPO_ROOT/backend"
  go build ./...
}

check_test_unit() {
  cd "$REPO_ROOT/backend"
  go test ./internal/domain/... ./internal/application/... -timeout 60s
}

check_test_contract() {
  cd "$REPO_ROOT/backend"
  if [[ -d test/contract ]]; then
    go test ./test/contract/... -timeout 60s
  else
    echo "Sem testes de contrato — pulando."
  fi
}

# ─── Frontend (Next.js) ───────────────────────────────────────────────────────

check_lint_fe() {
  cd "$REPO_ROOT/frontend"
  npm run lint --silent
}

check_typecheck_fe() {
  cd "$REPO_ROOT/frontend"
  npx tsc --noEmit
}

check_test_fe() {
  cd "$REPO_ROOT/frontend"
  npm test --silent -- --run
}

check_build_fe() {
  cd "$REPO_ROOT/frontend"
  npm run build --silent
}

# ─── Validações específicas do projeto ───────────────────────────────────────

check_no_secrets() {
  cd "$REPO_ROOT"

  # Padrões de secrets reais (não confundir com hashes/IDs):
  #   sk_live_XXX (Stripe live key)
  #   whsec_XXX  (Stripe webhook secret real, não placeholder)
  #   re_XXX     (Resend API key real)
  #   xoxb-XXX   (Slack bot token)
  #   ghp_XXX    (GitHub personal access token)
  #   BEGIN PRIVATE KEY (chave SSH/TLS)
  local secret_patterns=(
    'sk_live_[a-zA-Z0-9]{20,}'
    'whsec_[a-zA-Z0-9]{30,}'
    're_[a-zA-Z0-9]{20,}_[a-zA-Z0-9]{20,}'
    'xoxb-[0-9]+-[0-9]+-[a-zA-Z0-9]+'
    'ghp_[a-zA-Z0-9]{36}'
    'BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY'
    'AKIA[0-9A-Z]{16}'  # AWS Access Key
  )

  # Arquivos a verificar: staged ou modificados.
  local files
  files=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null)
  if [[ -z "$files" ]]; then
    files=$(git ls-files -m -o --exclude-standard 2>/dev/null)
  fi

  if [[ -z "$files" ]]; then
    echo "Nenhum arquivo modificado."
    return 0
  fi

  local found=0
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    [[ ! -f "$file" ]] && continue
    # Skip binários e diretórios padrão
    [[ "$file" == *.lock ]] && continue
    [[ "$file" == *node_modules* ]] && continue
    [[ "$file" == *.git/* ]] && continue
    [[ "$file" == frontend/out/* ]] && continue
    [[ "$file" == backend/bin/* ]] && continue
    # Skip o próprio script de validação (contém regexes como strings)
    [[ "$file" == scripts/pre-push-validate.sh ]] && continue
    # Skip locks e arquivos gerados
    [[ "$file" == *.snap ]] && continue
    [[ "$file" == *.go.sum ]] && continue

    for pattern in "${secret_patterns[@]}"; do
      local matches
      matches=$(grep -EH "$pattern" "$file" 2>/dev/null | grep -v "example\|placeholder\|PLACEHOLDER\|<.*>\|xxxxxxxx" | head -2 || true)
      if [[ -n "$matches" ]]; then
        echo -e "${RED}⚠ Possível secret real em $file:${NC}"
        echo "$matches"
        found=$((found + 1))
      fi
    done
  done <<< "$files"

  if [[ $found -gt 0 ]]; then
    echo -e "${RED}Possíveis secrets detectados. Revise antes de commitar.${NC}"
    return 1
  fi
  echo "✓ Nenhum padrão de secret detectado."
}

check_no_env_file() {
  cd "$REPO_ROOT"
  local env_files
  env_files=$(git diff --cached --name-only 2>/dev/null | grep -E "(^|/)\.env$|(^|/)\.env\.[^l]" || true)
  if [[ -n "$env_files" ]]; then
    echo -e "${RED}Arquivos .env (não-example) no staging:${NC}"
    echo "$env_files"
    echo -e "${YELLOW}Remova com: git rm --cached <arquivo>${NC}"
    return 1
  fi
}

# ─── Execução ────────────────────────────────────────────────────────────────

echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Validação pré-push — FFV Academy${NC}"
echo -e "${BOLD}  Modo: $MODE${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════${NC}"

case "$MODE" in
  all|backend)
    step "Go: gofmt"          check_gofmt
    step "Go: go vet"         check_govet
    step "Go: build"          check_build_go
    step "Go: testes unit"    check_test_unit
    step "Go: testes contract" check_test_contract
    ;;
esac

case "$MODE" in
  all|frontend)
    step "Frontend: lint"     check_lint_fe
    step "Frontend: tsc"      check_typecheck_fe
    step "Frontend: testes"   check_test_fe
    [[ "$MODE" == "all" ]] && step "Frontend: build" check_build_fe
    ;;
esac

case "$MODE" in
  all|quick)
    step "Segurança: sem secrets vazados" check_no_secrets
    step "Segurança: sem .env no commit"  check_no_env_file
    ;;
esac

if [[ "$MODE" == "quick" ]]; then
  step "Go: gofmt"          check_gofmt
  step "Go: build"          check_build_go
  step "Frontend: lint"     check_lint_fe
fi

# ─── Relatório final ─────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Resultado${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
echo -e "Total:    $TOTAL"
echo -e "${GREEN}Passou:   $PASSED${NC}"
echo -e "${RED}Falhou:   $FAILED${NC}"

if [[ $FAILED -gt 0 ]]; then
  echo ""
  echo -e "${RED}${BOLD}Steps que falharam:${NC}"
  for s in "${FAILED_STEPS[@]}"; do
    echo -e "  ${RED}✗${NC} $s"
  done
  echo ""
  echo -e "${RED}${BOLD}Push abortado. Corrija e tente de novo.${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}${BOLD}✓ Tudo passou! Seguro para fazer push.${NC}"
exit 0
