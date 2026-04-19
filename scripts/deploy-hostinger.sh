#!/usr/bin/env bash
# Deploy FFV Academy para Hostinger
# Converte output do Next.js export (out/) para estrutura Hostinger (hostinger/)
# Uso: npm run build && bash scripts/deploy-hostinger.sh

set -euo pipefail

rm -rf hostinger && mkdir -p hostinger
OUT="out"; DEST="hostinger"

# Assets estáticos
cp -r "$OUT/_next" "$DEST/"
cp "$OUT/favicon.ico" "$DEST/" 2>/dev/null || true
cp "$OUT/index.html" "$DEST/index.html"
cp "$OUT/404.html" "$DEST/404.html"

# Rotas de páginas (hub, trilha, utilitário)
for route in \
  ia aws engenharia progresso \
  fundamentos-da-ia ia-alem-do-llm ferramentas-ia-codigo \
  aws-cloud-practitioner aws-saa-c03 \
  devops-containers engenharia-software ai-native \
  sistemas-distribuidos observabilidade-sre \
  fundamentos-tecnicos \
  claude-anthropic claude-code-masterclass claude-api-agents \
  claude-code-pro \
  sql-databases como-computador-funciona redes-web \
  python-profundo \
  revisar glossario; do
  mkdir -p "$DEST/$route"
  cp "$OUT/$route.html" "$DEST/$route/index.html"
done

# Rotas de artigos (/aprenda/<slug>/) — pega todos automaticamente
# Novos módulos 2026 trilha 13: cheatsheet-pratico, paralelismo-na-pratica, multi-projeto-multi-contexto
# Novos módulos trilha 18 (harness engineering): harness-anatomia-do-agente,
# harness-system-prompt-output-styles, harness-permissions-em-producao,
# harness-skills-avancado-com-scripts, harness-hooks-cookbook-executivo,
# harness-plugins-para-times, harness-agent-sdk-em-producao
for f in "$OUT/aprenda/"*.html; do
  slug=$(basename "$f" .html)
  mkdir -p "$DEST/aprenda/$slug"
  cp "$f" "$DEST/aprenda/$slug/index.html"
done

# .htaccess para rewrite
cat > "$DEST/.htaccess" <<'EOF'
Options -Indexes

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  RewriteRule ^ index.html [L]
</IfModule>
EOF

# Gerar ZIP
rm -f ffv-academy-hostinger.zip
zip -r ffv-academy-hostinger.zip hostinger/ -x "*.DS_Store"

echo ""
echo "✅ ZIP gerado: ffv-academy-hostinger.zip"
echo "   Próximo passo: upload manual na Hostinger (File Manager → public_html)"
