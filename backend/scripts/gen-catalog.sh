#!/usr/bin/env bash
# gen-catalog.sh — extrai o catálogo de simulados do frontend TypeScript
# e converte para JSON consumido pelo backend via //go:embed
set -euo pipefail

FRONTEND_DIR="${FRONTEND_DIR:-/Users/fernandofranco/Developer/fernandofrancovalledotcom}"
OUTPUT="$(dirname "$0")/../internal/infrastructure/catalog/catalog.json"

CATALOG_FILE=$(find "$FRONTEND_DIR" -name "catalog.ts" -o -name "simulados.ts" 2>/dev/null | head -1)

if [ -z "$CATALOG_FILE" ]; then
  echo "⚠ Arquivo de catálogo não encontrado em $FRONTEND_DIR"
  echo "  Mantendo catalog.json existente."
  exit 0
fi

echo "▶ Extraindo catálogo de: $CATALOG_FILE"

# Usa node para extrair o JSON do arquivo TypeScript
node - "$CATALOG_FILE" "$OUTPUT" <<'EOF'
const fs = require('fs');
const [,, srcFile, outFile] = process.argv;

// Lê o TypeScript, extrai array de objetos
const src = fs.readFileSync(srcFile, 'utf8');

// Regex simplista para extrair o array exportado (funciona para o frontend atual)
const match = src.match(/export\s+(?:const|default)\s+\w+\s*[=:]\s*(\[[\s\S]*\])/m);
if (!match) {
  console.error('Não foi possível extrair o catálogo do arquivo TypeScript.');
  process.exit(1);
}

// eval controlado em ambiente de build
const catalog = eval(match[1]);
fs.writeFileSync(outFile, JSON.stringify(catalog, null, 2));
console.log(`✓ Catálogo gerado com ${catalog.length} simulados em: ${outFile}`);
EOF

echo "✓ Catálogo atualizado: $OUTPUT"
