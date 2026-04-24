#!/bin/bash
# export-png.sh — Exporta .drawio para PNG via drawio CLI
#
# Uso:
#   bash scripts/drawio/export-png.sh docs/architecture/completo-todas-fases.drawio
#   bash scripts/drawio/export-png.sh <input.drawio> [output.png] [scale]
#
# Defaults:
#   output: <input>.png (mesmo diretório, extensão .png)
#   scale:  2 (alta resolução para leitura vision)

set -euo pipefail

DRAWIO_BIN="/Applications/draw.io.app/Contents/MacOS/draw.io"

if [ ! -x "$DRAWIO_BIN" ]; then
  echo "ERRO: drawio CLI não encontrado em $DRAWIO_BIN" >&2
  echo "Instale o draw.io Desktop: https://github.com/jgraph/drawio-desktop/releases" >&2
  exit 1
fi

if [ $# -lt 1 ]; then
  echo "Uso: $0 <input.drawio> [output.png] [scale=2]" >&2
  exit 1
fi

INPUT="$1"
OUTPUT="${2:-${INPUT%.drawio}.png}"
SCALE="${3:-2}"

if [ ! -f "$INPUT" ]; then
  echo "ERRO: arquivo não encontrado: $INPUT" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT")"

"$DRAWIO_BIN" \
  --export \
  --format png \
  --scale "$SCALE" \
  --border 20 \
  --output "$OUTPUT" \
  "$INPUT" > /dev/null 2>&1

if [ ! -f "$OUTPUT" ]; then
  echo "ERRO: export PNG falhou" >&2
  exit 1
fi

SIZE=$(stat -f%z "$OUTPUT" 2>/dev/null || stat -c%s "$OUTPUT")
echo "$OUTPUT ($(($SIZE / 1024))KB)"
