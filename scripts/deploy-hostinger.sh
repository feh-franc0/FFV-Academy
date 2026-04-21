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
  revisar glossario news \
  claude-code-vs-cursor melhores-ferramentas-ia-codigo-2026 cheatsheet \
  playlists \
  simulados preferencias verificar \
  fundamentos programacao typescript-profissional api-design \
  ds-algoritmos security-engineering aws-developer-associate python-engenheiros \
  testing-engineering acessibilidade postgres-internals \
  dados data-engineering fine-tuning llm-evals \
  construcao \
  aws-sap-c03 finops multimodal ai-safety frontend-moderno tech-leadership dx-productivity \
  mobile-rn edge-computing search lib-authoring \
  c-programming cpp-moderno csharp-dotnet java-moderno go-profissional rust-profissional linguagens-comparadas \
  machine-learning mlops system-design-interview technical-writing nosql-vector-dbs \
  computer-vision ios-native android-native graphql platform-engineering \
  performance-engineering cryptography-applied kafka-streaming real-time-systems \
  product-engineering career-engineering chaos-engineering \
  cheatsheets \
  mapa roadmaps; do
  mkdir -p "$DEST/$route"
  cp "$OUT/$route.html" "$DEST/$route/index.html"
done

# Simulados dinâmicos: /simulados/<slug>/, /simulados/<slug>/fazer/, /simulados/<slug>/resultado/
for f in "$OUT/simulados/"*.html; do
  [ -e "$f" ] || continue
  slug=$(basename "$f" .html)
  [ "$slug" = "simulados" ] && continue   # já copiado como /simulados/index.html
  mkdir -p "$DEST/simulados/$slug"
  cp "$f" "$DEST/simulados/$slug/index.html"
done
for sub in fazer resultado; do
  for f in "$OUT/simulados/"*/"$sub.html"; do
    [ -e "$f" ] || continue
    dir=$(dirname "$f")
    slug=$(basename "$dir")
    mkdir -p "$DEST/simulados/$slug/$sub"
    cp "$f" "$DEST/simulados/$slug/$sub/index.html"
  done
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

# Cheatsheets subpages: /cheatsheets/<slug>/
for f in "$OUT/cheatsheets/"*.html; do
  [ -e "$f" ] || continue
  slug=$(basename "$f" .html)
  [ "$slug" = "cheatsheets" ] && continue
  mkdir -p "$DEST/cheatsheets/$slug"
  cp "$f" "$DEST/cheatsheets/$slug/index.html"
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
