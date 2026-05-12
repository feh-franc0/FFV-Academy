#!/usr/bin/env bash
# Instala git hooks locais que rodam antes de cada commit/push.
# Garante que código quebrado nunca chega no remote — bloqueia local primeiro.
#
# Uso (uma vez, após clone do repo):
#   bash scripts/install-git-hooks.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

if [[ ! -d "$HOOKS_DIR" ]]; then
  echo "ERRO: .git/hooks não encontrado. Está no repo correto?" >&2
  exit 1
fi

echo "Instalando pre-push hook..."

cat > "$HOOKS_DIR/pre-push" <<'EOF'
#!/usr/bin/env bash
# Hook automático — roda scripts/pre-push-validate.sh antes do push.
# Para pular (emergência): git push --no-verify
set -euo pipefail

REPO_ROOT="$(cd "$(git rev-parse --show-toplevel)" && pwd)"
exec "$REPO_ROOT/scripts/pre-push-validate.sh" all
EOF

chmod +x "$HOOKS_DIR/pre-push"
echo "✓ pre-push hook instalado em $HOOKS_DIR/pre-push"

echo ""
echo "Hooks ativos:"
ls -1 "$HOOKS_DIR" | grep -v sample | head -10

echo ""
echo "Para validar sem push: bash scripts/pre-push-validate.sh"
echo "Para pular hook em emergência: git push --no-verify"
