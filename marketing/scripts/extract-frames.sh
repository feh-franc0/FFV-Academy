#!/bin/bash
#
# extract-frames.sh — Extrai frames-chave do video para analise visual
#
# Gera 1 frame por cena + frames de transicao para review pelos experts
# Output: out/review/frame-XXXX.png
#
# Uso: bash scripts/extract-frames.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MARKETING_DIR="$(dirname "$SCRIPT_DIR")"
REVIEW_DIR="$MARKETING_DIR/out/review"

mkdir -p "$REVIEW_DIR"

VIDEO="$MARKETING_DIR/out/promo.mp4"

if [ ! -f "$VIDEO" ]; then
  echo "❌ Video nao encontrado: $VIDEO"
  echo "   Rode primeiro: npm run video"
  exit 1
fi

echo ""
echo "🔍 Extraindo frames-chave para review..."
echo ""

# Frames-chave: 1 por cena + transicoes
# Cena 1 Hook:     0s-7s    → frame em 3s
# Cena 2 Problema: 7s-16s   → frame em 11s
# Transicao 2→3:            → frame em 16s
# Cena 3 Revelacao:16s-27s  → frame em 22s
# Cena 4A Hubs:    27s-32s  → frame em 29s
# Cena 4B Trilhas: 32s-37s  → frame em 34s
# Cena 4C Artigo:  37s-42s  → frame em 39s
# Cena 4D Quiz:    42s-47s  → frame em 44s
# Cena 4E Progress:47s-52s  → frame em 49s
# Cena 4F SRS:     52s-57s  → frame em 54s
# Cena 4G Theme:   57s-62s  → frame em 59s
# Cena 5 Prova:    62s-71s  → frame em 66s
# Cena 6 CTA:      71s-90s  → frame em 78s, 85s

FRAMES=(3 11 16 22 29 34 39 44 49 54 59 66 78 85)
NAMES=(
  "01-hook"
  "02-problema"
  "03-transicao-revelacao"
  "04-revelacao"
  "05-feat-hubs"
  "06-feat-trilhas"
  "07-feat-artigo"
  "08-feat-quiz"
  "09-feat-progresso"
  "10-feat-srs"
  "11-feat-theme"
  "12-prova-numeros"
  "13-cta-url"
  "14-cta-closer"
)

for i in "${!FRAMES[@]}"; do
  SEC=${FRAMES[$i]}
  NAME=${NAMES[$i]}
  echo "  📸 Frame ${SEC}s → ${NAME}.png"
  ffmpeg -ss "$SEC" -i "$VIDEO" -frames:v 1 -y "$REVIEW_DIR/${NAME}.png" 2>/dev/null
done

echo ""
TOTAL=$(ls -1 "$REVIEW_DIR"/*.png 2>/dev/null | wc -l | tr -d ' ')
echo "✅ $TOTAL frames extraidos em: out/review/"
echo ""
echo "Proximo passo: rode /marketing-producao review"
echo "para analise critica dos 5 experts sobre cada frame"
echo ""
